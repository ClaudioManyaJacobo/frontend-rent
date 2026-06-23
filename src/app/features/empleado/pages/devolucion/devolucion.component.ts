import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { finalize, forkJoin, of, switchMap } from 'rxjs';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Alquiler } from '../../../../shared/models/rental/rental.model';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

const TIPOS_FOTO = ['FRONTAL', 'POSTERIOR', 'LATERAL_IZQ', 'LATERAL_DER', 'INTERIOR', 'TABLERO'];

@Component({
  selector: 'app-devolucion',
  standalone: true,
  imports: [RouterLink, PeruDateTimePipe, DecimalPipe],
  templateUrl: './devolucion.component.html',
  styleUrl: './devolucion.component.scss',
})
export class DevolucionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly alquiler = signal<Alquiler | null>(null);
  readonly loading = signal(true);
  readonly enviando = signal(false);
  readonly kilometraje = signal(0);
  readonly nivel_combustible = signal('1/1');
  readonly limpio = signal(true);
  readonly sinDanosVisibles = signal(true);
  readonly llantaRepuesto = signal(true);
  readonly gata = signal(true);
  readonly llaveRuedas = signal(true);
  readonly trianguloSeguridad = signal(true);
  readonly extintor = signal(true);
  readonly botiquin = signal(true);
  readonly combustibleMenor = signal(false);
  readonly requiereLimpieza = signal(false);
  readonly observaciones = signal('');
  readonly fotos = signal<{ tipo: string; url: string; uploading: boolean }[]>(
    TIPOS_FOTO.map((t) => ({ tipo: t, url: '', uploading: false })),
  );
  readonly danosLista = signal<{ descripcion: string; costo: number }[]>([]);
  readonly nuevoDanoDesc = signal('');
  readonly nuevoDanoCosto = signal(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('alquilerId');
    if (id) {
      this.admin.getRental(id).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: (data) => {
          this.alquiler.set(data);
          this.kilometraje.set(data.kilometraje_inicial || data.vehiculo?.kilometraje || 0);
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

  agregarDano(): void {
    if (!this.nuevoDanoDesc().trim() || this.nuevoDanoCosto() <= 0) return;
    this.danosLista.update((list) => [
      ...list,
      { descripcion: this.nuevoDanoDesc().trim(), costo: this.nuevoDanoCosto() },
    ]);
    this.nuevoDanoDesc.set('');
    this.nuevoDanoCosto.set(0);
    this.sinDanosVisibles.set(false);
  }

  quitarDano(index: number): void {
    this.danosLista.update((list) => list.filter((_, i) => i !== index));
    if (!this.danosLista().length) this.sinDanosVisibles.set(true);
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

  confirmarDevolucion(): void {
    const a = this.alquiler();
    if (!a) return;
    if (this.kilometraje() < Number(a.kilometraje_inicial || 0)) {
      this.notifications.error('El kilometraje final no puede ser menor al inicial');
      return;
    }

    this.enviando.set(true);
    const danos = this.danosLista();
    this.admin.devolverRental(a.id, {
      kilometraje_final: this.kilometraje(),
      combustible_final_pct: this.combustiblePct(this.nivel_combustible()),
      limpio: this.limpio(),
      sin_danos_visibles: this.sinDanosVisibles() && danos.length === 0,
      llanta_repuesto: this.llantaRepuesto(),
      gata: this.gata(),
      llave_ruedas: this.llaveRuedas(),
      triangulo_seguridad: this.trianguloSeguridad(),
      extintor: this.extintor(),
      botiquin: this.botiquin(),
      danos_detectados: danos.length > 0 || !this.sinDanosVisibles(),
      combustible_menor_detectado: this.combustibleMenor(),
      requiere_limpieza: this.requiereLimpieza(),
      observaciones: this.observaciones() || undefined,
      fotos: this.fotos()
        .filter((foto) => !!foto.url)
        .map((foto) => ({ tipo_foto: foto.tipo, url: foto.url })),
    }).pipe(
      switchMap(() => {
        const cargos = danos.map((dano) =>
          this.admin.registrarCargo({
            alquiler_id: a.id,
            tipo_cargo: 'DANO',
            descripcion: dano.descripcion,
            cantidad: 1,
            precio_unitario: dano.costo,
            monto: dano.costo,
            estado: 'PENDIENTE',
          }),
        );
        return cargos.length ? forkJoin(cargos) : of([]);
      }),
      finalize(() => this.enviando.set(false)),
    ).subscribe({
      next: () => {
        this.notifications.success('Devolución registrada');
        void this.router.navigate(['/empleado/liquidacion', a.id]);
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al registrar devolución'),
    });
  }
}
