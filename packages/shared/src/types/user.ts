/**
 * Derived types for the person contract.
 *
 * WHAT THIS MODULE IS
 *
 * Every type this module exposes is produced by `z.infer` over a schema that
 * `../schemas/user.js` exports, or is a narrowing of such an inferred type.
 * There is no schema here, no runtime value and no hand-written shape. Nothing
 * in this file survives compilation: it emits declarations and nothing else,
 * which is why the package declares itself free of side effects and why the
 * coverage configuration excludes this directory from measurement rather than
 * reporting it at zero.
 *
 * The consequence worth stating plainly is that this module cannot drift. A
 * shape has exactly one definition — the schema — and a type inferred from that
 * definition changes when the definition changes. An `interface User` restating
 * the profile's fields would be a second definition of one contract, and the
 * second definition is the one that is wrong after the first one changes. None
 * appears below, and the temptation to add one is worth naming out loud, because
 * a person shape is the single most natural thing in this package to hand-write.
 *
 * This is also the folder's most widely consumed module. The compact person
 * summary is what every author line, member row, facepile entry, mention
 * typeahead row and mention chip is typed by, so a mistake here propagates to
 * every surface that names a person.
 *
 * WHERE THE CANONICAL PERSON TYPES LIVE, AND WHY THIS MODULE RE-EXPORTS THEM
 *
 * The schema module already declares a derived type for each of its composite
 * shapes and for each of its closed vocabularies, and those declarations are
 * load-bearing where they are: the object schemas reference the vocabularies,
 * and the rejection-code union is consumed inside the schema module itself to
 * type every issue message it attaches. So this module does not restate them.
 *
 * It does re-export them, by name, from the module that declares them. That
 * distinction is the whole of it and it is not a nicety:
 *
 *   - A RE-EXPORT introduces no new declaration. `export type { X } from …`
 *     forwards the one declaration next door, so the package barrel flattening
 *     both modules into one namespace sees one `X` arriving by two routes that
 *     resolve to the same symbol. That is not ambiguous and it is not an error.
 *   - A TWIN is a second declaration. Writing `export type X = z.infer<typeof
 *     xSchema>` here for an `X` the schema module also exports makes two
 *     declarations of one name, and the barrel then fails to compile — in a file
 *     neither module owns — reporting that the member is already exported.
 *
 * Both halves of that were established by compiling them rather than reasoned
 * about, because the failure mode lands on somebody else's file. A reader who
 * "tidies" a re-export below into a local inference will reproduce it.
 *
 * TWO PROJECTIONS OF ONE PERSON, AND THEY STAY TWO
 *
 * The full profile and the person summary are distinct contracts, not a shape
 * and a view of it. Each is inferred from its own schema, and neither is
 * expressed in terms of the other — no `Pick`, no `Omit`, no `Partial`, no
 * intersection. The reason is not tidiness: reading a profile and reading a
 * summary are two read paths with two independent authorization checks, and
 * being entitled to one entails nothing about being entitled to the other. A
 * type that derived the summary from the profile would encode the opposite
 * claim, that one is merely less of the other, which is exactly the reasoning
 * that produces an over-projection. The single-implementation discipline this
 * package is built on says the same thing from the other direction: where two
 * contracts look similar, they are not merged.
 *
 * WHAT IS DELIBERATELY ABSENT — CREDENTIAL MATERIAL
 *
 * Recorded here rather than left implicit, so that a later reader cannot mistake
 * the absence for an oversight and add one back "for completeness". The person
 * entity's own row in the consolidated model (`docs/workflows/README.md` L326)
 * names four credential artefacts the product renders — a password with a
 * strength rating, a six-character expiring one-time code, an active browser
 * session, and a device-enrolment code — under the heading that they are *not*
 * fields of that entity, and states that they appear in that cell only so a
 * build cannot read their absence as a gap. The secret-handling contract closes
 * it for every model in the product, and
 * `docs/workflows/01-onboarding-and-auth.md` L927 states it as an acceptance
 * criterion outright: none of the four is a persisted field of the person entity
 * or of any entity a read path returns.
 *
 * So no type below is, or resembles, a password, a verifier, a hash, a salt, a
 * one-time code, a session bearer, a device-enrolment code or a strength rating.
 * The four artefacts are separately-secured records with four separate
 * lifetimes and revocation paths, handled in `apps/api/src/secrets/password.ts`,
 * `apps/api/src/secrets/otp.ts`, `apps/api/src/secrets/enrolment-code.ts` and
 * `apps/api/src/secrets/session-store.ts`. The strength rating deserves its own
 * sentence because it is the one that looks harmless: it is computed transiently
 * in the client, never transmitted and never stored, and it is advisory rather
 * than a policy gate (`01-onboarding-and-auth.md` L928) — the policy itself is
 * evaluated server-side on submission.
 *
 * AND A PUBLIC MARKETING ADDRESS, FOR A DIFFERENT REASON
 *
 * There is no marketing, newsletter, lead or subscribed type here either. A
 * publicly submitted address and a workspace member are different populations
 * governed by the personal-data contract, and `README.md` L326 states plainly
 * that a read serving a marketing surface must not be a read of workspace
 * membership. A submitted address, the consent act, the wording shown and any
 * withdrawal belong to the public form-submission structure and to
 * `../schemas/auth.js`; folding a flag onto a person would merge two populations
 * that must stay apart, and a pre-ticked control is a rendering rather than a
 * consent in any case (`01-onboarding-and-auth.md` L931).
 *
 * AND EVERY PER-VIEWER FACT
 *
 * The per-viewer contract supplies one question — if two people opened this at
 * the same moment, could they legitimately see different values? — and where the
 * answer is yes, the field belongs on a relation keyed by the pair and never on
 * the shared object (`docs/workflows/00-product-overview.md` L564). The
 * consolidated model calls that placement "the single most consequential
 * correction" it makes (`README.md` L357), and the reason it is a security rule
 * rather than a modelling preference is concrete: stored on the shared object,
 * one person's reading marks it read for everyone, and the flag additionally
 * discloses that person's behaviour to every other member of the object.
 *
 * Nothing per-viewer is therefore reachable through a type below. Read state and
 * unread boundaries, unread counts, mark-as-unread, notification scope and mute,
 * stars, saved-for-later, reminder times, last-viewed timestamps, draft
 * presence, sidebar placement, follow state and dismissed banners all live on a
 * relation: conversation-scoped per-member state with the membership record in
 * `./channel.js`, viewer-and-message state in `./message.js`, and viewer-owned
 * preferences — including dismissed banners, which sit on the viewer's own
 * preference record rather than on the object dismissed — in `./preference.js`.
 * Keeping this module to the person alone is what keeps that correction intact.
 *
 * WHAT THESE TYPES ARE NOT
 *
 * They are shapes. They are not a trust boundary, and no value acquires any
 * property by being annotated with one.
 *
 *   - **Validation happens elsewhere.** A value typed as anything below has
 *     satisfied the compiler, which says nothing about whether it satisfied the
 *     schema. A payload arriving over the wire is parsed by the schema on the
 *     server, and the schema is where a bound, a character class and a named
 *     time zone are actually enforced — none of which a type can express.
 *   - **No authorization happens here, and nothing below can carry an
 *     authorization input.** Reading a person is a read path; producing a list,
 *     a count or a facepile over people is a projection and is authorized
 *     independently, against the acting session and for that specific record,
 *     never merely because the enclosing surface loaded
 *     (`00-product-overview.md` L558). There is deliberately no helper here that
 *     attaches a workspace identifier or an actor identifier to a person shape:
 *     the workspace predicate is injected below every query by the tenancy
 *     extension bound in `apps/api/src/db/tenancy.ts`, from the session the
 *     server authenticated, and an authorization decision may never rest on an
 *     identifier a caller supplied. The person identifier a client may legally
 *     send back is an identifier and nothing more — it identifies, it discloses
 *     nothing, it grants nothing, and it is never an authorization input.
 *   - **A role below is descriptive.** It says which badge renders beside a
 *     name. The capability meaning of each role is decided server-side by the
 *     authorization surface, and a client rendering is never evidence of
 *     permission.
 *   - **No encoding happens here.** A stored value is encoded per destination
 *     sink at render time, so one stored value is safe in every context it
 *     appears in. A type cannot encode.
 *
 * ABSENT VALUES: THE PROFILE HOLDS `null`, THE UPDATE REQUEST OMITS THE KEY
 *
 * The two shapes express absence in two different ways and the difference is
 * observable, so it is worth reading once rather than discovering later.
 *
 * On the profile, every value a person may not have set is a REQUIRED property
 * whose type includes `null` — the display name, the photo reference, the
 * pronouns, the pronunciation, the job title and the guest end instant. The key
 * is always present. A consumer renders the fallback for `null`; it does not
 * test for the key's presence.
 *
 * On the update request every property is OPTIONAL, and there the two forms are
 * not interchangeable:
 *
 *   - OMITTING a key means "leave this value unchanged".
 *   - Sending a key with `null` means "clear this value", and only the values
 *     that may legitimately be absent from a profile can be cleared.
 *   - Assigning `undefined` is the trap. Because the inferred value type already
 *     includes the absent case, the exact-optional-property-types setting does
 *     *not* refuse it — the compiler accepts both omitting the property and
 *     assigning it nothing — and the schema counts a key holding `undefined` as
 *     absent, which is what it means on the wire. So a request whose only
 *     property was assigned `undefined` asks for nothing and is rejected as
 *     empty, while reading as though it asked for something. Omit the property.
 *
 * Serialising drops an assigned-`undefined` key, so a value that has crossed the
 * wire and one that has not are then unequal by key set — the kind of difference
 * that survives every test written against a value's contents.
 *
 * HOW TO CONSUME IT
 *
 * Through the package barrel — `@relay/shared` — and never by path. Inside this
 * package the sibling schema module is reached relatively, because that is how a
 * package is built; from outside, the barrel is the only entry point.
 *
 * A NOTE ON CITATIONS
 *
 * A catalogue location is cited by document and line. A frame is cited by its
 * NUMBER alone and never by its filename, because each of the corpus filenames
 * embeds a third-party product name that may not appear in source or in a
 * comment. The same restriction is why every project rule referred to above and
 * below is named by what it requires — the single-implementation discipline, the
 * secret-handling contract, the personal-data contract, the per-viewer contract
 * — and never by its own identifier, each of which embeds that same name. A
 * reader who maps them back should not write the identifiers in here.
 */
import type { z } from 'zod';
import type {
  avatarObjectKeySchema,
  displayNameSchema,
  emailAddressSchema,
  fullNameSchema,
  guestAccessEndsAtSchema,
  personIdSchema,
  timeZoneSchema,
  workspaceRoleSchema,
} from '../schemas/user.js';

/* -------------------------------------------------------------------------- */
/* The canonical person shapes, forwarded from the module that declares them  */
/* -------------------------------------------------------------------------- */

/*
 * Six names, one declaration each, all of them next door. They are forwarded
 * here so that a consumer reaching for the person contract finds the whole of it
 * in one place, and forwarded rather than re-inferred so that there is still
 * only one declaration of each — see the header for why the difference decides
 * whether the package barrel compiles.
 *
 * What each one is:
 *
 *   - `PersonProfile` — a person's full profile, as returned to a reader
 *     entitled to the whole record. Carries the email address, which is the
 *     account's identifier and is personal data under the personal-data
 *     contract: it is read under a field-level check for that specific record,
 *     and it never reaches a log, an error report, an analytics event, a URL, a
 *     cache key or a telemetry payload.
 *   - `PersonSummary` — the compact projection, described below.
 *   - `UpdateOwnProfileRequest` — the request that changes one's own profile.
 *     It names no subject: there is no identifier of the person being edited in
 *     the shape at all, because the subject is the acting session and an
 *     authorization decision may not rest on a value a caller chose. It is
 *     strict, so an unknown key is rejected rather than ignored, and it carries
 *     only genuinely self-editable values — not the address, not the
 *     verification state, not the presence, not the role, not the guest end
 *     instant.
 *   - `WorkspaceRole` — the account types a person may hold within one
 *     workspace, as a literal union rather than a runtime enumeration, so the
 *     vocabulary cannot be extended anywhere but the schema. Descriptive, never
 *     a grant.
 *   - `Presence` — a person's presence as a presence indicator renders it.
 *     Composed at read time from the heartbeat store rather than read from the
 *     person's record, so its appearance on a person shape is not licence to
 *     store a presence column.
 *   - `PersonRejectionCode` — the closed set of machine-readable reasons a
 *     person shape was rejected. A code, never a rendered sentence: the wording
 *     a person reads is chosen by the client from the authored copy module, so
 *     no user-facing prose exists in this package's contract and no rejection
 *     can leak an implementation detail.
 *
 * `PersonSummary` IS THE ONE TO REACH FOR WHEN NAMING A PERSON. Every surface
 * that renders a person's name renders this shape: a message author line, a
 * member row, a facepile entry, a mention typeahead row and a mention chip. It
 * is six short scalars and deliberately carries NO email address, which is what
 * makes it reasonable for one channel header to return five hundred of them at
 * once. Typing one of those surfaces with `PersonProfile` instead is an
 * over-projection — it puts an address behind every facepile, every member-list
 * page and every mention keystroke, which is precisely the bulk disclosure the
 * minimisation requirement forbids. Nothing that renders a person's name needs
 * their address.
 */
export type {
  PersonProfile,
  PersonRejectionCode,
  PersonSummary,
  Presence,
  UpdateOwnProfileRequest,
  WorkspaceRole,
} from '../schemas/user.js';

/* -------------------------------------------------------------------------- */
/* Field primitives                                                           */
/* -------------------------------------------------------------------------- */

/*
 * One name for each field schema the module next door leaves underived. Every
 * one of them resolves to text, and that is the point rather than a shortcoming:
 * the schemas differ in how much they accept, against which character class,
 * after which normalisation and whether absence is a legitimate value, and none
 * of that difference is expressible in the type system. A signature naming one
 * of these therefore says which bounded value it wants, which is strictly more
 * than a bare text type says, while leaving enforcement where enforcement
 * belongs — in the schema.
 *
 * No bound appears here, in a type or in a comment. Every bound is declared once
 * in the schema module as a named constant and reaches these types only through
 * the schema that consumed it, so there is no number in this file that can fall
 * out of step with one.
 */

/**
 * The opaque record identifier naming a person.
 *
 * Opaque is the operative word, and it is the one value on the summary that a
 * client may legitimately send back. It identifies a record and nothing else:
 * nothing may be inferred from its contents, no caller may construct one, and it
 * confers no authority whatsoever — it is never an authorization input, and a
 * decision keyed to it would be a decision keyed to a value the caller chose.
 *
 * It is also the reference the personal-data contract requires be used in place
 * of a personal value wherever a person must be named outside the product's own
 * read paths — in a log line, an error report, an analytics event, a URL or a
 * cache key, where an address may never appear.
 */
export type PersonId = z.infer<typeof personIdSchema>;

/**
 * A person's email address — the account's identifier.
 *
 * Personal data rather than a secret, so it is neither hashed nor sealed: a
 * support reply has to reach the address that was typed. What travels with it
 * instead is the handling contract described on the schema — a field-level read
 * check against the reader's capability for that specific record, encryption in
 * transit and at rest, redaction everywhere an identifier belongs instead, and a
 * stated retention period with a deletion path.
 *
 * A value typed as this has passed the compiler and says nothing about having
 * passed the schema, which is where an address is trimmed, bounded and parsed.
 * Note also which shape this appears on and which it does not: the full profile
 * carries an address, the compact summary deliberately does not.
 */
export type EmailAddress = z.infer<typeof emailAddressSchema>;

/**
 * A person's full name.
 *
 * A distinct value from the display name rather than a formatting of it — the
 * two are rendered side by side on a member row and on a mention typeahead row,
 * so two values are stored. Required and non-blank wherever it appears: the
 * minimum is applied after trimming, so a run of spaces is rejected rather than
 * stored as a name.
 */
export type FullName = z.infer<typeof fullNameSchema>;

/**
 * A person's display name — the name rendered first.
 *
 * The same underlying value type on both shapes, reached differently on each,
 * and the difference is deliberate. On the compact summary the display name is
 * always present because the server resolves the fallback from the full name
 * once, at read time, so no consumer re-implements that decision and two
 * surfaces cannot disagree about what a person is called. On the full profile it
 * is nullable, because the profile reports what was actually stored and that is
 * what makes the absence visible and editable.
 */
export type DisplayName = z.infer<typeof displayNameSchema>;

/**
 * A named time-zone identifier — never an offset.
 *
 * The schema requires an identifier that begins with a letter and that this
 * runtime recognises, so a UTC offset cannot satisfy it at all. That distinction
 * is stored rather than derived because a scheduled send is interpreted in a
 * named zone: an offset is only correct until the zone's rules next change, and
 * a delivery scheduled across that boundary would fire an hour out. The local
 * time rendered beside a person is derived from this value at render time and is
 * not a field of anything — a stored local time would be wrong within the hour.
 *
 * NAMED `PersonTimeZone` DELIBERATELY, rather than by the mechanical name the
 * rest of this module follows. The viewer-preference contract already owns a
 * type called `TimeZone` for its own separately-declared zone schema, and the
 * package barrel flattens every module into one namespace, so the shorter name
 * would be a collision in a file neither module owns. The prefix records whose
 * zone this is: the person's own, the one a scheduled send is interpreted in.
 */
export type PersonTimeZone = z.infer<typeof timeZoneSchema>;

/**
 * The storage reference for a profile photo.
 *
 * A REFERENCE to a stored object and never the image. Bytes are transferred
 * straight to object storage by pre-signed upload, so they never transit this
 * contract; the square crop the photo is stored from is a property of what was
 * uploaded and is enforced where the upload is completed, not here.
 *
 * The schema makes the wrong value structurally impossible rather than merely
 * discouraged: the permitted character class admits no colon, semicolon or
 * comma, so a data URL cannot be expressed, and it rejects a parent-directory
 * sequence, so a reference cannot be aimed at bytes its uploader was never
 * given. A type expresses none of that, which is why a reference that arrived
 * from a caller is parsed before it is used.
 *
 * Absence is a legitimate value on both shapes — the photo is explicitly
 * optional — and a consumer renders an initial-derived avatar instead.
 */
export type AvatarObjectKey = z.infer<typeof avatarObjectKeySchema>;

/**
 * The absolute instant a guest's access ends, or `null` where it does not end.
 *
 * AN INSTANT, NEVER A DURATION. The schema admits only a UTC-designated ISO 8601
 * instant, so a number of days, a remaining duration or a bare calendar date
 * cannot parse — which is what allows the configured default to change later
 * without invalidating a record already stored. `null` is the control's own
 * default and means no limit.
 *
 * There is deliberately no "days remaining" type here and there must not be one.
 * A remainder is derived for display from this instant by `../util/time.js` at
 * the moment it is rendered; naming it as a type would invite it to be stored,
 * and a stored remainder is wrong by tomorrow.
 *
 * This clock is one of three and must not be collapsed into the others: an
 * invitation link's expiry is a property of a shareable link, the external
 * acceptance window belongs to the external-collaboration entity, and this one
 * is a property of an account. Three clocks, three owners.
 */
export type GuestAccessEndsAt = z.infer<typeof guestAccessEndsAtSchema>;

/* -------------------------------------------------------------------------- */
/* One narrowing over the role vocabulary                                     */
/* -------------------------------------------------------------------------- */

/**
 * The workspace roles that are a guest.
 *
 * Extracted from the role union by the naming convention the schema itself uses,
 * so it is derived rather than a second enumeration of the same vocabulary: a
 * guest variant added to the schema is included here without this line changing,
 * and one removed disappears from it. Listing the members again — even correctly
 * — would be the restatement this module exists to avoid.
 *
 * It is worth naming because the guest is the role the rest of the person
 * contract actually branches on. A guest is the only role whose badge the corpus
 * evidences rendering beside a name (frame 120), the guest end instant is
 * meaningful for a guest and for nobody else, and the two guest variants are
 * materially different accounts rather than one with a flag — a guest permitted
 * more than one channel is not the same account as a guest confined to one
 * (frame 50), which is also why the billing classification is not a simple
 * function of the role and is not modelled on a person at all.
 *
 * Still descriptive, like the union it narrows. It renders a badge and decides
 * nothing; every mutation is authorized server-side against the acting session
 * and the specific target object, whatever this value says.
 */
export type GuestWorkspaceRole = Extract<z.infer<typeof workspaceRoleSchema>, `guest_${string}`>;
