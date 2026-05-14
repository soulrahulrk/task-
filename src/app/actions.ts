"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) throw new Error("Name is required");

  await prisma.project.create({
    data: {
      name,
      description,
      createdBy: session.user.id,
    }
  });

  revalidatePath("/dashboard/projects");
}

export async function createTask(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const projectId = formData.get("projectId") as string;
  const assignedToUser = formData.get("assignedToUser") as string;
  const dueDateStr = formData.get("dueDate") as string;

  if (!title || !projectId) throw new Error("Missing required fields");

  await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assignedToUser: assignedToUser || null,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
    }
  });

  revalidatePath("/dashboard/tasks");
}

export async function updateTaskStatus(taskId: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  
  if (!task) throw new Error("Task not found");
  
  // Admins can update any task, members can only update assigned tasks
  if (session.user.role !== "ADMIN" && task.assignedToUser !== session.user.id) {
    throw new Error("Unauthorized to update this task");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status }
  });

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
}
