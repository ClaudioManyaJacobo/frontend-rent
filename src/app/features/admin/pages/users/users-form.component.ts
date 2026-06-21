import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Role } from '../../../../shared/models/user/role.model';
import { AuthService } from '../../../../core/services/auth.service';
import { Empresa } from '../../../../shared/models/admin/company.model';
import { Sucursal } from '../../../../shared/models/admin/branch.model';

type CreateTipo = 'admin' | 'empleado';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly roles = signal<Role[]>([]);
  readonly empresas = signal<Empresa[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly editingRoleNombre = signal<string | null>(null);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly createTipo = signal<CreateTipo | null>(null);

  private userId: string | null = null;

  readonly currentRole = computed(() => this.auth.roleName());
  readonly roleAdminId = signal<string | null>(null);
  readonly roleEmpleadoId = signal<string | null>(null);
  readonly selectedRoleId = computed(
    () => this.form.controls.roleId.value ?? '',
  );

  readonly isCreatingAdmin = computed(() => {
    const tipo = this.createTipo();
    if (tipo === 'admin') return true;
    if (tipo === 'empleado') return false;
    return this.selectedRoleId() === this.roleAdminId();
  });

  readonly showSucursalField = computed(() => {
    if (this.currentRole() !== 'SUPER_ADMIN' && this.currentRole() !== 'ADMIN') {
      return false;
    }
    if (this.isEdit()) {
      return this.editingRoleNombre() === 'EMPLEADO';
    }
    if (this.currentRole() === 'ADMIN') return true;
    const tipo = this.createTipo();
    if (tipo === 'empleado') return true;
    if (tipo === 'admin') return false;
    return this.selectedRoleId() === this.roleEmpleadoId();
  });

  readonly pageTitle = computed(() => {
    if (this.isEdit()) return 'Editar usuario';
    if (this.createTipo() === 'admin') return 'Nuevo administrador';
    if (this.createTipo() === 'empleado') return 'Nuevo empleado';
    if (this.currentRole() === 'ADMIN') return 'Nuevo empleado';
    return 'Nuevo usuario';
  });

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    roleId: [''],
    empresa_id: [''],
    sucursal_id: [''],
    esta_activo: [true],

  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isCreateMode = !id || id === 'new';

    if (isCreateMode) {
      const tipo = this.route.snapshot.queryParamMap.get('tipo');
      if (tipo === 'admin' || tipo === 'empleado') {
        this.createTipo.set(tipo);
      }
    }

    // Solo SUPER_ADMIN necesita el catálogo de roles (GET /roles exige rol:view).
    // ADMIN crea empleados: el backend asigna EMPLEADO y la empresa del admin.
    if (this.currentRole() === 'SUPER_ADMIN') {
      this.loadRolesForSuperAdmin(isCreateMode);
    }

    if (isCreateMode && this.currentRole() === 'SUPER_ADMIN') {
      this.loadEmpresasForSuperAdmin();
    }

    if (this.currentRole() === 'ADMIN' && isCreateMode) {
      this.loadSucursalesForEmpleado();
    }

    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.userId = id;
      this.form.controls.password.clearValidators();
      this.admin.getUser(id).subscribe({
        next: (user) => {
          this.editingRoleNombre.set(user.role?.nombre ?? null);
          this.form.patchValue({
            email: user.email,
            roleId: user.role?.id ?? '',
            empresa_id: user.perfil?.empresa?.id ?? '',
            sucursal_id:
              user.perfil?.sucursal?.id ?? user.perfil?.sucursal_id ?? '',
            esta_activo: user.esta_activo,

          });
          if (this.currentRole() === 'SUPER_ADMIN') {
            this.admin.getCompanies(1, 500).subscribe({
              next: (res) => this.empresas.set(res.data),
            });
          }
          if (user.role?.nombre === 'EMPLEADO') {
            const empresaId = user.perfil?.empresa?.id;
            this.loadSucursalesForEmpleado(
              this.currentRole() === 'SUPER_ADMIN' ? empresaId : undefined,
            );
          }
        },
      });
    } else {
      this.form.controls.password.setValidators([
        Validators.required,
        Validators.minLength(8),
      ]);
    }

    this.form.controls.roleId.valueChanges.subscribe(() => {
      if (this.currentRole() === 'SUPER_ADMIN' && isCreateMode) {
        this.loadEmpresasForSuperAdmin();
        this.onEmpleadoContextChange();
      }
    });

    this.form.controls.empresa_id.valueChanges.subscribe(() => {
      if (this.currentRole() === 'SUPER_ADMIN') {
        this.form.controls.sucursal_id.setValue('');
        this.onEmpleadoContextChange();
      }
    });
  }

  private onEmpleadoContextChange(): void {
    if (!this.showSucursalField()) {
      this.sucursales.set([]);
      return;
    }
    const empresaId = this.normalizeUuid(this.form.controls.empresa_id.value);
    this.loadSucursalesForEmpleado(empresaId);
  }

  private loadSucursalesForEmpleado(empresaId?: string): void {
    this.admin.getBranches(1, 500, empresaId).subscribe({
      next: (res) => this.sucursales.set(res.data),
      error: () =>
        this.notifications.error('No se pudieron cargar sucursales'),
    });
  }

  private loadRolesForSuperAdmin(isCreateMode: boolean): void {
    this.admin.getRoles().subscribe({
      next: (r) => {
        this.roles.set(r);
        const adminId = r.find((x) => x.nombre === 'ADMIN')?.id ?? null;
        const empleadoId = r.find((x) => x.nombre === 'EMPLEADO')?.id ?? null;
        this.roleAdminId.set(adminId);
        this.roleEmpleadoId.set(empleadoId);

        if (isCreateMode) {
          const tipo = this.createTipo();
          if (tipo === 'admin' && adminId) {
            this.form.controls.roleId.setValue(adminId);
          } else if (tipo === 'empleado' && empleadoId) {
            this.form.controls.roleId.setValue(empleadoId);
          }
          this.onEmpleadoContextChange();
        }
      },
      error: () => this.notifications.error('No se pudieron cargar roles'),
    });
  }

  private loadEmpresasForSuperAdmin(): void {
    const creatingAdmin =
      this.createTipo() === 'admin' ||
      (this.createTipo() === null &&
        this.form.controls.roleId.value === this.roleAdminId());

    if (creatingAdmin) {
      this.admin.getCompaniesSinAdministrador().subscribe({
        next: (list) => this.empresas.set(list),
        error: () =>
          this.notifications.error('No se pudieron cargar empresas disponibles'),
      });
      return;
    }

    this.admin.getCompanies(1, 500).subscribe({
      next: (res) => this.empresas.set(res.data),
      error: () => this.notifications.error('No se pudieron cargar empresas'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const cleanRoleId = this.normalizeUuid(raw.roleId);
    const cleanEmpresaId = this.normalizeUuid(raw.empresa_id);
    const cleanSucursalId = this.normalizeUuid(raw.sucursal_id);
    const basePayload = {
      email: raw.email!,
      esta_activo: raw.esta_activo ?? true,

      ...(raw.password ? { password: raw.password } : {}),
    };

    const payload: Record<string, unknown> = { ...basePayload };

    if (!this.isEdit()) {
      // ADMIN: no enviar roleId; el backend fuerza EMPLEADO en su empresa.
      if (this.currentRole() !== 'ADMIN') {
        payload['roleId'] = cleanRoleId;
      }

      if (this.currentRole() === 'SUPER_ADMIN') {
        if (!cleanRoleId) {
          this.notifications.error('Debes seleccionar un rol válido');
          return;
        }

        const adminId = this.roleAdminId();
        const empleadoId = this.roleEmpleadoId();
        const needsEmpresa =
          cleanRoleId === adminId || cleanRoleId === empleadoId;

        if (needsEmpresa) {
          if (!cleanEmpresaId) {
            this.notifications.error(
              'Debes seleccionar una empresa para este usuario',
            );
            return;
          }
          payload['empresa_id'] = cleanEmpresaId;
        }
      }
    } else if (
      this.currentRole() === 'SUPER_ADMIN' &&
      cleanEmpresaId
    ) {
      payload['empresa_id'] = cleanEmpresaId;
    }

    if (this.showSucursalField() && cleanSucursalId) {
      payload['sucursal_id'] = cleanSucursalId;
    }

    this.loading.set(true);

    const request$ =
      this.isEdit() && this.userId
        ? this.admin.updateUser(this.userId, payload as any)
        : this.admin.createUser(
            payload as {
              email: string;
              password: string;
              roleId?: string;
              empresa_id?: string;
            },
          );

    request$.subscribe({
      next: () => {
        this.notifications.success(
          this.isEdit() ? 'Usuario actualizado' : 'Usuario creado',
        );
        void this.router.navigate(['/users']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ??
          (Array.isArray(err?.error?.message)
            ? err.error.message.join(', ')
            : null);
        if (msg) this.notifications.error(String(msg));
      },
      complete: () => this.loading.set(false),
    });
  }

  private normalizeUuid(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const v = value.trim();
    if (!v) return undefined;
    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuid.test(v) ? v : undefined;
  }
}
