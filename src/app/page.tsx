import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { getSafeUser } from "@/lib/auth/middleware";
import db from "@/lib/db/drizzle";
import { notesTable } from "@/lib/db/schema";
import { GithubIcon, GlobeIcon, TriangleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { logout } from "./(login)/actions";

export default async function Home() {
  const data = await db.select().from(notesTable).execute();
  const user = await getSafeUser();

  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
      <main className='flex flex-col gap-6 row-start-2 items-center sm:items-start'>
        <Image
          className='dark:invert w-44 h-9'
          src='/next.svg'
          alt='Next.js logo'
          width={180}
          height={38}
          priority
        />
        <ol className='list-inside list-decimal text-center sm:text-left'>
          {data.map((note) => (
            <li key={note.id}>{note.title}</li>
          ))}
        </ol>

        <div className='flex gap-4 items-center flex-col sm:flex-row w-full justify-between'>
          <Button asChild>
            <a
              target='_blank'
              href='https://vercel.com'>
              <TriangleIcon className='size-5 fill-background stroke-none' />
              Deploy Now
            </a>
          </Button>

          <Button
            variant='outline'
            asChild>
            <a
              target='_blank'
              href='https://nextjs.org/docs/app/'>
              Read our docs
            </a>
          </Button>

          <ModeToggle />
        </div>

        <div className='w-full space-y-2'>
          <pre className='text-xs border rounded-sm p-2'>
            {user ? JSON.stringify(user, null, 2) : "You are not logged in"}
          </pre>
          {user?.id ? (
            <form
              className='w-full'
              action={logout}>
              <Button
                className='w-full'
                size='sm'
                type='submit'>
                Logout
              </Button>
            </form>
          ) : (
            <Button
              className='w-full'
              size='sm'
              asChild>
              <Link href='/login'>Login</Link>
            </Button>
          )}
        </div>
      </main>
      <footer className='row-start-3 flex gap-3 flex-wrap items-center justify-center'>
        <Button
          variant='link'
          asChild>
          <a
            target='_blank'
            href='https://github.com/merthanmerter'>
            <GithubIcon className='size-5' /> Github
          </a>
        </Button>
        <Button
          variant='link'
          asChild>
          <a
            target='_blank'
            href='https://nextjs.org'>
            <GlobeIcon className='size-5' /> Go to nextjs.org →
          </a>
        </Button>
      </footer>
    </div>
  );
}
