import { Component, inject, OnInit, signal } from '@angular/core';
import { RolesService } from '../../services/roles.service';
import { Role } from '../../../../shared/models/role.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  private readonly rolesService = inject(RolesService);

  readonly roles = signal<Role[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.rolesService.findAll().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
