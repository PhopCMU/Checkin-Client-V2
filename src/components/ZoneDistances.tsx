import React, { useState } from "react";
import {
  Target,
  ChevronRight,
  ChevronDown,
  MapPin,
  Navigation,
} from "lucide-react";
import type { Zone } from "../types/types";

interface Props {
  zones: Zone[];
  distances: Record<number, number | null>;
  inside: boolean;
}

const ZoneDistances: React.FC<Props> = ({ zones, distances, inside }) => {
  const [expanded, setExpanded] = useState(false);

  const sortedZones = [...zones].sort((a, b) => {
    const distA = distances[a.id] ?? Infinity;
    const distB = distances[b.id] ?? Infinity;
    return distA - distB;
  });

  const nearestZone: any = sortedZones[0];
  const nearestDistance = nearestZone ? distances[nearestZone.id] : null;

  if (!zones.length) {
    return null;
  }

  // รองรับ responsive: แสดง zones ต่างกันตามขนาดหน้าจอ
  // const getVisibleZones = () => {
  //   if (expanded) {
  //     return sortedZones; // แสดงทั้งหมด ไม่สนใจขนาดหน้าจอ
  //   }

  //   // ถ้ายังไม่ expand → แสดงตามขนาดหน้าจอ
  //   if (typeof window === 'undefined') return sortedZones.slice(0, 3); // fallback สำหรับ SSR

  //   if (window.innerWidth < 640) return sortedZones.slice(0, 1); // Mobile
  //   if (window.innerWidth < 1024) return sortedZones.slice(0, 2); // Tablet
  //   return sortedZones.slice(0, 3); // Desktop
  // };

  const MAX_VISIBLE = 3;
  const visibleZones = expanded
    ? sortedZones
    : sortedZones.slice(0, MAX_VISIBLE);
  const hasMoreZones = sortedZones.length > MAX_VISIBLE;

  //   const visibleZones = getVisibleZones();
  //   const hasMoreZones = sortedZones.length > visibleZones.length;

  // Function to get distance status color
  const getDistanceColor = (distance: number | null, radius: number) => {
    if (distance === null) return "text-gray-500";
    return distance <= radius ? "text-emerald-600" : "text-red-500";
  };

  // Function to get status icon
  const getStatusIcon = (distance: number | null, radius: number) => {
    if (distance === null)
      return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    if (distance <= radius)
      return <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>;
    return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
  };

  return (
    <div className="mt-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Compact Header - Responsive */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <Target className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-sm font-medium text-gray-900">Distances</span>
            {nearestDistance !== null && nearestZone && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 hidden sm:inline">
                {Math.round(nearestDistance)}m
              </span>
            )}
          </div>

          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              inside
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {inside ? "In Range" : "Out of Range"}
          </div>
        </div>

        {/* Main Compact Card */}
        <div
          className={`bg-white border rounded-xl shadow-sm transition-all duration-200 ${
            inside ? "border-emerald-200" : "border-gray-200"
          }`}
        >
          {/* Nearest Zone Summary - Always Visible */}
          {nearestZone && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="shrink-0">
                    <div className="relative">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: nearestZone.color || "#10b981",
                        }}
                      >
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {nearestZone.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {nearestZone.description}
                        </div>
                      </div>

                      <div className="ml-2 text-right">
                        <div
                          className={`text-lg font-bold ${getDistanceColor(
                            nearestDistance,
                            nearestZone.radius,
                          )}`}
                        >
                          {nearestDistance
                            ? `${Math.round(nearestDistance)}m`
                            : "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          / {nearestZone.radius}m
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar - Desktop Only */}
                    <div className="hidden sm:block mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Distance to zone</span>
                        <span>
                          {nearestDistance ? Math.round(nearestDistance) : 0}m /{" "}
                          {nearestZone.radius}m
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        {nearestDistance && (
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((nearestDistance / nearestZone.radius) * 100, 100)}%`,
                              backgroundColor: inside ? "#10b981" : "#ef4444",
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Zones - Responsive Grid */}
          {visibleZones.length > 1 && (
            <div
              className={`p-3 ${
                expanded
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                  : "flex gap-2 overflow-x-auto pb-2"
              }`}
            >
              {visibleZones.slice(1).map((zone) => {
                const distance = distances[zone.id];
                const isInRange = distance !== null && distance <= zone.radius;

                return (
                  <div
                    key={zone.id}
                    className={`min-w-[140px] flex-1 p-2 rounded-lg border ${
                      isInRange
                        ? "border-emerald-100 bg-emerald-50"
                        : "border-gray-200 bg-gray-50"
                    } ${expanded ? "" : "shrink-0"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: zone.color || "#10b981" }}
                        />
                        <span className="text-xs font-medium text-gray-900 truncate">
                          {zone.name}
                        </span>
                      </div>
                      {getStatusIcon(distance, zone.radius)}
                    </div>

                    <div className="text-xs text-gray-700">
                      {distance == null ? "—" : `${Math.round(distance)}m`}
                    </div>
                    <div className="text-xs text-gray-400">
                      Range: {zone.radius}m
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Expand/Collapse Button */}
          {hasMoreZones && (
            <div className="border-t border-gray-100">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-2 text-center text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-b-xl transition-colors flex items-center justify-center gap-1"
              >
                {expanded ? (
                  <>
                    <ChevronDown className="w-4 h-4 rotate-180" />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span>
                      Show {sortedZones.length - visibleZones.length} More Zones
                    </span>
                  </>
                )}
              </button>
              {}
            </div>
          )}
        </div>

        {/* Status Indicator - Bottom Line */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Out of Range</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>No Signal</span>
            </div>
          </div>

          {nearestZone && inside && (
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <Navigation className="w-3 h-3" />
              <span> {nearestZone.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneDistances;
