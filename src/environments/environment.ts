// src/environments/environment.ts
export const environment = {
  production: true,

  // 🌐 URL del backend real (por ejemplo en producción o staging)
  apiBaseUrl: 'https://tucashft.onrender.com',

  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',

    incomes: '/incomes',
    expenses: '/expenses',
    goals: '/goals',
    profile: '/profile',
  },

  logoProviderApiBaseUrl: 'https://logo.clearbit.com/',
};