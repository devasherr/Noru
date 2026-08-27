package main

import (
	"context"
	"log"
	"os"

	"github.com/devasherr/Noru/internal/database"
	httpserver "github.com/devasherr/Noru/internal/http_server"
	"github.com/gofiber/fiber/v3"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil && !os.IsNotExist(err) {
		log.Fatal("failed to load .env", err)
	}

	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	ctx := context.Background()

	pool, err := database.Connect(ctx)
	if err != nil {
		return err
	}
	defer pool.Close()

	log.Println("connected to postgres")
	return httpserver.NewServer(fiber.New(), pool).Run()
}
