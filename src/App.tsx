import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import StatusCard from "./components/StatusCard";
import MapView from "./components/MapView";
import ZoneDistances from "./components/ZoneDistances";
import ActionPanel from "./components/ActionPanel";
import HistoryList from "./components/HistoryList";
import BottomNav from "./components/BottomNav";
import useGeoLocation from "./hooks/useGeoLocation";
import CryptoJs from "crypto-js";
import axios from "axios";
import { fetchZoneLocations } from "./data/mockData";
import { calculateDistance } from "./utils/distance";
import type {
  Zone,
  DeviceInfo,
  TodayAttendance,
  ShiftStatus,
} from "./types/types";
import { getToken, getUserFromToken, removeToken } from "./utils/authService";
import LoadingSpinner from "./components/LoadingSpinner";
import { getOSAndVendor } from "./utils/device-helper";

import { usePWASSLRecovery } from "./pwa/usePWASSLRecovery";
import PWASSLRecoveryScreen from "./components/PWASSLRecoveryScreen";

import { useNavigate } from "react-router-dom";

type View = "home" | "history";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

const App: React.FC = () => {
  const [view, setView] = useState<View>("home");
  const user = getUserFromToken();
  const [driver, setDriver] = useState<DeviceInfo | null>(null);
  const [zones, setZone] = useState<Zone[]>([]);
  const location = useGeoLocation(4000);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasLocations = useRef<boolean>(false);
  const hasTodayAttendance = useRef<boolean>(false);
  const [attendanceData, setAttendanceData] = useState<TodayAttendance[]>([]);

  const navigate = useNavigate();

  const sslBroken = usePWASSLRecovery();

  // === 1. โหลด device info ===
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      const info = await getOSAndVendor();
      setDriver(info);
    };
    fetchDeviceInfo();
  }, []);

  // === 2. โหลด zones ===
  useEffect(() => {
    if (hasLocations.current) return;
    hasLocations.current = true;
    const loadZones = async () => {
      try {
        setLoading(true);
        const fetchedZones = await fetchZoneLocations();
        setZone(Array.isArray(fetchedZones) ? fetchedZones : []);
      } catch (err) {
        setZone([]);
      } finally {
        setLoading(false);
      }
    };
    loadZones();
  }, []);

  const loadAttendance = async () => {
    try {
      const payload = { email: user?.email };
      const encrypted = CryptoJs.AES.encrypt(
        JSON.stringify(payload),
        import.meta.env.VITE_CRYPTO_SECRET_KEY,
      ).toString();
      const encoded = encodeURIComponent(encrypted);

      const response = await api.get(
        `/api/list/datetime/today?data=${encoded}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (Array.isArray(response.data.records)) {
        setAttendanceData(response.data.records);
      } else {
        setAttendanceData([]);
      }
    } catch (err) {
      console.error("Failed to load attendance:", err);
      setAttendanceData([]);
    }
  };

  // === 3. ดึง attendance จริงจาก API ===
  useEffect(() => {
    // โหลด attendance ก็ต่อเมื่อ user.email มีค่า และยังไม่เคยโหลดวันนี้
    if (user?.email && !hasTodayAttendance.current) {
      hasTodayAttendance.current = true;
      loadAttendance();
    }
  }, [user?.email]);

  // === 4. คำนวณระยะทาง ===
  const distances = useMemo(() => {
    const map: Record<number, number | null> = {};

    // ดักไว้ก่อนเลยว่าถ้า zones ไม่มีค่า ให้คืนค่า map ว่างๆ ไป
    if (!zones || !Array.isArray(zones)) return map;

    if (location.lat == null || location.lng == null) {
      zones.forEach((z) => (map[z.id] = null));
      return map;
    }

    zones.forEach((z) => {
      map[z.id] = calculateDistance(location.lat!, location.lng!, z.lat, z.lng);
    });
    return map;
  }, [location.lat, location.lng, zones]);

  // === 5. ตรวจสอบว่าอยู่ในโซนหรือไม่ ===
  const { inside, nearestZone } = useMemo(() => {
    let nearest: Zone | undefined;
    let nearestDist = Infinity;

    // ดักถ้า zones ไม่มีค่า
    if (!zones || !Array.isArray(zones))
      return { inside: false, nearestZone: undefined };

    zones.forEach((z) => {
      const d = distances[z.id];
      if (d == null) return;
      if (d < nearestDist) {
        nearestDist = d;
        nearest = z;
      }
    });

    const insideFlag = nearest != null && nearestDist <= (nearest.radius ?? 0);
    return { inside: insideFlag, nearestZone: nearest };
  }, [distances, zones]);

  // === 6. สร้าง shiftStatus จาก attendanceData ===
  const shiftStatus = useMemo<ShiftStatus>(() => {
    // ดักถ้า attendanceData ไม่ใช่ Array
    const safeData = Array.isArray(attendanceData) ? attendanceData : [];

    const morning = safeData.find((r) => r.shiftType === "morning");
    const night = safeData.find((r) => r.shiftType === "night");

    return {
      morning: {
        checkedIn: !!morning?.startTime,
        checkedOut: !!morning?.endTime,
      },
      night: {
        checkedIn: !!night?.startTime,
        checkedOut: !!night?.endTime,
      },
    };
  }, [attendanceData]);

  // === 7. ฟังก์ชันส่งข้อมูลไป backend ===
  const sendAttendance = async (
    endpoint: string,
    method: "post" | "put",
    payload: any,
  ): Promise<boolean> => {
    if (!user?.email) return false;
    setLoadingAction(true);
    try {
      const encrypted = CryptoJs.AES.encrypt(
        JSON.stringify(payload),
        import.meta.env.VITE_CRYPTO_SECRET_KEY,
      ).toString();

      let response;
      if (method === "post") {
        response = await api.post(
          endpoint,
          { encryptedData: encrypted },
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
      } else {
        response = await api.put(
          `${endpoint}?data=${encodeURIComponent(encrypted)}`,
          {},
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
      }

      return response.data?.success === true;
    } catch (error) {
      console.error("API error:", error);
      return false;
    } finally {
      setLoadingAction(false);
    }
  };

  const onCheckIn = async (
    shiftType: "morning" | "night",
  ): Promise<boolean> => {
    if (
      !inside ||
      !nearestZone ||
      location.lat == null ||
      location.lng == null ||
      !user?.email
    ) {
      return false;
    }
    const payload = {
      email: user.email,
      firstname: user.fname || "",
      lastname: user.lname || "",
      latitude: location.lat,
      longitude: location.lng,
      locationName: nearestZone.name,
      osName: `${driver?.osName || "Unknown"}/${driver?.osVersion || ""}`,
      deviceVendor: `${driver?.deviceVendor || "Unknown"}/${
        driver?.deviceType || ""
      }`,
      shiftType,
    };
    const success = await sendAttendance(
      "/api/datetime/start/date",
      "post",
      payload,
    );

    if (success) {
      await loadAttendance();
    }
    return success;
  };

  const onCheckOut = async (
    shiftType: "morning" | "night",
  ): Promise<boolean> => {
    if (
      !inside ||
      !nearestZone ||
      location.lat == null ||
      location.lng == null ||
      !user?.email
    ) {
      return false;
    }
    const payload = {
      email: user.email,
      firstname: user.fname || "",
      lastname: user.lname || "",
      latitude: location.lat,
      longitude: location.lng,
      locationName: nearestZone.name,
      osName: `${driver?.osName || "Unknown"}/${driver?.osVersion || ""}`,
      deviceVendor: `${driver?.deviceVendor || "Unknown"}/${
        driver?.deviceType || ""
      }`,
      shiftType,
    };
    const success = await sendAttendance(
      "/api/datetime/end/date",
      "put",
      payload,
    );

    if (success) {
      await loadAttendance();
    }
    return success;
  };

  // === 8. Logout ===
  const onLogout = () => {
    removeToken();
    navigate("/sign-in");
  };

  const onInstall = () => {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let instructions = "";

    if (isIOS) {
      instructions = `
วิธีติดตั้งแอปพลิเคชันบน iOS (iPhone/iPad):

1. เปิดแอปในเบราว์เซอร์ Safari
2. แตะที่ปุ่ม "แชร์" (ไอคอนสี่เหลี่ยมกับลูกศรชี้ขึ้น) ที่ด้านล่างของหน้าจอ
3. เลื่อนลงและแตะที่ "เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)
4. แก้ไขชื่อแอปตามต้องการ (ถ้าต้องการ)
5. แตะ "เพิ่ม" (Add)
6. แอปจะปรากฏบนหน้าจอโฮมของคุณ

`;
    } else if (isAndroid) {
      instructions = `
วิธีติดตั้งแอปพลิเคชันบน Android:

1. เปิดแอปในเบราว์เซอร์ Chrome
2. แตะที่ปุ่มเมนู (จุด 3 จุด) ที่มุมขวาบน
3. เลือก "ติดตั้งแอป" (Install app) หรือ "เพิ่มไปยังหน้าจอโฮม" (Add to Home screen)
4. แตะ "ติดตั้ง" (Install) เพื่อยืนยัน
5. แอปจะปรากฏบนหน้าจอโฮมของคุณ

`;
    } else {
      instructions = `
วิธีติดตั้งแอปพลิเคชัน:

สำหรับ iOS (iPhone/iPad):
1. ใช้ Safari เปิดเว็บแอป
2. แตะปุ่มแชร์ → เพิ่มไปยังหน้าจอโฮม
3. แตะเพิ่ม และตั้งชื่อแอป

สำหรับ Android:
1. ใช้ Chrome เปิดเว็บแอป  
2. แตะเมนู (⋮) → ติดตั้งแอป
3. ยืนยันการติดตั้ง

ประโยชน์ของการติดตั้ง:
✓ ใช้งานแบบเต็มหน้าจอ
✓ เข้าถึงได้เร็วขึ้น
✓ ใช้งานแบบออฟไลน์ได้
✓ รับการแจ้งเตือน
`;
    }
    alert(instructions);
  };

  // === Noti Error SSL ===

  if (sslBroken) {
    return <PWASSLRecoveryScreen />;
  }
  if (loading) {
    // === Loading state ===
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto pb-32">
        {view === "home" ? (
          <div className="space-y-6">
            <StatusCard data={attendanceData} />
            <MapView zones={zones} location={location} height="300px" />
            <ActionPanel
              nearestZone={nearestZone ?? null}
              inside={inside}
              shiftStatus={shiftStatus}
              data={attendanceData}
              onCheckIn={onCheckIn}
              onCheckOut={onCheckOut}
              loading={loadingAction}
            />
            <ZoneDistances
              zones={zones}
              distances={distances}
              inside={inside}
            />
          </div>
        ) : (
          <HistoryList />
        )}
      </main>
      <BottomNav
        active={view === "home" ? "home" : "history"}
        onNavigate={setView}
        onLogout={onLogout}
        onInstall={onInstall}
      />
    </div>
  );
};

export default App;
