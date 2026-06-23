import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoriaVehiculo } from '../../../../shared/models/vehicle/category.model';
import { PaginationMeta } from '../../../../shared/models/api-response.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly categorias = signal<CategoriaVehiculo[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly page = signal(1);

  readonly canManage = computed(
    () => this.auth.roleName() === 'SUPER_ADMIN',
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin.getCategories(this.page(), 20).subscribe({
      next: (res) => {
        this.categorias.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToNew(): void {
    if (!this.canManage()) return;
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  remove(id: string, nombre: string): void {
    if (!this.canManage()) return;
    if (!confirm(`¿Eliminar categoría ${nombre}?`)) return;
    this.admin.deleteCategory(id).subscribe({
      next: () => {
        this.notifications.success('Categoría eliminada');
        this.load();
      },
    });
  }
}
