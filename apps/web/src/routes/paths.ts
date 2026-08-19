/**
 * The client's URL map — every address this application can navigate to, declared exactly once.
 *
 * WHAT THIS MODULE IS
 *
 * The single definition site for every path in the client. A URL segment literal is written here
 * and nowhere else in the tree; every consumer reads a path from here by reference — `router.tsx`
 * for its route table, `shell/RailContainer.tsx` for its destination set, and
 * `shell/SidebarContainer.tsx`, `shell/TopBarContainer.tsx`, `shell/PaneHost.tsx` and
 * `shell/AppShell.tsx` for the addresses they navigate to.
 *
 * That is the uncertainty rule — the fourth of the five as provided — applied to routing: a value
 * consumed in more than one place is defined once and referenced, never re-typed at a point of
 * use. The failure it forecloses is specific and visible rather than theoretical. Were the route
 * table and the navigation rail each to write the same segment independently, one of them would
 * eventually be edited alone, and the rail would then offer a control that no route matches — a
 * dead control, which this build treats as a defect rather than as a rough edge.
 *
 * WHY IT IMPORTS NOTHING
 *
 * There is not one `import` statement below, and not one `import type` either. This module is
 * deliberately a leaf of the client's graph. `router.tsx` imports `shell/AppShell`, which imports
 * `shell/RailContainer`, which needs these paths; holding the map in `router.tsx` would close that
 * ring into the static cycle `router.tsx -> shell/AppShell -> shell/RailContainer -> router.tsx`.
 * A single import from here — a shared key union, a copy dictionary, a component type — would
 * re-open an equivalent ring by a different route. Zero imports is therefore a structural property
 * of the module rather than a stylistic preference, and it is why every type this file needs is
 * declared locally instead of borrowed.
 *
 * WHAT IT MAY NOT CONTAIN
 *
 *   - No configuration value. A ceiling, expiry, window, threshold or limit is a configured
 *     default and belongs to `@relay/shared`: compile-time invariants in its constants module,
 *     environment-overridable defaults in its environment module. This file holds URL structure and
 *     nothing else — no timer, no expiry, no limit, no duration.
 *   - No authorization semantics. A path is not a permission. No entry carries a role, a capability
 *     or a visibility flag; no destination is withheld from a viewer who probably cannot use it;
 *     and the administration-console and plan destinations are declared like any other. Whether an
 *     operation succeeds is decided on the server, at the point of execution, against the acting
 *     session and the specific target object. That is the authorization rule — the second as
 *     provided — and client rendering is never evidence of permission.
 *   - No visible string. A URL segment is an identifier a machine matches, not microcopy a person
 *     reads. Every label, heading, accessible name and document title lives in the authored copy
 *     dictionary in `@relay/shared`, which is where the identity rule — the fifth as provided —
 *     requires all of it to be authored.
 *   - No component, no element, no styling. This module is data and pure functions, so that each
 *     component contract keeps its single implementation in `packages/ui`.
 *
 * THE ONE RECORD IT MUST AGREE WITH
 *
 * `docs/decisions/placeholder-surfaces.md` owns the sixteen deferred destinations and their route
 * paths, and describes those segments as a closed enumeration that the placeholder read endpoint
 * validates against. The sixteen entries in `PATHS.placeholder` below agree with that record row
 * for row. Where a segment here and a segment there ever disagree, the record governs and this file
 * changes; the disagreement is reported in `docs/decisions/catalog-defects.md` rather than settled
 * by editing either one silently.
 *
 * HOW IT CITES
 *
 * A document citation names a file under `docs/workflows/` together with its line number. In prose
 * the path is written out in full, so that the catalog index is never confused with the
 * repository's own landing file; in an acceptance-criterion citation it takes the mandated short
 * form, which names the area document alone — unambiguous, because no area document shares a name
 * with anything outside that directory.
 * A frame is cited by its number alone: every filename in the corpus embeds a third-party product
 * name, and so does the catalog's own percent-encoded citation form, so neither may appear in a
 * committed file. No frame was opened to author this module and none needed to be — routing is
 * not visible in a screenshot, and every fact below came from catalog prose or from a decision
 * record.
 *
 * The five project rules are cited by subject and by position in the order they were provided,
 * never by their platform identifiers. Each of those identifiers embeds the same third-party
 * product name, so writing one into this file would breach the very rule the file is observing.
 *
 * Acceptance criteria are cited here, never claimed. Satisfaction is proven in `e2e/specs/**`,
 * where `e2e/specs/shell.spec.ts` asserts that every rail destination routes at 1280, 1024 and 768.
 */

/* -------------------------------------------------------------------------------------------------
 * Local types
 *
 * Declared here rather than imported, for the reason given above: this module has no dependencies.
 * ---------------------------------------------------------------------------------------------- */

/**
 * A destination addressed by an identifier, exposing the two forms its consumers need.
 *
 * `pattern` carries the parameter placeholder and is what the route table matches on. `build`
 * substitutes a concrete identifier and is what a navigation target uses. Both come from one
 * declaration — `build` is derived from `pattern` by {@link parameterisedRoute} — so the
 * matcher and the link can never drift apart, which is the same define-once discipline that puts
 * this module in the tree at all.
 */
export interface ParameterisedRoute<TPattern extends string = string> {
  /** The route pattern, parameter placeholder included, for the route table. */
  readonly pattern: TPattern;
  /**
   * Builds the concrete path for one identifier.
   *
   * The identifier is percent-encoded, so a value carrying a reserved character cannot alter the
   * shape of the address it is placed into. A blank identifier is rejected rather than encoded,
   * because the path it would produce carries a trailing separator and would resolve to a
   * different route than the caller asked for.
   *
   * @throws If `identifier` is empty or contains only whitespace.
   */
  readonly build: (identifier: string) => string;
}

/** The eleven unauthenticated gate surfaces, one key per module in `apps/web/src/routes/auth/`. */
export type GateRouteKey =
  | 'landing'
  | 'signUp'
  | 'verifyCode'
  | 'confirmEmail'
  | 'signIn'
  | 'signInWithCode'
  | 'resetRequest'
  | 'resetComplete'
  | 'acceptInvitation'
  | 'chooseWorkspace'
  | 'setupWizard';

/**
 * The authenticated surfaces that render inside the persistent shell's content region.
 *
 * `home` and `channelBrowse` are two destinations rather than one presentation of the same thing.
 * The catalog's own destination map counts the conversation-home destination and the channel
 * destination as separate entries among the twelve configurable rail destinations, both owned by
 * the channels area (`docs/workflows/00-product-overview.md` L642, L650), so each carries its own
 * path. Collapsing them onto one address would light both rail items as current at once.
 */
export type AppRouteKey =
  'home' | 'channelBrowse' | 'channelCreate' | 'channel' | 'channelDetails' | 'channelArchived';

/**
 * The sixteen deferred destinations, one key per module in `apps/web/src/routes/placeholders/`.
 *
 * This union and the paths it keys are governed by `docs/decisions/placeholder-surfaces.md`. It
 * must match the `PlaceholderSurfaceKey` union that `@relay/shared` declares for the placeholder
 * read endpoint, member for member — but it cannot reference that union, because this module
 * imports nothing. The compile-time assertion that the two agree therefore belongs to a consumer
 * that already imports both, `shell/RailContainer.tsx`, and never here.
 */
export type PlaceholderRouteKey =
  | 'threads'
  | 'directMessages'
  | 'search'
  | 'huddles'
  | 'canvases'
  | 'lists'
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
 * The nineteen destinations the navigation rail resolves: the sixteen deferred placeholders plus
 * `home`, `channels` and `later`.
 *
 * The rail is rendered from data rather than from a fixed row of controls, so its destination set
 * is a value the rail iterates and not a shape hard-coded into a component. Keeping all nineteen in
 * one union is what lets an exhaustive switch in `shell/RailContainer.tsx` fail to compile when a
 * destination is added without an address — including `later`, which is an alias rather than a
 * surface of its own and would otherwise be the easy one to forget.
 *
 * As with {@link PlaceholderRouteKey}, this union must agree member for member with the rail
 * destination union that `@relay/ui` declares, and the assertion that it does belongs to the
 * consumer that imports both.
 *
 * // AC: 00-product-overview.md L888 · frame 399
 */
export type RailRouteKey = PlaceholderRouteKey | 'home' | 'channels' | 'later';

/**
 * Shapes the four groups are checked against.
 *
 * Each group is written as an object literal and pinned with `satisfies`, which reports a missing
 * key and an excess key alike. That is what keeps a key union and the object it describes from
 * drifting in either direction without an import to bind them together.
 */
type GateRouteMap = Readonly<Record<GateRouteKey, string | ParameterisedRoute>>;
type AppRouteMap = Readonly<Record<AppRouteKey, string | ParameterisedRoute>>;
type PlaceholderRouteMap = Readonly<Record<PlaceholderRouteKey, string>>;
type RailRouteMap = Readonly<Record<RailRouteKey, string>>;

/* -------------------------------------------------------------------------------------------------
 * Deriving a builder from a pattern
 * ---------------------------------------------------------------------------------------------- */

/** The prefix the route matcher uses to mark a dynamic segment. */
const PARAMETER_PREFIX = ':';

/**
 * Pairs a route pattern with the path builder derived from it.
 *
 * Writing the pattern and the builder separately would put the same segment structure in two
 * places, which is the failure this module exists to prevent — so the builder is produced from
 * the pattern rather than beside it, and the two cannot disagree.
 *
 * The pattern is checked for its placeholder at construction, which happens when the module is
 * first evaluated. That is deliberate: a pattern and a parameter name that do not match is an
 * authoring mistake, and a mistake of that kind should surface at boot, loudly, rather than as a
 * link that silently points at the wrong address.
 *
 * @param pattern The route pattern, containing the placeholder exactly as the matcher reads it.
 * @param parameterName The parameter's name, without the matcher's prefix.
 * @throws If `pattern` does not carry the placeholder for `parameterName`.
 */
function parameterisedRoute<TPattern extends string>(
  pattern: TPattern,
  parameterName: string,
): ParameterisedRoute<TPattern> {
  const placeholder = `${PARAMETER_PREFIX}${parameterName}`;

  if (!pattern.includes(placeholder)) {
    throw new Error(
      `Route pattern "${pattern}" carries no "${placeholder}" segment, ` +
        'so no path builder can be derived from it.',
    );
  }

  return Object.freeze({
    pattern,
    build: (identifier: string): string => {
      const value = identifier.trim();

      if (value.length === 0) {
        throw new Error(
          `Route pattern "${pattern}" needs a non-empty "${placeholder}" value; ` +
            'a blank one would produce a trailing separator and address a different route.',
        );
      }

      // A replacer function is used in place of a replacement string so that no character in the
      // encoded value can be read back as a substitution pattern.
      return pattern.replace(placeholder, () => encodeURIComponent(value));
    },
  });
}

/* -------------------------------------------------------------------------------------------------
 * Segments
 *
 * The only place in the tree a URL segment literal is written. A nested address is composed from
 * the constant that holds its parent rather than by writing the parent out a second time, so the
 * hierarchy has one author per level.
 *
 * Every path begins with a separator, none ends with one, and none carries a query string, a
 * fragment or an origin: a path here is the whole of what the matcher sees and nothing more.
 * ---------------------------------------------------------------------------------------------- */

/**
 * The application root, and the one address that is a bare separator.
 *
 * It resolves to the minimal unauthenticated landing surface — entry to signing in and to signing
 * up, and nothing else. There is deliberately no marketing route of any kind: the public site is
 * not a shell route, it is a separate property, and this build ships only the one address an
 * unauthenticated visitor needs in order to get in (`docs/decisions/roadmap.md`).
 */
const ROOT_PATH = '/';

/* -- Gate segments: the eleven surfaces that render with no application shell at all. -- */

const SIGN_UP_PATH = '/sign-up';
const VERIFY_CODE_PATH = '/verify-code';
const CONFIRM_EMAIL_PATH = '/confirm-email';
const SIGN_IN_PATH = '/sign-in';

/** A second way to sign in, so it is composed under the sign-in segment rather than beside it. */
const SIGN_IN_WITH_CODE_PATH = `${SIGN_IN_PATH}/code` as const;

const RESET_REQUEST_PATH = '/reset-password';

/**
 * Where a new credential is chosen, composed under the request that begins the flow.
 *
 * It takes no parameter, and that is a security decision rather than an omission. The one-time
 * material this flow depends on belongs to the class of secrets that is never placed in a URL, so
 * it is entered into the surface instead of travelling in the address
 * (`docs/decisions/security-contracts.md`).
 */
const RESET_COMPLETE_PATH = `${RESET_REQUEST_PATH}/complete` as const;

const CHOOSE_WORKSPACE_PATH = '/choose-workspace';

/**
 * The multi-step workspace setup wizard.
 *
 * Named for what the wizard does, which is also how the catalog names the affordance that opens it
 * — a create-a-workspace action (`docs/workflows/01-onboarding-and-auth.md` L27).
 */
const SETUP_WIZARD_PATH = '/create-workspace';

/**
 * The parameter the invitation-acceptance address carries.
 *
 * It is a **lookup selector**, and the name says so on purpose. A workspace invitation is a
 * reusable capability link whose value is split in two: a non-secret selector that resolves the
 * record, and a secret part of which only a keyed verifier is ever stored. The selector alone is
 * not redeemable — redemption compares the secret part against that verifier in constant time and
 * re-checks expiry and revocation — so the selector is the half that may appear in an address
 * (`docs/decisions/security-contracts.md`).
 *
 * Which is why it is not called a token, a code, a secret or a key. Each of those names would
 * describe the half that must never reach a URL, and a name that misdescribes a credential is how
 * the wrong half eventually gets put here.
 */
const INVITATION_SELECTOR_PARAMETER = 'invitationSelector';
const ACCEPT_INVITATION_PATTERN = `/accept-invitation/:${INVITATION_SELECTOR_PARAMETER}` as const;

/* -- Authenticated segments: surfaces that render in the shell's routed content region. -- */

/**
 * The rail's first destination, and where an authenticated session lands.
 *
 * It is separate from the browse address because the catalog counts Home and Channels as two of the
 * twelve configurable rail destinations rather than as one
 * (`docs/workflows/00-product-overview.md` L642, L650). Navigating here replaces the content region
 * only: the rail, the sidebar and the top bar persist unchanged, because the three columns are
 * siblings and the content region is the one that changes
 * (`docs/workflows/00-product-overview.md` L307).
 *
 * // AC: 00-product-overview.md L887 · frame 113
 */
const HOME_PATH = '/home';

/**
 * The parameter a channel address carries.
 *
 * An identifier rather than a name, matching how the server addresses the same object
 * (`docs/decisions/http-api-contract.md`). It is an opaque record identifier, which is what keeps
 * the static create segment below from ever shadowing a real channel.
 */
const CHANNEL_ID_PARAMETER = 'channelId';

/** The channel collection, a plural noun as every collection in this product is. */
const CHANNEL_BROWSE_PATH = '/channels';

/**
 * Creating a channel.
 *
 * A static segment, which the matcher ranks above the dynamic segment below, so this address
 * resolves to the create surface rather than to a channel. Nothing is shadowed by that ranking
 * because a channel is addressed by an opaque identifier and never by a name a person chose.
 */
const CHANNEL_CREATE_PATH = `${CHANNEL_BROWSE_PATH}/new` as const;

/** One channel — the canonical address, and the one a deep link to a conversation carries. */
const CHANNEL_PATTERN = `${CHANNEL_BROWSE_PATH}/:${CHANNEL_ID_PARAMETER}` as const;

/**
 * A channel's detail surface.
 *
 * It has an address so that a deep link to it resolves and the browser's history works, but its
 * four tabs do **not**. The tabs are peers over one subject and never navigate away from the
 * channel, which is why a tab bar rather than routing carries them
 * (`docs/workflows/02-channels.md` L231 · frame 81). Tab selection is component state, and
 * adding a tab to this map would make the back button walk sideways through one surface.
 */
const CHANNEL_DETAILS_PATTERN = `${CHANNEL_PATTERN}/details` as const;

/**
 * An archived channel's read-only surface.
 *
 * Declared because an archived channel is a distinct surface and not the live one with its composer
 * disabled: the composer is replaced by a status bar, and the header loses its member count, its
 * huddle control and its bookmark row (`docs/workflows/02-channels.md` L434 · frame 134).
 *
 * Two consequences bind whoever routes it. Which surface renders is decided from the channel's
 * lifecycle state as the server answers it, never from a cached flag — archiving changes what may
 * be written to a channel and changes nothing about who may read it. And a deep link to the
 * canonical address above must still resolve for an archived channel, because a link that stops
 * working when a channel is archived would misreport a read authorization that has not changed.
 */
const CHANNEL_ARCHIVED_PATTERN = `${CHANNEL_PATTERN}/archived` as const;

/* -- Deferred destinations: the sixteen governed by `docs/decisions/placeholder-surfaces.md`. -- */

const THREADS_PATH = '/threads';
const DIRECT_MESSAGES_PATH = '/direct-messages';
const SEARCH_PATH = '/search';
const HUDDLES_PATH = '/huddles';
const CANVASES_PATH = '/canvases';
const LISTS_PATH = '/lists';
const WORKFLOW_BUILDER_PATH = '/workflow-builder';
const APPS_PATH = '/apps';
const ACTIVITY_PATH = '/activity';
const PEOPLE_PATH = '/people';
const PREFERENCES_PATH = '/preferences';
const FILES_PATH = '/files';
const EXTERNAL_CONNECTIONS_PATH = '/external-connections';

/**
 * The administration console.
 *
 * The console itself is a separately routed browser surface with its own top bar and its own
 * navigation, reached by a link out of this application rather than by a route within it
 * (`docs/workflows/README.md` L199 · frame 567). This address therefore resolves to a placeholder
 * that explains exactly that, so a member is told where administration lives instead of waiting for
 * a screen that was never going to appear in the shell.
 */
const ADMIN_CONSOLE_PATH = '/admin-console';

/**
 * Plan and entitlements.
 *
 * Billing and payment are out of scope for this run, so no purchase path exists. The upgrade-gate
 * contract still renders in full and its action resolves here, which is what keeps a gate that
 * ships from becoming a control that leads nowhere.
 */
const PLAN_PATH = '/plan';

const HELP_PATH = '/help';

/**
 * The catch-all the route table matches last, rendering the page-level failure surface.
 *
 * This is a pattern and not a navigable address, which is why it alone does not begin with a
 * separator: nothing links to it, and the matcher reaches it only when no other route claimed the
 * URL.
 */
const NOT_FOUND_PATTERN = '*';

/* -------------------------------------------------------------------------------------------------
 * Groups
 *
 * Every group is written with explicit named properties rather than an index signature. Under this
 * repository's compiler settings an indexed read yields a possibly-undefined value and has to be
 * narrowed at the call site, so a named property is what lets a consumer write `PATHS.gate.signIn`
 * and get a string. Each group is frozen at runtime and pinned with `satisfies` at compile time.
 * ---------------------------------------------------------------------------------------------- */

/**
 * The eleven gate surfaces, which render inside the unauthenticated page shell with no application
 * shell at all.
 */
const GATE_PATHS = Object.freeze({
  landing: ROOT_PATH,
  signUp: SIGN_UP_PATH,
  verifyCode: VERIFY_CODE_PATH,
  confirmEmail: CONFIRM_EMAIL_PATH,
  signIn: SIGN_IN_PATH,
  signInWithCode: SIGN_IN_WITH_CODE_PATH,
  resetRequest: RESET_REQUEST_PATH,
  resetComplete: RESET_COMPLETE_PATH,
  acceptInvitation: parameterisedRoute(ACCEPT_INVITATION_PATTERN, INVITATION_SELECTOR_PARAMETER),
  chooseWorkspace: CHOOSE_WORKSPACE_PATH,
  setupWizard: SETUP_WIZARD_PATH,
} as const satisfies GateRouteMap);

/**
 * The authenticated surfaces, mounted as children of the shell layout.
 *
 * The shell layout adds no segment of its own, so every pattern here is absolute and the channel
 * hierarchy is expressed in the segments rather than in relative route paths.
 */
const APP_PATHS = Object.freeze({
  home: HOME_PATH,
  channelBrowse: CHANNEL_BROWSE_PATH,
  channelCreate: CHANNEL_CREATE_PATH,
  channel: parameterisedRoute(CHANNEL_PATTERN, CHANNEL_ID_PARAMETER),
  channelDetails: parameterisedRoute(CHANNEL_DETAILS_PATTERN, CHANNEL_ID_PARAMETER),
  channelArchived: parameterisedRoute(CHANNEL_ARCHIVED_PATTERN, CHANNEL_ID_PARAMETER),
} as const satisfies AppRouteMap);

/**
 * The sixteen deferred destinations, in the order `docs/decisions/placeholder-surfaces.md` lists
 * them, so the two can be read side by side.
 *
 * Each resolves to a surface that names the capability, states that it is not built yet and names
 * the phase that will deliver it. None of them is a not-found response, a disabled control or a
 * hidden one: that is what makes the set a deferral rather than sixteen dead controls, and the
 * record carries the argument for each.
 */
const PLACEHOLDER_PATHS = Object.freeze({
  threads: THREADS_PATH,
  directMessages: DIRECT_MESSAGES_PATH,
  search: SEARCH_PATH,
  huddles: HUDDLES_PATH,
  canvases: CANVASES_PATH,
  lists: LISTS_PATH,
  workflowBuilder: WORKFLOW_BUILDER_PATH,
  apps: APPS_PATH,
  activity: ACTIVITY_PATH,
  people: PEOPLE_PATH,
  preferences: PREFERENCES_PATH,
  files: FILES_PATH,
  externalConnections: EXTERNAL_CONNECTIONS_PATH,
  adminConsole: ADMIN_CONSOLE_PATH,
  plan: PLAN_PATH,
  help: HELP_PATH,
} as const satisfies PlaceholderRouteMap);

/**
 * The nineteen addresses the navigation rail resolves, every one of them by reference to a path
 * declared above rather than by a second literal.
 *
 * The rail renders from this data, so a destination is live because it appears here and for no
 * other reason. Nothing in this group is conditional on who is looking: a destination is not a
 * permission, and one that a viewer cannot act on still resolves to a surface that says so.
 *
 * `later` is the one entry that is an alias rather than a surface of its own, and it is written as
 * an alias so that it reads as one. The catalog records the saved-items destination and the
 * aggregated activity destination as destinations of the **same** deferred area document
 * (`docs/workflows/00-product-overview.md` L645 · frame 113), and the sixteen placeholder segments
 * are a closed enumeration that carries no address for the former — so the activity-feed
 * placeholder is the surface that legitimately answers for both, and a resolvable alias keeps the
 * rail control live.
 *
 * Two alternatives were rejected. A seventeenth placeholder surface, because the sixteen are a
 * closed enumeration that another record owns and that the placeholder read endpoint validates
 * against. And leaving the destination unaddressed, because an unaddressed rail destination is a
 * dead control, and the uncertainty rule forbids omitting a mechanism whose target is uncertain.
 * The consequence — two rail destinations resolving to one placeholder — is accepted
 * deliberately and disappears the moment either capability is built. The judgement is recorded in
 * `docs/decisions/keyboard-shortcuts.md`, which resolves the same destination's numbered binding
 * to the same address, and the reconciliation is registered in
 * `docs/decisions/catalog-defects.md`.
 *
 * // AC: 00-product-overview.md L888 · frame 399
 */
const RAIL_PATHS = Object.freeze({
  home: APP_PATHS.home,
  channels: APP_PATHS.channelBrowse,
  later: PLACEHOLDER_PATHS.activity,
  threads: PLACEHOLDER_PATHS.threads,
  directMessages: PLACEHOLDER_PATHS.directMessages,
  search: PLACEHOLDER_PATHS.search,
  huddles: PLACEHOLDER_PATHS.huddles,
  canvases: PLACEHOLDER_PATHS.canvases,
  lists: PLACEHOLDER_PATHS.lists,
  workflowBuilder: PLACEHOLDER_PATHS.workflowBuilder,
  apps: PLACEHOLDER_PATHS.apps,
  activity: PLACEHOLDER_PATHS.activity,
  people: PLACEHOLDER_PATHS.people,
  preferences: PLACEHOLDER_PATHS.preferences,
  files: PLACEHOLDER_PATHS.files,
  externalConnections: PLACEHOLDER_PATHS.externalConnections,
  adminConsole: PLACEHOLDER_PATHS.adminConsole,
  plan: PLACEHOLDER_PATHS.plan,
  help: PLACEHOLDER_PATHS.help,
} as const satisfies RailRouteMap);

/* -------------------------------------------------------------------------------------------------
 * The map
 * ---------------------------------------------------------------------------------------------- */

/**
 * Every address in the client, grouped by the branch of the route table that serves it.
 *
 * Frozen at runtime and readonly throughout at compile time, so a path can be neither reassigned by
 * a consumer nor mutated by one. A map that any consumer could edit would not be a single
 * definition site; it would be the first of them.
 *
 * `PATHS.gate` — the eleven unauthenticated surfaces, of which `landing` is the root.
 * `PATHS.app` — the authenticated surfaces that render in the shell's content region.
 * `PATHS.placeholder` — the sixteen deferred destinations.
 * `PATHS.rail` — the nineteen destinations the navigation rail resolves.
 * `PATHS.notFound` — the catch-all pattern the route table matches last.
 *
 * @example
 * ```ts
 * // A route table matches on a pattern, and pairs it with the surface it renders.
 * const route = { path: PATHS.app.channel.pattern, element: channelViewElement };
 *
 * // A navigation target builds a concrete address from an identifier.
 * navigate(PATHS.app.channel.build(channelId));
 *
 * // The rail iterates its destinations; every one of them resolves.
 * const destination = PATHS.rail[railRouteKey];
 * ```
 */
export const PATHS = Object.freeze({
  gate: GATE_PATHS,
  app: APP_PATHS,
  placeholder: PLACEHOLDER_PATHS,
  rail: RAIL_PATHS,
  notFound: NOT_FOUND_PATTERN,
} as const);
