import { Component, inject, signal, computed, OnInit, OnDestroy, effect } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientCatalogService } from '../../services/client-catalog.service';
import { ClientService } from '../../client.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Vehiculo } from '../../../../shared/models/vehicle/vehicle.model';
import { ServicioAdicional, CreateAlquilerRequest } from '../../../../shared/models/rental/rental.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-vehicles-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './vehicles-catalog.component.html',
  styleUrl: './vehicles-catalog.component.scss'
})
export class VehiclesCatalogComponent implements OnInit, OnDestroy {
  private catalogService = inject(ClientCatalogService);
  private clientService = inject(ClientService);
  private auth = inject(AuthService);
  private notifications = inject(NotificationService);
  private router = inject(Router);

  // ── Vehicle data ──
  allVehiculos = signal<Vehiculo[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  // ── Search & filters (client-side) ──
  searchText = signal<string>('');
  selectedTransmision = signal<string>('');
  selectedCombustible = signal<string>('');
  maxPrice = signal<number>(800);

  // ── Servicios adicionales ──
  serviciosCatalogo = signal<ServicioAdicional[]>([]);

  // ── Pagination ──
  page = signal<number>(1);
  pageSize = 8;

  // ── Details modal ──
  detallesVehiculo = signal<Vehiculo | null>(null);

  // ── Reservation modal ──
  reservando = signal<Vehiculo | null>(null);
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  enviando = signal<boolean>(false);
  terminosAceptados = signal<boolean>(false);
  serviciosSeleccionados = signal<{ servicio_adicional_id: string; cantidad: number }[]>([]);

  // ── Filtered list (computed) ──
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

  // ── Paginated slice ──
  pagedVehiculos = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredVehiculos().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredVehiculos().length / this.pageSize)));

  // ── Body scroll lock on modals ──
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

  // ── Details modal ──
  abrirDetalles(v: Vehiculo): void {
    this.detallesVehiculo.set(v);
  }

  cerrarDetalles(): void {
    this.detallesVehiculo.set(null);
  }

  // ── Reservation modal ──
  abrirReserva(v: Vehiculo): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
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
    this.terminosAceptados.set(false);
    this.reservando.set(v);
  }

  cerrarReserva(): void {
    this.reservando.set(null);
    this.enviando.set(false);
    this.terminosAceptados.set(false);
  }

  toggleServicio(servicioId: string, checked: boolean): void {
    if (checked) {
      this.serviciosSeleccionados.update(list => [...list, { servicio_adicional_id: servicioId, cantidad: 1 }]);
    } else {
      this.serviciosSeleccionados.update(list => list.filter(s => s.servicio_adicional_id !== servicioId));
    }
  }

  isServicioSelected(servicioId: string): boolean {
    return this.serviciosSeleccionados().some(s => s.servicio_adicional_id === servicioId);
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
      const sv = this.serviciosCatalogo().find((s: any) => s.id === sel.servicio_adicional_id);
      if (sv) {
        serviciosTotal += sv.tipo_cobro === 'DIARIO' ? Number(sv.precio) * dias : Number(sv.precio);
      }
    }
    const impuestos = (base + serviciosTotal) * 0.18;
    const total = base + serviciosTotal + impuestos;
    const deposito = total * 0.3;
    return { dias, tarifaDiaria, base, serviciosTotal, impuestos, total, deposito };
  }

  submitReserva(): void {
    const vehiculo = this.reservando();
    if (!vehiculo) return;

    const errorFecha = this.errorFecha();
    if (errorFecha) {
      this.notifications.error(errorFecha);
      return;
    }
    if (!this.terminosAceptados()) {
      this.notifications.error('Debes aceptar los términos y condiciones.');
      return;
    }

    this.enviando.set(true);
    const calculos = this.getCalculos();

    const dto: CreateAlquilerRequest = {
      vehiculo_id: vehiculo.id,
      sucursal_recojo_id: vehiculo.sucursal_actual_id!,
      sucursal_devolucion_id: vehiculo.sucursal_actual_id!,
      fecha_fin_programada: this.fechaFin(),
      servicios_adicionales: this.serviciosSeleccionados().length > 0 ? this.serviciosSeleccionados() : undefined,
    };

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

  // ── Helpers ──
  toDateInputValue(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  minDate(): string {
    return this.toDateInputValue(new Date());
  }

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
}
