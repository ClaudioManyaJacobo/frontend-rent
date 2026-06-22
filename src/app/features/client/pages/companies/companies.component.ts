import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Empresa } from '../../../../shared/models/admin/company.model';
import { PaginationMeta } from '../../../../shared/models/api-response.model';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss',
})
export class CompaniesComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly empresas = signal<Empresa[]>([]);
  readonly loading = signal(true);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly search = signal('');

  readonly page = signal(1);
  readonly limit = 12;

  readonly filteredEmpresas = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = this.empresas();
    if (!q) return list;
    return list.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.ruc.includes(q) ||
        e.direccion.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin.getCompanies(this.page(), this.limit).subscribe({
      next: (res) => {
        this.empresas.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.notifications.error('No se pudieron cargar las empresas');
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  initials(nombre: string): string {
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  cardAccent(id: string): string {
    const hues = [175, 200, 220, 250, 280, 310];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hues[Math.abs(hash) % hues.length];
    return `hsl(${hue}, 55%, 42%)`;
  }

  prevPage(): void {
    if (!this.meta()?.hasPreviousPage) return;
    this.page.update((p) => p - 1);
    this.load();
  }

  nextPage(): void {
    if (!this.meta()?.hasNextPage) return;
    this.page.update((p) => p + 1);
    this.load();
  }
}
