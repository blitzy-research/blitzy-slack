# Blitzy Relay

Blitzy Relay is a workspace-scoped, channel-based team communication platform. People join a
workspace, talk in channels that are either open to the whole workspace or restricted to the people
invited into them, and see one another's messages arrive as they are sent. Two properties are
structural rather than incidental: every row a query can reach belongs to the workspace the
requesting session belongs to, and every change to data is authorized on the server at the moment it
executes. Neither depends on what the client chose to render.

## Status

This repository delivers two phases of the product.

- **Phase 0 — the foundation.** The workspace and its task graph, the committed lockfile, the strict
  compiler and lint configuration, the local dependency stack, the environment surface, the data
  layer with workspace isolation enforced at the read path, the server-side authorization
  chokepoint, the realtime transport with durable per-conversation ordering, the shared contracts,
  and the measured design tokens.
- **Phase 1 — the first product surface set.** The persistent application shell, onboarding and
  authentication, channels, messaging and the composer, and the cross-cutting state matrix that
  governs how every one of those surfaces behaves while it is loading, empty, failing or read-only.

Later phases are **deferred, not omitted**. Threads, direct messages, search, huddles, canvases,
lists, the workflow builder, apps and integrations, activity, profiles, preferences, files,
administration, external collaboration and the commercial surfaces are all outside this scope — and
every destination belonging to them resolves to a defined placeholder surface, so no control in the
shipped shell is dead. What each placeholder says is recorded in
[`docs/decisions/placeholder-surfaces.md`](docs/decisions/placeholder-surfaces.md).

Gate status is not asserted here. It is reported in the format described under
[Reporting](#reporting), against the ledger that owns it.

## Prerequisites

| Requirement | Version         | Notes                                                                                               |
| ----------- | --------------- | --------------------------------------------------------------------------------------------------- |
| Node        | **20.20.2**     | A hard floor rather than a preference. Pinned by [`.nvmrc`](.nvmrc) — see below.                    |
| pnpm        | **9.15.9**      | Selected by the root manifest's `packageManager` field; `corepack enable` is enough to activate it. |
| Docker      | with Compose v2 | Runs the local dependency stack. Nothing in the quick start reaches an external account.            |

**Node 20.20.2 is a floor, not a suggestion.** The pinned database toolkit declares an engine range
of `^20.19.0 || >=22.12.0`, so a lower Node 20 patch fails outright rather than degrading quietly.
[`.nvmrc`](.nvmrc) pins the patch and the root manifest's `engines` field holds the line at
`>=20.20.2 <21.0.0`. If a version manager is in use, `nvm use` or its equivalent reads that file and
needs no argument.

**pnpm 9 is selected, not merely permitted.** The workspace protocol and the single committed
lockfile depend on it, and a different major resolves the graph differently. `corepack enable` reads
the `packageManager` field and activates the right version without a global install.

**Docker** runs PostgreSQL, Redis, S3-compatible object storage and a local mail sink, so the mail
and file paths work with no provider account. If Docker is unavailable the workspace still installs,
builds, type-checks and lints; the suites that need a datastore, and the quick start's third line
onward, do not.

## Quick start on a clean machine

Run these in order, from the repository root.

```text
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate && pnpm db:seed
pnpm dev
pnpm test && pnpm test:e2e
```

Line by line:

- **`pnpm install`** — installs and links every workspace from the committed lockfile. The task
  graph orders each build behind its upstream builds, so the shared contracts, the data layer and
  the component library compile ahead of the two applications that consume them.
- **`cp .env.example .env`** — [`.env.example`](.env.example) is committed and _is_ the environment
  surface: every variable is documented there with a working local default. Copying it is
  configuration, not a placeholder step, and the file it produces is what the next line reads.
- **`docker compose up -d`** — starts the stack defined in
  [`infra/docker-compose.yml`](infra/docker-compose.yml): PostgreSQL 16, Redis 7, S3-compatible
  object storage with a bootstrap step that creates the upload bucket, and a local mail sink that
  captures verification codes, invitations and reset links instead of sending them. The command
  works from the repository root even though the compose file is not there, because the `.env`
  created one line earlier sets `COMPOSE_FILE=infra/docker-compose.yml` and
  `COMPOSE_PROJECT_NAME=relay`, and the compose tool reads that file before it resolves which
  compose file to load. The reasoning is in
  [`docs/decisions/compose-and-env.md`](docs/decisions/compose-and-env.md); the fallback, if the
  copy step was skipped, is the explicit `-f infra/docker-compose.yml` form.
- **`pnpm db:migrate && pnpm db:seed`** — applies the checked-in migrations, then seeds two
  workspaces so cross-workspace isolation has something to be proven against. Both scripts live in
  `packages/db`.
- **`pnpm dev`** — runs the client and the API in parallel. The client's dev server proxies the API
  and the socket path, so the browser sees one origin and the session cookie stays first-party.
- **`pnpm test && pnpm test:e2e`** — the unit and component suites, then the end-to-end suite. The
  stack from the third line must be up for the suites that need a datastore.

The sequence above is the literal command set, and it is documented in the form that works. Where a
boundary made the obvious arrangement impossible — the compose file cannot live at the repository
root — the reconciliation was built into the configuration rather than into the documentation.

## Workspace map

| Path                   | Purpose                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`             | React 18 + Vite client: the persistent shell, the routed Phase-1 surfaces, the realtime client and the optimistic-send reconciliation.      |
| `apps/api`             | Fastify HTTP and WebSocket server: the authorization chokepoint, the domain services, the realtime gateway and the cross-instance fan-out.  |
| `packages/shared`      | Schemas shared by server and client, the two configuration modules, the generated API specification, and all authored interface copy.       |
| `packages/db`          | Prisma client factory, the workspace-isolation extension, the transactional per-conversation sequence allocator, schema, migrations, seeds. |
| `packages/ui`          | Design tokens and the shared component library. Consumed only through its barrel, `@relay/ui`.                                              |
| `tools/measure-frames` | Derives geometric tokens by measurement and commits its raw output, so any token can be traced back to the pixels that produced it.         |
| `tools/check-brand`    | Pipeline guard: fails the build on a third-party product name anywhere outside the five read-only input paths.                              |
| `tools/check-corpus`   | Pipeline guard: verifies the frame count and byte-identity of the read-only corpus, from metadata alone.                                    |
| `tools/ac-manifest`    | Regenerates the acceptance-criteria traceability manifest and reconciles its per-area subtotals.                                            |
| `e2e`                  | Playwright suite, including the multi-client realtime specification and the accessibility pass over every Phase-1 route.                    |
| `infra`                | The local dependency stack: the compose file, the database bootstrap and the object-storage bootstrap.                                      |
| `docs/decisions`       | The decision records. This is the only permitted location for a new document in this repository.                                            |

Workspace membership is declared in [`pnpm-workspace.yaml`](pnpm-workspace.yaml) as `apps/*`,
`packages/*`, `tools/*` and `e2e`. The last two rows above are directories in the map rather than
packages: `infra/` holds container and shell assets with no manifest to link, and `docs/decisions/`
holds prose. Internal dependencies between the packages that _are_ workspaces use the `workspace:*`
protocol, never a version range.

## Scripts

Every script below is a root script: run it from the repository root with `pnpm <name>`. The root
[`package.json`](package.json) is authoritative — if this table and that file ever disagree, the
manifest is right and this table is the defect.

| Script             | What it does                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `dev`              | Runs every workspace's dev task in parallel — in practice the client's dev server and the API with reload.                |
| `build`            | Builds every workspace in dependency order, so shared code compiles before its consumers.                                 |
| `typecheck`        | Type-checks every workspace with no emit, under the strict configuration in [`tsconfig.base.json`](tsconfig.base.json).   |
| `lint`             | Lints the tree, including the import-boundary rule that keeps each shared contract to a single implementation.            |
| `test`             | Runs the unit and component suites across every workspace.                                                                |
| `test:integration` | Runs the API's integration suite against a real PostgreSQL instance in a throwaway container.                             |
| `test:e2e`         | Runs the end-to-end suite, including the multi-client realtime specification.                                             |
| `test:a11y`        | Runs the accessibility scan over every Phase-1 route.                                                                     |
| `db:migrate`       | Applies the checked-in migrations to the database named by `DATABASE_URL`.                                                |
| `db:seed`          | Seeds two workspaces with original names, so cross-workspace isolation can be tested rather than assumed.                 |
| `db:seed:bulk`     | Seeds the bulk fixture the pagination benchmark reads. Deliberately separate from `db:seed`, because it is slow.          |
| `measure:frames`   | Runs the frame-measurement tool against its fixed manifest and writes its raw output.                                     |
| `check:brand`      | Runs the third-party-identity guard over the tree.                                                                        |
| `check:corpus`     | Verifies the read-only corpus is intact: the expected frame count, and every frame byte-identical to its committed state. |
| `ac:manifest`      | Regenerates the acceptance-criteria traceability manifest and reconciles its per-area subtotals.                          |

## Environment variables

[`.env.example`](.env.example) is committed, carries a working local default for every variable, and
contains no real credential. Copying it produces a running local system with no external account of
any kind. The two values that would matter in a deployed system — the session secret and the
object-storage keys — are obvious placeholders and must be replaced outside local development.

**The configuration surface is split in two, deliberately.**

- **Configurable defaults** are settings. Each is defined once, schema-validated at startup, and
  documented here and in `.env.example` with the default this project chose. They are listed below.
- **Invariants** are rules rather than settings, and are deliberately **not**
  environment-overridable and therefore not listed below. The channel-name grammar and its
  eighty-character ceiling, the pre-selected channel visibility, the snippet's content-only-required
  rule, the password-hashing parameters and the realtime replay-window bound all live in
  [`packages/shared/src/config/constants.ts`](packages/shared/src/config/constants.ts), beyond the
  reach of any variable. Listing one of them here would hand a deployment a downgrade path — most
  sharply for the hashing parameters, where an override _is_ the downgrade.

**Values are consumed by import, never inlined.** Every value below is read from
[`packages/shared/src/config/env.ts`](packages/shared/src/config/env.ts) by the code that needs it;
a literal at a point of use is a defect, because it puts the value in a second place and the two
eventually differ. **Records store absolute timestamps, not durations.** Every day-, hour- and
minute-valued setting below is an input to a resolution that happens once, when something is issued;
the resolved moment is what gets written to the record. That is what lets a default change without
invalidating a single record already written — lengthening a window never extends something already
issued, and shortening one never cuts it short.

This table, `.env.example` and
[`docs/decisions/observed-values.md`](docs/decisions/observed-values.md) are three views of one
truth and must move together: adding a variable, renaming one or changing a default means editing
all three in the same change. That record carries the evidence and reasoning behind each chosen
default.

### Runtime

| Variable    | Purpose                                                                                                                                    | Default       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| `NODE_ENV`  | Selects development behaviour across the toolchain: unminified builds, readable logs, console mail.                                        | `development` |
| `LOG_LEVEL` | Minimum severity the structured logger emits. `info` keeps the authorization-denial audit trail visible without per-request noise.         | `info`        |
| `API_HOST`  | Interface the API binds. The unspecified address makes it reachable from a container as well as from the host.                             | `0.0.0.0`     |
| `API_PORT`  | Port the API listens on. A variable rather than a literal because the cross-instance fan-out proof runs a second instance on another port. | `3001`        |
| `WEB_PORT`  | Port the client's dev server listens on.                                                                                                   | `5173`        |

### PostgreSQL 16 — primary datastore and full-text search

The first four keys are read by the container tool when it starts the stack; application code reads
the connection strings beneath them. Changing one means changing the matching connection string in
the same edit.

| Variable            | Purpose                                                                                                                                                    | Default                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `POSTGRES_USER`     | Database role the stack creates.                                                                                                                           | `relay`                                                                       |
| `POSTGRES_PASSWORD` | Password for that role. A local-only placeholder; replace outside local development.                                                                       | `relay_local_only`                                                            |
| `POSTGRES_DB`       | Database the stack creates.                                                                                                                                | `relay`                                                                       |
| `POSTGRES_PORT`     | Published port for the datastore.                                                                                                                          | `5432`                                                                        |
| `DATABASE_URL`      | The connection string application code uses. Required with no fallback: a datastore location is the most damaging value to guess on a deployment's behalf. | `postgresql://relay:relay_local_only@localhost:5432/relay?schema=public`      |
| `TEST_DATABASE_URL` | Fallback for suites that do not provision their own throwaway database. A separate database, never the one above — an integration run truncates tables.    | `postgresql://relay:relay_local_only@localhost:5432/relay_test?schema=public` |

### Redis 7 — presence, socket registry, cross-instance fan-out

| Variable     | Purpose                                                                                                                                                                              | Default                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| `REDIS_PORT` | Published port for the cache and bus.                                                                                                                                                | `6379`                   |
| `REDIS_URL`  | Presence heartbeats, the socket registry, and the publish/subscribe bus that carries a message to sockets held by another instance. The bus is a transport, never a source of truth. | `redis://localhost:6379` |

### Sessions

| Variable              | Purpose                                                                                                                                                                                                                                                                                                       | Default                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `SESSION_SECRET`      | Signs the cookie that carries the acting session. Every server-side authorization check is evaluated against that session, so a guessable secret is not a weak setting — it is a forgeable identity. **Replace this placeholder outside local development** with a long random value, at least 32 characters. | `development-only-session-secret-replace-before-any-deployment` |
| `SESSION_COOKIE_NAME` | Name of that cookie. Configurable so two deployments can share a hostname without colliding.                                                                                                                                                                                                                  | `relay_session`                                                 |

### Object storage — pre-signed uploads, bytes never proxied

| Variable                    | Purpose                                                                                                                                                                                                 | Default                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `S3_ENDPOINT`               | Endpoint the API signs against, reached from inside the network.                                                                                                                                        | `http://localhost:9000` |
| `S3_PUBLIC_ENDPOINT`        | Endpoint the browser resolves a pre-signed URL against. Identical locally and deliberately separate, and the only non-self origin the content-security policy admits for images, media and connections. | `http://localhost:9000` |
| `S3_REGION`                 | Region label. The local service ignores it; the signing algorithm does not.                                                                                                                             | `us-east-1`             |
| `S3_BUCKET`                 | Bucket uploads land in. The bootstrap step creates it on first start and leaves it private.                                                                                                             | `relay-uploads`         |
| `S3_ACCESS_KEY_ID`          | Access key for local storage. A placeholder; replace outside local development.                                                                                                                         | `relay_local_access`    |
| `S3_SECRET_ACCESS_KEY`      | Secret key for local storage. A placeholder; replace outside local development.                                                                                                                         | `relay_local_secret`    |
| `S3_FORCE_PATH_STYLE`       | Addresses buckets as a path rather than a subdomain. Required by the local service; a managed provider usually wants `false`.                                                                           | `true`                  |
| `OBJECT_STORE_PORT`         | Published port for the storage API.                                                                                                                                                                     | `9000`                  |
| `OBJECT_STORE_CONSOLE_PORT` | Published port for the storage service's own console.                                                                                                                                                   | `9001`                  |

### Email — captured locally, no provider account required

| Variable          | Purpose                                                                                                                                                                              | Default                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `SMTP_URL`        | Transport the local mail sink listens on. It accepts any credentials and sends nothing onward, so verification codes, invitations and reset links are readable in its web interface. | `smtp://localhost:1025`              |
| `EMAIL_TRANSPORT` | Which transport the provider-agnostic adapter selects: `console` writes each message to the log, `smtp` hands it to the transport above.                                             | `console`                            |
| `EMAIL_FROM`      | Sender address. The domain is a placeholder that cannot resolve, which is the point — nothing should reply to it.                                                                    | `"Relay <no-reply@relay.localhost>"` |
| `MAIL_SMTP_PORT`  | Published SMTP port for the sink.                                                                                                                                                    | `1025`                               |
| `MAIL_UI_PORT`    | Published port for the web interface where captured mail is read.                                                                                                                    | `8025`                               |

### Public origins

| Variable            | Purpose                                                                                                                                                                          | Default                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `PUBLIC_APP_URL`    | Where the client is served. Every link the server puts in an email is built against this, so it must be an origin the recipient can open.                                        | `http://localhost:5173`        |
| `PUBLIC_API_URL`    | Where the API is served. The client's dev server proxies to it, so the browser sees one origin and the socket upgrade carries the session cookie with no cross-origin exception. | `http://localhost:3001`        |
| `PUBLIC_SOCKET_URL` | Socket origin as the server understands it. Distinct from the two above because a deployment may terminate socket traffic elsewhere.                                             | `ws://localhost:3001/realtime` |

### Client-exposed configuration — the only two variables the browser ever sees

The bundler exposes exactly the `VITE_`-prefixed namespace to the browser bundle. Anything named
that way is **public**, shipped verbatim to every visitor and readable with a text editor, so
nothing secret may ever carry the prefix — not the session secret, not a connection string, not a
storage key. The two names below are same-origin paths rather than absolute URLs, which is what
keeps the session cookie first-party; neither is a secret and neither carries a port.

| Variable          | Purpose                                                                                                | Default     |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ----------- |
| `VITE_API_URL`    | Same-origin path the client calls the API on. Proxied in development, reverse-proxied in a deployment. | `/api`      |
| `VITE_SOCKET_URL` | Same-origin path the socket client resolves against the current page, swapping the scheme to match.    | `/realtime` |

### Rate limits — the authentication and send paths

Requests permitted per window, per caller. These protect the two paths worth attacking cheaply:
credential submission and message send.

| Variable                         | Purpose                                      | Default |
| -------------------------------- | -------------------------------------------- | ------- |
| `RATE_LIMIT_AUTH_MAX`            | Requests permitted per window on auth paths. | `10`    |
| `RATE_LIMIT_AUTH_WINDOW_SECONDS` | Length of that window, in seconds.           | `60`    |
| `RATE_LIMIT_SEND_MAX`            | Messages permitted per window per caller.    | `60`    |
| `RATE_LIMIT_SEND_WINDOW_SECONDS` | Length of that window, in seconds.           | `60`    |

### Configurable product defaults

Exactly five, and the set is closed: a sixth here with no row in
[`docs/decisions/observed-values.md`](docs/decisions/observed-values.md), or a row there with no
variable here, is a defect. Each is a **chosen default** rather than an observed invariant. A figure
read from a single frame is a hypothesis about a default, so the mechanism it belongs to ships as
working, enforced functionality and the figure becomes a documented, overridable setting: build the
timer, configure the duration.

| Variable                          | Purpose                                                                                                                                                                                                                                                                                          | Default |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `INVITE_EXPIRY_DAYS`              | Lifetime of a workspace invitation link, in days. Enforced on redemption against the absolute expiry stored on the invitation. Two surfaces state two different lifetimes for the same kind of link, so a conventional round default was chosen and the readings kept as corroborating evidence. | `30`    |
| `EXTERNAL_ACCEPTANCE_WINDOW_DAYS` | Window in which an external collaborator may accept an invitation, in days. Adopted from the evidence unchanged, because that surface describes a window that has not begun to run.                                                                                                              | `14`    |
| `GUEST_CHANNEL_LIMIT`             | Channels a guest may be scoped to without the separate multi-channel allowance. No figure is evidenced anywhere, so this is the smallest coherent behaviour: any larger figure would pre-grant what the allowance exists to grant. Enforced server-side.                                         | `1`     |
| `SESSION_IDLE_TIMEOUT_MINUTES`    | Idle bound on a session, in minutes — one day. Authored, because a single authenticated capture cannot show a session ending. Enforced against the absolute expiry stored on the session record.                                                                                                 | `1440`  |
| `SESSION_ABSOLUTE_TIMEOUT_HOURS`  | Absolute maximum lifetime of a session, in hours — thirty days. Written once at sign-in beside the idle bound. The two bounds are independent: reaching either ends the session.                                                                                                                 | `720`   |

### Container-tool reconciliation

| Variable               | Purpose                                                                                                                                                                                                                     | Default                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `COMPOSE_FILE`         | Points the compose tool at the stack under `infra/`, which is what lets the documented `docker compose up -d` run from the repository root verbatim.                                                                        | `infra/docker-compose.yml` |
| `COMPOSE_PROJECT_NAME` | Fixes the project name so the same containers, volumes and network are found every time. The tool otherwise derives it from the checkout directory's name, and a checkout directory is not a stable input.                  | `relay`                    |
| `CLONE_INDEX`          | Offset convention for parallel checkouts, read by whoever sets them up rather than by application code: give each clone a distinct integer and shift every published port by that amount. Zero is the single-clone default. | `0`                        |

## Testing and the pipeline gate

The gate runs eight stages, and **a green pipeline with a skipped stage is not a green pipeline**.

| Stage            | What it establishes                                                                                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typecheck        | Every workspace compiles under the strict configuration, with no emit.                                                                                                                                            |
| Lint             | Including the import-boundary rule, which is what turns "one contract, one implementation" into a build failure rather than a review comment.                                                                     |
| Unit             | The unit and component suites across every workspace.                                                                                                                                                             |
| Integration      | The API against a **real PostgreSQL instance in a container**, not a mock or an in-memory substitute. Isolation, authorization denial, projection leakage, realtime ordering and idempotency are all proven here. |
| End-to-end       | The product driven through a browser, one specification per surface family.                                                                                                                                       |
| Accessibility    | An automated scan over every Phase-1 route, with explicit assertions for the criteria a scanner cannot judge.                                                                                                     |
| Brand scan       | No third-party product name anywhere outside the five read-only input paths.                                                                                                                                      |
| Corpus integrity | The expected frame count, and every frame byte-identical to its committed state.                                                                                                                                  |

Two proofs need two of something, and neither is obtainable with one:

- **Cross-instance fan-out** is proven with **two server instances**. A message sent through one
  must reach a socket held by the other. A single instance would pass a test that proves nothing,
  because local delivery and bus delivery are different code paths.
- **Per-viewer state** is proven with **two connected clients**. Unread state, read cursors and
  presence are properties of a viewer rather than of a message, so one client cannot distinguish a
  correct implementation from one that stores the flag on the shared record.

The million-message pagination benchmark is authored and runnable, and it runs **outside** the
default gate — in `.github/workflows/bench.yml` rather than the main workflow — so that the gate
stays fast. Seed its fixture with `pnpm db:seed:bulk` first.

Two figures are **targets**, stated here as targets and not as results: 80% line coverage in
`apps/api`, and 100% of the 241 Phase-1 acceptance criteria represented by a test. The manifest at
[`docs/decisions/ac-manifest.md`](docs/decisions/ac-manifest.md) is the record of which test is
meant to prove which criterion, and it was generated before the surfaces it describes were
implemented — deliberately, because it is a contract about what must happen rather than a report
about what did. **No criterion is satisfied until a test that cites it passes.** Every such test
carries its citation inline, naming the source document, the line and the frame, so the manifest can
be regenerated by reading the tests with `pnpm ac:manifest` rather than by trusting a table.

## Reporting

The operative gate authority is
[`docs/decisions/phase-gates-ledger.md`](docs/decisions/phase-gates-ledger.md), and it is worth
stating plainly why it lives there rather than where it is cited. The build prompt names
`docs/PHASE-GATES.md` as the authority on exit conditions for every phase, and gives that file
precedence over the prompt itself where the two disagree. **That file does not exist in this
repository.** The prompt's own inline restatement of the ledger is therefore the only available
authority and is operative in full. Because new documents are confined to `docs/decisions/`, the
ledger cannot be created at the path the prompt names without breaching the write boundary in the
very act of satisfying a citation — so it is mirrored to a permitted path instead, and the absence
is logged in [`docs/decisions/catalog-defects.md`](docs/decisions/catalog-defects.md).

Reporting happens at two points only: Phase-0 exit and run end. The format is this:

```text
Phase 0 authored        N/11
Phase 1 area criteria   N/241  (00:N/39 · 01:N/46 · 02:N/61 · 03:N/57 · 21:N/38)
Phase 1 catalog         N/12
Phase 1 authored        N/3
Standing                N/11
Run total               N/267
Deferred                <explicit list, each with a reason>
Frames opened           N  (see docs/decisions/frame-access-log.md)
```

**Gate families are reported separately and are never summed into one another.** They count
different kinds of thing — a foundation a later phase stands on, one checklist item in one area
document, a phase-exit condition the specification set for itself, a condition that must hold
continuously — and a merged figure answers no question anyone has while concealing exactly what a
reader needs, because a family at full coverage cannot compensate for a family that is short.

Two specifics follow from that, and both are easy to get wrong:

- **The 11 Phase-0 authored gates and the 11 standing gates are disjoint sets and must never be
  summed.** Both happen to number eleven, which is the whole hazard: two elevens in one report
  invite a reader to treat one as a restatement of the other, or to add them into a
  plausible-looking twenty-two. They overlap in subject at several points and in membership at none.
- **The run total is 267 = 11 + 241 + 12 + 3, and the standing 11 sits outside it** by construction
  rather than by oversight. Reaching 278 is the specific error the ledger exists to prevent.

The per-area subtotals — 39 · 46 · 61 · 57 · 38 = **241** — were verified independently by counting
the checklist items published in each of the five Phase-1 area documents, and they agree with both
the requirement ledger and the catalog's own gate. The label column is fixed;
`Phase 1 area criteria` in particular must stay byte-identical, because the manifest regenerator
holds that exact string as the label of the family it reports, and a report whose label drifts from
the tool's cannot be cross-checked against it.

The `Deferred` line takes an explicit list, each item with a reason. "Not done" without a reason is
not an acceptable report line. `Frames opened` is a count of frames actually opened, and it points
at [`docs/decisions/frame-access-log.md`](docs/decisions/frame-access-log.md).

## Read-only inputs and the write boundary

Five paths are **read-only inputs**. They are the specification this product was built from, and
they are not a working surface.

| Path                    | What it is                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `screenshots/`          | 1,022 captured frames of a third party's product. All 1,022 must remain byte-identical.                                |
| `docs/workflows/`       | The workflow catalog: 25 documents describing flows, components, entities, security contracts and acceptance criteria. |
| `blitzy/documentation/` | Vendor documentation, context only.                                                                                    |
| `catalog-info.yaml`     | Service metadata. It binds the implementation language, and it retains a third-party product name by rule.             |
| `mkdocs.yml`            | Documentation-site configuration. It also retains a third-party product name by rule.                                  |

Nothing under those paths may be modified, moved, renamed, deleted, compressed, re-encoded or
reformatted. The last two are the reason the brand guard carries an allowlist at all: both retain a
prohibited name and both are read-only, so they are exempted rather than rewritten. The allowlist is
exactly those five paths and is frozen at five — it is the rule's own enumeration, not a judgement
about what is inconvenient to fix.

**The write boundary.** New code goes only under `apps/`, `packages/`, `infra/` and `tools/`. New
documents go only under `docs/decisions/`. There is no third option. This file and
[`docs/index.md`](docs/index.md) sit outside both lists for one reason only: neither is new. Both
already existed, both were writable, and both were rewritten in place. Rewriting an existing file is
not the same act as creating a document, so neither is a new document and neither needed to move.

**Reading discipline.** Resolve any question from the catalog prose first; it is the primary source
and it is far more complete than it looks. Open a frame only when one of three conditions holds: the
step table for the flow being implemented cites that specific frame and its prose is insufficient to
implement the step; the frame is named in
[`docs/decisions/measurement-manifest.md`](docs/decisions/measurement-manifest.md); or the frame is
named explicitly in the build prompt. Never survey, enumerate, sample or scan the corpus, and never
open a frame to confirm something the catalog already states. Any task that needs more than six
frames appends a justification to
[`docs/decisions/frame-access-log.md`](docs/decisions/frame-access-log.md) naming the frame, the
task and what the catalog failed to answer. Where the catalog and an opened frame conflict the frame
governs — except for colour values, icon artwork and product copy, which are governed by the build
prompt and never by the pixels. Cite a frame by its number, never by its filename.

**Defects are recorded, not corrected.** Where the catalog is wrong, self-contradicting or
incomplete, the defect is written up in
[`docs/decisions/catalog-defects.md`](docs/decisions/catalog-defects.md) and the work proceeds under
the stated precedence order. Editing the specification to fix it is prohibited, so a downstream
reader sees the contradiction rather than inheriting a silent choice.

**Containment.** The corpus must never reach build output, a container image or a client bundle.
[`.dockerignore`](.dockerignore) keeps it out of the build context,
[`.gitattributes`](.gitattributes) marks it binary so no tool attempts a diff or a merge on it, and
`pnpm check:corpus` verifies the file count and byte-identity from filesystem and repository
metadata alone — it never opens a frame, because opening them to check them would itself be the
survey the rule prohibits.

## Contributor conventions

**Authorization — client rendering is never evidence of permission.** Every mutation is authorized
on the server at the point of execution, evaluated against the acting session and the specific
target object, through the single guard in `apps/api/src/authz/`. A control that is hidden, disabled
or absent in the interface exempts nothing. Every read path enforces workspace isolation through the
client extension in `packages/db/src/tenancy.ts`, which sits below every caller so a call site
cannot forget it. Projections are read paths and each is authorized independently: counts, search
results, link previews and link resolution, member lists, facepiles, autocomplete suggestions and
notifications. No authorization decision may rest on a caller-supplied workspace or actor identifier
— the workspace identifier can only ever originate server-side, from the session. Every mutation and
every projection ships with a test asserting that a non-member and a wrong-role caller receive a
server-side denial, and that a private resource is absent from every one of those projections.

**Shared components are implemented exactly once.** Every component contract lives in `packages/ui`
and nowhere else, satisfying that contract's regions, variants and states. Import the shared
implementation from the barrel — `@relay/ui` — and never declare a local, partial or inlined
equivalent in an application or feature directory, not even when only one variant is needed. Deep
imports and local re-implementations are both lint errors, which is what makes this mechanical
rather than aspirational. Where a variant the shared component lacks is needed, **extend the shared
component and update its tests** rather than forking it. And never merge two contracts that look
similar: the composer's nine-control formatting toolbar and the seven-control composer action row
are **separate components** with separate groupings, and rendering one where the other belongs is a
defect.

The rest, briefly:

- **Internal dependencies use the `workspace:*` protocol**, never a published version range.
- **Consumers import from a package barrel only.** This is the same rule as the component rule
  above, generalised: a deep import reaches past the contract the package publishes.
- **Styling is CSS Modules plus design tokens.** There is no utility-class framework, by decision
  rather than by omission — the tokens are the contract. Every rendered value resolves to a token in
  `packages/ui/src/styles/tokens.ts`; the only literals permitted at a point of use are `0`, `none`,
  `auto`, `inherit`, `currentColor` and `transparent`, and colour literals exist in that one file
  and nowhere else in the tree. The dark theme is a derivation over the same token names, so no
  consumer ever branches on theme.
- **Server state lives in the query cache, never in a global store.** The global store holds shell
  and ephemeral interface state only.
- **History paginates by keyset, never by offset.** An offset carries no context, forces the
  database to fetch and discard, and duplicates rows when something is inserted between two page
  fetches. No page index crosses the API boundary; the cursor is opaque.
- **Sessions are server-side revocable records behind an HTTP-only cookie.** No token is ever put in
  browser storage.
- **Uploads are pre-signed.** File bytes never transit the API.
- **Cite the evidence.** For any non-obvious detail, name the frame number in a comment and link the
  decision record that settled it. A value measurement could not recover carries an explicit marker
  pointing at the record that justifies the chosen default, so a reader can always tell a measured
  value from an authored one.
- **Prefer boring, well-supported choices.** Where two approaches are equally viable, take the one
  that keeps the security contracts easiest to verify.

## Documentation

| Where                                | What is there                                                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/index.md`](docs/index.md)     | The documentation site's landing page, and the entry point to everything below.                                                                                                 |
| [`docs/workflows/`](docs/workflows/) | The read-only catalog: flows, component contracts, the data model, the security contracts and the acceptance criteria. Start at its index.                                      |
| [`docs/decisions/`](docs/decisions/) | The 22 decision records — every choice this build made that the specification did not make for it, each with its evidence and reasoning. Indexed by `docs/decisions/README.md`. |

The decision records carry the parts of the design the catalog could not: the authored role matrix
that the denial suite is built against, the measurement manifest and the type scale, the state
matrix, the realtime and HTTP contracts, the gate ledger, the catalog defects and the frame-access
log. Read [`docs/decisions/catalog-defects.md`](docs/decisions/catalog-defects.md) before trusting a
figure that appears in two places.

The documentation-site configuration is read-only, so it carries no navigation entry for the
decision records and none can be added to it. That is precisely why [`docs/index.md`](docs/index.md)
links them: the landing page is writable and is the only place a site visitor can be pointed from.
