# Team Task Manager

A full-stack project management and task tracking application built with Next.js, Prisma, and NextAuth.

## Features

- **Authentication**: Secure Signup and Login (Credentials Provider).
- **Role-Based Access Control**:
  - `ADMIN`: Can create projects, create tasks, assign tasks, update any task, and view users.
  - `MEMBER`: Can view projects, view assigned tasks, and update the status of their assigned tasks.
- **Projects Management**: Admins can create and manage projects.
- **Team Management**: Admins can add/remove project members; members only see projects they belong to.
- **Tasks Management**: Admins can create tasks, assign them to members, and set due dates. Members can track and update their task statuses (Pending, In Progress, Completed).
- **Dashboard**: Overview of task statistics and recent tasks.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: SQLite (Local) / PostgreSQL (Railway)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Vanilla CSS (Vibrant & Modern UI)

## Live Demo

- **Live URL**: REPLACE_WITH_LIVE_URL
- **Demo Video (2-5 min)**: REPLACE_WITH_DEMO_VIDEO_URL

## Data Model & Relationships

- `User` creates many `Project` records.
- `ProjectMember` is a join table between `Project` and `User` for team membership.
- `Task` belongs to a `Project` and can be assigned to a `User`.

## REST API Coverage

All routes are protected by NextAuth session checks and role-based access control.

### Projects

- `GET /api/projects` (Admin: all projects, Member: only their projects)
- `POST /api/projects` (Admin only)
- `GET /api/projects/:id` (Admin or project member)
- `PATCH /api/projects/:id` (Admin only)
- `DELETE /api/projects/:id` (Admin only)
- `GET /api/projects/:id/members` (Admin or project member)
- `POST /api/projects/:id/members` (Admin only)
- `DELETE /api/projects/:id/members?userId=...` (Admin only)

### Tasks

- `GET /api/tasks` (Admin: all tasks, Member: assigned tasks)
- `POST /api/tasks` (Admin only)
- `GET /api/tasks/:id` (Admin or assigned member)
- `PATCH /api/tasks/:id` (Admin: full update, Member: status only)
- `DELETE /api/tasks/:id` (Admin only)

### Users

- `GET /api/users` (Admin only)

## Getting Started (Local Development)

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Initialize Database**

   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## Admin Setup (Required)

New signups default to `MEMBER`. Promote an admin with:

```bash
npm run make:admin -- user@example.com
```

## One-Time Backfill

If projects existed before team membership was added, backfill members:

```bash
npm run backfill:members
```

## Deployment to Railway (Mandatory Assignment Step)

Follow these steps to deploy this project live on Railway:

### 1. Push to GitHub

1. Create a new repository on GitHub.
2. Push your local code to the repository:

   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

### 2. Configure Database for Railway

Railway provides PostgreSQL. You need to update the Prisma schema to use PostgreSQL instead of SQLite before deploying.

1. Open `prisma/schema.prisma`.
2. Change the `provider` in the `datasource` block:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Commit and push this change to GitHub.

### 3. Deploy on Railway

1. Go to [Railway.app](https://railway.app/) and log in.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Once added, click on **New** -> **Database** -> **Add PostgreSQL**.
5. Go to your Next.js service settings in Railway -> **Variables**.
6. Add the following environment variables:
   - `DATABASE_URL`: (Select the reference to your PostgreSQL database URL provided by Railway)
   - `NEXTAUTH_SECRET`: (Generate a random string, e.g., `your-super-secret-key-123`)
   - `NEXTAUTH_URL`: (Your Railway public domain URL, e.g., `https://your-app-name.up.railway.app`)
7. In your Next.js service, go to **Settings** -> **Build**. Change the build command to:

   ```bash
   npx prisma generate && npx prisma db push && npm run build
   ```

8. Go to **Settings** -> **Networking** and click **Generate Domain**.
9. Wait for the build and deployment to finish. Your app is now live!

### Railway Environment Checklist

- `DATABASE_URL` points to Railway Postgres
- `NEXTAUTH_SECRET` is a secure random string
- `NEXTAUTH_URL` matches your Railway domain

## Demo Video

Once deployed, use tools like Loom or OBS to record a 2-5 minute video showcasing:

1. Registering as an Admin and a Member.
2. Admin creating a project and assigning tasks.
3. Admin adding/removing team members from a project.
4. Member logging in and changing task status.
5. The dashboard statistics updating in real-time.
