# Next Auth App

Aplicacion Full-Stack construida con Next.js 16, TypeScript, Tailwind CSS, NextAuth.js, Prisma 7 y PostgreSQL. Incluye autenticacion OAuth/credenciales, dashboard de usuarios, presencia online/offline, perfil editable, avatar personalizable y datos de prueba con Prisma Seed.

## Requisitos Previos

- Node.js compatible con Next.js 16.
- Docker y Docker Compose, o PostgreSQL instalado localmente.
- Credenciales OAuth de Google y GitHub.

## Variables de Entorno

Copia `.env.example` a `.env.local` y completa tus valores reales:

```bash
cp .env.example .env.local
```

Ejemplo para PostgreSQL local en Docker usando puerto alternativo `5433`:

```env
DATABASE_URL="postgresql://postgres:password123@localhost:5433/nextauth_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-secure-random-secret"

GOOGLE_CLIENT_ID="replace-with-google-client-id"
GOOGLE_CLIENT_SECRET="replace-with-google-client-secret"

GITHUB_ID="replace-with-github-client-id"
GITHUB_SECRET="replace-with-github-client-secret"
```

No subas `.env.local` ni secretos reales al repositorio.

## PostgreSQL con Docker

Si no tienes PostgreSQL local, levanta un contenedor en el puerto `5433`:

```bash
docker run --name nextauth-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=nextauth_db \
  -p 5433:5432 \
  -d postgres:16
```

Para detenerlo:

```bash
docker stop nextauth-postgres
```

Para volver a iniciarlo:

```bash
docker start nextauth-postgres
```

## Instalacion y Desarrollo

Instala dependencias:

```bash
npm install
```

Ejecuta migraciones y genera Prisma Client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Carga datos de prueba:

```bash
npm run prisma:seed
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Scripts Disponibles

- `npm run dev`: inicia Next.js en desarrollo.
- `npm run build`: genera el build de produccion.
- `npm run start`: ejecuta el build de produccion.
- `npm run lint`: ejecuta ESLint.
- `npm run prisma:migrate`: aplica migraciones en desarrollo.
- `npm run prisma:generate`: genera Prisma Client.
- `npm run prisma:studio`: abre Prisma Studio.
- `npm run prisma:seed`: ejecuta `npx prisma db seed`.

## Prisma Seed

El seed se encuentra en `prisma/seed.ts`. Limpia la tabla `User` e inserta 5 usuarios de prueba con:

- `id` unico.
- nombre y alias.
- correo.
- password cifrado con `bcrypt`.
- URL de avatar.
- estado `isOnline`.
- `lastSeen` con tiempos relativos realistas.

Tambien puedes ejecutarlo directamente con:

```bash
npx prisma db seed
```

## OAuth Callbacks

Configura estos callbacks en tus proveedores:

- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

## Avatar de Perfil

La pantalla `/profile` permite actualizar avatar de dos formas:

- Pegando una URL directa a una imagen.
- Subiendo un archivo local, convertido a Base64 para pruebas.

Para produccion, se recomienda almacenar archivos en un servicio dedicado como Supabase Storage, S3 o Cloudinary y guardar solo la URL final en Prisma.
