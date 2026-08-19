# Placeholder surfaces: the sixteen deferred destinations, and why not one of them is a dead control

The governing principle of this record is short and absolute: **a dead control is a
defect.**

The shell this run ships carries a complete navigation rail, and most of what that
rail points at belongs to a later phase. That is an uncomfortable arrangement to
leave undefined, because it offers a member a control for every destination while
having built only a few of them. There are four ways to resolve the discomfort and
three of them are worse than the problem: disable the control, hide it, or let it
lead to an error. This record takes the fourth, and specifies it destination by
destination.

The distinction it exists to protect is between **deferred** and **broken**. A
deferred capability is one the product knows about, names, and has scheduled. A
broken one is a control that swallows a click. They are trivially easy to confuse
from the outside, and the only thing that tells them apart is a surface that says
which it is. Sixteen such surfaces are specified below.

| Field                               | Value                                                                                                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record for the deferred-destination placeholder surfaces                                                                                               |
| Status                              | Operative. Authored **before** the sixteen route modules and their strings exist                                                                                |
| Countable obligation                | **16** destinations, each with a route, a replacing phase, an empty shape, a copy intent and an onward-action decision                                          |
| Shapes used                         | **3** of the four empty compositions — illustrated-with-action ×3, illustrated-no-action ×9, text-only ×4. The instructional composition is deliberately unused |
| Governing gate                      | The catalog's own Phase-1 exit condition: every rail destination is present and routes (`README.md` L481)                                                       |
| Frames opened to author this record | **0**                                                                                                                                                           |
| Presentation comes from             | `C-EMPTY-STATE` in `packages/ui`, consumed through the package barrel. No placeholder component exists, by rule                                                 |
| Route modules live at               | `apps/web/src/routes/placeholders/`, one thin composition per destination                                                                                       |
| Every string comes from             | `packages/shared/src/copy/en.ts`                                                                                                                                |
| Read endpoint                       | `GET /api/v1/placeholders/{destination}`, specified in `docs/decisions/http-api-contract.md`                                                                    |
| Companion records                   | `docs/decisions/roadmap.md`, `docs/decisions/state-matrix.md`, `docs/decisions/component-extensions.md`, `docs/decisions/keyboard-shortcuts.md`                 |

**How this record cites.** A document citation names a file under `docs/workflows/`
together with its line number, so a bare `README.md` below means the catalog index in
that directory and never the one at the repository root. A frame is cited by its
**number alone**, never by a filename: every filename in the corpus embeds a
third-party product name, and so does the catalog's own percent-encoded citation form,
both of which are prohibited in a committed file. Deferred areas are cited by their
**two-digit area number**, which is the catalog's own convention for the same reason
(`README.md` L84). No frame was opened to author this record, and none needed to be:
every question it asks is about routing and scope, and neither is visible in a
screenshot.

**How this record cites the project rules.** By subject and by position in the order
they were provided, never by identifier. Each of the five rule identifiers embeds the
same third-party product name, so writing one into this file would breach the very
rule the file is otherwise observing. The rules that govern here are the
**single-implementation rule** (the first as provided), the **authorization rule**
(the second), the **corpus-handling rule** (the third), the **uncertainty rule** (the
fourth) and the **identity rule** (the fifth). Position alone would be unsafe, because
the identifiers are permuted against the requirement labels they correspond to;
position together with subject is not. This is the convention
`docs/decisions/state-matrix.md` and `docs/decisions/roadmap.md` already established.

**How this record describes wording.** By what a surface communicates, never by the
words themselves. Not one heading, sentence, label or button caption below is
transcribed from a frame. The catalog does transcribe the rail overflow menu's own
destination descriptions in quotation marks (`00-product-overview.md` L191); those are
another company's product copy and none of them is reproduced here or anywhere in the
delivered tree. Where a row below says a placeholder "states which phase owns the
capability", that is a communicative obligation and an instruction to author the
sentence — not a paraphrase to be pasted into code. The words live in
`packages/shared/src/copy/en.ts` and are written there.

## The principle, and where it comes from

This is not a preference. It is the catalog's own Phase-1 exit condition, stated as a
gate: every rail destination in the information-architecture map is present and
**routes**, with destinations belonging to later phases resolving to a defined
placeholder rather than a dead control (`README.md` L481).

Three properties of the shell make that gate load-bearing rather than decorative.

**The rail's destination set is part of the contract, not a configuration detail.**
The navigation rail is observed carrying two, three, five and six destinations across
different captures, and the catalog states plainly that the varying set **is** part of
the contract (`00-product-overview.md` L319). A build cannot therefore satisfy the
gate by shipping a shorter rail: the destinations it does not show are still
destinations.

**Hiding a destination from the rail does not remove it from the product.** The rail
carries an overflow entry whose menu holds exactly the destinations the rail is not
currently showing — at the capture that evidences it, one destination is on the rail
and is correspondingly absent from the menu (`00-product-overview.md` L193). The rail
and its overflow menu are complements. So a destination pushed off the rail reappears
in the menu, where it is still a control a member can activate, and still a control
that must resolve. Hiding relocates the problem; it does not solve it.

**Destinations are addressable without the pointer.** The shortcuts reference maps a
numbered key combination to each rail destination, which the catalog reads as direct
evidence that destinations are addressable positionally as well as by pointer
(`00-product-overview.md` L142). A control reachable by two independent routes has two
ways to be dead. Both are closed by the same fix, and only by a fix at the
destination: neither route can be individually suppressed.

That last point has a corollary worth stating, because it is the kind of thing a build
discovers late. The capture that evidences the numbered bindings is **clipped by the
foot of the viewport**, so the catalog records that any binding below one destination
is not visible and is not recorded (`00-product-overview.md` L144). The bindings for
the deferred destinations are therefore partly unevidenced, and
`docs/decisions/keyboard-shortcuts.md` owns which are transcribed and which are
invented. It does not change this record's obligation: a binding that reaches a
placeholder must reach a surface that renders, whether the binding was read or chosen.

## What a placeholder is not

Five things, and each is a real temptation rather than a straw man. Four of them are
the alternatives this record rejected; the fifth is the shortcut a build reaches for
when the deadline is close.

- **Not a not-found response.** A deferred capability is not a missing resource, and
  reporting it as one misstates the cause. The corpus supports this rather than merely
  permitting it: the catalog records that **no frame shows a not-found surface for a
  missing resource**, and that the one observed error page states the cause is unknown
  rather than naming a missing resource and carries no status code at all
  (`21-states.md` L469). There is no evidenced presentation to borrow, and inventing
  one to describe a destination the product itself advertises in its own navigation
  would be a lie about the cause.
- **Not a blank region.** An empty region with no explanation is the outcome the empty
  state contract exists to prevent. The catalog's own framing is that an empty state is
  instructive, not blank (`21-states.md` L521).
- **Not a disabled rail item.** A disabled treatment carries a specific meaning that is
  false here. `docs/decisions/state-matrix.md` records the distinction: a treatment
  change says the viewer's own input is incomplete, while a gate that concerns standing
  or availability explains itself in words. Neither reading fits "this is scheduled for
  a later phase". And the rail's evidenced states include no disabled rendering
  (`00-product-overview.md` L319), so a build would be inventing a treatment in order
  to communicate the wrong thing with it.
- **Not a hidden rail item.** Rejected on the mechanics above: the overflow menu holds
  what the rail does not, so hiding moves the control rather than removing it.
- **Not a toast fired on activation.** A transient pill that reports the deferral and
  leaves the viewer exactly where they were is the most tempting shortcut of the five,
  because it is the least work. It fails on three counts. It does not route, so the gate
  is unmet on its own terms. The observed transient pill carries no undo, no dismissal
  affordance and no button of any kind (`21-states.md` L132), so it is the wrong
  vocabulary for a message a member may want to read twice — and it is the vocabulary of
  **failure**, which a deferral is not. And a control that reports rather than navigates
  is indistinguishable from one that failed.

## What a placeholder is

A **routed surface** that renders inside the persistent shell's content region,
composed from the empty-state contract, which:

1. **Names the destination** — functionally, for what the capability will do.
2. **States that it is not available yet**, plainly, without apology or euphemism.
3. **Names the phase that will deliver it**, so the surface answers _when_ and not
   merely _whether_. This is what makes a placeholder a plan rather than a shrug.
4. **Offers an onward action where an honest one exists**, and offers none where it
   does not. A control that cannot work is worse than no control, and the catalog states
   the principle directly for a neighbouring case: a permission failure names its remedy
   and **never offers a control that would not work**, which is why the observed denial
   band carries no action link at all (`21-states.md` L526). A placeholder with a button
   that leads nowhere would recreate the dead control this record exists to abolish, one
   level further in.
5. **Discloses nothing.** See [the no-disclosure rule](#a-placeholder-is-a-read-path-and-it-discloses-nothing) below.

It returns a **success** response. This is worth stating explicitly because it is the
single most likely implementation slip in the whole record: a placeholder is a
successful answer about an unavailable capability, not a failed answer about a present
one. `docs/decisions/http-api-contract.md` fixes the read at
`GET /api/v1/placeholders/{destination}`, non-mutating, unpaginated, and validated
against a **closed enumeration** of the sixteen segments below, so an unrecognised
value is a rejection rather than a lookup.

## Routing replaces only the content region

The shell is four regions in a fixed arrangement, and the catalog is explicit about
which of them navigation touches: the three columns are siblings, and **the content
region is the only one that changes when navigation occurs** (`00-product-overview.md`
L307). The shell is a layout that owns a routed content region rather than a page that
is navigated away from (`README.md` L198).

Two consequences bind every one of the sixteen surfaces.

**A placeholder never takes the whole viewport.** The navigation rail, the conversation
sidebar and the top bar all persist while a placeholder is displayed, exactly as they
persist across every other destination change. A placeholder that blanks the shell
would be the whole-surface presentation the state record prohibits outright, and it
would also remove the member's means of leaving — which is a peculiarly bad outcome for
a surface whose entire purpose is to send them somewhere else.

**A placeholder is never implemented as a full-page surface.** The unauthenticated page
shell exists for surfaces that render with no application shell at all — the sign-in and
sign-up path — and no placeholder belongs to it. A placeholder is a content-region
surface, which means it is mounted beneath the shell layout route and inherits the
shell's own responsive geometry rather than declaring any of its own.
`docs/decisions/responsive.md` owns that geometry and adds the one requirement this
record defers to it: each of the sixteen resolves at **every** supported width, 1280,
1024 and 768 alike.

## Placeholders are compositions, not components

The single-implementation rule — the first in the provided order — requires each
component contract to be implemented exactly once in the shared library, and prohibits
a local, partial or inlined equivalent in an application or feature directory even when
only one variant is needed. A bespoke placeholder component would be precisely that
prohibited equivalent: a second implementation of the empty-state contract, living in
the application, differing from the shared one in ways nobody would notice until they
diverged.

So there is **no placeholder component in this build.** There are sixteen route
modules, and each one is a composition: it selects a shape, passes an authored copy
key and an optional onward action, and renders `C-EMPTY-STATE` from the package barrel.
A route module holds no markup of its own beyond that invocation, and **no stylesheet
of its own at all**. If a placeholder appears to need a style, the need belongs to the
contract and is settled in the shared library, not patched at the route.

The four compositions the contract must express are specified in
`docs/decisions/state-matrix.md`, which is the authority on them; they are named here
only so each row below can point at one. No new variant is required, and that is a
finding rather than an assumption: the empty-state contract's observed variants already
include a **destination empty state inside a surface body** (`00-product-overview.md`
L340), which is structurally what every placeholder here is. Reusing an evidenced
composition rather than inventing a presentation is what the uncertainty rule asks for
where the corpus is silent about specifics — the smallest coherent behaviour consistent
with adjacent evidenced behaviour.

Should any placeholder ever genuinely need a composition the contract lacks, the
variant is added to the shared contract and its tests updated;
`docs/decisions/component-extensions.md` is where that judgement is recorded. Forking
is prohibited, and so is merging: a placeholder is not a zero-result region and must
not be built from one. The zero-result presentation reports that a **query** returned
nothing, carries a recovery instruction and a feedback line, and renders with no
illustration; a placeholder reports that a **capability** does not exist yet. Building
one from the other would tell a member their search was too narrow when in fact the
surface has not been written.

### One reconciliation, stated once rather than sixteen times

Three columns in the table below can look inconsistent, so the relationship between
them is fixed here.

- The **destination label** is authored, and functional: it names the capability by
  what it does. Several of the deferred destinations correspond to a third party's
  feature names, and none is labelled that way.
- The **route segment** is the value the closed API enumeration validates and the value
  a member sees in the address bar. It uses the catalog's own generic area vocabulary,
  which is ordinary descriptive English rather than any product's mark, so that the
  segment, the enumeration and the module name are one traceable identifier instead of
  three.
- The **module name** is fixed by the file plan and is not this record's to rename.

Where a label and a segment differ, the label is the sentence a person reads and the
segment is the identifier a machine matches. Neither carries a product name.

## Every word is authored

The identity rule — the fifth in the provided order — prohibits transcribing another
company's product copy, including strings that are legible in a frame. It applies to
placeholders with unusual force, because a placeholder is almost entirely copy: strip
the illustration and the action and there is nothing left but sentences.

- **Every string lives in `packages/shared/src/copy/en.ts`.** No route module contains a
  string literal a member can read. One file holds all of it, which gives the identity
  guard a single high-value file to police and gives a reviewer one place to check.
- **Destinations are named functionally**, for what the capability does.
- **Third-party applications are named functionally too** wherever an example is needed
  — the built-in assistant app, a cloud-drive app, a poll app, a standup app, a calendar
  app, a conferencing app — and never by a vendor's name.
- **Plan tiers are referred to by placeholder**, including where the corpus prints a
  tier name. No tier name, price, currency amount or countdown value appears in a
  placeholder string, and none appears in this record.
- **No sample entity name is reproduced.** The channel, person and role names visible in
  the corpus illustrate shape only.

The copy-intent column below states what each surface must communicate. It is
deliberately not draft product prose, and it should not be pasted into the copy module:
an intent written as a specification and a sentence written to be read are different
artifacts, and treating the first as the second is how a placeholder ends up sounding
like a bug report.

## A placeholder is a read path, and it discloses nothing

The authorization rule — the second in the provided order — makes every read path
subject to workspace isolation and requires each projection to be authorized
independently: counts, search results, link previews and resolution, member lists,
facepiles, autocomplete suggestions and notifications.

A placeholder route is a read path. It is therefore bound by that rule, and the way it
satisfies it is by having nothing to disclose:

- **No counts.** Not a channel count, a member count, an unread count, a file count, an
  installed-app count or a pending-invitation count. A count is a projection, and a
  count rendered on a surface that exists to say "not yet" would be a projection nobody
  thought to authorize.
- **No names.** No conversation, person, app, workspace or file name.
- **No membership or existence hints.** Nothing on a placeholder may vary in a way that
  reveals whether a private resource exists.

This is why placeholders are safe, and it is worth saying plainly rather than leaving
implicit: a placeholder is **deliberately information-free**, so it is trivially
compliant with the projection requirement. There is no query to isolate, no row to
filter and no projection to authorize.
`docs/decisions/http-api-contract.md` records the same conclusion from the endpoint
side — the response carries no workspace row, no count and no name, so there is nothing
to isolate.

Two guards keep that true as the build changes. The response shape is **static per
destination**, so it cannot begin to carry workspace data without a deliberate contract
change that a reviewer will see. And the route segment is validated against a closed
enumeration rather than reflected, because an open-ended segment echoed into a response
is the shape a content-injection defect takes.

One thing the no-disclosure rule does **not** exempt: the route still requires an
authenticated session, because it renders inside the authenticated shell. Requiring
nothing further is a deliberate decision and not an oversight — there is no target
object for a policy to evaluate, and inventing one would be authorization theatre.

## Accessibility obligations

A placeholder is a real route, so it carries the same obligations as any other surface.
The catalog specifies no accessibility behaviour anywhere, so all of this is authored.

- **Focus moves predictably on navigation.** Arriving at a placeholder moves focus to
  the surface's own heading container rather than leaving it on the rail item that was
  activated, so a keyboard or screen-reader user is told the content region changed. The
  persistent regions are not re-announced, because they did not change.
- **The heading is a real heading.** The placeholder's title is a heading element in the
  document outline at the level the content region expects, not a styled paragraph. A
  surface whose entire content is an explanation is exactly the surface where an outline
  matters most.
- **The rail item shows its selected state.** A placeholder must still read as "you are
  here". The rail's evidenced active rendering is a filled icon and label
  (`00-product-overview.md` L319), and the current destination gets it whether its
  surface is built or deferred — together with the programmatic current-state attribute
  that conveys the same fact to assistive technology.
- **Reachability is width-independent.** Both evidenced routes to a destination — the
  overflow menu and the numbered binding — work identically at every supported width, as
  `docs/decisions/responsive.md` records.
- **No motion is required to read one.** A placeholder has no animated entrance to
  suppress under a reduced-motion preference, which is the easiest way to satisfy that
  preference and the reason it is worth choosing.

## Choosing the shape: three used, one prohibited

The shape is chosen **per destination**, deliberately, and not once for all sixteen.
That is not a stylistic preference either — the catalog names the uniform choice as a
failure mode by name: a build that gives every empty region an illustration and a button
cannot reproduce two of the four compositions (`21-states.md` L521), and the composition
is a property of the region rather than a global default (`21-states.md` L560). Sixteen
identical placeholders would fail that test sixteen times over.

| Shape                         | Used for                                                                                                                                 | Count |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Illustrated, with an action   | A destination for which a **shipped** surface genuinely substitutes for part of the capability, so there is somewhere to send the member | **3** |
| Illustrated, no action        | A destination with no shipped substitute at all, so the surface explains and offers no control                                           | **9** |
| Text only                     | A thin administrative or support destination, where an illustration would overstate what the surface will be                             | **4** |
| Illustrated and instructional | **Nothing. Prohibited for placeholders** — see below                                                                                     | **0** |

**Why the instructional composition is prohibited, stated explicitly because it is a
tempting misuse.** That composition exists to _teach a workflow that fills a region_: it
carries a rule and then a numbered list walking a member through steps they have not
taken before. A placeholder has no workflow to teach. There is nothing a member can do
to fill the region, and a numbered list on such a surface would either enumerate steps
that do not work — which is a dead control wearing a different hat — or enumerate steps
belonging to some other capability, which is worse, because it would be instruction that
does not apply. The composition remains implemented in the shared contract for the
surfaces that legitimately need it; it is simply never selected by one of these sixteen.

Two further shape decisions are recorded so they are not re-litigated per row.

**The illustration slot, the action row and the inline link are independently
optional.** `docs/decisions/state-matrix.md` records that property, and it is what lets
"illustrated, no action" render with its inline-link slot **empty** rather than forcing a
link nobody can honestly write. Nine of the sixteen use it that way: their capability has
no shipped relative, so there is no explanatory destination to link, and inventing one
would be the same failure as inventing an action. Across all sixteen, **three carry an
action control, exactly one carries an inline link, and twelve carry neither** — a
distribution that is itself the evidence the shape was chosen rather than defaulted.

**No placeholder carries a feedback line.** The text-only composition permits one, and it
is declined: a feedback line invites a report about the surface, and the surface is
already reporting itself. Soliciting feedback on a known, scheduled absence spends a
member's goodwill to learn nothing.

## The four options, considered once

Every one of the sixteen was resolved against the same four options. The uncertainty
rule — the fourth in the provided order — requires the options considered, the choice and
the rationale to be recorded, and the standing reasons are identical across all sixteen,
so they are written once here rather than repeated sixteen times. What is genuinely
per-destination is recorded in the [rationale table](#why-the-defined-surface-wins-at-each-destination)
below, and no row there restates what is in this table.

| Option                            | Verdict    | Standing reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A defined placeholder surface** | **Chosen** | It is the only option that satisfies the gate as written — the destination is present **and routes** (`README.md` L481) — and the only one that can state _which phase_ owns the capability. It is also the only one that is working, shipped functionality rather than a stub: it renders, it is tested, and it is reachable by every route to the destination                                                                                                                  |
| A disabled rail item              | Rejected   | It does not route, so the gate is unmet on its own terms. It also communicates the wrong thing: `docs/decisions/state-matrix.md` keeps a treatment change (the viewer's own input is incomplete) apart from an explanation in words (a question of standing or availability), and a deferral is neither of those. The rail's evidenced states carry no disabled rendering (`00-product-overview.md` L319), so a build would be inventing a treatment in order to mislead with it |
| A hidden rail item                | Rejected   | It does not remove the control. The rail's overflow menu holds exactly the destinations the rail is not showing (`00-product-overview.md` L193), so a hidden destination reappears there — and remains reachable by its numbered binding besides (L142). Hiding relocates the defect into a menu where it is harder to notice. It also edits a contract: the varying destination set is part of `C-RAIL` (L319)                                                                  |
| A not-found response              | Rejected   | It misstates the cause, and there is no evidenced presentation to borrow: the catalog records that **no frame shows a not-found surface for a missing resource**, and that the one observed error page names an unknown cause and carries no status code (`21-states.md` L469). A deferred capability is not a missing resource. Reporting an error for an address the product advertises in its own navigation would make the product wrong about itself                        |

The choice is therefore uniform even though the presentation is not, and the reason it is
uniform is worth naming: the three rejected options are all attempts to make the control
_less visible_, and the gate is not about visibility. It is about what happens when
someone activates it.

## The sixteen destinations

Areas are cited by their two-digit catalog number. `docs/decisions/roadmap.md` owns the
phase inventory — which areas each phase covers and why each is deferred — and this
record points at it rather than restating criteria counts.

| #   | Destination                | Route                   | Phase that replaces it | Empty shape used            | What the copy communicates                                                                                                                                                                         | Onward action                                                                             |
| --- | -------------------------- | ----------------------- | ---------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Reply threads              | `/threads`              | Phase 2 · area 04      | Illustrated, with an action | That replies to a message will gather here as a conversation of their own; that the capability arrives in the next phase; and that messages themselves are readable and writable today             | Action: open the channel browser, where the messages that will carry replies already live |
| 2   | Direct messages            | `/direct-messages`      | Phase 2 · area 05      | Illustrated, with an action | That conversations addressed to a person or a small group, outside any channel, arrive in the next phase; and that a channel is where conversation happens today                                   | Action: open the channel browser                                                          |
| 3   | Search results             | `/search`               | Phase 2 · area 09      | Illustrated, with an action | That the search field in the top bar is live and the **result surface** is what is deferred — the distinction is the whole point of this surface; and which phase delivers results and filters     | Action: open the channel browser, which is how a conversation is found today              |
| 4   | Live voice and video rooms | `/huddles`              | Phase 3 · area 06      | Illustrated, no action      | That a live voice-and-video session started from a conversation is a later phase; and — explicitly — that nothing is wrong with the member's device, microphone or browser permissions             | None. No shipped surface substitutes for a live session, so no control is offered         |
| 5   | Collaborative documents    | `/canvases`             | Phase 3 · area 07      | Illustrated, no action      | That a shared editable document attachable to a conversation is a later phase; and that document creation is gated by plan as well as unbuilt, so the entry point's badge is not a rendering error | None                                                                                      |
| 6   | Structured record lists    | `/lists`                | Phase 3 · area 08      | Illustrated, no action      | That tracked records with typed fields, saved views and grouping are a later phase                                                                                                                 | None                                                                                      |
| 7   | Automation builder         | `/workflow-builder`     | Phase 3 · area 10      | Illustrated, no action      | That building an automation — a trigger and a sequence of steps — is a later phase; and that the destination is reachable from two places, both of which arrive here deliberately                  | None                                                                                      |
| 8   | Installed apps             | `/apps`                 | Phase 4a · area 11     | Illustrated, no action      | That browsing, installing and configuring apps is a later phase; and that an app-authored message already renders in a conversation under the app's own identity, so app output is not absent      | None                                                                                      |
| 9   | Activity feed              | `/activity`             | Phase 4a · area 12     | Illustrated, no action      | That a single aggregated feed of mentions, reactions and replies is a later phase; and that unread state is already computed per member and marked in the sidebar beside this surface              | None                                                                                      |
| 10  | People directory           | `/people`               | Phase 4a · area 13     | Illustrated, no action      | That a browsable directory of members, user groups and profiles is a later phase; and that presence already renders beside a person's avatar in any conversation                                   | None                                                                                      |
| 11  | Preferences                | `/preferences`          | Phase 4a · area 14     | Text only                   | That the settings **surface** is a later phase, while stating carefully that preferences are already stored and honoured — a dismissed banner stays dismissed today                                | None                                                                                      |
| 12  | Files and media            | `/files`                | Phase 4a · area 16     | Illustrated, no action      | That a cross-conversation view of files with filters and grouping is a later phase; and that a file shared into a conversation stays reachable in that conversation                                | None                                                                                      |
| 13  | External connections       | `/external-connections` | Phase 4a · area 22     | Illustrated, no action      | That working with people from another organisation is a later phase; and that the acceptance window governing such an invitation is already a configured, enforced value in this build             | None                                                                                      |
| 14  | Administration console     | `/admin-console`        | Phase 4a · area 15     | Text only                   | That workspace administration is a later phase **and a separate application** rather than a screen inside this one, so a member does not wait for it to appear in the shell                        | None. Deliberately no link: the separate property has no address in this build            |
| 15  | Plan and entitlements      | `/plan`                 | Phase 4b · area 18     | Text only                   | That plan and entitlement management is not built, that no purchase path exists, and that the gate which sent the member here is reporting a real limit rather than malfunctioning                 | None, deliberately. Any control here would imply a purchase path that does not exist      |
| 16  | Help and support           | `/help`                 | Phase 4b · area 20     | Text only                   | That help articles, support requests and community surfaces are not built; and that the keyboard-shortcut reference — a different surface — **is** available                                       | Inline link only: the shortcuts reference, which ships. No action control                 |

**A note the two Phase 4b rows must honour.** `docs/decisions/roadmap.md` recommends
Phase 4b for **indefinite deferral** rather than for scheduling. So the copy on the plan
and help placeholders names the phase that owns the capability without promising a date
or an ordering the roadmap explicitly declines to promise. This is the one place where
naming the phase is not enough on its own: for these two, "a later phase" is honest and
"soon" would not be.

**On the route segments.** The sixteen segments above are the closed enumeration the read
endpoint validates against, and they are also the shell's own paths, so a deep link to a
placeholder works and survives a reload like any other destination. Segments 4, 5 and 7
reuse the catalog's generic area vocabulary while their labels are authored functionally —
the reconciliation is [above](#one-reconciliation-stated-once-rather-than-sixteen-times)
and applies to those three rows.

### Why the defined surface wins at each destination

The standing reasons are in [the four options](#the-four-options-considered-once) and are
not repeated. What follows is what is specific to each destination — the reason a reviewer
could not have derived from the general argument.

| #   | Destination                | Why the defined surface wins **here** specifically                                                                                                                                                                                                                                                 |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Reply threads              | The message row **ships thread-reply-ready**, so the capability is visibly half-present: a member can see rows that are built to carry replies. Hiding the destination would make the product contradict its own component                                                                         |
| 2   | Direct messages            | A not-found here would read as "this workspace has no people to write to", which is false and is also a statement about membership — the one subject a placeholder must never make a statement about                                                                                               |
| 3   | Search results             | It is the only one of the sixteen reached from a **live shell control**. An error response would make a working field look broken, and the field is on every surface, so the damage would follow the member everywhere                                                                             |
| 4   | Live voice and video rooms | Device-permission denial has its own evidenced presentation, and it is a different one. A disabled control here would be read as a microphone or camera problem — a diagnosis the member would then try to fix, at some length, in the wrong place                                                 |
| 5   | Collaborative documents    | The creation entry for this capability is **the only entry observed carrying an entitlement badge** (`00-product-overview.md` L60), so the product already renders it as _gated_ rather than absent. A hidden destination would contradict a badge that ships                                      |
| 6   | Structured record lists    | It is evidenced **on the rail in some captures and in the overflow menu in others** (`00-product-overview.md` L319, L191), which is precisely the varying set the contract fixes. Suppressing it would not be a deferral decision; it would be an edit to `C-RAIL`                                 |
| 7   | Automation builder         | It is reachable from two distinct places — the apps surface and the workspace menu. A per-entry fix would leave the other path unresolved, and only a surface at the destination closes both at once                                                                                               |
| 8   | Installed apps             | App-authored messages render in conversations today, so a member can see app output while having nowhere to manage apps. That asymmetry is confusing on its own; the placeholder is the only thing that explains it                                                                                |
| 9   | Activity feed              | The per-member read cursor and the notification projection's authorization already exist behind this destination, so the mechanism is live and only the aggregate view is missing. Reporting an error would misdescribe a working mechanism as a broken one                                        |
| 10  | People directory           | Presence is bus-backed and rendering today. A disabled destination would suggest presence had been switched off, which is both false and, since presence is visible two columns away, immediately self-contradicting                                                                               |
| 11  | Preferences                | Banner dismissal already writes to the member's own preference record, so a surface claiming preferences are unavailable would be **untrue about something the member can verify in one action** — dismiss a banner, reload, see it stay dismissed                                                 |
| 12  | Files and media            | A file already shared into a conversation is reachable there. A not-found on this destination could reasonably be read as the files themselves being gone, which is the worst available misreading of the three rejected options                                                                   |
| 13  | External connections       | The acceptance window for an external invitation is a configured and enforced value in this build, so part of the mechanism is real. An error would deny a behaviour that is already running                                                                                                       |
| 14  | Administration console     | The catalog specifies this as a **separate application** reached by an external link, with its own top bar and its own navigation (`README.md` L199). There is no deep route to disable and nothing in the shell to hide, so a defined surface is the only option that can even express what it is |
| 15  | Plan and entitlements      | It is the **target of a gate that renders today**. Every badge, trial item and upsell strip in the shipped product points here, so a not-found would convert every rendered gate into a broken control — the single outcome the gate exists to avoid                                               |
| 16  | Help and support           | The help control appears in the same relative position on **every** surface, which is an accessibility criterion rather than a layout habit. Hiding or disabling it would break that consistency on every screen at once, not merely on this one                                                   |

## The five destinations that are not purely deferred

Eleven of the sixteen are straightforward: the capability does not exist, and the surface
says so. Five are not, and each is a place where a carelessly written sentence would say
something false. They are called out because the falsehood in each case is _plausible_ —
it is what a writer would naturally produce without knowing what already ships.

### Search — the entry ships, only the results are deferred

The search entry is part of the **shell**, not part of the search area: it opens search
from anywhere and it renders the active query (`00-product-overview.md` L323), and it is
delivered in this phase for exactly that reason. What is deferred is the result surface —
the result-type tabs and their counts, the filter mechanisms, the sorting and the
zero-result presentation — which belongs to area 09.

Two consequences follow, and both are copy obligations rather than layout ones.

**This placeholder is reached from a live control.** It is the only one of the sixteen
that is, which makes it the strongest case against an error response anywhere in this
record: an error would make a working field on every surface look broken. It also means
this placeholder will be arrived at _by accident_ more often than the others — a member
types into a field that visibly works and lands here — so the surface must resolve that
surprise in its first sentence.

**The copy must not imply search is absent.** It says that the field is live and the
result surface is what is not built yet. A sentence reading "search is not available"
would be false about a control the member just used successfully, and would be the most
damaging single sentence in the whole set of sixteen. The field itself is never disabled
to make this easier: disabling the shell's own control to avoid writing a careful sentence
would trade a copy problem for a dead control.

### Plan — the target of a live gate

Billing and payments are out of scope for this run entirely, and
`docs/decisions/security-contracts.md` records the payment boundary as documented but not
implemented for that reason. What ships is the gate that points at the absence: the
upgrade-gate contract renders in full — badge, trial item, offer block and upsell strip —
and its action resolves **here** rather than to a purchase flow.

That makes this placeholder structurally different from the other fifteen.

**It is reached more often than any of them.** The other fifteen are reached by choosing a
destination; this one is reached by every gated affordance in the product, from several
surfaces, often without the member having decided to go anywhere. It therefore gets the
most careful copy of the sixteen, and it is the one whose rendering is exercised most in
the end-to-end suite.

**It must not imply a purchase path exists.** No pricing, no comparison, no tier name, no
currency amount, no countdown value and — decisively — **no action control of any kind**.
An action here would be the definitive dead control: a button that says buy and cannot.
`docs/decisions/state-matrix.md` records the same prohibition from the state side, that no
countdown, date, price or plan-tier name observed in the corpus may appear as a literal.
Tiers are referred to **by placeholder**, here and in every shipped surface, including
where the corpus prints a tier name.

**It confirms the gate rather than apologising for it.** A member arriving here has just
been told a capability is limited by plan. The surface's job is to confirm that the limit
is real and that management of it is not built — not to leave them wondering whether the
badge that sent them was a bug. This is why the shape is text-only: an illustration and a
button on a billing-adjacent surface reads as an upgrade call to action, which would be
precisely the false promise the rest of this section forbids.

### Help — a fixed position, and a neighbouring surface that is not deferred

The help control sits at the far right of the top bar (`00-product-overview.md` L302), and
its position is not merely a layout fact. Because the top bar persists across every
navigation, the control appears in the **same relative position on every surface** — and
that consistency is an accessibility criterion in its own right, asserted explicitly in
the pipeline because automated scanning cannot judge it. Neither the control nor its
position changes because the destination behind it is a placeholder. Hiding it on some
surfaces and not others would fail that criterion product-wide.

**The keyboard-shortcut reference is a different surface and is not deferred.** This is
the conflation this section exists to prevent. The shortcuts reference is a docked pane
listing action labels against key-combination chips, grouped under headings; it is reached
by its own control and by its own binding, and it **ships in this phase**. It is not
reached through the help destination, and the help placeholder is not a route to it.
`docs/decisions/keyboard-shortcuts.md` owns the bindings, the authored labels and the
record of which bindings were transcribed and which were invented — including the ones the
clipped capture could not evidence (`00-product-overview.md` L144).

The two are kept apart deliberately, and the seam is visible in this record's own choices:
the help placeholder's single inline link points **at** the shortcuts reference precisely
so a member who arrived looking for keyboard help is not turned away from something that
exists. That is also why illustrated-with-action was considered for this row and rejected —
an action control would present the shortcuts pane as _the_ content of help, and help is
much more than that in every later phase.

### Preferences — the storage is live, only the editor is deferred

Per-member preferences are a **relation keyed by the member**, never a column on a shared
record, and one of them is already written in this phase: dismissing a banner records the
dismissal on the dismissing member's own preference record, and it is honoured on the next
load. `docs/decisions/roadmap.md` records this among the mechanisms that already exist
behind a deferred destination.

So the copy is precise about which half is missing. It says the settings **surface** is a
later phase; it does **not** say preferences are unavailable, are not saved, or will not
persist. The distinction is checkable by a member in about four seconds — dismiss a banner,
reload, watch it stay dismissed — so a surface claiming otherwise would be caught
immediately, and would undermine the other fifteen placeholders by making the whole set
look like guesswork.

One boundary to keep: the storage existing is **not** a claim that any acceptance criterion
of area 14 is satisfied. Satisfaction is claimed in the traceability manifest and nowhere
else, and only by a passing test.

### Activity and people — live mechanisms behind unbuilt surfaces

These two share a shape of problem: the machinery is running and the presentation is not.

**Activity.** Unread state is computed per member from the read cursor rather than stored
as a counter, and it is already rendered — the sidebar marks unread conversations with a
count beside this very surface. The notification projection is also already authorized
independently on the read side. So the copy says the **aggregated feed** is a later phase.
It does not say a member cannot tell what is new, because they can, in the column
immediately to the left.

**People.** Presence is bus-backed with a heartbeat and coalesced fan-out, and the presence
indicator renders it today on avatars throughout the product. So the copy says the
**directory and profile surfaces** are a later phase. It does not say presence is
unavailable, and it does not imply the member's own presence is not being published.

For both, the copy is held to **what a member can actually do today**, which in both cases
is: read the live signal where it already appears, and nothing more. Neither surface offers
an action, because pointing at a persistent region that is already on screen is a statement
rather than a control, and dressing a statement as a button is how a build accumulates
controls that do nothing. Neither surface reports a count, a name or a total, for the
reasons in [the no-disclosure rule](#a-placeholder-is-a-read-path-and-it-discloses-nothing) —
and it is worth noting that an activity feed is exactly the sort of surface where a
well-meaning count would leak a private conversation's existence.

## How this is verified

A prohibition that is only written down is a prohibition that decays. "A dead control is a
defect" is a sentence; the assertions below are the same statement in a form that fails a
pipeline. The uncertainty rule — the fourth in the provided order — is explicit that no
acceptance criterion is marked satisfied without a passing test behind it, and this record
claims nothing about satisfaction: it states what must be asserted, and
`docs/decisions/ac-manifest.md` is where a criterion is tied to the test that satisfies it.

| #   | Assertion                                                                                                                                                                                                                                                           | Where it runs                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| V1  | **Every** rail destination routes to a surface that renders — content present, **no console error**, and **no blank region**. Iterated over the destination set rather than written out per destination, so a new destination cannot be added without being covered | The shell end-to-end specification               |
| V2  | No placeholder route returns an error status, and none renders the page-level failure surface                                                                                                                                                                       | The shell end-to-end specification               |
| V3  | The rail item for a placeholder destination shows its **selected state** while that placeholder is displayed — the evidenced filled rendering and its programmatic equivalent                                                                                       | The shell end-to-end specification               |
| V4  | The accessibility scan covers **every** placeholder route, at the current standard's AA tags                                                                                                                                                                        | The accessibility specification                  |
| V5  | No placeholder response or rendered surface contains a count, a name or any workspace-derived value                                                                                                                                                                 | The projection integration tests, and V1's sweep |
| V6  | The `destination` segment is validated against the closed sixteen-value enumeration: an unrecognised value is rejected rather than looked up or reflected                                                                                                           | The API integration tests                        |
| V7  | Each of the sixteen resolves at 1280, 1024 and 768 pixels of width                                                                                                                                                                                                  | The responsive end-to-end coverage               |
| V8  | No route module under `apps/web/src/routes/placeholders/` declares a stylesheet, and none imports below the component library's barrel                                                                                                                              | The lint boundary rule, in the pipeline          |

**V1 is the mechanical form of the dead-control prohibition, and it is the one assertion
in this record that must not be weakened.** It is written as a sweep over the destination
set — every entry the rail and its overflow menu expose — rather than as sixteen
independent tests naming sixteen paths. The difference matters: a list of sixteen paths
passes happily on the day a seventeenth destination is added and left unrouted, which is
precisely the failure the gate exists to catch. A sweep fails that day, loudly. The two
routes to a destination are both exercised, because a control reachable two ways can be
dead either way.

Two details of V1 are worth stating because they are easy to under-specify. "No blank
region" means the content region must contain the placeholder's own heading, not merely
that the document is non-empty — a surface that renders the shell and nothing inside it
would pass a naive check while being exactly the blank region this record forbids. And "no
console error" is asserted rather than assumed: a route that renders correctly while
throwing on the way is a defect that a screenshot cannot see.

**V2 exists because the failure it guards against is invisible in a screenshot.** A
placeholder that renders perfectly while answering with an error status looks right and is
wrong: caches, crawlers, monitoring and the browser's own history all read the status
rather than the pixels. So the status is asserted separately from the rendering, and the
page-level failure surface is asserted **absent** — that surface belongs to a genuine
fault, and reusing it here would erase the distinction between a deferral and a breakage
that this record was written to preserve.

**V5 is the assertion this record would most like to be redundant.** A placeholder has
nothing to disclose by construction, so the test should be unable to fail. It is written
anyway, because "by construction" is a property of today's implementation and not of
tomorrow's: the first well-meaning addition of a helpful count to an otherwise empty
surface is exactly how a projection leak arrives, and it will arrive from a contributor who
has not read this record.

## Replacement discipline

When a phase lands, its placeholders are **deleted**.

Not disabled, not left behind a feature flag, not kept as a fallback branch, and not
retained "for reference". Three specific outcomes are prohibited, because each is a way the
sixteen could quietly become permanent:

- **No flag.** A placeholder retained behind a flag is a second implementation of the
  destination, and a build that carries two implementations eventually ships the wrong one.
  The route module is removed and its route points at the real surface.
- **No orphaned strings.** The destination's entries in `packages/shared/src/copy/en.ts` go
  with it, and its segment leaves the closed enumeration the read endpoint validates. A
  placeholder string surviving its surface is a sentence waiting to be rendered somewhere it
  no longer makes sense.
- **No stale row.** **This record's row is updated in the same change** that removes the
  surface. A row describing a placeholder that no longer exists is worse than no row: the
  next reader trusts it, and this record is cited by five siblings that would inherit the
  error.

The count in the metadata table at the head of this record is therefore expected to fall
over the life of the project, and a change that removes a placeholder without changing that
count has not finished. When the last one goes, the record stays as the account of why the
sixteen existed — recording history is the point of a decision record, and an empty table is
a truthful one.

Two conditions do **not** justify keeping a placeholder: a phase that landed partially, and
a capability that shipped in a reduced form. In both cases the real surface exists and owns
its own empty and loading presentations, which
`docs/decisions/state-matrix.md` specifies. A partially built surface reporting its own
state is right; a placeholder standing in front of a surface that exists is a lie about
which of them is real.

## Companion records

Each is pointed at rather than restated. A second copy of a decision is a second thing to
keep true, and the two eventually differ.

| Record                                   | What it owns where the two records touch                                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/decisions/roadmap.md`              | The phase inventory, the reason each area is deferred, and the recommendation of indefinite deferral for the fourth phase's second group             |
| `docs/decisions/state-matrix.md`         | The four empty compositions themselves, the prohibition on whole-surface presentations, and the gating vocabulary a placeholder must not borrow from |
| `docs/decisions/component-extensions.md` | Whether a structure is a new contract or a new variant, if a placeholder ever needs a composition the empty-state contract lacks                     |
| `docs/decisions/keyboard-shortcuts.md`   | The numbered destination bindings, which were transcribed and which were invented, including those the clipped capture could not evidence            |
| `docs/decisions/responsive.md`           | The breakpoints and per-region geometry a placeholder inherits; it adds only that each of the sixteen resolves at every supported width              |
| `docs/decisions/http-api-contract.md`    | The read endpoint, its non-mutating shape and the closed-enumeration validation of the destination segment                                           |
| `docs/decisions/security-contracts.md`   | The payment boundary, recorded as documented and not implemented, which is why the plan destination is a placeholder at all                          |
| `docs/decisions/ac-manifest.md`          | Which acceptance criterion each assertion above satisfies. Satisfaction is claimed there and nowhere else, and only by a passing test                |

**What consumes this record.** The sixteen route modules under
`apps/web/src/routes/placeholders/`; the destination strings in
`packages/shared/src/copy/en.ts`; the shell and accessibility end-to-end specifications
that carry the assertions above; and the placeholder family of the versioned read API.

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **No frame was opened.** Not one, and none needed to be. Every question this record asks
  is about routing, scope and copy obligation, and none of the three is visible in a
  screenshot. Every observation attributed to the corpus above was resolved from catalog
  prose, which is what the corpus-handling rule asks for.
- **Frames are cited by number only** where cited at all, and no filename appears — nor does
  the catalog's percent-encoded citation form. Both embed a third-party product name.
- **No third-party product name appears** in the text, the headings, the route segments, the
  link labels or any anchor. Deferred areas are cited by their two-digit catalog number, and
  every destination is labelled for what the capability does.
- **Rules are cited by subject and position, never by identifier**, because each of the five
  identifiers embeds the prohibited name. Position alone would be unsafe, since the
  identifiers are permuted against the requirement labels; position with subject is not.
- **Nothing is transcribed.** No heading, sentence, label or button caption from any frame
  appears here. This is a live hazard rather than a theoretical one in this particular
  record: the catalog transcribes the rail overflow menu's own destination descriptions in
  quotation marks (`00-product-overview.md` L191), and every one of the sixteen copy intents
  above is authored instead of taken from there.
- **Copy is specified as intent, never as prose.** The copy column states what a surface
  must communicate. It is not draft wording and must not be pasted into the copy module.
- **Plan tiers by placeholder only.** No tier name, price, currency amount or countdown
  value appears anywhere above, including where the corpus prints one.
- **No sample entity name is reproduced.** The channel, person and role names visible in the
  corpus illustrate shape only; none appears here, and none reaches a fixture or a seed.
- **No colour value appears.** Not one. Where a treatment is unavoidable, it is named
  semantically; `docs/decisions/theme-and-color.md` is where a semantic role resolves onto a
  token, and where the palette's literals are declared.
- **No fenced diagram.** The committed site configuration bundles a superfences extension
  that consumes fenced blocks before the diagram plugin can claim them, so a diagram fence
  is emitted as a code block and no diagram is produced (`README.md` L905, L907). This record is
  tables and prose throughout, which is why its structure survives publication.
- **Absence is recorded as absence.** Where the corpus shows nothing — a not-found
  presentation, a disabled rail rendering, a hover treatment for a placeholder — the record
  says so and names the marker, rather than filling the gap silently and leaving a reader
  unable to tell an observation from a choice.
- **Options, choice and rationale are recorded for every destination**, as the uncertainty
  rule requires: the four options and their standing verdicts in one table, and the
  destination-specific reason in another, so that neither is boilerplate.
- **Nothing here is claimed satisfied.** This record specifies obligations and assertions
  only. A criterion becomes satisfied in `docs/decisions/ac-manifest.md`, and only when a
  test that cites it passes.
