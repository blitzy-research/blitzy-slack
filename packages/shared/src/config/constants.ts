/**
 * Compile-time invariants — values that are deliberately NOT overridable by the
 * environment.
 *
 * This module and its sibling `./env.ts` split the configuration surface in two,
 * and the split is the whole point. A value that a deployment may legitimately
 * tune — an expiry, a window, a quota — belongs in `./env.ts`, where it is
 * schema-validated and documented in the environment template. A value that is a
 * RULE rather than a setting belongs here, where no environment variable can
 * weaken it. `PROJECT_RULE_R3` forbids inlining either kind at a point of use, so
 * every consumer imports from one of these two modules and no validator carries a
 * literal of its own.
 *
 * Nothing in this module reads the environment, and nothing in it has a default in
 * the `./env.ts` sense: an invariant has a value, not a default.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS FILE HOLDS
 * ---------------------------------------------------------------------------
 *
 * Five groups, in this order, and every one of them is a rule rather than a
 * setting:
 *
 *   1. The channel-name grammar — its ceiling, its floor and its character rule.
 *   2. The channel-visibility set and the option the creation wizard arrives on.
 *   3. The snippet modal's required-field set and its two arriving defaults.
 *   4. The password-verifier parameters.
 *   5. The realtime protocol parameters, the replay-window bound among them.
 *
 * Groups 1 to 3 are read from the catalogue's prose and carry their evidence by
 * document, line and frame NUMBER. Groups 4 and 5 have no frame evidence and
 * none is possible — no capture can show a hashing parameter or a transport —
 * so each says so in its own words rather than borrowing a citation it has no
 * claim to, and each names the record that registers the choice.
 *
 * Four of these are named in `docs/decisions/observed-values.md` under
 * "Excluded: the invariants", which exists precisely so that their absence from
 * that record's table cannot be mistaken for an omission.
 *
 * This file is the single home for all five groups; it is not a partial
 * substitute for one. A sixth group, if one is ever needed, belongs here beside
 * them rather than anywhere else.
 *
 * ---------------------------------------------------------------------------
 * HOW THE PROJECT RULES ARE CITED, AND WHY NOT BY THEIR OWN IDENTIFIERS
 * ---------------------------------------------------------------------------
 *
 * Five binding project rules govern this work, cited here by requirement label:
 * `PROJECT_RULE_R1` (authorization is server-side only), `PROJECT_RULE_R2`
 * (corpus and specification handling), `PROJECT_RULE_R3` (uncertainty is never
 * permission to omit), `PROJECT_RULE_R4` (third-party identity exclusion) and
 * `PROJECT_RULE_R5` (a shared contract is implemented exactly once). Their own
 * identifiers are deliberately not written anywhere in this repository's source,
 * because each embeds the third-party product name that R4 forbids in source and
 * in comments. The labels are permuted relative to those identifiers, so the label
 * is the thing to trust; the authoritative wording lives in the rules interface.
 */

/* -------------------------------------------------------------------------- */
/* 1. THE CHANNEL-NAME GRAMMAR                                                */
/* -------------------------------------------------------------------------- */

/**
 * The greatest number of characters a channel name may carry.
 *
 * Eighty. `docs/workflows/02-channels.md` records the ceiling three times over: on
 * the dialog that edits a name (L282 · frame 97), in the channel entity's own field
 * table (L782 · frames 97, 69), and as an acceptance criterion (L982 · frames 69,
 * 97). `docs/workflows/README.md` L327 corroborates it on the same entity, having
 * observed the character counter reading eighty on creation (frame 69).
 *
 * ONLY THE NUMBER IS CARRIED HERE, never the sentence that states it. The wording
 * legible on that dialog is a third party's product copy, and `PROJECT_RULE_R4`
 * forbids transcribing it — a ceiling and a character rule are function rather than
 * identity and may be carried; the sentence around them may not. The wording a
 * person reads in THIS product is authored for it and lives in
 * `packages/shared/src/copy/en.ts`.
 *
 * This is an INVARIANT rather than a configurable default, and the distinction is
 * deliberate. The counter is not a setting a deployment may raise: the rule is
 * stated to the person composing the name, the counter is derived from it, and a
 * name already stored under it would be re-validated against any change. It
 * therefore lives in this module and never in `./env.ts`.
 *
 * Every consumer imports this constant. Nothing restates the number — not the
 * channel schema, not the setup wizard's derived-name rule, not a form validator
 * in the client.
 */
export const CHANNEL_NAME_MAX_LENGTH = 80;

/**
 * The characters a channel name may be composed of.
 *
 * AUTHORED, NOT OBSERVED, and the distinction has to be stated because the
 * catalogue states only the three PROHIBITIONS — lower case, no spaces, no periods
 * (`docs/workflows/02-channels.md` L282, L782, L982) — and never once enumerates
 * what a name may contain. A validator needs the positive set, so one was authored
 * under `PROJECT_RULE_R3`'s smallest-coherent-behaviour clause. The judgement is
 * registered in `docs/decisions/gap-register.md` with the options considered and
 * the reasoning; what follows is a summary of it, not a substitute for it.
 *
 * The one positive piece of evidence the corpus does supply is the hyphen: the
 * setup wizard derives a workspace's first channel from a free-text answer by
 * lower-casing and HYPHENATING it (`docs/workflows/01-onboarding-and-auth.md` L150
 * · frame 16), so the hyphen is evidenced as a permitted character rather than
 * assumed. Everything else in the class below is authored.
 *
 * What the class admits, and why each part is here:
 *   - `\p{Ll}` lower-case letters, which is the rule's own requirement expressed
 *     positively. Stating it this way is what makes an upper-case letter
 *     unrepresentable rather than merely discouraged.
 *   - `\p{Lo}` letters without case distinction, so that a script which has no
 *     upper case — and therefore cannot violate a lower-case rule — is not
 *     excluded by a rule aimed at a different problem. Omitting this would make
 *     the product unusable for a large part of the world for no stated reason.
 *   - `\p{Mn}` and `\p{Mc}` combining marks, without which a correctly composed
 *     name in several scripts would be rejected for containing its own vowels.
 *   - `\p{Nd}` decimal digits.
 *   - the hyphen and the underscore, the two separators a handle conventionally
 *     carries. The hyphen is evidenced; the underscore is the smallest coherent
 *     addition consistent with it, and is admitted so that a separator a person
 *     types instead of a hyphen does not fail for a reason nothing explains.
 *
 * What it refuses follows from what it admits: the space, the period, every
 * upper-case letter, and every punctuation, symbol, control and bidirectional
 * formatting character. The space and the period are refused by construction
 * rather than by a separate check, which is why there is no second rule to keep in
 * step with this one.
 *
 * TWO PROPERTIES OF THIS VALUE ARE LOAD-BEARING FOR ITS CONSUMERS.
 *
 * It is ANCHORED, so `test` answers a question about a whole value and not about
 * whether a value contains an acceptable fragment. And the `+` quantifier rejects
 * the empty string, so the pattern and `CHANNEL_NAME_MIN_LENGTH` below agree on
 * the floor rather than disagreeing about it. They are both here because they
 * report differently: the quantifier makes an empty name unrepresentable, while
 * the named floor lets a validator raise "a name is required" as its own finding
 * instead of reporting an illegal character to someone who typed nothing.
 *
 * It carries NO LENGTH BOUND, deliberately. The ceiling is
 * `CHANNEL_NAME_MAX_LENGTH`'s job, so a name that is too long and a name that
 * contains an illegal character are two distinct findings a surface can report
 * separately. Folding the ceiling into the quantifier would collapse them into
 * one unhelpful rejection.
 *
 * It carries NO `g` FLAG, deliberately. A global regular expression keeps a
 * mutable `lastIndex` between calls, so a shared one would give different answers
 * to the same question depending on what was asked before it. Every consumer here
 * calls `test` repeatedly against a shared instance, including character by
 * character, so statelessness is a correctness requirement rather than a style
 * preference. The class also admits single characters, which is what allows a
 * consumer deriving a name to ask this pattern whether a character is permitted
 * instead of re-authoring the class.
 */
export const CHANNEL_NAME_PATTERN = /^[\p{Ll}\p{Lo}\p{Mn}\p{Mc}\p{Nd}_-]+$/u;

/**
 * The fewest characters a channel name may carry — that is, a name is required.
 *
 * One, not zero, and the evidence is the control's own state rather than a
 * stated rule: the creation wizard's forward action is disabled while the name
 * field is empty and enabled as soon as a name is present
 * (`docs/workflows/02-channels.md` L983 · frames 58, 59). The catalogue draws the
 * same conclusion at L164, deducing that the name is required and the visibility
 * choice is not, and `docs/decisions/gap-register.md` registers that deduction as
 * an inference rather than an observation. The floor is that inference expressed
 * as a number.
 *
 * A separate constant rather than a bare `.min(1)` at each call site, because
 * `PROJECT_RULE_R3` forbids a literal at a point of use whether the literal is
 * large or small — and because a floor with a name is a floor a reader can find.
 */
export const CHANNEL_NAME_MIN_LENGTH = 1;

/*
 * THE COUNTER COUNTS DOWN. This is a consumer's obligation and it has no constant
 * of its own, deliberately.
 *
 * `docs/workflows/02-channels.md` L291 settles the direction by contrast: at
 * frame 97 the field holds a name and the counter reads a value below eighty,
 * while at frame 69 the field is empty and it reads exactly eighty. The counter
 * therefore renders the characters still AVAILABLE, not the characters consumed —
 * a build that renders consumed characters has the rule backwards. The same line
 * records that it is rendered only while the field has focus (frame 98).
 *
 * A surface computes `CHANNEL_NAME_MAX_LENGTH - value.length` and renders that.
 * There is no `CHANNEL_NAME_COUNTER_START` here and there must never be one: a
 * second constant carrying eighty is exactly the duplication this module exists
 * to prevent, and the moment it existed the two could disagree. The counter is
 * derived from the ceiling, so it cannot.
 *
 * The wording around the number is authored for this product and lives in
 * `packages/shared/src/copy/en.ts`. Nothing legible in a frame is carried here:
 * `PROJECT_RULE_R4` permits the RULE — a ceiling, a floor, a character class —
 * and forbids the sentence that states it.
 */

/* -------------------------------------------------------------------------- */
/* 2. CHANNEL VISIBILITY                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The visibility a channel may have. Exactly two, and the count is part of the
 * contract rather than an artefact of what happened to be captured.
 *
 * `docs/workflows/02-channels.md` L984 states it as an acceptance criterion —
 * step 2 of the creation wizard "offers exactly two visibility options" — and the
 * step table at L154 describes the same pair as a two-option radio group
 * (frames 60, 61). The channel entity's own field table repeats it at L782:
 * public or private, chosen at creation and convertible in both directions
 * afterwards.
 *
 * WHY A READONLY TUPLE AND NOT AN ENUM. `as const` gives three things an enum does
 * not. Its members are literal types, so a consumer that compares against one gets
 * a compile error on a typo rather than a silent false. It is iterable, so a
 * surface renders the pair by mapping over this and cannot drift from the set. And
 * a schema builds its own enumeration from it directly, which is what makes the
 * single-definition-point claim below true rather than merely intended. (`as const`
 * is a type-level guarantee, not `Object.freeze`; nothing here needs runtime
 * immutability, and adding it would cost every consumer a frozen-array check for
 * a mutation the compiler already refuses.)
 *
 * `packages/shared/src/schemas/channel.ts` DERIVES its visibility enumeration
 * from this constant and does not restate the members. Two members written out a
 * second time is precisely the local equivalent `PROJECT_RULE_R5` forbids, and
 * the failure it produces is the quiet kind: a third visibility added here would
 * be accepted by this module and rejected by a schema that had its own opinion.
 *
 * ORDER IS SIGNIFICANT and is the order the frames render: L190 describes the group
 * as rendering "with public selected and private beneath it" (frame 71). A surface
 * that maps over this therefore renders the pair in the observed order without
 * holding an opinion of its own about sequence.
 */
export const CHANNEL_VISIBILITIES = ['public', 'private'] as const;

/**
 * A channel's visibility, derived from the set above so the type and the values
 * can never disagree.
 *
 * Written as a lookup over the tuple rather than as a hand-authored union for the
 * same reason the tuple exists: a union written out separately is a second
 * definition of the same set, and the two would drift the first time one changed.
 */
export type ChannelVisibility = (typeof CHANNEL_VISIBILITIES)[number];

/**
 * The visibility the creation wizard arrives on.
 *
 * Public is pre-selected. `docs/workflows/02-channels.md` L154 states it plainly
 * of step 2 (frame 60), L190 records that advancing through the wizard "keeps the
 * default visibility" with public selected (frame 71), and L984 carries it as an
 * acceptance criterion: the step "arrives with public pre-selected" (frames 60,
 * 61).
 *
 * AN INVARIANT, NOT A CONFIGURABLE DEFAULT, and `docs/decisions/observed-values.md`
 * names it in its exclusion list for the reason that matters: an environment that
 * flipped this would silently change which conversations are discoverable by
 * default in that deployment. A default visibility is not a tuning knob — it
 * decides what happens when nobody chooses, which is the case that matters most.
 *
 * Typed by `satisfies` rather than by annotation, so membership in
 * `CHANNEL_VISIBILITIES` is still checked at compile time while the exact literal
 * survives for a consumer that needs to narrow on it.
 *
 * Note what this constant does NOT license. The wizard arriving on public is not
 * a permission: whether the acting session may create a channel at all, and in
 * which workspace, is decided server-side against the session and the target
 * object (`PROJECT_RULE_R1`). Nothing in this module is an authorization input.
 */
export const DEFAULT_CHANNEL_VISIBILITY = 'public' satisfies ChannelVisibility;

/* -------------------------------------------------------------------------- */
/* 3. THE SNIPPET MODAL'S FIELD RULES                                         */
/* -------------------------------------------------------------------------- */

/**
 * The fields a snippet cannot be created without. One: its content.
 *
 * `docs/workflows/03-messaging-and-composer.md` L681 states the rule and proves it
 * across three captures — the primary action is muted with an empty editor
 * (frame 144), STAYS muted once only the title is filled (frame 145), and becomes
 * active as soon as the editor holds text (frame 148). Frame 145 is the load-
 * bearing one: it is what distinguishes "content is required" from "some field is
 * required". L761 carries the same rule as an acceptance criterion, and records
 * that the title's own label states it is optional.
 *
 * SNIPPET-SCOPED, AND DELIBERATELY NOT GENERALISED. The catalogue lays this trap
 * on purpose and warns about it in advance at L688: the link dialog in the same
 * area renders its save action as an active filled primary with the link field
 * EMPTY (frame 238) — the opposite behaviour — "so a build must not assume a
 * uniform required-field rule across this area's dialogs". Two dialogs, one area,
 * two gating rules.
 *
 * So this set is named for the surface it governs and for no other. Renaming it to
 * something like a general required-field set, or reaching for it from the link
 * dialog, is the merge `PROJECT_RULE_R5` forbids: two similar contracts are not
 * one contract, and the resemblance is exactly what makes the mistake easy.
 * `docs/decisions/observed-values.md` records the rule in its exclusion list for a
 * matching reason — which field gates a primary action is a validation contract,
 * and an override would let one deployment accept an empty snippet.
 *
 * A set rather than a boolean, so a validator iterates it and so a second required
 * field — if one were ever evidenced — is a member added here rather than a
 * condition added at a call site.
 */
export const SNIPPET_REQUIRED_FIELDS = ['content'] as const;

/**
 * A field the snippet modal cannot be created without.
 *
 * Derived from the set, so a validator can name the field it is enforcing without
 * widening to `string` and losing the compiler's help.
 */
export type SnippetRequiredField = (typeof SNIPPET_REQUIRED_FIELDS)[number];

/**
 * The snippet type the modal arrives on: detect it from the content.
 *
 * `docs/workflows/03-messaging-and-composer.md` L761 records "a type select
 * defaulting to auto-detect" as part of the modal's acceptance criterion
 * (frame 144). The arriving state of a select is the same class of invariant as
 * the visibility radio's pre-selection above, and it is here for the same reason:
 * so that `packages/shared/src/schemas/message.ts` imports the default instead of
 * writing a literal into a schema, which is what `PROJECT_RULE_R3` forbids.
 *
 * THE IDENTIFIER IS AUTHORED; THE ENUMERATION IS ABSENT AND STAYS ABSENT. This is
 * a machine sentinel meaning "decide from the content", authored for this product
 * — the label a person reads is authored separately in
 * `packages/shared/src/copy/en.ts`, because `PROJECT_RULE_R4` forbids carrying a
 * string that is legible in a frame. And the catalogue never enumerates the
 * concrete types the select offers, so no such list is declared here. Absence is
 * recorded as absence: a set invented to look complete would be authored evidence
 * masquerading as observed evidence, which is the one thing this module must not
 * contain.
 */
export const SNIPPET_DEFAULT_TYPE = 'auto' as const;

/**
 * Whether the snippet modal arrives with its share-to-conversation flag set.
 *
 * It does. `docs/workflows/03-messaging-and-composer.md` L761 records "a
 * share-to-conversation flag pre-ticked and pre-scoped to the current
 * conversation" (frame 144).
 *
 * A PRE-TICKED CONTROL IS A RENDERING, NEVER A CONSENT, and the distinction is
 * load-bearing rather than pedantic. This flag decides where a snippet the person
 * is actively creating gets posted, inside a conversation they already have open —
 * it is a destination, not a permission and not an agreement. The pre-ticked
 * consent control that appears elsewhere in this product is a different thing
 * entirely: `docs/decisions/security-contracts.md` requires that one to be
 * recorded as an act, with the wording shown and any withdrawal, in its own table.
 * Nothing in this module is ever the evidence for a consent.
 *
 * The scope the flag points at is NOT a constant. It is the conversation the
 * person is in, resolved per request from the session and the route, and a
 * conversation identifier has no business being a compile-time value.
 */
export const SNIPPET_SHARE_TO_CONVERSATION_DEFAULT = true;

/* -------------------------------------------------------------------------- */
/* 4. THE PASSWORD-VERIFIER PARAMETERS                                        */
/* -------------------------------------------------------------------------- */

/*
 * NO FRAME EVIDENCES ANY OF THE FOUR VALUES BELOW, AND NONE EVER COULD.
 *
 * A capture shows a surface. A hashing parameter is not on a surface — it is not
 * rendered, not labelled and not inferable from anything that is, and a frame that
 * appeared to show one would be showing something else. So these four carry no
 * frame citation, and inventing one would be worse than carrying none: it would
 * dress an authored choice as an observation and defeat the distinction the rest
 * of this module maintains.
 *
 * That does not make them optional. `PROJECT_RULE_R3` is explicit that absent
 * evidence is never permission to omit a mechanism, and requires instead a
 * deliberate choice recorded with the options considered, the choice and the
 * reasoning. That record is `docs/decisions/gap-register.md`, under the entry for
 * the verifier parameters; `docs/decisions/observed-values.md` names them in its
 * exclusion list, and `docs/decisions/security-contracts.md` sets out the contract
 * they serve. The values come from current password-hashing guidance, which
 * recommends the hybrid variant and publishes an equal-strength ladder whose rungs
 * trade memory against iterations at constant defence.
 *
 * THREE CONSEQUENCES MAKE THESE LOAD-BEARING RATHER THAN INCIDENTAL.
 *
 * They are NEVER ENVIRONMENT-OVERRIDABLE. Every value in `./env.ts` — the
 * invitation expiry, the acceptance window, the session bounds — is overridable by
 * design, and these deliberately are not. A verifier parameter is a security floor,
 * so an override
 * is not a setting — it IS the downgrade, and it would be a downgrade available to
 * whoever can edit a deployment's environment rather than to whoever can change
 * this repository. `PROJECT_RULE_R1` requires that a server-side check be
 * evaluated at the point of execution and never be defeatable by what the caller
 * supplies; a check whose strength an environment variable can lower is a check
 * configuration can switch off. These parameters protect the acting session's
 * identity, which is the thing every authorization decision in the product is
 * evaluated against, so weakening them weakens every one of those decisions at
 * once.
 *
 * They are STORED ALONGSIDE EACH HASH, and that is what keeps the upgrade path
 * open. A successful authentication compares the parameters recorded on the row
 * against the parameters below, and where the row is behind it recomputes a
 * verifier from the value the person has just presented and replaces the row.
 * Without the parameters on the row there is nothing to compare against, and the
 * only remaining upgrade is to invalidate every password at once. Raising a value
 * here is therefore a safe, incremental operation rather than a migration.
 *
 * NO VERIFIER IS EVER A COLUMN ON THE USER RECORD. Per the secret-handling
 * contract in `docs/decisions/security-contracts.md`, password material lives in
 * its own lifecycle-bearing table alongside the three other secret classes, each
 * with its own lifecycle: a verifier that is replaced rather than expired, a code
 * that dies on first use, a device-enrolment code revoked in bulk with its grant,
 * and a session that is individually and collectively revocable. One lifecycle
 * cannot be expressed as one column, which is why there are four tables and not
 * four fields.
 *
 * The only consumer is `apps/api/src/secrets/password.ts`. No schema module reads
 * these — deliberately, and stated in `packages/shared/src/schemas/auth.ts`, which
 * models a password only as an inbound value and carries no memory, iteration or
 * parallelism value anywhere in it.
 */

/**
 * The variant to hash with: the hybrid one.
 *
 * The hybrid variant is what current guidance recommends for a password verifier,
 * because it is the only one of the three that defends against both classes of
 * attack at once — it takes the data-independent approach for the first half pass
 * over memory, which is what resists a side-channel, and the data-dependent
 * approach afterwards, which is what resists a graphics-processor attack. Either
 * single-purpose variant is strictly worse here for a reason that is knowable in
 * advance, so this is a named constant rather than a call-site default in order to
 * make the choice visible and reviewable.
 *
 * A STRING, NOT A NATIVE LIBRARY'S ENUM MEMBER, and that is a deliberate boundary.
 * This module is consumed by both runtimes, so it must not import — or even name
 * the type of — a binding that exists only on the server. The value is the
 * variant's registry name, which is also what the encoded verifier carries, so
 * `apps/api/src/secrets/password.ts` maps this identifier onto its binding's own
 * enumeration at the one place that binding is used. That mapping is a single
 * translation at the edge rather than a dependency running through the middle.
 */
export const ARGON2ID_ALGORITHM = 'argon2id' as const;

/**
 * How much memory one verification must fill, in kibibytes: 19 MiB.
 *
 * 19456 is 19 × 1024, written as the product below so the intent survives review —
 * a bare 19456 invites someone to "round it up" to 20480 without realising the
 * figure is a rung on a published ladder rather than an approximation. The product
 * types as `number` rather than as the literal, which costs nothing: a cost
 * parameter is consumed as a number and no consumer narrows on it.
 *
 * Memory is the parameter that matters most against a parallel attacker, because
 * it is the one that cannot be traded for silicon: a machine can add cores far
 * more cheaply than it can add memory per core, so a memory-hard verifier caps how
 * many guesses a given budget buys. This rung sits with two iterations and a single
 * degree of parallelism below; the ladder's other rungs — more memory with fewer
 * iterations, or less memory with more — provide equal defence and differ only in
 * how they spend a machine. This one is chosen because it is the rung whose memory
 * footprint a server can afford to hold per concurrent authentication without the
 * authentication path becoming the reason the process runs out of memory, which is
 * a denial-of-service surface in its own right.
 */
export const ARGON2ID_MEMORY_COST_KIB = 19 * 1024;

/**
 * How many passes over that memory one verification makes: two.
 *
 * The iteration count is the ladder's companion to the memory figure above, and the
 * pair is what defines the rung — two passes at 19 MiB is one of the equal-strength
 * combinations, and changing one without the other leaves the ladder rather than
 * moving along it. Two rather than one because a single pass is the ladder's
 * highest-memory rung, and this rung trades a second pass for a footprint a server
 * can hold per concurrent authentication.
 */
export const ARGON2ID_TIME_COST = 2;

/**
 * How many lanes one verification computes in: one.
 *
 * One lane, not more, and the reason is what parallelism does here rather than what
 * it sounds like it does. Raising the degree divides the SAME total memory across
 * more lanes, so each lane fills less of it and the sequential memory-hard work per
 * lane falls. What the defender buys is latency — the lanes compute alongside each
 * other — and an attacker who already has parallelism of their own gains from the
 * same change. A server that wants throughput gets it by handling requests
 * concurrently, which it already does, rather than by parallelising one
 * verification. One is also the degree the published rung specifies, so departing
 * from it would leave the rung rather than move along it.
 */
export const ARGON2ID_PARALLELISM = 1;

/* -------------------------------------------------------------------------- */
/* 5. THE REALTIME PROTOCOL PARAMETERS                                        */
/* -------------------------------------------------------------------------- */

/*
 * THE DOCTRINE THESE PARAMETERS SERVE, BECAUSE THE NUMBERS ARE MEANINGLESS
 * WITHOUT IT.
 *
 * The publish/subscribe bus that carries an event between server instances is
 * documented by its vendor as AT-MOST-ONCE. A message it drops is dropped
 * silently: there is no acknowledgement, no retry and no way for either end to
 * learn that it happened. The bus can therefore never be the source of truth for
 * ordering or for completeness, and no parameter below changes that — a shorter
 * interval or a larger window makes a loss less likely and never impossible.
 *
 * What IS authoritative is the durable per-conversation sequence, allocated inside
 * the same transaction as the write it numbers and enforced by a uniqueness
 * constraint on the conversation-and-sequence pair. A client persists its HIGHEST
 * CONTIGUOUS sequence — not the highest it has seen, which is the distinction the
 * whole design rests on, because a client that advanced past a hole would be
 * recording a gap as though it were filled. On reconnect it reconciles the gap over
 * HTTP before resuming live delivery, and live frames arriving during that
 * reconciliation are buffered in arrival order rather than applied or dropped.
 * Application is keyed by sequence, so an event that arrives twice is a no-op.
 *
 * `docs/decisions/realtime-contract.md` is the record: the ordering doctrine, the
 * cursor definition, the replay procedure and the fan-out path. It also carries the
 * options considered, the choice and the reasoning for every one of the ten
 * parameters below, in one table, on purpose — so that a reader can compare all ten
 * at once instead of assembling them from ten comments. This module holds the
 * values; that record holds the argument.
 *
 * TEN PARAMETERS, ELEVEN EXPORTS: the replay bound is exported under two names, one
 * defined from the other, for the reason its own note gives.
 *
 * ALL TEN ARE AUTHORED AND NONE IS OBSERVED. No frame evidences any of them,
 * because no frame can show a transport, so not one carries a frame citation.
 * `PROJECT_RULE_R3`'s absent-evidence clause still requires the mechanism, and the
 * standard it sets is the smallest coherent behaviour consistent with adjacent
 * evidenced behaviour — which is why every value below is at the low end of its
 * plausible range rather than generous.
 *
 * THEY ARE INVARIANTS RATHER THAN CONFIGURABLE DEFAULTS, and the reasoning is worth
 * stating because it looks at first like a rule violation. The clause that requires
 * an environment-overridable constant governs a value READ FROM A FRAME and
 * therefore uncertain as a product default. None of these is that: they are
 * protocol parameters, not product policy, and a deployment that changed one would
 * change what a client may assume about completeness — two instances of the same
 * product disagreeing about the replay bound is a correctness bug, not a
 * configuration difference. `docs/decisions/observed-values.md` keeps its table
 * closed at exactly the five values the environment template carries; adding ten
 * transport parameters there would break that closure rather than honour it.
 */

/**
 * How long a client waits before its first reconnection attempt, in milliseconds.
 *
 * Fast enough that a one-second network blip is invisible to the person, slow
 * enough not to hammer an instance that is still starting. A tenth of a second
 * makes a rolling restart look like an attack from every disconnected client at
 * once; a full second makes a blip something the person sees.
 */
export const REALTIME_BACKOFF_BASE_MS = 500;

/**
 * The longest a client waits between reconnection attempts, in milliseconds.
 *
 * The ceiling bounds how stale a recovering client can be. Thirty seconds keeps the
 * worst-case wait inside a person's patience for a recovery happening in the
 * background, while keeping the aggregate request rate from a large disconnected
 * population low enough that recovery does not itself become the outage.
 */
export const REALTIME_BACKOFF_CEILING_MS = 30_000;

/**
 * The jitter band applied to each computed backoff delay, as a ratio.
 *
 * A delay is drawn from the band between this fraction of the computed delay and
 * the whole of it. Jitter exists to break lockstep: without it, every client
 * disconnected by one event retries in the same instant for ever, and the
 * thundering herd is the failure this parameter is for. Half rather than full
 * because full jitter can draw a delay close to zero or close to the ceiling on any
 * attempt, which reintroduces long waits the ceiling was chosen to bound.
 */
export const REALTIME_BACKOFF_JITTER_RATIO = 0.5;

/**
 * How many times a client retries before it stops and offers a manual retry.
 *
 * Retrying for ever drains a battery and hides a real outage behind a spinner that
 * never resolves. Ten attempts at the base and ceiling above reach the last one
 * between one and two minutes after the drop, at which point the client stops and
 * offers an explicit retry — which is also the only retry affordance the corpus
 * evidences anywhere, so stopping here is consistent with observed behaviour rather
 * than merely defensible.
 */
export const REALTIME_BACKOFF_MAX_ATTEMPTS = 10;

/**
 * The largest per-conversation sequence gap a reconnecting client may replay, in
 * events, before the server answers with a refetch instead.
 *
 * Five hundred events covers a long break in a busy conversation while bounding one
 * replay request to a single indexed range scan over the conversation-and-sequence
 * tuple. A time-based window was rejected because a bound expressed in seconds says
 * nothing about how much work it authorises — a quiet hour and a busy minute would
 * buy wildly different amounts of it — and an unbounded replay is a denial-of-
 * service surface that any client can enter at any time.
 *
 * BEYOND THE BOUND THE ANSWER IS A REFETCH SIGNAL CARRYING NO EVENTS, never a
 * truncated range. A truncated replay is the worst available answer: the client
 * would apply a partial range and advance its cursor as though it were complete,
 * manufacturing exactly the silent gap the contiguous-cursor definition exists to
 * eliminate. The same answer is given to a client whose cursor is AHEAD of the
 * server's own highest sequence, which is a client whose stored state is
 * inconsistent with the server's — after a restore, or a schema change — where
 * starting again is the only safe response.
 *
 * Refetching is heavier than replay and that is the point: it is correct, and it is
 * rare. The bound keeps the replay path cheap rather than the recovery path cheap.
 *
 * Consumed by `apps/api/src/realtime/replay.ts`, which enforces it, and by
 * `apps/web/src/realtime/reconnect.ts`, which bounds its own buffer by the same
 * number so that a client too far behind to replay does not accumulate a buffer it
 * will discard. One constant, both ends: the whole reason it lives in this package
 * rather than in either application is that the server and the client cannot be
 * allowed to hold different ideas of the same window.
 */
export const REALTIME_REPLAY_WINDOW_EVENTS = 500;

/**
 * The replay-window bound, under the name the build specification uses for it.
 *
 * ONE VALUE, TWO NAMES, AND NO SECOND LITERAL. The bound is referred to as
 * `REALTIME_REPLAY_WINDOW_EVENTS` by `docs/decisions/realtime-contract.md` and by
 * `docs/decisions/http-api-contract.md`, and as the maximum-events form here by the
 * build specification for this module. Rather than leave one of those names
 * unresolved — which is what would push a consumer into writing the number at a
 * call site, the one outcome `PROJECT_RULE_R3` forbids outright — both names resolve,
 * and this one is DEFINED FROM the constant above rather than repeating its value.
 * The bound is written down exactly once, so the two names cannot come to disagree
 * about it however either is used.
 *
 * Either name may be imported. Prefer the shorter one in new code, since it is the
 * name the two contract records use.
 */
export const REALTIME_REPLAY_WINDOW_MAX_EVENTS = REALTIME_REPLAY_WINDOW_EVENTS;

/**
 * The shortest interval between two typing signals from one client, in
 * milliseconds.
 *
 * A typing signal only has to convey that someone is composing, so it does not need
 * to track keystrokes. Three seconds cuts a fast typist's traffic by two orders of
 * magnitude while the indicator still appears to respond immediately, because the
 * first keystroke emits at once and the interval only throttles what follows.
 *
 * A typing signal is EPHEMERAL AND NEVER PERSISTED. It is not a message, it has no
 * sequence, it is not replayed on reconnect, and nothing about it survives the
 * connection that carried it — which is exactly what makes it safe for the
 * at-most-once bus to drop one.
 */
export const TYPING_SIGNAL_MIN_INTERVAL_MS = 3_000;

/**
 * How long a typing indicator survives without a further signal, in milliseconds.
 *
 * Long enough that a person who keeps typing never flickers — it is two-and-a-bit
 * emission intervals, so a single dropped signal is invisible — and short enough
 * that someone who walks away mid-sentence stops appearing to type. This value must
 * stay a comfortable multiple of the interval above; the two are one decision
 * expressed as two numbers, and moving either alone breaks the property.
 */
export const TYPING_SIGNAL_TTL_MS = 8_000;

/**
 * How often a connected client refreshes its presence, in milliseconds.
 *
 * This sets the steady-state cost of presence outright: one write per connected
 * client per interval, and nothing else. Twenty seconds keeps that cost low at a
 * thousand sockets per instance while still detecting a departure inside a minute.
 */
export const PRESENCE_HEARTBEAT_INTERVAL_MS = 20_000;

/**
 * How long a presence record survives without a heartbeat, in milliseconds.
 *
 * Three heartbeat intervals, so two consecutive heartbeats can be lost — which the
 * at-most-once bus and an ordinary network make routine — without an account
 * flapping offline and back. One interval flaps on any hiccup; a longer multiple
 * leaves someone who has left showing as present for long enough to be misleading.
 * Keep this at three times the interval above if either changes.
 */
export const PRESENCE_TTL_MS = 60_000;

/**
 * How long presence changes are collected before one update is broadcast, in
 * milliseconds.
 *
 * One second collapses a sign-in burst into a single frame per account while staying
 * below the threshold at which a person perceives the indicator as lagging. No
 * window at all is the broadcast-storm case — every heartbeat fanned out to every
 * subscriber — and five seconds makes the indicator feel broken.
 */
export const PRESENCE_COALESCE_WINDOW_MS = 1_000;

/* -------------------------------------------------------------------------- */
/* WHAT MUST NEVER BE ADDED HERE                                              */
/* -------------------------------------------------------------------------- */

/*
 * Four kinds of value do not belong in this module, and each exclusion is a rule
 * rather than a preference. They are listed because this is a plausible place for
 * someone to reach for one, and because the failure each would cause is quiet.
 *
 *   - AN ENVIRONMENT READ, of any shape. No environment-variable lookup, no
 *     override hook, no "configurable in development" branch, not even a fallback.
 *     The lint configuration forbids the lookup outright in every workspace outside
 *     the environment module and the command-line tools. Every symbol above
 *     is an invariant precisely because a deployment may not weaken it, and for the
 *     verifier parameters an override IS the downgrade. Overridable values belong in
 *     `./env.ts`, are documented in the committed environment template, and are
 *     recorded in `docs/decisions/observed-values.md` — three views that move
 *     together (`PROJECT_RULE_R3`).
 *
 *   - AN AUTHORIZATION INPUT, of any shape. No role list, no capability map, no
 *     permission flag, no default workspace, no actor identifier. Roles live in
 *     `apps/api/src/authz/roles.ts` and the capability matrix in
 *     `apps/api/src/authz/matrix.ts`, sourced from `docs/decisions/role-matrix.md`,
 *     and a workspace is resolved server-side from the authenticated session and
 *     from nowhere else. A value imported by both runtimes could never be one an
 *     authorization decision rests on (`PROJECT_RULE_R1`).
 *
 *   - A CORPUS REFERENCE, of any shape. No directory constant, no filename, no
 *     glob, no frame path — citations name a frame by NUMBER and nothing else. The
 *     corpus must never reach a build output or a client bundle, and this module is
 *     re-exported into the browser bundle (`PROJECT_RULE_R2`, `PROJECT_RULE_R4`).
 *
 *   - USER-FACING WORDING, of any shape. Not a label, not a message, not a
 *     placeholder, not an error sentence. Every string a person reads is authored
 *     for this product in `packages/shared/src/copy/en.ts`; carrying one that is
 *     legible in a frame would reproduce a third party's copy, and carrying an
 *     original one here would put the product's voice in two places
 *     (`PROJECT_RULE_R4`, `PROJECT_RULE_R5`).
 *
 * And one thing that must never be DUPLICATED: any value above. A second literal
 * anywhere in the tree — a bare `80` in a form validator, a re-authored name
 * pattern, a visibility pair written out again, a hashing parameter at a call site,
 * a replay bound in either application — is the defect this module exists to
 * prevent, and it is the kind that only shows up once the two copies disagree.
 */
