# Responsive behaviour and the authored breakpoints

The corpus is captured at exactly one width. Nothing in the specification says what
any surface does when the viewport narrows, so this record decides it — three
breakpoints, a per-region behaviour at each of them, a stated posture below the
lowest one, and the tests that prove the result is operable rather than merely
claimed.

| Field                               | Value                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record. Authored from first principles under the named-gap build contract                                                        |
| Status                              | Operative. Binding on `packages/ui` and on `apps/web`                                                                                     |
| Breakpoints declared                | **3** — 1280, 1024, 768                                                                                                                   |
| Regions covered                     | **5** — navigation rail, conversation sidebar, top bar, content region, docked details pane                                               |
| Evidence in the corpus              | **None.** Width is 1920 in all 1,022 frames                                                                                               |
| Frames opened to author this record | **0**                                                                                                                                     |
| Declaration sites                   | `packages/ui/src/styles/tokens.ts` (as `--breakpoint-*`) and `packages/ui/src/styles/breakpoints.ts`                                      |
| Verified by                         | `e2e/specs/shell.spec.ts`, `e2e/a11y.spec.ts`                                                                                             |
| Companion records                   | `docs/decisions/state-matrix.md`, `docs/decisions/component-extensions.md`, `docs/decisions/gap-register.md`, `docs/decisions/roadmap.md` |

## Why this record exists

Responsive behaviour is the largest wholly-undesigned area of this build, and it is
undesigned for a structural reason rather than an accidental one: a screenshot has
one width, and every screenshot in this corpus has the same one. No number of
additional frames could have supplied the answer.

That makes this a gap in the specification's own vocabulary — a surface or behaviour
the corpus does not evidence — and the catalog's build contract for exactly that
situation is explicit that it "is designed rather than left unhandled"
(`00-product-overview.md` L498). The **uncertainty rule**, fourth in the provided
order, says the same thing in stronger terms: where the corpus is silent, the build
implements the smallest coherent behaviour consistent with adjacent evidenced
behaviour and records the choice with its options and its rationale. Neither permits
this record to be a note about future work. What follows is a contract.

(Rules are cited throughout by subject and position rather than by their platform
identifiers, for the reason given under
[Authoring conventions](#authoring-conventions-observed-by-this-record).)

### The evidentiary position, stated as absence

**No responsive behaviour is evidenced anywhere in the corpus.** The catalog measured
its own frames and published the result: heights vary across five values — 1320 px in
974 frames, 1319 in 28, 1321 in 16, 1326 in 3, 1318 in 1 — while **width is 1920 in
all 1,022 frames** and the colour mode is RGBA in all 1,022 (`README.md` L933). With
the bottom capture band excluded, the effective product viewport is 1920 × 1200
(`README.md` L929).

One width, 1,022 times. So there is no narrow-width rendering to read, no collapsed
region to copy, no drawer to imitate and no breakpoint to recover. This is recorded
as an absence and is not filled in by inference from the pixels, because there are no
pixels to infer from.

Two further absences are recorded rather than smoothed over.

- **The five Phase-1 area documents carry no responsive marker at all.** The
  cross-cutting state document enumerates the states the corpus does not show —
  offline, disconnected, reconnecting, retrying, rate-limited, quota-exceeded,
  throttled, not-found, whole-surface blocking overlays, hover for most contracts,
  a transient pill being dismissed (`21-states.md` L459–L479) — and responsive
  behaviour is **not among them**. It is not that the corpus fails to show a
  narrow-width state; it is that no document in this run's scope raises the question.
- **Two deferred-area documents do raise it, and both classify it as an
  obligation.** One records that no narrow-width or mobile capture of any public page
  exists, "so every layout here is specified at one width and the responsive
  behaviour is undesigned" (`17-marketing-site.md` L1781), and requires that a
  responsive layout be designed for every page as a named-gap obligation "rather than
  absences" (`17-marketing-site.md` L1876). The other records that no narrow-width or
  responsive rendering is captured and requires that "every responsive width" be
  designed and implemented under the same contract (`19-brand-guidelines.md` L372,
  L490). Both surfaces are out of scope for this run; the classification they apply is
  not, and it is the classification adopted here.

### What _is_ evidenced, and therefore preserved across every breakpoint

The corpus cannot say what happens when the viewport narrows, but it says a great
deal about what the shell _is_. That structure is evidence, and no breakpoint may
contradict it. All sizing in the catalog's own region table is "proportional to the
effective product viewport, never an absolute offset"
(`00-product-overview.md` L298).

| Region               | Position and ordering                                    | Evidenced relative size                                                                                            | Citation                            |
| -------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Top bar              | Full-width band across the top, above all three columns  | Roughly one twenty-fourth of viewport height                                                                       | `00-product-overview.md` L302       |
| Navigation rail      | Leftmost column, beneath the top bar                     | Roughly one twenty-second of viewport width — the narrowest region, and **fixed**                                  | `00-product-overview.md` L303       |
| Conversation sidebar | Second column, immediately right of the rail             | Roughly between one-fifth and one-quarter of viewport width                                                        | `00-product-overview.md` L304       |
| Content region       | Remaining width, right of the sidebar                    | Roughly seven-tenths of viewport width, **shrinking when a pane docks**                                            | `00-product-overview.md` L305       |
| Docked details pane  | A **fifth** region along the content region's right edge | Roughly the right three-tenths of the width, taken **from the content region**, leaving rail and sidebar untouched | `00-product-overview.md` L307, L797 |

Four evidenced facts do particular work below, and are collected here so the
per-region decisions can cite them rather than restate them.

1. **The composer is pinned to the foot of the content region** and never scrolls
   with the message list, with a right-aligned newline-modifier hint beneath it
   (`00-product-overview.md` L326; `03-messaging-and-composer.md` L7, L747).
2. **The search entry is a centred field occupying roughly half the top bar's
   width**, with a leading magnifier glyph (`00-product-overview.md` L323).
3. **The sidebar is resizable, and its resizer is keyboard-operable** — the
   shortcuts reference's sidebar group covers resizing while the resizer holds focus
   (`00-product-overview.md` L142).
4. **Rail destinations are addressable positionally as well as by pointer** — the
   same reference maps a numbered combination to each rail destination, which the
   catalog calls direct evidence of exactly that (`00-product-overview.md` L142).

### Proportional sizing is why the shell narrows instead of breaking

The catalog refuses absolute pixel offsets, and states the refusal prescriptively:
layout specifications "are proportional or relative — regions, columns, ordering and
relative sizing — never absolute pixel offsets", because an offset keyed to a fixed
canvas "would be wrong on 48 of the 1,022 frames, and wrong again on any viewport the
build actually ships to" (`README.md` L935).

That refusal is load-bearing for this record, and it is worth being precise about
why. A shell whose five regions were fixed pixel widths would have exactly one
correct viewport; every other width would either overflow or leave dead space, and
every breakpoint would be a rewrite. A shell whose regions are proportional shares
degrades continuously: as the viewport narrows, each region narrows with it, and the
layout stays valid the whole way down. **The breakpoints below are therefore not
what makes the shell survive narrowing — proportional sizing already does that. The
breakpoints are the small number of points at which a proportional share stops
yielding a _usable_ region and something has to change shape instead of merely
getting smaller.**

The one place the catalog does record a region yielding space, it records reflow
rather than overlay. Of the content region when a pane docks: "The region narrows and
rewraps rather than being overlaid: the message list and composer reflow to the
reduced width" (`13-profiles-people.md` L292 — a deferred area, cited as corroboration
only). The same document notes that no capture shows its card grid at any column count
other than three, "so no responsive breakpoint for it can be read out of the corpus",
which is this record's own position stated by the catalog itself.

### The hierarchy invariant no breakpoint may violate

**The three columns are siblings, and the content region is the only one that
changes when navigation occurs** (`00-product-overview.md` L307). Two consequences
bind every decision in this record.

- **Collapsing a region must never turn it into a routed destination.** A sidebar
  that becomes a URL is no longer a sibling of the content region; it has become
  content, the shell has been navigated away from, and the back control now
  reverses a layout change instead of a navigation. The shell is explicitly not a
  page one navigates away from, so a collapsed region stays a region: it changes its
  presentation, not its place in the hierarchy, and the route is untouched.
- **Collapse is presentational and carries no authority.** Hiding, collapsing or
  overlaying a region changes nothing about what the acting session may do. The
  **server-authorization rule**, second in the provided order, is categorical that
  client rendering is never evidence of permission, and this record adds no
  exception: a control that is off-screen at 768 is neither more nor less authorized
  than the same control at 1920, and every mutation behind it is still checked
  server-side against the session and the target object.

## The breakpoints

**Three breakpoints, and exactly three.** Each names the lower bound of a layout
band, so a breakpoint's behaviour applies at widths _below_ it and the band above it
is unchanged. The reference band — 1280 and above — is the layout the catalog
evidences, unmodified.

| Breakpoint | Token                  | What changes                                                                                                                                                                                                      | Rationale                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1280**   | `--breakpoint-pane`    | Below this width the details pane **may not dock**. It renders in its centred-modal shape instead, and the content region keeps the whole of its share. Nothing else changes                                      | This is the width at which the docked pane and the content region can no longer both hold their evidenced proportions. A docked pane takes three-tenths of the viewport from a content region holding seven-tenths, leaving the content region four-tenths of the viewport: 768 px at the capture width, 512 px here, and less than that below                        |
| **1024**   | `--breakpoint-sidebar` | Below this width the conversation sidebar stops being a persistent column and becomes an **overlay drawer**, closed by default, toggled from the top bar. The content region takes the width the sidebar gives up | This is the width at which the sidebar's one-fifth-to-one-quarter share stops yielding a usable region. Its share is 205–256 px here and 154–192 px at the floor, against a body that must hold a switcher row, group rows with a disclosure caret and a count pill, per-row checkboxes in multi-select, and a docked selection bar carrying a count plus two actions |
| **768**    | `--breakpoint-floor`   | Nothing changes at this width. It is the **floor of supported operation**: the shell is required to be operable at exactly 768, and below it the posture in [Below the floor](#below-the-floor-768) applies       | Below the floor the content region's remaining share stops holding the composer's two evidenced control rows, the avatar-led message density and the conversation header's own controls at the same time. What replaces them cannot be derived from a corpus captured at one width, so the boundary is declared rather than guessed at                                |

### Why 1280, and not something else

The threshold follows from arithmetic over evidenced proportions rather than from
convention. The content region takes roughly seven-tenths of the viewport width; a
docked pane takes roughly three-tenths of the viewport width **from** the content
region (`00-product-overview.md` L305, L307). The content region's residue is
therefore four-tenths of the viewport:

| Viewport width | Rail ≈ w/22 | Sidebar ≈ w/5 | Content ≈ 0.7w | Content with a pane docked ≈ 0.4w |
| -------------- | ----------- | ------------- | -------------- | --------------------------------- |
| 1920 (capture) | 87          | 384           | 1344           | **768**                           |
| 1280           | 58          | 256           | 896            | **512**                           |
| 1024           | 47          | 205           | 717            | **410**                           |
| 768            | 35          | 154           | 538            | **307**                           |

Two readings of that table matter. The first is that at the capture width a docked
pane already reduces the content region to 768 px — the same figure as this
project's whole-shell floor — so docking is expensive in width even where the
corpus shows it happening. The second is that the content region's residue is what
has to carry the composer, and the composer's two rows are **fixed in control
count**: nine formatting controls in five separator-divided groups, and a separate
bottom action row of seven controls in three groups, which the catalog is emphatic
"must not be built from one grouping" (`00-product-overview.md` L327). Sixteen
controls, six separator rules and a split send control across two rows is an
intrinsic width, not an elastic one, and dropping a control to make it fit would
render a control set no capture evidences.

Options considered:

1. **Keep the pane docked at every supported width**, letting the content region
   take whatever residue is left. Rejected: at 1024 that residue is 410 px and at
   the floor it is 307 px, which cannot hold the two control rows at their evidenced
   count. The failure mode is a clipped or wrapped toolbar, and the catalog's warning
   about the two rows' groupings makes silently reflowing them a defect rather than a
   compromise.
2. **Narrow the pane below its three-tenths** instead of undocking it. Rejected: the
   pane's share is evidenced, and a pane at, say, one-fifth is a proportion no
   capture shows. It also only defers the problem — the residue still falls below
   what the composer needs, a little further down.
3. **Switch the pane to its centred-modal shape below 1280.** Chosen. It is the same
   contract, in the other shape the catalog already records for it, so the content
   region keeps its whole share at every width below the threshold.
4. **Suppress the pane entirely below 1280.** Rejected outright: the pane is how the
   shortcuts reference and the help panel are read, and suppressing it would make
   those controls dead at narrow widths. A dead control is a defect.

1280 rather than 1366 or 1200 because 1280 is where the residue is 512 px — the last
band in which the two control rows lay out at full count with the content inset
intact. **That figure is a calculation, not a measurement**: the control and icon
boxes it depends on (`--control-height-*`, `--icon-size-*`) are measured values
supplied by the frame-measurement tool, so if measurement moves them the arithmetic
moves with them. This record does not rely on the arithmetic staying true — the
no-clipping assertion in [Verification](#verification-how-this-contract-is-proved)
is what holds the threshold honest, and it fails loudly if the fit changes.

### Why 1024

At 1024 the sidebar's evidenced share is 205 px at the lower bound and 256 px at the
upper. The body it has to hold is not a list of names: the workspace switcher and
header controls occupy one row; conversation groups carry a disclosure caret; unread
rows carry a numeric count pill; multi-select adds a leading checkbox to every row
and docks a selection bar carrying a selection count, a primary and a secondary
action (`00-product-overview.md` L304, L320). Below 1024 a proportional sidebar can
only keep those fitting by taking a share the content region cannot spare — which is
the same coexistence failure as the pane's, one region further left.

Collapsing it is the smallest coherent behaviour consistent with adjacent evidenced
behaviour, and the adjacency is unusually direct: **a Phase-1 destination already
renders with no sidebar column at all.** The conversation browser "replaces both the
sidebar and the content region; only the rail persists"
(`02-channels.md` L414, L1018), and the shell tolerates a further destination that
"renders no sidebar" (`00-product-overview.md` L372). A shell that is already
correct without the sidebar column is a shell in which collapsing that column is a
presentation change rather than a structural one.

Options considered:

1. **Let the sidebar keep its proportional share all the way to the floor.**
   Rejected: 154 px at the floor is below what the multi-select selection bar and a
   checkbox-plus-name-plus-count row need, so the region would be present and
   unusable, which is worse than absent and reachable.
2. **Give the sidebar a floor width and let it take a growing share of a shrinking
   viewport.** Rejected: at the floor a 256 px sidebar is a third of the viewport,
   and the content region — the routed surface, and the reason the product exists —
   would be the region paying for it.
3. **Collapse the sidebar to an icon-only column**, as the rail is. Rejected: the
   sidebar's rows are conversation names, and a name has no icon form. An icon-only
   sidebar would either lose the names or duplicate the rail's own vocabulary.
4. **Collapse the sidebar to a closed-by-default overlay drawer below 1024.**
   Chosen. The names survive, the content region gets the whole width, and the
   drawer overlays rather than subtracts — so it can be wider than the proportional
   share it gave up.

1024 rather than 960 or 1100 because it is the width at which the lower bound of the
evidenced share (one-fifth) first falls below the sidebar's own intrinsic content,
and because it leaves a clear band — 1024 to 1279 — in which exactly one thing has
changed from the reference layout. A single change per band is what makes a band
diagnosable.

### Why 768 is the floor

The floor is a scope boundary, and it is declared rather than derived, because what
lies below it cannot be designed from this corpus. At 768 the content region has the
viewport less the rail — roughly 733 px — because the sidebar has already become an
overlay. That is comfortably above the 512 px the composer's two rows need, so the
shell at the floor is not a compromise: it is the reference layout with one region
overlaid and one shape substituted.

Options considered:

1. **A lower floor — 640, or 480.** Rejected: below 768 the content region alone
   stops holding the composer's two control rows, the avatar-led message density and
   the conversation header's controls simultaneously, and the redesign that would
   follow is exactly the thing a single-width corpus cannot inform. Guessing it would
   breach the discipline this record is written under.
2. **No floor at all**, letting the layout degrade continuously. Rejected: _it gets
   smaller until it stops working_ is not a contract, and it leaves the user with no
   statement of what is supported.
3. **768 as the floor, with an explicit posture below it.** Chosen. It is the
   narrowest width at which every region's evidenced structure survives intact, and
   the posture below it is written down rather than left to chance — see
   [Below the floor](#below-the-floor-768).

### Declared once, consumed by reference

The **uncertainty rule**, fourth in the provided order, prohibits a hardcoded
literal at the point of use as firmly as it prohibits omitting the mechanism. A
media query carrying `768px` inside a component stylesheet is precisely that
literal, so the three values are declared in exactly two places and nowhere else:

| Declaration site                        | Form                                                                                                                            | Consumed by                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `packages/ui/src/styles/tokens.ts`      | `--breakpoint-pane`, `--breakpoint-sidebar`, `--breakpoint-floor`, emitted into `tokens.module.css` alongside every other token | Stylesheets, and anything inspecting the resolved custom properties at run time |
| `packages/ui/src/styles/breakpoints.ts` | The same three integers as named numeric constants, plus the media-query strings built from them                                | TypeScript consumers, through the `@relay/ui` barrel — never by deep import     |

Three obligations follow, and each is checkable rather than aspirational.

- **The integers 1280, 1024 and 768 appear literally in those two files only.**
  Anywhere else in `packages/ui`, `apps/web` or `e2e` a literal is a defect, and the
  same holds for `1279`, `1023` and `767` — an off-by-one restatement of a breakpoint
  is still a second copy of it. **This binds the tests too**: the widths in
  [Where each assertion lives](#where-each-assertion-lives) are stated as numbers for
  a reader's benefit, and the specifications derive them from the exported constants —
  a band's interior from the constant, a band's edge as the constant minus one — so
  that moving a value moves its tests with it rather than leaving them asserting the
  old boundary. Two widths in that table are deliberately not breakpoints and are
  named once in `e2e/support/`: the corpus capture width, and one probe width well
  below the floor.
- **The two sites are asserted equal by a unit test**, so the duplication is checked
  rather than trusted. Two representations exist because a CSS custom property
  cannot be evaluated inside a media-query condition — a language limitation, not a
  design choice — and the honest way to carry an unavoidable second copy is to make
  a test fail when the copies diverge.
- **No stylesheet outside `packages/ui` contains a width condition at all.** The
  shell grid primitive resolves the current band once, from the media-query strings
  in `breakpoints.ts`, and publishes it as a layout-mode attribute on the shell root;
  every region stylesheet keys off that attribute. `apps/web` composes the regions
  and never states a width, which is what keeps the **shared-component rule**, first
  in the provided order, satisfied by construction rather than by review.

The token names say what each threshold governs rather than how big it is, so a
reader of a stylesheet can tell which decision a rule belongs to. Size-graded names
were considered and rejected: a name like _medium_ tells a maintainer nothing about
why the value is 1024, and this record's whole purpose is to make that answerable
from the source.

#### Why these are not environment-overridable

A breakpoint is **not** an observed-value default, and the distinction matters enough
to state rather than leave a reader to infer. The uncertainty rule's clause about
environment-overridable configuration governs a value **derived from a single frame** —
a timer, expiry, window, threshold or limit whose mechanism is evidenced while its
setting is a guess. No frame evidences a breakpoint, because no frame is narrow. There
is no reading to turn into a hypothesis about a default, so there is nothing for a
deployment to override on better information.

The clause that does govern here is the one about absent evidence, which asks for the
smallest coherent behaviour consistent with adjacent evidenced behaviour, recorded with
its options, its choice and its rationale — which is what every section above does.

Breakpoints also fail the practical test for a deployment setting: moving one without
also moving the region behaviour keyed to it produces a layout no one designed. A
deployment that set the sidebar threshold to 900 would get a 205 px sidebar the drawer
was introduced to avoid. So they sit with the design system's other structural
constants, which `docs/decisions/observed-values.md` records as deliberately not
environment-overridable, rather than in the environment-driven configuration beside
invite expiry and the session bounds. Neither kind is ever inlined at a point of use;
that part of the rule binds both equally.

## Per-region behaviour at each breakpoint

All five regions appear below, including the docked pane. Every behaviour is a
behaviour of the region's own shared primitive in `packages/ui` — the
**shared-component rule**, first in the provided order, makes a per-surface override
in `apps/web` a defect, not a shortcut — and every cell is a presentation change
only, never a change of route or of authority.

| Region                   | 1280 and above (reference)                                                                                                                           | Below 1280                                                                                            | Below 1024                                                                                                                                                                                                                                 | Below 768 (unsupported)                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Navigation rail**      | Fixed leftmost column at `--rail-width`; workspace icon at the head, icon-and-label destination stack, create control and account avatar at the foot | Unchanged                                                                                             | Unchanged — still fixed, still icon-and-label, every destination still reachable                                                                                                                                                           | Unchanged; the rail is the one region that is identical at every width             |
| **Conversation sidebar** | Persistent second column at its evidenced share, with its keyboard-operable resizer                                                                  | Unchanged                                                                                             | **Closed-by-default overlay drawer**, opened by a toggle that appears in the top bar's left group; focus moves in, is trapped, and returns to the toggle on close; the resizer is withdrawn because the drawer's width is not the column's | Drawer, unchanged in behaviour, inside an interface that states its own limitation |
| **Top bar**              | Full-width band; history controls left of centre, search entry centred at roughly half the width, help control far right                             | Unchanged                                                                                             | Gains the sidebar-drawer toggle at the head of the left group; the search entry keeps its centred position and its roughly-half share, yielding width proportionally; **the help control stays at the far right**                          | Unchanged in anatomy; the help control's position is invariant at every width      |
| **Content region**       | Remaining width, roughly seven-tenths; composer pinned to its foot                                                                                   | **Keeps its whole share**, because the pane no longer docks                                           | **Gains the width the sidebar gives up**; composer still pinned, still not scrolling with the list                                                                                                                                         | Never collapses at any width, supported or not                                     |
| **Docked details pane**  | Fifth region taking roughly the right three-tenths **from** the content region; rail and sidebar untouched                                           | **Centred-modal shape.** Same contract, same content, other shape; the content region keeps its share | Centred-modal shape, unchanged                                                                                                                                                                                                             | Centred-modal shape, unchanged                                                     |

### Navigation rail

**The rail does not change at any breakpoint, and that is the strongest reading of
the evidence rather than the laziest.** The catalog calls it "the narrowest region,
and fixed" (`00-product-overview.md` L303) — the only region it describes that way.
A fixed region does not scale with the viewport, so it holds `--rail-width` from
1920 down to the floor. At the capture width that width is roughly a twenty-second of
the viewport; at the floor the same absolute width is closer to a ninth. **That
growing share is a cost, and it is accepted deliberately**, because the alternative
is to make the shell's primary destination switcher the first thing to degrade.

Its destinations keep their icon-and-label form at every supported width.

Options considered:

1. **Reduce the destinations to icons with accessible names below 1024.** Rejected:
   the evidenced contract is "a vertical stack of icon-and-label destinations"
   (`00-product-overview.md` L303), and an icon-only rail is a form no capture shows.
   It also trades a visible label for a name only assistive technology can reach,
   which is a downgrade for every sighted keyboard user in exchange for roughly forty
   pixels.
2. **Scale the rail proportionally, as the other columns scale.** Rejected on the
   arithmetic: a twenty-second of 768 is about 35 px, which holds neither a label nor
   the account avatar at the foot. Scaling the one region the catalog calls fixed
   would also contradict the evidence directly.
3. **Hold `--rail-width` at every supported width, labels intact.** Chosen. The rail
   is the last region to change because it never changes.

**Every rail destination remains reachable at every supported width.** This is not a
courtesy; a rail destination that cannot be reached is a dead control, and a dead
control is a defect. Reachability has two evidenced routes and both are preserved:
the rail carries a More entry that holds "exactly the destinations the rail is not
currently showing" (`00-product-overview.md` L193), and the shortcuts reference maps
a numbered combination to each destination, which the catalog calls "direct evidence
that rail destinations are addressable positionally as well as by pointer"
(`00-product-overview.md` L142). Both routes work identically at 768 and at 1920.
The sixteen destinations belonging to deferred areas resolve to their placeholder
surfaces at every width, exactly as they do at the capture width; a placeholder is a
defined surface, so it is reachable rather than dead — see
`docs/decisions/placeholder-surfaces.md`.

### Conversation sidebar

Below 1024 the sidebar stops being a persistent column and becomes a
**closed-by-default overlay drawer**. It overlays the content region rather than
subtracting from it, so it can be wider than the proportional share it gave up, and
the conversation names it exists to show survive intact.

The reopen affordance is a toggle at the head of the top bar's left-of-centre group,
immediately before the history controls. It is present **only below 1024**, because
above that width the sidebar is a persistent column and a control that collapses it
is behaviour no capture evidences — adding it at every width would invent a feature
rather than adapt one. Its key binding is recorded in
`docs/decisions/keyboard-shortcuts.md`, alongside the resize binding the shortcuts
reference already evidences in its own sidebar group (`00-product-overview.md` L142).

**Focus handling on open, stated precisely, because this is where collapse-to-drawer
patterns fail.** The drawer overlays interactive content, so it takes the modal focus
discipline rather than the region one: focus moves into the drawer on open, is
trapped while it is open, the dismiss key closes it, and focus returns to the toggle
that opened it. It reuses the shared focus-trap behaviour in `packages/ui/src/hooks/`
rather than reimplementing it. **The drawer also resets its own scroll offsets on
close**, so that reopening presents the state a first open presents.

That last obligation is not speculative. The catalog measured this exact failure on
the **published documentation site** — not in the product, and the distinction
matters — where at narrow widths the primary sidebar becomes an off-canvas drawer:
four presses of the focus-advance key drive the drawer's scroll container from 0 to
242 px, the first-level navigation slides out of view, the opaque navigation rows
drop from 25 to nothing, and no focus indicator is painted at all because the
element holding it has an effective opacity of zero. Closing and reopening the
drawer does not recover it, because the scroll offset survives the close; only a
reload does (`README.md` known limitation 7). The remedy is recorded there as
withheld, since applying it would exceed the single permitted site-configuration
edit. It is cited here as the reason two of this record's obligations exist —
reset-on-close, and a visible focus indicator inside the drawer at every step.

Options considered:

1. **A push drawer that displaces the content region sideways.** Rejected: the
   content region would leave the viewport, which is a movement no capture shows, and
   the region that must never yield is the one that would.
2. **An inline collapse to a zero-width column with an edge handle.** Rejected: an
   edge handle at the boundary of a 768 px viewport is a small target, and the
   sidebar's resizer already lives at that boundary — two different behaviours on one
   edge is a confusion, not a saving.
3. **A closed-by-default overlay drawer with a top-bar toggle.** Chosen. It keeps the
   content region whole, keeps the names, and puts the affordance in a region that is
   present at every width.

**Collapsing the sidebar changes no route.** Opening or closing the drawer pushes no
history entry and alters no URL; the routed destination is whatever it was. Activating
a conversation row inside the drawer navigates the content region — which is what a
sidebar row does at any width — and closes the drawer afterwards, because the drawer's
job is done and leaving it open would obscure the surface it just navigated to. The
sidebar is a sibling of the content region at every width, never a destination of its
own.

### Top bar

The top bar keeps its evidenced anatomy at every width: history controls grouped left
of centre, the search entry centred, the help control at the far right
(`00-product-overview.md` L302). Below 1024 the sidebar-drawer toggle joins the head
of the left group; nothing else moves.

The search entry is "a centred field occupying roughly half the top bar's width, with
a leading magnifier glyph" (`00-product-overview.md` L323). It keeps that share and
that position, yielding width proportionally as the band narrows, down to a floor at
which the magnifier glyph, one query token and the trailing clear control still
render. The arithmetic holds at the shell's floor: the left group is four control
boxes and the help control is one, so roughly half of 768 px remains available to a
field that wants roughly half of it.

Options considered:

1. **Collapse the entry to an icon-only trigger below 1024.** Rejected: no capture
   shows that form, and the entry's evidenced empty state is a placeholder naming the
   workspace — information an icon cannot carry. Search _results_ are deferred to a
   later phase, but the _entry_ is part of the shell in this one, so degrading it
   degrades a shipped surface.
2. **Move the entry out of the top bar into the content region below 1024.**
   Rejected: it would stop being a shell control, and a query typed on one surface
   would no longer obviously apply to the workspace.
3. **Keep the field centred and let it narrow to a floor.** Chosen. One region, one
   behaviour, no new form.

**The help control stays at the far right at every width, on every surface.** This is
the one position in the top bar that is treated as invariant rather than merely
stable, because the accessibility standard's consistent-help criterion requires a
help entry to appear in the same relative position across surfaces, and that
criterion is one of the four an automated scan cannot judge. It therefore carries an
explicit assertion in the accessibility specification rather than relying on the
scanner — see [Verification](#verification-how-this-contract-is-proved).

### Content region

**The content region never collapses, at any width, supported or not.** It is the
routed surface — the only region that changes when navigation occurs
(`00-product-overview.md` L307) — so collapsing it would leave the shell with nothing
to show. It is always the last region to yield space, and below each breakpoint it
gains rather than loses: below 1280 it keeps its whole share because the pane stops
docking, and below 1024 it takes the width the sidebar gives up.

The composer stays pinned to the region's foot (`00-product-overview.md` L326;
`03-messaging-and-composer.md` L7), and the body's own acceptance criterion fixes the
whole order — an optional intro hero above the scrolling message list, then the
composer pinned to the foot, then a right-aligned newline-modifier hint beneath it,
"with the composer never scrolling with the list"
(`03-messaging-and-composer.md` L747). That arrangement is width-independent: a
composer that started scrolling with the list at a narrow width would be a different
contract, not a narrower one.

**The composer's two rows keep their full control counts at every supported width.**
Nine formatting controls in five separator-divided groups, and a separate bottom
action row of seven controls in three groups, are what the catalog evidences, and it
warns that the two rows "carry different group counts and must not be built from one
grouping" (`00-product-overview.md` L327). Dropping a control to win space would
render a control set no capture shows, and merging the rows would breach the
shared-component rule outright.

Where the toolbar genuinely cannot fit, the lever is the one the corpus already
supplies: the formatting toggle in the action row, which the catalog records as
evidence "the toolbar can be hidden" (`00-product-overview.md` L327). So the toolbar
is hidden **as a whole, by the user, through an evidenced control** — never
dismantled control-by-control by the layout.

Options considered:

1. **A single-pane pattern below 1024**, showing either the sidebar or the content
   region but not both, as narrow layouts commonly do. Rejected: it makes the sidebar
   a destination in all but name, which breaks the hierarchy invariant outright — the
   shell would become a page one navigates away from, and the back control would start
   reversing layout changes.
2. **Let the content region yield space to preserve another region's proportion.**
   Rejected: the content region is the routed surface, and every other region exists to
   get the user to it. A shell that protects its navigation at the cost of its content
   has its priorities inverted.
3. **Detach the composer from the region's foot below 1024** — float it, or collapse
   it to a control that expands on demand. Rejected: pinning to the foot and not
   scrolling with the list are both evidenced and both carry acceptance criteria, and a
   floating or collapsed composer is a form no capture shows.
4. **Let the toolbar wrap to a second row, or scroll horizontally.** Rejected:
   wrapping turns the evidenced five-group reading into something else, and a
   horizontally scrolled toolbar hides controls behind a gesture with no visible
   affordance.
5. **The content region never collapses, always yields last, and gains the width the
   other regions give up.** Chosen. It is the only option that leaves both the
   hierarchy invariant and the composer's evidenced anatomy intact at every supported
   width.

### Docked details pane

The pane is the fifth region, and its defining property is that it **takes width from
the content region rather than adding to the layout** — roughly the right three-tenths
of the viewport width, leaving rail and sidebar untouched
(`00-product-overview.md` L307, L797, L342). Because it subtracts, the two regions
cannot both hold their proportions indefinitely, and below 1280 they do not: the pane
renders in its **centred-modal shape** and the content region keeps its whole share.

**This is a variant selection, not a new structure.** The contract already carries
both shapes — "Details surface, as a centred modal or a docked pane … the docked form
takes roughly the right three-tenths of the viewport width from the content region,
the modal form is centred and dims its backdrop" (`00-product-overview.md` L342) — so
the narrow-width behaviour chooses between two documented shapes and invents neither.

Two things make the choice safer than a fallback usually is.

- **The modal shape is what a Phase-1 details surface already uses at the capture
  width.** The conversation details surface "is a centred modal that dims the whole
  shell, not a docked pane", and the catalog warns that the seven dialogs opened from
  it "stack above it", concluding that "A build that renders it as a right-hand pane
  will have nowhere to put the stack" (`02-channels.md` L208, L930). The modal shape is
  therefore the better-exercised of the two, not the degraded one.
- **The docked shape's Phase-1 users are reference surfaces** — the shortcuts
  reference and the help panel (`00-product-overview.md` L307) — which carry no
  stacked dialogs and read perfectly well centred.

**The switch is implemented in the owning module**, `packages/ui/src/components/DetailsPane`,
and nowhere else. No feature directory selects a shape, and no feature passes a
narrowness flag inward: the module reads the shell's published layout mode and picks
its own shape. A feature that chose the shape would be a second implementation of the
contract's own decision, which the shared-component rule forbids.

Options considered:

1. **Keep docking at every width and let the content region take the residue.**
   Rejected on the arithmetic in [Why 1280](#why-1280-and-not-something-else).
2. **Dock the pane over the content region as an overlay instead of beside it.**
   Rejected: the pane's evidenced relationship to the content region is subtraction
   with reflow — the region "narrows and rewraps rather than being overlaid"
   (`13-profiles-people.md` L292) — so overlaying it would contradict the one
   observation available.
3. **Render the pane full-width, replacing the content region.** Rejected: it would
   make the pane a routed destination in all but name, which the hierarchy invariant
   forbids.
4. **Switch to the contract's own centred-modal shape below 1280.** Chosen.

**Inconsistency preserved rather than reconciled.** The measurement manifest records a
divergence between the docked and the modal readings of the conversation details
surface, and takes no position on it. This record takes none either: it specifies
which shape renders at which width, which is a layout decision, and leaves the
classification question where the manifest left it. The divergence is logged in
`docs/decisions/catalog-defects.md`.

## Below the floor: 768

**Viewports below 768 are out of scope for this run.** The boundary is stated plainly
because a scope boundary that is not stated becomes a silent failure, and "out of
scope" must never resolve to "quietly broken". Two handlings are permitted below the
floor, and each surface is assigned to exactly one of them.

| Handling                                     | Surfaces assigned                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | What the user sees                                                                                                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — state the limitation, keep rendering** | The persistent shell; the conversation surface (header, bookmark row, message list, composer); the read-only archived conversation, whose composer is already replaced by a status bar; the conversation-creation wizard in its modal; **every unauthenticated gate surface**, including sign-up, verification, the three sign-in paths, invitation acceptance, the workspace chooser and the setup wizard; the sixteen placeholder destinations; and the page-level error surface | The surface renders and stays usable. A page-level advisory names the supported minimum width and does not dismiss itself                                           |
| **B — defer the route below the floor**      | Two authenticated in-shell surfaces whose evidenced structure is irreducibly wide: the **conversation browser**, a filter row of three chip menus with a right-aligned sort control above a results table of rows each carrying a metadata line; and the **conversation details surface**, a four-tab bar above grouped cards that must host the seven dialogs stacking above it                                                                                                   | The surface does not render. A defined narrow-width surface renders in its place, naming the route, the supported minimum, and one exit back to a supported surface |

The split follows one principle and one hard constraint.

**The principle: a surface is handled by A when narrowing makes it cramped, and by B
when narrowing would make it misrepresent its own design.** A single stacked column
narrows honestly — it is the same surface, tighter. A three-chip filter row above a
table of metadata-bearing rows, or a four-tab modal that must host stacked dialogs, do
not: below the floor they would have to be rebuilt into something the corpus cannot
inform, and shipping an improvised rebuild is what the discipline in this record exists
to prevent.

**The constraint: handling B is available only where a supported surface is one control
away.** That is why every gate surface takes handling A regardless of its structure. A
signed-out or first-run user has no supported surface to fall back to, so deferring
their route would not degrade an experience — it would end it, with no path forward and
no way to create the account that would provide one. Two of them narrow less
comfortably than the rest and are called out rather than glossed: the setup wizard's
plan-choice step renders **two cards side by side**, and it stacks to a single column
below the floor; the creation wizard's modal takes the available width rather than its
evidenced share. Both are authored adaptations, not observations, and both are recorded
as such in `docs/decisions/component-extensions.md`.

Three obligations attach to handling B, and they are what keep a deferral from
becoming a broken link.

- **Deferral is a rendering decision at the same address, never a redirect.** The URL
  does not change, no history entry is pushed, and the route stays exactly where the
  user asked for it. Widening the window past the floor renders the real surface with
  no further navigation. Deep links and browser history therefore keep working below
  the floor, which they would not if the deferral rewrote the address.
- **The narrow-width surface always names an exit**, and the exit leads to a surface
  handled by A, so the user is never left on a surface with nowhere to go.
- **Nothing is disabled server-side.** The deferral is presentational; every operation
  the deferred surface would have performed remains authorized, enforced and available
  through the API exactly as before. Rendering is not permission in either direction.

### The limitation message is authored microcopy

Both strings — the advisory in handling A and the body of the narrow-width surface in
handling B — live in `packages/shared/src/copy/en.ts` with every other string in the
product. Neither is an inline literal, for two independent reasons: the **identity
rule**, fifth in the provided order, requires all microcopy to be authored originally
and centralising it gives the brand guard a single high-value file to police; and the
**uncertainty rule** forbids a literal at the point of use, which a hard-coded
sentence in a component is.

The advisory names the supported minimum by **interpolating the floor constant** from
`packages/ui/src/styles/breakpoints.ts` rather than printing a number as text. A
sentence with `768` typed into it is a third copy of the breakpoint, and would go
stale the moment the value moved.

The advisory renders through the page-level variant of the banner contract in
`packages/ui`, not as a bespoke element, and it does not dismiss itself — the
condition it reports persists for as long as the viewport is narrow, so a transient
report would be the wrong shape for it.

### What is not being claimed

- **No native mobile client**, and no native desktop client.
- **No desktop-to-mobile hand-off.**
- **No responsive design for the public marketing properties**, which are deferred as
  whole areas.

Each is deferred with its reason recorded in `docs/decisions/roadmap.md`, which is
where the rationale belongs; restating it here would create a second copy that can
disagree with the first.

## Verification: how this contract is proved

Nothing above is satisfied by being written down. The **uncertainty rule** is explicit
that no acceptance criterion may be marked satisfied without a passing test behind it,
so every claim in this record is either asserted by a test named below or is not
claimed.

### The definition of operable

The shell is **operable** at a width when all six of the following hold. This is the
definition the tests encode, so that "operable at 1024" means one thing rather than
whatever a reviewer's eye accepts.

1. **Every rail destination is reachable** — by pointer, through the rail or its More
   entry, and by keyboard through its numbered combination.
2. **The sidebar is reachable and its conversation rows navigate the content
   region** — as a persistent column at and above 1024, and as a drawer that is
   **openable and closable** below it, from both pointer and keyboard.
3. **The composer is usable** — its input takes focus, its two rows render at their
   full control counts or the toolbar is hidden as a whole by its own toggle, and the
   send control is reachable.
4. **No control is overlapped or clipped.** Every interactive element's box lies
   inside its region's box, and no two interactive boxes intersect.
5. **The shell itself does not scroll horizontally.** The scrolling message list and
   the sidebar's own body scroll vertically, as they do at the capture width; the
   shell's own scroll width never exceeds its client width.
6. **The help control is at the far right of the top bar**, in the same relative
   position as at every other width and on every surface.

### Where each assertion lives

| Assertion                                                                                                                           | Widths                 | Location                                             |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------- |
| The six operability conditions above, one test per width                                                                            | 1280, 1024, 768        | `e2e/specs/shell.spec.ts`                            |
| The pane renders docked at and above 1280 and centred-modal below it                                                                | 1366, 1280, 1279, 1024 | `e2e/specs/shell.spec.ts`                            |
| The sidebar is a persistent column at and above 1024 and a drawer below it                                                          | 1024, 1023, 768        | `e2e/specs/shell.spec.ts`                            |
| Opening and closing the drawer changes neither the URL nor the history length                                                       | 1023                   | `e2e/specs/shell.spec.ts`                            |
| Drawer focus: focus enters on open, is trapped, has a visible indicator at every step, and returns to the toggle on close           | 1023, 768              | `e2e/specs/shell.spec.ts`                            |
| Drawer reset: a close followed by a reopen presents the same state as a first open, including scroll offsets                        | 768                    | `e2e/specs/shell.spec.ts`                            |
| Focus order after a region collapses follows the visual order of what remains                                                       | 1023, 768              | `e2e/specs/shell.spec.ts`                            |
| Below the floor: handling A renders its surface plus the advisory; handling B renders the narrow-width surface at the unchanged URL | 767, 640               | `e2e/specs/shell.spec.ts`                            |
| Accessibility scan of every Phase-1 route, with no new violation at any width                                                       | 1920, 1280, 1024, 768  | `e2e/a11y.spec.ts`                                   |
| Consistent help: the help control's relative position is identical across every Phase-1 route                                       | 1920, 1280, 1024, 768  | `e2e/a11y.spec.ts`                                   |
| The two declaration sites carry identical values                                                                                    | n/a                    | `packages/ui/src/styles/breakpoints.test.ts`         |
| Each region primitive selects the expected presentation for a given layout mode                                                     | n/a                    | co-located tests under `packages/ui/src/components/` |

The widths in that table are written as numbers so a reader can see the coverage at a
glance. **The specifications do not contain those numbers**: a band's interior comes
from the exported constant and a band's edge from the constant minus one, per
[Declared once](#declared-once-consumed-by-reference). Only two widths there are not
derived from a breakpoint — 1920, the corpus capture width, and 640, a single probe
well below the floor — and both are named once in `e2e/support/`.

The end-to-end runner's default viewport is 1280 by 800, which is the first
breakpoint, so the shell specification sets each width explicitly per test rather than
relying on the default. The accessibility project runs the scanner with the current
standard's tags; **it runs at all four widths, not only at the capture width**,
because a violation introduced by a collapse is invisible to a scan taken wide.

### Focus is a first-class obligation, not a detail

Two focus obligations are singled out because the catalog's own measurement shows how
quietly they fail — on the published documentation site, as recorded above.

- **Focus order stays sensible after a region collapses.** Sequential focus follows
  the visual order of what is actually on screen. An element inside a collapsed or
  off-screen region is not in the focus order at all, which is stronger than being
  merely invisible: an element that takes focus without being visible is the exact
  condition the measured defect produced, where the focus indicator existed but was
  painted at zero opacity.
- **A collapsed-then-reopened region restores focus predictably.** Reopening returns
  the region to the state a first open presents — same scroll offsets, same first
  focus target — and closing returns focus to the control that opened it. The
  measured defect survived a close and reopen and yielded only to a page reload; a
  region that needs a reload to become usable again is broken, so the reopen path is
  asserted rather than assumed.

Both are also why the drawer takes the modal focus discipline rather than inventing a
lighter one: focus trapping and focus restoration already exist as shared behaviour in
`packages/ui/src/hooks/`, and reusing them keeps one implementation to test.

## Downstream contract

Eight artifacts implement this record. The coupling is listed so that a change to any
one of them is recognisable as a change to all of them.

| Consumer                                                       | Obligation                                                                                                                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/styles/tokens.ts`                             | Declares `--breakpoint-pane`, `--breakpoint-sidebar` and `--breakpoint-floor`. These are **authored** values, not measured ones, and carry no frame provenance because no frame evidences them |
| `packages/ui/src/styles/breakpoints.ts`                        | Declares the same three integers as named constants and builds the media-query strings from them. Exported through the `@relay/ui` barrel; deep imports are lint errors                        |
| The shell grid primitive in `packages/ui`                      | Resolves the current band once and publishes it as a layout-mode attribute on the shell root. It is the **only** width observer in the product                                                 |
| `packages/ui/src/components/{Rail,Sidebar,TopBar,DetailsPane}` | Each region's presentation per band, keyed off the published layout mode. The pane's shape selection lives here and nowhere else                                                               |
| `apps/web/src/shell/**`                                        | Composes the regions. States no width, contains no media query, and never passes a narrowness flag into a shared component                                                                     |
| `packages/shared/src/copy/en.ts`                               | The advisory string and the narrow-width surface's copy, both authored, the advisory interpolating the floor constant rather than printing a number                                            |
| `e2e/specs/shell.spec.ts`                                      | Every operability, presentation, routing and focus assertion in the table above, at the widths named there                                                                                     |
| `e2e/a11y.spec.ts`                                             | The scan at all four widths, plus the explicit consistent-help assertion the scanner cannot make                                                                                               |

### Synchronisation obligation

Changing a breakpoint value is a design-affecting change, not a tweak. Five things
move together or the set is inconsistent:

1. the value in `packages/ui/src/styles/tokens.ts`;
2. the same value in `packages/ui/src/styles/breakpoints.ts`;
3. the widths named in `e2e/specs/shell.spec.ts` and `e2e/a11y.spec.ts`, including the
   just-below-the-boundary widths that prove the band edge;
4. the band boundaries stated in the tables in this record;
5. the reasoning under [Why 1280](#why-1280-and-not-something-else),
   [Why 1024](#why-1024) or [Why 768 is the floor](#why-768-is-the-floor), because a
   value whose stated reason no longer holds is a value with no reason.

The equality test between sites (1) and (2) catches the most likely half-done change
on its own. It cannot catch a stale rationale, which is why (5) is listed explicitly.

### Cross-reference obligation

Five sibling records must agree with this one.

- **`docs/decisions/component-extensions.md`** carries the sidebar's drawer
  presentation and the details pane's shape selection as **variants of existing
  contracts**, never as new contracts and never as a merge of two. Both are extensions
  of a contract the inventory already defines, which is the second rung of the
  degradation ladder rather than the third.
- **`docs/decisions/gap-register.md`** carries this gap's entry — responsive behaviour
  under the named-gap build contract — with the options, the choice and the rationale
  summarised and pointing here for the full reasoning rather than restating it.
- **`docs/decisions/state-matrix.md`** owns the presentations a region renders; this
  record owns _which_ presentation renders at which width. Where the two touch — a
  region skeleton inside a collapsed region, an empty state inside a drawer — the
  state matrix governs the rendering and this record governs the geometry.
- **`docs/decisions/keyboard-shortcuts.md`** carries the drawer toggle's binding
  beside the sidebar resize binding the shortcuts reference already evidences, and
  marks the toggle's binding as invented, since no capture shows it.
- **`docs/decisions/placeholder-surfaces.md`** carries the sixteen deferred
  destinations; this record adds only that each must resolve at every supported width.

If any of them diverges, the divergence is a finding to record rather than a
discrepancy to smooth away — this record is the authority on breakpoints and per-region
geometry, and each sibling is the authority on its own subject.

## Change control

The breakpoint set is fixed for the run at three. Changing it is permitted and is a
recorded act rather than an edit.

- **Adding a breakpoint** requires a row in the breakpoints table carrying all four
  fields, an options-considered list justifying the threshold on its own merits, a row
  per region in the per-region matrix, and the widths added to both test files. A
  fourth breakpoint that changes nothing for any region does not qualify, because a
  band in which nothing changes is not a band.
- **Removing a breakpoint** requires stating which region behaviours lose their
  trigger and either reassigning them to an adjacent breakpoint or withdrawing them,
  and it obliges the same test changes. A behaviour may not be left with no threshold
  that fires it.
- **Moving the floor** additionally requires reassigning every surface in the
  below-the-floor table, because handling A and handling B are assigned relative to
  the floor rather than absolutely.
- **Either change** obliges the synchronisation above. None of them opens the corpus:
  no frame can settle a breakpoint, so no frame access is warranted by a change to
  this record, and none was needed to write it.

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **No frame was opened.** Every fact above was resolved from catalog prose, and the
  central fact — that width is 1920 in all 1,022 frames — is published by the catalog
  itself, so opening a frame to confirm it would have breached the corpus-handling
  rule rather than supported this record. The corpus cannot answer a question about a
  second width, so there was nothing to look for.
- **Frames by number only, and only where cited.** This record cites no frame number
  at all, because every fact it needs is stated in prose. No filename appears, and
  neither does the catalog's percent-encoded citation form — both would carry a
  third-party product name.
- **Rules cited by subject and position, not by identifier.** The five project rules
  carry platform identifiers that each embed a third-party product name, so writing one
  here would breach the identity rule this record is otherwise observing. They are
  cited by what they govern and where they sit in the provided order — the
  shared-component rule is the first, the server-authorization rule the second, the
  corpus-handling rule the third, the uncertainty rule the fourth, the identity rule
  the fifth. Position alone would be unsafe, because the identifiers are permuted
  relative to the requirement labels; position **with** subject is not.
- **Functional naming throughout.** Regions and controls are named for what they do —
  navigation rail, conversation sidebar, top bar, content region, docked details pane,
  search entry, help control, composer, formatting toolbar, bottom action row, drawer
  toggle. No third-party product or feature name appears, and no string legible in any
  frame is transcribed. The two user-facing strings this record requires are authored
  and live in the shared copy module.
- **No colour value, no artwork, no copy from a frame.** This record specifies geometry
  and behaviour only. It states no colour, because colour is not a responsive concern
  and the palette has one authorised source.
- **No diagram fences.** The committed documentation-site configuration does not render
  them: its superfences extension consumes a fenced block before the diagram plugin can
  claim it, so a diagram fence publishes as a highlighted code box. This record uses
  tables and prose instead, and it neither adds a navigation entry to the site
  configuration nor applies the withheld extension fix — both are out of bounds.
- **Fenced lines are held to 74 characters**, the catalog's measured ceiling, because a
  published fence clips rather than wraps.
- **Evidence by citation; absence recorded as absence.** Every proportion, every
  structural claim and every warning above names the document and line it came from.
  Where the corpus supplies nothing — which is the whole of responsive behaviour — the
  record says so and then decides, rather than implying an observation it does not have.
- **Inconsistencies preserved.** Two are carried rather than reconciled: the
  docked-versus-modal reading of the conversation details surface, and the fact that the
  published site's own theme changes shape at 1220 and 960 while this record's product
  thresholds are 1280, 1024 and 768. The second is not a contradiction to resolve — the
  site theme and the product are different software — but it is close enough to mislead
  a reader who skims, so it is named. Both are logged in
  `docs/decisions/catalog-defects.md`.
- **Nothing here is deferred for want of a number.** The corpus supplies no responsive
  evidence whatsoever, and the response is a full contract with three thresholds, five
  region behaviours, two below-the-floor handlings and twelve assertions — not a note
  saying the matter is unresolved.
