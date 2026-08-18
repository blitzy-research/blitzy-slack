/**
 * Pass 1 of the acceptance-criteria manifest generator: the five read-only area
 * documents in, 241 criteria out.
 *
 * WHY THIS MODULE'S CORRECTNESS IS THE WHOLE TOOL
 *
 * Every later pass is a projection of what this one produces. `discover.ts` joins
 * test citations to the criteria found here, `emit.ts` renders them, and
 * `reconcile.ts` gates the run on their subtotals. So a criterion this module
 * fails to see does not merely go unreported — it stops existing as far as the run
 * is concerned, and the gate that should have caught its absence closes cleanly
 * over the smaller set. The per-area subtotals 39, 46, 61, 57 and 38, summing to
 * 241, either come out of this file exactly or the run's reporting is wrong in a
 * way nothing downstream can detect.
 *
 * That is not an abstract risk. Many of the criteria parsed here are the
 * server-side authorization obligations of rule `R1` (authorization is
 * server-side only) and the implemented-once obligations of rule `R5` (shared
 * components implemented once). Dropping or mis-numbering one of those quietly
 * removes a security or component obligation from the ledger, and the ledger is
 * the only place anybody looks.
 *
 * WHAT A CRITERION IS, AND WHAT IT IS NOT
 *
 * A criterion is one GitHub-flavoured checklist item inside a document's criteria
 * section, identified for the rest of the tool by the pair (document basename,
 * 1-based line number). That pair is the join key a test citation names. This
 * module establishes that a criterion EXISTS and where it lives. It assigns no
 * status of any kind — not satisfied, not passing, not even pending — because rule
 * `R3` (uncertainty is not permission to omit) forbids marking a criterion
 * satisfied without a passing test behind it, and this module reads no test and
 * runs nothing. Every source checkbox is unchecked in any case, so there is
 * nothing to inherit even if inheriting were permitted.
 *
 * THREE TRAPS THIS MODULE IS BUILT AROUND
 *
 * Each of the three was measured against the real documents rather than guessed
 * at, and each produces a plausible wrong answer rather than an error.
 *
 * 1. THE TERMINATOR MUST BE AN H2. Two documents place a third-level heading
 *    INSIDE their criteria section, with more criteria after it. A parser that
 *    stops at the next heading of any level reports 53 criteria for the channels
 *    document instead of 61, and 46 for the messaging document instead of 57. The
 *    other three documents carry no inner heading, so such a parser gets those
 *    three exactly right and looks correct while under-reporting the two longest
 *    documents — and under-reporting reads as "these criteria have no tests"
 *    rather than as a parser fault. See {@link extractSection}.
 *
 * 2. A FRAME NUMBER COMES FROM THE CITATION LABEL, NEVER FROM THE LINK TARGET.
 *    Reading the target is both prohibited and arithmetically wrong. See
 *    {@link extractFrames}.
 *
 * 3. EXTRACTION MUST PRECEDE SANITIZATION. Stripping link targets rewrites a
 *    citation from a bracketed label into bare words, which the citation pattern
 *    no longer matches. Sanitize first and every criterion silently reports zero
 *    frames. So both {@link extractFrames} and {@link stripLinkTargets} are
 *    applied to the raw line, in that order, and only the sanitized result is
 *    stored. See {@link buildCriterion}.
 *
 * THE RAW LINE NEVER LEAVES THIS MODULE
 *
 * Measured across the 241 criteria, 239 raw lines carry a third-party product name
 * inside a citation target, and 0 still carry one once link targets are stripped.
 * The input this module reads is therefore saturated with identity that rule `R4`
 * (third-party identity exclusion) forbids in source, comments, tests and
 * fixtures alike, and the manifest this tool writes is not one of the paths the
 * repository's brand guard allowlists — so a single leaked target fails the brand
 * stage of the pipeline.
 *
 * The containment is structural rather than careful. {@link Criterion} has no
 * field that could hold a raw line; nothing here logs; and
 * {@link AreaDocumentParseError} is documented never to carry line content. Every
 * string that does escape passes {@link assertNoForbiddenOutput} first, which
 * checks the structural shapes a leaked target always travels in, at the moment
 * the string is produced and with the document and line in hand.
 *
 * EVERY OPERATING VALUE COMES FROM `constants.ts`
 *
 * Rule `R3` (uncertainty is not permission to omit) requires a value to be
 * defined once and consumed by reference, so no path, heading, pattern, needle or
 * expected count is written in this file. Even the run total is derived: the
 * expected total reported here is the sum of the five per-document expectations,
 * which lets `reconcile.ts` check the declared total against the sum instead of
 * trusting either. The one number this module states for itself is the one it
 * counted.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO
 *
 *   - It does not discover documents. The set is closed and enumerated in
 *     `constants.ts`; a glob over the catalog directory would absorb 891 further
 *     checklist items from the deferred areas and the catalog's own backlog, and
 *     report 1,132 where the figure must read 241.
 *   - It does not touch the frame corpus, in any way: no listing, no metadata
 *     call, no capture opened, and no frame-number-to-path resolution anywhere in
 *     the file. Rule `R2` (corpus and specification handling) forbids surveying
 *     it, and the cheapest way to honour that is to give this module no way to
 *     address it. A frame here is an integer and never a file.
 *   - It does not write. The five documents are read-only inputs, and rule `R2`
 *     forbids correcting a specification in place — so a count that disagrees with
 *     expectation becomes an observation that flows to reconciliation, never an
 *     edit and never a silent adjustment.
 *   - It does not correct or tolerate quietly. A structural surprise becomes a
 *     human-readable note in {@link ParsedArea.drift}; only a document with no
 *     criteria heading at all is an error, because that is the tool unable to
 *     reach an answer rather than the project being in a state worth reporting.
 *
 * HOW THE PROJECT RULES ARE CITED ABOVE AND BELOW
 *
 * By requirement label and subject — `R1` authorization is server-side only, `R2`
 * corpus and specification handling, `R3` uncertainty is not permission to omit,
 * `R4` third-party identity exclusion, `R5` shared components implemented once.
 * Their own identifiers are deliberately not written out: each is prefixed with
 * the very third-party product name that `R4` forbids in source and comments, so
 * spelling a rule's name in order to obey it would break it and would fail this
 * file at the brand stage. The subject accompanies the label every time because
 * the rules are supplied in an order that does not match their labels, so an
 * ordinal alone would point at the wrong constraint.
 *
 * @packageDocumentation
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  AREA_DOCUMENTS,
  CRITERIA_HEADING,
  FORBIDDEN_OUTPUT_NEEDLES,
  H2_PREFIX,
  checklistItemPattern,
  frameCitationPattern,
  markdownLinkPattern,
} from './constants.js';
import type { AreaDocument } from './constants.js';

// ---------------------------------------------------------------------------
// SECTION 1 — Failure.
// ---------------------------------------------------------------------------

/**
 * A document could not be parsed at all.
 *
 * Thrown for the two conditions that leave this module with no answer to give:
 * an area document that cannot be read, and one whose criteria heading is absent.
 * Both are tool errors rather than gate failures — the project is not being
 * reported as short of something, the tool is reporting that it cannot see. The
 * caller maps that distinction onto the two failure exit codes, which is why the
 * two cases share one class and are described in the message rather than being
 * split into a hierarchy nobody would branch on.
 *
 * NEVER CONSTRUCT ONE WITH LINE CONTENT. The message carries the document's
 * repository-relative path and a structural reason, and nothing else. A criterion
 * line is exactly the string rule `R4` (third-party identity exclusion) keeps out
 * of this tool's output, and an error message is the easiest place for one to
 * escape: it is thrown, caught, formatted and logged by code that never looked at
 * where the text came from. The path is safe by construction — the five documents
 * live in the catalog directory and their names carry no identity.
 */
export class AreaDocumentParseError extends Error {
  /**
   * @param documentPath Repository-relative path of the document being parsed.
   * @param reason A short structural description of what could not be done.
   *   Never pass a criterion line, a fragment of one, or any link target.
   * @param options Standard error options. A cause is welcome here and is the one
   *   exception worth stating: a filesystem failure carries a path and an error
   *   number, never document text, so attaching it costs nothing and is the
   *   difference between "could not be read" and "does not exist".
   */
  public constructor(documentPath: string, reason: string, options?: ErrorOptions) {
    super(`Cannot parse area document ${documentPath}: ${reason}.`, options);
    // Set explicitly: a subclass otherwise reports the base constructor's name,
    // which makes a precise failure look generic wherever it is caught.
    this.name = 'AreaDocumentParseError';
  }
}

// ---------------------------------------------------------------------------
// SECTION 2 — The shapes this module hands to the rest of the tool.
//
// Every field is `readonly` and every list a `readonly` array. These values are
// a record of what a read-only document says, so a later pass has nothing to
// gain by mutating one and a great deal to lose: `reconcile.ts` gates on counts
// that `emit.ts` has already rendered from the same objects, and the two must
// describe the same set. Immutability is what makes that a type error rather
// than a race between passes.
// ---------------------------------------------------------------------------

/**
 * One line of a criteria section, carrying its own 1-based number.
 *
 * The number travels WITH the text rather than being recoverable from an index,
 * and that is the point. A section is a window into the middle of a file, so a
 * caller holding only an array has to add an offset to get a real line number,
 * and the off-by-one that follows is exactly the defect this module cannot afford
 * — a criterion at the wrong line is a criterion no test can cite.
 */
export interface SectionLine {
  /** 1-based line number within the whole document, never within the section. */
  readonly line: number;
  /** The line as written, with any carriage return already removed. */
  readonly text: string;
}

/**
 * Where a document's criteria section begins, where it ends, and what is inside.
 *
 * The two boundary numbers are reported rather than kept private because they are
 * the diagnostic that separates "the parser is wrong" from "the document changed".
 * A wrong count on its own could be a dozen things; a wrong count together with a
 * terminator line that has moved names the cause immediately.
 */
export interface SectionScope {
  /** 1-based line of the criteria heading. */
  readonly headingLine: number;
  /**
   * 1-based line of the second-level heading that ends the section, or `null`
   * where the section runs to the end of the file.
   *
   * `null` rather than an absent property, and rather than the file's length: an
   * absent boundary is a distinct fact about the document and deserves to read as
   * one, whereas a synthesised number would compare unequal to the recorded value
   * and report drift that is really an encoding choice.
   */
  readonly terminatorLine: number | null;
  /**
   * How many lines in the whole document match the criteria heading exactly.
   *
   * Expected to be 1. A second occurrence would leave every item under it outside
   * the scope of the first, which shows up as a short count with no obvious cause
   * — so the number is surfaced and turned into a drift note rather than being
   * discarded once the first heading is found.
   */
  readonly headingOccurrences: number;
  /** Every line strictly between the heading and the terminator, in order. */
  readonly lines: readonly SectionLine[];
}

/**
 * The frames a criterion cites, in three forms because three questions get asked.
 *
 * WHY BOTH LISTS EXIST. `frames` is every citation as authored, including a repeat
 * — it is what makes the measured total of 574 citations across the 241 criteria
 * reconcile. `distinctFrames` is the same list reduced to first occurrences, which
 * is what a reader wants in a manifest cell. The two differ by exactly one
 * criterion: the messaging document's line 792 cites 8 times over 5 distinct
 * frames, so a deduplicating count of the whole corpus of criteria yields 571
 * rather than 574. Report either figure, but never one under the other's name.
 *
 * The measured distribution of citations per criterion is the other half of that
 * reconciliation, and it is worth recording because it is what a regression in
 * this module would disturb first: 0 frames for 2 criteria, 1 for 61, 2 for 86,
 * 3 for 48, 4 for 32, 5 for 8, 6 for 1, 7 for 1 and 8 for 2.
 */
export interface FrameCitations {
  /** Every citation in authored order, repeats included. */
  readonly frames: readonly number[];
  /** The same numbers reduced to first occurrences, in that order. */
  readonly distinctFrames: readonly number[];
  /**
   * The first frame cited, or `null` where the criterion cites none.
   *
   * `null` AND NEVER AN ABSENT PROPERTY. Exactly two of the 241 criteria cite no
   * frame at all — the product-overview document's line 915, requiring all sixteen
   * security contracts be implemented once and applied uniformly with every area
   * document resolving to them by identifier, and the messaging document's line
   * 801, requiring match-term highlighting to encode both the term and the body,
   * match literally, and bound the term's length. Both are security-contract
   * criteria, and the absence is correct and permanent rather than an oversight:
   * the corpus is a set of static captures of a single session, so it is
   * structurally incapable of evidencing an encoding boundary or a uniformly
   * applied contract. There is no frame to cite because there could not be one.
   *
   * THE TRAP IS WORTH NAMING. An implementation that treats a frame as required
   * drops precisely those two rows and reports subtotals of 38 and 56. Both are
   * off by one, both look plausible, and the two criteria lost are among the most
   * consequential in the set. It then faces the temptation the project rules
   * forbid — adjusting a subtotal until the arithmetic closes rather than recording
   * a defect. Representing absence as a value a consumer must handle is what keeps
   * that path closed, which is why this is `null` rather than optional.
   */
  readonly primaryFrame: number | null;
}

/**
 * One acceptance criterion, as this tool understands it.
 *
 * THE IDENTITY IS (`document`, `line`). A test cites a criterion by basename and
 * 1-based line, so those two fields are the join key and nothing else is. A frame
 * is corroborating evidence and must never enter the key: 178 of the 241 criteria
 * cite more than one frame, so a key including one would either fail to join a
 * test that named the second frame or force every test to enumerate all of them.
 *
 * THERE IS NO STATUS FIELD, AND ADDING ONE WOULD BE A DEFECT. Existence and
 * satisfaction are different claims established by different evidence. This module
 * reads documents; only the test suite can support the second claim, and rule `R3`
 * (uncertainty is not permission to omit) forbids asserting it without a passing
 * test. A status field here would be filled in from whatever was to hand.
 *
 * THERE IS NO RAW-TEXT FIELD EITHER, for the reason given at the top of this file:
 * 239 of the 241 raw lines carry a third-party product name inside a citation
 * target, and rule `R4` (third-party identity exclusion) keeps it out of anything
 * this tool emits. {@link sanitizedText} is the only prose that leaves here.
 */
export interface Criterion {
  /** The owning document's area key, for grouping and per-area reporting. */
  readonly areaKey: AreaDocument['areaKey'];
  /**
   * The owning document's basename — half of the citation join key.
   *
   * Typed as the exact union of the five names rather than as `string`, so a
   * consumer that joins a citation to a criterion cannot silently key on a
   * document that is not in scope for this phase.
   */
  readonly document: AreaDocument['basename'];
  /**
   * The owning document's repository-relative path.
   *
   * Repository-relative rather than absolute on purpose: this value is rendered
   * into a committed manifest, where an absolute path would record the layout of
   * whichever machine last regenerated it and would differ between clones for no
   * reason a reader cares about.
   */
  readonly path: AreaDocument['path'];
  /** 1-based line number within the whole document. */
  readonly line: number;
  /** Every frame cited, in authored order, repeats included. */
  readonly frames: readonly number[];
  /** The frames cited, reduced to first occurrences. */
  readonly distinctFrames: readonly number[];
  /** The first frame cited, or `null` where the criterion cites none. */
  readonly primaryFrame: number | null;
  /**
   * The criterion's prose with link targets removed and the checklist marker
   * stripped — the only text from a source line that leaves this module.
   */
  readonly sanitizedText: string;
}

/**
 * One area document's criteria, plus what was surprising about reading it.
 */
export interface ParsedArea {
  /** The document's area key. */
  readonly areaKey: AreaDocument['areaKey'];
  /** The document's basename, as cited by tests. */
  readonly document: AreaDocument['basename'];
  /** The document's repository-relative path. */
  readonly path: AreaDocument['path'];
  /**
   * How many criteria were actually found.
   *
   * Whatever was counted, never adjusted toward {@link expectedCount}. Clamping,
   * padding or nudging this figure would defeat the only gate that can detect a
   * parser regression, and rule `R2` (corpus and specification handling) rules out
   * the other tempting response — editing the document until the arithmetic
   * closes.
   */
  readonly observedCount: number;
  /** The measured expectation recorded in `constants.ts` for this document. */
  readonly expectedCount: number;
  /** The criteria, in ascending line order. */
  readonly criteria: readonly Criterion[];
  /**
   * Human-readable notes about anything structurally unexpected.
   *
   * Empty for all five documents today. A note here is a finding about a
   * read-only input having changed in a way the project rules forbid, so it is
   * recorded and reported and never acted on: nothing in this module corrects a
   * document, and nothing in it throws over a note.
   *
   * Deliberately NOT a place where the observed count is compared with the
   * expected one. That comparison is `reconcile.ts`'s gate, and a second place
   * that decides whether the run passes is a second answer waiting to disagree.
   */
  readonly drift: readonly string[];
}

/**
 * All five documents parsed, with the flattened criterion list the later passes
 * work from.
 */
export interface ParsedCatalog {
  /** The five areas, in the order `constants.ts` declares them. */
  readonly areas: readonly ParsedArea[];
  /**
   * Every criterion from every area: document order first, then ascending line.
   *
   * Ordered by construction rather than by a sort, so the manifest reads in the
   * same sequence as the documents it was generated from and two runs over an
   * unchanged tree produce byte-identical output.
   */
  readonly criteria: readonly Criterion[];
  /** The sum of the per-area observed counts. */
  readonly observedTotal: number;
  /**
   * The sum of the per-area expected counts.
   *
   * Summed here rather than restated from the declared run total, so that
   * `reconcile.ts` can compare the declared figure against this derivation. An
   * edit that changed one subtotal and forgot the total then fails a gate instead
   * of shipping a manifest whose arithmetic does not close.
   */
  readonly expectedTotal: number;
}

// ---------------------------------------------------------------------------
// SECTION 3 — Text: what may be kept, and what must be removed first.
// ---------------------------------------------------------------------------

/**
 * Remove every Markdown link target from a string, keeping the link's label text.
 *
 * `[a label](a target)` becomes `a label`. Exported because it is pure, total and
 * useful to any pass that excerpts catalog prose: `emit.ts` renders text into a
 * document the brand guard polices, and this is the function that makes an excerpt
 * safe to render.
 *
 * WHY THIS IS THE STEP THAT MATTERS. Measured across the 241 criteria, 239 raw
 * lines carry a third-party product name inside a citation target, and 0 still
 * carry one once targets are removed. So this is not a tidiness pass; it is the
 * single transformation that separates input this tool may not reproduce from
 * output it may. Rule `R4` (third-party identity exclusion) is what requires it,
 * and the manifest's own path is not one the brand guard allowlists.
 *
 * A SINGLE PASS IS SUFFICIENT AND DELIBERATE. Measured on the real input, no
 * criterion line still contains a link opener after one pass, so nothing is gained
 * by repeating until stable — and repeating until stable is how a pathological line
 * turns a parser into a hang. The pattern's label and target classes are negated
 * character classes rather than lazy wildcards, so a line carrying several links
 * yields one match per link instead of one match spanning from the first label to
 * the last target.
 *
 * A REPLACEMENT STRING RATHER THAN A CALLBACK. `'$1'` names the label capture
 * directly. A replacer function would receive its arguments as `any`, so the label
 * would leave the callback untyped and the return would be an unsafe one — and the
 * project's lint configuration reports exactly that. Substitution of a captured
 * group inserts the captured text literally, so a label containing a dollar sign
 * survives unchanged.
 *
 * @param text Any string. A whole line, a fragment, or prose already extracted.
 * @returns The same string with `](target)` reduced to nothing and labels intact.
 */
export function stripLinkTargets(text: string): string {
  return text.replace(markdownLinkPattern(), '$1');
}

/**
 * Remove the leading checklist marker from a criterion line.
 *
 * The pattern is anchored and not global, so this replaces the one marker at the
 * start of the line and cannot touch a bracketed construct further along it. Any
 * indentation ahead of the marker goes with it, and the result is trimmed so a
 * rendered table cell carries no stray edge whitespace.
 *
 * Private, unlike its neighbour: stripping a link target is meaningful for any
 * catalog prose, whereas stripping a marker is meaningful only for a line already
 * known to be a checklist item. Exporting it would invite it to be applied to text
 * that has none, where it would silently do nothing.
 */
function stripChecklistMarker(text: string): string {
  return text.replace(checklistItemPattern(), '').trim();
}

/**
 * Refuse to emit a string that carries the shape of a leaked link target.
 *
 * WHY THE CHECK IS STRUCTURAL. What must be kept out of this tool's output is a
 * third-party product name, and the obvious check — search the output for that
 * name — cannot be written, because writing the name into source in order to
 * search for it would itself breach rule `R4` (third-party identity exclusion). So
 * the needles in `constants.ts` describe the shapes the name always travels in: the
 * corpus directory name, the capture extension, the leading fragment of a
 * percent-encoded separator, and the relative link prefix every citation target
 * opens with. Catch the shape and the name comes with it.
 *
 * WHY HERE RATHER THAN AT THE POINT OF WRITING. A failure at the moment the string
 * is produced has the document and the line in hand, so it says which criterion
 * broke. The same failure at the point of writing knows only that a file was about
 * to contain something it should not, and the reader has to find the row
 * themselves.
 *
 * WHY THIS THROWS WHERE A CHANGED DOCUMENT ONLY DRIFTS. Drift records that a
 * read-only input is not as it was, which is a finding for a human. This is
 * different in kind: it means the sanitizer did not do its job, and the
 * alternative to stopping is writing identity into a path the brand guard fails on
 * — a worse outcome than a loud halt. It cannot fire on the input as measured,
 * where zero of the 241 sanitized lines contain any needle.
 *
 * The reported needle is the imported constant itself, which is one of four
 * structural fragments and none of them a product name, so naming it in a message
 * is exactly what the rule permits.
 *
 * @throws AreaDocumentParseError If any needle is present.
 */
function assertNoForbiddenOutput(value: string, documentPath: string, line: number): void {
  for (const needle of FORBIDDEN_OUTPUT_NEEDLES) {
    if (value.includes(needle)) {
      throw new AreaDocumentParseError(
        documentPath,
        `sanitized text for the criterion at line ${line} still contains ${needle}, ` +
          'so link-target stripping did not take effect',
      );
    }
  }
}

// ---------------------------------------------------------------------------
// SECTION 4 — Frames: read the label, never the target.
// ---------------------------------------------------------------------------

/**
 * Collect the frames a criterion cites, from the citation LABELS and nothing else.
 *
 * THE LABEL IS THE ASSERTION. A citation is a Markdown link whose label reads
 * `frame N`; the target merely records where the evidence happens to sit. Reading
 * the label also keeps this tool clear of the corpus entirely, which is what rule
 * `R2` (corpus and specification handling) requires: nothing here needs to know
 * that a capture file exists, let alone what it is called. A frame is an integer
 * in this module and never a path.
 *
 * READING THE TARGET WOULD ALSO BE WRONG, not merely prohibited. The targets are
 * percent-encoded, so the separator ahead of the trailing number contributes its
 * own digits: a capture of the digits before the extension returns 2069 where the
 * label says 69, and 2097 where it says 97 — the separator's own `20` is glued to
 * the front — and a four-digit year sits earlier in the same path to catch anything
 * that tries to be cleverer. Both examples are real and both appear on one line of
 * the channels document. No cross-check between label and target may be attempted
 * either: it would report a mismatch on all 574 citations, every one of them false,
 * and a check whose every finding is false is worse than no check because somebody
 * eventually "fixes" the labels to satisfy it.
 *
 * NEITHER NEIGHBOURING STRATEGY WORKS. Matching any Markdown link and reading a
 * number from it is provably wrong on this input: the criteria carry 12 links that
 * are cross-references to other catalog documents rather than citations. Searching
 * for the word instead is wrong in the other direction: "frame" and "frames" occur
 * 6 times as ordinary prose outside any link. Only the bracketed-label pattern is
 * correct.
 *
 * AUTHORED ORDER IS PRESERVED AND THE FIRST FRAME IS PRIMARY. 39 criteria cite
 * their frames in an order that is not ascending, so sorting would silently change
 * which frame is primary — and the primary frame is what a test citation names.
 *
 * NO RANGE FILTER IS APPLIED. The observed numbers run from 1 to 1021, but a
 * filter keyed to that range would silently drop a citation added later, and rule
 * `R3` (uncertainty is not permission to omit) does not allow evidence to be
 * discarded for failing an expectation this module invented. The pattern captures a
 * run of digits, so the parse itself cannot fail.
 *
 * @param text A criterion line as authored. Must be the RAW line: this function
 *   reads bracketed labels, and {@link stripLinkTargets} rewrites them into bare
 *   words that no longer match.
 */
export function extractFrames(text: string): FrameCitations {
  const frames: number[] = [];
  const distinctFrames: number[] = [];

  for (const match of text.matchAll(frameCitationPattern())) {
    // The capture is narrowed rather than asserted. Index access is checked in
    // this project, so the compiler treats a group as possibly absent even where
    // the pattern guarantees it; a guard states that reasoning in code, while a
    // non-null assertion would merely silence it.
    const digits = match[1];
    if (digits === undefined) {
      continue;
    }

    const frame = Number.parseInt(digits, 10);
    frames.push(frame);
    // A linear membership test rather than a set: no criterion cites more than 8
    // frames, so the scan is shorter than the allocation it would replace, and
    // pushing on first sight is what keeps first-occurrence order.
    if (!distinctFrames.includes(frame)) {
      distinctFrames.push(frame);
    }
  }

  const first = frames[0];

  return {
    frames,
    distinctFrames,
    primaryFrame: first === undefined ? null : first,
  };
}

// ---------------------------------------------------------------------------
// SECTION 5 — Scoping the criteria section. The terminator is an H2.
// ---------------------------------------------------------------------------

/**
 * Split a document into lines, tolerating either line ending.
 *
 * Split on the newline and drop a carriage return left at the end of a line, so a
 * document written with either convention yields the same lines and therefore the
 * same line numbers. Nothing else is trimmed: leading whitespace is what tells
 * {@link markerDrift} that a checklist item is indented, and a line's own content
 * is preserved exactly so a citation label survives to be read.
 *
 * A trailing newline yields a final empty element, which is harmless — it matches
 * no heading and no checklist item, and it keeps every earlier line's index, and
 * therefore its 1-based number, correct.
 */
function splitLines(content: string): readonly string[] {
  return content.split('\n').map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line));
}

/**
 * Locate a document's criteria section and return it with real line numbers.
 *
 * THE TERMINATOR IS A SECOND-LEVEL HEADING, AND THAT IS THE WHOLE POINT OF THIS
 * FUNCTION. Two of the five documents place a third-level heading INSIDE their
 * criteria section — grouping the security and per-viewer criteria under a
 * sub-heading, followed by a blank line, a sentence of prose and then more
 * criteria. A parser that stops at the next heading of any level therefore reports:
 *
 *   - 53 criteria for the channels document, where the figure is 61;
 *   - 46 for the messaging document, where the figure is 57.
 *
 * Those two numbers are the exact regression this scoping prevents. The bug is
 * silent in the other three documents, which carry no inner heading and come out
 * right, so an any-level parser looks correct and fails only on the two longest
 * documents — and it fails by under-reporting, which reads as criteria without
 * tests rather than as a parser fault. The prefix is H2-specific because a
 * third-level heading's third character is a hash rather than a space, so the
 * comparison is exact and needs no separate exclusion.
 *
 * WHY SCOPE AT ALL, GIVEN THAT IT CHANGES NO COUNT TODAY. Measured on the current
 * documents, the section-scoped counts equal the whole-file counts exactly: there
 * is not one checklist item outside a criteria section in any of the five. Scoping
 * is nonetheless what makes that a fact rather than an assumption. A checklist
 * added elsewhere in a document later — a review list, a set of follow-ups — would
 * inflate a subtotal in a way that reads as new criteria appearing, and a subtotal
 * that grows silently is worse than one that fails loudly.
 *
 * A MISSING HEADING IS AN ERROR, NOT AN EMPTY RESULT. Returning nothing would let
 * the run report a document as having no criteria, which is indistinguishable from
 * a document whose criteria all lack tests. One is a broken tool and the other is
 * work to do, and they demand opposite responses.
 *
 * @param lines The whole document, already split by {@link splitLines}.
 * @param documentPath Repository-relative path, used only for the error message.
 * @throws AreaDocumentParseError If no line matches the criteria heading.
 */
export function extractSection(lines: readonly string[], documentPath: string): SectionScope {
  // The heading is matched on the trimmed line and compared for equality, never by
  // prefix: the same heading text opens the criteria section of all 23 area
  // documents, so an approximate match would only loosen a constraint that is
  // already exact. Every occurrence is counted, because a second one would leave
  // its own items outside the first section's scope.
  let headingIndex = -1;
  let headingOccurrences = 0;
  for (const [index, text] of lines.entries()) {
    if (text.trim() !== CRITERIA_HEADING) {
      continue;
    }
    headingOccurrences += 1;
    if (headingIndex === -1) {
      headingIndex = index;
    }
  }

  if (headingIndex === -1) {
    throw new AreaDocumentParseError(
      documentPath,
      `no line matches the criteria heading "${CRITERIA_HEADING}"`,
    );
  }

  let terminatorIndex: number | null = null;
  for (const [index, text] of lines.entries()) {
    if (index <= headingIndex) {
      continue;
    }
    if (text.startsWith(H2_PREFIX)) {
      terminatorIndex = index;
      break;
    }
  }

  // The body runs from the line after the heading up to the terminator, exclusive.
  // A section with no terminator runs to the end of the file, which is legitimate
  // for a document whose criteria are its last section.
  const bodyStart = headingIndex + 1;
  const bodyEnd = terminatorIndex ?? lines.length;
  const sectionLines = lines
    .slice(bodyStart, bodyEnd)
    // The 1-based number is computed from the slice's offset within the whole
    // document, so it is a real line number a test can cite. Every consumer takes
    // the number from here rather than recomputing it, which is what keeps the
    // arithmetic in one place.
    .map((text, offset): SectionLine => ({ line: bodyStart + offset + 1, text }));

  return {
    headingLine: headingIndex + 1,
    terminatorLine: terminatorIndex === null ? null : terminatorIndex + 1,
    headingOccurrences,
    lines: sectionLines,
  };
}

// ---------------------------------------------------------------------------
// SECTION 6 — One document at a time.
// ---------------------------------------------------------------------------

/**
 * Turn one checklist line into a criterion.
 *
 * THE ORDER OF THE TWO TRANSFORMATIONS IS LOAD-BEARING. Frames are read from the
 * raw line first, because {@link stripLinkTargets} rewrites `[frame 69](target)`
 * into `frame 69`, which the bracketed-label pattern no longer matches. Sanitize
 * before extracting and every criterion reports zero frames — a failure that
 * produces a complete-looking manifest with an empty column, and one the count
 * reconciliation cannot catch because the count is unaffected.
 *
 * The raw line goes no further than this function. Only the sanitized form is
 * stored, and it is checked before it is returned.
 */
function buildCriterion(entry: AreaDocument, sectionLine: SectionLine): Criterion {
  const { line, text } = sectionLine;

  const citations = extractFrames(text);
  const sanitizedText = stripChecklistMarker(stripLinkTargets(text));
  assertNoForbiddenOutput(sanitizedText, entry.path, line);

  return {
    areaKey: entry.areaKey,
    document: entry.basename,
    path: entry.path,
    line,
    frames: citations.frames,
    distinctFrames: citations.distinctFrames,
    primaryFrame: citations.primaryFrame,
    sanitizedText,
  };
}

/**
 * Notes about a checklist marker that is not written the way every marker is.
 *
 * Across all five documents there are zero indented checklist items and zero items
 * written as checked: every one of the 241 criteria begins at column 0 with an
 * unchecked box. Neither condition can arise on the input as measured, so a note
 * here means a read-only document has changed — which is a finding, not something
 * to accommodate.
 *
 * The checked case matters more than it looks. If a source box were ever ticked, a
 * later reader would be tempted to treat it as a status, and rule `R3` (uncertainty
 * is not permission to omit) forbids marking a criterion satisfied without a
 * passing test. Reporting the tick keeps that temptation visible instead of letting
 * it arrive silently.
 *
 * Both tests read the marker that was already matched rather than applying a
 * second pattern of their own: indentation is whatever leading whitespace the
 * marker carried, and a ticked box is the one case where the box character is not a
 * space. An absent marker text — impossible for a matched line, but the compiler
 * cannot know that — yields no notes rather than skipping the criterion, because
 * losing a criterion is far worse than losing a note about it.
 */
function markerDrift(markerText: string | undefined, line: number): readonly string[] {
  if (markerText === undefined) {
    return [];
  }

  const notes: string[] = [];
  if (markerText !== markerText.trimStart()) {
    notes.push(`the checklist item at line ${line} is indented, where none was expected`);
  }
  if (markerText.toLowerCase().includes('x')) {
    notes.push(
      `the checklist item at line ${line} is written as checked; a source checkbox is ` +
        'never a status, and satisfaction is established only by a passing test',
    );
  }
  return notes;
}

/**
 * Parse one area document's content into its criteria and its drift notes.
 *
 * Pure and filesystem-free, which is what makes the parsing rules testable against
 * synthetic content: the traps this module exists to avoid — an inner heading, a
 * repeated frame, a criterion citing none — can each be exercised without the real
 * catalog, and the real catalog then confirms the measured totals.
 *
 * DRIFT IS RECORDED, NEVER ACTED ON. The four recorded line numbers in each
 * entry's verification block are compared against what was found, and a mismatch
 * becomes a note. Nothing is corrected: the documents are read-only inputs, and
 * rule `R2` (corpus and specification handling) requires a defect in one to be
 * recorded and worked around rather than fixed in place. Nothing throws either,
 * because a moved heading still yields a parse that a human can evaluate.
 *
 * THE COUNT COMPARISON IS DELIBERATELY ABSENT. {@link ParsedArea.observedCount} is
 * whatever was counted, and comparing it with the expectation is the reconciliation
 * pass's gate. Duplicating that comparison here would create a second place that
 * decides whether the run passes, and two places eventually disagree.
 */
export function parseAreaDocument(entry: AreaDocument, content: string): ParsedArea {
  const lines = splitLines(content);
  const scope = extractSection(lines, entry.path);

  const criteria: Criterion[] = [];
  const drift: string[] = [];

  for (const sectionLine of scope.lines) {
    // One pattern application per line. A line that is not a checklist item is
    // skipped rather than treated as a continuation of the previous one: every
    // criterion is exactly one physical line, and the sections legitimately contain
    // 21 blank lines, 2 sub-headings and 7 sentences of prose between them. There
    // are no fenced code blocks inside any of the five sections, so no fence state
    // is tracked — tracking it would add a mode this input never enters.
    const marker = checklistItemPattern().exec(sectionLine.text);
    if (marker === null) {
      continue;
    }

    criteria.push(buildCriterion(entry, sectionLine));
    drift.push(...markerDrift(marker[0], sectionLine.line));
  }

  const { verified } = entry;

  if (scope.headingOccurrences > 1) {
    drift.push(
      `the criteria heading appears ${scope.headingOccurrences} times; only the first ` +
        'section was read, so any criteria under a later one are not counted',
    );
  }
  if (scope.headingLine !== verified.headingLine) {
    drift.push(
      `the criteria heading is at line ${scope.headingLine}, where line ` +
        `${verified.headingLine} was recorded`,
    );
  }
  if (scope.terminatorLine !== verified.terminatorLine) {
    // Phrased per branch rather than by substituting a value into one sentence: an
    // absent terminator is a different statement from a moved one, and a note a
    // person has to re-read is a note that gets skimmed.
    const found =
      scope.terminatorLine === null
        ? 'the section has no terminating second-level heading'
        : `the section's terminating second-level heading is at line ${scope.terminatorLine}`;
    drift.push(`${found}, where line ${verified.terminatorLine} was recorded`);
  }

  const firstCriterion = criteria.at(0);
  const lastCriterion = criteria.at(-1);
  if (firstCriterion !== undefined && firstCriterion.line !== verified.firstCriterionLine) {
    drift.push(
      `the first criterion is at line ${firstCriterion.line}, where line ` +
        `${verified.firstCriterionLine} was recorded`,
    );
  }
  if (lastCriterion !== undefined && lastCriterion.line !== verified.lastCriterionLine) {
    drift.push(
      `the last criterion is at line ${lastCriterion.line}, where line ` +
        `${verified.lastCriterionLine} was recorded`,
    );
  }

  return {
    areaKey: entry.areaKey,
    document: entry.basename,
    path: entry.path,
    observedCount: criteria.length,
    expectedCount: entry.expectedCriteria,
    criteria,
    drift,
  };
}

// ---------------------------------------------------------------------------
// SECTION 7 — All five documents, in the order they are declared.
// ---------------------------------------------------------------------------

/**
 * Parse every Phase-1 area document and assemble the catalog the tool works from.
 *
 * THE DOCUMENT SET IS CLOSED AND IS NEVER DISCOVERED. The five entries come from
 * `constants.ts` and are iterated in the order declared there. A directory scan
 * would be catastrophic rather than merely untidy: all 23 area documents carry the
 * identical criteria heading, the 18 deferred ones hold 840 further criteria
 * between them, and the catalog's own index holds 51 checklist items of its own
 * under a different heading — so a glob would absorb 891 extra items in silence and
 * the run total would read 1,132 where it must read 241. Heading detection offers
 * no protection against that; only the closed list does.
 *
 * READS ARE SEQUENTIAL, WHICH IS A CHOICE. Five documents totalling roughly a
 * megabyte would read marginally faster in parallel, but a gate tool's first
 * failure should be the first failure in declared order. Reading concurrently makes
 * which document is reported a matter of scheduling, and a report that names a
 * different document on each run costs far more attention than the milliseconds it
 * saves.
 *
 * ORDER IS ESTABLISHED BY CONSTRUCTION, NOT BY SORTING. Documents are appended in
 * declared order and criteria within a document in ascending line order, so the
 * flattened list is already in the order the manifest renders, and two runs over an
 * unchanged tree produce identical output.
 *
 * @param repoRoot Absolute path of the repository root. Every document path in
 *   `constants.ts` is relative to it, and resolving against a discovered root is
 *   what lets this tool run both from the root and from inside its own workspace.
 * @throws AreaDocumentParseError If a document cannot be read, or carries no
 *   criteria heading, or produces sanitized text that still looks like a link
 *   target.
 */
export async function parseAreaDocuments(repoRoot: string): Promise<ParsedCatalog> {
  const areas: ParsedArea[] = [];
  const criteria: Criterion[] = [];

  for (const entry of AREA_DOCUMENTS) {
    const absolutePath = resolve(repoRoot, entry.path);

    let content: string;
    try {
      content = await readFile(absolutePath, 'utf8');
    } catch (error) {
      // The cause is attached but the message stays structural. A filesystem
      // failure carries a path and an error number and never document text, so it
      // is safe to keep, and it is the difference between a document that is
      // missing and one that cannot be opened.
      throw new AreaDocumentParseError(entry.path, 'the document could not be read', {
        cause: error,
      });
    }

    const area = parseAreaDocument(entry, content);
    areas.push(area);
    criteria.push(...area.criteria);
  }

  return {
    areas,
    criteria,
    observedTotal: areas.reduce((total, area) => total + area.observedCount, 0),
    // Summed from the per-document expectations rather than restated from the
    // declared run total, so the reconciliation pass can check the declared figure
    // against this derivation instead of trusting either on its own.
    expectedTotal: areas.reduce((total, area) => total + area.expectedCount, 0),
  };
}
