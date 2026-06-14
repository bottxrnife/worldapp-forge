"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";

type BackHandler = () => boolean;

const Ctx = createContext<{
  push: (handler: BackHandler) => () => void;
} | null>(null);

/**
 * Intercepts the OS / browser back gesture inside the World mini-app WebView.
 * Overlay handlers run first; at Home we re-guard history so back doesn't exit.
 */
export function BackStackProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const handlers = useRef<BackHandler[]>([]);

  const push = useCallback((handler: BackHandler) => {
    handlers.current.push(handler);
    return () => {
      handlers.current = handlers.current.filter((h) => h !== handler);
    };
  }, []);

  useEffect(() => {
    window.history.pushState({ forge: "guard" }, "", window.location.href);

    const onPop = () => {
      for (let i = handlers.current.length - 1; i >= 0; i--) {
        if (handlers.current[i]()) {
          window.history.pushState({ forge: "guard" }, "", window.location.href);
          return;
        }
      }
      if (pathRef.current === "/") {
        window.history.pushState({ forge: "guard" }, "", window.location.href);
        return;
      }
      router.back();
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [router]);

  return <Ctx.Provider value={{ push }}>{children}</Ctx.Provider>;
}

/** Register a handler that runs before route back (return true when handled). */
export function useBackHandler(handler: BackHandler, active: boolean) {
  const ctx = useContext(Ctx);
  useEffect(() => {
    if (!ctx || !active) return;
    return ctx.push(handler);
  }, [ctx, handler, active]);
}
