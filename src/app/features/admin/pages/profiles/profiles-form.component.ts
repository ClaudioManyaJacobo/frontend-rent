import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Empresa } from '../../../../shared/models/admin/company.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profiles-form.component.html',
  styleUrl: './profiles-form.component.scss',
})
export class PerfilFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly empresas = signal<Empresa[]>([]);
  readonly loading = signal(false);
  private perfilId = '';
  readonly currentRole = computed(() => this.auth.roleName());

  readonly form = this.fb.group({
    nombres: ['', [Validators.minLength(2)]],
    apellido_paterno: ['', [Validators.minLength(2)]],
    apellido_materno: ['', [Validators.minLength(2)]],
    dni: [''],
    telefono: [''],
    fecha_nacimiento: [''],
    genero: [''],
    direccion: [''],
    foto_url: [''],
    empresa_id: [''],
  });

  ngOnInit(): void {
    this.perfilId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.currentRole() === 'SUPER_ADMIN') {
      this.admin.getCompanies(1, 100).subscribe((res) => {
        this.empresas.set(res.data);
      });
    }
    this.admin.getProfile(this.perfilId).subscribe({
      next: (p) => {
        this.form.patchValue({
          nombres: p.nombres,
          apellido_paterno: p.apellido_paterno,
          apellido_materno: p.apellido_materno,
          dni: p.dni ?? '',
          telefono: p.telefono ?? '',
          fecha_nacimiento: p.fecha_nacimiento
            ? String(p.fecha_nacimiento).slice(0, 10)
            : '',
          genero: p.genero ?? '',
          direccion: p.direccion ?? '',
          foto_url: p.foto_url ?? '',

          empresa_id: p.empresa?.id ?? '',
        });
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: any = {
      nombres: raw.nombres || undefined,
      apellido_paterno: raw.apellido_paterno || undefined,
      apellido_materno: raw.apellido_materno || undefined,
      dni: raw.dni || undefined,
      telefono: raw.telefono || undefined,
      fecha_nacimiento: raw.fecha_nacimiento || undefined,
      genero: raw.genero || undefined,
      direccion: raw.direccion || undefined,
      foto_url: raw.foto_url || undefined,

    };

    // Solo SUPER_ADMIN puede re-asignar la empresa desde UI.
    if (this.currentRole() === 'SUPER_ADMIN') {
      payload.empresa_id = raw.empresa_id || undefined;
    }

    this.loading.set(true);
    this.admin.updateProfile(this.perfilId, payload).subscribe({
      next: () => {
        this.notifications.success('Perfil actualizado');
        void this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
