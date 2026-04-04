import React, { useEffect, useRef } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  text: string;
  // ความยาวแสดงผล (ms)
  duration?: number; // default 4000
}

interface TopToastProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

/**
 * แถบแจ้งเตือนด้านบนแบบมือถือ:
 * - fixed top-0, full width
 * - ใช้ safe-area-inset-top กันชนรอยบาก/ขอบจอ
 * - แอนิเมชัน slide-down / slide-up
 * - รองรับหลายข้อความ (stack) ด้วยการเลื่อนลงซ้อนกัน
 */
const TopToast: React.FC<TopToastProps> = ({ toasts, onClose }) => {
  const timers = useRef<Record<string, any>>({});

  useEffect(() => {
    // ตั้ง auto-hide สำหรับแต่ละ toast
    toasts.forEach((t) => {
      if (timers.current[t.id]) return;
      const d = t.duration ?? 4000;
      timers.current[t.id] = setTimeout(() => {
        onClose(t.id);
        clearTimeout(timers.current[t.id]);
        delete timers.current[t.id];
      }, d);
    });

    // เคลียร์ timer เมื่อ unmount
    return () => {
      Object.values(timers.current).forEach((tmr) => clearTimeout(tmr));
      timers.current = {};
    };
  }, [toasts, onClose]);

  // โทนสีตามประเภท
  const palette = {
    success: {
      bg: "bg-emerald-600",
      border: "border-emerald-700",
      icon: <CheckCircle className="w-5 h-5 text-white" />,
    },
    error: {
      bg: "bg-rose-600",
      border: "border-rose-700",
      icon: <AlertCircle className="w-5 h-5 text-white" />,
    },
    info: {
      bg: "bg-sky-600",
      border: "border-sky-700",
      icon: <AlertCircle className="w-5 h-5 text-white" />,
    },
    warning: {
      bg: "bg-amber-600",
      border: "border-amber-700",
      icon: <AlertCircle className="w-5 h-5 text-white" />,
    },
  } as const;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-9999 flex flex-col items-center"
      style={{
        // กันชน safe area ของมือถือ
        paddingTop: "max(env(safe-area-inset-top, 0px), 6px)",
      }}
      aria-live="assertive"
      role="status"
    >
      <div className="w-full max-w-xl px-3 sm:px-4">
        {/* สร้าง stack ของ toast โดยแต่ละอันมี slide-in/out */}
        {toasts.map((t) => {
          const tone = palette[t.type] ?? palette.info;
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto
                ${tone.bg} ${tone.border}
                text-white rounded-xl shadow-lg border
                flex items-start gap-3 px-4 py-3
                mb-3
                transform transition-all duration-300 ease-out
                translate-y-0 opacity-100
              `}
              // Animation เริ่มต้น: slide-down
              style={{
                // แอบใส่ keyframe-like ผ่าน inline: ถ้าอยากให้ smooth กว่านี้ ใช้ @keyframes ใน CSS ได้
                animation: "toastSlideIn 220ms ease-out both",
              }}
            >
              <div className="shrink-0 mt-0.5">{tone.icon}</div>

              <div className="flex-1 text-[0.95rem] leading-5">{t.text}</div>

              <button
                onClick={() => onClose(t.id)}
                className="ml-2 p-1 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Close notification"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopToast;
