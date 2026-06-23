import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: SafeHtml;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  readonly #sanitizer = inject(DomSanitizer);
  readonly auth = inject(AuthService);

  readonly prefix = computed(() => {
    const role = this.auth.roleName();
    if (role === 'SUPER_ADMIN') return '/super-admin';
    if (role === 'ADMIN') return '/admin';
    if (role === 'EMPLEADO') return '/empleado';
    return '/admin';
  });

  readonly hasProfile = computed(() => !!this.auth.currentUser()?.perfil?.id);
  readonly profileId = computed(() => this.auth.currentUser()?.perfil?.id);

  #svg(content: string): SafeHtml {
    return this.#sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">${content}</svg>`,
    );
  }

  readonly #I = {
    dashboard: this.#svg(
      '<path d="M9.653 2.29a.75.75 0 0 1 .694 0l7 3.5a.75.75 0 0 1 .403.66v8.8a.75.75 0 0 1-.403.66l-7 3.5a.75.75 0 0 1-.694 0l-7-3.5a.75.75 0 0 1-.403-.66v-8.8a.75.75 0 0 1 .403-.66l7-3.5Z"/>',
    ),
    empresas: this.#svg(
      '<path fill-rule="evenodd" d="M4 16.5v-13h-.5a.75.75 0 0 1 0-1.5h13a.75.75 0 0 1 0 1.5H16v13h.5a.75.75 0 0 1 0 1.5h-13a.75.75 0 0 1 0-1.5H4Zm3-11h2.5v1.5H7V5.5Zm0 3h2.5v1.5H7V8.5Zm0 3h2.5v1.5H7v-1.5ZM12.5 5.5H15v1.5h-2.5V5.5Zm0 3H15v1.5h-2.5V8.5Zm0 3H15v1.5h-2.5v-1.5Z" clip-rule="evenodd"/>',
    ),
    usuarios: this.#svg(
      '<path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z"/>',
    ),
    empleados: this.#svg(
      '<path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM14 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM2.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 10 18a9.953 9.953 0 0 1-7.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z"/>',
    ),
    modulos: this.#svg(
      '<path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v3A1.5 1.5 0 0 0 3.5 8h3A1.5 1.5 0 0 0 8 6.5v-3A1.5 1.5 0 0 0 6.5 2h-3ZM11.5 2A1.5 1.5 0 0 0 10 3.5v3A1.5 1.5 0 0 0 11.5 8h3A1.5 1.5 0 0 0 16 6.5v-3A1.5 1.5 0 0 0 14.5 2h-3ZM3.5 10A1.5 1.5 0 0 0 2 11.5v3A1.5 1.5 0 0 0 3.5 16h3A1.5 1.5 0 0 0 8 14.5v-3A1.5 1.5 0 0 0 6.5 10h-3ZM11.5 10A1.5 1.5 0 0 0 10 11.5v3A1.5 1.5 0 0 0 11.5 16h3A1.5 1.5 0 0 0 16 14.5v-3A1.5 1.5 0 0 0 14.5 10h-3Z"/>',
    ),
    permisos: this.#svg(
      '<path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 0 0-6 0V9h6Z" clip-rule="evenodd"/>',
    ),
    roles: this.#svg(
      '<path fill-rule="evenodd" d="M1 4.5A1.5 1.5 0 0 1 2.5 3h11A1.5 1.5 0 0 1 15 4.5v1.454l4.37 1.747A.75.75 0 0 1 20 8.39v4.22a.75.75 0 0 1-.63.74l-4.37.873V16.5A1.5 1.5 0 0 1 13.5 18h-11A1.5 1.5 0 0 1 1 16.5v-12ZM15 12.127l4 .8V8.073l-4 .8v3.254ZM6.5 8.25a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9.75 12a.75.75 0 0 0 0 1.5h-6.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5A.75.75 0 0 0 3 12h6.75Z" clip-rule="evenodd"/>',
    ),
    sucursales: this.#svg(
      '<path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clip-rule="evenodd"/>',
    ),
    servicios: this.#svg(
      '<path fill-rule="evenodd" d="M18.28 4.72a.75.75 0 0 1 0 1.06l-5.22 5.22 1.06 1.06a.75.75 0 0 1-.33 1.22 5.31 5.31 0 0 1-5.15-1.72l-4.13 4.13A1.5 1.5 0 0 1 2.5 14.5V11.5a.75.75 0 0 1 1.5 0v1.69l3.75-3.75a5.31 5.31 0 0 1-.22-5.83.75.75 0 0 1 1.22.32l1.06 2.12 3.66-3.66a2.5 2.5 0 0 1 3.53 0l1.06 1.06a2.5 2.5 0 0 1 .22 3.27Z" clip-rule="evenodd"/>',
    ),
    categorias: this.#svg(
      '<path fill-rule="evenodd" d="M5.5 3A2.5 2.5 0 0 0 3 5.5v2.879a2.5 2.5 0 0 0 .732 1.767l6.5 6.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-6.5-6.5A2.5 2.5 0 0 0 8.38 3H5.5ZM6 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/>',
    ),
    vehiculos: this.#svg(
      '<path d="M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 0 0 2 4.607V10.5h7V3H6.5ZM14 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM15 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path fill-rule="evenodd" d="M1.5 12.5A1.5 1.5 0 0 1 3 11h10.5a1.5 1.5 0 0 1 1.5 1.5v.5h.5a1.5 1.5 0 0 0 1.5-1.5V6.622a1.5 1.5 0 0 0-.683-1.268l-2.2-1.382A1.5 1.5 0 0 0 13.164 3H12v4.5a1.5 1.5 0 0 1-1.5 1.5H3v3.5ZM3 6.5A1.5 1.5 0 0 1 4.5 5h2A1.5 1.5 0 0 1 8 6.5v1A1.5 1.5 0 0 1 6.5 9h-2A1.5 1.5 0 0 1 3 7.5v-1Z" clip-rule="evenodd"/>',
    ),
    reservas: this.#svg(
      '<path d="M5.25 2a.75.75 0 0 1 .75.75V3h8v-.25a.75.75 0 0 1 1.5 0V3h.5A1.5 1.5 0 0 1 17 4.5v1.25H3V4.5A1.5 1.5 0 0 1 4.5 3h.5v-.25A.75.75 0 0 1 5.25 2Z"/><path fill-rule="evenodd" d="M3 7.25V16.5A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.25H3Zm4.5 2a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-1.5Zm5 0a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-1.5Z" clip-rule="evenodd"/>',
    ),
    alquileres: this.#svg(
      '<path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm3.75 8.25a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5ZM8 14a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5A.75.75 0 0 1 8 14Zm-.75-4.5a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Zm3 0a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Zm-3 3a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Zm3 0a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM6.5 8a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Zm3 0a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5Z" clip-rule="evenodd"/>',
    ),
    perfil: this.#svg(
      '<path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"/>',
    ),
    buscar: this.#svg(
      '<path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd"/>',
    ),
  };

  readonly navSections = computed((): NavSection[] => {
    const role = this.auth.roleName();
    const sections: NavSection[] = [];

    const perfilItem: NavItem | null = this.hasProfile()
      ? { label: 'Mi Perfil', route: `/perfiles/${this.profileId()}/edit`, icon: this.#I.perfil }
      : null;

    if (role === 'SUPER_ADMIN') {
      sections.push({
        title: 'Panel',
        items: [{ label: 'Dashboard', route: '/dashboard', icon: this.#I.dashboard }],
      });
      sections.push({
        title: 'Administración',
        items: [
          { label: 'Empresas', route: '/empresas', icon: this.#I.empresas },
          { label: 'Usuarios', route: '/usuarios', icon: this.#I.usuarios },
          { label: 'Empleados', route: '/empleados', icon: this.#I.empleados },
        ],
      });
      sections.push({
        title: 'Seguridad',
        items: [
          { label: 'Módulos', route: '/modulos', icon: this.#I.modulos },
          { label: 'Permisos', route: '/permisos', icon: this.#I.permisos },
          { label: 'Roles', route: '/roles', icon: this.#I.roles },
        ],
      });
      sections.push({
        title: 'Operaciones',
        items: [
          { label: 'Sucursales', route: '/sucursales', icon: this.#I.sucursales },
          { label: 'Servicios', route: '/servicios-adicionales', icon: this.#I.servicios },
          { label: 'Categorías', route: '/categorias-vehiculos', icon: this.#I.categorias },
          { label: 'Vehículos', route: '/vehiculos', icon: this.#I.vehiculos },
          { label: 'Reservas', route: '/reservas', icon: this.#I.reservas },
          { label: 'Alquileres', route: '/alquileres', icon: this.#I.alquileres },
        ],
      });
      if (perfilItem) {
        sections.push({ title: 'Cuenta', items: [perfilItem] });
      }
    } else if (role === 'ADMIN') {
      sections.push({
        title: 'Panel',
        items: [{ label: 'Dashboard', route: '/dashboard', icon: this.#I.dashboard }],
      });
      sections.push({
        title: 'Operaciones',
        items: [
          { label: 'Sucursales', route: '/sucursales', icon: this.#I.sucursales },
          { label: 'Empleados', route: '/empleados', icon: this.#I.empleados },
          { label: 'Servicios', route: '/servicios-adicionales', icon: this.#I.servicios },
          { label: 'Categorías', route: '/categorias-vehiculos', icon: this.#I.categorias },
          { label: 'Vehículos', route: '/vehiculos', icon: this.#I.vehiculos },
          { label: 'Reservas', route: '/reservas', icon: this.#I.reservas },
          { label: 'Alquileres', route: '/alquileres', icon: this.#I.alquileres },
        ],
      });
      if (perfilItem) {
        sections.push({ title: 'Cuenta', items: [perfilItem] });
      }
    } else if (role === 'EMPLEADO') {
      sections.push({
        title: 'Panel',
        items: [{ label: 'Dashboard', route: '/dashboard', icon: this.#I.dashboard }],
      });
      sections.push({
        title: 'Operaciones',
        items: [{ label: 'Buscar Reserva', route: '/buscar-reserva', icon: this.#I.buscar }],
      });
      if (perfilItem) {
        sections.push({ title: 'Cuenta', items: [perfilItem] });
      }
    }

    return sections;
  });
}
