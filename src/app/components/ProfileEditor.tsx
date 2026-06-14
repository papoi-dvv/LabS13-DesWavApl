"use client";

import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Avatar from "@/app/components/Avatar";
import {
  applyTheme,
  getStoredTheme,
} from "@/app/components/ThemeProvider";
import type { AppTheme } from "@/app/components/ThemeProvider";

type ProfileEditorProps = {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    lastSeen: string;
  };
};

const themes: Array<{ value: AppTheme; label: string; description: string }> = [
  { value: "light", label: "Claro", description: "Limpio y luminoso" },
  { value: "dark", label: "Oscuro", description: "Contraste elegante" },
  { value: "pastel", label: "Pastel", description: "Suave y calido" },
];

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const { update } = useSession();
  const [name, setName] = useState(user.name ?? "");
  const [image, setImage] = useState(user.image ?? "");
  const [theme, setTheme] = useState<AppTheme>("light");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const handleThemeChange = (nextTheme: AppTheme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event("app-theme-change"));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (name.trim().length < 2) {
      setMessage("El alias debe tener al menos 2 caracteres.");
      return;
    }

    setIsSaving(true);

    const response = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, image: image || null }),
    });
    const data = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      setMessage(data.message ?? "No se pudo actualizar el perfil.");
      return;
    }

    setName(data.user.name);
    setImage(data.user.image ?? "");
    await update({
      name: data.user.name,
    });
    setMessage("Perfil actualizado.");
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    await loadImageFile(file);
  };

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await loadImageFile(event.dataTransfer.files[0]);
  };

  const loadImageFile = async (file?: File) => {
    setMessage("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Selecciona un archivo de imagen valido.");
      return;
    }

    if (file.size > 750_000) {
      setMessage("Para Base64, usa una imagen menor a 750 KB o pega una URL.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 text-center shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto w-fit">
          <Avatar name={name} image={image} size="lg" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          {name || "Usuario sin alias"}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          {user.email}
        </p>
        <div className="mt-6 rounded-3xl bg-slate-950 p-4 text-left text-white shadow-xl">
          <p className="text-sm text-white/60">Ultima actividad</p>
          <p className="mt-1 font-semibold">
            {new Intl.DateTimeFormat("es", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(user.lastSeen))}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70"
      >
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
            Perfil
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
            Editar preferencias
          </h2>
        </div>

        <label className="mt-8 block">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Alias / Nombre de usuario
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={40}
            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-950 shadow-inner outline-none transition duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
            placeholder="Tu alias"
            required
          />
        </label>

        <div className="mt-8 rounded-3xl border border-white/70 bg-white/50 p-4 shadow-inner shadow-white/50 dark:border-white/10 dark:bg-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Foto de perfil
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                Recomendado: usar una URL o un servicio de storage. Base64 funciona
                para pruebas, pero aumenta el tamano de la base de datos.
              </p>
            </div>
            <Avatar name={name} image={image} size="md" />
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Imagen por URL
            </span>
            <input
              value={image.startsWith("data:image/") ? "" : image}
              onChange={(event) => setImage(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-950 shadow-inner outline-none transition duration-300 placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
              placeholder="https://example.com/avatar.jpg"
            />
          </label>

          <label
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed px-5 py-7 text-center transition duration-300 ${
              isDragging
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white/50 text-slate-600 hover:-translate-y-0.5 hover:border-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-slate-200"
            }`}
          >
            <span className="font-semibold">Arrastra una imagen aqui</span>
            <span className="mt-1 text-xs opacity-75">
              o haz clic para seleccionar desde tu dispositivo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {image && (
            <button
              type="button"
              onClick={() => setImage("")}
              className="mt-3 text-sm font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              Quitar avatar
            </button>
          )}
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Tema de la pagina
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {themes.map((item) => (
              <label
                key={item.value}
                className={`cursor-pointer rounded-3xl border p-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  theme === item.value
                    ? "border-slate-900 bg-slate-900 text-white shadow-xl dark:border-white"
                    : "border-white/70 bg-white/60 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={item.value}
                  checked={theme === item.value}
                  onChange={() => handleThemeChange(item.value)}
                  className="sr-only"
                />
                <span className="block font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs opacity-75">
                  {item.description}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {message && (
          <p className="mt-6 rounded-2xl bg-slate-900/10 px-4 py-3 text-sm font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-8 rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white shadow-xl shadow-slate-900/20 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
