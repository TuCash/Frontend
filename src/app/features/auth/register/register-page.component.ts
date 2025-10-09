import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink]
})
export class RegisterPageComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { name, email, password } = this.registerForm.value as {
      name: string;
      email: string;
      password: string;
    };

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = this.translate.instant('register.success');
        this.registerForm.reset({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          terms: false,
        });
      },
      error: error => {
        this.isSubmitting = false;
        this.errorMessage = this.resolveErrorMessage(error);
      },
    });
  }

  navigateToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  onBack(): void {
    window.history.back();
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  private passwordsMatchValidator = (form: FormGroup) => {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    const passwordValue = password.value;
    const confirmValue = confirmPassword.value;

    const existingErrors = { ...(confirmPassword.errors ?? {}) };

    if (!passwordValue || !confirmValue) {
      if (existingErrors['mismatch']) {
        delete existingErrors['mismatch'];
        confirmPassword.setErrors(Object.keys(existingErrors).length ? existingErrors : null);
      }
      return null;
    }

    if (existingErrors['mismatch']) {
      delete existingErrors['mismatch'];
    }

    if (passwordValue !== confirmValue) {
      confirmPassword.setErrors({ ...existingErrors, mismatch: true });
      return { mismatch: true };
    }

    confirmPassword.setErrors(Object.keys(existingErrors).length ? existingErrors : null);
    return null;
  };

  private resolveErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const inner = (error as { error?: { message?: string } }).error;
      if (inner?.message) {
        if (inner.message === 'User already exists') {
          return this.translate.instant('register.errors.duplicated');
        }
        return inner.message;
      }
    }

    return this.translate.instant('register.genericError');
  }
}
