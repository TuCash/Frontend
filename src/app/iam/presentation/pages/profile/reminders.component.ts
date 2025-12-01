/**
 * IAM Bounded Context - Presentation Layer
 * Reminders Settings Component
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.css'],
})
export class RemindersComponent {
  private readonly router = inject(Router);

  readonly saveSuccess = signal(false);

  // Reminder settings
  readonly dailyReminder = signal(true);
  readonly weeklyReport = signal(true);
  readonly monthlyReport = signal(false);
  readonly budgetWarnings = signal(true);
  readonly goalDeadlines = signal(true);
  readonly billReminders = signal(false);

  toggleReminder(type: string): void {
    switch (type) {
      case 'daily':
        this.dailyReminder.update((v) => !v);
        break;
      case 'weekly':
        this.weeklyReport.update((v) => !v);
        break;
      case 'monthly':
        this.monthlyReport.update((v) => !v);
        break;
      case 'budget':
        this.budgetWarnings.update((v) => !v);
        break;
      case 'goal':
        this.goalDeadlines.update((v) => !v);
        break;
      case 'bill':
        this.billReminders.update((v) => !v);
        break;
    }

    // Show success message
    this.saveSuccess.set(true);
    setTimeout(() => {
      this.saveSuccess.set(false);
    }, 2000);
  }

  onBack(): void {
    this.router.navigate(['/iam/profile']);
  }
}
