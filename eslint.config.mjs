// Flat ESLint config for `yarn lint` (`eslint .`). Next.js 16 removed `next lint`,
// so this file is the lint entry point; eslint-config-next 16 ships flat configs.
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  globalIgnores([
    '.next/**',
    '.build/**',
    '.vinext/**',
    '.wrangler/**',
    '.yarn/**',
    'node_modules/**',
    'dist/**',
    'out/**',
    'build/**',
    'x. COPY Phynyx_Pro_Rebranding_Strategy/**',
    'next-env.d.ts',
  ]),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
]);
