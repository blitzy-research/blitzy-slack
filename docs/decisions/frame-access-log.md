# Frame access log

Every frame this run opens is recorded here, once, at the time it is opened.
The record is append-only, and it is the only place the count is kept: the
`Frames opened` line of the run's reporting ledger is read from this file and
from nowhere else.

```text
Frames opened           0  (see docs/decisions/frame-access-log.md)
```

The log exists because corpus access is governed rather than forbidden. A frame
may be opened, under stated conditions, for a stated reason — and the price of
that permission is that the opening is written down where a reviewer can find
it without taking anyone's word for it. That is also why the opening state
below is stated as a figure rather than left as an empty table: an untouched
ledger and an unkept ledger look identical on the page, and only one of them is
acceptable.

| Field                 | Value                                                                               |
| --------------------- | ----------------------------------------------------------------------------------- |
| Record type           | Decision record **and** access ledger                                               |
| Status                | Operative. Append-only for the life of the run                                      |
| Frames opened to date | **0**                                                                               |
| Entries               | **1** — a task-level justification, which records authorization rather than an open |
| Authorizing manifest  | `docs/decisions/measurement-manifest.md`, which names 24 frames                     |
| Reported as           | the `Frames opened` line of the run's reporting ledger                              |
| Companion records     | `docs/decisions/measurement-manifest.md`, `docs/decisions/catalog-defects.md`       |

(Rules are cited throughout by subject and by position in the order they were
provided, never by their platform identifiers. Each identifier embeds a
third-party product name, and the identity rule — the fifth as provided —
prohibits that name in source, comments and copy alike, so writing one here
would breach the rule this record is otherwise observing. The corpus-handling
rule is the third as provided, and the uncertainty rule is the fourth. Position
alone would be unsafe, because the identifiers are permuted relative to the
requirement labels; position together with subject is not.)

## Resolve from prose before opening anything

The catalog under `docs/workflows/` is the primary source. The corpus under
`screenshots/` is source material of last resort rather than a browsing
surface, and the ordering between the two is not a preference: a question goes
to the prose first, and a frame becomes eligible to be opened only once the
prose has failed to answer it.

In practice the prose has answered every question this run has asked. Every
geometric and structural fact the decision records rest on was read from a
catalog document and is cited to it, which is why this log opens with no frame
recorded against it. What the prose supplied instead is set out under
[What the catalog answered instead](#what-the-catalog-answered-instead).

## When a frame may be opened

Three conditions authorize an open, and nothing else does. Each is labelled so
that every entry in the log can name the one it relies on.

| Clause                         | The frame may be opened when                                                                                                                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **(a)** Assigned-flow citation | The step table of the flow the agent is assigned cites that specific frame **and** the table's prose is not sufficient to implement the step. Both halves are required: a citation alone authorizes nothing where the prose already answers the question |
| **(b)** Named in the manifest  | The frame is named in `docs/decisions/measurement-manifest.md`. That record is an authorizing instrument rather than a description of one, and its rows are a closed set — a frame absent from it is not covered by this clause                          |
| **(c)** Named in the prompt    | The build prompt names the frame explicitly. Authorization is by explicit naming: a frame the prompt merely implies, or one that happens to sit beside a frame it names, is not covered                                                                  |

Two properties of the set matter more than the individual clauses.

- **They are alternatives, not a sequence.** An open needs one of the three. It
  does not need all three, and satisfying one does not weaken the prohibitions
  below.
- **None of them is a general licence.** Clause (a) is bounded twice over, by
  the agent's own assigned flow and by the insufficiency of the prose. Clause
  (b) is bounded by a closed list. Clause (c) is bounded by an explicit naming.
  An open that cannot cite one of the three has no authority behind it at all,
  and an open that can cite one still owes this log an entry.

## What is never permitted

Four prohibitions bound access. They hold whether or not a clause above is
satisfied — a clause authorizes an open, it does not suspend these.

- **Never survey, enumerate, sample or scan the corpus.** Listing the
  directory, matching a pattern across it, opening a spread of frames to see
  what is in them, or taking every tenth frame are all the same prohibited act
  under different names. This is why the measurement tool reads a fixed list
  rather than discovering one: a list assembled at run time would be a survey
  however short it turned out to be.
- **Never open a frame to confirm what the catalog already states.** A
  confirmation is not a question the prose failed to answer; it is a question
  the prose answered and the reader declined to accept. Corroboration is not a
  permitted reason, and neither is curiosity.
- **Never open frames outside the agent's own assigned flow.** Clause (a) is
  scoped to the flow an agent is working, and an adjacent flow's frames are
  another agent's evidence. Reading widely to build context is exactly the
  survey the previous prohibition forbids.
- **Never exceed six frames for a single task without appending a
  justification here.** The threshold is per task, not per agent, per file or
  per session, and the justification is appended to this file rather than
  asserted anywhere else.

The write side of the same rule is not this log's subject, but it bounds every
open recorded here and is stated once so that no reader has to infer it:
nothing under the five read-only inputs may be modified, moved, renamed,
deleted, compressed, re-encoded or reformatted; all 1,022 frames stay
byte-identical, which `tools/check-corpus` verifies in the pipeline from file
metadata alone; and the corpus never reaches build output, a container image or
a client bundle.

## The cap, and what a justification must name

Six frames is the threshold for a single task. Reaching it is not prohibited —
exceeding it silently is. The remedy the rule prescribes is a written
justification appended here, and it must name three things.

| Field the rule requires           | What it means in this log                                                                                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The frame                         | A bare integer. Never a filename, and never the catalog's percent-encoded citation form — every filename in the corpus embeds a third-party product name, so either form would carry prohibited identity into a committed file             |
| The task                          | The unit of work the cap is measured against, named concretely enough that a reviewer can tell whether a later open belongs to the same task or starts a new one                                                                           |
| What the catalog failed to answer | A **question**, never the answer read off the pixels. The column records what the prose could not settle and why it could not; it does not record a value, a colour, an icon or a string, and it never transcribes text legible in a frame |

The third field is the one that does the work, and it is the one most easily
written uselessly. A justification that names the task but not the question is
an assertion that an open was necessary rather than a demonstration of it, and
the log's whole value is that the necessity is legible to someone who was not
there. Naming the question also makes the entry falsifiable: a reviewer can go
to the prose, find that it does or does not answer, and judge the open.

## When a frame and the catalog disagree

Where an opened frame and catalog prose conflict, **the frame governs**. The
catalog is a reading of the pixels and the pixels are the thing read, so the
disagreement resolves in favour of the primary evidence. The disagreement is
then recorded in `docs/decisions/catalog-defects.md` and the catalog is left
alone: it is a read-only input, and correcting a specification in place is
prohibited even when the specification is wrong.

Three subjects are carved out of that precedence. On these the pixels never
govern, however plainly they show something.

| Subject       | What governs instead, and what may never be taken from a frame                                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colour values | The palette in the build prompt, and nothing else. No value is sampled, eyedroppered or approximated from a frame, in either colour mode                                                                                                                   |
| Icon artwork  | Original or open-licensed artwork. No third-party mark, glyph or logotype is traced, extracted or reconstructed, and a frame is never used as a drawing reference                                                                                          |
| Product copy  | Authored strings. No marketing, interface or product text legible in a frame is transcribed — not a heading, a label, a placeholder, a button caption or a message. Keyboard key bindings are function rather than identity and are the one exception here |

The carve-out follows from what a frame is evidence _of_. It evidences
behaviour and layout, which the build is required to reproduce, and it displays
identity, which the build is required not to. Both are in the same image, so the
line between them has to be drawn by rule rather than by eye.

The consequence for this log is worth stating plainly, because it is the reason
the exceptions appear in a record about access at all: **no entry below can ever
be cited as authority for a colour, an icon or a string.** An entry authorizes
geometry and behaviour, and the last column of an entry is a question about
those. A downstream agent that finds a logged open and reads it as licence to
lift a colour or a caption has misread the entry, not found a loophole in it.

## The log

Five columns. The middle three are the fields the corpus-handling rule requires
of a justification — the frame, the task, and what the catalog failed to answer.
The date and the authorizing clause are this record's own additions: without
them a reader can see that an open happened but not when, and not under which of
the three permissions.

| Date       | Frame    | Task                                                                                                                                                                                                               | Authorizing clause                                          | What the catalog failed to answer                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-18 | None yet | Deriving the geometric design tokens — the frame-measurement run over the fixed manifest, producing the committed records under `tools/measure-frames/out/` and the geometry in `packages/ui/src/styles/tokens.ts` | **(b)** — named in `docs/decisions/measurement-manifest.md` | **Absolute pixel values.** The catalog states prescriptively that its layout specifications are proportional or relative — regions, columns, ordering and relative sizing — and never absolute pixel offsets, because an offset keyed to a fixed canvas would be wrong on 48 of the 1,022 frames (`README.md`, known limitation 4). No further reading of the prose yields a spacing, sizing or rhythm value in pixels, so measurement is the only remaining source |

That is the whole log. Three things about it need saying, because each is a
place a reader could reasonably suspect an omission.

### The entry carries no frame number, and that is deliberate

The manifest names 24 frames — inside the 15 to 25 range the build prompt
prescribes — and every one of them is authorized. None of them has been read.
This entry is the justification the cap requires, appended **before** the run
rather than after it, because a justification written afterwards would be an
excuse rather than an authorization.

A frame therefore appears in the `Frame` column only once it has actually been
opened. Writing the 24 numbers in now would turn an authorization into a false
record of 24 opens, and the count in the header table — which is read straight
off this log — would report work nobody has done. The honest reading of the log
today is: one task is authorized to open up to 24 named frames, and zero frames
have been opened.

### One entry rather than 24

The cap is measured per **task**, and the measurement run is one task: every
frame in it is opened for the same reason, under the same authority, by the same
tool, in a single pass. One justification is therefore the correct granularity,
and 24 near-identical justifications would be noise that made the log harder to
audit rather than easier.

The per-frame rows that follow the run are a different thing from the
justification and must not be read as 24 further justifications. The
justification records **what was authorized and why**; a per-frame row records
**what was done**. The distinction is what lets the reported count be a simple
row count.

### The manifest names 24 frames, and that is not a breach

The manifest names more than six frames deliberately. The rule's manifest
clause and its per-task cap are separate provisions: the clause settles _which_
frames may be opened, and the cap settles _how many_ a single task may open
before it owes an explanation. Naming a frame in the manifest does not repeal
the cap, and the manifest claims no such effect — so the cap is discharged the
way the rule prescribes, by the single appended justification above, and not by
treating the manifest as an exemption.

## What the catalog answered instead

**Zero frames were opened during planning, and zero during the authoring of the
decision records.** The measurement manifest states the same for the family of
22 records, this one included, and this log is where any exception would have to
appear — so the absence is a finding rather than a blank.

Every corpus fact those records carry was read from catalog prose. The
load-bearing ones are listed with their source below, so the claim can be
checked rather than believed.

| Fact the records rely on                                                                                                      | Where it was read                                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| The bottom capture band, its measured height distribution, and that no frame measures the height recorded upstream            | `README.md`, known limitation 3                                             |
| That the band's median grey value is identical across all 1,022 frames, and that its top edge sits at y = 1200 in 937 of them | `README.md`, known limitation 3                                             |
| The effective product viewport of 1920 × 1200 once the band is excluded, for the 974 canonical frames                         | `README.md`, known limitation 3                                             |
| Five distinct frame heights, a uniform width of 1920, and RGBA colour mode in all 1,022 frames                                | `README.md`, known limitation 4                                             |
| The count of non-canonical frames, and the catalog's stated reason for refusing absolute offsets                              | `README.md`, known limitation 4                                             |
| That the citation filename pattern is a reviewed exception which the verification gate strips before counting                 | `README.md`, known limitation 5                                             |
| That the site's superfences extension consumes a fenced block before a diagram can be produced from it                        | `README.md`, known limitation 2                                             |
| The component contract inventory with its variants and states, the security contracts, and the shell regions                  | `00-product-overview.md`                                                    |
| The entity set and the per-viewer relation placements                                                                         | `README.md`, consolidated data model                                        |
| Which frame numbers attach to which surface, for every row of the measurement manifest                                        | the area documents cited in that manifest's rows                            |
| The census of build-obligation, partial-capture and gap markers                                                               | counted in the area documents; recorded in `docs/decisions/gap-register.md` |

Two of those readings disagree with figures recorded elsewhere — the band
height against an upstream figure, and the marker census against the totals
quoted in different places. Neither is reconciled here. Both are recorded in
`docs/decisions/catalog-defects.md`, because a preserved inconsistency is
information and a smoothed one is a loss.

The pattern behind the table is the useful part: a fact about the corpus as a
population — how many frames, how tall, what colour mode, what the band
contains — is a fact the catalog has already measured and published, so opening
a frame to establish one would breach the confirmation prohibition. What the
catalog cannot supply is a distance in pixels, which is precisely the one
question the log's only entry is about.

## Cross-reference obligation

This log and `docs/decisions/measurement-manifest.md` **must agree**, and the
obligation runs in both directions. The manifest states its half; this is the
reciprocal statement, so neither file depends on the other having been read.

| Direction                | The obligation                                                                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| From this log outward    | Every frame recorded here under clause (b) appears as a row in the manifest's frame table. A frame logged under clause (b) that the manifest does not name is either a mis-cited clause or an unauthorized open, and it is investigated as one         |
| From the manifest inward | A frame the manifest names but that nobody has opened does **not** appear here. The manifest is a list of what may be read; this log is a list of what was read, and padding one from the other destroys the only distinction that makes either useful |

The two records also agree on how many frames the measurement task was
authorized to read. Where they diverge, the precedence is fixed rather than
negotiable: **the manifest is the authority on what was permitted, and this log
is the authority on what was done.** A divergence between them is a finding to
be recorded, not a discrepancy to be smoothed away — if the log shows an open
the manifest never authorized, editing the manifest to cover it retrospectively
would defeat the purpose of having either file.

One further coupling exists in the other direction. The run's reporting ledger
quotes a `Frames opened` figure and points at this file for it, so the ledger
never carries an independent count. If the two ever disagree, this file is
right and the ledger is stale.

## Append-only discipline

Entries are added. They are never edited and never removed.

- **An entry that turns out to be wrong is corrected by a new entry** that says
  so and explains what was wrong. Overwriting the original would leave no trace
  that a correction happened, which is the failure mode an access ledger exists
  to prevent.
- **Entries stay in the order they were appended**, oldest first, so the log
  reads as a chronology rather than as a tidy summary.
- **The reported count is a row count over this file**, taken over rows that
  record a frame actually opened. The justification row records authorization
  rather than an open and is not counted, which is why the header table reports
  zero against one entry.
- **A frame opened twice is logged twice** if the two opens belong to different
  tasks, because the cap is per task and the log has to make each task's usage
  visible on its own.

### How to append an entry

Add one row to [the log](#the-log) at the bottom of the table, in the same five
columns, before or at the moment the frame is opened rather than afterwards.

- `Date` — the date of the open, as year, month and day.
- `Frame` — the frame number as a bare integer. No filename, no extension, no
  percent-encoded form.
- `Task` — the unit of work the open belongs to, named concretely.
- `Authorizing clause` — `(a)`, `(b)` or `(c)`, exactly as labelled under
  [When a frame may be opened](#when-a-frame-may-be-opened). Clause (a) also
  names the flow; clause (b) needs no further evidence than the manifest; clause
  (c) names where in the build prompt the frame is named.
- `What the catalog failed to answer` — the question the prose could not
  settle, phrased as a question about geometry, structure or behaviour, with the
  document consulted named. Never the answer, and never a string read from the
  image.

If a task's opens will exceed six, the same row shape carries the justification:
one entry for the task, naming the task and the question, appended before the
seventh frame is opened.

## If you are unsure whether you may open a frame

Take the question to `docs/workflows/` first. That is the sequence the rule
prescribes, and on the evidence of this run it is also the faster route: the
catalog has answered every question asked of it so far, including every
question about the corpus itself, and it carries its own measurements of the
population that a single frame could not establish anyway.

If the prose genuinely does not answer, check whether one of the three clauses
covers the frame you have in mind. If none does, the open is not permitted, and
the way forward is not a wider search — it is the uncertainty rule, the fourth
as provided: implement the smallest coherent behaviour consistent with adjacent
evidenced behaviour, and record the choice with its reasoning in
`docs/decisions/gap-register.md`. Uncertainty is never permission to omit
functionality, and it is never permission to browse the corpus either.

And if you do open a frame, append the row. A log with a gap in it is worth less
than no log at all, because it invites the reader to assume the gap is the only
one.
