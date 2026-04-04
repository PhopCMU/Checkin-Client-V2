import React, { useEffect, useState } from "react";
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
  Tablet,
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
      navigate("/", { replace: true });
      return;
    }

    if (code && !hasExchangedCode.current) {
      hasExchangedCode.current = true;
      exchangeCodeForSession(code);
    }
  }, [code, navigate]);

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
      navigate("/", { replace: true });
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

  useEffect(() => {
    if (code && !hasExchangedCode.current) {
      hasExchangedCode.current = true;
      exchangeCodeForSession(code);
    }
  }, [code, navigate]);

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
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-linear-to-br from-blue-900 to-blue-800 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 lg:w-6 lg:h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                  <Heart className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                  คณะสัตวแพทยศาสตร์
                </h1>
                <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">
                  Faculty of Veterinary Medicine, Chiang Mai University
                </p>
                <p className="text-xs lg:text-sm text-gray-600 sm:hidden">
                  Faculty of Veterinary Medicine, CMU
                </p>
              </div>
            </div>

            {/* Responsive Device Indicators */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Smartphone className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Mobile</span>
              </div>
              <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-blue-100 rounded-lg">
                <Tablet className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">Tablet</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            {/* Left Panel - Information */}
            <div className="flex flex-col justify-center">
              <div className="max-w-2xl mx-auto lg:mx-0">
                {/* Hero Section */}
                <div className="mb-8 lg:mb-12">
                  <div className="inline-flex items-center space-x-4 lg:space-x-6 mb-6">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-linear-to-br from-blue-900 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl">
                      <Clock className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <div>
                      <div className="inline-block mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs lg:text-sm font-semibold rounded-full">
                          VMCMU
                        </span>
                      </div>
                      <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mt-2 leading-tight">
                        ระบบบันทึกเวลาปฏิบัติงาน
                        <span className="block text-lg lg:text-xl text-blue-900 font-semibold mt-1">
                          สำหรับบุคลากรคณะสัตวแพทยศาสตร์
                        </span>
                      </h1>
                    </div>
                  </div>

                  {/* Feature Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    {/* Main Login Card */}
                    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200/80 overflow-hidden mb-6">
                      {/* Card Header */}
                      <div className="bg-linear-to-r from-blue-900 via-blue-800 to-blue-700 p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                              <GraduationCap className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h2 className="text-xl lg:text-2xl font-bold text-white">
                                เข้าสู่ระบบ
                              </h2>
                              <p className="text-white/90 text-sm lg:text-base">
                                ใช้ CMU IT Account ของคุณ
                              </p>
                            </div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                            <span className="text-white text-sm font-medium tracking-wide">
                              CMU Authentication
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 lg:p-8">
                        {/* Status Messages */}
                        {error && (
                          <div className="mb-6 animate-fade-in">
                            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                              <div className="flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0 mr-3" />
                                <div>
                                  <h4 className="font-semibold text-red-800">
                                    เกิดข้อผิดพลาด
                                  </h4>
                                  <p className="text-red-600 text-sm mt-1">
                                    {error}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {info && (
                          <div className="mb-6 animate-fade-in">
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                              <div className="flex items-center">
                                <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-3" />
                                <div>
                                  <h4 className="font-semibold text-blue-800">
                                    กำลังดำเนินการ
                                  </h4>
                                  <p className="text-blue-600 text-sm mt-1">
                                    {info}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Login Instructions */}
                        <div className="text-center mb-8">
                          <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-blue-50 to-white rounded-full flex items-center justify-center shadow-inner">
                            <div className="w-20 h-20 bg-linear-to-r from-blue-900 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                              <Shield className="w-10 h-10 text-white" />
                            </div>
                          </div>
                          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3">
                            ยืนยันตัวตนเพื่อเข้าใช้งาน
                          </h3>
                          <p className="text-gray-600 text-sm lg:text-base">
                            คุณจะถูกนำไปยังหน้าเว็บ CMU IT Account
                            เพื่อลงชื่อเข้าใช้ด้วยบัญชีผู้ใช้มหาวิทยาลัยเชียงใหม่
                          </p>
                        </div>

                        {/* Login Button */}
                        <form onSubmit={handleCMULogin} className="mb-6">
                          <button
                            type="submit"
                            disabled={loading || !!code}
                            className={`
                          w-full relative overflow-hidden rounded-xl lg:rounded-2xl
                          transition-all duration-300 group
                          ${
                            loading || !!code
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-linear-to-r from-blue-900 to-blue-800 hover:shadow-xl active:scale-[0.99]"
                          }
                        `}
                          >
                            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="relative z-10 flex items-center justify-center space-x-3 py-4 lg:py-5 px-6">
                              {loading || !!code ? (
                                <>
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span className="font-semibold text-white text-base lg:text-lg">
                                    {code
                                      ? "กำลังยืนยันตัวตน..."
                                      : "กำลังเชื่อมต่อ..."}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                  <span className="font-semibold text-white text-base lg:text-lg">
                                    เข้าสู่ระบบด้วย CMU IT Account
                                  </span>
                                  <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-white ml-auto group-hover:translate-x-1 transition-transform" />
                                </>
                              )}
                            </div>
                          </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                          <div className="flex-1 border-t border-gray-200" />
                          <span className="px-4 text-sm text-gray-500 font-medium">
                            หรือ
                          </span>
                          <div className="flex-1 border-t border-gray-200" />
                        </div>

                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          type="button"
                          className="w-full group relative overflow-hidden rounded-xl lg:rounded-2xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 transition-all duration-300 active:scale-[0.99]"
                        >
                          <div className="relative z-10 flex items-center justify-center space-x-3 py-3 lg:py-4 px-6">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-700 text-base lg:text-lg">
                              ออกระบบ CMU IT Account
                            </span>
                            <LockOpen className="w-5 h-5 text-gray-500 ml-auto group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>

                        {/* System Info */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <div className="text-center">
                            <div className="inline-flex items-center space-x-2 bg-gray-50 rounded-xl px-4 py-2">
                              <span className="text-sm font-mono text-gray-700 font-semibold">
                                เวอร์ชันระบบ: v
                                {import.meta.env.VITE_APP_VERSION}
                              </span>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-xs text-green-600 font-medium">
                                Production
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            ปลอดภัย
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            ใช้ CMU IT Account
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            เป็นทางการ
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            สำหรับบุคลากรเท่านั้น
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="space-y-4">
                  <div className="bg-linear-to-r from-blue-50 to-white rounded-xl p-6 border border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Users className="w-5 h-5 text-blue-900 mr-2" />
                      กลุ่มผู้ใช้งาน
                    </h3>
                    <p className="text-gray-700">
                      คณาจารย์, เจ้าหน้าที่, และทีมงานคณะสัตวแพทยศาสตร์
                      มหาวิทยาลัยเชียงใหม่
                    </p>
                  </div>

                  <div className="bg-linear-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <HelpCircle className="w-5 h-5 text-gray-700 mr-2" />
                      การช่วยเหลือ
                    </h3>
                    <p className="text-gray-700">
                      ติดต่อศูนย์ช่วยเหลือไอที คณะสัตวแพทยศาสตร์
                      <br />
                      <span className="text-sm text-gray-600">
                        โทรศัพท์: 053-944000
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Login Card */}
            <div className="flex flex-col justify-center">
              <div className="max-w-md mx-auto lg:mx-0 w-full">
                {/* Footer */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    © {new Date().getFullYear()} คณะสัตวแพทยศาสตร์
                    <br className="sm:hidden" />
                    <span className="hidden sm:inline"> • </span>
                    มหาวิทยาลัยเชียงใหม่
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Faculty of Veterinary Medicine, Chiang Mai University
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
