package httpserver

import (
	"errors"
	"fmt"
	"log"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/devasherr/Noru/gen/db"
	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

const (
	defaultLimit = 50
	maxLimit     = 200
)

var attendanceStatuses = []string{"present", "absent", "late", "on_leave"}

type employeePayload struct {
	FirstName    *string `json:"first_name"`
	LastName     *string `json:"last_name"`
	Email        *string `json:"email"`
	Phone        *string `json:"phone"`
	HireDate     *string `json:"hire_date"`
	IsActive     *bool   `json:"is_active"`
	DepartmentID *int32  `json:"department_id"`
	RoleID       *int32  `json:"role_id"`
}

type assignDepartmentPayload struct {
	DepartmentID *int32 `json:"department_id"`
}

type assignRolePayload struct {
	RoleID *int32 `json:"role_id"`
}

type assignShiftPayload struct {
	ShiftID  *int32  `json:"shift_id"`
	WorkDate *string `json:"work_date"`
}

type attendancePayload struct {
	WorkDate *string `json:"work_date"`
	Status   *string `json:"status"`
	CheckIn  *string `json:"check_in"`
	CheckOut *string `json:"check_out"`
}

func (s *Server) listEmployees(c fiber.Ctx) error {
	limit := fiber.Query(c, "limit", int32(defaultLimit))
	offset := fiber.Query(c, "offset", int32(0))

	if limit < 1 || limit > maxLimit {
		return badRequest(c, fmt.Sprintf("limit must be between 1 and %d", maxLimit))
	}
	if offset < 0 {
		return badRequest(c, "offset must not be negative")
	}

	employees, err := s.queries.ListEmployees(c.Context(), db.ListEmployeesParams{
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		return dbError(c, err)
	}

	if employees == nil {
		employees = []db.ListEmployeesRow{}
	}

	return c.JSON(fiber.Map{
		"data":   employees,
		"limit":  limit,
		"offset": offset,
	})
}

func (s *Server) createEmployee(c fiber.Ctx) error {
	var body employeePayload
	if err := c.Bind().JSON(&body); err != nil {
		return badRequest(c, "invalid json body: "+err.Error())
	}

	firstName := trim(body.FirstName)
	lastName := trim(body.LastName)
	if firstName == "" || lastName == "" {
		return badRequest(c, "first_name and last_name are required")
	}

	hireDate, err := parseDate("hire_date", body.HireDate)
	if err != nil {
		return badRequest(c, err.Error())
	}

	employee, err := s.queries.CreateEmployee(c.Context(), db.CreateEmployeeParams{
		FirstName: firstName,
		LastName:  lastName,
		Email:     nullText(body.Email),
		Phone:     nullText(body.Phone),
		HireDate:  hireDate,
		IsActive:  nullBool(body.IsActive),
	})
	if err != nil {
		return dbError(c, err)
	}

	return c.Status(fiber.StatusCreated).JSON(employee)
}

func (s *Server) updateEmployee(c fiber.Ctx) error {
	id, err := employeeID(c)
	if err != nil {
		return badRequest(c, err.Error())
	}

	var body employeePayload
	if err := c.Bind().JSON(&body); err != nil {
		return badRequest(c, "invalid json body: "+err.Error())
	}

	hireDate, err := parseDate("hire_date", body.HireDate)
	if err != nil {
		return badRequest(c, err.Error())
	}

	params := db.UpdateEmployeeParams{
		ID:           id,
		FirstName:    nullText(body.FirstName),
		LastName:     nullText(body.LastName),
		Email:        nullText(body.Email),
		Phone:        nullText(body.Phone),
		HireDate:     hireDate,
		IsActive:     nullBool(body.IsActive),
		DepartmentID: nullInt4(body.DepartmentID),
		RoleID:       nullInt4(body.RoleID),
	}
	if !params.FirstName.Valid && !params.LastName.Valid && !params.Email.Valid &&
		!params.Phone.Valid && !params.HireDate.Valid && !params.IsActive.Valid &&
		!params.DepartmentID.Valid && !params.RoleID.Valid {
		return badRequest(c, "no updatable fields provided")
	}

	employee, err := s.queries.UpdateEmployee(c.Context(), params)
	if err != nil {
		return dbError(c, err)
	}

	return c.JSON(employee)
}

func (s *Server) assignEmployeeDepartment(c fiber.Ctx) error {
	id, err := employeeID(c)
	if err != nil {
		return badRequest(c, err.Error())
	}

	var body assignDepartmentPayload
	if err := c.Bind().JSON(&body); err != nil {
		return badRequest(c, "invalid json body: "+err.Error())
	}

	if body.DepartmentID == nil || *body.DepartmentID < 1 {
		return badRequest(c, "department_id is required and must be a positive integer")
	}

	employee, err := s.queries.AssignEmployeeDepartment(c.Context(), db.AssignEmployeeDepartmentParams{
		ID:           id,
		DepartmentID: nullInt4(body.DepartmentID),
	})
	if err != nil {
		return dbError(c, err)
	}

	return c.JSON(employee)
}

func (s *Server) assignEmployeeRole(c fiber.Ctx) error {
	id, err := employeeID(c)
	if err != nil {
		return badRequest(c, err.Error())
	}

	var body assignRolePayload
	if err := c.Bind().JSON(&body); err != nil {
		return badRequest(c, "invalid json body: "+err.Error())
	}

	if body.RoleID == nil || *body.RoleID < 1 {
		return badRequest(c, "role_id is required and must be a positive integer")
	}

	employee, err := s.queries.AssignEmployeeRole(c.Context(), db.AssignEmployeeRoleParams{
		ID:     id,
		RoleID: nullInt4(body.RoleID),
	})
	if err != nil {
		return dbError(c, err)
	}

	return c.JSON(employee)
}

func (s *Server) assignEmployeeShift(c fiber.Ctx) error {
	id, err := employeeID(c)
	if err != nil {
		return badRequest(c, err.Error())
	}

	var body assignShiftPayload
	if err := c.Bind().JSON(&body); err != nil {
		return badRequest(c, "invalid json body: "+err.Error())
	}

	if body.ShiftID == nil || *body.ShiftID < 1 {
		return badRequest(c, "shift_id is required and must be a positive integer")
	}

	workDate, err := parseDate("work_date", body.WorkDate)
	if err != nil {
		return badRequest(c, err.Error())
	}
	if !workDate.Valid {
		return badRequest(c, "work_date is required and must be a YYYY-MM-DD date")
	}

	assignment, err := s.queries.AssignEmployeeShift(c.Context(), db.AssignEmployeeShiftParams{
		EmployeeID: id,
		ShiftID:    *body.ShiftID,
		WorkDate:   workDate,
	})
	if err != nil {
		return dbError(c, err)
	}

	// The day was free, so a new rota entry exists; otherwise it replaced one.
	if assignment.Created {
		return c.Status(fiber.StatusCreated).JSON(assignment)
	}

	return c.JSON(assignment)
}

func (s *Server) recordEmployeeAttendance(c fiber.Ctx) error {
	id, err := employeeID(c)
	if err != nil {
		return badRequest(c, err.Error())
	}

	var body attendancePayload
	if err := c.Bind().JSON(&body); err != nil {
		return badRequest(c, "invalid json body: "+err.Error())
	}

	workDate, err := parseDate("work_date", body.WorkDate)
	if err != nil {
		return badRequest(c, err.Error())
	}
	if !workDate.Valid {
		return badRequest(c, "work_date is required and must be a YYYY-MM-DD date")
	}

	status := trim(body.Status)
	if !slices.Contains(attendanceStatuses, status) {
		return badRequest(c, "status is required and must be one of "+strings.Join(attendanceStatuses, ", "))
	}

	checkIn, err := parseTimestamp("check_in", body.CheckIn)
	if err != nil {
		return badRequest(c, err.Error())
	}

	checkOut, err := parseTimestamp("check_out", body.CheckOut)
	if err != nil {
		return badRequest(c, err.Error())
	}

	if checkIn.Valid && checkOut.Valid && !checkOut.Time.After(checkIn.Time) {
		return badRequest(c, "check_out must be after check_in")
	}
	if checkOut.Valid && !checkIn.Valid {
		return badRequest(c, "check_out requires check_in")
	}

	record, err := s.queries.RecordEmployeeAttendance(c.Context(), db.RecordEmployeeAttendanceParams{
		EmployeeID: id,
		WorkDate:   workDate,
		Status:     status,
		CheckIn:    checkIn,
		CheckOut:   checkOut,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			exists, existsErr := s.queries.EmployeeExists(c.Context(), id)
			if existsErr != nil {
				return dbError(c, existsErr)
			}
			if !exists {
				return errorJSON(c, fiber.StatusNotFound, "employee not found")
			}

			return errorJSON(c, fiber.StatusUnprocessableEntity, "employee has no shift assigned on that date")
		}

		return dbError(c, err)
	}

	if record.Created {
		return c.Status(fiber.StatusCreated).JSON(record)
	}

	return c.JSON(record)
}

func (s *Server) deleteEmployee(c fiber.Ctx) error {
	id, err := employeeID(c)
	if err != nil {
		return badRequest(c, err.Error())
	}

	rows, err := s.queries.DeleteEmployee(c.Context(), id)
	if err != nil {
		return dbError(c, err)
	}
	if rows == 0 {
		return errorJSON(c, fiber.StatusNotFound, "employee not found")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func employeeID(c fiber.Ctx) (int32, error) {
	id, err := strconv.ParseInt(c.Params("id"), 10, 32)
	if err != nil || id < 1 {
		return 0, errors.New("id must be a positive integer")
	}

	return int32(id), nil
}

func trim(v *string) string {
	if v == nil {
		return ""
	}

	return strings.TrimSpace(*v)
}

func nullText(v *string) pgtype.Text {
	s := trim(v)
	if s == "" {
		return pgtype.Text{}
	}

	return pgtype.Text{String: s, Valid: true}
}

func nullBool(v *bool) pgtype.Bool {
	if v == nil {
		return pgtype.Bool{}
	}

	return pgtype.Bool{Bool: *v, Valid: true}
}

func nullInt4(v *int32) pgtype.Int4 {
	if v == nil {
		return pgtype.Int4{}
	}

	return pgtype.Int4{Int32: *v, Valid: true}
}

func parseDate(field string, v *string) (pgtype.Date, error) {
	s := trim(v)
	if s == "" {
		return pgtype.Date{}, nil
	}

	t, err := time.Parse(time.DateOnly, s)
	if err != nil {
		return pgtype.Date{}, fmt.Errorf("%s must be a YYYY-MM-DD date", field)
	}

	return pgtype.Date{Time: t, Valid: true}, nil
}

func parseTimestamp(field string, v *string) (pgtype.Timestamptz, error) {
	s := trim(v)
	if s == "" {
		return pgtype.Timestamptz{}, nil
	}

	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return pgtype.Timestamptz{}, fmt.Errorf("%s must be an RFC3339 timestamp, e.g. 2026-08-27T14:05:00+03:00", field)
	}

	return pgtype.Timestamptz{Time: t, Valid: true}, nil
}

func badRequest(c fiber.Ctx, message string) error {
	return errorJSON(c, fiber.StatusBadRequest, message)
}

func errorJSON(c fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(fiber.Map{"error": message})
}

func dbError(c fiber.Ctx, err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return errorJSON(c, fiber.StatusNotFound, "employee not found")
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505": // unique_violation
			return errorJSON(c, fiber.StatusConflict, "email is already taken")
		case "23503": // foreign_key_violation
			switch pgErr.ConstraintName {
			case "employees_department_id_fkey":
				return errorJSON(c, fiber.StatusUnprocessableEntity, "department does not exist")
			case "employees_role_id_fkey":
				return errorJSON(c, fiber.StatusUnprocessableEntity, "role does not exist")
			case "employee_shifts_employee_id_fkey":
				return errorJSON(c, fiber.StatusNotFound, "employee not found")
			case "employee_shifts_shift_id_fkey":
				return errorJSON(c, fiber.StatusUnprocessableEntity, "shift does not exist")
			}
			return errorJSON(c, fiber.StatusUnprocessableEntity, "referenced record does not exist")
		}
	}

	log.Printf("employees: %v", err)
	return errorJSON(c, fiber.StatusInternalServerError, "internal server error")
}
