// src/app/features/auth/login/login-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink]
})
export class LoginPageComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false],
    });
  }

  onSubmit(): void {
    if (!this.loginForm.valid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value as {
      email: string;
      password: string;
      remember: boolean;
    };

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/home');
      },
      error: error => {
        this.isSubmitting = false;
        this.errorMessage = this.resolveErrorMessage(error);
        this.authService.clearSession();
      },
    });
  }

  onBack(): void {
    window.history.back();
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onForgotPassword(): void {
    console.log('Forgot password clicked');
  }

  private resolveErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const inner = (error as { error?: { message?: string } }).error;
      if (inner?.message) {
        if (inner.message === 'Invalid credentials') {
          return this.translate.instant('login.errors.invalidCredentials');
        }
        return inner.message;
      }
    }

    return this.translate.instant('login.genericError');
  }
}
