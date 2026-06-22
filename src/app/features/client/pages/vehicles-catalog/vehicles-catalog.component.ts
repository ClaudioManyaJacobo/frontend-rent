import { Component, inject, signal, computed, OnInit, OnDestroy, effect } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ClientCatalogService } from '../../services/client-catalog.service';
import { ClientService } from '../../client.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Vehiculo } from '../../../../shared/models/vehicle/vehicle.model';
import { Sucursal } from '../../../../shared/models/admin/branch.model';
import { ServicioAdicional, CreateAlquilerRequest } from '../../../../shared/models/rental/rental.model';
import { ReservaModalComponent } from '../../../../shared/components/reserva-modal/reserva-modal.component';
import { VehicleDetailModalComponent } from '../../../../shared/components/vehicle-detail-modal/vehicle-detail-modal.component';

@Component({
  selector: 'app-vehicles-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReservaModalComponent, VehicleDetailModalComponent],
  templateUrl: './vehicles-catalog.component.html',
  styleUrl: './vehicles-catalog.component.scss'
})
export class VehiclesCatalogComponent implements OnInit, OnDestroy {
  private catalogService = inject(ClientCatalogService);
  private clientService = inject(ClientService);
  private auth = inject(AuthService);
  private notifications = inject(NotificationService);
  private router = inject(Router);

  allVehiculos = signal<Vehiculo[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  searchText = signal<string>('');
  selectedTransmision = signal<string>('');
  selectedCombustible = signal<string>('');
  maxPrice = signal<number>(800);

  serviciosCatalogo = signal<ServicioAdicional[]>([]);

  page = signal<number>(1);
  pageSize = 8;

  detallesVehiculo = signal<Vehiculo | null>(null);

  reservando = signal<Vehiculo | null>(null);
  enviando = signal<boolean>(false);
  sucursalesDisponibles = signal<Sucursal[]>([]);

  filteredVehiculos = computed(() => {
    let list = this.allVehiculos();

    const q = this.searchText().trim().toLowerCase();
    if (q) {
      list = list.filter(v =>
        v.marca.toLowerCase().includes(q) ||
        v.modelo.toLowerCase().includes(q)
      );
    }

    const trans = this.selectedTransmision();
    if (trans) {
      list = list.filter(v => v.transmision === trans);
    }

    const comb = this.selectedCombustible();
    if (comb) {
      list = list.filter(v => v.combustible === comb);
    }

    const price = this.maxPrice();
    list = list.filter(v => {
      const rate = v.precio_diario_personalizado || v.categoria?.precio_diario_base || 0;
      return rate <= price;
    });

    return list;
  });

  pagedVehiculos = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredVehiculos().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredVehiculos().length / this.pageSize)));

  private bodyLock = effect(() => {
    if (this.detallesVehiculo() || this.reservando()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  ngOnInit() {
    this.loadVehiculos();
    this.loadServicios();
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  loadVehiculos() {
    this.loading.set(true);
    this.error.set('');

    this.catalogService.getVehiculos({ page: 1, limit: 100 }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        this.allVehiculos.set(res.data || []);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar los vehículos en este momento.');
        this.notifications.error('Error al cargar la flota de vehículos.');
      }
    });
  }

  loadServicios() {
    this.catalogService.getServiciosAdicionales().subscribe({
      next: (res) => {
        const list = res || [];
        this.serviciosCatalogo.set(list.filter((s: any) => s.esta_activo !== false));
      },
      error: () => {}
    });
  }

  resetFilters(): void {
    this.searchText.set('');
    this.selectedTransmision.set('');
    this.selectedCombustible.set('');
    this.maxPrice.set(800);
    this.page.set(1);
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update(p => p + 1);
    }
  }

  abrirDetalles(v: Vehiculo): void {
    this.detallesVehiculo.set(v);
  }

  cerrarDetalles(): void {
    this.detallesVehiculo.set(null);
  }

  abrirReserva(v: Vehiculo): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.reservando.set(v);

    const empresaId = (v as any).sucursal_actual?.empresa_id || (v as any).sucursal_actual?.empresa?.id;
    if (empresaId) {
      this.catalogService.getSucursalesByEmpresa(empresaId).subscribe({
        next: (res) => this.sucursalesDisponibles.set(res.data || []),
        error: () => this.sucursalesDisponibles.set([]),
      });
    } else {
      this.sucursalesDisponibles.set([]);
    }
  }

  cerrarReserva(): void {
    this.reservando.set(null);
    this.enviando.set(false);
  }

  onReservaConfirm(dto: CreateAlquilerRequest): void {
    this.enviando.set(true);

    this.clientService.createReservation(dto).pipe(
      finalize(() => this.enviando.set(false))
    ).subscribe({
      next: () => {
        this.notifications.success('¡Reserva creada exitosamente!');
        this.cerrarReserva();
        this.router.navigate(['/cliente/mis-alquileres']);
      },
      error: (err) => {
        console.error(err);
        this.notifications.error(err.error?.message || 'Error al crear la reserva. Intenta nuevamente.');
      }
    });
  }
}
