"use client";

import { Icon } from "@/components/Icon";
import { Landing } from "@/components/Landing";
import { PreviewWorldAppBanner } from "@/components/OpenWithWorldApp";
import { useAuth } from "@/lib/auth";

/** Gate the whole app behind World sign-in. Shows a brief splash while the
 *  session resolves, the Landing when signed out, the app when signed in. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready, inWorldApp } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#00b4ff,#0066ff)" }}>
          <Icon name="spark" size={26} className="animate-pulse text-white" />
        </div>
      </div>
    );
  }

  if (!user) return <Landing />;

  return (
    <>
      {user.guest && !inWorldApp ? <PreviewWorldAppBanner /> : null}
      {children}
    </>
  );
}
