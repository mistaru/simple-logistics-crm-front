import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Fonts from 'unplugin-fonts/vite';
import Layouts from 'vite-plugin-vue-layouts';
import Vue from '@vitejs/plugin-vue';
// import VueRouter from 'unplugin-vue-router/vite';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
// const toKebabCase = (str: string) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
export default defineConfig({
  base: '/',
  plugins: [
    // VueRouter({
    //   dts: 'src/typed-router.d.ts',
    //   resolvePath(route) {
    //     return toKebabCase(route.path);
    //   },
    // }),
    Layouts(),
    AutoImport({
      imports: [
        'vue',

        {
          'vue-router/auto': ['useRoute', 'useRouter'],
        },
        {
          from: 'vue-router',
          imports: ['RouteLocationNormalized'],
          type: true,
        },
        {
          '@/utils/index.ts': ['fetchData', 'getDate', 'fetchData', 'getDate', 'getErrorMessage', 'getPeriods'],
        },
        {
          '@/axios/index.ts': [['default','axiosIns']],
        },
        {
          '@/const/index.ts': [
            'COLORS',
            'MONTHS',
          ],
        },
        {
          '@/utils/rules.ts': [['default','rules']],
        },
        {
          '@/stores/app.ts': ['useAppStore'],
        },
        {
          '@/stores/bids-store.ts': ['useBidsStore'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
      dirs: [
        './utils/**',
        './axios/**',
        './const/**',
      ],
    }),
    Components({
      dts: 'src/components.d.ts',
    }),
    Vue({
      template: { transformAssetUrls },
    }),
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Fonts({
      google: {
        families: [ {
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 8080,
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
});
