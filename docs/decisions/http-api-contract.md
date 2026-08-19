# The HTTP API contract — conventions, prohibitions and the route families

This record is the **narrative form of the REST surface**. It is not the surface itself. The
machine-readable truth is the generated specification at
`packages/shared/src/openapi/openapi.json`, emitted from the schemas in `packages/shared`, and
where that artifact and this record disagree about a **shape**, the artifact is right and this
record is wrong and gets corrected.

What a generated document cannot express is why this record exists. A specification can list a
parameter; it cannot say that a whole class of parameter is **prohibited**. It can describe a
header; it cannot say that a repeated header must return the first outcome rather than perform
the write twice. It can name an identifier in a path; it cannot say that the identifier selects a
target and confers nothing. Those are conventions and prohibitions, they are the substance of
this file, and on those this record is authoritative.

| Field        | Value                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status       | Accepted. Every convention below is binding on Phase 1 and on every phase that extends it                                                                |
| Applies to   | `apps/api/src/routes/**`, `apps/api/src/plugins/**`, `apps/web/src/api/**`, `packages/shared/src/schemas/**`, `packages/shared/src/openapi/**`           |
| Subordinate  | To `packages/shared/src/openapi/openapi.json` on **shapes**; authoritative on conventions, prohibitions, the session model and the authorization notes   |
| Verification | `apps/api/test/integration/**` per family, `apps/api/test/integration/idempotency/**` for replay and conflict, `e2e/specs/**` for the client's use of it |
| Companions   | `docs/decisions/role-matrix.md`, `docs/decisions/data-model.md`, `docs/decisions/observed-values.md`, `docs/decisions/realtime-contract.md`              |

## Scope and status

Sixteen route families are specified: health, the specification document, auth, sessions,
workspaces, invitations, channels, channel members, channel bookmarks, messages, reactions,
files, preferences, users, search and the placeholder routes. That is the whole of the Phase-1
HTTP surface. A deferred area's destination is present as a placeholder route rather than absent,
because a control that leads nowhere is a defect rather than a deferral.

Two neighbouring records **delegate** content to this one, so it is specified here and nowhere
else:

- `docs/decisions/realtime-contract.md` names this record as the owner of the replay endpoint,
  the keyset cursor's encoding and the idempotency-key header every send carries.
- `docs/decisions/data-model.md` names this record as the owner of the cursor's shape, its
  encoding and the endpoints that accept it, keeping only the index that makes the predicate fast.

## How this record cites, and what it deliberately does not repeat

- A document citation names a file under `docs/workflows/` with its line number, so `README.md`
  below is the specification index in that directory and never the one at the repository root.
- A frame is cited by **bare number**, and only where a frame settled something. No filename
  appears here, and neither does the catalog's percent-encoded citation form, because both carry
  a third-party product name.
- The project rules are cited by **subject and position in the order they were provided** — the
  component rule first, the authorization rule second, the corpus-handling rule third, the
  uncertainty rule fourth, the identity rule fifth. Each rule's platform identifier begins with a
  prohibited product name, so writing one here would breach the identity rule this record is
  otherwise observing. Position alone would be unsafe, because the identifiers are permuted
  against the requirement labels; position **with** subject is not.
- Every path segment, field name, error code and example value in this record is **authored**. No
  name legible in any capture appears here, and none may appear in a fixture or a seed row.
- Four things this record points at rather than restates, because a second copy of any of them is
  a second thing to keep true: who may call what (`docs/decisions/role-matrix.md`), the shapes and
  constraints underneath these routes (`docs/decisions/data-model.md`), the configured durations
  and their evidence (`docs/decisions/observed-values.md`), and the socket envelope, replay window
  and reconnect order (`docs/decisions/realtime-contract.md`).

## Conventions

### The versioned prefix

Every product route sits under **`/api/v1`**. The version is a **path segment** rather than a
header, and the reason is legibility rather than purity: a path version is readable in an access
log, in a proxy rule, in a browser address bar and in a support transcript, while a header version
is invisible in all four. The cost is the usual one — the version is part of every address — and
it is accepted, because the alternative hides the single most useful fact about a request from
every place a person looks at requests.

**The health routes are the deliberate exception and sit outside the prefix.** An operational
probe is not part of the product contract, and a probe whose address moves when the product's
version moves breaks orchestration for no benefit. They are addressed at `/health` and
`/health/ready` and are the only routes in this contract without the prefix.

A second version, when one is ever needed, is an additional prefix rather than a mutation of this
one. `/api/v1` does not change shape after it ships; that is what a version is for.

### Resource naming

- **Collections are plural nouns.** `/channels`, `/messages`, `/invitations`, `/sessions`.
- **An identifier appears in the path**, never in a query parameter, when it selects the thing
  being addressed: `/channels/{channelId}`.
- **A genuinely dependent collection is a sub-resource.** A message belongs to one conversation
  and cannot be addressed sensibly without it, so it is
  `/channels/{channelId}/messages/{messageId}`. A reaction belongs to one message, so it nests
  again. The nesting stops there, because a path that names four ancestors is a path nobody reads
  correctly.
- **Nesting is consistent even where it is redundant.** A message identifier is unique on its own,
  so `/messages/{messageId}` would resolve — and it is not used. Carrying the conversation in the
  path means the policy that authorizes the operation has the object it authorizes against without
  a second lookup, and it makes a mismatched pair a defined outcome rather than an accident. A
  message identifier that does not belong to the named channel is treated as **absent**, exactly as
  a private channel is, and for the same reason.
- **A verb is avoided where the operation is a resource mutation**, which is most of them: a rename
  is a `PATCH` of the channel, not `/channels/{channelId}/rename`.
- **A state transition is addressed as a noun sub-resource rather than as a verb.** Archiving is a
  `POST` to `/channels/{channelId}/archival` and unarchiving is a `DELETE` of the same address; the
  same shape gives pinning and unpinning one address and two methods. This is not stylistic. A
  transition that changes what may be written to a conversation is authorized by its own policy,
  audited as its own act and confirmed by its own dialog, so it needs **its own address** — and
  folding four differently-authorized transitions into a `PATCH` of one channel field would put
  them behind one policy, which is the failure the authorization rule is written against. Giving
  each its own noun keeps the address space free of verbs while keeping the policies separate.
- **A verb is used only where the operation genuinely is not a resource mutation.** Signing up and
  signing in create no resource the caller then addresses; they present a credential. Those, and
  only those, read as actions.
- **A per-viewer sub-resource is addressed as `me`.** `/channels/{channelId}/members/me` is the
  caller's own membership row. `me` is a literal, not an identifier: it resolves from the session,
  so no account identifier is written by the caller on any route that reads or writes their own
  per-viewer state.

### The response envelope

**There is no wrapper.** A successful response body is the resource, the paged envelope, or
nothing at all; a failed response body is the structured error. The status code says which, and a
second signal inside the body saying the same thing again is a second thing that can disagree with
the first.

A paged read returns exactly one shape, defined once in
`packages/shared/src/schemas/pagination.ts` and never re-declared by a route:

```text
{
  "items": [ ... ],
  "nextCursor": "<opaque token>" | null,
  "hasMore": true | false
}
```

That module holds `hasMore` and `nextCursor` in agreement by construction — a next cursor exists
exactly when another page does — so the two can never tell a client different stories. Because the
shape is closed and refined, **a route may not add a field to it**; a read that needs to say
something the envelope cannot say needs its own response shape, which is why the replay read below
is a separate route rather than a flag on this one.

### The structured error shape

One shape, declared once in `packages/shared` beside the rejection-code families it draws from, so
the server and the client cannot hold different ideas of what a failure looks like:

```text
{
  "code": "auth_email_invalid",
  "message": "<one authored sentence>",
  "details": [
    { "field": "email", "code": "auth_email_invalid" }
  ]
}
```

- **`code` is a stable, machine-readable string** and is the only part a client may branch on. Codes
  are snake_case and family-prefixed, matching the constants the shared schemas already declare:
  `auth_*`, `upload_*`, `content_*`, `workspace_*`, `preference_*`, `pagination_*` and
  `idempotency_*`. A code is part of the contract and is not renamed once it ships.
- **`message` is drawn from authored copy** in `packages/shared/src/copy/en.ts` and is for a person.
  It is never parsed, never matched on, and never assembled from a caller's input echoed back.
- **`details` is present only where validation failed**, and carries one entry per rejected field so
  a form can mark three fields at once — which the state matrix requires as one of its six
  validation presentations (`docs/decisions/state-matrix.md`). A failure that is not field-level
  omits it rather than sending an empty array.
- **A code never carries a value.** No rejected input, no identifier the caller did not already
  have, and no part of a decoded cursor appears in a code, a message or a detail entry.

### Status codes, and why absence is not refusal

A small set, used consistently. The interesting row is the last pair.

| Status | Meaning in this contract                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| `200`  | A read succeeded, or a mutation succeeded and returns the affected resource                                      |
| `201`  | A mutation created a resource, whose address is returned in the location header                                  |
| `204`  | A mutation succeeded and there is nothing to return — a revocation, a dismissal, a removal                       |
| `400`  | The request is malformed against its schema. `details` names the fields                                          |
| `401`  | No usable session. The client's move is to authenticate, not to retry                                            |
| `403`  | The caller may see that the object exists and may not perform this operation on it                               |
| `404`  | The object does not exist **or** the caller may not read it. The two are one answer, deliberately                |
| `409`  | A conflict: an idempotency key reused with a different payload, or a uniqueness constraint the caller can act on |
| `413`  | A declared upload size exceeds the ceiling the upload contract sets                                              |
| `429`  | A rate limit applied. The body carries a distinct code and an absolute reset instant                             |
| `500`  | A fault in this process. No detail about it reaches the caller, and it is logged with a correlation identifier   |

**`404` rather than `403` for anything the caller may not read is a security decision, not a
convenience.** A refusal answers the question: telling a caller they may not open a private channel
tells them the channel exists, which for a private channel is most of what was being protected. So
a private channel a viewer is not a member of is **absent** — from the browser, from a count, from
a facet, from a search result and from a direct address (`02-channels.md` L954, and again as an
acceptance criterion at L1040). `403` is reserved for the case where existence is already legitimately
known to the caller: a member of a readable channel who lacks the role for a particular operation on
it. The distinction is recorded in full in `docs/decisions/role-matrix.md`, which is also where the
rule that absence is stronger than refusal is argued.

### Every instant in a response is absolute

**No response field carries a remaining duration.** Not seconds remaining, not days left, not a
countdown. Every deadline, expiry, window end, reset moment and schedule time is an **absolute
instant** in coordinated universal time, and a client that wants to render "in three days" computes
it from that instant against its own clock.

This is the API-surface consequence of a rule the data model already enforces: no table has a
duration column, because a stored duration is a second copy of the configuration and goes stale the
moment the first copy changes (`docs/decisions/data-model.md`). Serving a duration would undo that
at the boundary — two clients rendering the same deadline from two differently-aged countdowns will
disagree, while two clients rendering the same instant cannot.

The same rule governs the values behind those instants. **A page size, a rate-limit window, an
expiry window and a retention window are named constants consumed by reference, never literals
written at a call site.** The configurable ones, their evidence, the reading each came from and the
default chosen are recorded once in `docs/decisions/observed-values.md`; the ones that are floors
rather than settings are compile-time constants in `packages/shared/src/config/constants.ts`. This
record names constants and does not restate their numbers, except in the one table below where the
page-size bounds are quoted with their owning module named, because a reader sizing a client needs
them in front of them.

## Authentication and the session

**The API is cookie-authenticated, and the cookie names a server-side record.** A session is a
row, not a self-contained token: the cookie carries an opaque identifier and every fact that
matters — which account, which workspace, when it idles out, when it expires absolutely, whether
it has been revoked — lives in the row it names.

Three properties follow, and each is load-bearing rather than decorative:

- **Revocation is a write.** Signing out, revoking another of one's own sessions, or an
  administrator ending one is an update to a row, which takes effect on the next request. A
  self-contained token cannot be revoked before it expires without inventing a revocation list,
  which is a session store with extra steps.
- **The cookie is HTTP-only, same-site-lax and secure.** HTTP-only keeps it beyond the reach of
  script, which is what makes a script-injection defect a bug rather than a session theft;
  same-site-lax keeps it off cross-site requests that were not top-level navigations; secure keeps
  it off plaintext transport.
- **No token of any kind is placed in local storage, session storage or any other client-side
  store.** There is nothing for a client to keep, because the credential is a cookie the browser
  manages and the authority is a row the server owns. A client that felt the need to persist an
  authentication artifact would be a client that had been handed one, and none is handed out.

The session's two bounds — idle and absolute — are configured defaults recorded in
`docs/decisions/observed-values.md`, stored on the row as absolute instants, and enforced on the
server. Reaching either ends the session; neither is derived from the other.

### Request-forgery protection

**Every mutating route is guarded.** Because the credential is a cookie, a browser attaches it to
a request whether or not this application asked for the request to be made, so a mutation needs a
second signal that the application itself initiated it.

The pattern used is the **synchronizer token**, and it is available precisely because of the
modelling decision above: the pattern needs server-side state to compare a submitted token
against, and a session that is a row provides it. A build that had kept authorization state in the
client would have had to reach for a weaker double-submit variant. The token is issued on a reply,
carried by the client on every mutating request, and compared server-side; the plugin that does it
is named in `docs/decisions/security-contracts.md` and is not re-specified here.

The guard applies to **`POST`, `PATCH`, `PUT` and `DELETE` without exception**, including the routes
that establish a session, because a forged sign-in is a session fixation attempt rather than a
harmless request. The routes that legitimately run before any session exists are still guarded; a
first request obtains the token, which costs a round trip once and closes the fixation path
permanently.

### The content-security posture at the API boundary

**Headers are set explicitly rather than left to a framework's defaults**, because a default does
not know that this product has a separate storage origin, and a default is not a decision anybody
made. The shape that matters at this boundary:

- The **pre-signed storage origin is admitted for images, media and connections**, because uploads
  go directly there and their bytes never transit the API.
- **Scripts stay self-only, with no inline exception** — no inline allowance, no unsafe evaluation,
  no blanket data scheme for a script source.

That asymmetry is the policy working: the storage origin must be reachable for content and must
never be able to script the application. The full header set and the plugin that emits it are in
`docs/decisions/security-contracts.md`.

## Authorization at the boundary

The authorization rule — the second of the five as provided — is the rule this section exists to
satisfy, and it is satisfied structurally rather than by diligence at each call site.

### The acting workspace and the acting actor come from the session only

**No request may carry a workspace identifier or an actor identifier that influences an
authorization decision.** Not in a path, not in a query, not in a body, not in a header. The
acting account and the acting workspace are read from the session row the cookie names, on the
server, on every request.

This is why **no route in this contract has a workspace identifier segment.** The workspace is not
addressed because it is not chosen by the caller: `/api/v1/workspaces/current` names the workspace
the session is already scoped to, and `current` is a literal rather than an identifier. Two routes
legitimately concern more than one workspace and neither breaks the rule:

| Route                                   | Why it is not an exception                                                                                                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/v1/workspaces`                | The workspace chooser. It is scoped to the **account** on the session and returns exactly the workspaces that account holds a membership in. No account identifier is accepted; the session supplies it |
| `POST /api/v1/sessions/workspace-scope` | Scopes the session to one workspace. The selector in the body is validated **against the account's own memberships** before the session is rescoped, so it selects among an already-authorized set      |

The second of those is the clearest illustration of the distinction this section turns on, so it is
stated as a rule of its own.

### A path identifier is a target selector, not an authorization input

A channel identifier in a path looks superficially like a caller-supplied authorization input. It
is not one, and the difference is worth stating precisely because getting it wrong in either
direction produces a defect.

- **What a selector does:** it names which object the caller is asking about.
- **What a selector never does:** it establishes that the caller may have it.

Every selector is resolved and then **validated against the session's scope** — the workspace the
session is scoped to, and the caller's authorization for that specific object — before anything is
read or written. A selector naming an object in another workspace does not resolve, because the
isolation predicate is applied below the query rather than after it. A selector naming a private
channel the caller cannot read resolves to **absent**.

The same reasoning governs the cursor, and the shared pagination module states it in the same
terms: the conversation identifier recovered from a cursor is an **untrusted echo** of something
the caller sent, anyone can mint a well-formed cursor naming any conversation, so a cursor that
decodes cleanly is checked against the conversation the route already authorized and is rejected
on mismatch. A well-formed cursor is not evidence of permission.

### Workspace isolation on every read

Every read path enforces workspace isolation, and it does so **below every caller** rather than at
each call site: a database-client extension spanning all models and all operations, bound to the
authenticated session, at `packages/db/src/tenancy.ts` and bound in the API by
`apps/api/src/db/tenancy.ts`. There is no unextended client for a route to reach for, which is the
difference between an isolation rule and an isolation mechanism — a rule is satisfied by every call
site that remembers.

The consequence for this contract is that **no route documents its own isolation**, because no
route implements it. A row belonging to another workspace is not filtered out of a response; it is
never fetched.

### The eight projections, each authorized independently

A projection is a read path, and the authorization rule closes the list at eight. Every route in
the tables below that produces one names **which** projection it is, because the leak is different
in each case and the test is written from the leak.

| #   | Projection               | Where it appears in this contract                                                                                                     |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Counts                   | Member counts, per-type tab counts and unread figures carried on channel and conversation reads                                       |
| 2   | Search results           | `GET /api/v1/search`, and the channel browser with its facets, which the specification names as the leak site (`02-channels.md` L954) |
| 3   | Link previews            | A preview rendered beside an address in message content                                                                               |
| 4   | Link resolution          | `GET /api/v1/files/{fileId}`, and any address followed into a conversation, re-authorized at resolution time                          |
| 5   | Member lists             | `GET /api/v1/channels/{channelId}/members` and the workspace member directory                                                         |
| 6   | Facepiles                | The bounded member list a conversation header renders, served by the member route rather than by a second one                         |
| 7   | Autocomplete suggestions | `GET /api/v1/users/suggestions` and `GET /api/v1/channels/suggestions`                                                                |
| 8   | Notifications            | The delivery paths that leave the product; no Phase-1 route serves them, and the projection is authorized where they are dispatched   |

Each of the eight is authorized **independently**, through `apps/api/src/authz/projection-guard.ts`,
because each leaves the product by a different route: a count as a number, a search result as a row,
a preview as text, a resolution as an address, a member list as an enumeration, a facepile as a
cached list, a suggestion as a typeahead row, and a notification as something already gone. One check
on one of those routes protects that route and looks, in review and in a passing test, as though it
protected all eight. The behaviour required of each, and the leak each would produce, is tabulated in
`docs/decisions/role-matrix.md`.

**The facepile is not served by its own route.** It is a bounded member list, so it is the member
route with a small page size and it inherits that route's authorization rather than reimplementing
it. A denormalized copy of it would be a cache keyed by object identity, which serves one viewer's
authorized set to another.

### Every mutation passes one guard

Every mutating route in the tables below passes `apps/api/src/authz/guard.ts`, evaluated **at the
point of execution**, against the acting session and the **specific target object** — not against a
class of object, not against a route name, and not against what the client rendered. A control that
is hidden, disabled or absent in the interface exempts nothing: the server is asked the same
question whether or not the client would have allowed the request to be made.

The guard's operation union is exhaustive, so a route added without a policy fails to compile rather
than shipping unpoliced. Every denial emits a structured audit record through
`apps/api/src/observability/audit-log.ts` carrying who attempted what, against which object, and why
it was refused.

### The denial test that ships with every route

Every mutation and every projection introduced here **ships with a test** asserting that a
non-member and a wrong-role caller receive a server-side denial, and that a private resource is
absent from every one of the eight projections. A non-member and a wrong-role caller are different
callers and both are required: the first has no membership row, the second has one and lacks the
capability, and a route can pass one while failing the other. The suites are
`apps/api/test/integration/authz/**`, `apps/api/test/integration/tenancy/**` against two seeded
workspaces, and `apps/api/test/integration/projections/**`.

## The cursor contract

This section is written as a **prohibition** rather than a preference, because a preference is
something a later route can decline and a prohibition is not.

### No page index exists in this contract

**No page index exists anywhere in this contract. Offset pagination is prohibited outright. A page
number never crosses the API boundary in either direction.** Not as a parameter, not as a field,
not as a header, not inside a cursor, and not in the generated specification. There is no parameter
that counts rows to skip and no parameter that names an ordinal position in a set of pages.

A reader checking that claim mechanically will find the four spellings a page index conventionally
takes in **no parameter and no field name** in this record, and will find the English word for the
prohibited primitive in exactly three places: the sentence above, the heading of the section
immediately below, and that section's opening sentence. It appears nowhere else, and in no table.

### Why an offset is the wrong primitive

The rule is easier to keep when the reason is understood, so the reason is stated rather than
asserted.

An offset carries **a row count and no context**. It says "skip this many" and nothing about which
rows those were, so two things follow, and the second is the one that actually breaks a product:

- **The database must fetch and discard.** To answer "skip nine hundred, return fifty" the engine
  finds nine hundred and fifty rows and throws nine hundred away, and the work grows with how far
  the reader has scrolled. A conversation with a million messages makes that cost visible.
- **Rows inserted between two reads shift the window.** A conversation is written to while it is
  being read — that is the normal case, not the edge case — so a row arriving between one read and
  the next pushes the boundary along and the reader sees a row twice. Nothing in the protocol
  notices, and the defect presents as duplicated messages under load.

A predicate that selects **what follows the last row the reader actually saw** has neither problem.
It is stable under concurrent insertion because it is anchored to a row rather than to a count, and
it is faster because the index seeks straight to the anchor. The cost, which is real, is stated in
the trade-off below.

### The cursor is opaque and encoded

The anchor crosses the boundary as a **cursor**: an opaque, encoded token.

- **The client receives it, stores it and returns it unmodified.** It never parses it, never
  constructs one, never edits one and never derives one from another. To a client it is a string
  whose only meaning is "the position I had reached".
- **It encodes the keyset tuple** — the conversation and the sequence — and nothing else. No page
  number, no row count, no timestamp, no filter state and no identity.
- **One codec produces and consumes it**, at `packages/shared/src/util/cursor.ts`, used by both
  sides. There is no second encoder, not even a one-line one for a single call site, because two
  codecs are two things that can drift and the failure mode is a token one side mints and the other
  rejects.
- **The encoding is canonical, and tampering is detected rather than tolerated.** The decoder
  validates the payload and then re-encodes it through the public encoder, requiring an exact match,
  so any value that is not the one canonical form of the position it claims is rejected. The check
  cannot drift from the encoder because it **is** the encoder.
- **A rejection never echoes the token.** A malformed cursor produces `pagination_cursor_invalid`
  and no part of the rejected value reaches a message, a log line or a detail entry.
- **A well-formed cursor is not evidence of permission.** The conversation it decodes to is an
  untrusted echo, checked against the conversation the route already authorized, and a mismatch is
  `pagination_cursor_conversation_mismatch` rather than a read of the conversation the cursor named.

### The trade-off, stated honestly

**Keyset pagination cannot jump to an arbitrary page.** There is no way to ask for "the fifth page"
because there is no fifth page — there is only "what follows this row". A reader can go forward, can
go backward, and cannot teleport.

That is a genuine loss and it is irrelevant to the only Phase-1 consumer, which is an infinite
query: a conversation scrolled upward through its history, and a browser scrolled downward through a
list, both of which ask for what follows what they have. No Phase-1 surface offers a page control to
jump with. The trade is therefore accepted deliberately rather than tolerated, and the deliberation
is recorded because a later phase might inherit a surface that wants a pager — a tension the
recorded-inconsistency table at the end of this record states rather than resolves.

### The whole-stack consequence

Keyset pagination is not a server-side implementation detail that a client can be unaware of. It
changes every layer, and each layer's obligation is concrete:

| Layer                  | What keyset pagination obliges                                                                                                                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The database           | A **composite index on the conversation-and-sequence tuple**, which is what turns the predicate from correct-and-slow into a range scan whose cost does not care whether the conversation holds a thousand messages or a million (`docs/decisions/data-model.md`) |
| The schema             | A cursor token and a page size, and no ordinal position of any kind, declared once in `packages/shared/src/schemas/pagination.ts`                                                                                                                                 |
| The generated document | The same shape, because it is generated from that schema rather than written beside it                                                                                                                                                                            |
| The API                | A read that resolves the caller's cursor against the conversation it already authorized, then applies the predicate                                                                                                                                               |
| The client             | An infinite query that passes back the **full keyset** it was given — the token, which carries both halves of the tuple — rather than a count of pages it has seen                                                                                                |

### The paginated request and response envelope

One request shape and one response shape, both from
`packages/shared/src/schemas/pagination.ts`. Query parameters are decoded from text by the transport
in `apps/api` and reach the contract as the values they are, so the generated specification describes
a page size as an integer rather than as an integer-or-string union.

| Parameter   | Required | Bound                                                                 | Meaning                                                                                                                                     |
| ----------- | -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `cursor`    | No       | A token this product's codec produced                                 | The position to read from. **Absent means from the beginning** — one representation, not two, so a client sends no field rather than a null |
| `pageSize`  | No       | `MIN_PAGE_SIZE` to `MAX_PAGE_SIZE`, defaulting to `DEFAULT_PAGE_SIZE` | How many rows to read. Out of range is `pagination_page_size_out_of_range`, never a silent clamp                                            |
| `direction` | No       | `forward` or `backward`, defaulting to `forward`                      | Which way to travel along the conversation-and-sequence tuple                                                                               |

The three page-size constants are quoted once, here, with their owning module named, because a
client author needs them and because they are compile-time bounds rather than configured defaults:
`MIN_PAGE_SIZE` is 1, `DEFAULT_PAGE_SIZE` is 50 and `MAX_PAGE_SIZE` is 200, all in
`packages/shared/src/schemas/pagination.ts`. A route that wants its own scope or sort filters extends
that request shape rather than declaring a second opinion about page size.

The response carries `items`, `nextCursor` and `hasMore`, and carries **no total count**. That
omission is deliberate on two grounds. A total over a conversation is a count computed across rows
the caller may not be authorized to see, which makes it a projection and the most easily leaked one;
and a total is the one figure an infinite scroll never needs, since what it needs is whether to fetch
again. `hasMore` answers exactly that question and is held in agreement with `nextCursor` by the
schema, so a client may branch on either.

## Idempotency

### The header

**Every mutating endpoint accepts an idempotency key**, carried in the request header
`idempotency-key`. The name is declared once, as `IDEMPOTENCY_KEY_HEADER` in
`packages/shared/src/schemas/idempotency.ts`, and a route that writes its own header literal has
created a second contract.

| Question                        | Answer                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required or optional?           | **Required** on every mutating route. Optionality would make the safe path the one a client has to remember                                                             |
| What happens when it is absent? | The request is rejected with `idempotency_key_missing` and **nothing executes**. It is not treated as a one-off unkeyed write                                           |
| What shape is the key?          | The monorepo's lexicographically-sortable identifier form, validated by delegating to the one canonical check in `packages/shared/src/util/ulid.ts` — no second pattern |
| Who mints it?                   | The client, once per intended mutation, before the first attempt. A retry reuses the same key; a new intention gets a new key                                           |
| Malformed?                      | `idempotency_key_malformed`. The distinction from missing comes from inspecting the input at one boundary, so a route gets it from a single parse                       |
| Is it a credential?             | **No.** It travels in a header, is minted by the caller, and confers nothing. Passing this check says the value has the right shape and says nothing about who sent it  |

### The semantics

A repeated key returns the **original outcome** rather than performing the mutation a second time.
Three cases, and each is a defined behaviour rather than a best effort:

| Case                                             | Behaviour                                                                                                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| First arrival                                    | The mutation executes and the record is inserted **inside the same transaction**, so a committed effect and its record commit together or not at all |
| Repeat with the same key and a matching request  | The stored outcome is returned **without re-executing**. The response is the first one, including its status                                         |
| Repeat with the same key and a different request | Rejected with `idempotency_key_conflict` and **nothing executes**                                                                                    |

**The store is durable, not in-memory,** and lives in the database
(`docs/decisions/data-model.md`). The reason is architectural rather than cautious: this system is
designed to run as **multiple instances**, and a retry has no reason to land on the instance that
served the first attempt. An in-memory cache would make idempotency a property of routing luck,
which is worse than not having it, because it would appear to work in a single-instance test and
fail in production.

A row is keyed by **the acting account, the endpoint and the client-supplied key**, so one caller's
key cannot collide with another's and one key reused across two different endpoints is two records
rather than a cross-endpoint replay. The acting account comes from the session, as everything else
does; the key alone is never the lookup, because a key-only store would turn a header into a read
primitive that anyone could guess their way into.

### Retention, and reuse with a different payload

The store keeps a record for **a bounded window and no longer**, because a key store that grows
without limit is an availability problem rather than a correctness one. The window is a **configured
value consumed by reference**, and the row holds the **absolute instant** it expires rather than the
duration it was given — so the configured default can change without invalidating a record already
written. This record deliberately states no number, exactly as the shared module does; restating one
would create the second copy the uncertainty rule exists to prevent.

**Reuse with a different payload is an error, never a silent replay.** Detection is by a
**fingerprint of the request** stored beside the outcome: a repeat whose fingerprint differs is
refused with `idempotency_key_conflict` and executes nothing. This is the case that makes a key
_safe_ rather than merely convenient. Without it, one key reused against a different payload either
returns an answer to a question nobody asked — the first mutation's result, served for the second
request — or performs a second unintended write. Both are worse than a rejection, and the second is
irreversible.

After the window passes, a key is forgotten and a request bearing it is a first arrival again. A
client retrying past the retention window is a client whose retry was never going to be safe, and
the send path has a second line of defence for exactly that case.

### Optimistic send, and the constraint underneath it

For sending a message the idempotency key is the **second** line rather than the first, and the two
mechanisms work together:

| Mechanism                                                             | What it protects                                                                                                                                                                                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The **client-generated message identifier** carried in the body       | Lets the sender's own message render immediately and be reconciled against the acknowledgement, which carries back the client identifier, the authoritative identifier, the assigned sequence and the server's commit instant |
| The **idempotency key** in the header                                 | Makes the endpoint safe to retry in general, independently of whether the body happens to carry a client identifier                                                                                                           |
| A **uniqueness constraint on the conversation and client identifier** | The database-level backstop. The second insert fails on the constraint, the handler resolves the row that already exists and acknowledges it                                                                                  |

**The duplicate is never created rather than detected and cleaned up afterwards**, which is why the
client identifier is stored rather than discarded after reconciliation: a constraint can only enforce
uniqueness over a column that exists. A send whose response was lost is therefore retried with the
**same** client identifier and the same key, and both paths converge on one message. The
acknowledgement's fields, the reconciliation the client performs and the reconnect step that resolves
an unacknowledged row are specified in `docs/decisions/realtime-contract.md`; the constraint itself is
in `docs/decisions/data-model.md`.

## The route families

### How to read the tables

Sixteen families, one table each, every table with the same seven columns.

- **`Method`** and **`Path`** are exact. Paths carry the `/api/v1` prefix in full, except the two
  health routes, which sit outside it deliberately.
- **`Mutating?`** decides two things at once: whether the route passes the operation guard and
  whether it requires an idempotency key. Every `Yes` row does both.
- **`Idempotency key`** reads `Required` on every mutating row and `Not applicable` on a read.
  There is no third value, because an optional key would make the safe path the one a client has to
  remember.
- **`Authorization note`** names the operation as `docs/decisions/role-matrix.md` names it and
  reuses that record's condition tags — `member`, `readable`, `writable`, `own`, `self`,
  `conversation-read`, `at-creation`, `re-checked` and the rest — rather than restating cells. Where
  a row produces a projection it names **which of the eight** it is. Where a row accepts an
  identifier, that identifier is a target selector validated against the session's scope and is
  never an authorization input.
- **`Paginated?`** reads `Keyset` or `No`. There is no third value here either.

A `POST` that mutates nothing appears **once** below, and it is deliberate rather than an oversight:
an email address must not travel in a query string, where it lands in access logs, proxy logs and
browser history, so the one route that takes an address purely as a lookup input takes it in a body.
It is marked `No` under `Mutating?` and carries no idempotency key, and the forgery guard still
applies to it, because the guard is keyed to the method rather than to the semantics.

### Family 1 — Health

| Method | Path            | Purpose                                                | Mutating? | Idempotency key | Authorization note                                                                                                | Paginated? |
| ------ | --------------- | ------------------------------------------------------ | --------- | --------------- | ----------------------------------------------------------------------------------------------------------------- | ---------- |
| `GET`  | `/health`       | Liveness: this process is up and serving               | No        | Not applicable  | No session required. Reports process state only — never a row, a name or a count — so there is nothing to isolate | No         |
| `GET`  | `/health/ready` | Readiness: the database and the bus are both reachable | No        | Not applicable  | No session required. Reports reachability as a boolean per dependency and discloses no configuration and no data  | No         |

These two are the only routes outside the versioned prefix, and they are the only routes in this
contract that require no session. Both answer with a fixed shape whose fields never vary with who
is asking, which is what makes leaving them open safe rather than convenient.

### Family 2 — The specification document

| Method | Path                   | Purpose                                                                 | Mutating? | Idempotency key | Authorization note                                                                                                                        | Paginated? |
| ------ | ---------------------- | ----------------------------------------------------------------------- | --------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `GET`  | `/api/v1/openapi.json` | Serves the generated specification exactly as it is committed in source | No        | Not applicable  | An authenticated session is required. The document describes **shapes and never data**, so it is not a projection and nothing is isolated | No         |

The document served is the committed artifact at `packages/shared/src/openapi/openapi.json`, not a
document assembled per request, so what a caller reads here is what a reviewer read in the diff.
Requiring a session is the smallest coherent choice rather than an evidenced one: the specification
enumerates every route and every field name, which is reconnaissance value to an anonymous caller
and no benefit to one, and every legitimate consumer either holds a session or holds the repository.

### Family 3 — Auth

`auth` owns the **presentation of a credential**; the `sessions` family owns the lifecycle of the
record a credential produced. Every route here is rate-limited.

| Method | Path                                        | Purpose                                                                      | Mutating? | Idempotency key | Authorization note                                                                                                                                                         | Paginated? |
| ------ | ------------------------------------------- | ---------------------------------------------------------------------------- | --------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `POST` | `/api/v1/auth/sign-up`                      | Begins an account from an email address, recording any marketing-consent act | Yes       | Required        | Passes the guard. `no-actor`: the operation runs before a session exists, the matrix is not consulted, and a session presented on such a request confers nothing           | No         |
| `POST` | `/api/v1/auth/verification-codes`           | Issues a one-time code to an address                                         | Yes       | Required        | Passes the guard. `no-actor`. Issuance is **bounded** and rate-limited per account, per address and per source (`01-onboarding-and-auth.md` L930)                          | No         |
| `POST` | `/api/v1/auth/email-verification`           | Verifies an address against a presented code                                 | Yes       | Required        | Passes the guard. `code-match`: bound to the address, unconsumed, absolute expiry not passed. **Single-use**, and issuing a replacement invalidates outstanding codes      | No         |
| `POST` | `/api/v1/auth/account-confirmation`         | Completes the account once its address is verified                           | Yes       | Required        | Passes the guard. `no-actor`                                                                                                                                               | No         |
| `POST` | `/api/v1/auth/workspace-lookup`             | Resolves which workspaces an address may enter                               | No        | Not applicable  | A non-mutating `POST` so the address travels in a body rather than a query string. Answers from the workspaces that address already belongs to and enumerates nothing else | No         |
| `POST` | `/api/v1/auth/sign-in/password`             | Signs in by presenting a password                                            | Yes       | Required        | Passes the guard. `credential`: a password verifier for the address matches. Verifier parameters and their upgrade path belong to the secret handling                      | No         |
| `POST` | `/api/v1/auth/sign-in-codes`                | Requests an emailed one-time code for signing in                             | Yes       | Required        | Passes the guard. `no-actor`, bounded and rate-limited as above                                                                                                            | No         |
| `POST` | `/api/v1/auth/sign-in/code`                 | Signs in by presenting an emailed code                                       | Yes       | Required        | Passes the guard. `code-match`, single-use                                                                                                                                 | No         |
| `POST` | `/api/v1/auth/sign-in-links`                | Requests a sign-in link                                                      | Yes       | Required        | Passes the guard. `no-actor`. The link is a capability whose absolute deadline is resolved at issuance                                                                     | No         |
| `POST` | `/api/v1/auth/password-resets`              | Requests a password reset                                                    | Yes       | Required        | Passes the guard. `no-actor`. Answers identically whether or not the address is known, so the route enumerates no account                                                  | No         |
| `POST` | `/api/v1/auth/password-resets/completion`   | Completes a reset by presenting the artifact and a new password              | Yes       | Required        | Passes the guard. `reset-artifact`: unconsumed and its absolute expiry not passed                                                                                          | No         |
| `PUT`  | `/api/v1/auth/password`                     | Changes one's own password                                                   | Yes       | Required        | Passes the guard. `self`, and the current password is presented alongside the new one                                                                                      | No         |
| `POST` | `/api/v1/auth/marketing-consent/withdrawal` | Records a withdrawal of marketing consent                                    | Yes       | Required        | Passes the guard. `self`. A withdrawal is **a recorded act**, not a flag cleared, so the record captures the act and the wording that was shown                            | No         |

Four properties of this family are contracts rather than implementation choices:

- **The verification-code path is server-bounded, rate-limited and single-use.** Attempt counts are
  enforced on the server, the code is invalidated on use and on replacement, and no artefact of this
  class is ever placed in an address or displayed in full. The specification states this directly as
  an acceptance criterion (`01-onboarding-and-auth.md` L930) while showing none of the mechanism, and
  notes separately that code entry is an anti-automation surface the corpus does not depict (L859).
- **A password-strength value is transient and is never transmitted or persisted.** It is computed
  while a password is being chosen, in the client, as a hint to a person. It is not a fact about an
  account, so no request carries it and no column holds it.
- **No credential is ever returned.** No password, code, artifact, link token or session identifier
  appears in a response body from any route in this contract. The specification carries the same
  prohibition as an acceptance criterion (`01-onboarding-and-auth.md` L927).
- **A rejection never says which half failed.** A wrong address and a wrong password produce one
  code, `auth_credential_rejected`, because two codes would make this family an account-enumeration
  oracle.

### Family 4 — Sessions

| Method   | Path                               | Purpose                                                               | Mutating? | Idempotency key | Authorization note                                                                                                                                                              | Paginated? |
| -------- | ---------------------------------- | --------------------------------------------------------------------- | --------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `GET`    | `/api/v1/sessions`                 | Lists the caller's own sessions                                       | No        | Not applicable  | `own-account`. Scoped to the caller's account **from the session**; no account identifier is accepted, so there is no shape in which one caller lists another's                 | No         |
| `GET`    | `/api/v1/sessions/current`         | Reads the acting session, its workspace scope and its absolute bounds | No        | Not applicable  | `own-session`. Bounds are returned as **absolute instants**, so the client renders any countdown itself                                                                         | No         |
| `DELETE` | `/api/v1/sessions/current`         | Signs out of the current session                                      | Yes       | Required        | Passes the guard. `own-session`. Revocation is a write to the row, effective on the next request                                                                                | No         |
| `DELETE` | `/api/v1/sessions/{sessionId}`     | Revokes another session of one's own account                          | Yes       | Required        | Passes the guard. `own-account`. The identifier is a **target selector** validated against the caller's account; a session of another account is **absent**                     | No         |
| `DELETE` | `/api/v1/sessions`                 | Signs out everywhere                                                  | Yes       | Required        | Passes the guard. `own-account`, applied to every session row of the caller's account including the current one                                                                 | No         |
| `POST`   | `/api/v1/sessions/workspace-scope` | Scopes the session to one of the caller's workspaces                  | Yes       | Required        | Passes the guard. The selector in the body is validated **against the account's own memberships** before the session is rescoped, so it selects among an already-authorized set | No         |

The session list is not paginated, and that is a decision rather than an omission: a person's set of
live sessions is bounded by the devices they sign in from, so the smallest coherent behaviour is one
response. If a later phase gives an administrator a view over another account's sessions, that view
is a different route with a different policy and it paginates by keyset.

### Family 5 — Workspaces

| Method  | Path                                 | Purpose                                                     | Mutating? | Idempotency key | Authorization note                                                                                                                                                                | Paginated? |
| ------- | ------------------------------------ | ----------------------------------------------------------- | --------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `POST`  | `/api/v1/workspaces`                 | Creates a workspace, with the creating account as its owner | Yes       | Required        | Passes the guard. Any account may create; a guest may not                                                                                                                         | No         |
| `GET`   | `/api/v1/workspaces`                 | The chooser: the workspaces the caller's account may enter  | No        | Not applicable  | Scoped to the **account** on the session, returning only workspaces it holds a membership in. The one legitimate read that spans workspaces, and it accepts no account identifier | No         |
| `GET`   | `/api/v1/workspaces/current`         | Reads the workspace the session is scoped to                | No        | Not applicable  | Membership of that workspace. Any figure it carries is Projection **1**, computed inside the authorized query                                                                     | No         |
| `PATCH` | `/api/v1/workspaces/current`         | Renames the workspace or changes a setting                  | Yes       | Required        | Passes the guard. Two matrix operations with two policies: renaming, and changing a setting under `not-owner-only` for an administrator                                           | No         |
| `PUT`   | `/api/v1/workspaces/current/setup`   | Submits one step of the setup wizard                        | Yes       | Required        | Passes the guard. `own-new-workspace`: the workspace the caller has just created and whose wizard has not been completed                                                          | No         |
| `GET`   | `/api/v1/workspaces/current/members` | The workspace member directory                              | No        | Not applicable  | Projection **5** — member lists. A guest reads it under `scoped-directory`, projected to the channels and people they may already read, computed inside the authorized query      | No         |

`current` is a literal, not an identifier. **No route in this family — or anywhere in this contract
— accepts a workspace identifier**, because the acting workspace is a property of the session and
never of the request.

### Family 6 — Invitations

| Method   | Path                                 | Purpose                                                                  | Mutating? | Idempotency key | Authorization note                                                                                                                                                                           | Paginated? |
| -------- | ------------------------------------ | ------------------------------------------------------------------------ | --------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `POST`   | `/api/v1/invitations`                | Invites a member, or a guest with a channel scope, with an optional note | Yes       | Required        | Passes the guard. `invite-policy` for a member; a guest invitation additionally requires `scope-member` and `budget`, so nobody scopes an account into a channel they cannot read themselves | No         |
| `POST`   | `/api/v1/invitations/link`           | Issues or replaces the shareable invitation link                         | Yes       | Required        | Passes the guard. `invite-policy` for a member. The link is a reusable capability, so the single-use rule of a one-time code deliberately does not apply to it                               | No         |
| `GET`    | `/api/v1/invitations/link`           | Reads the current shareable link and its deadline                        | No        | Not applicable  | Same cell as issuing it. The deadline is an **absolute instant** resolved at issuance, never a count of days remaining                                                                       | No         |
| `DELETE` | `/api/v1/invitations/{invitationId}` | Revokes a pending invitation                                             | Yes       | Required        | Passes the guard. `own-invitation` for a member. The identifier is a target selector; an invitation of another workspace is **absent**                                                       | No         |
| `POST`   | `/api/v1/invitations/acceptance`     | Redeems an invitation                                                    | Yes       | Required        | Passes the guard. `invitation-valid`: resolves to an unconsumed invitation whose **absolute** deadline has not passed. The only route in this family reachable without a prior session       | No         |

The deadline is enforced **on redemption**, against the instant stored on the record, by the single
service that issues invitations reading the shared constant. A configured default that changes later
neither extends nor shortens a link already issued; where outstanding access must end sooner the
invitation is revoked, which is an authorized and audited operation rather than a date rewritten
underneath a credential its holder already has. The chosen default, the reading it came from and the
specification's own contradiction about it are recorded in `docs/decisions/observed-values.md`.

### Family 7 — Channels

| Method   | Path                                              | Purpose                                                                  | Mutating? | Idempotency key | Authorization note                                                                                                                                                                         | Paginated? |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------------ | --------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `POST`   | `/api/v1/channels`                                | Creates a channel with a name and a visibility                           | Yes       | Required        | Passes the guard. `channel-policy` for a member. The add-everyone-at-creation option is a **separate operation** under `at-creation`, authorized by its own policy in the same transaction | No         |
| `GET`    | `/api/v1/channels`                                | The browser: scope, type and sort filters over the workspace's channels  | No        | Not applicable  | Projection **2** — search results. A private channel the caller may not read is absent from the rows, from the facets and from every count (`02-channels.md` L954, L1040)                  | Keyset     |
| `GET`    | `/api/v1/channels/suggestions`                    | Channel typeahead for a mention                                          | No        | Not applicable  | Projection **7** — autocomplete suggestions. Computed from membership plus the workspace key on every request, never from a cache keyed by object identity                                 | No         |
| `GET`    | `/api/v1/channels/{channelId}`                    | Reads one channel with its topic, description and member count           | No        | Not applicable  | `readable`. The member count is Projection **1** and the header's facepile is Projection **6**, both computed inside the authorized query                                                  | No         |
| `PATCH`  | `/api/v1/channels/{channelId}`                    | Renames the channel or edits its topic or description                    | Yes       | Required        | Passes the guard. `member` for a member, `readable` for an owner or administrator. Three matrix operations, three policies, one address because all three are field edits                  | No         |
| `POST`   | `/api/v1/channels/{channelId}/private-conversion` | Converts a public channel to private                                     | Yes       | Required        | Passes the guard. Its own policy, and irreversible in this phase, so the client confirms it                                                                                                | No         |
| `POST`   | `/api/v1/channels/{channelId}/archival`           | Archives the channel                                                     | Yes       | Required        | Passes the guard. Its own policy. Archiving changes what may be **written** and changes nothing about who may read (`02-channels.md` L1014)                                                | No         |
| `DELETE` | `/api/v1/channels/{channelId}/archival`           | Unarchives the channel                                                   | Yes       | Required        | Passes the guard. Its own policy, and it restores every affordance archiving removed in one act                                                                                            | No         |
| `PUT`    | `/api/v1/channels/{channelId}/add-on-join`        | Sets the standing flag that adds new accounts to this channel on joining | Yes       | Required        | Passes the guard. Owner or administrator under `readable`; a member is denied. This is the administrator-only rule the matrix records                                                      | No         |
| `DELETE` | `/api/v1/channels/{channelId}`                    | Deletes the channel                                                      | Yes       | Required        | Passes the guard. Owner or administrator under `readable`; a member is denied even on a channel they belong to                                                                             | No         |

**The browser is not a ninth projection.** The specification names it and its facets as the place an
unscoped implementation leaks, and this contract maps them onto Projection **2** rather than coining
a new one, because the authorization rule's list is closed at eight and a reader should never have to
decide which enumeration is authoritative.

### Family 8 — Channel members

| Method   | Path                                              | Purpose                                                 | Mutating? | Idempotency key | Authorization note                                                                                                                                  | Paginated? |
| -------- | ------------------------------------------------- | ------------------------------------------------------- | --------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `GET`    | `/api/v1/channels/{channelId}/members`            | Lists the channel's members, and serves the facepile    | No        | Not applicable  | Projection **5** — member lists — and Projection **6** for the facepile, which is this route with a small page size rather than a second route      | Keyset     |
| `POST`   | `/api/v1/channels/{channelId}/members`            | Adds another account to the channel                     | Yes       | Required        | Passes the guard. `member, target-in-workspace`: only a member may add, and only an account already in the workspace. This is the members-only rule | No         |
| `DELETE` | `/api/v1/channels/{channelId}/members/{personId}` | Removes another account from the channel                | Yes       | Required        | Passes the guard. `member, not-self`; a member additionally requires `target-not-owner`. Leaving is the other route, not this one                   | No         |
| `PUT`    | `/api/v1/channels/{channelId}/members/me`         | Joins a public channel                                  | Yes       | Required        | Passes the guard. `public`. Idempotent by shape as well as by key: a second call finds the membership it would create                               | No         |
| `DELETE` | `/api/v1/channels/{channelId}/members/me`         | Leaves the channel                                      | Yes       | Required        | Passes the guard. `member`                                                                                                                          | No         |
| `PATCH`  | `/api/v1/channels/{channelId}/members/me`         | Sets the caller's own notification scope, mute and star | Yes       | Required        | Passes the guard. `member`. Three matrix operations that share one authorization cell exactly, so they share one policy and one address             | No         |

`me` resolves from the session. **No route here accepts the caller's own account identifier**, which
is what makes "one account writing another's per-viewer state" unrepresentable rather than merely
forbidden. Per-viewer state lives on the membership relation rather than on the channel, so nothing
written through the last row is visible to anyone else (`docs/decisions/data-model.md`).

### Family 9 — Channel bookmarks

| Method | Path                                            | Purpose                                         | Mutating? | Idempotency key | Authorization note                                                                                                | Paginated? |
| ------ | ----------------------------------------------- | ----------------------------------------------- | --------- | --------------- | ----------------------------------------------------------------------------------------------------------------- | ---------- |
| `GET`  | `/api/v1/channels/{channelId}/bookmarks`        | Reads the channel's bookmarks and their folders | No        | Not applicable  | `readable`, inherited from the channel. A bookmark is not a projection of anything beyond the channel it hangs on | No         |
| `POST` | `/api/v1/channels/{channelId}/bookmarks`        | Adds a bookmark                                 | Yes       | Required        | Passes the guard. `member`; a single-channel guest is denied                                                      | No         |
| `POST` | `/api/v1/channels/{channelId}/bookmark-folders` | Creates a bookmark folder                       | Yes       | Required        | Passes the guard. `member`; a single-channel guest is denied                                                      | No         |

A bookmark's destination is a link, so it is canonicalized and restricted to the two admitted
schemes before it is stored, with no opener reference and no referring address on the way out. That
contract is discharged in `apps/api/src/links/` and is described in
`docs/decisions/security-contracts.md`.

### Family 10 — Messages

| Method   | Path                                                         | Purpose                                                                | Mutating? | Idempotency key | Authorization note                                                                                                                                                 | Paginated? |
| -------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- | --------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `GET`    | `/api/v1/channels/{channelId}/messages`                      | Reads conversation history                                             | No        | Not applicable  | `conversation-read`. The cursor's conversation is checked against the channel this route already authorized, and a mismatch is refused rather than followed        | Keyset     |
| `POST`   | `/api/v1/channels/{channelId}/messages`                      | Sends a message, carrying the client-generated identifier              | Yes       | Required        | Passes the guard. `member, writable`: an archived conversation is not writable, and a send into one archived a moment earlier is refused at execution              | No         |
| `PATCH`  | `/api/v1/channels/{channelId}/messages/{messageId}`          | Edits one's own message                                                | Yes       | Required        | Passes the guard. `own, writable`. Editing another account's message is denied for **every** account type, with no override                                        | No         |
| `DELETE` | `/api/v1/channels/{channelId}/messages/{messageId}`          | Deletes a message                                                      | Yes       | Required        | Passes the guard. `own, writable`; another account's requires the distinct `moderation` capability, policed by its own policy and audited as an administrative act | No         |
| `PUT`    | `/api/v1/channels/{channelId}/messages/{messageId}/pin`      | Pins the message to the conversation                                   | Yes       | Required        | Passes the guard. `member`; a guest is denied                                                                                                                      | No         |
| `DELETE` | `/api/v1/channels/{channelId}/messages/{messageId}/pin`      | Unpins the message                                                     | Yes       | Required        | Passes the guard. `member`; a guest is denied                                                                                                                      | No         |
| `POST`   | `/api/v1/channels/{channelId}/messages/{messageId}/forwards` | Forwards the message into another conversation                         | Yes       | Required        | Passes the guard. `both-conversations`: read on the source **and** write on the destination, each checked separately against its own object                        | No         |
| `POST`   | `/api/v1/channels/{channelId}/scheduled-messages`            | Schedules a message for a stated instant                               | Yes       | Required        | Passes the guard. `member, writable, re-checked`: authorization is evaluated again **at delivery** and is never inherited from the scheduling call                 | No         |
| `POST`   | `/api/v1/channels/{channelId}/snippets`                      | Posts a snippet as a message                                           | Yes       | Required        | Passes the guard. `member, writable`. Content is the only required field, which is an invariant rather than a setting (`03-messaging-and-composer.md` L761)        | No         |
| `GET`    | `/api/v1/channels/{channelId}/messages/replay`               | Serves the gap a reconnecting client is missing, or asks it to refetch | No        | Not applicable  | `conversation-read`, re-evaluated on this request rather than inherited from the socket that dropped                                                               | No         |

Three notes this family cannot do without:

- **The scheduled instant is absolute**, supplied and returned as an instant rather than as a delay,
  so the strip the client docks above the composer renders from the stored value
  (`03-messaging-and-composer.md` L766). A re-check at delivery is what makes a schedule safe: an
  account removed from the conversation between scheduling and delivery does not deliver.
- **Message content is a structured document, never markup.** The body is validated against the
  allowlist in `packages/shared/src/schemas/content.ts` — a discriminated union the server
  re-validates independently of whatever editor produced it — and is encoded per output sink at
  render time, with match highlighting treated as a distinct sink.
- **A message identifier that does not belong to the named channel is absent, not refused.** It is
  the same rule as the private channel and the same rule as the mismatched cursor: a selector that
  does not resolve inside the caller's authorized scope resolves to nothing.

### Family 11 — Reactions

| Method   | Path                                                                      | Purpose                    | Mutating? | Idempotency key | Authorization note                                                                                          | Paginated? |
| -------- | ------------------------------------------------------------------------- | -------------------------- | --------- | --------------- | ----------------------------------------------------------------------------------------------------------- | ---------- |
| `POST`   | `/api/v1/channels/{channelId}/messages/{messageId}/reactions`             | Adds a reaction            | Yes       | Required        | Passes the guard. `member, writable`                                                                        | No         |
| `DELETE` | `/api/v1/channels/{channelId}/messages/{messageId}/reactions/{emojiName}` | Removes one's own reaction | Yes       | Required        | Passes the guard. `own, writable`. Removing another account's reaction is denied for **every** account type | No         |

There is no read route here. A message's reactions travel with the message row, so a separate read
would be a second projection of the same rows with a second chance to disagree with the first.

### Family 12 — Files

| Method | Path                                    | Purpose                                                                 | Mutating? | Idempotency key | Authorization note                                                                                                                                                             | Paginated? |
| ------ | --------------------------------------- | ----------------------------------------------------------------------- | --------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| `POST` | `/api/v1/uploads`                       | Initiates a transfer and returns an upload identifier and a destination | Yes       | Required        | Passes the guard. `member, writable` against the conversation the upload is for. Issuing a destination is issuing a capability and is authorized as one                        | No         |
| `POST` | `/api/v1/uploads/{uploadId}/completion` | Declares a transfer complete so the object becomes referable            | Yes       | Required        | Passes the guard. `own-upload`: the upload record was created by the caller's own session                                                                                      | No         |
| `GET`  | `/api/v1/files/{fileId}`                | Resolves a stored file to a brief access address                        | No        | Not applicable  | Projection **4** — link resolution. Re-authorized against the **caller's current** authorization for the conversation the file belongs to, never trusted from an earlier grant | No         |

**Uploads are pre-signed, and file bytes never transit the API.** These three endpoints initiate and
complete a transfer and resolve a stored object; not one of them carries content. The client uploads
directly to the storage origin using the destination it was issued, which is why the content-security
policy admits that origin for images, media and connections while keeping scripts self-only.

That is worth more than a layering preference. A byte stream that never reaches this application
cannot exploit this application's parsers, cannot be written to a log by accident and cannot consume
the request path's memory. The declared size and type are enforced by the pre-signed policy at the
storage end rather than trusted from the client, and the grant's lifetime is a configured value read
by `apps/api/src/storage/presign.ts` — brief by design, because a standing address is a standing
grant.

### Family 13 — Preferences

| Method   | Path                                             | Purpose                                     | Mutating? | Idempotency key | Authorization note                                                                                                               | Paginated? |
| -------- | ------------------------------------------------ | ------------------------------------------- | --------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `GET`    | `/api/v1/preferences`                            | Reads the caller's own preferences          | No        | Not applicable  | `self`. The record is selected **by the session**, so no account identifier is accepted on this route or any other in the family | No         |
| `PATCH`  | `/api/v1/preferences`                            | Writes the caller's own preferences         | Yes       | Required        | Passes the guard. `self`                                                                                                         | No         |
| `POST`   | `/api/v1/preferences/dismissals`                 | Records that the caller dismissed something | Yes       | Required        | Passes the guard. `self`. Recorded on the **viewer's own** record, never on the object dismissed                                 | No         |
| `DELETE` | `/api/v1/preferences/dismissals/{dismissibleId}` | Restores one dismissed thing                | Yes       | Required        | Passes the guard. `self`. The identifier names a dismissible, not an account                                                     | No         |
| `DELETE` | `/api/v1/preferences/dismissals`                 | Restores every dismissed thing              | Yes       | Required        | Passes the guard. `self`                                                                                                         | No         |

**Reading another account's preferences is denied for every account type, and this contract has no
route that could express it.** The absence of the route is the enforcement; the policy is the second
line for the case where a later phase adds one.

### Family 14 — Users

| Method  | Path                        | Purpose                                 | Mutating? | Idempotency key | Authorization note                                                                                                                                                                            | Paginated? |
| ------- | --------------------------- | --------------------------------------- | --------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `GET`   | `/api/v1/users/me`          | Reads the caller's own profile          | No        | Not applicable  | `self`, resolved from the session                                                                                                                                                             | No         |
| `PATCH` | `/api/v1/users/me`          | Updates the caller's own profile        | Yes       | Required        | Passes the guard. `self`. A profile carries no credential field, so nothing here is a secret                                                                                                  | No         |
| `GET`   | `/api/v1/users/{userId}`    | Reads another account's profile summary | No        | Not applicable  | Workspace isolation applies below the query. What it may disclose about channel membership is bounded by Projection **5**, so it never reveals membership of a channel the caller cannot read | No         |
| `GET`   | `/api/v1/users/suggestions` | Person typeahead for a mention          | No        | Not applicable  | Projection **7** — autocomplete suggestions. The most corrosive projection to leak, because it discloses one keystroke at a time and looks like a feature working                             | No         |

### Family 15 — Search

| Method | Path             | Purpose                                                     | Mutating? | Idempotency key | Authorization note                                                                                                                                                          | Paginated? |
| ------ | ---------------- | ----------------------------------------------------------- | --------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `GET`  | `/api/v1/search` | Searches the conversations and messages the caller may read | No        | Not applicable  | Projection **2** — search results. The channel and its messages are **outside the query's corpus** for a caller who may not read them, rather than filtered from its output | Keyset     |

**The contract does not leak the implementation.** The route sits behind a substitutable interface,
`apps/api/src/search/SearchIndex.ts`, with a full-text implementation behind it in
`postgres-fts.ts`. Callers see a term, a keyset page and an envelope; they see nothing that would
break if the implementation were replaced, which is the whole reason the interface exists.

Phase 1 ships the route, its authorization and its envelope. The **faceted result surface** — the
filter rails, the grouping and the result presentation — belongs to the search area, which is
deferred, so the Phase-1 client uses the shell's search entry and the destination is a placeholder.
Recording that split here rather than leaving the route undescribed is deliberate: the contract is
fixed now, so the deferred surface inherits it instead of inventing one.

### Family 16 — Placeholders

| Method | Path                                 | Purpose                                                                    | Mutating? | Idempotency key | Authorization note                                                                                                                                                        | Paginated? |
| ------ | ------------------------------------ | -------------------------------------------------------------------------- | --------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `GET`  | `/api/v1/placeholders/{destination}` | Describes a deferred destination: what it will be, and which phase owns it | No        | Not applicable  | An authenticated session, and nothing further. The response carries no workspace row, no count and no name, so there is nothing to isolate and no projection to authorize | No         |

**A deferred destination resolves to a defined surface rather than to a not-found**, because a
control that leads nowhere is a defect and not a deferral. All sixteen deferred destinations resolve,
and what each placeholder says is settled in `docs/decisions/placeholder-surfaces.md`.

The `destination` segment is validated against a **closed enumeration** of those sixteen, so an
unrecognised value is a rejection rather than a lookup. That matters more than it looks: an
open-ended segment reflected into a response is the shape a content-injection defect takes, and a
closed enumeration cannot be reflected because it cannot be extended by a caller.

## The replay read, specified here because the realtime record delegates it

`docs/decisions/realtime-contract.md` sends the reconnect gap over the authorized HTTP read path and
names this record as the owner of the endpoint. It is
`GET /api/v1/channels/{channelId}/messages/replay`.

**Why it is a separate route from history rather than a parameter on it.** The paged envelope is a
closed, refined shape — a next cursor exists exactly when another page does — so it cannot carry a
third answer. Replay has exactly that third answer: _do not read pages, start again_. Adding a
refetch flag to the paged envelope would either break the refinement or produce an envelope whose
fields contradict each other, so replay gets its own address and its own response shape.

| Aspect                                          | Contract                                                                                                                                                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Position parameter                              | `fromSequence`, the client's persisted **highest contiguous sequence** for this conversation. It is the client's own state rather than a token the server minted, which is why it is a number here and an opaque token everywhere else |
| The full keyset                                 | The conversation comes from the path and the sequence from the query, so the request still carries the **whole** tuple. There is no ordinal position of any kind, here or anywhere                                                     |
| Bound                                           | At most `REALTIME_REPLAY_WINDOW_EVENTS` events per conversation, a compile-time invariant in `packages/shared/src/config/constants.ts`                                                                                                 |
| Gap within the bound                            | The events after the position, **in sequence order**. The client applies them in order and advances its cursor once, after the whole gap is applied                                                                                    |
| Gap exceeds the bound                           | A **refetch signal carrying no events**. Never a truncated range: a client applying a partial range would advance its cursor as though it were complete, manufacturing the silent gap the whole design exists to eliminate             |
| Position ahead of the server's highest sequence | A refetch signal. The client's stored state is inconsistent with the server's, and starting again is the only safe answer                                                                                                              |
| Authorization                                   | `conversation-read`, evaluated **on this request**. A reconnect is not a resumption, so no decision carries over from the socket that dropped                                                                                          |
| Idempotency                                     | Not applicable. It is a read, and it is naturally repeatable — applying an event twice is a no-op because application is keyed by sequence                                                                                             |

The refetch path itself is the **ordinary paginated read** of family 10, entered with no cursor: the
client discards its cached history and its cursor, reads the conversation from the top by keyset, and
sets its cursor from what it receives. That is heavier than replay and rarer than replay, which is
the trade the bound exists to make.

## The rate-limit posture

**The authentication paths and the send path are rate-limited.** Those two, specifically, and for two
different reasons: an attempt bound is required for the class of artefact a password and a one-time
code belong to, and a send path without a bound is an availability hole that any authenticated client
can walk into.

- **The limits are named constants, consumed by reference.** `RATE_LIMIT_AUTH_MAX`,
  `RATE_LIMIT_AUTH_WINDOW_SECONDS`, `RATE_LIMIT_SEND_MAX` and `RATE_LIMIT_SEND_WINDOW_SECONDS` are
  documented in `.env.example` with their defaults. No handler writes a number.
- **A limited response is `429` and carries a distinct machine-readable code**, so the client can
  render the rate-limited state rather than the generic failure state. The authentication paths use
  the codes the shared auth contract already declares — `auth_rate_limited` for a limited request,
  `auth_issuance_limited` where issuance rather than entry is what was bounded, and
  `auth_attempts_exhausted` where a budget is spent rather than merely paced. Three codes rather than
  one, because the client renders three different things and a person needs to know which happened.
- **The reset is an absolute instant**, in the body, exactly as every other instant in this contract
  is. Where the conventional response header is also set, it uses the header's **date** form rather
  than its seconds form, because that is the absolute variant the standard already provides. A client
  computes any countdown from the instant.
- **A limit is enforced per account, per address and per source** on the code paths, which is what the
  specification asks for as an acceptance criterion (`01-onboarding-and-auth.md` L930). A limit keyed
  to one of the three alone is trivially sidestepped by varying the other two.
- **A limited response never says whether the address exists.** The limiter answers before the
  credential check, so it cannot become the enumeration oracle the credential check was careful not to
  be.

**The rate-limited state is unevidenced in the corpus and is therefore authored.** The specification
records the absence directly: no frame shows a rate-limit, quota-exceeded or throttled state, and the
one readout that might be mistaken for it is a duration display rather than a refusal
(`21-states.md` L467, frame 189). The state's presentation, the options considered and the choice are
registered in `docs/decisions/gap-register.md` and drawn in `docs/decisions/state-matrix.md`. The same
is true of the not-found presentation this contract's `404` produces: no frame shows a not-found
surface for a missing resource, and the observed error page names an unknown cause and carries no
status code at all (`21-states.md` L469, frame 1020).

## Agreement with the generated specification

### The generation direction, stated unambiguously

**The shared schemas are the single source.** They are written once in
`packages/shared/src/schemas/**`, and three consumers read them: the server validates requests with
them, the client derives its types from them, and the specification is **generated** from them by
`packages/shared/src/openapi/generate.ts` through the registry in `openapi/registry.ts`.

The generated document is **committed**, at `packages/shared/src/openapi/openapi.json`, and the
commitment is the point. A specification generated in a pipeline and thrown away is a specification
nobody reviews; a committed one turns every contract change into a visible diff that a reviewer reads
alongside the change that caused it.

### The obligation this creates

**A schema change obliges regenerating the committed specification in the same change.** Not in a
follow-up, not in a nightly job. The two artifacts are one contract expressed twice, and a change that
updates only the schema ships a document that lies about the server — which is worse than having no
document, because a reader trusts it.

The same obligation binds the other direction: the committed document is never hand-edited. An edit
that is not the generator's output is an assertion about the server that no schema backs, and it
survives exactly until the next regeneration silently reverts it.

### This record's own subordination

Stated plainly, because a narrative that quietly competes with a generated artifact is a liability:

| Question                                                      | Authority                                                                                                 |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| What fields does this request carry, and what types are they? | `packages/shared/src/openapi/openapi.json`, generated from the schemas                                    |
| What does this response look like?                            | The generated specification                                                                               |
| Is a parameter optional, and what is its bound?               | The generated specification                                                                               |
| Is there a page index anywhere?                               | **This record.** There is not, and the prohibition is not derivable from a document that simply lacks one |
| What must happen when an idempotency key is repeated?         | **This record.** A header's semantics are not expressible as a shape                                      |
| Where does the acting workspace come from?                    | **This record.** A specification cannot say that a field's absence is deliberate                          |
| Who may call this route?                                      | `docs/decisions/role-matrix.md`                                                                           |

**Where this narrative and the generated specification disagree about a shape, the generated
specification is correct and this record is corrected.** This record remains authoritative only for
what a generated document cannot express: the no-page-index prohibition, the idempotency semantics,
the session model, the authorization notes and the conventions that produced the paths.

## Recorded absences and preserved inconsistencies

The catalog specifies **no HTTP surface at all** — it names no path, no method, no header and no
status code anywhere in its twenty-five documents, and the one place a status code would have been
visible is a frame the specification notes carries none (`21-states.md` L469). Every path segment,
field name and error code in this record is therefore **authored**, which the identity rule requires
independently. That is an absence recorded rather than a gap filled quietly.

| #   | Absence or inconsistency                                                                                                                                                                                                                           | How this record treats it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A **pagination row** contract exists in the component inventory and is described as distinct from infinite scrolling, "which the corpus never shows" (`00-product-overview.md` L375, rolled up at `README.md` L253)                                | **Stated, not resolved.** The contract's citing areas are 00, 09, 10, 11, 16, 17 and 20. Area 00 is a Phase-1 area, but it is also the document that **defines** every component contract and therefore cites all of them, so citation by it is not a usage signal; none of the four non-defining Phase-1 areas cites this one, so it is not among the Phase-1 component contracts and no Phase-1 route serves it. The tension with the no-page-index prohibition is real and is left visible: a later phase inheriting a pager surface must build it over the keyset contract or reopen this record, and not quietly add an ordinal parameter |
| 2   | Infinite scrolling, the consumer this contract is optimised for, is **also** unevidenced. The message list is evidenced as a scrolling region (`03-messaging-and-composer.md` L513); how more history arrives is not                               | Recorded. The keyset choice is defended on the database's terms rather than on the corpus's, since the corpus is silent, and the trade-off section says so rather than claiming evidence it does not have                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 3   | The catalog mentions idempotency **exactly twice**, both in a deferred area, and about a signed single-use action token for a workflow button rather than a mutation key (`10-workflow-builder.md` L324, L375)                                     | Recorded. The idempotency contract here is authored from first principles for a different mechanism. The two are not related, and neither is evidence for the other                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 4   | The four rate-limit variables are documented in `.env.example` but are **not** declared in `packages/shared/src/config/env.ts`, and `docs/decisions/observed-values.md` states its table is closed at exactly the five values the template carries | **Recorded, not reconciled.** Three artifacts describe one set of values and two of them disagree about its size. The route to close it is the one that record already defines — declare each in the schema, add its row there, keep the template entry — and it belongs to whoever owns those files, not to this record, which reports the state rather than editing around it                                                                                                                                                                                                                                                                |
| 5   | The **idempotency retention window** has no named constant declared anywhere yet                                                                                                                                                                   | Recorded. This record states the requirement — a configured window, consumed by reference, stored as an absolute instant — and deliberately states no number, exactly as the shared module does                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 6   | The **send path's rate-limit code** is not declared, because the message contract module is named by the plan and is not yet present in `packages/shared/src/schemas/`                                                                             | Recorded. The requirement is stated — a distinct machine-readable code, separate from the authentication codes — and the constant is left to the module that will own it                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 7   | Three matrix cells have **no Phase-1 route**: revoking a session of another account, changing an account's type, and removing an account from the workspace                                                                                        | Recorded. All three are administration-console operations and that area is deferred, so the console's destination is a placeholder route rather than a partly-built surface. The cells stay in the matrix; the routes arrive with the console that calls them                                                                                                                                                                                                                                                                                                                                                                                  |
| 8   | Deleting a bookmark, and listing pending invitations, have **no matrix cell**                                                                                                                                                                      | Recorded, and no route is invented. Adding either would mean authoring an operation the capability matrix does not carry, which would put a route in front of a policy that does not exist. The smallest coherent surface is the one the matrix supports                                                                                                                                                                                                                                                                                                                                                                                       |
| 9   | The shared auth contract carries **device-enrolment** shapes, whose surface belongs to a deferred area                                                                                                                                             | Recorded. No Phase-1 route accepts them. The shapes exist because the secret-handling contract needed the artefact classified, which is a different obligation from exposing it                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 10  | The user family's path segment says `users` while the shared module's exported shapes are named for a **person**                                                                                                                                   | **Recorded, not reconciled.** The catalog's entity is a user, the route file the plan names is a user, and the shapes are a person. The inconsistency is cosmetic and visible; renaming either side to hide it would make one of the two disagree with the plan                                                                                                                                                                                                                                                                                                                                                                                |

## Companion records

| Record                                   | What it owns that this record does not                                                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/decisions/role-matrix.md`          | Who may call what: the five account types, every operation, every condition tag, and the eight projections in detail                                                                |
| `docs/decisions/data-model.md`           | The shapes underneath these routes, the composite index that makes the keyset predicate fast, the uniqueness constraints, the idempotency-key store and the absolute-timestamp rule |
| `docs/decisions/observed-values.md`      | Every configurable default, its evidence, the reading it came from and the default chosen                                                                                           |
| `docs/decisions/realtime-contract.md`    | The socket envelope, the event union, the send acknowledgement, fan-out, the replay window and the reconnect order                                                                  |
| `docs/decisions/security-contracts.md`   | The sixteen security contracts, the session cookie's attributes, the forgery-protection plugin, the explicit header set and the audit obligation                                    |
| `docs/decisions/state-matrix.md`         | How a failure, a rate limit, an empty result and a validation rejection are presented                                                                                               |
| `docs/decisions/gap-register.md`         | Every unevidenced behaviour designed rather than omitted, with its marker reference and rationale                                                                                   |
| `docs/decisions/placeholder-surfaces.md` | The sixteen deferred destinations and what each placeholder says                                                                                                                    |

## Authoring conventions observed by this record

- **Authored throughout.** Every path segment, field name, error code and example value is invented
  for this record. No third-party product name appears in its text, its headings, its paths, its field
  names or its link labels; no brand colour value appears; no copy legible in a capture is transcribed;
  and no sample entity name from the corpus appears in an example, here or in any fixture derived from
  it.
- **Zero frames were opened to write this record.** Every fact it states about the specification came
  from prose under `docs/workflows/`, and the two frames it cites — 189 and 1020 — are cited **by bare
  number** because the catalog cites them, not because this record looked at them.
- **No diagram fences.** Structure is carried in tables and prose, because the committed site
  configuration is a read-only input and its fenced-block handling consumes a diagram fence before a
  renderer sees it. Every fenced block here is plain text and every fenced line is short enough to
  read without horizontal scrolling.
- **Rules by subject and position**, never by platform identifier, for the reason given at the top of
  this record.
- **Evidence by citation, absence recorded as absence, inconsistency preserved rather than
  reconciled.** Where the specification is silent this record says so and states the smallest coherent
  choice it made instead; where two artifacts disagree it reports both and resolves neither.
