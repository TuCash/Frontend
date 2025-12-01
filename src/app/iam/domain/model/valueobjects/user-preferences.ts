/**
 * IAM Bounded Context - Domain Layer
 * UserPreferences Value Object
 */

export class UserPreferences {
  constructor(
    public currency: string,
    public theme: string,
    public locale: string,
    public notificationsEnabled: boolean,
    public emailNotifications: boolean,
    public pushNotifications: boolean
  ) {}
}
