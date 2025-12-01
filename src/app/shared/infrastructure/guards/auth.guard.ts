/**
 * Shared Kernel - Infrastructure Layer
 * Auth Guard para proteger rutas
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamQueryService } from '../../../iam/application/internal/queryservices/iam-query.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const iamQueryService = inject(IamQueryService);
  const router = inject(Router);

  if (iamQueryService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], {
    queryParams: { redirectTo: state.url },
    replaceUrl: true,
  });

  return false;
};
