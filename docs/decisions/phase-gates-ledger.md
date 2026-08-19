# The gate ledger — the operative exit conditions, mirrored to a permitted path

The build prompt names `docs/PHASE-GATES.md` as the authority on exit conditions for every
phase, and gives that file precedence over the prompt itself where the two disagree. The file
does not exist. The prompt's own inline restatement of the ledger is therefore the only
available authority, it is operative in full, and this record is the mirror of it. The absence
is logged as a defect and is not re-narrated here — see
[`docs/decisions/catalog-defects.md`](catalog-defects.md#1-the-gate-authority-the-prompt-names-does-not-exist),
entry 1, which carries the verification, the precedence steps and the reasoning.

**Do not create `docs/PHASE-GATES.md`.** The corpus-handling rule confines new documents to
`docs/decisions/`, so creating the file at the path the prompt names would breach the write
boundary in the very act of satisfying a citation. That is why this ledger is mirrored rather
than relocated, and why the repository's root guide points here for the operative authority.

This record **reports**. It originates no number. Every figure it carries is read from a
sibling record that owns it, and the sections below name which one for each. A ledger that
computes its own totals is a second place for the truth to live, and the two eventually
differ — so this one counts rows it does not own and says where it counted them.

| Field                               | Value                                                                                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record — the mirrored gate ledger and the run's reporting format                                                               |
| Status                              | Operative. Mirror of the prompt's inline ledger, which governs in the absence of the file it names                                      |
| Gate families                       | **Five**, reported separately and never summed into one another                                                                         |
| Run total                           | **267** = 11 + 241 + 12 + 3. The 11 standing gates sit **outside** this sum                                                             |
| Reported at                         | **Two points only** — Phase-0 exit and run end                                                                                          |
| Figures at the moment of authoring  | **Zero met in every family.** Every criterion row in the manifest reads `not started`, which is the correct state for a precondition    |
| Frames opened to author this record | **0** — every fact below was resolved from catalog prose and from countable catalog content                                             |
| Companion records                   | `docs/decisions/ac-manifest.md`, `docs/decisions/catalog-defects.md`, `docs/decisions/roadmap.md`, `docs/decisions/frame-access-log.md` |

(Rules are cited throughout by subject and by position in the order they were provided, never
by their platform identifiers. Each identifier embeds a third-party product name, and the
identity rule — the fifth as provided — prohibits that name in source, comments and copy
alike, so writing one here would breach the rule this record is otherwise observing. The
single-implementation rule is the first as provided, the authorization rule the second, the
corpus-handling rule the third, and the uncertainty rule the fourth. Position alone would be
unsafe, because the identifiers are permuted relative to the requirement labels; position
together with subject is not.)

## The non-summing rule

**Gate families are reported separately and are never rolled into a single figure.** This is
the most easily violated instruction in the run, so it is stated before anything it governs.

The families count different kinds of thing. A Phase-0 authored gate is a foundation that a
later phase stands on. A Phase-1 area criterion is one checklist item in one area document. A
catalog gate is a phase-exit condition the specification set for itself. A standing gate is a
condition that must hold continuously rather than at any boundary. A figure that adds them
together is not a tidier summary of the same fact — it answers no question anyone has, and it
conceals precisely what a reader needs, because a family at full coverage cannot compensate
for a family that is short and a merged total lets it appear to.

Two specific prohibitions follow, and both have teeth:

- **The 11 Phase-0 authored gates and the 11 standing gates are disjoint sets and must never
  be summed.** Both families happen to number eleven. That coincidence is the whole hazard:
  two elevens sitting in the same report invite a reader — or a careless author — to treat one
  as a restatement of the other, or to add them into a plausible-looking twenty-two. They
  overlap in subject at several points and in membership at none. A Phase-0 gate is met once,
  at a boundary, and stays met; a standing gate can be met this hour and failed the next,
  which is why it is tracked continuously and reported as its own line.
- **The 11 standing gates are never added into the 267.** The run total is the sum of the four
  phase-bounded families and nothing else. The standing family is reported on its own line,
  immediately above the run total, precisely where a reader is most likely to try to add it —
  and it does not belong in that sum.

## Two reporting points, and no others

Reporting happens at **Phase-0 exit** and at **run end**. Not per stage, not per surface, not
continuously. The ledger is a statement about whether a phase may be left behind, and a figure
emitted halfway through a phase measures nothing that anybody can act on: it is a snapshot of
work in flight, and publishing it invites the snapshot to be mistaken for a verdict.

The standing family is the apparent exception and is not one. Standing gates hold continuously
and are enforced continuously by the pipeline, but they are _reported_ at the same two points
as everything else, so the report has one cadence rather than two.

## The reporting ledger

The ledger below is the mandated reporting format, reproduced field for field.

One line of it is wrapped, and the wrap is a **publication constraint rather than a change to
the format**. Every line in this record's fences is held to 74 characters so it survives a
narrow rendering without reflowing; the area-criteria line is 80 characters as mandated, so
its parenthesised breakdown is carried on a continuation line indented to the value column.
**No field, count, separator or prefix is lost or altered.** Rejoining the two halves with the
two spaces that separated them reproduces the mandated line byte for byte — including both
middle-dot separators and the two-digit area prefixes — and the value column stays aligned
with every other line, so the wrapped form reads as one entry rather than two.

```text
Phase 0 authored        N/11
Phase 1 area criteria   N/241
                        (00:N/39 · 01:N/46 · 02:N/61 · 03:N/57 · 21:N/38)
Phase 1 catalog         N/12
Phase 1 authored        N/3
Standing                N/11
Run total               N/267
Deferred                <explicit list, each with a reason>
Frames opened           N  (see docs/decisions/frame-access-log.md)
```

The label column is fixed. `Phase 1 area criteria` in particular must stay byte-identical,
because the manifest regenerator holds that exact string as the label of the one family it
reports, and a report whose label drifts from the tool's is a report that cannot be
cross-checked against it.

The repository's root guide carries this same block, and the two must stay identical. The
formatter is configured to leave it alone for that reason — fencing protects the contents, and
prose around it is preserved rather than rewrapped — so a change to the format here is a change
that must be made in both places or in neither.

### The arithmetic, stated so it can be checked

```text
Phase 0 authored         11
Phase 1 area criteria   241
Phase 1 catalog          12
Phase 1 authored          3
                        ---
Run total               267

Standing                 11   outside the sum above
```

11 + 241 + 12 + 3 = **267**. The standing 11 is **excluded** from that total by construction,
not by oversight, and adding it to reach 278 is the specific error this record exists to
prevent.

## Where each number comes from

This ledger counts rows in records it does not own. Each line has exactly one source, and a
figure produced any other way — by hand, by estimate, by reading a pipeline summary — is not a
figure this ledger may carry.

| Ledger line             | Read from                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Phase 0 authored`      | The eleven gate rows in this record, each against the proof named in its own row                                                                                                |
| `Phase 1 area criteria` | [`ac-manifest.md`](ac-manifest.md#agreement-with-the-gate-ledger) — a count of rows whose status records a passing test, and nothing else                                       |
| `Phase 1 catalog`       | The twelve gate rows in this record, each against the proof named in its own row                                                                                                |
| `Phase 1 authored`      | The three gate rows in this record, each against the proof named in its own row                                                                                                 |
| `Standing`              | The eleven `S`-numbered rows in this record, each against the pipeline stage or suite named in its own row                                                                      |
| `Run total`             | The sum of the four lines above it. Never the sum of five                                                                                                                       |
| `Deferred`              | [`roadmap.md`](roadmap.md#the-four-deferred-phases) for scope, and [`ac-manifest.md`](ac-manifest.md#criteria-bounded-by-phase-scope) for the individual criteria bounded by it |
| `Frames opened`         | [`frame-access-log.md`](frame-access-log.md#the-log) — quoted, never independently counted                                                                                      |

The last row carries an explicit precedence, set by the access log itself: the ledger never
maintains its own frame count, so if this record and the access log ever disagree, **the access
log is right and this record is stale**.

## Phase 0 authored gates — 11

These are the foundation gates. Each one is a thing a later phase stands on, so each is met at
the Phase-0 boundary and stays met; none is a continuous condition, which is what keeps this
family disjoint from the standing family below.

| Gate  | What it requires                                                                                                                                                                                                                                                                 | Discharged by                                                                                                                | How it is proved                                                                                                                                                                                                                                                                                                  |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-1  | A clean clone reaches a running system by the documented sequence, with the lockfile committed rather than resolved on the fly, and the pipeline green across every stage                                                                                                        | The workspace root, its task graph ordering every build behind its upstream builds, and the committed lockfile               | The documented sequence executed against a fresh clone, and a pipeline run in which no stage is skipped                                                                                                                                                                                                           |
| P0-2  | A schema derived from the catalog's consolidated entity set, with the per-viewer relations present **before** any feature writes to them, so no per-viewer fact is ever a column on a shared record                                                                              | The schema and its checked-in migrations in the database package                                                             | Migrations applying to an empty database, and the relation placements asserted against [`data-model.md`](data-model.md)                                                                                                                                                                                           |
| P0-3  | Workspace isolation enforced **structurally at the read path** — a client extension spanning every model and every operation, sitting below every caller so a call site cannot forget it, bound to the acting session so the workspace identifier can only originate server-side | The tenancy extension in the database package, bound to the session in the API                                               | Two seeded workspaces under original authored names, proving a cross-workspace read returns nothing at all rather than a refusal, and that no caller-supplied identifier widens the predicate                                                                                                                     |
| P0-4  | One server-side chokepoint through which every mutation passes, checked at the point of execution against the acting session and the specific target object, with each projection authorized independently                                                                       | The policy layer, the mutation guard and the projection guard in the API                                                     | The denial suites named in [`role-matrix.md`](role-matrix.md#what-tests-this-record). This gate is the **authorization rule** (the second as provided) expressed as an exit condition                                                                                                                             |
| P0-5  | Realtime delivery whose ordering is durable rather than transport-dependent: a per-conversation sequence allocated inside the same transaction as the insert, replay from the client's highest contiguous position on reconnect, and fan-out across instances                    | The realtime gateway, the transactional allocator and the cross-instance bus wiring                                          | Sequence monotonicity under concurrent sends, replay after a forced disconnect, and fan-out observed across **two** running instances                                                                                                                                                                             |
| P0-6  | Design tokens **derived by measurement rather than estimated**, with the raw tool output committed and every geometric token carrying the provenance that produced it; values measurement cannot recover marked as chosen defaults rather than presented as measured             | The measurement tool and its committed output, and the token module                                                          | The tool's detector tests on synthetic images, and each token traced to the output line and frame number behind it                                                                                                                                                                                                |
| P0-7  | Each component contract implemented **exactly once** in the shared library, consumed through one barrel, with local or partial equivalents failing the build rather than review                                                                                                  | The contract modules in the component library, its single public entry, and the boundary rule in the lint configuration      | A lint run rejecting a deep import and a local re-implementation. This gate is the **single-implementation rule** (the first as provided) expressed as an exit condition; the extension judgements are in [`component-extensions.md`](component-extensions.md#the-no-merge-pairs-stated-so-they-cannot-be-missed) |
| P0-8  | The traceability manifest generated **before any Phase-1 surface is implemented**, so satisfaction is verifiable rather than retrospective                                                                                                                                       | [`ac-manifest.md`](ac-manifest.md) and its regenerator                                                                       | The manifest present and reconciling to its five subtotals ahead of the first surface, and regenerable from the suite thereafter                                                                                                                                                                                  |
| P0-9  | The local dependency stack and the environment template reach a running system with **no external accounts**, so email and object storage work offline                                                                                                                           | The compose stack and the committed environment template                                                                     | The stack brought up from a clean state and the documented sequence completing against it                                                                                                                                                                                                                         |
| P0-10 | Corpus containment: the frame corpus never enters build output, a container image or a client bundle, and never pollutes a diff                                                                                                                                                  | The container ignore file and the attributes file marking the frames binary                                                  | The corpus absent from a built image's context and from bundle output, and the file count and byte-identity verified from metadata alone                                                                                                                                                                          |
| P0-11 | Third-party identity excluded everywhere — no product name, logo, wordmark or brand colour value in source, assets, copy, comments, tests, fixtures, or file, directory, branch and commit names — enforced by a guard in the pipeline rather than by review                     | Authored copy in one module, original or open-licensed icon artwork, runtime frame resolution by number, and the brand guard | A guard run reporting zero occurrences outside the five read-only allowlisted paths. This gate is the **identity rule** (the fifth as provided) expressed as an exit condition                                                                                                                                    |

**On P0-6 and the path the gate names.** The gate states the token module at a bare
`src/styles/tokens.ts`, with no workspace prefix, and that path lies outside the directories
the corpus-handling rule permits for new code. The module is at
`packages/ui/src/styles/tokens.ts`, which satisfies the gate's stated suffix exactly while
sitting inside the permitted packages directory. The reconciliation is recorded once, in
[`catalog-defects.md`](catalog-defects.md#3-the-token-module-path-in-the-gate-lies-outside-the-write-boundary),
entry 3, and is not restated here.

## Phase 1 area criteria — 241

This family is the 241 acceptance criteria carried by the five Phase-1 area documents. They are
**not enumerated here** — that is the manifest's job, and a second copy would be a second thing
to keep true. This ledger reports the count; [`ac-manifest.md`](ac-manifest.md) holds every
criterion with its source document, line, cited frame, target test and status, and it is the
only place a criterion may be marked satisfied.

| Area document                  | Criteria |
| ------------------------------ | -------- |
| `00-product-overview.md`       | 39       |
| `01-onboarding-and-auth.md`    | 46       |
| `02-channels.md`               | 61       |
| `03-messaging-and-composer.md` | 57       |
| `21-states.md`                 | 38       |
| **Total**                      | **241**  |

The five subtotals were **verified independently** rather than taken on trust, by counting the
checklist items in each area document at source. The count returned 39, 46, 61, 57 and 38,
summing to exactly 241, and reconciles with the requirement ledger and with the twelfth catalog
gate below with no discrepancy. Because the arithmetic closes, no defect entry is warranted for
it, and the check is recorded as sound in
[`catalog-defects.md`](catalog-defects.md#checked-and-found-sound).

The ledger's `Phase 1 area criteria` line is a count of manifest rows whose status records a
**passing test**, and nothing else may produce it. In particular a row recording only that a
test _cites_ the criterion is not a met criterion: a citation is a claim about intent
discovered from a comment, not evidence that the test exercises the criterion and not evidence
that it passes. See [the preserved inconsistency](#a-preserved-inconsistency-in-the-status-vocabulary)
below, which is why that distinction is drawn explicitly here.

## Phase 1 catalog gates — 12

These are the specification's own Phase-1 exit conditions, taken from its prioritized build
backlog. The catalog is explicit that they are phase-exit gates chosen to be objectively
checkable, and deliberately not a copy of the per-area criteria — which is why they are a
separate family from the 241 rather than a summary of them.

Each gate below is summarised in authored words. The catalog is a read-only input and its
wording is not transcribed; where a detail matters, the row names it rather than quoting it.

| Gate | What it requires                                                                                                                                                                                                                                                                              | Discharged by                                                                                | How it is proved                                                                                                                                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-1  | The product's name, logo mark, wordmark and colour palette exist as design tokens **before any screen is built**, and no third-party brand value appears anywhere in the codebase                                                                                                             | The token module, the icon set and the authored copy module                                  | A brand-guard run reporting zero occurrences, and a token module present ahead of the first surface. See [`theme-and-color.md`](theme-and-color.md) |
| C-2  | Every component contract a Phase-1 surface needs — drawn from the inventory's 99 defined identifiers — is implemented once as a shared component matching its contract, and no Phase-1 screen re-implements one locally                                                                       | The contract modules in the component library, behind one barrel and the lint boundary       | Co-located contract tests covering the documented variants and states, plus a lint run rejecting any local equivalent                               |
| C-3  | The shell renders as a persistent layout owning a routed content region: navigation rail, sidebar with collapsible sections, top bar carrying history controls and the search entry, and the global create menu                                                                               | The shell composition in the web application                                                 | Navigation between destinations leaving the rail, sidebar and top bar mounted, with only the content region replaced                                |
| C-4  | **Every rail destination is present and routes**, with destinations belonging to later phases resolving to a defined placeholder rather than a dead control                                                                                                                                   | The routed surfaces and the sixteen placeholder surfaces                                     | Every destination exercised and asserted to resolve. See [`placeholder-surfaces.md`](placeholder-surfaces.md)                                       |
| C-5  | Sidebar multi-select works end to end: per-item checkboxes, a selection-count bar reading the count, clear-selection, move-to and done                                                                                                                                                        | The sidebar contract and its multi-select state                                              | The full selection sequence driven end to end against the sidebar contract                                                                          |
| C-6  | The five named entities — workspace, user, channel, message and reaction — are persisted with every field the consolidated data model lists for them                                                                                                                                          | The schema and its migrations                                                                | Field-level assertions against the model recorded in [`data-model.md`](data-model.md)                                                               |
| C-7  | Sign-up, emailed-code verification, account confirmation and the multi-step workspace setup wizard all complete, with the wizard's progress label, one-question-per-step layout and back-and-forward controls matching the step-wizard contract                                               | The authentication surfaces and the setup wizard                                             | The sequence walked from first entry to a set-up workspace, plus the wizard's own contract test                                                     |
| C-8  | Sign-in succeeds by password **and** by emailed code, and each rejection path renders the recovery affordance its flow specifies — an invalid code and a rejected credential are distinct states, not one generic error                                                                       | The two sign-in paths and their rejection states                                             | Both paths walked to success, and each rejection asserted as a distinct state with its own affordance                                               |
| C-9  | Channel creation completes through both steps with a visibility choice, and the name field enforces the observed lower-case, no-spaces rule and its character limit with a live counter                                                                                                       | The channel creation surfaces and the shared name invariants                                 | Both steps walked, and the name rule and counter asserted at and beyond the limit                                                                   |
| C-10 | The channel details surface exposes all four tabs, the member count in its tab label, inline editing of name, topic and description, creator with creation date, a copyable channel identifier, and the destructive leave, archive and delete actions behind the confirmation-dialog contract | The channel details surfaces and the details-pane, tab-bar and confirmation-dialog contracts | Each tab opened and asserted, each inline edit round-tripped, and each destructive action asserted to require confirmation                          |
| C-11 | Sending, editing, deleting, pinning and reacting to a message all work, and the composer offers the full formatting-toolbar control set the messaging document specifies                                                                                                                      | The messaging surfaces, the composer contract and the formatting toolbar                     | Each operation driven end to end, and the toolbar's control count and grouping asserted on its contract test                                        |
| C-12 | Every acceptance criterion in the five Phase-1 area documents passes, and every Phase-1 flow is walkable end to end from its trigger to its final state                                                                                                                                       | The whole Phase-1 surface set                                                                | The manifest reporting a passing test for every criterion, and one end-to-end specification per flow family                                         |

### The twelfth gate carries a struck clause

As written, C-12 ends with a further condition: that every Phase-1 flow be walkable end to end
**without reopening the corpus**. **That clause is struck and replaced.** In its place stands
the corpus-handling rule's governed-access regime, which is stricter in substance and merely
different in form: resolve from catalog prose first; open a frame only where an authorizing
clause covers it; never survey, enumerate, sample or scan; and log any task that needs more
than six frames with a justification naming the frame, the task and what the catalog failed to
answer.

The replacement is not a relaxation. The struck clause forbids corpus access as a _test of
completeness_ — a proxy measure, satisfied by never looking. The regime that replaces it
forbids corpus access as a _standing rule_ with narrow, named exceptions, and requires every
exception to be written down. A build can satisfy the struck clause by accident; it can satisfy
the regime only deliberately.

Consequently C-12 is proved by the manifest and the end-to-end suite, and the corpus condition
attached to it is discharged by the access log rather than asserted here. The authoritative
count of frames opened, and the justification for each, is
[`frame-access-log.md`](frame-access-log.md#the-log); the conditions under which a frame may be
opened at all are [in that same record](frame-access-log.md#when-a-frame-may-be-opened).

## Phase 1 authored gates — 3

These three gates have no counterpart in the catalog, because nothing in the corpus could
evidence them. Each was authored for this run, and each is listed here so that being authored
does not become a reason for being unproved.

| Gate  | What it requires                                                                                                                                                                                                                                                 | Discharged by                                                                                                                                                                                                                                  | How it is proved                                                                                                                                                                                                                                        |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1A-1 | The nine state families the corpus never shows — the connection families, the limit families, not-found and their relatives — ship as **working behaviour** rather than being omitted for want of evidence, each with its options, choice and rationale recorded | The state presentations in the component library and the surfaces that host them, per the judgements in [`gap-register.md`](gap-register.md#the-nine-unevidenced-state-families) and the presentations in [`state-matrix.md`](state-matrix.md) | Each family driven from a forced condition in the states specification, with the connection families additionally asserted against the realtime integration suite                                                                                       |
| P1A-2 | The authored role matrix exists **and is enforced**, with a denial suite proving that a non-member and a wrong-role caller are refused **server-side** for every mutation, and that a private resource is absent from every projection                           | The role enumeration, the capability matrix and the policy layer, authored in [`role-matrix.md`](role-matrix.md#the-five-account-types)                                                                                                        | The three suites named in [`role-matrix.md`](role-matrix.md#what-tests-this-record) — with the wrong-role caller a genuine member of the workspace or channel, since a non-member used for both halves proves isolation twice and capability not at all |
| P1A-3 | The responsive contract holds at 1280, 1024 and 768, and accessibility conformance holds **in both themes** — including the criteria automated scanning cannot judge                                                                                             | The breakpoints, the region primitives and the theme derivation, per [`responsive.md`](responsive.md#the-breakpoints)                                                                                                                          | The operability conditions asserted once per width, plus an accessibility scan across every Phase-1 route at each width, as set out in [`responsive.md`](responsive.md#verification-how-this-contract-is-proved)                                        |

P1A-2 is the **authorization rule** (the second as provided) carried into a phase gate, and
P1A-1 is the **uncertainty rule** (the fourth as provided) carried into one: uncertainty is
never permission to omit, so a state family the corpus cannot evidence still ships and is still
proved. Neither rule is restated here — the records named in the rows carry the detail, and this
ledger points at them.

## Standing gates — 11

**This is a separate family and is never added into the 267.** It is stated again here because
this is the section where the mistake gets made: these eleven are conditions that must hold
_continuously_ rather than at a phase boundary, so they are not phase exits and do not belong in
a run total of phase exits.

The `S` numbering is **stable and is reported**, so a number is never reused or reordered. If a
standing condition is ever added, it takes the next number rather than displacing one.

| Gate | What it requires                                                                                                                                                                                           | Discharged by                                                                      | How it is proved                                                                                                                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1   | The pipeline runs **every** stage — typecheck, lint, unit, integration, end-to-end, accessibility, brand and corpus integrity. A green pipeline with a skipped stage is not green                          | The pipeline definition                                                            | A run in which every stage reports a result, checked stage by stage rather than by the summary badge                                                                                                |
| S2   | All 1,022 frames remain **byte-identical**, verified from metadata alone                                                                                                                                   | The corpus-integrity guard                                                         | A guard run confirming the file count and byte-identity without opening or hashing a frame                                                                                                          |
| S3   | Zero third-party identity outside the five read-only allowlisted paths                                                                                                                                     | Authored copy, original icon artwork, and runtime frame resolution by number       | A brand-guard run reporting zero occurrences outside the allowlist                                                                                                                                  |
| S4   | Every rendered value resolves to a token, with colour literals in **exactly one file**                                                                                                                     | The token module and the stylesheets that consume it                               | A scan for literals outside the token module, and the token module's own tests                                                                                                                      |
| S5   | Each component contract is implemented **exactly once**, with no local, partial or inlined equivalent and no two contracts merged                                                                          | The component library and the lint boundary                                        | A lint run rejecting deep imports and local equivalents, and the no-merge pairs asserted in [`component-extensions.md`](component-extensions.md#the-no-merge-pairs-stated-so-they-cannot-be-missed) |
| S6   | Every mutation and every projection is authorized **server-side**, with no decision resting on a caller-supplied workspace or actor identifier, and a hidden, disabled or absent control exempting nothing | The mutation guard and the projection guard                                        | The denial, tenancy and projection suites, one assertion per projection                                                                                                                             |
| S7   | Every configurable value is defined **once** as a named constant and consumed by reference, never inlined at a point of use, with records storing **absolute timestamps** rather than durations            | The two configuration modules and the schema                                       | Assertions that each mechanism reads its constant, plus the values recorded in [`observed-values.md`](observed-values.md)                                                                           |
| S8   | **No criterion is marked satisfied without a passing test behind it**                                                                                                                                      | [`ac-manifest.md`](ac-manifest.md#the-status-vocabulary) and its status vocabulary | The manifest regenerated from the suite rather than edited by hand, with no synonym for satisfaction available to write                                                                             |
| S9   | The corpus never enters build output, a container image or a client bundle                                                                                                                                 | The container ignore file and the attributes file                                  | The corpus absent from an image's build context and from bundle output                                                                                                                              |
| S10  | New code only under the applications, packages, infrastructure and tools directories; new documents only under `docs/decisions/`                                                                           | The delivered tree                                                                 | The tree inspected against the write boundary, and no file created under a read-only path                                                                                                           |
| S11  | Specification defects are **recorded rather than corrected in place**                                                                                                                                      | [`catalog-defects.md`](catalog-defects.md#the-seven-entries-at-a-glance)           | Every read-only input unmodified, with each defect carrying a recorded resolution instead of an edit                                                                                                |

S2, S9, S10 and S11 are the **corpus-handling rule** (the third as provided) held continuously.
S3 is the **identity rule** (the fifth). S5 is the **single-implementation rule** (the first).
S6 is the **authorization rule** (the second). S7 and S8 are the **uncertainty rule** (the
fourth). The rules are the reason these conditions are standing rather than phase-bounded: a
rule does not stop applying because a phase ended.

## Reporting discipline

### The cross-reference obligation runs in both directions

**This ledger and the manifest's status column must agree**, and the obligation is symmetric.
The manifest is where the numbers come from; this ledger reports them.

- **A figure here with no rows behind it is a defect in this file.** The correction is made
  here, never in the manifest — a ledger is not permitted to adjust the record it reads from in
  order to make its own arithmetic close.
- **A row the manifest records as proved that this ledger does not count is equally a defect**,
  and it means this ledger was written by hand rather than regenerated from the manifest.

The per-area breakdown is what makes the agreement mechanically checkable: five subtotals here,
five subtotals there, matching one for one. The deferrals are held to the same standard — the
criteria bounded by phase scope at the foot of the manifest and the `Deferred` line of this
ledger must name the **same** criteria with the **same** reasons.

### The `Deferred` line

`Deferred` is an **explicit list, each item with a reason**. "Not done" alone is not an
acceptable line, and neither is a count. The inventory is not duplicated here:
[`roadmap.md`](roadmap.md#the-four-deferred-phases) holds the deferred phases with the reason
for each, [its exclusions section](roadmap.md#exclusions-that-are-not-phases) holds the five
things out of scope without being a deferred phase, and
[its follow-ups section](roadmap.md#the-two-corpus-follow-ups-recorded-and-not-done) holds the
two corpus operations recorded and deliberately not performed. The individual in-scope criteria
bounded by phase scope are at
[`ac-manifest.md`](ac-manifest.md#criteria-bounded-by-phase-scope), and those are the ones this
line must name.

### The honesty rules

- A green pipeline with a **skipped stage is not green**. Every stage reports a result, or the
  run is not reportable.
- A gate is met **only when its proof passes**. Not when the code exists, not when it looks
  right, and not when someone is confident about it.
- Families are **never merged**, and no family is rolled into another to produce a tidier
  figure.
- The bulk-data benchmark runs **outside the default gate** so the pipeline stays fast, and it
  therefore **never contributes to a gate figure** in either direction — it cannot raise one and
  its absence cannot lower one.
- Cross-instance fan-out requires **two instances** and per-viewer state requires **two
  clients**. Neither is provable with one, so a single-instance or single-client run is not
  evidence for the gates that depend on them.

### The environment constraint

No container runtime was available on the machine this record was authored on. The
container-backed integration suite, the two-instance fan-out proof and the clean-clone
verification are therefore **execution-bound to a container-capable environment**. Every
artifact behind them is authored in full — the compose stack, the container test wiring and the
two-instance specification all exist — so this constrains **verification, not delivery**.

The reporting consequence is stated plainly, because it is the point at which an honest ledger
and a flattering one diverge: **a gate whose proof has not been executed is reported as not met.**
It is not reported as met on the strength of the artifact existing, and it is not quietly moved
to the deferred list. It is a gate awaiting its proof, and it counts as zero until the proof
runs and passes.

### A preserved inconsistency in the status vocabulary

Two artifacts of this run describe the manifest's status values differently. The manifest
records a three-value vocabulary in which one value reads as satisfied and only a passing test
may produce it. The regenerator holds a two-member vocabulary instead, distinguishing only
whether a test _cites_ a criterion or no test cites it, and states that a satisfied member is
deliberately absent because the tool reads no test results — it parses documents and comments,
and never runs a test, inspects a report or learns an outcome.

**The inconsistency is recorded and not reconciled.** Neither artifact is a read-only input, so
this is not a catalog defect, and neither is edited from here. What matters for this ledger is
that both readings agree on the point that governs it, and the stricter reading is taken: a
citation is a claim about intent, never a passing proof, so **a cited criterion is not a met
criterion**, and the regenerator alone cannot supply this ledger's area-criteria figure. That
figure comes from the outcome of the suite.

At the moment of authoring, every criterion row reads as not started, so **every figure in this
ledger is currently zero**. That is the correct and expected state of a precondition, and
reporting it as anything else would be the first failure of the discipline this record exists to
impose.

## Companion records

| Record                                               | What it holds that this one deliberately does not                                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [`ac-manifest.md`](ac-manifest.md)                   | All 241 criteria with their target tests and status. Satisfaction is claimed there and nowhere else                                          |
| [`catalog-defects.md`](catalog-defects.md)           | The absence of the named gate authority, the token-path reconciliation, and every other specification defect with its resolution             |
| [`roadmap.md`](roadmap.md)                           | The deferred phases, the exclusions that are not phases, and the follow-ups recorded and not done — the inventory behind the `Deferred` line |
| [`frame-access-log.md`](frame-access-log.md)         | The authoritative count behind the `Frames opened` line, and the justification for every frame opened                                        |
| [`role-matrix.md`](role-matrix.md)                   | The account types, the capability cells and the denial suite behind P1A-2 and S6                                                             |
| [`gap-register.md`](gap-register.md)                 | Every unevidenced behaviour in scope with its marker, options, choice and rationale, behind P1A-1                                            |
| [`responsive.md`](responsive.md)                     | The breakpoints, the per-region behaviour at each, and the definition of operable behind P1A-3                                               |
| [`component-extensions.md`](component-extensions.md) | The extension judgements and the no-merge pairs behind P0-7, C-2 and S5                                                                      |

## Authoring conventions observed by this record

- **This record reports; it does not originate.** Every figure is read from the record that owns
  it, and each is named beside the line it produces.
- **Evidence by citation.** A claim names the record that carries it rather than restating it. A
  second copy of a decision is a second thing to keep true, and the two eventually differ.
- **Families stay disjoint.** No figure in this file is the sum of two families, and the run
  total is the sum of four.
- **Authored prose only.** No third-party product name appears in text, headings, file names or
  link labels; no brand colour value appears; no interface or marketing copy is transcribed; and
  no sample entity name from the corpus is reproduced.
- **Rules by subject and position, never by identifier.** Each platform identifier embeds a
  prohibited product name, and the identifiers are permuted relative to the requirement labels,
  so subject and position are given together.
- **Frames by number.** No filename and no path, because every file in the corpus carries a
  prohibited product name in its name.
- **Zero frames opened** to author this record. Every fact above came from catalog prose and from
  countable catalog content.
- **Tables and prose only — no diagram fences.** The committed site configuration does not render
  them, because the extension that handles fenced blocks consumes them first, and the catalog
  records the same limitation independently.
- **Every line inside every fence is at most 74 characters**, so it survives a narrow rendering
  without reflowing. The one wrapped line is wrapped for that reason alone, and rejoining it
  reproduces the mandated field byte for byte.
- **State only what is shown; record absence as absence; preserve inconsistencies.** The missing
  gate authority is recorded rather than invented, and the divergent status vocabulary is carried
  rather than reconciled.
