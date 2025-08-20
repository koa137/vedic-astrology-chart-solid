import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
    open: true,
  },
  esbuild: {
    jsx: "preserve",
    jsxImportSource: "solid-js",
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "VedicAstrologyChartSolid",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "esm" : format}.js`,
    },
    rollupOptions: {
      external: ["solid-js"],
      output: {
        globals: {
          "solid-js": "SolidJS",
        },
      },
    },
  },
});
