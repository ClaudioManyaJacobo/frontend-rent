import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClientCatalogService } from '../../services/client-catalog.service';
import * as L from 'leaflet';

import 'leaflet/dist/leaflet.css';

@Component({
  selector: 'app-client-vehiculos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-vehiculos.component.html',
  styleUrls: ['./client-vehiculos.component.scss']
})
export class ClientVehiculosComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(ClientCatalogService);

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  sucursalId = signal<string>('');
  vehiculos = signal<any[]>([]);
  sucursal = signal<any>(null);
  loading = signal<boolean>(true);
  loadingSucursal = signal<boolean>(true);
  error = signal<string>('');
  
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
      } else {
        this.router.navigate(['/cliente/empresas']);
      }
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