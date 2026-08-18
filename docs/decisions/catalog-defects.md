# Catalog defects

A specification can be wrong and still be the specification. This build is
written over a read-only corpus and a read-only catalog that are, in seven
identifiable places, mistaken, incomplete, or in disagreement with themselves or
with the build prompt that governs them. None of those seven is repaired. Each is
**recorded here and left exactly as it stands**, and the work proceeds anyway.

That is a deliberate discipline rather than a limitation, and it has one purpose:
a reader who follows a citation into the catalog and finds something other than
what the code does should be able to see the contradiction rather than inherit a
hidden choice. Correcting the specification in place would delete the evidence
that a judgement was ever made. Recording the defect keeps the judgement visible,
attributable and reversible.

| Field                               | Value                                                                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record — the register of specification defects                                                                                       |
| Status                              | Operative                                                                                                                                     |
| Entries                             | **Seven**, each with a resolution adopted and in force                                                                                        |
| Discipline                          | **Record, never correct.** No file under a read-only path is edited to close any entry below                                                  |
| Frames opened to author this record | **0** — every fact below was resolved from catalog prose                                                                                      |
| Companion records                   | `docs/decisions/phase-gates-ledger.md`, `docs/decisions/gap-register.md`, `docs/decisions/observed-values.md`, `docs/decisions/data-model.md` |

## The precedence the resolutions run under, stated once

Every resolution below is reached the same way, so the order is stated here once
and no entry re-derives it:

1. **The build prompt's requirements are precedence rank one.** Where the prompt
   states a figure, a value or an instruction, that is the operative reading even
   where a catalog document measures something different.
2. **Where the requirements and a user rule appear to differ, the rule is the
   stricter reading and governs.** A rule never loosens what the prompt requires;
   it either narrows it or leaves it alone. Three of the seven entries below are
   resolved on exactly this step, and in each of them the narrower answer is the
   one adopted.
3. **The catalog is evidence, never authority, on any point the first two
   settle.** It remains authoritative on everything they do not reach — which is
   most of the product.

## What this register does, and what it deliberately does not do

This file **points at** the reconciliations recorded elsewhere. It does not
restate them. An entry below names the defect, cites where it lives, states the
resolution and its precedence step, and then names the record that carries that
resolution's detail — and stops there. A second copy of a decision is a second
thing to keep true, and the two eventually differ.

So each entry is short on purpose. Where an entry feels thin, the detail is in
the record it names, and that is where it is maintained.

Two things this register is **not**:

- **Not a to-do list.** Every entry below is already resolved and the resolution
  is already in force. An open question with no chosen answer does not belong
  here; it belongs in the gap register.
- **Not a place to argue with the catalog.** The register records what the
  specification says and what was done instead. It does not diagnose why the
  specification says it, because inferring a cause is reconciling the
  contradiction, which is the one thing this file exists not to do.

### How this record cites

- **A document citation** names a file under `docs/workflows/` with its line
  number. `README.md` below is always the catalog index in that directory, never
  the one at the repository root.
- **A frame is cited by number alone** — a bare integer. No filename appears
  anywhere in this record, and neither does the catalog's percent-encoded
  citation form, because both carry a third-party product name.
- **Project rules are cited by subject and position**, never by their platform
  identifiers. Those identifiers each embed a third-party product name, so
  writing one here would breach the identity rule this record is otherwise
  observing. The corpus-handling rule is the third of the five as provided, the
  uncertainty rule the fourth, the identity rule the fifth. Position alone would
  be unsafe, because the identifiers are permuted relative to the requirement
  labels the prompt uses; position **with** subject is not.

One rendering artefact belongs with the citation convention rather than in the
seven, because it is a defect in how the rule text is *displayed* and not a
defect in the catalog this register covers: the delivered rule text wraps several
decision-record paths in spurious auto-links, turning a repository path into an
external link to a host that does not exist. Three such wrappers appear inside
the corpus-handling rule — this file, the measurement manifest and the
frame-access log — and one inside the uncertainty rule, on the observed-values
record. **The plain repository paths used throughout this directory are the real
ones**, and no agent should follow, reproduce or create the wrapped form.

## The seven entries at a glance

| #   | Defect                                                                  | Resolved by                                              |
| --- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | The gate authority the prompt names does not exist                      | Inline ledger is operative; mirrored to a permitted path |
| 2   | The marker census diverges across three sources                         | Rank-one figure is the baseline; positions enumerated    |
| 3   | The token-module path in the gate lies outside the write boundary       | Real path satisfies the gate's suffix                    |
| 4   | The guard location has no home in the write boundary                    | Guards live under the tools directory                    |
| 5   | Two surfaces state two lifetimes for one bearer credential              | One default, one enforcement point, absolute timestamp   |
| 6   | The per-viewer relation count reads ten in one place, eleven in another | Both readings carried; neither asserted                  |
| 7   | The catalog's statement that no project rules exist is now false        | Superseded as fact; its quality bar retained             |

## 1. The gate authority the prompt names does not exist

**What the specification says.** The build prompt names `docs/PHASE-GATES.md` as
the authority on exit conditions for every phase, and states that where that file
and the requirements disagree, the file governs. It is the only artefact in the
prompt given precedence over the prompt itself.

**Why it is a defect.** The file does not exist. That was verified individually
rather than inferred from a failed link: the documentation directory holds the
landing page, the read-only workflow catalog and this decisions directory, and
nothing else. A named authority that is absent cannot govern anything, so the
sentence elevating it above the requirements is inoperative on its own terms. The
absence is also silent, which is what makes it worth an entry rather than a
shrug — an agent that trusts the citation without checking will proceed believing
there is a gate ledger it simply has not read yet, and will report against a
ledger it invented.

**Resolution adopted, and under what precedence.** The build prompt's own inline
restatement of the gate ledger is the only available authority and is therefore
operative in full — precedence step 1, with nothing left to displace it. Its gate
families stay disjoint and are reported separately: the phase-zero authored gates
are never summed with the standing gates, and no family is rolled into a single
figure.

Because the corpus-handling rule confines new documents to this directory, the
ledger cannot be created at the path the prompt names — precedence step 2, where
the rule is the stricter reading. It is mirrored to a permitted path instead, and
the ledger exists and is in force there rather than being deferred for want of
its original location.

**`docs/PHASE-GATES.md` must not be created.** Creating it would place a new
document outside the only directory the corpus-handling rule permits for one — a
breach of the write boundary committed in the very act of satisfying a citation,
which is the least defensible way to breach it. Any gate check that resolves the
prompt's path resolves it to the mirrored record.

**Where the resolution lives.** `docs/decisions/phase-gates-ledger.md`.

## 2. The marker census diverges across three sources

**What the specification says.** Three sources give three different sizes for the
same population of open work items in the catalog, and all three are sources this
build is obliged to read.

| Figure  | Composition                                                               | Source                                                                                           |
| ------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **484** | 150 build-obligation markers · 239 partial-capture notes · 95 gap markers | The uncertainty rule's own text, the fourth of the five rules as provided                        |
| **463** | Not decomposed by its source                                              | A measurement recorded elsewhere in this project's specification                                 |
| **481** | 154 · 232 · 95, in those same three categories and that order             | A direct case-sensitive count of those same three marker strings across all 25 catalog documents |

**Why it is a defect.** The three cannot all be right about one population, and
the population is not decorative: every marker is an open work item that must
become a deliberate implemented choice, never a permission to skip. A build that
takes a total on trust will either stop short while believing it is finished, or
chase a figure larger than anything actually present in the documents. Note too
that the catalog itself states no census total anywhere — all three figures are
imposed on it from outside, which is precisely why none of them can be checked
against it.

**Resolution adopted, and under what precedence.** **484 is the planning baseline
and the reporting figure**, because the rule's text is precedence rank one and the
prompt adopts the same figure — precedence step 1.

**No attempt is made to reconcile the three, and none should be.** Each is a
legitimate reading of a different question: what the rule states, what a
measurement measured, and what a literal string count returns today. Averaging
them, or quietly preferring the one nearest the others, would manufacture a
number no source gives and would hide the disagreement this register exists to
show.

What makes the divergence survivable is structural rather than arithmetic: the
gap register is built by **enumerating actual marker positions**, not by trusting
any total. A register keyed to positions cannot be wrong by the size of a total.
It is either missing a position or it is not, and that is a checkable question,
which no comparison of 484 against 481 will ever be.

**Where the resolution lives.** `docs/decisions/gap-register.md`.

## 3. The token-module path in the gate lies outside the write boundary

**What the specification says.** A phase-zero gate names the token module at a
bare `src/styles/tokens.ts` — a path with no workspace in front of it. The
corpus-handling rule confines new code to four directories: `apps/`, `packages/`,
`infra/` and `tools/`.

**Why it is a defect.** A bare `src/` at the repository root is in none of the
four. Read literally, the gate cannot be satisfied without breaching the write
boundary, and the boundary cannot be honoured without leaving the gate's path
unresolved. This is not a cosmetic mismatch, because the token gate blocks every
screen in the phase behind it: an unresolved path in that position stalls the
entire user-interface surface, so it has to be settled rather than noted.

**Resolution adopted, and under what precedence.** The module is at
**`packages/ui/src/styles/tokens.ts`** — precedence step 2, where the rule is the
stricter reading. That path satisfies the gate's stated suffix exactly while
sitting inside the permitted packages directory, so the gate check resolves to a
real file rather than to a location no agent is allowed to write. Nothing about
the gate's substance is weakened by the move: the module is implemented at that
path as the sole declaration site the gate always required, and it remains the
only place in the tree carrying a colour value.

**Where the resolution lives.** `docs/decisions/theme-and-color.md` for what the
module declares in colour, and `docs/decisions/measurement-manifest.md` for its
measured geometry and the provenance every geometric token carries. Neither is
summarised here.

## 4. The guard location has no home in the write boundary

**What the specification says.** The write boundary in the corpus-handling rule
admits new code under exactly four directories — `apps/`, `packages/`, `infra/`
and `tools/`. A root-level scripts directory, which the build prompt's own
restatement of the identity guard reaches for, is not among them.

**Why it is a defect — and precisely which defect it is.** **The retrieved text
of the identity rule, the fifth of the five as provided, names no guard location
at all.** It requires that no third-party identity appear anywhere in the
delivered tree and is silent on where a check enforcing that should live. So what
this entry records is a reconciliation between the build prompt's own restatement
and the write boundary — **not** a conflict with the identity rule's wording.

The distinction is kept deliberately, because overstating it is the easier
mistake and the more damaging one: attributing to a rule a suggestion it does not
make would itself be a defect in this register, and a register that mis-cites a
rule is worse than one that omits an entry, since a reader has no reason to doubt
it.

**Resolution adopted, and under what precedence.** The guards live at
`tools/check-brand/` and `tools/check-corpus/`, inside the permitted tools
directory — precedence step 2. They are invoked from root package scripts and from
the pipeline, and nothing is given up by the relocation: a script or a pipeline
step reaches a checker under `tools/` exactly as it would reach one under a root
scripts directory, so the boundary costs the guards no capability and no
reachability. Both guards are built rather than described, and both fail the build
on a finding — the identity guard on any occurrence outside an allowlist of
exactly the five read-only paths, the corpus guard on any change to the frame
count or to the bytes of a frame.

**Where the resolution lives.** The guards themselves: `tools/check-brand/`, whose
allowlist module enumerates the five exempt paths, and `tools/check-corpus/`. Both
are wired into the pipeline as gating steps.

## 5. Two surfaces state two lifetimes for one bearer credential

**What the specification says.** Two surfaces give two different lifetimes for the
same kind of invite link, and the catalog records both without preferring either
(`README.md` L946–L952).

| Reading       | Surface                                                                                                                                            | Frame |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Nineteen days | The in-product confirmation raised when the invite link is copied, which states the expiry in copy                                                 | 46    |
| One month     | The administration console's invite-links table, which renders a creation date and an expiry date exactly one month apart on the same kind of link | 656   |

Both readings are corroborated inside the area document as well: it carries the
disagreement in its own inconsistencies table and raises a build obligation for a
single authoritative lifetime stored rather than written into copy
(`01-onboarding-and-auth.md` L861, L876), and the administration area carries the
reciprocal note.

**Why it is a defect.** The catalog itself elevates this above a mere
inconsistency, and its reason is the right one: an invite link is a **bearer
credential**. Whoever holds it can join the workspace, so its lifetime is a
security parameter and not a display detail (`README.md` L950). A build that reads
one document, finds a number rendered in a confirmation string, and hard-codes it
has set the expiry of a credential from copy that another surface contradicts —
which is to say it has made a security decision by accident, and left no record
that a decision was made at all. The area document says as much in terms: the
nineteen-day figure is not safe to adopt as a credential lifetime from that
document alone.

**Resolution adopted, and under what precedence.** One chosen default of **thirty
days** — the conventional round figure, with the nineteen-day reading retained as
corroborating evidence that a bounded lifetime exists rather than as the setting
itself. This follows precedence step 2: the uncertainty rule is the stricter
reading, and it requires the full mechanism to be built as enforced functionality,
defined once as a named configurable constant and never inlined at a point of use.

The mechanism is settled in exactly one place. The invitation-issuing service reads
the shared constant and writes an **absolute expiry timestamp** onto the invitation
record; nothing else computes a lifetime. Redemption re-checks that stored
timestamp server-side and refuses an expired link whatever any surface renders, and
every surface showing a remaining lifetime derives it from the stored timestamp
rather than printing the configured duration. Storing the instant rather than the
duration is what lets the default change later without invalidating links already
issued.

**The other two clocks stay separate from this one.** The catalog is explicit that
they do not conflict with it and **must not be merged** with it, and names a single
authority for each (`README.md` L952). They are different clocks, on different
subjects, with different lifecycles: one is a property of a shareable link, one of
a pending relationship, one of an account. Collapsing them into a single expiry
setting would produce a wrong schema, so the separation is preserved.

**Where the resolution lives.** `docs/decisions/observed-values.md` — the row for
the invite-link default, its reasoning, and the record of the three clocks held
apart. The contradiction is described here; the resolution is maintained there, and
neither repeats the other.

## 6. The per-viewer relation count reads ten in one place and eleven in another

**What the specification says.** Two sources give two counts for the same table of
per-viewer relations.

| Reading    | Source                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Ten**    | The catalog's own relation table, counted at source: ten body rows running L363–L372, beneath the header at L361 (`README.md`) |
| **Eleven** | The figure this project's specification gives for that same table in its narrative                                             |

One locator observation belongs beside them, offered as evidence and explicitly
**not** as an explanation: the specification cites the table's range as ending one
line before the table's final body row. It is recorded because a reader following
that citation lands one row short of the table. It is not offered as the cause of
either figure, because identifying a cause would be reconciling the contradiction,
and this register does not do that.

**Why it is a defect.** The two readings cannot both describe one table, and the
count is not incidental: the same catalog passage insists that per-viewer state is
a relation and never a field of a shared entity, for a security reason rather than
a modelling preference — placed on the shared object, one person's reading marks a
conversation read for everyone and additionally discloses that person's behaviour
to every other member. A build that resolved the count by inventing an eleventh
relation, or by deleting one to reach ten, would be altering a security-bearing
model to make arithmetic close.

**Resolution adopted, and under what precedence.** **Both readings are recorded and
neither is asserted.** No eleventh relation is invented to satisfy the larger
reading, and none is removed to tidy the smaller one. The schema carries exactly
the relations the catalog carries, and the data-model record carries the
disagreement alongside them. This is precedence step 2 applied to a case where the
stricter reading is to change nothing: the corpus-handling rule requires the defect
recorded rather than resolved, and preserving an inconsistency is the documented
discipline rather than a failure to decide. The per-viewer relations are
implemented as relations, and the placement rule they exist to enforce is in force.

**Where the resolution lives.** `docs/decisions/data-model.md` — the relation table
itself and the note carrying both readings without preferring either.

## 7. The catalog's statement that no project rules exist is now false

**What the specification says.** The catalog carries a section asserting that no
user-specified rules exist for this project, that the rules document was queried
and returned none, and that the query was repeated to confirm the response was
complete rather than truncated.

Both line references in circulation are real, and the distinction between them is
worth recording rather than resolving:

| Reference        | What sits there                                             | Cited by                         |
| ---------------- | ----------------------------------------------------------- | -------------------------------- |
| `README.md` L843 | The section heading announcing the absence of project rules | This project's specification     |
| `README.md` L845 | The assertion sentence itself, two lines below the heading  | This directory's authoring brief |

Neither citation is wrong. This is a **heading-versus-sentence distinction** — one
source points at the section, the other at the claim inside it — and not an error
in either. It is recorded so that a reader meeting the two references does not go
looking for a discrepancy that is not there.

**Why it is a defect.** The assertion was true when the catalog was written and is
false now: **five user-specified rules are attached to this project and every one
of them is binding.** A statement of fact that has been overtaken is more dangerous
than an ambiguity, because it reads as licence. An agent encountering that section
could reasonably conclude that no rule governs its work — and would then be free of
the shared-component rule, the server-side authorization rule, the corpus-handling
rule that makes this very file mandatory, the uncertainty rule and the identity
rule, all at once.

**Resolution adopted, and under what precedence.** The section is **superseded as a
statement of fact and must not be read as licence** — precedence step 1, since the
rules are delivered with the build prompt and outrank a catalog observation about
their absence. The catalog is not edited to correct it; the supersession is recorded
here and the section stands as written, which is the whole discipline of this
register applied to a sentence about rules.

All five rules are discharged in the delivered tree rather than merely
acknowledged: each contract is implemented once in the shared component package,
every mutation and every projection is authorized server-side against the acting
session and the specific target object, the read-only paths are unedited and this
register is the record the corpus-handling rule requires of them, every uncertain
value is a named configurable constant stored as an absolute instant, and no
third-party identity appears anywhere outside the five allowlisted read-only paths.

**What is retained.** The catalog did not treat the absence as permission to lower
its bar. It named ten enterprise-standard practices that stood in for rules during
its own construction (`README.md` L847), and those are **kept as the quality bar**
rather than discarded now that real rules exist. Among them: evidence before
assertion, with a measurement that disagrees with a documented figure reported and
the disagreement named; verifying a configuration by building it rather than
reasoning about it; testing the validation gates against a deliberately defective
catalog as well as a good one; keeping the change surface least-privilege; and
treating primary evidence as read-only. The rules set the floor; these ten remain
the bar above it.

Two of the ten are visibly the ancestors of this register: **evidence before
assertion**, which requires a measurement that disagrees with a documented figure
to be reported and the disagreement named rather than smoothed over, and the
**disclosure of limitations** rather than their concealment. Both are practised
above — the first in every entry that carries a count made at source against a
figure quoted from a document, the second in the fact that this file exists at
all.

**Where the resolution lives.** `docs/decisions/phase-gates-ledger.md` for the gate
families the rules and the prompt impose, and this record for the supersession
itself. The ten practices need no separate record: they are observed in the
authoring conventions every record in this directory closes with.

## Checked and found sound

A register that lists only problems invites its own checks to be repeated, and the
next reader has no way to tell an unexamined area from a clean one. Three things
were examined closely enough to have produced an eighth entry and did not. They are
recorded as sound so that nobody re-opens them looking for a defect that is not
there.

### The Phase-1 acceptance-criteria arithmetic reconciles exactly

Counting checklist items in the five Phase-1 area documents gives **39 · 46 · 61 ·
57 · 38**, summing to **241**. That figure was counted at source rather than taken
on trust, and it matches the requirement ledger and the catalog's own Phase-1 exit
gate — the twelfth and last of them (`README.md` L489), which requires every
acceptance criterion in those same five documents to pass and therefore takes 241
as its own denominator.

**No defect entry is warranted for scope arithmetic.** The deferred-phase totals
reconcile on the same basis, so the criteria arithmetic across the whole backlog
holds. This is worth stating positively: in a specification carrying a three-way
disagreement about its marker census, the acceptance-criteria count — the figure the
build is actually graded against — is exact.

### The corpus band and height measurements corroborate the effective viewport

The catalog publishes a measured distribution for the bottom capture band and
another for frame height, and reports that the band figure disagrees with the one
recorded upstream (`README.md` L915–L933). That disagreement is the catalog's own,
already disclosed by it, and the measurements around it are internally consistent
rather than in conflict:

- Each distribution totals exactly 1,022 frames, independently, and so does the
  canonical-plus-remainder split. Three separate tabulations agree on the
  population.
- The band's excluded height and the measured top edge of that band agree with the
  effective product viewport the catalog derives from them, so the crop is
  corroborated by a second measurement rather than asserted once.
- The upstream figure the catalog contradicts is recorded as measured in **zero**
  frames, which is a disclosed disagreement with a stated basis — the disclosure
  discipline working, not a defect in the disclosing document.

The measurement contract this build runs, and its access-budget reconciliation, are
in `docs/decisions/measurement-manifest.md`.

### The refusal of absolute pixel offsets is a stated reason, and it is answered

The catalog declines to state absolute pixel offsets, and it gives a reason rather
than a preference: an offset keyed to a fixed canvas would be wrong on **48 of the
1,022** frames (`README.md` L935). The measurement override answers that reason
directly, by measuring each frame in the manifest individually and clustering the
results into scales, so no token depends on a canvas being uniform.

That is a **reconciliation, not a defect**. The catalog's objection was sound on its
own terms and remains sound; what changed is that the objection has been met, which
is a different thing from the objection having been wrong. Recording it here keeps
the next reader from filing the override as a contradiction.

## When a new entry belongs here

An entry is added when the specification is found **wrong, self-contradicting or
incomplete** *and* the work must proceed anyway. Both halves are required. A defect
with no resolution is not an entry, because this register records adopted
resolutions rather than open questions; an open question belongs in
`docs/decisions/gap-register.md`.

Three things are **not** catalog defects, and filing them here would dilute the
register:

- **A disagreement between two records in this directory.** That is a bug in one of
  them, and the remedy is to fix the record that is wrong — these files are
  writable, so nothing forces the disagreement to be preserved. Preservation is the
  answer only where correction is prohibited.
- **A gap the catalog itself already discloses as a gap.** A build-obligation
  marker, a partial-capture note or an explicit gap marker is an open work item
  behaving exactly as designed. It becomes an implemented choice recorded in the gap
  register, not a defect.
- **A place where the catalog and the build prompt simply differ in precedence.**
  Precedence resolves it without a contradiction arising, and only the cases where
  following the order produces something a reader would not expect from the citation
  are worth an entry.

Every entry keeps the same four-part shape, and the resolution goes in the record
that owns the subject rather than in this file.

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **Frames by number only.** Every frame reference above is a bare integer. No
  filename appears anywhere in this record, and neither does the catalog's
  percent-encoded citation form — both carry a third-party product name, which is
  prohibited in source, comments, copy and file names alike. The catalog treats its
  own citation filenames as a complete, reviewed exception whose pattern its gate
  strips before counting; this record needs no exception because it cites no
  filename.
- **Rules cited by subject and position, not by identifier**, for the reason given
  under [How this record cites](#how-this-record-cites).
- **No frame was opened to author this record.** Every fact above was resolved from
  catalog prose, which is the order the corpus-handling rule requires. The corpus
  was never surveyed, enumerated, sampled or scanned, and no measurement of it is
  reproduced here beyond the counts the catalog itself publishes.
- **Functional naming throughout.** Surfaces are named for what they do — the
  in-product confirmation, the administration console's invite-links table, the
  navigation rail. No third-party product or feature name appears, and no string
  legible in any frame is transcribed. Where an entry describes what a surface
  states, it paraphrases rather than quotes.
- **No colour value appears.** Colour resolves to the palette named in the build
  prompt and is declared in exactly one file; this record points at
  `docs/decisions/theme-and-color.md` rather than reproducing a single literal.
- **No diagram fences.** The committed documentation-site configuration does not
  render them: its bundled superfences extension consumes a fenced block before the
  diagram plugin can claim it, so a diagram fence publishes as a highlighted code
  box (`README.md` L905). This record uses tables and prose instead, and it adds
  nothing to the read-only site configuration.
- **Fenced lines are held to 74 characters**, the catalog's measured ceiling, because
  a published fence clips rather than wraps. This record contains no fenced block, so
  the ceiling is satisfied trivially.
- **Evidence by citation; absence recorded as absence.** Every figure above names the
  source it came from, and the two counts this record made itself — the marker
  strings and the acceptance-criteria checklist items — are identified as counts made
  at source rather than as figures quoted from a document.
- **Inconsistencies preserved, not reconciled.** That is the whole subject of this
  file. Two entries above resolve to recording both readings and asserting neither,
  and in both cases the arithmetic is left open on purpose.
