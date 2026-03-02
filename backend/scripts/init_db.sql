-- PostgreSQL initialization script
-- This runs automatically when the Docker container starts with a fresh database.
-- It creates the extensions needed by the application.

-- Enable UUID generation (used by all primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for faster text search (optional, useful for searching registrations)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
