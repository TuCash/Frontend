export const environment = {
  production: true,

  // Base URL del backend - Producción (Azure)
  apiBaseUrl: 'https://tucash-api-ercgh9bsdwg8cqe9.canadacentral-01.azurewebsites.net/api/v1',

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