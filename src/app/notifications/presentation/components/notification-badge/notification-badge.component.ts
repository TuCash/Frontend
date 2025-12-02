/**
 * Notifications Bounded Context - Presentation Layer
 * Notification Badge Component
 * Badge que muestra el contador de notificaciones no leídas en el header
 */

import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationPollingService } from '../../../application/internal/queryservices/notification-polling.service';

@Component({
  selector: 'app-notification-badge',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="notification-badge-container">
      <button
        type="button"
        class="notification-btn"
        (click)="toggleDropdown()"
        [attr.aria-label]="'notifications.aria.badge' | translate"
      >
        <span class="notification-icon">🔔</span>
        @if (pollingService.hasUnread()) {
          <span class="badge">{{ displayCount() }}</span>
        }
      </button>

      @if (showDropdown()) {
        <div class="notification-dropdown">
          <div class="dropdown-header">
            <span class="dropdown-title">{{ 'notifications.title' | translate }}</span>
            @if (pollingService.hasUnread()) {
              <button type="button" class="mark-all-btn" (click)="markAllAsRead()">
                {{ 'notifications.markAllAsRead' | translate }}
              </button>
            }
          </div>

          <div class="dropdown-content">
            @if (pollingService.isLoading()) {
              <div class="loading-state">
                <span class="spinner"></span>
                {{ 'notifications.loading' | translate }}
              </div>
            } @else if (pollingService.unreadNotifications().length === 0) {
              <div class="empty-state">
                <span class="empty-icon">✅</span>
                <p>{{ 'notifications.empty.message' | translate }}</p>
              </div>
            } @else {
              @for (notification of pollingService.unreadNotifications(); track notification.id) {
                <div class="notification-item" [class]="'type-' + notification.type.toLowerCase()">
                  <div class="notification-icon-type">{{ getIcon(notification.type) }}</div>
                  <div class="notification-content">
                    <strong class="notification-title">{{ notification.title }}</strong>
                    <p class="notification-message">{{ notification.message }}</p>
                    <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                  </div>
                  <button
                    type="button"
                    class="dismiss-btn"
                    (click)="markAsRead(notification.id, $event)"
                    [attr.aria-label]="'notifications.aria.dismiss' | translate"
                  >
                    ×
                  </button>
                </div>
              }
            }
          </div>

          <div class="dropdown-footer">
            <a routerLink="/notifications" class="view-all-link" (click)="closeDropdown()">
              {{ 'notifications.viewAll' | translate }}
            </a>
          </div>
        </div>
      }
    </div>

    @if (showDropdown()) {
      <div class="dropdown-backdrop" (click)="closeDropdown()"></div>
    }
  `,
  styles: [
    `
      .notification-badge-container {
        position: relative;
      }

      .notification-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: background-color 0.2s;
      }

      .notification-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .notification-icon {
        font-size: 1.5rem;
      }

      .badge {
        position: absolute;
        top: 2px;
        right: 2px;
        background: #ef4444;
        color: white;
        font-size: 0.65rem;
        font-weight: 700;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      .notification-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        width: 360px;
        max-height: 480px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        overflow: hidden;
        margin-top: 8px;
      }

      .dropdown-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .dropdown-title {
        font-weight: 600;
        color: #1f2937;
        font-size: 1rem;
      }

      .mark-all-btn {
        background: none;
        border: none;
        color: #3b82f6;
        font-size: 0.85rem;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .mark-all-btn:hover {
        background: #eff6ff;
      }

      .dropdown-content {
        max-height: 350px;
        overflow-y: auto;
      }

      .notification-item {
        display: flex;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid #f3f4f6;
        position: relative;
        transition: background-color 0.2s;
      }

      .notification-item:hover {
        background: #f9fafb;
      }

      .notification-item.type-warning {
        border-left: 3px solid #f59e0b;
      }

      .notification-item.type-budget_alert {
        border-left: 3px solid #ef4444;
      }

      .notification-item.type-goal_achieved {
        border-left: 3px solid #10b981;
      }

      .notification-item.type-reminder {
        border-left: 3px solid #8b5cf6;
      }

      .notification-item.type-success {
        border-left: 3px solid #10b981;
      }

      .notification-item.type-error {
        border-left: 3px solid #ef4444;
      }

      .notification-item.type-info {
        border-left: 3px solid #3b82f6;
      }

      .notification-icon-type {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-title {
        display: block;
        font-size: 0.9rem;
        color: #1f2937;
        margin-bottom: 4px;
      }

      .notification-message {
        font-size: 0.85rem;
        color: #6b7280;
        margin: 0 0 6px 0;
        line-height: 1.4;
      }

      .notification-time {
        font-size: 0.75rem;
        color: #9ca3af;
      }

      .dismiss-btn {
        background: none;
        border: none;
        color: #9ca3af;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        border-radius: 4px;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .dismiss-btn:hover {
        color: #6b7280;
        background: #f3f4f6;
      }

      .loading-state,
      .empty-state {
        padding: 40px 20px;
        text-align: center;
        color: #6b7280;
      }

      .empty-icon {
        font-size: 2.5rem;
        display: block;
        margin-bottom: 12px;
      }

      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #e5e7eb;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .dropdown-footer {
        padding: 12px 16px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
        text-align: center;
      }

      .view-all-link {
        color: #3b82f6;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .view-all-link:hover {
        text-decoration: underline;
      }

      .dropdown-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        background: transparent;
      }

      /* Responsive */
      @media (max-width: 480px) {
        .notification-dropdown {
          position: fixed;
          top: 60px;
          left: 8px;
          right: 8px;
          width: auto;
        }
      }
    `,
  ],
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  protected readonly pollingService = inject(NotificationPollingService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected showDropdown = signal(false);

  ngOnInit(): void {
    // Iniciar polling cuando el componente se monta
    this.pollingService.startPolling();
  }

  ngOnDestroy(): void {
    // Detener polling cuando el componente se desmonta
    this.pollingService.stopPolling();
  }

  protected displayCount(): string {
    const count = this.pollingService.unreadCount();
    return count > 99 ? '99+' : count.toString();
  }

  protected toggleDropdown(): void {
    this.showDropdown.update(v => !v);
  }

  protected closeDropdown(): void {
    this.showDropdown.set(false);
  }

  protected markAsRead(notificationId: number, event: Event): void {
    event.stopPropagation();
    this.pollingService.markAsRead(notificationId);
  }

  protected markAllAsRead(): void {
    this.pollingService.markAllAsRead();
  }

  protected getIcon(type: string): string {
    switch (type) {
      case 'WARNING':
        return '⚠️';
      case 'BUDGET_ALERT':
        return '💰';
      case 'GOAL_ACHIEVED':
        return '🎯';
      case 'REMINDER':
        return '⏰';
      case 'SUCCESS':
        return '✅';
      case 'ERROR':
        return '❌';
      case 'INFO':
      default:
        return 'ℹ️';
    }
  }

  protected formatTime(dateString: string): string {
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

    // For older dates, use locale from current language
    const currentLang = this.translate.currentLang || 'es';
    const localeMap: Record<string, string> = {
      es: 'es-PE',
      en: 'en-US',
      pt: 'pt-BR',
    };
    return date.toLocaleDateString(localeMap[currentLang] || 'es-PE', {
      day: 'numeric',
      month: 'short',
    });
  }
}
