import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Modulo } from '../../../../shared/models/modulo.model';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-modulos',
  standalone: true,
  imports: [RouterLink, PeruDateTimePipe],
  templateUrl: './modulos.component.html',
  styleUrl: './modulos.component.scss',
})
export class ModulosComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly modulos = signal<Modulo[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin.getModulos().subscribe({
      next: (data) => {
        this.modulos.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  delete(id: string, nombre: string): void {
    if (!confirm(`¿Eliminar módulo "${nombre}"?`)) return;
    this.admin.deleteModulo(id).subscribe({
      next: () => {
        this.notifications.success('Módulo eliminado');
        this.load();
      },
      error: () => this.notifications.error('Error al eliminar módulo'),
    });
  }
}
