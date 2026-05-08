import React, { useEffect, useState } from "react";
import { version } from "../../package.json";
import {
  Shield,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Heart,
  LockOpen,
  ArrowLeft,
  Clock,
  UserCheck,
  Users,
  HelpCircle,
  Smartphone,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  getUserInfo,
  isAuthenticatedLocally,
  removeToken,
  saveToken,
  userEncode,
} from "../utils/authService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

const SignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? "/";
  const hasExchangedCode = React.useRef(false);

  const query = new URLSearchParams(location.search);
  const code = query.get("code");

  const handleCMULogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("กำลังนำทางไปยังระบบ CMU IT Account...");

    try {
      const clientId = import.meta.env.VITE_PUBLIC_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_PUBLIC_CALLBACK_URL;
      const scope = import.meta.env.VITE_PUBLIC_SCOPE;
      const authUrlBase = import.meta.env.VITE_PUBLIC_AUTH_URL;

      const authUrl = `${authUrlBase}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&scope=${encodeURIComponent(scope)}`;

      window.location.href = authUrl;
    } catch (err) {
      setError(
        "ไม่สามารถเชื่อมต่อกับระบบ CMU IT Account ได้ กรุณาลองใหม่อีกครั้ง",
      );
      setInfo("");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticatedLocally()) {
      navigate(from, { replace: true });
      return;
    }

    if (code && !hasExchangedCode.current) {
      hasExchangedCode.current = true;
      exchangeCodeForSession(code);
    }
  }, [code, navigate, from]);

  const exchangeCodeForSession = async (authCode: string) => {
    setInfo("กำลังยืนยันการเข้าสู่ระบบ...");
    setError("");
    removeToken();

    try {
      const exchangeRes = await api.post("/api/auth/exchange-code", {
        code: authCode,
      });
      let userInfo;

      if (!exchangeRes.data) {
        throw new Error("ไม่ได้รับข้อมูลผู้ใช้");
      }

      if (exchangeRes.data.accessToken) {
        userInfo = await getUserInfo(exchangeRes.data.accessToken);
      } else if (exchangeRes.data.user) {
        userInfo = exchangeRes.data.user;
      } else {
        throw new Error("ไม่ได้รับข้อมูลผู้ใช้");
      }

      if (!userInfo?.cmuitaccount_name) {
        setError("ไม่พบข้อมูลบัญชี CMU IT Account ของคุณในระบบ");
        return;
      }

      const registerRes = await userEncode(userInfo);
      if (!registerRes?.accessToken) {
        setError("ระบบยืนยันตัวตนล้มเหลว");
        navigate("/sign-in", { replace: true });
        return;
      }

      saveToken(registerRes.accessToken);
      setInfo("ยืนยันการเข้าสู่ระบบสำเร็จ");
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Authentication flow error:", err);
      removeToken();
      navigate("/sign-in", { replace: true });

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setError(
            "คุณไม่มีสิทธิ์เข้าใช้งานระบบ (ต้องเป็นบุคลากรคณะสัตวแพทยศาสตร์)",
          );
        } else if (err.response?.status === 400) {
          setError("รหัสยืนยันไม่ถูกต้องหรือหมดอายุ");
        } else {
          setError(
            err.response?.data?.message ||
              "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
          );
        }
      } else {
        setError("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setInfo("");
    }
  };

  const handleLogout = () => {
    const logoutUrl = import.meta.env.VITE_PUBLIC_LOGOUT_URL;
    window.location.href = logoutUrl;
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-linear-to-br from-blue-900 to-blue-800 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                  <Heart className="w-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 leading-tight">
                  คณะสัตวแพทยศาสตร์
                </h1>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">
                  Faculty of Veterinary Medicine, CMU
                </p>
              </div>
            </div>

            {/* Responsive Device Indicators */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Smartphone className="w-4 h-4 text-gray-600" />
                <span className="text-xs lg:text-sm text-gray-700 font-medium">
                  Mobile Ready
                </span>
              </div>
              <div className="flex lg:hidden items-center justify-center w-8 h-8 bg-blue-50 rounded-lg sm:hidden">
                <Smartphone className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left Panel - Branding & Information (Col 1-7) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-8 lg:pr-8 order-2 lg:order-1">
              {/* Hero Section */}
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-4 sm:space-x-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-linear-to-br from-blue-900 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl">
                    <Clock className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div>
                    <div className="inline-block mb-1 sm:mb-2">
                      <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs lg:text-sm font-bold rounded-full uppercase tracking-wider">
                        Attendance System
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                      ระบบบันทึกเวลาปฏิบัติงาน
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-blue-800 font-medium mt-1">
                      Faculty of Veterinary Medicine, Chiang Mai University
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                  ระบบบันทึกเวลาเข้า-ออกงานผ่านเครือข่ายไร้สาย
                  และระบบระบุตำแหน่ง สำหรับบุคลากรคณะสัตวแพทยศาสตร์
                  มหาวิทยาลัยเชียงใหม่
                </p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 shadow-sm flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">ปลอดภัย</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-snug">
                      ล็อกอินด้วยมาตรฐาน CMU OAuth2
                      ยืนยันตัวตนผ่านระบบส่วนกลางของมหาวิทยาลัย
                    </p>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 shadow-sm flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <UserCheck className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">แม่นยำ</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-snug">
                      ตรวจสอบสิทธิ์การเข้าใช้งานเฉพาะบุคลากรคณะสัตวแพทยศาสตร์เท่านั้น
                    </p>
                  </div>
                </div>
              </div>

              {/* Extra Info */}
              <div className="space-y-4 pt-4 border-t border-gray-200/60">
                <div className="flex items-center text-gray-700 font-medium">
                  <Users className="w-5 h-5 text-blue-800 mr-3" />
                  <span>รองรับคณาจารย์ และเจ้าหน้าที่ทุกภาคส่วน</span>
                </div>
                <div className="flex items-center text-gray-700 font-medium">
                  <HelpCircle className="w-5 h-5 text-gray-600 mr-3" />
                  <span>แจ้งปัญหาการใช้งาน: ศูนย์ไอที คณะสัตวแพทยศาสตร์</span>
                </div>
              </div>
            </div>

            {/* Right Panel - Login Card (Col 8-12) */}
            <div className="lg:col-span-5 flex flex-col justify-center sm:order-1">
              <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden transform transition-all">
                  {/* Card Header */}
                  <div className="bg-linear-to-r from-blue-900 via-blue-800 to-blue-700 p-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                        <LockOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">
                          เข้าสู่ระบบ
                        </h2>
                        <p className="text-blue-100/80 text-sm">
                          Sign in with CMU IT Account
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8">
                    {/* Feedback Messages */}
                    {error && (
                      <div className="mb-6 animate-slideDown">
                        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="font-bold text-red-900 text-sm">
                              ข้อผิดพลาด
                            </h4>
                            <p className="text-red-700 text-xs mt-0.5 leading-relaxed">
                              {error}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {info && (
                      <div className="mb-6 animate-slideDown">
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4 flex items-center space-x-3">
                          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
                          <div>
                            <p className="text-blue-800 text-sm font-medium">
                              {info}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center relative">
                        <Shield className="w-10 h-10 text-blue-900" />
                        <div className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        ระบบยืนยันตัวตนส่วนกลาง
                      </h3>
                      <p className="text-gray-500 text-sm mt-2 leading-relaxed px-4">
                        กรุณาลงชื่อเข้าใช้ด้วยบัญชีมหาวิทยาลัยเชียงใหม่
                        (@cmu.ac.th) เพื่อเริ่มการบันทึกเวลา
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <form onSubmit={handleCMULogin}>
                        <button
                          type="submit"
                          disabled={loading || !!code}
                          className={`
                            w-full relative overflow-hidden rounded-2xl py-4 px-6
                            font-bold text-white transition-all duration-300 group
                            ${
                              loading || !!code
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-linear-to-r from-blue-900 to-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                            }
                          `}
                        >
                          <div className="relative z-10 flex items-center justify-center space-x-3">
                            {loading || !!code ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>กำลังดำเนินการ...</span>
                              </>
                            ) : (
                              <>
                                <GraduationCap className="w-5 h-5" />
                                <span>เข้าสู่ระบบ CMU IT Account</span>
                                <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </div>
                        </button>
                      </form>

                      <button
                        onClick={handleLogout}
                        type="button"
                        className="w-full group rounded-2xl py-3.5 px-6 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:-translate-x-1 transition-transform" />
                        <span>ออกจากระบบอื่นที่ค้างอยู่</span>
                      </button>
                    </div>

                    {/* Version Info */}
                    <div className="mt-10 flex flex-col items-center space-y-3">
                      <div className="px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                          System Version v{version}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer in Card column */}
                <footer className="mt-8 text-center space-y-2">
                  <p className="text-xs font-medium text-gray-500">
                    © {new Date().getFullYear()} Faculty of Veterinary Medicine
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                    Chiang Mai University
                  </p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
