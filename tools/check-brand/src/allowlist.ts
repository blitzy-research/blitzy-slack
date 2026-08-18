/**
 * Operating constants for the third-party-identity guard.
 *
 * WHAT THIS MODULE IS
 *
 * The guard walks the delivered tree and fails the build when a prohibited
 * third-party product name appears anywhere outside the five read-only input
 * paths. This module holds every value that walk depends on — the exempt paths,
 * the directories that are not source at all, the exit codes, the file-type
 * bounds, the root-resolution marker, the self-check targets and the pattern
 * factories. Its sibling module holds the traversal and the reporting and
 * carries no operating value of its own, so a reviewer can audit what the guard
 * enforces by reading this one file.
 *
 * WHY THE NAME IS NEVER WRITTEN DOWN HERE
 *
 * The third-party-identity rule prohibits the product name in source, assets,
 * copy, comments, tests, fixtures, file names and directory names. This file is
 * authored source, so the name may not appear in it — not in code, not in a
 * comment, not in an error message. A guard that spelled the string it searches
 * for would be the very violation it exists to catch, and its own self-check
 * would report it.
 *
 * The name is therefore held as {@link TOKEN_CHAR_CODES}, a list of character
 * codes, and reassembled at run time by {@link buildToken}. Anyone tempted to
 * "simplify" that into a literal should stop: the indirection is the point, and
 * removing it breaks the build by design.
 *
 * The same trap catches citations. Every one of the five project rules is named
 * with an identifier that itself contains the prohibited token, so no rule is
 * ever named literally in this file. Rules are referred to by subject instead —
 * the third-party-identity rule, the corpus-handling rule, the uncertainty rule,
 * the server-side-authorization rule.
 *
 * FOUR INVARIANTS THIS FILE HOLDS
 *
 *   1. Zero imports. Not a workspace package, not a third-party package, not
 *      even a built-in. The guard is a build-time utility and never a runtime
 *      dependency of the server or the client, and the workspace manifest
 *      declares no dependencies at all, so an import here would not install.
 *      This module is pure data and pure functions.
 *   2. Zero environment reads. Every value here is a compile-time constant. The
 *      uncertainty rule's environment-overridable clause governs product values
 *      read from a frame — timers, expiries, windows, thresholds — and none of
 *      these are that. They come from rule text and from measured facts about
 *      this repository. Making the exempt-path list configurable would let it
 *      grow past five, which is precisely what must never happen.
 *   3. Everything readonly at run time, not merely in the type system. Every
 *      exported collection is `as const` **and** frozen. The `as const` alone
 *      would be a compile-time promise only: the value it produces is an
 *      ordinary array, so a consumer could still push a sixth path onto the
 *      exempt list and the guard would honour it. Freezing is what makes the
 *      "five entries, never six" invariant true of the running program rather
 *      than only of the source that a reviewer reads.
 *   4. No repair behaviour. There is no fix mode, no rewrite, no normalisation
 *      and no mask-in-place anywhere in this workspace. The guard reports and
 *      exits; a human fixes the source.
 *
 * WHAT THE GUARD DELIBERATELY DOES NOT DO
 *
 *   - It never opens a frame. The corpus is skipped by path prefix before any
 *     directory read, because the corpus-handling rule prohibits surveying,
 *     enumerating, sampling and scanning it. Skipping by prefix is a rule
 *     obligation, not a performance choice.
 *   - It never hashes anything and never counts frames. Byte-identity and the
 *     file count belong to the corpus-integrity guard, which uses metadata
 *     alone.
 *   - It reaches no network and reads no credential. It makes no authorization
 *     decision and knows nothing of any workspace or actor.
 */

/**
 * The five read-only input paths, and the complete set of exemptions.
 *
 * These are transcribed from the corpus-handling rule's own opening line, which
 * names exactly these five paths as read-only inputs. That is why the list is
 * closed: it is not a judgement about what is inconvenient to fix, it is the
 * rule's own enumeration. **Five entries, never six.** A path that must be
 * skipped for any other reason belongs in {@link NON_SOURCE_DIRECTORIES}, which
 * is a separate constant for exactly this reason.
 *
 * ENTRY FORM. A directory entry carries a trailing slash and is tested as a
 * path prefix; a file entry carries none and is tested as an exact match. The
 * distinction is load-bearing rather than cosmetic. The prefix form lets the
 * walker skip an entire subtree by testing the path *before* it reads the
 * directory, which is what keeps the corpus unopened and unenumerated. The
 * exact form keeps a file entry from behaving as a prefix and silently
 * exempting a sibling whose name merely starts the same way.
 *
 * WHY THE LAST TWO ARE HERE. Both retain the token and both are read-only, so
 * they are exempted rather than rewritten. Measured on the source branch at
 * `HEAD a6b3726`:
 *
 *   - `mkdocs.yml` retains it at L1, in the site name, as the lowercase
 *     hyphenated compound. That single occurrence is also the reason matching
 *     must be case-insensitive: a case-sensitive search for the capitalised
 *     canonical spelling finds zero occurrences in this file, which would
 *     wrongly suggest it needs no exemption at all.
 *   - `catalog-info.yaml` retains it in six places — L4, L5, L16, L17, L19 and
 *     L21, five lowercase and one capitalised — across the component name, the
 *     description, the project slug and the repository links.
 *
 * WHAT IS DELIBERATELY ABSENT. The two writable files that carried the token,
 * the repository readme at L1 and L3 and the documentation-site landing page at
 * L1 and L3, are **rewritten rather than exempted**. They are this guard's first
 * real regression targets, so listing either here would disable the check that
 * protects them. Neither may ever appear in this array.
 *
 * There is likewise no bare `docs/` entry, and adding one would be a serious
 * defect. The documentation tree holds the landing page and the authored
 * decision records alongside the read-only catalog; all of those are writable
 * source and must be scanned. Only `docs/workflows/` is a read-only input, so
 * only `docs/workflows/` is named. A broader prefix would silently exempt the
 * very landing page whose rewrite this guard exists to protect.
 *
 * The catalog is exempted **wholesale**, which is why the guard needs no
 * special-case logic for the two residual occurrences its own known-limitation
 * entry publishes as the complete reviewed exception set. Measured for scale:
 * 17,257 occurrences across the 25 catalog documents, 17,255 of them in
 * citation-filename position, leaving exactly those two.
 */
export const ALLOWLIST = Object.freeze([
  'screenshots/',
  'docs/workflows/',
  'blitzy/documentation/',
  'catalog-info.yaml',
  'mkdocs.yml',
] as const);

/** One of the five read-only input paths exempted by {@link ALLOWLIST}. */
export type AllowlistEntry = (typeof ALLOWLIST)[number];

/**
 * Directory names that are not source, matched at any depth.
 *
 * These are matched by **name** wherever they occur, not as path prefixes from
 * the repository root, because each can appear in any workspace: every
 * workspace compiles to its own `dist`, and dependencies and caches are
 * installed per package as well as at the root.
 *
 * This set agrees with the root ignore file, which untracks exactly these. Two
 * of them are load-bearing rather than merely tidy:
 *
 *   - `.git` stores the corpus filenames in its index and its object database,
 *     and every one of those filenames embeds the token. Walking it would
 *     produce a flood of findings about repository metadata, none of which is
 *     authored source and none of which a developer can act on.
 *   - `node_modules` is where a third-party package may legitimately mention
 *     the product — an integration client, a plugin, a type definition. That is
 *     someone else's source, not this project's, and the rule governs what this
 *     project authors.
 *
 * `dist` is in this set deliberately and correctly. The guard scans this
 * workspace's committed TypeScript source, not its own compiled output, because
 * the rule governs source. Scanning build output would also double-report every
 * finding and would make a stale build a phantom failure.
 *
 * NOT AN EXEMPTION LIST. These entries are **not** allowlist entries, and the
 * two constants must never be merged, concatenated, spread into one another or
 * derived from one another. They answer different questions: the allowlist
 * names what the rule exempts, and this names what is not source in the first
 * place. Conflating them is exactly how a future change would grow "the
 * allowlist" past five without anyone noticing.
 */
export const NON_SOURCE_DIRECTORIES = Object.freeze([
  '.git',
  'node_modules',
  'dist',
  '.turbo',
  '.vite',
  'coverage',
  'playwright-report',
  'test-results',
] as const);

/** A directory name the walk never descends into. */
export type NonSourceDirectory = (typeof NON_SOURCE_DIRECTORIES)[number];

/**
 * Process exit codes. Four outcomes, four distinct numbers.
 *
 * A guard that cannot fail is not a guard, so every abnormal outcome exits
 * non-zero and the walk is fail-closed throughout: an unreadable file, a
 * repository root that cannot be resolved, or a walk that visited nothing at all
 * is a guard failure and never a clean run. Silence is not evidence of
 * cleanliness — it is far more often evidence that nothing was checked.
 *
 * The self-check failure is a **distinct** code rather than a variant of the
 * occurrence code, because the two mean very different things to whoever reads
 * the pipeline. One says the tree is dirty and points at the file to fix. The
 * other says the guard's own source has been compromised, which means no other
 * result from this run can be trusted. A reviewer can tell those apart from the
 * exit status alone, without reading the log.
 *
 * The pipeline's brand-scan stage treats any non-zero status as failure, so the
 * distinction buys nothing mechanically. It is there for the human reading the
 * failure and for the manual validation procedure, which is reason enough.
 */
export const EXIT_CODES = Object.freeze({
  /** Nothing found, and enough files were visited to believe it. */
  CLEAN: 0,
  /** At least one prohibited occurrence outside the exempt paths. */
  OCCURRENCES_FOUND: 1,
  /** The guard could not do its job: unreadable file, no root, nothing walked. */
  GUARD_FAILURE: 2,
  /** The guard's own source carries a literal occurrence. */
  SELF_CHECK_FAILURE: 3,
} as const);

/** One of the four outcomes the guard can exit with. */
export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

/**
 * The fail-closed floor: the fewest files a believable walk can have visited.
 *
 * Named rather than inlined, because it is the assertion that separates "found
 * nothing" from "looked at nothing". A walk that scanned zero files has proved
 * nothing whatsoever — the root was wrong, a filter was too broad, a permission
 * was missing — and must exit with {@link EXIT_CODES.GUARD_FAILURE} rather than
 * reporting success. One file is the smallest count that makes the claim
 * meaningful; in practice the walk visits this workspace's own two source files
 * at minimum, which is what {@link SELF_CHECK_TARGETS} then verifies.
 */
export const MINIMUM_SCANNED_FILE_COUNT = 1;

/**
 * The prohibited product name, held as character codes and never as a string.
 *
 * These five values are the UTF-16 code units of the lower-case spelling of the
 * third party's product name. Written out as a string literal, this line would
 * itself be the violation the guard reports, and the self-check would flag this
 * file — correctly. Holding the codes instead is what lets a guard search for a
 * name it is forbidden to contain.
 *
 * Lower case is the natural base because matching is case-insensitive, so one
 * base spelling covers every casing without listing variants.
 *
 * Do not replace this with a literal, and do not "helpfully" add a comment
 * spelling out what it decodes to. The indirection is the mechanism.
 */
export const TOKEN_CHAR_CODES = Object.freeze([115, 108, 97, 99, 107] as const);

/**
 * Reassembles the prohibited name from {@link TOKEN_CHAR_CODES}.
 *
 * Pure, and deliberately a function rather than a module-level constant: a
 * constant would put the assembled value in scope for the whole module, where a
 * later edit could log it or interpolate it into a message. A caller that needs
 * it asks for it.
 */
export function buildToken(): string {
  return String.fromCharCode(...TOKEN_CHAR_CODES);
}

/**
 * The primary detection pattern: case-insensitive, global, substring.
 *
 * SUBSTRING RATHER THAN A WORD BOUNDARY, and this is measured rather than
 * stylistic. The bare name is a contiguous substring of all three forms that
 * actually occur in this repository — the lowercase hyphenated compound in the
 * site name, the project slug in the service metadata, and the URL-encoded
 * citation filename in the catalog — so a single case-insensitive substring test
 * subsumes every one of them without enumerating them. A word-boundary anchor
 * would match the bare name and miss all three, which is the worst possible
 * outcome for a guard: a green build over a dirty tree. Substring matching also
 * catches concatenated spellings that no boundary rule would see, in an
 * identifier or a compound file name.
 *
 * Over-matching is the safe direction here. A false positive fails the build and
 * a human looks at it, which costs one review. A false negative ships an
 * identity violation, which costs considerably more.
 *
 * CASE-INSENSITIVE, also measured. A case-sensitive search for the capitalised
 * canonical spelling finds zero occurrences in the documentation-site
 * configuration, which would wrongly imply that file is clean; and the
 * documentation-site landing page carries both a lowercase and a capitalised
 * form on separate lines. Both facts were verified on the source branch. Either
 * one alone is enough to make the flag mandatory.
 *
 * A fresh instance is returned on every call, never a shared one. A global
 * pattern carries `lastIndex` between uses, so a shared instance would silently
 * start matching part-way through the next file and under-report.
 *
 * Nothing is escaped and no caller input reaches the pattern: the codes are
 * fixed, and the assembled name contains only letters.
 */
export function buildTokenPattern(): RegExp {
  return new RegExp(buildToken(), 'gi');
}

/**
 * The brand-free segments of the URL-encoded frame-citation filename.
 *
 * Every frame in the corpus is named with the product name followed by a fixed
 * middle and a frame number, and the catalog cites frames by percent-encoding
 * that filename into a link. The middle and the extension carry no third-party
 * identity whatsoever, so they are safe to write down literally; only the
 * leading name is withheld, and {@link buildCitationPattern} supplies it from
 * {@link TOKEN_CHAR_CODES} at run time.
 *
 * WHY THE CITATION FORM IS DETECTED SEPARATELY. The primary substring pattern
 * already matches any citation, so this exists purely to give the citation form
 * its **own** reported category. That lets the failure message teach the actual
 * lesson instead of a generic one: authored code cites a frame by **number
 * alone**, never by encoded filename. A developer who sees "prohibited name
 * found" reaches for a rename, which the corpus-handling rule forbids; a
 * developer who sees "cite the frame number" reaches for the frame-resolution
 * helper in the measurement tool, which exists precisely so a frame can be
 * located from its number at run time. The corpus cannot be renamed, so runtime
 * resolution plus number-only citation is the only reconciliation available, and
 * the report should say so.
 */
export const CITATION_FORM_PARTS = Object.freeze({
  /** Everything between the product name and the frame number, percent-encoded. */
  MIDDLE: '%20web%20Jul%202024%20',
  /** The image extension the filename ends with. */
  SUFFIX: '.png',
  /**
   * Capture group for the frame number.
   *
   * Unbounded digits rather than a fixed width. The corpus numbers run into four
   * digits today, but a width ceiling would silently stop matching if it ever
   * grew, and for a guard the safe failure direction is to match too much.
   */
  FRAME_NUMBER_GROUP: '(\\d+)',
} as const);

/**
 * Regular-expression metacharacters, for escaping a fixed literal segment.
 *
 * Only one metacharacter actually occurs in the segments above — the dot in the
 * extension — but escaping the whole class rather than that one character keeps
 * the assembly correct if a segment is ever revised. Reusing this pattern across
 * calls is safe despite the global flag because string replacement resets
 * `lastIndex` before it begins; it is never used with a stateful test.
 */
const REGEX_METACHARACTERS = /[.*+?^${}()|[\]\\]/g;

/** Backreference to the whole match, prefixed with an escape. */
const REGEX_ESCAPE_REPLACEMENT = '\\$&';

/**
 * Escapes a fixed literal segment so it matches itself and nothing else.
 *
 * An unescaped dot would still match the real extension, so the guard would
 * keep working — but it would also match any character in that position and
 * report a near-miss as a citation. Escaping keeps the citation category
 * honest, which is the whole reason the category exists.
 */
function escapeForPattern(segment: string): string {
  return segment.replace(REGEX_METACHARACTERS, REGEX_ESCAPE_REPLACEMENT);
}

/**
 * The citation-form pattern, assembled around the run-time-built name.
 *
 * Case-insensitive because the corpus filenames capitalise the name while much
 * else does not, and global for the same reason as the primary pattern. A fresh
 * instance per call, again because a global pattern carries `lastIndex`.
 *
 * The frame number is captured so the report can name it, which is what turns
 * the finding into an actionable instruction: cite that number instead.
 */
export function buildCitationPattern(): RegExp {
  const source =
    buildToken() +
    escapeForPattern(CITATION_FORM_PARTS.MIDDLE) +
    CITATION_FORM_PARTS.FRAME_NUMBER_GROUP +
    escapeForPattern(CITATION_FORM_PARTS.SUFFIX);

  return new RegExp(source, 'gi');
}

/**
 * Replacement text for a matched occurrence in reported output.
 *
 * The report says where a finding is, never what it says. Echoing the matched
 * text would reproduce the prohibited name into a build log, a pipeline
 * annotation and quite possibly a pasted bug report — which is the same
 * violation one step removed, and free to avoid. The path and the line number
 * are all a developer needs to open the file and see the rest.
 *
 * Authored placeholder, and deliberately one that spells nothing.
 */
export const MASK = '[redacted]';

/**
 * Extensions whose contents are read, lower-cased with the leading dot.
 *
 * This covers what the delivered tree actually contains rather than what a
 * general-purpose scanner might expect: the TypeScript and JavaScript sources in
 * every module form, the manifests and lockfile, the prose, the two
 * configuration languages, the stylesheets and document shell, the database
 * bootstrap and schema, the shell script, and the environment template's
 * distinctive suffix.
 *
 * Comparison is case-insensitive, so an extension written in capitals on a
 * case-preserving filesystem is still read.
 *
 * A file with an extension in neither this list nor
 * {@link BINARY_FILE_EXTENSIONS} is unknown rather than exempt. Handling that
 * case belongs to the traversal, which sniffs for {@link NUL_BYTE} instead of
 * guessing from the name.
 */
export const TEXT_FILE_EXTENSIONS = Object.freeze([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.cjs',
  '.mjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.css',
  '.html',
  '.sql',
  '.sh',
  '.prisma',
  '.txt',
  '.example',
  '.lock',
  '.env',
] as const);

/**
 * Exact file names that are authored text but carry no useful extension.
 *
 * Each of these is either extensionless or has a leading dot that a naive
 * extension split reads as the extension itself, so matching by name is the only
 * way to reach them. All are authored and all can carry the prohibited name: a
 * container ignore file lists the corpus directory, and the environment template
 * documents every configurable default.
 */
export const SCANNED_FILENAMES = Object.freeze([
  '.nvmrc',
  '.gitignore',
  '.gitattributes',
  '.dockerignore',
  '.env.example',
  'Dockerfile',
  'LICENSE',
] as const);

/**
 * Known-binary extensions, skipped without being opened.
 *
 * Reading these would waste the walk and could misreport: a byte sequence inside
 * compressed or encoded data can spell anything, so a match found here would be
 * noise a developer cannot act on.
 *
 * The corpus never reaches this pass in any case. Its directory is exempted and
 * skipped by path prefix before any directory read, which the corpus-handling
 * rule requires rather than merely permits. These extensions are a second line
 * of defence for a stray image elsewhere in the tree — an icon asset, a
 * screenshot in a decision record — and never the primary mechanism.
 */
export const BINARY_FILE_EXTENSIONS = Object.freeze([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.svgz',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',
  '.pdf',
  '.zip',
  '.gz',
  '.tar',
  '.mp4',
  '.webm',
  '.mp3',
  '.wav',
  '.node',
  '.wasm',
] as const);

/**
 * The byte value that marks content as binary rather than text.
 *
 * Named rather than inlined because it is a decision, not a magic number: a null
 * byte does not occur in any text encoding this tree uses, so its presence is
 * the cheapest reliable evidence that a file should not be treated as text. The
 * extension lists above are the fast path; this is the check that covers a file
 * whose extension is unknown, which is the only honest way to handle one.
 */
export const NUL_BYTE = 0;

/**
 * The file whose presence identifies the repository root.
 *
 * The guard is invoked through the package manager with a workspace filter, so
 * the process working directory is this **workspace's** directory and not the
 * repository root. Every path in this module is repository-root-relative, so the
 * root has to be found before any of them means anything, and taking the working
 * directory for the root would make the walk start two levels too deep — where
 * it would find this workspace's two files, report a clean tree, and have
 * checked essentially nothing.
 *
 * The workspace manifest is the right marker because it is the one file that
 * must exist at the root for the workspace to exist at all: without it the
 * internal links do not resolve and the task runner has no package graph. A
 * marker that merely usually sits at the root would be a guess.
 *
 * A root that cannot be found is {@link EXIT_CODES.GUARD_FAILURE}, never a clean
 * run. Fail-closed is the whole posture: the guard reports success only when it
 * can prove it looked.
 */
export const WORKSPACE_ROOT_MARKER = 'pnpm-workspace.yaml';

/**
 * How many parent directories the search for the root may climb.
 *
 * Two levels is the real distance from this workspace to the root. The ceiling is
 * set above that rather than at it so the guard still resolves if it is ever
 * invoked from a nested directory, while staying bounded: an unbounded climb from
 * a misconfigured checkout walks out of the repository entirely and can find some
 * unrelated marker on the host, which is a far worse failure than not finding
 * one. Bounded and loud beats unbounded and lucky.
 */
export const MAX_ROOT_ASCENT = 6;

/**
 * This workspace's own source files, which the walk must visit and find clean.
 *
 * The self-check is two assertions, and both matter.
 *
 *   1. **Both files were visited.** If either is missing from the walk's record,
 *      the walk did not cover what it claims to have covered — a wrong root, an
 *      over-broad skip, an extension list that stopped matching — and the result
 *      is {@link EXIT_CODES.GUARD_FAILURE}. This is the fail-closed half: a guard
 *      that cannot find its own source has no standing to certify anything else.
 *   2. **Both files were clean.** If either carries a literal occurrence, the
 *      outcome is {@link EXIT_CODES.SELF_CHECK_FAILURE}, reported apart from
 *      ordinary findings because a compromised guard invalidates the whole run
 *      rather than pointing at one file.
 *
 * The second assertion is what makes the character-code indirection enforceable
 * instead of merely conventional. It is also the trap that catches a well-meant
 * edit: the project rules are each named with an identifier containing the
 * prohibited token, so citing one by name in a comment here fails this check. It
 * is meant to. The fix is to name the rule by subject, never to soften the
 * check.
 */
export const SELF_CHECK_TARGETS = Object.freeze([
  'tools/check-brand/src/index.ts',
  'tools/check-brand/src/allowlist.ts',
] as const);

/** One of this workspace's own source files, as the self-check refers to it. */
export type SelfCheckTarget = (typeof SELF_CHECK_TARGETS)[number];

/**
 * The one file in the tree where a colour value may be written down.
 *
 * The third-party-identity rule bars sampling colour from any frame and makes the
 * supplied palette the sole source, and the theme decision record fixes those
 * authored values and confines them to this module. The path itself is a
 * reconciliation: the gate names a bare `src/styles` location while new code may
 * only live under the four permitted directories, and this is where those two
 * land. That reconciliation is recorded with the other catalog defects.
 */
export const TOKEN_MODULE_PATH = 'packages/ui/src/styles/tokens.ts';

/**
 * How many distinct colour literals the token module is expected to contain.
 *
 * The supplied palette has this many entries, so the token module should carry
 * exactly this many distinct colour values and every other scanned file none.
 * Both halves are checked, because they fail differently: a shortfall means the
 * palette was not fully transcribed, a surplus means a value was invented or
 * sampled, and an occurrence anywhere else means colour has escaped its single
 * source.
 *
 * The count is deliberately the only palette fact stated here. No colour value
 * appears in this file, for two reasons that agree. Verifying the **shape** of
 * the delivered artifact needs none, so embedding thirteen values would add a
 * second place they are written down while checking nothing extra. And the
 * repository lint configuration confines colour literals to the token module and
 * reaches this workspace, so writing them here would fail the lint pass it is
 * this guard's job to complement.
 */
export const EXPECTED_PALETTE_LITERAL_COUNT = 13;

/**
 * Pattern matching a hexadecimal colour literal in three, four, six or eight
 * digits, wherever it appears inside a string.
 *
 * The trailing word boundary is what keeps it honest. A seven-digit run is not a
 * colour in any notation, and without the boundary the six-digit alternative
 * would match its prefix and report something that is not a colour at all.
 * Longest-first ordering matters for the same reason: the alternatives are tried
 * in order, so a shorter one listed first would claim the prefix of a longer
 * value.
 *
 * Built from character classes, so this pattern contains no colour value itself —
 * which is both the rule-compliant form and the only form that survives the lint
 * pass described above. A fresh instance per call, for the `lastIndex` reason
 * that applies to every global pattern here.
 *
 * COMPLEMENTARY, NOT DUPLICATIVE. The lint rule and this check look at different
 * things. Lint blocks the authoring intent at the moment someone types a value
 * into the wrong file; the guard verifies the artifact that was actually
 * delivered, including a file that reached the tree without the lint pass having
 * run over it. The palette finding is reported as its own category and must never
 * interfere with the primary name scan — that scan is this workspace's reason to
 * exist, and this check is an addition to it.
 *
 * The token module may legitimately not exist yet when the guard first runs,
 * since the component library is built after the guard. Its absence is not a
 * failure of this check; the traversal degrades and says so.
 */
export function buildHexColourPattern(): RegExp {
  return new RegExp('#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\\b', 'g');
}
