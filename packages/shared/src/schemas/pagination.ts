/**
 * The pagination contract: the request every paged read accepts, the envelope
 * every paged read returns, and the bounds both are held to.
 *
 * ONE SHAPE, DEFINED ONCE
 *
 * Message history, channel browsing, member lists and bookmark lists are four
 * different reads with one traversal. They share {@link pagedRequestSchema} for
 * what a caller may ask for and {@link pagedEnvelopeSchema} for what comes back,
 * and a route that needs filters of its own extends the request rather than
 * restating it. Nothing in the product declares its own `{ items, nextCursor }`
 * pair: a second envelope is a second contract, and the client discovers the
 * divergence at the point where one read paginates and another silently stops.
 *
 * THE KEYSET IS THE CONVERSATION-AND-SEQUENCE TUPLE
 *
 * A position is not a count of rows already seen. It is the conversation being
 * read plus the durable per-conversation sequence of the last row the reader
 * received, and the next request asks for what follows that tuple. The pair
 * carries a uniqueness constraint and a composite index in
 * `packages/db/prisma/schema.prisma`, and both halves are load-bearing for
 * different reasons: the constraint is what makes one position name at most one
 * message, and the index is what makes the read fast. Declaring the two columns
 * without the composite index leaves the predicate correct and slow — the
 * database finds the conversation's rows and then sorts them on every page, at a
 * cost that grows with the conversation — so the field is only half the
 * mechanism.
 *
 * WHY A SEQUENCE CAN BE A KEY AT ALL
 *
 * The sequence is allocated transactionally: inside the same transaction as the
 * message insert, under a lock on the conversation's counter row. A native
 * database sequence object is rejected for this, because sequences are
 * non-transactional and hand out a value that a rollback does not give back —
 * the gap it leaves is permanent, and a reader waiting for a contiguous position
 * would wait for a message that will never exist. Allocating from an ordinary
 * row inside the ordinary transaction is what makes the sequence gapless and
 * monotonic within a conversation, and that property is precisely what a keyset
 * predicate depends on. A key that skipped values would still order rows; it
 * would stop being usable as the thing a reader reconciles against.
 *
 * WHAT THIS COSTS THE WHOLE STACK, AND WHY IT IS WORTH IT
 *
 * Keyset traversal is not a query-level tactic that the layers above can ignore.
 * A caller passes a whole keyset or it passes nothing: there is no numbered
 * position anywhere in this contract, and none may be added. Counting rows
 * instead carries no context at all — the database has to fetch and discard
 * everything ahead of the requested position, and a row inserted between two
 * requests shifts every later row along, so the reader receives one row twice
 * and never sees another. Every conversation in this product grows while it is
 * being read, so that is a correctness defect rather than an inefficiency. The
 * one thing given up is the arbitrary jump — no caller can ask for the tenth
 * page — and the only consumer is an infinite scroll in `apps/web`, built on an
 * infinite query over this envelope, which never wanted one.
 *
 * A CURSOR IS NEVER AN AUTHORIZATION INPUT
 *
 * A cursor is caller-supplied data in its entirety, and rule R1 forbids resting
 * an authorization decision on anything a caller supplied. Three consequences
 * are structural in this module rather than advisory:
 *
 *   1. The request declares no workspace identifier and no acting-account
 *      identifier. Both are derived server-side from the session, and the field
 *      is not offered at all so that no handler can be tempted to read one from
 *      the wire. Adding either to this schema would be the breach, not merely
 *      the opportunity for one.
 *   2. The conversation identifier recovered from a cursor is an untrusted echo
 *      of what the caller sent. The obligation it places on every consumer is
 *      exact: the read path authorizes the conversation independently, from the
 *      session and the route, and then rejects a cursor whose conversation
 *      differs from the one it authorized. {@link resolveKeysetPosition}
 *      performs that comparison so no route has to remember it. The sibling
 *      codec `packages/shared/src/util/cursor.ts` states the same boundary; the
 *      repetition is deliberate, because this is the module a route author
 *      opens.
 *   3. A paged read is a projection, and rule R1 requires every projection — a
 *      count, a search result, a link preview and its resolution, a member list,
 *      a facepile, an autocomplete suggestion, a notification — to be authorized
 *      independently. Recovering a position from a token establishes only that
 *      this codec minted the token. It establishes nothing whatsoever about the
 *      caller's right to read what the token names, and nothing in this module
 *      can establish that: it holds no session, no policy and no database
 *      handle.
 *
 * WHERE THE NARRATIVE LIVES
 *
 * The prose counterpart of this contract — the endpoints that accept a cursor,
 * the query parameters they carry and the responses they return — is
 * `docs/decisions/http-api-contract.md`. It is referenced here and authored
 * elsewhere. The durable-sequence and composite-index decisions summarised above
 * are recorded in `docs/decisions/data-model.md`.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO
 *
 * It carries no user-facing prose. Every rejection is a stable machine-readable
 * code from {@link PAGINATION_REJECTION}, and zod's own defaults are overridden
 * on every check so that no English sentence from a dependency escapes into a
 * contract that the server validates with, the client types from and the
 * specification is generated from. Wording is a rendering concern and belongs to
 * the presentation layer.
 *
 * It also attaches no specification metadata. No `.openapi` annotation is
 * attached here: descriptions and examples are attached at registration time in
 * `packages/shared/src/openapi/registry.ts`. The reason is structural rather
 * than stylistic — the package barrel re-exports this module into the browser
 * bundle, and an annotation call here would drag the specification generator in
 * with it.
 *
 * The module is pure and side-effect free, which is what the package's
 * `"sideEffects": false` declaration promises a bundler: it builds schemas from
 * literals at import time and does nothing else.
 */

import { z } from 'zod';

import { InvalidCursorError, decodeKeysetCursor, type KeysetCursor } from '../util/cursor.js';

/* -------------------------------------------------------------------------- */
/* Rejection codes                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Every way a paged request or a paged envelope can be rejected, as a stable
 * code rather than a sentence.
 *
 * A code identifies which rule was broken, not merely that something was wrong,
 * so `apps/web` can map the set exhaustively onto the validation presentations
 * it implements and a log line stays greppable across a wording change.
 *
 * The set divides into two halves, and the division matters when deciding what
 * to do with one. The first four are caller-facing: a request arrived that this
 * contract does not accept, and the caller can correct it. The last is not — an
 * envelope is constructed by the server, so an envelope rejection reports a
 * defect in a read path rather than anything a caller did, and it belongs in the
 * log and the failing test rather than in a message to a person.
 */
export const PAGINATION_REJECTION = {
  /** The request was not an object, or carried a field this contract does not define. */
  malformedRequest: 'pagination_malformed_request',
  /**
   * The cursor is not a token this product's codec produced: tampered,
   * truncated, re-encoded, or minted under a superseded version tag. The read
   * path may treat this as "start from the top of history", which is already
   * the behaviour for a caller holding no cursor at all.
   */
  cursorInvalid: 'pagination_cursor_invalid',
  /**
   * The cursor decoded cleanly and names a different conversation than the one
   * the read path authorized. This is the rejection rule R1 requires of every
   * consumer: a well-formed cursor is not evidence of permission, and any short
   * string is a syntactically valid identifier, so a caller can construct a
   * well-formed cursor naming any conversation at all.
   */
  cursorConversationMismatch: 'pagination_cursor_conversation_mismatch',
  /**
   * The requested page size is not a whole number within the bounds this module
   * declares. One code covers every check on that field, because a fraction, a
   * zero and a value above the ceiling are one mistake from the caller's side.
   */
  pageSizeOutOfRange: 'pagination_page_size_out_of_range',
  /** Not one of the two traversal directions a keyset read can take. */
  invalidDirection: 'pagination_invalid_direction',
  /**
   * The envelope does not satisfy its own contract — a missing or mistyped
   * member, more items than a page may hold, an unknown member such as a total
   * count, or a next cursor that disagrees with the has-more flag. Server-side
   * defect, never a caller's.
   */
  malformedEnvelope: 'pagination_malformed_envelope',
} as const;

/** Schema for a rejection code, for any surface that transports one. */
export const paginationRejectionCodeSchema = z.enum(PAGINATION_REJECTION, {
  error: PAGINATION_REJECTION.malformedRequest,
});

/** The union of every rejection code this module can produce. */
export type PaginationRejectionCode = z.infer<typeof paginationRejectionCodeSchema>;

/* -------------------------------------------------------------------------- */
/* Bounds — each declared once, consumed by reference                         */
/* -------------------------------------------------------------------------- */

/*
 * These four values are authored rather than observed, and the distinction is
 * recorded here because rule R3 turns on it.
 *
 * The workflow catalog specifies no numeric pagination vocabulary anywhere in
 * its twenty-five documents. It names no page size, no per-page count for any
 * surface this phase builds, and no cursor of any kind. The single numbered
 * position it records belongs to a deferred search surface's result grid
 * [docs/workflows/README.md:L343], and the pagination-row contract that renders
 * one is cited by no in-phase area [docs/workflows/README.md:L253]. So there is
 * no frame reading behind any number below and none is claimed: each is a
 * chosen default with its reasoning stated, which is what the rule asks for
 * where evidence is absent.
 *
 * They live in this module rather than in the environment-overridable
 * configuration module for two reasons. They are structural properties of the
 * wire contract rather than product durations, thresholds or expiries — the same
 * placement `packages/shared/src/schemas/preference.ts` records for its own
 * bounds. And they are compiled into the generated API specification, so a value
 * that an environment variable could move would make the committed
 * specification a statement about one deployment instead of about the contract.
 *
 * What the rule does forbid is a bound restated at a point of use. Each of these
 * is declared exactly once and reached by reference everywhere, including inside
 * this module.
 */

/**
 * The smallest page a caller may ask for.
 *
 * One, not zero. A page of one is a legitimate request — a probe, a test, the
 * tail of a traversal — while a request for no rows is a mistake worth reporting
 * rather than serving: it returns nothing, advances no position, and leaves the
 * has-more flag describing a page that was never read.
 */
export const MIN_PAGE_SIZE = 1;

/**
 * The page a caller receives when it asks for no particular size.
 *
 * Sized to fill the first screen and leave scroll headroom, so the common case
 * costs one round trip rather than two. The effective product viewport is
 * 1920 × 1200 [docs/workflows/README.md:L929] and a message row occupies a
 * measured pitch, which puts a content region's worth of comfortable-density
 * history in the low tens of rows; fifty covers that with room to scroll before
 * the next fetch is needed. It is also small enough that the per-item work a
 * read path performs — projection authorization included — stays bounded on the
 * request that a person is waiting for.
 */
export const DEFAULT_PAGE_SIZE = 50;

/**
 * The largest page a caller may ask for, whatever it asks for.
 *
 * Four times the default, so a taller viewport or a catch-up fetch after a long
 * absence can ask for more without a second round trip, and no further, so that
 * one request cannot be turned into an unbounded scan. The ceiling is what keeps
 * the cost of a request a function of this constant rather than of how much
 * history a conversation happens to hold, which is the property the
 * million-message benchmark exists to demonstrate.
 *
 * Larger collections are not an exception to it. A five-hundred-member facepile
 * is read as several pages like anything else — a projection over a member list
 * is still a projection, and it is authorized per page.
 */
export const MAX_PAGE_SIZE = 200;

/**
 * The shortest string that can be a cursor token.
 *
 * Applied to the envelope's next cursor, where an empty string would otherwise
 * read as a position that exists and points nowhere. The request side needs no
 * such bound: the codec already rejects an empty value, and restating its
 * length rules here would give one format two definitions.
 */
export const MIN_CURSOR_TOKEN_LENGTH = 1;

/* -------------------------------------------------------------------------- */
/* The cursor a caller sends                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Decode a token, or report that it is not one this product minted.
 *
 * The codec signals rejection by throwing, which is right for a function whose
 * contract is "this is the position, or there is no position". Both consumers in
 * this module need the outcome as a value instead — one to answer a validation
 * check, the other to choose between two rejection codes — so the conversion
 * happens once, here.
 *
 * Only the codec's own rejection is converted. Anything else propagates
 * untouched: a fault that is not "this value is not a cursor" is a defect in
 * this process, and reporting it as a caller's bad cursor would file a bug
 * report against the caller and hide it from everyone who could fix it.
 */
function decodeCursorOrNull(token: string): KeysetCursor | null {
  try {
    return decodeKeysetCursor(token);
  } catch (cause) {
    if (cause instanceof InvalidCursorError) {
      return null;
    }

    throw cause;
  }
}

/**
 * A cursor as it crosses the API boundary: an opaque token, and nothing else.
 *
 * Validation runs the token through the codec and keeps only the verdict, so a
 * value that is not exactly what the encoder would have produced is rejected
 * before it reaches a query. The parsed output stays a `string`. That is the
 * point of the field rather than an omission: a client receives a token, holds
 * it, and hands it back unaltered, and exposing the decoded tuple in a request
 * shape would invite a route to read a conversation identifier from the wire and
 * treat it as settled — which is the reading rule R1 exists to prevent. A server
 * that needs the tuple asks {@link resolveKeysetPosition} for it, against a
 * conversation it has already authorized.
 *
 * The check is deliberately one-directional. A token minted under a superseded
 * version tag fails here, and the read path is expected to treat that as "start
 * from the top of history" — the codec's version tag exists precisely so the
 * encoding can be replaced without a coordinated client release. The envelope's
 * next cursor is therefore *not* validated this way: a browser holding an older
 * bundle would reject a token a newer server had just minted, which is the same
 * coupling in the direction where it does damage.
 */
export const cursorTokenSchema = z
  .string({ error: PAGINATION_REJECTION.cursorInvalid })
  .refine((token) => decodeCursorOrNull(token) !== null, {
    error: PAGINATION_REJECTION.cursorInvalid,
  });

/* -------------------------------------------------------------------------- */
/* Traversal direction                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The two directions a keyset traversal can take along the
 * conversation-and-sequence tuple.
 *
 * The direction chooses the comparison against the sequence in the cursor and
 * the order rows come back in, and there are exactly two of them because the key
 * has exactly two ends. `forward` reads ascending from the position, `backward`
 * reads descending — which is how message history is read, newest first from
 * wherever the reader stopped.
 *
 * Two members, as literals, rather than a free string. A free string would make
 * an unrecognised value the read path's problem at the moment it builds a
 * predicate, and there is no third direction to accommodate. There is also no
 * sort-field parameter anywhere in this contract, and its absence is the design:
 * a keyset read is ordered by its key, and a caller that could choose another
 * ordering would be asking for rows the composite index cannot return as a range
 * scan — which is the whole benefit, given away.
 */
export const PAGE_DIRECTIONS = ['forward', 'backward'] as const;

/**
 * The direction a request without one is read in.
 *
 * Ascending, because it is the direction of the key itself and the correct
 * reading for most paged surfaces — channels, members and bookmarks are all
 * traversed from the start. Message history is the exception and always states
 * `backward` explicitly, which is the right way round: the surface with an
 * unusual requirement declares it, rather than every ordinary surface having to
 * correct a default chosen for one of them.
 */
export const DEFAULT_PAGE_DIRECTION = 'forward';

/** Schema for a traversal direction. */
export const pageDirectionSchema = z.enum(PAGE_DIRECTIONS, {
  error: PAGINATION_REJECTION.invalidDirection,
});

/** One of the two traversal directions. */
export type PageDirection = z.infer<typeof pageDirectionSchema>;

/* -------------------------------------------------------------------------- */
/* The paged request                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Everything a caller may say about where to read from and how much to read.
 *
 * Three fields, and there is no fourth. In particular there is no numbered
 * position of any kind — no page index, no row count to skip, no start or end
 * ordinal — and adding one would breach a constraint the specification names
 * outright. An offset carries a row count and no context, so the database has to
 * fetch and discard everything ahead of it, and any row inserted between two
 * requests shifts the window and hands the reader a row it has already seen
 * while hiding another. In a conversation being written to while it is read —
 * the normal case here — that is wrong output rather than slow output. The
 * arbitrary jump it would buy has no consumer: the client is an infinite scroll,
 * which only ever asks for what comes next.
 *
 * There is also no workspace identifier and no acting-account identifier, and
 * their absence is enforcement rather than economy. Rule R1 forbids resting an
 * authorization decision on a caller-supplied workspace or actor, so the fields
 * are not offered at all; both are derived server-side from the session by the
 * isolation binding in `apps/api`, and a handler cannot read from the wire what
 * the wire does not carry.
 *
 * The object is strict, which is the mechanism behind both paragraphs above
 * rather than a matter of taste. A stripping object would silently discard a
 * caller's `offset`, and a caller whose input is silently discarded concludes
 * that it worked; a strict one rejects the request, so a numbered position
 * cannot enter this contract by being tolerated at the edge. It is also what
 * keeps a total count out of the request and a workspace identifier out of it.
 *
 * A route with filters of its own extends this schema rather than restating it —
 * `pagedRequestSchema.extend({ ... })` keeps the traversal fields, their bounds
 * and the strictness in one place, so a channel browse can add its own scope and
 * sort filters without acquiring a second opinion about page size.
 *
 * The fields are typed as the values they are, not as the text a query string
 * happens to deliver: `pageSize` is an integer here, so the generated
 * specification describes it as one instead of as an integer-or-string union.
 * Decoding query text into those values belongs to the transport in `apps/api`,
 * which is the one layer that knows it is reading a query string, and keeping it
 * there is what stops two representations of one value entering the shared
 * contract.
 */
export const pagedRequestSchema = z.strictObject(
  {
    /**
     * Where to read from, as the opaque token a previous page returned. Omitted
     * on the first request: absence is the single representation of "from the
     * beginning", so a client sends no field rather than a null, and there is
     * one shape for a caller holding no position instead of two.
     */
    cursor: cursorTokenSchema.optional(),

    /** How many rows to read, bounded by this module's declared page sizes. */
    pageSize: z
      .int({ error: PAGINATION_REJECTION.pageSizeOutOfRange })
      .min(MIN_PAGE_SIZE, { error: PAGINATION_REJECTION.pageSizeOutOfRange })
      .max(MAX_PAGE_SIZE, { error: PAGINATION_REJECTION.pageSizeOutOfRange })
      .default(DEFAULT_PAGE_SIZE),

    /** Which way to travel along the conversation-and-sequence tuple. */
    direction: pageDirectionSchema.default(DEFAULT_PAGE_DIRECTION),
  },
  { error: PAGINATION_REJECTION.malformedRequest },
);

/**
 * A parsed paged request, as a read path receives it.
 *
 * `pageSize` and `direction` are present because parsing applied their defaults;
 * `cursor` is optional because a first request has no position to state.
 */
export type PagedRequest = z.infer<typeof pagedRequestSchema>;

/**
 * A paged request as a caller writes one, before defaults are applied.
 *
 * This is the shape `apps/web` builds when it asks for a page: every field is
 * optional, so the first request of an infinite query is the empty object.
 */
export type PagedRequestInput = z.input<typeof pagedRequestSchema>;

/* -------------------------------------------------------------------------- */
/* Turning a caller's cursor into a position the server may use               */
/* -------------------------------------------------------------------------- */

/**
 * What a cursor resolved to, or why it was refused.
 *
 * A successful resolution carries `null` when the caller sent no cursor, which
 * means "start at the beginning" rather than "something went wrong". A refusal
 * carries one of exactly two codes, so a read path's handling of it is
 * exhaustive by construction.
 */
export type KeysetPositionResolution =
  | {
      readonly ok: true;
      /** The position to read from, or `null` to start from the beginning. */
      readonly position: KeysetCursor | null;
    }
  | {
      readonly ok: false;
      readonly code:
        | typeof PAGINATION_REJECTION.cursorInvalid
        | typeof PAGINATION_REJECTION.cursorConversationMismatch;
    };

/**
 * Resolve a caller's cursor against the conversation the read path has already
 * authorized.
 *
 * **This is not an authorization check, and must never be mistaken for one.** It
 * compares two identifiers. The caller is responsible for having established,
 * from the session and the route and before calling this, that the acting
 * account may read `authorizedConversationId` — that decision belongs to the
 * policy layer in `apps/api`, and this module could not make it if it wanted to,
 * holding no session, no policy and no database handle.
 *
 * What it does do is discharge the obligation rule R1 places on every paged
 * read, in one place instead of once per route. The conversation identifier
 * inside a cursor is an untrusted echo of what the caller sent, and anyone can
 * mint a well-formed cursor naming any conversation, because any short string is
 * a syntactically valid identifier. So a cursor that decodes cleanly
 * and names a different conversation than the one authorized is refused here
 * rather than being allowed to reach a query, where it would read another
 * conversation's history under this conversation's authorization. A route that
 * merely decoded the token would have that defect, and it would pass every test
 * that only ever sends its own cursors back.
 *
 * The two refusals are kept distinct on purpose. An invalid token is ordinary —
 * a superseded version tag produces one — and a read path may reasonably restart
 * from the top of history. A conversation mismatch is not ordinary: it is either
 * a client defect or a probe, and it deserves its own code so it can be seen in
 * a log rather than averaged into the first.
 *
 * @param request The caller's cursor, and the conversation the read path
 *   authorized. The cursor is a required property rather than an optional one so
 *   that a route states the absence of a position explicitly; a forwarding
 *   mistake would otherwise read as a first page and page from the top forever.
 * @returns The position to read from, or the code to refuse with.
 */
export function resolveKeysetPosition(request: {
  readonly cursor: string | undefined;
  readonly authorizedConversationId: string;
}): KeysetPositionResolution {
  if (request.cursor === undefined) {
    return { ok: true, position: null };
  }

  const position = decodeCursorOrNull(request.cursor);
  if (position === null) {
    return { ok: false, code: PAGINATION_REJECTION.cursorInvalid };
  }

  if (position.conversationId !== request.authorizedConversationId) {
    return { ok: false, code: PAGINATION_REJECTION.cursorConversationMismatch };
  }

  return { ok: true, position };
}

/* -------------------------------------------------------------------------- */
/* The paged response envelope                                                */
/* -------------------------------------------------------------------------- */

/**
 * The shape {@link pagedEnvelopeSchema} returns, named so a consumer can hold
 * one in a type and the specification registry can register one.
 */
export type PagedEnvelopeSchema<ItemSchema extends z.ZodType> = z.ZodObject<
  {
    items: z.ZodArray<ItemSchema>;
    nextCursor: z.ZodNullable<z.ZodString>;
    hasMore: z.ZodBoolean;
  },
  z.core.$strict
>;

/**
 * Build the paged envelope for a given item schema.
 *
 * One envelope shape serves every paged read in the product — messages,
 * channels, members, bookmarks — because a builder is what makes reuse cheaper
 * than reinvention. A route that declared its own `{ items, nextCursor }` pair
 * would be a second contract for the same idea, and the divergence surfaces as a
 * client that paginates one list correctly and stops halfway down another.
 *
 * Three members, and the omission is as deliberate as the inclusions:
 *
 *   - `items` — the rows, never more than a page may hold. The ceiling is
 *     asserted on the way out as well as on the way in, so a read path that
 *     ignored the requested size fails its own contract rather than shipping an
 *     unbounded response.
 *   - `nextCursor` — the token for the page after this one, and `null` when
 *     there is no page after this one. Unlike the request's cursor it is not put
 *     back through the codec: the client must be able to carry a token minted by
 *     a newer encoding than the bundle it is running, which is the reason the
 *     codec carries a version tag at all.
 *   - `hasMore` — whether another page exists. It is what an infinite query
 *     reads to decide whether to offer another fetch, and the refinement below
 *     holds it in agreement with `nextCursor` so the two can never tell a client
 *     different stories.
 *
 * There is **no total count**. Counting the rows behind a keyset read means a
 * second traversal that the index cannot answer as a range scan, on every page,
 * which reintroduces the cost the traversal exists to avoid. A count is also a
 * projection in its own right — it reports how much exists — so it would need
 * its own authorization rather than riding along inside someone else's response.
 * The strict object is what enforces the omission: an envelope carrying a total
 * is rejected rather than quietly trimmed.
 *
 * How a read path fills this in is worth stating, because the invariant is
 * easier to satisfy than to repair. Ask the database for one row more than the
 * requested page size; if the extra row arrives, another page exists, so return
 * the page without it, set `hasMore`, and mint `nextCursor` from the last row
 * actually returned. Deriving the flag from `items.length` against the requested
 * size instead is the classic off-by-one here: a page that happens to end
 * exactly on the boundary reports that more exists, and the client fetches an
 * empty page to find out otherwise.
 *
 * One obligation travels the other way, to whoever calls this. The envelope
 * reports only its own failures with {@link PAGINATION_REJECTION.malformedEnvelope} —
 * a missing member, a mistyped flag, an unknown member, an overfull page, a next
 * cursor disagreeing with the flag. A row that fails is reported by the item
 * schema, at the path `items.<n>`, in that schema's own words, because an item's
 * rejections belong to the item's contract and this module has no business
 * restating them. The consequence is that an item schema must carry its own
 * codes: hand this builder a bare unparameterised primitive and a rejection will
 * surface as an English sentence from the validation library, which is the one
 * thing no schema in this package is allowed to emit.
 *
 * @param itemSchema The schema for one row. Any schema at all — the envelope
 *   makes no assumption about the item, which is why one builder covers four
 *   resource families.
 * @returns The envelope schema for that item, with its consistency invariant
 *   attached.
 */
export function pagedEnvelopeSchema<ItemSchema extends z.ZodType>(
  itemSchema: ItemSchema,
): PagedEnvelopeSchema<ItemSchema> {
  return z
    .strictObject(
      {
        items: z
          .array(itemSchema, { error: PAGINATION_REJECTION.malformedEnvelope })
          .max(MAX_PAGE_SIZE, { error: PAGINATION_REJECTION.malformedEnvelope }),
        nextCursor: z
          .string({ error: PAGINATION_REJECTION.malformedEnvelope })
          .min(MIN_CURSOR_TOKEN_LENGTH, { error: PAGINATION_REJECTION.malformedEnvelope })
          .nullable(),
        hasMore: z.boolean({ error: PAGINATION_REJECTION.malformedEnvelope }),
      },
      { error: PAGINATION_REJECTION.malformedEnvelope },
    )
    .refine((envelope) => envelope.hasMore === (envelope.nextCursor !== null), {
      error: PAGINATION_REJECTION.malformedEnvelope,
    });
}

/**
 * A paged envelope over a given item type.
 *
 * Written in terms of the item rather than the item's schema, so a consumer
 * names the thing it already has: `PagedEnvelope<Message>` rather than
 * `PagedEnvelope<typeof messageSchema>`. It is derived from
 * {@link PagedEnvelopeSchema} rather than restated, so the type a route returns
 * and the schema that validates it cannot drift apart.
 */
export type PagedEnvelope<Item> = z.infer<PagedEnvelopeSchema<z.ZodType<Item, Item>>>;
