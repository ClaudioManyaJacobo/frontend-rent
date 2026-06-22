import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, SlicePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import { AdminService } from '../../admin.service';
import { Alquiler, ESTADO_LABELS, ESTADO_CLASS, ReporteDevolucion, AccesorioRequest, FotoRequest } from '../../../../shared/models/rental/rental.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { formatRemainingTime } from '../../../../shared/utils/date-utils';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

const ACCESORIOS_POR_DEFECTO = [
  'Llanta de repuesto',
  'Gata y herramientas',
  'Triángulo de seguridad',
];

const TIPOS_FOTO = ['FRONTAL', 'POSTERIOR', 'LATERAL_IZQ', 'LATERAL_DER', 'INTERIOR', 'TABLERO'];

@Component({
  selector: 'app-alquiler-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, SlicePipe, CommonModule, FormsModule, PeruDateTimePipe],
  templateUrl: './rentals-detail.component.html',
  styleUrl: './rentals-detail.component.scss',
})
export class AlquilerDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly admin = inject(AdminService);
  readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  private readonly destroy$ = new Subject<void>();
  private now = signal(Date.now());
  private timerRef: ReturnType<typeof setInterval> | null = null;

  readonly alquiler = signal<Alquiler | null>(null);
  readonly loading = signal(true);

  readonly ACCESORIOS_POR_DEFECTO = ACCESORIOS_POR_DEFECTO;
  readonly TIPOS_FOTO = TIPOS_FOTO;

  // Payment modal
  showPagoModal = signal(false);
  pagoMonto = signal(0);
  pagoMetodo = signal('TARJETA_CREDITO');
  pagoReferencia = signal('');

  // Delivery inspection modal
  showEntregaModal = signal(false);
  entregaKm = signal(0);
  entregaCombustible = signal('1/1');
  entregaAccesorios = signal<{ nombre: string; presente: boolean }[]>(
    ACCESORIOS_POR_DEFECTO.map((n) => ({ nombre: n, presente: true })),
  );
  entregaFotos = signal<{ tipo: string; file: File | null; url: string; uploading: boolean }[]>(
    TIPOS_FOTO.map((t) => ({ tipo: t, file: null, url: '', uploading: false })),
  );
  entregaCarroceria = signal('SIN DAÑOS');
  entregaInterior = signal('LIMPIO Y EN ORDEN');
  entregaObs = signal('');

  // Return inspection modal
  showDevolucionModal = signal(false);
  devolucionKm = signal(0);
  devolucionCombustible = signal('1/1');
  devolucionAccesorios = signal<{ nombre: string; presente: boolean }[]>(
    ACCESORIOS_POR_DEFECTO.map((n) => ({ nombre: n, presente: true })),
  );
  devolucionFotos = signal<{ tipo: string; file: File | null; url: string; uploading: boolean }[]>(
    TIPOS_FOTO.map((t) => ({ tipo: t, file: null, url: '', uploading: false })),
  );
  devolucionCarroceria = signal('SIN DAÑOS');
  devolucionInterior = signal('LIMPIO Y EN ORDEN');
  devolucionObs = signal('');

  // Danos on return
  danosLista = signal<{ descripcion: string; costo: number; foto_url?: string }[]>([]);
  nuevoDanoDesc = signal('');
  nuevoDanoCosto = signal(0);

  // Penalidades
  showCobrarPenalidadesModal = signal(false);
  totalPenalidades = signal(0);
  metodoPagoPenalidad = signal('TARJETA_CREDITO');

  // Reporte
  showReporteModal = signal(false);
  reporte = signal<ReporteDevolucion | null>(null);
  cargandoReporte = signal(false);

  enviando = signal(false);

  readonly ESTADO_LABELS = ESTADO_LABELS;
  readonly ESTADO_CLASS = ESTADO_CLASS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
    this.timerRef = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerRef) clearInterval(this.timerRef);
  }

  tiempoRestante(fechaFin: string | null | undefined): string {
    this.now();
    if (!fechaFin) return '';
    return formatRemainingTime(fechaFin);
  }

  esUrgente(fechaFin: string | null | undefined): boolean {
    if (!fechaFin) return false;
    const diff = new Date(fechaFin).getTime() - Date.now();
    return !isNaN(diff) && diff > 0 && diff < 10 * 60 * 1000;
  }

  private load(id: string): void {
    this.loading.set(true);
    this.admin.getRental(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (data) => this.alquiler.set(data),
    });
  }

  // ── Payment ──
  abrirPagoModal(): void {
    this.pagoMonto.set(Number(this.alquiler()?.monto_total || 0) * 0.3);
    this.pagoMetodo.set('TARJETA_CREDITO');
    this.pagoReferencia.set('');
    this.showPagoModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarPagoModal(): void {
    this.showPagoModal.set(false);
    document.body.style.overflow = '';
  }

  pagarReservaRapido(): void {
    const a = this.alquiler();
    if (!a) return;
    this.enviando.set(true);
    const monto = Number(a.monto_total) * 0.3;
    this.admin.confirmarPagoRental(a.id, {
      monto,
      metodo_pago: 'TARJETA_CREDITO',
      transaccion_referencia: 'ADM-' + Date.now(),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifications.success('Pago de reserva confirmado');
        this.enviando.set(false);
        this.load(a.id);
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al confirmar pago');
        this.enviando.set(false);
      },
    });
  }

  confirmarPagoReserva(): void {
    const a = this.alquiler();
    if (!a) return;
    this.enviando.set(true);
    this.admin.confirmarPagoRental(a.id, {
      monto: this.pagoMonto(),
      metodo_pago: this.pagoMetodo(),
      transaccion_referencia: this.pagoReferencia() || undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifications.success('Pago de reserva confirmado');
        this.cerrarPagoModal();
        this.enviando.set(false);
        this.load(a.id);
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al confirmar pago');
        this.enviando.set(false);
      },
    });
  }

  // ── Saldo ──
  showSaldoModal = signal(false);
  saldoMonto = signal(0);
  saldoMetodo = signal('TARJETA_CREDITO');

  abrirSaldoModal(): void {
    const a = this.alquiler();
    if (!a) return;
    const pagado = a.pagos?.filter(p => p.estado_pago === 'PAGADO').reduce((s, p) => s + Number(p.monto), 0) || 0;
    this.saldoMonto.set(Number(a.monto_total) - pagado);
    this.saldoMetodo.set('TARJETA_CREDITO');
    this.showSaldoModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarSaldoModal(): void {
    this.showSaldoModal.set(false);
    document.body.style.overflow = '';
  }

  cobrarSaldo(): void {
    const a = this.alquiler();
    if (!a) return;
    this.enviando.set(true);
    this.admin.pagarSaldoRental(a.id, { metodo_pago: this.saldoMetodo() })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.notifications.success('Saldo cobrado correctamente');
          this.cerrarSaldoModal();
          this.enviando.set(false);
          this.load(a.id);
        },
        error: (err) => {
          this.notifications.error(err?.error?.message || 'Error al cobrar saldo');
          this.enviando.set(false);
        },
      });
  }

  // ── Upload helpers ──
  onFotoSelected(index: number, event: Event, isEntrega: boolean): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const fotos = isEntrega ? this.entregaFotos : this.devolucionFotos;
    fotos.update((list) => {
      const updated = [...list];
      updated[index] = { ...updated[index], file, url: '', uploading: true };
      return updated;
    });

    this.admin.uploadInspeccionFoto(file).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        fotos.update((list) => {
          const updated = [...list];
          updated[index] = { ...updated[index], url: res.url, uploading: false };
          return updated;
        });
      },
      error: () => {
        this.notifications.error('Error al subir foto');
        fotos.update((list) => {
          const updated = [...list];
          updated[index] = { ...updated[index], uploading: false };
          return updated;
        });
      },
    });
  }

  toggleAccesorio(nombre: string, isEntrega: boolean): void {
    const accs = isEntrega ? this.entregaAccesorios : this.devolucionAccesorios;
    accs.update((list) =>
      list.map((a) => (a.nombre === nombre ? { ...a, presente: !a.presente } : a)),
    );
  }

  // ── Entrega ──
  abrirEntregaModal(): void {
    const a = this.alquiler();
    if (!a) return;
    this.entregaKm.set(a.kilometraje_inicial || 0);
    this.entregaCombustible.set(a.nivel_combustible_inicial || '1/1');
    this.entregaAccesorios.set(ACCESORIOS_POR_DEFECTO.map((n) => ({ nombre: n, presente: true })));
    this.entregaFotos.set(TIPOS_FOTO.map((t) => ({ tipo: t, file: null, url: '', uploading: false })));
    this.entregaCarroceria.set('SIN DAÑOS');
    this.entregaInterior.set('LIMPIO Y EN ORDEN');
    this.entregaObs.set('');
    this.showEntregaModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarEntregaModal(): void {
    this.showEntregaModal.set(false);
    document.body.style.overflow = '';
  }

  entregarVehiculo(): void {
    const a = this.alquiler();
    if (!a) return;
    this.enviando.set(true);

    const fotosSubidas = this.entregaFotos().filter((f) => f.url);
    const accesorios = this.entregaAccesorios().map((a) => ({
      nombre_accesorio: a.nombre,
      presente: a.presente,
    }));
    const fotos = fotosSubidas.map((f) => ({ tipo_foto: f.tipo, url: f.url }));

    this.admin.entregarRental(a.id, {
      inspeccion: {
        kilometraje: this.entregaKm(),
        nivel_combustible: this.entregaCombustible(),
        estado_carroceria: this.entregaCarroceria(),
        estado_interior: this.entregaInterior(),
        observaciones: this.entregaObs() || undefined,
        accesorios: accesorios as AccesorioRequest[],
        fotos: fotos as FotoRequest[],
      } as unknown as Record<string, unknown>,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifications.success('Vehículo entregado correctamente');
        this.cerrarEntregaModal();
        this.enviando.set(false);
        this.load(a.id);
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al entregar vehículo');
        this.enviando.set(false);
      },
    });
  }

  // ── Devolución ──
  abrirDevolucionModal(): void {
    const a = this.alquiler();
    if (!a) return;
    this.devolucionKm.set(a.kilometraje_final || 0);
    this.devolucionCombustible.set(a.nivel_combustible_final || '1/1');
    this.devolucionAccesorios.set(ACCESORIOS_POR_DEFECTO.map((n) => ({ nombre: n, presente: true })));
    this.devolucionFotos.set(TIPOS_FOTO.map((t) => ({ tipo: t, file: null, url: '', uploading: false })));
    this.devolucionCarroceria.set('SIN DAÑOS');
    this.devolucionInterior.set('LIMPIO Y EN ORDEN');
    this.devolucionObs.set('');
    this.danosLista.set([]);
    this.nuevoDanoDesc.set('');
    this.nuevoDanoCosto.set(0);
    this.showDevolucionModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarDevolucionModal(): void {
    this.showDevolucionModal.set(false);
    document.body.style.overflow = '';
  }

  agregarDano(): void {
    if (!this.nuevoDanoDesc() || this.nuevoDanoCosto() <= 0) return;
    this.danosLista.update((list) => [
      ...list,
      { descripcion: this.nuevoDanoDesc(), costo: this.nuevoDanoCosto() },
    ]);
    this.nuevoDanoDesc.set('');
    this.nuevoDanoCosto.set(0);
  }

  quitarDano(idx: number): void {
    this.danosLista.update((list) => list.filter((_, i) => i !== idx));
  }

  devolverVehiculo(): void {
    const a = this.alquiler();
    if (!a) return;
    this.enviando.set(true);

    const fotosSubidas = this.devolucionFotos().filter((f) => f.url);
    const accesorios = this.devolucionAccesorios().map((a) => ({
      nombre_accesorio: a.nombre,
      presente: a.presente,
    }));
    const fotos = fotosSubidas.map((f) => ({ tipo_foto: f.tipo, url: f.url }));

    this.admin.devolverRental(a.id, {
      inspeccion: {
        kilometraje: this.devolucionKm(),
        nivel_combustible: this.devolucionCombustible(),
        estado_carroceria: this.devolucionCarroceria(),
        estado_interior: this.devolucionInterior(),
        observaciones: this.devolucionObs() || undefined,
        accesorios: accesorios as AccesorioRequest[],
        fotos: fotos as FotoRequest[],
      } as unknown as Record<string, unknown>,
      danos: this.danosLista().length > 0 ? this.danosLista() : undefined,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifications.success('Vehículo devuelto correctamente');
        this.cerrarDevolucionModal();
        this.enviando.set(false);
        this.load(a.id);
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al devolver vehículo');
        this.enviando.set(false);
      },
    });
  }

  // ── Completar devolución ──
  completarDevolucion(): void {
    const a = this.alquiler();
    if (!a) return;
    if (!confirm('¿Completar la devolución? El vehículo volverá a estar disponible.')) return;
    this.enviando.set(true);
    this.admin.completarDevolucionRental(a.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifications.success('Devolución completada');
        this.enviando.set(false);
        this.load(a.id);
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al completar devolución');
        this.enviando.set(false);
      },
    });
  }

  // ── Anular ──
  anular(): void {
    const a = this.alquiler();
    if (!a) return;
    const motivo = prompt('Motivo de anulación:');
    if (motivo === null) return;
    this.enviando.set(true);
    this.admin.anularRental(a.id, motivo || undefined).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.notifications.success('Reserva anulada');
        this.enviando.set(false);
        this.load(a.id);
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al anular reserva');
        this.enviando.set(false);
      },
    });
  }

  // ── Penalidades ──
  abrirCobrarPenalidadesModal(): void {
    const a = this.alquiler();
    if (!a) return;
    const total = (a.penalidades || [])
      .filter((p) => p.estado === 'PENDIENTE')
      .reduce((s, p) => s + Number(p.monto), 0);
    this.totalPenalidades.set(total);
    this.metodoPagoPenalidad.set('TARJETA_CREDITO');
    this.showCobrarPenalidadesModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarCobrarPenalidadesModal(): void {
    this.showCobrarPenalidadesModal.set(false);
    document.body.style.overflow = '';
  }

  cobrarPenalidades(): void {
    const a = this.alquiler();
    if (!a) return;
    this.enviando.set(true);
    this.admin.cobrarPenalidades(a.id, this.metodoPagoPenalidad())
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.notifications.success('Penalidades cobradas correctamente');
          this.cerrarCobrarPenalidadesModal();
          this.enviando.set(false);
          this.load(a.id);
        },
        error: (err) => {
          this.notifications.error(err?.error?.message || 'Error al cobrar penalidades');
          this.enviando.set(false);
        },
      });
  }

  // ── Reporte ──
  abrirReporteModal(): void {
    const a = this.alquiler();
    if (!a) return;
    this.cargandoReporte.set(true);
    this.showReporteModal.set(true);
    document.body.style.overflow = 'hidden';
    this.admin.getReporteDevolucion(a.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.reporte.set(data);
        this.cargandoReporte.set(false);
      },
      error: () => {
        this.notifications.error('Error al cargar reporte');
        this.cargandoReporte.set(false);
        this.showReporteModal.set(false);
        document.body.style.overflow = '';
      },
    });
  }

  cerrarReporteModal(): void {
    this.showReporteModal.set(false);
    this.reporte.set(null);
    document.body.style.overflow = '';
  }

  tienePenalidadesPendientes(): boolean {
    return (this.alquiler()?.penalidades || []).some((p) => p.estado === 'PENDIENTE');
  }

  // ── Helpers ──
  estadoLabel(estado: string): string {
    return ESTADO_LABELS[estado] || estado;
  }

  estadoClass(estado: string): string {
    return ESTADO_CLASS[estado] || '';
  }

  esCliente(): boolean {
    return this.auth.roleName() === 'CLIENTE';
  }

  parseNum(v: any): number {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  totalPenalidadesAlquiler(): number {
    return (this.alquiler()?.penalidades || []).reduce((s, p) => s + Number(p.monto), 0);
  }
}
