import { defineConfig } from 'vitest/config';

/**
 * Unit and component test projects for the whole workspace.
 *
 * Note on file naming: the pinned runner is Vitest 4, which removed support for
 * a separate `vitest.workspace.*` file - a `workspace` key now throws - so the
 * project list lives here under `test.projects`, which is the supported
 * equivalent. Behaviour is unchanged: one project per workspace, each with the
 * environment its code actually needs.
 *
 * Integration tests are deliberately absent from this list. They need a real
 * database and are run through `pnpm --filter @relay/api run test:integration`,
 * so the default test task stays fast.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'shared',
          root: './packages/shared',
          environment: 'node',
          include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'db',
          root: './packages/db',
          environment: 'node',
          include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'ui',
          root: './packages/ui',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        test: {
          name: 'api',
          root: './apps/api',
          environment: 'node',
          include: ['src/**/*.test.ts', 'test/unit/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'web',
          root: './apps/web',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        test: {
          name: 'measure-frames',
          root: './tools/measure-frames',
          environment: 'node',
          include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'check-brand',
          root: './tools/check-brand',
          environment: 'node',
          include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'check-corpus',
          root: './tools/check-corpus',
          environment: 'node',
          include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'ac-manifest',
          root: './tools/ac-manifest',
          environment: 'node',
          include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
        },
      },
    ],
  },
});
