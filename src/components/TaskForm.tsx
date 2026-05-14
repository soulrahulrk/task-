"use client";

import { useState } from "react";
import { createTask } from "@/app/actions";

export default function TaskForm({ projects, users }: { projects: any[], users: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createTask(formData);
      setIsOpen(false);
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

            <form action={handleSubmit}>
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
                <select id="projectId" name="projectId" className="form-control" required>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assignedToUser">Assignee (Optional)</label>
                <select id="assignedToUser" name="assignedToUser" className="form-control">
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
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
