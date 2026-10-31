import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  if (env.VITE_ADMOB_PRODUCTION === 'true' && !/^ca-app-pub-\d{16}\/\d{10}$/.test(env.VITE_REWARDED_UNIT_ID ?? env.REWARDED_UNIT_ID ?? '')) throw new Error('Configure REWARDED_UNIT_ID before production build');
  return { base: './', define: { 'import.meta.env.VITE_REWARDED_UNIT_ID': JSON.stringify(env.VITE_REWARDED_UNIT_ID ?? env.REWARDED_UNIT_ID ?? '') }, test: { include: ['src/**/*.test.ts'] } };
});
