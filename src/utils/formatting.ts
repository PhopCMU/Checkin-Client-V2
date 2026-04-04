import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { addYears } from 'date-fns';

export const formatTimeEN = (d: Date) => format(d, 'HH:mm:ss');
export const formatTimeShortEN = (d: Date) => format(d, 'HH:mm');
export const formatDateEN = (d: Date) => format(d, 'dd MMM yyyy');
export const formatDateTimeEN = (d: Date) => format(d, 'dd MMM yyyy HH:mm:ss');


// ฟังก์ชันช่วยเพิ่ม 543 ปี (แปลงเป็น พ.ศ.)
const toBuddhistYear = (date: Date): Date => {
    return addYears(date, 543);
};

export const formatTime = (d: Date) => format(d, 'HH:mm:ss');
export const formatTimeShort = (d: Date) => format(d, 'HH:mm');

// ใช้ปี พ.ศ. โดยแปลงวันที่ก่อน format
export const formatDate = (d: Date) =>
    format(toBuddhistYear(d), 'dd MMM yyyy', { locale: th });

export const formatDateTime = (d: Date) =>
    format(toBuddhistYear(d), 'dd MMM yyyy HH:mm:ss', { locale: th });




export const getTimeStatus = (actualTime: string, expectedTime: string): string => {
    if (!actualTime) return '';

    const [actualHour, actualMinute] = actualTime.split(':').map(Number);
    const [expectedHour, expectedMinute] = expectedTime.split(':').map(Number);

    const actualTotal = actualHour * 60 + actualMinute;
    const expectedTotal = expectedHour * 60 + expectedMinute;

    const diff = actualTotal - expectedTotal;

    if (diff < 0) {
        return `เร็ว ${Math.abs(diff)} นาที`;
    } else if (diff > 0) {
        return `สาย ${diff} นาที`;
    } else {
        return 'ตรงเวลา';
    }
};

export const formatDuration = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (wholeHours === 0) {
        return `${minutes} นาที`;
    } else if (minutes === 0) {
        return `${wholeHours} ชั่วโมง`;
    } else {
        return `${wholeHours} ชั่วโมง ${minutes} นาที`;
    }
};