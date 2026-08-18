/**
 * The keyset cursor codec's own unit test.
 *
 * WHY THIS FILE IS COMPULSORY
 *
 * Two independent reasons, and neither is a matter of taste.
 *
 * Rule R3 forbids treating anything as satisfied without a passing test behind
 * it. The codec is the whole of the pagination contract's wire format, so a
 * codec with no test is a contract asserted and never checked.
 *
 * And the root runner configuration declares a project rooted at this package.
 * A project whose globs match no file is not a neutral absence: the runner fails
 * a run only when *every* project collected nothing, so a single empty project
 * disappears from the output while the run still reports success. That is a gate
 * that looks green and guards nothing, which is the one outcome this repository
 * treats as worse than a red build. The configuration guards against it at load
 * time; this file is what satisfies the guard for this package.
 *
 * WHAT IS ASSERTED, AND WHY IT IS ASSERTED THIS WAY
 *
 * Two properties carry the codec: a position survives a round trip unchanged,
 * and a value the encoder did not produce is rejected rather than quietly
 * coerced into some best-effort position. Both are asserted over tables of cases
 * rather than one happy path, because the interesting behaviour lives at the
 * bounds — the smallest sequence, the largest exactly-representable one, a
 * one-character identifier, an identifier at the accepted ceiling, and text that
 * forces real multi-byte handling instead of the ASCII path.
 *
 * Rejection is never asserted with a bare "it threw". The failure mode worth
 * fearing here is a permissive fallback that returns a position nobody asked
 * for, and a thrown-or-not check cannot see the difference between rejecting and
 * returning something wrong. So every rejection case captures the outcome and
 * asserts both halves: that the codec's own rejection type was raised, and that
 * no tuple — not even a partially populated one — came back in its place.
 *
 * ONE CODEC, EXERCISED RATHER THAN MIRRORED
 *
 * Rule R5 requires one implementation reached through one entry point, and a
 * test is not exempt from it: a second encoder written here to "check the first"
 * would make this file agree with itself instead of with the module, and would
 * then have to be kept in step with it forever. So every token in this file is
 * minted by the real `encodeKeysetCursor`, and every tampered value is derived
 * by mutating one. The only local helpers are a pair of base64url byte
 * transforms, needed to reach inside a real token so a payload-level edit can be
 * made; they are documented at their declaration as byte transforms and nothing
 * more. No contract identifier is minted here — the rule's own subject is the
 * component contracts, and a codec is not one.
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT ASSERT
 *
 * Rule R1 places authorization on the server, at the point of execution, against
 * the acting session and the specific target object. None of those things exists
 * here: this module holds no session, no route, no policy and no database
 * handle, and it performs no mutation and serves no projection. The denial tests
 * the rule requires therefore belong to the API's integration suites, and
 * restating them here against a codec would prove nothing.
 *
 * One property of the codec does bear on that rule, though, and it is asserted
 * below: a decoded position's key set is exactly the conversation and the
 * sequence. There is no workspace identifier and no acting-account identifier
 * inside a token, so there is nothing in one a server could be tempted to trust.
 * Adding either to the payload would fail a test in this file, which is the
 * point of asserting the key set rather than merely the two values.
 *
 * Nothing here treats the tamper guard as a security control, because it is not
 * one. It establishes that a value is not one this codec produced, and never
 * that a caller may read what the value names — the module says so itself, and a
 * test named as though it proved forgery resistance would contradict it. The
 * measured behaviour below makes the distinction concrete: a great many altered
 * tokens decode perfectly well, and simply name a different conversation.
 *
 * FIXTURES
 *
 * Every identifier here is synthetic and semantically empty, as rule R4
 * requires. None is a workspace, channel or person name, and none was read from
 * a frame — no frame was opened to write this file, and nothing in it needed
 * one.
 */
import { describe, expect, it } from 'vitest';

import {
  type KeysetCursor,
  InvalidCursorError,
  decodeKeysetCursor,
  encodeKeysetCursor,
} from './cursor.js';

// ---------------------------------------------------------------------------
// Fixtures. Synthetic, semantically empty, and chosen for the boundary each one
// sits on rather than for readability.
// ---------------------------------------------------------------------------

/** A one-character identifier: the shortest the codec accepts. */
const SHORTEST_ID = 'k';

/**
 * A 26-character identifier, the width of the sortable identifiers this package
 * mints elsewhere. Digits rather than letters so it reads as a placeholder and
 * could not be mistaken for a name.
 */
const ORDINARY_ID = 'c0000000000000000000000001';

/** A 64-character identifier: the longest the codec accepts. */
const LONGEST_ID = `c${'0'.repeat(63)}`;

/**
 * An identifier spanning one-, two-, three- and four-byte encoded sequences: an
 * ASCII letter, a letter with a diacritic, a symbol outside the basic plane's
 * Latin range, and a character represented by a surrogate pair. This is what
 * forces the codec down its real multi-byte path instead of the ASCII one, where
 * a byte-per-character shortcut would appear to work.
 */
const MULTI_BYTE_ID = 'c\u00e9\u2603\u{1f600}';

/**
 * An identifier whose characters all require escaping when written into the
 * payload: a quotation mark, a backslash and a line feed. The canonical form has
 * to escape these and the round trip has to undo exactly that escaping.
 */
const ESCAPING_ID = 'c"\\\n';

/** One position, reused wherever a case needs a token but not a specific one. */
const REFERENCE_POSITION: KeysetCursor = { conversationId: ORDINARY_ID, sequence: 7 };

/**
 * The base64url alphabet, used to generate every alternative character a
 * mutation can substitute and to assert that a token draws on nothing else.
 *
 * Padding is absent deliberately. A token this codec mints never carries it, so
 * `=` belongs with the characters a cursor cannot contain rather than with the
 * ones it can.
 */
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** The same alphabet as an anchored pattern, for asserting a token's shape. */
const BASE64URL_ONLY = /^[A-Za-z0-9_-]+$/;

/**
 * The number of characters in the envelope region of a token — the leading run
 * that encodes the payload's opening punctuation and version tag rather than any
 * part of the position.
 *
 * A real token's payload opens with nineteen characters of fixed punctuation
 * before the identifier's first character, and four base64url characters carry
 * three bytes, so the first sixteen characters of a token cannot encode anything
 * but that punctuation. Every substitution inside this run is therefore rejected,
 * and that is asserted exhaustively below rather than sampled.
 */
const ENVELOPE_CHARACTERS = 16;

// ---------------------------------------------------------------------------
// Base64url byte transforms.
//
// These two functions transform bytes and nothing else. They are NOT a second
// cursor codec: neither one knows the payload's shape, validates a position,
// imposes a key order, or decides what a canonical token is. They exist only so
// that a token the real encoder produced can be unwrapped, edited as data, and
// wrapped again — which is how every payload-level tamper case below is built.
// Deriving a tampered value from real encoder output, rather than hand-writing
// what a token is believed to look like, is what keeps this file honest under
// rule R5.
// ---------------------------------------------------------------------------

/** Text to base64url without padding. */
function encodeBytes(text: string): string {
  const bytes = new TextEncoder().encode(text);

  let singleByteUnits = '';
  for (const byte of bytes) {
    singleByteUnits += String.fromCharCode(byte);
  }

  return btoa(singleByteUnits).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

/** base64url without padding back to text. */
function decodeBytes(token: string): string {
  const base64 = token.replaceAll('-', '+').replaceAll('_', '/');
  const remainder = base64.length % 4;
  const padded = remainder === 0 ? base64 : base64 + '='.repeat(4 - remainder);

  const singleByteUnits = atob(padded);
  const bytes = new Uint8Array(singleByteUnits.length);
  for (let index = 0; index < singleByteUnits.length; index += 1) {
    bytes[index] = singleByteUnits.charCodeAt(index);
  }

  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/** The payload a token carries, as it is written inside one. */
interface CanonicalPayload {
  readonly v: number;
  readonly c: string;
  readonly s: number;
}

/**
 * Unwraps a real token and returns the payload it carries, both as the text the
 * encoder wrote and as data an edit can be made against.
 *
 * The text is returned alongside the parsed form because some tamper cases are
 * edits no serializer will produce — a numeric literal that is not valid in a
 * payload, for instance — and those have to be made against the written form.
 */
function unwrap(token: string): { readonly text: string; readonly payload: CanonicalPayload } {
  const text = decodeBytes(token);
  return { text, payload: JSON.parse(text) as CanonicalPayload };
}

// ---------------------------------------------------------------------------
// The rejection harness.
// ---------------------------------------------------------------------------

/**
 * What a decode attempt did, captured rather than allowed to propagate.
 *
 * A discriminated union rather than a nullable value, so that "no position came
 * back" is a fact about the shape of this object and can be asserted directly.
 * The accepted branch is the only one that carries a position at all, which is
 * what makes a partially populated tuple impossible to represent and therefore
 * impossible to pass unnoticed.
 */
type DecodeOutcome =
  | { readonly rejected: false; readonly value: KeysetCursor }
  | { readonly rejected: true; readonly error: unknown };

/** Runs a decode and reports the outcome instead of throwing. */
function attemptDecode(candidate: unknown): DecodeOutcome {
  try {
    return { rejected: false, value: decodeKeysetCursor(candidate) };
  } catch (error) {
    return { rejected: true, error };
  }
}

/**
 * Asserts that a value is rejected, and returns the rejection so a caller can
 * assert on it further.
 *
 * Both halves of "rejected rather than silently coerced" are checked here. A
 * `toThrow` assertion on its own would establish only the first, and would pass
 * against a decoder that returned a clamped or best-effort position for some
 * other input — so the outcome is captured and the absence of a returned
 * position is asserted as its own fact.
 */
function expectRejection(candidate: unknown): InvalidCursorError {
  const outcome = attemptDecode(candidate);

  if (!outcome.rejected) {
    throw new Error(
      `the codec was expected to reject this value but returned the position ${JSON.stringify(
        outcome.value,
      )}`,
    );
  }

  // No position came back with the rejection: not a whole one, and not one with
  // a single field filled in.
  expect('value' in outcome).toBe(false);
  expect(outcome.error).toBeInstanceOf(InvalidCursorError);

  const { error } = outcome;
  if (!(error instanceof InvalidCursorError)) {
    throw new Error('the codec rejected with something other than its own rejection type');
  }

  return error;
}

// ---------------------------------------------------------------------------
// The case table.
// ---------------------------------------------------------------------------

/** One round-trip case: a position, and the boundary it was chosen for. */
interface PositionCase {
  readonly name: string;
  readonly position: KeysetCursor;
}

/**
 * The positions every round-trip, determinism and shape assertion runs against.
 *
 * Each entry sits on a boundary. Between them they cover the smallest sequence
 * the codec accepts, an ordinary one, one at the scale the product is designed
 * for, the largest exactly-representable one, the shortest and longest accepted
 * identifiers, and two identifiers that defeat an ASCII-only implementation.
 */
const POSITION_CASES: readonly PositionCase[] = [
  {
    name: 'the smallest sequence the codec accepts',
    position: { conversationId: ORDINARY_ID, sequence: 0 },
  },
  {
    name: 'an ordinary small sequence',
    position: { conversationId: ORDINARY_ID, sequence: 7 },
  },
  {
    name: 'a sequence at the scale a single conversation is designed to reach',
    position: { conversationId: ORDINARY_ID, sequence: 1_000_000 },
  },
  {
    name: 'the largest exactly-representable sequence',
    position: { conversationId: ORDINARY_ID, sequence: Number.MAX_SAFE_INTEGER },
  },
  {
    name: 'the shortest identifier the codec accepts',
    position: { conversationId: SHORTEST_ID, sequence: 3 },
  },
  {
    name: 'the longest identifier the codec accepts',
    position: { conversationId: LONGEST_ID, sequence: 3 },
  },
  {
    name: 'an identifier spanning one-, two-, three- and four-byte sequences',
    position: { conversationId: MULTI_BYTE_ID, sequence: 3 },
  },
  {
    name: 'an identifier whose every character requires escaping',
    position: { conversationId: ESCAPING_ID, sequence: 3 },
  },
];

describe('the opaque keyset cursor codec', () => {
  describe('round-trip fidelity', () => {
    it.each(POSITION_CASES)('returns $name unchanged', ({ position }) => {
      expect(decodeKeysetCursor(encodeKeysetCursor(position))).toStrictEqual(position);
    });

    it.each(POSITION_CASES)(
      'returns the sequence of $name as a number rather than a numeric string',
      ({ position }) => {
        const { sequence } = decodeKeysetCursor(encodeKeysetCursor(position));

        // The single highest-value assertion in this file. A decoder that
        // coerced on the way out would return '7' where 7 was encoded, and a
        // deep-equality check written the obvious way would not always catch it
        // — so the type is asserted on its own, ahead of the value.
        expect(typeof sequence).toBe('number');
        expect(Number.isInteger(sequence)).toBe(true);
        expect(sequence).toBe(position.sequence);
      },
    );

    it.each(POSITION_CASES)(
      'returns the identifier of $name as the identical string',
      ({ position }) => {
        const { conversationId } = decodeKeysetCursor(encodeKeysetCursor(position));

        expect(typeof conversationId).toBe('string');
        expect(conversationId).toBe(position.conversationId);
        // Asserted separately from the value because a normalising decoder --
        // one that trimmed, re-cased or unified the composition of a character
        // — would return an equal-looking string of a different length.
        expect(conversationId).toHaveLength(position.conversationId.length);
      },
    );

    it('returns the largest accepted sequence without rounding or truncating it', () => {
      const position: KeysetCursor = {
        conversationId: ORDINARY_ID,
        sequence: Number.MAX_SAFE_INTEGER,
      };

      const { sequence } = decodeKeysetCursor(encodeKeysetCursor(position));

      expect(sequence).toBe(Number.MAX_SAFE_INTEGER);
      // Rounding at this magnitude moves a value by whole integers rather than
      // by a fraction, so the two neighbours are named explicitly: an
      // off-by-rounding decoder lands on one of them.
      expect(sequence).not.toBe(Number.MAX_SAFE_INTEGER - 1);
      expect(sequence).not.toBe(Number.MAX_SAFE_INTEGER + 1);
      expect(Number.isSafeInteger(sequence)).toBe(true);
    });

    it('round-trips every accepted position through a second pass unchanged', () => {
      // A codec can be self-consistent once and drift on a second pass if
      // decoding normalises anything at all. Encoding what was decoded and
      // decoding that again is what makes the round trip total rather than
      // merely reversible once.
      for (const { name, position } of POSITION_CASES) {
        const first = encodeKeysetCursor(position);
        const decoded = decodeKeysetCursor(first);
        const second = encodeKeysetCursor(decoded);

        expect(second, `the second pass changed the token for ${name}`).toBe(first);
        expect(decodeKeysetCursor(second)).toStrictEqual(position);
      }
    });
  });

  describe('determinism, opacity and payload shape', () => {
    it.each(POSITION_CASES)('encodes $name to the identical token every time', ({ position }) => {
      // Determinism is not a nicety here: the tamper guard detects an altered
      // token by re-encoding the position it decoded and requiring an exact
      // match, so an encoder that varied its output would reject its own tokens.
      expect(encodeKeysetCursor(position)).toBe(encodeKeysetCursor(position));
    });

    it('encodes distinct positions to distinct tokens', () => {
      const tokens = POSITION_CASES.map(({ position }) => encodeKeysetCursor(position));

      expect(new Set(tokens).size).toBe(POSITION_CASES.length);
    });

    it('distinguishes two positions that differ only in the sequence', () => {
      const lower = encodeKeysetCursor({ conversationId: ORDINARY_ID, sequence: 8 });
      const higher = encodeKeysetCursor({ conversationId: ORDINARY_ID, sequence: 9 });

      expect(lower).not.toBe(higher);
    });

    it('distinguishes two positions that differ only in the conversation', () => {
      const here = encodeKeysetCursor({ conversationId: ORDINARY_ID, sequence: 8 });
      const there = encodeKeysetCursor({ conversationId: SHORTEST_ID, sequence: 8 });

      expect(here).not.toBe(there);
    });

    it.each(POSITION_CASES)(
      'encodes $name to a token that needs no escaping in a query string',
      ({ position }) => {
        const token = encodeKeysetCursor(position);

        expect(token).toMatch(BASE64URL_ONLY);
        // Named individually as well as covered by the pattern, because these
        // four are the specific characters that would break a token in transit:
        // the first two are reserved, the third is stripped by some query
        // parsers, and whitespace does not survive a URL at all.
        expect(token).not.toContain('+');
        expect(token).not.toContain('/');
        expect(token).not.toContain('=');
        expect(token).not.toMatch(/\s/);
        expect(encodeURIComponent(token)).toBe(token);
      },
    );

    it.each(POSITION_CASES)(
      'encodes $name to a token that is not the position in plain text',
      ({ position }) => {
        const token = encodeKeysetCursor(position);

        // The token is encoded, not encrypted, and this file does not pretend
        // otherwise: anyone may decode one, and the module says so. What is
        // asserted is only that a caller cannot read a position off a token by
        // treating it as text, which is the reading the contract forbids.
        expect(token).not.toBe(String(position.sequence));
        expect(token).not.toBe(position.conversationId);
        expect(token).not.toContain(position.conversationId);
      },
    );

    it.each(POSITION_CASES)(
      'carries exactly the conversation and the sequence for $name',
      ({ position }) => {
        const decoded = decodeKeysetCursor(encodeKeysetCursor(position));

        // The key set is asserted, not merely the two values, and that is the
        // whole point of this test. A page index, an offset, a limit, a workspace
        // identifier or an acting-account identifier added to the payload would
        // fail here — which is what keeps a numbered position out of the
        // contract, and keeps anything a server might be tempted to trust out of
        // caller-supplied data.
        expect(Object.keys(decoded).sort()).toStrictEqual(['conversationId', 'sequence']);
      },
    );
  });

  describe('tamper rejection: values altered after the encoder produced them', () => {
    it('rejects every substitution inside the envelope region of a token', () => {
      // Exhaustive rather than sampled: every position in the leading run, and
      // every alternative character the alphabet offers at it. The whole run
      // encodes fixed punctuation, so no substitution in it can produce a
      // payload the contract accepts, and asserting that over all of them is
      // what makes the claim a fact rather than a spot check.
      const token = encodeKeysetCursor(REFERENCE_POSITION);
      let checked = 0;

      for (let index = 0; index < ENVELOPE_CHARACTERS; index += 1) {
        const original = token[index];
        expect(original).toBeTypeOf('string');

        for (const replacement of BASE64URL_ALPHABET) {
          if (replacement === original) continue;

          const mutated = token.slice(0, index) + replacement + token.slice(index + 1);
          const outcome = attemptDecode(mutated);

          if (!outcome.rejected) {
            throw new Error(
              `a substitution at index ${String(index)} was accepted and returned ` +
                `${JSON.stringify(outcome.value)}; every character of the envelope region ` +
                'encodes fixed punctuation, so none of them can carry a valid position',
            );
          }
          expect(outcome.error).toBeInstanceOf(InvalidCursorError);
          checked += 1;
        }
      }

      // The count is asserted so that a token whose shape changed cannot quietly
      // reduce this test to a handful of cases while still passing.
      expect(checked).toBe(ENVELOPE_CHARACTERS * (BASE64URL_ALPHABET.length - 1));
    });

    it('rejects a transposition of the two characters a token opens with', () => {
      const token = encodeKeysetCursor(REFERENCE_POSITION);
      const [first, second] = [token.slice(0, 1), token.slice(1, 2)];

      expect(first).not.toBe(second);
      expectRejection(second + first + token.slice(2));
    });

    it('rejects every truncation of a token', () => {
      // Exhaustive over every proper prefix, and universally true by
      // construction: an accepted value must equal the canonical token of the
      // position it decodes to, and a prefix is shorter than that token, so no
      // prefix can ever be accepted.
      const token = encodeKeysetCursor(REFERENCE_POSITION);

      for (let length = 1; length < token.length; length += 1) {
        const outcome = attemptDecode(token.slice(0, length));

        if (!outcome.rejected) {
          throw new Error(
            `a prefix of ${String(length)} characters was accepted and returned ` +
              `${JSON.stringify(outcome.value)}`,
          );
        }
        expect(outcome.error).toBeInstanceOf(InvalidCursorError);
      }
    });

    it('rejects a token with a single character appended, whatever that character is', () => {
      // Also universal by construction, and for the same reason as truncation:
      // an appended token is longer than the canonical form of any position it
      // could decode to.
      const token = encodeKeysetCursor(REFERENCE_POSITION);

      for (const appended of BASE64URL_ALPHABET) {
        const outcome = attemptDecode(token + appended);

        if (!outcome.rejected) {
          throw new Error(
            `appending ${JSON.stringify(appended)} produced a value the codec accepted, ` +
              `returning ${JSON.stringify(outcome.value)}`,
          );
        }
        expect(outcome.error).toBeInstanceOf(InvalidCursorError);
      }
    });

    it('rejects a token with a run of characters appended', () => {
      const token = encodeKeysetCursor(REFERENCE_POSITION);

      expectRejection(`${token}A`);
      expectRejection(`${token}AAAA`);
      expectRejection(token + token);
    });

    it('rejects a token whose padding has been restored', () => {
      // A decoder that accepted both the padded and unpadded forms would give
      // one position two tokens, and the guard that prevents that is the reason
      // padding is absent from the accepted alphabet.
      const token = encodeKeysetCursor(REFERENCE_POSITION);

      expectRejection(`${token}=`);
      expectRejection(`${token}==`);
    });

    it('never returns the position a mutated token was derived from', () => {
      // The honest form of "tampering is detected", and the strongest statement
      // this file can make about it.
      //
      // A great many single-character mutations decode perfectly well. They have
      // to: most of a token encodes an identifier, and almost any short string
      // is a syntactically valid one, so an altered token routinely names a
      // different conversation instead of failing. The module documents exactly
      // this and measured it, and a test asserting that any altered token is
      // rejected would therefore be asserting something false.
      //
      // What is universally true is the property that matters, and it follows
      // from the guard by construction: an accepted value must equal the
      // canonical token of the position it decodes to, so a value that differs
      // from a token can never decode to that token's position. No mutation
      // silently shifts a reader to a neighbouring place in the same
      // conversation, and none is mistaken for the position it was made from.
      // Every accepted mutation is also its own canonical form, which is what
      // keeps the guard symmetric with the encoder.
      for (const { name, position } of POSITION_CASES) {
        const token = encodeKeysetCursor(position);
        let accepted = 0;
        let rejected = 0;

        for (let index = 0; index < token.length; index += 1) {
          for (const replacement of BASE64URL_ALPHABET) {
            if (replacement === token[index]) continue;

            const mutated = token.slice(0, index) + replacement + token.slice(index + 1);
            const outcome = attemptDecode(mutated);

            if (outcome.rejected) {
              expect(outcome.error).toBeInstanceOf(InvalidCursorError);
              rejected += 1;
              continue;
            }

            accepted += 1;
            expect(
              outcome.value,
              `a mutation at index ${String(index)} of the token for ${name} decoded back to ` +
                'the position it was derived from',
            ).not.toStrictEqual(position);
            expect(
              encodeKeysetCursor(outcome.value),
              `a mutation at index ${String(index)} of the token for ${name} was accepted ` +
                'without being the canonical form of the position it decoded to',
            ).toBe(mutated);
          }
        }

        // Both outcomes have to occur for this case to be worth anything: if
        // nothing were rejected the guard would be absent, and if nothing were
        // accepted the invariant above would never have been exercised.
        expect(rejected, `no mutation of the token for ${name} was rejected`).toBeGreaterThan(0);
        expect(accepted, `no mutation of the token for ${name} was accepted`).toBeGreaterThan(0);
      }
    });
  });

  describe('tamper rejection: payloads edited inside a real token', () => {
    /**
     * The payload of a token the real encoder produced, unwrapped so that each
     * case below can edit it as data and wrap it again.
     *
     * Deriving every case from real encoder output is deliberate. Hand-writing
     * what a payload is believed to look like would make these cases agree with
     * an assumption rather than with the encoder, and would quietly stop testing
     * anything the day the encoding changed behind its version tag.
     */
    const reference = encodeKeysetCursor(REFERENCE_POSITION);
    const { text: canonicalText, payload } = unwrap(reference);

    /** Wraps an edited payload back into a candidate token. */
    const rewrap = (edited: unknown): string => encodeBytes(JSON.stringify(edited));

    /** Wraps edited payload *text* back into a candidate token. */
    const rewrapText = (edited: string): string => encodeBytes(edited);

    it('unwraps a real token to the payload the encoder wrote', () => {
      // The premise every case in this block rests on. If unwrapping and
      // rewrapping were not lossless, a "rejected" result below could be an
      // artifact of the helper rather than a property of the codec.
      expect(rewrapText(canonicalText)).toBe(reference);
      expect(decodeKeysetCursor(rewrapText(canonicalText))).toStrictEqual(REFERENCE_POSITION);
      expect(payload.c).toBe(REFERENCE_POSITION.conversationId);
      expect(payload.s).toBe(REFERENCE_POSITION.sequence);
    });

    /** One payload-level tamper case. */
    interface PayloadCase {
      readonly name: string;
      readonly candidate: () => string;
    }

    /**
     * Payloads the contract itself refuses.
     *
     * Every one of these is well-formed text that parses cleanly and is then
     * turned away by validation, so each is expected to report the contract as
     * the reason. The reason is asserted rather than only the fact of a
     * rejection, and the extra-key case is why: with unknown keys stripped
     * instead of refused, that payload would validate as the position it wraps
     * and be caught a step later by the canonical comparison. The value would
     * still be rejected, so a test that stopped at "it rejected" would keep
     * passing while the strictness this codec documents had quietly gone —
     * measured by relaxing the schema and watching every assertion hold.
     */
    const CONTRACT_CASES: readonly PayloadCase[] = [
      {
        name: 'a version tag the codec does not mint',
        candidate: () => rewrap({ v: payload.v + 1, c: payload.c, s: payload.s }),
      },
      {
        name: 'an extra key beyond the position',
        candidate: () => rewrap({ v: payload.v, c: payload.c, s: payload.s, limit: 50 }),
      },
      {
        name: 'a missing conversation',
        candidate: () => rewrap({ v: payload.v, s: payload.s }),
      },
      {
        name: 'a missing sequence',
        candidate: () => rewrap({ v: payload.v, c: payload.c }),
      },
      {
        name: 'a sequence written as a string',
        candidate: () => rewrap({ v: payload.v, c: payload.c, s: String(payload.s) }),
      },
      {
        name: 'a negative sequence',
        candidate: () => rewrap({ v: payload.v, c: payload.c, s: -1 }),
      },
      {
        name: 'a fractional sequence',
        candidate: () => rewrap({ v: payload.v, c: payload.c, s: 1.5 }),
      },
      {
        name: 'a sequence past the exactly-representable range',
        candidate: () => rewrap({ v: payload.v, c: payload.c, s: Number.MAX_SAFE_INTEGER + 1 }),
      },
      {
        name: 'a null sequence',
        candidate: () => rewrap({ v: payload.v, c: payload.c, s: null }),
      },
      {
        name: 'an empty conversation',
        candidate: () => rewrap({ v: payload.v, c: '', s: payload.s }),
      },
      {
        name: 'a conversation past the accepted length',
        candidate: () => rewrap({ v: payload.v, c: 'y'.repeat(65), s: payload.s }),
      },
      {
        name: 'a conversation that is not a string',
        candidate: () => rewrap({ v: payload.v, c: 7, s: payload.s }),
      },
      {
        name: 'an array where the payload belongs',
        candidate: () => rewrap([payload.v, payload.c, payload.s]),
      },
      {
        name: 'a null payload',
        candidate: () => rewrap(null),
      },
    ];

    it.each(CONTRACT_CASES)('rejects $name against the contract', ({ candidate }) => {
      const error = expectRejection(candidate());

      expect(error.message).toContain('does not satisfy the cursor contract');
    });

    /**
     * Payloads that are not well-formed text at all.
     *
     * These never reach validation, so they report a parse failure instead, and
     * that distinction is asserted for the same reason as above: it is what shows
     * the value was turned away where it should have been rather than surviving
     * to a later guard.
     */
    const MALFORMED_CASES: readonly PayloadCase[] = [
      {
        name: 'a sequence that is not a number a payload can hold',
        candidate: () => rewrapText(canonicalText.replace(`"s":${String(payload.s)}`, '"s":NaN')),
      },
      {
        name: 'a sequence written with a leading zero',
        candidate: () => rewrapText(canonicalText.replace(`"s":${String(payload.s)}`, '"s":007')),
      },
      {
        name: 'a payload missing its closing brace',
        candidate: () => rewrapText(canonicalText.slice(0, -1)),
      },
      {
        name: 'text that is not a payload at all',
        candidate: () => rewrapText('this is not a position'),
      },
    ];

    it.each(MALFORMED_CASES)('rejects $name as unparseable', ({ candidate }) => {
      const error = expectRejection(candidate());

      expect(error.message).toContain('not a well-formed payload');
    });

    /**
     * Payloads that satisfy the contract and are still not the one written form
     * the encoder produces.
     *
     * These are the cases only the canonical guard catches: each one validates,
     * carries the right position, and differs from what the encoder would have
     * written. Without that guard every one of them would be accepted, which
     * would give a single position several tokens.
     */
    const NON_CANONICAL_CASES: readonly PayloadCase[] = [
      {
        name: 'a payload whose keys are in a different order',
        candidate: () => rewrap({ c: payload.c, v: payload.v, s: payload.s }),
      },
      {
        name: 'a payload written with incidental whitespace',
        candidate: () => encodeBytes(JSON.stringify(payload, null, 1)),
      },
      {
        name: 'a payload with a space after each separator',
        candidate: () => rewrapText(canonicalText.replaceAll(',', ', ').replaceAll(':', ': ')),
      },
      {
        name: 'an identifier whose first character is written as an escape',
        candidate: () => rewrapText(canonicalText.replace('"c":"c', '"c":"\\u0063')),
      },
      {
        name: 'a sequence written in exponent form',
        candidate: () => rewrapText(canonicalText.replace(`"s":${String(payload.s)}`, '"s":7e0')),
      },
      {
        name: 'a payload followed by a line feed',
        candidate: () => rewrapText(`${canonicalText}\n`),
      },
      {
        name: 'a payload preceded by a space',
        candidate: () => rewrapText(` ${canonicalText}`),
      },
    ];

    it.each(NON_CANONICAL_CASES)('rejects $name', ({ candidate }) => {
      const error = expectRejection(candidate());

      // The guard that fired is asserted, not just the fact of a rejection.
      // Each of these payloads is contract-valid, so a rejection could only come
      // from the canonical comparison — and if one of them ever started failing
      // validation instead, this test would still pass while the guard it exists
      // to cover had stopped being exercised.
      expect(error.message).toContain('canonical form');
    });

    it('accepts none of the non-canonical forms as an alternative token', () => {
      // Stated as a set so that the property is visible as a property: one
      // position has exactly one token, and every alternative spelling of the
      // same position is rejected rather than treated as an equivalent.
      for (const { name, candidate } of NON_CANONICAL_CASES) {
        const value = candidate();

        expect(value, `${name} produced the canonical token itself`).not.toBe(reference);
        expect(attemptDecode(value).rejected, `${name} was accepted`).toBe(true);
      }
    });
  });

  describe('tamper rejection: values that were never tokens', () => {
    const NEVER_TOKENS: ReadonlyArray<readonly [string, string]> = [
      ['the empty string', ''],
      ['a plus sign, which base64url does not use', '+'],
      ['a solidus, which base64url does not use', '/'],
      ['an equals sign, because a token carries no padding', '='],
      ['a space', ' '],
      ['a line feed', '\n'],
      ['a tab', '\t'],
      ['a character outside the ASCII range', '\u00e9'],
      ['an emoji', '\u{1f600}'],
      ['a single dot', '.'],
      ['a percent-encoded sequence', '%2F'],
      ['ordinary prose', 'not a cursor'],
    ];

    it.each(NEVER_TOKENS)('rejects %s', (_name, candidate) => {
      expectRejection(candidate);
    });

    it('rejects the empty string as empty rather than as badly formed', () => {
      // The empty string would be turned away regardless, because the accepted
      // alphabet requires at least one character — which is exactly why the
      // reason is asserted here. Without its own check the rejection would
      // report that the value carries characters no cursor contains, of a value
      // that carries no characters at all, and the reader chasing it would be
      // looking for a stray character that was never there.
      const error = expectRejection('');

      expect(error.message).toContain('an empty value is not a cursor');
    });

    it('rejects a value carrying a character no token contains, before decoding it', () => {
      const token = encodeKeysetCursor(REFERENCE_POSITION);
      const error = expectRejection(`${token.slice(0, -1)}+`);

      // The alphabet guard runs ahead of any decoding, and the reason it reports
      // is what proves that. A rejection alone would not distinguish it from a
      // failure discovered later, after the value had been decoded and parsed.
      expect(error.message).toContain('characters no cursor contains');
    });

    it('rejects an oversized value on its length rather than by parsing it', () => {
      // The bound exists so that a hostile multi-megabyte value costs one
      // integer comparison instead of a scan, a decode and a parse. The reason
      // reported is the only externally visible evidence that the cheap guard is
      // the one that fired, so it is asserted: a rejection on its own would look
      // identical if the bound were removed and the value parsed instead.
      const error = expectRejection('A'.repeat(4096));

      expect(error.message).toContain('longer than any cursor this codec produces');
    });

    it('accepts the longest token it can mint, so the bound never rejects a real one', () => {
      // The paired half of the bound: it has to sit above every token the
      // encoder can produce, or the codec would mint values it then refused.
      const longest = encodeKeysetCursor({
        conversationId: LONGEST_ID,
        sequence: Number.MAX_SAFE_INTEGER,
      });

      expect(decodeKeysetCursor(longest)).toStrictEqual({
        conversationId: LONGEST_ID,
        sequence: Number.MAX_SAFE_INTEGER,
      });
    });

    const NON_STRINGS: ReadonlyArray<readonly [string, unknown]> = [
      ['undefined', undefined],
      ['null', null],
      ['a number', 42],
      ['a numeric zero', 0],
      ['a boolean', true],
      ['an array', []],
      ['a plain object', {}],
      ['an object shaped like a position', { conversationId: ORDINARY_ID, sequence: 7 }],
      ['a function', (): void => undefined],
      ['a symbol', Symbol('candidate')],
      ['a bigint', 7n],
    ];

    it.each(NON_STRINGS)('rejects %s', (_name, candidate) => {
      // The decoder takes `unknown` precisely so none of these can slip past a
      // boundary that was never typed in the first place — a query string, a
      // request body, a value a client stored and returned.
      const error = expectRejection(candidate);

      // The reason is asserted so that the type check is what turned the value
      // away. A decoder that stringified first would still reject most of these,
      // and would then report a shape failure for a value whose real problem was
      // that it was never a string.
      expect(error.message).toContain('a cursor is a string and this value is not one');
    });
  });

  describe('rejection reporting', () => {
    it('rejects with its own error type, recognisable as an error', () => {
      const error = expectRejection('');

      expect(error).toBeInstanceOf(InvalidCursorError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('InvalidCursorError');
      expect(error.message.length).toBeGreaterThan(0);
    });

    it('reports the same error type for every failure class', () => {
      // One rejection type across every path means a caller has one thing to
      // catch. A path that threw something else would be a rejection the read
      // path could not handle uniformly.
      const token = encodeKeysetCursor(REFERENCE_POSITION);
      const { text: canonicalText } = unwrap(token);

      const acrossEveryPath: readonly unknown[] = [
        undefined,
        '',
        'A'.repeat(4096),
        '+',
        token.slice(0, -1),
        `${token}A`,
        encodeBytes('not a payload'),
        encodeBytes(`${canonicalText}\n`),
      ];

      for (const candidate of acrossEveryPath) {
        const error = expectRejection(candidate);

        expect(error.name).toBe('InvalidCursorError');
      }
    });

    it('does not echo the rejected value or the conversation it names', () => {
      // The module is specified not to echo what it rejected, and this is the
      // assertion that keeps it that way: an echoed token travels into whatever
      // log or response the reason reaches, carrying caller-supplied text with
      // it.
      //
      // Only values long enough to be unmistakable are checked. A one-character
      // candidate such as a space occurs in the reason sentence itself, so
      // asserting that a short value is absent would fail on the wording rather
      // than on an echo.
      const token = encodeKeysetCursor(REFERENCE_POSITION);
      const tampered = `${token}AAAA`;

      for (const candidate of [tampered, `${token.slice(0, -1)}+`, 'A'.repeat(4096)]) {
        const error = expectRejection(candidate);

        expect(candidate.length).toBeGreaterThan(20);
        expect(error.message).not.toContain(candidate);
        expect(error.message).not.toContain(ORDINARY_ID);
      }
    });

    it('attaches no decoded payload to the rejection', () => {
      // A cause carrying a validation failure would put a partly decoded payload
      // into the one field a reader tends to log, which is the same exposure as
      // echoing the value.
      //
      // The candidate is a real token's own payload with its identifier emptied,
      // so it fails validation with a payload already parsed and available to
      // attach. Deriving it rather than writing a payload out by hand keeps this
      // case honest for the same reason as every other tamper case above.
      const { payload } = unwrap(encodeKeysetCursor(REFERENCE_POSITION));
      const error = expectRejection(
        encodeBytes(JSON.stringify({ v: payload.v, c: '', s: payload.s })),
      );

      expect(error.cause).toBeUndefined();
      expect(error.message).not.toContain('"c"');
      expect(error.message).not.toContain(String(payload.s));
    });

    it('never returns a partially populated position when it rejects', () => {
      // The failure this file exists to catch, asserted directly on the shape of
      // every rejection outcome rather than inferred from a thrown error: no
      // candidate produces an object with one field filled in and the other
      // missing, and none produces a fallback position.
      const token = encodeKeysetCursor(REFERENCE_POSITION);
      const { text: canonicalText, payload } = unwrap(token);

      const candidates: readonly unknown[] = [
        undefined,
        null,
        '',
        '+',
        'A'.repeat(4096),
        token.slice(0, -1),
        `${token}A`,
        `${token}=`,
        encodeBytes(JSON.stringify({ v: payload.v, s: payload.s })),
        encodeBytes(JSON.stringify({ v: payload.v, c: payload.c })),
        encodeBytes(JSON.stringify({ c: payload.c, v: payload.v, s: payload.s })),
        encodeBytes(`${canonicalText}\n`),
      ];

      for (const candidate of candidates) {
        const outcome = attemptDecode(candidate);

        expect(outcome.rejected).toBe(true);
        expect('value' in outcome).toBe(false);
        expect(Object.keys(outcome)).toStrictEqual(['rejected', 'error']);
      }
    });
  });

  describe('encoding a position the codec cannot carry', () => {
    // The encoder validates on the way out even though its parameter is typed,
    // because a caller can hold a value that does not satisfy the type: a row
    // read without validation, a parsed request body, a type assertion. Minting
    // a token from one of those would produce a value the decoder rejects, and
    // that asymmetry surfaces later as history refusing to load rather than as a
    // fault where the mistake was made.
    const UNCARRIABLE: ReadonlyArray<readonly [string, KeysetCursor]> = [
      ['a negative sequence', { conversationId: ORDINARY_ID, sequence: -1 }],
      ['a fractional sequence', { conversationId: ORDINARY_ID, sequence: 1.5 }],
      ['a sequence that is not a number', { conversationId: ORDINARY_ID, sequence: Number.NaN }],
      ['an infinite sequence', { conversationId: ORDINARY_ID, sequence: Number.POSITIVE_INFINITY }],
      [
        'a sequence past the exactly-representable range',
        { conversationId: ORDINARY_ID, sequence: Number.MAX_SAFE_INTEGER + 1 },
      ],
      ['an empty conversation', { conversationId: '', sequence: 7 }],
      ['a conversation past the accepted length', { conversationId: 'y'.repeat(65), sequence: 7 }],
    ];

    it.each(UNCARRIABLE)('refuses to mint a token for %s', (_name, position) => {
      let raised: unknown;
      let minted: string | undefined;

      try {
        minted = encodeKeysetCursor(position);
      } catch (error) {
        raised = error;
      }

      // Both halves again: the rejection was raised, and no token came back to
      // be handed to a caller.
      expect(minted).toBeUndefined();
      expect(raised).toBeInstanceOf(InvalidCursorError);
    });

    it('mints a token for every position it accepts', () => {
      // The paired half: validation on the way out must not reject anything the
      // decoder would have accepted, or the two directions would disagree.
      for (const { name, position } of POSITION_CASES) {
        const token = encodeKeysetCursor(position);

        expect(token, `no token was minted for ${name}`).toMatch(BASE64URL_ONLY);
      }
    });
  });
});
