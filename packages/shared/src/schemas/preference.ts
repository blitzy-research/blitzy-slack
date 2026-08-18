/**
 * Viewer preferences — and the one correct home for a dismissed banner.
 *
 * WHY THIS MODULE EXISTS AND WHY ITS PLACEMENT IS THE WHOLE POINT
 *
 * A preference is per-viewer by construction. The consolidated data model states
 * the rule once, for nine area documents at once, and calls it "the single most
 * consequential correction" in that model: per-viewer state is a relation, never
 * a field of a shared entity (`docs/workflows/README.md` L357). The relation
 * table then names this module's subject explicitly — dismissed banners and
 * explanatory blocks are "held as fields of the viewer's own `E-PREFERENCE`
 * record rather than of the object dismissed" (`docs/workflows/README.md` L372).
 *
 * `S-PERUSER` supplies the test that decides every field below
 * (`docs/workflows/00-product-overview.md` L562-L566): *if two people opened this
 * at the same moment, could they legitimately see different values?* If yes, the
 * value belongs on a per-viewer relation. That contract names "default-preference
 * choices" among the values it governs, which is exactly this record. Every field
 * declared in this file answers that question **yes** — that is what makes the
 * placement correct, and it is the review question to ask of any field added later.
 *
 * THE CONSEQUENCE OF GETTING IT WRONG, STATED PLAINLY
 *
 * Store a dismissal on the banner, on the channel, or on the workspace and two
 * distinct failures follow at once. First, one person dismissing a banner
 * dismisses it for everyone, because there is only one place for the flag to
 * live. Second, that flag becomes readable by every other member of the shared
 * object, so it discloses that person's behaviour to them — which is why
 * `S-PERUSER` frames the placement as a security requirement rather than a
 * modelling preference (`docs/workflows/README.md` L357). A single captured
 * session can never distinguish the two placements, because one session renders
 * one viewer's values under either model. The contract decides it, not the pixels.
 *
 * HOW THE PROJECT RULES ARE CITED BELOW
 *
 * The five binding project rules are cited here by their requirement label, R1
 * to R5, and never by their full identifier. That is not shorthand and not
 * laziness: each rule's full identifier is prefixed with a third-party product
 * name, and rule R4 forbids that name appearing in source or in comments. The
 * label is therefore the only citation form that lets this file name the rule
 * governing it without breaching the rule governing names — the same reasoning
 * the workspace lint configuration gives for keeping the identity check out of
 * authored source and inside a dedicated guard. The label-to-identifier mapping
 * is published in the technical specification's rule cross-reference, and the
 * full text of every rule is available through the platform's rule interface.
 *
 *   R1 — authorization is server-side only; never trust a caller-supplied actor
 *   R2 — corpus and specification handling; the read-only inputs
 *   R3 — uncertainty is never permission to omit functionality
 *   R4 — third-party identity is never reproduced
 *   R5 — a shared component contract is implemented exactly once
 *
 * RULES THAT GOVERN THIS FILE
 *
 * - **R1** — authorization is server-side and never rests on a
 *   caller-supplied actor. **No shape in this file carries an identifier for the
 *   person the preferences belong to**, in any spelling: not for the viewer, the
 *   user, the acting principal, nor an act-on-behalf-of parameter. The acting
 *   session supplies that identity server-side. This is the module where the
 *   temptation is strongest, because a preferences endpoint "obviously" concerns
 *   a person — it does, and that person is the session. A read of this record is
 *   a projection over the reader's own row: one viewer's preferences are never
 *   readable by another, and a shape that returned them would disclose that
 *   person's behaviour.
 * - **R4** — identity is never reproduced. The colour-mode and
 *   accent preferences are modelled as **authored theme and swatch identifiers,
 *   never as colour values**. There is no hexadecimal literal, no channel triple
 *   and no colour name in this file. The catalog records a chosen theme colour
 *   offered as a twelve-swatch grid during first run (frame 26); what is modelled
 *   here is the *choice*, and the value each choice resolves to is a design token
 *   defined in `packages/ui/src/styles/tokens.ts`, the only file in the tree
 *   permitted a palette. No rendered copy appears here either: a banner's text
 *   lives in `packages/shared/src/copy/en.ts`, which this module does not import,
 *   because what is stored is an identifier and never a string of prose.
 * - **R3** — uncertainty is not permission to omit. Every bound
 *   below is a named constant consumed by reference rather than a literal at a
 *   point of use. Every instant is an **absolute** instant, never a duration. The
 *   corpus shows neither a banner being dismissed nor a preference centre in use,
 *   so both mechanisms are open work items — and both ship here in full rather
 *   than being deferred for want of a screenshot.
 * - **R2** — this file sits under `packages/`, frames are cited
 *   by number alone, and where the catalog contradicts itself the contradiction
 *   is referenced rather than corrected. One such contradiction bears directly on
 *   this record and is noted at the theme declaration below.
 * - **R5** — `C-BANNER` and `C-COACH-MARK` are contract modules
 *   in `packages/ui` that **read** dismissal state; they do not own it. The
 *   dismissible registry is declared here once so that no component invents a
 *   key of its own and no two components disagree about the same key.
 *
 * NAMING CONVENTIONS, FIXED HERE SO CONSUMERS CAN RELY ON THEM
 *
 * - Enumerated preference values and dismissible identifiers are kebab-case.
 *   They are stable keys that travel through URLs, attributes and stored rows.
 * - Rejection codes are snake_case and machine-readable. Every check below
 *   overrides zod's default message with one of them, because the default is
 *   human prose and this module renders none: prose belongs to the copy module.
 *
 * WHAT IS DELIBERATELY NOT MODELLED HERE
 *
 * - **No credential of any class.** `S-SECRET` places passwords, one-time codes,
 *   enrolment codes and sessions on their own lifecycle-bearing records, never as
 *   fields of an entity a read path returns. This record is returned by a read
 *   path, so it carries none of them.
 * - **No marketing-consent field.** `S-MARKETING` requires that population to be
 *   held separately from the workspace member record, and the catalog places the
 *   affirmative act on a public form-submission structure rather than on any
 *   entity. The act is modelled in `packages/shared/src/schemas/auth.ts`.
 * - **No search history.** That is its own per-viewer relation
 *   (`docs/workflows/README.md` L371) with its own access contract, and search is
 *   deferred beyond this phase.
 * - **No unread count, read marker, unread boundary, star, saved-for-later flag,
 *   reminder time, last-viewed timestamp, draft marker or sidebar placement.**
 *   Each of those is per-viewer too, but each belongs to a relation keyed by
 *   *viewer and object* — conversation membership, viewer-and-message,
 *   viewer-and-thread and their siblings (`docs/workflows/README.md` L363-L371).
 *   This record is keyed by the viewer alone, so a value that needs an object to
 *   be meaningful does not belong in it. That boundary is the reason this file
 *   stays small.
 *
 * This module is side-effect free and imports nothing but its schema library.
 *
 * @see docs/workflows/README.md — L357, L363-L372 (per-viewer relations), L342 (`E-PREFERENCE`)
 * @see docs/workflows/00-product-overview.md — L562-L566 (`S-PERUSER`), L335 (`C-BANNER`), L324 (`C-MESSAGE-ROW`)
 * @see docs/decisions/theme-and-color.md — the dark-theme derivation over shared token names
 * @see docs/decisions/gap-register.md — the unevidenced mechanisms shipped here
 * @see docs/decisions/catalog-defects.md — the recorded placement contradiction
 */

import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Rejection codes                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Every way a preference payload can be rejected, as a machine-readable code.
 *
 * These are codes and not messages. A caller matches on them; a rendered
 * sentence for a person is resolved from the copy module by whichever surface is
 * reporting the failure. Keeping prose out of this module is what allows the
 * same schema to validate on the server, type the client and generate the API
 * specification without three different wordings escaping into one contract.
 *
 * Each code is attached to the specific check that can produce it, so a
 * rejection identifies which rule was broken rather than merely that something
 * was wrong. zod's own defaults are deliberately overridden everywhere for that
 * reason — an unoverridden check would surface English prose from a dependency.
 */
export const PREFERENCE_REJECTION = {
  /** The payload was not an object, or was absent entirely. */
  malformedPayload: 'preference_malformed_payload',
  /**
   * A dismissible identifier outside the registry declared in this module.
   * A free-form key would let a caller write unbounded keys into a viewer's
   * record, and would let a component invent a key nothing else recognises.
   */
  unknownDismissible: 'preference_unknown_dismissible',
  /** The same dismissible appeared more than once in one collection. */
  duplicateDismissal: 'preference_duplicate_dismissal',
  /** More dismissal entries than there are registered dismissibles. */
  dismissalLimitExceeded: 'preference_dismissal_limit_exceeded',
  /** Not one of the three colour modes. A colour value is never accepted here. */
  invalidTheme: 'preference_invalid_theme',
  /** Not one of the twelve authored accent swatch identifiers. */
  invalidAccent: 'preference_invalid_accent',
  /** Not one of the two message densities the message row implements. */
  invalidDensity: 'preference_invalid_density',
  /** Not one of the three motion settings. */
  invalidMotion: 'preference_invalid_motion',
  /** Not a bounded, well-formed language tag. */
  invalidLocale: 'preference_invalid_locale',
  /** Not a named time zone. A numeric offset is rejected by this code. */
  invalidTimeZone: 'preference_invalid_time_zone',
  /** Not one of the three account-level notification scopes. */
  invalidNotificationDefault: 'preference_invalid_notification_default',
  /** Not an absolute instant expressed in coordinated universal time. */
  invalidInstant: 'preference_invalid_instant',
  /** An update that changes nothing. Rejected so a no-op cannot look applied. */
  emptyUpdate: 'preference_empty_update',
} as const;

/** Schema for a rejection code, for any surface that transports one. */
export const preferenceRejectionCodeSchema = z.enum(PREFERENCE_REJECTION, {
  error: PREFERENCE_REJECTION.malformedPayload,
});

/** The union of every rejection code this module can produce. */
export type PreferenceRejectionCode = z.infer<typeof preferenceRejectionCodeSchema>;

/* -------------------------------------------------------------------------- */
/* Bounds — each declared once, consumed by reference                         */
/* -------------------------------------------------------------------------- */

/**
 * Shortest acceptable language tag: a bare two-letter language subtag.
 *
 * These bounds are structural properties of the contract rather than product
 * durations or thresholds, so they belong with the shape they constrain instead
 * of in the environment-overridable configuration module. What rule R3 forbids
 * is a bound restated at a point of use, and each one here is declared exactly
 * once and referenced everywhere it applies.
 */
export const LOCALE_MIN_LENGTH = 2;

/**
 * Longest acceptable language tag.
 *
 * Twelve characters admits the longest shape this contract accepts — a
 * three-letter language subtag with both a script and a region subtag — while
 * still refusing an unbounded string from an untrusted caller.
 */
export const LOCALE_MAX_LENGTH = 12;

/**
 * Accepted shape of a language tag: a language subtag, an optional script
 * subtag, and an optional region subtag given as letters or as a numeric area
 * code.
 *
 * Deliberately narrower than the full tag grammar. A preference needs to name a
 * language and, where it matters, a script and a region; extensions and private
 * use carry no meaning for this record and admitting them would widen the stored
 * value for nothing. Anchored at both ends so a partial match cannot pass.
 */
export const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|[0-9]{3}))?$/;

/**
 * Shortest acceptable time-zone identifier, which is the coordinated universal
 * time zone itself.
 */
export const TIME_ZONE_MIN_LENGTH = 3;

/**
 * Longest acceptable time-zone identifier, comfortably clear of the longest
 * three-segment names in the public zone database.
 */
export const TIME_ZONE_MAX_LENGTH = 64;

/**
 * Accepted shape of a time-zone identifier: the coordinated universal time zone,
 * or a canonical area-and-location name of two or three slash-separated
 * segments.
 *
 * The requirement this pattern discharges is that a zone is **named and never an
 * offset**, so that a stored preference survives a change in a region's rules
 * instead of freezing yesterday's arithmetic. A bare numeric offset cannot match:
 * every segment must begin with a letter, and any candidate other than the
 * universal zone must carry at least one separator. Single-segment legacy
 * aliases are not accepted — the canonical area-and-location form is unambiguous
 * and is what a client should send.
 */
export const TIME_ZONE_PATTERN =
  /^(?:UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z][A-Za-z0-9_+-]*){1,2})$/;

/* -------------------------------------------------------------------------- */
/* The dismissible registry — declared once, for the whole product            */
/* -------------------------------------------------------------------------- */

/**
 * Every element a viewer may dismiss, as a closed registry.
 *
 * WHY A CLOSED REGISTRY RATHER THAN A FREE STRING
 *
 * Two failures follow from accepting an arbitrary key. A caller could write
 * unbounded keys into a viewer's own record, which is both a storage-growth
 * problem and a write primitive nobody authorized. And a component could invent a
 * key that nothing else recognises, so a banner would be dismissed against one
 * spelling and read back against another — the dismissal silently never sticking.
 * A closed union makes both impossible at the boundary and makes the set
 * enumerable, which is what lets a surface reason about "everything this viewer
 * has dismissed".
 *
 * ADDING A DISMISSIBLE MEANS ADDING A MEMBER HERE. That is the point, not a
 * friction to route around: a new dismissible element is a new fact stored on
 * every viewer's record, and it should be a deliberate edit to one reviewed list
 * rather than a string literal appearing in a component. `C-BANNER` and
 * `C-COACH-MARK` in `packages/ui` read this state; per rule R5
 * they do not own it and must not mint keys of their own.
 *
 * WHAT IS IN THE REGISTRY, AND WHY EACH MEMBER IS HERE
 *
 * The members are the dismissible elements this phase actually ships, drawn from
 * the four surface families the phase covers. `C-BANNER`'s own contract
 * enumerates the banner variants (`docs/workflows/00-product-overview.md` L335)
 * and the area documents evidence where each one renders.
 *
 * A NOTE ON EVIDENCE, RECORDED RATHER THAN SMOOTHED OVER
 *
 * `C-BANNER`'s state list closes with "non-dismissible (no dismiss control
 * observed on the sidebar promotional banner)". That is an absence of
 * observation, not a prohibition, and the catalog's discipline is to record
 * absence as absence. Per rule R3 an absent observation is an open
 * work item rather than permission to omit the mechanism, so the identifier
 * exists and the mechanism works. Whether that variant *renders* a dismiss
 * control remains `C-BANNER`'s decision in `packages/ui`; this registry only
 * guarantees there is one agreed key to record the outcome against. The reasoning
 * is recorded in `docs/decisions/gap-register.md`.
 */
export const DISMISSIBLE_IDS = [
  /**
   * The promotional banner occupying the sidebar's banner slot beneath the
   * workspace switcher — a glyph, an offer line and a countdown sub-line
   * (frames 19, 341, 560).
   */
  'sidebar-promotional-banner',
  /**
   * The promotional block nested inside the workspace switcher's list, a
   * separate `C-BANNER` variant from the sidebar slot above it.
   */
  'workspace-switcher-promotional-block',
  /**
   * The channel browser's tinted hero band, which the channels area records as
   * dismissible with a dismiss control at its top-right (frame 125).
   */
  'channel-browser-hero-band',
  /**
   * The four-step first-run coached tour over the live shell, whose card carries
   * a dismiss control on its illustration header (frames 25, 26, 27). One key
   * covers the tour rather than one key per step: dismissing it ends the tour,
   * and step progress is transient rather than a stored preference.
   */
  'first-run-tour',
  /**
   * The composer prompts that follow the tour and offer openers a viewer can
   * move into the composer as editable text (frames 28, 29, 30).
   */
  'composer-suggestion-strip',
  /**
   * The notification-permission band pinned to the viewport foot, carrying a
   * glyph, a sentence, an action link and a dismiss control (frames 19, 23).
   */
  'notification-permission-band',
  /**
   * The device-warning band pinned to the viewport foot on a warning treatment,
   * a distinct `C-BANNER` variant from the permission request above it.
   */
  'device-warning-band',
  /**
   * The advisory callout the cross-cutting states area describes, rendered inside
   * a page or dialog body above the controls it concerns (frames 569, 580, 606).
   * That area records one form of it — the deprecation advisory — as rendering no
   * dismissal affordance, which again is an absence of observation rather than a
   * prohibition, and is handled the same way as the sidebar banner above.
   */
  'states-advisory-callout',
  /**
   * The access-required band across the top of an unauthenticated page, stating
   * that signing in is needed to reach the requested destination (frame 735).
   */
  'access-required-advisory',
] as const;

/**
 * A dismissible identifier — a literal union over the registry, never a string.
 *
 * Built from the registry above so the union and the enumerable list cannot
 * drift apart; there is one declaration and two views of it.
 */
export const dismissibleIdSchema = z.enum(DISMISSIBLE_IDS, {
  error: PREFERENCE_REJECTION.unknownDismissible,
});

/** One of the registered dismissible elements. */
export type DismissibleId = z.infer<typeof dismissibleIdSchema>;

/**
 * The most dismissal entries a viewer's record can hold.
 *
 * Derived from the registry rather than chosen, because the two can never
 * legitimately disagree: a viewer cannot have dismissed more distinct elements
 * than exist. Deriving it also means the bound follows the registry
 * automatically, so adding a dismissible cannot leave a stale ceiling behind.
 */
export const DISMISSED_ENTRY_MAX = DISMISSIBLE_IDS.length;

/* -------------------------------------------------------------------------- */
/* Colour mode and accent — a choice, never a colour                          */
/* -------------------------------------------------------------------------- */

/**
 * Colour mode.
 *
 * Three options, which is what the catalog observed: the themes category holds
 * "a theme choice and a system colour mode" and the mode itself is "held as a
 * three-option segmented control" (`docs/workflows/README.md` L342, frames 553
 * and 536). Following the platform is therefore a first-class stored choice
 * rather than the absence of one — a viewer who has never chosen and a viewer who
 * has deliberately chosen to follow their system are different states, and only
 * an explicit member can tell them apart.
 *
 * The dark theme is a derivation over the **same** token names rather than a
 * separate palette, which is why this preference selects a mode and nothing else:
 * no consumer branches on theme, and no component receives a colour through it.
 * The derivation is recorded in `docs/decisions/theme-and-color.md`.
 *
 * A RECORDED CONTRADICTION, NOT A CORRECTION. The catalog places a chosen theme
 * colour among `E-USER`'s fields (`docs/workflows/01-onboarding-and-auth.md`
 * L778) while `E-PREFERENCE` separately owns the themes category
 * (`docs/workflows/README.md` L342). The relation table settles it on its own
 * terms — "where the two appear to disagree about a per-viewer fact, this table
 * governs" (`docs/workflows/README.md` L374) — and `S-PERUSER` agrees, since two
 * people in one workspace may plainly hold different colour modes. The preference
 * record is therefore the placement, and the contradiction is referenced in
 * `docs/decisions/catalog-defects.md` per rule R2 rather than
 * edited out of the read-only catalog.
 */
export const themeSchema = z.enum(['light', 'dark', 'system'], {
  error: PREFERENCE_REJECTION.invalidTheme,
});

/** The viewer's colour mode: an explicit mode or a deference to the platform. */
export type Theme = z.infer<typeof themeSchema>;

/**
 * The accent swatch a viewer chose, as an authored positional identifier.
 *
 * The catalog records a grid of twelve colour swatches with one selected, offered
 * during first run (frame 26). Twelve members model that grid exactly. The
 * identifiers are **positional and carry no colour**, which is deliberate on two
 * counts. Rule R4 forbids sampling a colour from any frame and
 * forbids a brand colour value appearing anywhere in source, so the stored value
 * must name a slot rather than a shade. And the value each slot resolves to is a
 * design token in `packages/ui/src/styles/tokens.ts` — the single file in the tree
 * permitted a palette — so naming a colour here would create a second source for
 * something that must have exactly one.
 *
 * A positional identifier also survives a palette revision without a data
 * migration, because the slot outlives whatever it currently resolves to.
 */
export const accentSwatchSchema = z.enum(
  [
    'accent-01',
    'accent-02',
    'accent-03',
    'accent-04',
    'accent-05',
    'accent-06',
    'accent-07',
    'accent-08',
    'accent-09',
    'accent-10',
    'accent-11',
    'accent-12',
  ],
  { error: PREFERENCE_REJECTION.invalidAccent },
);

/** One of the twelve accent slots. Resolves to a token, never to a colour. */
export type AccentSwatch = z.infer<typeof accentSwatchSchema>;

/* -------------------------------------------------------------------------- */
/* Reading and motion                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Message density.
 *
 * Two members, because the corpus evidences exactly two and the catalog is
 * explicit that "both are shell-level layout decisions the build must support"
 * (`docs/workflows/00-product-overview.md` L240). `C-MESSAGE-ROW` carries both as
 * variants: the comfortable form leads with an avatar and puts author and
 * timestamp on a header line above the body, and the compact form puts timestamp,
 * author and body on one line with no avatar
 * (`docs/workflows/00-product-overview.md` L324, frames 549 and 560). The
 * distinction changes row anatomy rather than only spacing, which is why it is a
 * density preference rather than a spacing scale.
 *
 * The measured row pitch for each density is a design token —
 * `--row-pitch-comfortable` and `--row-pitch-compact` in
 * `packages/ui/src/styles/tokens.ts` — and not a value in this contract. This
 * preference selects which of them applies.
 */
export const messageDensitySchema = z.enum(['comfortable', 'compact'], {
  error: PREFERENCE_REJECTION.invalidDensity,
});

/** Which message-row anatomy the viewer reads conversations in. */
export type MessageDensity = z.infer<typeof messageDensitySchema>;

/**
 * Motion setting.
 *
 * Respecting a reduced-motion preference is an authored accessibility obligation:
 * the catalog specifies no accessibility behaviour at all, so all of it is
 * authored rather than observed. Following the platform is the default position,
 * but a viewer can force either answer — a platform signal is a good default and
 * a poor prison, and someone whose device reports no preference may still need
 * motion suppressed. Three members are therefore the smallest coherent set:
 * defer, force suppression, force full motion.
 */
export const motionPreferenceSchema = z.enum(['system', 'reduce', 'no-preference'], {
  error: PREFERENCE_REJECTION.invalidMotion,
});

/** Whether the viewer defers to the platform's motion signal or overrides it. */
export type MotionPreference = z.infer<typeof motionPreferenceSchema>;

/* -------------------------------------------------------------------------- */
/* Language and region                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The viewer's language tag, bounded and shape-validated.
 *
 * Both bounds and the shape are applied, and each check carries its own rejection
 * code so a caller learns which rule it broke. The pattern already implies a
 * length, but the explicit bounds are what stop an untrusted caller submitting a
 * megabyte for the regular expression to consider.
 */
export const localeSchema = z
  .string({ error: PREFERENCE_REJECTION.invalidLocale })
  .min(LOCALE_MIN_LENGTH, { error: PREFERENCE_REJECTION.invalidLocale })
  .max(LOCALE_MAX_LENGTH, { error: PREFERENCE_REJECTION.invalidLocale })
  .regex(LOCALE_PATTERN, { error: PREFERENCE_REJECTION.invalidLocale });

/** A well-formed, bounded language tag. */
export type Locale = z.infer<typeof localeSchema>;

/**
 * The time zone the viewer sees times in, as a **named zone and never an offset**.
 *
 * A named zone carries its region's rules, including the changes those rules are
 * subject to; an offset carries one moment's arithmetic and is wrong the next time
 * the region shifts. Storing the name is what makes a time rendered next year
 * correct rather than merely consistent with last year, and it is the same
 * convention scheduled delivery uses in
 * `packages/shared/src/schemas/message.ts`, so a scheduled send and its rendered
 * time agree about what zone means.
 */
export const timeZoneSchema = z
  .string({ error: PREFERENCE_REJECTION.invalidTimeZone })
  .min(TIME_ZONE_MIN_LENGTH, { error: PREFERENCE_REJECTION.invalidTimeZone })
  .max(TIME_ZONE_MAX_LENGTH, { error: PREFERENCE_REJECTION.invalidTimeZone })
  .regex(TIME_ZONE_PATTERN, { error: PREFERENCE_REJECTION.invalidTimeZone });

/** A named time zone identifier. */
export type TimeZone = z.infer<typeof timeZoneSchema>;

/* -------------------------------------------------------------------------- */
/* Account-level notification default                                         */
/* -------------------------------------------------------------------------- */

/**
 * The account-level notification scope — the default a conversation inherits when
 * it has no override of its own.
 *
 * WHY THIS BELONGS HERE AND THE OVERRIDE DOES NOT
 *
 * The channel details surface's notifications modal offers this same scope and
 * then links out to the acting account's workspace-wide settings — the catalog is
 * explicit that the link goes there "rather than to a channel-level default"
 * (`docs/workflows/02-channels.md` L809, frame 92). That
 * link is the catalog's own evidence for the composition: the per-channel choice
 * *overrides* an account-level default, so the default has to live somewhere the
 * viewer owns account-wide — this record — while the override lives beside the
 * conversation it overrides.
 *
 * The **per-channel override and its separate mute flag are therefore not fields
 * of this record.** They sit on the channel-membership record keyed by the pair of
 * channel and member, modelled in `packages/shared/src/schemas/channel.ts`, for
 * the reason `S-PERUSER` gives: stored on the channel, one person muting it mutes
 * it for everyone, and one member's notification choice becomes readable by every
 * other member (`docs/workflows/02-channels.md` L809). Mute is a separate flag
 * from scope rather than a fourth scope member, because the catalog observes them
 * as independent controls — a muted channel still badges on a mention.
 *
 * The three members are the scopes the corpus shows on that radio group: all new
 * messages, mentions only, and nothing (`docs/workflows/02-channels.md` L255,
 * frame 92; corroborated by `E-CHANNEL`'s own field list at
 * `docs/workflows/README.md` L327, frame 89). **This union is the shared
 * vocabulary for both levels** — the per-channel override reuses these member
 * values rather than declaring parallel ones, which is what lets an override
 * compose with a default instead of needing translation between two spellings.
 */
export const notificationScopeSchema = z.enum(['all-messages', 'mentions', 'off'], {
  error: PREFERENCE_REJECTION.invalidNotificationDefault,
});

/**
 * A notification scope, at either level.
 *
 * Named for the concept rather than for this record's use of it, because the
 * per-channel override is the same vocabulary applied one level down.
 */
export type NotificationScope = z.infer<typeof notificationScopeSchema>;

/* -------------------------------------------------------------------------- */
/* Dismissals — the identifier plus a server-assigned absolute instant        */
/* -------------------------------------------------------------------------- */

/**
 * An absolute instant, expressed in coordinated universal time.
 *
 * Rule R3 requires that a record store an absolute timestamp
 * rather than a duration, so that a configured default can change without
 * invalidating what is already stored. A local time without a zone and a time
 * carrying a numeric offset are both rejected: the first is ambiguous and the
 * second invites a caller to assert its own clock's relationship to the truth.
 * One representation means a stored instant compares and sorts without
 * normalisation.
 */
export const absoluteInstantSchema = z.iso.datetime({
  offset: false,
  error: PREFERENCE_REJECTION.invalidInstant,
});

/** An absolute instant in coordinated universal time. */
export type AbsoluteInstant = z.infer<typeof absoluteInstantSchema>;

/**
 * One dismissal on a viewer's own record: which element, and when.
 *
 * The instant is recorded because a dismissal is an act with a time, and a
 * re-introduced element can then be shown again to viewers who dismissed its
 * earlier form without resetting everyone. Keeping the instant is what makes that
 * possible later; storing a bare set of identifiers would throw the information
 * away at the moment it is cheapest to keep.
 *
 * **The instant is assigned by the server, never accepted from the caller.** It
 * appears on this record because a read returns it, and is deliberately absent
 * from the dismissal request below — a caller that could set it could backdate or
 * forward-date its own history, and the request shape is what makes that
 * impossible rather than merely discouraged.
 *
 * There is no identifier for the person on this record. It is reached through the
 * preferences record, which the acting session already identifies, per rule R1.
 */
export const dismissalRecordSchema = z.strictObject({
  /** Which registered element was dismissed. */
  dismissible: dismissibleIdSchema,
  /** When the viewer dismissed it. Server-assigned. */
  dismissedAt: absoluteInstantSchema,
});

/** A single dismissal, with the instant the viewer performed it. */
export type DismissalRecord = z.infer<typeof dismissalRecordSchema>;

/**
 * The dismissals held on one viewer's preferences record.
 *
 * Bounded and duplicate-free. The ceiling is the registry's own size, so it
 * cannot be exceeded by a legitimate history and cannot fall out of step with the
 * registry. Uniqueness is enforced because a dismissible is dismissed or it is
 * not — two entries for one element would leave the question of which instant
 * counts to whichever consumer looked first.
 *
 * Read back as readonly so a consumer cannot mutate a returned collection in
 * place and believe it has stored something.
 */
export const dismissedEntriesSchema = z
  .array(dismissalRecordSchema)
  .max(DISMISSED_ENTRY_MAX, { error: PREFERENCE_REJECTION.dismissalLimitExceeded })
  .refine((entries) => new Set(entries.map((entry) => entry.dismissible)).size === entries.length, {
    error: PREFERENCE_REJECTION.duplicateDismissal,
  })
  .readonly();

/** Every dismissal a viewer has performed, bounded and duplicate-free. */
export type DismissedEntries = z.infer<typeof dismissedEntriesSchema>;

/* -------------------------------------------------------------------------- */
/* The viewer's preferences record                                            */
/* -------------------------------------------------------------------------- */

/**
 * The fields a viewer may change directly.
 *
 * Declared once and used twice — spread into the full record below and used whole
 * as the basis of the update request — so the two cannot disagree about what is
 * editable. `dismissals` is deliberately outside this shape: it is mutated by the
 * dedicated requests further down, which is what keeps the server-assigned instant
 * out of a caller's reach.
 */
const editablePreferenceShape = {
  /** Colour mode: an explicit mode, or deference to the platform. */
  theme: themeSchema,
  /** Which of the twelve accent slots the viewer chose. */
  accentSwatch: accentSwatchSchema,
  /** Which message-row anatomy conversations render in. */
  messageDensity: messageDensitySchema,
  /** Whether motion follows the platform or is overridden either way. */
  motion: motionPreferenceSchema,
  /** The viewer's language tag. */
  locale: localeSchema,
  /** The named zone times are displayed in. */
  displayedTimeZone: timeZoneSchema,
  /** The account-level notification scope a conversation inherits. */
  notificationDefault: notificationScopeSchema,
} as const;

/**
 * A viewer's complete preferences record — `E-PREFERENCE`, keyed by the viewer.
 *
 * THE TWO-VIEWERS TEST, APPLIED FIELD BY FIELD
 *
 * `S-PERUSER` asks of every field: if two people opened this at the same moment,
 * could they legitimately see different values? Every field here answers **yes**.
 * Two members of one workspace may plainly hold different colour modes, different
 * accents, different densities, different motion settings, different languages,
 * different displayed zones, different notification defaults, and different
 * histories of what they have dismissed. That unanimity is not decoration — it is
 * the evidence that this record is keyed correctly. A field that answered *no*
 * would be workspace or channel configuration wearing a preference's clothes, and
 * would belong on the shared object instead.
 *
 * Every field is required, because the server resolves a complete record before
 * returning one: a consumer never has to decide what an absent preference means,
 * and the documented defaults below are applied at creation rather than inferred
 * at each read. The object is strict, so an unrecognised key is a rejection rather
 * than a value silently stored on a person's record.
 *
 * WHAT A LATER PHASE ADDS, AND WHY IT IS NOT GUESSED AT NOW
 *
 * `E-PREFERENCE` carries a twelve-item category list
 * (`docs/workflows/README.md` L342). This phase implements the subset its surfaces
 * actually expose. The categories left out — audio and video with its input-level
 * meter, gain control and noise suppression; the diagnostics result set;
 * navigation-destination visibility; and the notification category's remaining
 * members, being the mobile override, the huddle-start and thread-reply toggles
 * and the keyword list — belong to the deferred preferences and huddles areas.
 * They are named here so their absence reads as scope rather than oversight, and
 * their shapes are deliberately **not** invented: a guessed shape is harder to
 * remove than a missing one.
 */
export const viewerPreferencesSchema = z.strictObject({
  ...editablePreferenceShape,
  /**
   * What this viewer has dismissed — the field the relation table places here
   * rather than on the object dismissed (`docs/workflows/README.md` L372).
   */
  dismissals: dismissedEntriesSchema,
});

/** A viewer's complete, resolved preferences. */
export type ViewerPreferences = z.infer<typeof viewerPreferencesSchema>;

/**
 * The documented default for each preference, applied when a viewer's record is
 * first created.
 *
 * Rule R3 requires a chosen value to be a named constant with a
 * documented default, consumed by reference rather than restated at a point of
 * use. These sit beside the vocabularies they draw from rather than in the
 * environment-overridable configuration module, and deliberately so: they are
 * product defaults for a new record, not deployment configuration, and nothing
 * here reads the environment. A deployment that wanted a different starting
 * colour mode would be changing the product, not its configuration.
 *
 * Each choice is the least surprising member of its own union. Colour mode and
 * motion defer to the platform, because deferring is the answer that respects a
 * setting the viewer has already expressed elsewhere. Density defaults to the
 * comfortable anatomy, which is the one the corpus shows in every conversation but
 * one. The notification default is every new message, which is the member the
 * catalog observes pre-selected on that radio group (frame 92). The accent is the
 * first slot, and the dismissal history of a viewer who has dismissed nothing is
 * empty. Locale and displayed zone have no default here on purpose: guessing
 * either would be worse than resolving it once from the request that creates the
 * record, so they are required of that path rather than defaulted to one region's
 * assumption.
 *
 * The reasoning for each is recorded in `docs/decisions/observed-values.md`.
 */
export const PREFERENCE_DEFAULTS = {
  theme: 'system',
  accentSwatch: 'accent-01',
  messageDensity: 'comfortable',
  motion: 'system',
  notificationDefault: 'all-messages',
  dismissals: [],
} as const satisfies Partial<ViewerPreferences>;

/* -------------------------------------------------------------------------- */
/* Requests                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A change to one or more preferences.
 *
 * Strict and partial. Partial so a client can set one preference without echoing
 * the rest — a surface that toggles the colour mode should not have to resend a
 * person's language to do it, and resending it is how one surface's stale copy
 * overwrites another's fresh change. Strict so an unrecognised key is rejected
 * rather than ignored, which is what stops a typo silently doing nothing and a
 * probe silently doing something.
 *
 * An update that carries no recognised field is rejected. A request that changes
 * nothing is more likely a client defect than an intention, and answering it with
 * success would report a change that never happened.
 *
 * There is no identifier for the person whose preferences these are. The acting
 * session supplies that, and the absence is the point: with no field to populate,
 * a caller cannot even attempt to write to somebody else's record, so the server's
 * check has nothing to contradict (rule R1).
 */
export const preferencesUpdateRequestSchema = z
  .strictObject(editablePreferenceShape)
  .partial()
  .refine((update) => Object.keys(update).length > 0, {
    error: PREFERENCE_REJECTION.emptyUpdate,
  });

/** A partial change to a viewer's own preferences. */
export type PreferencesUpdateRequest = z.infer<typeof preferencesUpdateRequestSchema>;

/**
 * Dismiss one element: the identifier alone.
 *
 * Nothing else is accepted, and each omission is deliberate. No identifier for
 * the person, because the session is the person. No identifier for the object the
 * element rendered over, because the dismissal is recorded against the viewer and
 * the element rather than against a channel or a message — recording it against
 * the object is precisely the placement `S-PERUSER` forbids. And no instant,
 * because the server assigns it; a caller-supplied time would let a viewer's own
 * history be written to order.
 */
export const dismissBannerRequestSchema = z.strictObject({
  /** Which registered element the viewer dismissed. */
  dismissible: dismissibleIdSchema,
});

/** A request to dismiss one registered element. */
export type DismissBannerRequest = z.infer<typeof dismissBannerRequestSchema>;

/**
 * Restore one dismissed element, so it renders again for this viewer.
 *
 * NO FRAME EVIDENCES THIS. It is included because it costs nothing beyond the
 * shape it already needed — the same identifier the dismissal carries — and
 * because omitting it would leave a viewer's own record with a write path and no
 * way back, which is a worse answer than the smallest coherent completion. Per
 * rule R3 the absence of evidence is an open work item rather than permission to
 * omit, and the choice is recorded in `docs/decisions/gap-register.md`.
 */
export const restoreDismissibleRequestSchema = z.strictObject({
  /** Which registered element to show this viewer again. */
  dismissible: dismissibleIdSchema,
});

/** A request to restore one previously dismissed element. */
export type RestoreDismissibleRequest = z.infer<typeof restoreDismissibleRequestSchema>;

/**
 * Clear this viewer's dismissal history entirely.
 *
 * Takes no parameters, and the empty strict object is how that is stated rather
 * than assumed: a caller that sends anything at all is rejected, so a field cannot
 * be smuggled into a request whose contract is "no fields". Like the restore
 * above, no frame evidences it; it is the smallest coherent completion of a
 * collection that can otherwise only grow, and it is recorded in
 * `docs/decisions/gap-register.md`.
 */
export const resetDismissalsRequestSchema = z.strictObject({});

/** A request to clear every dismissal on the acting viewer's own record. */
export type ResetDismissalsRequest = z.infer<typeof resetDismissalsRequestSchema>;

/* -------------------------------------------------------------------------- */
/* Responses                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The reply to a preferences read or update: the viewer's own resolved record.
 *
 * An envelope rather than the bare record, so that the record keeps exactly one
 * meaning wherever it appears and a later addition to the reply does not change
 * the shape of the record itself.
 *
 * A read of this shape is a projection over the reader's own row and is authorized
 * as one. One viewer's preferences are never readable by another: their colour
 * mode is harmless, but their dismissal history is a record of what they have
 * been shown and chosen to be rid of, and projecting that to a colleague is the
 * behavioural disclosure `S-PERUSER` exists to prevent.
 */
export const viewerPreferencesResponseSchema = z.strictObject({
  /** The acting viewer's own preferences, fully resolved. */
  preferences: viewerPreferencesSchema,
});

/** The reply to a preferences read or update. */
export type ViewerPreferencesResponse = z.infer<typeof viewerPreferencesResponseSchema>;

/**
 * The reply to a dismiss, a restore or a reset: the resulting collection.
 *
 * One shape serves all three because all three mutate the same collection and the
 * useful answer is the same in every case — what the history now is, including the
 * instant the server assigned, which the caller could not have known. Three
 * near-identical envelopes would be three things to keep in step for no gain.
 */
export const dismissalStateResponseSchema = z.strictObject({
  /** The acting viewer's dismissals after the change. */
  dismissals: dismissedEntriesSchema,
});

/** The reply to any change to the acting viewer's dismissal history. */
export type DismissalStateResponse = z.infer<typeof dismissalStateResponseSchema>;
