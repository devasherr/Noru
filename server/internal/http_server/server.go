package httpserver

import "github.com/gofiber/fiber/v3"

type Server struct {
	fiber *fiber.App
}

func NewServer(fiber *fiber.App) *Server {
	s := &Server{fiber: fiber}
	s.initRoutes()
	return s
}

func (s *Server) Run() error {
	return s.fiber.Listen(":7777")
}
