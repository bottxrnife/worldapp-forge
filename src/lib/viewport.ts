"use client";

import { useEffect, useState } from "react";

/** iOS World App webview shifts the layout viewport — keep fixed chrome aligned. */
export function useVisualViewportTop(): number {
  const [top, setTop] = useState(0);

  useEffect(() => {
    const sync = () => setTop(window.visualViewport?.offsetTop ?? 0);
    sync();
    const vv = window.visualViewport;
    vv?.addEventListener("scroll", sync);
    vv?.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      vv?.removeEventListener("scroll", sync);
      vv?.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  return top;
}
