/**
 * Onboarding - Presentation Layer
 * Step Transaction Component - Create first transaction (optional)
 */

import { Component, inject, input, output, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

import { TransactionCommandService } from '../../../../transactions/application/internal/commandservices/transaction-command.service';
import { TransactionQueryService } from '../../../../transactions/application/internal/queryservices/transaction-query.service';
import { CreateTransactionCommand } from '../../../../transactions/domain/model/commands/create-transaction.command';
import { CreateCategoryCommand } from '../../../../transactions/domain/model/commands/create-category.command';
import { GetAllCategoriesQuery } from '../../../../transactions/domain/model/queries/get-all-categories.query';
import { TransactionResource } from '../../../../transactions/presentation/resources/transaction.resource';
import { CategoryResource } from '../../../../transactions/presentation/resources/category.resource';
import { getTodayFormatted } from '../../../../shared/utils/date.utils';

type TransactionType = 'INCOME' | 'EXPENSE';

@Component({
  selector: 'app-step-transaction',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  template: `
    <div class="step-transaction">
      <div class="step-header">
        <div class="step-icon">
          <span>&#128200;</span>
        </div>
        <h2 class="step-title">{{ 'onboarding.transaction.title' | translate }}</h2>
        <p class="step-subtitle">{{ 'onboarding.transaction.subtitle' | translate }}</p>
      </div>

      @if (isLoading()) {
        <div class="loading">
          <div class="spinner-large"></div>
          <p>{{ 'common.loading' | translate }}</p>
        </div>
      } @else {
        <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="transaction-form">
          <!-- Transaction Type -->
          <div class="type-selector">
            <button
              type="button"
              class="type-btn"
              [class.active]="selectedType() === 'INCOME'"
              (click)="setType('INCOME')"
            >
              <span class="type-icon">&#11014;&#65039;</span>
              {{ 'transactions.types.income' | translate }}
            </button>
            <button
              type="button"
              class="type-btn expense"
              [class.active]="selectedType() === 'EXPENSE'"
              (click)="setType('EXPENSE')"
            >
              <span class="type-icon">&#11015;&#65039;</span>
              {{ 'transactions.types.expense' | translate }}
            </button>
          </div>

          <!-- Amount -->
          <div class="form-group">
            <label for="amount" class="form-label">
              {{ 'transactions.form.amount' | translate }} *
            </label>
            <div class="amount-input-wrapper">
              <span class="currency-prefix">S/</span>
              <input
                type="number"
                id="amount"
                formControlName="amount"
                class="form-input amount-input"
                [class.invalid]="isFieldInvalid('amount')"
                placeholder="0.00"
                step="0.01"
                min="0.01"
              />
            </div>
          </div>

          <!-- Category Section -->
          <div class="category-section">
            @if (!showNewCategoryForm()) {
              <div class="form-group">
                <label for="category" class="form-label">
                  {{ 'transactions.form.category' | translate }} *
                </label>
                <div class="select-with-button">
                  <select
                    id="category"
                    formControlName="categoryId"
                    class="form-select"
                    [class.invalid]="isFieldInvalid('categoryId')"
                  >
                    <option [value]="null" disabled>{{ 'transactions.form.selectCategory' | translate }}</option>
                    @for (category of filteredCategories(); track category.id) {
                      <option [value]="category.id">
                        {{ category.icon }} {{ category.name }}
                      </option>
                    }
                  </select>
                  <button type="button" class="btn-add-category" (click)="toggleNewCategoryForm()">
                    +
                  </button>
                </div>
                @if (filteredCategories().length === 0) {
                  <p class="hint-text">{{ 'onboarding.transaction.noCategories' | translate }}</p>
                }
              </div>
            } @else {
              <!-- Inline new category form -->
              <div class="new-category-form">
                <div class="new-category-header">
                  <span class="new-category-title">{{ 'transactions.form.addCategory' | translate }}</span>
                  <button type="button" class="btn-close-small" (click)="toggleNewCategoryForm()">×</button>
                </div>

                <!-- Icon Selector -->
                <div class="category-field">
                  <label class="category-field-label">{{ 'transactions.form.selectIcon' | translate }}</label>
                  <div class="icon-selector">
                    @for (icon of availableIcons; track icon) {
                      <button
                        type="button"
                        class="icon-option"
                        [class.selected]="selectedIcon() === icon"
                        (click)="selectIcon(icon)"
                      >
                        {{ icon }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Color Selector -->
                <div class="category-field">
                  <label class="category-field-label">{{ 'transactions.form.selectColor' | translate }}</label>
                  <div class="color-selector">
                    @for (color of availableColors; track color.value) {
                      <button
                        type="button"
                        class="color-option"
                        [class.selected]="selectedColor() === color.value"
                        [style.background-color]="color.value"
                        [title]="color.name"
                        (click)="selectColor(color.value)"
                      >
                        @if (selectedColor() === color.value) {
                          <span class="check-icon">&#10003;</span>
                        }
                      </button>
                    }
                  </div>
                </div>

                <!-- Name Input -->
                <div class="category-field">
                  <label class="category-field-label">{{ 'transactions.form.categoryName' | translate }} *</label>
                  <div class="input-with-button">
                    <input
                      #categoryNameInput
                      type="text"
                      class="form-input"
                      [placeholder]="'transactions.form.categoryNamePlaceholder' | translate"
                      [disabled]="isCreatingCategory()"
                    />
                    <button
                      type="button"
                      class="btn-confirm"
                      (click)="createNewCategory(categoryNameInput.value)"
                      [disabled]="isCreatingCategory()"
                    >
                      @if (isCreatingCategory()) {
                        <span class="spinner-small"></span>
                      } @else {
                        &#10003;
                      }
                    </button>
                  </div>
                  @if (newCategoryError()) {
                    <span class="error-text">{{ newCategoryError() | translate }}</span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" class="form-label">
              {{ 'transactions.form.description' | translate }}
            </label>
            <input
              type="text"
              id="description"
              formControlName="description"
              class="form-input"
              [placeholder]="'transactions.form.descriptionPlaceholder' | translate"
            />
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
              }
              {{ 'transactions.form.save' | translate }}
            </button>
          </div>
        </form>

        <div class="skip-section">
          <button type="button" class="btn-skip" (click)="onSkip.emit()">
            {{ 'onboarding.transaction.skip' | translate }}
          </button>
          <p class="skip-hint">{{ 'onboarding.transaction.skipHint' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .step-transaction {
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }

    .step-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .step-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #e3f2fd;
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

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      gap: 1rem;
      color: #666;
    }

    .spinner-large {
      width: 40px;
      height: 40px;
      border: 3px solid #e0e0e0;
      border-top-color: #2ab27b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .transaction-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 400px;
      margin: 0 auto;
      width: 100%;
    }

    .type-selector {
      display: flex;
      gap: 0.75rem;
    }

    .type-btn {
      flex: 1;
      padding: 1rem;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #666;
      transition: all 0.2s;
    }

    .type-btn:hover {
      border-color: #bdbdbd;
    }

    .type-btn.active {
      border-color: #2ab27b;
      background: #e8f5e9;
      color: #2ab27b;
    }

    .type-btn.expense.active {
      border-color: #e53935;
      background: #ffebee;
      color: #e53935;
    }

    .type-icon {
      font-size: 1.5rem;
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

    .amount-input-wrapper {
      display: flex;
      align-items: center;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .amount-input-wrapper:focus-within {
      border-color: #2ab27b;
      box-shadow: 0 0 0 3px rgba(42, 178, 123, 0.1);
    }

    .currency-prefix {
      padding: 0.875rem 1rem;
      background: #f5f5f5;
      color: #666;
      font-weight: 600;
      border-right: 2px solid #e0e0e0;
    }

    .amount-input {
      border: none !important;
      border-radius: 0 !important;
      flex: 1;
    }

    .amount-input:focus {
      box-shadow: none !important;
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

    /* Category Section */
    .category-section {
      margin: 0;
    }

    .select-with-button {
      display: flex;
      gap: 0.5rem;
    }

    .select-with-button .form-select {
      flex: 1;
    }

    .btn-add-category {
      width: 48px;
      height: 48px;
      border: 2px solid #2ab27b;
      background: white;
      color: #2ab27b;
      font-size: 1.5rem;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-add-category:hover {
      background: #2ab27b;
      color: white;
    }

    .hint-text {
      font-size: 0.75rem;
      color: #9e9e9e;
      margin: 0.25rem 0 0;
    }

    /* New Category Form */
    .new-category-form {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .new-category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .new-category-title {
      font-weight: 600;
      color: #333;
    }

    .btn-close-small {
      width: 28px;
      height: 28px;
      border: none;
      background: #e0e0e0;
      color: #666;
      font-size: 1.25rem;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-close-small:hover {
      background: #bdbdbd;
      color: #333;
    }

    .category-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-field-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
    }

    .icon-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .icon-option {
      width: 36px;
      height: 36px;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .icon-option:hover {
      border-color: #bdbdbd;
    }

    .icon-option.selected {
      border-color: #2ab27b;
      background: #e8f5e9;
    }

    .color-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .color-option {
      width: 32px;
      height: 32px;
      border: 2px solid transparent;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .color-option:hover {
      transform: scale(1.1);
    }

    .color-option.selected {
      border-color: #333;
      transform: scale(1.1);
    }

    .check-icon {
      color: white;
      font-size: 0.875rem;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    .input-with-button {
      display: flex;
      gap: 0.5rem;
    }

    .input-with-button .form-input {
      flex: 1;
    }

    .btn-confirm {
      width: 48px;
      height: 48px;
      border: none;
      background: #2ab27b;
      color: white;
      font-size: 1.25rem;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-confirm:hover:not(:disabled) {
      background: #239966;
    }

    .btn-confirm:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .error-text {
      font-size: 0.75rem;
      color: #e53935;
    }

    .spinner-small {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
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
      margin-top: 0.5rem;
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

    .skip-section {
      margin-top: 2rem;
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
    }

    .btn-skip {
      padding: 0.75rem 2rem;
      border: none;
      background: transparent;
      color: #9e9e9e;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s;
    }

    .btn-skip:hover {
      color: #666;
      text-decoration: underline;
    }

    .skip-hint {
      margin: 0.5rem 0 0;
      font-size: 0.75rem;
      color: #bdbdbd;
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
      .step-transaction {
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
export class StepTransactionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly transactionCommandService = inject(TransactionCommandService);
  private readonly transactionQueryService = inject(TransactionQueryService);

  accountId = input.required<number>();

  onTransactionCreated = output<TransactionResource>();
  onSkip = output<void>();
  onBack = output<void>();

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly saveError = signal('');
  readonly selectedType = signal<TransactionType>('EXPENSE');
  readonly allCategories = signal<CategoryResource[]>([]);

  // New category form state
  readonly showNewCategoryForm = signal(false);
  readonly isCreatingCategory = signal(false);
  readonly newCategoryError = signal('');
  readonly selectedIcon = signal('📁');
  readonly selectedColor = signal('#2ab27b');

  // Icon and color options
  readonly availableIcons = [
    '💰', '🏦', '💳', '💵', '💸', '🛒', '🍔', '🚗',
    '🏠', '⚡', '📱', '🎮', '🎬', '✈️', '🏥', '📚',
    '👕', '⛽', '🍕', '☕', '🎯', '💊', '🔧', '📁'
  ];

  readonly availableColors = [
    { name: 'Verde', value: '#2ab27b' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Amarillo', value: '#f59e0b' },
    { name: 'Morado', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Naranja', value: '#f97316' },
    { name: 'Gris', value: '#6b7280' }
  ];

  readonly filteredCategories = computed(() => {
    return this.allCategories().filter(c => c.type === this.selectedType());
  });

  transactionForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.transactionForm = this.fb.group({
      type: ['EXPENSE', Validators.required],
      categoryId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: [''],
      transactionDate: [getTodayFormatted(), Validators.required],
    });
  }

  private loadCategories(categoryIdToSelect?: number): void {
    this.isLoading.set(true);

    const incomeQuery = this.transactionQueryService.handleGetAllCategories(new GetAllCategoriesQuery('INCOME'));
    const expenseQuery = this.transactionQueryService.handleGetAllCategories(new GetAllCategoriesQuery('EXPENSE'));

    forkJoin([incomeQuery, expenseQuery]).subscribe({
      next: ([incomeCategories, expenseCategories]) => {
        let allCategories = [...incomeCategories, ...expenseCategories];

        // Keep newly created category if backend didn't return it
        if (categoryIdToSelect) {
          const categoryInResponse = allCategories.some(c => c.id === categoryIdToSelect);
          if (!categoryInResponse) {
            const currentCategories = this.allCategories();
            const missingCategory = currentCategories.find(c => c.id === categoryIdToSelect);
            if (missingCategory) {
              allCategories = [...allCategories, missingCategory];
            }
          }
        }

        this.allCategories.set(allCategories);

        // Select category if provided, otherwise preselect first
        if (categoryIdToSelect) {
          this.transactionForm.patchValue({ categoryId: categoryIdToSelect });
        } else {
          const filtered = this.filteredCategories();
          if (filtered.length > 0) {
            this.transactionForm.patchValue({ categoryId: filtered[0].id });
          }
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading.set(false);
      }
    });
  }

  setType(type: TransactionType): void {
    this.selectedType.set(type);
    this.transactionForm.patchValue({ type, categoryId: null });

    // Preselect first category of new type
    setTimeout(() => {
      const filtered = this.filteredCategories();
      if (filtered.length > 0) {
        this.transactionForm.patchValue({ categoryId: filtered[0].id });
      }
    });
  }

  // New category methods
  toggleNewCategoryForm(): void {
    const isShowing = this.showNewCategoryForm();
    this.showNewCategoryForm.set(!isShowing);
    this.newCategoryError.set('');

    // Reset selections when closing
    if (isShowing) {
      this.selectedIcon.set('📁');
      this.selectedColor.set('#2ab27b');
    }
  }

  selectIcon(icon: string): void {
    this.selectedIcon.set(icon);
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  createNewCategory(name: string): void {
    if (!name.trim()) {
      this.newCategoryError.set('transactions.form.errors.categoryName');
      return;
    }

    const type = this.selectedType();
    if (type !== 'INCOME' && type !== 'EXPENSE') {
      this.newCategoryError.set('transactions.form.errors.invalidType');
      return;
    }

    this.isCreatingCategory.set(true);
    this.newCategoryError.set('');

    const command = new CreateCategoryCommand(
      name.trim(),
      type,
      this.selectedIcon(),
      this.selectedColor()
    );

    this.transactionCommandService.handleCreateCategory(command)
      .subscribe({
        next: (category) => {
          // Add category locally immediately
          const currentCategories = this.allCategories();
          const categoryExists = currentCategories.some(c => c.id === category.id);

          if (!categoryExists) {
            this.allCategories.set([...currentCategories, category]);
          }

          // Select the newly created category
          this.transactionForm.patchValue({ categoryId: category.id });

          // Reload from backend to sync
          this.loadCategories(category.id);

          // Hide form and reset
          this.showNewCategoryForm.set(false);
          this.isCreatingCategory.set(false);
          this.selectedIcon.set('📁');
          this.selectedColor.set('#2ab27b');
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.newCategoryError.set('transactions.form.errors.createCategory');
          this.isCreatingCategory.set(false);
        }
      });
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveError.set('');

    const formValue = this.transactionForm.value;
    const command = new CreateTransactionCommand(
      this.accountId(),
      formValue.categoryId,
      formValue.type,
      formValue.amount,
      formValue.description,
      formValue.transactionDate
    );

    this.transactionCommandService.handleCreateTransaction(command)
      .subscribe({
        next: (transaction) => {
          this.isSaving.set(false);
          this.onTransactionCreated.emit(transaction);
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.saveError.set('transactions.form.errors.save');
          this.isSaving.set(false);
        }
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.transactionForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
