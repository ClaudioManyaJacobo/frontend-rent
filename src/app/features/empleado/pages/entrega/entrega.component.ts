import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Alquiler } from '../../../../shared/models/rental/rental.model';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

const TIPOS_FOTO = ['FRONTAL', 'POSTERIOR', 'LATERAL_IZQ', 'LATERAL_DER', 'INTERIOR', 'TABLERO'];

@Component({
  selector: 'app-entrega',
  standalone: true,
  imports: [RouterLink, PeruDateTimePipe],
  templateUrl: './entrega.component.html',
  styleUrl: './entrega.component.scss',
})
export class EntregaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly alquiler = signal<Alquiler | null>(null);
  readonly loading = signal(true);
  readonly enviando = signal(false);

  readonly kilometraje = signal(0);
  readonly nivel_combustible = signal('1/1');
  readonly estado_carroceria = signal('SIN DAÑOS');
  readonly estado_interior = signal('LIMPIO Y EN ORDEN');
  readonly observaciones = signal('');
  readonly fotos = signal<{ tipo: string; url: string; uploading: boolean }[]>(
    TIPOS_FOTO.map((t) => ({ tipo: t, url: '', uploading: false })),
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('alquilerId');
    if (id) {
      this.admin.getRental(id).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: (data) => {
          this.alquiler.set(data);
          this.kilometraje.set(data.kilometraje_inicial || 0);
          this.nivel_combustible.set(data.nivel_combustible_inicial || '1/1');
        },
      });
    }
  }

  onFotoSelected(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    this.fotos.update((list) => {
      const updated = [...list];
      updated[index] = { ...updated[index], uploading: true };
      return updated;
    });

    this.admin.uploadInspeccionFoto(file).subscribe({
      next: (res) => {
        this.fotos.update((list) => {
          const updated = [...list];
          updated[index] = { ...updated[index], url: res.url, uploading: false };
          return updated;
        });
      },
      error: () => {
        this.notifications.error('Error al subir foto');
        this.fotos.update((list) => {
          const updated = [...list];
          updated[index] = { ...updated[index], uploading: false };
          return updated;
        });
      },
    });
  }

  parseNum(v: any): number {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  confirmarEntrega(): void {
    const a = this.alquiler();
    if (!a) return;

    this.enviando.set(true);
    this.admin.entregarRental(a.id).pipe(
      finalize(() => this.enviando.set(false)),
    ).subscribe({
      next: () => {
        this.notifications.success('Vehículo entregado correctamente');
        void this.router.navigate(['/empleado/buscar-reserva']);
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al entregar vehículo'),
    });
  }
}
