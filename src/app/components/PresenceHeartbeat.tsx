"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const heartbeatInterval = 30_000;

export default function PresenceHeartbeat() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const markOnline = () => {
      fetch("/api/presence", {
        method: "PATCH",
        keepalive: true,
      }).catch(() => undefined);
    };

    const markOffline = () => {
      navigator.sendBeacon(
        "/api/presence",
        new Blob([JSON.stringify({ isOnline: false })], {
          type: "application/json",
        }),
      );
    };

    markOnline();
    const intervalId = window.setInterval(markOnline, heartbeatInterval);
    window.addEventListener("pagehide", markOffline);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pagehide", markOffline);
    };
  }, [status]);

  return null;
}
