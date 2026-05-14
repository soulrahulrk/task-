"use client";

import { useState } from "react";
import { createProject } from "@/app/actions";

export default function ProjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createProject(formData);
      setIsOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        + New Project
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Create Project</h2>
              <button onClick={() => setIsOpen(false)} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>&times;</button>
            </div>

            <form action={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Project Name</label>
                <input type="text" id="name" name="name" className="form-control" required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" className="form-control" rows={3} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
