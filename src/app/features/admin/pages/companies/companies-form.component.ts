import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';

/** Solo dígitos */
const onlyDigits: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  if (!c.value) return null;
  return /^[0-9]+$/.test(c.value) ? null : { pattern: true };
};

/** Teléfono: solo números, +, -, espacios, paréntesis */
const phonePattern: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  if (!c.value) return null;
  return /^[0-9+\-\s()]+$/.test(c.value) ? null : { pattern: true };
};

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './companies-form.component.html',
  styleUrl: './companies-form.component.scss',
})
export class EmpresaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly isEdit = signal(false);
  private empresaId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    ruc: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11), onlyDigits]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]],
    telefono: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(20), phonePattern]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    logo: ['', [Validators.maxLength(255)]],
    esta_activa: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.empresaId = id;
      this.admin.getCompany(id).subscribe({
        next: (e) => {
          this.form.patchValue({
            ruc: e.ruc,
            nombre: e.nombre,
            direccion: e.direccion,
            telefono: e.telefono,
            email: e.email,
            logo: e.logo ?? '',
            esta_activa: e.esta_activa,
          });
        },
        error: () => {
          this.notifications.error('No se pudo cargar la empresa');
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
    const payload = this.form.getRawValue();
    this.loading.set(true);

    const request$ =
      this.isEdit() && this.empresaId
        ? this.admin.updateCompany(this.empresaId, payload)
        : this.admin.createCompany(payload);

    request$.subscribe({
      next: () => {
        this.notifications.success(
          this.isEdit() ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente',
        );
        void this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
