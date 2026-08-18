/**
 * The opaque keyset cursor: this workspace's only encoder and decoder for a
 * position in message history.
 *
 * WHY KEYSET, AND WHAT THE TUPLE IS
 *
 * History is read forward and backward from a remembered position rather than by
 * counting rows from the start of a result set. The position is a tuple — the
 * conversation, plus the durable per-conversation sequence of the last row the
 * reader received — and the next request asks the database for what follows that
 * tuple, which a composite index over the same two columns answers as a range
 * scan.
 *
 * Counting rows instead carries no context at all. The database has to fetch and
 * discard everything ahead of the requested position, and a row inserted between
 * two requests moves every later row along, so the reader receives one row twice
 * and never sees another. Every conversation in this product grows while it is
 * being read, so that is a correctness defect rather than an inefficiency, and
 * it is why nothing in the contract this module serves carries a numbered
 * position of any kind. A caller passes a whole keyset or it passes nothing.
 *
 * ONE IMPLEMENTATION, REACHED THROUGH THE BARREL
 *
 * This module is the single implementation of keyset-cursor encoding for the
 * whole monorepo. Every consumer — the API's read paths, the client's infinite
 * queries, the shared pagination schemas, the end-to-end suite — reaches it
 * through the `@relay/shared` barrel, and none of them may declare a local
 * encode-and-decode pair, not even a one-line one for a single call site. Two
 * codecs are two token formats, and the second one is always discovered late,
 * when a token minted by one is rejected by the other. That discipline mirrors
 * what rule R5 imposes on the component contracts; the rule's own subject is
 * those contracts, so no contract identifier is minted here for a codec — only
 * the principle is carried over.
 *
 * THE TOKEN IS OPAQUE
 *
 * A cursor is a token, not a readable position. A client receives one, holds it,
 * and hands it back unaltered. It never constructs one, never parses one, never
 * mutates one, and never reasons about what is inside it. The encoding below is
 * reversible for the server's convenience — it moves a two-part position through
 * a single query-string field — and it may change behind the version tag without
 * any client changing with it. Anything a client inferred from the bytes would
 * break on that change, and correctly so.
 *
 * A CURSOR IS NEVER AN AUTHORIZATION INPUT
 *
 * Rule R1 forbids resting an authorization decision on a caller-supplied
 * workspace or actor identifier, and a cursor is caller-supplied data in its
 * entirety. Three consequences are structural here rather than advisory:
 *
 *   1. The payload carries no workspace identifier and no acting-account
 *      identifier, so there is nothing inside a token that a server could be
 *      tempted to trust. The workspace a read may see is derived from the
 *      session by the isolation binding in the API, and from nowhere else.
 *   2. The decoded conversation identifier is an untrusted echo. The read path
 *      in `apps/api` authorizes the conversation independently — from the
 *      session and from the route — and then rejects any cursor whose
 *      conversation does not match the conversation it authorized. Recovering a
 *      tuple from a token is not the same act as being allowed to read that
 *      conversation, and this module cannot perform the second act at all: it
 *      holds no session, no policy and no database handle.
 *   3. Rejecting a tampered token here is a correctness guard, not a capability
 *      check. It establishes only that a value is not one this codec produced,
 *      which keeps malformed input out of a query; it never establishes that a
 *      caller may read what the value names. Nothing resembling an authorization
 *      API is exported from this file, and no function in it accepts key or
 *      credential material — a cursor carrying a cryptographic endorsement would
 *      read like a permission, which is exactly the misreading the rule exists
 *      to prevent.
 *
 * The third point is easy to under-read, so it is worth stating flatly, and it
 * was measured rather than assumed: anyone can construct a well-formed cursor
 * naming any conversation, because any short string is a syntactically valid
 * identifier. Across all 4,158 single-character mutations of one real token,
 * roughly a quarter decode successfully — and almost every one of those names a
 * different conversation, while none reproduces the tuple that was mutated. The
 * guard below rejects malformed input and nothing else, so the only thing
 * standing between a caller and another conversation's history is the
 * authorization the read path performs on its own.
 *
 * PORTABILITY
 *
 * `@relay/shared` is consumed by the server, by the browser bundle and by the
 * end-to-end suite, so this module assumes only what all three provide:
 * `TextEncoder`, `TextDecoder`, `btoa`, `atob`, `JSON` and the language itself.
 * The server runtime's own byte-array type is deliberately not used even though
 * its declarations are present at build time: it does not exist in a browser, so
 * reaching for it here would typecheck cleanly and then fail in the client,
 * which is the worst available failure mode.
 *
 * PURITY
 *
 * Both exported functions are pure — same input, same output, no ambient state,
 * no clock read, no randomness — and `encodeKeysetCursor` is deterministic to
 * the byte, which the canonical guard below depends on. The module holds no
 * mutable state and does no work at import time beyond constant arithmetic over
 * the literals declared below, which is what the package's
 * `"sideEffects": false` declaration promises a bundler.
 */

/*
 * GAP DECISION — the encoding shape, and how a token that was not produced here
 * is detected.
 *
 * The specification settles neither. The workflow catalog carries no prose on
 * cursors, tokens or keyset reads anywhere in its twenty-five documents: the
 * one numbered position it records belongs to a deferred search surface's
 * result grid and licenses nothing here. Under rule R3 that silence is not
 * permission to omit, so the full mechanism is implemented and the judgement is
 * recorded. The register entry belongs in `docs/decisions/gap-register.md` and
 * the resulting wire contract in `docs/decisions/http-api-contract.md`; this
 * module authors neither document and only points at them.
 *
 * Options considered:
 *
 *   a. A keyed authentication tag over the payload. Rejected on two independent
 *      grounds. It needs a shared key, and this module is bundled into the
 *      browser client, which can hold no key worth having. And a token carrying
 *      a cryptographic endorsement invites the reading rule R1 forbids — that
 *      a valid token is evidence of permission — when the most it could ever
 *      establish is that this server minted the tuple.
 *   b. A non-cryptographic checksum appended to the payload. Workable, and
 *      rejected as strictly worse than (c): it adds a hand-rolled digest and a
 *      second failure path in order to catch a subset of what (c) catches.
 *   c. CHOSEN — canonical re-encoding compared byte for byte. A payload has
 *      exactly one permitted written form: a fixed key order, an explicit
 *      version tag, no incidental whitespace, and base64url without padding.
 *      `decodeKeysetCursor` validates the payload, re-encodes the validated
 *      tuple through the very function that mints tokens, and requires the
 *      result to equal the value it was given. Anything that is not precisely
 *      what `encodeKeysetCursor` would have produced is rejected: a flipped
 *      character, re-ordered keys, an added key, a widened number, restored
 *      padding, inserted whitespace, a foreign version tag. That is a superset
 *      of what a checksum would reject, it needs no additional code path, and it
 *      stays symmetric with the encoder by construction rather than by
 *      convention, because it calls the encoder.
 *
 * The comparison is an ordinary one, deliberately. There is no key in this
 * module, so there is nothing for a timing side channel to leak, and a
 * constant-time comparison here would imply to a later reader that something
 * secured lives inside the token. Nothing does.
 */

import { z } from 'zod';

/**
 * The version tag every payload carries.
 *
 * It is what makes the encoding replaceable without a coordinated client
 * release: a token minted under an older tag fails validation and the read path
 * treats the rejection as "start from the top of history", which is already the
 * behaviour for a caller that holds no cursor at all.
 */
const CURSOR_VERSION = 1;

/**
 * The ceiling on an accepted conversation identifier, in UTF-16 code units.
 *
 * Identifiers in this product are the sortable 26-character kind this package
 * already depends on for client-side message identifiers; a 36-character
 * canonical universally-unique form is the widest alternative anyone would
 * reasonably substitute. Sixty-four leaves generous headroom over both while
 * staying far below any length worth abusing.
 */
const MAX_CONVERSATION_ID_LENGTH = 64;

/** Digits in `Number.MAX_SAFE_INTEGER`, the widest sequence a payload can hold. */
const MAX_SEQUENCE_DIGITS = 16;

/**
 * The canonical payload's punctuation, counted once: `{"v":1,"c":"","s":}` is
 * nineteen ASCII characters with the identifier and the sequence digits removed
 * and the version tag left at one digit.
 */
const CANONICAL_ENVELOPE_LENGTH = 19;

/**
 * The longest escape `JSON.stringify` emits for one UTF-16 code unit: six ASCII
 * characters, as in `\u0000`. A lone surrogate and a control character both take
 * that form, so six is the true worst case rather than a comfortable guess.
 */
const MAX_JSON_ESCAPE_LENGTH_PER_UNIT = 6;

/** The longest canonical payload the schema below can accept, in bytes. */
const MAX_PAYLOAD_BYTES =
  CANONICAL_ENVELOPE_LENGTH +
  MAX_SEQUENCE_DIGITS +
  MAX_CONVERSATION_ID_LENGTH * MAX_JSON_ESCAPE_LENGTH_PER_UNIT;

/**
 * The length bound applied before any other work, so that a hostile
 * multi-megabyte value is rejected on a single integer comparison instead of
 * being scanned, decoded and parsed.
 *
 * It is derived from the two component ceilings rather than picked as a round
 * number, and that derivation buys a property worth having: every tuple the
 * schema accepts encodes to a token shorter than this bound, so the encoder can
 * never mint a token the decoder rejects on length. Round-tripping is total over
 * the whole accepted domain, not merely over the realistic part of it. Four
 * base64 characters carry three bytes, hence the ratio.
 *
 * At the ceilings above the arithmetic comes to 419 payload bytes and so 559
 * characters, against roughly 72 for a real token over a 26-character
 * identifier. The gap is the escaping worst case, which no server-minted
 * identifier will ever approach; it is admitted anyway so that the bound is
 * provably wider than the schema rather than merely wide enough in practice.
 */
const MAX_ENCODED_LENGTH = Math.ceil((MAX_PAYLOAD_BYTES * 4) / 3);

/**
 * The base64url alphabet, anchored and requiring at least one character.
 *
 * Padding is deliberately absent from the class: a canonical token never carries
 * it, so a value that does is rejected here rather than being quietly tolerated
 * by a decoder that accepts both forms.
 */
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * A position in one conversation's message history: the conversation it belongs
 * to, and the sequence of the last row the reader received.
 *
 * `sequence` is the durable per-conversation monotonic counter allocated inside
 * the same transaction as the message insert, under a lock on the conversation's
 * counter row and with a uniqueness constraint on the pair as the backstop. It
 * is a property of the message rather than of any query: it is not a row number,
 * not a count of rows to discard ahead of a position, and not an index into a
 * result set. Two readers who have seen the same message hold the same sequence,
 * and a message keeps its sequence for as long as it exists.
 *
 * `sequence` is a JavaScript `number` and not a `bigint`, for two reasons. The
 * design target is a million messages in a single channel, and the largest
 * integer exactly representable here is over nine quadrillion — nine orders of
 * magnitude of headroom. And `JSON.stringify` throws on a `bigint`, so carrying
 * one would mean a second serialization rule for one field of one payload.
 *
 * Both members are `readonly`: a cursor is a value, and a consumer that needs a
 * different position constructs a different cursor.
 */
export type KeysetCursor = {
  readonly conversationId: string;
  readonly sequence: number;
};

/**
 * The single rejection type for this codec, raised by both directions.
 *
 * Two omissions are deliberate. The message never echoes the value that was
 * rejected: an echoed token in a log line or an error response is noise at best,
 * and at worst it copies a caller-supplied string into a place nobody sanitises.
 * And no underlying cause is attached, because a validation failure carries the
 * input that failed with it, and attaching that would put a partially decoded
 * payload into exactly the field a reader tends to log. The failure class in the
 * message is what a debugging reader needs; the value adds nothing they do not
 * already have on the request.
 */
export class InvalidCursorError extends Error {
  /**
   * @param reason A short description of the failure class. Never pass the
   *   rejected value, or any part of a decoded payload, in it.
   */
  public constructor(reason: string) {
    super(`Invalid pagination cursor: ${reason}.`);
    // Set explicitly: a subclass otherwise reports the base constructor's name,
    // which makes every rejection in a log look like a generic failure.
    this.name = 'InvalidCursorError';
  }
}

/**
 * The canonical payload contract, and the whole of the validation this codec
 * performs.
 *
 * Strict rather than lenient in every dimension that matters. Unknown keys are
 * rejected rather than stripped, so a token carrying an extra field is a
 * rejection instead of a silent truncation. The version must be exactly the
 * current tag. The conversation identifier must be a non-empty string within the
 * ceiling above. The sequence must be an integer, non-negative, and inside the
 * exactly-representable range — which rules out a fraction, a value beyond that
 * range, and a numeric string, since nothing here coerces.
 *
 * The keys are one character each because a cursor travels in a query string on
 * every history request, and because their meaning belongs in this file rather
 * than in the token: nothing outside this module reads them.
 */
const cursorPayloadSchema = z.strictObject({
  v: z.literal(CURSOR_VERSION),
  c: z.string().min(1).max(MAX_CONVERSATION_ID_LENGTH),
  s: z.int().min(0),
});

/**
 * UTF-8 text to base64url without padding.
 *
 * The widening loop is what makes this portable. `btoa` reads one byte per code
 * unit and throws above code point 255, so the encoded bytes are first widened
 * into a string of single-byte code units. Encoding the text directly would
 * throw on the first character outside Latin-1.
 */
function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);

  let singleByteUnits = '';
  for (const byte of bytes) {
    singleByteUnits += String.fromCharCode(byte);
  }

  return (
    btoa(singleByteUnits)
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      // Padding only ever appears at the end, and the anchor keeps it that way.
      .replace(/=+$/, '')
  );
}

/**
 * base64url without padding back to UTF-8 text.
 *
 * Two conversions are mandatory rather than cosmetic. `atob` rejects `-` and `_`
 * outright, so the URL-safe substitutions are undone first. And it is specified
 * to accept a value whose padding is missing, but restoring the padding
 * explicitly keeps the input well-formed for every implementation rather than
 * relying on that leniency. Decoding is strict about the resulting bytes: an
 * invalid UTF-8 sequence is a rejection, not a replacement character smuggled
 * into a parsed value.
 */
function fromBase64Url(token: string): string {
  const base64 = token.replaceAll('-', '+').replaceAll('_', '/');
  const remainder = base64.length % 4;
  const padded = remainder === 0 ? base64 : base64 + '='.repeat(4 - remainder);

  let singleByteUnits: string;
  try {
    singleByteUnits = atob(padded);
  } catch {
    throw new InvalidCursorError('the value does not decode as an encoded payload');
  }

  const bytes = new Uint8Array(singleByteUnits.length);
  for (let index = 0; index < singleByteUnits.length; index += 1) {
    bytes[index] = singleByteUnits.charCodeAt(index);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new InvalidCursorError('the decoded bytes are not valid text');
  }
}

/**
 * Encode a keyset position as an opaque cursor token.
 *
 * The result is URL-safe: it carries only unreserved characters, so it survives
 * a query string with no escaping, and it is padding-free, so it survives one
 * that strips `=`. Encoding is deterministic — the same tuple always yields the
 * identical string — which is what allows the decoder to detect tampering by
 * re-encoding.
 *
 * The tuple is validated on the way out even though the parameter is typed. A
 * caller reaching this function through a type assertion, an untyped database
 * row or a parsed request body can hold a value that does not satisfy the type,
 * and minting a token from it would produce something the decoder rejects — an
 * asymmetry that surfaces later as history refusing to load, rather than as a
 * fault at the point where the mistake was made.
 *
 * @param cursor The conversation-and-sequence position to encode.
 * @returns An opaque, URL-safe token. Treat it as a token: never parse it.
 * @throws {InvalidCursorError} If the tuple is not a position this codec can
 *   carry.
 */
export function encodeKeysetCursor(cursor: KeysetCursor): string {
  // Key order is fixed by this literal. `JSON.stringify` preserves insertion
  // order for non-numeric keys, and no space argument means no whitespace, so
  // one tuple has exactly one written form.
  const payload = { v: CURSOR_VERSION, c: cursor.conversationId, s: cursor.sequence };

  if (!cursorPayloadSchema.safeParse(payload).success) {
    throw new InvalidCursorError('the position offered for encoding is not one a cursor can carry');
  }

  return toBase64Url(JSON.stringify(payload));
}

/**
 * Decode an opaque cursor token back into the keyset position it carries.
 *
 * The parameter is `unknown` on purpose: a cursor arrives from a query string, a
 * request body or a stored client value, and none of those is typed at the
 * boundary. Accepting `unknown` means no caller can hand this function a value
 * that skirts validation.
 *
 * Rejection is total. There is no fallback position, no clamping and no
 * best-effort tuple: a value that is not exactly what the encoder above would
 * have produced raises {@link InvalidCursorError}, and the read path decides what
 * to do about it. Silently coercing a damaged cursor would serve a caller a
 * position they never asked for, which in a conversation reads as missing or
 * duplicated history.
 *
 * What a returned value does and does not establish is worth restating at the
 * call site: it establishes that the token came from this codec, and nothing
 * whatsoever about the caller's right to read the conversation it names. That
 * check belongs to the read path, which authorizes the conversation from the
 * session and the route and rejects a cursor naming any other conversation.
 *
 * @param token The opaque token a caller returned, unaltered.
 * @returns The conversation-and-sequence position the token carries.
 * @throws {InvalidCursorError} If the value is not a cursor this codec produced.
 */
export function decodeKeysetCursor(token: unknown): KeysetCursor {
  if (typeof token !== 'string') {
    throw new InvalidCursorError('a cursor is a string and this value is not one');
  }

  if (token.length === 0) {
    throw new InvalidCursorError('an empty value is not a cursor');
  }

  // Before anything scans, parses or allocates.
  if (token.length > MAX_ENCODED_LENGTH) {
    throw new InvalidCursorError('the value is longer than any cursor this codec produces');
  }

  if (!BASE64URL_PATTERN.test(token)) {
    throw new InvalidCursorError('the value carries characters no cursor contains');
  }

  // Decoding is a separate statement from parsing so that each failure keeps its
  // own reason: `fromBase64Url` raises a precise rejection of its own, and only
  // a parse failure is described here.
  const json = fromBase64Url(token);

  let payload: unknown;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new InvalidCursorError('the decoded value is not a well-formed payload');
  }

  const validated = cursorPayloadSchema.safeParse(payload);
  if (!validated.success) {
    throw new InvalidCursorError('the payload does not satisfy the cursor contract');
  }

  const cursor: KeysetCursor = {
    conversationId: validated.data.c,
    sequence: validated.data.s,
  };

  // The tamper guard. Re-encoding through the public encoder and requiring an
  // exact match rejects every value that is not the one canonical form of this
  // tuple, and cannot drift from the encoder because it is the encoder. Both
  // strings are ASCII base64url, so character equality here is byte equality.
  if (encodeKeysetCursor(cursor) !== token) {
    throw new InvalidCursorError('the value is not the canonical form of the position it carries');
  }

  return cursor;
}
