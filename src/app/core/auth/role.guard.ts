import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { hasRole, homeRouteForRole, resolveRoleName } from './auth-role.util';
import { NotificationService } from '../services/notification.service';

/**
 * Guarda por rol usando la sesión (`auth.currentUser()`).
 * - Si no coincide, redirige al home correcto según el rol actual.
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const notifications = inject(NotificationService);

    const user = auth.currentUser();
    const role = resolveRoleName(user);
    if (!role) {
      return router.createUrlTree(['/auth/login']);
    }

    if (hasRole(user, allowedRoles)) {
      return true;
    }

    notifications.error('No tienes permiso para acceder a esta sección');
    return router.createUrlTree([homeRouteForRole(role)]);
  };
};

