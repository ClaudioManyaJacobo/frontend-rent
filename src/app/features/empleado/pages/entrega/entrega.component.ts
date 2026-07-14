import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { finalize, of, switchMap } from 'rxjs';
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
  readonly firmaCliente = signal(true);
  readonly firmaEmpleado = signal(true);
  readonly fotos = signal<{ tipo: string; url: string; uploading: boolean }[]>(
    TIPOS_FOTO.map((t) => ({ tipo: t, url: '', uploading: false })),
  );

  // Contract
  readonly contratoFile = signal<File | null>(null);
  readonly contratoUploading = signal(false);
  readonly contratoUrl = signal('');
  readonly contratoNombre = signal('');
  readonly contratoMime = signal('');
  readonly aceptaTerminos = signal(false);
  readonly aceptaPoliticaDanos = signal(false);
  readonly aceptaContrato = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('alquilerId');
    if (id) {
      this.admin.getRental(id).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: (data) => {
          this.alquiler.set(data);
          const vehiculoKm = data.reserva?.vehiculo?.kilometraje ?? 0;
          const vehiculoComb = data.reserva?.vehiculo?.combustible_actual_pct ?? 100;
          this.kilometraje.set(data.kilometraje_inicial || vehiculoKm);
          this.nivel_combustible.set(
            data.nivel_combustible_inicial || this.pctCombustible(vehiculoComb),
          );
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

  onContratoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.contratoFile.set(file);
  }

  uploadContrato(): void {
    const file = this.contratoFile();
    if (!file) return;
    this.contratoUploading.set(true);
    this.admin.uploadContrato(file).subscribe({
      next: (res) => {
        this.contratoUrl.set(res.url);
        this.contratoNombre.set(res.nombre_archivo);
        this.contratoMime.set(res.mime_type);
        this.contratoUploading.set(false);
        this.notifications.success('Contrato subido');
      },
      error: () => {
        this.contratoUploading.set(false);
        this.notifications.error('Error al subir contrato');
      },
    });
  }

  private pctCombustible(pct: number): string {
    if (pct >= 88) return '1/1';
    if (pct >= 63) return '3/4';
    if (pct >= 38) return '1/2';
    return '1/4';
  }

  private combustiblePct(value: string): number {
    const map: Record<string, number> = {
      '1/1': 100,
      '3/4': 75,
      '1/2': 50,
      '1/4': 25,
    };
    return map[value] ?? 100;
  }

  confirmarEntrega(): void {
    const a = this.alquiler();
    if (!a) return;

    this.enviando.set(true);
    const observaciones = [
      `Carrocería: ${this.estado_carroceria()}`,
      `Interior: ${this.estado_interior()}`,
      this.observaciones().trim(),
    ].filter(Boolean).join(' | ');

    const contratoPayload = this.contratoUrl()
      ? {
          nombre_archivo: this.contratoNombre(),
          mime_type: this.contratoMime(),
          url_archivo: this.contratoUrl(),
          acepta_terminos: this.aceptaTerminos(),
          acepta_politica_danos: this.aceptaPoliticaDanos(),
          acepta_contrato: this.aceptaContrato(),
        }
      : undefined;

    this.admin.entregarRental(a.id, {
      kilometraje_inicial: this.kilometraje(),
      combustible_inicial_pct: this.combustiblePct(this.nivel_combustible()),
      observaciones,
      firma_cliente: this.firmaCliente(),
      firma_empleado: this.firmaEmpleado(),
      fotos: this.fotos()
        .filter((foto) => !!foto.url)
        .map((foto) => ({ tipo_foto: foto.tipo, url: foto.url })),
    }).pipe(
      switchMap(() =>
        contratoPayload
          ? this.admin.registrarContrato({
              alquiler_id: a.id,
              ...contratoPayload,
            })
          : of(null),
      ),
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
