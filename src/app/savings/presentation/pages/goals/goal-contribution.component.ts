/**
 * Savings Bounded Context - Presentation Layer
 * Goal Contribution Component (Modal)
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SavingsCommandService } from '../../../application/internal/commandservices/savings-command.service';
import { TransactionQueryService } from '../../../../transactions/application/internal/queryservices/transaction-query.service';
import { ContributeToGoalCommand } from '../../../domain/model/commands/contribute-to-goal.command';
import { AccountResource } from '../../../../transactions/presentation/resources/account.resource';
import { TransactionResource } from '../../../../transactions/presentation/resources/transaction.resource';
import { GetAllAccountsQuery } from '../../../../transactions/domain/model/queries/get-all-accounts.query';

@Component({
  selector: 'app-goal-contribution',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './goal-contribution.component.html',
  styleUrls: ['./goal-contribution.component.css'],
})
export class GoalContributionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly savingsCommandService = inject(SavingsCommandService);
  private readonly transactionQueryService = inject(TransactionQueryService);

  // Modal support
  isModal = false;
  goalId!: number;
  goalName = '';
  onClose?: () => void;
  onSuccess?: () => void;

  // State signals
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly accounts = signal<AccountResource[]>([]);
  readonly contributions = signal<TransactionResource[]>([]);
  readonly activeTab = signal<'add' | 'history'>('add');

  contributionForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.contributionForm = this.fb.group({
      accountId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01), this.contributionLimitValidator()]],
      description: [''],
    });

    // Revalidate amount when account changes
    this.contributionForm.get('accountId')?.valueChanges.subscribe(() => {
      this.contributionForm.get('amount')?.updateValueAndValidity({ onlySelf: true });
    });
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    // Load accounts
    this.transactionQueryService.handleGetAllAccounts(new GetAllAccountsQuery()).subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        // Revalidate amount now that balances are available
        this.contributionForm.get('amount')?.updateValueAndValidity({ onlySelf: true });
        this.loadContributions();
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.loadError.set('goals.contributions.errors.loadAccounts');
        this.isLoading.set(false);
      },
    });
  }

  private loadContributions(): void {
    this.savingsCommandService.handleGetGoalContributions(this.goalId).subscribe({
      next: (contributions) => {
        this.contributions.set(contributions);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading contributions:', error);
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.contributionForm.invalid) {
      this.contributionForm.markAllAsTouched();
      return;
    }

    // Prevent contributions above account balance
    const amountControl = this.contributionForm.get('amount');
    amountControl?.updateValueAndValidity({ onlySelf: true });
    if (amountControl?.errors?.['insufficientFunds']) {
      this.contributionForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');

    const formValue = this.contributionForm.value;
    const command = new ContributeToGoalCommand(
      this.goalId,
      formValue.accountId,
      formValue.amount,
      formValue.description || undefined
    );

    this.savingsCommandService.handleContributeToGoal(command).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.contributionForm.reset();
        this.loadContributions();
        if (this.onSuccess) {
          this.onSuccess();
        }
      },
      error: (error) => {
        console.error('Error creating contribution:', error);
        this.saveError.set('goals.contributions.errors.save');
        this.isSaving.set(false);
      },
    });
  }

  revertContribution(transactionId: number): void {
    if (!confirm('¿Estás seguro de revertir esta contribución? El dinero volverá a la cuenta original.')) {
      return;
    }

    this.savingsCommandService.handleRevertContribution(this.goalId, transactionId).subscribe({
      next: () => {
        this.loadContributions();
        if (this.onSuccess) {
          this.onSuccess();
        }
      },
      error: (error) => {
        console.error('Error reverting contribution:', error);
        alert('Error al revertir la contribución');
      },
    });
  }

  cancel(): void {
    if (this.onClose) {
      this.onClose();
    }
  }

  setActiveTab(tab: 'add' | 'history'): void {
    this.activeTab.set(tab);
  }

  formatAmount(amount: number): string {
    return `S/${amount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.contributionForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) return 'goals.contributions.errors.required';
      if (field.errors?.['min']) return 'goals.contributions.errors.minAmount';
      if (field.errors?.['insufficientFunds']) return 'goals.contributions.errors.insufficientFunds';
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contributionForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  private contributionLimitValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control.parent as FormGroup | null;
      if (!form) return null;

      const accountId = form.get('accountId')?.value as number | null;
      if (!accountId) return null;

      const account = this.accounts().find(acc => acc.id === accountId);
      if (!account) return null;

      const amount = control.value as number | null;
      if (amount === null || amount === undefined) return null;

      return amount > account.balance ? { insufficientFunds: true } : null;
    };
  }
}
