import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/vite.config.*',
      'types/**/*.d.ts',
      '**/dist',
      '**/setupTests.ts',
      '**/.eslintrc.cjs',
    ],
  },
  ...compat.extends('@eweser/eslint-config-react-ts'),
];
