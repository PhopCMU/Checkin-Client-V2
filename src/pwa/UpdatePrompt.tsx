import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

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

  const close = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  const onRefresh = async () => {
    await updateServiceWorker(true); // บังคับให้ SW ใหม่ activate แล้วรีโหลด
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[env(safe-area-inset-bottom,16px)] z-9999 flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-md rounded-xl bg-slate-900 text-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-start gap-3 px-4 py-3">
          {/* Icon */}
          <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {needRefresh ? (
                <path d="M4 4v6h6M20 20v-6h-6M20 4l-6 6M4 20l6-6" />
              ) : (
                <path d="M12 8v4l3 3M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10" />
              )}
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 text-sm font-medium">
            {needRefresh && <div>มีเวอร์ชันใหม่พร้อมใช้งาน 🎉</div>}
            {offlineReady && !needRefresh && <div>พร้อมใช้งานแบบแล้ว 🎉</div>}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {needRefresh ? (
              <>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex items-center rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  ภายหลัง
                </button>
                <button
                  type="button"
                  onClick={onRefresh}
                  className="inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  อัปเดตทันที
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
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
