/**
 * Onboarding - Presentation Layer
 * Step Summary Component - Final step with summary
 */

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-step-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="step-summary">
      <div class="celebration">
        <div class="celebration-icon">
          <span>&#127881;</span>
        </div>
        <h2 class="celebration-title">{{ 'onboarding.summary.title' | translate }}</h2>
        <p class="celebration-subtitle">{{ 'onboarding.summary.subtitle' | translate }}</p>
      </div>

      <div class="summary-items">
        @if (accountName()) {
          <div class="summary-item success">
            <span class="item-icon">&#10003;</span>
            <span class="item-text">
              {{ 'onboarding.summary.accountCreated' | translate }} <strong>{{ accountName() }}</strong>
            </span>
          </div>
        }

        @if (hasTransaction()) {
          <div class="summary-item success">
            <span class="item-icon">&#10003;</span>
            <span class="item-text">{{ 'onboarding.summary.transactionCreated' | translate }}</span>
          </div>
        } @else {
          <div class="summary-item skipped">
            <span class="item-icon">&#8226;</span>
            <span class="item-text">{{ 'onboarding.summary.transactionSkipped' | translate }}</span>
          </div>
        }
      </div>

      <div class="suggestions">
        <h3 class="suggestions-title">{{ 'onboarding.summary.suggestionsTitle' | translate }}</h3>
        <div class="suggestions-list">
          <div class="suggestion-item">
            <span class="suggestion-icon">&#128200;</span>
            <span>{{ 'onboarding.summary.suggestion1' | translate }}</span>
          </div>
          <div class="suggestion-item">
            <span class="suggestion-icon">&#127919;</span>
            <span>{{ 'onboarding.summary.suggestion2' | translate }}</span>
          </div>
          <div class="suggestion-item">
            <span class="suggestion-icon">&#128202;</span>
            <span>{{ 'onboarding.summary.suggestion3' | translate }}</span>
          </div>
        </div>
      </div>

      <button class="btn-primary" (click)="onComplete.emit()">
        {{ 'onboarding.summary.cta' | translate }}
      </button>
    </div>
  `,
  styles: [`
    .step-summary {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1.5rem;
      text-align: center;
    }

    .celebration {
      margin-bottom: 2rem;
    }

    .celebration-icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2ab27b 0%, #1e8a5f 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 3rem;
      box-shadow: 0 8px 30px rgba(42, 178, 123, 0.3);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .celebration-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 0.5rem 0;
    }

    .celebration-subtitle {
      font-size: 1rem;
      color: #666;
      margin: 0;
    }

    .summary-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 100%;
      max-width: 320px;
      margin-bottom: 2rem;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      text-align: left;
    }

    .summary-item.success {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .summary-item.skipped {
      background: #f5f5f5;
      color: #9e9e9e;
    }

    .item-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .item-text {
      font-size: 0.9rem;
    }

    .item-text strong {
      color: #1a1a2e;
    }

    .suggestions {
      width: 100%;
      max-width: 320px;
      margin-bottom: 2rem;
      text-align: left;
    }

    .suggestions-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #666;
      margin: 0 0 1rem 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0;
      font-size: 0.9rem;
      color: #333;
    }

    .suggestion-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .btn-primary {
      background: linear-gradient(135deg, #2ab27b 0%, #1e8a5f 100%);
      color: white;
      border: none;
      padding: 1rem 3rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 15px rgba(42, 178, 123, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(42, 178, 123, 0.4);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    @media (max-width: 480px) {
      .step-summary {
        padding: 1.5rem 1rem;
      }

      .celebration-icon {
        width: 80px;
        height: 80px;
        font-size: 2.5rem;
      }

      .celebration-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class StepSummaryComponent {
  accountName = input<string | null>(null);
  hasTransaction = input<boolean>(false);

  onComplete = output<void>();
}
