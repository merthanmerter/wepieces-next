"use server";

import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/auth/middleware";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import db from "@/lib/db/drizzle";
import { usersTable, type InsertUser } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const login = validatedAction(loginSchema, async (data, formData) => {
  const { email, password } = data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  const isPasswordValid = await comparePasswords(password, user.passwordHash);

  if (!isPasswordValid) {
    return { error: "Invalid email or password. Please try again." };
  }

  await Promise.all([setSession(user)]);

  redirect("/");
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const register = validatedAction(
  registerSchema,
  async (data, formData) => {
    const { email, password } = data;

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: "Failed to create user. Please try again." };
    }

    const passwordHash = await hashPassword(password);

    const iInsertUser: InsertUser = {
      email,
      passwordHash,
      role: "owner", // Default role, will be overridden if there's an invitation
    };

    const [createdUser] = await db
      .insert(usersTable)
      .values(iInsertUser)
      .returning();

    if (!createdUser) {
      return { error: "Failed to create user. Please try again." };
    }

    redirect("/");
  },
);

export async function logout() {
  (await cookies()).delete("session");
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return { error: "Current password is incorrect." };
    }

    if (currentPassword === newPassword) {
      return {
        error: "New password must be different from the current password.",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await Promise.all([
      db
        .update(usersTable)
        .set({ passwordHash: newPasswordHash })
        .where(eq(usersTable.id, user.id)),
    ]);

    return { success: "Password updated successfully." };
  },
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: "Incorrect password. Account deletion failed." };
    }

    // Soft delete
    await db
      .update(usersTable)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
      })
      .where(eq(usersTable.id, user.id));

    (await cookies()).delete("session");
    redirect("/login");
  },
);

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    await Promise.all([
      db
        .update(usersTable)
        .set({ name, email })
        .where(eq(usersTable.id, user.id)),
    ]);

    return { success: "Account updated successfully." };
  },
);
