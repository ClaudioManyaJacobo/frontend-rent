import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SucursalesService } from '../../services/sucursales.service';
import { EmpresasService } from '../../../empresas/services/empresas.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Sucursal } from '../../../../shared/models/sucursal.model';
import { Empresa } from '../../../../shared/models/empresa.model';
import { PaginationMeta } from '../../../../shared/models/api-response.model';

@Component({
  selector: 'app-sucursal-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './sucursal-list.component.html',
  styleUrl: './sucursal-list.component.scss',
})
export class SucursalListComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly empresasService = inject(EmpresasService);
  private readonly notifications = inject(NotificationService);

  readonly sucursales = signal<Sucursal[]>([]);
  readonly empresas = signal<Empresa[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly limit = 10;
  readonly filterEmpresaId = signal('');

  readonly role = computed(() => this.auth.roleName());
  readonly canManage = computed(
    () => this.role() === 'SUPER_ADMIN' || this.role() === 'ADMIN',
  );
  readonly isSuperAdmin = computed(() => this.role() === 'SUPER_ADMIN');

  ngOnInit(): void {
    if (this.isSuperAdmin()) {
      this.empresasService.findAll(1, 200).subscribe({
        next: (res) => this.empresas.set(res.data),
      });
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const empresaId = this.filterEmpresaId() || undefined;
    this.sucursalesService.findAll(this.page(), this.limit, empresaId).subscribe({
      next: (res) => {
        this.sucursales.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilterChange(empresaId: string): void {
    this.filterEmpresaId.set(empresaId);
    this.page.set(1);
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

  remove(id: string, nombre: string): void {
    if (!confirm(`¿Eliminar sucursal ${nombre}?`)) return;
    this.sucursalesService.remove(id).subscribe({
      next: () => {
        this.notifications.success('Sucursal eliminada');
        this.load();
      },
    });
  }
}
