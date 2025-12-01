/**
 * Transactions Bounded Context - Domain Layer
 * CreateAccount Command
 */

export class CreateAccountCommand {
  constructor(
    public name: string,
    public currency: string
  ) {}
}
