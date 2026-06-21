import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { homeRouteForRole, resolveRoleName } from '../../shared/utils/role-utils';

/** Login/registro solo para invitados; si ya hay sesión, redirige al panel del rol. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  const role = resolveRoleName(auth.currentUser());
  return router.createUrlTree([homeRouteForRole(role)]);
};
