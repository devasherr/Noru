-- name: ListEmployees :many
SELECT
    e.id,
    e.first_name,
    e.last_name,
    e.email,
    e.phone,
    e.hire_date,
    e.is_active,
    d.id   AS department_id,
    d.name AS department_name,
    r.id   AS role_id,
    r.title AS role_title,
    e.created_at,
    e.updated_at
FROM employees e
LEFT JOIN departments d ON d.id = e.department_id
LEFT JOIN roles r ON r.id = e.role_id
ORDER BY e.last_name, e.first_name
LIMIT $1 OFFSET $2;

-- name: CreateEmployee :one
INSERT INTO employees (
    first_name,
    last_name,
    email,
    phone,
    hire_date,
    is_active,
    department_id,
    role_id
) VALUES (
    sqlc.arg(first_name),
    sqlc.arg(last_name),
    sqlc.narg(email),
    sqlc.narg(phone),
    COALESCE(sqlc.narg(hire_date)::date, CURRENT_DATE),
    COALESCE(sqlc.narg(is_active)::boolean, TRUE),
    sqlc.narg(department_id),
    sqlc.narg(role_id)
)
RETURNING *;

-- name: UpdateEmployee :one
UPDATE employees
SET
    first_name    = COALESCE(sqlc.narg(first_name)::varchar, first_name),
    last_name     = COALESCE(sqlc.narg(last_name)::varchar, last_name),
    email         = COALESCE(sqlc.narg(email)::varchar, email),
    phone         = COALESCE(sqlc.narg(phone)::varchar, phone),
    hire_date     = COALESCE(sqlc.narg(hire_date)::date, hire_date),
    is_active     = COALESCE(sqlc.narg(is_active)::boolean, is_active),
    department_id = COALESCE(sqlc.narg(department_id)::integer, department_id),
    role_id       = COALESCE(sqlc.narg(role_id)::integer, role_id),
    updated_at    = now()
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: DeleteEmployee :execrows
DELETE FROM employees
WHERE id = sqlc.arg(id);

-- name: AssignEmployeeDepartment :one
WITH assigned AS (
    UPDATE employees
    SET department_id = sqlc.arg(department_id),
        updated_at    = now()
    WHERE employees.id = sqlc.arg(id)
    RETURNING *
)
SELECT
    a.id,
    a.first_name,
    a.last_name,
    a.email,
    a.phone,
    a.hire_date,
    a.is_active,
    d.id   AS department_id,
    d.name AS department_name,
    r.id   AS role_id,
    r.title AS role_title,
    a.created_at,
    a.updated_at
FROM assigned a
LEFT JOIN departments d ON d.id = a.department_id
LEFT JOIN roles r ON r.id = a.role_id;

-- name: AssignEmployeeRole :one
WITH assigned AS (
    UPDATE employees
    SET role_id    = sqlc.arg(role_id),
        updated_at = now()
    WHERE employees.id = sqlc.arg(id)
    RETURNING *
)
SELECT
    a.id,
    a.first_name,
    a.last_name,
    a.email,
    a.phone,
    a.hire_date,
    a.is_active,
    d.id   AS department_id,
    d.name AS department_name,
    r.id   AS role_id,
    r.title AS role_title,
    a.created_at,
    a.updated_at
FROM assigned a
LEFT JOIN departments d ON d.id = a.department_id
LEFT JOIN roles r ON r.id = a.role_id;
