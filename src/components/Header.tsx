import React, { useState, useRef, useEffect } from "react";
import {
  LucideActivity,
  LogOut,
  ChevronDown,
  BookDashedIcon,
} from "lucide-react";
import { getUserFromToken, removeToken } from "../utils/authService";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = getUserFromToken();
  const navigate = useNavigate();

  const status =
    user?.permission === "superadmin"
      ? "ผู้ดูแลระบบ"
      : user?.permission === "admin"
        ? "ผู้ช่วยดูแลระบบ"
        : user?.permission === "hr"
          ? "เจ้าหน้าที่งานบุคคล"
          : user?.permission === "user"
            ? "พนักงาน"
            : "ผู้ใช้ทั่วไป";
  const expToken = user?.exp
    ? new Date(user.exp * 1000).toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        hour12: false,
        year: "numeric",
        month: "long",
        day: "numeric",
        // hour: '2-digit',
        // minute: '2-digit',
        // second: '2-digit'
      })
    : null;

  if (!user) return null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    // window.location.href = "http://localhost:5230/";
    // ใช้ router.push('/profile') ถ้าใช้ Next.js หรือ react-router
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    removeToken();
    navigate("/sign-in");
  };

  // const handleSettings = () => {
  //   console.log("Navigate to Settings");
  //   setIsDropdownOpen(false);
  // };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm z-5000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 shadow-md">
                  <LucideActivity className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Veterinary Medicine, CMU
                  </h1>
                  <p className="text-sm text-gray-600">
                    Mobile Attendance System
                  </p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex gap-2 items-center">
                    VMCMU
                  </h1>
                </div>
              </div>
            </div>

            {/* User Profile Section with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-sm">
                      {user.fname?.charAt(0).toUpperCase()}
                      {user.lname?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>

                {/* User Info - Hidden on mobile, shown on tablet and up */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {user.fname} {user.lname} ({status})
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {status}
                  </p>
                </div>

                {/* Chevron Icon */}
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                  {/* User Info in Dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.fname?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.fname} {user.lname}{" "}
                          <span className="text-xs text-gray-400">
                            ({status})
                          </span>{" "}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Exp.{expToken}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Items */}
                  <div className="py-2">
                    {(user.permission === "admin" ||
                      user.permission === "superadmin") && (
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <BookDashedIcon className="w-4 h-4 mr-3 text-gray-500" />
                        <span>Dashboard</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
