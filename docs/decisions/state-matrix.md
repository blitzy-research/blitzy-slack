# State: the four loading shapes, the six validation presentations and the states the corpus never showed

Most of this build's design decisions are arguable. This one is countable.

The specification is unusually blunt about state, and the bluntness is the gift: it
says outright that the four loading shapes are **not interchangeable** and that a
build implementing one of them cannot reproduce the other three
(`21-states.md` L215). That turns the acceptance question from a matter of taste into
a matter of arithmetic. Are all four loading shapes present? Are all four empty
shapes expressible from one implementation? Are all six validation presentations
distinguishable? Are both read-only presentations right? Are the four gating kinds
still four, or did two of them get merged because they looked alike?

This record is the answer sheet for those questions. It fixes the state vocabulary
the shared component library implements, states what each state replaces and what it
preserves, and — where the corpus shows nothing at all — specifies the presentation
anyway, because uncertainty is not permission to omit.

| Field                               | Value                                                                                                                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record for the cross-cutting state vocabulary and its presentations                                                                                                     |
| Status                              | Operative. Authored **before** the state types, the component modules and the surfaces that render them exist                                                                    |
| Countable obligations               | **4** loading shapes · **4** empty shapes · **6** validation presentations · **2** read-only presentations · **4** gating kinds                                                  |
| Primary specification source        | `21-states.md`, the catalog's closed source of state evidence                                                                                                                    |
| Frames opened to author this record | **0**                                                                                                                                                                            |
| State enumeration lives at          | `packages/ui/src/state/state-matrix.ts`                                                                                                                                          |
| Presentations implemented in        | `packages/ui/src/components/`, one contract per directory, consumed only through the package barrel                                                                              |
| Every string comes from             | `packages/shared/src/copy/en.ts`                                                                                                                                                 |
| Companion records                   | `docs/decisions/theme-and-color.md`, `docs/decisions/responsive.md`, `docs/decisions/role-matrix.md`, `docs/decisions/component-extensions.md`, `docs/decisions/gap-register.md` |

**How this record cites.** A document citation names a file under `docs/workflows/`
together with its line number, so a bare `README.md` below would mean the catalog
index in that directory and never the one at the repository root. A frame is cited
by its **number alone**, never by a filename: every filename in the corpus embeds a
third-party product name, and so does the catalog's own percent-encoded citation
form, both of which are prohibited in a committed file. No frame was opened to author
this record. Every observation attributed to the corpus below was resolved from
catalog prose, which is what the corpus-handling rule asks for and what the evidence
here happened to allow — the state document had already measured everything this
record needed.

**How this record cites the project rules.** By subject and by position in the order
they were provided, never by identifier. The five rule identifiers each embed the
same third-party product name, so writing one into this file would breach the very
rule the file is otherwise observing. The rules that govern here are the
**single-implementation rule** (the first as provided), the **authorization rule**
(the second), the **corpus-handling rule** (the third), the **uncertainty rule** (the
fourth) and the **identity rule** (the fifth). Position alone would be unsafe,
because the identifiers are permuted against the requirement labels they correspond
to; position together with subject is not. This is the convention
`docs/decisions/role-matrix.md` and `docs/decisions/theme-and-color.md` already
established, and it is followed here so the decision records read consistently.

**How this record describes a treatment.** Semantically and never as a value. A
_cautionary_, _destructive_, _success_, _de-emphasised_, _inverted_ or _default_
treatment names a role, and `docs/decisions/theme-and-color.md` is where each role
resolves onto one of the thirteen token names and where the thirteen literals are
declared. This record contains no colour value, and neither may any component that
implements it.

**How this record describes wording.** By what a presentation communicates and where
that communication sits — never by the words themselves. Not one message, heading,
label or button caption is transcribed from a frame, because the identity rule
forbids reproducing third-party product copy including strings that are legible in a
capture. Every string a state renders is authored originally and lives in
`packages/shared/src/copy/en.ts`. Where a row below says a bar "states that the
conversation is archived", that is a description of a communicative obligation and an
instruction to author the sentence, not a paraphrase to be copied into code.

## What this record owns, and what it deliberately does not

It owns **which presentation a state renders**: the shapes, what each one replaces,
what each one preserves, where it sits relative to the region that hosts it, and what
it must never do. Four boundaries are drawn so that no question has two homes:

| Question                                                                     | Where it is settled                                                                 |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Which presentation renders at 1280, 1024 or 768 pixels of width              | `docs/decisions/responsive.md`, which owns the geometry where the two records touch |
| Which token a semantic treatment resolves to, and its contrast in each theme | `docs/decisions/theme-and-color.md`                                                 |
| Whether a role may perform the operation a gate describes                    | `docs/decisions/role-matrix.md`, and the server, unconditionally                    |
| Whether a missing structure is a new contract or a new variant               | `docs/decisions/component-extensions.md`                                            |
| The marker reference, options and rationale behind each authored state       | `docs/decisions/gap-register.md`                                                    |
| The reconnect protocol the connection states surface                         | `docs/decisions/realtime-contract.md`                                               |

Each of those is pointed at rather than restated. A second copy of a decision is a
second thing to keep true, and the two eventually differ.

## The cross-cutting state vocabulary

This is the enumeration `packages/ui/src/state/state-matrix.ts` declares. It exists
as a named union rather than as an ad-hoc string in each component, so that a
presentation is chosen by a value the type system knows and a misspelling is a build
failure rather than a silently unstyled control:

```text
'default' | 'hover-row' | 'hover-control' | 'focused-field'
| 'focused-control' | 'active' | 'current-in-grid' | 'empty'
| 'zero-result' | 'loading-control' | 'loading-row'
| 'loading-block' | 'loading-region' | 'pending' | 'passed'
| 'failure-transient' | 'failure-page' | 'field-invalid'
```

Eighteen members, and the four loading members are four because the shapes they name
are four. Collapsing them into one `'loading'` member is the single most likely way to
fail this record, because the type would then compile while the build had lost three
of the four renderings the specification requires.

| State               | Applies to                         | What changes                                                                                                                                                                                                                       | Evidence                     |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `default`           | Any surface, at rest               | Nothing: no overlay, no badge, no placeholder; the region's own content renders and its primary control is actionable                                                                                                              | 549, 691                     |
| `hover-row`         | A row within a list                | The row takes a tint across the **full width of its list** while every other row keeps the default surface; where the row has per-row actions, a floating bar appears at its top-right, overlapping the row's upper edge           | 250, 387, 349                |
| `hover-control`     | A single control                   | A label bubble appears immediately **above** the control, naming what it does                                                                                                                                                      | 198                          |
| `focused-field`     | A text field or typeahead          | A ring renders **outside** the field's own border, the border strengthens, and a caret appears at the insertion point; nothing else on the surface changes. A typeahead keeps the same treatment while its suggestion list is open | 490, 491, 63, 43             |
| `focused-control`   | A control that opened a surface    | A ring renders outside the control's own footprint and is **retained after the surface it opened has closed**, while neighbouring controls in the same bar render without one                                                      | 288                          |
| `active`            | The current item in a set          | The current item is distinguished structurally: a tab label underlined and emphasised, an autocomplete row filled across its full width, a navigation entry filled, a settings category filled                                     | 688, 203, 950, 562           |
| `current-in-grid`   | A cell in a date grid              | Today's cell is ringed by an **unfilled** outline; cells before it render at reduced contrast and later cells at full contrast                                                                                                     | 53                           |
| `empty`             | A region with nothing to show      | The region's content is replaced by a centred block that explains the region, in one of four compositions                                                                                                                          | 359, 568, 657, 441           |
| `zero-result`       | A result region and its tab        | The count renders as an explicit zero on the tab that has none, and the region carries a heading, a recovery instruction and a feedback line — with **no illustration**                                                            | 688, 692                     |
| `loading-control`   | A single control                   | The control keeps its exact footprint and position, loses its label, and renders a centred spinner on a de-emphasised fill                                                                                                         | 10, 18                       |
| `loading-row`       | One row of a table                 | The row's status cell renders a spinner in place of a status word while its label takes an accent treatment; sibling rows keep their own statuses                                                                                  | 564, 565                     |
| `loading-block`     | One block in a document flow       | An empty bordered rectangle occupies the eventual block's footprint and carries a centred spinner                                                                                                                                  | 321                          |
| `loading-region`    | A whole region being repainted     | The region repaints as shape-preserving placeholders while every adjacent region keeps its real content                                                                                                                            | 911                          |
| `pending`           | A queued item in a set             | The item reads a pending status word, with its label and its status word both in the default text treatment                                                                                                                        | 564                          |
| `passed`            | A completed item in a set          | The item's label and its status word render together in a success treatment                                                                                                                                                        | 564, 565                     |
| `failure-transient` | An action's outcome, over a region | A rounded pill on an inverted surface floats at the foot of the content region, stating that something went wrong and inviting a retry — carrying no undo, no dismissal affordance and no button of any kind                       | 199                          |
| `failure-page`      | A whole requested page             | The requested surface is replaced: public navigation, one centred card with a warning glyph, a heading, a body and a single inline link out, and the public footer                                                                 | 1020, 1021                   |
| `field-invalid`     | A field, a field pair or a form    | The rejected entry is reported next to itself, in one of six presentations                                                                                                                                                         | 217, 615, 647, 730, 735, 677 |

Four of those rows carry a detail worth pulling out of the table, because each is a
place where a reasonable implementation guess is wrong.

**A hovered row's action bar overlaps the row's upper edge.** It is not laid out
inside the row and it does not push the row's content aside. A build that reserves
space for it makes every row taller than the specification shows, in every state,
for the sake of one.

**A used control keeps its focus ring after the thing it opened is gone.** Dismissing
a menu, a popover or a picker must not clear focus (`21-states.md` L571). This is the
one focus-restoration behaviour the corpus actually evidences, and it is easy to
break by moving focus to the document body on close.

**Today's cell in a date grid is not focus.** It is its own state, and reading it as
focus would give two cells a focus treatment at once (`21-states.md` L463). The ring
is unfilled and the reduced contrast applies to _earlier_ cells only.

**`pending` and `passed` colour the label as well as the status word.** The label is
not left in the default treatment while only the status changes, and in the loading
row it takes an accent treatment rather than the success one. This is a three-way
distinction across one table, which is exactly the case a build flattens if it styles
only the status cell.

### Focus is evidenced. Hover, mostly, is not

These two look like the same kind of claim and they are not, so the difference is
recorded here rather than left to be inferred from the table above.

**Focus is observed and specified.** The treatment is a ring rendered outside a
field's border, together with a strengthened border and a caret at the insertion
point, and it is evidenced four times over on fields and once on a control whose
surface has closed (`21-states.md` L463). Focus is therefore **evidence** in this
record, not a gap, and the presentation above is a transcription of a rendering
rather than an authored guess.

What the corpus does not evidence is the **traversal** that produces focus. No
capture shows two successive focus positions, a skip link, or focus containment
inside an open modal, and none shows a checkbox or a radio carrying the treatment
(`21-states.md` L463). Tab order, focus containment and focus restoration on
dismissal are therefore build decisions — with the single exception already noted,
where a used control keeps its ring. Containment is implemented once, by
`packages/ui/src/hooks/useFocusTrap.ts`, and consumed by every contract that opens a
modal surface rather than re-derived per surface.

**Hover, by contrast, is claimed for four cases and no more.** A message row, an
activity entry, a comparison-table row and one composer control — and that is the
whole of it (`21-states.md` L477). The reason is structural rather than editorial: a
static capture can only evidence hover where the pointer happened to rest, so the
absence of a hover claim for any other contract is a gap in the corpus and **not a
statement that no hover exists**. Every other hover treatment in this build is
authored by extending the two evidenced patterns — a full-width row tint for a row,
a label bubble above a control — and `packages/ui/src/hooks/useHoverIntent.ts` is
where the timing that governs them is decided once.

This asymmetry is stated because implying uniform evidence would be a documentary
defect in either direction. Claiming hover everywhere would invent renderings;
treating focus as unevidenced would discard a specified one and replace it with a
guess.

### The focus ring renders outside the border. This is a requirement, not a preference

Two independent lines of reasoning arrive at the same geometry, which is why it is
stated as a hard requirement rather than as a default.

The first is the corpus: the observed treatment _is_ a ring outside the field's own
border (`21-states.md` L463). The second is contrast, and it is decisive.
`docs/decisions/theme-and-color.md` measures a ring drawn in the brand token against
a brand-filled control at 1.00:1 — the same value against itself, which is to say
invisible — and the primary button is the control most likely to be focused and the
one filled with exactly that token. Drawing the ring outside the border with an
offset gap puts the ring's neighbours on the surrounding surface instead of on the
fill, where the measured figures clear the threshold comfortably in both themes.

Three obligations follow, and all three are testable:

- **The ring is never clipped.** It renders outside the border, in the offset gap,
  and no ancestor may crop it — an overflow rule on a row, a menu or a pane that
  cuts the ring makes focus invisible on the controls inside it.
- **The ring clears contrast in both themes.** The figures and the pairings live in
  `docs/decisions/theme-and-color.md`; this record's obligation is that no component
  may substitute its own ring, remove the outline without replacing it, or suppress
  the ring for aesthetics.
- **The ring is never the only cue.** The evidenced treatment is three cues — ring,
  strengthened border, caret — and a control that signals focus by colour alone is
  not distinguishable to every reader.

## Loading has four shapes, and they are not interchangeable

**The four shapes are not interchangeable, and a build that implements one of them
cannot reproduce the other three.** The specification states this plainly rather than
leaving it to be discovered (`21-states.md` L215), and it is the strongest single
sentence in the state document,
because it converts four renderings from a stylistic range into four separate
obligations. A spinner in the middle of a region is not a smaller version of a
skeleton and a skeleton is not a larger version of a spinner: they replace different
things and they preserve different things.

The four are distinguished by _what disappears_ and _what must not move_.

| Shape             | What is replaced                                                                    | What is preserved                                                         | Where it applies                                                                                       | Evidence |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- |
| In-place control  | The control's **label**, by a centred spinner on a de-emphasised fill               | The control's exact size and position, and the surrounding form           | A control whose own action is in flight: a wizard's advance action, a card's choose action             | 10, 18   |
| Per-row status    | **One row's status word**, by a spinner                                             | Row order, row count, row heights, and every sibling row's own status     | One item of a set that resolves item by item, inside a table that keeps reporting the others           | 564, 565 |
| Block placeholder | The eventual block's **content**, by an empty bordered rectangle carrying a spinner | The block's footprint in the document flow, and every block around it     | A block whose content is arriving into a document that is otherwise complete                           | 321      |
| Region skeleton   | The region's **rows**, by shape-preserving placeholders                             | The region's own footprint, and the real content of every adjacent region | A whole region being repainted — re-sorted, re-filtered or newly fetched — beside regions that are not | 911      |

A skeleton's placeholders are shape-preserving in a specific sense the specification
spells out: a circular placeholder where an avatar belongs, and rounded bars at title
and metadata lengths (`21-states.md` L129). The point is that the region does not
change size or rhythm when the real rows arrive, so a skeleton built from
equal-height grey bars is the wrong shape even though it is the right idea.

### Two properties hold across all four

**Loading is scoped to the smallest thing that is changing.** A control, a row, a
block or a region — never more. This is not a preference about restraint; it is what
every observed rendering does, and it is why the four shapes exist at four different
granularities.

**Loading is progressive rather than atomic.** One table renders passed, in-progress
and pending rows simultaneously, and the following capture shows the next row already
in progress while the previous one has resolved (`21-states.md` L224). The two
captures differ by almost nothing else, which is what makes "the table does not
reflow" a measurement rather than an impression: row order, row count and row heights
are unchanged across the pair. A build that resolves a set all at once, or that
reflows as each item lands, contradicts both halves of that observation.

### An unscoped blocking overlay is prohibited

Recorded as an absence, because that is what it is: **no frame in the corpus shows a
whole-surface blocking overlay or spinner.** Every loading rendering observed is
scoped to a control, a row, a block or a region (`21-states.md` L475).

This record turns that absence into a prohibition rather than a discouragement, and
the reason is that the absence is unusually well-supported. It is not the silence of
a state nobody happened to capture — the corpus captures loading four separate times,
at four different granularities, and never once at surface scope. A whole-surface
overlay would therefore be an invention that also contradicts the scoping property
above. So: no route, no surface, no modal and no pane in this build renders a
blocking overlay or a centred whole-surface spinner. Where a surface needs several
things at once, each gets its own scoped shape and they resolve independently.

The region skeleton is one of the eleven candidate extension structures the
specification implies without giving an identifier to, so **whether it is a new
contract or a new variant of an existing one is settled in
`docs/decisions/component-extensions.md`**, not here. This record fixes what it
renders; that record fixes what owns it.

## Empty has four shapes, and three rules that decide where they go

| Shape                         | Composition                                                                                                                                    | Where it applies                                                                                                               | Evidence           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| Illustrated, with an action   | Illustration slot or glyph, heading, one-line body, then a filled or outlined action — sometimes with a further jump link                      | A region whose emptiness the viewer can act on directly: a caught-up list, an all-done tab, a management page, a sidebar group | 359, 397, 644, 441 |
| Illustrated, no action        | Illustration slot, heading, one- or two-line body, one inline link                                                                             | A region whose emptiness the viewer cannot fill from here, so the link explains rather than acts                               | 501, 396, 385      |
| Illustrated and instructional | Illustration slot, heading, body, inline link, a rule, then a **numbered list** teaching the workflow that fills the region                    | A region whose filling takes several steps the viewer has not done before                                                      | 502                |
| Text only                     | Heading plus one body line and nothing else; or a single sentence with no heading at all; or heading, body, an inline link and a feedback line | A region inside a dense surface, and every zero-result region — which carries no illustration at all                           | 568, 657, 692      |

All four are expressible from **one** implementation, and the composition is a
property of the region rather than a global default (`21-states.md` L560). The failure
mode the specification calls out is a build that gives every empty region an
illustration and a button: it cannot reproduce two of the four (`21-states.md` L521).
So the illustration slot, the action row, the inline link and the numbered list are
each independently optional, and the text-only shape is not a degraded variant — it is
the shape a dense surface uses.

Three rules follow, and each is a distinct implementation constraint rather than a
restatement of the others.

**Empty is per region, not per page.** With a filter applied, one column renders its
own empty block while the pane beside it keeps its full content, its composer and its
formatting toolbar (`21-states.md` L237). Emptiness belongs to the region that has
nothing to show, which means the empty presentation is chosen by the component that
owns the region and never by the route. A route-level empty state would blank a pane
that had content, and no capture shows that.

**One surface can carry a different empty state per tab.** Two tabs of one surface
render different compositions with different actions (`21-states.md` L238) — the copy
is written for the tab, not for the surface. So the empty presentation and its
authored strings are selected per tab, and a single surface-level empty block keyed to
the surface's own identity cannot express it.

**The conversation hero is not an empty state.** This is the rule most likely to be
implemented wrongly, because the hero looks exactly like one: an illustration, a
heading and a body, centred at the head of a conversation. But it still renders when
the conversation has messages, day dividers and app-authored posts beneath it, and it
is evidenced doing so three times (`21-states.md` L239). It is a
beginning-of-conversation block, not a report of absence. Because the conversation
body is anchored to the foot of the region, the blank space in such a capture sits
**above** the hero rather than replacing content — so a build that renders the hero
only while the message list is empty cannot reproduce any of those three frames, and
a build that anchors the list to the top puts the blank space in the wrong place.
Where suggestion cards accompany the hero they _follow_ it, as a row of two cards each
carrying an icon, a title and a one-line sub-line.

The consequence for the component library is worth stating directly: the conversation
hero is a variant of the empty-state contract's _composition_, invoked
unconditionally by the conversation surface, and its render is never gated on a
message count.

### Illustration slots take original or open-licensed artwork

Every illustration referred to above is a **slot**, and what goes in it is authored
for this build or taken from an open-licensed source. No illustration, glyph or scene
visible in a frame is traced, extracted or reconstructed, and no frame is opened to
study one — the identity rule forbids reproducing third-party artwork, and the
corpus-handling rule forbids opening a frame to look at something the catalog has
already described. `packages/ui/src/icons/` is where the glyph set lives, and
`docs/decisions/theme-and-color.md` records that icons are tinted through tokens
rather than carrying colour of their own.

The empty-state contract therefore takes its illustration as a slot the caller fills,
with a glyph-only and a no-artwork path that are first-class rather than fallbacks —
which the four compositions above require anyway, since two of them have no
illustration at all.

## Field validation has six presentations, on three independent axes

The six are countable because they vary along three axes that the corpus settles
independently and never uniformly (`21-states.md` L255):

1. **Where the message goes** — beneath the field, beneath a field pair, beneath an
   input group, or above the whole form.
2. **Whether the rejected value survives** — retained, cleared, or cleared for one
   field of a pair while its partner is retained.
3. **Whether the primary action is gated** — de-emphasised until corrected, filled and
   actionable despite the rejection, or absent from the form entirely.

Three axes with three or four positions each would permit far more than six
combinations. Six are what the corpus shows, and the six are these:

| #   | Where the message goes                                                       | Field treatment                                                                                   | Value                                        | Primary action                            | Evidence |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------- | -------- |
| 1   | Directly beneath the field, **plus a preview row of the conflicting record** | Border in a destructive treatment                                                                 | **Retained**                                 | **De-emphasised** until corrected         | 217      |
| 2   | Beneath each affected field, **three at once**                               | Border in a destructive treatment **plus an error-badged glyph inside the field's trailing edge** | **Retained**                                 | **Filled and actionable**                 | 615      |
| 3   | A **form-level callout above every field**                                   | **No field marked at all**                                                                        | **Retained**                                 | **Filled and actionable**                 | 647      |
| 4   | A tinted block beneath the input group                                       | Boxes keep their **default** border                                                               | **Cleared**                                  | **No submit control exists on this form** | 730      |
| 5   | **One** message beneath the field **pair**, not one per field                | Both fields bordered in a destructive treatment                                                   | Second field **cleared**, first **retained** | **Filled and actionable**                 | 735      |
| 6   | A tinted block beneath the input, **inside a modal**                         | Border in a destructive treatment                                                                 | **Retained**                                 | **De-emphasised**                         | 677      |

Read down the last two columns and the reason these cannot be merged is immediate.
Presentations 2, 3 and 5 leave the primary **filled and actionable while a field is
invalid**; 1 and 6 gate it; 4 has no submit control at all. And 4 and 5 clear a value
that 1, 2, 3 and 6 retain. A component that always gates the primary, or always
retains the value, collapses six presentations into one and contradicts four of the
six frames.

Two consequences the specification draws explicitly, because both are properties of
the _form_ rather than of the validation component (`21-states.md` L452, L453):

- **Gating is a property of the form.** Whether a rejection de-emphasises the primary
  is decided by the form that hosts the field, and both behaviours must be
  expressible through the same contract.
- **Retention is per field and per rejection reason.** Secrets and one-time codes are
  the cleared cases observed; ordinary values are retained. Presentation 5 is the
  proof that this is per _field_ and not per form — one field of a pair is emptied
  while its partner keeps its value.

### A rejection can carry the evidence of the conflict

Presentation 1 renders more than a message: beneath the message sits a **preview row
of the record that already holds the name** (`21-states.md` L266). That is a second
kind of payload — evidence rather than explanation — and it means the validation
contract accepts an optional conflicting-record slot, not merely a string.

### Every treatment clears together, as one derived state

When the entry is corrected, the destructive border, the message, the conflicting-record
preview and the de-emphasised primary **all resolve in the same capture**
(`21-states.md` L266, and the contract's own state row at
`00-product-overview.md` L357). They are therefore **one derived state, not four
independent flags**. Implementing them as four booleans is the defect this observation
exists to prevent: four flags can be half-cleared, and a half-cleared rejection is a
rendering the corpus never shows.

### The presentation with no message at all is the majority case

Validation is also expressed **without any message and without any colour change**,
purely through control state: a primary rendered de-emphasised while its field is
empty, and filled once the field is satisfied. The specification records this as the
**more common** case in the corpus, evidenced six times over (`21-states.md` L268).

**It must be implemented.** A build that ships only the six messaged presentations has
implemented the exception and skipped the rule. Three properties are required of it:

- The control keeps its **full size and position** and changes only its treatment, so
  nothing around it moves when it becomes actionable (`21-states.md` L528).
- The precondition is stated **adjacently** — by a live counter, a checkbox, or the
  empty required field itself — rather than being left for the viewer to deduce
  (`21-states.md` L527).
- The control **may change its own label** when it becomes actionable
  (`21-states.md` L529), so the label is derived from the state and not fixed at the
  call site.

One inconsistency belongs to this form and is carried rather than reconciled: a field
**captioned as optional** nevertheless de-emphasises the form's primary while it is
empty, and the primary changes its label once a value is present (`21-states.md`
L455). The caption and the control state contradict each other in the corpus. Both
readings are recorded; neither is asserted over the other; and the build consequence
is that a field's optionality caption is authored copy and is **not** the source of
the form's gating condition — the two are separate inputs and the specification shows
them disagreeing.

### All six must be distinguishable, and distinguishable by test

The six are variants and states of the single shared validation contract, and the
requirement is not that the contract _could_ express them but that six distinguishable
renderings exist and are asserted. Each carries something besides colour — a message
beneath the field, an error-badged glyph inside the trailing edge, a tinted block, a
form-level callout, or a conflicting-record preview — and presentation 3 marks no field
at all, so colour is not even present as a cue there. That is the
colour-is-never-the-only-carrier obligation `docs/decisions/theme-and-color.md` states,
satisfied by the six as specified rather than by an addition to them.

No presentation is marked satisfied without a passing test behind it. The targets are
named in **How each of these is proved** below.

## Read-only has two presentations, and both name the way out

Both dock a status bar at the foot of the region they affect, and **both name an
exit** (`21-states.md` L280). The bar is full region width and a single text row tall,
carrying a sentence at its leading edge and one action at its trailing edge — and it
**replaces** the region's composer rather than sitting above it (`21-states.md` L91).

| Presentation          | What the bar communicates and offers                                                                                   | What else changes                                                                                                                                                                                                                                                                                                                                              | Evidence      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Archived conversation | A sentence naming the conversation and stating that it is archived, with a close action at the bar's **trailing edge** | The composer is **replaced entirely** by the bar — **not disabled**. The header loses its facepile, its member count and its huddle action, keeping its document action. The details surface drops its members tab, leaving three, and its settings tab holds exactly two rows — an unarchive action and a destructive delete. The sidebar row's glyph changes | 134, 136, 137 |
| Read-only document    | A sentence stating that the document is being read in read-only view, with a turn-off link at the **trailing edge**    | The pane keeps its heading, its blocks and its checkboxes, and its edited-status line stays in the header                                                                                                                                                                                                                                                      | 339           |

Two presentations, and that is the count. A **third instance** of the same state is
observed and is deliberately not a third presentation: a template opened for reading,
which carries a use-template action instead of an editing surface (`21-states.md`
L287). It is the archived pattern's shape — a read-only surface offering the one action
that leaves it — applied to a different object, and it is recorded here so that a
build meeting it does not mint a fourth thing.

The channels document adds detail this record adopts: an archived conversation also
loses its bookmark row and the leave action in its details surface, and the sidebar
row's glyph changes to an archive box (`02-channels.md` L434, L450, L453). Its
judgement is the one to carry: an archived conversation is **a distinct read-only
surface, not the ordinary surface with a disabled composer**.

### A styled-disabled surface is not a read-only surface

This follows from the table and is stated as a prohibition because the shortcut is
tempting and cheap. Read-only is expressed by **replacement and removal**: the
composer is replaced by a bar, and affordances that no longer apply are removed from
the header and from the details surface. Disabling the composer, greying the header
actions and leaving everything in place is a different rendering — one the corpus does
not contain — and it also loses the exit, because the bar that names the way out is the
thing the composer was replaced _by_.

### Reversal is one atomic state change

**Reversing the setting restores every removed affordance at once.** After the
conversation is unarchived, the facepile, the member count, the huddle action, the
bookmark row and the full composer with its formatting toolbar and action row are all
present again, the sidebar row's glyph reverts, and the conversation's own event
history has gained an entry recording the reversal (`21-states.md` L287,
`02-channels.md` L454).

The build requirement is that this is **one derived state, not a set of independent
toggles**. Each affordance's presence is computed from the object's read-only flag at
render time, so there is no code path in which a facepile has returned and a composer
has not. A build that restores affordances one by one has as many partially-restored
renderings as it has affordances, and the corpus shows exactly two: fully archived and
fully restored.

The system entry the reversal appends is a message in the ordinary list rather than a
line in a separate audit view — the event history is a first-class part of the surface
(`02-channels.md` L456), so the reversal writes a record that the message list renders
like any other.

### Read-only is a write-scope state and says nothing about read scope

The channels document raises this as a build obligation and names this record as the
owner of the bar's state contract (`02-channels.md` L444), so it is settled here:
**archiving changes what may be written to a conversation and changes nothing about
who may read it.** A private conversation that is archived stays private, and the
read-only bar is not a signal that it has become readable by the workspace.

Two consequences, and the second is the one that matters:

- The bar's authored sentence states that the conversation is archived and offers the
  exit. It does not describe who can see the conversation, because that is a different
  question with a different answer.
- **The rendering is not the enforcement.** Removing the composer does not refuse a
  send, and a send that arrives for an archived conversation is refused on the server
  by the operation the capability matrix already covers. `docs/decisions/role-matrix.md`
  owns that decision; this record owns only the bar.

## Four gating kinds, held distinct

**They look similar and they mean different things, so they are kept apart here and
must be kept apart in the build.** The specification fixes the four names for exactly
this reason, and states that all four render differently and all four are observed
(`21-states.md` L111, L272). Merging any two of them would produce a build that
renders one situation where the corpus renders another, and — worse — that
communicates the wrong cause to the person looking at it.

| Kind                         | What it looks like                                                                                                                                                                                                                                                                                                                                                          | What it means                                                                               | Evidence           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| Device or browser permission | Reported in place and non-blockingly, in three positions: a band pinned across the viewport foot in a cautionary treatment naming the remedy; a table row in a destructive treatment; a callout at the top of a dialog body with that dialog's primary left de-emphasised. **Every presentation names a remedy outside the product, and none offers an in-product control** | A capability the product cannot grant itself                                                | 300, 565, 194      |
| Role gating                  | **Hides nothing and disables nothing.** The gated control sits inside a bordered container whose caption — inset into the border's top edge and led by an eye-with-slash glyph — names the role that can act. The control is left in its ordinary off position, and the enclosing modal's primary action is a filled primary                                                | The signed-in role may not use this control                                                 | 75                 |
| Entitlement gating           | An inline badge naming a paid plan tier, immediately after the label it gates and smaller than it; a trial countdown rendered in the sidebar's banner slot, its footer item slot and the workspace menu at once; and an upsell strip above a result set. Never blocking                                                                                                     | The workspace's plan does not include this capability                                       | 550, 500, 566, 688 |
| Precondition gating          | The control keeps its full size and position and changes only its treatment, to a de-emphasised rendering, with its precondition stated adjacently. This **is** the no-message validation presentation                                                                                                                                                                      | This control's own precondition is unmet — a statement about the form, not about the viewer | 950, 951, 649, 651 |

Each row's _meaning_ column is the reason its _presentation_ column differs, and the
pairs most likely to be confused are worth naming.

**Device permission versus everything else.** The request form carries an in-product
link, because starting the browser's own grant flow is something the product can do.
The _denial_ form carries none at all — the huddle band has no action link whatever —
because enabling a device is the browser's job (`21-states.md` L274). So a build must
not helpfully add a retry button to a denial: offering a control that cannot work is
the specific failure this presentation is shaped to avoid. A denial is additionally
visible on the device control itself, which renders struck through (`21-states.md`
L274), and the in-modal denial variant **resets the modal's setup state** as well as
reporting it, so a build that only reports the failure cannot reproduce it
(`00-product-overview.md` L346).

**Role gating versus precondition gating.** These are the pair that a build merges by
accident, because both concern a control the viewer cannot currently use. They render
oppositely. Role gating leaves the control **in its ordinary rendering** and explains
itself in words in an enclosure around it; precondition gating **changes the control's
treatment** and says nothing in words at all. Rendering a role-gated control as
disabled tells the viewer their own input is incomplete, which is false; rendering an
unmet precondition as an enclosure tells them they lack standing, which is also false.

**Role gating explains itself in words, never in a treatment.** The enclosure's
caption is the whole of the communication, and `docs/decisions/theme-and-color.md`
records the corresponding obligation from the colour side — nothing about how a control
is coloured is ever evidence of permission.

**Entitlement gating is inline and adjacent, never blocking.** The gated row renders
exactly like its siblings apart from a badge after its label, and the surface behind it
stays fully usable (`21-states.md` L537). Its full six-state set — not gated, gated
inline, trial active with countdown, contextual upsell, billing surface and upgrade
destination — is specified in the state document and owned by the upgrade-gate contract
(`21-states.md` L289). Two facts from it carry into this build directly: the same trial
state drives three different renderings from **one** field — a countdown in days, a
status-only statement with no duration, and an absolute end date — and no countdown,
date, price or plan-tier name observed in the corpus may appear as a literal
(`21-states.md` L302, L304). Because billing is out of scope for this phase, the
upgrade path resolves to a defined placeholder surface rather than to a purchase flow;
`docs/decisions/placeholder-surfaces.md` records what that placeholder says.

### Presentation is not enforcement, and a precondition is not a grant

This is the doctrine that ties the four together, and it is not this record's
invention: the specification states both halves as a build obligation
(`00-product-overview.md` L502), and the authorization rule — the second as provided —
makes them binding.

**Presentation is not enforcement.** Removing, hiding, disabling, badging or enclosing
a control is a decision about pixels. None of those decisions refuses a request. A
control that was never rendered must still be refused when its request arrives, because
the request does not carry the rendering that omitted it. Everything in this record is
therefore a rendering obligation _in addition to_ a server check, never instead of one.
The check runs at the point of execution, against the acting session and the specific
target object, and `docs/decisions/role-matrix.md` is where each cell of that decision
lives.

**A precondition is not a grant.** The fourth kind above is a statement about a form:
a field is empty, a checkbox is unticked, a wizard step is incomplete. Satisfying it
asks no authorization question and answers none. A build that treats a satisfied
precondition as permission has confused the two states this section exists to keep
apart — and so has a build that treats a confirmation dialog as the authorization,
when it is a second signal of intent.

One corollary for the role-gated enclosure specifically: because it hides nothing, the
control inside it is reachable and operable, so the server refusal is not an edge case
to be reached by a crafted request — it is the **expected** path when someone activates
a control the enclosure told them they could not use. It must therefore be a refusal
the surface handles gracefully, which is a page-level or transient failure presentation
from this record rather than an unhandled rejection.

## The state families the corpus never showed

Nine families are wholly unevidenced and every one of them still ships as working
behaviour, because the uncertainty rule — the fourth as provided — makes absent
evidence an open work item rather than permission to omit. This record specifies their
**presentation**. Their marker references, the options considered, the choice and the
rationale are registered in `docs/decisions/gap-register.md`, and the reconnect
protocol that the connection states surface is specified in
`docs/decisions/realtime-contract.md`. Both are pointed at rather than duplicated.

**The one honest piece of related evidence.** The only retry affordance evidenced
anywhere in the corpus is a sentence inside a transient failure pill inviting the
viewer to try again — and it is plain sentence text rather than a link or a button
(frame 199, `21-states.md` L465, `03-messaging-and-composer.md` L639). The only
connection reporting evidenced anywhere is a diagnostics popover summarising a
connection as stable (frame 271, `21-states.md` L465). That is the whole of the
evidence. Everything in the table below is authored, and it is marked as authored so
that a reader can always tell which of this record's claims are transcriptions and
which are decisions.

Each presentation below reuses a shape this record already specifies, which is the
smallest coherent behaviour consistent with adjacent evidenced behaviour — the standard
the uncertainty rule sets for a silent corpus.

| Family              | Authored presentation                                                                                                                                                                                                                                                          | Reuses                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Offline             | A non-dismissible banner in a cautionary treatment in the shell's banner slot, stating that the connection is lost and that sending is paused; the composer stays present and accepts input, and queued sends render as pending rows in place. **Authored**                    | Banner slot; `pending`          |
| Disconnected        | The same banner, distinguished by naming the transport rather than the network, plus each affected region's own live data marked stale rather than blanked. **Authored**                                                                                                       | Banner slot                     |
| Reconnecting        | The banner's sentence changes to state that reconnection is in progress, with an in-place spinner on the banner's own retry-now control; no region is blanked and no overlay is drawn. **Authored**                                                                            | In-place control loading        |
| Retrying            | The individual item retries in place: a queued send keeps its row and renders `pending`, then resolves or reports a transient failure. Backoff is invisible; only the row's own state changes. **Authored**                                                                    | `pending`; transient failure    |
| Rate-limited        | A transient failure pill stating that the action was refused for now and will be accepted shortly; where a form hosts the action, presentation 6 of the validation table instead, so the message sits with the control it concerns. **Authored**                               | Transient failure; validation 6 |
| Quota-exceeded      | A form-level callout above the fields, in the advisory-callout anatomy, stating which limit was reached and what it applies to, with the primary de-emphasised. Not a transient pill: the condition persists, so a self-clearing presentation would misreport it. **Authored** | Advisory callout; validation 3  |
| Throttled           | No new presentation. The control that initiated the action renders as an in-place loading control for the duration and resolves normally, because a deliberate slowdown that the viewer can do nothing about is not a failure. **Authored**                                    | In-place control loading        |
| Not-found, resource | An empty-state block in the text-only composition, naming what could not be found and offering one route back to a surface that exists. **Authored** — see below                                                                                                               | Empty, text-only                |
| Not-found, route    | The page-level failure presentation, with the authored sentence naming the address rather than a cause. **Authored**                                                                                                                                                           | `failure-page`                  |

**Why not-found is authored rather than derived.** The corpus does contain a
page-level failure surface, and it is instructive precisely because of what it lacks:
it states that the cause is **unknown** rather than naming a missing resource, and it
carries **no status code** (`21-states.md` L469). It also offers no retry control and
states no cause at all (`21-states.md` L251, L585). So the observed page is evidence
for a _generic_ failure surface and evidence _against_ reading it as a not-found
surface. A resource-specific not-found presentation is therefore authored, and the two
rows above keep them apart: a missing resource inside a working surface is an empty
region, and a missing surface is a page.

One more absence carried from the observed page: its illustration is drawn from a set
of at least two and is selected **per render rather than per error** (`21-states.md`
L457). The artwork is data with more than one member and is not coupled to the failure,
so a build that binds one scene to one error class has read a correlation the corpus
explicitly denies.

### The transient failure pill, recorded precisely

This one is recorded in detail because the way to get it wrong is to add affordances
that do not exist. The observed form is a rounded pill on an inverted surface, floating
at the foot of the content region, carrying one sentence that states something went
wrong and invites a retry — and **no undo, no dismissal affordance and no button of any
kind**. The retry invitation is plain sentence text rather than a link
(`21-states.md` L132, `03-messaging-and-composer.md` L639).

The related negative finding is equally precise: **no frame shows a transient pill
being dismissed by the viewer, and none of the four observed variants carries a
dismissal affordance** (`21-states.md` L479). That the pill clears on its own is
evidence from adjacent captures — it is present in one and absent from the one before
it, with nothing on it that could have dismissed it — rather than evidence from a
control.

Four properties follow, and the last two are accessibility consequences of the first
two rather than additions to them:

- **It carries no control.** Not a dismiss, not an undo, not a retry. Undo is a
  property of the _action_ being reversible and belongs to the confirmation variants;
  two of the four observed variants carry no control at all (`21-states.md` L315).
- **Its position is a property of the caller, not of the component.** It is observed at
  the content region's trailing corner and at the centre of that region's foot, so a
  build that hard-codes one corner cannot reproduce both (`21-states.md` L450).
- **It is announced through a live region.** Because it cannot be dismissed manually
  and clears on its own, a viewer who is not looking at that corner has no other way to
  learn of it. `packages/ui/src/hooks/useLiveRegion.ts` is the single implementation,
  and a failure is announced assertively while a confirmation is announced politely.
- **It must not trap focus and must not take focus.** It carries nothing focusable, it
  appears without the viewer having asked for it, and it disappears on its own — so
  moving focus into it would strand focus when it cleared. Focus stays where the viewer
  put it.

A fifth property is a direct consequence of the pill being non-blocking: the surface
behind it stays usable (`21-states.md` L245). So the pill does not intercept pointer
events, and the region beneath it remains operable at every point the pill covers.
This is where the two catalog documents disagree, and the disagreement is carried
rather than reconciled: the state document places the pill _clear of the composer_
(`21-states.md` L99), while the messaging document records the same pill on the same
frame as wide enough to cover the send control's footprint
(`03-messaging-and-composer.md` L639). Both readings are recorded. Neither is asserted
over the other, and neither needs to be, because the requirement that satisfies both
is the same one: the pill is non-blocking and transparent to input, so whether or not
it overlaps a control, the control stays operable. `docs/decisions/catalog-defects.md`
is the register where a contradiction of this kind is filed, and this paragraph is the
detail that register points at rather than restates.

**A durable alternative exists and must not be confused with the pill.** After a
bulk action, a **full-width flat bar** is docked at the very foot of the content region
carrying its sentence and an undo link — not a floating pill, and not at a corner
(`21-states.md` L317). It is a different presentation with a different lifetime, and
implementing one of them for both loses the distinction.

### Service health is recorded as an absence

The public status surface's own panel header carries a legend of **five** health
levels, each with its own glyph. **Only one of the five is ever observed applied to a
row**: every service row reads the no-issues state, and the remaining four appear in
the legend alone (`21-states.md` L168, L473).

The finding is recorded as absence rather than smoothed away, and the build consequence
is the one the specification draws: the legend is the corpus's own enumeration of the
vocabulary, so a build implements **all five** levels and renders four of them from
data it has no captured example of. Each level carries a distinct glyph as well as a
distinct treatment (`00-product-overview.md` L343), which is what keeps the level
readable without colour perception. The public status surface itself belongs to a
deferred phase; the five-level vocabulary is recorded here because it is a state set
and this is where state sets live.

## How each of these is proved

**No criterion in this record is marked satisfied without a passing test behind it.**
That is the uncertainty rule's closing requirement, and it applies with particular
force to the authored families, because an authored presentation has no frame to be
checked against — a test is the only thing that can hold it to what this record says.

The counts are what make this mechanical. Each row below states the obligation, the
count that must hold, and where the assertion lives.

| Obligation                                                                                         | Count | Where it is asserted                                                                    |
| -------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------- |
| The state union declares every member, and the four loading members stay four                      | 18    | The state module's own co-located test under `packages/ui/src/state/`                   |
| Loading shapes render distinguishably, each preserving what it must                                | 4     | Component tests co-located with the contracts that render them, one assertion per shape |
| Empty compositions are all expressible from one implementation                                     | 4     | The empty-state contract's co-located test                                              |
| The conversation hero renders with messages beneath it                                             | 1     | `e2e/specs/states.spec.ts`, asserting the hero present in a populated conversation      |
| Validation presentations are distinguishable, with correct value survival and primary-action state | 6     | The validation contract's co-located test, one case per presentation                    |
| The no-message presentation gates and ungates a primary from control state alone                   | 1     | The validation contract's co-located test, plus an end-to-end pass over a real form     |
| Read-only presentations replace rather than disable, and reversal is atomic                        | 2     | `e2e/specs/channels.spec.ts` and `e2e/specs/states.spec.ts`                             |
| The four gating kinds are distinguishable from one another                                         | 4     | `e2e/specs/gated-states.spec.ts`, whose whole purpose is that these four stay four      |
| A role-gated control's activation is refused by the server                                         | —     | `apps/api/test/integration/authz/`, which owns the denial suite                         |
| Each authored family renders its specified presentation                                            | 9     | `e2e/specs/states.spec.ts`, driving each family from a forced condition                 |
| The transient pill carries no control, announces politely or assertively, and never takes focus    | 1     | The toast contract's co-located test, plus the accessibility pass                       |
| No surface renders a whole-surface blocking overlay                                                | 0     | `e2e/specs/states.spec.ts`, asserting the absence across every Phase-1 route            |
| Focus rings are present, unclipped and outside the border                                          | —     | The accessibility pass in `e2e/a11y.spec.ts`, plus per-contract component tests         |

Three notes on how those assertions are written, because the shape of the test matters
as much as its existence:

- **A count is asserted as a count.** "Four loading shapes exist" is checked by
  exercising four and asserting four distinct renderings, not by reading the type. A
  type with four members and one implementation would pass the weaker check.
- **An absence is asserted as an absence.** The whole-surface-overlay prohibition is
  the one obligation whose target count is zero, and it is asserted by walking every
  route and finding none — the only way an absence can be proved by test.
- **Each test cites its criterion inline**, in the citation form the build prompt
  fixes, so `docs/decisions/ac-manifest.md` can be regenerated by reading the tests
  rather than by trusting a list. The thirty-eight criteria the state document
  publishes are the source for this record's share of that manifest.

## Where this vocabulary is implemented, and where it may not be

The single-implementation rule — the first as provided — governs this record's whole
shape, and it has three consequences here.

**These states belong to the shared contracts, not to the surfaces that show them.**
Every presentation above is implemented once, in `packages/ui`, by the contract whose
regions, variants and states cover it. `apps/web` composes those contracts and
supplies data; it does not own a state rendering. A feature directory that renders its
own empty block, its own skeleton, its own validation message or its own read-only bar
has created a second implementation of a shared contract, and the boundary rule in
`eslint.config.js` fails the build on exactly that — which is what makes this a
mechanical property rather than a review comment. Consumption is through the package
barrel only; a deep import into a component directory is a lint error.

**A missing state is added by extending the shared contract and updating its tests.**
Not by forking it, and not by adding a local variant beside the call site that needs
it — even when only one variant is needed. The nine authored families above are the
largest instance of this: none of them is a new component. Each reuses a shape an
existing contract already renders, as the _Reuses_ column records, and each therefore
lands as a new variant of that contract together with the test that holds it. Where a
structure genuinely has no contract, `docs/decisions/component-extensions.md` decides
between a new variant and a new identifier — and never a merge.

**Similar presentations are not merged, and this record's structure is that rule
applied.** Every section above exists because two things that look alike are
different: four loading shapes rather than one spinner; four empty compositions rather
than one illustrated block; six validation presentations rather than one error message;
two read-only presentations rather than one disabled surface; four gating kinds rather
than one greyed-out control. Each of those splits is a place where merging would
produce a build that renders one situation where the specification renders another. The
count in each heading is there so the merge is visible if it ever happens.

## Preserved inconsistencies and recorded absences

Carried rather than reconciled, because the disagreement is the finding. Each row
states what differs and what a build must therefore do.

| What differs                                                                                                       | Consequence for the build                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where a transient pill sits — the region's trailing corner, and the centre of its foot                             | Position is a property of the caller. A build that hard-codes one corner cannot reproduce both (`21-states.md` L450)                                                             |
| Whether the pill overlaps the composer — the two catalog documents disagree on one frame                           | Neither reading is chosen. The pill is non-blocking and transparent to input, which satisfies both (`21-states.md` L99 against `03-messaging-and-composer.md` L639)              |
| How a count of zero renders — an explicit zero, and omitted entirely on a tab that shows a count when it has items | Two conventions coexist. Zero-rendering is a per-surface decision rather than a global one (`21-states.md` L451)                                                                 |
| Whether a rejection gates the form's primary                                                                       | Gating belongs to the form, not to the validation contract; both behaviours must be expressible (`21-states.md` L452)                                                            |
| Whether a rejected value survives                                                                                  | Retention is per field and per rejection reason; secrets and one-time codes are the cleared cases (`21-states.md` L453)                                                          |
| What a destructive confirmation requires — two preconditions in one case, none in another                          | The precondition set belongs to the action, not to the dialog. One rule for every destructive action loses the reversibility signal (`21-states.md` L454, `02-channels.md` L365) |
| A field captioned as optional whose form's primary is nevertheless de-emphasised while it is empty                 | Recorded as observed. The caption is authored copy and is not the source of the gating condition (`21-states.md` L455)                                                           |
| Whether the entitlement upsell strip appears above a result set — present on two tabs, absent on two               | Scoped to result types rather than to the surface. Why those two is not evidenced (`21-states.md` L456)                                                                          |
| The illustration behind the page-level failure — two scenes behind an identical card                               | The artwork is data with more than one member, selected per render and not coupled to the failure (`21-states.md` L457)                                                          |

And the absences, recorded as absences so that a reader can tell an unobserved state
from an unimplemented one. In every case the state ships; only the evidence is missing.

| Absence                                                                               | How this record treats it                                                                                                  |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| No whole-surface blocking overlay or spinner anywhere in the corpus                   | Turned into a prohibition, because loading is observed four times and never at surface scope                               |
| No hover treatment for the great majority of contracts — four cases are claimed       | Stated as a corpus gap, not as a statement that no hover exists. Other hovers are authored from the two evidenced patterns |
| No focus traversal, no skip link, no focus containment, no focused checkbox or radio  | Tab order, containment and restoration are build decisions; the one evidenced restoration case is honoured                 |
| No offline, disconnected, reconnecting or retrying state                              | Authored above; registered in `docs/decisions/gap-register.md`; protocol in `docs/decisions/realtime-contract.md`          |
| No rate-limited, quota-exceeded or throttled state                                    | Authored above. The observed elapsed-over-limit readout is a duration display, not a refusal (`21-states.md` L467)         |
| No not-found surface for a missing resource                                           | Authored above, in two forms, because the observed failure page states an unknown cause and no status code                 |
| No error state on a public page other than the failure page itself                    | Recorded. Public surfaces belong to a deferred phase; the failure page is the only one in scope                            |
| Four of five service-health levels never applied to a row                             | All five implemented; four render from data with no captured example                                                       |
| No transient pill dismissed by the viewer, and no dismissal affordance on any variant | The pill carries no control and clears on its own; announced through a live region instead                                 |

## Authoring conventions observed by this record

- **Authored prose only.** No third-party product name appears in the text, the
  headings, the file name or any link label. No message, heading, label or button
  caption is transcribed from a frame; each presentation is described by what it
  communicates and where that communication sits, and the wording itself is authored
  in `packages/shared/src/copy/en.ts`.
- **Frames by number alone.** Every citation names a bare integer. No filename and no
  percent-encoded citation form appears, because both carry a prohibited product name.
- **No colour value.** Treatments are named semantically and resolve to tokens in
  `docs/decisions/theme-and-color.md`, which is also the only place the thirteen
  literals are declared.
- **No sample entity names.** The conversation names, person names and role labels
  visible in the corpus illustrate shape only. Every example here uses a description or
  no name at all, and reproducing one as a fixture or as seed data is prohibited.
- **No diagram.** The state document draws its lifecycle as a Mermaid diagram; this
  record deliberately does not. The committed documentation-site configuration is a
  read-only input, and while it declares a diagram plugin alongside the documentation
  plugin, it configures no Markdown extensions to bridge them — so the fenced-block
  extension the documentation plugin brings claims the fence first and the diagram
  plugin never sees it, and a diagram here would publish as unrendered source. Tables
  and prose carry the same information and render everywhere, so nothing is lost by
  not drawing one.
- **Evidence by citation, and absence recorded as absence.** A claim about the corpus
  names the frame or the specification line it came from. A state the corpus does not
  show is listed as unobserved and marked authored, never presented as though it had
  been read from a capture.
- **Inconsistencies preserved.** Where two captures or two documents disagree, both
  readings are recorded and neither is asserted over the other, so a later reader sees
  the contradiction instead of inheriting a silent choice.
- **Zero frames opened.** Every fact above was resolved from catalog prose. The
  corpus was not surveyed, enumerated, sampled or scanned, and no frame was opened to
  confirm something the specification already states.
