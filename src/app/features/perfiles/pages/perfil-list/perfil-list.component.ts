import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PerfilesService } from '../../services/perfiles.service';
import { Perfil } from '../../../../shared/models/perfil.model';

@Component({
  selector: 'app-perfil-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './perfil-list.component.html',
  styleUrl: './perfil-list.component.scss',
})
export class PerfilListComponent implements OnInit {
  private readonly perfilesService = inject(PerfilesService);

  readonly perfiles = signal<Perfil[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.perfilesService.findAll().subscribe({
      next: (data) => {
        this.perfiles.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
