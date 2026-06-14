'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { FaGithub, FaGoogle } from "react-icons/fa";

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetMessage = () => setMessage('');

  const handleCredentialsSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    resetMessage();

    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false
    });

    if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }

    setMessage(
      result?.error === 'CredentialsSignin'
        ? 'Email o password incorrectos. La cuenta se bloquea luego de 5 intentos fallidos.'
        : result?.error ?? 'No se pudo iniciar sesion.'
    );
    setIsLoading(false);
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    resetMessage();

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message ?? 'No se pudo registrar el usuario.');
      setIsLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false
    });

    if (result?.ok) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }

    setMessage('Registro creado. Inicia sesion con tus credenciales.');
    setIsRegistering(false);
    setIsLoading(false);
  };

  const handleProviderSignIn = async (provider: 'google' | 'github') => {
    await signIn(provider, {
      callbackUrl,
    });
  };

  return (
    <div className="min-h-[calc(100vh-96px)] px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
          <div className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-slate-900/20">
            NextAuth + Prisma
          </div>
          <h1 className="mt-6 max-w-2xl text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
            {isRegistering ? 'Crea tu espacio seguro' : 'Bienvenido de vuelta'}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Gestiona tu perfil, presencia y preferencias desde una interfaz
            suave inspirada en widgets, con autenticacion por credenciales,
            Google o GitHub.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {['OAuth', 'Bcrypt', 'Prisma'].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/60 bg-white/60 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-md dark:border-white/10 dark:bg-white/10"
              >
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {item}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  Integrado
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/75 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/75">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                Acceso
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                {isRegistering ? 'Crear cuenta' : 'Sign In'}
              </h2>
            </div>

            <div className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-slate-900/20">
              {isRegistering ? 'Nuevo' : 'Login'}
            </div>
          </div>

          <form
            onSubmit={isRegistering ? handleRegister : handleCredentialsSignIn}
            className="space-y-4"
          >
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-950 shadow-inner outline-none transition duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-950 shadow-inner outline-none transition duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
                placeholder="correo@dominio.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-950 shadow-inner outline-none transition duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
                placeholder={isRegistering ? 'Minimo 8 caracteres' : 'Tu password'}
                minLength={isRegistering ? 8 : undefined}
                required
              />
            </div>

            {message && (
              <p className="rounded-2xl bg-red-500/10 p-3 text-sm font-medium text-red-700 dark:text-red-300">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white shadow-xl shadow-slate-900/20 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? 'Procesando...'
                : isRegistering
                  ? 'Registrarme'
                  : 'Entrar con credenciales'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsRegistering((currentValue) => !currentValue);
              resetMessage();
            }}
            className="mt-4 w-full rounded-2xl bg-white/50 px-4 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-white/80 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
          >
            {isRegistering
              ? 'Ya tengo cuenta'
              : 'Crear una cuenta nueva'}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200/80 dark:bg-white/10" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              o continua con
            </span>
            <div className="h-px flex-1 bg-slate-200/80 dark:bg-white/10" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => handleProviderSignIn('google')}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 font-semibold text-slate-800 shadow-lg shadow-slate-900/5 transition duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              <FaGoogle />
              Google
            </button>

            <button
              onClick={() => handleProviderSignIn('github')}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-black"
            >
              <FaGithub />
              GitHub
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function getSafeCallbackUrl(callbackUrl: string | null) {
  if (!callbackUrl || !callbackUrl.startsWith('/') || callbackUrl.startsWith('//')) {
    return '/dashboard';
  }

  return callbackUrl;
}
