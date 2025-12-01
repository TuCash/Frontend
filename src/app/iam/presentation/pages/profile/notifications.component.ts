/**
 * IAM Bounded Context - Presentation Layer
 * Notifications Settings Component
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IamQueryService } from '../../../application/internal/queryservices/iam-query.service';
import { IamCommandService } from '../../../application/internal/commandservices/iam-command.service';
import { GetUserByIdQuery } from '../../../domain/model/queries/get-user-by-id.query';
import { UpdatePreferencesCommand } from '../../../domain/model/commands/update-preferences.command';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly iamQueryService = inject(IamQueryService);
  private readonly iamCommandService = inject(IamCommandService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly saveError = signal('');
  readonly saveSuccess = signal(false);
  readonly loadError = signal('');

  // Notification settings
  readonly notificationsEnabled = signal(true);
  readonly emailNotifications = signal(true);
  readonly pushNotifications = signal(false);
  readonly budgetAlerts = signal(true);
  readonly goalAlerts = signal(true);
  readonly transactionAlerts = signal(false);

  userId?: number;

  ngOnInit(): void {
    this.loadUserPreferences();
  }

  private loadUserPreferences(): void {
    const authUser = this.iamQueryService.getCurrentUser();
    if (!authUser) {
      this.loadError.set('profile.notifications.errors.noUser');
      this.isLoading.set(false);
      return;
    }

    this.userId = authUser.id;

    this.iamQueryService.handle(new GetUserByIdQuery(authUser.id)).subscribe({
      next: (user) => {
        console.log('✅ User preferences loaded:', user);

        // Set notification preferences from user data
        // Note: These fields might not exist in UserResource yet
        // For now, we'll use default values
        this.notificationsEnabled.set(true);
        this.emailNotifications.set(true);
        this.pushNotifications.set(false);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading preferences:', error);
        this.loadError.set('profile.notifications.errors.load');
        this.isLoading.set(false);
      },
    });
  }

  toggleNotification(type: string): void {
    switch (type) {
      case 'all':
        this.notificationsEnabled.update((v) => !v);
        break;
      case 'email':
        this.emailNotifications.update((v) => !v);
        break;
      case 'push':
        this.pushNotifications.update((v) => !v);
        break;
      case 'budget':
        this.budgetAlerts.update((v) => !v);
        break;
      case 'goal':
        this.goalAlerts.update((v) => !v);
        break;
      case 'transaction':
        this.transactionAlerts.update((v) => !v);
        break;
    }

    // Auto-save after toggle
    this.savePreferences();
  }

  private savePreferences(): void {
    if (!this.userId) {
      this.saveError.set('profile.notifications.errors.noUser');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');
    this.saveSuccess.set(false);

    const command = new UpdatePreferencesCommand(
      this.userId,
      undefined, // currency
      undefined, // theme
      undefined, // locale
      this.notificationsEnabled(),
      this.emailNotifications(),
      this.pushNotifications()
    );

    this.iamCommandService.handleUpdatePreferences(command).subscribe({
      next: () => {
        console.log('✅ Preferences updated');
        this.isSaving.set(false);
        this.saveSuccess.set(true);

        // Hide success message after 2 seconds
        setTimeout(() => {
          this.saveSuccess.set(false);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error updating preferences:', error);
        this.saveError.set('profile.notifications.errors.save');
        this.isSaving.set(false);
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/iam/profile']);
  }
}
