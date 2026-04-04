import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDate } from "../utils/formatting";
import type { StatusCardProps } from "../types/types";

const StatusCard: React.FC<StatusCardProps> = ({ data }) => {
  const now = new Date();
  const morningShift = data.find((r) => r.shiftType === "morning");
  const nightShift = data.find((r) => r.shiftType === "night");

  return (
    <div className="px-4 py-2 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Simple Header */}
        <div className="flex justify-between items-center gap-2 mb-2">
          <div className="flex items-center gap-2 ">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">
              {formatDate(now)}
            </h2>
          </div>
          <div className="flex items-center gap-0.5 text-sm text-gray-600">
            <Clock className="w-3 h-3" />
            {now.toLocaleTimeString("th-TH")}
          </div>
        </div>

        {/* Compact Shifts */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="divide-y divide-gray-100">
            {/* Morning Shift */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-amber-500">Morning</h3>
                <span className="text-xs text-amber-500">08:00-21:00</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">In</div>
                  <div className="font-medium text-gray-800">
                    {morningShift?.startTime || "--:--"}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {morningShift?.locationNameIn || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Out</div>
                  <div className="font-medium text-gray-800">
                    {morningShift?.endTime || "--:--"}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {morningShift?.locationNameOut || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Night Shift */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-purple-800">Night</h3>
                <span className="text-xs text-purple-500">20:00-08:00</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">In</div>
                  <div className="font-medium text-gray-800">
                    {nightShift?.startTime || "--:--"}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {nightShift?.locationNameIn || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Out</div>
                  <div className="font-medium text-gray-800">
                    {nightShift?.endTime || "--:--"}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {nightShift?.locationNameOut || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
