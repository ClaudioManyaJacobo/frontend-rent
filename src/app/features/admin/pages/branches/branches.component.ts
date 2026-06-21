import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Sucursal } from '../../../../shared/models/admin/branch.model';
import { Empresa } from '../../../../shared/models/admin/company.model';
import { PaginationMeta } from '../../../../shared/models/api-response.model';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss',
})
export class BranchesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly admin = inject(AdminService);
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
      this.admin.getCompanies(1, 200).subscribe({
        next: (res) => this.empresas.set(res.data),
      });
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const empresaId = this.filterEmpresaId() || undefined;
    this.admin.getBranches(this.page(), this.limit, empresaId).subscribe({
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
    this.admin.deleteBranch(id).subscribe({
      next: () => {
        this.notifications.success('Sucursal eliminada');
        this.load();
      },
    });
  }
}
