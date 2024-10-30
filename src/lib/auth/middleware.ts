import { User, usersTable } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { SafeUser } from ".";
import db from "../db/drizzle";
import { verifyToken } from "./session";

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User,
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData, user);
  };
}

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "string"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where((r) => and(eq(r.id, sessionData.user.id), isNull(r.deletedAt)))
    .limit(1);

  if (!user) {
    return null;
  }

  return user;
}

export async function getSafeUser() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return {
    ...user,
    createdAt: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    passwordHash: undefined,
  } as SafeUser;
}
