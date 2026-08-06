# Workflow Catalog

An executable specification of every workflow visible in the 1,022-frame screenshot corpus, written so that a build run can construct the product from this catalog alone.

## Purpose and ultimate goal

The ultimate goal of this catalog is **for Blitzy to build its own, own-branded team-communication platform from this catalog alone** — a product of the kind the corpus depicts, carrying Blitzy's own product name, branding and colour palette, and owing nothing to the third party whose interface the corpus captures.

That goal is why the catalog exists in this form. The repository states of itself that it "currently contains only screenshots and planning materials" and that "No code has been written yet." [README.md:L3-L5]. There is no application source to describe, no API to reference and no running system to observe. The 1,022 PNG frames under `screenshots/` are therefore not merely supporting illustration — they are the **entire** available specification of the product's behaviour, and until now they were a passive design-reference library: an inventory of image files whose contents had never been read out of the pixels and written down.

This catalog converts that library into an **executable specification**. Each of the 23 workflow-area documents states, for its area, what the user can do, in what order, on which screens, with which components, in which states, over which data, subject to which validations, and against which acceptance criteria — every claim carried back to the frame that shows it. The [Screenshot Coverage Index](_screenshot-index.md) then proves that no frame was silently dropped: one row per frame, 1,022 rows, each with a caption written from direct visual inspection and a named flow and owning area document. This document aggregates what no single area document can express on its own — the whole-product information architecture, the shared component inventory, the consolidated data model, and a phased build backlog — and closes with a ready-to-paste [Next Build Run Prompt](#next-build-run-prompt) that hands the work to the next run.

Two consequences of that goal shape everything below, and both are constraints rather than preferences:

- **Behaviour and layout are specified; third-party identity is not.** Where the corpus shows branded material — a logo mark, a wordmark, a product name, a palette value — this catalog restates it as a generic placeholder and never adopts it as a requirement. The next run chooses its own name and palette.
- **Observation is specified; recollection is not.** Every statement in this catalog asserts what a frame shows, or is explicitly marked as an inference with its basis. Describing a screen from general familiarity with the captured product rather than from the pixels is a fabrication, and a fabricated specification is worse than no specification, because it cannot be checked.

## How to use this catalog

**If you are the build run, read in this order.** Start here, end here.

1. **This document, sections [Purpose](#purpose-and-ultimate-goal) to [Prioritized build backlog](#prioritized-build-backlog).** The [information-architecture map](#product-information-architecture) tells you what surfaces exist; the [component roll-up](#consolidated-component-inventory-roll-up) tells you what to build once and reuse; the [consolidated data model](#consolidated-data-model) tells you what to persist; the [backlog](#prioritized-build-backlog) tells you what order to build in.
2. **[`00-product-overview.md`](00-product-overview.md) in full, before any other area document.** It holds the authoritative definition of every reusable component and of the placeholder branding vocabulary. Every other document references those by identifier and does not restate them, so an area document read on its own will point at definitions you have not yet loaded.
3. **The area documents for your current build phase**, in the order the [backlog](#prioritized-build-backlog) gives. Each is self-contained for its own area: purpose, flows, per-flow step tables, components, states, implied data model, transitions, edge cases, acceptance criteria and frame provenance.
4. **[`_screenshot-index.md`](_screenshot-index.md) as a lookup, not a read-through.** Use it to answer "which flow covers frame N?" and "what did frame N actually show?".
5. **Back here, to the [Next Build Run Prompt](#next-build-run-prompt) and the [Known limitations](#known-limitations)**, before you write anything.

**Flow identifiers.** A flow is one goal-directed user journey — "invite a teammate", "create a channel", "start a huddle". Every flow has a stable identifier of the form `<area>.<flow>`: `02.3` is the third flow defined in [`02-channels.md`](02-channels.md), and `15.22` is the twenty-second in [`15-admin-workspace.md`](15-admin-workspace.md). Flow numbers are allocated per area in the order the flows first appear in the corpus. **248 flows** cover the corpus; all of them are defined once, in the [Flow groupings](_screenshot-index.md#flow-groupings) table of the coverage index, and cited by identifier everywhere else.

**Frame citations.** Every non-trivial claim carries an inline citation of the frame that evidences it, written as a percent-encoded relative link — for example [frame 569](../../screenshots/Slack%20web%20Jul%202024%20569.png). Repository files are cited as `[<path>:<locator>]`, for example [README.md:L3-L5]. A claim with no citation is unsupported and should be treated as such.

**Component and entity identifiers.** Reusable components are cited as `C-*` and data entities as `E-*` — always by identifier, never by heading anchor, so that renaming a heading cannot silently break a cross-reference. Every `C-*` resolves to a definition in [`00-product-overview.md`](00-product-overview.md) and appears in the [roll-up](#consolidated-component-inventory-roll-up); every `E-*` appears in the [consolidated data model](#consolidated-data-model).

**Evidence markers.** Five notations are used identically in all 25 documents:

| Marker | Meaning |
|---|---|
| *(plain prose)* | **Observed.** An unqualified statement asserts what the cited frame shows. |
| `**Inferred:**` | **Not directly visible.** The statement is a deduction, and the text immediately states the basis for it — for example, that a field is required because the primary action renders disabled until it is filled. |
| `> **Partial capture:**` | The corpus shows this workflow only in part. The note names which steps are missing, so the gap is visible rather than papered over. |
| *(the ledger's uninspectable-frame marker)* | A frame that could not be visually inspected, carrying no description of any kind. The marker is a ledger row's own vocabulary and is written out only there; **no frame in this corpus needed it** — all 1,022 were inspected [_screenshot-index.md](_screenshot-index.md#non-informative-and-unreadable-frames). |
| `> **Build obligation:**` | **A requirement the build must satisfy that the corpus cannot evidence either way.** The sentence names the requirement and says plainly that the corpus is silent on it. It never claims a frame shows the control, and it never converts silence into a permission. Defined authoritatively, with its two binding rules, in [`00-product-overview.md`](00-product-overview.md). |

**One primary owner per frame.** The application shell is visible in nearly every in-product frame, so without a rule a single frame could be claimed by a dozen areas and the coverage arithmetic would be meaningless. Each frame therefore has exactly **one primary owning area document** — the document responsible for specifying it — plus any number of optional secondary cross-references. The coverage index names the primary owner first on every row and ignores secondary references in its arithmetic. A cross-cutting area may consequently own very few frames: [`21-states.md`](21-states.md) is the primary owner of only two frames and appears as a secondary reference throughout the catalog, which is the rule working as intended and not a coverage gap.

**Sample data is not a requirement.** The corpus captures a single demo workspace, so the catalog draws its worked examples from fixtures actually visible in the frames — channels `#design`, `#marketing` and `#social`, a company-wide channel, people named Sam Lee, Alex Smith and Jane D, and role badges reading `guest` and `you`. These are illustrations of shape, never values to reproduce.

## Index of catalog documents

Twenty-five documents make up the catalog: this master index, the coverage ledger, and 23 workflow-area documents. **Twenty-four are delivered; the one marked *Outstanding* below is not yet written and is recorded in [Omissions](#omissions) with its frame and flow allocations.** Per-area flow and frame counts are held in one place only — the [Coverage assertion](_screenshot-index.md#coverage-assertion) table of the coverage index — so that the arithmetic has a single source of truth.

| Document | Area | What it covers |
|---|---|---|
| *(this page)* | Master index | Whole-product information architecture, the component roll-up, the consolidated data model, the phased build backlog, the flow-reconstruction methodology, the taxonomy deviations, the known limitations and the Next Build Run Prompt |
| [00-product-overview.md](00-product-overview.md) | Product Overview & App Shell | The persistent authenticated shell — left navigation rail and its destinations, workspace switcher, sidebar with its collapsible sections and multi-select mode, top bar with history controls and search entry, global create menu, help entry. **Holds the authoritative definition of all 53 reusable components and of the placeholder branding vocabulary**, plus the rail destination map and the automations boundary rule |
| [01-onboarding-and-auth.md](01-onboarding-and-auth.md) | Onboarding & Authentication | Sign-up by email address, verification by emailed code, account and marketing-consent confirmation, the five-step workspace setup wizard, profile-photo upload and crop, first-run coach marks, sign-in by password, by emailed code and by reset link with their rejection and recovery states, joining a workspace from an invitation, the welcome-back workspace chooser, inviting members and guests with channel scope and an expiry, and hand-off from the browser to the desktop and mobile clients |
| [02-channels.md](02-channels.md) | Channels | The full channel lifecycle — two-step creation with a visibility choice, adding and removing members with destructive confirmation, the four-tab details pane, renaming and editing topic and description, notification preferences and muting, starring, bookmarks and bookmark folders, conversion to private, archiving, unarchiving and deletion, the channel browser with its scope, type and sort filters, and the company-wide channel |
| [03-messaging-and-composer.md](03-messaging-and-composer.md) | Messaging & Composer | The message list and message row, the composer and its formatting toolbar, multi-line formatted messages, snippets, channel and person mentions, scheduled send, slash-command autocomplete, audio-clip recording and attachment, the emoji picker with custom emoji and emoji packs, hover actions, forwarding, pinning, inline editing and deletion, and the distraction-free composer |
| [04-threads.md](04-threads.md) | Threads | Replying in a thread on a channel message, the thread pane and its reply composer, the also-send-to-channel and also-send-as-direct-message options, the huddle thread, and the threads destination with its unread divider |
| [05-direct-messages.md](05-direct-messages.md) | Direct Messages | Opening a one-to-one direct message and composing in it, the direct-messages destination, the same conversation seen from the other participant's session with its huddle history, huddle summary messages in a conversation, presence semantics and the conversation header action set |
| [06-huddles.md](06-huddles.md) | Huddles | Starting a huddle from a conversation and from the huddles destination, copying a huddle link, connection diagnostics, setting a topic, the participant stage and the bottom control bar, reactions and the overflow menu, themes and decorative backgrounds, captions, hiding self-view, camera backgrounds, screen share and the huddle thread |
| [07-canvases.md](07-canvases.md) | Canvases | Attaching an existing canvas to a message, creating and building a new canvas, the templates browser and its preview, inserting image, file, checklist, table and profile-card blocks, the canvas pane in a conversation, the overflow menu, cover images, accessibility settings and read-only reading |
| [08-lists.md](08-lists.md) | Lists | Creating a list from scratch and from a template, entering and editing items, the record detail pane and its fields, adding, editing, converting and deleting custom fields, starring, list details with copy-link and CSV download, switching views and layouts, filtering, sorting, hiding fields, grouping, saving a view and sending feedback |
| [09-search-and-filters.md](09-search-and-filters.md) | Search & Filters | Opening search and its recent-search history, the result-type tabs with their counts, filtering by sender, location, participant, date and file type, the anchored per-chip popovers and the centred filter-by modal, the only-my-channels and exclude-automations toggles, sorting, layout switching and the empty and zero-count states |
| [10-workflow-builder.md](10-workflow-builder.md) | Workflow Builder | The builder's tab set, importing and creating, the templates grid and start-from-scratch, the workflow editor with its trigger card and needs-attention warning, editing a send-a-message step with its recipient combobox, variables and optional button, publishing, and the legacy-workflows empty state |
| [11-apps-and-integrations.md](11-apps-and-integrations.md) | Apps & Integrations | The in-product apps surface with its installed count, category search and recommended rows, app home surfaces with their tab set, the app-directory marketing site with its browse, collection and essential-apps pages, and the developer-platform home, documentation, feature-comparison tables and tutorials |
| [12-activity-notifications.md](12-activity-notifications.md) | Activity & Notifications | The browser notification-permission gate and its confirmation, the activity destination and its filter tabs, per-entry overflow actions and reminders, the later destination and its overdue reminders, working through unreads with conversation filters, and the drafts, scheduled and sent surfaces |
| [13-profiles-people.md](13-profiles-people.md) | Profiles & People | The people destination and person search, the own-profile pane, editing profile fields including a recorded name clip and a time zone, editing about-me details with a date picker, previewing your profile as a coworker, setting a status with an emoji and a clear-after time, presence changes, pausing notifications and do-not-disturb |
| [14-preferences-settings.md](14-preferences-settings.md) | Preferences & Settings | The preferences dialog and its full tab inventory — notifications with a schedule and keywords, navigation, home, themes, messages and media, language and region, accessibility, mark as read, audio and video with device selects and level meters, connected accounts, privacy and visibility, advanced — and the audio-and-video diagnostics sub-flow with its pass, spinner, pending and permission-denied rows |
| [15-admin-workspace.md](15-admin-workspace.md) | Admin & Workspace | **Two flow groups.** The in-app workspace menu and its tools-and-settings submenu; and the standalone browser administration console — its home, account and workspace settings, authentication and two-factor, password re-confirmation for sensitive changes, data export, workspace deletion, account deactivation, analytics, customization, custom emoji, workspace icon, about-this-workspace, member management, user groups, invitations and invite links, permissions by account type, and billing with its overview, history, settings, promotional codes and payment methods |
| [16-files-media.md](16-files-media.md) | Files & Media | Uploading a file and posting it as a message, the composer attachment menu, re-sharing a file, recording, reviewing and posting a video clip, the files destination with its filters and grouped rows, the shared-files card in the channel details pane, and media playback controls |
| [17-marketing-site.md](17-marketing-site.md) | Marketing Site — **Outstanding** | The unauthenticated marketing site — the landing page and its mega-menus, sections and footer, the product pages, solutions pages by audience, the statistics and comparison pages, the resources library with its collections and facet filters, articles, videos and webinars, customer stories, the blog, the newsletter, what's-new, partnerships, demo requests, sales contact, site search, region and language switching, the status page, the about and careers pages, the merchandise store with its basket and checkout, and the terms and policies pages |
| [18-pricing-plans.md](18-pricing-plans.md) | Pricing & Plans | The pricing page and its plan cards, the feature-comparison table and its mixed cell types, per-column purchase and contact calls to action, the in-product plan chooser and paid-plan tour, and the upgrade and checkout journey |
| [19-brand-guidelines.md](19-brand-guidelines.md) | Brand Guidelines | The brand-centre site documented as a **page structure to rebuild with the next run's own brand** — its navigation grouping, the brand-values pages, the colour pages, the swatch-row anatomy with its four colour notations, and colour usage and application guidance. Observed values are placeholders, never requirements |
| [20-help-community.md](20-help-community.md) | Help & Community | The in-app help panel, raising and tracking a support request from the administration console, the help-centre home, search, articles with in-article navigation, the article-feedback form with its character counter and disabled submit, category browsing, contacting support, the changelog, the community marketing page, the community forum with its discussions, topics, questions and groups, the guidelines, and the certification programme with its questions |
| [21-states.md](21-states.md) | Error, Empty & Loading States | The cross-cutting state matrix — default, hover, focus, active, empty, loading, error, disabled, permission-gated and upgrade-gated — each with an observed exemplar frame, plus the `C-UPGRADE-GATE` state set and the application error page. Primary owner of only the two error-page frames and a secondary reference throughout |
| [22-external-collaboration.md](22-external-collaboration.md) | External Collaboration | **New area.** The external-connections destination with its organizations and invitations sections, people search by name, company or email, managing connection requests and connections, inviting an external person into a conversation by email, the invitation-sent confirmation with its acceptance window, the received and sent invitation tabs and their empty states, guest accounts, and upgrade-gated external channel creation |
| [_screenshot-index.md](_screenshot-index.md) | Screenshot Coverage Index | The coverage ledger — exactly one row per frame across frames 0 to 1021, each with an observed caption and its owning flow and area document; the coverage assertion and per-area distribution; the 248 flow groupings; the byte-identical duplicate groups; and the near-duplicate and visually sparse frame notes |

## Product information architecture

The corpus captures four structurally distinct surface families, and the boundaries between them are architectural rather than cosmetic: an unauthenticated public web site, an authentication and onboarding path, the authenticated application shell with its destinations, and a **standalone browser administration console** that has its own top bar and its own left navigation and is reached by following an external link out of the application [frame 567](../../screenshots/Slack%20web%20Jul%202024%20567.png). Every node below is a surface actually observed in a frame, and every node names the area document that owns it. Edges are transitions observed in the corpus, not plausible routes.

```mermaid
flowchart TD
    subgraph PUBLIC["Unauthenticated public web surfaces"]
        LANDING["Landing page and mega-menus - 17-marketing-site.md"]
        PRODPAGES["Product and solutions pages - 17-marketing-site.md"]
        RESOURCES["Resources, stories, blog, careers, store, policies - 17-marketing-site.md"]
        PRICINGPG["Pricing page and comparison table - 18-pricing-plans.md"]
        BRAND["Brand centre - 19-brand-guidelines.md"]
        HELPCTR["Help centre and support contact - 20-help-community.md"]
        COMMUNITY["Community forum and certification - 20-help-community.md"]
        APPDIR["App directory site - 11-apps-and-integrations.md"]
        DEVPLAT["Developer platform and docs - 11-apps-and-integrations.md"]
        ERRPAGE["Application error page - 21-states.md"]
    end

    subgraph GATE["Authentication and onboarding"]
        SIGNUP["Sign up, verify code, confirm account - 01-onboarding-and-auth.md"]
        SIGNIN["Sign in by password, code or reset link - 01-onboarding-and-auth.md"]
        WIZARD["Five-step workspace setup wizard - 01-onboarding-and-auth.md"]
        JOININV["Accept invitation and choose workspace - 01-onboarding-and-auth.md"]
        HANDOFF["Desktop and mobile client hand-off - 01-onboarding-and-auth.md"]
    end

    subgraph APP["Authenticated application shell"]
        SHELL["Rail, sidebar, top bar, search entry, create menu - 00-product-overview.md"]
        CHANNEL["Channel view, details pane, browser - 02-channels.md"]
        DM["Direct messages destination - 05-direct-messages.md"]
        THREADS["Threads view and thread pane - 04-threads.md"]
        COMPOSER["Composer, formatting, slash commands, clips - 03-messaging-and-composer.md"]
        HUDDLE["Huddle stage and control bar - 06-huddles.md"]
        CANVAS["Canvas pane and templates - 07-canvases.md"]
        LISTS["Lists destination, records, views - 08-lists.md"]
        SEARCH["Search overlay and results - 09-search-and-filters.md"]
        BUILDER["Workflow builder and editor - 10-workflow-builder.md"]
        APPSURF["Apps surface and app homes - 11-apps-and-integrations.md"]
        ACTIVITY["Activity, later, drafts and sent - 12-activity-notifications.md"]
        PEOPLE["People destination and profile pane - 13-profiles-people.md"]
        PREFS["Preferences dialog and diagnostics - 14-preferences-settings.md"]
        FILES["Files destination and previews - 16-files-media.md"]
        EXTCONN["External connections destination - 22-external-collaboration.md"]
        WSMENU["Workspace menu and tools submenu - 15-admin-workspace.md"]
        INPLAN["In-product plan chooser and checkout - 18-pricing-plans.md"]
        HELPPANEL["In-app help panel - 20-help-community.md"]
    end

    subgraph CONSOLE["Standalone browser administration console"]
        ADMIN["Console home, settings, members, analytics, billing - 15-admin-workspace.md"]
        ADMINSUP["Support request tracking - 20-help-community.md"]
    end

    LANDING --> PRODPAGES
    LANDING --> RESOURCES
    LANDING --> PRICINGPG
    LANDING --> SIGNUP
    LANDING --> SIGNIN
    PRODPAGES --> SIGNUP
    PRICINGPG --> SIGNUP
    RESOURCES --> HELPCTR
    HELPCTR --> COMMUNITY
    APPDIR --> SIGNIN
    DEVPLAT --> APPDIR
    SIGNUP --> WIZARD
    SIGNIN --> JOININV
    JOININV --> SHELL
    WIZARD --> SHELL
    SIGNIN --> HANDOFF
    HANDOFF --> SHELL
    SHELL --> CHANNEL
    SHELL --> DM
    SHELL --> THREADS
    SHELL --> LISTS
    SHELL --> SEARCH
    SHELL --> APPSURF
    SHELL --> ACTIVITY
    SHELL --> PEOPLE
    SHELL --> FILES
    SHELL --> EXTCONN
    SHELL --> CANVAS
    SHELL --> HUDDLE
    SHELL --> WSMENU
    SHELL --> HELPPANEL
    CHANNEL --> COMPOSER
    CHANNEL --> THREADS
    CHANNEL --> CANVAS
    CHANNEL --> HUDDLE
    DM --> COMPOSER
    DM --> HUDDLE
    DM --> CANVAS
    HUDDLE --> THREADS
    ACTIVITY --> THREADS
    SEARCH --> CHANNEL
    APPSURF --> BUILDER
    APPSURF --> APPDIR
    WSMENU --> PREFS
    WSMENU --> INPLAN
    WSMENU --> BUILDER
    WSMENU --> ADMIN
    WSMENU --> HANDOFF
    EXTCONN --> DM
    ADMIN --> ADMINSUP
    ADMIN --> INPLAN
    SHELL --> ERRPAGE
    LANDING --> ERRPAGE
```

No colour or styling is declared on this diagram, deliberately. The catalog specifies structure and behaviour; the palette is the next run's to choose, and a styled diagram would read as guidance it is not entitled to give.

Four properties of this architecture are load-bearing for the build and are stated here rather than left to be re-derived:

- **The shell is the hub, and it is persistent.** Every in-product destination is reached from the rail, the sidebar or the top bar without leaving the shell chrome, so the shell is a layout that owns a routed content region rather than a page that is navigated away from [frame 120](../../screenshots/Slack%20web%20Jul%202024%20120.png).
- **The administration console is a separate application, not a deep route.** It has its own top bar and its own two-group left navigation, and the entries that lead to it carry external-link icons in the in-app submenu [frame 567](../../screenshots/Slack%20web%20Jul%202024%20567.png), [frame 600](../../screenshots/Slack%20web%20Jul%202024%20600.png).
- **The public site is not a shell route either.** It has its own top navigation, its own footer link columns and its own sign-in entry point, and it is reachable while unauthenticated [frame 0](../../screenshots/Slack%20web%20Jul%202024%200.png).
- **The brand centre is reachable but disconnected.** It is captured as its own site with its own navigation, a visit-site link and a login control [frame 1000](../../screenshots/Slack%20web%20Jul%202024%201000.png), and the corpus never shows a link into it from any other surface. It is drawn as a node with no inbound edge for exactly that reason. **Inferred:** the next run may site its own brand pages anywhere, because the corpus imposes no constraint it could violate.

## Consolidated component inventory (roll-up)

**This is a roll-up, not a definition.** Every component's contract — its purpose, regions, variants, states, ordering and relative sizing — is defined once, authoritatively, in [`00-product-overview.md`](00-product-overview.md). Nothing here restates a contract; this table exists so that a reader can see the whole inventory at a glance and resolve any `C-*` identifier to the document that defines it. The **Referenced by** column names the area documents whose observed surfaces contain the component, which is what makes each component worth building once rather than per area. **It is computed, not curated**, so that it cannot drift: an area is listed exactly where that area's own `Screens & components` section names the component as one its screens render, minus the identifiers an area explicitly records as *not* rendered — [`10-workflow-builder.md`](10-workflow-builder.md) states that no rail, sidebar, top bar, workspace switcher or upgrade gate appears on any builder frame, [`06-huddles.md`](06-huddles.md) states that no huddle surface carries a media player, [`16-files-media.md`](16-files-media.md) states that it renders no empty state, [`14-preferences-settings.md`](14-preferences-settings.md) states that it renders no permission prompt, [`12-activity-notifications.md`](12-activity-notifications.md) states that no capture shows a toast reporting a notification, and [`01-onboarding-and-auth.md`](01-onboarding-and-auth.md) states that its reduced shell carries no top bar. [`00-product-overview.md`](00-product-overview.md) is not listed against any row, because as the defining document it contains every identifier by construction. The four area documents not yet delivered — 17, 18, 19 and 20 — contribute nothing to this column yet, and will be added to it as they land; an entry for an undelivered document would be a forecast rather than an observation, and a false attribution is worse than an omission.

The 53 identifiers below are a **floor, not a ceiling**. An area author who finds a further recurring structure defines it in [`00-product-overview.md`](00-product-overview.md) and adds it here; the closure requirement is that **every `C-*` cited anywhere in the catalog resolves to a definition in that one document and appears in this table**. Twenty-five rows arrived by exactly that route, in two waves. First, [`01-onboarding-and-auth.md`](01-onboarding-and-auth.md) found seven recurring structures with no identifier. Then the in-product areas reported twenty-six more structures, of which eighteen were genuinely new — contributed by areas 03, 06, 09, 10, 11, 14, 15 and 22 — while the remaining eight proved to be variants of contracts that already existed and were folded into those contracts' own rows instead of being given identifiers. Every reported structure is resolved; none is outstanding.

**How the `Referenced by` column is derived, so it can be regenerated rather than maintained by hand.** An area is listed against a component when that area names the identifier in a **structured position** — a step table's `Component(s) involved` cell, a component column of any other table, or a row of the area's own components-consumed table — plus [`03-messaging-and-composer.md`](03-messaging-and-composer.md), which declares its set in prose. Prose mentions elsewhere, and mentions inside a comparison, are deliberately **not** counted, because an identifier is frequently named in order to say that a surface does *not* render it: [`10-workflow-builder.md`](10-workflow-builder.md) records that no `C-RAIL`, `C-SIDEBAR` or `C-TOP-BAR` appears on any builder frame, [`06-huddles.md`](06-huddles.md) records that `C-MEDIA-PLAYER` is consumed by none of its frames, and [`12-activity-notifications.md`](12-activity-notifications.md) records that its foot-of-surface outcome line is not a `C-TOAST`. Counting those as usage would invert their meaning. Area 17 is not yet authored, so where it is already known to require a component it is listed after a `planned:` marker rather than mixed in with the areas that demonstrably consume it. Area 19 names several identifiers only to say which contract a structure is *not*, so under this rule it is listed against none of them.

| Component ID | Name | Defined in | Referenced by |
|---|---|---|---|
| `C-RAIL` | Navigation rail | [00-product-overview.md](00-product-overview.md) | 00, 01, 02, 05, 06, 07, 08, 09, 11, 12, 13, 14, 15, 16, 22 |
| `C-SIDEBAR` | Conversation sidebar with collapsible sections | [00-product-overview.md](00-product-overview.md) | 00, 01, 02, 03, 04, 05, 06, 07, 08, 11, 12, 13, 14, 15, 16, 21, 22 |
| `C-WORKSPACE-SWITCHER` | Workspace switcher and workspace menu | [00-product-overview.md](00-product-overview.md) | 00, 10, 15, 21 |
| `C-TOP-BAR` | Top bar with history controls and help entry | [00-product-overview.md](00-product-overview.md) | 00, 02, 08, 09, 14, 15, 18, 22 |
| `C-SEARCH-ENTRY` | Search entry field and overlay trigger | [00-product-overview.md](00-product-overview.md) | 02, 08, 09, 10, 11, 13, 22 · planned: 17 |
| `C-MESSAGE-ROW` | Message row with author, timestamp and body | [00-product-overview.md](00-product-overview.md) | 00, 01, 02, 03, 04, 05, 06, 07, 09, 10, 11, 12, 13, 14, 15, 16, 21 |
| `C-HOVER-ACTION-BAR` | Hover action bar on a message row | [00-product-overview.md](00-product-overview.md) | 03, 04, 05, 12, 14, 15, 21 |
| `C-COMPOSER` | Message composer with attachment and clip controls | [00-product-overview.md](00-product-overview.md) | 00, 01, 02, 03, 04, 05, 06, 07, 12, 16, 21 |
| `C-FORMATTING-TOOLBAR` | Rich-text formatting toolbar | [00-product-overview.md](00-product-overview.md) | 03, 04, 07, 08, 10 |
| `C-MODAL-SHELL` | Centred modal shell with title and dismiss control | [00-product-overview.md](00-product-overview.md) | 00, 01, 02, 03, 06, 07, 08, 09, 10, 13, 14, 15, 16, 18, 21, 22 |
| `C-STEP-WIZARD` | Multi-step wizard with progress label and Back or Next | [00-product-overview.md](00-product-overview.md) | 01, 02, 18 |
| `C-DROPDOWN-MENU` | Dropdown and select menu with optional descriptions | [00-product-overview.md](00-product-overview.md) | 00, 01, 02, 03, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22 · planned: 17 |
| `C-CONTEXT-MENU` | Overflow and right-click context menu | [00-product-overview.md](00-product-overview.md) | 00, 02, 03, 04, 06, 07, 08, 10, 12, 15 |
| `C-TAB-BAR` | Tab bar, with optional per-tab counts | [00-product-overview.md](00-product-overview.md) | 02, 03, 04, 06, 08, 09, 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22 |
| `C-FILTER-CHIP` | Filter chip and chip-based filter bar | [00-product-overview.md](00-product-overview.md) | 02, 07, 08, 09, 11, 16, 20, 21 · planned: 17 |
| `C-TOAST` | Transient toast reporting the outcome of an action | [00-product-overview.md](00-product-overview.md) | 00, 01, 02, 03, 07, 08, 10, 15, 21 |
| `C-BANNER` | Inline and page-level banner, dismissible variants | [00-product-overview.md](00-product-overview.md) | 00, 01, 02, 06, 07, 08, 10, 11, 12, 13, 14, 15, 18, 21, 22 |
| `C-COACH-MARK` | Anchored first-run coach mark with a step counter | [00-product-overview.md](00-product-overview.md) | 01, 02, 03, 12, 21 |
| `C-AVATAR` | Avatar, with facepile and stacked variants | [00-product-overview.md](00-product-overview.md) | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 20, 22 · planned: 17 |
| `C-PRESENCE-DOT` | Presence and status indicator on an avatar | [00-product-overview.md](00-product-overview.md) | 02, 03, 04, 05, 06, 07, 09, 13 |
| `C-CONFIRM-DIALOG` | Confirmation dialog, including destructive variants | [00-product-overview.md](00-product-overview.md) | 02, 03, 06, 08, 13, 15 |
| `C-EMPTY-STATE` | Empty state with illustration, heading and primary action | [00-product-overview.md](00-product-overview.md) | 01, 02, 03, 05, 07, 08, 09, 10, 12, 15, 16, 21, 22 |
| `C-UPGRADE-GATE` | Upgrade badge, trial countdown and upsell strip | [00-product-overview.md](00-product-overview.md) | 00, 01, 02, 06, 07, 08, 09, 11, 13, 14, 15, 16, 18, 21, 22 |
| `C-DETAILS-PANE` | Details surface, as a centred modal or a docked pane | [00-product-overview.md](00-product-overview.md) | 00, 02, 04, 07, 08, 11, 13, 16, 20 |
| `C-DATA-TABLE` | Data table with grouped rows and mixed cell types | [00-product-overview.md](00-product-overview.md) | 02, 06, 07, 08, 10, 11, 14, 15, 18, 20, 21, 22 · planned: 17 |
| `C-RECORD-CARD` | Record and item card with typed fields | [00-product-overview.md](00-product-overview.md) | 06, 07, 08, 09, 11, 15, 22 · planned: 17 |
| `C-MEDIA-PLAYER` | Audio and video player with scrubber and elapsed time | [00-product-overview.md](00-product-overview.md) | 03, 07, 16, 20 · planned: 17 |
| `C-PERMISSION-PROMPT` | Browser and device permission prompt and denial state | [00-product-overview.md](00-product-overview.md) | 01, 02, 06, 12, 14, 16, 21 |
| `C-AUTH-PAGE-SHELL` | Unauthenticated page shell | [00-product-overview.md](00-product-overview.md) | 01 |
| `C-CHIP-INPUT` | Chip input field with removable tokens | [00-product-overview.md](00-product-overview.md) | 01, 13, 15, 21, 22 |
| `C-SEGMENTED-CODE-INPUT` | Segmented one-character-per-box code input | [00-product-overview.md](00-product-overview.md) | 01 |
| `C-DATE-PICKER-POPOVER` | Month-grid date-picker popover | [00-product-overview.md](00-product-overview.md) | 01, 13, 18, 21 |
| `C-STRENGTH-METER` | Password-strength meter | [00-product-overview.md](00-product-overview.md) | 01 |
| `C-INLINE-VALIDATION` | Inline field-level validation message | [00-product-overview.md](00-product-overview.md) | 01, 02, 03, 15, 18 |
| `C-PLAN-CARD` | Plan-choice card | [00-product-overview.md](00-product-overview.md) | 01, 18 |
| `C-CONTENT-CAROUSEL` | Paged content carousel | [00-product-overview.md](00-product-overview.md) | 11, 20, 22 |
| `C-CONSOLE-NAV` | Administration console left navigation | [00-product-overview.md](00-product-overview.md) | 15 |
| `C-PROGRESS-INDICATOR` | Indeterminate progress pill | [00-product-overview.md](00-product-overview.md) | 16 |
| `C-CONSOLE-TOP-BAR` | Administration console top bar | [00-product-overview.md](00-product-overview.md) | 15 |
| `C-DEVICE-PREVIEW` | Live device preview region | [00-product-overview.md](00-product-overview.md) | 14, 16 |
| `C-DISCLOSURE-CARD-LIST` | Disclosure-card list | [00-product-overview.md](00-product-overview.md) | 15, 18, 20 |
| `C-EMOJI-PICKER` | Emoji picker panel | [00-product-overview.md](00-product-overview.md) | 03, 06, 13 |
| `C-HUDDLE-PANEL` | Docked and floating session panel | [00-product-overview.md](00-product-overview.md) | 06 |
| `C-LEVEL-METER` | Read-only level meter | [00-product-overview.md](00-product-overview.md) | 14 |
| `C-LIVE-PREVIEW-CARD` | Live preview card | [00-product-overview.md](00-product-overview.md) | 14 |
| `C-PAGER` | Pagination row | [00-product-overview.md](00-product-overview.md) | 09, 10, 11, 16, 20 |
| `C-PARTICIPANT-TILE` | Session participant tile | [00-product-overview.md](00-product-overview.md) | 06 |
| `C-SEGMENTED-CONTROL` | Segmented single-select control | [00-product-overview.md](00-product-overview.md) | 14 |
| `C-SESSION-CONTROL-BAR` | Session control bar | [00-product-overview.md](00-product-overview.md) | 06 |
| `C-SETTINGS-CATEGORY-COLUMN` | Vertical settings category column | [00-product-overview.md](00-product-overview.md) | 14 |
| `C-TEMPLATE-CARD` | Template and offer card | [00-product-overview.md](00-product-overview.md) | 10, 11, 20 |
| `C-TILE-SELECT-ROW` | Single-select tile row | [00-product-overview.md](00-product-overview.md) | 14, 18 |
| `C-TYPEAHEAD-PANEL` | Caret-anchored typeahead panel | [00-product-overview.md](00-product-overview.md) | 03, 09, 20 |

## Consolidated data model

The repository has no database and no persistence layer, so this model is derived entirely from what the interface exposes. It is aggregated **additively** from the per-area implied data models: an entity touched by several areas accumulates fields rather than being redefined, and **every field cites the frame that shows it**. A field that no frame evidences is not in this model.

**The invariant this table must satisfy, and how to check it.** This model is a **superset** of every per-area contribution: any field an area document publishes for an entity — including every field an area marks as reported for aggregation — must appear here, carrying the citation the owning area published for it. Reporting upward is only half of the contract; absorbing is the other half, and absorption is what makes this table safe to build from. The check is mechanical in both directions: every `E-*` identifier used anywhere in the catalog appears as a row here, and every field group flagged for aggregation in an area document appears in that row. A build that follows this document alone must not be able to under-implement a schema that an area document already specified.

The division of labour between the table and the diagram is deliberate. The table carries the fields, because only prose can carry a citation and an unevidenced field is worthless. The diagram carries the entities and their cardinalities, because only a diagram makes the shape of the graph legible. Together they are the model; neither is complete alone.

Closure requirement: **every `E-*` cited anywhere in the catalog appears in this table.** Twenty entities do.

| Entity | Owning area | Observed fields, each citing the frame that shows it |
|---|---|---|
| `E-WORKSPACE` | [15](15-admin-workspace.md) | name, domain, icon, plan type, date created and a terms-of-service reference with a review link [frame 640](../../screenshots/Slack%20web%20Jul%202024%20640.png) · owner and administrator roster carrying name, email address and role, sortable by role [frame 641](../../screenshots/Slack%20web%20Jul%202024%20641.png) · joining policy, language, default channels for new members and display-name policy [frame 575](../../screenshots/Slack%20web%20Jul%202024%20575.png) · custom emoji set [frame 629](../../screenshots/Slack%20web%20Jul%202024%20629.png) · invite-link configuration and an email domain that permits self-joining [frame 653](../../screenshots/Slack%20web%20Jul%202024%20653.png) |
| `E-USER` | [13](13-profiles-people.md) | profile photo, presence, local time, email address and phone number [frame 519](../../screenshots/Slack%20web%20Jul%202024%20519.png) · full name, display name, pronouns, name pronunciation, a recorded name clip and a time zone [frame 520](../../screenshots/Slack%20web%20Jul%202024%20520.png) · job title [frame 521](../../screenshots/Slack%20web%20Jul%202024%20521.png) · status text with an emoji and a clear-after time, plus an away flag and a notification-pause state [frame 504](../../screenshots/Slack%20web%20Jul%202024%20504.png) · status emoji surfaced beside the name in the sidebar [frame 512](../../screenshots/Slack%20web%20Jul%202024%20512.png) · about-me start date, entered through a date picker [frame 526](../../screenshots/Slack%20web%20Jul%202024%20526.png) · guest role badge rendered beside the name [frame 120](../../screenshots/Slack%20web%20Jul%202024%20120.png) · account type, with permissions customisable per type [frame 666](../../screenshots/Slack%20web%20Jul%202024%20666.png) · two-factor state, email address, time zone and language [frame 604](../../screenshots/Slack%20web%20Jul%202024%20604.png) · **credential artefacts, which are *not* fields of this entity.** Four are *rendered* by this product — a password with a reuse constraint and a strength rating [frame 733](../../screenshots/Slack%20web%20Jul%202024%20733.png), [frame 604](../../screenshots/Slack%20web%20Jul%202024%20604.png), a six-character expiring one-time code [frame 4](../../screenshots/Slack%20web%20Jul%202024%204.png), an active browser session per workspace [frame 717](../../screenshots/Slack%20web%20Jul%202024%20717.png), and a device-enrolment code [frame 714](../../screenshots/Slack%20web%20Jul%202024%20714.png) — and per `S-SECRET` none of them is stored as a field of `E-USER` or of any entity a read path returns: the password is a salted, computationally-hard **one-way verifier**, never plaintext, never logged, never exported; the one-time code and the enrolment code are **single-use, time-bounded records of their own**, invalidated on use and on replacement; and a session is a **revocable record referencing the account**, carrying an expiry and an idle bound. They appear in this cell only so that a build reading the consolidated model cannot mistake their absence for an oversight. See [01-onboarding-and-auth.md](01-onboarding-and-auth.md) and [15-admin-workspace.md](15-admin-workspace.md), the two documents whose surfaces render them · an assignable role, described as granting a member additional permissions, the workspace's roles carrying their own member count [frame 666](../../screenshots/Slack%20web%20Jul%202024%20666.png) · deactivated state, which resolves the session to a terminal page offering no action but one outbound link [frame 609](../../screenshots/Slack%20web%20Jul%202024%20609.png) · an authenticated-session requirement, surfaced as a page-level advisory when a route needs one [frame 735](../../screenshots/Slack%20web%20Jul%202024%20735.png) |
| `E-CHANNEL` | [02](02-channels.md) | name, topic, description, creator with a creation date, and a copyable channel identifier rendered as an opaque token, each editable row carrying an inline Edit control [frame 90](../../screenshots/Slack%20web%20Jul%202024%2090.png) · name constrained to lower case without spaces and capped by a character counter [frame 97](../../screenshots/Slack%20web%20Jul%202024%2097.png), the counter observed at 80 characters on creation [frame 69](../../screenshots/Slack%20web%20Jul%202024%2069.png) · visibility, public with a workspace-scope sub-label or private with an invitation-only sub-label [frame 60](../../screenshots/Slack%20web%20Jul%202024%2060.png) · member list with the member count surfaced in the tab label [frame 82](../../screenshots/Slack%20web%20Jul%202024%2082.png) · starred flag [frame 86](../../screenshots/Slack%20web%20Jul%202024%2086.png) · notification preference of all messages, mentions or off, plus a mute flag [frame 89](../../screenshots/Slack%20web%20Jul%202024%2089.png) · archived and deleted lifecycle states [frame 84](../../screenshots/Slack%20web%20Jul%202024%2084.png) · private state marked by a lock glyph in the title [frame 108](../../screenshots/Slack%20web%20Jul%202024%20108.png) · purpose and joined state as shown in the channel browser [frame 125](../../screenshots/Slack%20web%20Jul%202024%20125.png) · bookmarks [frame 120](../../screenshots/Slack%20web%20Jul%202024%20120.png) · archived state rendered as read-only: the composer replaced by an explanatory bar with one action, and the sidebar row's glyph changed [frame 134](../../screenshots/Slack%20web%20Jul%202024%20134.png) |
| `E-MESSAGE` | [03](03-messaging-and-composer.md) | author, timestamp and body, with app-posted messages carrying an app author and a workflow badge [frame 120](../../screenshots/Slack%20web%20Jul%202024%20120.png) · rich-text body containing inline channel-mention and person-mention chips [frame 550](../../screenshots/Slack%20web%20Jul%202024%20550.png) · pinned flag with a pinned-by label and a highlighted row [frame 249](../../screenshots/Slack%20web%20Jul%202024%20249.png) · edited through an inline editable field [frame 252](../../screenshots/Slack%20web%20Jul%202024%20252.png) · scheduled send date and time [frame 184](../../screenshots/Slack%20web%20Jul%202024%20184.png) · forwarded copy carrying a quoted original, a provenance line and a view-conversation link [frame 248](../../screenshots/Slack%20web%20Jul%202024%20248.png) · attachment [frame 165](../../screenshots/Slack%20web%20Jul%202024%20165.png) |
| `E-THREAD` | [04](04-threads.md) | parent message with a reply composer beneath it, and an also-send-to-channel flag that names the channel [frame 223](../../screenshots/Slack%20web%20Jul%202024%20223.png), [frame 224](../../screenshots/Slack%20web%20Jul%202024%20224.png) · replies, surfaced as activity entries [frame 381](../../screenshots/Slack%20web%20Jul%202024%20381.png) · an also-send-as-direct-message flag when the thread hangs off a huddle or a conversation [frame 269](../../screenshots/Slack%20web%20Jul%202024%20269.png) · unread boundary marked by a New divider [frame 355](../../screenshots/Slack%20web%20Jul%202024%20355.png) · per-thread reply-notification state, switchable off [frame 389](../../screenshots/Slack%20web%20Jul%202024%20389.png) |
| `E-REACTION` | [03](03-messaging-and-composer.md) | emoji and a count, rendered as a chip beside an add-reaction affordance [frame 550](../../screenshots/Slack%20web%20Jul%202024%20550.png) · several reactions per message [frame 213](../../screenshots/Slack%20web%20Jul%202024%20213.png) · a default skin-tone choice [frame 214](../../screenshots/Slack%20web%20Jul%202024%20214.png) · custom emoji defined by an uploaded image with size guidance and a name [frame 216](../../screenshots/Slack%20web%20Jul%202024%20216.png) |
| `E-FILE` | [16](16-files-media.md) | type icon, name, sharer and shared date, grouped by viewed-today and viewed-yesterday, with a template badge where applicable [frame 488](../../screenshots/Slack%20web%20Jul%202024%20488.png) · document preview card on a message [frame 208](../../screenshots/Slack%20web%20Jul%202024%20208.png) · upload source chosen from an attachment menu [frame 163](../../screenshots/Slack%20web%20Jul%202024%20163.png) · attachment tile pending in the composer [frame 165](../../screenshots/Slack%20web%20Jul%202024%20165.png) · video clip with a playback scrubber, elapsed and total time, a selectable thumbnail and a download action [frame 190](../../screenshots/Slack%20web%20Jul%202024%20190.png) · audio clip with a waveform and a running elapsed time [frame 200](../../screenshots/Slack%20web%20Jul%202024%20200.png) · shared-files card on the owning conversation [frame 90](../../screenshots/Slack%20web%20Jul%202024%2090.png) · upload-in-progress state, rendered as a bordered placeholder block occupying the finished block's footprint [frame 321](../../screenshots/Slack%20web%20Jul%202024%20321.png) |
| `E-HUDDLE` | [06](06-huddles.md) | name, participant list with a live count, per-participant video tile, a control set of microphone, camera, screen share, reactions and settings, a leave control, and canvas and thread toggles [frame 269](../../screenshots/Slack%20web%20Jul%202024%20269.png) · decorative background applied behind the tiles and a muted-microphone badge per tile [frame 270](../../screenshots/Slack%20web%20Jul%202024%20270.png) · topic, surfaced in the control bar beside the participant count [frame 277](../../screenshots/Slack%20web%20Jul%202024%20277.png) · theme, shared by every participant [frame 283](../../screenshots/Slack%20web%20Jul%202024%20283.png) · camera background, none, blurred or an image [frame 293](../../screenshots/Slack%20web%20Jul%202024%20293.png) · captions with a closed-caption or side-by-side display option [frame 287](../../screenshots/Slack%20web%20Jul%202024%20287.png) · connection diagnostics rating network, system and devices, with an audio-only mode [frame 271](../../screenshots/Slack%20web%20Jul%202024%20271.png) · shareable huddle link [frame 267](../../screenshots/Slack%20web%20Jul%202024%20267.png) · hosting conversation, which the panel names and the overflow menu offers to navigate to [frame 282](../../screenshots/Slack%20web%20Jul%202024%20282.png), [frame 300](../../screenshots/Slack%20web%20Jul%202024%20300.png) · per-participant invited-not-yet-joined state, rendered as a paper-plane badge on that participant's tile [frame 268](../../screenshots/Slack%20web%20Jul%202024%20268.png), [frame 407](../../screenshots/Slack%20web%20Jul%202024%20407.png) · live flag, rendered as a badge on the transcript row and as a duration pill on the destination's active-session card [frame 268](../../screenshots/Slack%20web%20Jul%202024%20268.png), [frame 407](../../screenshots/Slack%20web%20Jul%202024%20407.png) · duration, running while live and fixed once ended [frame 401](../../screenshots/Slack%20web%20Jul%202024%20401.png), [frame 403](../../screenshots/Slack%20web%20Jul%202024%20403.png), [frame 407](../../screenshots/Slack%20web%20Jul%202024%20407.png) · transcript of speaker-attributed entries, alongside the captions display option [frame 287](../../screenshots/Slack%20web%20Jul%202024%20287.png), [frame 291](../../screenshots/Slack%20web%20Jul%202024%20291.png) · connection diagnostics in full — an overall verdict, three group ratings for network, system and devices, and four network metrics each with a rating and a measured value [frame 271](../../screenshots/Slack%20web%20Jul%202024%20271.png), [frame 272](../../screenshots/Slack%20web%20Jul%202024%20272.png) · associated thread, saved into the hosting conversation and surfaced on a recent row as a reply count [frame 269](../../screenshots/Slack%20web%20Jul%202024%20269.png), [frame 401](../../screenshots/Slack%20web%20Jul%202024%20401.png) · saved-for-later flag, offered from a recent row's menu [frame 402](../../screenshots/Slack%20web%20Jul%202024%20402.png) · a waiting-room selection with its own stop control, offered while the user is alone in the session [frame 407](../../screenshots/Slack%20web%20Jul%202024%20407.png) · transcript of speaker-attributed entries, held behind the captions option [frame 291](../../screenshots/Slack%20web%20Jul%202024%20291.png) · per-participant invited-not-yet-joined state, rendered as a paper-plane badge on that participant's tile [frame 268](../../screenshots/Slack%20web%20Jul%202024%20268.png), [frame 407](../../screenshots/Slack%20web%20Jul%202024%20407.png) |
| `E-CANVAS` | [07](07-canvases.md) | title, defaulting to untitled, with share and star controls and a start-writing prompt [frame 153](../../screenshots/Slack%20web%20Jul%202024%20153.png) · template origin, chosen from a product-provided template list with a preview [frame 305](../../screenshots/Slack%20web%20Jul%202024%20305.png) · blocks, including an image block [frame 316](../../screenshots/Slack%20web%20Jul%202024%20316.png) · cover image, lock-edits state, show-by-default state, save-for-later and starred flags and accessibility settings [frame 330](../../screenshots/Slack%20web%20Jul%202024%20330.png) · created-by, location and date metadata plus a template badge, with a canvas scopeable to a direct message [frame 690](../../screenshots/Slack%20web%20Jul%202024%20690.png) · last-viewed metadata when attached to a message [frame 150](../../screenshots/Slack%20web%20Jul%202024%20150.png) |
| `E-LIST` | [08](08-lists.md) | name and description, each editable, plus a copy-link action and a CSV download [frame 450](../../screenshots/Slack%20web%20Jul%202024%20450.png) · starred flag [frame 408](../../screenshots/Slack%20web%20Jul%202024%20408.png) · groups with a per-group item count [frame 447](../../screenshots/Slack%20web%20Jul%202024%20447.png) · fields defined by a name and a type selected from a field-type list [frame 431](../../screenshots/Slack%20web%20Jul%202024%20431.png), [frame 434](../../screenshots/Slack%20web%20Jul%202024%20434.png) · named views carrying item counts, each a saved set of filters, sorting and layout [frame 464](../../screenshots/Slack%20web%20Jul%202024%20464.png) · layout of table or board, with filter, sort, hide-fields and group-by settings [frame 469](../../screenshots/Slack%20web%20Jul%202024%20469.png) · sort field with an ascending or descending direction and multiple sort levels [frame 474](../../screenshots/Slack%20web%20Jul%202024%20474.png) · view name and a visibility scope covering everyone with list access [frame 485](../../screenshots/Slack%20web%20Jul%202024%20485.png) |
| `E-LIST-RECORD` | [08](08-lists.md) | title, with people and date cells that may be empty [frame 411](../../screenshots/Slack%20web%20Jul%202024%20411.png) · status, priority, description, assignee and due date, plus comments and a notification subscription [frame 420](../../screenshots/Slack%20web%20Jul%202024%20420.png) · custom fields added per list [frame 431](../../screenshots/Slack%20web%20Jul%202024%20431.png) |
| `E-WORKFLOW` | [10](10-workflow-builder.md) | name, published state, a trigger observed in a scheduled variant, ordered steps each able to carry a needs-attention warning, a message preview, an add-step action, and workflow, activity and settings tabs [frame 571](../../screenshots/Slack%20web%20Jul%202024%20571.png) · send-a-message step holding a recipient, rich message text, an inserted variable and an optional button [frame 572](../../screenshots/Slack%20web%20Jul%202024%20572.png) · recipient resolved to a channel [frame 573](../../screenshots/Slack%20web%20Jul%202024%20573.png) · template origin, including start-from-scratch [frame 570](../../screenshots/Slack%20web%20Jul%202024%20570.png) · legacy classification and publication scope across your-workflows and all-published-workflows [frame 568](../../screenshots/Slack%20web%20Jul%202024%20568.png) |
| `E-APP` | [11](11-apps-and-integrations.md) | name, description, installed state with a workspace-wide installed count, a recommended flag and a per-row add action [frame 400](../../screenshots/Slack%20web%20Jul%202024%20400.png) · category, searchable, with the app surface grouped under an automations heading [frame 368](../../screenshots/Slack%20web%20Jul%202024%20368.png) · app home exposing home, messages and about tabs, action controls and a plan-gated upgrade notice [frame 372](../../screenshots/Slack%20web%20Jul%202024%20372.png) · app-provided slash commands, each carrying a provider sub-line [frame 203](../../screenshots/Slack%20web%20Jul%202024%20203.png) · directory collection membership [frame 925](../../screenshots/Slack%20web%20Jul%202024%20925.png) · messages posted into a conversation under the app's own author identity [frame 120](../../screenshots/Slack%20web%20Jul%202024%20120.png) |
| `E-NOTIFICATION` | [12](12-activity-notifications.md) | browser permission state, confirmed by an informational bar [frame 23](../../screenshots/Slack%20web%20Jul%202024%2023.png) · notify-me-about scope, a mobile override, huddle-start and thread-reply toggles, a keyword list and a delivery schedule [frame 535](../../screenshots/Slack%20web%20Jul%202024%20535.png) · per-conversation override [frame 89](../../screenshots/Slack%20web%20Jul%202024%2089.png) · activity entry classified as an app notification or a thread reply [frame 381](../../screenshots/Slack%20web%20Jul%202024%20381.png) · per-entry actions of remind-me, turn-off-reply-notifications, open-in-new-window, open-in-home and copy-link [frame 389](../../screenshots/Slack%20web%20Jul%202024%20389.png) · reminder with a due time, an overdue marker and its conversation context [frame 394](../../screenshots/Slack%20web%20Jul%202024%20394.png) · archived state [frame 396](../../screenshots/Slack%20web%20Jul%202024%20396.png) · unread state with a mark-all-read action [frame 356](../../screenshots/Slack%20web%20Jul%202024%20356.png) · device-permission dependency, surfaced as a foot-pinned advisory naming the browser as the place the grant must happen [frame 300](../../screenshots/Slack%20web%20Jul%202024%20300.png) · unread scope as a switch that filters a feed and can resolve it to empty [frame 385](../../screenshots/Slack%20web%20Jul%202024%20385.png) |
| `E-INVITATION` | [01](01-onboarding-and-auth.md), [22](22-external-collaboration.md) | invitee email address, an invite-as role, and a copy-invite-link action with editable link settings [frame 40](../../screenshots/Slack%20web%20Jul%202024%2040.png) · role of member or guest, the guest option carrying a limitation sub-label [frame 49](../../screenshots/Slack%20web%20Jul%202024%2049.png) · channel scope held as a removable chip, alongside a custom message [frame 44](../../screenshots/Slack%20web%20Jul%202024%2044.png) · **invite-link expiry, observed as 19 days** on the copy confirmation [frame 46](../../screenshots/Slack%20web%20Jul%202024%2046.png) · sent record carrying the invitee address, an expiry date, a timestamp and an invitation type such as invited-to-direct-message [frame 503](../../screenshots/Slack%20web%20Jul%202024%20503.png) · accepted record carrying the address, an invited-by line, a role and a joined date [frame 655](../../screenshots/Slack%20web%20Jul%202024%20655.png) · request status, tracked on its own tab [frame 653](../../screenshots/Slack%20web%20Jul%202024%20653.png) · **externally-scoped variant, contributed by [22](22-external-collaboration.md):** recipient email address, committed as a token in the form and named in bold on the sent record [frame 499](../../screenshots/Slack%20web%20Jul%202024%20499.png) [frame 503](../../screenshots/Slack%20web%20Jul%202024%20503.png) · invitation type, the sent register grouping records under a typed label [frame 503](../../screenshots/Slack%20web%20Jul%202024%20503.png) · delivery mechanism, stated as email by the form and as email **or link** by the outbound register [frame 498](../../screenshots/Slack%20web%20Jul%202024%20498.png) [frame 502](../../screenshots/Slack%20web%20Jul%202024%20502.png) · sent-at time as a relative timestamp [frame 503](../../screenshots/Slack%20web%20Jul%202024%20503.png) · **resolved acceptance expiry, a date derived at issuance from the 14-day window stored on `E-EXTERNAL-ORG`** — the confirmation states the window and the invitee appears in the direct-message list once accepted [frame 500](../../screenshots/Slack%20web%20Jul%202024%20500.png); this record holds a date, never a duration, per the expiry table above · expiry date as a calendar date on the record's muted second line [frame 503](../../screenshots/Slack%20web%20Jul%202024%20503.png) · direction, the register being divided into received and sent so direction is first-class rather than a view [frame 501](../../screenshots/Slack%20web%20Jul%202024%20501.png) [frame 502](../../screenshots/Slack%20web%20Jul%202024%20502.png) · approval requirement, conditional on the organization [frame 502](../../screenshots/Slack%20web%20Jul%202024%20502.png) · optional note on the channel-scoped variant, with a show-email-preview link [frame 67](../../screenshots/Slack%20web%20Jul%202024%2067.png) · channel scope on the channel-scoped variant, the disambiguation dialog stating the invitation goes to just that channel [frame 65](../../screenshots/Slack%20web%20Jul%202024%2065.png) · sender notification on acceptance, promised by the form [frame 498](../../screenshots/Slack%20web%20Jul%202024%20498.png) · delivery outcome, observed as a bounced annotation appended to the recipient address on a pending record [frame 654](../../screenshots/Slack%20web%20Jul%202024%20654.png) · a per-record deactivation date, observed on the bounced record only [frame 654](../../screenshots/Slack%20web%20Jul%202024%20654.png) |
| `E-EXTERNAL-ORG` | [22](22-external-collaboration.md) | organization identity, the destination titled for external organizations with an organizations register as its first sidebar destination [frame 494](../../screenshots/Slack%20web%20Jul%202024%20494.png) · company value, searchable, one of the people search's three accepted keys [frame 494](../../screenshots/Slack%20web%20Jul%202024%20494.png) · member person, searchable by name and by email address, the other two keys [frame 494](../../screenshots/Slack%20web%20Jul%202024%20494.png) · attribution of a person to an organization, the confirmation labelling the invitee with a from-another-company row [frame 67](../../screenshots/Slack%20web%20Jul%202024%2067.png) · relationship to a workspace, the destination being workspace-scoped and reached from that workspace's rail [frame 399](../../screenshots/Slack%20web%20Jul%202024%20399.png) [frame 494](../../screenshots/Slack%20web%20Jul%202024%20494.png) · connection state, separately managed from a manage-connections destination described in terms of approvals with trusted partners [frame 494](../../screenshots/Slack%20web%20Jul%202024%20494.png) [frame 495](../../screenshots/Slack%20web%20Jul%202024%20495.png) · per-channel permission level held against the **organization** rather than the person, offering post-and-invite or only-post [frame 66](../../screenshots/Slack%20web%20Jul%202024%2066.png) · channel-history retention on conclusion, post-and-invite stating they keep a copy [frame 66](../../screenshots/Slack%20web%20Jul%202024%2066.png) · ability to bring their own coworkers, withheld by only-post and granted after acceptance [frame 66](../../screenshots/Slack%20web%20Jul%202024%2066.png) [frame 502](../../screenshots/Slack%20web%20Jul%202024%20502.png) · counterpart workspace, a partner who accepts setting the shared channel up in their own workspace [frame 496](../../screenshots/Slack%20web%20Jul%202024%20496.png) · external-organization advisory raised inside the invite modal [frame 45](../../screenshots/Slack%20web%20Jul%202024%2045.png) · per-channel external scope, chosen against your own organization at invite time [frame 65](../../screenshots/Slack%20web%20Jul%202024%2065.png) · **external acceptance window, observed as 14 days, stored once here** and resolved onto each sent invitation as a date at issuance [frame 500](../../screenshots/Slack%20web%20Jul%202024%20500.png) |
| `E-PLAN` | [18](18-pricing-plans.md) | name, description, monthly price with a struck-through discounted price, a best-value badge, purchase and contact-sales actions and a ticked feature list [frame 966](../../screenshots/Slack%20web%20Jul%202024%20966.png) · ticked and greyed feature rows with a per-column add-on note [frame 967](../../screenshots/Slack%20web%20Jul%202024%20967.png) · comparison rows whose cells mix numeric limits, qualifying text, check marks and blanks, closed by a footer call-to-action row [frame 350](../../screenshots/Slack%20web%20Jul%202024%20350.png) · trial state with a through-date, an upgrade action, an end-trial link, a discount note and a promotional-code entry [frame 669](../../screenshots/Slack%20web%20Jul%202024%20669.png) · payment method [frame 678](../../screenshots/Slack%20web%20Jul%202024%20678.png) · billing address with organization name, country and street, plus billing-email frequency [frame 671](../../screenshots/Slack%20web%20Jul%202024%20671.png) · plan type recorded against the workspace [frame 640](../../screenshots/Slack%20web%20Jul%202024%20640.png) · trial-active flag, rendered as an item in the sidebar's footer slot [frame 120](../../screenshots/Slack%20web%20Jul%202024%20120.png), [frame 564](../../screenshots/Slack%20web%20Jul%202024%20564.png) · gated-capability set, resolved per entry point so one menu row carries a badge while its siblings carry none [frame 550](../../screenshots/Slack%20web%20Jul%202024%20550.png) · per-capability trial entitlement copy, rendered as a strip scoped to the surface it unlocks [frame 689](../../screenshots/Slack%20web%20Jul%202024%20689.png) · promotional offer with its own countdown, distinct from the trial's [frame 203](../../screenshots/Slack%20web%20Jul%202024%20203.png) · estimated charge composed of a unit price, a member count, a period, a tax line and a due-on date [frame 615](../../screenshots/Slack%20web%20Jul%202024%20615.png) |
| `E-PREFERENCE` | [14](14-preferences-settings.md) | a twelve-item category list, with the notifications category holding a notify-me-about scope, a mobile override, huddle-start and thread-reply toggles and a keyword list [frame 535](../../screenshots/Slack%20web%20Jul%202024%20535.png) · home category holding an activity-dot toggle, always-show settings and show and sort radio groups [frame 546](../../screenshots/Slack%20web%20Jul%202024%20546.png) · themes category holding a theme choice and a system colour mode [frame 553](../../screenshots/Slack%20web%20Jul%202024%20553.png) · audio-and-video category holding a microphone with an input-level meter, automatic gain control, noise suppression, a speaker with a test action, a when-joining-a-huddle group carrying a large-channel warning threshold and background blur, and a when-alone group with a timing select [frame 561](../../screenshots/Slack%20web%20Jul%202024%20561.png) · navigation-destination visibility, clearable to none [frame 544](../../screenshots/Slack%20web%20Jul%202024%20544.png) · diagnostics result set with pass, in-progress and pending rows and a copy-results action [frame 564](../../screenshots/Slack%20web%20Jul%202024%20564.png) · diagnostics per-check status drawn from the observed set of pass, in progress, pending and **permission denied**, several of which coexist in one table [frame 565](../../screenshots/Slack%20web%20Jul%202024%20565.png) · colour mode held as a three-option segmented control, and destination visibility with two of the twelve destinations non-clearable [frame 536](../../screenshots/Slack%20web%20Jul%202024%20536.png) |
| `E-SEARCH-QUERY` | [09](09-search-and-filters.md) | query text, which may embed modifier tokens, retained as recent-search history alongside channel and person entries [frame 684](../../screenshots/Slack%20web%20Jul%202024%20684.png) · result-type tabs carrying per-type counts, sender and location chips, only-my-channels and exclude-automations toggles and a relevance sort [frame 688](../../screenshots/Slack%20web%20Jul%202024%20688.png) · sender filter resolved from a person search [frame 693](../../screenshots/Slack%20web%20Jul%202024%20693.png) · sender, location, participant, date and file-type filters, the date defaulting to any time, with clear-filters and search actions [frame 698](../../screenshots/Slack%20web%20Jul%202024%20698.png) · created-by filter on typed results [frame 690](../../screenshots/Slack%20web%20Jul%202024%20690.png) · sort order of most relevant, oldest, newest, A to Z or Z to A, and a result layout carried by flow `09.5` [frame 702](../../screenshots/Slack%20web%20Jul%202024%20702.png) · participant constraint, offered **only** in the filter modal with no chip counterpart in any captured chip set [frame 698](../../screenshots/Slack%20web%20Jul%202024%20698.png) · creator constraint, offered as a chip on the canvases tab only [frame 690](../../screenshots/Slack%20web%20Jul%202024%20690.png) · layout mode of list or grid, offered on the files and canvases tabs [frame 689](../../screenshots/Slack%20web%20Jul%202024%20689.png), [frame 704](../../screenshots/Slack%20web%20Jul%202024%20704.png) · page, an integer surfaced only by the grid layout's pager [frame 704](../../screenshots/Slack%20web%20Jul%202024%20704.png) · per-type counts rendered even when zero, on a tab that stays active and selectable [frame 692](../../screenshots/Slack%20web%20Jul%202024%20692.png) |
| `E-USER-GROUP` | [15](15-admin-workspace.md) | name, a handle constrained to lower case without spaces, an optional purpose, and optional default channels whose members are added automatically [frame 646](../../screenshots/Slack%20web%20Jul%202024%20646.png) · member list held as removable chips [frame 651](../../screenshots/Slack%20web%20Jul%202024%20651.png) · role association, with a count of members needing additional permissions [frame 666](../../screenshots/Slack%20web%20Jul%202024%20666.png) |

**Per-viewer state is a relation, never a field of a shared entity.** This is the single most consequential correction in the consolidated model, and it is stated here once because nine area documents contribute to it. Wherever a capture renders a fact that is true *for the person whose session was captured* — read and unread state, an unread boundary, mark-as-unread, a saved-for-later flag, a reminder due time, a has-draft marker, a last-viewed or last-opened timestamp, a per-conversation notification scope, a star or favourite, a per-app unread count, a dismissed banner, a recent-search history — **a single captured session cannot distinguish "stored on the shared object" from "stored on the (viewer, object) pair", because only one viewer is ever captured.** Per `S-PERUSER` the catalog resolves every such case in favour of the per-viewer placement, for a reason that is a security reason rather than a modelling preference: stored on the shared object, one person saving something saves it for everyone, one person's reminder fires for everyone, one person's reading marks it read for all, and every one of those flags additionally discloses that person's behaviour to every other member of the object.

The relations the area documents establish, each replacing what would otherwise be a field of the entity beside it:

| Relation | Keyed by | What moves onto it, and out of the shared entity | Established in |
|---|---|---|---|
| Conversation membership | conversation + member | unread flag and its message count · has-draft flag · per-conversation notification scope and mute · joined marker · star or favourite · the six per-member facts the channel details surface renders | [02](02-channels.md), [12](12-activity-notifications.md) |
| Viewer–message state | viewer + message | read and unread state · unread boundary · mark-as-unread · saved-for-later flag · reminder due time | [12](12-activity-notifications.md) *(canonical)*, [03](03-messaging-and-composer.md), [04](04-threads.md) |
| Viewer–thread state | viewer + thread | following state · unread reply count | [04](04-threads.md) |
| Viewer–canvas state | viewer + canvas | last-viewed timestamp · star · saved-for-later | [07](07-canvases.md) |
| Viewer–list state | viewer + list | star · last-opened · per-record notification subscription | [08](08-lists.md) |
| Viewer–app state | viewer + app | unread count *(installed state remains per workspace)* | [11](11-apps-and-integrations.md) |
| Viewer–file state | viewer + file | viewed-at timestamp, which drives the viewed-today and viewed-yesterday grouping | [16](16-files-media.md) |
| Viewer–huddle state | viewer + huddle | per-participant diagnostics and device state | [06](06-huddles.md) |
| Search history | viewer | recent-search entries. Already viewer-owned by construction, so the placement is not in question; what [09](09-search-and-filters.md) adds is the **access** contract under `S-SECRET` — readable only by their author, never projected to anyone else, never exported, with a stated retention bound and a deletion path — because a stored query can name colleagues and private conversations in its tokens | [09](09-search-and-filters.md) |
| Viewer preferences | viewer | dismissed banners and explanatory blocks, held as fields of the viewer's own `E-PREFERENCE` record rather than of the object dismissed. `E-PREFERENCE` is owned by [14](14-preferences-settings.md); [11](11-apps-and-integrations.md) is where the dismissal is redirected onto it | [11](11-apps-and-integrations.md), [14](14-preferences-settings.md) |

The entity table above therefore reads as **the union of fields the interface exposes**, and this table reads as **where each of them lives**. Where the two appear to disagree about a per-viewer fact, this table governs.

## Consolidated build-security contracts (roll-up)

**This is a roll-up, not a definition.** Each contract below is defined once, authoritatively, in [`00-product-overview.md`](00-product-overview.md), and every area document references it **by identifier only**. Nothing here restates a contract. They exist because the corpus is a set of screenshots: **a capture can show a control, and it can never show an authorization check, an encoding step, a retention bound or a consent record.** Ten obligations therefore recur across the catalog that no frame can evidence, and defining them in one place is what keeps every area document from inventing its own.

The corpus's **entire vocabulary of visible authorization** is four frames — an administrator-only legend on a gated channel control [frame 75](../../screenshots/Slack%20web%20Jul%202024%2075.png), permissions-tab copy stating that any member may invite by default and that invitations can require administrator approval [frame 576](../../screenshots/Slack%20web%20Jul%202024%20576.png), billing copy stating that only certain accounts may make billing and payment changes [frame 672](../../screenshots/Slack%20web%20Jul%202024%20672.png), and a help article stating that creating and using a workflow are separately permissioned [frame 710](../../screenshots/Slack%20web%20Jul%202024%20710.png). Everything else about who may do what is silence, and silence is never a permission.

| Contract ID | What it governs |
|---|---|
| `S-AUTHZ-OP` | Server-side, point-of-execution, per-object capability checks. Presentation is not enforcement; a precondition is not a grant. |
| `S-AUTHZ-READ` | Read-path and projection authorization. A count is a projection; a link is a projection at resolution time; a notification is a projection that leaves the product. |
| `S-UPLOAD` | The catalog's single upload and untrusted-document-rendering contract, whose canonical instance is [16-files-media.md](16-files-media.md). |
| `S-CONTENT` | Structured rich text with an allowlisted vocabulary, output-context encoding, and match highlighting treated as a distinct sink. |
| `S-LINK` | Canonical URL parse, `http`/`https` allowlist, no opener reference or referring address — and the rule that an external-link glyph's presence evidences only that the product marked the entry as leaving, while its **absence evidences nothing**. |
| `S-SECRET` | Credential, code, session and token handling. A credential is not a field of `E-USER` or of any entity a read path returns. |
| `S-PERUSER` | The one-question placement test for per-viewer state, applied by the relation table above. |
| `S-EXPORT` | Export authorization, aggregation floors, minimisation, and spreadsheet-expression neutralisation. |
| `S-CONSENT` | Consent, retention and deletion — including that a speech-derived record is a separate store from the message history. |
| `S-GAP` | A named gap is designed and implemented. Explicitly **not** a licence to invent what the corpus does not show. |

**Three expiry facts, modelled separately, each with one named authority.** The corpus shows three different time-bounded artefacts, and conflating them would produce a wrong schema.

| Artefact | Authoritative field and owner | What is observed | The rule |
|---|---|---|---|
| **Invite link** | `E-INVITATION`, owned by [`01-onboarding-and-auth.md`](01-onboarding-and-auth.md) | The copy confirmation states the link expires in 19 days [frame 46](../../screenshots/Slack%20web%20Jul%202024%2046.png), while the administration console renders an expiry exactly **one month** after creation on the same kind of link [frame 656](../../screenshots/Slack%20web%20Jul%202024%20656.png) | The two surfaces **disagree**, and the disagreement is recorded rather than reconciled — see [limitation 6](#6-two-surfaces-state-two-different-lifetimes-for-the-same-bearer-credential). The 19-day figure is **not** safe to adopt from `01` alone. A build settles one lifetime, stores it on the invite-link record, renders both surfaces from that stored value, and enforces it server-side on redemption |
| **External acceptance window** | `E-EXTERNAL-ORG`, owned by [`22-external-collaboration.md`](22-external-collaboration.md) | The confirmation modal states the invitee has fourteen days to accept, after which they appear in the direct-message list [frame 500](../../screenshots/Slack%20web%20Jul%202024%20500.png) | The window is stored **once**, here. The expiry date rendered on an individual sent record [frame 503](../../screenshots/Slack%20web%20Jul%202024%20503.png) is **derived from it at issuance and stored on `E-INVITATION` as a resolved date** — `E-INVITATION` holds a date, never a duration and never a second copy of the window |
| **Guest account end date** | `E-USER`, owned by [`13-profiles-people.md`](13-profiles-people.md), set through the invite flow in [`01-onboarding-and-auth.md`](01-onboarding-and-auth.md) | A chosen calendar date committed through a date picker on the guest invitation form [frame 54](../../screenshots/Slack%20web%20Jul%202024%2054.png) | A property of an **account**, not of a link or a relationship. It is an absolute date from the moment it is set |

One is a property of a shareable link, one of a pending relationship, one of an account. **`E-INVITATION` is the only entity that carries a resolved date derived from another entity's duration**, and that derivation runs in one direction only: a change to the window governs invitations issued afterwards and never retroactively moves an already-resolved expiry.

**Entity relationships.** Every relationship below is evidenced by a frame in which both ends are visible together.

```mermaid
erDiagram
    E-WORKSPACE ||--o{ E-CHANNEL : "contains"
    E-WORKSPACE ||--o{ E-USER : "has members"
    E-WORKSPACE ||--o{ E-USER-GROUP : "defines"
    E-WORKSPACE ||--|| E-PLAN : "is billed on"
    E-WORKSPACE ||--o{ E-APP : "has installed"
    E-WORKSPACE ||--o{ E-WORKFLOW : "publishes"
    E-WORKSPACE ||--o{ E-INVITATION : "issues"
    E-WORKSPACE ||--o{ E-EXTERNAL-ORG : "connects to"
    E-WORKSPACE ||--o{ E-LIST : "holds"
    E-CHANNEL ||--o{ E-MESSAGE : "contains"
    E-CHANNEL }o--o{ E-USER : "has as member"
    E-CHANNEL ||--o{ E-CANVAS : "hosts"
    E-CHANNEL ||--o{ E-FILE : "shares"
    E-CHANNEL ||--o{ E-HUDDLE : "hosts"
    E-CHANNEL ||--o| E-INVITATION : "is scope of"
    E-USER ||--o{ E-MESSAGE : "authors"
    E-USER ||--|| E-PREFERENCE : "configures"
    E-USER ||--o{ E-NOTIFICATION : "receives"
    E-USER ||--o{ E-SEARCH-QUERY : "runs"
    E-USER }o--o{ E-USER-GROUP : "belongs to"
    E-USER }o--o{ E-HUDDLE : "participates in"
    E-USER ||--o{ E-LIST-RECORD : "is assigned"
    E-MESSAGE ||--o{ E-REACTION : "carries"
    E-MESSAGE ||--o| E-THREAD : "starts"
    E-MESSAGE ||--o{ E-FILE : "attaches"
    E-MESSAGE ||--o| E-CANVAS : "embeds"
    E-THREAD ||--o{ E-MESSAGE : "collects replies"
    E-HUDDLE ||--|| E-THREAD : "has"
    E-LIST ||--o{ E-LIST-RECORD : "contains"
    E-APP ||--o{ E-MESSAGE : "posts"
    E-WORKFLOW ||--o{ E-MESSAGE : "sends"
    E-EXTERNAL-ORG ||--o{ E-INVITATION : "is connected through"
    E-PLAN ||--o{ E-CANVAS : "gates"
    E-SEARCH-QUERY }o--o{ E-MESSAGE : "returns"
    E-SEARCH-QUERY }o--o{ E-FILE : "returns"
    E-SEARCH-QUERY }o--o{ E-CANVAS : "returns"
    E-NOTIFICATION }o--|| E-MESSAGE : "references"
```

## Prioritized build backlog

Four phases, in dependency order. The ordering is not a preference: Phase 1 builds the shell every later phase renders inside, Phase 2 builds the conversation surfaces Phase 3 attaches to, and Phase 4 builds everything that can ship after a usable product exists.

**Each phase inherits its detailed acceptance criteria from the area documents it names.** The checkboxes below are phase-exit gates — objectively checkable, and deliberately not a copy of the per-area criteria. Where a criterion needs detail, follow the link rather than expecting it here.

Partitioning the 248 flows and 1,022 frames across the phases gives each phase a measurable size, and the arithmetic closes on the [coverage assertion](_screenshot-index.md#coverage-assertion):

| Phase | Area documents | Flows | Frames |
|---|---|---|---|
| 1 | 00, 01, 02, 03, 21 | 66 | 284 |
| 2 | 04, 05, 09 | 13 | 42 |
| 3 | 06, 07, 08, 10 | 34 | 174 |
| 4 | 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22 | 135 | 522 |
| **Total** | **23 area documents** | **248** | **1,022** |

### Phase 1: Shell, authentication, channels, messaging

Inherits from [`00-product-overview.md`](00-product-overview.md), [`01-onboarding-and-auth.md`](01-onboarding-and-auth.md), [`02-channels.md`](02-channels.md), [`03-messaging-and-composer.md`](03-messaging-and-composer.md), and the default, hover, focus, empty, loading, error and disabled states that these surfaces need from [`21-states.md`](21-states.md).

- [ ] The chosen product name, logo mark, wordmark and colour palette are defined as design tokens before any screen is built, and no third-party brand value appears anywhere in the codebase.
- [ ] Every `C-*` component in the [roll-up](#consolidated-component-inventory-roll-up) that Phase 1 surfaces require — drawn from the 53 defined identifiers — is implemented once as a shared component, each matching its contract in [`00-product-overview.md`](00-product-overview.md), and no Phase 1 screen re-implements one locally.
- [ ] The application shell renders as a persistent layout owning a routed content region: navigation rail, sidebar with collapsible sections, top bar with history controls and search entry, and the global create menu — per [`00-product-overview.md`](00-product-overview.md).
- [ ] Every rail destination in the [IA map](#product-information-architecture) is present and routes, with destinations belonging to later phases resolving to a defined placeholder rather than a dead control.
- [ ] Sidebar multi-select works end to end: per-item checkboxes, a selection-count bar, clear-selection, move-to and done, per [`02-channels.md`](02-channels.md).
- [ ] `E-WORKSPACE`, `E-USER`, `E-CHANNEL`, `E-MESSAGE` and `E-REACTION` are persisted with every field listed for them in the [consolidated data model](#consolidated-data-model).
- [ ] Sign-up, emailed-code verification, account confirmation and the multi-step workspace setup wizard complete, and the wizard's progress label, one-question-per-step layout and Back or Next controls match the `C-STEP-WIZARD` contract.
- [ ] Sign-in succeeds by password and by emailed code, and each rejection path renders the recovery affordance its flow specifies in [`01-onboarding-and-auth.md`](01-onboarding-and-auth.md) — an invalid code and a rejected credential are distinct states, not one generic error.
- [ ] Channel creation completes through both steps with a visibility choice, and the name field enforces the observed lower-case, no-spaces rule and its character limit with a live counter.
- [ ] The channel details surface exposes all four tabs, the member count in its tab label, inline editing of name, topic and description, creator with creation date, a copyable channel identifier, and the destructive leave, archive and delete actions behind `C-CONFIRM-DIALOG`.
- [ ] Sending, editing, deleting, pinning and reacting to a message all work, and the composer offers the full formatting-toolbar control set specified in [`03-messaging-and-composer.md`](03-messaging-and-composer.md).
- [ ] Every acceptance criterion in the five Phase 1 area documents passes, and every Phase 1 flow is walkable end to end from its trigger to its final state without reopening the corpus.

### Phase 2: Threads, direct messages, search

Inherits from [`04-threads.md`](04-threads.md), [`05-direct-messages.md`](05-direct-messages.md), [`09-search-and-filters.md`](09-search-and-filters.md).

- [ ] `E-THREAD` and `E-SEARCH-QUERY` are persisted with every field listed for them in the [consolidated data model](#consolidated-data-model).
- [ ] Replying opens the thread pane on the parent message, and the also-send-to-channel option names the target channel exactly as [`04-threads.md`](04-threads.md) specifies.
- [ ] Per-thread reply-notification state can be switched off and survives a reload.
- [ ] The threads destination renders an unread boundary divider, and it disappears once the replies are read.
- [ ] One-to-one and multi-person direct messages can be created and addressed, and the two-person empty state renders with its view-profile affordance.
- [ ] Presence is rendered through `C-PRESENCE-DOT` with every state distinguished, and status emoji appear beside the name in the sidebar.
- [ ] Search returns typed results across every result-type tab in [`09-search-and-filters.md`](09-search-and-filters.md), each tab carrying a count, and a zero-count tab renders as a zero rather than being hidden.
- [ ] Sender, location, participant, date and file-type filters all narrow results, compose with one another, and clear together.
- [ ] Recent-search history persists per user and is re-runnable.
- [ ] Every acceptance criterion in the three Phase 2 area documents passes.

### Phase 3: Huddles, canvases, lists, workflow builder

Inherits from [`06-huddles.md`](06-huddles.md), [`07-canvases.md`](07-canvases.md), [`08-lists.md`](08-lists.md), [`10-workflow-builder.md`](10-workflow-builder.md).

- [ ] `E-HUDDLE`, `E-CANVAS`, `E-LIST`, `E-LIST-RECORD` and `E-WORKFLOW` are persisted with every field listed for them in the [consolidated data model](#consolidated-data-model).
- [ ] A huddle starts from a conversation and from the huddles destination, exposes the full control set and a leave control, and renders a per-participant tile with a muted-microphone badge.
- [ ] Device-permission denial renders the `C-PERMISSION-PROMPT` denial state specified in [`21-states.md`](21-states.md) and never fails silently.
- [ ] Every huddle carries a thread, and the also-send-as-direct-message option behaves as [`06-huddles.md`](06-huddles.md) specifies.
- [ ] A canvas can be created blank and from a template, attached to a message, and edited with every block type listed in [`07-canvases.md`](07-canvases.md).
- [ ] Canvas lock-edits produces a genuinely read-only surface, not a styled-disabled one.
- [ ] A list can be created from scratch and from a template; fields can be added, edited, converted and deleted; and records expose every field in `E-LIST-RECORD`.
- [ ] List views save filters, sorting and layout together under a name, switch between table and board layouts, and CSV download exports the current view.
- [ ] A workflow can be created from a template and from scratch, its steps edited, and publishing gated until every needs-attention warning is cleared.
- [ ] Every acceptance criterion in the four Phase 3 area documents passes.

### Phase 4: Apps, activity, profiles, preferences, administration, files, marketing, pricing, brand, help, external collaboration

Inherits from [`11-apps-and-integrations.md`](11-apps-and-integrations.md), [`12-activity-notifications.md`](12-activity-notifications.md), [`13-profiles-people.md`](13-profiles-people.md), [`14-preferences-settings.md`](14-preferences-settings.md), [`15-admin-workspace.md`](15-admin-workspace.md), [`16-files-media.md`](16-files-media.md), [`17-marketing-site.md`](17-marketing-site.md), [`18-pricing-plans.md`](18-pricing-plans.md), [`19-brand-guidelines.md`](19-brand-guidelines.md), [`20-help-community.md`](20-help-community.md), [`22-external-collaboration.md`](22-external-collaboration.md).

- [ ] Every remaining entity — `E-APP`, `E-NOTIFICATION`, `E-FILE`, `E-INVITATION`, `E-EXTERNAL-ORG`, `E-PLAN`, `E-PREFERENCE`, `E-USER-GROUP` — is persisted with every field listed for it in the [consolidated data model](#consolidated-data-model), closing the model.
- [ ] `C-UPGRADE-GATE` is implemented once and rendered at every gated location the [deviations](#taxonomy-deviations-from-the-scaffold) record for D5, with its full state set from [`21-states.md`](21-states.md).
- [ ] Apps can be browsed, installed and configured, app home surfaces render their tab set, and app-posted messages render under the app's own author identity with its badge.
- [ ] The browser notification-permission gate is requested, its grant and denial both handled, and the confirmation state rendered.
- [ ] The activity, later and drafts-and-sent destinations render with their filter tabs, per-entry actions, reminders with overdue marking, and their empty states.
- [ ] Profiles can be viewed and edited across every `E-USER` field, status can be set with an emoji and a clear-after time, and profile-as-coworker preview matches what a coworker sees.
- [ ] The preferences dialog exposes every category in [`14-preferences-settings.md`](14-preferences-settings.md), and the audio-and-video diagnostics sub-flow renders pass, in-progress, pending and permission-denied rows distinctly.
- [ ] Both administration flow groups are built — the in-app menu and the standalone console with its own top bar and two-group navigation — per D2 and [`15-admin-workspace.md`](15-admin-workspace.md).
- [ ] Sensitive administrative changes require password re-confirmation, and destructive administrative actions are behind `C-CONFIRM-DIALOG`.
- [ ] Files can be uploaded, previewed, re-shared and browsed, and audio and video clips play through `C-MEDIA-PLAYER` with a scrubber and elapsed and total time.
- [ ] The public marketing, pricing, help and community page structures are rebuilt to the information architecture in their area documents, with the next run's own copy — decorative marketing copy is deliberately not specified and must not be copied from the corpus.
- [ ] The pricing comparison table renders every observed cell type — numeric limit, qualifying text, check mark and blank — and per-column calls to action.
- [ ] Brand pages are rebuilt as the **structure** documented in [`19-brand-guidelines.md`](19-brand-guidelines.md), populated exclusively with the next run's own palette and values.
- [ ] The external-collaboration surface supports connection requests, approvals and email invitations, and the 14-day acceptance window is enforced independently of the invite-link expiry.
- [ ] Every acceptance criterion in the eleven Phase 4 area documents passes, and the union of frames exercised across all four phases equals the ledger's `{0 … 1021}`.

## Flow Reconstruction Methodology

### What a flow is, and what decides where one ends

A flow is **one goal-directed user journey** — a thing a person sets out to accomplish, from the trigger that starts it to the state that completes it. "Invite a teammate", "create a channel" and "start a huddle" are flows; "the sidebar" is not.

Segmentation is driven by **visual-state evidence**. **Numeric adjacency is a weak prior only**: the corpus is a curated export, and frame N + 1 may depict an entirely unrelated screen. Where the numbers and the pixels disagree, the pixels decide — in both directions.

### The measured delta bands

To give that prior a reproducible calibration rather than a feeling, the mean absolute difference between consecutive frames was computed across the whole corpus — all 1,021 consecutive pairs, on 64 × 44 grayscale thumbnails, with the capture band cropped away first so that identical watermark chrome could not damp the signal.

| Delta | Interpretation | Action |
|---|---|---|
| < 2 | Same screen, micro-state change — a hover, a focus ring, a checkbox, one typed field, one menu row. **271 pairs** fall here, of which **123 fall below 0.5** and are all but pixel-identical | Same flow, near-certain |
| 2 – 30 | Same surface family; a panel, pane or content change | Same flow, likely |
| 30 – 80 | Candidate flow boundary | **Confirm visually before splitting** |
| ≥ 80 | Strong boundary, almost certainly a new surface. **135 pairs** fall here | New flow |

Measured distribution: p10 **0.43** · p25 **1.74** · p50 **8.22** · p75 **44.94** · p90 **90.06** · p95 **104.02** · p99 **136.80**; range **0.01 – 173.20**. Counts above threshold: 750 pairs above 2, 607 above 5, 459 above 10, 361 above 20, **313 above 30**, 270 above 40.

The fifteen largest breaks, each boundary lying immediately **before** the named frame: **800** (173.2) · **826** (163.8) · **717** (163.3) · **553** (148.9) · **744** (144.9) · **714** (144.3) · **877** (144.0) · **884** (141.7) · **878** (139.7) · **629** (138.5) · **630** (136.8) · **900** (136.7) · **675** (135.4) · **678** (133.9) · **827** (130.7).

**313 candidate boundaries resolved to 248 flows.** The gap between those two numbers is the whole point of the discipline: had the numeric threshold been allowed to decide, the catalog would have reported roughly 313 flows, over-fragmenting 65 journeys that visual inspection showed to be continuous. Four of the fifteen largest breaks in the corpus are themselves such cases — the pairs 629→630, 826→827, 877→878 and 883→884 all exceed a delta of 130 and all continue the same journey.

### Every break where numeric adjacency was overridden

**Direction one — a strong visual break that did *not* end the journey.** 81 consecutive pairs carry a delta of 80 or more, which the band would classify as a new surface, yet the frames belong to one flow. Each was kept together because the pixels show the same journey continuing. The verified visual causes, with every pair listed:

| Visual reason the boundary was overridden | Pairs | Frame pairs |
|---|---|---|
| An overlay — modal, dialog, popover or menu — opened or closed over the same underlying surface, repainting most of the viewport without advancing to a different journey | 54 | 21→22 · 75→76 · 76→77 · 78→79 · 100→101 · 114→115 · 116→117 · 151→152 · 178→179 · 184→185 · 192→193 · 204→205 · 205→206 · 218→219 · 219→220 · 221→222 · 237→238 · 239→240 · 244→245 · 254→255 · 257→258 · 260→261 · 261→262 · 263→264 · 276→277 · 284→285 · 294→295 · 308→309 · 310→311 · 314→315 · 402→403 · 405→406 · 439→440 · 440→441 · 444→445 · 445→446 · 462→463 · 486→487 · 504→505 · 511→512 · 522→523 · 524→525 · 530→531 · 571→572 · 573→574 · 610→611 · 629→630 · 633→634 · 684→685 · 685→686 · 700→701 · 715→716 · 786→787 · 840→841 |
| The next section or the next stage of the same journey replaced the whole viewport — a long page read further down, or a multi-stage journey whose content region swaps wholesale | 24 | 27→28 · 190→191 · 197→198 · 744→745 · 757→758 · 758→759 · 807→808 · 815→816 · 826→827 · 843→844 · 851→852 · 868→869 · 877→878 · 883→884 · 908→909 · 918→919 · 942→943 · 958→959 · 959→960 · 970→971 · 981→982 · 984→985 · 995→996 · 837→838 |
| A theme or colour-mode change repainted the entire viewport inside a single journey about choosing that theme | 3 | 25→26 · 26→27 · 547→548 |

**Direction two — near-identical frames that were *not* joined.** 13 consecutive pairs carry a delta below 2, which the band would classify as the same flow with near-certainty, yet the frames were split into different flows. In every case the near-identity is superficial: the surface barely changed because one journey ended and the next began on the same screen, so the visual delta measures the screen rather than the intent.

| Frame pair | Delta | Flow before → after |
|---|---|---|
| 87 → 88 | 0.20 | `02.4` → `02.5` |
| 142 → 143 | 1.04 | `03.2` → `03.3` |
| 207 → 208 | 1.50 | `16.3` → `03.8` |
| 286 → 287 | 1.36 | `06.5` → `06.6` |
| 335 → 336 | 1.39 | `07.7` → `07.8` |
| 430 → 431 | 0.47 | `08.3` → `08.4` |
| 435 → 436 | 0.42 | `08.4` → `08.5` |
| 448 → 449 | 0.74 | `08.6` → `08.7` |
| 473 → 474 | 1.31 | `08.10` → `08.11` |
| 478 → 479 | 1.50 | `08.11` → `08.12` |
| 531 → 532 | 0.43 | `13.5` → `13.6` |
| 563 → 564 | 1.92 | `14.4` → `14.6` |
| 701 → 702 | 1.10 | `09.4` → `09.5` |

**Direction three — candidate boundaries the band told us to check, and checking rejected.** A further 103 consecutive pairs fall in the 30-to-80 "confirm visually" band and were confirmed to continue their flow rather than end it. These are the band operating as designed rather than being overridden, and they are the bulk of the 65-flow difference between 313 candidates and 248 flows. The pairs: 55→56 · 80→81 · 98→99 · 99→100 · 103→104 · 105→106 · 107→108 · 108→109 · 124→125 · 135→136 · 137→138 · 143→144 · 148→149 · 268→269 · 269→270 · 306→307 · 313→314 · 346→347 · 369→370 · 377→378 · 394→395 · 417→418 · 449→450 · 457→458 · 519→520 · 521→522 · 553→554 · 755→756 · 756→757 · 765→766 · 766→767 · 767→768 · 770→771 · 773→774 · 778→779 · 779→780 · 782→783 · 783→784 · 784→785 · 788→789 · 796→797 · 797→798 · 800→801 · 801→802 · 802→803 · 804→805 · 805→806 · 808→809 · 813→814 · 817→818 · 818→819 · 821→822 · 822→823 · 827→828 · 828→829 · 834→835 · 835→836 · 836→837 · 841→842 · 845→846 · 846→847 · 848→849 · 849→850 · 850→851 · 856→857 · 860→861 · 861→862 · 862→863 · 863→864 · 866→867 · 870→871 · 872→873 · 873→874 · 878→879 · 880→881 · 884→885 · 890→891 · 891→892 · 897→898 · 898→899 · 914→915 · 926→927 · 933→934 · 934→935 · 939→940 · 944→945 · 946→947 · 953→954 · 956→957 · 962→963 · 971→972 · 977→978 · 979→980 · 982→983 · 983→984 · 992→993 · 994→995 · 999→1000 · 1001→1002 · 1010→1011 · 1012→1013 · 1013→1014 · 1020→1021.

**Direction four — the 2-to-30 band, where the shell itself damps the measurement.** This is the largest override category and the one most easily missed, because the band reads as "same flow, likely" and yet **115 consecutive pairs inside it are flow boundaries**. The cause is structural rather than accidental: the persistent shell occupies most of the viewport and does not repaint when the content region changes, so a complete change of surface can register a small whole-frame delta. The delta is a measure of how many pixels moved, not of how much *meaning* moved, and in a three-column application shell those two quantities come apart. Every one of these 115 boundaries was therefore set from what the frames show, against the band's advice.

They divide into four measurable reasons. Each pair was measured region by region — the rail as the leading 4.5% of width, the sidebar from 4.5% to 22%, the top bar as the leading 4.5% of height, and the content region as the remainder — so the category is derived from the pixels rather than assigned by impression.

| Visual reason the boundary was overridden | Pairs | Frame pairs |
|---|---|---|
| Only the content region changed: the navigation rail, the sidebar and the top bar are pixel-identical across the pair, so the delta measures the one region that repainted while the persistent shell held still | 33 | 3→4 · 5→6 · 30→31 · 32→33 · 48→49 · 57→58 · 79→80 · 152→153 · 167→168 · 279→280 · 295→296 · 302→303 · 315→316 · 329→330 · 337→338 · 338→339 · 446→447 · 463→464 · 468→469 · 544→545 · 548→549 · 551→552 · 592→593 · 624→625 · 634→635 · 639→640 · 642→643 · 643→644 · 668→669 · 679→680 · 730→731 · 924→925 · 949→950 |
| The boundary is a sidebar-level or rail-level change while the content region holds still — a section menu, a filter, a selection bar or a switcher opening over an unchanged conversation | 8 | 38→39 · 120→121 · 229→230 · 272→273 · 340→341 · 355→356 · 393→394 · 512→513 |
| The content region and the sidebar changed together, with the rail and top bar largely intact, so the shell still damped the measured difference below the split threshold | 53 | 18→19 · 22→23 · 23→24 · 68→69 · 119→120 · 123→124 · 138→139 · 162→163 · 176→177 · 198→199 · 202→203 · 206→207 · 222→223 · 226→227 · 241→242 · 256→257 · 266→267 · 299→300 · 300→301 · 341→342 · 359→360 · 371→372 · 372→373 · 380→381 · 388→389 · 392→393 · 419→420 · 487→488 · 488→489 · 493→494 · 518→519 · 536→537 · 538→539 · 550→551 · 570→571 · 574→575 · 579→580 · 583→584 · 589→590 · 599→600 · 603→604 · 605→606 · 616→617 · 621→622 · 720→721 · 723→724 · 736→737 · 739→740 · 892→893 · 903→904 · 929→930 · 945→946 · 989→990 |
| Two different surfaces that share one layout skeleton — persistent site navigation and footer chrome, or two console pages under identical left navigation — so a large fraction of the viewport changed by small amounts | 21 | 270→271 · 273→274 · 339→340 · 373→374 · 489→490 · 503→504 · 652→653 · 692→693 · 749→750 · 759→760 · 775→776 · 790→791 · 809→810 · 859→860 · 886→887 · 915→916 · 920→921 · 935→936 · 965→966 · 1005→1006 · 1014→1015 |

**The complete inventory, so the claim is checkable rather than asserted.** All 115 pairs are listed with the measured delta, the flow on each side of the break, and the category above. 64 of the breaks fall inside a single area and 51 cross from one area to another. The 20 marked `seam` are additionally either a seam between two spans of one multi-span flow or a member of a byte-identical duplicate group, so for those the neighbouring frames rather than the pair itself decide the boundary.

| Frame pair | Delta | Flow before → after | Reason |
|---|---|---|---|
| 3 → 4 | 3.86 | `01.1` → `01.2` | A ·  seam |
| 5 → 6 | 15.59 | `01.2` → `01.3` | A |
| 18 → 19 | 12.77 | `01.4` → `02.1` | C ·  seam |
| 22 → 23 | 13.23 | `01.5` → `12.1` | C |
| 23 → 24 | 6.47 | `12.1` → `02.1` | C ·  seam |
| 30 → 31 | 7.50 | `01.6` → `02.1` | A ·  seam |
| 32 → 33 | 3.44 | `02.1` → `03.1` | A ·  seam |
| 38 → 39 | 17.66 | `03.1` → `00.1` | B |
| 48 → 49 | 2.89 | `01.7` → `01.8` | A |
| 57 → 58 | 22.29 | `01.8` → `02.2` | A |
| 68 → 69 | 16.01 | `02.2` → `02.3` | C |
| 79 → 80 | 3.95 | `02.3` → `02.4` | A |
| 119 → 120 | 6.78 | `00.2` → `02.10` | C |
| 120 → 121 | 4.27 | `02.10` → `00.3` | B |
| 123 → 124 | 10.06 | `00.3` → `02.11` | C |
| 138 → 139 | 6.80 | `02.12` → `03.2` | C |
| 152 → 153 | 6.00 | `07.1` → `07.2` | A |
| 162 → 163 | 11.94 | `07.2` → `16.1` | C |
| 167 → 168 | 4.89 | `16.1` → `03.4` | A |
| 176 → 177 | 9.23 | `03.4` → `03.5` | C |
| 198 → 199 | 10.25 | `16.2` → `03.6` | C |
| 202 → 203 | 9.89 | `03.6` → `03.7` | C |
| 206 → 207 | 6.79 | `03.7` → `16.3` | C |
| 222 → 223 | 9.99 | `03.9` → `04.1` | C |
| 226 → 227 | 6.45 | `04.1` → `05.1` | C ·  seam |
| 229 → 230 | 4.77 | `05.1` → `03.10` | B ·  seam |
| 241 → 242 | 5.12 | `03.10` → `03.11` | C ·  seam |
| 256 → 257 | 7.62 | `05.1` → `02.13` | C ·  seam |
| 266 → 267 | 8.39 | `02.13` → `06.1` | C |
| 270 → 271 | 28.46 | `06.1` → `06.2` | D ·  seam |
| 272 → 273 | 20.29 | `06.2` → `06.3` | B ·  seam |
| 273 → 274 | 25.15 | `06.3` → `06.2` | D ·  seam |
| 279 → 280 | 7.66 | `06.3` → `06.4` | A ·  seam |
| 295 → 296 | 3.77 | `06.7` → `04.2` | A |
| 299 → 300 | 10.27 | `05.2` → `06.8` | C |
| 300 → 301 | 14.83 | `06.8` → `05.3` | C |
| 302 → 303 | 3.16 | `05.3` → `07.3` | A |
| 315 → 316 | 2.87 | `07.5` → `07.6` | A |
| 329 → 330 | 4.55 | `07.6` → `07.7` | A |
| 337 → 338 | 11.95 | `07.8` → `00.4` | A |
| 338 → 339 | 9.20 | `00.4` → `07.9` | A |
| 339 → 340 | 17.14 | `07.9` → `00.5` | D |
| 340 → 341 | 4.22 | `00.5` → `02.14` | B |
| 341 → 342 | 7.08 | `02.14` → `03.13` | C |
| 355 → 356 | 5.39 | `04.3` → `12.2` | B |
| 359 → 360 | 9.51 | `12.2` → `12.3` | C |
| 371 → 372 | 9.60 | `02.15` → `11.2` | C |
| 372 → 373 | 9.28 | `11.2` → `02.16` | C ·  seam |
| 373 → 374 | 16.01 | `02.16` → `18.2` | D ·  seam |
| 380 → 381 | 6.51 | `05.4` → `12.4` | C |
| 388 → 389 | 7.76 | `12.4` → `12.5` | C |
| 392 → 393 | 28.37 | `12.5` → `02.17` | C |
| 393 → 394 | 27.43 | `02.17` → `12.6` | B |
| 419 → 420 | 3.93 | `08.2` → `08.3` | C |
| 446 → 447 | 2.57 | `08.5` → `08.6` | A |
| 463 → 464 | 4.69 | `08.8` → `08.9` | A |
| 468 → 469 | 2.53 | `08.9` → `08.10` | A |
| 487 → 488 | 8.31 | `08.13` → `16.4` | C |
| 488 → 489 | 14.16 | `16.4` → `07.10` | C |
| 489 → 490 | 18.33 | `07.10` → `13.1` | D |
| 493 → 494 | 15.82 | `13.1` → `22.1` | C |
| 503 → 504 | 20.31 | `22.3` → `13.2` | D |
| 512 → 513 | 11.78 | `13.2` → `13.3` | B |
| 518 → 519 | 25.89 | `13.3` → `13.4` | C |
| 536 → 537 | 5.66 | `14.2` → `14.3` | C ·  seam |
| 538 → 539 | 11.66 | `14.4` → `14.1` | C ·  seam |
| 544 → 545 | 10.60 | `14.2` → `02.18` | A ·  seam |
| 548 → 549 | 4.32 | `14.3` → `00.7` | A ·  seam |
| 550 → 551 | 7.20 | `00.7` → `03.14` | C |
| 551 → 552 | 17.05 | `03.14` → `05.5` | A |
| 570 → 571 | 5.03 | `10.1` → `10.2` | C |
| 574 → 575 | 14.22 | `10.2` → `15.2` | C |
| 579 → 580 | 9.22 | `15.2` → `15.3` | C |
| 583 → 584 | 9.09 | `15.3` → `15.4` | C |
| 589 → 590 | 9.57 | `15.4` → `15.5` | C |
| 592 → 593 | 7.30 | `15.5` → `15.6` | A |
| 599 → 600 | 9.67 | `15.6` → `15.7` | C |
| 603 → 604 | 10.04 | `15.7` → `15.8` | C |
| 605 → 606 | 9.13 | `15.8` → `15.9` | C |
| 616 → 617 | 16.05 | `18.3` → `15.10` | C |
| 621 → 622 | 3.69 | `15.10` → `15.11` | C |
| 624 → 625 | 5.40 | `15.11` → `15.12` | A |
| 634 → 635 | 6.58 | `15.14` → `15.15` | A |
| 639 → 640 | 5.04 | `15.15` → `15.16` | A |
| 642 → 643 | 6.68 | `15.16` → `15.17` | A |
| 643 → 644 | 4.30 | `15.17` → `15.18` | A |
| 652 → 653 | 7.20 | `15.18` → `15.19` | D |
| 668 → 669 | 8.87 | `15.21` → `15.22` | A |
| 679 → 680 | 5.46 | `15.24` → `15.25` | A |
| 692 → 693 | 7.25 | `09.2` → `09.3` | D |
| 720 → 721 | 9.89 | `01.11` → `01.12` | C |
| 723 → 724 | 18.09 | `02.19` → `00.10` | C |
| 730 → 731 | 2.87 | `01.13` → `01.14` | A |
| 736 → 737 | 9.68 | `01.15` → `01.16` | C ·  seam |
| 739 → 740 | 8.21 | `01.16` → `01.17` | C |
| 749 → 750 | 27.83 | `01.19` → `01.20` | D |
| 759 → 760 | 28.83 | `17.3` → `17.4` | D |
| 775 → 776 | 27.67 | `17.5` → `17.6` | D |
| 790 → 791 | 27.09 | `17.9` → `17.10` | D |
| 809 → 810 | 27.43 | `17.14` → `17.15` | D |
| 859 → 860 | 27.21 | `17.27` → `17.28` | D |
| 886 → 887 | 11.28 | `11.4` → `11.5` | D |
| 892 → 893 | 7.39 | `11.6` → `11.7` | C |
| 903 → 904 | 11.55 | `20.6` → `20.7` | C |
| 915 → 916 | 10.56 | `20.8` → `20.9` | D |
| 920 → 921 | 16.89 | `20.10` → `11.8` | D |
| 924 → 925 | 16.59 | `11.8` → `11.9` | A |
| 929 → 930 | 25.67 | `11.9` → `11.10` | C |
| 935 → 936 | 26.57 | `17.35` → `20.11` | D |
| 945 → 946 | 24.63 | `20.14` → `20.15` | C |
| 949 → 950 | 4.39 | `20.15` → `20.16` | A |
| 965 → 966 | 14.93 | `20.18` → `18.4` | D |
| 989 → 990 | 17.36 | `17.41` → `17.42` | C |
| 1005 → 1006 | 12.42 | `17.43` → `17.44` | D |
| 1014 → 1015 | 29.86 | `17.46` → `17.47` | D |

**Three borderline pairs, named so the inventory is provably closed on both sides of the threshold.** Re-deriving this table from the corpus produced 115 pairs where an earlier pass had produced 118. The three that moved are `399 → 400`, `795 → 796` and `931 → 932`, which measure 30.88, 30.06 and 30.04 — between 0.1% and 3% above the 30 boundary, so they land in the 30-to-80 band and are counted in direction three instead. Nothing about the segmentation changed; only which band the arithmetic assigns them to. They are named here because a threshold that three pairs sit within 1 unit of is a threshold whose exact value must not be treated as meaningful, and because a reader re-running the measurement should be able to account for the difference rather than suspect a lost pair.

**How the four directions reconcile to the catalog's 248 flows.** The counts close exactly, which is the check that the inventory is complete rather than merely long:

| Quantity | Value | Where it comes from |
|---|---|---|
| Boundaries in the ≥80 band | 54 | 135 pairs in the band, 81 of which were kept together — direction one |
| Boundaries in the 30-to-80 band | 75 | 178 pairs in the band, 103 of which were kept together — direction three |
| Boundaries in the 2-to-30 band | 115 | 437 pairs in the band, 322 of which were kept together — direction four |
| Boundaries in the <2 band | 13 | 271 pairs in the band, 258 of which were kept together — direction two |
| **Total boundaries** | **257** | 54 + 75 + 115 + 13 |
| **Contiguous spans** | **258** | 257 boundaries cut the 1,022-frame sequence into 258 spans |
| **Named flows** | **248** | 258 spans − 10 surplus spans |

The 10 surplus spans are the reason a flow count is not simply a span count: **eight flows occupy more than one non-contiguous span**, because the corpus returns to a journey after leaving it. Those eight are `02.1` and `05.1` with two extra spans each, and `06.2`, `06.3`, `14.1`, `14.2`, `14.3` and `14.4` with one extra span each — 2 + 2 + 1 + 1 + 1 + 1 + 1 + 1 = 10. This is the arithmetic that makes the export's curation visible: a flow with three spans is a flow the capture session came back to.

### Ambiguous cases and the fewest-assumptions choice

Where two segmentations were defensible, the reading requiring the **fewest assumptions** was chosen. Every such case is recorded here rather than silently resolved.

| Ambiguity | Defensible readings | Choice, and why it assumes least |
|---|---|---|
| Frames 19, 24 and 31–32 all show a newly created workspace's first channel, but they are not contiguous | Three separate flows, or one flow with three spans | **One flow with three spans (`02.1`).** Frames 19 and 31 are byte-identical, so calling them different journeys would assert that identical pixels mean different things — a strictly larger assumption than accepting one journey re-captured. |
| Frames 110, 227–229 and 256 likewise | Three separate flows, or one flow with three spans | **One flow with three spans (`05.1`).** Frames 110, 227 and 256 are byte-identical; same reasoning. |
| Frames 229 and 242 are byte-identical to each other | One flow, since the images are the same, or two flows, since the surrounding frames differ | **Two flows (`05.1` and `03.11`).** The neighbours are unambiguous: one sits before a message is composed, the other after it is sent. Identical pixels at different journey positions are two states of one screen, not one state of two journeys. This is the exact mirror of the case above, and the two are resolved by the same rule — neighbours decide, not pixels alone. |
| Frames 4 and 728 are byte-identical, 724 apart | One flow spanning both, or two flows | **Two flows (`01.2` and `01.13`).** Nothing links the two spans except the image itself; assuming a single 724-frame journey would be the larger assumption. |
| Frames 141 and 174 (33 apart) and frames 373 and 545 (172 apart) are byte-identical pairs | Merge, or keep separate | **Kept separate** (`03.2`/`03.4` and `02.16`/`02.18`), by the same neighbours-decide rule. |
| Frames 90 and 95 are byte-identical, 5 apart | Merge into one flow, or keep separate | **One flow (`02.5`).** Both lie inside the channel notification-preference journey that frames 88–96 show, so no split is needed and none is assumed — the neighbours, not the shared image, decide. |
| Frames 734 and 736 are byte-identical, 2 apart, and the frame between them is not | Merge or split | **One flow (`01.15`).** The frame between the identical pair carries a red incorrect-email-or-password error with the email field outlined red and the password field cleared [frame 735](../../screenshots/Slack%20web%20Jul%202024%20735.png), so the sequence 734 → 735 → 736 reads as one credential retry: entered credentials, rejection, re-entered credentials. Adjacency is overridden in the *joining* direction here — the identical outer frames are not a redundant capture pair but the two ends of a single journey, so no split is needed and none is assumed. |
| The two application error pages could belong to the error-state area or to the marketing site whose navigation and footer they carry | Either as primary | **`21-states.md` primary, `17-marketing-site.md` secondary.** The frames' subject is the error state; the marketing chrome is context. This makes `21-states.md` the primary owner of only 2 of 1,022 frames, which is recorded rather than smoothed. |
| The app-directory site and the developer-platform site are marketing surfaces, but their subject is apps | `17-marketing-site.md` or `11-apps-and-integrations.md` | **`11-apps-and-integrations.md`.** Subject beats surface family, so the app domain keeps one owner instead of being split across two documents. |
| A support request raised inside the administration console is both an administration surface and a help journey | `15-admin-workspace.md` or `20-help-community.md` | **`20-help-community.md`.** Same rule: the journey's goal is support, and the console is where it happens. |
| The automations rail destination fronts both apps and builder-authored workflows | One area, or a stated boundary | **A stated boundary**, recorded as deviation D6, rather than merging two areas or inventing a third. |

**One-primary-owner arithmetic, stated plainly.** 592 of the 1,022 frames carry a secondary cross-reference in addition to their primary owner. Secondary references are deliberately excluded from the coverage arithmetic; if they were counted, the sum would exceed the corpus and prove nothing.

### How this catalog's coverage is verified, and why counting is not enough

Anyone extending or checking this catalog — including the build run auditing its own coverage — needs the verification contract, not just the numbers. It has three parts, and the third is the one that matters:

1. **The count assertion.** The ledger holds one row per frame, and the row count equals the number of files in `screenshots/`.
2. **Set equality.** The set of frame numbers in the ledger equals `{0 … 1021}` exactly — no missing frame, no extra frame, no duplicated row — and the union of every area document's `Frames covered` set equals that same set.
3. **Set equality is the binding gate; the count is only the requirement.** A row count can be correct while the coverage is wrong, because **one deleted row and one duplicated row cancel out** and leave the total untouched. This is not hypothetical: it was reproduced deliberately against this catalog by deleting one frame's row and duplicating another's, and the row count still read 1,022 while the set comparison correctly reported one frame duplicated and one frame missing. A validation that checks only the count would have passed a catalog with a frame silently dropped.

So both are checked, always, and a disagreement between an area document and the ledger is a defect in one of them rather than a difference of interpretation.

### The standing counter-example to adjacency

Eight groups of frames are **byte-identical**, MD5-verified, covering 17 frames of which 9 are redundant copies: `[4, 728]` · `[19, 31]` · `[90, 95]` · `[110, 227, 256]` · `[141, 174]` · `[229, 242]` · `[373, 545]` · `[734, 736]`.

Three of those groups pair frames at **distant indices** — 4 with 728 (724 apart), 110 with 227 and 256 (spanning 146), and 373 with 545 (172 apart). That is direct, mechanical proof that the corpus is a curated export which re-orders and repeats surfaces rather than a linear screen recording. It is why adjacency can never be more than a prior here, and it is the counter-example to reach for whenever the temptation to trust frame order returns.

### Inconsistencies are preserved, never reconciled

Where adjacent or nearby captures disagree about a user-interface element, the disagreement is recorded exactly as observed. The record of what the images show is never altered to make the narrative tidy. Three disagreements were found, each confirmed by direct inspection of both frames:

- **The trial countdown differs between captures.** The sidebar promotional banner reads "6 days left on this offer" at [frame 200](../../screenshots/Slack%20web%20Jul%202024%20200.png) and "1 day left on this offer" at [frame 550](../../screenshots/Slack%20web%20Jul%202024%20550.png). The captures were evidently taken on different days. Consequence for the build: the countdown is a computed value, not a constant, and no single number from the corpus may be hard-coded.
- **The navigation rail's destination set differs between captures.** It carries home, later and more at [frame 200](../../screenshots/Slack%20web%20Jul%202024%20200.png); home, direct messages, activity, later and more at [frame 550](../../screenshots/Slack%20web%20Jul%202024%20550.png); and additionally a lists destination at [frame 120](../../screenshots/Slack%20web%20Jul%202024%20120.png). Consequence: the rail is configurable per user, which the preferences area independently corroborates by exposing destination visibility settings [frame 544](../../screenshots/Slack%20web%20Jul%202024%20544.png). The rail must therefore be built as a data-driven list, never as a fixed row of controls.
- **The channel-rename system message renders the prior channel name differently.** The same rename event reads `from "design-project"` at [frame 200](../../screenshots/Slack%20web%20Jul%202024%20200.png) and `from "designproject"` at [frame 550](../../screenshots/Slack%20web%20Jul%202024%20550.png). No reconciliation is offered. Both readings are recorded, and the build should treat the prior name as stored data echoed verbatim rather than as a value it can normalise.
- A smaller variance, recorded for completeness: the conversation header's canvas control is labelled at [frame 200](../../screenshots/Slack%20web%20Jul%202024%20200.png) and icon-only at [frame 550](../../screenshots/Slack%20web%20Jul%202024%20550.png).

### The inspection protocol actually used

The fabrication ban makes second-hand description a failure, and 1,022 frames averaging roughly 600 KB cannot be opened one at a time within any sane budget. The protocol that satisfies both:

- **Primary mode — nine-up contact sheets** at 640 × 440 per tile, composed in strict contiguous index order, **each tile stamped with its own frame number** so that a caption can never be misattributed. 114 sheets cover the corpus.
- **First fallback — four-up sheets** at 960 × 660 per tile, for ranges whose detail did not resolve at nine-up density. A targeted measure, not the default.
- **Second fallback — a single full-resolution read** of one frame, for the few that resisted both.
- **Honest failure — the ledger's uninspectable-frame marker**, with no description of any kind beside it. No frame in this corpus needed it, so the marker appears on no row.
- **The bottom capture band is excluded from every observation.** See [Known limitations](#known-limitations) item 3 for its measured height and what it contains.
- **No derived artefact was ever written into the repository.** Every contact sheet and intermediate image lived in a temporary workspace outside the working tree. `screenshots/` is immutable and was never modified, renamed, cropped, re-encoded or copied.

### On the absence of project rules

**No user-specified rules exist for this project.** The rules document was queried and returned no rules, and the query was repeated to confirm the response was complete rather than truncated. There is therefore no rule text governing this catalog, and none has been invented — a reader should not go looking for a rules document that does not exist.

That absence is not licence to lower the bar. Ten enterprise-standard practices took the place of rules and are the acceptance bar this catalog was held to: evidence before assertion, with a measurement that disagrees with a documented figure reported and the disagreement named; verify configuration by building it rather than reasoning about it; test the validation gates against a deliberately defective catalog as well as a good one; keep the change surface least-privilege; treat primary evidence as read-only; give every reusable definition a single source of truth; make traceability and the validation environment reproducible; observe third-party intellectual-property hygiene; disclose limitations rather than hide them; and specify durably, in proportional terms that survive the corpus's own variance.

## Taxonomy deviations from the scaffold

The imagery is the source of truth and the original 22-area scaffold was a starting point, so the taxonomy was allowed to merge, split, rename or extend as the corpus required. **Every deviation is recorded here**, with the frames that forced it and the reasoning that chose it.

### D1: One new area, `22-external-collaboration.md`

The corpus contains a **dedicated top-level destination** for collaboration with other organizations, and it is not a variant of any scaffolded area. It has its own sidebar sections for organizations and invitations, its own settings control, an upgrade-badged create-channel action and a start-a-conversation action, a people search keyed by **name, company or email address**, a hero explaining cross-organization collaboration, action cards, management rows for customising settings, handling requests and handling connections, and an instructional carousel [frame 494](../../screenshots/Slack%20web%20Jul%202024%20494.png), [frame 496](../../screenshots/Slack%20web%20Jul%202024%20496.png). Inviting an external person runs through its own modal, which states plainly that a message to someone at another organization is sent as an email invitation [frame 498](../../screenshots/Slack%20web%20Jul%202024%20498.png), and completes in a confirmation stating the invitee has **fourteen days to accept**, after which they appear in the direct-message list [frame 500](../../screenshots/Slack%20web%20Jul%202024%20500.png). Received and sent invitations each get their own tab with its own empty state [frame 501](../../screenshots/Slack%20web%20Jul%202024%20501.png), [frame 502](../../screenshots/Slack%20web%20Jul%202024%20502.png).

It is corroborated from four other directions: a dismissible external-organization advisory inside the ordinary invite modal [frame 45](../../screenshots/Slack%20web%20Jul%202024%2045.png); an external-organization path in the invite-as dropdown [frame 49](../../screenshots/Slack%20web%20Jul%202024%2049.png); a disambiguation dialog that makes the user choose between an external organization and their own before an invitation is scoped [frame 65](../../screenshots/Slack%20web%20Jul%202024%2065.png); and a **manage-external-connection-invitations** entry in the administration group of the in-app tools-and-settings submenu [frame 567](../../screenshots/Slack%20web%20Jul%202024%20567.png).

**Why a new area rather than a fold-in.** It owns entities no other area owns — the external organization, the connection request, an externally-scoped invitation with its own acceptance window, and the guest account. Folding it into direct messages would orphan those entities; folding it into administration would duplicate them.

**Why that filename.** The area is named **functionally**, deliberately **not** after the third-party product feature it depicts. The corpus itself shows why the distinction matters: the administration entry at [frame 567](../../screenshots/Slack%20web%20Jul%202024%20567.png) carries the third party's own branded feature name, and adopting that name into a filename would bake third-party intellectual property into the structure of this deliverable, where it would then propagate into the next run's route names, module names and types.

### D2: Area 15 widened rather than split

The corpus shows **two structurally different administration surfaces**, not one. The first is the in-app workspace menu and its tools-and-settings submenu, grouped into tools, settings and administration, with several entries carrying external-link icons that signal they leave the application [frame 566](../../screenshots/Slack%20web%20Jul%202024%20566.png), [frame 567](../../screenshots/Slack%20web%20Jul%202024%20567.png). The second is a **standalone browser administration console** with its own top bar and its own left navigation split into account and administration groups [frame 575](../../screenshots/Slack%20web%20Jul%202024%20575.png), whose home presents chevron cards for account settings, settings and permissions, workspace management, billing and customization [frame 600](../../screenshots/Slack%20web%20Jul%202024%20600.png).

**Resolution:** [`15-admin-workspace.md`](15-admin-workspace.md) carries **two flow groups**, one per surface, with the console documented as its own group including its distinct navigation model. Widening one area's charter is a smaller assumption than inventing a twenty-fourth area, and the widening is itself recorded here rather than left implicit. This makes area 15 the second-largest area in the catalog at 25 flows over 104 frames.

### D3: Audio clips become a named flow in area 03

The composer hosts a live audio recorder — a floating pill carrying a running waveform, an elapsed timer, a cancel control and a confirm control, with the message list dimmed behind it [frame 200](../../screenshots/Slack%20web%20Jul%202024%20200.png) — and the recorded clip then attaches to the message with playback controls. The scaffold's description of area 03 did not name this capability. **Resolution:** an explicit flow inside [`03-messaging-and-composer.md`](03-messaging-and-composer.md). No new file.

### D4: Client hand-off becomes a flow in area 01

The corpus contains a dedicated hand-off page instructing the user to launch the desktop application, with a fallback link to continue in the browser [frame 750](../../screenshots/Slack%20web%20Jul%202024%20750.png), and the workspace menu offers desktop, mobile and sign-in-on-mobile hand-offs [frame 567](../../screenshots/Slack%20web%20Jul%202024%20567.png). **Resolution:** a client hand-off flow inside [`01-onboarding-and-auth.md`](01-onboarding-and-auth.md). No new file.

### D5: Upgrade gating is cross-cutting and defined once

Upgrade badges, trial countdowns, trial-in-progress footer items and upsell strips are not local to any one area. They appear in the sidebar of a channel view [frame 550](../../screenshots/Slack%20web%20Jul%202024%20550.png), on the canvas entry of the global create menu [frame 550](../../screenshots/Slack%20web%20Jul%202024%20550.png), on the create-channel action of the external-collaboration destination [frame 494](../../screenshots/Slack%20web%20Jul%202024%20494.png), in the workspace menu as a trial strip with an upgrade action [frame 567](../../screenshots/Slack%20web%20Jul%202024%20567.png), in the channel details Integrations tab [frame 83](../../screenshots/Slack%20web%20Jul%202024%2083.png), inside the add-people modal [frame 62](../../screenshots/Slack%20web%20Jul%202024%2062.png), as a trial-scoped advisory strip in search results [frame 688](../../screenshots/Slack%20web%20Jul%202024%20688.png), on an app home surface [frame 372](../../screenshots/Slack%20web%20Jul%202024%20372.png) and in the administration console's billing card [frame 600](../../screenshots/Slack%20web%20Jul%202024%20600.png).

**Resolution:** one canonical `C-UPGRADE-GATE`, defined once in [`00-product-overview.md`](00-product-overview.md), with its state matrix in [`21-states.md`](21-states.md), and referenced **by identifier** from every other area. No new file, and no contract stated twice.

### D6: The automations rail entry gets an explicit boundary rule

The apps destination is reached under a sidebar heading reading *Automations*, whose entries are the workflow builder and the app directory [frame 368](../../screenshots/Slack%20web%20Jul%202024%20368.png) — a single destination fronting two different domains. The in-app tools submenu compounds it by listing the workflow builder among tools and manage-apps and manage-workflows among administration entries [frame 567](../../screenshots/Slack%20web%20Jul%202024%20567.png).

**Resolution — a stated boundary rather than a merge:** builder-authored automations belong to [`10-workflow-builder.md`](10-workflow-builder.md); third-party app surfaces and the app directory belong to [`11-apps-and-integrations.md`](11-apps-and-integrations.md). The rule is documented in [`00-product-overview.md`](00-product-overview.md) alongside the rail destination map. No new file.

### Net effect

The scaffold's **22 areas became 23**. Adding the two cross-cutting documents — this master index and the [coverage ledger](_screenshot-index.md) — the catalog is **25 files**.

## Known limitations

Each limitation below is stated **exactly once in the whole catalog**, here. A limitation that is disclosed is acceptable; a limitation that is hidden is a defect.

### 1. Frame image links resolve on the source host but return 404 in the published documentation site

`mkdocs.yml` declares no `docs_dir` override [mkdocs.yml:L2-L3], so the static-site generator copies only the documentation directory into the built site. The corpus lives outside it, in `screenshots/`, and the `../../screenshots/…` links therefore have no target in the built output. They **do** resolve when the Markdown is read on the source host, which is also where the diagrams render.

This limitation is **accepted, not worked around.** No screenshot is copied, moved or duplicated into the documentation directory to satisfy the link checker — doing so would duplicate roughly 600 MB of third-party imagery into the published site to fix a cosmetic warning.

A measured consequence follows and is worth stating because it will otherwise look like a defect: the build emits one link warning **per link occurrence**, not per distinct target. This was verified directly — two link occurrences produced exactly two warnings — and the coverage ledger alone contains 1,115 frame-link occurrences over 1,022 distinct targets, so a full catalog emits several thousand warnings. Every one is expected and accepted. Consequently **the validation gate is a plain documentation build and never the strict variant**: the strict build was confirmed to abort with a non-zero exit on precisely these warnings, while the plain build completes with exit status 0.

### 2. Mermaid diagrams do not render under the committed site configuration

The site's documentation plugin bundles a superfences Markdown extension that consumes fenced code blocks before the diagram plugin can claim them. Verified by building this page against the committed configuration: each diagram fence is emitted as a syntax-highlighted code block wrapped in a `language-text highlight` container, and the built page contains **no diagram-bearing markup at all** — zero elements carrying a diagram class and no diagram script tag. The diagram plugin never sees a fence it recognises, so no diagram is produced. (The word itself does still appear in the built page, but only in this section's own prose and heading anchor, which is the measurement being reported rather than a diagram.)

The fences are nevertheless written exactly as mandated, because they **render natively on the source host** — the same surface where the frame links resolve. A six-line `markdown_extensions` superfences declaration was verified to fix the rendering, and it is **deliberately withheld**: it exceeds the single permitted navigation edit to `mkdocs.yml`, so it is carried as an authorization-gated follow-up rather than applied quietly. Do not apply it without that authorization.

### 3. The bottom capture band is excluded from all observation and from every build target

Every frame in the corpus carries a full-width dark charcoal band along its bottom edge. Direct inspection shows it carries, at the left, a rounded-square product logo mark beside a product wordmark and, at the right, the words "curated by" beside the curator's own logo mark and wordmark [frame 120](../../screenshots/Slack%20web%20Jul%202024%20120.png). It is **capture watermarking, not product interface**, so it is excluded from every caption in the [coverage ledger](_screenshot-index.md) and is not a build target. Nothing in it is a feature to implement.

**The measured height disagrees with the figure recorded upstream, and the disagreement is named here rather than propagated.** Upstream documentation states the band is 44 pixels tall in all 1,022 frames. A corpus-wide measurement — walking upward from the last row while the row-wise median grey stays within a tolerance of the bottom row's — gives a different answer:

| Measured band height | Frames |
|---|---|
| 120 px | 979 |
| 119 px | 27 |
| 118 px | 11 |
| 121 px | 3 |
| 117 px | 1 |
| 143 px | 1 |
| **44 px** | **0** |

The band's median grey value is identical in **all 1,022 frames**, which is what makes the detection unambiguous, and the band's **top edge sits at y = 1200** in 937 frames. **No frame measures 44 pixels.** Cropping at 44 pixels would leave the third-party logo mark, the wordmark and the curator's attribution inside the analysed viewport — that is, it would leave third-party branding inside the region the catalog treats as product interface, which is precisely the outcome the exclusion exists to prevent.

The catalog therefore excludes the bottom **120 pixels**, the modal and effectively maximal band height, so that it never under-crops. That gives an effective product viewport of 1920 × (H − 120) = **1920 × 1200** for the 974 canonical frames — a figure that agrees exactly with the measured top edge of the band. The single 143-pixel reading is a detector artefact on one frame whose content immediately above the band happens to share the band's grey value; it is reported rather than filtered out. This band variance also correlates with, and explains, the frame-height variance in the next limitation: the band is what the extra pixels are.

### 4. Frame heights are not uniform

Measured across the corpus: **1320 px in 974 frames · 1319 in 28 · 1321 in 16 · 1326 in 3 · 1318 in 1**. Width is 1920 in all 1,022 frames and the colour mode is RGBA in all 1,022. Upstream documentation describes the corpus as uniformly 1920 × 1320; five distinct heights were measured, so it is not.

Stated prescriptively, because this is a constraint on how the catalog is written and how the build must read it: **layout specifications throughout the catalog are proportional or relative — regions, columns, ordering and relative sizing — never absolute pixel offsets.** An offset keyed to a fixed canvas would be wrong on 48 of the 1,022 frames, and wrong again on any viewport the build actually ships to.

### 5. Residual third-party product-name occurrences: the complete, reviewed exception set

The intellectual-property gate requires zero third-party brand colour values anywhere in the catalog, and zero residual third-party product-name occurrences once the mandated citation filenames are discounted. Two occurrences are unavoidable, and this is the complete set:

1. **The citation filenames themselves.** Every frame citation embeds the corpus filename, which contains the third party's name. The corpus is read-only and must not be renamed, so the citation form cannot avoid it. The gate strips this pattern before counting.
2. **The verbatim Next Build Run Prompt block in this document.** The block is a user-provided template whose wording must be preserved exactly. Within it, the third party's name appears inside a **trademark-avoidance instruction** — the constraint that the next run must carry no third-party trademarks, logos, wordmarks or brand colours — and is therefore an instruction *not* to adopt the intellectual property, not an adoption of it.

Everywhere else the catalog uses functional phrasing: the app directory, the external-collaboration surface, the brand-guidelines site, the help centre, the community site, the built-in assistant app, a cloud-drive app, a poll app, a standup app, a calendar app, a conferencing app. Iconography is named by function, never by third-party asset name. The placeholder vocabulary — product logo mark, product wordmark, primary brand color, accent color 1 to 4, text-primary, surface-default, plan tier 1 to 4 — is defined authoritatively in [`00-product-overview.md`](00-product-overview.md), and **no product name is ever hard-coded**.

### 6. Two surfaces state two different lifetimes for the same bearer credential

The in-product copy-invite-link confirmation states the link expires in **nineteen days** [frame 46](../../screenshots/Slack%20web%20Jul%202024%2046.png). The administration console's invite-links table renders, on the same kind of link, a creation date and an expiry date **exactly one month** apart [frame 656](../../screenshots/Slack%20web%20Jul%202024%20656.png). Both are read from the pixels, both are recorded, and **neither is reconciled** — per this catalog's standing rule that the record of what the images show is never altered to make a narrative tidy.

It is recorded as a limitation rather than merely as an inconsistency because of what the value *is*. An invite link is a **bearer credential**: whoever holds it can join the workspace. A build that reads [`01-onboarding-and-auth.md`](01-onboarding-and-auth.md) alone and hard-codes nineteen days is setting the lifetime of a credential from a copy string that another surface contradicts. Both documents now carry a reciprocal note — [`01`](01-onboarding-and-auth.md) in its **Inconsistencies** table and [`15`](15-admin-workspace.md) in its own — and the resolution is stated once here: **a build settles a single authoritative lifetime, stores it on the invite-link record, renders every surface from that stored value rather than from copy, and enforces it server-side on redemption so that an expired link is refused whatever any surface says.**

The same discipline applies to the other two clocks, which do **not** conflict and must not be merged with this one: they are enumerated with their single named authorities in the [consolidated data model](#consolidated-data-model).

## Omissions

**The two priority artifacts are complete; one area document is outstanding and is named below.** This section is the catalog's single declared place for recording an omission, so it states what is verified and what is not, rather than what is hoped. The output priority order this run followed put the coverage ledger first and this master index second, then the in-product areas, then the marketing, pricing, brand and help areas — and it is the largest single item at the tail of that order that remains outstanding, exactly as the priority rule intends. It separates what is verified, what is not yet delivered and what is absent by design, in that order and without conflating them.

Verified complete:

- **This master index.** Every mandated section is present, in order, at full depth. No section was dropped, truncated or summarised to fit a budget.
- **The [coverage ledger](_screenshot-index.md).** It carries its full complement of **1,022 rows**, one per frame; its frame set equals `{0 … 1021}` exactly, with no gap, no extra and no duplicated row; every row names an owning area document; and all **248 flows are registered in the ledger**. Checked by the arithmetic described in [How this catalog's coverage is verified](#how-this-catalogs-coverage-is-verified-and-why-counting-is-not-enough) rather than asserted. **Registered in the ledger and specified in an area document are two different things, and the difference is stated here rather than left to be inferred:** of those 248 flows, **173 are specified** in the 19 delivered area documents and **75 remain pending**, all 75 belonging to the four public-surface areas that have not yet been delivered.
- **Twenty-two of the twenty-three workflow-area documents** — `00` through `16`, plus [`18-pricing-plans.md`](18-pricing-plans.md), [`19-brand-guidelines.md`](19-brand-guidelines.md), [`20-help-community.md`](20-help-community.md), [`21-states.md`](21-states.md) and [`22-external-collaboration.md`](22-external-collaboration.md). Between them they own **851 of the 1,022 frames** across **200 of the 248 flows**, and each one's `Frames covered` set reconciles against the ledger's allocation for it.
- **[21-states.md](21-states.md), the cross-cutting states document.** It was **undelivered at an earlier checkpoint and is now delivered**, and the fact is recorded here rather than quietly dropped, because this section is the catalog's single declared place for such a record and it previously asserted completeness while that document was absent. It is the primary owner of flow `21.1` and of frames 1020 and 1021 only, and it carries the full cross-cutting state matrix, the `C-UPGRADE-GATE` state set required by [deviation D5](#d5-upgrade-gating-is-cross-cutting-and-defined-once), and the role-gated versus device-permission-denied distinction. Its two-frame primary ownership is the one-primary-owner rule working as intended, not a coverage gap — see the [index](#index-of-catalog-documents).

The catalog is planned at **25 files** — these two plus the 23 workflow-area documents enumerated in the [index](#index-of-catalog-documents), whose per-area flow and frame allocations are already fixed and published in the ledger's [coverage assertion](_screenshot-index.md#coverage-assertion). **If any area document is ever delivered incomplete, or not delivered at all, it must be recorded here**, naming the document and the reason. Applying that policy to the present state: **24 of the 25 planned files are delivered** — this index, the ledger and 22 of the 23 area documents, covering **851 of the 1,022 frames** as primary owner. **One area document is outstanding**, and it is named here so its absence is a record rather than a gap: [`17-marketing-site.md`](17-marketing-site.md) — 171 frames and 48 flows, already allocated in the ledger and awaiting its own document. Until it lands, links to that document from elsewhere in the catalog resolve on the source host but not in the built site, and the roll-up's [Referenced by](#consolidated-component-inventory-roll-up) column carries no entry for it. Anything not listed above as verified should be confirmed against that allocation before it is relied on.

**Outstanding, recorded here as this section requires.** One area document is not yet written. Its flows, frame allocations and captions are already fixed and published in the ledger, so nothing about the corpus is unrecorded — what is missing is the behavioural specification built on top of that record. Until it is delivered, the ledger is the authority for those frames.

| Document | Frames allocated | Flows allocated | Consequence while outstanding |
|---|---|---|---|
| `17-marketing-site.md` | 171 | 48 | The only outstanding allocation, and the largest single one in the catalog. Links to it from delivered documents do not resolve; the marketing surfaces are described only by their ledger captions |
| **Total** | **171** | **48** | 171 + 851 = 1,022 frames; 48 + 200 = 248 flows |

Two further consequences follow from that one, and both are stated rather than left to be discovered:

- **Cross-references into the one outstanding document do not resolve.** Delivered documents legitimately cite it as the owner of surfaces they do not own themselves, so a documentation build reports one unresolved-link warning per citation — **300 for `17`**. These are the *only* unresolved internal targets in the catalog; every other link resolves. They will clear when the document is written, and they must not be "fixed" by removing the citations, because the ownership statements are correct.
- **The catalog is not yet added to the documentation site navigation.** Publishing the pages in `mkdocs.yml` is the final step of the catalog's delivery and has not been performed, so the pages build but are not reachable from the site's navigation tree. It is recorded here because this section is the declared place for it.

Also verified complete: **22 of the 23 workflow-area documents** — [`00-product-overview.md`](00-product-overview.md) through [`16-files-media.md`](16-files-media.md), plus [`18-pricing-plans.md`](18-pricing-plans.md), [`19-brand-guidelines.md`](19-brand-guidelines.md), [`20-help-community.md`](20-help-community.md), [`21-states.md`](21-states.md) and [`22-external-collaboration.md`](22-external-collaboration.md). Each follows the eleven-section template in order, carries at least one diagram, and claims a `Frames covered` set that reconciles exactly with the ledger's published primary-ownership allocation.

**Not yet delivered, recorded here as required:**

| Not delivered | Reason | Consequence for a reader |
|---|---|---|
| [`17-marketing-site.md`](17-marketing-site.md) | Not yet authored. Its **48 flows over 171 primary frames** are allocated and published in the ledger's [coverage assertion](_screenshot-index.md#coverage-assertion), and the ledger already carries an observed caption for every one of those frames | Links to it from other documents do not resolve yet. The marketing pages' section ordering and navigation variance are not yet specified; the ledger's captions are the only record |
| The `nav:` addition in the repository's `mkdocs.yml` | Deliberately deferred until every catalog page exists, because a navigation entry must reference a page that is present | Every catalog page builds and is reachable by link, but the pages are not yet listed in the documentation site's own navigation |

**Union closure is therefore not yet verifiable as a whole.** The invariant — the union of every area's `Frames covered` set equals `{0 … 1021}` — needs all 23 areas. Twenty-two reconcile exactly against the ledger today; the one remaining frame set is allocated and published but unclaimed until its document exists. The ledger's own [coverage assertion](_screenshot-index.md#coverage-assertion) states the same position.

Three things are absent by **design** rather than by omission, and are recorded here so that their absence is not mistaken for a gap: decorative marketing copy is deliberately not transcribed, because the build must supply its own; third-party brand palette values are deliberately not carried forward, because they are not this project's design tokens; and the superfences fix described in [limitation 2](#2-mermaid-diagrams-do-not-render-under-the-committed-site-configuration) is deliberately not applied, because it exceeds the permitted change surface.

## Next Build Run Prompt

```text
WHY:  build a Slack-style, own-branded team-communication platform from this catalog.
WHAT: scope — reference the prioritized build backlog (Phase 1 first), the consolidated
      data model, and the consolidated component inventory as authoritative requirements;
      every in-scope flow's acceptance criteria come from its workflow-area document.
HOW:  constraints — a TypeScript web application (per catalog-info.yaml), own product
      name/branding/color palette with no Slack trademarks, logos, wordmarks or brand
      colors, and the workflow catalog under docs/workflows/ as the single source of
      truth for behavior and layout.
```

**The TypeScript web-application constraint is not a preference — it is what the repository's own component descriptor declares.** The descriptor is quoted here as authority and is never modified:

- `tags: … typescript, web-app` [catalog-info.yaml:L10-L11]
- `labels: blitzy.com/language: typescript` [catalog-info.yaml:L13]
- `spec.system: blitzy-typescript` [catalog-info.yaml:L28]
- `annotations: backstage.io/techdocs-ref: dir:.` [catalog-info.yaml:L15] — which additionally proves that the root `mkdocs.yml` is the documentation entry point, and therefore that this catalog is published from the repository root rather than from a nested site.

**The next run must choose its own product name and its own colour palette.** This catalog never hard-codes a product name; the placeholder vocabulary in [`00-product-overview.md`](00-product-overview.md) is where a name and a palette get substituted in. The only palette observable anywhere in the corpus belongs to a third party and is **not adopted as this project's design tokens** — the brand-guidelines area documents the *structure* of a brand page, with the observed values present solely as placeholders to be replaced.

Where to start, concretely: read [`00-product-overview.md`](00-product-overview.md) end to end, then work [Phase 1](#phase-1-shell-authentication-channels-messaging) of the [backlog](#prioritized-build-backlog) in the order given, taking each flow's acceptance criteria from its own area document and each entity's fields from the [consolidated data model](#consolidated-data-model).
