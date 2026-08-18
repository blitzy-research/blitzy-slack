/**
 * Pass 4 of the acceptance-criteria manifest generator: the join, the status a
 * criterion may be given, and the subtotal gate.
 *
 * WHAT THIS MODULE DECIDES
 *
 * Parsing established which criteria exist. Discovery established which tests
 * claim one. This module is where those two facts are put together, where each
 * criterion acquires the only status this tool has the authority to give it, and
 * where the run's traceability arithmetic is gated: 39 + 46 + 61 + 57 + 38 = 241,
 * per area and in total, or the run does not pass.
 *
 * IT IS PURE, AND THAT IS A DESIGN CONSTRAINT RATHER THAN AN ACCIDENT
 *
 * Nothing here reads a file, writes a file, reports to a stream, or ends the
 * process. It computes a report over its two arguments and returns it; `index.ts`
 * prints that report and chooses the exit code, and `emit.ts` renders it into the
 * manifest. The separation is what lets the writing mode and the pipeline's
 * non-writing `--check` mode share ONE analysis. Two modes that each computed
 * their own verdict would eventually compute two different ones, and the mode
 * nobody runs locally is the one that would drift.
 *
 * The module also imports no Node built-in at all, which makes the purity
 * checkable from the import list rather than by reading every function.
 *
 * COVERAGE IS NOT SATISFACTION, AND THAT DISTINCTION IS THE POINT
 *
 * This tool runs no test, reads no test report and learns no outcome. So a
 * citation discovered in a comment supports exactly one claim — that a test
 * CLAIMS a criterion — and it supports no claim whatsoever about whether that
 * test exercises the criterion or passes. Rule `R3` (uncertainty is not
 * permission to omit) states the constraint directly: an acceptance criterion may
 * not be marked satisfied without a passing test behind it. That is why the
 * status vocabulary has exactly two members, why no member of the report is named
 * or typed as a satisfied state, and why {@link formatCoverageLine} labels its
 * figure as cited coverage in the line itself rather than in a footnote somebody
 * can drop while copying the number.
 *
 * The run report's own `Phase 1 area criteria N/241` line reports SATISFACTION
 * and may only be filled in from passing test results. It must never be filled in
 * from the figure this module computes. The two numbers answer different
 * questions and, before any test is written, the first is 0 while the second may
 * legitimately be 241.
 *
 * ONE GATE FAMILY, NEVER SUMMED WITH ANOTHER
 *
 * This tool owns exactly one family: the 241 Phase-1 area criteria, split 39 / 46
 * / 61 / 57 / 38 across the five documents. The run's other families — 11 Phase-0
 * authored gates, 12 Phase-1 catalog gates, 3 Phase-1 authored gates and 11
 * standing gates — belong to the gate ledger named by `GATE_LEDGER_PATH` in the
 * constants module and are tracked there. They are disjoint sets counting
 * different kinds of thing, so a combined figure is not a tidier summary of the
 * same fact but a number that answers no question, and it would conceal exactly
 * what a reader needs: a family at full coverage cannot make up for a family that
 * is short, and a merged total lets it appear to. The ledger and this manifest
 * have to agree about status, which they can only do while this module never
 * invents one.
 *
 * THE GATE, AND THE ONE THING IT MAY NEVER DO
 *
 * An observed count is whatever was counted. An expectation is a measured fact
 * about a read-only input. When the two disagree, the temptation is to adjust one
 * until the arithmetic closes — and rule `R2` (corpus and specification handling)
 * forbids both available forms of that: it prohibits correcting the specification
 * in place, and it requires a defect in a read-only input to be RECORDED and
 * worked around under the stated precedence order. So no count is clamped, padded
 * or nudged anywhere in this file, no expectation is mutated, and a mismatch
 * produces {@link formatMismatchReport}, which states both figures per area and
 * names the defect register as where the discrepancy is written down. This tool
 * does not write that register either; it reports and stops.
 *
 * THE JOIN KEY IS (DOCUMENT BASENAME, 1-BASED LINE), AND NEVER A FRAME
 *
 * A frame is corroborating evidence, not identity. 178 of the 241 criteria cite
 * more than one frame and the mandated citation form carries only the first, so a
 * key including a frame would either fail to join a test that named the second or
 * force every test to enumerate all of them. 39 criteria also cite their frames in
 * an order that is not ascending, so "the first frame" is a fact about authored
 * order rather than about magnitude. {@link citationKey} is the single place a key
 * is formed, which is what keeps a frame out of one.
 *
 * WHY THE CITATION TYPE IS NAMED FOR DISCOVERY RATHER THAN FOR A TEST
 *
 * The build prompt for this module names a `TestCitation` type on the discovery
 * pass. No such export exists: the pass calls it {@link DiscoveredCitation}, and
 * that is the name imported here. Importing the name that exists is not a
 * deviation but the only option that compiles, and inventing a second citation
 * shape locally to satisfy a name would give one concept two declarations — which
 * is the drift this workspace's single-definition discipline exists to prevent. No
 * alias is exported either, because an alias is a second name for the same thing
 * and a reader who meets both has to work out which one the join uses.
 *
 * DETERMINISM IS PART OF THE CONTRACT
 *
 * `emit.ts` renders this report into a file that the pipeline's non-writing mode
 * compares byte for byte against what is committed, so two runs over an unchanged
 * tree must produce an identical report. Every list is therefore in an order this
 * module establishes explicitly: areas as the constants module declares them, rows
 * by document then ascending line, target tests deduplicated and sorted by code
 * unit, orphans and anomalies in the order discovery already fixed. Nothing here
 * reads a clock, a random source or an environment variable, so there is no other
 * way for two runs to differ.
 *
 * EVERY STRING THAT LEAVES HERE IS SAFE BY PROVENANCE
 *
 * Rule `R4` (third-party identity exclusion) keeps a third-party product name out
 * of anything this tool emits, and the manifest's own path is not one the
 * repository's brand guard allowlists — so a single leaked citation target would
 * fail the brand stage of the pipeline. This module adds no sanitizer of its own,
 * because it needs none and because a second opinion about safety is how a
 * diagnostic gets destroyed for a reason unrelated to what it reported. Instead
 * every string it emits comes from one of four sources, each already safe:
 *
 *   - a literal in the constants module, which contains no identity by
 *     construction;
 *   - a criterion's sanitized text, which the parse pass produces with link
 *     targets stripped and then asserts to be free of the structural needles;
 *   - a file path, an unrecognised basename or a near-miss excerpt from the
 *     discovery pass, each of which that pass has already put through the same
 *     needle check;
 *   - an integer, rendered as an integer.
 *
 * Frames appear as bare numbers throughout. No filename, percent-encoded path or
 * corpus reference is constructed or interpolated anywhere in this file, and there
 * is nothing here that could construct one: this module holds no path to the
 * corpus and no way to turn a frame number into one.
 *
 * HOW THE PROJECT RULES ARE CITED THROUGHOUT
 *
 * By requirement label and subject — `R1` authorization is server-side only, `R2`
 * corpus and specification handling, `R3` uncertainty is not permission to omit,
 * `R4` third-party identity exclusion, `R5` shared components implemented once.
 * Their own identifiers are deliberately not written out, because each is prefixed
 * with the very third-party product name that `R4` forbids in source and comments,
 * so spelling a rule's name in order to obey it would break it and would fail this
 * file at the brand stage. The subject accompanies the label every time because the
 * rules are supplied in an order that does not match their labels, so an ordinal
 * alone would point at the wrong constraint.
 *
 * @packageDocumentation
 */

import {
  AREA_DOCUMENTS,
  DEFECT_REGISTER_PATH,
  EXPECTED_TOTAL,
  GATE_FAMILY_LABEL,
  NO_FRAME_CITED,
  STATUS,
} from './constants.js';
import type { AreaBasename, AreaDocument, AreaKey, Status } from './constants.js';
import type { Criterion, ParsedArea, ParsedCatalog } from './parse.js';
import type { DiscoveredCitation, DiscoveryResult } from './discover.js';

// ---------------------------------------------------------------------------
// SECTION 1 — Failure that belongs to the tool, not to the project.
// ---------------------------------------------------------------------------

/**
 * The reconciliation could not be performed at all.
 *
 * THIS IS NEVER A GATE FAILURE, and holding the two apart is what makes the
 * pipeline's non-writing mode useful. A gate failure is this module working
 * correctly and reporting that the project is not where it should be: a subtotal
 * that does not reconcile, a citation naming a line no criterion occupies. Those
 * are returned in the report. A reconciliation error is different in kind — the
 * inputs contradict themselves, so no honest report exists to return. An area
 * whose own criterion list disagrees with its own count, a declared document
 * absent from the parsed catalog, two criteria claiming one join key: in each case
 * the rows this module would emit and the counts it would gate on describe
 * different sets, which is precisely the state where a manifest and a gate stop
 * agreeing while both look plausible.
 *
 * Collapsing the two into one outcome would make a broken tool indistinguishable
 * from an honest red gate, and the two demand opposite responses — fix the tool,
 * or fix the project. `index.ts` maps this class onto the tool-error exit code and
 * a subtotal mismatch onto the gate-failure one.
 *
 * The message carries structural facts only: area keys, basenames, and counts.
 * Never a criterion line, a fragment of one, or a link target — an error message
 * is the easiest place for text to escape, because it is thrown, caught, formatted
 * and printed by code that never looked at where the text came from.
 */
export class ReconciliationError extends Error {
  /**
   * @param reason A short structural description of the contradiction. Never pass
   *   a criterion line, a fragment of one, or any link target.
   * @param options Standard error options. A cause is welcome: the causes that
   *   reach here carry counts and identifiers rather than document text.
   */
  public constructor(reason: string, options?: ErrorOptions) {
    super(`Cannot reconcile the acceptance criteria: ${reason}.`, options);
    // Set explicitly: a subclass otherwise reports the base constructor's name,
    // which makes a precise failure look generic wherever it is caught.
    this.name = 'ReconciliationError';
  }
}

// ---------------------------------------------------------------------------
// SECTION 2 — The shapes this module returns.
//
// Every field is `readonly` and every list a `readonly` array. The report is a
// record of a computation over inputs that are themselves immutable, and two
// consumers read it for different purposes — `emit.ts` renders the rows while
// `index.ts` gates on the counts. A mutation between those two reads would let
// the rendered manifest and the reported verdict describe different sets, which
// is the one failure this whole arrangement exists to prevent. Immutability
// makes that a compile error rather than a matter of care.
// ---------------------------------------------------------------------------

/**
 * One row of the manifest: a criterion, joined to whatever claims it.
 *
 * A COMPLETE RENDER MODEL ON PURPOSE. Every field `emit.ts` needs to render a row
 * is here, so the emitter never reaches back into the parsed catalog to fill a
 * column. Two passes reading two sources for one row is how a rendered table
 * starts describing a slightly different set from the one the gate counted.
 *
 * THERE IS NO SATISFIED FIELD AND NO PASS-OR-FAIL FIELD. {@link status} carries
 * the whole of what this tool knows, and its two members are the whole vocabulary.
 */
export interface ManifestRow {
  /** The owning document's area key, for grouping and the per-area breakdown. */
  readonly areaKey: AreaKey;
  /** The owning document's basename — half of the citation join key. */
  readonly document: AreaBasename;
  /**
   * The owning document's repository-relative path.
   *
   * Repository-relative rather than absolute, because this value is rendered into
   * a committed manifest where an absolute path would record the layout of
   * whichever machine last regenerated it.
   */
  readonly path: AreaDocument['path'];
  /** 1-based line number within the whole document — the other half of the key. */
  readonly line: number;
  /**
   * Every frame the criterion cites, in AUTHORED order, repeats included.
   *
   * Authored order is preserved rather than sorted: 39 criteria cite their frames
   * in an order that is not ascending, and the first cited frame is the primary
   * one a test citation names, so sorting would silently change which frame that
   * is. Repeats are kept because they are what makes the measured total of 574
   * citations across the 241 criteria reconcile.
   */
  readonly frames: readonly number[];
  /**
   * The same frames reduced to first occurrences, in authored order.
   *
   * The two lists differ for exactly one criterion — the messaging document's
   * line 792 cites 8 times over 5 distinct frames — so a deduplicating count of
   * the whole set yields 571 rather than 574. Either figure may be reported;
   * neither may be reported under the other's name.
   */
  readonly distinctFrames: readonly number[];
  /**
   * The first frame cited, or `null` where the criterion cites none.
   *
   * `null` and never an absent property, so a consumer must handle the absence
   * rather than reading `undefined` and rendering an empty cell. This is the frame
   * a test citation names in the mandated form.
   */
  readonly primaryFrame: number | null;
  /**
   * The frames rendered for a manifest cell, or the no-frame phrase.
   *
   * Bare integers, separated for reading. Never a filename and never a path:
   * rule `R4` (third-party identity exclusion) governs every string this tool
   * emits, and a frame's identity as far as this tool is concerned is its number.
   *
   * Exactly two of the 241 criteria render the phrase instead — the
   * product-overview document's line 915 and the messaging document's line 801,
   * both security-contract criteria the corpus is structurally incapable of
   * evidencing. Their rows exist like every other row: rule `R3` (uncertainty is
   * not permission to omit) requires absence to be reported, never dropped, and
   * an implementation that treats a frame as required reports subtotals of 38 and
   * 56 — both off by one, both plausible, and the two criteria lost are among the
   * most consequential in the set.
   */
  readonly frameLabel: string;
  /** The criterion's prose, with link targets and the checklist marker removed. */
  readonly sanitizedText: string;
  /**
   * Repository-relative paths of the test files that cite this criterion,
   * deduplicated and sorted.
   *
   * Several tests may legitimately claim one criterion — a component test and an
   * end-to-end specification covering the same requirement, for instance — so this
   * is a list rather than a single path. Deduplicated because one file may carry
   * the same citation on two lines, which is one file's claim rather than two.
   * Empty where nothing claims the criterion, never absent.
   */
  readonly targetTests: readonly string[];
  /**
   * How many citations claim this criterion, counting every occurrence.
   *
   * Distinct from `targetTests.length`, which counts files. Two citations in one
   * file give a count of 2 and a single target, which is worth being able to see:
   * it is the shape a copied test block leaves behind.
   */
  readonly citationCount: number;
  /**
   * `'cited'` when at least one citation claims this criterion, `'uncovered'`
   * otherwise — and nothing else, ever.
   *
   * `'cited'` means a test CLAIMS this criterion. It is not evidence the test
   * exercises it and not evidence the test passes.
   */
  readonly status: Status;
}

/**
 * One area document's arithmetic and its coverage, side by side.
 *
 * {@link observed} comes from parsing and {@link expected} from the constants
 * module, and they are held apart deliberately rather than reconciled into a
 * single "count" with a boolean beside it. A report that shows only whether the
 * two agree leaves a reader who has to record a defect with nothing to record; a
 * report that shows both figures tells them what changed and by how much.
 */
export interface AreaReconciliation {
  /** The area key, as the constants module declares it. */
  readonly areaKey: AreaKey;
  /** The document's basename. */
  readonly document: AreaBasename;
  /** The document's repository-relative path. */
  readonly path: AreaDocument['path'];
  /**
   * How many criteria the parse pass found. Never adjusted toward
   * {@link expected}: clamping, padding or nudging this figure would defeat the
   * only gate that can detect a parser regression, and editing the document until
   * the arithmetic closes is prohibited outright.
   */
  readonly observed: number;
  /** The measured expectation the constants module records: 39, 46, 61, 57 or 38. */
  readonly expected: number;
  /** How many of this area's rows are cited by at least one test. */
  readonly cited: number;
  /** How many of this area's rows nothing claims. Always `observed - cited`. */
  readonly uncovered: number;
  /** Whether {@link observed} and {@link expected} agree. */
  readonly matches: boolean;
  /**
   * The parse pass's structural notes about this document, passed through.
   *
   * Reported and never acted on, and deliberately never gating. A note here says a
   * read-only input is not as it was recorded, which is a finding for a person
   * working under rule `R2` (corpus and specification handling) — not a signal to
   * correct anything, and not a reason to fail a run whose counts still close. It
   * is carried here rather than dropped because rule `R3` (uncertainty is not
   * permission to omit) requires absence and surprise alike to be reported.
   *
   * Kept out of {@link ReconciliationReport.anomalies} on purpose: that list has a
   * defined membership — near misses and unrecognised documents — and widening it
   * to include a different kind of finding would make its own count mean less.
   */
  readonly drift: readonly string[];
}

/**
 * One area whose observed count does not equal its expectation.
 *
 * Carries both figures, because "does not reconcile" is not a defect report and
 * the person who has to write one needs the numbers. This shape is never
 * constructed with an adjusted figure of any kind.
 */
export interface SubtotalMismatch {
  /** The area key whose subtotal disagrees. */
  readonly areaKey: AreaKey;
  /** The document's basename. */
  readonly document: AreaBasename;
  /** What was counted. */
  readonly observed: number;
  /** What was expected. */
  readonly expected: number;
}

/**
 * A citation naming a line that carries no criterion.
 *
 * THIS IS THE OFF-BY-ONE DETECTOR, and it is the reason the join reports what it
 * could not match instead of quietly matching nothing. A citation whose line is a
 * line or two out joins no row, so without this the criterion it meant to name
 * reads as uncovered while the test that names it reads as doing its job — two
 * false readings from one typo, in the one artifact that exists to prevent exactly
 * that.
 *
 * It matters most for the suites a rule mandates. Rule `R1` (authorization is
 * server-side only) requires every mutation and every projection to ship with a
 * test proving a non-member and a wrong-role caller are denied server-side, and
 * rule `R5` (shared components implemented once) requires each contract's tests to
 * live beside its single implementation. A mis-cited test in either suite
 * understates security or component coverage, so a mis-citation is reported as a
 * gate failure rather than as a note.
 *
 * A citation naming a document outside the five closed Phase-1 documents is NOT
 * one of these. The discovery pass separates those, and they reach
 * {@link ReconciliationReport.anomalies} instead: a criterion under a deferred
 * document is out of this run's scope, so it is a scope error rather than a
 * line-number error, and a join against it could appear to succeed against a
 * coincidentally numbered line.
 */
export interface OrphanCitation {
  /** The area document the citation names. One of the five closed documents. */
  readonly document: AreaBasename;
  /** The criterion line the citation claims — no criterion occupies it. */
  readonly line: number;
  /** Repository-relative path of the test file carrying the citation. */
  readonly file: string;
  /** The 1-based line inside that file that carries the citation. */
  readonly fileLine: number;
}

/**
 * Everything reconciliation determined, in deterministic order.
 *
 * There is no `satisfied`, `passing`, `verified` or `green` member, and adding one
 * would be a defect rather than an improvement: this tool reads no test result, so
 * it has no authority to report one, and rule `R3` (uncertainty is not permission
 * to omit) forbids marking a criterion satisfied without a passing test behind it.
 *
 * There is no scan metadata either — how many files were read, which targets were
 * present. `index.ts` holds the discovery result itself and can report that
 * directly; copying it through here would give one fact two owners.
 */
export interface ReconciliationReport {
  /**
   * One row per parsed criterion: document order first, then ascending line.
   *
   * Every criterion gets a row. A criterion citing no frame gets one, and so does
   * a criterion nothing claims — absence is reported, never dropped.
   */
  readonly rows: readonly ManifestRow[];
  /** The five areas, in the order the constants module declares them. */
  readonly areas: readonly AreaReconciliation[];
  /** The sum of the per-area observed counts. Equal to `rows.length`. */
  readonly observedTotal: number;
  /**
   * The run total for this one gate family: 241.
   *
   * Taken from the constants module and cross-checked against the sum of the five
   * per-area expectations, so the declared figure is verified rather than trusted.
   */
  readonly expectedTotal: number;
  /**
   * How many rows at least one test claims.
   *
   * CITED COVERAGE, NOT SATISFACTION. Before any test is written this is 0, which
   * is the correct and honest figure for a manifest generated — as it must be —
   * before any Phase-1 surface exists.
   */
  readonly citedTotal: number;
  /** How many rows nothing claims. Always `observedTotal - citedTotal`. */
  readonly uncoveredTotal: number;
  /**
   * How many discovered citations joined a row.
   *
   * Every discovered citation either joins a row or becomes an orphan, so this
   * plus `orphanCitations.length` is the number of joinable citations discovery
   * returned. It counts occurrences rather than criteria: several citations may
   * claim one criterion.
   */
  readonly citationsJoined: number;
  /** Citations naming a line no criterion occupies, in discovery order. */
  readonly orphanCitations: readonly OrphanCitation[];
  /**
   * Near misses and unrecognised-document citations, as bounded human-readable
   * lines in a stable order.
   *
   * Reported prominently and deliberately NOT gating — see
   * {@link ReconciliationReport.gateFailed} for why. The strings are composed from
   * values the discovery pass has already sanitized; nothing here re-derives them
   * from source text.
   */
  readonly anomalies: readonly string[];
  /** Every area whose observed count differs from its expectation. */
  readonly subtotalMismatches: readonly SubtotalMismatch[];
  /**
   * True only when every area's observed count equals its expectation AND the
   * observed total equals the declared run total.
   */
  readonly totalsOk: boolean;
  /**
   * Whether the gate this module owns has failed.
   *
   * THE POLICY, STATED ONCE AND DELIBERATELY. Two conditions fail the gate, and
   * two do not.
   *
   * FAILS — a subtotal that does not reconcile. The manifest would then have the
   * wrong number of rows, so every figure computed from it is wrong, including the
   * coverage figure a reader would otherwise trust.
   *
   * FAILS — an orphan citation. It means a test claims a criterion that does not
   * exist where it says, so one row understates coverage and one test overstates
   * its own reach. Both readings are wrong, and the mis-citation is invisible from
   * either end without this check. This is also the case where a mandated security
   * test can hide: under rule `R1` (authorization is server-side only) a mis-cited
   * denial test leaves the criterion reading as uncovered while the suite sits on
   * disk passing, and a gate failure is what surfaces it.
   *
   * DOES NOT FAIL — a near miss. A citation-shaped comment that missed the form by
   * a character is a defect in one comment, and the criterion it meant to claim
   * still reads as uncovered, which is honest. Failing a run over an author's typo
   * in a comment would train people to stop writing the comment.
   *
   * DOES NOT FAIL — a citation naming an unrecognised document. Usually a test
   * claiming a criterion from a deferred phase, which is a scope question for a
   * person rather than a corruption of this family's arithmetic.
   *
   * The dividing line is whether the manifest would be WRONG or merely
   * INCOMPLETE. A wrong row count or a false join corrupts the ledger; an
   * unmatched comment leaves it accurate and short, which is the state the ledger
   * exists to display. Both non-failing kinds are still reported in
   * {@link anomalies}, loudly enough to act on.
   */
  readonly gateFailed: boolean;
}

// ---------------------------------------------------------------------------
// SECTION 3 — The local presentation vocabulary.
//
// These values are local on purpose, and the reasoning deserves stating because
// rule `R3` (uncertainty is not permission to omit) requires an operating value
// to be defined once and consumed by reference. None of these is an operating
// value. They are the presentation of this one module's own report: they bind
// nothing another module can observe, none is derived from a frame, and no gate
// compares against one. Every value that DOES bind behaviour — the document set,
// the expected counts, the status vocabulary, the no-frame phrase, the gate
// family's label and the defect register's path — is imported above, and this
// file declares no substitute for any of them.
//
// The discovery pass draws the same line for the same reason, so the two modules
// are consistent about which values belong centrally and which do not.
// ---------------------------------------------------------------------------

/** Separates frame numbers inside a rendered manifest cell. */
const FRAME_LABEL_SEPARATOR = ', ';

/**
 * Separates the per-area entries of the coverage line's breakdown.
 *
 * U+00B7 MIDDLE DOT with exactly one space on each side, written literally in this
 * UTF-8 source so the run ledger's shape is reproduced character for character. An
 * ASCII substitute — a hyphen, a bullet, a full stop — would each read as the wrong
 * character in a form that is specified exactly.
 */
const AREA_BREAKDOWN_SEPARATOR = ' · ';

/**
 * Qualifies the coverage line's label, in the line itself.
 *
 * IN THE LINE RATHER THAN IN A FOOTNOTE, because the figure travels. A number
 * copied out of a report loses everything around it, and the one reading that must
 * never survive the copy is that 241 cited criteria are 241 satisfied criteria.
 * The qualifier makes the distinction part of the string.
 */
const CITED_COVERAGE_QUALIFIER = 'cited coverage, never satisfaction';

/** Joins the lines of a multi-line report. */
const REPORT_LINE_BREAK = '\n';

/** Indents a detail line under its heading in a multi-line report. */
const DETAIL_INDENT = '  ';

/** Label of the totals row in the subtotal table. */
const TOTAL_ROW_LABEL = 'total';

/** Column headings of the subtotal table, which is aligned to its widest cell. */
const AREA_HEADING = 'area';
const DOCUMENT_HEADING = 'document';
const OBSERVED_HEADING = 'observed';
const EXPECTED_HEADING = 'expected';

/** Separates the columns of the subtotal table. */
const COLUMN_GAP = '  ';

/**
 * Length ceiling for an unrecognised basename quoted in an anomaly line.
 *
 * The citation pattern accepts any word-and-dot basename, so this value is
 * arbitrary source text in the general case even though every real one is short.
 * A bound keeps a diagnostic from becoming a conduit for file contents, which is a
 * safety property first and a readability one second.
 *
 * Truncating is safe: the value arrives already proved free of the structural
 * needles, and a substring of a string that does not contain a needle cannot
 * contain one.
 */
const UNKNOWN_DOCUMENT_LABEL_MAX_LENGTH = 64;

/** Appended where a quoted label was cut, so a reader can see that it was. */
const LABEL_TRUNCATION_MARKER = '…';

/**
 * Separates the two halves of a citation key.
 *
 * `#L` cannot occur inside either half, which is what makes the composite
 * unambiguous: the citation pattern admits only word characters, dots and hyphens
 * in a basename, and a line is a run of digits. So no pair of distinct (document,
 * line) inputs can produce the same key, and no key can be read two ways.
 */
const CITATION_KEY_SEPARATOR = '#L';

// ---------------------------------------------------------------------------
// SECTION 4 — Ordering, because the report is compared byte for byte.
// ---------------------------------------------------------------------------

/**
 * Orders two strings by code unit.
 *
 * Deliberately not locale-aware. Locale-sensitive collation depends on the
 * environment's locale data and its version, so the same two paths can order
 * differently on a developer's machine and in the pipeline — which is enough to
 * make the emitted manifest differ from the committed one and fail a comparison
 * that has nothing to do with what changed. Code-unit ordering is total, stable and
 * identical everywhere, and no reader of a sorted list of file paths is served
 * better by locale rules.
 */
function compareStrings(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

/**
 * Reduces a list of paths to its distinct members, in code-unit order.
 *
 * Deduplicating before sorting rather than after is a detail worth keeping: the
 * set preserves nothing about order, so sorting afterwards is what makes the result
 * a function of the contents alone rather than of the order they arrived in.
 */
function distinctSortedPaths(paths: readonly string[]): readonly string[] {
  return [...new Set(paths)].sort(compareStrings);
}

/** The widest of a set of rendered cells, for aligning a column. */
function columnWidth(cells: readonly string[]): number {
  let width = 0;
  for (const cell of cells) {
    if (cell.length > width) {
      width = cell.length;
    }
  }
  return width;
}

// ---------------------------------------------------------------------------
// SECTION 5 — The join key, formed in exactly one place.
// ---------------------------------------------------------------------------

/**
 * The key a criterion and a citation are joined on: document basename and
 * 1-based line.
 *
 * A FRAME NEVER ENTERS THIS FUNCTION, and confining key formation to one place is
 * what keeps it that way. 178 of the 241 criteria cite more than one frame while
 * the mandated citation form carries only the first, so a key including a frame
 * would fail to join a test that named the second — and 39 criteria cite their
 * frames in a non-ascending order, so "the first" is a fact about authored order
 * that a key has no business depending on. Basename and line identify a criterion
 * uniquely; nothing else is needed and nothing else is admitted.
 *
 * The parameter is typed as one of the five closed basenames rather than as a
 * string, so a caller cannot key on a document that is out of scope for this
 * phase. The discovery pass already separates a citation naming any other
 * document, which is what makes that type honest at the call site.
 */
function citationKey(document: AreaBasename, line: number): string {
  return `${document}${CITATION_KEY_SEPARATOR}${line}`;
}

// ---------------------------------------------------------------------------
// SECTION 6 — Internal agreement, checked before anything is computed.
//
// Each check below catches a state in which the rows this module would emit and
// the counts it would gate on describe different sets. None of them can arise
// from the real inputs; all of them can arise from an edit, and each would
// otherwise produce a plausible wrong answer rather than an error.
// ---------------------------------------------------------------------------

/**
 * Checks the declared run total against the sum of the five declared subtotals.
 *
 * The constants module writes 241 as a literal for readability and says plainly
 * that this pass must verify it. So the literal is checked rather than trusted:
 * an edit that changed one subtotal and forgot the total would otherwise ship a
 * manifest whose arithmetic does not close, and every figure derived from it —
 * including the coverage denominator a reader takes on trust — would be wrong.
 *
 * A tool error rather than a gate failure. The project is not being reported as
 * short of anything; the tool's own table disagrees with itself, and there is no
 * honest report to return until it does not.
 */
function assertDeclaredTotalsAgree(): void {
  const summed = AREA_DOCUMENTS.reduce((total, entry) => total + entry.expectedCriteria, 0);

  if (summed !== EXPECTED_TOTAL) {
    throw new ReconciliationError(
      `the declared run total is ${EXPECTED_TOTAL} but the five declared area subtotals sum to ` +
        `${summed}; the constants module disagrees with itself, so no subtotal can be gated`,
    );
  }
}

/**
 * Finds the parsed area for a declared document, or refuses to continue.
 *
 * Looked up by area key rather than taken positionally. The parse pass does
 * iterate the declared documents in order, so an index would work today — and
 * would keep working right up until a future edit reordered one list, at which
 * point every row would be attributed to the wrong document while every count
 * stayed correct. That is the worst available failure: a manifest that reconciles
 * perfectly and is wrong in every row.
 */
function findParsedArea(parsed: ParsedCatalog, entry: AreaDocument): ParsedArea {
  const found = parsed.areas.find((area) => area.areaKey === entry.areaKey);

  if (found === undefined) {
    throw new ReconciliationError(
      `the parsed catalog has no area ${entry.areaKey} (${entry.basename}), which the closed ` +
        'document set declares, so its criteria cannot be reconciled',
    );
  }

  return found;
}

/**
 * Checks one parsed area against itself and against its declaration.
 *
 * Three disagreements, each fatal for the same reason — the rows and the counts
 * would describe different sets:
 *
 *   - a count that differs from the length of the list it counts. The gate would
 *     then compare a number against an expectation while the manifest rendered a
 *     different number of rows;
 *   - an expectation that differs from the declared one. The parse pass copies the
 *     declaration, so a difference means one of the two lists was edited alone;
 *   - a criterion filed under the wrong document or area key, which would put a
 *     row in the wrong group and make its join key name a document it does not
 *     belong to.
 */
function assertAreaConsistent(area: ParsedArea, entry: AreaDocument): void {
  if (area.criteria.length !== area.observedCount) {
    throw new ReconciliationError(
      `area ${area.areaKey} reports ${area.observedCount} criteria but carries ` +
        `${area.criteria.length}; the count and the criteria it counts disagree`,
    );
  }

  if (area.expectedCount !== entry.expectedCriteria) {
    throw new ReconciliationError(
      `area ${area.areaKey} was parsed against an expectation of ${area.expectedCount} but the ` +
        `closed document set declares ${entry.expectedCriteria}`,
    );
  }

  for (const criterion of area.criteria) {
    if (criterion.document !== entry.basename || criterion.areaKey !== entry.areaKey) {
      throw new ReconciliationError(
        `a criterion at line ${criterion.line} is filed under area ${area.areaKey} but names ` +
          `area ${criterion.areaKey}, so its join key would name the wrong document`,
      );
    }
  }
}

/**
 * Checks the catalog's own totals against the areas they are meant to total.
 *
 * The parse pass derives both totals from its own per-area figures, so a
 * disagreement here means the flattened view and the per-area view of the same
 * parse have diverged. The flattened criterion list is checked by length for the
 * same reason: it is what other consumers read, and a manifest built from the
 * per-area lists would then describe a different set from the one they see.
 */
function assertCatalogTotalsAgree(
  parsed: ParsedCatalog,
  observedTotal: number,
  expectedTotal: number,
): void {
  if (parsed.observedTotal !== observedTotal) {
    throw new ReconciliationError(
      `the parsed catalog reports ${parsed.observedTotal} criteria in total but its areas carry ` +
        `${observedTotal}`,
    );
  }

  if (parsed.expectedTotal !== expectedTotal) {
    throw new ReconciliationError(
      `the parsed catalog expects ${parsed.expectedTotal} criteria in total but the closed ` +
        `document set declares ${expectedTotal}`,
    );
  }

  if (parsed.criteria.length !== observedTotal) {
    throw new ReconciliationError(
      `the parsed catalog's flattened criterion list holds ${parsed.criteria.length} entries ` +
        `where its areas carry ${observedTotal}`,
    );
  }
}

// ---------------------------------------------------------------------------
// SECTION 7 — The join: criteria in, rows and orphans out.
// ---------------------------------------------------------------------------

/**
 * What accumulates against one join key while citations are indexed.
 *
 * Two figures rather than one, because they answer different questions. The file
 * list becomes a row's target tests, deduplicated, because a reader wants to know
 * WHERE the claim lives. The count is every occurrence, because two citations in
 * one file is a distinguishable state — it is the shape a copied test block leaves
 * behind — and a deduplicated list alone would hide it.
 *
 * Local and mutable, unlike everything this module returns: it exists only between
 * the index being built and the rows being built, and nothing outside this file can
 * observe it.
 */
interface CitationAccumulator {
  /** Every citing file, in the order discovery returned them, repeats included. */
  readonly files: string[];
  /** How many citations claim the key, counting every occurrence. */
  count: number;
}

/**
 * Indexes every joinable citation by (document basename, 1-based line).
 *
 * The frame is discarded here, deliberately and completely: it is corroborating
 * evidence about which capture shows the behaviour, and it plays no part in
 * identifying the criterion. Discarding it at the index rather than ignoring it at
 * the lookup means no later edit can quietly start keying on it.
 *
 * Citations naming a document outside the five closed Phase-1 documents never reach
 * here — the discovery pass separates them — so every key formed in this function
 * names a document that is in scope.
 */
function indexCitations(
  citations: readonly DiscoveredCitation[],
): ReadonlyMap<string, CitationAccumulator> {
  const index = new Map<string, CitationAccumulator>();

  for (const citation of citations) {
    const key = citationKey(citation.document, citation.line);
    const existing = index.get(key);

    if (existing === undefined) {
      index.set(key, { files: [citation.file], count: 1 });
      continue;
    }

    existing.files.push(citation.file);
    existing.count += 1;
  }

  return index;
}

/**
 * Renders a criterion's frames for a manifest cell.
 *
 * Distinct frames rather than every citation, because a cell reading the same
 * number twice reads as a rendering fault rather than as the fact it is. The
 * authored order is kept, so the first number shown is the primary frame a test
 * citation names. `frames` on the row carries the full authored list with repeats
 * for anyone who needs the citation count to reconcile.
 *
 * Bare integers throughout, and the no-frame phrase where there are none — never
 * an empty cell, which reads as "not filled in" when the absence is itself the
 * finding.
 */
function renderFrameLabel(criterion: Criterion): string {
  if (criterion.distinctFrames.length === 0) {
    return NO_FRAME_CITED;
  }

  return criterion.distinctFrames.join(FRAME_LABEL_SEPARATOR);
}

/**
 * Builds one manifest row by joining a criterion to whatever claims it.
 *
 * A criterion nothing claims still produces a row, with an empty target list and
 * the uncovered status. That is the state of every one of the 241 rows on the first
 * run — the manifest is generated before any Phase-1 surface exists, because a
 * criterion is satisfied only when a referencing test passes, so the manifest has
 * to be the precondition rather than a report written afterwards.
 */
function buildRow(
  criterion: Criterion,
  index: ReadonlyMap<string, CitationAccumulator>,
): ManifestRow {
  const claims = index.get(citationKey(criterion.document, criterion.line));
  const citationCount = claims === undefined ? 0 : claims.count;

  return {
    areaKey: criterion.areaKey,
    document: criterion.document,
    path: criterion.path,
    line: criterion.line,
    frames: criterion.frames,
    distinctFrames: criterion.distinctFrames,
    primaryFrame: criterion.primaryFrame,
    frameLabel: renderFrameLabel(criterion),
    sanitizedText: criterion.sanitizedText,
    targetTests: claims === undefined ? [] : distinctSortedPaths(claims.files),
    citationCount,
    // The only place a status is decided. A citation is a claim by a test, so
    // `cited` says a test names this criterion and says nothing whatsoever about
    // whether that test exercises it or passes. There is no third possibility to
    // choose between.
    status: citationCount > 0 ? STATUS.cited : STATUS.uncovered,
  };
}

/**
 * Builds one area's rows in ascending line order, registering each join key.
 *
 * The sort is explicit even though the parse pass already returns criteria in line
 * order. Ordering is part of this report's contract — the emitted manifest is
 * compared byte for byte — so it is established here rather than inherited, which
 * means a future change to how parsing collects criteria cannot reorder a committed
 * file as a side effect.
 *
 * The key set is filled as it goes, and a repeat is fatal. Two criteria claiming one
 * key cannot both be joined: a citation of that line would be attributed to whichever
 * row happened to be built first, so one criterion would silently absorb the other's
 * coverage. It cannot happen on the real documents, where a criterion is exactly one
 * physical line.
 */
function buildAreaRows(
  entry: AreaDocument,
  area: ParsedArea,
  index: ReadonlyMap<string, CitationAccumulator>,
  criterionKeys: Set<string>,
): readonly ManifestRow[] {
  const ordered = [...area.criteria].sort((left, right) => left.line - right.line);
  const rows: ManifestRow[] = [];

  for (const criterion of ordered) {
    const key = citationKey(criterion.document, criterion.line);

    if (criterionKeys.has(key)) {
      throw new ReconciliationError(
        `two criteria in ${entry.basename} claim line ${criterion.line}; a join key must ` +
          'identify exactly one criterion, so a citation of that line could not be attributed',
      );
    }

    criterionKeys.add(key);
    rows.push(buildRow(criterion, index));
  }

  return rows;
}

/**
 * Collects every citation that matched no criterion line.
 *
 * Returned in the order discovery established — file, then line within the file —
 * which is the order a reader works through them in, and which is stable across
 * runs. Occurrences are kept rather than deduplicated: two mis-citations in one
 * file are two lines to correct.
 */
function collectOrphanCitations(
  citations: readonly DiscoveredCitation[],
  criterionKeys: ReadonlySet<string>,
): readonly OrphanCitation[] {
  const orphans: OrphanCitation[] = [];

  for (const citation of citations) {
    if (criterionKeys.has(citationKey(citation.document, citation.line))) {
      continue;
    }

    orphans.push({
      document: citation.document,
      line: citation.line,
      file: citation.file,
      fileLine: citation.fileLine,
    });
  }

  return orphans;
}

/**
 * Bounds a quoted label, marking the cut.
 *
 * Safe by construction: the value arrives from the discovery pass already proved
 * free of the structural needles, and a substring of a string that does not contain
 * a needle cannot contain one — so bounding a sanitized value cannot unsanitize it.
 */
function boundedLabel(value: string): string {
  if (value.length <= UNKNOWN_DOCUMENT_LABEL_MAX_LENGTH) {
    return value;
  }

  return `${value.slice(0, UNKNOWN_DOCUMENT_LABEL_MAX_LENGTH)}${LABEL_TRUNCATION_MARKER}`;
}

/**
 * Folds the discovery pass's two anomaly kinds into human-readable lines.
 *
 * PASSED THROUGH, NEVER RE-DERIVED. Every interpolated value is one the discovery
 * pass produced and already checked: a repository-relative file path, an
 * unrecognised basename, a bounded and link-stripped excerpt. No source text is
 * read here, no needle check is repeated, and nothing is reconstructed from a
 * comment — rule `R4` (third-party identity exclusion) is satisfied by provenance,
 * which is stronger than a second check because a second check can only ever
 * destroy a diagnostic the first one already made safe.
 *
 * Unrecognised documents come first, then near misses. Both groups arrive sorted
 * from discovery and neither is re-sorted, so the order is stable and each group
 * stays grouped by the file it was found in. The kinds are labelled because they
 * need different responses: an unrecognised document is a scope question — usually
 * a test claiming a criterion from a deferred phase — while a near miss is one
 * character in one comment.
 */
function buildAnomalies(discovered: DiscoveryResult): readonly string[] {
  const anomalies: string[] = [];

  for (const citation of discovered.unknownDocuments) {
    anomalies.push(
      `unrecognised document — ${citation.file} line ${citation.fileLine} cites ` +
        `${boundedLabel(citation.document)} L${citation.line}, which is not one of the five ` +
        'Phase-1 area documents this tool reconciles, so it joins nothing',
    );
  }

  for (const nearMiss of discovered.nearMisses) {
    anomalies.push(
      `malformed citation — ${nearMiss.file} line ${nearMiss.line} carries a citation-shaped ` +
        `comment that does not match the mandated form: ${nearMiss.fragment}`,
    );
  }

  return anomalies;
}

// ---------------------------------------------------------------------------
// SECTION 8 — The gate.
// ---------------------------------------------------------------------------

/**
 * Reconciles one area: its counts, its coverage and its notes.
 *
 * The observed figure is the parse pass's count and the expected figure is the
 * declaration in the constants module. NEITHER IS TOUCHED. There is no branch in
 * this function that could adjust one toward the other, which is the point: the
 * only way to make a subtotal reconcile is to change what the parse pass counts or
 * to record a defect, and both of those happen outside this file.
 */
function reconcileArea(
  entry: AreaDocument,
  area: ParsedArea,
  rows: readonly ManifestRow[],
): AreaReconciliation {
  const cited = rows.filter((row) => row.status === STATUS.cited).length;

  return {
    areaKey: entry.areaKey,
    document: entry.basename,
    path: entry.path,
    observed: area.observedCount,
    expected: entry.expectedCriteria,
    cited,
    uncovered: area.observedCount - cited,
    matches: area.observedCount === entry.expectedCriteria,
    drift: area.drift,
  };
}

/**
 * Lists the areas whose subtotals disagree, carrying both figures.
 *
 * In declared order, so a report reads in the same sequence as the coverage line's
 * breakdown and the subtotal table.
 */
function collectSubtotalMismatches(
  areas: readonly AreaReconciliation[],
): readonly SubtotalMismatch[] {
  const mismatches: SubtotalMismatch[] = [];

  for (const area of areas) {
    if (area.matches) {
      continue;
    }

    mismatches.push({
      areaKey: area.areaKey,
      document: area.document,
      observed: area.observed,
      expected: area.expected,
    });
  }

  return mismatches;
}

/**
 * Joins the parsed criteria to the discovered citations and gates the arithmetic.
 *
 * Pure: no file is read or written, nothing is printed, and the process is never
 * ended. The two arguments are not mutated, and nothing they contain is mutated —
 * every field of both is `readonly`, and the returned report holds the criteria's
 * own frame lists rather than copies of them, which is safe precisely because they
 * cannot be changed.
 *
 * The order of work matters in one place: the declared totals are checked before
 * anything is computed, because a constants module that disagrees with itself makes
 * every figure downstream of it meaningless, and reporting that as a subtotal
 * mismatch would blame the project for the tool's own defect.
 *
 * @param parsed The five area documents as the parse pass read them.
 * @param discovered The citations as the discovery pass found them. An empty result
 *   is normal and expected: on the first run no test exists yet, and the honest
 *   report is 241 rows, every one uncovered, with the gate passing.
 * @returns The rows, the per-area arithmetic, the coverage counts, the orphans, the
 *   anomalies and the gate verdict — every list in a deterministic order.
 * @throws ReconciliationError If the inputs contradict themselves or each other. A
 *   subtotal that does not reconcile is NOT such a case: that is a gate failure and
 *   is returned in the report.
 */
export function reconcile(
  parsed: ParsedCatalog,
  discovered: DiscoveryResult,
): ReconciliationReport {
  assertDeclaredTotalsAgree();

  const index = indexCitations(discovered.citations);
  const criterionKeys = new Set<string>();
  const rows: ManifestRow[] = [];
  const areas: AreaReconciliation[] = [];

  // The closed document set is iterated in declared order, and each area is looked
  // up by key rather than by position, so the report's order is a property of the
  // declaration rather than of how the parse pass happened to assemble its list.
  for (const entry of AREA_DOCUMENTS) {
    const parsedArea = findParsedArea(parsed, entry);
    assertAreaConsistent(parsedArea, entry);

    const areaRows = buildAreaRows(entry, parsedArea, index, criterionKeys);

    rows.push(...areaRows);
    areas.push(reconcileArea(entry, parsedArea, areaRows));
  }

  // Summed from the per-area figures rather than taken from the catalog's own
  // total, so the catalog's total can be checked against this derivation instead of
  // being trusted. `rows.length` equals this figure because every area's count was
  // checked against the length of the list it counts.
  const observedTotal = areas.reduce((total, item) => total + item.observed, 0);

  assertCatalogTotalsAgree(parsed, observedTotal, EXPECTED_TOTAL);

  const citedTotal = rows.filter((row) => row.status === STATUS.cited).length;
  const orphanCitations = collectOrphanCitations(discovered.citations, criterionKeys);
  const subtotalMismatches = collectSubtotalMismatches(areas);

  // Both conditions are stated even though the first implies the second whenever
  // the declared subtotals sum to the declared total — which the first assertion
  // above guarantees today. The redundancy is deliberate: it is the check that
  // survives a future edit to the document set, and it costs one comparison.
  const totalsOk = subtotalMismatches.length === 0 && observedTotal === EXPECTED_TOTAL;

  return {
    rows,
    areas,
    observedTotal,
    expectedTotal: EXPECTED_TOTAL,
    citedTotal,
    uncoveredTotal: observedTotal - citedTotal,
    citationsJoined: discovered.citations.length - orphanCitations.length,
    orphanCitations,
    anomalies: buildAnomalies(discovered),
    subtotalMismatches,
    totalsOk,
    // The documented policy, in one expression: a wrong row count or a false join
    // fails, an unmatched comment does not. See `ReconciliationReport.gateFailed`
    // for why the line falls there.
    gateFailed: !totalsOk || orphanCitations.length > 0,
  };
}

// ---------------------------------------------------------------------------
// SECTION 9 — Reporting: one line for the ledger, two for the gate.
//
// These functions render; they decide nothing. Every figure they print is already
// in the report, so a reader comparing a printed line against the structured
// result can never find them disagreeing.
// ---------------------------------------------------------------------------

/** Renders a count with the right noun, so a report reads as English. */
function pluralise(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * The one-line coverage figure for THIS gate family, in the run ledger's shape.
 *
 * The line reports CITED COVERAGE and says so in the label. The run report's own
 * `Phase 1 area criteria N/241` line reports SATISFACTION and may only be filled in
 * from passing test results — never from this figure. The two are different claims
 * about different evidence: before any test is written, satisfaction is 0 while
 * cited coverage may legitimately be 241, and a manifest that let one stand in for
 * the other would be exactly the false report the whole tool exists to prevent.
 *
 * ONE FAMILY, NEVER SUMMED WITH ANOTHER. This is the 241 Phase-1 area criteria and
 * nothing else. The 11 Phase-0 authored gates, the 12 Phase-1 catalog gates, the 3
 * Phase-1 authored gates and the 11 standing gates are tracked in the gate ledger —
 * `GATE_LEDGER_PATH` in the constants module — and are disjoint from these, so no
 * total may combine them. Labelling the family in the line itself is what keeps its
 * figure from being read as a run total.
 *
 * The denominator is the declared expectation rather than the observed count, so a
 * short parse shows up as a coverage figure that cannot reach its denominator rather
 * than as a full one over a smaller set.
 *
 * @returns A single line. It contains no line break, so it can be dropped into a
 *   ledger table or a log without reformatting.
 */
export function formatCoverageLine(report: ReconciliationReport): string {
  const breakdown = report.areas
    .map((area) => `${area.areaKey}:${area.cited}/${area.expected}`)
    .join(AREA_BREAKDOWN_SEPARATOR);

  return (
    `${GATE_FAMILY_LABEL} (${CITED_COVERAGE_QUALIFIER})${COLUMN_GAP}` +
    `${report.citedTotal}/${report.expectedTotal}${COLUMN_GAP}(${breakdown})`
  );
}

/**
 * The per-area observed-and-expected table, aligned to its widest cell.
 *
 * Rendered whether or not anything disagrees, because the figures are what a person
 * recording a defect has to write down, and a report that shows them only on failure
 * gives a reader nothing to compare against when they need to check the run that
 * passed.
 *
 * The total row carries its label in the area column and leaves the document column
 * blank, which keeps every column a fixed width without a second layout.
 */
function subtotalTableLines(report: ReconciliationReport): readonly string[] {
  const keyWidth = columnWidth([
    ...report.areas.map((area) => area.areaKey),
    AREA_HEADING,
    TOTAL_ROW_LABEL,
  ]);
  const documentWidth = columnWidth([
    ...report.areas.map((area) => area.document),
    DOCUMENT_HEADING,
  ]);
  const observedWidth = columnWidth([
    ...report.areas.map((area) => String(area.observed)),
    String(report.observedTotal),
    OBSERVED_HEADING,
  ]);
  const expectedWidth = columnWidth([
    ...report.areas.map((area) => String(area.expected)),
    String(report.expectedTotal),
    EXPECTED_HEADING,
  ]);

  const renderRow = (key: string, document: string, observed: string, expected: string): string =>
    DETAIL_INDENT +
    [
      key.padEnd(keyWidth),
      document.padEnd(documentWidth),
      observed.padStart(observedWidth),
      expected.padStart(expectedWidth),
    ].join(COLUMN_GAP);

  const lines = [
    renderRow(AREA_HEADING, DOCUMENT_HEADING, OBSERVED_HEADING, EXPECTED_HEADING),
    ...report.areas.map((area) =>
      renderRow(area.areaKey, area.document, String(area.observed), String(area.expected)),
    ),
    renderRow(TOTAL_ROW_LABEL, '', String(report.observedTotal), String(report.expectedTotal)),
  ];

  // Trailing padding on the last column serves no reader and would make the
  // rendered text sensitive to a change in the widest expectation, so it goes.
  return lines.map((line) => line.trimEnd());
}

/**
 * The subtotal verdict: both figures per area, and where a discrepancy is recorded.
 *
 * WHAT THIS FUNCTION MAY NOT DO is the reason it exists. When an observed count
 * disagrees with its expectation there are three available responses, and two are
 * prohibited: adjusting the count until the arithmetic closes, and editing the
 * read-only document until it matches. Rule `R2` (corpus and specification
 * handling) forbids correcting a specification in place and requires a defect in a
 * read-only input to be recorded and worked around under the stated precedence
 * order. So the third response is the only one, and this report is what routes a
 * reader to it: it states what was counted, what was expected, and names the defect
 * register as the place the discrepancy is written down.
 *
 * The tool does not write that register either. A generator that recorded its own
 * defects would be marking its own homework, and the entry needs a judgement about
 * precedence that no tool is in a position to make.
 *
 * @returns A multi-line report. Always the table; on failure, the disagreeing areas
 *   and the remedy as well.
 */
export function formatMismatchReport(report: ReconciliationReport): string {
  const table = subtotalTableLines(report);

  if (report.subtotalMismatches.length === 0) {
    return [
      `${GATE_FAMILY_LABEL}: every area subtotal reconciles, and the observed total of ` +
        `${report.observedTotal} matches the declared ${report.expectedTotal}.`,
      '',
      ...table,
    ].join(REPORT_LINE_BREAK);
  }

  const detail = report.subtotalMismatches.map(
    (mismatch) =>
      `${DETAIL_INDENT}${mismatch.areaKey} ${mismatch.document}: observed ${mismatch.observed}, ` +
      `expected ${mismatch.expected}`,
  );

  return [
    `${GATE_FAMILY_LABEL}: ${pluralise(
      report.subtotalMismatches.length,
      'area subtotal does not reconcile',
      'area subtotals do not reconcile',
    )}.`,
    '',
    ...table,
    '',
    ...detail,
    '',
    'Nothing has been adjusted. An observed count is what was counted and an expectation is a',
    'measured fact about a read-only input, so neither may be moved toward the other, and',
    'correcting the specification in place is prohibited.',
    '',
    `Record the discrepancy — both figures, per area — in ${DEFECT_REGISTER_PATH} and proceed`,
    'under the precedence order the build prompt states. This tool does not write that register.',
  ].join(REPORT_LINE_BREAK);
}

/**
 * The orphan verdict: citations naming a line that carries no criterion.
 *
 * The companion to {@link formatMismatchReport}, and it exists for a specific
 * reason rather than for symmetry. The gate this module owns fails on two
 * conditions; a formatter for one of them would leave the caller to invent prose
 * for the other, and prose invented at a point of use is how two callers end up
 * describing one failure two ways. Both failures are rendered here, so
 * `index.ts` prints and never composes.
 *
 * A mis-citation is worth this much attention because it is invisible from either
 * end. The criterion reads as uncovered, so a reader concludes a test needs
 * writing; the test reads as doing its job, so its author concludes nothing. Under
 * rule `R1` (authorization is server-side only) that combination can hide a
 * mandated denial or projection test while it sits on disk passing, and under rule
 * `R5` (shared components implemented once) it can hide a contract's co-located
 * test the same way. Neither is special-cased: every citation joins through the one
 * key, and every failure to join is reported here.
 *
 * @returns A multi-line report, or a single line stating there is nothing to report.
 */
export function formatOrphanReport(report: ReconciliationReport): string {
  if (report.orphanCitations.length === 0) {
    return `${GATE_FAMILY_LABEL}: every citation names a line that carries a criterion.`;
  }

  const detail = report.orphanCitations.map(
    (orphan) =>
      `${DETAIL_INDENT}${orphan.file} line ${orphan.fileLine} cites ${orphan.document} ` +
      `L${orphan.line}, where no criterion begins`,
  );

  return [
    `${GATE_FAMILY_LABEL}: ${pluralise(
      report.orphanCitations.length,
      'citation names a line that carries no criterion',
      'citations name a line that carries no criterion',
    )}.`,
    '',
    ...detail,
    '',
    'A citation like this joins nothing, so the criterion it meant to name reads as uncovered',
    'while the test that names it reads as covering something. Both readings are wrong. The',
    'usual cause is a line number written a line or two out.',
    '',
    'Correct the line number in the test. Nothing in the read-only documents changes, and no',
    'count here has been adjusted to accommodate the citation.',
  ].join(REPORT_LINE_BREAK);
}
