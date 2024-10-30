"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/auth";
import { ActionState } from "@/lib/auth/middleware";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState } from "react";
import useCountdown from "../hooks/use-countdown";
import { login, register } from "./actions";

export function Auth({ mode = "login" }: { mode?: "login" | "register" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "login" ? login : register,
    { error: "" },
  );

  const { user } = useUser();
  const router = useRouter();

  const countdown = useCountdown({
    condition: !!user,
    seconds: 3,
    callback: () => {
      if (redirect !== "/login" && redirect !== "/register") {
        router.push(redirect || "/");
        return;
      }
    },
  });

  if (user) {
    return (
      <div className='grid place-items-center h-dvh text-xs'>
        <pre>
          You are already logged in as {user.name}. Redirecting in {countdown}
          ...
        </pre>
      </div>
    );
  }

  return (
    <div className='min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <form
          className='space-y-6'
          action={formAction}>
          <input
            type='hidden'
            name='redirect'
            value={redirect || ""}
          />
          <div>
            <Label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'>
              Email
            </Label>
            <div className='mt-1'>
              <Input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                maxLength={50}
                placeholder='Enter your email'
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'>
              Password
            </Label>
            <div className='mt-1'>
              <Input
                id='password'
                name='password'
                type='password'
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={8}
                maxLength={100}
                placeholder='Enter your password'
              />
            </div>
          </div>

          {state?.error && (
            <div className='text-red-500 text-sm'>{state.error}</div>
          )}

          <div>
            <Button
              type='submit'
              className='w-full'
              disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className='animate-spin mr-2 h-4 w-4' />
                  Loading...
                </>
              ) : mode === "login" ? (
                "Login"
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-gray-50 text-gray-500'>
                {mode === "login"
                  ? "New to our platform?"
                  : "Already have an account?"}
              </span>
            </div>
          </div>

          <div className='mt-6'>
            <Button
              className='w-full'
              variant='outline'
              asChild>
              <Link
                href={`${mode === "login" ? "/register" : "/login"}${
                  redirect ? `?redirect=${redirect}` : ""
                }`}>
                {mode === "login"
                  ? "Create an account"
                  : "Login to existing account"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
