import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(
  new (globalThis.URL || require('url').URL)('.', import.meta.url)
);

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VedicAstrologyChartSolid',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
      // Keep 1.x's stylesheet name for consumers importing dist/style.css.
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['solid-js', '@solidjs/web'],
      output: {
        globals: {
          'solid-js': 'SolidJS',
          '@solidjs/web': 'SolidJSWeb',
        },
      },
    },
  },
});
