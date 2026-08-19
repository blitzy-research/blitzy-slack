# Roadmap: what is deferred, and why

The specification describes this product in twenty-three parts. This run builds
five of them. The remaining eighteen are **deferred, not omitted**, and the
difference between those two words is the entire subject of this record.

A deferral with a reason is a plan. A deferral without one is an unexplained
absence, and an unexplained absence is indistinguishable from something forgotten.
So every item below carries the reason it is not built and, where it has a
touchpoint in this run's scope, the statement of what ships anyway. **"Not done" on
its own is not an acceptable line in this file**, and no line below is written that
way.

| Field                               | Value                                                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record — the register of deferred scope and recorded follow-ups                                                                            |
| Status                              | Operative. This is the authority on what is out of scope for this run and why                                                                       |
| Deferred phases                     | **4**, covering **18** area documents, **840** area acceptance criteria, **182** flows and **738** primary frames                                   |
| Non-phase exclusions                | **5**, each with a reason and its Phase-1 handling                                                                                                  |
| Follow-ups recorded and not done    | **2** corpus operations, plus **3** technical upgrade paths                                                                                         |
| Frames opened to author this record | **0** — every figure below was resolved from catalog prose and countable catalog content                                                            |
| Verified by                         | Arithmetic that closes against the specification's own totals; see [The arithmetic check](#the-arithmetic-check-and-why-it-is-here)                 |
| Companion records                   | `docs/decisions/ac-manifest.md`, `docs/decisions/phase-gates-ledger.md`, `docs/decisions/placeholder-surfaces.md`, `docs/decisions/gap-register.md` |

## Why this record exists, and the one line it has to draw

The reporting discipline this build runs under requires deferred work to be listed
explicitly, each item with a reason. This record is where that list lives, so that
the run's final report can point at one place rather than reconstructing scope from
what happens to be missing.

It exists for a second reason too, and the second is the more important one. The
**uncertainty rule** — fourth in the provided order — is emphatic that uncertainty
in the specification is never permission to omit functionality. A record full of
deferrals sitting next to that rule invites exactly the wrong reading, so the line
between the two is drawn here, once, in plain terms:

- **A phase is deferred by decision, and belongs in this record.** The scope of the
  run was set before the run began. It is a bounded, stated, reasoned choice about
  what to build first, and there is nothing uncertain about it — the specification
  itself orders the phases in dependency order and says so (`README.md` L460).
- **A behaviour inside this run's scope may never be deferred for want of a value,
  and does not belong in this record at all.** Where a timer, an expiry, a window,
  a threshold or a limit is uncertain, the mechanism is implemented and the value
  becomes a named configuration constant with a documented default. That is the
  uncertainty rule's own instruction, and the values are recorded in
  `docs/decisions/observed-values.md`.
- **An unevidenced behaviour inside scope is a gap, not a deferral.** Where the
  corpus is silent or a specification marker is open, the choice is made,
  implemented and registered in `docs/decisions/gap-register.md` with its marker
  reference, the options considered, the choice and the rationale. Nine state
  families that no frame shows — offline, disconnected, reconnecting, retrying,
  rate-limited, quota-exceeded, throttled, not-found and their relatives — ship for
  exactly that reason, and none of them appears below as deferred.

**The test, stated so it can be applied rather than remembered:** if the reason
something is absent is _"a later phase owns it"_, it belongs here. If the reason is
_"the specification does not say what it should be"_, it belongs in the gap
register, and the behaviour ships regardless. Nothing in this file is absent for
the second reason.

### The corpus-handling rule is why two follow-ups are recorded rather than performed

The **corpus-handling rule**, third in the provided order, names five read-only
inputs and requires that all 1,022 frames remain byte-identical. Two operations
this build would otherwise be tempted to perform — rewriting the repository's
history and moving the frame corpus to a large-file store — cannot be reconciled
with that requirement. Neither is skipped quietly and neither is performed quietly.
Both are recorded, with their motivation and their blocker, in
[The two corpus follow-ups](#the-two-corpus-follow-ups-recorded-and-not-done).
Recording them **is** this run's deliverable for them.

## What this run delivers, stated so the deferrals are legible against it

This run covers **Phase 0** — the monorepo, the data layer, the authorization
chokepoint, the realtime transport, the measured design tokens and the shared
component library — and **Phase 1**, the first product surface set: the persistent
shell, the authentication surfaces, channels, messaging and the composer, and the
cross-cutting state matrix.

In the specification's own units, Phase 1 resolves to **66 flows across five
catalog areas, 284 primary frames, and 241 area acceptance criteria**. Those five
areas are the product overview and shell, onboarding and authentication, channels,
messaging and the composer, and the cross-cutting states document.

Two records carry the detail and this one deliberately does not restate either:

- **`docs/decisions/ac-manifest.md`** carries all 241 criteria — each with its
  source document, line, cited frame, target test and status. It is the only place
  a criterion may be marked satisfied, and only a passing test may mark it.
- **`docs/decisions/phase-gates-ledger.md`** carries the gate families and their
  counts. They are reported separately and never summed into one another, so this
  record quotes no gate total.

What that buys, in product terms, is the smallest thing that is genuinely usable: a
person can create an account, verify it, set up a workspace, sign in, create and
browse channels, and hold a conversation in one. Every phase deferred below is a
surface that either builds on that or sits beside it.

## The four deferred phases

The phase ordering is the specification's, not this build's invention. It is
dependency ordering rather than preference: the first phase builds the shell every
later phase renders inside, the second builds the conversation surfaces the third
attaches to, and the fourth builds everything that can ship once a usable product
exists (`README.md` L460).

Areas are named **functionally** throughout — for what the surface does rather than
by any product's name for it.

| Phase  | Areas                                                                                                                                                                   | Criteria                                   | Flows | Frames | Reason for deferral                                                                                                                                                                                                                                    | Phase-1 touchpoint                                                                                                                                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2**  | Threads · direct messages · search and filters                                                                                                                          | **102** (28 + 28 + 46)                     | 13    | 42     | These are the conversation surfaces that build on the shell and the messaging this run delivers, so they depend on it rather than the reverse. Deferring them costs nothing that has to be undone; building them first would have cost the shell twice | Every destination resolves to a defined placeholder, and the message row ships **thread-reply-ready**, so the thread phase needs no rework of that contract                                                                                 |
| **3**  | Huddles · canvases · lists · workflow builder                                                                                                                           | **178** (42 + 48 + 54 + 34)                | 34    | 174    | Each is a large independent surface area carrying its own entity set, and none of them is needed for a member to hold a conversation. They are additive rather than foundational, and each can be built without disturbing what is already shipped     | Every destination resolves to a defined placeholder                                                                                                                                                                                         |
| **4a** | Apps and integrations · activity and notifications · profiles and people · preferences and settings · administration console · files and media · external collaboration | **370** (56 + 47 + 57 + 50 + 78 + 45 + 37) | 61    | 257    | The widest surface of the four and the one most dependent on everything before it. Each of the seven areas reads state the earlier phases own, so building any of them ahead of its dependencies would mean building against a moving foundation       | Every destination resolves to a defined placeholder. Three mechanisms these surfaces need **already exist behind them** — see [What already exists behind the deferred destinations](#what-already-exists-behind-the-deferred-destinations) |
| **4b** | Marketing site · pricing and plans · brand guidelines · help and community                                                                                              | **190** (68 + 43 + 28 + 51)                | 74    | 265    | Public and commercial properties rather than the product. None of them is reachable by an authenticated member doing work, and none is a prerequisite for anything that is. **Recommended for indefinite deferral** — see below                        | A minimal unauthenticated landing route with sign-in and sign-up entry, and **no public marketing page beyond that**. The plan-choice and upgrade-gate contracts render and point at placeholders                                           |

Each per-phase criteria total is shown with its per-area components so the total is
checkable rather than merely asserted. Each component is the number of
acceptance-criteria checklist items in that area's own document, which is why the
sums close exactly against the specification.

### Phase 4b and the case for indefinite deferral

Phase 4b is the only one of the four this record makes a recommendation about, and
the recommendation is **indefinite deferral** rather than sequencing.

The reason is a striking allocation in the specification itself. The marketing-site
area alone owns **171 primary frames — 16.7% of the 1,022-frame corpus** — and the
catalog names it the largest allocation of the twenty-three (`README.md` L72,
restated at L1170). One sixth of all the evidence in this repository describes a
public property that no member of a workspace ever needs to load in order to do
their work.

That is not an argument that the frames are worthless. It is an argument about
sequencing under a fixed budget: the same evidence density spent on the seven
Phase-2 and Phase-3 product areas would deliver capability a member can use, while
spent here it delivers a brochure. And a public marketing property is the part of a
product
most likely to be commissioned separately, designed independently and replaced
wholesale — so building it from a third party's captures is the work most likely to
be discarded.

**What is built instead, stated exactly.** A minimal unauthenticated landing route
carrying entry to sign-in and to sign-up, and **no public marketing page beyond
that**. No landing hero, no product or solutions page, no resources library, no
customer-story or article index, no events or webinar surface, no partnerships
directory, no site search, no company or careers page, and none of the five smaller
public properties that hang off the marketing site. The route exists so that an
unauthenticated visitor arriving at the application's own address has somewhere to
land and a way in — not as a first instalment of a marketing property.

Two consequences of that decision are recorded rather than left implicit:

- **Plan tiers are referred to by placeholder throughout this build**, including in
  the surfaces that do ship. The plan-choice contract renders inside the workspace
  setup wizard and the upgrade-gate contract renders where a capability is gated;
  neither prints a tier name taken from the corpus.
- **Responsive design for the public properties is deferred with the properties
  themselves.** Two of the deferred area documents classify responsive behaviour as
  an obligation for their own surfaces; that obligation travels with the deferral
  and is recorded in `docs/decisions/responsive.md`, which owns the breakpoints the
  shipped shell honours.

### What already exists behind the deferred destinations

Phase 4a is the phase most likely to be misread as absent, because several
mechanisms its surfaces present are already built and working underneath. Stating
which ones is more honest than a blanket deferral, and it changes the estimate for
whoever picks the phase up.

| Mechanism already in place                      | What it means for the deferred surface                                                                                                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Per-viewer preference storage**               | Viewer preferences are a relation keyed by viewer, not a column on a shared record, and banner dismissal already writes there. The preferences surface is a presentation over storage that exists    |
| **Presence, with heartbeat-driven state**       | Presence is bus-backed with a heartbeat time-to-live and coalesced fan-out, and the presence indicator already renders it. The people surface reads a live signal, not a stub                        |
| **The notification projection's authorization** | A notification is a projection that leaves the product, and the read-side guard already authorizes it independently. The activity surface inherits a checked read path rather than needing one built |

Three qualifications keep that honest. The storage, the signal and the guard exist;
**the surfaces do not**. No claim is made here that any Phase-4a acceptance
criterion is satisfied — satisfaction is claimed in the traceability manifest and
nowhere else, and only by a passing test. And nothing in this table reduces the
370-criterion total.

## The arithmetic check, and why it is here

The figures above are worth nothing if they do not close, so the check is written
out rather than left for a reader to attempt.

The four deferred phases carry **102 + 178 + 370 + 190 = 840** area acceptance
criteria. Adding this run's **241** gives **1,081** area criteria across all
twenty-three area documents. Adding the **51** phase-exit gates the catalog carries
in its own build backlog gives **1,132**, which is exactly the criteria total the
requirements state. **The reconciliation closes** — there is no residue, no rounding
and no unallocated criterion, and no defect entry is warranted for scope arithmetic.

Both figures were **verified rather than accepted**, and how they were verified
matters because of an absence worth recording: the catalog publishes no overall
criteria total anywhere. It states per-phase flows and frames and it carries its own
gates, but the 1,081 and the 1,132 are the requirements' figures, not the catalog's.
They were checked by counting the acceptance-criteria checklist items in each of the
twenty-three area documents and the phase-exit gates in the build backlog, which is
countable catalog content rather than a claim about it. Every one of the twenty-three
per-area counts matched the requirements, so the two totals are independently
confirmed and neither is a defect.

Two further reconciliations close on the same figures, and both are recorded because
each could otherwise look like a discrepancy:

- **The 51 catalog gates split 12 · 10 · 10 · 19** across the four phases the
  catalog names, which is 12 for this run and **39** belonging to deferred phases.
  The 51 in the total above is the whole set, deliberately, because it is the
  specification's own figure. Gate families are reported separately in the gate
  ledger and are never summed there; the total here is a scope reconciliation, not
  a gate report.
- **This run's Phase 4a and 4b are one phase in the catalog.** The catalog's backlog
  groups them as a single fourth phase of 135 flows over 522 frames
  (`README.md` L465–L471). The split reconciles exactly: 61 + 74 = 135 flows and
  257 + 265 = 522 frames. The split is this build's, made because the two halves
  differ in kind rather than in size — one is product, the other is public property
  — and it changes no total.

Flows and frames close the same way. The five phases carry 66 + 13 + 34 + 61 + 74 =
**248 flows** and 284 + 42 + 174 + 257 + 265 = **1,022 frames**, which are the
specification's totals for the whole corpus, every frame allocated to exactly one
primary owner.

## Every deferred destination still routes

The single most important property of this deferral set is that **none of it
produces a dead control.** The catalog makes this a phase-exit gate in its own
words: every rail destination is present and routes, with destinations belonging to
later phases resolving to a defined placeholder rather than a dead control
(`README.md` L481).

Sixteen rail destinations belong to deferred phases, and all sixteen resolve to a
defined placeholder surface built from the empty-state contract. A member who
selects one sees a surface that names what the destination will do and states that
it is not built yet; they never see a control that does nothing, an empty region
with no explanation, or a route that fails.

`docs/decisions/placeholder-surfaces.md` carries the sixteen destinations and the
authored wording each placeholder presents. This record does not restate them,
because a second copy of sixteen strings is a second thing to keep true.

The same principle governs the gated affordances rather than only the destinations.
The upgrade-gate contract renders in full — badge, trial countdown and upsell strip
— and its action resolves to a defined placeholder rather than to a purchase flow
that does not exist. A gate that renders and explains itself is a working gate; a
gate that reaches a missing payment path is a defect.

## Forward-compatibility decisions that avoid rework

Two decisions inside this run's scope exist specifically so that a deferred phase
costs less when it arrives. Both are scope decisions rather than component
decisions, which is why they are recorded here, and both are consequences of the
**shared-component rule**, first in the provided order, which requires each
component contract to be implemented exactly once and extended rather than forked.

- **The message row ships thread-reply-ready.** Its contract already carries the
  in-thread reply row among its variants — a reply row inside a thread carrying a
  glyph between the author name and the timestamp while that author is in a live
  session (`00-product-overview.md` L324) — so the variant is **evidenced in the
  specification rather than anticipated by this build**, which is what makes shipping
  it now a scope decision instead of speculation. Implementing it here costs one
  variant and one test; implementing it later would mean reopening a contract that
  every conversation surface already renders. The deferred thread phase therefore
  needs **no rework of that contract**.
- **Four contracts the requirements omit are implemented now**, because each carries
  a Phase-1 variant in its own inventory row: the reference-and-data table (whose
  label-and-keys reference form is the keyboard-shortcut panel), the media player
  (whose audio-clip form sits inside the composer), the plan-choice card (whose
  onboarding pair form sits inside the setup wizard) and the record card (whose
  embedded form sits inside a message). Each is required by a surface this run
  ships, so deferring any of them would have forced a local equivalent — which the
  shared-component rule prohibits outright.

`docs/decisions/component-extensions.md` carries the judgement on each of these and
on every other candidate extension, including which are new variants and which are
new contracts. This record names them only as scope decisions and points there for
the reasoning; it re-specifies no contract.

## Exclusions that are not phases

Five things are out of scope without being a deferred phase. Each carries its reason
and what happens in this run instead, because an exclusion with no stated handling
is the kind of gap that gets discovered by a user rather than by a reviewer.

### Native desktop and mobile clients, and the hand-off between them

**Reason.** This build delivers one client, and it is the web client. A native
client is a separate application with its own distribution, update and permission
model, and nothing in the shipped product depends on one existing. The
browser-to-desktop and browser-to-mobile hand-off flow is deferred with them,
because a hand-off needs a destination.

**Phase-1 handling.** The web client is the whole product surface and is complete on
its own terms — no flow in this run's scope ends at a native client, and no shipped
control invites a person to install one. The shell is operable at the three
breakpoints the responsive record declares, so a narrower browser window is handled
by the web client rather than by a native application.

### Billing, payments and plan purchase

**Reason.** Payment handling is out of scope for this run in its entirety: there is
no provider integration, no hosted field, no token and no stored instrument.

**Phase-1 handling.** The upgrade-gate contract renders wherever a capability is
gated, and its action resolves to a defined placeholder rather than to a purchase
flow. The payment security contract is **documented, not implemented** — the
boundary is written out in full so that a future run inherits a specification rather
than a blank, because the specification is blunt that an unspecified payment
boundary is the one gap a build cannot safely be left to fill on its own
(`00-product-overview.md` L604). Both halves of that status are doing work, and both
are recorded in `docs/decisions/security-contracts.md`.

### Viewports below 768 pixels

**Reason.** The corpus is captured at exactly one width — 1920 in all 1,022 frames
(`README.md` L933) — so no narrow-width rendering exists to read. Designing a
phone-width layout for every Phase-1 surface from nothing is a larger piece of work
than the surfaces themselves, and it would be authored with no evidence at all
behind it.

**Phase-1 handling.** The shell is **operable** at 1280, 1024 and 768, which is a
tested property rather than a claim. Below 768 the limitation is either stated
explicitly in the interface — through the page-level banner variant, so a person
learns the supported minimum rather than meeting a broken layout — or the route is
deferred. `docs/decisions/responsive.md` owns the breakpoints, the per-region
behaviour at each of them and the below-the-floor handling, and this record adds
only that the floor is a scope decision rather than an oversight.

### Refactoring, performance work and tooling beyond the stated requirements

**Reason.** Nothing is refactored for its own sake and no tool is built that a
stated requirement does not ask for. The build is new, so there is no incumbent
pattern to improve; and speculative tooling in a greenfield tree is code that has to
be maintained before it has been needed.

**Phase-1 handling, with one deliberate exception.** The million-message pagination
benchmark **is** authored and **is** runnable. It has a bulk-seed fixture behind it
and it exercises keyset pagination over a conversation at the stated scale target.
What it does not do is run in the default pipeline gate — it is invoked on demand
instead, so the gate every change passes through stays fast. That is a deliberate
placement rather than an omission, and it is the reason performance work appears in
this section at all: the one piece of it that exists is stated here rather than
discovered later in a workflow file.

### Correcting the specification in place

**Reason.** The corpus-handling rule prohibits it. Where the catalog is wrong,
self-contradicting or incomplete, editing it would delete the evidence that a
judgement was ever made, and a reader following a citation would find agreement
where there was really a choice.

**Phase-1 handling.** Every defect is recorded in
`docs/decisions/catalog-defects.md` and the work proceeds under the stated
precedence order. That record carries the missing gate authority, the diverging
marker census, the two path reconciliations, the contradictory credential lifetime,
the relation-count discrepancy and the superseded no-rules statement. This record
points at it and restates none of them, and it preserves rather than reconciles the
one inconsistency it touches itself: the catalog's own Phase 4 is one phase where
this build's is two.

## The two corpus follow-ups, recorded and not done

These two have their own section because **recording them is the deliverable.**
Neither is performed in this run, and the record of why is the artifact this run
produces for them. A reader who wants to know whether the corpus was ever going to
be dealt with should find an answer here rather than silence.

### Rewriting the repository's history to remove the frame corpus

**The motivation, stated honestly.** The corpus is **599 MB across 1,022 binary
capture files**, and it is in the repository's history rather than merely in its
working tree. Every clone pays for it, in full, whether or not the person cloning
will ever open a frame. On a constrained connection that is the difference between a
usable checkout and an abandoned one, and it will be paid again by every contributor
and every continuous-integration run for as long as the history stands. The case for
rewriting is real and this record does not diminish it.

**Why it is not done here.** Three reasons, and each alone is sufficient:

- **It rewrites objects.** A history rewrite replaces every commit that touches the
  corpus with a different commit. The read-only tree's own history is among them, so
  the operation cannot be performed without touching it — and the corpus-handling
  rule makes those paths read-only inputs without qualification.
- **It cannot preserve byte-identity as a verifiable property mid-flight.** The
  requirement is that all 1,022 files remain byte-identical. A rewrite may well
  arrive at identical blobs, but during the operation the tree is rebuilt rather
  than preserved, and "probably identical afterwards" is not the guarantee the rule
  states.
- **It is repository-wide.** This run's write scope is the application, package,
  infrastructure and tools directories plus this decisions directory. A history
  rewrite is scoped to the repository as a whole and to every clone of it, which is
  categorically outside that boundary.

**What a future run would need.** Three things, none of which this run can supply
for itself:

1. **An explicit authorization decision** to widen the write scope to repository
   history, taken by whoever owns the repository rather than by the agent performing
   the work.
2. **A coordinated re-clone by every consumer.** A rewritten history is not a
   fast-forward. Every existing clone, branch, fork and pipeline cache diverges at
   the rewrite point and has to be replaced rather than pulled, so the operation
   needs a window and a notified audience, not just a command.
3. **A verification that all 1,022 frames remain byte-identical afterwards**, by
   file count and by content digest, compared against a manifest captured before the
   rewrite. Without that comparison the rule's central requirement is unproven, and
   an unproven guarantee about read-only evidence is worse than no rewrite at all.

### Migrating the frame corpus to a large-file store

**The benefit.** A large-file store keeps a pointer in the repository and the bytes
outside it, so a clone fetches frame content on demand rather than always. It
addresses the same cost as a history rewrite and is the more conventional remedy for
a binary-heavy tree — and unlike a rewrite it can be adopted going forward without
touching what is already committed.

**Why it is not done here.** Migration changes **how every frame is stored**. Each
file in the working tree becomes a small text pointer and the image content moves to
a separate store, which means the tracked content of all 1,022 files changes even
though the images a person eventually checks out do not. That directly breaches the
requirement that all 1,022 files remain **byte-identical in the tree as committed**,
and it does so by design rather than by accident — replacing content with a pointer
is the mechanism, not a side effect. It also moves a read-only input to a location
the rule does not describe, which would leave the five named read-only paths
covering pointers rather than evidence.

**What is done instead — the containment already in place.** The cost the migration
would address is mitigated by two committed mechanisms, and both are in the tree
today rather than planned:

| Mechanism        | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.gitattributes` | Declares the corpus **binary**, so no textual diff is ever attempted over a frame and no end-of-line normalisation can reach one. No repository-wide normalisation directive is declared anywhere in that file, deliberately, because a global rule is the likeliest way to rewrite a byte in a read-only input; normalisation is opt-in per path instead. The corpus is also marked vendored, so it stays out of repository language statistics |
| `.dockerignore`  | Excludes the corpus, the documentation tree and the vendor documentation folder from every build context, so the frames **never reach build output, a container image or a client bundle** — which the corpus-handling rule requires outright                                                                                                                                                                                                    |

Together those two discharge the containment obligation the rule actually states.
What they do not do is shrink the history, and that is precisely why the two
follow-ups above stay on this list rather than being marked resolved.

**What a future run would need.** An authorization decision to change how the
read-only inputs are stored; a re-clone by every consumer, since a migrated corpus
needs the store configured before a checkout produces images; and the same
byte-identity verification, applied to the content the store returns rather than to
the pointers the tree holds.

### The principle these two share

Both follow-ups are worthwhile and both are out of scope, and the way they are
handled is the general rule this build applies whenever those two facts coincide:

> A change that is worthwhile and out of scope is **recorded with its reason**. It
> is not silently skipped, and it is not quietly performed.

Silently skipping loses the analysis, so the next run repeats it. Quietly performing
breaches the boundary that made the analysis necessary — and does so in the one area
where the boundary protects evidence that cannot be recovered if it is damaged.
Recording costs a section of prose and keeps both the reasoning and the option.

## Upgrade paths recorded rather than built

Three technical choices in this build have a stronger alternative that was
identified and deliberately not taken. They are recorded so that a later reader does
not mistake the current choice for the only one available, and each carries the
**trigger** that would justify taking it — because an upgrade path with no trigger
is decoration rather than a plan.

### A persisted stream in place of the publish-and-subscribe bus

**The alternative.** An append-only log the broker retains, with consumer positions
held broker-side and redelivery on reconnect. It would give stronger delivery
guarantees than the current bus, which is at-most-once.

**Why it is not needed now.** Ordering and completeness do not depend on the
transport at all. The durable per-conversation sequence is authoritative, allocated
inside the same transaction as the message insert and protected by a uniqueness
constraint, and the client reconciles any gap over HTTP from its highest contiguous
sequence. The bus is an accelerator, and an accelerator that drops has an obvious
remedy — ask the database. `docs/decisions/realtime-contract.md` carries the full
reasoning, the envelope and the replay path, and this record does not restate them.

**The trigger.** Take the upgrade when the reconciliation path stops being cheap:
when replay requests measurably load the database under normal operation rather than
only after an incident, or when the bounded replay window is exceeded often enough
that forced refetches become a visible part of the experience rather than an edge
case. Neither is a reason to build it before it happens, because a second durable
ordering surface that can disagree with the first is a worse problem than an
accelerator that can drop.

### A different search implementation behind the existing interface

**The alternative.** A dedicated search engine in place of the database's own
full-text search.

**Why it is not needed now.** Search is defined as an interface with a full-text
implementation behind it, and **that separation is the entire reason the interface
exists**. It is not indirection for its own sake: a caller depends on the interface
rather than on the implementation, so the implementation can be replaced without a
single call site changing. Building the engine now would add an operational
dependency to the local stack, and to every environment, for a Phase-1 surface set
that does not yet include search results — search results are a deferred phase, and
only the search entry ships in this run because it is part of the shell.

**The trigger.** Take the upgrade when the search surfaces arrive and the
full-text implementation cannot meet their requirements: when ranking quality across
typed result families becomes the complaint, when faceted filtering composes into
queries the database plans badly, or when index maintenance begins to compete with
the write path for the same resources. Any one of those is a measurement rather than
an opinion, which is what makes the trigger usable.

### The six-line site-configuration change that would make fenced diagrams render

**The alternative.** The documentation site's plugin bundles a superfences Markdown
extension that consumes fenced code blocks before the diagram plugin can claim them,
so every diagram fence in the specification publishes as a highlighted code box and
the built page contains no diagram-bearing markup at all (`README.md` L905). A
**six-line** superfences declaration in the site configuration was verified to fix
exactly that (`README.md` L909).

**Why it is not applied.** The site configuration is one of the five read-only
inputs. The fix adds a key to it, which exceeds the single permitted navigation edit
that file has ever been open to, so it is an **authorization-gated follow-up and is
deliberately not applied here.** The specification reached the same conclusion about
the same six lines and says plainly that they should not be applied without that
authorization.

**This is why these records use tables and prose rather than diagrams.** A diagram
fence in this file would publish as a clipped code box, so the structure that a
diagram would carry is written as a table instead. Every fenced line in this
directory is also held to 74 characters for the same underlying reason: a published
code box clips rather than wraps.

**The trigger.** Apply it when the authorization to widen the change surface on the
site configuration is granted — and apply it as its own change, verified by building
the site and confirming that diagram-bearing markup is present, rather than folded
into an unrelated commit. Two further verified site-configuration remedies are
withheld on identical terms and are recorded in the catalog's own limitations
alongside this one (`README.md` L1187); this record names the diagram fix because it
is the one that shapes how these records are written, and does not restate the
others.

## How this record is kept current

This file is a scope register, so it goes stale the moment scope moves. Three
changes oblige an edit here, and each is a recorded act rather than a quiet one.

- **Bringing a deferred phase into scope** obliges removing its row from the
  deferred table, moving its criteria into the traceability manifest with a target
  test for each, and re-running the arithmetic check so the reconciliation still
  closes. A phase moved into scope without its criteria moving with it would leave
  the totals correct and the manifest short, which is the failure this record's
  arithmetic exists to catch.
- **Performing either corpus follow-up** obliges replacing its entry with the record
  of what was done, the authorization it was done under, and the byte-identity
  verification that followed. The entry is not deleted: a completed follow-up is
  evidence, and deleting it would leave the next reader unable to tell a performed
  operation from one that was never attempted.
- **Taking an upgrade path** obliges recording the measurement that fired its
  trigger, so the decision is attributable to evidence rather than to preference,
  and updating the record that owns the subject — the realtime contract, the search
  interface, or the site configuration's authorization state.

Adding a new deferral obliges the full set: a reason, a Phase-1 handling, and its
figures reconciled into the arithmetic. A row with a reason but no handling does not
qualify, because an exclusion whose user-visible consequence is unstated is the kind
that ships as a dead control.

## Companion records

| Record                                   | What it holds that this one deliberately does not                                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `docs/decisions/ac-manifest.md`          | All 241 in-scope criteria with their target tests and status. Satisfaction is claimed there and nowhere else                  |
| `docs/decisions/phase-gates-ledger.md`   | The gate families and their counts, reported separately and never summed                                                      |
| `docs/decisions/placeholder-surfaces.md` | The sixteen deferred destinations and the authored wording each placeholder presents                                          |
| `docs/decisions/gap-register.md`         | Every unevidenced behaviour inside scope, with its marker, options, choice and rationale — the deferrals this file is **not** |
| `docs/decisions/component-extensions.md` | Which contracts gained variants and which are new, including the four implemented here as forward compatibility               |
| `docs/decisions/observed-values.md`      | The configurable defaults, so that an uncertain value never becomes a reason to omit a mechanism                              |
| `docs/decisions/security-contracts.md`   | How each security contract is discharged, and why the payment contract's status is documented rather than implemented         |
| `docs/decisions/responsive.md`           | The breakpoints, the per-region behaviour at each, and the handling below the floor this record fixes as a scope choice       |
| `docs/decisions/realtime-contract.md`    | The transport, the envelope, the sequence and the replay path the persisted-stream upgrade would change                       |
| `docs/decisions/catalog-defects.md`      | Specification defects and contradictions, recorded rather than corrected in place                                             |

If any of them diverges from this record, the divergence is a finding to record
rather than a discrepancy to smooth away. This file is the authority on what is out
of scope and why; each sibling is the authority on its own subject.

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **No frame was opened.** Not one. Every figure above was resolved from catalog
  prose and from countable catalog content — the per-area acceptance-criteria
  checklists, the published per-area ownership map and the build backlog's own phase
  table. The corpus was consulted only for aggregate metadata that is not an
  enumeration: a file count and a directory size. Opening a frame could not have
  answered a single question this record asks, because scope is not visible in a
  screenshot.
- **No frame is cited at all**, so no frame number appears. No filename appears
  either, and neither does the catalog's percent-encoded citation form — both carry
  a third-party product name.
- **Rules cited by subject and position, never by identifier.** Each of the five
  project rules carries a platform identifier that itself embeds a third-party
  product name, so writing one here would breach the identity rule this record is
  otherwise observing. They are cited by what they govern and where they sit in the
  provided order — the shared-component rule is the first, the server-authorization
  rule the second, the corpus-handling rule the third, the uncertainty rule the
  fourth, the identity rule the fifth. Position alone would be unsafe, because the
  identifiers are permuted relative to the requirement labels the prompt uses;
  position **with** subject is not.
- **Functional, authored naming throughout.** Every deferred area is named for what
  its surfaces do — threads, direct messages, search and filters, huddles, canvases,
  lists, workflow builder, apps and integrations, activity and notifications,
  profiles and people, preferences and settings, administration console, files and
  media, external collaboration, marketing site, pricing and plans, brand
  guidelines, help and community. Several of those correspond to a third party's
  feature names; none is written that way. No product name, wordmark or brand colour
  value appears in the text, the headings or any link label, and no string legible in
  any frame is transcribed.
- **Plan tiers by placeholder only.** No tier name appears anywhere in this record,
  including where the corpus prints one, and the same rule binds the surfaces that
  ship.
- **No sample entity name is reproduced.** The channel, person and role names
  visible in the corpus illustrate shape only. None appears here, and none reaches
  seed data or a test fixture.
- **No diagram fences.** The committed site configuration does not render them, for
  the reason set out under the upgrade paths above, so structure is carried in tables
  and prose. This record neither adds a navigation entry to the site configuration
  nor applies the withheld six-line fix — both are out of bounds.
- **Fenced lines are held to 74 characters**, the catalog's measured ceiling, because
  a published fence clips rather than wraps. This record satisfies the ceiling by
  containing **no fenced block at all**: the recording principle is carried as a
  block quotation, which wraps at any width, and every other structure is a table or
  prose. The ceiling is stated here so that anyone adding a fence later knows it
  binds.
- **Evidence by citation; absence recorded as absence.** Every figure names where it
  came from or is checkable from its stated components. Where something does not
  exist — a native client, a public marketing page, a payment path — the record says
  so and states what stands in its place, rather than implying a partial version that
  is not there.
- **Inconsistencies preserved rather than reconciled.** The catalog groups its fourth
  phase as one; this build splits it into two. Both readings are carried above with
  the arithmetic that connects them, and neither is asserted over the other. It is
  deliberately **not** logged as a catalog defect, and the distinction is worth
  keeping: the catalog is not wrong here, it simply groups differently, and its
  grouping and this one agree on every total. A divergence that reconciles is a
  difference of presentation; only a divergence that does not reconcile is a defect,
  and those live in `docs/decisions/catalog-defects.md`.
- **One absence recorded rather than filled in.** The catalog publishes no overall
  acceptance-criteria total anywhere, so the 1,081 and the 1,132 are the
  requirements' figures rather than the catalog's. That is stated where the figures
  are used instead of being smoothed over, and both were confirmed by counting the
  catalog's own content rather than by trusting the source.
- **Nothing here is deferred for want of a value.** Every entry is deferred because
  a later phase owns it or because it is outside the product this run delivers.
  Every uncertain value inside scope became a configuration constant, and every
  unevidenced behaviour inside scope became an implemented choice in the gap
  register.
