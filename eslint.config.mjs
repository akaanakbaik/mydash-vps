import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: [
          '*.config.ts',
          '*.config.mjs',
          '*.config.js',
          '**/*.config.ts',
          '**/*.config.mjs',
          '**/*.config.js',
        ],
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/coverage/**',
      'docs/**',
      'eslint.config.mjs',
      '**/*.config.ts',
      '**/*.config.mjs',
      '**/*.config.js',
    ],
  },
);
