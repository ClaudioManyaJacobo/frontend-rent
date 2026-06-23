import { Component, computed, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../../core/services/auth.service';
import { DashboardService } from '../../dashboard.service';
import type { DashboardStats } from '../../models/dashboard-stats.model';

Chart.register(...registerables);

const CATEGORIA_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#f97316',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, LowerCasePipe, PeruDateTimePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  @ViewChild('vehiculosCategoriaChart') vehiculosCatCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('alquileresCategoriaChart') alquileresCatCanvas!: ElementRef<HTMLCanvasElement>;

  readonly role = computed(() => this.auth.roleName());
  readonly perfilId = computed(() => this.auth.currentUser()?.perfil?.id ?? null);

  readonly prefix = computed(() => {
    const r = this.role();
    if (r === 'SUPER_ADMIN') return '/super-admin';
    if (r === 'ADMIN') return '/admin';
    if (r === 'EMPLEADO') return '/empleado';
    return '/admin';
  });

  stats: DashboardStats | null = null;
  loading = true;

  private vehiculosCatChartInstance: Chart | null = null;
  private alquileresCatChartInstance: Chart | null = null;

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        setTimeout(() => this.buildCharts());
      },
      error: (err) => {
        console.error('Dashboard stats error:', err);
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.vehiculosCatChartInstance?.destroy();
    this.alquileresCatChartInstance?.destroy();
  }

  private buildCharts(): void {
    if (!this.stats) return;
    if (this.role() !== 'SUPER_ADMIN') {
      this.buildVehiculosCategoriaChart();
      this.buildAlquileresCategoriaChart();
    }
  }

  private buildVehiculosCategoriaChart(): void {
    if (!this.vehiculosCatCanvas?.nativeElement || !this.stats?.vehiculosPorCategoria?.length) return;
    const data = this.stats.vehiculosPorCategoria;
    this.vehiculosCatChartInstance?.destroy();
    this.vehiculosCatChartInstance = new Chart(this.vehiculosCatCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.categoria),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: CATEGORIA_COLORS.slice(0, data.length),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' as const },
        },
      },
    });
  }

  private buildAlquileresCategoriaChart(): void {
    if (!this.alquileresCatCanvas?.nativeElement || !this.stats?.alquileresPorCategoria?.length) return;
    const data = this.stats.alquileresPorCategoria;
    this.alquileresCatChartInstance?.destroy();
    this.alquileresCatChartInstance = new Chart(this.alquileresCatCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.categoria),
        datasets: [
          {
            label: 'Alquileres',
            data: data.map((d) => d.count),
            backgroundColor: CATEGORIA_COLORS.slice(0, data.length),
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { grid: { display: false } },
        },
      },
    });
  }
}
