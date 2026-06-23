import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Empresa } from '../../../../shared/models/admin/company.model';

@Component({
  selector: 'app-sucursal-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './branches-form.component.html',
  styleUrl: './branches-form.component.scss',
})
export class SucursalFormComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly empresas = signal<Empresa[]>([]);
  private sucursalId: string | null = null;

  readonly isSuperAdmin = computed(() => this.auth.roleName() === 'SUPER_ADMIN');

  readonly form = this.fb.group({
    empresa_id: [undefined as string | undefined],

    nombre: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]],

    direccion: ['', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(250),
    ]],

    ciudad: ['', [
      Validators.required,
      Validators.maxLength(100),
    ]],

    telefono: ['', [Validators.maxLength(20)]],

    email: ['', [Validators.email, Validators.maxLength(120)]],

    latitud: [null as number | null, [Validators.min(-90), Validators.max(90)]],

    longitud: [null as number | null, [Validators.min(-180), Validators.max(180)]],

    foto_sucursal: ['', [Validators.maxLength(255)]],

    esta_activa: [true],
  });

  ngOnInit(): void {

    // SUPER ADMIN: cargar empresas y requerir empresa_id
    if (this.isSuperAdmin()) {
      this.admin.getCompanies(1, 200).subscribe({
        next: (res) => this.empresas.set(res.data),
      });

      this.form.controls.empresa_id.setValidators([Validators.required]);
      this.form.controls.empresa_id.updateValueAndValidity();
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.sucursalId = id;

      this.admin.getBranch(id).subscribe({
        next: (s) => {
          this.form.patchValue({
            empresa_id: s.empresa_id ?? s.empresa?.id ?? undefined,
            nombre: s.nombre,
            direccion: s.direccion,
            ciudad: s.ciudad,
            telefono: s.telefono ?? '',
            email: s.email ?? '',
            latitud: s.latitud ?? null,
            longitud: s.longitud ?? null,
            foto_sucursal: s.foto_sucursal ?? '',
            esta_activa: s.esta_activa,
          });
        },
        error: () => {
          this.notifications.error('No se pudo cargar la sucursal');
          void this.router.navigate(['..'], { relativeTo: this.route });
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifications.error('Por favor, corrige los errores del formulario antes de continuar.');
      return;
    }

    const raw = this.form.getRawValue();
    this.loading.set(true);

    const payload = {
      nombre: raw.nombre ?? '',
      direccion: raw.direccion ?? '',
      ciudad: raw.ciudad ?? '',
      telefono: raw.telefono || undefined,
      email: raw.email || undefined,
      latitud: raw.latitud ?? undefined,
      longitud: raw.longitud ?? undefined,
      foto_sucursal: raw.foto_sucursal || undefined,
      esta_activa: raw.esta_activa ?? true,

      ...(this.isSuperAdmin() && !this.isEdit()
        ? { empresa_id: raw.empresa_id ?? undefined }
        : {}),
    };

    const request$ = this.isEdit() && this.sucursalId
      ? this.admin.updateBranch(this.sucursalId, payload)
      : this.admin.createBranch(payload);

    request$.subscribe({
      next: () => {
        this.notifications.success(
          this.isEdit() ? 'Sucursal actualizada correctamente' : 'Sucursal creada correctamente',
        );
        void this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}