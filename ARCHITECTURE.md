# VRS Frontend — Arquitectura

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Angular 19 |
| Lenguaje | TypeScript 5 (strict mode) |
| Estilos | SCSS |
| Mapas | Leaflet + @types/leaflet |
| Gráficos | Chart.js |
| Testing | Karma + Jasmine |

---

## Estructura completa del proyecto

```
frontend/
│
├── .editorconfig
├── .gitignore
│
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
│
├── angular.json
├── package.json
├── package-lock.json
├── proxy.conf.json                       # Dev: /api → http://localhost:3000
├── tsconfig.json                         # strict: true
├── tsconfig.app.json
├── tsconfig.spec.json
│
├── ARCHITECTURE.md
├── README.md
│
├── public/                          # Raíz de contenido estático → /
│   ├── favicon.ico                   # Referencia: /favicon.ico
│   ├── logo.png                      # Referencia: /logo.png
│   └── logos.png                     # Referencia: /logos.png
│
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss
    │
    ├── environments/
    │   ├── environment.ts                    # apiUrl = 'http://localhost:3000'
    │   └── environment.development.ts        # apiUrl = '/api'
    │
    └── app/
        ├── app.component.ts
        ├── app.component.html                # <router-outlet>
        ├── app.component.scss
        ├── app.config.ts
        ├── app.routes.ts                     # 3 layouts con lazy children
        │
        ├── core/                             # ★ Singleton global
        │   ├── index.ts                      # Barrel exports
        │   │
        │   ├── services/
        │   │   ├── api.service.ts            # Wrapper HTTP genérico
        │   │   ├── auth.service.ts           # Login/logout, signals
        │   │   ├── notification.service.ts   # Toasts
        │   │   └── token-storage.service.ts  # JWT en localStorage
        │   │
        │   ├── interceptors/
        │   │   ├── auth.interceptor.ts       # Bearer token
        │   │   └── error.interceptor.ts      # Error handling
        │   │
        │   ├── guards/
        │   │   ├── auth.guard.ts             # Requiere autenticación
        │   │   ├── guest.guard.ts            # Redirige si logueado
        │   │   └── role.guard.ts             # Verifica roles
        │   │
        │   └── layouts/
        │       ├── auth-layout/
        │       │   ├── auth-layout.component.ts
        │       │   ├── auth-layout.component.html
        │       │   └── auth-layout.component.scss
        │       │
        │       ├── main-layout/
        │       │   ├── main-layout.component.ts
        │       │   ├── main-layout.component.html
        │       │   └── main-layout.component.scss
        │       │
        │       └── client-layout/
        │           ├── client-layout.component.ts
        │           ├── client-layout.component.html
        │           └── client-layout.component.scss
        │
        ├── shared/                           # ★ Recursos reutilizables
        │   ├── index.ts
        │   │
        │   ├── components/
        │   │   ├── data-table/
        │   │   ├── page-header/
        │   │   ├── form-field/
        │   │   ├── modal/
        │   │   ├── loading/
        │   │   └── notifications/
        │   │
        │   ├── models/
        │   │   ├── api-response.model.ts
        │   │   ├── auth/
        │   │   │   ├── auth.model.ts
        │   │   │   └── login.model.ts
        │   │   ├── user/
        │   │   │   ├── user.model.ts
        │   │   │   ├── profile.model.ts
        │   │   │   └── role.model.ts
        │   │   ├── vehicle/
        │   │   │   ├── vehicle.model.ts
        │   │   │   └── category.model.ts
        │   │   ├── rental/
        │   │   │   └── rental.model.ts
        │   │   └── admin/
        │   │       ├── company.model.ts
        │   │       ├── branch.model.ts
        │   │       └── document.model.ts
        │   │
        │   ├── utils/
        │   │   ├── date-utils.ts
        │   │   ├── role-utils.ts
        │   │   ├── validators.ts
        │   │   └── format-utils.ts
        │   │
        │   ├── constants/
        │   │   ├── fleet.constants.ts
        │   │   ├── routes.constants.ts
        │   │   └── app.constants.ts
        │   │
        │   └── styles/
        │       ├── _variables.scss
        │       ├── _mixins.scss
        │       ├── _auth-forms.scss
        │       ├── _page.scss
        │       └── _components.scss
        │
        └── features/                         # ★ Módulos lazy
            │
            ├── auth/                         # Login + Register
            │   ├── auth.routes.ts
            │   ├── auth.service.ts           # Re-export de core AuthService
            │   └── pages/
            │       ├── login/
            │       └── register/
            │
            ├── dashboard/                    # Panel principal admin
            │   ├── dashboard.routes.ts
            │   ├── dashboard.service.ts
            │   ├── models/
            │   │   └── dashboard-stats.model.ts
            │   └── pages/
            │       └── dashboard/
            │
            ├── admin/                        # ★ Módulo administrativo unificado
            │   ├── admin.routes.ts           # Todas las rutas admin con inline children
            │   ├── admin.service.ts          # CRUD único para todas las entidades
            │   ├── admin-constants.ts
            │   │
            │   ├── components/
            │   │   ├── admin-sidebar/
            │   │   └── admin-navbar/
            │   │
            │   └── pages/                    # 8 dominios, sin subdirectorios list/form
            │       ├── users/
            │       │   ├── users.component.ts
            │       │   ├── users.component.html
            │       │   ├── users.component.scss
            │       │   ├── users-form.component.ts
            │       │   ├── users-form.component.html
            │       │   └── users-form.component.scss
            │       │
            │       ├── profiles/
            │       ├── roles/
            │       ├── companies/
            │       ├── branches/
            │       ├── vehicles/
            │       ├── categories/
            │       └── rentals/
            │
            └── client/                       # ★ Portal público
                ├── client.routes.ts
                ├── client.service.ts
                │
                ├── components/
                │   ├── client-header/
                │   ├── client-footer/
                │   └── vehicle-card/
                │
                ├── services/
                │   ├── client-catalog.service.ts
                │   ├── client-alquileres.service.ts
                │   ├── client-profile.service.ts
                │   └── documentos-identidad.service.ts
                │
                └── pages/
                    ├── home/
                    ├── companies/
                    ├── branches/
                    ├── vehicles/
                    ├── reservations/
                    ├── profile/
                    └── help/
```

---

## Arquitectura en capas

```
core/          → Servicios singleton, guards, interceptores, layouts
shared/        → Modelos, utilerías, componentes UI reutilizables
features/      → Módulos lazy — cada uno con sus páginas, servicios y rutas propias
```

### Data flow

```
Template (HTML)
    ↕ signals / binding
Component (.ts)
    ↕ inyección
FeatureService (AdminService, ClientCatalogService, etc.)
    ↕ ApiService (get<T>, getPaginated<T>, post<T>, patch<T>, delete<T>)
Interceptor (auth.interceptor → error.interceptor)
    ↕
Backend API (back-nest → http://localhost:3000)
```

- `ApiService.get<T>` → unwrap automático de `res.data` (devuelve `T`).
- `ApiService.getPaginated<T>` → devuelve `PaginationResponse<T>` completo (con `.data`, `.meta`).
- Los interceptores se registran en `app.config.ts` con `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`.
- El admin unificado usa un solo `AdminService` para todos los CRUD, inyectado directamente en cada página.

---

## Routing — 3 layouts

Definidos en `app.routes.ts`:

| Layout | Path | Guard | Contenido |
|--------|------|-------|-----------|
| `AuthLayoutComponent` | `/auth` | `guestGuard` | Login, Register |
| `MainLayoutComponent` | `/` (dashboard, admin/*) | `authGuard` + `roleGuard` | Panel admin con sidebar y navbar |
| `ClientLayoutComponent` | `/cliente` | Ninguno | Portal público con header y footer |

Ruta por defecto: `/` → redirect a `/cliente`.
Wildcard: `**` → redirect a `/cliente`.

### Admin routing

Todas las rutas admin se definen en `admin.routes.ts` con inline `children`:

```typescript
{
  path: 'users',
  children: [
    { path: '', component: UsersComponent },
    { path: 'new', component: UserFormComponent },
    { path: ':id', component: UserFormComponent },
  ],
}
```

### Protección por roles (panel admin)

| Ruta | Roles permitidos |
|------|-----------------|
| `/dashboard` | SUPER_ADMIN, ADMIN, EMPLEADO |
| `/users` | SUPER_ADMIN, ADMIN |
| `/profiles` | SUPER_ADMIN, ADMIN, EMPLEADO |
| `/companies` | SUPER_ADMIN, ADMIN, EMPLEADO |
| `/roles` | SUPER_ADMIN |
| `/branches` | SUPER_ADMIN, ADMIN, EMPLEADO |
| `/categories` | SUPER_ADMIN, ADMIN, EMPLEADO |
| `/vehicles` | SUPER_ADMIN, ADMIN, EMPLEADO |
| `/rentals` | SUPER_ADMIN, ADMIN, EMPLEADO |

---

## Configuración y entry point

### `app.config.ts`
```typescript
providers: [
  provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
]
```

### `main.ts`
```typescript
bootstrapApplication(AppComponent, appConfig);
```

### `environment*.ts`
```typescript
// environment.ts (producción)
apiUrl: 'http://localhost:3000'

// environment.development.ts (dev)
apiUrl: '/api'   // proxy.conf.json → http://localhost:3000
```

### `proxy.conf.json`
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "logLevel": "debug"
  }
}
```

---

## Convenciones

### Componentes
- Standalone components (Angular 19, sin NgModules).
- Cada componente tiene 3 archivos: `*.component.ts`, `*.component.html`, `*.component.scss`.
- SCSS siempre como archivo separado (nunca inline styles/templates).
- `styleUrl` (singular).
- Control flow `@if` / `@for`.
- Sin subdirectorios de lista/formulario — los archivos planos van en la carpeta de la página.

### Estado
- Signals (`signal<T>()`, `computed()`) para estado local.
- Servicios con `providedIn: 'root'` para estado compartido.

### Naming
| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Directorios página | kebab-case inglés | `companies/`, `vehicles/`, `rentals/` |
| Componentes | kebab-case inglés | `users-form.component.ts` |
| Servicios | kebab-case inglés | `admin.service.ts` |
| Modelos | kebab-case inglés | `vehicle.model.ts`, `company.model.ts` |
| Constantes | kebab-case | `fleet.constants.ts` |

### AdminService
Un solo servicio (`AdminService`) expone métodos agrupados por dominio:

```typescript
// Users
getUsers(), getUser(id), createUser(payload), updateUser(id, payload), deleteUser(id)

// Companies
getCompanies(page, limit), getCompany(id), createCompany(payload), ...

// Vehicles
getVehicles(filters), getVehicle(id), createVehicle(payload), ...

// Rentals
getRentals(filters), getRental(id), createRental(payload), confirmarPagoRental(id, payload), ...
```

---

## Pruebas
- Karma + Jasmine.
- Archivos `*.spec.ts` junto al componente.
- `angular.json` → schematics con `skipTests: true`.

---

## Comandos

| Acción | Comando |
|--------|---------|
| Dev server (proxy) | `npm start` (puerto 4200) |
| Build producción | `npm run build` |
| Tests | `npm test` |
| Generar componente | `npx ng generate component features/mi-modulo/mi-componente` |

---

## Autenticación

Flujo:
1. `login.component` llama a `AuthService.login(credentials)`.
2. `AuthService` envía POST a `/auth/login` via `ApiService`.
3. Backend devuelve `{ token, user }`, se guarda en `TokenStorageService`.
4. `AuthService` expone signals: `currentUser`, `roleName`, `isAuthenticated`.
5. `authInterceptor` lee el token y lo agrega a cada request.
6. `authGuard` verifica `isAuthenticated()` antes de activar rutas admin.
7. `roleGuard` verifica `hasRole(user, requiredRoles)`.

---

## Formato de respuestas API

```typescript
interface SuccessResponse<T> {
  status: number;
  message: string;
  data: T;
  error: null;
}

interface PaginationResponse<T> {
  status: number;
  message: string;
  data: T[];
  meta: PaginationMeta;
  error: null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

---

## Resumen de archivos

| Directorio | Cantidad de archivos |
|-----------|---------------------|
| Raíz (config) | ~10 |
| `public/` | 3 |
| `src/` (raíz) | 3 (index.html, main.ts, styles.scss) |
| `src/environments/` | 2 |
| `src/app/core/` | ~15 (services: 4, interceptors: 2, guards: 3, layouts: 9) |
| `src/app/shared/` | ~35 (components, models, utils, constants, styles) |
| `src/app/features/` | ~100 (auth, dashboard, admin, client) |
| **Total src/** | **~158 archivos fuente** |
