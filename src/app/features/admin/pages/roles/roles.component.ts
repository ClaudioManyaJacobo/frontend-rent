import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Role } from '../../../../shared/models/user/role.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
})
export class RolesComponent implements OnInit {
  private readonly admin = inject(AdminService);

  readonly roles = signal<Role[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.admin.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
