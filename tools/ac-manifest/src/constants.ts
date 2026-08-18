/**
 * The operating table for the acceptance-criteria manifest generator.
 *
 * WHAT THIS WORKSPACE DOES
 *
 * `@relay/ac-manifest` regenerates the traceability spine of the run in four
 * passes:
 *
 *   1. PARSE   — read the five Phase-1 area documents and extract every
 *                acceptance criterion, with its 1-based line number.
 *   2. DISCOVER— walk the test tree and collect every `// AC:` citation.
 *   3. EMIT    — render `docs/decisions/ac-manifest.md`.
 *   4. RECONCILE — assert the per-area subtotals and the run total, and exit
 *                non-zero on any mismatch.
 *
 * It is invoked as `node dist/index.js` and, in the pipeline's non-writing
 * gating mode, as `node dist/index.js --check`.
 *
 * HOW THE PROJECT RULES ARE CITED BELOW
 *
 * The five binding project rules are referenced throughout these comments by
 * their requirement label and subject — `R1` authorization is server-side only,
 * `R2` corpus and specification handling, `R3` uncertainty is not permission to
 * omit, `R4` third-party identity exclusion, `R5` shared components implemented
 * once. Their own identifiers are deliberately not written out, because each of
 * those identifiers is prefixed with the very third-party product name that `R4`
 * forbids in source, comments and tests alike. Spelling a rule's name in order to
 * obey it would break it, and the repository's brand guard would fail this file in
 * the pipeline for doing so — this path is not one of the five read-only paths the
 * guard allowlists. The subject is always given alongside the label because the
 * rules are supplied in an order that does not match their labels, so an ordinal
 * on its own would point at the wrong constraint.
 *
 * WHY THIS FILE EXISTS SEPARATELY FROM THE FOUR PASSES
 *
 * Project rule `R3` (uncertainty is not permission to omit) requires that a value
 * be defined once and consumed everywhere by reference, and forbids restating it
 * as a literal at a point of use. This module is that single definition for the
 * whole workspace: `parse.ts`, `discover.ts`, `reconcile.ts`, `emit.ts` and
 * `index.ts` import from here and declare no operating value of their own. A
 * heading string, a pattern, a path, an exit code or an expected count written
 * directly into one of those files is a defect even when it happens to be correct,
 * because a second copy is how the manifest and the gate quietly stop agreeing.
 *
 * WHY NOTHING HERE IS ENVIRONMENT-OVERRIDABLE — a deliberate divergence
 *
 * That same rule also says an uncertain value must be an *environment-overridable*
 * configuration constant. That clause governs product defaults inferred from a
 * single frame: an expiry, a window, a threshold whose true value is a hypothesis
 * and which an operator may legitimately need to change. Nothing in this file is
 * of that kind. The expected subtotals, the closed document list and the recorded
 * line numbers are measured structural facts about read-only input files, and
 * they are the very thing the reconciliation gate compares against. Making them
 * overridable would hand an operator an environment variable that silences the
 * gate this rule exists to enforce — the opposite of the rule's purpose. They are
 * therefore non-overridable compile-time constants, which mirrors the project's
 * split between invariants and configurable defaults: an invariant is named once
 * and never weakened by the environment, a default is named once and may be.
 *
 * `AREA_DOCUMENTS` IS A CLOSED SET — NEVER A GLOB, NEVER A DIRECTORY SCAN
 *
 * The five entries below are enumerated by hand and must stay that way. The
 * reason is specific and load-bearing rather than a matter of taste.
 *
 * All 23 area documents in `docs/workflows/` carry the *identical*
 * `## Build acceptance criteria` heading — not a similar one, the same one. So
 * detecting the heading tells a parser nothing about whether the document is in
 * scope for this phase. Beyond the five documents here:
 *
 *   - the 18 deferred area documents carry 840 further criteria between them;
 *   - `docs/workflows/README.md` carries 51 checklist items of its own, the
 *     catalog gates, in four runs at lines 478–489, 495–504, 510–519 and
 *     525–543, under its `## Prioritized build backlog` heading rather than
 *     under a criteria heading at all.
 *
 * A glob over `docs/workflows/*.md` would therefore absorb 891 extra items in
 * silence, and the run total would read 1,132 where it must read 241. Heading
 * detection provides no protection whatsoever against that; only this list does.
 * The README case is the more insidious of the two, because its items are not
 * even under the heading a scanner would look for — a "find the criteria
 * sections" strategy misses them and a "find the checklist items" strategy
 * swallows them.
 *
 * The corollary matters when a later phase begins: bringing a deferred area into
 * scope means adding its entry here, with its own measured counts, and updating
 * `EXPECTED_TOTAL`. It never means relaxing this list into a pattern.
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT CONTAIN
 *
 *   - No import of any kind. The workspace has zero runtime dependencies and its
 *     compiler configuration declares no project reference, so this module is
 *     pure data and pure factory functions. That is also what keeps it safe to
 *     import from every one of the four passes without an ordering concern.
 *   - No path under the frame corpus, and no frame-number-to-path resolution.
 *     This tool opens no capture file; its only contact with a frame is the
 *     integer parsed out of a citation *label*. Project rule `R2` (corpus and
 *     specification handling) forbids surveying the corpus, and the cheapest way
 *     to honour that is to give the tool no way to address it.
 *   - No third-party product name, in any form, anywhere. Every pattern here is
 *     brand-free by construction rather than by review.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// SECTION 1 — The closed document set, and the counts it is measured against.
// ---------------------------------------------------------------------------

/**
 * The five Phase-1 area documents, their join keys, and their measured counts.
 *
 * Each entry carries a `verified` block recording where the criteria section
 * begins and ends and which lines hold its first and last criterion. Those four
 * numbers are not used to *find* the criteria — `parse.ts` locates the section
 * by heading and terminator and reads the items inside it, so the parser works
 * on any well-formed document. They are recorded so that a parse which drifts
 * can be diagnosed precisely instead of merely failing a total: a wrong count
 * plus a wrong terminator line names the H3-versus-H2 bug immediately, whereas a
 * wrong count on its own could be any of a dozen things.
 *
 * Every figure was measured against the read-only catalog and re-measured before
 * being written here. The documents are read-only inputs, so these numbers are
 * stable by construction; if one of them ever stops matching, the input changed
 * in a way the project rules forbid, and that is a finding rather than a reason
 * to edit this table. The terminating heading is `## Frames covered` in all five
 * documents, which is a coincidence of how the catalog is laid out rather than a
 * rule — so the parser matches on the heading *level*, never on that text.
 *
 * `basename` is the join key. A test citation names the document by basename and
 * the criterion by line — never by `areaKey` and never by path — so the basename
 * is what `discover.ts` matches against and `areaKey` exists only for grouping
 * and reporting.
 *
 * Read-only, and deliberately a tuple rather than an array: the length is part of
 * the contract, and `as const` is what makes every string here a literal type,
 * so `AreaKey` and `AreaBasename` below are exact unions instead of `string`.
 */
export const AREA_DOCUMENTS = [
  {
    areaKey: '00',
    path: 'docs/workflows/00-product-overview.md',
    basename: '00-product-overview.md',
    expectedCriteria: 39,
    verified: {
      headingLine: 883,
      terminatorLine: 927,
      firstCriterionLine: 887,
      lastCriterionLine: 925,
    },
  },
  {
    areaKey: '01',
    path: 'docs/workflows/01-onboarding-and-auth.md',
    basename: '01-onboarding-and-auth.md',
    expectedCriteria: 46,
    verified: {
      headingLine: 884,
      terminatorLine: 935,
      firstCriterionLine: 888,
      lastCriterionLine: 933,
    },
  },
  {
    areaKey: '02',
    path: 'docs/workflows/02-channels.md',
    basename: '02-channels.md',
    expectedCriteria: 61,
    verified: {
      headingLine: 977,
      terminatorLine: 1048,
      firstCriterionLine: 981,
      lastCriterionLine: 1046,
    },
  },
  {
    areaKey: '03',
    path: 'docs/workflows/03-messaging-and-composer.md',
    basename: '03-messaging-and-composer.md',
    expectedCriteria: 57,
    verified: {
      headingLine: 743,
      terminatorLine: 810,
      firstCriterionLine: 747,
      lastCriterionLine: 808,
    },
  },
  {
    areaKey: '21',
    path: 'docs/workflows/21-states.md',
    basename: '21-states.md',
    expectedCriteria: 38,
    verified: {
      headingLine: 549,
      terminatorLine: 592,
      firstCriterionLine: 553,
      lastCriterionLine: 590,
    },
  },
] as const;

/** One entry of the closed document set. */
export type AreaDocument = (typeof AREA_DOCUMENTS)[number];

/** The five area keys, used for grouping and for the per-area report line. */
export type AreaKey = AreaDocument['areaKey'];

/**
 * The five document basenames.
 *
 * This is half of the citation join key, which is why it is a named type: a
 * function that joins a citation to a criterion should say so in its signature
 * rather than accepting any `string`.
 */
export type AreaBasename = AreaDocument['basename'];

/** The recorded section geometry of one document, for diagnostics on drift. */
export type AreaVerification = AreaDocument['verified'];

/**
 * The run total for the one gate family this tool reports.
 *
 * 39 + 46 + 61 + 57 + 38 = 241.
 *
 * Written as a literal for readability at the point a reader wants it, and
 * deliberately not derived here. `reconcile.ts` asserts that the sum of the five
 * `expectedCriteria` values equals this number, so the literal is checked rather
 * than trusted: an edit that changes one subtotal and forgets the total fails the
 * gate instead of shipping a manifest whose arithmetic does not close.
 */
export const EXPECTED_TOTAL = 241;

// ---------------------------------------------------------------------------
// SECTION 2 — Parsing the criteria section out of an area document.
// ---------------------------------------------------------------------------

/**
 * The heading that opens the criteria section, matched as an exact trimmed line.
 *
 * Exact rather than a prefix or a case-insensitive comparison, because the
 * catalog writes this heading identically in all 23 area documents and an
 * approximate match would only ever loosen a constraint that is already precise.
 */
export const CRITERIA_HEADING = '## Build acceptance criteria';

/**
 * The prefix that ends the criteria section: the next second-level heading.
 *
 * THE TERMINATOR MUST BE AN H2 SPECIFICALLY. Two of the five documents place a
 * third-level heading *inside* the criteria section, grouping the security and
 * per-viewer criteria under a sub-heading:
 *
 *   - `02-channels.md` line 1035 — `### Authorization, content safety and
 *     per-member state`
 *   - `03-messaging-and-composer.md` line 794 — `### Content safety,
 *     authorization and per-viewer state`
 *
 * A parser that stops at the next heading of any level therefore reports 53
 * criteria for `02-channels.md` instead of 61, and 46 for
 * `03-messaging-and-composer.md` instead of 57. Those two numbers are the exact
 * regression this constant prevents, and they are worth stating because the bug
 * is silent in the other three documents: `00`, `01` and `21` carry no H3 inside
 * their sections, so an any-level parser gets those three right and looks
 * correct. It would fail only on the two longest documents, and it would fail by
 * under-reporting — which reads as "these criteria have no tests" rather than as
 * a parser fault.
 *
 * The trailing space is load-bearing and must not be trimmed away. Because a
 * third-level heading's third character is `#` rather than a space,
 * `'### Authorization…'.startsWith('## ')` is already `false`. The space alone
 * makes the prefix H2-specific, so no separate H3 exclusion is needed — but drop
 * it and the check silently starts matching every deeper heading too, restoring
 * exactly the 53-and-46 regression above.
 */
export const H2_PREFIX = '## ';

/**
 * A fresh pattern matching one GitHub-flavoured checklist item.
 *
 * The pattern is more tolerant than the corpus requires, and knowing the
 * difference matters. Across all five documents there are zero indented
 * checklist items and zero items written as `- [x]`: every one of the 241
 * criteria begins at column 0 as `- [ ] `. The leading `\s*` and the `[ xX]`
 * character class are therefore deliberate future-proofing rather than a
 * response to anything present, and they reproduce exactly the same counts
 * today — 39, 46, 61, 57 and 38.
 *
 * The consequence of "zero checked items" is the important one, and it is a
 * conclusion about the whole tool rather than about this pattern: nothing about a
 * criterion's status can be inherited from its source checkbox, because every
 * source checkbox is unchecked. Status has to come from the test suite, which is
 * what `discover.ts` is for and why {@link STATUS} has no `satisfied` member.
 *
 * Returned from a factory for consistency with the global patterns below, so
 * that every pattern in this module is obtained the same way and no caller has
 * to know which ones carry state.
 */
export function checklistItemPattern(): RegExp {
  return /^\s*- \[[ xX]\] /;
}

/**
 * A fresh global pattern extracting cited frame numbers from a criterion line.
 *
 * This is the ONLY correct frame extractor, for three reasons.
 *
 * (i) THE NUMBER COMES FROM THE LABEL, NEVER FROM THE URL. A citation is a
 *     Markdown link whose label reads `frame N`. The label is the assertion; the
 *     target is merely where the evidence happens to sit. Reading the label also
 *     keeps this tool clear of the corpus entirely, which is what project rule
 *     `R2` (corpus and specification handling) requires — the tool never needs to
 *     know that a capture file exists, let alone what it is called.
 *
 * (ii) FILENAME-DERIVED PARSING IS ARITHMETICALLY WRONG, not merely prohibited.
 *      The citation targets are percent-encoded, so the separator before the
 *      trailing number contributes its own digits. A naive `(\d+)\.png$` capture
 *      returns 2069 for `[frame 69]` and 2097 for `[frame 97]` — the `20` of the
 *      encoded separator is glued onto the front of the number — and a four-digit
 *      year sits earlier in the same path to catch anything that tries to be
 *      cleverer about it. Both examples are real and both appear on
 *      `02-channels.md` line 982. So even an agent willing to ignore the rule
 *      would get wrong answers.
 *
 * (iii) NO URL-VERSUS-LABEL CROSS-CHECK MAY BE ATTEMPTED. It is tempting to
 *       validate one against the other. Measured across the 241 criteria there
 *       are 574 frame citations, and because of (ii) a cross-check reports a
 *       mismatch on every single one of them: 574 false mismatches, no true ones.
 *       A check whose every finding is false is worse than no check, because
 *       someone will eventually "fix" the labels to satisfy it.
 *
 * Global, and therefore a factory: a module-level global pattern carries a
 * mutable `lastIndex` between calls, and a pattern reused across files or across
 * lines then resumes mid-string and misses citations intermittently. That failure
 * is order-dependent and reproduces badly, so the pattern is never shared.
 *
 * Capture group 1 is the frame number as written, as a string; the caller parses
 * it. Frame numbers are corroborating evidence and never part of a key.
 */
export function frameCitationPattern(): RegExp {
  return /\[frame (\d+)\]/g;
}

/**
 * A fresh global pattern matching any Markdown inline link.
 *
 * USED ONLY FOR STRIPPING LINK TARGETS before a criterion's prose is excerpted
 * into the manifest. It is never a frame extractor, and the distinction is not
 * pedantic: the criteria carry 12 links that are not frame citations at all but
 * cross-references to other catalog documents, with labels such as
 * `00-product-overview.md`, `21-states.md` and `15-admin-workspace.md`. A
 * "match any Markdown link and read the number" extractor would treat those as
 * frames, so it is provably wrong on this input rather than merely risky.
 *
 * The reverse mistake is just as available: the words "frame" and "frames" also
 * occur 6 times as ordinary prose inside criteria, outside any link, so a
 * text-proximity search for the word is wrong in the other direction. Frames come
 * from {@link frameCitationPattern} and from nothing else.
 *
 * Stripping targets while keeping labels is what makes an excerpt safe to render.
 * Measured across the 241 criteria, 239 raw lines contain a third-party product
 * name inside a citation target, and 0 still contain one once targets are
 * removed. Stripping is therefore not a tidiness pass but the step that keeps the
 * emitted manifest free of identity that must not appear in it.
 *
 * Capture group 1 is the label, group 2 the target. Both classes are negated
 * character classes rather than lazy wildcards, so a line carrying several links
 * yields one match per link instead of one spanning match.
 */
export function markdownLinkPattern(): RegExp {
  return /\[([^\]]*)\]\(([^)]*)\)/g;
}

/**
 * Rendered in the manifest's frame column when a criterion cites no frame.
 *
 * An explicit phrase rather than an empty cell, because an empty cell reads as
 * "not yet filled in" and this absence is a finding in its own right.
 *
 * Exactly two of the 241 criteria carry no citation:
 *
 *   - `00-product-overview.md` line 915 — the criterion requiring all sixteen
 *     `S-*` security contracts be implemented once and applied uniformly, with
 *     every area document's own security criteria resolving to them by
 *     identifier;
 *   - `03-messaging-and-composer.md` line 801 — the criterion requiring
 *     match-term highlighting to encode both the term and the body before
 *     inserting highlight markup.
 *
 * Both are security-contract criteria, and the absence is correct and permanent
 * rather than an oversight to be repaired: the corpus is a set of static captures
 * of one session, so it is structurally incapable of evidencing an encoding
 * boundary or a uniformly applied contract. There is no frame to cite because
 * there could not be one.
 *
 * The practical consequence is a trap worth naming. An implementation that treats
 * a frame as required per row drops precisely these two, and then reports
 * subtotals of 38 for `00-product-overview.md` and 56 for
 * `03-messaging-and-composer.md`. Both are off by one, both look plausible, and
 * the two criteria lost are the two most consequential in the set.
 */
export const NO_FRAME_CITED = 'no frame cited';

// ---------------------------------------------------------------------------
// SECTION 3 — The citation form, and where citations are discovered.
// ---------------------------------------------------------------------------

/**
 * The opening of a test's criterion citation.
 *
 * The full mandated form is the prefix, the document basename, the criterion's
 * 1-based line number prefixed `L`, and — where the criterion cites a frame —
 * the separator followed by `frame` and the number:
 *
 *     // AC: 02-channels.md L982 · frame 69
 *
 * That example is real rather than illustrative. Line 982 of `02-channels.md` is
 * the channel-name criterion — lower case, no spaces or periods, a cap of eighty
 * characters, and a remaining-character counter that reads eighty against an
 * empty field — and 69 is the first of the two frames it cites.
 */
export const CITATION_PREFIX = '// AC: ';

/**
 * The separator between the line reference and the frame reference.
 *
 * U+00B7 MIDDLE DOT with exactly one space on each side, written literally in
 * this UTF-8 source so that the mandated form is reproduced character for
 * character. It is deliberately not an ASCII substitute: a hyphen, a bullet or a
 * full stop would each read as the wrong character in a form that is specified
 * exactly, and the middle dot is what a reviewer comparing a test against the
 * specification will be looking for.
 */
export const CITATION_SEPARATOR = ' · ';

/**
 * A fresh global pattern recognising a well-formed criterion citation.
 *
 * THE JOIN KEY IS (DOCUMENT BASENAME, 1-BASED LINE NUMBER). The frame reference
 * is corroborating evidence and must never enter the key. The reason is
 * arithmetic: 178 of the 241 criteria cite more than one frame, so a key that
 * included a frame would either fail to join a test that cited the second frame
 * rather than the first, or would demand that a test enumerate every frame its
 * criterion mentions. Basename and line identify a criterion uniquely; nothing
 * else is needed and nothing else is admitted.
 *
 * The trailing ` · frame N` group is optional, which it has to be — two criteria
 * cite no frame at all (see {@link NO_FRAME_CITED}), so a pattern requiring the
 * tail could never match a citation of either of them.
 *
 * Tolerances are deliberate and bounded. Extra spaces or tabs are accepted after
 * the comment marker, after the colon, around the separator and before the frame
 * number, because a formatter may legitimately produce them. `L` stays
 * upper-case and the words stay lower-case, so a citation that departs from the
 * form in any other way falls through to {@link nearMissCitationPattern} and is
 * reported rather than silently ignored.
 *
 * The character classes are `[ \t]` rather than `\s` throughout, because `\s`
 * matches a newline: with `\s` a pattern run against a whole file could match
 * across a line boundary and attribute a citation to the wrong line. As written,
 * a match can never span more than one line, so the same pattern is correct
 * whether the caller feeds it one line or an entire file.
 *
 * Global, and therefore a factory, for the `lastIndex` reason given on
 * {@link frameCitationPattern}.
 *
 * Capture group 1 is the document basename, group 2 the criterion line number,
 * group 3 the optional frame number. The basename is matched generally rather
 * than against the five known names on purpose: a citation naming a deferred
 * document is a real mistake that should be reported as an unknown document, and
 * a pattern that simply failed to match it would report the mistake as silence.
 */
export function testCitationPattern(): RegExp {
  return /\/\/[ \t]*AC:[ \t]*([\w.-]+\.md)[ \t]+L(\d+)(?:[ \t]*·[ \t]*frame[ \t]+(\d+))?/g;
}

/**
 * A fresh global pattern matching any citation-shaped comment, however malformed.
 *
 * This exists so that a citation which fails the strict form is reported as a
 * NEAR MISS rather than disappearing. Without it the two failures are
 * indistinguishable from the outside: a criterion with no test and a criterion
 * whose test cites it with a lower-case `l`, a missing `.md`, an ASCII separator
 * or a transposed line number both render as "uncovered". The first needs a test
 * written; the second needs one character changed. Conflating them wastes the
 * reader's time in exactly the place the manifest is supposed to save it.
 *
 * It matches `// AC` followed by the remainder of the line, so a report can quote
 * the offending comment verbatim next to the form it should have taken. The
 * `\b` keeps it from matching an unrelated identifier that merely begins with
 * those letters, and `[^\n]*` bounds the match to a single line for the same
 * reason the strict pattern uses `[ \t]`.
 *
 * Every match of the strict pattern is also a match of this one, so `discover.ts`
 * must test the strict form first and treat only the remainder as near misses.
 */
export function nearMissCitationPattern(): RegExp {
  return /\/\/[ \t]*AC\b[^\n]*/g;
}

/**
 * The directory roots walked for citations, relative to the repository root.
 *
 * Each root is here because a mandated family of tests lives under it, and two of
 * them are required by a project rule rather than chosen:
 *
 *   - `apps/api/test` — rule `R1` (authorization is server-side only) requires
 *     every mutation and every projection to ship with a test proving a non-member
 *     and a wrong-role caller are denied server-side, and that a private resource
 *     is absent from every projection. Those suites live under
 *     `integration/authz`, `integration/tenancy` and `integration/projections`
 *     here. Omit this root and the rule's own mandated tests would read as
 *     uncovered — the manifest would report the security suite missing while it
 *     sat on disk passing.
 *   - `packages/ui/src/components` — rule `R5` (shared components implemented
 *     once) requires each `C-*` contract to be implemented exactly once in the
 *     shared library, and each contract module carries its test beside its
 *     implementation. A criterion satisfied by a component test is only joined if
 *     this root is walked.
 *   - `packages/db/test` — the workspace-isolation proofs, which are the data-layer
 *     half of the same isolation requirement.
 *   - `e2e/specs` — the end-to-end suites, including the multi-client realtime
 *     specification that no single-client test can stand in for.
 *
 * Note what is absent: no root reaches the read-only inputs, and none reaches a
 * source tree that holds no tests. The walk is deliberately narrow, because a
 * broader walk is how a scan of the corpus starts.
 */
export const DISCOVERY_ROOTS = [
  'apps/api/test',
  'packages/ui/src/components',
  'packages/db/test',
  'e2e/specs',
] as const;

/**
 * Individual files walked for citations, relative to the repository root.
 *
 * The accessibility suite is a single specification beside the end-to-end
 * directory rather than inside it, so it needs naming explicitly. It carries the
 * criteria for the four conformance requirements automated scanning cannot judge,
 * which are exactly the ones most easily lost — so a root list that quietly
 * failed to reach it would under-report the least visible part of the suite.
 */
export const DISCOVERY_FILES = ['e2e/a11y.spec.ts'] as const;

/**
 * File extensions the walker reads.
 *
 * Both TypeScript forms, because a component test is `.tsx` while an integration
 * test is `.ts`. Nothing else is read: a citation lives in a test, and a test in
 * this workspace is always one of these two.
 */
export const DISCOVERY_EXTENSIONS = ['.ts', '.tsx'] as const;

/**
 * Directory names the walker skips wherever it meets them.
 *
 * Dependencies, build output and test artifacts. These hold no authored citation
 * and reading them would be slow enough to look like a hang — `node_modules`
 * alone is larger than the entire authored tree. `dist` deserves specific
 * mention: it holds compiled copies of the very files being walked, so failing to
 * skip it would double-count every citation in this workspace's own output.
 */
export const SKIPPED_DIRECTORY_NAMES = [
  'node_modules',
  'dist',
  '.git',
  '.turbo',
  'coverage',
  'playwright-report',
  'test-results',
] as const;

/**
 * Directory names the walker must REFUSE to descend into, unconditionally.
 *
 * A defensive deny-list rather than an optimisation, and the distinction is the
 * point. None of these three is reachable from {@link DISCOVERY_ROOTS} today, so
 * on the current tree this list changes nothing. It exists so that the obligation
 * not to survey the corpus is mechanical rather than a property of the root list
 * happening to stay correct.
 *
 * Two ways it stops being correct without anyone intending it: a symbolic link
 * inside a walked root that points at one of these trees, and a future edit that
 * widens a root. In either case the walker refuses at the directory name, so the
 * frame corpus, the read-only catalog and the vendor documentation folder cannot
 * be entered even by accident.
 *
 * The refusal must be a hard stop and not a skip. A skip is a decision the walker
 * makes about performance; a refusal is the enforcement of rule `R2` (corpus and
 * specification handling), and treating it as the former is how the latter erodes.
 */
export const FORBIDDEN_TRAVERSAL_NAMES = ['screenshots', 'docs', 'blitzy'] as const;

/** A directory root walked for citations. */
export type DiscoveryRoot = (typeof DISCOVERY_ROOTS)[number];

/** An individually named file walked for citations. */
export type DiscoveryFile = (typeof DISCOVERY_FILES)[number];

/** An extension the walker reads. */
export type DiscoveryExtension = (typeof DISCOVERY_EXTENSIONS)[number];

// ---------------------------------------------------------------------------
// SECTION 4 — Output, status vocabulary, reporting and safety.
// ---------------------------------------------------------------------------

/**
 * The one file this tool writes, relative to the repository root.
 *
 * A decision record, which is the only location rule `R2` (corpus and
 * specification handling) permits a new document to be created. The tool writes
 * here and nowhere else — not to the five area documents it reads, not to the test
 * files it walks, and not to either of the two records named below.
 */
export const MANIFEST_PATH = 'docs/decisions/ac-manifest.md';

/**
 * The defect register, named in failure messages and NEVER WRITTEN BY THIS TOOL.
 *
 * When a subtotal fails to reconcile, the tool's job is to fail loudly and point
 * at where the discrepancy gets recorded. It is emphatically not to adjust a count
 * until the arithmetic closes, nor to correct the catalog: rule `R2` (corpus and
 * specification handling) requires a defect in a read-only input to be recorded and
 * worked around under the stated precedence order, and prohibits correcting the
 * specification in place. Naming the register in the failure message is how the
 * tool routes a human to the permitted remedy instead of leaving them to invent one.
 */
export const DEFECT_REGISTER_PATH = 'docs/decisions/catalog-defects.md';

/**
 * The gate ledger, referenced in the emitted preamble.
 *
 * The manifest and the ledger must tell the same story about status, and the
 * preamble says so with a link, so a reader who arrives at one is told the other
 * exists. The ledger is read by people rather than by this tool, and this tool
 * does not write it.
 */
export const GATE_LEDGER_PATH = 'docs/decisions/phase-gates-ledger.md';

/**
 * Opening marker of the region this tool owns inside {@link MANIFEST_PATH}.
 *
 * The manifest is a hand-authored decision record as well as a generated table:
 * its rationale, its regeneration note and its reconciliation commentary are
 * written by a person, and only the criterion table between these two markers is
 * generated. So the emitter replaces the span between the markers and must leave
 * every byte outside it untouched.
 *
 * The marker names this workspace so that a reader who finds it knows what
 * rewrites the region, and it is an HTML comment so it renders as nothing in the
 * documentation site.
 *
 * Two failure modes the emitter must treat as errors rather than working around:
 * a file that carries neither marker, and a file that carries the end marker
 * before the begin marker. In both cases the safe span is undefined, and writing
 * anyway risks destroying authored prose — which is the one outcome this whole
 * arrangement exists to prevent.
 */
export const MANAGED_REGION_BEGIN = '<!-- BEGIN GENERATED: tools/ac-manifest -->';

/** Closing marker of the generated region. See {@link MANAGED_REGION_BEGIN}. */
export const MANAGED_REGION_END = '<!-- END GENERATED: tools/ac-manifest -->';

/**
 * The complete status vocabulary for a criterion row. Exactly two members.
 *
 * A `satisfied` member — or `passing`, or `verified`, or any synonym — IS
 * DELIBERATELY ABSENT, and adding one would be a defect rather than an
 * improvement. This tool reads no test results. It parses documents and it reads
 * comments; it never runs a test, inspects a report or learns an outcome. It
 * therefore has no authority to mark a criterion satisfied, and rule `R3`
 * (uncertainty is not permission to omit) states the constraint directly: an
 * acceptance criterion may not be marked satisfied without a passing test behind
 * it.
 *
 * So the two members mean precisely this and nothing more:
 *
 *   - `cited`     — a test somewhere CLAIMS this criterion. That is a claim about
 *                   intent, discovered from a comment. It is not evidence the test
 *                   exercises the criterion, and it is not evidence the test
 *                   passes.
 *   - `uncovered` — no test claims this criterion at all.
 *
 * The vocabulary is kept this narrow on purpose. A three-member vocabulary would
 * invite a future edit to populate the third member from something convenient —
 * the presence of an assertion, a green pipeline, a coverage figure — and each of
 * those is a proxy for a passing test rather than a passing test. Two members
 * leave nowhere for that to happen.
 */
export const STATUS = {
  cited: 'cited',
  uncovered: 'uncovered',
} as const;

/** The status of one criterion row: `'cited'` or `'uncovered'`. */
export type Status = (typeof STATUS)[keyof typeof STATUS];

/**
 * The name of the single gate family this tool reports.
 *
 * This tool reports ONE family: the 241 Phase-1 area criteria, split 39 / 46 / 61
 * / 57 / 38 across the five documents. The other families in the run — 11 Phase-0
 * authored gates, 12 Phase-1 catalog gates, 3 Phase-1 authored gates and 11
 * standing gates — belong to {@link GATE_LEDGER_PATH} and are tracked there.
 *
 * THEY MUST NEVER BE SUMMED INTO THIS ONE. The families are disjoint sets counting
 * different kinds of thing, so a combined figure is not a more convenient summary
 * of the same fact — it is a number that answers no question. It would also
 * conceal exactly what a reader needs: a family at full coverage cannot make up
 * for a family that is short, and a merged total lets it appear to. Labelling this
 * family explicitly in the emitted report is what keeps its figure from being
 * mistaken for a run total.
 */
export const GATE_FAMILY_LABEL = 'Phase 1 area criteria';

/**
 * Process exit codes, with the two failure kinds held apart.
 *
 * The distinction is what makes the pipeline's `--check` mode useful. A gate
 * failure is the tool working correctly and reporting that the project is not
 * where it should be: a subtotal that does not reconcile, a criterion with no
 * citation. A tool error is the tool unable to reach an answer at all: an area
 * document missing, a criteria heading absent, a managed region it cannot locate.
 * Collapsing both into 1 would make a broken tool indistinguishable from an
 * honest red gate, and the two demand opposite responses — fix the project, or
 * fix the tool.
 */
export const EXIT_CODES = {
  ok: 0,
  gateFailure: 1,
  toolError: 2,
} as const;

/** A process exit code this tool may terminate with. */
export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

/**
 * Structural needles asserted against every rendered output, log line and error
 * message before it leaves the process.
 *
 * WHY THE CHECK IS STRUCTURAL RATHER THAN A LITERAL TOKEN COMPARISON. The thing
 * actually being kept out of the output is a third-party product name. The obvious
 * check — search the output for that name — cannot be written here, because
 * writing the name into authored source in order to search for it would itself
 * violate rule `R4` (third-party identity exclusion). So the check tests for the
 * *shapes* the name always travels in instead of for the name, and it is effective
 * for a measured reason rather than a hopeful one: every corpus filename embeds that
 * name, and every corpus reference in the catalog is a percent-encoded relative
 * path to one of those files. Catch the shape and the name comes with it.
 *
 * Each needle is one of those shapes:
 *
 *   - `screenshots` — the corpus directory name. No output of this tool has any
 *     business naming it, since the tool never addresses a capture file.
 *   - `.png`        — the capture extension, which only appears as part of a
 *     filename this tool must never reproduce.
 *   - `%2`          — the leading fragment of the percent-encoded separators that
 *     every citation target is built from. It is the cheapest single marker of a
 *     leaked target, and it also catches the encoded forms of several other
 *     characters.
 *   - `](../..`     — a relative Markdown link climbing out of the catalog
 *     directory, which is the exact prefix every citation target opens with.
 *
 * WHY THIS IS MORE THAN BELT-AND-BRACES. Measured across the 241 criteria, 239 of
 * the raw lines carry a third-party product name inside a citation target, while 0
 * still carry one once link targets are stripped. So the input this tool reads is
 * saturated with the thing that must not be emitted, and stripping targets before
 * excerpting any prose (see {@link markdownLinkPattern}) is what makes the output
 * clean. These needles are the assertion that the stripping actually happened —
 * the difference between a safe pipeline and one that is safe as long as nobody
 * refactors it.
 *
 * The consequence of a leak is concrete: {@link MANIFEST_PATH} is not one of the
 * paths the repository's brand guard allowlists, so a single leaked target fails
 * the brand stage of the pipeline. Failing here instead, at the moment the string
 * is produced and with the criterion in hand, is far cheaper to diagnose.
 *
 * These four strings appear in this file only as this deny-list — never as a path,
 * a pattern input or a rendered value — which is the one place a deny-list has to
 * spell out what it denies. None of them is a third-party product name, so naming
 * them here is exactly what rule `R4` (third-party identity exclusion) permits and
 * requires.
 */
export const FORBIDDEN_OUTPUT_NEEDLES = ['screenshots', '.png', '%2', '](../..'] as const;

/**
 * The file whose presence identifies the repository root.
 *
 * Every path in this module is relative to the repository root, so `index.ts`
 * walks upward from its own location until it finds this marker and resolves
 * against the directory that holds it. The working directory cannot be relied on:
 * the root script runs with the repository root as its working directory, while
 * running the tool directly inside `tools/ac-manifest` — which is what a
 * `pnpm --filter` invocation does — starts three levels down. Resolving against a
 * discovered root makes both correct.
 *
 * The workspace manifest is the right marker rather than the root `package.json`,
 * because every workspace in the tree carries a `package.json` and only the root
 * carries this file. An upward walk keyed to `package.json` would stop at the
 * first workspace it met, which for this tool is the wrong directory and, worse,
 * a directory that looks plausible.
 */
export const REPO_ROOT_MARKER = 'pnpm-workspace.yaml';
