/**
 * Derived types for the keyset-pagination contract.
 *
 * WHAT THIS MODULE IS
 *
 * Every type exported below is produced by `z.infer` over a schema that
 * `../schemas/pagination.js` exports, or by a derivation over such an inferred
 * type — an indexed access, an `Extract`, an `Exclude`. There is no schema here,
 * no runtime value and no hand-written shape. Nothing in this file survives
 * compilation: it emits declarations and nothing else, which is why the package
 * declares itself free of side effects and why the coverage configuration
 * excludes this directory from measurement rather than reporting it at zero.
 *
 * The consequence worth stating plainly is that this module cannot drift. A
 * shape has exactly one definition — the schema — and a type inferred from that
 * definition changes when the definition changes. An `interface` restating the
 * envelope's three members would be a second definition of one contract, and a
 * second definition is the thing that drifts, so none appears below. That
 * discipline is the same one the single-implementation rule imposes on the
 * component contracts: one contract, one place, extended rather than forked.
 *
 * WHERE EACH CANONICAL TYPE ALREADY LIVES
 *
 * The schema module already exports a derived type for most of its schemas, and
 * the codec beside it owns the tuple those schemas are written against. Those
 * declarations are load-bearing where they are and cannot be moved here. What
 * lives next door, and is therefore absent below:
 *
 *   - the parsed paged request, and the paged request as a caller writes one
 *     before defaults are applied;
 *   - the traversal-direction union;
 *   - the rejection-code union covering every way a request or an envelope can
 *     be refused;
 *   - the envelope's *schema* type, and the envelope written in terms of the
 *     item rather than the item's schema;
 *   - the cursor-resolution union a read path receives when it hands a caller's
 *     token to the resolver;
 *   - and, in the codec module, the conversation-and-sequence tuple itself
 *     together with the single rejection type both directions of the codec
 *     raise.
 *
 * This module does not restate any of them, and above all does not re-export
 * them under the same names. The package barrel flattens every module into one
 * namespace, so one name arriving from two modules is a compile error in a file
 * neither module owns — and that holds whether the barrel re-exports each module
 * wholesale or names its exports one by one. A consumer that wants one of the
 * names above imports it from the barrel exactly as it imports the names below;
 * from the outside the two modules are indistinguishable, which is the whole
 * point of the barrel and the reason nothing here needs to forward anything.
 *
 * WHAT LIVES HERE
 *
 * The remainder — the derived surface the schema module leaves underived. Three
 * kinds, and no fourth:
 *
 *   - a name for the opaque token, the one exported schema next door that has no
 *     derived type of its own;
 *   - the envelope keyed by the item's *schema* rather than by the item, derived
 *     from the builder's own return type, for the callers that hold a schema
 *     instead of a type;
 *   - narrowings: the two halves of the rejection-code union, split by who can
 *     act on a refusal, and the two branches of the cursor-resolution union
 *     together with its refusal code.
 *
 * THE REQUEST AND THE ENVELOPE ARE TWO CONTRACTS
 *
 * They are never merged below, and no bidirectional shape covering both appears.
 * What a caller may ask for and what a read path must return are different
 * obligations that happen to share a vocabulary: the request carries a page size
 * and a direction that no response echoes, and the envelope carries rows and a
 * has-more flag that no request may state. A single shape spanning both would
 * make every member optional in order to fit either direction, which is exactly
 * how a required member stops being required. Merging two contracts because they
 * look similar is the defect the single-implementation rule names outright.
 *
 * THERE IS NO NUMBERED POSITION IN THIS CONTRACT
 *
 * No type below carries a page index, a row count to skip, a start or end
 * ordinal, or a total. None may be added, and a convenience alias for one would
 * be the same breach as a field. A count of rows already seen carries no context
 * at all: the database has to fetch and discard everything ahead of it, and a row
 * inserted between two requests shifts every later row along, so the reader
 * receives one row twice and never sees another. Every conversation in this
 * product grows while it is being read, so that is wrong output rather than slow
 * output.
 *
 * A total is absent for a second reason on top of the first. Counting the rows
 * behind a keyset read is a traversal the composite index cannot answer as a
 * range scan, on every page — but more importantly a count is a projection in its
 * own right, because it reports how much exists. Rule R1 requires every
 * projection to be authorized independently, so a count needs its own decision
 * rather than riding along inside someone else's response, and no type here
 * offers it a place to ride.
 *
 * A CURSOR IS NEVER AN AUTHORIZATION INPUT
 *
 * A cursor is caller-supplied data in its entirety. It travelled out to a client,
 * sat wherever that client keeps it, and came back; what returns is an untrusted
 * echo of what was sent, and a token that decodes cleanly is evidence that this
 * product's codec minted the format and nothing more. The tuple inside one names
 * a conversation, and anyone can mint a well-formed cursor naming any
 * conversation at all, because any short string is a syntactically valid
 * identifier.
 *
 * So the obligation on every consumer of these types is exact, and rule R1 is
 * what imposes it: **the cursor confers no authority and is never an
 * authorization input.** The read path authorizes the conversation independently
 * — from the acting session and from the route, before any token is looked at —
 * and then rejects a cursor whose conversation differs from the one it
 * authorized. The resolver next door performs that comparison so no route has to
 * remember it, and the refusal has its own code, narrowed below. Nothing about
 * this file participates in that check: a type is erased before anything runs,
 * and no value acquires a property by being annotated with one.
 *
 * The codec module states the same boundary for the token itself. The repetition
 * is deliberate and directed at a different reader: this is the module a route or
 * a client author opens when they want the *shape* of a page, and the shape is
 * exactly where a cursor stops looking like caller input and starts looking like
 * part of the contract.
 *
 * ABSENCE IS SPELLED DIFFERENTLY ON THE TWO SIDES
 *
 * This is the detail consumers get wrong, and the two sides genuinely disagree,
 * so it is worth being precise rather than brief. It was read off the compiler
 * rather than assumed.
 *
 *   - **On the request, absence is omission.** The cursor is an optional property
 *     whose value type also includes the absent case, so the compiler accepts
 *     both leaving the property out and assigning it that case. Leave it out. The
 *     schema's own output for a first request omits the key, so a value carrying
 *     the key and holding nothing is a value the schema would never have
 *     produced: a presence test by key disagrees with the two forms, and
 *     serialising drops the assigned key, which makes a value that has crossed
 *     the wire unequal by key set to one that has not.
 *   - **On the envelope, absence is the null case.** The next cursor is not
 *     optional at all: the member is always present, and the end of the
 *     traversal is reported by its null value rather than by its absence. A read
 *     path that omits it produces an envelope its own schema rejects, and a
 *     client testing for the property rather than for the value concludes that
 *     every page is the last one.
 *
 * The has-more flag reports the same fact as the second form, and the schema
 * holds the two in agreement so they can never tell a client different stories.
 * Read either; do not compute one from the row count, which is the classic
 * off-by-one here.
 *
 * NO BOUND IS RESTATED HERE
 *
 * There is no number in this file, in a type or in a comment. The smallest page,
 * the default page, the largest page and the shortest token are each declared
 * exactly once in the schema module and reach these types only through the
 * schemas that consumed them, so there is nothing here to fall out of step with
 * one. A union enumerating the permitted page sizes would be the same mistake
 * written as a type: it would restate a bound at a point of use, and it would be
 * wrong the moment the bound moved.
 *
 * HOW TO CONSUME IT
 *
 * Through the package barrel — `@relay/shared` — and not by path. Inside this
 * package the sibling schema module is reached relatively, because that is how a
 * package is built; from outside, the barrel is the only entry point.
 */
import type { z } from 'zod';
import type {
  KeysetPositionResolution,
  PAGINATION_REJECTION,
  PagedEnvelope,
  PaginationRejectionCode,
  cursorTokenSchema,
  pagedEnvelopeSchema,
} from '../schemas/pagination.js';

/* -------------------------------------------------------------------------- */
/* The opaque token                                                           */
/* -------------------------------------------------------------------------- */

/**
 * A cursor as it crosses the API boundary: an opaque token, and nothing else.
 *
 * It resolves to text, and that is the point rather than a shortcoming. A
 * signature naming this says it takes a cursor — which is strictly more than
 * saying it takes a string — while leaving enforcement where enforcement
 * belongs: the schema runs the value through the codec and keeps only the
 * verdict, so a token that is not exactly what the encoder would have produced
 * is refused before it can reach a query.
 *
 * **Opaque is a constraint on the consumer, not a description of the bytes.** A
 * client receives one of these, holds it, and hands it back unaltered. It never
 * constructs one, never parses one, never mutates one, and never reasons about
 * what is inside it. The encoding is reversible for the server's convenience and
 * carries a version tag precisely so that it can be replaced without a
 * coordinated client release; anything a client inferred from the bytes would
 * break on that change, and correctly so. The decoded tuple therefore has no
 * representation in this contract, and giving it one here would invite a route to
 * read a conversation identifier off the wire and treat it as settled.
 *
 * A value typed as this has satisfied the compiler, which says nothing about
 * whether it satisfied the schema — and nothing whatsoever about whether the
 * caller holding it may read what it names. See the note on authorization above:
 * this is caller-supplied data wherever it appears.
 */
export type CursorToken = z.infer<typeof cursorTokenSchema>;

/* -------------------------------------------------------------------------- */
/* The envelope, keyed by the item's schema                                   */
/* -------------------------------------------------------------------------- */

/*
 * The schema module exports the envelope written in terms of the item, which is
 * the right form for a route that already has a type for its rows. The form
 * below is its counterpart for the callers that have a schema instead — the
 * place a paged read is assembled, where the item schema is the thing in hand
 * and its inferred type would have to be spelled out again to name the envelope.
 *
 * It is derived from the builder's own return type rather than from a restatement
 * of the envelope's members, so the type a read path returns and the schema that
 * validates it cannot drift apart. Deriving it from the builder specifically —
 * rather than from the envelope's schema type — binds it to the one function that
 * actually constructs these, which is what keeps the two in step if the
 * construction ever changes.
 */

/**
 * The parsed paged envelope for a given item *schema*.
 *
 * Hand it the schema for one row and it resolves to the envelope over that row's
 * inferred type: the rows, the next cursor, and the has-more flag. Use the
 * schema module's item-keyed form instead where a type for the row is what is
 * already in hand; the two describe the same envelope and neither restates it.
 *
 * The envelope has three members and no fourth. There is no total, and the
 * strict object next door is what enforces that rather than convention — an
 * envelope carrying one is rejected rather than quietly trimmed.
 */
export type PagedEnvelopeOf<TItemSchema extends z.ZodType> = z.infer<
  ReturnType<typeof pagedEnvelopeSchema<TItemSchema>>
>;

/**
 * The envelope's next cursor, named so the end of a traversal can be handled
 * without naming an item type to get at it.
 *
 * It is nullable and always present, and the distinction from the request's
 * optional cursor is the one thing to carry away: the traversal is over when this
 * holds the null case, never when the property is missing. It is read off the
 * envelope with an indexed access rather than restated, and it is deliberately
 * taken over an item type that constrains nothing, because the member does not
 * vary with the item — one name serves every paged read in the product.
 *
 * Handing the value back to the next request is the whole of its use. It is the
 * same untrusted token described above, and it acquires no authority by having
 * been minted by the server: the read path that receives it next authorizes the
 * conversation on its own terms and refuses a token that names a different one.
 */
export type PagedEnvelopeNextCursor = PagedEnvelope<unknown>['nextCursor'];

/* -------------------------------------------------------------------------- */
/* The rejection union, split by who can act on a refusal                     */
/* -------------------------------------------------------------------------- */

/*
 * The schema module exports the whole rejection-code union and documents that it
 * divides in two: some refusals report a request this contract does not accept,
 * which the caller can correct, and one reports an envelope that fails its own
 * contract, which no caller did and no caller can fix. The division decides what
 * is done with a code, so it is worth being able to say which half a value is in
 * — and the two halves below are the only place that is expressible in a type.
 *
 * Both are read off the union with `Extract` and `Exclude` rather than listed
 * beside it, and each is keyed by the rejection constant rather than by the code's
 * text. Listing the members again — even correctly — would be a second
 * enumeration of one vocabulary, and the second one is the one that is wrong
 * after the first one changes. Keying by the constant means a code that is
 * renamed follows automatically, and it keeps the codes themselves declared in
 * exactly one place.
 *
 * They partition the union: every code is in one half or the other, and none is
 * in both. A consumer that handles both handles all of them.
 */

/**
 * A refusal the caller can act on: a request this contract does not accept.
 *
 * Everything the request side can be refused for — an object carrying a field the
 * contract does not define, a token that is not one this product minted, a token
 * naming a conversation other than the authorized one, a page size that is not a
 * whole number within bounds, a direction that is not one of the two. These are
 * the codes a client surfaces through a validation presentation, because there is
 * something a caller could do differently.
 *
 * Derived by excluding the envelope's own code from the union, so that a refusal
 * added to the request side arrives here without this line being touched. That is
 * the direction the set actually grows in.
 *
 * One of these is not like the others, and the difference matters when a log is
 * being read rather than when a response is being written: the conversation
 * mismatch is either a client defect or a probe, while the rest are ordinary
 * mistakes. It is kept distinct further down for that reason.
 */
export type PagedRequestRejectionCode = Exclude<
  PaginationRejectionCode,
  typeof PAGINATION_REJECTION.malformedEnvelope
>;

/**
 * A refusal no caller caused: an envelope that does not satisfy its own contract.
 *
 * A missing or mistyped member, an unknown member such as a total, more rows than
 * a page may hold, or a next cursor that disagrees with the has-more flag. An
 * envelope is constructed by the server, so this reports a defect in a read path
 * and belongs in the log and in the failing test — never in a message to a
 * person, who can do nothing about it and was not the cause.
 *
 * It is narrowed to its own name so a handler cannot answer it the way it answers
 * the half above. Reporting a server-side defect back to a caller as though the
 * caller could correct it hides the defect from everyone who could.
 */
export type PagedEnvelopeRejectionCode = Extract<
  PaginationRejectionCode,
  typeof PAGINATION_REJECTION.malformedEnvelope
>;

/* -------------------------------------------------------------------------- */
/* Narrowing a cursor resolution                                              */
/* -------------------------------------------------------------------------- */

/*
 * A read path hands a caller's token and the conversation it has already
 * authorized to the resolver next door, and branches on the discriminant of what
 * comes back. Each type below names one branch by extracting it from that union,
 * which keeps a per-branch signature from having to spell out both — and keeps
 * the extraction honest, because a branch that gains a member gains it here too.
 *
 * The union is exhaustive by construction and the branches below preserve that:
 * handling both is handling every outcome, and there is no third case to forget.
 * What no type here can do is make the authorization decision. Resolving a token
 * establishes only that it decodes and that it names the conversation the caller
 * had already authorized by other means; the decision itself belongs to the
 * policy layer, against the acting session, before any of this is reached.
 */

/**
 * The resolver's success branch: a position to read from.
 *
 * The position is the conversation-and-sequence tuple the codec recovered, or the
 * null case when the caller sent no cursor — which means "start at the beginning"
 * rather than "something went wrong", and is the ordinary shape of a first
 * request. A read path that treats the null case as an error paginates nothing;
 * one that treats it as a position reads from a tuple it does not have.
 *
 * Success here is not permission. It reports that a token was well formed and
 * agreed with the conversation the caller had already been authorized for; the
 * authorization is what made that comparison meaningful, and it happened
 * earlier, elsewhere, against the session.
 */
export type KeysetPositionResolved = Extract<KeysetPositionResolution, { readonly ok: true }>;

/**
 * The resolver's refusal branch: the code to refuse with.
 *
 * Narrowed from the union so a handler that only deals with refusals — mapping
 * one to a status, or recording one — can name what it takes without carrying the
 * success branch through its signature.
 */
export type KeysetPositionRefused = Extract<KeysetPositionResolution, { readonly ok: false }>;

/**
 * Why a cursor was refused: exactly the two codes a resolution can carry.
 *
 * Read off the refusal branch with an indexed access, so it is derived from the
 * resolver's own contract rather than from a separate reading of the rejection
 * vocabulary. Both codes are members of the request-side half above; this is the
 * narrower set that one particular step can produce, which is what makes a
 * handler for it exhaustive over the outcomes it will actually see.
 *
 * The two are kept apart deliberately and should stay apart downstream. An
 * invalid token is ordinary — a token minted under a superseded version tag
 * produces one — and a read path may reasonably treat it as "start from the top
 * of history", which is already the behaviour for a caller holding no cursor at
 * all. A conversation mismatch is not ordinary: a well-formed cursor naming a
 * conversation other than the authorized one is either a client defect or a
 * probe, and rule R1 is the reason it is refused rather than served. Collapsing
 * the two would average the second into the first and make it invisible in a log.
 */
export type KeysetPositionRefusalCode = KeysetPositionRefused['code'];
