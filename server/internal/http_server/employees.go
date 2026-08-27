package httpserver

import (
	"errors"
	"fmt"
	"log"
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

	hireDate, err := parseDate(body.HireDate)
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

	hireDate, err := parseDate(body.HireDate)
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

func parseDate(v *string) (pgtype.Date, error) {
	s := trim(v)
	if s == "" {
		return pgtype.Date{}, nil
	}

	t, err := time.Parse(time.DateOnly, s)
	if err != nil {
		return pgtype.Date{}, errors.New("hire_date must be a YYYY-MM-DD date")
	}

	return pgtype.Date{Time: t, Valid: true}, nil
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
			return errorJSON(c, fiber.StatusUnprocessableEntity, "department_id or role_id does not exist")
		}
	}

	log.Printf("employees: %v", err)
	return errorJSON(c, fiber.StatusInternalServerError, "internal server error")
}
