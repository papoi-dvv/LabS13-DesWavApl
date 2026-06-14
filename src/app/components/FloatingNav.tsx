"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Avatar from "@/app/components/Avatar";
import LogoutButton from "@/app/components/LogoutButton";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
];

export default function FloatingNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-4 z-50 px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-3xl border border-white/50 bg-white/70 px-4 py-3 text-slate-900 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-slate-950/70 dark:text-white">
        <Link
          href="/dashboard"
          className="rounded-2xl px-4 py-2 text-lg font-bold tracking-tight transition duration-300 hover:scale-[1.02] hover:bg-white/70"
        >
          MyAuthApp
        </Link>

        <div className="flex items-center gap-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "text-slate-600 dark:text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {session?.user && (
            <div className="ml-2 flex items-center gap-3 rounded-2xl bg-white/60 px-2 py-1 shadow-inner shadow-white/40 dark:bg-white/10">
              <Avatar
                name={session.user.name}
                image={session.user.image}
                size="sm"
              />
              <LogoutButton />
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
