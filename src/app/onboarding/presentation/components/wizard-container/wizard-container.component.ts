/**
 * Onboarding - Presentation Layer
 * Wizard Container Component - Orchestrates all wizard steps
 */

import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { WizardStepperComponent } from '../wizard-stepper/wizard-stepper.component';
import { StepWelcomeComponent } from '../step-welcome/step-welcome.component';
import { StepAccountComponent } from '../step-account/step-account.component';
import { StepTransactionComponent } from '../step-transaction/step-transaction.component';
import { StepSummaryComponent } from '../step-summary/step-summary.component';
import { WizardStep } from '../../resources/wizard-step.interface';
import { AccountResource } from '../../../../transactions/presentation/resources/account.resource';
import { TransactionResource } from '../../../../transactions/presentation/resources/transaction.resource';

@Component({
  selector: 'app-wizard-container',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    WizardStepperComponent,
    StepWelcomeComponent,
    StepAccountComponent,
    StepTransactionComponent,
    StepSummaryComponent
  ],
  template: `
    <div class="wizard-container">
      <div class="wizard-header">
        <div class="wizard-logo">
          <span class="logo-icon">&#128176;</span>
          <span class="logo-text">TuCash</span>
        </div>
        <button type="button" class="btn-close" (click)="close()" aria-label="Cerrar">
          &#10005;
        </button>
      </div>

      <app-wizard-stepper
        [steps]="steps()"
        [currentStep]="currentStep()"
      />

      <div class="wizard-content">
        @switch (currentStep()) {
          @case (0) {
            <app-step-welcome
              (onNext)="nextStep()"
            />
          }
          @case (1) {
            <app-step-account
              (onAccountCreated)="onAccountCreated($event)"
              (onBack)="previousStep()"
            />
          }
          @case (2) {
            <app-step-transaction
              [accountId]="createdAccount()!.id"
              (onTransactionCreated)="onTransactionCreated($event)"
              (onSkip)="skipTransaction()"
              (onBack)="previousStep()"
            />
          }
          @case (3) {
            <app-step-summary
              [accountName]="createdAccount()?.name ?? null"
              [hasTransaction]="!!createdTransaction()"
              (onComplete)="complete()"
            />
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .wizard-container {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      background: white;
    }

    .wizard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .wizard-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a2e;
    }

    .btn-close {
      width: 36px;
      height: 36px;
      border: none;
      background: #f5f5f5;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1rem;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: #e0e0e0;
      color: #333;
    }

    .wizard-content {
      flex: 1;
      overflow-y: auto;
    }

    @media (min-width: 768px) {
      .wizard-container {
        max-width: 500px;
        margin: 0 auto;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      .wizard-header {
        border-radius: 24px 24px 0 0;
      }
    }
  `]
})
export class WizardContainerComponent {
  // Modal callbacks (set by ModalService)
  onClose?: () => void;
  onComplete?: () => void;

  // State
  readonly currentStep = signal(0);
  readonly createdAccount = signal<AccountResource | null>(null);
  readonly createdTransaction = signal<TransactionResource | null>(null);

  // Steps configuration
  readonly steps = computed<WizardStep[]>(() => [
    {
      id: 0,
      titleKey: 'onboarding.steps.welcome',
      completed: this.currentStep() > 0,
      optional: false
    },
    {
      id: 1,
      titleKey: 'onboarding.steps.account',
      completed: this.currentStep() > 1,
      optional: false
    },
    {
      id: 2,
      titleKey: 'onboarding.steps.transaction',
      completed: this.currentStep() > 2,
      optional: true
    },
    {
      id: 3,
      titleKey: 'onboarding.steps.summary',
      completed: false,
      optional: false
    }
  ]);

  nextStep(): void {
    this.currentStep.update(step => Math.min(step + 1, 3));
  }

  previousStep(): void {
    this.currentStep.update(step => Math.max(step - 1, 0));
  }

  onAccountCreated(account: AccountResource): void {
    this.createdAccount.set(account);
    this.nextStep();
  }

  onTransactionCreated(transaction: TransactionResource): void {
    this.createdTransaction.set(transaction);
    this.nextStep();
  }

  skipTransaction(): void {
    this.nextStep();
  }

  close(): void {
    if (this.onClose) {
      this.onClose();
    }
  }

  complete(): void {
    if (this.onComplete) {
      this.onComplete();
    }
  }
}
