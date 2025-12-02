/**
 * Notifications Bounded Context - Presentation Layer
 * Notifications List Component
 * Página completa para ver y gestionar todas las notificaciones
 */

import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NotificationPollingService } from '../../../application/internal/queryservices/notification-polling.service';
import { NotificationService } from '../../../infrastructure/persistence/notification.service';
import { NotificationResource } from '../../resources/notification.resource';

type FilterType = 'all' | 'unread' | 'read';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.css'],
})
export class NotificationsListComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly notificationService = inject(NotificationService);
  protected readonly pollingService = inject(NotificationPollingService);

  // State
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notifications = signal<NotificationResource[]>([]);
  readonly currentFilter = signal<FilterType>('all');

  // Pagination
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);
  readonly hasMore = computed(() => this.currentPage() < this.totalPages() - 1);

  // Computed
  readonly filteredNotifications = computed(() => {
    const filter = this.currentFilter();
    const all = this.notifications();

    switch (filter) {
      case 'unread':
        return all.filter((n) => !n.isRead);
      case 'read':
        return all.filter((n) => n.isRead);
      default:
        return all;
    }
  });

  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.isRead).length);
  readonly readCount = computed(() => this.notifications().filter((n) => n.isRead).length);
  readonly totalCount = computed(() => this.notifications().length);

  // Group notifications by date
  readonly groupedNotifications = computed(() => {
    const notifications = this.filteredNotifications();
    const groups: { date: string; label: string; notifications: NotificationResource[] }[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach((notification) => {
      const notifDate = new Date(notification.createdAt);
      notifDate.setHours(0, 0, 0, 0);

      let dateKey: string;
      let label: string;

      if (notifDate.getTime() === today.getTime()) {
        dateKey = 'today';
        label = this.translate.instant('notificationsList.today');
      } else if (notifDate.getTime() === yesterday.getTime()) {
        dateKey = 'yesterday';
        label = this.translate.instant('notificationsList.yesterday');
      } else {
        dateKey = notifDate.toISOString().split('T')[0];
        label = this.formatDate(notifDate);
      }

      let group = groups.find((g) => g.date === dateKey);
      if (!group) {
        group = { date: dateKey, label, notifications: [] };
        groups.push(group);
      }
      group.notifications.push(notification);
    });

    return groups;
  });

  private loadSubscription?: Subscription;

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.loadSubscription = this.notificationService.getAll().subscribe({
      next: (notifications) => {
        // NotificationService already handles paginated response
        this.notifications.set(notifications);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.error.set('notificationsList.errors.load');
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: FilterType): void {
    this.currentFilter.set(filter);
  }

  onNotificationClick(notification: NotificationResource): void {
    // Mark as read when clicking
    if (!notification.isRead) {
      this.markAsRead(notification);
    }

    // Navigate to related entity if exists
    if (notification.relatedEntityType && notification.relatedEntityId) {
      this.navigateToEntity(notification.relatedEntityType, notification.relatedEntityId);
    }
  }

  markAsRead(notification: NotificationResource): void {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: (updated) => {
        // Update local state
        this.notifications.update((list) =>
          list.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        // Refresh polling service to update badge
        this.pollingService.refresh();
      },
      error: (err) => console.error('Error marking as read:', err),
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        // Update local state
        this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
        // Refresh polling service
        this.pollingService.refresh();
      },
      error: (err) => console.error('Error marking all as read:', err),
    });
  }

  deleteNotification(notification: NotificationResource, event: Event): void {
    event.stopPropagation();

    this.notificationService.delete(notification.id).subscribe({
      next: () => {
        this.notifications.update((list) => list.filter((n) => n.id !== notification.id));
        this.pollingService.refresh();
      },
      error: (err) => console.error('Error deleting notification:', err),
    });
  }

  deleteAllRead(): void {
    this.notificationService.deleteAllRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.filter((n) => !n.isRead));
      },
      error: (err) => console.error('Error deleting read notifications:', err),
    });
  }

  loadMore(): void {
    // Implement pagination if needed
    const nextPage = this.currentPage() + 1;
    this.currentPage.set(nextPage);
    // Would need to implement paginated API call here
  }

  private navigateToEntity(type: string, id: number): void {
    switch (type.toLowerCase()) {
      case 'budget':
        this.router.navigate(['/savings/budgets']);
        break;
      case 'goal':
        this.router.navigate(['/savings/goals']);
        break;
      case 'transaction':
        this.router.navigate(['/transactions']);
        break;
      default:
        // Stay on notifications page
        break;
    }
  }

  getIcon(type: string): string {
    switch (type?.toUpperCase()) {
      case 'WARNING':
        return '\u26A0\uFE0F';
      case 'BUDGET_ALERT':
        return '\uD83D\uDCB0';
      case 'GOAL_ACHIEVED':
        return '\uD83C\uDFAF';
      case 'REMINDER':
        return '\u23F0';
      case 'SUCCESS':
        return '\u2705';
      case 'ERROR':
        return '\u274C';
      case 'INFO':
      default:
        return '\u2139\uFE0F';
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return this.translate.instant('notifications.time.now');
    }
    if (diffMins < 60) {
      return this.translate.instant('notifications.time.minutesAgo', { count: diffMins });
    }
    if (diffHours < 24) {
      return this.translate.instant('notifications.time.hoursAgo', { count: diffHours });
    }
    if (diffDays < 7) {
      return this.translate.instant('notifications.time.daysAgo', { count: diffDays });
    }

    return this.formatDate(date);
  }

  private formatDate(date: Date): string {
    const currentLang = this.translate.currentLang || 'es';
    const localeMap: Record<string, string> = {
      es: 'es-PE',
      en: 'en-US',
      pt: 'pt-BR',
    };
    return date.toLocaleDateString(localeMap[currentLang] || 'es-PE', {
      day: 'numeric',
      month: 'long',
    });
  }

  onBack(): void {
    this.router.navigate(['/home']);
  }
}
