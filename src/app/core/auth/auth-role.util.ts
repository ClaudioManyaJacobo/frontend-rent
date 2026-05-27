/** Normaliza el rol desde sesión (string o `{ nombre }` legacy). */
export function resolveRoleName(
  user: { role?: unknown } | null | undefined,
): string | null {
  if (!user) return null;
  const role = user.role;
  if (typeof role === 'string' && role.trim()) {
    return role.trim();
  }
  if (role && typeof role === 'object' && 'nombre' in role) {
    const nombre = (role as { nombre?: unknown }).nombre;
    if (typeof nombre === 'string' && nombre.trim()) {
      return nombre.trim();
    }
  }
  return null;
}

export function hasRole(
  user: { role?: unknown } | null | undefined,
  allowed: string[],
): boolean {
  const role = resolveRoleName(user);
  return !!role && allowed.includes(role);
}

/** Ruta home según rol (invitado → área pública cliente). */
export function homeRouteForRole(role: string | null): string {
  if (role === 'CLIENTE') return '/cliente';
  if (
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'EMPLEADO'
  ) {
    return '/dashboard';
  }
  return '/cliente';
}
