# Data Flow and Type Validation

This document explains the end-to-end data flow and type validation in the application.

## 1. Database Schema Layer

The database schemas are defined using Drizzle ORM in the `db/schema` directory. Each schema file (e.g., `tickets-schema.ts`, `profiles-schema.ts`) defines:

- Table structure using `pgTable`
- Column types and constraints
- Type inference for insert and select operations using `$inferInsert` and `$inferSelect`
- Foreign key relationships and cascading deletes where needed

Example schema:
```typescript
export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // ... other fields
})

export type InsertTicket = typeof ticketsTable.$inferInsert
export type SelectTicket = typeof ticketsTable.$inferSelect
```

## 2. Type System

The app uses TypeScript for type safety throughout:

- Each database table has two main types:
  - `InsertType` - Type for inserting data (e.g., `InsertTicket`)
  - `SelectType` - Type for retrieved data (e.g., `SelectTicket`)
- Server actions return an `ActionState<T>` type that handles success/failure states:

```typescript
type ActionState<T> = 
  | { isSuccess: true; message: string; data: T }
  | { isSuccess: false; message: string; data?: never }
```

## 3. Server Actions Layer

Located in `actions/db` directory:

- Uses `"use server"` directive for server-side execution
- Implements CRUD operations using Drizzle ORM
- Returns typed `ActionState` responses
- Handles error cases and provides error messages

Example:
```typescript
export async function createTodoAction(
  todo: InsertTodo
): Promise<ActionState<SelectTodo>> {
  try {
    const [newTodo] = await db.insert(todosTable).values(todo).returning()
    return {
      isSuccess: true,
      message: "Todo created successfully",
      data: newTodo
    }
  } catch (error) {
    return { isSuccess: false, message: "Failed to create todo" }
  }
}
```

## 4. Server Components Layer

Server components:

- Use `"use server"` directive
- Fetch data using server actions
- Handle authentication with Clerk
- Implement loading states with Suspense
- Pass data to client components as props

Example:
```typescript
export default async function TodoPage() {
  const { userId } = await auth()
  const todos = await getTodosAction(userId)
  return <TodoList userId={userId} initialTodos={todos.data ?? []} />
}
```

## 5. Client Components Layer

Client components:

- Use `"use client"` directive
- Receive typed props from server components
- Handle UI interactions and state management
- Make mutations through server actions

Example:
```typescript
interface TodoListProps {
  userId: string
  initialTodos: SelectTodo[]
}

export function TodoList({ userId, initialTodos }: TodoListProps) {
  // Client-side logic here
}
```

## 6. Type Safety Flow

The type safety flows through the application layers:

```
Database Schema → ORM Types → Server Actions → Server Components → Client Components
```

- Database schema defines the base structure
- Drizzle ORM generates TypeScript types
- Server actions use these types for parameters and returns
- Server components pass typed data to client components
- Client components receive and handle typed props

## 7. Ticket Tables Relationships

The ticket system consists of several interconnected tables:

1. `tickets` - Core table for individual tickets
   - `id` (serial) - Primary key
   - `race_id` (uuid) - References races table
   - Contains basic ticket information (title, description, type, etc.)

2. `ticket_features` - Reusable features that can be assigned to tickets
   - `id` (serial) - Primary key
   - `name` and `description` fields

3. `ticket_feature_mappings` - Many-to-many relationship between tickets and features
   - `ticket_id` (serial) - References tickets table
   - `feature_id` (serial) - References ticket_features table
   - Composite primary key of both fields

4. `ticket_pricing` - Historical pricing information for tickets
   - `id` (serial) - Primary key
   - `ticket_id` (serial) - References tickets table
   - Tracks price, currency, and validity periods

5. `ticket_packages` - Groups of tickets sold together
   - `id` (serial) - Primary key
   - `race_id` (uuid) - References races table
   - Contains package information (name, description)

6. `package_tickets` - Many-to-many relationship between packages and tickets
   - `package_id` (serial) - References ticket_packages table
   - `ticket_id` (serial) - References tickets table
   - `quantity` (integer) - Number of tickets in the package
   - `discount_percentage` (numeric) - Optional discount for the ticket in this package
   - Composite primary key of package_id and ticket_id

Relationships flow:
```
races
  ↓
tickets ←→ ticket_features (via ticket_feature_mappings)
  ↓
ticket_pricing
  ↕
ticket_packages ←→ tickets (via package_tickets)
```

This structure allows for:
- Flexible ticket feature management
- Historical price tracking
- Package creation with variable quantities and discounts
- Full race event organization

## 8. Error Handling

Error handling is implemented throughout:

- Server actions wrap all database operations in try/catch blocks
- Return standardized `ActionState` type with success/failure info
- Error messages propagate up through the layers
- Client components can handle error states appropriately

## 9. Authentication & Authorization

Security is handled via:

- Clerk handles authentication
- User ID is available in server components and actions
- Authorization checks are implemented in server actions

Example:
```typescript
const { userId } = await auth()
if (!userId) {
  return redirect("/login")
}
```

This architecture ensures type safety and data validation at every layer while maintaining a clear separation of concerns between server and client code.