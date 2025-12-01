/**
 * IAM Bounded Context - Domain Layer
 * SignIn Command
 */

export class SignInCommand {
  constructor(
    public email: string,
    public password: string
  ) {}
}
