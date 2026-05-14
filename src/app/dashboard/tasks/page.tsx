import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TaskForm from "@/components/TaskForm";
import TaskStatusSelect from "@/components/TaskStatusSelect";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  const tasks = await prisma.task.findMany({
    where: isAdmin
      ? {}
      : {
          assignedToUser: session.user.id,
          project: { members: { some: { userId: session.user.id } } },
        },
    include: {
      project: { select: { name: true } },
      assignee: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const projects = isAdmin
    ? await prisma.project.findMany({
        select: { id: true, name: true, members: { select: { userId: true } } },
        orderBy: { createdAt: 'desc' }
      })
    : [];
  const users = isAdmin
    ? await prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { createdAt: 'desc' } })
    : [];

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Tasks</h1>
        {isAdmin && <TaskForm projects={projects} users={users} />}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No tasks found</td>
                </tr>
              ) : (
                tasks.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
                  const isEditable = isAdmin || task.assignedToUser === session.user.id;

                  return (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{task.title}</div>
                        {task.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{task.description}</div>}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{task.project.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {task.assignee ? (task.assignee.name || task.assignee.email) : "Unassigned"}
                      </td>
                      <td>
                        <TaskStatusSelect taskId={task.id} initialStatus={task.status} isEditable={isEditable} />
                      </td>
                      <td style={{ color: isOverdue ? 'var(--danger-color)' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        {isOverdue && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>(Overdue)</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
