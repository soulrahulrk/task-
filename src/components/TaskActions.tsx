"use client";

import { useMemo, useState } from "react";

type ProjectOption = {
  id: string;
  members: { userId: string }[];
};

type UserOption = {
  id: string;
  name?: string | null;
  email: string;
};

export default function TaskActions({
  taskId,
  projectId,
  initialTitle,
  initialDescription,
  initialDueDate,
  initialAssigneeId,
  projects,
  users,
}: {
  taskId: string;
  projectId: string;
  initialTitle: string;
  initialDescription?: string | null;
  initialDueDate?: string | null;
  initialAssigneeId?: string | null;
  projects: ProjectOption[];
  users: UserOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || "");
  const [dueDate, setDueDate] = useState(initialDueDate || "");
  const [assignedToUser, setAssignedToUser] = useState(initialAssigneeId || "");
  const [isBusy, setIsBusy] = useState(false);

  const availableUsers = useMemo(() => {
    const project = projects.find((item) => item.id === projectId);
    const memberIds = new Set(project?.members.map((member) => member.userId) || []);
    return users.filter((user) => memberIds.has(user.id));
  }, [projectId, projects, users]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsBusy(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate || null,
          assignedToUser: assignedToUser || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update task");
      }

      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setIsBusy(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete task");
      }

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete task");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
      <button className="btn" onClick={() => setIsOpen(true)} disabled={isBusy}>
        Edit
      </button>
      <button className="btn btn-danger" onClick={handleDelete} disabled={isBusy}>
        Delete
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Edit Task</h2>
              <button onClick={() => setIsOpen(false)} style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor={`task-title-${taskId}`}>Task Title</label>
                <input
                  id={`task-title-${taskId}`}
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`task-description-${taskId}`}>Description</label>
                <textarea
                  id={`task-description-${taskId}`}
                  className="form-control"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor={`task-assignee-${taskId}`}>Assignee</label>
                <select
                  id={`task-assignee-${taskId}`}
                  className="form-control"
                  value={assignedToUser}
                  onChange={(e) => setAssignedToUser(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
                {availableUsers.length === 0 && (
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                    Add members to this project before assigning tasks.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor={`task-due-${taskId}`}>Due Date</label>
                <input
                  id={`task-due-${taskId}`}
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                <button type="button" className="btn" onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isBusy}>
                  {isBusy ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
