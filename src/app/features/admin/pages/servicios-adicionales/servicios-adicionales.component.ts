import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ServicioAdicional } from '../../../../shared/models/servicio-adicional.model';

@Component({
  selector: 'app-servicios-adicionales',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './servicios-adicionales.component.html',
  styleUrl: './servicios-adicionales.component.scss',
})
export class ServiciosAdicionalesComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly items = signal<ServicioAdicional[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);
  readonly showForm = signal(false);

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    tipo_cobro: ['DIARIO'],
    esta_activo: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin.getServiciosAdicionales(1, 100).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  newItem(): void {
    this.editingId.set(null);
    this.form.reset({ nombre: '', descripcion: '', precio: 0, tipo_cobro: 'DIARIO', esta_activo: true });
    this.showForm.set(true);
  }

  edit(item: ServicioAdicional): void {
    this.editingId.set(item.id);
    this.form.patchValue({
      nombre: item.nombre,
      descripcion: item.descripcion ?? '',
      precio: item.precio,
      tipo_cobro: item.tipo_cobro,
      esta_activo: item.esta_activo,
    });
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: any = {
      nombre: raw.nombre!,
      descripcion: raw.descripcion || undefined,
      precio: Number(raw.precio),
      tipo_cobro: raw.tipo_cobro,
      esta_activo: raw.esta_activo,
    };

    const request = this.editingId()
      ? this.admin.updateServicioAdicional(this.editingId()!, payload)
      : this.admin.createServicioAdicional(payload);

    request.subscribe({
      next: () => {
        this.notifications.success(this.editingId() ? 'Servicio actualizado' : 'Servicio creado');
        this.cancelForm();
        this.load();
      },
      error: () => this.notifications.error('Error al guardar servicio'),
    });
  }

  delete(id: string, nombre: string): void {
    if (!confirm(`¿Eliminar servicio "${nombre}"?`)) return;
    this.admin.deleteServicioAdicional(id).subscribe({
      next: () => {
        this.notifications.success('Servicio eliminado');
        this.load();
      },
      error: () => this.notifications.error('Error al eliminar servicio'),
    });
  }
}
