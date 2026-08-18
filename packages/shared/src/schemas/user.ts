/**
 * The person contract — a profile shape that carries no credential.
 *
 * This module defines every shape the product uses to describe a person: the full
 * profile a person sees and edits, the compact summary every author line, member
 * row, facepile entry, typeahead row and mention chip renders from, and the narrow
 * request that changes one's own profile. The schemas here are the single
 * definition; `openapi/registry.ts` attaches descriptions and examples to them at
 * registration time, and `../types/` derives its types from them.
 *
 * Its defining characteristic is an ABSENCE, and that absence is the reason this
 * header is long. See the block below.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DELIBERATELY NOT HERE, STATED IN THE SPECIFICATION THREE TIMES
 * ---------------------------------------------------------------------------
 *
 * Four credential artefacts are *rendered* by this product and none of them is a
 * field of a person. The read-only catalogue says so in three separate places, so
 * this is settled rather than stylistic:
 *
 *   1. `docs/workflows/README.md` L326 lists them inside the `E-USER` row under
 *      the heading "credential artefacts, which are *not* fields of this entity" —
 *      a password with a reuse constraint and a strength rating (frames 733, 604),
 *      a six-character expiring one-time code (frame 4), an active browser session
 *      per workspace (frame 717), and a device-enrolment code (frame 714) — and
 *      states they appear in that cell only so that a build cannot mistake their
 *      absence for an oversight. This module is the place that mistake would be
 *      made, so the same courtesy is repeated here.
 *
 *   2. `docs/workflows/01-onboarding-and-auth.md` L778 repeats it field by field:
 *      what is stored for a password is a salted, computationally-hard ONE-WAY
 *      VERIFIER; the one-time code is a single-use, time-bounded, per-address
 *      verifier ON ITS OWN SHORT-LIVED RECORD; the browser session is a REVOCABLE
 *      RECORD REFERENCING THE ACCOUNT carrying an expiry and an idle bound; and the
 *      device-enrolment code is a short-lived single-use artefact issued per
 *      attempt. The already-signed-in list "projects only the workspace identity,
 *      never the credential".
 *
 *   3. `docs/workflows/01-onboarding-and-auth.md` L927 states it as an acceptance
 *      criterion outright: "No password, one-time code, session bearer or
 *      device-enrolment code is a persisted field of `E-USER` or of any entity a
 *      read path returns."
 *
 * `S-SECRET` (`docs/workflows/00-product-overview.md` L540-L555) closes it for
 * every data model in the product: a credential, code, session, link token or
 * provider token is not a field of `E-USER`, `E-INVITATION`, `E-PLAN`,
 * `E-WORKSPACE` or any other entity a read path returns. The only two references a
 * returned entity may carry are a class-B lookup selector and a class-C opaque
 * record identifier, and NEITHER OF THOSE IS THE SECRET — nor does either belong on
 * a person, because a person holds no capability link and presents no outbound
 * credential of their own.
 *
 * Therefore no field of this module is, or resembles, a password, a verifier, a
 * one-time code, a session bearer, a device-enrolment code or a strength rating —
 * not on the profile, not on the summary, not on the update request. The four
 * artefacts live in `apps/api/src/secrets/password.ts`,
 * `apps/api/src/secrets/otp.ts`, `apps/api/src/secrets/enrolment-code.ts` and
 * `apps/api/src/secrets/session-store.ts`, against four separate lifecycle-bearing
 * tables in `packages/db/prisma/schema.prisma`. Each has its own class, lifetime
 * and revocation path, which is exactly why one shared column on a person would be
 * wrong even if it held only a digest.
 *
 * The password STRENGTH RATING deserves its own sentence, because it is the one a
 * reader is most likely to think harmless. `01-onboarding-and-auth.md` L778 and
 * L928 state it is computed transiently in the client, is never transmitted and
 * never stored, and is advisory rather than a policy gate; `S-SECRET` class A
 * states a strength rating is transient and is never stored beside a password. It
 * is absent from this module by contract, not by omission, and the policy it hints
 * at is evaluated server-side on submission.
 *
 * MARKETING CONSENT is absent for a different reason, and the reason matters
 * because the field looks like an innocent boolean. `README.md` L326 places a
 * marketing address, its consent and its subscribed state on the public
 * form-submission page-content structure (L351) and states plainly that none of
 * them is a field of `E-USER`: "no observed public submission creates an account,
 * so a lead and a workspace member are different populations and are never merged
 * into one record". `S-MARKETING` requires that separation, and
 * `01-onboarding-and-auth.md` L931 adds that a pre-ticked box is a RENDERING and
 * never a consent — an affirmative act is recorded together with its timestamp, the
 * wording presented and the surface it was presented on. That act is modelled in
 * `./auth.ts`, never here, so a read that serves a marketing surface can never
 * become a read of workspace membership.
 *
 * ---------------------------------------------------------------------------
 * WHY THE ABSENCES CANNOT BE CHECKED AGAINST A FRAME
 * ---------------------------------------------------------------------------
 *
 * The corpus is a single authenticated session in one workspace, so it can never
 * show what a different viewer, a different role or a de-authorized viewer would
 * see, and it can never show a value that was rejected, hashed or discarded. Every
 * negative requirement above is therefore enforced STRUCTURALLY — the shape simply
 * does not contain the field — rather than by a test that watches a screen.
 *
 * ---------------------------------------------------------------------------
 * MODULE CONSTRAINTS
 * ---------------------------------------------------------------------------
 *
 * - Pure `zod`. No `.openapi()` call and no `extendZodWithOpenApi` here; those
 *   belong to `../openapi/registry.ts`, because the package barrel re-exports this
 *   module into the browser bundle and the generator has no business there.
 * - No framework import of any kind, and no import of `../copy/en.ts`. Every
 *   rejection this module can produce is a machine-readable code; the sentence a
 *   person reads is chosen by the client from the copy module.
 * - Every length bound is declared once, as a named exported constant, and consumed
 *   by reference. No bound is inlined at a point of use.
 * - Every instant is an absolute UTC instant. No duration is stored anywhere.
 *
 * ---------------------------------------------------------------------------
 * HOW THE PROJECT RULES ARE CITED BELOW, AND WHY NOT BY THEIR OWN IDENTIFIERS
 * ---------------------------------------------------------------------------
 *
 * Five binding project rules govern this work. They are cited here by their
 * requirement labels:
 *
 *   `PROJECT_RULE_R1` — authorization is server-side only
 *   `PROJECT_RULE_R2` — corpus and specification handling
 *   `PROJECT_RULE_R3` — uncertainty is never permission to omit
 *   `PROJECT_RULE_R4` — third-party identity exclusion
 *   `PROJECT_RULE_R5` — a shared contract is implemented exactly once
 *
 * The rules' own identifiers are deliberately NOT written anywhere in this file,
 * because every one of them embeds the third-party product name that R4 forbids from
 * appearing in source or in comments. Writing them would put the build's own brand
 * guard in the position of failing on the file that cites the rule it enforces. A
 * downstream reader should not "restore" them.
 *
 * Two warnings for whoever maps these back. The identifiers are PERMUTED relative to
 * the R labels, so the label above is the thing to trust and an ordinal is not; and
 * the labels are a citation shorthand rather than a paraphrase — the authoritative
 * wording of each rule lives in the rules interface, and this file summarises rather
 * than restates it.
 */

import { z } from 'zod';

/* ===========================================================================
 * Length bounds
 *
 * Each bound is declared once here and referenced everywhere below, so that
 * changing one changes the contract in a single place. A validator that inlined
 * its own number would be a second source of truth for the same rule.
 * =========================================================================== */

/**
 * Maximum length of an opaque record identifier naming a person.
 *
 * The identifier is opaque by contract: it is the "opaque record identifier" that
 * `S-SECRET` L550 permits a returned entity to carry, and `S-PII` requires that
 * where a personal record must be referenced it is referenced by exactly such an
 * identifier rather than by a personal value. Nothing may be inferred from its
 * contents, and no caller may construct one.
 *
 * The bound is generous enough for every identifier scheme the build might adopt
 * for a primary key while still being far too short to smuggle a payload.
 */
export const PERSON_ID_MAX_LENGTH = 64;

/**
 * Maximum length of an email address.
 *
 * 254 characters is the longest address that can appear in an SMTP forward path,
 * which is the practical ceiling for an address this product must be able to send
 * to. Chosen because it is the boring, well-supported limit rather than a guess.
 */
export const EMAIL_MAX_LENGTH = 254;

/**
 * Minimum length of any text value that is supplied at all.
 *
 * One constant rather than one per field, because every field below shares the same
 * rule: a value that is supplied is not blank. It is applied AFTER trimming, so a
 * run of spaces is rejected rather than stored as a name. Declaring it four times
 * under four names would imply four independently changeable rules, and there is
 * only one; a field whose minimum genuinely differs gets its own constant instead of
 * quietly widening this one.
 */
export const NON_BLANK_MIN_LENGTH = 1;

/** Maximum length of a full name. */
export const FULL_NAME_MAX_LENGTH = 100;

/** Maximum length of a display name, which is rendered in constrained rows. */
export const DISPLAY_NAME_MAX_LENGTH = 80;

/** Maximum length of a pronouns value, rendered inline beside a name. */
export const PRONOUNS_MAX_LENGTH = 40;

/** Maximum length of a name-pronunciation value. */
export const NAME_PRONUNCIATION_MAX_LENGTH = 80;

/** Maximum length of a job title. */
export const JOB_TITLE_MAX_LENGTH = 100;

/**
 * Maximum length of a named time-zone identifier.
 *
 * Comfortably above the longest identifier in the public zone database, and short
 * enough that the field cannot carry anything else.
 */
export const TIME_ZONE_MAX_LENGTH = 64;

/**
 * Maximum length of the storage reference for a profile photo.
 *
 * This bound is load-bearing rather than cosmetic: together with the character
 * class the validator enforces, it makes it structurally impossible for image
 * bytes or a data URL to be stored in place of a reference.
 */
export const AVATAR_OBJECT_KEY_MAX_LENGTH = 512;

/* ===========================================================================
 * Rejection codes
 *
 * Every rejection this module can produce is a code, never a sentence. The codes
 * are attached to the validators below as their issue messages, which is what keeps
 * this union load-bearing instead of decorative: a client receives the code and
 * chooses the wording itself from the authored copy module, so no user-facing prose
 * exists in the contract package and no rejection can leak an implementation
 * detail. `SCREAMING_SNAKE_CASE` is used deliberately so that a rejection code is
 * never mistaken for a domain value at a call site.
 * =========================================================================== */

/**
 * The closed set of rejection codes the person schemas emit.
 *
 * Declared as a readonly tuple so the union is derived from it rather than restated,
 * and so a consumer can enumerate the set — an exhaustive mapping to authored copy
 * is what stops a code reaching a person as a raw token.
 */
export const PERSON_REJECTION_CODES = [
  'PERSON_ID_MALFORMED',
  'EMAIL_REQUIRED',
  'EMAIL_MALFORMED',
  'EMAIL_TOO_LONG',
  'FULL_NAME_REQUIRED',
  'FULL_NAME_TOO_LONG',
  'DISPLAY_NAME_REQUIRED',
  'DISPLAY_NAME_TOO_LONG',
  'PRONOUNS_TOO_LONG',
  'NAME_PRONUNCIATION_TOO_LONG',
  'JOB_TITLE_TOO_LONG',
  'TIME_ZONE_REQUIRED',
  'TIME_ZONE_TOO_LONG',
  'TIME_ZONE_NOT_A_NAMED_ZONE',
  'AVATAR_REFERENCE_MALFORMED',
  'AVATAR_REFERENCE_TOO_LONG',
  'PRESENCE_UNRECOGNISED',
  'WORKSPACE_ROLE_UNRECOGNISED',
  'GUEST_ACCESS_END_NOT_AN_INSTANT',
  'PROFILE_UPDATE_EMPTY',
  'PROFILE_UPDATE_MALFORMED',
  'PROFILE_UPDATE_UNKNOWN_FIELD',
] as const;

/** Schema for a single rejection code, for use where a code crosses a boundary. */
export const personRejectionCodeSchema = z.enum(PERSON_REJECTION_CODES);

/** A machine-readable reason a person shape was rejected. Never a rendered string. */
export type PersonRejectionCode = z.infer<typeof personRejectionCodeSchema>;

/* ===========================================================================
 * Presence
 * =========================================================================== */

/**
 * The presence values a presence indicator renders.
 *
 * `docs/workflows/02-channels.md` L817 and
 * `docs/workflows/03-messaging-and-composer.md` L654 both evidence presence
 * "rendered as a filled dot or a hollow ring" (frames 82, 106, 120, 172), and
 * `README.md` L326 lists presence among a person's observed values (frame 519).
 * Two renderings are evidenced, so two live values are evidenced: the filled dot
 * and the hollow ring. `offline` is the third value and it is authored — the corpus
 * cannot show it, because a single captured session is by definition connected.
 *
 * PRESENCE IS A PROJECTION, NOT A STORED PROFILE COLUMN. It is heartbeat-driven and
 * bus-backed: a client's heartbeat refreshes an entry with a time-to-live, the
 * absence of a live entry is what `offline` means, and changes fan out over the
 * publish/subscribe bus. It appears on the shapes below because every surface that
 * renders a person renders their presence beside them, but it is composed at read
 * time from the presence store rather than read from the person's record. Nothing
 * here should be taken as licence to add a presence column.
 *
 * A notification-pause state is a DIFFERENT evidenced value (`README.md` L326,
 * frame 504) owned by a deferred area, and it is not folded in as a fourth presence
 * value: conflating two contracts would leave one of them unspecified while
 * appearing to cover it.
 */
export const PRESENCE_STATES = ['active', 'away', 'offline'] as const;

/** Schema for a presence value. */
export const presenceSchema = z.enum(PRESENCE_STATES, {
  error: 'PRESENCE_UNRECOGNISED' satisfies PersonRejectionCode,
});

/** A person's presence as rendered by a presence indicator. */
export type Presence = z.infer<typeof presenceSchema>;

/* ===========================================================================
 * Role within a workspace
 * =========================================================================== */

/**
 * The account types a person may hold within one workspace.
 *
 * `docs/workflows/01-onboarding-and-auth.md` L778 evidences "role within a
 * workspace, member or guest" (frame 49); `README.md` L326 evidences an account
 * type whose permissions are customisable per type (frame 666) and a guest role
 * badge rendered beside the name (frame 120). The corpus evidences no more than
 * that, because its entire vocabulary of visible authorization is four frames
 * (`README.md` L380) and it is one session in one workspace.
 *
 * The set below is the authored five-type enumeration — owner, administrator,
 * member, guest and external collaborator — with the guest split into its two
 * evidenced variants, because a guest permitted more than one channel is a
 * materially different account from a guest confined to one
 * (`01-onboarding-and-auth.md` L780, frame 50).
 *
 * A ROLE IN THIS MODULE IS DESCRIPTIVE AND NEVER A GRANT. It says which badge
 * renders beside a name; it decides nothing. The CAPABILITY meaning of each role
 * lives in `docs/decisions/role-matrix.md` and is implemented in
 * `apps/api/src/authz/roles.ts`, `apps/api/src/authz/matrix.ts` and the guards in
 * `apps/api/src/authz/` — never here. Per `PROJECT_RULE_R1` a client rendering
 * is never evidence of permission, so a caller that sends a role, or a surface that
 * reads one, has established nothing: every mutation is authorized server-side at
 * the point of execution against the acting session and the specific target object.
 * That is also why no schema in this module accepts a role as an input.
 */
export const WORKSPACE_ROLES = [
  'owner',
  'admin',
  'member',
  'guest_single_channel',
  'guest_multi_channel',
  'external_collaborator',
] as const;

/** Schema for a descriptive workspace role. */
export const workspaceRoleSchema = z.enum(WORKSPACE_ROLES, {
  error: 'WORKSPACE_ROLE_UNRECOGNISED' satisfies PersonRejectionCode,
});

/** A person's descriptive role within one workspace. Never a capability. */
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;

/* ===========================================================================
 * Field primitives
 *
 * Each is declared once and reused by every shape below, so a bound or a character
 * class cannot drift between the profile, the projection and the request.
 * =========================================================================== */

/**
 * Characters permitted in an opaque person identifier.
 *
 * Restricted to the URL-safe alphabet so that an identifier is safe to place in a
 * path segment, and deliberately excluding the dot and the slash so that one can
 * never be read as a path. The `+` quantifier is what rejects an empty identifier,
 * which is why no minimum-length bound is needed.
 */
const PERSON_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Characters permitted in a named time-zone identifier.
 *
 * The identifier must BEGIN WITH A LETTER, and that is the load-bearing part. A
 * UTC offset — `+02:00`, `-05:00` — cannot satisfy it, which makes "a named zone
 * identifier, not an offset" a structural property of the contract rather than a
 * behaviour of whichever engine happens to be validating. The rest of the class
 * admits every shape the public zone database uses, including a multi-part
 * identifier and the signed forms of the `Etc` zones.
 */
const TIME_ZONE_PATTERN = /^[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+)*$/;

/**
 * Characters permitted in the storage reference for a profile photo.
 *
 * The class excludes the colon, the semicolon and the comma, so a data URL cannot
 * be expressed at all; together with `AVATAR_OBJECT_KEY_MAX_LENGTH` that is what
 * makes it impossible to store image bytes where a reference belongs. The reference
 * must also begin with an alphanumeric character, so it can never be read as a
 * relative path.
 */
const AVATAR_OBJECT_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/_.-]*$/;

/** A parent-directory sequence, rejected in a storage reference. */
const PARENT_DIRECTORY_SEQUENCE = '..';

/**
 * Whether a value is a well-formed reference to a stored object.
 *
 * Both halves matter. The character class is what makes a data URL inexpressible,
 * and the parent-directory rejection is what stops a reference being aimed at
 * something the uploader was never given: a key that may contain `..` is a key that
 * can traverse, and a traversable key reaching an object store is a read of another
 * tenant's bytes.
 */
const isStorageObjectReference = (value: string): boolean =>
  AVATAR_OBJECT_KEY_PATTERN.test(value) && !value.includes(PARENT_DIRECTORY_SEQUENCE);

/**
 * Whether a value names a time zone this runtime recognises.
 *
 * Construction is the check: the platform raises a `RangeError` for an identifier
 * it does not know, which is a real check against the runtime's own zone database
 * rather than a hardcoded list that would rot. Combined with `TIME_ZONE_PATTERN`
 * above, an offset is rejected twice — once because it cannot match a named-zone
 * shape, and once here if a future runtime were to start accepting offsets.
 */
const namesARecognisedTimeZone = (value: string): boolean => {
  if (!TIME_ZONE_PATTERN.test(value)) {
    return false;
  }
  try {
    void new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

/**
 * An opaque record identifier naming a person.
 *
 * This is the reference `S-PII` requires be used in place of a personal value
 * wherever a person must be named, and the "opaque record identifier" `S-SECRET`
 * L550 permits a returned entity to carry. It identifies; it discloses nothing and
 * grants nothing.
 */
export const personIdSchema = z
  .string()
  .max(PERSON_ID_MAX_LENGTH, { error: 'PERSON_ID_MALFORMED' satisfies PersonRejectionCode })
  .regex(PERSON_ID_PATTERN, { error: 'PERSON_ID_MALFORMED' satisfies PersonRejectionCode });

/**
 * A person's email address — the account's identifier.
 *
 * `docs/workflows/01-onboarding-and-auth.md` L778 records it as "entered at sign-up
 * and echoed by every later surface as the account's identifier" (frames 1, 6), and
 * `README.md` L326 carries it among a person's observed values (frames 519, 604).
 *
 * GOVERNED BY `S-PII`, AND THIS MODULE IS WHERE A CONSUMER LEARNS THE RULES. Per
 * `S-PII` (`00-product-overview.md` L558) an address is personal data and is NOT a
 * secret, so it is neither hashed nor sealed — a support reply has to reach the
 * address that was typed. What binds instead: the value NEVER reaches an
 * application log, an error report, an analytics event, A URL, A CACHE KEY or a
 * telemetry payload; where the person must be referenced in any of those places,
 * `personIdSchema` above is what is referenced. It is read under field-level
 * authorization against the reader's capability for that specific record and never
 * merely because the enclosing surface loaded, it is encrypted in transit and at
 * rest, and it carries a stated retention period and a deletion path.
 *
 * This is also the reason the address is absent from `personSummarySchema` below.
 */
export const emailAddressSchema = z
  .string()
  .trim()
  .min(NON_BLANK_MIN_LENGTH, { error: 'EMAIL_REQUIRED' satisfies PersonRejectionCode })
  .max(EMAIL_MAX_LENGTH, { error: 'EMAIL_TOO_LONG' satisfies PersonRejectionCode })
  .pipe(z.email({ error: 'EMAIL_MALFORMED' satisfies PersonRejectionCode }));

/**
 * A person's full name.
 *
 * `01-onboarding-and-auth.md` L778 records it "collected as one field on wizard
 * step 2 and again as a display name on the join page" (frames 12, 722), and
 * `README.md` L326 lists full name and display name as separate values (frame 520).
 */
export const fullNameSchema = z
  .string()
  .trim()
  .min(NON_BLANK_MIN_LENGTH, { error: 'FULL_NAME_REQUIRED' satisfies PersonRejectionCode })
  .max(FULL_NAME_MAX_LENGTH, { error: 'FULL_NAME_TOO_LONG' satisfies PersonRejectionCode });

/**
 * A person's display name.
 *
 * Distinct from the full name rather than a formatting of it:
 * `docs/workflows/03-messaging-and-composer.md` L654 evidences "a user name
 * distinct from the display name, both rendered on one typeahead row" (frame 172),
 * and `docs/workflows/02-channels.md` L817 evidences "display name and a secondary
 * name rendered together on a member row" (frames 82, 106). Two values are rendered
 * side by side, so two values are stored.
 */
export const displayNameSchema = z
  .string()
  .trim()
  .min(NON_BLANK_MIN_LENGTH, { error: 'DISPLAY_NAME_REQUIRED' satisfies PersonRejectionCode })
  .max(DISPLAY_NAME_MAX_LENGTH, { error: 'DISPLAY_NAME_TOO_LONG' satisfies PersonRejectionCode });

/**
 * A named time-zone identifier — never an offset.
 *
 * `README.md` L326 lists a time zone among a person's observed values (frames 520,
 * 604). It is stored as a NAMED identifier because a scheduled send is interpreted
 * in a named zone: an offset is only correct until the zone's rules next change,
 * and a message scheduled across that boundary would fire an hour out. The sibling
 * `../schemas/message.ts` interprets a scheduled delivery in this value.
 */
export const timeZoneSchema = z
  .string()
  .trim()
  .min(NON_BLANK_MIN_LENGTH, { error: 'TIME_ZONE_REQUIRED' satisfies PersonRejectionCode })
  .max(TIME_ZONE_MAX_LENGTH, { error: 'TIME_ZONE_TOO_LONG' satisfies PersonRejectionCode })
  .refine(namesARecognisedTimeZone, {
    error: 'TIME_ZONE_NOT_A_NAMED_ZONE' satisfies PersonRejectionCode,
  });

/**
 * The storage reference for a profile photo.
 *
 * `01-onboarding-and-auth.md` L778 records the photo as "explicitly optional,
 * stored from a square crop and rendered as the message-row avatar" (frames 11, 21,
 * 22). What is modelled here is a REFERENCE to a stored object and never the image:
 * bytes are transferred straight to object storage by pre-signed upload, so they
 * never transit this contract, this API or this schema. The square crop is a
 * property of what was uploaded, so it is enforced where the upload is completed —
 * see `./file.ts` — and this field holds only the resulting reference.
 *
 * A data URL and a raw byte string are both structurally impossible here rather
 * than merely discouraged: the character class admits no colon, semicolon or comma,
 * and the length bound admits no payload.
 */
export const avatarObjectKeySchema = z
  .string()
  .trim()
  .max(AVATAR_OBJECT_KEY_MAX_LENGTH, {
    error: 'AVATAR_REFERENCE_TOO_LONG' satisfies PersonRejectionCode,
  })
  .refine(isStorageObjectReference, {
    error: 'AVATAR_REFERENCE_MALFORMED' satisfies PersonRejectionCode,
  });

/**
 * The instant a guest's access ends, or `null` where it does not end.
 *
 * `01-onboarding-and-auth.md` L778 records "guest expiry, an end date whose stated
 * semantics are 11:59 PM on the selected day" (frames 50, 54), and L780 records the
 * control offering "either no limit or a custom date" (frames 52, 54) — so `null`
 * means no limit, which is the control's own default. The stated end-of-day
 * semantics are resolved WHEN THE DATE IS CHOSEN, in the person's own time zone,
 * and what is stored is the resulting absolute instant.
 *
 * AN ABSOLUTE INSTANT, NEVER A DURATION, and the schema enforces that structurally:
 * `z.iso.datetime()` requires a UTC-designated ISO 8601 instant, so a number of
 * days, a remaining duration or a bare calendar date cannot parse at all. This is
 * `PROJECT_RULE_R3`'s requirement made unbypassable — a configured default may
 * change later without invalidating a record already stored.
 *
 * This clock is ONE OF THREE and must not be collapsed into the others.
 * `01-onboarding-and-auth.md` L782 is explicit: the invite-link expiry is a property
 * of a SHAREABLE LINK (frame 46) and belongs to `./invitation.ts`; the external
 * acceptance window belongs to the external-collaboration entity; this one is a
 * property of an ACCOUNT (frame 54). "Three different clocks, three different
 * owners; a build that collapses them will get all three wrong." No number of days
 * is restated here for the same reason — the configurable default lives in the
 * shared configuration module and is consumed by reference.
 */
export const guestAccessEndsAtSchema = z.iso
  .datetime({ error: 'GUEST_ACCESS_END_NOT_AN_INSTANT' satisfies PersonRejectionCode })
  .nullable();

/* ===========================================================================
 * The person-summary projection
 * =========================================================================== */

/**
 * The compact shape every surface that names a person renders from.
 *
 * ONE DEFINITION, MANY CONSUMERS. A message author line, a member row, a facepile
 * entry, a mention typeahead row and a mention chip all render this same shape, and
 * per `PROJECT_RULE_R5` it is declared here exactly once so that neither
 * `packages/ui` nor `apps/web` declares an author-line or member-row shape of its
 * own. A second declaration would be a defect even if it happened to match.
 *
 * The field set is what the corpus evidences those surfaces rendering:
 *   - `docs/workflows/03-messaging-and-composer.md` L654 — display name and avatar
 *     on a message author line (frame 202); "a user name distinct from the display
 *     name, both rendered on one typeahead row" (frame 172); presence as a filled
 *     dot or a hollow ring (frame 172).
 *   - `docs/workflows/02-channels.md` L817 — "display name and a secondary name
 *     rendered together on a member row", presence as a filled dot or a hollow
 *     ring, and a guest role badge beside a name (frames 82, 106, 120).
 *   - `docs/workflows/02-channels.md` L786 — members surfaced as a facepile plus a
 *     numeric count plus one row per member (frames 82, 106, 120).
 *
 * ---------------------------------------------------------------------------
 * THIS IS A PROJECTION, AND A PROJECTION IS A READ PATH
 * ---------------------------------------------------------------------------
 *
 * Per `PROJECT_RULE_R1` a projection is authorized INDEPENDENTLY, on every read
 * path that produces it — a member list, a facepile, an autocomplete suggestion, a
 * count, a search result, a link preview and a notification are each their own read
 * path and each carries its own check. Its presence in a response is NEVER inferred
 * from the enclosing surface having loaded. `S-PII`
 * (`docs/workflows/00-product-overview.md` L558) states the same requirement at
 * field level: a personal field is read against the reader's capability for that
 * specific record and never merely because the surface around it rendered, and "a
 * list, count or export over such records is projected the same way".
 *
 * Concretely, for the server: producing this shape requires that the acting session
 * belongs to the workspace, that the workspace predicate was injected below the
 * query by `packages/db/src/tenancy.ts` rather than added by the caller, and that
 * the reader is entitled to see this person in this context. A caller-supplied
 * workspace or actor identifier decides none of it.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS SHAPE DELIBERATELY OMITS, AND WHY
 * ---------------------------------------------------------------------------
 *
 * NO EMAIL ADDRESS. This is the single most important thing about this shape.
 * `docs/workflows/02-channels.md` L786 evidences a facepile, and the specification
 * names a five-hundred-member facepile as an explicit edge case — so one render of
 * one channel header can carry five hundred of these. An address on this shape would
 * turn every facepile, every mention typeahead keystroke and every member list page
 * into a bulk disclosure of personal data, which is exactly what `S-PII`
 * minimisation forbids. An address is on `personProfileSchema` alone, where a single
 * record is read under its own field-level check. Nothing that renders a person's
 * NAME needs their address, so nothing here has one.
 *
 * Nor does it carry the guest end instant, the pronunciation, the job title or the
 * pronouns: none of them is rendered by an author line or a facepile, and a
 * projection that carries more than its consumers render is a disclosure waiting for
 * a consumer that leaks it.
 *
 * The shape is therefore six short scalars, which is what makes it reasonable to
 * return five hundred of them in one response.
 */
export const personSummarySchema = z.object({
  /** The opaque identifier. The only value here a client may send back. */
  id: personIdSchema,

  /**
   * The name rendered first, on the author line and at the head of a member row
   * (`03-messaging-and-composer.md` L654, frame 202).
   *
   * Always present on the projection even where the person set no display name of
   * their own: the server resolves the fallback from the full name once, at read
   * time, so no consumer re-implements that decision and two surfaces cannot
   * disagree about what a person is called.
   */
  displayName: displayNameSchema,

  /**
   * The secondary name rendered beside the display name on a member row and a
   * typeahead row (`02-channels.md` L817; `03-messaging-and-composer.md` L654,
   * frame 172).
   */
  fullName: fullNameSchema,

  /**
   * The stored-object reference for the avatar, or `null` where the person set no
   * photo — the photo is explicitly optional (`01-onboarding-and-auth.md` L778,
   * frames 11, 21, 22), so the absence is a legitimate value and the consumer
   * renders an initial-derived avatar instead.
   */
  avatarObjectKey: avatarObjectKeySchema.nullable(),

  /**
   * Presence, composed at read time from the heartbeat store rather than read from
   * the person's record. See `presenceSchema` above.
   */
  presence: presenceSchema,

  /**
   * The descriptive role, which is what makes the guest badge render beside the name
   * (`README.md` L326, frame 120). Descriptive only — it grants nothing, and the
   * server does not consult it to decide anything.
   */
  workspaceRole: workspaceRoleSchema,
});

/**
 * The compact person shape rendered by every surface that names a person.
 *
 * Deliberately carries no email address; see the schema's own note.
 */
export type PersonSummary = z.infer<typeof personSummarySchema>;

/* ===========================================================================
 * The full profile
 * =========================================================================== */

/**
 * A person's full profile, as returned to a reader entitled to the whole record.
 *
 * Every field cites the catalogue location and the frame NUMBER that evidences it.
 * Filenames are never cited: each of the 1,022 frame filenames embeds a third-party
 * product name, so per `PROJECT_RULE_R4` a citation names the number alone.
 *
 * This shape is a superset of `personSummarySchema` in content but not in
 * authorization: reading a profile is its own read path with its own check, and
 * being entitled to a summary entails nothing about being entitled to a profile.
 * That is why the two are separate schemas rather than one schema with optional
 * fields — an optional field is a field a mistake can populate.
 */
export const personProfileSchema = z.object({
  /** The opaque identifier. See `personIdSchema`. */
  id: personIdSchema,

  /**
   * The account's identifier (`01-onboarding-and-auth.md` L778, frames 1, 6;
   * `README.md` L326, frames 519, 604). Personal data under `S-PII` — see
   * `emailAddressSchema` for the handling rules that travel with it.
   */
  email: emailAddressSchema,

  /**
   * Whether the address has been confirmed, surfaced as a confirmed-as line with
   * its own change link (`01-onboarding-and-auth.md` L778, frame 6).
   *
   * A projection of the account's verification state, never a control: setting it is
   * not a profile edit, and the act that changes it is modelled in `./auth.ts`. The
   * one-time code that proves the address is a separately-secured artefact and is
   * absent from this module entirely — see the header.
   */
  emailVerified: z.boolean(),

  /**
   * Full name, collected as one field on wizard step 2 and again as a display name
   * on the join page (`01-onboarding-and-auth.md` L778, frames 12, 722;
   * `README.md` L326, frame 520).
   */
  fullName: fullNameSchema,

  /**
   * Display name, a value distinct from the full name rather than a formatting of
   * it (`03-messaging-and-composer.md` L654, frame 172; `README.md` L326, frame 520).
   *
   * `null` where the person set none. The profile reports what was stored, so the
   * absence is visible and editable here; `personSummarySchema` reports the resolved
   * name instead, because a render has to have something to draw.
   */
  displayName: displayNameSchema.nullable(),

  /**
   * The stored-object reference for the profile photo, or `null` where none was set
   * — the photo is explicitly optional and is stored from a square crop
   * (`01-onboarding-and-auth.md` L778, frames 11, 21, 22).
   */
  avatarObjectKey: avatarObjectKeySchema.nullable(),

  /**
   * Presence (`README.md` L326, frame 519; `02-channels.md` L817;
   * `03-messaging-and-composer.md` L654, frame 172).
   *
   * Composed at read time and not a stored column of this record — see
   * `presenceSchema`. It appears on the profile because every surface that renders a
   * person renders it, not because the profile owns it.
   */
  presence: presenceSchema,

  /**
   * The person's named time zone (`README.md` L326, frames 520, 604). A named zone
   * and never an offset — see `timeZoneSchema` for why that distinction is stored
   * rather than derived.
   *
   * The local time the corpus renders beside a person (`README.md` L326, frame 519;
   * `03-messaging-and-composer.md` L654) is DERIVED from this value at render time
   * and is not a field: a stored local time would be wrong within the hour.
   */
  timeZone: timeZoneSchema,

  /** Pronouns, rendered beside the name (`README.md` L326, frame 520). Optional. */
  pronouns: z
    .string()
    .trim()
    .max(PRONOUNS_MAX_LENGTH, { error: 'PRONOUNS_TOO_LONG' satisfies PersonRejectionCode })
    .nullable(),

  /** Name pronunciation (`README.md` L326, frame 520). Optional. */
  namePronunciation: z
    .string()
    .trim()
    .max(NAME_PRONUNCIATION_MAX_LENGTH, {
      error: 'NAME_PRONUNCIATION_TOO_LONG' satisfies PersonRejectionCode,
    })
    .nullable(),

  /** Job title (`README.md` L326, frame 521). Optional. */
  jobTitle: z
    .string()
    .trim()
    .max(JOB_TITLE_MAX_LENGTH, { error: 'JOB_TITLE_TOO_LONG' satisfies PersonRejectionCode })
    .nullable(),

  /**
   * The descriptive role within this workspace (`01-onboarding-and-auth.md` L778,
   * frame 49; `README.md` L326, frames 120, 666). Descriptive, never a grant — see
   * `WORKSPACE_ROLES`.
   */
  workspaceRole: workspaceRoleSchema,

  /**
   * The absolute instant a guest's access ends, or `null` for no limit
   * (`01-onboarding-and-auth.md` L778, frames 50, 54). See
   * `guestAccessEndsAtSchema`, including why this clock is one of three that must
   * not be collapsed.
   */
  guestAccessEndsAt: guestAccessEndsAtSchema,
});

/** A person's full profile. Carries no credential of any kind; see the header. */
export type PersonProfile = z.infer<typeof personProfileSchema>;

/* ===========================================================================
 * The profile-update request
 * =========================================================================== */

/**
 * The request that changes one's own profile.
 *
 * ---------------------------------------------------------------------------
 * IT NAMES NO SUBJECT, AND THAT IS THE POINT
 * ---------------------------------------------------------------------------
 *
 * There is no `id`, no `userId`, no `actorId` and no `workspaceId` in this shape,
 * and there is no shape in this module that has one. Per `PROJECT_RULE_R1` an
 * authorization decision may not rest on a caller-supplied workspace or actor
 * identifier, so THE SUBJECT IS THE ACTING SESSION and nothing else: the server
 * resolves who is being edited from the session it authenticated, and the workspace
 * predicate is injected below the query by `packages/db/src/tenancy.ts` from that
 * same session. A field a caller could set would be a field a caller could change,
 * and the check would then be authorizing a value the attacker chose.
 *
 * Where an administrative surface later edits SOMEONE ELSE, the target is named in
 * the route path and authorized server-side against the role matrix
 * (`docs/decisions/role-matrix.md`) through the guard in
 * `apps/api/src/authz/guard.ts`. It is still never a body field a caller sets.
 *
 * ---------------------------------------------------------------------------
 * STRICT, AND NARROW
 * ---------------------------------------------------------------------------
 *
 * The object is STRICT, so an unknown key is rejected rather than ignored: an
 * ignored key is a key that looks accepted, and the next reader of the endpoint
 * cannot tell which of the two happened. That is what closes off a caller appending
 * `workspaceRole`, `emailVerified` or `guestAccessEndsAt` and hoping a permissive
 * spread reaches the database.
 *
 * Only genuinely self-editable values are present. Deliberately absent, each for its
 * own reason:
 *   - `id` — assigned by the server, never chosen.
 *   - `email` and `emailVerified` — an email CHANGE and an address VERIFICATION are
 *     not ordinary profile edits. The corpus shows the confirmed-as line carrying
 *     its own separate change link (`01-onboarding-and-auth.md` L778, frame 6), and
 *     verification is proved by a one-time code, which is a separately-secured
 *     artefact. Both are modelled in `./auth.ts`.
 *   - `presence` — heartbeat-driven, so it is reported by a client's connection
 *     rather than written by a form.
 *   - `workspaceRole` — descriptive here, but the thing an attacker would most like
 *     to set. It is administered through the authorization surface, never self-set.
 *   - `guestAccessEndsAt` — an administrative decision about an account, taken by
 *     whoever invited the guest, not by the guest.
 *
 * A key that is absent leaves its value unchanged. A key present with `null` clears
 * the value, and only the four values that are legitimately absent from a profile
 * may be cleared — a person cannot clear their own name or time zone, because the
 * product has to be able to render and schedule for them.
 */
export const updateOwnProfileRequestSchema = z
  .strictObject(
    {
      /** Replace the full name. May not be cleared. */
      fullName: fullNameSchema.optional(),

      /** Replace or clear the display name; cleared means the full name is resolved. */
      displayName: displayNameSchema.nullish(),

      /**
       * Replace or clear the profile photo reference.
       *
       * The bytes are already in object storage by the time this request is made —
       * see `./file.ts` for the pre-signed upload that put them there. This request
       * carries the resulting reference and never an image.
       */
      avatarObjectKey: avatarObjectKeySchema.nullish(),

      /** Replace the named time zone. May not be cleared. */
      timeZone: timeZoneSchema.optional(),

      /** Replace or clear the pronouns. */
      pronouns: z
        .string()
        .trim()
        .max(PRONOUNS_MAX_LENGTH, { error: 'PRONOUNS_TOO_LONG' satisfies PersonRejectionCode })
        .nullish(),

      /** Replace or clear the name pronunciation. */
      namePronunciation: z
        .string()
        .trim()
        .max(NAME_PRONUNCIATION_MAX_LENGTH, {
          error: 'NAME_PRONUNCIATION_TOO_LONG' satisfies PersonRejectionCode,
        })
        .nullish(),

      /** Replace or clear the job title. */
      jobTitle: z
        .string()
        .trim()
        .max(JOB_TITLE_MAX_LENGTH, { error: 'JOB_TITLE_TOO_LONG' satisfies PersonRejectionCode })
        .nullish(),
    },
    {
      // The two ways the envelope itself can be wrong are reported distinctly, so a
      // client can tell "you sent a field I do not accept" from "you did not send an
      // object at all". Both are codes; neither is a sentence.
      error: (issue) =>
        issue.code === 'unrecognized_keys'
          ? ('PROFILE_UPDATE_UNKNOWN_FIELD' satisfies PersonRejectionCode)
          : ('PROFILE_UPDATE_MALFORMED' satisfies PersonRejectionCode),
    },
  )
  .refine(
    // Every field is optional, so an empty body parses structurally while asking for
    // nothing. Rejecting it keeps a no-op from consuming an idempotency key and from
    // writing an audit record for a change that never happened. A key present with
    // `undefined` counts as absent, which is what it means on the wire.
    (candidate) => Object.values(candidate).some((value) => value !== undefined),
    { error: 'PROFILE_UPDATE_EMPTY' satisfies PersonRejectionCode },
  );

/**
 * A request to change one's own profile.
 *
 * Carries no subject identifier by construction; the subject is the acting session.
 */
export type UpdateOwnProfileRequest = z.infer<typeof updateOwnProfileRequestSchema>;

/* ===========================================================================
 * Per-viewer discipline — what may never be added to a person
 *
 * `S-PERUSER` (`docs/workflows/00-product-overview.md` L562-L566) supplies one test,
 * and it is the whole rule: IF TWO PEOPLE OPENED THIS AT THE SAME MOMENT, COULD THEY
 * LEGITIMATELY SEE DIFFERENT VALUES? If yes, the field belongs on a relation keyed by
 * the pair and never on the shared object. `docs/workflows/README.md` L357 calls this
 * "the single most consequential correction" in the consolidated model, and gives the
 * reason it is a security rule rather than a modelling preference: stored on the
 * shared object, one person saving something saves it for everyone, one person's
 * reminder fires for everyone, one person's reading marks it read for all — and each
 * of those flags additionally discloses that person's behaviour to every other member
 * of the object.
 *
 * So none of the following is ever a field of a person, however convenient it would
 * be to add one: an unread count or unread flag, a read marker or unread boundary, a
 * mark-as-unread, a notification scope, a mute, a star or favourite, a
 * saved-for-later flag, a reminder due time, a last-viewed or last-opened timestamp,
 * draft presence, sidebar placement, thread-follow state, per-client connection
 * diagnostics, or a dismissed banner.
 *
 * Where each of them lives instead:
 *   - viewer-owned preferences, including dismissed banners, which sit on the
 *     viewer's own preference record rather than on the object dismissed
 *     (`README.md` L372) — `./preference.ts`
 *   - conversation-scoped per-member state: unread flag and count, has-draft,
 *     per-conversation notification scope and mute, joined marker, star
 *     (`README.md` L363) — the membership record in `./channel.ts`
 *   - viewer-and-message state: read state, unread boundary, mark-as-unread,
 *     saved-for-later, reminder time (`README.md` L364) — `./message.ts`
 *
 * A NOTE ON THE RELATION COUNT, RECORDED RATHER THAN RESOLVED. The relation table at
 * `README.md` L363-L372 contains TEN rows, while the requirement ledger states
 * ELEVEN. Both readings stand and neither is asserted over the other here. The
 * discrepancy is recorded in `docs/decisions/catalog-defects.md` and
 * `docs/decisions/data-model.md`; per `PROJECT_RULE_R2` a defect in the
 * read-only catalogue is recorded rather than corrected in place, so neither those
 * records nor the catalogue is edited to make the two agree. What is not in doubt is
 * the rule itself, and `README.md` L374 settles precedence where the entity table and
 * the relation table appear to disagree about a per-viewer fact: the relation table
 * governs.
 * =========================================================================== */

/* ===========================================================================
 * Renderings that are not fields, and one field that belongs elsewhere
 *
 * THE SELF-MARKER AND REMOVABILITY ARE RENDERINGS, DERIVED AT RENDER TIME.
 * `docs/workflows/02-channels.md` L817 evidences "a guest role badge and a
 * self-marker badge beside a name" and "per-channel removability, absent on one's own
 * row", and L924 records that the signed-in person's own row carries a self-marker
 * and no remove control in every capture of the tab (frames 82, 106, 120). Neither is
 * stored: the self-marker is `summary.id` compared with the acting session's own
 * identifier, and removability is the same comparison plus the policy decision the
 * server makes. Storing either would be storing a per-viewer fact on a shared object,
 * which is precisely what `S-PERUSER` forbids — and a stored "removable" flag would
 * additionally be a client-side permission, which `PROJECT_RULE_R1` forbids.
 * A consumer that hides the remove control has rendered a courtesy, not a check; the
 * server denies the removal regardless.
 *
 * THE BILLING CLASSIFICATION IS NOT MODELLED HERE, DELIBERATELY. `README.md` L326
 * records that a person carries "a billing classification that is not a simple
 * function of account type: a guest permitted to join more than one channel is billed
 * as a full member" (frame 50). Billing is out of scope for this run, so no billing
 * field is invented — but the note is kept because the classification is a
 * consequence of `guest_multi_channel` above, and the tempting mistake later is to
 * put a commercial field on a person. Every tenant-scoped commercial value belongs to
 * the workspace's commercial position field group (`README.md` L321, L325) and none
 * of it belongs on a person or on the publicly readable plan.
 *
 * THE CHOSEN THEME COLOUR IS A PREFERENCE, NOT A PROFILE FIELD.
 * `01-onboarding-and-auth.md` L778 evidences "a chosen theme colour, offered as a
 * twelve-swatch grid during first run" (frame 26), and `README.md` L342 places a
 * theme choice and a system colour mode in the themes category of the preference
 * entity (frame 553). It is therefore modelled in `./preference.ts`. When it is, it
 * is stored as a TOKEN OR THEME IDENTIFIER and never as a colour value: per
 * `PROJECT_RULE_R4` no brand colour value may appear in source, no colour may be
 * sampled from a frame, and the palette literals exist in exactly one file in the
 * tree, `packages/ui/src/styles/tokens.ts`. There is no hexadecimal literal anywhere
 * in this module for the same reason.
 *
 * FIELDS OF A PERSON THIS MODULE DOES NOT CARRY, BECAUSE THEIR AREA IS DEFERRED AND
 * NOT BECAUSE THEIR VALUE IS UNCERTAIN. `README.md` L326 aggregates a person's fields
 * across every area, and several are owned by areas outside this run's five: a phone
 * number and a recorded name clip (frame 519, 520), status text with an emoji and a
 * clear-after time, an away flag and a notification-pause state (frame 504), a status
 * emoji in the sidebar (frame 512), an about-me start date (frame 526), a two-factor
 * state and a language (frame 604), an assignable role with its member count (frame
 * 666), a deactivated state (frame 609) and membership of several workspaces (frame
 * 731). Each is evidenced and each is real; each is added by the area document that
 * owns it, additively, exactly as the consolidated model is built. This is a SCOPE
 * boundary, and it is recorded here so that it is not mistaken for the omission
 * `PROJECT_RULE_R3` prohibits: nothing above is left out because a value was
 * uncertain, and no mechanism this module owns is left unimplemented.
 * =========================================================================== */
