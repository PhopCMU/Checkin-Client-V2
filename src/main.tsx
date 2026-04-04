import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SignIn from "./components/SignIn";
import "./index.css";
import PrivateRoute from "./components/PrivateRoute";
import { AlertProvider } from "./contexts/AlertContext";
import { UpdatePrompt } from "./pwa/UpdatePrompt";
import ErrorBoundary from "./components/ErrorBoundary";
import { version } from "../package.json";

const CURRENT_VERSION = version ?? "dev";

/**
 * 🛠️ ฟังก์ชันสั่งให้ Service Worker ตรวจสอบการอัปเดต
 * โดยการเช็คไฟล์ sw.js จาก Server
 */
const checkSWUpdate = async () => {
  try {
    const savedVersion = localStorage.getItem("app_version");

    // 💡 ถ้าใน localStorage ไม่ตรงกับ CURRENT_VERSION แสดงว่ากำลังอัปเดตอยู่ ให้ข้ามไปก่อน
    if (savedVersion !== CURRENT_VERSION) return;

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        // สั่งให้ Service Worker ตรวจสอบการอัปเดตจากไฟล์ sw.js ทันที
        registration.update();
      }
    }
  } catch (error) {
    console.error("[Version] SW update check failed:", error);
  }
};

if ("serviceWorker" in navigator) {
  const savedVersion = localStorage.getItem("app_version");

  // กรณีเป็นครั้งแรกที่เข้าแอป
  if (!savedVersion) {
    localStorage.setItem("app_version", CURRENT_VERSION);
  }

  // กรณี Local Storage ไม่ตรงกับ Code (แปลว่าเพิ่ง reload จากการอัปเดต)
  if (savedVersion && savedVersion !== CURRENT_VERSION) {
    localStorage.setItem("app_version", CURRENT_VERSION);
    // ไม่ต้อง reload ซ้ำที่นี่แล้ว เพราะ code ใหม่กำลังรันอยู่
  }

  // ดักฟังเมื่อ Service Worker ตัวใหม่เข้าควบคุม (Skip Waiting แล้ว)
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    const savedVersion = localStorage.getItem("app_version");
    if (savedVersion !== CURRENT_VERSION) {
      localStorage.setItem("app_version", CURRENT_VERSION);
      window.location.reload();
    }
  });

  // ตรวจสอบการอัปเดตทันทีเมื่อเริ่มแอป และทุก 15 นาที
  checkSWUpdate();
  setInterval(checkSWUpdate, 15 * 60 * 1000);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AlertProvider>
        <BrowserRouter>
          <UpdatePrompt />
          <Routes>
            <Route path="sign-in" element={<SignIn />} />
            <Route
              path=""
              element={
                <PrivateRoute>
                  <App />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
