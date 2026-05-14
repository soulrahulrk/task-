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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId") || undefined;
    const statusParam = url.searchParams.get("status") || undefined;
    const status = statusParam
      ? requireEnum(statusParam, TASK_STATUSES, "status")
      : undefined;

    const isAdmin = session.user.role === "ADMIN";
    const where = {
      ...(projectId ? { projectId } : {}),
      ...(status ? { status } : {}),
      ...(isAdmin
        ? {}
        : {
            assignedToUser: session.user.id,
            project: { members: { some: { userId: session.user.id } } },
          }),
    };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const title = requireString(body.title, "title");
    const description = optionalString(body.description);
    const projectId = asStringId(body.projectId, "projectId");
    const assignedToUser = optionalString(body.assignedToUser);
    const dueDate = parseOptionalDate(body.dueDate, "dueDate");
    const status = body.status
      ? requireEnum(body.status, TASK_STATUSES, "status")
      : undefined;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (assignedToUser) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: assignedToUser } },
      });
      if (!isMember) {
        throw new ApiError("Assignee must be a project member");
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedToUser: assignedToUser || null,
        dueDate,
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
