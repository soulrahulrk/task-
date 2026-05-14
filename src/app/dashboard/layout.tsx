import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>⚡</span> TeamTask
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="nav-item">
            Dashboard
          </Link>
          <Link href="/dashboard/projects" className="nav-item">
            Projects
          </Link>
          <Link href="/dashboard/tasks" className="nav-item">
            Tasks
          </Link>
          {session.user.role === "ADMIN" && (
            <Link href="/dashboard/users" className="nav-item">
              Users
            </Link>
          )}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Welcome, {session.user.name || "User"}</h2>
          </div>
          <div className="topbar-user">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {session.user.role}
            </span>
            <div className="user-avatar">
              {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
            </div>
            <LogoutButton />
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
