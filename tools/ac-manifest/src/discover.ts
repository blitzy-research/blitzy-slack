/**
 * Pass 2 of the acceptance-criteria manifest generator: the test tree to citations.
 *
 * WHAT THIS MODULE DOES
 *
 * It walks the repository's test trees and collects every inline criterion
 * citation it finds, so that the manifest's coverage column is DERIVED FROM THE
 * TESTS rather than hand-maintained. Nothing here reads a criterion: `parse.ts`
 * does that, from the closed list of area documents. The two passes are
 * deliberately independent and the join happens in `reconcile.ts`, which is why
 * this module does not import that one.
 *
 * WHAT A DISCOVERED CITATION MEANS — AND WHAT IT DOES NOT
 *
 * A citation establishes exactly one fact: A TEST CLAIMS THIS CRITERION. It is a
 * claim about intent, read out of a comment. It is not evidence that the test
 * exercises the criterion and it is not evidence that the test passes. This
 * module runs no test, reads no report and learns no outcome, so nothing it
 * returns may be read as satisfaction — project rule `R3` (uncertainty is not
 * permission to omit) states the constraint directly, and the status vocabulary
 * in the constants module has no `satisfied` member for the same reason. Every
 * name in this file is chosen to keep that distinction visible: things are
 * `cited`, `discovered` or `claimed`, never `covered`, `passing` or `verified`.
 *
 * THE JOIN KEY IS (DOCUMENT BASENAME, 1-BASED LINE NUMBER)
 *
 * The frame reference is corroborating evidence and never part of the key. The
 * reason is arithmetic rather than stylistic: 178 of the 241 criteria cite more
 * than one frame, so a key including a frame would fail to join a test that
 * happened to cite the second frame instead of the first. Two criteria cite no
 * frame at all, so the frame is also optional in the form. Both facts are
 * recorded on the pattern factory this module imports, and both are why the
 * frame is carried through as evidence and never consulted for identity.
 *
 * ON THE ONE FORM THAT DEGRADES RATHER THAN FAILING
 *
 * The strict pattern's frame tail is optional, so a comment whose tail uses an
 * ASCII substitute for the mandated middle dot still yields a well-formed
 * document-and-line pair; the malformed tail is simply not captured, and the
 * citation is returned with no frame. That is the correct outcome and not a
 * missed near miss: the join key is intact, the frame was only ever evidence,
 * and reclassifying such a comment would delete a real claim and make a cited
 * criterion read as uncovered — the exact failure the near-miss machinery exists
 * to prevent. A comment that departs from the form in a way the pattern cannot
 * match at all is a different matter, and is reported. See
 * {@link NearMissCitation}.
 *
 * WHAT THIS MODULE NEVER DOES
 *
 *   - It writes nothing, anywhere. It opens files for reading and returns values.
 *   - It never lists, stats, globs or opens anything under the frame corpus, and
 *     it does not scan the read-only catalog either. The citation source of
 *     truth is the test tree; the criteria come from `parse.ts`. Project rule
 *     `R2` (corpus and specification handling) forbids surveying the corpus, and
 *     the refused-directory list and the symlink refusal below are what make
 *     that mechanical instead of a property of the root list happening to stay
 *     correct.
 *   - It declares no path, no extension, no skip list and no pattern of its own.
 *     Every one of those comes from the constants module, which is the single
 *     definition rule `R3` requires. What this file does declare is a small
 *     diagnostic vocabulary — a length cap, a truncation marker, a redaction
 *     placeholder — and each is documented where it is declared, with the reason
 *     it is local to this pass rather than shared.
 *   - It returns no file contents beyond one bounded, sanitized fragment per
 *     near miss. Near-miss text comes from arbitrary source lines, so every
 *     string this module returns that originated in a file is put through the
 *     structural assertion in {@link withoutForbiddenNeedles} first. Project
 *     rule `R4` (third-party identity exclusion) is the reason, and the manifest
 *     path is not one of the paths the repository's brand guard allowlists, so a
 *     leak would fail the pipeline two steps later and much further from its
 *     cause.
 *   - It renders nothing and imports nothing from the component library. Rule
 *     `R5` (shared components implemented once) reaches this file only in that
 *     the component tests are co-located with the contracts they cover, so the
 *     component root must be walked for both TypeScript extensions or every
 *     criterion a component test claims would read as uncovered.
 *
 * WHY THE RULES ARE CITED BY LABEL AND SUBJECT
 *
 * Each project rule's own identifier is prefixed with the third-party product
 * name that rule `R4` prohibits in source and comments alike, so naming a rule
 * literally in order to obey it would break it and the repository's brand guard
 * would fail this file for doing so. Rules are therefore cited by requirement
 * label and subject throughout, exactly as the constants module cites them. The
 * subject is always given because the rules are supplied in an order that does
 * not match their labels, so an ordinal alone would point at the wrong
 * constraint.
 */

import { lstat, readdir, readFile } from 'node:fs/promises';
import { extname, posix, resolve } from 'node:path';

import {
  AREA_DOCUMENTS,
  DISCOVERY_EXTENSIONS,
  DISCOVERY_FILES,
  DISCOVERY_ROOTS,
  FORBIDDEN_OUTPUT_NEEDLES,
  FORBIDDEN_TRAVERSAL_NAMES,
  SKIPPED_DIRECTORY_NAMES,
  markdownLinkPattern,
  nearMissCitationPattern,
  testCitationPattern,
  type AreaBasename,
  type DiscoveryFile,
  type DiscoveryRoot,
} from './constants.js';

// ---------------------------------------------------------------------------
// SECTION 1 — What this pass returns.
// ---------------------------------------------------------------------------

/**
 * One well-formed citation naming one of the five Phase-1 area documents.
 *
 * TWO LINE NUMBERS LIVE HERE AND THEY ARE NOT INTERCHANGEABLE. {@link line} is
 * the criterion's 1-based line inside the area document and is half the join
 * key; {@link fileLine} is the 1-based line inside the test file and exists only
 * so a report can send a reader to the citation. Confusing them produces a join
 * that silently matches the wrong criterion, which is why they are named for
 * what they index rather than both being called a line number.
 *
 * {@link document} is typed as one of the five known basenames rather than as a
 * string, so a function that joins a citation to a criterion says so in its
 * signature. A citation naming any other document is reported separately as
 * {@link UnknownDocumentCitation} and never reaches this shape.
 *
 * Several tests may legitimately claim one criterion — a component test and an
 * end-to-end specification covering the same requirement, for instance — so
 * every occurrence is returned. Aggregation belongs to `reconcile.ts`, which is
 * the only place that knows what a duplicate means.
 */
export interface DiscoveredCitation {
  /** The area document's basename, as written in the comment. Half the join key. */
  readonly document: AreaBasename;
  /** The criterion's 1-based line inside that document. The other half of the key. */
  readonly line: number;
  /** The cited frame number, or `null` where the optional tail is absent. Evidence only. */
  readonly frame: number | null;
  /** Repository-relative path of the test file, with forward slashes on every platform. */
  readonly file: string;
  /** The 1-based line inside {@link file} that carries the comment. */
  readonly fileLine: number;
}

/**
 * A well-formed citation naming a document outside the closed Phase-1 set.
 *
 * This is an anomaly worth surfacing rather than a join. The commonest cause is
 * a citation naming a deferred area document — a test claiming a criterion from
 * a phase this run does not build — and the second commonest is a typo in a
 * basename. Both need a person; neither may be joined, because the criterion it
 * names is not in the parsed set and a join against it would either fail
 * silently or, worse, appear to succeed against a coincidentally numbered line.
 *
 * The shape mirrors {@link DiscoveredCitation} exactly except that
 * {@link document} is an arbitrary string, because it was not recognised. That
 * string came out of a source file, so it is put through
 * {@link withoutForbiddenNeedles} before it is returned: a basename is free-form
 * enough to carry a structural needle, and a citation naming the corpus
 * directory is precisely the shape that must never reach the emitted manifest.
 */
export interface UnknownDocumentCitation {
  /** The basename as written, sanitized. Not one of the five known documents. */
  readonly document: string;
  /** The 1-based line number the comment claims inside that document. */
  readonly line: number;
  /** The cited frame number, or `null` where the optional tail is absent. */
  readonly frame: number | null;
  /** Repository-relative path of the test file, with forward slashes. */
  readonly file: string;
  /** The 1-based line inside {@link file} that carries the comment. */
  readonly fileLine: number;
}

/**
 * A citation-shaped comment that the strict form could not match.
 *
 * WHY THESE ARE REPORTED AT ALL. Without them, two entirely different failures
 * are indistinguishable from the outside: a criterion with no test, and a
 * criterion whose test cites it with a hyphen where the colon belongs, a missing
 * `L`, or a line number the pattern cannot read. The first needs a test written;
 * the second needs one character changed. A near-miss form is invisible to the
 * join, so it would otherwise render as uncovered — which is exactly the failure
 * mode that makes a traceability manifest lie about its own coverage.
 *
 * NOTE THE LINE SEMANTICS. {@link line} is the 1-based line inside
 * {@link file}. A near miss has no trustworthy criterion line by definition —
 * that is what failed to parse — so there is only one line number here, and it
 * indexes the test file. This is deliberately not called `fileLine`, because
 * unlike {@link DiscoveredCitation} there is no second line number for it to be
 * distinguished from.
 *
 * At most one near miss is reported per line of source. The pattern that finds
 * them runs from the comment marker to the end of the line, so a line carrying
 * both a well-formed citation and a malformed one yields the citation and no
 * near miss. That bound is stated here because it is a real limitation rather
 * than an accident: a reader who fixes the reported forms and still sees an
 * uncovered criterion should know to look at the whole line.
 */
export interface NearMissCitation {
  /** Repository-relative path of the file carrying the malformed comment. */
  readonly file: string;
  /** The 1-based line inside {@link file}. There is no criterion line: it did not parse. */
  readonly line: number;
  /**
   * A short, whitespace-collapsed, length-capped, link-stripped excerpt of the
   * offending comment, or the redaction placeholder where the excerpt could not
   * be proved free of the structural needles. Never more than this: no other
   * file content leaves this module.
   */
  readonly fragment: string;
}

/** Whether a scan target is a directory root or a single named file. */
export type ScannedTargetKind = 'directory' | 'file';

/**
 * The outcome of scanning one declared target, present or not.
 *
 * AN ABSENT TARGET IS NOT AN ERROR, and this shape is what makes that reportable
 * rather than merely tolerated. The manifest is generated BEFORE any Phase-1
 * surface or test exists — that ordering is mandatory, because a criterion is
 * satisfied only when a referencing test passes, so the manifest has to be a
 * precondition rather than a report written afterwards. On that first run every
 * target is absent and the honest output is a manifest in which every criterion
 * is uncovered, not a crash.
 *
 * {@link filesScanned} is the count of files whose text was actually read, not
 * the count of entries seen, so a target present but holding nothing readable
 * reports zero and a reader can tell the two apart from {@link present}.
 */
export interface ScannedTarget {
  /** The declared target, repository-relative, exactly as the constants module writes it. */
  readonly path: DiscoveryRoot | DiscoveryFile;
  /** Whether the target is a directory root or a single named file. */
  readonly kind: ScannedTargetKind;
  /** Whether the target exists on disk. `false` is a normal first-run state. */
  readonly present: boolean;
  /** How many files under this target were read and searched. */
  readonly filesScanned: number;
}

/**
 * Everything the discovery pass found, in deterministic order.
 *
 * ORDER IS PART OF THE CONTRACT. `emit.ts` renders a file that the pipeline's
 * non-writing mode compares byte for byte against what is committed, so two runs
 * over an unchanged tree must produce identical output. Targets come back in the
 * order the constants module declares them, directory entries are walked in
 * code-unit order, and every returned list is sorted explicitly as well, so the
 * ordering survives a change in traversal strategy.
 */
export interface DiscoveryResult {
  /** Citations naming one of the five closed Phase-1 documents. Joinable. */
  readonly citations: readonly DiscoveredCitation[];
  /** Well-formed citations naming any other document. Anomalies, never joined. */
  readonly unknownDocuments: readonly UnknownDocumentCitation[];
  /** Citation-shaped comments the strict form could not match. Diagnostics. */
  readonly nearMisses: readonly NearMissCitation[];
  /** One entry per declared target, in declared order, present or absent. */
  readonly roots: readonly ScannedTarget[];
  /** Total files read and searched across every target. */
  readonly filesScanned: number;
}

// ---------------------------------------------------------------------------
// SECTION 2 — Indexes derived from the imported vocabulary.
//
// Every index below is built over a value the constants module owns, so nothing
// here restates a name: change a list there and these change with it. They exist
// for two reasons. The imported collections are literal tuples, so a membership
// test against an arbitrary string needs a widened view of them; and a lookup
// performed once per directory entry of a recursive walk should not be a linear
// scan.
// ---------------------------------------------------------------------------

/**
 * The five known area-document basenames, for the join-key membership test.
 *
 * Derived from the closed document set rather than written out, because the set
 * is closed for a measured reason — a glob over the catalog would absorb 891
 * further checklist items — and a second copy of the membership list here is
 * exactly how that closure would quietly stop holding.
 */
const AREA_BASENAMES: ReadonlySet<string> = new Set(
  AREA_DOCUMENTS.map((document) => document.basename),
);

/** Directory names the walker skips: dependencies, build output, test artifacts. */
const SKIPPED_DIRECTORIES: ReadonlySet<string> = new Set(SKIPPED_DIRECTORY_NAMES);

/**
 * Directory names the walker REFUSES to enter, unconditionally.
 *
 * Held apart from the skip list above even though both stop a descent, because
 * they are different kinds of decision: a skip is about cost, a refusal is the
 * enforcement of rule `R2` (corpus and specification handling). Merging them
 * would make the refusal look like an optimisation somebody could reasonably
 * tune, and that is how the obligation erodes.
 */
const REFUSED_DIRECTORIES: ReadonlySet<string> = new Set(FORBIDDEN_TRAVERSAL_NAMES);

/** Extensions whose contents are read, compared lower-cased with the leading dot. */
const READABLE_EXTENSIONS: ReadonlySet<string> = new Set(DISCOVERY_EXTENSIONS);

// ---------------------------------------------------------------------------
// SECTION 3 — The local diagnostic vocabulary.
//
// These four values are local on purpose, and the reasoning is worth stating
// because rule `R3` (uncertainty is not permission to omit) requires an operating
// value to be defined once and imported. None of these is an operating value.
// They are the presentation bounds of one diagnostic produced by this one pass:
// they bind nothing another module can observe, they are not derived from a
// frame, and no gate compares against them. The values that DO bind the tool's
// behaviour — the roots, the extensions, the skip and refusal lists, both
// patterns and the structural needles — are all imported above, and this file
// declares no substitute for any of them.
// ---------------------------------------------------------------------------

/**
 * Length ceiling for a reported near-miss excerpt, including the marker below.
 *
 * A near miss is reported so a reader can see the malformed comment beside the
 * form it should have taken, and the mandated form is under forty characters.
 * This is ample for that and still short enough that an excerpt cannot become a
 * conduit for file contents — the bound is a safety property first and a
 * readability one second.
 */
const NEAR_MISS_FRAGMENT_MAX_LENGTH = 120;

/** Appended where an excerpt was cut, so a reader can see that it was. */
const FRAGMENT_TRUNCATION_MARKER = '…';

/**
 * Stands in for any returned string that could not be proved brand-free.
 *
 * A diagnostic is never worth a compliance breach, so the placeholder replaces
 * the whole value rather than masking part of it: a partial mask invites a reader
 * to reconstruct what was removed, and the file and line are already enough to
 * find the original. Deliberately a placeholder that spells nothing.
 */
const REDACTED_FRAGMENT = '[redacted]';

/**
 * A run of whitespace, for collapsing an excerpt onto one line.
 *
 * Text hygiene rather than grammar: this pattern says nothing about what a
 * citation is, which is why it may live here while every pattern that does is
 * imported. Safe to share despite the global flag because string replacement
 * resets the pattern's position before it begins, and it is never used with a
 * stateful test.
 */
const WHITESPACE_RUN = /\s+/g;

/** Backreference to a Markdown link's label, so stripping a target keeps the text. */
const LINK_LABEL_REPLACEMENT = '$1';

// ---------------------------------------------------------------------------
// SECTION 4 — Safety of everything this module returns.
// ---------------------------------------------------------------------------

/**
 * Returns the value, or the redaction placeholder if it carries a needle.
 *
 * WHY A STRUCTURAL CHECK RATHER THAN A NAME COMPARISON. What must be kept out of
 * the output is a third-party product name, and searching for it would require
 * writing it into this file — which is the violation of rule `R4` (third-party
 * identity exclusion) the search was meant to prevent. The needles imported from
 * the constants module test instead for the shapes that name always travels in,
 * which is effective for a measured reason: every corpus filename embeds the
 * name, and every corpus reference in the catalog is a percent-encoded relative
 * path to one of those files.
 *
 * APPLIED TO EVERY STRING THIS MODULE RETURNS THAT CAME OUT OF A FILE. That is
 * three of them, and each is a real vector rather than a hypothetical one:
 *
 *   - a near-miss excerpt, which is arbitrary source text;
 *   - an unrecognised document basename, because the citation pattern accepts any
 *     word-and-dot basename, so a comment naming the corpus directory with a
 *     Markdown suffix parses as a well-formed citation of an unknown document;
 *   - a repository-relative file path, because a walked directory could in
 *     principle hold a file whose own name carries a needle.
 *
 * The comparison lower-cases the value before testing. Every needle is already
 * lower-case, so this only ever widens what is caught.
 */
function withoutForbiddenNeedles(value: string): string {
  const probe = value.toLowerCase();

  for (const needle of FORBIDDEN_OUTPUT_NEEDLES) {
    if (probe.includes(needle)) return REDACTED_FRAGMENT;
  }

  return value;
}

/**
 * Reduces a citation-shaped comment to a bounded, brand-free excerpt.
 *
 * THE ORDER OF THE FOUR STEPS IS LOAD-BEARING.
 *
 *   1. Strip Markdown link targets, keeping their labels. This is what removes a
 *      pasted catalog citation, which is the one realistic way a needle reaches a
 *      comment at all. The pattern is the constants module's own definition of
 *      link-shaped text, so this file holds no second opinion about what a link
 *      is.
 *   2. Collapse whitespace and trim, so a tab-indented comment reports as one
 *      readable line and so a carriage return left by a foreign line ending
 *      cannot reach the output.
 *   3. Cap the length, marking the cut.
 *   4. Assert the result carries no needle, redacting the whole excerpt if it
 *      does.
 *
 * Capping before stripping would be the subtle mistake: a cut through a link
 * target leaves text the link pattern no longer matches but which can still
 * carry a needle, so step 4 would redact an excerpt that step 1 would have made
 * safe, and the diagnostic would be lost for a reason unrelated to the comment.
 *
 * An excerpt that sanitizes down to nothing returns the placeholder rather than
 * an empty string, so a reported near miss always carries something a reader can
 * see.
 */
function sanitizeFragment(comment: string): string {
  const withoutLinkTargets = comment.replace(markdownLinkPattern(), LINK_LABEL_REPLACEMENT);
  const collapsed = withoutLinkTargets.replace(WHITESPACE_RUN, ' ').trim();

  const capped =
    collapsed.length > NEAR_MISS_FRAGMENT_MAX_LENGTH
      ? collapsed.slice(0, NEAR_MISS_FRAGMENT_MAX_LENGTH - FRAGMENT_TRUNCATION_MARKER.length) +
        FRAGMENT_TRUNCATION_MARKER
      : collapsed;

  if (capped.length === 0) return REDACTED_FRAGMENT;

  return withoutForbiddenNeedles(capped);
}

// ---------------------------------------------------------------------------
// SECTION 5 — One file's text to citations.
// ---------------------------------------------------------------------------

/**
 * The mutable collection the walk fills as it goes.
 *
 * An accumulator rather than a returned record per file, so that a recursive
 * walk has nothing to merge and no opportunity to lose a partial result on the
 * way back up. The array references are read-only; their contents are appended
 * to, and only by this module.
 */
interface Accumulator {
  readonly citations: DiscoveredCitation[];
  readonly unknownDocuments: UnknownDocumentCitation[];
  readonly nearMisses: NearMissCitation[];
}

/** Narrows a basename to one of the five closed Phase-1 documents. */
function isAreaBasename(value: string): value is AreaBasename {
  return AREA_BASENAMES.has(value);
}

/**
 * Reads a criterion line number, or `null` where the text is not one.
 *
 * A criterion line is 1-based, so zero is rejected along with anything outside
 * the safe integer range — a value that cannot index a line of a document is not
 * half of a join key. Returning `null` rather than throwing is what lets the
 * caller report the comment as a near miss instead of ending the run: a
 * malformed citation is a finding, and a finding must survive to be reported.
 */
function toCriterionLine(text: string): number | null {
  const parsed = Number.parseInt(text, 10);

  if (!Number.isSafeInteger(parsed) || parsed < 1) return null;

  return parsed;
}

/**
 * Reads a cited frame number, or `null` where none was cited or it is unreadable.
 *
 * An unreadable frame is recorded as absent rather than allowed to invalidate the
 * citation, because the frame is corroborating evidence and never part of the
 * key. Losing a well-formed claim over an unusable piece of evidence would
 * understate coverage, which is the more expensive of the two errors. The
 * pattern admits digits only, so there is no sign to consider.
 */
function toFrameNumber(text: string | undefined): number | null {
  if (text === undefined) return null;

  const parsed = Number.parseInt(text, 10);

  if (!Number.isSafeInteger(parsed)) return null;

  return parsed;
}

/**
 * Collects every citation and near miss in one file's text.
 *
 * SCANNED LINE BY LINE, which gives the 1-based line number for free and keeps
 * the work linear in the size of the file rather than in the number of matches.
 * It also makes a match structurally incapable of spanning a line boundary,
 * which is what stops a citation being attributed to the wrong line.
 *
 * STRICT FORM FIRST, near misses only from what is left. Every well-formed
 * citation is also matched by the near-miss pattern, which begins at the same
 * comment marker and runs to the end of the line, so a line yielding at least one
 * well-formed citation yields no near miss and a line can report at most one. A
 * match whose required groups did not resolve does not count as well-formed, so a
 * malformed comment falls through to the near-miss pass rather than crashing the
 * run.
 *
 * Both patterns are obtained once per file and reused across its lines. That is
 * safe because neither of the two string methods used here advances the source
 * pattern's position: whole-string matching resets it before it begins, and the
 * iterating form works on an internal copy.
 */
function scanText(text: string, file: string, into: Accumulator): void {
  const strictPattern = testCitationPattern();
  const nearMissPattern = nearMissCitationPattern();

  for (const [index, line] of text.split('\n').entries()) {
    const fileLine = index + 1;
    let wellFormedOnLine = 0;

    for (const match of line.matchAll(strictPattern)) {
      const document = match[1];
      const criterionLineText = match[2];

      // Under the compiler's checked-index setting every capture group is
      // possibly undefined, and the guard is kept rather than asserted away: a
      // group that did not resolve means this is not a citation this pass can
      // join, and the honest outcome is to leave the line to the near-miss pass.
      if (document === undefined || criterionLineText === undefined) continue;

      const criterionLine = toCriterionLine(criterionLineText);

      if (criterionLine === null) continue;

      const frame = toFrameNumber(match[3]);

      wellFormedOnLine += 1;

      if (isAreaBasename(document)) {
        into.citations.push({ document, line: criterionLine, frame, file, fileLine });
        continue;
      }

      into.unknownDocuments.push({
        document: withoutForbiddenNeedles(document),
        line: criterionLine,
        frame,
        file,
        fileLine,
      });
    }

    if (wellFormedOnLine > 0) continue;

    const nearMiss = line.match(nearMissPattern)?.[0];

    if (nearMiss === undefined) continue;

    into.nearMisses.push({ file, line: fileLine, fragment: sanitizeFragment(nearMiss) });
  }
}

// ---------------------------------------------------------------------------
// SECTION 6 — The walk, and the targets that do not exist yet.
// ---------------------------------------------------------------------------

/** What scanning one declared target produced, before it is labelled. */
interface TargetOutcome {
  readonly present: boolean;
  readonly filesScanned: number;
}

/** The outcome of a target that is not on disk. A normal first-run state. */
const ABSENT_TARGET: TargetOutcome = { present: false, filesScanned: 0 };

/**
 * Whether a rejection is the filesystem reporting that a path does not exist.
 *
 * This is the ONE tolerated failure of a declared target, and it is tolerated
 * because the ordering it reflects is mandatory: the manifest is generated before
 * any Phase-1 surface or test exists, so on the first run every target is absent.
 * Any other failure — a permission refusal, a target that is a file where a
 * directory belongs, a tree that changes under the walk — is a tool error and
 * propagates, because a walk that quietly returned less than the tree holds would
 * report criteria as uncovered while their tests sat on disk.
 *
 * The code is read off the rejection value rather than matched on a message,
 * because a message is localised and a code is not.
 */
function isNotFoundRejection(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

/** Orders two strings by code unit, so ordering is identical on every platform. */
function compareStrings(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
}

/**
 * Refuses a declared target that reaches a directory the walker must not enter.
 *
 * None of the declared targets does today, so on the current tree this changes
 * nothing — which is the point. It exists so that the obligation not to survey
 * the frame corpus or the read-only catalog is mechanical rather than a property
 * of the target list happening to stay correct: a future edit that widened a
 * target to reach one of those trees fails here, loudly, on the first run.
 *
 * The message never echoes the offending name. It reports the target through the
 * same needle assertion every other returned string passes, so a legitimate path
 * is shown and a refused one is redacted, and the error itself cannot become the
 * leak.
 */
function assertTraversalPermitted(declaredPath: string): void {
  for (const segment of declaredPath.split(posix.sep)) {
    if (!REFUSED_DIRECTORIES.has(segment)) continue;

    throw new Error(
      `Discovery target ${withoutForbiddenNeedles(declaredPath)} reaches a directory the ` +
        "walker must refuse to enter. The refused names are held in this workspace's " +
        'constants module; the frame corpus, the read-only catalog and the vendor ' +
        'documentation folder are inputs and are never walked. Narrow the target instead.',
    );
  }
}

/**
 * Walks one directory, collecting citations, and returns the files it read.
 *
 * FOUR DECISIONS PER ENTRY, in this order:
 *
 *   1. A symbolic link is never followed, whatever it points at. This is the
 *      other half of the refusal above: a link inside a walked tree is the way a
 *      name-based refusal would otherwise be bypassed, and a link is also how a
 *      walk acquires a cycle. Nothing in this repository's test trees needs one.
 *   2. A refused directory name stops the descent unconditionally.
 *   3. A skipped directory name stops it too — dependencies, build output and
 *      test artifacts hold no authored citation, and the compiled output of this
 *      very workspace would otherwise double-count every citation in it.
 *   4. A regular file is read only if its extension is one the constants module
 *      admits. Anything else — a socket, a device, a stylesheet, a snapshot — is
 *      passed over.
 *
 * Entries are sorted by name before anything else happens, so the traversal
 * order, and therefore the returned order, is fixed. Each file is read in
 * sequence rather than concurrently: the ordering is part of this pass's
 * contract, the trees are small, and a bounded reader is the right shape for a
 * tool that may run inside a pipeline beside everything else.
 */
async function walkDirectory(
  absoluteDirectory: string,
  relativeDirectory: string,
  into: Accumulator,
): Promise<number> {
  const entries = (await readdir(absoluteDirectory, { withFileTypes: true })).sort((left, right) =>
    compareStrings(left.name, right.name),
  );

  let filesScanned = 0;

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;

    const absolutePath = resolve(absoluteDirectory, entry.name);
    const relativePath = posix.join(relativeDirectory, entry.name);

    if (entry.isDirectory()) {
      if (REFUSED_DIRECTORIES.has(entry.name)) continue;
      if (SKIPPED_DIRECTORIES.has(entry.name)) continue;

      filesScanned += await walkDirectory(absolutePath, relativePath, into);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!READABLE_EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;

    const text = await readFile(absolutePath, 'utf8');

    scanText(text, withoutForbiddenNeedles(relativePath), into);
    filesScanned += 1;
  }

  return filesScanned;
}

/**
 * Scans one declared directory root, tolerating its absence.
 *
 * The root is inspected without following a link, so three conditions are
 * distinguished rather than conflated: absent, which is normal and reported;
 * a link, which is refused for the reasons given on {@link walkDirectory}; and
 * present but not a directory, which is a tool error because a target declared as
 * a root and found as a file means the declaration and the tree disagree, and
 * guessing which is right is not this pass's business.
 */
async function scanDirectoryTarget(
  repositoryRoot: string,
  declaredPath: DiscoveryRoot,
  into: Accumulator,
): Promise<TargetOutcome> {
  const absolutePath = resolve(repositoryRoot, declaredPath);

  let isDirectory: boolean;
  let isLink: boolean;

  try {
    const stats = await lstat(absolutePath);

    isDirectory = stats.isDirectory();
    isLink = stats.isSymbolicLink();
  } catch (error: unknown) {
    if (isNotFoundRejection(error)) return ABSENT_TARGET;

    throw error;
  }

  if (isLink) {
    throw new Error(
      `Discovery root ${withoutForbiddenNeedles(declaredPath)} is a symbolic link. A link is ` +
        'never followed, because following one is how a walk reaches a tree that must not be ' +
        'surveyed and how it acquires a cycle. Replace the link with the directory itself.',
    );
  }

  if (!isDirectory) {
    throw new Error(
      `Discovery root ${withoutForbiddenNeedles(declaredPath)} exists but is not a directory. ` +
        'It is declared as a root of the test tree, so the declaration and the tree disagree ' +
        'and the disagreement is not this pass to resolve.',
    );
  }

  return { present: true, filesScanned: await walkDirectory(absolutePath, declaredPath, into) };
}

/**
 * Scans one individually declared file, tolerating its absence.
 *
 * The extension gate is deliberately NOT applied here. That gate bounds a
 * directory walk, where anything at all might be found; a named target is a
 * deliberate declaration, and the accessibility specification is named precisely
 * because it sits beside the end-to-end directory rather than inside it. Skipping
 * a file somebody went to the trouble of naming would under-report the least
 * visible part of the suite, which is the opposite of why it is named.
 */
async function scanFileTarget(
  repositoryRoot: string,
  declaredPath: DiscoveryFile,
  into: Accumulator,
): Promise<TargetOutcome> {
  const absolutePath = resolve(repositoryRoot, declaredPath);

  let isRegularFile: boolean;
  let isLink: boolean;

  try {
    const stats = await lstat(absolutePath);

    isRegularFile = stats.isFile();
    isLink = stats.isSymbolicLink();
  } catch (error: unknown) {
    if (isNotFoundRejection(error)) return ABSENT_TARGET;

    throw error;
  }

  if (isLink) {
    throw new Error(
      `Discovery file ${withoutForbiddenNeedles(declaredPath)} is a symbolic link, which is ` +
        'never followed. Replace the link with the file itself.',
    );
  }

  if (!isRegularFile) {
    throw new Error(
      `Discovery file ${withoutForbiddenNeedles(declaredPath)} exists but is not a regular ` +
        'file, so its contents cannot be searched for citations.',
    );
  }

  const text = await readFile(absolutePath, 'utf8');

  scanText(text, withoutForbiddenNeedles(declaredPath), into);

  return { present: true, filesScanned: 1 };
}

// ---------------------------------------------------------------------------
// SECTION 7 — The pass itself, and the order it returns things in.
// ---------------------------------------------------------------------------

/** The fields both citation shapes order by. Widened so one comparator serves both. */
interface CitationOrder {
  readonly document: string;
  readonly line: number;
  readonly frame: number | null;
  readonly file: string;
  readonly fileLine: number;
}

/** Ordering used when no frame was cited, so a total order still exists. */
const UNCITED_FRAME_ORDER = -1;

/**
 * Orders citations by where they were found, then by what they claim.
 *
 * File and line first, because that is the order a reader scans a report in. The
 * remaining fields are tie-breakers rather than decoration: two citations can
 * share a file and a line — a single line may carry two comments — and without a
 * total order those two would come back in whatever order the pattern happened to
 * yield them, which is enough to make the emitted manifest differ between runs
 * and fail the pipeline's byte comparison.
 */
function compareCitations(left: CitationOrder, right: CitationOrder): number {
  return (
    compareStrings(left.file, right.file) ||
    left.fileLine - right.fileLine ||
    compareStrings(left.document, right.document) ||
    left.line - right.line ||
    (left.frame ?? UNCITED_FRAME_ORDER) - (right.frame ?? UNCITED_FRAME_ORDER)
  );
}

/** Orders near misses by where they were found, then by their excerpt. */
function compareNearMisses(left: NearMissCitation, right: NearMissCitation): number {
  return (
    compareStrings(left.file, right.file) ||
    left.line - right.line ||
    compareStrings(left.fragment, right.fragment)
  );
}

/**
 * Collects every criterion citation the repository's tests claim.
 *
 * Every path is resolved against `repositoryRoot` and never against the process
 * directory, so the pass is a pure function of the argument it is given: the same
 * tree produces the same result whether the tool is invoked from the repository
 * root or from inside its own workspace, which is the difference between the two
 * ways it is actually run. A relative argument is resolved exactly once, here, so
 * no later step can reinterpret it.
 *
 * Absence is reported, never thrown: a target that does not exist comes back
 * `present: false` with nothing scanned. On the very first run — before any
 * Phase-1 test exists — that is every target, and the correct output is zero
 * citations and a scan of zero files. A manifest generated from that state is
 * still the right artifact, because it records what is claimed rather than what
 * passes, and it is generated first on purpose.
 *
 * What comes back is a claim inventory and nothing more. A discovered citation
 * means a test names a criterion; it is not evidence that the test exercises it
 * and not evidence that it passes. No caller may promote it to satisfaction.
 *
 * @param repositoryRoot Absolute or relative path to the repository root.
 * @returns Citations, unrecognised-document anomalies, near misses, per-target
 *   results and the total files read — every list in deterministic order.
 * @throws If a declared target reaches a refused directory, is a symbolic link,
 *   exists as the wrong kind of thing, or cannot be read for any reason other
 *   than not existing.
 */
export async function discoverCitations(repositoryRoot: string): Promise<DiscoveryResult> {
  if (repositoryRoot.trim().length === 0) {
    throw new Error(
      'discoverCitations requires the repository root as an argument. Every declared target is ' +
        'resolved against it rather than against the process directory, because the tool is run ' +
        'both from the repository root and from inside its own workspace.',
    );
  }

  const absoluteRoot = resolve(repositoryRoot);
  const found: Accumulator = { citations: [], unknownDocuments: [], nearMisses: [] };
  const targets: ScannedTarget[] = [];
  let filesScanned = 0;

  for (const declaredPath of DISCOVERY_ROOTS) {
    assertTraversalPermitted(declaredPath);

    const outcome = await scanDirectoryTarget(absoluteRoot, declaredPath, found);

    targets.push({
      path: declaredPath,
      kind: 'directory',
      present: outcome.present,
      filesScanned: outcome.filesScanned,
    });
    filesScanned += outcome.filesScanned;
  }

  for (const declaredPath of DISCOVERY_FILES) {
    assertTraversalPermitted(declaredPath);

    const outcome = await scanFileTarget(absoluteRoot, declaredPath, found);

    targets.push({
      path: declaredPath,
      kind: 'file',
      present: outcome.present,
      filesScanned: outcome.filesScanned,
    });
    filesScanned += outcome.filesScanned;
  }

  return {
    citations: [...found.citations].sort(compareCitations),
    unknownDocuments: [...found.unknownDocuments].sort(compareCitations),
    nearMisses: [...found.nearMisses].sort(compareNearMisses),
    roots: targets,
    filesScanned,
  };
}
