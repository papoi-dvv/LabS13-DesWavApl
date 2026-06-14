import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileEditor from "@/app/components/ProfileEditor";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/signIn");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      name: true,
      alias: true,
      email: true,
      image: true,
      lastSeen: true,
    },
  });

  if (!user) {
    redirect("/signIn");
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <ProfileEditor
          user={{
            ...user,
            name: user.alias ?? user.name,
            lastSeen: user.lastSeen.toISOString(),
          }}
        />
      </div>
    </div>
  );
}
