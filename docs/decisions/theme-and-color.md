# Colour: the thirteen tokens, the dark derivation and the contrast contract

Most design values in this build are derived by deterministic measurement, and the
ones measurement cannot reach are authored openly and marked as authored. Colour
belongs to neither group. It is the one dimension where the source is fixed in
advance by instruction, where reading the pixels is prohibited rather than merely
unhelpful, and where the specification — by its own deliberate design — supplies
nothing at all.

This record is where the supplied palette becomes a **token contract**: thirteen
names bound to thirteen values in exactly one file, a dark theme expressed as a
derivation over those same thirteen names, and a contrast obligation stated as
arithmetic rather than as an intention.

| Field                               | Value                                                                                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record for the colour palette, the theme derivation and the contrast contract                                                                         |
| Status                              | Operative. Authored **before** the token module and the two theme stylesheets exist                                                                            |
| Token names owned                   | `--brand-600`, `--brand-700`, `--brand-050`, `--accent`, `--ink-900`, `--ink-600`, `--ink-400`, `--surface`, `--ground`, `--rule`, `--good`, `--warn`, `--bad` |
| Themes owned                        | Two derivations over those thirteen names, plus a third selection position that follows the reader's platform                                                  |
| Frames opened to author this record | **0**                                                                                                                                                          |
| Sole declaration site               | `packages/ui/src/styles/tokens.ts`                                                                                                                             |
| Bound at                            | `packages/ui/src/styles/theme-light.css`, `packages/ui/src/styles/theme-dark.css`                                                                              |
| Consumed through                    | `packages/ui/src/styles/tokens.module.css`                                                                                                                     |
| Companion records                   | `docs/decisions/typography.md`, `docs/decisions/measurement-manifest.md`, `docs/decisions/responsive.md`, `docs/decisions/state-matrix.md`                     |

**How this record cites.** A document citation names a file under
`docs/workflows/` together with its line number, so a bare `README.md` below means
the catalog index in that directory and never the one at the repository root — the
two are different documents and only the former is evidence. A frame is cited by
its **number alone**, never by a filename: every filename in the corpus embeds a
third-party product name, and so does the catalog's own percent-encoded citation
form, both of which are prohibited in a committed file. No frame was opened to
author this record, and every observation attributed to the corpus below was
resolved from catalog prose.

**How this record cites the project rules.** By subject and by position in the
order they were provided, never by identifier. The five rule identifiers each
embed the same third-party product name, so writing one into this file would
breach the very rule the file is otherwise observing. The rules that govern here
are the **single-implementation rule** (the first as provided), the
**corpus-handling rule** (the third), the **uncertainty rule** (the fourth) and
the **identity rule** (the fifth). Position alone would be unsafe, because the
identifiers are permuted against the requirement labels they correspond to;
position together with subject is not. This is the convention
`docs/decisions/typography.md` already established, and it is followed here so the
decision records read consistently.

## The sole source, stated before any value appears

Three statements govern everything below. They are placed ahead of the first value
deliberately, because a reader who meets a palette before its provenance will read
the palette as a description of something that was observed. It is not.

1. **The thirteen values in this record come from the build prompt, and from
   nowhere else.** They were not measured, not sampled, not inferred from a
   rendering, and not adapted from anything in the corpus. There is no second
   source to reconcile them against, and no part of the specification competes
   with them.

2. **Sampling a colour value from a frame is prohibited outright.** Not
   discouraged, not permitted-with-justification, not allowed for a single
   hard-to-decide case: prohibited. The identity rule states it as an absolute,
   because a brand palette is identity in the same way a wordmark is, and the
   frames depict another company's product. Approximating a sampled value, or
   deriving one from a sampled value, breaches the rule exactly as reproducing it
   would — the prohibition is on the act of taking, not on the exactness of the
   result.

3. **Colour is a named carve-out from the precedence order that otherwise lets the
   pixels win.** The corpus-handling rule makes an opened frame govern over
   catalog prose where the two conflict, and then removes three subjects from that
   grant: colour values, icon artwork and product copy, each of which is governed
   by the build prompt and never by the pixels. So there is no reading of any
   frame, however careful or well-motivated, that can put a colour value into this
   build. A frame cannot be evidence about colour here, which is a large part of
   why this record needed to open none.

## The evidentiary basis: the specification states no colour at all

There is a second, independent reason the palette can only have come from the
build prompt, and it is the strongest fact in this record because it removes the
possibility of accidental inheritance rather than merely forbidding deliberate
copying. **The specification contains no colour value.** That was verified by
counting across the 25 documents under `docs/workflows/`, not assumed:

| Notation searched    | Occurrences across all 25 catalog documents |
| -------------------- | ------------------------------------------- |
| `#RRGGBB`            | **0**                                       |
| `#RGB`               | **0**                                       |
| `#RRGGBBAA`          | **0**                                       |
| `rgb()` and `rgba()` | **0**                                       |
| `hsl()` and `hsla()` | **0**                                       |

Roughly four megabytes of prose specifying an interface in detail, and not one
colour value in any notation. That is not an oversight in the catalog; it is a
policy the catalog states three times in its own words, and each statement is
worth reading rather than counting:

- **Treatments are named by role, never by value.** The state catalog fixes its
  whole vocabulary that way — a _cautionary_ treatment, a _destructive_ treatment,
  a _success_ treatment, a _de-emphasised_ treatment with reduced contrast against
  its surrounding surface, an _inverted_ surface and the _default_ surface — and
  says why: no palette value from the corpus is carried forward, because the only
  palette observable belongs to a third party (`21-states.md` L109).
- **The shell's own colour treatment is disclaimed as a requirement.** Where the
  catalog records that every shell region renders in a dark mode, it adds in the
  same breath that the observed palette belongs to a third party and is not
  adopted (`00-product-overview.md` L216).
- **A later area repeats the rule with worked examples.** No palette value is
  carried forward as a requirement, and every colour is named by role instead — a
  success colour on a joined marker, an accent colour on a ticked option's label, a
  tinted highlight behind a matched term (`09-search-and-filters.md` L348).

So the two positions coincide rather than merely coexisting. The identity rule
forbids taking a colour from the corpus, and the specification has none to take.
Every colour name the catalog uses is a **role**, and a role is exactly what a
token is — which is why the palette below can be bound to the catalog's vocabulary
without adopting anything from the pixels.

## The thirteen tokens

Thirteen names, thirteen values, one semantic role each. This is the entire colour
vocabulary of the product in its default theme; there is no fourteenth, and adding
one is a change to this record before it is a change to any file.

| Token         | Value     | Semantic role          |
| ------------- | --------- | ---------------------- |
| `--brand-600` | `#4F46E5` | Primary                |
| `--brand-700` | `#4338CA` | Primary pressed        |
| `--brand-050` | `#EEF2FF` | Primary wash           |
| `--accent`    | `#0E9B8E` | Secondary and emphasis |
| `--ink-900`   | `#14161D` | Text primary           |
| `--ink-600`   | `#454B5B` | Text secondary         |
| `--ink-400`   | `#767C8F` | Text muted             |
| `--surface`   | `#FFFFFF` | Raised surface         |
| `--ground`    | `#FCFCFD` | Page ground            |
| `--rule`      | `#E2E4EB` | Hairline               |
| `--good`      | `#0E7A50` | Success                |
| `--warn`      | `#A15C00` | Warning                |
| `--bad`       | `#B32741` | Destructive            |

Two properties of that table are worth naming, because both are load-bearing
later.

**The names are roles, not descriptions of appearance.** `--ink-900` means _text
primary_; it does not mean _dark_. `--surface` means _raised surface_; it does not
mean _white_. This is what makes a second theme possible without a second
vocabulary, and it is the reason the derivation in the next section can invert
values without renaming anything.

**The ramps are ordered, and the order is the contract.** `--ink-900` outranks
`--ink-600`, which outranks `--ink-400`, in emphasis and therefore in contrast
against whatever they sit on. `--brand-700` is one step further from the page than
`--brand-600`, and `--brand-050` is a wash lying close to the page. A theme may
change what those steps are worth; it may not reorder them.

### The catalog's role vocabulary resolves onto these names

The catalog anticipated a build substituting its own palette and published the
substitution table for it, once, centrally (`00-product-overview.md` L616–L628).
Mapping it onto the tokens above is what lets every role the catalog names be
honoured without a value being taken from anywhere:

| Catalog placeholder     | Token it resolves to                                                              |
| ----------------------- | --------------------------------------------------------------------------------- |
| Primary brand colour    | `--brand-600`, with `--brand-700` and `--brand-050` as its pressed and wash steps |
| Accent colour           | `--accent`                                                                        |
| Text primary            | `--ink-900`, with `--ink-600` and `--ink-400` as its secondary and muted steps    |
| Surface default         | `--surface`, with `--ground` as the page beneath it                               |
| Cautionary treatment    | `--warn`                                                                          |
| Destructive treatment   | `--bad`                                                                           |
| Success treatment       | `--good`                                                                          |
| De-emphasised treatment | `--ink-400` for a muted mark, or a control's own reduced-emphasis state           |
| Inverted surface        | `--ink-900` as the fill with `--surface` as the content on it                     |
| Default surface         | `--surface`                                                                       |

The catalog's placeholder list is wider than thirteen in one respect: it offers
four numbered accent slots where this palette supplies one. That is recorded as it
stands rather than padded out. A single accent is what the build prompt supplies,
one accent is what ships, and a second accent would be a new token requiring its
own row here, its own contrast pairings and its own reason — not a slot waiting to
be filled.

### The palette's character, and what it constrains

Two properties were stated with the palette and both bind future additions as much
as present use:

- **Neutrals carry a slight cool bias.** The blue channel sits above the red
  channel in every neutral step, which is what keeps the greys from reading warm
  next to the brand ramp.
- **No pure mid-grey is used.** Not one of the neutral steps is achromatic in the
  middle of the range. The only value in the palette whose three channels are
  equal is `--surface`, and pure white is an endpoint of the range rather than a
  mid grey, so the constraint holds exactly as it was stated. Even `--ground`, a
  hair off white, carries the bias.

**Both are constraints on any future addition, not observations about the present
one.** A new neutral that is achromatic in the mid range, or whose blue channel
does not lead, would break the palette's coherence in a way that is difficult to
see one token at a time and obvious across a surface. A reviewer can check both
mechanically, which is why they are written down rather than left to taste.

### Declared once: thirteen literals, one file

**These thirteen literals may appear in exactly one file in the source tree —
`packages/ui/src/styles/tokens.ts` — and nowhere else.** Not in a component, not
in a feature, not in a stylesheet, not in a test fixture, and not in a
configuration module. Every consumer resolves a **token**; no consumer resolves a
**value**.

That is the single-implementation rule applied to colour rather than to a
component, and the reasoning transfers exactly. A value written a second time is a
second declaration of one contract: the two copies can drift, only one of them can
be found by a reader looking for the palette, and a value that appears at a call
site carries no provenance, so nothing distinguishes a legitimate token value from
one that was sampled from somewhere it should not have been. Confinement is what
gives a sampled value nowhere to hide.

**The confinement is enforced mechanically, and it already is.**
`eslint.config.js` carries a `no-restricted-syntax` restriction matching a three-,
four-, six- or eight-digit hex colour anywhere inside a string literal or inside a
template literal's static text, applied across the workspace, with a single
exception block scoping the token module out of it. A stray colour value is
therefore a **pipeline failure rather than a review comment**, and the restriction
covers the interpolated case as well as the plain one, so an inline stylesheet
string is not an open door.

**What that enforcement does not reach, recorded rather than glossed.** The
restriction operates on a JavaScript or TypeScript syntax tree, and every file set
it is configured against is a TypeScript or JavaScript glob, so it never parses a
`.css` file. The documentation tree is excluded from the linter's file set outright,
so it never parses a Markdown file either — a fact confirmed by running the linter
against this record, which reports it as ignored. Two consequences follow and both
are load-bearing:

- **A colour value written into a stylesheet would not be caught by the linter.**
  The obligation on the two theme stylesheets is therefore discharged by their
  design rather than by the linter: they bind names to primitives and contain no
  literal at all, as the next section sets out. The brand-and-palette guard under
  `tools/check-brand/` is the pipeline step that closes the stylesheet surface, and
  closing it is part of that tool's contract.
- **This record is not covered either, which is why it may state the values.** A
  decision record is not a consumer: nothing resolves a value from it, nothing
  imports it, and a value here cannot drift into a rendering. A token named
  without its value cannot be reviewed or audited at all, so the values appear
  here — in this table and in the derived table below, and nowhere else in the
  document.

## The dark theme is a derivation, not a second palette

**The decision, stated plainly: the dark theme rebinds the same thirteen token
names to different values. It is not a parallel palette with names of its own, and
it is not a set of component variants.** A consumer writes
`background: var(--surface)` once and receives whichever value the active theme has
bound to that name. Nothing in a component knows which theme is in force, nothing
reads a theme flag, and there is no conditional anywhere in the tree whose
condition is the theme.

That is a direct consequence of the single-implementation rule. A component with a
light variant and a dark variant is **two implementations of one contract**, sharing
a name and drifting independently — which is precisely the failure the rule exists
to prevent, and it is no less a failure for being expressed in a stylesheet rather
than in a second module. Thirty-seven component contracts multiplied by two themes
would be seventy-four implementations to keep in step. Rebinding thirteen names
instead means the count stays at thirty-seven, and a theme change cannot introduce
a visual regression in a component whose code it never touches.

The rule also settles what a _theme_ may be. It may change what a token is worth.
It may not add a token, remove one, rename one, reorder a ramp, or move a role from
one name to another. A derivation that did any of those would force a consumer to
know which theme it was in, and the moment a consumer knows that, the single
implementation has become two.

### The documentary grounding for theming at the token layer

Theming could reasonably have been scoped to a region — a dark sidebar against a
light content region is a common arrangement, and the corpus does contain one
capture in which a shell renders dark while a results region renders light
(`09-search-and-filters.md` L348). The catalog nevertheless settles the question
directly and against that reading:

> Colour mode is a shell-wide property. Every region renders in the mode,
> including the top bar and the content region, so a build must treat colour mode
> as a token set applied to the whole shell rather than a sidebar skin
> (`00-product-overview.md` L216).

Two further statements corroborate it from inside the Phase-1 area documents rather
than from the index alone. The colour mode is a **shell-wide preference** owned by
the product-overview document and set from the preferences area, and the message
list, the composer and an open typeahead panel all render in the selected mode
(`03-messaging-and-composer.md` L502, L642).

The most useful observation for this record is a negative one, and it is what makes
a token-layer derivation safe rather than merely tidy: where the catalog describes
a conversation read in a dark mode, it records that **the conversation's anatomy is
unchanged by it** — the header, the bookmark row, the message list and the composer
sit exactly where they sit in the light captures (`05-direct-messages.md` L142).
Geometry is therefore theme-invariant. A theme changes values and nothing else,
which is why it can be a rebinding of names and needs no participation from the
components whose names it rebinds.

The words _colour mode_ appear in the catalog in one other sense that must not be
conflated with this one: the corpus's own pixel format is reported as RGBA in all
1,022 frames (`README.md` L933). That is a property of the image files, not of the
product's theme.

### Every dark value below is authored, and none was read from a frame

This needs saying explicitly, because unlike the unmeasurable type values, a dark
palette is a thing the corpus visibly contains. Several captures render the shell
in a dark mode, and the catalog cites them by number. **Their existence changes
nothing.** No frame was opened to author this section, and had one been opened it
could not have supplied a value: colour is the carve-out where the build prompt
governs and the pixels never do, so a dark value observed in a frame is exactly as
unusable as a light one. The derived values below were arrived at by holding the
supplied palette's hues and reasoning about role, elevation and contrast, and every
contrast figure quoted for them is arithmetic performed on the two values named,
not a judgement about how they look.

### How both themes bind the same names while the literals stay in one file

The confinement rule and the two-theme requirement pull against each other if a
theme stylesheet is allowed to write a value: a stylesheet that sets
`--surface` to a literal is a second declaration site, and generating that
stylesheet from the token module does not help, because a generated file is still a
file in the tree containing the thirteen literals.

**Options considered:**

1. **Two layers — the declaration site holds every value as a primitive, and each
   theme stylesheet binds the thirteen semantic names to primitives through
   `var()`. Chosen.** No colour value appears in either theme stylesheet, so the
   confinement holds literally, and both files bind the identical set of names.
2. **Generate both theme stylesheets from the token module and commit them.**
   Rejected. It puts the literals in three files instead of one, so the confinement
   becomes a claim about which file is authoritative rather than a fact about where
   values exist, and it needs a drift check in the pipeline to stay true.
3. **Apply the theme by writing custom properties onto the document element from
   TypeScript at run time.** Rejected. It keeps the values in one file, but the
   first paint then depends on script execution, so a reader gets an unthemed
   flash on a cold load — and the cold-load budget is a stated performance target.
   It also puts a presentational concern into application code, where the
   stylesheet layer cannot be reviewed on its own.

**Rationale.** The two-layer arrangement is the only option that makes the
confinement a property of the tree rather than a convention about it, and it costs
nothing at run time: both files are plain stylesheets, both are static, and the
cascade does the work. The primitive names are an implementation detail of the
declaration site — a consumer never writes one and never sees one, and only the
thirteen semantic names cross the package boundary.

```text
packages/ui/src/styles/tokens.ts
  the only file in the tree holding a colour value; exposes
  each one as a primitive custom property

packages/ui/src/styles/theme-light.css
packages/ui/src/styles/theme-dark.css
  bind the thirteen semantic names to primitives via var();
  no colour value appears in either file

packages/ui/src/styles/tokens.module.css
  exposes the thirteen semantic names to every stylesheet

any component stylesheet
  color: var(--ink-900); background: var(--surface);
```

### The derivation, family by family

Each family below states the options considered, the choice and the reasoning,
because every one of these values is authored and an authored value without a
recorded reason cannot be reviewed — it can only be accepted or replaced.

#### Ground and surface

`--surface` means _raised_, and raised is a relationship rather than a value. The
pair therefore inverts, and the relationship survives the inversion: whatever the
theme, `--surface` sits one step toward the light from `--ground`.

**Options considered:** invert the pair and keep surface the raised value
(**chosen**); keep surface darker than ground so a card reads as recessed
(rejected — it inverts the elevation metaphor while keeping the same token names,
which is the one thing a derivation may not do, and every card, menu, popover and
modal in the library depends on the raised reading); collapse the two to one value
(rejected — it removes the only cue that separates a floating surface from the page
behind it, and the library has no other).

**Rationale.** The dark ground takes the palette's own darkest value, so the two
themes share their extremes and only swap which role each extreme plays. That
choice costs no new colour value at all, and it keeps the darkest thing in the
light theme and the darkest thing in the dark theme identical, which is a useful
property when a surface has to work in both — an inverted pill, for example.

#### The ink ramp

The ramp inverts so that `--ink-900` becomes the highest-contrast text against the
dark ground **while keeping its semantic name**. It is still _text primary_; it is
simply no longer dark.

`--ink-900` takes the light theme's `--ground` value, which is the second role swap
and the second dark value that costs no new literal.

`--ink-600` is newly authored. **Options considered:** role-swap the light
`--rule` value into the secondary slot (rejected — measured at roughly 13:1 against
the dark surface it lands within touching distance of primary at 15.85:1, which
collapses a three-step ramp into two effective steps and leaves secondary text
indistinguishable from primary); author a value that sits between muted and primary
(**chosen**).

**Rationale.** A three-step ink ramp is only worth three names if the three steps
are distinguishable, so the secondary step is placed where it is visibly below
primary and comfortably above the text threshold: 9.71:1 against the dark surface,
against 8.71:1 for the light theme's secondary. Matching the light theme's spacing
rather than maximising contrast is deliberate — the ramp should feel like the same
ramp in both themes, and a secondary step that reads as primary in one of them is a
step the build cannot use.

`--ink-400` is the one token that **does not change value between themes**, and
that is a decision rather than an omission. **Options considered:** lighten it in
the dark theme until it clears 4.5:1 (rejected); keep the supplied value in both
themes (**chosen**).

**Rationale.** A cool mid neutral is muted against both extremes — the supplied
value measures 4.16:1 on the light surface and 3.91:1 on the dark one, so it plays
the same role in both without adjustment. The decisive argument is the second one:
the supplied value does not clear 4.5:1 against white, so muted text is barred from
carrying meaning in the light theme regardless of what the dark theme does. Had the
dark value been lifted above the threshold, that prohibition would have become
**theme-dependent** — and because no consumer branches on theme, a token that is
safe for meaningful text in one theme and unsafe in the other is a trap that cannot
be avoided at the call site. Holding the value fixed keeps one rule for one token.

#### The hairline

`--rule` moves to a low-contrast **light** hairline. On a near-black surface a
divider reads as a slightly lighter line; a darker line disappears into the
surface.

**Options considered:** author a value a hair lighter than the dark surface
(**chosen**); keep a dark hairline (rejected — invisible against the dark ground,
so the token would be present and inert); express the hairline as a translucent
white (rejected — the rendered result then depends on whatever sits behind it, so
one token yields different contrast in different places and cannot be asserted
once, which defeats the point of testing the pairings at all).

**Rationale.** The chosen value measures 1.29:1 against the dark surface and
1.43:1 against the dark ground, against 1.27:1 and 1.24:1 for the light theme's
hairline. The near-match is deliberate: a hairline that is louder in one theme
reads as a heavier border rather than as the same divider, and a build that ships
both themes should not have two different senses of how firmly a list is divided.
The contrast obligations that follow from these low figures are set out in the
contrast section, which does not treat them as a defect.

#### The brand ramp

The brand ramp is **adjusted for perceived lightness rather than mechanically
inverted**, because a saturated primary that works on white is often too dark on a
dark ground: it stops separating from the page, and the label sitting on it stops
being legible.

**Options considered:** invert lightness mechanically (rejected — it shifts the
hue, and it sends the pressed step in a direction that reads as an error); reuse
the light values unchanged (rejected — the primary would sit too close to the dark
ground to read as a fill); hold the hue and raise perceived lightness
(**chosen**).

**Rationale.** Hue is what makes a brand ramp recognisable as one ramp across two
themes, and lightness is what makes it legible against a given ground — so holding
the first and moving the second is the only adjustment that keeps both properties.
The derived primary measures 7.41:1 against the dark surface and 8.24:1 against the
dark ground, against 6.29:1 and 6.13:1 for the supplied primary in the light theme:
comparable separation from the page in both, which is the property a fill needs and
the one a mechanical inversion loses.

**The pressed step is governed by one rule that produces two directions.**
`--brand-700` is defined as _one step further from the ground than_ `--brand-600`.
In the light theme the ground is near-white, so further from it means darker, and
the supplied pressed value is indeed darker than the supplied primary. In the dark
theme the ground is near-black, so further from it means lighter, and the derived
pressed value is lighter than the derived primary. This is the clearest example of
why the derivation is not an inversion: one stable rule about the _relationship_
yields opposite movements in the two themes, and a mechanical inversion would have
got the dark theme's pressed state backwards.

`--brand-050` is a wash, defined as a small step from the ground in the brand's
hue. In the light theme that is a pale tint on white; in the dark theme a deep tint
on near-black. The derived value was tuned so the wash measures 1.11:1 against the
dark surface where the supplied wash measures 1.12:1 against the light one — the
wash is equally quiet in both themes, because a wash that is louder in one reads as
a different component rather than the same one.

**The consequence worth stating on its own.** Because `--surface` and the brand
ramp invert together, a primary button is written once —
`background: var(--brand-600); color: var(--surface)` — and is legible in both
themes: the label measures 6.29:1 on the light primary and 7.41:1 on the dark one.
In the light theme that resolves to a near-white label on a deep fill; in the dark
theme to a dark label on a light fill. **Neither the component nor its stylesheet
knows which.** That is the derivation working as designed, and it is the strongest
single demonstration that no consumer needs a theme-aware variant.

#### The accent

The accent holds its hue identity and is raised in lightness, on the same reasoning
as the brand ramp.

The accent also carries a problem this record has to state rather than smooth over.
**No ink works behind the accent in both themes.** Against the supplied accent, a
near-white label measures 3.44:1 — below the text threshold — and against the
derived dark accent, the dark theme's own primary ink measures 1.82:1. There is no
choice of derived value that fixes both ends, because the two ends pull in opposite
directions.

**Options considered:** add an on-accent text token (rejected — the palette is
thirteen tokens and a fourteenth is a change to the palette, not a derivation
decision, and it would need its own row, its own pairings and its own reason);
permit accent-as-text in the dark theme only, where the derived value does clear
the threshold (rejected — a theme-dependent usage rule, which no consumer can act
on); **treat the accent as a non-text mark colour in both themes (chosen)**.

**Rationale.** The accent's role is _secondary and emphasis_, and emphasis does not
require the emphasised thing to be coloured — it requires it to be marked. So the
accent is permitted for a non-text mark, a selection indicator, a state dot or a
stroke, where the three-to-one threshold for a non-text element governs and both
themes clear it. Emphasis expressed as **text** uses `--brand-600`, which clears
the text threshold in both themes at 6.29:1 and 7.41:1.

This has a worked consequence for a case the catalog evidences. Where the catalog
records an accent colour on a ticked option's label
(`09-search-and-filters.md` L348), the implementation puts the accent on the
**tick glyph** and leaves the label at `--ink-900`. The option still reads as
selected, the reading no longer depends on distinguishing two label colours, and
the label stays above the threshold. The corpus's arrangement is honoured in
behaviour and improved in accessibility, which is the trade the accessibility
obligation is there to force.

**The asymmetry is recorded, not reconciled.** The accent measures 3.44:1 against
the light surface and 8.70:1 against the dark one. The prohibition on
accent-as-text is nevertheless absolute, because the binding constraint is the
light theme and one token carries one rule.

#### Success, warning and destructive

All three **keep their hue identity while their lightness is raised enough to clear
contrast**.

**Options considered:** reuse the supplied values (rejected — they are chosen
against white and lose separation from a near-black ground); shift hue toward
whatever reads most easily on dark (rejected — hue _is_ the identity of a status
colour; the state catalog's whole vocabulary is _cautionary_, _destructive_ and
_success_ as roles recognised at a glance (`21-states.md` L109), and a warning
that stops being amber stops being recognisable as one); hold hue and raise
lightness (**chosen**).

**Rationale.** Each was verified in both directions, because each is used both as
text or a glyph on a surface and as a fill carrying a label. As text on the dark
surface the three measure 8.14:1, 7.49:1 and 6.09:1; as fills carrying a
`--surface` label they measure identically, because the pair is symmetric. Both
uses clear the text threshold in both themes, so neither the fill form nor the text
form needs a theme-aware exception.

### The derived values

Every value in the right-hand column is **authored**. None was read, sampled or
approximated from any frame.

| Token         | Light theme | Dark theme | How the dark value was arrived at                                              |
| ------------- | ----------- | ---------- | ------------------------------------------------------------------------------ |
| `--brand-600` | `#4F46E5`   | `#ADA6F7`  | Newly authored; hue held, perceived lightness raised                           |
| `--brand-700` | `#4338CA`   | `#C6C1FB`  | Newly authored; one step further from the ground than primary                  |
| `--brand-050` | `#EEF2FF`   | `#28263E`  | Newly authored; a wash one small step from the ground in the brand hue         |
| `--accent`    | `#0E9B8E`   | `#4FD1C3`  | Newly authored; hue held, lightness raised                                     |
| `--ink-900`   | `#14161D`   | `#FCFCFD`  | **Role swap** — takes the light theme's `--ground` value; no new literal       |
| `--ink-600`   | `#454B5B`   | `#C3C8D6`  | Newly authored; placed between muted and primary so the ramp keeps three steps |
| `--ink-400`   | `#767C8F`   | `#767C8F`  | **Unchanged** — a cool mid neutral reads as muted against both extremes        |
| `--surface`   | `#FFFFFF`   | `#1D202A`  | Newly authored; one step toward the light from the dark ground                 |
| `--ground`    | `#FCFCFD`   | `#14161D`  | **Role swap** — takes the light theme's `--ink-900` value; no new literal      |
| `--rule`      | `#E2E4EB`   | `#2E3340`  | Newly authored; a hair lighter than the dark surface                           |
| `--good`      | `#0E7A50`   | `#3ECF8E`  | Newly authored; hue held, lightness raised to clear contrast                   |
| `--warn`      | `#A15C00`   | `#E3A44B`  | Newly authored; hue held, lightness raised to clear contrast                   |
| `--bad`       | `#B32741`   | `#F1798E`  | Newly authored; hue held, lightness raised to clear contrast                   |

Ten values are newly authored, two are role swaps that reuse a value the palette
already contains, and one is unchanged. That accounting is worth publishing because
it is the measure of how much of the dark theme is invention: ten values, each with
a reason above, rather than a second palette of thirteen.

The dark neutral ladder ascends without a tie or an inversion — ground, surface,
hairline, muted, secondary, primary — so the ramp's order, which the palette
section fixed as part of the contract, survives the derivation intact.

### Semantic meaning is stable across themes

**A token means the same thing in both themes. Destructive is destructive in both;
success is success in both. No token is ever re-purposed by a theme.**

This is the invariant that keeps the two themes honest, and it is stricter than it
first sounds. It forbids the obvious abuse — binding `--good` to a cautionary value
in one theme because it happened to read better — and it also forbids three subtler
ones:

- **Borrowing a name for its value.** Using `--rule` as a surface fill in the dark
  theme because the derived hairline happens to be a workable panel colour would
  make the token mean _hairline_ in one theme and _hairline plus panel_ in the
  other, and the next change to either would break the other.
- **Letting a role migrate.** The two role swaps above move a _value_ from one
  token to another between themes; they do not move a _role_. `--ink-900` is text
  primary in both themes and `--ground` is the page in both. If a role migrated,
  the thirteen names would no longer describe one vocabulary.
- **Introducing a theme-conditional usage rule.** A token that may carry meaningful
  text in one theme and not the other cannot be used correctly without knowing the
  theme, which reintroduces the branch the whole arrangement exists to remove. This
  is exactly why `--ink-400` holds one value and the accent holds one prohibition.

### The inverted surface needs no new token

The state catalog records that a transient outcome pill renders on an **inverted
surface**, and that the in-product variants are inverted while the one public
variant is a bordered card on the default surface
(`21-states.md` L245, L315).

Inversion is a relationship, so it falls out of the derivation for free. The pill
is `--ink-900` as its fill with `--surface` as its content — two tokens that
already invert together. In the light theme that is near-white content on a
near-black fill; in the dark theme, dark content on a near-white fill. It measures
18.07:1 and 15.85:1 respectively, and it remains inverted **relative to the active
theme** in both, which is the property the pill exists to have: it stands off the
region it floats over.

The alternative was a dedicated inverted-surface token pair, and it was rejected on
two grounds. It would be a fourteenth and fifteenth token for a relationship the
existing thirteen already express; and a fixed inverted value would stop being
inverted in one of the two themes, which is the one thing an inverted surface may
not do.

### Realisation and selection

The derivation is realised in two files, and they are deliberately symmetrical:

| File                                     | What it holds                                                     |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `packages/ui/src/styles/theme-light.css` | The thirteen semantic names bound to their light-theme primitives |
| `packages/ui/src/styles/theme-dark.css`  | The same thirteen names bound to their dark-theme primitives      |

Both bind **the same thirteen names**. Neither binds a fourteenth, neither omits
one, and neither contains a colour value. A name present in one file and absent
from the other would leave a consumer resolving nothing in one theme, which the
cascade reports as an unstyled element rather than as an error — a failure mode
worth naming because it is silent.

**The switch is applied at a single root scope.** A `data-theme` attribute on the
document element selects which of the two bindings is in force, and it is the only
place in the tree where a theme is selected. There is no per-region scope, no
per-component scope and no second switch: the shell-wide statement in the catalog
(`00-product-overview.md` L216) is honoured by there being nowhere else to apply
one.

**The selection has three positions, and the third is not a third theme.** The
catalog evidences the preference as a three-option segmented control together with
a system colour mode (`README.md` L342). Two positions select a theme outright and
the third follows the reader's platform preference, resolving to one of the same two
bindings. It is a _selection_ position rather than a theme, so it adds no tokens and
no third stylesheet.

**The selection is shell state, not server data.** It lives in the shell store at
`apps/web/src/store/shell.ts` alongside the other ephemeral shell concerns, and the
root attribute is written from there. Server state belongs in the query cache and
never in a global store, and the active theme is not server state: it is a property
of how the current client is rendering.

**Where the durable preference belongs, and why it is not built here.** The catalog
classifies colour mode as **per-viewer** state (`00-product-overview.md` L821), and
records that the preferences area writes back to it (`00-product-overview.md`
L839). Per-viewer state belongs on the viewer's own preferences record and never as
a column on a shared object, which is settled in `docs/decisions/data-model.md`.
The surface that sets it belongs to a deferred area, so in this phase the selection
is shell state only, and when that surface ships it hydrates the shell store from
the viewer's preferences record rather than replacing it. The two statements — a
per-viewer preference in the catalog, a shell-state selection in this phase — are
both recorded here because they are both true of different layers, and neither is
adjusted to look like the other.

**The reader's platform preference is respected before any selection is made.**
With no stored preference, the platform's own preference decides, so a reader who
has asked their system for a dark interface is not shown a light one first.

## The contrast contract

### The requirement

**Body text, and any text that conveys meaning, holds 4.5:1 against whatever it
sits on — in both themes.** Not in the light theme with the dark theme checked
afterwards, and not on average: in both, for every pairing the product actually
renders.

Two secondary thresholds are used, and only where they properly apply. A
**non-text element** whose appearance is required to identify it — a control's own
boundary, a state indicator, a meaningful glyph — holds 3:1. A purely
**decorative** element that identifies nothing and carries no meaning has no
threshold, and the two elements in this palette that fall in that class are named
explicitly below rather than left to be inferred from a low figure.

**The relaxed threshold for large text is deliberately not used anywhere.** It
would let a token be permissible at one size and impermissible at another, which
would make every usage rule below conditional on a font size chosen in a different
record. The rules in this record are therefore size-independent for the same reason
they are theme-independent: a rule a consumer cannot evaluate where it stands is a
rule that will be got wrong.

### What a figure in the table is, and is not

Every figure below is **arithmetic performed on the two declared values** under the
standard relative-luminance formula. Each one was computed, not estimated, and none
is a judgement about how a pairing looks.

Equally, a figure says only what it says. It does not account for anti-aliasing at
a glyph's edge, for subpixel rendering, or for a value composited over something
else — which is a further reason the derivation rejected translucent tokens, since a
translucent value has no single contrast figure to compute. It also does not
discharge the non-colour obligations further down: a pairing can clear 4.5:1 and
still communicate nothing to a reader who does not perceive the hue difference.

### The pairing table

| Foreground token | Background token | Light theme | Dark theme | Verdict                                                 |
| ---------------- | ---------------- | ----------- | ---------- | ------------------------------------------------------- |
| `--ink-900`      | `--ground`       | 17.62:1     | 17.62:1    | Passes. Body text on the page                           |
| `--ink-900`      | `--surface`      | 18.07:1     | 15.85:1    | Passes. Body text on a raised surface                   |
| `--ink-600`      | `--surface`      | 8.71:1      | 9.71:1     | Passes. Secondary text                                  |
| `--ink-600`      | `--ground`       | 8.50:1      | 10.80:1    | Passes. Secondary text on the page                      |
| `--ink-400`      | `--surface`      | 4.16:1      | 3.91:1     | **Fails 4.5:1 in both themes.** See the muted-text rule |
| `--ink-400`      | `--ground`       | 4.06:1      | 4.35:1     | **Fails 4.5:1 in both themes.** See the muted-text rule |
| `--surface`      | `--brand-600`    | 6.29:1      | 7.41:1     | Passes. Primary-button label on the primary fill        |
| `--surface`      | `--brand-700`    | 7.90:1      | 9.61:1     | Passes. The same label with the button pressed          |
| `--brand-600`    | `--surface`      | 6.29:1      | 7.41:1     | Passes. Brand as text — a link, an emphasised label     |
| `--brand-600`    | `--ground`       | 6.13:1      | 8.24:1     | Passes. Also the focus-ring figure against the page     |
| `--ink-900`      | `--brand-050`    | 16.16:1     | 14.25:1    | Passes. Body text inside the primary wash               |
| `--brand-600`    | `--brand-050`    | 5.62:1      | 6.66:1     | Passes. A link inside the wash                          |
| `--ink-400`      | `--brand-050`    | 3.72:1      | 3.51:1     | **Fails 4.5:1 in both themes.** See the muted-text rule |
| `--bad`          | `--surface`      | 6.40:1      | 6.09:1     | Passes. Destructive text or glyph                       |
| `--bad`          | `--ground`       | 6.24:1      | 6.77:1     | Passes. The same on the page                            |
| `--surface`      | `--bad`          | 6.40:1      | 6.09:1     | Passes. A label on a destructive fill                   |
| `--good`         | `--surface`      | 5.36:1      | 8.14:1     | Passes. Success indicator or text                       |
| `--surface`      | `--good`         | 5.36:1      | 8.14:1     | Passes. A label on a success fill                       |
| `--warn`         | `--surface`      | 5.19:1      | 7.49:1     | Passes. Warning indicator or text                       |
| `--surface`      | `--warn`         | 5.19:1      | 7.49:1     | Passes. A label on a cautionary fill                    |
| `--accent`       | `--surface`      | 3.44:1      | 8.70:1     | **Fails 4.5:1 in the light theme.** See the accent rule |
| `--surface`      | `--accent`       | 3.44:1      | 8.70:1     | **Fails 4.5:1 in the light theme.** See the accent rule |
| `--surface`      | `--ink-900`      | 18.07:1     | 15.85:1    | Passes. The inverted pill, in both directions           |
| `--rule`         | `--surface`      | 1.27:1      | 1.29:1     | Below 3:1 **by design.** See the hairline rule          |
| `--rule`         | `--ground`       | 1.24:1      | 1.43:1     | Below 3:1 **by design.** See the hairline rule          |
| `--brand-050`    | `--surface`      | 1.12:1      | 1.11:1     | Below 3:1 **by design.** See the wash rule              |

Every figure in that table holds in both themes or fails in both, with one
exception — the accent, which passes in the dark theme and fails in the light one.
That asymmetry is not resolved by relaxing the rule for the theme that passes; the
accent rule below binds in both.

### Where a pairing does not clear the threshold

Four families do not clear 4.5:1, and each gets a stated substitution rather than a
quiet allowance. A pairing that is permitted because nobody wrote down that it
fails is the failure mode this section exists to prevent.

#### The muted-text rule

`--ink-400` measures between 3.51:1 and 4.35:1 depending on the theme and the
surface. It clears the non-text threshold everywhere and clears the text threshold
nowhere.

**So muted is not a text colour for anything a reader needs.** Concretely:

- **Prohibited:** any text a reader must read or act on. A field's helper line, a
  validation message, an error, a control label, a menu row, a count a reader is
  meant to use, a name, a time a reader is meant to rely on.
- **Permitted:** a non-text mark or a control boundary, where 3:1 governs and the
  token clears it in both themes; and decorative text that repeats information
  already available at full contrast in the same region.
- **The substitution is `--ink-600`**, which measures 8.71:1 and 9.71:1 on the two
  surfaces. Anything that has to be read moves one step up the ramp. Nothing about
  the layout changes; only the token does.

This compounds with a decision taken in the companion record and must be read
together with it. The type scale's caption step is the smallest step in the build,
and a thin stroke at a small size loses coverage to anti-aliasing, so its effective
contrast falls below what the figures above predict
(`docs/decisions/typography.md`). **Caption-size text therefore never takes
`--ink-400`.** The two constraints reinforce each other: the smallest size and the
lightest ink are individually marginal and jointly wrong.

#### The accent rule

`--accent` is a **non-text mark colour in both themes**, for the reasons set out in
the derivation: no ink clears the threshold behind it in both themes, and there is
no fourteenth token.

- **Prohibited:** the accent as text, and the accent as a fill behind text, in
  either theme.
- **Permitted:** a tick, a state dot, a selection mark, a stroke, an underline on a
  current tab, a meaningful glyph — every one of which is a non-text element at
  3:1, cleared in both themes.
- **The substitution for emphasised text is `--brand-600`**, at 6.29:1 and 7.41:1.

#### The hairline rule

`--rule` measures between 1.24:1 and 1.43:1. That is not a defect: **a hairline is
decorative**, it identifies nothing, and applying a text or component threshold to
a list divider would produce a heavy border nobody asked for. The catalog's own
surfaces separate cells with hairline dividers rather than card borders or elevation
(`20-help-community.md` L404), which is the treatment this token exists to render.

The obligation is a boundary one instead, and it is where a build most easily goes
wrong:

- **Where a boundary is decorative — a divider between rows, a separator between
  toolbar groups, a rule beneath a heading — `--rule` is correct** and its low
  figure is the intended result.
- **Where a boundary is the only thing identifying a control — the resting border
  of a text field, the outline of a checkbox — `--rule` is prohibited.** That
  boundary holds 3:1, and `--ink-400` is the token that does it, at 4.16:1 and
  3.91:1 against the two surfaces.
- **A field must never be identifiable by its fill alone.** If the fill is
  `--surface` on a `--ground` page, the two are a hair apart in the light theme, so
  the boundary is doing the entire job of saying _this is an input_ and cannot be
  the weaker token.

#### The wash rule

`--brand-050` measures 1.12:1 and 1.11:1 against the surface it tints. It is a
**tint, not a boundary and not a signal**, and it is deliberately that quiet in both
themes.

**So a wash is never the only cue for anything.** A selected row tinted with the
wash also carries a mark, a label change or a boundary; a callout tinted with the
wash also carries its text at a passing figure; and a reader who cannot distinguish
the wash from the surface loses no information. The wash makes a region easier to
find once you know what you are looking for. It never tells you what it is.

### Meaning is never carried by colour alone

Contrast is necessary and it is not sufficient. A pairing can clear 4.5:1 and still
convey nothing to a reader who does not perceive the hue difference between it and
its neighbour, which is why the following obligations sit alongside the figures
rather than after them:

- **A destructive action carries wording or a glyph as well as a colour.** The
  destructive treatment is never the only thing that says an action destroys
  something. The catalog holds itself to this: where it describes a session-ending
  action rendered in a cautionary treatment, it notes that the action is never
  specified by its colour alone (`06-huddles.md` L333).
- **A validation error is expressed by more than a border hue.** The state catalog
  records six presentations of field validation, and every one of them carries
  something besides colour — a message beneath the field, an error-badged glyph
  inside the field's trailing edge, a tinted block, a form-level callout above every
  field, or a preview row showing the record that conflicts
  (`21-states.md` L259–L264). One of the six marks no field at all, so colour is not
  even present as a cue there. Validation is also expressed with no message and no
  colour change whatsoever, purely through control state, and the catalog records
  that as the _more common_ case (`21-states.md` L268).
- **A status is named, not only tinted.** A success, a warning and a failure each
  carry a word or a glyph. A row whose only difference from its neighbours is that
  its status word is tinted is not distinguishable to every reader — and the catalog
  shows precisely that arrangement in a diagnostics table, where a destructive
  treatment is applied to one row's label and status word while other rows keep
  reporting success (`21-states.md` L246). The word is what carries it; the colour
  reinforces it.
- **A current item is marked structurally.** The catalog's active-state vocabulary
  is a tab label underlined and emphasised, an autocomplete row filled across its
  full width, a navigation entry filled, and today's cell in a date grid ringed by
  an unfilled outline (`21-states.md` L123, and the criterion at L589). Every one of
  those is a shape or a fill boundary rather than a hue shift, and that is the
  vocabulary to implement.
- **Role gating is stated in words, never in a treatment.** The evidenced
  presentation is a bordered container whose inset caption, led by an
  eye-with-slash glyph, names the role that may act, with the gated control left in
  its ordinary position (`21-states.md` L276). Nothing is hidden and nothing is
  disabled — and nothing about how a control is coloured is ever evidence of
  permission, which the server-authorization rule (the second as provided) settles
  independently of anything in this record.

**The catalog supplies a cautionary precedent for getting this wrong, measured on
its own published site rather than on the product.** Its links turn out to be
separated from the body text around them by nothing but colour: it measured every
other candidate differentiator — underline, weight, style, size, family,
background, border, shadow, outline and padding — and found each identical between
a link and its surrounding text, with no underline at rest or on hover. It then
measured the interaction states and found the ratio **dropping** rather than
holding: comfortable at rest, and only barely over the threshold once a reader
hovers or focuses (`README.md` L1054–L1066). The finding is disclosed rather than
fixed there, because the remedy is excluded by that site's own constraints.

Two lessons are taken from it here, and neither is about the site. **An interaction
state must not lower contrast** — a hover or focus treatment in this build moves
contrast up or holds it, never down. And the catalog's own stated remedy is the rule
this section states: no meaning is carried by colour in authored content, because
every citation is also identifiable by its text (`README.md` L1068). That is the
same discipline applied to prose that this section applies to interface.

### The focus ring is a colour obligation

`docs/decisions/typography.md` records that the focus ring is rendered **outside**
the border so it never encroaches on the space a size step was fitted into. There
is a second, independent reason for the same geometry, and it is a contrast one.

**The ring is `--brand-600`, and it must clear 3:1 against both the control it
surrounds and the surface around that control, in both themes.** Against the page it
measures 6.13:1 and 8.24:1; against a raised surface, 6.29:1 and 7.41:1. Both clear
the threshold comfortably.

**But a ring drawn in the brand against a brand-filled control measures 1.00:1** —
the same value against itself, which is to say invisible. This is not a hypothetical:
the primary button is the most likely control to be focused, and it is filled with
exactly the token the ring uses.

**So the ring is drawn outside the border with an offset gap**, and the gap renders
in the surrounding surface. The ring's neighbours are therefore the gap on one side
and the page on the other — never the fill — so the only figures that matter are the
ones above, and the 1.00:1 case cannot arise. The offset is a correctness
requirement, not a stylistic preference, and removing it to save two pixels would
make focus invisible on the product's most important control.

Three further obligations follow:

- **The ring is never the only indication of focus on a control whose boundary it
  overlaps.** Where a field takes focus, the catalog records the ring accompanied by
  a strengthened border and a caret at the insertion point
  (`21-states.md` L463) — three cues, of which the ring is one.
- **The ring is never removed.** Not for aesthetics, not for a custom control, and
  not by resetting an outline without replacing it. A control with no visible focus
  state is unreachable for a reader navigating by keyboard, whatever its contrast
  figures say.
- **The ring's colour does not change between themes, only its value does.** It is
  `--brand-600` in both, which is the whole arrangement working: the ring is one
  declaration and the theme supplies the value that clears the threshold.

### The pairings are asserted, not merely documented

A table in a decision record is a claim. **No pairing above is satisfied because it
is written here; each is satisfied when a test asserting it passes.** That is the
uncertainty rule's requirement (the fourth as provided) and it is the whole reason
the figures were computed rather than described. Three places carry the assertions,
none of the three is optional, and none of the three exists yet — each row below is
an obligation this record places on the file it names:

| Assertion site                            | What it proves                                                                                                                                                                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/styles/tokens.test.ts`   | The arithmetic. Every row of the pairing table recomputed from the declared values in **both** themes, asserted against the verdict recorded here, including the four deliberate sub-threshold rows — so a value edited without its verdict being reconsidered fails |
| `packages/ui/src/components/*/*.test.tsx` | That components resolve tokens rather than values, that no component declares a colour, and that no component has a theme-conditional path                                                                                                                           |
| `e2e/a11y.spec.ts`                        | The rendered result. The accessibility scan runs across every Phase-1 route **in both themes**, so a pairing that passes in the abstract and fails in composition is caught                                                                                          |

Three properties of that arrangement are deliberate.

**The token test is the one that can fail loudly on a palette edit.** The scan
tests what is rendered and will only report a pairing that is actually placed on a
route; the token test asserts the whole matrix whether or not a surface uses it yet.
Both are needed, because the first catches composition mistakes and the second
catches value mistakes.

**The scan runs in both themes.** A single-theme scan would leave half the contract
unverified while reporting green, and the derivation's entire premise is that a
consumer written once works in both — which is a claim about both, and therefore a
claim to test in both.

**The deliberate sub-threshold rows are asserted too, at their recorded figures.**
That is not pedantry: it is what stops the muted, accent, hairline and wash rules
from quietly becoming false. If `--ink-400` were lightened until it cleared 4.5:1,
the muted-text prohibition above would be unnecessary and misleading, and the test
failing is how that gets noticed.

Finally, the record's obligations feed a criterion the catalog already states.
Every branded value must come from the build's own token set, with no third-party
product name, logo mark, wordmark, plan-tier name **or palette value** appearing
anywhere in the shell (`00-product-overview.md` L925). The palette-confinement rule,
the brand-and-palette guard and the token test are between them how that criterion
is discharged, and the criterion's status belongs to the traceability manifest
rather than to this record.

## Downstream contract

None of the files named below exists at the time this record is written. That is
deliberate: **this record is the contract they are built against**, not a
description of them, so every line here is stated as an obligation on a file rather
than as an observation about one.

### The chain, in order

| File                                        | Its one job                                                                                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/styles/tokens.ts`          | **Declares.** The only file in the tree holding a colour value — the thirteen supplied and the ten derived — exposed as primitives |
| `packages/ui/src/styles/theme-light.css`    | **Binds.** The thirteen semantic names to their light-theme primitives. No colour value                                            |
| `packages/ui/src/styles/theme-dark.css`     | **Binds.** The same thirteen names to their dark-theme primitives. No colour value                                                 |
| `packages/ui/src/styles/tokens.module.css`  | **Exposes.** The token surface every stylesheet consumes. Declares no colour value of its own                                      |
| `apps/web/src/styles/global.css`            | **Consumes.** Applies the token surface to the document. **Declares no values of its own**                                         |
| Every component stylesheet in `packages/ui` | **Reads tokens only.** No colour value, no theme conditional, no local equivalent of a token                                       |

Each row has exactly one job, and the value of the arrangement is that the jobs do
not overlap. A file that both declares and consumes is a file where a value can be
introduced without anyone noticing it was introduced.

Two obligations follow that are easy to state and easy to breach:

- **`apps/web/src/styles/global.css` declares no colour value.** Not a fallback, not
  a body background, not a temporary value pending a token. It consumes. If it needs
  a colour the token surface does not offer, the answer is a token, decided here.
- **No component declares a colour value, and no component branches on theme.**
  Those are two statements of the same requirement. A component that declares a
  value is a second declaration site; a component that branches on theme is a second
  implementation of its own contract.

### The permitted literals

A stylesheet needs a small number of values that carry no design decision, and
those are permitted. **The complete list is:**

| Literal        | Why it is not a design decision          |
| -------------- | ---------------------------------------- |
| `0`            | The absence of a quantity                |
| `none`         | The absence of a treatment               |
| `auto`         | A deferral to layout                     |
| `inherit`      | A deferral to the cascade                |
| `currentColor` | A deferral to the token already in force |
| `transparent`  | The absence of a colour                  |

**Everything else resolves to a token.** The list is closed: it is not a set of
examples, and a seventh entry is a change to this record. Note what unites the six —
each one either denies a value or defers to one decided elsewhere. None of them
introduces a value, which is exactly why none of them can smuggle a palette in.

### What this record does not own

Pointed at rather than restated, so there is one place for each answer:

| Concern                                                  | Where it is settled                                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Font family, sizes, line heights, weights, radii         | `docs/decisions/typography.md`, where they are authored and marked as authored                          |
| Layout geometry — region widths, heights, pitch, sizing  | Derived by measurement; the method and the output shape are in `docs/decisions/measurement-manifest.md` |
| Breakpoints and per-region responsive behaviour          | `docs/decisions/responsive.md`                                                                          |
| The state vocabulary those colours express               | `docs/decisions/state-matrix.md`                                                                        |
| Where per-viewer state such as a colour preference lives | `docs/decisions/data-model.md`                                                                          |

One boundary is worth drawing explicitly because it is the one most likely to be
crossed. **`--shadow-*` is not a colour family and is not owned here.** An
elevation value is partly geometric and partly a colour with an alpha component;
its scale is settled in `docs/decisions/typography.md` alongside the radii, and the
only thing this record says about it is that whatever colour component a shadow
carries is written in the declaration site like every other colour value and
nowhere else.

### Icons are tinted, never coloured

**Every icon in `packages/ui/src/icons/` is original or open-licensed artwork, and
each one is tinted with `currentColor`.** That single choice discharges three
separate obligations at once, which is why it is the rule rather than a convention:

- **It keeps the palette confined.** An icon with a baked-in value would be a
  colour value living in an asset — the one place the hex restriction cannot reach
  at all, since it parses neither markup nor a stylesheet.
- **It makes an icon theme-correct for free.** `currentColor` resolves to whatever
  token is in force at the point the icon renders, so an icon inside a destructive
  menu row is destructive, an icon inside muted metadata is muted, and the same
  asset is correct in both themes without a variant. An icon with two theme
  variants would be the same defect as a component with two theme variants.
- **It keeps the icon set honest about provenance.** Because the artwork carries no
  colour, there is nothing in it that could have been sampled from anywhere.

**And the prohibition that goes with it: no third-party icon artwork is traced,
extracted or reconstructed.** Not redrawn from a frame, not approximated from
memory of a frame, not derived from one. The identity rule states this as an
absolute, and it sits in this record because the temptation is a colour one — an
icon is where a build most easily reintroduces both an identity and a value it is
not entitled to. Iconography is specified functionally throughout this build, which
is the discipline the catalog itself follows when it names a glyph by what it means
rather than by what it looks like.

### Synchronisation obligation

**Four artifacts describe this palette and they move together or the set is
inconsistent:**

| Artifact                                                      | What it holds                                                                      |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `docs/decisions/theme-and-color.md`                           | The options considered, the choice, the rationale, the pairings and their verdicts |
| `packages/ui/src/styles/tokens.ts`                            | The declared values, light and derived                                             |
| `packages/ui/src/styles/theme-light.css` and `theme-dark.css` | The bindings of the thirteen names, one file per theme                             |
| `packages/ui/src/styles/tokens.test.ts`                       | The asserted pairings, in both themes                                              |

A change that touches three of the four leaves this record lying, and a reader will
trust it anyway. Three specific obligations follow:

- **A value change is a contrast change.** Editing any value obliges recomputing
  every pairing that value participates in, updating the rows here, and updating the
  assertions. A value edited without its pairings reconsidered is how a token
  silently drops below a threshold.
- **A verdict may not be edited to match a value.** If a pairing stops clearing its
  threshold, the value changes or a substitution is stated. Relaxing the recorded
  verdict to accommodate a value is the one edit this record forbids outright,
  because it converts a contract into a report.
- **Both theme files change together.** A name bound in one theme and not the other
  leaves a consumer resolving nothing in one of them, and the cascade reports that
  as an unstyled element rather than as an error.

## Recorded absences and preserved inconsistencies

Stated as they stand, because a record that resolves every tension silently is less
useful than one that shows where the tensions are.

| #   | What is absent or inconsistent                                                                                                                                          | How this record leaves it                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | The specification states **no colour value at all** — five notations, zero occurrences across 25 documents                                                              | Recorded as the evidentiary basis rather than filled in. It is the fact that makes accidental inheritance impossible                                                                                   |
| 2   | The catalog's placeholder vocabulary offers **four** numbered accent slots; the supplied palette has **one** accent                                                     | One accent ships. The three unfilled slots are recorded, not invented                                                                                                                                  |
| 3   | The accent clears the text threshold in the dark theme and fails it in the light one                                                                                    | Both figures published. The prohibition binds in both themes, because one token carries one rule                                                                                                       |
| 4   | The catalog classifies colour mode as **per-viewer** state, while in this phase the selection is **shell state**                                                        | Both recorded as true of different layers. Neither is adjusted to look like the other, and the hydration point is named                                                                                |
| 5   | One capture renders a shell dark while a results region renders light, against the shell-wide statement elsewhere in the same catalog                                   | Presented as the counter-evidence it is, with the catalog's own resolution cited. Not smoothed away                                                                                                    |
| 6   | The corpus evidences a theme **choice** wider than two modes — a swatch set including one intended for a vision-related need — alongside the light-and-dark colour mode | Two derivations ship, plus a follow-the-platform selection. A further theme would be new bindings over the same thirteen names, and is not built here                                                  |
| 7   | One capture shows a dark-mode sidebar's active row taking a solid accent fill — a treatment difference between themes rather than a value swap                          | Recorded and **not adopted**. An active row carries a label, so an accent fill would be an accent behind text, which the accent rule prohibits. The active row fills with `--brand-600` in both themes |
| 8   | The hex restriction in `eslint.config.js` reaches TypeScript and JavaScript only, so a stylesheet or a Markdown file is outside it                                      | Recorded as a limit of the enforcement, with the stylesheet surface assigned to the brand-and-palette guard                                                                                            |
| 9   | The words _colour mode_ denote the corpus's own pixel format in one catalog line and the product's theme everywhere else                                                | Both senses named so the two are not conflated                                                                                                                                                         |

Item 7 is worth spelling out, because it is the only place the corpus shows a theme
doing something other than swapping values, and it is decided against on two
independent grounds.

**It would be a treatment difference between themes.** A selected row filled with
one hue in one mode and another hue in the other is a change a component would have
to know about, and the derivation's whole premise is that a component knows nothing
about the theme. So the selected row's treatment is identical in both themes here,
and only its resolved values differ.

**And it would put text on an accent fill**, which the accent rule prohibits in both
themes because no ink clears the threshold behind the accent in both. The active row
therefore fills with `--brand-600`, whose label pairing clears the threshold in both
themes at 6.29:1 and 7.41:1. Nothing evidenced is lost by that: the catalog's
active-item vocabulary specifies _a navigation entry filled_
(`21-states.md` L123) and never says with which hue, so the structure is reproduced
exactly and only the hue comes from the build prompt — which is where colour comes
from in any case.

## Change control

To **change a value**: change the row in the derived table, change the declaration
in the token module, recompute every pairing that value appears in, update those
rows and their verdicts, and update the assertions. All in the same change. The
recomputation is not optional — it is the step that makes the other four safe.

To **add a token**: add it here first, with its semantic role, its value in both
themes, the options considered, the choice, the rationale, and every pairing it
participates in with a verdict. Then declare it, bind it in **both** theme files,
and assert it. A token in the declaration site with no row here has no rationale
attached, cannot be reviewed, and cannot be told apart from a value that was taken
from somewhere it should not have been — which for colour is the specific risk the
confinement rule exists to remove.

To **remove a token**: state which consumers used it and which token they move to. A
token may not be deleted while a consumer still resolves it, and a consumer may not
be left resolving a name no theme binds.

To **add a theme**: bind the same thirteen names in a third stylesheet, publish its
derived values here with the reasoning for each family, and extend the pairing table
and the assertions to cover it. A theme that binds twelve names, or fourteen, is not
a theme of this system.

## Authoring conventions observed by this record

Recorded so a reviewer can check compliance without inferring intent.

- **No frame was opened.** Not one, at any point. Every observation attributed to
  the corpus was resolved from catalog prose, and the counts in the evidentiary
  table were taken by searching the 25 documents under `docs/workflows/`, which is
  reading the specification rather than the corpus.
- **No colour value was sampled, and none could have been.** Colour is the carve-out
  where the build prompt governs and the pixels never do, so opening a frame could
  not have supplied a value even had one been opened. The thirteen supplied values
  are the build prompt's; the ten derived values were reasoned from them.
- **Frames by number only.** Where a frame is referenced it is a bare integer. No
  filename appears in this record and neither does the catalog's percent-encoded
  citation form — both embed a third-party product name, which is prohibited in a
  file name, in source and in copy alike.
- **Colour values appear in exactly two places in this document** — the palette
  table and the derived table — and nowhere else, not even in the fenced block. The
  fence deliberately shows the chain without showing a value.
- **Rules cited by subject and position, never by identifier.** The five rule
  identifiers each embed a third-party product name, so writing one here would
  breach the identity rule this record is observing. The convention was established
  in `docs/decisions/typography.md` and is followed unchanged.
- **No diagram fences.** The committed documentation-site configuration does not
  render them: its bundled superfences extension claims a fenced block before the
  diagram plugin can, so a diagram fence publishes as a highlighted code box. This
  record uses tables and prose, adds no navigation entry to the read-only site
  configuration, and does not apply the withheld extension fix.
- **Fenced lines are held to 74 characters**, the catalog's measured ceiling,
  because a published fence clips rather than wraps.
- **Functional naming throughout, and no transcribed copy.** Surfaces and controls
  are named for what they do — transient outcome pill, conversation sidebar,
  primary button, hairline divider, month grid. No string legible in any frame is
  reproduced. Where the catalog is quoted it is marked as a quotation; everywhere
  else the prose is this record's own.
- **Evidence by citation; absence recorded as absence.** Every claim about the
  specification names its document and line. Where the specification supplies
  nothing, the table reads zero and the prose says why the zero is the point.
- **Inconsistencies preserved rather than reconciled.** Nine of them are listed
  above with what was done about each, and in no case was a figure adjusted or a
  contradiction resolved by choosing the more convenient reading.
- **Every value is decided and every figure is computed.** Nothing here is
  deferred, left open or marked for later, and no contrast figure is an estimate.
  Uncertainty about a value is not permission to omit the mechanism it belongs to —
  the uncertainty rule says so directly — so both themes ship complete, with the
  four sub-threshold families carrying stated substitutions rather than silence.
