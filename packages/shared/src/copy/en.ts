/**
 * Authored microcopy — every string this product renders, in one module.
 *
 * This file is the single home for the interface's words. That is not tidiness:
 * it is the mechanism that makes `PROJECT_RULE_R4` verifiable rather than
 * aspirational. The source frames this product was specified from depict a third
 * party's application, complete with their marks and their product copy, and the
 * rule forbids reproducing any of it — including strings legible in a frame.
 * Centralising every word gives the brand guard at `tools/check-brand/` one
 * high-value file to police instead of three hundred, and gives a reviewer one
 * place to check. A string literal a person can read does not belong anywhere
 * else in the tree.
 *
 * Nothing here was transcribed. The catalogue under `docs/workflows/` describes
 * what a third-party surface communicates; that description is a BEHAVIOURAL
 * SPECIFICATION and never text to copy. Where the catalogue says a report
 * "states that something went wrong and invites a retry", the sentence below
 * does those two things in this product's own words.
 *
 * ---------------------------------------------------------------------------
 * HOW THE PROJECT RULES ARE CITED, AND WHY NOT BY THEIR OWN IDENTIFIERS
 * ---------------------------------------------------------------------------
 *
 * Five binding project rules govern this work, cited throughout by requirement
 * label: `PROJECT_RULE_R1` (authorization is server-side only),
 * `PROJECT_RULE_R2` (corpus and specification handling), `PROJECT_RULE_R3`
 * (uncertainty is never permission to omit), `PROJECT_RULE_R4` (third-party
 * identity exclusion) and `PROJECT_RULE_R5` (a shared contract is implemented
 * exactly once). Their own identifiers are deliberately not written anywhere in
 * this repository's source, because each embeds the third-party product name
 * that R4 forbids in source and in comments. The labels are permuted relative to
 * those identifiers, so the label is the thing to trust; the authoritative
 * wording lives in the rules interface.
 *
 * ---------------------------------------------------------------------------
 * FOUR PROPERTIES OF THIS MODULE THAT ARE ARCHITECTURE RATHER THAN STYLE
 * ---------------------------------------------------------------------------
 *
 * 1. NO IMPORT, OF ANYTHING. Not a package, not a platform built-in, not a
 *    sibling module in this workspace. `@relay/shared` is consumed by a server
 *    runtime, by a browser bundle and by an end-to-end runner, and its manifest
 *    deliberately declares no framework dependency of any kind. One stray import
 *    here would leak a dependency into three runtimes at once. The module is
 *    therefore expressed entirely in the language: declarations and pure
 *    functions.
 *
 * 2. NO CONFIGURATION VALUE IS BAKED INTO A SENTENCE. `PROJECT_RULE_R3` forbids
 *    substituting a hardcoded literal at a point of use, and a sentence IS a
 *    point of use. So `./../config/constants.ts` and `./../config/env.ts` are
 *    named here as GOVERNING REFERENCES and are deliberately NOT imported: every
 *    value-bearing string below is a pure template function that takes the value
 *    as a typed parameter and the caller supplies it.
 *
 *    The reason is not symmetry. An invitation's expiry must render from the
 *    absolute timestamp stored on THAT invitation's own record, never from
 *    today's configured default — the catalogue's own bearer-credential
 *    limitation is precisely a build that "renders every surface from that stored
 *    value rather than from copy" (`docs/workflows/README.md`, known limitation
 *    6). A sentence that closed over a module-load constant could not express
 *    that, and changing the default would silently rewrite the history of every
 *    credential already issued.
 *
 * 3. SIDE-EFFECT FREE. The package manifest declares `"sideEffects": false`, so
 *    a bundler is entitled to drop any part of this module a build does not
 *    reach. Only declarations and pure functions appear below; nothing at the top
 *    level does anything.
 *
 * 4. TEXT ONLY, NEVER PRESENTATION. No markup, no emphasis marker, no colour
 *    value, no class name, no inline style, no image and no path into the frame
 *    corpus. Where the catalogue records a word as emphasised, the emphasis is a
 *    rendering decision belonging to `packages/ui`, and the sentence here carries
 *    the words alone. `PROJECT_RULE_R5` puts presentation in exactly one place
 *    and this is not it. A colour value in particular exists in exactly one file
 *    in this repository, `packages/ui/src/styles/tokens.ts`.
 *
 * ---------------------------------------------------------------------------
 * CITATION DISCIPLINE
 * ---------------------------------------------------------------------------
 *
 * A frame is cited BY NUMBER ALONE — `frame 199` — and never by filename, never
 * by an encoded form and never by a path. Every filename in the corpus embeds the
 * prohibited token, and the corpus may not be renamed, so the catalogue's own
 * citation form is a reviewed exception FOR THE CATALOGUE and is not an exception
 * for authored source. The brand guard reports the encoded form as its own
 * violation category for exactly this reason.
 *
 * Zero frames were opened to author this module, and none could legitimately have
 * been: `PROJECT_RULE_R2`'s conflict clause gives a frame authority over the
 * catalogue EXCEPT for colour values, icon artwork and PRODUCT COPY. Product copy
 * is the whole of this file's subject, so a frame can settle nothing in it.
 *
 * Where a string is authored with no evidence behind it, the comment says so and
 * names the marker position that made it an open work item, pointing at
 * `docs/decisions/gap-register.md` for the options, the choice and the reasoning.
 * The comment cites; the record reasons. Nothing here claims an acceptance
 * criterion is satisfied — no test covers this module directly, and satisfaction
 * is proven by the contract tests in `packages/ui` and the specifications in
 * `e2e/` that consume these strings.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DELIBERATELY ABSENT
 * ---------------------------------------------------------------------------
 *
 * - Any third-party product, company or application name. An application is
 *   referred to functionally — the built-in assistant app, a cloud-drive app, a
 *   poll app, a standup app, a calendar app, a conferencing app — and iconography
 *   by function, following `docs/workflows/00-product-overview.md` L309.
 * - Any plan-tier name. A commercial tier is referred to by placeholder, which
 *   the catalogue's substitution table fixes at L616 to L630 of the same document
 *   and names as one of the three things a build is most likely to get wrong.
 * - Any sample entity name from the corpus. The channel, person and role names
 *   visible in the frames illustrate shape only. Where an example is genuinely
 *   needed — an example address in a field's placeholder, an example channel name
 *   in helper copy — it is authored for this product.
 * - Any key binding. Bindings are function rather than identity and MAY be
 *   transcribed, but they live in `docs/decisions/keyboard-shortcuts.md` and are
 *   declared in `packages/ui/src/keyboard/registry.ts`; this module holds the
 *   reference pane's title, its group captions and its authored action labels,
 *   and not one combination.
 * - Any authorization decision. This is a string table. No sentence below is an
 *   enforcement point, and `PROJECT_RULE_R1` puts every check on the server at
 *   the point of execution.
 */

/* -------------------------------------------------------------------------- */
/* PURE HELPERS                                                               */
/*                                                                            */
/* Module-private, declaration-only, and used by the templates below. They are  */
/* not exported: a consumer that needs to phrase something needs a template     */
/* from this module, not a phrasing primitive to build one with at a call site. */
/* -------------------------------------------------------------------------- */

/**
 * Chooses between a singular and a plural wording for a count.
 *
 * Every countdown and every count in this module goes through this, because
 * `PROJECT_RULE_R3` requires both forms wherever a value varies: the catalogue
 * records one trial countdown taking four different values across captures of the
 * same offer (`docs/workflows/21-states.md` L449), which is the evidence that no
 * observed value may be written down and that a template reading "1 days" is a
 * defect rather than a rounding.
 *
 * Negative one is treated as singular alongside one so that a template fed an
 * overrun — a limit already exceeded by one — still reads correctly rather than
 * producing a grammatical error at the moment the interface is reporting a
 * problem.
 */
const pluralise = (count: number, singular: string, plural: string): string =>
  count === 1 || count === -1 ? singular : plural;

/** Stands in for a count that is not a usable number. */
const UNKNOWN_QUANTITY = 'an unknown number of';

/** Stands in for a date that is not a usable instant. */
const UNKNOWN_DATE = 'a date we could not read';

/**
 * The month names this module spells a date with.
 *
 * Authored here rather than taken from the platform's date formatter, for the same
 * reason `countText` avoids it: a sentence must not differ between the two
 * runtimes that render it, and the formatter's output depends on which locale
 * data the host was built with.
 */
const MONTH_NAMES: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Renders a count as text.
 *
 * Deliberately not locale-aware. This module is the English dictionary; a
 * locale-sensitive grouping separator is a property of a locale and belongs to
 * the module that serves that locale, and reaching for the platform's formatter
 * here would make the same sentence differ between a server render and a browser
 * render of the same data.
 *
 * A non-finite count renders as an authored phrase rather than as the platform's
 * own spelling of infinity or of a non-number, because those two spellings are
 * developer diagnostics and this module produces sentences a person reads.
 */
const countText = (count: number): string =>
  Number.isFinite(count) ? String(Math.trunc(count)) : UNKNOWN_QUANTITY;

/**
 * Spells an absolute instant, or passes an already-spelled one through.
 *
 * Two input shapes, and the distinction is the contract rather than a
 * convenience. A caller that knows the viewer's time zone — which this module
 * cannot — formats the instant itself and passes the result as a string, and it
 * is used verbatim. A caller that has only the instant passes the instant, and it
 * is spelled from the host's own calendar fields.
 *
 * Records store absolute timestamps rather than durations, which
 * `PROJECT_RULE_R3` requires so that a configured default can change without
 * invalidating what is already stored. This helper is where such a timestamp
 * becomes a sentence, and it never converts one back into a duration.
 *
 * An unusable value yields an authored phrase instead of a thrown error. A copy
 * function that throws takes a whole surface down over a malformed date, and a
 * surface that cannot state a date is still obliged to state everything else.
 */
const spellInstant = (value: Date | string): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? UNKNOWN_DATE : trimmed;
  }

  const elapsed = value.getTime();
  if (!Number.isFinite(elapsed)) {
    return UNKNOWN_DATE;
  }

  // `getMonth` is specified to answer between zero and eleven for a usable
  // instant, so the guard below is unreachable for one. It is not decoration: an
  // unusable instant answers with a non-number, and the compiler cannot know that
  // the earlier check has already excluded that case for this expression.
  const monthName = MONTH_NAMES[value.getMonth()];
  if (monthName === undefined) {
    return UNKNOWN_DATE;
  }

  return `${countText(value.getDate())} ${monthName} ${countText(value.getFullYear())}`;
};

/* -------------------------------------------------------------------------- */
/* THE STATE VOCABULARIES, AS TYPES                                           */
/*                                                                            */
/* Each union below is closed and is exported, so a consumer can be exhaustive  */
/* over it and a missing member is a compile error rather than a dead control.  */
/* The counts are not arbitrary: every one of them is fixed by                  */
/* `docs/decisions/state-matrix.md`, which is the authority for the shapes, and  */
/* by `docs/decisions/placeholder-surfaces.md` for the sixteen destinations.     */
/* -------------------------------------------------------------------------- */

/**
 * The sixteen deferred rail destinations, each of which resolves to a defined
 * placeholder surface so that no control in the shipped shell is dead.
 *
 * Exported as a closed union so `apps/web/src/routes/placeholders/` can switch
 * exhaustively over it. Adding a seventeenth destination without its copy then
 * fails to compile, which is the only mechanism that keeps the shell's promise
 * that every destination resolves.
 */
export type PlaceholderSurfaceKey =
  | 'threads'
  | 'directMessages'
  | 'huddles'
  | 'canvases'
  | 'lists'
  | 'search'
  | 'workflowBuilder'
  | 'apps'
  | 'activity'
  | 'people'
  | 'preferences'
  | 'files'
  | 'externalConnections'
  | 'adminConsole'
  | 'plan'
  | 'help';

/**
 * The four loading shapes.
 *
 * They are not interchangeable, and the specification says so in its own words:
 * a build that implements one of them cannot reproduce the other three
 * (`docs/workflows/21-states.md` L215). Each replaces something different and
 * preserves something different — a control's label, one row's status word, a
 * block's content, a region's rows — so each is announced differently and each
 * needs its own words. One shared waiting sentence cannot serve four
 * granularities.
 *
 * There is deliberately no fifth member for a whole-surface overlay. No frame in
 * the corpus shows one (`docs/workflows/21-states.md` L475) and
 * `docs/decisions/state-matrix.md` turns that absence into a prohibition, so this
 * module supplies no wording that would imply one.
 */
export type LoadingShape = 'inPlaceControl' | 'rowStatus' | 'blockPlaceholder' | 'regionSkeleton';

/**
 * The four empty compositions.
 *
 * The illustration slot, the action, the inline link and the numbered step list
 * are each independently optional, so the text-only composition is a shape a
 * dense surface uses rather than a degraded variant of the illustrated one
 * (`docs/workflows/21-states.md` L226 to L240).
 */
export type EmptyStateShape =
  'illustratedWithAction' | 'illustratedNoAction' | 'illustratedInstructional' | 'textOnly';

/**
 * The five failure presentations.
 *
 * Two rules bind every string in `failureCopy` regardless of which of these it
 * belongs to: a failure never leaves a person without a next move, and the next
 * move is always specific. None of them states a cause, and none carries a status
 * code, an exception name or a correlation identifier — the one page-level failure
 * the corpus does contain states that the cause is unknown and carries no code at
 * all (`docs/workflows/21-states.md` L469).
 */
export type FailurePresentation =
  'transientReport' | 'rowResult' | 'dialogCallout' | 'regionFootBand' | 'pageCard';

/**
 * The six field-validation presentations.
 *
 * Six because three independent axes are settled independently and never
 * uniformly: where the message goes, whether the rejected value survives, and
 * whether the primary action is gated (`docs/workflows/21-states.md` L255).
 * Presentations two, three and five leave the primary filled and actionable while
 * a field is invalid; one and six gate it; four has no submit control at all. A
 * component that always gates, or always retains, collapses six into one.
 */
export type ValidationPresentation =
  | 'fieldWithConflictPreview'
  | 'perFieldAcrossSeveral'
  | 'formLevelCallout'
  | 'groupBlockValueCleared'
  | 'fieldPairSingleMessage'
  | 'modalBlock';

/**
 * The two read-only presentations.
 *
 * Both dock a status bar at the foot of the region they affect and both name an
 * exit (`docs/workflows/21-states.md` L280). A third instance of the same state
 * exists in the corpus — a template opened for reading — and is deliberately not a
 * third presentation, so a build meeting it does not mint a fourth thing.
 */
export type ReadOnlyPresentation = 'archivedConversation' | 'readOnlyDocument';

/**
 * The four gating kinds, held distinct.
 *
 * Taken from `docs/decisions/state-matrix.md`, which is the authority and which
 * enumerates them as device-or-browser permission, role, entitlement and
 * precondition. They look similar and they mean different things: merging any two
 * produces a build that communicates the wrong cause to the person looking at it.
 *
 * The pair most often merged by accident is role and precondition, and they render
 * oppositely. Role gating leaves the control in its ordinary rendering and explains
 * itself in words; precondition gating changes the control's treatment and says
 * nothing in words at all. Rendering a role-gated control as disabled tells someone
 * their own input is incomplete, which is false; rendering an unmet precondition as
 * an enclosure tells them they lack standing, which is also false.
 */
export type GatingKind = 'devicePermission' | 'role' | 'entitlement' | 'precondition';

/**
 * The four transient-outcome variants (`docs/workflows/21-states.md` L306 to L318).
 *
 * Only the reversible confirmation carries a control, and that control is an undo
 * link. Undo is a property of the action being reversible rather than of the report,
 * and two of the four carry no control at all. None of them carries a dismissal
 * affordance: no frame shows one being dismissed by a person, and none of the four
 * observed variants has anything that could have done it (L479).
 */
export type ToastVariant =
  'confirmation' | 'reversibleConfirmation' | 'failure' | 'publicSurfaceConfirmation';

/**
 * The nine connection and availability families the corpus never showed.
 *
 * All nine ship as working behaviour, because `PROJECT_RULE_R3` makes absent
 * evidence an open work item rather than permission to omit. The enumeration is
 * `docs/decisions/gap-register.md`'s, which splits not-found into a missing
 * resource inside a working surface and a missing surface — a distinction the
 * observed page-level failure argues for rather than against, since it names an
 * unknown cause instead of a missing resource.
 *
 * Every family's wording below is AUTHORED and marked as such, with its marker
 * position cited. The whole of the related evidence is two near-misses: a retry
 * invitation inside a transient failure report as plain sentence text (frame 199)
 * and a diagnostics popover summarising a connection as stable (frame 271).
 */
export type ConnectionStateKey =
  | 'offline'
  | 'disconnected'
  | 'reconnecting'
  | 'retrying'
  | 'rateLimited'
  | 'quotaExceeded'
  | 'throttled'
  | 'notFoundResource'
  | 'notFoundRoute';

/**
 * The five service-health levels.
 *
 * A separate vocabulary from the nine families above, and separate for a reason
 * worth stating: the corpus's own legend names five levels and only one of them is
 * ever observed applied to a row, the other four appearing in the legend alone
 * (`docs/workflows/21-states.md` L473). The legend is the corpus's own enumeration
 * of the vocabulary, so all five are implemented and four are rendered from data
 * there is no captured example of.
 */
export type ServiceHealthLevel = 'operational' | 'maintenance' | 'notice' | 'incident' | 'outage';

/**
 * The five account types, whose display labels this module owns.
 *
 * `docs/decisions/role-matrix.md` owns what each type may do; this module owns
 * only what each is called. The guest is one type in two forms — a scope of
 * exactly one channel, and a scope of more than one — and the two forms differ in
 * how large the scope may be rather than in what may be done inside one, so they
 * share a label here and are distinguished by `guestScopeLabels`.
 */
export type RoleKey = 'owner' | 'admin' | 'member' | 'guest' | 'externalCollaborator';

/**
 * The five keyboard-reference groups.
 *
 * `docs/decisions/keyboard-shortcuts.md` fixes five groups over forty-eight rows,
 * and the captions are this build's own: the rule permits transcribing a binding
 * and forbids transcribing the caption above it.
 */
export type KeyboardShortcutGroupKey =
  | 'globalNavigation'
  | 'conversationNavigation'
  | 'composerAndFormatting'
  | 'overlaysAndModals'
  | 'sidebarAndRail';

/* -------------------------------------------------------------------------- */
/* SHAPES FOR THE GROUPS BELOW                                                */
/*                                                                            */
/* Written as interfaces and mapped types rather than as an index signature.    */
/* Under `noUncheckedIndexedAccess` an index signature would hand every         */
/* consumer `string | undefined` and force a non-null assertion at each call     */
/* site; a literal-keyed shape resolves every key to a definite `string`.        */
/* -------------------------------------------------------------------------- */

/**
 * The shape a `satisfies` clause uses where a group's entries legitimately differ
 * from one another.
 *
 * Several groups below are keyed by one of the closed unions above and checked
 * against it, and the check exists for one reason: EXHAUSTIVE KEY COVERAGE. Adding a
 * member to a union without its words then fails to compile, which is the only thing
 * that keeps a vocabulary and its wording in step.
 *
 * The entries themselves are deliberately not forced into one shape. A read-only bar
 * needs a sentence and an exit; an entitlement gate needs a badge, three trial
 * templates and an upgrade label; a throttled state needs one announcement and
 * nothing else. Flattening those into a common interface would either make most
 * members optional — which types nothing — or invent members a presentation does not
 * have. So the check covers the keys, and each entry's own members are typed by the
 * literal `as const` that produced them, which is what every consumer reads.
 */
type ExhaustiveGroupEntry = { readonly [member: string]: unknown };

/**
 * One deferred destination's surface.
 *
 * The action label is optional at the type level and absent wherever
 * `docs/decisions/placeholder-surfaces.md` records that the destination offers no
 * honest onward move. That is deliberate rather than an omission: a control that
 * cannot work is worse than no control, and offering one here would recreate the
 * dead control the placeholder exists to abolish, one level further in. Three of
 * the sixteen carry an action; one carries an inline link instead.
 */
export interface PlaceholderSurfaceEntry {
  /** Names the capability functionally, for what it will do. */
  readonly heading: string;
  /** States what the destination will do and that it is not available yet. */
  readonly body: string;
  /** Names the phase that delivers it, so the surface answers when and not merely whether. */
  readonly phaseNote: string;
  /** Present only where a shipped surface honestly substitutes for part of the capability. */
  readonly actionLabel?: string;
  /** Present only where a neighbouring surface that ships is worth naming inline. */
  readonly inlineLinkLabel?: string;
}

/** One empty region's words, in whichever of the four compositions it uses. */
export interface EmptyStateEntry {
  readonly shape: EmptyStateShape;
  readonly heading?: string;
  readonly body: string;
  readonly actionLabel?: string;
  readonly inlineLinkLabel?: string;
  /** Ordered, and present only on the instructional composition. */
  readonly steps?: readonly string[];
}

/**
 * One validation presentation's message slots.
 *
 * Every slot is optional, and that is the point rather than laxity. Validation is
 * also expressed with no message at all, purely through control state, and the
 * specification records that as the MORE COMMON case (`docs/workflows/21-states.md`
 * L268). A required message slot would force a build to invent words for the
 * majority case.
 */
export interface ValidationEntry {
  readonly presentation: ValidationPresentation;
  /** The sentence, where the presentation carries one. */
  readonly message?: string;
  /** The heading a form-level callout or a tinted block carries above its sentence. */
  readonly leadIn?: string;
  /** The caption above the row that previews the record already holding the value. */
  readonly conflictPreviewLabel?: string;
}

/* -------------------------------------------------------------------------- */
/* 0. THE COUNT PHRASINGS MORE THAN ONE SURFACE RENDERS                       */
/*                                                                            */
/* Declared first because several groups below delegate to it.                 */
/* -------------------------------------------------------------------------- */

/**
 * The three count phrasings that more than one surface says.
 *
 * A copy dictionary rightly repeats a short action label — five dialogs each own their
 * own cancel label, and one of them changing is not the other four changing. A
 * SENTENCE is different. Where two surfaces render the same sentence, writing it twice
 * gives one wording two homes, and the second one is the one that gets missed: that is
 * the local, partial equivalent `PROJECT_RULE_R5` forbids, expressed in words rather
 * than in components.
 *
 * So each of these is authored here once, and every surface that renders it delegates.
 * A member count is read by the workspace chooser and by a channel's own membership
 * list; a remaining-character readout is rendered beside a bounded field and announced
 * to a reader who cannot see it; a selection count is rendered on the conversation
 * list's docked bar and announced when it changes. Same sentence, one author.
 *
 * Each renders whatever number it is handed and none decides whether zero is rendered
 * at all — that is a per-surface decision, and the specification records two
 * conventions coexisting on two tabs of one surface
 * (`docs/workflows/21-states.md` L451).
 */
export const countCopy = {
  members: (count: number): string =>
    `${countText(count)} ${pluralise(count, 'member', 'members')}`,
  charactersRemaining: (remaining: number): string =>
    `${countText(remaining)} ${pluralise(remaining, 'character', 'characters')} remaining`,
  conversationsSelected: (count: number): string =>
    `${countText(count)} ${pluralise(count, 'conversation', 'conversations')} selected`,
} as const;

/* -------------------------------------------------------------------------- */
/* 1. THE PERSISTENT SHELL                                                    */
/*                                                                            */
/* Five regions: the top bar, the navigation rail, the sidebar, the content    */
/* region, and the pane that docks as a fifth taking its width FROM the content */
/* region (`docs/workflows/00-product-overview.md` L294 to L300, L307).         */
/* Routing replaces the content region only — the other three persist across   */
/* every destination change, menu, pane, modal and theme change, so the shell   */
/* is not a page navigated away from.                                          */
/* -------------------------------------------------------------------------- */

/**
 * Labels and accessible names for the shell.
 *
 * Every region label doubles as the region's accessible name, because a shell of
 * persistent columns is only navigable by keyboard if each column can be named.
 * The catalogue specifies no accessibility behaviour anywhere, so all of that is
 * authored; `a11yCopy` below holds the announcements, and this group holds the
 * names of things a person can see.
 */
export const shellCopy = {
  /** The product's own name, authored for it. No third-party mark appears anywhere. */
  productName: 'Relay',
  productTagline: 'Channel-based conversation for a working team',

  topBar: {
    regionLabel: 'Application toolbar',
    goBack: 'Back',
    goForward: 'Forward',
    /** The third of the three history controls grouped left of centre. */
    recentHistory: 'Recent history',
    recentHistoryEmpty: 'Nowhere visited yet in this session.',
    /**
     * The help entry, and its wording is load-bearing beyond its length. Consistent
     * help is asserted by POSITION AND NAME across every surface, so this string is
     * read identically everywhere and is never re-phrased per surface. Automated
     * scanning cannot judge that criterion, which is why it is one string rather
     * than a family of them.
     */
    help: 'Help',
  },

  rail: {
    regionLabel: 'Destinations',
    /** At the head of the rail, above the destination stack. */
    workspaceIcon: 'Current workspace',
    /** Pinned at the foot, with the account avatar. Named by function, never by asset. */
    createControl: 'New',
    createMenuLabel: 'Create something new',
    accountAvatar: 'You',
    accountMenuLabel: 'Your account',
    /** The rail shows a varying destination set; what it is not showing lives here. */
    overflowMenu: 'More destinations',
    overflowMenuEmpty: 'Every destination is already on the rail.',
  },

  sidebar: {
    regionLabel: 'Conversations',
    workspaceSwitcher: 'Switch workspace',
    filterControl: 'Filter conversations',
    newMessage: 'New message',
    /** The header control that collapses and expands every group at once. */
    collapseAllGroups: 'Collapse all',
    expandAllGroups: 'Expand all',
    /** The add affordance each collapsible group carries. */
    addToGroup: 'Add to this section',
    groupMenuLabel: 'Section options',
    createSection: 'Create a section',
    renameSection: 'Rename this section',
    /** The footer item slot, beneath the last group. */
    footerSlotLabel: 'Workspace shortcuts',
    resizeHandle: 'Resize the conversation list',
    /** The state a filter can leave the whole list in. Region-scoped, never page-scoped. */
    filteredToNothing: 'No conversation matches this filter.',
    clearFilter: 'Clear the filter',
  },

  /**
   * The bar that docks at the sidebar's foot in multi-select mode, where every
   * conversation row gains a leading checkbox and the per-group add affordances
   * disappear (`docs/workflows/00-product-overview.md` L88, and the move-to control
   * that flow `00.3` acts on).
   */
  selectionBar: {
    regionLabel: 'Selected conversations',
    enterMultiSelect: 'Select conversations',
    /**
     * The count, as a template. The bar is observed reading zero rather than
     * hiding the count, but whether zero renders at all is a per-surface decision
     * and not a global one — the catalogue records both conventions coexisting on
     * two tabs of one surface (`docs/workflows/21-states.md` L451). So this
     * template renders whatever number it is handed and never decides for the
     * caller whether to call it.
     */
    selectedCount: (count: number): string => countCopy.conversationsSelected(count),
    clearSelection: 'Clear selection',
    moveTo: 'Move to',
    newSection: 'New section',
    done: 'Done',
  },

  contentRegion: {
    regionLabel: 'Conversation',
    /** The skip target, so a keyboard visitor can pass the three persistent columns. */
    skipToContent: 'Skip to the conversation',
  },

  /**
   * The fifth region. It takes its width from the content region and leaves the
   * rail and the sidebar untouched, which is why it is a region rather than an
   * overlay.
   */
  dockedPane: {
    regionLabel: 'Details',
    close: 'Close this panel',
    back: 'Back',
  },

  /** The switcher's own menu, and the path that adds another workspace. */
  workspaceMenu: {
    label: 'Workspace menu',
    invitePeople: 'Invite people to this workspace',
    workspaceSettings: 'Workspace settings',
    addAnotherWorkspace: 'Add another workspace',
    signOut: 'Sign out of this workspace',
    signInOnMobile: 'Sign in on a phone or tablet',
    openDesktopApp: 'Open the desktop application',
  },

  /** The centred search entry. Its results surface is deferred; the entry is not. */
  searchEntry: {
    label: 'Search this workspace',
    placeholder: 'Search conversations and messages',
    clear: 'Clear the search',
    submit: 'Search',
    recentSearchesLabel: 'Recent searches',
    noRecentSearches: 'Nothing searched for yet.',
  },

  /** The two themes. The dark one derives over the same token names, so nothing branches. */
  theme: {
    label: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    matchSystem: 'Match my device',
  },

  /**
   * The stated floor for supported width. Authored: the corpus is captured at
   * exactly one width, so responsive behaviour is entirely undesigned and
   * `docs/decisions/responsive.md` authors the ladder. Stating the floor in the
   * interface is more honest than a layout that silently degrades below it.
   */
  narrowViewportNotice:
    'This window is narrower than the layout supports. Widen it, or open the workspace on a larger display.',
} as const;

/* -------------------------------------------------------------------------- */
/* 2. THE GATE SURFACES                                                       */
/*                                                                            */
/* Sign-up through to a first arrival in the shell, plus every return path.    */
/* These render inside the unauthenticated page shell with NO application      */
/* shell at all, which is why nothing in this group names a region.            */
/* Derived from `docs/workflows/01-onboarding-and-auth.md`.                    */
/* -------------------------------------------------------------------------- */

/**
 * The marketing-consent wording, exported as its own constant.
 *
 * This is the only string in the module a caller is required to store rather than
 * merely render, and the reason is a security contract rather than a preference: a
 * pre-ticked control is a RENDERING and never a consent, so what has to be
 * captured on the consent record is the act, the wording that was shown, and any
 * later withdrawal. That obliges the wording to be one stable, addressable string
 * the server can copy verbatim — a sentence assembled at a call site could not be
 * reproduced afterwards, and a consent record that cannot say what was agreed to
 * is not a consent record.
 *
 * Authored in full. The catalogue describes the control's two lines and its two
 * different arriving defaults — unticked on the sign-up path, pre-ticked on the
 * invitation path — and describing what a third party's checkbox says is not
 * licence to repeat it.
 */
export const MARKETING_CONSENT_WORDING =
  'Send me occasional email about product updates, new features and tips for getting more out of Relay. You can withdraw this at any time.';

/**
 * Every word on every gate surface.
 *
 * Grouped by surface rather than by control, because a gate surface is read top to
 * bottom and a reviewer checking one against its flow needs the words in the order
 * a person meets them.
 */
export const authCopy = {
  /**
   * The one unauthenticated entry route this build ships. No public marketing page
   * beyond it is in scope, so this surface carries the two entry points and
   * nothing else.
   */
  landing: {
    heading: 'Conversation your team can actually follow',
    body: 'Relay keeps a team\u2019s work in channels anyone can join, catch up on and search — instead of scattered across inboxes.',
    signUpAction: 'Create a workspace',
    signInAction: 'Sign in',
    existingWorkspacePrompt: 'Already using Relay with your team?',
  },

  signUp: {
    heading: 'What is your email address?',
    /** The helper recommends a work address; the advisory below fires when one is not used. */
    helper: 'A work address is best — it is how your colleagues find and join your workspace.',
    emailLabel: 'Email address',
    /** Authored example. No address, domain or person from the corpus is reproduced. */
    emailPlaceholder: 'you@yourcompany.com',
    continueAction: 'Continue',
    /**
     * The advisory that replaces the primary action in place when a personal-domain
     * address is entered. It is advice and not a rejection: the address is
     * acceptable and the person may continue with it, which is why it is a banner
     * rather than a validation message and why it names a change as an option.
     */
    personalDomainAdvisory:
      'You can carry on with this address. A work address makes it easier for colleagues to find your workspace and join it.',
    personalDomainChangeAction: 'Use a different address',
    dividerLabel: 'or',
    /** Identity providers named functionally. Never by vendor. */
    continueWithEnterpriseProvider: 'Continue with your organisation account',
    continueWithDeviceProvider: 'Continue with your device account',
    legalLead: 'By continuing you agree to our terms.',
    termsOfServiceLink: 'Terms of service',
    privacyPolicyLink: 'Privacy notice',
    cookiePolicyLink: 'Cookie notice',
    contactLink: 'Contact us',
    regionLabel: 'Change region',
  },

  /**
   * The code step. The code's LENGTH is a template parameter and never a literal:
   * it is a value the mechanism owns, and `PROJECT_RULE_R3` forbids writing one
   * down in a sentence.
   */
  verifyCode: {
    heading: 'Check your email for a code',
    subLine: (address: string, codeLength: number): string =>
      `We sent a ${countText(codeLength)}-character code to ${address}. It expires shortly, so enter it soon.`,
    codeFieldLabel: 'Verification code',
    /**
     * Advertised as a one-time code so a password manager and the platform's own
     * autofill can offer it, and paste is permitted. Both are explicit assertions
     * for the accessible-authentication criterion, which automated scanning cannot
     * judge.
     */
    codeFieldHint: 'Paste it or let your device fill it in.',
    openMailClientPrimary: 'Open your mail app',
    openMailClientSecondary: 'Open webmail',
    spamHint: 'No code yet? Check your spam or junk folder.',
    resendAction: 'Send another code',
    /**
     * The rejection. The boxes are cleared and this line is inserted; no attempt
     * counter and no lockout notice is rendered, which the corpus corroborates and
     * which is also the right posture — telling someone how many attempts remain
     * tells anyone guessing the same thing.
     */
    invalidCode: 'That code was not valid. Ask for another and try again.',
    expiredCode: 'That code has expired. Ask for another one.',
  },

  /**
   * The page between verification and workspace creation. Its consent checkbox
   * arrives UNTICKED here and pre-ticked on the invitation path, which is why the
   * wording is one shared constant and the arriving state is the caller's.
   */
  confirmAccount: {
    heading: 'Your address is confirmed',
    body: 'Create a workspace for your team, or join one you have been invited to.',
    confirmedAddressLabel: 'Signed in as',
    changeAddressAction: 'Change',
    createWorkspaceAction: 'Create a workspace',
    consentLabel: MARKETING_CONSENT_WORDING,
    legalParagraph:
      'Creating a workspace means you accept our terms of service and our privacy notice.',
    /** The card reporting the outcome of a search for existing workspaces on the address. */
    existingWorkspacesHeading: 'Workspaces for this address',
    existingWorkspacesEmpty: 'No workspace is using this address yet.',
    existingWorkspacesCount: (count: number): string =>
      `${countText(count)} ${pluralise(count, 'workspace', 'workspaces')} already ${pluralise(count, 'uses', 'use')} this address.`,
    joinWorkspaceAction: 'Join',
    useDifferentAddressAction: 'Try a different address',
  },

  /**
   * The five-step setup wizard. The step label is a template over BOTH numbers, so
   * the wizard's length is the wizard's business and not a sentence's.
   */
  setupWizard: {
    stepLabel: (current: number, total: number): string =>
      `Step ${countText(current)} of ${countText(total)}`,
    finalStepLabel: 'Last step',
    backAction: 'Back',
    nextAction: 'Next',
    skipStepAction: 'Skip this step',

    workspaceName: {
      heading: 'What is your company or team called?',
      helper: 'This becomes the name of your workspace. You can change it later.',
      fieldLabel: 'Company or team name',
      /** Authored example, chosen so it plainly is not a real organisation. */
      fieldPlaceholder: 'Northwind Studio',
      /** Pre-ticked on arrival, per the flow. The wording is authored. */
      domainJoinLabel: 'Let anyone with an email address at our domain join this workspace',
    },

    yourName: {
      heading: 'What is your name?',
      helper: 'This is how colleagues will see you in conversations.',
      fieldLabel: 'Full name',
      fieldPlaceholder: 'Your full name',
      photoSectionLabel: 'Profile photo',
      photoOptionalMarker: 'Optional',
      photoHelper: 'A photo helps colleagues recognise you. You can add one later.',
      photoUploadAction: 'Upload a photo',
      photoPlaceholderLabel: 'No photo yet',
    },

    invitePeople: {
      heading: (workspaceName: string): string => `Who else is working in ${workspaceName}?`,
      helper: 'Invite a few colleagues now, or come back to it once the workspace is set up.',
      fieldLabel: 'Add colleagues by email',
      /** Two authored example addresses, comma separated, matching the field's shape. */
      fieldPlaceholder: 'first@yourcompany.com, second@yourcompany.com',
      contactsDirectoryAction: 'Add from a contacts directory',
      copyInviteLinkAction: 'Copy an invite link',
    },

    firstChannel: {
      heading: 'What is the team working on right now?',
      helper:
        'A project, a customer, a launch or a recurring meeting all work. We will start a channel for it.',
      fieldLabel: 'What the team is working on',
      /** Authored example. The derived channel name is lower-cased and hyphenated. */
      fieldPlaceholder: 'Spring product launch',
      derivedChannelNote: 'We will create a channel with this name:',
    },

    choosePlan: {
      heading: 'Your workspace is ready',
      leadIn: 'Choose how you want to start. You can change this whenever you like.',
      fullPricingLink: 'Compare everything each plan includes',
      /** A commercial tier is named by placeholder, never by a tier name from a frame. */
      freeTierName: 'Plan tier one',
      paidTierName: 'Plan tier two',
      freeTierAction: 'Start on plan tier one',
      paidTierAction: 'Start on plan tier two',
      /** No price, currency amount or percentage appears as a literal. */
      priceUnit: 'per person, per month',
      offerFootnoteMarker: 'See offer terms',
    },
  },

  photoCrop: {
    heading: 'Position your photo',
    body: 'Drag to move it and use the slider to zoom. The circle is what colleagues will see.',
    zoomLabel: 'Zoom',
    /**
     * A keyboard path for the same adjustment, because no interaction in this build
     * may be reachable only by dragging. That is an explicit assertion for the
     * dragging-movements criterion, which automated scanning cannot judge.
     */
    nudgeUpLabel: 'Move the photo up',
    nudgeDownLabel: 'Move the photo down',
    nudgeLeftLabel: 'Move the photo left',
    nudgeRightLabel: 'Move the photo right',
    chooseDifferentPhotoAction: 'Choose a different photo',
    saveAction: 'Save photo',
    cancelAction: 'Cancel',
    tooLarge: (maxSizeLabel: string): string =>
      `That image is larger than ${maxSizeLabel}. Choose a smaller one.`,
    unsupportedFormat: 'That file is not an image we can use. Try a photo instead.',
  },

  /** First-run coaching. Anchored, with a step counter, and dismissible. */
  coachMarks: {
    stepLabel: (current: number, total: number): string =>
      `${countText(current)} of ${countText(total)}`,
    nextAction: 'Next',
    doneAction: 'Got it',
    dismissAction: 'Skip the tour',
    composeHint: {
      heading: 'Start the conversation',
      body: 'Write here. Anyone in the channel can read it and reply.',
    },
    reactHint: {
      heading: 'React without writing',
      body: 'Add a reaction to a message when a reply would be more than you need.',
    },
    railHint: {
      heading: 'Everything is one column away',
      body: 'Move between channels, people and your own activity from here.',
    },
  },

  /** The invite modal, shared by the member path and the guest path. */
  invite: {
    title: (workspaceName: string): string => `Invite people to ${workspaceName}`,
    recipientsLabel: 'To',
    recipientsPlaceholder: 'name@yourcompany.com',
    contactsDirectoryAction: 'Add from a contacts directory',
    roleLabel: 'Invite as',
    /** The advisory band above the role select. Advice, not a gate. */
    externalOrganisationAdvisory:
      'Working with people from another organisation? You can connect with them instead of adding them to this workspace.',
    externalCollaborationLink: 'About external connections',
    guestAccountsLink: 'About guest accounts',
    customiseAction: 'Add channels and a note',
    channelsLabel: 'Channels',
    channelsHelper:
      'New members join this workspace\u2019s default channels, and any channel you add here.',
    channelsPlaceholder: 'Search channels',
    /** Required on the guest path only, and marked required there rather than here. */
    channelsRequiredMarker: 'Required',
    noteLabel: 'Add a note',
    notePlaceholder: 'Say why you are inviting them',
    copyInviteLinkAction: 'Copy invite link',
    editLinkSettingsAction: 'Link settings',
    sendAction: 'Send invitations',
    /**
     * The confirmation that follows copying the link, and the reason every
     * value-bearing string in this module is a function. The expiry rendered here
     * comes from the absolute timestamp stored on THAT link's own record — never
     * from the configured default, which may have changed since it was issued.
     */
    inviteLinkCopied: 'Invite link copied.',
    inviteLinkExpiresOn: (expiresAt: Date | string): string =>
      `Invite link copied. It stops working on ${spellInstant(expiresAt)}.`,
    inviteLinkExpiresIn: (days: number): string =>
      `Invite link copied. It works for another ${countText(days)} ${pluralise(days, 'day', 'days')}.`,
    inviteLinkExpired: 'This invite link has expired. Create a new one to share it again.',
    guestOptionSubLabel: 'Limited to the channels, files and people you choose.',
    /** The allowance that lifts the guest's channel budget, and its billing consequence. */
    guestMultiChannelLabel: 'Let this guest join more than one channel',
    guestMultiChannelBillingNote:
      'A guest who can join more than one channel is billed as a full member.',
    guestChannelLimitReached: (limit: number): string =>
      `A guest may join ${countText(limit)} ${pluralise(limit, 'channel', 'channels')} unless you allow more.`,
    guestExpiryLabel: 'Set an end date',
    guestExpiryNoLimitOption: 'No end date',
    guestExpiryCustomOption: 'Choose a date',
    guestExpiryFieldLabel: 'End date',
    /** The end-of-day time is passed in: a time of day is a value, not a phrase. */
    guestExpiryHelper: (endOfDayTime: string): string =>
      `The guest account ends at ${endOfDayTime} on the date you choose.`,
    guestExpiryChosen: (endsAt: Date | string): string =>
      `This guest account ends on ${spellInstant(endsAt)}.`,
    guestsLearnMoreAction: 'About guest accounts',
    externalAcceptanceWindow: (days: number): string =>
      `An external invitation waits ${countText(days)} ${pluralise(days, 'day', 'days')} to be accepted before it lapses.`,
    sentHeading: (count: number): string =>
      `${countText(count)} ${pluralise(count, 'person has', 'people have')} been invited`,
    sentRoleAnnotationMember: 'Invited as a member',
    sentRoleAnnotationGuest: 'Invited as a guest',
    manageInvitationsLink: 'Manage invitations',
    inviteMorePeopleAction: 'Invite more people',
    doneAction: 'Done',
    revokeAction: 'Revoke this invitation',
    revokeConfirmTitle: 'Revoke this invitation?',
    revokeConfirmBody: 'The link stops working straight away. You can invite them again later.',
    revokeConfirmAction: 'Revoke',
  },

  /** The invitee's side. Its consent checkbox arrives pre-ticked. */
  acceptInvitation: {
    heading: (workspaceName: string): string => `Join ${workspaceName} on Relay`,
    productDescription: 'Relay is where this team keeps its conversations, files and decisions.',
    alreadyJoined: (count: number): string =>
      `${countText(count)} ${pluralise(count, 'person is', 'people are')} already here.`,
    recipientAddressLabel: 'Invited as',
    nameFieldLabel: 'Your name',
    nameFieldPlaceholder: 'Your full name',
    continueAction: 'Continue',
    consentLabel: MARKETING_CONSENT_WORDING,
    legalParagraph: 'Joining means you accept our terms of service and our privacy notice.',
    dividerLabel: 'or',
    invalidInvitation:
      'This invitation is no longer valid. Ask whoever invited you to send a new one.',
    expiredInvitation: 'This invitation has expired. Ask whoever invited you to send a new one.',
    alreadyAccepted: 'This invitation has already been used. Sign in instead.',
  },

  signIn: {
    heading: 'Sign in to Relay',
    workspaceHeading: (workspaceName: string): string => `Sign in to ${workspaceName}`,
    workspaceDomainLabel: 'Workspace address',
    helper: 'Use the work address you signed up with.',
    signInRequiredNotice: 'Sign in to open that page.',
    newHerePrompt: 'New to Relay?',
    createAccountAction: 'Create an account',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@yourcompany.com',
    continueWithEmailAction: 'Sign in with email',
    dividerLabel: 'or',
    continueWithEnterpriseProvider: 'Continue with your organisation account',
    continueWithDeviceProvider: 'Continue with your device account',
    /** The magic-code explanation, and the alternative each surface offers. */
    codeExplanation: 'We will email you a one-time code so you do not need a password.',
    passwordAlternativeAction: 'Sign in with a password instead',
    manualAlternativeAction: 'Sign in another way',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Your password',
    showPasswordAction: 'Show password',
    hidePasswordAction: 'Hide password',
    submitAction: 'Sign in',
    forgotPasswordAction: 'Forgot your password?',
    getHelpAction: 'Get help signing in',
    findWorkspacesPrompt: 'Looking for a different workspace?',
    findWorkspacesAction: 'Find your workspaces',
    /**
     * The rejected credential. It names the pair rather than which half was wrong,
     * which is the same reasoning as the shared not-found string: saying which half
     * matched tells anyone guessing that an account exists at that address.
     */
    rejectedCredential: 'That email address or password is not right. Try again.',
    tooManyAttempts: 'Too many attempts. Wait a moment and try again.',
    signInOnMobileHeading: 'Sign in on a phone or tablet',
    signInOnMobileBody: 'Open Relay on the other device and enter the code shown there.',
  },

  passwordFree: {
    heading: 'Sign in without a password',
    body: 'We will email you a link that signs you in to your workspaces.',
    emailLabel: 'Email address',
    submitAction: 'Continue',
    dividerLabel: 'or',
    resetPasswordAction: 'Reset your password',
  },

  resetRequest: {
    heading: 'Reset your password',
    body: (workspaceDomain: string): string =>
      `Enter the address you use to sign in to ${workspaceDomain} and we will email you a reset link.`,
    emailLabel: 'Email address',
    submitAction: 'Email me a reset link',
    sentHeading: 'Reset link sent',
    sentBody: (address: string): string =>
      `Check ${address} for the link and the instructions that go with it.`,
    wrongAddressPrompt: 'Wrong address?',
    reenterAction: 'Enter a different one',
    openMailClientPrimary: 'Open your mail app',
    openMailClientSecondary: 'Open webmail',
  },

  resetComplete: {
    heading: 'Choose a new password',
    body: 'Pick something you have not used here before.',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm new password',
    submitAction: 'Change my password',
    /** The banner inserted above the card when a previously used password is offered. */
    passwordPreviouslyUsed: 'That password has been used on this account before. Choose another.',
    passwordsDoNotMatch: 'Those two passwords are not the same.',
    invalidResetLink: 'This reset link is no longer valid. Ask for a new one.',
    expiredResetLink: 'This reset link has expired. Ask for a new one.',
    successHeading: 'Password updated',
    successBody: 'Your password has been changed. You can sign in with it now.',
    /** Strength ratings, weakest to strongest. Words, never a score. */
    strengthLabel: 'Password strength',
    strengthWeakest: 'Too weak',
    strengthWeak: 'Weak',
    strengthFair: 'Fair',
    strengthStrong: 'Strong',
    strengthStrongest: 'Very strong',
  },

  chooseWorkspace: {
    heading: 'Welcome back',
    leadIn: 'Choose a workspace to open.',
    addressPanelLabel: (address: string): string => `Workspaces for ${address}`,
    openAction: 'Open',
    memberCount: (count: number): string => countCopy.members(count),
    differentTeamPrompt: 'Want Relay with a different team?',
    createAnotherAction: 'Create another workspace',
    notSeeingPrompt: 'Not seeing your workspace?',
    tryDifferentEmailAction: 'Try a different email address',
  },

  /** Session lifetime is enforced on the server; these are the two things it says. */
  session: {
    idleWarning: (minutes: number): string =>
      `You will be signed out after ${countText(minutes)} ${pluralise(minutes, 'minute', 'minutes')} without activity.`,
    idleExpired: 'You were signed out after a period without activity. Sign in to carry on.',
    maximumReached: 'This session has reached its maximum length. Sign in to carry on.',
    staySignedInAction: 'Stay signed in',
    signOutNowAction: 'Sign out now',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* 3. CHANNELS                                                                */
/*                                                                            */
/* The two-step creation wizard, the visibility choice, the four-tab details   */
/* surface, notification preference and mute, starring, bookmarks, membership,  */
/* conversion, and the three graded destructive confirmations. Derived from     */
/* `docs/workflows/02-channels.md`.                                            */
/* -------------------------------------------------------------------------- */

/**
 * Every word on a channel surface.
 *
 * Two properties of this group are worth reading before the group itself.
 *
 * THE NAME RULE IS STATED AS HELPER COPY AND ENFORCED BY A COUNTER THAT COUNTS
 * DOWN. `channelNameHelper` states the rule and `charactersRemaining` reads what
 * is left; neither writes the ceiling down. The ceiling is a compile-time
 * invariant in `packages/shared/src/config/constants.ts` — a naming grammar that
 * links, mentions and resolution all depend on, so it is deliberately not
 * environment-overridable — and the caller passes it in.
 * (`docs/workflows/02-channels.md` L291, L754, L782 · AC: 02-channels.md L982 ·
 * frame 69.)
 *
 * DESTRUCTIVE ACTIONS ARE GRADED, NOT UNIFORM, and the gradient tracks
 * reversibility. Removing a member confirms with one line. Converting and
 * archiving confirm with a consequence list. Deleting additionally gates its
 * action behind an acknowledgement. Applying one pattern to all three loses the
 * signal, so the three bodies below are deliberately different lengths.
 */
export const channelsCopy = {
  /** Stated as helper copy beside the name field, never as a rejection. */
  channelNameHelper: (maxLength: number): string =>
    `Lower case, no spaces and no full stops, up to ${countText(maxLength)} characters.`,

  /**
   * The live readout beside the name field. It counts DOWN — against an empty
   * field it reads the whole allowance, and it renders only while the field has
   * focus. The visual readout is the number itself, which carries no words; this
   * sentence is what a screen reader is given, and it is the reason the counter is
   * legible to someone who cannot see it.
   */
  charactersRemaining: (remaining: number): string => countCopy.charactersRemaining(remaining),
  charactersOverBy: (over: number): string =>
    `${countText(over)} ${pluralise(over, 'character', 'characters')} too many`,

  create: {
    title: 'Create a channel',
    nameStepLabel: 'Name',
    nameFieldLabel: 'Channel name',
    /** Authored example. No channel name from the corpus is reproduced. */
    nameFieldPlaceholder: 'spring-launch',
    nameTaken: 'A channel already uses that name.',
    nameRequired: 'Give the channel a name.',
    nameIllegalCharacters: 'Use lower case letters, numbers and hyphens.',
    /** The visibility step. Public arrives pre-selected; that is an invariant. */
    visibilityStepLabel: 'Visibility',
    visibilityPublicLabel: 'Public',
    visibilityPublicDescription: 'Anyone in this workspace can find it, read it and join.',
    visibilityPrivateLabel: 'Private',
    visibilityPrivateDescription: 'Only the people invited to it can find it or read it.',
    /** The external-invite option in the wizard footer, behind an entitlement badge. */
    inviteExternalPeopleLabel: 'Also invite people from another organisation',
    backAction: 'Back',
    nextAction: 'Next',
    createAction: 'Create',
  },

  addPeople: {
    title: 'Add people',
    titleWithChannel: (channelName: string): string => `Add people to ${channelName}`,
    subLine: (channelName: string): string => channelName,
    /**
     * A SCOPE STATEMENT, deliberately kept apart from the role gate below it. It
     * says which population may be added; it does not say the person reading it may
     * not act. `docs/workflows/21-states.md` L276 records the distinction, and the
     * server enforces the restriction either way — this notice only explains it.
     */
    workspaceOnlyNotice: 'You can add people who are already in this workspace.',
    addEveryoneLabel: 'Add everyone in the workspace',
    addSpecificPeopleLabel: 'Add specific people',
    recipientsPlaceholder: 'Search by name or email',
    noMatches: 'Nobody in this workspace matches that.',
    /**
     * The role gate. It HIDES NOTHING and DISABLES NOTHING: the control stays in
     * its ordinary off position and the enclosing modal's primary action stays
     * filled. The caption names the role that can act, which is the whole of the
     * communication — the wording therefore says who can change it and never that
     * something has been hidden or switched off. (`docs/workflows/21-states.md`
     * L270 to L277; `docs/decisions/role-matrix.md` owns the capability itself.)
     */
    autoAddGateCaption: 'Workspace admins can change this setting',
    autoAddLabel: 'Automatically add anyone who joins this workspace',
    /**
     * The footer's label is STATE-DERIVED across four states and a build that fixes
     * one of them is wrong in three. Kept as four named strings rather than one
     * computed sentence, so a surface picks the state rather than assembling words.
     */
    footerActionAddEveryone: 'Done',
    footerActionSkip: 'Skip for now',
    footerActionPending: 'Add',
    footerActionAdd: 'Add',
    removeRecipient: 'Remove',
  },

  details: {
    title: (channelName: string): string => channelName,
    openControlLabel: 'Get channel details',
    close: 'Close',
    starLabel: 'Star this channel',
    unstarLabel: 'Remove star',
    huddleLabel: 'Huddle',
    documentLabel: 'Canvas',
    /** The four tabs. The members tab carries a count in its own label. */
    tabAbout: 'About',
    tabMembers: 'Members',
    tabIntegrations: 'Integrations',
    tabSettings: 'Settings',
    tabMembersWithCount: (count: number): string => `Members ${countText(count)}`,
    channelNameRowLabel: 'Channel name',
    topicRowLabel: 'Topic',
    topicEmptyPrompt: 'Add a topic',
    descriptionRowLabel: 'Description',
    descriptionEmptyPrompt: 'Add a description',
    createdByRowLabel: 'Created by',
    createdByValue: (personName: string, createdAt: Date | string): string =>
      `${personName} on ${spellInstant(createdAt)}`,
    leaveChannelRowLabel: 'Leave channel',
    filesCardLabel: 'Files',
    filesEmpty: 'Nothing has been shared here yet.',
    editAction: 'Edit',
    /** The identifier is an opaque token. It is never parsed and never explained. */
    channelIdentifierLabel: 'Channel ID',
    copyIdentifierAction: 'Copy',
    identifierCopied: 'Channel ID copied.',
  },

  rename: {
    title: 'Rename this channel',
    fieldLabel: 'Channel name',
    saveAction: 'Save',
    cancelAction: 'Cancel',
    /**
     * The system entry a rename appends. The PRIOR name is echoed verbatim from
     * what was stored and is never normalised — the corpus renders the same rename
     * event both hyphenated and unhyphenated, so normalising here would make the
     * history disagree with itself (`docs/workflows/03-messaging-and-composer.md`
     * L736).
     */
    systemEntry: (actorName: string, previousName: string, newName: string): string =>
      `${actorName} renamed this channel from ${previousName} to ${newName}.`,
  },

  describe: {
    title: 'Edit description',
    fieldLabel: 'Description',
    fieldPlaceholder: 'Add a description',
    helper: 'Let people know what this channel is for.',
    saveAction: 'Save',
    cancelAction: 'Cancel',
    /** An empty description is submittable, so there is no required-field message. */
    systemEntry: (actorName: string, newDescription: string): string =>
      `${actorName} set the description to: ${newDescription}`,
    systemEntryCleared: (actorName: string): string => `${actorName} cleared the description.`,
  },

  topic: {
    title: 'Edit topic',
    fieldLabel: 'Topic',
    fieldPlaceholder: 'What is happening in here right now?',
    saveAction: 'Save',
    cancelAction: 'Cancel',
    systemEntry: (actorName: string, newTopic: string): string =>
      `${actorName} set the topic to: ${newTopic}`,
    systemEntryCleared: (actorName: string): string => `${actorName} cleared the topic.`,
  },

  /**
   * The notification preference, exposed twice over one setting: a menu of four
   * choices and a fuller modal. The control's own label states the CURRENT setting
   * rather than naming a generic action, which is why there are four label
   * templates and not one.
   */
  notifications: {
    controlLabelUnset: 'Get notifications',
    controlLabelAllMessages: 'Notifications for every message',
    controlLabelMentions: 'Notifications for mentions',
    controlLabelOff: 'Notifications off',
    controlLabelMuted: 'Muted',
    optionAllMessagesLabel: 'Every new message',
    optionAllMessagesDescription: 'Notify me whenever anyone posts here.',
    optionMentionsLabel: 'Mentions',
    optionMentionsDescription:
      'Notify me when someone mentions me, mentions everyone here, or mentions everyone in the channel.',
    optionNothingLabel: 'Nothing',
    optionNothingDescription: 'Do not notify me about this channel at all.',
    muteLabel: 'Mute this channel',
    muteDescription:
      'A muted channel stops standing out for unread messages, and only badges when you are mentioned.',
    moreOptionsLabel: 'More notification settings',
    modalTitle: 'Notification settings',
    modalScopeLabel: 'Send me a notification for',
    mobileOverrideLabel: 'Use different settings on my phone and tablet',
    threadRepliesLabel: 'Notify me about every reply in this channel',
    /** The closing note points at the two wider settings surfaces. */
    workspaceSettingsNote:
      'Your workspace-wide settings and your notification keywords are in your preferences.',
    workspaceSettingsLink: 'Open preferences',
    saveAction: 'Save',
    cancelAction: 'Cancel',
  },

  star: {
    addAction: 'Star',
    removeAction: 'Remove star',
    /** The reversible confirmation. The undo link is the report's only control. */
    addedReport: (groupName: string): string => `Moved to ${groupName}.`,
    removedReport: (groupName: string): string => `Moved back to ${groupName}.`,
    undoAction: 'Undo',
    groupName: 'Starred',
  },

  bookmarks: {
    addRowLabel: 'Add a bookmark',
    addTitle: 'Add a bookmark',
    linkLabel: 'Link',
    linkPlaceholder: 'https://example.com/team-handbook',
    nameLabel: 'Name',
    namePlaceholder: 'What to call it',
    emojiLabel: 'Choose an emoji',
    addAction: 'Add',
    editTitle: 'Edit bookmark',
    saveAction: 'Save',
    removeAction: 'Remove bookmark',
    removeConfirmTitle: 'Remove this bookmark?',
    removeConfirmBody: 'It disappears for everyone in the channel. The page itself is untouched.',
    removeConfirmAction: 'Remove',
    /** Folders group bookmarks; a folder is not itself a link. */
    createFolderAction: 'New folder',
    folderTitle: 'Create a folder',
    folderNameLabel: 'Folder name',
    folderNamePlaceholder: 'What to call it',
    folderEmpty: 'This folder has nothing in it yet.',
    overflowLabel: 'More bookmarks',
    /** The link contract admits two schemes only, and this is what a refusal says. */
    unsupportedScheme: 'That kind of link cannot be bookmarked. Use a web address.',
    invalidLink: 'That does not look like a web address.',
  },

  members: {
    searchPlaceholder: 'Find members',
    addRowLabel: 'Add people',
    removeAction: 'Remove',
    /** Your own row is marked and carries no remove control. */
    selfMarker: 'you',
    emptySearch: 'No member matches that.',
    /** One line, and the destructive action is enabled immediately — the mildest grade. */
    removeConfirmTitle: (personName: string, channelName: string): string =>
      `Remove ${personName} from ${channelName}?`,
    removeConfirmBody: 'They can rejoin, or be added back, at any time.',
    removeConfirmAction: 'Remove',
    cancelAction: 'Cancel',
    removedSystemEntry: (actorName: string, personName: string): string =>
      `${actorName} removed ${personName} from this channel.`,
    addedSystemEntry: (actorName: string, personName: string): string =>
      `${actorName} added ${personName} to this channel.`,
    joinedSystemEntry: (personName: string): string => `${personName} joined this channel.`,
    leftSystemEntry: (personName: string): string => `${personName} left this channel.`,
    memberCount: (count: number): string => countCopy.members(count),
    joinAction: 'Join this channel',
    leaveAction: 'Leave this channel',
    leaveConfirmTitle: (channelName: string): string => `Leave ${channelName}?`,
    leaveConfirmBody:
      'You stop seeing new messages here. A public channel can be rejoined whenever you like.',
    leaveConfirmBodyPrivate:
      'You stop seeing this channel altogether. Someone already in it has to invite you back.',
    leaveConfirmAction: 'Leave',
  },

  /**
   * Conversion is treated as destructive even though nothing is deleted, and it is
   * reversible — once converted, the same row offers the return trip. The body
   * carries a consequence list, which is the middle grade.
   */
  convertToPrivate: {
    rowLabel: 'Change to a private channel',
    confirmTitle: (channelName: string): string => `Make ${channelName} private?`,
    confirmLeadIn: 'Keep in mind:',
    confirmConsequences: [
      'Nothing changes about the channel\u2019s history or who is in it.',
      'Every file already shared here stays available to everyone in the workspace.',
    ],
    confirmAction: 'Change to private',
    cancelAction: 'Cancel',
    systemEntry: (actorName: string): string => `${actorName} made this channel private.`,
  },

  convertToPublic: {
    rowLabel: 'Change to a public channel',
    confirmTitle: (channelName: string): string => `Make ${channelName} public?`,
    confirmLeadIn: 'Keep in mind:',
    confirmConsequences: [
      'Anyone in this workspace will be able to find this channel and read it.',
      'Everything already posted here becomes readable by the whole workspace.',
    ],
    confirmAction: 'Change to public',
    cancelAction: 'Cancel',
    systemEntry: (actorName: string): string => `${actorName} made this channel public.`,
  },

  /** The consequence list here is the corpus's longest, and it is the middle grade. */
  archive: {
    rowLabel: 'Archive this channel for everyone',
    confirmTitle: (channelName: string): string => `Archive ${channelName}?`,
    confirmLeadIn: 'Archiving applies to everyone in this channel:',
    confirmConsequences: [
      'Nobody will be able to post here.',
      'Any app installed in this channel is switched off.',
      'People from another organisation are removed, and keep what they have already read.',
    ],
    /**
     * Archiving changes what may be WRITTEN and changes nothing about who may READ.
     * A private channel that is archived stays private, so this closing paragraph
     * deliberately says nothing about visibility.
     */
    confirmClosing:
      'Everything posted here stays findable in search, and the channel can be unarchived later.',
    confirmAction: 'Archive',
    cancelAction: 'Cancel',
    systemEntry: (actorName: string): string =>
      `${actorName} archived this channel. Its messages and files stay browsable and searchable, and it can be unarchived from the channel details.`,
  },

  unarchive: {
    rowLabel: 'Unarchive this channel',
    confirmTitle: (channelName: string): string => `Unarchive ${channelName}?`,
    confirmBody: 'People will be able to post here again.',
    confirmAction: 'Unarchive',
    cancelAction: 'Cancel',
    systemEntry: (actorName: string): string => `${actorName} unarchived this channel.`,
  },

  /**
   * The strictest grade: the destructive action is gated behind an acknowledgement,
   * and the irreversibility is stated plainly. The emphasis the corpus renders on
   * that clause is a presentation decision belonging to `packages/ui`, so the
   * sentence here carries the words alone.
   */
  deleteChannel: {
    rowLabel: 'Delete this channel',
    confirmTitle: (channelName: string): string => `Delete ${channelName}?`,
    confirmBody:
      'Deleting this channel removes every message in it straight away. This cannot be undone.',
    confirmLeadIn: 'Keep in mind:',
    confirmConsequences: [
      'Files uploaded to this channel are not deleted.',
      'You can archive the channel instead, which keeps every message.',
    ],
    archiveInsteadLink: 'Archive it instead',
    acknowledgementLabel: 'I understand that every message in this channel will be deleted',
    confirmAction: 'Delete channel',
    cancelAction: 'Cancel',
  },

  /** The browser. Its filter chips fill when non-default; its sort control never does. */
  browse: {
    title: 'All channels',
    createAction: 'Create a channel',
    searchPlaceholder: 'Search for channels',
    clearSearchAction: 'Clear',
    heroHeading: 'Give every piece of work a place of its own',
    heroBody:
      'A channel keeps one project, one customer or one meeting together, so anyone joining can catch up.',
    heroAction: 'Create a channel',
    heroDismiss: 'Dismiss',
    scopeChipLabel: 'Channel scope',
    scopeAll: 'All channels',
    scopeMine: 'My channels',
    scopeOther: 'Channels I am not in',
    typeChipLabel: 'Channel type',
    typeAny: 'Any channel type',
    typePublic: 'Public',
    typePrivate: 'Private',
    typeArchived: 'Archived',
    typeExternal: 'External',
    organisationsChipLabel: 'Organisations',
    organisationsAny: 'Any organisation',
    sortLabel: 'Sort',
    sortNameAscending: 'Name, A to Z',
    sortNameDescending: 'Name, Z to A',
    sortNewest: 'Newest channel',
    sortOldest: 'Oldest channel',
    sortMostMembers: 'Most members',
    sortFewestMembers: 'Fewest members',
    joinedMarker: 'Joined',
    archivedSuffix: 'archived',
    resultCount: (count: number): string =>
      `${countText(count)} ${pluralise(count, 'channel', 'channels')}`,
    noResults: 'No channel matches these filters.',
    clearFiltersAction: 'Clear the filters',
  },

  /** The two entries the sidebar's add-channels row offers, and nothing else. */
  addChannelsMenu: {
    label: 'Add channels',
    createOption: 'Create a new channel',
    browseOption: 'Browse channels',
  },

  /**
   * The beginning-of-conversation block. It is NOT an empty state and must not be
   * built as one: it renders with messages, day dividers and app-authored posts
   * beneath it, and it is evidenced doing so three times
   * (`docs/workflows/21-states.md` L239). Its own entry is `conversationHeroCopy`
   * below; these are the parts of it a channel supplies.
   */
  hero: {
    headingPublic: (channelName: string): string => `This is the start of ${channelName}`,
    headingPrivate: (channelName: string): string =>
      `This is the start of ${channelName}, a private channel`,
    createdToday: 'Created today.',
    createdOn: (createdAt: Date | string): string => `Created on ${spellInstant(createdAt)}.`,
    addDescriptionLink: 'Add a description',
    addPeopleAction: 'Add colleagues',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* 4. MESSAGES                                                                */
/*                                                                            */
/* A message once sent: the row, its hover actions, its overflow set, the day   */
/* dividers and the unread rule that punctuate the list, the three message      */
/* subtypes, app attribution, scheduling and forwarding. Derived from           */
/* `docs/workflows/03-messaging-and-composer.md`.                              */
/* -------------------------------------------------------------------------- */

/**
 * Every word attached to a message.
 *
 * One naming rule governs the whole group: an application is referred to
 * FUNCTIONALLY — the built-in assistant app, a cloud-drive app, a poll app, a
 * standup app, a calendar app, a conferencing app — and never by a vendor's name,
 * because those names are other companies' marks and none of them is a requirement
 * of this product (`docs/workflows/00-product-overview.md` L616 to L630).
 */
export const messagingCopy = {
  listLabel: 'Messages',
  /** The two densities. The names describe the rhythm, not a preference. */
  densityComfortable: 'Comfortable',
  densityCompact: 'Compact',

  /** The bar pinned to a row's upper edge on hover, and its four labelled controls. */
  hoverActions: {
    label: 'Message actions',
    react: 'React',
    reply: 'Reply in thread',
    forward: 'Forward',
    pin: 'Pin',
    edit: 'Edit',
    delete: 'Delete',
    overflow: 'More actions',
    quickReactionLabel: (emojiName: string): string => `React with ${emojiName}`,
    addReaction: 'Add a reaction',
  },

  /** The full action set behind the overflow control, in the order it is grouped. */
  overflowMenu: {
    label: 'Message actions',
    forward: 'Forward this message',
    saveForLater: 'Save for later',
    turnOffReplyNotifications: 'Stop notifying me about replies',
    turnOnReplyNotifications: 'Notify me about replies',
    markUnread: 'Mark as unread',
    remindMe: 'Remind me about this',
    copyLink: 'Copy a link to this message',
    pinToConversation: 'Pin to this conversation',
    unpinFromConversation: 'Unpin from this conversation',
    startHuddleInThread: 'Start a huddle in the thread',
    edit: 'Edit this message',
    delete: 'Delete this message',
    addShortcut: 'Add a message shortcut',
  },

  /** The punctuation of the list. A divider is a date; the rule is a boundary. */
  dayDividerToday: 'Today',
  dayDividerYesterday: 'Yesterday',
  dayDivider: (day: Date | string): string => spellInstant(day),
  /**
   * The unread boundary. It marks where reading stopped, and the count comes from
   * the reader's own cursor rather than from a stored counter, so the same message
   * list shows a different boundary to each person looking at it.
   */
  unreadRuleLabel: 'New messages',
  unreadCount: (count: number): string =>
    `${countText(count)} new ${pluralise(count, 'message', 'messages')}`,
  markConversationRead: 'Mark everything read',
  jumpToUnread: 'Jump to the first unread message',
  jumpToLatest: 'Jump to the latest message',

  /** Provenance a row can carry, above or after the body. */
  editedMarker: 'edited',
  pinnedBy: (personName: string): string => `Pinned by ${personName}`,
  savedMarker: 'Saved',
  timestampLabel: 'Sent at',
  timestampAbsolute: (sentAt: Date | string): string => spellInstant(sentAt),

  /**
   * The three message subtypes, kept distinct because the row renders each
   * differently: a person's message, a system message in muted type, and an
   * application's message under the application's own identity with a badge.
   */
  subtypePersonLabel: 'Message',
  subtypeSystemLabel: 'Channel event',
  subtypeApplicationLabel: 'App message',
  /** The badge beside an application's own name, distinguishing the two authorships. */
  appBadge: 'App',
  workflowBadge: 'Automation',
  appAttribution: (appName: string): string => `Posted by ${appName}`,
  /** Where an example is needed, an application is named for what it does. */
  appExampleAssistant: 'the built-in assistant app',
  appExampleCloudDrive: 'a cloud-drive app',
  appExamplePoll: 'a poll app',
  appExampleStandup: 'a standup app',
  appExampleCalendar: 'a calendar app',
  appExampleConferencing: 'a conferencing app',

  reactions: {
    label: 'Reactions',
    addLabel: 'Add a reaction',
    /** The chip's own count. A reaction with nobody behind it is not rendered at all. */
    count: (emojiName: string, count: number): string =>
      `${emojiName}, ${countText(count)} ${pluralise(count, 'person', 'people')}`,
    reactorsList: (names: readonly string[], emojiName: string): string =>
      `${names.join(', ')} reacted with ${emojiName}`,
    removeYours: (emojiName: string): string => `Remove your ${emojiName} reaction`,
  },

  edit: {
    heading: 'Edit message',
    saveAction: 'Save changes',
    cancelAction: 'Cancel',
    emptyRejected: 'A message cannot be empty. Delete it instead, or write something.',
  },

  /** Deletion is irreversible, and the confirmation carries a full preview. */
  deleteMessage: {
    confirmTitle: 'Delete this message?',
    confirmBody: 'It disappears for everyone. This cannot be undone.',
    previewLabel: 'The message being deleted',
    confirmAction: 'Delete',
    cancelAction: 'Cancel',
    deletedPlaceholder: 'This message was deleted.',
  },

  pin: {
    pinnedReport: 'Pinned to this conversation.',
    unpinnedReport: 'Unpinned.',
    pinnedListLabel: 'Pinned messages',
    pinnedListEmpty: 'Nothing is pinned here yet.',
  },

  forward: {
    title: 'Forward this message',
    recipientsLabel: 'To',
    recipientsPlaceholder: 'Search for a person or a channel',
    noteLabel: 'Add a message',
    notePlaceholder: 'Say why you are forwarding it',
    previewLabel: 'The message being forwarded',
    copyLinkAction: 'Copy link',
    saveDraftAction: 'Save as a draft',
    forwardAction: 'Forward',
    cancelAction: 'Cancel',
    /** The provenance line a forwarded copy carries. */
    provenance: (conversationName: string): string => `Forwarded from ${conversationName}`,
    viewOriginalAction: 'Open the original conversation',
    sentReport: 'Message forwarded.',
  },

  /**
   * Scheduling. The destination, the date and the time are values; the time zone is
   * named by the surface that interprets them, so it is a parameter here too.
   */
  schedule: {
    menuLabel: 'Schedule this message',
    customOption: 'Choose a date and time',
    dateLabel: 'Date',
    timeLabel: 'Time',
    timeZoneNote: (timeZoneName: string): string => `Times are shown in ${timeZoneName}.`,
    confirmAction: 'Schedule',
    cancelAction: 'Cancel',
    scheduledReport: (sendAt: Date | string): string => `Scheduled for ${spellInstant(sendAt)}.`,
    scheduledListLabel: 'Scheduled',
    scheduledListEmpty: 'Nothing is scheduled.',
    sendNowAction: 'Send now',
    rescheduleAction: 'Change the time',
    cancelScheduledAction: 'Cancel this scheduled message',
    inThePast: 'That time has already passed. Choose a later one.',
  },

  /** A link is stored as a display-text and destination PAIR, both editable. */
  link: {
    displayTextLabel: 'Text',
    destinationLabel: 'Link',
    destinationPlaceholder: 'https://example.com',
    applyAction: 'Save',
    removeAction: 'Remove link',
    editAction: 'Edit link',
    openAction: 'Open link',
    /** The link contract admits two schemes. A refusal names what is accepted. */
    unsupportedScheme: 'Only web and email links can be added.',
    invalidDestination: 'That does not look like a web address.',
  },

  /** A file shared into a conversation. Its bytes never pass through the product. */
  attachment: {
    label: 'Attachment',
    downloadAction: 'Download',
    removeAction: 'Remove attachment',
    uploadingLabel: 'Uploading',
    uploadFailed: 'That file did not finish uploading. Try adding it again.',
    tooLarge: (maxSizeLabel: string): string =>
      `That file is larger than ${maxSizeLabel}. Choose a smaller one.`,
    unsupportedType: 'That kind of file cannot be shared here.',
    sharedBy: (personName: string, sharedAt: Date | string): string =>
      `Shared by ${personName} on ${spellInstant(sharedAt)}`,
  },

  /** A snippet renders as a title, a disclosure and a line-numbered card. */
  snippet: {
    expandAction: 'Show the snippet',
    collapseAction: 'Hide the snippet',
    copyAction: 'Copy the snippet',
    copiedReport: 'Snippet copied.',
    lineCount: (count: number): string =>
      `${countText(count)} ${pluralise(count, 'line', 'lines')}`,
  },

  /** An audio clip renders as a player inside the row. */
  audioClip: {
    label: 'Audio clip',
    playAction: 'Play',
    pauseAction: 'Pause',
    /** Durations are values a component formats; this names the readout. */
    durationLabel: 'Length',
    positionLabel: 'Position in the clip',
    transcriptAction: 'Show the transcript',
    transcriptUnavailable: 'No transcript is available for this clip.',
  },

  /** Optimistic send. A send that has not been acknowledged says so in its own row. */
  pendingLabel: 'Sending',
  /**
   * The transient failure the send path can produce. One sentence that states
   * something went wrong and invites a retry, and NO control of any kind — not a
   * dismiss, not an undo, not a retry button. The retry invitation is plain sentence
   * text, which is the only retry affordance evidenced anywhere in the corpus
   * (frame 199).
   */
  sendFailedReport: 'That message did not send. Try again in a moment.',
  /** The row-level counterpart, where the failure belongs to one item of a set. */
  sendFailedRow: 'Not sent',
  retrySendAction: 'Try sending again',
  discardDraftAction: 'Discard this draft',
} as const;

/* -------------------------------------------------------------------------- */
/* 5. THE COMPOSER                                                            */
/*                                                                            */
/* One contract with variants, and the two toolbars beneath it are two other    */
/* contracts. `PROJECT_RULE_R5` names this as the exact trap: the nine-control  */
/* formatting toolbar and the seven-control bottom action row are DISTINCT and  */
/* rendering one where the other belongs is a defect. They are therefore two    */
/* groups in this module, never a pooled bucket of composer controls.           */
/* -------------------------------------------------------------------------- */

/**
 * The composer's own words — the input, the hint beneath it, and each of the
 * surfaces the composer opens.
 *
 * The modal sub-composer deliberately has NO send label. It has no send control of
 * its own: the enclosing modal's footer takes that role, and giving the
 * sub-composer a label of its own is how a second send control gets built.
 */
export const composerCopy = {
  inputLabel: 'Write a message',
  placeholderConversation: (conversationName: string): string => `Message ${conversationName}`,
  placeholderPerson: (personName: string): string => `Message ${personName}`,
  placeholderThread: 'Reply in this thread',
  placeholderEdit: 'Edit this message',

  /**
   * The persistent hint beneath the composer's lower-right corner, present whenever
   * the composer is focused or holds a draft. Its WORDING is authored here; its KEYS
   * come from the binding registry, so it can never name a combination the handler
   * does not implement. That coupling is what makes it safe to show continuously.
   */
  newlineHint: (lineBreakCombination: string): string => `${lineBreakCombination} adds a new line`,

  sendAction: 'Send',
  sendOptionsAction: 'Send options',
  sendLaterAction: 'Schedule for later',
  draftSavedLabel: 'Draft saved',
  draftsGroupLabel: 'Drafts and sent',
  draftCount: (count: number): string =>
    `${countText(count)} ${pluralise(count, 'draft', 'drafts')}`,

  /** The reply composer's extra row, which posts a copy into the parent conversation. */
  alsoSendToConversationLabel: (conversationName: string): string =>
    `Also send this to ${conversationName}`,

  /** The menu the add-attachment control opens upward. */
  attachMenu: {
    label: 'Add to this message',
    createSnippet: 'Create a text snippet',
    groupLabel: 'Attach',
    createDocument: 'Create a canvas',
    enableAnimatedImages: 'Turn on animated images',
    uploadFromComputer: 'Upload from your computer',
  },

  /**
   * The snippet modal. CONTENT is the only required field — an invariant, since
   * which field gates the primary action is a validation contract and a deployment
   * that could relax it would accept an empty snippet
   * (`docs/workflows/03-messaging-and-composer.md` L165).
   */
  snippetModal: {
    title: 'Create a text snippet',
    titleFieldLabel: 'Title',
    titleFieldOptionalMarker: 'Optional',
    titleFieldPlaceholder: 'Untitled snippet',
    typeFieldLabel: 'Type',
    typeAutoDetectOption: 'Detect automatically',
    typePlainTextOption: 'Plain text',
    contentFieldLabel: 'Content',
    contentFieldPlaceholder: 'Paste or type the snippet here',
    contentRequired: 'A snippet needs some content.',
    wrapLabel: 'Wrap long lines',
    /** The embedded sub-composer. No send label, deliberately. */
    accompanyingMessageLabel: 'Add a message',
    accompanyingMessagePlaceholder: 'Say something about this snippet',
    shareToConversationLabel: 'Share this snippet in the conversation',
    shareDestinationLabel: 'Conversation',
    createAction: 'Create',
    cancelAction: 'Cancel',
  },

  /**
   * The caret-anchored typeahead, in both its mention form and its command form.
   * Its footer advertises navigate, select and dismiss as FUNCTIONS without naming
   * keys, so these three strings carry no combination
   * (`docs/workflows/03-messaging-and-composer.md` L585).
   */
  typeahead: {
    mentionLabel: 'People and channels',
    commandLabel: 'Commands',
    emojiLabel: 'Emoji',
    noMatches: 'Nothing matches that.',
    footerNavigateLabel: 'Move',
    footerSelectLabel: 'Insert',
    footerDismissLabel: 'Dismiss',
    /** A command row carries a provider sub-line, and a provider is named functionally. */
    providerSubLine: (providerName: string, description: string): string =>
      `${providerName} — ${description}`,
    nativeProviderName: 'Relay',
    mentionEveryoneHereLabel: 'Notify everyone currently here',
    mentionEveryoneLabel: 'Notify everyone in this channel',
    mentionChannelLabel: 'Link a channel',
    /**
     * A mention that would reach someone who cannot read the conversation is
     * refused on the server; the surface simply never offers them, because
     * autocomplete is a projection and is authorized like every other one.
     */
    mentionNotInConversation: (personName: string): string =>
      `${personName} is not in this conversation yet.`,
    inviteToConversationAction: 'Add them and mention them',
  },

  emojiPicker: {
    label: 'Choose an emoji',
    searchPlaceholder: 'Search emoji',
    noMatches: 'No emoji matches that.',
    frequentlyUsedLabel: 'Frequently used',
    customLabel: 'Custom emoji',
    skinToneLabel: 'Default skin tone',
    addCustomAction: 'Add a custom emoji',
  },

  /** The audio-clip recorder, sixth of the action row's seven controls. */
  audioRecorder: {
    startAction: 'Record an audio clip',
    stopAction: 'Stop recording',
    cancelAction: 'Discard this recording',
    confirmAction: 'Attach the clip',
    recordingLabel: 'Recording',
    /** The elapsed readout is a duration DISPLAY and not a refusal. */
    elapsedLabel: 'Recorded so far',
    limitApproaching: (remainingSeconds: number): string =>
      `${countText(remainingSeconds)} ${pluralise(remainingSeconds, 'second', 'seconds')} left`,
    limitReached: (maxLengthLabel: string): string =>
      `That is the longest clip Relay records — ${maxLengthLabel}. Stop to keep what you have.`,
    playbackAction: 'Play the recording',
  },

  /** The distraction-free surface, which addresses its recipient before its body. */
  fullScreen: {
    openAction: 'Open the full-screen composer',
    closeAction: 'Close the full-screen composer',
    recipientsLabel: 'To',
    recipientsPlaceholder: 'Search for a person or a channel',
    subjectPlaceholder: 'What is this about?',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* 6. THE FORMATTING TOOLBAR — NINE CONTROLS IN FIVE GROUPS                   */
/*                                                                            */
/* Its own group, and it stays its own group. `PROJECT_RULE_R5` forbids merging  */
/* two similar contracts and names this pair specifically. The five groups are   */
/* separated by four hairline rules in the rendering, and the grouping is legible */
/* without labels because each rule sits in a wider gap — which is exactly why    */
/* the group boundaries live in the data rather than in a stylesheet.             */
/* (`docs/workflows/03-messaging-and-composer.md` L521, L523.)                    */
/* -------------------------------------------------------------------------- */

/**
 * The nine formatting controls, and the five groups they fall into.
 *
 * `groups` is the authoritative grouping and `controls` holds the labels, so a
 * renderer walks the groups and never invents a boundary. A build that reads the
 * labels without the groups produces a nine-control row with no structure, and a
 * build that reads this group's labels into the action row's three groups produces
 * the defect the rule names.
 */
export const formattingToolbarCopy = {
  label: 'Text formatting',
  controls: {
    bold: 'Bold',
    italic: 'Italic',
    strikethrough: 'Strikethrough',
    link: 'Link',
    orderedList: 'Numbered list',
    bulletedList: 'Bulleted list',
    blockquote: 'Quote',
    inlineCode: 'Code',
    codeBlock: 'Code block',
  },
  /** Five groups, in rendering order, left to right. */
  groups: [
    { label: 'Emphasis', controls: ['bold', 'italic', 'strikethrough'] },
    { label: 'Link', controls: ['link'] },
    { label: 'Lists', controls: ['orderedList', 'bulletedList'] },
    { label: 'Quote', controls: ['blockquote'] },
    { label: 'Code', controls: ['inlineCode', 'codeBlock'] },
  ],
  /** The toggle in the action row that shows and hides this toolbar. */
  showAction: 'Show formatting',
  hideAction: 'Hide formatting',
} as const;

/* -------------------------------------------------------------------------- */
/* 7. THE COMPOSER'S BOTTOM ACTION ROW — SEVEN CONTROLS IN THREE GROUPS       */
/*                                                                            */
/* A separate contract from the toolbar above, by rule. Its two rules fall in    */
/* the row's two widest gaps, so the row reads as four, then two, then one —      */
/* never as the toolbar's five groups                                            */
/* (`docs/workflows/03-messaging-and-composer.md` L527).                         */
/* -------------------------------------------------------------------------- */

/**
 * The seven action-row controls, and the three groups they fall into.
 *
 * The split send control at the row's trailing edge is NOT one of the seven. It is
 * pinned opposite them and it is the composer's own send affordance, so its labels
 * live in `composerCopy` where the rest of the send path is. Counting it here would
 * make this row an eight-control row and would put a send label in the group a
 * reviewer checks for exactly seven.
 */
export const composerActionRowCopy = {
  label: 'Message actions',
  controls: {
    addAttachment: 'Add a file',
    formattingToggle: 'Formatting',
    emoji: 'Emoji',
    mention: 'Mention someone',
    videoClip: 'Record a video clip',
    audioClip: 'Record an audio clip',
    slashCommand: 'Run a command',
  },
  /** Three groups, in rendering order, left to right. */
  groups: [
    { label: 'Add', controls: ['addAttachment', 'formattingToggle', 'emoji', 'mention'] },
    { label: 'Record', controls: ['videoClip', 'audioClip'] },
    { label: 'Commands', controls: ['slashCommand'] },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/* 8. LOADING — FOUR SHAPES                                                   */
/*                                                                            */
/* Four separate obligations, not a stylistic range. Each replaces something    */
/* different and preserves something different, so each is announced             */
/* differently. `docs/decisions/state-matrix.md` is the authority.               */
/* -------------------------------------------------------------------------- */

/**
 * One loading shape's words.
 *
 * Two members are required of every shape, so a consumer can announce any of the
 * four without asking which it has. The three optional members belong to
 * individual shapes and are declared here rather than left untyped: a row's status
 * vocabulary is the row's, and the stale notice belongs to a region whose content is
 * being replaced rather than fetched for the first time.
 */
export interface LoadingShapeEntry {
  /** What is being waited for, in general. */
  readonly announcement: string;
  /** The same, naming the subject, so a caller never concatenates one itself. */
  readonly announcementFor: (subjectName: string) => string;
  /** Row status only: the state a row is in before its own work starts. */
  readonly pending?: string;
  /** Row status only: the state a row is in once its work has finished. */
  readonly passed?: string;
  /** Region skeleton only: shown while previous content is kept and marked stale. */
  readonly staleNotice?: string;
}

/**
 * One announcement per loading shape.
 *
 * These are announcements rather than visible labels. Three of the four shapes
 * render no words at all — a spinner replacing a control's label, a spinner
 * replacing a row's status word, a bordered rectangle, shape-preserving
 * placeholders — so the words below exist so that someone who cannot see the
 * rendering is told the same thing. That is why one shared waiting sentence cannot
 * serve four granularities: what is being waited for differs in each.
 *
 * There is deliberately nothing here for a whole-surface wait. No frame shows one
 * and the state record prohibits it, so no wording exists that a build could reach
 * for while inventing it.
 */
export const loadingCopy = {
  /** The control's own action is in flight. Its size and position do not change. */
  inPlaceControl: {
    announcement: 'Working',
    /**
     * A control may change its own label as it becomes actionable, so a caller that
     * wants to name what is in flight has this rather than concatenating.
     */
    announcementFor: (actionName: string): string => `${actionName} — working`,
  },
  /** One item of a set resolves while the table keeps reporting the others. */
  rowStatus: {
    announcement: 'In progress',
    announcementFor: (itemName: string): string => `${itemName} — in progress`,
    pending: 'Waiting',
    passed: 'Done',
  },
  /** A block's content is arriving into a document that is otherwise complete. */
  blockPlaceholder: {
    announcement: 'Loading this block',
    announcementFor: (blockName: string): string => `Loading ${blockName}`,
  },
  /** A whole region is being repainted beside regions that are not. */
  regionSkeleton: {
    announcement: 'Loading',
    announcementFor: (regionName: string): string => `Loading ${regionName}`,
    /**
     * A region whose data is being REPLACED keeps its previous content and marks it
     * stale rather than blanking. Authored: every observed loading rendering is
     * initial rather than replacing, so the silent case inherits the scoping pattern
     * (no marker — registered in `docs/decisions/gap-register.md` under the
     * no-marker decisions).
     */
    staleNotice: 'Showing what was here a moment ago while this refreshes.',
  },
} as const satisfies { readonly [K in LoadingShape]: LoadingShapeEntry };

/* -------------------------------------------------------------------------- */
/* 9. EMPTY — FOUR COMPOSITIONS, KEYED PER REGION AND PER TAB                 */
/*                                                                            */
/* Empty belongs to the REGION that has nothing to show, never to the route.    */
/* One surface can carry a different empty state per tab, and the copy is        */
/* written for the tab rather than for the surface                               */
/* (`docs/workflows/21-states.md` L237, L238).                                   */
/* -------------------------------------------------------------------------- */

/**
 * Empty regions, keyed by the region or tab that owns them.
 *
 * The keys read as region names on purpose. A key named after a route would invite
 * a route-level empty state, which would blank a pane that had content — and no
 * capture shows that.
 *
 * Four compositions are represented, including the instructional one, whose
 * `steps` array teaches the workflow that fills the region. A build that gives
 * every empty region an illustration and a button cannot reproduce two of the four,
 * which the specification names as a failure mode
 * (`docs/workflows/21-states.md` L521).
 */
export const emptyCopy = {
  /** Illustrated with an action: the viewer can fill this from here. */
  sidebarChannelGroup: {
    shape: 'illustratedWithAction',
    heading: 'No channels here yet',
    body: 'Add a channel to this section and it will show up in the list.',
    actionLabel: 'Browse channels',
  },
  /** Illustrated, no action: nothing shipped fills this from here, so the link explains. */
  pinnedMessages: {
    shape: 'illustratedNoAction',
    heading: 'Nothing pinned',
    body: 'Pin a message and it will be collected here for everyone in the conversation.',
    inlineLinkLabel: 'How pinning works',
  },
  /** Illustrated and instructional: filling this takes several steps, so it teaches them. */
  workspaceFirstChannel: {
    shape: 'illustratedInstructional',
    heading: 'Start with one channel',
    body: 'A channel keeps one piece of work together, so anyone joining can catch up.',
    inlineLinkLabel: 'What makes a good channel',
    steps: [
      'Create a channel and name it after the work rather than the team.',
      'Add the people already involved.',
      'Say what it is for in the description, so someone joining later knows.',
      'Post the first message, even if it is only where things stand today.',
    ],
  },
  /** Text only: a region inside a dense surface, where an illustration would overstate. */
  channelFiles: {
    shape: 'textOnly',
    body: 'Nothing has been shared in this channel yet.',
  },
  /** Text only, and every zero-result region uses it — no illustration at all. */
  channelBrowseNoResults: {
    shape: 'textOnly',
    heading: 'No channel matches',
    body: 'Try a different search, or clear the filters.',
    actionLabel: 'Clear the filters',
  },
  memberSearchNoResults: {
    shape: 'textOnly',
    body: 'Nobody in this channel matches that.',
  },
  searchHistory: {
    shape: 'textOnly',
    body: 'Nothing searched for yet.',
  },
  /** Two tabs of one surface, written for the tab rather than for the surface. */
  detailsIntegrationsTab: {
    shape: 'illustratedNoAction',
    heading: 'No apps in this channel',
    body: 'Apps that post here or watch for something will be listed on this tab.',
    inlineLinkLabel: 'What an app can do',
  },
  detailsMembersTab: {
    shape: 'illustratedWithAction',
    heading: 'Only you so far',
    body: 'Add the people who should be part of this conversation.',
    actionLabel: 'Add people',
  },
  bookmarkFolder: {
    shape: 'textOnly',
    body: 'This folder has nothing in it yet.',
  },
  scheduledMessages: {
    shape: 'illustratedNoAction',
    heading: 'Nothing scheduled',
    body: 'A message you schedule waits here until its time arrives.',
    inlineLinkLabel: 'How scheduling works',
  },
  drafts: {
    shape: 'textOnly',
    body: 'No drafts. Anything you start writing is saved here automatically.',
  },
} as const satisfies { readonly [region: string]: EmptyStateEntry };

/**
 * The beginning-of-conversation block, deliberately OUTSIDE `emptyCopy`.
 *
 * This is the rule in the state vocabulary most likely to be implemented wrongly,
 * because the hero looks exactly like an empty state: an illustration, a heading
 * and a body, centred at the head of a conversation. It is not one. It renders when
 * the conversation has messages, day dividers and app-authored posts beneath it,
 * and it is evidenced doing so three times (`docs/workflows/21-states.md` L239).
 * Its render is never gated on a message count.
 *
 * It lives here, in its own export, precisely so that a build reaching for hero
 * copy cannot find it among the empty states and conclude it is one.
 */
export const conversationHeroCopy = {
  /** The suggestion cards that FOLLOW the hero, each a title and a one-line sub-line. */
  suggestionsLabel: 'A few ways to start',
  suggestionWriteTitle: 'Say what you are working on',
  suggestionWriteSubLine: 'A first message gives everyone else somewhere to reply.',
  suggestionInviteTitle: 'Bring in the people involved',
  suggestionInviteSubLine: 'A conversation works better with the people it concerns in it.',
  suggestionDescribeTitle: 'Describe what this is for',
  suggestionDescribeSubLine: 'Anyone joining later reads this first.',
  suggestionBookmarkTitle: 'Bookmark what the team keeps opening',
  suggestionBookmarkSubLine: 'A bookmark sits under the header where everyone can find it.',
} as const;

/* -------------------------------------------------------------------------- */
/* 10. FIELD VALIDATION — SIX PRESENTATIONS                                   */
/*                                                                            */
/* Six because three axes are settled independently: where the message goes,    */
/* whether the rejected value survives, and whether the primary action is        */
/* gated. Every message slot is OPTIONAL, because validation expressed with no    */
/* message at all — purely through control state — is the more common case.       */
/* -------------------------------------------------------------------------- */

/**
 * The six validation presentations, and the wording each carries.
 *
 * Three things about this group are load-bearing.
 *
 * THE PRESENTATION WITH NO MESSAGE IS THE MAJORITY CASE and it is represented here
 * by `precondition`, which carries a stated precondition rather than an error. The
 * precondition is stated ADJACENTLY — by a live counter, a checkbox, or the empty
 * required field itself — rather than being left for the viewer to deduce.
 *
 * A REJECTION CAN CARRY EVIDENCE. Presentation one renders a preview of the record
 * that already holds the value beneath its message, so the contract accepts a
 * conflicting-record slot and not merely a string.
 *
 * NONE OF THESE STATES A CAUSE THE VIEWER CANNOT ACT ON. A message names what to
 * do differently; it never names a rule identifier, a field path or a code.
 */
export const validationCopy = {
  /** 1 — beneath the field, plus a preview of the conflicting record. Value retained. */
  fieldWithConflictPreview: {
    presentation: 'fieldWithConflictPreview',
    message: 'Something already uses that name. Choose another.',
    conflictPreviewLabel: 'Already using it',
  },
  /** 2 — beneath each affected field at once. Value retained, primary stays actionable. */
  perFieldAcrossSeveral: {
    presentation: 'perFieldAcrossSeveral',
    message: 'This needs attention before it can be saved.',
  },
  /** 3 — a callout above every field, with no field marked at all. */
  formLevelCallout: {
    presentation: 'formLevelCallout',
    leadIn: 'This could not be saved',
    message: 'Check the answers below and try again.',
  },
  /** 4 — a tinted block beneath the input group. Value CLEARED, no submit control. */
  groupBlockValueCleared: {
    presentation: 'groupBlockValueCleared',
    message: 'That was not right. Enter it again.',
  },
  /** 5 — one message beneath the field PAIR. Second field cleared, first retained. */
  fieldPairSingleMessage: {
    presentation: 'fieldPairSingleMessage',
    message: 'Those two do not match. Enter the second one again.',
  },
  /** 6 — a tinted block inside a modal. Value retained, primary de-emphasised. */
  modalBlock: {
    presentation: 'modalBlock',
    leadIn: 'Not saved',
    message: 'Change one of the answers above and try again.',
  },
} as const satisfies { readonly [K in ValidationPresentation]: ValidationEntry };

/**
 * The no-message presentation, and the reason it is a separate export.
 *
 * The six above are the exception; this is the rule. A primary rendered
 * de-emphasised while its field is empty, filled once the field is satisfied — no
 * message, no colour change, nothing but the control's own treatment. It is
 * evidenced six times over and recorded as the MORE COMMON case
 * (`docs/workflows/21-states.md` L268), and a build that ships only the six
 * messaged presentations has implemented the exception and skipped the rule.
 *
 * What lives here is the ADJACENT STATEMENT of the precondition, because that is
 * the only words this presentation has. One inconsistency is carried rather than
 * reconciled: a field captioned optional nevertheless de-emphasises the form's
 * primary while it is empty (`docs/workflows/21-states.md` L455). Both readings are
 * recorded and neither is asserted over the other, so an optionality caption is
 * authored copy and is deliberately NOT the source of a form's gating condition.
 */
export const preconditionCopy = {
  requiredFieldMarker: 'Required',
  optionalFieldMarker: 'Optional',
  requiredFieldEmpty: 'Fill this in to carry on.',
  acknowledgementUnticked: 'Tick the box above to carry on.',
  selectionEmpty: 'Choose one to carry on.',
  /** A live counter is one of the three ways a precondition is stated adjacently. */
  overAllowance: 'Shorten this to carry on.',
} as const;

/* -------------------------------------------------------------------------- */
/* 11. FAILURE — FIVE PRESENTATIONS                                           */
/*                                                                            */
/* Two rules bind every string here. A failure never leaves a person without a   */
/* next move, and the next move is always SPECIFIC. And none of them states a    */
/* cause or renders a code: the one page-level failure the corpus contains        */
/* states that the cause is unknown and carries no status code at all             */
/* (`docs/workflows/21-states.md` L251, L469, L585).                             */
/* -------------------------------------------------------------------------- */

/**
 * The five failure presentations.
 *
 * Not one string below contains a status code, an exception name or a correlation
 * identifier. That is not squeamishness about detail: a code is a fact about the
 * product's internals, and a person reading a failure needs a fact about what to do
 * next. Diagnostics belong in the structured log, where the audit trail already
 * collects them.
 *
 * The transient report carries NO CONTROL of any kind — not a dismiss, not an undo,
 * not a retry button — so it is a sentence and nothing else. The retry invitation is
 * plain sentence text, which is the only retry affordance evidenced anywhere in the
 * corpus (frame 199). The region-foot band names a remedy and likewise carries no
 * action link.
 */
export const failureCopy = {
  /** A floating report that clears on its own. One sentence, no control. */
  transientReport: {
    generic: 'That did not work. Try again in a moment.',
    forAction: (actionName: string): string => `${actionName} did not work. Try again in a moment.`,
  },
  /** One item of a set failed while the others kept reporting. */
  rowResult: {
    generic: 'Not done',
    forItem: (itemName: string): string => `${itemName} was not done`,
    retryAction: 'Try this one again',
  },
  /** Inside a dialog, above its body, with the dialog's primary left de-emphasised. */
  dialogCallout: {
    leadIn: 'That did not go through',
    body: 'Nothing has changed. Close this and try again.',
  },
  /**
   * Docked at the foot of the region it concerns. It names a remedy and carries NO
   * action link, because the remedy is not something the product can perform.
   */
  regionFootBand: {
    generic: 'This is not up to date. Reload the page to see the latest.',
    forRegion: (regionName: string): string =>
      `${regionName} is not up to date. Reload the page to see the latest.`,
  },
  /**
   * The whole surface failed. It states no cause — the observed page states the
   * cause is unknown — and it offers one specific way back rather than a retry.
   */
  pageCard: {
    heading: 'Something went wrong here',
    body: 'We are not sure what. Nothing you did caused it, and nothing has been lost.',
    actionLabel: 'Go back to your conversations',
    secondaryActionLabel: 'Reload this page',
  },
} as const satisfies { readonly [K in FailurePresentation]: ExhaustiveGroupEntry };

/* -------------------------------------------------------------------------- */
/* 12. TRANSIENT OUTCOME REPORTING — FOUR VARIANTS                            */
/*                                                                            */
/* A report clears without anyone acting on it, and NONE of the four variants    */
/* carries a dismissal affordance: no frame shows one being dismissed, and        */
/* nothing on any of them could have done it (`docs/workflows/21-states.md`       */
/* L479). Undo is a property of the ACTION being reversible rather than of the    */
/* report, which is why only one variant has a control at all.                   */
/* -------------------------------------------------------------------------- */

/**
 * The four transient-outcome variants.
 *
 * There is deliberately no dismissal label anywhere in this group, and adding one
 * later is the specific failure this comment exists to prevent. Because a report
 * cannot be dismissed and clears itself, it is announced through a live region — a
 * failure assertively, a confirmation politely — which is the only way someone not
 * looking at that corner learns of it.
 */
export const toastCopy = {
  /** No control. One sentence naming what was created or added. */
  confirmation: {
    created: (thingName: string): string => `${thingName} created.`,
    added: (thingName: string): string => `${thingName} added.`,
    saved: 'Saved.',
    copied: (thingName: string): string => `${thingName} copied.`,
    sent: 'Sent.',
  },
  /** The only variant with a control, and the control is an undo link. */
  reversibleConfirmation: {
    moved: (destinationName: string): string => `Moved to ${destinationName}.`,
    removed: (thingName: string): string => `${thingName} removed.`,
    markedRead: 'Everything marked as read.',
    undoAction: 'Undo',
    undoneReport: 'That has been put back.',
  },
  /** No control. One sentence stating something went wrong and inviting a retry. */
  /**
   * The same presentation as `failureCopy.transientReport`, reached from the toast
   * vocabulary rather than from the failure vocabulary — the state record counts the
   * transient failure report as one of the four variants AND as one of the five failure
   * presentations. It is one wording, so it is authored once and delegated to here.
   */
  failure: {
    generic: failureCopy.transientReport.generic,
    forAction: (actionName: string): string => failureCopy.transientReport.forAction(actionName),
  },
  /** No control. Renders on a public surface rather than inside the shell. */
  publicSurfaceConfirmation: {
    added: (thingName: string): string => `${thingName} added.`,
    subscribed: 'You are on the list.',
  },
} as const satisfies { readonly [K in ToastVariant]: ExhaustiveGroupEntry };

/**
 * The durable full-width bar, and it MUST NOT be confused with the floating report
 * above.
 *
 * A different presentation with a different lifetime: docked at the very foot of the
 * content region, full width and flat, carrying its sentence and an undo link — not
 * a floating pill and not at a corner (`docs/workflows/21-states.md` L317).
 * Implementing one of them for both loses the distinction, which is why it is a
 * separate export rather than a fifth variant.
 */
export const durableOutcomeBarCopy = {
  markedEverythingRead: 'Everything in this workspace is marked as read.',
  bulkActionApplied: (count: number, actionName: string): string =>
    `${actionName} applied to ${countText(count)} ${pluralise(count, 'conversation', 'conversations')}.`,
  undoAction: 'Undo',
} as const;

/* -------------------------------------------------------------------------- */
/* 13. READ-ONLY — TWO PRESENTATIONS                                          */
/*                                                                            */
/* Both dock a status bar at the foot of the region they affect and both name    */
/* the way out. The composer is REPLACED by the bar, never disabled: a           */
/* styled-disabled surface is a different rendering, one the corpus does not      */
/* contain, and it also loses the exit — because the bar that names the way out   */
/* is the thing the composer was replaced BY.                                     */
/* -------------------------------------------------------------------------- */

/**
 * The two read-only bars, and the entries their reversal appends.
 *
 * Read-only is a WRITE-SCOPE state and says nothing about read scope. An archived
 * private conversation stays private, so the bar's sentence states that the
 * conversation is archived and offers the exit, and deliberately says nothing about
 * who can see it — that is a different question with a different answer, and
 * `docs/decisions/role-matrix.md` owns it.
 *
 * The rendering is also not the enforcement. Removing the composer does not refuse a
 * send: a send that arrives for an archived conversation is refused on the server by
 * the operation the capability matrix already covers.
 */
export const readOnlyCopy = {
  archivedConversation: {
    /** Names the conversation and states that it is archived. One sentence. */
    bar: (conversationName: string): string =>
      `You are reading ${conversationName}, which is archived.`,
    /** The exit, at the bar's trailing edge. */
    closeAction: 'Close this conversation',
    unarchiveAction: 'Unarchive it',
    /**
     * Reversal is ONE atomic state change: every removed affordance returns at
     * once, and the conversation's own history gains an entry recording it. The
     * entry is a message in the ordinary list rather than a line in a separate
     * audit view.
     */
    reversalSystemEntry: (actorName: string): string =>
      `${actorName} unarchived this conversation. Everyone can post here again.`,
  },
  readOnlyDocument: {
    bar: 'You are reading this document in read-only view.',
    turnOffAction: 'Turn off read-only view',
    reversalSystemEntry: (actorName: string): string =>
      `${actorName} turned off read-only view for this document.`,
  },
} as const satisfies { readonly [K in ReadOnlyPresentation]: ExhaustiveGroupEntry };

/**
 * A read-only surface offering the one action that leaves it, applied to a template.
 *
 * The corpus contains a third instance of the read-only state — a template opened
 * for reading, carrying a use-template action instead of an editing surface
 * (`docs/workflows/21-states.md` L287) — and it is deliberately NOT a third
 * presentation. It is the archived pattern's shape applied to a different object,
 * and it is here so that a build meeting it does not mint a fourth thing.
 */
export const readOnlyTemplateCopy = {
  bar: 'This is a template. Use it to start something of your own.',
  useTemplateAction: 'Use this template',
} as const;

/* -------------------------------------------------------------------------- */
/* 14. GATING — FOUR KINDS, HELD DISTINCT                                     */
/*                                                                            */
/* They look similar and they mean different things. Merging any two produces a  */
/* build that communicates the wrong cause to the person looking at it, so the   */
/* four stay four here and in the build.                                        */
/*                                                                            */
/* NOTHING IN THIS GROUP IS AN ENFORCEMENT POINT. Presentation is not            */
/* enforcement: removing, hiding, disabling, badging or enclosing a control is a */
/* decision about pixels, and none of those decisions refuses a request. Every    */
/* check runs on the server at the point of execution against the acting session  */
/* and the specific target object, which is `PROJECT_RULE_R1` and which           */
/* `docs/decisions/role-matrix.md` settles cell by cell.                          */
/* -------------------------------------------------------------------------- */

/**
 * The words each gating kind carries.
 *
 * Role gating is the one worth reading twice. It HIDES NOTHING and DISABLES
 * NOTHING: the control sits inside a bordered container whose inset caption names
 * the role that can act, the control is left in its ordinary off position, and the
 * enclosing modal's primary action stays filled. The caption is the whole of the
 * communication, so its wording says WHO CAN CHANGE THIS and never that something
 * has been hidden, switched off or taken away — wording it as though hiding were the
 * mechanism would describe a rendering the corpus does not contain.
 *
 * A corollary follows and is worth stating because it changes what the surface must
 * handle: because role gating hides nothing, the control inside the enclosure is
 * reachable and operable, so the server's refusal is the EXPECTED path when someone
 * activates it — not an edge case reached by a crafted request. The refusal
 * therefore lands in a failure presentation from the group above rather than as an
 * unhandled rejection.
 */
export const gatingCopy = {
  /**
   * A capability the product cannot grant itself. Every presentation names a remedy
   * OUTSIDE the product and none offers an in-product control; the two forms — the
   * denial and the request — live in `permissionCopy` below because they look alike
   * and mean different things.
   */
  devicePermission: {
    kind: 'devicePermission',
    caption: 'Your browser controls this',
  },
  /** The signed-in role may not use this control. Named, never hidden. */
  role: {
    kind: 'role',
    caption: channelsCopy.addPeople.autoAddGateCaption,
    captionForRole: (roleLabel: string): string => `${roleLabel} can change this setting`,
    /**
     * Kept separate from the caption above, because it is a SCOPE STATEMENT and not
     * a gate: it names which population an action may be applied to, and says
     * nothing about whether the person reading it may act
     * (`docs/workflows/21-states.md` L276).
     */
    scopeStatement: channelsCopy.addPeople.workspaceOnlyNotice,
    scopeStatementForPopulation: (populationLabel: string): string =>
      `You can add ${populationLabel}.`,
    /** What the surface says when the server refuses, which is the expected path. */
    refusedByServer: 'That change was not allowed. Ask a workspace admin to make it.',
  },
  /**
   * The workspace's plan does not include this capability. Inline and adjacent,
   * NEVER blocking: the gated row renders exactly like its siblings apart from a
   * badge after its label, and the surface behind it stays fully usable.
   *
   * Every tier is a placeholder. No tier name, price, currency amount or countdown
   * value appears as a literal anywhere in this group — the substitution table fixes
   * the vocabulary at `docs/workflows/00-product-overview.md` L616 to L630 and names
   * plan-tier substitution as one of the three things a build is most likely to get
   * wrong.
   */
  entitlement: {
    kind: 'entitlement',
    badgeLabel: 'Paid plan',
    badgeLabelForTier: (planTierLabel: string): string => planTierLabel,
    caption: 'This is part of a paid plan.',
    captionForTier: (planTierLabel: string): string => `This is part of ${planTierLabel}.`,
    upsellStripHeading: 'More of this on a paid plan',
    upsellStripBody: 'A paid plan lifts this limit and adds the rest of what this surface can do.',
    /**
     * The upgrade path resolves to a defined placeholder surface rather than to a
     * purchase flow, because billing is out of scope for this phase. The action
     * therefore promises to SHOW the plans and never to buy one.
     */
    upgradeAction: 'See the plans',
    learnMoreAction: 'What each plan includes',
    /**
     * One trial field, rendered three ways. The specification records the same trial
     * state driving a countdown in days, a status-only statement with no duration,
     * and an absolute end date (`docs/workflows/21-states.md` L302), so there are
     * three templates rather than one — and no observed countdown value may be
     * written down (L304, L449).
     */
    trialDaysRemaining: (days: number): string =>
      `${countText(days)} ${pluralise(days, 'day', 'days')} left of your trial`,
    trialStatusOnly: 'You are on a trial.',
    trialEndsOn: (endsAt: Date | string): string => `Your trial ends on ${spellInstant(endsAt)}.`,
    trialEnded: 'Your trial has ended.',
    /** A quota the plan sets, reached. The limit is the caller's, never a literal. */
    limitReached: (limit: number, thingPlural: string): string =>
      `This plan allows ${countText(limit)} ${thingPlural}. You have reached that.`,
  },
  /**
   * This control's own precondition is unmet — a statement about the FORM and not
   * about the viewer. It changes the control's treatment and says nothing in words
   * at all, which is exactly the no-message validation presentation, so the words
   * it does need are the adjacent statement in `preconditionCopy` above.
   *
   * IT CARRIES NO CAPTION, and the member is ABSENT rather than empty. That is the
   * catalogue's own discipline applied to a type: absence is recorded as absence,
   * and an empty string would read as a caption somebody had not written yet. A
   * consumer that reaches for a caption here should be reaching for the adjacent
   * statement instead, and the type is what tells it so.
   */
  precondition: {
    kind: 'precondition',
  },
} as const satisfies {
  readonly [K in GatingKind]: ExhaustiveGroupEntry & { readonly kind: K };
};

/**
 * Device and browser capability, in its two forms.
 *
 * They are separate groups because they look alike and mean different things, and
 * the difference is which of them may carry a control.
 *
 * THE REQUEST FORM CARRIES AN IN-PRODUCT LINK, because starting the browser's own
 * grant flow is something the product can do.
 *
 * THE DENIAL FORM CARRIES NONE AT ALL — no retry, no action link, nothing. Enabling
 * a device is the browser's job, and offering a control that cannot work is the
 * specific failure this presentation is shaped to avoid
 * (`docs/workflows/21-states.md` L274). A build must not helpfully add a retry
 * button to a denial.
 */
export const permissionCopy = {
  /** Asking. The product can start this, so it may offer a control. */
  request: {
    microphoneHeading: 'Relay needs your microphone',
    microphoneBody: 'Your browser will ask for permission. Nothing is recorded until you allow it.',
    cameraHeading: 'Relay needs your camera',
    cameraBody: 'Your browser will ask for permission. Nothing is captured until you allow it.',
    screenShareHeading: 'Relay needs to see your screen',
    screenShareBody: 'Your browser will ask which window or screen to share.',
    notificationsHeading: 'Relay would like to send you notifications',
    notificationsBody: 'Your browser will ask for permission. You can change it whenever you like.',
    allowAction: 'Continue',
    notNowAction: 'Not now',
  },
  /**
   * Refused. Every string names a remedy outside the product, and this group has NO
   * action label of any kind — deliberately, and permanently.
   */
  denial: {
    microphone:
      'Your browser is blocking the microphone for this site. Allow it in your browser\u2019s site settings, then come back.',
    camera:
      'Your browser is blocking the camera for this site. Allow it in your browser\u2019s site settings, then come back.',
    screenShare:
      'Your browser is blocking screen sharing for this site. Allow it in your browser\u2019s site settings, then come back.',
    notifications:
      'Your browser is blocking notifications for this site. Allow them in your browser\u2019s site settings.',
    clipboard:
      'Your browser is blocking clipboard access for this site. Allow it in your browser\u2019s site settings, or copy by hand.',
    unsupportedByBrowser:
      'This browser does not support that. A current version of a mainstream browser does.',
    /**
     * A denial is additionally visible on the device control itself, which renders
     * struck through; this is that control's accessible name. The in-modal denial
     * variant also RESETS the modal's setup state as well as reporting it, so a
     * build that only reports the failure cannot reproduce it
     * (`docs/workflows/00-product-overview.md` L346).
     */
    controlLabelMicrophone: 'Microphone blocked by your browser',
    controlLabelCamera: 'Camera blocked by your browser',
    controlLabelScreenShare: 'Screen sharing blocked by your browser',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* 15. THE NINE FAMILIES THE CORPUS NEVER SHOWED                              */
/*                                                                            */
/* Every string in this section is AUTHORED. No frame shows any of these        */
/* states, and all nine ship as working behaviour because `PROJECT_RULE_R3`      */
/* makes absent evidence an open work item rather than permission to omit.       */
/* Each family cites the marker position that made it one and points at          */
/* `docs/decisions/gap-register.md`, which holds the options considered, the      */
/* choice and the reasoning. The comment cites; the record reasons.               */
/*                                                                            */
/* The whole of the related evidence is two near-misses: a retry invitation      */
/* inside a transient failure report as plain sentence text (frame 199), and a   */
/* diagnostics popover summarising a connection as stable (frame 271).           */
/* -------------------------------------------------------------------------- */

/**
 * Connection, availability and not-found, in the nine families the specification
 * names and the corpus never captured.
 *
 * The reconnect group is the highest-value of the nine, because exponential backoff
 * with jitter and full replay are required outright: the states have to exist for
 * that behaviour to be observable at all. Backoff itself is invisible — only a row's
 * own state changes — so `retrying` is attempt-aware and the delay never appears.
 */
export const connectionCopy = {
  /**
   * AUTHORED — no frame shows this. Marker: `docs/workflows/21-states.md` L465;
   * registered in `docs/decisions/gap-register.md`. The condition is reported once,
   * in the shell, and the surface stays usable: input is still accepted and unsent
   * work is held as pending in place rather than lost.
   */
  offline: {
    banner: 'You are offline. Anything you write is held until the connection comes back.',
    /** The composer stays present and accepts input, so it says what will happen. */
    composerNote: 'Held until you are back online',
    resolvedReport: 'Back online.',
  },

  /**
   * AUTHORED — no frame shows this, and distinguishing it from being offline is
   * itself unevidenced. Marker: `docs/workflows/21-states.md` L465. Kept distinct
   * and distinguished by naming the TRANSPORT rather than the network, because the
   * two conditions have different remedies and merging them would misreport which.
   * Each affected region's live data is marked stale rather than blanked.
   */
  disconnected: {
    banner: 'Relay has lost its live connection. New messages will not arrive until it returns.',
    staleRegionNote: 'This may not be up to date.',
    resolvedReport: 'Live connection restored.',
  },

  /**
   * AUTHORED — no frame shows this. Marker: `docs/workflows/21-states.md` L465.
   * Only the report changes: no region is blanked and no overlay is drawn, because
   * loading is scoped to the smallest changing thing everywhere in the corpus and
   * the smallest changing thing here is the report itself.
   */
  reconnecting: {
    banner: 'Reconnecting.',
    /** The banner's own control, which renders an in-place loading state. */
    retryNowAction: 'Try now',
    announcement: 'Reconnecting',
  },

  /**
   * AUTHORED — no frame shows this. Marker: `docs/workflows/21-states.md` L465. The
   * item retries in place: it keeps its row, renders as pending, then resolves or
   * reports a transient failure. BACKOFF IS INVISIBLE, so no template here names a
   * delay — only which attempt is running.
   */
  retrying: {
    rowStatus: 'Retrying',
    attempt: (attempt: number, maxAttempts: number): string =>
      `Retrying, attempt ${countText(attempt)} of ${countText(maxAttempts)}`,
    exhausted: 'This did not go through after several attempts. Try again yourself.',
    retryNowAction: 'Try again',
  },

  /**
   * AUTHORED — no frame shows this. Marker: `docs/workflows/21-states.md` L467; the
   * one near-miss is a clip recorder's elapsed-over-limit readout, which is a
   * duration DISPLAY and not a refusal. A rate limit clears by itself, so a
   * self-clearing report describes it correctly — but only away from a form, where
   * the message has to stay with the field it concerns.
   */
  rateLimited: {
    transientReport: 'That was too quick. Wait a moment and it will go through.',
    retryIn: (seconds: number): string =>
      `That was too quick. Try again in ${countText(seconds)} ${pluralise(seconds, 'second', 'seconds')}.`,
    /** Inside a form the refusal sits with the control, in a tinted block. */
    formMessage: 'Too many attempts just now. Wait a moment and try again.',
  },

  /**
   * AUTHORED — no frame shows this. Marker: `docs/workflows/21-states.md` L467.
   * Explicitly NOT a transient report: the condition persists until something
   * changes, so a presentation that cleared itself would tell someone the problem
   * had gone away when it had not. It is a persistent form-level callout naming the
   * limit reached and what it applies to, with the primary de-emphasised.
   */
  quotaExceeded: {
    leadIn: 'You have reached a limit',
    forThing: (limit: number, thingPlural: string, scopeLabel: string): string =>
      `${scopeLabel} allows ${countText(limit)} ${thingPlural}, and that has been reached. Remove one, or ask a workspace admin.`,
    generic: 'This workspace has reached one of its limits. Ask a workspace admin about it.',
  },

  /**
   * AUTHORED — no frame shows this. Marker: `docs/workflows/21-states.md` L467. NO
   * NEW PRESENTATION: the initiating control renders as an in-place loading control
   * for the duration and then resolves normally, because a deliberate slowdown
   * someone can do nothing about is not a failure and reporting it as one would
   * invite a retry that makes the condition worse.
   *
   * The one string here is the announcement that in-place state needs, and it
   * deliberately does not use the words for a failure.
   */
  throttled: {
    announcement: 'Working — this is taking a little longer than usual',
  },

  /**
   * AUTHORED — no frame shows a not-found surface for a missing resource. Marker:
   * `docs/workflows/21-states.md` L469; the one near-miss is the observed page-level
   * failure, which states that the cause is UNKNOWN rather than naming a missing
   * resource and carries NO STATUS CODE. That page is therefore evidence for a
   * generic failure surface and evidence AGAINST reading it as a not-found surface,
   * so this presentation is authored rather than derived from it.
   *
   * IT MUST NOT DISTINGUISH "NOT PERMITTED" FROM "DOES NOT EXIST". A string like
   * "you do not have access to this channel" would disclose that the channel
   * exists, and that disclosure is exactly what `PROJECT_RULE_R1` forbids: a private
   * resource must be absent from every projection, so the answer a non-member gets
   * has to be indistinguishable from the answer about something that was never
   * there. One string therefore serves both cases, and it is deliberately vague
   * about which one it is answering. Do not improve it into a disclosure.
   */
  notFoundResource: {
    heading: 'We could not find that',
    body: 'It may have been deleted, or it may never have existed. Nothing else has changed.',
    bodyForThing: (thingLabel: string): string =>
      `That ${thingLabel} is not here. It may have been deleted, or it may never have existed.`,
    actionLabel: 'Go back to your conversations',
  },

  /**
   * AUTHORED — no frame shows this. Marker: `docs/workflows/21-states.md` L469. A
   * missing SURFACE renders the page-level failure, naming the address rather than a
   * cause. No status code, and no cause: the observed page names neither.
   */
  notFoundRoute: {
    heading: 'That page is not here',
    body: 'The address may have changed, or the link that brought you here may be out of date.',
    bodyForAddress: (address: string): string =>
      `Nothing lives at ${address}. The address may have changed, or the link that brought you here may be out of date.`,
    actionLabel: 'Go back to your conversations',
  },
} as const satisfies { readonly [K in ConnectionStateKey]: ExhaustiveGroupEntry };

/**
 * The five service-health levels.
 *
 * AUTHORED for four of the five, and recorded as an absence rather than smoothed
 * away. Marker: `docs/workflows/21-states.md` L473 — the public status surface's own
 * panel header carries a legend of five levels and ONLY ONE is ever observed applied
 * to a row; the remaining four appear in the legend alone. The legend is the
 * corpus's own enumeration of the vocabulary, so all five are implemented and four
 * render from data there is no captured example of.
 *
 * `docs/decisions/gap-register.md` records the surface itself as deferred with a
 * reason: it belongs to a deferred property. The vocabulary is here because it is a
 * state set, and because a build meeting one of the four must not invent a sixth
 * word for it.
 */
export const serviceHealthCopy = {
  operational: 'No issues',
  maintenance: 'Planned maintenance',
  notice: 'Notice',
  incident: 'Incident',
  outage: 'Outage',
} as const satisfies { readonly [K in ServiceHealthLevel]: string };

/**
 * What the product says about its own availability when a whole capability is
 * degraded rather than a single request refused.
 *
 * AUTHORED, and grounded in the same absence as the levels above. It names no cause
 * and carries no code, for the same reason nothing in `failureCopy` does.
 */
export const serviceStatusCopy = {
  degraded: 'Part of Relay is running slowly. What you send is still saved.',
  unavailable: 'Part of Relay is unavailable right now. What you have already sent is safe.',
  maintenanceWindow: 'Relay is under planned maintenance. Some things will not work until it ends.',
  maintenanceWindowEnding: (endsAt: Date | string): string =>
    `Planned maintenance is expected to finish by ${spellInstant(endsAt)}.`,
} as const;

/* -------------------------------------------------------------------------- */
/* 16. THE SIXTEEN DEFERRED DESTINATIONS                                      */
/*                                                                            */
/* Every rail destination resolves, including the sixteen belonging to phases   */
/* this run does not build. A placeholder is a DEFINED SURFACE that returns a    */
/* success response — not a not-found, not a blank region, not a disabled rail   */
/* item. `docs/decisions/placeholder-surfaces.md` is the specification for what  */
/* each one communicates and for which of them offers an onward move.           */
/*                                                                            */
/* A placeholder DISCLOSES NOTHING. No count, no conversation, person, app,     */
/* workspace or file name, and nothing that varies in a way that would reveal   */
/* whether a private resource exists. That is what makes a placeholder route    */
/* trivially compliant with `PROJECT_RULE_R1`'s projection requirement: there is */
/* no query to isolate, no row to filter and no projection to authorize.        */
/* -------------------------------------------------------------------------- */

/**
 * The sixteen destinations, each with a heading, a body, the phase that delivers
 * it, and an onward move only where an honest one exists.
 *
 * WHY MOST OF THEM CARRY NO ACTION. A control that cannot work is worse than no
 * control, and the specification states the principle directly for the neighbouring
 * case: a permission failure names its remedy and never offers a control that would
 * not work (`docs/workflows/21-states.md` L526). A placeholder with a button that
 * led nowhere would recreate the dead control this whole surface family exists to
 * abolish, one level further in. Three of the sixteen carry an action because a
 * shipped surface genuinely substitutes for part of the capability; one carries an
 * inline link to a neighbouring surface that is not deferred; twelve carry neither.
 *
 * WHY EACH NAMES A PHASE. It is what makes a placeholder a plan rather than a shrug:
 * the surface answers WHEN and not merely whether. No date is named, because no date
 * is known and naming one would be a promise the build has not made.
 *
 * FIVE OF THEM ARE NOT PURELY DEFERRED, and their copy says so precisely, because
 * each is the difference between a working mechanism and a broken one: the search
 * FIELD ships and only its results are deferred; preferences are already stored and
 * honoured; presence already renders; an app-authored message already appears in a
 * conversation; and the external acceptance window is already a configured and
 * enforced value.
 */
export const placeholderSurfaceCopy = {
  /** The message row ships thread-reply-ready, so the capability is visibly half-present. */
  threads: {
    heading: 'Reply threads',
    body: 'Replies to a message will gather here as a conversation of their own, so a side discussion does not push the channel along. Messages themselves are fully readable and writable today.',
    phaseNote: 'Threads arrive in the next phase.',
    actionLabel: 'Browse channels',
  },
  /** A not-found here would read as a statement about membership, which it must never make. */
  directMessages: {
    heading: 'Direct messages',
    body: 'Conversations addressed to one person or a small group, outside any channel, will live here.',
    phaseNote: 'Direct messages arrive in the next phase.',
    actionLabel: 'Browse channels',
  },
  /**
   * The only one of the sixteen reached from a LIVE shell control, so the copy draws
   * the distinction explicitly: the field works, the result surface is what is
   * deferred. An error response here would make a working field look broken on every
   * surface at once.
   */
  search: {
    heading: 'Search results',
    body: 'The search field in the toolbar is live — it is this results surface, with its filters and its ranking, that is not built yet.',
    phaseNote: 'Search results and filters arrive in the next phase.',
    actionLabel: 'Browse channels',
  },
  /**
   * Deliberately says nothing is wrong with the device. Device-permission denial has
   * its own presentation and it is a different one; a disabled control here would be
   * read as a microphone or camera problem, and someone would then try at some length
   * to fix it in the wrong place.
   */
  huddles: {
    heading: 'Live voice and video',
    body: 'A live voice-and-video session started from a conversation will run here. Nothing is wrong with your device, your microphone or your browser permissions — this surface is simply not built yet.',
    phaseNote: 'Live sessions arrive in a later phase.',
  },
  /**
   * The creation entry for this capability is the only entry observed carrying an
   * entitlement badge, so the product already renders it as GATED rather than absent
   * — and the copy says both things, so the badge is not read as a rendering error.
   */
  canvases: {
    heading: 'Collaborative documents',
    body: 'A shared editable document you can attach to a conversation will live here. Creating one is part of a paid plan as well as being unbuilt, so the badge on its entry point is not a mistake.',
    phaseNote: 'Documents arrive in a later phase.',
  },
  /** Evidenced on the rail in some captures and in the overflow menu in others. */
  lists: {
    heading: 'Structured record lists',
    body: 'Tracked records with typed fields, saved views and grouping will live here.',
    phaseNote: 'Lists arrive in a later phase.',
  },
  /** Reachable from two distinct places, both of which arrive here deliberately. */
  workflowBuilder: {
    heading: 'Automation builder',
    body: 'Building an automation — a trigger, then a sequence of steps — will happen here. Both routes into it lead to this page for now, which is deliberate rather than a broken link.',
    phaseNote: 'The automation builder arrives in a later phase.',
  },
  /** App output already renders in conversations, so the asymmetry needs explaining. */
  apps: {
    heading: 'Installed apps',
    body: 'Browsing, installing and configuring apps will happen here. An app-authored message already appears in a conversation under the app\u2019s own name, so you may see app output before there is anywhere to manage it.',
    phaseNote: 'App management arrives in a later phase.',
  },
  /** The read cursor and the notification projection already work behind this. */
  activity: {
    heading: 'Activity',
    body: 'One feed gathering mentions, reactions and replies will live here. Unread state is already worked out for you individually and marked in the conversation list beside this page.',
    phaseNote: 'The activity feed arrives in a later phase.',
  },
  /** Presence is already rendering two columns away, so denying it would contradict itself. */
  people: {
    heading: 'People',
    body: 'A browsable directory of the people in this workspace, their groups and their profiles will live here. Availability already shows beside a person\u2019s picture in any conversation.',
    phaseNote: 'The directory arrives in a later phase.',
  },
  /**
   * Text only, and carefully worded: a surface claiming preferences are unavailable
   * would be untrue about something verifiable in one action — dismiss a banner,
   * reload, watch it stay dismissed.
   */
  preferences: {
    heading: 'Preferences',
    body: 'The settings screen is not built yet. Your preferences are still stored and honoured — a banner you dismiss stays dismissed, and a notification setting you choose on a channel is kept.',
    phaseNote: 'The settings screen arrives in a later phase.',
  },
  /** A not-found here could be read as the files themselves being gone. */
  files: {
    heading: 'Files and media',
    body: 'A view of everything shared across conversations, with filters and grouping, will live here. A file already shared into a conversation stays available in that conversation.',
    phaseNote: 'The files view arrives in a later phase.',
  },
  /** Part of the mechanism is real: the acceptance window is configured and enforced. */
  externalConnections: {
    heading: 'External connections',
    body: 'Working with people from another organisation will be set up here. The window an external invitation waits to be accepted in is already a configured, enforced setting in this build.',
    phaseNote: 'External connections arrive in a later phase.',
  },
  /**
   * A separate application reached by an external link, with its own toolbar and its
   * own navigation — so there is no deep route to disable and nothing in the shell to
   * hide. Deliberately no link: the separate property has no address in this build.
   */
  adminConsole: {
    heading: 'Workspace administration',
    body: 'Administering a workspace happens in a separate application rather than on a screen inside this one, so it will not appear in this window when it ships. There is nothing here to wait for.',
    phaseNote: 'The administration application arrives in a later phase.',
  },
  /**
   * The target of a gate that renders TODAY. Every badge, trial item and upsell strip
   * in the shipped product points here, so this page has to make a rendered gate read
   * as correct rather than broken. Deliberately no control: any control here would
   * imply a purchase path that does not exist.
   */
  plan: {
    heading: 'Plans and entitlements',
    body: 'Choosing and changing a plan is not built, and there is no way to buy one from here yet. If a badge or a limit sent you to this page, it was reporting a real limit rather than malfunctioning.',
    phaseNote: 'Plan management arrives in a later phase.',
  },
  /**
   * The help control appears in the same relative position on EVERY surface, which is
   * an accessibility criterion rather than a layout habit. It therefore cannot be
   * hidden or disabled, and this page is what it resolves to — while naming the one
   * neighbouring surface that is not deferred.
   */
  help: {
    heading: 'Help and support',
    body: 'Help articles, support requests and the community surfaces are not built yet. The keyboard reference is a different surface, and it does work.',
    phaseNote: 'Help and support arrive in a later phase.',
    inlineLinkLabel: 'Open the keyboard reference',
  },
} as const satisfies { readonly [K in PlaceholderSurfaceKey]: PlaceholderSurfaceEntry };

/* -------------------------------------------------------------------------- */
/* 17. THE KEYBOARD REFERENCE                                                 */
/*                                                                            */
/* This group carries the pane's title, its lead row, its five group captions   */
/* and one authored label per row — and NOT ONE KEY COMBINATION. Bindings are    */
/* function rather than identity and may be transcribed; the labels, captions    */
/* and headings around them may not. The bindings are declared in                */
/* `packages/ui/src/keyboard/registry.ts` and recorded, with their provenance,   */
/* in `docs/decisions/keyboard-shortcuts.md`, which the registry reads for the    */
/* keys while reading THIS module for the words.                                 */
/* -------------------------------------------------------------------------- */

/**
 * Every word the keyboard reference renders.
 *
 * FORTY-EIGHT LABELS IN FIVE GROUPS, and the label set and the grouping come from
 * `docs/decisions/keyboard-shortcuts.md` rather than from the reference panel visible
 * in the corpus: that panel's own captions and row copy are a third party's product
 * copy. The five captions here are this build's own. The corpus panel is additionally
 * scrollable and clipped at the foot of its capture, so a build that transcribed it
 * would be short a group as well as in breach.
 *
 * The registry carries a REFERENCE to one of these strings, never a string of its
 * own. That is what keeps the words in the file the identity guard watches most
 * closely, and it is why a label added to the map is added here first.
 */
export const keyboardShortcutCopy = {
  paneTitle: 'Keyboard shortcuts',
  paneOpenAction: 'Keyboard shortcuts',
  paneCloseAction: 'Close',
  paneBackAction: 'Back',
  /**
   * The lead row. It pairs the toggle combination with a statement about the pane
   * itself; the statement is here and the combination comes from the registry, so the
   * row can never advertise a key the handler does not implement.
   */
  leadRowLabel: 'Show or hide this reference',
  /** The column headings of the label-and-keys listing. */
  actionColumnLabel: 'Action',
  keysColumnLabel: 'Keys',
  /** Where one action has a second combination, this is how the pair is announced. */
  alternativeKeysLabel: 'or',
  /** The reference itself is searchable, because forty-eight rows is more than a glance. */
  searchPlaceholder: 'Search shortcuts',
  searchNoMatches: 'No shortcut matches that.',
  /** Provenance, carried into the interface so a reader can tell one from the other. */
  sourceTranscribedLabel: 'From the specification',
  sourceInventedLabel: 'Chosen for this product',

  /** Five captions, one per group, in the order the pane renders them. */
  groupCaptions: {
    globalNavigation: 'Moving around',
    conversationNavigation: 'Conversations',
    composerAndFormatting: 'Writing and formatting',
    overlaysAndModals: 'Menus and dialogs',
    sidebarAndRail: 'The conversation list',
  },

  /** Group one — moving around the shell. */
  globalNavigation: {
    toggleShortcutReference: 'Show or hide the shortcut reference pane',
    openConversationSwitcher: 'Open the conversation switcher',
    goBackInHistory: 'Return to the previously viewed surface',
    goForwardInHistory: 'Advance to the next viewed surface',
    openStatusEditor: 'Open the availability-status editor',
    focusSearchField: 'Move focus to the toolbar\u2019s search field',
    focusNextRegion: 'Move focus to the next shell region',
    focusPreviousRegion: 'Move focus to the previous shell region',
  },

  /** Group two — moving between conversations and destinations. */
  conversationNavigation: {
    goToConversationHome: 'Go to the conversation home destination',
    goToDirectMessages: 'Go to the person-to-person conversation destination',
    goToActivity: 'Go to the aggregated activity destination',
    goToSavedItems: 'Go to the saved-items destination',
    goToRailPosition: 'Go to the rail destination at that position',
    nextConversation: 'Move to the next conversation in the list order',
    previousConversation: 'Move to the previous conversation in the list order',
    nextUnreadConversation: 'Move to the next conversation carrying unread messages',
    previousUnreadConversation: 'Move to the previous conversation carrying unread messages',
  },

  /** Group three — writing, and the marks the toolbar applies. */
  composerAndFormatting: {
    sendDraft: 'Send the draft',
    insertLineBreak: 'Insert a line break in the draft',
    editLastMessage: 'Reopen the most recent message for editing',
    withdrawLastMessage: 'Withdraw the most recent message',
    bold: 'Bold the selection',
    italic: 'Italicise the selection',
    strikethrough: 'Strike through the selection',
    link: 'Turn the selection into a link',
    orderedList: 'Number the selected lines',
    bulletedList: 'Bullet the selected lines',
    blockquote: 'Quote the selected lines',
    inlineCode: 'Set the selection as fixed-width text',
    codeBlock: 'Set the selected lines as a fixed-width block',
  },

  /** Group four — menus, popovers, typeaheads, dialogs and the docked pane. */
  overlaysAndModals: {
    dismissTopmost: 'Close the topmost dismissible overlay',
    activateFocusedItem: 'Activate the focused item',
    toggleFocusedControl: 'Activate or toggle the focused control',
    nextControlInModal: 'Move to the next control inside the dialog\u2019s trapped order',
    previousControlInModal: 'Move to the previous control inside the trapped order',
    nextItem: 'Move to the next item',
    previousItem: 'Move to the previous item',
    firstItem: 'Move to the first item',
    lastItem: 'Move to the last item',
    previousTab: 'Move to the previous tab',
    nextTab: 'Move to the next tab',
  },

  /** Group five — the conversation list and the rail. */
  sidebarAndRail: {
    narrowSidebar: 'Narrow the conversation list',
    widenSidebar: 'Widen the conversation list',
    activateSidebarItem:
      'Activate the focused item — open the conversation, or open and close the section',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* 18. ACCOUNT TYPES                                                          */
/*                                                                            */
/* Display labels only. `docs/decisions/role-matrix.md` owns what each type may */
/* do, and nothing here is consulted by an authorization decision — a label is  */
/* a word on a screen, and client rendering is never evidence of permission.    */
/* -------------------------------------------------------------------------- */

/**
 * What each of the five account types is called.
 *
 * The guest is ONE type in two forms, and the forms differ in how many channels are
 * in the scope rather than in what may be done inside one — so they share this label
 * and are distinguished by `guestScopeLabels` below. The capability matrix gives them
 * two columns so a reader can see the answer is identical in both; this module gives
 * them one name for the same reason.
 */
export const roleLabels = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  guest: 'Guest',
  externalCollaborator: 'External collaborator',
} as const satisfies { readonly [K in RoleKey]: string };

/**
 * The two guest forms, where a surface genuinely has to tell them apart.
 *
 * Only an invitation surface needs this, because the only place the two forms
 * genuinely differ is how large a scope an invitation may name. Everywhere else a
 * guest is a guest, and using these labels elsewhere would imply a distinction in
 * standing that does not exist.
 */
export const guestScopeLabels = {
  singleChannel: 'Guest, one channel',
  severalChannels: 'Guest, several channels',
} as const;

/** Plural forms, for a surface counting people of one type. */
export const roleLabelsPlural = {
  owner: 'Owners',
  admin: 'Admins',
  member: 'Members',
  guest: 'Guests',
  externalCollaborator: 'External collaborators',
} as const satisfies { readonly [K in RoleKey]: string };

/* -------------------------------------------------------------------------- */
/* 19. ACCESSIBILITY                                                          */
/*                                                                            */
/* Wholly AUTHORED. The catalogue specifies zero accessibility behaviour        */
/* anywhere, so every string in this group is a decision rather than a          */
/* transcription. Nothing here is registered as a gap, because an absent         */
/* specification for accessibility is not a gap in the corpus — no capture could */
/* evidence an accessible name — it is simply work the specification never did.   */
/* -------------------------------------------------------------------------- */

/**
 * Accessible names, live-region announcements, and the four criteria automated
 * scanning cannot judge.
 *
 * THE FOUR EXPLICIT ASSERTIONS, and where each one's words live.
 *
 * Consistent help — the help entry appears in the same relative position on every
 * surface AND reads identically on every surface. Its label is `shellCopy.topBar.help`
 * and there is exactly one of it, deliberately, so a per-surface re-phrasing is not
 * available to anyone.
 *
 * Redundant entry — nothing already supplied is asked for twice, and where a value
 * legitimately reappears it is pre-filled and stated as such rather than re-requested.
 * `reenteredValueNote` is that statement.
 *
 * Accessible authentication — the verification-code field advertises a one-time code
 * so a password manager and the platform's own autofill can offer it, and paste is
 * permitted. `codeFieldAutofillHint` is the words; the field's own autofill hint is a
 * markup attribute belonging to the contract in `packages/ui`.
 *
 * Dragging movements — no interaction in this build has a drag-only path. Every
 * draggable thing has a keyboard equivalent, and these are its labels.
 */
export const a11yCopy = {
  /** Names for custom controls, which have no implicit name of their own. */
  menuLabel: 'Menu',
  submenuLabel: 'Submenu',
  tabListLabel: 'Sections',
  comboboxLabel: 'Search and choose',
  comboboxExpandedAnnouncement: 'Suggestions available',
  comboboxCollapsedAnnouncement: 'Suggestions closed',
  composerLabel: 'Message',
  composerRichTextHint: 'Rich text. Use the formatting controls or their shortcuts.',
  dialogLabel: 'Dialog',
  popoverLabel: 'Popover',
  /** Availability, which renders as a dot beside a picture and so needs words. */
  presenceActive: 'Active',
  presenceAway: 'Away',
  presenceOffline: 'Offline',
  presenceDoNotDisturb: 'Not to be disturbed',
  presenceUnknown: 'Availability unknown',
  presenceFor: (personName: string, presenceLabel: string): string =>
    `${personName}, ${presenceLabel}`,
  /** A picture of a person, and a stack of them. */
  avatarLabel: (personName: string): string => personName,
  avatarNoPhotoLabel: (personName: string): string => `${personName}, no photo`,
  facepileLabel: (count: number): string =>
    `${countText(count)} ${pluralise(count, 'person', 'people')} in this conversation`,
  facepileOverflowLabel: (count: number): string =>
    `and ${countText(count)} ${pluralise(count, 'other', 'others')}`,

  /**
   * The verification-code field. One character per box visually, one field
   * semantically — a set of boxes that each announce themselves separately is
   * unusable, which is why the accessible name belongs to the group.
   */
  codeFieldLabel: 'Verification code',
  codeFieldAutofillHint:
    'A one-time code. Your password manager or your device can fill it, and you can paste it.',
  codeFieldPositionAnnouncement: (position: number, total: number): string =>
    `Character ${countText(position)} of ${countText(total)}`,

  /** Redundant entry: a value already given is carried forward, not asked for again. */
  reenteredValueNote: 'Carried over from what you already entered.',

  /**
   * Dragging alternatives. Every one of these exists so that no interaction has a
   * drag-only path — a criterion automated scanning cannot judge, so it is asserted
   * with named controls rather than assumed.
   */
  moveWithKeyboardLabel: 'Move with the keyboard',
  moveUpLabel: 'Move up',
  moveDownLabel: 'Move down',
  moveToSectionLabel: 'Move to a section',
  reorderInstructions: 'Use the move controls, or the arrow keys once this has focus.',
  resizeWithKeyboardInstructions: 'Use the left and right arrow keys once the handle has focus.',

  /** Live-region announcements. A failure is assertive; a confirmation is polite. */
  liveRegionPoliteLabel: 'Status',
  liveRegionAssertiveLabel: 'Alert',
  /**
   * A message arriving while the reader is elsewhere in the list. It names the author
   * and the conversation and nothing more: the body is in the list, and announcing it
   * would read the whole conversation aloud as it arrived.
   */
  newMessageAnnouncement: (authorName: string, conversationName: string): string =>
    `New message from ${authorName} in ${conversationName}`,
  newMessagesAnnouncement: (count: number, conversationName: string): string =>
    `${countText(count)} new ${pluralise(count, 'message', 'messages')} in ${conversationName}`,
  /** A transient report cannot be dismissed and clears itself, so it must be announced. */
  outcomeAnnouncement: (sentence: string): string => sentence,
  /** Focus moved to a newly routed surface, so the reader is told the region changed. */
  surfaceChangedAnnouncement: (surfaceName: string): string => `${surfaceName}, loaded`,

  /** Typing indicators are ephemeral and never persisted, and they are announced sparingly. */
  someoneTyping: (personName: string): string => `${personName} is typing`,
  severalTyping: (count: number): string =>
    `${countText(count)} ${pluralise(count, 'person is', 'people are')} typing`,

  /** Reduced motion is honoured; this is what the preference is called where it is offered. */
  reducedMotionLabel: 'Reduce motion',

  /** Sorting and filtering state, which a chip communicates visually. */
  sortedByAnnouncement: (sortLabel: string): string => `Sorted by ${sortLabel}`,
  filteredByAnnouncement: (filterLabel: string): string => `Filtered by ${filterLabel}`,
  filterClearedAnnouncement: 'Filters cleared',

  /** Selection state in the conversation list's multi-select mode. */
  selectionChangedAnnouncement: (count: number): string => countCopy.conversationsSelected(count),

  /** Required and invalid state, so a field's condition is not carried by colour alone. */
  requiredFieldAnnouncement: 'Required',
  invalidFieldAnnouncement: 'Invalid',
  characterCountAnnouncement: (remaining: number): string =>
    countCopy.charactersRemaining(remaining),
} as const;

/* -------------------------------------------------------------------------- */
/* 20. THE DICTIONARY                                                         */
/*                                                                            */
/* One object composing every group above, and the type of that object. A       */
/* consumer may import a single group by name or take the whole dictionary; both */
/* resolve through the package barrel at `packages/shared/src/index.ts`, which   */
/* is this package's only entry point — its manifest declares no sub-entry, so a */
/* deep import into this file cannot resolve at all.                            */
/* -------------------------------------------------------------------------- */

/**
 * The nine value-bearing sentences this run names, gathered under one canonical set
 * of names.
 *
 * This object holds NO WORDS OF ITS OWN. Every member delegates to the sentence at
 * its semantic home above — `channelNameHelper` is the channel group's,
 * `sessionIdleWarning` is the session group's — so there is still exactly one
 * authored wording for each and this is an index over them rather than a second copy
 * of them.
 *
 * It exists because `PROJECT_RULE_R3`'s obligation on this module is a countable one:
 * each of these nine is a value the specification derives from a single frame or
 * leaves unevidenced altogether, and each must be a template that takes the value as
 * a parameter rather than a sentence with the value written into it. Gathering them
 * makes that obligation checkable in one place — the nine names are greppable, their
 * arities are visible together, and a tenth value-bearing sentence added to the module
 * has an obvious place to be registered. Reading the same guarantee out of five
 * scattered groups is how one of them eventually gets written as a literal.
 *
 * Each parameter is the value, never a default: the caller supplies what the record
 * in front of it actually holds. An invitation's expiry comes from the absolute
 * timestamp stored on that invitation, not from the configured default, which may
 * have changed since it was issued.
 */
export const valueBearingTemplates = {
  /** The channel-name rule, stated with the ceiling the caller passes in. */
  channelNameHelper: (maxLength: number): string => channelsCopy.channelNameHelper(maxLength),
  /** The live readout beside a bounded field, counting down. */
  charactersRemaining: (remaining: number): string => channelsCopy.charactersRemaining(remaining),
  /** The bar that REPLACES an archived conversation's composer. */
  archivedConversationBar: (conversationName: string): string =>
    readOnlyCopy.archivedConversation.bar(conversationName),
  /** One of three renderings of one trial field. The other two carry no number at all. */
  trialDaysRemaining: (days: number): string => gatingCopy.entitlement.trialDaysRemaining(days),
  /** Read from the credential's own stored expiry, never from today's default. */
  inviteLinkExpiresOn: (expiresAt: Date | string): string =>
    authCopy.invite.inviteLinkExpiresOn(expiresAt),
  /** The window an external invitation waits in before it lapses. */
  externalAcceptanceWindow: (days: number): string =>
    authCopy.invite.externalAcceptanceWindow(days),
  /** The guest's channel budget, and the allowance that lifts it. */
  guestChannelLimitReached: (limit: number): string =>
    authCopy.invite.guestChannelLimitReached(limit),
  /** A refusal that clears by itself, so it says when rather than why. */
  rateLimitedRetryIn: (seconds: number): string => connectionCopy.rateLimited.retryIn(seconds),
  /** Both session bounds are enforced on the server against a stored absolute expiry. */
  sessionIdleWarning: (minutes: number): string => authCopy.session.idleWarning(minutes),
} as const;

/**
 * The whole authored dictionary, in one object.
 *
 * The two toolbars appear here as two members and never as one, which is the same
 * separation the exports above keep and for the same reason: a pooled bucket of
 * composer controls is precisely what would let a caller render one contract's labels
 * inside the other, and `PROJECT_RULE_R5` names that pair as the exact trap.
 *
 * `conversationHero` sits beside `empty` rather than inside it, likewise
 * deliberately: the hero is not an empty state, it renders with messages beneath it,
 * and keeping it out of the empty group is what stops it being implemented as one.
 */
export const en = {
  counts: countCopy,
  shell: shellCopy,
  auth: authCopy,
  channels: channelsCopy,
  messaging: messagingCopy,
  composer: composerCopy,
  formattingToolbar: formattingToolbarCopy,
  composerActionRow: composerActionRowCopy,
  loading: loadingCopy,
  empty: emptyCopy,
  conversationHero: conversationHeroCopy,
  validation: validationCopy,
  precondition: preconditionCopy,
  failure: failureCopy,
  toast: toastCopy,
  durableOutcomeBar: durableOutcomeBarCopy,
  readOnly: readOnlyCopy,
  readOnlyTemplate: readOnlyTemplateCopy,
  gating: gatingCopy,
  permission: permissionCopy,
  connection: connectionCopy,
  serviceHealth: serviceHealthCopy,
  serviceStatus: serviceStatusCopy,
  placeholderSurface: placeholderSurfaceCopy,
  keyboardShortcut: keyboardShortcutCopy,
  roles: roleLabels,
  rolesPlural: roleLabelsPlural,
  guestScopes: guestScopeLabels,
  a11y: a11yCopy,
  valueBearingTemplates,
  marketingConsentWording: MARKETING_CONSENT_WORDING,
} as const;

/**
 * The dictionary's type.
 *
 * Derived from the dictionary rather than declared beside it, so the two can never
 * disagree: a group added to `en` is in `CopyDictionary` in the same edit, and a group
 * removed from `en` cannot be left behind in a hand-maintained interface. Every leaf
 * resolves to a definite string or to a definite function type, because the whole
 * module is built from `as const` literals and literal-keyed shapes rather than from
 * index signatures — which is what keeps `noUncheckedIndexedAccess` from handing a
 * consumer `string | undefined` and forcing a non-null assertion at each call site.
 */
export type CopyDictionary = typeof en;

/**
 * The keys of the dictionary, for a consumer that walks it.
 *
 * Exported because a guard, a test or a documentation generator that iterates the
 * dictionary should iterate a named set rather than the result of a runtime key read.
 */
export type CopyGroupKey = keyof CopyDictionary;
