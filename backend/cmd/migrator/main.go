package main

import (
	"fmt"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
    databaseURL := os.Getenv("DATABASE_URL")
    if databaseURL == "" {
        log.Fatal("DATABASE_URL is required")
    }

    migrationsPath := os.Getenv("MIGRATIONS_PATH")
    if migrationsPath == "" {
        migrationsPath = "file://migrations"
    } else {
        migrationsPath = fmt.Sprintf("file://%s", migrationsPath)
    }

    m, err := migrate.New(migrationsPath, databaseURL)
    if err != nil {
        log.Fatalf("failed to init migrator: %v", err)
    }

    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        log.Fatalf("migration failed: %v", err)
    }

    log.Println("migrations applied successfully")
}


