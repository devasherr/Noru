package httpserver

import "github.com/gofiber/fiber/v3"

func (s *Server) initRoutes() {
	s.fiber.Get("/", func(c fiber.Ctx) error {
		return c.SendString("Hello, world")
	})

	s.fiber.Get("/health", func(c fiber.Ctx) error {
		if err := s.pool.Ping(c.Context()); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"status": "down",
				"error":  err.Error(),
			})
		}

		return c.JSON(fiber.Map{"status": "ok", "database": "up"})
	})
}
