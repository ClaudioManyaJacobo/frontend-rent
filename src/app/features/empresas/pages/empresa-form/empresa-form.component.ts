import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmpresasService } from '../../services/empresas.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.scss',
})
export class EmpresaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly empresasService = inject(EmpresasService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly isEdit = signal(false);
  private empresaId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    ruc: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
    telefono: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    logo: [''],
    esta_activa: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.empresaId = id;
      this.empresasService.findOne(id).subscribe({
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
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.form.getRawValue();
    this.loading.set(true);

    const request$ =
      this.isEdit() && this.empresaId
        ? this.empresasService.update(this.empresaId, payload)
        : this.empresasService.create(payload);

    request$.subscribe({
      next: () => {
        this.notifications.success(
          this.isEdit() ? 'Empresa actualizada' : 'Empresa creada',
        );
        void this.router.navigate(['/empresas']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
