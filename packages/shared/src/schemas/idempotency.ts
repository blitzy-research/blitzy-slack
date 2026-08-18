/**
 * The idempotency-key contract every mutation carries.
 *
 * WHY THIS MODULE EXISTS AT ALL
 *
 * A send is optimistic. The client mints an identifier before it has spoken to
 * the server, renders its own message immediately from local state, and then
 * reconciles that rendered row against an acknowledgement carrying the
 * authoritative identifier and the durable per-conversation sequence. The
 * reconciliation contract itself is recorded in
 * `docs/decisions/realtime-contract.md` rather than restated here.
 *
 * Optimism has one hazard, and this module is the whole of the answer to it. The
 * client cannot distinguish a request that never arrived from a request that
 * arrived, committed, and whose acknowledgement was lost on the way back. Both
 * look identical from the composer: a row rendered, nothing heard. So the client
 * retries — and without a key, the second attempt writes a second message, which
 * the person reads as the product having duplicated what they said.
 *
 * WHY THE RETRY IS A CERTAINTY RATHER THAN A HYPOTHETICAL
 *
 * The corpus supplies exactly one failure rendering for this area: a pill at the
 * foot of the content region carrying one sentence that reports a failure and
 * invites a retry, with no control of any kind — no dismiss, no undo, and no
 * retry button, the invitation being plain sentence text
 * (`docs/workflows/03-messaging-and-composer.md` L639, frame 199). A retry with
 * no control is a person sending again. That is precisely the duplicate this key
 * removes, and it is why the mechanism is not optional.
 *
 * WHY NO FRAME COULD EVER HAVE SHOWN IT
 *
 * Two facts recorded by the catalog, not inferred here. The messaging area notes
 * that "no frame shows a send control being activated between the drafting
 * states and the sent state" (`docs/workflows/03-messaging-and-composer.md`
 * L137, frames 141 and 142) — the corpus holds a before and an after and never
 * an in-flight send. And the catalog states the general case outright: a capture
 * "can show a control, and it can never show an authorization check, an encoding
 * step, a retention bound or a consent record" (`docs/workflows/README.md`
 * L378). An idempotency mechanism is all four of those things and none of them
 * is photographable.
 *
 * The area document is explicit that this is an open work item rather than an
 * absence: its build obligation names "a send that failed after an optimistic
 * render" among the states it does not evidence
 * (`docs/workflows/03-messaging-and-composer.md` L726). Rule R3 governs from
 * there — an unevidenced mechanism ships in full, and the conflict path below is
 * implemented for exactly that reason even though nothing in the corpus depicts
 * it. The catalog does not mention idempotency anywhere; every decision in this
 * file is therefore authored, and each one says why it was taken.
 *
 * WHAT A KEY IS
 *
 * A client-generated, lexicographically sortable identifier, well-formedness
 * checked by the one canonical guard in `../util/ulid.js`. It is the client's
 * handle on a request whose outcome it has not yet learned.
 *
 * WHAT A KEY IS NOT — READ THIS BEFORE WRITING A HANDLER
 *
 * - **Not an authorization input, and not a capability.** It is caller-supplied
 *   data and it confers nothing whatsoever. Under rule R1 every mutation is
 *   authorized on the server at the point of execution, against the acting
 *   session and the specific target object, and no authorization decision may
 *   rest on a value a caller supplied. Holding a well-formed key is never
 *   evidence of permission to perform the request it accompanies. A handler that
 *   finds a recorded result for a key still owes the authorization check on the
 *   original operation — the recording is a memo of what was already decided,
 *   never a standing grant to decide it again.
 * - **Not a secret.** It travels in a header, is minted by the client, and is
 *   verified by nobody. No class of the credential contract applies to it, and
 *   it must not be treated as though one did: it needs no verifier at rest and
 *   confers no access if disclosed, because it confers no access at all.
 * - **Not the server's primary key.** The server keeps its own authoritative
 *   identifier and its own durable per-conversation sequence.
 * - **Not a uniqueness guarantee.** A generator makes a collision improbable and
 *   nothing more, and a client is free to send one value twice deliberately —
 *   which is the entire point. Uniqueness for the send path is enforced on the
 *   **conversation-and-client-identifier** pair as a database constraint in
 *   `packages/db/prisma/schema.prisma`, which is the only place it can be
 *   enforced rather than hoped for. Nothing in this file enforces it.
 *
 * THE SCOPING OBLIGATION THIS MODULE CANNOT ENFORCE, AND THE CONSUMER MUST
 *
 * A key is scoped **per actor, server-side**. The durable store is keyed by the
 * principal the acting session identifies together with the key — never by the
 * key alone. Three consequences, all of them the consumer's to honour:
 *
 *   1. A replay is served only to the **same authenticated session's principal**
 *      that performed the original mutation.
 *   2. Presenting somebody else's key must not return their result. Under a
 *      key-only store it would, which would turn a header into a read primitive
 *      over another person's outcome — a projection leak in the terms of rule R1,
 *      reachable without any of the product's read paths.
 *   3. The scoping actor comes from the session and never from the request. That
 *      is why **no shape declared below carries an identifier for a workspace, a
 *      user, an actor or a principal, in any spelling.** The absence is the
 *      contract: a field that could carry it is a field a caller could set.
 *
 * THE THREE STATES A ROUTE MUST HANDLE
 *
 * Every mutating route resolves a key into exactly one of these, and a route
 * that implements fewer than three is not idempotent:
 *
 *   1. **First use.** No record for this principal and key. Authorize, execute,
 *      and record the outcome together with a fingerprint of the request.
 *      Answered with the `executed` outcome.
 *   2. **Exact replay.** A record exists and the fingerprint matches. Do not
 *      execute again; return the recorded result. Answered with the `replayed`
 *      outcome, which is what lets a client tell a replay from a fresh execution
 *      without inferring it from a status code.
 *   3. **Reuse with a different request.** A record exists and the fingerprint
 *      differs. Reject with the conflict code; execute nothing. This is the case
 *      that makes a key *safe* rather than merely convenient — without it, one
 *      key reused against a different payload either silently returns an answer
 *      to a question nobody asked, or performs a second unintended write.
 *
 * RETENTION
 *
 * The durable store keeps a record for a bounded window and no longer, because a
 * key store that grows without limit is an availability problem rather than a
 * correctness one. **This module states no duration.** The window is a
 * configured value owned outside this file — a named default in the shared
 * configuration surface, consumed by reference — and the record itself lives in
 * `packages/db/prisma/schema.prisma`, which stores an absolute instant rather
 * than a duration so the configured default can change without invalidating what
 * is already stored. Rule R3 requires all three of those properties; restating a
 * number here would break the first of them.
 *
 * HOW THE PROJECT RULES ARE CITED BELOW
 *
 * By requirement label, R1 to R5, and never by full identifier. Each rule's full
 * identifier is prefixed with a third-party product name, and rule R4 keeps that
 * name out of source and comments alike — this file included. The label is
 * therefore the only citation form that lets this file name the rule governing it
 * without breaching the rule governing names. The label-to-identifier mapping is
 * published in the technical specification's rule cross-reference, and the full
 * text of every rule is available through the platform's rule interface.
 *
 *   R1 — authorization is server-side only; never trust a caller-supplied actor
 *   R2 — corpus and specification handling; the read-only inputs
 *   R3 — uncertainty is never permission to omit functionality
 *   R4 — third-party identity is never reproduced
 *   R5 — a shared component contract is implemented exactly once
 *
 * RULES THAT GOVERN THIS FILE
 *
 * - **R1** — set out above: the key confers no authority, the scoping actor comes
 *   from the session, and no shape here declares a workspace or actor identifier.
 * - **R3** — the header name, every bound and every property name this module
 *   writes more than once is declared once as a named constant and consumed by
 *   reference; the conflict mechanism ships despite no frame evidencing it; and
 *   no duration appears anywhere in the file.
 * - **R4** — no third-party product name in code or comment, no rendered
 *   user-facing prose (every rejection is a machine-readable code), and the one
 *   illustrative key below is authored rather than taken from the corpus.
 * - **R2** — this file sits under `packages/`, and every frame is cited by number
 *   alone. No frame was opened to write it: the catalog's prose settled every
 *   question, which is the order that rule requires.
 * - **R5** — one header constant, one key schema, one envelope helper. A route
 *   that declares its own header string or its own key pattern has created a
 *   second implementation of this contract, and the second one is the defect even
 *   if it agrees today.
 *
 * NAMING CONVENTIONS, FIXED HERE SO CONSUMERS CAN RELY ON THEM
 *
 * - Rejection codes are snake_case and machine-readable. Every check below
 *   overrides zod's default message with one, because the default is English
 *   prose from a dependency and this module renders none: prose belongs to the
 *   copy module, which this file does not import.
 * - Enumerated outcomes are lower case single words, stable across the wire.
 * - Every exported name is prefixed for this contract, so the package barrel can
 *   re-export the whole module without colliding with a sibling schema.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO
 *
 * - **No `.openapi()` call and no registration.** The header's description and
 *   example are attached where the specification is assembled, in
 *   `packages/shared/src/openapi/registry.ts`. The reason is structural rather
 *   than stylistic: the package barrel re-exports this module into the browser
 *   bundle, and an `.openapi()` call here would drag the specification generator
 *   in with it.
 * - **No framework import.** No server, no view library, no database client, no
 *   editor. The same module loads unchanged in a server runtime, a browser and a
 *   test runner, which is what allows one definition to validate on the server,
 *   type the client and generate the specification.
 * - **No storage, no hashing and no clock.** This file is the contract; the store
 *   is the database package's, the fingerprint algorithm is the server's, and the
 *   instant is server-assigned. The module is side-effect free.
 *
 * @see docs/workflows/03-messaging-and-composer.md — L137 (no in-flight send captured), L639 (the failure pill inviting a retry), L726 (the build obligation naming a failed optimistic send)
 * @see docs/workflows/README.md — L378 (a capture cannot show a retention bound), L384-L385 (`S-AUTHZ-OP`, `S-AUTHZ-READ`)
 * @see docs/decisions/realtime-contract.md — the acknowledgement and reconciliation contract
 * @see docs/decisions/gap-register.md — the unevidenced mechanism shipped here
 * @see packages/db/prisma/schema.prisma — the durable key store, and the conversation-and-client-identifier constraint
 * @see apps/api/test/integration/idempotency — first use, exact replay and conflict, proved per route
 * @see apps/api/test/integration/realtime — a socket dropped mid-send, which is a required case rather than an optional one
 */

import { z } from 'zod';

import { isValidUlid } from '../util/ulid.js';

/* -------------------------------------------------------------------------- */
/* Rejection codes                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Every way this contract can reject, as a machine-readable code.
 *
 * These are codes and not messages. A caller matches on them; a sentence for a
 * person is resolved from the copy module by whichever surface reports the
 * failure. Keeping prose out of this module is what allows one schema to serve
 * the server, the client and the generated specification without three different
 * wordings escaping into one contract.
 *
 * The absent and the malformed cases are kept apart deliberately. They are
 * different mistakes with different fixes — one caller forgot the header
 * entirely, the other sent something in it that is not a key — and collapsing
 * them into one code would leave a client unable to tell which correction to
 * make.
 */
export const IDEMPOTENCY_REJECTION = {
  /**
   * The header was absent from the request, or its value was `undefined`.
   * A mutating route rejects on this rather than proceeding without a key:
   * proceeding is how an unkeyed retry becomes a duplicate write.
   */
  missing: 'idempotency_key_missing',
  /**
   * The header was present but its value is not a well-formed key — the wrong
   * type, a truncated value, or a character outside the identifier's alphabet.
   */
  malformed: 'idempotency_key_malformed',
  /**
   * This principal has already used this key for a **different** request. The
   * route executes nothing and returns no recorded result, because the recorded
   * result answers a different question.
   */
  conflict: 'idempotency_key_conflict',
  /**
   * A stored request fingerprint that is not of the shape this contract fixes.
   * Server-side data, so this code reports a defect in the recording path rather
   * than bad input from a caller — which is why it is worth a distinct code.
   */
  fingerprintMalformed: 'idempotency_fingerprint_malformed',
  /**
   * An outcome, instant or conflict body that does not match the contract below.
   * Raised where a client validates a response, so a server that drifts from the
   * contract is caught at the boundary rather than mis-read as a fresh execution.
   */
  malformedResult: 'idempotency_malformed_result',
} as const;

/**
 * Schema for a rejection code, for any surface that transports one.
 *
 * Built from the registry above so the enumerable set and the union cannot drift:
 * one declaration, two views of it.
 */
export const idempotencyRejectionCodeSchema = z.enum(IDEMPOTENCY_REJECTION, {
  error: IDEMPOTENCY_REJECTION.malformedResult,
});

/** The union of every rejection code this contract can produce. */
export type IdempotencyRejectionCode = z.infer<typeof idempotencyRejectionCodeSchema>;

/* -------------------------------------------------------------------------- */
/* The header name — declared once, for the whole product                     */
/* -------------------------------------------------------------------------- */

/**
 * The request header that carries the key.
 *
 * **Declared in lower case on purpose.** Header field names are
 * case-insensitive on the wire, but a server runtime normalises them to lower
 * case before a handler sees them, so a header bag is keyed in lower case at
 * every point this constant is used to read one. Declaring the canonical
 * spelling here means no consumer has to remember to fold case, and a lookup
 * cannot miss a header that is present.
 *
 * **This is the only place the string exists.** Rules R3 and R5 both bear on
 * that: a route that writes its own header literal has created a second
 * declaration of this contract, and two declarations only have to disagree once —
 * on a typo, on a rename, on a hyphen — for a route to accept requests nobody
 * else sends and to silently stop being idempotent. Every route, the client
 * helper in `apps/web/src/api/idempotency.ts`, and the specification
 * registration all import this constant.
 *
 * The name itself is a conventional, vendor-neutral one for this purpose and
 * carries no product identity, as rule R4 requires of anything written here.
 */
export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';

/* -------------------------------------------------------------------------- */
/* The key                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * A well-formed idempotency key.
 *
 * **The well-formedness check is delegated, and that is the substance of this
 * schema rather than a detail of it.** `isValidUlid` in `../util/ulid.js` is the
 * single canonical check for the monorepo, and this module consumes it rather
 * than declaring a pattern of its own. There is deliberately no expression, no
 * character class and no length here: a second copy of the encoding rule is a
 * copy that can drift from the generator that mints these values, and rule R5's
 * single-implementation principle applies to a validation rule exactly as it does
 * to a component. The `ulid` package is not imported either — the dependency
 * stays in the one module that owns it.
 *
 * **The two rejection codes are separated by inspecting the input.** An absent
 * header arrives as `undefined` and is reported as missing; anything else that
 * fails is reported as malformed. Both paths are checked at the same boundary, so
 * a route gets the distinction for free from one parse.
 *
 * What the delegated check does and does not assert is worth knowing before
 * relying on it. It accepts a fixed-length string over an alphabet that omits
 * the four letters most easily misread, and it is case-insensitive even though a
 * generated key is upper case. It does not bound the embedded timestamp, so a
 * maximal string passes without describing a plausible instant — which is
 * harmless here, because a key is a lookup token and nothing about it is trusted.
 *
 * Above all, passing this schema means the value has the right *shape*. It says
 * nothing about who sent it and nothing about what they may do, per rule R1.
 *
 * An authored example of the shape, for readers rather than for machines:
 * `01JC7Q4M8XT2VZ0BHKR3NDPS6W`. It is invented for this comment — no value in
 * this file is taken from the corpus, as rule R4 requires.
 */
export const idempotencyKeySchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? IDEMPOTENCY_REJECTION.missing : IDEMPOTENCY_REJECTION.malformed,
  })
  .refine((value) => isValidUlid(value), { error: IDEMPOTENCY_REJECTION.malformed });

/** A well-formed idempotency key. */
export type IdempotencyKey = z.infer<typeof idempotencyKeySchema>;

/**
 * The type of the key schema, named so the envelope helper below can spell its
 * own return type without restating the schema's construction.
 */
export type IdempotencyKeySchema = typeof idempotencyKeySchema;

/* -------------------------------------------------------------------------- */
/* The request headers of a mutating route                                    */
/* -------------------------------------------------------------------------- */

/**
 * The header bag of a mutating request, validated for the key it must carry.
 *
 * **The property name comes from the constant, not from a literal.** The key is
 * written as a computed property so the header's spelling exists in exactly one
 * place in this file; typing it a second time here would be the first of the two
 * declarations rule R5 forbids, in the very module that owns the name.
 *
 * **Unknown keys are stripped rather than rejected, and that is deliberate.** A
 * real request carries dozens of headers this contract has no opinion about —
 * negotiation, tracing, caching, the session cookie. A closed object would reject
 * every one of them and therefore every real request, so the shape validates what
 * it owns and passes the rest by. The parsed output holds the key alone, which is
 * all a handler needs from it.
 *
 * **This is also the whole contract for a mutation with no body.** A route that
 * deletes or archives has nothing to compose an envelope around, and it is
 * complete when it validates this: the key is required either way. A route with a
 * body should reach for `mutationEnvelopeSchema` below instead, which validates
 * both halves in one parse.
 *
 * A caller that omits the header is rejected with the missing code, not merely
 * with a type error, because the key schema inspects the input to tell the two
 * apart.
 */
export const idempotencyKeyHeaderSchema = z.object({
  [IDEMPOTENCY_KEY_HEADER]: idempotencyKeySchema,
});

/** A validated header bag, carrying the key under its canonical lower-case name. */
export type IdempotencyKeyHeader = z.infer<typeof idempotencyKeyHeaderSchema>;

/* -------------------------------------------------------------------------- */
/* The request fingerprint — how a conflict is detected at all                 */
/* -------------------------------------------------------------------------- */

/**
 * Shortest stored fingerprint this contract accepts: a hexadecimal digest of the
 * smallest width worth recording.
 *
 * A fingerprint is only ever compared for equality, so its value is entirely in
 * being wide enough that two different requests do not collide into one. This
 * floor admits the narrowest digest that holds and refuses anything shorter,
 * including the empty string — which would otherwise make every request look
 * identical to every other and turn the conflict check into a silent no-op.
 */
export const IDEMPOTENCY_FINGERPRINT_MIN_LENGTH = 32;

/**
 * Longest stored fingerprint this contract accepts, admitting the widest digest
 * in ordinary use while still refusing an unbounded string.
 *
 * The ceiling exists so the store has a declared column width rather than an
 * open-ended one, and it is stated once here as rule R3 requires of a bound: the
 * schema below references it, and so does the record in
 * `packages/db/prisma/schema.prisma`.
 */
export const IDEMPOTENCY_FINGERPRINT_MAX_LENGTH = 128;

/**
 * The shape of a stored fingerprint: lower-case hexadecimal, anchored at both
 * ends so a partial match cannot pass.
 *
 * **This is not an identifier pattern, and it is not the pattern rule R5 keeps
 * out of this file.** The key's well-formedness is delegated to the canonical
 * guard and appears nowhere as an expression. This is a different value with a
 * different owner: a digest the *server* computes over a request it is recording.
 *
 * Fixing the encoding to one canonical case is what makes the comparison an exact
 * string equality instead of a normalisation problem. Two spellings of one digest
 * would compare unequal, and an unequal comparison here reports a conflict for a
 * request that was in fact identical — turning a safety mechanism into a
 * spurious rejection of a legitimate retry.
 */
export const IDEMPOTENCY_FINGERPRINT_PATTERN = /^[0-9a-f]+$/;

/**
 * A stored fingerprint of the request a key was first used for.
 *
 * **Server-computed, never accepted from a caller.** It appears in this contract
 * because the store holds it and the conflict check reads it, not because any
 * request carries it. A caller that could set its own fingerprint could make a
 * different request look identical to its first one and defeat the conflict check
 * entirely, which is why no request shape below carries this field.
 *
 * What the server hashes is its own decision and is deliberately unspecified
 * here — this contract fixes the stored shape, not the algorithm. The one
 * requirement the algorithm must meet is that it covers everything that makes the
 * request a different request, so that a retry of the same operation fingerprints
 * identically and a reuse against different data does not.
 */
export const idempotencyFingerprintSchema = z
  .string({ error: IDEMPOTENCY_REJECTION.fingerprintMalformed })
  .min(IDEMPOTENCY_FINGERPRINT_MIN_LENGTH, {
    error: IDEMPOTENCY_REJECTION.fingerprintMalformed,
  })
  .max(IDEMPOTENCY_FINGERPRINT_MAX_LENGTH, {
    error: IDEMPOTENCY_REJECTION.fingerprintMalformed,
  })
  .regex(IDEMPOTENCY_FINGERPRINT_PATTERN, {
    error: IDEMPOTENCY_REJECTION.fingerprintMalformed,
  });

/** A stored request fingerprint, in the one canonical encoding. */
export type IdempotencyFingerprint = z.infer<typeof idempotencyFingerprintSchema>;

/* -------------------------------------------------------------------------- */
/* Field names written more than once, so each is written once                 */
/* -------------------------------------------------------------------------- */

/**
 * The envelope property carrying the key.
 *
 * Declared as a constant for the same reason the header name is: it is written in
 * the schema and again in that schema's explicit type, and a name written twice
 * is a name that can be changed once. Consumers read the parsed value through
 * this property, so the constant is also what a route handler and the client
 * helper agree on.
 */
export const IDEMPOTENCY_KEY_FIELD = 'idempotencyKey';

/** The envelope property carrying the route's own payload. */
export const IDEMPOTENCY_PAYLOAD_FIELD = 'payload';

/** The response property discriminating a fresh execution from a replay. */
export const IDEMPOTENCY_OUTCOME_FIELD = 'outcome';

/** The response property carrying the route's own result. */
export const IDEMPOTENCY_RESULT_FIELD = 'result';

/**
 * The response property carrying the instant the original execution was recorded.
 *
 * An absolute instant rather than an age, per rule R3: an age is only true at the
 * moment it is computed, and a stored age would have to be rewritten on every
 * read to stay true.
 */
export const IDEMPOTENCY_FIRST_EXECUTED_AT_FIELD = 'firstExecutedAt';

/** The property carrying a rejection code on a conflict body. */
export const IDEMPOTENCY_CODE_FIELD = 'code';

/* -------------------------------------------------------------------------- */
/* The mutation envelope — the mechanism, not a convenience                    */
/* -------------------------------------------------------------------------- */

/**
 * The schema `mutationEnvelopeSchema` returns for a given payload schema.
 *
 * Named so a consumer can annotate a value of it, and so the helper's return type
 * is written out rather than inferred. An inferred return type would still be
 * correct today and would silently widen the day the shape changed; this one
 * fails the build instead.
 */
export type MutationEnvelopeSchema<TPayload extends z.ZodType> = z.ZodObject<{
  [IDEMPOTENCY_KEY_FIELD]: IdempotencyKeySchema;
  [IDEMPOTENCY_PAYLOAD_FIELD]: TPayload;
}>;

/**
 * Require a key alongside a route's payload, in one schema.
 *
 * **This is the mechanism that makes "every mutating endpoint carries a key" true
 * by construction rather than by review.** A route composes its payload schema
 * through this helper and gets the requirement enforced at its own boundary and
 * documented in the generated specification at the same time — because the
 * specification is generated from these schemas, a route that hand-rolls a header
 * gets neither. Making the helper pleasant to use is therefore a correctness
 * measure and not a courtesy.
 *
 * **Why the payload is nested rather than merged into.** Extending the payload
 * schema with a key field would restrict this helper to object schemas, when a
 * payload is legitimately a discriminated union, an array or a single value; and
 * it would mix a transport concern into the domain shape, so the key would appear
 * in the payload type every service function downstream had to accept. Nesting
 * keeps the two halves separable: `payload` is exactly what the domain layer
 * takes, and the key stays at the edge where it belongs.
 *
 * **How a route uses it.** The key arrives in a header and the payload in the
 * body, so a handler assembles both and parses once:
 *
 * ```ts
 * const envelope = mutationEnvelopeSchema(sendMessageRequestSchema);
 * const { [IDEMPOTENCY_KEY_FIELD]: key, [IDEMPOTENCY_PAYLOAD_FIELD]: payload } =
 *   envelope.parse({
 *     [IDEMPOTENCY_KEY_FIELD]: request.headers[IDEMPOTENCY_KEY_HEADER],
 *     [IDEMPOTENCY_PAYLOAD_FIELD]: request.body,
 *   });
 * ```
 *
 * One parse means a valid payload with a missing key cannot succeed, which is the
 * failure mode a separate header check invites: the body validates, the handler
 * proceeds, and the key check is the line somebody forgot to write.
 *
 * Building the schema per route rather than caching one is intentional. A schema
 * is a value, construction is cheap, and a module-level cache would be import-time
 * state — which the package's `sideEffects: false` declaration promises this file
 * does not create.
 *
 * @param payload The route's own request schema, of any shape.
 * @returns A schema requiring the key and the payload together.
 */
export function mutationEnvelopeSchema<TPayload extends z.ZodType>(
  payload: TPayload,
): MutationEnvelopeSchema<TPayload> {
  return z.object({
    [IDEMPOTENCY_KEY_FIELD]: idempotencyKeySchema,
    [IDEMPOTENCY_PAYLOAD_FIELD]: payload,
  });
}

/**
 * A parsed mutation envelope for a given payload schema.
 *
 * Spelled through the schema type above so the value type and the schema cannot
 * drift: there is one definition of the shape and this is a view of it.
 */
export type MutationEnvelope<TPayload extends z.ZodType> = z.infer<
  MutationEnvelopeSchema<TPayload>
>;

/* -------------------------------------------------------------------------- */
/* The replay contract — a client can tell the two apart                       */
/* -------------------------------------------------------------------------- */

/**
 * The two things that can have happened to a keyed mutation that succeeded.
 *
 * Declared as a list so the set is enumerable and the union below is derived from
 * it rather than restated beside it.
 */
export const IDEMPOTENCY_OUTCOMES = [
  /** The request was authorized, executed and recorded now. */
  'executed',
  /** The request had already been executed; this is the recorded result. */
  'replayed',
] as const;

/**
 * Which of the two happened, as a value a client can branch on.
 *
 * **Reported in the body rather than left to a status code.** A status code
 * cannot carry this distinction honestly: a replay is a success and would have to
 * reuse the same code as a fresh execution, so a client inferring the difference
 * from the code would be guessing. Naming it explicitly is what lets a client
 * treat a replay as settled rather than re-entering a retry loop it can never
 * leave.
 */
export const idempotencyOutcomeSchema = z.enum(IDEMPOTENCY_OUTCOMES, {
  error: IDEMPOTENCY_REJECTION.malformedResult,
});

/** Whether a result was executed now or replayed from a record. */
export type IdempotencyOutcome = z.infer<typeof idempotencyOutcomeSchema>;

/**
 * An absolute instant, expressed in coordinated universal time.
 *
 * Rule R3 requires that a record store an absolute timestamp rather than a
 * duration, so a configured default — the retention window among them — can change
 * without invalidating what is already stored. A local time without a zone and a
 * time carrying a numeric offset are both rejected: the first is ambiguous, and
 * the second invites a caller to assert its own clock's relationship to the truth.
 * One representation means a stored instant compares and sorts without
 * normalisation.
 */
export const idempotencyInstantSchema = z.iso.datetime({
  offset: false,
  error: IDEMPOTENCY_REJECTION.malformedResult,
});

/** An absolute instant as this contract carries it. */
export type IdempotencyInstant = z.infer<typeof idempotencyInstantSchema>;

/**
 * The type `idempotentResultSchema` returns for a given result schema.
 *
 * A discriminated union rather than one object with a flag, for two reasons that
 * both pay off at the call site. The branches are genuinely not the same shape —
 * only a replay can say when the original ran — so a single object would have to
 * make that instant optional and let a fresh execution carry one, which is a state
 * that cannot occur. And a union narrows: a consumer that switches on the outcome
 * gets the instant typed as present in the branch where it is present, and gets a
 * build failure if it forgets a branch.
 */
export type IdempotentResultSchema<TResult extends z.ZodType> = z.ZodDiscriminatedUnion<
  [
    z.ZodObject<{
      [IDEMPOTENCY_OUTCOME_FIELD]: z.ZodLiteral<'executed'>;
      [IDEMPOTENCY_RESULT_FIELD]: TResult;
    }>,
    z.ZodObject<{
      [IDEMPOTENCY_OUTCOME_FIELD]: z.ZodLiteral<'replayed'>;
      [IDEMPOTENCY_RESULT_FIELD]: TResult;
      [IDEMPOTENCY_FIRST_EXECUTED_AT_FIELD]: typeof idempotencyInstantSchema;
    }>,
  ]
>;

/**
 * Wrap a route's result so the caller learns which of the two happened.
 *
 * The result itself is identical in both branches, and that is the guarantee
 * rather than an incidental symmetry: a replay returns *the recorded result of the
 * original execution*, not a fresh computation that happens to look similar. A
 * route that recomputes on replay has not implemented this contract — it has
 * implemented a second execution that reports itself as a replay.
 *
 * The replayed branch additionally carries the instant the original was recorded.
 * It is genuinely useful rather than decorative: it is how a client can tell a
 * retry it issued moments ago from a key it is reusing from a much older session,
 * and it is the only way a client can reason about the recorded outcome's age
 * without being told the retention window, which this module deliberately does not
 * state.
 *
 * ```ts
 * const response = idempotentResultSchema(sentMessageSchema).parse(body);
 * if (response[IDEMPOTENCY_OUTCOME_FIELD] === 'replayed') {
 *   // Settled already. Reconcile the optimistic row; do not send again.
 * }
 * ```
 *
 * @param result The route's own result schema, of any shape.
 * @returns A discriminated union over the fresh and replayed cases.
 */
export function idempotentResultSchema<TResult extends z.ZodType>(
  result: TResult,
): IdempotentResultSchema<TResult> {
  return z.discriminatedUnion(IDEMPOTENCY_OUTCOME_FIELD, [
    z.object({
      [IDEMPOTENCY_OUTCOME_FIELD]: z.literal('executed'),
      [IDEMPOTENCY_RESULT_FIELD]: result,
    }),
    z.object({
      [IDEMPOTENCY_OUTCOME_FIELD]: z.literal('replayed'),
      [IDEMPOTENCY_RESULT_FIELD]: result,
      [IDEMPOTENCY_FIRST_EXECUTED_AT_FIELD]: idempotencyInstantSchema,
    }),
  ]);
}

/**
 * A parsed result envelope for a given result schema.
 *
 * Spelled through the schema type so the value type and the schema cannot drift.
 */
export type IdempotentResult<TResult extends z.ZodType> = z.infer<IdempotentResultSchema<TResult>>;

/* -------------------------------------------------------------------------- */
/* The conflict — the third state, and the one that makes a key safe           */
/* -------------------------------------------------------------------------- */

/**
 * The body returned when a key is reused for a different request.
 *
 * **Why this exists even though no frame shows it.** Nothing in the corpus depicts
 * a key being reused, and nothing could: the area document records a failed
 * optimistic send among the states it does not evidence
 * (`docs/workflows/03-messaging-and-composer.md` L726) and rule R3 makes that an
 * open work item rather than permission to leave the case unhandled. Without this
 * state a route facing a reused key has only two options, and both are bugs: hand
 * back the recorded result, which answers a question the caller did not ask, or
 * execute the new request, which is the duplicate write the key existed to
 * prevent.
 *
 * **What it deliberately does not carry.** Not the recorded result, and not the
 * stored fingerprint. Returning the result would be the first of those two bugs
 * dressed as an error. Returning the fingerprint would disclose a digest of an
 * earlier request in exchange for nothing a client can act on. The instant is
 * carried because it is the one fact that helps: it tells the caller *when* it
 * used this key before, which is what makes a reuse diagnosable rather than
 * mysterious.
 *
 * Closed against unknown keys, unlike the header bag above: this shape is
 * assembled by the server and read by the client, so an unexpected property is a
 * contract violation worth surfacing rather than noise to be tolerated.
 */
export const idempotencyConflictSchema = z.strictObject({
  [IDEMPOTENCY_CODE_FIELD]: z.literal(IDEMPOTENCY_REJECTION.conflict, {
    error: IDEMPOTENCY_REJECTION.malformedResult,
  }),
  [IDEMPOTENCY_FIRST_EXECUTED_AT_FIELD]: idempotencyInstantSchema,
});

/** The body of a conflict rejection. */
export type IdempotencyConflict = z.infer<typeof idempotencyConflictSchema>;
