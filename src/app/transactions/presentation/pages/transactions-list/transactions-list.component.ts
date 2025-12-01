/**
 * Transactions Bounded Context - Presentation Layer
 * Transactions List Component
 */

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { TransactionQueryService } from '../../../application/internal/queryservices/transaction-query.service';
import { GetAllTransactionsQuery } from '../../../domain/model/queries/get-all-transactions.query';
import { GetAllAccountsQuery } from '../../../domain/model/queries/get-all-accounts.query';
import { TransactionResource } from '../../resources/transaction.resource';
import { AccountResource } from '../../resources/account.resource';
import { getFirstDayOfMonth, getTodayFormatted } from '../../../../shared/utils/date.utils';

interface TransactionGroup {
  date: string;
  dateLabel: string;
  transactions: TransactionResource[];
  totalIncome: number;
  totalExpenses: number;
}

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css'],
})
export class TransactionsListComponent implements OnInit {
  private readonly transactionQueryService = inject(TransactionQueryService);

  // State signals
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly visibleCount = signal(10);

  // Data signals
  readonly transactions = signal<TransactionResource[]>([]);
  readonly accounts = signal<AccountResource[]>([]);

  // Computed
  readonly groupedTransactions = computed(() => {
    const txs = this.transactions();
    const groups = new Map<string, TransactionGroup>();

    txs.forEach(tx => {
      const date = tx.transactionDate.split('T')[0]; // Extract YYYY-MM-DD

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

    // Sort by date descending
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
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    // Load accounts first
    this.transactionQueryService.handleGetAllAccounts(new GetAllAccountsQuery())
      .subscribe({
        next: (accounts) => {
          this.accounts.set(accounts);

          // Then load transactions - WITHOUT date filters to avoid backend 500 error
          console.log('📡 Loading all transactions from backend');

          this.transactionQueryService.handleGetAllTransactions(
            new GetAllTransactionsQuery(undefined, undefined, undefined, undefined, 0, 200)
          ).subscribe({
            next: (data) => {
              console.log('✅ Transactions loaded successfully:', data);
              console.log(`Total transactions: ${data.content.length}`);

              // Filter by current month on frontend
              const fromDate = getFirstDayOfMonth();
              const toDate = getTodayFormatted();

              const filteredTransactions = data.content.filter(t => {
                const txDate = t.transactionDate.split('T')[0];
                return txDate >= fromDate && txDate <= toDate;
              });

              console.log(`Filtered to current month: ${filteredTransactions.length} transactions`);

              this.transactions.set(filteredTransactions);
              this.isLoading.set(false);
            },
            error: (error) => {
              console.error('❌ Error loading transactions:', error);
              console.error('Error details:', {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                url: error.url
              });

              if (error.status === 500) {
                console.error('🔴 Backend /transactions endpoint returned 500 error');
                console.error('Check backend logs for the root cause');
              }

              this.loadError.set('transactions.errors.load');
              this.isLoading.set(false);
            }
          });
        },
        error: (error) => {
          console.error('Error loading accounts:', error);
          this.loadError.set('transactions.errors.loadAccounts');
          this.isLoading.set(false);
        }
      });
  }

  loadMore(): void {
    this.visibleCount.update(count => count + 10);
  }

  reload(): void {
    this.visibleCount.set(10);
    this.loadData();
  }

  // Helper methods
  formatAmount(amount: number, type: string): string {
    const sign = type === 'INCOME' ? '+' : '-';
    return `${sign}S/${amount.toFixed(2)}`;
  }

  formatGroupDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
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

  getAccountName(accountId: number): string {
    const account = this.accounts().find(a => a.id === accountId);
    return account?.name || 'Cuenta desconocida';
  }
}
