package httpserver

import "github.com/gofiber/fiber/v3"

func (s *Server) initRoutes() {
	s.fiber.Get("/", func(c fiber.Ctx) error {
		return c.SendString("Hello, world")
	})
}
