import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { homeRouteForRole, resolveRoleName } from '../../shared/utils/role-utils';

/** Portal cliente: solo público o rol CLIENTE. Admins/empleados redirigidos a su panel. */
export const clientGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  const role = resolveRoleName(auth.currentUser());
  if (role === 'CLIENTE') {
    return true;
  }

  return router.createUrlTree([homeRouteForRole(role)]);
};
