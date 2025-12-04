/**
 * Onboarding - Presentation Layer
 * Wizard Stepper Component - Visual indicator for wizard progress
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WizardStep } from '../../resources/wizard-step.interface';

@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="wizard-stepper">
      @for (step of steps(); track step.id) {
        <div
          class="step"
          [class.active]="step.id === currentStep()"
          [class.completed]="step.completed"
          [class.optional]="step.optional"
        >
          <div class="step-indicator">
            @if (step.completed) {
              <span class="check">&#10003;</span>
            } @else {
              <span class="number">{{ step.id + 1 }}</span>
            }
          </div>
          <span class="step-label">{{ step.titleKey | translate }}</span>
          @if (step.optional) {
            <span class="optional-badge">{{ 'onboarding.optional' | translate }}</span>
          }
        </div>
        @if (step.id < steps().length - 1) {
          <div
            class="step-connector"
            [class.completed]="step.completed"
          ></div>
        }
      }
    </div>
  `,
  styles: [`
    .wizard-stepper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 1rem;
      gap: 0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }

    .step-indicator {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
      background: #e0e0e0;
      color: #757575;
      transition: all 0.3s ease;
    }

    .step.active .step-indicator {
      background: #2ab27b;
      color: white;
      box-shadow: 0 2px 8px rgba(42, 178, 123, 0.4);
    }

    .step.completed .step-indicator {
      background: #2ab27b;
      color: white;
    }

    .step-indicator .check {
      font-size: 1.2rem;
    }

    .step-label {
      font-size: 0.75rem;
      color: #757575;
      text-align: center;
      max-width: 80px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .step.active .step-label {
      color: #2ab27b;
      font-weight: 600;
    }

    .step.completed .step-label {
      color: #2ab27b;
    }

    .optional-badge {
      font-size: 0.625rem;
      color: #9e9e9e;
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 10px;
      position: absolute;
      bottom: -18px;
    }

    .step-connector {
      width: 40px;
      height: 2px;
      background: #e0e0e0;
      margin: 0 0.25rem;
      margin-bottom: 1.5rem;
      transition: background 0.3s ease;
    }

    .step-connector.completed {
      background: #2ab27b;
    }

    @media (max-width: 480px) {
      .wizard-stepper {
        padding: 1rem 0.5rem;
      }

      .step-indicator {
        width: 32px;
        height: 32px;
        font-size: 0.875rem;
      }

      .step-label {
        font-size: 0.625rem;
        max-width: 60px;
      }

      .step-connector {
        width: 24px;
      }
    }
  `]
})
export class WizardStepperComponent {
  steps = input.required<WizardStep[]>();
  currentStep = input.required<number>();
}
