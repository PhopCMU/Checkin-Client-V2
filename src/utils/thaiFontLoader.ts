import { jsPDF } from 'jspdf';

let fontLoaded = false;
let globalFontString: string | null = null; // ⬅️ เก็บ Base64 string ของฟอนต์

export const loadThaiFont = (doc: jsPDF): Promise<void> => {
  if (fontLoaded) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    fetch('./fonts/THSarabunNew.ttf') // ⬅️ ตรวจสอบ Path
      .then(response => response.arrayBuffer())
      .then(fontBytes => {
        const fontString = new Uint8Array(fontBytes).reduce((data, byte) => data + String.fromCharCode(byte), '');
        globalFontString = btoa(fontString); // ⬅️ เก็บ Base64 ไว้
        
        doc.addFileToVFS('THSarabunNew.ttf', globalFontString);
        doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
        
        fontLoaded = true;
        resolve();
      })
      .catch(e => reject(e));
  });
};

export const useThaiFont = (doc: jsPDF) => {
  if (fontLoaded && globalFontString) {
    // ⬅️ เพิ่มฟอนต์ซ้ำสำหรับ jsPDF object ใหม่ทุกครั้ง (ครั้งที่ 2, 3, ...)
    doc.addFileToVFS('THSarabunNew.ttf', globalFontString);
    doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
    
    // ⬅️ ตั้งค่าฟอนต์สำหรับเอกสาร
    doc.setFont('THSarabunNew', 'normal');
  }
};

// ➡️ ให้ใช้โค้ด handleExportPDF เดิมของคุณ (ในส่วน try/catch) ได้เลย
// เพราะโค้ดใน thaiFontLoader ที่ถูกแก้ จะรับประกันการลงทะเบียนฟอนต์ซ้ำบน doc ใหม่