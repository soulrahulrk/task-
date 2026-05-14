"use client";

import { useMemo, useState } from "react";

type UserOption = {
  id: string;
  name?: string | null;
  email: string;
  role: string;
};

type ProjectMember = {
  id: string;
  userId: string;
  user: UserOption;
};

export default function ProjectMembersManager({
  projectId,
  creatorId,
  allUsers,
  initialMembers,
}: {
  projectId: string;
  creatorId: string;
  allUsers: UserOption[];
  initialMembers: ProjectMember[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>(initialMembers);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.userId));
    return allUsers.filter((user) => !memberIds.has(user.id));
  }, [allUsers, members]);

  async function handleAddMember() {
    if (!selectedUserId) return;
    setIsBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add member");
      }

      const member = await res.json();
      setMembers((current) => [...current, member]);
      setSelectedUserId("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add member");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (userId === creatorId) return;
    setIsBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove member");
      }

      setMembers((current) => current.filter((member) => member.userId !== userId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <button className="btn" onClick={() => setIsOpen(true)}>
        Manage Team
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Manage Team</h2>
              <button onClick={() => setIsOpen(false)} style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>
                &times;
              </button>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Current Members</div>
              {members.length === 0 ? (
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No members yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        padding: "0.75rem",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-color)",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{member.user.name || member.user.email}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{member.user.email}</div>
                      </div>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={isBusy || member.userId === creatorId}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                        title={member.userId === creatorId ? "Project creator cannot be removed" : "Remove member"}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Add Member</div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <select
                  className="form-control"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isBusy || availableUsers.length === 0}
                >
                  <option value="">Select a user</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email} ({user.role})
                    </option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleAddMember} disabled={isBusy || !selectedUserId}>
                  Add
                </button>
              </div>
              {availableUsers.length === 0 && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  All users are already members.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
