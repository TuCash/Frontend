/**
 * Onboarding - Presentation Layer
 * Step Account Component - Create first bank account
 */

import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { TransactionCommandService } from '../../../../transactions/application/internal/commandservices/transaction-command.service';
import { CreateAccountCommand } from '../../../../transactions/domain/model/commands/create-account.command';
import { AccountResource } from '../../../../transactions/presentation/resources/account.resource';

@Component({
  selector: 'app-step-account',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  template: `
    <div class="step-account">
      <div class="step-header">
        <div class="step-icon">
          <span>&#128179;</span>
        </div>
        <h2 class="step-title">{{ 'onboarding.account.title' | translate }}</h2>
        <p class="step-subtitle">{{ 'onboarding.account.subtitle' | translate }}</p>
      </div>

      <form [formGroup]="accountForm" (ngSubmit)="onSubmit()" class="account-form">
        <div class="form-group">
          <label for="name" class="form-label">
            {{ 'accounts.form.name' | translate }} *
          </label>
          <input
            type="text"
            id="name"
            formControlName="name"
            class="form-input"
            [class.invalid]="isFieldInvalid('name')"
            [placeholder]="'accounts.form.namePlaceholder' | translate"
          />
          @if (getFieldError('name'); as error) {
            <span class="field-error">{{ error | translate }}</span>
          }
        </div>

        <div class="form-group">
          <label for="currency" class="form-label">
            {{ 'accounts.form.currency' | translate }} *
          </label>
          <select
            id="currency"
            formControlName="currency"
            class="form-select"
            [class.invalid]="isFieldInvalid('currency')"
          >
            <option value="PEN">Soles (S/)</option>
            <option value="USD">Dólares ($)</option>
            <option value="EUR">Euros (€)</option>
          </select>
        </div>

        @if (saveError()) {
          <div class="error-message">
            {{ saveError() | translate }}
          </div>
        }

        <div class="form-actions">
          <button
            type="button"
            class="btn-secondary"
            (click)="onBack.emit()"
          >
            {{ 'common.back' | translate }}
          </button>
          <button
            type="submit"
            class="btn-primary"
            [disabled]="isSaving()"
          >
            @if (isSaving()) {
              <span class="spinner"></span>
              {{ 'common.saving' | translate }}
            } @else {
              {{ 'accounts.form.save' | translate }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .step-account {
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }

    .step-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .step-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #e8f5e9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 2rem;
    }

    .step-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 0.5rem 0;
    }

    .step-subtitle {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }

    .account-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 400px;
      margin: 0 auto;
      width: 100%;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #333;
    }

    .form-input,
    .form-select {
      padding: 0.875rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: white;
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #2ab27b;
      box-shadow: 0 0 0 3px rgba(42, 178, 123, 0.1);
    }

    .form-input.invalid,
    .form-select.invalid {
      border-color: #e53935;
    }

    .field-error {
      font-size: 0.75rem;
      color: #e53935;
    }

    .error-message {
      padding: 0.75rem 1rem;
      background: #ffebee;
      border-radius: 8px;
      color: #c62828;
      font-size: 0.875rem;
      text-align: center;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn-secondary {
      flex: 1;
      padding: 0.875rem 1.5rem;
      border: 2px solid #e0e0e0;
      background: white;
      color: #666;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      border-color: #bdbdbd;
      background: #f5f5f5;
    }

    .btn-primary {
      flex: 2;
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, #2ab27b 0%, #1e8a5f 100%);
      color: white;
      border: none;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(42, 178, 123, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .step-account {
        padding: 1rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-secondary,
      .btn-primary {
        flex: none;
        width: 100%;
      }
    }
  `]
})
export class StepAccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly transactionCommandService = inject(TransactionCommandService);

  onAccountCreated = output<AccountResource>();
  onBack = output<void>();

  readonly isSaving = signal(false);
  readonly saveError = signal('');

  accountForm: FormGroup;

  constructor() {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      currency: ['PEN', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');

    const formValue = this.accountForm.value;
    const command = new CreateAccountCommand(
      formValue.name,
      formValue.currency
    );

    this.transactionCommandService.handleCreateAccount(command)
      .subscribe({
        next: (account) => {
          this.isSaving.set(false);
          this.onAccountCreated.emit(account);
        },
        error: (error) => {
          console.error('Error creating account:', error);
          this.saveError.set('accounts.form.errors.save');
          this.isSaving.set(false);
        }
      });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.accountForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'accounts.form.errors.required';
      }
      if (field.errors?.['minlength']) {
        return 'accounts.form.errors.minLength';
      }
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.accountForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
