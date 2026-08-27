CREATE TABLE departments (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employees (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE,
    phone         VARCHAR(30),
    hire_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    role_id       INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shifts (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employee_shifts (
    id           SERIAL PRIMARY KEY,
    employee_id  INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id     INTEGER NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,
    work_date    DATE NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (employee_id, work_date)
);

CREATE TABLE attendance (
    id                  SERIAL PRIMARY KEY,
    employee_shift_id   INTEGER NOT NULL REFERENCES employee_shifts(id) ON DELETE CASCADE,
    check_in            TIMESTAMPTZ,
    check_out           TIMESTAMPTZ,
    status              VARCHAR(20) NOT NULL DEFAULT 'absent'
                         CHECK (status IN ('present','absent','late','on_leave')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_role ON employees(role_id);
CREATE INDEX idx_employee_shifts_date ON employee_shifts(work_date);
CREATE INDEX idx_attendance_shift ON attendance(employee_shift_id);
