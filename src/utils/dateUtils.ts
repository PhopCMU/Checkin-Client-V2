export {
    getCurrentBuddhistYear,
    getCurrentMonthThai,
    getCurrentDayOfWeekThai,
    getCurrentDayOfMonth,
};

const getCurrentBuddhistYear = () => {
  const currentYearCE = new Date().getFullYear();
  return currentYearCE + 543; // 2025 + 543 = 2568
};


const getCurrentMonthThai = () => {
  const currentDate = new Date();
  const options: any = { month: 'long', timeZone: 'Asia/Bangkok' };
  const monthName = currentDate.toLocaleDateString('th-TH', options);
  return monthName.replace('เดือน', '').trim(); 
};


const getCurrentDayOfWeekThai = () => {
  const currentDate = new Date();
  const options:any = { weekday: 'long', timeZone: 'Asia/Bangkok' };
  const dayName = currentDate.toLocaleDateString('th-TH', options);
  return dayName; // ผลลัพธ์สำหรับวันนี้คือ "วันอาทิตย์"
};


const getCurrentDayOfMonth = () => {
    const currentDate = new Date();
    return currentDate.getDate(); // ผลลัพธ์สำหรับวันนี้คือ 14
}