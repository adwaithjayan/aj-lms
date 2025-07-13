"use client";

import { useRouter } from "next/navigation";
import { authClient } from "./auth-client";
import { toast } from "sonner";

export function useSignout() {
  const router = useRouter();
  const handleSignout = async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          toast.success("Singed out Successfully");
        },
        onError: () => {
          toast.error("Failed to signed Out");
        },
      },
    });
  };

  return handleSignout;
}
