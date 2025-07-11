"use client";

import { ThemeProvider as Nt } from "next-themes";
import { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof Nt>) {
  return <Nt {...props}>{children}</Nt>;
}
