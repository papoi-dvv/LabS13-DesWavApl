'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { FaGithub, FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
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
      callbackUrl: '/dashboard',
      redirect: false
    });

    if (result?.ok) {
      router.push('/dashboard');
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
      callbackUrl: '/dashboard',
      redirect: false
    });

    if (result?.ok) {
      router.push('/dashboard');
      router.refresh();
      return;
    }

    setMessage('Registro creado. Inicia sesion con tus credenciales.');
    setIsRegistering(false);
    setIsLoading(false);
  };

  const handleProviderSignIn = async (provider: 'google' | 'github') => {
    await signIn(provider, {
      callbackUrl: '/dashboard',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-gray-800 font-bold mb-6 text-center">
          {isRegistering ? 'Crear cuenta' : 'Sign In'}
        </h1>

        <form
          onSubmit={isRegistering ? handleRegister : handleCredentialsSignIn}
          className="space-y-4"
        >
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full border border-gray-300 text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-gray-300 text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-gray-300 text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-800"
              minLength={isRegistering ? 8 : undefined}
              required
            />
          </div>

          {message && (
            <p className="rounded bg-red-50 p-3 text-sm text-red-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition disabled:cursor-not-allowed disabled:bg-gray-400"
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
          className="mt-4 w-full text-sm text-gray-700 hover:text-black"
        >
          {isRegistering
            ? 'Ya tengo cuenta'
            : 'Crear una cuenta nueva'}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase text-gray-500">o continua con</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          onClick={() => handleProviderSignIn('google')}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-black transition flex items-center justify-center gap-2"
        >
          <FaGoogle />
          Continue with Google
        </button>

        <button
          onClick={() => handleProviderSignIn('github')}
          className="mt-3 w-full bg-gray-900 text-white py-2 px-4 rounded hover:bg-black transition flex items-center justify-center gap-2"
        >
          <FaGithub />
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
