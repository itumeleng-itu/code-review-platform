-- 1. Create the role
CREATE ROLE review_user WITH LOGIN PASSWORD 'my_secure_password';

-- 2. Create the database
CREATE DATABASE code_review_db OWNER review_user;

-- 3. Connect to the database (run everything below after connecting to code_review_db)

-- 4. Types
CREATE TYPE user_role AS ENUM ('Submitter', 'Reviewer');
CREATE TYPE submission_status AS ENUM ('pending', 'in_review', 'approved', 'changes_requested');
CREATE TYPE review_action AS ENUM ('approved', 'changes_requested');

-- 5. Users Table
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

-- 6. Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Project Members Table
CREATE TABLE project_members (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_role VARCHAR(50) NOT NULL DEFAULT 'Reviewer',
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

-- 8. Submissions Table
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

-- 9. Comments Table
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

-- 10. Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action review_action NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link_to TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 12. Seed Data
INSERT INTO users (username, email, password_hash, role, full_name)
VALUES ('admin', 'admin@example.com', '$2b$10$K7b.r5cW.K.j1jS5p6P6OeW.f1f1f1f1f1f1f1f1f1f1f1', 'Reviewer', 'System Admin');

INSERT INTO users (username, email, password_hash, role, full_name)
VALUES ('dev_user', 'dev@example.com', '$2b$10$K7b.r5cW.K.j1jS5p6P6OeW.f1f1f1f1f1f1f1f1f1f1f1', 'Submitter', 'Developer One');

INSERT INTO projects (name, description, owner_id)
VALUES ('Demo Project', 'A sample project for testing the code review platform.', 1);

INSERT INTO project_members (project_id, user_id, project_role)
VALUES (1, 1, 'Reviewer');

INSERT INTO project_members (project_id, user_id, project_role)
VALUES (1, 2, 'Submitter');

-- 13. Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO review_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO review_user;