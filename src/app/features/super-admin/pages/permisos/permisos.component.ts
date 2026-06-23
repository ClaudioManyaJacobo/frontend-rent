import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Permiso } from '../../../../shared/models/permiso.model';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [RouterLink, PeruDateTimePipe],
  templateUrl: './permisos.component.html',
  styleUrl: './permisos.component.scss',
})
export class PermisosComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly permisos = signal<Permiso[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin.getPermisos().subscribe({
      next: (data) => {
        this.permisos.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  delete(id: string, accion: string): void {
    if (!confirm(`¿Eliminar permiso "${accion}"?`)) return;
    this.admin.deletePermiso(id).subscribe({
      next: () => {
        this.notifications.success('Permiso eliminado');
        this.load();
      },
      error: () => this.notifications.error('Error al eliminar permiso'),
    });
  }
}
