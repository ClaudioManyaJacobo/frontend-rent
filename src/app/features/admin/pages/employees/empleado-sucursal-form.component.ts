import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../../shared/models/user/user.model';
import { Sucursal } from '../../../../shared/models/admin/branch.model';
import { EmpleadoSucursal } from '../../../../shared/models/empleado-sucursal.model';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-empleado-sucursal-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SlicePipe],
  templateUrl: './empleado-sucursal-form.component.html',
  styleUrl: './empleado-sucursal-form.component.scss',
})
export class EmpleadoSucursalFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly empleados = signal<User[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly asignaciones = signal<EmpleadoSucursal[]>([]);
  readonly loading = signal(false);

  readonly empleadoId = signal<string | undefined>(undefined);

  readonly form = this.fb.group({
    empleado_id: ['', Validators.required],
    sucursal_id: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.empleadoId.set(id);

    this.admin.getUsers().subscribe((users) => {
      this.empleados.set(users.filter((u) => u.role?.nombre === 'EMPLEADO'));
    });

    this.admin.getBranches(1, 100).subscribe((res) => {
      this.sucursales.set(res.data);
    });

    if (id) {
      this.form.patchValue({ empleado_id: id });
      this.loadAsignaciones();
    }
  }

  private loadAsignaciones(): void {
    const id = this.empleadoId();
    if (!id) return;
    this.admin.getEmpleadoSucursalAssignments(id).subscribe({
      next: (data) => this.asignaciones.set(data),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const empId = raw.empleado_id!;
    const sucId = raw.sucursal_id!;

    this.loading.set(true);
    this.admin.addEmpleadoSucursalAssignment(empId, sucId).subscribe({
      next: () => {
        this.notifications.success('Sucursal asignada al empleado');
        this.loading.set(false);
        this.form.patchValue({ sucursal_id: '' });
        this.loadAsignaciones();
      },
      error: () => {
        this.notifications.error('Error al asignar sucursal');
        this.loading.set(false);
      },
    });
  }
}
