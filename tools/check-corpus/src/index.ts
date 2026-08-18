/**
 * The corpus-integrity guard: the mechanical proof that the frame corpus is
 * untouched.
 *
 * WHAT THIS PROGRAM VERIFIES
 *
 * Two things, and it exits non-zero if either fails:
 *
 *   1. The file count under the corpus directory is exactly the expected
 *      number of frames, and every entry has the expected extension.
 *   2. Every one of those files is byte-identical to its committed state.
 *
 * Both come straight from the corpus-handling rule, which makes the read-only
 * paths read-only and states the byte-identity obligation outright. That rule is
 * what forces this workspace into existence: three of the five project rules
 * demand a verifiable artifact rather than a promise, and for the corpus this
 * program is that artifact. It runs as its own pipeline stage, and the stage is
 * mandatory — a green pipeline with a skipped stage is not a green pipeline.
 *
 * THE METHOD IS THE SPECIFICATION'S OWN, NOT AN INVENTION
 *
 * The catalog closes its own integrity claim the same way this program does. At
 * `docs/workflows/README.md` L841 it records that the corpus "is immutable and
 * was never modified, renamed, cropped, re-encoded or copied", and that "the
 * check that closes it is that the root listing above and `git status` agree".
 * A directory listing compared against version control is therefore the
 * established method here, and this program formalises it rather than
 * substituting something of its own devising.
 *
 * THREE LEGS, BECAUSE NO SINGLE PROBE CATCHES EVERY SCENARIO
 *
 * Measured against a throwaway repository of synthetic binary fixtures under the
 * same attributes the real corpus carries:
 *
 *   scenario                     status   diff   others   worktree count
 *   pristine                        0       0      0      = expected
 *   same-size byte modification     1       1      0      = expected
 *   deletion                        1       1      0      < expected
 *   rename                        1-2       1    0-1      = expected
 *   untracked addition              1       0      1      > expected
 *   mode change                     1     see below       = expected
 *
 * The middle column is the reason for the third leg: a diff against the commit
 * misses an addition completely, and sees only half of an unstaged rename. And
 * the last column is the reason the first leg refuses to consult version control
 * at all — an ignore rule can hide an addition from the untracked probe, and a
 * count taken from the filesystem still catches it. That was measured too, not
 * assumed: with an ignore entry naming an added file, the untracked probe
 * reported it and the same probe with the exclusion flag reported nothing, while
 * the worktree count caught it either way. The exclusion flag is therefore
 * deliberately not passed.
 *
 *   Leg 1  count and shape, from the filesystem alone.
 *   Leg 2  per-path identity: the working-tree status probe and the
 *          diff-against-the-commit probe must BOTH be empty.
 *   Leg 3  untracked additions, with no exclusion flag.
 *
 * Leg 2 requires both probes because the diff probe's treatment of a mode change
 * depends on how the repository is configured to track file modes, whereas the
 * status probe reports one under either configuration. That divergence from the
 * behaviour recorded elsewhere is named here rather than smoothed over, which is
 * the practice this project retains from the catalog's own quality bar. It is
 * not load-bearing: requiring both probes makes the configuration irrelevant.
 *
 * THE TWO TRAPS THAT SINK A NAIVE IMPLEMENTATION ON A PRISTINE CORPUS
 *
 *   Duplicates. The corpus contains byte-identical frames — eight groups
 *   covering seventeen frames, of which nine are redundant copies, recorded at
 *   `docs/workflows/README.md` L819 and reproduced independently here from
 *   committed object identity. So the path count exceeds the distinct-content
 *   count on an untouched corpus, and any check that collects content hashes
 *   into a set and asserts the set is as large as the frame count fails on a
 *   clean checkout. Every comparison below is per path, never over a set of
 *   distinct hashes.
 *
 *   Size. Distinct byte sizes are fewer than distinct contents, so two frames
 *   share a size while differing in content, and an in-place overwrite that
 *   preserves length is invisible to size comparison. Byte-identity here is
 *   established by content-addressed object identity, which version control
 *   already maintains. Sizes are never asserted, and no total in megabytes is
 *   ever treated as a gate: that figure depends on how the filesystem rounds.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 *   - It never opens, reads or decodes a frame. Only directory entry names and
 *     repository metadata are consulted. The corpus-handling rule makes the
 *     corpus source material of last resort rather than a browsing surface, and
 *     reading names to count and shape-check them is exactly the listing the
 *     catalog's own method at L841 performs — it is not the survey the rule
 *     prohibits. The line is precise: read names to count and to check shape,
 *     never open a file, and never emit what was read.
 *   - It never measures geometry. Frame width, height, colour mode, the capture
 *     band and the effective viewport are already recorded at
 *     `docs/workflows/README.md` L911 to L935, and reopening a frame to confirm
 *     what the catalog states is a breach of the corpus-handling rule. Neither
 *     mandated check needs a pixel, so none is read and no geometry is reported.
 *     Measurement belongs to the sibling measurement tool, under the authority
 *     of its manifest, and that tool is deliberately the only component in the
 *     tree that touches frame content. Concentrating corpus access in one place
 *     is what makes compliance auditable, so this guard does not become a second
 *     reader.
 *   - It never repairs anything. There is no restore, no checkout, no clean and
 *     no fix mode, permanently: a guard that "repaired" the corpus would itself
 *     perform the modification it exists to detect. It reports and exits.
 *   - It writes nothing anywhere, and least of all inside the corpus directory,
 *     where a scratch file would itself be an addition under a read-only path.
 *     No timestamp is touched either, which is why nothing here opens a frame
 *     even for reading.
 *   - It takes no authorization decision and knows no identity. No workspace, no
 *     actor, no session, no credential, no environment file, no network. The
 *     server-side-authorization rule governs mutations and projections and this
 *     program performs neither; it is a build-time utility and never a runtime
 *     dependency of the server or the client. The workspace manifest declares no
 *     dependencies at all, which makes that structural, and this file honours it
 *     by importing platform built-ins only.
 *   - It does not check that the corpus stays out of build output. That is the
 *     container-ignore and attributes files' job. This program is the
 *     complementary check that the bytes themselves are untouched.
 *
 * WHY NO PATH IS EVER PRINTED
 *
 * Every filename in the corpus embeds a third-party product name, and the
 * third-party-identity rule prohibits that name in source, comments and output
 * alike. The status and diff probes emit paths, so a wholesale re-encode would
 * otherwise dump over a thousand prohibited filenames into a build log. So paths
 * are parsed in memory and discarded: a divergent frame is named by its number
 * alone, the named list is capped, and the remainder is a count. The scanned
 * root is reported relative, never resolved, because the checkout directory name
 * and the repository slug both carry the token as well.
 *
 * The same rule is why no project rule is named literally anywhere in this
 * workspace: every one of the five rule identifiers contains the prohibited
 * token, so naming one would make this file the violation the sibling identity
 * guard exists to catch — and it would catch it, correctly. Rules are referred
 * to by subject throughout: the corpus-handling rule, the third-party-identity
 * rule, the uncertainty rule, the server-side-authorization rule, the
 * shared-component rule. The last of those does not reach this file at all; it
 * governs component contracts, and there is no component here.
 *
 * WHY THIS LIVES UNDER THE TOOLS DIRECTORY
 *
 * The corpus-handling rule's write boundary admits new code under exactly four
 * directories, and a root-level scripts directory is not among them. The
 * reconciliation is recorded as entry (4) of `docs/decisions/catalog-defects.md`
 * and costs the guard nothing: a package script and a pipeline step reach a
 * checker here exactly as they would reach one at the root.
 *
 * Entry (7) of that same record is worth knowing before reading the catalog:
 * its section announcing that no project rules exist was true when written and
 * is false now. Five rules are attached and every one binds. That section is not
 * licence, and the ten enterprise practices it names in place of rules are
 * retained as the bar above them — among them evidence before assertion, which
 * is why every count in this file was measured at source, and treating primary
 * evidence as read-only, which is this program's entire subject.
 *
 * FAIL-CLOSED, AND HONEST ABOUT WHAT IT COULD NOT ESTABLISH
 *
 * Legs 2 and 3 need repository metadata. Where there is none — an export without
 * history, a missing executable, a probe that fails for any reason — the guard
 * exits with the verification-impossible code and says so. It never reports a
 * success it did not establish, because that is the failure the uncertainty rule
 * forbids and because a green line from a guard that checked nothing is worse
 * than no guard at all. Every leg runs even after an earlier one fails, so one
 * run reports every divergence it can find, and the exit code is chosen by a
 * documented precedence.
 */

import { execFile } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// The operating table.
//
// Every value that decides what this guard enforces is named here and consumed
// by reference. That is the uncertainty rule's prohibition on a hardcoded
// literal at a point of use, applied to a program small enough that the
// temptation to inline is real.
//
// None of it is environment-overridable, deliberately. That rule's
// overridability clause attaches to a value read from a single frame — a
// hypothesis about a default, of the kind a timer, an expiry, a window, a
// threshold or a limit carries. The frame count is none of those. It is a
// structural invariant that the corpus-handling rule states outright and the
// catalog corroborates, so an environment variable here would hand an operator a
// way to weaken the gate, which is the precise opposite of what either rule
// wants. Nothing below reads the environment.
// ---------------------------------------------------------------------------

/**
 * The scanned directory, relative to the repository root.
 *
 * Relative on purpose, and it is the only form ever printed. Resolved against
 * the root for filesystem work and passed as a path specification to the
 * metadata probes, so both legs are talking about the same directory.
 */
const CORPUS_DIRECTORY = 'screenshots';

/** How the scanned root is rendered in the report. Never a resolved path. */
const CORPUS_DIRECTORY_DISPLAY = `${CORPUS_DIRECTORY}/`;

/**
 * The expected number of frames. A structural invariant, not a default.
 *
 * Stated by the corpus-handling rule itself, corroborated by the catalog, and
 * verified at source: the directory holds exactly this many entries, every one
 * of them carrying the expected extension.
 */
const EXPECTED_FRAME_COUNT = 1022;

/**
 * The one extension every frame carries, lower case.
 *
 * Verified at source rather than assumed: a case-sensitive match over the
 * directory and a case-insensitive one both return the full frame count, so
 * there is exactly one spelling in use and no upper-case variant to tolerate.
 * Tolerating one anyway would weaken a shape check into a suggestion.
 */
const EXPECTED_EXTENSION = '.png';

/** Radix for reading a frame number out of a filename. */
const DECIMAL_RADIX = 10;

/**
 * The brand-free frame-number pattern: a trailing integer before the extension.
 *
 * Built from the extension constant rather than written out, so there is one
 * spelling of the extension in this file and the pattern cannot drift from it.
 *
 * It matches on the *end* of a name and nothing else, and that is a rule
 * obligation rather than a stylistic choice. Every filename in the corpus is
 * prefixed with a third-party product name, and the third-party-identity rule
 * prohibits that name in source. A pattern keyed to the prefix would carry it;
 * a pattern keyed to the trailing digits and the extension identifies a frame
 * exactly as well and carries nothing. This one line is what lets code that
 * contains none of the token read a corpus whose every name embeds it — and it
 * is why renaming the corpus, which the corpus-handling rule forbids anyway, is
 * not needed to satisfy the identity rule.
 *
 * Deliberately not global: a global pattern carries state between calls, and a
 * shared one would then match every other time it was used.
 */
const FRAME_NUMBER_PATTERN = new RegExp(
  `([0-9]+)${EXPECTED_EXTENSION.replace(/\./gu, String.raw`\.`)}$`,
  'u',
);

/** The lowest frame number in the corpus. Verified at source. */
const LOWEST_FRAME_NUMBER = 0;

/** The highest frame number in the corpus. Verified at source. */
const HIGHEST_FRAME_NUMBER = 1021;

/**
 * Distinct committed content objects across the frame paths.
 *
 * Fewer than the frame count, because the corpus repeats surfaces. This is the
 * number that makes a hash-set check wrong, and it is measured from committed
 * object identity rather than by hashing file content.
 */
const EXPECTED_DISTINCT_OBJECTS = 1013;

/** Groups of frames that share one committed object. Recorded at L819. */
const EXPECTED_DUPLICATE_GROUPS = 8;

/** Frame paths spanned by those groups. Recorded at L819. */
const EXPECTED_DUPLICATE_PATHS = 17;

/** Redundant copies among those paths: the paths spanned, less the groups. */
const EXPECTED_REDUNDANT_COPIES = 9;

/**
 * The duplicate groups, by frame number, exactly as the catalog lists them at
 * `docs/workflows/README.md` L819.
 *
 * Numbers only — which is how the catalog itself lists them, and the only form
 * the third-party-identity rule permits here. Sourced from the catalog rather
 * than rediscovered by hashing frame content, then reproduced independently from
 * committed object identity, which agreed exactly: eight groups, seventeen
 * paths, nine redundant copies, identical membership.
 *
 * Used by the corroborating structural check, which is the one thing that
 * catches a corruption able to preserve the frame count.
 */
const KNOWN_DUPLICATE_GROUPS: readonly (readonly number[])[] = Object.freeze([
  Object.freeze([4, 728]),
  Object.freeze([19, 31]),
  Object.freeze([90, 95]),
  Object.freeze([110, 227, 256]),
  Object.freeze([141, 174]),
  Object.freeze([229, 242]),
  Object.freeze([373, 545]),
  Object.freeze([734, 736]),
]);

/**
 * How many divergent frames the report names before it starts counting.
 *
 * Deliberately small. The point of a cap is that the worst case — a wholesale
 * re-encode touching every frame — produces a handful of numbers and a total,
 * rather than a thousand-line listing that would both survey the corpus and
 * carry a thousand prohibited filenames if the numbers were ever paths.
 */
const MAX_NAMED_FRAMES = 6;

/**
 * Process exit codes: one per outcome, so a pipeline can tell them apart from
 * the status alone.
 *
 * The pipeline treats any non-zero status as failure, so the distinctions are
 * for whoever reads the log. They matter because the remedies differ completely:
 * a divergence means the corpus was touched and must be restored from history by
 * a person, whereas verification-impossible means the environment cannot answer
 * the question and the corpus may well be fine.
 *
 * The corroborating structural check gets its own code rather than borrowing the
 * divergence code. Reporting "the bytes changed" when what actually changed is
 * the committed duplicate structure would send a reader looking in the wrong
 * place, and the two are found by different probes.
 *
 * One is deliberately unassigned. A runtime that dies before this program can
 * report exits with it conventionally, so leaving it free keeps "the guard ran
 * and reached a verdict" distinguishable from "the guard never got that far".
 */
const EXIT_CODES = Object.freeze({
  /** Count, shape, per-path identity and structure all as expected. */
  INTACT: 0,
  /** The frame count is not the expected count. */
  COUNT_MISMATCH: 2,
  /** An extension, a name shape, or the contiguity of frame numbers is wrong. */
  SHAPE_MISMATCH: 3,
  /** At least one frame differs from its committed state. */
  BYTE_DIVERGENCE: 4,
  /** At least one file under the corpus directory is not tracked. */
  UNTRACKED_ADDITION: 5,
  /** Committed duplicate structure no longer matches the catalog's record. */
  STRUCTURAL_MISMATCH: 6,
  /** The guard could not establish what it is required to establish. */
  VERIFICATION_IMPOSSIBLE: 7,
  // `as const` inside the freeze, not outside it. Freezing an ordinary object
  // literal widens every value to `number`, which would make the exit-code type
  // below `number` as well and let any integer pass for one of these outcomes.
} as const);

/** One of the outcomes this guard can exit with. */
type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

/**
 * Levels the compiled entry point sits below the repository root.
 *
 * The compiled artifact is `dist/index.js` inside this workspace, so the walk is
 * `dist/`, then the workspace directory, then the tools directory. Three.
 *
 * The emitted layout is what fixes this number, and the sibling measurement tool
 * is a false model for it: that tool compiles its tests alongside its sources, so
 * its own root spans the whole package and its entry lands one level deeper. Its
 * depth is four and copying it here would resolve a directory above the root,
 * where the marker check below would reject it — loudly, which is the point of
 * having a marker check rather than trusting arithmetic.
 */
const COMPILED_ENTRY_DEPTH_BELOW_ROOT = 3;

/**
 * A marker that identifies the repository root independently of the corpus.
 *
 * Two independent markers are checked, because either alone can be satisfied by
 * accident: a directory of the right name might exist anywhere, and this file
 * might exist in a checkout whose corpus was removed wholesale. Requiring both
 * makes a wrong root far harder to mistake for a right one — and a guard pointed
 * at the wrong directory is a failure that looks like a pass, which is the worst
 * result available to it.
 */
const WORKSPACE_ROOT_MARKER = 'pnpm-workspace.yaml';

/** The version-control executable, resolved from the path by the platform. */
const GIT_EXECUTABLE = 'git';

/**
 * Output ceiling for a metadata probe, in bytes.
 *
 * Generous, because a wholesale divergence lists every frame and each path is
 * long, and finite, because an unbounded buffer turns a pathological repository
 * state into an out-of-memory failure rather than a report. Exceeding it is not
 * silently truncated: the probe fails and the guard reports that it could not
 * verify.
 */
const GIT_MAX_BUFFER_BYTES = 64 * 1024 * 1024;

/**
 * The probe argument vectors, fixed here so the enforcement surface is one
 * auditable block rather than five call sites.
 *
 * Every one ends with the path-specification separator and the corpus directory,
 * so no probe can be widened to the rest of the tree by accident, and the
 * directory is a single argument element that no shell ever sees.
 */
const ROOT_PROBE_ARGUMENTS: readonly string[] = Object.freeze(['rev-parse', '--show-toplevel']);

/** Working-tree status: the one probe that reports under either mode setting. */
const STATUS_PROBE_ARGUMENTS: readonly string[] = Object.freeze([
  'status',
  '--porcelain',
  '--',
  CORPUS_DIRECTORY,
]);

/** Difference against the commit: the second half of the per-path identity leg. */
const DIFFERENCE_PROBE_ARGUMENTS: readonly string[] = Object.freeze([
  'diff',
  '--name-only',
  'HEAD',
  '--',
  CORPUS_DIRECTORY,
]);

/**
 * Untracked files under the corpus directory.
 *
 * The standard-exclusion flag is deliberately absent, and this is the one place
 * in the file where leaving a flag off is load-bearing. Measured: with an ignore
 * entry naming an added file, this probe reported it and the same probe with the
 * exclusion flag reported nothing. Adding the flag would let an ignore rule hide
 * an addition under a read-only path, which is the opposite of what this leg is
 * for. Do not add it.
 */
const UNTRACKED_PROBE_ARGUMENTS: readonly string[] = Object.freeze([
  'ls-files',
  '--others',
  '--',
  CORPUS_DIRECTORY,
]);

/**
 * Committed object identity, path by path.
 *
 * The default output shape is used rather than a custom format, because a format
 * option is a newer addition to the tool and the default — mode, type, object,
 * tab, path — has been stable for far longer. This is the probe that makes the
 * duplicate structure checkable without hashing a single byte: version control
 * already addresses content by hash, so the identity this guard needs is a field
 * it can read rather than a computation it has to perform over the corpus.
 */
const OBJECT_LISTING_PROBE_ARGUMENTS: readonly string[] = Object.freeze([
  'ls-tree',
  '-r',
  'HEAD',
  '--',
  CORPUS_DIRECTORY,
]);

/** Separator between an object listing's metadata fields and its path. */
const OBJECT_LISTING_PATH_SEPARATOR = '\t';

/** Separator between the metadata fields themselves. */
const OBJECT_LISTING_FIELD_SEPARATOR = ' ';

/** Fields ahead of the path: file mode, object type, object identity. */
const OBJECT_LISTING_FIELD_COUNT = 3;

/** Position of the object identity among those fields. */
const OBJECT_IDENTITY_FIELD_INDEX = 2;

/** Joins a duplicate group's frame numbers into a comparable signature. */
const GROUP_SIGNATURE_SEPARATOR = '+';

/** Digits per group when a count is rendered for a human. */
const DIGIT_GROUP_SIZE = 3;

/** Separator between digit groups. */
const DIGIT_GROUP_SEPARATOR = ',';

/** Separator between frame numbers in a list. */
const FRAME_LIST_SEPARATOR = ', ';

/**
 * Characters of a status field, plus its separator, in a porcelain entry.
 *
 * A porcelain line is two status characters, a space, then the path portion.
 * Measured rather than assumed, including the awkward part: the status probe
 * quotes a path containing a space, and every corpus path contains several, so
 * an entry arrives as two status characters, a space, then a quoted path. A
 * pattern anchored on the extension alone would never match one, which is why
 * the parsing below strips the quoting before reading a number.
 */
const PORCELAIN_PATH_OFFSET = 3;

/** Separator between the two paths of a rename or copy entry. */
const RENAME_SEPARATOR = ' -> ';

/** The quoting character the metadata probes wrap an unusual path in. */
const PATH_QUOTE = '"';

/** Index in the argument vector at which arguments to this program begin. */
const PROGRAM_ARGUMENT_OFFSET = 2;

// ---------------------------------------------------------------------------
// Result shapes.
//
// Every one of these carries counts and frame numbers. None carries a path,
// which is what makes "no filename can reach the report" a property of the
// types rather than a habit each call site has to remember: the functions that
// see raw probe output return one of these, and the functions that write to a
// stream only ever receive one of these.
// ---------------------------------------------------------------------------

/** The outcome of one metadata probe. Never carries raw output on failure. */
type ProbeOutcome =
  { readonly ok: true; readonly stdout: string } | { readonly ok: false; readonly reason: string };

/** What a probe's reported entries amount to, once paths are discarded. */
interface DivergenceTally {
  /** Entries the probe reported. */
  readonly entryCount: number;
  /** Frame numbers read from those entries: ascending, de-duplicated. */
  readonly frameNumbers: readonly number[];
  /** Entries no frame number could be read from. Counted, never echoed. */
  readonly unreadableCount: number;
}

/** What the filesystem listing says about count and shape. */
interface ShapeFindings {
  /** Directory entries seen, of every kind. */
  readonly entryCount: number;
  /** Entries that are regular files, which is what a frame must be. */
  readonly fileCount: number;
  /** Entries that are not regular files: a directory, a link, a device. */
  readonly nonFileCount: number;
  /** Entries whose name does not end in the expected extension. */
  readonly wrongExtensionCount: number;
  /** Entries carrying the extension but no trailing frame number. */
  readonly unnumberedCount: number;
  /** Frame numbers appearing more than once. */
  readonly repeatedNumbers: readonly number[];
  /** Frame numbers absent from the expected contiguous range. */
  readonly missingNumbers: readonly number[];
  /** Frame numbers outside the expected bounds. */
  readonly outOfRangeNumbers: readonly number[];
}

/** What committed object identity says about the corpus's duplicate structure. */
interface StructureFindings {
  /** Frame paths recorded in the commit. */
  readonly trackedPathCount: number;
  /** Distinct content objects those paths resolve to. */
  readonly distinctObjectCount: number;
  /** Objects referenced by more than one path. */
  readonly duplicateGroupCount: number;
  /** Paths spanned by those groups. */
  readonly duplicatePathCount: number;
  /** Copies beyond the first in each group: the paths spanned, less the groups. */
  readonly redundantCopyCount: number;
  /** Groups whose membership differs from the catalog's record. */
  readonly membershipMismatches: readonly string[];
}

// ---------------------------------------------------------------------------
// Presentation.
//
// Two writers, and nothing else in this file touches a stream. The report goes
// to standard output because it is this program's result; a failure goes to
// standard error because it is a diagnostic a pipeline collects separately.
// ---------------------------------------------------------------------------

/** Writes one line of the report. */
function reportLine(text: string): void {
  process.stdout.write(`${text}\n`);
}

/** Writes one line of diagnostic. */
function failureLine(text: string): void {
  process.stderr.write(`${text}\n`);
}

/** Groups a count's digits so a four-figure number reads at a glance. */
function groupDigits(value: number): string {
  const digits = String(value);
  const output: string[] = [];

  for (let index = 0; index < digits.length; index += 1) {
    const digit = digits[index];

    if (digit === undefined) {
      continue;
    }

    if (index > 0 && (digits.length - index) % DIGIT_GROUP_SIZE === 0) {
      output.push(DIGIT_GROUP_SEPARATOR);
    }

    output.push(digit);
  }

  return output.join('');
}

/**
 * Renders a frame number.
 *
 * Ungrouped, deliberately, and the distinction from {@link groupDigits} is worth
 * keeping straight: a count is a quantity and reads better grouped, whereas a
 * frame number is an identifier. Grouping one would print frame 1021 as though
 * it were a thousand and twenty-one of something, and it would not match the
 * plain form the catalog uses for the same numbers.
 */
function frameLabel(frameNumber: number): string {
  return String(frameNumber);
}

/**
 * Renders frame numbers for the report: named up to the cap, then counted.
 *
 * Numbers only, always. This is the function that stands between a probe's
 * output and a build log, and the reason it exists is that the alternative — a
 * list of paths — would reproduce a third-party product name once per divergent
 * frame, up to the whole corpus, into somewhere it is likely to be pasted again.
 */
function describeFrames(numbers: readonly number[]): string {
  if (numbers.length === 0) {
    return 'none';
  }

  const named = numbers.slice(0, MAX_NAMED_FRAMES);
  const remainder = numbers.length - named.length;
  const list = named.map(frameLabel).join(FRAME_LIST_SEPARATOR);

  if (remainder === 0) {
    return list;
  }

  return `${list} and ${groupDigits(remainder)} further`;
}

/** Renders a tally as one line: what diverged, by number, and how much. */
function describeTally(tally: DivergenceTally): string {
  const parts = [
    `${groupDigits(tally.entryCount)} reported`,
    `frames ${describeFrames(tally.frameNumbers)}`,
  ];

  if (tally.unreadableCount > 0) {
    parts.push(`${groupDigits(tally.unreadableCount)} whose frame number could not be read`);
  }

  return parts.join(' · ');
}

// ---------------------------------------------------------------------------
// Filesystem predicates.
//
// Both answer false rather than throwing, because a missing or unreadable marker
// is an ordinary outcome of resolving a root and the caller turns it into an
// authored diagnostic. Neither is ever called on a frame.
// ---------------------------------------------------------------------------

/** True when the path exists and is a directory. */
async function isDirectory(absolutePath: string): Promise<boolean> {
  try {
    const stats = await stat(absolutePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/** True when the path exists and is a regular file. */
async function isFile(absolutePath: string): Promise<boolean> {
  try {
    const stats = await stat(absolutePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Resolving the repository root, and refusing to guess.
// ---------------------------------------------------------------------------

/**
 * True when a candidate directory carries both independent root markers.
 *
 * Checked before the root is trusted, because everything this program concludes
 * is relative to it. A wrong root would list a directory that is not the corpus,
 * find nothing wrong with it, and report a clean run — the one failure mode a
 * guard must never have. So resolution is a checked step, never an assumption.
 */
async function looksLikeRepositoryRoot(candidate: string): Promise<boolean> {
  const [markerPresent, corpusPresent] = await Promise.all([
    isFile(join(candidate, WORKSPACE_ROOT_MARKER)),
    isDirectory(join(candidate, CORPUS_DIRECTORY)),
  ]);

  return markerPresent && corpusPresent;
}

/**
 * Climbs the fixed number of levels from the compiled entry point to the root.
 *
 * The working directory is emphatically not the root: this program is invoked
 * through the package manager with a workspace filter, so it starts inside its
 * own workspace. Deriving the root from the module's own location instead makes
 * the answer independent of where it was launched from, which is why invoking it
 * from the repository root and from inside the workspace give the same result.
 */
function ascendFromCompiledEntry(): string {
  let current = dirname(fileURLToPath(import.meta.url));

  for (let ascent = 0; ascent < COMPILED_ENTRY_DEPTH_BELOW_ROOT; ascent += 1) {
    current = dirname(current);
  }

  return resolve(current);
}

// ---------------------------------------------------------------------------
// Describing a failure without reproducing a path.
//
// Both helpers report a code and a kind, and neither reports a message. That is
// not terseness: a filesystem error's message embeds the path it failed on, a
// metadata probe's diagnostic can name the file it stopped at, and every frame's
// name embeds the prohibited third-party token — as do the checkout directory
// and the repository slug that any absolute path passes through. Echoing either
// would put the token into a build log, which is exactly what the sibling
// identity guard exists to prevent. A code plus a kind is enough to act on, and
// the operator can re-run the command to read the rest.
// ---------------------------------------------------------------------------

/** Reads a system error code off an unknown thrown value. */
function describeErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error;

    if (typeof code === 'string') {
      return `system error ${code}`;
    }

    if (typeof code === 'number') {
      return `system error ${groupDigits(code)}`;
    }
  }

  if (error instanceof Error) {
    return `a ${error.name}`;
  }

  return 'an unidentified error';
}

/** Renders a probe's exit status or system error, whichever it carried. */
function describeProbeStatus(code: unknown): string {
  if (typeof code === 'number') {
    return `exit status ${groupDigits(code)}`;
  }

  if (typeof code === 'string') {
    return `system error ${code}`;
  }

  return 'no status';
}

// ---------------------------------------------------------------------------
// Running a metadata probe.
//
// Invoked with an argument array and never a command line. There is no shell in
// the path here, no interpolation into a string and no shell option: the corpus
// directory arrives as one argument element, so nothing in it could be read as
// syntax even if the constant above were ever changed to something exotic.
//
// The working directory is passed explicitly rather than inherited, because the
// package manager launches this program inside its own workspace and a probe
// resolved against that directory would answer questions about the wrong scope.
// ---------------------------------------------------------------------------

/** Runs one version-control probe and returns its output, or why it failed. */
function runProbe(
  workingDirectory: string,
  probeArguments: readonly string[],
  label: string,
): Promise<ProbeOutcome> {
  return new Promise<ProbeOutcome>((settle) => {
    execFile(
      GIT_EXECUTABLE,
      probeArguments,
      {
        cwd: workingDirectory,
        encoding: 'utf8',
        maxBuffer: GIT_MAX_BUFFER_BYTES,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error === null) {
          settle({ ok: true, stdout });
          return;
        }

        settle({
          ok: false,
          reason:
            `The ${label} did not complete (${describeProbeStatus(error.code)}). ` +
            `Its own diagnostic ran to ${groupDigits(stderr.length)} bytes and is ` +
            'deliberately not repeated here, because a probe that fails can name the ' +
            'file it stopped at and a frame name may not be reproduced in output. ' +
            'Run the same probe locally to read it.',
        });
      },
    );
  });
}

// ---------------------------------------------------------------------------
// Resolving the root, with a fallback and no guessing.
// ---------------------------------------------------------------------------

/** Either a validated repository root, or why one could not be established. */
type RootOutcome =
  { readonly ok: true; readonly root: string } | { readonly ok: false; readonly reason: string };

/**
 * Resolves the repository root and proves it before returning it.
 *
 * Two independent routes, in order of preference. The fixed climb from the
 * compiled entry point is first because it needs nothing but this file's own
 * location, so it works in an export with no history at all. Asking version
 * control for the top level is the fallback, for a checkout laid out some other
 * way — a worktree, a submodule, a relocated build.
 *
 * Neither route is trusted on its own word: both answers are put through the
 * same two-marker validation, and if neither survives it the guard says it
 * cannot verify instead of scanning whatever it happened to land on. Never
 * returns an unvalidated root.
 */
async function resolveRepositoryRoot(): Promise<RootOutcome> {
  const climbed = ascendFromCompiledEntry();

  if (await looksLikeRepositoryRoot(climbed)) {
    return { ok: true, root: climbed };
  }

  const startDirectory = dirname(fileURLToPath(import.meta.url));
  const outcome = await runProbe(startDirectory, ROOT_PROBE_ARGUMENTS, 'repository-root probe');

  if (!outcome.ok) {
    return {
      ok: false,
      reason:
        `The repository root could not be established. Climbing ` +
        `${groupDigits(COMPILED_ENTRY_DEPTH_BELOW_ROOT)} levels from this ` +
        `program's own location reached a directory carrying neither ` +
        `"${WORKSPACE_ROOT_MARKER}" nor a "${CORPUS_DIRECTORY_DISPLAY}" ` +
        `directory, and asking version control for the top level failed too. ` +
        `${outcome.reason}`,
    };
  }

  const reported = outcome.stdout.trim();

  if (reported.length === 0) {
    return {
      ok: false,
      reason:
        'The repository root could not be established: version control reported ' +
        'an empty top level. Every count this guard takes is relative to that ' +
        'root, so there is nothing it can honestly check without one.',
    };
  }

  const candidate = resolve(reported);

  if (await looksLikeRepositoryRoot(candidate)) {
    return { ok: true, root: candidate };
  }

  return {
    ok: false,
    reason:
      'The repository root could not be established. Neither the climb from ' +
      "this program's own location nor the top level version control reported " +
      `carries both markers this guard requires — a "${WORKSPACE_ROOT_MARKER}" ` +
      `file and a "${CORPUS_DIRECTORY_DISPLAY}" directory. The resolved paths ` +
      'are deliberately not printed: a checkout directory name carries the ' +
      'prohibited third-party token. A guard pointed at the wrong directory ' +
      'would find nothing wrong and report a pass, so it refuses to scan one.',
  };
}

// ---------------------------------------------------------------------------
// Reading a frame number.
// ---------------------------------------------------------------------------

/** Ascending numeric order, for reports that list frame numbers. */
function ascending(left: number, right: number): number {
  return left - right;
}

/** Reads the trailing frame number out of a name, or null if it carries none. */
function readFrameNumber(name: string): number | null {
  const match = FRAME_NUMBER_PATTERN.exec(name);

  if (match === null) {
    return null;
  }

  const digits = match[1];

  if (digits === undefined) {
    return null;
  }

  const value = Number.parseInt(digits, DECIMAL_RADIX);

  if (!Number.isSafeInteger(value)) {
    return null;
  }

  return value;
}

// ---------------------------------------------------------------------------
// LEG 1 — count and shape, from the filesystem alone.
//
// This leg consults version control nowhere, and that independence earns its
// keep twice over. It survives a stale index, and it cannot be blinded by an
// ignore rule — measured, not assumed: an added file named in an ignore file was
// invisible to the untracked probe run with the exclusion flag, and the worktree
// count caught it regardless. So the first mandated check rests on the
// filesystem and owes version control nothing.
//
// It reads entry names and only entry names. Nothing here opens a file, reads
// one, decodes one or touches a timestamp: the entry kind comes from the
// directory read itself, so not even a stat is issued against a frame. Sizes are
// deliberately not collected either — they cannot establish byte-identity, and
// gathering a figure this guard must not act on would only invite a later reader
// to act on it.
// ---------------------------------------------------------------------------

/** Either the shape findings, or why the listing could not be taken. */
type ShapeOutcome =
  | { readonly ok: true; readonly findings: ShapeFindings }
  | { readonly ok: false; readonly reason: string };

/** Lists the corpus directory and checks its count, extensions and numbering. */
async function inspectShape(root: string): Promise<ShapeOutcome> {
  const corpusPath = join(root, CORPUS_DIRECTORY);

  try {
    const entries = await readdir(corpusPath, { withFileTypes: true });

    let fileCount = 0;
    let nonFileCount = 0;
    let wrongExtensionCount = 0;
    let unnumberedCount = 0;

    const seen = new Set<number>();
    const repeated = new Set<number>();

    for (const entry of entries) {
      // A frame is a regular file. A directory, a link or a device under a
      // read-only path is an addition whatever it contains, so it is counted as
      // a shape problem rather than quietly skipped.
      if (!entry.isFile()) {
        nonFileCount += 1;
        continue;
      }

      fileCount += 1;

      // Case-sensitive on purpose. Exactly one spelling of the extension is in
      // use across the corpus, verified at source, so accepting another would
      // turn a shape assertion into a suggestion.
      if (!entry.name.endsWith(EXPECTED_EXTENSION)) {
        wrongExtensionCount += 1;
        continue;
      }

      const frameNumber = readFrameNumber(entry.name);

      if (frameNumber === null) {
        unnumberedCount += 1;
        continue;
      }

      if (seen.has(frameNumber)) {
        repeated.add(frameNumber);
      } else {
        seen.add(frameNumber);
      }
    }

    const missingNumbers: number[] = [];

    for (
      let frameNumber = LOWEST_FRAME_NUMBER;
      frameNumber <= HIGHEST_FRAME_NUMBER;
      frameNumber += 1
    ) {
      if (!seen.has(frameNumber)) {
        missingNumbers.push(frameNumber);
      }
    }

    const outOfRangeNumbers = [...seen]
      .filter(
        (frameNumber) => frameNumber < LOWEST_FRAME_NUMBER || frameNumber > HIGHEST_FRAME_NUMBER,
      )
      .sort(ascending);

    return {
      ok: true,
      findings: {
        entryCount: entries.length,
        fileCount,
        nonFileCount,
        wrongExtensionCount,
        unnumberedCount,
        repeatedNumbers: [...repeated].sort(ascending),
        missingNumbers,
        outOfRangeNumbers,
      },
    };
  } catch (error: unknown) {
    return {
      ok: false,
      reason:
        `The "${CORPUS_DIRECTORY_DISPLAY}" directory could not be listed ` +
        `(${describeErrorCode(error)}). Without a listing the frame count is ` +
        'unknown, so the guard reports that it could not verify rather than a ' +
        'result it did not establish.',
    };
  }
}

/** True when the shape findings contain nothing to report. */
function shapeIsSound(findings: ShapeFindings): boolean {
  return (
    findings.nonFileCount === 0 &&
    findings.wrongExtensionCount === 0 &&
    findings.unnumberedCount === 0 &&
    findings.repeatedNumbers.length === 0 &&
    findings.missingNumbers.length === 0 &&
    findings.outOfRangeNumbers.length === 0
  );
}

// ---------------------------------------------------------------------------
// Turning probe output into frame numbers.
//
// This is the boundary the paths stop at. Everything above it may hold a path;
// nothing below it ever does. The parsing is deliberately defensive, because the
// formats were measured rather than assumed and they are not uniform:
//
//   - The status probe prefixes each entry with two status characters and a
//     space, and QUOTES any path containing an unusual character. Every corpus
//     path contains spaces, so every entry arrives quoted, and a pattern
//     anchored on the extension would never match one — the trailing quote is in
//     the way. This is the single most likely way to write a parser that
//     silently reports every divergence as unreadable.
//   - The diff and untracked probes emit bare paths with no prefix and no
//     quoting.
//   - A staged rename arrives from the status probe as one entry holding two
//     quoted paths either side of an arrow. Both halves are divergences, so both
//     numbers are read.
//
// Full unescaping of a quoted path is unnecessary and therefore not done: the
// only part read is the trailing run of digits and the extension, both plain
// characters that no escape sequence can reach. Dropping the surrounding quotes
// is enough, and doing less than a general unescape keeps this function unable
// to reconstitute a name even by accident.
// ---------------------------------------------------------------------------

/** Removes the quoting a metadata probe wraps an unusual path in. */
function unquotePath(token: string): string {
  if (
    token.length >= PATH_QUOTE.length * 2 &&
    token.startsWith(PATH_QUOTE) &&
    token.endsWith(PATH_QUOTE)
  ) {
    return token.slice(PATH_QUOTE.length, token.length - PATH_QUOTE.length);
  }

  return token;
}

/**
 * Splits one probe entry into the path tokens it carries.
 *
 * `hasStatusField` says which format the caller is reading, rather than being
 * guessed from the text. Guessing would be wrong in both directions: a bare path
 * whose third character is a space would lose its first three characters, and a
 * status entry read as a bare path would keep a prefix the pattern then has to
 * step over.
 */
function splitEntryPaths(entry: string, hasStatusField: boolean): readonly string[] {
  let remainder = entry;

  if (hasStatusField && remainder.length > PORCELAIN_PATH_OFFSET) {
    remainder = remainder.slice(PORCELAIN_PATH_OFFSET);
  }

  return remainder
    .split(RENAME_SEPARATOR)
    .map((token) => unquotePath(token.trim()))
    .filter((token) => token.length > 0);
}

/**
 * Reduces a probe's output to a tally of frame numbers and counts.
 *
 * Returns numbers and counts only. An entry no number can be read from is
 * counted as an unreadable divergence rather than echoed, because echoing it is
 * precisely what must not happen: it would be a path, and a path carries the
 * token. Counting it keeps the report honest — the guard still fails, and it
 * still says how much it could not name.
 */
function tallyProbeOutput(stdout: string, hasStatusField: boolean): DivergenceTally {
  const entries = stdout.split('\n').filter((line) => line.trim().length > 0);
  const frameNumbers = new Set<number>();
  let unreadableCount = 0;

  for (const entry of entries) {
    const paths = splitEntryPaths(entry, hasStatusField);
    let readAny = false;

    for (const path of paths) {
      const frameNumber = readFrameNumber(path);

      if (frameNumber !== null) {
        frameNumbers.add(frameNumber);
        readAny = true;
      }
    }

    if (!readAny) {
      unreadableCount += 1;
    }
  }

  return {
    entryCount: entries.length,
    frameNumbers: [...frameNumbers].sort(ascending),
    unreadableCount,
  };
}

/** True when a tally reports nothing at all. */
function tallyIsEmpty(tally: DivergenceTally): boolean {
  return tally.entryCount === 0;
}

// ---------------------------------------------------------------------------
// LEG 2 — per-path identity, and LEG 3 — untracked additions.
//
// Per path, never over a set of hashes. That distinction is the whole reason
// this guard works on a pristine corpus: the corpus repeats surfaces, so the
// distinct-content count is smaller than the frame count, and a check that
// compared those two numbers would fail on an untouched checkout. Version
// control compares path against recorded path, which is the comparison the
// byte-identity obligation actually calls for.
// ---------------------------------------------------------------------------

/** Either a tally of what a probe reported, or why it could not be run. */
type TallyOutcome =
  | { readonly ok: true; readonly tally: DivergenceTally }
  | { readonly ok: false; readonly reason: string };

/** Runs one probe and reduces its output to numbers and counts. */
async function probeForDivergence(
  root: string,
  probeArguments: readonly string[],
  label: string,
  hasStatusField: boolean,
): Promise<TallyOutcome> {
  const outcome = await runProbe(root, probeArguments, label);

  if (!outcome.ok) {
    return { ok: false, reason: outcome.reason };
  }

  return { ok: true, tally: tallyProbeOutput(outcome.stdout, hasStatusField) };
}

// ---------------------------------------------------------------------------
// The corroborating structural check.
//
// Subordinate to the two mandated checks, and reported as its own finding with
// its own exit code so it can never be mistaken for one of them. It earns its
// place by catching what neither mandated check can: a corruption that preserves
// the frame count and is already committed, so the working tree agrees with it
// perfectly and every probe above comes back clean.
//
// It reads committed object identity, which is why it needs no hashing and opens
// nothing. It is a check over the commit rather than the working tree; leg 2
// establishes that the working tree equals the commit, so the two together reach
// the files on disk.
// ---------------------------------------------------------------------------

/** Either the structural findings, or why they could not be taken. */
type StructureOutcome =
  | { readonly ok: true; readonly findings: StructureFindings }
  | { readonly ok: false; readonly reason: string };

/** Renders a duplicate group's frame numbers as a comparable signature. */
function groupSignature(frames: readonly number[]): string {
  return [...frames]
    .sort(ascending)
    .map((frameNumber) => String(frameNumber))
    .join(GROUP_SIGNATURE_SEPARATOR);
}

/** Renders a signature back into report prose. Numbers only, by construction. */
function describeSignature(signature: string): string {
  return `[${signature.split(GROUP_SIGNATURE_SEPARATOR).join(`${DIGIT_GROUP_SEPARATOR} `)}]`;
}

/**
 * Reads the object identity of one listing line, with its frame number.
 *
 * Returns null for a line that does not parse, which the caller counts rather
 * than echoes: the unparsed remainder would be a path.
 */
function readObjectListingLine(
  line: string,
): { readonly objectIdentity: string; readonly frameNumber: number } | null {
  const separatorIndex = line.indexOf(OBJECT_LISTING_PATH_SEPARATOR);

  if (separatorIndex < 0) {
    return null;
  }

  const fields = line
    .slice(0, separatorIndex)
    .split(OBJECT_LISTING_FIELD_SEPARATOR)
    .filter((field) => field.length > 0);

  if (fields.length < OBJECT_LISTING_FIELD_COUNT) {
    return null;
  }

  const objectIdentity = fields[OBJECT_IDENTITY_FIELD_INDEX];

  if (objectIdentity === undefined) {
    return null;
  }

  const frameNumber = readFrameNumber(
    unquotePath(line.slice(separatorIndex + OBJECT_LISTING_PATH_SEPARATOR.length).trim()),
  );

  if (frameNumber === null) {
    return null;
  }

  return { objectIdentity, frameNumber };
}

/** Compares committed duplicate structure against the catalog's own record. */
async function inspectStructure(root: string): Promise<StructureOutcome> {
  const outcome = await runProbe(
    root,
    OBJECT_LISTING_PROBE_ARGUMENTS,
    'committed-object listing probe',
  );

  if (!outcome.ok) {
    return { ok: false, reason: outcome.reason };
  }

  const lines = outcome.stdout.split('\n').filter((line) => line.trim().length > 0);
  const framesByObject = new Map<string, number[]>();
  let trackedPathCount = 0;

  for (const line of lines) {
    const parsed = readObjectListingLine(line);

    if (parsed === null) {
      // Counted through the path total so the arithmetic below still notices,
      // and never echoed, because the text that failed to parse is a path.
      trackedPathCount += 1;
      continue;
    }

    trackedPathCount += 1;

    const existing = framesByObject.get(parsed.objectIdentity);

    if (existing === undefined) {
      framesByObject.set(parsed.objectIdentity, [parsed.frameNumber]);
    } else {
      existing.push(parsed.frameNumber);
    }
  }

  const observedGroups = [...framesByObject.values()].filter((frames) => frames.length > 1);
  const duplicatePathCount = observedGroups.reduce((total, frames) => total + frames.length, 0);

  const recordedSignatures = new Set(KNOWN_DUPLICATE_GROUPS.map(groupSignature));
  const observedSignatures = new Set(observedGroups.map(groupSignature));
  const membershipMismatches: string[] = [];

  for (const signature of [...observedSignatures].sort()) {
    if (!recordedSignatures.has(signature)) {
      membershipMismatches.push(
        `${describeSignature(signature)} share one object but the catalog records no such group`,
      );
    }
  }

  for (const signature of [...recordedSignatures].sort()) {
    if (!observedSignatures.has(signature)) {
      membershipMismatches.push(
        `${describeSignature(signature)} are recorded as sharing one object and no longer do`,
      );
    }
  }

  return {
    ok: true,
    findings: {
      trackedPathCount,
      distinctObjectCount: framesByObject.size,
      duplicateGroupCount: observedGroups.length,
      duplicatePathCount,
      redundantCopyCount: duplicatePathCount - observedGroups.length,
      membershipMismatches,
    },
  };
}

/**
 * True when committed structure matches the catalog's record exactly.
 *
 * The redundant-copy figure is asserted alongside the others even though the
 * arithmetic makes it follow from them. It is a number the catalog states in its
 * own words at L819, and checking a stated figure directly — rather than only the
 * quantities it can be derived from — is what makes this a check against the
 * record instead of a check against an inference about it.
 */
function structureIsSound(findings: StructureFindings): boolean {
  return (
    findings.trackedPathCount === EXPECTED_FRAME_COUNT &&
    findings.distinctObjectCount === EXPECTED_DISTINCT_OBJECTS &&
    findings.duplicateGroupCount === EXPECTED_DUPLICATE_GROUPS &&
    findings.duplicatePathCount === EXPECTED_DUPLICATE_PATHS &&
    findings.redundantCopyCount === EXPECTED_REDUNDANT_COPIES &&
    findings.membershipMismatches.length === 0
  );
}

// ---------------------------------------------------------------------------
// Everything one run established.
//
// A leg that could not run leaves its slot null and adds a sentence to the
// verification failures. That is what lets the guard run every leg even after an
// earlier one fails, so a single run reports everything it can find rather than
// stopping at the first problem and hiding the rest behind it.
// ---------------------------------------------------------------------------

/** The complete result of one run, before an exit code is chosen from it. */
interface RunFindings {
  readonly shape: ShapeFindings | null;
  readonly status: DivergenceTally | null;
  readonly difference: DivergenceTally | null;
  readonly untracked: DivergenceTally | null;
  readonly structure: StructureFindings | null;
  readonly verificationFailures: readonly string[];
}

/**
 * Chooses the exit code, most specific actionable diagnosis first.
 *
 * The precedence, and why it runs in this order:
 *
 *   1. Verification impossible. It outranks everything because every other code
 *      asserts a completed check, and a reader seeing one of those would
 *      reasonably conclude the byte-identity check ran. If a leg did not run,
 *      saying so is the only honest headline available.
 *   2. Untracked addition. The most specific finding there is: a file exists
 *      under a read-only path that no commit records. It says what happened and
 *      what to undo, where a bare count difference says only that something did.
 *   3. Count mismatch. The first mandated check: the population changed.
 *   4. Byte divergence. The second mandated check: a recorded frame no longer
 *      matches what was recorded.
 *   5. Shape mismatch. The population is the right size but something in it is
 *      malformed — a wrong extension, an unnumbered name, a gap in the range.
 *   6. Structural mismatch. The subordinate corroboration, last because it is
 *      the only finding here that is not itself a breach of a mandated check.
 *
 * The code only chooses the headline. Every finding is printed regardless of
 * which one it is, so nothing is lost by ranking them.
 */
function chooseExitCode(findings: RunFindings): ExitCode {
  if (findings.verificationFailures.length > 0) {
    return EXIT_CODES.VERIFICATION_IMPOSSIBLE;
  }

  if (findings.untracked !== null && !tallyIsEmpty(findings.untracked)) {
    return EXIT_CODES.UNTRACKED_ADDITION;
  }

  if (findings.shape !== null && findings.shape.entryCount !== EXPECTED_FRAME_COUNT) {
    return EXIT_CODES.COUNT_MISMATCH;
  }

  const statusDiverged = findings.status !== null && !tallyIsEmpty(findings.status);
  const differenceDiverged = findings.difference !== null && !tallyIsEmpty(findings.difference);

  if (statusDiverged || differenceDiverged) {
    return EXIT_CODES.BYTE_DIVERGENCE;
  }

  if (findings.shape !== null && !shapeIsSound(findings.shape)) {
    return EXIT_CODES.SHAPE_MISMATCH;
  }

  if (findings.structure !== null && !structureIsSound(findings.structure)) {
    return EXIT_CODES.STRUCTURAL_MISMATCH;
  }

  return EXIT_CODES.INTACT;
}

/** One authored sentence per outcome, keyed by the code it belongs to. */
const VERDICT_BY_EXIT_CODE: Readonly<Record<ExitCode, string>> = Object.freeze({
  [EXIT_CODES.INTACT]:
    'Verdict: the corpus is intact. The frame count is as expected and every frame is byte-identical to its committed state.',
  [EXIT_CODES.COUNT_MISMATCH]:
    'Verdict: the frame count has changed. A frame has been added or removed under a path that is read-only, so restore the directory from history — this guard will not do it for you, because writing to the corpus is the thing it exists to detect.',
  [EXIT_CODES.SHAPE_MISMATCH]:
    'Verdict: the frame count is right but the directory no longer has the expected shape. Restore it from history; nothing here is repaired automatically.',
  [EXIT_CODES.BYTE_DIVERGENCE]:
    'Verdict: at least one frame differs from its committed state. The frames must remain byte-identical, so restore them from history. Note that a difference can be a changed file mode as well as changed content.',
  [EXIT_CODES.UNTRACKED_ADDITION]:
    'Verdict: a file under the corpus directory is not recorded in any commit. Nothing may be added there. Remove it, and do not commit it — an ignore rule would hide it from one of the probes here but not from the frame count.',
  [EXIT_CODES.STRUCTURAL_MISMATCH]:
    'Verdict: the frames match their committed state, but the committed duplicate structure no longer matches the catalog. The commit itself has changed rather than the working tree, which is a different fault from a local edit and needs a different remedy.',
  [EXIT_CODES.VERIFICATION_IMPOSSIBLE]:
    'Verdict: this guard could not establish that the corpus is intact, so it reports a failure rather than a result. The corpus may well be fine; what is certain is that this run did not prove it. Run it in a full checkout with repository history and version control available.',
} as const);

// ---------------------------------------------------------------------------
// The report.
//
// Aggregates and numbers. No path, no absolute location, no listing, no
// geometry. The summary is a handful of aligned lines on a clean run, which is
// what a pipeline log wants from a passing stage.
// ---------------------------------------------------------------------------

/** Column width that keeps the summary's values aligned. */
const SUMMARY_LABEL_WIDTH = 24;

/** Writes one aligned summary row. */
function summaryRow(label: string, value: string): void {
  reportLine(`  ${label.padEnd(SUMMARY_LABEL_WIDTH)}${value}`);
}

/** Renders a count against its expectation. */
function describeCount(actual: number | null, expected: number): string {
  if (actual === null) {
    return `not established (expected ${groupDigits(expected)})`;
  }

  if (actual === expected) {
    return groupDigits(actual);
  }

  return `${groupDigits(actual)} — expected ${groupDigits(expected)}`;
}

/**
 * Renders the divergence total for the summary row.
 *
 * Frames, not probe entries. The two identity probes overlap by design — a
 * modified frame is reported by both — so adding their entry counts would double
 * every finding and print two divergences where there is one. The frame numbers
 * are pooled into a set instead, and only entries no number could be read from
 * are added on, because those cannot be de-duplicated and would otherwise vanish
 * from the summary entirely.
 *
 * Three shapes, because they mean different things to someone scanning a log:
 * nothing diverged, this much did, or the identity legs did not run at all — and
 * that last one must never be mistaken for a zero.
 */
function describeDivergentTotal(
  established: boolean,
  framesNamed: number,
  unnamedEntries: number,
): string {
  if (!established) {
    return 'not established';
  }

  if (framesNamed === 0 && unnamedEntries === 0) {
    return groupDigits(0);
  }

  if (unnamedEntries === 0) {
    return groupDigits(framesNamed);
  }

  return `${groupDigits(framesNamed)} · ${groupDigits(unnamedEntries)} further entries whose frame number could not be read`;
}

/**
 * Renders the committed-structure row.
 *
 * On a sound corpus it states the figures, which is the useful thing to see in a
 * passing log: it shows the duplicate structure was checked rather than assumed.
 * On an unsound one it says so plainly and leaves the arithmetic to the section
 * below, because four expectations interleaved with four actuals on one line is
 * denser than anyone reads.
 */
function describeStructureSummary(structure: StructureFindings | null): string {
  if (structure === null) {
    return 'not established';
  }

  const figures =
    `${groupDigits(structure.distinctObjectCount)} distinct across ` +
    `${groupDigits(structure.trackedPathCount)} paths · ` +
    `${groupDigits(structure.duplicateGroupCount)} duplicate groups spanning ` +
    `${groupDigits(structure.duplicatePathCount)} paths`;

  if (structureIsSound(structure)) {
    return figures;
  }

  return `${figures} — does not match the catalog's record`;
}

/** Writes the summary block: what was checked, and what it came to. */
function reportSummary(findings: RunFindings): void {
  summaryRow('Scanned root', CORPUS_DIRECTORY_DISPLAY);
  summaryRow('Frames expected', groupDigits(EXPECTED_FRAME_COUNT));
  summaryRow(
    'Frames found',
    describeCount(findings.shape === null ? null : findings.shape.entryCount, EXPECTED_FRAME_COUNT),
  );

  const divergent = new Set<number>();
  let unnamedEntries = 0;
  let identityEstablished = false;

  for (const tally of [findings.status, findings.difference]) {
    if (tally === null) {
      continue;
    }

    identityEstablished = true;
    unnamedEntries += tally.unreadableCount;

    for (const frameNumber of tally.frameNumbers) {
      divergent.add(frameNumber);
    }
  }

  summaryRow(
    'Divergent frames',
    describeDivergentTotal(identityEstablished, divergent.size, unnamedEntries),
  );
  summaryRow(
    'Untracked additions',
    findings.untracked === null ? 'not established' : groupDigits(findings.untracked.entryCount),
  );
  summaryRow('Committed objects', describeStructureSummary(findings.structure));
}

/** Writes the shape findings, one line per kind of problem actually present. */
function reportShape(shape: ShapeFindings | null): void {
  if (shape === null || shapeIsSound(shape)) {
    return;
  }

  failureLine('');
  failureLine('Directory shape');

  if (shape.nonFileCount > 0) {
    failureLine(
      `  ${groupDigits(shape.nonFileCount)} entries are not regular files. Only frames belong here, and anything else is an addition under a read-only path whatever it holds.`,
    );
  }

  if (shape.wrongExtensionCount > 0) {
    failureLine(
      `  ${groupDigits(shape.wrongExtensionCount)} files do not end in the one expected extension. Exactly one spelling is in use across the corpus, so another is a change rather than a variant.`,
    );
  }

  if (shape.unnumberedCount > 0) {
    failureLine(
      `  ${groupDigits(shape.unnumberedCount)} files carry the expected extension but no trailing frame number. A frame is identified by that number and by nothing else here.`,
    );
  }

  if (shape.repeatedNumbers.length > 0) {
    failureLine(
      `  Frame numbers appearing more than once: ${describeFrames(shape.repeatedNumbers)}.`,
    );
  }

  if (shape.missingNumbers.length > 0) {
    failureLine(
      `  Frame numbers absent from the range ${frameLabel(LOWEST_FRAME_NUMBER)} to ${frameLabel(HIGHEST_FRAME_NUMBER)}: ${describeFrames(shape.missingNumbers)}.`,
    );
  }

  if (shape.outOfRangeNumbers.length > 0) {
    failureLine(`  Frame numbers outside that range: ${describeFrames(shape.outOfRangeNumbers)}.`);
  }
}

/** Writes one divergence section, by frame number and count only. */
function reportDivergence(heading: string, guidance: string, tally: DivergenceTally | null): void {
  if (tally === null || tallyIsEmpty(tally)) {
    return;
  }

  failureLine('');
  failureLine(heading);
  failureLine(`  ${describeTally(tally)}`);
  failureLine(`  ${guidance}`);
}

/** Writes the structural findings. */
function reportStructure(structure: StructureFindings | null): void {
  if (structure === null || structureIsSound(structure)) {
    return;
  }

  failureLine('');
  failureLine('Committed duplicate structure — corroborating check');
  failureLine(
    `  ${describeCount(structure.distinctObjectCount, EXPECTED_DISTINCT_OBJECTS)} distinct objects · ` +
      `${describeCount(structure.duplicateGroupCount, EXPECTED_DUPLICATE_GROUPS)} groups · ` +
      `${describeCount(structure.duplicatePathCount, EXPECTED_DUPLICATE_PATHS)} paths spanned · ` +
      `${describeCount(structure.redundantCopyCount, EXPECTED_REDUNDANT_COPIES)} redundant copies`,
  );

  for (const mismatch of structure.membershipMismatches) {
    failureLine(`  ${mismatch}`);
  }

  failureLine(
    '  This is a check over the commit rather than the working tree, and it is subordinate to the two mandated checks. It is here because it is the only thing that notices a corruption able to keep the frame count intact.',
  );
}

/** Writes what the guard could not establish, and why that is a failure. */
function reportVerificationFailures(failures: readonly string[]): void {
  if (failures.length === 0) {
    return;
  }

  failureLine('');
  failureLine('Verification could not be completed');

  for (const failure of failures) {
    failureLine(`  ${failure}`);
  }
}

/** Writes the verdict: to standard output when clean, to standard error when not. */
function reportVerdict(code: ExitCode): void {
  const verdict = VERDICT_BY_EXIT_CODE[code];

  if (code === EXIT_CODES.INTACT) {
    reportLine('');
    reportLine(verdict);
    return;
  }

  failureLine('');
  failureLine(verdict);
}

// ---------------------------------------------------------------------------
// Arguments: there are none, and that is the design.
//
// A guard whose strictness can be adjusted at the call site is a guard that will
// eventually be invoked the lenient way, so there is no flag, no override and no
// environment variable — not for the frame count, not for the scanned directory,
// not for any of it. Anything supplied is refused rather than ignored, because
// ignoring it would let a caller believe an option had taken effect.
//
// The count of arguments is reported and never the arguments themselves: one
// could be a path, and a path carries the prohibited token.
// ---------------------------------------------------------------------------

/** Returns why the argument vector is unusable, or null when it is empty. */
function rejectUnexpectedArguments(argv: readonly string[]): string | null {
  const supplied = argv.length - PROGRAM_ARGUMENT_OFFSET;

  if (supplied <= 0) {
    return null;
  }

  return (
    `This guard accepts no arguments and ${groupDigits(supplied)} were supplied. ` +
    'It has no options and will not be given any: what it enforces is fixed in ' +
    'its own operating table so that it cannot be invoked in a weaker mode. The ' +
    'arguments are deliberately not echoed, since one could be a path. Refusing ' +
    'is safer than ignoring them, which would let a caller believe an option took ' +
    'effect.'
  );
}

// ---------------------------------------------------------------------------
// The run.
//
// Every leg is attempted, even after an earlier one has failed, so that one run
// reports everything it can find. The four are independent reads over the same
// unchanging state, so they are issued together rather than in sequence.
// ---------------------------------------------------------------------------

/** Runs the whole check and returns the code the process should exit with. */
async function run(): Promise<ExitCode> {
  reportLine('Corpus integrity check');

  const verificationFailures: string[] = [];
  const argumentProblem = rejectUnexpectedArguments(process.argv);

  if (argumentProblem !== null) {
    verificationFailures.push(argumentProblem);
    reportVerificationFailures(verificationFailures);
    reportVerdict(EXIT_CODES.VERIFICATION_IMPOSSIBLE);
    return EXIT_CODES.VERIFICATION_IMPOSSIBLE;
  }

  const rootOutcome = await resolveRepositoryRoot();

  if (!rootOutcome.ok) {
    verificationFailures.push(rootOutcome.reason);
    reportVerificationFailures(verificationFailures);
    reportVerdict(EXIT_CODES.VERIFICATION_IMPOSSIBLE);
    return EXIT_CODES.VERIFICATION_IMPOSSIBLE;
  }

  const { root } = rootOutcome;

  const [shapeOutcome, statusOutcome, differenceOutcome, untrackedOutcome, structureOutcome] =
    await Promise.all([
      inspectShape(root),
      probeForDivergence(root, STATUS_PROBE_ARGUMENTS, 'working-tree status probe', true),
      probeForDivergence(
        root,
        DIFFERENCE_PROBE_ARGUMENTS,
        'difference-against-the-commit probe',
        false,
      ),
      probeForDivergence(root, UNTRACKED_PROBE_ARGUMENTS, 'untracked-file probe', false),
      inspectStructure(root),
    ]);

  let shape: ShapeFindings | null = null;
  let status: DivergenceTally | null = null;
  let difference: DivergenceTally | null = null;
  let untracked: DivergenceTally | null = null;
  let structure: StructureFindings | null = null;

  if (shapeOutcome.ok) {
    shape = shapeOutcome.findings;
  } else {
    verificationFailures.push(shapeOutcome.reason);
  }

  if (statusOutcome.ok) {
    status = statusOutcome.tally;
  } else {
    verificationFailures.push(statusOutcome.reason);
  }

  if (differenceOutcome.ok) {
    difference = differenceOutcome.tally;
  } else {
    verificationFailures.push(differenceOutcome.reason);
  }

  if (untrackedOutcome.ok) {
    untracked = untrackedOutcome.tally;
  } else {
    verificationFailures.push(untrackedOutcome.reason);
  }

  if (structureOutcome.ok) {
    structure = structureOutcome.findings;
  } else {
    verificationFailures.push(structureOutcome.reason);
  }

  const findings: RunFindings = {
    shape,
    status,
    difference,
    untracked,
    structure,
    verificationFailures,
  };

  reportSummary(findings);
  reportShape(findings.shape);
  reportDivergence(
    'Frames differing from their committed state',
    'These are named by number because a frame name may not be reproduced in output. Restore them from history: nothing here is repaired automatically, since a guard that wrote to the corpus would commit the very breach it detects.',
    findings.status,
  );
  reportDivergence(
    'Frames differing from the commit',
    'Reported by a second, independent probe. Both are required to be empty, because how a difference in file mode is reported depends on how the repository is configured to track modes, whereas the status probe reports one either way.',
    findings.difference,
  );
  reportDivergence(
    'Files present under the corpus directory but recorded in no commit',
    'Nothing may be added under a read-only path. This probe deliberately runs without the standard-exclusion flag, so an ignore rule cannot hide an addition from it.',
    findings.untracked,
  );
  reportStructure(findings.structure);
  reportVerificationFailures(findings.verificationFailures);

  const code = chooseExitCode(findings);

  reportVerdict(code);

  return code;
}

// ---------------------------------------------------------------------------
// Entry point.
//
// The code is set on the process rather than passed to an exit call, and nothing
// in this file calls one. That is what guarantees the report is flushed: an
// explicit exit can end the process while written lines are still queued on a
// pipe, which loses exactly the output a failing pipeline stage exists to
// produce. Setting the code and returning lets the runtime drain its streams.
//
// The handler is unconditional. Any throw at all — an unanticipated permission
// error, a platform quirk, a defect in this file — becomes a verification
// failure. Nothing reaches a zero exit by way of an exception, because a guard
// that exits clean without having checked anything is worse than no guard.
// ---------------------------------------------------------------------------

try {
  process.exitCode = await run();
} catch (error: unknown) {
  failureLine('');
  failureLine('Verification could not be completed');
  failureLine(
    `  This guard stopped on an unexpected error (${describeErrorCode(error)}). The ` +
      'error text is deliberately not repeated, because it can embed a path. A run ' +
      'that did not finish has established nothing, so a failure is reported rather ' +
      'than a result.',
  );
  reportVerdict(EXIT_CODES.VERIFICATION_IMPOSSIBLE);
  process.exitCode = EXIT_CODES.VERIFICATION_IMPOSSIBLE;
}
