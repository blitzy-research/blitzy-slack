/**
 * Environment-overridable configuration — the schema, its type, and the loader
 * that reads it.
 *
 * This module and its sibling `./constants.ts` are the whole configuration
 * surface, split in two on purpose. A value that a deployment may legitimately
 * tune — an expiry, a window, a threshold, a connection string, a credential —
 * belongs here, where it is schema-validated once and documented in the
 * committed environment template. A value that is a RULE rather than a setting
 * belongs there, where no environment variable can weaken it. `PROJECT_RULE_R3`
 * forbids inlining either kind at a point of use, so every consumer imports
 * from one of these two modules and no call site carries a literal of its own.
 *
 * ---------------------------------------------------------------------------
 * HOW THE PROJECT RULES ARE CITED, AND WHY NOT BY THEIR OWN IDENTIFIERS
 * ---------------------------------------------------------------------------
 *
 * Five binding project rules govern this work, cited throughout by requirement
 * label: `PROJECT_RULE_R1` (authorization is server-side only),
 * `PROJECT_RULE_R2` (corpus and specification handling), `PROJECT_RULE_R3`
 * (uncertainty is never permission to omit), `PROJECT_RULE_R4` (third-party
 * identity exclusion) and `PROJECT_RULE_R5` (a shared contract is implemented
 * exactly once). Their own identifiers are deliberately not written anywhere in
 * this repository's source, because each embeds the third-party product name
 * that R4 forbids in source and in comments. The labels are permuted relative to
 * those identifiers, so the label is the thing to trust; the authoritative
 * wording lives in the rules interface.
 *
 * ---------------------------------------------------------------------------
 * THIS MODULE IS THE ONLY READER OF THE ENVIRONMENT
 * ---------------------------------------------------------------------------
 *
 * No code outside this module may read `process.env` for any variable declared
 * below. That is `PROJECT_RULE_R5` applied to configuration: a second reader is
 * exactly the local, inlined equivalent the rule forbids, and it is worse than a
 * duplicated literal because it also escapes the validation applied here — a
 * misspelt key read directly yields `undefined` and a silent wrong default,
 * where the same key read through this loader yields a named failure at boot.
 * The lint configuration enforces this: `no-restricted-properties` bans
 * `process.env` across the application and library trees and is lifted for
 * exactly one directory, the one this file sits in.
 *
 * The single permitted exception is the server entry point's own `.env`
 * bootstrap, which populates `process.env` before calling the loader. It does
 * not READ a declared variable; it makes the file's contents visible so that
 * this module can.
 *
 * ---------------------------------------------------------------------------
 * TWO CONSTRAINTS THAT ARE ARCHITECTURE RATHER THAN STYLE
 * ---------------------------------------------------------------------------
 *
 * 1. NOTHING HERE TOUCHES THE FILESYSTEM. There is no filesystem import, no
 *    path resolution and no `.env` discovery in this module, and none may be
 *    added. Locating and loading a `.env` file is the server entry point's job,
 *    which is the only place that knows where the process was started from and
 *    the only place a file read is appropriate. This package's declared
 *    dependencies are the schema library, the specification generator and the
 *    identifier generator — so an import of a filesystem module or of an
 *    environment-file loader would not even resolve here, which means the
 *    constraint is enforced by the manifest as well as stated in this comment.
 *
 * 2. THE LOADER IS A FUNCTION, NEVER A PARSED SINGLETON. This module is
 *    re-exported through the package barrel, and that barrel is consumed by the
 *    browser client as well as by the server. Reading `process.env` at module
 *    load time would therefore break at import in a bundle where `process` does
 *    not exist, and it would contradict this package's `"sideEffects": false`
 *    declaration, which promises that importing a module does nothing
 *    observable. Validation consequently happens when `loadEnv` is CALLED — once,
 *    at server boot, where a failure is loud and immediate — and never when the
 *    module is imported. Type-only consumers and clients that import a sibling
 *    schema from the same barrel pay nothing for this file existing.
 *
 * ---------------------------------------------------------------------------
 * DURATIONS LIVE HERE; RECORDS STORE ABSOLUTE TIMESTAMPS
 * ---------------------------------------------------------------------------
 *
 * This is the least intuitive consequence of `PROJECT_RULE_R3` and the one most
 * likely to be undone by a well-meaning edit, so it is stated here rather than
 * left to the decision record.
 *
 * The configured values below are DURATIONS — a number of days, a number of
 * minutes, a number of hours. A consumer resolves a duration to an ABSOLUTE
 * TIMESTAMP at the moment of issuance and stores that timestamp on the record. A
 * duration stored on a record is a second copy of the configuration, and a second
 * copy goes stale the instant the first one changes. Storing the resolved moment
 * instead means the configured default can change without invalidating a single
 * record already written.
 *
 * Two consequences follow, and both are settled rather than open:
 *
 *   - A resolved timestamp is IMMUTABLE IN BOTH DIRECTIONS. Lengthening a
 *     configured window never extends something already issued, and shortening
 *     it never cuts something short either. Where outstanding access must end
 *     sooner, the record concerned is explicitly revoked or reissued as an
 *     authorized, audited operation — never by rewriting a date underneath a
 *     credential its holder already has. The catalogue settles this once for the
 *     invitation family (`docs/workflows/README.md` L401 and the paragraph after
 *     L407) and this module follows it.
 *   - A rendered figure is COMPUTED FROM THE STORED TIMESTAMP, never printed
 *     from one of these constants. A surface that printed the configured
 *     duration would drift from the record the first time the default changed.
 *
 * So nothing in this module holds, computes or returns a stored duration: it
 * returns the configured input to a resolution that happens elsewhere, exactly
 * once per issuing service.
 *
 * ---------------------------------------------------------------------------
 * WHAT MAY NEVER BE DECLARED HERE
 * ---------------------------------------------------------------------------
 *
 * `PROJECT_RULE_R1` makes an authorization decision a server-side check
 * evaluated at the point of execution against the acting session and the
 * specific target object, and forbids resting one on a caller-supplied
 * workspace or actor identifier. A configured identifier is a supplied one, so
 * the prohibition reaches this schema directly. Therefore:
 *
 *   - NO variable that can disable, relax, bypass or short-circuit an
 *     authorization check or the workspace-isolation predicate. Not for
 *     development, not for tests, not behind a mode flag. An escape hatch
 *     reachable by configuration is a rule that configuration can switch off.
 *   - NO authorization INPUT: no role list, no capability map, no workspace
 *     identifier, no actor identifier, no default tenant. A workspace is
 *     resolved server-side from the authenticated session and from nowhere else.
 *   - NO deployment-mode switch of any kind is read here. Behaviour that varies
 *     by environment varies through the values below, each of which is a value
 *     rather than a permission.
 *
 * `PROJECT_RULE_R3`'s split is the other prohibition: an INVARIANT must not
 * appear here. The channel-name ceiling and its pattern, the pre-selected
 * channel visibility, the snippet's required-field rule, the password-hashing
 * parameters and the realtime replay-window bound are all rules rather than
 * settings, they live in `./constants.ts`, and making any of them
 * environment-overridable would hand a deployment a downgrade path — most
 * sharply for the hashing parameters, where an override IS the downgrade.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DELIBERATELY ABSENT, SO THAT ABSENCE IS NOT READ AS OVERSIGHT
 * ---------------------------------------------------------------------------
 *
 * The committed environment template carries keys this schema does not declare,
 * and each omission is deliberate:
 *
 *   - THE LOCAL STACK'S OWN KEYS — the datastore user, password and database
 *     name, and the published port of each service, together with the
 *     per-checkout port offset. These are read by the container tool when it
 *     starts the stack, never by application code, which receives the same facts
 *     already composed into the connection strings below. Declaring them here
 *     would invite a second reader of a port that a connection string already
 *     carries.
 *   - KEYS BELONGING TO A LATER CONSUMER — the log level, the server host and
 *     port, the client dev-server port, the session cookie name, the sender
 *     address and the mail transport selector, the browser-reachable storage
 *     endpoint, the separate test database URL and the rate-limit budgets. Each
 *     belongs to a component that does not exist yet. When one is genuinely
 *     needed it is added HERE, and in the same change to the environment
 *     template and to the operating manual's variable table — never read
 *     directly from the environment at its point of use, which is the failure
 *     this module exists to prevent.
 *   - THE TWO CLIENT-EXPOSED ORIGINS, which are absent for a stronger reason
 *     than the two above: they are not this module's to read. The bundler
 *     exposes its own prefixed namespace directly to the browser bundle, so
 *     those two values are consumed by client code through that mechanism and
 *     never by a server-side loader. They are origins rather than secrets, and
 *     the prefix is the boundary — nothing carrying a credential may ever be
 *     named that way, because that namespace ships verbatim to every visitor.
 *
 * Unknown keys are stripped rather than rejected, which is what makes those
 * omissions harmless: see the note on the schema declaration below.
 *
 * ---------------------------------------------------------------------------
 * HOW THIS FILE CITES ITS EVIDENCE
 * ---------------------------------------------------------------------------
 *
 * A document citation names a file under `docs/workflows/` with its line number,
 * so `README.md` in a citation below is the catalogue index in that directory and
 * not the operating manual at the repository root. A frame is cited by NUMBER
 * alone, never by a filename: every filename in the frame corpus embeds the
 * third-party product name `PROJECT_RULE_R4` forbids in source and in comments,
 * and `PROJECT_RULE_R2` forbids renaming the corpus, so the number is the only
 * citation form both rules admit. No frame was opened to author this module;
 * every value below was resolved from catalogue prose, and the reasoning behind
 * each is recorded in `docs/decisions/observed-values.md`.
 *
 * @see docs/decisions/observed-values.md — the evidence, the reading, the choice
 * @see docs/decisions/catalog-defects.md — the recorded contradiction behind the
 *      invitation lifetime, which is resolved rather than corrected in place
 * @see docs/decisions/compose-and-env.md — the local stack and the two container
 *      keys the template carries for the container tool's benefit
 */

import { z } from 'zod';

/**
 * The smallest acceptable length of the session-signing secret, in characters.
 *
 * Declared as a named constant rather than written into the field below because
 * the loader's failure message reports it, so the schema and the message cannot
 * disagree about what was required.
 *
 * Thirty-two characters is the floor rather than a target. The secret
 * authenticates the cookie that carries the acting session, and the acting
 * session is what every authorization check under `PROJECT_RULE_R1` is evaluated
 * against — so a guessable secret is not a weak setting, it is a forgeable
 * identity. There is deliberately no upper bound: a longer secret is never worse.
 */
const SESSION_SECRET_MIN_LENGTH = 32;

/**
 * A whole number of units, greater than zero, accepted as the string an
 * environment always supplies.
 *
 * Every duration and every limit in this module is built from this, so the same
 * three rejections hold for all of them: a value that is not a number at all, a
 * value with a fractional part, and zero or a negative. The last is the one worth
 * stating — zero is not a shorter window, it is a mechanism switched off, and
 * `PROJECT_RULE_R3` requires each of these mechanisms to be working, enforced
 * functionality rather than something a deployment can neutralise by setting it
 * to nothing.
 *
 * An empty value is rejected rather than treated as absent. `KEY=` in an
 * environment file is a mistake somebody made, and the useful response is to name
 * the key rather than to quietly substitute the default and behave in a way its
 * author did not ask for. Absence — the key not being set at all — is what
 * selects the documented default.
 *
 * The three builders in this section are shared INSTANCES rather than factory
 * functions, which is safe because a schema in this library is an immutable value:
 * `.default(...)` derives a new schema and leaves the one it was called on
 * untouched, so no two fields built from the same instance can affect each other.
 */
const wholeUnitsAboveZero = z.coerce.number().int().positive();

/**
 * What a location's host part must look like: present, and free of whitespace.
 *
 * Carries no global flag, deliberately. A global regular expression keeps a
 * mutable index between calls, so a shared one would give different answers to
 * the same question depending on what was asked before it — and this one is
 * shared by every location field below.
 */
const URL_HOSTNAME_PATTERN = /^\S+$/;

/**
 * A location, validated as a URL that actually names a host.
 *
 * THE SCHEME IS DELIBERATELY NOT CONSTRAINED. The values validated this way
 * include a datastore connection string, a cache connection string, a mail
 * transport, an object-storage endpoint and a socket origin, and their schemes
 * legitimately differ — and legitimately vary between deployments, since a
 * managed datastore, a TLS cache connection and a secure socket origin all use a
 * different scheme from the local equivalent. An allowlist here would have to be
 * widened for each of those and would reject a perfectly good connection string
 * for no benefit.
 *
 * A HOST IS REQUIRED, AND THAT REQUIREMENT IS DOING REAL WORK. Parseability alone
 * is not enough, because the platform's URL parser is more permissive than it
 * first appears: given `localhost:5173` it reads `localhost` as the SCHEME and
 * `5173` as the path, and accepts it. That is the single most likely way one of
 * these variables is mistyped — writing an origin with the scheme left off —
 * so a check that admitted it would announce itself as URL validation while
 * missing the error it exists to catch. Requiring a non-empty host rejects it,
 * along with a bare hostname, a bare path, an empty value, a value carrying a
 * stray quote, and a scheme with nothing after it. Every legitimate form is still
 * accepted: credentials, ports, paths and query strings all pass.
 */
const requiredUrl = z.url({ hostname: URL_HOSTNAME_PATTERN });

/**
 * A required, non-empty identifier or name.
 *
 * Used where the value is neither a URL nor a number and where an empty string is
 * never meaningful — a bucket name, a region, an access-key identifier.
 */
const requiredText = z.string().min(1);

/**
 * The environment contract.
 *
 * UNKNOWN KEYS ARE STRIPPED, NOT REJECTED, and that is a correctness requirement
 * rather than a leniency. A real process environment carries the shell's own
 * variables, the container tool's keys, the package manager's, the continuous
 * integration provider's — hundreds of names this schema knows nothing about. A
 * schema that refused unrecognised keys would refuse every real environment it
 * was ever given, so the strict variant is deliberately not used here. What comes
 * back is exactly the declared set and nothing else, which also means a consumer
 * cannot accidentally reach an undeclared variable through the parsed object.
 *
 * NO DESCRIPTION IS ATTACHED FOR SPECIFICATION GENERATION. The generator's
 * extensions are applied in the specification registry and nowhere else, so this
 * module stays pure schema and the generator never becomes a dependency of a
 * browser bundle. The environment contract is not part of the public API surface
 * in any case: it is how a deployment is configured, not something a client may
 * ask about.
 *
 * Field order follows the environment template so the two can be read side by
 * side: the connection and credential surface first, then the five configurable
 * product defaults, then the two keys that exist for the container tool.
 */
export const envSchema = z.object({
  /**
   * The primary datastore's connection string.
   *
   * Required with no default. A datastore location is the single most damaging
   * value to guess on a deployment's behalf: a default here would let a
   * misconfigured process start up and read and write somewhere nobody intended,
   * and it would do so silently. The local development value belongs in the
   * committed environment template, which is where a value that is only correct
   * on a developer's own machine should live.
   */
  DATABASE_URL: requiredUrl,

  /**
   * The cache and message-bus connection string.
   *
   * Required with no default, for the same reason as the datastore. This backs
   * presence, the socket registry and cross-instance fan-out, so a process
   * pointed at the wrong instance would deliver another deployment's traffic.
   */
  REDIS_URL: requiredUrl,

  /**
   * The secret that signs the session cookie.
   *
   * REQUIRED, WITH NO DEFAULT AND NO FALLBACK, and of the whole schema this is
   * the field where that matters most. A session is a server-side revocable
   * record referenced by an HTTP-only cookie, and that cookie is the acting
   * identity every authorization decision under `PROJECT_RULE_R1` is evaluated
   * against. A defaulted signing secret would therefore not be a weak
   * configuration — it would be a published one, letting anybody who has read
   * this repository mint a cookie for any account. So the loader fails loudly
   * when it is absent, and the template's entry for it is an obvious placeholder
   * rather than a working value.
   *
   * The minimum length is enforced because a short secret is a guessable one;
   * see `SESSION_SECRET_MIN_LENGTH` for why the floor sits where it does. The
   * value itself never appears in a failure message — see the loader.
   */
  SESSION_SECRET: z.string().min(SESSION_SECRET_MIN_LENGTH),

  /**
   * The object store's API endpoint.
   *
   * Required with no default. Uploads are pre-signed so that file bytes never
   * transit the API, which means this endpoint is baked into a URL handed to a
   * client — a wrong value here is a wrong destination in somebody else's
   * browser, not merely a failed request on the server.
   */
  S3_ENDPOINT: requiredUrl,

  /**
   * The bucket uploads are written to.
   *
   * Required with no default. Two deployments sharing a bucket by accident is
   * exactly the kind of cross-tenant bleed the isolation work exists to prevent,
   * and it is not a failure that announces itself, so the bucket is always named
   * explicitly. The name is authored, like every other name this project gives
   * itself.
   */
  S3_BUCKET: requiredText,

  /**
   * The object store's access-key identifier.
   *
   * Required with no default. The identifier half of a credential pair is not
   * itself secret, but it is half of one, and a defaulted half invites the other
   * half to be defaulted beside it.
   */
  S3_ACCESS_KEY_ID: requiredText,

  /**
   * The object store's secret access key.
   *
   * Required with no default, and treated as a credential throughout: its value
   * never appears in a failure message, only its name. See the loader.
   */
  S3_SECRET_ACCESS_KEY: requiredText,

  /**
   * The region the object-storage client signs requests for.
   *
   * One of only two fields in this schema carrying a default, because it is a
   * technical setting rather than a location or a credential: an S3-compatible
   * client must sign for SOME region even when the store it talks to does not
   * partition by region at all, which is the case for the local one. A
   * conventional value keeps that requirement satisfied without asking a
   * developer to make a decision that has no consequence locally, while a
   * deployment that does partition by region simply sets it.
   */
  S3_REGION: requiredText.default('us-east-1'),

  /**
   * Whether the object-storage client addresses buckets by path rather than by
   * subdomain.
   *
   * The second and last defaulted field, and the default is `true` because
   * path-style addressing is what the local object store requires. A managed
   * store that prefers virtual-hosted addressing sets it to `false`.
   *
   * PARSED FROM A STRING BY A DEDICATED PARSER, NOT BY A CAST. Every environment
   * value arrives as a string, and the obvious cast is wrong in the one direction
   * that matters: a plain truthiness test on the string `'false'` yields TRUE,
   * because a non-empty string is truthy. That single mistake would silently pin
   * this field to `true` for every deployment that tried to turn it off. The
   * parser used here maps the written word to the boolean it plainly means in
   * either direction, and rejects anything it cannot read as one rather than
   * guessing — so a typo becomes a named failure at boot instead of an addressing
   * mode nobody chose.
   */
  S3_FORCE_PATH_STYLE: z.stringbool().default(true),

  /**
   * The mail transport verification codes, invitations and recovery links are
   * delivered through.
   *
   * Required with no default. Every message this carries is either a credential
   * or a link to one, so a process pointed at the wrong transport is a process
   * posting credentials somewhere unintended. Locally this addresses the capture
   * service in the development stack, which accepts mail and delivers none.
   */
  SMTP_URL: requiredUrl,

  /**
   * The public origin of the web client.
   *
   * Required with no default. This is the origin every emailed link is built
   * from — a verification code's confirmation, an invitation, a password
   * recovery — so a default would produce mail whose links point at a machine
   * the recipient cannot reach, and it would do so most damagingly in the one
   * environment where it was never set on purpose.
   */
  PUBLIC_APP_URL: requiredUrl,

  /**
   * The public origin of the realtime endpoint the client dials.
   *
   * Required with no default. Declared separately from the application origin
   * rather than derived from it, because the two legitimately differ: a
   * deployment may terminate sockets on another host or another scheme, and a
   * derivation would silently be wrong there while looking right locally. It must
   * agree with the origin the API actually serves the socket on.
   */
  PUBLIC_SOCKET_URL: requiredUrl,

  /**
   * How long a workspace invite link stays redeemable, in days. Default 30.
   *
   * THE EVIDENCE DISAGREES WITH ITSELF, AND THE DISAGREEMENT IS RECORDED RATHER
   * THAN RECONCILED. The in-product confirmation raised when the link is copied
   * states a lifetime of nineteen days (frame 46,
   * `01-onboarding-and-auth.md` L241), while the administration console's
   * invite-links table renders a creation date and an expiry date exactly one
   * month apart for the same kind of link (frame 656). The catalogue notes the
   * conflict and declines to resolve it, warning specifically against a build
   * that reads one surface and adopts the number it happens to render
   * (`README.md` L405 and its sixth known limitation).
   *
   * WHY THIRTY AND NOT NINETEEN. Nineteen days is not a figure anybody
   * configures; it is what a thirty-day link reads as when it is inspected eleven
   * days into its life. The corpus is a single session captured once, so a
   * confirmation seen there shows what was LEFT of a duration rather than the
   * duration itself. `PROJECT_RULE_R3` addresses this shape of evidence directly:
   * where a frame plausibly shows an elapsed-time remainder, the conventional
   * round default is chosen and the frame reading is kept as corroborating
   * evidence rather than adopted as the setting. Thirty days is that round
   * default, and the console's one-month rendering independently supports it.
   * Nineteen is corroboration; it is not the setting.
   *
   * WHERE THIS VALUE IS ALLOWED TO BE USED. An invite link is a bearer
   * credential — whoever holds it can join the workspace — so its lifetime is
   * settled in exactly one place. The invitation-issuing service
   * (`apps/api/src/services/invitation.ts`) reads this value and writes an
   * absolute expiry timestamp onto the invitation record; nothing else computes an
   * invitation lifetime, and no surface prints this number. Redemption re-checks
   * the stored timestamp server-side and refuses an expired link whatever any
   * surface renders.
   *
   * THIS IS NOT THE EXTERNAL ACCEPTANCE WINDOW AND MUST NEVER BE MERGED WITH IT.
   * See the next field.
   */
  INVITE_EXPIRY_DAYS: wholeUnitsAboveZero.default(30),

  /**
   * How long an invited external collaborator has to accept, in days. Default 14.
   *
   * A SEPARATE FACT FROM THE INVITE-LINK LIFETIME, AND DELIBERATELY NOT ALIASED
   * TO IT. The catalogue models three time-bounded artefacts separately, each with
   * one named authority, and states plainly that conflating them produces a wrong
   * schema (`README.md` L401). The invite-link lifetime above belongs to the
   * invitation entity; this window belongs to the external-organization entity;
   * and the third — a guest account's end date — is an absolute calendar date
   * chosen per account through a date picker (frame 54) and is therefore not an
   * environment variable at all. The two here happen to share a unit and a shape,
   * which is precisely why the temptation to collapse them into one key has to be
   * refused explicitly. Their values may drift apart at any time.
   *
   * THE READING IS AN ORIGINAL, NOT A REMAINDER, WHICH IS WHY IT IS ADOPTED
   * UNCHANGED. The confirmation states that the invitee has fourteen days to
   * accept (frame 500) — a window that has not begun to run, with nothing elapsed
   * and no remainder to reconstruct. The round-default substitution that governs
   * the field above therefore does not apply here, and substituting one would
   * discard the only reading the specification offers. Identically shaped evidence
   * to the previous field, read the other way, giving the opposite conclusion. The
   * catalogue marks the window's PLACEMENT a build decision under its gap contract
   * rather than an observation (`README.md` L406), and the placement it requires is
   * this one: the window is held once, here.
   *
   * Each issued invitation carries a resolved acceptance deadline computed at
   * issuance — never a duration, and never a second copy of the window — and
   * acceptance checks that resolved date server-side. The surface that states the
   * window belongs to a deferred area, so the mechanism and its default ship now
   * while that surface does not: a deferred screen is not a deferred rule.
   */
  EXTERNAL_ACCEPTANCE_WINDOW_DAYS: wholeUnitsAboveZero.default(14),

  /**
   * How many channels a guest may be scoped to without the multi-channel
   * allowance. Default 1.
   *
   * A COMMERCIAL THRESHOLD, NOT AN AUTHORIZATION BOUNDARY. This distinction is
   * the whole reason the field carries a comment this long, because a future
   * reader who mistakes it for a permission control will have found what looks
   * like an environment variable that widens access — and `PROJECT_RULE_R1`
   * forbids configuration from participating in an authorization decision at all.
   * It does not. Whether a given guest may see or post in a given channel is
   * decided by the authorization matrix, server-side, against the acting session
   * and that specific channel. This number decides something else entirely:
   * whether the guest has crossed the line at which the specification says they
   * are billed as a full member rather than as a guest.
   *
   * THE RULE IS OBSERVED; THE FIGURE IS NOT. Choosing the guest role makes
   * channel scope a required field and introduces a separate, unchecked allowance
   * admitting more than one channel, whose stated consequence is explicitly
   * commercial: a guest who can join multiple channels is billed as a full member
   * (frames 49 and 50, `01-onboarding-and-auth.md` L271 and L272; corroborated on
   * the user entity at `README.md` L326). No frame states a number, and none is
   * invented here — absence is recorded as absence in
   * `docs/decisions/observed-values.md`. One is the smallest coherent figure
   * consistent with that evidence: the allowance exists precisely to admit a
   * second channel, so any budget above one would pre-grant what the allowance
   * exists to grant.
   *
   * Enforced server-side at the point a guest is scoped to a further channel. The
   * allowance, when set, is recorded on the invitation and lifts the budget.
   * Billing itself is out of scope for this phase, so crossing the threshold is
   * recorded and no charge is applied — which leaves the rule implementable the
   * moment billing exists.
   */
  GUEST_CHANNEL_LIMIT: wholeUnitsAboveZero.default(1),

  /**
   * How long a session may sit idle before it expires, in minutes. Default 1440,
   * which is one day.
   *
   * AUTHORED, NOT OBSERVED, AND SAID PLAINLY BECAUSE THAT IS ITSELF A
   * REQUIREMENT. No frame anywhere in the corpus shows a session lifetime, and no
   * gap marker flags the silence either: a single authenticated session captured
   * once cannot show itself ending. This is the case `PROJECT_RULE_R3` covers with
   * its absent-evidence clause — the smallest coherent behaviour consistent with
   * adjacent evidenced behaviour is chosen and recorded, and the mechanism ships
   * regardless. Inventing a frame citation for it would be worse than having none.
   *
   * A day-long idle bound keeps a returning member's session usable across a
   * working day while still ending one left unattended, and the session record is
   * revocable at any moment independently of it. The adjacent evidence is the
   * returning-user path, where an address belonging to more than one workspace is
   * asked to choose one on the way back in (`01-onboarding-and-auth.md` L431) —
   * re-establishing a session is an ordinary designed event in this product, so
   * bounding one is consistent with what the specification describes rather than
   * in tension with it. The options weighed and rejected are recorded in
   * `docs/decisions/observed-values.md`.
   *
   * Mechanically the idle expiry is an absolute timestamp advanced on
   * authenticated activity, held on the server-side session record. Nothing the
   * client holds carries it.
   */
  SESSION_IDLE_TIMEOUT_MINUTES: wholeUnitsAboveZero.default(1440),

  /**
   * The greatest age a session may reach regardless of activity, in hours.
   * Default 720, which is thirty days.
   *
   * AUTHORED, NOT OBSERVED, exactly as the idle bound above and for the same
   * reason: the specification raises session lifetime nowhere at all.
   *
   * A SECOND BOUND IS NECESSARY RATHER THAN DECORATIVE. An idle bound alone lets
   * a session live indefinitely under regular use, so nothing would ever age a
   * credential out by policy. This bound is written once when the session is
   * created and never moved afterwards. The two are independent: whichever falls
   * first ends the session, neither is derived from the other, and revocation ends
   * it at any time regardless of both.
   *
   * The unit is hours rather than days because that is the unit the environment
   * template and the decision record already carry for it, and because the
   * absolute bound is the one of the two a deployment is most likely to want to
   * express in less than whole days.
   */
  SESSION_ABSOLUTE_TIMEOUT_HOURS: wholeUnitsAboveZero.default(720),

  /**
   * Where the container tool should look for the local stack's definition.
   *
   * OPTIONAL, AND NO APPLICATION CODE EVER READS IT. It is declared here rather
   * than left out so that a reader of this schema can see why it appears in the
   * environment template without having to go and find out: the stack is defined
   * inside the infrastructure directory the write boundary admits, while the
   * documented command that starts it is run from the repository root. The
   * container tool reads the local environment file before it resolves which
   * definition to load, so this key is what makes the documented command find the
   * file with no argument, no wrapper script and no alias — fidelity preserved by
   * making the literal command work rather than by documenting a variant of it.
   * The reasoning is recorded in `docs/decisions/compose-and-env.md`.
   *
   * Declared as free text rather than validated as a path, because it is the
   * container tool's input and not this application's: validating it here would
   * assert a second opinion about a value this module has no business having one
   * about.
   */
  COMPOSE_FILE: z.string().optional(),

  /**
   * The name the container tool groups the local stack's containers, volumes and
   * network under.
   *
   * OPTIONAL, AND NO APPLICATION CODE EVER READS IT, for the same reason as the
   * key above. Its purpose is stability: the tool derives a project name from the
   * directory it was invoked in, and a checkout directory is not a stable input —
   * renaming or moving a clone would otherwise orphan its data. Naming the project
   * explicitly means the same clone finds its own containers and volumes again,
   * and two clones with distinct names share nothing at all.
   */
  COMPOSE_PROJECT_NAME: z.string().optional(),
});

/**
 * The validated environment, as consumers see it.
 *
 * Inferred from the schema rather than declared beside it, so the type and the
 * validation can never disagree: adding a field to the schema adds it here, and
 * every field that carries a default is a required property of this type because
 * the loader has already resolved it. A consumer therefore never handles an
 * `undefined` for a value that has a documented default, which is the practical
 * benefit of loading once at boot rather than reading the environment at each
 * point of use.
 */
export type Env = z.infer<typeof envSchema>;

/**
 * One validation issue, as this module's own reporting sees it.
 *
 * Derived from the schema library's error type by indexed access rather than by
 * importing an internal name, so a change to how that library organises its issue
 * types cannot break this file.
 */
type ParseIssue = z.ZodError['issues'][number];

/**
 * The name a failure is reported against.
 *
 * An issue's path is a single environment-variable name for every field in this
 * schema, because the schema is one level deep. The empty-path case is still
 * handled: it is what a failure against the environment as a whole would look
 * like, and reporting it as a nameless bullet would be worse than naming it.
 */
const offendingName = (issue: ParseIssue): string => {
  const [first] = issue.path;
  return first === undefined ? '(the environment as a whole)' : String(first);
};

/**
 * Why one variable was rejected, in this module's own words.
 *
 * AUTHORED HERE RATHER THAN TAKEN FROM THE LIBRARY'S MESSAGE, AND THAT IS A
 * SECRET-HANDLING DECISION RATHER THAN A MATTER OF WORDING. A failure message
 * from this loader is the thing that gets logged, printed to a terminal and
 * pasted into an issue tracker, and several of the variables above are
 * credentials. Composing the sentence from the issue's CODE alone means the
 * rejected value cannot reach the message even by accident — there is no code
 * path along which it could, because the value is never read here. Interpolating
 * a library-supplied message would make that guarantee depend on what a
 * dependency chooses to include in its own text, which is not a guarantee at all.
 *
 * The one number that does appear is a bound taken from the SCHEMA — the minimum
 * length this module itself requires. That is a published constant, not an input,
 * and stating it is what makes the failure actionable.
 *
 * A reason is deliberately written to complete the sentence "<NAME> …", so the
 * bullets read as prose.
 */
const rejectionReason = (issue: ParseIssue): string => {
  switch (issue.code) {
    case 'invalid_type':
      // Reached when a value is absent where none may be, and when a numeric
      // field is given something that is not a number at all or carries a
      // fractional part.
      return issue.expected === 'number' || issue.expected === 'int'
        ? 'is not a whole number'
        : 'is not set';
    case 'too_small':
      return issue.origin === 'number'
        ? 'must be greater than zero'
        : `is shorter than the ${String(issue.minimum)} characters required`;
    case 'too_big':
      return `is longer than the ${String(issue.maximum)} characters allowed`;
    case 'invalid_format':
      return issue.format === 'url' ? 'is not a valid URL' : 'is not in the required format';
    case 'invalid_value':
      // The written-boolean parser reports this when it is handed something it
      // cannot read as either true or false.
      return 'is not one of the values this setting accepts';
    default:
      // Every remaining code is a shape this schema cannot currently produce.
      // Naming the variable and saying so plainly is more useful than a silent
      // omission would be, and keeps the switch honest if a field is added later.
      return 'was rejected by the configuration schema';
  }
};

/**
 * Reads, validates and returns the environment.
 *
 * CALL THIS ONCE, AT SERVER BOOT, AND PASS THE RESULT DOWN. It is the single
 * point at which this project reads the environment, and calling it early means a
 * misconfigured deployment fails while it is starting — with every offending
 * variable named — rather than at the first request that happens to need one of
 * them. A process that reaches the point of serving traffic has, by construction,
 * a complete and valid configuration.
 *
 * THE SOURCE IS A PARAMETER, AND ITS DEFAULT IS EVALUATED AT CALL TIME. That is
 * what keeps this module importable in a browser bundle: `process` is named
 * inside a function body, so it is only ever touched by a caller that actually
 * calls this, and never while the module is being loaded. It is also what makes
 * this function testable without mutating a global — a test hands in the exact
 * environment it wants to describe and no other test can see it.
 *
 * EVERY PROBLEM IS REPORTED AT ONCE, IN A SINGLE THROW. A loader that reported
 * only the first missing variable would turn a first run into a guessing game:
 * set one, run again, discover the next. So the whole environment is validated,
 * the issues are grouped by variable name, sorted so that the same misconfiguration
 * always reports identically, and raised together.
 *
 * NO VALUE APPEARS IN THE FAILURE, ONLY NAMES AND REASONS — see
 * `rejectionReason`. The library's own error is deliberately NOT attached as the
 * thrown error's cause either, for the same reason: a cause chain is printed by
 * default by most log formatters and by the runtime's own unhandled-exception
 * reporter, so attaching one would quietly widen exactly the surface this design
 * narrows. The variable names in the message are sufficient to fix the problem,
 * and they are all a log is entitled to.
 *
 * THE RESULT IS FROZEN. Configuration is settled at boot and read thereafter; a
 * consumer that could reassign a field would be a second source of truth for a
 * documented default, which is the thing `PROJECT_RULE_R5` forbids. Freezing makes
 * the attempt fail rather than succeed silently.
 *
 * @param source - Where to read from. Defaults to the process environment.
 * @returns The validated environment, with every documented default resolved.
 * @throws {Error} If any variable is missing or malformed. The message names every
 *   offending variable and what was wrong with each, and contains no value.
 */
export function loadEnv(source: Record<string, string | undefined> = process.env): Readonly<Env> {
  const result = envSchema.safeParse(source);

  if (result.success) {
    return Object.freeze(result.data);
  }

  // One entry per variable. A single variable can attract more than one issue —
  // a value can be both too short and malformed — and repeating its name would
  // make the count at the head of the message disagree with the list beneath it.
  const reasonsByName = new Map<string, string>();
  for (const issue of result.error.issues) {
    const name = offendingName(issue);
    if (!reasonsByName.has(name)) {
      reasonsByName.set(name, rejectionReason(issue));
    }
  }

  const bullets = [...reasonsByName.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, reason]) => `  - ${name} ${reason}`)
    .join('\n');

  const count = reasonsByName.size;
  const subject = count === 1 ? '1 variable' : `${String(count)} variables`;

  throw new Error(
    [
      `Invalid environment configuration: ${subject} must be corrected before this ` +
        'process can start.',
      bullets,
      'No values are shown above, deliberately: several of these variables carry ' +
        'credentials and a configuration failure must never put one in a log. Set ' +
        'each variable named above in the process environment; locally that means ' +
        'the .env file copied from .env.example, whose entry for each one documents ' +
        'the value it expects.',
    ].join('\n'),
  );
}
