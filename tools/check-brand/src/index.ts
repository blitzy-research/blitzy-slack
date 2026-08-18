/**
 * The third-party-identity guard: scanner and command-line entry point.
 *
 * WHAT THIS PROGRAM DOES
 *
 * It walks the delivered tree once and reports every place a prohibited
 * third-party product name appears outside the five read-only input paths. It
 * looks in two places, because the governing rule prohibits the name in two:
 *
 *   1. **Path names**, of files and of directories alike. A content-only scan
 *      would miss a badly named module or folder entirely, and the rule names
 *      file names and directory names explicitly alongside source and comments.
 *   2. **File contents**, line by line, so every finding carries a real line
 *      and column a developer can jump to.
 *
 * It repairs nothing. There is no fix mode, no rewrite and no normalisation of
 * any kind, deliberately and permanently: four of the five exempt paths are
 * read-only inputs that must stay byte-identical, and a tool that edits its way
 * to a green result would be the fastest possible way to breach that. The guard
 * reports and exits; a human changes the source.
 *
 * WHY THE NAME IT SEARCHES FOR IS NOWHERE IN THIS FILE
 *
 * This is authored source, so the same rule that this program enforces also
 * governs it. Writing the searched-for string as a literal here — in code, in a
 * comment, in an error message, in an identifier — would make this file the very
 * violation it exists to catch, and the self-check below would report it.
 * Correctly.
 *
 * So the name is never written down. It lives in the sibling module as a list of
 * character codes and is reassembled at run time by the pattern factories that
 * module exports. Every comparison in this file goes through one of those
 * factories and never through a string this file holds.
 *
 * If you are reading this because the indirection looked like an accident and
 * you were about to simplify it: please do not. It is the mechanism. Inlining
 * the literal breaks the build, by design, on the very next run.
 *
 * The same trap catches citations, and it is the easiest way to break this file.
 * Every one of the five project rules is *named* with an identifier that itself
 * contains the prohibited token, so no rule is ever named literally anywhere in
 * this workspace. Rules are referred to by subject instead — the
 * third-party-identity rule, the corpus-handling rule, the uncertainty rule, the
 * server-side-authorization rule, the shared-component rule. Naming one the
 * other way fails the self-check. The remedy is to rename the reference, never
 * to soften the check.
 *
 * This is also why the repository lint configuration carries no equivalent rule
 * and says so in its own header: a lint rule matching the name would have to
 * spell the name in a configuration file, which is authored source too. This
 * program is the mechanism instead, and it runs as its own pipeline stage.
 *
 * WHY EVERY LINE OF OUTPUT IS MASKED
 *
 * There is exactly one function in this file that writes to a stream, and it
 * masks its argument before writing. Not the findings — *everything*, including
 * headings, counts and the resolved repository root.
 *
 * That is not belt-and-braces. The checkout directory on a build machine is
 * named after the repository, the repository slug carries the prohibited token,
 * and the guard prints the root it resolved as evidence that it looked in the
 * right place. Printing that path unmasked would reproduce the name into a build
 * log, a pipeline annotation and quite possibly a pasted bug report. A single
 * masking writer makes "nothing printed is ever unmasked" a structural property
 * of the program rather than a habit every future call site has to remember.
 *
 * FAIL-CLOSED, THROUGHOUT
 *
 * A guard that cannot fail is not a guard, and a green log line is not evidence
 * of a clean tree — it is far more often evidence that nothing was checked. So
 * every way this program can fail to do its job exits non-zero:
 *
 *   - the repository root cannot be resolved;
 *   - a directory or a file cannot be read;
 *   - the walk visited fewer files than the floor the sibling module sets;
 *   - this workspace's own two source files were not reached by the scan;
 *   - anything at all throws.
 *
 * Four outcomes, four distinct exit codes, all of them from the sibling module.
 * The self-check failure is deliberately its own code: "the tree is dirty" and
 * "the guard is compromised" mean very different things to whoever reads the
 * pipeline, and the second invalidates every other result from the same run.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 *   - **It never opens a frame, and never reads the corpus directory.** The
 *     corpus is skipped by path prefix *before* any directory read, because the
 *     corpus-handling rule prohibits surveying, enumerating, sampling and
 *     scanning it — and calling a directory read on it would itself be an
 *     enumeration. Skip-before-descend is a rule obligation here, not a
 *     performance choice.
 *   - **It never hashes anything and never counts frames.** Byte-identity and
 *     the corpus file count belong to the corpus-integrity guard, by metadata
 *     alone. Duplicating that here would mean reading bytes this program has no
 *     business touching.
 *   - **It takes no authorization decision and knows no identity.** No
 *     workspace, no actor, no session, no credential, no network. It is a
 *     build-time utility and never a runtime dependency of the server or the
 *     client.
 *   - **It does not detect evasion** — an escaped, entity-encoded or
 *     concatenation-split spelling. That is out of scope by design: the one case
 *     where it would matter is this workspace's own source, and the self-check
 *     covers exactly that.
 *   - **It does not scan for sample entity names** from the corpus. One of them
 *     is also a legitimate account type in this product's own role enumeration,
 *     so such a scan would fire on correct code constantly. That discipline is
 *     enforced by authoring.
 *
 * IMPORTS
 *
 * Three Node built-ins and the sibling module. Nothing else, ever: the workspace
 * manifest declares no dependencies at all, so a third-party import would not
 * install, and importing a product package would make a build-time guard part of
 * the product's dependency graph.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';
import process from 'node:process';

import {
  ALLOWLIST,
  BINARY_FILE_EXTENSIONS,
  EXIT_CODES,
  MASK,
  MAX_ROOT_ASCENT,
  MINIMUM_SCANNED_FILE_COUNT,
  NON_SOURCE_DIRECTORIES,
  NUL_BYTE,
  SCANNED_FILENAMES,
  SELF_CHECK_TARGETS,
  TEXT_FILE_EXTENSIONS,
  TOKEN_MODULE_PATH,
  EXPECTED_PALETTE_LITERAL_COUNT,
  WORKSPACE_ROOT_MARKER,
  buildCitationPattern,
  buildHexColourPattern,
  buildTokenPattern,
  type ExitCode,
} from './allowlist.js';

// ---------------------------------------------------------------------------
// Presentation constants.
//
// A deliberate distinction, and worth stating because the two kinds of value
// look alike in a diff. Every value that decides *what the guard enforces* — the
// exempt paths, the non-source directories, the exit codes, the file-type
// bounds, the root marker, the ascent ceiling, the scanned-file floor, the
// self-check targets, the mask text and the patterns themselves — lives in the
// sibling module, so that a reviewer can audit the whole enforcement surface by
// reading one file. This file holds none of those.
//
// What it does hold is how a report reads: column labels, section headings, the
// width an excerpt is trimmed to, the marker that stands in for elided text.
// Those are authored prose and layout, they belong to the reporter, and they
// change nothing about what counts as a finding. They are still declared once,
// here, and referred to by name — a literal at a point of use is a defect
// whatever kind of value it is.
// ---------------------------------------------------------------------------

/** The separator every reported and compared path uses, on every platform. */
const PATH_SEPARATOR = '/';

/** Line terminator the content pass splits on. */
const LINE_FEED = '\n';

/** Trailing character of a carriage-return line ending, stripped before scanning. */
const CARRIAGE_RETURN = '\r';

/** Encoding file contents are decoded with once the binary sniff has passed. */
const TEXT_ENCODING = 'utf8';

/** First line of a file, as a report names it. Line and column are 1-based. */
const FIRST_LINE_NUMBER = 1;

/** First column of a line, as a report names it. */
const FIRST_COLUMN_NUMBER = 1;

/** Index of the first character of a string. */
const STRING_START_INDEX = 0;

/** What `indexOf` returns when it finds nothing. */
const NOT_FOUND_INDEX = -1;

/** The size of an empty collection, for the emptiness tests below. */
const EMPTY_COUNT = 0;

/** Longest excerpt a report will print for one line. */
const MAX_EXCERPT_LENGTH = 160;

/** Characters of context kept ahead of the anchor when an excerpt is windowed. */
const EXCERPT_CONTEXT_RADIUS = 48;

/** Stands in for text elided from either end of a windowed excerpt. */
const TRUNCATION_MARKER = '…';

/** Separates the fields of a one-line finding. */
const FIELD_SEPARATOR = ' · ';

/** Leading indent for a finding or a detail line under a heading. */
const DETAIL_INDENT = '  ';

/** Where positional arguments begin in the raw argument vector. */
const SCRIPT_ARGUMENT_OFFSET = 2;

/** How many positional arguments this program accepts. */
const MAX_POSITIONAL_ARGUMENTS = 1;

/** Prefix that marks an argument as a flag, none of which are accepted. */
const FLAG_PREFIX = '-';

// ---------------------------------------------------------------------------
// The shapes a run produces.
// ---------------------------------------------------------------------------

/**
 * A single reported occurrence.
 *
 * Modelled as a discriminated union with every field required, and no optional
 * property anywhere. That is not stylistic: the compiler configuration treats an
 * optional property and an explicitly-undefined one as different types, so a
 * record with `line?: number` would force every construction site to decide
 * whether to omit the key or set it to undefined. More importantly, a path
 * finding genuinely has no line — there is no line in a file name — and giving
 * it a nullable line would invite a report that prints a fabricated one. A
 * separate variant says the honest thing in the type system.
 */
type Finding =
  | {
      /** The name of a file or directory carries the prohibited token. */
      readonly kind: 'path-name';
      readonly path: string;
      readonly entry: EntryKind;
    }
  | {
      /** A URL-encoded frame-citation filename appears in a file's contents. */
      readonly kind: 'citation-form';
      readonly path: string;
      readonly line: number;
      readonly column: number;
      readonly excerpt: string;
      readonly frameNumber: string;
    }
  | {
      /** The bare name, in any casing, appears in a file's contents. */
      readonly kind: 'bare-name';
      readonly path: string;
      readonly line: number;
      readonly column: number;
      readonly excerpt: string;
    }
  | {
      /** The token module holds a different number of colours than expected. */
      readonly kind: 'palette-count';
      readonly path: string;
      readonly observed: number;
      readonly expected: number;
    }
  | {
      /** A colour value appears in a file that is not the token module. */
      readonly kind: 'palette-escape';
      readonly path: string;
      readonly line: number;
      readonly column: number;
      readonly excerpt: string;
    };

/** What a directory entry is, as far as the walk needs to care. */
type EntryKind = 'directory' | 'file' | 'symlink' | 'other';

/**
 * Something the guard could not read.
 *
 * Collected rather than thrown, so that one unreadable file does not hide the
 * findings in every file after it. The run still exits with the guard-failure
 * code: an unread file is an unchecked file, and the guard has no standing to
 * call a tree clean when part of it was never looked at.
 */
interface ReadFailure {
  readonly path: string;
  readonly subject: 'directory' | 'file';
  readonly reason: string;
}

/**
 * Everything one walk accumulates.
 *
 * Mutable on purpose. The alternative — returning a fresh immutable record from
 * every recursive step and merging upward — allocates a copy of the growing
 * finding list at every directory, and buys nothing here: the walk is
 * single-threaded, sequential, and the only writer.
 *
 * The counters are the report's evidence that the walk actually happened, which
 * is why there are four of them rather than one. "Nothing found" and "nothing
 * looked at" produce the same empty finding list and must never produce the same
 * verdict.
 */
interface ScanState {
  readonly findings: Finding[];
  readonly readFailures: ReadFailure[];
  /** Repository-relative paths whose contents were decoded and scanned. */
  readonly contentScanned: Set<string>;
  /** Exempt entries actually encountered, so the report can prove each was honoured. */
  readonly allowlistHonoured: Set<string>;
  /** Colour values found in the token module, deduplicated and lower-cased. */
  readonly paletteLiterals: Set<string>;
  /** Files whose contents were read and scanned. */
  filesRead: number;
  /** Files reached by the walk, whether or not their contents were read. */
  filesSeen: number;
  /** Directories whose contents were listed. */
  directoriesEntered: number;
  /** Directories skipped without being listed at all. */
  directoriesSkipped: number;
}

/** A fresh, empty accumulator. */
function createScanState(): ScanState {
  return {
    findings: [],
    readFailures: [],
    contentScanned: new Set<string>(),
    allowlistHonoured: new Set<string>(),
    paletteLiterals: new Set<string>(),
    filesRead: 0,
    filesSeen: 0,
    directoriesEntered: 0,
    directoriesSkipped: 0,
  };
}

// ---------------------------------------------------------------------------
// The output funnel.
//
// Two functions write to a stream and nothing else does. Both mask. See the file
// header for why that matters more here than it looks like it should: the
// resolved repository root is itself a path that carries the prohibited token on
// a build machine, and it is printed on every run as evidence.
// ---------------------------------------------------------------------------

/**
 * Replaces every occurrence of the prohibited name in a string with the mask.
 *
 * A fresh pattern per call, because the factory returns a global pattern and a
 * global pattern carries `lastIndex` between uses. Sharing one instance would
 * make the second call start part-way through its input and silently leave an
 * occurrence unmasked — the one failure mode this function must not have.
 *
 * Idempotent: the mask text spells nothing, so masking already-masked text
 * changes nothing. That is what lets callers mask an excerpt when they build it
 * and mask it again on the way out without having to reason about which happened.
 */
function maskText(value: string): string {
  return value.replace(buildTokenPattern(), MASK);
}

/** Writes one masked line to standard output. */
function report(line: string): void {
  console.log(maskText(line));
}

/**
 * Writes one masked line to standard error.
 *
 * Used only for the guard's own failures — a missing root, an unreadable file, an
 * unexpected throw. Findings go to standard output because they are the result;
 * these go to standard error because they mean there is no trustworthy result.
 */
function reportFailure(line: string): void {
  console.error(maskText(line));
}

// ---------------------------------------------------------------------------
// Paths.
//
// Every path this program compares, stores or prints is repository-root-relative
// and uses forward slashes, whatever the host separator is. Two reasons, both
// load-bearing: the exempt entries are written with forward slashes, so a prefix
// test against a back-slashed path would silently match nothing and exempt
// nothing; and a report that names the same file differently on two machines is
// harder to act on than one that does not.
// ---------------------------------------------------------------------------

/** Rewrites host separators to the one form everything downstream expects. */
function toPosixPath(value: string): string {
  return sep === PATH_SEPARATOR ? value : value.split(sep).join(PATH_SEPARATOR);
}

/** Joins a parent's repository-relative path to a child's name. */
function joinRelative(parentRelativePath: string, name: string): string {
  return parentRelativePath === ''
    ? name
    : `${parentRelativePath}${PATH_SEPARATOR}${name}`;
}

/**
 * Widening membership test for the sibling module's frozen tuples.
 *
 * Each of those tuples is declared `as const`, so its element type is a union of
 * string literals and its own `includes` will not accept an arbitrary string —
 * the compiler rejects the call before it can be useful. Widening the parameter
 * to `readonly string[]` at this one boundary is the whole fix, and it costs
 * nothing: the tuples stay literal-typed and frozen where they are declared, and
 * only the comparison is widened.
 */
function containsValue(values: readonly string[], candidate: string): boolean {
  return values.includes(candidate);
}

/**
 * Finds the exempt entry covering a path, or null when none does.
 *
 * A directory entry in the exempt list carries a trailing separator and is tested
 * as a prefix; a file entry carries none and is tested as an exact match. The
 * distinction is what keeps a file entry from behaving as a prefix and silently
 * exempting a sibling whose name merely begins the same way.
 *
 * A directory's own path is tested with a separator appended, so that a directory
 * matches its exempt prefix exactly while a differently-named sibling that starts
 * with the same characters does not.
 */
function findExemptEntry(relativePath: string, entry: EntryKind): string | null {
  const candidate =
    entry === 'directory' ? `${relativePath}${PATH_SEPARATOR}` : relativePath;

  for (const exempt of ALLOWLIST) {
    if (exempt.endsWith(PATH_SEPARATOR)) {
      if (candidate.startsWith(exempt)) {
        return exempt;
      }
    } else if (relativePath === exempt) {
      return exempt;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Resolving the repository root, fail-closed.
// ---------------------------------------------------------------------------

/** True when a path exists and is a regular file. */
async function isFile(absolutePath: string): Promise<boolean> {
  try {
    const stats = await stat(absolutePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Climbs from a starting directory until it finds the workspace marker.
 *
 * The working directory is emphatically *not* the repository root. This program
 * is invoked through the package manager with a workspace filter, so it starts in
 * its own workspace directory, two levels down. Taking that for the root would
 * make the walk begin where it would find this workspace's two files, report a
 * clean tree, and have checked essentially nothing — a false green, which is the
 * worst result a guard can produce.
 *
 * The climb is bounded by the ceiling the sibling module sets. An unbounded climb
 * from a misconfigured checkout walks out of the repository and can find some
 * unrelated marker elsewhere on the host, which is a far worse failure than not
 * finding one at all. Bounded and loud beats unbounded and lucky.
 *
 * Returns null rather than throwing, because the caller turns "no root" into the
 * guard-failure exit code and an authored diagnostic. It is never a clean run.
 */
async function resolveRepositoryRoot(
  startDirectory: string,
): Promise<string | null> {
  let current = resolve(startDirectory);

  for (let ascent = 0; ascent <= MAX_ROOT_ASCENT; ascent += 1) {
    if (await isFile(join(current, WORKSPACE_ROOT_MARKER))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) {
      // The filesystem root. There is nowhere further to climb.
      return null;
    }

    current = parent;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Arguments.
//
// The surface is deliberately almost empty. There is no fix flag, no rewrite
// flag, no normalisation flag and no environment variable that changes
// behaviour — a guard whose strictness is configurable at the call site is a
// guard that will eventually be called the lenient way. The single accepted
// argument is a directory to begin the root search from, which exists so the
// program can be pointed at a checkout other than the one it happens to be
// running inside, and it is validated exactly as fail-closed as everything else.
// ---------------------------------------------------------------------------

/** Either the validated start directory, or the reason it could not be used. */
type ArgumentOutcome =
  | { readonly ok: true; readonly startDirectory: string }
  | { readonly ok: false; readonly reason: string };

/** Validates the argument vector, rejecting anything beyond one directory. */
function readArguments(argv: readonly string[]): ArgumentOutcome {
  const positional = argv.slice(SCRIPT_ARGUMENT_OFFSET);

  if (positional.length > MAX_POSITIONAL_ARGUMENTS) {
    return {
      ok: false,
      reason:
        'Too many arguments. This guard accepts at most one: a directory to begin the search for the repository root from. It has no options, and none will be added — every other aspect of what it enforces is fixed in its operating table so that it cannot be invoked in a weaker mode.',
    };
  }

  const first = positional[0];
  if (first === undefined) {
    return { ok: true, startDirectory: process.cwd() };
  }

  if (first.startsWith(FLAG_PREFIX)) {
    return {
      ok: false,
      reason:
        'Unrecognised option. This guard takes no options at all: there is no fix mode, no rewrite mode and no way to relax what it looks for. Its only argument is a directory to begin the search for the repository root from.',
    };
  }

  if (first === '') {
    return {
      ok: false,
      reason:
        'The start directory is empty. Pass a directory inside the checkout to search upward from, or pass nothing and let the guard start from the working directory.',
    };
  }

  return { ok: true, startDirectory: first };
}

/**
 * Renders an unknown thrown value as a printable reason.
 *
 * The compiler types a caught value as unknown, which is correct — anything can
 * be thrown — so every failure path narrows before reporting rather than assuming
 * a message property is there.
 */
function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

// ---------------------------------------------------------------------------
// Deciding whether a file's bytes are text.
//
// Three answers rather than two, and the third is the interesting one. A file
// whose extension appears in neither of the sibling module's lists is *unknown*,
// not exempt — treating it as exempt would let a new file type into the tree
// unscanned, which is a silent hole rather than a loud one. So an unknown
// extension is opened and decided on its bytes.
// ---------------------------------------------------------------------------

/** How a file's name classifies its contents before anything is opened. */
type ContentClassification = 'known-text' | 'known-binary' | 'unknown';

/** Classifies a file by its exact name first, then by its extension. */
function classifyByName(fileName: string): ContentClassification {
  // Exact name first: these are extensionless or begin with a dot, so an
  // extension split reads nothing useful from them.
  if (containsValue(SCANNED_FILENAMES, fileName)) {
    return 'known-text';
  }

  const extension = extname(fileName).toLowerCase();

  if (containsValue(BINARY_FILE_EXTENSIONS, extension)) {
    return 'known-binary';
  }

  if (containsValue(TEXT_FILE_EXTENSIONS, extension)) {
    return 'known-text';
  }

  return 'unknown';
}

// ---------------------------------------------------------------------------
// Building a printable excerpt.
//
// Two rules govern everything below. Masking happens *before* any slicing, so a
// window boundary can only ever fall inside mask text and never part-way through
// a matched occurrence — slicing first and masking second would leave a partial
// spelling in the report, which is the subtle version of the mistake this whole
// program exists to prevent. And every finding carries its own line and column,
// so an excerpt's job is orientation rather than precision; it does not have to
// point at the exact occurrence, only to help a reader recognise the line.
// ---------------------------------------------------------------------------

/** Placeholder for a frame number a citation match did not yield. */
const UNRECORDED_FRAME_NUMBER = 'unrecorded';

/** The smallest advance that guarantees a scanning loop makes progress. */
const ONE_CHARACTER = 1;

/**
 * Masks everything a report must not echo: the prohibited name, and any colour
 * value.
 *
 * Colour is masked for the same reason the name is. The palette is authored and
 * belongs in exactly one file, so printing a value out of some other file into a
 * build log would put it in a second place — and the finding is the *location* of
 * the value, never the value itself. Masking both here, at excerpt construction,
 * is what lets the output funnel stay concerned with only the name: a colour
 * value never reaches it.
 */
function maskAll(value: string): string {
  return maskText(value).replace(buildHexColourPattern(), MASK);
}

/**
 * Trims an already-masked line and, when it is too long to print, windows it.
 *
 * The window is anchored on the first mask on the line, which is the occurrence a
 * reader is most likely looking for. On a line carrying several, the anchor may
 * belong to a different one than the finding being printed; that is a deliberate
 * simplification rather than an oversight, and it costs nothing because the
 * finding's own line and column are printed beside the excerpt.
 */
function buildExcerpt(maskedLine: string): string {
  const collapsed = maskedLine.trim();

  if (collapsed.length <= MAX_EXCERPT_LENGTH) {
    return collapsed;
  }

  const anchor = collapsed.indexOf(MASK);
  const centre = anchor === NOT_FOUND_INDEX ? STRING_START_INDEX : anchor;
  const start = Math.max(STRING_START_INDEX, centre - EXCERPT_CONTEXT_RADIUS);
  const end = Math.min(collapsed.length, start + MAX_EXCERPT_LENGTH);
  const head = start > STRING_START_INDEX ? TRUNCATION_MARKER : '';
  const tail = end < collapsed.length ? TRUNCATION_MARKER : '';

  return `${head}${collapsed.slice(start, end)}${tail}`;
}

// ---------------------------------------------------------------------------
// Pass 1 — path names, of files and of directories alike.
//
// The governing rule prohibits the token in file names and directory names as
// well as in content, so a content-only scan would miss a badly named module or
// folder completely: there is nothing inside such a file to find, and the defect
// is the name. This pass is the reason the walk tests every entry it does not
// skip, rather than only the ones it opens.
// ---------------------------------------------------------------------------

/** Records a finding when an entry's own path carries the prohibited token. */
function checkPathName(
  relativePath: string,
  entry: EntryKind,
  state: ScanState,
): void {
  if (buildTokenPattern().test(relativePath)) {
    state.findings.push({ kind: 'path-name', path: relativePath, entry });
  }
}

// ---------------------------------------------------------------------------
// Pass 2 — file contents, line by line.
// ---------------------------------------------------------------------------

/** Where one URL-encoded frame citation sits on a line, and what it cites. */
interface CitationSpan {
  readonly start: number;
  readonly end: number;
  readonly frameNumber: string;
}

/**
 * Locates every URL-encoded frame citation on a line.
 *
 * Spans are collected first so that the name matches found afterwards can be
 * categorised by containment: a match whose start falls inside one of these spans
 * is part of a citation, and any other match is a bare occurrence. That is a more
 * faithful test than matching the two forms independently, because the citation
 * form *contains* the bare form — scanning for them separately would report the
 * same character run twice, under two categories.
 */
function collectCitationSpans(line: string): CitationSpan[] {
  const spans: CitationSpan[] = [];
  const pattern = buildCitationPattern();

  let match = pattern.exec(line);
  while (match !== null) {
    const captured = match[1];
    spans.push({
      start: match.index,
      end: pattern.lastIndex,
      frameNumber: captured === undefined ? UNRECORDED_FRAME_NUMBER : captured,
    });

    // A zero-width match would leave `lastIndex` where it was and spin forever.
    // Neither pattern can produce one today; this keeps that from becoming a hang
    // if one ever changes.
    if (pattern.lastIndex === match.index) {
      pattern.lastIndex += ONE_CHARACTER;
    }

    match = pattern.exec(line);
  }

  return spans;
}

/** Reports every occurrence of the prohibited name on one line. */
function collectNameFindings(
  relativePath: string,
  line: string,
  lineNumber: number,
  state: ScanState,
): void {
  // A fresh instance for the cheap rejection test, because testing with the same
  // global pattern the loop uses would advance its position and skip the first
  // occurrence.
  if (!buildTokenPattern().test(line)) {
    return;
  }

  const citations = collectCitationSpans(line);
  const excerpt = buildExcerpt(maskAll(line));
  const pattern = buildTokenPattern();

  let match = pattern.exec(line);
  while (match !== null) {
    const start = match.index;
    const column = start + FIRST_COLUMN_NUMBER;
    const citation = citations.find(
      (span) => start >= span.start && start < span.end,
    );

    if (citation === undefined) {
      state.findings.push({
        kind: 'bare-name',
        path: relativePath,
        line: lineNumber,
        column,
        excerpt,
      });
    } else {
      state.findings.push({
        kind: 'citation-form',
        path: relativePath,
        line: lineNumber,
        column,
        excerpt,
        frameNumber: citation.frameNumber,
      });
    }

    if (pattern.lastIndex === match.index) {
      pattern.lastIndex += ONE_CHARACTER;
    }

    match = pattern.exec(line);
  }
}

/**
 * Records colour values on one line: collected in the token module, reported
 * anywhere else.
 *
 * The value itself is only ever held in a local and added to a set for counting.
 * It is never printed, and the excerpt it appears in is masked before it can be.
 */
function collectColourFindings(
  relativePath: string,
  line: string,
  lineNumber: number,
  isTokenModule: boolean,
  state: ScanState,
): void {
  const pattern = buildHexColourPattern();

  let match = pattern.exec(line);
  while (match !== null) {
    const start = match.index;
    const value = line.slice(start, pattern.lastIndex).toLowerCase();

    if (isTokenModule) {
      state.paletteLiterals.add(value);
    } else {
      state.findings.push({
        kind: 'palette-escape',
        path: relativePath,
        line: lineNumber,
        column: start + FIRST_COLUMN_NUMBER,
        excerpt: buildExcerpt(maskAll(line)),
      });
    }

    if (pattern.lastIndex === match.index) {
      pattern.lastIndex += ONE_CHARACTER;
    }

    match = pattern.exec(line);
  }
}

/**
 * Scans decoded file contents line by line.
 *
 * Both line endings are handled by splitting on the line feed and stripping a
 * trailing carriage return, which is the only approach that leaves the file
 * untouched. Nothing here rewrites, re-saves or normalises anything: four of the
 * five exempt paths must stay byte-identical, and a scanner that normalised line
 * endings in memory and then wrote anything back would be the fastest way to
 * breach that.
 */
function scanContent(
  relativePath: string,
  content: string,
  state: ScanState,
): void {
  const isTokenModule = relativePath === TOKEN_MODULE_PATH;
  const lines = content.split(LINE_FEED);

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    if (raw === undefined) {
      continue;
    }

    const line = raw.endsWith(CARRIAGE_RETURN)
      ? raw.slice(STRING_START_INDEX, raw.length - CARRIAGE_RETURN.length)
      : raw;
    const lineNumber = index + FIRST_LINE_NUMBER;

    collectNameFindings(relativePath, line, lineNumber, state);
    collectColourFindings(relativePath, line, lineNumber, isTokenModule, state);
  }
}

/**
 * Opens a file, decides whether its bytes are text, and scans it if they are.
 *
 * The null-byte sniff is the backstop the extension lists cannot be: no text
 * encoding this tree uses produces one, so its presence is the cheapest reliable
 * evidence that a file should not be read as text. It is decisive for a file
 * whose extension is unknown and a safety net for one whose extension lied.
 *
 * A read failure is collected rather than thrown. One unreadable file must not
 * hide the findings in every file after it — but it still fails the run, because
 * an unread file is an unchecked file and the guard cannot certify a tree it did
 * not finish reading.
 */
async function scanFile(
  absolutePath: string,
  relativePath: string,
  fileName: string,
  state: ScanState,
): Promise<void> {
  if (classifyByName(fileName) === 'known-binary') {
    return;
  }

  const bytes = await readFileSafely(absolutePath, relativePath, state);
  if (bytes === null) {
    return;
  }

  if (bytes.indexOf(NUL_BYTE) !== NOT_FOUND_INDEX) {
    // Binary after all, whatever the name suggested.
    return;
  }

  state.filesRead += 1;
  state.contentScanned.add(relativePath);
  scanContent(relativePath, bytes.toString(TEXT_ENCODING), state);
}

/**
 * Reads a file's bytes, or records why it could not be read and returns null.
 *
 * A helper rather than an inline try block so that the buffer's type is inferred
 * from the call. Annotating it by hand would tie this file to whichever buffer
 * generic the installed platform types happen to use, which is a version detail
 * this program has no reason to encode.
 */
async function readFileSafely(
  absolutePath: string,
  relativePath: string,
  state: ScanState,
) {
  try {
    return await readFile(absolutePath);
  } catch (error: unknown) {
    state.readFailures.push({
      path: relativePath,
      subject: 'file',
      reason: describeError(error),
    });
    return null;
  }
}

// ---------------------------------------------------------------------------
// The walk.
//
// The order of the three steps below is the whole design, and it is an obligation
// rather than an optimisation.
//
//   1. A directory that is not source is skipped **without being listed**.
//   2. An exempt path is skipped **without being listed**.
//   3. Only then is the entry considered for the path pass and, if it is a file,
//      for the content pass.
//
// Step 2 running before any directory read is what discharges the corpus
// obligation. The corpus-handling rule prohibits surveying, enumerating, sampling
// and scanning the corpus — and asking the filesystem to list that directory
// *is* an enumeration, before a single frame is opened. Testing the path first
// means the corpus directory is recognised and stepped over while it is still just
// a name. It is never listed, never opened, never counted and never hashed.
//
// Reordering these steps would look like a harmless refactor and would breach the
// rule on the very next run.
// ---------------------------------------------------------------------------

/** Lists a directory, or records why it could not be listed and returns null. */
async function readDirectorySafely(
  absoluteDirectory: string,
  relativeDirectory: string,
  state: ScanState,
) {
  try {
    return await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error: unknown) {
    state.readFailures.push({
      path: relativeDirectory === '' ? PATH_SEPARATOR : relativeDirectory,
      subject: 'directory',
      reason: describeError(error),
    });
    return null;
  }
}

/**
 * Walks one directory and, where permitted, its children.
 *
 * Recursion is bounded by the tree itself because symbolic links are never
 * followed. A link is treated as a leaf: its own name is checked, and then it is
 * stepped over. Following one could escape the repository entirely, or loop
 * forever through a cycle, or scan the same bytes twice under two names — and none
 * of those is a risk worth taking for a target that, by definition, is already
 * reachable somewhere else in the tree.
 */
async function walk(
  absoluteDirectory: string,
  relativeDirectory: string,
  state: ScanState,
): Promise<void> {
  const entries = await readDirectorySafely(
    absoluteDirectory,
    relativeDirectory,
    state,
  );
  if (entries === null) {
    return;
  }

  state.directoriesEntered += 1;

  for (const dirent of entries) {
    const name = dirent.name;
    const absolutePath = join(absoluteDirectory, name);
    const relativePath = joinRelative(relativeDirectory, toPosixPath(name));

    // A symbolic link is classified as one before anything else, so that a link
    // to a directory is never mistaken for a directory and descended into.
    const entry: EntryKind = dirent.isSymbolicLink()
      ? 'symlink'
      : dirent.isDirectory()
        ? 'directory'
        : dirent.isFile()
          ? 'file'
          : 'other';

    // Step 1 — not source at all. Matched by name at any depth, because each of
    // these can appear in any workspace as well as at the root.
    if (entry === 'directory' && containsValue(NON_SOURCE_DIRECTORIES, name)) {
      state.directoriesSkipped += 1;
      continue;
    }

    // Step 2 — an exempt read-only input, skipped before it is ever listed.
    const exempt = findExemptEntry(relativePath, entry);
    if (exempt !== null) {
      state.allowlistHonoured.add(exempt);
      if (entry === 'directory') {
        state.directoriesSkipped += 1;
      }
      continue;
    }

    // Step 3a — the entry's own name, whether it is a file or a directory.
    checkPathName(relativePath, entry, state);

    if (entry === 'directory') {
      await walk(absolutePath, relativePath, state);
      continue;
    }

    state.filesSeen += 1;

    if (entry !== 'file') {
      continue;
    }

    // Step 3b — the entry's contents.
    await scanFile(absolutePath, relativePath, name, state);
  }
}

// ---------------------------------------------------------------------------
// The self-check.
//
// Two assertions, and they fail differently on purpose.
//
// The targets are this workspace's `.ts` **source** files, never its compiled
// output. The rule governs source, and the compiled copy is a different thing: it
// necessarily reconstructs the searched-for name in memory at run time, so
// scanning it would report a finding that is not a defect. That is exactly why the
// build directory sits in the non-source skip set, and why moving it out of that
// set would make this program fail against itself.
//
// This is deliberately a filter over the results the walk already produced rather
// than a second read of the same two files. One code path decides what counts as
// an occurrence, so the guard cannot hold itself to a different standard than it
// holds the rest of the tree to — which is the only standard worth holding.
// ---------------------------------------------------------------------------

/** Whether a finding is a prohibited-name finding rather than a palette note. */
function isNameFinding(finding: Finding): boolean {
  return (
    finding.kind === 'path-name' ||
    finding.kind === 'citation-form' ||
    finding.kind === 'bare-name'
  );
}

/** The three things the self-check can conclude. */
type SelfCheckOutcome =
  | { readonly status: 'passed' }
  | { readonly status: 'not-visited'; readonly missing: readonly string[] }
  | { readonly status: 'compromised'; readonly findings: readonly Finding[] };

/** Asserts this workspace's own source was both reached and clean. */
function runSelfCheck(state: ScanState): SelfCheckOutcome {
  const missing = SELF_CHECK_TARGETS.filter(
    (target) => !state.contentScanned.has(target),
  );

  if (missing.length > EMPTY_COUNT) {
    return { status: 'not-visited', missing };
  }

  const compromised = state.findings.filter(
    (finding) =>
      isNameFinding(finding) && containsValue(SELF_CHECK_TARGETS, finding.path),
  );

  if (compromised.length > EMPTY_COUNT) {
    return { status: 'compromised', findings: compromised };
  }

  return { status: 'passed' };
}

// ---------------------------------------------------------------------------
// The palette observation — complementary, advisory, and never decisive.
//
// The same rule that bars the product name also bars sampling colour from a
// frame, and the theme decision record fixes an authored palette and confines it
// to one module. This check reports what the delivered tree actually looks like
// against that: how many distinct colour values the token module carries, and
// which other files carry one at all.
//
// It is reported in its own section and contributes nothing to the exit code, and
// that is a considered decision rather than timidity. Three reasons, each on its
// own sufficient:
//
//   - The repository lint configuration already confines colour literals to the
//     token module across every workspace, and fails the build when one appears
//     elsewhere in code. The two mechanisms are complementary rather than
//     duplicative — lint blocks the authoring intent at the moment a value is
//     typed into the wrong file, while this reads the artifact that was actually
//     delivered, including the file types lint never parses — but the enforcing
//     half of the job is already done and done earlier.
//   - The decision record that documents the palette is authored prose inside the
//     scanned tree, and documenting the values is its entire purpose. Failing a
//     build because the document that explains the palette contains the palette
//     would report a defect that is not one.
//   - The expected count describes the authored palette. A token module that
//     later gains a value for a different reason — an elevation tint, say — would
//     be correct and would still miss the count.
//
// So it informs a reviewer and never blocks anyone. What it must never do is
// interfere with the name scan: no palette result masks, reorders, suppresses or
// outranks a single name occurrence. That scan is this workspace's reason to
// exist; this is an addition to it.
//
// When the token module does not exist — which it does not until the component
// library is built, and this guard is built first — the whole observation is
// not applicable and says so. No values have escaped a home that does not exist
// yet.
// ---------------------------------------------------------------------------

/** What the palette observation concluded, if it could conclude anything. */
type PaletteObservation =
  | { readonly status: 'not-applicable' }
  | {
      readonly status: 'observed';
      readonly distinctCount: number;
      readonly countNotes: readonly Finding[];
      readonly escapes: readonly Finding[];
    };

/** Reads the palette picture out of the walk's results. */
function observePalette(state: ScanState): PaletteObservation {
  if (!state.contentScanned.has(TOKEN_MODULE_PATH)) {
    return { status: 'not-applicable' };
  }

  const distinctCount = state.paletteLiterals.size;
  const countNotes: Finding[] =
    distinctCount === EXPECTED_PALETTE_LITERAL_COUNT
      ? []
      : [
          {
            kind: 'palette-count',
            path: TOKEN_MODULE_PATH,
            observed: distinctCount,
            expected: EXPECTED_PALETTE_LITERAL_COUNT,
          },
        ];

  return {
    status: 'observed',
    distinctCount,
    countNotes,
    escapes: state.findings.filter(
      (finding) => finding.kind === 'palette-escape',
    ),
  };
}

// ---------------------------------------------------------------------------
// Reporting.
//
// Every string below goes out through the masking funnel, so no line in this
// section masks anything itself. That is the point of having one writer: the
// guarantee lives in one place instead of in every call site's memory.
// ---------------------------------------------------------------------------

/** Heading printed above the run's evidence. */
const RUN_HEADING = 'Third-party identity guard';

/** Heading printed above the guard's own failures, on standard error. */
const FAILURE_HEADING = 'Third-party identity guard — could not complete';

/** Renders one finding as a single line, without its indent. */
function describeFinding(finding: Finding): string {
  switch (finding.kind) {
    case 'path-name':
      return `${finding.path}${FIELD_SEPARATOR}${finding.entry} name`;
    case 'citation-form':
      return [
        finding.path,
        `line ${finding.line}`,
        `column ${finding.column}`,
        `cites frame ${finding.frameNumber}`,
        finding.excerpt,
      ].join(FIELD_SEPARATOR);
    case 'bare-name':
      return [
        finding.path,
        `line ${finding.line}`,
        `column ${finding.column}`,
        finding.excerpt,
      ].join(FIELD_SEPARATOR);
    case 'palette-count':
      return `${finding.path}${FIELD_SEPARATOR}${finding.observed} distinct colour values${FIELD_SEPARATOR}the authored palette has ${finding.expected}`;
    case 'palette-escape':
      return [
        finding.path,
        `line ${finding.line}`,
        `column ${finding.column}`,
        finding.excerpt,
      ].join(FIELD_SEPARATOR);
  }
}

/** Prints a heading, its guidance and its findings, or nothing when it is empty. */
function reportSection(
  heading: string,
  guidance: string,
  findings: readonly Finding[],
): void {
  if (findings.length === EMPTY_COUNT) {
    return;
  }

  report('');
  report(`${heading} (${findings.length})`);
  report(`${DETAIL_INDENT}${guidance}`);
  report('');

  for (const finding of findings) {
    report(`${DETAIL_INDENT}${describeFinding(finding)}`);
  }
}

// ---------------------------------------------------------------------------
// Authored guidance, one paragraph per category.
//
// Each one tells a reader what to do rather than only what went wrong, because
// two of these categories have a remedy that is not the obvious one. Every word
// is authored for this project: none of it is transcribed from anywhere, and none
// of it names the thing it is about.
// ---------------------------------------------------------------------------

const PATH_NAME_GUIDANCE =
  'Rename these. The rule covers file names and directory names as well as file contents, so a name alone is a violation even when nothing inside the file is. Choose a name that describes what the code does.';

const CITATION_GUIDANCE =
  'Cite the frame by its number alone. These are encoded corpus filenames, and the corpus is a read-only input that may not be renamed, so the filename cannot be cleaned up at its source — which is precisely why authored code never writes one down. The measurement tool resolves a frame number to a path at run time from a pattern that carries no third-party name; use that, and cite the number in prose, in a comment or in a test.';

const BARE_NAME_GUIDANCE =
  'Remove these. Only behaviour and layout may be reproduced from the source frames, never identity, so describe the third party functionally where one has to be referred to at all — a cloud-drive app, a conferencing app, the built-in assistant app. Interface copy is authored for this product and lives in the shared copy module.';

const PALETTE_COUNT_GUIDANCE =
  'Advisory only, and it changes no verdict. The token module holds a different number of distinct colour values than the authored palette does. A shortfall usually means the palette was not fully transcribed; a surplus means a value was added from somewhere, and the palette supplied in the brief is the only permitted source.';

const PALETTE_ESCAPE_GUIDANCE =
  'Advisory only, and it changes no verdict. A colour value appears outside the token module. In code that is already a lint failure; in a stylesheet, a document or a data file it is not, which is why it is surfaced here. A decision record that documents the palette is an expected entry in this list and needs no action.';

/** Prints the evidence that the walk happened, and how far it reached. */
function reportSummary(
  repositoryRoot: string,
  state: ScanState,
  palette: PaletteObservation,
): void {
  report(RUN_HEADING);
  report('');
  report(`${DETAIL_INDENT}Repository root       ${repositoryRoot}`);
  report(`${DETAIL_INDENT}Directories entered   ${state.directoriesEntered}`);
  report(`${DETAIL_INDENT}Directories skipped   ${state.directoriesSkipped}`);
  report(`${DETAIL_INDENT}Files reached         ${state.filesSeen}`);
  report(`${DETAIL_INDENT}Files read            ${state.filesRead}`);
  report(
    `${DETAIL_INDENT}Exempt inputs         ${state.allowlistHonoured.size} of ${ALLOWLIST.length} encountered`,
  );

  for (const exempt of ALLOWLIST) {
    const encountered = state.allowlistHonoured.has(exempt);
    const note = encountered
      ? 'skipped without being read'
      : 'not present in this tree';
    report(`${DETAIL_INDENT}${DETAIL_INDENT}${exempt}${FIELD_SEPARATOR}${note}`);
  }

  const paletteNote =
    palette.status === 'not-applicable'
      ? 'token module not present — not applicable'
      : `${palette.distinctCount} distinct colour values in the token module`;
  report(`${DETAIL_INDENT}Palette observation   ${paletteNote}`);
}

/**
 * Collects every reason the guard could not vouch for this run.
 *
 * Returned as a list rather than as the first reason found, because a reader
 * fixing a broken guard wants all of them at once — and because the count itself
 * is informative.
 */
function collectGuardFailures(
  state: ScanState,
  selfCheck: SelfCheckOutcome,
): string[] {
  const reasons: string[] = [];

  if (state.filesRead < MINIMUM_SCANNED_FILE_COUNT) {
    reasons.push(
      `The walk read ${state.filesRead} files, below the floor of ${MINIMUM_SCANNED_FILE_COUNT}. Finding nothing and looking at nothing produce the same empty result, so a walk this shallow proves nothing and is reported as a failure rather than as a clean tree. The usual cause is a start directory outside the checkout, or a skip rule that grew too broad.`,
    );
  }

  if (selfCheck.status === 'not-visited') {
    reasons.push(
      `The guard's own source was not reached by the content scan: ${selfCheck.missing.join(', ')}. A guard that cannot find itself has no standing to certify anything else, so this is a failure and never a pass. Check the resolved root above, the skip rules and the scanned-extension table.`,
    );
  }

  for (const failure of state.readFailures) {
    reasons.push(
      `Unreadable ${failure.subject}: ${failure.path}${FIELD_SEPARATOR}${failure.reason}. An unread path is an unchecked path, so the run fails rather than reporting on the part of the tree it did manage to read.`,
    );
  }

  return reasons;
}

/** Prints the guard's own failures, on standard error. */
function reportGuardFailures(reasons: readonly string[]): void {
  if (reasons.length === EMPTY_COUNT) {
    return;
  }

  reportFailure('');
  reportFailure(`${FAILURE_HEADING} (${reasons.length})`);
  reportFailure('');

  for (const reason of reasons) {
    reportFailure(`${DETAIL_INDENT}${reason}`);
  }
}

/** Prints the self-check banner when the guard's own source is compromised. */
function reportCompromise(selfCheck: SelfCheckOutcome): void {
  if (selfCheck.status !== 'compromised') {
    return;
  }

  reportFailure('');
  reportFailure(
    `${FAILURE_HEADING} — its own source carries the prohibited name (${selfCheck.findings.length})`,
  );
  reportFailure('');
  reportFailure(
    `${DETAIL_INDENT}Every other result from this run is untrustworthy. This workspace searches for a name it may not itself contain, which is why the name lives in its operating table as character codes and is reassembled at run time. A literal has been introduced somewhere in the two source files, and the most common way that happens is citing a project rule by its identifier: every rule identifier contains the token. Refer to the rule by subject instead.`,
  );
  reportFailure('');
  reportFailure(
    `${DETAIL_INDENT}Remove the literal. Do not relax this check to accommodate it — the check working is the only evidence the rest of the run means anything.`,
  );
  reportFailure('');

  for (const finding of selfCheck.findings) {
    reportFailure(`${DETAIL_INDENT}${describeFinding(finding)}`);
  }
}

/**
 * Chooses the exit code.
 *
 * Precedence, and each step earns its place:
 *
 *   1. A compromised guard outranks everything, because it invalidates every
 *      other result the same run produced — including a clean one.
 *   2. Then the guard's own failures, which mean the tree was not fully checked.
 *      Reported as a distinct code from an occurrence so that a reader can tell
 *      "your tree is dirty" from "this tool did not work" at a glance.
 *   3. Then occurrences, which mean the guard worked and the tree needs a change.
 *   4. Only then clean, and only when the counters above show the walk really
 *      looked.
 *
 * Palette results appear nowhere in this function. They are advisory by design and
 * must never change a verdict.
 */
function chooseExitCode(
  selfCheck: SelfCheckOutcome,
  guardFailures: readonly string[],
  nameFindings: readonly Finding[],
): ExitCode {
  if (selfCheck.status === 'compromised') {
    return EXIT_CODES.SELF_CHECK_FAILURE;
  }

  if (guardFailures.length > EMPTY_COUNT) {
    return EXIT_CODES.GUARD_FAILURE;
  }

  if (nameFindings.length > EMPTY_COUNT) {
    return EXIT_CODES.OCCURRENCES_FOUND;
  }

  return EXIT_CODES.CLEAN;
}

/** Prints the one-line verdict that matches the chosen exit code. */
function reportVerdict(code: ExitCode, nameFindings: readonly Finding[]): void {
  report('');

  switch (code) {
    case EXIT_CODES.CLEAN:
      report(
        'Verdict: clean. No prohibited third-party name appears in any path or any file outside the five read-only inputs.',
      );
      return;
    case EXIT_CODES.OCCURRENCES_FOUND:
      report(
        `Verdict: ${nameFindings.length} prohibited occurrences. Each is listed above with the path and, for a match in a file, the line and column.`,
      );
      return;
    case EXIT_CODES.GUARD_FAILURE:
      report(
        'Verdict: the guard could not complete, so this tree is unverified. The reasons are on standard error. An unverified tree is not a clean tree.',
      );
      return;
    case EXIT_CODES.SELF_CHECK_FAILURE:
      report(
        "Verdict: the guard's own source is compromised and no result from this run can be trusted. The details are on standard error.",
      );
      return;
  }
}

// ---------------------------------------------------------------------------
// The run.
// ---------------------------------------------------------------------------

/**
 * Resolves the root, walks the tree, reports, and returns the exit code.
 *
 * Returns a code rather than exiting, so that the single place a code reaches the
 * process is the handler below. That keeps the two ways this program can end — a
 * completed run and an unexpected throw — from ever disagreeing about how the
 * process should terminate.
 */
async function run(): Promise<ExitCode> {
  const parsed = readArguments(process.argv);
  if (!parsed.ok) {
    reportGuardFailures([parsed.reason]);
    return EXIT_CODES.GUARD_FAILURE;
  }

  const repositoryRoot = await resolveRepositoryRoot(parsed.startDirectory);
  if (repositoryRoot === null) {
    reportGuardFailures([
      `The repository root could not be resolved. The guard looked for "${WORKSPACE_ROOT_MARKER}" in ${parsed.startDirectory} and in up to ${MAX_ROOT_ASCENT} directories above it, and found none. Every path this guard compares and prints is relative to that root, so without it there is nothing to walk — and a run that cannot start is a failure, never a clean tree.`,
    ]);
    return EXIT_CODES.GUARD_FAILURE;
  }

  const state = createScanState();
  await walk(repositoryRoot, '', state);

  const selfCheck = runSelfCheck(state);
  const palette = observePalette(state);
  const guardFailures = collectGuardFailures(state, selfCheck);
  const nameFindings = state.findings.filter(isNameFinding);

  reportSummary(toPosixPath(repositoryRoot), state, palette);

  reportSection(
    'Prohibited name in a path',
    PATH_NAME_GUIDANCE,
    nameFindings.filter((finding) => finding.kind === 'path-name'),
  );
  reportSection(
    'Encoded frame-citation filename in a file',
    CITATION_GUIDANCE,
    nameFindings.filter((finding) => finding.kind === 'citation-form'),
  );
  reportSection(
    'Prohibited name in a file',
    BARE_NAME_GUIDANCE,
    nameFindings.filter((finding) => finding.kind === 'bare-name'),
  );

  if (palette.status === 'observed') {
    reportSection(
      'Palette note — advisory',
      PALETTE_COUNT_GUIDANCE,
      palette.countNotes,
    );
    reportSection(
      'Colour value outside the token module — advisory',
      PALETTE_ESCAPE_GUIDANCE,
      palette.escapes,
    );
  }

  const code = chooseExitCode(selfCheck, guardFailures, nameFindings);

  reportCompromise(selfCheck);
  reportGuardFailures(guardFailures);
  reportVerdict(code, nameFindings);

  return code;
}

// ---------------------------------------------------------------------------
// Entry point.
//
// The exit code is set on the process rather than passed to an exit call, and
// nothing in this file calls one. That is what guarantees buffered output is
// flushed: an explicit exit can terminate the process while written lines are
// still queued on a pipe, which loses exactly the report a failing pipeline stage
// exists to produce. Setting the code and returning lets the runtime drain its
// streams and then exit with it.
//
// The handler is unconditional. Any throw at all — a permission error the walk did
// not anticipate, a platform quirk, a bug in this file — becomes a guard failure
// with the reason printed. Nothing reaches a zero exit by way of an exception.
// ---------------------------------------------------------------------------

try {
  process.exitCode = await run();
} catch (error: unknown) {
  reportGuardFailures([
    `The guard stopped on an unexpected error: ${describeError(error)}. It reports a failure rather than a result, because a run that did not finish has verified nothing.`,
  ]);
  process.exitCode = EXIT_CODES.GUARD_FAILURE;
}
