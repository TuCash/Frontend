/**
 * IAM Bounded Context - Presentation Layer
 * SignIn Request/Response Resources (DTOs)
 */

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  id: number;
  email: string;
  displayName: string;
  token: string;
  photoUrl?: string;
  currency?: string;
}
