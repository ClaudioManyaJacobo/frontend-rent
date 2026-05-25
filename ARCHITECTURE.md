# Arquitectura Frontend (Angular)

Estructura orientada a **features** con capa **core** compartida. Permite escalar agregando módulos sin acoplar el resto de la app.

```
frontend/src/app/
├── core/                          # Singleton: infraestructura global
│   ├── auth/                      # Sesión JWT, guards
│   ├── http/                      # ApiService + interceptors
│   ├── layout/                    # Shell principal y auth
│   └── services/                  # NotificationService, etc.
├── shared/                        # Reutilizable entre features
│   ├── models/                    # Tipos alineados con back-nest
│   └── components/                # UI genérica (badges, alerts)
├── features/                      # Dominios de negocio (lazy-loaded)
│   ├── auth/                      # login, register
│   ├── dashboard/
│   ├── users/                     # CRUD usuarios
│   ├── perfiles/                  # Listado y edición de perfiles
│   ├── empresas/                  # CRUD + paginación
│   └── roles/                     # Solo lectura
├── app.config.ts                  # Providers globales (HTTP, router)
└── app.routes.ts                  # Rutas raíz + lazy loading
```

## Principios

| Capa | Responsabilidad |
|------|-----------------|
| **core** | HTTP, JWT, guards, layout. No depende de features. |
| **shared** | Modelos y componentes UI sin lógica de negocio. |
| **features** | Páginas, rutas y servicios por dominio (users, empresas…). |
| **environments** | `apiUrl` por entorno (dev usa proxy `/api` → Nest en :3000). |

## Flujo de datos

```
Component → FeatureService → ApiService → HttpClient (+ interceptors) → back-nest
```

- **authInterceptor**: adjunta `Authorization: Bearer <token>`.
- **errorInterceptor**: normaliza errores del `HttpExceptionFilter` de Nest.

## Rutas

| Ruta | Feature | Backend |
|------|---------|---------|
| `/auth/login` | auth | POST `/auth/login` |
| `/auth/register` | auth | POST `/auth/register` |
| `/dashboard` | dashboard | — |
| `/users` | users | CRUD `/users` |
| `/perfiles` | perfiles | GET/PATCH `/perfiles` |
| `/empresas` | empresas | CRUD `/empresas` (paginado) |
| `/roles` | roles | GET `/roles` |

## Convención de componentes

Cada componente vive en su carpeta con **tres archivos**:

```
nombre/
├── nombre.component.ts
├── nombre.component.html
└── nombre.component.scss
```

Estilos compartidos en `shared/styles/` (`_page.scss`, `_auth-forms.scss`). Sin templates ni estilos inline en `.ts`.

## Escalado futuro

1. Nuevo dominio → carpeta `features/<nombre>/` + `*.routes.ts` lazy en `app.routes.ts`.
2. Permisos por rol → `role.guard.ts` en `core/auth` sin tocar features existentes.
3. Estado global → NgRx/Signals store solo en el feature que lo necesite.
4. i18n → `@angular/localize` por feature.
