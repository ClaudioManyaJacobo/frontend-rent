import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Alquiler } from '../../../../shared/models/rental/rental.model';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-devolucion',
  standalone: true,
  imports: [RouterLink, PeruDateTimePipe],
  templateUrl: './devolucion.component.html',
  styleUrl: './devolucion.component.scss',
})
export class DevolucionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly alquiler = signal<Alquiler | null>(null);
  readonly loading = signal(true);
  readonly enviando = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('alquilerId');
    if (id) {
      this.admin.getRental(id).pipe(finalize(() => this.loading.set(false))).subscribe({
        next: (data) => this.alquiler.set(data),
      });
    }
  }

  confirmarDevolucion(): void {
    const a = this.alquiler();
    if (!a) return;

    this.enviando.set(true);
    this.admin.devolverRental(a.id).pipe(
      finalize(() => this.enviando.set(false)),
    ).subscribe({
      next: () => {
        this.notifications.success('Devolución registrada');
        void this.router.navigate(['/empleado/liquidacion', a.id]);
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al registrar devolución'),
    });
  }
}
