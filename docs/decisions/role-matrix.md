# The capability matrix — account types, operations and the cell where they meet

Every mutation in this build is refused or permitted by one server-side check, and that
check needs an answer to a question the specification never answers: **who may do this?**
This record is that answer. It defines the account types, assigns a decision to every
Phase-1 operation for each of them, and states the rule that keeps a private resource
absent from every projection of it.

It exists because the required denial test names a caller type the specification never
defines. The authorization rule — the second of the five project rules as provided —
obliges every mutation and every projection to ship with a test proving that a
**non-member** and a **wrong-role caller** receive a server-side denial. A wrong-role
caller cannot be constructed without a definition of what a wrong role is, so this record
is a **precondition** of the denial suite rather than a report about it. It is authored
before `apps/api/src/authz/roles.ts`, `matrix.ts`, `policy.ts`, `guard.ts`,
`projection-guard.ts` and `errors.ts`, and those files implement it. Where an
implementation and this record disagree, the implementation is wrong.

| Field                               | Value                                                                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record type                         | Decision record — the authored capability model                                                                                                                                     |
| Status                              | Operative. Precondition for the denial, isolation and projection suites                                                                                                             |
| Account types defined               | **Five.** Owner · Admin · Member · Guest · External collaborator                                                                                                                    |
| Matrix columns                      | **Seven.** Six account-type columns — the guest's single-channel and multi-channel forms are separate columns of one type — plus a no-session column that is not a type             |
| Operations decided                  | **62**, in eleven groups. No cell is blank                                                                                                                                          |
| Projections governed                | **Eight**, in the order the authorization rule lists them                                                                                                                           |
| Evidence available                  | Four frames of visible authorization, cited by number below, none of them a capability assignment                                                                                   |
| Frames opened to author this record | **0** — every fact below was resolved from specification prose                                                                                                                      |
| Companion records                   | `docs/decisions/security-contracts.md`, `docs/decisions/data-model.md`, `docs/decisions/realtime-contract.md`, `docs/decisions/catalog-defects.md`, `docs/decisions/ac-manifest.md` |

## Why this had to be authored, and why no amount of evidence would have helped

The specification says so itself, in the contract that obliges the check. The corpus names
**no role, no permission scope and no capability name** beyond four visible facts, the
catalog invents none, and the consequence is stated as an instruction rather than a
regret: the build "defines the capability model itself" — the set of capabilities, how
they are granted, and which capability each operation requires
(`00-product-overview.md` L504). What the contract fixes is that the check exists, runs on
the server, is scoped to the object rather than to the surface, and applies to every
operation. What the model is called, and what is in it, is this record's work.

### The four facts, cited by number

These are the corpus's entire vocabulary of visible authorization
(`README.md` L380, `00-product-overview.md` L479, L919). Each is summarised in authored
words; none is transcribed, and no frame was opened to obtain any of them.

| Frame | What the specification records it as showing                                                                                               | What it settles                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 75    | One control inside a channel's add-people modal carries an administrator-only legend; the control inside the bordered region stays enabled | That a gate exists, and that its rendering is not the gate |
| 576   | A workspace permissions surface states that invitation is open by default and can be made to require administrator sign-off                | That invitation is policy-governed, not fixed              |
| 672   | A billing surface states that only certain accounts may change billing and payment details                                                 | That some capability is narrower than the workspace        |
| 710   | A help article states that creating a workflow and using one are permissioned separately                                                   | That one feature can carry two capabilities                |

Read together, those four settle four _shapes_: a gate exists; a gate can be configurable;
a capability can be narrower than membership; and one feature can need two capabilities.
Not one of them assigns a capability to an account type. Nothing else about who may do
what is evidenced, and the specification's own reading of that silence is the one this
record adopts: "silence is never a permission" (`README.md` L380).

Their distribution is worth stating too, because it bears on how much of this record could
have been evidenced even in principle. Only **frame 75** sits on a surface Phase 1 builds.
**Frame 576** belongs to the deferred administration console, and **frame 672** and
**frame 710** to the deferred billing and help surfaces. So of the four facts, three
describe capabilities whose surfaces this run does not open, and the fourth describes a
rendering rather than a rule. There was never a version of this record that could be read
off the corpus.

### The limitation is structural, not a coverage gap

The corpus is **one authenticated session in one workspace**. That single sentence
disposes of the idea that more frames would have produced a matrix. A capture shows what
the capturing viewer saw; one viewer in one workspace can never show what a _different_
viewer sees, what a _differently typed_ account sees, or what a **de-authorized** viewer
sees — and those three comparisons are the entire content of a capability model. The
specification states the general form of this limit plainly: a capture "can show a control,
and it can never show an authorization check" (`README.md` L378).

Two consequences follow, and both are load-bearing for this record.

- **Every capability decision below is authored.** None is read off a frame, because no
  frame carries one. The uncertainty rule — the fourth of the five as provided — governs
  such decisions: each is an implemented choice recorded with the options considered, the
  choice and the rationale, preferring the smallest coherent behaviour consistent with
  adjacent evidenced behaviour. The register that discharges that obligation is
  [The authored decisions](#the-authored-decisions).
- **Absence is recorded as absence.** Where the specification is silent, this record says
  it is silent and then decides anyway. It never implies evidence it does not have, and it
  never treats its own decision as though the corpus had supplied it.

### What the deferred administration area does and does not supply

One place in the specification comes closer than the four frames, and honesty requires
naming both what it gives and what it withholds. A permissions surface in the deferred
administration area captures a table whose first column holds capability names and whose
remaining columns are one per account type, and the prose names the account types it shows:
a single-channel guest, a multi-channel guest, a member, a workspace administrator and a
workspace owner (`15-admin-workspace.md` L753, L754). A member roster elsewhere in the same
area carries an account-type column, with a regular member and a primary workspace owner
observed in it (`15-admin-workspace.md` L626), and a roster tab is sorted by a role value
(`15-admin-workspace.md` L597).

So the five workspace-scoped account types are **named in the specification's own prose**,
and this record's names are therefore not inventions of vocabulary. What that surface does
**not** supply is any usable mapping:

- The capture's leading columns are clipped and only the two rightmost account types are
  legible in the second capture (`15-admin-workspace.md` L754).
- The capabilities below the fold are not readable at all
  (`15-admin-workspace.md` L758).
- The roles card is never opened, so the specification states that **no role is named
  anywhere in the catalog and none may be invented** (`15-admin-workspace.md` L758) — a
  statement that sits alongside the five account types named four lines earlier, and one
  this record preserves rather than reconciles.
- How a capability is granted or revoked is undocumented, because the per-row control that
  would show it was never captured (`15-admin-workspace.md` L758).

A table whose rows are unreadable and whose columns are clipped is a table that proves a
capability model exists somewhere. It is not a capability model. This record supplies one,
and it keeps the specification's own distinction: **account type** is the term the prose
uses for the five, so it is the term used here.

## How this record cites, and how it refers to the rules

- A document citation names a file under `docs/workflows/` with its line number, so
  `README.md` below is the specification index in that directory and never the one at the
  repository root.
- A frame is cited by **bare number**. No filename appears here, and neither does the
  catalog's percent-encoded citation form, because both carry a third-party product name.
- The project rules are cited by **subject and position in the provided order** — the
  component rule is the first, the authorization rule the second, the corpus-handling rule
  the third, the uncertainty rule the fourth, the identity rule the fifth. Each rule's
  platform identifier embeds a prohibited product name, so writing one here would breach
  the identity rule this record is otherwise observing. Position alone would be unsafe,
  because the identifiers are permuted against the requirement labels; position **with**
  subject is not.
- Three things this record points at rather than restates, because a second copy of any of
  them is a second thing to keep true: the sixteen security contracts and where each is
  discharged (`docs/decisions/security-contracts.md`), the schema shapes that make each
  projection authorizable at all (`docs/decisions/data-model.md`), and the socket
  envelope and replay behaviour (`docs/decisions/realtime-contract.md`).
- Every example in this record uses **authored** names or no names at all. The
  conversation names, person names and role labels visible in the corpus illustrate shape
  only, and reproducing one — here, in a fixture or in seed data — is prohibited by the
  identity rule.

## The five account types

Five types, and the columns of every table below are these five with the guest split into
its two forms. Each row states what the type is scoped to, because scope — not seniority —
is what the guard evaluates.

| Type                        | Scope                                                        | Defining characteristic                                                                                                                                | How it is acquired                                                                                                       | How it is lost                                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owner**                   | The whole workspace                                          | The only type that can hold the owner-only capabilities, and the only one a workspace must always have at least one of                                 | By creating the workspace; the creator holds it from the first committed step of the setup wizard                        | Only by a transfer that leaves another owner in place. Ownership transfer is **deferred with a reason** — no surface for it is in Phase 1 — so in this run an owner is lost only with the workspace |
| **Admin**                   | The whole workspace                                          | Holds every workspace-level capability except the owner-only class                                                                                     | Granted by an owner, or by an admin acting within the below-admin limit, which cannot produce another admin              | Revoked by an owner, or by removal from the workspace                                                                                                                                               |
| **Member**                  | The whole workspace                                          | The ordinary participant: may read and join every public channel, and holds no workspace-administration capability                                     | By accepting a member invitation, or by being the account a workspace was created for                                    | By removal from the workspace by an owner or an admin, or by leaving it                                                                                                                             |
| **Guest, single channel**   | **A set of channels containing exactly one**                 | Participates in the channels its invitation named and has no standing in the workspace outside them                                                    | By accepting a guest invitation whose scope names one channel                                                            | At the absolute expiry timestamp recorded on the invitation, by removal from its one channel, or by removal from the workspace                                                                      |
| **Guest, several channels** | **A set of channels containing more than one**               | The same standing as the single-channel form, over a larger set; the larger set exists only because the invitation carried the multi-channel allowance | By accepting a guest invitation whose scope names more than one channel, which requires the allowance on that invitation | As above; losing every scoped channel but one does not promote or demote the account, it narrows the set                                                                                            |
| **External collaborator**   | **Specific conversations reached from another organization** | Reaches the product through a conversation shared with their organization, and has no workspace standing at all                                        | By accepting an external invitation within its acceptance window, which materialises the conversation                    | When the collaboration ends, when the per-channel admission is withdrawn, or when the acceptance window lapses before acceptance                                                                    |

**Why the guest is one type in two columns.** The specification names the two forms
separately as account types (`15-admin-workspace.md` L754), and the difference between them
is evidenced: choosing the guest role at invitation makes channel scope a required field
and adds a separate allowance permitting more than one channel
(`01-onboarding-and-auth.md` L272, L818, L819). But the two forms differ in **how many
channels are in the set**, not in what may be done inside one, so folding them into one
type with a scope of variable size is the shape the guard actually needs. They are given
two columns so that a reader can see the answer is identical in both, and so that the one
place they genuinely differ — how large a scope an invitation may name — has somewhere to
be stated. The channel budget behind that difference is settled once, at
`docs/decisions/observed-values.md`, which records a default of one and the allowance that
lifts it.

**What the guest's scope is not.** It is not a reduced workspace. A guest's authorization
is evaluated against a **specific target channel** in every row below, never against the
workspace, which is exactly what makes the guest scoping rule enforceable rather than
aspirational. The specification's own description of the guest limits them to selected
channels, files and a directory (`01-onboarding-and-auth.md` L271), and the directory a
guest reaches is a projection scoped to what they may read, not the workspace directory
with a narrower banner.

**What the external collaborator's scope is not.** It is not a guest with a longer name.
The specification records external membership as a channel property — admission granted
**per channel**, with a per-organization permission level carried on the membership and a
history-copy consequence when the collaboration ends
(`22-external-collaboration.md` L391) — and an external invitation as an email invitation
with a stated acceptance window whose acceptance materialises the conversation
(`22-external-collaboration.md` L11, L90). An external collaborator is therefore admitted
by their organization's relationship to a conversation, which no workspace account type
describes.

### The ordering relationship, and where it stops

`Owner ⊇ Admin ⊇ Member` holds for **workspace-level** capabilities, and this record's
tables satisfy it: no row grants a member something an admin is denied, and none grants an
admin something an owner is denied. Guest and external collaborator are **not** the next
rungs down that ladder. They are differently scoped, and a strictly hierarchical
implementation would be wrong in a way that is easy to demonstrate rather than merely
argue:

> A single-channel guest of a private channel may send a message in it.
> A workspace member who is not a member of that channel may not.

A rank comparison cannot express that. Ranked below the member, the guest loses a
capability the specification evidences them having; ranked above, the guest gains the whole
workspace. The pair is not ordered at all, because the comparison is between scopes and not
between levels. The same holds, more sharply, for the external collaborator, whose scope
does not include the workspace in any degree.

**Decision.** The matrix is a **total function** from an operation and an account type to a
decision. It is not a rank, and it exposes no ordering operator.

**Options considered.**

1. **A numeric rank per type, with `>=` comparisons at each policy.** Rejected. It is the
   most common shape and the one this record exists to prevent: it silently converts every
   scope question into a seniority question, and the counter-example above is then a bug
   nobody can fix without deleting the rank.
2. **A hierarchy for the three workspace types, with guests and external collaborators
   handled by special cases.** Rejected. It preserves the rank's convenience while making
   two of six columns exceptions, and an exception in an authorization decision is a place
   for a future reader to assume the general case applies.
3. **A total function from operation and type to a decision, with conditions named
   explicitly.** Chosen. Each cell is decided on its own, so scope and seniority never get
   confused; the containment relationship above becomes a property a test can assert over
   the encoded matrix rather than a mechanism the code depends on.

**Implementation consequence.** `apps/api/src/authz/roles.ts` enumerates the types and
exposes **no** rank, no ordinal and no comparison helper. `apps/api/src/authz/matrix.ts`
encodes the cells as data. A test over the encoded matrix asserts the containment property
for the three workspace types, which is how the ordering stays true without being the
mechanism.

### "Wrong-role caller" and "non-member" are different callers

The denial test the authorization rule requires names both, and they fail at different
points. Conflating them produces a suite that appears to cover twice as much as it does.

| Caller                | Definition                                                                                                                                                                               | Where the request fails                                                                                               | What a passing test proves                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Non-member**        | A session that holds no membership reaching the target object at all — no workspace membership for a workspace-scoped target, or no channel membership for a channel-scoped one          | Before the matrix is consulted. Workspace isolation removes the row at the data layer, so the target does not resolve | That the object is unreachable, not merely unwritable — the caller cannot even establish it exists                    |
| **Wrong-role caller** | A session whose account type is defined in this record, which **is** a legitimate member of the workspace or the target channel, and whose cell for the attempted operation reads `deny` | Inside the policy for that operation, at the point of execution, against the resolved target object                   | That the capability model is enforced, not merely documented — the caller is entitled to the object and still refused |

Both must be tested for **every** mutation, and a suite that tests only one of them has a
predictable hole. Testing only the non-member proves isolation and says nothing about
capabilities. Testing only the wrong-role caller proves capabilities and says nothing about
isolation — and isolation is the failure with the larger blast radius, because it crosses a
workspace boundary rather than a capability boundary.

A third caller is worth naming so it is not mistaken for either: a **de-authorized**
caller, one who held the authorization when a long-lived connection was established and no
longer holds it. That caller is why subscribe-time authorization is insufficient on its own,
and it is handled under [Realtime](#k--realtime) and in
[The private-resource invisibility rule](#the-private-resource-invisibility-rule).

### Standing conditions that apply to every cell

Stated once here rather than repeated across sixty-two rows. A cell's own condition is
**additional** to these, never instead of them.

| #   | Standing condition                                                                                                                                                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **The acting account and the acting workspace come from the session.** Both are server-derived; neither is read from a path, a body, a query parameter, a header or a socket frame                                                                                                           |
| 2   | **Every allow is additionally subject to workspace isolation** at the data layer, so a permitted operation on an object in another workspace never resolves a target to be permitted against                                                                                                 |
| 3   | **The guest columns are additionally bounded by an absolute expiry timestamp** on the account. The specification states the semantics — a guest account expires at the end of a selected date (`01-onboarding-and-auth.md` L272, L820) — and the record stores a timestamp, never a duration |
| 4   | **The external column is additionally bounded by the per-organization permission level** recorded on the external membership (`22-external-collaboration.md` L391), and by the same absolute-expiry treatment                                                                                |
| 5   | **Every row in the authentication group is rate-limited.** A rate limit is a control on volume, not an authorization decision, so it never appears as a cell value                                                                                                                           |
| 6   | **A destructive operation is additionally confirmed**, and the confirmation is a second signal of intent and never the authorization itself (`00-product-overview.md` L502)                                                                                                                  |
| 7   | **Every denial emits an audit record**, whichever cell produced it                                                                                                                                                                                                                           |

## The capability matrix

### How to read a cell

Every cell holds one of exactly three forms. There is no fourth form and there is no blank.

| Form         | Meaning                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allow`      | Permitted for this type, subject only to the standing conditions above                                                                                        |
| `deny`       | Refused for this type. The request is refused at the point of execution and the refusal is audited                                                            |
| `allow: tag` | Permitted **only** where the named condition holds; where it does not, the cell is a denial and is audited as one. Several tags separated by commas all apply |

**Why nothing is blank, and why that is a forcing function rather than a style rule.** The
guard's operation union is exhaustive, so an operation with no policy is a **compile
error** rather than an unguarded route waiting to be noticed in review. A blank cell here
would therefore not produce a permissive default; it would produce a build that does not
compile, and the fastest way to make it compile again is for somebody to guess. Filling
every cell is what keeps the guess out of the code.

The specification's own permissions table takes the opposite convention — a cell there is
either a check glyph or empty, and the catalog infers that empty means an absent capability
rather than an unknown one (`15-admin-workspace.md` L753, L756). That convention is fine
for a surface rendering a decision already taken. It is unusable for a record **making** the
decisions, because a blank cannot distinguish "denied" from "not yet considered", and those
two are the entire difference between a capability model and a draft.

### The conditions, defined once

| Tag                   | Holds when                                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-actor`            | The operation runs before a session exists, so the matrix is **not consulted**. A session presented on such a request confers nothing and is ignored rather than trusted                                                                                                                                                                                                  |
| `credential`          | A password verifier for the address matches. Verification parameters and their upgrade path belong to the secret handling, not here                                                                                                                                                                                                                                       |
| `code-match`          | The presented one-time code is bound to the address, unconsumed, and its absolute expiry has not passed                                                                                                                                                                                                                                                                   |
| `reset-artifact`      | The presented reset artifact is unconsumed and its absolute expiry has not passed                                                                                                                                                                                                                                                                                         |
| `invitation-valid`    | The presented invitation resolves to an unconsumed invitation whose absolute deadline has not passed. The deadline is resolved at issuance, so changing the configured default never moves an issued one                                                                                                                                                                  |
| `own-session`         | The target session record is the caller's own current session                                                                                                                                                                                                                                                                                                             |
| `own-account`         | The target session record belongs to the caller's own account, whether or not it is the current one                                                                                                                                                                                                                                                                       |
| `own`                 | The caller's account authored the target object                                                                                                                                                                                                                                                                                                                           |
| `own-upload`          | The upload record being completed was created by the caller's own session                                                                                                                                                                                                                                                                                                 |
| `own-invitation`      | The caller's account issued the invitation being revoked                                                                                                                                                                                                                                                                                                                  |
| `own-new-workspace`   | The workspace is the one the caller has just created and whose wizard has not yet been completed                                                                                                                                                                                                                                                                          |
| `self`                | The target record is the caller's own per-viewer record                                                                                                                                                                                                                                                                                                                   |
| `not-self`            | The target account is not the caller's own                                                                                                                                                                                                                                                                                                                                |
| `target-not-owner`    | The target account does not hold **Owner**                                                                                                                                                                                                                                                                                                                                |
| `not-last-owner`      | The change would not leave the workspace with no owner                                                                                                                                                                                                                                                                                                                    |
| `below-admin`         | The account type being granted or removed is **Member** or **Guest**; the operation can neither produce nor remove an **Admin** or an **Owner**                                                                                                                                                                                                                           |
| `not-owner-only`      | The setting is not in the owner-only class. Billing and payment details are in that class, which is the one narrowing the specification evidences (frame 672)                                                                                                                                                                                                             |
| `scoped-directory`    | The directory is projected to the channels and people the caller may already read, and is computed inside the authorized query rather than filtered afterwards                                                                                                                                                                                                            |
| `invite-policy`       | The workspace's invitation policy admits the caller's type, and where the policy requires administrator sign-off the invitation is issued only after it. Both halves are evidenced as configurable (`15-admin-workspace.md` L130, frame 576) and one captured state shows invitation restricted to owners and administrators (`01-onboarding-and-auth.md` L229, frame 52) |
| `channel-policy`      | The workspace's channel-creation policy admits the caller's type. That such a policy exists is evidenced only in general — the specification records five channel permissions administered centrally **without naming them** (`15-admin-workspace.md` L130, L745) — so which capabilities they cover is authored                                                          |
| `scope-member`        | The caller holds a membership row on **every** channel named in the invitation's scope, so nobody can scope an account into a channel they cannot themselves read                                                                                                                                                                                                         |
| `budget`              | The number of channels named in the scope is within the guest channel budget, unless the invitation carries the multi-channel allowance that lifts it                                                                                                                                                                                                                     |
| `member`              | The caller holds a membership row on the **specific target channel**                                                                                                                                                                                                                                                                                                      |
| `readable`            | The caller may read the specific target channel — every public channel of their workspace, plus any private channel they hold a membership row on                                                                                                                                                                                                                         |
| `public`              | The target channel is public in the caller's workspace                                                                                                                                                                                                                                                                                                                    |
| `writable`            | The target conversation accepts writes. An archived conversation does not: archiving changes what may be written and changes nothing about who may read (`02-channels.md` L444, L1041)                                                                                                                                                                                    |
| `target-in-workspace` | The account being added to a channel already belongs to the workspace. The specification states this as a scope statement rendered in the add-people modal, and the state contract is explicit that it is a statement and not a gate (`02-channels.md` L986, `21-states.md` L276)                                                                                         |
| `at-creation`         | The operation is part of the transaction that creates the channel, and is unavailable afterwards                                                                                                                                                                                                                                                                          |
| `both-conversations`  | The caller may read the source conversation **and** write the destination conversation, each checked separately against its own object                                                                                                                                                                                                                                    |
| `conversation-read`   | The caller may read the conversation the object belongs to                                                                                                                                                                                                                                                                                                                |
| `moderation`          | A distinct override capability, policed by its own policy and audited as an administrative action. It is never an implicit widening of the corresponding own-object policy                                                                                                                                                                                                |
| `re-checked`          | Authorization is evaluated again at the moment of delivery or execution, and is never inherited from an earlier evaluation                                                                                                                                                                                                                                                |

The `No session` column is not an account type. It is the absence of one, included so that
every operation carries a decision for the caller who has no session at all — which is the
extreme form of the non-member the denial suite must cover. In every group except
authentication and invitation acceptance it reads `deny`, because authentication precedes
authorization and a request without a session never reaches a policy.

### A — Authentication and session

| Operation                                   | No session              | Owner                | Admin                     | Member               | Guest, single channel | Guest, several channels | External collaborator |
| ------------------------------------------- | ----------------------- | -------------------- | ------------------------- | -------------------- | --------------------- | ----------------------- | --------------------- |
| Sign up with an email address               | `allow`                 | `allow: no-actor`    | `allow: no-actor`         | `allow: no-actor`    | `allow: no-actor`     | `allow: no-actor`       | `allow: no-actor`     |
| Verify an address with a one-time code      | `allow: code-match`     | `allow: no-actor`    | `allow: no-actor`         | `allow: no-actor`    | `allow: no-actor`     | `allow: no-actor`       | `allow: no-actor`     |
| Sign in with a password                     | `allow: credential`     | `allow: no-actor`    | `allow: no-actor`         | `allow: no-actor`    | `allow: no-actor`     | `allow: no-actor`       | `allow: no-actor`     |
| Sign in with an emailed one-time code       | `allow: code-match`     | `allow: no-actor`    | `allow: no-actor`         | `allow: no-actor`    | `allow: no-actor`     | `allow: no-actor`       | `allow: no-actor`     |
| Request a password reset                    | `allow`                 | `allow: no-actor`    | `allow: no-actor`         | `allow: no-actor`    | `allow: no-actor`     | `allow: no-actor`       | `allow: no-actor`     |
| Complete a password reset                   | `allow: reset-artifact` | `allow: no-actor`    | `allow: no-actor`         | `allow: no-actor`    | `allow: no-actor`     | `allow: no-actor`       | `allow: no-actor`     |
| Sign out of the current session             | `deny`                  | `allow: own-session` | `allow: own-session`      | `allow: own-session` | `allow: own-session`  | `allow: own-session`    | `allow: own-session`  |
| Revoke another session of one's own account | `deny`                  | `allow: own-account` | `allow: own-account`      | `allow: own-account` | `allow: own-account`  | `allow: own-account`    | `allow: own-account`  |
| Revoke a session of another account         | `deny`                  | `allow`              | `allow: target-not-owner` | `deny`               | `deny`                | `deny`                  | `deny`                |

Three notes the cells cannot carry.

- **The six pre-session rows are not role-decidable, and saying so is the point.** They
  are the operations that establish an actor, so there is no actor to evaluate. Marking
  them `allow: no-actor` rather than leaving them out records that the matrix was consulted
  and found inapplicable, which is a different fact from an operation nobody considered.
- **Reset request never discloses whether an address exists.** The response is identical
  either way. That is not an authorization decision, which is why it appears here and not
  as a cell value.
- **Revoking another account's session is the workspace's only session-level
  intervention in Phase 1.** It exists because de-authorization must be _possible_ for the
  de-authorized-caller case to be testable at all.

### B — Workspace

| Operation                            | No session | Owner                      | Admin                     | Member  | Guest, single channel     | Guest, several channels   | External collaborator |
| ------------------------------------ | ---------- | -------------------------- | ------------------------- | ------- | ------------------------- | ------------------------- | --------------------- |
| Create a workspace                   | `deny`     | `allow`                    | `allow`                   | `allow` | `deny`                    | `deny`                    | `deny`                |
| Complete the setup wizard            | `deny`     | `allow: own-new-workspace` | `deny`                    | `deny`  | `deny`                    | `deny`                    | `deny`                |
| Rename the workspace                 | `deny`     | `allow`                    | `allow`                   | `deny`  | `deny`                    | `deny`                    | `deny`                |
| Change a workspace setting           | `deny`     | `allow`                    | `allow: not-owner-only`   | `deny`  | `deny`                    | `deny`                    | `deny`                |
| View the workspace member directory  | `deny`     | `allow`                    | `allow`                   | `allow` | `allow: scoped-directory` | `allow: scoped-directory` | `deny`                |
| Change an account's type             | `deny`     | `allow: not-last-owner`    | `allow: below-admin`      | `deny`  | `deny`                    | `deny`                    | `deny`                |
| Remove an account from the workspace | `deny`     | `allow: not-last-owner`    | `allow: target-not-owner` | `deny`  | `deny`                    | `deny`                    | `deny`                |

- **Creating a workspace is the one operation with no workspace target**, so it is decided
  against the account rather than against a membership. A guest-scoped or externally-scoped
  account is denied: their standing exists inside somebody else's workspace, and letting it
  mint a workspace where they would immediately hold Owner is a larger grant than anything
  their invitation expressed. The account can of course be invited elsewhere as a member;
  what is denied is the escalation, not the person.
- **The directory a guest reaches is a projection**, which is why the cell carries a
  condition rather than a plain allow. The specification's guest description includes a
  directory (`01-onboarding-and-auth.md` L271); it does not say the workspace directory,
  and a full directory would disclose every account and every private channel membership to
  an account scoped to one channel.

### C — Invitation

| Operation                                 | No session                | Owner                         | Admin                         | Member                                       | Guest, single channel     | Guest, several channels   | External collaborator     |
| ----------------------------------------- | ------------------------- | ----------------------------- | ----------------------------- | -------------------------------------------- | ------------------------- | ------------------------- | ------------------------- |
| Invite a member                           | `deny`                    | `allow`                       | `allow`                       | `allow: invite-policy`                       | `deny`                    | `deny`                    | `deny`                    |
| Invite a guest with a channel scope       | `deny`                    | `allow: scope-member, budget` | `allow: scope-member, budget` | `allow: invite-policy, scope-member, budget` | `deny`                    | `deny`                    | `deny`                    |
| Attach a note to an invitation            | `deny`                    | `allow`                       | `allow`                       | `allow: invite-policy`                       | `deny`                    | `deny`                    | `deny`                    |
| Issue or copy a shareable invitation link | `deny`                    | `allow`                       | `allow`                       | `allow: invite-policy`                       | `deny`                    | `deny`                    | `deny`                    |
| Revoke a pending invitation               | `deny`                    | `allow`                       | `allow`                       | `allow: own-invitation`                      | `deny`                    | `deny`                    | `deny`                    |
| Accept an invitation                      | `allow: invitation-valid` | `allow: invitation-valid`     | `allow: invitation-valid`     | `allow: invitation-valid`                    | `allow: invitation-valid` | `allow: invitation-valid` | `allow: invitation-valid` |

- **Invitation is the one capability the specification evidences as configurable**, and
  both of its configurable halves are honoured: whether an account type may invite at all,
  and whether an invitation it issues requires administrator sign-off before it is issued
  (`15-admin-workspace.md` L130, frame 576). One captured state shows the restricted
  setting in force, with invitation confined to owners and administrators
  (`01-onboarding-and-auth.md` L229, frame 52). The default is the permissive one the
  permissions surface describes, so a member may invite until the workspace says otherwise —
  and the mechanism exists either way, which is what the uncertainty rule requires of a
  value read from a surface.
- **A note is not a separate capability from issuing.** Whoever may issue may attach the
  note; the field is present in both invitation forms
  (`01-onboarding-and-auth.md` L272). It is listed as its own row because the guard's
  operation union is exhaustive and the note is a distinct write on the invitation record,
  not because a different type may perform it.
- **Acceptance is decided against the invitation, never against the caller's standing
  elsewhere.** The row is the clearest illustration of the caller-supplied-identifier
  prohibition: an accepting caller frequently holds a session in some _other_ workspace, and
  that session's type must contribute nothing to the decision. What is evaluated is the
  presented invitation and, if there is one, the authenticated account it names.
- **The link's lifetime is not decided here.** It is a configured absolute deadline
  resolved at issuance, recorded once at `docs/decisions/observed-values.md`.

### D — Channel lifecycle

| Operation                    | No session | Owner             | Admin             | Member                  | Guest, single channel | Guest, several channels | External collaborator |
| ---------------------------- | ---------- | ----------------- | ----------------- | ----------------------- | --------------------- | ----------------------- | --------------------- |
| Create a channel             | `deny`     | `allow`           | `allow`           | `allow: channel-policy` | `deny`                | `deny`                  | `deny`                |
| Rename a channel             | `deny`     | `allow: readable` | `allow: readable` | `allow: member`         | `deny`                | `deny`                  | `deny`                |
| Edit a channel's topic       | `deny`     | `allow: readable` | `allow: readable` | `allow: member`         | `deny`                | `deny`                  | `deny`                |
| Edit a channel's description | `deny`     | `allow: readable` | `allow: readable` | `allow: member`         | `deny`                | `deny`                  | `deny`                |
| Convert a channel to private | `deny`     | `allow: readable` | `allow: readable` | `allow: member`         | `deny`                | `deny`                  | `deny`                |
| Archive a channel            | `deny`     | `allow: readable` | `allow: readable` | `allow: member`         | `deny`                | `deny`                  | `deny`                |
| Unarchive a channel          | `deny`     | `allow: readable` | `allow: readable` | `allow: member`         | `deny`                | `deny`                  | `deny`                |
| Delete a channel             | `deny`     | `allow: readable` | `allow: readable` | `deny`                  | `deny`                | `deny`                  | `deny`                |

- **`readable` rather than `member` for the two workspace-administration types** so that
  administering a public channel does not require joining it, while a private channel a
  workspace administrator cannot read stays out of reach. The second half matters more than
  the first: it is what stops workspace administration becoming a back door through the
  invisibility rule.
- **Deletion is the one lifecycle row a member is denied.** Every other row in this group
  has a return trip. Conversion inverts — the specification records it as destructive
  though nothing is deleted, and reversible, with the same row offering the return
  (`02-channels.md` L322). Archival is undone by unarchival, which the archived surface
  offers directly (`02-channels.md` L1014). Deletion has none, so it is held to the two
  types whose standing is the whole workspace.
- **Archiving is a write capability and not a read capability.** The specification is
  explicit that archiving changes what may be written and changes nothing about who may
  read, and that a private channel that is archived stays private
  (`02-channels.md` L444, L1041). Nothing in this group grants or withdraws a read.

### E — Channel membership

| Operation                                       | No session | Owner                                | Admin                                | Member                                      | Guest, single channel | Guest, several channels | External collaborator |
| ----------------------------------------------- | ---------- | ------------------------------------ | ------------------------------------ | ------------------------------------------- | --------------------- | ----------------------- | --------------------- |
| Join a public channel                           | `deny`     | `allow: public`                      | `allow: public`                      | `allow: public`                             | `deny`                | `deny`                  | `deny`                |
| Leave a channel                                 | `deny`     | `allow: member`                      | `allow: member`                      | `allow: member`                             | `allow: member`       | `allow: member`         | `allow: member`       |
| Add another account to a channel                | `deny`     | `allow: member, target-in-workspace` | `allow: member, target-in-workspace` | `allow: member, target-in-workspace`        | `deny`                | `deny`                  | `deny`                |
| Remove another account from a channel           | `deny`     | `allow: member, not-self`            | `allow: member, not-self`            | `allow: member, not-self, target-not-owner` | `deny`                | `deny`                  | `deny`                |
| Add every current workspace account at creation | `deny`     | `allow: at-creation`                 | `allow: at-creation`                 | `allow: at-creation`                        | `deny`                | `deny`                  | `deny`                |
| Set the standing add-on-join flag for a channel | `deny`     | `allow: readable`                    | `allow: readable`                    | `deny`                                      | `deny`                | `deny`                  | `deny`                |

- **The last two rows are two operations, not one, and merging them loses the only
  frame-evidenced capability in this record.** The add-people modal offers a radio pair —
  add every current workspace account, or add specific people — and separately renders a
  standing flag that adds anyone who _later_ joins the workspace. The radio pair carries no
  gating annotation; the standing flag is annotated as administrator-only and is described
  as workspace-scoped (`02-channels.md` L803, L921, L986). A build that treats them as one
  control either gates a bulk add that was never gated, or leaves ungated the one control
  the specification shows gated.
- **Nobody removes themselves from a channel through the remove path.** The specification
  records that the acting person's own row carries no remove control, so self-removal cannot
  be started from there (`02-channels.md` L307); leaving is the path. The `not-self`
  condition makes that a server rule rather than a rendering.
- **A guest cannot join, add or remove.** Their scope is set by the invitation that created
  them, and self-joining would let a single-channel guest widen their own scope — the exact
  budget the channel-limit decision exists to hold. Leaving remains open to them, because
  narrowing one's own scope grants nothing.

### F — Channel personalisation

| Operation                                 | No session | Owner           | Admin           | Member          | Guest, single channel | Guest, several channels | External collaborator |
| ----------------------------------------- | ---------- | --------------- | --------------- | --------------- | --------------------- | ----------------------- | --------------------- |
| Set a per-channel notification preference | `deny`     | `allow: member` | `allow: member` | `allow: member` | `allow: member`       | `allow: member`         | `allow: member`       |
| Mute a channel                            | `deny`     | `allow: member` | `allow: member` | `allow: member` | `allow: member`       | `allow: member`         | `allow: member`       |
| Star a channel                            | `deny`     | `allow: member` | `allow: member` | `allow: member` | `allow: member`       | `allow: member`         | `allow: member`       |
| Add a bookmark to a channel               | `deny`     | `allow: member` | `allow: member` | `allow: member` | `deny`                | `deny`                  | `deny`                |
| Create a bookmark folder in a channel     | `deny`     | `allow: member` | `allow: member` | `allow: member` | `deny`                | `deny`                  | `deny`                |

This group contains the record's one deliberate split within a single surface, and it is
worth stating because the two halves look alike and are governed differently.

- **The first three rows write the caller's own per-viewer record**, so every type that can
  read the channel can hold them. Denying a guest their own mute setting would be an
  asymmetry with no purpose: the row it writes is theirs, is invisible to everyone else, and
  the schema places it on the viewer's relation precisely so it cannot become a fact about
  the conversation (`docs/decisions/data-model.md`).
- **The last two rows write shared channel state.** A bookmark changes a surface every
  member of the channel sees. A guest's standing is participation in the conversation, not
  curation of it, so the shared-state rows stop at the three workspace types.
- **Options considered for the shared-state rows.** Allow every channel member including
  guests, mirroring the send capability — rejected, because it grants an externally-scoped
  or narrowly-scoped account authority over what every member sees. Restrict to the two
  administration types — rejected as narrower than the adjacent evidence, since the
  bookmark affordance is reached from the conversation header by an ordinary session with no
  gating annotation anywhere in its capture. Channel members excluding guests and external
  collaborators — chosen, as the smallest coherent behaviour that keeps curation inside the
  workspace.

### G — Messaging

| Operation                        | No session | Owner                                 | Admin                                 | Member                                | Guest, single channel                 | Guest, several channels               | External collaborator                 |
| -------------------------------- | ---------- | ------------------------------------- | ------------------------------------- | ------------------------------------- | ------------------------------------- | ------------------------------------- | ------------------------------------- |
| Send a message                   | `deny`     | `allow: member, writable`             | `allow: member, writable`             | `allow: member, writable`             | `allow: member, writable`             | `allow: member, writable`             | `allow: member, writable`             |
| Edit one's own message           | `deny`     | `allow: own, writable`                | `allow: own, writable`                | `allow: own, writable`                | `allow: own, writable`                | `allow: own, writable`                | `allow: own, writable`                |
| Edit another account's message   | `deny`     | `deny`                                | `deny`                                | `deny`                                | `deny`                                | `deny`                                | `deny`                                |
| Delete one's own message         | `deny`     | `allow: own, writable`                | `allow: own, writable`                | `allow: own, writable`                | `allow: own, writable`                | `allow: own, writable`                | `allow: own, writable`                |
| Delete another account's message | `deny`     | `allow: moderation`                   | `allow: moderation`                   | `deny`                                | `deny`                                | `deny`                                | `deny`                                |
| Pin a message                    | `deny`     | `allow: member`                       | `allow: member`                       | `allow: member`                       | `deny`                                | `deny`                                | `deny`                                |
| Unpin a message                  | `deny`     | `allow: member`                       | `allow: member`                       | `allow: member`                       | `deny`                                | `deny`                                | `deny`                                |
| Forward a message                | `deny`     | `allow: both-conversations`           | `allow: both-conversations`           | `allow: both-conversations`           | `allow: both-conversations`           | `allow: both-conversations`           | `allow: both-conversations`           |
| Schedule a message               | `deny`     | `allow: member, writable, re-checked` | `allow: member, writable, re-checked` | `allow: member, writable, re-checked` | `allow: member, writable, re-checked` | `allow: member, writable, re-checked` | `allow: member, writable, re-checked` |
| Create a snippet                 | `deny`     | `allow: member, writable`             | `allow: member, writable`             | `allow: member, writable`             | `allow: member, writable`             | `allow: member, writable`             | `allow: member, writable`             |

- **Sending is authorized before the send is accepted**, against the target conversation,
  and the composer's presence is not evidence that no check is required. The specification
  says both, and adds the observation that makes the `writable` condition concrete: an
  archived channel replaces the composer entirely, which shows the surface tracking
  writability rather than authorization being unnecessary
  (`03-messaging-and-composer.md` L126, L804).
- **Scheduling is authorized twice.** Once when the schedule is created, and again at
  delivery, because everything the first check relied on can change in between — the
  channel can be archived, the membership can be removed, the guest's expiry can pass. A
  scheduled message that delivers on a stale authorization is a delayed authorization
  failure, which is the same failure with a worse audit trail.
- **Forwarding is two checks against two objects.** Read on the source, write on the
  destination, each evaluated against its own object. It is the row that most directly
  illustrates why the guard takes a target object rather than an operation name.

### H — Reactions

| Operation                         | No session | Owner                     | Admin                     | Member                    | Guest, single channel     | Guest, several channels   | External collaborator     |
| --------------------------------- | ---------- | ------------------------- | ------------------------- | ------------------------- | ------------------------- | ------------------------- | ------------------------- |
| Add a reaction                    | `deny`     | `allow: member, writable` | `allow: member, writable` | `allow: member, writable` | `allow: member, writable` | `allow: member, writable` | `allow: member, writable` |
| Remove one's own reaction         | `deny`     | `allow: own, writable`    | `allow: own, writable`    | `allow: own, writable`    | `allow: own, writable`    | `allow: own, writable`    | `allow: own, writable`    |
| Remove another account's reaction | `deny`     | `deny`                    | `deny`                    | `deny`                    | `deny`                    | `deny`                    | `deny`                    |

A reaction is an attributed act by one account, so removing somebody else's is denied to
every type including the two administration types. Deleting a message removes the reactions
attached to it as a **consequence** of deleting the message, which is a different
capability with a different row and a different audit record; it is not a route to the
denied one.

### I — Files

| Operation          | No session | Owner                      | Admin                      | Member                     | Guest, single channel      | Guest, several channels    | External collaborator      |
| ------------------ | ---------- | -------------------------- | -------------------------- | -------------------------- | -------------------------- | -------------------------- | -------------------------- |
| Initiate an upload | `deny`     | `allow: member, writable`  | `allow: member, writable`  | `allow: member, writable`  | `allow: member, writable`  | `allow: member, writable`  | `allow: member, writable`  |
| Complete an upload | `deny`     | `allow: own-upload`        | `allow: own-upload`        | `allow: own-upload`        | `allow: own-upload`        | `allow: own-upload`        | `allow: own-upload`        |
| View a file        | `deny`     | `allow: conversation-read` | `allow: conversation-read` | `allow: conversation-read` | `allow: conversation-read` | `allow: conversation-read` | `allow: conversation-read` |

A file inherits the authorization of the conversation it was shared into, and the inventory
that lists files is a projection computed over the viewer's authorized set
(`02-channels.md` L954, L1040). Bytes never transit the server, so viewing is authorized at
the moment the short-lived address is issued rather than when it is used, and an issued
address is therefore scoped and brief rather than a standing grant.

### J — Preferences

| Operation                          | No session | Owner         | Admin         | Member        | Guest, single channel | Guest, several channels | External collaborator |
| ---------------------------------- | ---------- | ------------- | ------------- | ------------- | --------------------- | ----------------------- | --------------------- |
| Read one's own preferences         | `deny`     | `allow: self` | `allow: self` | `allow: self` | `allow: self`         | `allow: self`           | `allow: self`         |
| Write one's own preferences        | `deny`     | `allow: self` | `allow: self` | `allow: self` | `allow: self`         | `allow: self`           | `allow: self`         |
| Read another account's preferences | `deny`     | `deny`        | `deny`        | `deny`        | `deny`                | `deny`                  | `deny`                |

No account type reads another account's preferences, owners and admins included. A
preference record is per-viewer state — a dismissed banner is recorded on the viewer's own
record and never on the object dismissed — and an administrator with a legitimate need to
know what happened reads the audit log, which records acts rather than settings.

### K — Realtime

| Operation                          | No session | Owner                                  | Admin                                  | Member                                 | Guest, single channel                  | Guest, several channels                | External collaborator                  |
| ---------------------------------- | ---------- | -------------------------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| Subscribe to a conversation topic  | `deny`     | `allow: conversation-read`             | `allow: conversation-read`             | `allow: conversation-read`             | `allow: conversation-read`             | `allow: conversation-read`             | `allow: conversation-read`             |
| Receive fan-out for a conversation | `deny`     | `allow: conversation-read, re-checked` | `allow: conversation-read, re-checked` | `allow: conversation-read, re-checked` | `allow: conversation-read, re-checked` | `allow: conversation-read, re-checked` | `allow: conversation-read, re-checked` |

The second row is the de-authorized caller's row. A subscription is established once and
lives for as long as the connection does, while membership is revocable at any moment, so a
socket authorized at subscribe time is a socket authorized against a fact that has since
expired. Authorization is therefore evaluated **again on every fan-out**, and the
subscription is treated as a routing hint rather than a grant. The envelope this travels in,
the replay window and the reconnect behaviour belong to
`docs/decisions/realtime-contract.md`.

## The rules that cut across the matrix

Four rules are stated as rules because they are not properties of a single row. Each is
enforceable, and each is enforced in the policy rather than in the surface.

### Guest scoping

A guest may act only within the channels their invitation scoped them to, and **every**
operation in their columns is evaluated against the **specific target channel** rather than
against the workspace. There is no such thing as a guest capability that holds
workspace-wide.

This is why the guest's scope is defined above as a _set of channels_ rather than as a
reduced membership. A reduced membership is a single fact that a policy can accidentally
satisfy once and reuse; a set is a fact that has to be tested against the object in hand
every time. The two forms differ only in the size of that set, and the budget that bounds
it — one channel by default, lifted by the allowance the invitation carries — is settled at
`docs/decisions/observed-values.md` and enforced at the point a guest is scoped to a further
channel.

The evidence that the scope exists is the invitation form itself: choosing the guest role
makes channel scope a required field and introduces a separate allowance for more than one
channel (`01-onboarding-and-auth.md` L272, L281, L818, L819). The evidence for what a guest
may do inside that scope is absent, and this record's answer — full participation, no
curation, no administration — is authored.

### Members-only add

Adding an account to a channel is available to **members of that channel**, not to
arbitrary accounts of the workspace. The actor must hold a membership row on the target
channel; holding one on the workspace is not the same fact and does not substitute.

A second constraint sits beside it and is often confused with it, so both are stated
separately:

| Constraint           | Who it constrains | Status                                                                                                                                                                                                                                                                                          |
| -------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Members-only add     | The **actor**     | **Authored.** No frame shows who may add. Chosen as the smallest coherent behaviour: within the add-people modal exactly one control carries a gating annotation, so the rest of that modal is not administration-only, and the actor is a channel member because that is who reaches the modal |
| Already-in-workspace | The **target**    | **Evidenced.** The modal states that only accounts already in the workspace may be added, and the state contract records that this statement is a scope statement and not a gate (`02-channels.md` L986, `21-states.md` L276) — so the server enforces it and the notice merely explains it     |

Both are conditions on the same row and both are checked. Enforcing only the second would
let any account of the workspace add anybody to any channel they can see; enforcing only
the first would let a channel member pull in an account that does not belong to the
workspace at all.

### Administrator-only add-on-join

Setting the standing flag that adds accounts to a channel as they join the workspace is an
administration capability, held by Owner and Admin and denied to every other type. It is
the **one capability in this record with direct frame evidence**: the flag is described as
workspace-scoped and administrator-only, and the surface annotates it as visible only to
administrators (`02-channels.md` L759, L803, L921, L986).

**The presentation and the enforcement are separate things, and this is the row where the
distinction is observable.** Role gating in this product **hides nothing and disables
nothing**: the gated control sits inside a bordered container whose inset caption, led by an
eye-with-slash glyph, names the role that can see the setting, and the control inside
renders in its ordinary off position while the enclosing modal's primary action stays a
filled primary (`21-states.md` L137, L276, L574, frame 75).

That rendering is the strongest available argument for this whole record. A gate that leaves
its control usable is a gate that was never in the client to begin with. The server check on
this row is therefore unconditional and identical for a caller whose client never rendered
the container at all.

Two adjacent presentations must not be merged into it. The specification distinguishes four
states that look alike and mean different things — permission-denied is a device capability
the product cannot grant itself, role-gated is a control the signed-in type may not use,
upgrade-gated is a capability the plan does not include, and disabled is a control whose own
precondition is unmet (`21-states.md` L111). Only the second is an authorization decision.
The third and fourth in particular must never be implemented by reusing an authorization
denial, because a denial is audited as an authorization event and an unmet precondition is
not one.

### Own versus another's

Editing and deleting split on **authorship**, not on seniority. `own` is a fact about the
target object and the acting account, and it is evaluated against the resolved object.

Where an override exists it is a **distinct capability row** with its own policy, its own
cell values and its own audit classification — never an implicit widening of the own-object
policy. This record grants exactly one such override, and the asymmetry is deliberate:

| Operation                         | Override                | Reasoning                                                                                                                                                                           |
| --------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delete another account's message  | Granted to Owner, Admin | Removal is a moderation need a workspace genuinely has, the content is gone rather than altered, and the act is recorded as an administrative action with its actor                 |
| Edit another account's message    | **Granted to nobody**   | Editing changes words that stay attributed to their author. An override here would let one account put text under another's name, which is a different kind of act from removing it |
| Remove another account's reaction | **Granted to nobody**   | A reaction is an attributed act with no moderation surface in Phase 1, so the smallest coherent behaviour is a universal denial                                                     |

The specification is silent on all three, and says so: pin, edit and delete are observed on
the acting person's own message, and "whether they are offered on another person's is not
captured" (`03-messaging-and-composer.md` L432). The silence is recorded here rather than
resolved by inference from a rendering, and the three decisions above are authored.

## The private-resource invisibility rule

**The rule.** A private channel a viewer is not a member of is **absent** from every
projection. Not rendered as inaccessible. Not shown greyed. Not shown with its name and a
lock. Not counted. Absent.

The specification states it in the same terms and names the place an implementation leaks:
the channel browser's type filter includes a private option, "which is exactly where an
unscoped implementation leaks: a private channel must not appear in a browser, a count, a
facet or a search result for a viewer who may not read it"
(`02-channels.md` L954, and again as an acceptance criterion at L1040). The general form is
the read-side contract's: a projection is computed **after** the viewer's read
authorization is applied to the containing object, inside the data-access path, before
anything is serialised — so unauthorized rows are never fetched, never serialised and never
sent, and filtering after the fact is not authorization at all
(`00-product-overview.md` L508, L510).

Absence is a stronger requirement than refusal, and the difference is the whole point. A
refusal answers the question. "You may not open this channel" tells the asker that the
channel exists, which for a private channel is most of what was being protected. There is no
authorization error to render, because there is nothing to render an error about.

### The eight projections

Eight projections, in the order the authorization rule lists them. For each: what the read
path must do, and what the leak would look like if it did not — because the leak is what
makes the test writable.

| #   | Projection                   | Required behaviour for a channel the viewer may not read                                                                                                                             | What the leak looks like if it is missed                                                                                                                                                                                                                                                                      |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Counts**                   | Every total, badge, per-type tab count and unread figure is computed **inside** the authorized query, so the channel contributes nothing to any of them                              | A number that is one larger than the viewer's authorized set. No body text appears and the disclosure is still complete: the existence of a channel, and often its activity level, is inferable from a count alone                                                                                            |
| 2   | **Search results**           | The channel and its messages are outside the query's corpus. The browser and its facets are search paths and are governed by this row                                                | A hit the viewer cannot open, or a facet with a count beside a name they may not read. The browser is the specific case the specification calls out (`02-channels.md` L954)                                                                                                                                   |
| 3   | **Link previews**            | No preview is generated. Nothing about the destination — name, purpose, member count, message excerpt — is rendered beside the address                                               | Preview text that names the channel. Worse than a resolution failure, because a preview is rendered without the viewer doing anything, and stored preview text survives the revocation that should have removed it                                                                                            |
| 4   | **Link resolution**          | Following the address re-authorizes against the **follower's current** authorization and resolves to nothing. A shared, copied or forwarded address is re-checked, never trusted     | An address that escaped its audience becoming a working key. This is the row that makes revocation real: the specification states that a link is a projection at resolution time and that a revoked grant stops resolving (`00-product-overview.md` L512)                                                     |
| 5   | **Member lists**             | The channel's membership is unlistable, and the accounts in it are not disclosed **as members of it** anywhere else                                                                  | A members tab, an export, or a people surface that reveals who is in a channel the viewer cannot see. The membership relation is itself the authorization predicate, so a leak here is a leak of the predicate (`docs/decisions/data-model.md`)                                                               |
| 6   | **Facepiles**                | No avatar row is rendered for the channel, and no cached avatar list survives the loss of access                                                                                     | A row of faces that answers "who is in there" without a single word of text. A facepile is a bounded member list, so it inherits row 5's authorization rather than reimplementing it — and a denormalized copy of it is a cache keyed by object identity, which serves one viewer's authorized set to another |
| 7   | **Autocomplete suggestions** | Mention and command typeahead is computed from membership plus the workspace key on every request; the channel never appears as a suggestion                                         | The most corrosive leak of the eight, because it discloses one keystroke at a time and looks like a feature working. A suggestion row confirms both existence and membership before anything has been submitted                                                                                               |
| 8   | **Notifications**            | No notification about the channel's activity is ever dispatched to the viewer, and any payload carries a reference and the minimum needed to route the recipient rather than content | Activity disclosed **outside the product**, where no later check can reach it. A notification that has left cannot be recalled or re-authorized, which is why it is the one row where a mistake is permanent                                                                                                  |

**The browser and the facets are not a ninth projection.** The specification names them
explicitly (`02-channels.md` L954, L1040) and they are mapped onto row 2, because the
authorization rule's list is closed at eight and inventing a ninth would leave a reader
unsure which enumeration is authoritative. What matters is that they are covered, and they
are.

### Each check is independent

Each of the eight is authorized **independently**, through
`apps/api/src/authz/projection-guard.ts`. Sharing one check across projections is precisely
the failure mode the rule is written against, and the reason is structural rather than
stylistic: **each projection leaves the product by a different route.** A count leaves as a
number, a search result as a row, a preview as text rendered beside an address, a resolution
as a redirect, a member list as an enumeration, a facepile as a cached list, a suggestion as
a typeahead row, and a notification as a message that has already gone. A single check
placed on one of those routes protects that route and nothing else, while looking — in a
code review and in a passing test — as though it protected all eight.

Beneath all eight sits workspace isolation, and it sits **below every caller** rather than
at each call site: a database-client extension spanning all models and all operations, bound
to the authenticated session. The shapes in the schema that make each projection
authorizable at all — the read cursor rather than a stored counter, the membership relation
that is itself the predicate, the link stored as a display text and a destination — are
explained in `docs/decisions/data-model.md` and are not repeated here.

### The realtime corollary

Subscribe-time authorization is **not sufficient on its own.** Membership can change
mid-session: a viewer removed from a private channel while holding an open socket was
authorized when they subscribed and is not authorized now. Authorization is therefore
**re-checked on fan-out**, every time, and the subscription is a routing hint rather than a
grant. The socket envelope, the replay window and the reconnect behaviour are specified in
`docs/decisions/realtime-contract.md`.

The same corollary applies to anything else that holds a decision over time. A scheduled
message is re-authorized at delivery. A pre-signed address is issued briefly rather than
standing. Every one of these is the fan-out problem with a different clock.

## Two statements this record makes without qualification

### A hidden, disabled or absent control exempts nothing

Client rendering is never evidence of permission. Removing a control, hiding it, disabling
it, greying it, badging it, or never rendering it at all is a decision about pixels, and
none of those decisions refuses a request. A control that was hidden must still be refused
when its request arrives, because the request does not carry the rendering that omitted it —
so a build that gates only in the client is to be read as a build with no gate
(`00-product-overview.md` L502).

Three consequences for how this record is read:

- **No cell above may be justified by "the surface does not offer it."** Every `deny` is a
  server decision, and every one of them is reachable by a request that the client would
  never have made.
- **A precondition is not a grant.** Where a flow's precondition in the specification says
  only that a surface was reachable, that records what a capture showed and says nothing
  about who may act (`00-product-overview.md` L502). Reachability, an unmet field
  requirement, a disabled submit control and an incomplete wizard step are all
  preconditions. Each can be satisfied without any authorization question having been asked,
  let alone answered, so no cell above may be justified by one.
- **A confirmation is not an authorization.** A destructive operation is additionally
  confirmed, and the confirmation is a second signal of intent
  (`00-product-overview.md` L502). The rows in group D that carry confirmations are decided
  by their cells, not by the dialog.

### No decision rests on a caller-supplied workspace or actor identifier

The acting workspace and the acting account come from the **session**, and from nothing
else. No route parameter, request body, query string, header, cookie other than the session
cookie, or socket frame may contribute either value to an authorization decision — not as a
primary input, not as a hint, and not as a fallback when the session is ambiguous.

The prohibition is honoured by making the value **unreadable from a request in the first
place**, which is the only form of it that does not depend on review. The workspace is bound
from the authenticated session by `apps/api/src/db/tenancy.ts` and injected beneath every
query by the client extension in `packages/db/src/tenancy.ts`; the acting account comes from
the session record. A handler that wanted to honour a caller-supplied workspace would have
nowhere to put it.

Two rows above exist partly to make the prohibition concrete. **Accept an invitation** is
decided against the presented invitation and the authenticated account, never against the
type the caller holds in some other workspace — a caller accepting an invitation very often
holds a session elsewhere, and that session's standing must contribute nothing.
**Create a workspace** has no workspace target at all, so it is decided against the account;
it is the one row where the absence of a workspace is the answer rather than a problem.

## The authored decisions

Every cell in this record is an authored decision, because no frame carries a capability
assignment. Recording sixty-two rows individually would bury the reasoning, so the
decisions are grouped by the judgement they turn on: each entry below states the options
considered, the choice, and why — which is what the uncertainty rule requires of a decision
taken where the specification is silent. Where the specification _does_ say something, the
citation is given and the decision is described as constrained rather than free.

The standing preference throughout is the rule's own: **the smallest coherent behaviour
consistent with adjacent evidenced behaviour.** "Smallest" is not the same as "most
restrictive" — a denial that contradicts adjacent evidence is not small, it is wrong — so
each entry names the adjacent evidence it stayed consistent with.

| #   | Decision                                                                      | Options considered                                                                                                                               | Choice and rationale                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Five account types, named as the specification's prose names them             | (a) Invent an authored vocabulary. (b) Use the five the prose names. (c) Define only the three the Phase-1 areas exercise                        | **(b).** The prose names exactly five (`15-admin-workspace.md` L754), so inventing a sixth vocabulary would add a translation layer for no gain, and (c) would leave the guest and external columns undefined — which is where most denials live                                                                                                                                                                                  |
| 2   | The matrix is a total function, not a rank                                    | (a) Numeric rank with comparisons. (b) Hierarchy for the three workspace types plus special cases. (c) Total function with named conditions      | **(c).** A rank cannot express that a single-channel guest may post where a non-member workspace account may not. Set out in full under [The ordering relationship](#the-ordering-relationship-and-where-it-stops)                                                                                                                                                                                                                |
| 3   | Guest and external columns bounded by an absolute expiry                      | (a) Store a duration and compute. (b) Store an absolute timestamp on the record. (c) Treat expiry as a background job's concern                  | **(b).** The specification states expiry semantics for a guest account (`01-onboarding-and-auth.md` L272, L820) and the uncertainty rule requires an absolute timestamp so a changed default never moves an issued record. (c) would leave an expired account authorized until a job ran                                                                                                                                          |
| 4   | Deletion of a channel restricted to Owner and Admin                           | (a) Any channel member, mirroring archive. (b) Owner and Admin. (c) Owner only                                                                   | **(b).** Every other lifecycle row has a return trip — conversion inverts (`02-channels.md` L322) and archival is undone from the archived surface (`02-channels.md` L1014) — and deletion has none. (c) was rejected as narrower than the adjacent evidence, which puts delete in the same settings surface as archive                                                                                                           |
| 5   | Rename, topic, description, convert, archive, unarchive open to a member      | (a) Administration types only. (b) Channel members. (c) Channel creator only                                                                     | **(b).** The specification's own inventory of gated presentations in this area names exactly one control (`02-channels.md` L759, L921), and none of these rows is in it, while the one control that _is_ gated is annotated unmistakably. Gating what the inventory leaves ungated would contradict the only gating evidence available                                                                                            |
| 6   | Administration types act on a channel they can **read**, not one they joined  | (a) Require membership uniformly. (b) Allow on any readable channel. (c) Allow on any channel in the workspace                                   | **(b).** (c) is the dangerous one: it would make workspace administration a route around the invisibility rule, letting an administrator act on — and thereby learn of — a private channel they cannot read. (a) would force administrators to join public channels to administer them, which manufactures memberships                                                                                                            |
| 7   | Members-only add for the actor                                                | (a) Any workspace account. (b) Channel members. (c) Administration types only                                                                    | **(b).** The add-people modal is reached from inside a channel, and exactly one control in it is annotated administration-only while a second statement in the same modal is recorded as a scope statement and not a gate (`02-channels.md` L986, `21-states.md` L276), so the rest of the modal is not gated. (a) would let any account add anybody to any channel they can see; (c) would gate what the evidence leaves ungated |
| 8   | Guests may not join, add or remove                                            | (a) Mirror member capabilities inside scope. (b) Deny all three. (c) Allow adding within scope                                                   | **(b).** Self-joining would let a guest widen their own scope, which is the budget the channel limit exists to hold (`docs/decisions/observed-values.md`); adding and removing are administration of a set they do not own. Leaving stays open, because narrowing one's own scope grants nothing                                                                                                                                  |
| 9   | Guests and external collaborators may not curate — no bookmarks, no pins      | (a) Any channel member may curate. (b) Workspace types only. (c) Administration types only                                                       | **(b).** Curation changes a surface every member sees, and an account admitted to one conversation should not reshape it for everyone. (c) was rejected because the bookmark affordance is not in the area's inventory of gated presentations (`02-channels.md` L759)                                                                                                                                                             |
| 10  | Editing another account's message is denied to everyone                       | (a) Administration override. (b) Universal denial. (c) Author-only with an audited administration override                                       | **(b).** The specification records that whether these are offered on another person's message "is not captured" (`03-messaging-and-composer.md` L432), so there is nothing to widen from. Editing leaves text attributed to an author who did not write it, which is categorically unlike removing it                                                                                                                             |
| 11  | Deleting another account's message is an audited override for Owner and Admin | (a) Universal denial. (b) Override for the administration types. (c) Channel members may delete in their channel                                 | **(b).** Moderation is a need a workspace genuinely has and the act removes rather than alters. It is a **separate row with its own policy**, never a widening of the own-message rule, and it is audited as an administrative action (`docs/decisions/data-model.md`)                                                                                                                                                            |
| 12  | Removing another account's reaction is denied to everyone                     | (a) Administration override. (b) Universal denial                                                                                                | **(b).** Smallest coherent behaviour: a reaction is an attributed act, Phase 1 opens no moderation surface for reactions, and message deletion already removes attached reactions as a consequence of a different capability                                                                                                                                                                                                      |
| 13  | Invitation is policy-governed rather than fixed                               | (a) Fix it to the administration types. (b) Fix it to every workspace account. (c) Implement the configurable policy with the permissive default | **(c).** This is the one capability the specification evidences as configurable, in both halves — who may invite, and whether sign-off is required (`15-admin-workspace.md` L130, frame 576) — and it evidences the restricted state in force (`01-onboarding-and-auth.md` L229, frame 52). The uncertainty rule requires the mechanism, not just the value                                                                       |
| 14  | Nobody may scope an account into a channel they cannot read                   | (a) Administration types may scope into any channel. (b) The inviter must be a member of every scoped channel                                    | **(b).** (a) would require an administrator to name a private channel they cannot read, which is a disclosure by autocomplete before it is a capability. The condition also makes the guest-scope decision checkable against a single object at a time                                                                                                                                                                            |
| 15  | Preferences are unreadable by anyone but their owner                          | (a) Administration types may read for support. (b) Universal denial of another account's preferences                                             | **(b).** Per-viewer state is the viewer's own record, and an administrator with a legitimate need reads the audit log, which records acts rather than settings. A support surface, if one is ever built, is a new row with a new policy, not a widening of this one                                                                                                                                                               |
| 16  | Realtime authorization is re-checked on fan-out                               | (a) Authorize at subscribe time. (b) Authorize at subscribe time and re-check on every fan-out. (c) Re-check periodically                        | **(b).** Membership is revocable at any moment, so (a) authorizes against a fact that may have expired and (c) sets a window in which it certainly has. Constrained rather than free: the read contract requires a projection to be recomputed on every render so revocation propagates (`00-product-overview.md` L512)                                                                                                           |
| 17  | Scheduling is authorized twice                                                | (a) At creation. (b) At creation and again at delivery                                                                                           | **(b).** Everything the first check relied on can change before delivery. Same reasoning as row 16, with a different clock                                                                                                                                                                                                                                                                                                        |
| 18  | Creating a workspace is denied to guest-scoped and external accounts          | (a) Allow any authenticated account. (b) Deny guest-scoped and external accounts. (c) Deny everyone but an existing owner                        | **(b).** Smallest coherent behaviour: their standing exists inside somebody else's workspace, and (a) lets an invitation scoped to one channel mint a workspace where the account holds Owner. (c) would make workspace creation unreachable for a new account, contradicting the evidenced sign-up-then-create sequence                                                                                                          |
| 19  | The bulk add and the standing add-on-join flag are two operations             | (a) One operation with a flag. (b) Two operations                                                                                                | **(b).** The specification gates one and not the other (`02-channels.md` L803, L921, L986). Merging them either gates a bulk add that was never gated or leaves ungated the only control the corpus shows gated — the second being a real capability leak                                                                                                                                                                         |
| 20  | An account type change cannot be used to escalate                             | (a) Administration types may set any type. (b) Admins limited to below-admin; owners bounded by not-last-owner                                   | **(b).** (a) lets any admin create another admin and, one step later, remove an owner. The limit keeps the ladder's top rung reachable only from itself, and the owner bound keeps a workspace from becoming ownerless                                                                                                                                                                                                            |
| 21  | The no-session column exists                                                  | (a) Six columns, with pre-session operations described in prose. (b) A seventh column that is explicitly not an account type                     | **(b).** It makes every operation's decision total and gives the denial suite's most extreme non-member a documented cell. It is labelled as the absence of a type so no reader mistakes it for a sixth                                                                                                                                                                                                                           |
| 22  | Ownership transfer is deferred, with a reason                                 | (a) Author a transfer capability now. (b) Defer it and record the consequence                                                                    | **(b).** No Phase-1 surface reaches it, and authoring a capability with no caller would put an untested policy in the guard. The consequence is recorded honestly in the account-type table: in this run an owner is lost only with the workspace                                                                                                                                                                                 |

Two things this register deliberately does not do. It does not claim any of these decisions
is evidenced — where evidence exists the row says so and cites it, and where it does not the
row says the choice is authored. And it does not mark any acceptance criterion satisfied:
satisfaction is claimed in one place only, `docs/decisions/ac-manifest.md`, against the test
that proves it.

## What implements this record

This record is the declared source for the files below. Each is small on purpose: the value
of a chokepoint is that a reader can hold all of it at once.

| File                                      | What it takes from this record                                                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/authz/roles.ts`             | The enumeration of the five account types, with the guest's two forms expressed as the size of a scope. **No rank, no ordinal, no comparison helper**                |
| `apps/api/src/authz/matrix.ts`            | The cells, encoded as data — every operation against every type, with the conditions named as this record names them                                                 |
| `apps/api/src/authz/policy.ts`            | One policy per operation, taking the acting session and the **specific target object** and returning a decision. A policy is where a condition is actually evaluated |
| `apps/api/src/authz/guard.ts`             | The single mutation chokepoint every handler passes through, over an **exhaustive operation union**, so an operation or a model without a policy is a compile error  |
| `apps/api/src/authz/projection-guard.ts`  | The read-side twin over the eight projections, each authorized independently                                                                                         |
| `apps/api/src/authz/errors.ts`            | The denial types, each carrying the audit context a refusal has to record                                                                                            |
| `apps/api/src/db/tenancy.ts`              | The binding that makes the acting workspace server-derived, so no cell can be decided from a caller-supplied identifier                                              |
| `apps/api/src/observability/audit-log.ts` | The structured record every denial and every administrative action writes                                                                                            |

The two properties that make the guard a mechanism rather than a convention are worth
restating because this record depends on both. **It is the only path**: handlers do not
decide, they ask, so the set of authorization decisions in the build is enumerable and
therefore testable against these tables. **Its operation union is exhaustive**: adding an
operation without a policy fails the build instead of shipping an unguarded route. How each
security contract is discharged, and where, is registered in
`docs/decisions/security-contracts.md`.

The order in which a request meets these files matters, because two of the steps produce
different outcomes for the two callers the denial suite must cover:

```text
request
  -> authenticate                       no session   -> refuse
  -> bind acting workspace from session
  -> bind acting account from session
  -> resolve target object              not in scope -> absent
  -> policy(session, target)            cell = deny  -> refuse
  -> policy condition                   unmet        -> refuse
  -> execute
  -> audit, on every refusal above
```

A non-member fails at `resolve target object`, and the outcome is **absence**. A wrong-role
caller resolves the target and fails at `policy`, and the outcome is a **refusal**. Both are
audited; only the second had a capability question to answer.

### The audit obligation

Every denial emits a structured record through
`apps/api/src/observability/audit-log.ts`, carrying **who** attempted it (the acting session
and account, server-derived), **what** they attempted (the operation, by the same identifier
the guard uses), **against which object** (type and identifier, never a body copy), and
**why it was refused** (the failing policy and the capability it required). It also carries
the workspace, so the log is itself tenant-isolated, and an absolute timestamp.

A denial is the one event nothing else records. The request changed no state and returned no
content, so without the record it leaves no trace at all and a pattern of probing is
invisible. Administrative actions are logged for the same reason from the other direction —
an account type change, an invitation issuance or revocation, an archival, a conversion, a
deletion, a member removal — and the trigger set and row shape are specified in
`docs/decisions/data-model.md`.

## What tests this record

The authorization rule requires that **every mutation and every projection** ships with a
test proving that a non-member and a wrong-role caller receive a server-side denial, and
that a private resource is absent from every projection it lists. Three suites discharge
that, and their locations are fixed here so a reviewer knows where to look.

| Suite                                      | What it must prove                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/test/integration/authz/**`       | For **every** mutation in the tables above: a **non-member** is denied, and a **wrong-role caller** — an account whose type is defined here, who legitimately belongs to the workspace or the target channel, and whose cell reads `deny` — is denied by the server. Every conditional cell is exercised twice, with its condition held and unheld |
| `apps/api/test/integration/tenancy/**`     | With **two seeded workspaces under original authored names**, that a cross-workspace read returns nothing — not a refusal, nothing — for every read path, and that no caller-supplied identifier can widen the predicate                                                                                                                           |
| `apps/api/test/integration/projections/**` | That a private channel the viewer is not a member of is absent from **all eight** projections in the order above, one assertion per projection because one shared assertion would repeat the failure the rule warns against                                                                                                                        |

Three obligations on how those suites are written.

- **The wrong-role caller must be a real member.** A test that uses a non-member for both
  halves proves isolation twice and capability zero times. The two callers are constructed
  differently and fail at different steps, as the request order above shows.
- **Fixtures and seed data use original authored names.** The conversation names, person
  names and role labels visible in the corpus illustrate shape only, and a fixture is exactly
  the place such a name survives a review unnoticed. This applies to the two seeded
  workspaces in the isolation suite, whose names exist only to be different from each other.
- **No criterion is marked satisfied by this record.** This record says what must be proved;
  `docs/decisions/ac-manifest.md` records whether the test that proves it passes.

## Maintenance: this record changes first

Adding an operation, adding an account type, or changing a decision follows one order, and
the order is not a preference.

1. **Here.** Add the row or the column, fill every cell it creates, and add the reasoning to
   [The authored decisions](#the-authored-decisions). A new row against seven columns is
   seven decisions, and a new column against sixty-two rows is sixty-two.
2. **`apps/api/src/authz/matrix.ts`.** Encode the cells exactly as written here.
3. **`apps/api/src/authz/policy.ts`.** Add the policy, taking the session and the target
   object, evaluating the named conditions.
4. **`apps/api/test/integration/authz/**`.** Add the non-member and wrong-role assertions,
   plus one per condition.

Skipping step 1 has a specific consequence rather than a general one: the wrong-role test
becomes **unwritable**, because there is no record of which type the new operation denies.
The build would still compile — the guard's exhaustiveness catches a missing _policy_, not a
missing _decision_ — so the gap would present as a suite that tests the happy path and calls
it covered. Adding a column has the same shape and a wider blast radius, which is why a new
account type is a change to this record before it is a change to an enumeration.

## Recorded absences and preserved inconsistencies

Stated so a reader can see what this record does not know, and so that nothing below is
mistaken for evidence.

- **No capability assignment is evidenced anywhere.** The four cited frames settle that
  gates exist, that one is configurable, that a capability can be narrower than membership
  and that one feature can carry two capabilities. None of them says which type may do what.
- **Own-versus-another's is explicitly uncaptured.** Pin, edit and delete are observed on
  the acting person's own message, and whether they are offered on another person's "is not
  captured" (`03-messaging-and-composer.md` L432).
- **How a capability is granted or revoked is undocumented**, because the control that
  would show it was never captured (`15-admin-workspace.md` L758). This record therefore
  authors the grant paths — account type changes by an owner, or by an admin within the
  below-admin limit — rather than deriving them.
- **Four statements in the specification sit in tension, and they are preserved rather than
  reconciled.** The first says the corpus's entire vocabulary of visible authorization is
  four frames (`README.md` L380). The second names five account types read from a
  permissions table in the deferred administration area
  (`15-admin-workspace.md` L753, L754), and a roster there carries an account-type column
  with two values legible in it (`15-admin-workspace.md` L626). The third states that the
  roles card was never opened, so **no role is named anywhere in the catalog and none may be
  invented** (`15-admin-workspace.md` L758). The fourth records a captured state in which
  invitation is restricted to owners and administrators
  (`01-onboarding-and-auth.md` L229) — a fifth authorization-bearing frame that the count of
  four does not include.

  A shell-level acceptance criterion sharpens the tension rather than settling it: it
  requires that **no role name is implemented that those four frames do not supply**
  (`00-product-overview.md` L919), and two of the five names used here — the owner and the
  external collaborator — are supplied by prose about _other_ frames rather than by those
  four.

  The readings can be held together only by distinguishing a **role**, which the
  never-opened roles card would have named, from an **account type**, which the permissions
  table does name. That is why this record uses the specification's own term, `account
type`, throughout, and why every name it uses is one the specification's prose already
  prints. Under the precedence this run works to, the build's own instruction to define the
  capability model itself (`00-product-overview.md` L504) is what makes the enumeration
  permissible at all. Both readings are recorded and neither is asserted over the other; the
  tension is logged in `docs/decisions/catalog-defects.md`, where correcting the
  specification in place is prohibited and recording the defect is the remedy.

- **Guest capabilities inside their scope are unevidenced in both directions.** The
  specification records that the scope exists and is required
  (`01-onboarding-and-auth.md` L272, L281); it records nothing about what may be done inside
  it. Full participation, no curation, no administration is this record's answer and is
  authored.
- **Ownership transfer, plan-gated capability and payment capability are deferred**, each
  with a reason: no Phase-1 surface reaches them, and billing is out of scope for this run.
  The upgrade-gated presentation stays distinct from the role-gated one regardless
  (`21-states.md` L111), so a deferred capability never renders as an authorization denial.

## Companion records

| Record                                 | What it holds that this one deliberately does not                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `docs/decisions/security-contracts.md` | The sixteen security contracts and the file that discharges each                                             |
| `docs/decisions/data-model.md`         | The schema shapes that make each projection authorizable, the credential tables and the audit row's contents |
| `docs/decisions/realtime-contract.md`  | The socket envelope, the replay window and the reconnect behaviour behind the fan-out re-check               |
| `docs/decisions/observed-values.md`    | Every configured window, threshold and limit named in a condition here, with its default and its reasoning   |
| `docs/decisions/catalog-defects.md`    | The specification tensions this record preserves rather than reconciles                                      |
| `docs/decisions/ac-manifest.md`        | Whether the tests named here pass. Satisfaction is claimed there and nowhere else                            |

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **No frame was opened.** Every fact above was resolved from specification prose, which the
  corpus-handling rule requires to be attempted first. Frames are referred to by **bare
  number** only; no filename appears here, and neither does the catalog's percent-encoded
  citation form, because both carry a third-party product name.
- **Rules cited by subject and position, never by identifier**, because every rule
  identifier embeds that name — the component rule is the first of the five as provided, the
  authorization rule the second, the corpus-handling rule the third, the uncertainty rule the
  fourth, the identity rule the fifth.
- **Account type names, operation names and condition tags are authored and functional.**
  Each describes what the thing is or does. No third-party product, feature or role label
  appears in the text, the headings, the table cells or the paths, and no string legible in a
  capture is transcribed.
- **No example uses a corpus name.** Where an example was needed it describes a shape — a
  private channel, an account, a workspace — which is why no conversation name and no person
  name appears anywhere above. The same rule binds the fixtures and seed data the test
  contract names.
- **No colour value and no artwork.** Colour belongs to the token module and is out of this
  record's scope entirely; the one glyph described above is described by function.
- **No diagram fence.** The committed documentation-site configuration does not render one:
  its superfences extension consumes a fenced block before the diagram plugin can claim it,
  so a diagram fence publishes as a highlighted code box (`README.md` L905–L909). Structure
  is expressed as tables and prose instead, and the read-only site configuration is not
  touched.
- **Fenced lines are held to 74 characters**, the catalog's measured ceiling, because a
  published fence clips rather than wraps.
- **Evidence by citation; absence recorded as absence; inconsistencies preserved.** Every
  claim taken from the specification names the document and line it came from. Every decision
  taken without evidence says so and carries its options, its choice and its reasoning. The
  specification tensions above are carried rather than settled.
