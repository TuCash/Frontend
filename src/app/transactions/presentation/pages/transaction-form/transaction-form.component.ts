/**
 * Transactions Bounded Context - Presentation Layer
 * Transaction Form Component
 */

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { forkJoin } from 'rxjs';

import { TransactionCommandService } from '../../../application/internal/commandservices/transaction-command.service';
import { TransactionQueryService } from '../../../application/internal/queryservices/transaction-query.service';
import { CreateTransactionCommand } from '../../../domain/model/commands/create-transaction.command';
import { CreateCategoryCommand } from '../../../domain/model/commands/create-category.command';
import { GetAllAccountsQuery } from '../../../domain/model/queries/get-all-accounts.query';
import { GetAllCategoriesQuery } from '../../../domain/model/queries/get-all-categories.query';
import { AccountResource } from '../../resources/account.resource';
import { CategoryResource } from '../../resources/category.resource';
import { getTodayFormatted } from '../../../../shared/utils/date.utils';

type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatOptionModule
  ],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css'],
})
export class TransactionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly transactionCommandService = inject(TransactionCommandService);
  private readonly transactionQueryService = inject(TransactionQueryService);

  // Modal support
  isModal = false;
  initialType?: TransactionType;
  onClose?: () => void;
  onSuccess?: () => void;

  // State signals
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly selectedType = signal<TransactionType>('EXPENSE');

  // Data signals
  readonly accounts = signal<AccountResource[]>([]);
  readonly allCategories = signal<CategoryResource[]>([]);

  // New category form
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

  // Computed
  readonly filteredCategories = computed(() => {
    const type = this.selectedType();
    const filtered = this.allCategories().filter(c => c.type === type);
    console.log(`🔍 Filtering categories for type: ${type}`);
    console.log(`📊 All categories count: ${this.allCategories().length}`);
    console.log(`📊 Filtered categories count: ${filtered.length}`);
    console.log(`📋 Filtered categories:`, filtered.map(c => ({ id: c.id, name: c.name, type: c.type })));
    console.log(`🔍 Types in allCategories:`, [...new Set(this.allCategories().map(c => c.type))]);
    return filtered;
  });

  transactionForm!: FormGroup;

  ngOnInit(): void {
    // Set initial type if provided (for modal)
    if (this.initialType) {
      this.selectedType.set(this.initialType);
    }

    this.initForm();
    this.loadData();

    // Only check query params if not modal
    if (!this.isModal) {
      this.checkQueryParams();
    }
  }

  private initForm(): void {
    this.transactionForm = this.fb.group({
      type: [this.selectedType(), Validators.required],
      accountId: [null, Validators.required],
      categoryId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: [''],
      transactionDate: [getTodayFormatted(), Validators.required],
    });

    // Listen to type changes
    this.transactionForm.get('type')?.valueChanges.subscribe((type: TransactionType) => {
      this.selectedType.set(type);
      // Reset category when type changes
      this.transactionForm.patchValue({ categoryId: null });
    });
  }

  private checkQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        const type = params['type'] as TransactionType;
        this.selectedType.set(type);
        this.transactionForm.patchValue({ type });
      }
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    // Load accounts
    this.transactionQueryService.handleGetAllAccounts(new GetAllAccountsQuery())
      .subscribe({
        next: (accounts) => {
          this.accounts.set(accounts);

          // Preselect first account if available
          if (accounts.length > 0 && !this.transactionForm.get('accountId')?.value) {
            this.transactionForm.patchValue({ accountId: accounts[0].id });
          }

          // Load categories
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error loading accounts:', error);
          this.loadError.set('transactions.form.errors.loadAccounts');
          this.isLoading.set(false);
        }
      });
  }

  private loadCategories(categoryIdToSelect?: number): void {
    console.log('🔄 Calling GET /categories for INCOME and EXPENSE separately to get ALL categories including system ones');

    // Fetch INCOME categories
    const incomeQuery = this.transactionQueryService.handleGetAllCategories(new GetAllCategoriesQuery('INCOME'));
    // Fetch EXPENSE categories
    const expenseQuery = this.transactionQueryService.handleGetAllCategories(new GetAllCategoriesQuery('EXPENSE'));

    // Combine both requests
    forkJoin([incomeQuery, expenseQuery]).subscribe({
      next: ([incomeCategories, expenseCategories]) => {
        const allCategories = [...incomeCategories, ...expenseCategories];
        console.log('📂 Categories loaded from backend:', allCategories);
        console.log(`Total categories: ${allCategories.length}`);
        console.log('Full category list:', allCategories.map(c => ({ id: c.id, name: c.name, type: c.type })));
        console.log('INCOME categories:', incomeCategories.map(c => c.name));
        console.log('EXPENSE categories:', expenseCategories.map(c => c.name));

        // WORKAROUND: If we're expecting a specific category but backend didn't return it,
        // merge with existing categories to keep the newly created one
        let finalCategories = allCategories;
        if (categoryIdToSelect) {
          const categoryInResponse = allCategories.some(c => c.id === categoryIdToSelect);
          if (!categoryInResponse) {
            console.warn(`⚠️ Backend did not return category ${categoryIdToSelect}, keeping local version`);
            const currentCategories = this.allCategories();
            const missingCategory = currentCategories.find(c => c.id === categoryIdToSelect);
            if (missingCategory) {
              finalCategories = [...allCategories, missingCategory];
              console.log('✅ Merged local category with backend response');
            }
          }
        }

        this.allCategories.set(finalCategories);

        // If a specific category ID was provided, select it (for newly created categories)
        if (categoryIdToSelect) {
          console.log(`Selecting newly created category with ID: ${categoryIdToSelect}`);
          this.transactionForm.patchValue({ categoryId: categoryIdToSelect });
        } else {
          // Otherwise, preselect first category of the current type if no category is selected
          const currentCategoryId = this.transactionForm.get('categoryId')?.value;
          if (!currentCategoryId) {
            const filtered = this.filteredCategories();
            console.log(`Filtered categories for type ${this.selectedType()}:`, filtered.map(c => c.name));
            if (filtered.length > 0) {
              this.transactionForm.patchValue({ categoryId: filtered[0].id });
            }
          }
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading categories:', error);
        this.loadError.set('transactions.form.errors.loadCategories');
        this.isLoading.set(false);
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
      formValue.accountId,
      formValue.categoryId,
      formValue.type,
      formValue.amount,
      formValue.description,
      formValue.transactionDate
    );

    this.transactionCommandService.handleCreateTransaction(command)
      .subscribe({
        next: () => {
          this.isSaving.set(false);

          // If modal, call success callback
          if (this.isModal && this.onSuccess) {
            this.onSuccess();
          } else {
            // Otherwise navigate
            this.router.navigate(['/transactions']);
          }
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.saveError.set('transactions.form.errors.save');
          this.isSaving.set(false);
        }
      });
  }

  cancel(): void {
    if (this.isModal && this.onClose) {
      this.onClose();
    } else {
      this.router.navigate(['/transactions']);
    }
  }

  // Helper methods
  getFieldError(fieldName: string): string | null {
    const field = this.transactionForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'transactions.form.errors.required';
      }
      if (field.errors?.['min']) {
        return 'transactions.form.errors.minAmount';
      }
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.transactionForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
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
          console.log('✅ Category created successfully:', category);
          console.log('Category details:', {
            id: category.id,
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color
          });

          // WORKAROUND: Add the new category immediately to the local list
          // because backend might not return it right away
          const currentCategories = this.allCategories();
          const categoryExists = currentCategories.some(c => c.id === category.id);

          if (!categoryExists) {
            console.log('⚠️ Adding category locally because backend did not return it');
            this.allCategories.set([...currentCategories, category]);
          }

          // Select the newly created category
          this.transactionForm.patchValue({ categoryId: category.id });

          // Try to reload from backend anyway to sync
          this.loadCategories(category.id);

          // Hide form and reset
          this.showNewCategoryForm.set(false);
          this.isCreatingCategory.set(false);
          this.selectedIcon.set('📁');
          this.selectedColor.set('#2ab27b');
        },
        error: (error) => {
          console.error('❌ Error creating category:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          this.newCategoryError.set('transactions.form.errors.createCategory');
          this.isCreatingCategory.set(false);
        }
      });
  }
}
