import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const task = await prisma.task.findUnique({ where: { id } });
    
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && task.assignedToUser !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
