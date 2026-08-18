# Typography, weight and radius: the values measurement cannot recover

Design tokens for this build are derived by deterministic measurement rather than
by visual judgement. One class of value defeats that method outright. A typeface,
a declared type scale, a declared line height, a declared weight and a corner
radius are not distances between region boundaries, so no amount of care with the
pixels recovers them.

This record is where those values are **authored openly instead of guessed
silently**. Each one ships as a working token with a written rationale, and each
is marked at its point of definition so that a reader of the token module can
always tell a value that was derived from a value that was chosen.

| Field                               | Value                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record for values the measurement method cannot recover                                                 |
| Status                              | Operative. Authored **before** the token module exists                                                           |
| Token families owned                | `--font-family-*`, `--font-size-*`, `--line-height-*`, `--font-weight-*`, `--radius-*`, and `--shadow-*` in part |
| Frames opened to author this record | **0**                                                                                                            |
| Sole declaration site               | `packages/ui/src/styles/tokens.ts`                                                                               |
| Consumed through                    | `packages/ui/src/styles/tokens.module.css`                                                                       |
| Companion records                   | `docs/decisions/measurement-manifest.md`, `docs/decisions/theme-and-color.md`, `docs/decisions/responsive.md`    |

**How this record cites.** A document citation names a file under
`docs/workflows/` together with its line number, so a bare `README.md` in the
citations below means the catalog index in that directory and never the one at the
repository root — the two are different documents and only the former is evidence.
A frame is cited by its number alone, never by a filename. No frame was opened to
author this record; every observation attributed to the corpus was resolved from
catalog prose.

## The marker that points here

Every value this record settles is marked at its point of definition in the token
module with exactly this line, character for character:

```text
// UNMEASURED — chosen default, see docs/decisions/typography.md
```

The dash is an em dash. The wording and the path are both load-bearing: the
marker is what a reviewer greps for, and its path is what a reader follows to get
here. **The filename is therefore fixed.** Renaming this record would leave every
one of those markers pointing at nothing, and a marker that resolves to nothing is
worse than no marker at all, because it reads as documented when it is not.

The marker's counterpart is the provenance stamp a measured token carries. Two
forms exist and there is no third:

| Form                                                  | What it means                                                                |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| A frame number, an output line and a detection method | The value was **derived** from pixels; audit it against the committed output |
| The marker above                                      | The value was **authored**; audit it against this record                     |

A geometric or typographic token carrying neither is a defect. That rule is set
in `docs/decisions/measurement-manifest.md` and this record does not restate it,
only satisfies its authored half.

## Why measurement reaches geometry but not type

The measurement contract — the crop, the four detection methods, the confidence
field and the committed output shape — belongs to
`docs/decisions/measurement-manifest.md` and is not repeated here. What matters
for this record is the single structural fact that follows from it.

All four methods answer questions of the form _where does one region stop and the
next begin_, and _how far apart are the repeats_. They operate on differences
between adjacent rows or columns of pixels and on the extent of a contiguous
block. That is what makes them reliable for a rail width or a row pitch, and it
is exactly what makes them useless for type:

| What the methods recover                               | What they cannot reach                                          |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| Region boundaries down the horizontal axis             | The family that rendered a glyph                                |
| Boundaries across the vertical axis                    | The size that was declared to produce a rendered glyph height   |
| Repeating pitch, without identifying an individual row | The line height, as distinct from the spacing around a block    |
| The extent of one discrete element                     | The weight, as distinct from stroke thickness after rasterising |
| —                                                      | A corner radius, which the same detector treats as one edge     |

The reasons are not incidental. **A rendered glyph does not disclose its
family**: no method here reads outlines. **A glyph height does not invert to a
declared size**, because the mapping between the two runs through the family's own
metrics, so the same measured height corresponds to different declared sizes in
different families. **A text block's pitch confounds line height with the spacing
around the block**, and no capture separates the two. **Stroke thickness is not a
weight**, because it varies with family, size, colour and the rasteriser. And **a
corner radius is a handful of anti-aliased pixels sitting exactly where boundary
detection is designed to collapse a transition into a single edge** — the detector
that finds the boundary is the same detector that erases the corner.

These are open work items, not omissions. Every one of them ships as a token with
an authored default, and nothing below is deferred for want of evidence.

## The evidentiary basis: absence, recorded as absence

There is a second, independent reason these values are authored rather than
read: **the specification never states one.** That was verified by counting
rather than assumed, across the 25 catalog documents under `docs/workflows/`:

| Term searched              | Occurrences | What the occurrences actually are                                                                                                                  |
| -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spacing scale`            | 0           | —                                                                                                                                                  |
| `border radius`            | 0           | —                                                                                                                                                  |
| `border-radius`            | 0           | —                                                                                                                                                  |
| `font-size`                | 0           | —                                                                                                                                                  |
| `line-height`              | 0           | —                                                                                                                                                  |
| `line height`              | 0           | —                                                                                                                                                  |
| `font-family`              | 0           | —                                                                                                                                                  |
| `font-weight`              | 0           | —                                                                                                                                                  |
| `radius`                   | 2           | **Both are the metaphor "blast radius"**, in two deferred area documents. Neither is a corner                                                      |
| `elevation`                | 1           | Used **negatively**: one surface's cells are separated by hairline dividers rather than by card borders or elevation (`20-help-community.md` L404) |
| `typeface`                 | 1           | The catalog's own instruction **not to adopt one** from observation (`19-brand-guidelines.md` L9)                                                  |
| `font size`, `font weight` | 1 each      | The **same sentence**, and it is about the catalog's own published site rather than the product (`README.md` L1058)                                |

Three of those rows deserve to be read rather than counted, because the raw count
understates the position.

**The two `radius` occurrences are not about corners at all.** Both are the
figurative "blast radius", used about the reach of a feature. So the number of
statements the catalog makes about a corner radius is not two but **zero**.

**The only sentence in the catalog that uses type vocabulary is not about the
product.** It sits inside a disclosed limitation about the catalog's own published
documentation site, and it records that a link and its surrounding body text were
measured and found identical in weight, style, size, family, background, border,
shadow, outline and padding — so colour alone distinguishes them
(`README.md` L1054–L1058). It is a finding of **sameness on a different artifact**,
and at no point does it state what any of those properties is set to. Citing it as
product evidence would be a misreading, and it is recorded here precisely so that
nobody makes one.

**The one `typeface` occurrence points the same way this record does.** A deferred
area document states plainly that nothing observed on the property it describes is
adopted as a design token, a colour, a typeface or a brand rule, and that the
document therefore specifies slots, ordering, nesting, states and relationships
and never what goes in the slots (`19-brand-guidelines.md` L9). The catalog
reached the same conclusion about type from the intellectual-property direction
that this record reaches from the measurement direction.

Set against that, roundedness **is** evidenced — qualitatively, 84 times across
the catalog and 12 times in the defining document across 11 component contracts,
as "rounded corners", "a rounded border", "a rounded chip", "rounded bars and
discs", "a rounded pill". So the _shape vocabulary_ is specified and the _numbers
are not_, which is why the radius scale below inherits its **step set** from
evidence and its **values** from this record.

That distinction is the whole posture. The catalog is prescriptive about it: its
layout specifications are proportional or relative — regions, columns, ordering
and relative sizing — never absolute pixel offsets, because an offset keyed to a
fixed canvas "would be wrong on 48 of the 1,022 frames" (`README.md` L935), and
the shell's own sizing is stated as proportional to the effective product
viewport for the same reason (`00-product-overview.md` L298). A specification
that declines to state absolute distances was never going to state a type scale.

**No frame was opened to author this record.** Every figure above is a count over
catalog prose or a citation of it. Opening a frame to look at type would have been
prohibited twice over: once because the catalog's silence is already established
and confirming it in the pixels is not a permitted reason to open anything, and
once because what a frame would disclose is identity rather than layout.

## The families this record owns

| Family            | Status                 | Where the value comes from                                                                            |
| ----------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `--font-family-*` | Authored in full       | This record                                                                                           |
| `--font-size-*`   | Authored in full       | This record                                                                                           |
| `--line-height-*` | Authored in full       | This record                                                                                           |
| `--font-weight-*` | Authored in full       | This record                                                                                           |
| `--radius-*`      | Authored in full       | This record; the step **set** follows the evidenced shape vocabulary above                            |
| `--shadow-*`      | **Split by detection** | Clustered from measurement where an elevation edge is detectable; authored and marked where it is not |

`--shadow-*` is the one family that spans both categories, and the consequence is
stated here as well as in the manifest so that it cannot be mistaken for an
inconsistency: **a marked `--shadow-*` entry sitting beside a measured one is the
intended outcome and must not be reported as a defect.** An overlay that dims a
backdrop produces a boundary a scanline can find; a soft shadow under a resting
card frequently does not.

Two neighbouring families are authored in full but are **not** owned here.
`--breakpoint-*` belongs to `docs/decisions/responsive.md`, because the corpus is
captured at exactly one width and responsive behaviour therefore has no evidence
at all. `--z-*` is a layering scale with no pixel signature; it is authored
alongside the tokens it orders. Both are named so that their absence from the
tables below reads as placement rather than omission.

## The family stack

Two stacks, declared once:

```text
--font-family-sans: system-ui, -apple-system, 'Segoe UI',
  Roboto, 'Noto Sans', Cantarell, 'Helvetica Neue', Arial,
  sans-serif;

--font-family-mono: ui-monospace, SFMono-Regular, Menlo,
  Consolas, 'Liberation Mono', 'DejaVu Sans Mono', monospace;
```

The first serves every interface surface. The second serves code and snippet
content, where the alignment of a fixed advance width is part of what the content
means — a snippet is offered as a distinct kind of message, and setting it in the
interface face would lose the column alignment that makes it readable.

Both stacks lead with the generic keyword that delegates to the platform's own
interface face, then name concrete faces as fallbacks for platforms whose browser
does not resolve the keyword, and terminate in the category default so the stack
can never fail to resolve.

**Nothing in this stack was derived from any frame.** No frame was opened to
choose it, no rendered glyph was inspected, and no attempt was made to determine
what typeface the captured product uses. Identifying, naming, reconstructing or
approximating the third party's typeface is **prohibited outright** by the
identity rule — the fifth of the five project rules as provided, governing
third-party identity — and a typeface is close enough to identity that
approximation would breach it as surely as naming would. The stack was chosen on
delivery, licensing and rendering merits alone, set out below. Whether it happens
to resemble anything in the corpus is not a criterion, was not evaluated, and
could not have been evaluated without opening a frame that nothing authorises.

**Options considered:**

1. **A system-first stack**, resolving to whatever interface face the reader's
   platform provides. **Chosen.**
2. **A self-hosted open-licensed family**, served from the application's own
   origin. Rejected. It is the strongest option for visual consistency across
   platforms, and consistency is not what this build is short of: it would add
   font bytes to the critical path of a cold shell load that is already held to a
   budget, and it would introduce a second class of static asset — with its own
   subsetting, preloading and caching decisions — for a benefit no acceptance
   criterion asks for. It remains the obvious upgrade if a brand face is ever
   commissioned, and switching to it changes one token.
3. **A hosted webfont from a third-party font service.** Rejected on three
   independent grounds: it puts a render-blocking request to a third-party origin
   on first paint; it requires admitting that origin to the content-security
   policy, which is deliberately explicit and narrow; and it makes the interface's
   most basic property depend on a network the deployment does not control.

**Rationale.** The project's stated preference is for boring, well-supported
choices, and a system stack is the most boring option available. It downloads
nothing, so it costs zero bytes on the cold-load budget and cannot produce a flash
of unstyled or re-laid-out text. It raises no licensing question, because nothing
is redistributed. It renders correctly on every platform by construction, since
the platform chooses the face. And it is the option that most nearly guarantees
the reader already has the glyph coverage the content needs — a message body may
carry unicode, emoji and right-to-left text, and a platform's own interface face
is the face most likely to cover all three without falling back mid-string.

## The font-size scale

Six steps. Names are semantic rather than numeric, because a token named for its
role survives a change of value and a token named for its size does not — a step
called `--font-size-14` that later renders at 15 is actively misleading, and
renaming it breaks every consumer.

| Token                 | Value      | Intended use                                                                                 |
| --------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| `--font-size-caption` | `0.75rem`  | Timestamps, badge and counter text, the live remaining counter, helper lines beneath a field |
| `--font-size-small`   | `0.875rem` | Secondary metadata in dense rows, control labels, menu rows, tab labels, chips               |
| `--font-size-body`    | `1rem`     | Message bodies, prose, field values, list rows — the default for anything readable           |
| `--font-size-title`   | `1.125rem` | Surface and modal titles, conversation header name, section leads                            |
| `--font-size-heading` | `1.25rem`  | Gate-surface headings, wizard step questions, details-pane title                             |
| `--font-size-display` | `1.5rem`   | The single largest step: the intro hero's heading and the page-level failure heading         |

At a default root size the six steps resolve to 12, 14, 16, 18, 20 and 24 device
pixels. Every step is rounded to a whole device pixel at that root size, which is
deliberate: a step landing on a fractional pixel is rasterised inconsistently
between platforms, and the inconsistency is most visible at the two smallest
steps, which is exactly where it matters most.

**The ratio.** Caption to display spans exactly a factor of two across five
steps, so the geometric mean ratio is the fifth root of two — approximately
**1.149**, between a major second and a minor third. Whole-pixel rounding means
the realised step-to-step ratios are not uniform: they fall between 1.111 and
1.200. That non-uniformity is stated rather than smoothed, because a reader
checking the scale against a formula should find the discrepancy documented
instead of concluding the scale is arbitrary.

**Options considered for the number of steps:**

1. **Four steps.** Rejected. The interface has to distinguish, in the same
   viewport, a timestamp from a dense row label, a row label from a message body,
   a message body from a surface title, and a surface title from a gate heading.
   Four steps forces two of those pairs onto one value, and the compromise lands
   on the pairs that share a region — a timestamp beside a body — where the
   collision is most visible.
2. **Six steps.** **Chosen.**
3. **Nine or more steps**, or an unbounded generated ramp. Rejected. Adjacent
   steps a reader cannot tell apart are steps a call site chooses between
   arbitrarily, and arbitrary choices at call sites are exactly what a token scale
   exists to prevent. A scale nobody can misuse is worth more than a scale that
   covers every hypothetical.

**Rationale.** Six is the smallest set that gives each distinct role in the
Phase-1 surfaces its own step without any two roles sharing one. The upper two
steps are used sparingly and only on surfaces that carry a single dominant
heading, which is why they sit outside the tighter progression of the lower four.

**Why relative units.** Every step is expressed in `rem`, so the whole scale is a
multiple of the reader's own root size and a reader who has raised their browser's
text size gets larger text everywhere without a single override. A scale in device
pixels would silently discard that preference, and discarding it is a defect
rather than a styling choice. The body step is deliberately `1rem` exactly: body
copy is never set below the reader's stated preference, and the two steps beneath
it are reserved for secondary and tertiary material that is not the thing being
read.

## The line-height scale

Two steps, expressed as **unitless multipliers**:

| Token                       | Value  | Intended use                                                                     |
| --------------------------- | ------ | -------------------------------------------------------------------------------- |
| `--line-height-tight`       | `1.25` | Headings, titles, single-line rows, control and menu labels, chips, badges, tabs |
| `--line-height-comfortable` | `1.5`  | Message bodies, prose, helper text, and any block that can wrap to a second line |

**Why unitless rather than absolute.** A unitless multiplier resolves against the
element's own computed font size, so it composes correctly when a size token
changes: raise `--font-size-body` by one step and the body's leading follows it
automatically. An absolute line height does not compose — it has to be re-derived
for every size it is paired with, which means one authored value per pairing
instead of one per role, and the pairing that gets forgotten is the one that
clips. Unitless is also the form that survives a reader's text-size preference,
for the same reason.

**Options considered:**

1. **A single line height** for everything. Rejected. At 1.5 a heading's own lines
   drift apart until the heading stops reading as one object, and at 1.25 a
   wrapping message body becomes hard to track from the end of one line to the
   start of the next. One value cannot serve both, and the failure is worse at the
   heading end because a heading is what a reader scans first.
2. **Two steps — tight and comfortable.** **Chosen.**
3. **Four or more steps**, one per size step. Rejected. It reintroduces the
   pairing problem that unitless multipliers exist to remove, and it makes the
   line-height family as large as the size family without adding a distinction a
   reader could name.

**Rationale.** Two is the smallest coherent set: one step for text that occupies a
single line or must read as a single object, one for text that wraps and is read
as prose. The uncertainty rule directs the smallest coherent behaviour consistent
with adjacent evidenced behaviour where the specification is silent, and the
specification is silent here. **Adding a third step requires a new row in this
table first**, with its own role stated — the same discipline the weight scale
below applies, and for the same reason: a value that appears in the token module
without a row here has no rationale attached to it and cannot be reviewed.

## The font-weight scale

Three steps, and deliberately no more:

| Token                   | Value | Intended use                                                                                                              |
| ----------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| `--font-weight-regular` | `400` | Body text, message bodies, field values, secondary metadata — the overwhelming default                                    |
| `--font-weight-medium`  | `500` | Emphasis inside a dense row: an unread conversation, the active destination, a column or group label, a tab label at rest |
| `--font-weight-bold`    | `700` | Headings, surface and modal titles, the display step                                                                      |

**Options considered:**

1. **Two weights — regular and bold.** Rejected. A dense row needs a way to mark
   itself as unread or active that is not a size change and not a colour change:
   size would break the measured row pitch the row sits in, and colour alone is a
   distinction the accessibility bar treats with suspicion. Bold is too heavy for
   that job — a sidebar of bold rows reads as a sidebar of headings — so a middle
   step is genuinely needed rather than merely convenient.
2. **Three weights — regular, medium, bold.** **Chosen.**
3. **Four or more**, adding a light or a semibold. Rejected for light on
   accessibility grounds, discussed below. Rejected for semibold on resolution
   grounds: the standard font-matching order resolves a requested weight **above**
   500 by searching upward first, so on a platform face with no distinct semibold
   a requested `600` lands on the bold face and collides with the heading weight.
   An emphasis step that sometimes renders as the heading step is worse than no
   emphasis step.

**Rationale.** Regular and bold are the two faces a family is expected to ship,
and a browser synthesises a bold where none exists, so neither `400` nor `700` can
fail to produce a visible distinction. `500` is present in the modern platform
interface faces, and the same matching order resolves a requested weight in the
400-to-500 range by searching **downward** once 500 is passed — so where a distinct
medium is absent, `500` lands on `400`. The failure mode is therefore "no emphasis"
rather than "wrong emphasis", which is the right direction to fail in. That
asymmetry, and not a preference about heaviness, is the load-bearing reason `500`
was chosen over `600`.

**Any additional weight requires a new row in this table first.** A weight
introduced at a call site is a value with no rationale, no accessibility check
against the size it is paired with, and no statement of what it distinguishes.

## The border-radius scale

Three steps. The **step set** is taken from the shape vocabulary the catalog
evidences — the corpus distinguishes three kinds of roundedness and no more — and
the **values** are authored here, because no numeric radius appears anywhere in
the specification.

| Token             | Value     | Intended use                                                                                                                                           |
| ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--radius-subtle` | `0.25rem` | Inputs, rows, small tiles, hover surfaces, the segmented code input's boxes, and the square-with-rounded-corners avatar used for a workspace or an app |
| `--radius-raised` | `0.5rem`  | Anything that reads as a raised surface: cards, modals, dialogs, menus, popovers, panels, the tinted validation block, the detached formatting bar     |
| `--radius-pill`   | `9999px`  | Anything whose outline is fully round by intent: the transient outcome pill, chips and their remove controls, badges, skeleton bars and discs          |

**The pill step exists for a documented structural reason.** The transient
outcome report is specified as a rounded pill at the foot of the content region
(`00-product-overview.md` L334), the indeterminate progress indicator as a pill at
the top of it, a recipient token as a rounded chip, and a loading placeholder as
rounded bars and discs. Those are four separate contracts whose outline is fully
round rather than merely softened, so a build without a pill step would have to
approximate it at each of them with the raised step and would get four slightly
different approximations. The step is evidenced; only its value is chosen.

**The pill value is not a member of the numeric progression.** It is a saturating
value: any radius at least half the element's shorter side clamps to exactly half,
so `9999px` resolves to a true semicircular end on an element of any height
without that height having to be known. That is also why there is no separate
circle step — applied to a square box, the same value yields a circle, which
covers the round person avatar and the filled circular play control without a
fourth row.

**Options considered:**

1. **A single radius for everything.** Rejected. It cannot express a pill at all:
   one value either leaves the pill contracts under-rounded or rounds an input
   until it reads as a chip.
2. **Three steps — subtle, raised, pill.** **Chosen.**
3. **Five or more steps**, interpolating between subtle and raised and adding a
   distinct circle. Rejected. The specification evidences exactly three kinds of
   roundedness, so the extra steps would encode distinctions nothing asks for, and
   a separate circle step duplicates what the saturating value already does.

**Rationale.** Three matches the evidenced shape vocabulary exactly — softened,
raised, fully round — which is the smallest set that can render every Phase-1
contract without approximating any of them. `0.25rem` is small enough that an
input still reads as a rectangle, `0.5rem` is the doubling of it rather than an
independent choice, and the pill is a shape rather than a measurement. Expressing
the two numeric steps in `rem` keeps them proportional to the reader's root size,
so a reader at a larger text size does not get a proportionally sharper corner.

## Reconciling authored type against measured geometry

This section is the one most likely to be skipped and the one whose omission
breaks something a reader can see, so it states an obligation rather than an
observation.

**The two halves of the token module are settled by different authorities, and
they meet inside the same box.** A row's height comes from measurement. The
leading of the text inside that row comes from this record. Nothing coordinates
them automatically, so they can disagree — and when they disagree the text
overflows its row, or clips, or pushes the row taller than the pitch the sidebar
was measured to repeat at.

| Measured token, from the tool | Authored token, from this record                 | What a conflict looks like                                                    |
| ----------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| `--row-pitch-comfortable`     | `--font-size-body` × `--line-height-comfortable` | A two-line message body exceeds the pitch and the list stops repeating evenly |
| `--row-pitch-compact`         | `--font-size-body` × `--line-height-tight`       | The single-line compact row grows and the density difference collapses        |
| `--sidebar-row-pitch`         | `--font-size-small` × `--line-height-tight`      | Sidebar rows drift out of the measured rhythm, most visibly in a long group   |
| `--control-height-*`          | `--font-size-small`, `--font-size-body`          | A field's value or a control's label clips against the control's own edge     |

**The authored value yields. The measured value never does.** This is the rule,
and it is not negotiable at a call site:

- When an authored line height, multiplied by its paired size, exceeds the
  measured row pitch it must sit inside, **the line height is reduced** — or the
  size step is changed — until it fits.
- When an authored font size does not fit inside a measured control height with
  room for the control's own internal padding, **the size is stepped down**.
- A measured value is **never** adjusted to accommodate an authored one, and never
  re-derived to make one fit. The measured value is evidence: it is what the
  surface actually was. Editing it to suit a leading choice would destroy the one
  half of the token module that has provenance, and would leave a token whose
  frame number and output line no longer describe it — which is a worse defect
  than the misfit it was trying to fix, because it is silent.

**This is a genuine ordering dependency.** The tool has to have run before the fit
can be checked, because until it has run the pitches and control heights do not
exist as numbers. The check is therefore performed **after** the first measurement
run and after any re-run that moves a pitch or a control height, and it covers, at
minimum: the body size against both message-row pitches, the small size against
the sidebar row pitch, and both sizes against every control height they are used
inside.

**Adjusting an authored value after measurement is a normal outcome, not a
failure.** It is what "authored" means: a value chosen in the absence of evidence,
held until evidence arrives, and revised when it does. An adjustment made this way
keeps its marker — it is still a chosen default, merely a better-informed one — and
it obliges the row in this record to move with it, per the synchronisation
obligation below. What would be a failure is discovering the misfit in a rendered
surface instead of in this check, or resolving it by editing the measurement.

## Accessibility and theming constraints on type

Colour is not settled here. It belongs to `docs/decisions/theme-and-color.md`,
which owns the palette and the dark-theme derivation. What this record owes that
one is a set of type choices that leave a compliant pairing **possible**, because
contrast is a property of a pair and half of the pair is authored here.

- **Body text holds 4.5:1 in both themes.** The dark theme is a derivation over the
  same token names rather than a separate set, so no consumer branches on theme —
  which means a size or weight that only works in one theme is not a workable
  choice at all. Type is chosen once and must survive both derivations.
- **The smallest size is never paired with the lightest weight for body copy.**
  This is the specific trap the scales above are built to avoid. Small and light
  compound: a thin stroke at a caption size loses coverage to anti-aliasing, and
  the effective contrast of the rendered glyph falls below what a contrast ratio
  computed from the two declared colours predicts. So the caption step is used with
  `--font-weight-regular` and above, never below it, and this is a further reason
  no light weight exists in the scale — a weight that cannot be used with the
  smallest size in body copy would be a step whose only safe uses are the ones the
  regular weight already serves.
- **Sizes respond to the reader's browser text-size preference.** Every size step
  and both numeric radius steps are expressed in `rem`, so they scale with the root
  size the reader has chosen. Device pixels appear in exactly one place — the
  saturating pill value, where the number is a clamp rather than a size and scaling
  it would mean nothing. A fixed-pixel type scale would override a stated
  accessibility preference, which is not a trade this build makes.
- **Line heights are unitless for the same reason.** A multiplier follows the size
  it resolves against, so raising the root size raises leading proportionally
  instead of leaving enlarged text crammed into unchanged leading.
- **Reduced-motion preference is honoured elsewhere and is not a type concern.**
  It is named here only so that a reader looking for it stops looking in this
  record. Nothing in the scales above animates, and no type token has a motion
  component.

Two further obligations are the component library's rather than this record's, and
are noted so the boundary is clear: a focus ring is rendered outside the border
rather than inside it, so it never encroaches on the space a size step was fitted
into; and a heading's step is chosen for its role in the surface, never to produce
a document outline, because outline order is a semantic-element question and not a
size question.

## Downstream contract

**`packages/ui/src/styles/tokens.ts` is the sole declaration site** for every
value in this record. The file does not exist at the time this record is written,
which is deliberate — this record is the contract it is built against, not a
description of it — and the obligations are therefore stated as requirements on it.

| Obligation                                                                                                                             | Applies to                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Every** entry in the typography and radius blocks carries the marker line reproduced at the top of this record, unaltered            | `packages/ui/src/styles/tokens.ts`                                              |
| Each `--shadow-*` entry carries **either** the marker **or** a measured provenance stamp, according to whether its edge was detectable | `packages/ui/src/styles/tokens.ts`                                              |
| Values are exposed to stylesheets as custom properties and consumed through the token surface, never re-declared                       | `packages/ui/src/styles/tokens.module.css`                                      |
| No component declares a type or radius value of its own, and no consumer branches on anything type-related                             | Every module under `packages/ui/src/components` and every surface in `apps/web` |

**Consumers read a token, never a literal.** A raw font size, line height, weight
or radius written into a component is a defect, and it is a defect for a mechanical
reason rather than a stylistic one: a literal at a call site has no marker, so it
has no provenance, so nothing distinguishes it from a measured value and nothing
tells a reviewer it was chosen. It is also a second declaration of a value this
record declares once, which is precisely what the single-implementation rule — the
first of the five project rules as provided — forbids. The mechanism that makes
that rule enforceable rather than aspirational is the import boundary in
`eslint.config.js`: a consumer cannot reach past a package barrel into another
workspace's source tree, so it cannot quietly grow a local copy of a shared
contract or of the tokens that contract is built from. The only permitted literals
in a consumer are the values that carry no design decision at all — zero, `none`,
`auto`, `inherit`, `currentColor` and `transparent`.

**No consumer branches on anything type-related.** There is no theme conditional
on a font size, no density conditional on a line height, and no platform
conditional on a family. The two message densities differ by which pitch and which
line-height token they use, both resolved through the same names; they are not two
code paths.

### Synchronisation obligation

**Changing a value here changes the token module in the same change.** Three
artifacts describe these values and they move together or the set is inconsistent:

| Artifact                                   | What it holds                                     |
| ------------------------------------------ | ------------------------------------------------- |
| `docs/decisions/typography.md`             | The options considered, the choice, the rationale |
| `packages/ui/src/styles/tokens.ts`         | The declared value and its marker                 |
| `packages/ui/src/styles/tokens.module.css` | The custom property every consumer actually reads |

A change that touches two of the three leaves this record lying, and a reader will
trust it anyway. Two specific obligations follow:

- **The marker's target path must continue to resolve.** If this file is ever moved
  or renamed, every marker in the token module is updated in the same change. There
  is no version of that change that is safe to split.
- **A re-run of the measurement tool never strips a marker.** A value this record
  authors stays authored across a re-run, because a re-run does not make an
  unrecoverable value recoverable. Converting an authored default into a measured
  one requires a method that can actually recover it, which would be a change to
  the measurement contract in `docs/decisions/measurement-manifest.md` and not a
  side effect of running the tool again.

## Change control

To **change** a value: change the row in the table above, change the declaration
in the token module, and re-check the fit against the measured geometry that value
sits inside. All three in the same change.

To **add** a step to any scale: add its row here first, carrying the same fields
every existing row carries — token, value, intended use — together with the
options considered, the choice and the rationale in the surrounding prose. A step
that appears in the token module without a row here has no rationale attached to
it, cannot be reviewed, and cannot be told apart from an accident.

To **remove** a step: state which consumers used it and which step they move to. A
step may not be deleted while a consumer still resolves it, and a consumer may not
be left resolving a step that no longer exists.

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **No frame was opened.** Every figure in this record is a count over catalog
  prose or a citation of it. The counts in the evidentiary table were taken by
  searching the 25 documents under `docs/workflows/`, which is reading the
  specification rather than the corpus.
- **No font choice was read from a frame, and no typeface was identified.** The
  stack is justified on delivery, licensing and rendering grounds alone. Naming,
  reconstructing or approximating the captured product's typeface is prohibited,
  and no attempt was made at any of the three.
- **Frames by number only.** Where a frame is referenced at all it is a bare
  integer. No filename appears anywhere in this record, and neither does the
  catalog's percent-encoded citation form — both carry a third-party product name,
  which is prohibited in source, comments, copy and file names alike.
- **Rules cited by subject and position, not by identifier.** The five project
  rules carry platform identifiers that each embed a third-party product name, so
  writing one here would breach the identity rule this record is otherwise
  observing. They are cited by what they govern and where they sit in the provided
  order instead — the single-implementation rule is the first, the corpus-handling
  rule the third, the uncertainty rule the fourth, the identity rule the fifth.
  Position alone would be unsafe, because the identifiers are permuted relative to
  the requirement labels; position **with** subject is not.
- **Functional naming throughout, and no transcribed copy.** Surfaces and controls
  are named for what they do — conversation sidebar, transient outcome pill,
  segmented code input, intro hero, page-level failure surface. No string legible
  in any frame is reproduced, and no colour value appears anywhere in this record.
- **No diagram fences.** The committed documentation-site configuration does not
  render them: its superfences extension consumes a fenced block before the diagram
  plugin can claim it, so a diagram fence publishes as a highlighted code box. This
  record uses tables and prose instead, and it neither adds a navigation entry to
  the site configuration nor applies the withheld extension fix — both are out of
  bounds.
- **Fenced lines are held to 74 characters**, the catalog's measured ceiling,
  because a published fence clips rather than wraps. The marker line is 64
  characters, which is why it fits on one line and must never be wrapped onto two:
  a wrapped marker is not the marker.
- **Evidence by citation; absence recorded as absence.** Where the specification
  supplies nothing, the table says zero and the prose says why the zero is the
  point. Nothing is supplied as though it had been found.
- **Every value is decided.** Nothing in this record is left open, deferred or
  marked for later. Uncertainty about a number is not permission to omit the token
  that number parameterises — the fourth rule as provided says so directly — so
  every family named here ships with a working value and a reason.
