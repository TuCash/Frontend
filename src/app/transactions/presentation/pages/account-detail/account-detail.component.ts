/**
 * Transactions Bounded Context - Presentation Layer
 * Account Detail Component - Shows transactions for a specific account
 */

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { TransactionQueryService } from '../../../application/internal/queryservices/transaction-query.service';
import { GetAllTransactionsQuery } from '../../../domain/model/queries/get-all-transactions.query';
import { TransactionResource } from '../../resources/transaction.resource';
import { AccountResource } from '../../resources/account.resource';
import { getCurrencySymbol } from '../../../../shared/utils/currency.utils';

interface TransactionGroup {
  date: string;
  dateLabel: string;
  transactions: TransactionResource[];
  totalIncome: number;
  totalExpenses: number;
}

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css'],
})
export class AccountDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly transactionQueryService = inject(TransactionQueryService);

  // State signals
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly visibleCount = signal(10);

  // Data signals
  readonly account = signal<AccountResource | null>(null);
  readonly transactions = signal<TransactionResource[]>([]);

  // Computed
  readonly currencySymbol = computed(() => {
    const acc = this.account();
    return acc ? getCurrencySymbol(acc.currency) : 'S/';
  });

  readonly totalIncome = computed(() =>
    this.transactions()
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly totalExpenses = computed(() =>
    this.transactions()
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  readonly balance = computed(() => this.totalIncome() - this.totalExpenses());

  readonly groupedTransactions = computed(() => {
    const txs = this.transactions();
    const groups = new Map<string, TransactionGroup>();

    txs.forEach(tx => {
      const date = tx.transactionDate.split('T')[0];

      if (!groups.has(date)) {
        groups.set(date, {
          date,
          dateLabel: this.formatGroupDate(date),
          transactions: [],
          totalIncome: 0,
          totalExpenses: 0,
        });
      }

      const group = groups.get(date)!;
      group.transactions.push(tx);

      if (tx.type === 'INCOME') {
        group.totalIncome += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        group.totalExpenses += tx.amount;
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  });

  readonly visibleGroups = computed(() => {
    const groups = this.groupedTransactions();
    let count = 0;
    const visible: TransactionGroup[] = [];

    for (const group of groups) {
      if (count >= this.visibleCount()) break;

      const remainingSlots = this.visibleCount() - count;
      const transactionsToShow = group.transactions.slice(0, remainingSlots);

      if (transactionsToShow.length > 0) {
        visible.push({
          ...group,
          transactions: transactionsToShow
        });
        count += transactionsToShow.length;
      }
    }

    return visible;
  });

  readonly hasMore = computed(() => {
    let total = 0;
    for (const group of this.groupedTransactions()) {
      total += group.transactions.length;
    }
    return total > this.visibleCount();
  });

  readonly chartData = computed(() => {
    const income = this.totalIncome();
    const expenses = this.totalExpenses();
    const total = income + expenses;

    return {
      income,
      expenses,
      incomePercent: total > 0 ? Math.round((income / total) * 100) : 0,
      expensesPercent: total > 0 ? Math.round((expenses / total) * 100) : 0,
    };
  });

  ngOnInit(): void {
    const accountId = Number(this.route.snapshot.paramMap.get('id'));
    if (accountId) {
      this.loadAccountData(accountId);
    } else {
      this.loadError.set('accounts.errors.notFound');
      this.isLoading.set(false);
    }
  }

  private loadAccountData(accountId: number): void {
    this.isLoading.set(true);
    this.loadError.set('');

    // Load account details
    this.transactionQueryService.handleGetAccountById(accountId)
      .subscribe({
        next: (account) => {
          this.account.set(account);
          this.loadTransactions(accountId);
        },
        error: (error) => {
          console.error('Error loading account:', error);
          this.loadError.set('accounts.errors.load');
          this.isLoading.set(false);
        }
      });
  }

  private loadTransactions(accountId: number): void {
    // Load all transactions and filter by accountId on frontend
    // (Backend may not support accountId filter)
    const query = new GetAllTransactionsQuery(
      undefined,  // type
      undefined,  // categoryId
      undefined,  // fromDate
      undefined,  // toDate
      0,          // page
      500,        // size - get more to ensure we have all for this account
      accountId   // accountId (if backend supports it)
    );

    this.transactionQueryService.handleGetAllTransactions(query)
      .subscribe({
        next: (data) => {
          // Filter by accountId on frontend to ensure only this account's transactions
          const filteredTransactions = data.content.filter(tx => tx.accountId === accountId);
          console.log(`✅ Loaded ${data.content.length} transactions, filtered to ${filteredTransactions.length} for account ${accountId}`);
          this.transactions.set(filteredTransactions);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
          // Still show account even if transactions fail
          this.transactions.set([]);
          this.isLoading.set(false);
        }
      });
  }

  goBack(): void {
    this.location.back();
  }

  loadMore(): void {
    this.visibleCount.update(count => count + 10);
  }

  reload(): void {
    const acc = this.account();
    if (acc) {
      this.visibleCount.set(10);
      this.loadAccountData(acc.id);
    }
  }

  // Helper methods
  formatAmount(amount: number, type: string): string {
    const sign = type === 'INCOME' ? '+' : '-';
    return `${sign}${this.currencySymbol()}${amount.toFixed(2)}`;
  }

  formatGroupDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return 'Hoy';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTransactionIcon(type: string): string {
    return type === 'INCOME' ? '⬆️' : type === 'EXPENSE' ? '⬇️' : '↔️';
  }
}
