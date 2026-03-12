# 🔍 Collaborative Code Review Platform — API

> A backend API enabling developers to post code snippets, request structured feedback, and collaborate on reviews in real time. Built for teams that care about code quality.

**Stack:** Node.js · Express · TypeScript · PostgreSQL · JWT

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the App](#-running-the-app)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🧭 Overview

The Collaborative Code Review Platform provides a structured workflow for engineering teams to submit code for review, track feedback, and manage approvals — all through a clean REST API.

Key user flows:
- **Submitters** post code snippets tied to a project and await reviewer feedback
- **Reviewers** leave inline or general comments and approve or request changes
- **Team leads** track project-level analytics and review turnaround times

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| 🔐 **JWT Authentication** | Secure registration and login with token-based sessions |
| 👥 **Role-Based Access** | `Submitter` and `Reviewer` roles with scoped permissions |
| 📁 **Project Management** | Create projects, assign members, and track activity |
| 📝 **Code Submissions** | Upload code snippets with full lifecycle status tracking |
| 💬 **Collaborative Review** | General and line-by-line inline comments |
| 📊 **Analytics** | Project-level stats including average review time |
| 🔔 **Notifications** | Personal activity feeds for each user |

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js v18+ |
| **Framework** | Express |
| **Language** | TypeScript |
| **Database** | PostgreSQL (via `pg` driver) |
| **Auth** | `jsonwebtoken` (JWT) + `bcrypt` (password hashing) |
| **Dev Tools** | `nodemon`, `ts-node` |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed before proceeding:

- [Node.js v18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- npm or yarn

### Installation

```bash
git clone [YOUR_REPOSITORY_URL]
cd code-review-platform
npm install
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the **root directory** of the project. All values are required.

```env
# ─── Database ────────────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres             # Local database superuser
DB_PASSWORD=your_password    # Local database password
DB_NAME=code_review_db

# ─── Application ─────────────────────────────────────────
PORT=5000
JWT_SECRET=your_super_secret_random_key_here   # Use a long random string in production
```

---

## 🗄️ Database Setup

The database must be initialized before starting the app. Choose one of the two methods below.

### Option A — Automated Setup ✅ (Recommended)

Runs the full initialization script as a PostgreSQL superuser (e.g., `postgres`). This creates the database, the `review_user` role, all tables, types, and seed data in one sequence.

```bash
psql -U postgres -f src/database/init_server_db.sql
```

> 💡 **Windows Tip:** If `psql` is not in your PATH, use the full path:
> `"C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -U postgres -f src/database/init_server_db.sql`

### Option B — Manual Schema Only

If you've already created the database and user, run only the schema:

```bash
psql -U review_user -d code_review_db -f src/database/schema_all.sql
```

---

## ▶️ Running the App

### Development Mode (with live reload)

```bash
npm run dev
```

The server starts at: **`http://localhost:5000`**

### Production Build

```bash
npm run build   # Compiles TypeScript to JavaScript
npm start       # Runs the compiled output
```

---

## 📡 API Reference

All authenticated endpoints require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Log in and receive a JWT | Public |

### Users & Notifications

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/:id` | View user profile | Authenticated |
| `PUT` | `/api/users/:id` | Update profile (name) | Authenticated (Self) |
| `GET` | `/api/users/:id/notifications` | Get activity feed | Authenticated (Self) |

### Projects

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | List projects you are in | Authenticated |
| `POST` | `/api/projects` | Create a new project | Authenticated |
| `POST` | `/api/projects/:id/members` | Add a Reviewer to project | Reviewer |
| `GET` | `/api/projects/:id/stats` | View project analytics | Reviewer |

### Submissions & Review

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions` | Create a new code submission | Authenticated |
| `GET` | `/api/submissions/project/:id`| List submissions for a project | Authenticated |
| `PUT` | `/api/submissions/:id/status` | Update status (pending/approved/etc)| Reviewer/Submitter|
| `POST` | `/api/submissions/:id/approve` | Approve a submission | Reviewer |
| `POST` | `/api/submissions/:id/request-changes`| Request changes | Reviewer |
| `GET` | `/api/submissions/:id/reviews` | View review history | Reviewer |

### Comments

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions/:id/comments` | Add inline or general comment | Reviewer |
| `GET` | `/api/submissions/:id/comments` | List all comments | Authenticated |
| `PUT` | `/api/comments/:id` | Edit your own comment | Reviewer (Author) |
| `DELETE`| `/api/comments/:id` | Delete your own comment | Reviewer (Author) |

---

## 📁 Project Structure

```
├── src/
│   ├── database/
│   │   ├── db.ts                # Database connection logic
│   │   ├── init_server_db.sql   # Full DB initialization script
│   │   └── schema_all.sql       # Schema only
│   ├── middleware/
│   │   ├── auth-middleware.ts   # JWT verification
│   │   ├── error-handler.ts     # Global catch-all errors
│   │   └── validation-middleware.ts
│   ├── routes/
│   │   ├── auth-routes.ts
│   │   ├── user-routes.ts
│   │   ├── project-routes.ts
│   │   ├── submission-routes.ts
│   │   ├── comment-routes.ts
│   │   ├── review-routes.ts
│   │   └── notification-routes.ts
│   ├── services/
│   │   └── auth-service.ts      # Auth business logic
│   ├── types/
│   │   └── types.ts             # Global TS interfaces
│   └── server.ts                # App entry point
├── .env                         # Local config (not committed)
└── package.json
```

---

## 🔧 Troubleshooting

### ❌ `password authentication failed for user "postgres"`
- Verify `DB_USER` and `DB_PASSWORD` in `.env` match your local PostgreSQL setup.

### ❌ `'psql' is not recognized`
- Ensure PostgreSQL's `bin` folder is in your system **PATH**.

### ❌ Encoding / "File appears to be binary"
- All `.ts` files must be **UTF-8** encoded.

### ❌ Port 5000 in use
- Change the `PORT` value in your `.env`.

---

## 📄 License
Internal / ISC
