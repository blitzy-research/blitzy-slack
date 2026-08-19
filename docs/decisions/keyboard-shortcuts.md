# The keyboard contract: which bindings the frame settled, which this build chose, and why operability is a separate obligation

This record sits on the narrowest permission in the whole rule set, and the value of the
record is entirely in how precisely it holds that line.

The identity rule — the fifth in the order the rules were provided — prohibits
reproducing another company's identity anywhere in this repository, and it prohibits
transcribing that company's interface copy even where the copy is plainly legible in a
frame. It then grants exactly one exception: **key bindings are function rather than
identity and may be transcribed; the labels, headings and copy around them may not.** A
key combination is a mechanism. A sentence describing it is authorship. This record
transcribes the first and authors the second, and it marks which is which on every single
row so that the division is auditable rather than asserted.

Two facts make that division load-bearing rather than decorative. The catalog's own prose
for the flow that opens the reference pane names **zero keys** — it names the functions
and describes the pane's structure, but not one combination
(`00-product-overview.md` L121-L144). And the capture that does show the combinations is
**clipped by the foot of the viewport**, so part of the map was never photographed
(`00-product-overview.md` L144). The consequence is unavoidable and is stated here rather
than smoothed over: this map is **part transcribed and part authored**, and a reader who
needs to know which half a given binding came from can read it off the row.

| Field                               | Value                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Record type                         | Decision record for the keyboard contract — the binding map, the authored labels, and the register of invented bindings                                            |
| Status                              | Operative. Authored **before** the binding registry, the reference pane and the surfaces that handle keys exist                                                    |
| Countable obligations               | **48** map rows — **19** transcribed, **29** invented · the 29 recorded as **18** decisions · **5** map groups · **4** criteria automated scanning cannot judge    |
| Primary specification source        | `00-product-overview.md` L121-L144, the catalog's only enumeration of the shell's keyboard contract                                                                |
| Secondary sources                   | `03-messaging-and-composer.md` L137 and L515 for the send convention; `21-states.md` L120-L121 and L463 for focus treatment and for what focus evidence is missing |
| Frames opened to author this record | **1** — frame 338. See [Frame access this record caused](#frame-access-this-record-caused)                                                                         |
| The pane is which contract          | The reference and data table in its label-and-keys form, hosted by the docked details pane. **Neither is new** — see `docs/decisions/component-extensions.md`      |
| Bindings are declared at            | `packages/ui/src/keyboard/registry.ts`, read by both the handlers and the pane                                                                                     |
| Every label comes from              | `packages/shared/src/copy/en.ts`                                                                                                                                   |
| Companion records                   | `docs/decisions/frame-access-log.md`, `docs/decisions/component-extensions.md`, `docs/decisions/placeholder-surfaces.md`, `docs/decisions/state-matrix.md`         |

**How this record cites.** A document citation names a file under `docs/workflows/` with
its line number, so a bare `README.md` below always means the catalog index in that
directory and never the one at the repository root. A frame is cited by its **number
alone** — "frame 338", never a filename and never the catalog's percent-encoded citation
form, because every filename in the corpus embeds a third-party product name and writing
one here would breach the identity rule this record is otherwise observing. Rules are
cited by **subject together with position** in the order they were provided, never by
their platform identifiers: each identifier itself contains the prohibited product name.
For the record, the shared-component rule is the first as provided, the authorization rule
the second, the corpus-handling rule the third, the uncertainty rule the fourth, and the
identity rule the fifth.

## The division this record is built on

The rule draws one line. This section states where it falls, in both directions, because a
reviewer auditing this file needs to be able to check it mechanically.

| Kind of content                                               | May it be transcribed? | How it is produced here                                                            |
| ------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| A key or a key combination                                    | **Yes**                | Read from frame 338 and reproduced exactly, or read from catalog prose             |
| The sentence naming what a binding does                       | No                     | Authored from the **behaviour**, not from any text legible beside the binding      |
| A group caption over a set of bindings                        | No                     | Authored; the five group names below are this build's own                          |
| The pane's title, its help affordance's wording, its row copy | No                     | Never reproduced at all; the pane's strings are authored in the shared copy module |
| A destination's name                                          | No                     | Named functionally by what the destination does                                    |

The failure mode the rule exists to prevent is subtle and worth naming, because it does
not feel like a violation while it is happening: a phrase gets written because it reads
well, and it reads well because it was read a moment earlier in a frame. Every label in
the map below was therefore written from the _behaviour the binding performs_ — from what
the build must do when the keys are pressed — and not from the pane. Where the catalog
already described a function in its own words, this record still phrases the label
independently, because the catalog's phrasing is a reading of the same pixels and
inheriting it would launder the transcription rather than avoid it.

One consequence is worth stating plainly. **The labels in this record and the strings the
pane renders are not the same artifacts.** This record's labels exist so a reader can tell
what a binding does; the pane's strings live in `packages/shared/src/copy/en.ts` and are
authored there. Neither is derived from the frame, and neither is derived from the other.

## The evidentiary position

Three statements fix what this record can and cannot claim, in the order they constrain
the work.

- **The prose settles the functions and not the keys.** The flow's overview, trigger and
  step table describe a pane that docks to the right of the content region and lists the
  shell's shortcuts grouped by the region they act on, and the step table records that a
  lead row pairs a combination with a statement about the pane itself while the rows
  beneath pair a label at the left with one or more chips at the right
  (`00-product-overview.md` L140). The functions are enumerated in prose
  (`00-product-overview.md` L142). Not one key is named. A sweep for every plausible key
  token across all twenty-five catalog documents returns nothing for the control key, the
  primary modifier in either spelling, the shift key, the escape key, the tab key and the
  arrow keys alike. The only hits belong to the catalog's audit of **its own
  documentation site's** navigation drawer (`README.md` L987-L1045), which is not the
  product and is not evidence about it.
- **The capture is clipped, so the evidence is partial by construction.** The catalog
  records the clipping itself: the navigation group runs off the foot of the viewport, so
  any binding below the fourth destination "is not visible in this capture and is not
  recorded here" (`00-product-overview.md` L144). The pane is scrollable; the frame is
  not. What lies below the fold is not merely unread — it is unphotographed, and no amount
  of care with the one frame recovers it.
- **Therefore the map is marked per row.** Every row carries a `Source` value of
  **transcribed** or **invented**. There is no third value and no blank. Where a binding
  was recovered from the frame it says so; where this build chose it, it says that
  instead, and the choice is repeated in
  [The invented-bindings register](#the-invented-bindings-register) with the alternatives
  that were considered.

The uncertainty rule — the fourth as provided — decides what happens to the clipped
remainder, and it decides it against omission. A shortcut left unimplemented because its
combination was below the fold would be a breach, not a caution. The remainder is
therefore completed from standard platform convention, implemented as working
functionality, and recorded as a decision.

## Frame access this record caused

**One frame was opened: frame 338.** This record is the reason, and the entry in
`docs/decisions/frame-access-log.md` is the record of it. The two files must agree, and
they do; if they ever diverge, that log is the authority on what was read.

| Field                             | Value                                                                                                                                                                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame                             | 338                                                                                                                                                                                                                         |
| Task                              | Authoring this record — recovering the shell's key bindings for the map below                                                                                                                                               |
| Authorizing clause                | **(b)**, the frame is named in `docs/decisions/measurement-manifest.md` as row 19. Clause **(a)** holds independently: the step table of flow `00.4` cites this frame and its prose is not sufficient to implement the step |
| What the catalog failed to answer | **Which keys?** The prose names every function in the pane and no combination for any of them, so no further reading of `docs/workflows/` yields a binding                                                                  |
| What was taken from the frame     | Key bindings only. No label, caption, colour value or icon was read across, and nothing was sampled                                                                                                                         |
| Frames opened for this task       | 1, against a cap of 6                                                                                                                                                                                                       |

Three things about that access are worth recording, because each is a place a reviewer
could reasonably suspect a shortcut was taken.

- **The prose was exhausted first, not skipped.** The open followed a search of the
  catalog rather than preceding one, which is the sequence the corpus-handling rule
  prescribes. The search is reproducible: the token sweep described above is the evidence
  that the prose has no keys in it.
- **The frame was resolved by number, not by name.** The path was recovered at run time by
  matching a trailing integer with a brand-free pattern, which is the same hinge the
  measurement tool uses and the reason no filename appears in this record or in any source
  file. Nothing under the read-only paths was modified, moved, renamed or re-encoded, and
  the corpus remains 1,022 files.
- **One frame, not a survey.** No adjacent frame was opened, no directory was enumerated
  and no pattern was matched across the corpus. The pane's own contents were the whole
  question, and one frame is where they are.

The two records that had previously asserted that every decision record was authored
without opening a frame have been corrected to name this exception, rather than left to
disagree with this one. A stale claim in a companion record is worth less than an accurate
one, and the correction is smaller than the confusion it prevents.

## The modifier convention, stated once

The frame was captured on one host platform, and its chips therefore show that platform's
keys. Writing the map in those glyphs would make a platform-specific claim the corpus
cannot support for the other platform, and writing it twice would produce two tables that
drift apart. So the map is written in terms of one abstraction, defined here and used
everywhere below.

| Term in the map | Resolves to                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| `Primary`       | The platform's primary application modifier — the command key on one host, the control key on the other |
| `Shift`         | The shift key on both hosts                                                                             |
| `Alt`           | The secondary modifier — the option key on one host, the alt key on the other                           |
| `Ctrl`          | The control key **literally, on both hosts**. See the carve-out below                                   |

**The carve-out is not a detail, and it is the single most consequential thing frame 338
settled.** The numbered destination bindings use a **literal control key even on the host
whose primary modifier is the command key** — the two appear side by side in the same
capture, one row using the control key with a digit and the very next row offering the
command key with a letter as an alternative. That is a fact about the product, not an
artifact of the platform, and normalising it into the abstraction would have destroyed it.
No authored map would have produced it: the obvious guess is that the numbered family
follows the primary modifier, and the obvious guess is wrong. `Ctrl` below therefore means
the control key and never resolves to anything else.

Two consequences follow, and both are checked in
[The collision check](#the-collision-check).

- On the host where the primary modifier _is_ the control key, `Primary` and `Ctrl`
  collapse onto one physical key. The map stays unambiguous there only because the
  numbered family uses digits while every `Primary` binding in the same scope uses a
  letter, a bracket, a slash or an arrow — and where a digit is used for formatting it
  carries the shift key as well.
- A binding written `Primary` must be read as an abstraction by the implementation too.
  The registry stores the abstract modifier and resolves it once, at the point where a key
  event is matched, rather than storing two tables.

## The pane is an existing contract, not a new component

The reference pane is **not** a new component, and building one for it would breach the
shared-component rule — the first as provided. Two contracts that already exist compose
it, and the inventory says so in their own rows.

| What                       | Which contract                                                                                                                                                                                        | Where it lives                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| The label-and-keys listing | The reference and data table, whose own row carries "label-and-keys reference table grouped under headings, with the label column at the left and chips at the right" (`00-product-overview.md` L343) | `packages/ui/src/components/DataTable`   |
| The pane that hosts it     | The details pane in its docked form, a fifth shell region taking its width from the content region (`00-product-overview.md` L307)                                                                    | `packages/ui/src/components/DetailsPane` |

`docs/decisions/component-extensions.md` places the reference and data table in this phase
for exactly this reason and names this record as the place its bindings are settled. The
division of labour between the two records is therefore fixed: that record owns whether a
structure is a contract, a variant or a new identifier; this record owns the bindings, the
labels and the provenance of each.

The pane also inherits the docked pane's evidenced behaviour rather than inventing its
own. It takes its width from the content region and leaves the rail and sidebar untouched,
and it **clips its own content at the viewport foot rather than reflowing the shell**
(`00-product-overview.md` L862). That is the same clipping that truncated the evidence, and
it is a property to reproduce rather than a defect to fix.

**Key handling is shared behaviour, not a per-surface concern.** No feature directory
registers its own key listener. Overlay dismissal and focus restoration belong to the
shared hooks — `packages/ui/src/hooks/useFocusTrap.ts` owns containment and restoration,
and every overlay contract consumes it — and the bindings themselves are declared once in
the registry named above. A surface that handled its own keys would produce a second
implementation of behaviour the shared library already owns, which is the failure the
first rule exists to prevent, and it would let the pane and the handlers disagree about
what the product does.

## The map

Five groups, 48 rows. Every row carries a `Source` of **transcribed** or **invented**, and
every invented row carries the convention it follows. The `Scope` column is not decoration:
several bindings reuse the same keys at different scopes, and the scope is what keeps them
from being a collision — see [The collision check](#the-collision-check).

The arithmetic of the map, so it can be checked rather than trusted: **19 transcribed** and
**29 invented**. Of the 19, eighteen were read from frame 338 and one from catalog prose.
The 29 invented rows are recorded as **18 decisions** in
[The invented-bindings register](#the-invented-bindings-register), because a directional
pair is one decision rather than two.

### Global navigation

| Binding               | Authored label                           | Scope                                                  | Source       | Rationale or provenance                                                                                                                                                                                                                                                     |
| --------------------- | ---------------------------------------- | ------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Primary + /`         | Show or hide the shortcut reference pane | Anywhere in the authenticated shell                    | transcribed  | Frame 338's lead row, which the step table records as pairing a combination with a statement about the pane itself (`00-product-overview.md` L140)                                                                                                                          |
| `Primary + K`         | Open the conversation switcher           | Anywhere in the authenticated shell                    | transcribed  | Frame 338. The function is the one the prose calls jumping to a conversation (`00-product-overview.md` L142)                                                                                                                                                                |
| `Primary + [`         | Return to the previously viewed surface  | Anywhere in the shell, while no text input holds focus | transcribed  | Frame 338. Corroborated by the top bar's own history controls, which the pane independently evidences (`00-product-overview.md` L125)                                                                                                                                       |
| `Primary + Left`      | Return to the previously viewed surface  | Anywhere in the shell, while no text input holds focus | transcribed  | Frame 338, the second of the two forms the acceptance criterion requires to work (`00-product-overview.md` L904)                                                                                                                                                            |
| `Primary + ]`         | Advance to the next viewed surface       | Anywhere in the shell, while no text input holds focus | transcribed  | Frame 338                                                                                                                                                                                                                                                                   |
| `Primary + Right`     | Advance to the next viewed surface       | Anywhere in the shell, while no text input holds focus | transcribed  | Frame 338, the second form of the same function                                                                                                                                                                                                                             |
| `Shift + Primary + Y` | Open the availability-status editor      | Anywhere in the authenticated shell                    | transcribed  | Frame 338. The target is not a Phase-1 surface — see [Transcribed bindings whose target is not built yet](#transcribed-bindings-whose-target-is-not-built-yet)                                                                                                              |
| `Shift + Primary + F` | Move focus to the top bar's search field | Anywhere in the authenticated shell                    | **invented** | The shift-primary-F combination is the editor convention for a search across a whole workspace rather than the current document. The unshifted form belongs to the host browser's find-in-page and is left to it, and `Primary + K` is already transcribed for the switcher |
| `F6`                  | Move focus to the next shell region      | Anywhere in the authenticated shell                    | **invented** | The long-standing platform convention for cycling focus between the panes of one application window. It carries no modifier, so it cannot displace a transcribed combination                                                                                                |
| `Shift + F6`          | Move focus to the previous shell region  | Anywhere in the authenticated shell                    | **invented** | The reverse of the row above, by the same convention                                                                                                                                                                                                                        |

The shell has four regions plus a fifth that docks, and the region cycle visits them in
their reading order — top bar, rail, sidebar, content region, and the docked pane when one
is open (`00-product-overview.md` L302, L307). This is the binding that makes the shell
navigable without a pointer at all, which is why it exists even though no frame evidences
it: the corpus shows the focus treatment but never the traversal that produces it
(`21-states.md` L463), so a build that waited for evidence here would ship a shell that
could only be entered with a mouse.

### Conversation navigation

| Binding                 | Authored label                                             | Scope                               | Source       | Rationale or provenance                                                                                                                                                                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------- | ----------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Ctrl + 1`              | Go to the conversation home destination                    | Anywhere in the authenticated shell | transcribed  | Frame 338. Note the literal control key, not `Primary` — see [The modifier convention, stated once](#the-modifier-convention-stated-once)                                                                                                                                                                        |
| `Ctrl + 2`              | Go to the person-to-person conversation destination        | Anywhere in the authenticated shell | transcribed  | Frame 338                                                                                                                                                                                                                                                                                                        |
| `Shift + Primary + K`   | Go to the person-to-person conversation destination        | Anywhere in the authenticated shell | transcribed  | Frame 338, the second form of the row above. This one _does_ use the primary modifier, which is why the carve-out matters                                                                                                                                                                                        |
| `Ctrl + 3`              | Go to the aggregated activity destination                  | Anywhere in the authenticated shell | transcribed  | Frame 338                                                                                                                                                                                                                                                                                                        |
| `Ctrl + 4`              | Go to the saved-items destination                          | Anywhere in the authenticated shell | transcribed  | Frame 338, the last row visible before the capture is clipped                                                                                                                                                                                                                                                    |
| `Ctrl + 5` … `Ctrl + 9` | Go to the rail destination at that position                | Anywhere in the authenticated shell | **invented** | A positional continuation of a transcribed family. The frame evidences positions one to four and the capture is clipped below the fourth (`00-product-overview.md` L144), so the rule the family expresses is implemented for every position the rail can hold rather than stopping where the photograph stopped |
| `Alt + Down`            | Move to the next conversation in the sidebar order         | Anywhere in the authenticated shell | **invented** | The secondary modifier with a vertical arrow is the platform convention for moving between sibling items in a list. It also mirrors the axis logic the transcribed bindings already establish: the horizontal arrows act on the sidebar's width, so the vertical pair is free for its contents                   |
| `Alt + Up`              | Move to the previous conversation in the sidebar order     | Anywhere in the authenticated shell | **invented** | The reverse of the row above, by the same convention                                                                                                                                                                                                                                                             |
| `Alt + Shift + Down`    | Move to the next conversation carrying unread messages     | Anywhere in the authenticated shell | **invented** | The same traversal narrowed to a subset by adding the shift key, which is the conventional way to express "the same movement, filtered"                                                                                                                                                                          |
| `Alt + Shift + Up`      | Move to the previous conversation carrying unread messages | Anywhere in the authenticated shell | **invented** | The reverse of the row above                                                                                                                                                                                                                                                                                     |

The unread pair is worth a note because it depends on something this build computes rather
than stores. Unread state is derived per viewer from that viewer's read cursor and is never
a denormalized counter, so "the next conversation carrying unread messages" is a question
answered per session and never a shared property of the conversation. The binding is
therefore per-viewer by construction, which is the same placement rule the data model
applies to every other per-viewer fact.

### Composer and formatting

| Binding                     | Authored label                                | Scope                                                           | Source       | Rationale or provenance                                                                                                                                                                                                                                                                                                           |
| --------------------------- | --------------------------------------------- | --------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Return`                    | Send the draft                                | The composer's input, on a host surface that owns a send action | transcribed  | Catalog prose, not the pane: the bare return is the send (`03-messaging-and-composer.md` L137). This is the one transcribed binding that came from a document rather than from a frame                                                                                                                                            |
| `Shift + Return`            | Insert a line break in the draft              | The composer's input                                            | **invented** | The **pairing** is transcribed and the **modifier is chosen**. Prose settles that a modifier-plus-return combination adds a new line while the bare return sends (`03-messaging-and-composer.md` L137) but never names which modifier; the shift key is the platform-standard line-break gesture in an input that sends on return |
| `Up`                        | Reopen the most recent message for editing    | The composer's input **while it is empty**                      | transcribed  | Frame 338                                                                                                                                                                                                                                                                                                                         |
| `Primary + Up`              | Reopen the most recent message for editing    | The composer's input **while it is empty**                      | transcribed  | Frame 338, the second form of the row above                                                                                                                                                                                                                                                                                       |
| `Primary + Z`               | Withdraw the most recent message              | The composer's input **while it is empty**                      | transcribed  | Frame 338. While the input holds content the editor's own undo applies instead — see the note below                                                                                                                                                                                                                               |
| `Primary + B`               | Bold the selection                            | The composer's input                                            | **invented** | One of the two most universally standardised text-formatting bindings there are                                                                                                                                                                                                                                                   |
| `Primary + I`               | Italicise the selection                       | The composer's input                                            | **invented** | The other of that pair                                                                                                                                                                                                                                                                                                            |
| `Shift + Primary + X`       | Strike through the selection                  | The composer's input                                            | **invented** | The conventional binding for struck-through text in editors that expose it. The unshifted primary-X combination belongs to cut and is left alone                                                                                                                                                                                  |
| `Shift + Primary + U`       | Turn the selection into a link                | The composer's input                                            | **invented** | The conventional link binding is `Primary + K`, which is already **transcribed** at a wider scope, and a transcribed binding wins. The letter maps to the destination the link editor asks for                                                                                                                                    |
| `Shift + Primary + 7`       | Number the selected lines                     | The composer's input                                            | **invented** | The digit family for list marks is a long-standing word-processor convention, and the digits sit adjacent in the order the toolbar groups the marks                                                                                                                                                                               |
| `Shift + Primary + 8`       | Bullet the selected lines                     | The composer's input                                            | **invented** | The second digit of that family                                                                                                                                                                                                                                                                                                   |
| `Shift + Primary + 9`       | Quote the selected lines                      | The composer's input                                            | **invented** | The third digit of that family, matching the toolbar's own placement of the quote mark after the two list marks                                                                                                                                                                                                                   |
| `Shift + Primary + C`       | Set the selection as fixed-width text         | The composer's input                                            | **invented** | The inline mark takes the letter; the block form below takes the same letter with the secondary modifier added, so the two marks the toolbar deliberately separates stay related without becoming interchangeable                                                                                                                 |
| `Shift + Primary + Alt + C` | Set the selected lines as a fixed-width block | The composer's input                                            | **invented** | The block form of the row above                                                                                                                                                                                                                                                                                                   |

**The nine marks are all nine, in the toolbar's own order.** The composer's formatting
toolbar is nine controls divided by four rules into five groups — bold, italic and
strikethrough, then link, then the two list marks, then the quote, then the two code marks
(`00-product-overview.md` L327). The rows above cover each of the nine exactly once and in
that sequence, so a reader can check the map against the contract by counting. The seven
controls of the composer's separate bottom action row are **not** in this table and are not
in this record: they are a different contract with a different grouping, and rendering or
binding one where the other belongs is a defect the first rule names explicitly.

**Send versus newline carries more weight than any other row here**, because it is a
behavioural invariant rather than a preference and because the product advertises it
continuously. The convention is: **the bare return sends, and `Shift + Return` inserts a
line break.** A hint sits immediately beneath the composer, right-aligned, and it is
present whenever the composer is focused or holds a draft — not transiently, but for the
whole time there is a draft to send (`03-messaging-and-composer.md` L515). Two things
follow, and neither is optional.

- **The hint's wording is authored copy and lives in `packages/shared/src/copy/en.ts`**,
  like every other string in the product. The frame shows a hint; what the hint _says_ here
  is written for this product. The hint's _content_ is derived from the registry, so the
  keys it names cannot drift from the keys the handler matches.
- **The send binding is scoped to surfaces that own a send action, and one Phase-1 surface
  does not.** The modal sub-composer has no send control of its own — the enclosing modal's
  footer owns the commit — so inside it the bare return cannot be a submit gesture, because
  there is no submit for it to perform. `docs/decisions/component-extensions.md` records
  this as one of the consequences that distinguishes that variant from the composer
  proper. In that surface the bare return inserts a line break and the footer's action is
  reached by focusing it. A build that bound the bare return to send unconditionally would
  give that surface two commit paths, or one that silently did nothing.

**Two transcribed bindings are scoped to an empty input, and that scope is doing real
work.** The frame lists the edit and withdraw bindings against an empty text input, and the
qualification is the whole reason they are safe: with content present, the up arrow moves
the caret and the primary-Z combination undoes an edit, which is what a text input is
expected to do. The bindings therefore apply only while the input is empty, and the
smallest coherent behaviour with content present is the platform's own — caret movement and
undo. This is a scope note rather than a further binding, and it is stated because an
implementation that missed it would break ordinary typing.

### Overlay and modal handling

| Binding       | Authored label                                            | Scope                                                                                | Source       | Rationale or provenance                                                                                                                                                                                                                                                      |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Esc`         | Close the topmost dismissible overlay                     | Any open menu, popover, typeahead, confirmation dialog, modal or docked pane         | transcribed  | Frame 338 lists this against dismissing dialogs. This build applies it to every dismissible overlay — a widening recorded under [Two transcribed bindings whose scope is widened](#two-transcribed-bindings-whose-scope-is-widened)                                          |
| `Return`      | Activate the focused item                                 | An open menu, typeahead or option list with a focused item                           | **invented** | The platform convention for activating what is focused. It is also consistent with the transcribed use of the bare return as the composer's commit gesture, so a bare return means "do the focused thing" throughout the product                                             |
| `Space`       | Activate or toggle the focused control                    | Any focused control that is not a text input, including a sidebar group's disclosure | **invented** | The platform convention for operating a button or a disclosure from the keyboard                                                                                                                                                                                             |
| `Tab`         | Move to the next control inside the modal's trapped order | An open modal                                                                        | **invented** | The platform convention for sequential traversal. Recorded as invented because the catalog evidences the focus ring but never the traversal that produces it (`21-states.md` L463)                                                                                           |
| `Shift + Tab` | Move to the previous control inside the trapped order     | An open modal                                                                        | **invented** | The reverse of the row above                                                                                                                                                                                                                                                 |
| `Down`        | Move to the next item                                     | An open menu or typeahead                                                            | **invented** | The convention for moving through a vertical list of options. The typeahead's own footer already advertises navigate, select and dismiss as functions without naming keys (`03-messaging-and-composer.md` L585), so the functions are evidenced and only the keys are chosen |
| `Up`          | Move to the previous item                                 | An open menu or typeahead                                                            | **invented** | The reverse of the row above                                                                                                                                                                                                                                                 |
| `Home`        | Move to the first item                                    | An open menu or typeahead                                                            | **invented** | The convention for jumping to the start of a list                                                                                                                                                                                                                            |
| `End`         | Move to the last item                                     | An open menu or typeahead                                                            | **invented** | The convention for jumping to the end of a list                                                                                                                                                                                                                              |
| `Left`        | Move to the previous tab                                  | A tab bar holding focus                                                              | **invented** | The convention for moving along a horizontal set of peer views. Distinct in scope from the transcribed resize pair, which requires the sidebar's resize handle to hold focus                                                                                                 |
| `Right`       | Move to the next tab                                      | A tab bar holding focus                                                              | **invented** | The reverse of the row above                                                                                                                                                                                                                                                 |

Dismissal and focus restoration are **shared behaviour and not per-overlay behaviour**.
`packages/ui/src/hooks/useFocusTrap.ts` owns containment while an overlay is open and
restoration when it closes, and every overlay contract consumes that hook rather than
handling the escape key itself. There is one evidenced restoration case the build must not
regress: a control that has been used **keeps its focus ring after the surface it opened
has closed**, while its neighbours in the same bar render without one (`21-states.md`
L121). So dismissal returns focus to the control that opened the overlay, and it renders
visibly focused when it gets there.

### Sidebar and rail

| Binding  | Authored label                                                                          | Scope                                     | Source       | Rationale or provenance                                                                                                                                                                                           |
| -------- | --------------------------------------------------------------------------------------- | ----------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Left`   | Narrow the sidebar                                                                      | The sidebar's resize handle holding focus | transcribed  | Frame 338, which lists the resize bindings against the resizer holding focus. The scope is transcribed along with the keys                                                                                        |
| `Right`  | Widen the sidebar                                                                       | The sidebar's resize handle holding focus | transcribed  | Frame 338, the second direction of the same pair                                                                                                                                                                  |
| `Return` | Activate the focused sidebar item — open a conversation, or toggle a group's disclosure | A sidebar item holding focus              | **invented** | The same activation convention as the overlay table's return row, recorded separately because a sidebar item is either a conversation row or a group header and the binding has to do the right one of two things |

That a sidebar group's disclosure must answer to **both** the return key and the space key
is not a stylistic preference, and the evidence for insisting on it comes from an unusual
place: the catalog audited its **own** documentation site and measured a nested navigation
disclosure that responded to one of the two and was inert to the other, with the keypress
falling through to the page as a scroll (`README.md` L987-L1002). That is a defect in a
different artifact, and it is recorded here as the reason this build requires both. The
space binding is the overlay table's general activation row applied to a disclosure rather
than a fourth binding in this group, which is why it is not repeated as a row.

The rail needs no binding of its own beyond the numbered family and the region cycle. Its
destinations are reachable positionally by the transcribed combinations, its overflow menu
is a menu and answers to the menu bindings, and focus reaches the region itself through
`F6`.

### Transcribed bindings whose target is not built yet

Five transcribed bindings point at capabilities this phase does not build. **None of them
is dropped.** A transcribed binding is evidence about the product, and a binding that
silently did nothing would be a dead control reached by the keyboard — the same defect as a
dead control reached by a pointer, and the reason
`docs/decisions/placeholder-surfaces.md` exists. Each one resolves to a surface that
renders and explains itself.

This table records **target resolutions, not invented bindings.** The keys were read from
the frame; only the question of where they land in this phase was decided here. That
distinction is why these rows are not in the register.

| Binding               | What it targets                                | Where it resolves in this phase                | Why                                                                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Primary + K`         | A switcher that reaches a conversation by name | The Phase-1 channel-browse surface             | That surface already performs the function — reaching a conversation by name, with filters — and a working surface is a better answer than a placeholder. A dedicated switcher overlay was rejected as scope beyond the enumerated Phase-1 surfaces |
| `Ctrl + 2`            | The person-to-person conversation destination  | The deferred destination at `/direct-messages` | Destination 2 of the sixteen, replaced in a later phase                                                                                                                                                                                             |
| `Shift + Primary + K` | The same destination by its second form        | The same placeholder                           | Two bindings for one function resolve to one surface, exactly as they would if the surface were built                                                                                                                                               |
| `Ctrl + 3`            | The aggregated activity destination            | The deferred destination at `/activity`        | Destination 9 of the sixteen                                                                                                                                                                                                                        |
| `Ctrl + 4`            | The saved-items destination                    | The deferred destination at `/activity`        | **There is no saved-items route.** The sixteen route segments are a closed enumeration and none of them is one, so this is a decision rather than a lookup — see the note below                                                                     |
| `Shift + Primary + Y` | The availability-status editor                 | The deferred destination at `/people`          | Editing a status belongs to the identity area, which owns that flow, and that area's destination is destination 10 of the sixteen                                                                                                                   |

**The saved-items binding is the one row here that required a choice, and it is recorded as
one.** The capability is owned by the same area that owns the aggregated activity feed —
the message overflow menu's save action names that area as the destination's owner
(`03-messaging-and-composer.md` L570) — and that area's deferred destination is
`/activity`. So the binding resolves there. Two alternatives were considered and rejected:
adding a seventeenth placeholder route, rejected because the sixteen are a closed
enumeration that another record owns and validates against; and leaving the binding
unregistered, rejected outright because the uncertainty rule forbids omitting a mechanism
whose target is uncertain. The consequence — two numbered bindings landing on one
placeholder — is accepted deliberately, and it disappears the moment either capability is
built.

One further point belongs here rather than in the register, because it is a fact about
authorization and not about keys. **A binding is not a permission.** Every one of these
resolutions passes through the same server-side check any other route does, evaluated
against the acting session and the specific target, and reaching a surface by keyboard
rather than by pointer changes nothing about that. The authorization rule — the second as
provided — is explicit that client rendering is never evidence of permission, and a key
combination is client rendering by another name.

### Two transcribed bindings whose scope is widened

Both of these keep their transcribed keys. What this build changed is where they apply, and
each widening is stated so a reviewer can see it was a decision rather than a drift.

| Binding                          | As the frame lists it | As this build applies it                                                         | Why                                                                                                                                                                                                                                                                                             |
| -------------------------------- | --------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Esc`                            | Dismisses dialogs     | Dismisses the topmost dismissible overlay of any kind, including the docked pane | The narrower reading would leave a member unable to close a menu, a popover or the reference pane itself from the keyboard, which contradicts the operability obligation below. Narrowing to dialogs alone would also make the escape key mean different things on surfaces that look identical |
| `Primary + [` `]` `Left` `Right` | Move through history  | The same, except while a text input holds focus                                  | On one host platform the same combinations move the caret within a text field. Overriding them would take editing away from the composer, so the history bindings stand down while an input has focus — the smallest coherent behaviour, and the one that costs the least                       |

### The collision check

**The check was performed, and it passes.** Two bindings collide only when the same key
combination is live in the same scope at the same moment; the same combination at two
disjoint scopes is not a collision, and the map depends on that distinction in five places.
Each is listed here so the reader does not have to find them.

| Combination        | Appears at                                                            | Why it is not a collision                                                                                                    |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Left` and `Right` | The sidebar's resize handle; a tab bar                                | Disjoint focus targets. Only one of the two can hold focus                                                                   |
| `Up` and `Down`    | An open menu or typeahead; the composer's empty input (`Up` only)     | An open overlay takes the keys while it is open, and the composer's empty-input binding is live only when no overlay is open |
| `Return`           | The composer with a send action; an open menu; a focused sidebar item | Three disjoint focus targets, and the meaning is one idea throughout — activate what is focused                              |
| `Space`            | Any focused non-text control                                          | Explicitly excluded from text inputs, where the key types a space                                                            |
| `Esc`              | Every dismissible overlay                                             | One meaning, applied to whichever overlay is topmost. A stack dismisses one layer at a time                                  |

Two whole-map properties were also checked, and both are places a plausible map would have
failed.

- **The numbered family does not collide with anything on either host.** On the host whose
  primary modifier is the control key, `Primary` and `Ctrl` are the same physical key. The
  map survives because the numbered family uses **digits** while every `Primary` binding in
  a shell-wide scope uses a letter, a bracket, a slash or an arrow — and the three
  formatting bindings that do use digits carry the shift key as well. So `Ctrl + 7` reaches
  a destination and `Shift + Ctrl + 7` numbers a list, and neither is ambiguous.
- **No two distinct functions share a combination at a shell-wide scope.** The shell-wide
  set is `Primary` with `/`, `K`, `[`, `]`, the left arrow and the right arrow; `Shift +
Primary` with `Y`, `K` and `F`; `Ctrl` with a digit from 1 to 9; `Alt` with a vertical
  arrow, with or without the shift key; and `F6` with or without the shift key. That is 20
  combinations across 20 rows, and every member of the set is distinct. The three functions
  that carry two combinations each — moving back, moving forward, and the person-to-person
  destination — are transcribed **alternatives** rather than clashes, which is precisely
  what the acceptance criterion requires when it asks for history to work "in both observed
  forms" (`00-product-overview.md` L904).

One inconsistency in the catalog surfaced while this check was done, and it is preserved
rather than reconciled. The step table for the flow states that **two** actions are listed
twice with alternative combinations (`00-product-overview.md` L140), while the frame shows
at least four functions carrying two forms each — reopening the last message, moving back,
moving forward, and the person-to-person destination — and the prose's own enumeration
mentions only three of those (`00-product-overview.md` L142). The map records what the
frame shows, because on a conflict between an opened frame and catalog prose the frame
governs. The discrepancy itself belongs in `docs/decisions/catalog-defects.md` rather than
being smoothed away here, and the catalog is left exactly as it is.

## The invented-bindings register

Every invented binding in the map appears again here. **The duplication is deliberate.** The
uncertainty rule requires that each choice made in the absence of evidence is recorded with
the options considered, the choice and the rationale, and a reviewer auditing that
requirement should not have to filter a 48-row map to find the 29 rows it applies to. This
section is the audit surface; the map is the reference.

The 29 invented rows are 18 decisions, because a directional pair — forward and backward,
next and previous, narrower and wider — is one judgement expressed twice rather than two
judgements. Where a decision covers a pair or a range, the `Binding` cell names every member
of it, so nothing is recorded only by implication.

| #   | Binding                                                               | What it does                                                                               | Why this binding                                                                                                                                                                                                                                                                                                                    | Alternatives considered                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `Shift + Primary + F`                                                 | Moves focus to the top bar's search field                                                  | The shift-primary-F combination is the editor convention for a search whose scope is a whole workspace rather than the current document, which is exactly this field's scope, and no transcribed binding claims it                                                                                                                  | `Primary + F`, rejected because the host browser binds it to find-in-page and taking that away costs a function the product cannot replace. `Primary + K`, rejected because it is transcribed for the switcher and a transcribed binding wins. A bare `/`, rejected because it is unreachable while any text input holds focus, and because the primary-slash combination is already the pane toggle, so a bare slash would imply a family that does not exist               |
| 2   | `F6` · `Shift + F6`                                                   | Moves focus to the next or previous shell region                                           | The long-standing platform convention for cycling between the panes of one application window. It carries no modifier, so it cannot displace a transcribed combination, and it is the single binding that makes a four-region shell enterable without a pointer at all                                                              | `Tab`, rejected because it must remain element-level traversal; overloading it would make the shell's regions and its controls compete for one key. `Primary` with a digit, rejected because the digits are the destination namespace. `Primary + F6`, rejected as a modifier with no purpose                                                                                                                                                                                |
| 3   | `Ctrl + 5` · `Ctrl + 6` · `Ctrl + 7` · `Ctrl + 8` · `Ctrl + 9`        | Goes to the rail destination at that position                                              | The frame evidences the family for positions one to four and the capture is clipped below the fourth, so the rule the family expresses — a digit selects the destination at that position — is implemented for every position the rail can hold                                                                                     | Stopping at four, rejected because the fold in a photograph is not a product boundary and the uncertainty rule forbids omitting a mechanism whose values are uncertain. Mapping the ninth digit to "the last destination" regardless of count, rejected because it would make one member of a transcribed family behave unlike its siblings on no evidence. Continuing past nine under a second modifier, rejected as unreachable ergonomics for a rail that holds far fewer |
| 4   | `Alt + Down` · `Alt + Up`                                             | Moves to the next or previous conversation in the sidebar order                            | The secondary modifier with a vertical arrow is the platform convention for moving between siblings in a list, and it mirrors the axis logic the transcribed bindings already establish: the horizontal arrows act on the sidebar's width, so the vertical pair is free for its contents                                            | `Alt + Shift` with a vertical arrow for the plain traversal, rejected because the shift key is better spent narrowing the same traversal to unread. Bare arrows, rejected because they belong to whichever list or field holds focus. `Primary` with a vertical arrow, rejected because that combination is transcribed inside the composer and the two would be indistinguishable to a member unsure where focus sits                                                       |
| 5   | `Alt + Shift + Down` · `Alt + Shift + Up`                             | Moves to the next or previous conversation carrying unread messages                        | Adding the shift key to an existing traversal is the conventional way to express "the same movement, filtered", so the pair reads as a variant of decision 4 rather than as a separate feature to learn                                                                                                                             | A dedicated letter combination, rejected because it would hide the relationship to the plain traversal. Making the plain traversal skip conversations that are already read, rejected because it would remove the ability to reach a conversation with nothing new in it — a smaller product for no gain                                                                                                                                                                     |
| 6   | `Shift + Return`                                                      | Inserts a line break in the draft instead of sending it                                    | The **pairing** is transcribed and only the **modifier** is chosen. Prose settles that a modifier-plus-return combination adds a new line while the bare return sends, and never names which modifier; the shift key is the platform-standard line-break gesture in an input that sends on return, and the one a member tries first | `Primary + Return`, a real convention in some products and not excluded by the evidence — rejected because the shift key is the more widely expected of the two and because the primary modifier is already heavily loaded in this map. `Alt + Return`, rejected as the least conventional. See the note below: this is the invented binding most likely to be wrong                                                                                                         |
| 7   | `Primary + B` · `Primary + I`                                         | Bolds or italicises the selection                                                          | The two most universally standardised text-formatting bindings there are, identical across operating systems, word processors and rich-text editors. Their whole value is that a member does not have to learn them                                                                                                                 | None seriously. Any other choice would be worse by definition, because the value of these two is precisely that they are not a choice                                                                                                                                                                                                                                                                                                                                        |
| 8   | `Shift + Primary + X`                                                 | Strikes through the selection                                                              | The conventional binding for the struck-through mark in editors that expose it, and it leaves the unshifted primary-X combination to cut, which a text input must keep                                                                                                                                                              | `Primary + D`, used by some editors, rejected because the letter carries no mnemonic link and collides with the duplicate-line convention a member may know from elsewhere. `Shift + Primary + S`, rejected because the unshifted form is save and the shifted form is save-as in most hosts                                                                                                                                                                                 |
| 9   | `Shift + Primary + U`                                                 | Turns the selection into a link                                                            | The conventional link binding is `Primary + K`, which is already transcribed at a wider scope for the switcher, and a transcribed binding wins. The letter maps to the destination the link editor asks for                                                                                                                         | `Primary + K`, rejected on the precedence just stated — **this is the clearest case in the map of a transcribed binding displacing a convention**, and it is recorded as such rather than quietly resolved. `Shift + Primary + K`, rejected because it too is transcribed, for the person-to-person destination. `Primary + L`, rejected because hosts bind it to the address bar                                                                                            |
| 10  | `Shift + Primary + 7` · `Shift + Primary + 8` · `Shift + Primary + 9` | Numbers, bullets or quotes the selected lines                                              | The digit family for list and quote marks is a long-standing word-processor convention, and the three digits are adjacent in the same order the toolbar groups the marks — the two lists, then the quote                                                                                                                            | Letter mnemonics under the primary modifier, rejected because the obvious letter for a list is taken by decision 9 and because letters for block marks compete with letters for inline marks in a member's memory. Reusing the bare digits without the shift key, rejected outright: those are the transcribed destination namespace and the collision would be real rather than notional                                                                                    |
| 11  | `Shift + Primary + C` · `Shift + Primary + Alt + C`                   | Sets the selection as fixed-width text, or the selected lines as a fixed-width block       | The inline mark takes the letter and the block form takes the same letter with the secondary modifier added, so the two marks the toolbar deliberately keeps apart stay recognisably related without becoming interchangeable                                                                                                       | One combination for both, with the behaviour inferred from whether whole lines are selected — rejected because it makes the mark unpredictable and because the toolbar exposes two controls, not one. `Shift + Primary + E` for the inline mark, a real convention, rejected because it breaks the letter relationship with the block form                                                                                                                                   |
| 12  | `Return` in an overlay                                                | Activates the focused item in a menu, typeahead or option list                             | The platform convention for activating what is focused, and it keeps one idea consistent product-wide: a bare return does the focused thing, whether that is sending a draft, choosing a menu row or opening a conversation                                                                                                         | `Space` alone, rejected because the return key is what a member reaches for in a list, and the space key is retained for buttons and disclosures anyway. Requiring a modifier, rejected as friction with no safety benefit for a reversible action                                                                                                                                                                                                                           |
| 13  | `Space`                                                               | Activates or toggles the focused control that is not a text input                          | The platform convention for operating a button or a disclosure from the keyboard. It is deliberately **additive** to the return key rather than an alternative to it, because a control answering to only one of the two is exactly the defect the catalog measured on its own documentation site (`README.md` L987-L1002)          | Return only, rejected for the reason just given. Binding the space key inside text inputs as well, rejected because the key types a space there and nothing may take that away                                                                                                                                                                                                                                                                                               |
| 14  | `Tab` · `Shift + Tab`                                                 | Moves forward or backward within an open modal's trapped focus order                       | The platform convention for sequential traversal. It appears in this register only because the corpus evidences the focus treatment but never the traversal that produces it (`21-states.md` L463), so the **order** is a build decision that has to be written down                                                                | None on the key itself — an alternative would be a defect. What is genuinely decided here is that the order is authored and that the trap belongs to the shared hook rather than to each modal, and both are recorded rather than assumed                                                                                                                                                                                                                                    |
| 15  | `Down` · `Up` in an overlay                                           | Moves to the next or previous item in an open menu or typeahead                            | The convention for moving through a vertical list. The typeahead's own footer already advertises navigate, select and dismiss as functions without naming keys (`03-messaging-and-composer.md` L585), so the functions are evidenced and only the keys are chosen                                                                   | `Tab` inside a menu, rejected because it should leave the menu rather than cycle within it. `Primary` with a vertical arrow, rejected as modification of an already unambiguous key                                                                                                                                                                                                                                                                                          |
| 16  | `Home` · `End`                                                        | Moves to the first or last item in an open menu or typeahead                               | The convention for jumping to the ends of a list. Cheap to support and disproportionately useful in a long one, and both the destination menu and the person typeahead get long                                                                                                                                                     | Omitting them, rejected because the uncertainty rule treats an unevidenced convenience as an open work item rather than a licence to skip, and because a long list without end-jumps is measurably worse to operate by keyboard                                                                                                                                                                                                                                              |
| 17  | `Left` · `Right` in a tab bar                                         | Moves to the previous or next tab                                                          | The convention for moving along a horizontal set of peer views, matching the axis the tabs are laid out on. It is scope-separated from the transcribed resize pair, which requires the sidebar's resize handle to hold focus, and the two can never be live at once                                                                 | `Primary` with a digit to select a tab by position, rejected because the digits are the destination namespace. `Tab`, rejected because it must move **out** of a tab list rather than along it, which is the whole reason the arrow convention exists for tab sets                                                                                                                                                                                                           |
| 18  | `Return` on a sidebar item                                            | Activates the focused sidebar item — opens a conversation, or toggles a group's disclosure | The same activation convention as decision 12, recorded separately because a sidebar item is not one kind of thing: the binding has to resolve to the right one of two behaviours depending on what holds focus, and that resolution is a decision rather than a restatement                                                        | Two different keys for the two item kinds, rejected because a member cannot see which kind is focused before pressing and would have to guess. Making the disclosure answer only to the space key, rejected for the reason decision 13 gives                                                                                                                                                                                                                                 |

### The one decision most likely to be wrong, named as such

Decision 6 — the line-break modifier — deserves a warning the other seventeen do not, because
it is the only one where the corpus almost certainly holds the answer and this task could not
reach it.

The composer carries a persistent hint that names the newline combination
(`03-messaging-and-composer.md` L515), and a combination is transcribable content. But the
frame that shows that hint belongs to a **different flow** from the one this record is
assigned, and the corpus-handling rule confines a task to the frames its own flow cites and
prohibits opening frames outside it. So the modifier stays a recorded choice rather than
becoming an unauthorized open. If a later task is assigned that flow and reads the hint, this
row is the first place to correct — and correcting it costs nothing beyond the registry, the
hint string and one test, because nothing else in the build depends on which modifier it is.

That is a better outcome than the two alternatives. Opening the frame anyway would breach the
rule for a value the platform convention already supplies. Declining to implement a line break
because its modifier was uncertain would breach a different rule, and would ship a composer
that cannot write a second line.

### Review posture

The two halves of this map do not carry the same weight, and treating them as though they did
is the most likely way for a later change to do damage.

| If a binding is | Then it is                                                                          | And changing it                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **transcribed** | The one thing about the keyboard contract that the evidence actually settles        | Is not a preference change. It contradicts frame 338, so it needs a reason of the same kind — a newer frame, or a defect recorded against this record |
| **invented**    | A decision, not a discovery. It was defensible when made and it may simply be wrong | Costs a registry edit, a copy string and a test. No specification claim breaks, because none was ever made                                            |

Three practical consequences follow.

- **An invented binding may be revised freely, and the revision belongs here.** Update the row,
  update its register entry, and the map stays honest. What must not happen is a revision that
  leaves the `Source` column saying `invented` while the rationale describes a binding nobody
  chose any more.
- **A transcribed binding is not tidied.** The temptation is real and specific: the numbered
  destination family looks like it _ought_ to use the primary modifier, and normalising it
  would make the map prettier and wrong. The carve-out exists to stop exactly that edit.
- **Neither half may be quietly reclassified.** Marking an invented binding `transcribed` to
  make it look settled is a false provenance claim, and it is the one failure this record has
  no defence against other than the discipline of whoever edits it next. A binding's source is
  a fact about where it came from, not a judgement about how confident anyone feels.

## Keyboard operability is not the map

**A shortcut map is a convenience layer. Keyboard operability is a separate, unconditional
requirement, and nothing in the map discharges any part of it.**

The distinction matters because the two are easy to conflate and the conflation is
expensive. A product can have a rich shortcut reference and still be unusable from a
keyboard, because shortcuts accelerate paths that already exist for people who already know
them. Operability is the guarantee that **every** interactive element can be reached and
operated by keyboard whether or not it has a shortcut, by someone who has never seen the
reference pane. Only one of the two is a floor, and it is not the map.

So the obligations below apply to every control in every Phase-1 surface, including the
sixteen placeholder surfaces and the unauthenticated gate surfaces, and they apply to
controls with no binding at all — which is most of them.

The catalog is candid that it cannot help much here, and the candour is the useful part. It
evidences the focus _treatment_ in detail while evidencing none of the _traversal_ that
produces it: no capture shows two successive focus positions, a skip link, or focus
containment inside an open modal, and none shows a checkbox or a radio carrying the
treatment at all. It states the consequence directly — tab order, focus containment and
focus restoration on dismissal "are therefore build decisions rather than transcriptions"
(`21-states.md` L463). Every requirement in this section is therefore authored, and the two
that are _not_ authored are called out where they appear, because they are the only places
the corpus constrains the answer.

### Focus order

Focus follows the reading order of the region it is in, and the regions are visited in the
shell's own order — top bar, rail, sidebar, content region, then the docked pane when one is
open (`00-product-overview.md` L302, L307).

- **Order comes from document structure, not from an explicit index.** No positive tab index
  is used anywhere. Where the visual order and the document order disagree, the document
  order is changed rather than patched with an index, because an index is a second ordering
  that drifts from the first.
- **The order is stable across a routed navigation.** Only the content region is replaced
  when a destination changes; the shell persists. So focus does not return to the top of the
  document on every navigation — it moves to the newly rendered content region, which is the
  region that changed.
- **Nothing interactive is unreachable, and nothing non-interactive is reachable.** A
  decorative element, an icon that duplicates an adjacent label, and a presentational row
  are all skipped.
- **`F6` is the shortcut for region movement, not a substitute for order within a region.**
  A region whose internal order is wrong is not fixed by being reachable.

### The focus ring

The ring is the one part of this section the corpus does settle, and it settles it
precisely: a focused field renders **a ring outside its own border** together with a
strengthened border and a caret at the insertion point, and nothing else on the surface
changes (`21-states.md` L120).

- **Outside the border, always.** The ring is drawn outside the element's own boundary so
  that it is never clipped by the element, by a parent that hides overflow, or by a
  neighbour. This is why it cannot be implemented as an inset outline: an inset ring on a
  control at the edge of a scrolling region disappears exactly when it is needed most.
- **Visible in both colour modes**, and holding the contrast floor in both. The dark theme is
  a derivation over the same token names, so the ring is one implementation rather than two.
- **On every focusable thing, including the ones the corpus never captured focused.** No
  frame shows a checkbox or a radio carrying the treatment (`21-states.md` L463); they carry
  it anyway.
- **Focus visibility is never traded for appearance.** Removing the ring and relying on a
  background change is not an equivalent, because a background change is not perceivable at
  the contrast a ring provides and is often invisible against a hovered row.

### Focus containment and restoration

Both belong to `packages/ui/src/hooks/useFocusTrap.ts` and neither is implemented per
overlay. A modal that trapped its own focus would be a second implementation of shared
behaviour, which the first rule prohibits, and it would be a second chance to get it wrong.

| Obligation                               | What it requires                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Containment while open                   | Focus cycles within the modal and cannot reach the surface behind it. The cycle wraps in both directions, so the traversal has no dead end                                |
| Initial focus                            | Moves to the first meaningful control — the first field where the modal collects input, or the modal's own container where it collects none. Never to the dismiss control |
| Restoration on close                     | Returns to the control that opened the overlay, **rendered visibly focused when it gets there**                                                                           |
| The evidenced case that must not regress | A control that has been used **keeps its ring after the surface it opened has closed**, while its neighbours in the same bar render without one (`21-states.md` L121)     |
| Dismissal without a pointer              | Every dismissible overlay closes on the escape key, and a stack dismisses one layer at a time rather than collapsing wholesale                                            |

That fourth row is worth dwelling on because it is the only piece of restoration behaviour
the corpus actually evidences, and it is easy to break by accident. The natural
implementation of "close the menu" clears focus along with the menu, which leaves a keyboard
user at the top of the document with no idea where they were. The evidenced behaviour is the
opposite, and it is also the correct one.

### Roles and accessible names

Every custom control carries the role its behaviour implies and a name that says what it
does. The shared library owns this, so a name is a property of the contract rather than
something each call site remembers.

| Control kind                    | What it must expose                                                                                                                                                         |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Menus and context menus         | A menu role with menu-item children, the open state on the control that opened it, and arrow-key traversal — one tab stop for the menu, not one per item                    |
| Tab bars                        | A tab-list role with selected state on exactly one tab, its panel associated with it, and arrow-key movement along the list rather than tab-key movement through it         |
| Typeaheads and the search entry | A combobox relationship between the input and its list, the expanded state on the input, and the active option announced as it changes rather than only on selection        |
| The composer                    | A multi-line editable region with an accessible name, its formatting state announced when a mark is applied, and its hint associated with it so it is read as a description |
| Segmented code input            | One accessible name for the group rather than six unlabelled boxes, and the remaining-character position announced as it advances                                           |
| Icon-only controls              | A name from the action, never from the glyph. An icon has no accessible name of its own and a title attribute is not a substitute                                           |
| Toggles, checkboxes and radios  | The checked or pressed state exposed and announced on change, not conveyed by colour alone                                                                                  |
| The reference pane's table      | A table structure with its group headings associated with their rows, so the bindings are readable in sequence rather than as loose text                                    |

### Live regions

Two things change without the member having done anything at that moment, and both are
announced.

- **Transient outcome reports.** The observed failure form is a rounded pill at the foot of
  the content region carrying no dismissal control and no action, so it cannot be read on
  demand — if it is not announced when it appears, it is not perceivable at all. It is
  announced politely, and its text is the same authored string a sighted member sees.
- **New messages arriving in the open conversation.** Announced politely and coalesced, so a
  busy conversation does not produce a stream of interruptions. `useLiveRegion` owns both,
  and `apps/web/src/a11y/` hosts the region itself.

Neither announcement is assertive. An assertive region interrupts whatever is being read,
which is right for an error the member caused and wrong for a message someone else sent.

### The four criteria automated scanning cannot judge

The pipeline runs an automated accessibility scan over every Phase-1 route, and four
criteria of the current standard are not decidable by it. Each gets an explicit assertion
rather than an assumption, and each assertion is written so it can fail.

| Criterion                 | How it is satisfied here                                                                                                                                                                                                                                                                                                                                                                                                                                               | Where it is asserted                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Consistent help           | The help control sits at the **far right of the top bar**, and the top bar is a persistent shell region present on every authenticated surface — so the help entry is in the same relative position everywhere by construction rather than by convention (`00-product-overview.md` L302). The gate surfaces render with no shell, and where they offer help at all it occupies the same position on each of them                                                       | `e2e/a11y.spec.ts`, asserted per route          |
| Redundant entry           | No multi-step flow asks for information the member has already given it in the same flow. Where a later step needs an earlier value it is carried forward and shown, not re-requested; where a value must be confirmed rather than re-entered, the confirmation is presented as a confirmation                                                                                                                                                                         | `e2e/specs/auth.spec.ts`                        |
| Accessible authentication | The verification-code field advertises one-time-code autofill and **permits paste**. Blocking paste on a code field is the classic form of this failure: it forces a cognitive test — transcribe six characters from another device — with no alternative. The field is six boxes in two groups of three with no submit control of its own (`00-product-overview.md` L354), so a pasted code distributes across the boxes and does not require six separate keystrokes | `e2e/a11y.spec.ts` and `e2e/specs/auth.spec.ts` |
| Dragging movements        | **No Phase-1 interaction has a drag-only path.** Every drag has a keyboard-operable equivalent — see the two specific cases below                                                                                                                                                                                                                                                                                                                                      | `e2e/a11y.spec.ts`                              |

Two drag surfaces exist in Phase 1 and each needs its equivalent named, because "no
drag-only path" is only a real commitment if the paths are enumerated.

- **The profile photo drop zone.** The attachment drop zone's contract already accepts a file
  **either by drag-and-drop or by a file chooser** (`00-product-overview.md` L438), so the
  non-drag path is part of the contract rather than an addition to it — the chooser is
  keyboard-reachable and the drop zone is a second, optional route. The crop that follows is
  a fixed-ratio square, so it needs no free-form dragging: its position and scale are
  adjustable by keyboard in discrete steps, and the ratio cannot be changed at all. Note that
  the corpus captures no drag-over, attached or rejected rendering for a drop zone anywhere
  (`21-states.md` L209), so those states are authored — which is a further reason not to make
  the drag path the only one.
- **Sidebar reordering.** Where a member can reorder anything in the sidebar, the reorder is
  available as a discrete move — a menu action, or a keyboard command that moves the focused
  item one position — and never only by dragging. The same holds for the sidebar's resize
  handle, which is why the transcribed arrow-key bindings for it matter beyond convenience:
  they are the width control's only non-pointer path.

### The reference pane itself

The pane that lists the shortcuts has to be operable by the means it documents, which is
less obvious than it sounds — a keyboard reference that can only be read with a mouse is a
particular kind of failure.

- **It opens and closes from the keyboard**, by the transcribed toggle and by the escape key.
- **It is reachable in the region cycle** while it is open, as the fifth region.
- **It scrolls by keyboard.** This is not optional here: the pane's content exceeds the
  viewport — the same clipping that truncated the evidence for this record
  (`00-product-overview.md` L862) — so a member who cannot scroll it cannot read the part
  that matters to them.
- **Its rows are legible in sequence to a screen reader**, as label-and-keys pairs under
  their group headings rather than as an undifferentiated run of text. A combination is
  announced as its keys, not as punctuation.
- **Focus returns to whatever opened it** when it closes, by the same shared restoration the
  rest of the product uses.

One honest limitation belongs on the record. **The pane's content is partly authored**, which
means a member reading it is reading a mixture: combinations that came from the product's own
evidence, and combinations this build chose. The pane does not distinguish them, and it
should not — a member does not care about provenance, only about which keys work, and every
combination it lists does work. The distinction lives here, in this record, which is where a
reviewer needs it and a member does not.

## Implementation

### One registry, and the pane renders from it

**The bindings are declared once, in `packages/ui/src/keyboard/registry.ts`, and both the
handlers and the reference pane read that declaration.** The pane is not a hand-maintained
list of what the handlers are believed to do; it is a rendering **of** the handlers'
own source of truth.

This is the single most important implementation decision in the record, and the reason is
that the alternative fails silently. A pane written as static content and handlers written
as key listeners will agree on the day they are written and will disagree the first time
either changes — and the disagreement is invisible in every test that exercises only one of
them. A member then reads a combination that does nothing, which is worse than no reference
at all, because the reference has become a source of false statements about the product.

Each registry entry carries what both consumers need, and nothing either of them can derive:

| Field           | Purpose                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identifier      | A stable key naming the action, used to look the label up and to reference the entry from a test                                                                                                                         |
| Combination     | The keys, with the modifier held **abstractly** and resolved once at match time, never stored per platform                                                                                                               |
| Alternative     | A second combination for the same action where one exists, so the two transcribed history forms and the second person-to-person form are one entry with two combinations rather than two entries competing for one label |
| Scope           | Which surface or focus condition the entry is live in, so the map's `Scope` column has a machine-readable counterpart                                                                                                    |
| Group           | Which of the five groups it belongs to, which is what the pane groups its rows by                                                                                                                                        |
| Source          | `transcribed` or `invented`, carried into the code so provenance survives outside this record                                                                                                                            |
| Label reference | The key into the authored copy module — never a string                                                                                                                                                                   |

Two consequences of that shape are worth stating because they are easy to lose.

- **The `Source` field earns its place in code.** It is not decoration: it is what lets a
  future change distinguish a binding it may revise freely from one it may not, without
  anyone having to find this document first. It is also what a test can assert on, so the
  count of transcribed entries cannot drift from the 19 this record claims.
- **The abstract modifier is resolved at match time, not at declaration time.** Storing two
  platform variants would reintroduce the two-tables problem the modifier convention exists
  to prevent, and it would make the control-key carve-out a special case in two places
  instead of one.

Handlers attach at the scope the entry names, through the shared keyboard hook alongside the
registry, and never as ad-hoc listeners inside a feature directory. Overlay dismissal and
focus restoration are not registry concerns at all — they belong to
`packages/ui/src/hooks/useFocusTrap.ts`, as
[Focus containment and restoration](#focus-containment-and-restoration) requires.

### Every label is an authored string

**Every label in the map resolves to a key in `packages/shared/src/copy/en.ts`. No label is
an inline literal, in the registry or anywhere else.**

This is a rule consequence rather than a preference. All microcopy in this product is
authored and centralised, which gives the brand guard a single high-value file to police, and
a label inlined in the registry would sit outside the file the guard watches most closely.
The registry therefore carries a _reference_ to a string, never a string.

Three specific strings belong to the same module and are named here so none is invented at a
call site.

- **The pane's group captions.** Five authored captions, one per group, and none of them
  reproduces a caption legible in the frame.
- **The composer's persistent hint.** Its wording is authored; its _keys_ are read from the
  registry entry for the line-break binding, so the hint cannot name a combination the
  handler does not implement. That coupling is the whole reason the hint is safe to display
  continuously.
- **The pane's own lead row.** It names the toggle combination, and it takes both the wording
  and the combination the same way — authored string, registry keys.

### Verification

No binding is considered implemented until a test presses it. The obligation is the same one
the uncertainty rule applies to acceptance criteria: nothing is marked satisfied without a
passing test behind it, and a map is exactly the kind of artifact that can look complete
while being half-wired.

| What must be proven                                                                                           | Where                                                   |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| The pane opens by its transcribed combination, closes by the same one, and closes by the escape key           | `e2e/specs/shell.spec.ts`                               |
| **At least one binding from each of the five groups** actually performs its action                            | `e2e/specs/shell.spec.ts`, `e2e/specs/composer.spec.ts` |
| The bare return sends and the line-break combination does not                                                 | `e2e/specs/composer.spec.ts`                            |
| The bare return does **not** send in the modal sub-composer, which has no send action                         | `e2e/specs/composer.spec.ts`                            |
| Dismissing an overlay restores focus to the control that opened it, visibly                                   | `e2e/specs/states.spec.ts`                              |
| Every transcribed numbered destination resolves to a surface that renders, placeholder or not                 | `e2e/specs/shell.spec.ts`                               |
| The pane's rendered rows match the registry entry for entry — no row without an entry, no entry without a row | a unit test beside the registry                         |
| Focus order, the ring, containment, restoration, roles, names and live regions                                | `e2e/a11y.spec.ts`                                      |
| The four criteria automated scanning cannot judge, including every drag alternative                           | `e2e/a11y.spec.ts`                                      |

Two of those rows are doing more work than the others and are worth calling out.

- **The registry-to-pane equivalence test is what makes the whole arrangement trustworthy.**
  It is cheap, it needs no browser, and it is the only test that fails when the pane and the
  handlers drift apart. Without it the single-registry decision is a convention rather than a
  guarantee.
- **The accessibility specification is the home of the focus and drag-alternative
  assertions**, and it is deliberately not the home of the binding tests. Bindings are
  behaviour and belong with the surface they act on; operability is cross-cutting and belongs
  in one place where every route is walked. Splitting them this way is what stops a green
  accessibility run from being read as evidence that the shortcuts work, or the reverse.

Every test that exists to satisfy a catalog acceptance criterion cites that criterion inline
in the form the build prompt fixes, so the traceability manifest can be regenerated by
reading the tests rather than by trusting a table. The criterion this record's bindings answer
to is the one requiring that every shortcut named in the reference works — including the
toggle itself, history in both observed forms, dismissing dialogs, and the numbered
destination combinations (`00-product-overview.md` L904).

## Cross-reference obligations

Four records and one criterion are coupled to this one. Each coupling is stated so that a
change here is recognisable as a change to something else.

| Record                                   | The obligation between it and this one                                                                                                                                                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/decisions/frame-access-log.md`     | **They must agree on frame access.** This record opened one frame, 338; that log carries the matching entry. If the two ever disagree, the log is the authority on what was read and this record is stale                                                                   |
| `docs/decisions/component-extensions.md` | That record owns whether the pane is a contract, a variant or a new identifier, and it places the reference table in this phase because its label-and-keys form _is_ this pane. This record owns the bindings, labels and provenance it renders. Neither restates the other |
| `docs/decisions/placeholder-surfaces.md` | That record owns the sixteen deferred destinations and their route segments as a closed enumeration. This record owns which bindings reach them and, where a target has no segment at all, the recorded decision about where it lands instead                               |
| `docs/decisions/catalog-defects.md`      | The inconsistency about how many actions carry alternative combinations belongs there, not here. This record states the discrepancy, records that the frame governs, and leaves the reconciliation to that record                                                           |
| `00-product-overview.md` L904            | The acceptance criterion this map answers to. Read-only. Where this record and that criterion disagree, the criterion is the specification and this record is the defect                                                                                                    |

Two further couplings run into code rather than into documents.

- **The registry is the single point of truth for the bindings**, so adding one obliges three
  coordinated edits and not one: the registry entry, the authored label, and a test that
  presses it. Two of the three leaves the map lying.
- **The five group names in this record and the pane's five group captions are the same five
  groups**, in the same order. Renaming a group here without renaming its caption — or adding
  a sixth group in either place alone — makes the pane and this record describe different
  products.

Finally, the state change that a downstream reader must not misread. The catalog states that
no user-specified rules exist for this project. **Five rules now exist and are binding**, so
that statement is superseded as a statement of fact and is not licence. This record exists
because of two of them in particular — the one permitting a key binding to be transcribed
while withholding permission for the copy around it, and the one refusing to accept
uncertainty as grounds for omitting a mechanism. Read without those two, the map above would
look like an ordinary shortcut table. It is not one: it is a table in which every row's origin
is recorded, because the rules made origin the thing that matters.
