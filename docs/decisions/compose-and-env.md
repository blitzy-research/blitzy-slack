# Compose location and the environment surface

Why the local dependency stack is defined at `infra/docker-compose.yml` while the
command documented to start it is run from the repository root — and how both of
those facts hold at once, without moving the file and without rewording the
command.

| Field                               | Value                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Record type                         | Decision record                                                                                                    |
| Status                              | Operative                                                                                                          |
| Cause                               | A documented root-level command meeting a write boundary that admits `infra/` and not a new root-level file        |
| Mechanism                           | `COMPOSE_FILE` and `COMPOSE_PROJECT_NAME`, declared in the committed `.env.example`                                |
| Artifacts described                 | `infra/docker-compose.yml`, `infra/postgres/init.sql`, `infra/minio/bootstrap.sh`, `.env.example`, `.dockerignore` |
| Companion records                   | `docs/decisions/observed-values.md` for the configurable product defaults that share the same template             |
| Frames opened to author this record | **0**                                                                                                              |

**How this file cites.** Paths are repository-relative. Every figure and every
service, volume and variable name below was read out of the committed artifact it
belongs to, and every claim about behaviour was produced by running the command
named beside it. Which commands ran, and which did not, is set out under
[what was verified here](#what-was-verified-here-and-what-was-not). No frame was
opened to author this record, and none needed to be: nothing here is a question
about pixels.

## The apparent conflict

The sequence a clean clone follows is documented in the repository's root
`README.md`, and it is run from the repository root. Two of its lines matter
here, in this order:

```
cp .env.example .env
docker compose up -d
```

Given no other instruction, the compose tool looks for its file in the directory
it is invoked from. The plain reading of that second line is therefore a compose
file at the repository root.

The project rules do not allow one. The **corpus-handling rule** — the third of
the five project rules as provided, the one governing corpus and specification
handling — confines new code to four directories: `apps/`, `packages/`, `infra/`
and `tools/`. `infra/docker-compose.yml` is inside that boundary. A new
`docker-compose.yml` at the repository root is outside it. That is the whole
cause of this record, and it is a boundary rather than a preference: the same
rule that admits `infra/` is the rule that keeps the frame corpus and the
specification catalog read-only, so it is not the kind of constraint a build
negotiates with for convenience.

Two exits present themselves and both are wrong.

| Tempting exit                                                   | Why it is rejected                                                                                                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Move the compose file to the repository root                    | Breaches the write boundary. Nothing about the stack requires it, so the breach would buy nothing                                                |
| Document a different command carrying an explicit file argument | Keeps the file legal and makes the documentation wrong. The documented sequence is a fixed artifact of this build, and a variant of it is not it |

## The resolution: two keys, declared once

The compose tool reads a `.env` file from the directory it is invoked in, and it
does so **before** it resolves which compose file to load. That ordering is the
whole mechanism: two of its own settings can therefore be supplied by the same
file the documented sequence has already created one line earlier.

`.env.example` declares both, in a block whose only job is this reconciliation:

```
COMPOSE_FILE=infra/docker-compose.yml
COMPOSE_PROJECT_NAME=relay
```

`cp .env.example .env` puts them in the developer's untracked `.env`. From that
point the literal documented line resolves to the file under `infra/` with no
argument, no wrapper script and no alias:

```
docker compose up -d
```

`COMPOSE_FILE` is what makes the command find the file. `COMPOSE_PROJECT_NAME`
is what makes it find the same containers, volumes and network every time
regardless of the directory name the clone happens to sit in — the tool's default
project name is derived from that directory, and a checkout directory is not a
stable input.

### Fidelity is preserved by making the literal command work

The principle generalises past this one file, which is why it is written down
here rather than left implicit: **fidelity is preserved by making the literal
documented command work, not by documenting a variant of it.** A reader who is
told to run a different command has been given a different product. Every
substitution of that kind is also a divergence someone later has to detect,
because a command that appears in documentation is copied and pasted, not
interpreted.

### The caveat, stated rather than glossed

The mechanism is conditional, and pretending otherwise would be the kind of
overclaim this record exists to avoid. It depends on the two keys reaching the
tool's environment, which happens in one specific arrangement and not in others.

| Condition                                                      | Observed behaviour                                                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Invoked from the repository root, after `cp .env.example .env` | Resolves. The stack starts from the file under `infra/` — this is the documented path and the one that is exercised |
| Invoked from a subdirectory of the repository                  | Fails with `no configuration file provided: not found`. The subdirectory has no `.env`, so neither key is read      |
| `COMPOSE_FILE` already exported in the shell to another value  | The exported value wins over the one in `.env`. A shell that pre-sets it points the command wherever it was pre-set |
| `.env` never created, because the copy step was skipped        | Neither key exists, and the command behaves as it would in any repository with no compose file at its root          |

For a shell or a context that does not load the local environment file, the
fallback is the explicit file argument:

```
docker compose -f infra/docker-compose.yml up -d
```

That line is a fallback and is deliberately **not** offered as a replacement for
the documented one. It is recorded so that a developer who hits the second or
third row above has an answer, and so that continuous-integration jobs and
scripts, which set their own environment, have a form that does not depend on a
file they may not have copied.

## The stack

Four long-running services and one one-shot. Every published port is declared as
a variable with the default shown, so a second checkout can shift its ports
without editing the compose file; `infra/README.md` carries that convention.

| Service            | Image                                      | Purpose                                                                                                              | Published port(s) | Environment variable it backs                                          |
| ------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| `postgres`         | `postgres:16`                              | Primary datastore and full-text search                                                                               | `5432`            | `DATABASE_URL`, and `TEST_DATABASE_URL` for the separate test database |
| `redis`            | `redis:7`                                  | Presence, socket registry and cross-instance publish/subscribe                                                       | `6379`            | `REDIS_URL`                                                            |
| `objectstore`      | `minio/minio:RELEASE.2025-09-07T16-13-09Z` | S3-compatible object storage for pre-signed uploads. The first port is the storage interface, the second its console | `9000`, `9001`    | `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` |
| `objectstore-init` | `minio/mc:RELEASE.2025-08-13T08-35-41Z`    | One-shot. Creates the upload bucket, leaves it private, exits. Never restarts                                        | none              | `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`                |
| `mail`             | `axllent/mailpit:v1.30.7`                  | Local SMTP capture: accepts mail, delivers none. The first port is SMTP, the second the web interface                | `1025`, `8025`    | `SMTP_URL`, with `EMAIL_FROM` as the sender it stamps                  |

The port variables are `POSTGRES_PORT`, `REDIS_PORT`, `OBJECT_STORE_PORT`,
`OBJECT_STORE_CONSOLE_PORT`, `MAIL_SMTP_PORT` and `MAIL_UI_PORT`. Only the
published side moves: the port inside each container is fixed, so a shifted
publication changes the connection strings in `.env` and nothing else.

**On the image identifiers.** All five images are third-party software, each named
by the identifier it publishes under — a datastore, a cache, an object store
together with that store's own command-line client, and an SMTP sink. Pulling an
infrastructure dependency by its published identifier is a different act from
reproducing a product's identity in this project's own names, copy or assets,
which the **identity rule** — the fifth of the five project rules as provided —
prohibits outright. Everything this project names itself is authored: the project
name, the service names, the volume keys, the bucket name, the database name and
the search configuration. None of them carries a third-party product name.

### Volumes, and why named volumes only

Every service that keeps state keeps it in a named volume. Nothing is bind-mounted
for data, so **the project directory is never written to** — which is what makes
the project-name default harmless: were data kept beside the checkout, the
directory name would be load-bearing, and moving or renaming a clone would move
or orphan its data with it.

| Compose key        | Name created under the default project name | What it holds                    |
| ------------------ | ------------------------------------------- | -------------------------------- |
| `postgres-data`    | `relay_postgres-data`                       | The database cluster             |
| `redis-data`       | `relay_redis-data`                          | The append-only persistence file |
| `objectstore-data` | `relay_objectstore-data`                    | Uploaded objects                 |
| `mail-data`        | `relay_mail-data`                           | Captured messages                |

The created name is the project name joined to the compose key, so every volume
carries `COMPOSE_PROJECT_NAME` as its prefix. Two clones with distinct project
names therefore share nothing at all, and the same clone finds its own data again
after a restart.

Only the two read-only mounts break the pattern, and neither carries data: the
database initialisation script and the bucket bootstrap script are each mounted
into the container that runs it.

### The network

No network is declared, so the services share the project's default network,
named `relay_default` under the default project name. They address one another by
service name on it — the bootstrap script reaches the object store at
`http://objectstore:9000`, which is why it needs no published port to do its
work. Nothing outside the project joins that network.

### The two mounted assets

| Asset                      | When it runs                                       | What it does                                                                                                                                                   |
| -------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `infra/postgres/init.sql`  | **First start only**, against an empty data volume | Installs the extensions the schema and the search implementation need, creates the project's text-search configuration, and creates the separate test database |
| `infra/minio/bootstrap.sh` | Each time the one-shot runs; idempotent            | Creates the upload bucket if absent and sets its access to none, because uploads are pre-signed and the bucket is never public                                 |

**First start only has a consequence worth stating plainly, because it surprises
people:** the initialisation script is read when the data volume is empty and
never again. Editing it does not change an existing volume, and no restart will
apply it. The reset is to discard the volumes:

```
docker compose down -v
```

That removes the containers, the network and all four named volumes, so the next
`up` initialises from scratch. Without `-v` the volumes survive, which is the
right default for a working day and the wrong one after an edit to the script.

The bootstrap script differs on purpose: it is written to be safe to re-run, so
the one-shot re-executing on a later `up` is a no-op rather than a failure.

### Healthchecks

| Service            | Health gate                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `postgres`         | Declared: a readiness probe against the configured user and database, with a start-up grace period |
| `redis`            | Declared: a ping probe                                                                             |
| `mail`             | None declared here; the image supplies its own, and the container reports healthy                  |
| `objectstore`      | **None.** The gap is covered downstream rather than here — see below                               |
| `objectstore-init` | Not applicable. It is a one-shot that exits, and it is configured never to restart                 |

These matter to the developer experience because of what follows the stack in the
documented sequence: the migration and seed steps run immediately after
`up -d` returns. A container that has begun listening but is not yet ready would
fail those steps with a connection error that reads like a misconfiguration, and
the developer would go looking for a wrong password rather than waiting two
seconds. A declared health gate turns that class of confusion into a wait.

The object store carries no health gate, and the one-shot that depends on it waits
only for it to have started rather than to be healthy. That is not an oversight
left unhandled: the bootstrap script polls the storage endpoint itself, up to
thirty times at two-second intervals, and fails loudly with the endpoint in the
message if the store never answers. The retry is stated here so that the absent
health gate is not read as an absent guarantee.

## Corpus containment: there is no build context

The corpus-handling rule requires that the frame corpus never reach a build
output, a container image or a client bundle. The local stack satisfies that in
the strongest available way: **the compose file declares no `build:` section at
all.** Every service runs a published image, so the stack creates no build context
whatsoever, and a directory that is never sent to a builder cannot be copied into
an image.

The second half is the root `.dockerignore`, which governs any build context that
is created later from the repository root. It excludes `screenshots/`, `docs/` and
`blitzy/` — the corpus, the specification catalog and the vendor documentation —
along with dependencies, build output and every environment file at every depth,
re-admitting only the committed template. `.gitattributes` carries the remaining
half of containment, keeping the corpus byte-identical and out of textual diffs;
its own header points at `.dockerignore` for this half, and this record points
back.

## No external accounts

The guarantee is explicit, and it is why two of the four long-running services are
local stand-ins rather than cloud endpoints: **a clean clone reaches a running
system with no external accounts.** No provider is signed up for, no key is
issued, no card is entered, and nothing in the sequence waits on someone else's
dashboard.

Two substitutions carry it. Local SMTP capture stands in for an email provider,
and local S3-compatible storage stands in for cloud object storage. Both speak the
same protocol as the thing they replace, so the application code has no
development-only branch in it — only a different endpoint.

That leads to two consequences a developer needs to know on day one.

- **Mail is read in the browser, not in an inbox.** Verification codes, invitation
  links and password-reset links are all sent, and every one of them is captured
  by the local sink and readable in its web interface. Nothing leaves the machine,
  so no real address is ever mailed by accident during development.
- **Uploads go to the local store, pre-signed.** The interface asks the server for
  a signed URL and sends the bytes straight to the object store, exactly as it
  would against a cloud bucket. File bytes never transit the API in either
  environment, so the development path exercises the production one.

## Credential posture

Everything in `.env.example` is a non-sensitive local development default. There
is no real credential in the file and there is not meant to be: the session
secret is a self-describing placeholder that says out loud it must be replaced,
and the object-storage key pair is a local pair that grants access to a container
on the developer's own machine and nothing else.

The real values live in `.env`, which is untracked. `.gitignore` ignores `.env`
and every `.env.*` variant and then re-admits `.env.example` by negation, so the
template stays tracked — it is the documented default for every configurable
value — while a populated file cannot enter history. The root `.dockerignore`
takes the same shape at every depth of the tree, for the stronger reason that
anything baked into an image layer is readable by anyone who can pull the image.

Stated as a rule rather than an observation: **a value that would be damaging to
publish belongs only in the untracked file.** The template's job is to name every
variable and document its default, not to hold anything worth stealing.

## Three views of one truth

The infrastructure connection values are described in three places, and the three
**must agree**. A change to one of them is a change to all three.

| Artifact                   | What it holds                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `infra/docker-compose.yml` | The inline default beside each variable it interpolates, in the `${VARIABLE:-default}` form  |
| `.env.example`             | The variable, the same default, and a comment saying what it is for                          |
| Root `README.md`           | The environment table a reader consults before running anything, as rewritten for this build |

A published port that is shifted in one and not the others produces the worst
class of local failure: a stack that starts cleanly and an application that cannot
reach it. Checking the three against each other is cheap and catching that failure
after the fact is not.

**A different category lives in the same template.** `.env.example` also carries
five configurable **product** defaults — an invitation lifetime, an external
acceptance window, a guest channel budget and two session bounds. Those are
product behaviour rather than local wiring: each is a mechanism the product
enforces, each was chosen from evidence, and each is recorded with its reasoning
in `docs/decisions/observed-values.md`, which also names its own three-way
agreement obligation with the shared configuration module. This record does not
restate any of them, and neither file's obligation substitutes for the other's.
The distinction is worth keeping sharp: change a value documented here and a
developer's stack stops resolving; change one documented there and the product
behaves differently for every user of a deployment.

## What was verified here, and what was not

The plan for this build recorded that no container runtime was available on the
machine it was written on — no container engine, no compose tool, and no database
or cache command-line client — and concluded that the stack could be authored but
not started. **That finding did not hold in the environment this record was
authored in**, which carried a working container engine and compose tool. The
earlier finding is left as it stands rather than edited, and what was actually
executed here is recorded instead.

Executed, from the repository root, using the documented copy step followed by the
documented command with no arguments added:

| Check                                              | Result                                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| The plain command resolves the file under `infra/` | Passed. Both the configuration dump and the start-up ran from the root with no file argument                        |
| All five images pull                               | Passed                                                                                                              |
| `docker compose up -d`                             | Passed. The three services with health gates reported healthy; the object store reported running                    |
| The one-shot completes                             | Passed. It exited zero after creating the upload bucket and setting its access to none                              |
| The initialisation script is applied               | Passed. All three extensions, the text-search configuration and the separate test database were present afterwards  |
| First-start-only semantics                         | Passed. The script ran exactly once on first start and did not run again after the database container was restarted |
| The cache and the mail interface answer            | Passed. A ping returned, and the mail web interface and the storage liveness endpoint both answered                 |
| `docker compose down -v`                           | Passed. Containers, network and all four named volumes were removed, leaving nothing behind                         |

One qualification on all of the above, because it changes what the result proves:
the run used a distinct project name and shifted published ports, which is the
parallel-checkout convention rather than the template's defaults. The **command**
was the documented one; the **values** it read were clone-scoped, so what is
proven is the mechanism and the stack, not the specific default ports on a machine
where nothing else is listening.

Not executed, and honestly so:

- **The migration, seed, development and test steps of the documented sequence.**
  The application, schema and test sources they need are not present yet, and a
  workspace install currently stops at the database package's post-install step
  for that reason. That is an absence of code, not a defect in this stack, and no
  placeholder was introduced to make the step appear to pass.
- **The container-backed integration suite**, which provisions its own database per
  run and needs the suite to exist first.
- **The two-instance fan-out proof.** Cross-instance delivery is only provable with
  two server instances running against one cache, and the server does not exist
  yet.
- **The full clean-clone sequence end to end**, for the same reason: it terminates
  in commands whose targets are not yet written.

Each of those is execution-bound to an environment that has both a container
runtime and the application sources. Every artifact they will run against is
authored in full regardless. This constrains verification, not delivery — and
where a step has not been executed, this record says it has not been executed.

## Divergences recorded rather than reconciled

The stack as committed differs in three naming details from the description this
record was planned against. The committed artifact is the authority on what
exists, so the differences are recorded here rather than smoothed over in either
direction; none of them changes behaviour, and none was worth rewriting a verified
stack to remove.

| Planned                                                      | Committed                                                       | Consequence                                                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A one-shot reusing the object-storage image, adding no image | `objectstore-init`, running the object store's own client image | One additional image identifier to pull. The client image is what carries the bucket commands          |
| Three named volumes                                          | Four: captured mail persists across a restart as well           | The reset removes four volumes, not three. Losing captured mail on every restart would have been worse |
| An explicitly declared network                               | No network declared; the project's default network is used      | The effective name is the project name joined to `default`. Service-name addressing is unaffected      |

## Authoring conventions observed by this record

Recorded so that a reviewer can check compliance without inferring intent.

- **No frame was opened.** Nothing here is a question the corpus could answer, and
  the corpus-handling rule makes a frame source material of last resort rather
  than a browsing surface. The count above is zero and no access-log entry is owed.
- **Rules cited by subject and position, not by identifier.** The five project
  rules carry platform identifiers that each embed a third-party product name, so
  writing one here would breach the identity rule this record is otherwise
  observing. They are cited by what they govern and where they sit in the provided
  order — the corpus-handling rule is the third, the identity rule the fifth.
  Position alone would be unsafe, because the identifiers are permuted relative to
  the requirement labels; position **with** subject is not.
- **Authored prose throughout.** No third-party product name appears in any
  heading, sentence, path or table cell, no string is transcribed from any frame,
  no colour value appears at all, and no sample entity name from the corpus is
  reproduced. Third-party software is either named functionally or referenced by
  the published image identifier of an infrastructure dependency.
- **No diagram fences.** The committed documentation-site configuration does not
  render them: its superfences extension consumes a fenced block before the
  diagram plugin can claim it, so a diagram fence publishes as a highlighted code
  box. Tables and prose are used instead.
- **Fenced lines are held to 74 characters**, because a published fence clips
  rather than wraps. Every fence above is a single short command or a pair of
  variable assignments.
- **Evidence by citation; absence recorded as absence.** Each behavioural claim
  names the command that produced it, the unexecuted steps are listed as
  unexecuted, and the three planning divergences are preserved rather than
  reconciled.
