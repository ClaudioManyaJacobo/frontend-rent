import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CategoriasVehiculosService } from '../../services/categorias-vehiculos.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { CategoriaVehiculo } from '../../../../shared/models/categoria-vehiculo.model';
import { PaginationMeta } from '../../../../shared/models/api-response.model';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './categoria-list.component.html',
  styleUrl: './categoria-list.component.scss',
})
export class CategoriaListComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly categoriasService = inject(CategoriasVehiculosService);
  private readonly notifications = inject(NotificationService);

  readonly categorias = signal<CategoriaVehiculo[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly page = signal(1);

  readonly canManage = computed(
    () => this.auth.currentUser()?.role === 'SUPER_ADMIN',
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.categoriasService.findAll(this.page(), 20).subscribe({
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
    void this.router.navigate(['/categorias-vehiculos/new']);
  }

  remove(id: string, nombre: string): void {
    if (!this.canManage()) return;
    if (!confirm(`¿Eliminar categoría ${nombre}?`)) return;
    this.categoriasService.remove(id).subscribe({
      next: () => {
        this.notifications.success('Categoría eliminada');
        this.load();
      },
    });
  }
}
