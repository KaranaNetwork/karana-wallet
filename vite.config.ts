import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          metamask: ['@metamask/eth-sig-util'],
          opentelemetry: [
            '@opentelemetry/api',
            '@opentelemetry/context-zone',
            '@opentelemetry/exporter-trace-otlp-http',
            '@opentelemetry/exporter-trace-otlp-proto',
            '@opentelemetry/instrumentation-document-load',
            '@opentelemetry/instrumentation-xml-http-request',
            '@opentelemetry/propagator-b3',
            '@opentelemetry/sdk-trace-base',
            '@opentelemetry/sdk-trace-web',
          ],
          polkadot: ['@polkadot/api', '@polkadot/util-crypto'],
          lodash: ['lodash'],
          axios: ['axios'],
          vue: ['vue', 'vue-class-component'],
          'vue-picture-cropper': ['vue-picture-cropper'],
          'vue-router': ['vue-router'],
          'ant-design-vue': ['ant-design-vue'],
          bech32: ['bech32'],
          'bitcoinjs-lib': ['bitcoinjs-lib'],
          'core-js': ['core-js'],
          'decimal.js': ['decimal.js'],
          'tiny-secp256k1': ['tiny-secp256k1'],
          web3: ['web3'],
        },
      },
    },
  },
  plugins: [
    wasm(),
    topLevelAwait(),
    vue(),
    nodePolyfills(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
