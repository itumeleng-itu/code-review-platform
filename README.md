Here is a clear and clean README for your project.

-----

# Collaborative Code Review Platform API

This is the backend API for a platform that enables developers to post code snippets, request feedback, and collaborate on reviews in real-time. It's built with Node.js, Express, TypeScript, and PostgreSQL.

## Core Features

  * **User Authentication:** Secure user registration and login using JWT (JSON Web Tokens).
  * **Role-Based Access:** Clear distinction between `Submitter` and `Reviewer` roles.
  * **Project Management:** Create projects and assign members (Reviewers) to them.
  * **Code Submissions:** Upload code snippets or files for review, with status tracking (`pending`, `in_review`, `approved`, `changes_requested`).
  * **Collaborative Review:** Add general or inline (line-by-line) comments to submissions.
  * **Review Workflow:** Dedicated endpoints for Reviewers to approve or request changes.
  * **Analytics:** A dashboard endpoint to get project-level stats (e.g., avg. review time).
  * **Notifications:** An activity feed endpoint for users.

-----

## Tech Stack

  * **Backend:** Node.js, Express
  * **Language:** TypeScript
  * **Database:** PostgreSQL
  * **Node-Postgres Driver:** `pg`
  * **Authentication:** `jsonwebtoken` (for JWTs), `bcrypt` (for password hashing)
  * **Dev Tools:** `ts-node`, `nodemon`

-----

## Getting Started

Follow these steps to set up and run the project on your local machine.

### 1\. Prerequisites

  * **Node.js:** (v18 or higher recommended)
  * **PostgreSQL:** A running instance of a PostgreSQL server.

### 2\. Clone the Repository

```bash
git clone [YOUR_REPOSITORY_URL]
cd code-review-platform
```

### 3\. Install Dependencies

```bash
npm install
```

### 4\. Set Up Environment Variables

Create a file named `.env` in the root of the project. Copy and paste the template below, filling in your specific database details.

```env
# .env.example
# --- Database Credentials ---
DB_HOST=localhost
DB_PORT=5432
DB_USER=review_user
DB_PASSWORD=my_secure_password
DB_NAME=code_review_db

# --- Application Port ---
PORT=5000

# --- Security ---
JWT_SECRET=YOUR_SUPER_SECURE_RANDOM_KEY_GOES_HERE
```

### 5\. Set Up the Database

Before you can run the app, you must create the database and all the tables.

1.  **Create the Database:** First, create the user and database you specified in your `.env` file (e.g., `code_review_db` and `review_user`).
2.  **Run the Schema:** Execute the consolidated SQL script (`schema_all.sql`) that contains all your `CREATE TYPE` and `CREATE TABLE` commands.

<!-- end list -->

```bash
# Example command using psql
psql -U review_user -d code_review_db -f src/db/schema_all.sql
```

### 6\. Run the Application

Once the database is ready, start the server in development mode.

```bash
npm run dev
```

The server will start, connect to the database, and be ready to accept requests at `http://localhost:5000`.

-----

## API Endpoints

All endpoints require a `Bearer <token>` in the `Authorization` header unless marked as **Public**.

### Authentication (Sprint 2)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user (default role: `Submitter`). | **Public** |
| `POST` | `/api/auth/login` | Log in and receive a JWT. | **Public** |

### Users (Sprint 2 & 7)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/:id` | View a user's profile. | Authenticated |
| `PUT` | `/api/users/:id` | Update a user's profile (`full_name`). | Authenticated (Self) |
| `GET` | `/api/users/:id/notifications` | Get the user's personal activity feed. | Authenticated (Self) |

### Projects (Sprint 3 & 7)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects` | Create a new project. | Authenticated |
| `GET` | `/api/projects` | List all projects the user is a member of. | Authenticated |
| `POST` | `/api/projects/:id/members` | Assign a user to a project (as `Reviewer`). | Reviewer |
| `GET` | `/api/projects/:id/stats` | Get analytics for a single project. | Reviewer |

### Submissions (Sprint 4)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions` | Create a new code submission. | Authenticated |
| `GET` | `/api/submissions/project/:id`| List all submissions for a project. | Authenticated |
| `GET` | `/api/submissions/:id` | View a single submission. | Authenticated |
| `PUT` | `/api/submissions/:id/status`| Update a submission's status (e.g., `in_review`). | Authenticated |
| `DELETE`| `/api/submissions/:id` | Delete a submission. | Submitter/Reviewer |

### Comments & Review (Sprint 5 & 6)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions/:id/approve` | Approve a submission. | Reviewer |
| `POST` | `/api/submissions/:id/request-changes`| Request changes on a submission. | Reviewer |
| `GET` | `/api/submissions/:id/reviews` | Get the review history for a submission. | Reviewer |
| `POST` | `/api/submissions/:id/comments` | Add a comment to a submission. | Reviewer |
| `GET` | `/api/submissions/:id/comments` | List all comments for a submission. | Authenticated |
| `PUT` | `/api/comments/:id` | Update one of your own comments. | Reviewer (Author) |
| `DELETE`| `/api/comments/:id` | Delete one of your own comments. | Reviewer (Author) |

-----

## Error Handling

The API uses a global error handler. All errors will be returned in a standardized JSON format:

```json
{
  "message": "User with this email or username already exists.",
  "status": 409,
  "timestamp": "2025-11-10T10:30:00.000Z"
}
```
