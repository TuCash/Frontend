import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IncomeService, Income } from './income.service';
import { AuthService } from '../auth/auth.service';
import { forkJoin } from 'rxjs';

interface IncomeTotals {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
}

interface IncomeCategory {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-incomes-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './incomes-page.component.html',
  styleUrls: ['./incomes-page.component.css'],
})
export class IncomesPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly incomeService = inject(IncomeService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  readonly currency = 'S/';
  readonly categories: IncomeCategory[] = [
    { value: 'salary', label: 'incomes.categories.salary', icon: '\uD83D\uDCBC' }, // briefcase
    { value: 'freelance', label: 'incomes.categories.freelance', icon: '\uD83D\uDCBB' }, // laptop
    { value: 'bonus', label: 'incomes.categories.bonus', icon: '\uD83C\uDF81' }, // gift
    { value: 'rental', label: 'incomes.categories.rental', icon: '\uD83C\uDFE0' }, // house
    { value: 'other', label: 'incomes.categories.other', icon: '\u2795' }, // plus
  ];

  readonly incomes = signal<Income[]>([]);
  readonly totals = signal<IncomeTotals>({
    totalIncomes: 0,
    totalExpenses: 0,
    balance: 0,
  });

  isLoading = true;
  loadError = '';
  showForm = false;
  isSubmitting = false;

  incomeForm: FormGroup = this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(80)]],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    category: ['salary', Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    notes: ['', Validators.maxLength(200)],
    recurring: [false],
  });

  get authUser() {
    return this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadData();
  }

  showCreateForm(): void {
    this.showForm = true;
  }

  hideCreateForm(): void {
    this.showForm = false;
    this.incomeForm.reset({
      description: '',
      amount: null,
      category: 'salary',
      date: new Date().toISOString().substring(0, 10),
      notes: '',
      recurring: false,
    });
  }

  submitIncome(): void {
    if (this.incomeForm.invalid || this.isSubmitting) {
      this.incomeForm.markAllAsTouched();
      return;
    }

    const user = this.authUser;
    if (!user) {
      this.loadError = 'incomes.errors.noUser';
      return;
    }

    this.isSubmitting = true;

    const payload = {
      userId: user.id,
      description: this.incomeForm.value.description,
      amount: Number(this.incomeForm.value.amount),
      category: this.incomeForm.value.category,
      date: new Date(this.incomeForm.value.date).toISOString(),
      notes: this.incomeForm.value.notes ?? '',
      recurring: !!this.incomeForm.value.recurring,
    };

    this.incomeService.createIncome(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.hideCreateForm();
        this.loadData();
      },
      error: error => {
        console.error('Failed to create income', error);
        this.isSubmitting = false;
        this.loadError = 'incomes.errors.create';
      },
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

  private loadData(): void {
    const user = this.authUser;
    if (!user) {
      this.loadError = 'incomes.errors.noUser';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      incomes: this.incomeService.listIncomes(user.id),
      expenses: this.incomeService.listExpenses(user.id),
    }).subscribe({
      next: ({ incomes, expenses }) => {
        const totalIncomes = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

        this.incomes.set(
          incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        this.totals.set({
          totalIncomes,
          totalExpenses,
          balance: totalIncomes - totalExpenses,
        });
        this.isLoading = false;
      },
      error: error => {
        console.error('Failed to load incomes', error);
        this.isLoading = false;
        this.loadError = 'incomes.errors.load';
      },
    });
  }

  categoryLabel(value: string): string {
    const category = this.categories.find(cat => cat.value === value);
    return category ? category.label : value;
  }

  categoryIcon(value: string): string {
    const category = this.categories.find(cat => cat.value === value);
    return category ? category.icon : '\uD83D\uDCB5';
  }
}
