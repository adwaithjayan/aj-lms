import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "./env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useConstructUrl(key: string): string {
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME}.fly.storage.tigris.dev/${key}`;
}
