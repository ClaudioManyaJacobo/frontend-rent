import { Component, OnInit } from '@angular/core';
import { RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Router } from '@angular/router';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';
import { LoadingComponent } from './shared/components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationsComponent, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  isLoading = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Mostrar loading en cada navegación entre rutas (lazy routes)
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Pequeño delay para que el video se vea al menos un momento
        setTimeout(() => (this.isLoading = false), 600);
      }
    });
  }
}
