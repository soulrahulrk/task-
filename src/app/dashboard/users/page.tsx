import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { tasks: true, projects: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Team Members</h1>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Projects Created</th>
                <th>Tasks Assigned</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 500 }}>{user.name || "N/A"}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td>
                    <span className="badge" style={{ background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', color: user.role === 'ADMIN' ? 'var(--danger-color)' : 'var(--primary-color)' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user._count.projects}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user._count.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
