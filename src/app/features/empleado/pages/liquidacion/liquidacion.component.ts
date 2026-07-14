import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { finalize, forkJoin, Observable, of, switchMap } from 'rxjs';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  Alquiler,
  CargoAdicionalResponse,
  LiquidacionFinalResponse,
  Pago,
} from '../../../../shared/models/rental/rental.model';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-liquidacion',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './liquidacion.component.html',
  styleUrl: './liquidacion.component.scss',
})
export class LiquidacionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly alquiler = signal<Alquiler | null>(null);
  readonly cargos = signal<CargoAdicionalResponse[]>([]);
  readonly liquidaciones = signal<LiquidacionFinalResponse[]>([]);
  readonly loading = signal(true);
  readonly enviando = signal(false);
  readonly cobrando = signal(false);
  readonly metodoPago = signal('EFECTIVO');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('alquilerId');
    if (id) {
      this.admin.getRental(id).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: (data) => {
          this.alquiler.set(data);
          this.loadExtras(data.id);
        },
      });
    }
  }

  prepararLiquidacion(): void {
    const a = this.alquiler();
    if (!a) return;

    this.enviando.set(true);
    this.admin.prepararLiquidacionRental(a.id).pipe(
      switchMap((alquiler) => {
        this.alquiler.set(alquiler);
        return forkJoin({
          cargos: this.admin.getCargosAdicionales(a.id),
          liquidaciones: this.admin.getLiquidaciones(a.id),
        });
      }),
      finalize(() => this.enviando.set(false)),
    ).subscribe({
      next: ({ cargos, liquidaciones }) => {
        this.cargos.set(cargos);
        this.liquidaciones.set(liquidaciones);
        this.notifications.success('Liquidación preparada');
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al preparar liquidación'),
    });
  }

  cobrarSaldoFinal(): void {
    const a = this.alquiler();
    const liquidacion = this.liquidacionActual();
    if (!a || !liquidacion || this.saldoFinal() <= 0) return;
    const reservaId = a.reserva_id ?? a.reserva?.id;
    if (!reservaId) {
      this.notifications.error('No se encontró la reserva asociada al alquiler');
      return;
    }

    this.cobrando.set(true);
    this.admin.registrarPagoCargo(
      a.id,
      reservaId,
      this.saldoFinal(),
      this.metodoPago(),
    ).pipe(
      switchMap((pago: Pago) => this.admin.confirmarPago(pago.id)),
      switchMap(() => {
        const updates: Observable<unknown>[] = this.cargos()
          .filter((cargo) => cargo.estado === 'PENDIENTE')
          .map((cargo) => this.admin.actualizarCargo(cargo.id, { estado: 'COBRADO' }));
        updates.push(this.admin.actualizarLiquidacion(liquidacion.id, { estado: 'PAGADA' }));
        return updates.length ? forkJoin(updates) : of([]);
      }),
      switchMap(() =>
        forkJoin({
          cargos: this.admin.getCargosAdicionales(a.id),
          liquidaciones: this.admin.getLiquidaciones(a.id),
        }),
      ),
      finalize(() => this.cobrando.set(false)),
    ).subscribe({
      next: ({ cargos, liquidaciones }) => {
        this.cargos.set(cargos);
        this.liquidaciones.set(liquidaciones);
        this.notifications.success('Saldo final cobrado');
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al cobrar saldo final'),
    });
  }

  completar(): void {
    const a = this.alquiler();
    if (!a) return;
    const liquidacion = this.liquidacionActual();
    if (a.estado === 'PENDIENTE_DEVOLUCION') {
      this.notifications.error('Primero prepara la liquidación');
      return;
    }
    if (liquidacion?.estado === 'PENDIENTE' && this.saldoFinal() > 0) {
      this.notifications.error('Primero cobra el saldo final de la liquidación');
      return;
    }

    this.enviando.set(true);
    this.admin.completarDevolucionRental(a.id).pipe(
      finalize(() => this.enviando.set(false)),
    ).subscribe({
      next: () => {
        this.notifications.success('Liquidación completada');
        void this.router.navigate(['/empleado/buscar-reserva']);
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al completar liquidación'),
    });
  }

  liquidacionActual(): LiquidacionFinalResponse | null {
    return this.liquidaciones()[0] ?? null;
  }

  totalCargos(): number {
    return this.cargos()
      .filter((cargo) => cargo.estado !== 'ANULADO')
      .reduce((sum, cargo) => sum + Number(cargo.monto), 0);
  }

  totalPagado(): number {
    const a = this.alquiler();
    return (a?.pagos ?? [])
      .filter((pago) => pago.estado_pago === 'PAGADO' || pago.estado_pago === 'CONFIRMADO')
      .reduce((sum, pago) => sum + Number(pago.monto), 0);
  }

  saldoFinal(): number {
    const liquidacion = this.liquidacionActual();
    return Number(liquidacion?.saldo_final ?? this.totalCargos());
  }

  puedeCerrar(): boolean {
    const liquidacion = this.liquidacionActual();
    return !!liquidacion && (liquidacion.estado !== 'PENDIENTE' || this.saldoFinal() <= 0);
  }

  private loadExtras(alquilerId: string): void {
    forkJoin({
      cargos: this.admin.getCargosAdicionales(alquilerId),
      liquidaciones: this.admin.getLiquidaciones(alquilerId),
    }).subscribe({
      next: ({ cargos, liquidaciones }) => {
        this.cargos.set(cargos);
        this.liquidaciones.set(liquidaciones);
      },
    });
  }
}
