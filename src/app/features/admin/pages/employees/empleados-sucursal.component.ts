import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { User } from '../../../../shared/models/user/user.model';
import { EmpleadoSucursal } from '../../../../shared/models/empleado-sucursal.model';

@Component({
  selector: 'app-empleados-sucursal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './empleados-sucursal.component.html',
  styleUrl: './empleados-sucursal.component.scss',
})
export class EmpleadosSucursalComponent implements OnInit {
  private readonly admin = inject(AdminService);

  readonly employees = signal<(User & { sucursales?: EmpleadoSucursal[] })[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin.getUsers().subscribe({
      next: (users) => {
        const empleados = users.filter((u) => u.role?.nombre === 'EMPLEADO');
        empleados.forEach((emp) => {
          this.admin.getEmpleadoSucursalAssignments(emp.id).subscribe({
            next: (asignaciones) => {
              (emp as any).sucursales = asignaciones;
            },
          });
        });
        this.employees.set(empleados);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
