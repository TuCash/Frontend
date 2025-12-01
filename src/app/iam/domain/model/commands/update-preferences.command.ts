/**
 * IAM Bounded Context - Domain Layer
 * UpdatePreferences Command
 */

export class UpdatePreferencesCommand {
  constructor(
    public userId: number,
    public currency?: string,
    public theme?: string,
    public locale?: string,
    public notificationsEnabled?: boolean,
    public emailNotifications?: boolean,
    public pushNotifications?: boolean
  ) {}
}
