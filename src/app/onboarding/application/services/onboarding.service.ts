/**
 * Onboarding - Application Layer
 * Service to manage onboarding state
 */

import { Injectable, inject } from '@angular/core';
import { TransactionQueryService } from '../../../transactions/application/internal/queryservices/transaction-query.service';
import { GetAllAccountsQuery } from '../../../transactions/domain/model/queries/get-all-accounts.query';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly transactionQueryService = inject(TransactionQueryService);

  /**
   * Check if onboarding wizard should be shown
   * Returns true if user has no accounts
   */
  shouldShowOnboarding(): Observable<boolean> {
    return this.transactionQueryService
      .handleGetAllAccounts(new GetAllAccountsQuery())
      .pipe(map((accounts) => accounts.length === 0));
  }
}
