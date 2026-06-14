import { config } from "dotenv";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const now = new Date();

const users = [
  {
    id: "seed-user-ava-morales",
    name: "Ava Morales",
    alias: "ava.design",
    email: "ava.morales@example.com",
    password: "Password123!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=faces",
    isOnline: true,
    lastSeen: minutesAgo(2),
  },
  {
    id: "seed-user-mateo-rivera",
    name: "Mateo Rivera",
    alias: "mateo.dev",
    email: "mateo.rivera@example.com",
    password: "Password123!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces",
    isOnline: false,
    lastSeen: hoursAgo(3),
  },
  {
    id: "seed-user-lucia-torres",
    name: "Lucia Torres",
    alias: "lucia.ops",
    email: "lucia.torres@example.com",
    password: "Password123!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=faces",
    isOnline: false,
    lastSeen: daysAgo(1),
  },
  {
    id: "seed-user-noah-kim",
    name: "Noah Kim",
    alias: "noah.product",
    email: "noah.kim@example.com",
    password: "Password123!",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=faces",
    isOnline: false,
    lastSeen: daysAgo(5),
  },
  {
    id: "seed-user-sofia-chen",
    name: "Sofia Chen",
    alias: "sofia.qa",
    email: "sofia.chen@example.com",
    password: "Password123!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
    isOnline: true,
    lastSeen: secondsAgo(25),
  },
];

async function main() {
  await prisma.user.deleteMany();

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 12);

    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        alias: user.alias,
        email: user.email,
        password: hashedPassword,
        image: user.image,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  }

  console.log(`Seed completed: ${users.length} users created.`);
}

function secondsAgo(seconds: number) {
  return new Date(now.getTime() - seconds * 1000);
}

function minutesAgo(minutes: number) {
  return new Date(now.getTime() - minutes * 60 * 1000);
}

function hoursAgo(hours: number) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

function daysAgo(days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
