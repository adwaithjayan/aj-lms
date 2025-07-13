"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.jpg";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import { UserDropdown } from "./user-dropdown";

const navs = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Courses",
    href: "/courses",
  },
  {
    name: "Dashboard",
    href: "/dash",
  },
];

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-16 items-center mx-auto px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex space-x-2  mr-4 items-center">
          <Image className="size-9" alt="logo" src={Logo} />
          <span className="font-bold">AjLMS.</span>
        </Link>
        <nav className="md:flex hidden md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-2">
            {navs.map((data) => (
              <Link
                key={data.name}
                href={data.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {data.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-4">
            <ThemeToggle />
            {isPending ? null : session ? (
              <UserDropdown
                email={session.user.email}
                name={
                  session?.user.name && session.user.name.length > 0
                    ? session.user.name
                    : session?.user.email.split("@")[0]
                }
                image={
                  session?.user.image ??
                  `https://avatar.vercel.sh/${session?.user.email}`
                }
              />
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Login
                </Link>
                <Link href="/login" className={buttonVariants()}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
