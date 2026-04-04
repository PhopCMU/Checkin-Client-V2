import React from "react";
import { ShieldAlert, RefreshCcw } from "lucide-react";

const PWASSLRecoveryScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-9999 bg-white flex items-center justify-center px-6">
      <div className="max-w-sm text-center space-y-4">
        <ShieldAlert className="w-14 h-14 text-red-600 mx-auto" />

        <h1 className="text-xl font-bold text-gray-800">
          ระบบกำลังอัปเดตความปลอดภัย
        </h1>

        <p className="text-gray-600 text-sm">
          แอปกำลังล้างข้อมูลเก่าและปรับปรุง SSL
          <br />
          กรุณารอสักครู่…
        </p>

        <div className="flex justify-center">
          <RefreshCcw className="w-6 h-6 animate-spin text-blue-600" />
        </div>

        <p className="text-xs text-gray-400">
          หากเปิดผ่านแอป PWA ระบบจะรีเฟรชให้อัตโนมัติ
        </p>
      </div>
    </div>
  );
};

export default PWASSLRecoveryScreen;
