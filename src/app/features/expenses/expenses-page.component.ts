import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpensesService, Expense } from './expenses.service';
import { AuthService } from '../auth/auth.service';
import { forkJoin } from 'rxjs';
import { ExpenseFormDialogComponent } from './expense-form-dialog.component';

interface ExpensesTotals {
  totalExpenses: number;
  totalIncomes: number;
  balance: number;
}

interface ExpenseCategory {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-expenses-page',
  standalone: true,
  imports: [TranslateModule, MatButtonModule, MatIconModule, MatDialogModule, CommonModule],
  templateUrl: 'expenses-page.component.html',
  styleUrls: ['expenses-page.component.css'],
})
export class ExpensesPageComponent implements OnInit {
  private readonly expensesService = inject(ExpensesService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  readonly currency = 'S/';
  readonly categories: ExpenseCategory[] = [
    { value: 'housing', label: 'expenses.categories.housing', icon: '\uD83C\uDFE0' },
    { value: 'transport', label: 'expenses.categories.transport', icon: '\uD83D\uDE95' },
    { value: 'food', label: 'expenses.categories.food', icon: '\uD83C\uDF74' },
    { value: 'utilities', label: 'expenses.categories.utilities', icon: '\uD83D\uDD0C' },
    { value: 'entertainment', label: 'expenses.categories.entertainment', icon: '\uD83C\uDF7F' },
    { value: 'health', label: 'expenses.categories.health', icon: '\uD83C\uDFE5' },
    { value: 'other', label: 'expenses.categories.other', icon: '\u2796' },
  ];

  readonly expenses = signal<Expense[]>([]);
  readonly totals = signal<ExpensesTotals>({
    totalExpenses: 0,
    totalIncomes: 0,
    balance: 0,
  });

  isLoading = true;
  loadError = '';

  get authUser() {
    return this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadData();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ExpenseFormDialogComponent, {
      width: '480px',
      data: { categories: this.categories },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      const user = this.authUser;
      if (!user) {
        this.loadError = 'expenses.errors.noUser';
        return;
      }

      const payload = {
        userId: user.id,
        description: result.description,
        amount: Number(result.amount),
        category: result.category,
        date: new Date(result.date).toISOString(),
        notes: result.notes ?? '',
        recurring: !!result.recurring,
      };

      this.expensesService.createExpense(payload).subscribe({
        next: () => this.loadData(),
        error: error => {
          console.error('Failed to create expense', error);
          this.loadError = 'expenses.errors.create';
        },
      });
    });
  }

  reload(): void {
    this.loadData();
  }

  goBack(): void {
    window.history.back();
  }

  formatAmount(amount: number, withSign = false): string {
    const formatter = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    });
    const formatted = formatter.format(Math.abs(amount)).replace('PEN', this.currency).trim();
    if (!withSign) {
      return formatted;
    }
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${formatted}`;
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat(this.translate.currentLang || 'es', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(date));
  }

  categoryLabel(value: string): string {
    const category = this.categories.find(item => item.value === value);
    return category ? category.label : value;
  }

  categoryIcon(value: string): string {
    const category = this.categories.find(item => item.value === value);
    return category ? category.icon : '\uD83D\uDED2';
  }

  private loadData(): void {
    const user = this.authUser;
    if (!user) {
      this.isLoading = false;
      this.loadError = 'expenses.errors.noUser';
      return;
    }

    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      expenses: this.expensesService.listExpenses(user.id),
      incomes: this.expensesService.listIncomes(user.id),
    }).subscribe({
      next: ({ expenses, incomes }) => {
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        const totalIncomes = incomes.reduce((sum, item) => sum + item.amount, 0);
        this.expenses.set(
          expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        this.totals.set({
          totalExpenses,
          totalIncomes,
          balance: totalIncomes - totalExpenses,
        });
        this.isLoading = false;
      },
      error: error => {
        console.error('Failed to load expenses', error);
        this.isLoading = false;
        this.loadError = 'expenses.errors.load';
      },
    });
  }
}
