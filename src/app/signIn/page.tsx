import { Suspense } from "react";
import SignInClient from "@/app/signIn/SignInClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInClient />
    </Suspense>
  );
}

function SignInFallback() {
  return (
    <div className="min-h-[calc(100vh-96px)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
          <div className="h-10 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="mt-6 h-24 max-w-xl animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
          <div className="mt-4 h-20 max-w-lg animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/75">
          <div className="h-10 w-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
          <div className="mt-8 space-y-4">
            <div className="h-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
          </div>
        </section>
      </div>
    </div>
  );
}
