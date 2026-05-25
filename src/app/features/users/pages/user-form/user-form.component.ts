import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { RolesService } from '../../../roles/services/roles.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Role } from '../../../../shared/models/role.model';

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

  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly isEdit = signal(false);
  private userId: string | null = null;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    roleId: [''],
    esta_activo: [true],
    perfil_completado: [false],
  });

  ngOnInit(): void {
    this.rolesService.findAll().subscribe((r) => this.roles.set(r));

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.userId = id;
      this.form.controls.password.clearValidators();
      this.usersService.findOne(id).subscribe({
        next: (user) => {
          this.form.patchValue({
            email: user.email,
            roleId: user.role?.id ?? '',
            esta_activo: user.esta_activo,
            perfil_completado: user.perfil_completado,
          });
        },
      });
    } else {
      this.form.controls.password.setValidators([
        Validators.required,
        Validators.minLength(8),
      ]);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      email: raw.email!,
      roleId: raw.roleId || undefined,
      esta_activo: raw.esta_activo ?? true,
      perfil_completado: raw.perfil_completado ?? false,
      ...(raw.password ? { password: raw.password } : {}),
    };

    this.loading.set(true);

    const request$ = this.isEdit() && this.userId
      ? this.usersService.update(this.userId, payload)
      : this.usersService.create(payload as { email: string; password: string });

    request$.subscribe({
      next: () => {
        this.notifications.success(
          this.isEdit() ? 'Usuario actualizado' : 'Usuario creado',
        );
        void this.router.navigate(['/users']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
