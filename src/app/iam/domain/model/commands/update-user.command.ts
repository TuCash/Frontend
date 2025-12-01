/**
 * IAM Bounded Context - Domain Layer
 * UpdateUser Command
 */

export class UpdateUserCommand {
  constructor(
    public userId: number,
    public displayName?: string,
    public photoUrl?: string,
    public currency?: string,
    public theme?: string,
    public locale?: string
  ) {}
}
