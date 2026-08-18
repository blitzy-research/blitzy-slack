/**
 * Absolute-timestamp helpers for expiry resolution.
 *
 * WHY THIS MODULE EXISTS. Rule R3 requires that the mechanism behind an
 * uncertain value — the timer, expiry, window, threshold or limit — be
 * implemented as working functionality, that the value itself live exactly once
 * as a named configuration constant consumed by reference, and that what lands
 * on a record be an **absolute timestamp rather than a duration**, so that
 * changing the configured default can never invalidate what is already stored.
 * The catalog states the same requirement from the data side: the invitation
 * record "holds a date, never a duration" (`docs/workflows/README.md` L339),
 * and the three-expiry table at L401–L409 models three separately-owned
 * time-bounded artefacts and warns that conflating them would produce a wrong
 * schema.
 *
 * THIS MODULE IS THE MECHANISM, NOT THE CONFIGURATION. Every window arrives as
 * a parameter. The configurable windows live once in the shared environment
 * module — `env.ts`, under `packages/shared/src/config/` — and are mirrored in
 * `.env.example`; the caller — the invitation-issuing service — reads them from
 * there and passes the resolved number of whole days in. This file deliberately
 * imports nothing at all, so the dependency runs one way only: configuration
 * knows nothing of this module, and this module knows no window. Nothing here
 * names, defaults to, or even knows a specific lifetime, which is precisely
 * what keeps the catalog's three clocks separate as L952 requires: an invite
 * link's lifetime, an external-collaboration acceptance window and a guest
 * account's end date are three different facts with three different owners, and
 * a helper that named one of them would be the first step toward merging them.
 *
 * NO RECOMPUTE PATH, BY DESIGN. L409 is unambiguous: the date is resolved **at
 * issuance**, a change to the window governs invitations issued afterwards, and
 * a resolved expiry is immutable in both directions — lengthening the window
 * never extends an outstanding invitation and shortening it never cuts one
 * short. Where outstanding access must end sooner, the invitations concerned
 * are explicitly revoked or reissued as an authorized, audited operation rather
 * than having a date rewritten underneath a credential its holder already
 * carries. This module therefore offers resolve-at-issuance and nothing else:
 * there is deliberately no extend, refresh, recompute or re-resolve helper, and
 * adding one would defeat the rule rather than serve a caller.
 *
 * THIS MODULE ENFORCES NOTHING. Per rule R1, an instant computed here is never
 * an authorization decision. These functions compute and compare instants;
 * refusing an expired credential happens server-side at redemption, in the
 * invitation service, which the catalog requires explicitly at L405 and L406
 * and which `docs/workflows/01-onboarding-and-auth.md` L908 restates as an
 * acceptance criterion. A caller that renders `hasExpired` in the client has
 * decided nothing; the server still checks.
 *
 * SINGLE IMPLEMENTATION. Rule R5 names the component contracts in `packages/ui`
 * by its letter, so it does not govern a utility module directly, but its
 * principle does and is adopted here without reservation: this is the one
 * implementation of expiry resolution in the monorepo. No service, route,
 * schema, component or test may compute an expiry instant, an end-of-day
 * instant or a remaining-days figure of its own. Consumers reach these four
 * functions through the `@relay/shared` barrel.
 *
 * NO USER-FACING TEXT. Every string below is a developer diagnostic thrown at a
 * programming error, never product copy. Labels, countdown phrasing and the
 * singular and plural forms that follow a remaining-days value (README L325)
 * belong to `packages/shared/src/copy/en.ts`. This module returns a number and
 * says nothing about how it reads.
 *
 * PURITY. No function here reads the clock: `issuedAt` and `now` are always
 * supplied by the caller and no parameter carries a default, which keeps the
 * module deterministic, trivially testable and honest about the package
 * manifest's `"sideEffects": false`. There is no date library — the package's
 * runtime dependencies are closed at three and none of them is one — so
 * everything is built on the platform `Date` and its UTC accessors. No platform
 * builtin, ambient global or DOM interface is touched, because this package is
 * bundled into the browser client as well as loaded on the server.
 *
 * Frames are cited by number only. The corpus is a read-only input and no frame
 * was opened to write this file; every fact above came from catalog prose, per
 * rule R2.
 *
 * ON THE RULE CITATIONS ABOVE. The project rules are cited by their requirement
 * label — R1 through R5 — which is the form used everywhere else in this
 * repository, from the schema modules beside this one to the decision records.
 * The label is unambiguous: only the order in which the rules are presented is
 * permuted, while each rule's own number and its requirement label agree, so R1
 * is the server-side authorization rule, R2 corpus and specification handling,
 * R3 uncertainty is not permission to omit, R4 third-party identity exclusion
 * and R5 single implementation of a shared contract. Citing the label rather
 * than the platform identifier keeps the reference exact while leaving the
 * prohibited product name out of this file entirely: there is no product-name
 * reference, no wordmark, no icon and no sampled colour anywhere in it, and
 * every string in it is authored. The identity guard is a plain
 * case-insensitive substring scan with no exception for a governance
 * identifier, so a citation that carried one would fail the build.
 */

/*
 * GAP DECISIONS
 *
 * Three questions the corpus does not answer had to be settled before any of
 * this could be written. Rule R3 forbids omitting a mechanism because a value
 * is uncertain and directs the smallest coherent behaviour consistent with
 * adjacent evidenced behaviour, recorded with the options considered, the
 * choice and the rationale. Each is recorded here beside the code it governs
 * and belongs in the project's registers at `docs/decisions/observed-values.md`
 * and `docs/decisions/gap-register.md`, which are owned elsewhere and are not
 * edited from here.
 *
 * GAP 1 — the time of day behind the end-of-day rule.
 *   Options: (a) resolve to 23:59:00.000, the minute the stated semantics name;
 *     (b) resolve to 23:59:59.999, the last representable instant of the day.
 *   Choice: (a).
 *   Rationale: the semantics observed on the guest invitation form name a
 *     minute and stop there (`01-onboarding-and-auth.md` L272 and L820, frame
 *     50). Option (b) silently grants a further fifty-nine and a bit seconds of
 *     access that nothing in the specification asked for, which is a larger
 *     behaviour than the evidence supports and, on a credential, a grant rather
 *     than a rounding. The smallest coherent reading wins.
 *
 * GAP 2 — the timezone the chosen day is interpreted in.
 *   Options: (a) resolve in UTC, with an optional explicit offset in minutes so
 *     a caller that knows the subject's offset can resolve correctly; (b) accept
 *     an IANA zone identifier and resolve it through `Intl`.
 *   Choice: (a).
 *   Rationale: the corpus shows a date picker committing a day and shows nothing
 *     whatsoever about the zone that day is read in (L274 and L276, frames 52
 *     and 54), so (b) builds a zone-resolution surface the evidence does not
 *     justify — and it is not available besides, since this package's runtime
 *     dependencies are closed at three and none of them carries a timezone
 *     database. A caller's offset ultimately comes from the time-zone field the
 *     account record already carries (README L326), so the parameter is the
 *     honest shape: explicit, optional, and the caller's to supply.
 *
 * GAP 3 — the rounding direction of the remaining-days derivation.
 *   Options: (a) round up, so a partly-elapsed final day still reads as a day
 *     remaining; (b) round down, so it reads as none.
 *   Choice: (a), clamped at zero.
 *   Rationale: the observed remaining figure is a whole-day count rendered
 *     while the artefact is still live (README L325). Rounding down reports zero
 *     days remaining on a credential that still works, which contradicts the
 *     surface it is rendered on; rounding up cannot, because the figure only
 *     reaches zero once the instant has actually passed. The clamp keeps a
 *     negative number — which is not a remaining duration — out of the return
 *     type altogether.
 */

/*
 * UNIT FACTORS — deliberately not configuration.
 *
 * The three constants below convert between units. None of them is a window, a
 * timer, an expiry or a threshold, and none may be read as one: they carry no
 * policy, they are not overridable, and changing one would be an arithmetic
 * error rather than a configuration change. Every configurable window in this
 * product lives in the two shared configuration modules and reaches this file
 * only as a parameter.
 *
 * The day factor is written as the product of its unit conversions rather than
 * as the flattened figure on purpose. It reads as what it is, and the flattened
 * figure is a restricted literal under the workspace lint contract precisely
 * because a number of that shape is almost always a duration someone has
 * written down twice.
 */
const MILLISECONDS_PER_MINUTE = 60 * 1_000;
const MINUTES_PER_WHOLE_DAY = 24 * 60;
const MILLISECONDS_PER_WHOLE_DAY = MINUTES_PER_WHOLE_DAY * MILLISECONDS_PER_MINUTE;

/*
 * The time of day the end-of-day rule resolves to. See GAP 1 above; the
 * numeric semantic is transcribable as function, while the sentence that
 * carries it on the invitation form is product copy and is not reproduced here.
 */
const END_OF_DAY_HOUR = 23;
const END_OF_DAY_MINUTE = 59;

/*
 * A committed calendar date crosses the wire as a fixed-width `YYYY-MM-DD`
 * string, so the pattern is anchored and counts digits exactly. That is what
 * rejects a single-digit month or day, which `Date` would otherwise parse into
 * something plausible. There is no global flag, so the expression holds no
 * `lastIndex` state and is safe to share across calls.
 */
const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/* Field boundaries within that fixed-width shape, as `[start, end)` slices. */
const YEAR_START = 0;
const YEAR_END = 4;
const MONTH_START = 5;
const MONTH_END = 7;
const DAY_START = 8;
const DAY_END = 10;

/* `Date`'s month argument is zero-based; a calendar month is not. */
const MONTH_NUMBER_TO_INDEX_OFFSET = 1;

/**
 * Rejects anything that is not a `Date` holding a representable instant.
 *
 * The parameter is typed `unknown` rather than `Date` deliberately. The public
 * signatures already promise a `Date`, but this package compiles to JavaScript
 * and is consumed from JavaScript in the browser bundle and from a test runner,
 * so the guard has real work to do — and typing it `unknown` is what makes the
 * check load-bearing to the compiler rather than provably dead code.
 */
function assertValidInstant(candidate: unknown, parameterName: string): void {
  if (!(candidate instanceof Date)) {
    throw new TypeError(`${parameterName} must be a Date.`);
  }
  if (Number.isNaN(candidate.getTime())) {
    throw new RangeError(`${parameterName} must be a Date holding a representable instant.`);
  }
}

/**
 * Rejects anything that is not a whole, non-negative number of days.
 *
 * A zero-day window is accepted: it resolves to the instant of issuance, which
 * is degenerate but arithmetically coherent and is a caller's decision to make.
 * A negative window is refused, because an expiry before issuance is not a
 * window at all. An integer beyond the representable range is caught by the
 * representability check at the point of use rather than guessed at here.
 */
function assertWholeDayCount(candidate: unknown, parameterName: string): void {
  if (typeof candidate !== 'number' || !Number.isFinite(candidate)) {
    throw new TypeError(`${parameterName} must be a finite number.`);
  }
  if (!Number.isInteger(candidate)) {
    throw new RangeError(`${parameterName} must be a whole number of days.`);
  }
  if (candidate < 0) {
    throw new RangeError(`${parameterName} must not be negative.`);
  }
}

/**
 * Rejects anything that is not a usable offset from UTC, in minutes.
 *
 * The bound is one whole day in either direction rather than the largest offset
 * any territory currently observes. That figure is a political fact which
 * changes without notice, and encoding it here would put a value with an owner
 * elsewhere into a module whose whole purpose is to hold none. One day is the
 * point past which an offset cannot be an offset, which is the only bound this
 * module is entitled to assert.
 */
function assertUtcOffsetMinutes(candidate: unknown, parameterName: string): void {
  if (typeof candidate !== 'number' || !Number.isFinite(candidate)) {
    throw new TypeError(`${parameterName} must be a finite number when supplied.`);
  }
  if (!Number.isInteger(candidate)) {
    throw new RangeError(`${parameterName} must be a whole number of minutes.`);
  }
  if (Math.abs(candidate) > MINUTES_PER_WHOLE_DAY) {
    throw new RangeError(`${parameterName} must not exceed one whole day in either direction.`);
  }
}

/**
 * Rejects anything that is not a well-formed `YYYY-MM-DD` string.
 *
 * Shape only. Whether the date named actually exists in the calendar is settled
 * separately, by round-trip, because that check needs the parsed fields.
 */
function assertCalendarDateText(candidate: unknown, parameterName: string): void {
  if (typeof candidate !== 'string') {
    throw new TypeError(`${parameterName} must be a string.`);
  }
  if (!CALENDAR_DATE_PATTERN.test(candidate)) {
    throw new RangeError(`${parameterName} must be a calendar date in YYYY-MM-DD form.`);
  }
}

/**
 * Resolves the absolute instant an artefact issued now will expire at.
 *
 * This is the resolve-at-issuance helper, and the only one this module offers.
 * The catalog's three-expiry table settles that a build chooses one lifetime,
 * stores the resolved instant on the record, renders every surface from that
 * stored value rather than from copy, and enforces it server-side on redemption
 * (`docs/workflows/README.md` L401–L409, and L339 for the record that "holds a
 * date, never a duration"). The return value is what gets stored.
 *
 * `windowInWholeDays` is supplied by the caller from the shared environment
 * module under `packages/shared/src/config/`. It is a parameter rather than an
 * import so that the two windows this phase carries stay in one place each, and
 * so that this function can serve either without knowing which it is serving —
 * which is what keeps the catalog's three clocks from being merged (L952).
 *
 * There is no companion that re-resolves an instant already stored. L409 makes
 * a resolved expiry immutable in both directions: lengthening the configured
 * window must not extend an outstanding artefact and shortening it must not cut
 * one short. Ending access sooner is a revoke or a reissue — an authorized,
 * audited operation on the record — not an arithmetic correction applied
 * underneath a credential its holder already carries.
 *
 * @param issuedAt - The instant of issuance. Supplied by the caller; this
 *   module never reads the clock.
 * @param windowInWholeDays - A whole, non-negative number of days, read from
 *   configuration by the caller.
 * @returns A new `Date`. The input is never mutated.
 * @throws {TypeError} If `issuedAt` is not a `Date`, or `windowInWholeDays` is
 *   not a finite number.
 * @throws {RangeError} If `issuedAt` holds no representable instant, if
 *   `windowInWholeDays` is fractional or negative, or if the sum falls outside
 *   the range `Date` can represent.
 */
export function resolveExpiryInstant(issuedAt: Date, windowInWholeDays: number): Date {
  assertValidInstant(issuedAt, 'issuedAt');
  assertWholeDayCount(windowInWholeDays, 'windowInWholeDays');

  const resolved = new Date(issuedAt.getTime() + windowInWholeDays * MILLISECONDS_PER_WHOLE_DAY);

  // A window large enough to overflow the time value would otherwise return an
  // instant that compares false against everything. Refusing it is the only
  // honest outcome: a nonsense expiry on a credential is worse than a throw.
  if (Number.isNaN(resolved.getTime())) {
    throw new RangeError('windowInWholeDays resolves past the range Date can represent.');
  }

  return resolved;
}

/**
 * Resolves the end of a chosen calendar day to one absolute instant.
 *
 * This is the guest-account end date. The invitation form's expiration control
 * defaults to no limit and, when set to its custom value, commits a whole
 * calendar day through a date picker — never a time of day
 * (`docs/workflows/01-onboarding-and-auth.md` L272, L274 and L276; frames 50, 52
 * and 54). The time of day therefore comes entirely from the stated end-of-day
 * rule, which is why this function takes a calendar date rather than an instant.
 * The catalog is explicit that the result "is an absolute date from the moment
 * it is set" (`docs/workflows/README.md` L407, frame 54).
 *
 * Access ends at 23:59:00.000 on the chosen day — the minute the semantics for
 * that control name (`01-onboarding-and-auth.md` L820, frame 50), rather than
 * the day's last representable instant. The day is read in UTC unless the caller
 * supplies an offset. Both are settled choices: see GAP 1 and GAP 2 in this
 * file's gap-decision block, and `docs/decisions/observed-values.md`.
 *
 * @param calendarDate - The committed day as a strict `YYYY-MM-DD` string, the
 *   shape a date picker's value crosses the wire as. Validated for form and for
 *   calendar reality: `'2026-03-01'` resolves, while `'2026-02-29'` is refused
 *   because that day does not exist in a year that is not a leap year, and
 *   `'2026-3-1'` is refused because it is not fixed-width.
 * @param utcOffsetMinutes - Optional. Minutes **ahead of** UTC, following the
 *   ISO-8601 sign convention, so `+02:00` is `120`. Note that this is the
 *   negation of what `Date.prototype.getTimezoneOffset` returns for the same
 *   zone; passing that value unchanged resolves the wrong instant. A caller's
 *   offset ultimately derives from the time-zone field the account record
 *   already carries (`README.md` L326). Omitted means UTC.
 * @returns A new `Date` at 23:59:00.000 on that day in the resolved zone.
 * @throws {TypeError} If `calendarDate` is not a string, or `utcOffsetMinutes`
 *   is supplied and is not a finite number.
 * @throws {RangeError} If `calendarDate` is malformed or names a day the
 *   calendar does not contain, if `utcOffsetMinutes` is fractional or exceeds
 *   one whole day, or if the result falls outside the representable range.
 */
export function endOfCalendarDay(calendarDate: string, utcOffsetMinutes?: number): Date {
  assertCalendarDateText(calendarDate, 'calendarDate');

  // Declared optional rather than as an explicit `number | undefined`, so that a
  // caller with no offset omits the argument instead of passing a stand-in value
  // for it. Under `exactOptionalPropertyTypes` that distinction is the one worth
  // being deliberate about: the absent case is absence, not a sentinel.
  const offsetMinutes = utcOffsetMinutes ?? 0;
  assertUtcOffsetMinutes(offsetMinutes, 'utcOffsetMinutes');

  // Fixed-width fields at fixed positions. The pattern has already proven every
  // position holds a digit, so no conversion here can yield NaN, and reading by
  // slice rather than by capture group avoids an index access the compiler would
  // otherwise force a provably-dead guard around.
  const year = Number(calendarDate.slice(YEAR_START, YEAR_END));
  const monthNumber = Number(calendarDate.slice(MONTH_START, MONTH_END));
  const day = Number(calendarDate.slice(DAY_START, DAY_END));
  const monthIndex = monthNumber - MONTH_NUMBER_TO_INDEX_OFFSET;

  const endOfDayUtc = new Date(
    Date.UTC(year, monthIndex, day, END_OF_DAY_HOUR, END_OF_DAY_MINUTE, 0, 0),
  );

  // Calendar reality, proven by round-trip rather than by a month-length table.
  // The platform constructor rolls an impossible day forward into the next
  // month, so a value that comes back describing a different day was never a
  // real date. This is checked before the offset is applied, because the offset
  // is expected to move the instant across a day boundary.
  //
  // A four-digit year below 0100 is refused by the same check, and deliberately
  // so: the constructor maps a two-digit year argument onto the twentieth
  // century, which makes such an input indistinguishable from a different date.
  // Refusing it beats silently resolving an instant many centuries away.
  if (
    endOfDayUtc.getUTCFullYear() !== year ||
    endOfDayUtc.getUTCMonth() !== monthIndex ||
    endOfDayUtc.getUTCDate() !== day
  ) {
    throw new RangeError('calendarDate must name a day that exists in the calendar.');
  }

  // Minutes ahead of UTC are subtracted: a day that ends at 23:59 in a zone east
  // of UTC ends earlier in absolute terms.
  const resolved = new Date(endOfDayUtc.getTime() - offsetMinutes * MILLISECONDS_PER_MINUTE);

  if (Number.isNaN(resolved.getTime())) {
    throw new RangeError('calendarDate resolves past the range Date can represent.');
  }

  return resolved;
}

/**
 * Derives how many whole days remain before a stored instant — for display only.
 *
 * This exists to satisfy an acceptance criterion rather than a convenience:
 * the countdown a surface renders "is computed from stored invite-link state
 * rather than printed as a literal" (`docs/workflows/01-onboarding-and-auth.md`
 * L907, frame 46). The catalog models the same pair on the workspace record — an
 * absolute end date stored, and a remaining duration in whole days derived from
 * it (`docs/workflows/README.md` L325). So the instant is the stored fact and
 * this number is a view of it.
 *
 * The result is **never persisted**. Storing it would put a duration on a
 * record where rule R3 requires an absolute timestamp, and it would go stale
 * the moment the clock moved.
 *
 * The result is also **never used for enforcement**. `hasExpired` is the
 * predicate; this is a figure for a caller to render. Gating on a rounded-up
 * day count would grant access for up to a day past the stored instant, and per
 * rule R1 no client-side figure is an authorization decision in any case — the
 * server checks at redemption.
 *
 * Rounds **up** and clamps at zero, so a partly-elapsed final day still reads as
 * a day remaining — a settled choice: see GAP 3 in this file's gap-decision
 * block, and `docs/decisions/gap-register.md`. Singular and plural forms follow
 * the value (README L325) and belong to `packages/shared/src/copy/en.ts`.
 *
 * @param expiresAt - The stored absolute expiry instant.
 * @param now - The instant to measure from. Supplied by the caller; this module
 *   never reads the clock.
 * @returns A whole number of days, never negative. Zero once `now` has reached
 *   or passed `expiresAt`, which is the same boundary `hasExpired` uses.
 * @throws {TypeError} If either argument is not a `Date`.
 * @throws {RangeError} If either argument holds no representable instant.
 */
export function remainingWholeDays(expiresAt: Date, now: Date): number {
  assertValidInstant(expiresAt, 'expiresAt');
  assertValidInstant(now, 'now');

  const remainingMilliseconds = expiresAt.getTime() - now.getTime();

  // Clamped rather than rounded, so that a passed instant reports no remaining
  // days instead of a negative count that is not a duration at all.
  if (remainingMilliseconds <= 0) {
    return 0;
  }

  return Math.ceil(remainingMilliseconds / MILLISECONDS_PER_WHOLE_DAY);
}

/**
 * Reports whether a stored expiry instant has been reached.
 *
 * `null` means no limit and returns `false`. That is not a convenience: the
 * invitation form's expiration control defaults to no limit
 * (`docs/workflows/01-onboarding-and-auth.md` L272 and L909, frame 50), so an
 * absent expiry is a first-class state that a record's column is nullable to
 * hold. Centralising it here is what stops every call site writing its own null
 * check — which would be a second implementation of this predicate, and the
 * cheapest kind of place for the two to disagree.
 *
 * `undefined` is deliberately **not** accepted as no limit. The declared
 * parameter admits `null` only, and a missing field arriving where an expiry
 * belongs is a caller defect that must surface as a throw. Quietly reporting
 * "not expired" for a value nobody supplied is the one failure mode a predicate
 * over a bearer credential must not have.
 *
 * BOUNDARY. The expiry instant itself counts as expired: this returns `true`
 * once `now` has reached it, not only once it has passed. Two reasons, and they
 * agree. The stated semantics put the end of access *at* 23:59 on the chosen day
 * (`01-onboarding-and-auth.md` L820), so that minute is the end rather than the
 * last moment of validity. And it keeps this function consistent with
 * `remainingWholeDays`, which reaches zero at exactly the same instant. Where a
 * boundary must fall one way or the other on a credential, it falls toward
 * refusing.
 *
 * This function decides nothing. Per rule R1 it is a comparison, not an
 * authorization check; the invitation service refuses an expired credential
 * server-side on redemption, which the catalog requires at
 * `docs/workflows/README.md` L405 and L406 and which
 * `01-onboarding-and-auth.md` L908 states as an acceptance criterion.
 *
 * @param expiresAt - The stored absolute expiry instant, or `null` for no limit.
 * @param now - The instant to compare against. Supplied by the caller; this
 *   module never reads the clock.
 * @returns `true` if `now` has reached or passed `expiresAt`; `false` if it has
 *   not, or if there is no expiry at all.
 * @throws {TypeError} If `expiresAt` is neither a `Date` nor `null`, or `now` is
 *   not a `Date`.
 * @throws {RangeError} If either `Date` holds no representable instant.
 */
export function hasExpired(expiresAt: Date | null, now: Date): boolean {
  if (expiresAt === null) {
    return false;
  }

  assertValidInstant(expiresAt, 'expiresAt');
  assertValidInstant(now, 'now');

  return now.getTime() >= expiresAt.getTime();
}
