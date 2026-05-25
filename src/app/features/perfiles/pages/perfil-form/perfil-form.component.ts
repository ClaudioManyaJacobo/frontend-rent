import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PerfilesService } from '../../services/perfiles.service';
import { EmpresasService } from '../../../empresas/services/empresas.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Empresa } from '../../../../shared/models/empresa.model';

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './perfil-form.component.html',
  styleUrl: './perfil-form.component.scss',
})
export class PerfilFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly perfilesService = inject(PerfilesService);
  private readonly empresasService = inject(EmpresasService);
  private readonly notifications = inject(NotificationService);

  readonly empresas = signal<Empresa[]>([]);
  readonly loading = signal(false);
  private perfilId = '';

  readonly form = this.fb.group({
    nombres: ['', [Validators.minLength(2)]],
    apellidos: ['', [Validators.minLength(2)]],
    dni: [''],
    telefono: [''],
    fecha_nacimiento: [''],
    genero: [''],
    direccion: [''],
    foto_url: [''],
    cargo: [''],
    empresa_id: [''],
  });

  ngOnInit(): void {
    this.perfilId = this.route.snapshot.paramMap.get('id') ?? '';
    this.empresasService.findAll(1, 100).subscribe((res) => {
      this.empresas.set(res.data);
    });
    this.perfilesService.findOne(this.perfilId).subscribe({
      next: (p) => {
        this.form.patchValue({
          nombres: p.nombres,
          apellidos: p.apellidos,
          dni: p.dni ?? '',
          telefono: p.telefono ?? '',
          fecha_nacimiento: p.fecha_nacimiento
            ? String(p.fecha_nacimiento).slice(0, 10)
            : '',
          genero: p.genero ?? '',
          direccion: p.direccion ?? '',
          foto_url: p.foto_url ?? '',
          cargo: p.cargo ?? '',
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
    const payload = {
      nombres: raw.nombres || undefined,
      apellidos: raw.apellidos || undefined,
      dni: raw.dni || undefined,
      telefono: raw.telefono || undefined,
      fecha_nacimiento: raw.fecha_nacimiento || undefined,
      genero: raw.genero || undefined,
      direccion: raw.direccion || undefined,
      foto_url: raw.foto_url || undefined,
      cargo: raw.cargo || undefined,
      empresa_id: raw.empresa_id || undefined,
    };

    this.loading.set(true);
    this.perfilesService.update(this.perfilId, payload).subscribe({
      next: () => {
        this.notifications.success('Perfil actualizado');
        void this.router.navigate(['/perfiles']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
