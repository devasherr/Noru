# Noru

![Noru dashboard](frontend/public/noru_dashboard.png)

An employee management system for a hotel — staff, departments, roles, shift
scheduling and daily attendance. A Go + Postgres REST API with a React dashboard on top.

The **backend is where most of the effort went**: the schema, the SQL, the validation
rules and the error semantics are the substance of this project. The frontend is a
deliberately thin, read-only client that exists to show the API's data.

I chose **Go** for the backend because it provides a strong balance of performance,
concurrency and simplicity. Goroutines make it straightforward to handle many
concurrent HTTP requests and database operations, while Go's compilation model produces
a single native binary that is fast to start and easy to distribute and deploy.

---

## Backend

`Go 1.25` · `Fiber v3` · `PostgreSQL 16` · `pgx/v5` (pool) · `sqlc` · `golang-migrate`

### API

| Method   | Route                       | What it does                                                  |
| -------- | --------------------------- | ------------------------------------------------------------- |
| `GET`    | `/health`                   | Liveness — pings the pool, `503` if the database is down      |
| `GET`    | `/employees`                | Paginated roster with department + role joined in             |
| `POST`   | `/employees`                | Create an employee                                            |
| `PATCH`  | `/employees/:id`            | Partial update — only the fields you send are touched         |
| `PUT`    | `/employees/:id/department` | Assign a department                                           |
| `PUT`    | `/employees/:id/role`       | Assign a role                                                 |
| `POST`   | `/employees/:id/shifts`     | Put someone on a shift for a date (replaces any existing one) |
| `POST`   | `/employees/:id/attendance` | Record attendance against that day's shift                    |
| `DELETE` | `/employees/:id`            | Delete an employee                                            |


### Architecture & Design Decisions

Six tables — `departments`, `roles`, `employees`, `shifts`, `employee_shifts`,
`attendance`

- **Type-safe queries, hand-written SQL.** SQL is written explicitly in server/db/queries/
and sqlc generates the corresponding Go code into server/gen/db/.
The generated code is static — there is no query construction, reflection, or ORM layer at runtime.
This keeps the SQL visible and easy to reason about while moving query/type errors
into the build step instead of discovering them through runtime execution.
- **Postgres errors become correct HTTP statuses.** Driver error codes are inspected,
  not string-matched: `23505` → `409 Conflict` ("email is already taken"), `23503` →
  `422` with a message keyed off the specific constraint name, so "department does not
  exist" and "shift does not exist" are distinguishable to the caller.
- **Input is validated before it reaches the database.** Pagination bounds, `YYYY-MM-DD`
  dates, RFC3339 timestamps, the status enum, `check_out` must be after `check_in`,
  `check_out` requires `check_in`, and a `PATCH` with nothing updatable is rejected
  rather than silently succeeding.
- **Tuned connection pool** with bounded lifetimes and a startup ping, so the process
  fails loudly at boot rather than on the first request.

---

## Frontend

`React 19` · `TypeScript` · `Vite` · `React Router` · CSS Modules

- **Dashboard** — headcount, active-staff ratio, department count and roles filled,
  derived from the roster; highlights recent hires, the largest department and anyone
  without a role.
- **Employees** — full roster table, filterable by name, department or role.
- **Honest loading and failure states** — skeletons while fetching; if the API is
  unreachable you get an error panel with the server's own message and a retry. Sample
  data only ever appears when you explicitly ask for it, so a broken backend can never
  be mistaken for real data.
- Collapsible sidebar, dark theme, and placeholder routes for the sections the API
  doesn't expose yet (Departments, Roles, Shifts, Attendance, Settings).
- Types in `src/types/employee.ts` mirror the Go response shapes.

---

## Running it

### Prerequisites

Go 1.25+, Node 20+, Docker (for Postgres), and
[`golang-migrate`](https://github.com/golang-migrate/migrate) for the schema.

### Backend

```sh
cd server

# 1. Postgres
docker compose up -d

# 2. Credentials — .env is gitignored, so create it
DATABASE_URL=postgres://hotel_admin:hotel_123@localhost:5432/hotel_ems?sslmode=disable

# 3. Apply the schema
migrate -path db/migrations -database "postgres://hotel_admin:hotel_123@localhost:5432/hotel_ems?sslmode=disable" up

# 4. Run
go run ./cmd
```

The server listens on **:7777**. Check it:

```sh
curl -s localhost:7777/health          # {"database":"up","status":"ok"}
curl -s 'localhost:7777/employees?limit=5'
```

After editing anything in `db/queries/` or `db/migrations/`, regenerate the Go layer
with `sqlc generate`.

### Frontend

```sh
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api/*` to the Go server on `:7777` and
strips the prefix, so both need to be running — start the backend first.

Other scripts: `npm run build`, `npm run lint`, `npm run preview`.
