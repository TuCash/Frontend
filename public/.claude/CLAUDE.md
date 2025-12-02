# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANTE: Documentos de Referencia

**Antes de trabajar en este proyecto, lee estos documentos en `docs/`:**

1. **`docs/PROYECTO-TUCASH.md`** - Memoria principal del proyecto (resumen completo de front y back)
2. **`docs/API-DOCUMENTATION.md`** - Endpoints del backend (resumido)
3. **`docs/DOCUMENTACION-COMPLETA.md`** - API completa del backend (detallado)
4. **`docs/ARQUITECTURA-DDD.md`** - Arquitectura DDD explicada
5. **`docs/BACKEND-PENDIENTES.md`** - Tareas pendientes para el backend

**Backend ubicado en**: `D:\OPEN SOURCE\TF\TB2\backend_Api-main\`

---

## Project Overview

**TuCash** is a personal finance management application built with Angular 20.3.0 following **Domain-Driven Design (DDD)** architecture with CQRS pattern. The frontend is 100% aligned with a Java Spring Boot backend that follows the same DDD structure.

## Essential Commands

### Development
```bash
# Start development server (default port 4200)
npm start

# Start with mock API server (if backend unavailable)
npm run mock:api    # Runs json-server on port 3001

# Build for production
npm run build

# Watch mode (rebuild on changes)
npm run watch
```

### Testing
```bash
# Run all tests with Karma
npm test
```

### Code Quality
The project uses Prettier with these settings:
- Print width: 100
- Single quotes: true
- Angular HTML parser for `.html` files

## Architecture Overview

### Domain-Driven Design Structure

The application is organized into **8 Bounded Contexts**, each following a 4-layer architecture:

```
src/app/
├── iam/                    # Identity & Access Management (auth, users)
├── transactions/           # Accounts, Categories, Transactions
├── savings/                # Goals and Budgets
├── automation/             # Recurring Transactions
├── dashboard/              # Analytics and Reports
├── notifications/          # Notification System
├── reminders/              # Payment Reminders
└── shared/                 # Shared Kernel (infrastructure, models, utils)
```

### 4-Layer Architecture (per Bounded Context)

Each bounded context follows this structure:

```
bounded-context/
├── domain/
│   └── model/
│       ├── aggregates/          # Main entities (User, Transaction, Goal, etc.)
│       ├── entities/            # Secondary entities
│       ├── valueobjects/        # Enums and value objects
│       ├── commands/            # Write operations (CQRS)
│       └── queries/             # Read operations (CQRS)
│
├── application/
│   └── internal/
│       ├── commandservices/     # Command handlers (create, update, delete)
│       └── queryservices/       # Query handlers (get, list)
│
├── infrastructure/
│   └── persistence/             # HTTP services (repositories)
│
└── presentation/
    ├── components/              # UI components
    ├── pages/                   # Page components
    ├── resources/               # DTOs (Request/Response)
    ├── transform/               # Assemblers (DTO ↔ Domain conversion)
    └── *.routes.ts              # Routing configuration
```

### CQRS Pattern

The project implements Command Query Responsibility Segregation:

- **Commands**: Write operations (`CreateTransactionCommand`, `UpdateUserCommand`)
- **Queries**: Read operations (`GetAllTransactionsQuery`, `GetUserByIdQuery`)
- **Services**: Separate command and query services

**Example Usage:**
```typescript
import { TransactionCommandService, CreateTransactionCommand } from '@app/transactions';
import { formatDateForAPI } from '@shared/utils';

// Creating a transaction
const command = new CreateTransactionCommand(
  accountId: 1,
  categoryId: 2,
  type: 'EXPENSE',
  amount: 50.00,
  description: 'Lunch',
  transactionDate: formatDateForAPI(new Date())
);

this.transactionCommandService.handleCreateTransaction(command).subscribe({
  next: (transaction) => console.log('Created:', transaction),
  error: (error) => console.error('Error:', error)
});
```

## Backend Integration

### API Configuration

Backend base URL is configured in environment files:
- **Development**: `http://localhost:8080/api/v1`
- **Production**: Configured in `src/environments/environment.ts`

### Authentication

Uses JWT Bearer tokens:
- Tokens stored in `localStorage` with key `'token'`
- `AuthInterceptor` automatically adds `Authorization: Bearer {token}` header
- `AuthGuard` protects routes requiring authentication

**Public Endpoints** (no auth required):
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`

**Protected Endpoints** (require auth):
- All other endpoints under `/api/v1/*`

### Date Format Convention

**CRITICAL**: The backend expects dates in `yyyy-MM-dd` format (ISO 8601 date only).

Always use the `formatDateForAPI()` utility from `@shared/utils`:

```typescript
import { formatDateForAPI } from '@shared/utils';

const today = formatDateForAPI(new Date());  // "2025-01-14"
```

Available date utilities:
- `formatDateForAPI(date: Date): string` - Convert to yyyy-MM-dd
- `parseAPIDate(dateString: string): Date` - Parse from API format
- `getTodayFormatted(): string` - Get today in API format
- `getFirstDayOfMonth(): string` - First day of current month
- `getLastDayOfMonth(): string` - Last day of current month
- `getRelativeDate(days: number): string` - Date N days from today

## Important Patterns & Conventions

### Importing from Bounded Contexts

**ALWAYS use barrel exports** from the context root:

```typescript
// ✅ CORRECT
import { IamCommandService, SignInCommand } from '@app/iam';
import { TransactionQueryService } from '@app/transactions';
import { DashboardQueryService } from '@app/dashboard';

// ❌ INCORRECT - Do not import from internal layers
import { IamCommandService } from '@app/iam/application/internal/commandservices/...';
```

### Service Injection

Use the `inject()` function instead of constructor injection:

```typescript
import { inject } from '@angular/core';

@Component({...})
export class MyComponent {
  private transactionService = inject(TransactionCommandService);
  private authService = inject(IamCommandService);
}
```

### Error Handling

Use the `handleAPIError()` utility from `@shared/utils`:

```typescript
import { handleAPIError } from '@shared/utils';

try {
  await this.service.create(data);
} catch (error) {
  const errorMessage = handleAPIError(error);
  console.error(errorMessage);
}
```

### Shared Infrastructure

The `shared/` context contains:
- **HTTP**: `AuthInterceptor` (adds JWT tokens automatically)
- **Guards**: `AuthGuard` (protects routes)
- **Models**: Common types and interfaces (`api.types.ts`)
- **Utils**: Date formatting, error handling
- **Presentation**: Reusable UI components (language switcher, etc.)

## Routing

Routes are lazy-loaded per bounded context:

```typescript
// Main routes in app.routes.ts
{
  path: 'auth',
  loadChildren: () => import('./iam/presentation/iam.routes').then(m => m.IAM_ROUTES)
},
{
  path: 'transactions',
  loadChildren: () => import('./transactions/presentation/transactions.routes').then(m => m.TRANSACTIONS_ROUTES),
  canActivate: [authGuard]
}
```

**Route Structure:**
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/home` - Dashboard (protected)
- `/transactions` - Transaction list (protected)
- `/savings/goals` - Savings goals (protected)
- `/savings/budgets` - Budget management (protected)
- `/automation/recurring` - Recurring transactions (protected)

## Testing with Mock API

When the backend is unavailable, use the mock API server:

```bash
npm run mock:api
```

This starts a json-server on port 3001 with basic auth endpoints and CRUD operations. The mock server supports:
- User registration and login
- Basic JWT token simulation
- CRUD operations for all resources

## Key Documentation Files

Todos los documentos están en la carpeta `docs/`:

- `docs/PROYECTO-TUCASH.md` - Memoria principal del proyecto (LEER PRIMERO)
- `docs/API-DOCUMENTATION.md` - Endpoints del backend (resumido)
- `docs/DOCUMENTACION-COMPLETA.md` - Full backend API documentation
- `docs/ARQUITECTURA-DDD.md` - Complete DDD architecture documentation
- `docs/BACKEND-PENDIENTES.md` - Tareas pendientes para el backend

## TypeScript & Angular Best Practices

### TypeScript
- Use strict type checking (already configured)
- Avoid `any` type; use `unknown` when type is uncertain
- Prefer type inference when obvious

### Angular Specifics
- All components are **standalone** (no NgModules)
- Do NOT set `standalone: true` - it's the default
- Use **signals** for state management
- Use `computed()` for derived state
- Lazy load routes per bounded context
- Use `input()` and `output()` functions (not decorators)
- Set `changeDetection: ChangeDetectionStrategy.OnPush`
- Use native control flow: `@if`, `@for`, `@switch` (not `*ngIf`, `*ngFor`, `*ngSwitch`)
- Do NOT use `@HostBinding`/`@HostListener` - use `host` object instead
- Do NOT use `ngClass`/`ngStyle` - use direct bindings
- Do NOT use `mutate` on signals - use `update` or `set`

### Forms
Prefer Reactive Forms over Template-driven forms

### Images
Use `NgOptimizedImage` for static images (doesn't work with base64)

## Common Development Patterns

### Creating a New Command

1. Define in `domain/model/commands/`:
```typescript
export class CreateExpenseCommand {
  constructor(
    public accountId: number,
    public categoryId: number,
    public amount: number,
    public description: string,
    public transactionDate: string
  ) {}
}
```

2. Add handler in CommandService:
```typescript
handleCreateExpense(command: CreateExpenseCommand): Observable<Transaction> {
  return this.http.post<Transaction>(`${this.apiUrl}/transactions`, command);
}
```

3. Use in component:
```typescript
const command = new CreateExpenseCommand(1, 2, 50.00, 'Lunch', formatDateForAPI(new Date()));
this.commandService.handleCreateExpense(command).subscribe(...);
```

### Creating a New Query

Similar pattern but in `domain/model/queries/` and `QueryService`.

## Environment Configuration

Two environment files:
- `environment.development.ts` - Local development (port 8080)
- `environment.ts` - Production

Both define:
- `apiBaseUrl` - Backend base URL
- `auth` - Auth endpoints
- `endpoints` - Resource endpoints
- `logoProviderApiBaseUrl` - External logo service

## Internationalization

The app uses `ngx-translate` for i18n:
- Language service: `shared/language.service.ts`
- Language switcher component: `shared/presentation/components/language-switch/`
- Supported languages: Spanish (es), English (en)

## File Organization Guidelines

When creating new features:
1. Identify the appropriate bounded context
2. Follow the 4-layer structure
3. Create domain models first (aggregates, commands, queries)
4. Implement services (command/query)
5. Add persistence layer (HTTP services)
6. Build presentation layer (components, pages)
7. Export via barrel files (index.ts)

## Backend Alignment

This frontend is designed to work with a Java Spring Boot backend that follows the same DDD structure. The bounded contexts, aggregates, commands, and queries are identical between frontend and backend for consistency.

**Backend Repository**: Separate Java Spring Boot project
**API Documentation**: Available at `/swagger-ui.html` when backend is running

## Troubleshooting

### CORS Issues
Ensure backend CORS allows `http://localhost:4200` (dev) or your production domain

### Authentication Errors
- Check token in localStorage
- Verify `Authorization` header is being sent (check Network tab)
- Confirm token hasn't expired (7-day expiration)

### Date Format Errors
Always use `formatDateForAPI()` when sending dates to backend - it expects `yyyy-MM-dd` format only
