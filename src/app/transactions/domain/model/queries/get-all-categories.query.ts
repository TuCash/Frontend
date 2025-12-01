/**
 * Transactions Bounded Context - Domain Layer
 * GetAllCategories Query
 */

export class GetAllCategoriesQuery {
  constructor(public type?: 'INCOME' | 'EXPENSE') {}
}
