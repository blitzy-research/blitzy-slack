# Security contracts and how each one is discharged

Sixteen obligations in the read-only specification are security contracts, and this
build treats them as **acceptance criteria rather than advice**. That framing is the
specification's own: the contracts are defined there as checkable requirements, and
being checkable is precisely "what lets them appear as acceptance criteria"
(`00-product-overview.md` L477).

A criterion nobody can locate is not a criterion. This record therefore exists to make
one journey short: from a contract identifier to the file that discharges it, without
guessing, and with the contract's status stated honestly enough that a reviewer can
tell a built mechanism from a written intention.

| Field                               | Value                                                                                                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record — the security-contract register                                                                                                                        |
| Status                              | Operative                                                                                                                                                               |
| Contracts registered                | **Sixteen.** The closed set, verified at source: every `S-*` cited anywhere in the specification resolves to one of them (`README.md` L1182)                            |
| Where they are defined              | `00-product-overview.md` L473–L614 — **once, authoritatively.** No area document restates one, and neither does this record                                             |
| Where they are rolled up            | `README.md` L376–L399 — a roll-up, not a definition (`README.md` L378)                                                                                                  |
| Status values used                  | Three: implemented in Phase 1 · mechanism only, surface deferred · documented, not implemented                                                                          |
| Frames opened to author this record | **0** — every fact below was resolved from specification prose                                                                                                          |
| Companion records                   | `docs/decisions/role-matrix.md`, `docs/decisions/data-model.md`, `docs/decisions/gap-register.md`, `docs/decisions/catalog-defects.md`, `docs/decisions/ac-manifest.md` |

## The doctrine that runs through all sixteen

Two sentences carry more of this register than any single contract does, and both are
stated by the operation contract itself (`00-product-overview.md` L502).

**Presentation is not enforcement.** Removing a control, hiding it, disabling it,
greying it, badging it or never rendering it at all is a decision about pixels. None of
those decisions refuses a request. A control that was hidden must still be refused when
its request arrives, because the request does not carry the rendering that omitted it —
so a build that gates only in the client is to be read as a build with no gate.

**A precondition is not a grant.** Where the specification records that a surface was
reachable, it records what a capture showed and says nothing whatever about who may
act. Reachability, an unmet field requirement, a disabled submit control and an
incomplete wizard step are all preconditions. Each of them can be satisfied without any
authorization question having been asked, let alone answered.

The distinction has an observed counterpart, which is why it is worth stating rather
than assuming. The specification separates **four** presentations that look alike and
mean different things: permission-denied is a device capability the product cannot
grant itself, role-gated is a control the signed-in role may not use, upgrade-gated is a
capability the workspace's plan does not include, and disabled is a control whose own
precondition is unmet (`21-states.md` L111). All four render differently and all four
are observed. A build that merges them cannot reproduce what the captures show — and,
worse for this register, it invites the reader to treat one rendering as evidence of
another's check.

The evidenced role gating makes the doctrine unusually concrete: it **hides nothing and
disables nothing.** The gated control sits inside a bordered container whose inset
caption names the role that can act, and the control inside renders in its ordinary
state (`21-states.md` L137, L276, frame 75). A rendering that leaves the control usable
is the clearest possible demonstration that the rendering was never the boundary. The
server is.

## How this record cites, and what it deliberately does not repeat

A document citation names a file under `docs/workflows/` together with its line number,
so `README.md` below is the specification index in that directory and never the one at
the repository root. A frame is cited by **bare number**. Project rules are cited by
what they govern and where they sit in the provided order rather than by their platform
identifiers, for the reason given under
[Authoring conventions](#authoring-conventions-observed-by-this-record).

Four things this record points at rather than restates, because a second copy of any of
them is a second thing to keep true:

- **The definitions themselves.** Each contract is defined once in
  `00-product-overview.md`, and the specification's own instruction is that documents
  reference it **by identifier only** and that nothing restates it (`README.md` L378).
  This record honours that: it states what a contract governs only as far as is needed
  to say where the obligation lands, and it points at the definition for the rest.
- **The capability model.** The roles, the operations and the cell where they meet live
  in `docs/decisions/role-matrix.md`. No role name and no capability assignment is
  reproduced here.
- **The schema's reasons.** The per-viewer relations, the four credential tables, the
  consent table, the audit log and the isolation chokepoint are explained in
  `docs/decisions/data-model.md`. This record names them and points there.
- **The gap decisions.** Every gap actually decided — its marker, the options weighed,
  the choice and the reasoning — lives in `docs/decisions/gap-register.md`. This record
  states what the gap contract requires of a decision, not which decisions were taken.

## Status vocabulary, and what a status is not

Exactly three values are used, and each means something narrower than it might appear.

| Status                               | What it asserts                                                                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Implemented in Phase 1**           | The mechanism is built in this run, and every surface Phase 1 opens that the contract governs sits behind it. A named test exercises it                                                                       |
| **Mechanism only, surface deferred** | The cross-cutting mechanism is built in this run, but the canonical surface the contract governs belongs to a deferred area — so the mechanism has fewer callers today than the contract will eventually have |
| **Documented, not implemented**      | No code in this run discharges it. The obligation is recorded here in full, with the reason it is not built, so that it is carried rather than lost                                                           |

**A status is a statement about where an obligation is discharged, not a claim that a
test has been observed to pass.** The distinction is required by the uncertainty rule —
the fourth of the five project rules as provided — which forbids marking an acceptance
criterion satisfied without a passing test behind it. Satisfaction is therefore claimed
in exactly one place, `docs/decisions/ac-manifest.md`, where a criterion is recorded
against the test that proves it and its state is the test's state. Nothing in this
register may be read as that claim. Each subsection below names the test that must pass;
none of them asserts that it has.

Three contracts have parts that outrun their row, and a single-valued column cannot say
so. They are named here so the table is not read as more than it is. `S-SECRET` is
implemented for the credential classes that have a Phase-1 artefact and has **no**
Phase-1 artefact at all in its third class. `S-CONSENT` governs the one capture path
Phase 1 opens while its other paths are deferred. `S-GAP` is a standing obligation that
never closes, so its row records that the mechanism is running rather than that the work
is finished.

## The register

Sixteen rows, in the order the roll-up lists them (`README.md` L384–L399).

| Contract       | Subject                                                        | Status                           | Discharged in                                                      |
| -------------- | -------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------ |
| `S-AUTHZ-OP`   | Operation authorization, per object, at the point of execution | Implemented in Phase 1           | `apps/api/src/authz/guard.ts`                                      |
| `S-AUTHZ-READ` | Read-path and projection authorization                         | Implemented in Phase 1           | `apps/api/src/authz/projection-guard.ts`                           |
| `S-UPLOAD`     | Untrusted upload and document rendering                        | Mechanism only, surface deferred | `apps/api/src/storage/presign.ts`                                  |
| `S-CONTENT`    | Stored-content input and output contract                       | Implemented in Phase 1           | `packages/shared/src/schemas/content.ts`                           |
| `S-LINK`       | Outbound navigation and URL safety                             | Implemented in Phase 1           | `apps/api/src/links/canonicalize.ts`                               |
| `S-SECRET`     | Credential, code, session and token handling, in three classes | Implemented in Phase 1           | `apps/api/src/secrets/password.ts`                                 |
| `S-PII`        | Personal and private contact data                              | Mechanism only, surface deferred | `apps/api/src/authz/projection-guard.ts`                           |
| `S-PERUSER`    | Per-viewer state versus shared state                           | Implemented in Phase 1           | `packages/db/prisma/schema.prisma`                                 |
| `S-EXPORT`     | Export and bulk-data contract                                  | Documented, not implemented      | `docs/decisions/security-contracts.md`                             |
| `S-CONSENT`    | Device capture and the records a capture produces              | Mechanism only, surface deferred | `packages/ui/src/components/PermissionPrompt/PermissionPrompt.tsx` |
| `S-MARKETING`  | Marketing and communication consent                            | Implemented in Phase 1           | `packages/db/prisma/schema.prisma`                                 |
| `S-TELEMETRY`  | Diagnostic, feedback and product telemetry payloads            | Mechanism only, surface deferred | `apps/api/src/observability/logger.ts`                             |
| `S-RETENTION`  | Retention and deletion of stored product data                  | Documented, not implemented      | `docs/decisions/security-contracts.md`                             |
| `S-PAYMENT`    | Payment-instrument collection and handling                     | Documented, not implemented      | `docs/decisions/security-contracts.md`                             |
| `S-APPGRANT`   | Third-party integration grant and lifecycle                    | Documented, not implemented      | `docs/decisions/security-contracts.md`                             |
| `S-GAP`        | A named gap becomes a build obligation                         | Implemented in Phase 1           | `docs/decisions/gap-register.md`                                   |

The `Discharged in` column names **one** file — the place a reviewer should open first.
Every contract below names the rest of its surface. Where the column names this record,
that is the honest answer rather than a placeholder: the obligation is discharged as
writing, because nothing in this run's scope executes it.

## `S-AUTHZ-OP` — operation authorization

**What it governs.** Who may perform an action: every write, every state change, every
destructive action, every grant of access, every installation, every publish and every
export (`00-product-overview.md` L483, L502).

**How this build discharges it.** Every mutation passes through one server-side check,
evaluated at the point of execution against the acting session and the **specific target
object** — never against a surface, a route, a rendering or a class of object. Four
files carry it and they are deliberately small:

| File                           | Responsibility                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `apps/api/src/authz/roles.ts`  | The account types, enumerated once                                                                   |
| `apps/api/src/authz/matrix.ts` | The authored capability matrix, whose reasoning lives in `docs/decisions/role-matrix.md`             |
| `apps/api/src/authz/policy.ts` | One policy per operation, taking the acting session and the target object and returning a decision   |
| `apps/api/src/authz/guard.ts`  | **The chokepoint.** The single call every handler passes through, over an exhaustive operation union |

Two properties make the chokepoint more than a convention. First, it is the only path:
handlers do not decide, they ask, so the set of authorization decisions in this build is
enumerable and therefore testable. Second, its operation union is **exhaustive**, so
adding a model or an operation without a policy is a **compile error** rather than an
unguarded route waiting to be noticed in review. That is the difference between an
authorization rule and an authorization mechanism — a rule is satisfied by every call
site that remembers, a mechanism by construction.

Denials are not silent. Every refusal emits a structured record through
`apps/api/src/observability/audit-log.ts`, carrying the acting session and account, the
operation by the same identifier the guard uses, the target object by type and
identifier, and the failing policy with the capability it required. A denial is the one
event nothing else records: the request changed no state and returned no content, so
without the record it leaves no trace and a pattern of probing is invisible. Errors
carrying that context are typed in `apps/api/src/authz/errors.ts`.

No authorization decision reads a workspace or actor identifier supplied by the caller.
The workspace is bound from the authenticated session by `apps/api/src/db/tenancy.ts`,
and the acting account comes from the session record; no route, body, query parameter,
header or socket frame can contribute either. The prohibition is honoured by the value
never being readable from a request in the first place, which is the only form of it
that does not depend on review.

**Proof.** `apps/api/test/integration/authz/**` asserts, for every mutation, that a
non-member **and** a wrong-role caller receive a server-side denial. The wrong-role half
of that pair is only writable because `docs/decisions/role-matrix.md` defines the roles
and what each may do — without an authored matrix there is no such thing as a wrong
role, so the matrix is a **precondition** for the denial suite rather than a byproduct
of it. The specification names no role, no permission scope and no capability beyond four
observed facts and invents none (`00-product-overview.md` L504), which is exactly why the
matrix had to be authored.

**Status: implemented in Phase 1.**

## `S-AUTHZ-READ` — read-path and projection authorization

**What it governs.** Whose data may be rendered — every list, count, facet, preview,
aggregation, cross-conversation projection and resolved link
(`00-product-overview.md` L484, L508).

**Three observations do most of the work**, and they are the specification's own
(`README.md` L385, `00-product-overview.md` L512):

- **A count is a projection.** A total, a badge or a per-type tab count computed over
  content the viewer may not read discloses that the content exists. No body text
  appears and the disclosure is complete.
- **A link is a projection at resolution time.** An address that has been copied,
  shared or forwarded is re-authorized when it is followed, against the follower's
  current authorization — so an address that escaped its audience grants nothing, and
  revocation actually revokes.
- **A notification is a projection that leaves the product.** Once a payload has gone,
  no later check can reach it, so it carries the minimum needed to route the recipient
  and never content the recipient may not read.

**How this build discharges it.** Two mechanisms, at two different depths.

The read-side guard, `apps/api/src/authz/projection-guard.ts`, authorizes each
projection **independently**. The authorization rule — the second of the five project
rules as provided — enumerates them, and this build reads that enumeration as **eight**
projections:

| #   | Projection               | Where it leaves the product                                 |
| --- | ------------------------ | ----------------------------------------------------------- |
| 1   | Counts                   | Unread badges, member counts, per-type tab counts, totals   |
| 2   | Search results           | The result list and its facets                              |
| 3   | Link previews            | Preview text and metadata rendered beside an address        |
| 4   | Link resolution          | Following a product address to the object behind it         |
| 5   | Member lists             | The members tab and every member enumeration                |
| 6   | Facepiles                | The bounded avatar row in a conversation header             |
| 7   | Autocomplete suggestions | Mention and command typeahead rows                          |
| 8   | Notifications            | Any payload dispatched outside the request that produced it |

Each is a separate leak with a separate exit, which is why one check cannot cover them:
a count leaves as a number, a link preview leaves as copied text, a facepile leaves as a
cached list and a notification leaves as a message. They are grouped rather than
scattered so the set stays enumerable, exactly as the mutation chokepoint is.

Beneath all of them sits workspace isolation, and it sits **below every caller** rather
than at each call site. `packages/db/src/tenancy.ts` is a database-client extension
spanning all models and all operations, injecting the workspace predicate into every
one; a service that forgets it does not get an unfiltered client, it gets no client at
all. `apps/api/src/db/tenancy.ts` binds it to the authenticated session, which is what
keeps the workspace identifier server-derived. The schema's part in this — the
non-nullable workspace key on every tenant row, including join tables and per-viewer
relations, and the shapes that make each projection authorizable at all — is explained in
`docs/decisions/data-model.md` and is not repeated here.

Two consequences of the contract bind the read path as much as the predicate does.
**Deny by default:** a read path that cannot resolve the viewer's authorization for the
containing object returns nothing, rather than returning the object and leaving the
decision to a later layer. **A cache is a read path:** every cache, index, materialised
aggregate and precomputed count is keyed by tenant and by viewer authorization scope,
never by object identity alone (`00-product-overview.md` L510). Filtering after the fact
is not authorization — narrowing a result set in a client, a template or a serialiser
hook leaves the data in the response.

**The realtime corollary, stated because it is easy to miss.** A projection leaving over
a socket is still a projection. Authorization is therefore applied when a client
subscribes, in `apps/api/src/realtime/subscribe.ts`, and **re-checked on fan-out** in
`apps/api/src/realtime/fanout.ts` — because a subscription is a standing claim and
authorization can be withdrawn while it stands. Replay over
`apps/api/src/realtime/replay.ts` is a read path too, and is authorized as one.

**Proof.** `apps/api/test/integration/projections/**` asserts that a private resource is
absent from all eight projections above, and `apps/api/test/integration/tenancy/**`
proves cross-workspace reads return nothing, using **two seeded workspaces** — one
workspace cannot demonstrate isolation. Cross-instance delivery is exercised with two
running instances in `apps/api/test/integration/realtime/**`.

**Status: implemented in Phase 1.**

## `S-UPLOAD` — untrusted upload and document rendering

**What it governs.** Every path by which a user-supplied file enters the product and is
processed, stored or previewed (`00-product-overview.md` L485, L518). The requirements
are server-side and independent of anything a client sent: type determination from
content rather than from a filename, an allowlist of accepted types with active-content
formats rejected rather than sanitised, a hard byte bound and a **separate** bound on
decoded dimensions and decompressed size, scanning before the file is stored or served,
safe re-encoding that discards embedded metadata, rendering in an isolated and
network-denied context, serving from an origin that cannot script the application, and an
explicit rejection state for every refusal reason.

**How this build discharges it.** The structural half ships now. Uploads are
**pre-signed**: `apps/api/src/storage/presign.ts` issues a credential scoped to one
object and `apps/api/src/storage/s3.ts` holds the client, so file bytes never transit the
API at all. That is worth more than it first appears — a byte stream that never reaches
the application cannot exploit the application's parsers, cannot be logged by accident and
cannot consume the request path's memory. The rejection state is presented with the
inline-validation and banner contracts rather than invented, and the upload origin is kept
distinct from the application origin by the content-security policy described under
[the added controls](#controls-this-build-adds-beyond-the-sixteen).

**Why the status is not "implemented".** The contract's other half is **document
rendering**, and its canonical instance is the files and media area — the largest of the
four upload paths and the one whose first-page preview makes rendering mandatory
(`00-product-overview.md` L520). That area is deferred, so no rendering, thumbnailing or
preview pipeline exists in this run to isolate. Scanning and safe re-encoding likewise
belong with the pipeline that would perform them. Phase 1's own upload path — the
composer attachment — is served by the pre-signed mechanism and is not previewed
in-product. The remaining requirements are recorded here so the deferral is a decision
rather than an omission.

The specification shows uploads succeeding and never shows one being refused, a scan
running, a size limit being reached or a preview failing (`00-product-overview.md` L522).
The rejection **rendering** is therefore a gap decision under `S-GAP`; the **enforcement**
is required whether or not a capture existed.

**Proof.** The pre-signed path is exercised in `apps/api/test/integration/**` for the
Phase-1 attachment flow. The rendering requirements have no test in this run because they
have no code, and `docs/decisions/ac-manifest.md` records that state rather than a pass.

**Status: mechanism only, surface deferred.**

## `S-CONTENT` — stored-content input and output contract

**What it governs.** Every field whose value one principal authors and another reads
(`00-product-overview.md` L486, L526): a length bound per field, Unicode normalisation,
rejection or neutralisation of control and bidirectional-override characters, and
encoding appropriate to the destination context — text, attribute, URL or style — applied
at **render** time rather than at storage time, so one stored value is safe everywhere it
appears.

**How this build discharges it.** Rich text is stored as a **structured document of an
allowlisted node and mark vocabulary, never as markup to be re-parsed**, and any node
outside the allowlist is dropped rather than passed through. The allowlist is the
editor's registered-node set — the vocabulary the composer can actually produce — and it
is expressed as a discriminated union in
`packages/shared/src/schemas/content.ts` so that one definition serves the client, the
server and the generated API specification.

The decisive property is that **the server never trusts the client's serialisation.**
The editor's allowlist governs what the composer can author; it says nothing about what
an arbitrary request body contains. `apps/api/src/content/validate.ts` therefore
re-validates every submitted document against
`apps/api/src/content/allowlist.ts` independently, before persistence, and rejects rather
than repairs. Output encoding is per sink in `apps/api/src/content/render.ts`.

**Match highlighting is a distinct sink and gets its own file**, because both of its
inputs are untrusted: the term is typed by the viewer and the surrounding text is
authored by somebody else (`00-product-overview.md` L528).
`apps/api/src/content/highlight.ts` encodes both sides **before** any highlight markup is
inserted, never after; matches literally rather than by pattern, so a term cannot be
interpreted as an expression or made to backtrack catastrophically; and bounds the term's
length before matching.

**Proof.** `apps/api/test/integration/messaging/**` submits a script-injection payload in
every text field and asserts the encoding, and asserts that a document carrying a node
outside the allowlist is refused rather than stripped and stored. A message carrying
unicode, emoji, right-to-left text and four thousand characters is asserted in the same
suite, because bidirectional-override handling and length bounds are the same contract.

**Status: implemented in Phase 1.**

## `S-LINK` — outbound navigation and URL safety

**What it governs.** Every user-supplied or app-supplied address the product stores,
renders clickable or navigates to (`00-product-overview.md` L487, L536).

**How this build discharges it.** `apps/api/src/links/canonicalize.ts` parses an address
**canonically before it is stored, rendered or followed**, and
`apps/api/src/links/allowlist.ts` accepts **two schemes and no others**. Schemes that
execute or read local state are rejected **at input** rather than merely avoided at
render, because a value that was never stored cannot be rendered by a sink that forgot.
The rendered label and the destination are treated as two independent untrusted values,
so a label cannot misrepresent where a link goes, and the label is encoded under
`S-CONTENT` like any other authored text. Every departing link is opened **without an
opener reference and without a referring address**, so a destination page can neither
manipulate the tab that opened it nor learn the internal address it came from. A link
that resolves to product content is re-authorized on resolution, which is projection
four in the read contract above.

**The subtlety worth carrying.** The specification marks some departures with a glyph,
and where it does, that is an observation about a rendering and nothing more. The glyph's
**presence** evidences only that the product marked that entry as leaving; it does not
establish where the entry goes, nor that the destination is outside the trust boundary.
Its **absence evidences nothing at all** (`00-product-overview.md` L538, frame 567).
**The glyph is not the security boundary** — the scheme allowlist and the resolution-time
re-authorization are. A build that treated the marker as the check would have a decoration
where its defence should be.

**Proof.** `apps/api/test/integration/messaging/**` submits a script-scheme address to the
link editor and asserts rejection at input, and asserts that a stored link renders with
neither an opener reference nor a referring address.

**Status: implemented in Phase 1.**

## `S-SECRET` — credential, code, session and token handling

**What it governs.** Credential, code, session and token handling in **three classes with
three lifecycles, because one rule does not fit them all** — and the specification is
explicit that applying a single rule to all of them is itself a defect
(`00-product-overview.md` L488, L542). Each artefact belongs to exactly one class, and a
rule stated for one class does not bind another.

Three properties bind all three classes without exception: a secret is never written to a
log, an error report, an analytics event, a cache key, a telemetry payload or a support
history; a secret is never returned by a read path and never included in an export; and
"opaque and high-entropy" describes how a value is generated rather than licensing the
product to keep it (`00-product-overview.md` L542).

**Class A — inbound verifier-only.** A value a principal presents _to_ this product so the
product can prove them: a password, a one-time code, a promotional code, a
device-enrolment code, and a session artefact (`00-product-overview.md` L544).

**The consequence for the model, which is the part most likely to be got wrong.** No
verifier is **ever a column on the user record** — on the account entity, or on any other
entity a read path returns — and no secret of any class is a field of one. That is not a preference — one lifecycle cannot be
expressed as one column, so there are **four separate lifecycle-bearing tables**: a
password verifier that is replaced rather than expired, a one-time code that dies on first
use, a device-enrolment code scoped to one device and revoked in bulk when its grant is
withdrawn, and a session that is individually and collectively revocable and invalidated
on credential change. The tables, their columns and the reasoning are set out in
`docs/decisions/data-model.md` and not repeated here.

| Module                                   | Artefact and lifecycle                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `apps/api/src/secrets/password.ts`       | Standing credential. Verifier only, per-record salt, replaced rather than expired        |
| `apps/api/src/secrets/otp.ts`            | Single-use short code. Absolute expiry resolved at issuance, invalidated on use          |
| `apps/api/src/secrets/enrolment-code.ts` | Single-use, scoped to the narrowest object it needs, revoked in bulk with its grant      |
| `apps/api/src/secrets/session-store.ts`  | Server-side revocable record behind an opaque cookie, with an idle and an absolute bound |

Password verifiers use Argon2id, and its memory, time cost and degree of parallelism are
**compile-time invariants** in `packages/shared/src/config/constants.ts` rather than
environment-overridable defaults, because a verifier parameter is a security floor and an
override is a downgrade path — a distinction recorded in
`docs/decisions/observed-values.md`. The parameters are **stored alongside each hash**, and
that is what keeps the upgrade path open: a successful authentication can detect that its
row is behind, recompute a verifier from the value the person has just presented, and
replace the row. Without the parameters on the row there is nothing to compare against and
the only remaining upgrade is to invalidate every password at once.

Two further requirements are easy to lose and are stated explicitly. **A password-strength
value is transient**: it is computed while a password is being chosen and is never
persisted beside the verifier and never transmitted — it is a hint to a person, not a fact
about an account. And **short-code acceptance is server-bounded, rate-limited and
single-use**: attempt counts are enforced on the server, the code is invalidated on use and
on replacement, and no artefact of this class is ever placed in a URL or displayed in full.

**Class B — reusable capability links.** Phase 1 has exactly one: the workspace invitation.
Class A's never-in-a-URL and single-use rules deliberately **do not** apply to it — a link
that may not travel in a URL cannot be a link (`00-product-overview.md` L546). Its own
contract instead: a high-entropy value split into a non-secret lookup selector and a secret
part, with only a keyed verifier of the secret part stored; scoped to one capability and one
object; an expiry resolved at issuance and enforced server-side; and revocable individually
and in bulk. Redemption is an authorization event rather than a lookup — the selector
resolves the record, the verifier is compared in constant time, expiry and revocation state
are re-checked, and the capability is granted under `S-AUTHZ-OP` rather than inherited from
whoever issued it. `apps/api/src/services/invitation.ts` is the **single** enforcement point
for the lifetime, reading one shared constant; the chosen default and the specification's
two conflicting readings are recorded in `docs/decisions/observed-values.md` and
`docs/decisions/catalog-defects.md`.

**Class C — outbound presentable secrets.** A value this product must itself present to a
third party, so a verifier is the wrong technique and containment replaces one-wayness
(`00-product-overview.md` L548). **Phase 1 has no class-C artefact at all**, because both of
them — per-install integration credentials and the payment provider token — belong to
deferred areas. The requirements are recorded under `S-APPGRANT` and `S-PAYMENT` below so
that the absence is a deferral rather than a gap. The two permitted references from a
returned entity remain a class-B selector and a class-C opaque record identifier, neither of
which is the secret (`00-product-overview.md` L550).

**Proof.** `apps/api/test/integration/auth/**` asserts that no read path returns verifier
material, that a one-time code is refused on second use and after its absolute expiry, that
attempt limits are enforced server-side, and that a password change invalidates the
account's sessions. `apps/api/test/integration/authz/**` asserts that redemption is
authorized rather than inherited.

**Status: implemented in Phase 1.** Classes A and B are built and exercised; class C has no
Phase-1 artefact, as stated above.

## `S-PII` — personal and private contact data

**What it governs.** Every field that identifies a person or reaches them directly
(`00-product-overview.md` L489, L558). Personal data is explicitly **not** a secret and must
not be handled as one: a verifier would make a contact record useless, because a reply has
to reach the address that was typed, and a sealed secret store would make it unqueryable,
because a directory has to be searched and listed. Six requirements bind — minimisation,
purpose limitation and consent, field-level authorization, encryption in transit and at
rest, redaction, and retention with a working deletion path.

**The modelling consequence, stated rather than only the principle.** A public marketing
address and a workspace member are **different populations**, and they are never merged into
one record. So this is a schema fact, not a policy sentence: the public submission structure
carries **no account reference and no entity identifier at all**, there is no join between
the two populations for a query to follow, and an address collected from a public form
therefore cannot become a route into the product. Merging them would be a single foreign key
whose existence no reviewer could later argue away — which is precisely why the separation is
expressed as the absence of that key. `docs/decisions/data-model.md` carries the placement.

**How this build discharges it.** Field-level authorization runs through
`apps/api/src/authz/projection-guard.ts`: a personal field is read against the reader's
capability for **that specific record**, never merely because the enclosing surface loaded,
and a list or count over such records is projected the same way. Redaction is enforced at the
logger, described under `S-TELEMETRY` below. Personal values are referenced by opaque record
identifier wherever a reference will do. A personal value rendered back into a page is stored
content in the sense of `S-CONTENT` and is encoded on output like any other.

**Why the status is not "implemented".** The surfaces this contract's evidence comes from are
public lead-capture, support and subscribe forms, and a confirmation surface that interpolates
submitted values back into rendered copy (`00-product-overview.md` L560) — all of which belong
to the deferred public and commercial area, of which this run builds only a minimal
unauthenticated landing route. So the mechanism has few callers today: Phase 1's personal data
is the member's own profile and the addresses an invitation reaches. Two of the six
requirements are also not fully running — a stated retention period with a deletion path is
carried under `S-RETENTION`, and at-rest encryption of individual personal fields is a
deployment property of the datastore rather than something this run's code asserts. Recording
both is what keeps the row honest.

**Proof.** `apps/api/test/integration/projections/**` asserts that a member's personal fields
are absent from projections a non-member can reach.

**Status: mechanism only, surface deferred.**

## `S-PERUSER` — per-viewer state versus shared state

**What it governs.** Which entity a field belongs on when its value differs per viewer
(`00-product-overview.md` L490, L564). The test is one question: _if two people opened this at
the same moment, could they legitimately see different values?_ If yes, the field belongs on a
relation keyed by the pair and never on the object itself.

**Why it is in a security register at all**, rather than in a note about normalisation. Put a
per-viewer fact on the shared object and it stops being personal in two distinct ways. The
loud way is that one person's action acts for everybody — one person's reading marks the
conversation read for every member, so a colleague who has not opened it loses the boundary
that told them where they were. The quiet way is worse: **on a shared object, one person's flag
discloses that person's behaviour to everyone else who can read it.** A save says what someone
chose to keep, a read marker says when they last looked and, by its absence, that they have
not, and a notification scope says how closely they are following their colleagues. None of
that was ever offered to the other members, none of it looks like a leak, and every one of
those facts leaves through a projection that was authorized for the **object** and never for
the behaviour recorded on it.

**How this build discharges it.** The placement is applied by the relation table:
`packages/db/prisma/schema.prisma` carries the per-viewer relations, and all of them are
created in the data layer **before any feature writes to them**, so no feature ever meets a
missing relation and puts its field on the shared object instead. The ten relations, what moves
onto each, the one member-facing setting that deliberately does **not** move, and the
ten-versus-eleven count carried with neither reading asserted are all set out in
`docs/decisions/data-model.md`; none of it is reproduced here.

A single capture can never distinguish the two placements, because one session shows one
viewer's values and both models render identically to that viewer
(`00-product-overview.md` L566). Where the evidence is structurally incapable of deciding, the
placement is decided by consequence — and the consequence of guessing the other way is a
disclosure.

**Proof.** `packages/db/test/tenancy.test.ts` and
`apps/api/test/integration/projections/**` assert that one viewer's per-viewer state is neither
readable by nor mutated for another.

**Status: implemented in Phase 1.**

## `S-EXPORT` — export and bulk-data contract

**What it governs.** Every affordance that removes data from the product in bulk
(`00-product-overview.md` L491, L570). An export is **an operation in its own right**,
authorized against the acting principal rather than inherited from the surface that offers it,
and scoped to the exporter's authorized set rather than to the workspace. It additionally
requires an audit record and a notification to responsible accounts, server-enforced rate
limiting on the export **and** on any filter or search that could enumerate the same data a
page at a time, minimisation, an **aggregation floor** so a statistic over a small population is
withheld rather than published as an effectively personal figure, and encryption of the produced
artefact with access only through a per-artefact expiring revocable credential.

**The requirement recorded precisely so it is not lost.** Values a spreadsheet application
would interpret as an expression are neutralised by **one tested algorithm applied to every
exported cell without exception**, and the order of its two steps is load-bearing. Each cell
value is **first canonicalised** — Unicode-normalised, with leading whitespace, control
characters, zero-width characters and bidirectional-override characters removed — and **then**
tested; if what remains begins with an equals, plus, minus, at, tab, carriage return or line
feed, the cell is **forced to text**, by prefixing a single apostrophe or, in a format with no
text-forcing prefix, by writing the value through that format's explicit text-typed cell.
Delimiter and quote characters inside the value are escaped separately, according to the file
format.

Two clarifications the specification insists on, because both are ways of appearing to comply.
**Ordinary field quoting is not a defence and must not be offered as an alternative one**: a
spreadsheet strips a quoted field's surrounding quotes and then evaluates what was inside, so a
quoted expression executes exactly as an unquoted one does. And **canonicalising before the test
is equally load-bearing**: a leading space, tab or zero-width character in front of the operator
defeats a test applied to the raw value while the spreadsheet still evaluates the formula. The
implementation is tested against the receiving applications — asserted on the produced file, for
each of those leading characters and for each of them behind a leading space or zero-width
character.

**Why the status is documented.** No export affordance ships in this run: exports belong to the
administration and files areas, both deferred, so there is no bulk path to authorize, rate-limit
or neutralise. The requirement is written out above at full precision rather than summarised,
because a summary of it would lose the two clarifications, and those clarifications are where a
future implementation is most likely to go wrong.

**Status: documented, not implemented.** Reason: its surface belongs to a deferred area.

## `S-CONSENT` — device capture and the records a capture produces

**What it governs — and this contract is narrow, which is the point.** `S-CONSENT` governs
**device capture only**: activating a camera, a microphone or a screen capture, and the
lifecycle of anything a capture is turned into (`00-product-overview.md` L492, L576).

**It is not the general privacy contract, and conflating it with the marketing contract is the
common error.** The specification separates four privacy classes deliberately: device capture is
this contract, marketing and communication consent is `S-MARKETING`, telemetry payloads are
`S-TELEMETRY`, retention is `S-RETENTION`, and personal data itself is `S-PII`. A device-capture
rule cited for a marketing tick box leaves the requirement the tick box actually needed
unstated while appearing to cover it (`00-product-overview.md` L576) — the appearance is the
danger, not the omission.

**How this build discharges it.** Capture becomes active **only after the person has acted to
activate it for that purpose**, never as a side effect of opening a surface that previews it,
and a **persistent, unambiguous indicator** of what is being captured renders while a capture is
live. A sample taken to drive a level meter or preview a device is **used transiently and
discarded** — never persisted, never transmitted beyond what the check requires, never retained
after the surface closes. Phase 1 opens exactly one capture path, the composer's recorded audio
clip, and it is governed in `apps/web/src/features/composer`, presenting device denial through
`packages/ui/src/components/PermissionPrompt` and playback through
`packages/ui/src/components/MediaPlayer`. A device denial always names a remedy **outside** the
product and offers no in-product control, because enabling a device capability is not something
the product can do for itself (`21-states.md` L274).

Where a capture is deliberately turned into content it acquires an explicit lifecycle: a stated
storage scope, encryption at rest, a retention bound, deletion when the draft or record is
discarded, notification to every participant that the record is being made, and a deletion path
afterwards. The clip's bytes travel by the pre-signed path under `S-UPLOAD`.

**The separate-store rule, carried even though its surface is deferred.** A **speech-derived
record is a separate store from the conversation's message history** and is not written into it.
Conflating the two would silently hand speech the message history's search reach, export reach
and retention — three consequences nobody chose, arriving through a schema decision rather than
a policy one.

**Why the status is not "implemented".** Camera capture, screen capture and the speech-derived
record all belong to deferred areas, so the separate-store obligation and the participant
notification are recorded and carried rather than exercised, and the retention bound on a stored
clip depends on the process described under `S-RETENTION`, which is documented rather than
running.

**Proof.** `e2e/specs/composer.spec.ts` asserts that capture begins only after an explicit act
and that the indicator renders while it is live; `e2e/specs/states.spec.ts` asserts the denial
presentation names an external remedy and offers no in-product control.

**Status: mechanism only, surface deferred.**

## `S-MARKETING` — marketing and communication consent

**What it governs.** Every control that offers to contact a person for marketing, and every
record of that offer being accepted or withdrawn (`00-product-overview.md` L493, L584).

**A pre-ticked control is a rendering, never a consent.** The specification records a marketing
checkbox rendered already ticked on one surface and unticked on its sibling, and shows nothing
whatever about what is submitted or stored. A default state is therefore not an act: this build
requires a distinct affirmative act before any consent record is written, so a tick that was
there when the surface loaded produces no row, and **the absence of a row is the absence of
consent**.

**How this build discharges it, and why consent cannot be a boolean column.** A boolean records
a **state** and loses the **act** — and the act is the only thing that makes the state
defensible afterwards. The contract requires the act, its timestamp, the exact wording that was
presented, the surface it was presented on and the version of the policy it referenced, all
stored together so that what a person agreed to can be **reproduced rather than asserted**. None
of that fits in a column. The marketing-consent table in
`packages/db/prisma/schema.prisma` therefore holds **one row per act**, grant or withdrawal
alike, and `docs/decisions/data-model.md` carries its shape.

Three rules follow from that shape rather than from a policy statement. A **withdrawal is a row
of the same fidelity as the grant**, not a deletion of one — erasing the grant would erase the
proof that the purpose was ever permitted. A **suppression record outlives the deletion of the
contact**, so erasing an address cannot silently make it contactable again. And **purpose
limitation** holds because the row names the purpose its wording named: a new purpose needs a new
act, never an inference from an old one.

Withdrawal is a first-class operation, available without a session where the messages themselves
are, and honoured for the whole retention period. The separation of the marketing population from
the account population is stated under `S-PII` above and enforced at the point of collection here.

**Proof.** `apps/api/test/integration/auth/**` asserts that a consent row is written only from an
affirmative act, that the row carries the presented wording, and that a withdrawal inserts a row
rather than deleting one.

**Status: implemented in Phase 1.**

## `S-TELEMETRY` — diagnostic, feedback and product telemetry payloads

**What it governs.** Every payload the product transmits **about its own use** — a diagnostics
result set, a feedback submission, an error report, a usage event
(`00-product-overview.md` L494, L590). Five requirements are load-bearing here: a **declared
purpose** per payload, recorded where the payload is defined rather than in prose beside the
control; a **field allowlist**, so the payload is assembled from an enumerated set and a value can
only be sent if somebody decided to send it; **no content and no query values**; a **bounded
destination**; and a **retention bound** on whatever is stored.

**How this build discharges it, and the constraint is active today.** The structured logger at
`apps/api/src/observability/logger.ts` is the one component in this run that transmits anything
about the product's own use, and the contract binds it now rather than later: **the logger must
not receive message content or search terms.** Neither may a record value, a filter state, a
result body, a personal field or free text the person did not compose for this purpose. Where a
payload must reference an object it carries an **opaque identifier** instead. Assembling a payload
by serialising whatever context is to hand is exactly what the field allowlist prohibits, and it
is also the single easiest way for a message body to arrive in a log — which is why the
prohibition is written against the logger and not against a future analytics module.

Two neighbouring rules reinforce it. Secrets never reach a log, an error report, an analytics
event, a cache key or a telemetry payload under `S-SECRET`. Personal values never reach them under
`S-PII`'s redaction requirement. The logger is therefore the meeting point of three contracts, and
the audit log at `apps/api/src/observability/audit-log.ts` observes the same discipline — a row
carries a reference and never a body copy, because an audit trail that copies message content
becomes a second uncontrolled read path for it.

**Why the status is not "implemented".** The telemetry **surfaces** the specification evidences —
a share-feedback row and a copy-results action beneath a diagnostics table — belong to deferred
areas, and no capture ever shows a payload (`00-product-overview.md` L592). This run therefore
transmits no telemetry payload at all: it emits logs and audit records, both first-party and
bounded. The specification's own instruction stands for whoever builds those surfaces — state
exactly what a control transmits and satisfy the requirements above, or transmit nothing beyond
text the person composed, and never ship a control whose payload nobody specified.

**Proof.** `apps/api/test/unit/**` asserts that the logger's redaction refuses message content and
search terms on the paths that could carry them.

**Status: mechanism only, surface deferred.**

## `S-RETENTION` — retention and deletion of stored product data

**What it governs.** Every class of data the product keeps, **including derived stores**, and
copies retained after access or a collaboration ends (`00-product-overview.md` L495, L596). Six
requirements bind: a retention class per data kind declared where the data is modelled; deletion
that reaches derived stores; loss of access propagating to retained projections; retained copies
bounded and withdrawable; deletion as an authorized, audited operation rather than a side effect;
and the stated period **enforced by a running process** rather than by the absence of a surface
that would show the data.

**The derived stores that already exist, so the obligation is concrete rather than abstract.**
This is the requirement most often written as a principle and then missed in practice, because the
primary row is the obvious target and the copies are not:

| Derived store                   | Where it lives in this build                                  | Why deletion must reach it                                                                 |
| ------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| The search index                | `apps/api/src/search/postgres-fts.ts` behind `SearchIndex.ts` | A value that survives in an index is not deleted — it is still discoverable by query       |
| Cached and computed projections | The presence, socket-registry and coalesced fan-out state     | A cached projection is a copy made when someone was authorized, and it outlives the loss   |
| Queued notification payloads    | Notification rows carrying a reference                        | A payload already queued is a projection that is about to leave the product                |
| The audit log                   | `apps/api/src/observability/audit-log.ts`                     | It is deliberately retained, so its own class and period must be **declared**, not assumed |

Two of those cut both ways, and saying so is part of applying the rule rather than reciting it. A
search index and a cache must be **reached** by a deletion. An audit log must **not** be emptied by
one — it is the record that a denial or an administrative action happened, so its retention class
is a decision to keep, made explicitly. The distinction is why "delete everywhere" is the wrong
instruction and "declare a class per data kind" is the right one.

**Loss of access propagates**, which the read contract already requires on the render path: where
access to a containing object is withdrawn, retained projections of it are suppressed or redacted
on their next render rather than persisting because they were authorized when they were written.
That much is implemented, by the projection guard re-checking on every render — so the _render_
half of this contract is live even though the _expiry_ half is not.

**Why the status is documented.** No retention period is enforced by a running process in this run.
There is no scheduled worker, no expiry sweep and no deletion pipeline, because the surfaces that
accumulate — an activity feed, a saved-items list, completed reminders, produced export artefacts —
belong to deferred areas, and Phase 1's own data has no deletion affordance beyond message and
channel deletion, which is an authorized operation under `S-AUTHZ-OP` rather than a retention
process. Absolute timestamps are stored on every deadline-bearing record, which is what makes a
future sweep possible without a migration; `docs/decisions/data-model.md` records that.

**Status: documented, not implemented.** Reason: the enforcing process and the accumulating
surfaces belong to deferred areas; the render-time propagation half is live under `S-AUTHZ-READ`.

## `S-PAYMENT` — payment-instrument collection and handling

**What it governs.** Every surface that collects, stores, renders or changes a payment instrument
(`00-product-overview.md` L496, L602). The boundary that protects the instrument is **not
collecting it into the product at all**:

- **Provider-hosted collection.** The number, expiry and security code are entered into fields
  served and scripted by the payment provider, so the raw values never reach this product's
  scripts, servers or logs, and the product receives only a token in exchange.
- **Non-storage of the instrument.** Only the masked field set is persisted — instrument kind,
  masked identifier, network, expiry and a default flag. The full number and the security code are
  **never** persisted, in any store, at any lifetime.
- **One representation for the reusable instrument.** The provider token is reusable by design,
  which is the whole point of a stored instrument, so it is the single `S-SECRET` class-C secret
  this contract creates: envelope-encrypted in a key-managed store, bound to one workspace,
  decrypted only inside the provider-integration component and only for the duration of a charge,
  rotatable without re-collecting the instrument, and destroyed rather than flagged when the
  instrument is removed. The workspace's stored-payment-method group carries an **opaque reference**
  to that record and never the token, which is why the group stays safe for a read path to return.
- **Redaction, transport and authorization.** No fragment of an instrument, the token or its
  resolution reaches a log, an error report, an analytics event, a URL, a cache key or a support
  history. Every exchange is over authenticated transport-layer encryption to the provider's own
  origin, with no interception, mirroring or proxying of the request body. Adding, changing,
  defaulting or removing an instrument is authorized server-side against the acting principal's
  billing capability, and each change is audited and notified.

**Both halves of the status are worth stating, because each is doing work.** _Documented:_ the
boundary above is written out in full here, because the specification is blunt that an unspecified
payment boundary is the one gap a build cannot safely be left to fill on its own, and that
designing-and-recording is **not** a sufficient answer for a value whose mishandling is
unrecoverable (`00-product-overview.md` L604). _Not implemented:_ billing and payments are out of
this run's scope entirely — there is no provider integration, no hosted field, no token and no
stored instrument, so there is nothing in the tree for this contract to protect yet.

What does ship is the gate that points at the absence. The upgrade-gate contract renders — badge,
trial countdown and upsell strip — and its action resolves to a **defined placeholder surface**
rather than to a purchase flow, so no control in the shipped product is dead and none of them
reaches a payment path that does not exist. The placeholder is recorded in
`docs/decisions/placeholder-surfaces.md`.

**Status: documented, not implemented.** Reason: billing and payments are out of scope for this
run, so no instrument, hosted field or provider token exists to protect.

## `S-APPGRANT` — third-party integration grant and lifecycle

**What it governs.** Every grant of access to third-party software — its scopes, its credentials,
its enforcement, its expansion and its revocation (`00-product-overview.md` L497, L608). Adding
such software to a workspace grants it access to the workspace's content, and the grant is modelled
explicitly rather than implied by the install:

- **Least-privilege declared scopes.** The integration declares the capabilities it needs as an
  enumerated set, the workspace grants a subset and nothing wider, there is no ambient or
  default-all access, and an undeclared capability is refused at runtime rather than tolerated.
- **An informed grant decision.** The authorising principal is shown the scope set **before** the
  grant is written, and the authorisation is an affirmative act by a principal whose capability to
  grant it was checked server-side — reaching a publicly readable catalogue page is not a capability.
- **An install record** holding the granted scope set, the authorising principal, the time, the
  workspace and the integration, as the authority for every later request.
- **Runtime scope enforcement.** Every request is authorized against the install record's scope set
  **and** against the read contract for the specific object, on every request. An integration never
  inherits the authority of the person who installed it.
- **Credential isolation.** Credentials are **per install** and are `S-SECRET` class-C secrets —
  the mirror case, a value an integration presents _to_ this product, is class A and is stored as a
  verifier like any other inbound bearer value.
- **Re-consent on expansion, immediate revocation, and audit.** Widening a scope set needs a new
  informed grant; revocation invalidates credentials, stops running automations and scheduled work,
  ends sessions and refuses in-flight requests rather than draining them; and every grant,
  expansion, rotation and revocation is recorded with actor, time and scope delta.

**Status: documented, not implemented.** Reason: the apps and integrations area is deferred, so no
install, scope set, install record or per-install credential exists in this run. The rail
destination that would lead there resolves to a defined placeholder surface, so the control is not
dead.

One thing this contract deliberately does not do, and it is a useful discipline to carry: it
specifies **behaviour and no screen**. The specification shows the offer to add software and shows
no authorization, consent or grant screen anywhere, so the surfaces that would present a grant
review, a scope list, a revocation confirmation or an audit view are designed by the build under
`S-GAP` (`00-product-overview.md` L610). Security behaviour no capture could ever evidence is
obligation; a screen no capture shows would be fabrication. The two are not the same kind of
absence.

## `S-GAP` — a named gap becomes a build obligation

**What it governs.** Anything the specification names that the corpus does not evidence — an unseen
state, an uncaptured screen, a contract the frames cannot supply — so that it is **designed and
implemented** rather than left unhandled or treated as out of scope because no frame showed it
(`00-product-overview.md` L498, L614).

**This is the contract most likely to be misread, so the distinction is stated plainly.** The
obligation to design is not a licence to invent. They are different acts on different subjects:

| Required                                                                                                                                   | Prohibited                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Designing a **state** the corpus omits — offline, disconnected, reconnecting, retrying, rate-limited, quota-exceeded, throttled, not-found | Inventing an **identity** — a third-party product name, wordmark or logo |
| Designing a **behaviour** no capture can show — an authorization check, an encoding step, an expiry, a consent record                      | Sampling a **colour** from a frame, or adopting a brand palette          |
| Authoring a **capability model**, because the specification names no role and invents none                                                 | Tracing, extracting or reconstructing **icon artwork**                   |
| Authoring **breakpoints**, a type scale and radii the single-width corpus cannot supply                                                    | Transcribing **product copy**, including strings legible in a frame      |

The identity rule — the fifth of the five project rules as provided — draws that line, and the
specification's own wording draws it too: the obligation "requires the build to make a decision and
record it, and it forbids this catalog from describing a screen it never saw"
(`00-product-overview.md` L614). So a build that skipped the reconnect states because no frame
showed them would breach this contract, and a build that invented a wordmark because no frame could
license one would breach the identity rule. Both failures wear the same excuse.

**How this build discharges it.** Every gap actually decided is recorded in
`docs/decisions/gap-register.md` with its marker reference, the options weighed, the choice and the
reasoning — enumerated by marker **position** rather than trusted from a total, because the totals
in the sources disagree and the disagreement is logged in `docs/decisions/catalog-defects.md` rather
than reconciled. The uncertainty rule, the fourth as provided, is what makes this mandatory: a
marker is an open work item and never permission to skip. Where the corpus is silent and no marker
exists, the smallest coherent behaviour consistent with adjacent evidenced behaviour is chosen and
recorded the same way.

Four gap decisions carry disproportionate weight for this register in particular, because security
depends on them: `docs/decisions/role-matrix.md`, without which no wrong-role denial test can be
written at all; the reconnect and disconnected state family, without which the realtime reliability
requirements cannot be observed; the rejection state under `S-UPLOAD`; and the withdrawal surface
under `S-MARKETING`. Each is a gap whose absence would be invisible in a screenshot and decisive in
a review.

**Status: implemented in Phase 1.** The mechanism — decide, implement, record — is running. This
contract is a **standing obligation that never closes**, so the row records a live process rather
than finished work.

## Controls this build adds beyond the sixteen

The sixteen contracts are the specification's, and they are not the whole of a defensible
server. Five controls are added on top of them. None of them is a contract and none is
counted as one; they are listed here because a reviewer looking for a defence should not
have to guess whether it was considered.

| Control                                                      | Where it lives                             | Why it is here                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Rate limits on the authentication and send paths             | `apps/api/src/plugins/rate-limit.ts`       | Attempt bounds are required for class-A artefacts, and a send path without one is an availability hole |
| Request-forgery protection on cookie-authenticated mutations | `apps/api/src/plugins/csrf.ts`             | A cookie is sent by the browser whether or not this application asked for it                           |
| An **explicit** content-security policy                      | `apps/api/src/plugins/security-headers.ts` | Framework defaults do not know about the storage origin, and a default is not a decision               |
| The session cookie's own attributes                          | `apps/api/src/plugins/auth.ts`             | The cookie is the credential in transit, so its attributes are part of the credential's contract       |
| Structured audit logging                                     | `apps/api/src/observability/audit-log.ts`  | A denial and an administrative action are the two events nothing else records                          |

**The forgery protection uses the synchronizer-token pattern, and it is available because of
a modelling decision made elsewhere.** The pattern needs server-side state to compare
against, and this build has it: a session is **a row, not a self-contained token**, referenced
by an opaque cookie, which is what makes revocation a write and makes a per-session token
comparable. A build that had kept authorization state in the client would have had to reach
for a weaker double-submit variant instead. `docs/decisions/data-model.md` carries the session
row; the consequence is claimed here.

**The content-security policy is set explicitly rather than left to defaults**, and the shape
matters. The pre-signed storage origin is admitted for **images, media and connections**,
because uploads go there directly and their bytes never transit the API. Scripts stay
**self-only, with no inline exception** — no inline allowance, no unsafe evaluation, no
blanket data scheme for a script source. That asymmetry is the policy doing its job: the
storage origin must be reachable for content and must never be able to script the
application, which is the same boundary the upload contract asks for at the serving end.

**The session cookie is HTTP-only, same-site-lax and secure.** HTTP-only keeps it out of
reach of script, which is what makes a script-injection defect a bug rather than a session
theft; same-site-lax is what makes the forgery protection's job small; and secure keeps it off
plaintext transport. No credential of any kind is kept in client-side storage — the cookie
carries an opaque identifier and the authority lives in the row it names.

**Audit logging covers two classes of event, and the trigger set is deliberately wider than
"errors":** every authorization denial, whether it came from the operation guard or the
projection guard, and every administrative action — role changes, invitation issuance and
revocation, conversation archival, unarchival, conversion and deletion, member removal, and
every change to workspace configuration. A row records who attempted it, what they attempted,
against which object, and why it was refused, and it carries the workspace so the log is
itself tenant-isolated.

## The design tie-breaker

Where two approaches are equally viable, this project chooses the one that keeps these
contracts **easiest to verify**. Not the more elegant one, not the more general one, and not
the one that would be quicker to write.

The register above is largely a record of that rule being applied. A single mutation guard over
an exhaustive operation union is not the most flexible arrangement imaginable; it is the one
whose coverage a reviewer can enumerate, and whose omission is a compile error. Isolation as a
client extension below every caller is not the most direct way to add a predicate to a query;
it is the one that cannot be forgotten, and forgetting is the failure mode that matters. Eight
named projections are more work than one generic read filter; they are also countable, and a
count is what a test can assert against. Four credential tables are more schema than four
columns; they are also four lifecycles that can be tested separately. In every one of those
pairs the verifiable option won, and the cost was accepted deliberately.

## What the corpus cannot show, recorded as absence

The reason these sixteen obligations exist at all is a property of the evidence, and it is
worth stating in the register rather than leaving implicit: **a capture can show a control, and
it can never show an authorization check, an encoding step, a retention bound or a consent
record** (`README.md` L378). Sixteen obligations recur that no frame can evidence.

Two facts bound what the evidence could ever settle, and both are recorded as absence rather
than filled in:

- **The corpus's entire vocabulary of visible authorization is four frames** — an
  administrator-only legend attached to one gated control, a permissions surface stating in its
  own copy that any member may invite by default and that invitations can be made to require
  administrator approval, a billing surface stating that only certain accounts may make billing
  and payment changes, and a help article stating that creating a workflow and using one are
  separately permissioned: frames 75, 576, 672 and 710 (`README.md` L380,
  `00-product-overview.md` L479). Everything else about who may do what is silence, and
  **silence is never a permission**.
- **The corpus is a single authenticated session in one workspace**, which is precisely why it
  cannot evidence any of this (`00-product-overview.md` L514). One session shows what that
  viewer saw. It can never show what a different viewer would have seen, what a different role
  would have been refused, or what a viewer who lost access would see next. Every claim about
  scoping is consequently an obligation and not an observation — and every denial test in this
  build tests something no frame could have depicted.

That second fact is why `docs/decisions/role-matrix.md` had to be authored before the denial
suite could be written, and why it is named a precondition in this register rather than a
companion.

## Verification and reporting

Each contract above names the test that must pass. Three rules govern how those names are read,
so that the register cannot quietly become a claim it has not earned.

**A criterion is satisfied only when a referencing test passes**, and that judgement is recorded
in `docs/decisions/ac-manifest.md` and nowhere else. This register says where an obligation is
discharged; the manifest says whether the proof passed. A reader who wants the second question
answered should open the manifest.

**Two of the security tests need two of something**, and neither is provable with one. Isolation
needs **two seeded workspaces**, because a single workspace cannot demonstrate that a row from
another one is unreachable. Cross-instance fan-out needs **two running instances**, because a
single instance cannot demonstrate that a re-check happens on delivery from elsewhere. Per-viewer
state needs **two connected clients** for the same reason the corpus cannot settle its placement.

**A denial is asserted in pairs.** For every mutation and every projection, both a non-member and
a **wrong-role** caller are asserted to receive a server-side denial, and a private resource is
asserted absent from all eight projections. The pairing is the point: a non-member test proves
isolation, and only the wrong-role test proves that the capability model is actually consulted.

The container-backed integration suite and the two-instance proof are **execution-bound to a
Docker-capable environment**. Every artefact — the suite, the two-instance test, the seeded
second workspace — is authored regardless, and the constraint is on verification in a particular
environment rather than on delivery.

## Companion records

| Record                                   | What it holds that this one deliberately does not                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `docs/decisions/role-matrix.md`          | The roles, the operations and the capability in each cell — the precondition for every wrong-role denial test       |
| `docs/decisions/data-model.md`           | The per-viewer relations, the four credential tables, the consent table, the audit log and the isolation chokepoint |
| `docs/decisions/gap-register.md`         | Every gap actually decided, with its marker, options, choice and reasoning                                          |
| `docs/decisions/catalog-defects.md`      | Every contradiction and omission found in the read-only specification                                               |
| `docs/decisions/ac-manifest.md`          | Whether the test behind a criterion passes — the only place satisfaction is claimed                                 |
| `docs/decisions/observed-values.md`      | Every configured duration, window, threshold and limit, and the invariants excluded from that list                  |
| `docs/decisions/placeholder-surfaces.md` | What each deferred destination says, including the one the upgrade gate points at                                   |

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **No frame was opened.** Every fact above was resolved from specification prose, which the
  corpus-handling rule — the third of the five project rules as provided — requires to be
  attempted first. Where a frame is referred to at all it is by **bare number**; no filename
  appears in this record, and neither does the specification's percent-encoded citation form,
  because both carry a third-party product name.
- **Rules cited by subject and position, not by identifier.** The five project rules carry
  platform identifiers that each embed a third-party product name, so writing one here would
  breach the identity rule this record is otherwise observing. They are cited by what they
  govern and where they sit in the provided order — the authorization rule is the second, the
  corpus-handling rule the third, the uncertainty rule the fourth, the identity rule the fifth.
  Position alone would be unsafe, because the identifiers are permuted relative to the
  requirement labels; position **with** subject is not.
- **Contracts referenced by identifier, definitions not restated.** The specification defines
  each contract once and instructs that documents reference it by identifier only
  (`README.md` L378). This record states what a contract governs only as far as is needed to
  say where the obligation lands, and points at the definition for the rest. A defect found in
  the specification is recorded in `docs/decisions/catalog-defects.md`; correcting it in place
  is prohibited.
- **No copy, colour or artwork is taken from a frame.** No string legible in any capture is
  transcribed — the four visible authorization facts are paraphrased as facts, not quoted as
  copy — and no colour value appears at all. No third-party product, feature or asset name
  appears in the text, the headings, the table cells, the link labels or the paths. Third-party
  software is referred to functionally.
- **No sample entity name is reproduced.** The names visible in captures illustrate shape only.
  Seed and fixture names are authored, in `packages/db/prisma/seed.ts` and `e2e/fixtures`.
- **No fenced block appears in this record.** The committed documentation-site configuration
  does not render a diagram fence: its superfences extension consumes a fenced block before the
  diagram plugin can claim it, so a fence publishes as a highlighted code box
  (`README.md` L905–L909). Relationships are expressed as tables and prose instead, and the
  read-only site configuration is not touched. The specification's measured 74-character fence
  ceiling (`README.md` L86) is therefore satisfied vacuously.
- **Evidence by citation; absence recorded as absence.** Every claim taken from the
  specification names the document and line it came from. Where the specification says nothing,
  this record says so — see [what the corpus cannot show](#what-the-corpus-cannot-show-recorded-as-absence).
- **Statuses are dispositions, not passes.** Three values, defined above, each stating where an
  obligation is discharged. Every status other than implemented carries a reason. No status is a
  claim that a test has been observed to pass, because the uncertainty rule forbids marking a
  criterion satisfied without one.
- **Inconsistencies preserved, not reconciled.** Two are carried above rather than settled: the
  marker-census divergence, which is why the gap register enumerates positions instead of
  trusting a total, and the two stated lifetimes for the same bearer credential, which is
  enforced as one chosen default in one place with both readings recorded. Both are logged in
  `docs/decisions/catalog-defects.md`.
