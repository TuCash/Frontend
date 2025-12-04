/**
 * Onboarding - Presentation Layer
 * Step Welcome Component - First step of the wizard
 */

import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IamQueryService } from '../../../../iam/application/internal/queryservices/iam-query.service';

@Component({
  selector: 'app-step-welcome',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="step-welcome">
      <div class="welcome-icon">
        <span class="icon">&#128075;</span>
      </div>

      <h1 class="welcome-title">
        {{ 'onboarding.welcome.title' | translate: { name: userName } }}
      </h1>

      <p class="welcome-subtitle">
        {{ 'onboarding.welcome.subtitle' | translate }}
      </p>

      <div class="features-list">
        <div class="feature-item">
          <span class="feature-icon">&#128179;</span>
          <span class="feature-text">{{ 'onboarding.welcome.feature1' | translate }}</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">&#128200;</span>
          <span class="feature-text">{{ 'onboarding.welcome.feature2' | translate }}</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">&#127919;</span>
          <span class="feature-text">{{ 'onboarding.welcome.feature3' | translate }}</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">&#128202;</span>
          <span class="feature-text">{{ 'onboarding.welcome.feature4' | translate }}</span>
        </div>
      </div>

      <button class="btn-primary" (click)="onNext.emit()">
        {{ 'onboarding.welcome.cta' | translate }}
      </button>
    </div>
  `,
  styles: [`
    .step-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1.5rem;
      text-align: center;
    }

    .welcome-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2ab27b 0%, #1e8a5f 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 20px rgba(42, 178, 123, 0.3);
    }

    .welcome-icon .icon {
      font-size: 2.5rem;
    }

    .welcome-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
    }

    .welcome-subtitle {
      font-size: 1rem;
      color: #666;
      margin: 0 0 2rem 0;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-width: 320px;
      margin-bottom: 2rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border-radius: 12px;
      text-align: left;
    }

    .feature-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .feature-text {
      font-size: 0.9rem;
      color: #333;
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
      .step-welcome {
        padding: 1.5rem 1rem;
      }

      .welcome-title {
        font-size: 1.5rem;
      }

      .features-list {
        max-width: 100%;
      }
    }
  `]
})
export class StepWelcomeComponent {
  private readonly iamQueryService = inject(IamQueryService);

  onNext = output<void>();

  get userName(): string {
    const user = this.iamQueryService.getCurrentUser();
    return user?.displayName || 'Usuario';
  }
}
