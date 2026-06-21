import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { ClientProfileService } from '../../services/client-profile.service';
import { DocumentosUsuarioService } from '../../services/documentos-identidad.service';
import { Perfil } from '../../../../shared/models/perfil.model';
import { DocumentoUsuario } from '../../../../shared/models/documento-identidad.model';

function edadMinimaValidator(minEdad: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= minEdad ? null : { edadMinima: { required: minEdad, actual: age } };
  };
}

@Component({
  selector: 'app-client-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-cuenta.component.html',
  styleUrl: './client-cuenta.component.scss',
})
export class ClientCuentaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ClientProfileService);
  private readonly documentosService = inject(DocumentosUsuarioService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly serverErrors = signal<Record<string, string>>({});
  readonly perfil = signal<Perfil | null>(null);

  readonly user = computed(() => this.auth.currentUser());

  readonly initials = computed(() => {
    const p = this.perfil();
    if (p?.nombres) return p.nombres.substring(0, 2).toUpperCase();
    const email = this.user()?.email;
    return email ? email.substring(0, 2).toUpperCase() : 'CL';
  });

  readonly displayName = computed(() => {
    const p = this.perfil();
    if (p?.nombres && p?.apellido_paterno) return `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno}`;
    const email = this.user()?.email;
    if (!email) return 'Cliente';
    const parts = email.split('@')[0];
    return parts.charAt(0).toUpperCase() + parts.slice(1);
  });

  readonly profileProgress = computed(() => this.perfil()?.validacion?.progreso_perfil ?? 0);
  readonly docsProgress = computed(() => this.perfil()?.validacion?.progreso_docs ?? 0);
  readonly overallProgress = computed(() => this.perfil()?.validacion?.progreso_total ?? 0);
  readonly section1Complete = computed(() => this.profileProgress() === 100);

  readonly allValidated = computed(() => this.frontalAprobado() && this.reversoAprobado());

  readonly validationMessages = computed(() => this.perfil()?.validacion?.mensajes ?? []);

  readonly frontalAprobado = computed(() =>
    this.documentos().some(d => d.tipo_documento === 'DNI_FRONTAL' && d.estado_validacion === 'APROBADO'),
  );
  readonly reversoAprobado = computed(() =>
    this.documentos().some(d => d.tipo_documento === 'DNI_REVERSO' && d.estado_validacion === 'APROBADO'),
  );
  readonly frontalRechazado = computed(() =>
    !this.frontalAprobado() && this.documentos().some(d => d.tipo_documento === 'DNI_FRONTAL' && d.estado_validacion === 'RECHAZADO'),
  );
  readonly reversoRechazado = computed(() =>
    !this.reversoAprobado() && this.documentos().some(d => d.tipo_documento === 'DNI_REVERSO' && d.estado_validacion === 'RECHAZADO'),
  );

  readonly formSubmitted = signal(false);

  form = this.fb.group({
    nombres: ['', Validators.required],
    apellido_paterno: ['', Validators.required],
    apellido_materno: ['', Validators.required],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    telefono: ['', Validators.required],
    fecha_nacimiento: ['', [Validators.required, edadMinimaValidator(18)]],
    genero: [''],
    direccion: ['', Validators.required],
  });

  readonly frontalLoading = signal(false);
  readonly reversoLoading = signal(false);
  readonly documentos = signal<DocumentoUsuario[]>([]);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.profileService.getMyProfile().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.form.patchValue({
          nombres: perfil.nombres ?? '',
          apellido_paterno: perfil.apellido_paterno ?? '',
          apellido_materno: perfil.apellido_materno ?? '',
          dni: perfil.dni ?? '',
          telefono: perfil.telefono ?? '',
          fecha_nacimiento: perfil.fecha_nacimiento
            ? perfil.fecha_nacimiento.substring(0, 10)
            : '',
          genero: perfil.genero ?? '',
          direccion: perfil.direccion ?? '',
        });
        this.loading.set(false);
        this.cargarDocumentos();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error al cargar el perfil');
        this.loading.set(false);
      },
    });
  }

  cargarDocumentos(): void {
    this.documentosService.listar().subscribe({
      next: (docs) => {
        this.documentos.set(docs);
      },
      error: () => {
        console.error('Error al cargar documentos');
      },
    });
  }

  save(): void {
    this.formSubmitted.set(true);
    this.form.markAllAsTouched();
    this.serverErrors.set({});

    if (this.form.invalid) return;

    const perfilActual = this.perfil();
    if (!perfilActual) return;

    this.saving.set(true);
    const dto = {
      nombres: this.form.value.nombres ?? undefined,
      apellido_paterno: this.form.value.apellido_paterno ?? undefined,
      apellido_materno: this.form.value.apellido_materno ?? undefined,
      dni: this.form.value.dni || undefined,
      telefono: this.form.value.telefono || undefined,
      fecha_nacimiento: this.form.value.fecha_nacimiento || undefined,
      genero: this.form.value.genero || undefined,
      direccion: this.form.value.direccion || undefined,
    };

    this.profileService.updateProfile(perfilActual.id, dto).subscribe({
      next: (updated) => {
        this.perfil.set(updated);
        this.saving.set(false);
        this.formSubmitted.set(false);
        this.cargarDocumentos();
      },
      error: (err) => {
        this.saving.set(false);
        this.formSubmitted.set(false);
        const errorBody = err?.error;
        if (errorBody?.error?.fields) {
          this.serverErrors.set(errorBody.error.fields);
        }
      },
    });
  }

  onFileSelected(event: Event, tipo: 'DNI_FRONTAL' | 'DNI_REVERSO'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const loading = tipo === 'DNI_FRONTAL' ? this.frontalLoading : this.reversoLoading;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      loading.set(true);
      this.documentosService.subir({ tipo_documento: tipo, archivo_url: dataUrl }).subscribe({
        next: () => {
          loading.set(false);
          setTimeout(() => this.cargarDocumentos(), 2000);
        },
        error: () => {
          loading.set(false);
          console.error('Error al subir documento');
        },
      });
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  estadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'badge-aprobado';
      case 'RECHAZADO': return 'badge-rechazado';
      case 'OBSERVADO': return 'badge-observado';
      default: return 'badge-pendiente';
    }
  }

  showFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    const hasServerError = !!this.serverErrors()[fieldName];
    return hasServerError || (!!field?.invalid && (field.touched || field.dirty || this.formSubmitted()));
  }

  fieldStatus(fieldName: string): 'ok' | 'error' | 'empty' {
    const field = this.form.get(fieldName);
    if (!field) return 'empty';
    const val = field.value;
    const isEmpty = val === null || val === undefined || val === '' || (typeof val === 'string' && !val.trim());
    if (isEmpty && !this.serverErrors()[fieldName]) return 'empty';
    if (!!this.serverErrors()[fieldName] || field.invalid) return 'error';
    return 'ok';
  }

  fieldErrorText(fieldName: string): string {
    const serverMsg = this.serverErrors()[fieldName];
    if (serverMsg) return serverMsg;
    const field = this.form.get(fieldName);
    if (!field) return '';
    if (field.hasError('required')) return 'Campo obligatorio';
    if (field.hasError('pattern')) return 'Debe tener 8 dígitos';
    if (field.hasError('edadMinima')) return 'Debe ser mayor de 18 años';
    return 'Campo inválido';
  }

  readonly missingFields = computed(() => {
    const labels: Record<string, string> = {
      nombres: 'Nombres',
      apellido_paterno: 'Apellido Paterno',
      apellido_materno: 'Apellido Materno',
      dni: 'DNI',
      telefono: 'Teléfono',
      fecha_nacimiento: 'Fecha de Nacimiento',
      direccion: 'Dirección',
    };
    return Object.keys(labels).filter(k => this.form.get(k)?.invalid).map(k => labels[k]);
  });
}
