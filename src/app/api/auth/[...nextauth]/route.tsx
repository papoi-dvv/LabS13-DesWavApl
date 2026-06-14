import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_IN_MINUTES = 15;

export const runtime = "nodejs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.password) {
          return null;
        }

        const now = new Date();

        if (user.lockedUntil && user.lockedUntil > now) {
          throw new Error("Cuenta bloqueada temporalmente. Intenta nuevamente mas tarde.");
        }

        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
          const failedLoginAttempts =
            user.lockedUntil && user.lockedUntil <= now
              ? 1
              : user.failedLoginAttempts + 1;
          const shouldLock = failedLoginAttempts >= MAX_LOGIN_ATTEMPTS;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts,
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOCK_TIME_IN_MINUTES * 60 * 1000)
                : null,
            },
          });

          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            isOnline: true,
            lastSeen: now,
          },
        });

        return {
          id: user.id,
          name: user.alias ?? user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          image: user.image,
          isOnline: true,
          lastSeen: new Date(),
        },
        create: {
          name: user.name,
          alias: user.name,
          email: user.email,
          image: user.image,
          isOnline: true,
          lastSeen: new Date(),
        },
      });

      return true;
    },
    async jwt({ token, trigger, session }) {
      if (trigger === "update" && session) {
        const updatedSession = session as {
          name?: unknown;
        };

        if (typeof updatedSession.name === "string") {
          token.name = updatedSession.name;
        }
      }

      if (!token.email) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: {
          id: true,
          name: true,
          alias: true,
        },
      });

      if (dbUser) {
        token.sub = dbUser.id;
        token.name = dbUser.alias ?? dbUser.name;
        token.picture = undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;

        if (session.user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
              image: true,
            },
          });

          session.user.image = dbUser?.image ?? null;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/signIn",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
