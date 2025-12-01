/**
 * IAM Bounded Context - Presentation Layer
 * Login Page Component
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IamCommandService } from '../../../application/internal/commandservices/iam-command.service';
import { SignInCommand } from '../../../domain/model/commands/sign-in.command';

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

  private fb = inject(FormBuilder);
  private iamCommandService = inject(IamCommandService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  constructor() {
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

    const command = new SignInCommand(email, password);

    this.iamCommandService.handle(command).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/home');
      },
      error: error => {
        this.isSubmitting = false;
        this.errorMessage = this.resolveErrorMessage(error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      },
    });
  }

  onBack(): void {
    window.location.href = 'https://tucash.github.io/landingPage';
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
