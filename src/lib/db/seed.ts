import { v4 } from "uuid";
import { hashPassword } from "../auth/session";
import db from "./drizzle";
import { notesTable, usersTable } from "./schema";

const seed = async () => {
  await db.delete(notesTable).execute();
  await db.insert(notesTable).values([
    { id: v4(), title: "I created a next.js app with wepieces." },
    { id: v4(), title: "Realized ‘console.log’ is my closest friend." },
    { id: v4(), title: "Added a feature no one asked for. You're welcome." },
  ]);

  await db.delete(usersTable).execute();
  await db.insert(usersTable).values([
    {
      id: v4(),
      name: "Admin",
      email: "admin@wepieces.com",
      passwordHash: await hashPassword("wepieces"),
      role: "admin",
    },
  ]);
};

seed();
