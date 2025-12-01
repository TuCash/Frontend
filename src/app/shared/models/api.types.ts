// ============================================
// API Types - TuCash Platform
// Basado en la documentación del backend
// ============================================

// ============================================
// AUTHENTICATION & USER
// ============================================

export interface User {
  id: number;
  email: string;
  displayName: string;
  photoUrl?: string;
  currency: string;
  theme: string;
  locale: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  displayName: string;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface UpdateUserPayload {
  displayName?: string;
  photoUrl?: string;
  currency?: string;
  theme?: string;
  locale?: string;
}

export interface UpdateUserPreferencesPayload {
  currency?: string;
  theme?: string;
  locale?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

// ============================================
// ACCOUNTS
// ============================================

export interface Account {
  id: number;
  name: string;
  currency: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountPayload {
  name: string;
  currency: string;
}

// ============================================
// CATEGORIES
// ============================================

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isSystemCategory: boolean;
}

export interface CreateCategoryPayload {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

// ============================================
// TRANSACTIONS
// ============================================

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  type: TransactionType;
  amount: number;
  description?: string;
  transactionDate: string; // formato: yyyy-MM-dd
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  accountId: number;
  categoryId: number;
  type: TransactionType;
  amount: number;
  description?: string;
  transactionDate: string; // formato: yyyy-MM-dd
}

export interface UpdateTransactionPayload {
  accountId?: number;
  categoryId?: number;
  amount?: number;
  description?: string;
  transactionDate?: string; // formato: yyyy-MM-dd
}

export interface TransactionFilter {
  type?: TransactionType;
  categoryId?: number;
  fromDate?: string; // formato: yyyy-MM-dd
  toDate?: string; // formato: yyyy-MM-dd
  page?: number;
  size?: number;
}

// ============================================
// GOALS
// ============================================

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Goal {
  id: number;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  deadline: string; // formato: yyyy-MM-dd
  status: GoalStatus;
  celebratedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  name: string;
  description?: string;
  targetAmount: number;
  deadline: string; // formato: yyyy-MM-dd
}

export interface UpdateGoalProgressPayload {
  currentAmount: number;
}

// ============================================
// BUDGETS
// ============================================

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  spentPercentage: number;
  period: BudgetPeriod;
  startDate: string; // formato: yyyy-MM-dd
  endDate: string; // formato: yyyy-MM-dd
  isWarning: boolean;
  isExceeded: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetPayload {
  categoryId: number;
  limitAmount: number;
  period: BudgetPeriod;
  startDate: string; // formato: yyyy-MM-dd
  endDate: string; // formato: yyyy-MM-dd
}

// ============================================
// RECURRING TRANSACTIONS
// ============================================

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description?: string;
  frequency: RecurringFrequency;
  startDate: string; // formato: yyyy-MM-dd
  endDate?: string; // formato: yyyy-MM-dd
  nextExecutionDate: string; // formato: yyyy-MM-dd
  isActive: boolean;
}

export interface CreateRecurringTransactionPayload {
  accountId: number;
  categoryId: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description?: string;
  frequency: RecurringFrequency;
  startDate: string; // formato: yyyy-MM-dd
  endDate?: string; // formato: yyyy-MM-dd
}

export interface UpdateRecurringTransactionStatusPayload {
  isActive: boolean;
}

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

export interface DashboardPulse {
  currency: string;
  periodLabel: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export interface MonthlyTrend {
  month: string; // formato: yyyy-MM
  income: number;
  expenses: number;
  balance: number;
}

export interface TrendSeries {
  currency: string;
  series: MonthlyTrend[];
}

export interface CategoryLeak {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface CategoryLeaks {
  currency: string;
  period: string;
  leaks: CategoryLeak[];
}

// ============================================
// NOTIFICATIONS
// ============================================

export type NotificationType = 'INFO' | 'WARNING' | 'GOAL' | 'BUDGET';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================
// REMINDERS
// ============================================

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  dueDate: string; // formato: yyyy-MM-dd
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateReminderPayload {
  title: string;
  description?: string;
  dueDate: string; // formato: yyyy-MM-dd
}

// ============================================
// PAGINATION
// ============================================

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
  path?: string;
}

export interface MessageResponse {
  message: string;
}
