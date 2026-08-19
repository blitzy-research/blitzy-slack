/**
 * Derived types for the workspace contract and its setup wizard.
 *
 * WHAT THIS MODULE IS
 *
 * Every type exported below is produced by `z.infer` over a schema that
 * `../schemas/workspace.js` exports, or by a derivation over such an inferred
 * type — an indexed access, an `Extract` — or is forwarded from that module
 * unchanged. There is no schema here, no runtime value and no hand-written
 * shape. Nothing in this file survives compilation: it emits declarations and
 * nothing else, which is why the package declares itself free of side effects.
 *
 * The consequence worth stating plainly is that this module cannot drift. A
 * shape has exactly one definition — the schema — and a type inferred from that
 * definition changes when the definition changes. An `interface` restating the
 * workspace's fields would be a second definition of one contract, and a second
 * definition is the thing that drifts, so none appears below. That discipline is
 * the same one the single-implementation rule imposes on the component
 * contracts: one contract, one place, extended rather than forked.
 *
 * WHAT IS FORWARDED, AND WHY FORWARDING IS NOT RESTATING
 *
 * The schema module already declares a derived type for each of its composite
 * shapes, and those declarations are load-bearing where they are — the setup
 * wizard's steps are validated individually and as a discriminated union, and
 * the union's own members must already have names for that to read. So this
 * module does not re-infer them. It forwards them, which re-exports the single
 * declaration rather than creating a second one, so a consumer reaching for the
 * workspace contract finds the whole of it in one place while the package
 * barrel still sees one name arriving from one declaration.
 *
 * WHY EVERY WIZARD STEP KEEPS ITS OWN TYPE
 *
 * The wizard asks one question per step and each step's forward action is gated
 * on that step's own single input, so a step must be validatable in isolation.
 * One payload type per step is what expresses that. A single merged payload with
 * every field optional would express the opposite: it would make each field
 * individually omissible, so no step could state what it requires, and it would
 * let one step's submission carry another step's value. There is therefore no
 * combined all-optional setup type below, and the never-merge-two-contracts
 * clause of the single-implementation rule is the reason it will not be added.
 *
 * The same reasoning keeps the workspace and its summary apart. The summary is
 * not a view of the workspace and is not derived from it: it is an independently
 * authorized projection with its own field set and its own read check, produced
 * by surfaces that render many rows at once. A `Pick` of the workspace would
 * suggest one shape with two sizes, when what exists is two shapes with two
 * authorization stories.
 *
 * WHAT THESE TYPES ARE NOT
 *
 * They are shapes. They are not a trust boundary, and no value acquires any
 * property by being annotated with one.
 *
 *   - **Validation happens elsewhere.** A value typed as anything below has
 *     satisfied the compiler, which says nothing about whether it satisfied the
 *     schema. Every bound, character class, normalisation and pattern lives in
 *     the schema module and is applied when a payload is parsed on the server.
 *   - **No authorization happens here, and no identifier below confers any.** A
 *     workspace identifier appearing in a payload is a value the caller chose,
 *     and a value the caller chose is a value the caller can change: it names a
 *     record and grants nothing. The workspace a query is scoped to is derived
 *     server-side from the authenticated session by the client extension in
 *     `packages/db/src/tenancy.ts`, bound to that session in
 *     `apps/api/src/db/tenancy.ts`, so isolation sits below every caller and is
 *     never a parameter one supplies. Nothing in this module is a helper for
 *     keying a decision to a supplied workspace, and none may be added — the
 *     server-side-authorization rule forbids exactly that, and this module is
 *     the most tempting place in the package to breach it because it is named
 *     for the workspace. Consistently with that, no wizard payload names its
 *     subject at all: the setup being advanced is resolved from the session.
 *   - **This module introduces no mutation and no projection.** It declares
 *     types over shapes another module defines. So it owes no denial test, and
 *     one written against it would assert nothing: the denial tests belong to
 *     the handlers that execute the mutations and produce the projections.
 *   - **The derivation is not reimplemented here.** The transform that turns the
 *     wizard's free-text focus answer into a channel name is a runtime concern
 *     and lives once in the schema module, so the name a person is shown and the
 *     name that is created cannot disagree. This module names that transform's
 *     input and its output. It does not restate the rule the output satisfies,
 *     in code or in a comment, because a second statement of a rule is a second
 *     definition that can drift from the first.
 *
 * THE PLAN CHOICE IS A REFERENCE, NEVER A COPY
 *
 * The wizard's terminal step chooses a published tier, and what it writes is one
 * field holding a reference to that tier rather than a copy of it
 * [`docs/workflows/README.md` L325; `docs/workflows/01-onboarding-and-auth.md`
 * L788]. The obligation runs both ways and both are read-path boundaries rather
 * than modelling preferences: no published value is copied onto the tenant
 * record, and no tenant value is ever a field of the published tier, which is
 * read in full by a signed-out visitor on the public pricing page.
 *
 * So no type below carries a tier's name, its description, its price, its
 * currency, its capability map or its support level, and none carries a trial, a
 * promotion, an entitlement set, a billing account, a stored instrument, a
 * billing contact, a billing-history entry or a renewal estimate. Those values
 * are out of scope for this phase, and the ones that will exist later belong to
 * the tenant's own field group rather than beside its identity fields. The
 * absences are named rather than silent so that a later reader cannot mistake
 * absence for oversight. No tier is named anywhere in this file, including in a
 * comment: a tier is referred to by its opaque reference, which the build
 * assigns and which therefore carries no third party's mark.
 *
 * NO DEFAULT IS ENCODED IN A TYPE
 *
 * Several fields have defaults, and the domain self-join policy in particular
 * defaults to closed regardless of how any control renders, because enrolment is
 * authorized server-side against the stored policy and the joiner's confirmed
 * address. Every one of those defaults lives in the schema. A type cannot carry
 * a default and none below implies one, so nothing here may be read as evidence
 * of what a field's value will be when it is absent.
 *
 * NO VALUE, NO BOUND AND NO DURATION APPEARS HERE
 *
 * Every length bound, count bound and character class is declared once in the
 * schema module or in `../config/constants.js`, and reaches these types only
 * through the schema that consumed it — so nothing here can fall out of step
 * with a rule. Configurable defaults live in `../config/env.js` and reach a type
 * the same way. Instants are absolute: the creation instant is a point in time,
 * never an age, and any elapsed phrasing a surface renders is computed at render
 * time from that instant. The only numerals below are citations — a catalog line
 * and a frame — and no numeral below is a value, a bound or a threshold.
 *
 * A NOTE ON OPTIONAL MEMBERS — OMIT THE PROPERTY, DO NOT ASSIGN IT
 *
 * A schema's optional field infers as an optional property whose value type
 * *includes* the absent case. That detail is worth knowing precisely, because it
 * is the opposite of what the exact-optional-property-types setting is usually
 * relied on for: the setting refuses the absent case only where the value type
 * excludes it, and here it does not, so **the compiler accepts both omitting the
 * property and assigning it the absent case**. Nothing in this module can stop
 * the second one, so it is documented instead.
 *
 * Omit it. The profile photo on the wizard's own-name step is the member this
 * matters most for, and the difference is observable rather than stylistic: the
 * schema's output for an absent optional omits the key, a presence test by key
 * therefore disagrees with the two forms, and serialising drops an assigned key
 * so that a value which has crossed the wire and one which has not are unequal
 * by key set. The same applies to any optional member of a shape forwarded
 * below.
 *
 * HOW TO CONSUME IT
 *
 * Through the package barrel — `@relay/shared` — and not by path. Inside this
 * package the sibling schema module is reached relatively, because that is how a
 * package is built; from outside, the barrel is the only entry point.
 *
 * A NOTE ON HOW THE PROJECT RULES ARE CITED
 *
 * Five binding project rules govern this work and each is referred to above and
 * below by what it requires — the single-implementation discipline, the
 * server-side-authorization rule, the corpus-handling rule, the
 * uncertainty-is-not-omission rule, the third-party-identity rule. Their own
 * identifiers are deliberately absent, because every one of them embeds the
 * third-party product name that the last of those rules forbids from appearing
 * in source or in comments. A reader who maps them back should not write the
 * identifiers in here. Frames, where they are cited at all, are cited by number
 * alone for the same reason: each corpus filename embeds that same name.
 */
import type { z } from 'zod';
import type {
  DerivedChannelNameResult,
  termsOfServiceReferenceSchema,
  workspaceChannelNameSchema,
  workspaceDomainLabelSchema,
  workspaceIdSchema,
  workspaceLanguageTagSchema,
  workspaceNameSchema,
  workspaceSchema,
  workspaceSetupInviteeOutcomeSchema,
  workspaceSetupStepFourSchema,
  workspaceSetupStepSchema,
  workspaceSignInDomainSchema,
  workspaceSummarySchema,
} from '../schemas/workspace.js';

/* -------------------------------------------------------------------------- */
/* The canonical shapes, forwarded from the module that declares them         */
/* -------------------------------------------------------------------------- */

/*
 * Sixteen names, one declaration each, all of them next door. They are
 * forwarded here so that a consumer reaching for the workspace contract finds
 * the whole of it in one place, and forwarded rather than re-inferred so that
 * there is still only one declaration of each — see the header for why the
 * difference decides whether the package barrel compiles.
 *
 * What each one is:
 *
 *   - `Workspace` — the tenant record every other row in the product hangs off:
 *     its name, its sign-in domain and the subdomain label that composes it, an
 *     icon reference, the absolute creation instant, a terms-of-service
 *     reference, its joining and invitation and display-name policies, its
 *     language, the channels a new member is added to, and a nested commercial
 *     position. It carries no credential of any class and no duration.
 *   - `WorkspaceSummary` — the compact projection described below, and a
 *     separate shape rather than a narrower view of the record above.
 *   - `WorkspaceSetupStepOne` through `WorkspaceSetupStepFive` — one payload per
 *     wizard step, in the order the wizard asks them: the workspace name with
 *     the email-domain self-join policy; the person's own full name with an
 *     optional profile photo; the invitees; the free-text answer the first
 *     channel is named from; and the plan choice. Each is strict, so an unknown
 *     key is rejected rather than ignored, and each is individually validatable.
 *     None of them names its subject.
 *   - `WorkspaceSetupStep` — the five above as one union discriminated on the
 *     step, for an endpoint that accepts the whole wizard through one body. A
 *     convenience over the five and never a replacement for them: the
 *     discriminator says which step a payload is, not where the person has
 *     reached, and there is no step index and no way back to model.
 *   - `WorkspaceSetupInviteeOutcome` — the three ways the invitee step can
 *     conclude, discriminated on its own kind: addresses were committed, a
 *     shareable link was asked for, or the step was declined. Two of the three
 *     carry no payload, which is what makes declining distinguishable from
 *     submitting nothing.
 *   - `WorkspaceCommercialPosition` — the tenant's own field group, holding the
 *     reference to a published tier and nothing else. It is a nested group
 *     rather than a field beside the identity fields because that placement is
 *     an obligation of the data model [`docs/workflows/README.md` L325], and it
 *     is nullable on the record above because it is first populated by the
 *     wizard's terminal choice rather than defaulted.
 *   - `WorkspaceJoiningPolicy`, `WorkspaceInvitationPermission` and
 *     `WorkspaceDisplayNamePolicy` — three closed vocabularies, each a literal
 *     union derived from the schema rather than a runtime enumeration, so the
 *     vocabulary cannot be extended anywhere but the schema. All three are
 *     descriptive of stored policy: none is a capability, and none decides
 *     anything on its own.
 *   - `PlanTierReference` — an opaque reference to a published tier. Never a
 *     name, a price, a currency or a capability; see the header.
 *   - `DerivedChannelNameResult` — the transform's whole outcome, as a
 *     discriminated result rather than a nullable name, so that "no name could
 *     be formed" and "the name formed is not usable" stay distinguishable.
 *   - `WorkspaceRejectionCode` — the closed set of machine-readable reasons a
 *     workspace or wizard shape was rejected. A code, never a rendered
 *     sentence: the wording a person reads is chosen by the client from the
 *     authored copy module, so no user-facing prose exists in this package's
 *     contract and no rejection can leak an implementation detail. Two field
 *     shapes deliberately emit the person contract's codes instead, because
 *     they reuse its address and stored-object rules rather than restating
 *     them, so a consumer mapping codes to copy handles both unions.
 *
 * `WorkspaceSummary` IS THE ONE TO REACH FOR WHEN NAMING A WORKSPACE IN A LIST.
 * The workspace switcher, the workspace menu and the welcome-back chooser all
 * render this shape, and it is declared once so that neither the component
 * library nor the client declares a switcher-row or chooser-row shape of its
 * own. It deliberately omits every policy, every configuration value and the
 * commercial position: a projection that carries more than its consumers render
 * is a disclosure waiting for a consumer that leaks it. Typing one of those
 * surfaces with `Workspace` instead is an over-projection.
 */
export type {
  DerivedChannelNameResult,
  PlanTierReference,
  Workspace,
  WorkspaceCommercialPosition,
  WorkspaceDisplayNamePolicy,
  WorkspaceInvitationPermission,
  WorkspaceJoiningPolicy,
  WorkspaceRejectionCode,
  WorkspaceSetupInviteeOutcome,
  WorkspaceSetupStep,
  WorkspaceSetupStepFive,
  WorkspaceSetupStepFour,
  WorkspaceSetupStepOne,
  WorkspaceSetupStepThree,
  WorkspaceSetupStepTwo,
  WorkspaceSummary,
} from '../schemas/workspace.js';

/* -------------------------------------------------------------------------- */
/* Field primitives                                                           */
/* -------------------------------------------------------------------------- */

/*
 * One name for each field schema the module next door leaves underived. Every
 * one of them resolves to text, and that is the point rather than a
 * shortcoming: the schemas differ in how much they accept, against which
 * character class, after which normalisation and whether a control character is
 * refused, and none of that difference is expressible in the type system. A
 * signature naming one of these therefore says which bounded value it wants,
 * which is strictly more than a bare text type says, while leaving enforcement
 * where enforcement belongs — in the schema.
 *
 * No bound appears here, in a type or in a comment. Every bound is declared once
 * as a named constant and reaches these types only through the schema that
 * consumed it, so there is no number in this file that can fall out of step with
 * one.
 *
 * The workspace icon is absent from this list on purpose. It is a reference to a
 * stored object and never artwork, and a reference to a stored object is one
 * rule whatever the object depicts, so the schema reuses the person contract's
 * own reference rather than declaring a second one — which is why it is reached
 * as that contract's type and not renamed here.
 */

/**
 * The opaque record identifier naming a workspace.
 *
 * Opaque is the operative word. It identifies a record and nothing else: nothing
 * may be inferred from its contents, no caller may construct one, and it confers
 * no authority whatsoever. It is never an authorization input — a decision keyed
 * to it would be a decision keyed to a value the caller chose — and it is the
 * reference the personal-data contract requires be used in place of a meaningful
 * value wherever a workspace must be named in a log line, an error report, an
 * analytics event, a URL or a cache key.
 *
 * It appears on the record and on the projection, and on no request in this
 * contract: the workspace a request acts in is the session's, not the payload's.
 */
export type WorkspaceId = z.infer<typeof workspaceIdSchema>;

/**
 * A workspace's name.
 *
 * Collected on the wizard's first step and interpolated into headings, sidebar
 * headers and modal titles thereafter, which is why the schema applies the full
 * input discipline to it: a control character or a bidirectional override inside
 * a value that becomes a heading is a way to rewrite the surface around it.
 *
 * It is stored in one canonical form and is **not** escaped, because encoding
 * belongs to each render sink at render time so that one stored value is safe in
 * every context it appears in. A type cannot encode, and a value shortened or
 * escaped to fit a type would be a value its author never wrote.
 */
export type WorkspaceName = z.infer<typeof workspaceNameSchema>;

/**
 * The subdomain label a workspace chose for its sign-in address.
 *
 * The chosen part of the address only. The suffix that completes it is fixed by
 * the deployment rather than being a per-workspace value, so it is not a field
 * and this type does not describe it.
 */
export type WorkspaceDomainLabel = z.infer<typeof workspaceDomainLabelSchema>;

/**
 * A workspace's fully-qualified sign-in domain.
 *
 * Held whole rather than assembled per read, so a change to the deployment's
 * suffix cannot silently retarget an address somebody already uses. The same
 * type also describes the email domain a self-join policy admits, because both
 * are fully-qualified names under one rule.
 *
 * Governed by the personal-data contract in one specific respect worth stating
 * because the value looks innocuous: a workspace domain frequently *is* an
 * organisation's identity, so it may not reach an application log, an error
 * report, an analytics event, a URL or a cache key — a cache being a read path
 * keyed by tenant and viewer authorization scope rather than by a value like
 * this one. Where a workspace must be referenced in any of those places, the
 * opaque identifier above is what is referenced.
 */
export type WorkspaceSignInDomain = z.infer<typeof workspaceSignInDomainSchema>;

/**
 * A workspace's language, as a tag.
 *
 * Shape-validated only, and deliberately: the schema refuses a value that could
 * not be a tag and leaves whether a well-formed tag is one the product has
 * translations for to the surface that resolves it. So a value of this type is
 * not a promise that a translation exists.
 */
export type WorkspaceLanguageTag = z.infer<typeof workspaceLanguageTagSchema>;

/**
 * A reference to the published terms of service a workspace was created under.
 *
 * An opaque reference to a published version, never its text and never an
 * assembled address: the review link a surface renders is composed at render
 * time from this reference, so the version a workspace accepted stays
 * recoverable after the published text moves on.
 */
export type TermsOfServiceReference = z.infer<typeof termsOfServiceReferenceSchema>;

/**
 * A channel name as the workspace contract accepts one.
 *
 * Used for the channels a new member is added to, and for the name the wizard
 * derives from its focus answer. The rule this value satisfies belongs to the
 * channel rather than to the workspace: it is declared once in the shared
 * configuration, imported by the schema that validates against it, and is
 * neither restated nor summarised here, because a second statement of a rule is
 * a second definition that can drift from the first.
 */
export type WorkspaceChannelName = z.infer<typeof workspaceChannelNameSchema>;

/* -------------------------------------------------------------------------- */
/* The wizard's discriminants, one per union                                  */
/* -------------------------------------------------------------------------- */

/*
 * Each discriminant below is read off its own union with an indexed access, so
 * it is derived from the union rather than listed beside it. Listing the members
 * again — even correctly — would be a second enumeration of one vocabulary, and
 * the second one is the one that is wrong after the first one changes.
 *
 * There are two of them because there are two unions, at two different levels: a
 * payload names which step it is, and the invitee step's payload additionally
 * names which of its three outcomes occurred. Keeping them apart is what makes a
 * lookup table keyed by one of them exhaustive over the union it actually
 * serves, and what stops an outcome being passed where a step belongs.
 */

/**
 * Which step a wizard payload is.
 *
 * A name for the payload's own kind, and not a position in the sequence: the
 * wizard is forward-only and has no step index a caller may set, so how far a
 * person has reached is the server's to know from the session's in-progress
 * setup. Deriving this from the union is what keeps a mapping over the steps
 * exhaustive when a step is added.
 */
export type WorkspaceSetupStepKind = z.infer<typeof workspaceSetupStepSchema>['step'];

/**
 * Which of the invitee step's three outcomes occurred.
 *
 * Two of the three carry no payload, and the vocabulary is what preserves the
 * distinction between them: declining the step and asking for a shareable link
 * are different acts with different consequences, and neither is an invitation
 * of nobody. A shape that folded them together would make the step's own
 * rejection for an empty field unusable.
 */
export type WorkspaceSetupInviteeOutcomeKind = z.infer<
  typeof workspaceSetupInviteeOutcomeSchema
>['kind'];

/* -------------------------------------------------------------------------- */
/* Narrowing one member out of a union                                        */
/* -------------------------------------------------------------------------- */

/*
 * A wizard host, a submission handler and a test all do the same thing: branch
 * on a payload's discriminant and then work with that one member. Each generic
 * below names that one member by extracting it from the union, which keeps a
 * per-step signature from having to import every step — and, more usefully,
 * keeps the extraction honest. Passing a discriminant the union does not contain
 * resolves to nothing assignable, so the mistake surfaces where it is written
 * rather than where the value is used.
 *
 * Each is a type-level construct and each accepts a union of discriminants as
 * readily as a single one, resolving to the union of the members that match.
 * Neither is a way to obtain a merged payload: asking for every discriminant at
 * once returns the union it was extracted from, which is still five separate
 * shapes rather than one shape with optional fields.
 */

/**
 * The wizard payload, or payloads, carrying a given step discriminant.
 *
 * Narrowed from the union rather than restating any step, so a step gains a
 * field exactly when its schema does.
 */
export type WorkspaceSetupStepOfKind<TKind extends WorkspaceSetupStepKind> = Extract<
  z.infer<typeof workspaceSetupStepSchema>,
  { step: TKind }
>;

/** The invitee outcome, or outcomes, carrying a given kind discriminant. */
export type WorkspaceSetupInviteeOutcomeOfKind<TKind extends WorkspaceSetupInviteeOutcomeKind> =
  Extract<z.infer<typeof workspaceSetupInviteeOutcomeSchema>, { kind: TKind }>;

/* -------------------------------------------------------------------------- */
/* The focus answer, and the name derived from it                             */
/* -------------------------------------------------------------------------- */

/*
 * The transform that turns one into the other is a runtime concern owned by the
 * schema module, and it lives there once so that the client rendering a preview
 * and the server creating the channel cannot disagree about the result. The four
 * types below describe that transform's two ends and its two outcomes, and none
 * of them reimplements any part of it.
 *
 * Each is derived from what the schema already declares: the input from the step
 * that collects it, the outcomes from the result the transform returns. Nothing
 * about the transformation itself — what it keeps, what it replaces, what it
 * refuses — appears here, in code or in a comment.
 */

/**
 * The free-text answer the wizard's focus step collects.
 *
 * Derived from that step rather than declared beside it, so it is the same value
 * the step validates. It is bounded independently of the name it yields, which
 * is why an answer can be perfectly valid prose and still be unable to become a
 * handle — a case that surfaces as a rejection a client renders beside the
 * field, rather than as a name nobody asked for.
 *
 * What crosses the wire and what is stored is the person's own answer. The
 * derived name is a separate value.
 */
export type WorkspaceFocusAnswer = z.infer<typeof workspaceSetupStepFourSchema>['answer'];

/**
 * The outcome in which a name was derived.
 *
 * Extracted from the result rather than restated, so the branch and the whole
 * carry one definition. A caller that has narrowed on the result's own flag has
 * this type in hand and needs no cast to read the name.
 */
export type DerivedChannelNameSuccess = Extract<DerivedChannelNameResult, { readonly ok: true }>;

/**
 * The outcome in which no name was derived, carrying the code that says why.
 *
 * The transform never substitutes a name of its own, so this branch is a real
 * result rather than an error path: an answer that yields nothing usable and an
 * answer that yields something unusable are both refused, each with its own
 * code, and the code is one of the contract's machine-readable rejections that a
 * client maps to authored copy exactly as it maps every other one.
 */
export type DerivedChannelNameRefusal = Extract<DerivedChannelNameResult, { readonly ok: false }>;

/**
 * The channel name the transform produced.
 *
 * Read off the successful outcome, so it is the derived value itself rather than
 * a second name for a channel name in general. A consumer that has this value
 * holds a name the transform already checked against the channel's own rule; a
 * consumer that wants to say "some channel name" wants the field primitive
 * above instead.
 */
export type DerivedChannelName = DerivedChannelNameSuccess['channelName'];

/* -------------------------------------------------------------------------- */
/* Two derived shapes worth naming                                            */
/* -------------------------------------------------------------------------- */

/**
 * The channels a new member of a workspace is added to.
 *
 * Derived from the record rather than assembled from the channel-name primitive,
 * so it inherits the record's own rules about the list as a whole — how many it
 * admits, and that a repeat is refused rather than silently collapsed. A surface
 * that renders or edits the list takes this rather than reaching through the
 * workspace type at each call site, and a second declaration of it elsewhere
 * would be a second definition of one contract.
 */
export type WorkspaceDefaultChannels = z.infer<
  typeof workspaceSchema
>['defaultChannelsForNewMembers'];

/**
 * The member count a chooser row renders beside its facepile.
 *
 * **A projection, and never a stored column.** It is computed per read over the
 * reader's authorized set inside the same query that returns the row, because a
 * total computed over content the reader may not see discloses that the content
 * exists — which makes a count a read path in its own right, authorized like the
 * row it sits on. A stored counter would be one number serving every reader,
 * which is precisely a count computed outside anyone's authorized set.
 *
 * It is also the near-miss for the per-viewer rule and is not an exception to
 * it: the value can legitimately differ between two readers, but only because of
 * how it is computed, so it is not a per-viewer fact to be moved onto a relation.
 *
 * Named because its provenance is the thing a signature most needs to state, and
 * because absence is not how it expresses itself: it is neither optional nor
 * nullable, and a count of zero is a real value the catalogue requires be
 * rendered as a zero rather than hidden [`docs/workflows/01-onboarding-and-auth.md`
 * L923, frame 731]. A nullable count would let a consumer render an empty space
 * where a nought belongs.
 */
export type WorkspaceMemberCount = z.infer<typeof workspaceSummarySchema>['memberCount'];
