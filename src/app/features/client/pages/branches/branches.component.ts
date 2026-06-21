import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClientCatalogService } from '../../services/client-catalog.service';
import { Sucursal } from '../../../../shared/models/admin/branch.model';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [RouterModule],
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
}
