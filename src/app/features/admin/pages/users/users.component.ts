import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../shared/models/user/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterLink, PeruDateTimePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly role = computed(() => this.auth.roleName());
  readonly tab = signal<'ADMIN' | 'EMPLEADO'>('EMPLEADO');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(tab: 'ADMIN' | 'EMPLEADO'): void {
    this.tab.set(tab);
  }

  readonly admins = computed(() =>
    this.users().filter((u) => u.role?.nombre === 'ADMIN'),
  );

  readonly employees = computed(() =>
    this.users().filter((u) => u.role?.nombre === 'EMPLEADO'),
  );

  get visibleUsers(): User[] {
    if (this.role() === 'SUPER_ADMIN') {
      return this.tab() === 'ADMIN' ? this.admins() : this.employees();
    }
    // ADMIN: el backend ya limita a EMPLEADO de su empresa
    return this.employees();
  }

  remove(id: string, email: string): void {
    if (!confirm(`¿Eliminar usuario ${email}?`)) return;
    this.admin.deleteUser(id).subscribe({
      next: () => {
        this.notifications.success('Usuario eliminado');
        this.load();
      },
    });
  }
}
