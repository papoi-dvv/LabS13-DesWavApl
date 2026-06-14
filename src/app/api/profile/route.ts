import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "No autorizado." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (name.length < 2 || name.length > 40) {
    return NextResponse.json(
      { message: "El alias debe tener entre 2 y 40 caracteres." },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name,
      alias: name,
      lastSeen: new Date(),
    },
    select: {
      name: true,
      alias: true,
      email: true,
      image: true,
      lastSeen: true,
    },
  });

  return NextResponse.json({ user });
}
