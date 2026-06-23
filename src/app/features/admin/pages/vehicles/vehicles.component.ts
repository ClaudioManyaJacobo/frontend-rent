import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Vehiculo } from '../../../../shared/models/vehicle/vehicle.model';
import { Empresa } from '../../../../shared/models/admin/company.model';
import { Sucursal } from '../../../../shared/models/admin/branch.model';
import { PaginationMeta } from '../../../../shared/models/api-response.model';
import {
  ESTADO_LABELS,
  VEHICULO_ESTADOS,
  VehiculoEstado,
} from '../../../../shared/constants/fleet.constants';
import { hasRole, resolveRoleName } from '../../../../shared/utils/role-utils';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss',
})
export class VehiclesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly empresas = signal<Empresa[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly limit = 12;

  readonly filterEmpresaId = signal('');
  readonly filterSucursalId = signal('');
  readonly filterEstado = signal<VehiculoEstado | ''>('');

  readonly role = computed(() => resolveRoleName(this.auth.currentUser()));
  readonly canManage = computed(() =>
    hasRole(this.auth.currentUser(), ['SUPER_ADMIN', 'ADMIN']),
  );
  readonly isSuperAdmin = computed(() => this.role() === 'SUPER_ADMIN');
  readonly isEmpleado = computed(() => this.role() === 'EMPLEADO');

  readonly estados = VEHICULO_ESTADOS;
  readonly estadoLabels = ESTADO_LABELS;

  ngOnInit(): void {
    if (this.isSuperAdmin()) {
      this.admin.getCompanies(1, 200).subscribe({
        next: (res) => this.empresas.set(res.data),
      });
      this.loadSucursales();
    }
    this.load();
  }

  loadSucursales(empresaId?: string): void {
    this.admin.getBranches(1, 200, empresaId).subscribe({
      next: (res) => this.sucursales.set(res.data),
    });
  }

  load(): void {
    this.loading.set(true);
    this.admin
      .getVehicles({
        page: this.page(),
        limit: this.limit,
        empresa_id: this.filterEmpresaId() || undefined,
        sucursal_id: this.filterSucursalId() || undefined,
        estado: this.filterEstado() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.vehiculos.set(res.data);
          this.meta.set(res.meta);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onEmpresaFilterChange(empresaId: string): void {
    this.filterEmpresaId.set(empresaId);
    this.filterSucursalId.set('');
    this.page.set(1);
    this.loadSucursales(empresaId || undefined);
    this.load();
  }

  onSucursalFilterChange(sucursalId: string): void {
    this.filterSucursalId.set(sucursalId);
    this.page.set(1);
    this.load();
  }

  onEstadoFilterChange(estado: string): void {
    this.filterEstado.set(estado as VehiculoEstado | '');
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.filterEmpresaId.set('');
    this.filterSucursalId.set('');
    this.filterEstado.set('');
    this.page.set(1);
    if (this.isSuperAdmin()) this.loadSucursales();
    this.load();
  }

  prevPage(): void {
    if (this.meta()?.hasPreviousPage) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.meta()?.hasNextPage) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  goToNew(): void {
    if (!this.canManage()) return;
    void this.router.navigate(['nuevo'], { relativeTo: this.route });
  }

  remove(id: string, placa: string): void {
    if (!confirm(`¿Eliminar vehículo ${placa}?`)) return;
    this.admin.deleteVehicle(id).subscribe({
      next: () => {
        this.notifications.success('Vehículo eliminado');
        this.load();
      },
    });
  }

  estadoClass(estado: string): string {
    return estado.toLowerCase();
  }
}
