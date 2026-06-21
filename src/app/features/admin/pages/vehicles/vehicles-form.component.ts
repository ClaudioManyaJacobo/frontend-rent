import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { resolveRoleName } from '../../../../shared/utils/role-utils';
import { CategoriaVehiculo } from '../../../../shared/models/vehicle/category.model';
import { Sucursal } from '../../../../shared/models/admin/branch.model';
import {
  COMBUSTIBLES,
  CombustibleVehiculo,
  TRANSMISIONES,
  TransmisionVehiculo,
  VEHICULO_ESTADOS,
  VehiculoEstado,
} from '../../../../shared/constants/fleet.constants';

@Component({
  selector: 'app-vehiculo-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './vehicles-form.component.html',
  styleUrl: './vehicles-form.component.scss',
})
export class VehiculoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly categorias = signal<CategoriaVehiculo[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  private vehiculoId: string | null = null;

  readonly transmisiones = TRANSMISIONES;
  readonly combustibles = COMBUSTIBLES;
  readonly estados = VEHICULO_ESTADOS;

  readonly form = this.fb.nonNullable.group({
    categoria_id: ['', Validators.required],
    sucursal_actual_id: ['', Validators.required],
    placa: ['', [Validators.required, Validators.maxLength(15)]],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1990)]],
    color: ['', Validators.required],
    kilometraje: [0, [Validators.min(0)]],
    transmision: ['MANUAL' as TransmisionVehiculo, Validators.required],
    combustible: ['GASOLINA' as CombustibleVehiculo, Validators.required],
    capacidad_pasajeros: [5, [Validators.min(1)]],
    numero_puertas: [5, [Validators.min(2)]],
    precio_diario_personalizado: [''],
    estado: ['DISPONIBLE' as VehiculoEstado, Validators.required],
    foto_url: [''],
  });

  ngOnInit(): void {
    const role = resolveRoleName(this.auth.currentUser());
    if (role === 'EMPLEADO') {
      void this.router.navigate(['/vehiculos']);
      return;
    }

    this.admin.getCategories(1, 100).subscribe({
      next: (res) => this.categorias.set(res.data),
      error: () =>
        this.notifications.error('No se pudieron cargar categorías'),
    });

    this.admin.getBranches(1, 200).subscribe({
      next: (res) => this.sucursales.set(res.data),
      error: () =>
        this.notifications.error('No se pudieron cargar sucursales'),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.vehiculoId = id;
      this.admin.getVehicle(id).subscribe({
        next: (v) => {
          this.form.patchValue({
            categoria_id: v.categoria_id ?? v.categoria?.id ?? '',
            sucursal_actual_id:
              v.sucursal_actual_id ?? v.sucursal_actual?.id ?? '',
            placa: v.placa,
            marca: v.marca,
            modelo: v.modelo,
            anio: v.anio,
            color: v.color,
            kilometraje: v.kilometraje,
            transmision: v.transmision,
            combustible: v.combustible,
            capacidad_pasajeros: v.capacidad_pasajeros,
            numero_puertas: v.numero_puertas,
            precio_diario_personalizado:
              v.precio_diario_personalizado?.toString() ?? '',
            estado: v.estado,
            foto_url: v.foto_url ?? '',
          });
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifications.error(
        'Completa categoría, sucursal y los campos obligatorios',
      );
      return;
    }
    const raw = this.form.getRawValue();
    this.loading.set(true);

    const payload = {
      categoria_id: raw.categoria_id,
      sucursal_actual_id: raw.sucursal_actual_id,
      placa: raw.placa.trim().toUpperCase(),
      marca: raw.marca,
      modelo: raw.modelo,
      anio: Number(raw.anio),
      color: raw.color,
      kilometraje: Number(raw.kilometraje),
      transmision: raw.transmision,
      combustible: raw.combustible,
      capacidad_pasajeros: Number(raw.capacidad_pasajeros),
      numero_puertas: Number(raw.numero_puertas),
      precio_diario_personalizado: raw.precio_diario_personalizado
        ? Number(raw.precio_diario_personalizado)
        : undefined,
      estado: raw.estado,
      foto_url: raw.foto_url || undefined,
    };

    const request$ =
      this.isEdit() && this.vehiculoId
        ? this.admin.updateVehicle(this.vehiculoId, payload)
        : this.admin.createVehicle(payload);

    request$.subscribe({
      next: () => {
        this.notifications.success(
          this.isEdit() ? 'Vehículo actualizado' : 'Vehículo registrado',
        );
        void this.router.navigate(['/vehiculos']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
