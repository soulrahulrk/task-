import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  const tasksCount = await prisma.task.count({
    where: isAdmin ? {} : { assignedToUser: session.user.id }
  });

  const completedCount = await prisma.task.count({
    where: {
      status: "COMPLETED",
      ...(isAdmin ? {} : { assignedToUser: session.user.id })
    }
  });

  const pendingCount = await prisma.task.count({
    where: {
      status: "PENDING",
      ...(isAdmin ? {} : { assignedToUser: session.user.id })
    }
  });

  const inProgressCount = await prisma.task.count({
    where: {
      status: "IN_PROGRESS",
      ...(isAdmin ? {} : { assignedToUser: session.user.id })
    }
  });

  const recentTasks = await prisma.task.findMany({
    where: isAdmin ? {} : { assignedToUser: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { project: true }
  });

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Dashboard Overview</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Tasks</div>
          <div className="stat-value">{tasksCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Completed</div>
          <div className="stat-value" style={{ color: 'var(--success-color)' }}>{completedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">In Progress</div>
          <div className="stat-value" style={{ color: 'var(--primary-color)' }}>{inProgressCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Pending</div>
          <div className="stat-value" style={{ color: 'var(--warning-color)' }}>{pendingCount}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 600 }}>Recent Tasks</h2>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No recent tasks found</td>
                </tr>
              ) : (
                recentTasks.map(task => (
                  <tr key={task.id}>
                    <td style={{ fontWeight: 500 }}>{task.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{task.project.name}</td>
                    <td>
                      <span className={`badge badge-${task.status.toLowerCase()}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
