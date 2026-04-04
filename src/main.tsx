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

const CURRENT_VERSION = import.meta.env.VITE_APP_VERSION ?? "dev";

if ("serviceWorker" in navigator) {
  const savedVersion = localStorage.getItem("app_version");

  // ถ้าไม่เคยมี version → set เฉย ๆ ไม่ reload
  if (!savedVersion) {
    localStorage.setItem("app_version", CURRENT_VERSION);
  }

  // ถ้า version เปลี่ยน → reload ครั้งเดียว
  if (savedVersion && savedVersion !== CURRENT_VERSION) {
    localStorage.setItem("app_version", CURRENT_VERSION);
    window.location.reload();
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    const savedVersion = localStorage.getItem("app_version");

    if (savedVersion !== CURRENT_VERSION) {
      localStorage.setItem("app_version", CURRENT_VERSION);
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AlertProvider>
        <BrowserRouter>
          <Routes>
            <Route path="sign-in" element={<SignIn />} />
            <Route
              path=""
              element={
                <PrivateRoute>
                  <App />
                  <UpdatePrompt />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
