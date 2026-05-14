"use client";

import { updateTaskStatus } from "@/app/actions";
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
      onChange={(e) => {
        const newStatus = e.target.value;
        startTransition(() => {
          updateTaskStatus(taskId, newStatus);
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
