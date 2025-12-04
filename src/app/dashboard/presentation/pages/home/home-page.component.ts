/**
 * Dashboard Bounded Context - Presentation Layer
 * Home Page Component - Dashboard principal con datos reales
 */

import { Component, inject, OnInit, signal, computed, OnDestroy, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { IamQueryService } from '../../../../iam/application/internal/queryservices/iam-query.service';
import { DashboardQueryService } from '../../../application/internal/queryservices/dashboard-query.service';
import { TransactionQueryService } from '../../../../transactions/application/internal/queryservices/transaction-query.service';
import { ModalService } from '../../../../shared/infrastructure/services/modal.service';
import { WizardContainerComponent } from '../../../../onboarding/presentation/components/wizard-container/wizard-container.component';

import { GetPulseQuery } from '../../../domain/model/queries/get-pulse.query';
import { GetLeaksQuery } from '../../../domain/model/queries/get-leaks.query';
import { GetAllAccountsQuery } from '../../../../transactions/domain/model/queries/get-all-accounts.query';
import { GetAllTransactionsQuery } from '../../../../transactions/domain/model/queries/get-all-transactions.query';

import { formatDateForAPI, getFirstDayOfMonth, getTodayFormatted, getFirstDayOfMonthsAgo } from '../../../../shared/utils/date.utils';
import { getCurrencySymbol } from '../../../../shared/utils/currency.utils';
import { AccountResource } from '../../../../transactions/presentation/resources/account.resource';
import { TransactionResource } from '../../../../transactions/presentation/resources/transaction.resource';
import { DashboardPulseResource, CategoryLeakResource } from '../../../presentation/resources/dashboard.resource';
import { environment } from '../../../../../environments/environment';

type PeriodFilter = 'today' | 'week' | 'month' | 'year';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [TranslateModule, RouterLink, CommonModule, FormsModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  private readonly iamQueryService = inject(IamQueryService);
  private readonly dashboardQueryService = inject(DashboardQueryService);
  private readonly transactionQueryService = inject(TransactionQueryService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);
  private routerSubscription?: Subscription;
  private onboardingModalRef?: ComponentRef<WizardContainerComponent>;
  private hasCheckedOnboarding = false;

  // State signals
  readonly authUser = this.iamQueryService.getCurrentUser();
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly selectedPeriod = signal<PeriodFilter>('month');

  // Data signals
  readonly pulse = signal<DashboardPulseResource | null>(null);
  readonly accounts = signal<AccountResource[]>([]);
  readonly recentTransactions = signal<TransactionResource[]>([]);
  readonly categoryLeaks = signal<CategoryLeakResource[]>([]);

  // Computed values
  readonly currency = computed(() => this.pulse()?.currency || 'S/');
  readonly totalBalance = computed(() => this.pulse()?.balance || 0);
  readonly totalIncome = computed(() => this.pulse()?.totalIncome || 0);
  readonly totalExpenses = computed(() => this.pulse()?.totalExpenses || 0);
  readonly savingsRate = computed(() => this.pulse()?.savingsRate || 0);

  readonly totalAccountBalance = computed(() =>
    this.accounts().reduce((sum, acc) => sum + acc.balance, 0)
  );

  // Balances grouped by currency
  readonly balancesByCurrency = computed(() => {
    const accounts = this.accounts();
    const grouped = new Map<string, { currency: string; symbol: string; total: number }>();

    accounts.forEach(acc => {
      const currency = acc.currency || 'PEN';
      if (!grouped.has(currency)) {
        grouped.set(currency, {
          currency,
          symbol: getCurrencySymbol(currency),
          total: 0
        });
      }
      grouped.get(currency)!.total += acc.balance;
    });

    // Sort by currency code (PEN first, then alphabetically)
    return Array.from(grouped.values()).sort((a, b) => {
      if (a.currency === 'PEN') return -1;
      if (b.currency === 'PEN') return 1;
      return a.currency.localeCompare(b.currency);
    });
  });

  // Chart data
  readonly chartData = computed(() => {
    const income = this.totalIncome();
    const expenses = this.totalExpenses();
    const total = income + expenses;

    return {
      incomesPercent: total > 0 ? Math.round((income / total) * 100) : 0,
      expensesPercent: total > 0 ? Math.round((expenses / total) * 100) : 0,
    };
  });

  ngOnInit(): void {
    this.loadDashboardData();

    // Listen for navigation events to reload data when returning to home
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        // Reload data when navigating to home/root
        if (event.urlAfterRedirects === '/home' || event.urlAfterRedirects === '/') {
          console.log('🔄 Detected navigation to home, reloading data...');
          this.loadDashboardData();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    // Clean up onboarding modal if still open
    if (this.onboardingModalRef) {
      this.modalService.close(this.onboardingModalRef);
    }
  }

  /**
   * Check if user needs onboarding (no accounts)
   */
  private checkOnboarding(accounts: AccountResource[]): void {
    // Only check once per session to avoid showing wizard on every navigation
    if (this.hasCheckedOnboarding) {
      return;
    }
    this.hasCheckedOnboarding = true;

    // Show onboarding wizard if user has no accounts
    if (accounts.length === 0) {
      this.showOnboardingWizard();
    }
  }

  /**
   * Open the onboarding wizard modal
   */
  private showOnboardingWizard(): void {
    this.onboardingModalRef = this.modalService.open(
      WizardContainerComponent,
      {
        onClose: () => {
          if (this.onboardingModalRef) {
            this.modalService.close(this.onboardingModalRef);
            this.onboardingModalRef = undefined;
          }
        },
        onComplete: () => {
          if (this.onboardingModalRef) {
            this.modalService.close(this.onboardingModalRef);
            this.onboardingModalRef = undefined;
          }
          // Reload dashboard data after completing onboarding
          this.loadDashboardData();
        }
      },
      { fullscreen: true }
    );
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    const { fromDate, toDate } = this.getDateRange();

    console.log('📅 Date range:', { fromDate, toDate });
    console.log('🔗 Backend URL:', environment.apiBaseUrl);

    // Primero intentar cargar solo las cuentas
    this.transactionQueryService.handleGetAllAccounts(new GetAllAccountsQuery())
      .subscribe({
        next: (accounts) => {
          console.log('✅ Accounts loaded:', accounts);
          this.accounts.set(accounts);

          // Check if user needs onboarding (no accounts)
          this.checkOnboarding(accounts);

          // Calcular balance total desde las cuentas
          const totalAccountBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

          // Crear un pulse básico desde las cuentas
          this.pulse.set({
            currency: 'S/',
            periodLabel: this.selectedPeriod(),
            totalIncome: 0,
            totalExpenses: 0,
            balance: totalAccountBalance,
            savingsRate: 0
          });

          this.isLoading.set(false);

          // Intentar cargar transacciones de forma separada
          this.loadTransactions(fromDate, toDate);
        },
        error: (error) => {
          console.error('❌ Error loading accounts:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url
          });

          // Mostrar mensaje específico según el error
          if (error.status === 0) {
            console.error('🔴 Backend no está respondiendo.');
          } else if (error.status === 401) {
            console.error('🔴 Token de autenticación inválido o expirado. Por favor, vuelve a iniciar sesión.');
            // Redirigir al login
            setTimeout(() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
              window.location.href = '/auth/login';
            }, 2000);
          } else if (error.status === 404) {
            console.error('🔴 Endpoint no encontrado:', error.url);
          } else if (error.status === 500) {
            console.error('🔴 Error interno del servidor. El backend tiene un problema.');
          }

          this.loadError.set('home.errors.loadData');
          this.isLoading.set(false);
        },
      });
  }

  private loadTransactions(fromDate: string, toDate: string): void {
    console.log('📡 Attempting to load transactions with params:', {
      fromDate,
      toDate,
      page: 0,
      size: 5
    });

    // Try first WITHOUT date filters to see if that's causing backend issues
    this.transactionQueryService.handleGetAllTransactions(
      new GetAllTransactionsQuery(undefined, undefined, undefined, undefined, 0, 100)
    ).subscribe({
      next: (data) => {
        console.log('✅ Transactions loaded successfully:', data);
        console.log(`Total transactions found: ${data.content.length}`);

        // Filter by date on the frontend if needed
        let transactions = data.content;
        if (fromDate || toDate) {
          transactions = transactions.filter(t => {
            const txDate = t.transactionDate.split('T')[0];
            if (fromDate && txDate < fromDate) return false;
            if (toDate && txDate > toDate) return false;
            return true;
          });
        }

        // Take only the 5 most recent
        const recentTransactions = transactions.slice(0, 5);
        this.recentTransactions.set(recentTransactions);

        console.log(`Showing ${recentTransactions.length} recent transactions`);

        // Recalcular pulse con datos de transacciones del período
        const totalIncome = transactions
          .filter(t => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
          .filter(t => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0);

        // Get account balance
        const accountBalance = this.accounts().reduce((sum, acc) => sum + acc.balance, 0);

        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

        console.log('💰 Financial summary:', {
          totalIncome,
          totalExpenses,
          accountBalance,
          savingsRate: savingsRate.toFixed(2) + '%'
        });

        this.pulse.set({
          currency: 'S/',
          periodLabel: this.selectedPeriod(),
          totalIncome,
          totalExpenses,
          balance: accountBalance,
          savingsRate
        });

        // Intentar cargar datos adicionales del dashboard
        this.loadDashboardExtras(fromDate, toDate);
      },
      error: (error) => {
        console.error('❌ Error loading transactions:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });

        // No bloquear la UI, simplemente no mostrar transacciones
        if (error.status === 500) {
          console.error('🔴 Backend returned 500 error for /transactions endpoint');
          console.error('This indicates a server-side error. The frontend is sending the correct request.');
          console.error('Check backend logs for the actual error.');
        } else if (error.status === 0) {
          console.error('🔴 Could not connect to backend. Is the server running?');
        }

        // Keep showing account balance even if transactions fail to load
        console.log('Keeping account balance visible despite transaction loading error');
      }
    });
  }

  private loadDashboardExtras(fromDate: string, toDate: string): void {
    // Intentar cargar leaks si el endpoint existe
    this.dashboardQueryService.handleGetLeaks(new GetLeaksQuery(fromDate, toDate, 5))
      .subscribe({
        next: (data) => {
          console.log('✅ Leaks loaded:', data);
          this.categoryLeaks.set(data.leaks);
        },
        error: (error) => {
          console.warn('⚠️ Dashboard leaks endpoint not available:', error.status);
          // No mostrar error, solo no mostrar la sección
        }
      });
  }

  onPeriodChange(period: PeriodFilter): void {
    this.selectedPeriod.set(period);
    this.loadDashboardData();
  }

  reload(): void {
    this.loadDashboardData();
  }

  // Helper methods
  private getDateRange(): { fromDate: string; toDate: string } {
    const toDate = getTodayFormatted();
    let fromDate: string;

    switch (this.selectedPeriod()) {
      case 'today':
        fromDate = toDate;
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        fromDate = formatDateForAPI(weekAgo);
        break;
      case 'month':
        fromDate = getFirstDayOfMonth();
        break;
      case 'year':
        fromDate = getFirstDayOfMonthsAgo(12);
        break;
      default:
        fromDate = getFirstDayOfMonth();
    }

    return { fromDate, toDate };
  }

  formatAmount(amount: number, showSign: boolean = false): string {
    const sign = showSign ? (amount >= 0 ? '+' : '') : '';
    const absAmount = Math.abs(amount);
    return `${sign}${this.currency()}${absAmount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
    });
  }

  getTransactionIcon(type: string): string {
    return type === 'INCOME' ? '⬆️' : type === 'EXPENSE' ? '⬇️' : '↔️';
  }

  getTransactionClass(type: string): string {
    return type === 'INCOME' ? 'transaction-income' : 'transaction-expense';
  }

  /**
   * Get currency symbol for a given currency code
   */
  getCurrencySymbol(currencyCode: string): string {
    return getCurrencySymbol(currencyCode);
  }

  /**
   * Get currency symbol for a transaction based on its account
   */
  getTransactionCurrency(accountId: number): string {
    const account = this.accounts().find(a => a.id === accountId);
    return getCurrencySymbol(account?.currency || 'PEN');
  }

  /**
   * Navigate to account detail page
   */
  navigateToAccount(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }
}
