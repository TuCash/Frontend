export const environment = {
  production: false,

  // Base URL del backend - Desarrollo local
  apiBaseUrl: 'http://localhost:8080/api/v1',

  // Endpoints de autenticación (públicos)
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  // Endpoints de recursos protegidos
  endpoints: {
    users: '/users',
    accounts: '/accounts',
    categories: '/categories',
    transactions: '/transactions',
    goals: '/goals',
    budgets: '/budgets',
    recurringTransactions: '/recurring-transactions',
    notifications: '/notifications',
    reminders: '/reminders',
    dashboard: {
      pulse: '/dashboard/pulse',
      trends: '/dashboard/trends',
      leaks: '/dashboard/leaks',
    },
  },

  // Servicio para logos externos
  logoProviderApiBaseUrl: 'https://logo.clearbit.com/',
};
