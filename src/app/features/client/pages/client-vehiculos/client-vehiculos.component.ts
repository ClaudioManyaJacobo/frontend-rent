import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientCatalogService } from '../../services/client-catalog.service';
import { AlquileresService } from '../../../alquileres/services/alquileres.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CreateAlquilerRequest } from '../../../../shared/models/alquiler.model';
import * as L from 'leaflet';

import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-client-vehiculos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './client-vehiculos.component.html',
  styleUrls: ['./client-vehiculos.component.scss']
})
export class ClientVehiculosComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(ClientCatalogService);
  private alquileresService = inject(AlquileresService);
  readonly auth = inject(AuthService);
  private notifications = inject(NotificationService);

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  sucursalId = signal<string>('');
  vehiculos = signal<any[]>([]);
  sucursal = signal<any>(null);
  loading = signal<boolean>(true);
  loadingSucursal = signal<boolean>(true);
  error = signal<string>('');

  reservando = signal<any | null>(null);
  fechaInicio = signal('');
  fechaFin = signal('');
  enviando = signal(false);

  // Servicios adicionales catalog
  serviciosCatalogo = signal<any[]>([]);
  serviciosSeleccionados = signal<{ id: string; cantidad: number }[]>([]);

  private map: L.Map | null = null;
  showMap = signal<boolean>(true);
  mapType = signal<'satellite' | 'street'>('satellite');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('sucursalId');
      if (id) {
        this.sucursalId.set(id);
        this.loadSucursal(id);
        this.loadVehiculos(id);
        this.loadServicios();
      } else {
        this.router.navigate(['/cliente/empresas']);
      }
    });
  }

  loadServicios() {
    this.catalogService.getServiciosAdicionales().subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        this.serviciosCatalogo.set(list.filter((s: any) => s.esta_activo !== false));
      },
      error: () => {}
    });
  }

  ngAfterViewInit() {}

  loadSucursal(sucursalId: string) {
    this.loadingSucursal.set(true);
    this.catalogService.getSucursal(sucursalId).subscribe({
      next: (res) => {
        this.sucursal.set(res.data || null);
        this.loadingSucursal.set(false);
        setTimeout(() => this.initMap(), 100);
      },
      error: (err) => {
        console.error(err);
        this.loadingSucursal.set(false);
      }
    });
  }

  loadVehiculos(sucursalId: string) {
    this.loading.set(true);
    this.catalogService.getVehiculosBySucursal(sucursalId).subscribe({
      next: (res) => {
        this.vehiculos.set(res.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar los vehículos. Inténtalo más tarde.');
        this.loading.set(false);
      }
    });
  }

  get puedeAlquilar(): boolean {
    return this.auth.currentUser()?.perfil?.puede_alquilar !== false;
  }

  abrirReserva(vehiculo: any): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    if (!this.puedeAlquilar) {
      this.notifications.error('Tu perfil no está habilitado para realizar reservas. Contacta con atención al cliente.');
      return;
    }
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    this.fechaInicio.set(this.toDateInputValue(manana));
    const fin = new Date(manana);
    fin.setDate(fin.getDate() + 1);
    this.fechaFin.set(this.toDateInputValue(fin));
    this.serviciosSeleccionados.set([]);
    this.reservando.set(vehiculo);
  }

  toggleServicio(servicioId: string, checked: boolean): void {
    if (checked) {
      this.serviciosSeleccionados.update((list) => [...list, { id: servicioId, cantidad: 1 }]);
    } else {
      this.serviciosSeleccionados.update((list) => list.filter((s) => s.id !== servicioId));
    }
  }

  isServicioSelected(servicioId: string): boolean {
    return this.serviciosSeleccionados().some((s) => s.id === servicioId);
  }

  getCalculos() {
    const vehiculo = this.reservando();
    if (!vehiculo || !this.fechaInicio() || !this.fechaFin()) {
      return { dias: 0, tarifaDiaria: 0, base: 0, serviciosTotal: 0, impuestos: 0, total: 0, deposito: 0 };
    }
    const inicio = new Date(this.fechaInicio());
    const fin = new Date(this.fechaFin());
    const diffMs = fin.getTime() - inicio.getTime();
    const dias = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const tarifaDiaria = Number(vehiculo.precio_diario_personalizado || vehiculo.categoria?.precio_diario_base || 0);
    const base = tarifaDiaria * dias;

    let serviciosTotal = 0;
    for (const sel of this.serviciosSeleccionados()) {
      const sv = this.serviciosCatalogo().find((s: any) => s.id === sel.id);
      if (sv) {
        serviciosTotal += sv.tipo_cobro === 'DIARIO' ? Number(sv.precio) * dias : Number(sv.precio);
      }
    }
    const impuestos = (base + serviciosTotal) * 0.18;
    const total = base + serviciosTotal + impuestos;
    const deposito = total * 0.3;
    return { dias, tarifaDiaria, base, serviciosTotal, impuestos, total, deposito };
  }

  cerrarReserva(): void {
    this.reservando.set(null);
    this.enviando.set(false);
  }

  toDateInputValue(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  minDate(): string {
    return this.toDateInputValue(new Date());
  }

  async submitReserva(): Promise<void> {
    const vehiculo = this.reservando();
    if (!vehiculo || !this.fechaInicio() || !this.fechaFin()) return;

    this.enviando.set(true);
    const calcs = this.getCalculos();
    const dto: CreateAlquilerRequest = {
      vehiculo_id: vehiculo.id,
      sucursal_recojo_id: this.sucursalId(),
      sucursal_devolucion_id: this.sucursalId(),
      fecha_inicio_programada: this.fechaInicio(),
      fecha_fin_programada: this.fechaFin(),
      servicios_adicionales: this.serviciosSeleccionados().map((s) => ({
        servicio_adicional_id: s.id,
        cantidad: s.cantidad,
      })),
      metodo_pago: 'TARJETA_CREDITO',
    };

    this.alquileresService.create(dto).subscribe({
      next: () => {
        this.notifications.success('Reserva creada con éxito.');
        this.cerrarReserva();
        this.router.navigate(['/cliente/mis-alquileres']);
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.message ||
          'Error al crear la reserva';
        this.notifications.error(msg);
        this.enviando.set(false);
      },
    });
  }

  initMap() {
    const sucursal = this.sucursal();
    if (!sucursal || !this.mapContainer) return;
    
    const lat = parseFloat(sucursal.latitud);
    const lng = parseFloat(sucursal.longitud);
    
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn('Coordenadas no válidas para el mapa');
      this.showMap.set(false);
      return;
    }
    
    if (this.map) {
      this.map.remove();
    }
    
    // Icono tipo gota roja como Google Maps
    const redPinIcon = L.divIcon({
      className: 'red-pin-marker',
      html: `<div class="pin-container">
               <svg class="red-pin" width="32" height="42" viewBox="0 0 24 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 23 12 23s12-14 12-23c0-6.63-5.37-12-12-12z" fill="#EA4335"/>
                 <circle cx="12" cy="11" r="4" fill="white"/>
               </svg>
               <div class="pin-shadow"></div>
             </div>`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42]
    });
    
    this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 17);
    this.setMapLayer();
    
    const marker = L.marker([lat, lng], { icon: redPinIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="padding: 8px 4px;">
          <strong style="color: #0c1929;">${sucursal.nombre}</strong><br>
        </div>
      `)
      .openPopup();
    
    this.showMap.set(true);
  }

  setMapLayer() {
    if (!this.map) return;
    
    this.map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        this.map?.removeLayer(layer);
      }
    });
    
    let tileLayer: L.TileLayer;
    
    if (this.mapType() === 'satellite') {
      tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      });
    } else {
      tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 3
      });
    }
    
    tileLayer.addTo(this.map);
  }

  toggleMapType() {
    const newType = this.mapType() === 'satellite' ? 'street' : 'satellite';
    this.mapType.set(newType);
    this.setMapLayer();
  }

  openInGoogleMaps() {
    const sucursal = this.sucursal();
    if (sucursal?.latitud && sucursal?.longitud) {
      const url = `https://www.google.com/maps/search/?api=1&query=${sucursal.latitud},${sucursal.longitud}`;
      window.open(url, '_blank');
    }
  }

  getMapUrl(): string {
    const sucursal = this.sucursal();
    if (sucursal?.latitud && sucursal?.longitud) {
      return `https://www.google.com/maps/search/?api=1&query=${sucursal.latitud},${sucursal.longitud}`;
    }
    const address = `${sucursal?.direccion}, ${sucursal?.ciudad}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
}