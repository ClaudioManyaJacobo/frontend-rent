import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, SlicePipe } from '@angular/common';
import { Subject, finalize, takeUntil } from 'rxjs';
import { AlquileresService } from '../../services/alquileres.service';
import { Alquiler, AlquilerEstado, ESTADO_LABELS, ESTADO_CLASS } from '../../../../shared/models/alquiler.model';
import { PaginationMeta } from '../../../../shared/models/api-response.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { formatRemainingTime } from '../../../../shared/utils/date-utils';

@Component({
  selector: 'app-alquileres-list',
  standalone: true,
  imports: [CurrencyPipe, SlicePipe],
  templateUrl: './alquileres-list.component.html',
  styleUrl: './alquileres-list.component.scss',
})
export class AlquileresListComponent implements OnInit, OnDestroy {
  private readonly alquileresService = inject(AlquileresService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  private readonly destroy$ = new Subject<void>();
  private now = signal(Date.now());
  private timerRef: ReturnType<typeof setInterval> | null = null;

  readonly alquileres = signal<Alquiler[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly filterEstado = signal<string>('');

  readonly estados = Object.keys(ESTADO_LABELS);

  ngOnInit(): void {
    this.load();
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

  load(): void {
    this.loading.set(true);
    this.alquileresService.findAll({
      page: this.page(),
      limit: 10,
      estado: (this.filterEstado() || undefined) as AlquilerEstado | undefined,
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (res) => {
        this.alquileres.set(res.data ?? []);
        this.meta.set(res.data ? res.meta : null);
      },
    });
  }

  goToDetail(id: string): void {
    this.router.navigate(['/alquileres', id]);
  }

  estadoLabel(estado: string): string {
    return ESTADO_LABELS[estado] || estado;
  }

  estadoClass(estado: string): string {
    return ESTADO_CLASS[estado] || '';
  }

  onFilterChange(estado: string): void {
    this.filterEstado.set(estado);
    this.page.set(1);
    this.load();
  }

  prevPage(): void {
    if (this.meta()?.hasPreviousPage) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.meta()?.hasNextPage) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }
}
