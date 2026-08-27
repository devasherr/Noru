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
