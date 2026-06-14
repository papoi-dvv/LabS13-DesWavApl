import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UsersTable from "@/app/components/UsersTable";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
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

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
            Panel de control
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            Bienvenido, {session?.user?.name ?? "usuario"}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Monitorea usuarios registrados, estado de conexion y actividad
            reciente desde una vista estilo bento.
          </p>
        </section>

        <UsersTable
          users={users.map((user) => ({
            ...user,
            lastSeen: user.lastSeen.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
