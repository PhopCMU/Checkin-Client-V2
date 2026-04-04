import type { Zone, AttendanceLog } from "../types/types";
import axios from "axios";
import { getToken } from "../utils/authService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // withCredentials: false,
});

export const fetchZoneLocations = async (): Promise<Zone[]> => {
  const token = getToken();
  try {
    const response = await api.get("/api/location/point/list", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // console.log("Zone locations fetched successfully:", response.data.results);
    return response.data.results as Zone[];
  } catch (error) {
    console.error("Error fetching zone locations:", error);
    // ในกรณีที่เกิดข้อผิดพลาด ควร return เป็น Array ว่างตามที่ตั้งใจไว้
    return [];
  }
};
// 18.823339064474165, 99.00149812823936 บ้านน้องภพ
// ✨ เริ่มต้นด้วย log ว่างจริงๆ (ใช้ใน App.tsx)
export const initialLogs: AttendanceLog[] = [];
