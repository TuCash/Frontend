/**
 * IAM Bounded Context - Presentation Layer
 * Register Page Component
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IamCommandService } from '../../../application/internal/commandservices/iam-command.service';
import { SignUpCommand } from '../../../domain/model/commands/sign-up.command';

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

  private fb = inject(FormBuilder);
  private iamCommandService = inject(IamCommandService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  constructor() {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
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

    const command = new SignUpCommand(email, password, name);

    this.iamCommandService.handleSignUp(command).subscribe({
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

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: error => {
        this.isSubmitting = false;
        this.errorMessage = this.resolveErrorMessage(error);
      },
    });
  }

  navigateToLogin(): void {
    this.router.navigateByUrl('/auth/login');
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
      const inner = (error as { error?: {
        message?: string;
        detail?: string;
        errors?: Record<string, string>;
      } }).error;

      // Handle validation errors from backend
      if (inner?.errors && typeof inner.errors === 'object') {
        const errorMessages = Object.values(inner.errors);
        if (errorMessages.length > 0) {
          return errorMessages.join('. ');
        }
      }

      // Handle detail message
      if (inner?.detail) {
        return inner.detail;
      }

      // Handle message
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
