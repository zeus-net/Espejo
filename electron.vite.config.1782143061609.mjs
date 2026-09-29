// electron.vite.config.mjs
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [react()],
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
        supported: {
          "top-level-await": true
        }
      }
    },
    build: {
      target: "esnext"
    }
  }
});
export {
  electron_vite_config_default as default
};
