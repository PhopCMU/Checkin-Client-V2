import React, { useState } from "react";
import { BoltIcon, Home, List, LogOut, Settings } from "lucide-react";

interface Props {
  active: "home" | "history";
  onNavigate: (view: "home" | "history") => void;
  onLogout: () => void;
  onInstall: () => void;
}

const BottomNav: React.FC<Props> = ({
  active,
  onNavigate,
  onLogout,
  onInstall,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-4999"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Bottom Menu */}
      <nav className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-white to-gray-50/80 backdrop-blur-sm border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-5000">
        <div className="max-w-xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* History */}
          <button
            onClick={() => onNavigate("history")}
            className="flex flex-col items-center px-4 py-2 rounded-xl"
          >
            <List
              className={`w-6 h-6 ${
                active === "history" ? "text-indigo-600" : "text-slate-500"
              }`}
            />
            <span className="text-xs mt-1">History</span>
          </button>

          {/* Home */}
          <button
            onClick={() => onNavigate("home")}
            className="-mt-10 flex flex-col items-center"
          >
            <div className="p-4 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 shadow-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="mt-2 text-xs">Home</span>
          </button>

          {/* More */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center px-4 py-2 rounded-xl"
          >
            <BoltIcon className="w-6 h-6 text-slate-500" />
            <span className="text-xs mt-1">เพิ่มเติม</span>
          </button>
        </div>

        <div className="w-32 h-1 bg-gray-300 rounded-full mx-auto mb-1"></div>
      </nav>

      {/* Action Menu */}
      <div
        className={`fixed inset-0 z-6000 transition-all duration-300 ${
          menuOpen ? "bg-black/40 backdrop-blur-sm" : "pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className={`fixed bottom-0 left-0 right-0 transform transition-transform duration-300 ease-out ${
            menuOpen ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-xl mx-auto bg-linear-to-b from-white to-gray-50 rounded-t-3xl shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-16 h-1.5 bg-gray-300/80 rounded-full"></div>
            </div>

            {/* Menu Title */}
            <div className="px-6 pt-2 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">เมนู</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                จัดการบัญชีและแอปพลิเคชัน
              </p>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              <button
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-red-50/80 active:bg-red-100/60 transition-all duration-200 group"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-red-700 font-semibold">
                    ออกจากระบบ
                  </span>
                  <span className="block text-sm text-red-500/80">
                    ล็อกเอาท์จากบัญชีปัจจุบัน
                  </span>
                </div>
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
              </button>

              <button
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-blue-50/80 active:bg-blue-100/60 transition-all duration-200 group"
                onClick={() => {
                  setMenuOpen(false);
                  onInstall();
                }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-gray-800 font-semibold">
                    วิธีการติดตั้งแอป
                  </span>
                  <span className="block text-sm text-gray-500">
                    คู่มือการติดตั้งบนอุปกรณ์
                  </span>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-gray-50/70 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  © {new Date().getFullYear()} All rights reserved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNav;
