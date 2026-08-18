/**
 * Prettier configuration for the whole workspace.
 *
 * The extension is load-bearing. The root package.json declares
 * `"type": "module"`, so a plain `.js` file here is parsed as an ES module and
 * `module.exports` does not exist in that scope: renaming this file to
 * `prettier.config.js` fails the run outright with `module is not defined in ES
 * module scope`. Keep it `.cjs`.
 *
 * Every option below is written out, including the ones that already match the
 * pinned release's default, so the formatting contract reads as one settled
 * list and cannot shift underneath the repository when a default changes.
 *
 * WHERE THE FORMATTER MAY RUN. Five paths are read-only inputs: `screenshots/`,
 * `docs/workflows/`, `blitzy/documentation/`, `catalog-info.yaml` and
 * `mkdocs.yml`. Reformatting one of them is a rule breach rather than a
 * tidy-up, and the exposure is measured rather than theoretical: invoked with
 * the ignore file bypassed, the formatter reports style changes for both
 * `catalog-info.yaml` and `mkdocs.yml`. Two things keep it away from them.
 *
 *   1. `.prettierignore` excludes all five. Those entries are load-bearing:
 *      the paths are tracked, so `.gitignore` does not cover them, and for the
 *      formatter that file is the only exclusion that reaches them.
 *      `prettier --file-info <path>` reports `"ignored": true` for each of the
 *      five; keep it that way.
 *   2. A run is scoped to `apps`, `packages`, `tools`, `e2e` and the root
 *      configuration files. There is no root `format` script today; if one is
 *      added it carries those globs, because `prettier --write .` across the
 *      repository root is never the command to run.
 *
 * WHAT THIS FILE DOES NOT DECIDE. Import boundaries and component structure
 * belong to `eslint.config.js`, which fails the build on a deep import or a
 * locally re-implemented shared contract. Restating either here would give one
 * rule two sources of truth, and it holds only while it has one.
 *
 * No plugin is configured, deliberately. The pinned release parses everything
 * this contract needs to cover: TypeScript, JavaScript, JSON, CSS, Markdown,
 * YAML and HTML. The few files it does not parse — the SQL bootstrap, the shell
 * script, the environment template — stay hand-maintained rather than pulling
 * in a plugin whose version would then have to be kept in step with it.
 */
module.exports = {
  // One line budget and one indentation style for every language in the tree.
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  // Statement termination and quoting.
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,

  // Trailing commas hold an added argument to a one-line diff.
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',

  // One line ending, so a checkout on another platform is not a whole-file diff.
  // This is also the option with the widest blast radius if a run is ever
  // misdirected: it rewrites a file that needed nothing else changed, which is
  // why the five read-only paths above are excluded rather than merely avoided.
  endOfLine: 'lf',

  overrides: [
    {
      // Markdown prose is left exactly as authored instead of being rewrapped
      // to the line budget above. README.md carries two blocks that must stay
      // byte-identical — the clean-machine command sequence and the
      // gate-reporting ledger — and fencing already protects their contents;
      // `preserve` protects the prose around them.
      files: ['*.md'],
      options: { proseWrap: 'preserve' },
    },
    {
      // YAML keeps double quotes. Measured: under `singleQuote: true` the
      // formatter rewrites pnpm-workspace.yaml's `"apps/*"` to `'apps/*'`,
      // undoing quoting that file documents as deliberate so that a leading
      // `*` is never read as an alias.
      files: ['*.yml', '*.yaml'],
      options: { singleQuote: false },
    },
  ],
};
