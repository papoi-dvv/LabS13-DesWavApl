import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      isOnline: true,
      lastSeen: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const isOnline = body.isOnline !== false;

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      isOnline,
      lastSeen: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      isOnline: false,
      lastSeen: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
