# Component extensions: where a structure the catalog implies actually lives

The component inventory that defines every reusable contract in this product is a
**read-only input**. It cannot be amended, extended or annotated in place. That single
fact is the reason this file exists: the inventory is the authority on what a contract
is, and this record is the authority on what happens when a surface needs a structure
the inventory did not hand to it. An extension judgement lands here, or it is lost —
and a judgement that is lost gets re-made, differently, by the next person who meets
the same structure. That is how two implementations of one contract get built.

Eleven structures sit in exactly that position. Each is required by behaviour this
phase must ship. None is cited by any of the four area documents whose contract
citations define the phase's component obligation. So each needs a judgement, and the
judgement is never "leave it out" and never "merge it into whichever contract looks
closest".

| Field                               | Value                                                                                                                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record — the register of component extension judgements                                                                                                                                                 |
| Status                              | Operative. Authored **before** the contract modules it assigns structures to exist                                                                                                                               |
| Countable obligations               | **11** candidate structures resolved · **4** registrations inherited from sibling records · **4** contracts the requirements omit and the catalog requires · **4** no-merge pairs stated                         |
| Why it exists                       | The inventory that defines the contracts is read-only, so an extension cannot be recorded there                                                                                                                  |
| Primary specification source        | `00-product-overview.md` — the catalog's single source of truth for reusable components (L313)                                                                                                                   |
| Corroborating sources               | `README.md` component roll-up (L203), `02-channels.md`, `03-messaging-and-composer.md`, `21-states.md`, `01-onboarding-and-auth.md`                                                                              |
| Frames opened to author this record | **0**                                                                                                                                                                                                            |
| Every module named here lives at    | `packages/ui/src/components/<Contract>/`                                                                                                                                                                         |
| Every consumer imports from         | `packages/ui/src/index.ts`, the package barrel, and nowhere else                                                                                                                                                 |
| Every string comes from             | `packages/shared/src/copy/en.ts`                                                                                                                                                                                 |
| Companion records                   | `docs/decisions/state-matrix.md`, `docs/decisions/role-matrix.md`, `docs/decisions/responsive.md`, `docs/decisions/gap-register.md`, `docs/decisions/keyboard-shortcuts.md`, `docs/decisions/theme-and-color.md` |

**How this record cites.** A document citation names a file under `docs/workflows/`
together with its line number, so a bare `README.md` below always means the catalog
index in that directory and never the one at the repository root. A frame is cited by
its **number alone**. Every filename in the corpus embeds a third-party product name,
and so does the catalog's own percent-encoded citation form, both of which are
prohibited in a committed file — so a bare integer is the only citation form available,
and it is sufficient, because the number is what identifies the frame. **No frame was
opened to author this record.** Every observation attributed to the corpus below was
resolved from catalog prose, which is what the corpus-handling rule asks for and what
the evidence here happened to allow.

**How this record cites the project rules.** By subject and by position in the order
they were provided, never by identifier. Each of the five rule identifiers embeds the
same prohibited product name, so writing one into this file would breach the identity
rule in the act of citing another rule. The rules that govern here are the
**single-implementation rule** (the first as provided) — which is this record's
mandate rather than merely a constraint on it — the **authorization rule** (the
second), the **corpus-handling rule** (the third), the **uncertainty rule** (the
fourth) and the **identity rule** (the fifth). Position alone would be unsafe, because
the identifiers are permuted against the requirement labels they correspond to;
position together with subject is not. This is the convention
`docs/decisions/state-matrix.md` and `docs/decisions/role-matrix.md` already
established.

**How this record names a contract.** In prose, by what it does — the composer
contract, the sidebar contract, the filter-chip contract. In the tables, additionally
by the inventory identifier it carries, in its own column. The prose form is what
makes the record readable; the identifier column is what makes it **checkable**,
because a reader can take any row to the inventory and confirm that the contract this
record claims to extend is the contract the inventory defines. Neither form is
decorative: a register whose rows cannot be traced back to the authority is a list of
opinions.

**How this record describes a rendering.** Structurally and semantically, never as a
value and never as transcribed wording. A _tinted_, _bordered_, _muted_, _filled_ or
_destructive_ treatment names a role that `docs/decisions/theme-and-color.md` resolves
onto a token name. Iconography is named by function — eye glyph, dismiss control,
disclosure caret, add affordance — never by any third-party asset name. No label,
heading or button text is reproduced from any frame: this record specifies the
structure, and the wording that fills it is authored in
`packages/shared/src/copy/en.ts`.

## Why the inventory cannot carry these judgements itself

The inventory says of itself that it is "the catalog's single source of truth for
reusable components", that every identifier cited anywhere in the catalog resolves to
a row in it, and that no other document restates a contract
(`00-product-overview.md` L313). It then does something more useful than assert
completeness: it records how it grew. Seventy-one of its ninety-nine identifiers were
added by area authors who met a recurring structure and defined it centrally rather
than describing it locally, in three waves — and of the structures those waves
reported, sixteen turned out to be **variants of contracts that already existed** and
were folded into those contracts' own rows instead of being given identifiers of their
own (`00-product-overview.md` L313).

That is the same decision this record makes, eleven more times, with one difference
that changes everything about where it can be written down. The area authors could
edit the inventory. This build cannot: the corpus-handling rule makes
`docs/workflows/` read-only, and confines new decision records to `docs/decisions/`.
So the judgement is identical in kind and different in location, and the location is
the whole reason for this file's existence rather than an inconvenience about it.

One consequence deserves stating plainly, because it is the difference between a
register and a wish. Because the inventory cannot be amended, **the inventory will
never mention any variant registered here.** A reader who checks a contract's row
against the modules in `packages/ui` will find the module carrying more than the row
does. That is expected and correct, and this record is the only place the difference is
explained. A reviewer who treats the surplus as drift has read the row without reading
this file.

## The licence to mint an identifier, and the limit on it

The inventory grants the licence itself, in terms that leave no ambiguity: its
ninety-nine identifiers are "a **floor, not a ceiling**", and an author who finds a
further recurring structure "defines it in `00-product-overview.md` and adds
it here" — the closure requirement being that every identifier cited anywhere resolves
to a definition in that one document (`README.md` L207). The clause after the comma is
the part that matters. The licence is to define **centrally**. It is not, and has never
been, a licence to describe a structure locally at the surface that needed it.

This record therefore mints where minting is warranted, and it mints in one place:
`packages/ui`. Two of the eleven judgements below mint a new identifier. Neither is
minted because no name was to hand — both are minted because the contract that looked
nearest turned out, on its own stated terms, not to cover the structure. That is the
only ground on which minting is defensible, and each of the two says so explicitly.

The limit is the mirror image of the no-merge rule and is easy to miss. **Minting a
second identifier for a structure the inventory already owns is as much a defect as
merging two contracts into one.** One structure with two identifiers gets two modules,
two test suites and two divergent renderings — which is precisely the outcome the
single-implementation rule exists to prevent, arrived at from the opposite direction.
Eight of the eleven judgements below are rung-two extensions for exactly this reason:
the inventory already owns the structure, under an identifier contributed by an area
outside this phase, and the honest resolution is to bring that contract into this
phase's module set and add the variant it lacks.

## The ladder, and the rung every judgement must name

Every judgement in this record stops at one of four rungs, and every judgement says
which. Naming the rung is not bookkeeping: the rung **is** the decision, and a
judgement that does not name one has not been made.

| Rung  | Condition                                     | What the resolution does                                                                                                                                                            | Where it is registered                                                                                                                                                                                                                       |
| ----- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Exact contract match                          | Consume the module directly. Nothing is added — the contract already covers the structure, variants and states the surface needs                                                    | Normally nowhere, because there is no extension to record. **Exception:** where the judgement that _stopped_ at rung 1 was a refusal to merge the contract into a neighbour, the refusal is registered here even though no extension follows |
| **2** | The contract exists; the variant does not     | Implement the variant **in the owning module**, and extend that module's co-located test in the same change. Never fork the contract, never re-declare it at the consumer           | Here                                                                                                                                                                                                                                         |
| **3** | No contract covers the structure              | **Mint a new identifier** in `packages/ui`, with its own directory and its own test, and record the evidence or requirement that forced it. Never fold it into an existing contract | Here                                                                                                                                                                                                                                         |
| **4** | Neither prose nor pixels settle the structure | Implement the most defensible option, mark the source with a gap comment naming its decision record, and ship working code — omission is prohibited                                 | Here **and** in `docs/decisions/gap-register.md`                                                                                                                                                                                             |

Three properties of the ladder are worth stating because they are what stop it being
decorative. **You stop at the first viable rung** — a structure that an existing
contract covers is not promoted to a new identifier because a new identifier would be
tidier. **Rung four still ships:** the uncertainty rule is explicit that uncertainty is
never permission to omit functionality, so a structure that neither the catalog's prose
nor the corpus settles is built anyway, with its authored choice recorded rather than
hidden. And **a rung-one stop can still need registering.** Every one of the
thirty-seven contracts this phase implements is a rung-one stop, and none of them
appears in this register — but two of the eleven candidates below stop at rung one
after a contract they resemble was tested and refused, and a refusal that is not
written down is a refusal that gets reversed by the next author who notices the
resemblance.

## The shape of a judgement

The uncertainty rule fixes the shape, and it is a four-field shape: an implemented
choice, recorded with the marker or evidence reference, **the options considered**,
**the choice**, and **the rationale**. Every judgement below carries all four under
those headings, in that order. This is what makes the file a register rather than a
list — a list records outcomes, and a register records outcomes together with the
alternatives that were rejected, which is the only form a later reader can argue with.

The evidence field names catalog prose and frame numbers. Where the catalog carries a
build obligation, a partial-capture note or a gap marker over the structure, the
evidence field says so, because the uncertainty rule treats each of those as an open
work item and never as permission to skip. Where the corpus shows nothing at all, the
evidence field records the absence rather than passing over it, and the judgement
routes the authored part to `docs/decisions/gap-register.md`.

## The no-merge doctrine, and the inventory's own practice of it

The single-implementation rule forbids merging two contracts that look similar, and it
supplies its own worked example: the composer's nine-control formatting toolbar and
the bottom action row's seven controls are distinct components with distinct
groupings, and rendering one in place of the other is a defect.

What is easy to miss is that **the inventory already works this way**, which makes
merging a violation of the document's own method and not only of the rule. Five of its
rows spend their opening sentences saying what the contract is _not_, naming the
sibling it would most plausibly be confused with:

| Contract that draws the line  | What it says it is not                                                                                                                                                    | Where |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Shape-preserving placeholder  | Not the empty state, which says there is nothing to show; and not the progress indicator, which reports progress rather than reserving space                              | L437  |
| Callout card                  | Not the inset guidance panel, which has no leading glyph and no bold in-line label; and not the banner, which belongs to a surface region rather than to a document       | L430  |
| Inset guidance panel          | Not the banner, for the same region-versus-document reason; and not the confirmation dialog, which demands a decision                                                     | L413  |
| Facet filter bar              | Not the filter chip, whose chips compose left to right above a result set and whose full set opens a modal                                                                | L406  |
| Indeterminate progress pill   | Neither the transient pill, which reports an outcome at a trailing corner, nor the banner, which occupies a full-width slot                                               | L383  |
| Inline field-level validation | Not the banner — it explains a rejection in the layout that holds the entry rather than in a region-level slot                                                            | L357  |
| Dropdown and select menu      | Told apart from the context menu by what it anchors to and by whether its labels interpolate the acted-on object's name — explicitly **not** by carrying a nested submenu | L330  |

Read together, those rows are a method: **the risk a contract carries is the contract
it resembles**, so the definition names the resemblance and refuses it. Every judgement
below does the same. Where a candidate could plausibly land on two contracts, the
judgement names both and says which property decides — and the property is always one
the inventory itself states, never a similarity of appearance.

## What makes single implementation mechanical rather than aspirational

A rule that lives only in a document is a rule that is followed until someone is in a
hurry. Three mechanisms make this one hold, and a reader should know all three, because
between them they turn "one contract, one module" from a review comment into a build
failure.

**The barrel is the only entry point.** Consumers import from `packages/ui/src/index.ts`
and from nothing else. The package manifest declares that entry plus exactly four
stylesheet entries and nothing further, so no component module is addressable from
outside the package.

**The compiler cannot resolve a deep path.** `tsconfig.base.json` maps the component
package to its barrel file alone. There is no deep alias, so a deep import does not
merely offend a convention — it fails to resolve. This is the half of the mechanism
that blocks the _possibility_.

**The linter blocks the intent.** `eslint.config.js` carries the boundary as named
rule blocks: barrel-only consumption of every internal package, expressed as a pattern
that admits the four declared stylesheet entries and rejects every other deep
specifier; a prohibition on reaching another workspace by a relative path that climbs
out of the current one; a prohibition on a components directory existing inside an
application at all; and a set of steering rules that send an application away from a
raw select, a raw text area and a raw table toward the contracts that own those
structures. Its own wording carries the principle this record depends on: a control
belongs to the contract that owns it. This is the half of the mechanism that blocks the
_intent_ — including the intent to re-declare a contract locally, which resolves
perfectly well and is exactly what the rule forbids.

Neither half is sufficient alone. The compiler cannot tell a locally written
equivalent from a legitimate new component, and the linter cannot stop a determined
relative path from resolving. Together they leave one way to consume a contract and one
place to implement it, which is the condition this record assumes throughout.

## The eleven candidates at a glance

Every row is resolved. None is deferred for want of a contract, none is merged into a
contract that resembles it, and none is left open. The `Rung` column is the decision;
the paragraphs after the table carry the four fields the uncertainty rule requires.

The column headed `Inventory identifier` is the load-bearing one, and it carries the
finding that shaped this whole record: **every one of the eleven already has a contract
in the inventory.** Each was contributed by an area outside this phase, which is why
none of them is cited by the four documents that define this phase's component
obligation — and why the question for each is not "what shall we call it" but "does the
existing contract's own defining property actually hold for the structure this phase
needs". For six of them it does and the structure needs a variant the contract lacks —
though in one of those six the contract that owns the structure turns out not to be the
one the candidate's name points at. For three, the nearest contract's own stated property
fails on inspection, and each of those three mints an identifier. The last two need
neither a mint nor a variant: their contract covers them exactly as observed, and what
they needed was a refusal to be folded into the contract they resemble.

| #      | Structure                          | Resolution                                                                      | Owning module or new identifier                | Inventory identifier    | Rung  |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- | ----- |
| **1**  | Live remaining counter             | New variant — countdown, trailing-edge, focus-gated                             | `packages/ui/src/components/CharCounter`       | `C-CHAR-COUNTER`        | **2** |
| **2**  | Region skeleton                    | New variant — one shared placeholder, region-shaped per host                    | `packages/ui/src/components/Skeleton`          | `C-SKELETON`            | **2** |
| **3**  | Photo drop zone                    | New variant — image acceptance with an avatar preview, crop hosted elsewhere    | `packages/ui/src/components/DropZone`          | `C-DROP-ZONE`           | **2** |
| **4**  | Audio level meter, while capturing | **New contract** — capture is not playback and is not a passive readout         | `packages/ui/src/components/RecorderPill`      | `C-RECORDER-PILL` (new) | **3** |
| **5**  | Visibility tile-select row         | **New contract** — the observed structure is described options, not tiles       | `packages/ui/src/components/OptionGroup`       | `C-OPTION-GROUP` (new)  | **3** |
| **6**  | Tinted members-only callout card   | New variant — in-modal eligibility notice                                       | `packages/ui/src/components/CalloutCard`       | `C-CALLOUT-CARD`        | **2** |
| **7**  | Bordered administrator-only panel  | **New contract** — this structure _is_ the role-gate enclosure                  | `packages/ui/src/components/RoleGateEnclosure` | `C-ROLE-GATE` (new)     | **3** |
| **8**  | Sidebar accordion                  | New variant — a region the sidebar contract already claims, made independent    | `packages/ui/src/components/Sidebar`           | `C-SIDEBAR`             | **2** |
| **9**  | Progress indicator                 | New variant — in-container placement, plus a determinate readout                | `packages/ui/src/components/ProgressIndicator` | `C-PROGRESS-INDICATOR`  | **2** |
| **10** | Segmented control                  | New contract module — its own identifier, **never** merged into the tab bar     | `packages/ui/src/components/SegmentedControl`  | `C-SEGMENTED-CONTROL`   | **1** |
| **11** | Faceted filter bar                 | New contract module — its own identifier, **never** absorbed by the filter chip | `packages/ui/src/components/FacetFilterBar`    | `C-FACET-FILTER-BAR`    | **1** |

Three of the eleven mint an identifier, six extend one, and two need neither. Rows 4, 5
and 7 are the mints, and each states in its own judgement which stated property of the
nearest contract fails — because "it felt different" is not a ground for minting, and a
mint made on that ground is the same defect as a merge. Rows 10 and 11 are the rung-one
refusals: their contracts cover them exactly as the inventory records, so nothing is
added, and what is registered is the boundary against the contract each most resembles.

Rows 10 and 11 carry one further property that the table cannot express and the
judgements state explicitly: **their evidenced host surfaces belong to deferred areas**,
so the judgement closes the ownership question now while the module lands with the
surface that renders it. That is not a deferral for want of a contract — which the
uncertainty rule prohibits — it is the same phasing that puts thirty-seven of the
inventory's ninety-nine contracts in this phase and the rest in later ones. The
distinction matters, and the agreement obligation below carries a
`Module in this phase` column precisely so that a missing module can be told from a
defect.

## 1. The live remaining counter

**Evidence.** The channel-name field carries a character readout, and the catalog is
unusually precise about it: **the counter counts down, not up.** Against an empty field
it reads exactly eighty; against a filled one it reads a smaller number; and it renders
**only while the field has focus**, disappearing when focus leaves
(`02-channels.md` L291, frames 69, 97, 98). It is right-aligned in the dialog that hosts
it (`02-channels.md` L188, L282), it appears on two different surfaces — the creation
wizard's name step and the rename dialog — and it is an acceptance criterion in its own
right (`02-channels.md` L982, L908). The helper copy beside it states the rule the
count enforces: lower case, no spaces or periods, no more than eighty characters.

The inventory already owns a bounded-input readout: the live character counter,
contributed by the help-and-community area, is "a small readout of **current over
maximum** placed at the leading edge immediately beneath the input it governs", observed
on a public feedback field, with no at-limit, over-limit or warning rendering captured
anywhere and a gap marker over each (`00-product-overview.md` L432, frames 950, 951).

So the phase's structure differs from the evidenced contract on three axes and agrees
with it on purpose: direction of count, edge it sits on, and whether it is always
visible or focus-gated.

**Options considered.**

1. A variant of the inline field-level validation contract. The counter sits beneath or
   beside a field, becomes interesting as a limit approaches, and concerns the validity
   of what has been typed — so the resemblance is real.
2. A freshly minted identifier, on the ground that a live affordance is not an error
   presentation and deserves its own contract.
3. A new variant of the existing character-counter contract, adding the countdown
   direction, the trailing-edge placement and the focus gate.

**Choice.** Option 3. Rung **2**. The structure lands in
`packages/ui/src/components/CharCounter`, whose co-located test is extended in the same
change to cover the countdown direction, the focus gate and the boundary readings —
the full bound against an empty field, and a decreasing value as characters arrive.

**Rationale.** Option 1 is refused on the property the validation contract itself
states: it exists to explain **why an entry was rejected**, in the layout that holds the
entry (`00-product-overview.md` L357). The counter explains nothing and rejects nothing.
It is a live affordance that is at its most useful while the entry is still _valid_, and
the corpus never shows it in a destructive treatment or carrying a message. Folding a
neutral readout into the contract whose whole subject is rejection would merge two
contracts that differ in purpose, which the single-implementation rule forbids and which
would also corrupt the validation contract's own state set — a field with fifty
characters remaining is not a field in an invalid state.

Option 2 reaches the right conclusion — this is its own contract, not a validation
variant — and then overshoots. The inventory has **already** drawn that conclusion by
giving the structure an identifier of its own, and minting a second identifier for a
structure the inventory already owns produces two modules for one contract. That is the
no-merge defect inverted, and it is no less a defect for being well-intentioned. The
right way to honour the "it is its own contract" argument is to adopt the contract that
already exists rather than to invent a rival to it.

Option 3 also puts the three differences where they belong: as variants of one contract
rather than as two contracts. A counter that counts up to a maximum and a counter that
counts down to zero are the same structure reading the same two numbers in opposite
directions, and the inventory's own row concedes that its at-limit and over-limit
renderings were never captured — so the contract was always going to need extending,
whichever direction it counted in. The bound itself is not a rendering concern: it is
enforced server-side regardless of what the readout shows, which the inventory states
and `docs/decisions/security-contracts.md` carries.

## 2. The region skeleton

**Evidence.** Loading has exactly four observed shapes — an in-place control, a per-row
status, a block placeholder and a region skeleton — and the catalog is blunt that they
are not interchangeable and that a build implementing one of them cannot reproduce the
other three (`21-states.md` L215). The region skeleton replaces a region's rows with
shape-preserving placeholders while preserving the region's footprint **and the real
content of every adjacent region** (`21-states.md` L222, frame 911). The inventory's
matching contract describes the same thing from the component side — neutral rounded
bars and discs standing in for the real elements at their real positions, a circular
placeholder where an avatar will be — and says outright what it is not: not the empty
state, which asserts there is nothing to show, and not the progress indicator, which
reports progress rather than reserving space (`00-product-overview.md` L437).

`docs/decisions/state-matrix.md` fixes what the shape renders and explicitly leaves the
ownership question here: that record settles the rendering, this one settles what owns
it.

**Options considered.**

1. A loading state on each region-owning contract — the sidebar renders its own
   skeleton, the message list renders its own, the details pane renders its own.
2. A new variant of the existing shape-preserving-placeholder contract: one module,
   composed by each region to match its own footprint.
3. A freshly minted identifier for a region-scoped loading primitive.

**Choice.** Option 2. Rung **2**. The structure lands in
`packages/ui/src/components/Skeleton`, and its co-located test is extended in the same
change to cover a region composition per Phase-1 host and the invariant that a skeleton
occupies exactly the footprint its real content will occupy.

**Rationale.** Option 1 is the tempting one and it is the violation. Three regions each
rendering "neutral rounded bars and discs at the real positions" is **one structure
implemented three times** — precisely what the single-implementation rule prohibits,
and precisely the drift the rule anticipates, because three implementations will not
stay identical past the first change to a corner radius or a shimmer. The rule's clause
about not declaring a local equivalent "even when only one variant is needed" is aimed
at exactly this case, where each region's need looks small enough to satisfy in place.

Option 3 fails on the same ground as the previous judgement: the inventory already owns
the structure, so a mint would be a second identifier for one contract.

Option 2 also preserves the property that makes the shape distinct from the other three
loading shapes and from the empty state. Because one module owns it, the
region-scoping invariant — that a skeleton is scoped to the region being repainted while
its siblings keep their real content — is asserted in one test rather than hoped for in
three. And because the module is not the empty-state contract, the distinction the
inventory draws survives contact with a surface that is briefly empty _and_ briefly
loading, which is the case where a merged implementation would have to pick one meaning
and be wrong half the time.

## 3. The photo drop zone

**Evidence.** The profile-photo path is a three-part structure. The wizard's own step
carries an explicitly optional block — a label marking the photo optional, a helper
line, a placeholder avatar and a secondary upload action — and that block never gates
the step's forward action (`01-onboarding-and-auth.md` L145, L146, frames 11, 12). The
action opens a two-stage dialog over the dimmed wizard: an upload stage whose body is a
grey image placeholder with a centred progress indicator and whose footer offers a
single cancel, then a crop stage that letterboxes the source under a dashed square crop
frame with four corner handles and previews the result **in the shape it will actually
be used**, as an avatar inside a message row (`01-onboarding-and-auth.md` L164, L178,
L179, L610, frames 20, 21). Saving returns to the step with the cropped photo in place
of the placeholder and the secondary action relabelled (frame 22).

What the corpus does **not** show on this path is a drop region: no dashed border, no
centred instruction line, no browse link, and no drag-over rendering. The inventory's
file-acceptance contract does show all of those, on a console support-request reply
contributed by the help-and-community area — a dashed-border region beneath an
explicitly optional label, holding a centred instruction line whose second half is an
underlined browse link — and records that no drag-over, attached, uploading, rejected or
over-size rendering was captured, with a gap marker over each
(`00-product-overview.md` L438, frame 713).

**Options considered.**

1. Mint a photo-specific drop zone, distinct from the file-acceptance contract.
2. Fold the crop stage into the drop zone, so one module accepts, previews and crops.
3. A new image variant of the existing file-acceptance contract, with the crop stage
   left where the corpus puts it — inside the modal shell, as a second stage.

**Choice.** Option 3. Rung **2**, with the drag affordance and the drag-over rendering
recorded as authored in `docs/decisions/gap-register.md` because the corpus evidences
neither on this path. The structure lands in `packages/ui/src/components/DropZone`,
whose test is extended in the same change to cover the image variant, the avatar
preview and the hand-off of an accepted file.

**Rationale.** Option 1 would give one function — accept a file by drag or by chooser —
two contracts, and the two would diverge on validation messaging, on the drag-over
treatment and on keyboard reachability. The inventory's own growth record shows the
opposite instinct being applied sixteen times: a reported structure that proves to be a
variant is folded into the existing row rather than given an identifier
(`00-product-overview.md` L313). A photo is a file with a type constraint and a preview,
which is a variant's worth of difference.

Option 2 is refused because the corpus renders the crop as a **separate dialog stage**
with its own title, its own navigation and no dismiss control, and because cropping is
a different task from acceptance: it edits a file already accepted. Folding it in would
merge the modal-shell contract's two-stage form into a primitive, and would leave the
drop zone owning a task it does not perform on any other surface. The two-stage dialog is
the modal shell's; the acceptance region is the drop zone's; the preview tile that shows
the result inside a message row is the avatar contract's.

The upload path's own obligations are **not** restated here, and deliberately so: the
pre-signed transfer, the server-side type and size validation, and the rule that file
bytes never transit the interface are settled in
`docs/decisions/security-contracts.md`. This record fixes which module renders the
acceptance region. What that region is permitted to accept is not a rendering decision
and is never enforced by the component — the inventory says as much of its own file
contract, and the authorization rule says it of every mutation.

## 4. The audio level meter, while capturing

**Evidence.** The composer's audio-clip control starts an in-place recorder rendered as
a rounded pill floating over the composer's input area. The pill carries a live waveform
whose bars are uniform apart from one distinctly taller bar standing roughly three-fifths
of the way along it, an elapsed-time readout at the waveform's right, and **its own
dismiss control at its top-right, separate from the confirm control**
(`03-messaging-and-composer.md` L250, L684, frame 200). The confirm control is not the
pill's: it replaces the audio-clip control **in place** in the composer's bottom action
row (`03-messaging-and-composer.md` L624). While the pill is live, the composer's own
toolbar and placeholder and the nearest message row render dimmed, while the rail,
sidebar and top bar stay at full contrast — which is why the catalog reads the recorder
as modal with respect to the composer rather than to the page
(`03-messaging-and-composer.md` L256). Confirming **replaces** the pill with a player
card inside the same input area: a filled circular play control at the left, a waveform,
and a duration readout at the right (`03-messaging-and-composer.md` L251, frame 201).
A partial-capture note records that no frame shows the clip sent, and none shows the
cancel control being used (`03-messaging-and-composer.md` L254).

Two existing contracts are adjacent. The audio and video player contract already carries
an in-composer audio-clip variant with exactly the play control, waveform and duration
readout the confirmed state renders (`00-product-overview.md` L345). And the read-only
level meter contract, contributed by the preferences area, reports a live measured level
so a user can confirm a device is working — **read-only, with no control of its own** —
rendered as fifteen equal segments filling from the leading edge
(`00-product-overview.md` L379, frames 561, 562).

**Options considered.**

1. A new variant of the audio and video player contract, on the ground that both render
   a waveform inside the composer.
2. A new variant of the read-only level meter contract, on the ground that both display
   a live input level.
3. Mint a contract for the in-place capture pill.

**Choice.** Option 3. Rung **3**. A new identifier, `C-RECORDER-PILL`, lands as
`packages/ui/src/components/RecorderPill` with its own component file, stylesheet,
co-located test, types file and index, and is exported from the barrel. The cancel
outcome is the pill's own; the confirm outcome belongs to the composer action row, which
is a separate module and stays one.

**Rationale.** Option 1 is refused because playback and capture are different
behaviours wearing a similar glyph. A player transports a stored clip and can seek
within it; a capture pill displays a signal that does not yet exist in full and cannot
be seeked at all. The corpus makes the distinction structural rather than arguable: the
two renderings are **successive and mutually exclusive** in the same region, the pill
being replaced by the card at the moment of confirmation. A merged module would have to
carry a transport that is meaningless during capture and a level display that is
meaningless during playback, and every consumer would then have to know which half is
live — which is the definition of a contract that has been merged with another.

Option 2 is refused on the level-meter contract's own stated defining property: it is
read-only **with no control of its own**. The pill carries a dismiss control, so the
property fails on the first clause. The rendering differs too — fifteen discrete
segments reporting an instantaneous level, against a waveform whose bars accumulate over
the elapsed recording — and those are different measurements, not two styles of one.
Adopting the meter would also drag a preferences-area contract into a composer surface
and leave the meter owning a cancel affordance it never renders anywhere else.

So the mint is warranted on the only ground that warrants a mint: both nearest contracts
were tested against their own stated properties and both failed. The level meter keeps
its contract, unmerged, for the device-confirmation surface that evidences it; the player
keeps its in-composer variant for the confirmed clip; and the pill owns capture. The
taller waveform bar is a position marker rather than a level reading, and is registered
as part of the pill's rendering with its evidence in the acceptance criterion that names
it (`03-messaging-and-composer.md` L763).

## 5. The visibility tile-select row

**Evidence.** The creation wizard's second step heads a **two-option radio group** with
a visibility label. Each option states its scope **inline on its own label line, after an
em dash**, and a further indented sub-label renders beneath the private option only — so
the private option stands two lines tall and the public option one. The step arrives with
**public pre-selected**, and the modal's own sub-line glyph switches between a hash and a
lock as the selection moves, previewing the consequence of the choice before it is
committed (`02-channels.md` L154, L155, L933, L984, frames 60, 61).

The same described-option structure recurs twice more in the same area. The add-people
modal offers a radio pair — add every member of the workspace, pre-selected, or add
specific people — which reveals a text input beneath itself when the second option is
taken (`02-channels.md` L191, L192, L986, frames 72, 73). And the channel-permissions
dialog heads a radio pair whose two options each carry a description of what they grant
and withhold (`02-channels.md` L160, frame 66). Three instances in one area is
recurrence, which is the inventory's own trigger for defining a structure centrally
rather than describing it locally (`README.md` L207).

The inventory's nearest contract is the single-select tile row, contributed by the
preferences area. Its stated defining property is specific: a row of equal **square
tiles** whose options are themselves visual, in which selection and hover are
distinguishable at the same moment — and the row says outright that the simultaneous
distinguishability "is what makes this a component rather than a styling of a radio
group" (`00-product-overview.md` L381, frames 557–559).

**Options considered.**

1. A new variant of the single-select tile row contract.
2. A new variant of the segmented single-select control contract, whose vertical form
   stacks options as label-and-paragraph blocks.
3. Mint a contract for a described-option single-select group.

**Choice.** Option 3. Rung **3**. A new identifier, `C-OPTION-GROUP`, lands as
`packages/ui/src/components/OptionGroup` with the full module shape and a barrel export.
Its first three consumers are the three instances above, and its co-located test covers
the pre-selected default, the per-option scope line, the conditional sub-line beneath one
option only, and the reveal of a dependent control beneath a chosen option.

**Rationale.** Option 1 fails on the tile contract's own defining property, and it fails
in the most instructive way available: the contract explicitly distinguishes itself
**from a styled radio group**, and the observed visibility structure **is** a radio
group. Adopting the tile contract would merge the two structures the tile row's own
definition separates, and would import a hover-and-selection-simultaneously requirement
that has no meaning for a two-line text option. The candidate's own name is what invited
the error; the evidence does not support the name, and this record follows the evidence.

Option 2 fails on the segmented control's stated form. Its vertical labelled-block
variant requires the selected block to render inside a bordered or filled card, with its
siblings as plain rows, **paired with a companion region whose content is exchanged with
the selection** (`00-product-overview.md` L378, frames 798, 799). The wizard step has no
companion region, no card and no exchange — its consequence preview is a glyph on the
modal's sub-line, which belongs to the modal rather than to the control. Two of the
three properties fail, so the fit is superficial.

Option 3 is therefore the first viable rung, and the recurrence makes it the right one
rather than merely the available one: a structure that appears three times in one area
under three different bodies of copy is exactly what the inventory means by a recurring
structure deserving central definition. The invariant that public visibility arrives
pre-selected is a **rule** rather than a rendering, and belongs to the shared
compile-time configuration where the uncertainty rule puts invariants; the module reads
which option is pre-selected from its input and hard-codes no default of its own.

## 6. The tinted members-only callout card

**Evidence.** The add-people modal opened straight after a channel is created stacks
three things in its body, in order: a **tinted notice restricting additions to people
already in this workspace**, then the add-all-or-specific radio pair, then a bordered
group holding a single toggle (`02-channels.md` L191, L684, frame 72). The restriction is
recorded as an observed rule of the area and as an acceptance criterion in its own right
(`02-channels.md` L913, L986). The corpus does **not** record a leading glyph or a bold
in-line label on this particular notice, and that absence is carried here as an absence
rather than filled in.

The inventory's callout-card contract lifts "a note, a caution or an **eligibility
statement**" out of a document's body without leaving its flow, as a bordered card on a
tint with a circular glyph at the leading edge and a body opening with a bold label run
into the first sentence. It carries three observed forms, and the third is the
instructive one: an eligibility form whose body states which roles may create a
capability and which plan tiers carry it (`00-product-overview.md` L430, frames 710, 946,
947). The row also says what it is not — not the inset guidance panel, which has no
leading glyph and no bold in-line label, and not the banner, which belongs to a surface
region rather than to a document. Separately, `21-states.md` L93 records an **advisory
callout** as a state-bearing structure: inside a page or dialog body, above the controls
it concerns, indented to the body's own column, carrying a glyph, a leading vertical
accent rule, a bold lead line and a body sentence.

**Options considered.**

1. A new variant of the banner contract, since the notice is a short tinted statement
   above the controls it concerns.
2. Treat the notice as part of the role-gate presentation, since what it states is who
   may be added.
3. A new variant of the callout-card contract's eligibility form, sited in a modal body.

**Choice.** Option 3. Rung **2**. The structure lands in
`packages/ui/src/components/CalloutCard` as an in-modal notice variant, and that
module's co-located test is extended in the same change to cover the variant rendering
**without** a leading glyph and without a bold in-line label, because that is what the
corpus shows on this instance and inventing either would be reproducing a rendering the
evidence does not support.

**Rationale.** Option 1 is refused on the distinction the inventory draws twice and
`21-states.md` draws a third time: a banner belongs to a **region of a surface** — the
sidebar's banner slot, a page-level band — while a callout belongs to the **flow of a
body**, indented to that body's own column. The notice here sits inside a modal body,
above the controls it qualifies, and moves with them; it is not docked to a region and it
is not dismissible. Merging it into the banner contract would put a body-flow structure
into a contract whose placement is a region slot, and would give the banner contract a
placement it has nowhere else.

Option 2 is refused because a callout and a role gate say different kinds of thing. **A
callout is informational; a role gate is a capability statement about the viewer.** The
notice states a property of the operation — additions are limited to people already in
this workspace, which is true for every viewer regardless of role — whereas the role gate
states which role can act on the control it encloses. They are also composed
differently: the notice qualifies the whole body and precedes the controls, while the
gate wraps a single control. Judgement 7 keeps them apart deliberately, and this one is
the other half of that separation.

Option 3 fits because the eligibility form already in the contract is doing the same
work: lifting a statement about who may do what out of the body without leaving its flow.
The variant's only genuine novelty is its host — a modal body rather than a document —
and a host is a variant's worth of difference, not a contract's. The wording itself is
authored in `packages/shared/src/copy/en.ts`; this record specifies that a tinted,
body-flow notice precedes the controls it qualifies, and nothing about what it says.

## 7. The bordered administrator-only guidance panel

**Evidence.** Two Phase-1 documents describe this structure, and they are describing the
same thing from two directions. The channels area reads it as part of the add-people
modal: "a bordered group whose legend carries an **eye glyph** and states that only
admins can see this setting, containing a toggle rendered on"
(`02-channels.md` L191, frame 72); the same group is summarised as "an admin-only
bordered group holding a single toggle" (`02-channels.md` L684); and in the following
capture the toggle is **rendered off** (`02-channels.md` L192, frame 73). The states
document reads it as a state-bearing structure and gives it a name: the **role-gate
enclosure**, sited around the gated control inside the form that hosts it, sized to the
control's width plus a border, with the caption inset into the border's top edge — "a
bordered container whose inset caption, led by an **eye-with-slash glyph**, states which
role can see the setting, wrapped around an ordinary control that is **neither hidden nor
disabled**" (`21-states.md` L98, frame 75).

Two divergences are carried rather than reconciled, because reconciling either would
mean asserting something the catalog does not. The glyph is described as an eye in one
document and an eye-with-slash in the other. And the enclosed toggle is observed **on**
in one capture and **off** in the next, so the enclosure's rendering plainly does not
depend on the control's value. This record states both readings and asserts neither; the
module renders the caption glyph from a single authored asset named by function, and the
enclosure's own rendering is invariant under the enclosed control's state.

The inventory's nearest contract is the inset guidance panel: a **tinted** inset panel,
optionally carrying an accent rule along one edge, holding a bold lead and a list or a
paragraph — and it says it is not the banner and not the confirmation dialog
(`00-product-overview.md` L413, frames 779, 789, 858, 870). Every observed form of it is
prose.

**Options considered.**

1. A new variant of the inset guidance panel contract, since both are inset containers
   carrying a short lead and both interrupt a form.
2. No component of its own: role gating is a presentation concern that each hosting
   surface expresses where it needs it.
3. Mint a contract for the role-gate enclosure, and treat the "administrator-only
   guidance panel" as the same structure read a second time.

**Choice.** Option 3. Rung **3**. A new identifier, `C-ROLE-GATE`, lands as
`packages/ui/src/components/RoleGateEnclosure` with the full module shape and a barrel
export. Its co-located test covers the caption naming a role, the invariance of the
enclosure under the enclosed control's state, and the property that the enclosed control
is **neither hidden nor disabled**.

**Rationale.** The candidate and the role-gate enclosure are **one structure, not two.**
They are described in two documents because the same frame family is read once as part of
a modal's composition and once as an expression of state; the composition is identical in
both readings — a bordered container, an inset caption led by an eye glyph, a role named,
an ordinary control inside. Registering them separately would produce two modules for one
structure, which is the mint-side defect this record warns about above. So the panel is
not a _sibling_ of the role-gate enclosure. It **is** the role-gate enclosure, and the
"guidance panel" reading is a resemblance rather than an identity.

Option 1 fails on two of the guidance panel's stated properties. That contract is
**tinted** and this structure is **bordered**; that contract holds a bold lead and prose,
and this one holds a **live control**. The second failure is the decisive one: a contract
whose every observed body is a paragraph or a list would acquire, on adoption, the
obligation to enclose and lay out an interactive control, and the two would then have to
share a focus model, a caption placement and a disabled-state story that only one of them
has any use for. That is a merge.

Option 2 fails on the single-implementation rule directly. "No component" means every
surface that gates a control renders the enclosure itself, and the authorization test
suite then has as many presentations of the same capability statement as there are
surfaces. It also fails on the rule's own clause about a local equivalent being
prohibited even when only one variant is needed.

**Presentation is not enforcement, and this module enforces nothing.** The authorization
rule is explicit that client rendering is never evidence of permission, so the enclosure
is a statement to the viewer and never a control on the operation: the server checks the
acting session against the specific target object whether or not this container was ever
rendered. The enclosure's own evidenced discipline reinforces the point — it **hides
nothing and disables nothing**, leaving the control ordinary and operable-looking, which
is only safe because the check does not live here. Which roles the caption may name, and
which operations they may actually perform, are settled in
`docs/decisions/role-matrix.md`; this record settles only that one module renders the
statement.

## 8. The sidebar accordion

**Evidence.** The sidebar contract's own row already claims the structure twice over.
Among its regions it lists, in order, the workspace switcher and header controls, a
banner slot, flat item rows, **collapsible groups each with an add affordance**, a footer
item slot, and a selection bar in multi-select mode; and among its states it lists a
"group collapsed and expanded via a disclosure caret" (`00-product-overview.md` L320,
frames 39, 113, 117, 119, 120, 300, 340, 400, 450). The shell specification lists the
same collapsible groups among the sidebar region's contents
(`00-product-overview.md` L294–L300).

The inventory separately carries a disclosure-accordion contract, contributed by the
pricing and help areas, whose stated discipline is the opposite of a sidebar's:
**exactly one row expanded at a time in every capture**, its chevron inverted while its
siblings' stay plain, over question-and-answer or topic-and-detail pairs
(`00-product-overview.md` L412, frames 708, 766, 767, 962, 976, 977).

**Options considered.**

1. Fold the sidebar's groups into the disclosure-accordion contract, since both collapse
   a labelled section behind a caret.
2. Extract a standalone disclosure primitive that both the sidebar and the accordion
   compose.
3. A new variant of the sidebar contract: the collapsible group is a region that contract
   already claims, and what this phase adds is the independence of each group's state.

**Choice.** Option 3. Rung **2**. The structure stays inside
`packages/ui/src/components/Sidebar`, and that module's co-located test is extended in
the same change to cover several groups expanded at once, each collapsing independently,
each carrying its own add affordance, and a collapsed group preserving its unread
indication.

**Rationale.** Option 1 is refused on the accordion's own observed invariant. A contract
whose every capture shows exactly one row expanded cannot absorb a structure in which
channels, direct messages and apps are routinely expanded together — adopting it would
require abandoning the invariant the accordion's row states, which is the same as
deleting the distinction between the two contracts. The inventory's method is to name the
resemblance and refuse it; this is that case.

Option 2 is the plausible-looking one and it is refused on the argument the sidebar
contract's own regions make. The groups are not a widget the sidebar happens to contain;
they are one of six **regions** the contract enumerates, ordered against the others, each
carrying an add affordance that belongs to the sidebar's own composition. Extracting them
would split one contract across two modules and leave the sidebar unable to satisfy its
own row without composing something else — and the extracted primitive would then need to
serve two contracts whose expansion disciplines contradict each other. A shared primitive
whose two consumers need opposite behaviour is a merge wearing an abstraction.

Option 3 is the honest reading, and it is worth being precise about what it adds, because
the answer is not "nothing". The contract's observed **variants** are enumerated by
composition — minimal, full, with user-created sections, two destination-scoped forms,
multi-select — and its observed **states** include a group collapsed and expanded. What
neither list states is that group states are **independent and simultaneous**, because a
single capture cannot show it. That independence is what this phase implements and what
this row registers, with its test, inside the module that already owns the region.

## 9. The progress indicator

**Evidence.** Two Phase-1 surfaces need one. The photo-upload stage renders a grey image
placeholder with a **centred progress indicator** while the transfer runs, with a single
cancel in the footer (`01-onboarding-and-auth.md` L178, frame 20). And the setup wizard's
plan step replaces the chosen card's action **in place** with a progress indicator on a
muted background while the sibling card's action renders muted at the same moment — the
only two regions that change between the two captures
(`00-product-overview.md` L358, frames 17, 18); `21-states.md` records the same pair as
the busy-sibling rule.

The inventory's contract is named for what it observed: an **indeterminate** progress
pill — a hatched, accent-filled pill centred at the top of the content region carrying a
sentence and **no percentage** — and it says it is neither the transient outcome pill,
which reports an outcome at a trailing corner, nor the banner, which occupies a
full-width slot (`00-product-overview.md` L383, frame 164). The skeleton contract's own
row draws the other boundary from the other side: a skeleton is not the progress
indicator, "which reports progress rather than reserving space"
(`00-product-overview.md` L437).

**Options considered.**

1. Treat progress as a fifth loading shape and fold it into the loading vocabulary the
   state record fixes.
2. Treat the in-place variant as a state of each host — the plan card renders its own,
   the upload dialog renders its own.
3. A new variant of the progress-indicator contract: an in-container placement, plus a
   determinate readout for a bounded transfer.

**Choice.** Option 3. Rung **2**, with the determinate readout recorded as authored in
`docs/decisions/gap-register.md` because no capture anywhere shows a determinate value.
The structure lands in `packages/ui/src/components/ProgressIndicator`, and its
co-located test is extended in the same change to cover the region-level pill, the
in-container placement, and a determinate value rendering with its bounds.

**Rationale.** Option 1 is refused on the axis that separates the two families, and the
separation is worth stating explicitly because it is the reason this candidate exists at
all. **The four loading shapes are indeterminate; a progress indicator reports
advancement toward a known end.** The four shapes each answer "this content is not here
yet" by replacing something while preserving its footprint — a control's label, a row's
status word, a block's content, a region's rows — and the state record fixes them at
four, on the catalog's own statement that they are not interchangeable. Progress answers
a different question: "how far along is this". Folding it in would make a five-member
family whose fifth member preserves no footprint and replaces no content, and would put a
determinate value into a vocabulary that has no place for one.

Option 2 is refused for the reason option 1 of the region skeleton was: the same
structure implemented at two hosts is two implementations of one contract, and the
single-implementation rule prohibits the second even when only one variant is needed
there.

Option 3 carries one tension that this record preserves rather than resolves. The
contract's inventory **name** embeds the word indeterminate, while this phase needs a
determinate readout for a bounded transfer. That is not a contradiction in the catalog:
the catalog recorded what it observed, and it observed no determinate form. It is an
absence, which the uncertainty rule says must be implemented as a deliberate choice
rather than skipped — so the determinate variant ships, its authored default is recorded
in the gap register, and the contract keeps the name the read-only inventory gave it,
because correcting the specification in place is prohibited. A reader who finds a
determinate variant under an indeterminate name should read this paragraph rather than
assume drift.

## 10. The segmented control

**Evidence.** The colour-mode preference is evidenced as a **three-option segmented
control** together with a system colour mode (`README.md` L342), and
`docs/decisions/theme-and-color.md` settles what the three positions mean: two select a
theme outright and the third follows the platform preference, resolving to one of the
same two bindings, so the third is a selection position rather than a third theme. That
record also settles the phasing — the surface that sets the preference belongs to a
deferred area, so in this phase the selection is shell state written to a single root
attribute.

The inventory's contract chooses "one of a small set of mutually exclusive options with
every option visible at once", observed as three equal-width buttons in one row and, in a
second form, as a vertical column of labelled blocks paired with a companion region whose
content is exchanged with the selection (`00-product-overview.md` L378, frames 537, 798,
799). The tab-bar contract switches "between peer views of one subject without leaving the
surface", as a horizontal row of labels beneath the surface title, with optional per-tab
counts and an active mark that is itself a variant (`00-product-overview.md` L332).

**Options considered.**

1. A new variant of the tab-bar contract, since both are horizontal rows of mutually
   exclusive labelled positions with one marked.
2. Mint a mode-switch contract for the theme selection specifically.
3. Its own contract — the one the inventory already gives it — kept off the tab bar, with
   its module landing alongside the surface that renders it.

**Choice.** Option 3. Rung **1**: the contract covers the structure exactly as the
inventory records it, and this phase adds no variant to it — so what closes here is an
**ownership and boundary** judgement rather than an extension, and it is registered
precisely because a rung-one stop reached by refusing a merge is a decision that
otherwise leaves no trace. The module
`packages/ui/src/components/SegmentedControl` lands with the deferred surface that
renders it. This row is marked accordingly in the agreement obligation below, so that its
absent module reads as phasing rather than as a defect.

**Rationale.** Option 1 is the merge this row exists to prevent, and the distinction is
functional rather than visual. **A segmented control switches a mode or filters within
one surface; a tab bar switches which surface — which peer view of the subject — is
shown, and can carry a per-tab count.** The consequences are concrete: a tab bar's
positions are navigable destinations that the router and the browser's history know
about, while a segmented control's positions are a value; a tab bar's count is part of its
contract, and a count on a mode switch would be meaningless. Merging them would give one
module two accessibility models — a tab list with tab panels, against a radio group — and
whichever it chose would be wrong for half its consumers.

Option 2 is refused because the inventory already owns the structure, so a mint would be
a second identifier for one contract.

Option 3 needs its phasing stated honestly rather than glossed, because "resolved" and
"rendered in this phase" are different claims. Nothing in this phase renders a segmented
control: the theme selection is shell state with no evidenced setting surface, and every
other Phase-1 mode switch resolves to a different contract. The uncertainty rule
prohibits deferring a mechanism **for want of a contract**, and nothing is deferred on
that ground here — the contract is settled, the module path is settled, and the
no-merge boundary against the tab bar is settled and enforceable now. What waits is the
surface. This is the same phasing that puts thirty-seven of ninety-nine contracts in this
phase, and it is recorded rather than assumed so that the next author extends this module
instead of declaring a local switch beside the preference they are building.

## 11. The faceted filter bar

**The prohibition first, because it is the point of the row: the faceted filter bar must
not be collapsed into the filter-chip contract, and the filter-chip contract must not be
widened until it becomes one.** The inventory states the separation itself, in the facet
bar's own opening sentence.

**Evidence.** The facet-bar contract narrows an index by several independent dimensions
at once, "each dimension a **select** rather than a chip", and then says outright: "**It
is not** the filter chip, whose chips compose left to right above a result set and whose
full set opens a modal; here the dimensions are **fixed, labelled and always visible**,
and each opens its own anchored panel." Its form is a bordered bar carrying a leading
label, one select per dimension, and an optional trailing clear-all link or result count;
it applies live with no submit control (`00-product-overview.md` L406, frames 837, 850,
853, 854, 1006–1009).

The filter-chip contract narrows a result set by one dimension per chip, composed left to
right in a single row above the results, with a catch-all control opening the full filter
set — and its own observed variants include the row being accompanied at its right by a
sort control (`00-product-overview.md` L333).

The one Phase-1 surface that filters an index resolves to the **chip** contract, on the
catalog's own citation rather than on inspection: the conversation browser's filter row is
three chip menus left-aligned with a sort control right-aligned, the chips render filled
and emphasised once set, the sort control stays neutral, and a clear action appears at
the search field's right edge once a filter moves off its default
(`02-channels.md` L415–L422, L701, L724, frames 126–133). `docs/decisions/responsive.md`
reads the same row the same way. Separately, `docs/decisions/role-matrix.md` treats the
browser and its filter dimensions as **search paths** governed by the read-authorization
contract, and records that they are not an additional projection of their own — which is
about who may see a result, not about which chrome renders the dimensions.

**Options considered.**

1. Collapse the facet bar into the filter-chip contract, since both narrow a result set
   by independent dimensions and both apply live.
2. Build the browser's row as a facet bar, on the ground that its three dimensions are
   fixed, labelled and always visible.
3. Keep both contracts, each with its own identifier and module: the chip contract
   renders the browser's row because the catalog cites it there, and the facet bar keeps
   its own module for the structured index surfaces that evidence it.

**Choice.** Option 3. Rung **1**: the contract covers the structure exactly as the
inventory records it and this phase adds no variant to it, so what closes here is the
**boundary** — registered because a refusal that is not written down is a refusal that
gets reversed. The module `packages/ui/src/components/FacetFilterBar` lands with the
surface that renders it, marked as such in the agreement obligation below.

**Rationale.** Option 1 is prohibited and the reason is structural, not stylistic.
**Chips are removable tokens over a selection; facets are a structured query surface over
dimensions.** A chip is composed — added, filled when set, cleared — and its row grows
and shrinks with what the viewer has chosen; the dimensions a chip row can express are
whatever chips are present. A facet bar's dimensions are **fixed and always visible**
whether or not they are set, are labelled by dimension rather than by value, and each owns
an anchored panel of its own. The chip contract also carries a catch-all control that
opens the full filter set into a modal, which a facet bar has no need of because its full
set is already on the bar. Absorbing one into the other would mean either that a chip
must render when it has no value — which is not a chip — or that a dimension may vanish
when cleared, which destroys the property that makes a facet bar navigable at all.

Option 2 is refused on the evidence rather than on taste. The catalog cites the chip
contract for that row, in structured positions, across seven consecutive steps, and
describes chips filling when set beside a sort control that stays neutral. The frame
governs over prose where the two conflict, but here they agree, and this record resolves
from prose as the corpus-handling rule requires. The row's fixed dimensions make it
_facet-like in the query sense_ — which is exactly why `docs/decisions/role-matrix.md` can
speak of the browser's facets while the chrome remains chips — and that is the trap this
row exists to mark: a build that reasons from the query model to the chrome will render
the wrong contract.

Option 3 leaves both boundaries enforceable. The browser's row is the chip contract's
bar variant, tested there. The facet bar keeps its identifier, so when a structured index
surface arrives it is built from its own contract rather than by widening the chip row
until the distinction is gone. Nothing about that is a deferral for want of a contract:
the ownership, the module path and the prohibition are settled here and now, and only the
surface waits.

## Four registrations that arrive from sibling records

Two sibling records make judgements that belong to this register and say so, rather than
resolving them locally. Both were written before this one and both name it explicitly, so
the entries below are obligations rather than courtesies. All four are rung **2** — a
variant of a contract the inventory already defines — and none is a new contract or a
merge of two, which is the form `docs/decisions/responsive.md` requires of them by name.

| #      | Structure                                        | Owning module                            | Inventory identifier | Rung  | Where the reasoning lives                           |
| ------ | ------------------------------------------------ | ---------------------------------------- | -------------------- | ----- | --------------------------------------------------- |
| **12** | Sidebar as a closed-by-default overlay drawer    | `packages/ui/src/components/Sidebar`     | `C-SIDEBAR`          | **2** | `docs/decisions/responsive.md`, the 1024 breakpoint |
| **13** | Details pane shape selection, docked or centred  | `packages/ui/src/components/DetailsPane` | `C-DETAILS-PANE`     | **2** | `docs/decisions/responsive.md`, the 1280 breakpoint |
| **14** | Plan-choice pair stacking to a single column     | `packages/ui/src/components/PlanCard`    | `C-PLAN-CARD`        | **2** | `docs/decisions/responsive.md`, below the floor     |
| **15** | Creation-wizard modal taking the available width | `packages/ui/src/components/ModalShell`  | `C-MODAL-SHELL`      | **2** | `docs/decisions/responsive.md`, below the floor     |

**12 — the sidebar drawer.** Below the sidebar breakpoint the conversation sidebar stops
being a persistent column and becomes a closed-by-default overlay drawer, toggled from a
control at the head of the top bar's left-of-centre group that exists only below that
width. It **overlays** the content region rather than subtracting from it, so it may be
wider than the proportional share it gave up. Because it overlays interactive content it
takes the **modal** focus discipline rather than the region one — focus moves into it on
open, is trapped while it is open and is restored on close, reusing the shared focus-trap
hook rather than reimplementing it — and it resets its own scroll offsets on open. This is
a **presentation variant of the sidebar contract**, not a second navigation component:
the regions, the rows, the groups, the add affordances and the multi-select bar are all
the same contract rendering at a different width, and the sidebar module's co-located test
is extended in the same change to cover the drawer's focus behaviour.

**13 — the details pane's shape.** The contract already carries both shapes in one row —
a details surface "as a centred modal or a docked pane" — so choosing between them by
layout mode **selects a documented variant and invents nothing**. Below the pane
breakpoint the docked shape is unavailable and the centred-modal shape is used, leaving
the content region its whole share. The selection lives in the pane module, keyed off the
published layout mode, so no consumer branches on width; the module's test covers both
shapes and the selection between them.

**14 and 15 — two authored adaptations, recorded as authored.** The setup wizard's
plan-choice step renders two cards side by side at the capture width and stacks them to a
single column below the floor; the creation wizard's modal takes the available width
rather than the roughly-one-third share the catalog observes. **Neither is an
observation.** The corpus is captured at a single width, so responsive behaviour is
undesigned throughout, and both of these are choices this build made — which is why they
are registered here as variants with their reasoning in the responsive record and their
gap entries in `docs/decisions/gap-register.md`, rather than presented as something the
catalog showed. The distinction between a measured value and a chosen one is the whole
reason these records exist, and it is cheapest to preserve at the moment the choice is
made.

Both land as variants of the contracts that already own those structures — the plan-card
contract and the modal-shell contract — and each owning module's co-located test is
extended in the same change to cover the narrow-width composition. Neither becomes a
second card component or a second modal, and neither is expressed at the route that
happens to need it: a route that laid out its own stacked pair would be a local
equivalent of a shared contract, which is prohibited even when only one surface needs it.

## The four contracts the requirements omit and the catalog requires

The requirements enumerate **thirty-three** core interfaces for this phase. The catalog
union of the four non-defining area documents yields **thirty-seven**. Nothing in the
requirements' list is missing from the union, so the union is a **strict superset** and no
reconciliation is needed beyond adding four contracts.

One methodological point makes the union correct, and it is easy to get wrong in a way
that inflates the answer to ninety-nine. **The defining document cites all ninety-nine
identifiers because it defines them**, so a citation by that document is not a usage
signal. The union is therefore taken across the four documents that cite contracts
without defining them, and the per-document counts are twenty-two, twenty-four,
twenty-three and twenty-three, unioning to thirty-seven.

Each of the four below is in this phase for one reason and one only: **its own inventory
row carries a variant this phase needs.** That is the test. Not that the contract seems
generally useful, not that a surface might want it later — the row itself must carry the
variant, and each entry names it.

| Contract                 | Inventory identifier | Module                                   | The variant in its own row that puts it in this phase                                                                                       |
| ------------------------ | -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Reference and data table | `C-DATA-TABLE`       | `packages/ui/src/components/DataTable`   | A label-and-keys reference table grouped under headings, the label column at the left and chips at the right (L343)                         |
| Media player             | `C-MEDIA-PLAYER`     | `packages/ui/src/components/MediaPlayer` | An audio-clip player **inside the composer** with a filled circular play control, a waveform and a duration readout (L345)                  |
| Plan choice card         | `C-PLAN-CARD`        | `packages/ui/src/components/PlanCard`    | An onboarding pair form — a plain card beside one bordered in the primary brand colour, with an outlined action against a filled one (L358) |
| Record card              | `C-RECORD-CARD`      | `packages/ui/src/components/RecordCard`  | An embedded card **inside a message**, with a leading icon, a title, a type label and a content block of labelled rows (L344)               |

**The reference and data table** is in this phase because its label-and-keys form _is_ the
keyboard-shortcut reference the shell opens as a docked pane, and the bindings that
populate it are settled in `docs/decisions/keyboard-shortcuts.md` — key bindings being
function rather than identity, while every surrounding label, heading and grouping caption
is authored. The row carries a second thing worth registering: it absorbed a
**permission-denied row state**, in which one row's label and status word both render in
the destructive treatment while "its position, height and neighbours unchanged" and the
rows above keep their own results. That state is a row-level rendering of a denial, and it
is an instructive one to have in the table contract rather than anywhere else: a denial
that changed a row's height would reflow a surface mid-run, and a denial that removed the
row would hide the outcome the viewer is waiting for. The presentation is not the check —
the check is server-side under the authorization rule and is settled in
`docs/decisions/role-matrix.md`.

**The media player** is in this phase because the confirmed audio clip renders as its
in-composer variant. Judgement 4 above is the other half of this entry: the player owns
playback of a confirmed clip, the recorder pill owns capture, and the two are separate
modules because the corpus renders them as separate, successive structures.

**The plan choice card** is in this phase because its onboarding pair form is the plan
choice inside the workspace setup wizard. Its row also carries the in-place progress state
that judgement 9 registers, and the emphasised card's border is described here as _the
primary brand treatment_ rather than as a value — the thirteen colour literals exist in
one file and nowhere else, which `docs/decisions/theme-and-color.md` settles.

**The record card** is in this phase because an application or workflow can post a record
card into a conversation, and the row carries the embedded-in-a-message variant. Nothing
about the deferred surfaces that also use board cards changes that: the variant this phase
needs is in the row.

## The no-merge pairs, stated so they cannot be missed

### The formatting toolbar is not the composer action row

**Nine controls in five groups divided by four vertical rules, against seven controls in
three groups divided by two.** The toolbar's composer form carries bold, italic and
strikethrough, then a link control, then ordered and bulleted list, then blockquote, then
inline code and code block. The action row beneath the input area carries attachment,
formatting toggle, emoji and mention, then video clip and audio clip, then the slash
command. The inventory states the consequence itself: the two rows "carry different group
counts and must not be built from one grouping" (`00-product-overview.md` L327).

They are **two modules**: `packages/ui/src/components/FormattingToolbar` and
`packages/ui/src/components/ComposerActionRow`. **Rendering one where the other belongs
is a defect**, and the single-implementation rule names this pair as its own worked
example, so there is no reading of the rule under which the merge is available.

The toolbar contract's own statement that its position and control set "follow the host
surface rather than being fixed" is sometimes read as licence to merge. It is the
opposite. That sentence is why the toolbar is **variant-rich** — its row records a
composer form of nine controls in five groups, an inline message-editor form carrying the
same nine, a floating document form of seven controls in three groups that detaches from
the composer entirely and re-anchors above a selection, a modal editor form of nine
controls in **two** groups, and an inline field form — and it closes with the warning that
the control set is "per form, never universal", so a build that renders the composer's
nine controls on another surface renders the wrong toolbar. A contract with five
documented forms is a contract that needs its own module more than most, not one that can
be dissolved into its neighbour.

### The composer is one contract with seven variants, not six contracts

The inventory folded three structures into the composer's row rather than giving them
identifiers of their own, and a build that reads them as separate components will produce
three modules where one belongs. The seven observed variants are: empty with a placeholder
naming the target conversation; empty with **no placeholder at all**, the input area blank
between the toolbar and the action row; holding an attached audio clip rendered as a player
card above the action row; rendered inside a docked thread or session context by the areas
that own those surfaces; the **inline message editor**, the same toolbar over a reduced
action row of the formatting toggle and emoji only, with cancel and save right-aligned in
place of a send control; the **sub-composer inside a modal**; and the **reply composer**,
the conversation form plus an also-send checkbox inserted between the input area and the
action row, its send control carrying no send-options caret (`00-product-overview.md`
L326).

**The modal sub-composer's distinguishing property is the one that is easiest to get
wrong, so it is stated on its own: it has no send control of its own. The enclosing
modal's footer takes that role.** Its action row is reduced to the formatting toggle,
emoji and mention, and there is no send affordance anywhere inside the composer.

**This is structural, not a matter of props.** The difference is not a hidden button: it
is that the commit action lives in a **different component** — the modal shell's footer —
and therefore that the composer in this variant does not own submission at all. The two
consequences are the reason it matters. Validation and the enabled state of the commit
action belong to the modal, so a sub-composer that carried its own send control would
give the surface two commit paths with two validation stories. And keyboard handling
differs: the newline convention inside the field cannot also be a submit gesture when the
field has no submit to perform. A props-level reading — "same component, `showSend`
false" — reproduces the appearance and loses both consequences, and the lint boundary's
own principle is the general form of the point: a control belongs to the contract that
owns it.

### The filter chip is not the faceted filter bar

Chips are removable tokens over a selection; facets are a structured query surface over
fixed, labelled, always-visible dimensions. The inventory states the separation in the
facet bar's own definition, and judgement 11 above carries the full reasoning, the
evidence and the module for each. One line is enough here because the row is where the
argument lives: **neither contract absorbs the other, in either direction.**

### The anchored dropdown is not the object-scoped context menu

Both are overlay menus of rows, both may carry separators, labelled headings and
destructive items, and both can open a submenu — so this is the fourth pair worth stating
before someone reduces it to one module.

The distinction the inventory draws is **what the menu is anchored to**, and secondarily
whether its labels interpolate the acted-on object's name. The dropdown is "anchored to
the control that opened it", opening adjacent to that control and leaving its backdrop
legible; the context menu "acts on the object it was opened from", anchored to that
object's own row or header rather than to a persistent control, with actions that embed
the object's name — a rename and a destructive delete each naming the section they act on,
followed by a separated act-on-all action that names no object because it acts on all of
them (`00-product-overview.md` L330, L331).

One inconsistency between the two rows is carried rather than reconciled, because it
bears on how a reader tells them apart. The context-menu row says it is "distinguished
from the dropdown menu by carrying nested submenus that open sideways", while the dropdown
row says a nested submenu is explicitly **not** the distinguisher, and demonstrates the
point with an account-menu variant that carries one. Both readings are recorded here;
neither is asserted over the other. The build follows the anchoring test, because it is
the test both rows agree on and the only one that survives the dropdown row's own
counter-example — and because anchoring is a structural property a module can be tested
against, while "has a submenu" is a property of a particular menu's contents.

## The agreement obligation

**This record must agree with the modules actually present under
`packages/ui/src/components/`, and the obligation runs in both directions.**

- A registration **marked below as landing in this phase, with no module in the tree**,
  is a defect. Either the module was never built, or this row is stale and describes a
  judgement that was reversed. Both are failures, and both are failures of the same kind:
  a register that claims something the tree does not contain.
- A module present under `packages/ui/src/components/` that is **neither one of the
  thirty-seven contracts of this phase's union nor registered here** is a defect. It is
  either a contract that arrived without a judgement — which is how a second
  implementation of an existing contract gets in — or a judgement that was made and never
  written down, which is how the same judgement gets made differently next time.

Two clarifications keep the obligation honest rather than merely strict.

**Phasing is not absence.** Rows 10 and 11 close an ownership question whose surface
belongs to a deferred area, so their modules land with that surface. They are marked
below, and a reader checking the tree against this record must read the marking before
concluding that a module is missing. The same is true of the thirty-seven-of-ninety-nine
scoping this whole build rests on: a contract without a module in this phase is scoped
out, not lost.

**The inventory will not corroborate a variant registered here**, because it is read-only
and cannot be amended. Agreement is therefore between this record and the tree; the
inventory is the authority on the contract, this record on the extension.

| Registration                     | Module in this phase | Where the module lands                                     |
| -------------------------------- | -------------------- | ---------------------------------------------------------- |
| 1 · live remaining counter       | Yes                  | With the channel creation and rename surfaces              |
| 2 · region skeleton              | Yes                  | With the shell's loading presentations                     |
| 3 · photo drop zone              | Yes                  | With the profile-photo step of the setup wizard            |
| 4 · recorder pill                | Yes                  | With the composer's audio-clip capability                  |
| 5 · described-option group       | Yes                  | With the creation wizard, add-people and permissions forms |
| 6 · in-modal eligibility callout | Yes                  | With the add-people modal                                  |
| 7 · role-gate enclosure          | Yes                  | With the add-people modal's administrator-scoped toggle    |
| 8 · sidebar collapsible groups   | Yes                  | With the shell's sidebar                                   |
| 9 · progress indicator           | Yes                  | With the photo upload and the plan-choice step             |
| 10 · segmented control           | **No — phased**      | With the preference surface that renders it                |
| 11 · faceted filter bar          | **No — phased**      | With the structured index surface that renders it          |
| 12 · sidebar drawer              | Yes                  | In the sidebar module, selected by layout mode             |
| 13 · pane shape selection        | Yes                  | In the details-pane module, selected by layout mode        |
| 14 · plan-choice stacking        | Yes                  | In the plan-card module                                    |
| 15 · wizard modal width          | Yes                  | In the modal-shell module                                  |

## Maintenance

The rule is one change, not two, and it differs between the two rungs.

**A new variant** is registered here, implemented **in the owning module**, and covered by
that module's co-located test — all three in the same change. The single-implementation
rule requires the extension and the test together, and requires that the contract is
extended rather than forked; splitting the three across changes is how a variant ends up
implemented at a consumer "for now".

**A new identifier** is registered here and given its own directory under
`packages/ui/src/components/`, containing five files and exported from the barrel:

```text
packages/ui/src/components/<Contract>/
  <Contract>.tsx          the component
  <Contract>.module.css   its stylesheet, values from tokens only
  <Contract>.test.tsx     its co-located test
  types.ts                its public types
  index.ts                its entry, re-exported by the barrel
```

Three further obligations attach to either rung.

- **Every value in the stylesheet resolves to a token.** The only literals permitted are
  the ones that are not values — zero, none, auto, inherit, the current colour keyword
  and transparency. Colour literals exist in one file in the whole tree.
- **Every string comes from `packages/shared/src/copy/en.ts`.** A module that hard-codes
  a label has made the identity rule unenforceable at one stroke, because the brand guard
  can police one file thoroughly and cannot police forty.
- **Where the choice was authored rather than observed, the source carries a gap comment
  naming its decision record**, and the entry goes to
  `docs/decisions/gap-register.md`. A reader of the code should never have to guess which
  values were measured, which were cited and which were chosen.

## Count, for orientation

This phase implements **thirty-seven contract directories**, plus the separate composer
action row, together covering the **153 documented variants** and **177 documented
states** the inventory records for those contracts. This record adds fifteen
registrations against them: eleven candidate resolutions and four inherited from sibling
records. Three of the fifteen mint an identifier, ten extend one, and two register a
refusal to merge without extending anything.

**These are the current expectation, not permanent numbers.** The inventory's own
identifiers are a floor and not a ceiling, and this record is the mechanism by which the
floor rises — so a later phase that finds a genuinely uncovered structure will add a row
here and a directory there, and the count will be wrong in the only way a count of this
kind is ever wrong. What must not change is the shape: one contract, one module, one
place where the judgement that put it there is written down.
