import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Permiso } from '../../../../shared/models/permiso.model';
import { Role } from '../../../../shared/models/user/role.model';

@Component({
  selector: 'app-role-permisos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './role-permisos.component.html',
  styleUrl: './role-permisos.component.scss',
})
export class RolePermisosComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly role = signal<Role | null>(null);
  readonly rolePermisos = signal<Permiso[]>([]);
  readonly availablePermisos = signal<Permiso[]>([]);
  readonly loading = signal(true);

  private rolId!: string;

  ngOnInit(): void {
    this.rolId = this.route.snapshot.paramMap.get('rolId')!;
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.admin.getRoles().subscribe((roles) => {
      this.role.set(roles.find((r) => r.id === this.rolId) ?? null);
    });

    this.admin.getRolePermisos(this.rolId).subscribe({
      next: (rolePerms) => {
        const rolePermIds = new Set(rolePerms.map((p) => p.id));
        this.rolePermisos.set(rolePerms);
        this.admin.getPermisos().subscribe((allPerms) => {
          this.availablePermisos.set(
            allPerms.filter((p) => !rolePermIds.has(p.id)),
          );
          this.loading.set(false);
        });
      },
      error: () => this.loading.set(false),
    });
  }

  addPermiso(permisoId: string): void {
    this.admin.addPermisoToRole(this.rolId, permisoId).subscribe({
      next: () => {
        this.notifications.success('Permiso asignado al rol');
        this.load();
      },
      error: () => this.notifications.error('Error al asignar permiso'),
    });
  }

  removePermiso(permisoId: string): void {
    this.admin.removePermisoFromRole(this.rolId, permisoId).subscribe({
      next: () => {
        this.notifications.success('Permiso removido del rol');
        this.load();
      },
      error: () => this.notifications.error('Error al remover permiso'),
    });
  }
}
