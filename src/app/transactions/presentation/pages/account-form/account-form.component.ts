/**
 * Transactions Bounded Context - Presentation Layer
 * Account Form Component
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { TransactionCommandService } from '../../../application/internal/commandservices/transaction-command.service';
import { CreateAccountCommand } from '../../../domain/model/commands/create-account.command';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css'],
})
export class AccountFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly transactionCommandService = inject(TransactionCommandService);

  // Modal support
  isModal = false;
  onClose?: () => void;
  onSuccess?: () => void;

  // State signals
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
        next: () => {
          this.isSaving.set(false);

          // If modal, call success callback
          if (this.isModal && this.onSuccess) {
            this.onSuccess();
          }
        },
        error: (error) => {
          console.error('Error creating account:', error);
          this.saveError.set('accounts.form.errors.save');
          this.isSaving.set(false);
        }
      });
  }

  cancel(): void {
    if (this.isModal && this.onClose) {
      this.onClose();
    }
  }

  // Helper methods
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
