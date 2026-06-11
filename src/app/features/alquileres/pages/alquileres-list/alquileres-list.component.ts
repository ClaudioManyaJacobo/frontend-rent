import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, CurrencyPipe, SlicePipe } from '@angular/common';
import { AlquileresService } from '../../services/alquileres.service';
import { Alquiler, AlquilerEstado, ESTADO_LABELS, ESTADO_CLASS } from '../../../../shared/models/alquiler.model';
import { PaginationMeta } from '../../../../shared/models/api-response.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-alquileres-list',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, SlicePipe],
  templateUrl: './alquileres-list.component.html',
  styleUrl: './alquileres-list.component.scss',
})
export class AlquileresListComponent implements OnInit {
  private readonly alquileresService = inject(AlquileresService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly alquileres = signal<Alquiler[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly filterEstado = signal<string>('');

  readonly estados = Object.keys(ESTADO_LABELS);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.alquileresService.findAll({
      page: this.page(),
      limit: 10,
      estado: (this.filterEstado() || undefined) as AlquilerEstado | undefined,
    }).subscribe({
      next: (res) => {
        this.alquileres.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
