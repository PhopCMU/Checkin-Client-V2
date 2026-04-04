import { useEffect, useRef, useState } from "react";
import AttendanceCalendar from "../components/AttendanceCalendar";
import axios from "axios";
import { getCurrentBuddhistYear, getCurrentMonthThai } from "../utils/dateUtils";
import { getToken, getUserFromToken } from "../utils/authService";
import LoadingSpinner from "./LoadingSpinner";
import CryptoJs from "crypto-js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});



const HistoryPage = () => {

  const [historyMonth, setHistoryMonth] = useState<any>([]);
  const useRefHistoryMonth = useRef(false)
  const [loading, setLoading] = useState(false);

  const fetchHistoryMonth = async () => {
    try {
        setLoading(true);
        const user = getUserFromToken();
        if (!user?.email) return console.error("User not found");

        const payload ={
            email: user.email,
            month: getCurrentMonthThai(),
            year: getCurrentBuddhistYear()
        }

         const dataEncode = CryptoJs.AES.encrypt(
          JSON.stringify(payload),
          import.meta.env.VITE_CRYPTO_SECRET_KEY
        ).toString();

        const encodedData = encodeURIComponent(dataEncode);
        const url = `/api/list/all?data=${encodedData}`;

        const token = getToken();
        if (!token) return console.error("Token not found");
        
      // สมมติว่า fetch จาก API
      const response = await api.get(`${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    if (response.data?.results) {
        const data = response.data.results;
        setHistoryMonth(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }

  useEffect(() => {
    if(useRefHistoryMonth.current) return;
    useRefHistoryMonth.current = true;
    fetchHistoryMonth();
  },[]);


  if (loading) return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <LoadingSpinner />
    </div>
  );

  return (
    <AttendanceCalendar
      dailyData={historyMonth}
      currentMonthThai={getCurrentMonthThai()}
      currentYearBuddhist={getCurrentBuddhistYear()}
    />
  );
};

export default HistoryPage;
