"use client";

import { useState, useTransition } from "react";

export default function TaskStatusSelect({ taskId, initialStatus, isEditable }: { taskId: string, initialStatus: string, isEditable: boolean }) {
  const [isPending, startTransition] = useTransition();

  if (!isEditable) {
    return (
      <span className={`badge badge-${initialStatus.toLowerCase()}`}>
        {initialStatus.replace("_", " ")}
      </span>
    );
  }

  return (
    <select
      defaultValue={initialStatus}
      disabled={isPending}
      onChange={async (e) => {
        const newStatus = e.target.value;
        startTransition(async () => {
          try {
            const res = await fetch(`/api/tasks/${taskId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
              throw new Error("Failed to update status");
            }
            window.location.reload();
          } catch (error) {
            alert(error instanceof Error ? error.message : "Error updating status");
          }
        });
      }}
      style={{
        padding: "0.25rem 0.5rem",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-color)",
        color: "var(--text-primary)",
        fontSize: "0.85rem",
        cursor: isPending ? "wait" : "pointer"
      }}
    >
      <option value="PENDING">Pending</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="COMPLETED">Completed</option>
    </select>
  );
}
