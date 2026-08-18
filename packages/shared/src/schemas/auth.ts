/**
 * The authentication contract — every gate surface, and four things that are
 * deliberately absent from all of them.
 *
 * This module defines the shape of every request a person can make before they
 * hold a session, and of the two shapes returned once they do. It covers sign-up,
 * address verification, account confirmation, **three distinct sign-in paths**,
 * **two distinct recovery paths**, device enrolment, invitation acceptance,
 * session termination, and marketing consent as an act. The schemas here are the
 * single definition: `../openapi/registry.ts` attaches descriptions and examples
 * to them at registration time, and `../types/` derives its types from them.
 *
 * ---------------------------------------------------------------------------
 * THE FOUR ABSENCES, WHICH ARE THE POINT OF THE FILE
 * ---------------------------------------------------------------------------
 *
 * The read-only catalogue's evidence for these flows is unusually good and its
 * security contract for them is unusually strict, and the strict part is almost
 * entirely NEGATIVE. Four things are absent from this module by contract, and
 * each has a section below explaining why, because each is a field a well-meaning
 * author would otherwise add:
 *
 *   1. **No strength rating.** Not a score, not a rating, not a segment count,
 *      not an enum, not a meter value — inbound or outbound.
 *   2. **No session token, bearer or session identifier.** Nothing this module
 *      returns can be presented as a credential.
 *   3. **No verifier, hash, salt or hashing parameter.** Not on a request, not
 *      on a response, not as a constant.
 *   4. **No consent that defaults to granted.** An affirmative act is a
 *      `z.literal(true)`, so "absent" and "false" both fail to parse and there
 *      is no `.default(true)` anywhere in the file.
 *
 * A fifth absence spans every shape: **no request declares a workspace, actor or
 * user identifier**, and no request declares a role. See the block after next.
 *
 * ---------------------------------------------------------------------------
 * WHY NONE OF THOSE ABSENCES CAN BE CHECKED AGAINST A FRAME
 * ---------------------------------------------------------------------------
 *
 * The corpus is a single authenticated session in one workspace. It cannot show a
 * rejection being stored, a consent record being written, a session being
 * revoked, or a password being hashed — and it can never show what a different
 * viewer, a different role or a de-authorized viewer would see. Every security
 * requirement in this file is therefore an OBLIGATION the specification places on
 * the build rather than an observation anyone can verify against an image, which
 * is exactly why each is enforced by the SHAPE: a field that does not exist
 * cannot be populated by a mistake, and a `z.literal(true)` cannot be satisfied
 * by a rendering.
 *
 * ---------------------------------------------------------------------------
 * NO REQUEST NAMES ITS OWN SUBJECT, ITS WORKSPACE OR ITS ROLE
 * ---------------------------------------------------------------------------
 *
 * Per `PROJECT_RULE_R1` an authorization decision may never rest on a
 * caller-supplied workspace or actor identifier, so there is no `workspaceId`, no
 * `userId`, no `actorId`, no `accountId` and no `sessionId` field in this module.
 * Where a request is about a person, THE SUBJECT IS THE ACTING SESSION. Where a
 * request is about a workspace, the workspace is resolved from one of exactly
 * three server-side sources:
 *
 *   - **The route**, for a workspace-scoped surface. Returning sign-in resolves
 *     the workspace FIRST, from a subdomain typed against a fixed, non-editable
 *     suffix, and only then serves that workspace's own sign-in page
 *     [`01-onboarding-and-auth.md` L336, frames 717, 718, 719]. The subdomain in
 *     `workspaceSelectorSchema` below is therefore a LOOKUP TERM the server
 *     resolves and authorizes, and it is not an identifier and grants nothing.
 *   - **The resolved invitation**, for the join path. The invitation binds the
 *     ADDRESS, not the person: the acceptance page states its recipient address
 *     as fact and offers no field to change it [L361, frame 721], so the address
 *     and the workspace both come from the redeemed record rather than from the
 *     body. That is why `acceptInvitationRequestSchema` carries no address.
 *   - **The chooser selection**, for the welcome-back path, which is a
 *     PROJECTION over the acting session's own memberships — see
 *     `workspaceChoiceSchema`.
 *
 * A ROLE OR ACCOUNT TYPE IS NEVER SOMETHING A CALLER ASSERTS ABOUT ITSELF. There
 * is no role field on any request here. Enrolment in particular is authorized
 * server-side against the workspace's STORED policy and the joiner's CONFIRMED
 * address, so neither a client that never rendered a control nor an unverified
 * address can enrol [L929]. The capability meaning of a role lives in
 * `docs/decisions/role-matrix.md` and `apps/api/src/authz/`, never here.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS MODULE OWNS, AND WHAT IT POINTEDLY DOES NOT
 * ---------------------------------------------------------------------------
 *
 * Owned here: the shape of every gate-surface request and the two gate-surface
 * projections. Owned elsewhere, and named so that the two halves cannot drift:
 *
 *   - **Issuing an invitation** — recipient, invited-as role, channel scope,
 *     custom message, link settings and expiry — is `./invitation.ts`. THIS
 *     module owns only the other half: redeeming one. A change to what an
 *     inviter may set belongs there; a change to what an invitee submits belongs
 *     here.
 *   - **Password hashing parameters** are compile-time invariants in
 *     `../config/constants.ts` and are consumed by
 *     `apps/api/src/secrets/password.ts`. They are NOT consumed here, and no
 *     memory, iteration or parallelism value appears in this file.
 *   - **Session idle and absolute bounds**, the code's expiry and the reset
 *     link's expiry are environment-overridable defaults in `../config/env.ts`.
 *     No duration is restated in this module — see the next block.
 *   - **The persisted artefacts.** Four separate lifecycle-bearing tables in
 *     `packages/db/prisma/schema.prisma`, reached through
 *     `apps/api/src/secrets/password.ts`, `otp.ts`, `enrolment-code.ts` and
 *     `session-store.ts`. None is a column on a person, which is why
 *     `./user.ts` carries no credential field.
 *   - **Every rendered sentence** is in `../copy/en.ts`, which this module does
 *     NOT import. A client receives a code from the union below and chooses the
 *     wording itself.
 *
 * ---------------------------------------------------------------------------
 * NOT ONE DURATION IS WRITTEN IN THIS FILE
 * ---------------------------------------------------------------------------
 *
 * The catalogue states that the verification code "expires shortly" and never
 * states by how much [L778, frames 4, 728]. Per `PROJECT_RULE_R3` that
 * uncertainty is not permission to omit the expiry mechanism, and it is equally
 * not permission to invent a literal at a point of use. So the mechanism ships
 * and the number lives in configuration: **an expiry is resolved once, at
 * issuance, and stored as an ABSOLUTE INSTANT**, then enforced server-side by
 * comparing that instant to now. A configured default may therefore change
 * without invalidating a record already issued.
 *
 * The consequence for this module is that no request ever CARRIES an expiry and
 * no response ever RETURNS one. A caller that could send an expiry could extend
 * one. Every bound that does appear below is a LENGTH bound, declared exactly
 * once as a named exported constant and consumed by reference.
 *
 * ---------------------------------------------------------------------------
 * WHERE THE AUTHORED CHOICES IN THIS FILE ARE JUSTIFIED
 * ---------------------------------------------------------------------------
 *
 * Several values here could not be read from the specification because the
 * specification does not state them — the password policy, the code's alphabet,
 * the case handling of an address, the three unevidenced enrolment states, the
 * confirmation-mismatch check. Per `PROJECT_RULE_R3` none of those was an excuse
 * to omit a mechanism, so each ships, and each carries its full reasoning AT ITS
 * POINT OF USE below: what the specification does and does not say, the options,
 * the choice, and why.
 *
 * Those comments also name `docs/decisions/gap-register.md`, which is the register
 * that INDEXES such choices across the build. That file is a separate deliverable
 * with its own owner, so a reference to it here is a pointer to where the entry
 * belongs rather than an assertion that the entry is already written — the
 * authoritative reasoning for anything this module decides is the comment beside
 * the decision, which cannot drift from the code it explains.
 *
 * ---------------------------------------------------------------------------
 * MODULE CONSTRAINTS
 * ---------------------------------------------------------------------------
 *
 * - Pure `zod`. No `.openapi()` call and no `extendZodWithOpenApi` here; both
 *   belong to `../openapi/registry.ts`. The reason is structural rather than
 *   stylistic: the package barrel re-exports this module into the browser
 *   bundle, and an `.openapi()` call would pull the specification generator in
 *   with it.
 * - No framework import of any kind — no server, no view library, no database
 *   client, no editor.
 * - Relative imports carry the `.js` suffix, which this package's
 *   `moduleResolution` requires. The package is never self-imported by name.
 * - Side-effect free, as the manifest declares. Every export is a value or a
 *   type; nothing here runs at import time beyond constructing schemas.
 * - Every object is STRICT, so an unknown key is rejected rather than ignored.
 *   An ignored key is a key that looks accepted.
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
 * because every one of them embeds the third-party product name that R4 forbids
 * from appearing in source or in comments. Writing them would make the build's
 * own brand guard fail on the file that cites the rule it enforces. A downstream
 * reader should not "restore" them. Two warnings for whoever maps them back: the
 * identifiers are PERMUTED relative to the R labels, so the label is the thing to
 * trust and an ordinal is not; and these labels are a citation shorthand rather
 * than a paraphrase — the authoritative wording lives in the rules interface, and
 * this file summarises rather than restates it.
 *
 * Frames are likewise cited by NUMBER alone and never by filename, because each
 * of the 1,022 frame filenames embeds the same prohibited token. Every
 * catalogue location cited below was read from `docs/workflows/`; per
 * `PROJECT_RULE_R2` no frame was opened to write this module, and nothing here
 * needed one.
 */

import { z } from 'zod';

import { personSummarySchema } from './user.js';

/* ===========================================================================
 * Length bounds
 *
 * Each bound is declared once here and referenced everywhere below. A validator
 * that inlined its own number would be a second source of truth for the same
 * rule, which `PROJECT_RULE_R3` prohibits in the same breath as it prohibits
 * omitting a mechanism.
 *
 * Note what is NOT in this section: no duration, no attempt count, no window and
 * no rate. Those are enforcement values, they live in configuration, and none of
 * them crosses this contract — see the header.
 * =========================================================================== */

/**
 * Maximum length of an email address.
 *
 * 254 characters is the longest address expressible in an SMTP forward path,
 * which is the practical ceiling for an address this product must be able to send
 * a code, an invitation or a reset link to. Chosen because it is the boring,
 * well-supported limit rather than a guess, and it matches the bound `./user.ts`
 * applies to the same value so one address cannot be valid on one surface and
 * invalid on the next.
 */
export const AUTH_EMAIL_MAX_LENGTH = 254;

/**
 * The exact number of characters in a verification or sign-in code.
 *
 * The catalogue states the length rather than leaving it to be measured: the page
 * "states the length of the code" and renders "six empty character boxes arranged
 * as two groups of three" [`01-onboarding-and-auth.md` L74, L384, frames 4, 5,
 * 728, 729, 730], and the implied data model repeats that "the surfaces state it
 * is six characters long" [L778].
 *
 * EXACT, NOT A MAXIMUM. `.length()` rather than `.min()`/`.max()` is deliberate:
 * a five-character value is not a short code, it is not a code, and accepting one
 * would spend a rate-limit attempt on an input that cannot possibly match.
 *
 * Declared once and shared by both code paths — verification (flow 01.2) and
 * emailed-code sign-in (flow 01.13) — because `C-SEGMENTED-CODE-INPUT` is ONE
 * contract rendered on both surfaces. Per `PROJECT_RULE_R5` the component is
 * implemented exactly once in `packages/ui`, and the validation that mirrors it is
 * declared exactly once here; a per-surface code length would be the schema-side
 * equivalent of forking the component.
 */
export const AUTH_CODE_LENGTH = 6;

/**
 * Maximum length of a RAW code submission, before display separators are stripped.
 *
 * A second bound is needed because `AUTH_CODE_LENGTH` above is exact and is applied
 * only AFTER normalisation, which means it cannot protect the normalisation step
 * itself. This one is a denial-of-service control on the input: it refuses an
 * oversized submission before any transform runs over it.
 *
 * 64 is far above any legitimate submission — six characters plus whatever
 * separators or whitespace a paste carried from the rendered two-group form — and
 * far below anything worth calling a payload. It is deliberately NOT the email
 * bound: a code and an address are different subjects, and borrowing one bound for
 * the other would make a reader wonder which rule had changed when either moved.
 */
export const AUTH_CODE_SUBMISSION_MAX_LENGTH = 64;

/**
 * Minimum length of an accepted password, enforced server-side on submission.
 *
 * The catalogue supplies NO password policy at all — it shows a masked field, a
 * reuse rejection and a strength meter, and states in terms that the meter "is
 * advisory only and is not a policy gate" and that "whatever password policy the
 * build adopts is evaluated server-side on submission"
 * [`00-product-overview.md` L362; `01-onboarding-and-auth.md` L928, frames 733,
 * 741, 742]. Per `PROJECT_RULE_R3` the absence of a stated value is not
 * permission to ship no policy, so a policy is authored here and recorded in
 * `docs/decisions/gap-register.md`.
 *
 * Twelve characters is chosen as the conventional round floor for a
 * length-primary policy: current guidance favours length over composition rules,
 * because a composition rule pushes people toward predictable substitutions while
 * length raises the work factor directly. There is deliberately no
 * character-class requirement anywhere in this module for that reason.
 */
export const AUTH_PASSWORD_MIN_LENGTH = 12;

/**
 * Maximum length of an accepted password.
 *
 * This bound is a denial-of-service control and nothing else, and it is worth
 * saying so because its size invites the opposite reading. The verifier is
 * memory-hard by design — that is the property that makes it worth using — so an
 * unbounded input is an invitation to make the server do unbounded work per
 * request. 128 characters comfortably admits any passphrase a person would type
 * or a manager would generate, while keeping the cost of one rejected attempt
 * bounded. It is NOT a hint about the storage format: what is stored is a
 * fixed-size verifier, computed in `apps/api/src/secrets/password.ts`, and this
 * number tells a reader nothing about it.
 */
export const AUTH_PASSWORD_MAX_LENGTH = 128;

/**
 * Maximum length of the opaque token a capability link carries.
 *
 * The token is a class-B artefact and is treated here as an OPAQUE STRING with no
 * internal structure this module may inspect — see `capabilityLinkTokenSchema`
 * for why parsing it here would be a mistake. What a length bound buys is
 * therefore not validation but containment: a value far above any legitimate
 * selector-plus-secret encoding is refused before it reaches the constant-time
 * comparison, so an oversized input cannot be used to probe timing or to push
 * work onto the verifier.
 */
export const AUTH_LINK_TOKEN_MAX_LENGTH = 512;

/**
 * Minimum length of the opaque token a capability link carries.
 *
 * A short token is not a weak token, it is a token that cannot have come from the
 * issuer, because a class-B value is "generated as a high-entropy opaque token
 * split into a non-secret lookup selector and a secret part"
 * [`00-product-overview.md` L546] and neither half is short. Rejecting one early
 * keeps a guess out of the redemption path entirely.
 */
export const AUTH_LINK_TOKEN_MIN_LENGTH = 32;

/**
 * Maximum length of a workspace's chosen subdomain, as typed on the
 * workspace-resolution page.
 *
 * The field renders "a subdomain against a fixed, non-editable domain suffix"
 * [`01-onboarding-and-auth.md` L336, frames 717, 718], so what a caller supplies
 * is the label alone and never the whole host. 63 characters is the ceiling a
 * single DNS label may occupy, which makes this bound a property of the thing
 * being named rather than a number chosen for it.
 */
export const AUTH_WORKSPACE_SUBDOMAIN_MAX_LENGTH = 63;

/**
 * Minimum length of a workspace's chosen subdomain.
 *
 * A single character is a legitimate DNS label, so the floor is one and the
 * pattern below carries the rest of the rule. Stated as a constant rather than
 * left implicit because the pattern's own `+` quantifier would otherwise be the
 * only place the floor exists, and a reader auditing bounds should find it here.
 */
export const AUTH_WORKSPACE_SUBDOMAIN_MIN_LENGTH = 1;

/**
 * Maximum length of the display name collected on the invitation join page.
 *
 * The join page "asks for one thing — a name" [`01-onboarding-and-auth.md` L361,
 * frames 721, 722], and the value it collects is the display name that later
 * renders on an author line and a member row. The bound therefore matches the one
 * `./user.ts` applies to a display name, so a name accepted at the gate cannot be
 * rejected by the profile that stores it.
 */
export const AUTH_DISPLAY_NAME_MAX_LENGTH = 80;

/**
 * Minimum length of any text value that is supplied at all.
 *
 * Applied AFTER trimming, so a run of spaces is rejected rather than stored as a
 * name. One constant rather than one per field, because every field below shares
 * the one rule: a value that is supplied is not blank.
 */
export const AUTH_NON_BLANK_MIN_LENGTH = 1;

/**
 * Maximum length of an identifier that names a piece of authored copy — the
 * consent wording and the policy version.
 *
 * These are IDENTIFIERS resolved against the authored copy dictionary, never the
 * text itself; see `marketingConsentActSchema` for why that distinction is the
 * whole design. The bound is generous for a key and far too short for a
 * paragraph, which is the point: it makes "send the wording instead of its name"
 * fail rather than succeed quietly.
 */
export const AUTH_COPY_IDENTIFIER_MAX_LENGTH = 128;

/* ===========================================================================
 * Rejection codes
 *
 * Every rejection this module can produce is a CODE, never a sentence. Two rules
 * meet here. Per `PROJECT_RULE_R4` no third-party product copy may be
 * transcribed, and the sentences these rejections correspond to are legible in
 * frames — the invalid-code line [frame 730], the incorrect-address-or-password
 * line [frame 735], the previously-used-password banner [frame 741] — so none of
 * them is reproduced. And per this module's own constraints the sentence a person
 * reads is chosen by the client from `../copy/en.ts`, which this file does not
 * import.
 *
 * The codes are attached to the validators below as their issue messages, which
 * is what keeps this union load-bearing rather than decorative: a client receives
 * the code and resolves its own wording, so no user-facing prose exists in the
 * contract package and no rejection can leak an implementation detail.
 *
 * ---------------------------------------------------------------------------
 * THE THREE SIGN-IN PATHS FAIL DISTINGUISHABLY, BECAUSE THE CATALOGUE SAYS SO
 * ---------------------------------------------------------------------------
 *
 * This is an acceptance criterion rather than a preference: "The invalid-code
 * state and the rejected-credential state are implemented as two distinct states
 * with different messages, different fields cleared and different pages, not as
 * one generic error" [`01-onboarding-and-auth.md` L924, frames 730, 735]. The
 * catalogue derives the distinction from the pixels twice over — the invalid-code
 * message is inserted into the code page's existing layout and CLEARS the boxes
 * [L384, frame 730], while the rejected-credential message sits beneath a field
 * pair on a different page, outlines both fields, KEEPS the address and clears
 * only the password [L435, frame 735].
 *
 * So `auth_code_invalid` and `auth_credential_rejected` are separate codes and one
 * must never be substituted for the other: `apps/web` renders them differently,
 * and a single generic code would make that impossible while appearing to work.
 * `auth_code_expired` is a third, because an expired code is a different remedy
 * from a wrong one — request another rather than retype.
 *
 * ---------------------------------------------------------------------------
 * ONE CODE IS DELIBERATELY AMBIGUOUS, AND THAT IS A SECURITY PROPERTY
 * ---------------------------------------------------------------------------
 *
 * `auth_credential_rejected` names neither the address nor the password. The
 * catalogue reads the same intent off the capture — "the error is deliberately
 * ambiguous about which credential was wrong, because one message names both the
 * address and the password and only one field is cleared" [L435, frame 735] — and
 * the reason to keep it is stronger than fidelity: a code that distinguished
 * "no such address" from "wrong password" would be an account-enumeration oracle
 * on the busiest endpoint in the product.
 *
 * There is, for the same reason, NO code anywhere in this union meaning "no such
 * address", "address already registered", "no such account" or "not invited".
 * Nothing in this module lets a caller learn whether an address exists.
 *
 * ---------------------------------------------------------------------------
 * FIVE CODES DESCRIBE STATES THE CORPUS NEVER SHOWS
 * ---------------------------------------------------------------------------
 *
 * `auth_rate_limited`, `auth_attempts_exhausted`, `auth_issuance_limited`,
 * `auth_code_already_used` and `auth_reset_link_revoked` have no rendering
 * anywhere in the corpus. That is stated rather than inferred: the code entry
 * criterion records that "the corpus renders no lockout, throttle notice or
 * attempt counter anywhere, so the rendering is designed per `S-GAP`" [L930], and
 * the component obligation says the same of the control [`00-product-overview.md`
 * L364]. Per `PROJECT_RULE_R3` a missing rendering is an open work item and never
 * permission to skip the mechanism, so the vocabulary exists here, the
 * enforcement lives in `apps/api/src/plugins/rate-limit.ts` and the secrets
 * modules, and the designed renderings are registered in
 * `docs/decisions/gap-register.md` — a path this module references and never
 * edits.
 *
 * Note what these codes are NOT: an attempt counter. No request in this module
 * carries a remaining-attempts number and no response returns one, because a
 * count is a measurement of the limit an attacker is trying to find.
 * =========================================================================== */

/**
 * The closed set of rejection codes the authentication schemas emit.
 *
 * A readonly tuple so the union is derived from it rather than restated, and so a
 * consumer can enumerate the set — an exhaustive mapping to authored copy is what
 * stops a code reaching a person as a raw token. Lower snake case matches the
 * convention `./content.ts` established for a rejection vocabulary that crosses
 * the wire.
 */
export const AUTH_REJECTION_CODES = [
  /* --- The address ------------------------------------------------------- */
  /** Not a well-formed address, or blank, or past the length bound. */
  'auth_email_invalid',

  /* --- The six-character code (flows 01.2, 01.13) ------------------------ */
  /** Not six characters, or outside the code alphabet, or simply wrong. */
  'auth_code_invalid',
  /** Well-formed and known, but past the absolute instant fixed at issuance. */
  'auth_code_expired',
  /** Well-formed and known, and already consumed. A code is single-use. */
  'auth_code_already_used',

  /* --- The password (flows 01.15, 01.17) --------------------------------- */
  /**
   * The address-and-password pair was not accepted. Deliberately says nothing
   * about which half failed; see the section above.
   */
  'auth_credential_rejected',
  /** The submitted password does not satisfy the server-side policy. */
  'auth_password_policy',
  /**
   * The new password matches a stored verifier for this account, so it has been
   * used before [frames 733, 741]. Distinct from a policy failure: the value is
   * acceptable in itself and unacceptable for this account.
   */
  'auth_password_reused',
  /** The confirmation field does not match the new-password field. */
  'auth_password_confirmation_mismatch',

  /* --- Capability links (flows 01.16, 01.17) ----------------------------- */
  /** The presented token resolved to no live record, or is malformed. */
  'auth_reset_link_invalid',
  /** The token resolved, and is past the absolute instant fixed at issuance. */
  'auth_reset_link_expired',
  /** The token resolved, and the capability behind it has been withdrawn. */
  'auth_reset_link_revoked',

  /* --- The workspace selector (flows 01.11, 01.14) ----------------------- */
  /** The submitted subdomain is not a well-formed single DNS label. */
  'auth_workspace_selector_invalid',

  /* --- The join page (flows 01.12, 01.19) -------------------------------- */
  /** The display name is blank, over-long, or carries refused characters. */
  'auth_display_name_invalid',
  /** The presented invitation token resolved to no live, unredeemed record. */
  'auth_invitation_invalid',

  /* --- Marketing consent (flow 01.3) ------------------------------------- */
  /**
   * A consent record was requested without an affirmative act. The single most
   * important code in this union; see `marketingConsentActSchema`.
   */
  'consent_act_required',
  /** The wording identifier or the policy version is malformed. */
  'consent_reference_invalid',
  /** The named surface is not one this build presents a consent control on. */
  'consent_surface_unrecognised',

  /* --- Anti-automation, none of it rendered anywhere in the corpus ------- */
  /** Too many attempts from this source in the window. */
  'auth_rate_limited',
  /** The per-account or per-address attempt bound is spent. */
  'auth_attempts_exhausted',
  /** The bound on codes issuable for one address in a window is spent. */
  'auth_issuance_limited',

  /* --- Envelope --------------------------------------------------------- */
  /** The body was not an object of the expected shape. */
  'auth_request_malformed',
  /** The body carried a key this endpoint does not accept. */
  'auth_request_unknown_field',
] as const;

/** Schema for a single rejection code, for use where a code crosses a boundary. */
export const authRejectionCodeSchema = z.enum(AUTH_REJECTION_CODES);

/** A machine-readable reason an authentication shape was rejected. Never prose. */
export type AuthRejectionCode = z.infer<typeof authRejectionCodeSchema>;

/**
 * The envelope error reporter every strict object below shares.
 *
 * The two ways an envelope can be wrong are reported distinctly, so a client can
 * tell "you sent a field I do not accept" from "you did not send an object at
 * all". Both are codes; neither is a sentence. Declared once as a function so
 * that eighteen objects cannot drift into eighteen slightly different reporters.
 */
const authEnvelopeError = (issue: { readonly code?: string | undefined }): AuthRejectionCode =>
  issue.code === 'unrecognized_keys' ? 'auth_request_unknown_field' : 'auth_request_malformed';

/* ===========================================================================
 * Unicode hygiene
 *
 * `S-CONTENT` requires Unicode normalisation and "rejection or neutralisation of
 * control characters and of bidirectional-override characters, which is what
 * stops a filename or display name from reordering the text around it"
 * [`00-product-overview.md` L526]. A display name IS what this module collects on
 * the join page [frame 722], so the discipline applies here in the letter as well
 * as the spirit, and it is applied to every free-text value below.
 *
 * Implemented locally rather than imported. `./content.ts` runs the same
 * discipline for message content and keeps its pipeline private to that module;
 * this file's dependency contract admits `zod` and `./user.js` and nothing else,
 * so reaching into a sibling's internals is not available and would be the wrong
 * shape regardless — the two modules bound different values for different
 * reasons. The character classes are identical because the contract is, and that
 * agreement is deliberate rather than incidental.
 *
 * Detection is a code-unit SCAN rather than a pattern. A scan cannot be made to
 * backtrack, which matters on a pre-session endpoint an unauthenticated caller
 * can reach at will; it states exactly which code points are refused where a
 * pattern hides them behind escapes; and every code point in question lies in the
 * basic plane, so a code-unit scan is exact and a surrogate pair can never be
 * mistaken for one.
 * =========================================================================== */

/** The canonical composed form every accepted text value is normalised to. */
const UNICODE_NORMALISATION_FORM = 'NFC';

/** Highest code unit in the first control range, which begins at zero. */
const C0_CONTROL_LAST = 0x1f;

/** Lowest code unit in the delete-and-second-control range. */
const C1_CONTROL_FIRST = 0x7f;

/** Highest code unit in the delete-and-second-control range. */
const C1_CONTROL_LAST = 0x9f;

/** Lowest code unit of the bidirectional embedding-and-override block. */
const BIDI_FORMATTING_FIRST = 0x202a;

/** Highest code unit of the bidirectional embedding-and-override block. */
const BIDI_FORMATTING_LAST = 0x202e;

/** Lowest code unit of the bidirectional isolate block. */
const BIDI_ISOLATE_FIRST = 0x2066;

/** Highest code unit of the bidirectional isolate block. */
const BIDI_ISOLATE_LAST = 0x2069;

/** Normalises a value to the single canonical composed form used everywhere. */
const toCanonicalUnicodeForm = (value: string): string =>
  value.normalize(UNICODE_NORMALISATION_FORM);

/**
 * Reports whether a value carries a control character.
 *
 * No value in this module legitimately carries one. Unlike message content, which
 * has a code block whose text genuinely holds line feeds and tabs, every field
 * here is a single line: an address, a code, a subdomain, a name, a token. So
 * there is no allow-line-breaks parameter to get wrong.
 */
const containsControlCharacter = (value: string): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit <= C0_CONTROL_LAST) {
      return true;
    }
    if (codeUnit >= C1_CONTROL_FIRST && codeUnit <= C1_CONTROL_LAST) {
      return true;
    }
  }
  return false;
};

/**
 * Reports whether a value carries a bidirectional embedding, override or isolate.
 *
 * Two exclusions are deliberate and both would be defects if they went the other
 * way. The directional MARKS are not refused: they annotate the resolved
 * direction of neutral characters and cannot reorder a surrounding run, so
 * refusing them would break legitimate mixed-direction text while closing no
 * attack. Nor is any right-to-left SCRIPT character refused — those are ordinary
 * letters, and a person whose name is written in one must be able to join.
 */
const containsBidirectionalFormatting = (value: string): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= BIDI_FORMATTING_FIRST && codeUnit <= BIDI_FORMATTING_LAST) {
      return true;
    }
    if (codeUnit >= BIDI_ISOLATE_FIRST && codeUnit <= BIDI_ISOLATE_LAST) {
      return true;
    }
  }
  return false;
};

/**
 * Whether a value is free of both refused character classes.
 *
 * One predicate rather than two call sites per field, so a field cannot acquire
 * one check and miss the other.
 */
const isCleanSingleLineText = (value: string): boolean =>
  !containsControlCharacter(value) && !containsBidirectionalFormatting(value);

/* ===========================================================================
 * Field primitives
 *
 * Each is declared once and reused by every request below, so a bound, a
 * character class or a normalisation step cannot drift between the sign-up page,
 * the sign-in page and the recovery pages — three surfaces that all take an
 * address, and two that both take a code.
 * =========================================================================== */

/**
 * The alphabet a verification or sign-in code may be drawn from.
 *
 * Upper-case letters and digits, which is the conventional alphabet for a code a
 * person reads off a screen and retypes. The catalogue states the code's LENGTH
 * and never its alphabet [`01-onboarding-and-auth.md` L778], so per
 * `PROJECT_RULE_R3` this is an authored choice recorded in
 * `docs/decisions/gap-register.md` rather than a value read from anywhere.
 *
 * The class is applied after the normalisation below, which is why it needs no
 * lower-case range.
 */
const AUTH_CODE_PATTERN = /^[A-Z0-9]+$/;

/**
 * Characters a display grouping may insert into a code, removed before validation.
 *
 * The corpus renders the six characters "as two hyphen-separated groups"
 * [`01-onboarding-and-auth.md` L74, L384, frames 5, 729], so a person who selects
 * the rendered value, or pastes a code a mail client formatted the same way,
 * legitimately supplies a hyphen or a space. Stripping the separator is what makes
 * paste work, and paste MUST work: the field "advertises one-time-code autofill
 * and permits paste" is an accessible-authentication obligation that automated
 * scanning cannot judge, so it is discharged deliberately here and in the
 * `C-SEGMENTED-CODE-INPUT` contract module rather than left to chance.
 */
const AUTH_CODE_SEPARATORS = /[\s-]+/g;

/**
 * A single DNS label, which is what a workspace subdomain is.
 *
 * Lower-case alphanumeric with interior hyphens, and the anchors plus the
 * character classes at each end are what refuse a leading or trailing hyphen. The
 * class admits no dot, so a caller cannot supply a whole host where a label
 * belongs and cannot aim the lookup at another domain by appending one — which
 * matters because the page's own suffix is "fixed, non-editable"
 * [`01-onboarding-and-auth.md` L336, frame 717] and the server, not the caller,
 * is what appends it.
 */
const AUTH_WORKSPACE_SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * Characters permitted in an identifier that names a piece of authored copy.
 *
 * Restricted to a key alphabet — letters, digits, dot, underscore and hyphen —
 * with no whitespace, so a paragraph of prose cannot satisfy it however short. See
 * `marketingConsentActSchema` for why the wording must arrive as a name.
 */
const AUTH_COPY_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Characters permitted in the opaque token a capability link carries.
 *
 * The URL-safe alphabet, because a class-B value legitimately travels in an
 * address — "a link that may not travel in a URL cannot be a link"
 * [`00-product-overview.md` L546]. The class deliberately excludes the dot and
 * the slash so a token can never be read as a path, and excludes every character
 * that would need escaping, so no consumer has to decide how to encode one.
 */
const AUTH_LINK_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * A person's email address, normalised so one person cannot become two accounts.
 *
 * ---------------------------------------------------------------------------
 * WHY THE ADDRESS IS THE WHOLE PAYLOAD OF SEVERAL REQUESTS
 * ---------------------------------------------------------------------------
 *
 * The catalogue records the address as "entered at sign-up and echoed by every
 * later surface as the account's identifier" [`01-onboarding-and-auth.md` L778,
 * frames 1, 6], and sign-up's first surface "asks for one thing" [L48, frame 1].
 * So an address alone is a complete request in four places below.
 *
 * ---------------------------------------------------------------------------
 * CASE HANDLING, STATED EXPLICITLY BECAUSE IT DECIDES ACCOUNT IDENTITY
 * ---------------------------------------------------------------------------
 *
 * The value is trimmed and LOWER-CASED IN FULL before validation, and the
 * lower-cased form is what every consumer receives. Domains are
 * case-insensitive by specification; local parts are formally case-sensitive, but
 * no mail provider a person would sign up with treats them that way, and the cost
 * of the two choices is asymmetric. Preserving local-part case would let one
 * person hold two accounts on one mailbox, split their history across both, and
 * receive an invitation on the address they cannot sign in with. Folding case
 * makes the address a stable identifier, which is what the catalogue says it is.
 * Recorded as a deliberate choice in `docs/decisions/gap-register.md`.
 *
 * Normalising HERE, once, is what makes it true everywhere: a verification code is
 * a "per-address verifier" [L778] and a rate limit is applied "per address" [L930],
 * so two spellings of one address reaching the server would be two verifier
 * records and two independent limit buckets — the second of which is a bypass of
 * the first.
 *
 * ---------------------------------------------------------------------------
 * GOVERNED BY `S-PII`, WITH ONE OBLIGATION THAT BINDS THIS MODULE PARTICULARLY
 * ---------------------------------------------------------------------------
 *
 * Per `S-PII` [`00-product-overview.md` L558] an address is personal data and is
 * NOT a secret, so it is neither hashed nor sealed — a code has to reach the
 * address that was typed. What binds instead: the value never reaches an
 * application log, an error report, an analytics event, A URL, A CACHE KEY or a
 * telemetry payload, and where the person must be referenced in any of those
 * places an opaque record identifier is referenced instead.
 *
 * The cache-key and URL clauses are the ones that bite on a gate surface, because
 * the obvious implementations breach both: a per-address rate-limit bucket keyed on
 * the raw address is a cache key holding personal data, and a verification or
 * recovery step that carries the address in the path or the query string puts it
 * in a URL, an access log and a referrer. Both are avoided server-side — the
 * bucket is keyed on a keyed digest and the step is carried in the request body —
 * and neither is a decision this schema can enforce, so it is stated here where a
 * consumer will read it.
 */
export const authEmailAddressSchema = z
  .string({ error: 'auth_email_invalid' satisfies AuthRejectionCode })
  .trim()
  .toLowerCase()
  .min(AUTH_NON_BLANK_MIN_LENGTH, { error: 'auth_email_invalid' satisfies AuthRejectionCode })
  .max(AUTH_EMAIL_MAX_LENGTH, { error: 'auth_email_invalid' satisfies AuthRejectionCode })
  .refine(isCleanSingleLineText, { error: 'auth_email_invalid' satisfies AuthRejectionCode })
  .pipe(z.email({ error: 'auth_email_invalid' satisfies AuthRejectionCode }));

/**
 * A six-character verification or sign-in code.
 *
 * ---------------------------------------------------------------------------
 * ONE SHAPE, TWO FLOWS, ONE COMPONENT
 * ---------------------------------------------------------------------------
 *
 * Declared once and consumed by both code paths — verification (flow 01.2) and
 * emailed-code sign-in (flow 01.13) — because `C-SEGMENTED-CODE-INPUT` is one
 * contract rendered on both surfaces, and the sign-in path's code page is recorded
 * as "byte-identical to the sign-up path's code page"
 * [`01-onboarding-and-auth.md` L384, frame 728]. Per `PROJECT_RULE_R5` the
 * component is implemented exactly once in `packages/ui`, and the validation that
 * mirrors it is declared exactly once here. No gate surface declares its own
 * variant of either.
 *
 * ---------------------------------------------------------------------------
 * THE OBLIGATIONS THAT TRAVEL WITH THIS FIELD, NONE OF WHICH ARE ABOUT PIXELS
 * ---------------------------------------------------------------------------
 *
 * `C-SEGMENTED-CODE-INPUT` "accepts a short secret and submits it without a
 * control being pressed" [`00-product-overview.md` L354, L364] — the filled state
 * carries no primary action anywhere on the page [`01-onboarding-and-auth.md`
 * L74, frame 5] — so the build "must bound how many codes may be tried". Its
 * contract comes from the secret-handling contract rather than from the pixels,
 * and all of it is server-side:
 *
 *   - a per-account and per-address attempt limit, and a per-source rate limit
 *     [L930] — `apps/api/src/plugins/rate-limit.ts`;
 *   - a bound on how many codes may be issued for one address in a window;
 *   - single use of an accepted code, and invalidation of every outstanding code
 *     once one is used or the limit is reached [L778, L930];
 *   - an expiry resolved at issuance and compared against a stored absolute
 *     instant — `apps/api/src/secrets/otp.ts`;
 *   - the code held only as "a keyed digest computed with a server-held key that
 *     is not stored beside the digest and compared in constant time", with the
 *     raw value never persisted [`00-product-overview.md` L544].
 *
 * And two accessibility obligations that bind the field rather than the schema,
 * recorded here because this is where a reader looks for what a code must do: the
 * field advertises one-time-code autofill, and it PERMITS PASTE — which the
 * separator handling below is what makes true.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS SCHEMA IS FOR, AND WHAT IT IS NOT
 * ---------------------------------------------------------------------------
 *
 * It establishes only that a submission COULD be a code: six characters, in the
 * alphabet, after normalisation. Whether it IS the code is decided by the
 * constant-time comparison, and this schema must never be read as having decided
 * anything about correctness. Its value is that it refuses the obviously
 * impossible before an attempt is spent, and that it normalises so the digest is
 * computed over one canonical form.
 *
 * Normalisation order is deliberate: bound the raw input first so an oversized
 * value is refused before any work is done on it, then strip display separators,
 * then upper-case, then require exactly six characters in the alphabet.
 */
export const authCodeSchema = z
  .string({ error: 'auth_code_invalid' satisfies AuthRejectionCode })
  .max(AUTH_CODE_SUBMISSION_MAX_LENGTH, {
    error: 'auth_code_invalid' satisfies AuthRejectionCode,
  })
  .transform((value) => value.replace(AUTH_CODE_SEPARATORS, '').toUpperCase())
  .pipe(
    z
      .string()
      .length(AUTH_CODE_LENGTH, { error: 'auth_code_invalid' satisfies AuthRejectionCode })
      .regex(AUTH_CODE_PATTERN, { error: 'auth_code_invalid' satisfies AuthRejectionCode }),
  );

/**
 * A password, presented inbound and never returned.
 *
 * ---------------------------------------------------------------------------
 * THERE IS NO STRENGTH FIELD IN THIS MODULE, AND THIS IS WHERE ONE WOULD GO
 * ---------------------------------------------------------------------------
 *
 * Read this before adding one, because the temptation is to add it "to help the
 * client" and the specification closes it three times:
 *
 *   - `01-onboarding-and-auth.md` L778 records that the strength rating "is
 *     computed transiently in the client and neither transmitted nor stored".
 *   - `01-onboarding-and-auth.md` L928 states it as an acceptance criterion: the
 *     rating "is computed transiently in the client, is never transmitted and
 *     never stored, and is advisory rather than a policy gate", and "the policy
 *     itself is evaluated server-side on submission".
 *   - `C-STRENGTH-METER`'s own obligation [`00-product-overview.md` L362] adds
 *     the reason: "No strength rating, segment count or derived score is
 *     persisted beside the credential or anywhere else, because a stored rating
 *     narrows the search space for anyone who later reaches the store." And
 *     `S-SECRET` class A repeats that a strength rating is transient and is never
 *     stored beside a password [L544].
 *
 * So: no score, no rating, no meter value, no segment count, no strength enum —
 * not on a request, not on a response, not as a constant, not as a type. "Never
 * transmitted" means the field cannot exist on a REQUEST either, which is
 * stronger than "never stored" and is the part most easily missed. The meter is a
 * client-side rendering owned by the `C-STRENGTH-METER` contract module in
 * `packages/ui`, computed from the value already in the field, and it gates
 * nothing.
 *
 * What replaces it is this schema plus the server-side policy it expresses: a
 * length floor and ceiling, both named constants, evaluated on submission. A value
 * the client's meter rated weak is accepted or rejected by that evaluation rather
 * than by the bar.
 *
 * ---------------------------------------------------------------------------
 * NO VERIFIER, NO HASH, NO SALT, NO PARAMETER — HERE OR ANYWHERE IN THIS FILE
 * ---------------------------------------------------------------------------
 *
 * Per `S-SECRET` class A a password is "stored only as a verifier and never in a
 * form the product can recover — a password as the output of a memory-hard
 * password-hashing function with a per-record salt" [`00-product-overview.md`
 * L544], and per the area's own criterion "no password ... is a persisted field of
 * `E-USER` or of any entity a read path returns" [`01-onboarding-and-auth.md`
 * L927]. This module therefore models the password ONLY as an inbound value, on
 * exactly three requests: password sign-in, reset completion, and a change made by
 * someone who already holds a session.
 *
 * There is no password field on any response shape in this file, and no verifier,
 * hash, salt, memory, iteration or parallelism value anywhere in it. The hashing
 * parameters are compile-time invariants in `../config/constants.ts` and are
 * consumed by `apps/api/src/secrets/password.ts`; the verifier records its own
 * parameters alongside itself so the re-hash-on-next-authentication upgrade path
 * stays open. None of that is this contract's business, and a parameter appearing
 * here would be a second source of truth for a security-critical value.
 *
 * ---------------------------------------------------------------------------
 * THE REUSE CONSTRAINT IS EVALUATED AGAINST VERIFIERS, SO NO HISTORY IS MODELLED
 * ---------------------------------------------------------------------------
 *
 * The reset form "rejects a previously used password with a full-width banner in
 * the error color inserted above the card on submission" [frames 733, 741], and
 * the data model states the constraint "is evaluated against verifiers" [L778].
 * There is therefore NO array of previous passwords, no history field and no
 * previous-password parameter in this module — such a field would be a set of
 * recoverable passwords, which is precisely what class A forbids. The check runs in
 * `apps/api/src/secrets/password.ts` by comparing the submitted value against the
 * stored verifiers, and resolves to `auth_password_reused`.
 *
 * The rejection is page-level rather than field-level because "the reuse check
 * runs on submission rather than as the user types" [L484, frame 741] — a
 * rendering decision recorded here so the client renders the code it is given in
 * the shape the catalogue evidences.
 *
 * ---------------------------------------------------------------------------
 * WHY THE VALUE IS NEITHER TRIMMED NOR NORMALISED
 * ---------------------------------------------------------------------------
 *
 * Every other text value in this module is trimmed and Unicode-normalised. A
 * password is deliberately neither, and the asymmetry is the point: whitespace and
 * composition are CONTENT in a passphrase, and silently altering the bytes would
 * mean the value verified is not the value typed. A person whose passphrase ends
 * in a space, or whose keyboard emits a decomposed form, must be able to sign in
 * with exactly what they typed on the day they set it.
 *
 * The control-character and bidirectional checks are not applied for the same
 * reason, and they cost nothing here: the value is never rendered, never stored in
 * a recoverable form and never interpolated into anything, so the reordering
 * attack those checks exist to stop has no surface to act on.
 */
export const authPasswordSchema = z
  .string({ error: 'auth_password_policy' satisfies AuthRejectionCode })
  .min(AUTH_PASSWORD_MIN_LENGTH, { error: 'auth_password_policy' satisfies AuthRejectionCode })
  .max(AUTH_PASSWORD_MAX_LENGTH, { error: 'auth_password_policy' satisfies AuthRejectionCode });

/**
 * A password presented for verification rather than for adoption.
 *
 * Distinct from `authPasswordSchema` by exactly one property, and the property
 * matters. On sign-in the submitted value is compared against a stored verifier;
 * it is not being adopted, so the CURRENT policy is irrelevant to it. Applying the
 * policy here would lock out every account whose password predates a tightening of
 * it, and — worse — would answer a question no unauthenticated caller should be
 * able to ask: a policy rejection distinguishable from a credential rejection
 * tells a prober the difference between "this is not the password" and "this could
 * not be anyone's password", which narrows a guess set for free.
 *
 * So sign-in bounds the length only, for the same denial-of-service reason
 * `AUTH_PASSWORD_MAX_LENGTH` exists, and every failure on that path resolves to
 * the single ambiguous `auth_credential_rejected`. The upgrade path for an
 * account holding a password that no longer satisfies the policy is a re-hash and
 * a prompt at next successful authentication, in
 * `apps/api/src/secrets/password.ts`, never a refusal to let them in.
 */
export const authPresentedPasswordSchema = z
  .string({ error: 'auth_credential_rejected' satisfies AuthRejectionCode })
  .min(AUTH_NON_BLANK_MIN_LENGTH, {
    error: 'auth_credential_rejected' satisfies AuthRejectionCode,
  })
  .max(AUTH_PASSWORD_MAX_LENGTH, {
    error: 'auth_credential_rejected' satisfies AuthRejectionCode,
  });

/**
 * The opaque token a class-B capability link carries.
 *
 * ---------------------------------------------------------------------------
 * OPAQUE, AND THAT IS A DESIGN DECISION RATHER THAN LAZINESS
 * ---------------------------------------------------------------------------
 *
 * A class-B value is "generated as a high-entropy opaque token split into a
 * non-secret lookup selector and a secret part", and "only a keyed verifier of
 * the secret part is stored" [`00-product-overview.md` L546]. The split is real,
 * and this schema still models the token as ONE opaque string — deliberately.
 *
 * Splitting it here would put the encoding in the client's contract, which has two
 * consequences and both are bad. The client would then be able to present a
 * selector without a secret, or a secret against a selector it guessed, so a
 * server would have to defend against combinations that cannot arise from a link
 * it issued. And the encoding could never be changed without a coordinated client
 * release, on the one value in the product where the ability to rotate quickly
 * matters most. So the token crosses this boundary whole, and
 * `apps/api/src/secrets/session-store.ts` and the invitation service split it
 * server-side.
 *
 * ---------------------------------------------------------------------------
 * REDEMPTION IS AN AUTHORIZATION EVENT, NOT A LOOKUP
 * ---------------------------------------------------------------------------
 *
 * Stated exactly that way by the contract, and the sequence is fixed
 * [`00-product-overview.md` L546]: the non-secret selector resolves the record; a
 * keyed verifier of the secret part is compared IN CONSTANT TIME; the expiry and
 * the revocation state are RE-CHECKED at redemption rather than trusted from
 * issuance; and the capability is then granted per `S-AUTHZ-OP` — "never inherited
 * from whoever issued it".
 *
 * That last clause is the one a build gets wrong, and per `PROJECT_RULE_R1` it is
 * not optional: holding a valid token establishes which capability is being
 * claimed and never that the holder may exercise it. A reset link authorises
 * setting a password on the account the record names, and nothing else — not the
 * issuer's role, not their workspace, not their memberships.
 *
 * Three leak paths are closed explicitly because the value legitimately appears in
 * an address: the landing page conveys no referring address and no opener
 * reference per `S-LINK`; the value is stripped from every server, proxy, analytics
 * and error log rather than merely not logged deliberately; and no surface renders
 * it in full. None of the three is expressible in a schema, so each is recorded
 * here for the consumer that implements it.
 *
 * ---------------------------------------------------------------------------
 * WHY CLASS B RATHER THAN CLASS A, WHICH IS NOT INTERCHANGEABLE
 * ---------------------------------------------------------------------------
 *
 * Class A's never-in-a-URL and single-use rules "do not apply" to class B, for the
 * reason the contract gives plainly: "a link that may not travel in a URL cannot
 * be a link" [L546]. Applying class A here would make the reset link and the
 * invitation link unimplementable. Conversely, applying class B to the
 * six-character code would strip it of single use and of the never-in-a-URL rule
 * that keep it safe. The two classes are held apart throughout this module, and
 * `authCodeSchema` above and this schema are never substituted for one another.
 */
export const capabilityLinkTokenSchema = z
  .string({ error: 'auth_reset_link_invalid' satisfies AuthRejectionCode })
  .trim()
  .min(AUTH_LINK_TOKEN_MIN_LENGTH, {
    error: 'auth_reset_link_invalid' satisfies AuthRejectionCode,
  })
  .max(AUTH_LINK_TOKEN_MAX_LENGTH, {
    error: 'auth_reset_link_invalid' satisfies AuthRejectionCode,
  })
  .regex(AUTH_LINK_TOKEN_PATTERN, {
    error: 'auth_reset_link_invalid' satisfies AuthRejectionCode,
  });

/**
 * The workspace subdomain typed on the workspace-resolution page.
 *
 * A LOOKUP TERM, NEVER AN IDENTIFIER, and the distinction is what keeps this field
 * compatible with `PROJECT_RULE_R1`. Returning sign-in resolves the workspace
 * first: the page renders "one input whose placeholder shows a subdomain against a
 * fixed, non-editable domain suffix" and a Continue
 * [`01-onboarding-and-auth.md` L336, frames 717, 718], and only then serves the
 * workspace's own sign-in page [frame 719].
 *
 * What a caller supplies is therefore a name to look up, not a key to trust, and
 * three things follow. The server appends the fixed suffix — the caller cannot,
 * which is why the pattern admits no dot. The lookup is authorized on its own
 * terms, so submitting the subdomain of a workspace one does not belong to
 * establishes nothing and must not be distinguishable from submitting one that
 * does not exist. And the resolved workspace is what every later step in the
 * journey uses, taken from the route the server put the caller on rather than from
 * a body field they could substitute at the next step.
 *
 * The value is lower-cased because a DNS label is case-insensitive, so two
 * spellings must resolve to one workspace and to one rate-limit bucket.
 */
export const workspaceSelectorSchema = z
  .string({ error: 'auth_workspace_selector_invalid' satisfies AuthRejectionCode })
  .trim()
  .toLowerCase()
  .min(AUTH_WORKSPACE_SUBDOMAIN_MIN_LENGTH, {
    error: 'auth_workspace_selector_invalid' satisfies AuthRejectionCode,
  })
  .max(AUTH_WORKSPACE_SUBDOMAIN_MAX_LENGTH, {
    error: 'auth_workspace_selector_invalid' satisfies AuthRejectionCode,
  })
  .regex(AUTH_WORKSPACE_SUBDOMAIN_PATTERN, {
    error: 'auth_workspace_selector_invalid' satisfies AuthRejectionCode,
  });

/**
 * The display name collected on the invitation join page.
 *
 * The join page "asks for one thing — a name" [`01-onboarding-and-auth.md` L361,
 * frames 721, 722], and the value becomes the display name that later renders on
 * an author line, a member row, a facepile and a mention chip. The bound matches
 * the one `./user.ts` applies, so a name accepted at the gate cannot be rejected
 * by the profile that stores it.
 *
 * This is the free-text value that makes the `S-CONTENT` discipline load-bearing
 * in this module rather than theoretical. The contract names a display name
 * explicitly as the thing a bidirectional override would reorder
 * [`00-product-overview.md` L526], and this name is submitted by an
 * unauthenticated caller and rendered thereafter beside everyone else's — so it is
 * normalised to one canonical form, and control characters and bidirectional
 * embeddings, overrides and isolates are refused. Right-to-left script characters
 * and directional marks are NOT refused; see the hygiene section for why that
 * distinction is deliberate.
 */
export const joinDisplayNameSchema = z
  .string({ error: 'auth_display_name_invalid' satisfies AuthRejectionCode })
  .trim()
  .min(AUTH_NON_BLANK_MIN_LENGTH, {
    error: 'auth_display_name_invalid' satisfies AuthRejectionCode,
  })
  .max(AUTH_DISPLAY_NAME_MAX_LENGTH, {
    error: 'auth_display_name_invalid' satisfies AuthRejectionCode,
  })
  .transform(toCanonicalUnicodeForm)
  .refine((value) => value.length <= AUTH_DISPLAY_NAME_MAX_LENGTH, {
    error: 'auth_display_name_invalid' satisfies AuthRejectionCode,
  })
  .refine((value) => value.length >= AUTH_NON_BLANK_MIN_LENGTH, {
    error: 'auth_display_name_invalid' satisfies AuthRejectionCode,
  })
  .refine(isCleanSingleLineText, {
    error: 'auth_display_name_invalid' satisfies AuthRejectionCode,
  });

/**
 * An identifier naming a piece of authored copy — a consent wording, or a policy
 * version.
 *
 * A NAME, NEVER THE TEXT. See `marketingConsentActSchema` for the argument; the
 * short version is that a client-supplied wording string would be both untrusted
 * input and, since the wording legible in a frame is a third party's, transcribed
 * product copy that `PROJECT_RULE_R4` forbids.
 */
export const copyIdentifierSchema = z
  .string({ error: 'consent_reference_invalid' satisfies AuthRejectionCode })
  .trim()
  .min(AUTH_NON_BLANK_MIN_LENGTH, {
    error: 'consent_reference_invalid' satisfies AuthRejectionCode,
  })
  .max(AUTH_COPY_IDENTIFIER_MAX_LENGTH, {
    error: 'consent_reference_invalid' satisfies AuthRejectionCode,
  })
  .regex(AUTH_COPY_IDENTIFIER_PATTERN, {
    error: 'consent_reference_invalid' satisfies AuthRejectionCode,
  });

/* ===========================================================================
 * Marketing consent — an act, not a rendering
 *
 * `S-MARKETING` [`00-product-overview.md` L582-L586] is the strictest contract
 * this module discharges, and the subtlest, because the field a build reaches for
 * is an innocent-looking boolean. Six requirements bind; five of them shape the
 * schemas below and the sixth shapes where the record lives.
 *
 * ---------------------------------------------------------------------------
 * A PRE-TICKED CONTROL IS NOT CONSENT
 * ---------------------------------------------------------------------------
 *
 * The corpus renders the checkbox with DIFFERENT defaults on two paths — unticked
 * on the get-started page [frames 6, 7] and already ticked on the join page
 * [frames 721, 746, 748]. The catalogue records both and reconciles neither, and
 * is explicit about the limit of what a capture can establish: it "does not show
 * any consent being submitted, stored or acted on, so a pre-ticked box is recorded
 * here as a default rendering, never as consent granted"
 * [`01-onboarding-and-auth.md` L538, L931].
 *
 * The contract's remedy is that the build "either presents it unticked, or
 * presents it ticked as a rendering and still requires a distinct affirmative act
 * before any consent record is written". This module takes the second route,
 * because it lets the client render the observed per-surface default faithfully
 * while making it impossible for that rendering to become a record:
 *
 *   - the act is `z.literal(true)`, so `false` cannot parse and neither can an
 *     absent key. There is no `.default(true)` in this file, and adding one would
 *     breach two things at once: `S-MARKETING`'s pre-ticked-control requirement
 *     directly, and `PROJECT_RULE_R3`, which prohibits substituting a hardcoded
 *     literal for a value the mechanism is supposed to establish;
 *   - the whole consent object is OPTIONAL on the requests that carry it, and its
 *     absence is the ordinary case. Absent means NO RECORD IS WRITTEN — not a
 *     record saying "declined", because declining is not an act either;
 *   - consent NEVER gates a primary action, which the corpus confirms twice:
 *     ticking it changes nothing but the control [frame 7] and clearing it
 *     "changes nothing but the control ... so consent does not gate the action"
 *     [L538, frame 748]. That is why no request below is refused for lacking it.
 *
 * ---------------------------------------------------------------------------
 * PROOF OF CONSENT IS STORED WITH THE CONSENT
 * ---------------------------------------------------------------------------
 *
 * The contract requires "the act, its timestamp, the exact wording that was
 * presented, the surface it was presented on, and the version of the policy it
 * referenced, so that what the person agreed to can be reproduced later rather
 * than asserted". Four of the five are modelled here and the fifth is deliberately
 * not:
 *
 *   - the act — `granted`, a literal `true`;
 *   - the wording — `wordingId`, an IDENTIFIER;
 *   - the policy version — `policyVersion`, likewise an identifier;
 *   - the surface — `surface`, a closed literal union;
 *   - **the timestamp — absent, because it is server-assigned.** A caller that
 *     could send the instant could backdate the act, and a consent record's whole
 *     value is that it can be reproduced. The server stamps it, as an absolute
 *     instant per `PROJECT_RULE_R3`.
 *
 * ---------------------------------------------------------------------------
 * WHY THE WORDING ARRIVES AS A NAME AND NEVER AS TEXT
 * ---------------------------------------------------------------------------
 *
 * Two independent reasons, and either alone would settle it.
 *
 * A client-supplied wording STRING would be untrusted input stored as the
 * authoritative record of what was agreed — so the one field whose purpose is to
 * be evidence would be the one field the person being held to it could have
 * written. Sending a name instead means the server resolves the wording from
 * `../copy/en.ts`, and the record proves what the SERVER presented.
 *
 * And the wording legible in a frame is a third party's product copy, which
 * `PROJECT_RULE_R4` forbids transcribing into source, fixtures or tests. A
 * free-text wording field would invite exactly that transcription. So no consent
 * paragraph text appears in this file, no example of one appears in a doc comment,
 * and the identifiers below carry no sample value.
 *
 * An identifier the dictionary does not know is rejected —
 * `consent_reference_invalid` — so a client cannot fabricate a wording by naming
 * one, and the resolution is what makes accepting the name safe in the first place.
 *
 * ---------------------------------------------------------------------------
 * THE MARKETING POPULATION IS A SEPARATE POPULATION
 * ---------------------------------------------------------------------------
 *
 * "An address collected from a public form is never merged into a workspace
 * member's account record and never becomes a route into the product." The consent
 * record is therefore its OWN TABLE in `packages/db/prisma/schema.prisma` and is
 * not a column on the person — which is also why `./user.ts` carries no consent
 * field and says so in its own header. A suppression record additionally outlives
 * the deletion of the contact, "so that erasing an address cannot silently make it
 * contactable again", which is a second reason the record cannot live on a person:
 * it must survive that person's deletion.
 *
 * ---------------------------------------------------------------------------
 * ONE CONTRACT THAT IS DELIBERATELY NOT CITED HERE
 * ---------------------------------------------------------------------------
 *
 * `S-CONSENT` is NOT cited anywhere in this module, and the omission is
 * deliberate. That contract governs one narrow privacy class — activating a
 * camera, a microphone or a screen capture — and states in its own scope note that
 * "a device-capture rule cited for a marketing tick box ... is a contract used
 * outside its scope, and the requirement the citing surface actually needed goes
 * unstated" [`00-product-overview.md` L578]. Marketing consent is `S-MARKETING`.
 * =========================================================================== */

/**
 * The surfaces on which this build presents a marketing-consent control.
 *
 * A CLOSED union, because the surface is part of the proof: reproducing what
 * someone agreed to requires knowing where they agreed to it, and a free-text
 * surface would be a client-chosen label on a legal record. An unrecognised value
 * is rejected as `consent_surface_unrecognised`.
 *
 * Both members are evidenced, and they are the two paths whose defaults differ:
 *   - `account_confirmation` — the get-started page between verification and
 *     workspace creation, where the control renders UNTICKED [frames 6, 7];
 *   - `invitation_acceptance` — the join page, where it renders PRE-TICKED
 *     [frames 721, 746, 748].
 *
 * A SCOPE BOUNDARY, NOT AN OMISSION. The corpus also carries public lead-capture
 * and subscribe forms with consent paragraphs of their own, and those surfaces
 * belong to a deferred area that this run does not build. When one is built it adds
 * its own member here, additively. Nothing about the consent MECHANISM is deferred
 * — the act, the proof, the withdrawal and the suppression all ship below — so this
 * is a boundary on which surfaces exist, not the kind of omission
 * `PROJECT_RULE_R3` prohibits.
 */
export const MARKETING_CONSENT_SURFACES = [
  'account_confirmation',
  'invitation_acceptance',
] as const;

/** Schema for the surface a consent control was presented on. */
export const marketingConsentSurfaceSchema = z.enum(MARKETING_CONSENT_SURFACES, {
  error: 'consent_surface_unrecognised' satisfies AuthRejectionCode,
});

/** The surface a marketing-consent control was presented on. */
export type MarketingConsentSurface = z.infer<typeof marketingConsentSurfaceSchema>;

/**
 * An affirmative act of marketing consent, with its own proof.
 *
 * Its own object rather than a boolean on the enclosing request, and that is the
 * whole design. A boolean is a rendering: it can be defaulted, it can be spread in
 * from a form's initial state, and it carries none of the proof the contract
 * requires. An object cannot be produced by accident — a caller has to name the
 * wording, the policy version and the surface, and assert the act — and its
 * ABSENCE is unambiguous in a way a `false` is not.
 *
 * Flow 01.3 for the sign-up path [frames 6, 7]; flows 01.12 and 01.19 for the
 * invitation path [frames 721, 746, 748].
 */
export const marketingConsentActSchema = z.strictObject(
  {
    /**
     * The act itself, and the reason this is a literal rather than a boolean.
     *
     * `z.literal(true)` admits exactly one value, so `false` is a parse failure
     * and not a recorded refusal, and an absent key is a parse failure too. A
     * caller that wants to record no consent omits the whole object; a caller
     * that submits this object is asserting that the person acted.
     *
     * `consent_act_required` is what a `false` resolves to, which reads oddly
     * until one remembers that this object exists only to record a grant. A
     * client rendering the observed pre-ticked default MUST NOT send it merely
     * because the box is drawn ticked — that is the pre-ticked-control breach the
     * contract names, and it is the mistake this literal exists to prevent.
     */
    granted: z.literal(true, {
      error: 'consent_act_required' satisfies AuthRejectionCode,
    }),

    /**
     * The identifier of the wording that was presented, resolved server-side
     * against the authored copy dictionary. A name, never the text; see the
     * section above for both reasons.
     */
    wordingId: copyIdentifierSchema,

    /**
     * The version of the policy the wording referenced.
     *
     * Required by the contract in its own right, and separate from the wording
     * because the two change independently: a policy can be revised while the
     * sentence beside the checkbox stays the same, and a record that conflated
     * them could not say which version was agreed to.
     *
     * Purpose limitation follows from this pair. The consent covers the purposes
     * named in that wording and no others, and "a new purpose needs a new act
     * rather than an inference from the old one" — so a build that changes the
     * wording collects consent again rather than re-labelling what it holds.
     */
    policyVersion: copyIdentifierSchema,

    /** Where the control was presented. See `MARKETING_CONSENT_SURFACES`. */
    surface: marketingConsentSurfaceSchema,
  },
  { error: authEnvelopeError },
);

/** An affirmative act of marketing consent, carrying its own proof. */
export type MarketingConsentAct = z.infer<typeof marketingConsentActSchema>;

/**
 * Withdrawal of marketing consent — a first-class operation.
 *
 * The contract requires withdrawal to be "available WITHOUT A SESSION where the
 * messages themselves are, honoured across every channel and every downstream
 * processor, and effective for the whole retention period", and "recorded with the
 * same fidelity as the grant". Two routes therefore exist, and the discriminant is
 * what distinguishes them:
 *
 *   - `capability_link` — the route from the message itself, with no session. The
 *     link is a class-B capability link, so the token is opaque here and its
 *     redemption is an authorization event rather than a lookup: the selector
 *     resolves the record, a keyed verifier of the secret part is compared in
 *     constant time, expiry and revocation are re-checked, and the capability
 *     granted is exactly "withdraw consent for the contact this record names" —
 *     never anything the issuer held. See `capabilityLinkTokenSchema`.
 *   - `session` — the route from inside the product, where the subject is the
 *     acting session and there is consequently nothing to send.
 *
 * NO ADDRESS APPEARS ON EITHER ROUTE, and that is a security property rather than
 * an oversight. A withdrawal endpoint that accepted an address would confirm
 * whether an address was on the list, which is an enumeration oracle on a public
 * endpoint — the one place in the product where an unauthenticated caller could
 * otherwise test addresses in bulk. The token, or the session, identifies the
 * contact instead.
 *
 * The suppression this produces OUTLIVES the deletion of the contact, so that
 * erasing an address cannot silently make it contactable again. That is a property
 * of the record in `packages/db/prisma/schema.prisma`, not of this request, and it
 * is noted here because it is the reason a withdrawal is not modelled as deleting
 * the grant.
 */
export const withdrawMarketingConsentRequestSchema = z.discriminatedUnion('via', [
  z.strictObject(
    {
      /** Withdrawal from the message, with no session. */
      via: z.literal('capability_link'),

      /** The opaque class-B token the unsubscribe link carried. */
      token: capabilityLinkTokenSchema,

      /** The wording presented on the withdrawal surface, as an identifier. */
      wordingId: copyIdentifierSchema,

      /** The policy version that wording referenced. */
      policyVersion: copyIdentifierSchema,
    },
    { error: authEnvelopeError },
  ),
  z.strictObject(
    {
      /** Withdrawal from inside the product; the subject is the acting session. */
      via: z.literal('session'),

      /** The wording presented on the withdrawal surface, as an identifier. */
      wordingId: copyIdentifierSchema,

      /** The policy version that wording referenced. */
      policyVersion: copyIdentifierSchema,
    },
    { error: authEnvelopeError },
  ),
]);

/** A request to withdraw marketing consent, by capability link or by session. */
export type WithdrawMarketingConsentRequest = z.infer<typeof withdrawMarketingConsentRequestSchema>;

/* ===========================================================================
 * Sign-up, verification and account confirmation — flows 01.1, 01.2, 01.3
 * =========================================================================== */

/**
 * Flow 01.1 — sign up with an email address.
 *
 * An address is the WHOLE payload. The product's first surface "asks for one
 * thing" [`01-onboarding-and-auth.md` L48, frames 1, 2, 3], and the address
 * becomes "the account's identifier" for every later surface [L778, frames 1, 6].
 *
 * THE WORK-ADDRESS ADVISORY IS NOT A VALIDATION AND IS NOT MODELLED HERE. A
 * personal-domain address "is accepted but earns an advisory that occupies the
 * primary action's slot" [L48, frame 2], and the catalogue reads that as
 * deliberate: "the advisory is a recommendation and not a block, because it
 * appears instead of the primary action rather than beside a disabled one, and the
 * same page accepts the personal-domain value without any error styling". So no
 * domain classification, no allowlist and no denylist appears in this schema — a
 * refinement here would turn a recommendation into the block the corpus shows it
 * is not. The advisory is a client-side rendering owned by the `C-BANNER` contract
 * module.
 *
 * SUBMITTING THIS REQUEST IS ALSO WHAT ISSUES A REPLACEMENT CODE. The code page
 * carries "two open-mail-client shortcuts and a spam-folder hint" and no resend
 * control in any capture [L74, frames 4, 5, 728], so this module invents no resend
 * endpoint; a person who needs another code re-submits the address. That satisfies
 * the data model's requirement that a code be "invalidated on use and on issuance
 * of a replacement" [L778] without adding a surface the corpus does not show,
 * which is the smallest coherent behaviour `PROJECT_RULE_R3` asks for where
 * evidence stops. The issuance bound and the per-address rate limit both apply to
 * this endpoint for exactly that reason [L930].
 *
 * The response says nothing about whether the address is already registered; see
 * `credentialDeliveryOutcomeSchema`.
 */
export const signUpRequestSchema = z.strictObject(
  {
    /** The address to send a verification code to, and the future identifier. */
    email: authEmailAddressSchema,
  },
  { error: authEnvelopeError },
);

/** A request to begin sign-up with an email address. */
export type SignUpRequest = z.infer<typeof signUpRequestSchema>;

/**
 * Flow 01.2 — verify the email address with a code.
 *
 * "Verification is a code, not a link" [`01-onboarding-and-auth.md` L74, frames 4,
 * 5]. The page states the code's length, names the recipient address, warns that
 * it expires, and offers six boxes with no submit control — the code "submits on
 * completion rather than through a button, because the filled state carries no
 * primary action anywhere on the page" [frame 5].
 *
 * ---------------------------------------------------------------------------
 * WHY THE ADDRESS TRAVELS WITH THE CODE, AND WHY THAT IS NOT AN IDENTIFIER
 * ---------------------------------------------------------------------------
 *
 * There is no session yet — the flow's own preconditions say so — and the code is
 * "a single-use, time-bounded, PER-ADDRESS verifier on its own short-lived record"
 * [L778]. Something has to say which record. The address does, and it is worth
 * being precise about what that is and is not under `PROJECT_RULE_R1`.
 *
 * It is a SELECTOR for a verifier, not an assertion of authority. The rule forbids
 * resting an authorization decision on a caller-supplied workspace or actor
 * identifier; here the decision rests entirely on the CODE, which the caller
 * cannot produce for an address they do not control. Naming someone else's address
 * selects their verifier record and then fails the comparison, which is why the
 * pair must match and why the per-address attempt bound exists [L930]. Nothing in
 * this shape lets a caller claim to BE that address, and nothing about the request
 * tells them whether the address exists.
 *
 * ---------------------------------------------------------------------------
 * NO EXPIRY CROSSES THIS BOUNDARY
 * ---------------------------------------------------------------------------
 *
 * The page states that the code expires and never states by how long [L74, frame
 * 4]. The expiry is resolved once at issuance and stored as an absolute instant,
 * then compared against now in `apps/api/src/secrets/otp.ts`. So there is no
 * expiry field on this request and no remaining-time field on its response: a
 * caller who could send an expiry could extend one, and a caller who could read
 * the remaining time could measure the window. A code past its instant resolves to
 * `auth_code_expired`, distinctly from `auth_code_invalid`, because the remedy
 * differs — request another rather than retype.
 */
export const verifyEmailRequestSchema = z.strictObject(
  {
    /** The address the code was sent to. Selects the verifier; proves nothing. */
    email: authEmailAddressSchema,

    /** The six-character code, normalised. See `authCodeSchema`. */
    code: authCodeSchema,
  },
  { error: authEnvelopeError },
);

/** A request to verify an email address with a six-character code. */
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;

/**
 * Flow 01.3 — confirm the account, and optionally record a consent act.
 *
 * The get-started page sits between verification and workspace creation. Its left
 * column carries a primary create-a-workspace action, "an UNCHECKED
 * marketing-consent checkbox" and a legal paragraph; the only substantive change
 * across the flow's two frames is the checkbox [`01-onboarding-and-auth.md` L99,
 * frames 6, 7].
 *
 * THE CONSENT IS OPTIONAL AND ITS ABSENCE IS THE ORDINARY CASE. Present, it must
 * be a complete affirmative act with its proof; absent, no consent record is
 * written at all — and absent is what a faithful client sends when the person has
 * not ticked the box, which on this surface is the rendered default. Consent gates
 * nothing: the primary action's own fill is unchanged by ticking it [frame 7].
 *
 * The workspace this account goes on to create is NOT named here. The setup wizard
 * is flow 01.4 and its payloads belong to `./workspace.ts`; this request confirms
 * an account and nothing more. Nor does it carry an address: the address was
 * proved by the code in flow 01.2, and the subject of this request is whatever
 * short-lived server-side state that proof established — never a body field a
 * caller could change between the two steps.
 */
export const confirmAccountRequestSchema = z.strictObject(
  {
    /**
     * The marketing-consent act, if the person performed one.
     *
     * Optional, and deliberately NOT a boolean with a default. See
     * `marketingConsentActSchema` and the section above it.
     */
    marketingConsent: marketingConsentActSchema.optional(),
  },
  { error: authEnvelopeError },
);

/** A request to confirm a verified account, optionally recording a consent act. */
export type ConfirmAccountRequest = z.infer<typeof confirmAccountRequestSchema>;

/* ===========================================================================
 * The three sign-in paths — flows 01.11, 01.13, 01.15
 *
 * Three paths, and the catalogue is explicit that they are not one path with
 * options. Returning sign-in resolves the WORKSPACE first, then offers the emailed
 * code as its default route and the password as an inline alternative
 * [`01-onboarding-and-auth.md` L336, frames 717, 719]: "the emailed code is the
 * default route and the password is secondary on this page, because the code
 * explanation is body copy attached to the primary action while the password is
 * offered only as an inline link inside that copy". Flow 01.13 continues the code
 * route and flow 01.15 the password route.
 *
 * Their FAILURES are distinct, and that distinctness is an acceptance criterion
 * rather than a nicety [L924, frames 730, 735] — see the rejection-code section.
 * `apps/web` renders the two differently, so a single generic code would make the
 * criterion unmeetable while appearing to work.
 * =========================================================================== */

/**
 * Flow 01.11 — resolve which workspace, before any credential is asked for.
 *
 * "Signing back in is two pages, because the product must first learn WHICH
 * workspace" [`01-onboarding-and-auth.md` L336]. The first page asks for the
 * workspace address as a subdomain against a fixed suffix and offers three escape
 * hatches plus the already-signed-in list [frames 717, 718]; the second is the
 * workspace's own sign-in page [frame 719].
 *
 * The subdomain is a LOOKUP TERM the server resolves and authorizes — never an
 * identifier a later step trusts. See `workspaceSelectorSchema` for the three
 * consequences that follow, of which the load-bearing one is that the server
 * appends the fixed suffix and the caller cannot.
 *
 * The outcome must NOT distinguish "no such workspace" from "a workspace you may
 * not see". A private workspace's existence is a projection like any other under
 * `PROJECT_RULE_R1`, and a resolution endpoint that answered the difference would
 * be a workspace-enumeration oracle reachable with no session at all.
 */
export const resolveWorkspaceRequestSchema = z.strictObject(
  {
    /** The workspace's chosen subdomain, without the fixed suffix. */
    workspace: workspaceSelectorSchema,
  },
  { error: authEnvelopeError },
);

/** A request to resolve a workspace from its subdomain before signing in. */
export type ResolveWorkspaceRequest = z.infer<typeof resolveWorkspaceRequestSchema>;

/**
 * Flow 01.13 — request an emailed sign-in code.
 *
 * The default returning-sign-in route, "captured end to end including its failure
 * state" [`01-onboarding-and-auth.md` L384, frames 725-730]. The page needs no
 * password and says so in the copy attached to its primary action; submitting the
 * address renders the code page, which is "byte-identical to the sign-up path's
 * code page" [frame 728].
 *
 * MODELLED SEPARATELY FROM VERIFICATION, on purpose. The two requests carry the
 * same field and mean different things: flow 01.2 proves a NEW address, this one
 * authenticates an EXISTING account. They differ in their preconditions, in their
 * issuance bounds, and in what a success does — so one schema serving both would
 * have to be documented as two things, and the next reader would not know which
 * rules applied. The code SHAPE is shared, because that is one component's
 * contract; the requests are not.
 *
 * The outcome is deliberately non-committal about whether the address has an
 * account; see `credentialDeliveryOutcomeSchema`. The per-address issuance bound
 * and the per-source rate limit both apply [L930].
 */
export const requestEmailCodeRequestSchema = z.strictObject(
  {
    /** The address to send a sign-in code to. */
    email: authEmailAddressSchema,
  },
  { error: authEnvelopeError },
);

/** A request for an emailed sign-in code. */
export type RequestEmailCodeRequest = z.infer<typeof requestEmailCodeRequestSchema>;

/**
 * Flow 01.13 — sign in by submitting the emailed code.
 *
 * The invalid-code failure is a FIELD-LEVEL state that clears the input: "the
 * boxes are cleared and a validation line in the error color is inserted between
 * them and the mail shortcuts", with no page navigation, and "no attempt counter or
 * lockout notice is rendered" [`01-onboarding-and-auth.md` L384, frame 730]. The
 * catalogue reads it as field-level "because the message is inserted into the
 * existing page's layout and every other element keeps its position", and states
 * outright that "it is a distinct state from the rejected credential of flow
 * 01.15".
 *
 * So this path resolves to `auth_code_invalid`, `auth_code_expired` or
 * `auth_code_already_used`, and NEVER to `auth_credential_rejected`. The
 * clear-the-input behaviour is the client's, driven by which code it received.
 *
 * No attempt counter appears on this request or its response, matching both the
 * capture and the reason: a remaining-attempts number is a measurement of the very
 * bound an attacker is probing for.
 */
export const signInWithCodeRequestSchema = z.strictObject(
  {
    /** The address the code was sent to. Selects the verifier; proves nothing. */
    email: authEmailAddressSchema,

    /** The six-character code, normalised. See `authCodeSchema`. */
    code: authCodeSchema,
  },
  { error: authEnvelopeError },
);

/** A request to sign in with an emailed six-character code. */
export type SignInWithCodeRequest = z.infer<typeof signInWithCodeRequestSchema>;

/**
 * Flow 01.15 — sign in with a password.
 *
 * The password alternative, "captured with its rejection"
 * [`01-onboarding-and-auth.md` L435, frames 733-736]. Two labelled fields replace
 * the single email input, and a rejected credential "outlines both fields and
 * clears only the password field while keeping the address" [frame 735], leaving
 * the primary action filled and actionable.
 *
 * EVERY FAILURE ON THIS PATH RESOLVES TO ONE AMBIGUOUS CODE. The catalogue reads
 * the ambiguity off the capture — "the error is deliberately ambiguous about which
 * credential was wrong, because one message names both the address and the
 * password and only one field is cleared" — and the security reason is stronger
 * than the fidelity reason: a code distinguishing "no such address" from "wrong
 * password" is an account-enumeration oracle on the busiest endpoint in the
 * product. So a malformed address, an unknown address and a wrong password are all
 * `auth_credential_rejected`, and there is no code in the union meaning "no such
 * account".
 *
 * The submitted password is bounded but NOT policy-checked; see
 * `authPresentedPasswordSchema` for why applying the current policy to a value
 * being verified would both lock out older accounts and leak a distinguishable
 * rejection.
 */
export const signInWithPasswordRequestSchema = z.strictObject(
  {
    /** The address, echoed back on failure — the field keeps its value [frame 735]. */
    email: authEmailAddressSchema,

    /**
     * The presented password, compared against a stored verifier.
     *
     * Inbound only. It appears on no response shape in this module, and the value
     * is never logged, never echoed and never stored — the field is cleared back
     * to its placeholder on rejection [frame 735], which is a client behaviour the
     * ambiguous code drives.
     */
    password: authPresentedPasswordSchema,
  },
  { error: authEnvelopeError },
);

/** A request to sign in with an address and a password. */
export type SignInWithPasswordRequest = z.infer<typeof signInWithPasswordRequestSchema>;

/* ===========================================================================
 * The two recovery paths — flows 01.16, 01.17
 * =========================================================================== */

/**
 * Flow 01.16 — request a password-free sign-in link.
 *
 * The first of two adjacent recovery routes, and the catalogue is careful that they
 * differ in SCOPE and not only in wording: "the password-free link is described as
 * covering the user's WORKSPACES in the plural while the reset form names a SINGLE
 * workspace domain" [`01-onboarding-and-auth.md` L460, frames 737, 738].
 *
 * This request is therefore account-scoped and carries no workspace at all — the
 * link it produces reaches every workspace the address belongs to, so naming one
 * would narrow it wrongly. The payload is an address.
 *
 * The link is a class-B capability link, redeemed through
 * `capabilityLinkTokenSchema`; per that contract its expiry is resolved at issuance
 * and enforced server-side, and redemption re-authorizes rather than inheriting
 * anything.
 */
export const requestSignInLinkRequestSchema = z.strictObject(
  {
    /** The address to send a password-free sign-in link to. */
    email: authEmailAddressSchema,
  },
  { error: authEnvelopeError },
);

/** A request for a password-free sign-in link covering the account's workspaces. */
export type RequestSignInLinkRequest = z.infer<typeof requestSignInLinkRequestSchema>;

/**
 * Flow 01.16 — request a password-reset link.
 *
 * The second recovery route, reached from the first page's secondary action. Its
 * form "names the workspace's own sign-in domain and asks for the address used to
 * sign in to it" [`01-onboarding-and-auth.md` L460, frame 738], so it is
 * workspace-scoped where the sign-in link is account-scoped.
 *
 * THE WORKSPACE IS STILL NOT A FIELD. It comes from the route the caller is
 * already on — they reached this form from that workspace's own password page
 * [frame 733] — and per `PROJECT_RULE_R1` it is resolved and authorized
 * server-side rather than read from the body. A workspace field here would let a
 * caller request a reset scoped to a workspace they had never resolved.
 *
 * Modelled separately from `requestSignInLinkRequestSchema` despite the identical
 * shape, because the two differ in scope, in the capability the resulting link
 * grants, and in the surface they are reached from. Collapsing them would make one
 * endpoint that issues two different capabilities depending on how it was called,
 * which is the shape of an authorization bug.
 */
export const requestPasswordResetRequestSchema = z.strictObject(
  {
    /** The address used to sign in to this workspace. */
    email: authEmailAddressSchema,
  },
  { error: authEnvelopeError },
);

/** A request for a password-reset link scoped to one workspace. */
export type RequestPasswordResetRequest = z.infer<typeof requestPasswordResetRequestSchema>;

/**
 * The single non-committal outcome both recovery requests and both code requests
 * return.
 *
 * ---------------------------------------------------------------------------
 * ONE SHAPE, AND IT DISCLOSES NOTHING
 * ---------------------------------------------------------------------------
 *
 * Four endpoints in this module take an address and send something to it:
 * `signUpRequestSchema`, `requestEmailCodeRequestSchema`,
 * `requestSignInLinkRequestSchema` and `requestPasswordResetRequestSchema`. Every
 * one of them must respond IDENTICALLY whether or not the address has an account,
 * because any difference — a distinct code, a distinct shape, a distinct field, a
 * measurably different latency — is an account-enumeration disclosure on an
 * endpoint an unauthenticated caller can call at will.
 *
 * So there is exactly one outcome shape, it carries no `exists`, no `sent`, no
 * `accountFound` and no `deliveredTo`, and it is deliberately almost empty. The
 * catalogue's own confirmation page behaves the same way: it renders "a
 * reset-link-sent heading, two lines pointing at the named inbox" and a
 * wrong-address correction link [`01-onboarding-and-auth.md` L460, frame 739] — it
 * reports that the product acted, never that an account was found.
 *
 * WHY IT IS NOT SIMPLY EMPTY. The one field it does carry is the address the
 * request named, echoed back, and it is here because the confirmation surface
 * needs it: the page "points at the named inbox" and the verification page "names
 * the address it was sent to" [frames 4, 739]. Echoing the request's OWN input
 * discloses nothing the caller did not already supply. It is the NORMALISED form,
 * which is the second reason to return it — the person sees the address the
 * product will actually use, so a stray capital or a trailing space cannot leave
 * them watching the wrong mailbox.
 *
 * Under `S-PII` that echo is the only place an address appears on a response in
 * this module, and it appears in a body — never in a URL, a log, a cache key or a
 * telemetry payload.
 */
export const credentialDeliveryOutcomeSchema = z.strictObject({
  /**
   * The normalised address the request named, echoed for the confirmation surface.
   *
   * Not evidence that an account exists, and not evidence that anything was sent.
   */
  email: authEmailAddressSchema,
});

/** The non-committal outcome of any request that sends something to an address. */
export type CredentialDeliveryOutcome = z.infer<typeof credentialDeliveryOutcomeSchema>;

/**
 * Flow 01.17 — set a new password from a reset link.
 *
 * The reset form carries "a new-password field, a confirm-new-password field and a
 * primary change-my-password action" [`01-onboarding-and-auth.md` L484, frames
 * 740-743].
 *
 * ---------------------------------------------------------------------------
 * THE TOKEN IS OPAQUE, AND REDEMPTION IS AN AUTHORIZATION EVENT
 * ---------------------------------------------------------------------------
 *
 * The link is a class-B capability link, so the token crosses this boundary as one
 * opaque string with no structure this contract may inspect — see
 * `capabilityLinkTokenSchema` for why splitting the selector from the secret here
 * would be a mistake, and for the sequence redemption follows. The clause that
 * matters most is the last one: the capability is granted per `S-AUTHZ-OP` and is
 * "never inherited from whoever issued it" [`00-product-overview.md` L546]. Holding
 * a valid token establishes WHICH capability is claimed and never that the holder
 * may exercise it, and what it authorises is setting a password on the account the
 * record names — nothing else.
 *
 * Three failure codes, because three different things go wrong and each has its own
 * remedy: `auth_reset_link_invalid` for a token that resolves to nothing,
 * `auth_reset_link_expired` for one past the instant fixed at issuance, and
 * `auth_reset_link_revoked` for one whose capability was withdrawn. Expiry and
 * revocation are RE-CHECKED at redemption rather than trusted from issuance.
 *
 * ---------------------------------------------------------------------------
 * TWO REFUSALS THE CORPUS SHOWS ONE OF, AND WHY BOTH SHIP
 * ---------------------------------------------------------------------------
 *
 * The reuse refusal is captured: a previously used password draws "a full-width
 * banner in the error color" inserted above the card on submission [frame 741], and
 * the catalogue notes "the reuse check runs on submission rather than as the user
 * types". It resolves to `auth_password_reused`, evaluated against stored verifiers
 * in `apps/api/src/secrets/password.ts` — never against a modelled history; see
 * `authPasswordSchema`.
 *
 * The mismatch refusal is NOT captured: "the confirm-new-password field is never
 * captured in a mismatched state, so no mismatch validation is shown" [L484]. Per
 * `PROJECT_RULE_R3` that partial capture is an open work item rather than
 * permission to accept a mismatch, so the check ships as
 * `auth_password_confirmation_mismatch` and the choice is recorded in
 * `docs/decisions/gap-register.md`.
 *
 * The confirmation field is compared AFTER both values have satisfied the policy,
 * which is the order the refinement produces: a caller who mistyped both fields
 * identically learns that the value is unacceptable rather than that the two match.
 */
export const completePasswordResetRequestSchema = z
  .strictObject(
    {
      /** The opaque class-B token the reset link carried. */
      token: capabilityLinkTokenSchema,

      /**
       * The new password, evaluated against the server-side policy.
       *
       * Inbound only, and adopted rather than merely verified — which is why this
       * field uses `authPasswordSchema` and the sign-in field does not.
       */
      password: authPasswordSchema,

      /**
       * The confirmation of the new password.
       *
       * Bounded by the same policy so a mismatch is not reported for a value that
       * could never have been accepted anyway.
       */
      passwordConfirmation: authPasswordSchema,
    },
    { error: authEnvelopeError },
  )
  .refine((candidate) => candidate.password === candidate.passwordConfirmation, {
    error: 'auth_password_confirmation_mismatch' satisfies AuthRejectionCode,
  });

/** A request to set a new password from a reset link. */
export type CompletePasswordResetRequest = z.infer<typeof completePasswordResetRequestSchema>;

/**
 * Change one's own password while holding a session.
 *
 * Modelled because `S-SECRET` class A requires it: a session is "invalidated on
 * CREDENTIAL CHANGE" [`00-product-overview.md` L544], which presupposes an
 * operation that changes a credential without a reset link. The corpus captures the
 * reset path and not this one, so per `PROJECT_RULE_R3` the mechanism ships as the
 * smallest shape consistent with the evidenced one and the choice is recorded in
 * `docs/decisions/gap-register.md`.
 *
 * THE CURRENT PASSWORD IS REQUIRED, and the reason is the invalidation rule itself.
 * A change that needed only a session would let whoever reached a live session lock
 * the owner out of every other one, turning a session compromise into an account
 * takeover. Re-presenting the current credential is what keeps the change an act of
 * the account holder.
 *
 * NO SUBJECT FIELD. The subject is the acting session, per `PROJECT_RULE_R1`.
 * There is no address, no person identifier and no workspace here, and an
 * administrator changing someone else's password is a different operation
 * authorized against the role matrix through `apps/api/src/authz/guard.ts` — never
 * this request with a target bolted on.
 *
 * The current password is verified rather than adopted, so it is bounded only; the
 * new one is adopted, so it is policy-checked. A new password identical to the
 * current one resolves to `auth_password_reused`, by the same
 * comparison-against-verifiers the reset path uses.
 */
export const changePasswordRequestSchema = z
  .strictObject(
    {
      /** The current password, re-presented. Verified, not adopted. */
      currentPassword: authPresentedPasswordSchema,

      /** The new password, evaluated against the server-side policy. */
      newPassword: authPasswordSchema,

      /** The confirmation of the new password. */
      newPasswordConfirmation: authPasswordSchema,
    },
    { error: authEnvelopeError },
  )
  .refine((candidate) => candidate.newPassword === candidate.newPasswordConfirmation, {
    error: 'auth_password_confirmation_mismatch' satisfies AuthRejectionCode,
  });

/** A request to change one's own password while holding a session. */
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

/* ===========================================================================
 * Device enrolment — flow 01.10
 * =========================================================================== */

/**
 * The states a device enrolment can be in.
 *
 * ONE OF THESE IS EVIDENCED AND THREE ARE AUTHORED, which is stated plainly because
 * the corpus cannot show any of the others: "nothing after the code is scanned is
 * captured — no confirmation state on the browser, and no mobile-client surface in
 * this area", and the coverage ledger records none anywhere in the corpus either
 * [`01-onboarding-and-auth.md` L314, frame 714]. Per `PROJECT_RULE_R3` that
 * partial capture is an open work item, so every state the mechanism needs ships
 * and the renderings are registered in `docs/decisions/gap-register.md`.
 *
 * Each of the three authored states is required by `S-SECRET` class A rather than
 * invented: the artefact is "issued per attempt, bound to a short expiry, consumed
 * on first use, invalidated when a replacement is issued or the enrolling session
 * ends" [`01-onboarding-and-auth.md` L778]. `completed` is consumption,
 * `expired` is the expiry, and `superseded` is both invalidation clauses — a
 * replacement being issued and the enrolling session ending are the same outcome
 * from this artefact's point of view, so they are one state rather than two that
 * a client would have to render identically.
 */
export const DEVICE_ENROLMENT_STATES = [
  /** Issued and not yet consumed. The state the modal is captured in [frame 714]. */
  'pending',
  /** Consumed on first use. A class-A issued artefact is single-use. */
  'completed',
  /** Past the absolute instant fixed at issuance. */
  'expired',
  /** Invalidated by a replacement being issued, or by the enrolling session ending. */
  'superseded',
] as const;

/** Schema for the state of a device enrolment. */
export const deviceEnrolmentStateSchema = z.enum(DEVICE_ENROLMENT_STATES);

/** The state of a device enrolment. */
export type DeviceEnrolmentState = z.infer<typeof deviceEnrolmentStateSchema>;

/**
 * Flow 01.10 — begin enrolling another device.
 *
 * "A single-frame flow that hands an authenticated desktop session to a phone"
 * [`01-onboarding-and-auth.md` L314, frame 714]. The modal renders the workspace
 * name, a signing-in-as line naming the address, a four-step instruction list and a
 * scannable square.
 *
 * THE PAYLOAD IS EMPTY, and every part of that is deliberate. The flow's own
 * precondition is "an authenticated session, because the modal states which address
 * it is signing in as", so the address and the workspace are both derived from that
 * session; per `PROJECT_RULE_R1` neither may be a body field a caller could
 * substitute, or one session could enrol a device against another account. There is
 * nothing left to send.
 *
 * The object is STRICT rather than merely empty, which is what makes the emptiness
 * enforceable: an `email`, `workspace` or `accountId` key appended by a client is
 * rejected outright instead of ignored.
 */
export const beginDeviceEnrolmentRequestSchema = z.strictObject({}, { error: authEnvelopeError });

/** A request to begin enrolling another device. Carries nothing; see the note. */
export type BeginDeviceEnrolmentRequest = z.infer<typeof beginDeviceEnrolmentRequestSchema>;

/**
 * The state of a device enrolment, as a read path may report it.
 *
 * ---------------------------------------------------------------------------
 * THE CODE VALUE IS NOT HERE, AND NO SHAPE IN THIS MODULE CARRIES IT
 * ---------------------------------------------------------------------------
 *
 * The device-enrolment code is an `S-SECRET` class-A artefact, so it is "never
 * returned by a read path once issued" [`01-onboarding-and-auth.md` L778], it is
 * stored only as a keyed digest with the raw value never persisted, and no artefact
 * of its class is "ever placed in a URL or ever displayed in full or transcribed"
 * [`00-product-overview.md` L544].
 *
 * This projection therefore models the enrolment's IDENTITY and STATE and nothing
 * else. The scannable square the modal renders is produced by the enrolment surface
 * at the moment of issuance, from material that does not cross this contract, and a
 * later read of the same enrolment returns what is below — a state, not an artefact.
 * A `code`, `token`, `secret` or `qr` field added here would breach class A
 * directly, which is why the shape is strict and this note is long.
 *
 * ---------------------------------------------------------------------------
 * IT IS A PROJECTION, SO IT IS AUTHORIZED INDEPENDENTLY
 * ---------------------------------------------------------------------------
 *
 * Per `PROJECT_RULE_R1` a read path carries its own check: reporting this state
 * requires that the acting session be the enrolling session, and being entitled to
 * the modal that started an enrolment entails nothing about being entitled to read
 * another one. No expiry instant is projected either — a remaining-time field
 * would let a holder measure the window the expiry exists to keep unmeasurable.
 */
export const deviceEnrolmentStatusSchema = z.strictObject({
  /**
   * The address being signed in, which the modal renders on its signing-in-as line
   * [frame 714].
   *
   * Server-derived from the enrolling session rather than echoed from a request —
   * this projection has no request to echo. Personal data under `S-PII`, so it
   * travels in a body and never in a URL, a log or a cache key.
   */
  email: authEmailAddressSchema,

  /** The enrolment's state. See `DEVICE_ENROLMENT_STATES`. */
  state: deviceEnrolmentStateSchema,
});

/** The state of a device enrolment. Never carries the enrolment code. */
export type DeviceEnrolmentStatus = z.infer<typeof deviceEnrolmentStatusSchema>;

/* ===========================================================================
 * Invitation acceptance — flows 01.12, 01.19
 *
 * WHICH MODULE OWNS WHICH HALF, stated here so the two cannot drift.
 *
 * ISSUING an invitation is `./invitation.ts`: the recipient address, the invited-as
 * role, the channel scope that is optional for a member and required for a guest,
 * the multi-channel-guest allowance, the guest expiration, the custom message, and
 * the shareable link with its own settings [`01-onboarding-and-auth.md` L780,
 * frames 40-56]. A change to what an INVITER may set belongs there.
 *
 * REDEEMING one is here, and it is the only half this module models. A change to
 * what an INVITEE submits belongs in this file. The split follows the surfaces: the
 * issuing modal is an authenticated in-product surface, the join page is an
 * unauthenticated gate surface, and this module is the contract for gate surfaces.
 * =========================================================================== */

/**
 * Flows 01.12 and 01.19 — join a workspace from an invitation.
 *
 * ---------------------------------------------------------------------------
 * THE INVITATION BINDS THE ADDRESS, SO NO ADDRESS IS ACCEPTED
 * ---------------------------------------------------------------------------
 *
 * This is the single most important property of the shape, and the catalogue derives
 * it from the page rather than asserting it: "the invitation binds the address, not
 * the person, because the page states the recipient address as fact and offers no
 * way to edit it while asking only for a name"
 * [`01-onboarding-and-auth.md` L361, frames 721, 746]. Flow 01.19 "repeats the
 * journey for a different workspace and invitee and shows the same binding".
 *
 * So there is no `email` field here. The address AND the workspace both come from
 * the redeemed record, which per `PROJECT_RULE_R1` is exactly right: an address
 * field would let whoever held an invitation link join under an address of their
 * choosing, and a workspace field would let them redirect a redemption at a
 * workspace the invitation was never issued for. Neither is a body field a caller
 * can substitute.
 *
 * NO ROLE FIELD EITHER, for the same reason and with more at stake. The invited-as
 * role is set by the inviter and stored on the invitation [L780, frame 49]; a role
 * asserted by the joiner would be a privilege escalation with a form field. Per
 * `PROJECT_RULE_R1` a role is never something a caller asserts about itself in an
 * authentication payload, and enrolment is authorized server-side against the
 * stored record and the joiner's CONFIRMED address [L929].
 *
 * ---------------------------------------------------------------------------
 * WHAT IS ACTUALLY SUBMITTED
 * ---------------------------------------------------------------------------
 *
 * A name, an opaque token, and optionally a consent act — which is precisely what
 * the page asks for. Flow 01.19 confirms the consent is not a gate: clearing it "is
 * the only region of the page that differs from the previous capture ... so consent
 * does not gate the action" [L538, frame 748]. The pre-ticked rendering on this
 * path [frames 721, 746] is a rendering and never a record; see
 * `marketingConsentActSchema`.
 *
 * The invitation link is a class-B capability link, so the token is opaque here and
 * its redemption re-authorizes the capability rather than inheriting the inviter's
 * authority — see `capabilityLinkTokenSchema`. A token resolving to no live,
 * unredeemed record is `auth_invitation_invalid`, which is distinct from the reset
 * link's codes because the two links grant different capabilities and a client
 * lands on different surfaces for them.
 */
export const acceptInvitationRequestSchema = z.strictObject(
  {
    /** The opaque class-B token the invitation link carried. */
    token: capabilityLinkTokenSchema,

    /**
     * The name the join page asks for [frames 721, 722, 747].
     *
     * Normalised and screened per `S-CONTENT`; see `joinDisplayNameSchema`. This is
     * the one free-text value an unauthenticated caller contributes to a workspace
     * everyone else will read, which is why the screening is not optional.
     */
    displayName: joinDisplayNameSchema,

    /**
     * The marketing-consent act, if the person performed one.
     *
     * Optional, never defaulted. The control renders PRE-TICKED on this path, and
     * that rendering must not become a record — the whole point of
     * `marketingConsentActSchema`.
     */
    marketingConsent: marketingConsentActSchema.optional(),
  },
  { error: authEnvelopeError },
);

/** A request to join a workspace by redeeming an invitation. */
export type AcceptInvitationRequest = z.infer<typeof acceptInvitationRequestSchema>;

/* ===========================================================================
 * Ending a session — individually and collectively
 *
 * `S-SECRET` class A states the whole contract in one sentence: "A session is a
 * revocable server-side record of this class, with an idle and an absolute
 * lifetime, individually and collectively invalidable, and invalidated on credential
 * change; a sign-out-everywhere affordance INVALIDATES THE SERVER-SIDE RECORDS
 * RATHER THAN ONLY CLEARING THE CLIENT" [`00-product-overview.md` L544]. The area's
 * own model repeats that the session is "individually and wholesale revocable"
 * [`01-onboarding-and-auth.md` L778].
 *
 * The emphasised clause is why these are two operations rather than one with a flag,
 * and why both payloads are empty: the difference between them is entirely a
 * server-side effect on stored records, and there is nothing a client could usefully
 * say about it. A client that "signed out everywhere" by clearing its own storage
 * would have satisfied a flag and none of the contract.
 *
 * NEITHER IDLE NOR ABSOLUTE LIFETIME IS RESTATED HERE. Both are
 * environment-overridable defaults in `../config/env.ts`, stored on the record as
 * absolute instants and enforced by `apps/api/src/secrets/session-store.ts`. No
 * duration crosses this contract, and no request may set one.
 * =========================================================================== */

/**
 * End the current session.
 *
 * The payload is empty because the session is the cookie: an HTTP-only,
 * same-site-lax, secure cookie the server set, whose record
 * `apps/api/src/secrets/session-store.ts` owns. There is no session identifier for
 * a caller to send — see `authenticatedSessionSchema` for why no such value is ever
 * returned to a client in the first place.
 *
 * STRICT rather than merely empty, so a `sessionId`, `token` or `all` key appended
 * by a client is rejected rather than ignored. An ignored `all: true` would look
 * exactly like a sign-out-everywhere that silently did not happen, which is the
 * worst available outcome for this operation.
 */
export const signOutRequestSchema = z.strictObject({}, { error: authEnvelopeError });

/** A request to end the current session. Carries nothing; the session is the cookie. */
export type SignOutRequest = z.infer<typeof signOutRequestSchema>;

/**
 * End every session for this account.
 *
 * A SEPARATE OPERATION rather than a flag on the one above, deliberately. The
 * distinction is the security-relevant one in the contract — collective
 * invalidation is what someone reaches for after a compromise — and a distinct
 * endpoint means it is authorized on its own terms, audited on its own terms, and
 * impossible to invoke by accident with a mis-serialised boolean.
 *
 * What it must actually do is the part builds get wrong: invalidate the server-side
 * RECORDS, not merely clear the client. Every session for the account is revoked,
 * including the one making the request and including sessions in other workspaces,
 * because the account is the subject and the already-signed-in list is per-workspace
 * [frames 717, 719].
 *
 * Empty and strict, for the same reasons as the sibling above. The subject is the
 * acting session's account, per `PROJECT_RULE_R1`; an account field here would let
 * one session sign out another account.
 */
export const signOutEverywhereRequestSchema = z.strictObject({}, { error: authEnvelopeError });

/** A request to invalidate every server-side session record for this account. */
export type SignOutEverywhereRequest = z.infer<typeof signOutEverywhereRequestSchema>;

/* ===========================================================================
 * The two gate-surface projections
 *
 * Both are read paths, and per `PROJECT_RULE_R1` each is authorized independently
 * on every path that produces it. Neither carries a credential of any kind — see
 * the note on `authenticatedSessionSchema`, which is the one a reader is most likely
 * to want to add a token to.
 * =========================================================================== */

/**
 * Maximum length of the storage reference for a workspace icon.
 *
 * Load-bearing rather than cosmetic: together with the character class below it
 * makes it structurally impossible for image bytes or a data URL to be stored where
 * a reference belongs.
 */
export const WORKSPACE_ICON_OBJECT_KEY_MAX_LENGTH = 512;

/**
 * Characters permitted in the storage reference for a workspace icon.
 *
 * The class excludes the colon, the semicolon and the comma, so a data URL cannot be
 * expressed at all, and requires an alphanumeric first character so the reference
 * can never be read as a relative path.
 *
 * Declared here rather than shared with a person's avatar reference because the two
 * are different fields on different entities — a workspace icon [frames 15, 744] and
 * a profile photo [frames 11, 21, 22] — and folding them together would give one
 * schema two subjects. The discipline is identical because the `S-PII` and
 * `S-CONTENT` reasoning behind it is, and that agreement is deliberate.
 */
const WORKSPACE_ICON_OBJECT_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/_.-]*$/;

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
  WORKSPACE_ICON_OBJECT_KEY_PATTERN.test(value) && !value.includes(PARENT_DIRECTORY_SEQUENCE);

/**
 * The workspace fields both gate-surface projections render.
 *
 * A shape rather than a schema, so the two projections below compose the same three
 * fields without one being defined as a variation of the other. Declared once
 * because the already-signed-in list and the post-sign-in context render the same
 * workspace identity, and two declarations would let them disagree about what a
 * workspace is called.
 *
 * NO OPAQUE WORKSPACE IDENTIFIER APPEARS IN IT, and that is the design. A chooser
 * row has to be actionable, and it is made actionable by the SELECTOR: the row's
 * open action navigates to that workspace's own sign-in domain [frames 717, 719,
 * 731], the server resolves the route, and it re-authorizes the acting session's
 * membership of the workspace the ROUTE names. Per `PROJECT_RULE_R1` no
 * authorization decision rests on a value the client sent, so a row is a
 * destination rather than a key, and appearing in this list confers nothing.
 */
const workspaceContextShape = {
  /**
   * The workspace's name, interpolated into headings, sidebar headers and modal
   * titles [`01-onboarding-and-auth.md` L779, frames 8, 9, 40].
   *
   * Screened for control characters and bidirectional formatting per `S-CONTENT`,
   * because it is interpolated beside other text on every gate surface that names
   * it. NO MAXIMUM IS RESTATED HERE: the workspace-name contract belongs to
   * `./workspace.ts`, which owns the wizard step that collects it and its character
   * counter [frame 8], and declaring a second bound in this module would be the
   * second source of truth `PROJECT_RULE_R3` prohibits. The value is server-produced
   * and was already bounded when it was accepted.
   */
  name: z
    .string()
    .trim()
    .min(AUTH_NON_BLANK_MIN_LENGTH)
    .transform(toCanonicalUnicodeForm)
    .refine(isCleanSingleLineText),

  /**
   * The workspace's chosen subdomain, which is what makes the row's open action a
   * destination [frames 717, 719, 731].
   *
   * The same schema the resolution page validates, so a selector cannot be rendered
   * in a form the resolution endpoint would refuse.
   */
  selector: workspaceSelectorSchema,

  /**
   * The stored-object reference for the workspace icon, or `null` where none is set
   * — the rail and every chooser row render "a square workspace icon" [frames 15,
   * 744], and a workspace without one renders an initial-derived tile instead.
   */
  iconObjectKey: z
    .string()
    .trim()
    .max(WORKSPACE_ICON_OBJECT_KEY_MAX_LENGTH)
    .refine(isStorageObjectReference)
    .nullable(),
} as const;

/**
 * A row in the already-signed-in or welcome-back workspace list.
 *
 * ---------------------------------------------------------------------------
 * IT PROJECTS THE WORKSPACE IDENTITY, NEVER THE CREDENTIAL
 * ---------------------------------------------------------------------------
 *
 * The catalogue states this in exactly those terms. The already-signed-in list
 * "renders one row per workspace with its own open action", and per `S-SECRET` the
 * session's bearer material "is stored only as a verifier ... and is never returned
 * by a read path; THE LIST PROJECTS ONLY THE WORKSPACE IDENTITY, NEVER THE
 * CREDENTIAL" [`01-onboarding-and-auth.md` L778, frames 717, 719].
 *
 * So no session field of any kind appears below — no identifier, no bearer, no
 * expiry, no last-used instant. The list's existence is evidence that sessions
 * exist; it is not a way to enumerate or to reuse them.
 *
 * ---------------------------------------------------------------------------
 * IT IS A PROJECTION, AND THE COUNT IS A SECOND ONE
 * ---------------------------------------------------------------------------
 *
 * Per `PROJECT_RULE_R1` a projection is authorized independently on every read path
 * that produces it, and this one is produced by two surfaces over one list — the
 * in-product chooser and the marketing welcome-back page, which "name the same
 * address, list the same two workspaces and print the same two member counts"
 * [L513, frames 731, 744]. Each carries its own check, and the check is that the
 * acting account is a member of the workspace being listed. A workspace absent from
 * that set is absent from this list.
 *
 * `memberCount` is a projection in its own right and is called out because a count
 * is the projection a build most often forgets to authorize: it is a number rather
 * than a record, so it looks harmless, and a count over a set the reader may not see
 * discloses the size of that set. It is authorized like the row it sits on.
 *
 * Flows 01.11 and 01.14 [frames 717, 719, 731]; the same list appears on the
 * marketing surface of flow 01.18 [frame 744], which is a deferred area's chrome
 * around this same projection.
 */
export const workspaceChoiceSchema = z.strictObject({
  ...workspaceContextShape,

  /**
   * The workspace's member count, rendered beside a facepile on every chooser row.
   *
   * A non-negative integer, and ZERO IS A REAL VALUE rather than an absence: the
   * catalogue reads the count as "a real per-workspace value rather than a
   * decorative facepile, because the two rows carry different counts and one of them
   * reads zero — a value no facepile could render" [L413, frame 731], and the
   * acceptance criterion requires that "a count of zero renders as zero" [L922]. So
   * this field is never optional and never nullable; a nullable count would let a
   * client render an empty space where the catalogue requires a nought.
   */
  memberCount: z.int().nonnegative(),
});

/** A row in the workspace chooser. Projects workspace identity, never a credential. */
export type WorkspaceChoice = z.infer<typeof workspaceChoiceSchema>;

/** The workspace list the already-signed-in and welcome-back surfaces render. */
export const workspaceChoiceListSchema = z.array(workspaceChoiceSchema);

/** The workspace list a chooser surface renders. */
export type WorkspaceChoiceList = z.infer<typeof workspaceChoiceListSchema>;

/**
 * What a successful sign-in returns.
 *
 * ---------------------------------------------------------------------------
 * NO TOKEN, NO BEARER, NO SESSION IDENTIFIER — READ THIS BEFORE ADDING ONE
 * ---------------------------------------------------------------------------
 *
 * This is the shape a build reaches for when it wants somewhere to put a token, and
 * every part of the specification closes it:
 *
 *   - `S-SECRET` class A: a session is "a revocable server-side record", its bearer
 *     material is stored only as a verifier, and no artefact of the class "is ever
 *     returned by a read path" [`00-product-overview.md` L544].
 *   - The area's criterion: "No password, one-time code, session bearer or
 *     device-enrolment code is a persisted field of `E-USER` or of any entity a read
 *     path returns", and "none of the four is ever echoed back by any surface"
 *     [`01-onboarding-and-auth.md` L927].
 *   - The build's own excluded-tooling list is explicit that there is NO TOKEN IN
 *     LOCAL STORAGE, which is only true if nothing ever hands the client one.
 *
 * The session is an HTTP-only, same-site-lax, secure cookie the SERVER sets on this
 * response, and `apps/api/src/secrets/session-store.ts` owns the record behind it.
 * HTTP-only is the operative word: the client cannot read the cookie, so it has
 * nothing to store, nothing to attach to a request by hand and nothing to leak
 * through a script. Every mutation additionally carries cross-site-request-forgery
 * protection, which is the defence a cookie-authenticated API needs in exchange.
 *
 * So this shape carries no `token`, no `sessionId`, no `expiresAt` and no
 * `refreshToken`. It carries WHO and WHERE, which is all a client needs to render
 * the shell.
 *
 * ---------------------------------------------------------------------------
 * THE PERSON IS THE SHARED PROJECTION, NOT A LOCAL COPY OF ONE
 * ---------------------------------------------------------------------------
 *
 * `personSummarySchema` from `./user.ts` is reused rather than restated. Per
 * `PROJECT_RULE_R5` a shared contract is implemented exactly once, and that
 * projection is the one shape every surface naming a person renders from — an author
 * line, a member row, a facepile entry, a mention chip. A sign-in-specific person
 * shape would be a second definition of the same thing, and the two would drift the
 * first time either changed.
 *
 * It also inherits that projection's own most important property: it carries NO
 * EMAIL ADDRESS. That is deliberate there and correct here — the shell renders a
 * name and an avatar, not an address — and it keeps this response free of personal
 * data it has no purpose for, which is `S-PII` minimisation.
 *
 * ---------------------------------------------------------------------------
 * WHY THE WORKSPACE CONTEXT IS PRESENT, AND WHY IT IS NOT A GRANT
 * ---------------------------------------------------------------------------
 *
 * Sign-in is workspace-scoped: the page interpolates the workspace name into its
 * heading and prints its sign-in domain beneath [frames 719, 733], and the shell the
 * client is about to render needs both. The context is server-composed from the
 * workspace the ROUTE resolved and the membership the server verified — it reports
 * what was authorized and authorizes nothing itself. A client that edited it would
 * change a label and no permission, because per `PROJECT_RULE_R1` every subsequent
 * request is authorized against the acting session and its own target rather than
 * against anything this response said.
 *
 * Where the address belongs to more than one workspace the product asks which
 * [flow 01.14, frame 731]; that outcome is `workspaceChoiceListSchema` above, and it
 * is a distinct shape rather than an optional field here, so a client cannot mistake
 * "choose a workspace" for "signed in to one".
 */
export const authenticatedSessionSchema = z.strictObject({
  /**
   * The authenticated person, as the shared projection.
   *
   * Reused from `./user.ts`; carries no address and no credential. See above.
   */
  person: personSummarySchema,

  /** The workspace the session is scoped to. Reports authorization; grants none. */
  workspace: z.strictObject({ ...workspaceContextShape }),
});

/** What a successful sign-in returns: who, and where. Never a credential. */
export type AuthenticatedSession = z.infer<typeof authenticatedSessionSchema>;
