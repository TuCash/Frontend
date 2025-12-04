/**
 * IAM Bounded Context - Presentation Layer
 * Edit Profile Component
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IamQueryService } from '../../../application/internal/queryservices/iam-query.service';
import { IamCommandService } from '../../../application/internal/commandservices/iam-command.service';
import { UpdateUserCommand } from '../../../domain/model/commands/update-user.command';
import { GetUserByIdQuery } from '../../../domain/model/queries/get-user-by-id.query';
import { UserResource } from '../../resources/user.resource';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly iamQueryService = inject(IamQueryService);
  private readonly iamCommandService = inject(IamCommandService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly saveError = signal('');
  readonly saveSuccess = signal(false);
  readonly loadError = signal('');

  profileForm!: FormGroup;
  userResource?: UserResource;

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const authUser = this.iamQueryService.getCurrentUser();
    if (!authUser) {
      this.loadError.set('profile.edit.errors.noUser');
      this.isLoading.set(false);
      return;
    }

    this.iamQueryService.handle(new GetUserByIdQuery(authUser.id)).subscribe({
      next: (user) => {
        console.log('✅ User data loaded:', user);
        this.userResource = user;
        this.initForm(user);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading user:', error);
        this.loadError.set('profile.edit.errors.load');
        this.isLoading.set(false);
      },
    });
  }

  private initForm(user: UserResource): void {
    this.profileForm = this.fb.group({
      displayName: [user.displayName || '', [Validators.required, Validators.minLength(2)]],
      email: [{ value: user.email || '', disabled: true }], // Email no editable
      photoUrl: [user.photoUrl || ''],
      currency: [user.currency || 'PEN', [Validators.required]],
    });
  }

  get displayName() {
    return this.profileForm.get('displayName');
  }

  get currency() {
    return this.profileForm.get('currency');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.errors || !(field.dirty || field.touched)) {
      return null;
    }

    if (field.errors['required']) return 'profile.edit.errors.required';
    if (field.errors['minlength']) return 'profile.edit.errors.minLength';

    return null;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    if (!this.userResource) {
      this.saveError.set('profile.edit.errors.noUser');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');
    this.saveSuccess.set(false);

    const command = new UpdateUserCommand(
      this.userResource.id,
      this.profileForm.value.displayName,
      this.profileForm.value.photoUrl || undefined,
      this.profileForm.value.currency,
      undefined, // theme
      undefined  // locale
    );

    this.iamCommandService.handleUpdateUser(command).subscribe({
      next: (updatedUser) => {
        console.log('✅ Profile updated:', updatedUser);

        // Update localStorage with new user data
        const authData = JSON.parse(localStorage.getItem('auth_user') || '{}');
        authData.displayName = updatedUser.displayName;
        authData.photoUrl = updatedUser.photoUrl;
        authData.currency = updatedUser.currency;
        localStorage.setItem('auth_user', JSON.stringify(authData));

        this.isSaving.set(false);
        this.saveSuccess.set(true);

        // Redirect after 1.5 seconds
        setTimeout(() => {
          this.router.navigate(['/iam/profile']);
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Error updating profile:', error);
        this.saveError.set('profile.edit.errors.save');
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/iam/profile']);
  }
}
