package main

import (
	"log"

	httpserver "github.com/devasherr/Noru/internal/http_server"
	"github.com/gofiber/fiber/v3"
)

func main() {
	server := httpserver.NewServer(fiber.New())
	log.Fatal(server.Run())
}
