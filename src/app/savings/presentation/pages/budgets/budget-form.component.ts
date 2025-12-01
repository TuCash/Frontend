/**
 * Savings Bounded Context - Presentation Layer
 * Budget Form Component
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SavingsCommandService } from '../../../application/internal/commandservices/savings-command.service';
import { TransactionQueryService } from '../../../../transactions/application/internal/queryservices/transaction-query.service';
import { CreateBudgetCommand } from '../../../domain/model/commands/create-budget.command';
import { GetAllCategoriesQuery } from '../../../../transactions/domain/model/queries/get-all-categories.query';
import { CategoryResource } from '../../../../transactions/presentation/resources/category.resource';
import { getTodayFormatted, getFirstDayOfMonth, getLastDayOfMonth } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.css'],
})
export class BudgetFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly savingsCommandService = inject(SavingsCommandService);
  private readonly transactionQueryService = inject(TransactionQueryService);

  // Modal support
  isModal = false;
  onClose?: () => void;
  onSuccess?: () => void;

  // State signals
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly categories = signal<CategoryResource[]>([]);
  readonly selectedPeriod = signal<string>('MONTHLY');

  budgetForm!: FormGroup;

  readonly periods = [
    { value: 'WEEKLY', label: 'Semanal' },
    { value: 'MONTHLY', label: 'Mensual' },
    { value: 'YEARLY', label: 'Anual' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.budgetForm = this.fb.group({
      categoryId: [null, Validators.required],
      limitAmount: [null, [Validators.required, Validators.min(0.01)]],
      period: ['MONTHLY', Validators.required],
      startDate: [getFirstDayOfMonth(), Validators.required],
      endDate: [getLastDayOfMonth(), Validators.required],
    });

    // Listen to period changes to update dates
    this.budgetForm.get('period')?.valueChanges.subscribe((period: string) => {
      this.selectedPeriod.set(period);
      this.updateDatesByPeriod(period);
    });
  }

  private updateDatesByPeriod(period: string): void {
    const today = new Date();
    let startDate: string;
    let endDate: string;

    switch (period) {
      case 'WEEKLY':
        startDate = getTodayFormatted();
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 6);
        endDate = weekEnd.toISOString().split('T')[0];
        break;
      case 'MONTHLY':
        startDate = getFirstDayOfMonth();
        endDate = getLastDayOfMonth();
        break;
      case 'YEARLY':
        startDate = `${today.getFullYear()}-01-01`;
        endDate = `${today.getFullYear()}-12-31`;
        break;
      default:
        startDate = getFirstDayOfMonth();
        endDate = getLastDayOfMonth();
    }

    this.budgetForm.patchValue({
      startDate,
      endDate
    });
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    // Load only EXPENSE categories for budgets
    this.transactionQueryService.handleGetAllCategories(new GetAllCategoriesQuery('EXPENSE'))
      .subscribe({
        next: (categories) => {
          console.log('✅ Categories loaded for budgets:', categories);
          this.categories.set(categories);
          this.isLoading.set(false);

          // Preselect first category if available
          if (categories.length > 0) {
            this.budgetForm.patchValue({ categoryId: categories[0].id });
          }
        },
        error: (error) => {
          console.error('❌ Error loading categories:', error);
          this.loadError.set('budgets.form.errors.loadCategories');
          this.isLoading.set(false);
        },
      });
  }

  onSubmit(): void {
    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');

    const formValue = this.budgetForm.value;
    const command = new CreateBudgetCommand(
      formValue.categoryId,
      formValue.limitAmount,
      formValue.period,
      formValue.startDate,
      formValue.endDate
    );

    this.savingsCommandService.handleCreateBudget(command).subscribe({
      next: () => {
        this.isSaving.set(false);

        // If modal, call success callback
        if (this.isModal && this.onSuccess) {
          this.onSuccess();
        }
      },
      error: (error) => {
        console.error('❌ Error creating budget:', error);
        this.saveError.set('budgets.form.errors.save');
        this.isSaving.set(false);
      },
    });
  }

  cancel(): void {
    if (this.isModal && this.onClose) {
      this.onClose();
    }
  }

  // Helper methods
  getFieldError(fieldName: string): string | null {
    const field = this.budgetForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'budgets.form.errors.required';
      }
      if (field.errors?.['min']) {
        return 'budgets.form.errors.minAmount';
      }
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.budgetForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
