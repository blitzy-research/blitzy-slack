# Data model

The schema is a list of tables. It cannot say why a field sits on one table rather
than another, and in this model that "why" is usually a security answer rather than
a modelling one: the placement of per-viewer state decides whether one person's
reading marks a conversation read for everyone, and the placement of credential
material decides whether a read path can hand out something a reader could redeem.
This record carries those reasons so that `packages/db/prisma/schema.prisma` can be
read, reviewed and changed without them having to be rediscovered.

| Field                               | Value                                                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Record type                         | Decision record — the narrative behind the schema                                                                                                      |
| Status                              | Operative                                                                                                                                              |
| Schema it explains                  | `packages/db/prisma/schema.prisma`                                                                                                                     |
| Entity set                          | **Closed at 20.** No twenty-first identifier may be coined                                                                                             |
| Per-viewer relations                | **Ten** rows counted at source in the catalog's table; the project specification gives eleven. Both carried, neither asserted                          |
| Frames opened to author this record | **0** — every fact below was resolved from catalog prose                                                                                               |
| Companion records                   | `docs/decisions/catalog-defects.md`, `docs/decisions/observed-values.md`, `docs/decisions/http-api-contract.md`, `docs/decisions/realtime-contract.md` |

## How this record cites, and what it deliberately does not repeat

A document citation names a file under `docs/workflows/` together with its line
number, so `README.md` below is the catalog index in that directory and never the
one at the repository root. A frame is cited by number alone. Project rules are
cited by what they govern and where they sit in the provided order rather than by
their platform identifiers, for the reason given under
[Authoring conventions](#authoring-conventions-observed-by-this-record).

Four things this record points at rather than restates, because a second copy of
any of them would be a second thing to keep true:

- **Configured values** — every duration, window, threshold and limit, with the
  reading it came from and the default chosen, live in
  `docs/decisions/observed-values.md`. No number from that table is reproduced here.
- **The cursor and page contract** — the shape of a keyset cursor and the rule that
  no page index crosses the API boundary live in
  `docs/decisions/http-api-contract.md`.
- **The socket contract** — the event envelope, the replay window and the reconnect
  behaviour live in `docs/decisions/realtime-contract.md`.
- **Catalog defects** — every contradiction, omission and mis-statement found in the
  read-only specification is logged in `docs/decisions/catalog-defects.md`. The
  specification is never corrected in place; that is prohibited by the
  corpus-handling rule, the third of the five project rules as provided.

## The closed entity set

**The entity set is closed at twenty. No twenty-first identifier may be coined.**
The catalog states the closure as a requirement on itself — every `E-*` cited
anywhere in it appears in one table, and twenty do, "the fixed set the catalog works
from" (`README.md` L321). This build inherits the closure as a constraint on the
schema: a structure that seems to need a new identifier is either a field group of an
existing entity or it is not a product entity at all, and both of those escapes are
provided deliberately rather than as a convenience.

| Identifier       | What it represents                                                                                                                                                   | Phase-1 status                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E-APP`          | Software installed into a workspace — a cloud-drive app, a poll app, a calendar app — posting under its own author identity and offering its own slash commands      | Identifier only. Table arrives with the apps phase; a message may already carry an app author, so `E-MESSAGE` holds the author-kind discriminator from Phase 1                      |
| `E-CANVAS`       | A titled, block-structured document, standing alone or attached to a conversation                                                                                    | Identifier only. Table arrives with the canvases phase                                                                                                                              |
| `E-CHANNEL`      | A conversation. Carries a conversation-type field, so a direct message is a **variant of this entity** rather than a second one (`README.md` L327)                   | **Persisted in full** — one of the gate's named five                                                                                                                                |
| `E-EXTERNAL-ORG` | Another company a workspace collaborates with, holding the connection state and the per-channel permission level **against the company rather than the person**      | Identifier only. Table arrives with the external-collaboration phase, and it is where the acceptance window is held once                                                            |
| `E-FILE`         | An uploaded or recorded attachment — document, image, video clip, audio clip — with its preview and its upload lifecycle                                             | **Persisted in part.** Phase 1 writes the attachment and its upload lifecycle; the files destination and its grouping arrive with the files phase                                   |
| `E-HUDDLE`       | A live audio-and-video session hosted by a conversation                                                                                                              | Identifier only. Table arrives with the huddles phase                                                                                                                               |
| `E-INVITATION`   | An outstanding or resolved offer to join a workspace or a single channel                                                                                             | **Persisted in part.** Phase 1 writes member and guest invitations with their channel scope, note and resolved deadline                                                             |
| `E-LIST`         | A structured collection with typed fields, saved views and layouts                                                                                                   | Identifier only. Table arrives with the lists phase                                                                                                                                 |
| `E-LIST-RECORD`  | One row of a list, carrying that list's field values                                                                                                                 | Identifier only. Table arrives with the lists phase                                                                                                                                 |
| `E-MESSAGE`      | A posted entry in a conversation — authored by a person, posted by an app, sent by a workflow, or emitted by the system with **no author at all** (`README.md` L411) | **Persisted in full** — one of the gate's named five, and it ships thread-reply-ready so the threads phase needs no migration of existing rows                                      |
| `E-NOTIFICATION` | The notification configuration, the activity entries it produces, and the reminders attached to them                                                                 | **Persisted in part.** Phase 1 writes the per-conversation scope and mute — which live on a relation, not here — and the read boundary                                              |
| `E-PLAN`         | A published subscription tier. The one **catalogue** object: no tenant key, readable in full without a session (`README.md` L341)                                    | Identifier only. Phase 1's setup wizard writes a **tier reference** into the workspace's commercial-position group; the published catalogue table arrives with the commercial phase |
| `E-PREFERENCE`   | A viewer's own settings record — and the only place a dismissal is ever written                                                                                      | **Persisted in part.** Phase 1 writes dismissed banners and explanatory blocks and the colour-mode choice                                                                           |
| `E-REACTION`     | An emoji applied to a message by a specific person                                                                                                                   | **Persisted in full** — one of the gate's named five                                                                                                                                |
| `E-SEARCH-QUERY` | A query and its filters, in **two corpus scopes** served by two strictly separate read paths — one workspace-scoped, one public (`README.md` L343)                   | Identifier only. Table arrives with the search phase; the shell's search entry is present in Phase 1 and writes nothing                                                             |
| `E-THREAD`       | A reply set hanging off a parent message or off a session's own system message                                                                                       | Identifier only. Table arrives with the threads phase                                                                                                                               |
| `E-USER`         | An account, carrying identity, profile and status — and **no credential material of any kind** (`README.md` L326)                                                    | **Persisted in full** — one of the gate's named five                                                                                                                                |
| `E-USER-GROUP`   | A named, handled group of accounts, mentionable and able to carry default channels                                                                                   | Identifier only. Table arrives with the administration phase                                                                                                                        |
| `E-WORKFLOW`     | An automation with a trigger and ordered steps, publishable within a workspace                                                                                       | Identifier only. Table arrives with the workflow phase                                                                                                                              |
| `E-WORKSPACE`    | The tenant. Every tenant row is reachable only through it, and it is the **sole** holder of tenant commercial state                                                  | **Persisted in full** — one of the gate's named five                                                                                                                                |

Twenty rows, spelled as the catalog spells them. The five marked persisted in full
are the five the Phase-1 gate names, each with every field the consolidated model
lists for it (`README.md` L484).

### Being honest about what "identifier only" means

An identifier-only row is not a stub and not a promise. It means the entity is part
of the closed set, its name is fixed, and **its table arrives with the phase that
owns its surfaces** — because a table no feature writes to is a table no test
exercises, and an unexercised table drifts from the schema around it. Three
consequences are worth stating so that nobody reads the column as a to-do list:

- Where a Phase-1 field **refers** to a later entity, the reference exists from the
  first migration. A message carries its author kind now, so an app-posted message
  is representable before the apps table exists; a reply carries its parent-thread
  reference now, so the threads phase adds a table rather than rewriting rows.
- Where a later entity **holds a value a Phase-1 surface needs**, the value is held
  where the catalog puts it and nowhere else. The subscription tier a workspace
  chooses at setup is a reference from the tenant record to a published tier, and
  the tier's own definition stays in the catalogue object — so Phase 1 stores the
  reference without copying the definition.
- The per-viewer relation tables are the exception, and deliberately so: **all ten
  are created in the data layer before any feature writes to them.** They are the
  structures that decide what a viewer may see, so they exist before the first
  feature that could be tempted to put one of their fields somewhere easier.

### The two devices that keep the list closed

The catalog keeps twenty entities sufficient without losing an observation by using
two devices, and this build uses both for the same reason (`README.md` L321).

**The field group.** Where a surface renders a cluster of values that belongs to an
entity but must be authorized, retained or scoped separately from the rest of it,
the cluster is named inside that entity rather than promoted to an entity of its own.
**Commercial and installation clusters are therefore field groups of existing
entities, not new entities.** The tenant record carries six of them — commercial
position, billing account, stored payment method, billing contacts, billing history
entries and renewal estimate; the published tier carries the catalogue-scope
promotional offer; and the app carries the per-workspace installation, keyed by
workspace and app. A build may persist a group as its own table keyed by the owning
record; what the group fixes is not the table count but **where the values belong** —
in particular that no tenant value is ever a field of the publicly readable tier, and
no catalogue value is ever a field of a tenant record.

**The variant.** Where two things share a shape but differ in a way that matters to
authorization, the difference is a discriminator on one entity rather than a second
entity. Two variants carry real weight here. A direct message is a conversation-type
value on the conversation entity, because the corpus gives a direct message no
observable of its own beyond that (`README.md` L327). And the query entity carries
two corpus scopes — workspace-scoped and public — whose discriminator the catalog
calls a security boundary rather than a convenience, because the two are served by
two separate read paths and a public query is never resolved by the path that carries
workspace content (`README.md` L343).

### Published content carries no entity identifier at all

The public marketing, store, careers and status properties expose structures a
publishing system must model — editorial items, the people who submit public forms,
job postings, per-service health rows, merchandise and a basket. **None of them is a
product entity, so none of them carries an `E-*` identifier** (`README.md` L346).
The reason is a read-path reason: a read that serves a marketing page must never be a
read of product data, and giving published content an entity identifier is the first
step towards exactly that. The same rule separates populations — an address collected
by a public form is not an account, and the two are never merged into one record.

### How the entity table is meant to be read

The catalog's own caveat governs how this model was derived, and it is load-bearing
rather than modest. The entity table is **the union of the fields the interface
exposes**, aggregated additively across the areas, and **every field cites the frame
that shows it**; a field no frame evidences is not in the model (`README.md` L315).
The table is a superset of every per-area contribution, and the closure check runs in
both directions: every identifier used anywhere appears as a row, and every field
group an area reports upward appears in that row (`README.md` L317).

The consequence for this schema is a discipline about additions rather than about
omissions. **A field absent from the catalog is absent from the schema unless a
decision record introduces it deliberately** — with the options considered, the
choice and the reasoning, in the way
[Judgements where the specification is silent](#judgements-where-the-specification-is-silent)
does below. A field invented quietly is indistinguishable from a field the catalog
evidenced, and the whole value of a cited model is that the two can be told apart.

## Per-viewer state is a relation, never a field of a shared entity

This is the most consequential section of the record, and it is the one the catalog
itself singles out: **per-viewer state is a relation, never a field of a shared
entity**, described there as "the single most consequential correction in the
consolidated model" (`README.md` L357). Nine area documents contribute to it, which
is why the catalog states it once centrally instead of nine times locally, and why
this record does the same for the schema.

### Why this is a security decision and not a normalisation preference

The reason is not that a repeated column would denormalise the model. The reason is
what a shared column _does_ when two people use the product at once.

Put a per-viewer fact on the object everyone shares and it stops being personal.
**One person's save saves for everyone.** One person's reminder fires for everyone.
One person's reading marks the conversation read for all of them, so a colleague who
has not opened it loses the boundary that told them where they were. Mute the
conversation and it goes quiet for every other member; star it and it moves in
everybody's sidebar (`02-channels.md` L809).

Then there is the second half, which is worse because it is silent. **Every such flag
on a shared object discloses that person's behaviour to every other member of it.**
A stored save says what someone chose to keep. A read marker says when they last
looked and, by its absence, that they have not. A notification scope says how closely
they are following their colleagues. None of that was ever offered to the other
members, none of it is visible as a leak, and every one of those facts leaves the
product through a projection — a count, a member list, an autocomplete row — that was
authorized for the object and never for the behaviour recorded on it.

That is why the rule is a security contract. The catalog's placement test is one
question: _if two people opened this at the same moment, could they legitimately see
different values?_ If yes, the field belongs on a relation keyed by the pair and
never on the object (`00-product-overview.md` L564). And the reason the question has
to be asked at all is that the evidence cannot answer it: **a single captured session
cannot distinguish "stored on the shared object" from "stored on the (viewer, object)
pair", because only one viewer is ever captured** and both models render identically
to that viewer (`README.md` L357, `00-product-overview.md` L566). Where the evidence
is structurally incapable of deciding, the placement is decided by consequence, and
the consequence of guessing wrong in the other direction is a disclosure.

### The relations

Ten rows, counted at source in the catalog's table (`README.md` L361 heading, body
rows L363 through L372). Each replaces what would otherwise be a field of the entity
beside it.

The `Phase` column records **when a writer arrives, not when the table appears.** All
ten tables are created in the data layer before any feature writes to them, so no
feature ever meets a missing relation and puts one of its fields on the shared object
instead.

| Relation                | Keyed by              | What moves onto it, and out of the shared entity                                                                                                                                                                                                                                                                                                                                                | Phase                                                                                                       |
| ----------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Conversation membership | conversation + member | Unread flag and its message count · has-draft flag · per-conversation notification scope and mute · joined marker · star or favourite · and the six further per-member facts the conversation details surface renders — notification preference, the per-device override, the thread-reply flag, the starred flag, the joined marker and sidebar placement (`02-channels.md` L1043)             | Written from Phase 1                                                                                        |
| Viewer–message state    | viewer + message      | Read and unread state · the unread boundary · mark-as-unread · saved-for-later flag · reminder due time, held as an absolute timestamp                                                                                                                                                                                                                                                          | Written from Phase 1 for read state and the boundary; saved-for-later and reminders from the activity phase |
| Viewer–thread state     | viewer + thread       | Following state · unread reply count                                                                                                                                                                                                                                                                                                                                                            | Written from the threads phase                                                                              |
| Viewer–canvas state     | viewer + canvas       | Last-viewed timestamp · star · saved-for-later                                                                                                                                                                                                                                                                                                                                                  | Written from the canvases phase                                                                             |
| Viewer–list state       | viewer + list         | Star · last-opened · per-record notification subscription                                                                                                                                                                                                                                                                                                                                       | Written from the lists phase                                                                                |
| Viewer–app state        | viewer + app          | Unread count **only** — installed state remains per workspace, on the app's installation field group                                                                                                                                                                                                                                                                                            | Written from the apps phase                                                                                 |
| Viewer–file state       | viewer + file         | Viewed-at timestamp, which is what drives the viewed-today and viewed-yesterday grouping                                                                                                                                                                                                                                                                                                        | Written from the files phase                                                                                |
| Viewer–huddle state     | viewer + huddle       | Per-participant diagnostics and device state — microphone and camera state are per participant, not per session                                                                                                                                                                                                                                                                                 | Written from the huddles phase                                                                              |
| Search history          | viewer                | Recent-search entries. Already viewer-owned by construction, so the placement was never in question; what the catalog adds is the **access** contract — readable only by their author, never projected to anyone else, never exported, with a stated retention bound and a deletion path, because a stored query can name colleagues and private conversations in its tokens (`README.md` L371) | Written from the search phase                                                                               |
| Viewer preferences      | viewer                | Dismissed banners and explanatory blocks, held as fields of the viewer's own preference record rather than of the object dismissed                                                                                                                                                                                                                                                              | Written from Phase 1                                                                                        |

One member-facing setting deliberately **does not** move. The auto-add setting stays
on the conversation, because its own legend names it as administered rather than
personal — it is the one item in that group whose value is the same for every viewer
by design (`02-channels.md` L1043). Recording the exception is part of applying the
rule; a rule applied to everything indiscriminately is not the rule the catalog
states.

Two items in the first row's list of six restate facts the same row has already named,
because the specification names them twice — once in the relation table's own
enumeration and again in the area document's criterion. The overlap is reproduced
rather than deduplicated, so the cell says what its sources say; the schema holds one
column per fact regardless of how many times the specification lists it.

### The relation count: two readings, neither asserted

The count of these relations is given two different ways by two sources this build is
obliged to follow, and **both readings are recorded here without either being
preferred**.

| Reading    | Source                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| **Ten**    | The catalog's own relation table, counted at source: ten body rows beneath the header (`README.md` L361–L372) |
| **Eleven** | The figure the project's build specification gives for that same table in its narrative                       |

Nothing is done to make the two agree. **No eleventh row is invented to satisfy the
larger reading, and neither reading is deleted to tidy the smaller one.** The table
above therefore carries exactly the rows the catalog carries, and this note carries
the disagreement. The defect is logged in `docs/decisions/catalog-defects.md`, which
is where it is described; repeating the description here would create a second place
for it to be maintained, and the two would eventually differ.

One locator observation belongs with it, offered as evidence and explicitly **not**
as an explanation: the specification cites the table's range as ending one line before
the table's last body row. That is recorded because a reader following the citation
will land one row short, not because it accounts for either figure. Diagnosing the
cause would be reconciling the contradiction, which the corpus-handling rule reserves
for the defects record rather than for an author's inference.

### The two rules the placement produces

Two behaviours follow directly from where these fields live, and both are stated here
because a build that got the placement right and these wrong would still be wrong.

**Unread counts are computed per viewer from the read cursor, never stored as a
denormalized counter.** A viewer's unread count is a projection over the messages
they are authorized to read, above the cursor their own relation row holds. A stored
counter cannot be that, for two reasons that compound: it is one number for an object
many viewers see, so it cannot be right for more than one of them; and it is computed
once, before the reader's authorization is known, so it would count content the
reader may not read — which the read contract names explicitly as a disclosure,
because a count over unreadable content discloses that the content exists
(`00-product-overview.md` L512). The cursor is a stored fact; the count is derived
from it on every read.

**A dismissal is recorded on the viewer's own preference record, never on the object
dismissed.** Dismissing a banner is the clearest possible case of the placement test —
two people opening the same surface may legitimately see different things, because one
of them has already read the banner and the other has not. Written on the banner, one
person's dismissal hides it from everybody who has not seen it yet, which is the
failure the rule exists to prevent, at the cost of a message nobody else ever
received.

### Using both tables without contradiction

The two tables answer two different questions, and the catalog says which is which:
the entity table reads as **the union of fields the interface exposes**, and the
relation table reads as **where each of them lives** (`README.md` L374). A field can
therefore appear in an entity's row because a surface renders it there and still be
stored on a relation, with no contradiction between the two statements.

Where they do appear to disagree about a per-viewer fact, the catalog settles it in
one direction and this schema follows: **the relation table governs.** A rendering is
not a placement.

## Isolation is a property of the read path, not of the callers

The authorization rule this build works under — the second of the five project rules
as provided, governing server-side authorization — requires that **no query can return
a row belonging to a workspace the requesting session does not belong to**. That is a
requirement about every read path, including the ones nobody remembers to think of, so
the model satisfies it structurally in three ways.

**Every tenant row carries the workspace key, and it is not nullable.** A row without
one cannot be filtered, so the predicate that isolates a workspace would have nothing
to bind to. The key is present on every model the tenant owns, including the join
tables and the per-viewer relations, so isolation never depends on reaching a parent
row first.

**The predicate is injected below every caller rather than added per query.** It lives
in a database-client extension spanning all models and all operations, at
`packages/db/src/tenancy.ts`, so a service that forgets it does not get an unfiltered
client — it gets no client at all. This is the difference between an isolation rule and
an isolation mechanism: a rule is satisfied by every call site that remembers, and a
mechanism is satisfied by construction.

**The workspace identifier can only originate server-side.** It is bound from the
authenticated session by `apps/api/src/db/tenancy.ts`, and no route, body, query
parameter, header or socket frame can supply it. The authorization rule states this
prohibition directly — no authorization decision may rest on a caller-supplied
workspace or actor identifier — and the only way to honour it without relying on
review is for the value never to be readable from a request in the first place.

Two consequences of the read contract shape the schema as much as the predicate does.
**Deny by default**: a read path that cannot resolve the viewer's authorization for the
containing object returns nothing rather than returning the object for a later layer to
filter (`00-product-overview.md` L510). And **a cache is a read path**: every cache,
index, materialised aggregate and precomputed count is keyed by tenant and by viewer
authorization scope, never by object identity alone, which is why this model stores
cursors and memberships rather than pre-computed per-viewer answers.

## Shapes that exist so a projection can be authorized

A projection is a read path, and the authorization rule enumerates them: counts,
search results, link previews and link resolution, member lists, facepiles,
autocomplete suggestions, and notifications. Each has to be authorized independently,
and several structures in this model exist for no other reason than to make that
possible. They are listed with the alternative each one rules out, because the
alternative is usually the shape a schema drifts towards on its own.

| Projection                   | The shape that makes it authorizable                                                                                                                                      | What the obvious alternative would leak                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unread counts and badges     | The per-viewer read cursor on the viewer–message relation, counted inside the authorized query                                                                            | A stored counter on the conversation is one number for many viewers and is computed before the reader is known, so it counts content the reader may not read |
| Member lists                 | The conversation-membership relation, which **is** the authorization predicate — the same rows that decide who may read decide who is listed                              | A member array on the conversation cannot be filtered per viewer, so listing it authorizes nothing                                                           |
| Facepiles                    | The same relation, projected with a bound; a facepile is a member list with a count and inherits its authorization rather than reimplementing it                          | A denormalized avatar list is a cached member list, and a cache keyed by object identity serves one viewer's authorized set to another                       |
| Autocomplete suggestions     | Membership plus the workspace key, queried per request; no name index keyed by object identity alone                                                                      | A shared suggestion index discloses the existence of private conversations and of people outside the viewer's scope, one keystroke at a time                 |
| Search results               | The corpus-scope discriminator on the query entity, which splits the workspace-scoped and public paths in two (`README.md` L343)                                          | One path serving both corpora resolves an unauthenticated public query against the reads that carry workspace content                                        |
| Link previews and resolution | A link is stored as a display text and a destination pair, and product links resolve to an **object reference** re-authorized on follow — no preview text is denormalized | Stored preview text is a copy of content made when someone else was authorized, and it survives the revocation that should have removed it                   |
| Notifications                | Notification rows carry a reference and the minimum needed to route the recipient, never the content itself                                                               | A payload carrying content is a projection that has already left the product, where no later check can reach it (`00-product-overview.md` L512)              |
| Cross-workspace reads        | The non-nullable workspace key on every tenant model, plus the catalogue-versus-tenant split that leaves the published tier with **no tenant key at all**                 | A publicly readable object carrying a tenant column makes the read that serves a public page a read of tenant data                                           |
| A refused attempt            | The audit-log row, which is the only record that a denial happened and the only place the attempt can be reviewed                                                         | A denial that logs nothing is indistinguishable from an attempt that never happened, so a pattern of probing is invisible                                    |

Two of those rows are the reason the audit log is part of the model rather than an
operational afterthought, and the reason unread state is a cursor rather than a count.
Neither choice is about normalisation.

## Credentials, consent, audit and idempotency

### Verifier material is never a column on the account

**No credential material is a field of the account record.** The catalog is explicit
that four artefacts this product renders — a password, an expiring one-time code, an
active session and a device-enrolment code — are named on the account entity **only so
that a build cannot mistake their absence for an oversight**, and that none of them is
stored as a field of it or of any entity a read path returns (`README.md` L326,
`01-onboarding-and-auth.md` L778).

The reason they get four tables rather than four columns is that **one lifecycle does
not fit them all**, and applying a single rule to all of them is itself a defect
(`00-product-overview.md` L542). A password is a standing credential that must survive
for years and be re-hashed as guidance moves. A one-time code must die on first use. An
enrolment code is scoped to a single device and revoked in bulk when the grant behind it
is withdrawn. A session must be revocable individually and collectively, and invalidated
when the password changes. Those are four different sets of columns and four different
sets of writes, and a column on the account can only have one of each.

| Table                 | Creation                                                                     | Single-use or reusable                                                     | Expiry                                                                                   | Invalidation                                                                                             | Rotation or re-hash path                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Password verifier     | Written on sign-up and on every password change, one current row per account | **Reusable** — a standing credential, not an issued artefact               | None. A standing credential does not expire on a clock; it is replaced                   | Replaced on change, and the replacement invalidates every session for that account                       | **The verifier stores its own parameters beside the hash**, so a verification that succeeds under old parameters re-hashes under current ones — see below |
| One-time code         | Issued on request for verification or code sign-in                           | **Single-use.** Invalidated on use and on replacement                      | An **absolute timestamp** resolved at issuance                                           | On use, on replacement, on password change, and in bulk when the grant behind it is withdrawn            | Reissue rather than rotation. A new request issues a new row and invalidates the outstanding one                                                          |
| Device-enrolment code | Issued when a device is enrolled                                             | **Single-use**, scoped to the narrowest object it needs to reach           | An **absolute timestamp** resolved at issuance                                           | On use, on replacement, and in bulk when the enrolment grant is withdrawn                                | Reissue. The code is never displayed in full, so rotation is issuance plus invalidation                                                                   |
| Session               | Written on successful authentication                                         | **Reusable** until it expires or is revoked — the record behind the cookie | **Two absolute timestamps**: an idle bound and an absolute bound, both stored on the row | Individually, collectively for one account, on credential change, and by a sign-out-everywhere operation | The identifier is rotated on privilege change, writing a new row and invalidating the old one within the same transaction                                 |

Three properties bind all four rows and are stated once here so that no reader treats
any of them as belonging to one table only: **the raw value is never persisted**, only
a verifier of it; **no artefact of this class is ever placed in a URL or ever displayed
in full**; and **none of them is ever returned by a read path or included in an export**
(`00-product-overview.md` L542, L544). Attempts against every one of them are
rate-limited and bounded server-side. A strength rating computed while a password is
being chosen is transient and is never stored beside the verifier.

The password row's stored parameters are worth one more sentence, because they are what
keeps an upgrade path open. Hashing guidance changes; a verifier written under old
parameters is still correct but no longer current. Storing the memory, time and
parallelism figures **with** each hash means a successful authentication can detect that
its row is behind, compute a fresh verifier from the value the person just presented,
and replace the row — the re-hash-at-next-successful-authentication path. Without the
parameters on the row there is nothing to compare against, and the only remaining
upgrade is to invalidate everyone's password at once. The parameters themselves are a
security floor rather than a setting, which is why they are compile-time invariants
rather than configurable defaults; `docs/decisions/observed-values.md` records that
distinction and the reasoning behind it.

One further class-A artefact belongs to a later phase and is named here so its absence
is not read as an oversight: the promotional-code redemption record. It is a separately
secured record of its own, never a field of the publicly readable tier, and its table
arrives with the commercial phase (`README.md` L341).

### Sessions are server-side revocable records

A session is **a row, not a token**. It is referenced by an HTTP-only cookie, and the
cookie carries an opaque identifier rather than a claim, so revocation is a write to
this table and takes effect on the next request. That is the whole reason the model
holds sessions at all: a self-contained token in the client cannot be revoked, and a
build that stores authorization state where the client keeps it has no way to end a
session it has decided to end.

The row is therefore first-class. It carries the account it authenticates, an idle bound
and an absolute bound — **both as absolute timestamps, never as durations** — and enough
context for a person to recognise and end a session they do not recognise. Individual
revocation deletes or marks one row; sign-out-everywhere invalidates the account's rows
rather than clearing the client; and a password change invalidates them as a matter of
course (`00-product-overview.md` L544). Because the session is a row and the cookie is
opaque, the synchronizer-token pattern is available for mutating requests, which is what
the request-forgery protection depends on.

### Marketing consent is a record of an act, so it is a table

Consent is **not a boolean on the account**. A boolean records a state and loses the act,
and the act is the only thing that makes the state defensible later. The consent contract
requires the act, its timestamp, the exact wording that was presented, the surface it was
presented on and the version of the policy it referenced, all stored together, so that
what a person agreed to can be reproduced rather than asserted (`00-product-overview.md`
L584). None of that fits in a column.

The table therefore holds one row per act — grant or withdrawal — with the subject, the
purpose the wording named, the wording itself, the surface, the policy version and an
absolute timestamp. Four rules follow from the contract and are enforced by the shape:

- **A pre-ticked control is a rendering and never a consent.** The corpus renders the
  marketing checkbox already ticked on one surface and unticked on its sibling, and shows
  nothing at all about what is submitted or stored (`01-onboarding-and-auth.md` L855,
  L931). A tick therefore produces a row only from an affirmative act; a default state
  produces no row, and the absence of a row is the absence of consent.
- **A withdrawal is a row of the same fidelity as the grant**, not a deletion of one. The
  history is the evidence; erasing the grant would erase the proof that the purpose was
  ever permitted.
- **A suppression record outlives the deletion of the contact**, so erasing an address
  cannot silently make it contactable again.
- **The marketing population is separate.** An address collected by a public form is not
  an account and is never merged into one, which is why the public submission structure
  carries no entity identifier and no reference to the account record (`README.md` L326,
  L351).

### The audit log

Two classes of event write to the audit log, and the trigger set is deliberately wider
than "errors":

- **Every authorization denial**, whether it came from an operation check or a projection
  check. A denial is the interesting event precisely because nothing else records it: the
  request produced no row, changed no state and returned no content, so without this table
  it leaves no trace at all.
- **Every administrative action** — role changes, invitation issuance and revocation,
  conversation archival, unarchival, conversion and deletion, member removal, export, and
  every change to workspace configuration.

A row answers four questions without a reader needing another source: **who** attempted it
(the acting session and account, server-derived), **what** they attempted (the operation,
by the same identifier the guard uses), **against which object** (type and identifier,
never a body copy), and **why it was refused** (the failing policy and the capability it
required). It also carries the workspace, so the log is itself tenant-isolated, and an
absolute timestamp. Content never enters a row; a reference does, because an audit trail
that copies message bodies becomes a second uncontrolled read path for them.

### The idempotency-key store

Every mutating endpoint accepts an idempotency key, and the store is what makes the
promise behind it real: **a retried mutation is recognised rather than repeated, and a
replay returns the original outcome.** Without a durable record, a client that never saw
a response has no safe move — retrying risks a duplicate and not retrying risks a lost
write.

A row is keyed by the acting account, the endpoint and the client-supplied key, and holds
the outcome that was returned, a fingerprint of the request that produced it, and an
absolute expiry. Three behaviours follow. A first arrival inserts the row **inside the
same transaction as the mutation**, so a committed effect and its record commit together
or not at all. A repeat arrival with the same key and a matching fingerprint returns the
stored outcome without re-executing. A repeat arrival with the same key and a different
fingerprint is refused rather than served, because two different requests sharing a key is
a client defect and answering one with the other's result would hide it.

For sending a message the store is a second line rather than the first: the uniqueness
constraint on the conversation and the client-generated identifier already makes a
duplicate send unrepresentable, which is
[the third structural invariant](#uniqueness-on-conversation-and-client-identifier) below.

## Every deadline is an absolute timestamp

**No table in this model has a duration column.** Every expiry, window, deadline, bound
and clear-after time is stored as the moment it resolves to, computed once when the
record is written.

The reason is that a stored duration is a second copy of the configuration, and it goes
stale the instant the first copy changes. Store thirty days on an invitation and the
invitation's real deadline depends on a setting that may since have become fourteen —
so reading the record no longer tells you when it expires. Store the resolved moment and
the record is self-describing: **an invitation issued last month keeps the deadline it
was issued with, and this month's setting governs this month's invitations.** The
catalog reaches the same conclusion from its own evidence and states it as a rule for
the invitation family — the record "holds a date, never a duration" (`README.md` L339,
L406).

The values behind those timestamps are not repeated here. Each configured duration, the
reading it came from, whether that reading looked like an original or a remainder, the
default chosen and the reasoning are recorded once in
`docs/decisions/observed-values.md`, alongside the invariants that are deliberately not
configurable. This record describes the column type; that record describes the number.

Two consequences bind, and both are settled rather than open:

- **A resolved timestamp is immutable in both directions.** Lengthening a configured
  default never extends something already issued, and shortening it never cuts something
  short either. Where outstanding access must end sooner, the records concerned are
  explicitly **revoked or reissued** as an authorized, audited operation, rather than a
  date being rewritten underneath a credential its holder already has (`README.md` L409).
- **A rendered figure is computed from the stored timestamp**, never printed from a
  constant. Two surfaces rendering the same deadline from the same row cannot disagree;
  two surfaces printing a configured duration will, the first time the default changes.

Three clocks in this model are separate facts with separate owners, and the catalog is
emphatic that merging them produces a schema that gets all three wrong (`README.md`
L401–L409). The invite link's lifetime is a property of a **shareable link** and lives on
the invitation. The external acceptance window is a property of a **pending
relationship**, held once on the external-organization record, with each issued
invitation carrying its own **resolved date** rather than a second copy of the window.
The guest account end date is a property of an **account** and is an absolute date from
the moment it is set. Different owners, different lifecycles, one column type.

The invite link's own lifetime is additionally contradicted by the specification —
nineteen days in one surface, exactly one month in another, for the same kind of link
(`README.md` L946–L952). This model does not resolve that: it stores **one** lifetime on
the record, renders every surface from the stored value rather than from copy, and
enforces it server-side on redemption, so an expired link is refused whatever any surface
says. The contradiction is logged in `docs/decisions/catalog-defects.md` and the chosen
default in `docs/decisions/observed-values.md`.

## The structural invariants

Four properties this model depends on are enforced **by the database** rather than by the
code that writes to it. The distinction is the point of this section. A convention holds
until someone writes a second code path; a constraint holds because the write fails. Each
one below is a constraint, an index or a mechanism placed below every caller — never a
rule stated in a comment.

### Uniqueness on conversation and sequence

Every message carries a **per-conversation sequence** that is monotonic and gapless, and
a uniqueness constraint on the pair of conversation and sequence makes a second message
at the same position **unrepresentable** rather than merely unlikely.

The sequence is allocated **inside the same transaction as the message insert**, by
locking the conversation's counter row and taking the next value from it:

```text
BEGIN
  SELECT next_seq FROM conversation_counter
    WHERE conversation_id = :id FOR UPDATE   -- one row, not the table
  INSERT INTO message (conversation_id, seq, ...)
    VALUES (:id, :next_seq, ...)             -- same transaction
  UPDATE conversation_counter
    SET next_seq = :next_seq + 1
    WHERE conversation_id = :id
COMMIT                                       -- seq assigned on commit
```

Two concurrent sends into one conversation therefore serialise on that row and receive
consecutive values; a send that rolls back releases the value it held and leaves no hole
behind. The lock is a row lock rather than a table lock, so sends into different
conversations do not contend at all — which matters, because contention here would be
contention on the product's busiest write.

**A native sequence object is rejected, and the reason is not preference.** Database
sequences are **non-transactional by design**: a value handed out is consumed whether or
not the surrounding transaction commits, so a rolled-back send permanently removes a
number from the series. That leaves a gap, and a gap is not a cosmetic defect here — it
is indistinguishable, from the client's side, from a message the client is authorized to
read and has not received. The whole reconnect design rests on a client knowing its
highest **contiguous** sequence and asking for what follows; a series with holes in it
can never become contiguous, so the client would either wait for a message that will
never arrive or refetch on every gap. Sequences also cannot satisfy the requirement that
the sequence be **assigned on commit**, because they assign on call. The counter row can,
because it is an ordinary row participating in the ordinary transaction.

The uniqueness constraint is the backstop that makes the invariant structural rather than
procedural. If a second write path ever allocated a value another way, the constraint
rejects it, and the defect surfaces as a failed insert rather than as two messages
claiming one position.

### A composite index on conversation and sequence

The same pair carries a composite index, and it is what makes **keyset pagination**
possible in practice rather than only in principle. The predicate that fetches history is
"the rows of this conversation whose sequence precedes the last one I saw, newest first",
and without an index on that exact tuple the predicate is correct and slow: the database
would find the conversation's rows and then sort them, every page, at a cost that grows
with the conversation. With it, a page is a range scan whose cost does not care whether
the conversation holds a thousand messages or a million.

**Offset pagination is prohibited**, and no page index crosses the API boundary. An
offset carries a row count and no context, so the database must fetch and discard the
rows being skipped, and any row inserted between two page fetches shifts the window and
produces a duplicate — in a conversation that is being written to while it is being read,
which is the normal case. The cursor is opaque and encodes the keyset tuple; its shape,
its encoding and the endpoints that accept it are specified in
`docs/decisions/http-api-contract.md` rather than here.

### Uniqueness on conversation and client identifier

Optimistic send means the **client** generates the message's identifier before the server
has seen it, so that the sender's own message can render immediately and be reconciled
against the acknowledgement when it arrives. That is a good trade for latency and a bad
one for duplicates: a send whose response was lost will be retried with the same
identifier, and nothing about the second request tells the server it is a repeat.

A uniqueness constraint on the pair of conversation and client-generated identifier is
what closes that. The second insert fails on the constraint, the handler resolves the
existing row and returns it, and the client reconciles against the message it already
created. **The duplicate is not detected and cleaned up; it is never created.** This is
also why the identifier is stored rather than discarded after reconciliation: a constraint
can only enforce uniqueness over a column that exists.

### The ordering authority

**The durable sequence in the database is authoritative for ordering and completeness.**
Nothing else is, and one thing in particular is not: the publish-and-subscribe bus that
carries events between server instances offers **at-most-once** delivery, so a message it
drops is dropped silently and no reader can tell the difference between "nothing happened"
and "something happened and the notice was lost".

A transport with that property can be a delivery accelerator and can never be a source of
truth. So the database holds the ordering, the client persists its highest contiguous
sequence, and a client that reconnects asks over HTTP for what follows before resuming
live delivery. The replay window, the refetch signal when a gap exceeds it, and the event
envelope itself are specified in `docs/decisions/realtime-contract.md`. What belongs here
is only the schema consequence: the sequence column is the reconciliation key, which is
why it is constrained, indexed and gapless rather than merely present.

### The tenancy chokepoint, and why it lives in the database package

The isolation predicate is a **client-extension factory spanning all models and all
operations**, and it lives at `packages/db/src/tenancy.ts` — in the package that owns the
client, below every caller. Placement is the whole design. Inside an application it would
be one application's discipline, and a second consumer of the same database would be free
to forget it; below the client, there is no unextended client for a call site to reach
for. `apps/api/src/db/tenancy.ts` binds the factory to the authenticated session, which is
where the workspace identifier comes from and the only place it can come from.

There is a type consequence worth stating, because it converts a review problem into a
compile problem. The extension changes the type of every query result the services
consume, and the authorization guard's operation union is **exhaustive** — so adding a
model obliges a matching policy entry, and omitting one is a compile error rather than an
unguarded route that passes review. A new table therefore cannot quietly become a new
unauthorized read path; the build stops first.

## Judgements where the specification is silent

A screen capture shows a rendered value. It cannot show a column's type, whether the
column may be empty, or how many rows may exist on the other end of a relationship — so
the specification is silent on all three for most fields, and silence is never permission
to leave the field out. The rule this build works under — the fourth of the five project
rules as provided, governing uncertainty — requires the mechanism to be implemented
anyway, with the choice recorded rather than assumed.

Each row below names what the specification leaves unstated, the options that were
genuinely available, the choice, and why. The bias throughout is the **smallest coherent
behaviour consistent with the adjacent evidenced fields**, and where two options were
equally small, the one that keeps a projection easier to authorize won.

| Left unstated                                              | Options considered                                                                                                                                                        | Choice                                                                                          | Why                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Whether a message's author reference may be empty          | (a) Mandatory author, with a synthetic account standing in for the system · (b) nullable author plus a required author-kind discriminator · (c) one table per author kind | **(b)** — nullable reference, discriminator required, four kinds: person, app, workflow, system | The catalog states authorship is a union that is **optional on every branch**, including a system form with no author at all (`README.md` L411). Option (a) is the tempting shortcut and the leaking one: a synthetic account is an account, so it appears in member lists, facepiles and autocomplete — three authorized projections                 |
| Whether a conversation name is unique, and over what scope | (a) Not unique · (b) unique per workspace among live conversations only · (c) unique per workspace across every lifecycle state, case-folded                              | **(c)**                                                                                         | The name is a **resolution key**: a mention chip and a copied link both resolve a name to exactly one conversation, and two matches make resolution — and therefore re-authorization on resolution — ambiguous. An archived conversation still resolves, because it renders read-only rather than disappearing, so (b) would let a name resolve twice |
| How many rows a reaction is                                | (a) A count column on the message · (b) one row per message and emoji, carrying a count · (c) one row per message, emoji and reactor, unique on the triple                | **(c)**, with the count derived                                                                 | A count is a projection and must be computed over the authorized set, which (a) cannot do. Removing a reaction needs the actor, which (b) cannot supply. And uniqueness on the triple makes a retried reaction idempotent for free                                                                                                                    |
| What happens to a membership row when someone leaves       | (a) Delete the row · (b) keep it with a status value · (c) keep it with an absolute joined-at and a nullable absolute left-at                                             | **(c)** — a null left-at means currently joined                                                 | Deleting loses the distinction between "never joined" and "left", which the read path needs in order to answer a private conversation correctly, and it silently destroys the viewer's per-conversation state on a rejoin. A status value would encode a date's worth of meaning without the date, and dates here are timestamps by rule              |
| Whether deleting a message removes the row                 | (a) Hard delete · (b) soft delete with an absolute deleted-at and the content redacted in the same write · (c) a separate tombstone table                                 | **(b)**                                                                                         | A hard delete removes a sequence value and leaves a **permanent hole**, and the reconnect path cannot distinguish a hole from a message it has not received yet — so (a) breaks the contiguity the sequence invariant exists to provide. Redacting at the write rather than at the read means no later read path can serve the body by accident       |
| How deep bookmark folders nest                             | (a) Arbitrary nesting · (b) exactly one level — a bookmark may name a folder, a folder may not · (c) no folders at all                                                    | **(b)**                                                                                         | The specification evidences bookmarks and bookmark folders and never a folder inside a folder (`README.md` L327). Option (a) commits the schema to structure nobody asked for and every read path then has to walk; (c) drops evidenced behaviour, which the uncertainty rule prohibits                                                               |
| Whether topic, description and purpose may be empty        | (a) Not-null with an empty string as the sentinel · (b) nullable, and clearing writes null                                                                                | **(b)** — an empty string is never stored as a sentinel                                         | "Never set" and "cleared" render identically but are different facts, and a conversation browser row renders a purpose only when one is present. A sentinel forces every reader to know the convention; nullability puts the fact in the column                                                                                                       |
| How long an idempotency row is kept                        | (a) Forever · (b) an absolute expiry per row, pruned by a running process · (c) until the effect it records is superseded                                                 | **(b)**, with the bound held as a compile-time constant in shared configuration                 | A table that only grows becomes an availability problem on the busiest write path, and (c) has no definition for a mutation nothing supersedes. The bound is not a value read from a frame, so it stays a compile-time invariant and the environment surface recorded in `docs/decisions/observed-values.md` stays closed at its five values          |

Every one of those is a decision this record owns. If a later phase finds evidence that
contradicts one, the remedy is to change the row and the migration together — not to let
the schema and the reasoning drift apart.

## Ephemeral state has no table

Three kinds of state are deliberately **not** persisted, and saying so is part of the
model: a reader who finds no table for them should find the reason here rather than
conclude something is missing.

- **Typing indicators are never persisted.** A typing notice is true for a second or two,
  is interesting only to whoever is looking at that conversation at that moment, and is
  worth nothing afterwards. It travels over the socket, is rate-limited server-side, and
  is written nowhere. A stored typing flag would also be a behavioural record of exactly
  the kind the per-viewer placement rule exists to prevent.
- **Presence is derived from heartbeats, not stored as a column.** The dot beside an
  avatar is computed from a heartbeat with a time-to-live and a coalesced fan-out, so it
  expires by itself when a client stops reporting. What _is_ stored is what a person
  deliberately set: the manual away flag, the status text and emoji, and the clear-after
  time — the last of those as an absolute timestamp, like every other deadline here.
- **Device samples are used and discarded.** A sample taken to preview a camera, drive an
  input-level meter or run a diagnostic is transient by contract — never persisted, never
  retained after the surface closes (`00-product-overview.md` L578). Only a capture
  deliberately turned into content becomes a file row, and then it acquires the full
  lifecycle that contract requires.

## Migration and seed posture

**Migrations are checked in** under `packages/db/prisma/migrations/`, so schema history is
reviewable in the same diff as the code that depends on it. The rule that follows is
short: **the schema is never edited without a migration.** A schema file changed on its
own describes a database nobody has, and the first person to discover the difference is
whoever runs the application against a database that was migrated from the real history.

Two seeds exist, and the difference between them is deliberate:

- `packages/db/prisma/seed.ts` creates **two workspaces**, because one workspace cannot
  demonstrate isolation. Every cross-workspace test needs a second tenant whose rows the
  first tenant's session must be unable to reach, and a seed that creates one workspace
  makes the most important property in this model untestable.
- `packages/db/prisma/seed-bulk.ts` creates the bulk fixture the pagination benchmark runs
  against. It is deliberately **outside the default pipeline gate**, so that the gate stays
  fast, and it is runnable on demand.

**Both seeds use original authored names**, and so do the end-to-end fixtures. The sample
conversation names, person names and role labels that appear in the corpus illustrate
shape only; reproducing one as seed data or as a fixture is prohibited by the identity
rule, the fifth of the five project rules as provided, and a fixture is exactly the place
such a name survives a review unnoticed. Where this record needed to refer to a sample
value it described its shape instead, which is why no such name appears above.

## Companion records

| Record                                 | What it holds that this one deliberately does not                                                           |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `docs/decisions/catalog-defects.md`    | The relation-count disagreement, the two stated invite-link lifetimes, and every other specification defect |
| `docs/decisions/observed-values.md`    | Every configured duration, window, threshold and limit, with its evidence, its default and its reasoning    |
| `docs/decisions/http-api-contract.md`  | The keyset cursor's shape and the rule that no page index crosses the API boundary                          |
| `docs/decisions/realtime-contract.md`  | The socket event envelope, the replay window and the reconnect behaviour                                    |
| `docs/decisions/security-contracts.md` | How each of the sixteen specification security contracts is discharged, and where                           |
| `docs/decisions/role-matrix.md`        | The authored capability matrix the authorization guard evaluates against                                    |

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **No frame was opened.** Every fact above was resolved from catalog prose, which the
  corpus-handling rule requires to be attempted first. Where a frame is referred to at all
  it is by **bare number**; no filename appears in this record, and neither does the
  catalog's percent-encoded citation form, because both carry a third-party product name.
- **Rules cited by subject and position, not by identifier.** The five project rules carry
  platform identifiers that each embed a third-party product name, so writing one here
  would breach the identity rule this record is otherwise observing. They are cited by
  what they govern and where they sit in the provided order — the authorization rule is
  the second, the corpus-handling rule the third, the uncertainty rule the fourth, the
  identity rule the fifth. Position alone would be unsafe, because the identifiers are
  permuted relative to the requirement labels; position **with** subject is not.
- **Entity and field names are authored and functional.** Every name above describes what
  the thing does. Third-party software is referred to functionally — a cloud-drive app, a
  poll app, a calendar app — and no third-party product, feature or asset name appears in
  the text, the headings, the table cells or the paths.
- **No copy, colour or artwork is taken from a frame.** No string legible in any capture is
  transcribed, and no colour value appears at all: colour belongs to the token module and
  is out of this record's scope entirely.
- **No diagram fence.** The committed documentation-site configuration does not render one:
  its superfences extension consumes a fenced block before the diagram plugin can claim it,
  so a diagram fence publishes as a highlighted code box (`README.md` L905–L909).
  Relationships are expressed as tables and prose instead. The withheld extension fix is
  not applied and the read-only site configuration is not touched.
- **Fenced lines are held to 74 characters**, the catalog's measured ceiling, because a
  published fence clips rather than wraps.
- **Evidence by citation; absence recorded as absence.** Every claim taken from the
  specification names the document and line it came from. Where the specification says
  nothing, this record says so and records the judgement made instead, with its options and
  its reasoning.
- **Inconsistencies preserved, not reconciled.** Two are carried above rather than settled:
  the ten-versus-eleven relation count, with both readings and neither asserted, and the two
  stated lifetimes for the invite link. Both are logged in
  `docs/decisions/catalog-defects.md`. Correcting the specification in place is prohibited;
  recording the defect is the remedy.
