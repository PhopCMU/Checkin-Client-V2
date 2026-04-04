export interface Zone {
  id: number;
  name: string;
  lat: number;     // พิกัดต้องเป็นตัวเลขเท่านั้น
  lng: number;
  radius: number;  // รัศมีเป็นเมตร
  userEmail?: string; // อีเมลผู้ใช้ที่เกี่ยวข้อง (ถ้ามี)
  color: string;   // สีของวงกลมในแผนที่
}




export interface ProcessedDay {
  day: number;
  month: string;
  year: number;
  morning?: {
    startTime: string;
    endTime: string;
    isLate: boolean;
    workHours: number;
  };
  night?: {
    startTime: string;
    endTime: string;
    isLate: boolean;
    workHours: number;
  };
}

export interface AttendanceLog {
  day: number;
  month: string;
  year: number;
  startTime: string;   
  endTime: string;    
  userEmail?: string;
}

export interface GeoLocation {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error?: string | null;
}

export interface UserInfoToken {
  cmuitaccount: String;
  cmuitaccount_name: String;
  firstname_EN: String;
  firstname_TH: String;
  itaccounttype_EN: String;
  itaccounttype_TH: String;
  itaccounttype_id: String
  lastname_EN: String;
  lastname_TH: String;
  organization_code: String;
  organization_name_EN: String;
  organization_name_TH: String;
  prename_EN: String;
  prename_TH: String;
  prename_id: String;
  student_id: String;
}

export interface DeviceInfo {
  osName: string;          // ชื่อระบบปฏิบัติการ (เช่น 'Windows', 'iOS', 'Android')
  osVersion: string;       // เวอร์ชันของ OS (เช่น '19.2.3', '10.0', '16')
  deviceVendor: string;    // ผู้ผลิตอุปกรณ์ (เช่น 'Apple', 'Samsung', 'PC', 'Unknown')
  deviceType: string;      // ประเภทของอุปกรณ์ (เช่น 'Mobile', 'iPad/Tablet', 'PC/Desktop', 'Macbook/Laptop')
}


export interface CheckInState {
  userEmail: string;
  osNameIn: string | null;
  deviceVendorIn: string | null;
  latitudeStart: number | null;
  longitudeStart: number | null;
  startTime: string | null;
}

export interface CheckOutState {
  userEmail: string;
  osNameIn: string | null;
  deviceVendorIn: string | null;
  latitudeStart: number | null;
  longitudeStart: number | null;
  endTime: string | null;
}

export interface TodayAttendance {
  shiftType: 'morning' | 'night' | 'unknown';
  shiftDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm:ss
  endTime?: string;
  locationNameIn?: string;
  locationNameOut?: string;
}

export interface ShiftStatus {
  morning: { checkedIn: boolean; checkedOut: boolean };
  night: { checkedIn: boolean; checkedOut: boolean };
}

export interface StatusCardProps {
  data: TodayAttendance[]; // หรือ TodayAttendance[] | null ถ้าอาจเป็น null
}