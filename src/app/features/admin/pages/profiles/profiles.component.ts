import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { Perfil } from '../../../../shared/models/user/profile.model';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss',
})
export class ProfilesComponent implements OnInit {
  private readonly admin = inject(AdminService);

  readonly perfiles = signal<Perfil[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.admin.getProfiles().subscribe({
      next: (data) => {
        this.perfiles.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
