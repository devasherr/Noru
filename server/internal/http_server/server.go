package httpserver

import (
	"github.com/devasherr/Noru/gen/db"
	"github.com/gofiber/fiber/v3"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	fiber   *fiber.App
	pool    *pgxpool.Pool
	queries *db.Queries
}

func NewServer(app *fiber.App, pool *pgxpool.Pool) *Server {
	s := &Server{
		fiber:   app,
		pool:    pool,
		queries: db.New(pool),
	}
	s.initRoutes()
	return s
}

func (s *Server) Run() error {
	return s.fiber.Listen(":7777")
}
