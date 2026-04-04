export const calculateWorkHours = (
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): number => {
  if (!startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startDate = new Date(2024, 0, 1, startH, startM);
  let endDate = new Date(2024, 0, 1, endH, endM);

  if (endDate <= startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
};

/**
 * ตรวจว่าเข้างานสายหรือไม่
 * - ปกติ: เริ่ม 08:00 → สายถ้า > 08:30
 * - เวรดึก: เริ่ม 18:00 → สายถ้า > 20:00
 */
export const isLate = (
  time: string | null | undefined,
  shiftType: "morning" | "night",
): boolean => {
  if (!time) return false;

  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m;

  if (shiftType === "morning") {
    // ปกติ: เริ่ม 08:00 → สายถ้าหลัง 08:30
    return totalMinutes > 8 * 60 + 30; // > 08:30
  } else {
    // เวรดึก: เริ่ม 18:00 → สายถ้าหลัง 20:00
    return totalMinutes > 20 * 60; // > 20:00
  }
};

/**
 * วิเคราะห์ประเภทกะจากเวลาลงจริง
 * - ปกติ: 06:00 – 17:59
 * - เวรดึก: 18:00 – 05:59 (ของวันถัดไป)
 */
export const detectShiftType = (startTime: string): "morning" | "night" => {
  if (!startTime) return "morning";

  const [h, m] = startTime.split(":").map(Number);
  const totalMinutes = h * 60 + m;

  // เวรดึก: 17:00 เป็นต้นไป หรือ 00:00–05:59
  if (totalMinutes >= 17 * 60 || totalMinutes < 6 * 60) {
    return "night";
  }

  // ปกติ: 06:00 – 17:59
  return "morning";
};
