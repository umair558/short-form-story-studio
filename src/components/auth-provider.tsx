import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
const AuthContext = createContext<{ user: User | null; ready: boolean; recovery: boolean }>({
  user: null,
  ready: false,
  recovery: false,
});
export const useAccount = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [recovery, setRecovery] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    let alive = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") setRecovery(false);
      setUser(session?.user ?? null);
      setReady(true);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void router.invalidate();
        if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
      }
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (alive) {
        setUser(data.user);
        setReady(true);
      }
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [router, queryClient]);
  return <AuthContext.Provider value={{ user, ready, recovery }}>{children}</AuthContext.Provider>;
}
