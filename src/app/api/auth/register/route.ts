import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiError, optionalString, requireString } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = optionalString(body.name);
    const email = requireString(body.email, "Email");
    const password = requireString(body.password, "Password");
    const role = "MEMBER";

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
