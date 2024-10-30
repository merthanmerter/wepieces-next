"use client";

import { User } from "@/lib/db/schema";
import {
  createContext,
  ReactNode,
  use,
  useContext,
  useEffect,
  useState,
} from "react";

export type SafeUser = Omit<
  User,
  "passwordHash" | "createdAt" | "updatedAt" | "deletedAt"
>;

type UserContextType = {
  user: SafeUser | null;
  setUser: (user: SafeUser | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function useUser(): UserContextType {
  let context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function UserProvider({
  children,
  userPromise,
}: {
  children: ReactNode;
  userPromise: Promise<SafeUser | null>;
}) {
  let initialUser = use(userPromise);
  let [user, setUser] = useState<SafeUser | null>(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
