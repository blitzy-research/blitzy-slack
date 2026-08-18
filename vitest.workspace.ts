/**
 * Fast test-project aggregation for the whole workspace.
 *
 * This is the single place the repository's fast test projects are declared.
 * `pnpm test` loads this file, and nothing else declares a project list -- the
 * auto-discovery shim beside it re-exports this configuration rather than
 * restating it.
 *
 * ---------------------------------------------------------------------------
 * WHY THE FILENAME IS THIS AND THE CONTENT IS AN ORDINARY CONFIGURATION
 * ---------------------------------------------------------------------------
 * The path is mandated and must not be renamed or moved. The historical
 * meaning of a `*.workspace.*` file -- a standalone manifest the runner
 * discovers by name on its own -- no longer exists in the pinned runner
 * (4.1.10). That was established against the installed package rather than
 * assumed, on four independent points:
 *
 *   1. `vitest/config` no longer exports `defineWorkspace`. Importing it fails
 *      at load time with "does not provide an export named 'defineWorkspace'".
 *   2. The literal string `vitest.workspace` occurs nowhere in the shipped code
 *      of either the test runner or the bundler underneath it, so no discovery
 *      path can look for this name. The only configuration filenames either one
 *      searches for are `vite.config.*` and `vitest.config.*`.
 *   3. A top-level `test.workspace` key is a hard startup error: the runner
 *      reports that the option was removed and names `test.projects` as its
 *      replacement.
 *   4. Placing this file at the root and running the bare runner ignores it
 *      entirely and falls back to default file discovery.
 *
 * So the mandated filename is kept and the content is an ordinary
 * configuration whose `test.projects` holds the project list. It is loaded
 * explicitly, which is what the root `test` script does:
 *
 *     vitest run --config vitest.workspace.ts
 *
 * That invocation was verified to load this file, to print every project name
 * in the run output, and to exit non-zero when nothing is collected. The
 * `--config` flag is therefore load-bearing: a configuration file that exists
 * but is never read is a silent gate failure, and a silent gate failure is the
 * one outcome this project forbids. If the flag is ever dropped from the root
 * script, this file stops being read and the whole fast suite disappears
 * without a single failing check.
 *
 * ---------------------------------------------------------------------------
 * WHICH OPTIONS LIVE AT THE ROOT AND WHICH LIVE ON A PROJECT
 * ---------------------------------------------------------------------------
 * The runner's own types settle this: a project's configuration is the full
 * option set minus a fixed list of root-only options. `coverage`, `reporters`,
 * `outputFile` and `passWithNoTests` are all on that list, so they are
 * configured once at the root below and cannot legally be repeated inside a
 * project. That is a welcome structural guarantee rather than a limitation --
 * under the strict compiler settings this repository uses, misplacing one of
 * them is a compile error rather than a silently ignored key.
 *
 * Everything a project genuinely owns -- its name, its root, its environment,
 * its file globs, its setup files and its module resolution -- is declared
 * explicitly on that project. Projects are not given `extends`, so nothing is
 * inherited implicitly and each entry below can be read in isolation.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE CHECKS THAT EVERY PROJECT MATCHED SOMETHING
 * ---------------------------------------------------------------------------
 * `passWithNoTests` is switched off below, but on its own that is not enough,
 * and the gap was found by testing rather than by reading. The runner treats
 * "no tests" as a property of the whole run: it fails only when *every* project
 * collected nothing. Pointing one project at a directory that does not exist
 * while the others still had tests produced a green run -- the empty project
 * simply vanished from the output and the exit status stayed zero.
 *
 * That is the exact way an entire suite disappears unnoticed: rename a
 * directory, mistype a glob, or move a package, and the tests that used to
 * guard a surface stop running while every check still reports success. The
 * criteria those tests carried would then look satisfied with nothing behind
 * them.
 *
 * The runner offers no per-project equivalent, so the check is made here, at
 * configuration load: each declared project's globs are resolved against the
 * files actually on disk, and a project that matches nothing aborts the run
 * before a single test executes, naming itself. There is deliberately no
 * environment variable to switch this off, because an escape hatch is just the
 * silent skip again with an extra step.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DELIBERATELY NOT HERE
 * ---------------------------------------------------------------------------
 * Three suites are deliberately absent from this fast set. Each is excluded
 * because something else owns it, never because it is optional work:
 *
 *   - The API integration suite (`apps/api/test/integration/**`) runs against a
 *     real PostgreSQL instance started in a container. It is owned by the
 *     `test:integration` script, which exists both at the workspace root and on
 *     the API package, and by a dedicated task in the task-graph configuration
 *     that passes the container runtime's environment through.
 *   - The browser-driven end-to-end suite under `e2e/` uses a different runner
 *     entirely and is owned by the `test:e2e` and `test:a11y` scripts.
 *   - The bulk-data pagination benchmark (`apps/api/test/bench/*.bench.ts`) is
 *     authored and runnable but is held outside the default gate so that this
 *     set stays fast. It is owned by the `bench` script on the API package and
 *     its own task in the task-graph configuration.
 *
 * Excluding them keeps this set free of containers and browsers, which is the
 * entire point of a fast set. It does not reduce what must be verified. In
 * particular the server-side authorization work -- proving that a non-member
 * and a wrong-role caller are refused, that one workspace cannot read
 * another's rows, and that a private resource is absent from every projection
 * -- belongs to the integration suite, because those facts are only worth
 * asserting against a real server and a real database. Restating them here
 * against a mocked client would prove nothing, so they are not pulled forward.
 *
 * ---------------------------------------------------------------------------
 * READ-ONLY INPUT TREES
 * ---------------------------------------------------------------------------
 * The repository carries large read-only input trees -- a screenshot corpus, a
 * specification catalog and a vendor documentation folder. No glob in this file
 * names any of them, and none can reach them: every project is rooted inside
 * `apps/`, `packages/` or `tools/`, and the coverage globs are likewise scoped
 * to source directories under those three trees. The containment is structural,
 * so it cannot be defeated by adding a file. In particular the frame-measuring
 * tool's tests run against synthetic fixtures generated in-process; nothing in
 * this configuration gives them a path into the corpus.
 */
import { type Dirent, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { type TestProjectConfiguration, defaultExclude, defineConfig } from 'vitest/config';

/** Absolute path of the workspace root, used to build alias targets. */
const WORKSPACE_ROOT = import.meta.dirname;

/**
 * Whether this run is happening in continuous integration.
 *
 * Read defensively rather than as a bare truthiness check: an explicitly
 * disabled flag should not switch on the CI reporters. `CI` is declared in the
 * task graph's global environment, so consulting it here does not widen the set
 * of variables the build depends on. Bracket access is required because the
 * environment is an index signature under this repository's compiler settings.
 */
const CI_FLAG = process.env['CI'];
const IS_CI = CI_FLAG !== undefined && CI_FLAG !== '' && CI_FLAG !== 'false';

/**
 * Module aliases mirroring the `paths` entries in `tsconfig.base.json`.
 *
 * These are not a convenience. The root `test` script invokes the runner
 * directly instead of going through the task graph, so it does not inherit the
 * `dependsOn: ["^build"]` ordering that would otherwise compile the internal
 * packages first. Two of the three internal packages publish only their build
 * output, so without these aliases a test importing one of them would fail to
 * resolve on a clean clone. Pointing each package specifier at its source entry
 * makes the fast set build-free, and keeping the targets identical to the
 * compiler's `paths` means the runner and the type checker resolve the same
 * files.
 *
 * Targets are absolute so that they are correct from every project root.
 */
const WORKSPACE_ALIASES = {
  '@relay/shared': resolve(WORKSPACE_ROOT, 'packages/shared/src/index.ts'),
  '@relay/db': resolve(WORKSPACE_ROOT, 'packages/db/src/index.ts'),
  '@relay/ui': resolve(WORKSPACE_ROOT, 'packages/ui/src/index.ts'),
};

/**
 * Exclusions applied to every project in the fast set.
 *
 * The project globs below are already narrow enough that none of them can reach
 * the container-backed, browser-driven or benchmark suites. These exclusions are
 * stated anyway, and stated on every project, so that a file added later cannot
 * drift into the fast set on the strength of its location alone.
 *
 * `defaultExclude` is spread in first because a project-level `exclude`
 * replaces the runner's default rather than extending it, and that default is
 * only two entries wide -- dependency directories and version-control metadata.
 * Dropping it would send every project walking through `node_modules`.
 *
 * The globs are written with a leading `**` so that they hold whatever root a
 * project is given.
 */
const FAST_SET_EXCLUDE = [
  ...defaultExclude,
  // Owned by the `test:integration` script and its own task; needs a database.
  '**/test/integration/**',
  // Owned by the `test:e2e` and `test:a11y` scripts; needs a browser.
  '**/e2e/**',
  // Owned by the `bench` script and its own task; deliberately outside the gate.
  '**/test/bench/**',
  '**/*.bench.ts',
  // Build output and coverage artifacts are never test sources.
  '**/dist/**',
  '**/coverage/**',
];

/**
 * Test globals are left switched off on purpose.
 *
 * Enabling them would make bare `describe`/`it`/`expect` work at run time while
 * still failing the type check, because the base compiler configuration does
 * not register the runner's global type declarations. Leaving them off makes
 * one style -- importing from the runner explicitly -- the style that both
 * type-checks and runs, so the two checks agree instead of contradicting each
 * other.
 */
const USE_TEST_GLOBALS = false;

/**
 * Directories the on-disk scan never descends into.
 *
 * Every one of these is either excluded from collection anyway or contains no
 * test sources, so skipping them keeps the scan proportional to the amount of
 * hand-written code rather than to the size of the installed dependency tree.
 */
const SCAN_SKIP_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.vite',
]);

/**
 * Lists every file beneath `absoluteDirectory`, as paths relative to the
 * directory the scan started from, so the results can be matched against the
 * project-relative globs the runner itself uses.
 *
 * A directory that cannot be read is treated as empty rather than fatal: a
 * project whose root does not exist yet is precisely the condition the caller
 * is looking for, and it reports that far more usefully than a raw filesystem
 * error would.
 */
function collectRelativeFiles(
  absoluteDirectory: string,
  relativePrefix: string,
  found: string[],
): void {
  let entries: Dirent[];
  try {
    entries = readdirSync(absoluteDirectory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const relativePath = relativePrefix === '' ? entry.name : `${relativePrefix}/${entry.name}`;

    if (entry.isDirectory()) {
      if (SCAN_SKIP_DIRECTORIES.has(entry.name)) continue;
      collectRelativeFiles(join(absoluteDirectory, entry.name), relativePath, found);
    } else if (entry.isFile()) {
      found.push(relativePath);
    }
  }
}

/**
 * Translates one glob into an anchored regular expression.
 *
 * Only the syntax this file actually uses is supported, which is the whole
 * point -- a general glob implementation would be a dependency and a second
 * behaviour to keep in step with the runner's. The supported forms are a
 * path-crossing `**`, a segment-local `*` and `?`, and a brace alternation of
 * literals such as `{ts,tsx}`. Everything else is matched literally.
 */
function globToRegExp(pattern: string): RegExp {
  const escapeLiteral = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let source = '';
  let index = 0;

  while (index < pattern.length) {
    // `**/` spans zero or more whole path segments, so `**/a` also matches `a`.
    if (pattern.startsWith('**/', index)) {
      source += '(?:[^/]+/)*';
      index += 3;
      continue;
    }
    // A trailing `**` spans the rest of the path, separators included.
    if (pattern.startsWith('**', index)) {
      source += '.*';
      index += 2;
      continue;
    }

    const character = pattern.charAt(index);

    if (character === '*') {
      source += '[^/]*';
      index += 1;
      continue;
    }
    if (character === '?') {
      source += '[^/]';
      index += 1;
      continue;
    }
    if (character === '{') {
      const close = pattern.indexOf('}', index);
      if (close !== -1) {
        const alternatives = pattern.slice(index + 1, close).split(',');
        source += `(?:${alternatives.map(escapeLiteral).join('|')})`;
        index = close + 1;
        continue;
      }
    }

    source += escapeLiteral(character);
    index += 1;
  }

  return new RegExp(`^${source}$`);
}

/** The shape this file's own guard needs from each declared project. */
interface DeclaredProject {
  readonly test: {
    readonly name: string;
    readonly root: string;
    readonly include: readonly string[];
    readonly exclude: readonly string[];
  };
}

/**
 * Aborts the run when any declared project matches no test file on disk.
 *
 * See the header note for why this exists: the runner only fails a run in which
 * *every* project is empty, so without this a single mistyped glob or a moved
 * directory silently removes a whole project from the suite while the run still
 * reports success.
 *
 * The check is on the state of the repository, not on whichever projects a
 * particular invocation happens to filter down to with `--project`. A project
 * with no tests is a defect wherever it is noticed, and reporting it on every
 * route is what stops it from surviving unnoticed on the route nobody watches.
 */
function assertEveryProjectMatchesTestFiles(projects: readonly DeclaredProject[]): void {
  const empty: DeclaredProject['test'][] = [];

  for (const project of projects) {
    const files: string[] = [];
    collectRelativeFiles(resolve(WORKSPACE_ROOT, project.test.root), '', files);

    const includePatterns = project.test.include.map(globToRegExp);
    const excludePatterns = project.test.exclude.map(globToRegExp);

    const hasTestFile = files.some(
      (file) =>
        includePatterns.some((pattern) => pattern.test(file)) &&
        !excludePatterns.some((pattern) => pattern.test(file)),
    );

    if (!hasTestFile) empty.push(project.test);
  }

  if (empty.length === 0) return;

  const detail = empty
    .map(
      (project) =>
        `  - ${project.name}: root ${project.root}, include ${project.include.join(', ')}`,
    )
    .join('\n');

  throw new Error(
    `vitest.workspace.ts declares ${String(empty.length)} test project(s) that match no test ` +
      `file:\n${detail}\n\n` +
      'Every declared project must match at least one test file. The runner only fails a run ' +
      'in which every project is empty, so an individual empty project would otherwise be ' +
      'skipped in silence and the criteria it was meant to cover would look satisfied with ' +
      'nothing behind them.\n\n' +
      'Add the missing tests, or remove the project from vitest.workspace.ts.',
  );
}

/**
 * The fast test projects.
 *
 * Declared as a named value rather than inline so that the guard above and the
 * exported configuration below read the same list. Two copies of a project list
 * is precisely the drift this file exists to remove.
 *
 * `satisfies` rather than a type annotation: it checks every entry against the
 * runner's own project type while keeping the precise literal shape, which is
 * what lets the guard read each project's name, root and globs.
 */
const FAST_SET_PROJECTS = [
  /**
   * api-unit -- unit tests for the server application.
   *
   * Rooted at the API package so that its own dependencies and package metadata
   * resolve. Both the dedicated unit directory and co-located sources are
   * collected, which is a superset of the dedicated directory alone and
   * therefore cannot skip a unit test somebody chose to put beside the code it
   * covers. Neither glob can reach the sibling integration or benchmark
   * directories, and both are excluded again explicitly.
   */
  {
    test: {
      name: 'api-unit',
      root: './apps/api',
      environment: 'node',
      globals: USE_TEST_GLOBALS,
      include: ['test/unit/**/*.test.ts', 'src/**/*.test.ts'],
      exclude: [...FAST_SET_EXCLUDE, 'test/integration/**', 'test/bench/**'],
    },
    resolve: { alias: WORKSPACE_ALIASES },
  },

  /**
   * ui-components -- the shared component library's own tests.
   *
   * Every component contract is implemented exactly once, in this package, so
   * exactly one place holds its tests: the co-located test beside the contract
   * module. This project points at that directory and nowhere else. There is
   * deliberately no second component project rooted in the client application:
   * a component test living there would imply a second implementation of a
   * contract, which is what the single-implementation rule forbids. When a
   * variant is added to a shared component its co-located test is updated in
   * place, and this project is what runs it.
   *
   * Both test extensions are collected within that one directory so that a
   * contract's non-rendering tests are not skipped for want of an `x`.
   *
   * The browser-like environment is required for rendering. The matcher package
   * exposes a runner-specific entry point that registers the custom DOM
   * matchers on import, so it is listed directly as a setup file -- no
   * additional setup module is introduced. It resolves from this project's root,
   * which is where that package is declared as a dependency.
   *
   * Stylesheets are left unprocessed. Component modules import CSS modules for
   * their class names, and the runner substitutes a deterministic stand-in when
   * style processing is off, which is both faster and stable to assert against.
   */
  {
    test: {
      name: 'ui-components',
      root: './packages/ui',
      environment: 'jsdom',
      globals: USE_TEST_GLOBALS,
      css: false,
      setupFiles: ['@testing-library/jest-dom/vitest'],
      include: ['src/components/**/*.test.{ts,tsx}'],
      exclude: [...FAST_SET_EXCLUDE],
    },
    resolve: { alias: WORKSPACE_ALIASES },
  },

  /**
   * db -- the data package's tests, including the proof that the
   * workspace-isolation extension cannot be bypassed.
   *
   * The whole test directory is collected rather than only its top level, so a
   * test filed in a subdirectory still runs.
   */
  {
    test: {
      name: 'db',
      root: './packages/db',
      environment: 'node',
      globals: USE_TEST_GLOBALS,
      include: ['test/**/*.test.ts'],
      exclude: [...FAST_SET_EXCLUDE],
    },
    resolve: { alias: WORKSPACE_ALIASES },
  },

  /**
   * shared -- the contract package's own tests: schema definitions, the
   * pagination cursor codec and the absolute-timestamp helpers.
   *
   * Both layouts are collected because this package's units are small and
   * naturally tested beside the module they cover, while broader suites sit in a
   * test directory. Collecting both is a superset of either, so no test in this
   * package can be missed.
   */
  {
    test: {
      name: 'shared',
      root: './packages/shared',
      environment: 'node',
      globals: USE_TEST_GLOBALS,
      include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
      exclude: [...FAST_SET_EXCLUDE],
    },
    resolve: { alias: WORKSPACE_ALIASES },
  },

  /**
   * measure-frames -- detector unit tests for the frame-measuring tool.
   *
   * These exercise the boundary, pitch and bounding-box detectors against
   * synthetic images built in the test itself. They must never read the
   * read-only frame corpus: reading one would be an unlogged access to it, and
   * a detector proved against a generated fixture of known geometry is a
   * stronger test anyway, because the expected answer is known exactly. Nothing
   * in this project's configuration exposes a path outside the tool's own
   * directory.
   *
   * This project is the reason the fast set is declared centrally at all. The
   * task graph derives its test work from per-package scripts, and the tool
   * packages have none, so under that route these tests would never run --
   * present, passing nothing, failing nothing. Declaring them here is what
   * closes that gap.
   */
  {
    test: {
      name: 'measure-frames',
      root: './tools/measure-frames',
      environment: 'node',
      globals: USE_TEST_GLOBALS,
      include: ['test/**/*.test.ts'],
      exclude: [...FAST_SET_EXCLUDE],
    },
    resolve: { alias: WORKSPACE_ALIASES },
  },
] satisfies TestProjectConfiguration[];

assertEveryProjectMatchesTestFiles(FAST_SET_PROJECTS);

export default defineConfig({
  test: {
    /**
     * A run that collects nothing must fail.
     *
     * This is a root-only option, so this single line governs every project. It
     * is set explicitly rather than left to the default so that the intent
     * survives a future change of default. It is necessary but not sufficient
     * on its own, which is why the per-project guard above exists as well.
     */
    passWithNoTests: false,

    /**
     * Reporters. The human-readable reporter is always on; the machine-readable
     * ones are added in continuous integration so a pipeline can consume the
     * result rather than scrape console output. The JUnit destination is always
     * configured because it is inert unless that reporter is active, which keeps
     * the conditional to a single expression.
     */
    reporters: IS_CI ? ['default', 'junit', 'github-actions'] : ['default'],
    outputFile: { junit: './test-results/vitest-junit.xml' },

    /**
     * Coverage. Root-only, so the API application's target is expressed here
     * rather than on the `api-unit` project.
     *
     * Left disabled by default so that a plain run stays fast; the `--coverage`
     * flag switches it on. `include` is listed explicitly so that a source file
     * with no test at all is reported at zero rather than omitted from the
     * denominator -- otherwise a coverage percentage measures only the files
     * somebody remembered to test.
     *
     * The threshold is keyed to the API application's source glob, which is
     * where the eighty-percent-of-lines target applies. Keying it to a glob
     * rather than setting a global threshold means the other packages are
     * measured and reported without gating the run on numbers that were never
     * agreed for them.
     */
    coverage: {
      provider: 'v8',
      enabled: false,
      reporter: ['text', 'lcov', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: [
        'apps/api/src/**/*.ts',
        'packages/shared/src/**/*.ts',
        'packages/db/src/**/*.ts',
        'packages/ui/src/**/*.{ts,tsx}',
        'tools/measure-frames/src/**/*.ts',
      ],
      exclude: [
        // Test and benchmark sources are not subjects of measurement.
        '**/*.test.{ts,tsx}',
        '**/*.bench.ts',
        // Declaration-only modules emit no executable statements.
        '**/*.d.ts',
        '**/types.ts',
        'packages/shared/src/types/**',
      ],
      thresholds: {
        'apps/api/src/**/*.ts': { lines: 80 },
      },
    },

    projects: FAST_SET_PROJECTS,
  },
});
