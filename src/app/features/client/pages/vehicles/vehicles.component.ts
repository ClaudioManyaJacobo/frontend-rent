import { Component, inject, signal, effect, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ClientCatalogService } from '../../services/client-catalog.service';
import { ClientService } from '../../client.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CreateReservaRequest } from '../../../../shared/models/rental/rental.model';
import { Sucursal } from '../../../../shared/models/admin/branch.model';
import { Vehiculo } from '../../../../shared/models/vehicle/vehicle.model';
import { ServicioAdicional } from '../../../../shared/models/rental/rental.model';
import { ReservaModalComponent } from '../../../../shared/components/reserva-modal/reserva-modal.component';
import { VehicleDetailModalComponent } from '../../../../shared/components/vehicle-detail-modal/vehicle-detail-modal.component';
import * as L from 'leaflet';

import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [RouterModule, ReservaModalComponent, VehicleDetailModalComponent],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(ClientCatalogService);
  private clientService = inject(ClientService);
  readonly auth = inject(AuthService);
  private notifications = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  sucursalId = signal<string>('');
  vehiculos = signal<Vehiculo[]>([]);
  sucursal = signal<Sucursal | null>(null);
  sucursales = signal<Sucursal[]>([]);
  sucursalDevolucionId = signal<string>('');
  loading = signal<boolean>(true);
  loadingSucursal = signal<boolean>(true);
  error = signal<string>('');

  reservando = signal<Vehiculo | null>(null);
  enviando = signal(false);
  detallesVehiculo = signal<Vehiculo | null>(null);

  serviciosCatalogo = signal<ServicioAdicional[]>([]);

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  loadSucursal(sucursalId: string) {
    this.loadingSucursal.set(true);
    this.catalogService.getSucursal(sucursalId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loadingSucursal.set(false)),
    ).subscribe({
      next: (res) => {
        this.sucursal.set(res || null);
        this.sucursalDevolucionId.set(sucursalId);
        setTimeout(() => this.initMap(), 100);

        const empresaId = res?.empresa_id || res?.empresa?.id;
        if (empresaId) {
          this.catalogService.getSucursalesByEmpresa(empresaId).pipe(
            takeUntil(this.destroy$),
          ).subscribe({
            next: (sucResp) => {
              this.sucursales.set(sucResp.data || []);
            },
            error: () => {},
          });
        }
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

  abrirReserva(vehiculo: Vehiculo): void {
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
    this.reservando.set(vehiculo);
  }

  abrirDetalles(v: Vehiculo): void {
    this.detallesVehiculo.set(v);
  }

  cerrarDetalles(): void {
    this.detallesVehiculo.set(null);
  }

  cerrarReserva(): void {
    this.reservando.set(null);
    this.enviando.set(false);
  }

  onReservaConfirm(dto: CreateReservaRequest): void {
    this.enviando.set(true);

    this.clientService.createReservation(dto).pipe(
      finalize(() => this.enviando.set(false)),
    ).subscribe({
      next: () => {
        this.notifications.success('Reserva creada con éxito.');
        this.cerrarReserva();
        this.router.navigate(['/cliente/mis-alquileres']);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Error al crear la reserva';
        this.notifications.error(msg);
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
    
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: true,
      fadeAnimation: true,
      zoomAnimation: true,
      attributionControl: true,
    });
    this.setMapLayer();
    
    const marker = L.marker([lat, lng], { icon: redPinIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="padding: 4px 2px;">
          <strong>${sucursal.nombre}</strong>
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
