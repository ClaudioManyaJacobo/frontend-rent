import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss',
})
export class ClientLayoutComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly year = new Date().getFullYear();

  protected navbarVisible = signal(true);
  protected pinned = signal(localStorage.getItem('nav-pinned') === 'true');
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    if (!this.pinned()) {
      this.resetHideTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearHideTimer();
  }

  @HostListener('document:mousemove', ['$event'])
  onDocMouseMove(e: MouseEvent): void {
    if (this.pinned()) return;
    if (document.body.classList.contains('modal-rental-open')) return;
    if (e.clientY <= 120) {
      this.show();
    } else if (!this.hideTimer && this.navbarVisible()) {
      this.startHiding();
    }
  }

  togglePin(): void {
    const next = !this.pinned();
    this.pinned.set(next);
    localStorage.setItem('nav-pinned', String(next));
    if (next) {
      this.navbarVisible.set(true);
      this.clearHideTimer();
    } else {
      this.resetHideTimer();
    }
  }

  show(): void {
    this.navbarVisible.set(true);
    this.clearHideTimer();
  }

  startHiding(): void {
    if (this.pinned()) return;
    this.resetHideTimer();
  }

  private resetHideTimer(): void {
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => this.navbarVisible.set(false), 3000);
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
