"use client";

import { useEffect, useMemo, useState } from "react";
import Avatar from "@/app/components/Avatar";

type UserRow = {
  id: string;
  name: string | null;
  alias: string | null;
  email: string;
  image: string | null;
  isOnline: boolean;
  lastSeen: string;
};

const offlineAfterMs = 75_000;

export default function UsersTable({ users: initialUsers }: { users: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refreshUsers = async () => {
      const response = await fetch("/api/users", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setUsers(data.users);
      setNow(Date.now());
    };

    const refreshIntervalId = window.setInterval(refreshUsers, 10_000);
    const clockIntervalId = window.setInterval(() => setNow(Date.now()), 15_000);

    return () => {
      window.clearInterval(refreshIntervalId);
      window.clearInterval(clockIntervalId);
    };
  }, []);

  const onlineUsers = useMemo(
    () => users.filter((user) => isOnline(user, now)).length,
    [now, users],
  );

  return (
    <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
          Usuarios registrados
        </p>
        <p className="mt-3 text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
          {users.length}
        </p>
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-slate-950 to-slate-700 p-5 text-white shadow-xl">
          <p className="text-sm text-white/70">Estado actual</p>
          <p className="mt-2 text-3xl font-semibold">{onlineUsers} online</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
        <div className="border-b border-slate-200/70 px-6 py-5 dark:border-white/10">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Actividad reciente
          </h2>
        </div>

        <div className="divide-y divide-slate-200/70 dark:divide-white/10">
          {users.map((user) => (
            <article
              key={user.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4 transition duration-300 hover:bg-white/80 dark:hover:bg-white/10"
            >
              <Avatar name={user.alias ?? user.name} image={user.image} />

              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950 dark:text-white">
                  {user.alias ?? user.name ?? "Usuario sin alias"}
                </p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-300">
                  {user.email}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isOnline(user, now)
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-900/10 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                {formatLastSeen(user, now)}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function isOnline(user: UserRow, now: number) {
  return user.isOnline && now - new Date(user.lastSeen).getTime() < offlineAfterMs;
}

function formatLastSeen(user: UserRow, now: number) {
  const lastSeen = new Date(user.lastSeen);
  const diffInSeconds = Math.max(0, Math.floor((now - lastSeen.getTime()) / 1000));

  if (isOnline(user, now)) {
    return "Online";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `Conectado hace ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `Hace ${diffInHours} h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `Hace ${diffInDays} d`;
}
