import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // =========================
  // 🔌 Plugins ที่ใช้ใน Vite
  // =========================
  plugins: [
    // React plugin (รองรับ JSX, Fast Refresh)
    react(),

    // Tailwind CSS plugin
    // ทำให้ Vite ประมวลผล Tailwind ได้เร็วและถูกต้อง
    tailwindcss(),

    // =========================
    // 🚀 PWA Configuration
    // =========================
    VitePWA({
      // ⭐ includeAssets
      // ไฟล์เหล่านี้จะถูก copy เข้า dist และถูก cache โดย Service Worker
      // เหมาะกับ favicon, apple icon, asset ที่อยู่นอก manifest icons
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "icons/icon-192x192.png",
        "icons/icon-512x512.png",
        "icons/maskable-192.png",
        "icons/maskable-512.png",
      ],
      // วิธี register Service Worker
      // autoUpdate = เมื่อมีเวอร์ชันใหม่ จะอัปเดต SW ให้อัตโนมัติ
      registerType: "autoUpdate",
      scope: "/", // ตัวอย่าง: https://vitejs.dev/
      // ตัวเลือกสำหรับตอน run `vite dev`
      devOptions: {
        // true = เปิดใช้งาน PWA ใน dev mode
        // ใช้สำหรับทดสอบ Service Worker / Manifest
        enabled: false,
      },

      // =========================
      // 📄 Web App Manifest
      // =========================
      manifest: {
        // ชื่อแอปแบบเต็ม (แสดงตอน install)
        name: "My Checkin App",

        // ชื่อย่อ (แสดงใต้ icon มือถือ)
        short_name: "VMCMU",

        // คำอธิบายแอป
        description: "System for checkin and checkout.",

        // สีหลักของแอป (แถบด้านบนบนมือถือ)
        theme_color: "#0f172a",

        // สีพื้นหลังตอนแอปกำลังโหลด
        background_color: "#ffffff",

        // รูปแบบการแสดงผล
        // standalone = เหมือน native app (ไม่มี address bar)
        display: "standalone",
        orientation: "portrait",
        // URL เริ่มต้นเมื่อเปิดแอป
        start_url: "/?source=pwa",
        lang: "th",
        dir: "ltr",

        // =========================
        // 🖼️ Icons สำหรับ PWA
        // =========================
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        categories: ["productivity", "utilities"],
      },

      // generateSW: เหมาะกับส่วนใหญ่ (ง่ายและปลอดภัย)
      strategies: "generateSW",

      // แทรกสคริปต์ register ให้เอง
      injectRegister: "auto",

      // =========================
      // 📦 Workbox (Service Worker Cache)
      // =========================
      workbox: {
        skipWaiting: true, // ป้องกันการ update SW
        clientsClaim: true, // ป้องกันการ update SW

        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          new RegExp("^/api/"),
          new RegExp("/assets/.*\\.(?:png|jpe?g|svg|webp)$"),
        ],

        cleanupOutdatedCaches: true, // ลบ cache ที่ไม่ใช้
        // กลยุทธ์ runtime caching (PROD = โฟกัสความเร็ว/เสถียร/อัปเดตนุ่มนวล)
        runtimeCaching: [
          // 1) API: NetworkFirst (พยายามเอาข้อมูลใหม่ก่อน, มี timeout, ล้มก็ใช้ cache)
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5, // ป้องกันค้าง
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 }, // อายุ cache 1 ชม.
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // 2) JS/CSS: Stale-While-Revalidate (ไฟล์มี hashing → อัปเดตเบื้องหลังได้)
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 วัน
            },
          },

          // 3) รูปภาพ: CacheFirst เพื่อความเร็ว (จำกัดจำนวน/อายุ)
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // 4) Google Fonts (stylesheet): SWR
          {
            urlPattern: ({ url }) =>
              url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },

          // 5) Google Fonts (ไฟล์ฟอนต์จริง): CacheFirst อายุยาว
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 ปี
            },
          },

          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
    }),
  ],

  // =========================
  // 🌐 Dev Server Configuration
  // =========================
  // server: สำหรับ preview local หลัง build (vite preview)
  server: {
    port: 5173,
    open: false,
  },

  // Build PROD: ปิด sourcemap (หรือใช้ 'hidden' ถ้าต้องการอัปโหลดให้ monitoring เท่านั้น)
  build: {
    sourcemap: false,
    minify: "esbuild",
    cssCodeSplit: true,
  },
});
