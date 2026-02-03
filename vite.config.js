import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  build: {
    // 1. Minify using 'terser' for smaller file size
    // ⚠️ Important: Run "npm install -D terser" if this fails
    minify: "terser",

    rollupOptions: {
      output: {
        // 2. The Secret Sauce: Split code into separate files
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "gsap-vendor": ["gsap", "@gsap/react"],
          icons: ["lucide-react"],
          // Firebase is heavy, so we isolate it
          "firebase-vendor": [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/storage",
          ],
        },
      },
    },
  },
});
