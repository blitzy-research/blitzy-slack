/**
 * Pass 3 of the acceptance-criteria manifest generator: rendering the traceability
 * spine, and owning exactly the span of it that a tool is allowed to own.
 *
 * WHAT THIS MODULE PRODUCES
 *
 * The generated region of `docs/decisions/ac-manifest.md` — the manifest that has
 * to exist BEFORE any Phase-1 surface is implemented. The ordering is not
 * stylistic. A criterion is satisfied only when a referencing test passes, so the
 * artifact that names the test for every criterion is what makes satisfaction
 * checkable at all; written afterwards it would be a report about what happened
 * rather than a contract about what must.
 *
 * IT OWNS A REGION, NOT A FILE — AND THAT DISTINCTION IS THE WHOLE DESIGN
 *
 * The manifest is also a hand-authored decision record. Its rationale, its status
 * vocabulary, its routing notes, its per-area observations, its regeneration
 * procedure and its misuse notes are written by a person. Only the span between
 * the two markers in the constants module is generated, so every function here
 * that touches the file is built to leave every byte outside that span exactly as
 * it found it — including its line endings, including its trailing whitespace, and
 * including the blank line that immediately follows the closing marker.
 *
 * Three consequences follow, and each is a deliberate refusal:
 *
 *   - The whole file is never normalised on write. A read normalises a COPY for
 *     comparison; the copy is never what gets written back. Rewriting a
 *     carriage return the author put there would be reformatting a document this
 *     tool does not own, which rule `R2` (corpus and specification handling)
 *     prohibits for the read-only inputs and which this module extends to authored
 *     prose in the one record it writes, because the reason is the same.
 *   - A file carrying no marker is APPENDED to, never rewritten. The authored
 *     prose in it belongs to another author, and truncating it to insert a table
 *     would destroy work in order to report on it.
 *   - Markers that cannot delimit one unambiguous span — one present without the
 *     other, the closing one first, or either of them twice — are an error rather
 *     than a puzzle to solve. In every one of those states the safe span is
 *     undefined, and writing anyway risks exactly the loss the arrangement exists
 *     to prevent. The record states the same two conditions in its own prose.
 *
 * DETERMINISM IS A HARD REQUIREMENT, NOT A COURTESY
 *
 * {@link renderManagedRegion} is pure and its output is byte-identical for
 * identical input on every machine. No timestamp, no date, no hostname, no
 * absolute path, no run identifier, no elapsed time and no version string appears
 * anywhere in what it returns. The module reads no clock, no random source, no
 * environment variable and no locale.
 *
 * The reason is concrete rather than aesthetic. The pipeline's non-writing mode
 * renders the region and compares it against what is committed, so a single
 * varying byte fails that comparison on every run of every branch — and a check
 * that always fails is a check somebody eventually deletes. A tool that stamped
 * the time it ran would disable the gate it exists to serve.
 *
 * WHERE EVERY OPERATING VALUE COMES FROM
 *
 * The constants module, by import. Rule `R3` (uncertainty is not permission to
 * omit) requires a value to be defined once and consumed by reference, and that
 * module states the corollary for this workspace directly: a heading, a pattern, a
 * path, an exit code or an expected count written into one of the passes is a
 * defect even when it happens to be correct, because a second copy is how the
 * manifest and the gate quietly stop agreeing. So the manifest's path, both
 * markers, the status vocabulary, the no-frame phrase, the gate ledger's path, the
 * defect register's path, the gate family's label, the run total, the closed
 * document set and the deny-list of output shapes are all imported. This module
 * declares no substitute for any of them.
 *
 * What it does declare locally is the presentation of its own output: its heading
 * text, its column labels, its table punctuation and the two command names a
 * reader is told to run. None of those binds anything another module can observe,
 * none is derived from a frame, and no gate compares against one. The reconcile
 * and discover passes draw the same line for the same reason.
 *
 * THE ROW CONTRACT IS IDENTITY ONLY, AND THAT IS A SAFETY PROPERTY
 *
 * A rendered row carries the criterion's document, its line, the frames it cites,
 * the tests that cite it and its status. It carries no prose. Two reasons, and the
 * second is the load-bearing one:
 *
 *   - Rows stay short enough to scan, and a reader looking for the test that
 *     covers a criterion finds it without reading a paragraph first.
 *   - It removes an entire class of brand-safety risk. Measured across the 241
 *     criteria, 239 of the raw source lines carry a third-party product name
 *     inside a citation target, and 0 still carry one once link targets are
 *     stripped. A column of prose would put this module one refactor away from
 *     emitting the thing rule `R4` (third-party identity exclusion) forbids;
 *     columns of integers and repository paths cannot.
 *
 * A DIVERGENCE FROM THE COMMITTED RECORD, RECORDED RATHER THAN RESOLVED
 *
 * The hand-authored record currently describes a wider row — a criterion-summary
 * column — and a three-member status vocabulary of its own, mapping this tool's
 * `cited` onto a failing or passing outcome and its `uncovered` onto a not-started
 * one. This module renders the identity-only row and the two-member vocabulary,
 * because that is what the build's row contract specifies and because the
 * constants module admits exactly two statuses: a third would let a future edit
 * populate it from something convenient — an assertion count, a green pipeline, a
 * coverage percentage — and each of those is a proxy for a passing test rather
 * than a passing test, which rule `R3` (uncertainty is not permission to omit)
 * forbids.
 *
 * The divergence is written down here and nowhere else. The authored prose is not
 * edited to agree, because it is outside the span this module owns and because the
 * project's documentary discipline is to preserve an inconsistency so a later
 * reader sees it rather than inheriting a silent resolution of it. The record's own
 * published mapping is honoured where it is useful: {@link extractCommittedRows}
 * reads it to compare a committed table written in either vocabulary, rather than
 * inventing a mapping of its own.
 *
 * HOW THE PROJECT RULES ARE CITED THROUGHOUT
 *
 * By requirement label and subject — `R1` authorization is server-side only, `R2`
 * corpus and specification handling, `R3` uncertainty is not permission to omit,
 * `R4` third-party identity exclusion, `R5` shared components implemented once.
 * Their own identifiers are deliberately not written out, because each is prefixed
 * with the very third-party product name that `R4` forbids in source and comments,
 * so spelling a rule's name in order to obey it would break it — and this path is
 * not one of the five the repository's brand guard allowlists, so the pipeline
 * would fail this file for doing so. The subject accompanies the label every time
 * because the rules are supplied in an order that does not match their labels, so
 * an ordinal alone would point at the wrong constraint.
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT CONTAIN
 *
 *   - No third-party dependency. Two Node built-ins and two sibling modules.
 *   - No path into the frame corpus and no way to construct one. A frame's whole
 *     identity here is the integer the reconcile pass already put in a row.
 *   - No literal from the deny-list of forbidden output shapes. The four shapes
 *     are named once, in the constants module, which is where a deny-list has to
 *     spell out what it denies; this module only asks whether they occur.
 *   - No report of a test outcome, and no vocabulary in which one could be
 *     written. This tool runs nothing and reads no test report.
 *
 * @packageDocumentation
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import {
  AREA_DOCUMENTS,
  DEFECT_REGISTER_PATH,
  EXPECTED_TOTAL,
  GATE_FAMILY_LABEL,
  GATE_LEDGER_PATH,
  MANAGED_REGION_BEGIN,
  MANAGED_REGION_END,
  MANIFEST_PATH,
  NO_FRAME_CITED,
  STATUS,
  FORBIDDEN_OUTPUT_NEEDLES,
} from './constants.js';
import type { Status } from './constants.js';
import { formatCoverageLine } from './reconcile.js';
import type { AreaReconciliation, ManifestRow, ReconciliationReport } from './reconcile.js';

// ---------------------------------------------------------------------------
// SECTION 1 — Failure that belongs to the tool.
//
// Both classes here are TOOL ERRORS rather than gate failures, and the reconcile
// pass explains why the two are held apart: a gate failure is the tool working
// correctly and reporting that the project is not where it should be, while a
// tool error is the tool unable to reach an answer at all. They demand opposite
// responses — fix the project, or fix the tool — and the calling module maps them
// onto different exit codes. Nothing in this file returns a gate verdict; it
// renders one the reconcile pass already reached.
// ---------------------------------------------------------------------------

/**
 * The region could not be rendered, read or written.
 *
 * Every message carries structural facts only: a path, a count, an index, a line
 * number, a marker's presence or absence. Never a criterion's text, never a
 * fragment of a document, never a link target. An error message is the easiest
 * place for text to escape, because it is thrown, caught, formatted and printed by
 * code that never looked at where the text came from — so the discipline has to
 * live at the point the message is composed rather than at the point it is
 * printed.
 */
export class EmitError extends Error {
  /**
   * @param reason A short structural description of what could not be done. Never
   *   pass document text, a criterion line, or any link target.
   * @param options Standard error options. A cause is welcome: the causes that
   *   reach here are filesystem errors carrying a path and an error code.
   */
  public constructor(reason: string, options?: ErrorOptions) {
    super(`Cannot emit the acceptance-criteria manifest: ${reason}.`, options);
    // Set explicitly: a subclass otherwise reports the base constructor's name,
    // which makes a precise failure look generic wherever it is caught.
    this.name = 'EmitError';
  }
}

/**
 * Text destined for the manifest, a log line or an error message matched one of
 * the forbidden output shapes.
 *
 * A SUBCLASS RATHER THAN A SEPARATE HIERARCHY, because a caller that wants to
 * distinguish a brand leak can, and a caller that only wants to know the emitter
 * failed does not have to enumerate two unrelated types to find out.
 *
 * THE MESSAGE NAMES THE SHAPE BY POSITION AND NEVER BY VALUE, and that is not
 * fastidiousness. {@link assertBrandSafe} is called on diagnostics as well as on
 * the rendered region, so a message that quoted the shape it had just found would
 * fail its own assertion the moment anything checked it — the check would appear
 * to be broken while working exactly as specified. Quoting the surrounding text
 * would be worse: the text is the thing suspected of carrying identity, so
 * reproducing it in a message that gets logged is how a leak escapes the process
 * through the very channel that detected it.
 *
 * A position and a line number are enough to find the problem, because the region
 * is rendered from a report the caller is holding.
 */
export class BrandSafetyError extends EmitError {
  /** Position of the matched shape in the imported deny-list. Never its value. */
  public readonly shapeIndex: number;

  /** 1-based line within the checked text where the shape occurs. */
  public readonly textLine: number;

  /**
   * @param shapeIndex Position of the matched shape in the deny-list.
   * @param textLine 1-based line of the checked text where it occurs.
   */
  public constructor(shapeIndex: number, textLine: number) {
    super(
      `the text matches forbidden output shape ${shapeIndex + 1} of ` +
        `${FORBIDDEN_OUTPUT_NEEDLES.length} at line ${textLine}, so it was not emitted. ` +
        'The manifest carries frame numbers only; no capture filename, encoded path or ' +
        'corpus reference may appear in it, in a log line or in an error message',
    );
    this.name = 'BrandSafetyError';
    this.shapeIndex = shapeIndex;
    this.textLine = textLine;
  }
}

// ---------------------------------------------------------------------------
// SECTION 2 — The brand assertion.
// ---------------------------------------------------------------------------

/**
 * The first line and shape index at which the text matches the deny-list, or
 * `null` when it matches none.
 *
 * Shapes are tested in deny-list order and lines in file order, so the reported
 * position is a property of the input rather than of iteration luck — which
 * matters because the position lands in an error message a person reads.
 *
 * The comparison is case-folded. Every shape in the deny-list is written in lower
 * case, so folding the haystack is what makes the check insensitive to a path
 * whose extension or directory arrives capitalised. Folding a copy of one line at
 * a time, rather than the whole text, keeps the reported line number a fact about
 * the original.
 */
function findForbiddenShape(
  text: string,
): { readonly shapeIndex: number; readonly line: number } | null {
  const lines = text.split('\n');

  for (const [shapeIndex, shape] of FORBIDDEN_OUTPUT_NEEDLES.entries()) {
    for (let offset = 0; offset < lines.length; offset += 1) {
      // Indexed access is checked, so the element is narrowed explicitly rather
      // than assumed: the compiler configuration makes every index a possible
      // absence, and a non-null assertion here would trade a real guarantee for
      // a shorter line.
      const line = lines[offset];
      if (line === undefined) {
        continue;
      }

      if (line.toLowerCase().includes(shape)) {
        return { shapeIndex, line: offset + 1 };
      }
    }
  }

  return null;
}

/**
 * Refuses text that matches any forbidden output shape.
 *
 * WHY THE CHECK IS STRUCTURAL RATHER THAN A LITERAL TOKEN COMPARISON. The thing
 * actually being kept out of the manifest is a third-party product name. The
 * obvious check — search the output for that name — cannot be written, because
 * writing the name into authored source in order to search for it would itself
 * violate rule `R4` (third-party identity exclusion), and the repository's brand
 * guard would fail this file in the pipeline for carrying it. So the check tests
 * for the SHAPES the name always travels in instead of for the name, and the
 * substitution is sound for a measured reason rather than a hopeful one: every one
 * of the 1,022 corpus filenames embeds that name, and every corpus reference in
 * the catalog is an encoded relative path to one of those files. Catch the shape
 * and the name comes with it.
 *
 * WHY IT IS MORE THAN BELT-AND-BRACES. Measured across the 241 criteria, 239 of
 * the raw source lines carry a third-party product name inside a citation target,
 * while 0 still carry one once link targets are stripped. The input this tool
 * reads is therefore saturated with the thing that must not be emitted, and the
 * identity-only row contract plus this assertion are together what make a leak
 * structurally impossible rather than merely unlikely.
 *
 * WHY FAILING HERE IS CHEAPER THAN FAILING LATER. The manifest's own path is not
 * one of the five paths the repository's brand guard allowlists, so a single
 * leaked target would fail the brand stage of the pipeline — at a distance from
 * the cause, in a job that reports a match and not a criterion. Failing at the
 * moment the string is produced, with the report still in hand, names the problem
 * where it can be fixed.
 *
 * Called on the rendered region before any write, and on every diagnostic string
 * before it is returned. There is no path out of this module that skips it.
 *
 * @param text Any string about to leave the process — a rendered region, a
 *   comparison summary, a diagnostic line.
 * @throws BrandSafetyError If the text matches any shape in the deny-list.
 */
export function assertBrandSafe(text: string): void {
  const found = findForbiddenShape(text);

  if (found !== null) {
    throw new BrandSafetyError(found.shapeIndex, found.line);
  }
}

// ---------------------------------------------------------------------------
// SECTION 3 — The local presentation vocabulary.
//
// These values are local on purpose, and the reasoning is worth stating because
// rule `R3` (uncertainty is not permission to omit) requires an operating value to
// be defined once and consumed by reference. None of these is an operating value.
// They are the presentation of this module's own output: they bind nothing another
// module can observe, none is derived from a frame, and no gate compares against
// one. Every value that DOES bind behaviour — the manifest's path, both markers,
// the status vocabulary, the no-frame phrase, the two record paths, the gate
// family's label, the run total and the closed document set — is imported above,
// and this file declares no substitute for any of them.
//
// The reconcile and discover passes draw the same line for the same reason, so all
// three modules agree about which values belong centrally and which do not.
// ---------------------------------------------------------------------------

/** The one line ending this module emits. Never a carriage return. */
const LF = '\n';

/** A blank line in a rendered block. */
const BLANK = '';

/** Cell boundary of a Markdown table row. */
const CELL_BOUNDARY = '|';

/** One space of breathing room inside a cell boundary. */
const CELL_PADDING = ' ';

/**
 * A cell boundary escaped so it renders as text rather than ending the cell.
 *
 * No value this module renders contains one today — a line number, an integer, a
 * repository path and a status word cannot. The escape exists so that a value
 * which one day does cannot silently split a row into two, which would corrupt the
 * table for every reader and every parser of it at once.
 */
const ESCAPED_CELL_BOUNDARY = '\\|';

/** What a line break inside a cell becomes. A cell is always one line. */
const CELL_LINE_BREAK_REPLACEMENT = ' ';

/** Fill character of a table's delimiter row. */
const DELIMITER_FILL = '-';

/** Suffix that right-aligns a column in its delimiter row. */
const RIGHT_ALIGNMENT_MARK = ':';

/** Shortest delimiter a Markdown table cell is written with. */
const MINIMUM_DELIMITER_WIDTH = 3;

/** Wraps a value so a path or a command renders as code rather than as prose. */
const CODE_TICK = '`';

/**
 * Prefix that renders a criterion's line in the form a citation uses.
 *
 * The mandated citation form writes the criterion's 1-based line as `L` followed by
 * the number, so a cell rendered the same way can be copied straight into a test
 * comment without being retyped. The authority on the form itself is the citation
 * pattern in the constants module, which is what parses it; this constant only
 * renders it, which is why it is presentation and lives here.
 */
const LINE_LABEL_PREFIX = 'L';

/** Separates the citing test paths inside one cell. */
const TARGET_TEST_SEPARATOR = ', ';

/**
 * Rendered in the target-test column when nothing cites the criterion.
 *
 * A word rather than a dash, for two reasons. The build's row contract asks for a
 * placeholder free of an em-dash, so the character the authored table uses is
 * unavailable. And a word survives being copied out of a table, where a lone dash
 * reads as a formatting artifact and invites a reader to assume the cell was never
 * filled in — when in fact an uncovered criterion is the normal state of every row
 * before its test is written, and precisely what the manifest exists to show.
 */
const NO_TARGET_TEST = 'none';

/** The criterion table's columns, in the order the row contract states them. */
const CRITERION_TABLE_COLUMNS = [
  { heading: 'line', alignment: 'left' },
  { heading: 'frames', alignment: 'left' },
  { heading: 'target test', alignment: 'left' },
  { heading: 'status', alignment: 'left' },
] as const satisfies readonly TableColumn[];

/** The reconciliation table's columns. Counts are right-aligned so they compare. */
const SUBTOTAL_TABLE_COLUMNS = [
  { heading: 'area', alignment: 'left' },
  { heading: 'document', alignment: 'left' },
  { heading: 'observed', alignment: 'right' },
  { heading: 'expected', alignment: 'right' },
  { heading: 'cited', alignment: 'right' },
  { heading: 'uncovered', alignment: 'right' },
  { heading: 'reconciles', alignment: 'left' },
] as const satisfies readonly TableColumn[];

/** Label of the reconciliation table's total row. */
const TOTAL_ROW_LABEL = 'total';

/** An intentionally empty cell: the total row names no single document. */
const EMPTY_CELL = '';

/** The reconciliation marker when an observed count equals its expectation. */
const RECONCILES_YES = 'yes';

/** The reconciliation marker when it does not. Never adjusted away. */
const RECONCILES_NO = 'no';

/**
 * The other gate families' sizes, stated so a reader cannot mistake this one for
 * the run.
 *
 * These are counts of families this tool neither computes nor owns; they are
 * recited in the region for exactly one purpose, which is to say what is NOT in the
 * figure beside them. The authority on all four is the gate ledger, which the
 * region links. They are named here rather than written into a template string so
 * that the four numbers are visible together in one place instead of buried in
 * prose, and so a reader checking them against the ledger has a single line to read
 * each against.
 */
const OTHER_GATE_FAMILIES = [
  { count: 11, label: 'Phase-0 authored gates' },
  { count: 12, label: 'Phase-1 catalog gates' },
  { count: 3, label: 'Phase-1 authored gates' },
  { count: 11, label: 'standing gates' },
] as const;

/** Separates the per-area sizes in the gate-family statement. Middle dot, spaced. */
const AREA_SPLIT_SEPARATOR = ' · ';

/** Joins a list of family sizes into English. */
const LIST_SEPARATOR = ', ';

/** Introduces the last item of a joined list. */
const FINAL_LIST_SEPARATOR = ' and ';

/** The command that rewrites the region. */
const REGENERATE_COMMAND = 'pnpm ac:manifest';

/** The command the pipeline runs, which renders and compares without writing. */
const VERIFY_COMMAND = 'pnpm ac:manifest:check';

/**
 * Column at which the region's prose is wrapped.
 *
 * Measured against the authored prose this region sits inside, which wraps at a
 * median of 85 columns and a maximum of 92. Ninety puts the generated paragraphs
 * inside that band, so a reader moving between authored and generated text is not
 * moving between two line lengths.
 *
 * The wrap is applied to a whole paragraph rather than written into the source as
 * hand-broken lines, and the difference is not cosmetic. Several paragraphs
 * interpolate values whose widths are not known until they are rendered — a joined
 * list of four family sizes, a path, a command — so hand-breaking produces one
 * 142-column line and several short ones, and it produces DIFFERENT raggedness the
 * moment any of those values changes. Wrapping makes the layout a function of the
 * finished text, which is both tidier and stable under an edit somewhere else.
 */
const PROSE_WIDTH = 90;

/**
 * How many differing rows a comparison names before it stops naming them.
 *
 * Bounded deliberately. A comparison summary is printed to a terminal and read by a
 * person, and a whole-file difference dumped there is skipped rather than read — so
 * an unbounded report is a less useful report, not a more thorough one. The count
 * is always exact; only the examples are capped, and the summary says how many it
 * did not name.
 */
const MAX_DIFFERENCE_EXAMPLES = 5;

/** Joins a document basename and a criterion line into one comparison key. */
const COMPARISON_KEY_SEPARATOR = '#';

// ---------------------------------------------------------------------------
// SECTION 4 — Table primitives.
//
// One renderer, used by both tables. Columns are aligned to their widest cell,
// which is deterministic because it is a function of the content alone — no
// terminal width, no locale, no environment. The authored prose the region sits
// inside is written the same way, so a reader moving between the two is not moving
// between two table styles.
// ---------------------------------------------------------------------------

/** Which edge a column's cells are padded against. */
type ColumnAlignment = 'left' | 'right';

/** One column of a rendered Markdown table. */
interface TableColumn {
  /** The column's heading, rendered verbatim in the header row. */
  readonly heading: string;
  /** Which edge its cells are padded against. */
  readonly alignment: ColumnAlignment;
}

/**
 * Makes a value safe to place inside a table cell.
 *
 * Two transformations, both of which prevent a corrupted table rather than merely
 * tidying one. A line break inside a cell ends the row for every Markdown renderer
 * and every parser, so it becomes a space. An unescaped cell boundary splits one
 * cell into two, silently shifting every value in the row into the wrong column —
 * which is worse than a visible break, because the table still renders.
 */
function escapeCell(value: string): string {
  return value
    .replace(/\r\n?|\n/g, CELL_LINE_BREAK_REPLACEMENT)
    .replace(/\|/g, ESCAPED_CELL_BOUNDARY)
    .trim();
}

/**
 * Wraps a value as inline code.
 *
 * Inline code, never a fenced block: the region carries plain tables and prose
 * only, which is the decision-record convention the surrounding authored text
 * follows. A value already carrying a tick would end the span early, so it is
 * rendered plain rather than rendered broken — no repository path or command in
 * this module can contain one, and the guard is here so that a value which one day
 * does degrades to readable text instead of to malformed Markdown.
 */
function inlineCode(value: string): string {
  return value.includes(CODE_TICK) ? value : `${CODE_TICK}${value}${CODE_TICK}`;
}

/**
 * Renders a Markdown table, aligned to its widest cell in every column.
 *
 * @param columns The column headings and their alignments.
 * @param rows One array of already-escaped cells per row, one cell per column.
 * @returns The header row, the delimiter row, then one line per data row.
 * @throws EmitError If a row's cell count does not match the column count. That is
 *   a contradiction inside this module rather than a fact about the project, so it
 *   fails loudly instead of rendering a table whose columns have quietly shifted.
 */
function renderTable(
  columns: readonly TableColumn[],
  rows: readonly (readonly string[])[],
): readonly string[] {
  for (const row of rows) {
    if (row.length !== columns.length) {
      throw new EmitError(
        `a table row supplied ${row.length} cells where the layout requires ` + `${columns.length}`,
      );
    }
  }

  const widths = columns.map((column, index) => {
    let width = Math.max(column.heading.length, MINIMUM_DELIMITER_WIDTH);

    for (const row of rows) {
      // Checked indexed access: the cell count was validated above, so this can
      // only be absent if that check is wrong, and the fallback keeps the width
      // computation honest either way rather than asserting the check is right.
      const cell = row[index] ?? EMPTY_CELL;
      width = Math.max(width, cell.length);
    }

    return width;
  });

  const renderRow = (cells: readonly string[]): string => {
    const padded = columns.map((column, index) => {
      const cell = cells[index] ?? EMPTY_CELL;
      const width = widths[index] ?? cell.length;

      return column.alignment === 'right' ? cell.padStart(width) : cell.padEnd(width);
    });

    const separator = `${CELL_PADDING}${CELL_BOUNDARY}${CELL_PADDING}`;

    return (
      `${CELL_BOUNDARY}${CELL_PADDING}` + padded.join(separator) + `${CELL_PADDING}${CELL_BOUNDARY}`
    );
  };

  const delimiter = columns.map((column, index) => {
    const width = widths[index] ?? MINIMUM_DELIMITER_WIDTH;

    return column.alignment === 'right'
      ? `${DELIMITER_FILL.repeat(width - 1)}${RIGHT_ALIGNMENT_MARK}`
      : DELIMITER_FILL.repeat(width);
  });

  return [
    renderRow(columns.map((column) => column.heading)),
    renderRow(delimiter),
    ...rows.map((row) => renderRow(row)),
  ];
}

/**
 * Wraps a paragraph to a column, never breaking an inline-code span.
 *
 * THE CODE SPAN HAS TO STAY WHOLE, and that is the reason this is not a plain word
 * wrap. A span broken across a line still renders as code in most Markdown
 * implementations but stops being copyable as one token, and the coverage figure is
 * precisely a value a reader copies. So a span is treated as a single atom: it is
 * placed on a line of its own when it does not fit, rather than split. The coverage
 * line is longer than the wrap column for exactly this reason and is meant to be.
 *
 * A span is recognised by counting ticks rather than by matching a pattern, because a
 * span may contain spaces — the coverage figure contains several — so a whitespace
 * split has to be re-joined until the ticks balance.
 *
 * Deterministic: greedy fill, this module's own column, no locale and no measurement
 * of anything but string length.
 */
function wrapProse(text: string): readonly string[] {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const atoms: string[] = [];
  let pending: string[] = [];
  let inSpan = false;

  for (const word of words) {
    const ticks = (word.match(/`/g) ?? []).length;

    if (!inSpan && ticks % 2 === 0) {
      atoms.push(word);
      continue;
    }

    pending.push(word);
    inSpan = (Number(inSpan) + ticks) % 2 === 1;

    if (!inSpan) {
      atoms.push(pending.join(CELL_LINE_BREAK_REPLACEMENT));
      pending = [];
    }
  }

  // An unbalanced span cannot be wrapped safely, so what is left is emitted as one
  // atom rather than split at a guess.
  if (pending.length > 0) {
    atoms.push(pending.join(CELL_LINE_BREAK_REPLACEMENT));
  }

  const lines: string[] = [];
  let current = BLANK;

  for (const atom of atoms) {
    if (current.length === 0) {
      current = atom;
    } else if (current.length + 1 + atom.length <= PROSE_WIDTH) {
      current = `${current}${CELL_LINE_BREAK_REPLACEMENT}${atom}`;
    } else {
      lines.push(current);
      current = atom;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

/**
 * Joins a list of phrases into English, so the region reads as prose.
 *
 * Deterministic and locale-independent: the separators are this module's own
 * constants and no formatter is consulted, because a locale-sensitive join would
 * make the region's bytes depend on the machine that rendered it.
 */
function joinPhrases(phrases: readonly string[]): string {
  if (phrases.length <= 1) {
    return phrases.join(BLANK);
  }

  const leading = phrases.slice(0, -1);
  const last = phrases[phrases.length - 1] ?? BLANK;

  return `${leading.join(LIST_SEPARATOR)}${FINAL_LIST_SEPARATOR}${last}`;
}

// ---------------------------------------------------------------------------
// SECTION 5 — The managed region.
//
// Every function in this section is pure. Given one report they return the same
// strings on every machine and on every run, because nothing here reads a clock, a
// random source, an environment variable, a locale or the filesystem. That is the
// property the pipeline's non-writing mode depends on, and it is checked by
// rendering twice and comparing bytes rather than assumed.
// ---------------------------------------------------------------------------

/**
 * The frames cell for one row.
 *
 * Reads the field the reconcile pass designates for exactly this cell rather than
 * re-deriving it from the frame list. Two passes deriving one value is how a
 * rendered table starts describing a slightly different set from the one the gate
 * counted, and the derivation is not trivial: the cell shows DISTINCT frames in
 * authored order, so a naive join of the full list would repeat a number for the one
 * criterion that cites eight times over five frames, and sorting would silently
 * change which frame is primary for the 39 criteria whose citations are not
 * ascending.
 *
 * The empty fallback exists so that an absent label can never render as an empty
 * cell. An empty cell reads as "not filled in", and here the absence is itself the
 * finding.
 */
function framesCell(row: ManifestRow): string {
  const label = escapeCell(row.frameLabel);

  return label.length === 0 ? NO_FRAME_CITED : label;
}

/**
 * The target-test cell for one row: every citing path, never collapsed into one.
 *
 * SEVERAL TESTS MAY LEGITIMATELY CLAIM ONE CRITERION — a component test beside its
 * single shared implementation and an end-to-end specification covering the same
 * requirement, for instance — and all of them are rendered. Collapsing them to the
 * first would hide the fact that a criterion is claimed from two directions, and it
 * would break this column's job: rule `R1` (authorization is server-side only)
 * requires every mutation and every projection to ship with a test proving a
 * non-member and a wrong-role caller are denied server-side, and rule `R5` (shared
 * components implemented once) requires each contract's test to live beside its
 * single implementation. This column is the artifact a reviewer uses to confirm both
 * families of test exist, so a reviewer needs the whole list rather than a
 * representative of it.
 *
 * The paths arrive deduplicated and sorted, so the cell's order is stable.
 */
function targetTestCell(row: ManifestRow): string {
  if (row.targetTests.length === 0) {
    return NO_TARGET_TEST;
  }

  return row.targetTests
    .map((testPath) => inlineCode(escapeCell(testPath)))
    .join(TARGET_TEST_SEPARATOR);
}

/**
 * One criterion's cells, in the order the row contract states them.
 *
 * IDENTITY ONLY, AND NO PROSE COLUMN. The row is a pointer to a criterion published
 * in a read-only document, not a copy of it: a line, the frames it cites, the tests
 * that cite it and its status. Omitting the prose keeps a row scannable and removes
 * an entire class of brand-safety risk, because a column of integers and repository
 * paths cannot carry a third-party product name while a column of excerpted document
 * text is one refactor away from doing so.
 *
 * The status is whatever the reconcile pass decided, and its vocabulary has exactly
 * two members. Nothing here can render a criterion as satisfied, which is the point:
 * this tool runs no test and reads no test report, so rule `R3` (uncertainty is not
 * permission to omit) leaves it no authority to claim one.
 */
function criterionRowCells(row: ManifestRow): readonly string[] {
  return [
    escapeCell(`${LINE_LABEL_PREFIX}${row.line}`),
    framesCell(row),
    targetTestCell(row),
    escapeCell(row.status),
  ];
}

/**
 * The generated-content notice.
 *
 * Visible prose rather than an HTML comment, deliberately. A comment renders as
 * nothing, so the reader most likely to edit inside the region — someone working in
 * the rendered document — is exactly the reader a comment does not reach.
 */
function noticeLines(): readonly string[] {
  return wrapProse(
    `**This region is generated.** Everything between the two markers around it is rewritten ` +
      `in full by ${inlineCode('tools/ac-manifest')} on every run, so an edit made inside them ` +
      `is overwritten and lost. The authored prose outside them is never read, moved or ` +
      `rewritten by the tool. To change what appears here, change the tool or the criteria it ` +
      `reads, then run ${inlineCode(REGENERATE_COMMAND)}.`,
  );
}

/**
 * The gate-family statement.
 *
 * ONE FAMILY, NEVER SUMMED WITH ANOTHER, and the region says so before it shows a
 * figure. The families are disjoint sets counting different kinds of thing, so a
 * combined total is not a tidier summary of the same fact but a number that answers
 * no question — and it conceals exactly what a reader needs, because a family at
 * full coverage cannot make up for a family that is short and a merged total lets it
 * appear to.
 *
 * The split is derived from the closed document set rather than restated, so the five
 * numbers here and the five subtotals below cannot disagree.
 */
function gateFamilyLines(areas: readonly AreaReconciliation[]): readonly string[] {
  const split = areas.map((area) => String(area.expected)).join(AREA_SPLIT_SEPARATOR);
  const others = joinPhrases(
    OTHER_GATE_FAMILIES.map((family) => `${family.count} ${family.label}`),
  );

  return [
    `## One gate family, reported alone`,
    BLANK,
    ...wrapProse(
      `This region reports exactly one gate family: the ${GATE_FAMILY_LABEL}, ` +
        `${EXPECTED_TOTAL} in total, split ${split} across the five area documents named below.`,
    ),
    BLANK,
    ...wrapProse(
      `The run's other families — ${others} — belong to ${inlineCode(GATE_LEDGER_PATH)} and are ` +
        `tracked there. They are **never summed** into the figure below. The families are ` +
        `disjoint sets counting different kinds of thing, so a combined total answers no ` +
        `question and would let a family at full coverage appear to make up for one that is ` +
        `short. A reader who wants one number for the run will find it in the ledger, reported ` +
        `alongside the families it was built from rather than instead of them.`,
    ),
  ];
}

/**
 * The coverage figure, with the one reading it must never be given.
 *
 * The figure comes from the reconcile pass's own formatter rather than being
 * recomposed here, so the line printed to a terminal and the line committed to this
 * record are the same string. The formatter already carries the qualifier inside the
 * line, which is what stops the distinction being lost when the number is copied out
 * — and the paragraph beneath states it again in full, because this is the single
 * most available misreading of the whole document.
 */
function coverageLines(report: ReconciliationReport): readonly string[] {
  // Defensive only: the formatter's contract is a single line with no break. A break
  // would end the inline-code span and split the figure across two paragraphs, so it
  // is folded rather than trusted.
  const coverage = formatCoverageLine(report).replace(/\r\n?|\n/g, CELL_LINE_BREAK_REPLACEMENT);

  return [
    `## Cited coverage`,
    BLANK,
    inlineCode(coverage),
    BLANK,
    ...wrapProse(
      `**Cited coverage is not satisfaction.** A row reads ${inlineCode(STATUS.cited)} when a ` +
        `test names its criterion in a comment. That is a claim about intent, discovered from a ` +
        `comment, and it is evidence neither that the test exercises the criterion nor that it ` +
        `passes: this tool runs no test, reads no test report and learns no outcome. A criterion ` +
        `is satisfied only when the test citing it passes in the pipeline, and that verdict is ` +
        `recorded by the reporting pass rather than here. A row reading ` +
        `${inlineCode(STATUS.uncovered)} is a criterion nothing claims yet, which is the normal ` +
        `state of every row before its test is written and precisely what this record exists to ` +
        `make visible.`,
    ),
  ];
}

/**
 * One area's heading and criterion table.
 *
 * The rows are sorted here rather than inherited already sorted. Ordering is part of
 * this region's contract, because the pipeline compares it byte for byte, so it is
 * established at the point of rendering: a future change to how the reconcile pass
 * collects rows then cannot reorder a committed file as a side effect.
 *
 * @throws EmitError If the rows rendered for the area do not number what the area's
 *   own arithmetic says. That is a contradiction between the table and the count
 *   beside it — precisely the state where a manifest and a gate stop agreeing while
 *   both look plausible — so it fails rather than rendering either figure.
 */
function areaSectionLines(
  area: AreaReconciliation,
  rows: readonly ManifestRow[],
): readonly string[] {
  const ordered = [...rows].sort((left, right) => left.line - right.line);

  if (ordered.length !== area.observed) {
    throw new EmitError(
      `area ${area.areaKey} reports ${area.observed} observed criteria but ` +
        `${ordered.length} rows were supplied for it`,
    );
  }

  return [
    `## ${inlineCode(area.document)} — ${area.observed} observed of ${area.expected} expected`,
    BLANK,
    ...renderTable(
      CRITERION_TABLE_COLUMNS,
      ordered.map((row) => criterionRowCells(row)),
    ),
  ];
}

/**
 * The subtotal reconciliation table, plus the total row.
 *
 * Observed and expected are shown side by side rather than reduced to a single count
 * with a marker beside it, because a reader who has to record a discrepancy needs
 * both figures: a report that shows only whether they agree leaves them nothing to
 * write down. Neither figure is ever moved toward the other.
 */
function subtotalLines(
  report: ReconciliationReport,
  areas: readonly AreaReconciliation[],
): readonly string[] {
  const areaRows = areas.map((area) => [
    escapeCell(area.areaKey),
    inlineCode(escapeCell(area.document)),
    String(area.observed),
    String(area.expected),
    String(area.cited),
    String(area.uncovered),
    area.matches ? RECONCILES_YES : RECONCILES_NO,
  ]);

  const totalRow = [
    TOTAL_ROW_LABEL,
    EMPTY_CELL,
    String(report.observedTotal),
    String(report.expectedTotal),
    String(report.citedTotal),
    String(report.uncoveredTotal),
    report.totalsOk ? RECONCILES_YES : RECONCILES_NO,
  ];

  return [
    `## Subtotal reconciliation`,
    BLANK,
    ...renderTable(SUBTOTAL_TABLE_COLUMNS, [...areaRows, totalRow]),
  ];
}

/**
 * How to regenerate, and the one response a mismatch may never receive.
 *
 * When an observed count disagrees with its expectation there are three available
 * responses and two are prohibited: adjusting the count until the arithmetic closes,
 * and editing the read-only document until it matches. Rule `R2` (corpus and
 * specification handling) forbids correcting a specification in place and requires a
 * defect in a read-only input to be recorded and worked around under the stated
 * precedence order. So the third response is the only one, and this section is what
 * routes a reader to it. The tool does not write that register either: a generator
 * recording its own defects would be marking its own homework, and the entry needs a
 * judgement about precedence no tool is in a position to make.
 */
function regenerationLines(): readonly string[] {
  return [
    `## Regeneration`,
    BLANK,
    ...wrapProse(
      `Rewrite this region with ${inlineCode(REGENERATE_COMMAND)}. Verify it without writing ` +
        `with ${inlineCode(VERIFY_COMMAND)}, which is the form the pipeline runs: it renders the ` +
        `region from the current tree and fails when what is committed differs.`,
    ),
    BLANK,
    ...wrapProse(
      `A subtotal that does not reconcile is **never adjusted away**. An observed count is what ` +
        `was counted and an expectation is a measured fact about a read-only input, so neither ` +
        `is moved toward the other, and correcting the read-only document is prohibited ` +
        `outright. Both figures are recorded in ${inlineCode(DEFECT_REGISTER_PATH)} and the work ` +
        `proceeds under the stated precedence order. This tool writes neither that register nor ` +
        `the gate ledger; it renders this region and nothing else.`,
    ),
  ];
}

/**
 * The two criteria that legitimately cite no frame.
 *
 * THE IDENTITIES ARE DERIVED FROM THE REPORT RATHER THAN WRITTEN DOWN HERE. A pair of
 * hard-coded document-and-line literals would be a second definition of a fact the
 * tables beside them already state, and the two would eventually disagree — at which
 * point the note would contradict the rows it annotates, in the one document whose
 * job is to be trusted about exactly that. Deriving them also makes the note
 * self-correcting: it reports what is there.
 *
 * The expectation is stated as prose because it is the reader's check on the
 * derivation. Two is the correct count, and a count other than two is a parsing fault
 * rather than a change in the read-only documents: an implementation that treats a
 * frame as required per row drops precisely these two and reports subtotals of 38 and
 * 56 — both off by one, both plausible, and the two criteria lost among the most
 * consequential in the set. Rule `R3` (uncertainty is not permission to omit)
 * requires an absence to be reported rather than dropped, and these rows are what
 * that requirement looks like in a table.
 */
function noFrameLines(rows: readonly ManifestRow[]): readonly string[] {
  const withoutFrames = rows
    .filter((row) => row.distinctFrames.length === 0)
    .map((row) => `${inlineCode(row.document)} ${LINE_LABEL_PREFIX}${row.line}`);

  const observed =
    withoutFrames.length === 0
      ? `**No row carries it**, which is that fault rather than an improvement.`
      : `The ${withoutFrames.length === 1 ? 'row' : 'rows'} carrying it: ` +
        `${joinPhrases(withoutFrames)}.`;

  return [
    `## The criteria that cite no frame`,
    BLANK,
    ...wrapProse(
      `Two criteria in this family cite no frame, and both are security-contract criteria: one ` +
        `requiring the sixteen cross-cutting security contracts to exist once and be applied ` +
        `uniformly, the other requiring match-term highlighting to encode both the term and the ` +
        `body before inserting highlight markup. The absence is correct and permanent rather ` +
        `than a parsing failure — the corpus is a set of static captures of a single session, so ` +
        `it is structurally incapable of evidencing a uniformly applied contract or an encoding ` +
        `boundary. There is no frame to cite because there could not be one, so ` +
        `${inlineCode(NO_FRAME_CITED)} in those rows is the finding rather than a gap to fill.`,
    ),
    BLANK,
    ...wrapProse(
      `A count other than two is a parsing fault rather than a change in the read-only ` +
        `documents: an implementation that treats a frame as required per row drops precisely ` +
        `these two and reports subtotals of 38 and 56, both off by one and both plausible. ` +
        `${observed}`,
    ),
  ];
}

/**
 * Groups the report's rows by area key.
 *
 * Keyed by the raw string rather than by the declared union, so a row whose area is
 * not one of the five declared documents still lands in the map and is therefore
 * still counted. Dropping it silently would understate the manifest by exactly the
 * rows nobody is looking at, and {@link renderManagedRegion} compares the rendered
 * total against the report's own to catch precisely that.
 */
function groupRowsByArea(
  rows: readonly ManifestRow[],
): ReadonlyMap<string, readonly ManifestRow[]> {
  const grouped = new Map<string, ManifestRow[]>();

  for (const row of rows) {
    const existing = grouped.get(row.areaKey);

    if (existing === undefined) {
      grouped.set(row.areaKey, [row]);
    } else {
      existing.push(row);
    }
  }

  return grouped;
}

/**
 * Renders the whole managed region, markers included.
 *
 * PURE AND DETERMINISTIC. The same report renders the same bytes on every machine.
 * No timestamp, no date, no hostname, no absolute path, no run identifier, no
 * elapsed time and no version string appears anywhere in the result — any one of them
 * would fail the pipeline's byte comparison on every run of every branch, and a check
 * that always fails is a check somebody eventually deletes.
 *
 * The areas are visited in the order the constants module declares them rather than
 * in the order the report happens to list them, so the section order is a property of
 * the declaration. Each area's rows are sorted by line here for the same reason.
 *
 * @param report The reconciliation the previous pass computed.
 * @returns The region from its opening marker to its closing marker, line endings LF
 *   throughout, ending in exactly one newline.
 * @throws EmitError If an area the constants module declares is missing from the
 *   report, if an area's row count disagrees with its own arithmetic, or if the rows
 *   rendered do not account for every row the report holds. Each is a contradiction
 *   between the table and the counts beside it rather than a fact about the project.
 * @throws BrandSafetyError If the rendered region matches a forbidden output shape.
 */
export function renderManagedRegion(report: ReconciliationReport): string {
  const grouped = groupRowsByArea(report.rows);
  const orderedAreas: AreaReconciliation[] = [];
  const areaSections: string[] = [];
  let renderedRows = 0;

  for (const entry of AREA_DOCUMENTS) {
    const area = report.areas.find((candidate) => candidate.areaKey === entry.areaKey);

    if (area === undefined) {
      throw new EmitError(
        `the report holds no arithmetic for declared area ${entry.areaKey}, so its section ` +
          'cannot be rendered',
      );
    }

    const rows = grouped.get(entry.areaKey) ?? [];

    orderedAreas.push(area);
    areaSections.push(...areaSectionLines(area, rows), BLANK);
    renderedRows += rows.length;
  }

  if (renderedRows !== report.rows.length) {
    throw new EmitError(
      `${renderedRows} of the report's ${report.rows.length} rows fall under a declared ` +
        'area, so the remainder would not be rendered at all',
    );
  }

  const region = [
    MANAGED_REGION_BEGIN,
    BLANK,
    ...noticeLines(),
    BLANK,
    ...gateFamilyLines(orderedAreas),
    BLANK,
    ...coverageLines(report),
    BLANK,
    ...areaSections,
    ...subtotalLines(report, orderedAreas),
    BLANK,
    ...regenerationLines(),
    BLANK,
    ...noFrameLines(report.rows),
    BLANK,
    MANAGED_REGION_END,
  ].join(LF);

  const rendered = `${region}${LF}`;

  // Asserted before the string leaves the function, so no caller can write or print
  // a region that was never checked. The manifest's own path is not one the
  // repository's brand guard allowlists, so a leak here would fail the brand stage
  // of the pipeline at a distance from its cause.
  assertBrandSafe(rendered);

  return rendered;
}

// ---------------------------------------------------------------------------
// SECTION 6 — Reading what is committed.
//
// Two representations of the same file are kept, and the distinction is the reason
// this module can be trusted with a record it does not own. `raw` is the bytes as
// they are on disk and is the only thing a write is ever built from. `body` is a
// line-ending-normalised COPY, used for comparison and for locating the region, and
// it is never written back. Normalising a carriage return the author put there and
// then saving the result would be reformatting a document this tool does not own —
// the same objection rule `R2` (corpus and specification handling) raises about the
// read-only inputs, and it applies here for the same reason.
// ---------------------------------------------------------------------------

/** Where the managed region sits inside a string, as half-open character indices. */
interface RegionSpan {
  /** Index of the opening marker's first character. */
  readonly beginIndex: number;
  /** Index one past the closing marker's last character. */
  readonly endIndex: number;
}

/** The committed manifest as it stands, or the fact that it does not. */
export interface CommittedManifest {
  /** Repository-relative path read. Never absolute: an absolute path would record
   * the layout of whichever machine last ran the tool, and this value reaches log
   * lines and error messages. */
  readonly path: string;
  /** Whether the file is present. */
  readonly exists: boolean;
  /** The file's bytes exactly as read. Empty when absent. The only basis for a write. */
  readonly raw: string;
  /** A line-ending-normalised copy, for comparison only. Empty when absent. */
  readonly body: string;
  /**
   * The managed region in the canonical form {@link renderManagedRegion} produces —
   * marker to marker, line feeds only, exactly one trailing newline — so it is
   * directly comparable with a freshly rendered one. `null` when the file carries no
   * markers.
   *
   * `null` rather than an absent property, so a consumer has to handle the absence
   * instead of reading `undefined` and comparing it against a string.
   */
  readonly region: string | null;
  /** Whether both markers are present and delimit one unambiguous span. */
  readonly hasMarkers: boolean;
}

/** Counts non-overlapping occurrences of a substring. */
function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let at = haystack.indexOf(needle);

  while (at !== -1) {
    count += 1;
    at = haystack.indexOf(needle, at + needle.length);
  }

  return count;
}

/** Folds carriage returns, whether paired with a line feed or alone. */
function normaliseLineEndings(text: string): string {
  return text.replace(/\r\n?/g, LF);
}

/** Removes exactly one trailing line feed, and never more than one. */
function stripOneTrailingNewline(text: string): string {
  return text.endsWith(LF) ? text.slice(0, -1) : text;
}

/**
 * Rewrites a region into the canonical form: line feeds only, exactly one trailing
 * newline. Used on both sides of a comparison so a difference of trailing whitespace
 * is never reported as a difference of content.
 */
function canonicaliseRegion(region: string): string {
  return `${normaliseLineEndings(region).replace(/\n+$/, BLANK)}${LF}`;
}

/** Bytes a string occupies once encoded, which is what a write actually costs. */
function utf8Length(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** A filesystem error's code, or `null` when the value carries no string code. */
function errorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error;

    return typeof code === 'string' ? code : null;
  }

  return null;
}

/**
 * Locates the managed region, or reports that there is none.
 *
 * THE THREE OUTCOMES ARE DELIBERATELY ASYMMETRIC, because they call for three
 * different responses.
 *
 * NEITHER MARKER — returns `null`. Not an error: it is the state of a file that
 * exists but has never been generated into, and the correct response is to add the
 * region without disturbing what is already there.
 *
 * EXACTLY ONE OF EACH, IN ORDER — returns the span. The only state in which a
 * replacement is safe.
 *
 * ANYTHING ELSE — throws. One marker without its partner, the closing marker before
 * the opening one, or either of them appearing twice: in every one of those the span
 * is undefined, and writing anyway risks overwriting authored prose, which is the one
 * outcome this whole arrangement exists to prevent. The record's own prose names the
 * first two of these as errors rather than as things to work around; the repeated
 * marker is the third state with the same defect, and it is treated the same way
 * rather than resolved by guessing which pair was meant.
 *
 * @throws EmitError If the markers cannot delimit one unambiguous span.
 */
function locateRegionSpan(text: string): RegionSpan | null {
  const beginCount = countOccurrences(text, MANAGED_REGION_BEGIN);
  const endCount = countOccurrences(text, MANAGED_REGION_END);

  if (beginCount === 0 && endCount === 0) {
    return null;
  }

  if (beginCount !== 1 || endCount !== 1) {
    throw new EmitError(
      `${MANIFEST_PATH} carries ${beginCount} opening and ${endCount} closing generated-region ` +
        'markers, so the span they delimit is undefined; exactly one of each is required, and ' +
        'nothing was written',
    );
  }

  const beginIndex = text.indexOf(MANAGED_REGION_BEGIN);
  const endIndex = text.indexOf(MANAGED_REGION_END);

  if (endIndex < beginIndex + MANAGED_REGION_BEGIN.length) {
    throw new EmitError(
      `the closing generated-region marker in ${MANIFEST_PATH} does not follow its opening ` +
        'marker, so the span they delimit is undefined, and nothing was written',
    );
  }

  return { beginIndex, endIndex: endIndex + MANAGED_REGION_END.length };
}

/**
 * Reads the committed manifest and extracts its managed region.
 *
 * A missing file is a result rather than a failure — it is the state of a tree the
 * manifest has never been generated into — so it returns with `exists` false instead
 * of throwing. Every other filesystem failure is a tool error: the tool cannot reach
 * an answer, which is a different thing from the project not being where it should
 * be, and the calling module maps the two onto different exit codes.
 *
 * @param repoRoot Absolute path of the repository root. Every path in the constants
 *   module is relative to it, and the working directory cannot be relied on because a
 *   filtered workspace invocation starts three levels down.
 * @returns The file's raw bytes, a normalised copy, and the canonicalised region.
 * @throws EmitError If the file exists but cannot be read, or if its markers cannot
 *   delimit one unambiguous span.
 */
export async function readCommittedRegion(repoRoot: string): Promise<CommittedManifest> {
  const absolutePath = resolve(repoRoot, MANIFEST_PATH);
  let raw: string;

  try {
    raw = await readFile(absolutePath, 'utf8');
  } catch (error) {
    if (errorCode(error) === 'ENOENT') {
      return {
        path: MANIFEST_PATH,
        exists: false,
        raw: BLANK,
        body: BLANK,
        region: null,
        hasMarkers: false,
      };
    }

    throw new EmitError(`${MANIFEST_PATH} exists but could not be read`, { cause: error });
  }

  const body = normaliseLineEndings(raw);
  // Located in the normalised copy because the region returned is the normalised
  // one. The write path locates the span again in the raw text, because an index
  // into a normalised copy is the wrong index into a file that carries carriage
  // returns, and a write must address the file rather than the copy.
  const span = locateRegionSpan(body);

  if (span === null) {
    return { path: MANIFEST_PATH, exists: true, raw, body, region: null, hasMarkers: false };
  }

  return {
    path: MANIFEST_PATH,
    exists: true,
    raw,
    body,
    region: canonicaliseRegion(body.slice(span.beginIndex, span.endIndex)),
    hasMarkers: true,
  };
}

// ---------------------------------------------------------------------------
// SECTION 7 — Writing, without destroying authored prose.
// ---------------------------------------------------------------------------

/** What a write did. */
export type WriteAction = 'created' | 'spliced' | 'appended' | 'unchanged';

/**
 * The outcome of a write.
 *
 * EVERY PROPERTY IS REQUIRED, and that is how this shape honours
 * `exactOptionalPropertyTypes`. Under that setting an optional property cannot be
 * assigned `undefined` explicitly, so a shape that models absence as an optional
 * property forces a consumer to distinguish "absent" from "present and undefined" —
 * a distinction with no meaning here. Absence is therefore modelled as a value a
 * consumer must read: zero bytes written for a run that wrote nothing, zero authored
 * bytes preserved for a file that did not previously exist. The reconcile pass models
 * a missing frame the same way for the same reason.
 */
export interface WriteOutcome {
  /** What the write did. */
  readonly action: WriteAction;
  /** Repository-relative path written, or that would have been written. */
  readonly path: string;
  /**
   * Whether this write introduced the markers.
   *
   * True for a created file and for an append into a file that carried none — the
   * append case is the one worth reporting, because the caller should say plainly
   * that a generated region has just been added to a document that did not have one.
   */
  readonly markersInserted: boolean;
  /** Bytes written. Zero when the content was already identical. */
  readonly bytesWritten: number;
  /**
   * Bytes of the file that were carried through untouched.
   *
   * The figure a reviewer checks a splice against: for a replacement it is
   * everything outside the region, and it must not fall when only the region's
   * content changes.
   */
  readonly authoredBytesPreserved: number;
}

/**
 * The minimal preamble written above the region when the file does not yet exist.
 *
 * A title and one sentence, deliberately no more. The manifest is a hand-authored
 * decision record whose rationale belongs to its author; a generator that wrote a
 * page of framing would be pre-empting that author's work and would leave them
 * deleting prose before writing their own. Neutral, brand-free and deterministic —
 * no date, no version, no path outside the repository.
 */
function createdPreambleLines(): readonly string[] {
  return [
    `# The acceptance-criteria manifest`,
    BLANK,
    ...wrapProse(
      `This record traces every criterion of the ${GATE_FAMILY_LABEL} family to the test that ` +
        `must prove it; the region below is generated by ${inlineCode('tools/ac-manifest')} and ` +
        `authored rationale belongs outside its markers.`,
    ),
  ];
}

/**
 * Refuses a region that is not in the canonical form.
 *
 * Called before anything is written, because a caller passing a malformed region is
 * the one way a splice could corrupt the file it is trying to maintain: a region
 * missing its closing marker would leave the file with an opening marker and no
 * partner, which is exactly the unrecoverable state {@link locateRegionSpan} refuses
 * to work with on the next run. Failing here keeps that state from ever reaching
 * disk.
 *
 * @throws EmitError If the region does not open and close with its markers, carries
 *   either marker twice, contains a carriage return, or does not end in exactly one
 *   line feed.
 */
function assertRegionWellFormed(region: string): void {
  if (!region.startsWith(MANAGED_REGION_BEGIN)) {
    throw new EmitError('the region supplied does not open with the generated-region marker');
  }

  if (!region.endsWith(`${MANAGED_REGION_END}${LF}`)) {
    throw new EmitError(
      'the region supplied does not close with the generated-region marker followed by ' +
        'exactly one line feed',
    );
  }

  if (
    countOccurrences(region, MANAGED_REGION_BEGIN) !== 1 ||
    countOccurrences(region, MANAGED_REGION_END) !== 1
  ) {
    throw new EmitError('the region supplied carries a repeated generated-region marker');
  }

  if (region.includes('\r')) {
    throw new EmitError(
      'the region supplied carries a carriage return; the region is written with line feeds only',
    );
  }
}

/** Creates the parent directory if needed, then writes the file as UTF-8. */
async function writeContent(absolutePath: string, content: string): Promise<void> {
  try {
    await mkdir(dirname(absolutePath), { recursive: true });
  } catch (error) {
    throw new EmitError(`the directory holding ${MANIFEST_PATH} could not be created`, {
      cause: error,
    });
  }

  try {
    await writeFile(absolutePath, content, { encoding: 'utf8' });
  } catch (error) {
    throw new EmitError(`${MANIFEST_PATH} could not be written`, { cause: error });
  }
}

/**
 * Writes the region into the manifest, preserving every authored byte around it.
 *
 * FOUR OUTCOMES, AND THE THIRD IS THE ONE THAT MATTERS MOST.
 *
 * `created` — the file did not exist. A minimal title and one sentence go above the
 * region so the file is not a bare table.
 *
 * `spliced` — the markers are present and delimit one span. Only that span is
 * replaced. The region's single trailing line feed is removed before substitution,
 * because the byte immediately after the closing marker already belongs to the
 * author: keeping it would insert a blank line on every run, and a write that
 * accretes whitespace is a write the pipeline's byte comparison would flag forever.
 *
 * `appended` — the file exists and carries no marker. The region is added at the end
 * and NOTHING is rewritten or truncated. The authored prose belongs to another author
 * and a generator that cleared a file in order to report on it would be destroying
 * the work it exists to serve. The outcome reports that markers were inserted, so the
 * caller can say plainly that a document has just acquired a generated region.
 *
 * `unchanged` — the content that would be written is already there byte for byte, so
 * nothing is written at all. Repeated runs therefore leave a clean working tree,
 * which is what lets the pipeline run the generator and the check in either order.
 *
 * @param repoRoot Absolute path of the repository root.
 * @param region A canonical region, normally from {@link renderManagedRegion}.
 * @returns What was done, and how much was preserved.
 * @throws EmitError If the region is malformed, if the file's markers cannot delimit
 *   one unambiguous span, or if the file cannot be created or written.
 * @throws BrandSafetyError If the region matches a forbidden output shape. Checked
 *   again here rather than trusted: this function is reachable with a region from any
 *   source, and the assertion is cheap next to a brand-stage failure in the pipeline.
 */
export async function writeManifest(repoRoot: string, region: string): Promise<WriteOutcome> {
  assertRegionWellFormed(region);
  assertBrandSafe(region);

  const absolutePath = resolve(repoRoot, MANIFEST_PATH);
  const committed = await readCommittedRegion(repoRoot);

  if (!committed.exists) {
    const content = `${createdPreambleLines().join(LF)}${LF}${LF}${region}`;
    await writeContent(absolutePath, content);

    return {
      action: 'created',
      path: MANIFEST_PATH,
      markersInserted: true,
      bytesWritten: utf8Length(content),
      authoredBytesPreserved: 0,
    };
  }

  const existing = committed.raw;
  // Located in the raw text rather than reused from the read: an index into a
  // normalised copy is the wrong index into a file carrying carriage returns, and a
  // splice addressed by the wrong index is how authored bytes get eaten.
  const span = locateRegionSpan(existing);

  let content: string;
  let action: WriteAction;
  let markersInserted: boolean;
  let authoredBytesPreserved: number;

  if (span === null) {
    // Exactly one blank line between what is there and what is added, whether or not
    // the existing content ends in a newline.
    const separator = existing.endsWith(LF) ? LF : `${LF}${LF}`;

    content = `${existing}${separator}${region}`;
    action = 'appended';
    markersInserted = true;
    authoredBytesPreserved = utf8Length(existing);
  } else {
    const before = existing.slice(0, span.beginIndex);
    const after = existing.slice(span.endIndex);

    content = `${before}${stripOneTrailingNewline(region)}${after}`;
    action = 'spliced';
    markersInserted = false;
    authoredBytesPreserved = utf8Length(before) + utf8Length(after);
  }

  if (content === existing) {
    return {
      action: 'unchanged',
      path: MANIFEST_PATH,
      markersInserted: false,
      bytesWritten: 0,
      authoredBytesPreserved,
    };
  }

  await writeContent(absolutePath, content);

  return {
    action,
    path: MANIFEST_PATH,
    markersInserted,
    bytesWritten: utf8Length(content),
    authoredBytesPreserved,
  };
}

// ---------------------------------------------------------------------------
// SECTION 8 — Reading a committed table back, tolerantly.
//
// WHY TOLERANCE IS THE REQUIREMENT HERE AND NOWHERE ELSE. The manifest is written
// from two directions: a person authoring the decision record, and this tool
// generating the region inside it. Which of the two lands first is an accident of
// scheduling, so a comparison that only understood this module's own layout would
// report every row as different for as long as the authored table was the one on
// disk — a red gate saying nothing about the project, on a branch where nothing is
// wrong. Parsing by column HEADING rather than by column POSITION is what makes the
// comparison survive either arrival order, and it costs nothing at all when both
// tables happen to agree.
//
// The parser is deliberately incapable of writing anything. It reads a table and
// returns identities.
// ---------------------------------------------------------------------------

/**
 * One row recovered from a committed manifest table.
 *
 * IDENTITIES ONLY, matching what the generated row contract carries: the document,
 * the line, the frames, the citing tests and the status. No prose is recovered even
 * where a committed table has a prose column, because nothing downstream compares
 * prose and reading it would carry excerpted document text into a comparison summary
 * — the one place a diagnostic gets printed by code that never looked at where its
 * text came from.
 */
export interface CommittedRow {
  /**
   * The area document the row belongs to, from the table's own document column where
   * it has one and from the nearest preceding heading otherwise.
   *
   * Empty when neither resolves. Empty rather than dropped: rule `R3` (uncertainty is
   * not permission to omit) requires an absence to be reported, and a row silently
   * discarded for being unattributable is the one a comparison would never mention.
   */
  readonly document: string;
  /** The criterion's 1-based line, with the citation form's prefix removed. */
  readonly line: number;
  /** Frames cited, as bare integers. Empty where the cell records none. */
  readonly frames: readonly number[];
  /** Repository-relative paths of the citing tests. Empty where the cell records none. */
  readonly targetTests: readonly string[];
  /** The status exactly as written, lower-cased and with decoration removed. */
  readonly status: string;
  /**
   * The same status in this tool's two-member vocabulary, or `null` when the written
   * value maps to neither.
   *
   * The mapping is the committed record's OWN published one rather than an invention
   * of this module: the record documents a three-member reporting vocabulary and
   * states how it corresponds to the two members a discovery pass can produce — a
   * not-started row is one nothing claims, and a failing or passing row is one a test
   * claims. Reading that mapping is what lets a table written in either vocabulary be
   * compared semantically instead of textually.
   *
   * `null` for anything else, so an unrecognised status is reported as unrecognised
   * rather than coerced into whichever member is closest.
   */
  readonly mappedStatus: Status | null;
}

/** Where each recognised column sits in a table's row, by index. */
interface ColumnPositions {
  /** Index of the criterion-line column. Required for a table to be a criterion table. */
  readonly line: number;
  /** Index of the status column. Also required. */
  readonly status: number;
  /** Index of the document column, or `null` when the table has none. */
  readonly document: number | null;
  /** Index of the frames column, or `null`. */
  readonly frames: number | null;
  /** Index of the citing-test column, or `null`. */
  readonly targetTest: number | null;
}

/** Column headings that name the criterion's line. */
const LINE_HEADINGS: readonly string[] = ['line', 'criterion line'];

/** Column headings that name the owning document. */
const DOCUMENT_HEADINGS: readonly string[] = ['source', 'document', 'area document', 'area'];

/** Column headings that name the cited frames. */
const FRAME_HEADINGS: readonly string[] = ['frame', 'frames'];

/** Column headings that name the citing tests. */
const TARGET_TEST_HEADINGS: readonly string[] = ['target test', 'target tests', 'test', 'tests'];

/** Column headings that name the status. Matched exactly, never by substring. */
const STATUS_HEADINGS: readonly string[] = ['status'];

/**
 * Cell values that record an absence.
 *
 * The three dash forms are here because a committed table may legitimately use one:
 * the authored record renders an em-dash where a criterion cites no frame. Treating a
 * dash as a frame number would invent evidence, and treating it as an unparsable cell
 * would drop the row.
 */
const ABSENT_CELL_MARKERS: readonly string[] = ['-', '–', '—'];

/** Stands in for a document a row could not be attributed to, in a summary. */
const UNRESOLVED_DOCUMENT = 'unattributed';

/**
 * The correspondence between a written status and this tool's vocabulary.
 *
 * Taken from the committed record's own published mapping. It is listed rather than
 * computed because it is a fact about another document's vocabulary, and because a
 * reader checking this module against that record needs the five cases side by side.
 */
const COMMITTED_STATUS_MAPPING = [
  { written: STATUS.cited, mapped: STATUS.cited },
  { written: STATUS.uncovered, mapped: STATUS.uncovered },
  { written: 'not started', mapped: STATUS.uncovered },
  { written: 'test failing', mapped: STATUS.cited },
  { written: 'test passing', mapped: STATUS.cited },
] as const;

/** Lower-cases a cell and removes Markdown decoration and repeated whitespace. */
function normaliseLabel(cell: string): string {
  return cell
    .replace(/[`*_]/g, BLANK)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, CELL_LINE_BREAK_REPLACEMENT);
}

/** Removes Markdown decoration from a cell while preserving its case. */
function stripDecoration(cell: string): string {
  return cell.replace(/[`*_]/g, BLANK).trim();
}

/** Maps a written status onto this tool's vocabulary, or reports that it maps to none. */
function mapCommittedStatus(written: string): Status | null {
  for (const entry of COMMITTED_STATUS_MAPPING) {
    if (entry.written === written) {
      return entry.mapped;
    }
  }

  return null;
}

/**
 * Splits a table row into cells, honouring an escaped cell boundary.
 *
 * The escape has to be honoured rather than ignored, because this module writes it:
 * a cell whose value contains a boundary is escaped on the way out, so a parser that
 * split on every boundary would read that one row as having an extra column and shift
 * every value in it.
 */
function splitTableRow(line: string): readonly string[] {
  let inner = line.trim();

  if (inner.startsWith(CELL_BOUNDARY)) {
    inner = inner.slice(1);
  }

  if (inner.endsWith(CELL_BOUNDARY) && !inner.endsWith(ESCAPED_CELL_BOUNDARY)) {
    inner = inner.slice(0, -1);
  }

  const cells: string[] = [];
  let current = BLANK;
  let index = 0;

  while (index < inner.length) {
    const character = inner[index];

    if (character === undefined) {
      break;
    }

    if (character === '\\' && inner[index + 1] === CELL_BOUNDARY) {
      current += CELL_BOUNDARY;
      index += 2;
      continue;
    }

    if (character === CELL_BOUNDARY) {
      cells.push(current.trim());
      current = BLANK;
      index += 1;
      continue;
    }

    current += character;
    index += 1;
  }

  cells.push(current.trim());

  return cells;
}

/** Whether a split row is a table's delimiter row rather than a data row. */
function isDelimiterRow(cells: readonly string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-+:?$/.test(cell));
}

/**
 * Reads a header row into column positions, or reports that the table is not a
 * criterion table.
 *
 * A LINE COLUMN AND A STATUS COLUMN ARE BOTH REQUIRED, and that pair is what makes
 * this safe to run over a whole document. The manifest carries several other tables —
 * a grand total, a vocabulary mapping, a coverage-target comparison, and this
 * module's own reconciliation table — and none of them has both. Requiring both, and
 * matching headings exactly rather than by substring, is what keeps their rows out of
 * the comparison: a mapping table whose second column is headed with the word status
 * inside a longer phrase is not matched, which is the intended outcome.
 */
function mapColumns(headerCells: readonly string[]): ColumnPositions | null {
  let line: number | null = null;
  let status: number | null = null;
  let document: number | null = null;
  let frames: number | null = null;
  let targetTest: number | null = null;

  for (const [index, cell] of headerCells.entries()) {
    const heading = normaliseLabel(cell);

    if (line === null && LINE_HEADINGS.includes(heading)) {
      line = index;
    } else if (status === null && STATUS_HEADINGS.includes(heading)) {
      status = index;
    } else if (document === null && DOCUMENT_HEADINGS.includes(heading)) {
      document = index;
    } else if (frames === null && FRAME_HEADINGS.includes(heading)) {
      frames = index;
    } else if (targetTest === null && TARGET_TEST_HEADINGS.includes(heading)) {
      targetTest = index;
    }
  }

  if (line === null || status === null) {
    return null;
  }

  return { line, status, document, frames, targetTest };
}

/** The basename of an area document named in a heading line, or `null`. */
function documentFromHeadingLine(line: string): string | null {
  if (!line.startsWith('#')) {
    return null;
  }

  for (const entry of AREA_DOCUMENTS) {
    if (line.includes(entry.basename)) {
      return entry.basename;
    }
  }

  return null;
}

/** Parses a line cell, tolerating the citation form's prefix and decoration. */
function parseLineCell(cell: string): number | null {
  const text = stripDecoration(cell).replace(/^[Ll]/, BLANK);

  if (!/^\d+$/.test(text)) {
    return null;
  }

  const value = Number.parseInt(text, 10);

  return value > 0 ? value : null;
}

/**
 * Parses a frames cell into bare integers.
 *
 * Split on every run of non-digits rather than on a specific separator, because the
 * separator is presentation: a comma here, a middle dot in a ledger line, whitespace
 * in a hand-written row. The digits are the fact.
 */
function parseFramesCell(cell: string): readonly number[] {
  const text = stripDecoration(cell);

  if (
    text.length === 0 ||
    ABSENT_CELL_MARKERS.includes(text) ||
    text.toLowerCase() === NO_FRAME_CITED
  ) {
    return [];
  }

  const frames: number[] = [];

  for (const piece of text.split(/\D+/)) {
    if (piece.length === 0) {
      continue;
    }

    frames.push(Number.parseInt(piece, 10));
  }

  return frames;
}

/** Parses a citing-test cell into repository-relative paths. */
function parseTargetTestCell(cell: string): readonly string[] {
  const text = stripDecoration(cell);

  if (
    text.length === 0 ||
    ABSENT_CELL_MARKERS.includes(text) ||
    text.toLowerCase() === NO_TARGET_TEST
  ) {
    return [];
  }

  return text
    .split(',')
    .map((piece) => stripDecoration(piece))
    .filter((piece) => piece.length > 0);
}

/** Builds one recovered row, or reports that the cells are not a criterion row. */
function buildCommittedRow(
  cells: readonly string[],
  columns: ColumnPositions,
  fallbackDocument: string,
): CommittedRow | null {
  const lineText = cells[columns.line];

  if (lineText === undefined) {
    return null;
  }

  const line = parseLineCell(lineText);

  if (line === null) {
    return null;
  }

  const statusText = cells[columns.status];
  const status = statusText === undefined ? BLANK : normaliseLabel(statusText);

  const documentText = columns.document === null ? undefined : cells[columns.document];
  const named = documentText === undefined ? BLANK : stripDecoration(documentText);
  const document = named.length > 0 ? named : fallbackDocument;

  const framesText = columns.frames === null ? undefined : cells[columns.frames];
  const targetText = columns.targetTest === null ? undefined : cells[columns.targetTest];

  return {
    document,
    line,
    frames: framesText === undefined ? [] : parseFramesCell(framesText),
    targetTests: targetText === undefined ? [] : parseTargetTestCell(targetText),
    status,
    mappedStatus: mapCommittedStatus(status),
  };
}

/**
 * Recovers the row identities from any manifest text, in either table layout.
 *
 * THE FALLBACK THAT KEEPS THE PIPELINE HONEST. When the committed file carries no
 * markers there is no region to compare, and a check that simply failed at that point
 * would report a formatting fact as a traceability failure. Parsing the tables loosely
 * lets the comparison still be made on meaning: the same 241 identities, whichever
 * layout and whichever status vocabulary they were written in.
 *
 * @param body Any manifest text — a whole file, or just a region.
 * @returns One entry per recovered criterion row, in document order as encountered.
 */
export function extractCommittedRows(body: string): readonly CommittedRow[] {
  const lines = normaliseLineEndings(body).split(LF);
  const rows: CommittedRow[] = [];
  let currentDocument = BLANK;
  // Three states: looking for a header, holding one, or inside a table that is not a
  // criterion table. The third state matters — without it every data row of an
  // unrelated table would be retried as a candidate header.
  let table: ColumnPositions | 'seeking' | 'skipping' = 'seeking';

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line.startsWith(CELL_BOUNDARY)) {
      table = 'seeking';

      const heading = documentFromHeadingLine(line);

      if (heading !== null) {
        currentDocument = heading;
      }

      continue;
    }

    const cells = splitTableRow(line);

    if (isDelimiterRow(cells)) {
      continue;
    }

    if (table === 'skipping') {
      continue;
    }

    if (table === 'seeking') {
      table = mapColumns(cells) ?? 'skipping';
      continue;
    }

    const row = buildCommittedRow(cells, table, currentDocument);

    if (row !== null) {
      rows.push(row);
    }
  }

  return rows;
}

// ---------------------------------------------------------------------------
// SECTION 9 — Comparing what would be written against what is committed.
// ---------------------------------------------------------------------------

/** How a row differs between the rendered region and the committed one. */
export type DifferenceKind = 'added' | 'removed' | 'changed';

/** One differing row, identified by document and line and nothing else. */
export interface RegionDifference {
  /** Whether the row is new, gone, or present with different values. */
  readonly kind: DifferenceKind;
  /** The owning document's basename, or the unattributed placeholder. */
  readonly document: string;
  /** The criterion's 1-based line. */
  readonly line: number;
}

/** A bounded account of how a rendered region differs from the committed one. */
export interface RegionComparison {
  /** Whether the two are byte-identical once canonicalised. */
  readonly identical: boolean;
  /** Whether a committed region was supplied at all. */
  readonly committedPresent: boolean;
  /**
   * How many row identities differ. Exact, never capped.
   *
   * Zero alongside `identical` false means the rows agree and the difference is in the
   * region's prose, headings or table layout — a real difference, and one worth
   * distinguishing, because it calls for regenerating rather than for writing a test.
   */
  readonly differingRowCount: number;
  /** Up to a handful of differing rows, in document and line order. */
  readonly examples: readonly RegionDifference[];
  /** How many differing rows the examples do not name. */
  readonly undisclosedDifferences: number;
  /** One brand-safe line, short enough to print. */
  readonly summary: string;
}

/** Orders strings by code unit, so ordering never depends on a locale. */
function compareByCodeUnit(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

/** Joins a document and a line into the one key rows are matched on. */
function comparisonKey(document: string, line: number): string {
  return `${document}${COMPARISON_KEY_SEPARATOR}${line}`;
}

/**
 * A row's comparable content: frames, citing tests and mapped status.
 *
 * The MAPPED status is compared rather than the written one, so a committed table
 * using the record's reporting vocabulary and a rendered table using this tool's do
 * not report every row as changed. Where a status maps to neither member the written
 * form is compared instead, which is the honest fallback: an unrecognised value is
 * compared as itself rather than treated as equal to everything.
 */
function rowContent(row: CommittedRow): string {
  return [
    row.frames.join(LIST_SEPARATOR),
    row.targetTests.join(LIST_SEPARATOR),
    row.mappedStatus ?? row.status,
  ].join(CELL_BOUNDARY);
}

/** Indexes rows by their comparison key, keeping the first of any duplicate. */
function indexRows(rows: readonly CommittedRow[]): ReadonlyMap<string, CommittedRow> {
  const index = new Map<string, CommittedRow>();

  for (const row of rows) {
    const key = comparisonKey(row.document, row.line);

    if (!index.has(key)) {
      index.set(key, row);
    }
  }

  return index;
}

/** Renders one difference for a summary line. Never carries document text. */
function describeDifference(difference: RegionDifference): string {
  const document = difference.document.length === 0 ? UNRESOLVED_DOCUMENT : difference.document;

  return `${difference.kind} ${document} ${LINE_LABEL_PREFIX}${difference.line}`;
}

/** Assembles the one-line summary and refuses it if it carries a forbidden shape. */
function buildSummary(pieces: readonly (string | null)[]): string {
  const summary = pieces.filter((piece): piece is string => piece !== null).join('; ');

  // Every diagnostic is asserted before it is returned, not only the region. A
  // summary is printed to a terminal and captured in pipeline logs, so it leaves the
  // process by a different route from the file and needs the same check.
  assertBrandSafe(summary);

  return summary;
}

/**
 * Compares a freshly rendered region against the committed one.
 *
 * BOUNDED BY DESIGN. The count of differing rows is exact; the examples are capped.
 * A whole-file difference printed to a terminal is scrolled past rather than read, so
 * an unbounded report is a less useful report and not a more thorough one — and it is
 * also the shape most likely to carry text nobody inspected into a log. Every example
 * is identified by document and line alone, which are an integer and a basename, so
 * there is nothing in a summary that could carry identity.
 *
 * The comparison is textual first and semantic second. Byte equality is the common
 * case and answers immediately; when the bytes differ, the rows are compared on
 * meaning, so a committed table in the record's own reporting vocabulary is not
 * reported as 241 differences.
 *
 * @param fresh The region {@link renderManagedRegion} produced.
 * @param committed The committed region, or `null` when the file carries no markers.
 * @returns A bounded, brand-safe account of the difference.
 * @throws BrandSafetyError If the summary would carry a forbidden output shape, which
 *   would mean a document basename or a test path did.
 */
export function compareRegion(fresh: string, committed: string | null): RegionComparison {
  const freshRows = extractCommittedRows(fresh);

  if (committed === null) {
    const examples = freshRows
      .slice(0, MAX_DIFFERENCE_EXAMPLES)
      .map((row): RegionDifference => ({ kind: 'added', document: row.document, line: row.line }));

    return {
      identical: false,
      committedPresent: false,
      differingRowCount: freshRows.length,
      examples,
      undisclosedDifferences: freshRows.length - examples.length,
      summary: buildSummary([
        `no generated region is committed, so every one of the ${freshRows.length} rendered ` +
          'rows is new',
        `run ${REGENERATE_COMMAND} to write it`,
      ]),
    };
  }

  const canonicalFresh = canonicaliseRegion(fresh);
  const canonicalCommitted = canonicaliseRegion(committed);

  if (canonicalFresh === canonicalCommitted) {
    return {
      identical: true,
      committedPresent: true,
      differingRowCount: 0,
      examples: [],
      undisclosedDifferences: 0,
      summary: buildSummary([
        'the committed region matches the rendered region byte for byte',
        `${freshRows.length} rows compared`,
      ]),
    };
  }

  const freshIndex = indexRows(freshRows);
  const committedIndex = indexRows(extractCommittedRows(canonicalCommitted));
  const differences: RegionDifference[] = [];

  for (const [key, row] of freshIndex) {
    const other = committedIndex.get(key);

    if (other === undefined) {
      differences.push({ kind: 'added', document: row.document, line: row.line });
    } else if (rowContent(row) !== rowContent(other)) {
      differences.push({ kind: 'changed', document: row.document, line: row.line });
    }
  }

  for (const [key, row] of committedIndex) {
    if (!freshIndex.has(key)) {
      differences.push({ kind: 'removed', document: row.document, line: row.line });
    }
  }

  // Sorted so the examples named are a property of the content rather than of the
  // order two maps happened to be iterated in. Code-unit ordering, never a locale's.
  differences.sort((left, right) => {
    const byDocument = compareByCodeUnit(left.document, right.document);

    if (byDocument !== 0) {
      return byDocument;
    }

    if (left.line !== right.line) {
      return left.line - right.line;
    }

    return compareByCodeUnit(left.kind, right.kind);
  });

  const examples = differences.slice(0, MAX_DIFFERENCE_EXAMPLES);
  const undisclosed = differences.length - examples.length;

  const headline =
    differences.length === 0
      ? 'the committed and rendered regions hold the same rows but differ in the prose, ' +
        'headings or table layout around them'
      : `${differences.length} row ${
          differences.length === 1 ? 'identity differs' : 'identities differ'
        } between the committed and rendered regions`;

  return {
    identical: false,
    committedPresent: true,
    differingRowCount: differences.length,
    examples,
    undisclosedDifferences: undisclosed,
    summary: buildSummary([
      headline,
      examples.length === 0
        ? null
        : examples.map((one) => describeDifference(one)).join(LIST_SEPARATOR),
      undisclosed === 0 ? null : `${undisclosed} further not listed`,
      `run ${REGENERATE_COMMAND} to bring the committed region up to date`,
    ]),
  };
}
