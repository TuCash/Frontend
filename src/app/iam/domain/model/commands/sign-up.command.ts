/**
 * IAM Bounded Context - Domain Layer
 * SignUp Command
 */

export class SignUpCommand {
  constructor(
    public email: string,
    public password: string,
    public displayName: string
  ) {}
}
