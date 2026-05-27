import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClientCatalogService } from '../../services/client-catalog.service';

@Component({
  selector: 'app-client-vehiculos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-vehiculos.component.html',
  styleUrls: ['./client-vehiculos.component.scss']
})
export class ClientVehiculosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(ClientCatalogService);

  sucursalId = signal<string>('');
  vehiculos = signal<any[]>([]);
  sucursal = signal<any>(null);
  loading = signal<boolean>(true);
  loadingSucursal = signal<boolean>(true);
  error = signal<string>('');

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

  loadSucursal(sucursalId: string) {
    this.loadingSucursal.set(true);
    this.catalogService.getSucursal(sucursalId).subscribe({
      next: (res) => {
        this.sucursal.set(res.data || null);
        this.loadingSucursal.set(false);
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
}
