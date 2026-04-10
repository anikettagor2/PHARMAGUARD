"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);

      if (!authUser && !pathname.includes("/login") && !pathname.includes("/signup")) {
         router.push("/login");
      } else if (authUser && (pathname.includes("/login") || pathname.includes("/signup"))) {
         router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return { user, loading };
}
