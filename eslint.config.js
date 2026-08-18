/**
 * Flat ESLint configuration for the whole workspace.
 *
 * WHY THIS FILE CARRIES MORE WEIGHT THAN A LINT CONFIG NORMALLY DOES
 *
 * The design system here is first-party. Ninety-nine component contracts are
 * specified in prose in the read-only catalog, thirty-seven of them are
 * implemented in `packages/ui` for this phase, and there is no upstream library
 * anywhere in the dependency graph to keep those contracts honest. The project
 * rule "each contract is implemented exactly once" therefore has exactly one
 * mechanical enforcement point, and it is the import-boundary block below.
 * Without it, a second copy of a contract is a review comment somebody might
 * make; with it, a second copy is a failed build.
 *
 * Four restrictions carry that weight, and each closes a documented failure
 * mode rather than expressing a preference:
 *
 *   1. Barrel-only consumption. A consumer reaches an internal package through
 *      its package name and the sub-entries that package's own manifest
 *      declares, never through a path into its source tree. A deep import is
 *      how a single contract quietly acquires two entry points.
 *   2. No local equivalents. `apps/web` composes the library; it never
 *      re-declares any part of it, and it owns no component-level stylesheet.
 *   3. System components over raw markup. A raw interactive element inside a
 *      feature or route is a contract being re-implemented in miniature. The
 *      same element inside `packages/ui` is the contract being implemented, so
 *      the restriction is scoped to the consumer and never to the owner.
 *   4. Colour literals in exactly one file. Colour resolves to a token; the
 *      token module is the only place a colour value may be written down.
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT DO
 *
 *   - It does not police third-party identity. A rule that searched for a
 *     prohibited product name would have to spell that name in this file, which
 *     is authored source and therefore the one place it must not appear. That
 *     check lives in `tools/check-brand`, which assembles its pattern without a
 *     literal occurrence, and runs as its own pipeline step.
 *   - It does not carry stylistic rules. Prettier owns layout; this file owns
 *     correctness and structure, and the two do not overlap.
 *   - It does not lint the read-only inputs. The screenshot corpus, the
 *     workflow catalog and the vendor documentation folder are inputs, not
 *     source, and the ignore list below is what keeps them out of the file set.
 *
 * SEVERITY POLICY
 *
 * Nothing in this file is a warning. The root script is `eslint .` with no
 * `--max-warnings` bound, so a warning cannot fail a build and a rule that
 * cannot fail a build is not enforcing anything. Every rule here is therefore
 * an error, or is off for a reason stated at the point it is switched off.
 *
 * FORMAT
 *
 * The root package declares `"type": "module"`, so this `.js` file is an ES
 * module and uses `import` / `export default`. Prettier's own configuration
 * keeps the `.cjs` extension because it stays a CommonJS script.
 */
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

/** Absolute root every project path in this file is resolved against. */
const ROOT = import.meta.dirname;

/**
 * The one TypeScript configuration that owns every source file under the root.
 * It declares no `include`, so its file set is "everything not excluded", which
 * is what makes it usable both as the default project for the handful of
 * standalone scripts at the root and as an explicit project for the test trees
 * a workspace configuration deliberately leaves out of its own build.
 */
const BASE_TSCONFIG = 'tsconfig.base.json';

/**
 * Paths that are read-only inputs, generated output, or committed evidence
 * rather than lintable source.
 *
 * The first three entries after the tooling caches are mandatory and are the
 * reason this block exists at all. `screenshots/` holds 1,022 frames that must
 * stay byte-identical and must never be walked; `docs/` holds the read-only
 * catalog; `blitzy/` holds the vendor documentation folder. Letting the corpus
 * into the file set would not merely be wrong, it would be slow enough to look
 * like a hang.
 *
 * `tools/measure-frames/out/` is excluded for a different reason: it holds the
 * committed raw measurement records that prove the design tokens were extracted
 * rather than estimated. That is evidence, and rewriting evidence to satisfy a
 * linter would defeat its purpose.
 */
const IGNORES = [
  // Dependencies and build output.
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.d.ts',

  // Tool and task-runner caches.
  '**/.turbo/**',
  '**/.vite/**',
  '**/.eslintcache',

  // Test and coverage artifacts.
  '**/coverage/**',
  '**/playwright-report/**',
  '**/test-results/**',
  '**/blob-report/**',

  // Generated database client and checked-in migration SQL.
  '**/.prisma/**',
  '**/generated/prisma/**',
  'packages/db/prisma/migrations/**',

  // Lockfile: machine-generated, and not source in any sense.
  'pnpm-lock.yaml',

  // Read-only inputs. Never linted, never written to, never enumerated.
  'screenshots/**',
  'docs/**',
  'blitzy/**',

  // Committed measurement evidence, not lintable source.
  'tools/measure-frames/out/**',
];

/**
 * Internal package names, and the sub-entries each package's own manifest
 * declares under `exports`.
 *
 * This is the whole of restriction 1's vocabulary, and it is derived from the
 * manifests rather than guessed: `@relay/ui` declares its barrel plus four
 * stylesheet sub-entries, and `@relay/shared` and `@relay/db` declare their
 * barrel and nothing else. Anything a manifest does not declare is not a public
 * entry point, so importing it reaches past the package's own contract.
 *
 * When a package adds a sub-entry to its `exports`, the corresponding pattern
 * here is what makes that entry reachable. The two move together on purpose:
 * a package cannot acquire a second entry point without saying so in its
 * manifest, and a consumer cannot invent one.
 */
const UI_PACKAGE_STYLE_ENTRIES = ['tokens.module', 'reset', 'theme-light', 'theme-dark'];

/**
 * RESTRICTION 1 — barrel-only consumption of internal packages.
 *
 * Expressed with `regex` rather than with a `group` of gitignore-style globs
 * for a concrete reason: a `!` negation inside a `group` array does not exempt
 * the negated specifier, so the four declared stylesheet entries would be
 * rejected alongside the deep paths they have nothing in common with. A regex
 * with a negative lookahead states the rule exactly — everything under the
 * package is closed except the entries the manifest opens.
 *
 * The patterns carry no autofix. That is deliberate: the only mechanical
 * "repair" available to an import restriction is to rewrite the specifier, and
 * rewriting a barrel import into a deep one is the defect, not the cure.
 */
const BARREL_ONLY_IMPORTS = {
  patterns: [
    {
      regex: `^@relay/ui/(?!styles/(?:${UI_PACKAGE_STYLE_ENTRIES.join('|')})\\.css$).+$`,
      message:
        'The component library has one entry point. Import the contract from the package barrel "@relay/ui"; the only deep specifiers it opens are the four stylesheets its manifest declares under exports. A path into its source tree gives one contract two entry points, which is how a second copy of that contract starts.',
    },
    {
      regex: '^@relay/(?:shared|db)/.+$',
      message:
        'Import from the package barrel "@relay/shared" or "@relay/db". Neither manifest declares a sub-entry, so a deeper specifier reaches past the package contract; if a value genuinely belongs in the public surface, export it from that package index.',
    },
    {
      // A relative specifier that climbs out of its own workspace and names
      // another one. Matched as a regex because these patterns are tested
      // against the specifier text rather than against a resolved path, so a
      // glob shaped like a directory tree would quietly match nothing.
      regex: '^(?:\\.\\./)+(?:packages|apps|tools|e2e)/',
      message:
        'Reach another workspace by its package name, never by a relative path that climbs out of this one. A relative escape bypasses the package boundary the workspace protocol exists to draw, and it survives no directory move.',
    },
    {
      // The workspace root sets `baseUrl`, so a specifier can name a package's
      // source tree from the repository root with no relative prefix at all.
      // Anchored so it stays disjoint from the pattern above: a climbing path is
      // reported once, as an escape, rather than twice under two headings.
      regex: '^packages/(?:ui|shared|db)/src(?:/|$)',
      message:
        'Import the package barrel — "@relay/ui", "@relay/shared" or "@relay/db" — rather than a path into its source tree. The barrel is the package contract; its source layout is not.',
    },
    {
      // Restriction 2, import half. Any specifier naming a `components` segment
      // from inside an application or the end-to-end suite is reaching for a
      // contract module that does not belong there. The definition half is
      // enforced separately, as a path-scoped block that errors on any file in
      // that directory.
      //
      // The leading exclusion keeps this disjoint from the package patterns
      // above: a scoped specifier is already reported by the pattern that owns
      // its package, so this one speaks only for paths inside the consumer.
      regex: '^(?!@)(?:.*/)?components/',
      message:
        'Contract modules live in packages/ui/src/components/<Contract>/ and are consumed through the "@relay/ui" barrel. A components directory inside an application or a feature is a local re-implementation of a contract that already exists, and a single required variant is not an exception — extend the shared contract and its tests instead.',
    },
  ],
};

/**
 * RESTRICTION 2, styling half — a feature or a route owns no stylesheet.
 *
 * Every rendered value resolves to a token and every element resolves to a
 * contract, so a component-level stylesheet beside a feature is either
 * restating what the contract already styles or styling something the contract
 * should own. The single stylesheet the client owns is its global sheet, which
 * consumes the token surface and declares no values of its own.
 */
const FEATURE_STYLESHEET_RESTRICTION = {
  patterns: [
    {
      regex: '\\.module\\.css$',
      message:
        'A feature or a route holds no styling of its own. Styling belongs to the contract module in packages/ui that owns the element; the only stylesheet this application owns is src/styles/global.css, which consumes the token surface and declares no values.',
    },
  ],
};

/**
 * RESTRICTION 3 — system components over raw markup, in the consumer only.
 *
 * Each entry names the contract that owns the control, because the component
 * inventory has no generic primitive to point at: there is no button contract,
 * no heading contract and no bare-field contract anywhere in the ninety-nine.
 * A control is therefore always owned by the structure it belongs to, and the
 * message says which structure that is.
 *
 * These restrictions apply to `apps/web` and to nothing else. Inside
 * `packages/ui` a raw element is the contract being implemented — that is
 * precisely where semantics, roles and accessible names are established — so
 * scoping this block to the consumer is a correctness requirement and not a
 * convenience.
 */
const RAW_ELEMENT_RESTRICTIONS = [
  {
    selector: "JSXOpeningElement[name.name='button']",
    message:
      'A control belongs to the contract that owns it: the modal shell footer action, the confirmation dialog action pair, the hover action bar row action, the composer send control, the dropdown menu trigger, the tab bar tab, the filter chip. Compose the owning contract from "@relay/ui" instead of writing a control here.',
  },
  {
    selector: "JSXOpeningElement[name.name='input']",
    message:
      'Use the field contract that matches the entry: the chip input for tokenised recipients, the segmented code input for a fixed-length verification code, the search entry for search, the date-picker popover for a date. A bare input carries none of the validation, labelling or focus behaviour those contracts already own.',
    // A checkbox or radio inside a library contract is that contract's own
    // markup; inside a feature it is the sidebar's per-item checkbox, the
    // reply composer's also-send control or the visibility choice, each of
    // which belongs to its contract.
  },
  {
    selector: "JSXOpeningElement[name.name='select']",
    message:
      'Use the dropdown menu contract from "@relay/ui" rather than a select element. Its inventory row covers the in-form select control explicitly, and it carries the anchoring, checked-option and description-row behaviour a select cannot express.',
  },
  {
    selector: "JSXOpeningElement[name.name='textarea']",
    message:
      'Use the composer contract from "@relay/ui". Message content is a structured document validated against an allowlist, never plain text out of a textarea, and the composer owns every variant that content is entered through.',
  },
  {
    selector: "JSXOpeningElement[name.name='table']",
    message:
      'Use the data table contract from "@relay/ui" rather than a table element. It owns the grouped rows, the mixed cell types and the per-row states that a hand-rolled table would have to reproduce.',
  },
  {
    selector: "JSXOpeningElement[name.name='dialog']",
    message:
      'Use the modal shell contract for a focused task, or the confirmation dialog contract for a decision that must be made before an irreversible action. Both own focus trapping and focus restoration, which a dialog element leaves to the caller.',
  },
  {
    selector: 'JSXOpeningElement[name.name=/^h[1-6]$/]',
    message:
      'A heading belongs to the region that owns it: the modal shell title row, the details pane header, the empty state heading, the auth page shell heading. A heading written directly in a feature or route sets type and spacing outside the contract that should be setting them.',
  },
];

/**
 * RESTRICTION 4 — a colour literal may exist in exactly one file.
 *
 * The pattern matches a three-, four-, six- or eight-digit hex colour anywhere
 * inside a string, so an embedded value such as a shadow's colour component is
 * caught as readily as a standalone one. The trailing word boundary is what
 * keeps it honest: a seven-digit run is not a colour in any notation, and
 * without the boundary the six-digit alternative would match its prefix and
 * report something that is not a colour at all.
 *
 * Both node types are covered because both are ways of writing a string: a
 * plain literal, and a template literal's static text. Restricting only the
 * first would leave an interpolated stylesheet string as an open door.
 */
const HEX_COLOUR_PATTERN = '#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\\b';

const HEX_COLOUR_MESSAGE =
  'A colour value may be written in exactly one file, the token module in packages/ui/src/styles. Everywhere else colour resolves to a token, so that the palette has a single source and a value sampled from anywhere else has nowhere to hide. The only literals a stylesheet needs besides a token are 0, none, auto, inherit, currentColor and transparent.';

const HEX_COLOUR_RESTRICTIONS = [
  {
    selector: `Literal[value=/${HEX_COLOUR_PATTERN}/]`,
    message: HEX_COLOUR_MESSAGE,
  },
  {
    selector: `TemplateElement[value.raw=/${HEX_COLOUR_PATTERN}/]`,
    message: HEX_COLOUR_MESSAGE,
  },
];

/**
 * Global bindings, declared inline rather than pulled from a dependency.
 *
 * The pinned dependency set is closed and every version in it was verified
 * against the registry, so widening it for a map of identifier names would cost
 * a lockfile change and a package nobody chose. Naming the bindings here is also
 * more honest about what each tier of the workspace is allowed to assume: the
 * server and the tools have no DOM, and the client has no process.
 *
 * `false` marks a binding as read-only, which is the point — shadowing or
 * assigning to one of these is a mistake worth reporting.
 */
const NODE_GLOBALS = {
  __dirname: false,
  __filename: false,
  Buffer: false,
  console: false,
  exports: false,
  fetch: false,
  global: false,
  module: false,
  process: false,
  require: false,
  setImmediate: false,
  clearImmediate: false,
  setInterval: false,
  clearInterval: false,
  setTimeout: false,
  clearTimeout: false,
  queueMicrotask: false,
  structuredClone: false,
  URL: false,
  URLSearchParams: false,
  TextEncoder: false,
  TextDecoder: false,
  AbortController: false,
  AbortSignal: false,
  crypto: false,
  performance: false,
};

const BROWSER_GLOBALS = {
  console: false,
  document: false,
  window: false,
  navigator: false,
  location: false,
  history: false,
  localStorage: false,
  sessionStorage: false,
  fetch: false,
  Headers: false,
  Request: false,
  Response: false,
  FormData: false,
  Blob: false,
  File: false,
  FileReader: false,
  WebSocket: false,
  EventSource: false,
  MessageChannel: false,
  MutationObserver: false,
  ResizeObserver: false,
  IntersectionObserver: false,
  requestAnimationFrame: false,
  cancelAnimationFrame: false,
  requestIdleCallback: false,
  setInterval: false,
  clearInterval: false,
  setTimeout: false,
  clearTimeout: false,
  queueMicrotask: false,
  structuredClone: false,
  URL: false,
  URLSearchParams: false,
  TextEncoder: false,
  TextDecoder: false,
  AbortController: false,
  AbortSignal: false,
  crypto: false,
  performance: false,
  matchMedia: false,
  getComputedStyle: false,
  scrollTo: false,
  CustomEvent: false,
  Event: false,
  KeyboardEvent: false,
  MouseEvent: false,
  DragEvent: false,
  ClipboardEvent: false,
  HTMLElement: false,
  HTMLInputElement: false,
  HTMLTextAreaElement: false,
  HTMLDivElement: false,
  HTMLButtonElement: false,
  Element: false,
  Node: false,
  MediaRecorder: false,
  MediaStream: false,
  Notification: false,
  Image: false,
  Audio: false,
};

/**
 * Runner-injected bindings for the two test tiers. Vitest supplies the first
 * group; the end-to-end runner supplies its own fixtures by import rather than
 * by global, so only the assertion and lifecycle names are needed here.
 */
const TEST_GLOBALS = {
  afterAll: false,
  afterEach: false,
  beforeAll: false,
  beforeEach: false,
  describe: false,
  expect: false,
  it: false,
  suite: false,
  test: false,
  vi: false,
  vitest: false,
};

/**
 * Configuration values are defined once and consumed by reference.
 *
 * A millisecond-shaped literal is the clearest evidence of the opposite. Every
 * number below can only ever be a duration, so writing one at a point of use
 * means an expiry, window, threshold or limit has been restated instead of
 * imported — which is the failure the two configuration modules exist to
 * prevent. The last two are the two configurable windows this phase actually
 * carries, which is why they head the list of things not to write down twice.
 *
 * The list stops short of one second and one minute on purpose. Those two
 * numbers are how a unit conversion between milliseconds and seconds or minutes
 * is written, so restricting them would report arithmetic as a configuration
 * defect — and a rule that cries wolf is a rule somebody eventually switches
 * off. Every value kept here admits no reading other than a duration.
 */
const DURATION_MILLISECONDS = [
  300_000, // five minutes
  900_000, // fifteen minutes
  1_800_000, // thirty minutes
  3_600_000, // one hour
  86_400_000, // one day
  604_800_000, // one week
  1_209_600_000, // fourteen days — the external acceptance window
  2_592_000_000, // thirty days — the invitation expiry
];

const DURATION_LITERAL_RESTRICTION = [
  {
    // Matched by value rather than by a pattern over the written text, for two
    // reasons that both matter. A regex attribute in a selector is only tested
    // against a string, so it silently never matches a numeric literal at all —
    // the kind of rule that looks enforced and is not. And matching the value
    // catches the same number written with digit separators, which is exactly
    // how a large duration tends to be written.
    selector: DURATION_MILLISECONDS.map((ms) => `Literal[value=${ms}]`).join(', '),
    message:
      'A duration belongs in configuration, not at a point of use. Compile-time invariants live in the shared constants module and environment-overridable defaults in the shared environment module; both are consumed by import. Records store an absolute timestamp rather than a duration, so a configured default can change without invalidating what is already stored.',
  },
];

/**
 * The environment is read in one place.
 *
 * A configurable default is only single-sourced if exactly one module reads the
 * environment and everything else imports the resolved, schema-validated value.
 * This restriction is scoped to the application and library source trees, and is
 * lifted for the configuration modules that legitimately do the reading, for the
 * command-line tools, and for the build configuration files.
 */
const ENVIRONMENT_ACCESS_RESTRICTION = [
  {
    object: 'process',
    property: 'env',
    message:
      'Read the environment in the shared configuration module only, and import the resolved value here. A second reader is a second source of truth for a documented default, and it escapes the schema validation the configuration module applies.',
  },
];

/**
 * Accessibility, at error severity, with the two useful omissions restored.
 *
 * The plugin's recommended set is adopted whole and every enabled entry is
 * normalised to error while keeping whatever options that entry carries.
 * Accessibility is an acceptance criterion for this project rather than advice,
 * and an automated scan runs in the pipeline besides, so a finding here should
 * fail the build in the same way a type error does.
 *
 * Two rules the recommended set leaves off are turned on deliberately:
 * `control-has-associated-label`, which is the one that catches a custom
 * control shipped with no accessible name, and `anchor-ambiguous-text`, which
 * catches link text that says nothing — worth having when every string in the
 * product is authored rather than inherited.
 *
 * One stays off: `label-has-for` is deprecated in favour of
 * `label-has-associated-control`, which is already enabled, so enabling both
 * would report the same defect twice under two names.
 *
 * The rules are read directly rather than through a fallback. If a future
 * version moves them, this file should fail loudly at load time instead of
 * quietly linting nothing.
 */
const ACCESSIBILITY_RULES = {
  ...Object.fromEntries(
    Object.entries(jsxA11y.flatConfigs.recommended.rules).map(([rule, level]) => {
      const severity = Array.isArray(level) ? level[0] : level;
      if (severity === 'off' || severity === 0) return [rule, 'off'];
      return [rule, Array.isArray(level) ? ['error', ...level.slice(1)] : 'error'];
    }),
  ),
  'jsx-a11y/control-has-associated-label': 'error',
  'jsx-a11y/anchor-ambiguous-text': 'error',
  'jsx-a11y/label-has-for': 'off',
};

/**
 * Hook correctness, at error severity.
 *
 * The plugin's own preset is adopted so that nothing it considers part of hook
 * correctness is silently dropped, and its plugin object is registered by hand
 * because the preset still declares `plugins` in the legacy array form, which a
 * flat config cannot consume. Only the rules are spread.
 *
 * Severity is then normalised the same way the accessibility set is, and for the
 * same reason: a warning cannot fail this build, so a rule left at a warning is
 * a rule that reports into the void. Normalising mechanically rather than
 * listing the exceptions by hand also means a warning introduced by a future
 * patch release is raised automatically instead of quietly re-opening the gap.
 *
 * The rule that gains the most from this is the dependency array. A missing
 * dependency is a stale closure, and the surfaces leaning hardest on effect
 * correctness here are the realtime subscription and the optimistic-send
 * reconciliation, where a stale closure is a lost message rather than a cosmetic
 * glitch.
 */
const HOOK_RULES = Object.fromEntries(
  Object.entries(reactHooks.configs['recommended-latest'].rules).map(([rule, level]) => {
    const severity = Array.isArray(level) ? level[0] : level;
    if (severity === 'off' || severity === 0) return [rule, 'off'];
    return [rule, Array.isArray(level) ? ['error', ...level.slice(1)] : 'error'];
  }),
);

/**
 * The trees a workspace's own TypeScript configuration excludes from its build.
 *
 * Each of these directories is real source that is deliberately outside its
 * package's compiled output — a test tree beside a package whose `rootDir` is
 * `src`, for instance. The project service resolves a file through the nearest
 * configuration that includes it, so these files resolve through nothing and
 * would otherwise fail to parse. Naming the base configuration explicitly for
 * them restores full type information, which matters because the rules that
 * make the authorization surface safe are type-aware ones.
 */
const UNPROJECTED_SOURCE_TREES = [
  'apps/*/test/**/*.{ts,tsx}',
  'packages/*/test/**/*.{ts,tsx}',
  'tools/*/test/**/*.{ts,tsx}',
  'apps/api/**/*.{test,bench}.ts',
  'packages/shared/**/*.test.ts',
  'packages/db/**/*.test.ts',
  'tools/**/*.test.ts',
];

/**
 * Every file the workspace's own code lives in.
 *
 * Extensions are always named. A `files` entry that matches by directory alone
 * would pull stylesheets, JSON and Markdown into the file set, and the default
 * parser would then fail on all three.
 */
const WORKSPACE_CODE = [
  'apps/**/*.{ts,tsx,js,mjs,cjs}',
  'packages/**/*.{ts,tsx,js,mjs,cjs}',
  'tools/**/*.{ts,js,mjs,cjs}',
  'e2e/**/*.{ts,js,mjs,cjs}',
];

export default tseslint.config(
  // ---------------------------------------------------------------------------
  // What is never linted.
  // ---------------------------------------------------------------------------
  { ignores: IGNORES },

  // ---------------------------------------------------------------------------
  // TypeScript baseline, with type information.
  //
  // The type-checked preset is the baseline rather than the plain one because
  // several of the guarantees this project depends on cannot be made without
  // types: an exhaustive operation union that turns an unpoliced model into a
  // failure, a floating promise in a transaction, an unsafe value crossing a
  // boundary that is supposed to be validated.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/typescript-baseline',
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        projectService: {
          // Confined to the standalone scripts at the repository root, which no
          // workspace configuration owns. Globs here may not contain `**`, and
          // the set is meant to stay small, so nothing broader belongs in it.
          allowDefaultProject: ['*.ts', '*.mts', '*.cts'],
          defaultProject: BASE_TSCONFIG,
        },
        tsconfigRootDir: ROOT,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // The base configuration sets `verbatimModuleSyntax`, so a type-only
      // import that is not marked as one is a build error waiting to happen.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Type-aware correctness rules the recommended preset leaves out, each
      // of which reports a defect this codebase can actually produce.
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-else-return': 'error',
      'object-shorthand': ['error', 'properties'],
    },
  },

  // ---------------------------------------------------------------------------
  // Type information for the source trees a workspace build excludes.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/typescript-unprojected-trees',
    files: UNPROJECTED_SOURCE_TREES,
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: [BASE_TSCONFIG],
        tsconfigRootDir: ROOT,
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Plain JavaScript — this file and the formatting configuration beside it.
  //
  // No type-aware rule is switched off here because none was ever switched on:
  // the baseline above matches TypeScript extensions only, so a JavaScript file
  // is parsed by the default parser and carries none of those rules. Naming a
  // rule from a plugin that is not registered for these files would fail at
  // config load, which is why nothing does.
  //
  // The undefined-identifier rule is enabled here and only here. It is what
  // makes the global declarations load-bearing — for TypeScript the compiler
  // already reports an unknown identifier, and enabling it there would report
  // every type-only name as undefined.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/javascript-modules',
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: NODE_GLOBALS,
    },
    rules: {
      'no-undef': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    name: 'relay/commonjs-scripts',
    files: ['**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: NODE_GLOBALS,
    },
    rules: {
      'no-undef': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // ---------------------------------------------------------------------------
  // Runtime environments. The server, the database package and the tools run on
  // the server runtime and must not assume a document; the client and the
  // component library run in a browser and must not assume a process.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/server-runtime',
    files: ['apps/api/**/*.ts', 'packages/db/**/*.ts', 'tools/**/*.ts'],
    languageOptions: { globals: NODE_GLOBALS },
  },
  {
    name: 'relay/shared-runtime',
    // The contract package is consumed by both runtimes, so it may assume
    // neither a document nor a process — only the language and the platform
    // primitives both runtimes provide.
    files: ['packages/shared/**/*.ts'],
    languageOptions: {
      globals: {
        console: false,
        fetch: false,
        URL: false,
        URLSearchParams: false,
        TextEncoder: false,
        TextDecoder: false,
        AbortController: false,
        AbortSignal: false,
        crypto: false,
        performance: false,
        structuredClone: false,
        setTimeout: false,
        clearTimeout: false,
        queueMicrotask: false,
      },
    },
  },
  {
    name: 'relay/browser-runtime',
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
    languageOptions: { globals: BROWSER_GLOBALS },
  },

  // ---------------------------------------------------------------------------
  // RESTRICTION 4 — a colour value exists in one file, and a duration in none.
  //
  // Applied across every workspace so that the token module is the only place a
  // palette can live, which is what makes a colour taken from anywhere else
  // impossible to hide.
  //
  // This block sits ahead of the environment and test blocks on purpose. A later
  // configuration replaces a rule's options rather than merging them, so the
  // blocks that legitimately lift one of these — a tool that prints, a test that
  // arranges an environment — have to come after the block that imposes it. The
  // restrictions that must survive those exemptions are re-stated where they
  // matter rather than relied upon to merge.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/tokens-and-configuration',
    files: WORKSPACE_CODE,
    rules: {
      'no-restricted-syntax': [
        'error',
        ...HEX_COLOUR_RESTRICTIONS,
        ...DURATION_LITERAL_RESTRICTION,
      ],
      'no-restricted-properties': ['error', ...ENVIRONMENT_ACCESS_RESTRICTION],
      // Product code reports through the structured logger, so that a denial or
      // an administrative action lands in the audit trail rather than on a
      // stream nobody collects.
      'no-console': 'error',
    },
  },

  // ---------------------------------------------------------------------------
  // Where reporting to the terminal, or reading the environment, is the job.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/command-line-tools',
    // The measurement tool, the two guards and the manifest generator are
    // command-line programs: their output *is* their result, and each is invoked
    // with its own arguments and environment.
    files: ['tools/**/*.{ts,js,mjs,cjs}'],
    rules: {
      'no-console': 'off',
      'no-restricted-properties': 'off',
    },
  },
  {
    name: 'relay/console-email-transport',
    // The development email transport writes the message it would have sent to
    // the terminal. That is its entire contract, so the reporting rule is lifted
    // for that one file and for nothing around it.
    files: ['apps/api/src/email/console-transport.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    name: 'relay/build-configuration',
    // Build configuration runs on the server runtime whichever tree it sits in.
    files: ['*.{ts,js,mjs,cjs}', '**/*.config.{ts,js,mjs,cjs}'],
    languageOptions: { globals: NODE_GLOBALS },
    rules: {
      // A build script legitimately reports to the terminal, and legitimately
      // reads the environment to decide how to build.
      'no-console': 'off',
      'no-restricted-properties': 'off',
      // A timeout in a runner or bundler configuration is that tool's own
      // budget for its own work, not one of the product's configurable windows,
      // so the duration restriction does not reach it. The colour restriction
      // still does: a build file has no business carrying a palette.
      'no-restricted-syntax': ['error', ...HEX_COLOUR_RESTRICTIONS],
    },
  },
  {
    name: 'relay/tests',
    files: [
      '**/*.{test,spec,bench}.{ts,tsx}',
      '**/test/**/*.{ts,tsx}',
      'e2e/**/*.ts',
      'packages/db/prisma/seed*.ts',
    ],
    languageOptions: { globals: { ...NODE_GLOBALS, ...BROWSER_GLOBALS, ...TEST_GLOBALS } },
    rules: {
      // A test asserts on a value it has just constructed, so a non-null
      // assertion there is a statement about the fixture rather than a risk.
      '@typescript-eslint/no-non-null-assertion': 'off',
      // A test and a seed script both report progress to the terminal.
      'no-console': 'off',
      // A fixture legitimately narrows a value the type system cannot,
      // and an assertion helper legitimately accepts an unknown payload.
      '@typescript-eslint/no-unnecessary-condition': 'off',
      // Test doubles and fixtures reach the environment directly to arrange a
      // scenario; the single-reader rule governs product code.
      'no-restricted-properties': 'off',
    },
  },

  // ---------------------------------------------------------------------------
  // The client surfaces. Accessibility and hook correctness are checked here,
  // where components are written, in both the library that owns the contracts
  // and the application that composes them.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/react-surfaces',
    files: ['apps/web/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y, 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...ACCESSIBILITY_RULES,
      ...HOOK_RULES,
    },
  },

  // ---------------------------------------------------------------------------
  // RESTRICTION 1 — barrel-only consumption, in every consumer.
  //
  // Scoped to the consumers rather than to the whole workspace: a package
  // reaching its own sibling modules by relative path is how a package is
  // built, and only a consumer can reach past a package boundary.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/boundary-barrel-only',
    files: ['apps/**/*.{ts,tsx}', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', BARREL_ONLY_IMPORTS],
    },
  },

  // ---------------------------------------------------------------------------
  // RESTRICTION 2, styling half — a feature or a route owns no stylesheet.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/boundary-no-feature-stylesheets',
    files: ['apps/web/src/features/**/*.{ts,tsx}', 'apps/web/src/routes/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [...BARREL_ONLY_IMPORTS.patterns, ...FEATURE_STYLESHEET_RESTRICTION.patterns],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // RESTRICTION 3 — system components over raw markup, in the consumer only.
  //
  // This block deliberately never matches the component library. Inside
  // packages/ui a raw element is the contract being implemented, and that is
  // exactly where an element's semantics, role and accessible name are
  // established; forbidding it there would make the contracts unimplementable.
  //
  // The restrictions from the block above are repeated rather than inherited,
  // because a later configuration replaces a rule's options wholesale instead of
  // merging them.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/boundary-system-components',
    files: ['apps/web/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...HEX_COLOUR_RESTRICTIONS,
        ...DURATION_LITERAL_RESTRICTION,
        ...RAW_ELEMENT_RESTRICTIONS,
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // RESTRICTION 2, existence half — no local equivalent of a contract.
  //
  // This block errors on the existence of a file rather than on anything written
  // in it, because the defect is the file's location. A contract module under the
  // client's own tree is a second implementation of something the library already
  // owns, and it stays a defect even when only one variant of that contract is
  // needed — the remedy is to extend the shared contract and its tests.
  //
  // It sits after the raw-markup block so that its restriction survives: the two
  // blocks set the same rule, and the later one wins outright.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/boundary-no-local-contract-modules',
    files: ['apps/web/src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...HEX_COLOUR_RESTRICTIONS,
        ...DURATION_LITERAL_RESTRICTION,
        ...RAW_ELEMENT_RESTRICTIONS,
        {
          selector: 'Program',
          message:
            'This file is in the wrong place. Contract modules live in packages/ui/src/components/<Contract>/ — component, stylesheet, test, types and index — and are consumed through the "@relay/ui" barrel. Move the implementation into the library, or extend the contract that already covers it; needing one variant is not grounds for a local copy.',
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // The single exception to the colour restriction.
  //
  // The token module is where the palette is written down, and it is the only
  // file in the workspace permitted a colour value. The duration restriction
  // still applies here: a token module holds design values, never a timer.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/token-module-palette',
    files: ['packages/ui/src/styles/tokens.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...DURATION_LITERAL_RESTRICTION],
    },
  },

  // ---------------------------------------------------------------------------
  // The configuration modules are the one place the environment is read, and
  // the one place a documented default is written down.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/configuration-modules',
    files: ['packages/shared/src/config/**/*.ts'],
    rules: {
      // Reading the environment is this module's entire purpose, and it is the
      // single reader the restriction elsewhere exists to guarantee.
      'no-restricted-properties': 'off',
      // A duration constant is defined here by definition; the restriction
      // exists to stop it being restated anywhere else. The colour restriction
      // still applies: a palette is not configuration.
      'no-restricted-syntax': ['error', ...HEX_COLOUR_RESTRICTIONS],
    },
  },

  // ---------------------------------------------------------------------------
  // The authorization surface. Nothing here is relaxed.
  //
  // The guard's operation union is exhaustive so that adding a model without a
  // policy fails to compile rather than shipping unpoliced, and the unsafe-value
  // diagnostics are what keep a caller-supplied identifier from reaching a
  // decision as an `any`. This block re-asserts both at error severity so that a
  // later edit cannot quietly weaken them, and adds the two rules that keep a
  // denial from being swallowed. If one of these is noisy here, the code is what
  // changes.
  //
  // The file set is every place an authorization decision is actually taken: the
  // mutation guard and the projection guard, the isolation binding that decides
  // which workspace a query may see, and the two realtime points — the one that
  // authorizes a subscription and the one that re-checks on delivery. A read
  // path is a decision point too, which is why the projection side is in scope
  // rather than only the mutation side.
  // ---------------------------------------------------------------------------
  {
    name: 'relay/authorization-surface',
    files: [
      'apps/api/src/authz/**/*.ts',
      'apps/api/src/db/tenancy.ts',
      'apps/api/src/realtime/subscribe.ts',
      'apps/api/src/realtime/fanout.ts',
    ],
    rules: {
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: false, allowDefaultCaseForExhaustiveSwitch: false },
      ],
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      // A swallowed rejection in a policy is an authorization decision that
      // never happened.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // A denial must be raised, never returned as a falsy value that a caller
      // can forget to check.
      '@typescript-eslint/no-unnecessary-condition': 'error',
    },
  },
);
