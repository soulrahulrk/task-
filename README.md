# Team Task Manager

A full-stack project management and task tracking application built with Next.js, Prisma, and NextAuth.

## Features
- **Authentication**: Secure Signup and Login (Credentials Provider).
- **Role-Based Access Control**:
  - `ADMIN`: Can create projects, create tasks, assign tasks, update any task, and view users.
  - `MEMBER`: Can view projects, view assigned tasks, and update the status of their assigned tasks.
- **Projects Management**: Admins can create and manage projects.
- **Tasks Management**: Admins can create tasks, assign them to members, and set due dates. Members can track and update their task statuses (Pending, In Progress, Completed).
- **Dashboard**: Overview of task statistics and recent tasks.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: SQLite (Local) / PostgreSQL (Railway)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Styling**: Vanilla CSS (Vibrant & Modern UI)

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

## Demo Video
Once deployed, use tools like Loom or OBS to record a 2-5 minute video showcasing:
1. Registering as an Admin and a Member.
2. Admin creating a project and assigning tasks.
3. Member logging in and changing task status.
4. The dashboard statistics updating in real-time.
