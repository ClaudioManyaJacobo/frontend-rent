import { Component, inject, signal, HostListener } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss',
})
export class ClientLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly year = new Date().getFullYear();
  readonly dropdownOpen = signal(false);
  readonly rentaYaDropdownOpen = signal(false);
  readonly isScrolled = signal(false);

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
    this.rentaYaDropdownOpen.set(false); // Cerrar el de renta ya si se abre el de usuario
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  toggleRentaYaDropdown(event: Event): void {
    event.stopPropagation();
    this.rentaYaDropdownOpen.update(v => !v);
    this.dropdownOpen.set(false); // Cerrar el de usuario si se abre el de renta ya
  }

  closeAllDropdowns(): void {
    this.dropdownOpen.set(false);
    this.rentaYaDropdownOpen.set(false);
  }

  isRentaYaRouteActive(): boolean {
    const url = this.router.url;
    return (
      url.includes('/cliente/empresas') ||
      url.includes('/cliente/vehiculos') ||
      url.includes('/cliente/sucursales')
    );
  }

  logout(): void {
    this.closeAllDropdowns();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Clic fuera del dropdown de usuario
    if (!target.closest('.user-avatar-btn') && !target.closest('.user-dropdown-menu')) {
      this.dropdownOpen.set(false);
    }
    
    // Clic fuera del dropdown de Renta Ya
    if (!target.closest('.renta-ya-dropdown-btn') && !target.closest('.renta-ya-dropdown-menu')) {
      this.rentaYaDropdownOpen.set(false);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }
}

