import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Guarda por rol usando `auth.currentUser()?.role`.
 * - Si no coincide, redirige al home correcto según el rol actual.
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.currentUser()?.role;
    if (!role) {
      return router.createUrlTree(['/auth/login']);
    }

    if (allowedRoles.includes(role)) {
      return true;
    }

    const home = role === 'CLIENTE' ? '/cliente' : '/dashboard';
    return router.createUrlTree([home]);
  };
};

