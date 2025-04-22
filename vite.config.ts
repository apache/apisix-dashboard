import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import postcssPresetMantine from 'postcss-preset-mantine';
import postcssSimpleVars from 'postcss-simple-vars';

// https://vite.dev/config/
export default defineConfig({
  base: '/ui',
  plugins: [
    tsconfigPaths(),
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  css: {
    postcss: {
      plugins: [
        postcssPresetMantine,
        postcssSimpleVars({
          variables: {
            'mantine-breakpoint-xs': '36em',
            'mantine-breakpoint-sm': '48em',
            'mantine-breakpoint-md': '62em',
            'mantine-breakpoint-lg': '75em',
            'mantine-breakpoint-xl': '88em',
          },
        }),
      ],
    },
  },
});
