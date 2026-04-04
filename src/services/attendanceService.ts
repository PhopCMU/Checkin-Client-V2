import axios from "axios";
import CryptoJs from "crypto-js";
import { getToken } from "../utils/authService";
import type { TodayAttendance } from "../types/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

export type ActiveShift = {
  shiftType: "morning" | "night";
  startTime: string;
} | null;

// export const fetchTodayAttendance = async (
//   email: string,
// ): Promise<TodayAttendance[]> => {
//   if (!email) {
//     console.warn("Email is missing in fetchTodayAttendance");
//     return [];
//   }

//   try {
//     const payload = { email };
//     const encrypted = CryptoJs.AES.encrypt(
//       JSON.stringify(payload),
//       import.meta.env.VITE_CRYPTO_SECRET_KEY,
//     ).toString();

//     const encoded = encodeURIComponent(encrypted);
//     const response = await api.get(`/api/list/datetime/today?data=${encoded}`, {
//       headers: { Authorization: `Bearer ${getToken()}` },
//     });

//     // ✅ จัดการ response ตามรูปแบบที่ backend ส่ง:
//     // { statusCode: 200, success: true, data: [...] }
//     if (Array.isArray(response.data.records)) {
//       //   console.log("Attendance fetched successfully:", response.data.records);
//       return response.data.records;
//     }

//     // console.warn('Unexpected API response format:', response.data);
//     return [];
//   } catch (error) {
//     console.error("Failed to fetch attendance:", error);
//     return [];
//   }
// };

export const fetchTodayAttendance = async (
  email: string,
): Promise<TodayAttendance[]> => {
  if (!email) return [];

  const payload = { email };
  const encrypted = CryptoJs.AES.encrypt(
    JSON.stringify(payload),
    import.meta.env.VITE_CRYPTO_SECRET_KEY,
  ).toString();

  const encoded = encodeURIComponent(encrypted);

  const res = await api.get(`/api/list/datetime/today?data=${encoded}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  return Array.isArray(res.data.records) ? res.data.records : [];
};

export const fetchActiveShift = async (email: string): Promise<ActiveShift> => {
  if (!email) return null;

  const encrypted = CryptoJs.AES.encrypt(
    JSON.stringify(email),
    import.meta.env.VITE_CRYPTO_SECRET_KEY,
  ).toString();

  const encoded = encodeURIComponent(encrypted);

  const res = await api.get(
    `/api/list/attendance/active-shift?data=${encoded}`,
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );

  return res.data?.activeShift ?? null;
};
