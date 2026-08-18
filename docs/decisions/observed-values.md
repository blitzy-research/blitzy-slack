# Observed values and the defaults chosen

A number read from a single frame is evidence that a mechanism exists. It is not
evidence of how that mechanism is configured. This record is where each such
reading is turned into a named configuration default with a written rationale, so
that the build ships the timer, window, threshold or limit the reading belongs
to — and ships it without mistaking the reading for the setting.

The corpus is a single session captured once. It can show that a link is
time-bounded; it cannot show what the bound was set to, because what it renders
may be the whole of a duration or whatever was left of one. Treating every such
figure as a hypothesis about a default, and writing down which of the two it
looks like, is the only honest way to get from a screenshot to a configuration
file.

**How this file cites.** A document citation names a file under
`docs/workflows/` together with its line number, so `README.md` below is the
catalog index in that directory and not the one at the repository root. A frame
is cited by number alone. Every fact recorded here was resolved from catalog
prose; no frame was opened to write this record.

## Invariant or configurable default

Two kinds of value come out of the specification, and only one of them belongs
here.

An **invariant** is a rule the product enforces regardless of configuration.
Loosening it would change what the product _is_, so no environment may weaken
it. Invariants are compile-time constants in
`packages/shared/src/config/constants.ts`, and they are deliberately not
environment-overridable.

A **configurable default** is a duration, window, threshold or limit whose
_mechanism_ is required but whose _value_ is a choice. The mechanism is not
optional and is never deferred for want of a confident number; the number is
declared once, documented, and may be overridden per deployment. Configurable
defaults live in `packages/shared/src/config/env.ts` and are listed in
`.env.example` with the default this project chose.

Only configurable defaults are recorded below. The invariants are named in
[Excluded: the invariants](#excluded-the-invariants) so that a reader cannot
mistake their absence for an omission.

## Records store an absolute timestamp

Every record persists an **absolute timestamp**, never a duration. A duration
stored on a record is a second copy of the configuration, and a second copy goes
stale the moment the first one changes. Storing the resolved moment instead means
the configured default can change without invalidating a single record already
written: an invitation issued last week keeps the deadline it was issued with,
and next month's setting governs next month's invitations.

The corollary is the whole of this file's purpose, in the build's own terms:
**build the timer, configure the duration.** Uncertainty about a number is never
a reason to omit the mechanism that number parameterises. Every value below is
enforced server-side, at the point of execution, against the record that carries
the resolved timestamp — never in the client, and never by a literal written at
a call site.

Two consequences follow and are treated as settled rather than as choices:

- A resolved timestamp is **immutable in both directions**. Lengthening a
  configured default never extends something already issued, and shortening it
  never cuts something short. Where outstanding access must end sooner, the
  record is explicitly revoked or reissued as an authorized, audited operation
  rather than having a date rewritten underneath a credential its holder already
  has. The catalog settles this once for the invitation family and this record
  follows it (`README.md` L401 and the paragraph after L407).
- A rendered figure is **computed from the stored timestamp**, never printed from
  a constant. A surface that prints the configured duration would drift from the
  record the first time the default changed
  (`01-onboarding-and-auth.md` L907).

## Three views of one truth

Three artifacts describe the same set of values and **must move together**:

| Artifact                            | What it holds                                              |
| ----------------------------------- | ---------------------------------------------------------- |
| `docs/decisions/observed-values.md` | The evidence, the reading, the choice and the reasoning    |
| `.env.example`                      | The variable, its documented default, and a short comment  |
| `packages/shared/src/config/env.ts` | The schema, the parsed value, and the export consumers use |

Adding a configurable default without its row here and its entry in the
environment template is a rule violation, not an oversight. The table below is
therefore closed at exactly the five values the template carries: a sixth row
here with no template entry, or a sixth variable there with no row here, is a
defect in this record.

## Excluded: the invariants

These values were observed in the specification and are **not** in the table,
because each is a rule rather than a setting. All four are compile-time
constants in `packages/shared/src/config/constants.ts`, deliberately beyond the
reach of an environment variable.

| Invariant                                                                                                        | Why it is not a configurable default                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Channel-name rule — lower case, no spaces, no periods, a ceiling of 80 characters, with a live remaining counter | A naming grammar that links, mentions and resolution all depend on; a deployment that relaxed it would hold names another deployment could not resolve (`02-channels.md` L982 · frames 69, 97)     |
| Public visibility pre-selected on the second step of the channel-creation wizard                                 | The step's arriving state is part of the flow's contract; an environment that flipped it would silently change which conversations are discoverable by default (`02-channels.md` L984 · frame 60)  |
| Content-only-required on the snippet modal                                                                       | Which field gates the primary action is a validation contract; making it overridable would let one deployment accept an empty snippet (`03-messaging-and-composer.md` L681 · frames 144, 145, 148) |
| Argon2id parameters — memory, time cost and degree of parallelism                                                | A verifier parameter is a security floor, and an override is a downgrade path; the parameters are stored beside each hash instead, so re-hashing on next authentication stays available            |

The prohibition on a hardcoded literal at a point of use and the fact that
several observed values are genuinely invariant only conflict if the
configuration surface is a single surface; splitting it in two honours both at
once, because nothing is inlined and the invariants stay invariant.

## Observed values

`Original or remaining?` is the column that does the real work. It records
whether a frame shows a duration that had not begun to run or the remainder of
one already running, because the two readings lead to opposite conclusions from
identically shaped evidence — and a reader who cannot tell which was meant
cannot judge the default that came out of it.

| Constant                          | Observed value                                                                | Frame                                                                                                 | Original or remaining?                                  | Default chosen                 | Reasoning                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `INVITE_EXPIRY_DAYS`              | 19 days, on the confirmation that follows copying a workspace invite link     | 46 (`01-onboarding-and-auth.md` L241)                                                                 | **Plausibly a remainder** of a duration already running | **30 days**                    | A link issued some days before capture and read at capture time would report exactly this, so the figure is a remainder rather than a setting. The governing rule then directs the conventional round default, keeping the reading as corroborating evidence: nineteen is not a conventional configured lifetime, thirty is. The value sets the life of a bearer credential, so it is settled once and enforced on redemption. See the note below. |
| `EXTERNAL_ACCEPTANCE_WINDOW_DAYS` | 14 days, on the confirmation that follows sending an external invitation      | 500 (`22-external-collaboration.md` L113, L364)                                                       | **An original**, forward-looking duration               | **14 days, adopted unchanged** | The surface describes a window that has not begun to run, so nothing is elapsed and there is no remainder to reconstruct. The round-default substitution therefore does not apply, and adopting the reading is the faithful choice. Identically shaped evidence to row 1, read the other way, giving the opposite conclusion.                                                                                                                      |
| `GUEST_CHANNEL_LIMIT`             | No number is stated anywhere; the distinction is evidenced, the figure is not | None for the figure; 49 and 50 evidence the distinction only (`01-onboarding-and-auth.md` L271, L272) | Not applicable — a count, not a duration                | **1 channel**                  | Channel scope is required for a guest and a separate allowance exists to admit more than one channel, so the budget for a guest without that allowance is exactly one. One is the smallest coherent behaviour consistent with that evidence; any larger figure would pre-grant what the allowance exists to grant. Enforced server-side when a guest is scoped to a further channel.                                                               |
| `SESSION_IDLE_TIMEOUT_MINUTES`    | None — the specification states no session lifetime of any kind               | No frame evidences it                                                                                 | Not applicable                                          | **1440 minutes (24 hours)**    | A single authenticated capture cannot show a session ending, so the bound is authored. A day-long idle bound keeps a returning member's session usable across one working day while still ending an unattended one. Sessions are server-side revocable records behind an HTTP-only cookie — never a token in local storage — so the bound is enforced at the server against a stored absolute expiry.                                              |
| `SESSION_ABSOLUTE_TIMEOUT_HOURS`  | None — as above                                                               | No frame evidences it                                                                                 | Not applicable                                          | **720 hours (30 days)**        | An idle bound alone lets a session live indefinitely under regular use, so a maximum is authored beside it and written once at sign-in. The two bounds are independent: reaching either ends the session, and neither is derived from the other.                                                                                                                                                                                                   |

## Row notes

### `INVITE_EXPIRY_DAYS`

The figure is not adopted, and the specification is emphatic about why. An invite
link is a **bearer credential**: whoever holds it can join the workspace, so its
lifetime is a security parameter rather than a display detail
(`README.md` L950). The catalog classes it with reusable capability links —
a non-secret selector beside a verifier of the secret part, server-enforced
expiry, individual and bulk revocation, and re-authorization on redemption
(`README.md` L389) — and warns in terms against a build that reads one document
and hard-codes the number it happens to render (`README.md` L405,
`01-onboarding-and-auth.md` L876).

So the mechanism is settled in exactly one place. The invitation-issuing service
reads the shared constant and writes an **absolute expiry timestamp** onto the
invitation record; nothing else computes a lifetime. Redemption re-checks that
stored timestamp server-side and refuses an expired link whatever any surface
renders, and every surface that shows a remaining lifetime derives it from the
stored timestamp rather than printing the configured duration.

Two surfaces in the specification state different lifetimes for this same
credential. That disagreement is **not** reconciled here: this row records the
resolution — one chosen default, one enforcement point — and the contradiction
itself is recorded in `docs/decisions/catalog-defects.md`.

### `EXTERNAL_ACCEPTANCE_WINDOW_DAYS`

This row exists to be read beside row 1. Both readings are a number of days on a
confirmation surface, and the two conclusions differ entirely because the two
readings do. Row 1's surface reports what is left of a link's life, so its figure
is an accident of when the capture was taken. This surface describes a window
that has not begun to run, so its figure is the window itself. Where there is no
elapsed time to reconstruct, there is nothing for a round default to correct, and
substituting one would discard the only reading the specification offers.

The placement of the window is marked a build decision rather than an
observation (`README.md` L340, `22-external-collaboration.md` L352, L524), and
the design it requires is followed: the window is held **once**, and each issued
invitation carries a **resolved acceptance deadline** computed at issuance —
never a duration, and never a second copy of the window. Acceptance checks that
resolved deadline server-side.

The surface that states the window belongs to a deferred area, so the mechanism
and its default ship now while the surface does not. A deferred screen is not a
deferred rule: the window is enforced from the moment invitations can be issued.

### `GUEST_CHANNEL_LIMIT`

**Absence recorded as absence.** The specification never prints a channel budget
for a guest. What it evidences is the distinction: choosing the guest role makes
channel scope a required field and introduces a separate allowance permitting
more than one channel, whose stated consequence is commercial rather than
functional (`01-onboarding-and-auth.md` L271, L272, L780, L818, L819). The
allowance is never captured in its selected state, so its effect on the form is
stated and not shown — a partial-capture item at
`01-onboarding-and-auth.md` L285, and the open work item this row discharges.
No frame number is offered for the figure, because none exists.

Options considered:

1. **No server-side limit**, relying on the required scope field to constrain the
   form. Rejected: a rendered constraint is not enforcement, and the security
   contracts say so directly (`README.md` L384).
2. **A budget of one** for a guest without the allowance. Chosen.
3. **A larger budget**, on the theory that a guest may reasonably need a few
   channels. Rejected: nothing evidences a figure, and any number above one
   pre-grants exactly what the allowance exists to grant.

One is therefore the smallest coherent behaviour consistent with the adjacent
evidence. It is enforced server-side at the point a guest is scoped to a further
channel, evaluated against the acting session and the target channel; the
allowance, when set, is recorded on the invitation and lifts the budget. The
commercial consequence the specification states is **deferred with a reason** —
billing is out of scope for this run — so the flag is recorded and no charge is
applied, which leaves the rule implementable the moment billing exists.

### `SESSION_IDLE_TIMEOUT_MINUTES` and `SESSION_ABSOLUTE_TIMEOUT_HOURS`

**Absence recorded as absence, and no marker exists either.** Neither the
specification nor the corpus raises session lifetime at all: a single
authenticated session captured once cannot show itself ending. This is the case
where the evidence is silent and nothing flags the silence, so the smallest
coherent behaviour consistent with adjacent evidenced behaviour is chosen and
recorded here.

The adjacent evidence is the returning-user path, where an address belonging to
more than one workspace is asked to choose one on the way back in
(`01-onboarding-and-auth.md` L431 · frame 731). Re-establishing a session is an
ordinary, designed event in this product rather than an exceptional one, so
bounding a session is consistent with what the specification describes rather
than in tension with it. Sessions are also classed with inbound verifier-only
material — held as a verifier at rest and never placed in a URL
(`README.md` L389) — which is why the bound belongs to a server-side record and
not to anything the client holds.

Options considered for the idle bound: **30 minutes**, rejected because a
communication surface left open across a working day would end repeatedly for no
real gain, given the session record is revocable at any moment; **24 hours**,
chosen; **7 days**, rejected because an unattended browser would stay usable for
a week.

Options considered for the maximum: **24 hours**, rejected because it collapses
into the idle bound and forces daily re-authentication; **30 days**, chosen;
**90 days or unbounded**, rejected because a credential that never has to be
re-established cannot be aged out by policy.

Mechanically, the idle expiry is an absolute timestamp advanced on authenticated
activity, and the hard expiry is an absolute timestamp written once when the
session is created and never moved. Whichever falls first ends the session, and
revocation ends it at any time regardless of both — the two bounds are
independent, and neither is computed from the other.

Two notes for a reader comparing this record with the plan. The planning ledger
referred to these bounds by placeholder before their units were settled; the
names above are the committed ones in `.env.example`, and this record follows the
template rather than the placeholder. And 720 hours is thirty days, the same
figure as row 1's default: the coincidence is not a relationship. They are
separate constants for separate mechanisms and must never be collapsed into one.

## Three clocks, not one

The specification models three time-bounded artefacts separately, each with one
named authority, and states plainly that conflating them produces a wrong schema
(`README.md` L401–L407, `01-onboarding-and-auth.md` L782, L842). The invite-link
lifetime in row 1 is a property of a **shareable link**. Two further clocks sit
beside it, and neither is in conflict with it:

| Clock                      | What it is a property of | Where it is recorded                                                                                         |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| External acceptance window | A pending relationship   | Row 2 above; held once, resolved to a deadline on each invitation                                            |
| Guest account end date     | An account               | No row here — a calendar date chosen per invitation, not a configured duration (`README.md` L407 · frame 54) |

They are different clocks with different owners and different lifecycles, and
they **must not be merged** — with the invite-link lifetime or with each other.
The specification insists on the separation at both of its ends
(`22-external-collaboration.md` L510), and this record preserves it rather than
tidying it into a single expiry setting.

The third clock has no row because there is no default to configure: the date is
chosen per guest at the moment of invitation. Its mechanism is still built —
the chosen date is stored as an absolute timestamp and enforced server-side —
which is the same discipline the rest of this file applies, arrived at from the
other direction.

## Changing a default, and adding one

To **change** a default: change the schema default in
`packages/shared/src/config/env.ts`, change the documented value in
`.env.example`, and update the row here — all in the same change. A change that
touches two of the three leaves this record lying, and a reader will trust it
anyway.

To **add** a configurable default: add a named export to the configuration
module, an entry with its comment to the environment template, and a row here
carrying the same six columns every existing row carries. A literal at a call
site is not a substitute for any part of that, and neither is a comment.

No consumer reads a literal. Every enforcement point imports the constant:

```ts
import { INVITE_EXPIRY_DAYS } from '@relay/shared/config';
```

A changed default governs records written afterwards and nothing already
written. That is what storing absolute timestamps buys, and it is what makes any
of these values safe to change at all.
