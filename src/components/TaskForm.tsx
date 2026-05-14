"use client";

import { useMemo, useState } from "react";

type ProjectOption = {
  id: string;
  name: string;
  members: { userId: string }[];
};

type UserOption = {
  id: string;
  name?: string | null;
  email: string;
};

export default function TaskForm({
  projects,
  users,
}: {
  projects: ProjectOption[];
  users: UserOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id || ""
  );

  const availableUsers = useMemo(() => {
    const selected = projects.find((project) => project.id === selectedProjectId);
    const memberIds = new Set(selected?.members.map((member) => member.userId) || []);
    return users.filter((user) => memberIds.has(user.id));
  }, [projects, selectedProjectId, users]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const projectId = formData.get("projectId") as string;
    const assignedToUser = formData.get("assignedToUser") as string;
    const dueDate = formData.get("dueDate") as string;

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, projectId, assignedToUser, dueDate })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create task");
      }
      
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  if (projects.length === 0) {
    return (
      <button className="btn btn-primary" disabled title="Create a project first">
        + New Task
      </button>
    );
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        + New Task
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Create Task</h2>
              <button onClick={() => setIsOpen(false)} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Task Title</label>
                <input type="text" id="title" name="title" className="form-control" required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" className="form-control" rows={3} />
              </div>
              
              <div className="form-group">
                <label htmlFor="projectId">Project</label>
                <select
                  id="projectId"
                  name="projectId"
                  className="form-control"
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assignedToUser">Assignee (Optional)</label>
                <select
                  id="assignedToUser"
                  name="assignedToUser"
                  className="form-control"
                  disabled={availableUsers.length === 0}
                >
                  <option value="">Unassigned</option>
                  {availableUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
                {availableUsers.length === 0 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Add members to this project before assigning tasks.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date (Optional)</label>
                <input type="date" id="dueDate" name="dueDate" className="form-control" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
