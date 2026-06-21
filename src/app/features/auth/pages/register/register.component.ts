import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly passwordHints = [
    'Mínimo 8 caracteres',
    'Al menos una mayúscula y una minúscula',
    'Al menos un número',
  ];

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  isInvalid(control: 'email' | 'password' | 'confirmPassword'): boolean {
    const c = this.form.controls[control];
    return c.touched && c.invalid;
  }

  passwordsMismatch(): boolean {
    const { password, confirmPassword } = this.form.getRawValue();
    const confirm = this.form.controls.confirmPassword;
    return (
      confirm.touched &&
      !!confirmPassword &&
      password !== confirmPassword
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.notifications.error('Las contraseñas no coinciden');
      return;
    }
    this.loading.set(true);
    this.auth.register({ email, password }).subscribe({
      next: () => {
        this.notifications.success('Cuenta creada. Inicia sesión.');
        void this.router.navigate(['/auth/login']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
