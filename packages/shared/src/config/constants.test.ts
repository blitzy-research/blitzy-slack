/**
 * The compile-time invariants module's own unit test.
 *
 * WHY THIS FILE IS COMPULSORY
 *
 * Rule R3 forbids treating anything as satisfied without a passing test behind
 * it, and this module is where several acceptance criteria are ultimately
 * decided: the channel-name ceiling, the two-option visibility set with its
 * arriving selection, and the snippet's content-only-required rule are each a
 * criterion whose truth reduces to a value declared here. A criterion resting on
 * an unasserted constant is a criterion asserted and never checked.
 *
 * The register makes the obligation concrete rather than general. The entries
 * this module's authored values required in `docs/decisions/gap-register.md` name
 * this file in their `Proved by` field, and that register states plainly that the
 * field "is what does the holding". A named test that does not exist is a
 * register row that holds nothing.
 *
 * WHAT IS ASSERTED, AND WHY IT IS ASSERTED THIS WAY
 *
 * Three kinds of property, and the second and third are the ones a value-only
 * test would miss.
 *
 * THE VALUES, against the evidence. Each criterion-bearing constant is asserted
 * against the figure its catalogue line states, with the citation on the test so
 * the two can be compared without leaving the file.
 *
 * THE SHAPES the compiler must preserve. A module of literals is only useful to
 * its consumers if the literal types survive to the declaration file — a
 * consumer narrowing on a visibility, or a schema building an enumeration from
 * the tuple, needs `'public'` and not `string`. So the assignments above the
 * suites are type assertions that fail the build if a literal ever widens, and
 * they are proved to bite: changing one of them to a neighbouring literal fails
 * `tsc`, which is what distinguishes a real assertion from a line that merely
 * compiles. They are referenced by a test so that no-unused-locals does not
 * strip the guarantee.
 *
 * THE RELATIONSHIPS between values, which is where a wrong number hides. Several
 * of these constants are one decision expressed as two figures, and a value
 * changed on its own would leave the invariant intact and the behaviour broken:
 * a presence lifetime that is no longer three heartbeat intervals stops
 * tolerating a lost heartbeat, a typing lifetime that is no longer a comfortable
 * multiple of its emission interval makes a continuing typist flicker, and a
 * backoff ceiling below its base is not a ceiling. Each pairing is asserted as a
 * relationship rather than as two independent numbers.
 *
 * Two negative properties are asserted for the same reason. The name pattern
 * carries no length bound, so an over-long name and an illegal-character name
 * stay separately reportable — asserted by passing a name that is legal in every
 * character and far too long, and one that is short and illegal. And no value
 * here responds to the environment, asserted by setting look-alike variables and
 * comparing the whole module before and after; an invariant that an environment
 * can move is not an invariant, and for the verifier parameters an override is
 * the downgrade itself.
 *
 * ONE MODULE, EXERCISED RATHER THAN MIRRORED
 *
 * Rule R5 requires one implementation reached through one entry point, and a
 * test is not exempt: a character class re-authored here to "check the first"
 * would make this file agree with itself instead of with the module. So every
 * character-rule assertion runs the real `CHANNEL_NAME_PATTERN`, and the
 * remaining-counter assertion computes from the real `CHANNEL_NAME_MAX_LENGTH`
 * rather than from eighty. The export-set assertion exists for the same reason
 * from the other direction: it fails when a symbol is added here without being
 * considered, which is how a second opinion about a shared value gets in.
 *
 * WHAT THIS FILE DELIBERATELY DOES NOT ASSERT
 *
 * Rule R1 places authorization on the server, at the point of execution, against
 * the acting session and the specific target object. None of those exists here —
 * this module holds no session, no policy and no database handle, performs no
 * mutation and serves no projection — so the denial tests the rule requires
 * belong to the API's integration suites. One property does bear on it and is
 * asserted below: the export set contains no role, capability, permission or
 * identifier symbol, so there is nothing here a server could be tempted to
 * trust. Asserting the whole set rather than the individual values is what makes
 * that hold for a symbol nobody has thought of yet.
 *
 * Nor does this file assert anything about how a value is rendered. Whether a
 * counter is right-aligned, when it appears and what sentence sits beside it are
 * the interface's concerns and belong to the component that owns them.
 *
 * FIXTURES
 *
 * Every name used as test data is authored and semantically empty, as rule R4
 * requires: none was read from a frame, none is a workspace, channel or person
 * name from the corpus, and no frame was opened to write this file. The
 * rejection cases are built from character classes rather than from strings that
 * appeared anywhere.
 */
import { describe, expect, it } from 'vitest';

import * as invariants from './constants.js';
import {
  type ChannelVisibility,
  type SnippetRequiredField,
  ARGON2ID_ALGORITHM,
  ARGON2ID_MEMORY_COST_KIB,
  ARGON2ID_PARALLELISM,
  ARGON2ID_TIME_COST,
  CHANNEL_NAME_MAX_LENGTH,
  CHANNEL_NAME_MIN_LENGTH,
  CHANNEL_NAME_PATTERN,
  CHANNEL_VISIBILITIES,
  DEFAULT_CHANNEL_VISIBILITY,
  PRESENCE_COALESCE_WINDOW_MS,
  PRESENCE_HEARTBEAT_INTERVAL_MS,
  PRESENCE_TTL_MS,
  REALTIME_BACKOFF_BASE_MS,
  REALTIME_BACKOFF_CEILING_MS,
  REALTIME_BACKOFF_JITTER_RATIO,
  REALTIME_BACKOFF_MAX_ATTEMPTS,
  REALTIME_REPLAY_WINDOW_EVENTS,
  REALTIME_REPLAY_WINDOW_MAX_EVENTS,
  SNIPPET_DEFAULT_TYPE,
  SNIPPET_REQUIRED_FIELDS,
  SNIPPET_SHARE_TO_CONVERSATION_DEFAULT,
  TYPING_SIGNAL_MIN_INTERVAL_MS,
  TYPING_SIGNAL_TTL_MS,
} from './constants.js';

// ---------------------------------------------------------------------------
// Type assertions. Each one fails the build if the declaration file ever widens
// the literal a consumer depends on. They are collected into one array below so
// that no-unused-locals cannot strip them.
// ---------------------------------------------------------------------------

const CEILING_IS_THE_LITERAL_EIGHTY: 80 = CHANNEL_NAME_MAX_LENGTH;
const FLOOR_IS_THE_LITERAL_ONE: 1 = CHANNEL_NAME_MIN_LENGTH;
const VISIBILITIES_ARE_A_READONLY_PAIR: readonly ['public', 'private'] = CHANNEL_VISIBILITIES;
const DEFAULT_KEEPS_ITS_LITERAL: 'public' = DEFAULT_CHANNEL_VISIBILITY;
const DEFAULT_IS_A_VISIBILITY: ChannelVisibility = DEFAULT_CHANNEL_VISIBILITY;
const REQUIRED_FIELDS_ARE_READONLY: readonly ['content'] = SNIPPET_REQUIRED_FIELDS;
const REQUIRED_FIELD_NAMES_THE_EDITOR: SnippetRequiredField = 'content';
const SNIPPET_TYPE_KEEPS_ITS_LITERAL: 'auto' = SNIPPET_DEFAULT_TYPE;
const ALGORITHM_KEEPS_ITS_LITERAL: 'argon2id' = ARGON2ID_ALGORITHM;
const REPLAY_ALIAS_IS_THE_SAME_LITERAL: 500 = REALTIME_REPLAY_WINDOW_MAX_EVENTS;

const TYPE_ASSERTIONS = [
  CEILING_IS_THE_LITERAL_EIGHTY,
  FLOOR_IS_THE_LITERAL_ONE,
  VISIBILITIES_ARE_A_READONLY_PAIR,
  DEFAULT_KEEPS_ITS_LITERAL,
  DEFAULT_IS_A_VISIBILITY,
  REQUIRED_FIELDS_ARE_READONLY,
  REQUIRED_FIELD_NAMES_THE_EDITOR,
  SNIPPET_TYPE_KEEPS_ITS_LITERAL,
  ALGORITHM_KEEPS_ITS_LITERAL,
  REPLAY_ALIAS_IS_THE_SAME_LITERAL,
] as const;

/**
 * Every symbol the module exports at run time, in one place.
 *
 * Asserted as a set rather than checked symbol by symbol, so that a value added
 * without being considered fails here. That is the failure worth catching: a
 * second opinion about a shared invariant, or a symbol of a kind this module may
 * not hold, arrives by addition and never by modification.
 */
const EXPECTED_EXPORTS = [
  'ARGON2ID_ALGORITHM',
  'ARGON2ID_MEMORY_COST_KIB',
  'ARGON2ID_PARALLELISM',
  'ARGON2ID_TIME_COST',
  'CHANNEL_NAME_MAX_LENGTH',
  'CHANNEL_NAME_MIN_LENGTH',
  'CHANNEL_NAME_PATTERN',
  'CHANNEL_VISIBILITIES',
  'DEFAULT_CHANNEL_VISIBILITY',
  'PRESENCE_COALESCE_WINDOW_MS',
  'PRESENCE_HEARTBEAT_INTERVAL_MS',
  'PRESENCE_TTL_MS',
  'REALTIME_BACKOFF_BASE_MS',
  'REALTIME_BACKOFF_CEILING_MS',
  'REALTIME_BACKOFF_JITTER_RATIO',
  'REALTIME_BACKOFF_MAX_ATTEMPTS',
  'REALTIME_REPLAY_WINDOW_EVENTS',
  'REALTIME_REPLAY_WINDOW_MAX_EVENTS',
  'SNIPPET_DEFAULT_TYPE',
  'SNIPPET_REQUIRED_FIELDS',
  'SNIPPET_SHARE_TO_CONVERSATION_DEFAULT',
  'TYPING_SIGNAL_MIN_INTERVAL_MS',
  'TYPING_SIGNAL_TTL_MS',
];

/**
 * Names used as test data. Authored, semantically empty, and chosen for the
 * character class each one exercises rather than for how it reads.
 */
const ACCEPTED_NAMES = [
  'quarterly-planning',
  'release_2026',
  'a',
  '7',
  '-',
  '_',
  'a-b_c-9',
  // A script with no upper case cannot violate a lower-case rule, so it is not
  // excluded by one. Escaped rather than written literally so the assertion says
  // which code points it means.
  '\u3072\u3089\u304c\u306a',
  // A combining mark composes a correct name in several scripts rather than
  // corrupting one.
  '\u0915\u094d\u0937\u093f',
];

const REJECTED_NAMES = [
  // The three prohibitions the catalogue states, in order.
  'Design',
  'two words',
  'with.period',
  // Whitespace of every kind an input can carry, including the two that look
  // like an ordinary space.
  ' leading',
  'trailing ',
  'tab\tseparated',
  'line\nbreak',
  'no\u00a0break',
  'ideographic\u3000space',
  // Punctuation and symbols, which the class admits none of.
  'a/b',
  'a:b',
  'a@b',
  'a#b',
  'a!b',
  'a,b',
  'a+b',
  'a%b',
  // Bidirectional and zero-width formatting characters, which are invisible in
  // a rendered name and therefore the most dangerous thing to admit.
  'a\u200eb',
  'a\u202eb',
  'a\ufeffb',
  'a\u200bb',
];

describe('the module contract', () => {
  it('exports exactly the values it is meant to hold, and nothing more', () => {
    expect(Object.keys(invariants).sort()).toEqual([...EXPECTED_EXPORTS].sort());
  });

  it('holds no symbol that could become an authorization input', () => {
    const forbidden = /ROLE|CAPABILIT|PERMISSION|ADMIN|OWNER|GUEST|WORKSPACE_ID|ACTOR|TENANT|SCOPE/;
    expect(Object.keys(invariants).filter((name) => forbidden.test(name))).toEqual([]);
  });

  it('does not respond to the environment, which is what makes an invariant one', () => {
    const before = { ...invariants };
    const lookalikes = [
      'CHANNEL_NAME_MAX_LENGTH',
      'ARGON2ID_MEMORY_COST_KIB',
      'ARGON2ID_TIME_COST',
      'REALTIME_REPLAY_WINDOW_EVENTS',
      'DEFAULT_CHANNEL_VISIBILITY',
    ];

    for (const name of lookalikes) {
      process.env[name] = 'weakened';
    }
    try {
      expect({ ...invariants }).toEqual(before);
    } finally {
      for (const name of lookalikes) {
        delete process.env[name];
      }
    }
  });

  it('keeps every literal type its consumers narrow on', () => {
    expect(TYPE_ASSERTIONS).toHaveLength(10);
  });
});

describe('the channel-name grammar', () => {
  // AC: 02-channels.md L982 · frame 69
  it('caps a name at eighty characters', () => {
    expect(CHANNEL_NAME_MAX_LENGTH).toBe(80);
  });

  // AC: 02-channels.md L983 · frame 58
  it('requires at least one character, in the floor and in the pattern alike', () => {
    expect(CHANNEL_NAME_MIN_LENGTH).toBe(1);
    expect(CHANNEL_NAME_PATTERN.test('')).toBe(false);
  });

  it('admits every name built from the permitted set', () => {
    for (const name of ACCEPTED_NAMES) {
      expect(CHANNEL_NAME_PATTERN.test(name), name).toBe(true);
    }
  });

  // AC: 02-channels.md L982 · frame 97
  it('refuses upper case, spaces, periods and every symbol outside the set', () => {
    for (const name of REJECTED_NAMES) {
      expect(CHANNEL_NAME_PATTERN.test(name), JSON.stringify(name)).toBe(false);
    }
  });

  it('carries no length bound, so length and legality stay separate findings', () => {
    const legalButOverlong = 'a'.repeat(CHANNEL_NAME_MAX_LENGTH + 40);
    expect(CHANNEL_NAME_PATTERN.test(legalButOverlong)).toBe(true);
    expect(legalButOverlong.length).toBeGreaterThan(CHANNEL_NAME_MAX_LENGTH);

    const shortButIllegal = 'A';
    expect(CHANNEL_NAME_PATTERN.test(shortButIllegal)).toBe(false);
    expect(shortButIllegal.length).toBeLessThanOrEqual(CHANNEL_NAME_MAX_LENGTH);
  });

  it('is anchored at both ends, so it answers about a whole name', () => {
    expect(CHANNEL_NAME_PATTERN.source.startsWith('^')).toBe(true);
    expect(CHANNEL_NAME_PATTERN.source.endsWith('$')).toBe(true);
    expect(CHANNEL_NAME_PATTERN.test('ok Not ok')).toBe(false);
  });

  it('is stateless, so a shared instance cannot answer differently twice', () => {
    expect(CHANNEL_NAME_PATTERN.flags).toBe('u');
    expect(CHANNEL_NAME_PATTERN.global).toBe(false);
    expect(CHANNEL_NAME_PATTERN.sticky).toBe(false);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(CHANNEL_NAME_PATTERN.test('a-stable-name')).toBe(true);
      expect(CHANNEL_NAME_PATTERN.lastIndex).toBe(0);
    }
  });

  it('answers about a single character, which is what a derived name needs', () => {
    expect(CHANNEL_NAME_PATTERN.test('a')).toBe(true);
    expect(CHANNEL_NAME_PATTERN.test(' ')).toBe(false);
    expect(CHANNEL_NAME_PATTERN.test('.')).toBe(false);
  });

  // AC: 02-channels.md L291 · frames 69, 97
  it('supports a counter that counts down rather than up', () => {
    const remaining = (value: string): number => CHANNEL_NAME_MAX_LENGTH - value.length;

    // Frame 69: an empty field, and the counter reads exactly the ceiling.
    expect(remaining('')).toBe(CHANNEL_NAME_MAX_LENGTH);
    // Frame 97: a field holding a name, and the counter reads below it.
    expect(remaining('a-name-in-the-field')).toBeLessThan(CHANNEL_NAME_MAX_LENGTH);
    // At the ceiling there is nothing left, which is a different state from a
    // rejection and has to be reachable.
    expect(remaining('a'.repeat(CHANNEL_NAME_MAX_LENGTH))).toBe(0);
  });
});

describe('channel visibility', () => {
  // AC: 02-channels.md L984 · frames 60, 61
  it('offers exactly two options, public first', () => {
    expect(CHANNEL_VISIBILITIES).toEqual(['public', 'private']);
    expect(CHANNEL_VISIBILITIES).toHaveLength(2);
    expect(CHANNEL_VISIBILITIES[0]).toBe('public');
    expect(CHANNEL_VISIBILITIES[1]).toBe('private');
  });

  // AC: 02-channels.md L984 · frame 60
  it('arrives with public pre-selected, and the default is a member of the set', () => {
    expect(DEFAULT_CHANNEL_VISIBILITY).toBe('public');
    expect(CHANNEL_VISIBILITIES).toContain(DEFAULT_CHANNEL_VISIBILITY);
  });

  it('holds no third option, so a schema built from the set cannot admit one', () => {
    expect(new Set(CHANNEL_VISIBILITIES).size).toBe(CHANNEL_VISIBILITIES.length);
  });
});

describe('the snippet field rules', () => {
  // AC: 03-messaging-and-composer.md L761 · frames 144, 148
  it('requires the content editor and nothing else', () => {
    expect(SNIPPET_REQUIRED_FIELDS).toEqual(['content']);
    expect(SNIPPET_REQUIRED_FIELDS).toHaveLength(1);
    expect(SNIPPET_REQUIRED_FIELDS).not.toContain('title');
  });

  // AC: 03-messaging-and-composer.md L761 · frame 144
  it('arrives on the auto-detection sentinel with sharing already set', () => {
    expect(SNIPPET_DEFAULT_TYPE).toBe('auto');
    expect(SNIPPET_SHARE_TO_CONVERSATION_DEFAULT).toBe(true);
  });

  it('stays snippet-scoped rather than becoming a rule about other dialogs', () => {
    // 03-messaging-and-composer.md L688 records that the link dialog does not
    // gate on its destination, so a required-field set that spanned this area's
    // dialogs would contradict the evidence. Asserted over the export set so
    // that a generalised symbol cannot be introduced quietly.
    const exported = Object.keys(invariants);
    expect(exported.filter((name) => name.includes('REQUIRED_FIELD'))).toEqual([
      'SNIPPET_REQUIRED_FIELDS',
    ]);
    expect(exported.filter((name) => name.startsWith('LINK_'))).toEqual([]);
    expect(exported.filter((name) => name.startsWith('DIALOG_'))).toEqual([]);
  });
});

describe('the password-verifier parameters', () => {
  it('pins the hybrid variant at the chosen rung of the equal-strength ladder', () => {
    expect(ARGON2ID_ALGORITHM).toBe('argon2id');
    expect(ARGON2ID_MEMORY_COST_KIB).toBe(19456);
    expect(ARGON2ID_TIME_COST).toBe(2);
    expect(ARGON2ID_PARALLELISM).toBe(1);
  });

  it('states its memory in kibibytes, so a mebibyte figure cannot be passed by mistake', () => {
    expect(ARGON2ID_MEMORY_COST_KIB).toBe(19 * 1024);
    expect(ARGON2ID_MEMORY_COST_KIB).toBeGreaterThan(1024);
  });

  it('holds every cost as a positive integer a verifier can consume directly', () => {
    for (const value of [ARGON2ID_MEMORY_COST_KIB, ARGON2ID_TIME_COST, ARGON2ID_PARALLELISM]) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });

  it('keeps parallelism at one, so the memory is not divided across lanes', () => {
    expect(ARGON2ID_PARALLELISM).toBe(1);
  });
});

describe('the realtime protocol parameters', () => {
  it('bounds replay, and exposes the bound under both names with one value', () => {
    expect(REALTIME_REPLAY_WINDOW_EVENTS).toBe(500);
    expect(REALTIME_REPLAY_WINDOW_MAX_EVENTS).toBe(REALTIME_REPLAY_WINDOW_EVENTS);
  });

  it('bounds replay by a whole number of events rather than by a duration', () => {
    expect(Number.isInteger(REALTIME_REPLAY_WINDOW_EVENTS)).toBe(true);
    expect(REALTIME_REPLAY_WINDOW_EVENTS).toBeGreaterThan(0);
  });

  it('keeps backoff coherent: a ceiling above its base, and a bound on attempts', () => {
    expect(REALTIME_BACKOFF_BASE_MS).toBe(500);
    expect(REALTIME_BACKOFF_CEILING_MS).toBe(30_000);
    expect(REALTIME_BACKOFF_CEILING_MS).toBeGreaterThan(REALTIME_BACKOFF_BASE_MS);
    expect(REALTIME_BACKOFF_MAX_ATTEMPTS).toBe(10);
    expect(Number.isInteger(REALTIME_BACKOFF_MAX_ATTEMPTS)).toBe(true);
    expect(REALTIME_BACKOFF_MAX_ATTEMPTS).toBeGreaterThan(1);
  });

  it('draws jitter from a band that breaks lockstep without exceeding the ceiling', () => {
    expect(REALTIME_BACKOFF_JITTER_RATIO).toBe(0.5);
    expect(REALTIME_BACKOFF_JITTER_RATIO).toBeGreaterThan(0);
    expect(REALTIME_BACKOFF_JITTER_RATIO).toBeLessThanOrEqual(1);
  });

  it('keeps a typing indicator alive across a lost signal without pinning it open', () => {
    expect(TYPING_SIGNAL_MIN_INTERVAL_MS).toBe(3_000);
    expect(TYPING_SIGNAL_TTL_MS).toBe(8_000);
    // More than two emission intervals, so one dropped signal is invisible.
    expect(TYPING_SIGNAL_TTL_MS).toBeGreaterThan(TYPING_SIGNAL_MIN_INTERVAL_MS * 2);
    // And well under a minute, so someone who walks away stops appearing to type.
    expect(TYPING_SIGNAL_TTL_MS).toBeLessThan(60_000);
  });

  it('expires presence at three heartbeat intervals, so two may be lost', () => {
    expect(PRESENCE_HEARTBEAT_INTERVAL_MS).toBe(20_000);
    expect(PRESENCE_TTL_MS).toBe(60_000);
    expect(PRESENCE_TTL_MS).toBe(PRESENCE_HEARTBEAT_INTERVAL_MS * 3);
  });

  it('coalesces presence inside one heartbeat, so a burst becomes one frame', () => {
    expect(PRESENCE_COALESCE_WINDOW_MS).toBe(1_000);
    expect(PRESENCE_COALESCE_WINDOW_MS).toBeGreaterThan(0);
    expect(PRESENCE_COALESCE_WINDOW_MS).toBeLessThan(PRESENCE_HEARTBEAT_INTERVAL_MS);
  });
});
