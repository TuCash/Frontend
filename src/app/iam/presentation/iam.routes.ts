/**
 * IAM Bounded Context - Presentation Layer
 * Rutas del módulo IAM
 */

import { Routes } from '@angular/router';

export const IAM_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register-page.component').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile-page.component').then((m) => m.ProfilePageComponent),
  },
  {
    path: 'profile/edit',
    loadComponent: () =>
      import('./pages/profile/edit-profile.component').then((m) => m.EditProfileComponent),
  },
  {
    path: 'profile/security',
    loadComponent: () =>
      import('./pages/profile/security.component').then((m) => m.SecurityComponent),
  },
  {
    path: 'profile/notifications',
    loadComponent: () =>
      import('./pages/profile/notifications.component').then((m) => m.NotificationsComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
