/**
 * IAM Bounded Context - Presentation Layer
 * Security Component (Change Password)
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { IamQueryService } from '../../../application/internal/queryservices/iam-query.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css'],
})
export class SecurityComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly iamQueryService = inject(IamQueryService);

  readonly isSaving = signal(false);
  readonly saveError = signal('');
  readonly saveSuccess = signal(false);
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  securityForm: FormGroup;

  constructor() {
    this.securityForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(8)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword.update((show) => !show);
    } else if (field === 'new') {
      this.showNewPassword.update((show) => !show);
    } else {
      this.showConfirmPassword.update((show) => !show);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.securityForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string | null {
    const field = this.securityForm.get(fieldName);
    if (!field || !field.errors || !(field.dirty || field.touched)) {
      return null;
    }

    if (field.errors['required']) return 'profile.security.errors.required';
    if (field.errors['minlength']) return 'profile.security.errors.minLength';
    if (field.errors['passwordMismatch']) return 'profile.security.errors.passwordMismatch';

    return null;
  }

  onSubmit(): void {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }

    const currentUser = this.iamQueryService.getCurrentUser();
    if (!currentUser) {
      this.saveError.set('profile.security.errors.noUser');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');
    this.saveSuccess.set(false);

    const payload = {
      currentPassword: this.securityForm.value.currentPassword,
      newPassword: this.securityForm.value.newPassword,
    };

    this.http
      .patch(`${environment.apiBaseUrl}${environment.endpoints.users}/${currentUser.id}/password`, payload)
      .subscribe({
        next: () => {
          console.log('✅ Password updated successfully');
          this.isSaving.set(false);
          this.saveSuccess.set(true);
          this.securityForm.reset();

          // Redirect after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/iam/profile']);
          }, 2000);
        },
        error: (error) => {
          console.error('❌ Error updating password:', error);

          // Check if it's a 401 (wrong current password)
          if (error.status === 401 || error.status === 400) {
            this.saveError.set('profile.security.errors.wrongPassword');
          } else {
            this.saveError.set('profile.security.errors.save');
          }

          this.isSaving.set(false);
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/iam/profile']);
  }
}
