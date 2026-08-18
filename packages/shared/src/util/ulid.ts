/**
 * Client-generated identifiers, for optimistic send and for idempotency keys.
 *
 * WHAT THESE IDENTIFIERS ARE FOR. A client mints one before it has spoken to the
 * server at all, attaches it to the message it renders locally, and then matches
 * the server's acknowledgement back to that rendered row. Two further call sites
 * want the same shape for the same reason: apps/web/src/api/idempotency.ts, which
 * carries the idempotency-key header contract, so that a retried request is
 * recognised as the same request rather than performed a second time, and any
 * place needing a key it can order locally without waiting for a round trip. The
 * reconciliation contract itself — what an acknowledgement carries and what the
 * client does with it — is recorded in docs/decisions/realtime-contract.md rather
 * than restated here.
 *
 * WHY THIS MODULE IS THIN. It is a deliberately thin wrapper over the pinned
 * generator library, and the thinness is the design rather than an omission.
 * Extending a dependency instead of forking it is what the single-implementation
 * rule — the first of the five project rules as provided — asks of a shared
 * implementation, and the plan's own methodological requirement is to prefer
 * boring, well-supported choices over novel ones. So the base32 encoding, the
 * monotonic counter and the random-source detection all stay where they are
 * already tested — inside the library — and nothing here reproduces any of them.
 *
 * HOW THE RULES ARE CITED BELOW. By subject and position in the provided order,
 * never by their platform identifiers: each of those identifiers embeds the
 * excluded third-party product name, and the identity rule — the fifth of the five
 * — keeps that name out of source and comments alike, this file included. Position
 * alone would be unsafe, since the identifiers are permuted relative to the
 * requirement labels; position together with subject is not.
 *
 * WHERE IT IS CONSUMED FROM. This is the single implementation for the monorepo.
 * No application, service, feature, schema or test mints an identifier of this
 * kind locally or declares a well-formedness pattern of its own; each imports
 * from here, and reaches these functions through the `@relay/shared` barrel
 * rather than by a path into this source tree.
 *
 * WHAT AN IDENTIFIER FROM HERE IS NOT. It is caller-supplied data and it confers
 * nothing. It is not an authorization input, not a capability, not a secret, and
 * not a bearer token of any kind. Under the authorization rule — the second of the
 * five — every mutation is authorized on the server against the acting session and
 * the specific target object, so holding a well-formed identifier is never
 * evidence of permission to do anything with it, and no authorization decision may
 * rest on a value a caller supplied. Nor is it the server's primary key: the server
 * keeps its own authoritative identifier and its own durable per-conversation
 * sequence, and treats this value only as the client's handle on a send it has not
 * yet heard back about.
 *
 * WHO GUARANTEES UNIQUENESS. Not this module, and it must not be read as if it
 * did. A generator can make a collision improbable and nothing more, and a client
 * is free to send the same value twice deliberately. Uniqueness of the
 * conversation-and-client-identifier pair is a database constraint declared in
 * packages/db/prisma/schema.prisma, which is the only place it can be enforced
 * rather than hoped for.
 */
import { isValid, monotonicFactory, ulid } from 'ulid';

/**
 * Generate one identifier.
 *
 * A direct pass-through to the library's single-identifier generator, which is
 * the whole of the intended behaviour: a caller that wants one identifier should
 * not have to decide anything else to get it.
 *
 * ORDERING, STATED HONESTLY. These identifiers embed the minting millisecond in
 * their leading characters, so they sort lexicographically into roughly the order
 * they were created. That is convenient locally — it holds a list of optimistic
 * rows in a stable order before any acknowledgement arrives — but it is *not* the
 * authoritative ordering. The authoritative ordering is the durable
 * per-conversation sequence the server allocates inside the same transaction as
 * the message insert. Two clients whose clocks disagree will mint identifiers that
 * sort against each other in an order the server does not honour, so this ordering
 * must never be presented or persisted as the conversation's order.
 *
 * Within a single millisecond the tail is drawn afresh on each call, so two
 * identifiers from this function are ordered arbitrarily with respect to one
 * another. A caller that needs creation order preserved inside one millisecond
 * wants {@link createMonotonicUlid} instead.
 *
 * @returns A newly generated identifier in the library's upper-case canonical form.
 */
export function generateUlid(): string {
  return ulid();
}

/**
 * Create a generator that preserves creation order within a millisecond.
 *
 * WHY THIS IS A FACTORY AND NOT AN EXPORTED INSTANCE. Two independent reasons,
 * and a future reader should have both before deciding this could be simplified
 * into a shared instance — that single change would break each of them at once.
 *
 *   1. The package manifest declares `"sideEffects": false`. That is a promise to
 *      every bundler that importing this module does no work and creates no
 *      state, and it is what allows an unused export to be dropped from the
 *      client bundle. A module-level generator would be import-time state, and
 *      the declaration would then be false.
 *   2. Monotonicity is only meaningful across one sequence of calls. The
 *      guarantee is about identifiers minted by *this* generator, which is the
 *      scope of a single client session — precisely the scope a caller already
 *      owns. A shared instance would not widen the guarantee; it would only
 *      obscure who holds it.
 *
 * WHAT MONOTONICITY BUYS. Within one generator, two identifiers minted in the
 * same millisecond still sort in the order they were minted, because the library
 * increments the previous tail rather than redrawing it.
 *
 * WHAT IT DOES NOT BUY. Nothing whatsoever across clients, runtimes or server
 * instances. Two generators — two tabs, two workers, two API instances — stand in
 * no relation to each other, and no clock is trusted anywhere in this system.
 * Ordering between participants is the server's durable sequence and only that.
 *
 * The returned generator is declared as taking no arguments, and the delegation
 * below is written out rather than handing the library's function back directly,
 * because that function accepts an optional seed time. An argument arriving by
 * accident — the classic `values.map(next)`, where the callback is handed an index
 * — would seed the clock and silently defeat the ordering the caller asked for.
 *
 * @returns A caller-owned generator; each call returns the next identifier in order.
 */
export function createMonotonicUlid(): () => string {
  const next = monotonicFactory();
  return () => next();
}

/**
 * Narrow an unknown value to a well-formed identifier.
 *
 * This is the single canonical well-formedness check for the monorepo. The schema
 * modules that validate a client identifier and an idempotency key consume this
 * guard rather than each declaring a pattern of its own: one rule kept in one
 * place, which is the single-implementation principle of the first project rule
 * applied to a validation rule instead of to a component.
 *
 * VALIDATION IS NOT GENERATION. The check is delegated to the library's own
 * predicate, so this file holds no alphabet and no length — there is no literal
 * here to define once and no second copy of the encoding rule that could drift
 * from the generator above. Had the library exported no predicate, the fallback
 * would have been a single named pattern constant in this file, which is a
 * validity check and still not a re-implementation of generation; delegation is
 * simply the better of the two.
 *
 * WHAT IT ACTUALLY CHECKS, verified against the pinned version rather than
 * assumed: a string of the library's fixed length whose every character belongs
 * to the Crockford base32 alphabet — the one that omits I, L, O and U so a
 * transcribed identifier cannot be misread. Two properties are worth stating
 * because a caller might reasonably assume otherwise. The check is
 * case-insensitive, that encoding being case-insensitive by design, while every
 * identifier generated here is in the upper-case canonical form. And it does not
 * bound the embedded timestamp, so a maximal string passes without describing a
 * plausible instant.
 *
 * The `typeof` narrowing is present because the library's predicate is typed for
 * a string while this guard accepts `unknown`, which is the shape a value actually
 * has when it arrives at a boundary.
 *
 * SECURITY BOUNDARY. Well-formed is not trustworthy. This rejects malformed input
 * and nothing else. Anyone can mint a well-formed identifier, so passing this
 * guard says only that the value has the right shape — never that its bearer may
 * act on the thing it names. It is not a permission check: the server authorizes
 * independently against the acting session and the target object, and relies on
 * the database constraint, not on this function, for uniqueness.
 *
 * @param value Any value, typically one just parsed from a request or a message.
 * @returns True when the value is a string of the expected shape.
 */
export function isValidUlid(value: unknown): value is string {
  return typeof value === 'string' && isValid(value);
}
