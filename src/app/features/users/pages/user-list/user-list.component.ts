import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly notifications = inject(NotificationService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);

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
