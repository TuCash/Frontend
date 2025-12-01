/**
 * IAM Bounded Context - Presentation Layer
 * SignUp Request/Response Resources (DTOs)
 */

export interface SignUpRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface SignUpResponse {
  id: number;
  email: string;
  displayName: string;
  photoUrl: string | null;
  currency: string;
  theme: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}
