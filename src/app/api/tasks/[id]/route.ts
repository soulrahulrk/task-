import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  ApiError,
  asStringId,
  optionalString,
  parseOptionalDate,
  requireEnum,
  requireString,
  TASK_STATUSES,
} from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && task.assignedToUser !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { id: true, projectId: true, assignedToUser: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && task.assignedToUser !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data: {
      title?: string;
      description?: string | null;
      status?: string;
      dueDate?: Date | null;
      assignedToUser?: string | null;
    } = {};

    if (body.status !== undefined) {
      data.status = requireEnum(body.status, TASK_STATUSES, "status");
    }

    if (isAdmin) {
      if (body.title !== undefined) {
        data.title = requireString(body.title, "title");
      }
      if (body.description !== undefined) {
        const description = optionalString(body.description);
        data.description = description ?? null;
      }
      if (body.dueDate !== undefined) {
        data.dueDate = parseOptionalDate(body.dueDate, "dueDate");
      }
      if (body.assignedToUser !== undefined) {
        if (body.assignedToUser === null || body.assignedToUser === "") {
          data.assignedToUser = null;
        } else {
          const assignedToUser = asStringId(body.assignedToUser, "assignedToUser");
          const isMember = await prisma.projectMember.findUnique({
            where: {
              projectId_userId: { projectId: task.projectId, userId: assignedToUser },
            },
          });
          if (!isMember) {
            throw new ApiError("Assignee must be a project member");
          }
          data.assignedToUser = assignedToUser;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      throw new ApiError("No fields to update");
    }

    if (!isAdmin && data.status === undefined) {
      throw new ApiError("Only task status can be updated", 403);
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
