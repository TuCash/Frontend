/**
 * IAM Bounded Context - Presentation Layer
 * User Resource (DTO)
 */

export interface UserResource {
  id: number;
  email: string;
  displayName: string;
  photoUrl: string | null;
  currency: string;
  theme: string;
  locale: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  photoUrl?: string;
  currency?: string;
  theme?: string;
  locale?: string;
}

export interface UpdatePreferencesRequest {
  currency?: string;
  theme?: string;
  locale?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}
