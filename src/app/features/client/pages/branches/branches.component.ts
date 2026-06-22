import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClientCatalogService } from '../../services/client-catalog.service';
import { Sucursal } from '../../../../shared/models/admin/branch.model';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss'
})
export class BranchesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(ClientCatalogService);

  empresaId = signal<string>('');
  sucursales = signal<Sucursal[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  sucursalDetalle = signal<Sucursal | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('empresaId');
      if (id) {
        this.empresaId.set(id);
        this.loadSucursales(id);
      } else {
        this.router.navigate(['/cliente/empresas']);
      }
    });
  }

  loadSucursales(empresaId: string) {
    this.loading.set(true);
    this.catalogService.getSucursalesByEmpresa(empresaId).subscribe({
      next: (res) => {
        this.sucursales.set(res.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar las sucursales. Inténtalo más tarde.');
        this.loading.set(false);
      }
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(w => w.length > 0)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');
  }

  abrirDetalle(s: Sucursal): void {
    this.sucursalDetalle.set(s);
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalle(): void {
    this.sucursalDetalle.set(null);
    document.body.style.overflow = '';
  }

  verEnGoogleMaps(s: Sucursal): string {
    return `https://www.google.com/maps?q=${s.latitud},${s.longitud}`;
  }
}
