import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { RolesService } from '../../../roles/services/roles.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Role } from '../../../../shared/models/role.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { EmpresasService } from '../../../empresas/services/empresas.service';
import { Empresa } from '../../../../shared/models/empresa.model';

type CreateTipo = 'admin' | 'empleado';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly empresasService = inject(EmpresasService);

  readonly roles = signal<Role[]>([]);
  readonly empresas = signal<Empresa[]>([]);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  readonly createTipo = signal<CreateTipo | null>(null);

  private userId: string | null = null;

  readonly currentRole = computed(() => this.auth.currentUser()?.role ?? null);
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
    esta_activo: [true],
    perfil_completado: [false],
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

    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.userId = id;
      this.form.controls.password.clearValidators();
      this.usersService.findOne(id).subscribe({
        next: (user) => {
          this.form.patchValue({
            email: user.email,
            roleId: user.role?.id ?? '',
            empresa_id: user.perfil?.empresa?.id ?? '',
            esta_activo: user.esta_activo,
            perfil_completado: user.perfil_completado,
          });
          if (this.currentRole() === 'SUPER_ADMIN') {
            this.empresasService.findAll(1, 500).subscribe({
              next: (res) => this.empresas.set(res.data),
            });
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
      }
    });
  }

  private loadRolesForSuperAdmin(isCreateMode: boolean): void {
    this.rolesService.findAll().subscribe({
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
      this.empresasService.findSinAdministrador().subscribe({
        next: (list) => this.empresas.set(list),
        error: () =>
          this.notifications.error('No se pudieron cargar empresas disponibles'),
      });
      return;
    }

    this.empresasService.findAll(1, 500).subscribe({
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
    const basePayload = {
      email: raw.email!,
      esta_activo: raw.esta_activo ?? true,
      perfil_completado: raw.perfil_completado ?? false,
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

    this.loading.set(true);

    const request$ =
      this.isEdit() && this.userId
        ? this.usersService.update(
            this.userId,
            payload as Parameters<UsersService['update']>[1],
          )
        : this.usersService.create(
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
