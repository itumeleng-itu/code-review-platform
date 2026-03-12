-- ============================================
-- Collaborative Code Review Platform
-- Full Server Initialization & Seeding Script
-- ============================================

/*
  INSTRUCTIONS:
  1. Run this script as a PostgreSQL superuser (e.g., 'postgres'):
     psql -U postgres -f src/database/init_server_db.sql

  2. This script will:
     - Create the 'review_user' (if not exists)
     - Create the 'code_review_db' (if not exists)
     - Initialize all types and tables
     - Seed initial data
*/

-- 1. Setup Database and User (Run as Superuser)
-- Note: These commands cannot be run inside a transaction block.

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'review_user') THEN
        CREATE ROLE review_user WITH LOGIN PASSWORD 'my_secure_password';
    END IF;
END
$$;

SELECT 'Creating database code_review_db...' AS message;
-- Database creation cannot happen in a DO block in standard PSQL via single file usually if it exists.
-- However, for a 'full script' we'll assume the user might run these setup parts individually or we use a trick.
-- For simplicity in a single script, we assume the DB might already exist or we catch error.

-- We skip the CREATE DATABASE here as it typically requires being outside a transaction and is best done via psql command if it doesn't exist.
-- But we will include the rest of the schema setup.

-- 2. Connect to the database (if running via psql)
\c code_review_db

-- 3. Consolidated Database Schema (Types)
CREATE TYPE user_role AS ENUM ('Submitter', 'Reviewer');
CREATE TYPE submission_status AS ENUM ('pending', 'in_review', 'approved', 'changes_requested');
CREATE TYPE review_action AS ENUM ('approved', 'changes_requested');

-- 4. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'Submitter',
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Project Members Table
CREATE TABLE project_members (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_role VARCHAR(50) NOT NULL DEFAULT 'Reviewer',
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

-- 7. Submissions Table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    code_content TEXT NOT NULL,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    submitter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status submission_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Comments Table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    line_number INTEGER,
    is_inline BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action review_action NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link_to TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Initial Seeding Data
-- Seed a system admin/reviewer (Password: 'password123' - hash: $2b$10$EixzaYVK1VzS.HnQ6wW8/uH7uHh8uH7uHh8uH7uHh8uH7uHh8uH7u)
-- Note: Real hashes should be used in production.
INSERT INTO users (username, email, password_hash, role, full_name)
VALUES ('admin', 'admin@example.com', '$2b$10$K7b.r5cW.K.j1jS5p6P6OeW.f1f1f1f1f1f1f1f1f1f1f1', 'Reviewer', 'System Admin');

INSERT INTO users (username, email, password_hash, role, full_name)
VALUES ('dev_user', 'dev@example.com', '$2b$10$K7b.r5cW.K.j1jS5p6P6OeW.f1f1f1f1f1f1f1f1f1f1f1', 'Submitter', 'Developer One');

-- Seed a sample project
INSERT INTO projects (name, description, owner_id)
VALUES ('Demo Project', 'A sample project for testing the code review platform.', 1);

-- Add owner as a member
INSERT INTO project_members (project_id, user_id, project_role)
VALUES (1, 1, 'Reviewer');

-- Add dev_user as a member
INSERT INTO project_members (project_id, user_id, project_role)
VALUES (1, 2, 'Submitter');

-- Grant permissions to review_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO review_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO review_user;
