/**
 * The environment schema's own unit test.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE IS COMPULSORY RATHER THAN OPTIONAL
 * ---------------------------------------------------------------------------
 *
 * Two independent reasons, and both are binding.
 *
 * FIRST, THE RUNNER'S PROJECT LIST HAS TO MATCH SOMETHING. The workspace's fast
 * test configuration declares a project rooted at this package whose file globs
 * are `src/**` and `test/**`. A project that resolves to no file is not a
 * failure in the runner's own accounting — it simply vanishes from the output
 * while the exit status stays zero — which is the exact shape of a suite that
 * disappears unnoticed. The configuration guards against it by aborting when any
 * declared project matches nothing, and a passing gate with a stage that ran
 * nothing is not a passing gate.
 *
 * SECOND, `PROJECT_RULE_R3` FORBIDS TREATING ANYTHING AS SATISFIED WITHOUT A
 * PASSING TEST BEHIND IT. `./env.ts` is where that rule's uncertain-value
 * clause is actually discharged: five product values whose evidence is a single
 * frame, a contradiction between two frames, or nothing at all are turned there
 * into named, environment-overridable constants with documented defaults. A
 * default nobody asserts is a value nobody is holding to account, so each of the
 * five is asserted here against the figure its decision record settled.
 *
 * ---------------------------------------------------------------------------
 * SCOPE: THE ENVIRONMENT SCHEMA, AND NOTHING ELSE
 * ---------------------------------------------------------------------------
 *
 * This file covers `./env.ts` only. Its sibling `./constants.ts` holds the
 * compile-time invariants — the channel-name ceiling and its pattern, the
 * arriving channel visibility, the snippet's content-only rule, the
 * password-verifier parameters and the realtime replay bound — and those are
 * asserted by their own co-located test and by their consumers. Nothing is
 * imported from that module here, because no assertion below needs one: this
 * suite's subject is the environment contract, and reaching for an invariant to
 * make a point about a setting would blur the very split the two modules exist to
 * express.
 *
 * ---------------------------------------------------------------------------
 * HOW THE PROJECT RULES ARE CITED
 * ---------------------------------------------------------------------------
 *
 * Rules are cited by requirement label — `PROJECT_RULE_R1` through
 * `PROJECT_RULE_R5` — exactly as the module under test cites them, and never by
 * their own identifiers, because each identifier embeds the third-party product
 * name that `PROJECT_RULE_R4` forbids in source, comments, tests and fixtures.
 * The labels are permuted relative to those identifiers, so the label is the
 * thing to trust and the authoritative wording lives in the rules interface.
 *
 * ---------------------------------------------------------------------------
 * THE RULINGS THAT SHAPED THIS FILE
 * ---------------------------------------------------------------------------
 *
 * `PROJECT_RULE_R4` — THIRD-PARTY IDENTITY EXCLUSION. This is the rule a test
 * file breaks most easily, because a fixture is the one place a name gets typed
 * without being thought about. The prohibition names tests and fixtures
 * explicitly, and it reaches a hostname, a bucket name, a datastore name, a user
 * name, a test title and a comment just as surely as it reaches product copy. So
 * every fixture value below is authored from this product's own vocabulary, on
 * loopback addresses and the local stack's own published ports. The sample entity
 * names legible in the source frames illustrate shape only and appear nowhere
 * here. No colour value appears either.
 *
 * `PROJECT_RULE_R3` — HONEST REPORTING. There is deliberately no acceptance-
 * criterion citation anywhere in this file, and its absence is a decision rather
 * than an omission. The inline citation form is reserved for a test that
 * satisfies one of the numbered area acceptance criteria, and the manifest
 * generator regenerates its traceability table by reading those citations out of
 * the test suite. The environment schema's configurable defaults are not area
 * criteria — they are configurable defaults governed by this rule's
 * uncertain-value clause — so a citation here would mark a criterion satisfied
 * that this file does not satisfy, and would corrupt the manifest in the process.
 * Each suite below instead names the rule it verifies and the decision record
 * that settled the value: `docs/decisions/observed-values.md`.
 *
 * `PROJECT_RULE_R1` — AUTHORIZATION IS SERVER-SIDE ONLY. The rule's prohibition
 * on an authorization decision that configuration can reach is otherwise only a
 * convention. Three suites below make it mechanical: the declared key set is
 * checked against a list of bypass and relaxation shapes, the session-signing
 * secret is proved to be required with no default and no short value, and the
 * loader's failure message is proved to carry variable names and never values.
 *
 * `PROJECT_RULE_R2` — CORPUS AND SPECIFICATION HANDLING. Zero frames were opened
 * to author this file; every citation below was resolved from catalogue prose. No
 * corpus path, no frame filename and no frame count appears. There is also no
 * filesystem access of any kind: nothing is imported from a file-reading module
 * and no temporary environment file is written, because the module under test has
 * no filesystem behaviour to exercise — that is one of its two structural
 * guarantees, and the way to test it is to prove the loader reads only what it is
 * handed.
 *
 * `PROJECT_RULE_R5` — ONE IMPLEMENTATION, REACHED ONE WAY. The module under test
 * is imported by relative path rather than through the package barrel: the barrel
 * re-exports this very module, so importing it from inside the package would be
 * circular as well as a boundary violation. Where a value is the subject of an
 * assertion — the documented thirty days, for instance — it is written as a
 * literal on purpose. A test that imports the number it is asserting agrees with
 * the module by construction and therefore proves nothing.
 *
 * ---------------------------------------------------------------------------
 * HOW EVIDENCE IS CITED
 * ---------------------------------------------------------------------------
 *
 * A frame is cited by NUMBER alone, never by a filename: every filename in the
 * frame corpus embeds the prohibited product name, and renaming the corpus is
 * forbidden as well, so the number is the only citation form both rules admit. A
 * document citation names a file under `docs/workflows/` with its line number.
 *
 * @see docs/decisions/observed-values.md — the evidence behind each of the five
 *      configurable defaults, the reading taken, and the reasoning
 * @see docs/decisions/catalog-defects.md — the recorded contradiction behind the
 *      invite-link lifetime, resolved rather than corrected in place
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { envSchema, loadEnv, type Env } from './env.js';

/**
 * A complete, valid environment — a fresh object on every call.
 *
 * FRESH RATHER THAN SHARED, DELIBERATELY. Several suites below derive an invalid
 * case from this by omitting or overriding a key, and a shared object would let
 * one test's derivation reach another test. Returning a new literal each time
 * makes that impossible rather than merely unlikely.
 *
 * EVERY VALUE IS AUTHORED. The addresses are loopback, the ports are the ones
 * the local development stack publishes, and every name is built from this
 * product's own vocabulary. Nothing here is transcribed from a frame, and no
 * value carries a credential: the datastore and cache locations are deliberately
 * written without a user-and-password part, so this fixture cannot be mistaken
 * for a real connection string in a log or a diff. The one suite that genuinely
 * needs credential-shaped values supplies its own, obviously synthetic ones.
 *
 * The type is the loader's own parameter type rather than anything narrower,
 * which is what lets an invalid case be modelled by deleting a key or writing a
 * malformed string without a cast through `any`.
 */
const validEnv = (): Record<string, string | undefined> => ({
  DATABASE_URL: 'postgresql://127.0.0.1:5432/relay_fixture',
  REDIS_URL: 'redis://127.0.0.1:6379',
  SESSION_SECRET: 'fixture-session-signing-value-000001',
  S3_ENDPOINT: 'http://127.0.0.1:9000',
  S3_BUCKET: 'relay-fixture-uploads',
  S3_ACCESS_KEY_ID: 'relay-fixture-access-key-id',
  S3_SECRET_ACCESS_KEY: 'relay-fixture-secret-access-key',
  SMTP_URL: 'smtp://127.0.0.1:1025',
  PUBLIC_APP_URL: 'http://127.0.0.1:5173',
  PUBLIC_SOCKET_URL: 'ws://127.0.0.1:3001/realtime',
});

/**
 * A valid environment with some keys removed, modelling absence.
 *
 * Absence is what selects a documented default, and for a variable that has none
 * it is what the loader must report. Deleting the key is a truer model of an
 * unset variable than assigning `undefined` would be, because that is what a
 * process environment actually looks like.
 */
const validEnvWithout = (...names: readonly string[]): Record<string, string | undefined> => {
  const source = validEnv();
  for (const name of names) {
    delete source[name];
  }
  return source;
};

/**
 * A valid environment with some values replaced, modelling an explicit setting.
 *
 * Used both for a legitimate override and for a malformed value, since the
 * mechanism is identical and only the value differs.
 */
const validEnvWith = (
  overrides: Record<string, string | undefined>,
): Record<string, string | undefined> => ({
  ...validEnv(),
  ...overrides,
});

/**
 * The message the loader raises for an environment it refuses, as a string.
 *
 * Written as a helper because the same three lines would otherwise be repeated in
 * every failure assertion, and because the catch variable is `unknown` under this
 * repository's compiler settings — narrowing it once here keeps that ceremony out
 * of the suites.
 *
 * A source the loader ACCEPTS is a test-authoring mistake rather than a passing
 * case, so this throws its own error saying so instead of returning something the
 * caller would then assert against.
 */
const rejectionMessage = (source: Record<string, string | undefined>): string => {
  try {
    loadEnv(source);
  } catch (error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  throw new Error(
    'This environment was expected to be refused, but the loader accepted it. The assertion ' +
      'below would have been meaningless, so the fixture is what needs fixing.',
  );
};

/**
 * The names of every variable the schema declares, read from the schema itself.
 *
 * READ FROM THE SCHEMA RATHER THAN RESTATED, which is the whole point: a list
 * typed out here would describe what somebody believed the schema declared, and
 * the suites that iterate it — the closed-set assertion and the forbidden-key
 * guard — exist precisely to catch a variable added without being considered.
 *
 * Frozen because it is read by several suites and mutated by none.
 */
const DECLARED_KEYS: readonly string[] = Object.freeze(Object.keys(envSchema.shape));

/**
 * The ten variables that are required with no default.
 *
 * Grouped by what kind of value each holds, because the three groups fail
 * differently and the loader is expected to say which: a malformed location, an
 * empty name and a short secret are three distinct reports rather than one
 * generic rejection.
 */
const REQUIRED_LOCATIONS: readonly string[] = Object.freeze([
  'DATABASE_URL',
  'REDIS_URL',
  'S3_ENDPOINT',
  'SMTP_URL',
  'PUBLIC_APP_URL',
  'PUBLIC_SOCKET_URL',
]);

const REQUIRED_NAMES: readonly string[] = Object.freeze([
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
]);

const REQUIRED_SECRET = 'SESSION_SECRET';

const ALL_REQUIRED: readonly string[] = Object.freeze([
  ...REQUIRED_LOCATIONS,
  ...REQUIRED_NAMES,
  REQUIRED_SECRET,
]);

/**
 * The five configurable product defaults, with the figure each decision record
 * settled and a distinct explicit value to override it with.
 *
 * The override values are deliberately all different from one another and from
 * every default. A single shared override would let a loader that returned the
 * wrong field pass, because both fields would carry the same number.
 *
 * `satisfies` rather than a type annotation: it checks each `name` against the
 * loaded environment's own key set — so a renamed variable is a compile error
 * here — while keeping the literal types that make the indexed reads below
 * resolve to `number` instead of widening.
 */
const CONFIGURABLE_DEFAULTS = [
  { name: 'INVITE_EXPIRY_DAYS', documented: 30, explicit: '45', parsed: 45 },
  { name: 'EXTERNAL_ACCEPTANCE_WINDOW_DAYS', documented: 14, explicit: '21', parsed: 21 },
  { name: 'GUEST_CHANNEL_LIMIT', documented: 1, explicit: '3', parsed: 3 },
  { name: 'SESSION_IDLE_TIMEOUT_MINUTES', documented: 1440, explicit: '90', parsed: 90 },
  { name: 'SESSION_ABSOLUTE_TIMEOUT_HOURS', documented: 720, explicit: '168', parsed: 168 },
] as const satisfies readonly {
  name: keyof Env;
  documented: number;
  explicit: string;
  parsed: number;
}[];

/**
 * Every duration and every limit in the schema, derived from the list above.
 *
 * DERIVED RATHER THAN RESTATED. A second hand-written list of the same five names
 * would be a second source of truth for which fields are numeric, and the two
 * would drift the first time a sixth was added. Iterating the whole set rather
 * than picking a representative is what stops a later field being declared with
 * laxer parsing than the other five.
 */
const NUMERIC_VARIABLES: readonly string[] = Object.freeze(
  CONFIGURABLE_DEFAULTS.map((entry) => entry.name),
);

// ---------------------------------------------------------------------------
// The five configurable product defaults.
//
// Verifies `PROJECT_RULE_R3`'s uncertain-value clause: each value is a named,
// environment-overridable constant with a documented default, and the mechanism
// it belongs to ships as working functionality rather than being deferred for
// want of certainty. The evidence, the reading taken and the reasoning for every
// figure asserted here are recorded in `docs/decisions/observed-values.md`, and
// the same figures appear in the committed environment template — three views of
// one truth that must move together.
// ---------------------------------------------------------------------------
describe('the five configurable product defaults', () => {
  it('resolves every documented default when only the required variables are set', () => {
    const env = loadEnv(validEnv());

    // Thirty days is the SETTLED CONVENTIONAL ROUND DEFAULT, not a reading. The
    // in-product confirmation raised on copying a workspace invite link states
    // nineteen days (frame 46, `01-onboarding-and-auth.md` L241), while the
    // administration console's invite-links table renders creation and expiry
    // exactly one month apart for the same kind of link (frame 656). The
    // catalogue records the disagreement and declines to reconcile it
    // (`README.md` L401 and its sixth known limitation), warning specifically
    // against a build that adopts the figure one surface happens to render.
    // Nineteen days is what a thirty-day link reads as eleven days into its life,
    // and the corpus is a single session captured once — so nineteen is a
    // remainder. It stands as corroborating evidence and is never the setting.
    expect(env.INVITE_EXPIRY_DAYS).toBe(30);

    // A SEPARATE FACT from the invite-link lifetime, and never to be merged with
    // it. The catalogue models three time-bounded artefacts separately, each with
    // one named authority, and states plainly that conflating them produces a
    // wrong schema (`README.md` L401). This window belongs to the external
    // organization; the lifetime above belongs to the invitation; the third — a
    // guest account's end date — is an absolute calendar date chosen per account
    // and is not an environment variable at all. Fourteen days is adopted
    // unchanged because the confirmation that states it describes a window that
    // has not begun to run (frame 500): nothing is elapsed, so there is no
    // remainder to reconstruct and the round-default substitution does not apply.
    // Identically shaped evidence to the field above, read the other way.
    expect(env.EXTERNAL_ACCEPTANCE_WINDOW_DAYS).toBe(14);

    // A commercial threshold rather than an authorization boundary: whether a
    // given guest may act in a given channel is decided server-side against the
    // acting session and that channel, never by this number. No frame states a
    // figure; frames 49 and 50 evidence only that channel scope is required for a
    // guest and that a separate allowance admits more than one channel. One is
    // the smallest coherent budget consistent with that, because any larger
    // figure would pre-grant what the allowance exists to grant.
    expect(env.GUEST_CHANNEL_LIMIT).toBe(1);

    // Both session bounds are AUTHORED, not observed: the specification states no
    // session lifetime anywhere, and a single authenticated capture cannot show a
    // session ending. They are asserted here in the units the schema declares —
    // minutes for the idle bound, hours for the absolute one — because a bound
    // silently re-expressed in another unit is a bound changed by three orders of
    // magnitude.
    expect(env.SESSION_IDLE_TIMEOUT_MINUTES).toBe(1440);
    expect(env.SESSION_ABSOLUTE_TIMEOUT_HOURS).toBe(720);
  });

  for (const entry of CONFIGURABLE_DEFAULTS) {
    it(`${entry.name} carries its documented default and yields to an explicit value`, () => {
      expect(loadEnv(validEnv())[entry.name]).toBe(entry.documented);

      // The override is what makes the value CONFIGURABLE rather than merely
      // named. A constant that ignored the environment would satisfy the
      // assertion above and fail this one, which is the distinction the rule
      // turns on.
      const overridden = loadEnv(validEnvWith({ [entry.name]: entry.explicit }));
      expect(overridden[entry.name]).toBe(entry.parsed);
      expect(overridden[entry.name]).not.toBe(entry.documented);
    });
  }

  it('leaves the other four defaults alone when one is overridden', () => {
    // A loader that applied an override to the wrong field, or that dropped the
    // remaining defaults once any value was supplied, would pass every assertion
    // above. This is the one that catches it.
    const env = loadEnv(validEnvWith({ INVITE_EXPIRY_DAYS: '45' }));

    expect(env.INVITE_EXPIRY_DAYS).toBe(45);
    expect(env.EXTERNAL_ACCEPTANCE_WINDOW_DAYS).toBe(14);
    expect(env.GUEST_CHANNEL_LIMIT).toBe(1);
    expect(env.SESSION_IDLE_TIMEOUT_MINUTES).toBe(1440);
    expect(env.SESSION_ABSOLUTE_TIMEOUT_HOURS).toBe(720);
  });
});

// ---------------------------------------------------------------------------
// The two technical defaults.
//
// Asserted separately from the five above, and the separation is the point: these
// are object-storage client settings rather than product values read from a
// frame, so they carry no row in `docs/decisions/observed-values.md` and must not
// be counted among the five that rule governs. They still have documented
// defaults in the committed environment template, and a default nobody asserts is
// a default that can drift.
// ---------------------------------------------------------------------------
describe('the two technical defaults', () => {
  it('signs for a conventional region and addresses buckets by path', () => {
    const env = loadEnv(validEnv());

    // An S3-compatible client must sign for some region even where the store it
    // talks to does not partition by region, which is the case locally.
    expect(env.S3_REGION).toBe('us-east-1');

    // Path-style addressing is what the local object store requires.
    expect(env.S3_FORCE_PATH_STYLE).toBe(true);
  });

  it('lets a deployment set both', () => {
    const env = loadEnv(
      validEnvWith({ S3_REGION: 'relay-region-two', S3_FORCE_PATH_STYLE: 'false' }),
    );

    expect(env.S3_REGION).toBe('relay-region-two');
    expect(env.S3_FORCE_PATH_STYLE).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Coercion and type safety.
//
// Every environment value arrives as a string, so a schema that did not convert
// would hand its consumers strings where they expect numbers and booleans, and a
// schema that converted carelessly would accept values nobody meant. Both halves
// are asserted: what must convert, and what must be refused.
// ---------------------------------------------------------------------------
describe('coercion and type safety', () => {
  for (const entry of CONFIGURABLE_DEFAULTS) {
    it(`${entry.name} arrives as a string and leaves as a number`, () => {
      const env = loadEnv(validEnvWith({ [entry.name]: entry.explicit }));

      // The type assertion is not decoration. A consumer that received the string
      // '45' would concatenate where it meant to add, and arithmetic on a
      // stringified duration produces a plausible-looking wrong timestamp rather
      // than an error.
      expect(typeof env[entry.name]).toBe('number');
      expect(env[entry.name]).toBe(entry.parsed);
    });
  }

  it('resolves a default to a number as well, not merely an explicit value', () => {
    const env = loadEnv(validEnv());

    for (const entry of CONFIGURABLE_DEFAULTS) {
      expect(typeof env[entry.name]).toBe('number');
    }
  });

  for (const name of NUMERIC_VARIABLES) {
    it(`${name} rejects a value that is not a number`, () => {
      expect(rejectionMessage(validEnvWith({ [name]: 'not-a-number' }))).toContain(
        `${name} is not a whole number`,
      );
    });

    it(`${name} rejects a fractional value`, () => {
      // A whole number of days or minutes is what every consumer of these values
      // expects; half a day is not a shorter window, it is a value nobody can act
      // on consistently.
      expect(rejectionMessage(validEnvWith({ [name]: '1.5' }))).toContain(
        `${name} is not a whole number`,
      );
    });

    it(`${name} rejects zero`, () => {
      // Zero is not a shorter window — it is the mechanism switched off, which is
      // exactly what `PROJECT_RULE_R3` forbids a deployment from doing to a
      // mechanism the rule requires to be working and enforced.
      expect(rejectionMessage(validEnvWith({ [name]: '0' }))).toContain(
        `${name} must be greater than zero`,
      );
    });

    it(`${name} rejects a negative value`, () => {
      expect(rejectionMessage(validEnvWith({ [name]: '-1' }))).toContain(
        `${name} must be greater than zero`,
      );
    });

    it(`${name} rejects an empty value rather than treating it as absent`, () => {
      // `KEY=` in an environment file is a mistake somebody made. Naming the key
      // is more useful than quietly substituting the documented default and
      // behaving in a way its author did not ask for; absence — the key not being
      // set at all — is what selects the default, and that is asserted above.
      expect(rejectionMessage(validEnvWith({ [name]: '' }))).toContain(name);
    });
  }

  it('reads the written word false as the boolean false', () => {
    // THE SINGLE MOST COMMON ENVIRONMENT-PARSING BUG, and this is the one field it
    // could reach. A truthiness test on the string 'false' yields true, because a
    // non-empty string is truthy — so the obvious cast would pin path-style
    // addressing to on for every deployment that tried to turn it off, and the
    // symptom would be a confusing upload failure rather than a clear error.
    expect(loadEnv(validEnvWith({ S3_FORCE_PATH_STYLE: 'false' })).S3_FORCE_PATH_STYLE).toBe(false);
  });

  it('reads the written word true as the boolean true', () => {
    expect(loadEnv(validEnvWith({ S3_FORCE_PATH_STYLE: 'true' })).S3_FORCE_PATH_STYLE).toBe(true);
  });

  it('refuses a value it cannot read as either boolean rather than guessing', () => {
    // A typo becomes a named failure at boot instead of an addressing mode nobody
    // chose. Guessing here would be the same defect as the truthiness cast, just
    // reached from the other direction.
    expect(rejectionMessage(validEnvWith({ S3_FORCE_PATH_STYLE: 'not-a-boolean' }))).toContain(
      'S3_FORCE_PATH_STYLE is not one of the values this setting accepts',
    );
  });

  for (const name of REQUIRED_LOCATIONS) {
    it(`${name} rejects a value that is not a location at all`, () => {
      expect(rejectionMessage(validEnvWith({ [name]: 'not-a-url' }))).toContain(
        `${name} is not a valid URL`,
      );
    });

    it(`${name} rejects an origin written without a scheme`, () => {
      // This is the case that makes the host requirement earn its keep. The
      // platform's URL parser reads `127.0.0.1:9000` as the scheme `127.0.0.1`
      // with the path `9000` and accepts it, so a check that only asked whether
      // the value parsed would announce itself as location validation while
      // missing the most likely way one of these variables is mistyped.
      expect(rejectionMessage(validEnvWith({ [name]: '127.0.0.1:9000' }))).toContain(
        `${name} is not a valid URL`,
      );
    });
  }

  for (const name of REQUIRED_NAMES) {
    it(`${name} rejects an empty name`, () => {
      // An empty bucket name or an empty key identifier is never meaningful, and
      // it is the shape a half-finished environment file takes.
      expect(rejectionMessage(validEnvWith({ [name]: '' }))).toContain(name);
    });
  }
});

// ---------------------------------------------------------------------------
// Required variables, and the single aggregate failure.
//
// A first run must not be a guessing game. The loader is expected to validate the
// whole environment and report every problem together, because the alternative —
// set one, run again, discover the next — is what makes a clean-machine setup
// feel broken when it is merely unconfigured.
// ---------------------------------------------------------------------------
describe('required variables and the aggregate failure', () => {
  for (const name of ALL_REQUIRED) {
    it(`refuses an environment with ${name} missing`, () => {
      expect(() => loadEnv(validEnvWithout(name))).toThrow();
    });

    it(`names ${name} and says it is not set`, () => {
      // The reason matters as much as the name. 'Something was wrong' sends a
      // reader to the schema; 'is not set' sends them to their own environment.
      expect(rejectionMessage(validEnvWithout(name))).toContain(`${name} is not set`);
    });
  }

  it('reports EVERY missing variable in ONE thrown error', () => {
    // The central assertion of this suite. A loader that stopped at the first
    // problem would satisfy every per-variable assertion above and fail this one,
    // which is precisely the point.
    const message = rejectionMessage(validEnvWithout(...ALL_REQUIRED));

    for (const name of ALL_REQUIRED) {
      expect(message).toContain(name);
    }

    // And the count at the head of the message agrees with the list beneath it, so
    // a reader can tell at a glance whether anything was elided.
    expect(message).toContain(`${String(ALL_REQUIRED.length)} variables`);
  });

  it('reports an entirely unconfigured environment the same way', () => {
    // The realistic first-run case: nothing set at all. Every required variable
    // must appear, and no defaulted or optional one may be reported as a problem,
    // because a default that was announced as missing would send somebody to set a
    // variable they never needed to touch.
    const message = rejectionMessage({});

    for (const name of ALL_REQUIRED) {
      expect(message).toContain(name);
    }

    for (const entry of CONFIGURABLE_DEFAULTS) {
      expect(message).not.toContain(entry.name);
    }

    expect(message).not.toContain('S3_REGION');
    expect(message).not.toContain('S3_FORCE_PATH_STYLE');
    expect(message).not.toContain('COMPOSE_FILE');
    expect(message).not.toContain('COMPOSE_PROJECT_NAME');
  });

  it('states what was wrong with each variable, not merely that something failed', () => {
    // Four different faults at once, each of which must be reported in its own
    // words: absent, below the minimum length, malformed as a location, and not a
    // positive whole number.
    const message = rejectionMessage(
      validEnvWith({
        S3_BUCKET: undefined,
        SESSION_SECRET: 'too-short-to-sign-with',
        S3_ENDPOINT: 'not-a-url',
        GUEST_CHANNEL_LIMIT: '0',
      }),
    );

    expect(message).toContain('S3_BUCKET is not set');
    expect(message).toContain('SESSION_SECRET is shorter than the 32 characters required');
    expect(message).toContain('S3_ENDPOINT is not a valid URL');
    expect(message).toContain('GUEST_CHANNEL_LIMIT must be greater than zero');

    // One report per variable, so the count and the list cannot disagree.
    expect(message).toContain('4 variables');
  });

  it('reports one variable in the singular', () => {
    const message = rejectionMessage(validEnvWithout('SMTP_URL'));

    expect(message).toContain('1 variable');
    expect(message).not.toContain('1 variables');
  });

  it('raises an ordinary Error, with no cause chain to print', () => {
    let raised: unknown;

    try {
      loadEnv({});
    } catch (error: unknown) {
      raised = error;
    }

    expect(raised).toBeInstanceOf(Error);

    // The absence of a cause is a secret-handling decision rather than an
    // oversight. Most log formatters and the runtime's own unhandled-exception
    // reporter print a cause chain by default, so attaching the underlying
    // validation error would quietly widen exactly the surface the authored
    // message narrows — see the suite below.
    expect((raised as Error).cause).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// The two container-tool variables.
//
// Both exist in the committed environment template for the container tool's
// benefit alone: one tells it where the local stack's definition lives so the
// documented command works from the repository root with no argument, the other
// gives the stack a stable project name so a moved or renamed checkout does not
// orphan its data. No application code reads either, so neither may ever become a
// requirement of this schema — and neither may be refused, because a real
// environment on a developer's machine carries both.
// ---------------------------------------------------------------------------
describe('the two container-tool variables', () => {
  it('accepts an environment in which neither is set', () => {
    const env = loadEnv(validEnv());

    expect(env.COMPOSE_FILE).toBeUndefined();
    expect(env.COMPOSE_PROJECT_NAME).toBeUndefined();
  });

  it('accepts an environment in which both are set, and passes them through', () => {
    const env = loadEnv(
      validEnvWith({
        COMPOSE_FILE: 'infra/docker-compose.yml',
        COMPOSE_PROJECT_NAME: 'relay-fixture',
      }),
    );

    expect(env.COMPOSE_FILE).toBe('infra/docker-compose.yml');
    expect(env.COMPOSE_PROJECT_NAME).toBe('relay-fixture');
  });

  it('accepts one without the other', () => {
    // Setting a project name without a definition path, or the reverse, is an
    // ordinary state for a checkout that only needs one of the two.
    expect(loadEnv(validEnvWith({ COMPOSE_PROJECT_NAME: 'relay-fixture' })).COMPOSE_FILE).toBe(
      undefined,
    );
    expect(
      loadEnv(validEnvWith({ COMPOSE_FILE: 'infra/docker-compose.yml' })).COMPOSE_PROJECT_NAME,
    ).toBe(undefined);
  });
});

// ---------------------------------------------------------------------------
// Unknown keys.
//
// A real process environment carries the shell's own variables, the container
// tool's, the package manager's and the continuous-integration provider's —
// hundreds of names this schema knows nothing about. A schema that refused
// unrecognised keys would refuse every real environment it was ever given, so
// leniency here is a correctness requirement rather than a relaxation.
// ---------------------------------------------------------------------------
describe('unknown keys', () => {
  it('accepts a source carrying keys the schema does not declare', () => {
    const env = loadEnv(
      validEnvWith({
        RELAY_FIXTURE_UNRELATED_ONE: 'a value this schema knows nothing about',
        RELAY_FIXTURE_UNRELATED_TWO: '',
      }),
    );

    // The declared values still come back intact, so leniency about extra keys did
    // not cost anything on the keys that matter.
    expect(env.DATABASE_URL).toBe('postgresql://127.0.0.1:5432/relay_fixture');
    expect(env.INVITE_EXPIRY_DAYS).toBe(30);
  });

  it('strips what it does not declare rather than passing it along', () => {
    // Stronger than merely parsing. What comes back is exactly the declared set,
    // which means a consumer cannot accidentally reach an undeclared variable
    // through the parsed object and so cannot become a second reader of the
    // environment by the back door.
    const env = loadEnv(validEnvWith({ RELAY_FIXTURE_UNRELATED_ONE: 'present in the source' }));

    expect(Object.keys(env)).not.toContain('RELAY_FIXTURE_UNRELATED_ONE');
    for (const name of Object.keys(env)) {
      expect(DECLARED_KEYS).toContain(name);
    }
  });
});

// ---------------------------------------------------------------------------
// The loader contract: no side effects, and no ambient reading.
//
// STRUCTURALLY THE MOST IMPORTANT SUITE IN THIS FILE. Two constraints on the
// module under test are architecture rather than style, and both are invisible to
// every other assertion here.
//
// The first is that validation happens when the loader is CALLED and never when
// the module is IMPORTED. This package declares `"sideEffects": false` and its
// barrel re-exports this module to the browser client as well as to the server, so
// a module that read the process environment at load time would break at import in
// a bundle where `process` does not exist — and would contradict that declaration
// besides.
//
// The second is that the loader reads only the source it is handed. Together the
// two lock in the loader-not-singleton and no-filesystem guarantees, which is why
// they are asserted explicitly: an author who later "simplifies" the module into a
// parsed singleton, or teaches it to merge in ambient values, is caught here rather
// than in production.
// ---------------------------------------------------------------------------
describe('the loader contract', () => {
  afterEach(() => {
    // The two tests below are the only place in this file that touches the
    // ambient environment, and this is what keeps that contained. Without it a
    // stubbed value would outlive its test and the suite's result would depend on
    // the order it happened to run in.
    vi.unstubAllEnvs();
  });

  it('imports without throwing, and fails only when called', () => {
    // That this file's own top-level import of the module succeeded is half the
    // proof, and it is proof that runs before any assertion here: were validation
    // performed at load time, an unconfigured environment would have thrown during
    // import and no test in this file would have executed at all. The exports
    // being reachable is what makes that observable.
    expect(typeof loadEnv).toBe('function');
    expect(envSchema).toBeDefined();

    // The other half, stated explicitly so the pairing cannot be read as an
    // accident: the same empty environment that would have broken an import-time
    // singleton is refused the moment the loader is actually called.
    expect(() => loadEnv({})).toThrow();
  });

  it('reads exclusively from its injected source', () => {
    const injected: Record<string, string | undefined> = {
      DATABASE_URL: 'postgresql://127.0.0.1:15432/relay_injected',
      REDIS_URL: 'redis://127.0.0.1:16379',
      SESSION_SECRET: 'injected-session-signing-value-000002',
      S3_ENDPOINT: 'http://127.0.0.1:19000',
      S3_BUCKET: 'relay-injected-uploads',
      S3_ACCESS_KEY_ID: 'relay-injected-access-key-id',
      S3_SECRET_ACCESS_KEY: 'relay-injected-secret-access-key',
      S3_REGION: 'relay-region-injected',
      S3_FORCE_PATH_STYLE: 'false',
      SMTP_URL: 'smtp://127.0.0.1:11025',
      PUBLIC_APP_URL: 'http://127.0.0.1:15173',
      PUBLIC_SOCKET_URL: 'ws://127.0.0.1:13001/realtime',
      INVITE_EXPIRY_DAYS: '31',
      EXTERNAL_ACCEPTANCE_WINDOW_DAYS: '15',
      GUEST_CHANNEL_LIMIT: '2',
      SESSION_IDLE_TIMEOUT_MINUTES: '61',
      SESSION_ABSOLUTE_TIMEOUT_HOURS: '25',
    };

    // Every one of these differs from its counterpart above, so any value that
    // leaked in from the ambient environment would be visible in the comparison
    // rather than hidden behind a coincidence.
    vi.stubEnv('DATABASE_URL', 'postgresql://127.0.0.1:25432/relay_ambient');
    vi.stubEnv('REDIS_URL', 'redis://127.0.0.1:26379');
    vi.stubEnv('SESSION_SECRET', 'ambient-session-signing-value-000003');
    vi.stubEnv('S3_ENDPOINT', 'http://127.0.0.1:29000');
    vi.stubEnv('S3_BUCKET', 'relay-ambient-uploads');
    vi.stubEnv('S3_ACCESS_KEY_ID', 'relay-ambient-access-key-id');
    vi.stubEnv('S3_SECRET_ACCESS_KEY', 'relay-ambient-secret-access-key');
    vi.stubEnv('S3_REGION', 'relay-region-ambient');
    vi.stubEnv('SMTP_URL', 'smtp://127.0.0.1:21025');
    vi.stubEnv('PUBLIC_APP_URL', 'http://127.0.0.1:25173');
    vi.stubEnv('PUBLIC_SOCKET_URL', 'ws://127.0.0.1:23001/realtime');
    vi.stubEnv('INVITE_EXPIRY_DAYS', '99');
    vi.stubEnv('COMPOSE_PROJECT_NAME', 'relay-ambient');

    // The whole object is compared rather than a field or two, because that is what
    // makes the claim exhaustive: nothing was merged in from the ambient process,
    // and nothing was read from a file either — there is no filesystem import in
    // the module under test, and this is the behavioural half of that guarantee.
    expect(loadEnv(injected)).toEqual({
      DATABASE_URL: 'postgresql://127.0.0.1:15432/relay_injected',
      REDIS_URL: 'redis://127.0.0.1:16379',
      SESSION_SECRET: 'injected-session-signing-value-000002',
      S3_ENDPOINT: 'http://127.0.0.1:19000',
      S3_BUCKET: 'relay-injected-uploads',
      S3_ACCESS_KEY_ID: 'relay-injected-access-key-id',
      S3_SECRET_ACCESS_KEY: 'relay-injected-secret-access-key',
      S3_REGION: 'relay-region-injected',
      S3_FORCE_PATH_STYLE: false,
      SMTP_URL: 'smtp://127.0.0.1:11025',
      PUBLIC_APP_URL: 'http://127.0.0.1:15173',
      PUBLIC_SOCKET_URL: 'ws://127.0.0.1:13001/realtime',
      INVITE_EXPIRY_DAYS: 31,
      EXTERNAL_ACCEPTANCE_WINDOW_DAYS: 15,
      GUEST_CHANNEL_LIMIT: 2,
      SESSION_IDLE_TIMEOUT_MINUTES: 61,
      SESSION_ABSOLUTE_TIMEOUT_HOURS: 25,
    });
  });

  it('falls back to the process environment when called with no argument', () => {
    // The default parameter is evaluated at CALL time, which is what keeps the
    // module importable in a browser bundle: `process` is named inside a function
    // body and so is only ever touched by a caller that actually calls this.
    for (const [name, value] of Object.entries(validEnv())) {
      if (value !== undefined) {
        vi.stubEnv(name, value);
      }
    }

    const env = loadEnv();

    expect(env.DATABASE_URL).toBe('postgresql://127.0.0.1:5432/relay_fixture');
    expect(env.S3_BUCKET).toBe('relay-fixture-uploads');

    // Documented defaults resolve on this path exactly as they do on the injected
    // one, so the fallback is the same loader and not a second, laxer route.
    expect(env.INVITE_EXPIRY_DAYS).toBe(30);
    expect(env.SESSION_ABSOLUTE_TIMEOUT_HOURS).toBe(720);
  });

  it('returns a frozen object', () => {
    const env = loadEnv(validEnv());

    expect(Object.isFrozen(env)).toBe(true);

    // Configuration is settled at boot and read thereafter. A consumer that could
    // reassign a field would be a second source of truth for a documented default,
    // so the attempt is made to fail rather than to succeed silently.
    expect(() => Object.assign(env, { INVITE_EXPIRY_DAYS: 99 })).toThrow(TypeError);
    expect(env.INVITE_EXPIRY_DAYS).toBe(30);
  });

  it('returns an independent object on each call', () => {
    // Freezing one shared object would satisfy the assertion above while making
    // every caller share a single instance, which is the singleton this design
    // rejects. Two calls must produce two objects.
    const first = loadEnv(validEnv());
    const second = loadEnv(validEnvWith({ INVITE_EXPIRY_DAYS: '45' }));

    expect(first).not.toBe(second);
    expect(first.INVITE_EXPIRY_DAYS).toBe(30);
    expect(second.INVITE_EXPIRY_DAYS).toBe(45);
  });
});

/**
 * The shapes of variable name that must never appear in this schema.
 *
 * `PROJECT_RULE_R1` puts every authorization decision on the server, at the point
 * of execution, against the acting session and the specific target object, and
 * forbids resting one on a caller-supplied workspace or actor identifier. A
 * configured identifier is a supplied one, and an escape hatch reachable by
 * configuration is a rule that configuration can switch off — so the prohibition
 * reaches the environment contract directly. Without this list that prohibition
 * would be a review comment; with it, the first commit that adds such a variable
 * fails the suite.
 *
 * Two categories, and both matter. A SWITCH would relax or bypass a check. An
 * INPUT would feed one: a role, a capability, a workspace or a default tenant. The
 * deployment-mode variable is included because behaviour that varied by mode would
 * be permission decided by configuration under another name — this schema declares
 * values, never permissions.
 *
 * Written as data so that adding a shape is one line here rather than a new test.
 * None of the patterns is global: a global pattern keeps a mutable index between
 * calls, and a shared one would give different answers to the same question
 * depending on what was asked before it.
 */
const FORBIDDEN_KEY_PATTERNS: readonly { readonly shape: string; readonly pattern: RegExp }[] =
  Object.freeze([
    { shape: 'an outright authorization switch', pattern: /AUTH_DISABLED/ },
    { shape: 'a skip flag', pattern: /^SKIP_/ },
    { shape: 'a bypass flag', pattern: /^BYPASS/ },
    { shape: 'a disable flag', pattern: /^DISABLE_/ },
    { shape: 'a cross-workspace allowance', pattern: /ALLOW_CROSS_WORKSPACE/ },
    { shape: 'a default tenant', pattern: /^DEFAULT_WORKSPACE_ID$/ },
    { shape: 'a deployment-mode switch', pattern: /^NODE_ENV$/ },
    { shape: 'a role or capability input', pattern: /ROLE/ },
    { shape: 'a workspace identifier', pattern: /WORKSPACE_ID/ },
  ]);

/**
 * Every variable this suite covers, assembled from the lists the suites above use.
 *
 * ASSEMBLED RATHER THAN TRANSCRIBED, and the distinction is what gives the
 * closed-set assertion below its value. This is not a second copy of the schema
 * against which the schema is compared — it is the set of variables that actually
 * have assertions behind them in this file. Comparing the two therefore proves
 * COVERAGE: a variable added to the schema without being added to a suite here
 * fails the assertion, which is exactly the moment somebody should be asked
 * whether the new variable is a value or a permission.
 */
const COVERED_KEYS: readonly string[] = Object.freeze([
  ...ALL_REQUIRED,
  ...NUMERIC_VARIABLES,
  'S3_REGION',
  'S3_FORCE_PATH_STYLE',
  'COMPOSE_FILE',
  'COMPOSE_PROJECT_NAME',
]);

// ---------------------------------------------------------------------------
// What the schema may never declare, and what it may never disclose.
//
// Verifies `PROJECT_RULE_R1`. Nothing in this suite is about a value being right;
// all of it is about configuration being unable to participate in an authorization
// decision, and about a configuration failure being unable to put a credential in
// a log.
// ---------------------------------------------------------------------------
describe('what the schema may never declare', () => {
  for (const { shape, pattern } of FORBIDDEN_KEY_PATTERNS) {
    it(`declares nothing resembling ${shape}`, () => {
      // The offenders are collected and compared as a list rather than counted, so
      // a failure names the variable that broke the rule instead of reporting that
      // some number of variables did.
      expect(DECLARED_KEYS.filter((key) => pattern.test(key))).toEqual([]);
    });
  }

  it('declares exactly the variables this suite covers', () => {
    // Sorted copies, because declaration order is the schema's own business and
    // reordering a field is not a defect. Copies rather than in-place sorts, so the
    // frozen lists other suites read are left as they are.
    expect([...DECLARED_KEYS].sort()).toEqual([...COVERED_KEYS].sort());
  });

  it('requires the session-signing secret with no default and no fallback', () => {
    // Of the whole schema this is the field where that matters most. A session is a
    // server-side revocable record referenced by an HTTP-only cookie, and that
    // cookie is the acting identity every authorization decision is evaluated
    // against — so a defaulted signing secret would not be a weak configuration,
    // it would be a published one, letting anybody who has read this repository
    // mint a cookie for any account.
    expect(() => loadEnv(validEnvWithout(REQUIRED_SECRET))).toThrow();
    expect(rejectionMessage(validEnvWithout(REQUIRED_SECRET))).toContain(
      `${REQUIRED_SECRET} is not set`,
    );
  });

  it('rejects a session-signing secret below the required length', () => {
    // A short secret is a guessable one, and a guessable secret authenticating the
    // acting session is a forgeable identity rather than a weak setting. The
    // message states the bound it enforces, which is what makes the failure
    // actionable — and the bound is a published schema constant, never an input.
    const message = rejectionMessage(validEnvWith({ [REQUIRED_SECRET]: 'far-too-short' }));

    expect(message).toContain(`${REQUIRED_SECRET} is shorter than the 32 characters required`);
  });

  it('accepts a session-signing secret at exactly the required length', () => {
    // The boundary in the other direction, so the bound is proved to be inclusive
    // rather than merely present. A floor enforced one character too high would
    // reject a value the template documents as acceptable.
    const atTheFloor = 'relay-fixture-min-length-secret1';

    // Asserted rather than assumed: a fixture that had drifted to thirty-three
    // characters would make this test pass while proving nothing about the bound.
    expect(atTheFloor).toHaveLength(32);
    expect(loadEnv(validEnvWith({ [REQUIRED_SECRET]: atTheFloor }))[REQUIRED_SECRET]).toBe(
      atTheFloor,
    );
  });

  it('names the offending variables in a failure and discloses no value', () => {
    // The sentinels are deliberately conspicuous and entirely synthetic — nothing
    // here could be mistaken for a real credential in a diff. Each is supplied as a
    // VALID value so that none of them is itself the cause of the failure: the
    // failure is provoked by an unrelated missing variable, which is the case that
    // matters, because a credential must not surface in a report about something
    // else. Two are carried inside a connection string rather than standing alone,
    // since that is the shape a datastore and a cache credential actually take.
    const sessionSentinel = 'sentinel-session-secret-never-logged';
    const objectStoreSentinel = 'sentinel-object-store-secret-never-logged';
    const datastoreSentinel = 'sentinel-datastore-password-never-logged';
    const cacheSentinel = 'sentinel-cache-password-never-logged';

    const message = rejectionMessage(
      validEnvWith({
        SESSION_SECRET: sessionSentinel,
        S3_SECRET_ACCESS_KEY: objectStoreSentinel,
        DATABASE_URL: `postgresql://relay_fx:${datastoreSentinel}@127.0.0.1:5432/relay_fx`,
        REDIS_URL: `redis://relay_fx:${cacheSentinel}@127.0.0.1:6379`,
        S3_BUCKET: undefined,
      }),
    );

    // Reported by NAME, which is all a log is entitled to and all a reader needs in
    // order to fix the problem.
    expect(message).toContain('S3_BUCKET is not set');
    expect(message).toContain('No values are shown above');

    // Each sentinel is named once, in the fixture, and checked from that same
    // binding — so a renamed sentinel cannot leave an assertion silently checking a
    // string the fixture no longer supplies.
    for (const sentinel of [
      sessionSentinel,
      objectStoreSentinel,
      datastoreSentinel,
      cacheSentinel,
    ]) {
      expect(message).not.toContain(sentinel);
    }
  });

  it('discloses no value even when the credential itself is what was rejected', () => {
    // The harder case, and the one a naive implementation gets wrong: the offending
    // value is the credential, so any message that quoted what it received would
    // print it. Composing the sentence from the issue's code alone is what makes
    // that impossible rather than merely unlikely — there is no code path along
    // which the value could reach the text.
    // Short enough to be refused, which is asserted rather than assumed: a sentinel
    // that had grown past the floor would be ACCEPTED, and a test that never reaches
    // a failure message cannot prove anything about what one contains.
    const rejected = 'sentinel-secret-too-short';

    expect(rejected.length).toBeLessThan(32);

    const message = rejectionMessage(validEnvWith({ SESSION_SECRET: rejected }));

    expect(message).toContain('SESSION_SECRET is shorter than the 32 characters required');
    expect(message).not.toContain(rejected);
    expect(message).not.toContain('sentinel');
  });

  it('discloses no malformed location value either', () => {
    // A connection string is a credential carrier as much as a secret is: the value
    // that failed to parse may well have been a real one with a typo in the host.
    const malformed = 'sentinel-malformed-datastore-location-must-never-be-logged';

    const message = rejectionMessage(validEnvWith({ DATABASE_URL: malformed }));

    expect(message).toContain('DATABASE_URL is not a valid URL');
    expect(message).not.toContain(malformed);
  });
});
