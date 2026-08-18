# The realtime contract — envelope, events, fan-out and replay

This record is the one place the socket protocol is written down. It is written down because
the protocol spans three artifacts that are edited independently — a shared schema, a server
fan-out and a client hook — and a contract that lives only in code drifts silently: each side
keeps working against its own reading until a frame arrives that one of them cannot interpret,
and by then nothing in the repository says which reading was correct. This record is that
statement. Where it and an implementation disagree, the disagreement is a defect in one of
them and this record is where the argument is settled.

It covers the wire: the envelope every frame carries, the closed set of events, how a topic is
named, where authorization is applied, how delivery crosses instances, and what a client does
when its connection drops. It does not cover the schema those events are drawn from, the
capability model authorization is evaluated against, or the presentations the client renders —
each of those has its own record, named in [Companion records](#companion-records).

## Scope and status

| Property      | Value                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Status        | Authored and binding for the first product surface set                                            |
| Applies to    | `apps/api/src/realtime/**`, `apps/web/src/realtime/**`, `packages/shared/src/schemas/realtime.ts` |
| Frames opened | None. Every fact below was resolved from specification prose                                      |
| Evidence base | Specification prose for the observable behaviour; authored for the transport entirely             |
| Verification  | `apps/api/test/integration/realtime/**` and `e2e/specs/realtime.spec.ts`                          |

## How this record cites, and what it deliberately does not repeat

Recorded first so that a reader can tell an authored decision from a transcribed one without
having to guess which is which.

- **Specification citations name the document and the line**, in the form
  `21-states.md` L465. A frame is referred to by **bare number** — frame 199 — and never by
  filename, because every filename in the corpus carries a third-party product name, and never
  by the specification's percent-encoded citation form for the same reason.
- **The five project rules are cited by subject and position**, never by identifier, because
  every rule identifier embeds that same name. The authorization rule is the second of the five
  as provided, the corpus-handling rule the third, the uncertainty rule the fourth, the
  identity rule the fifth, and the shared-component rule the first. Position alone would be
  unsafe, because the identifiers are permuted relative to the requirement labels; position
  **with** subject is not.
- **Four things are deliberately not repeated here**, because repeating them would create a
  second copy that can go stale:

| Not repeated here                                                                   | Where it lives                        |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| The sequence allocator, its row lock, and the constraints and indexes it depends on | `docs/decisions/data-model.md`        |
| Who may subscribe to what, and the eight projections a read must survive            | `docs/decisions/role-matrix.md`       |
| How the reconnect states are presented to a person                                  | `docs/decisions/state-matrix.md`      |
| The endpoint shapes, the cursor encoding and the idempotency header                 | `docs/decisions/http-api-contract.md` |

**One absence is recorded before anything else, because it determines how the rest of this
record must be read.** The specification describes a product's surfaces, not its transport. A
direct count across the four documents this record was authored from — the master index, the
product overview, the messaging area and the state matrix — finds **no occurrence of any
transport vocabulary at all**: not one mention of a socket, a connection upgrade, a broadcast,
a delivery guarantee or a live update mechanism, and not one mention of a typing indicator.
The specification is not silent by oversight; a screen capture cannot photograph a wire. So
every statement below about the wire is **authored**, and the small number of statements below
about what a person sees carry a citation. The uncertainty rule governs the difference: silence
is not permission to omit the mechanism, so the mechanism is specified here in full, with its
options and its reasoning, rather than deferred until a frame turns up to justify it. No frame
ever will.

## The ordering doctrine

This section comes before the protocol because it constrains every part of it. Read in the
other order, several later decisions look like over-engineering.

### The bus is at-most-once, so the bus is not the truth

Events cross between server instances over a publish-and-subscribe bus, and that bus offers
**at-most-once** delivery. A message it drops is dropped silently: there is no acknowledgement,
no redelivery, and no error raised at either end. A subscriber that receives nothing cannot
distinguish "nothing happened" from "something happened and the notice was lost", and neither
can the client behind it.

Two consequences follow, and they are the load-bearing sentences of this record.

- **The bus can never be the source of truth for ordering.** It makes no ordering promise
  across publishers, and a client that inferred order from arrival order would infer it from a
  property the transport does not have.
- **The bus can never be the source of truth for completeness.** A client that treated "I have
  received every frame sent to me" as an assumption would be treating a silent drop as an empty
  channel, which is exactly the failure the transport is documented to permit.

The bus is therefore used for what it is good at — getting an event to a client quickly,
usually in a single hop — and is trusted for nothing else. It is a **delivery accelerator, not
a ledger.** Every design decision downstream of this paragraph exists because that sentence is
true.

### The durable per-conversation sequence is authoritative

**Ordering and completeness come from the database.** Every message carries a per-conversation
sequence that is monotonic and gapless, and that number — not arrival order, not a server
clock, not the order a client happened to render in — is what orders a conversation and what
tells a client whether it is missing anything.

Three properties make it usable as an authority, and all three are enforced below the code
that writes to them rather than by the code itself:

1. The sequence is allocated **inside the same transaction as the message insert**, by locking
   the conversation's own counter row. Two concurrent sends into one conversation serialise on
   that row and take consecutive values; sends into different conversations do not contend.
2. A **uniqueness constraint on the pair of conversation and sequence** makes a second message
   at the same position unrepresentable rather than merely unlikely. If a second write path
   ever allocated a value another way, the write fails.
3. A rolled-back send **leaves no hole behind**, because the value it held was never committed.

The allocator, the constraint, the composite index that makes reading by sequence fast, and
the transaction sketch are specified in `docs/decisions/data-model.md` and are not restated
here. What matters to the protocol is only the consequence: **a client that holds sequence
numbers 1 through N of a conversation knows, with certainty and without asking, that it is
missing nothing before N.** No transport property is needed for that claim to hold, which is
precisely why the claim is made about the database and not about the bus.

### A native sequence object is rejected, and the reason is not preference

A database sequence object is the obvious way to number rows and it is **not usable here.**
Sequences are non-transactional by design: a value handed out is consumed whether or not the
surrounding transaction commits, so a rolled-back send permanently removes a number from the
series and leaves a gap.

A gap is not a cosmetic defect in this design — it is the one thing the protocol cannot
tolerate. From the client's side a gap is **indistinguishable** from a message it is authorized
to read and has not received, which is exactly the condition the whole reconnect design exists
to detect. A client holding 1, 2, 4 cannot tell whether 3 was rolled back or dropped by the
bus, so it must assume the worse case and ask. A series that permanently contains holes can
never become contiguous, so that client would ask on every gap, for ever, and the replay path
would be entered by ordinary operation rather than by failure.

A sequence object also cannot satisfy the requirement that the number be **assigned on
commit**, because it assigns on call. A counter row can, because it is an ordinary row
participating in the ordinary transaction. The counter row is therefore not a workaround for a
missing feature; it is the only mechanism with the required property.

### The upgrade path is recorded, not built

A **persisted stream** — an append-only log the broker retains, with consumer positions held
broker-side and redelivery on reconnect — would give stronger delivery guarantees than the
publish-and-subscribe bus, and would let a reconnecting instance resume from a broker-held
position rather than from a client-held cursor.

**It is not built, and this record does not pretend otherwise.** The reasons are stated so the
choice can be revisited on evidence rather than re-argued from scratch:

- The database sequence already provides completeness. A stream would make the fast path more
  reliable; it would not make the authority more authoritative, because the authority is not
  the transport.
- It adds a second durable ordering surface. Two durable orderings that can disagree is a worse
  problem than one accelerator that can drop, because a disagreement has no obvious remedy
  while a drop has one — ask the database.
- The replay path has to exist regardless. A client can miss events because its process was
  suspended, not only because a frame was lost, and no broker guarantee removes that case.

The upgrade is carried in `docs/decisions/roadmap.md` as a follow-up. Until it is taken, any
statement that the transport is reliable is false, and no part of this protocol may be written
as though it were.

## The envelope

Every frame the server sends carries the **same envelope**, whatever the event is. That is the
single most useful property of the protocol: a client can route a frame to the right subscriber,
place it in the right order and decide whether it has a gap **without knowing what the payload
means.** Routing and ordering are envelope concerns; interpretation is a payload concern; and
because the two are separated, adding an event type never changes the client's routing code.

### Envelope fields

| Field     | Type                     | Required                     | Meaning                                                                                                                                                                                                                           |
| --------- | ------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`    | string, closed set       | Yes                          | The event discriminator, and the only field a client reads before deciding anything else. Its value is one of the events in [The event union](#the-event-union); an unrecognised value is discarded and counted, never guessed at |
| `topic`   | string, structured       | Yes                          | The subscription this frame belongs to, in the grammar given in [Topics](#topics-and-what-a-topic-name-may-never-carry). A client uses it to dispatch to subscribers; the server never re-derives authorization from it           |
| `seq`     | integer, positive        | Sequence-bearing events only | The per-conversation sequence assigned when the underlying row was committed. Monotonic and gapless within one conversation, and meaningless across conversations                                                                 |
| `at`      | string, timestamp        | Yes                          | The **server's** commit or emit instant, in a single absolute representation. Present for display and for diagnostics, and never used for ordering                                                                                |
| `payload` | object, typed per `type` | Yes                          | The event's own data, whose shape is determined entirely by `type`. Always an object, even for events whose payload holds one field, so that adding a second field is never a breaking change                                     |

Four rules govern the envelope, and each exists because its absence has a concrete failure mode.

- **`type` is a closed set, and an unknown value is not an error.** A client running an older
  build than the server will meet a type it has never heard of. It discards the frame and
  increments a counter it can report, rather than throwing — because a client that fails on an
  unknown event turns every server deployment into a client outage. It does **not** guess from
  the payload's shape.
- **`at` never orders anything.** It is a server clock reading, and server clocks disagree
  across instances by more than the interval between two messages in a busy conversation.
  Ordering is `seq` and nothing else. `at` exists so a message can be displayed with a time and
  so a delay can be measured; a client that sorted by it would reorder correctly-sequenced
  messages.
- **`topic` is a routing hint, never a grant.** The client uses it to find the right subscriber.
  The server does not read it back as evidence of anything — see
  [Topics](#topics-and-what-a-topic-name-may-never-carry).
- **`payload` is always an object.** A payload that is a bare string or number cannot gain a
  field without breaking every reader, and this protocol expects to gain fields.

### Which events carry a sequence, and why the split is where it is

The split is not arbitrary and it is not per-event taste. It follows from one question: **does
a later frame supersede an earlier one, or does it join it?**

| Class                | Sequence-bearing | Why                                                                                                                                                                                                                                                                                                            |
| -------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conversation content | **Yes**          | Each event describes a durable change to a conversation's contents that took a position in that conversation's history. Order is meaningful, absence is detectable, and both are needed — so each frame carries the committed sequence and a client can tell that it holds 1 through N                         |
| Ephemeral signals    | **No**           | Presence and typing are **last-write-wins facts about right now.** An older signal that arrives late is worthless rather than out of order, and a missing one corrects itself on the next heartbeat or expiry. There is nothing durable to be missing a piece of, so there is nothing for a sequence to number |

Two consequences of that split are worth stating explicitly, because a build that misses either
of them produces a protocol that looks correct and behaves badly:

- **An ephemeral event must never advance the client's cursor.** The cursor tracks contiguity of
  durable content. If a presence change advanced it, a client would record progress it had not
  made and would skip a gap on the next reconnect. The client's cursor logic therefore reads
  `seq` only where the envelope carries one, and ignores ephemeral frames entirely.
- **A dropped ephemeral event is not a defect and must not trigger replay.** Replay serves
  durable content from the database. Presence and typing have no durable record to replay from —
  by design, stated in [Presence and typing](#presence-and-typing) — so a client that noticed a
  missing typing signal and asked for a gap would be asking for something that was never
  stored.

### The envelope is defined exactly once

The envelope and the event union are declared in **`packages/shared/src/schemas/realtime.ts`**
and nowhere else. The server's fan-out and the client's hook both import that declaration, so
the shape is not agreed between them — it is the same shape. Neither side owns a private copy
that could drift, and a change to the union is a compile-time event on both sides rather than a
runtime surprise on one.

This is the same schema-first arrangement the rest of the contract surface uses: one definition
serving server validation, client types and the generated specification. It is what makes the
maintenance rule in [The four coordinated edits](#the-four-coordinated-edits) enforceable rather
than merely advisory — three of the four edits fail to compile without the first.

### An example frame

Authored throughout: the conversation name, the person's display name and both identifiers are
invented for this record. No name legible in any capture appears here, and none may appear in a
fixture, a seed row or a test either.

```text
{
  "type": "message.created",
  "topic": "conversation:cnv_7GQ2K1",
  "seq": 4821,
  "at": "2026-03-04T09:12:44.318Z",
  "payload": {
    "messageId": "msg_01HZ8Y",
    "clientId": "01HZ8YQ4W2R6",
    "conversationId": "cnv_7GQ2K1",
    "authorId": "usr_4KD9P0",
    "authorName": "Priya Raghunathan",
    "body": { "kind": "doc", "blocks": [] },
    "editedAt": null
  }
}
```

Read it in the order a client does: `type` selects the reducer, `topic` selects the subscriber,
`seq` is compared with the cursor to decide whether this frame extends the client's contiguous
run or reveals a gap, and only then is `payload` interpreted. `at` is carried into the rendered
row and used by nothing that decides anything.

## The event union

Eleven events. The union is **closed**: a type not in this table does not exist on the wire, and
a client that meets one discards it as described above. Adding a twelfth is governed by
[The four coordinated edits](#the-four-coordinated-edits).

Every row carries an authorization note, and the notes are not decoration. The authorization
rule — the second of the five as provided — makes a socket delivery a **read path**, and an
event reaching a client a **projection**. So each row states what must be true of the recipient
at the moment the frame is delivered, not at the moment they subscribed. Who may subscribe to
what is specified in `docs/decisions/role-matrix.md` §K and is not restated here; what follows is
the per-event obligation on top of it.

| Event                        | Topic               | Sequence-bearing | Payload summary                                                                                                                                   | Authorization note                                                                                                                                                                              |
| ---------------------------- | ------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message.created`            | `conversation:<id>` | **Yes**          | Message identifier, the sender's client identifier, conversation, author identifier and display name, the structured body, and a null edit marker | Delivered only to a recipient who may read the conversation **at delivery time**. Re-checked on fan-out; a recipient removed since subscribing receives nothing                                 |
| `message.edited`             | `conversation:<id>` | **Yes**          | Message identifier, the new structured body, and the edit instant. Carries the message's **original** sequence, not a new one                     | As above. An edit is a change to a row the recipient must still be authorized to read; authorization is not inherited from having seen the original                                             |
| `message.deleted`            | `conversation:<id>` | **Yes**          | Message identifier only. No body, no author name, no excerpt                                                                                      | As above, and the payload is deliberately minimal: a deletion notice that carried the deleted text would disclose content to a recipient whose access may have changed since it was posted      |
| `reaction.added`             | `conversation:<id>` | **Yes**          | Message identifier, the emoji key, the reacting account's identifier, and the resulting count                                                     | As above. The count is a **projection** and is computed inside the authorized query rather than incremented on the client from an untrusted delta                                               |
| `reaction.removed`           | `conversation:<id>` | **Yes**          | Message identifier, the emoji key, the account identifier, and the resulting count                                                                | As above                                                                                                                                                                                        |
| `channel.updated`            | `conversation:<id>` | **Yes**          | The conversation's changed metadata — name, topic, description, visibility, archived flag — as the fields that changed                            | As above. A visibility change is the case that matters: a conversation converted to private must stop reaching a recipient who is no longer authorized, which only the fan-out re-check catches |
| `channel.membership.changed` | `conversation:<id>` | **Yes**          | The affected account identifier, whether it joined or left, and the resulting member count                                                        | As above, with one addition: the frame that tells a recipient they were **removed** is the last frame they receive for that topic. The server unsubscribes them in the same operation           |
| `typing.started`             | `conversation:<id>` | No               | The typing account's identifier and display name, and an expiry instant                                                                           | As above, and rate-limited per sender. Never persisted, so it is never replayed                                                                                                                 |
| `typing.stopped`             | `conversation:<id>` | No               | The account identifier only                                                                                                                       | As above. Emitted on explicit stop and also implied by the expiry, so a lost frame self-corrects                                                                                                |
| `presence.changed`           | `workspace:<id>`    | No               | The account identifier and the resolved presence state                                                                                            | Delivered only to recipients in the same workspace, and it carries no conversation membership implication: presence says an account is reachable, never which conversations it is in            |
| `message.ack`                | `session:<id>`      | **Yes**          | The client-generated identifier, the authoritative message identifier, the assigned sequence, and the server commit instant                       | Delivered **only** on the sending session's own topic. It is the one event with an audience of exactly one, and no other session may receive it                                                 |

Three properties of the table are worth stating in prose, because a table can be read past.

- **An edit and a delete carry the message's original sequence.** They are not new positions in
  the conversation; they are changes to an existing position. A client applies them by locating
  the sequence it already holds. This is also why an edit cannot be used to reorder a
  conversation, deliberately: the sequence column is written once.
- **A payload carries the minimum that routes and renders it, and no more.** The deletion event
  is the clearest case — it names the message and nothing about its contents. The general form of
  this rule belongs to the read-side contract and is set out in
  `docs/decisions/role-matrix.md`; what belongs here is the instance: a frame that has left the
  server cannot be re-authorized, so a frame carries nothing it does not need.
- **`message.ack` is not a broadcast.** It travels on a session topic rather than a conversation
  topic because it exists to reconcile one client's optimistic state. Everyone else in the
  conversation learns of the message through `message.created`, which they receive whether or not
  the sender's socket is still connected.

### The send acknowledgement, and what it reconciles

Optimistic send is what makes a sender's own message appear immediately, and it works by letting
the **client** generate the message's identifier before the server has seen it. The client
inserts a row into its own view keyed by that identifier, renders it in a pending treatment, and
sends. Nothing about that row is authoritative yet — not its position, and not its identity.

The acknowledgement is what makes it authoritative. It carries **both** halves of the
reconciliation, and both are necessary:

| Field returned                       | What the client does with it                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| The client-generated identifier      | Locates the optimistic row. Without it the client would have a new message and no way to know it already had one                     |
| The authoritative message identifier | **Replaces** the optimistic row's identity, so every later reference — an edit, a reaction, a permalink — addresses the server's row |
| The assigned sequence                | Places the row at its committed position and advances the cursor. Until this arrives the row has no position at all                  |
| The server commit instant            | Replaces the client's provisional time, so the rendered timestamp is the server's                                                    |

**The row is replaced, not appended beside.** A client that inserted the acknowledged message as
a new row would render the sender's own message twice — once optimistically and once on
acknowledgement — which is the single most common defect in this design and is why the client
identifier is carried on the wire at all rather than being a local detail.

**A retried send cannot produce two messages, and the reason is a constraint rather than
diligence.** A send whose response was lost is retried with the _same_ client identifier, and
nothing about the second request tells the server it is a repeat. A **uniqueness constraint on
the pair of conversation and client-generated identifier** is what closes that: the second insert
fails on the constraint, the handler resolves the row that already exists and acknowledges it,
and the client reconciles against the message it already created. The duplicate is never created
rather than detected and cleaned up afterwards. The constraint itself, and the reason the client
identifier is stored rather than discarded after reconciliation, are specified in
`docs/decisions/data-model.md`.

Two further properties follow, and both are protocol obligations rather than implementation
detail:

- **The acknowledgement is idempotent.** Receiving it twice for one client identifier is a
  no-op, because the second arrival finds a row that already carries the authoritative identity
  and sequence. A client must not treat a repeat as a second message.
- **The acknowledgement is not the delivery.** The sender's own `message.ack` and the other
  participants' `message.created` are separate frames on separate topics. A sender whose socket
  drops after the server commits will not see its acknowledgement, and the message still exists —
  which is exactly the case replay is for, and why an unacknowledged optimistic row is
  reconciled on reconnect rather than resent blindly.

### The archived-conversation edge, stated explicitly

A send into a conversation **archived a moment earlier** is one of the required edge cases, and
it is the case where an optimistic client is most likely to lie to its user.

The specification settles the destination state and this record settles the transition. An
archived conversation is read-only, and the read-only presentation is not a disabled composer:
the composer is **replaced** by a status bar naming the conversation and offering a close action,
and the conversation's header loses its member facepile, its member count and its huddle action
(`21-states.md` L284, frames 134, 136, 137). Reversal restores every removed affordance at once
and adds a system entry to the conversation (`21-states.md` L287, frame 138).

The protocol obligation is therefore in three parts:

1. **The server refuses the send.** Archived state is evaluated server-side at the point of
   execution, against the conversation as it stands in the transaction — not against whatever
   the client last rendered. A composer that was still on screen because a `channel.updated`
   frame had not arrived yet is not evidence of anything, and the authorization rule is explicit
   that a control's presence never exempts the server from checking.
2. **The client reconciles the optimistic row to a failed state.** It must not be left pending.
   A row that stays pending for ever is worse than an error, because the sender has no reason to
   believe anything went wrong and will assume the message was delivered. The reconciliation is
   driven by the refusal, not by a timeout.
3. **The failure is reported where the specification puts a failure.** The one failure rendering
   the corpus supplies is a transient pill on an inverted surface at the content region's foot,
   stating that something went wrong and inviting a retry, carrying no undo, no dismissal
   affordance and no button of any kind (`21-states.md` L132, L245, frame 199). It does not
   block: the composer behind it stays usable (`21-states.md` L245).

**What the corpus does not show, recorded as absence rather than filled in.** The specification
states directly that a send that failed after an optimistic render is one of the states the
messaging area does not evidence, alongside an edit conflict and a refusal returned to a
principal not authorized to post, and that the failure toast is the only failure rendering it
supplies (`03-messaging-and-composer.md` L726, and the matching acceptance criterion at L808).
So the _pill_ is transcribed and the _pending-to-failed transition_ is authored. It is
registered as such in `docs/decisions/gap-register.md`, and its presentation is settled in
`docs/decisions/state-matrix.md` rather than here.

## Topics, and what a topic name may never carry

A **topic** identifies a stream of events a client can ask to receive. It is a routing address
and nothing more. Three topics exist, and the set is closed for the same reason the event union
is: a name the server does not recognise is refused rather than created on demand.

| Topic               | Identifies                                 | Who may hold a subscription                                                   | Carries                                                |
| ------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| `conversation:<id>` | One conversation                           | An account authorized to read that conversation, re-checked on every delivery | Every sequence-bearing conversation event, plus typing |
| `workspace:<id>`    | One workspace                              | Any member of that workspace                                                  | `presence.changed` only                                |
| `session:<id>`      | One authenticated session, not one account | Only the session it names. An account with two sessions has two of these      | `message.ack` only                                     |

The `<id>` in each name is an opaque server-issued identifier. It is a **label**, and the
following rule governs it absolutely:

> **A topic name is never read back as evidence.** The server does not parse a topic name to
> discover which conversation to authorize against, which workspace a caller belongs to, or who
> the caller is. Every one of those facts comes from the session established at the upgrade and
> from the object loaded from the database. The topic name is matched against the subscriptions
> the server itself recorded for this connection, and a name that matches nothing is refused.

The reason is the authorization rule's prohibition, stated in its own terms: **no authorization
decision may rest on a caller-supplied workspace or actor identifier.** A topic name arrives in a
client frame, so it is caller-supplied by definition. A server that read the workspace out of
`workspace:<id>` and authorized against it would have taken the caller's word for the single
fact that decides isolation — and would do so through a code path that looks, in review, like
ordinary routing.

Two corollaries, both of which are cheap to honour and expensive to retrofit:

- **A subscription request is authorized against the object, not the string.** The server
  resolves the identifier to a row through the workspace-scoped client, and if the resolution
  returns nothing the request is refused. Isolation is therefore enforced by the same mechanism
  that enforces it on every other read path, described in `docs/decisions/data-model.md`.
- **A refusal discloses nothing.** A subscription to a conversation the caller may not read is
  refused identically to one naming a conversation that does not exist. The private-resource
  invisibility rule in `docs/decisions/role-matrix.md` applies here as it does to every other
  projection: absence, not a specific denial.

## The authenticated upgrade

The socket is upgraded over the same session cookie the rest of the product uses — an
HTTP-only, same-site cookie naming a server-side revocable session record. There is no socket
token, no query-string credential and no bearer value in a frame.

**The session establishes the acting account and the workspace, and nothing else may.** This is
the same statement the authorization rule makes about every other request, and it is repeated
here because a socket makes it easy to get wrong: the upgrade happens once, the connection then
lives for a long time, and it is tempting to let the client re-state who it is on each frame
because that is convenient. It may not. Concretely:

- The upgrade is rejected before the protocol switch if the cookie is absent, unparseable, or
  names a session that has expired or been revoked. A rejected upgrade is an HTTP-level refusal,
  not a socket that opens and then closes.
- The account identifier, the session identifier and the workspace identifier are read from the
  session record at upgrade time and held **server-side** for the life of the connection. They
  are not read from any frame, ever, and a frame that carries them is treated as carrying noise.
- The connection is bound to the workspace-scoped database client for that workspace, so a query
  made on behalf of this connection cannot reach another workspace's rows. The binding is the
  same chokepoint the HTTP path uses; the socket does not get its own.
- Session revocation ends the connection. A session that is revoked or expires while a socket is
  open does not keep a live event stream: the next delivery attempt fails its re-check and the
  connection is closed. A long-lived connection is not a way to outlive a revoked session.

## Subscription and fan-out

Two authorization moments exist, and the second is the one that matters.

### Subscribe time

A subscription request is authorized in **`apps/api/src/realtime/subscribe.ts`**, against the
session established at the upgrade and the specific object the topic names. Who may subscribe to
what is specified in `docs/decisions/role-matrix.md` §K — the capability is a conversation read,
and no account type is exempt from needing it. This record does not restate the matrix.

What this record does state is what a successful subscription **is**: a record, held server-side,
that this connection is interested in this topic. It is an **index for delivery**. It is not a
grant, not a capability, and not a cached authorization decision.

### Fan-out: the re-check is not optional

> **Authorization is evaluated again on every fan-out, for every recipient, every time.** A
> subscription established an hour ago is evidence that the recipient was authorized an hour ago.
> It is not evidence of anything about now.

This is implemented in **`apps/api/src/realtime/fanout.ts`** and it is **non-negotiable**. The
reason is a required edge case rather than a hypothetical: **a member removed while viewing a
private conversation must stop receiving its events.** Removal is a mutation on a membership row;
it does not reach into the socket layer and cannot be expected to. Without a re-check at delivery,
the removed member's connection keeps matching the topic and keeps receiving messages from a
conversation they can no longer open — a live feed of content whose access has been withdrawn,
delivered by the product's fastest path.

Three properties of the re-check, each of which closes a way around it:

- **It is per recipient, not per event.** One authorization decision covering a fan-out set would
  authorize the _event_ and not the _recipients_, which is the wrong question. Each recipient is
  evaluated against the same target object separately.
- **It runs on the instance that delivers.** An event that crosses the bus is re-checked on the
  **receiving** instance before it reaches a socket there — not once on the publisher and then
  trusted. The publishing instance does not know the receiving instance's connections, and a
  membership change committed between publish and delivery would otherwise be missed.
- **A failed re-check unsubscribes rather than merely skipping.** Silently skipping leaves a
  subscription that fails on every subsequent event, which is a per-event cost paid for ever.
  The connection's subscription is dropped and the client is told, so it can update what it
  renders. The one case that is deliberately not silent is removal itself: the recipient receives
  the `channel.membership.changed` frame naming their own removal as the last frame on that
  topic, and is unsubscribed in the same operation.

### Local delivery and cross-instance delivery

Delivery has two paths, and the split is invisible to the client.

| Path           | Mechanism                                                                                                                                               | Authorization                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Local          | The instance iterates the socket server's **tracked client set**, selects the connections subscribed to the topic, and writes the frame                 | Re-checked per recipient immediately before the write                     |
| Cross-instance | The instance **publishes** the frame to the bus on a channel derived from the topic; every other instance is subscribed and delivers locally on receipt | Re-checked per recipient on the **receiving** instance, not the publisher |

A message committed on instance A therefore reaches a client connected to instance B by exactly
one bus hop, and reaches a client connected to A without touching the bus at all. Both clients
see the same envelope with the same sequence, because the sequence was assigned in the database
before either path was taken.

The at-most-once property applies to the cross-instance path only, and that asymmetry is worth
naming: a client on the publishing instance is unlikely to miss a frame, and a client on another
instance can. **The protocol may not rely on that difference.** Both clients run the same
contiguity check and the same replay path, because a design in which correctness depends on which
instance a client happened to connect to is a design that passes every single-instance test and
fails in production.

### The connection topology, and why it is two connections

Each API instance holds **two** connections to the bus:

| Connection            | Purpose                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| Command connection    | Publishing frames, and every ordinary operation — presence writes, expiry reads, the socket registry |
| Subscriber connection | A **separate, duplicated** connection that does nothing but hold the subscriptions and receive       |

The reason is a documented property of the bus client rather than a preference: **a connection
that subscribes enters subscriber mode, after which only subscription-set commands, ping and
quit are valid on it.** A single connection therefore cannot both subscribe and publish — the
publish would be rejected — and the failure is not obvious at authoring time, because the code
that publishes and the code that subscribes are usually in different files.

Duplicating the connection rather than opening an unrelated one keeps the connection settings in
one place, so the two cannot drift in their address, credentials or retry behaviour. Both live in
`apps/api/src/redis/`, alongside the socket registry that records which instance holds which
connection.

## Presence and typing

Both are ephemeral, both are excluded from the sequence, and both are specified here because
neither appears anywhere in the specification. A direct search of the four source documents finds
**no mention of a typing indicator at all**, and presence is described only as something rendered
on an avatar. The behaviour below is therefore authored under the uncertainty rule, and the
smallest coherent mechanism was preferred over a richer one.

### Presence

- **Bus-backed, never a table.** Presence is a fact about right now, and a durable row recording
  it would be wrong the moment a process died without cleaning up. It is held in the bus's own
  keyspace with a **time-to-live**, so an instance that dies takes its clients' presence with it
  automatically rather than leaving accounts shown as reachable for ever.
- **Heartbeat-driven.** A connected client's presence is refreshed on an interval, and the
  time-to-live is set to a multiple of that interval so a single missed heartbeat does not flap an
  account offline. The interval and the time-to-live are the named constants
  `PRESENCE_HEARTBEAT_INTERVAL_MS` and `PRESENCE_TTL_MS`.
- **Coalesced fan-out.** Presence changes are batched over a short window and emitted as one
  frame per account per window rather than one frame per transition. Without this, a workspace of
  ten thousand accounts turns a sign-in storm into a broadcast storm: the cost of an uncoalesced
  presence change is the number of connected members, and it is paid on every flap. The window is
  `PRESENCE_COALESCE_WINDOW_MS`.
- **Presence is not membership.** `presence.changed` travels on the workspace topic and says only
  that an account is reachable. It never implies which conversations that account belongs to, and
  a client must not infer membership from it. Membership disclosure is a projection and is
  governed by `docs/decisions/role-matrix.md`.

### Typing

- **Ephemeral, and never persisted.** There is no typing row, no typing column and no typing
  history. The signal exists only in flight and in a short-lived bus entry.
- **Rate-limited per sender.** A composer emits a keystroke-driven signal, so the naive
  implementation sends one frame per character to every member of the conversation. A sender emits
  at most one `typing.started` per `TYPING_SIGNAL_MIN_INTERVAL_MS`, and further keystrokes inside
  that window extend the existing signal rather than emitting again.
- **Self-expiring.** Each signal carries an expiry, and a client clears the indicator when it
  passes without needing to receive `typing.stopped`. The stop frame is an optimisation, not a
  requirement — which is what makes it safe for the at-most-once bus to drop one. The expiry is
  `TYPING_SIGNAL_TTL_MS`.
- **Never replayed, and never a reason to replay.** Typing frames are outside the sequence, so a
  missed one leaves no gap and triggers nothing.
- **Authorized like any other conversation event.** A typing signal names an account and a
  conversation, so it is a projection: it is delivered only to recipients authorized to read that
  conversation at delivery time, re-checked exactly as content is.

## Reconnection and replay

### The cursor is the highest contiguous sequence

Each client persists, per conversation, the **highest sequence below which it holds every
number.** Not the highest number it has received. The distinction is small to state and is the
difference between a protocol that recovers and one that silently loses messages.

Consider a client that holds sequences 1, 2, 3 and 7 for one conversation, having missed 4, 5
and 6 because the bus dropped them:

| Cursor definition  | Value | What the client asks for on reconnect | Result                                                                                                                                   |
| ------------------ | ----- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Highest received   | 7     | Everything after 7                    | 4, 5 and 6 are **never** requested and never arrive. The conversation is permanently missing three messages and nothing will ever notice |
| Highest contiguous | 3     | Everything after 3                    | 4, 5, 6 and 7 are returned. 7 is applied twice, which is a no-op because application is keyed by sequence                                |

**The at-most-once bus is precisely what makes this reachable.** A transport with in-order,
exactly-once delivery could not produce the 1, 2, 3, 7 state, so a client on such a transport
could use its highest received number safely. This transport can produce it — that is what
at-most-once means — so this client cannot. Choosing the highest received number is not a
micro-optimisation with a rare failure mode; it is a correctness bug that presents as messages
that were never delivered, with no error anywhere and nothing in a log.

Three consequences follow:

- **Applying an event is idempotent and keyed by sequence.** A client that receives 7 twice
  applies it once. Replay therefore does not need to be exact at its boundary, and re-requesting
  a sequence already held is always safe. This is what lets the cursor be conservative.
- **An out-of-order frame is held, not discarded.** Receiving 7 while the cursor is 3 does not
  advance the cursor and does not discard 7. It is applied to the view and remembered, so the
  gap is still known and the message is still shown.
- **The cursor is per conversation.** Sequences are meaningless across conversations, so one
  global cursor would be meaningless too. A client subscribed to twelve conversations holds
  twelve cursors.

### The reconnect sequence, in order

Expressed as an ordered list because the order is the specification. A build that performs these
steps in a different order produces a client that appears to work and loses or duplicates
messages under exactly the conditions this list exists to survive.

1. **Detect the drop.** Either the connection closes, or a heartbeat goes unanswered past its
   allowance. Both enter the same path; there is no separate handling for a connection that
   closed cleanly, because a clean close from the server's side is not a reason to stay
   disconnected.
2. **Enter the disconnected state and stop pretending.** The client stops accepting live frames,
   marks its realtime state disconnected, and surfaces it — the presentation is settled in
   `docs/decisions/state-matrix.md`. Optimistic rows already in flight are **not** discarded and
   **not** resent yet; they are held for reconciliation at step 8.
3. **Back off exponentially, with jitter.** Delay before attempt _n_ is
   `REALTIME_BACKOFF_BASE_MS × 2^(n−1)`, capped at `REALTIME_BACKOFF_CEILING_MS`, then multiplied
   by a random factor drawn from the band `REALTIME_BACKOFF_JITTER_RATIO` describes. The jitter is
   not decoration: without it, every client disconnected by one instance restarting retries in
   lockstep and the reconnect storm is what prevents the recovery. Attempts continue to
   `REALTIME_BACKOFF_MAX_ATTEMPTS`, after which the client stops automatic retrying and offers a
   manual one.
4. **Re-authenticate the upgrade.** The new connection is upgraded over the session cookie
   exactly as the first one was. A reconnect is **not** a resumption: no connection state, no
   subscription and no authorization decision carries over from the old socket. A session revoked
   during the outage fails here, which is the correct outcome.
5. **Re-subscribe.** Every topic is requested again and **authorized again** against the session
   and the object. A conversation the client may no longer read is refused now, and this is one of
   the two places where a membership change during an outage is caught.
6. **Request the gap over HTTP.** For each conversation, the client asks for the events after its
   persisted contiguous cursor — over the ordinary authorized HTTP read path, not over the socket.
   The request is a read and is authorized as one. HTTP is used because the gap is _durable
   content held in the database_, and asking the authority directly is both simpler and safer than
   asking a transport that is documented to drop.
7. **Apply the gap in sequence order, then advance the cursor.** The cursor moves once, to the
   highest contiguous sequence after the gap is applied — not incrementally as each event lands,
   so an interrupted replay cannot leave a cursor claiming progress the client did not make.
8. **Reconcile in-flight optimistic rows.** An optimistic row whose acknowledgement never arrived
   is resolved by looking for its client identifier in the applied gap. Found means the send
   committed and the row is reconciled to the authoritative identity and sequence. Not found means
   the send is retried with the **same** client identifier, which the uniqueness constraint makes
   safe. A row is never silently dropped, and never resent under a new identifier.
9. **Resume live frames, buffer first.** Only now does the client apply live frames again.

**Live frames arriving during steps 4 to 8 are buffered, not applied and not dropped.** They are
held in arrival order and applied after the gap, and because application is keyed by sequence, a
frame that also appeared in the gap is a no-op. Applying live frames during replay would
interleave old and new events in the view and could advance the cursor past an unfilled gap,
which is the one outcome the cursor definition exists to prevent. Buffering is bounded by the
same window as replay: a buffer that exceeds it means the client is too far behind for
incremental recovery and the refetch path below is taken instead.

### The replay window is bounded, and the boundary has a defined behaviour

Replay is **not** unbounded history. The server serves at most
`REALTIME_REPLAY_WINDOW_EVENTS` events per conversation from the client's cursor, declared as a
compile-time invariant in `packages/shared/src/config/constants.ts`.

When the gap is larger than that bound, the server does **not** serve a truncated replay. A
truncated replay is the worst available answer, because the client would apply a partial range and
advance its cursor as though it were complete — manufacturing exactly the silent gap this design
exists to eliminate. Instead:

| Condition                                         | Server response                                | Client behaviour                                                                                                                                                                        |
| ------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gap within the bound                              | The events after the cursor, in sequence order | Apply in order, advance the cursor once, resume live                                                                                                                                    |
| Gap exceeds the bound                             | A **refetch signal** carrying no events        | Discard the conversation's cached history, discard the cursor, refetch the conversation from the top through the ordinary paginated read path, and set the cursor from what it receives |
| Cursor ahead of the server's own highest sequence | A refetch signal                               | The same. This is a client whose stored state is inconsistent with the server — after a restore, or a schema change — and the only safe answer is to start again                        |

Refetching is a heavier operation than replay and that is the point: it is correct, and it is
rare. The bound exists to keep the _replay_ path cheap rather than to keep the recovery path cheap.
A client that has been away long enough to exceed it has an out-of-date view anyway, and paying
for a fresh read once is better than serving an unbounded range on a path any client can enter at
any time — which is also a denial-of-service surface if it is unbounded.

The paginated read path the refetch uses is keyset-based over the conversation-and-sequence tuple
with an opaque cursor, and never an offset. Its shape is specified in
`docs/decisions/http-api-contract.md` and the index that makes it fast in
`docs/decisions/data-model.md`.

### The authored parameters

Every value this protocol depends on is a **named constant consumed by reference**. None is a
literal at a call site, and none is derived at a call site either. All ten are declared in
`packages/shared/src/config/constants.ts`, so the server and the client cannot hold different
ideas of the same window.

The uncertainty rule — the fourth of the five as provided — requires each to carry the options
considered, the choice and the reasoning, because none of them is evidenced anywhere in the
specification. That is recorded here rather than in a comment, so a reader can compare all ten at
once.

| Constant                         | Value | Options considered                         | Why this one                                                                                                                                                                                                                                                                       |
| -------------------------------- | ----- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REALTIME_BACKOFF_BASE_MS`       | 500   | 100 · 500 · 1000                           | The first retry should be fast enough that a one-second network blip is invisible, and slow enough not to hammer an instance that is still starting. 100 ms makes a rolling restart look like an attack; 1 s makes a blip visible to the user                                      |
| `REALTIME_BACKOFF_CEILING_MS`    | 30000 | 10000 · 30000 · 60000                      | The ceiling bounds how stale a recovering client can be. 30 s keeps the worst-case wait inside a person's patience for a background recovery while keeping the request rate from a large disconnected population low                                                               |
| `REALTIME_BACKOFF_JITTER_RATIO`  | 0.5   | none · ±10% · full (0 to 1) · decorrelated | Applying a factor in the band from half to full delay breaks lockstep without letting an unlucky client wait far longer than the ceiling implies. No jitter is the failure mode this parameter exists for; full jitter reintroduces long waits                                     |
| `REALTIME_BACKOFF_MAX_ATTEMPTS`  | 10    | unlimited · 6 · 10                         | Unlimited retrying drains a battery and hides a real outage behind a spinner for ever. Ten attempts at this base and ceiling reach the last one between one and two minutes after the drop, after which a manual retry is offered — the only retry affordance the corpus evidences |
| `REALTIME_REPLAY_WINDOW_EVENTS`  | 500   | 100 · 500 · 5000 · time-based              | Five hundred events covers a lunch break in a busy conversation while bounding one replay request to one indexed range scan. A time-based window was rejected because a bound in seconds says nothing about how much work it authorises                                            |
| `TYPING_SIGNAL_MIN_INTERVAL_MS`  | 3000  | 1000 · 3000 · 5000                         | The signal only has to convey "someone is composing". Three seconds cuts a fast typist's traffic by two orders of magnitude while the indicator still appears to respond immediately, because the first keystroke emits at once                                                    |
| `TYPING_SIGNAL_TTL_MS`           | 8000  | 5000 · 8000 · 15000                        | Must exceed the minimum interval by enough that a continuing typist never flickers, and stay short enough that a person who walks away stops appearing to type. Eight seconds is two-and-a-bit emission intervals                                                                  |
| `PRESENCE_HEARTBEAT_INTERVAL_MS` | 20000 | 10000 · 20000 · 60000                      | Sets the steady-state cost of presence: one write per connected client per interval. Twenty seconds keeps that cost low at a thousand sockets per instance while still detecting a departure inside a minute                                                                       |
| `PRESENCE_TTL_MS`                | 60000 | 1× · 2× · 3× the heartbeat interval        | Three intervals means two consecutive heartbeats can be lost without an account flapping offline. One interval flaps on any hiccup; a longer multiple leaves the departed shown as present for too long                                                                            |
| `PRESENCE_COALESCE_WINDOW_MS`    | 1000  | none · 1000 · 5000                         | One second collapses a sign-in burst into a single frame per account while remaining below the threshold at which a person perceives the indicator as lagging. No window is the broadcast-storm case; five seconds feels broken                                                    |

**These are compile-time invariants, deliberately not environment variables, and the reasoning is
worth stating because it looks at first like a rule violation.** The uncertainty rule's
environment-overridable clause governs _a numeric or enumerated value derived from a frame_ — a
timer, expiry, window, threshold or limit read off a capture and therefore uncertain as a product
default. None of these ten is that. No frame shows any of them, because no frame can show a
transport, and they are not product policy that a deployment might legitimately set differently:
they are protocol parameters, and a deployment that changed one would change what a client may
assume about completeness. The rule's requirement that binds them is its other clause — implement
the mechanism, record the options, the choice and the rationale — and that is discharged by the
table above.

Two supporting reasons, both concrete:

- `docs/decisions/observed-values.md` states that its table, `.env.example` and
  `packages/shared/src/config/env.ts` are three views of one truth and that the table is closed at
  exactly the five values the environment template carries. Adding ten realtime variables there
  would be a change to that record's stated closure rather than a change to this one.
- That record already sets the precedent for a value that is a floor rather than a setting: the
  password-verifier parameters are compile-time constants held deliberately beyond the reach of an
  environment variable, because an override is a downgrade path. The replay bound is the same kind
  of value.

If one of these ever does need to vary per deployment, the route is defined rather than improvised:
add it to `env.ts`, add its row to `docs/decisions/observed-values.md`, add its entry to
`.env.example`, and change its row here to say so. All four, or the three views disagree.

### The states this requires, and the silence the corpus keeps

This protocol makes four states observable that a person must be told about: **offline**,
**disconnected**, **reconnecting** and **retrying**. Each is required — a client that reconnects
invisibly is a client whose user believes they are reading a live conversation when they are
reading a frozen one.

**None of the four is evidenced anywhere in the corpus, and the specification says so directly
rather than leaving it to be inferred.** It records that no frame shows an offline, disconnected,
reconnecting or retrying state (`21-states.md` L465), and separately that no retry, timeout,
offline, reconnect or queued-for-later state is drawn at all, because no frame shows one
(`21-states.md` L441).

Two related things the corpus _does_ show, recorded because they are the only evidence that exists
in this neighbourhood and it would be dishonest to present the whole family as unevidenced:

| What is evidenced                                                                                                        | Citation                       |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| The only retry affordance observed anywhere: a sentence inside the transient failure pill inviting the user to try again | `21-states.md` L465, frame 199 |
| The only connection reporting observed anywhere: a diagnostics popover summarising a live session's connection as stable | `21-states.md` L465, frame 271 |

Everything else in this family is **authored**. The retry sentence is a per-action affordance
inside a pill about one failed operation; it is not a connection state, and it must not be
stretched into one. The diagnostics popover reports a media session's health, not the event
socket's. So:

- The four states are registered in `docs/decisions/gap-register.md`, each with the marker it
  answers, the options considered, the choice and the reasoning — the same treatment every
  unevidenced state gets.
- Their **presentation** is settled in `docs/decisions/state-matrix.md`, not here. This record
  specifies when the client is in each state and what it does; it does not specify what that looks
  like.
- Nothing about them is described as observed. Where this record says what a person sees, it
  either carries a citation or says plainly that it is authored.

## The four coordinated edits

> **Adding an event type requires four edits. Any three of the four leaves the contract lying.**

This is the maintenance rule that keeps this record true, and it is stated as its own section
because it is the one thing a future change is most likely to get partly right. The four files:

| #   | File                                      | The edit                                                                                                                                        | What it looks like when this is the one omitted                                                                                                                                                                      |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `packages/shared/src/schemas/realtime.ts` | Add the event to the union and declare its payload schema                                                                                       | Nothing compiles. This is the edit that cannot be forgotten, because the other two code edits reference the type it declares                                                                                         |
| 2   | `apps/api/src/realtime/fanout.ts`         | Emit the event, on the right topic, with its authorization re-check                                                                             | The event exists in the type system and on the client, and is never sent. A feature that appears finished and does nothing at run time                                                                               |
| 3   | `apps/web/src/realtime/useRealtime.ts`    | Handle the event in the shared hook and route it to its consumers                                                                               | The server sends it and every client discards it as unrecognised, silently, exactly as the envelope rules require. The counter rises and nothing else happens                                                        |
| 4   | `docs/decisions/realtime-contract.md`     | Add its row to [The event union](#the-event-union), with its topic, whether it bears a sequence, its payload summary and its authorization note | Everything works and the contract is **false**. The next person to read this record is told the union is closed at eleven when it is not, and reasons about the protocol from a document that no longer describes it |

**Row 4 is the one no compiler can catch, which is exactly why it is written down.** Rows 1 to 3
fail loudly or visibly: the first breaks the build, the second produces an event that never
arrives, the third produces an event nobody handles. The fourth produces working software and a
misleading document, and a misleading document is worse than an absent one, because a reader
trusts it.

Three practical notes, so the rule is followed rather than admired:

- **Row 1 first, always.** It is the only edit the type system propagates. Making it first turns
  rows 2 and 3 into compile errors the author is walked through, rather than work they have to
  remember.
- **The same rule applies to a topic and to a payload field**, not only to a new event. Adding a
  field to an existing payload is rows 1, 3 and 4; adding a topic is all four.
- **Removing an event is the same four edits in reverse**, and the fourth is even easier to
  forget, because nothing is broken by leaving a row describing an event that no longer exists —
  except a reader's understanding.

## One socket per session, and one shared hook

The client holds **one socket per session.** Not one per conversation, not one per feature, and
not one per mounted component.

Every consumer subscribes through the single shared hook at
**`apps/web/src/realtime/useRealtime.ts`**. A feature must not open its own socket, must not
speak the protocol directly, and must not implement its own reconnection or backoff. The
shared-component rule — the first of the five as provided — requires shared behaviour to be
implemented once and consumed rather than re-declared locally, and this is that requirement
applied to the transport: the hook is the single implementation, and a local equivalent is a
defect even if it works.

The reasons are specific rather than stylistic, and each is a failure a second socket actually
produces:

- **The cursor stops being coherent.** Contiguity is tracked per conversation by the component
  that receives the frames. Two sockets receiving the same conversation each see part of the
  stream, so each computes a contiguous run that is missing what the other received, and both
  request gaps that are not gaps. The cursor is only meaningful if one thing owns it.
- **Reconnection multiplies.** Two sockets mean two independent backoff ladders, so a restart
  produces twice the reconnect traffic from every client, and the jitter that was tuned for one
  ladder is now competing with itself.
- **Server cost scales with features rather than with users.** Presence, the socket registry and
  the fan-out set are all per connection. A product where each feature opens a socket has a
  per-user connection count that grows every time a feature ships, which is a scaling limit
  nobody chose.
- **Ordering becomes unobservable.** A sequence orders a conversation's events. Two sockets
  delivering one conversation's events into two reducers cannot be ordered against each other at
  all, because there is no shared point at which both have been seen.

What a consumer gets from the hook is deliberately narrow: a subscription to a topic, typed
events for that topic, and the current realtime state. It does not get the socket, and it cannot
send an arbitrary frame — the client's outbound surface is the subscribe and unsubscribe
operations and the heartbeat, and nothing else. Sends are HTTP requests, not socket frames,
because a send is a mutation that must be authorized, validated, sequenced and made idempotent,
and the HTTP path already does all four.

## Verification obligations

Nothing in this record is satisfied by being written here. Each obligation below names the test
that discharges it, and **whether the test passes is recorded in `docs/decisions/ac-manifest.md`
and nowhere else** — this section says what must be proved, not that it has been.

### Server-side, in `apps/api/test/integration/realtime/**`

| Obligation                  | What the test asserts                                                                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sequence monotonicity       | Concurrent sends into one conversation produce **consecutive** sequences with no duplicate and no gap. Asserted under real contention, not by sending serially — a serial test cannot fail this way |
| Rollback leaves no hole     | A send that fails inside its transaction consumes no sequence: the next successful send takes the number the failed one would have                                                                  |
| Replay correctness          | A client cursor at _n_ is served exactly the events after _n_, in sequence order, and applying them yields the same conversation state as a client that never disconnected                          |
| Replay is idempotent        | Applying a replayed range twice leaves the state unchanged, because application is keyed by sequence                                                                                                |
| Gap-exceeded refetch        | A cursor further behind than `REALTIME_REPLAY_WINDOW_EVENTS` is answered with a refetch signal carrying **no events** — not a truncated range                                                       |
| Cursor ahead of the server  | A cursor above the conversation's highest sequence is answered with a refetch signal                                                                                                                |
| Socket drop mid-send        | The socket is closed after the server commits and before the acknowledgement is written. The message exists; the client reconciles its optimistic row on reconnect; nothing is duplicated           |
| Retried send is one message | The same client identifier sent twice produces one message and two acknowledgements naming the same authoritative identifier and sequence                                                           |
| Archived-conversation send  | A send into a conversation archived within the same test is refused server-side, and the refusal is distinguishable from a network failure so the client can reconcile to a failed state            |
| Subscribe-time denial       | A non-member **and** a wrong-role caller are both refused a subscription, and the refusal is indistinguishable from one naming a conversation that does not exist                                   |
| Fan-out denial mid-session  | A recipient authorized at subscribe time and **removed afterwards** receives no further events for that topic. This is the de-authorized case and it is the reason the re-check exists              |
| Topic names are not trusted | A frame naming another workspace's topic, or another session's, yields nothing — no event, and no disclosure that the topic exists                                                                  |

The denial pairing is deliberate and follows the authorization rule's own requirement: a
non-member proves isolation, and only a **wrong-role** caller proves that the capability model is
actually consulted. A suite that tested only the non-member would pass against an implementation
with no role model at all.

### Two instances, and two clients

Two of these proofs need two of something, and **neither is provable with one.**

| Proof                               | Needs                     | Why one is not enough                                                                                                                                                                                                                    |
| ----------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-instance fan-out              | **Two running instances** | A single instance delivers everything locally by iterating its own client set, so it exercises neither the publish, nor the subscribe, nor the re-check on the receiving side. A one-instance suite passes with the bus entirely unwired |
| Per-viewer state and live broadcast | **Two connected clients** | One client cannot show that a second client received an event, and cannot show that per-viewer state stayed per viewer. A single client's own echo proves only that it echoed                                                            |

The two-client proof lives in `e2e/specs/realtime.spec.ts` and drives both clients in one
specification: one sends, the other must receive; one marks read, the other's unread count must
not move. The two-instance proof lives in `apps/api/test/integration/realtime/**` and connects a
client to each instance.

### The environment constraint, recorded rather than worked around

**No container runtime is available on the machine this record was authored on** — no engine, no
compose implementation and no rootless alternative — and neither database nor cache command-line
clients are present. The two-instance fan-out proof, the container-backed integration suite and a
clean-clone verification are therefore **execution-bound to a container-capable environment.**

Every artifact is authored in full regardless: the tests, the two-instance wiring and the
two-client specification are written to run, not sketched. **This constrains verification, not
delivery**, and it is recorded here rather than resolved because pretending an unrun test passed
is the one outcome worse than an unrun test.

### Performance targets

Stated as measurable numbers so they can be asserted rather than admired. Each names what it is
measured between, because a percentile without endpoints is not a target.

| Target                        | Bound                         | Measured from                      | To                                                                                                                                                                                                       |
| ----------------------------- | ----------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Own echo                      | 100 ms at the 95th percentile | The sender's send gesture          | The sender's own message painted in the conversation. Met by optimistic local rendering, so it does not include a round trip — a build that waits for the acknowledgement before painting cannot meet it |
| Another participant's message | 300 ms at the 95th percentile | The server's commit of the message | That message painted in the same region for a different connected client, including the bus hop where the client is on another instance                                                                  |

Two notes that keep these honest:

- **The own-echo target is a rendering target, not a network target.** It is met by painting
  before the server answers, which is exactly why the acknowledgement and its reconciliation are
  specified as carefully as they are: the target is only legitimate if the optimistic row is
  reliably reconciled, including when the socket drops before the acknowledgement arrives.
- **The 300 ms target is measured to a different client's paint**, which is why it cannot be
  proved with one client, and why it is measured across instances rather than within one.

The remaining product performance targets — first paint of cached conversation history and cold
shell load — are not realtime obligations and are not restated here.

## Recorded absences and preserved inconsistencies

Collected in one place so a reviewer can see the whole evidentiary position at once, rather than
reconstructing it from the sections above. An absence recorded is not an absence excused: every
item below is implemented, and every item below is implemented from a judgement rather than from
evidence.

| #   | What the specification does not supply                                                                                                                                       | Citation                                               | What was done                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Any transport at all.** No socket, no connection upgrade, no delivery guarantee, no live-update mechanism is described anywhere in the documents this record draws on      | Verified by direct search of the four source documents | The entire protocol above is authored. A screen capture cannot photograph a wire, so this is a structural absence and not an oversight       |
| 2   | **The reconnect family** — offline, disconnected, reconnecting, retrying                                                                                                     | `21-states.md` L441, L465                              | All four implemented as working states; registered in `docs/decisions/gap-register.md`; presentation in `docs/decisions/state-matrix.md`     |
| 3   | **A typing indicator**, in any form                                                                                                                                          | No occurrence in any of the four documents             | Implemented as an ephemeral, rate-limited, self-expiring signal — the smallest coherent mechanism, per the uncertainty rule                  |
| 4   | **A send that failed after an optimistic render**, and an edit conflict                                                                                                      | `03-messaging-and-composer.md` L726, L808              | The pending-to-failed reconciliation is authored; the pill it reports through is the one failure rendering the corpus does supply, frame 199 |
| 5   | **Every parameter this protocol needs** — backoff, jitter, ceiling, attempt bound, replay window, typing interval and expiry, presence heartbeat, expiry and coalesce window | No frame evidences any of the ten                      | Ten named constants with options, choice and rationale recorded in [The authored parameters](#the-authored-parameters)                       |
| 6   | **Any rate-limit, quota or throttle presentation**, which a rate-limited typing signal could plausibly surface                                                               | `21-states.md` L467                                    | The signal is rate-limited **silently**: suppression is invisible to the sender, so no unevidenced refusal presentation is invented          |

**One tension is preserved rather than reconciled.** The specification states that its layout
specifications are proportional and relative and never absolute, because an offset keyed to a
fixed canvas would be wrong on some frames (`README.md` L935); the run this record belongs to
overrides that for geometry by measuring frames directly. Nothing in this record depends on either
reading — a protocol has no geometry — so the tension is noted as out of scope here and is carried
in `docs/decisions/catalog-defects.md`, which is where specification defects and contradictions
live. Correcting the specification in place is prohibited; recording it is the remedy.

**One judgement is recorded because it looks like an omission and is not.** The specification's
consolidated model contains no entity for a connection, a subscription or a delivery, and the
entity set is closed at twenty (`README.md` L313). No twenty-first identifier is coined here.
Connections, subscriptions, presence and typing hold no durable row at all: they live in the
bus keyspace and in process memory, which is why the model needs no entity for them and why the
`docs/decisions/data-model.md` statement that ephemeral state has no table is consistent with
this record rather than contradicted by it.

## Companion records

| Record                                 | What it holds that this one deliberately does not                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `docs/decisions/data-model.md`         | The sequence allocator and its transaction, the uniqueness constraints, the composite index, and why ephemeral state has no table |
| `docs/decisions/role-matrix.md`        | Who may subscribe to what, the eight projections, and the private-resource invisibility rule the refusals here obey               |
| `docs/decisions/security-contracts.md` | Which security contract each obligation here discharges, and where the rest of them are discharged                                |
| `docs/decisions/state-matrix.md`       | What the four connection states look like, and the presentation of the pending, failed and transient-failure treatments           |
| `docs/decisions/gap-register.md`       | The registration of every unevidenced state named here, with its marker, options, choice and rationale                            |
| `docs/decisions/http-api-contract.md`  | The replay endpoint, the keyset cursor's encoding, and the idempotency-key header every send carries                              |
| `docs/decisions/observed-values.md`    | The five environment-overridable defaults, none of which is a parameter of this protocol, and the three-views rule                |
| `docs/decisions/catalog-defects.md`    | Specification defects and contradictions, recorded rather than corrected in place                                                 |
| `docs/decisions/roadmap.md`            | The persisted-stream upgrade, recorded here as not built                                                                          |
| `docs/decisions/ac-manifest.md`        | Whether the tests named here pass. Satisfaction is claimed there and nowhere else                                                 |

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **No frame was opened.** Not one, at any point in authoring this record. Every fact above was
  resolved from specification prose, which the corpus-handling rule requires to be attempted
  first, and the reconnect family in particular was settled from the specification's own statement
  that it shows nothing rather than by going to look. Frames are referred to by **bare number** —
  199, 271, 134, 136, 137, 138 — and never by filename, and never by the specification's
  percent-encoded citation form, because both carry a third-party product name.
- **Rules cited by subject and position, never by identifier.** Every rule identifier embeds that
  same name, so writing one here would breach the identity rule this record is otherwise
  observing. The shared-component rule is the first of the five as provided, the authorization rule
  the second, the corpus-handling rule the third, the uncertainty rule the fourth, the identity
  rule the fifth. Position alone would be unsafe, because the identifiers are permuted relative to
  the requirement labels; position with subject is not.
- **Event names, topic names, constant names and every example value are authored.** Each describes
  what the thing is or does. No third-party product, feature or interface label appears in the
  text, the headings, the table cells, the fenced example or the paths, and no string legible in a
  capture is transcribed.
- **The example frame uses invented names only.** The conversation identifier, the account
  identifiers and the one display name in it were written for this record. The sample entity names
  visible in the corpus illustrate shape only and are reproduced nowhere — not here, not in a
  fixture, and not in seed data.
- **No colour value and no artwork.** Neither is in this record's scope: colour belongs to the
  token module, and this record specifies a protocol rather than a surface.
- **No diagram fence.** The committed documentation-site configuration does not render one: its
  superfences extension consumes a fenced block before the diagram plugin can claim it, so a
  diagram fence publishes as a highlighted code box (`README.md` L905–L909). The reconnect
  sequence is therefore an ordered list and the delivery paths are tables — which the site renders
  and which a reader can also follow in the Markdown source. The withheld extension fix is not
  applied and the read-only site configuration is not touched.
- **Fenced lines are held to 74 characters**, the specification's measured ceiling
  (`README.md` L86), because a published fence clips rather than wraps. The one fence in this
  record is well inside it.
- **Evidence by citation; absence recorded as absence.** Every claim taken from the specification
  names the document and the line it came from. Every decision taken without evidence says so and
  carries its options, its choice and its reasoning — the ten parameters in one table, the states
  in another, and the whole transport declared authored in the first section.
- **No criterion is marked satisfied here.** This record states what must be proved and where.
  Whether it passes is recorded in `docs/decisions/ac-manifest.md`, and a reader who wants that
  question answered should open it.
