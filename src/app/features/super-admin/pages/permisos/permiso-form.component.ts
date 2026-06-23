import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Modulo } from '../../../../shared/models/modulo.model';

@Component({
  selector: 'app-permiso-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './permiso-form.component.html',
  styleUrl: './permiso-form.component.scss',
})
export class PermisoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly modulos = signal<Modulo[]>([]);
  private permisoId?: string;
  readonly isEdit = signal(false);

  readonly form = this.fb.group({
    codigo: ['', Validators.required],
    accion: ['', Validators.required],
    descripcion: [''],
    modulo_id: ['', Validators.required],
  });

  ngOnInit(): void {
    this.admin.getModulos().subscribe((data) => this.modulos.set(data));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.permisoId = id;
      this.isEdit.set(true);
      this.admin.getPermiso(id).subscribe((p) => {
        this.form.patchValue({
          codigo: p.codigo,
          accion: p.accion,
          descripcion: p.descripcion ?? '',
          modulo_id: p.modulo_id,
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      codigo: raw.codigo!,
      accion: raw.accion!,
      descripcion: raw.descripcion || undefined,
      modulo_id: raw.modulo_id!,
    };

    this.loading.set(true);
    const request = this.permisoId
      ? this.admin.updatePermiso(this.permisoId, payload)
      : this.admin.createPermiso(payload);

    request.subscribe({
      next: () => {
        this.notifications.success(this.permisoId ? 'Permiso actualizado' : 'Permiso creado');
        void this.router.navigate(['/super-admin/permisos']);
      },
      error: () => {
        this.notifications.error('Error al guardar permiso');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
