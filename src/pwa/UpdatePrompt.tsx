import React, { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { version } from "../../package.json";

export const UpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err) {
      console.error("SW register error:", err);
    },
  });

  const [versionMismatch, setVersionMismatch] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app_version");
    if (saved !== null && saved !== version) {
      setVersionMismatch(true);
    }
  }, []);

  const showPrompt = needRefresh || versionMismatch;

  const close = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  const onRefresh = async () => {
    setIsUpdating(true);
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
    localStorage.setItem("app_version", version);
    await updateServiceWorker(true);

    setTimeout(() => {
      setIsUpdating(false);
      setVersionMismatch(false);
    }, 3000);
  };

  // Blocking full-screen modal for version mismatch — cannot be dismissed
  if (versionMismatch) {
    return (
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="update-title"
        aria-describedby="update-desc"
      >
        <div className="mx-4 w-full max-w-sm rounded-2xl bg-slate-900 p-6 shadow-2xl ring-1 ring-white/10">
          {/* Icon */}
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v6h6M20 20v-6h-6M20 4l-6 6M4 20l6-6"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h2
            id="update-title"
            className="mb-2 text-center text-lg font-bold text-white"
          >
            เวอร์ชันใหม่พร้อมแล้ว
          </h2>

          {/* Description */}
          <p
            id="update-desc"
            className="mb-1 text-center text-sm leading-relaxed text-slate-400"
          >
            กรุณาอัปเดตก่อนเพื่อใช้งานต่อ
          </p>

          {/* Version badge */}
          <div className="mb-5 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
              <span className="text-slate-500 line-through">
                v{localStorage.getItem("app_version") ?? "เก่า"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              v{version}
            </span>
          </div>

          {/* Update button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isUpdating}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                กำลังอัปเดต…
              </span>
            ) : (
              "อัปเดตทันที"
            )}
          </button>
        </div>
      </div>
    );
  }

  // Non-blocking toast for SW-only updates
  if (!showPrompt && !offlineReady) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-9999 flex justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-md bg-slate-900 h-16 flex justify-between items-center text-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-center gap-3 px-4 w-full">
          <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {showPrompt ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v6h6M20 20v-6h-6M20 4l-6 6M4 20l6-6"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10"
                />
              )}
            </svg>
          </div>
          <div className="flex-1 text-sm font-medium">
            {showPrompt && <span>มีเวอร์ชันใหม่พร้อมใช้งาน</span>}
            {offlineReady && !showPrompt && (
              <span>พร้อมใช้งานแบบออฟไลน์แล้ว</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showPrompt ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isUpdating}
                className="inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-60"
              >
                อัปเดต
              </button>
            ) : (
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                ปิด
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
