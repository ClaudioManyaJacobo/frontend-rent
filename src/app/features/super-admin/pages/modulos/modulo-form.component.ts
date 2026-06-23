import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-modulo-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './modulo-form.component.html',
  styleUrl: './modulo-form.component.scss',
})
export class ModuloFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  private moduloId?: string;
  readonly isEdit = signal(false);

  readonly form = this.fb.group({
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.moduloId = id;
      this.isEdit.set(true);
      this.admin.getModulo(id).subscribe((m) => {
        this.form.patchValue({
          codigo: m.codigo,
          nombre: m.nombre,
          descripcion: m.descripcion ?? '',
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
      nombre: raw.nombre!,
      descripcion: raw.descripcion || undefined,
    };

    this.loading.set(true);
    const request = this.moduloId
      ? this.admin.updateModulo(this.moduloId, payload)
      : this.admin.createModulo(payload);

    request.subscribe({
      next: () => {
        this.notifications.success(this.moduloId ? 'Módulo actualizado' : 'Módulo creado');
        void this.router.navigate(['/super-admin/modulos']);
      },
      error: () => {
        this.notifications.error('Error al guardar módulo');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
