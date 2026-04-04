// components/AttendanceCalendar.tsx
import React, { useState } from "react";
import { Download, Calendar, X, Sun, Moon, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AttendanceLog, ProcessedDay } from "../types/types";
import {
  calculateWorkHours,
  detectShiftType,
  isLate,
} from "../utils/attendanceUtils";
import { loadThaiFont, useThaiFont } from "../utils/thaiFontLoader";

/* ------------------ Utils ------------------ */

const thaiMonthToNumber: Record<string, number> = {
  มกราคม: 0,
  กุมภาพันธ์: 1,
  มีนาคม: 2,
  เมษายน: 3,
  พฤษภาคม: 4,
  มิถุนายน: 5,
  กรกฎาคม: 6,
  สิงหาคม: 7,
  กันยายน: 8,
  ตุลาคม: 9,
  พฤศจิกายน: 10,
  ธันวาคม: 11,
};

/* ------------------ Types ------------------ */

interface SelectedShiftData {
  shiftType: "morning" | "night";
  startTime: string;
  endTime: string;
  isLate: boolean;
  workHours: number;
}

interface SelectedDayData {
  day: number;
  shifts: SelectedShiftData[];
}

interface Props {
  dailyData: AttendanceLog[];
  currentMonthThai: string;
  currentYearBuddhist: number;
}

/* ------------------ Component ------------------ */

const AttendanceCalendar: React.FC<Props> = ({
  dailyData,
  currentMonthThai,
  currentYearBuddhist,
}) => {
  const yearAD = currentYearBuddhist - 543;
  const monthIndex = thaiMonthToNumber[currentMonthThai];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] =
    useState<SelectedDayData | null>(null);

  /* ------------------ Process Logs into Days ------------------ */

  const attendanceByDay: Record<number, ProcessedDay> = {};

  dailyData.forEach((item) => {
    if (!item.startTime) return;

    const { day, month, year, startTime, endTime } = item;
    const shiftType = detectShiftType(startTime);

    if (!attendanceByDay[day]) {
      attendanceByDay[day] = {
        day,
        month,
        year,
        morning: undefined,
        night: undefined,
      };
    }

    const workHours = calculateWorkHours(startTime, endTime);
    const isLateFlag = isLate(startTime, shiftType);

    if (shiftType === "morning") {
      attendanceByDay[day].morning = {
        startTime,
        endTime,
        isLate: isLateFlag,
        workHours,
      };
    } else if (shiftType === "night") {
      attendanceByDay[day].night = {
        startTime,
        endTime,
        isLate: isLateFlag,
        workHours,
      };
    }
  });

  /* ------------------ Filter by Month ------------------ */
  const filteredData: ProcessedDay[] = Object.values(attendanceByDay).filter(
    (dayData) =>
      dayData.month === currentMonthThai &&
      dayData.year === currentYearBuddhist,
  );

  /* ------------------ Build Shift Records ------------------ */
  const shiftRecords = filteredData.flatMap((dayData) => {
    const shifts: SelectedShiftData[] = [];
    if (dayData.morning) {
      shifts.push({
        shiftType: "morning",
        startTime: dayData.morning.startTime,
        endTime: dayData.morning.endTime,
        isLate: dayData.morning.isLate,
        workHours: dayData.morning.workHours,
      });
    }
    if (dayData.night) {
      shifts.push({
        shiftType: "night",
        startTime: dayData.night.startTime,
        endTime: dayData.night.endTime,
        isLate: dayData.night.isLate,
        workHours: dayData.night.workHours,
      });
    }
    return shifts;
  });

  /* ------------------ Summary Stats ------------------ */
  const totalWorkHours = shiftRecords.reduce((sum, s) => sum + s.workHours, 0);
  // const overtimeHours = totalWorkHours > 160 ? totalWorkHours - 160 : 0;
  // const completedShifts = shiftRecords.length;
  // const lateShifts = shiftRecords.filter((s) => s.isLate).length;
  const totalShifts = shiftRecords.length;
  // const daysInMonth = new Date(yearAD, monthIndex + 1, 0).getDate();
  // const absentDays = daysInMonth - filteredData.length;
  const morningShifts = shiftRecords.filter(
    (s) => s.shiftType === "morning",
  ).length;
  const nightShifts = shiftRecords.filter(
    (s) => s.shiftType === "night",
  ).length;

  /* ------------------ Calendar Map ------------------ */
  const attendanceMap: Record<number, ProcessedDay> = {};
  filteredData.forEach((item) => {
    attendanceMap[item.day] = item;
  });

  /* ------------------ Modal Handlers ------------------ */
  const openModal = (day: number, data?: ProcessedDay) => {
    const shifts: SelectedShiftData[] = [];
    if (data?.morning) {
      shifts.push({
        shiftType: "morning",
        startTime: data.morning.startTime,
        endTime: data.morning.endTime,
        isLate: data.morning.isLate,
        workHours: data.morning.workHours,
      });
    }
    if (data?.night) {
      shifts.push({
        shiftType: "night",
        startTime: data.night.startTime,
        endTime: data.night.endTime,
        isLate: data.night.isLate,
        workHours: data.night.workHours,
      });
    }

    setSelectedDayData({ day, shifts });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDayData(null);
  };

  /* ------------------ Calendar Rendering ------------------ */
  const totalDaysInMonth = new Date(yearAD, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(yearAD, monthIndex, 1).getDay();
  const leadingDays = Array(firstDayOfWeek).fill(null);
  const days = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const weekdays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const getDayStatus = (data?: ProcessedDay) => {
    if (!data) {
      return {
        bg: "bg-white",
        border: "border-gray-200",
        text: "text-gray-700",
        label: null,
      };
    }

    const morningLate = data.morning?.isLate;
    const nightLate = data.night?.isLate;
    const hasMorning = !!data.morning;
    const hasNight = !!data.night;

    if (morningLate || nightLate) {
      return {
        bg: "bg-linear-to-br from-amber-50 to-orange-50",
        border: "border-amber-200",
        text: "text-amber-700",
        label: "สาย",
      };
    }

    if (hasMorning || hasNight) {
      return {
        bg: "bg-linear-to-br from-emerald-50 to-green-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        label: "ลงเวลา",
      };
    }

    return {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-500",
      label: "ขาด",
    };
  };

  /* ------------------ PDF Export ------------------ */

  const handleExportPDF = async () => {
    const doc = new jsPDF();

    try {
      await loadThaiFont(doc);
      useThaiFont(doc);
      doc.setFont("THSarabunNew", "normal");
    } catch (error) {
      console.error("Failed to load Thai font for PDF", error);
      return;
    }

    // ฟังก์ชันช่วย: ตัดเศษทศนิยมและแสดงเป็นจำนวนเต็ม + "ชม."
    const formatHoursInt = (hours: number) => `${Math.trunc(hours)} ชม.`;

    doc.setFontSize(16);
    doc.text(
      `รายงานการลงเวลา — ${currentMonthThai} ${currentYearBuddhist}`,
      14,
      10,
    );

    doc.setFontSize(12);

    // (A) ถ้าต้องการ "รวมชั่วโมงทั้งหมด" จากค่า totalWorkHours เดิม แต่ตัดเศษทศนิยม
    doc.text(`ชั่วโมงทำงานทั้งหมด: ${formatHoursInt(totalWorkHours)}`, 14, 20);

    // (B) ทางเลือกเพิ่มเติม:
    // ถ้าต้องการรวมใหม่จากแต่ละวัน โดย "ตัดเศษของแต่ละช่วง" ก่อน แล้วค่อยรวม:
    // ให้ย้ายไปคำนวณก่อนสร้างตาราง เช่น:
    //
    // const totalWorkHoursIntSum = filteredData.reduce((sum, item) => {
    //   const morning = Math.trunc(item.morning?.workHours || 0);
    //   const night   = Math.trunc(item.night?.workHours || 0);
    //   return sum + morning + night;
    // }, 0);
    // doc.text(`ชั่วโมงทำงานทั้งหมด: ${totalWorkHoursIntSum} ชม.`, 14, 20);

    const dataMap = new Map(filteredData.map((item) => [item.day, item]));
    const tableData: string[][] = [];

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const item = dataMap.get(day);

      if (item?.morning || item?.night) {
        const morningEntry = item.morning
          ? `${item.morning.startTime}–${item.morning.endTime || "ยังไม่ออก"}`
          : "-";

        const nightEntry = item.night
          ? `${item.night.startTime}–${item.night.endTime || "ยังไม่ออก"}`
          : "-";

        // ตัดเศษรวมทั้งวัน (รวมชั่วโมงเช้า + ดึก แล้วตัดเศษ)
        const totalDayHours =
          (item.morning?.workHours || 0) + (item.night?.workHours || 0);
        const totalDayHoursInt = formatHoursInt(totalDayHours);

        // หรือถ้าต้องการตัดเศษ “รายช่วง” ก่อนแล้วค่อยรวม:
        // const totalDayHoursInt = `${Math.trunc(item.morning?.workHours || 0) + Math.trunc(item.night?.workHours || 0)} ชม.`;

        const statusMorning = item.morning
          ? item.morning.isLate
            ? "สาย"
            : "ตรงเวลา"
          : "-";
        const statusNight = item.night
          ? item.night.isLate
            ? "สาย"
            : "ตรงเวลา"
          : "-";

        tableData.push([
          `${day}`,
          morningEntry,
          nightEntry,
          totalDayHoursInt, // ✅ ไม่โชว์ทศนิยม
          `${statusMorning} / ${statusNight}`,
        ]);
      } else {
        tableData.push([`${day}`, "-", "-", "-", "-"]);
      }
    }

    autoTable(doc, {
      head: [
        [
          "วันที่",
          "(เช้า)เข้างาน-ออกงาน",
          "(ดึก)เข้างาน-ออกงาน",
          "ชั่วโมงทำงาน",
          "สถานะ",
        ],
      ],
      body: tableData,
      startY: 40,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        font: "THSarabunNew",
        fontStyle: "normal",
      },
      styles: {
        font: "THSarabunNew",
        fontStyle: "normal",
        fontSize: 10,
      },
    });

    doc.save(`รายงานการลงเวลา_${currentMonthThai}_${currentYearBuddhist}.pdf`);
  };

  /* ------------------ Render ------------------ */
  return (
    <div className="w-full min-h-screen bg-linear-to-br from-gray-50 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-20">
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 shadow-lg text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold">
                  ปฏิทินการลงเวลา
                </h1>
                <div className="flex items-center gap-3 text-blue-100">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg font-medium">
                    {currentMonthThai} {currentYearBuddhist}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    ทั้งหมด {totalShifts}
                  </div>
                  {/* คำนวณ ชม. ทำงาน */}
                  <div className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {/* {totalWorkHours.toFixed(1)} ชั่วโมง */}
                    คำนวณ ชม. ทำงาน เร็วๆนี้
                  </div>
                </div>
              </div>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-3 px-5 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 font-medium whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Dashboard */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard
              title="ปกติ"
              value={morningShifts}
              icon={<Sun className="w-5 h-5 text-amber-500" />}
              color="from-amber-50 to-orange-50"
              borderColor="border-amber-200"
            />
            <SummaryCard
              title="เวรดึก"
              value={nightShifts}
              icon={<Moon className="w-5 h-5 text-indigo-500" />}
              color="from-indigo-50 to-purple-50"
              borderColor="border-indigo-200"
            />
            {/* <SummaryCard
              title="ชั่วโมงทั้งหมด"
              value={totalWorkHours.toFixed(1)}
              unit="ชม."
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              color="from-emerald-50 to-green-50"
              borderColor="border-emerald-200"
            />
            <SummaryCard
              title="ชั่วโมง OT"
              value={overtimeHours.toFixed(1)}
              unit="ชม."
              icon={<AlertCircle className="w-5 h-5 text-purple-500" />}
              color="from-purple-50 to-pink-50"
              borderColor="border-purple-200"
            /> */}
          </div>

          {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              title="กะสำเร็จ"
              value={completedShifts}
              percentage={
                totalShifts > 0
                  ? Math.round((completedShifts / totalShifts) * 100)
                  : 0
              }
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            />
            <StatCard
              title="กะสาย"
              value={lateShifts}
              percentage={
                totalShifts > 0
                  ? Math.round((lateShifts / totalShifts) * 100)
                  : 0
              }
              icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
            />
            <StatCard
              title="วันขาด"
              value={absentDays}
              percentage={
                totalDaysInMonth > 0
                  ? Math.round((absentDays / totalDaysInMonth) * 100)
                  : 0
              }
              icon={<Users className="w-5 h-5 text-red-500" />}
            />
          </div> */}
        </div>

        {/* Legend */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-700 mb-3">
            ความหมายสี
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-linear-to-br from-emerald-400 to-green-500"></div>
              <span className="text-sm text-gray-600">ลงเวลาครบถ้วน</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-linear-to-br from-amber-400 to-orange-500"></div>
              <span className="text-sm text-gray-600">เข้างานสาย</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gray-300"></div>
              <span className="text-sm text-gray-600">ไม่มีข้อมูล</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-600">จุดสีส้ม = สาย</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-8">
          <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4">
            {weekdays.map((d) => (
              <div
                key={d}
                className="text-center text-sm md:text-base font-semibold text-gray-700 py-3 bg-gray-50 rounded-lg"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {leadingDays.map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-16 md:min-h-24 bg-gray-50 rounded-lg"
              />
            ))}
            {days.map((day) => {
              const data = attendanceMap[day];
              const status = getDayStatus(data);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === monthIndex &&
                new Date().getFullYear() === yearAD;

              const hasMorning = !!data?.morning;
              const hasNight = !!data?.night;
              const hasLate = data?.morning?.isLate || data?.night?.isLate;

              return (
                <button
                  key={day}
                  onClick={() => openModal(day, data)}
                  className={`min-h-16 md:min-h-24 p-2 md:p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-md active:scale-95 cursor-pointer ${
                    status.bg
                  } ${status.border} ${
                    isToday ? "ring-2 ring-blue-500 ring-offset-2" : ""
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <div
                        className={`text-base md:text-lg font-bold ${
                          isToday ? "text-blue-600" : "text-gray-800"
                        }`}
                      >
                        {day}
                      </div>
                      {hasLate && (
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      )}
                    </div>

                    <div className="mt-auto space-y-1">
                      {hasMorning && (
                        <div className="flex items-center gap-1">
                          <Sun className="w-3 h-3 text-amber-500" />
                          <span className="text-xs truncate">
                            {data!.morning!.startTime}
                          </span>
                        </div>
                      )}
                      {hasNight && (
                        <div className="flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-500" />
                          <span className="text-xs truncate">
                            {data!.night!.startTime}
                          </span>
                        </div>
                      )}
                      {/* แสดง label เช้า/ดึก/2 กะ */}
                      {hasMorning && hasNight && (
                        <div className="text-[8px] text-center text-gray-600 mt-0.5">
                          2 กะ
                        </div>
                      )}
                      {hasMorning && !hasNight && (
                        <div className="text-[8px] text-center text-amber-600 mt-0.5">
                          เช้า
                        </div>
                      )}
                      {hasNight && !hasMorning && (
                        <div className="text-[8px] text-center text-indigo-600 mt-0.5">
                          ดึก
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="bg-linear-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">กะทั้งหมด</div>
              <div className="text-2xl font-bold text-gray-900">
                {totalShifts}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">ครบเวลา</div>
              <div className="text-2xl font-bold text-emerald-600">
                {completedShifts}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">สาย</div>
              <div className="text-2xl font-bold text-amber-600">
                {lateShifts}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">ขาด</div>
              <div className="text-2xl font-bold text-red-600">
                {absentDays}
              </div>
            </div>
          </div>
        </div> */}

        {/* Modal */}
        {isModalOpen && selectedDayData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      วันที่ {selectedDayData.day}
                    </h3>
                    <p className="text-gray-600">
                      {currentMonthThai} {currentYearBuddhist}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedDayData.shifts.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDayData.shifts.map((shift, index) => (
                      <div
                        key={index}
                        className={`rounded-xl p-4 ${
                          shift.shiftType === "morning"
                            ? "bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200"
                            : "bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                shift.shiftType === "morning"
                                  ? "bg-amber-100"
                                  : "bg-indigo-100"
                              }`}
                            >
                              {shift.shiftType === "morning" ? (
                                <Sun className="w-5 h-5 text-amber-600" />
                              ) : (
                                <Moon className="w-5 h-5 text-indigo-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800">
                                {shift.shiftType === "morning"
                                  ? "ปกติ"
                                  : "เวรดึก"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {shift.shiftType === "morning"
                                  ? "06:00 เป็นต้นไป"
                                  : "18:00 เป็นต้นไป"}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              shift.isLate
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {shift.isLate ? "เข้างานสาย" : "ตรงเวลา"}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">
                              เวลาเข้างาน
                            </div>
                            <div className="font-bold text-lg">
                              {shift.startTime}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">
                              เวลาออกงาน
                            </div>
                            <div className="font-bold text-lg">
                              {shift.endTime}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200/50">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              ชั่วโมงทำงาน
                            </span>
                            <span className="font-bold text-lg text-blue-600">
                              {shift.workHours.toFixed(2)} ชม.
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-2">ไม่มีข้อมูลการลงเวลา</p>
                    <p className="text-sm text-gray-400">
                      วันนี้ยังไม่ได้ลงเวลา
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t">
                <button
                  onClick={closeModal}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCalendar;

/* ------------------ Sub Components ------------------ */

const SummaryCard = ({
  title,
  value,
  unit = "",
  icon,
  color = "from-blue-50 to-indigo-50",
  borderColor = "border-blue-200",
}: {
  title: string;
  value: any;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
  borderColor?: string;
}) => (
  <div
    className={`bg-linear-to-br ${color} border ${borderColor} rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow duration-300`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="text-sm font-medium text-gray-700">{title}</div>
      <div className="p-2 bg-white/50 rounded-lg">{icon}</div>
    </div>
    <div className="text-2xl md:text-3xl font-bold text-gray-900">
      {value}
      {unit && <span className="text-lg font-normal ml-1">{unit}</span>}
    </div>
  </div>
);

// const StatCard = ({
//   title,
//   value,
//   percentage,
//   icon,
// }: {
//   title: string;
//   value: any;
//   percentage: number;
//   icon: React.ReactNode;
// }) => (
//   <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
//     <div className="flex items-center justify-between mb-3">
//       <div className="text-sm font-medium text-gray-700">{title}</div>
//       {icon}
//     </div>
//     <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
//     <div className="flex items-center gap-2">
//       <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
//         <div
//           className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full"
//           style={{ width: `${Math.min(percentage, 100)}%` }}
//         ></div>
//       </div>
//       <span className="text-sm font-medium text-gray-600">{percentage}%</span>
//     </div>
//   </div>
// );
