import { Component, inject, signal, computed, effect, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ClientCatalogService } from '../../services/client-catalog.service';
import { AdminService } from '../../../admin/admin.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CreateAlquilerRequest } from '../../../../shared/models/rental/rental.model';
import { Sucursal } from '../../../../shared/models/admin/branch.model';
import { Vehiculo } from '../../../../shared/models/vehicle/vehicle.model';
import {
  format12hDateTime,
  formatCountdown,
  getPeruvianNow,
} from '../../../../shared/utils/date-utils';
import * as L from 'leaflet';

import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesComponent implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(ClientCatalogService);
  private admin = inject(AdminService);
  readonly auth = inject(AuthService);
  private notifications = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  sucursalId = signal<string>('');
  vehiculos = signal<Vehiculo[]>([]);
  sucursal = signal<Sucursal | null>(null);
  loading = signal<boolean>(true);
  loadingSucursal = signal<boolean>(true);
  error = signal<string>('');

  private now = signal(Date.now());
  private timerRef: ReturnType<typeof setInterval> | null = null;
  reservando = signal<Vehiculo | null>(null);
  fechaInicio = signal('');
  fechaFin = signal('');
  enviando = signal(false);

  pickupCountdown = computed(() => {
    this.now();
    const pickup = getPeruvianNow().getTime() + 60 * 60 * 1000;
    const diff = pickup - Date.now();
    if (diff <= 0) return '00:00:00';
    return formatCountdown(diff);
  });

  // Servicios adicionales catalog
  serviciosCatalogo = signal<any[]>([]);
  serviciosSeleccionados = signal<{ id: string; cantidad: number }[]>([]);

  private map: L.Map | null = null;
  showMap = signal<boolean>(true);
  mapType = signal<'satellite' | 'street'>('satellite');

  private hideNav = effect(() => {
    if (this.reservando()) {
      document.body.classList.add('modal-rental-open');
    } else {
      document.body.classList.remove('modal-rental-open');
    }
  });

  ngOnInit() {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
    ).subscribe(params => {
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
    this.timerRef = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerRef) clearInterval(this.timerRef);
    document.body.classList.remove('modal-rental-open');
  }

  loadServicios() {
    this.catalogService.getServiciosAdicionales().pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: (res) => {
        const list = res || [];
        this.serviciosCatalogo.set(list.filter((s: any) => s.esta_activo !== false));
      },
      error: () => {}
    });
  }

  ngAfterViewInit() {}

  loadSucursal(sucursalId: string) {
    this.loadingSucursal.set(true);
    this.catalogService.getSucursal(sucursalId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingSucursal.set(false)),
    ).subscribe({
      next: (res) => {
        this.sucursal.set(res || null);
        setTimeout(() => this.initMap(), 100);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadVehiculos(sucursalId: string) {
    this.loading.set(true);
    this.catalogService.getVehiculosBySucursal(sucursalId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (res) => {
        this.vehiculos.set(res.data || []);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar los vehículos. Inténtalo más tarde.');
      }
    });
  }

  get puedeAlquilar(): boolean {
    return true;
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
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return { dias: 0, tarifaDiaria: 0, base: 0, serviciosTotal: 0, impuestos: 0, total: 0, deposito: 0 };
    }
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

  pickupTimeLabel = computed(() => {
    const ahora = getPeruvianNow();
    const pickup = new Date(ahora.getTime() + 60 * 60 * 1000);
    return format12hDateTime(pickup);
  });

  returnTimeLabel = computed(() => {
    if (!this.fechaInicio() || !this.fechaFin()) return '';
    const inicio = new Date(this.fechaInicio());
    const fin = new Date(this.fechaFin());
    const dias = Math.max(1, Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
    const ahora = getPeruvianNow();
    const retorno = new Date(ahora.getTime() + 60 * 60 * 1000 + dias * 24 * 60 * 60 * 1000);
    return format12hDateTime(retorno);
  });

  minFechaFin = computed(() => {
    if (!this.fechaInicio()) return this.minDate();
    const d = new Date(this.fechaInicio());
    d.setDate(d.getDate() + 1);
    return this.toDateInputValue(d);
  });

  errorFecha = computed(() => {
    if (!this.fechaInicio() || !this.fechaFin()) return '';
    const inicio = new Date(this.fechaInicio());
    const fin = new Date(this.fechaFin());
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return '';
    const diffMs = fin.getTime() - inicio.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) return 'El alquiler mínimo es de 24 horas (1 día completo)';
    if (diffMs > 30 * 24 * 60 * 60 * 1000) return 'El alquiler máximo es de 30 días';
    return '';
  });

  private toPeruvianDateOnly(d: Date): string {
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  }

  onFechaInicioChange(value: string): void {
    this.fechaInicio.set(value);
    if (this.fechaFin() && this.fechaFin() <= value) {
      const d = new Date(value);
      d.setDate(d.getDate() + 1);
      this.fechaFin.set(this.toDateInputValue(d));
    }
  }

  onFechaFinChange(value: string): void {
    if (this.fechaInicio() && value <= this.fechaInicio()) {
      const d = new Date(this.fechaInicio());
      d.setDate(d.getDate() + 1);
      this.fechaFin.set(this.toDateInputValue(d));
      return;
    }
    this.fechaFin.set(value);
  }

  async submitReserva(): Promise<void> {
    const vehiculo = this.reservando();
    if (!vehiculo || !this.fechaInicio() || !this.fechaFin()) return;

    this.enviando.set(true);
    if (this.errorFecha()) {
      this.notifications.error(this.errorFecha()!);
      this.enviando.set(false);
      return;
    }
    const calcs = this.getCalculos();
    const dto: CreateAlquilerRequest = {
      vehiculo_id: vehiculo.id,
      sucursal_recojo_id: this.sucursalId(),
      sucursal_devolucion_id: this.sucursalId(),
      fecha_fin_programada: this.toPeruvianDateOnly(new Date(this.fechaFin())),
      servicios_adicionales: this.serviciosSeleccionados().map((s) => ({
        servicio_adicional_id: s.id,
        cantidad: s.cantidad,
      })),
      metodo_pago: 'TARJETA_CREDITO',
    };

    this.admin.createRental(dto).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
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
    
    const lat = sucursal.latitud;
    const lng = sucursal.longitud;
    
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