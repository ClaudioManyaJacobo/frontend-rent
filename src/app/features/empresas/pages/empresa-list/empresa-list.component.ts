import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmpresasService } from '../../services/empresas.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Empresa } from '../../../../shared/models/empresa.model';
import { PaginationMeta } from '../../../../shared/models/api-response.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-empresa-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.scss',
})
export class EmpresaListComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly empresasService = inject(EmpresasService);
  private readonly notifications = inject(NotificationService);

  readonly empresas = signal<Empresa[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly limit = 10;
  readonly role = computed(() => this.auth.currentUser()?.role ?? null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.empresasService.findAll(this.page(), this.limit).subscribe({
      next: (res) => {
        this.empresas.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
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

  remove(id: string, nombre: string): void {
    if (!confirm(`¿Eliminar empresa ${nombre}?`)) return;
    this.empresasService.remove(id).subscribe({
      next: () => {
        this.notifications.success('Empresa eliminada');
        this.load();
      },
    });
  }
}
