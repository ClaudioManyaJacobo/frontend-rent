import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './categories-form.component.html',
  styleUrl: './categories-form.component.scss',
})
export class CategoriaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly isEdit = signal(false);
  private categoriaId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: [''],
    precio_diario_base: [0, [Validators.required, Validators.min(0)]],
    tarifa_km_extra: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    if (this.auth.roleName() !== 'SUPER_ADMIN') {
      void this.router.navigate(['/categorias-vehiculos']);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.categoriaId = id;
      this.admin.getCategory(id).subscribe({
        next: (c) => {
          this.form.patchValue({
            nombre: c.nombre,
            descripcion: c.descripcion ?? '',
            precio_diario_base: Number(c.precio_diario_base),
            tarifa_km_extra: Number(c.tarifa_km_extra),
          });
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.loading.set(true);

    const payload = {
      nombre: raw.nombre,
      descripcion: raw.descripcion || undefined,
      precio_diario_base: Number(raw.precio_diario_base),
      tarifa_km_extra: Number(raw.tarifa_km_extra),
    };

    const request$ =
      this.isEdit() && this.categoriaId
        ? this.admin.updateCategory(this.categoriaId, payload)
        : this.admin.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.notifications.success(
          this.isEdit() ? 'Categoría actualizada' : 'Categoría creada',
        );
        void this.router.navigate(['/categorias-vehiculos']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
