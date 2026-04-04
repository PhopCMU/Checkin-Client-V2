import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import type { Zone, ShiftStatus } from "../types/types";
import TopToast, { type ToastItem } from "./TopToast";

/* --------------------- TYPES --------------------- */
type ShiftType = "morning" | "night";

interface Props {
  nearestZone?: Zone | null;
  inside: boolean;
  shiftStatus: ShiftStatus; // { morning: { checkedIn, checkedOut }, night: {...} }
  onCheckIn: (
    shiftType: ShiftType,
  ) => Promise<boolean | { ok: boolean; message?: string }>;
  onCheckOut: (
    shiftType: ShiftType,
  ) => Promise<boolean | { ok: boolean; message?: string }>;
  loading?: boolean;
  data?: any; // kept for compatibility
}

/** =========================
 * Configs (เวลาตามนโยบาย)
 * ========================= */
const SHIFT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 ชั่วโมง
// - ปกติ: 06:00 – 23:59 (วันเดียวกัน)
// - กะดึก: 17:00 – 08:00 (ข้ามวัน)
const MORNING_AVAILABLE_START_MIN = 6 * 60; // 06:00
const MORNING_AVAILABLE_END_MIN = 23 * 60 + 59; // 23:59
const NIGHT_AVAILABLE_START_MIN = 17 * 60; // 17:00
const NIGHT_AVAILABLE_END_MIN = 8 * 60; // 08:00 (ของวันถัดไป)

// Daily reset times (front-end perspective)
const DAILY_RESET_MORNING = { h: 23, m: 59, s: 59, ms: 900 }; // 23:59:59.900
const DAILY_RESET_NIGHT = { h: 9, m: 0, s: 0, ms: 0 }; // 09:00:00.000

/** LocalStorage key */
const lsKey = (shift: ShiftType) => `attendance:${shift}:checkInAt`;
const readCheckInAt = (shift: ShiftType): Date | undefined => {
  try {
    if (typeof window === "undefined") return undefined;
    const raw = window.localStorage.getItem(lsKey(shift));
    return raw ? new Date(raw) : undefined;
  } catch {
    return undefined;
  }
};
const writeCheckInAt = (shift: ShiftType, date: Date) => {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(lsKey(shift), date.toISOString());
  } catch {}
};
const clearCheckInAt = (shift: ShiftType) => {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(lsKey(shift));
  } catch {}
};

/** shift recommend by current time */
const getRecommendedShiftByTime = (): ShiftType => {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const inMorningWindow =
    totalMinutes >= MORNING_AVAILABLE_START_MIN &&
    totalMinutes <= MORNING_AVAILABLE_END_MIN;
  const inNightWindow =
    totalMinutes >= NIGHT_AVAILABLE_START_MIN ||
    totalMinutes <= NIGHT_AVAILABLE_END_MIN;
  if (inMorningWindow && inNightWindow) return "night"; // 17:00–23:59 -> เน้น night
  if (inMorningWindow) return "morning";
  if (inNightWindow) return "night";
  return "morning";
};

/** helper */
const isExpired24h = (checkInAt?: Date) =>
  !!checkInAt && Date.now() - checkInAt.getTime() >= SHIFT_DURATION_MS;
const isCrossDaySince = (checkInAt?: Date) => {
  if (!checkInAt) return false;
  const now = new Date();
  return (
    now.getFullYear() !== checkInAt.getFullYear() ||
    now.getMonth() !== checkInAt.getMonth() ||
    now.getDate() !== checkInAt.getDate()
  );
};
const next9amAfter = (checkInAt: Date): Date => {
  const nine = new Date(checkInAt);
  nine.setHours(9, 0, 0, 0);
  if (checkInAt.getTime() >= nine.getTime()) {
    nine.setDate(nine.getDate() + 1);
  }
  return nine;
};
const formatRemaining = (ms: number) => {
  if (ms <= 0) return "หมดเวลา";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${h} ชม. ${m} นาที`;
};
const isWithinAllowedWindow = (shift: ShiftType): boolean => {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  if (shift === "morning") {
    return (
      totalMinutes >= MORNING_AVAILABLE_START_MIN &&
      totalMinutes <= MORNING_AVAILABLE_END_MIN
    );
  } else {
    return (
      totalMinutes >= NIGHT_AVAILABLE_START_MIN ||
      totalMinutes <= NIGHT_AVAILABLE_END_MIN
    );
  }
};
const nextAt = (h: number, m: number, s: number, ms: number) => {
  const now = new Date();
  const t = new Date(now);
  t.setHours(h, m, s, ms);
  if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
  return t;
};
const normalizeResult = (res: any): { ok: boolean; message?: string } => {
  if (typeof res === "boolean") return { ok: res };
  if (res && typeof res === "object") {
    return {
      ok: !!res.ok,
      message: typeof res.message === "string" ? res.message : undefined,
    };
  }
  return { ok: false };
};

const ActionPanel: React.FC<Props> = ({
  nearestZone,
  inside,
  shiftStatus,
  onCheckIn,
  onCheckOut,
  loading,
}) => {
  /** ---------- Toast queue (แทน message เดิม) ---------- */
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const pushToast = (
    type: "success" | "error" | "info" | "warning",
    text: string,
    duration = 3000,
  ) => {
    const t: ToastItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      text,
      duration,
    };
    setToasts((prev) => [t, ...prev].slice(0, 3)); // เก็บไม่เกิน 3 รายการล่าสุด
  };
  const closeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  /** ---------- Core states ---------- */
  const [selectedShift, setSelectedShift] = useState<ShiftType>("morning");
  const [tick, setTick] = useState<number>(Date.now()); // สำหรับ countdown/รีเฟรชเงื่อนไขเวลา
  const [pending, setPending] = useState<null | "checkin" | "checkout">(null);

  const dailyTimers = useRef<{ tMorning?: any; tNight?: any }>({});

  const [checkInAt, setCheckInAt] = useState<{ morning?: Date; night?: Date }>(
    () => ({
      morning: readCheckInAt("morning"),
      night: readCheckInAt("night"),
    }),
  );
  const morningCheckInAt = checkInAt.morning;
  const nightCheckInAt = checkInAt.night;

  /**
   * 🔐 Server is the source of truth
   * กรณี localStorage หาย (reload, SW update, docker rebuild)
   * ให้ฟื้นสถานะ check-in จาก server
   */
  useEffect(() => {
    // Morning
    if (
      shiftStatus.morning.checkedIn &&
      !shiftStatus.morning.checkedOut &&
      !checkInAt.morning
    ) {
      const fallbackTime = new Date();
      writeCheckInAt("morning", fallbackTime);
      setCheckInAt((prev) => ({ ...prev, morning: fallbackTime }));
    }

    // Night
    if (
      shiftStatus.night.checkedIn &&
      !shiftStatus.night.checkedOut &&
      !checkInAt.night
    ) {
      const fallbackTime = new Date();
      writeCheckInAt("night", fallbackTime);
      setCheckInAt((prev) => ({ ...prev, night: fallbackTime }));
    }
  }, [shiftStatus]);

  // ตั้งค่ากะเริ่มต้นตามเวลาเมื่อ mount
  useEffect(() => {
    setSelectedShift(getRecommendedShiftByTime());
  }, []);

  // interval สำหรับ countdown/เงื่อนไขเวลา (10 วินาที)
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  // สถานะ active จาก server (ดิบ)
  const morningActiveRaw =
    shiftStatus.morning.checkedIn && !shiftStatus.morning.checkedOut;
  const nightActiveRaw =
    shiftStatus.night.checkedIn && !shiftStatus.night.checkedOut;

  /** หมดอายุ */
  const morningExpired =
    isExpired24h(morningCheckInAt) || isCrossDaySince(morningCheckInAt);
  const nightExpired = (() => {
    if (isExpired24h(nightCheckInAt)) return true;
    if (!nightCheckInAt) return false;
    const threshold = next9amAfter(nightCheckInAt);
    return Date.now() >= threshold.getTime();
  })();

  /** เคลียร์ localStorage ทันทีเมื่อหมดอายุ (กัน state ค้าง) */
  useEffect(() => {
    if (morningExpired && morningCheckInAt) {
      clearCheckInAt("morning");
      setCheckInAt((prev) => ({ ...prev, morning: undefined }));
    }
    if (nightExpired && nightCheckInAt) {
      clearCheckInAt("night");
      setCheckInAt((prev) => ({ ...prev, night: undefined }));
    }
  }, [tick, morningExpired, nightExpired, morningCheckInAt, nightCheckInAt]);

  /** Effective Active (รวม fallback จาก localStorage สำหรับ night) */
  const inferredNightActive =
    (nightCheckInAt || nightActiveRaw) && !nightExpired;
  const morningActiveEff = morningActiveRaw && !morningExpired;
  const nightActiveEff =
    (nightActiveRaw && !nightExpired) || inferredNightActive;

  const activeShift: ShiftType | null = morningActiveEff
    ? "morning"
    : nightActiveEff
      ? "night"
      : null;
  const activeNotExpired = morningActiveEff || nightActiveEff;

  // Auto-focus ไปยังกะที่ active
  useEffect(() => {
    if (activeShift && selectedShift !== activeShift) {
      setSelectedShift(activeShift);
    }
  }, [activeShift]);

  const allowedNow = isWithinAllowedWindow(selectedShift);
  const otherShift: ShiftType =
    selectedShift === "morning" ? "night" : "morning";
  const otherActiveEff =
    otherShift === "morning" ? morningActiveEff : nightActiveEff;
  const selectedActiveEff =
    selectedShift === "morning" ? morningActiveEff : nightActiveEff;

  const alreadyCompleted =
    shiftStatus[selectedShift].checkedIn &&
    shiftStatus[selectedShift].checkedOut;

  const canCheckIn =
    inside &&
    allowedNow &&
    !otherActiveEff &&
    !selectedActiveEff &&
    !pending &&
    !alreadyCompleted;

  const canCheckOut = inside && selectedActiveEff && !pending;

  /** สี UI ของแต่ละกะ */
  const shiftColors = {
    morning: {
      bg: "bg-orange-500",
      hover: "hover:bg-orange-600",
      light: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
    },
    night: {
      bg: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
      light: "bg-indigo-100",
      text: "text-indigo-800",
      border: "border-indigo-200",
    },
  } as const;
  const currentColor = shiftColors[selectedShift];

  /** Active shift helpers for banner */
  const activeColor = activeShift
    ? activeShift === "morning"
      ? shiftColors.morning
      : shiftColors.night
    : shiftColors.morning;

  const activeCheckInAt =
    activeShift === "morning"
      ? morningCheckInAt
      : activeShift === "night"
        ? nightCheckInAt
        : undefined;

  const activeExpired =
    activeShift === "morning"
      ? morningExpired
      : activeShift === "night"
        ? nightExpired
        : false;

  const activeRemainMs = (() => {
    if (!activeShift || !activeCheckInAt) return 0;
    const now = Date.now();
    if (activeShift === "morning") {
      const endOfDay = new Date(activeCheckInAt);
      endOfDay.setHours(23, 59, 59, 999);
      const endOfDayMs = endOfDay.getTime();
      const by24hMs = activeCheckInAt.getTime() + SHIFT_DURATION_MS;
      return Math.max(0, Math.min(endOfDayMs, by24hMs) - now);
    } else {
      const nineMs = next9amAfter(activeCheckInAt).getTime();
      const by24hMs = activeCheckInAt.getTime() + SHIFT_DURATION_MS;
      return Math.max(0, Math.min(nineMs, by24hMs) - now);
    }
  })();

  /** Handlers */
  const handleCheckIn = async () => {
    if (!inside || loading || pending) return;

    // ถ้ากะที่เลือกหมดอายุ → ล้างก่อนแล้วค่อยไปต่อ
    const selectedExpired =
      selectedShift === "morning" ? morningExpired : nightExpired;
    if (selectedExpired) {
      clearCheckInAt(selectedShift);
      setCheckInAt((prev) => ({ ...prev, [selectedShift]: undefined }));
      setTick(Date.now());
    }

    if (!allowedNow) {
      pushToast(
        "error",
        selectedShift === "morning"
          ? "เวลานี้ไม่อนุญาตให้ลงปกติ (อนุญาต 06:00–23:59)"
          : "เวลานี้ไม่อนุญาตให้ลงกะดึก (อนุญาต 17:00–08:00)",
      );
      return;
    }
    if (otherActiveEff && !selectedExpired) {
      pushToast(
        "error",
        otherShift === "morning"
          ? "ต้องเช็คเอาต์ปกติก่อน หรือรอหมดอายุตามกฎ"
          : "ต้องเช็คเอาต์กะดึกก่อน หรือรอหมดอายุตามกฎ",
      );
      return;
    }
    if (selectedActiveEff && !selectedExpired) {
      pushToast("error", "กะนี้กำลังทำงานอยู่แล้ว");
      return;
    }

    setPending("checkin");
    let ok = false;
    let serverMsg: string | undefined;
    try {
      const res = await onCheckIn(selectedShift);
      const n = normalizeResult(res);
      ok = n.ok;
      serverMsg = n.message;
    } catch (e: any) {
      ok = false;
      serverMsg = e?.message || String(e);
    }

    if (ok) {
      const now = new Date();
      writeCheckInAt(selectedShift, now);
      setCheckInAt((prev) => ({ ...prev, [selectedShift]: now }));
      setTick(Date.now());
      pushToast("success", `Checked in (${selectedShift}) successfully!`);
    } else {
      pushToast("error", serverMsg || "Check-in failed. Please try again.");
    }
    setPending(null);
  };

  const handleCheckOut = async () => {
    if (!inside || loading || pending) return;
    if (!selectedActiveEff) return;

    setPending("checkout");
    let ok = false;
    let serverMsg: string | undefined;
    try {
      const res = await onCheckOut(selectedShift);
      const n = normalizeResult(res);
      ok = n.ok;
      serverMsg = n.message;
    } catch (e: any) {
      ok = false;
      serverMsg = e?.message || String(e);
    }

    // เคส server ตอบว่าไม่พบ record -> รีเซ็ตหน้าให้พร้อมเช็คอินใหม่
    if (!ok && serverMsg?.toLowerCase().includes("no active check-in record")) {
      clearCheckInAt(selectedShift);
      setCheckInAt((prev) => ({ ...prev, [selectedShift]: undefined }));
      setTick(Date.now());
      setPending(null);
      pushToast(
        "error",
        "ไม่พบรายการเช็คอินที่เปิดอยู่สำหรับกะนี้ ระบบรีเซ็ตสถานะให้แล้ว กรุณาเช็คอินใหม่",
      );
      return;
    }

    if (ok) {
      clearCheckInAt(selectedShift);
      setCheckInAt((prev) => ({ ...prev, [selectedShift]: undefined }));
      setTick(Date.now());
      pushToast("success", `Checked out (${selectedShift}) successfully!`);
    } else {
      pushToast("error", serverMsg || "Check-out failed. Please try again.");
    }
    setPending(null);
  };

  const handleActiveCheckOut = async () => {
    if (!inside || loading || !activeShift || pending) return;
    setPending("checkout");

    let ok = false;
    let serverMsg: string | undefined;
    try {
      const res = await onCheckOut(activeShift);
      const n = normalizeResult(res);
      ok = n.ok;
      serverMsg = n.message;
    } catch (e: any) {
      ok = false;
      serverMsg = e?.message || String(e);
    }

    if (!ok && serverMsg?.toLowerCase().includes("no active check-in record")) {
      clearCheckInAt(activeShift);
      setCheckInAt((prev) => ({ ...prev, [activeShift]: undefined }));
      setSelectedShift(activeShift);
      setTick(Date.now());
      setPending(null);
      pushToast(
        "error",
        "ไม่พบรายการเช็คอินที่เปิดอยู่สำหรับกะนี้ ระบบรีเซ็ตสถานะให้แล้ว กรุณาเช็คอินใหม่",
      );
      return;
    }

    if (ok) {
      clearCheckInAt(activeShift);
      setCheckInAt((prev) => ({ ...prev, [activeShift]: undefined }));
      setSelectedShift(activeShift);
      setTick(Date.now());
      pushToast("success", `Checked out (${activeShift}) successfully!`);
    } else {
      pushToast("error", serverMsg || "Check-out failed. Please try again.");
    }
    setPending(null);
  };

  /** Countdown info ของกะที่เลือก (effective) */
  const countdownInfo = (() => {
    const now = Date.now();
    if (selectedShift === "morning" && morningActiveEff && morningCheckInAt) {
      const base = morningCheckInAt.getTime();
      const endOfDay = new Date(morningCheckInAt);
      endOfDay.setHours(23, 59, 59, 999);
      const endOfDayMs = endOfDay.getTime();
      const by24hMs = base + SHIFT_DURATION_MS;
      const threshold = Math.min(endOfDayMs, by24hMs);
      const remain = Math.max(0, threshold - now);
      return {
        label: morningExpired
          ? "ปกติหมดอายุแล้ว (ข้ามวันหรือครบ 24 ชม.)"
          : "Morning check-in successful.",
        remainText: morningExpired
          ? "สามารถเริ่มใหม่ได้"
          : `เหลือเวลา ${formatRemaining(remain)} ก่อนหมดอายุ`,
        color: "text-orange-700",
      };
    }

    if (selectedShift === "night" && nightActiveEff && nightCheckInAt) {
      const base = nightCheckInAt.getTime();
      const nineMs = next9amAfter(nightCheckInAt).getTime();
      const by24hMs = base + SHIFT_DURATION_MS;
      const threshold = Math.min(nineMs, by24hMs);
      const remain = Math.max(0, threshold - now);
      return {
        label: nightExpired
          ? "กะดึกหมดอายุแล้ว (ถึง 09:00 หรือครบ 24 ชม.)"
          : "Night check-in successful.",
        remainText: nightExpired
          ? "สามารถเริ่มใหม่ได้"
          : `เหลือเวลา ${formatRemaining(remain)} ก่อนหมดอายุ`,
        color: "text-indigo-700",
      };
    }
    return null;
  })();

  /** ปุ่ม selector: ปิดเฉพาะ “อีกกะ” เมื่อมี active (effective) */
  const disableMorningButton = activeNotExpired && !morningActiveEff;
  const disableNightButton = activeNotExpired && !nightActiveEff;

  /** 🕒 ตั้ง Daily Reset อัตโนมัติ: Morning @ 23:59, Night @ 09:00 (ของทุกวัน) */
  useEffect(() => {
    const schedule = () => {
      if (dailyTimers.current.tMorning)
        clearTimeout(dailyTimers.current.tMorning);
      if (dailyTimers.current.tNight) clearTimeout(dailyTimers.current.tNight);

      const nextMorning = nextAt(
        DAILY_RESET_MORNING.h,
        DAILY_RESET_MORNING.m,
        DAILY_RESET_MORNING.s,
        DAILY_RESET_MORNING.ms,
      );
      const nextNight = nextAt(
        DAILY_RESET_NIGHT.h,
        DAILY_RESET_NIGHT.m,
        DAILY_RESET_NIGHT.s,
        DAILY_RESET_NIGHT.ms,
      );

      dailyTimers.current.tMorning = setTimeout(() => {
        clearCheckInAt("morning");
        setCheckInAt((prev) => ({ ...prev, morning: undefined }));
        setTick(Date.now());
        pushToast("info", "ระบบรีเซ็ตเวรเช้าโดยอัตโนมัติ");
        schedule();
      }, nextMorning.getTime() - Date.now());

      dailyTimers.current.tNight = setTimeout(() => {
        clearCheckInAt("night");
        setCheckInAt((prev) => ({ ...prev, night: undefined }));
        setTick(Date.now());
        pushToast("info", "ระบบรีเซ็ตเวรดึกโดยอัตโนมัติ");
        schedule();
      }, nextNight.getTime() - Date.now());
    };

    schedule();
    return () => {
      if (dailyTimers.current.tMorning)
        clearTimeout(dailyTimers.current.tMorning);
      if (dailyTimers.current.tNight) clearTimeout(dailyTimers.current.tNight);
    };
  }, []);

  return (
    <div className="relative">
      {/* ======= Top Toast (ใหม่) ======= */}
      <TopToast toasts={toasts} onClose={closeToast} />

      <div className="mt-6 px-4 sm:px-6 lg:px-8  lg:pb-20 z-50">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-2 shadow-lg border border-gray-100 relative">
          {/* ✅ Active Shift Banner (effective) */}
          {activeShift && activeNotExpired && (
            <div
              className={`${activeColor.light} border ${activeColor.border} rounded-xl p-4 mb-4`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div
                      className={`text-sm font-semibold ${activeColor.text}`}
                    >
                      Working:{" "}
                      {activeShift === "morning" ? "Morning ☀️" : "Night 🌙"}
                    </div>
                    {/* <div className="text-xs text-gray-600">
                      {activeCheckInAt
                        ? `เช็คอิน: ${activeCheckInAt.toLocaleString()}`
                        : "เช็คอินแล้ว"}
                    </div> */}
                    <div className="text-xs text-gray-700 mt-1">
                      {activeExpired
                        ? "สถานะ: หมดอายุแล้ว – สามารถเริ่มกะใหม่ได้"
                        : `เวลาเหลือก่อนหมดอายุ: ${formatRemaining(activeRemainMs)}`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* <button
                    type="button"
                    onClick={() => setSelectedShift(activeShift!)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border bg-white ${activeColor.text}`}
                  >
                    ไปยังกะนี้
                  </button> */}
                  <button
                    type="button"
                    onClick={handleActiveCheckOut}
                    disabled={!inside || !!loading}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg ${
                      inside && !loading
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    Check out now.
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* โซน / สถานะการเลือกกะ */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-full ${inside ? `${currentColor.light}` : "bg-red-100"}`}
            >
              {inside ? (
                <CheckCircle
                  className={`w-5 h-5 ${selectedShift === "morning" ? "text-orange-600" : "text-indigo-600"}`}
                />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div>
              <div
                className={`text-lg font-bold ${
                  inside
                    ? selectedShift === "morning"
                      ? "text-orange-700"
                      : "text-indigo-700"
                    : "text-red-600"
                }`}
              >
                {inside
                  ? `You're at ${nearestZone?.name ?? "Unknown Zone"}`
                  : "Out of Range"}
              </div>
              <div className="text-sm text-gray-500">
                {inside
                  ? selectedShift === "morning"
                    ? "Selected: Morning"
                    : "Selected: Night"
                  : "Move closer to a zone to enable actions"}
              </div>
            </div>
          </div>

          {/* Shift Selector */}
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  !disableMorningButton && setSelectedShift("morning")
                }
                disabled={disableMorningButton}
                className={`px-4 py-2 rounded-lg border transition ${
                  selectedShift === "morning"
                    ? "bg-orange-500 text-white border-orange-600"
                    : "bg-white text-orange-700 border-orange-300"
                } ${disableMorningButton ? "opacity-60 cursor-not-allowed" : "hover:bg-orange-50"}`}
              >
                ☀️ Morning
              </button>

              <button
                type="button"
                onClick={() => !disableNightButton && setSelectedShift("night")}
                disabled={disableNightButton}
                className={`px-4 py-2 rounded-lg border transition ${
                  selectedShift === "night"
                    ? "bg-indigo-500 text-white border-indigo-600"
                    : "bg-white text-indigo-700 border-indigo-300"
                } ${disableNightButton ? "opacity-60 cursor-not-allowed" : "hover:bg-indigo-50"}`}
              >
                🌙 Night
              </button>
            </div>

            {/* แจ้งเตือนเมื่ออีกกะกำลัง active */}
            {activeNotExpired && activeShift && (
              <div className="mt-2 text-xs text-red-600">
                {activeShift === "morning"
                  ? "Morning – กรุณาเช็คเอาต์ก่อน หรือรอหมดอายุตามกฎ"
                  : "Night – กรุณาเช็คเอาต์ก่อน หรือรอหมดอายุตามกฎ"}
              </div>
            )}

            {/* แจ้งช่วงเวลาอนุญาตของกะที่เลือก */}
            {!isWithinAllowedWindow(selectedShift) && (
              <div className="mt-2 text-xs text-gray-600">
                {selectedShift === "morning"
                  ? "ปกติ: ลงได้ตั้งแต่ 06:00 ถึง 23:59"
                  : "กะดึก: ลงได้ตั้งแต่ 17:00 ถึง 08:00 (ของวันถัดไป)"}
              </div>
            )}
          </div>

          {/* แถบข้อมูลกะที่เลือก */}
          {nearestZone && inside && (
            <div
              className={`${currentColor.light} border ${currentColor.border} rounded-xl p-4 mt-3`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className={`text-sm font-medium ${currentColor.text}`}>
                    {selectedShift === "morning" ? "Morning" : "Night"}
                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-white">
                      {selectedShift === "morning" ? "☀️" : "🌙"}
                    </span>
                  </div>
                  <div
                    className={`text-xs ${selectedShift === "morning" ? "text-orange-600" : "text-indigo-600"}`}
                  >
                    {nearestZone.name} • {nearestZone.radius}m radius
                  </div>
                </div>
                <div
                  className={`px-3 py-1 bg-white rounded-xl border flex justify-center items-center${currentColor.border}`}
                >
                  <span
                    className={`text-[8px] font-semibold ${currentColor.text}`}
                  >
                    {shiftStatus[selectedShift].checkedIn
                      ? shiftStatus[selectedShift].checkedOut
                        ? "COMPLETED"
                        : "CHECKED IN"
                      : "NOT CHECKED IN"}
                  </span>
                </div>
              </div>

              {/* แจ้ง active/หมดเวลา */}
              {countdownInfo && (
                <div className="mt-3 text-xs">
                  <div className={`font-semibold ${countdownInfo.color}`}>
                    {countdownInfo.label}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {countdownInfo.remainText}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ปุ่ม Check In */}
          <div className="mt-6">
            <div className="mb-3">
              <div
                className={`text-sm font-semibold ${selectedShift === "morning" ? "text-orange-700" : "text-indigo-700"}`}
              >
                Check In – {selectedShift === "morning" ? "Morning" : "Night"}
              </div>
              <div className="text-xs text-gray-500">
                {selectedShift === "morning"
                  ? "Available: 06:00 - 23:59"
                  : "Available: 17:00 - 08:00 (next day)"}
              </div>
            </div>

            <button
              onClick={handleCheckIn}
              disabled={!canCheckIn}
              className={`w-full group relative overflow-hidden p-4 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                canCheckIn
                  ? `${currentColor.bg} text-white ${currentColor.hover}`
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {loading || pending === "checkin" ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <div className="text-left">
                      <div className="text-base">Check In Now</div>
                      <div className="text-sm font-normal opacity-90">
                        {selectedShift === "morning"
                          ? "Morning (06:00-23:59)"
                          : "Night (17:00-08:00)"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* ปุ่ม Check Out */}
          {canCheckOut && (
            <div className="mt-4">
              <div className="mb-3">
                <div
                  className={`text-sm font-semibold ${selectedShift === "morning" ? "text-orange-700" : "text-indigo-700"}`}
                >
                  Check Out –{" "}
                  {selectedShift === "morning" ? "Morning" : "Night"}
                </div>
                <div className="text-xs text-gray-500">
                  End your current {selectedShift} shift
                </div>
              </div>

              <button
                onClick={handleCheckOut}
                disabled={!canCheckOut}
                className={`w-full group relative overflow-hidden p-4 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  canCheckOut
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  {loading || pending === "checkout" ? (
                    <Clock className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-6 h-6" />
                      <div className="text-left">
                        <div className="text-base">Check Out Now</div>
                        <div className="text-sm font-normal opacity-90">
                          {selectedShift === "morning"
                            ? "End Morning"
                            : "End Night"}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </button>
            </div>
          )}

          {!inside && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-800">
                    Zone Requirement
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    You need to be within {nearestZone?.radius ?? 50} meters of
                    a zone to check in/out
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ActionPanel;
