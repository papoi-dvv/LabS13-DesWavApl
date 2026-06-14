import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : null;

  if (name.length < 2 || name.length > 40) {
    return NextResponse.json(
      { message: "El alias debe tener entre 2 y 40 caracteres." },
      { status: 400 },
    );
  }

  if (image && !isValidImageSource(image)) {
    return NextResponse.json(
      { message: "La imagen debe ser una URL http(s) o un archivo de imagen valido." },
      { status: 400 },
    );
  }

  if (image && image.length > 1_000_000) {
    return NextResponse.json(
      { message: "La imagen es demasiado grande. Usa una URL o un archivo menor a 1 MB." },
      { status: 413 },
    );
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name,
      alias: name,
      image,
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

  return NextResponse.json({
    user: {
      ...user,
      lastSeen: user.lastSeen.toISOString(),
    },
  });
}

function isValidImageSource(image: string) {
  if (image.startsWith("data:image/")) {
    return true;
  }

  try {
    const url = new URL(image);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
