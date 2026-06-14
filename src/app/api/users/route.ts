import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: {
      lastSeen: "desc",
    },
    select: {
      id: true,
      name: true,
      alias: true,
      email: true,
      image: true,
      isOnline: true,
      lastSeen: true,
    },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      ...user,
      lastSeen: user.lastSeen.toISOString(),
    })),
  });
}
