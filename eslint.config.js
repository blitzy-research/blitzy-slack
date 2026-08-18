/**
 * Flat ESLint configuration for the whole workspace.
 *
 * The root package is CommonJS, so this file uses `require`.
 *
 * The load-bearing part of this file is the import-boundary block. The project
 * rule "each shared contract is implemented exactly once" is only enforceable
 * mechanically, and this is the mechanism: deep imports into another
 * workspace's `src` tree fail the build, so a consumer cannot reach past a
 * package barrel and cannot quietly grow a local copy of a shared contract.
 */
const tseslint = require('typescript-eslint');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const reactHooks = require('eslint-plugin-react-hooks');

/** Paths that are read-only inputs or generated output: never linted. */
const IGNORES = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.turbo/**',
  '**/playwright-report/**',
  '**/test-results/**',
  '**/*.d.ts',
  'screenshots/**',
  'docs/**',
  'blitzy/**',
  'packages/db/prisma/migrations/**',
  'tools/measure-frames/out/**',
];

/** Deep-import boundary: consumers use the package barrel, nothing else. */
const IMPORT_BOUNDARY = {
  patterns: [
    {
      group: ['@relay/*/src', '@relay/*/src/**'],
      message:
        'Deep imports are forbidden. Import from the package barrel (e.g. "@relay/ui"), so each shared contract has exactly one entry point.',
    },
    {
      group: ['**/packages/ui/src/**', '**/packages/shared/src/**', '**/packages/db/src/**'],
      message:
        'Reach another workspace through its package name, never through a relative path into its source tree.',
    },
    {
      group: ['../../apps/**', '../../../apps/**'],
      message: 'Applications are leaves of the dependency graph: they are never imported.',
    },
  ],
};

module.exports = tseslint.config(
  { ignores: IGNORES },

  // TypeScript baseline for every source file in the workspace.
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-restricted-imports': ['error', IMPORT_BOUNDARY],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // Client-side code: accessibility and hook correctness are checked at authoring time.
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y, 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...(jsxA11y.flatConfigs?.recommended?.rules ?? {}),
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // Command-line tooling legitimately writes to stdout.
  {
    files: ['tools/**/*.ts', 'packages/db/prisma/**/*.ts'],
    rules: { 'no-console': 'off' },
  },

  // Tests may assert on internals and use non-null assertions.
  {
    files: ['**/*.{test,spec,bench}.{ts,tsx}', 'e2e/**/*.ts', '**/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },

  // Configuration files at the root of a workspace are plain Node scripts.
  {
    files: ['*.js', '*.cjs', '**/*.config.{js,cjs}'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
);
