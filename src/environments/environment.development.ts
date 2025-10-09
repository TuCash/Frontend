export const environment = {
  production: false,

  // 🌐 Base URL para API local o json-server
  apiBaseUrl: 'https://tucashft.onrender.com',

  // 📦 Endpoints REST agrupados
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    incomes: '/incomes',
    expenses: '/expenses',
    goals: '/goals',
    profile: '/profile',
  },

  // 🖼 Servicio para logos externos
  logoProviderApiBaseUrl: 'https://logo.clearbit.com/',
};
