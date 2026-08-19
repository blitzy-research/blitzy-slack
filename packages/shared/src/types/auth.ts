/**
 * Derived types for the authentication and account-recovery contract.
 *
 * WHAT THIS MODULE IS
 *
 * Every type this module exposes is produced by `z.infer` over a schema that
 * `../schemas/auth.js` exports, is a narrowing of such an inferred type, or is
 * forwarded by name from the module that declares it. There is no schema here,
 * no runtime value and no hand-written shape. Nothing in this file survives
 * compilation: it emits declarations and nothing else, which is why the package
 * declares itself free of side effects and why the coverage configuration
 * excludes this directory from measurement rather than reporting it at zero.
 *
 * The consequence worth stating plainly is that this module cannot drift. A
 * shape has exactly one definition — the schema — and a type inferred from that
 * definition changes when the definition changes. An `interface Credentials`
 * restating a sign-in payload would be a second definition of one contract, and
 * the second definition is the one that is wrong after the first one changes.
 * None appears below, and the temptation is worth naming out loud, because a
 * credentials shape and a session shape are the two most natural things in this
 * package to hand-write.
 *
 * In this module that discipline is also a security property rather than only a
 * style one. A hand-written sign-in shape would be a shape nothing validates; a
 * hand-written session shape would be a place to put a bearer value the design
 * says is never handed to a client at all. See the absence block below.
 *
 * WHERE THE CANONICAL GATE TYPES LIVE, AND WHY THIS MODULE FORWARDS THEM
 *
 * The schema module already declares a derived type for each of its request
 * shapes, each of its projections and each of its closed vocabularies, and
 * those declarations are load-bearing where they are: the rejection-code union
 * is consumed inside the schema module itself to type every issue message it
 * attaches, and the object schemas reference the vocabularies. So this module
 * does not restate them.
 *
 * It does forward them, by name, from the module that declares them. That
 * distinction is the whole of it and it is not a nicety:
 *
 *   - A RE-EXPORT introduces no new declaration. `export type { X } from …`
 *     forwards the one declaration next door, so the package barrel flattening
 *     both modules into one namespace sees one `X` arriving by two routes that
 *     resolve to the same symbol. That is not ambiguous and it is not an error.
 *   - A TWIN is a second declaration. Writing `export type X = z.infer<typeof
 *     xSchema>` here for an `X` the schema module also exports makes two
 *     declarations of one name, and the barrel then fails to compile — in a file
 *     neither module owns — reporting that the member is already exported.
 *
 * Both halves of that were established by compiling them rather than reasoned
 * about, because the failure mode lands on somebody else's file. A reader who
 * "tidies" the forwarding block below into a set of local inferences will
 * reproduce it.
 *
 * What is inferred locally is therefore the remainder — the field schemas the
 * module next door leaves underived — together with the narrowings that read a
 * subset off a union rather than listing one.
 *
 * WHAT THESE TYPES ARE, AND WHAT NO VALUE GAINS BY WEARING ONE
 *
 * They are shapes. They are not a trust boundary, and they are emphatically not
 * evidence.
 *
 *   - **Every field described here is a SUBMITTED value.** It is whatever an
 *     unauthenticated caller chose to send. A value typed as anything below has
 *     satisfied the compiler, which says nothing about whether it satisfied the
 *     schema, and nothing whatsoever about whether it is true.
 *   - **None of it confers authority.** Authentication is decided server-side by
 *     comparing a submitted value against a stored verifier record — a keyed
 *     digest for a one-time code, a memory-hard one-way verifier for a password,
 *     a keyed verifier of a link's secret part — never by the shape of the
 *     payload that carried it. An address on a request SELECTS a verifier
 *     record; it does not assert that the sender holds that address.
 *   - **No request here names its own subject, its workspace or its role**, and
 *     that is the schema's design rather than an omission this module could fix.
 *     The project rule requiring server-side authorization forbids resting a
 *     decision on a caller-supplied workspace or actor identifier, so where a
 *     request is about a person the subject is the acting session, and where it
 *     is about a workspace the workspace comes from the route, the redeemed
 *     invitation, or a projection over the session's own memberships. A caller
 *     that edited any value below would change a label and no permission.
 *   - **This module introduces no mutation and no projection of its own**, so it
 *     owes no denial test and none is fabricated for it. The behavioural
 *     coverage — a non-member and a wrong-role caller denied server-side — lives
 *     with the operations, in `apps/api/test/integration/auth/`.
 *
 * WHAT IS DELIBERATELY ABSENT
 *
 * Recorded here rather than left implicit, so that a later reader cannot mistake
 * an absence for an oversight and add one back "for completeness". The
 * consolidated data model's own entity row states that the credential artefacts
 * this product renders — a password with a strength rating, a six-character
 * expiring one-time code, an active browser session, a device-enrolment code —
 * are *not* fields of the person entity (`docs/workflows/README.md` L326), and
 * the area states it as an acceptance criterion outright: none of the four is a
 * persisted field of that entity or of any entity a read path returns, and none
 * is ever echoed back by any surface (`docs/workflows/01-onboarding-and-auth.md`
 * L927). Three classes with three lifetimes are involved, and inbound
 * verifier-only material lives in its own lifecycle-bearing records.
 *
 * So, five absences, each with the place the concern actually lives:
 *
 *   1. **No verifier, hash, salt or hashing-parameter type.** A password is
 *      modelled here only as an inbound value, never as anything stored.
 *      Hashing happens in `apps/api/src/secrets/password.ts`, and the
 *      parameters are compile-time invariants in `../config/constants.ts` — a
 *      parameter appearing here would be a second source of truth for a
 *      security-critical value.
 *   2. **No session bearer, session identifier or session-expiry type.** The
 *      session is an HTTP-only, same-site-lax, secure cookie the server sets,
 *      and `apps/api/src/secrets/session-store.ts` owns the revocable record
 *      behind it. HTTP-only is the operative word: the client cannot read the
 *      cookie, so it has nothing to store, nothing to attach by hand and
 *      nothing to leak through a script. Nothing is ever returned to a client,
 *      which is the only way this build's rule that no bearer value lives in
 *      local storage can be true. A bearer or session-identifier type here
 *      would contradict the design outright.
 *   3. **No password-strength type.** No score, no rating, no segment count, no
 *      meter value, no strength vocabulary — not on a request, not on a
 *      response. The rating is computed transiently in the client, is never
 *      transmitted and never stored, and is advisory rather than a policy gate
 *      (`01-onboarding-and-auth.md` L928); the policy itself is evaluated
 *      server-side on submission, which is what the password schema expresses.
 *      The meter is a rendering, and its presentational types belong to the
 *      strength-meter contract module in `packages/ui`.
 *   4. **No duration, expiry, remaining-time or attempt-counter type.** An
 *      expiry is resolved once at issuance and stored as an ABSOLUTE INSTANT,
 *      then enforced by comparing that instant to now, so a configured default
 *      can change without invalidating a record already issued; the
 *      environment-overridable defaults live in `../config/env.ts`. No request
 *      may carry an expiry, because a caller who could send one could extend
 *      one, and no response returns a remaining time or an attempt count,
 *      because both are measurements of the very bound they exist to keep
 *      unmeasurable.
 *   5. **No name for the opaque value a capability link carries.** This is the
 *      one field schema next door that this module deliberately leaves
 *      unnamed. It is a high-entropy opaque artefact split server-side into a
 *      non-secret lookup selector and a secret part, of which only a keyed
 *      verifier is stored; redeeming it is an authorization event rather than a
 *      lookup, and no surface renders it in full. Giving it a convenient
 *      top-level name in the package every workspace imports is an invitation
 *      to hold it in a variable, log it or pass it on, so it is reached instead
 *      as a member of the two redemption requests that legitimately carry it —
 *      `CompletePasswordResetRequest['token']` and
 *      `AcceptInvitationRequest['token']` — and its bounded schema, with the
 *      full reasoning for its opacity, stays in `../schemas/auth.js`.
 *
 * ONE FORWARDED NAME THAT IS NOT WHAT IT SOUNDS LIKE
 *
 * `CredentialDeliveryOutcome` names the outcome of DELIVERING something to an
 * address, and it carries no credential. It is the single deliberately
 * non-committal shape that all four address-taking endpoints return, and it
 * holds exactly one value: the normalised address the request itself supplied,
 * echoed so the confirmation surface can name the inbox. It reports that the
 * product acted and never that an account was found — there is no `exists`, no
 * `sent` and no `accountFound` — because any difference between the two cases
 * would be an account-enumeration disclosure on an endpoint an unauthenticated
 * caller may call at will. It is forwarded under the name the schema module
 * declares, because renaming it here would make a twin of it.
 *
 * A NOTE ON OPTIONAL MEMBERS — OMIT THE PROPERTY, DO NOT ASSIGN IT
 *
 * A schema's optional field infers as an optional property whose value type
 * *includes* the absent case, so the compiler accepts both omitting the property
 * and assigning it that absent case even under the exact-optional-property-types
 * setting. Nothing in this module can stop the second one, so it is documented
 * instead: omit it. The schema's own output for an absent optional omits the
 * key, a presence test by key disagrees with the two forms, and serialising
 * drops an assigned one — so a value with the key present and holding nothing is
 * a value the schema would never have produced.
 *
 * It matters most on the marketing-consent member, where the two forms are not
 * merely unequal but mean opposite things. Absent means no consent record is
 * written at all. It does not mean a record saying "declined", because declining
 * is not an act either.
 *
 * ON CITATIONS IN THIS FILE
 *
 * Catalogue locations are cited by document and line. Frames are cited by NUMBER
 * alone and never by filename, because every one of the corpus filenames embeds
 * the third-party product name that the identity-exclusion rule keeps out of
 * source and comments. That same restriction is why every project rule referred
 * to above and below is named by what it requires — server-side authorization,
 * one shared contract implemented once, uncertainty is never permission to omit,
 * third-party identity exclusion — and never by its own identifier, each of
 * which embeds that name. A reader who maps them back should not write the
 * identifiers in here. No frame was opened to write this module; the schema and
 * the catalogue's prose settled everything.
 *
 * HOW TO CONSUME IT
 *
 * Through the package barrel — `@relay/shared` — and not by path. Inside this
 * package the sibling schema module is reached relatively, because that is how a
 * package is built; from outside, the barrel is the only entry point.
 */
import type { z } from 'zod';
import type {
  authCodeSchema,
  authEmailAddressSchema,
  authPasswordSchema,
  authPresentedPasswordSchema,
  authRejectionCodeSchema,
  copyIdentifierSchema,
  joinDisplayNameSchema,
  withdrawMarketingConsentRequestSchema,
  workspaceSelectorSchema,
} from '../schemas/auth.js';

/* -------------------------------------------------------------------------- */
/* The gate contract, forwarded from the module that declares it              */
/* -------------------------------------------------------------------------- */

/*
 * Twenty-five names, one declaration each, all of them next door. They are
 * forwarded here so that a consumer reaching for the authentication contract
 * finds the whole of it in one place, and forwarded rather than re-inferred so
 * that there is still only one declaration of each — see the header for why the
 * difference decides whether the package barrel compiles.
 *
 * THEY ARE GROUPED BY SURFACE, AND THE GROUPS ARE NOT INTERCHANGEABLE. The rule
 * that a shared contract is implemented exactly once carries a second clause: two
 * similar contracts are never merged. Five pairs below look mergeable and none of
 * them is, so each is named here with the reason, because a later reader
 * collapsing any one of them would remove a distinction the product depends on.
 *
 *   - `SignInWithPasswordRequest` and `SignInWithCodeRequest` are TWO PATHS, not
 *     one shape with an optional password beside an optional code. The catalogue
 *     makes their failures an acceptance criterion rather than a preference: the
 *     invalid-code state and the rejected-credential state are two distinct
 *     states with different messages, different fields cleared and different
 *     pages, never one generic error [`01-onboarding-and-auth.md` L924, frames
 *     730, 735]. A merged shape would make that criterion unmeetable while
 *     appearing to work, because the client could no longer tell which path it
 *     was on. The two are structurally non-assignable in both directions, which
 *     is what keeps the separation real rather than nominal.
 *   - `RequestPasswordResetRequest` and `RequestSignInLinkRequest` carry the same
 *     single field and differ in SCOPE: the password-free link covers every
 *     workspace the address belongs to, while the reset is scoped to the one
 *     workspace whose route the caller is already on [L460, frames 737, 738].
 *     Collapsing them would make one endpoint that issues two different
 *     capabilities depending on how it was called, which is the shape of an
 *     authorization bug.
 *   - `RequestPasswordResetRequest` and `CompletePasswordResetRequest` are the
 *     two ends of one recovery journey — asking for a link, and redeeming one.
 *     They share no field.
 *   - `MarketingConsentAct` and `WithdrawMarketingConsentRequest` are a grant and
 *     its withdrawal, recorded with the same fidelity and never the same shape. A
 *     withdrawal is not the absence of a grant and not a grant with a flag
 *     flipped.
 *   - `SignOutRequest` and `SignOutEverywhereRequest` are two operations rather
 *     than one with a flag, and both payloads are empty. The difference between
 *     them is entirely a server-side effect on stored records — collective
 *     invalidation is what someone reaches for after a compromise — so a distinct
 *     endpoint means it is authorized and audited on its own terms and cannot be
 *     invoked by accident with a mis-serialised boolean. A client that "signed
 *     out everywhere" by clearing its own storage would have satisfied a flag and
 *     none of the contract.
 *
 * Two of these are PROJECTIONS rather than requests — `WorkspaceChoice` (with its
 * list) and `AuthenticatedSession` — and each is authorized independently on
 * every read path that produces it. `WorkspaceChoice.memberCount` is a projection
 * in its own right, and is the one a build most often forgets to authorize
 * because a count looks harmless: a count over a set the reader may not see
 * discloses the size of that set.
 *
 * `AuthenticatedSession` composes the shared person projection, and that
 * composition happens in the SCHEMA. The type inherits it, including its most
 * important property — it carries no email address, because the shell renders a
 * name and an avatar and has no purpose for one. It is not re-composed here, and
 * a sign-in-specific person shape would be a second definition of the projection
 * every surface naming a person already renders from.
 */
export type {
  /** The closed, machine-readable vocabulary every rejection below resolves to. */
  AuthRejectionCode,

  /* --- Sign-up, verification and account confirmation ---------------------- */
  /** Begin sign-up. An address is the whole payload. */
  SignUpRequest,
  /** Prove a new address with the six-character code sent to it. */
  VerifyEmailRequest,
  /** Confirm the verified account, optionally recording a consent act. */
  ConfirmAccountRequest,

  /* --- The three sign-in paths, which stay three --------------------------- */
  /** Resolve which workspace, before any credential is asked for. */
  ResolveWorkspaceRequest,
  /** Ask for a sign-in code by email. Distinct from verifying a new address. */
  RequestEmailCodeRequest,
  /** Sign in by submitting the emailed code. Never resolves to a credential rejection. */
  SignInWithCodeRequest,
  /** Sign in with an address and a password. Every failure is one ambiguous code. */
  SignInWithPasswordRequest,

  /* --- The two recovery paths, and changing a password from inside --------- */
  /** Ask for a password-free sign-in link covering the account's workspaces. */
  RequestSignInLinkRequest,
  /** Ask for a password-reset link scoped to one workspace. */
  RequestPasswordResetRequest,
  /** Set a new password by redeeming a reset link. */
  CompletePasswordResetRequest,
  /** Change one's own password while holding a session. Re-presents the current one. */
  ChangePasswordRequest,
  /** What every address-taking endpoint returns. Discloses nothing; see the header. */
  CredentialDeliveryOutcome,

  /* --- Device enrolment ---------------------------------------------------- */
  /** The lifecycle states an enrolment moves through. */
  DeviceEnrolmentState,
  /** Begin enrolling another device. Carries nothing; the session is the subject. */
  BeginDeviceEnrolmentRequest,
  /** An enrolment's identity and state. Never the enrolment code itself. */
  DeviceEnrolmentStatus,

  /* --- Invitation redemption ----------------------------------------------- */
  /** Join a workspace by redeeming an invitation. Carries no address and no role. */
  AcceptInvitationRequest,

  /* --- Ending a session --------------------------------------------------- */
  /** End the current session. */
  SignOutRequest,
  /** Invalidate every server-side session record for this account. */
  SignOutEverywhereRequest,

  /* --- Marketing consent -------------------------------------------------- */
  /** The closed set of surfaces a consent control is presented on. */
  MarketingConsentSurface,
  /** An affirmative act of consent, carrying its own proof. Never a boolean. */
  MarketingConsentAct,
  /** Withdraw consent, by capability link or by session. */
  WithdrawMarketingConsentRequest,

  /* --- The two gate-surface projections ----------------------------------- */
  /** A row in the workspace chooser. Projects workspace identity, never a credential. */
  WorkspaceChoice,
  /** The workspace list a chooser surface renders. */
  WorkspaceChoiceList,
  /** What a successful sign-in returns: who, and where. Never a credential. */
  AuthenticatedSession,
} from '../schemas/auth.js';

/* -------------------------------------------------------------------------- */
/* Field primitives                                                           */
/* -------------------------------------------------------------------------- */

/*
 * One name for each field schema the module next door leaves underived, with a
 * single deliberate exception recorded in the header. Every one of them resolves
 * to text, and that is the point rather than a shortcoming: the schemas differ in
 * how much they accept, against which character class, after which normalisation,
 * and whether the value is normalised at all — and none of that difference is
 * expressible in the type system. A signature naming one of these therefore says
 * which bounded value it wants, which is strictly more than a bare text type
 * says, while leaving enforcement where enforcement belongs: in the schema.
 *
 * No bound appears here, in a type or in a comment. Every bound is declared once
 * in the schema module as a named exported constant and reaches these types only
 * through the schema that consumed it, so there is no number in this file that
 * can fall out of step with one. That is also why none of these is a fixed-length
 * tuple or a template-literal type spelling out a length: encoding a bound in a
 * type would be a second declaration of it, in the one place a change to the
 * first would go unnoticed.
 */

/**
 * A person's email address, as submitted to a gate surface.
 *
 * Normalised by the schema — trimmed and lower-cased in full — so that one
 * mailbox cannot become two accounts, two verifier records and two independent
 * rate-limit buckets, the second of which would be a bypass of the first. The
 * normalised form is what every consumer receives.
 *
 * A SELECTOR, NEVER AN ASSERTION. On the requests that pair it with a code it
 * says which per-address verifier record to compare against; naming someone
 * else's address selects their record and then fails the comparison. Nothing
 * about a value of this type establishes that the sender controls the address,
 * and nothing about submitting one reveals whether the address exists.
 *
 * Personal data rather than a secret, so it is neither hashed nor sealed — a code
 * has to reach the address that was typed. What travels with it instead is a
 * handling obligation the schema states and no type can enforce: the value never
 * reaches an application log, an error report, an analytics event, a URL or a
 * cache key, and where a person must be referenced in any of those an opaque
 * record identifier is referenced instead.
 *
 * Distinct from the address type the person contract exports. The two bound the
 * same subject for two different surfaces and are declared by two schemas; this
 * is the one a gate surface submits.
 */
export type AuthEmailAddress = z.infer<typeof authEmailAddressSchema>;

/**
 * The one-time code a verification or sign-in surface collects, one character per
 * box.
 *
 * ONE SHAPE FOR BOTH FLOWS, because the segmented input is one component
 * contract rendered on both surfaces and the rule that a shared contract is
 * implemented exactly once applies to the validation that mirrors it. No gate
 * surface declares its own variant of either. The sign-in path's code page is
 * recorded as byte-identical to the sign-up path's [`01-onboarding-and-auth.md`
 * L384, frame 728].
 *
 * The schema strips the separators a display grouping inserts before it
 * validates, which is what makes paste work — an accessible-authentication
 * obligation automated scanning cannot judge, so it is discharged deliberately
 * there and in the component rather than left to chance.
 *
 * IT ESTABLISHES ONLY THAT A SUBMISSION COULD BE A CODE, never that it is one.
 * Whether it matches is decided by a constant-time comparison against a keyed
 * digest, server-side, in `apps/api/src/secrets/otp.ts`; the raw value is never
 * persisted. The single-use rule, the expiry, the per-account and per-address
 * attempt bounds and the per-address issuance bound all live there too — none of
 * them crosses this contract, and none of them is expressible in this type.
 */
export type AuthCode = z.infer<typeof authCodeSchema>;

/**
 * A password being ADOPTED: set at reset completion, or changed from inside.
 *
 * Inbound only. It appears on no response shape anywhere in this contract, and
 * the value it describes is never returned, never echoed and never stored in a
 * recoverable form — what is stored is a memory-hard one-way verifier with a
 * per-record salt, computed in `apps/api/src/secrets/password.ts`.
 *
 * Bounded by the server-side policy, which is a length floor and ceiling and
 * deliberately no character-class rule: current guidance favours length over
 * composition, because a composition rule pushes people toward predictable
 * substitutions while length raises the work factor directly. The catalogue
 * supplies no policy at all, so the one the schema expresses is authored — and
 * authored rather than omitted, because uncertainty about a value is never
 * permission to ship no mechanism.
 *
 * Neither trimmed nor Unicode-normalised, unlike every other text value in this
 * contract, and the asymmetry is the point: whitespace and composition are
 * CONTENT in a passphrase, and silently altering the bytes would mean the value
 * verified is not the value typed.
 *
 * The reuse constraint is evaluated against stored verifiers, so there is no
 * password-history type here and no previous-password member on any shape — such
 * a thing would be a set of recoverable passwords, which is precisely what the
 * secret-handling contract forbids.
 */
export type AuthPassword = z.infer<typeof authPasswordSchema>;

/**
 * A password being VERIFIED rather than adopted: presented at sign-in, or
 * re-presented to authorise a change.
 *
 * Distinct from the type above by exactly one property, and the property matters.
 * A value being compared against a stored verifier is not being adopted, so the
 * CURRENT policy is irrelevant to it. Applying the policy here would lock out
 * every account whose password predates a tightening of it and — worse — would
 * answer a question no unauthenticated caller should be able to ask, because a
 * policy rejection distinguishable from a credential rejection tells a prober the
 * difference between "this is not the password" and "this could not be anyone's
 * password".
 *
 * So this one is length-bounded only, for containment, and every failure on the
 * path that takes it resolves to the single ambiguous credential rejection. The
 * upgrade path for an account holding a password that no longer satisfies the
 * policy is a re-hash at next successful authentication, never a refusal to let
 * them in.
 *
 * The two types are not interchangeable and neither is a widening of the other.
 * Using this one where a new password is adopted would ship an unenforced policy;
 * using the other where a password is verified would ship the leak.
 */
export type AuthPresentedPassword = z.infer<typeof authPresentedPasswordSchema>;

/**
 * A workspace's chosen subdomain, as typed on the workspace-resolution page.
 *
 * A LOOKUP TERM, NEVER AN IDENTIFIER, and that distinction is what keeps this
 * value compatible with the rule against resting an authorization decision on
 * something a caller supplied. Signing back in is two pages because the product
 * must first learn which workspace: one input holding a subdomain against a
 * fixed, non-editable suffix, and only then that workspace's own sign-in page
 * [`01-onboarding-and-auth.md` L336, frames 717, 718, 719].
 *
 * Three things follow, and all three are server-side. The SERVER appends the
 * fixed suffix — the caller cannot, which is why the schema's pattern admits no
 * dot, so a lookup cannot be aimed at another domain. The lookup is authorized on
 * its own terms, and submitting the subdomain of a workspace one does not belong
 * to must not be distinguishable from submitting one that does not exist, or the
 * endpoint becomes a workspace-enumeration oracle reachable with no session at
 * all. And every later step uses the workspace taken from the route the server
 * put the caller on, never a body field they could substitute at the next step.
 *
 * Lower-cased by the schema, because a label is case-insensitive and two
 * spellings must resolve to one workspace and one rate-limit bucket. It also
 * appears on both gate-surface projections, where it is what makes a chooser row
 * a destination rather than a key.
 */
export type WorkspaceSelector = z.infer<typeof workspaceSelectorSchema>;

/**
 * The display name the invitation join page collects.
 *
 * The join page asks for one thing — a name [`01-onboarding-and-auth.md` L361,
 * frames 721, 722] — and the value becomes the display name that renders
 * thereafter on an author line, a member row, a facepile entry and a mention
 * chip. Its bound matches the one the person contract applies, so a name accepted
 * at the gate cannot be rejected by the profile that stores it.
 *
 * THIS IS THE ONE FREE-TEXT VALUE AN UNAUTHENTICATED CALLER CONTRIBUTES TO A
 * WORKSPACE EVERYONE ELSE WILL READ, which is why the schema's screening is not
 * optional: the value is normalised to one canonical form, and control characters
 * and bidirectional embeddings, overrides and isolates are refused, because a
 * bidirectional override in a display name reorders the text around it. Right-to-
 * left script characters and directional marks are NOT refused — those are
 * ordinary letters and annotations, and a person whose name is written in one
 * must be able to join.
 *
 * Distinct from the display-name type the person contract exports: that one is
 * edited by someone who already holds a session, this one is submitted by someone
 * who does not.
 */
export type JoinDisplayName = z.infer<typeof joinDisplayNameSchema>;

/**
 * An identifier naming a piece of authored copy — a consent wording, or a policy
 * version.
 *
 * A NAME, NEVER THE TEXT, and this type is the load-bearing half of why the
 * consent record can be evidence at all. Two independent reasons, either of which
 * would settle it. A client-supplied wording string would be untrusted input
 * stored as the authoritative record of what was agreed, so the one field whose
 * purpose is to be evidence would be the one field the person being held to it
 * could have written; sending a name instead means the server resolves the
 * wording from the authored copy module and the record proves what the SERVER
 * presented. And the wording legible in a frame is a third party's product copy,
 * which the identity-exclusion rule forbids transcribing into source, fixtures or
 * tests — a free-text wording field would invite exactly that transcription.
 *
 * An identifier the dictionary does not know is rejected, so a client cannot
 * fabricate a wording by naming one. The schema's character class admits no
 * whitespace, which is what makes "send the paragraph instead of its name" fail
 * rather than succeed quietly.
 *
 * No sample value appears here or anywhere in this file, for the second reason
 * above.
 */
export type CopyIdentifier = z.infer<typeof copyIdentifierSchema>;

/* -------------------------------------------------------------------------- */
/* Narrowing the rejection vocabulary, one surface at a time                   */
/* -------------------------------------------------------------------------- */

/*
 * Each narrowing below is read off the rejection union itself, so it is derived
 * from the vocabulary rather than listed beside it. Listing the members again —
 * even correctly — would be a second enumeration of one closed set, and the
 * second one is the one that is wrong after the first one changes.
 *
 * They exist because a gate surface handles the codes it can actually receive.
 * A client resolves a code to its own wording from the authored copy module, and
 * an exhaustive mapping over the right subset is what stops a code reaching a
 * person as a raw token; a mapping over the whole union would force every surface
 * to acknowledge codes it can never see. Every one of these is a CODE and never a
 * sentence — no user-facing prose exists anywhere in this package's contract, so
 * no rejection can leak an implementation detail either.
 *
 * WHY ONLY FIVE. A narrowing is authored exactly where the vocabulary already
 * carries a shared prefix, which is what lets it be extracted. The remaining
 * codes — the address, the workspace selector, the join name, the invitation, and
 * the three anti-automation codes — share no prefix, so naming any of those
 * groups would mean writing its members out, and that is the restatement this
 * section exists to avoid. A surface that needs one of them names the code
 * directly against the full union.
 */

/**
 * The rejections the one-time-code surfaces can produce: wrong, expired, or
 * already spent.
 *
 * THREE CODES BECAUSE THREE REMEDIES. Retyping fixes a wrong code; only
 * requesting another fixes an expired or a spent one, and a code is single-use, so
 * collapsing them would leave a person retyping a value that can never be
 * accepted again.
 *
 * The set deliberately excludes the credential rejection, and that exclusion is
 * an acceptance criterion rather than a tidy boundary: the invalid-code state and
 * the rejected-credential state are two distinct states with different messages,
 * different fields cleared and different pages [`01-onboarding-and-auth.md` L924,
 * frames 730, 735]. The code path clears its boxes in place; it never resolves to
 * the credential rejection.
 *
 * It also excludes the anti-automation codes, which the surfaces can receive and
 * which are not code-shaped: no attempt counter or lockout notice appears
 * anywhere in the corpus [L930], so their renderings are authored rather than read
 * from pixels — and no count is ever returned, because a remaining-attempts number
 * measures the bound an attacker is probing for.
 */
export type AuthCodeRejectionCode = Extract<
  z.infer<typeof authRejectionCodeSchema>,
  `auth_code_${string}`
>;

/**
 * The rejections a surface that ADOPTS a password can produce: the policy refused
 * it, this account has used it before, or the confirmation did not match.
 *
 * THE AMBIGUOUS CREDENTIAL REJECTION IS PROVABLY NOT IN THIS SET, and that is the
 * single most important property of the narrowing. A sign-in failure says nothing
 * about which half was wrong, because a code distinguishing "no such address" from
 * "wrong password" would be an account-enumeration oracle on the busiest endpoint
 * in the product. These three, by contrast, are all safe to be specific about:
 * every one of them is returned only to a caller who has already proved something
 * — a redeemed link, or a live session — so none of them tells an unauthenticated
 * prober anything.
 *
 * The reuse rejection is page-level rather than field-level, because the check
 * runs on submission rather than as the value is typed, and it is evaluated
 * against stored verifiers rather than against any modelled history. The mismatch
 * rejection is never captured in the corpus at all; it ships because a partial
 * capture is an open work item and not permission to accept a mismatch.
 */
export type AuthPasswordRejectionCode = Extract<
  z.infer<typeof authRejectionCodeSchema>,
  `auth_password_${string}`
>;

/**
 * The rejections redeeming a password-reset link can produce: it resolved to
 * nothing, it is past the instant fixed at issuance, or its capability was
 * withdrawn.
 *
 * Three codes because three different things went wrong and each has its own
 * remedy, and both the expiry and the revocation state are RE-CHECKED at
 * redemption rather than trusted from issuance — redeeming a capability link is an
 * authorization event, not a lookup.
 *
 * Holding a valid link establishes WHICH capability is being claimed and never
 * that the holder may exercise it: the capability is granted on its own terms and
 * never inherited from whoever issued it. A reset link authorises setting a
 * password on the account its record names and nothing else — not the issuer's
 * role, not their workspace, not their memberships.
 *
 * The invitation link has its own separate code rather than appearing here,
 * because the two links grant different capabilities and a client lands on
 * different surfaces for them.
 */
export type AuthResetLinkRejectionCode = Extract<
  z.infer<typeof authRejectionCodeSchema>,
  `auth_reset_link_${string}`
>;

/**
 * The rejections a marketing-consent surface can produce: no affirmative act, a
 * malformed wording or policy reference, or a surface this build does not present
 * a control on.
 *
 * The first is the one that matters. A consent object without its affirmative act
 * cannot parse, so a pre-ticked control cannot become a record by being rendered —
 * which is the whole design, because a pre-ticked box is a rendering and never a
 * consent. Reaching this code means a caller tried to record a grant without one.
 *
 * None of the three gates a primary action. Consent gates nothing anywhere in the
 * product, so a request is never refused for lacking it; a caller recording no
 * consent omits the whole object, and absence means no record is written rather
 * than a record saying "declined".
 */
export type ConsentRejectionCode = Extract<
  z.infer<typeof authRejectionCodeSchema>,
  `consent_${string}`
>;

/**
 * The two ways a request envelope itself can be wrong: it was not an object of the
 * expected shape, or it carried a key the endpoint does not accept.
 *
 * Reported distinctly so a client can tell "you sent a field I do not accept" from
 * "you did not send an object at all". Every request shape in this contract is
 * strict, which is what makes the second code reachable: an unknown key is
 * REJECTED rather than ignored, because an ignored key is a key that looks
 * accepted. On the session-termination requests that is load-bearing rather than
 * pedantic — an ignored sign-out-everywhere flag would look exactly like a
 * collective invalidation that silently did not happen.
 */
export type AuthRequestEnvelopeRejectionCode = Extract<
  z.infer<typeof authRejectionCodeSchema>,
  `auth_request_${string}`
>;

/* -------------------------------------------------------------------------- */
/* The two routes a consent withdrawal arrives by                             */
/* -------------------------------------------------------------------------- */

/*
 * Withdrawal is a first-class operation with two routes, and the pair below is
 * derived from the union that models them rather than declared beside it.
 * Withdrawal must be available WITHOUT A SESSION where the messages themselves
 * are, which is why one route exists at all, and it must be recorded with the same
 * fidelity as the grant, which is why it is a request rather than a deletion.
 *
 * NO ADDRESS APPEARS ON EITHER ROUTE, and that is a security property rather than
 * an oversight. An endpoint that accepted an address would confirm whether that
 * address was on the list — an enumeration oracle on the one public endpoint where
 * an unauthenticated caller could otherwise test addresses in bulk. The capability
 * link identifies the contact on one route; the acting session identifies it on
 * the other.
 */

/**
 * Which route a withdrawal came by, read off the union's own discriminant.
 *
 * Derived by indexed access rather than restated, so the vocabulary cannot fall
 * out of step with the shapes it discriminates. A handler branching on this is
 * exhaustive over the routes that actually exist.
 */
export type MarketingConsentWithdrawalRoute = z.infer<
  typeof withdrawMarketingConsentRequestSchema
>['via'];

/**
 * The withdrawal request arriving by a given route.
 *
 * Narrowed from the union rather than restating either member, so a member gains a
 * field exactly when its schema does. Passing a route the union does not contain
 * resolves to nothing assignable, so the mistake surfaces where it is written
 * rather than where the value is used.
 *
 * The two members are genuinely different shapes and not one shape with an
 * optional field: the sessionless route carries the link's opaque value and the
 * in-product route carries nothing beyond the references, because there the
 * subject is the acting session and there is nothing to send. Narrowing to the
 * in-product route is therefore how a handler proves it is not holding a
 * capability value at all.
 */
export type WithdrawMarketingConsentRequestVia<TRoute extends MarketingConsentWithdrawalRoute> =
  Extract<z.infer<typeof withdrawMarketingConsentRequestSchema>, { via: TRoute }>;
