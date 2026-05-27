import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SucursalesService } from '../../services/sucursales.service';
import { EmpresasService } from '../../../empresas/services/empresas.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Empresa } from '../../../../shared/models/empresa.model';

@Component({
  selector: 'app-sucursal-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sucursal-form.component.html',
  styleUrl: './sucursal-form.component.scss',
})
export class SucursalFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly empresasService = inject(EmpresasService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly empresas = signal<Empresa[]>([]);
  private sucursalId: string | null = null;

  readonly isSuperAdmin = computed(
    () => this.auth.currentUser()?.role === 'SUPER_ADMIN',
  );

  readonly form = this.fb.nonNullable.group({
    empresa_id: [''],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    ciudad: ['', [Validators.required]],
    telefono: [''],
    email: ['', [Validators.email]],
    esta_activa: [true],
  });

  ngOnInit(): void {
    if (this.isSuperAdmin()) {
      this.empresasService.findAll(1, 200).subscribe({
        next: (res) => this.empresas.set(res.data),
      });
      this.form.controls.empresa_id.setValidators([Validators.required]);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.sucursalId = id;
      this.sucursalesService.findOne(id).subscribe({
        next: (s) => {
          this.form.patchValue({
            empresa_id: s.empresa_id ?? s.empresa?.id ?? '',
            nombre: s.nombre,
            direccion: s.direccion,
            ciudad: s.ciudad,
            telefono: s.telefono ?? '',
            email: s.email ?? '',
            esta_activa: s.esta_activa,
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
      direccion: raw.direccion,
      ciudad: raw.ciudad,
      telefono: raw.telefono || undefined,
      email: raw.email || undefined,
      esta_activa: raw.esta_activa,
      ...(this.isSuperAdmin() && !this.isEdit()
        ? { empresa_id: raw.empresa_id }
        : {}),
    };

    const request$ =
      this.isEdit() && this.sucursalId
        ? this.sucursalesService.update(this.sucursalId, payload)
        : this.sucursalesService.create(payload);

    request$.subscribe({
      next: () => {
        this.notifications.success(
          this.isEdit() ? 'Sucursal actualizada' : 'Sucursal creada',
        );
        void this.router.navigate(['/sucursales']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
