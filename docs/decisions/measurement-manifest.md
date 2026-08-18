# Measurement manifest

The fixed list of frames the frame-measurement tool is permitted to read, the
crop and detection contract it must apply to each of them, and the design tokens
each frame is expected to yield.

| Field                               | Value                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record **and** frame-access authorization                                                        |
| Status                              | Operative. Authored **before** any measurement run                                                        |
| Frames listed                       | 24, enumerated by number only                                                                             |
| Frames opened to author this record | **0**                                                                                                     |
| Primary consumer                    | `tools/measure-frames`                                                                                    |
| Downstream consumer                 | `packages/ui/src/styles/tokens.ts`                                                                        |
| Companion records                   | `docs/decisions/frame-access-log.md`, `docs/decisions/typography.md`, `docs/decisions/catalog-defects.md` |

## Why this record exists, and why it exists first

Design tokens for this build are derived by deterministic measurement rather than
by visual judgement. Measurement needs pixels, and pixels live in the screenshot
corpus, which is a read-only input of last resort rather than a browsing surface.
The **corpus-handling rule** — the third of the five project rules as provided,
governing corpus and specification handling — permits a frame to be opened under
exactly three conditions, and one of them is that the frame is **named in this
manifest**.

(Rules are cited throughout by subject and position rather than by their platform
identifiers, for a reason given under
[Authoring conventions](#authoring-conventions-observed-by-this-record).)

That makes this record an authorizing instrument rather than a description of one.
Nothing in the measurement pipeline is permitted to choose its own frames: a list
assembled at run time by listing a directory, matching a pattern across it, or
sampling it would be a survey of the corpus, and surveying is prohibited outright.
The tool therefore **reads this list** and measures exactly the frames named here,
in the order given, and stops.

The ordering follows from that. This manifest is authored first, before the tool
exists and before the token module exists, because a manifest written afterwards
would be a report about which frames happened to be opened rather than a contract
about which frames may be.

### What this record does _not_ do

- **It does not repeal the per-task access cap.** The cap in the same rule — no
  more than six frames for a single task without a logged justification — still
  binds. See [Access-budget reconciliation](#access-budget-reconciliation).
- **It does not authorize writing.** Nothing under the read-only paths may be
  modified, moved, renamed, deleted, compressed, re-encoded or reformatted. The
  measurement pipeline reads raw bytes and re-encodes nothing, so all 1,022 frames
  remain byte-identical, and `tools/check-corpus` verifies that in the pipeline.
- **It does not authorize colour, artwork or copy.** Geometry is the only thing
  measurement is allowed to take from a frame. Colour values come from the palette
  in the build prompt and from nowhere else, icons are original or open-licensed
  artwork, and every string in the product is authored. A frame named here is a
  ruler, not a reference image.
- **It does not settle values the method cannot recover.** Those are named
  explicitly in [What measurement cannot deliver](#what-measurement-cannot-deliver)
  and are authored in `docs/decisions/typography.md` instead. An unrecoverable
  value is an open work item, never a licence to omit the token.

### No frame was opened to author this record

Every geometric fact stated below — band height, frame height, frame width, colour
mode, region proportions, and which surface each listed frame shows — was resolved
from catalog prose. **Not one frame was opened while authoring this manifest**, and
opening one to confirm something the catalog already states would itself breach the
rule. The same holds for the decision records as a family: authoring all 22 of them
required **zero** frame opens, because every corpus fact they carry is a citation of
the catalog rather than an observation of an image.

Frames are cited **by number alone** throughout — "frame 549", never a filename and
never the catalog's percent-encoded citation form. Every filename in the corpus
embeds a third-party product name, so a filename written into this record would be
a direct violation of the identity rule; the tool resolves a number to a path at run
time instead. Surfaces and controls are named functionally for the same reason.

## The measurement contract

Every frame named in this manifest is measured under the same contract. The tool
applies it uniformly and records which parts of it produced each value.

### 1. Crop: the effective measurement area is the top 1920 × 1200

Every frame carries a full-width dark band along its bottom edge. That band is
capture watermarking rather than product interface — it carries a third-party logo
mark and wordmark at the left and a curator attribution at the right — so it is
excluded from all observation and is not a build target.

**The bottom 120 pixels are cropped away before any measurement is taken.** With
the band removed, the effective product viewport is 1920 × 1200 for the canonical
frames, which agrees exactly with the measured top edge of the band.

The 120 figure is the catalog's own corpus-wide measurement, taken by walking upward
from the last row while the row-wise median grey stays within tolerance of the bottom
row's, and it is adopted here for the catalog's own reason
[`docs/workflows/README.md`, known limitation 3]:

| Measured band height | Frames |
| -------------------- | ------ |
| 120 px               | 979    |
| 119 px               | 27     |
| 118 px               | 11     |
| 121 px               | 3      |
| 117 px               | 1      |
| 143 px               | 1      |
| **44 px**            | **0**  |

Three properties of that distribution matter to this manifest.

- **The band's median grey value is identical in all 1,022 frames.** That is what
  makes its detection unambiguous, and it is why a fixed crop is safe here where a
  fixed offset elsewhere would not be.
- **The band's top edge sits at y = 1200 in 937 frames**, which is the corroboration
  for treating 1920 × 1200 as the measurement area rather than deriving a per-frame
  crop height.
- **No frame measures 44 pixels**, against an upstream figure of 44. Cropping at 44
  would leave third-party branding inside the region treated as product interface,
  which is precisely what the exclusion exists to prevent. The disagreement is
  recorded rather than propagated, and 120 — the modal and effectively maximal
  height — is used so the crop never under-crops. The single 143-pixel reading is
  reported by the catalog as a detector artefact on one frame whose content
  immediately above the band shares the band's grey value; it is not filtered out,
  and it is the reason the crop is fixed at 120 rather than at the maximum observed.

### 2. Frame geometry: width is uniform, height is not

Measured across the corpus [`docs/workflows/README.md`, known limitation 4]:

| Property    | Distribution                                                            |
| ----------- | ----------------------------------------------------------------------- |
| Height      | 1320 px in 974 frames · 1319 in 28 · 1321 in 16 · 1326 in 3 · 1318 in 1 |
| Width       | 1920 px in **all 1,022** frames                                         |
| Colour mode | RGBA in **all 1,022** frames                                            |

Five distinct heights were measured against an upstream description of a uniformly
sized corpus, so the corpus is not uniform: 1,022 less 974 leaves **48 non-canonical
frames**. The tool therefore reads each frame's own height from the image and crops
120 pixels from _that_ height. It never assumes 1320.

### 3. The catalog's objection, and the answer to it

The catalog refuses to state absolute pixel offsets, and says so prescriptively:
its layout specifications are proportional or relative — regions, columns, ordering
and relative sizing — never absolute pixel offsets, because an offset keyed to a
fixed canvas "would be wrong on 48 of the 1,022 frames".

That objection is correct, and this manifest does not contradict it. **Nothing here
is keyed to a fixed canvas.** Each frame is measured on its own geometry: its own
height, its own crop, its own detected boundaries. Only the _resulting scales_ are
pooled across frames, and a scale is a set of recurring distances rather than an
offset into a canvas — so it survives a frame that is one or six pixels taller than
its neighbour, which is exactly the failure mode the catalog is warning about. Where
a measurement disagrees across frames, the disagreement is visible in the committed
output rather than averaged into invisibility, and the token records which frame it
came from.

This is the reconciliation that makes measurement legitimate rather than a defiance
of the specification: the catalog declined to state offsets because it had no
per-frame method; the tool supplies one.

### 4. The four detection methods

One method per measurement axis. Every row of the manifest declares which of the
four applies, and every record in the committed output repeats it per measurement,
so a value can always be traced to the technique that produced it.

| Code       | Method                           | Axis    | What it recovers                                                                                                                                                                  |
| ---------- | -------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `V-scan`   | Vertical scanline differencing   | x       | Region boundaries down the horizontal axis: rail width, sidebar width, inter-region gutters, content inset, docked-pane width, modal and card widths                              |
| `H-scan`   | Horizontal scanline differencing | y       | Boundaries across the vertical axis: top-bar height, conversation-header height, composer height, section-header height, toolbar and action-row heights, docked status-bar height |
| `Autocorr` | Vertical autocorrelation         | y       | Repeating row pitch — both message-row densities and the sidebar row pitch — recovered from the periodicity of the region without identifying any individual row                  |
| `BBox`     | Bounding box                     | x and y | The extent of a discrete element: avatar box, icon box, control height, segmented-input box, badge and pill extents                                                               |

Pooled measurements are clustered into three scales — spacing (`--space-*`), sizing
(the `--avatar-size-*`, `--icon-size-*` and `--control-height-*` families) and
elevation (`--shadow-*`, only where an elevation edge is detectable at all). The
named layout and rhythm tokens are taken directly from the boundary and pitch
measurements rather than from a cluster.

Two constraints apply to every method:

- **Geometry only.** No method reads a colour value, and no cluster is keyed to one.
  A frame captured in a dark colour mode is therefore as measurable as one captured
  in the default mode — colour mode changes the palette, not the boundaries — and
  measuring such a frame reads nothing that the identity rule protects.
- **Confidence is recorded, not assumed.** Each measurement carries a confidence so
  a weak boundary can be reviewed instead of being silently promoted into a token.

### 5. The output contract

One JSON record per manifest frame, written to `tools/measure-frames/out/` and
committed. The record shape is fixed:

```text
{frame, measurements:[{name,value,axis,confidence,method}]}
```

The raw output is committed **as evidence**, so every token can be audited against
the measurement that produced it without re-running the tool and without reopening
a frame. Each geometric token in `packages/ui/src/styles/tokens.ts` carries its
frame number and its line in that output, in this form:

```text
// frame 549 · out/549.json line 12 · V-scan
```

## The manifest

**24 frames, one per distinct product surface**, listed in ascending numeric order.
This is the complete and closed set. Every entry was selected because the catalog's
own prose attaches that frame number to the surface named beside it, and the `Why
this frame` column names what the catalog says it shows — so a reader can confirm
each row is prose-resolved without opening anything.

`Tokens expected` lists only what the declared method can actually recover from that
surface. A row never claims a value its method cannot produce: no row claims a font
size, a line height or a border radius, because no scanline, autocorrelation or
bounding-box measurement can recover one.

| #   | Frame | Surface                                                                 | Tokens expected                                                                                                                        | Method                         | Why this frame                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ----- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 1     | Unauthenticated page shell                                              | `--control-height-*`, `--space-*`                                                                                                      | `V-scan`, `H-scan`, `BBox`     | The first pre-session screen: a single centred column on a plain surface, stacked as wordmark, heading, one line of helper copy, one text input, a full-width primary, a divider, two stacked full-width outlined identity-provider controls, then a footer. Every gate surface renders in this container with no application shell at all, so the column width and the pre-session control height are established here once [`01-onboarding-and-auth.md`, flow 01.1]                                                                                                                                                                                                                                                                                                        |
| 2   | 4     | Segmented verification-code entry                                       | `--control-height-*`, `--space-*`                                                                                                      | `BBox`, `H-scan`               | The verification step: six empty character boxes arranged as two groups of three with a short separator, beneath a heading and a two-line sub-line, with **no submit control of its own**. The only surface in the run whose control geometry is a row of equal square boxes, so the box extent and the inter-group gap are measured here [`01-onboarding-and-auth.md`, flow 01.2]                                                                                                                                                                                                                                                                                                                                                                                           |
| 3   | 17    | Plan-choice pair on the final setup step                                | `--control-height-*`, `--space-*`, `--shadow-*`                                                                                        | `V-scan`, `H-scan`, `BBox`     | The last step of the five-step workspace setup: instead of one input the region holds a lead-in line and **two cards side by side**, the left carrying a tier name, a badge pill, a price, a unit line, an outlined action and a three-item list. Also serves the second wizard geometry — this wizard renders left-aligned and top-anchored **in the content region**, not inside a modal, so its step-label and field rhythm differ from the in-modal form in row 4 [`01-onboarding-and-auth.md`, flow 01.4]                                                                                                                                                                                                                                                               |
| 4   | 58    | Modal shell hosting the two-step create wizard                          | `--control-height-*`, `--space-*`, `--shadow-*`                                                                                        | `V-scan`, `H-scan`             | Step 1 of the conversation-creation wizard: a centred modal that dims the shell, roughly a third of viewport width, stacking a label, a single-line glyph-prefixed field and helper copy, with the footer's step-of-total progress label at the left and the forward action at the right. Serves both the modal shell and the step wizard, because the catalog records the wizard as hosted **by** the modal shell at this frame rather than as a surface of its own [`02-channels.md`, flow 02.2]                                                                                                                                                                                                                                                                           |
| 5   | 62    | Conversation whose region carries only its intro hero                   | `--space-*`, `--control-height-*`                                                                                                      | `V-scan`, `H-scan`, `BBox`     | A just-created private conversation, open behind a follow-on modal: the header carries the name behind a closed-visibility glyph with a member count of one, and the body carries only the intro hero and its two inline actions. This is the empty-region measurement — the centred block's footprint and its distance from the header above and the composer below. **Inconsistency preserved, not reconciled:** the area document calls the intro hero its own usage of the empty-state contract, yet both that document and the state-matrix document state the hero is _not_ an empty state, because it also renders above real messages (see row 13). The row measures the region's geometry and takes no position on the classification [`02-channels.md`, flow 02.2] |
| 6   | 69    | Name field with its live remaining counter                              | `--control-height-*`, `--space-*`                                                                                                      | `BBox`, `H-scan`               | The creation wizard's first step with the name field focused, which reveals a right-aligned remaining counter reading the full 80-character allowance. The counter is the run's only in-field live indicator, so the field height and the trailing-indicator inset are measured here rather than inferred from a plain input [`02-channels.md`, flow 02.3]                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 7   | 81    | Conversation details surface with its tab bar                           | `--space-*`, `--control-height-*`, `--avatar-size-*`, `--shadow-*`                                                                     | `V-scan`, `H-scan`, `BBox`     | The richest object-detail surface in the run: roughly two-fifths of viewport width and taller than it is wide, with a title row, an action row of a star toggle and two labelled controls, and a **four-tab bar carrying a member count inside a tab label**. Gives the wider modal width against row 4's narrower one, and the tab-bar height. **Recorded divergence:** the catalog states this surface is a centred modal that dims the whole shell and warns that building it as a right-hand pane leaves nowhere for the dialogs it stacks — so the docked geometry is taken from row 19 instead, not from here [`02-channels.md`, flow 02.4]                                                                                                                            |
| 8   | 105   | Confirmation dialog stacked over an open modal                          | `--control-height-*`, `--space-*`, `--shadow-*`                                                                                        | `V-scan`, `H-scan`             | A small centred dialog carrying a question as its title, one explanatory line and a two-action footer, rendered **above a modal that is already open** with the backdrop dimmed twice over. The narrowest overlay in the run and the only stacked one, so it fixes both the dialog width and the layering step [`00-product-overview.md`, shared component inventory]                                                                                                                                                                                                                                                                                                                                                                                                        |
| 9   | 113   | Top bar, centred search entry, and the sidebar with its groups expanded | `--top-bar-height`, `--sidebar-width`, `--rail-width`, `--gutter`, `--sidebar-row-pitch`, `--icon-size-*`                              | `H-scan`, `V-scan`, `Autocorr` | The full-width top band with history controls grouped left of centre, the search entry centred and occupying roughly half the width, and the help control at the far right. The same capture carries the sidebar in its fullest form — flat rows for unreads, threads and drafts-and-sent, three expanded conversation groups each with an add affordance, and a footer item — so this one frame serves both the top bar and the expanded sidebar rather than taking two rows [`00-product-overview.md`, shell regions and flow 00.3]                                                                                                                                                                                                                                        |
| 10  | 117   | Sidebar at rest, and the confirmation pill                              | `--sidebar-row-pitch`, `--space-*`, `--control-height-*`                                                                               | `Autocorr`, `H-scan`, `BBox`   | The sidebar immediately after a section is created, with the per-group add rows present, and a **transient pill at the content region's bottom-right** naming what was created and offering an undo link. Gives the pill's extent and its inset from the region's trailing and bottom edges; the failure form of the same component is row 16, and the two are measured separately because the catalog records placement as a variant rather than a constant [`00-product-overview.md`, flow 00.3]                                                                                                                                                                                                                                                                           |
| 11  | 118   | Context menu with a nested sideways submenu                             | `--space-*`, `--control-height-*`, `--shadow-*`                                                                                        | `V-scan`, `H-scan`, `Autocorr` | An object-anchored menu whose manage entry has opened a submenu sideways, carrying a rename action and a destructive delete that both interpolate the object's own name, then a separator and a further action. Gives menu width, menu-row pitch and the submenu's offset from its parent row [`00-product-overview.md`, flow 00.3]                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 12  | 119   | Sidebar multi-select with its docked selection bar                      | `--sidebar-row-pitch`, `--control-height-*`, `--space-*`                                                                               | `Autocorr`, `H-scan`, `BBox`   | Multi-select active: every conversation row has gained a leading checkbox, the per-group add affordances have disappeared, and a bar has docked at the sidebar's foot carrying a selection count, a primary and a secondary action. The only capture of a bar docked inside the sidebar rather than the content region, and the only one of a checkbox-bearing row pitch [`00-product-overview.md`, flow 00.3]                                                                                                                                                                                                                                                                                                                                                               |
| 13  | 120   | Populated conversation body                                             | `--row-pitch-comfortable`, `--avatar-size-*`, `--space-*`                                                                              | `Autocorr`, `BBox`, `H-scan`   | A conversation carrying a header, a bookmark-add row, an intro hero, **two day dividers and two real messages** including one posted by an app under its own identity, plus a role badge beside a display name. The clearest avatar-led body for row-pitch autocorrelation, and the frame the catalog uses to establish that the intro hero renders even when the conversation has history [`02-channels.md`, flow 02.10]                                                                                                                                                                                                                                                                                                                                                    |
| 14  | 125   | Conversation browser with its filter row                                | `--section-header-height`, `--control-height-*`, `--space-*`, `--icon-size-*`                                                          | `H-scan`, `V-scan`, `Autocorr` | The browse surface, which replaces **both** the sidebar and the content region while only the rail persists: a header band with a title at the left and a create action at the right, a full-width search field, a row of filter chips, a sort control, then result rows. The run's only full-bleed destination surface, so the header-band height and the chip height are measured here [`02-channels.md`, flow 02.11]                                                                                                                                                                                                                                                                                                                                                      |
| 15  | 134   | Archived conversation with its docked status bar                        | `--composer-height`, `--space-*`, `--control-height-*`                                                                                 | `H-scan`, `V-scan`             | The read-only presentation: the composer is **replaced** by a status bar docked at the foot of the content region — not disabled — and the header has lost its facepile, member count and huddle control. Measured because the replacement bar's height is a distinct value from the composer's, and a build that reuses the composer height here will misplace the body's lower boundary [`02-channels.md`, flow 02.12]                                                                                                                                                                                                                                                                                                                                                     |
| 16  | 199   | Composer at reduced contrast, and the failure pill                      | `--composer-height`, `--icon-size-*`, `--space-*`                                                                                      | `H-scan`, `BBox`               | An unfocused empty composer whose nine toolbar glyphs and four separator rules are all present but at reduced contrast, with the action row at full contrast — and a near-black **failure pill at the content region's foot** stating that something went wrong and inviting a retry in plain text, carrying no undo, no dismiss affordance and no button of any kind. Serves the toolbar's resting geometry and the pill's failure form, whose anatomy differs from row 10's confirmation form [`03-messaging-and-composer.md`, flow 03.6]                                                                                                                                                                                                                                  |
| 17  | 202   | Composer bottom action row                                              | `--composer-height`, `--icon-size-*`, `--control-height-*`, `--space-*`                                                                | `H-scan`, `V-scan`, `BBox`     | The composer left empty again after an attachment is discarded: a full-contrast formatting toolbar above, the **full bottom action row of seven controls at the row's left in three separator-divided groups**, nothing at all in the input area, and a filled primary send control at the far right. This is the action row's own measurement, kept separate from the toolbar's in row 22 because the two rows carry different control counts and different group counts and must not be built from one grouping [`03-messaging-and-composer.md`, flows 03.6 and 03.8]                                                                                                                                                                                                      |
| 18  | 250   | Hovered message row and its floating action bar                         | `--row-pitch-comfortable`, `--avatar-size-*`, `--icon-size-*`, `--space-*`                                                             | `Autocorr`, `BBox`, `H-scan`   | One row of a populated list carrying a hover tint across the full width of the list while every other row keeps the default surface, with a floating bar pinned to that row's top-right **overlapping the row's upper edge**. The overlap is a negative offset that only this capture evidences, so it is measured rather than chosen [`00-product-overview.md`, shared component inventory; `21-states.md`, state matrix]                                                                                                                                                                                                                                                                                                                                                   |
| 19  | 338   | Docked fifth region, and its label-and-keys rows                        | `--content-inset`, `--gutter`, `--space-*`, `--control-height-*`                                                                       | `V-scan`, `Autocorr`, `H-scan` | A pane docked along the right edge of the content region, **which narrows to make room**, with a header carrying a back chevron, a title and a dismiss control, and a body of rows pairing an action label at the left with key-combination chips at the right, grouped under headings. The catalog's evidence for the docked form of the details surface and the source of the docked-pane width; also the reference table whose row pitch the shortcuts surface needs [`00-product-overview.md`, flow 00.2 and shell regions]                                                                                                                                                                                                                                              |
| 20  | 399   | Navigation rail, head to foot                                           | `--rail-width`, `--icon-size-*`, `--avatar-size-*`, `--space-*`                                                                        | `V-scan`, `BBox`, `Autocorr`   | The narrowest and only fixed-width region: the workspace icon at the head, a vertical stack of icon-and-label destinations, and the create control plus the account avatar pinned at the foot. Gives the rail width, the destination stack's pitch, and the two smallest boxes in the system — a destination glyph and the account avatar [`00-product-overview.md`, shell regions]                                                                                                                                                                                                                                                                                                                                                                                          |
| 21  | 549   | Four-region shell at rest, at the avatar-led density                    | `--rail-width`, `--sidebar-width`, `--content-inset`, `--gutter`, `--top-bar-height`, `--row-pitch-comfortable`, `--sidebar-row-pitch` | `V-scan`, `H-scan`, `Autocorr` | The catalog's default state: all four regions rendered, one destination active in the rail, one conversation active in the sidebar, **no overlay open** — the cleanest available capture for whole-shell boundary detection. It also carries the avatar-led message density, with an author-and-timestamp header above each body, which is the counterpart to row 23's compact density. The capture is in a non-default colour mode; that is immaterial, because measurement reads boundaries and never colour [`00-product-overview.md`, flow 00.6 and state matrix]                                                                                                                                                                                                        |
| 22  | 550   | Composer with the nine-control formatting toolbar                       | `--composer-height`, `--icon-size-*`, `--space-*`, `--control-height-*`                                                                | `H-scan`, `V-scan`, `BBox`     | An empty composer carrying a placeholder that names the target conversation, above **nine formatting controls divided by four vertical separator rules into five groups**, identical in every composer capture. The toolbar's own measurement, deliberately distinct from the action row's in row 17 [`00-product-overview.md`, shared component inventory]                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 23  | 560   | Content region, at the compact density                                  | `--row-pitch-compact`, `--content-inset`, `--composer-height`, `--section-header-height`                                               | `Autocorr`, `H-scan`, `V-scan` | The content region's full anatomy — conversation header, bookmark row, scrolling body, composer — with the message list rendered at the **compact density that differs from every other captured conversation**: a leading timestamp, then the author's display name, then the body, all on one line, with no avatar and no separate author row. The only recoverable source for the second row pitch, without which one of the two mandated densities cannot be built [`00-product-overview.md`, flow 00.4]                                                                                                                                                                                                                                                                 |
| 24  | 1020  | Page-level error surface                                                | `--space-*`, `--control-height-*`                                                                                                      | `V-scan`, `H-scan`             | The application error page, and the only surface the state-matrix document owns: public chrome above and below, and between them a single centred card of roughly three-tenths of viewport width whose top edge sits near one seventh and bottom edge near one third of viewport height, carrying a warning glyph, a heading, a three-line body and one inline link out. Gives the terminal card's footprint, which no in-shell surface provides [`21-states.md`, flow 21.1]                                                                                                                                                                                                                                                                                                 |

### Surfaces deliberately not given a row

The manifest is a ceiling as well as a floor, so the omissions are stated rather
than left to inference. The caret-anchored typeahead panel, the emoji picker, the
audio-clip player card and the date-picker month grid are all Phase-1 contracts, and
none has a row of its own. Each is bounded by a surface that _is_ measured — the
typeahead and the player sit on the composer of rows 16, 17 and 22; the picker and
the month grid are anchored overlays whose padding and control height come from the
pooled scales of rows 8 and 11 — so their geometry is derived from the clustered
scales rather than from a frame opened for them.

That is a deliberate trade: every additional row is an additional frame the rule
permits to be opened, and the list is kept to the smallest set that still covers
every distinct geometry. Adding a row is a change-controlled act; see
[Change control](#change-control).

## What measurement cannot deliver

Scanline differencing, autocorrelation and bounding-box detection recover distances
and extents. They cannot recover a typeface, a type scale or a corner. The following
token families are therefore **outside this manifest's reach**, and no row above
claims one:

| Token family      | Why measurement cannot recover it                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `--font-family-*` | A rendered glyph does not disclose the family that produced it, and no method here reads glyph outlines                             |
| `--font-size-*`   | Glyph height is a function of the family's metrics as well as the size, so a measured height does not invert to a size              |
| `--line-height-*` | Text-block pitch confounds line height with paragraph spacing, and no capture separates them                                        |
| `--font-weight-*` | Stroke thickness varies with family, size and rendering, so it is not a weight                                                      |
| `--radius-*`      | A corner radius is a handful of anti-aliased pixels at a boundary that the same boundary detection is designed to treat as one edge |

**These are open work items, not omissions.** Every one of them ships as a token with
an authored default, reasoned in `docs/decisions/typography.md`, and every authored
default is marked at its point of definition with exactly this marker:

```text
// UNMEASURED — chosen default, see docs/decisions/typography.md
```

The marker exists so that a reader of the token module can always tell a measured
value from a chosen one. A token carrying a frame number and an output line was
derived; a token carrying the marker above was authored. There is no third category,
and a geometric token with neither is a defect.

### Elevation spans both categories

`--shadow-*` is the one family that belongs to both. **Where an elevation edge is
detectable** — the overlay rows above declare it, because a dimmed backdrop or a
raised surface produces a boundary a scanline can find — the value is clustered from
measurement like any other. **Where it is not detectable**, the value is authored and
carries the unmeasured marker.

This is stated explicitly to head off a false positive: a marked `--shadow-*` entry
sitting beside a measured one is the intended outcome, not an inconsistency, and it
must not be reported as a defect. The same applies to `--z-*` and `--breakpoint-*`,
which are authored in full — layering has no pixel signature, and the corpus is
captured at exactly one width, so responsive behaviour has no evidence at all.

## Access-budget reconciliation

**This manifest names 24 frames, which is more than six, and that is by design.**

It is not a breach. The corpus rule permits a frame to be opened when it is named in
this manifest, and the 24 frames above are named in it. The rule's manifest clause
and its per-task cap are separate provisions: the clause establishes _which_ frames
may be opened, and the cap governs _how many_ a single task may open before it owes
an explanation.

**The cap still binds.** Naming a frame here does not repeal it, and this record
claims no such effect. The consequence is procedural and exact:

- The measurement task appends **exactly one** justification entry to
  `docs/decisions/frame-access-log.md`.
- That entry names this manifest as the authority, names the task — deriving the
  geometric design tokens — and names what the catalog could not answer.
- What the catalog could not answer is precise and is not a criticism of it:
  **absolute pixel values**. The catalog states outright that its layout
  specifications are proportional or relative and never absolute, so no amount of
  further reading resolves a value in pixels. That is the only question the frames
  are opened to answer, and it is the one question prose cannot settle.

One entry rather than 24 is the correct granularity because the cap is per _task_,
and the measurement run is one task with one justification: every frame in it is
opened for the same reason, under the same authority, by the same tool, in the same
pass.

**Authoring the decision records opened nothing.** All 22 records in
`docs/decisions/` were written without opening a single frame, this one included. The
frame-access log therefore has no authoring entries to carry — its only entry is the
measurement run's — and the run's reported count of frames opened is the count of
manifest frames the tool actually read, which is bounded above by 24.

## Downstream contract

Four artifacts are coupled to this record. The coupling is stated so that a change to
any one of them is recognisable as a change to all of them.

| Consumer                                     | Obligation                                                                                                                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tools/measure-frames/src/index.ts`          | **Reads this frame set** as its input. It must not list, glob, sample or otherwise discover frames, because discovery is a survey. A frame absent from this manifest is out of bounds to it                                                       |
| `tools/measure-frames/src/resolve-frames.ts` | Turns a frame **number** into a path at run time using a brand-free pattern. This is the single hinge that lets a corpus of prohibited filenames be read by source containing none, and it is why every citation in this record is a bare integer |
| `tools/measure-frames/out/*.json`            | The committed output, one record per manifest frame in the fixed shape above, plus the clustered summary. It is evidence, so it is reviewed rather than regenerated silently                                                                      |
| `packages/ui/src/styles/tokens.ts`           | Stamps every geometric token with its frame number and its line in the committed output, and marks every unmeasured value with the marker above                                                                                                   |

### Synchronisation obligation

**Re-running the tool is a design-affecting change, not a refresh.** Four things move
together or the set is inconsistent:

1. this manifest, if the frame set or the expected tokens changed;
2. the committed output under `tools/measure-frames/out/`;
3. the token values in `packages/ui/src/styles/tokens.ts`;
4. the provenance comment on every token whose value or source line moved.

Any value the tool cannot recover **keeps** its unmeasured marker across the
re-run — a re-run never converts an authored default into a measured one by
implication, and never strips a marker.

### Cross-reference obligation

`docs/decisions/frame-access-log.md` **must agree with this manifest.** Concretely:
every frame the log records as opened for measurement appears in the table above, the
log's justification entry cites this record by name, and the two files never disagree
about how many frames the measurement task was authorized to read. If they diverge,
this manifest is the authority on what was permitted and the log is the authority on
what was done, and the divergence is a finding rather than a discrepancy to be
smoothed away.

## Change control

The frame list is fixed for the run. Changing it is permitted, and is a deliberate,
recorded act rather than an edit:

- **Adding a frame** requires a row carrying the same six fields, including the
  catalog citation that attaches that number to the surface named — a frame with no
  prose behind it does not qualify, because selecting it would have required a
  survey.
- **Removing a frame** requires stating which tokens lose their source, and either
  reassigning them to another row or moving them to the authored set with the
  unmeasured marker. A token may not be left with no provenance at all.
- **Either change** obliges the synchronisation above, and appends nothing further to
  the access log unless a new task actually opens frames.

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **Frames by number only.** Every reference above is a bare integer. No filename
  appears anywhere in this record, and neither does the catalog's percent-encoded
  citation form — both would carry a third-party product name, which is prohibited in
  source, comments, copy and file names alike.
- **Rules cited by subject and position, not by identifier.** The five project rules
  carry platform identifiers that each embed a third-party product name, so writing
  one here would breach the identity rule this record is otherwise observing. They
  are cited by what they govern and where they sit in the provided order instead —
  the corpus-handling rule is the third, the uncertainty rule the fourth, the identity
  rule the fifth. Position alone would be unsafe, because the identifiers are permuted
  relative to the requirement labels; position **with** subject is not.
- **Functional naming throughout.** Surfaces, regions and controls are named for what
  they do — navigation rail, conversation sidebar, composer, action row, verification-
  code entry, docked pane, transient pill. No third-party product or feature name
  appears, and no string legible in any frame is transcribed.
- **No colour, artwork or copy is taken from a frame.** Colour resolves to the
  palette in the build prompt, icons are original or open-licensed, and every string
  is authored. Measurement reads geometry and nothing else.
- **No diagram fences.** The committed documentation-site configuration does not
  render them: its superfences extension consumes a fenced block before the diagram
  plugin can claim it, so a diagram fence publishes as a highlighted code box. This
  record uses tables and prose instead, and it neither adds a navigation entry to the
  site configuration nor applies the withheld extension fix — both are out of bounds.
- **Fenced lines are held to 74 characters**, the catalog's measured ceiling, because
  a published fence clips rather than wraps.
- **Evidence by citation; absence recorded as absence.** Every figure above names the
  document it came from. Where the corpus cannot supply a value, the row says so
  rather than supplying one anyway.
- **Inconsistencies preserved.** Two are carried in the table above rather than
  reconciled: the classification of the intro hero (row 5) and the docked-versus-modal
  reading of the conversation details surface (rows 7 and 19). Both are logged in
  `docs/decisions/catalog-defects.md`, which is also where the corpus rule's own
  rendering artefact is recorded — the rule text wraps two decision-record paths in
  spurious auto-links, and the plain paths used throughout this record are the real
  ones. Correcting the catalog in place is prohibited; recording the defect is the
  remedy.
