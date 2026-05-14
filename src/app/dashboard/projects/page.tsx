import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectForm from "@/components/ProjectForm";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  const projects = await prisma.project.findMany({
    include: {
      _count: {
        select: { tasks: true }
      },
      creator: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="page-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Projects</h1>
        {isAdmin && <ProjectForm />}
      </div>

      <div className="stats-grid">
        {projects.map((project) => (
          <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {project.name}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
              {project.description || "No description provided."}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {project._count.tasks} Tasks
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                By: {project.creator.name || project.creator.email}
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No projects found. {isAdmin && "Create one to get started."}
          </div>
        )}
      </div>
    </div>
  );
}
