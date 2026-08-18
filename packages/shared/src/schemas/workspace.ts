/**
 * The workspace contract and the payloads of its five-step setup wizard.
 *
 * This module defines the tenant itself — the record every other row in the
 * product hangs off — the compact summary the switcher, the workspace menu and the
 * welcome-back chooser render from, and one payload per step of the longest flow in
 * the onboarding area. The schemas here are the single definition;
 * `../openapi/registry.ts` attaches descriptions and examples to them at
 * registration time, and `../types/` derives its types from them.
 *
 * ---------------------------------------------------------------------------
 * THE ONE PLACE IN THIS MODULE WHERE THE PIXELS AND THE OBLIGATION DIVERGE
 * ---------------------------------------------------------------------------
 *
 * Step 1 renders a domain-self-join checkbox that arrives PRE-TICKED
 * (`docs/workflows/01-onboarding-and-auth.md` L779, frame 8). The default in this
 * module is nevertheless `false`, and the reason is stated by the catalogue itself
 * rather than chosen here — see `workspaceSetupStepOneSchema` below, where the
 * departure is recorded against the criterion that requires it. It is called out
 * this high up because it is the clearest example in the build of the difference
 * between a RENDERING and an ACT: following the pixel would ship a workspace that
 * anyone sharing an email domain could join by default.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS MODULE OBLIGES ITS CONSUMERS TO DO, AND CANNOT DO ITSELF
 * ---------------------------------------------------------------------------
 *
 * A schema validates SHAPE. Not one of the following is a property of a shape, so
 * each is named here as an obligation on the server that consumes these schemas —
 * `PROJECT_RULE_R1` places every one of them there:
 *
 *   - NO SHAPE IN THIS MODULE NAMES ITS SUBJECT. There is no workspace identifier,
 *     no actor identifier and no user identifier in any request here, and the
 *     absence is structural rather than tidy. A workspace-creation payload has no
 *     workspace to name, and every later wizard step is scoped by THE SESSION'S
 *     IN-PROGRESS SETUP — the server resolves which setup is being advanced from
 *     the session it authenticated. An identifier a caller could set is an
 *     identifier a caller could change, and the check would then be authorizing a
 *     value the attacker chose.
 *
 *   - SELF-JOIN ENROLMENT IS AUTHORIZED SERVER-SIDE, NOT BY THIS FLAG.
 *     `01-onboarding-and-auth.md` L929 sets out the whole contract: every join
 *     attempt is checked server-side against the STORED policy and the joiner's
 *     CONFIRMED address, so neither a client that never rendered the control nor an
 *     unverified address can enrol; the policy is offered only for a domain the
 *     workspace has verified it controls and never for a public or
 *     consumer-provider domain; every change to the policy is audited with actor
 *     and time and applies only to LATER joins; and an administrator-approval mode
 *     is available and recommended. This module can express that a policy exists.
 *     It cannot verify domain control, cannot confirm an address, cannot audit and
 *     cannot refuse a join — all four live in `apps/api`.
 *
 *   - NOTHING HERE GRANTS MEMBERSHIP. Domain self-join is the one path in this
 *     product where a caller could plausibly enrol itself, which is why the flag
 *     below is a stored POLICY and never an enrolment instruction. No schema in
 *     this module accepts a member, a role or a grant of any kind.
 *
 *   - EVERY PROJECTION IS AUTHORIZED INDEPENDENTLY. `workspaceSummarySchema` is a
 *     read path in its own right and carries its own check; so does the member
 *     count inside it. See that schema's own note.
 *
 *   - ENCODING HAPPENS AT RENDER TIME, NEVER HERE. The workspace name is
 *     interpolated into headings, sidebar headers and modal titles thereafter
 *     (`01-onboarding-and-auth.md` L779, frames 8, 9, 40), which is exactly the
 *     interpolation case `S-CONTENT` and `S-PII` require to be escaped on OUTPUT,
 *     per destination context. This module validates the value on input and stores
 *     one canonical form; it does not pre-escape, because a value escaped at
 *     storage time is wrong in every context but the one it was escaped for.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DELIBERATELY NOT HERE
 * ---------------------------------------------------------------------------
 *
 * NO COMMERCIAL VALUE BEYOND A SINGLE OPAQUE TIER REFERENCE. Billing, payments and
 * plan purchase are out of scope for this run, and the catalogue independently
 * fixes where the excluded values would belong if they were in it:
 * `docs/workflows/README.md` L325 places the billing address, the stored payment
 * method, the billing contacts, the billing history and the renewal estimate in
 * five named field groups of the workspace, none of which is modelled here. There
 * is therefore no billing address, no payment instrument, no billing contact, no
 * billing history entry, no renewal estimate, no trial state and no entitlement set
 * in this module. What the wizard's terminal step does write is a reference, and it
 * is modelled as one — see `workspaceCommercialPositionSchema`.
 *
 * NO CREDENTIAL OF ANY CLASS. `S-SECRET`'s closing consequence
 * (`docs/workflows/00-product-overview.md` L540-L555) names this entity outright: a
 * credential, code, session, link token or provider token is not a field of
 * `E-USER`, `E-INVITATION`, `E-PLAN` or `E-WORKSPACE` — "including of its
 * commercial and payment field groups" — or of any other entity a read path
 * returns. The only two references a returned entity may carry are a class-B lookup
 * SELECTOR and a class-C OPAQUE RECORD IDENTIFIER, and neither of those is the
 * secret. This module needs neither, so it models neither. In particular the
 * workspace invite link is a class-B capability link whose redeemable value is
 * "never a field of `E-INVITATION`, `E-WORKSPACE` or any other entity a read path
 * returns" (`01-onboarding-and-auth.md` L908), so what appears below is whether
 * link joining is permitted — a policy — and never a link.
 *
 * NO DURATION, AND NO RESTATEMENT OF ONE. Every instant below is absolute. The
 * invite link's own expiry is a property of the LINK and belongs to
 * `./invitation.ts`; its configurable default lives in `../config/env.js` and is
 * consumed there by reference. No number of days appears in this module.
 *
 * ---------------------------------------------------------------------------
 * MODULE CONSTRAINTS
 * ---------------------------------------------------------------------------
 *
 * - Pure `zod`. No `.openapi()` call and no `extendZodWithOpenApi` here; those
 *   belong to `../openapi/registry.ts`, because the package barrel re-exports this
 *   module into the browser bundle and the specification generator has no business
 *   being shipped there.
 * - No framework import of any kind, and no import of `../copy/en.ts`. Every
 *   rejection this module can produce is a machine-readable code; the sentence a
 *   person reads is chosen by the client from the copy module.
 * - Side-effect free. Every binding is a constant, a pattern or a schema.
 * - Every length bound is declared once, as a named exported constant, and consumed
 *   by reference. The channel-name bound and pattern are IMPORTED rather than
 *   declared, because they are the channel's rule and not this module's.
 *
 * ---------------------------------------------------------------------------
 * HOW THE PROJECT RULES ARE CITED BELOW, AND WHY NOT BY THEIR OWN IDENTIFIERS
 * ---------------------------------------------------------------------------
 *
 * Five binding project rules govern this work. They are cited by requirement label:
 *
 *   `PROJECT_RULE_R1` — authorization is server-side only
 *   `PROJECT_RULE_R2` — corpus and specification handling
 *   `PROJECT_RULE_R3` — uncertainty is never permission to omit
 *   `PROJECT_RULE_R4` — third-party identity exclusion
 *   `PROJECT_RULE_R5` — a shared contract is implemented exactly once
 *
 * Their own identifiers are deliberately NOT written anywhere in this file, because
 * every one of them embeds the third-party product name that R4 forbids from
 * appearing in source or in comments; writing them would put the build's own brand
 * guard in the position of failing on the file that cites the rule it enforces. A
 * downstream reader should not "restore" them. Two warnings for whoever maps them
 * back: the identifiers are PERMUTED relative to the R labels, so the label is the
 * thing to trust and an ordinal is not; and the labels are a citation shorthand
 * rather than a paraphrase — the authoritative wording lives in the rules
 * interface.
 *
 * Frames are cited by NUMBER alone throughout, never by filename: each of the 1,022
 * frame filenames embeds a third-party product name, so per `PROJECT_RULE_R4` the
 * number is the citation.
 */

import { z } from 'zod';

import { CHANNEL_NAME_MAX_LENGTH, CHANNEL_NAME_PATTERN } from '../config/constants.js';
import {
  avatarObjectKeySchema,
  emailAddressSchema,
  fullNameSchema,
  NON_BLANK_MIN_LENGTH,
} from './user.js';

/* ===========================================================================
 * Length and count bounds
 *
 * Each bound is declared once here and referenced everywhere below. A validator
 * that inlined its own number would be a second source of truth for the same rule,
 * which `PROJECT_RULE_R3` forbids at a point of use.
 *
 * The channel-name bound is conspicuously absent from this list, and that is the
 * point: it is imported from `../config/constants.js` above, because the rule
 * belongs to the channel and this module is only one of its consumers.
 * =========================================================================== */

/**
 * Maximum length of an opaque record identifier naming a workspace.
 *
 * Opaque by contract: it is the "opaque record identifier" `S-SECRET` permits a
 * returned entity to carry, and the reference `S-PII` requires be used wherever a
 * record must be named in a place a personal value may not go. Nothing may be
 * inferred from its contents and no caller may construct one.
 *
 * Generous enough for any identifier scheme the build might adopt for a primary
 * key, and far too short to smuggle a payload.
 */
export const WORKSPACE_ID_MAX_LENGTH = 64;

/**
 * Maximum length of a workspace name.
 *
 * The name is collected on wizard step 1, where the input carries a character
 * counter at its right edge (`01-onboarding-and-auth.md` flow 01.4, frame 8). The
 * catalogue records that a counter is rendered but never states its value for THIS
 * field — the eighty it does state belongs to the channel name and is a different
 * rule with a different owner. Per `PROJECT_RULE_R3` an absent value is not
 * permission to omit the mechanism, so the bound is authored and the counter is
 * built: 100 characters, chosen as the smallest coherent ceiling consistent with
 * the adjacent evidenced bound for a human-supplied proper name in `./user.js`.
 *
 * Deliberately NOT the channel-name cap. Restating that number here would tie two
 * independent rules together so that changing one silently changed the other.
 */
export const WORKSPACE_NAME_MAX_LENGTH = 100;

/**
 * Maximum length of the subdomain label a workspace chooses for its sign-in
 * address.
 *
 * The sign-in domain is "composed of a workspace-chosen subdomain and a fixed
 * suffix" (`01-onboarding-and-auth.md` L779, frames 717, 719), so the label is the
 * part that varies. 63 is the maximum length of a single label in a domain name,
 * which makes this the boring, well-supported limit rather than a guess — a longer
 * label could not be resolved even if the product accepted it.
 */
export const WORKSPACE_DOMAIN_LABEL_MAX_LENGTH = 63;

/**
 * Maximum length of a fully-qualified sign-in domain.
 *
 * 253 is the maximum length of a domain name in presentation form, for the same
 * reason as above: beyond it the value could not resolve.
 */
export const WORKSPACE_SIGN_IN_DOMAIN_MAX_LENGTH = 253;

/**
 * Maximum length of a language tag.
 *
 * The workspace carries a language (`README.md` L325, frame 575). 35 characters
 * accommodates a well-formed language tag including script, region and variant
 * subtags, and refuses anything long enough to be carrying something else.
 */
export const WORKSPACE_LANGUAGE_TAG_MAX_LENGTH = 35;

/**
 * Greatest number of default channels a workspace may nominate for new members.
 *
 * The workspace holds "default channels for new members" (`README.md` L325, frame
 * 575), referenced by the invite modal's own helper text
 * (`01-onboarding-and-auth.md` L779, frame 44). No frame states a limit, so per
 * `PROJECT_RULE_R3` the mechanism is implemented with an authored bound rather than
 * left unbounded: an unbounded list here would mean one administrator could enrol
 * every new member into an arbitrary number of conversations, and a bound is the
 * smallest coherent guard against that.
 */
export const WORKSPACE_MAX_DEFAULT_CHANNELS = 20;

/**
 * Maximum length of the reference naming the terms of service a workspace was
 * created under.
 *
 * The about surface renders a terms-of-service reference with a review link
 * (`README.md` L325, frame 640). What is stored is a reference to a published
 * version — never its text, and never a URL assembled at a point of use.
 */
export const TERMS_OF_SERVICE_REFERENCE_MAX_LENGTH = 64;

/**
 * Greatest number of invitee addresses wizard step 3 accepts in one submission.
 *
 * Step 3 commits each address as a removable chip (`C-CHIP-INPUT`, frames 13, 14).
 * The corpus captures one chip and states no limit, so the bound is authored under
 * `PROJECT_RULE_R3` rather than omitted. It is deliberately modest: this step is a
 * setup convenience, the invitation contract in `./invitation.ts` is the surface
 * that issues at scale, and an unbounded array on an unauthenticated-adjacent setup
 * route is a bulk-mail amplifier.
 */
export const SETUP_MAX_INVITEES = 25;

/**
 * Fewest invitee addresses an inviting submission of wizard step 3 must carry.
 *
 * One. Named rather than written into the validator, so that the array's two bounds
 * are declared side by side and read as one rule. It exists because the step offers a
 * skip: an inviting outcome that invited nobody is a skip, and the two are modelled as
 * different outcomes precisely so this bound can be meaningful.
 */
export const SETUP_MIN_INVITEES = 1;

/**
 * Maximum length of the free-text answer wizard step 4 collects.
 *
 * Step 4 asks what the team is working on right now and offers four kinds of answer
 * in its helper line (frames 15, 16). The answer is prose; the channel name derived
 * from it is a handle. 120 characters admits a descriptive phrase without admitting
 * a paragraph.
 *
 * This bound is INDEPENDENT of the channel-name cap on purpose, and the consequence
 * is deliberate rather than overlooked: an answer that is valid here may still
 * derive a name that is too long to be a channel name, and when it does,
 * `deriveChannelNameFromFocusAnswer` REJECTS it with its own code. `S-CONTENT`
 * requires rejection rather than silent truncation, so the alternative — quietly
 * cutting the answer down until it fitted — is not available.
 */
export const SETUP_FOCUS_ANSWER_MAX_LENGTH = 120;

/**
 * Maximum length of a reference to a published plan tier.
 *
 * An opaque identifier and nothing else. See `planTierReferenceSchema` for what
 * this reference may and may not carry.
 */
export const PLAN_TIER_REFERENCE_MAX_LENGTH = 64;

/* ===========================================================================
 * Rejection codes
 *
 * Every rejection this module can produce is a code, never a sentence. The codes
 * are attached to the validators below as their issue messages, which is what keeps
 * this union load-bearing rather than decorative: a client receives the code and
 * chooses the wording itself from the authored copy module, so no user-facing prose
 * exists in the contract package and no rejection can leak an implementation
 * detail. `SCREAMING_SNAKE_CASE` follows `./user.js`, so that a rejection code is
 * never mistaken for a domain value at a call site.
 *
 * TWO FIELD SHAPES DELIBERATELY EMIT ANOTHER MODULE'S CODES. The invitee address
 * and the profile-photo reference are validated by `./user.js`'s own schemas, so
 * their rejections carry that module's codes rather than being restated here.
 * Restating them would create a second source of truth for the address rule and the
 * stored-object rule, which is precisely what importing them avoids. A consumer
 * mapping codes to copy therefore handles both unions, which it must do anyway.
 * =========================================================================== */

/**
 * The closed set of rejection codes the workspace schemas emit.
 *
 * A readonly tuple, so the union is derived from it rather than restated and a
 * consumer can enumerate the set — an exhaustive mapping to authored copy is what
 * stops a code reaching a person as a raw token.
 */
export const WORKSPACE_REJECTION_CODES = [
  'WORKSPACE_ID_MALFORMED',
  'WORKSPACE_NAME_REQUIRED',
  'WORKSPACE_NAME_TOO_LONG',
  'WORKSPACE_NAME_MALFORMED',
  'WORKSPACE_SIGN_IN_DOMAIN_REQUIRED',
  'WORKSPACE_SIGN_IN_DOMAIN_TOO_LONG',
  'WORKSPACE_SIGN_IN_DOMAIN_MALFORMED',
  'WORKSPACE_DOMAIN_LABEL_REQUIRED',
  'WORKSPACE_DOMAIN_LABEL_TOO_LONG',
  'WORKSPACE_DOMAIN_LABEL_MALFORMED',
  'WORKSPACE_LANGUAGE_TAG_REQUIRED',
  'WORKSPACE_LANGUAGE_TAG_TOO_LONG',
  'WORKSPACE_LANGUAGE_TAG_MALFORMED',
  'WORKSPACE_CREATED_AT_NOT_AN_INSTANT',
  'WORKSPACE_TERMS_REFERENCE_REQUIRED',
  'WORKSPACE_TERMS_REFERENCE_TOO_LONG',
  'WORKSPACE_TERMS_REFERENCE_MALFORMED',
  'WORKSPACE_JOINING_POLICY_UNRECOGNISED',
  'WORKSPACE_DISPLAY_NAME_POLICY_UNRECOGNISED',
  'WORKSPACE_INVITATION_PERMISSION_UNRECOGNISED',
  'WORKSPACE_DEFAULT_CHANNEL_NAME_MALFORMED',
  'WORKSPACE_DEFAULT_CHANNELS_TOO_MANY',
  'WORKSPACE_DEFAULT_CHANNELS_DUPLICATED',
  'WORKSPACE_MEMBER_COUNT_NOT_A_COUNT',
  'PLAN_TIER_REFERENCE_REQUIRED',
  'PLAN_TIER_REFERENCE_TOO_LONG',
  'PLAN_TIER_REFERENCE_MALFORMED',
  'SETUP_INVITEES_REQUIRED',
  'SETUP_INVITEES_TOO_MANY',
  'SETUP_INVITEES_DUPLICATED',
  'SETUP_INVITEE_OUTCOME_UNRECOGNISED',
  'SETUP_FOCUS_ANSWER_REQUIRED',
  'SETUP_FOCUS_ANSWER_TOO_LONG',
  'SETUP_FOCUS_ANSWER_MALFORMED',
  'SETUP_FOCUS_ANSWER_YIELDS_NO_CHANNEL_NAME',
  'SETUP_FOCUS_ANSWER_YIELDS_INVALID_CHANNEL_NAME',
  'SETUP_STEP_UNRECOGNISED',
  'SETUP_STEP_MALFORMED',
  'SETUP_STEP_UNKNOWN_FIELD',
] as const;

/** Schema for a single rejection code, for use where a code crosses a boundary. */
export const workspaceRejectionCodeSchema = z.enum(WORKSPACE_REJECTION_CODES);

/**
 * A machine-readable reason a workspace or wizard shape was rejected.
 *
 * Never a rendered string. See the note above about the two field shapes that emit
 * `./user.js`'s codes instead.
 */
export type WorkspaceRejectionCode = z.infer<typeof workspaceRejectionCodeSchema>;

/* ===========================================================================
 * The `S-CONTENT` input discipline, applied to every free-text value here
 *
 * `S-CONTENT` (`docs/workflows/00-product-overview.md` L524) requires four things of
 * every field one principal authors and another reads: a LENGTH BOUND per field,
 * UNICODE NORMALISATION, REJECTION of control characters and of bidirectional-
 * override characters, and REJECTION RATHER THAN SILENT TRUNCATION of a value that
 * fails its declared shape.
 *
 * Every one of those applies to the workspace name in particular, because the name
 * is interpolated into headings, sidebar headers and modal titles thereafter
 * (frames 8, 9, 40). A bidirectional override inside it would reorder the text
 * AROUND it — the heading, the sidebar header, the modal title — which is the
 * specific attack the contract names when it says this is "what stops a filename or
 * display name from reordering the text around it".
 *
 * ENCODING IS NOT DONE HERE. `S-CONTENT` puts encoding on OUTPUT, "applied at
 * render time rather than at storage time, so that one stored value is safe in every
 * context it appears in". One canonical value is stored; each sink encodes it for
 * itself.
 *
 * The helpers below are module-private by intent. The sibling `./content.ts` keeps
 * its equivalents private too and exports none of them, so there is nothing to
 * import and no exported contract being duplicated.
 * =========================================================================== */

/**
 * The normalisation form every text value in this module is stored in.
 *
 * Composed form, so that two spellings of the same name compare and render as one
 * value. Normalising on input is what makes the length bound meaningful as well: a
 * decomposed value counts more code units than the same text composed.
 */
const UNICODE_NORMALISATION_FORM = 'NFC';

/** Last code point of the C0 control block. */
const C0_CONTROL_LAST = 0x1f;

/** First code point of the delete-and-C1 control range. */
const C1_CONTROL_FIRST = 0x7f;

/** Last code point of the delete-and-C1 control range. */
const C1_CONTROL_LAST = 0x9f;

/**
 * First code point of the bidirectional embedding and override block.
 *
 * The refused set is the embeddings and overrides through to the pop, and the
 * isolates below. These are the characters that change the direction of the text
 * around them and outlive the value they sit inside; the plain right-to-left marks
 * are NOT refused, because a name in a right-to-left script legitimately needs
 * them and refusing them would make the product unusable in those scripts for no
 * security gain.
 */
const BIDI_FORMATTING_FIRST = 0x202a;

/** Last code point of the bidirectional embedding and override block. */
const BIDI_FORMATTING_LAST = 0x202e;

/** First code point of the bidirectional isolate block. */
const BIDI_ISOLATE_FIRST = 0x2066;

/** Last code point of the bidirectional isolate block. */
const BIDI_ISOLATE_LAST = 0x2069;

/** Puts a value into the module's canonical composed form. */
const toCanonicalUnicodeForm = (value: string): string =>
  value.normalize(UNICODE_NORMALISATION_FORM);

/**
 * Reports whether a value carries a control character.
 *
 * No field in this module is multi-line — a workspace name, a domain, a language
 * tag and a one-line setup answer are all single-line values — so every control
 * character is refused here, including the tab and the line feed. A newline inside
 * a value that renders as a heading is a way to break the layout that contains it.
 */
const containsControlCharacter = (value: string): boolean => {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint <= C0_CONTROL_LAST) {
      return true;
    }
    if (codePoint >= C1_CONTROL_FIRST && codePoint <= C1_CONTROL_LAST) {
      return true;
    }
  }
  return false;
};

/** Reports whether a value carries a bidirectional embedding, override or isolate. */
const containsBidirectionalFormatting = (value: string): boolean => {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint >= BIDI_FORMATTING_FIRST && codePoint <= BIDI_FORMATTING_LAST) {
      return true;
    }
    if (codePoint >= BIDI_ISOLATE_FIRST && codePoint <= BIDI_ISOLATE_LAST) {
      return true;
    }
  }
  return false;
};

/** Reports whether a value is free of control and bidirectional formatting characters. */
const isSafeSingleLineText = (value: string): boolean =>
  !containsControlCharacter(value) && !containsBidirectionalFormatting(value);

/**
 * Builds the validator for a single-line free-text field.
 *
 * One factory rather than four hand-written chains, so that the four `S-CONTENT`
 * input requirements cannot be applied to one field and forgotten on another. The
 * order of operations is deliberate and is the reason this is a pipe rather than a
 * chain: the value is trimmed and normalised FIRST, and the bound and the character
 * checks are applied to the canonical result. Bounding before normalising would
 * measure a value the product never stores, and trimming after bounding would
 * accept a run of spaces as a name.
 *
 * Each caller supplies its own three codes, so a client can tell "you sent nothing"
 * from "you sent too much" from "you sent something that cannot be rendered
 * safely".
 */
const singleLineText = (
  maxLength: number,
  requiredCode: WorkspaceRejectionCode,
  tooLongCode: WorkspaceRejectionCode,
  malformedCode: WorkspaceRejectionCode,
) =>
  z
    .string({ error: requiredCode })
    .trim()
    .transform(toCanonicalUnicodeForm)
    .pipe(
      z
        .string()
        .min(NON_BLANK_MIN_LENGTH, { error: requiredCode })
        .max(maxLength, { error: tooLongCode })
        .refine(isSafeSingleLineText, { error: malformedCode }),
    );

/* ===========================================================================
 * Policy enumerations
 *
 * The workspace carries a joining policy and a display-name policy (`README.md`
 * L325, frame 575) and an invitation permission (`01-onboarding-and-auth.md` L779,
 * frame 52). The catalogue names the FIELDS and, for two of the three, does not
 * enumerate their values — a single capture of a settings surface shows the value
 * that was selected and can never show the set it was selected from.
 *
 * Per `PROJECT_RULE_R3` that silence is an open work item rather than permission to
 * omit, so each set below is authored as the smallest coherent set consistent with
 * adjacent evidenced behaviour, and each records what evidence it does have. These
 * sets are DESCRIPTIVE of stored policy; none of them is a capability, and none is
 * consulted to decide anything — the capability model lives in
 * `docs/decisions/role-matrix.md` and is implemented in `apps/api/src/authz/`.
 * =========================================================================== */

/**
 * How a person may come to be a member of this workspace.
 *
 * Two of the three values are directly evidenced and the third is named by the
 * catalogue in prose:
 *   - `invitation_only` — the product's baseline, evidenced by the whole invitation
 *     flow (`01-onboarding-and-auth.md` flows 01.7 to 01.9) and the correct default
 *     for a new workspace.
 *   - `domain_self_join` — the policy wizard step 1 offers, "an email-domain
 *     self-join policy … that names the domain" (L779, frame 8).
 *   - `domain_request_approval` — L929 states that "an administrator-approval mode
 *     is available and recommended", so it is a named requirement rather than an
 *     invention, and it exists as its own value because approval-on-request and
 *     open-self-join are materially different policies that must not collapse into
 *     one flag.
 *
 * A policy is not an enrolment. Which of these values is stored decides nothing on
 * its own: per L929 every join attempt is still checked server-side against the
 * stored policy AND the joiner's confirmed address, and `PROJECT_RULE_R1` places
 * that check at the point of execution.
 */
export const WORKSPACE_JOINING_POLICIES = [
  'invitation_only',
  'domain_self_join',
  'domain_request_approval',
] as const;

/** Schema for a workspace joining policy. */
export const workspaceJoiningPolicySchema = z.enum(WORKSPACE_JOINING_POLICIES, {
  error: 'WORKSPACE_JOINING_POLICY_UNRECOGNISED' satisfies WorkspaceRejectionCode,
});

/** How a person may come to be a member of this workspace. Never a grant. */
export type WorkspaceJoiningPolicy = z.infer<typeof workspaceJoiningPolicySchema>;

/**
 * Which of a person's two names this workspace renders by default.
 *
 * The workspace carries a display-name policy (`README.md` L325, frame 575) and a
 * person carries both a full name and a display name distinct from it
 * (`./user.js`). A policy over two values is therefore a choice between the two
 * names that already exist, which is the smallest coherent reading: two values, no
 * third.
 *
 * The resolution itself happens once, server-side, when a person summary is
 * projected — `./user.js`'s summary reports the RESOLVED name so that no consumer
 * re-implements the decision and two surfaces cannot disagree about what a person
 * is called. This field is the input to that resolution, not a second copy of it.
 */
export const WORKSPACE_DISPLAY_NAME_POLICIES = ['prefer_display_name', 'prefer_full_name'] as const;

/** Schema for a workspace display-name policy. */
export const workspaceDisplayNamePolicySchema = z.enum(WORKSPACE_DISPLAY_NAME_POLICIES, {
  error: 'WORKSPACE_DISPLAY_NAME_POLICY_UNRECOGNISED' satisfies WorkspaceRejectionCode,
});

/** Which of a person's two names this workspace renders by default. */
export type WorkspaceDisplayNamePolicy = z.infer<typeof workspaceDisplayNamePolicySchema>;

/**
 * Who may invite a person into this workspace.
 *
 * Both values are directly evidenced: `01-onboarding-and-auth.md` L779 records "an
 * invitation permission that can be restricted to owners and administrators" (frame
 * 52), and a restriction implies the unrestricted state it is a restriction FROM.
 * Two values, both observed, nothing authored.
 *
 * Descriptive of stored policy. The check that refuses an invitation from an
 * unentitled caller is in `apps/api/src/authz/`, per `PROJECT_RULE_R1`.
 */
export const WORKSPACE_INVITATION_PERMISSIONS = ['any_member', 'owners_and_admins'] as const;

/** Schema for a workspace invitation permission. */
export const workspaceInvitationPermissionSchema = z.enum(WORKSPACE_INVITATION_PERMISSIONS, {
  error: 'WORKSPACE_INVITATION_PERMISSION_UNRECOGNISED' satisfies WorkspaceRejectionCode,
});

/** Who may invite a person into this workspace. Descriptive, never a grant. */
export type WorkspaceInvitationPermission = z.infer<typeof workspaceInvitationPermissionSchema>;

/* ===========================================================================
 * Field primitives
 *
 * Each is declared once and reused by every shape below, so that a bound or a
 * character class cannot drift between the entity, the projection and the wizard.
 * =========================================================================== */

/**
 * Characters permitted in an opaque record identifier.
 *
 * The URL-safe alphabet, deliberately excluding the dot and the slash so that an
 * identifier can never be read as a path. The `+` quantifier rejects an empty
 * identifier, which is why no minimum-length bound is needed. Matches the class
 * `./user.js` uses for the same purpose, because an opaque identifier is one idea
 * and not two.
 */
const OPAQUE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Characters permitted in a single domain label.
 *
 * A letter or digit at each end and hyphens permitted only between them, which is
 * the long-standing rule for a hostname label. Written positively so that a label
 * beginning or ending in a hyphen is unrepresentable rather than merely
 * discouraged, and so that a label carrying a dot cannot smuggle a second label
 * into the field that holds one.
 */
const DOMAIN_LABEL_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

/**
 * Characters permitted in a fully-qualified domain name.
 *
 * At least two labels joined by dots, each label satisfying the rule above. The
 * requirement of a second label is what refuses a bare label where a
 * fully-qualified name belongs — the sign-in domain is composed of a chosen
 * subdomain AND a fixed suffix (frames 717, 719), so a value with no suffix is not
 * that field's value.
 */
const SIGN_IN_DOMAIN_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

/**
 * Characters permitted in a language tag.
 *
 * Alphanumeric subtags joined by hyphens, beginning with a letter. Deliberately
 * shape-only: this module refuses a value that could not be a tag, and leaves
 * whether a well-formed tag is one the product has translations for to the surface
 * that resolves it. Validating against a fixed list here would rot.
 */
const LANGUAGE_TAG_PATTERN = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/;

/**
 * An opaque record identifier naming a workspace.
 *
 * The reference `S-PII` requires be used in place of a personal or otherwise
 * meaningful value wherever a record must be named, and the "opaque record
 * identifier" `S-SECRET` permits a returned entity to carry. It identifies; it
 * discloses nothing and grants nothing.
 *
 * It appears on the entity and on the projection, and on NO REQUEST in this module.
 * See the header: per `PROJECT_RULE_R1` an authorization decision may not rest on a
 * caller-supplied workspace identifier, so no wizard step accepts one.
 */
export const workspaceIdSchema = z
  .string()
  .max(WORKSPACE_ID_MAX_LENGTH, {
    error: 'WORKSPACE_ID_MALFORMED' satisfies WorkspaceRejectionCode,
  })
  .regex(OPAQUE_IDENTIFIER_PATTERN, {
    error: 'WORKSPACE_ID_MALFORMED' satisfies WorkspaceRejectionCode,
  });

/**
 * A workspace's name.
 *
 * Collected on wizard step 1 in answer to a question about the company or team, and
 * "interpolated into headings, sidebar headers and modal titles thereafter"
 * (`01-onboarding-and-auth.md` L779, frames 8, 9, 40). That interpolation is why
 * this field carries the full `S-CONTENT` input discipline: a control character or
 * a bidirectional override inside a value that becomes a heading is a way to
 * rewrite the surface around it. It is also why the value is NOT escaped here —
 * encoding belongs to each render sink.
 */
export const workspaceNameSchema = singleLineText(
  WORKSPACE_NAME_MAX_LENGTH,
  'WORKSPACE_NAME_REQUIRED',
  'WORKSPACE_NAME_TOO_LONG',
  'WORKSPACE_NAME_MALFORMED',
);

/**
 * The subdomain label a workspace chose for its sign-in address.
 *
 * The sign-in domain is "composed of a workspace-chosen subdomain and a fixed
 * suffix" (L779, frames 717, 719). This is the chosen part; the suffix is fixed by
 * the deployment and is not a per-workspace value, so it is not a field.
 */
export const workspaceDomainLabelSchema = z
  .string({ error: 'WORKSPACE_DOMAIN_LABEL_REQUIRED' satisfies WorkspaceRejectionCode })
  .trim()
  .min(NON_BLANK_MIN_LENGTH, {
    error: 'WORKSPACE_DOMAIN_LABEL_REQUIRED' satisfies WorkspaceRejectionCode,
  })
  .max(WORKSPACE_DOMAIN_LABEL_MAX_LENGTH, {
    error: 'WORKSPACE_DOMAIN_LABEL_TOO_LONG' satisfies WorkspaceRejectionCode,
  })
  .regex(DOMAIN_LABEL_PATTERN, {
    error: 'WORKSPACE_DOMAIN_LABEL_MALFORMED' satisfies WorkspaceRejectionCode,
  });

/**
 * A workspace's fully-qualified sign-in domain.
 *
 * Rendered as the workspace's identity on the already-signed-in list (frame 717)
 * and beneath the interpolated workspace name on its own sign-in page (frame 719).
 *
 * GOVERNED BY `S-PII` IN ONE SPECIFIC RESPECT, and it is worth stating because the
 * field looks innocuous: a workspace domain frequently IS an organisation's
 * identity, and `S-PII` requires that a value it governs never reach an application
 * log, an error report, an analytics event, A URL or A CACHE KEY. `S-AUTHZ-READ`
 * adds the cache rule independently — a cache is a read path and is keyed by tenant
 * and viewer authorization scope, never by a value like this one. Where a workspace
 * must be referenced in any of those places, `workspaceIdSchema` is what is
 * referenced.
 */
export const workspaceSignInDomainSchema = z
  .string({ error: 'WORKSPACE_SIGN_IN_DOMAIN_REQUIRED' satisfies WorkspaceRejectionCode })
  .trim()
  .min(NON_BLANK_MIN_LENGTH, {
    error: 'WORKSPACE_SIGN_IN_DOMAIN_REQUIRED' satisfies WorkspaceRejectionCode,
  })
  .max(WORKSPACE_SIGN_IN_DOMAIN_MAX_LENGTH, {
    error: 'WORKSPACE_SIGN_IN_DOMAIN_TOO_LONG' satisfies WorkspaceRejectionCode,
  })
  .regex(SIGN_IN_DOMAIN_PATTERN, {
    error: 'WORKSPACE_SIGN_IN_DOMAIN_MALFORMED' satisfies WorkspaceRejectionCode,
  });

/**
 * A workspace's language.
 *
 * `README.md` L325 lists a language among the workspace's configuration values
 * (frame 575). Shape-validated only; see `LANGUAGE_TAG_PATTERN`.
 */
export const workspaceLanguageTagSchema = z
  .string({ error: 'WORKSPACE_LANGUAGE_TAG_REQUIRED' satisfies WorkspaceRejectionCode })
  .trim()
  .min(NON_BLANK_MIN_LENGTH, {
    error: 'WORKSPACE_LANGUAGE_TAG_REQUIRED' satisfies WorkspaceRejectionCode,
  })
  .max(WORKSPACE_LANGUAGE_TAG_MAX_LENGTH, {
    error: 'WORKSPACE_LANGUAGE_TAG_TOO_LONG' satisfies WorkspaceRejectionCode,
  })
  .regex(LANGUAGE_TAG_PATTERN, {
    error: 'WORKSPACE_LANGUAGE_TAG_MALFORMED' satisfies WorkspaceRejectionCode,
  });

/**
 * A reference to the published terms of service a workspace was created under.
 *
 * The about surface renders a terms-of-service reference with a review link
 * (`README.md` L325, frame 640). What is stored is an opaque reference to a
 * published version, never its text and never an assembled address: the review link
 * is composed at render time from this reference, so the version a workspace
 * accepted stays recoverable after the published text moves on.
 */
export const termsOfServiceReferenceSchema = z
  .string({ error: 'WORKSPACE_TERMS_REFERENCE_REQUIRED' satisfies WorkspaceRejectionCode })
  .trim()
  .min(NON_BLANK_MIN_LENGTH, {
    error: 'WORKSPACE_TERMS_REFERENCE_REQUIRED' satisfies WorkspaceRejectionCode,
  })
  .max(TERMS_OF_SERVICE_REFERENCE_MAX_LENGTH, {
    error: 'WORKSPACE_TERMS_REFERENCE_TOO_LONG' satisfies WorkspaceRejectionCode,
  })
  .regex(OPAQUE_IDENTIFIER_PATTERN, {
    error: 'WORKSPACE_TERMS_REFERENCE_MALFORMED' satisfies WorkspaceRejectionCode,
  });

/**
 * A channel name, validated against the channel's own imported rule.
 *
 * Used for the workspace's default channels for new members (`README.md` L325,
 * frame 575) and for the name wizard step 4 derives.
 *
 * THE RULE IS IMPORTED, NOT RESTATED. `CHANNEL_NAME_MAX_LENGTH` and
 * `CHANNEL_NAME_PATTERN` come from `../config/constants.js`, which is the single
 * home of the rule the catalogue states as helper copy on the channel dialogs —
 * lower case, without spaces or periods, no longer than the stated cap (frames 97,
 * 69). Neither the number nor the character class appears in this module. A second
 * copy of either would let one drift from the other, and `PROJECT_RULE_R3` forbids
 * the literal at a point of use in any case.
 */
export const workspaceChannelNameSchema = z
  .string()
  .max(CHANNEL_NAME_MAX_LENGTH, {
    error: 'WORKSPACE_DEFAULT_CHANNEL_NAME_MALFORMED' satisfies WorkspaceRejectionCode,
  })
  .regex(CHANNEL_NAME_PATTERN, {
    error: 'WORKSPACE_DEFAULT_CHANNEL_NAME_MALFORMED' satisfies WorkspaceRejectionCode,
  });

/**
 * A reference to a published plan tier.
 *
 * AN OPAQUE IDENTIFIER, AND NOTHING ELSE. `README.md` L325 states that the
 * workspace's tier is "one field holding a reference to a published `E-PLAN` tier
 * and never a copy of it", chosen at workspace setup and thereafter the tier
 * currently billed (frames 17, 346, 600).
 *
 * The no-copy obligation runs in BOTH DIRECTIONS, and both are worth stating because
 * a build is likely to breach whichever one it was not warned about:
 *
 *   - NO CATALOGUE VALUE IS COPIED ONTO THE TENANT RECORD. A tier's name, its
 *     description, its positional order, its price region, its capability map and
 *     its support level are `E-PLAN`'s fields (`README.md` L341) and are resolved
 *     through this reference at read time. So this schema carries no name, no price,
 *     no currency and no feature list — a second copy of a published value would be
 *     stale the moment the catalogue changed, and the published tier is the
 *     authority.
 *   - NO TENANT VALUE IS EVER A FIELD OF THE PUBLISHED TIER. `README.md` L341
 *     records that `E-PLAN` is catalog scope, has no tenant key and is readable
 *     without a session, and that it carries "nothing about any workspace". That is
 *     a read-path boundary and not a preference: `E-PLAN` is read in full by a
 *     signed-out visitor on the public pricing page, so a workspace's chosen tier
 *     held there would publish tenant data to everyone who loaded that page.
 *
 * PER `PROJECT_RULE_R4` THE REFERENCE IS ALSO WHY NO TIER IS NAMED ANYWHERE IN THIS
 * MODULE. The corpus prints tier names on the wizard's terminal step (frame 17), and
 * the catalogue's placeholder vocabulary is explicit that plan tiers are referred to
 * by placeholder even where a frame prints a name. An opaque reference satisfies the
 * contract and the rule at once: the identifier is assigned by the build, so it
 * carries no third party's mark.
 */
export const planTierReferenceSchema = z
  .string({ error: 'PLAN_TIER_REFERENCE_REQUIRED' satisfies WorkspaceRejectionCode })
  .trim()
  .min(NON_BLANK_MIN_LENGTH, {
    error: 'PLAN_TIER_REFERENCE_REQUIRED' satisfies WorkspaceRejectionCode,
  })
  .max(PLAN_TIER_REFERENCE_MAX_LENGTH, {
    error: 'PLAN_TIER_REFERENCE_TOO_LONG' satisfies WorkspaceRejectionCode,
  })
  .regex(OPAQUE_IDENTIFIER_PATTERN, {
    error: 'PLAN_TIER_REFERENCE_MALFORMED' satisfies WorkspaceRejectionCode,
  });

/** A reference to a published plan tier. Never a name, a price or a capability. */
export type PlanTierReference = z.infer<typeof planTierReferenceSchema>;

/* ===========================================================================
 * The five-step setup wizard
 *
 * `docs/workflows/01-onboarding-and-auth.md` flow 01.4 — "the longest flow in the
 * area, and the one that establishes the `C-STEP-WIZARD` contract" — documents five
 * steps across frames 8 to 18, each asking exactly one question.
 *
 * ONE PAYLOAD PER STEP, AND FIVE SEPARATE SCHEMAS RATHER THAN ONE OBJECT OF OPTIONAL
 * FIELDS. Two reasons, and both are requirements rather than preferences. The flow
 * records as an inference that "every step's Next is gated on its own single input
 * alone" — the muted-to-filled change is observed four times, each time coinciding
 * with that step's input gaining a value and with nothing else changing — so a step
 * must be validatable IN ISOLATION, which one object of optional fields cannot
 * express. And an optional field is a field a mistake can populate: a single object
 * would let step 1's submission carry step 5's tier.
 *
 * `PROJECT_RULE_R5` bears here through single implementation. The wizard is one
 * `C-STEP-WIZARD` contract with variants, implemented once in
 * `packages/ui/src/components/StepWizard`, so this module supplies one payload per
 * step for that one component rather than a bespoke shape per surface. Nothing below
 * is specialised to a screen.
 *
 * THE WIZARD HAS NO BACK CONTROL, and no schema here models a step to return to.
 * The flow states it as an inference from the strongest evidence available: four of
 * the five steps are captured in both their empty and their filled state and none
 * renders a back affordance anywhere in the content region or beside the step label
 * (frames 8, 11, 13, 15, 17). The contract's back affordance comes from a different
 * surface — a two-step modal owned by the channels area — and this wizard is that
 * identifier's second variant, forward-only. So there is no `previousStep`, no
 * `goBack` and no step index a caller may set.
 *
 * NO STEP NAMES ITS SUBJECT. See the header: each step is scoped by the session's
 * in-progress setup, and per `PROJECT_RULE_R1` an authorization decision may not
 * rest on a caller-supplied workspace or actor identifier.
 * =========================================================================== */

/**
 * Step 1 of 5 — the workspace name, and the domain self-join policy.
 *
 * `01-onboarding-and-auth.md` flow 01.4, frames 8 to 10. The step asks for the
 * company or team name and explains that the answer becomes the workspace name; the
 * input carries a character counter at its right edge; beneath it sits a checkbox
 * offering to let anyone with the address's email domain join the workspace; the
 * forward action renders muted until the name has a value (frame 9).
 *
 * This step IS the workspace-creation request. There is no separate create payload,
 * because the wizard's first step is where a workspace comes into existence — and
 * consequently there is no workspace identifier to carry, which is the cleanest
 * possible illustration of the header's rule that no request here names its subject.
 *
 * ---------------------------------------------------------------------------
 * THE DELIBERATE DEPARTURE FROM WHAT THE FRAME RENDERS
 * ---------------------------------------------------------------------------
 *
 * THE FRAME RENDERS THE CHECKBOX PRE-TICKED. `01-onboarding-and-auth.md` L779
 * records "an email-domain self-join policy, offered as a checkbox that is
 * **pre-ticked** and names the domain" (frame 8), and flow 01.4's own step table says
 * the same. The default below is nevertheless `false`.
 *
 * THE REASON IS THE CATALOGUE'S OWN ACCEPTANCE CRITERION, at
 * `01-onboarding-and-auth.md` L929: "**Domain self-join is off by default and
 * enrolment is authorized server-side.** The policy is offered only for a domain the
 * workspace has verified it controls and never for a public or consumer-provider
 * domain; turning it on is an explicit affirmative act". A PRE-TICKED RENDERING IS A
 * RENDERING, NOT AN ACT — the same distinction the catalogue draws at L931 about the
 * marketing checkbox, where a pre-ticked box is likewise a rendering and consent is
 * recorded only from an affirmative act.
 *
 * So the two statements are not reconciled by choosing the pixel. Per
 * `PROJECT_RULE_R2` a frame governs over catalogue prose on conflict — but this is
 * not prose against a pixel. It is a rendering observation and a stated build
 * obligation, and they describe different things: what the control looked like, and
 * what the stored policy must be. The obligation governs what is STORED, and this
 * schema stores.
 *
 * WHAT FOLLOWING THE PIXEL WOULD HAVE SHIPPED: a workspace that anyone sharing an
 * email domain could join by default, including anyone holding an address at a
 * consumer email provider — which is precisely the case L929 singles out as one the
 * policy must never be offered for. That is the whole argument for the default.
 *
 * The observation is preserved rather than corrected, per `PROJECT_RULE_R2`: the
 * frame still renders what it renders, this comment records it, and nothing under
 * `docs/workflows/` is edited. The client is free to render the control ticked; what
 * it may not do is have that rendering become the stored policy without the person
 * acting.
 *
 * CONSUMER OBLIGATION, RESTATED HERE BECAUSE THIS IS THE FIELD IT ATTACHES TO. Per
 * L929 and `PROJECT_RULE_R1`: the server offers this policy only for a domain the
 * workspace has verified it controls and never for a public or consumer-provider
 * domain; every join attempt is checked server-side against the STORED policy and
 * the joiner's CONFIRMED address, so neither a client that never rendered the control
 * nor an unverified address can enrol; and every change to the policy is audited with
 * actor and time and applies only to LATER joins. This flag is an input to that
 * check. It is not the check, and setting it enrols nobody.
 */
export const workspaceSetupStepOneSchema = z.strictObject(
  {
    /** Discriminates this payload from the other four steps. */
    step: z.literal('workspace_name'),

    /**
     * The company or team name, which becomes the workspace name (frame 8). Bounded
     * by `WORKSPACE_NAME_MAX_LENGTH`, which is the counter the input renders.
     */
    name: workspaceNameSchema,

    /**
     * Whether anyone holding an address at the workspace's email domain may join
     * without an invitation.
     *
     * DEFAULTS TO `false` — see this schema's own note above for why, against a frame
     * that renders the control ticked. An absent value therefore means the policy is
     * off, which is the safe reading of silence: a client that omits the field, an
     * older client that never rendered the control, and a request that lost the field
     * in transit all produce a closed workspace rather than an open one.
     */
    allowEmailDomainSelfJoin: z.boolean().default(false),
  },
  {
    error: (issue) =>
      issue.code === 'unrecognized_keys'
        ? ('SETUP_STEP_UNKNOWN_FIELD' satisfies WorkspaceRejectionCode)
        : ('SETUP_STEP_MALFORMED' satisfies WorkspaceRejectionCode),
  },
);

/** Wizard step 1 — the workspace name and the self-join policy. */
export type WorkspaceSetupStepOne = z.infer<typeof workspaceSetupStepOneSchema>;

/**
 * Step 2 of 5 — the person's own name, and an optional photo.
 *
 * `01-onboarding-and-auth.md` flow 01.4, frames 11 and 12. The step label increments
 * and the question becomes the user's own name. Beneath the single full-name input a
 * second, explicitly OPTIONAL block appears: a label marking the profile photo
 * optional, a helper line, a placeholder avatar and a secondary upload action.
 *
 * THE PHOTO DOES NOT GATE THE STEP, and the corpus proves it rather than implying it:
 * on frame 12 the forward action becomes filled when the name gains a value while
 * "the placeholder avatar and the optional block are unchanged, confirming the photo
 * is not gating the step". The name is therefore required and the photo optional, and
 * the shapes below say exactly that.
 *
 * BOTH FIELD SHAPES ARE REUSED FROM `./user.js` RATHER THAN REDECLARED. The full name
 * is the same value a person's profile carries — the catalogue records it as
 * "collected as one field on wizard step 2 and again as a display name on the join
 * page" — and the photo is the same stored-object reference. Redeclaring either here
 * would create a second source of truth for a rule that already has one; a wizard
 * that accepted a name the profile would later reject is a broken product.
 *
 * THE PHOTO IS A REFERENCE, NEVER BYTES, AND THE CROP IS NOT THIS MODULE'S BUSINESS.
 * Flow 01.5 shows the photo being uploaded and then cropped, with the crop stage
 * previewing "the result in the shape it will actually be used" and the crop frame
 * rendered square over a portrait source (frames 20 to 22). The image itself goes
 * straight to object storage by pre-signed upload, so bytes never transit this
 * contract; the square crop is a property of what was uploaded and is enforced where
 * the upload completes, in `./file.ts`. What this field carries is the resulting
 * reference — and `avatarObjectKeySchema`'s own character class makes a data URL and
 * a raw byte string structurally inexpressible rather than merely discouraged.
 */
export const workspaceSetupStepTwoSchema = z.strictObject(
  {
    /** Discriminates this payload from the other four steps. */
    step: z.literal('your_name'),

    /**
     * The person's full name (frames 11, 12). Required: this is the input the
     * step's forward action is gated on.
     */
    fullName: fullNameSchema,

    /**
     * The stored-object reference for the profile photo, or absent where none was
     * chosen (frames 11, 12, 21, 22).
     *
     * Explicitly optional and explicitly not gating. `null` and absent both mean no
     * photo — `null` is accepted because a client that has cleared its own local
     * selection will send it, and rejecting that would fail a submission for saying
     * plainly what the absent case already means.
     */
    avatarObjectKey: avatarObjectKeySchema.nullish(),
  },
  {
    error: (issue) =>
      issue.code === 'unrecognized_keys'
        ? ('SETUP_STEP_UNKNOWN_FIELD' satisfies WorkspaceRejectionCode)
        : ('SETUP_STEP_MALFORMED' satisfies WorkspaceRejectionCode),
  },
);

/** Wizard step 2 — the person's own name, plus an optional photo. */
export type WorkspaceSetupStepTwo = z.infer<typeof workspaceSetupStepTwoSchema>;

/**
 * The three ways wizard step 3 can conclude.
 *
 * `01-onboarding-and-auth.md` flow 01.4, frames 13 and 14. The step's field is
 * labelled add-coworker-by-email and each committed value renders as a removable chip
 * (`C-CHIP-INPUT`, frame 14). Beneath the muted forward action sit TWO ADDITIONAL
 * ACTIONS — a copy-invite-link action and a skip-this-step action (frame 13).
 *
 * ALL THREE OUTCOMES ARE MODELLED, INCLUDING THE TWO THE CORPUS NEVER CAPTURES. The
 * flow closes with an explicit note: "step 3's copy-invite-link and skip-this-step
 * actions are both visible but neither result is captured" (frame 13). Per
 * `PROJECT_RULE_R3` a partial capture is an open work item and never permission to
 * omit, so the two uncaptured outcomes are first-class members of this union rather
 * than absent from it. Each is a deliberate implemented choice:
 *
 *   - `invite` — the captured outcome. Carries the addresses the field collected.
 *   - `copy_invite_link` — the person asked for a shareable link instead. It carries
 *     NO PAYLOAD, and that is the design decision: the link is an `S-SECRET` class-B
 *     capability link, so the request is a request to ISSUE one and the value comes
 *     back in the response, generated server-side. A link a caller could supply would
 *     be a capability a caller could choose.
 *   - `skip` — the person declined the step. It carries no payload because there is
 *     nothing to carry; it is a distinct outcome rather than an empty `invite`
 *     precisely so that "invited nobody deliberately" is distinguishable from
 *     "submitted an empty field", which is what makes `SETUP_INVITEES_REQUIRED` a
 *     usable rejection.
 *
 * A discriminated union rather than one object with optional fields, for the reason
 * the rest of this module uses them: an optional field is a field a mistake can
 * populate, and here a mistake would mean a skip that silently carried addresses.
 */
export const workspaceSetupInviteeOutcomeSchema = z.discriminatedUnion(
  'kind',
  [
    z.strictObject({
      /** The captured outcome: addresses were committed as chips (frame 14). */
      kind: z.literal('invite'),

      /**
       * The addresses the field collected, each rendered as a removable chip.
       *
       * The element schema is `./user.js`'s address contract, imported rather than
       * restated, so the bound and the validation are the product's one address rule.
       * Its rejections therefore carry that module's codes — see the note above the
       * rejection-code union.
       *
       * Bounded at both ends. At least one, because an `invite` outcome that invited
       * nobody is a `skip` and should say so. At most `SETUP_MAX_INVITEES`, because an
       * unbounded array on a setup route is a bulk-mail amplifier. Duplicates are
       * refused rather than silently collapsed: collapsing would make the number of
       * invitations differ from the number of chips the person committed, and a person
       * who sees two chips and causes one invitation has been misled by the interface.
       *
       * THIS STEP ONLY COLLECTS ADDRESSES. The invitation contract itself — the role,
       * the channel scope, the note, the absolute expiry, and the class-B link — lives
       * in `./invitation.ts` and is not duplicated here.
       */
      emailAddresses: z
        .array(emailAddressSchema)
        .min(SETUP_MIN_INVITEES, {
          error: 'SETUP_INVITEES_REQUIRED' satisfies WorkspaceRejectionCode,
        })
        .max(SETUP_MAX_INVITEES, {
          error: 'SETUP_INVITEES_TOO_MANY' satisfies WorkspaceRejectionCode,
        })
        .refine((addresses) => new Set(addresses).size === addresses.length, {
          error: 'SETUP_INVITEES_DUPLICATED' satisfies WorkspaceRejectionCode,
        }),
    }),

    z.strictObject({
      /**
       * The person asked for a shareable invite link instead (frame 13; uncaptured
       * result, implemented per `PROJECT_RULE_R3`). No payload — the link is issued
       * server-side.
       */
      kind: z.literal('copy_invite_link'),
    }),

    z.strictObject({
      /**
       * The person declined the step (frame 13; uncaptured result, implemented per
       * `PROJECT_RULE_R3`). No payload.
       */
      kind: z.literal('skip'),
    }),
  ],
  { error: 'SETUP_INVITEE_OUTCOME_UNRECOGNISED' satisfies WorkspaceRejectionCode },
);

/** How wizard step 3 concluded. */
export type WorkspaceSetupInviteeOutcome = z.infer<typeof workspaceSetupInviteeOutcomeSchema>;

/**
 * Step 3 of 5 — the invitees.
 *
 * `01-onboarding-and-auth.md` flow 01.4, frames 13 and 14. The question asks who else
 * is on the team, interpolating the workspace name; committed addresses render as
 * removable chips; two alternative actions sit beneath the forward action.
 *
 * One payload schema like every other step, with the three-way outcome nested as a
 * field rather than fanned out into three sibling step schemas. That keeps the outer
 * step union discriminated cleanly on `step` alone, and keeps this module's promise of
 * one payload per step.
 */
export const workspaceSetupStepThreeSchema = z.strictObject(
  {
    /** Discriminates this payload from the other four steps. */
    step: z.literal('invitees'),

    /** Which of the step's three outcomes occurred, with its payload if it has one. */
    outcome: workspaceSetupInviteeOutcomeSchema,
  },
  {
    error: (issue) =>
      issue.code === 'unrecognized_keys'
        ? ('SETUP_STEP_UNKNOWN_FIELD' satisfies WorkspaceRejectionCode)
        : ('SETUP_STEP_MALFORMED' satisfies WorkspaceRejectionCode),
  },
);

/** Wizard step 3 — the invitees, or the link, or the skip. */
export type WorkspaceSetupStepThree = z.infer<typeof workspaceSetupStepThreeSchema>;

/* ---------------------------------------------------------------------------
 * Step 4's derivation, which is a rule and therefore lives in one place
 * --------------------------------------------------------------------------- */

/**
 * The separator the derivation joins words with.
 *
 * The hyphen, because the corpus shows the derived name "lower-cased and hyphenated"
 * (frame 16). It is a named constant rather than a literal at three points of use
 * inside the function below, for the same reason every bound in this module is.
 */
const DERIVED_CHANNEL_NAME_SEPARATOR = '-';

/**
 * The outcome of deriving a channel name from a setup answer.
 *
 * A discriminated result rather than a thrown error or a nullable string. Three
 * reasons: a caller must be able to distinguish "no name could be formed" from "the
 * name formed is not a legal channel name", the two failures carry different codes,
 * and a total function is testable without a try block. The reason is one of this
 * module's own rejection codes, so a client maps it to copy exactly as it maps every
 * other rejection.
 */
export type DerivedChannelNameResult =
  | { readonly ok: true; readonly channelName: string }
  | { readonly ok: false; readonly reason: WorkspaceRejectionCode };

/**
 * Reports whether a single character is permitted inside a channel name.
 *
 * IT ASKS THE IMPORTED PATTERN RATHER THAN RE-AUTHORING IT, which is the whole point.
 * The channel-name character rule has exactly one home — `../config/constants.js` —
 * and the derivation below needs to know which characters to keep. Enumerating them
 * here would be a second copy of the rule, free to drift from the first; testing each
 * character against the imported pattern instead means the derivation is defined by
 * the rule rather than merely consistent with it, and a later change to the rule
 * changes the derivation with it and cannot fail to.
 *
 * This relies on two documented properties of that pattern: it is anchored, and it
 * admits single characters. Both are stated in its own doc comment, along with the
 * deliberate absence of a global flag — a global pattern keeps a mutable `lastIndex`
 * between calls and would give different answers to the same question depending on
 * what was asked before it, which per-character testing would expose immediately.
 */
const isPermittedInChannelName = (character: string): boolean =>
  CHANNEL_NAME_PATTERN.test(character);

/**
 * Derives a channel name from wizard step 4's free-text answer.
 *
 * `01-onboarding-and-auth.md` flow 01.4, frames 15 and 16: as the answer is typed,
 * "the sidebar's channels group gains a channel whose name is derived from the answer
 * — LOWER-CASED AND HYPHENATED". `L779` records the same field on the entity, "a first
 * channel derived from the setup answer, lower-cased and hyphenated" (frame 16).
 *
 * THE RULE LIVES HERE, ONCE. The client renders the preview the sidebar shows and the
 * server creates the channel, and both call this function, so the name a person is
 * shown and the name that is created cannot disagree. A second implementation of this
 * transform on either side would be exactly the divergence `PROJECT_RULE_R5`'s
 * single-implementation discipline exists to prevent.
 *
 * WHAT IT DOES, in order:
 *   1. Normalises to the module's canonical composed form, so that the same answer
 *      typed two ways derives one name.
 *   2. Lower-cases it — the first of the two transformations the frame evidences.
 *      Locale-independent, because a name is an identifier and must not depend on
 *      where the person typing it happens to be.
 *   3. Replaces every run of characters a channel name may not carry with a single
 *      separator — the second transformation the frame evidences. A run collapses to
 *      one separator, so a space followed by a comma does not produce two.
 *   4. Trims separators from both ends, because the imported pattern would refuse a
 *      leading or trailing one and a person who typed a trailing full stop did not
 *      ask for a trailing hyphen.
 *   5. VALIDATES THE RESULT against the imported pattern and the imported cap. This
 *      final check is a backstop rather than a formality: it is what guarantees the
 *      returned name is a legal channel name even if a future change to the rule makes
 *      step 3's per-character filter insufficient.
 *
 * WHAT IT WILL NOT DO — and this is the requirement that shapes the return type. It
 * never substitutes a name of its own. An answer that yields nothing usable, and an
 * answer that yields something too long or otherwise illegal, are both REJECTED with
 * their own distinct codes. `S-CONTENT` requires "rejection of a value that fails its
 * declared shape rather than silent truncation", and inventing a fallback name would
 * be worse than truncating: the person would be shown a channel they never named.
 *
 * Note that a long answer is the ordinary route to the second rejection.
 * `SETUP_FOCUS_ANSWER_MAX_LENGTH` is independent of the channel-name cap on purpose,
 * so an answer may be perfectly valid prose and still be unable to become a handle.
 * That case surfaces as a rejection a client can render beside the field, which is the
 * honest outcome.
 *
 * @param answer The free-text answer collected by step 4.
 * @returns The derived name, or the code explaining why no name could be derived.
 */
export const deriveChannelNameFromFocusAnswer = (answer: string): DerivedChannelNameResult => {
  const canonical = toCanonicalUnicodeForm(answer).toLowerCase();

  let derived = '';
  let pendingSeparator = false;

  for (const character of canonical) {
    if (isPermittedInChannelName(character) && character !== DERIVED_CHANNEL_NAME_SEPARATOR) {
      if (pendingSeparator && derived.length > 0) {
        derived += DERIVED_CHANNEL_NAME_SEPARATOR;
      }
      pendingSeparator = false;
      derived += character;
      continue;
    }
    // Every other character — whitespace, punctuation, a symbol, or the separator
    // itself — becomes at most one separator, and only once a retained character
    // follows it. Deferring the separator this way is what collapses a run and what
    // keeps one off each end without a second trimming pass.
    pendingSeparator = true;
  }

  if (derived.length === 0) {
    return { ok: false, reason: 'SETUP_FOCUS_ANSWER_YIELDS_NO_CHANNEL_NAME' };
  }

  if (derived.length > CHANNEL_NAME_MAX_LENGTH || !CHANNEL_NAME_PATTERN.test(derived)) {
    return { ok: false, reason: 'SETUP_FOCUS_ANSWER_YIELDS_INVALID_CHANNEL_NAME' };
  }

  return { ok: true, channelName: derived };
};

/**
 * Step 4 of 5 — what the team is working on right now.
 *
 * `01-onboarding-and-auth.md` flow 01.4, frames 15 and 16. The question asks what the
 * team is working on right now, the helper offers four kinds of answer, and a single
 * input carries an example placeholder. As the answer is typed the sidebar's channels
 * group gains the channel derived from it.
 *
 * The step validates the answer AND the name it derives, because a shape that accepted
 * an answer no channel could be created from would be accepting a step that cannot
 * complete. The derivation's two failures reach the caller as their own distinct
 * codes, so a client can say which of the two happened rather than reporting a generic
 * invalid answer.
 */
export const workspaceSetupStepFourSchema = z.strictObject(
  {
    /** Discriminates this payload from the other four steps. */
    step: z.literal('focus'),

    /**
     * The free-text answer (frames 15, 16), carrying the full `S-CONTENT` input
     * discipline and then checked for derivability.
     *
     * The derivation check is a refinement rather than a transform, so what crosses
     * the wire and what is stored remain the person's own answer. The derived name is
     * a separate value that the server creates a channel under, obtained by calling
     * `deriveChannelNameFromFocusAnswer` — the same function this refinement uses, so
     * a payload that validates is a payload whose channel can be created.
     */
    answer: singleLineText(
      SETUP_FOCUS_ANSWER_MAX_LENGTH,
      'SETUP_FOCUS_ANSWER_REQUIRED',
      'SETUP_FOCUS_ANSWER_TOO_LONG',
      'SETUP_FOCUS_ANSWER_MALFORMED',
    ).superRefine((value, context) => {
      const derivation = deriveChannelNameFromFocusAnswer(value);
      if (!derivation.ok) {
        context.addIssue({ code: 'custom', message: derivation.reason });
      }
    }),
  },
  {
    error: (issue) =>
      issue.code === 'unrecognized_keys'
        ? ('SETUP_STEP_UNKNOWN_FIELD' satisfies WorkspaceRejectionCode)
        : ('SETUP_STEP_MALFORMED' satisfies WorkspaceRejectionCode),
  },
);

/** Wizard step 4 — the focus answer the first channel is named from. */
export type WorkspaceSetupStepFour = z.infer<typeof workspaceSetupStepFourSchema>;

/**
 * Step 5 of 5 — the plan choice, which is where the wizard ends.
 *
 * `01-onboarding-and-auth.md` flow 01.4, frames 17 and 18. "The wizard ends on a plan
 * chooser rather than a Finish button" (frame 17), and choosing replaces the chosen
 * card's action with a progress indicator while the sibling card's action is
 * simultaneously rendered muted (frame 18).
 *
 * ONE FIELD, AND IT IS A REFERENCE. `README.md` L325 states the workspace's tier is
 * "one field holding a reference to a published `E-PLAN` tier and never a copy of it",
 * "chosen at workspace setup and thereafter the tier currently billed" (frames 17,
 * 346, 600), and `01-onboarding-and-auth.md` L788 adds that what this step WRITES is
 * not a field of `E-PLAN` at all: it populates the workspace's own commercial-position
 * group, "as a reference to the published tier, never as a copy of it". See
 * `planTierReferenceSchema` for both directions of that obligation.
 *
 * WHAT THE FRAME RENDERS AND THIS SCHEMA DOES NOT CARRY. Frame 17's two cards carry a
 * tier name, a descriptive pill badge, a zero price with its currency, a
 * per-person-per-month unit line, a percentage-off headline, a struck original price
 * beside a discounted one, and a three-item feature list each. None of it is a field
 * here. Two independent reasons, either of which would be sufficient: every one of
 * those values is `E-PLAN`'s and is resolved through the reference rather than copied,
 * and per `PROJECT_RULE_R4` a plan tier is referred to by placeholder even where a
 * frame prints its name — a transcribed tier name is a third party's mark.
 *
 * NO PAYMENT ANYTHING. Billing, payments and plan purchase are out of scope for this
 * run: `S-PAYMENT` requires provider-hosted collection and forbids an instrument's
 * number and security code from entering application storage at all, and `S-SECRET`
 * class C holds the provider token that stands in for a stored instrument. Neither
 * appears in this module, and neither may be added to it — a choice of tier is not a
 * purchase, and this step is the choice.
 */
export const workspaceSetupStepFiveSchema = z.strictObject(
  {
    /** Discriminates this payload from the other four steps. */
    step: z.literal('plan'),

    /**
     * The chosen tier, as an opaque reference to a published tier (frame 17).
     *
     * Required: the wizard ends on the chooser, so there is no terminal step that
     * omits it. Never a name, never a price, never a currency, never a feature list.
     */
    planTierReference: planTierReferenceSchema,
  },
  {
    error: (issue) =>
      issue.code === 'unrecognized_keys'
        ? ('SETUP_STEP_UNKNOWN_FIELD' satisfies WorkspaceRejectionCode)
        : ('SETUP_STEP_MALFORMED' satisfies WorkspaceRejectionCode),
  },
);

/** Wizard step 5 — the plan choice, held as a reference. */
export type WorkspaceSetupStepFive = z.infer<typeof workspaceSetupStepFiveSchema>;

/**
 * Any one of the wizard's five step payloads, discriminated by its step.
 *
 * Provided because the wizard is one `C-STEP-WIZARD` contract advancing through five
 * steps, so an API that accepts the steps through ONE endpoint needs one schema for
 * the body. Discriminated on `step`, so a submission is matched against exactly the
 * one step it names rather than tried against all five — which is what makes a
 * rejection report the failing field instead of five sets of unrelated issues.
 *
 * The five members remain individually exported and individually usable. An endpoint
 * per step is equally well served, and a client validating one step before submitting
 * it uses that step's own schema; this union is a convenience over them and never a
 * replacement for them.
 *
 * NO STEP INDEX, AND NO WAY BACK. The discriminator names WHICH step a payload is, not
 * where the person is in the sequence — position is the server's to know, from the
 * session's in-progress setup. And there is no back affordance to model: see the
 * section note above, and frames 8, 11, 13, 15, 17.
 */
export const workspaceSetupStepSchema = z.discriminatedUnion(
  'step',
  [
    workspaceSetupStepOneSchema,
    workspaceSetupStepTwoSchema,
    workspaceSetupStepThreeSchema,
    workspaceSetupStepFourSchema,
    workspaceSetupStepFiveSchema,
  ],
  { error: 'SETUP_STEP_UNRECOGNISED' satisfies WorkspaceRejectionCode },
);

/** Any one of the wizard's five step payloads. */
export type WorkspaceSetupStep = z.infer<typeof workspaceSetupStepSchema>;

/* ===========================================================================
 * The commercial-position field group
 * =========================================================================== */

/**
 * The workspace's commercial position — a NESTED FIELD GROUP, deliberately.
 *
 * `docs/workflows/README.md` L325 is unusually emphatic about this placement, and the
 * emphasis is the reason this is a nested group rather than a column beside the name.
 * The about surface prints the workspace's tier as a label-and-value row (frame 640),
 * and the catalogue says of that rendering: the tier is "deliberately not" among the
 * identity fields, "because a rendering is not a placement", the printed value "is
 * resolved from the commercial position field group", and "A BUILD MUST NOT KEEP A
 * SECOND COPY OF TENANT PLAN STATE AMONG THE IDENTITY FIELDS".
 *
 * A flat `planTierReference` on the workspace shape would be exactly that second copy
 * among the identity fields. Nesting it uses the catalogue's own field-group device,
 * which it introduces precisely for "a cluster of values that clearly belongs to an
 * entity but must be authorized, retained or scoped separately from the rest of it". A
 * build may persist the group as its own table keyed by the workspace; what the group
 * fixes is WHERE THE VALUES BELONG.
 *
 * THE GROUP IS THE TENANT'S AND NEVER THE PUBLISHED TIER'S. `README.md` L341 records
 * that `E-PLAN` is catalog scope, has no tenant key, is readable without a session and
 * carries "nothing about any workspace"; L325 states the mirror obligation, that no
 * catalogue value is a field of a tenant record. Both directions are enforced by this
 * group holding a reference and nothing else. See `planTierReferenceSchema`.
 *
 * ---------------------------------------------------------------------------
 * REDUCED TO ITS ONE IN-SCOPE MEMBER, AND WHAT THAT EXCLUDES
 * ---------------------------------------------------------------------------
 *
 * `README.md` L325 lists four clusters in this group — the chosen and currently-billed
 * tier, the trial, the applied promotion and the resolved entitlement set — and five
 * further commercial groups beside it: the billing account, the stored payment method,
 * the billing contacts, the billing history entries and the renewal estimate.
 *
 * Billing, payments and plan purchase are out of scope for this run, so this group
 * carries THE TIER REFERENCE ALONE. There is no trial state, no applied promotion, no
 * entitlement set, no billing address, no currency, no payment instrument, no billing
 * contact, no billing history entry and no renewal estimate anywhere in this module.
 * The absences are named rather than silent, for the same reason the catalogue names
 * the credential artefacts it excludes: so that a later reader cannot mistake absence
 * for oversight, and so that whoever adds the commercial phase adds them HERE rather
 * than beside the identity fields.
 *
 * AND NO PAYMENT CREDENTIAL, OF ANY KIND. `S-PAYMENT` requires provider-hosted
 * collection and forbids an instrument's number and security code from entering
 * application storage, logs or exports at all. The provider token that stands in for a
 * stored instrument afterwards is `S-SECRET`'s single class-C secret — envelope-
 * encrypted in a key-managed store, decrypted only inside the provider-integration
 * component — and `S-SECRET`'s closing consequence names this entity explicitly,
 * "including of its commercial and payment field groups". So this group holds neither
 * the credential nor a pointer to one, and a future stored-payment-method group holds
 * the opaque record identifier rather than the value.
 *
 * ---------------------------------------------------------------------------
 * FIRST POPULATED BY A CHOICE, NEVER DEFAULTED
 * ---------------------------------------------------------------------------
 *
 * `README.md` L325 states the tier is "chosen at workspace setup and thereafter the
 * tier currently billed, so this group is FIRST POPULATED BY THAT CHOICE RATHER THAN
 * DEFAULTED", and `01-onboarding-and-auth.md` L792 says the same: the wizard's terminal
 * step "is where this group is first populated rather than defaulted".
 *
 * That is why the group is nullable on the workspace shape below rather than carrying a
 * default tier. A workspace mid-wizard genuinely has no commercial position, and `null`
 * says so honestly; inventing a default tier would be asserting a commercial fact
 * nobody chose.
 */
export const workspaceCommercialPositionSchema = z.strictObject({
  /**
   * The chosen and currently-billed tier, held as a reference to a published tier
   * (frames 17, 346, 600). The group's only member in this run — see the note above
   * for the four clusters and five sibling groups that are deliberately absent.
   */
  planTierReference: planTierReferenceSchema,
});

/** The workspace's commercial position. Holds a tier reference and nothing else. */
export type WorkspaceCommercialPosition = z.infer<typeof workspaceCommercialPositionSchema>;

/* ===========================================================================
 * The workspace
 * =========================================================================== */

/**
 * A workspace — the tenant every other row in this product hangs off.
 *
 * Modelled from `docs/workflows/README.md` L325 (`E-WORKSPACE`) and the contributions
 * `docs/workflows/01-onboarding-and-auth.md` L779 reports upward to it. Every field
 * cites the catalogue location and the frame NUMBER that evidences it; filenames are
 * never cited, because each of the 1,022 embeds a third-party product name.
 *
 * ISOLATION IS NOT A FIELD OF THIS SHAPE, AND THAT IS THE POINT. Per
 * `PROJECT_RULE_R1` every read path enforces workspace isolation such that no query
 * can return a row belonging to a workspace the requesting session does not belong to.
 * That is enforced BELOW every caller, by the client extension in
 * `packages/db/src/tenancy.ts`, bound to the authenticated session by
 * `apps/api/src/db/tenancy.ts` — so the workspace identifier a query is scoped to can
 * only ever originate server-side. Nothing in this shape, and no request in this
 * module, is where that decision is taken.
 *
 * WHAT IS DELIBERATELY ABSENT — see the module header for the full account: no
 * credential of any class, no commercial value beyond the nested reference group, and
 * no duration.
 */
export const workspaceSchema = z.strictObject({
  /** The opaque record identifier. See `workspaceIdSchema`. */
  id: workspaceIdSchema,

  /**
   * The workspace name, collected on wizard step 1 and "interpolated into headings,
   * sidebar headers and modal titles thereafter" (`01-onboarding-and-auth.md` L779,
   * frames 8, 9, 40; `README.md` L325, frame 640).
   *
   * Escaped by each render sink at render time, never here — see the module header.
   */
  name: workspaceNameSchema,

  /**
   * The fully-qualified sign-in domain, "composed of a workspace-chosen subdomain and a
   * fixed suffix" (`01-onboarding-and-auth.md` L779, frames 717, 719; `README.md` L325,
   * frame 640).
   *
   * The whole value is stored rather than assembled per read, so that a change to the
   * deployment's suffix cannot silently retarget an address a person already uses. The
   * chosen label remains available as `domainLabel` for the surfaces that edit it.
   *
   * Governed by `S-PII` in the respect `workspaceSignInDomainSchema` sets out: never in
   * a log, an error report, an analytics event, a URL or a cache key.
   */
  signInDomain: workspaceSignInDomainSchema,

  /**
   * The subdomain label the workspace chose (frames 717, 719).
   *
   * Held alongside the fully-qualified value rather than parsed back out of it: parsing
   * would have to know the suffix, which is deployment configuration and not a property
   * of this record.
   */
  domainLabel: workspaceDomainLabelSchema,

  /**
   * The stored-object reference for the workspace icon, "rendered as a square tile in
   * the rail and on every chooser row" (`01-onboarding-and-auth.md` L779, frames 15,
   * 744; `README.md` L325, frame 640), or `null` where none was set.
   *
   * A REFERENCE AND NEVER BYTES. The contract is `./user.js`'s stored-object reference,
   * imported rather than redeclared: a reference to a stored object is one rule whatever
   * the object depicts, and that schema's character class already makes a data URL and a
   * raw byte string inexpressible while its parent-directory rejection stops a reference
   * being aimed at an object the uploader was never given. Declaring a near-identical
   * icon rule here would be a second copy of both protections.
   */
  iconObjectKey: avatarObjectKeySchema.nullable(),

  /**
   * The absolute instant the workspace was created (`README.md` L325, frame 640).
   *
   * AN ABSOLUTE INSTANT, NEVER A DURATION, and the schema enforces it structurally:
   * `z.iso.datetime()` requires a UTC-designated instant, so an age in days or a bare
   * calendar date cannot parse at all. Per `PROJECT_RULE_R3` a record stores an absolute
   * timestamp so that a configured default can change without invalidating what is
   * already stored. Any "created N days ago" phrasing a surface renders is derived from
   * this value at render time and is not a field.
   */
  createdAt: z.iso.datetime({
    error: 'WORKSPACE_CREATED_AT_NOT_AN_INSTANT' satisfies WorkspaceRejectionCode,
  }),

  /**
   * A reference to the published terms of service the workspace was created under
   * (`README.md` L325, frame 640, where it is rendered with a review link).
   */
  termsOfServiceReference: termsOfServiceReferenceSchema,

  /**
   * How a person may come to be a member (`README.md` L325, frame 575).
   *
   * A stored policy and never a grant: per `01-onboarding-and-auth.md` L929 every join
   * attempt is checked server-side against this policy AND the joiner's confirmed
   * address, and per `PROJECT_RULE_R1` that check is at the point of execution. See
   * `WORKSPACE_JOINING_POLICIES`.
   */
  joiningPolicy: workspaceJoiningPolicySchema,

  /**
   * The email domain whose holders the self-join policy admits, or `null` where none is
   * configured (`README.md` L325, frame 653 — "an email domain that permits
   * self-joining"; `01-onboarding-and-auth.md` L779, frame 8, where the checkbox names
   * the domain).
   *
   * `null` IS THE DEFAULT STATE, matching `allowEmailDomainSelfJoin` below. Per L929 the
   * policy "is offered only for a domain the workspace has verified it controls and never
   * for a public or consumer-provider domain" — this field records which domain was
   * configured; it does not and cannot establish that control was verified or that the
   * domain is not a consumer provider. Both are server-side determinations, and both are
   * preconditions for the flag beside it having any effect.
   */
  selfJoinEmailDomain: workspaceSignInDomainSchema.nullable(),

  /**
   * Whether holders of `selfJoinEmailDomain` may join without an invitation
   * (`01-onboarding-and-auth.md` L779, frame 8; `README.md` L325, frame 653).
   *
   * DEFAULTS TO `false`, exactly as wizard step 1 does, and for the same reason: L929
   * states domain self-join is off by default and turning it on is an explicit
   * affirmative act, while frame 8 renders the control pre-ticked. The stored policy
   * follows the obligation, not the rendering — see `workspaceSetupStepOneSchema` for
   * the full argument, which is not repeated here so that it has one home.
   *
   * The default is declared on the stored shape as well as on the request so that a
   * workspace materialised by any path — the wizard, a migration, a fixture — is closed
   * unless something opened it deliberately.
   */
  allowEmailDomainSelfJoin: z.boolean().default(false),

  /**
   * Whether joining by a shareable invite link is permitted (`README.md` L325, frame 653
   * — "invite-link configuration").
   *
   * A POLICY, NOT A LINK. Per `01-onboarding-and-auth.md` L908 the invite link is an
   * `S-SECRET` class-B reusable capability link whose redeemable value is "never a field
   * of `E-INVITATION`, `E-WORKSPACE` or any other entity a read path returns" — only a
   * keyed verifier of its secret part is stored, against the link's own record. So this
   * boolean says whether the mechanism is enabled and carries no token, no selector and
   * no verifier.
   *
   * The link's EXPIRY is likewise not here. It is a property of the link, resolved at
   * issuance into an absolute instant on `./invitation.ts`'s record, from a configurable
   * default in `../config/env.js`. No number of days appears in this module.
   */
  inviteLinkEnabled: z.boolean(),

  /**
   * Who may invite a person into this workspace (`01-onboarding-and-auth.md` L779, frame
   * 52 — "an invitation permission that can be restricted to owners and
   * administrators").
   *
   * Descriptive of stored policy. The refusal of an invitation from an unentitled caller
   * happens in `apps/api/src/authz/`, per `PROJECT_RULE_R1`.
   */
  invitationPermission: workspaceInvitationPermissionSchema,

  /** The workspace's language (`README.md` L325, frame 575). */
  language: workspaceLanguageTagSchema,

  /**
   * Which of a person's two names this workspace renders by default (`README.md` L325,
   * frame 575). See `WORKSPACE_DISPLAY_NAME_POLICIES`.
   */
  displayNamePolicy: workspaceDisplayNamePolicySchema,

  /**
   * The channels a new member is added to (`README.md` L325, frame 575;
   * `01-onboarding-and-auth.md` L779, frame 44, where the invite modal's helper text
   * refers to them).
   *
   * Held as channel NAMES validated against the channel's own imported rule, so a
   * default that could not be a channel name cannot be stored. Bounded by
   * `WORKSPACE_MAX_DEFAULT_CHANNELS` and refused rather than de-duplicated for the same
   * reason the invitee list is: collapsing silently would make the stored configuration
   * differ from what was submitted.
   */
  defaultChannelsForNewMembers: z
    .array(workspaceChannelNameSchema)
    .max(WORKSPACE_MAX_DEFAULT_CHANNELS, {
      error: 'WORKSPACE_DEFAULT_CHANNELS_TOO_MANY' satisfies WorkspaceRejectionCode,
    })
    .refine((names) => new Set(names).size === names.length, {
      error: 'WORKSPACE_DEFAULT_CHANNELS_DUPLICATED' satisfies WorkspaceRejectionCode,
    }),

  /**
   * The commercial position, or `null` until the wizard's terminal step populates it.
   *
   * A nested field group, holding a tier reference and nothing else. See
   * `workspaceCommercialPositionSchema` for why the placement is a requirement rather
   * than a preference, and for the full list of commercial values deliberately absent
   * from this run.
   */
  commercialPosition: workspaceCommercialPositionSchema.nullable(),
});

/**
 * A workspace.
 *
 * Carries no credential of any class, no commercial value beyond a nested tier
 * reference, and no duration. See the module header.
 */
export type Workspace = z.infer<typeof workspaceSchema>;

/* ===========================================================================
 * The workspace-summary projection
 * =========================================================================== */

/**
 * The compact workspace shape the switcher, the workspace menu and the chooser render
 * from.
 *
 * ONE DEFINITION, MANY CONSUMERS. The already-signed-in list on the workspace sign-in
 * page (frame 717), the same list on the workspace's own sign-in page (frame 719) and
 * the welcome-back chooser's rows (frame 731) all render this shape, and per
 * `PROJECT_RULE_R5` it is declared here exactly once so that neither `packages/ui` nor
 * `apps/web` declares a chooser-row or switcher-row shape of its own. A second
 * declaration would be a defect even if it happened to match.
 *
 * The field set is what the corpus evidences those surfaces rendering:
 *   - frame 717 — the already-signed-in section lists a workspace row as A DOMAIN with a
 *     secondary open action.
 *   - frame 719 — the heading interpolates the WORKSPACE NAME with the fully-qualified
 *     sign-in domain beneath it.
 *   - frame 731 — each row carries a square WORKSPACE ICON, the workspace name, a
 *     facepile with a MEMBER COUNT, and a trailing arrow. The catalogue records that the
 *     count is "a real per-workspace value rather than a decorative facepile, because the
 *     two rows carry different counts and one of them reads zero — a value no facepile
 *     could render".
 *
 * ---------------------------------------------------------------------------
 * IT PROJECTS THE WORKSPACE IDENTITY AND NEVER THE CREDENTIAL
 * ---------------------------------------------------------------------------
 *
 * `01-onboarding-and-auth.md` L778 states it of this exact surface: the already-signed-in
 * list "projects only the workspace identity, never the credential". The list exists
 * because a session for another workspace exists, and the session is an `S-SECRET`
 * class-A revocable server-side record — so what the row renders is which workspace, and
 * never anything that could be replayed to enter it. There is consequently no session
 * identifier, no bearer value, no selector and no verifier on this shape.
 *
 * ---------------------------------------------------------------------------
 * A PROJECTION IS A READ PATH, AND THE COUNT IS ITSELF A PROJECTION
 * ---------------------------------------------------------------------------
 *
 * Per `PROJECT_RULE_R1` a projection is authorized INDEPENDENTLY, on every read path
 * that produces it, and its presence in a response is never inferred from the enclosing
 * surface having loaded. `S-AUTHZ-READ` (`00-product-overview.md` L506) fixes where that
 * check runs: server-side, inside the data-access path, BEFORE any record, count, facet
 * or aggregate is serialised — so the authorized set is what the query returns, and
 * filtering afterwards is not authorization. It also makes two further points that bear
 * directly on this shape: "A COUNT IS A PROJECTION", because a total computed over
 * content the viewer may not read discloses that the content exists; and "a cache is a
 * read path", keyed by tenant and viewer authorization scope rather than by object
 * identity.
 *
 * THAT IS WHY `memberCount` LIVES HERE AND IS NOT A FIELD OF `workspaceSchema`. It is
 * computed per read over the authorized set within the same query that returns the row,
 * never stored as a denormalised counter — a stored counter would be a single number
 * serving every viewer, which is the definition of a count computed outside anyone's
 * authorized set. Zero is a legitimate value, as frame 731 shows.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT OMITS, AND WHY
 * ---------------------------------------------------------------------------
 *
 * The chooser is a list, and a list is rendered many rows at a time, so this shape
 * carries only what a row draws. No joining policy, no self-join domain, no invitation
 * permission, no default channels, no display-name policy and NO COMMERCIAL POSITION: a
 * projection that carries more than its consumers render is a disclosure waiting for a
 * consumer that leaks it, and the tier in particular is read only under
 * `S-AUTHZ-READ` and has no business on a pre-session surface.
 *
 * Per `S-PERUSER` (`00-product-overview.md` L562) nothing per-viewer is here either. The
 * test is one question — if two people opened this at the same moment, could they
 * legitimately see different values? — so a starred flag, an unread count, a last-opened
 * timestamp and a sidebar position all belong on a relation keyed by the viewer and the
 * workspace, never on this shape or on the workspace itself. The member count is the
 * interesting near-miss and it is not an exception: it differs per viewer only because
 * it is computed over the viewer's authorized set, which is what makes it a projection
 * rather than a stored per-viewer fact.
 */
export const workspaceSummarySchema = z.strictObject({
  /** The opaque identifier. The only value here a client may send back. */
  id: workspaceIdSchema,

  /** The workspace name, rendered on every chooser row and interpolated into the
   * sign-in heading (frames 719, 731). */
  name: workspaceNameSchema,

  /**
   * The fully-qualified sign-in domain — the value the already-signed-in row renders as
   * the workspace's identity (frame 717) and the sign-in page renders beneath the name
   * (frame 719).
   */
  signInDomain: workspaceSignInDomainSchema,

  /**
   * The square icon tile's stored-object reference, or `null` where none was set
   * (frames 15, 744, 731). The consumer renders an initial-derived tile instead, which
   * is what the rail already does for a workspace without an icon.
   */
  iconObjectKey: avatarObjectKeySchema.nullable(),

  /**
   * The member count rendered beside the facepile (frame 731).
   *
   * A PROJECTION, NOT A STORED COLUMN — see this schema's own note. A non-negative
   * integer, because zero is evidenced and a negative count is not a count.
   */
  memberCount: z
    .int()
    .nonnegative({ error: 'WORKSPACE_MEMBER_COUNT_NOT_A_COUNT' satisfies WorkspaceRejectionCode }),
});

/**
 * The compact workspace shape every switcher, menu and chooser row renders from.
 *
 * Projects the workspace identity and never the credential; see the schema's own note.
 */
export type WorkspaceSummary = z.infer<typeof workspaceSummarySchema>;

/* ===========================================================================
 * Per-viewer discipline — what may never be added to a workspace
 *
 * `S-PERUSER` (`docs/workflows/00-product-overview.md` L562) supplies one test, and it
 * is the whole rule: IF TWO PEOPLE OPENED THIS AT THE SAME MOMENT, COULD THEY
 * LEGITIMATELY SEE DIFFERENT VALUES? If yes, the field belongs on a relation keyed by
 * the pair and never on the shared object. `docs/workflows/README.md` L357 calls this
 * "the single most consequential correction" in the consolidated model and gives the
 * reason it is a security rule rather than a modelling preference: stored on the shared
 * object, one person marking something read marks it read for everyone, and each such
 * flag additionally discloses that person's behaviour to every other member.
 *
 * The workspace is the entity most exposed to this mistake, because the surfaces that
 * render it are lists and a list is where a per-viewer badge is most tempting. So none
 * of the following is ever a field of a workspace, however convenient it would be: an
 * unread count or unread badge, a starred or favourite flag, a last-opened or
 * last-visited timestamp, the workspace's position in the switcher, a per-viewer
 * notification scope or mute, a dismissed banner, draft presence, or per-client
 * connection diagnostics.
 *
 * Where they live instead:
 *   - viewer-owned preferences, including dismissed banners, which sit on the viewer's
 *     own preference record rather than on the object dismissed (`README.md` L372) —
 *     `./preference.ts`
 *   - conversation-scoped per-member state — the membership record in `./channel.ts`
 *   - viewer-and-message state — `./message.ts`
 *
 * `memberCount` on the summary projection is the one value on either shape here whose
 * result can legitimately differ between two viewers, and it is NOT an exception to this
 * rule. It is not a stored per-viewer fact at all: it is computed per read over the
 * viewer's authorized set inside the same query that returns the row, which makes it a
 * projection governed by `S-AUTHZ-READ` rather than a column governed by `S-PERUSER`.
 * The distinction matters because the two contracts prescribe different fixes — a
 * relation for the one, an authorized query for the other — and a build that reached for
 * a relation here would end up storing a count.
 * =========================================================================== */
