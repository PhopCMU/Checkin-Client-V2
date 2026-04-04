import { useEffect, useState } from "react";
import { clearPWACache } from "./clearPWACache";

export const usePWASSLRecovery = () => {
  const [sslBroken, setSSLBroken] = useState(false);

  useEffect(() => {
    const handler = async (e: ErrorEvent) => {
      const msg = e.message || "";

      const isSSL =
        msg.includes("SSL") ||
        msg.includes("certificate") ||
        msg.includes("ERR_CERT") ||
        msg.includes("NetworkError");

      if (isSSL) {
        setSSLBroken(true);
        await clearPWACache();

        // Hard reload หลังล้าง cache
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };

    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  return sslBroken;
};
