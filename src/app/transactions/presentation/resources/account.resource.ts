/**
 * Transactions Bounded Context - Presentation Layer
 * Account Resources (DTOs)
 */

export interface AccountResource {
  id: number;
  name: string;
  currency: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  name: string;
  currency: string;
}
