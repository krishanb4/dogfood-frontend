import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter,
  type AuthenticationStatus,
} from "@rainbow-me/rainbowkit";
import { SiweMessage } from "siwe";
import { useGameStore } from "../store/gameStore";
import type { DogType } from "../types";

// Auth endpoints are proxied by Vite in dev (/auth/* → backend)
// so cookies stay same-origin and work without sameSite=none + secure.
const AUTH = "/auth";

interface SessionData {
  wallet:      string;
  username:    string;
  selectedDog: DogType;
  hasProfile:  boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthenticationStatus>("loading");
  const setUser   = useGameStore((s) => s.setUser);
  const clearUser = useGameStore((s) => s.clearUser);

  const fetchSession = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${AUTH}/session`, { credentials: "include" });
      if (!res.ok) { setStatus("unauthenticated"); return; }
      const data = await res.json() as SessionData;
      setUser({ wallet: data.wallet, name: data.username, breed: data.selectedDog, hasProfile: data.hasProfile });
      setStatus("authenticated");
    } catch {
      setStatus("unauthenticated");
    }
  }, [setUser]);

  // Restore session on mount
  useEffect(() => { void fetchSession(); }, [fetchSession]);

  const adapter = useMemo(() =>
    createAuthenticationAdapter({
      getNonce: async () => {
        const res = await fetch(`${AUTH}/nonce`, { credentials: "include" });
        const { nonce } = await res.json() as { nonce: string };
        return nonce;
      },

      createMessage: ({ nonce, address, chainId }) =>
        new SiweMessage({
          domain:    window.location.host,
          address,
          statement: "Sign in to $OISHII Farm",
          uri:       window.location.origin,
          version:   "1",
          chainId,
          nonce,
        }).prepareMessage(),

      getMessageBody: ({ message }) => message,

      verify: async ({ message, signature }) => {
        try {
          const res = await fetch(`${AUTH}/verify`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ message, signature }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({})) as { error?: string };
            console.error("[auth] verify failed:", res.status, err.error);
            return false;
          }
          await fetchSession();
          return true;
        } catch (err) {
          console.error("[auth] verify error:", err);
          return false;
        }
      },

      signOut: async () => {
        await fetch(`${AUTH}/logout`, { method: "POST", credentials: "include" });
        clearUser();
        setStatus("unauthenticated");
      },
    }),
  [fetchSession, clearUser]);

  return (
    <RainbowKitAuthenticationProvider adapter={adapter} status={status}>
      {children}
    </RainbowKitAuthenticationProvider>
  );
}
