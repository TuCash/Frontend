/**
 * IAM Bounded Context - Domain Layer
 * User Aggregate Root
 */

export class User {
  constructor(
    public id: number,
    public email: string,
    public displayName: string,
    public photoUrl: string | null,
    public currency: string,
    public theme: string,
    public locale: string,
    public createdAt: string,
    public updatedAt: string
  ) {}
}
