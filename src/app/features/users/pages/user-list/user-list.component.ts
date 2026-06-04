import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../shared/models/user.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly usersService = inject(UsersService);
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
    this.usersService.findAll().subscribe({
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
    this.usersService.remove(id).subscribe({
      next: () => {
        this.notifications.success('Usuario eliminado');
        this.load();
      },
    });
  }
}
