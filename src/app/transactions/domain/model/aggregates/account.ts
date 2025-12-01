/**
 * Transactions Bounded Context - Domain Layer
 * Account Aggregate Root
 */

export class Account {
  constructor(
    public id: number,
    public name: string,
    public currency: string,
    public balance: number,
    public createdAt: string,
    public updatedAt: string
  ) {}
}
