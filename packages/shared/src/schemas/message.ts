/**
 * The message contract: three message types, the operations that act on one, and
 * the two fields that make delivery correct.
 *
 * ---------------------------------------------------------------------------
 * THE TWO LOAD-BEARING FIELDS
 * ---------------------------------------------------------------------------
 *
 * Almost everything in this module is a shape. Two fields are not — they are the
 * mechanism by which a conversation stays ordered and a send stays reconcilable,
 * and both are small enough to be mistaken for bookkeeping:
 *
 *   - {@link messageSequenceSchema}, the authoritative per-conversation
 *     sequence. The publish/subscribe bus this product fans out over is
 *     documented as **at-most-once**, so the transport can never be the source
 *     of truth for ordering or for completeness. A durable, gapless, monotonic
 *     integer allocated by the server is what makes correctness recoverable: a
 *     client persists its highest *contiguous* sequence, replays the gap over
 *     HTTP, and refetches wholesale beyond a bounded window. It is
 *     authoritative, never advisory.
 *
 *   - {@link clientMessageIdSchema}, the client-generated identifier. A client
 *     mints one before it has spoken to the server, renders the message
 *     optimistically against it, and matches the acknowledgement back to that
 *     rendered row. It is caller-supplied data, so it confers nothing.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS DELIBERATELY ABSENT, AND WHY EACH ABSENCE IS ENFORCEMENT
 * ---------------------------------------------------------------------------
 *
 * **No workspace identifier and no acting-account identifier appears on any
 * request in this module.** Per `PROJECT_RULE_R1` an authorization decision may
 * never rest on a caller-supplied workspace or actor, so the fields are not
 * offered at all: a handler cannot read from the wire what the wire does not
 * carry. A send names the destination conversation and carries the body; the
 * author is resolved from the acting session. A caller-supplied author would be
 * an impersonation vector, which is why no shape here has one — not the send,
 * not the edit, not the reaction, not the forward. Every mutation below is
 * authorized server-side at the point of execution, against the acting session
 * and the specific target message or conversation, and a control that the client
 * hid, disabled or never rendered exempts nothing.
 *
 * **No per-viewer fact appears on the message.** Read state, the unread
 * boundary, mark-as-unread, saved-for-later, a reminder's due time and the
 * per-message reply-notification state are all on
 * {@link viewerMessageStateSchema}, keyed by viewer and message. `S-PERUSER`
 * [docs/workflows/00-product-overview.md L562-L566] settles it with one
 * question — could two people opening this at the same moment legitimately see
 * different values? — and the relation table
 * [docs/workflows/README.md L364] names this exact set on the viewer-and-message
 * row. The consequence of getting it wrong is concrete rather than tidy: a read
 * marker on the shared record means one person reading marks it read for
 * everyone, and it discloses that person's behaviour to every other member.
 *
 * **No unread counter appears anywhere.** Not on the message and not on the
 * conversation. An unread count is computed per viewer from that viewer's read
 * cursor — see {@link advanceReadCursorRequestSchema} — and a denormalised
 * counter is excluded by the plan outright. A count is additionally a projection
 * in its own right under `S-AUTHZ-READ`
 * [docs/workflows/00-product-overview.md L512], so it carries its own
 * authorization rather than riding along inside someone else's response.
 *
 * **No markup string, no HTML field and no editor state.** A body is the
 * structured document `./content.js` defines and nothing else. `S-CONTENT`
 * requires rich text to be "stored as a structured document of an allowlisted
 * node and mark vocabulary, never as markup to be re-parsed"
 * [docs/workflows/00-product-overview.md L526], and the area's own build
 * obligation gives the reason: the same body is re-rendered in a thread pane, an
 * activity entry, a search result, a saved-for-later list and a forwarded copy
 * [docs/workflows/03-messaging-and-composer.md L716]. This module therefore
 * validates a body against the shared vocabulary **independently of whatever
 * editor produced it**, and imports no editor.
 *
 * **No transcript field.** `S-CONSENT` is explicit that "a speech-derived
 * record is a separate store from the conversation's message history, and is not
 * written into it: conflating the two would silently give speech the message
 * history's search reach, export reach and retention"
 * [docs/workflows/00-product-overview.md L578]. An audio clip is therefore an
 * attachment and a duration, and nothing derived from its contents.
 *
 * ---------------------------------------------------------------------------
 * WHICH CONTRACT OWNS WHAT, SO NOTHING IS IMPLEMENTED TWICE
 * ---------------------------------------------------------------------------
 *
 * `PROJECT_RULE_R5` asks that a contract exist exactly once, and this module is
 * a consumer of five siblings rather than a second definition of any of them:
 *
 *   - the body vocabulary, the mark set, the mention chips, the hyperlink pair
 *     and every text-hygiene rule — `./content.js`
 *   - the person projection an author line and a pinned-by label render, and the
 *     named time zone a scheduled send is interpreted in — `./user.js`
 *   - the keyset request and the paged envelope a history read is composed of —
 *     `./pagination.js`
 *   - the snippet's required-field set and the modal's arriving defaults —
 *     `../config/constants.js`
 *   - the well-formedness check for a client-generated identifier —
 *     `../util/ulid.js`
 *
 * Four further contracts are **cross-referenced and never restated**, because
 * this module's import surface is exactly the five above. `./file.ts` owns the
 * upload contract, the stored-file projection and the ceilings on a stored
 * object; `./channel.ts` owns the channel-event kinds that render as system
 * message rows; `./realtime.ts` carries {@link sendAcknowledgementSchema} in its
 * event union; `./idempotency.ts` owns the key every mutating route accepts.
 * Where one of them is named below it is named as the authority, not copied.
 *
 * **The composer's two rows are two contracts, and the split is visible in how
 * this file is organised.** The nine-control formatting toolbar in five groups
 * produces *marks*, and marks live in `./content.js` — nothing in this module
 * describes formatting. The seven-control bottom action row in three groups
 * produces *operations and payloads*: attachment, audio clip, emoji, mention
 * entry, schedule and snippet, which is exactly the set of operation schemas
 * below [docs/workflows/03-messaging-and-composer.md L748, L749].
 * `PROJECT_RULE_R5` names conflating those two contracts as a defect, so the
 * two never meet in one file.
 *
 * ---------------------------------------------------------------------------
 * HOUSE CONVENTIONS THIS MODULE FOLLOWS
 * ---------------------------------------------------------------------------
 *
 * Five binding project rules govern this work and are cited here by requirement
 * label — `PROJECT_RULE_R1` (authorization is server-side only),
 * `PROJECT_RULE_R2` (corpus and specification handling), `PROJECT_RULE_R3`
 * (uncertainty is never permission to omit), `PROJECT_RULE_R4` (third-party
 * identity exclusion) and `PROJECT_RULE_R5` (a shared contract is implemented
 * exactly once). Their own platform identifiers are deliberately absent from
 * this repository's source: each embeds the third-party product name that
 * `PROJECT_RULE_R4` keeps out of source and comments alike. The labels are
 * permuted relative to those identifiers, so the label is the thing to trust;
 * the authoritative wording lives in the rules interface.
 *
 * A frame is cited by **number alone**. Every one of the 1,022 corpus filenames
 * embeds the prohibited product name, so a citation names the number and never
 * the file. Where the catalog contradicts itself the contradiction is referenced
 * rather than corrected, per `PROJECT_RULE_R2`.
 *
 * Every rejection is a **machine-readable code**. No sentence a person reads
 * appears anywhere in this module: rendered strings are authored for this
 * product and live in `packages/shared/src/copy/en.ts`, which this module does
 * not import. Nothing legible in a frame is transcribed — not a composer hint,
 * not a confirmation line, not a menu label — and no sample person, channel or
 * application name from the corpus appears as a default, an example or a
 * comment. A third-party application is referred to **functionally** and an
 * app-authored message names its app by {@link appIdSchema}, a reference to a
 * record, never by a vendor name.
 *
 * The module is side-effect free, holds no clock and holds no database handle.
 * Two consequences follow and both are stated where they matter: a rule of the
 * form "this instant must be in the future" is enforced by the service that owns
 * the operation, not by a schema; and every uniqueness invariant named below is
 * a database constraint in `packages/db/prisma/schema.prisma`, which is the only
 * place it can be enforced rather than hoped for.
 *
 * `.openapi()` is deliberately absent, and so is the extension that installs it.
 * The specification metadata is attached at registration time in
 * `packages/shared/src/openapi/registry.ts`; the structural reason is that the
 * package barrel re-exports this module into the browser bundle, and a
 * generator-time extension has no business travelling there.
 */
import { z } from 'zod';

import {
  SNIPPET_DEFAULT_TYPE,
  SNIPPET_REQUIRED_FIELDS,
  SNIPPET_SHARE_TO_CONVERSATION_DEFAULT,
} from '../config/constants.js';
import { isValidUlid } from '../util/ulid.js';
import {
  ContentCodeTextSchema,
  ContentDocumentSchema,
  ContentEmojiNameSchema,
  ContentLinkDestinationSchema,
  ContentTextRunSchema,
  MAX_EMOJI_SKIN_TONE,
  MIN_EMOJI_SKIN_TONE,
  MIN_REQUIRED_VALUE_CHARS,
  type ContentDocument,
  type ContentNode,
} from './content.js';
import { pagedEnvelopeSchema, pagedRequestSchema } from './pagination.js';
import { personSummarySchema, timeZoneSchema } from './user.js';

/* ==========================================================================
 * Rejections
 * ========================================================================== */

/**
 * Every rejection this module can produce, as a machine-readable code.
 *
 * Named members rather than a bare array, so a schema names the code it reports
 * instead of repeating a string, and a typo is a compile error rather than a
 * code nothing handles.
 *
 * The set divides into four groups, and the division decides what a caller can
 * do about one. **Shape** rejections say a request is not this contract's shape
 * and a caller can correct it. **Gate** rejections say the request is well
 * formed and the operation refuses it — an empty send, an empty edit, a
 * duplicate emoji name. **State** rejections say the target is not in a state
 * the operation applies to. And **projection** rejections belong to the server:
 * an acknowledgement or an envelope that fails its own contract is a defect in a
 * write or read path rather than anything a caller did, and it belongs in the
 * log and the failing test rather than in a message to a person.
 *
 * No authorization refusal is in this set, deliberately. A denial is raised by
 * the guard in `apps/api/src/authz/` against the acting session and the specific
 * target object, carries its own audit record, and is deliberately not something
 * a shared shape can report: a schema has no session and could not make the
 * decision if it wanted to.
 */
export const MESSAGE_REJECTION = {
  /** Not an object, or carried a field this contract does not define. */
  malformedRequest: 'message_malformed_request',
  /** An opaque record identifier that is not one this contract accepts. */
  messageIdMalformed: 'message_id_malformed',
  /** A conversation reference that is not a well-formed opaque identifier. */
  conversationIdMalformed: 'message_conversation_id_malformed',
  /** An application reference that is not a well-formed opaque identifier. */
  appIdMalformed: 'message_app_id_malformed',
  /** A thread reference that is not a well-formed opaque identifier. */
  threadIdMalformed: 'message_thread_id_malformed',
  /** A stored-file reference that is not a well-formed opaque identifier. */
  fileReferenceMalformed: 'message_file_reference_malformed',
  /**
   * The client-generated identifier is not well formed. Reported by delegating
   * to the one canonical check; this module declares no pattern of its own.
   */
  clientIdMalformed: 'message_client_id_malformed',
  /** A value that must be an absolute instant was not one. */
  instantMalformed: 'message_instant_malformed',
  /** The per-conversation sequence was absent, fractional or below its floor. */
  sequenceMalformed: 'message_sequence_malformed',
  /** Not one of the three message types. */
  typeUnrecognised: 'message_type_unrecognised',
  /** Not one of the observed system-message subtypes. */
  systemSubtypeUnrecognised: 'message_system_subtype_unrecognised',
  /** Not one of the two author badges an application's message may carry. */
  appBadgeUnrecognised: 'message_app_badge_unrecognised',
  /** An emoji reference whose skin-tone selector is not one of the defined tones. */
  skinToneInvalid: 'message_skin_tone_invalid',
  /** A reaction count that is absent, fractional or below its floor. */
  reactionCountInvalid: 'message_reaction_count_invalid',
  /** More reaction chips than one message may carry. */
  tooManyReactions: 'message_too_many_reactions',
  /** More attachments than one message may carry. */
  tooManyAttachments: 'message_too_many_attachments',
  /** A declared clip duration that is absent, fractional or outside its bounds. */
  clipDurationInvalid: 'message_clip_duration_invalid',
  /**
   * A send or a schedule carried neither body content nor an attachment.
   *
   * The gate is **content**, never text: a lone attachment with an empty body is
   * a valid send [docs/workflows/03-messaging-and-composer.md L682, frame 201].
   */
  contentRequired: 'message_content_required',
  /**
   * An edit left the message with no content at all. Emptying a message is a
   * deletion, and a deletion has its own confirmed operation.
   */
  editWouldEmptyMessage: 'message_edit_would_empty_message',
  /** A delete arrived without the explicit confirmation the operation requires. */
  deleteNotConfirmed: 'message_delete_not_confirmed',
  /** A snippet arrived without a field the imported required-field set names. */
  snippetFieldRequired: 'message_snippet_field_required',
  /** A snippet title longer than the bound this contract declares. */
  snippetTitleTooLong: 'message_snippet_title_too_long',
  /** A snippet type hint that is not a well-formed short token. */
  snippetTypeInvalid: 'message_snippet_type_invalid',
  /** A local calendar date that is not a well-formed date. */
  scheduleDateMalformed: 'message_schedule_date_malformed',
  /** A local wall-clock time that is not a well-formed twenty-four-hour time. */
  scheduleTimeMalformed: 'message_schedule_time_malformed',
  /**
   * The zone the local date and time are interpreted in was absent or is not a
   * named zone. A scheduled send that loses its zone fires at the wrong moment,
   * so the field is required rather than defaulted.
   */
  scheduleTimeZoneMalformed: 'message_schedule_time_zone_malformed',
  /** A scheduled-message reference that is not a well-formed opaque identifier. */
  scheduledMessageIdMalformed: 'message_scheduled_id_malformed',
  /**
   * A custom emoji's name is already taken in this workspace.
   *
   * Its own code because the surface reports it inline and distinctly — the
   * conflicting emoji is surfaced for comparison beside the field
   * [docs/workflows/03-messaging-and-composer.md L680, frame 217] — and because
   * uniqueness "across the workspace" [L652, frame 217] is a workspace-wide
   * invariant rather than a shape rule. It is enforced by a uniqueness
   * constraint in `packages/db/prisma/schema.prisma`; this code is how that
   * constraint is reported.
   */
  customEmojiNameTaken: 'message_custom_emoji_name_taken',
  /**
   * A projection or an acknowledgement does not satisfy its own contract.
   * Server-side defect, never a caller's.
   */
  malformedProjection: 'message_malformed_projection',
} as const;

/** Schema for a rejection code, for any surface that transports one. */
export const messageRejectionCodeSchema = z.enum(MESSAGE_REJECTION, {
  error: MESSAGE_REJECTION.malformedRequest,
});

/** The union of every rejection code this module can produce. */
export type MessageRejectionCode = z.infer<typeof messageRejectionCodeSchema>;

/* ==========================================================================
 * Bounds — each declared once, consumed by reference
 * ========================================================================== */

/*
 * `PROJECT_RULE_R3` forbids a bound written at a point of use, whether the
 * number is large or small, so every bound in this module is a named constant
 * reached by reference — including from inside this module.
 *
 * Where a bound has no frame behind it that is said rather than glossed over: a
 * capture shows a surface, and a surface does not show a ceiling it was not
 * pushed against. Each such value is a chosen default with its reasoning stated,
 * which is what the rule asks for where evidence is absent, and the judgement is
 * registered in `docs/decisions/gap-register.md`.
 */

/**
 * Longest opaque record identifier this contract accepts.
 *
 * Sixty-four, matching the ceiling `./user.ts` and `./file.ts` apply to their
 * own opaque identifiers — an identifier is one idea across this package, and a
 * message reference has no reason to be wider than a person reference. Wide
 * enough for every identifier shape a store is likely to issue, narrow enough
 * that an identifier field cannot be used to carry a payload.
 *
 * The *format* is deliberately not pinned beyond the character class below:
 * identifier generation is the database package's contract, and binding this
 * module to one shape would make it wrong the first time that changes.
 */
export const MESSAGE_ID_MAX_LENGTH = 64;

/**
 * Characters permitted in an opaque record identifier.
 *
 * The URL-safe alphabet, excluding the dot and the slash so that an identifier
 * can never be read as a path. The `+` quantifier rejects the empty string,
 * which is why no separate minimum-length bound is needed. It matches the class
 * `./user.ts`, `./workspace.ts` and `./file.ts` each use for the same purpose,
 * because an opaque identifier is one idea and not four.
 *
 * Module-private and carrying no `g` flag: a global expression keeps a mutable
 * index between calls, so a shared one would answer the same question
 * differently depending on what was asked before it.
 */
const OPAQUE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * The lowest per-conversation sequence a stored message may carry.
 *
 * One, not zero, so that "no sequence seen yet" and "the first message" are
 * different values on the client's replay cursor. A client that has seen nothing
 * holds nothing, and a client holding this value has seen the first message.
 */
export const MIN_MESSAGE_SEQUENCE = 1;

/**
 * The most attachments one message may carry.
 *
 * Authored. The corpus shows an attachment tile pending in the composer
 * [docs/workflows/README.md L331, frame 165] and never shows a limit being
 * reached, so `PROJECT_RULE_R3` governs: the mechanism ships with a chosen
 * conventional default rather than being omitted for want of an observed value.
 * Ten is past any message a person composes by hand and low enough that one
 * send cannot be turned into a bulk transfer; the per-file ceilings that
 * actually bound the bytes belong to `./file.ts`.
 */
export const MAX_ATTACHMENTS_PER_MESSAGE = 10;

/**
 * The most distinct reaction chips one message may carry.
 *
 * Authored. The corpus shows several chips side by side
 * [docs/workflows/03-messaging-and-composer.md L652, frame 213] and never shows
 * the row full, so this is a chosen default. It bounds the number of *distinct
 * emoji*, not the number of people reacting: a chip carries a count, so a
 * hundred people reacting with one emoji is one chip.
 */
export const MAX_REACTIONS_PER_MESSAGE = 50;

/**
 * The lowest count a reaction chip may report.
 *
 * One. A chip renders because somebody reacted
 * [docs/workflows/03-messaging-and-composer.md L652, frame 209], so a chip
 * reporting zero is a chip that should not exist — removing the last reaction
 * removes the chip rather than leaving an empty one.
 */
export const MIN_REACTION_COUNT = 1;

/**
 * The lowest reply count a thread summary row may report.
 *
 * One, and a separate constant from the reaction floor above rather than a reuse
 * of it, because the two are different facts that happen to share a number: a
 * summary row exists on a parent message because a thread hangs off it
 * [docs/workflows/README.md L328, frames 225, 226], so a summary reporting no
 * replies is a summary that should not be rendered. Folding the two into one
 * constant would mean a change to either concept silently moved the other.
 */
export const MIN_THREAD_REPLY_COUNT = 1;

/**
 * The most characters a snippet's optional title may carry.
 *
 * Authored, and deliberately far below a body's bound: the field is a title with
 * a default-filename placeholder [docs/workflows/03-messaging-and-composer.md
 * L761, frame 144], so it is a short label rather than prose. Two hundred and
 * fifty-five is the conventional ceiling for a filename-shaped value, which is
 * what this field stands in for when it is left empty.
 */
export const MAX_SNIPPET_TITLE_CHARS = 255;

/**
 * The most characters a snippet's type hint may carry.
 *
 * Authored, and short by construction: the hint selects a highlighting
 * vocabulary at render time and is never a path, a command or anything a
 * renderer could be induced to interpret. The catalog records the select's
 * default as auto-detect [docs/workflows/03-messaging-and-composer.md L761,
 * frame 144] and **never enumerates the concrete types it offers**, so no such
 * list is declared here — `SNIPPET_DEFAULT_TYPE` in `../config/constants.js` is
 * the one identifier this contract knows, and absence is recorded as absence.
 */
export const MAX_SNIPPET_TYPE_CHARS = 32;

/**
 * Characters permitted in a snippet's type hint. Module-private, and the same
 * shape a short opaque token takes everywhere in this package.
 */
const SNIPPET_TYPE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9+#._-]*$/;

/**
 * The shortest declared duration an attached clip may report, in whole seconds.
 *
 * Nought rather than one, because whole seconds are the unit: a clip shorter
 * than a second is a real thing a person can record and it floors to nought.
 * Refusing it would refuse a legitimate recording on an artefact of the unit.
 */
export const MIN_ATTACHED_CLIP_DURATION_SECONDS = 0;

/**
 * The longest declared duration an attached clip may report, in whole seconds.
 *
 * One hour, written as its own arithmetic so the intent is legible. The corpus
 * shows the recorder's elapsed time advancing and never shows it reaching a
 * limit [docs/workflows/03-messaging-and-composer.md L653, frames 200, 201], so
 * `PROJECT_RULE_R3` governs and the mechanism ships with a chosen conventional
 * default.
 *
 * **This bound is on the request, and `./file.ts` owns the bound on the stored
 * object.** The two must not diverge, and the reason they are separately
 * declared rather than shared is that this module's import surface is exactly
 * the five siblings the contract names. The distinction is real rather than
 * cosmetic: the value on the attach payload is **declared by the caller**, so it
 * is bounded here to keep an absurd figure out of a stored record, and the
 * authoritative duration is the one the upload contract derived from the stored
 * object. A server reconciles the two and stores the derived value; it never
 * takes a caller's word for how long a recording is.
 */
export const MAX_ATTACHED_CLIP_DURATION_SECONDS = 60 * 60;

/**
 * A local wall-clock time on the twenty-four-hour clock, to the minute.
 *
 * Module-private, anchored, and with no `g` flag for the reason stated on the
 * identifier pattern above.
 *
 * **The observed half-hourly select is not enforced here, and that is
 * deliberate.** The scheduling dialog's time select offers half-hourly options
 * [docs/workflows/03-messaging-and-composer.md L765, frames 182, 183], but per
 * `PROJECT_RULE_R3` a granularity read off one control is a hypothesis about
 * that control's default rather than an invariant of the contract behind it.
 * Enforcing it would refuse a legitimate minute a quick option or a reschedule
 * could name, so the picker's granularity stays the picker's and this contract
 * accepts any minute.
 */
const LOCAL_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/* ==========================================================================
 * Reference primitives
 *
 * Each is declared once and reused by every shape below, so that a bound or a
 * character class cannot drift between the entity, a projection and a request.
 * Every one of them identifies and nothing more: it discloses nothing and grants
 * nothing, and holding a well-formed one is never evidence of permission to act
 * on the thing it names.
 * ========================================================================== */

/**
 * Builds an opaque-identifier schema that reports one code.
 *
 * One factory, several references — not several implementations. Each reference
 * differs only in the code it reports, and reporting distinctly is the whole
 * point: a caller that sent a malformed conversation reference and a caller that
 * sent a malformed message reference have made different mistakes.
 */
const opaqueReference = (code: MessageRejectionCode): z.ZodString =>
  z
    .string({ error: code })
    .max(MESSAGE_ID_MAX_LENGTH, { error: code })
    .regex(OPAQUE_IDENTIFIER_PATTERN, { error: code });

/**
 * An opaque record identifier naming one message.
 *
 * **This is the server's identifier and it is not
 * {@link clientMessageIdSchema}.** The two are different values with different
 * origins: this one is minted by the server and is the message's primary key,
 * the other is minted by a client before the server has heard of the message at
 * all. Conflating them would make a caller-supplied value a primary key.
 */
export const messageIdSchema = opaqueReference(MESSAGE_REJECTION.messageIdMalformed);

/**
 * An opaque record identifier naming the conversation a message belongs to.
 *
 * A conversation is a channel or a direct message: the catalog models the two as
 * variants of one thing rather than as unrelated surfaces, because a direct
 * message "carries the same bookmark row, header shape, message list and
 * composer" while exposing none of a channel's own observables
 * [docs/workflows/README.md L327]. So one reference serves every destination a
 * message can have — a send, a schedule's destination, a forward's target, a
 * snippet's share target.
 *
 * **Naming a conversation is not being entitled to it.** Every operation below
 * that carries one is authorized server-side against the acting session and that
 * specific conversation before it is accepted, per `S-AUTHZ-OP` and
 * `PROJECT_RULE_R1`; the composer's presence is presentation, and the catalog
 * says so in as many words
 * [docs/workflows/03-messaging-and-composer.md L126, L804].
 */
export const conversationIdSchema = opaqueReference(MESSAGE_REJECTION.conversationIdMalformed);

/**
 * An opaque record identifier naming the application that authored a message.
 *
 * **A reference, never a name.** The author line of an application's message
 * renders "the app's own icon and name followed by a badge"
 * [docs/workflows/03-messaging-and-composer.md L651, frames 120, 206], and both
 * the icon and the name are projections of the app record resolved at read time
 * under `S-AUTHZ-READ`. Neither is a literal here, and neither could be:
 * `PROJECT_RULE_R4` keeps a third-party product or application name out of
 * source, comments, tests and fixtures, so an application is referred to
 * functionally — the built-in assistant app, a cloud-drive app, a poll app, a
 * standup app, a calendar app, a conferencing app — and identified by this
 * value. The app entity itself belongs to a deferred area.
 */
export const appIdSchema = opaqueReference(MESSAGE_REJECTION.appIdMalformed);

/**
 * An opaque record identifier naming a thread.
 *
 * Present so that a message row ships **thread-reply-ready** and a later phase
 * needs no rework: the catalog records "parent-thread reference on a reply, and
 * the reply-summary projection on a parent" as fields of this entity
 * [docs/workflows/README.md L328, frames 225, 226]. Carrying the reference costs
 * nothing now and is what lets the thread surface be added without reshaping
 * every stored message.
 *
 * **The thread surface itself is deliberately not built here.** Threads are a
 * deferred area and own their own contract; this field is a reference into it and
 * not a second definition of it.
 */
export const threadIdSchema = opaqueReference(MESSAGE_REJECTION.threadIdMalformed);

/**
 * An opaque record identifier naming a stored file.
 *
 * A message carries a **reference** to a stored object and never bytes: file
 * bytes are transferred straight to object storage by pre-signed upload, so they
 * never transit this contract. `./file.ts` owns the upload contract, the
 * stored-file projection and every ceiling on a stored object — including the
 * snippet, which the catalog models as a shareable file
 * [docs/workflows/03-messaging-and-composer.md L653, frames 144, 146, 148] — and
 * this value is how a message points at one.
 *
 * Resolving it to something a client can fetch is a separate authorized act that
 * mints a fresh short-lived grant, which is what makes revocation effective
 * under `S-AUTHZ-READ`'s rule that "a link is a projection at resolution time"
 * [docs/workflows/00-product-overview.md L512].
 */
export const attachedFileIdSchema = opaqueReference(MESSAGE_REJECTION.fileReferenceMalformed);

/**
 * An opaque record identifier naming a scheduled message.
 *
 * A scheduled message is not yet a message — it has no per-conversation sequence
 * and no permalink, because neither exists until it is committed — so it is
 * named by its own reference rather than by {@link messageIdSchema}. That is
 * what makes reschedule and cancel addressable at all.
 */
export const scheduledMessageIdSchema = opaqueReference(
  MESSAGE_REJECTION.scheduledMessageIdMalformed,
);

/**
 * The client-generated identifier that makes an optimistic send reconcilable.
 *
 * **The well-formedness check is delegated, and that is the substance of this
 * schema rather than a detail of it.** `isValidUlid` in `../util/ulid.js` is the
 * single canonical check for the monorepo, and this module consumes it rather
 * than declaring a rule of its own. There is deliberately no pattern here, no
 * base32 character class and no length: a second copy of the encoding rule is a
 * copy that can drift from the generator that mints these values, and
 * `PROJECT_RULE_R5`'s single-implementation principle applies to a validation
 * rule exactly as it does to a component. The generator package is not imported
 * either — the dependency stays in the one module that owns it.
 *
 * **Three things this value is not**, each worth stating because a reader might
 * reasonably assume otherwise:
 *
 *   1. **Not an authorization input.** It is caller-supplied data and it confers
 *      nothing. Anyone can mint a well-formed one, so passing this schema says
 *      only that the value has the right shape — never that its bearer may send
 *      into the conversation it accompanies. `PROJECT_RULE_R1` forbids resting
 *      any decision on it, and the guard in `apps/api/src/authz/` decides
 *      independently against the acting session and the target conversation.
 *   2. **Not the server's primary key.** The server keeps its own authoritative
 *      identifier — {@link messageIdSchema} — and treats this value only as the
 *      client's handle on a send it has not yet heard back about.
 *   3. **Not a uniqueness guarantee.** A generator can make a collision
 *      improbable and nothing more, and a client is free to send the same value
 *      twice deliberately — which is exactly what a retry does. Uniqueness of
 *      the **conversation-and-client-identifier** pair is a database constraint
 *      declared in `packages/db/prisma/schema.prisma`, and that constraint is
 *      what turns a duplicate send into one message rather than two.
 *
 * The ordering these identifiers carry is convenient locally and is **not** the
 * conversation's order: two clients whose clocks disagree mint identifiers that
 * sort against each other in an order the server does not honour. The
 * authoritative ordering is {@link messageSequenceSchema}.
 */
export const clientMessageIdSchema = z
  .string({ error: MESSAGE_REJECTION.clientIdMalformed })
  .refine((value) => isValidUlid(value), { error: MESSAGE_REJECTION.clientIdMalformed });

/**
 * An absolute instant, in UTC.
 *
 * **An instant, never a duration, and the schema enforces that structurally.**
 * `z.iso.datetime()` requires a UTC-designated ISO 8601 instant, so a number of
 * seconds, a remaining duration, a bare local time and a bare calendar date
 * cannot parse at all. That is `PROJECT_RULE_R3`'s requirement made
 * unbypassable: a record stores when something happened or when it is due, so a
 * configured default can change later without invalidating a record already
 * stored.
 *
 * Every clock in this module is one of these — sent-at, edited-at, pinned-at,
 * a scheduled delivery, a reminder's due time. Formatting is a rendering
 * decision and belongs nowhere near storage: the same instant renders as a time
 * of day in the message list [docs/workflows/03-messaging-and-composer.md L651,
 * frame 202] and as an absolute date-and-time in the delete preview [L651,
 * frame 255], which is exactly why the stored value is neither of those strings.
 */
export const messageInstantSchema = z.iso.datetime({
  error: MESSAGE_REJECTION.instantMalformed,
});

/**
 * The authoritative per-conversation sequence.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FIELD EXISTS AT ALL
 * ---------------------------------------------------------------------------
 *
 * The publish/subscribe bus this product fans out over is documented as
 * **at-most-once**. That single fact is what this field answers: a transport that
 * may drop a message can never be the source of truth for ordering or for
 * completeness, so a client cannot conclude anything about what it has from what
 * it received. A durable monotonic integer can, because a gap in it is
 * *observable*. The client persists its highest **contiguous** sequence, notices
 * a gap the moment one arrives, replays the missing span over HTTP, and refetches
 * wholesale once the gap exceeds the bounded replay window. Treating this value
 * as advisory would give all of that up.
 *
 * ---------------------------------------------------------------------------
 * HOW IT IS ALLOCATED, AND WHY NOT THE OBVIOUS WAY
 * ---------------------------------------------------------------------------
 *
 * Allocated **inside the same transaction as the message insert**, by locking the
 * conversation's own counter row and incrementing it. Two properties follow, and
 * both are the reason for the design rather than side effects of it: the sequence
 * a commit publishes is the sequence the row actually carries, and a rolled-back
 * insert consumes no sequence.
 *
 * **A native database sequence object is rejected**, and the rejection is
 * deliberate rather than an oversight. A sequence is non-transactional by design:
 * it hands out a value that a rollback does not return, so it leaves gaps. A gap
 * is precisely the signal this field exists to carry, so a source that
 * manufactures gaps of its own makes the signal useless — a client could not tell
 * "a message is missing" from "a transaction rolled back".
 *
 * The invariant is enforced by the database and not by hope: a **uniqueness
 * constraint on the conversation-and-sequence pair** is declared in
 * `packages/db/prisma/schema.prisma`, alongside the composite index on the same
 * tuple that makes the keyset read in {@link messageHistoryRequestSchema} a range
 * scan. Two concurrent sends into one conversation therefore cannot both take a
 * value: one commits and the other is refused and retries.
 *
 * The floor is {@link MIN_MESSAGE_SEQUENCE} rather than zero, so that a client
 * holding no cursor and a client that has seen the first message are
 * distinguishable.
 */
export const messageSequenceSchema = z
  .int({ error: MESSAGE_REJECTION.sequenceMalformed })
  .min(MIN_MESSAGE_SEQUENCE, { error: MESSAGE_REJECTION.sequenceMalformed });

/**
 * A message's canonical address.
 *
 * The copyable permalink the overflow menu offers
 * [docs/workflows/03-messaging-and-composer.md L651, frame 244].
 *
 * **A permalink is a capability-free reference.** Holding one grants nothing:
 * `S-AUTHZ-READ` requires that "any copied, shared or forwarded address is
 * re-authorized when it is followed, against the follower's current
 * authorization for the containing object, so that an address which has escaped
 * its audience grants nothing"
 * [docs/workflows/00-product-overview.md L512]. Revocation is therefore
 * effective, and an address that has outlived the reader's access stops
 * resolving.
 *
 * `S-LINK` is not restated here — it is **consumed**.
 * `ContentLinkDestinationSchema` in `./content.js` is this package's one
 * implementation of the link contract: canonical parse, the two-scheme
 * allowlist, and the bound applied to the canonical form as well as to the
 * input. A second address validator in this module would be the local equivalent
 * `PROJECT_RULE_R5` forbids, and it would be the copy that eventually admitted a
 * scheme the other refused.
 *
 * **A failure here therefore reports in `./content.js`'s own words**, and there
 * is deliberately no permalink code in {@link MESSAGE_REJECTION}. An address's
 * rejections belong to the address contract, and this module has no business
 * restating them under names of its own — the same division `./pagination.ts`
 * draws between an envelope's failures and its items'.
 */
export const messagePermalinkSchema = ContentLinkDestinationSchema;

/* ==========================================================================
 * Emoji and reactions — `E-REACTION`
 * ========================================================================== */

/**
 * A skin-tone selector, bounded by the tones the content vocabulary defines.
 *
 * The bounds are imported rather than restated: five tones are what the Unicode
 * standard defines as modifiers, `./content.js` declares that once for its emoji
 * node, and a second opinion here could disagree with the node a reaction shares
 * its vocabulary with.
 */
const reactionSkinToneSchema = z
  .int({ error: MESSAGE_REJECTION.skinToneInvalid })
  .min(MIN_EMOJI_SKIN_TONE, { error: MESSAGE_REJECTION.skinToneInvalid })
  .max(MAX_EMOJI_SKIN_TONE, { error: MESSAGE_REJECTION.skinToneInvalid });

/**
 * The emoji a reaction is made with: the token that names it, and the tone it
 * was made with.
 *
 * **No glyph and no image data**, which is the same rule `./content.js` applies
 * to an emoji inside a body: a name plus an optional tone is a *choice*, and a
 * glyph would be a *rendering*. Whether a name resolves to a standard emoji or to
 * one of the workspace's own is settled at render time against that workspace's
 * set, which is a projection under `S-AUTHZ-READ` — so there is deliberately no
 * flag saying which. An author asserting it would be asserting something the
 * server has to establish for itself.
 *
 * The name is `ContentEmojiNameSchema` and not a second token rule. That schema
 * already carries the canonical lower-case form uniqueness depends on, the
 * length bound, Unicode normalisation and the refusal of control and
 * bidirectional-formatting characters; the catalog's own definition of a custom
 * emoji is an uploaded image "plus a name that is **also the token typed to use
 * it**" [docs/workflows/03-messaging-and-composer.md L652, frames 216, 217], so
 * the name a reaction carries and the name a body carries are one value with one
 * rule.
 *
 * **The tone here is the occurrence's, not the viewer's.** The corpus records a
 * per-person **default** skin tone [L652, frame 214], and a default is per-viewer
 * state: it lives on that viewer's own preferences record under `S-PERUSER` and
 * is owned by `./preference.ts`. What this shape carries is the tone the reaction
 * was actually made with, which is shared content like the reaction itself. A
 * shared default would let one person's choice change another's reactions.
 */
export const reactionEmojiSchema = z.strictObject(
  {
    /** The token that names the emoji. Also what a person types to use it. */
    name: ContentEmojiNameSchema,
    /**
     * The tone this occurrence was made with, absent where it was made in the
     * unmodified default.
     */
    skinTone: reactionSkinToneSchema.optional(),
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** The emoji a reaction is made with. */
export type ReactionEmoji = z.infer<typeof reactionEmojiSchema>;

/**
 * One reaction chip on a message: an emoji and a count
 * [docs/workflows/03-messaging-and-composer.md L652, frame 209].
 *
 * **The count is a projection, and it is authorized as one.** `S-AUTHZ-READ` is
 * explicit that "a count is a projection" and that a total computed over content
 * the viewer may not read "discloses that the content exists, which is a
 * disclosure even when no body text is shown"
 * [docs/workflows/00-product-overview.md L512]. So this figure is computed inside
 * the authorized query that produced the message, over the authorized set only,
 * and never assembled by a later layer from rows it should not have fetched.
 *
 * **Who reacted is not on this shape.** Whether *this* viewer reacted with this
 * emoji differs per viewer by definition, so it is on
 * {@link viewerMessageStateSchema} and never here. The corpus cannot settle it
 * either way — it is a single authenticated session, so it can only ever show one
 * viewer's own chips — which is exactly the case `S-PERUSER` says to resolve in
 * favour of the per-viewer placement.
 */
export const reactionSchema = z.strictObject(
  {
    /** The emoji the chip renders. */
    emoji: reactionEmojiSchema,
    /**
     * How many people reacted with it. Never zero: removing the last reaction
     * removes the chip rather than leaving an empty one.
     */
    count: z
      .int({ error: MESSAGE_REJECTION.reactionCountInvalid })
      .min(MIN_REACTION_COUNT, { error: MESSAGE_REJECTION.reactionCountInvalid }),
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** One reaction chip on a message. */
export type Reaction = z.infer<typeof reactionSchema>;

/** Every reaction chip a message carries, bounded per message. */
const messageReactionsSchema = z
  .array(reactionSchema, { error: MESSAGE_REJECTION.malformedProjection })
  .max(MAX_REACTIONS_PER_MESSAGE, { error: MESSAGE_REJECTION.tooManyReactions })
  .readonly();

/* ==========================================================================
 * The three message types
 * ========================================================================== */

/**
 * The three kinds of message this product renders in a conversation body.
 *
 * The entity's own field table names exactly these: "message type distinguishing
 * a person's message, a system message rendered in muted type [frame 202] and an
 * application's message [frame 206]"
 * [docs/workflows/03-messaging-and-composer.md L651].
 *
 * Order is the order the catalog states them, so a consumer that maps over this
 * holds no opinion of its own about sequence.
 *
 * A readonly tuple rather than an enum, for the three reasons this package
 * applies to every such set: its members are literal types, so a comparison
 * against one is a compile error on a typo rather than a silent false; it is
 * iterable, so a surface cannot drift from the set; and the schema below is built
 * from it directly, which is what makes the single-definition claim true rather
 * than merely intended.
 */
export const MESSAGE_TYPES = ['person', 'system', 'app'] as const;

/** The kind of a message. */
export const messageTypeSchema = z.enum(MESSAGE_TYPES, {
  error: MESSAGE_REJECTION.typeUnrecognised,
});

/** The kind of a message. */
export type MessageType = z.infer<typeof messageTypeSchema>;

/**
 * The badge an application's author line carries after the app's own name.
 *
 * Two, and the pair is a distinction the build is required to preserve: "a
 * message posted by a workflow renders a workflow badge and a message posted by
 * an app renders an app badge, and the two are distinguishable"
 * [docs/workflows/03-messaging-and-composer.md L759, frames 120, 206].
 *
 * A literal union rather than free text, so a third badge is a member added here
 * rather than a string a renderer has to guess at. The identifiers are authored
 * for this product; the words legible on the badges themselves are a third
 * party's product copy and `PROJECT_RULE_R4` forbids transcribing them, so the
 * label a person reads is authored separately in
 * `packages/shared/src/copy/en.ts`.
 */
export const APP_AUTHOR_BADGES = ['app', 'workflow'] as const;

/** The badge an application's author line carries. */
export const appAuthorBadgeSchema = z.enum(APP_AUTHOR_BADGES, {
  error: MESSAGE_REJECTION.appBadgeUnrecognised,
});

/** The badge an application's author line carries. */
export type AppAuthorBadge = z.infer<typeof appAuthorBadgeSchema>;

/**
 * The author identity of an application's message: which app, and which badge.
 *
 * Two fields and no third. The icon and the name the author line renders
 * [docs/workflows/03-messaging-and-composer.md L651, frames 120, 206] are
 * projections of the app record, resolved at read time under `S-AUTHZ-READ`
 * against the reading session — not values a message carries and not values a
 * caller may assert. A message that carried its own copy of an app's name would
 * keep rendering the old one after the app was renamed, and would let whoever
 * posted it choose what name a reader sees.
 *
 * **App-authored content is not trusted for having arrived from inside the
 * product.** The area's build obligation is explicit that "app-supplied and
 * forwarded content carries the identical contract"
 * [docs/workflows/03-messaging-and-composer.md L716], which is why an
 * application's message below validates its body against exactly the same
 * vocabulary a person's does.
 */
export const appAuthorSchema = z.strictObject(
  {
    /** Which application. See {@link appIdSchema} — a reference, never a name. */
    appId: appIdSchema,
    /** Which badge the author line renders after the app's name. */
    badge: appAuthorBadgeSchema,
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** The author identity of an application's message. */
export type AppAuthor = z.infer<typeof appAuthorSchema>;

/**
 * The subtypes a system message takes.
 *
 * ---------------------------------------------------------------------------
 * THE THREE THE CATALOG OBSERVES, AND WHAT DISTINGUISHES THEM
 * ---------------------------------------------------------------------------
 *
 * The consolidated model records the system subtype "in three distinct forms"
 * [docs/workflows/README.md L328], and the three differ in ways a build must keep
 * apart rather than in ways it may generalise:
 *
 *   - `invitation_accepted` — authored by the *other* person, addressed in the
 *     second person, and carrying **its own notification-suppression link**
 *     [frame 110].
 *   - `joined` — the same avatar-and-name shape, but authored by the *reader*,
 *     worded in the third person, and carrying **no** suppression link
 *     [frame 299]. This one is the reason the pair cannot be folded together: two
 *     rows that look alike differ on who authored them, on grammatical person and
 *     on whether an affordance exists at all.
 *   - `huddle_entry` — rendered with an icon tile in place of an author avatar
 *     and **no author name at all** [frame 301], which is why attribution below
 *     is nullable rather than required.
 *
 * ---------------------------------------------------------------------------
 * THE FOURTH, AND WHY IT CARRIES NO KINDS OF ITS OWN
 * ---------------------------------------------------------------------------
 *
 * `channel_event` is the fourth member, and it exists because a channel's event
 * log renders **in the ordinary message list rather than in a separate audit
 * view**: joins, renames quoting both the previous and the new name, description
 * changes quoting the new text, member additions naming who added whom, archiving
 * and unarchiving [docs/workflows/02-channels.md L456, L805, L1016, frames 79,
 * 100, 134, 138].
 *
 * **The event kinds are deliberately not enumerated here.** They belong to
 * `./channel.ts`, which owns the channel contract, and this member carries a
 * reference to the event record rather than a copy of its kind and its quoted
 * values. Three reasons, and the third is the strongest. Restating the
 * enumeration would be the second definition `PROJECT_RULE_R5` forbids. The
 * quoted prior name must be echoed **verbatim and never normalised**
 * [docs/workflows/02-channels.md L935, L962], so it has to be read from the
 * record that stored it rather than reconstructed beside it — and the catalog
 * records the same rename rendering both hyphenated and unhyphenated, a
 * contradiction it declines to reconcile [docs/workflows/03-messaging-and-composer.md
 * L736] and which is referenced here rather than corrected, per
 * `PROJECT_RULE_R2`. And a system message "is an immutable event record, not a
 * message the acting person authored"
 * [docs/workflows/02-channels.md L860], so the event is the record and the row is
 * its rendering.
 */
export const SYSTEM_MESSAGE_SUBTYPES = [
  'invitation_accepted',
  'joined',
  'huddle_entry',
  'channel_event',
] as const;

/** The subtype of a system message. */
export const systemMessageSubtypeSchema = z.enum(SYSTEM_MESSAGE_SUBTYPES, {
  error: MESSAGE_REJECTION.systemSubtypeUnrecognised,
});

/** The subtype of a system message. */
export type SystemMessageSubtype = z.infer<typeof systemMessageSubtypeSchema>;

/**
 * The subtypes whose row offers a notification-suppression affordance.
 *
 * One member, and the count is the observation rather than an accident of what
 * was captured: the invitation-accepted row carries its own suppression link
 * [docs/workflows/README.md L328, frame 110] and the joined row, in the same
 * shape, carries none [frame 299]. Absence is recorded as absence.
 *
 * Declared here so the fact lives in one place. A surface asks this set whether
 * to render the affordance instead of hard-coding a subtype comparison, and a
 * subtype that later turns out to carry one is a member added here rather than a
 * condition added at a call site.
 *
 * **Whether the affordance is offered and whether this viewer has used it are two
 * different facts.** This set is the first — shared, derived from the subtype.
 * The second is per-viewer: the catalog places "a per-message suppression state,
 * attached to the invitation-accepted system message rather than to the
 * conversation" [docs/workflows/README.md L338, frames 110, 378], so it lives on
 * {@link viewerMessageStateSchema} and nowhere near this constant.
 */
export const SYSTEM_SUBTYPES_WITH_NOTIFICATION_SUPPRESSION = [
  'invitation_accepted',
] as const satisfies readonly SystemMessageSubtype[];

/* ==========================================================================
 * Shared decorations a message carries
 *
 * Every field in this section is identical for every viewer, which is what makes
 * it a field of the message rather than of a relation. The per-viewer set is in
 * its own section further down, and the boundary between the two sections is the
 * `S-PERUSER` test.
 * ========================================================================== */

/**
 * That a message is pinned, and by whom.
 *
 * **Not a boolean, and this is the field most easily under-modelled in the whole
 * contract.** The catalog states it twice and both times says the same thing:
 * "pinned flag, carrying **who pinned it** in the label above the author line"
 * [docs/workflows/03-messaging-and-composer.md L651, frame 249] and "pinned flag
 * with a pinned-by label and a highlighted row"
 * [docs/workflows/README.md L328, frame 249]. The row renders a pin glyph and a
 * pinned-by sentence above the author line [L439, frame 249], so the pinner is
 * data the row needs; a bare boolean cannot render that label, and a build that
 * stored one would have to guess.
 *
 * The pinner is `personSummarySchema` — the same projection the author line
 * renders — so a pinned-by label and an author line are one shape and not two.
 * `./user.ts` owns it, and it is a projection like any other: producing it
 * requires that the reading session be entitled to see that person in this
 * context, decided independently per `S-AUTHZ-READ`.
 *
 * **Pinning is shared state, not per-viewer state**, which is worth stating
 * because so much of what surrounds a message row is not. The tinted row and the
 * label are what *every* member of the conversation sees once a message is
 * pinned — the catalog lists who pinned a message among the shared fields the
 * entity persists [L789, frame 249] — so this is a field of the message and the
 * `S-PERUSER` test is answered "no": two people opening the conversation
 * legitimately see the same pin.
 *
 * The whole object is nullable on a message: absent means unpinned, which is what
 * unpinning restores [L780, frame 250]. Two nullable fields side by side could
 * disagree with each other; one nullable object cannot.
 */
export const messagePinSchema = z.strictObject(
  {
    /** Who pinned it. The projection the pinned-by label above the author line renders. */
    pinnedBy: personSummarySchema,
    /** When it was pinned. An absolute instant; see {@link messageInstantSchema}. */
    pinnedAt: messageInstantSchema,
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** That a message is pinned, and by whom. */
export type MessagePin = z.infer<typeof messagePinSchema>;

/**
 * One attachment on a message: a reference to a stored file, and — where the file
 * is a recorded clip — how long it runs.
 *
 * The catalog records an attachment on this entity [docs/workflows/README.md
 * L328, frame 165] and an attachment tile pending in the composer
 * [L331, frame 165].
 *
 * **A reference and never bytes.** Bytes go straight to object storage by
 * pre-signed upload and never transit this contract; `./file.ts` owns the upload,
 * the stored-file projection, the type allowlist and every byte and dimension
 * ceiling, and none of that is restated here.
 *
 * `durationSeconds` is present because the attached player card renders one: "a
 * filled circular play control at the left, a waveform, and a duration readout at
 * the right" [docs/workflows/03-messaging-and-composer.md L653, frames 200, 201].
 * Of those three the play control is a control and the waveform is derived, so the
 * duration is the only part that needs carrying. It is absent on an attachment
 * that is not timed — a document, an image, a snippet — rather than being nought
 * on one, because nought is a legitimate duration for a very short clip and would
 * otherwise be indistinguishable from "not timed at all".
 *
 * **There is no transcript field and there must never be one.** `S-CONSENT`
 * requires that "a speech-derived record is a separate store from the
 * conversation's message history, and is not written into it: conflating the two
 * would silently give speech the message history's search reach, export reach and
 * retention" [docs/workflows/00-product-overview.md L578].
 */
export const messageAttachmentSchema = z.strictObject(
  {
    /** Which stored file. See {@link attachedFileIdSchema}. */
    fileId: attachedFileIdSchema,
    /**
     * How long the clip runs, in whole seconds. Absent on an attachment that is
     * not a timed recording.
     */
    durationSeconds: z
      .int({ error: MESSAGE_REJECTION.clipDurationInvalid })
      .min(MIN_ATTACHED_CLIP_DURATION_SECONDS, { error: MESSAGE_REJECTION.clipDurationInvalid })
      .max(MAX_ATTACHED_CLIP_DURATION_SECONDS, { error: MESSAGE_REJECTION.clipDurationInvalid })
      .optional(),
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** One attachment on a message. */
export type MessageAttachment = z.infer<typeof messageAttachmentSchema>;

/** Every attachment a message carries, bounded per message. */
const messageAttachmentsSchema = z
  .array(messageAttachmentSchema, { error: MESSAGE_REJECTION.malformedRequest })
  .max(MAX_ATTACHMENTS_PER_MESSAGE, { error: MESSAGE_REJECTION.tooManyAttachments })
  .readonly();

/**
 * The original a forwarded copy quotes, as a reader who may read it sees it.
 *
 * ---------------------------------------------------------------------------
 * THE SUBTLEST AUTHORIZATION CONSEQUENCE IN THIS FILE
 * ---------------------------------------------------------------------------
 *
 * **A forward must not become a way to read a message the viewer could not
 * otherwise see.** The quoted original is a *projection of another message*, and
 * `S-AUTHZ-READ` names "quoted parent excerpts" among the projections it governs
 * and requires every one of them to be "computed **after** applying the viewer's
 * current read authorization to the containing object, and recomputed on every
 * render rather than trusted from a previous one"
 * [docs/workflows/00-product-overview.md L508]. So this shape is filled only
 * after the reading session's authorization for the **source** conversation has
 * been checked — separately from, and in addition to, its authorization for the
 * conversation the forwarded copy was posted into.
 *
 * That is why {@link forwardedCopySchema} carries this as `null` rather than
 * omitting the field. A reader who may see the forward but not its source sees
 * the accompanying text and a suppressed quote, and the type says so out loud
 * instead of leaving a later layer to remember. Filtering after the fact is not
 * authorization: narrowing a response that already carries the quote leaves the
 * data in the response.
 *
 * It is also why {@link forwardMessageRequestSchema} carries a **reference** to
 * the original and never a copy of it. A caller that supplied the quoted body
 * would be supplying content it may never have been entitled to read, and the
 * server would have no way to tell.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS A FLAT SHAPE RATHER THAN A MESSAGE
 * ---------------------------------------------------------------------------
 *
 * A quote is not a message and modelling it as one would make the message union
 * recursive — a forward quoting a forward quoting a forward, unbounded. What a
 * quote renders is what the corpus shows a quote rendering: an author, a time, a
 * body, and the provenance of where it came from
 * [docs/workflows/03-messaging-and-composer.md L438, frame 248]. Nothing else, so
 * nothing else is here: no reactions, no pin, no sequence, no per-viewer state.
 */
export const quotedOriginalSchema = z.strictObject(
  {
    /** Which message is quoted. */
    messageId: messageIdSchema,
    /**
     * Who wrote it. A person for a person's message, an application for an app's,
     * and `null` where the original has no author line of its own — the same
     * three cases the message union itself distinguishes.
     */
    author: z.union([personSummarySchema, appAuthorSchema]).nullable(),
    /** When it was written. */
    sentAt: messageInstantSchema,
    /** Its body, in the one content vocabulary. */
    body: ContentDocumentSchema,
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** The original a forwarded copy quotes. */
export type QuotedOriginal = z.infer<typeof quotedOriginalSchema>;

/**
 * A forwarded copy, in all four of its observed parts.
 *
 * The catalog enumerates them together and a build that implements three of the
 * four has implemented something else: "forwarded copy carrying accompanying
 * text, a quoted original, a provenance line naming the source conversation and a
 * view-conversation link"
 * [docs/workflows/03-messaging-and-composer.md L651, frame 248], rendered as
 * "accompanying text above a quoted copy of the original, and the quote carries a
 * provenance line naming the source conversation and a view-conversation link"
 * [L779, frame 248].
 *
 * Each part, and which field carries it:
 *
 *   1. **Accompanying text** — `note`. Rich rather than plain, because the
 *      forward dialog gives the field "its own reduced set of formatting
 *      controls" [L411, frame 246]. Nullable: the dialog's accompanying-message
 *      field appears only once a recipient is chosen and is never required
 *      [L778, frames 246, 247].
 *   2. **The quoted original** — `sourceMessageId` plus `quoted`. The reference is
 *      the stored fact; the projection is what a reader authorized for the source
 *      actually receives. See {@link quotedOriginalSchema}.
 *   3. **The provenance line** — `sourceConversationId`. A reference, so the name
 *      the line renders is resolved at read time and stays right after a rename;
 *      a stored copy of a conversation's name would keep rendering the old one.
 *   4. **The view-conversation link** — `sourceConversationPermalink`. A
 *      capability-free address, re-authorized on resolution. See
 *      {@link messagePermalinkSchema}.
 *
 * **The forwarded body is not trusted for having come from inside the product.**
 * The area's build obligation says so outright — "app-supplied and forwarded
 * content carries the identical contract and is not trusted for having arrived
 * from inside the product" [L716] — which is why `quoted.body` is validated
 * against the same vocabulary as any other body rather than being passed through.
 */
export const forwardedCopySchema = z.strictObject(
  {
    /** The accompanying text written above the quote, or `null` where none was. */
    note: ContentDocumentSchema.nullable(),
    /** Which message was forwarded. The stored fact behind the quote. */
    sourceMessageId: messageIdSchema,
    /** Which conversation it came from. What the provenance line names. */
    sourceConversationId: conversationIdSchema,
    /** The view-conversation link the quote carries. */
    sourceConversationPermalink: messagePermalinkSchema,
    /**
     * The quoted original as this reader may see it, or `null` where this reader
     * is not authorized for the source conversation.
     *
     * `null` is a suppressed projection and not an error: the forward is still
     * readable, its accompanying text still renders, and the quote does not.
     */
    quoted: quotedOriginalSchema.nullable(),
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** A forwarded copy. */
export type ForwardedCopy = z.infer<typeof forwardedCopySchema>;

/**
 * The reply summary a parent message carries once a thread hangs off it.
 *
 * Present so a message row ships **thread-reply-ready**: the consolidated model
 * records "parent-thread reference on a reply, and the reply-summary projection
 * on a parent — a reply renders inside the thread and nowhere in the conversation
 * body, while the parent gains a summary row the conversation renders"
 * [docs/workflows/README.md L328, frames 225, 226].
 *
 * **A projection, and therefore authorized as one.** The reply count is a count
 * and the participant facepile is a member list, and `S-AUTHZ-READ` names both
 * among the projections that carry their own check
 * [docs/workflows/00-product-overview.md L508, L512]. A facepile is read as pages
 * like any other list, which is why this shape carries the participants a summary
 * row renders and not the whole participant set.
 *
 * **The thread surface is deferred and is not built here.** Its own contract owns
 * the reply list, the reply composer and the also-send row; the two per-viewer
 * facts the catalog places on a viewer-and-thread relation — follow state and the
 * unread reply count [docs/workflows/README.md L365] — are deliberately absent
 * from this shape for the same reason every other per-viewer fact is. What is here
 * is the minimum a conversation row renders, which costs nothing now and is what
 * lets the surface be added without reshaping a stored message.
 */
export const threadReplySummarySchema = z.strictObject(
  {
    /** Which thread hangs off this message. */
    threadId: threadIdSchema,
    /**
     * How many replies it holds. A count, so a projection: computed inside the
     * authorized query over the authorized set only.
     */
    replyCount: z
      .int({ error: MESSAGE_REJECTION.malformedProjection })
      .min(MIN_THREAD_REPLY_COUNT, { error: MESSAGE_REJECTION.malformedProjection }),
    /**
     * When the most recent reply arrived. What the summary row's right-hand
     * timestamp is rendered from.
     */
    lastReplyAt: messageInstantSchema,
    /**
     * The participants the summary row's facepile renders — one avatar per
     * participant. A member list, so a projection, and paged like any other.
     */
    participants: z
      .array(personSummarySchema, { error: MESSAGE_REJECTION.malformedProjection })
      .readonly(),
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** The reply summary a parent message carries. */
export type ThreadReplySummary = z.infer<typeof threadReplySummarySchema>;

/* ==========================================================================
 * The message
 * ========================================================================== */

/**
 * The fields every message carries, whatever its type.
 *
 * Spread into each member of the union below rather than expressed as a base
 * schema the members extend. A discriminated union needs each option to be an
 * object carrying a literal discriminator, and spreading one shape into three
 * keeps that true while stating the common fields exactly once.
 *
 * Read the two fields at the head of this shape together with
 * {@link messageSequenceSchema} and {@link clientMessageIdSchema}: they are the
 * mechanism the module exists for, and everything else here is a shape.
 */
const messageCommonShape = {
  /** The server's own identifier. The message's primary key. */
  id: messageIdSchema,

  /** Which conversation it belongs to. */
  conversationId: conversationIdSchema,

  /**
   * The authoritative per-conversation sequence.
   *
   * Allocated inside the same transaction as the insert, unique on the
   * conversation-and-sequence pair, and the source of truth for ordering and
   * completeness because the bus is at-most-once. See
   * {@link messageSequenceSchema} for the whole argument.
   */
  sequence: messageSequenceSchema,

  /**
   * The identifier the sending client minted, or `null` where no client minted
   * one.
   *
   * `null` is the ordinary case for a message no client sent: a system message is
   * an immutable event record [docs/workflows/02-channels.md L860] and an
   * application's message is posted by an application, so neither has an
   * optimistic render waiting to be reconciled. It is also `null` once a client
   * has no further use for it — the value exists to match an acknowledgement, and
   * a message read back from history has already been matched.
   *
   * It confers nothing and is never an authorization input. See
   * {@link clientMessageIdSchema}.
   */
  clientMessageId: clientMessageIdSchema.nullable(),

  /** When it was sent. Rendered as a time of day in the list [frame 202]. */
  sentAt: messageInstantSchema,

  /** Its canonical address. A capability-free reference [frame 244]. */
  permalink: messagePermalinkSchema,

  /**
   * When it was last edited, or `null` where it never was.
   *
   * **The flag is the presence of this instant, not a second field beside it.**
   * The catalog records an "edited flag, surfaced as a marker appended to the
   * body" [docs/workflows/03-messaging-and-composer.md L651, frame 254], and the
   * marker renders whenever this value is non-null. A boolean carried alongside
   * an instant is two representations of one fact, and the two can disagree — one
   * write that sets the instant and forgets the flag leaves a message edited
   * without a marker, which is precisely the failure a single source of truth
   * prevents. So the flag is derived and the instant is stored.
   */
  editedAt: messageInstantSchema.nullable(),

  /**
   * That it is pinned, and by whom, or `null` where it is not. Never a bare
   * boolean — see {@link messagePinSchema}.
   */
  pin: messagePinSchema.nullable(),

  /** The files it carries. References, never bytes. */
  attachments: messageAttachmentsSchema,

  /**
   * The reaction chips it carries, each an emoji and a count.
   *
   * Each count is a projection computed inside the authorized query. Whether
   * *this* viewer reacted is per-viewer and is on
   * {@link viewerMessageStateSchema}.
   */
  reactions: messageReactionsSchema,

  /**
   * The thread this message is a reply *inside*, or `null` where it is not a
   * reply.
   *
   * Thread-reply-ready, and the surface itself deferred. A reply "renders inside
   * the thread and nowhere in the conversation body"
   * [docs/workflows/README.md L328, frames 225, 226], so this reference is also
   * what a conversation read filters on.
   */
  parentThreadId: threadIdSchema.nullable(),

  /**
   * The reply summary this message carries as a thread's parent, or `null` where
   * no thread hangs off it. A projection — see {@link threadReplySummarySchema}.
   */
  threadReplySummary: threadReplySummarySchema.nullable(),
} as const;

/**
 * A person's message.
 *
 * The ordinary case, and the one the whole composer produces. Its body is the
 * structured document `./content.js` defines, carrying the mark vocabulary the
 * nine-control formatting toolbar produces — bold, italic and inline code
 * [frames 232, 235], bulleted list [frame 141], ordered list [frame 120],
 * blockquote [frame 233], code block [frame 236] — plus emoji [frame 202], mention
 * chips for a channel and for a person [frame 176] and the hyperlink held as a
 * separate display-text and destination pair [frames 239, 241]
 * [docs/workflows/03-messaging-and-composer.md L651].
 *
 * **The marks are not described here and must not be.** They belong to
 * `./content.js`, which is the one place the vocabulary is defined;
 * `PROJECT_RULE_R5` makes a second description of them a defect. What this module
 * owns is the operations and payloads the composer's *bottom action row* produces,
 * which is a different contract with a different grouping.
 *
 * A body may be **empty** on a stored message, and that is not an oversight: the
 * send gate is content rather than text, so a message carrying only an attachment
 * has an empty body [L682, frame 201]. Whether a particular operation may submit
 * an empty body is that operation's rule — `./content.js` says so in as many
 * words — and {@link sendMessageRequestSchema} is where the rule lives.
 */
export const personMessageSchema = z.strictObject(
  {
    ...messageCommonShape,
    /** The discriminator. */
    type: z.literal('person', { error: MESSAGE_REJECTION.typeUnrecognised }),
    /**
     * Who wrote it — display name and avatar on the author line
     * [docs/workflows/03-messaging-and-composer.md L654, frame 202].
     *
     * The projection `./user.ts` owns, and a projection is a read path: its
     * presence in a response is never inferred from the enclosing surface having
     * loaded.
     */
    author: personSummarySchema,
    /** Its body, in the one content vocabulary. */
    body: ContentDocumentSchema,
    /**
     * The forward this message is, or `null` where it is an original.
     *
     * All four observed parts, with the quote authorized independently of the
     * conversation the copy was posted into — see {@link forwardedCopySchema}.
     */
    forwarded: forwardedCopySchema.nullable(),
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** A person's message. */
export type PersonMessage = z.infer<typeof personMessageSchema>;

/**
 * The fields every system message carries, whatever its subtype.
 *
 * `attributedTo` is the field worth reading closely. It is **attribution and not
 * authorship**: the catalog is explicit that "a system message is an immutable
 * event record, not a message the acting person authored", that each row "names
 * the person who caused the event", and that "naming that person is
 * **attribution**, and it is not the same as authorship"
 * [docs/workflows/02-channels.md L860]. So a system message has no author, and the
 * person it names is the person the event happened to or because of.
 *
 * It is nullable because one observed subtype has no name at all: a huddle entry
 * renders "with an icon tile in place of an author avatar and no author name"
 * [docs/workflows/README.md L328, frame 301]. A required field here would force a
 * build to invent an attribution that frame shows is absent.
 */
const systemMessageCommonShape = {
  ...messageCommonShape,
  /** The discriminator shared by every system subtype. */
  type: z.literal('system', { error: MESSAGE_REJECTION.typeUnrecognised }),
  /**
   * The person the row names, or `null` where the row names nobody.
   *
   * Attribution, never authorship. See the note on this shape.
   */
  attributedTo: personSummarySchema.nullable(),
  /**
   * The body the row renders, in muted type
   * [docs/workflows/03-messaging-and-composer.md L651, frame 202].
   *
   * The same content vocabulary as every other body, for two reasons. A system
   * body carries structure a plain string cannot — the suppression link on an
   * invitation-accepted row [frame 110] is a hyperlink, and a rename quotes a
   * stored name that must be echoed verbatim
   * [docs/workflows/02-channels.md L935]. And an immutable record is still
   * untrusted content on the way out: `S-CONTENT` encoding per destination
   * context applies to it exactly as it does to a person's message.
   */
  body: ContentDocumentSchema,
} as const;

/**
 * An invitation-accepted system message.
 *
 * Authored by the other person, addressed in the second person, and the one
 * observed subtype that carries **its own notification-suppression link**
 * [docs/workflows/README.md L328, frame 110].
 *
 * Whether *this* viewer has used that link is per-viewer state and is on
 * {@link viewerMessageStateSchema}: the catalog places "a per-message suppression
 * state, attached to the invitation-accepted system message rather than to the
 * conversation" [docs/workflows/README.md L338, frames 110, 378]. Whether the
 * affordance is offered at all is {@link SYSTEM_SUBTYPES_WITH_NOTIFICATION_SUPPRESSION}.
 */
export const invitationAcceptedSystemMessageSchema = z.strictObject(
  {
    ...systemMessageCommonShape,
    /** The subtype discriminator. */
    subtype: z.literal('invitation_accepted', {
      error: MESSAGE_REJECTION.systemSubtypeUnrecognised,
    }),
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** An invitation-accepted system message. */
export type InvitationAcceptedSystemMessage = z.infer<typeof invitationAcceptedSystemMessageSchema>;

/**
 * A joined system message.
 *
 * The same avatar-and-name shape as the invitation-accepted row, but authored by
 * the *reader*, worded in the third person, and carrying **no** suppression link
 * [docs/workflows/README.md L328, frame 299].
 *
 * **This is why the two are separate members rather than one.** Two rows that look
 * alike differ on who authored them, on grammatical person, and on whether an
 * affordance exists at all — and a build that folded them together would have to
 * decide at render time which of those three it was looking at, from data that no
 * longer said.
 */
export const joinedSystemMessageSchema = z.strictObject(
  {
    ...systemMessageCommonShape,
    /** The subtype discriminator. */
    subtype: z.literal('joined', { error: MESSAGE_REJECTION.systemSubtypeUnrecognised }),
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** A joined system message. */
export type JoinedSystemMessage = z.infer<typeof joinedSystemMessageSchema>;

/**
 * A huddle-entry system message.
 *
 * Rendered "with an icon tile in place of an author avatar and no author name at
 * all" [docs/workflows/README.md L328, frame 301] — which is the reason
 * `attributedTo` is nullable across every system subtype rather than required on
 * two and absent on one.
 *
 * The huddle entity, its live flag, its participants-and-duration line and its
 * join action belong to a deferred area and are referenced rather than modelled
 * here: this member is the row a conversation renders, and the session behind it
 * is another contract's.
 */
export const huddleEntrySystemMessageSchema = z.strictObject(
  {
    ...systemMessageCommonShape,
    /** The subtype discriminator. */
    subtype: z.literal('huddle_entry', { error: MESSAGE_REJECTION.systemSubtypeUnrecognised }),
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** A huddle-entry system message. */
export type HuddleEntrySystemMessage = z.infer<typeof huddleEntrySystemMessageSchema>;

/**
 * A channel-event system message.
 *
 * A channel's event log renders **in the ordinary message list rather than in a
 * separate audit view** [docs/workflows/02-channels.md L456, L1016, frames 79,
 * 100, 134, 138], so a channel event is a row in this union.
 *
 * **It carries a reference to the event record and no kind of its own.** The kinds
 * — joins, renames quoting both the previous and the new name, description changes
 * quoting the new text, member additions naming who added whom, archiving and
 * unarchiving — belong to `./channel.ts`, and restating them here would be the
 * second definition `PROJECT_RULE_R5` forbids. The quoted values are read from the
 * event record for a further reason: a prior name is echoed **verbatim and never
 * normalised** [docs/workflows/02-channels.md L935], and the catalog records the
 * same rename rendering both hyphenated and unhyphenated without reconciling it
 * [docs/workflows/03-messaging-and-composer.md L736] — a contradiction referenced
 * here rather than corrected, per `PROJECT_RULE_R2`.
 */
export const channelEventSystemMessageSchema = z.strictObject(
  {
    ...systemMessageCommonShape,
    /** The subtype discriminator. */
    subtype: z.literal('channel_event', { error: MESSAGE_REJECTION.systemSubtypeUnrecognised }),
    /**
     * Which channel event this row renders.
     *
     * The event's kind and its quoted values live on that record, in
     * `./channel.ts`'s contract. This is the reference, not a copy.
     */
    channelEventId: opaqueReference(MESSAGE_REJECTION.messageIdMalformed),
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** A channel-event system message. */
export type ChannelEventSystemMessage = z.infer<typeof channelEventSystemMessageSchema>;

/**
 * A system message, discriminated on its subtype.
 *
 * A discriminated union rather than one object carrying a subtype enum, so that a
 * member with a field of its own — the channel event's reference — cannot appear
 * on a member that has no use for it, and so a server switching over the subtypes
 * is exhaustive by construction. Adding a subtype then becomes a compile error at
 * every point that handles them rather than a silent gap.
 */
export const systemMessageSchema = z.discriminatedUnion(
  'subtype',
  [
    invitationAcceptedSystemMessageSchema,
    joinedSystemMessageSchema,
    huddleEntrySystemMessageSchema,
    channelEventSystemMessageSchema,
  ],
  { error: MESSAGE_REJECTION.systemSubtypeUnrecognised },
);

/** A system message. */
export type SystemMessage = z.infer<typeof systemMessageSchema>;

/**
 * An application's message.
 *
 * Posted under the app's own author identity with a badge
 * [docs/workflows/03-messaging-and-composer.md L651, L758, frames 120, 206]. The
 * identity is a reference and the badge is a literal from a two-member union — see
 * {@link appAuthorSchema}, and note that no vendor name appears anywhere near
 * either.
 *
 * Its body validates against exactly the same vocabulary a person's does, because
 * "app-supplied and forwarded content carries the identical contract and is not
 * trusted for having arrived from inside the product" [L716].
 */
export const appMessageSchema = z.strictObject(
  {
    ...messageCommonShape,
    /** The discriminator. */
    type: z.literal('app', { error: MESSAGE_REJECTION.typeUnrecognised }),
    /** Which application posted it, and which badge its author line renders. */
    author: appAuthorSchema,
    /** Its body, in the one content vocabulary. */
    body: ContentDocumentSchema,
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** An application's message. */
export type AppMessage = z.infer<typeof appMessageSchema>;

/**
 * A message: a person's, the system's, or an application's.
 *
 * Discriminated on `type`, which is the field the catalog itself uses to
 * distinguish them [docs/workflows/03-messaging-and-composer.md L651]. The system
 * member is itself a discriminated union on `subtype`, so narrowing on `type`
 * reaches a system message and narrowing again on `subtype` reaches the one row
 * shape — two levels, both exhaustive, neither needing a cast.
 *
 * **What differs between the three is the author line and nothing else
 * structural.** A person's message carries a person projection and may be a
 * forward; a system message carries an attribution that may be absent and a
 * subtype; an application's carries an app reference and a badge. Everything else
 * — the identifier, the conversation, the sequence, the client identifier, the
 * timestamps, the permalink, the pin, the attachments, the reactions and the
 * thread fields — is common, which is why {@link messageCommonShape} exists.
 *
 * This is the item schema {@link messageHistoryResponseSchema} pages over.
 */
export const messageSchema = z.discriminatedUnion(
  'type',
  [personMessageSchema, systemMessageSchema, appMessageSchema],
  { error: MESSAGE_REJECTION.typeUnrecognised },
);

/** A message: a person's, the system's, or an application's. */
export type Message = z.infer<typeof messageSchema>;

/* ==========================================================================
 * The content gate — "content, not text"
 * ========================================================================== */

/**
 * Whether one node contributes content.
 *
 * A total function over the node union with an exhaustive switch, so a node type
 * added to the vocabulary is a compile error here rather than a node this
 * predicate quietly ignores. Three groups, and each answer is a judgement about
 * what a person would say is in the composer:
 *
 *   - A text run and a code block carry text, so they contribute when that text
 *     is non-empty. An empty run is how a blank line exists in a structured
 *     document, so it contributes nothing.
 *   - An emoji, a mention of any of the three kinds, and a hyperlink contribute
 *     unconditionally. Each is a thing a person deliberately inserted, and a
 *     message that is one emoji is a message.
 *   - A container contributes when something inside it does. An empty paragraph is
 *     the empty composer, and a list of empty items is the same.
 */
const nodeCarriesContent = (node: ContentNode): boolean => {
  switch (node.type) {
    case 'text':
      return node.text.length >= MIN_REQUIRED_VALUE_CHARS;
    case 'code_block':
      return node.text.length >= MIN_REQUIRED_VALUE_CHARS;
    case 'emoji':
    case 'channel_mention':
    case 'person_mention':
    case 'audience_mention':
    case 'link':
      return true;
    case 'paragraph':
    case 'list_item':
    case 'bulleted_list':
    case 'ordered_list':
    case 'blockquote':
      return node.children.some(nodeCarriesContent);
  }
};

/**
 * Whether a structured document carries any content at all.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS LIVES HERE AND NOT IN THE CONTENT MODULE
 * ---------------------------------------------------------------------------
 *
 * `./content.js` declines to answer this question, deliberately and in writing:
 * an empty document is valid in the vocabulary, and "whether a *particular
 * operation* may submit an empty body is that operation's rule, not the
 * vocabulary's". So the vocabulary is consumed and the operation's rule is
 * written here, which is the division that module asked for rather than a second
 * opinion about content.
 *
 * ---------------------------------------------------------------------------
 * THE RULE IT IMPLEMENTS
 * ---------------------------------------------------------------------------
 *
 * **The send control is disabled by absence of content, not by absence of text.**
 * The catalog establishes it across seven captures: muted on every composer
 * holding only its placeholder [frames 250, 249, 242, 185, 342], and a filled
 * primary with text [frame 232], with a lone slash character [frame 203], **or
 * with an attachment and an empty text input** [frame 201]
 * [docs/workflows/03-messaging-and-composer.md L682, L752]. The inference is
 * stated again at L258: the enabled state "tracks composer content of any kind
 * rather than text alone".
 *
 * Two captures contradict it — an input area holding nothing at all, with no
 * placeholder, above a filled send control [frames 142, 202] — and the catalog
 * records the disagreement in its Inconsistencies table rather than reconciling
 * it, instructing a build to follow "the rule the majority of captures show" and
 * not to cite either as evidence of a muted send [L682, L740]. That instruction is
 * followed here and the contradiction is referenced rather than corrected, per
 * `PROJECT_RULE_R2`.
 *
 * ---------------------------------------------------------------------------
 * WHO CONSUMES IT
 * ---------------------------------------------------------------------------
 *
 * Exported because the same rule has two consumers and must not be written twice:
 * the send and schedule refinements below use it to refuse an empty submission,
 * and the composer's send control derives its enabled state from it. A client that
 * re-implemented the enabled rule would be the second implementation
 * `PROJECT_RULE_R5` forbids, and the two would disagree about the lone-attachment
 * case first.
 *
 * @param document A body already validated against the content vocabulary.
 * @returns True when the document carries text, an emoji, a mention or a link.
 */
export const documentHasContent = (document: ContentDocument): boolean =>
  document.children.some(nodeCarriesContent);

/**
 * Whether a submission carries anything at all: content in its body, or an
 * attachment.
 *
 * The whole of the send gate in one place, so the send refinement and the schedule
 * refinement cannot drift apart. A lone attachment passes; an empty body with no
 * attachment does not.
 */
const submissionHasContent = (submission: {
  readonly body: ContentDocument;
  readonly attachments: readonly MessageAttachment[];
}): boolean => documentHasContent(submission.body) || submission.attachments.length > 0;

/* ==========================================================================
 * Per-viewer state — the relation, and never the message
 * ========================================================================== */

/**
 * What one viewer's state on one message is.
 *
 * ---------------------------------------------------------------------------
 * THE TEST THAT PUT EVERY FIELD HERE
 * ---------------------------------------------------------------------------
 *
 * `S-PERUSER` reduces the placement question to one sentence: "if two people
 * opened this at the same moment, could they legitimately see different values? If
 * yes, the field belongs on a relation keyed by the pair — a membership record, a
 * participation record, a per-viewer state record — and never on the object
 * itself" [docs/workflows/00-product-overview.md L564]. Every field below answers
 * yes, so every field below is here and none of them is on
 * {@link messageSchema}.
 *
 * The relation table names this exact set on its viewer-and-message row: "read and
 * unread state · unread boundary · mark-as-unread · saved-for-later flag ·
 * reminder due time" [docs/workflows/README.md L364], and the area's own build
 * obligation adds the per-message reply-notification state to it
 * [docs/workflows/03-messaging-and-composer.md L724, L807, frame 244].
 *
 * ---------------------------------------------------------------------------
 * WHY IT MATTERS, IN CONCRETE TERMS
 * ---------------------------------------------------------------------------
 *
 * Two things go wrong the moment one of these is stored on the shared record, and
 * the catalog names both: "one person marking something read marks it read for
 * everyone, and a per-viewer flag on a shared object that several people can read
 * is also a disclosure of that person's behaviour to the others"
 * [docs/workflows/00-product-overview.md L566]. A reminder stored on a message
 * fires for everyone; a saved-for-later flag stored on a message saves it for
 * everyone and tells them who saved it.
 *
 * **A single captured session cannot distinguish the two placements**, because one
 * session shows one viewer's values and both models render identically to that
 * viewer [L566]. So the rendering is the observation and the placement is the
 * obligation — which is why this shape is authored from the contract rather than
 * read off a frame.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS NOT HERE
 * ---------------------------------------------------------------------------
 *
 * **No viewer identifier.** The viewer is the acting session, resolved
 * server-side. `PROJECT_RULE_R1` forbids resting a decision on a caller-supplied
 * actor, so no shape in this module — projection or request — carries one. A
 * caller that could name the viewer could read or write another person's state.
 *
 * **No unread count.** A count is computed from the read cursor at read time and
 * is never stored as a denormalised counter; see
 * {@link advanceReadCursorRequestSchema}. It is also a projection in its own right
 * under `S-AUTHZ-READ` [docs/workflows/00-product-overview.md L512], so it carries
 * its own authorization rather than riding inside this shape.
 *
 * **No default skin tone.** The per-person default is a preference on the viewer's
 * own record, owned by `./preference.ts`
 * [docs/workflows/03-messaging-and-composer.md L724, frame 214]. What a *reaction*
 * carries is the tone that occurrence was made with, which is shared content.
 *
 * **No follow state and no unread reply count.** Those are the viewer-and-thread
 * relation's [docs/workflows/README.md L365], and a thread is a different pair.
 */
export const viewerMessageStateSchema = z.strictObject(
  {
    /** Which message this state is about. */
    messageId: messageIdSchema,

    /**
     * When this viewer read it, or `null` where they have not.
     *
     * An instant rather than a boolean, because the same field answers both
     * questions a surface asks — whether it is read, and whether it was read
     * before or after something else happened.
     */
    readAt: messageInstantSchema.nullable(),

    /**
     * Whether the unread boundary rule renders immediately above this message for
     * this viewer.
     *
     * The boundary is "a labelled rule in the accent colour"
     * [docs/workflows/README.md L338, frames 299, 380], rendered "where unread
     * content begins" [docs/workflows/03-messaging-and-composer.md L787,
     * frames 202, 206]. It is per viewer by definition: the boundary sits in a
     * different place for each person in the conversation.
     */
    isUnreadBoundary: z.boolean({ error: MESSAGE_REJECTION.malformedProjection }),

    /**
     * When this viewer marked it unread again, or `null` where they have not.
     *
     * Distinct from `readAt` being null rather than folded into it. Mark-unread is
     * its own action in the overflow menu [frame 244] and it is a deliberate act,
     * so a message that was read and then marked unread is a different state from
     * one never read — and only the former should survive a later automatic read.
     */
    markedUnreadAt: messageInstantSchema.nullable(),

    /**
     * When this viewer saved it for later, or `null` where they have not.
     *
     * Inferred by the catalog from the overflow menu offering save-for-later as a
     * first-group action with its own keyboard shortcut, with the note that "no
     * frame shows the flag rendered on a row, so its visual treatment is not
     * evidenced" [docs/workflows/03-messaging-and-composer.md L658, frame 244].
     * The mechanism ships regardless, per `PROJECT_RULE_R3`; the destination the
     * saved item appears in belongs to a deferred area.
     */
    savedForLaterAt: messageInstantSchema.nullable(),

    /**
     * When this viewer's reminder about it is due, or `null` where there is none.
     *
     * Inferred from the overflow menu offering remind-me-about-this with a submenu
     * chevron, the submenu itself never being opened
     * [docs/workflows/03-messaging-and-composer.md L660, frame 244]. So the
     * options are uncaptured and the mechanism still ships, per
     * `PROJECT_RULE_R3` — an absolute instant, because a duration stored here
     * would have to be re-based every time the configured default changed.
     */
    reminderAt: messageInstantSchema.nullable(),

    /**
     * Whether this viewer has switched off notifications for replies to it.
     *
     * The overflow menu's turn-off-notifications-for-replies row
     * [docs/workflows/03-messaging-and-composer.md L409, L651, frame 244]. Per
     * viewer, and per **message** rather than only per conversation: the catalog
     * places "a per-message suppression state, attached to the
     * invitation-accepted system message rather than to the conversation — so
     * suppression is per message, not only per conversation"
     * [docs/workflows/README.md L338, frames 110, 378].
     */
    replyNotificationsMuted: z.boolean({ error: MESSAGE_REJECTION.malformedProjection }),

    /**
     * The emoji this viewer reacted with, empty where they have not reacted.
     *
     * Authored under the two-viewers test rather than read off a frame, and the
     * corpus is structurally incapable of settling it: it is a single
     * authenticated session, so every reaction chip it shows is one viewer's view
     * of the chip. Two people opening the same message legitimately see the same
     * counts and different own-reaction highlights, so the counts are on
     * {@link reactionSchema} and this is here. Registered as a gap decision in
     * `docs/decisions/gap-register.md`.
     */
    reactedEmoji: z
      .array(reactionEmojiSchema, { error: MESSAGE_REJECTION.malformedProjection })
      .max(MAX_REACTIONS_PER_MESSAGE, { error: MESSAGE_REJECTION.tooManyReactions })
      .readonly(),
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** One viewer's state on one message. */
export type ViewerMessageState = z.infer<typeof viewerMessageStateSchema>;

/* --------------------------------------------------------------------------
 * The per-viewer mutations
 *
 * Every request in this group names the target and nothing else. **None of them
 * carries a viewer identifier**, because the viewer is the acting session — a
 * caller that could name the viewer could write another person's state, which is
 * exactly what `PROJECT_RULE_R1` forbids resting on caller-supplied data.
 * -------------------------------------------------------------------------- */

/**
 * Advance this viewer's read cursor in a conversation.
 *
 * **This is how read state is written, and it is keyed on the sequence rather
 * than on a message.** The cursor is one integer per viewer per conversation, and
 * every unread question is answered from it: what is unread is what sits above it,
 * how many are unread is a count over the same range, and where the unread
 * boundary rule renders is the message immediately after it.
 *
 * **No denormalised unread counter exists anywhere, and that is a requirement
 * rather than a preference.** A stored counter has to be maintained on every send,
 * every read, every delete and every membership change, by every writer, and it is
 * wrong the first time one of them forgets. Deriving it from this cursor cannot
 * drift. A count is also a projection under `S-AUTHZ-READ`
 * [docs/workflows/00-product-overview.md L512], so it is computed inside the
 * authorized query over the authorized set — which a counter stored on a shared
 * record could not be.
 *
 * The cursor is monotonic and the server enforces it: an advance to a lower
 * sequence is a no-op rather than a rewind, so an out-of-order arrival cannot
 * un-read what the viewer has already read. Deliberately un-reading is
 * {@link markMessageUnreadRequestSchema}, which is a different act with a
 * different record.
 */
export const advanceReadCursorRequestSchema = z.strictObject(
  {
    /** Which conversation's cursor. */
    conversationId: conversationIdSchema,
    /**
     * The highest sequence this viewer has read, inclusive.
     *
     * A sequence and not a message identifier, because the cursor answers a range
     * question and a range needs an ordinal. It is the same authoritative sequence
     * {@link messageSequenceSchema} describes.
     */
    throughSequence: messageSequenceSchema,
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Advance this viewer's read cursor. */
export type AdvanceReadCursorRequest = z.infer<typeof advanceReadCursorRequestSchema>;

/**
 * Mark one message unread again for this viewer.
 *
 * The overflow menu's mark-unread row
 * [docs/workflows/03-messaging-and-composer.md L409, frame 244]. A deliberate act
 * rather than a cursor movement, which is why it has its own request and its own
 * instant on the relation: it survives a later automatic read, where a rewound
 * cursor would not.
 */
export const markMessageUnreadRequestSchema = z.strictObject(
  { messageId: messageIdSchema },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Mark one message unread again. */
export type MarkMessageUnreadRequest = z.infer<typeof markMessageUnreadRequestSchema>;

/**
 * Save one message for later, or unsave it, for this viewer.
 *
 * One request with a flag rather than two requests, because the two outcomes are
 * one toggle on one relation and a caller that states the outcome it wants is
 * idempotent by construction — a retry lands on the same value instead of
 * flipping it back.
 *
 * The catalog infers the flag from the overflow menu and records that no frame
 * shows it rendered on a row [docs/workflows/03-messaging-and-composer.md L658,
 * frame 244]. Per `PROJECT_RULE_R3` the mechanism ships anyway; the destination
 * the saved item appears in belongs to a deferred area.
 */
export const setMessageSavedRequestSchema = z.strictObject(
  {
    /** Which message. */
    messageId: messageIdSchema,
    /** The state to leave it in. */
    saved: z.boolean({ error: MESSAGE_REJECTION.malformedRequest }),
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Save one message for later, or unsave it. */
export type SetMessageSavedRequest = z.infer<typeof setMessageSavedRequestSchema>;

/**
 * Switch reply notifications for one message on or off for this viewer.
 *
 * The overflow menu's turn-off-notifications-for-replies row
 * [docs/workflows/03-messaging-and-composer.md L409, frame 244]. Stated as the
 * state to leave it in rather than as a toggle, for the idempotence reason above.
 */
export const setMessageReplyNotificationsRequestSchema = z.strictObject(
  {
    /** Which message. */
    messageId: messageIdSchema,
    /** Whether replies to it should stop notifying this viewer. */
    muted: z.boolean({ error: MESSAGE_REJECTION.malformedRequest }),
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Switch reply notifications for one message on or off. */
export type SetMessageReplyNotificationsRequest = z.infer<
  typeof setMessageReplyNotificationsRequestSchema
>;

/* ==========================================================================
 * A future moment, as a person names one
 * ========================================================================== */

/**
 * A moment in the future, as the interface collects it: a calendar date, a
 * wall-clock time, and **the named zone the pair is interpreted in**.
 *
 * ---------------------------------------------------------------------------
 * WHY THE ZONE IS A FIELD AND NOT AN ASSUMPTION
 * ---------------------------------------------------------------------------
 *
 * The scheduling dialog carries "a line naming the time zone the choice is
 * interpreted in" beside its date and time selects
 * [docs/workflows/03-messaging-and-composer.md L219, L765, frames 179, 185], and
 * the entity's own field table records the scheduled delivery as "a destination
 * conversation plus a date and a time, **interpreted in a time zone the dialog
 * names**" [L651, frames 179, 185]. The interface tells the person which zone it
 * means, so the contract carries which zone it meant.
 *
 * **A bare local time without its zone fires at the wrong moment**, and so does an
 * offset. `./user.ts` states the reason on the schema this field reuses: "an offset
 * is only correct until the zone's rules next change, and a message scheduled
 * across that boundary would fire an hour out" — and names this module as the
 * consumer that interprets a scheduled delivery in it. So the field is required
 * rather than defaulted: a request that omits it is refused, because guessing a
 * zone on a caller's behalf is how a message arrives in the middle of the night.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS STORED, AND WHAT IS KEPT
 * ---------------------------------------------------------------------------
 *
 * This triple is **resolved to an absolute instant** and it is the instant that is
 * stored and fired on — see {@link scheduledMessageSchema}. `PROJECT_RULE_R3`
 * requires a record to hold an absolute timestamp rather than a duration precisely
 * so that a configured default can change without invalidating what is already
 * stored, and the same reasoning makes the resolution happen once, at the moment
 * the person chose, rather than being redone on every read.
 *
 * The triple is nevertheless kept alongside the instant rather than discarded,
 * because it is what the confirmation strip renders back — "the destination and the
 * delivery date and time" [L640, frame 185] — and re-deriving a local rendering from
 * an instant would answer a slightly different question: it would show the reader's
 * zone rather than the zone the author was told the choice meant.
 *
 * **A schema has no clock, so "must be in the future" is not enforced here.** The
 * comparison belongs to the scheduling service, which is the only layer that knows
 * what time it is; a schema that tried would be right at build time and wrong ever
 * after. What the schema does enforce is that the value is a date, a time and a
 * named zone — and `z.iso.date()` bounds the horizon structurally, since a
 * four-digit year is the widest thing it will parse.
 */
export const localMomentSchema = z.strictObject(
  {
    /** The calendar date chosen, as the month grid offers it [frames 180, 181]. */
    localDate: z.iso.date({ error: MESSAGE_REJECTION.scheduleDateMalformed }),
    /**
     * The wall-clock time chosen, on the twenty-four-hour clock.
     *
     * Any minute is accepted. The select observed offers half-hourly options
     * [L765, frames 182, 183], but per `PROJECT_RULE_R3` a granularity read off one
     * control is a hypothesis about that control's default rather than an invariant
     * of the contract behind it — and the two computed quick options in the menu
     * above it [L229, frame 178] name times that control never offered.
     */
    localTime: z
      .string({ error: MESSAGE_REJECTION.scheduleTimeMalformed })
      .regex(LOCAL_TIME_PATTERN, { error: MESSAGE_REJECTION.scheduleTimeMalformed }),
    /**
     * The named zone the date and time are interpreted in.
     *
     * `./user.ts`'s schema, which refuses anything that is not a zone the runtime
     * recognises. Never an offset, and never omitted.
     */
    timeZone: timeZoneSchema,
  },
  { error: MESSAGE_REJECTION.scheduleTimeZoneMalformed },
);

/** A moment in the future, as a person names one. */
export type LocalMoment = z.infer<typeof localMomentSchema>;

/**
 * Set or move this viewer's reminder about one message.
 *
 * The overflow menu's remind-me-about-this row carries a submenu chevron and the
 * submenu is never opened, so "the submenu's own options are not captured in this
 * area" [docs/workflows/03-messaging-and-composer.md L660, frame 244]. Per
 * `PROJECT_RULE_R3` an uncaptured result is an open work item and never permission
 * to skip, so the operation ships: the same local-date, local-time and named-zone
 * triple the scheduling dialog uses, resolved to the absolute instant that lands on
 * the relation as `reminderAt`.
 *
 * Reusing {@link localMomentSchema} rather than inventing a second way to name a
 * future moment is the point. Both surfaces ask a person the same question, and the
 * quick options a submenu would offer are computed from the same triple.
 */
export const setMessageReminderRequestSchema = z.strictObject(
  {
    /** Which message. */
    messageId: messageIdSchema,
    /** When to be reminded, as the person named it. */
    remindAt: localMomentSchema,
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Set or move this viewer's reminder about one message. */
export type SetMessageReminderRequest = z.infer<typeof setMessageReminderRequestSchema>;

/**
 * Clear this viewer's reminder about one message.
 *
 * Its own operation rather than a nullable field on the setter, so that clearing a
 * reminder is an act a caller performs deliberately and cannot perform by omission.
 */
export const clearMessageReminderRequestSchema = z.strictObject(
  { messageId: messageIdSchema },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Clear this viewer's reminder about one message. */
export type ClearMessageReminderRequest = z.infer<typeof clearMessageReminderRequestSchema>;

/* ==========================================================================
 * The operations
 *
 * Eight of them, and every one is a strict object. Strictness is the mechanism
 * behind the absences this module claims rather than a matter of taste: a
 * stripping object would silently discard a caller's `workspaceId` or `authorId`,
 * and a caller whose field is silently discarded concludes that it worked. A
 * strict one rejects the request, so an actor identifier cannot enter this
 * contract by being tolerated at the edge.
 *
 * Every one of them is additionally authorized server-side at the point of
 * execution, against the acting session and the specific target message or
 * conversation, per `S-AUTHZ-OP` and `PROJECT_RULE_R1`. Nothing in a shape below
 * decides anything about permission, and a control the client hid, disabled or
 * never rendered exempts nothing. Each also accepts an idempotency key, whose
 * contract is `./idempotency.ts`'s and is not restated here.
 * ========================================================================== */

/**
 * Send a message into a conversation. Flow `03.2`.
 *
 * ---------------------------------------------------------------------------
 * THE FOUR FIELDS, AND THE ONE THAT IS ABSENT
 * ---------------------------------------------------------------------------
 *
 * A send names **where** it is going, **what** it says, **what it carries**, and
 * **the client's handle on it**. What it does not name is **who is sending it**,
 * and that absence is the enforcement: the author is resolved from the acting
 * session, and a caller-supplied author would be an impersonation vector that
 * `PROJECT_RULE_R1` forbids resting any decision on. There is no workspace
 * identifier either — the workspace is derived from the session by the isolation
 * binding in `apps/api`, below every caller.
 *
 * The catalog is unusually direct about the authorization point: "the composer's
 * presence is not evidence that no authorization is required to post", and "per
 * `S-AUTHZ-OP` the build authorizes the sender for the target conversation
 * **before accepting a send**, whatever the client rendered"
 * [docs/workflows/03-messaging-and-composer.md L126, L804]. The one thing the
 * corpus does evidence is that the conversation must accept new messages, because
 * an archived channel replaces the composer entirely with a read-only bar
 * [L126, frame 134] — a surface tracking writability, not an authorization check.
 *
 * ---------------------------------------------------------------------------
 * THE REFINEMENT: CONTENT, NOT TEXT
 * ---------------------------------------------------------------------------
 *
 * A send must carry **something**, and text is not the test. A body with an
 * attachment and nothing else passes, because that is what the corpus shows the
 * send control enabled on [L682, L752, frame 201]. An empty body with no
 * attachment is refused with {@link MESSAGE_REJECTION.contentRequired}. The rule is
 * {@link documentHasContent}, written once and shared with the schedule below and
 * with the composer's own enabled state.
 *
 * ---------------------------------------------------------------------------
 * A MENTION IN THE BODY GRANTS NOTHING
 * ---------------------------------------------------------------------------
 *
 * A channel-mention or person-mention chip is **content**. Naming a channel does
 * not disclose that it exists, naming a person does not give them access to the
 * conversation, and neither entitles the reader to learn anything about the
 * referent. The notification a mention produces is "a projection that leaves the
 * product" and carries only what the recipient may read, authorized independently
 * on its own path — `S-AUTHZ-READ`
 * [docs/workflows/00-product-overview.md L512]. `./content.js` states the same
 * rule on the chips themselves.
 */
export const sendMessageRequestSchema = z
  .strictObject(
    {
      /** Where it is going. Authorized against the session before it is accepted. */
      conversationId: conversationIdSchema,
      /**
       * The client's handle on this send, so the optimistic row can be reconciled
       * against the acknowledgement. Confers nothing; see
       * {@link clientMessageIdSchema}.
       */
      clientMessageId: clientMessageIdSchema,
      /** What it says, in the one content vocabulary. May be empty if it carries a file. */
      body: ContentDocumentSchema,
      /**
       * What it carries. References to stored files, never bytes, and defaulted to
       * none so the ordinary send is a body alone.
       */
      attachments: messageAttachmentsSchema.default([]),
      /**
       * The thread this is a reply inside, where it is one.
       *
       * Present so the message row ships thread-reply-ready and the deferred
       * thread surface needs no reshaping of this request. A reply "renders inside
       * the thread and nowhere in the conversation body"
       * [docs/workflows/README.md L328, frames 225, 226].
       */
      parentThreadId: threadIdSchema.optional(),
    },
    { error: MESSAGE_REJECTION.malformedRequest },
  )
  .refine(submissionHasContent, { error: MESSAGE_REJECTION.contentRequired });

/** Send a message into a conversation. */
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;

/** Send a message, as a caller writes one before defaults are applied. */
export type SendMessageRequestInput = z.input<typeof sendMessageRequestSchema>;

/**
 * Edit a message. Flow `03.12`.
 *
 * Editing is **inline**: the row is replaced in place by a bordered editable field
 * carrying its own copy of the nine-control formatting toolbar with the rich
 * formatting preserved, and saving appends an edited marker to the body
 * [docs/workflows/03-messaging-and-composer.md L442, L444, L781, frames 252, 253,
 * 254]. The marker is not a field a caller sets — the server records
 * `editedAt` and the marker is that instant's presence.
 *
 * **The new body must carry content.** An edit that empties a message is a
 * deletion, and deletion is a separate, confirmed, irreversible operation; letting
 * an edit do it silently would route a destructive act around the confirmation the
 * interface requires. Refused with
 * {@link MESSAGE_REJECTION.editWouldEmptyMessage}, which is a different code from
 * the send's so that the two surfaces can report differently.
 *
 * The request carries no attachments, because the observed edit surface edits the
 * body: the editable field replaces the body and the action set beside it is
 * "reduced to the formatting toggle and emoji controls only" — no add-attachment
 * control at all [L442, frame 252]. Adding or removing a file is therefore not part
 * of this operation, and no capture suggests it is.
 *
 * Whether the same menu is offered on **another** person's message is not
 * captured — "no frame shows the overflow menu on a message authored by another
 * person, so whether edit and delete are withheld there is not evidenced"
 * [L690] — which changes nothing about this shape and everything about the guard:
 * the policy decides against the acting session and this specific message, and a
 * rendering was never the evidence.
 */
export const editMessageRequestSchema = z
  .strictObject(
    {
      /** Which message. Authorized against the session and this target. */
      messageId: messageIdSchema,
      /** The new body, in the one content vocabulary. */
      body: ContentDocumentSchema,
    },
    { error: MESSAGE_REJECTION.malformedRequest },
  )
  .refine((request) => documentHasContent(request.body), {
    error: MESSAGE_REJECTION.editWouldEmptyMessage,
  });

/** Edit a message. */
export type EditMessageRequest = z.infer<typeof editMessageRequestSchema>;

/**
 * Delete a message. Flow `03.12`.
 *
 * **Irreversible, and the interface says so in its own words.** The confirmation
 * dialog's "one explanatory line states the action cannot be undone", shows a full
 * preview of the message about to be destroyed, and renders its confirming action
 * in the destructive colour with cancel as the secondary
 * [docs/workflows/03-messaging-and-composer.md L683, L782, frame 255].
 *
 * **The confirmation is a required field of the request and not merely a screen.**
 * `confirmed` is `z.literal(true)`, so a request that omits it or sends `false`
 * cannot parse. The surface gates the action, and this makes the gate structural:
 * a client that skipped the dialog — a script, a retry, a mistaken keyboard
 * shortcut — is refused by the contract rather than by whoever remembered to check.
 * A boolean would let `false` through to a handler that had to remember to look.
 *
 * What happens **after** the delete is deliberately unspecified here, because the
 * corpus does not settle it: "no frame shows the message removed from the list, and
 * no frame shows a tombstone, an undo or a post-deletion state"
 * [L447, L690, frame 255]. That is an open work item under `PROJECT_RULE_R3`,
 * recorded in `docs/decisions/gap-register.md`, and it is a rendering decision
 * rather than a change to this shape.
 */
export const deleteMessageRequestSchema = z.strictObject(
  {
    /** Which message. */
    messageId: messageIdSchema,
    /**
     * The explicit confirmation. `true` and nothing else parses, so the
     * irreversibility gate cannot be bypassed by omission.
     */
    confirmed: z.literal(true, { error: MESSAGE_REJECTION.deleteNotConfirmed }),
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Delete a message. Irreversible. */
export type DeleteMessageRequest = z.infer<typeof deleteMessageRequestSchema>;

/**
 * Add a reaction to a message. Flows `03.1` and `03.8`.
 *
 * Reached three ways that all produce this one request: a one-tap shortcut on the
 * hover action bar, the labelled React control, and the add-reaction affordance
 * beside an existing chip — the last two opening the same picker, and the
 * quick-reaction set being "the same short list in both the action bar and the
 * picker's handy-reactions band"
 * [docs/workflows/03-messaging-and-composer.md L768, frames 208, 210, 211]. One
 * operation behind three affordances, because they do one thing.
 *
 * The emoji is a **name and an optional tone**, never a glyph and never an image —
 * see {@link reactionEmojiSchema}. The tone is the tone this reaction is made with;
 * the viewer's default tone is a preference `./preference.ts` owns.
 */
export const addReactionRequestSchema = z.strictObject(
  {
    /** Which message. */
    messageId: messageIdSchema,
    /** Which emoji, and in which tone. */
    emoji: reactionEmojiSchema,
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Add a reaction to a message. */
export type AddReactionRequest = z.infer<typeof addReactionRequestSchema>;

/**
 * Remove this viewer's reaction from a message. Flows `03.1` and `03.8`.
 *
 * The same shape as adding one, and a separate operation rather than a toggle: the
 * two are authorized identically but they are different acts, and naming the act
 * makes a retry idempotent — a repeated removal removes nothing rather than
 * re-adding what it just took away.
 *
 * Removing the last reaction removes the chip rather than leaving one reporting
 * nought; see {@link MIN_REACTION_COUNT}.
 */
export const removeReactionRequestSchema = z.strictObject(
  {
    /** Which message. */
    messageId: messageIdSchema,
    /** Which emoji, and in which tone. */
    emoji: reactionEmojiSchema,
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Remove this viewer's reaction from a message. */
export type RemoveReactionRequest = z.infer<typeof removeReactionRequestSchema>;

/**
 * Add a custom emoji to the workspace. Flow `03.9`.
 *
 * The catalog defines one as an uploaded image "plus a name that is **also the
 * token typed to use it**", with "**name uniqueness enforced across the
 * workspace**, with the conflicting emoji surfaced for comparison"
 * [docs/workflows/03-messaging-and-composer.md L652, frames 216, 217].
 *
 * **The name conflict is the one explicit inline validation the corpus captures in
 * this whole area**, and the catalog says it is the model to follow for any
 * field-level rejection here: the field takes a destructive border, an
 * information-glyph message in the same colour explains the conflict, a preview of
 * the conflicting emoji renders beneath, and the save action is muted — "all four
 * clear together once the name is unique" [L680, L772, frames 217, 218]. That is
 * why {@link MESSAGE_REJECTION.customEmojiNameTaken} is its own code and not folded
 * into a general shape rejection: the surface reports it distinctly, and it needs
 * to know which rejection it received. The uniqueness itself is a database
 * constraint in `packages/db/prisma/schema.prisma`.
 *
 * **This is a workspace-scoped write, not an action any authenticated session may
 * take.** `S-AUTHZ-OP` governs it: "adding an emoji, adding a pack and removing
 * either are workspace-scoped writes authorized against the acting principal, not
 * actions available to any authenticated session because a picker rendered the
 * control" [L720, L803, frame 216]. The upload behind the image is `S-UPLOAD`'s and
 * `./file.ts`'s in full — including the rule that an image format able to carry
 * script is **rejected rather than sanitised in place**, which matters
 * disproportionately here because the result is distributed workspace-wide — and
 * none of it is restated in this module.
 */
export const createCustomEmojiRequestSchema = z.strictObject(
  {
    /**
     * The name, which is also the token a person types to use it. Canonical lower
     * case, because a uniqueness rule over values with several spellings does not
     * hold — `./content.js` owns that rule.
     */
    name: ContentEmojiNameSchema,
    /** The stored image. A reference; the upload is `./file.ts`'s contract. */
    imageFileId: attachedFileIdSchema,
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Add a custom emoji to the workspace. */
export type CreateCustomEmojiRequest = z.infer<typeof createCustomEmojiRequestSchema>;

/**
 * Forward a message into another conversation. Flow `03.11`.
 *
 * Three fields: **where** the copy goes, **which** message is being copied, and the
 * optional **accompanying text** written above the quote. The dialog collects
 * exactly those — a recipient chip, a quoted preview of the message, and an
 * accompanying-message field that appears once a recipient is chosen, with the
 * forward action activating at that point
 * [docs/workflows/03-messaging-and-composer.md L410, L411, L778, frames 245, 246,
 * 247].
 *
 * **The original is a reference and never a copy the caller supplies**, and this is
 * the subtlest authorization consequence in the file. A caller that sent the quoted
 * body would be sending content it may never have been entitled to read, and the
 * server would have no way to tell. So the request names the message, the server
 * re-authorizes the acting session for the **source** conversation before it
 * copies anything, and the quote a *reader* eventually receives is authorized again
 * on every render — separately from that reader's authorization for the destination.
 * See {@link quotedOriginalSchema} and {@link forwardedCopySchema}.
 *
 * The note is rich rather than plain because the field carries "its own reduced set
 * of formatting controls" [L411, frame 246], and it is optional because the dialog
 * never requires it. Unlike a send, a forward with no note and no attachment is
 * complete: the quoted original **is** its content, so there is no content
 * refinement here.
 *
 * No frame shows the forward completing — "the forwarded result is visible at the
 * start of the next flow [frame 248], in a different conversation, so the corpus
 * evidences the outcome but not the transition" [L418]. The outcome is what
 * {@link forwardedCopySchema} models; the transition is an open work item recorded
 * in `docs/decisions/gap-register.md`.
 */
export const forwardMessageRequestSchema = z.strictObject(
  {
    /** Which message to forward. A reference; the body is never supplied by a caller. */
    messageId: messageIdSchema,
    /** Where the copy goes. Authorized against the session before it is accepted. */
    conversationId: conversationIdSchema,
    /** The accompanying text written above the quote, where there is any. */
    note: ContentDocumentSchema.optional(),
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Forward a message into another conversation. */
export type ForwardMessageRequest = z.infer<typeof forwardMessageRequestSchema>;

/**
 * Pin a message to its conversation. Flow `03.12`.
 *
 * The row is then rendered "on a full-width tinted background with a provenance
 * label above the author line — a pin glyph and a pinned-by … sentence"
 * [docs/workflows/03-messaging-and-composer.md L439, L780, frame 249].
 *
 * **The pinner is not a field of this request.** It is the acting session, and the
 * server records it — see {@link messagePinSchema}. A caller-supplied pinner would
 * let anyone attribute a pin to anyone, which is the same impersonation the absent
 * author field on a send closes.
 *
 * The pinned-items surface a pinned message is collected into is never captured —
 * "no frame shows the pinned-items surface … nor the conversation header affordance
 * that would open it" [L447] — an open work item under `PROJECT_RULE_R3` rather than
 * a reason to omit pinning.
 */
export const pinMessageRequestSchema = z.strictObject(
  { messageId: messageIdSchema },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Pin a message to its conversation. */
export type PinMessageRequest = z.infer<typeof pinMessageRequestSchema>;

/**
 * Unpin a message. Flow `03.12`.
 *
 * "The tint and the pinned-by label are gone and the row renders normally"
 * [docs/workflows/03-messaging-and-composer.md L440, L780, frame 250] — which is
 * what makes {@link messagePinSchema} nullable rather than a boolean that has to be
 * remembered to clear.
 *
 * A separate operation rather than a flag on the pin request, so that a retry is
 * idempotent and so that the two acts are separately authorizable: unpinning
 * someone else's pin is a different question from pinning, and the policy layer
 * gets to answer it as one.
 */
export const unpinMessageRequestSchema = z.strictObject(
  { messageId: messageIdSchema },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Unpin a message. */
export type UnpinMessageRequest = z.infer<typeof unpinMessageRequestSchema>;

/* ==========================================================================
 * Scheduled delivery — the whole mechanism, not just the setting
 * ========================================================================== */

/**
 * Schedule a message for later delivery. Flow `03.5`.
 *
 * Reached through the caret half of the split send control: "the paper-plane half
 * sends now, and the caret half opens a scheduling menu" — a menu of two computed
 * quick options and, after a separator, a custom-time option that opens the dialog
 * [docs/workflows/03-messaging-and-composer.md L203, L218, L765, frames 178, 179].
 * All three paths produce this one request, the quick options simply computing the
 * triple the dialog collects.
 *
 * **Building the send control as one button loses scheduled send entirely** — the
 * catalog names that as a gotcha outright [L694, frame 178]. It is a note about the
 * component rather than about this schema, and it is repeated here because the two
 * halves are why this operation exists.
 *
 * The payload is a send plus a moment: the same destination, body, attachments and
 * client identifier, and the local date, time and named zone of
 * {@link localMomentSchema}. The same content refinement applies for the same
 * reason — a scheduled send with nothing in it is a scheduled nothing.
 *
 * The client identifier is carried for the same reason a send carries one: the
 * composer empties immediately and a confirmation strip docks above it
 * [L225, frame 185], so the client has a row to reconcile against the
 * acknowledgement whether the message went now or is going later.
 */
export const scheduleMessageRequestSchema = z
  .strictObject(
    {
      /** Where it will go. Authorized now **and** re-authorized at delivery. */
      conversationId: conversationIdSchema,
      /** The client's handle on it, for the same reason a send carries one. */
      clientMessageId: clientMessageIdSchema,
      /** What it will say. */
      body: ContentDocumentSchema,
      /** What it will carry. */
      attachments: messageAttachmentsSchema.default([]),
      /** When it will be delivered, as the person named it. */
      deliverAt: localMomentSchema,
    },
    { error: MESSAGE_REJECTION.malformedRequest },
  )
  .refine(submissionHasContent, { error: MESSAGE_REJECTION.contentRequired });

/** Schedule a message for later delivery. */
export type ScheduleMessageRequest = z.infer<typeof scheduleMessageRequestSchema>;

/** Schedule a message, as a caller writes one before defaults are applied. */
export type ScheduleMessageRequestInput = z.input<typeof scheduleMessageRequestSchema>;

/**
 * A scheduled message that has not yet been delivered.
 *
 * ---------------------------------------------------------------------------
 * WHY THE INSTANT AND THE TRIPLE ARE BOTH HERE
 * ---------------------------------------------------------------------------
 *
 * `deliverAt` is the **absolute instant** the delivery fires on, resolved once
 * from the local date, time and named zone at the moment the person chose them.
 * `PROJECT_RULE_R3` requires a record to store an absolute timestamp rather than a
 * duration precisely so a configured default can change without invalidating what
 * is already stored, and resolving once rather than on every read means a change to
 * a zone's rules cannot move a delivery that was already agreed.
 *
 * `chosenAt` keeps the triple the person actually chose, and it is not redundant.
 * The confirmation strip renders "the destination and the delivery date and time"
 * back to its author [docs/workflows/03-messaging-and-composer.md L640, L766,
 * frame 185], and re-deriving that from the instant would answer a different
 * question — it would show the *reader's* zone, where the dialog told the author
 * which zone it meant. Keeping both means the rendering matches what was promised
 * and the firing matches what was meant.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT IS NOT YET
 * ---------------------------------------------------------------------------
 *
 * A scheduled message has **no sequence and no permalink**, and their absence is
 * the point rather than an omission: a sequence is allocated inside the transaction
 * that inserts the message, so it does not exist until delivery, and a permalink
 * addresses a message that exists. That is also why it is named by
 * {@link scheduledMessageIdSchema} rather than by {@link messageIdSchema} — a
 * different kind of record needs a different reference, and reschedule and cancel
 * address it.
 *
 * **Delivery re-authorizes.** The acting session was authorized when the schedule
 * was accepted, and it is authorized again when the message is committed: a
 * conversation can be archived, a membership can be withdrawn and a role can change
 * in between. A schedule accepted a week ago is not a grant.
 *
 * The destination surface a person reaches through the strip's see-all link belongs
 * to a deferred area [L227]; this shape is the record that surface lists.
 */
export const scheduledMessageSchema = z.strictObject(
  {
    /** Its own reference. Not a message identifier — it is not a message yet. */
    id: scheduledMessageIdSchema,
    /** Where it will go. */
    conversationId: conversationIdSchema,
    /** What it will say. */
    body: ContentDocumentSchema,
    /** What it will carry. */
    attachments: messageAttachmentsSchema,
    /** When it fires. The absolute instant, resolved once at the moment of choosing. */
    deliverAt: messageInstantSchema,
    /** The local date, time and named zone the author actually chose. */
    chosenAt: localMomentSchema,
    /** When the schedule was created. */
    createdAt: messageInstantSchema,
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** A scheduled message that has not yet been delivered. */
export type ScheduledMessage = z.infer<typeof scheduledMessageSchema>;

/**
 * List this viewer's scheduled messages.
 *
 * Composed over `./pagination.js` rather than restating its traversal fields, which
 * is what that module's own note asks a route with filters of its own to do: the
 * extension keeps the cursor, the page bounds and the strictness in one place, so a
 * scheduled list cannot acquire a second opinion about page size.
 *
 * `conversationId` is optional because the list has two callers. The see-all link
 * beside the confirmation strip reaches a cross-conversation destination
 * [docs/workflows/03-messaging-and-composer.md L225, L227, frame 185], and a
 * conversation's own surface may ask for just its own. Omitting it means every
 * conversation the acting session is authorized for — which is not the same as
 * every conversation, because the isolation binding and the projection guard both
 * still apply.
 *
 * **There is no viewer identifier**, here as everywhere: a scheduled message is
 * its author's, and the author is the session.
 */
export const listScheduledMessagesRequestSchema = pagedRequestSchema.extend({
  /** Narrow to one conversation, or omit for every conversation this session may read. */
  conversationId: conversationIdSchema.optional(),
});

/** List this viewer's scheduled messages. */
export type ListScheduledMessagesRequest = z.infer<typeof listScheduledMessagesRequestSchema>;

/** The paged envelope a scheduled-message list returns. */
export const scheduledMessageListResponseSchema = pagedEnvelopeSchema(scheduledMessageSchema);

/** The paged envelope a scheduled-message list returns. */
export type ScheduledMessageListResponse = z.infer<typeof scheduledMessageListResponseSchema>;

/**
 * Move a scheduled message to a different moment.
 *
 * **A scheduled send that cannot be moved is an incomplete mechanism**, which is
 * why this exists even though the corpus never captures it: the dialog is shown
 * being used once, forward only, and `PROJECT_RULE_R3` makes an uncaptured result an
 * open work item rather than permission to ship half a feature. The judgement is
 * recorded in `docs/decisions/gap-register.md`.
 *
 * The same triple as scheduling, resolved to a fresh absolute instant. The body,
 * the destination and the attachments are untouched: moving a delivery is not
 * editing it, and conflating the two would let a reschedule rewrite content that had
 * already been agreed.
 */
export const rescheduleMessageRequestSchema = z.strictObject(
  {
    /** Which scheduled message. */
    scheduledMessageId: scheduledMessageIdSchema,
    /** The new moment, as the person named it. */
    deliverAt: localMomentSchema,
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Move a scheduled message to a different moment. */
export type RescheduleMessageRequest = z.infer<typeof rescheduleMessageRequestSchema>;

/**
 * Cancel a scheduled message before it is delivered.
 *
 * The other half of the same argument: a scheduled send that cannot be cancelled is
 * an incomplete mechanism, and the corpus captures neither cancelling nor
 * delivering.
 *
 * Cancelling is **not** the irreversible deletion of a message, and the difference
 * is why this request carries no confirmation field where
 * {@link deleteMessageRequestSchema} carries one. Nothing has been said to anybody
 * yet: cancelling withdraws an intention, where deleting destroys something people
 * have read. Requiring a confirmation here would spend a person's attention on a
 * reversible act and cheapen the one place the interface genuinely needs it.
 */
export const cancelScheduledMessageRequestSchema = z.strictObject(
  { scheduledMessageId: scheduledMessageIdSchema },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Cancel a scheduled message before it is delivered. */
export type CancelScheduledMessageRequest = z.infer<typeof cancelScheduledMessageRequestSchema>;

/* ==========================================================================
 * The snippet — where the required-field rule is imported, not restated
 * ========================================================================== */

/**
 * A snippet's content: the line-numbered text the modal's editor holds.
 *
 * `ContentCodeTextSchema` and not a schema of its own. That is the content
 * module's code-block configuration of its one text pipeline — bounded,
 * Unicode-normalised, free of bidirectional formatting, and with the line feed and
 * the tab treated as the content they are rather than as control characters. A
 * snippet is line-numbered text [docs/workflows/03-messaging-and-composer.md L162,
 * L761, frame 148] and a code block "is a container for text, never for execution"
 * [L716], so the two are the same value with the same rule and reusing it is the
 * point.
 */
const snippetContentSchema = ContentCodeTextSchema;

/**
 * A snippet's optional title.
 *
 * Composed over `ContentTextRunSchema` rather than declared from scratch, so the
 * whole text pipeline — the bound on the input, Unicode normalisation, the bound on
 * the normalised form, the refusal of control characters and of bidirectional
 * formatting — is inherited from the one place it is implemented, and only the
 * tighter title bound is added on top. A field the corpus shows carrying a
 * default-filename placeholder [L761, frame 144] is a short label, not prose.
 *
 * The bound **rejects and never truncates**, which `S-CONTENT` requires of every
 * field [docs/workflows/00-product-overview.md L526]: a title quietly shortened is a
 * title its author never wrote and cannot see was changed.
 */
const snippetTitleSchema = ContentTextRunSchema.refine(
  (value) => value.length <= MAX_SNIPPET_TITLE_CHARS,
  { error: MESSAGE_REJECTION.snippetTitleTooLong },
);

/**
 * A snippet's type hint — the highlighting vocabulary its content is rendered in.
 *
 * An opaque short token and nothing more: never a path, never a command, never
 * anything a renderer could be induced to interpret, which the bound and the
 * pattern together guarantee.
 *
 * The default is `SNIPPET_DEFAULT_TYPE`, imported from `../config/constants.js`
 * because the modal's arriving state is a compile-time invariant rather than a
 * literal this schema may hold — the catalog records "a type select defaulting to
 * auto-detect" [docs/workflows/03-messaging-and-composer.md L761, frame 144] and
 * that module's own note names this file as the consumer.
 *
 * **The concrete types the select offers are deliberately not enumerated**, in this
 * module or that one, because the catalog never states them. Absence is recorded as
 * absence: a list invented to look complete would be authored evidence dressed as
 * observed evidence.
 */
const snippetTypeSchema = z
  .string({ error: MESSAGE_REJECTION.snippetTypeInvalid })
  .max(MAX_SNIPPET_TYPE_CHARS, { error: MESSAGE_REJECTION.snippetTypeInvalid })
  .regex(SNIPPET_TYPE_PATTERN, { error: MESSAGE_REJECTION.snippetTypeInvalid })
  .default(SNIPPET_DEFAULT_TYPE);

/**
 * Create a snippet and post it into a conversation. Flow `03.3`.
 *
 * ---------------------------------------------------------------------------
 * THE REQUIRED-FIELD RULE IS IMPORTED, NOT RESTATED
 * ---------------------------------------------------------------------------
 *
 * **`SNIPPET_REQUIRED_FIELDS` decides which field gates the primary action, and
 * this schema derives its behaviour from that constant rather than encoding the
 * decision a second time.** The check below iterates the imported set; adding a
 * member to it makes that field required here with no edit to this file. That is
 * `PROJECT_RULE_R3`'s requirement — a value defined once and consumed by reference
 * — applied to a validation decision rather than to a number.
 *
 * The rule itself, for a reader: **a snippet's content is required and its title is
 * not.** The catalog proves it across three captures — the primary action is muted
 * with an empty editor [frame 144], **stays** muted once only the title is filled
 * [frame 145], and becomes active as soon as the editor holds text [frame 148] —
 * and records that "the title's own label states it is optional"
 * [docs/workflows/03-messaging-and-composer.md L165, L681, L761]. Frame 145 is the
 * load-bearing one: it is what distinguishes "content is required" from "some field
 * is required".
 *
 * **The rule is snippet-scoped and must not be generalised.** The catalog lays that
 * trap deliberately and warns about it: the link dialog in the same area renders its
 * save action as an active filled primary with the destination field **empty**
 * [L688, frame 238] — the opposite behaviour — "so a build must not assume a uniform
 * required-field rule across this area's dialogs". Two dialogs, one area, two gating
 * rules. Reaching for this constant from anywhere but here is the merge
 * `PROJECT_RULE_R5` forbids.
 *
 * ---------------------------------------------------------------------------
 * WHY BOTH FIELDS ARE OPTIONAL IN THE SHAPE
 * ---------------------------------------------------------------------------
 *
 * Declaring `content` as a required property would encode the decision in the shape
 * — exactly what the derivation exists to avoid — so both fields are optional in the
 * shape and the imported set decides which of them a request cannot omit. This is
 * also honest about the input: the modal arrives with both fields empty and its
 * primary action muted, so "may be absent" is literally true of what a caller sends.
 * A request that parses has satisfied every member of `SNIPPET_REQUIRED_FIELDS`,
 * which is what a consumer should read the guarantee from.
 *
 * ---------------------------------------------------------------------------
 * THE REST OF THE MODAL
 * ---------------------------------------------------------------------------
 *
 * The remaining fields are the ones the acceptance criterion enumerates: a type
 * select defaulting to auto-detect, a wrap flag left unticked, an
 * accompanying-message sub-composer, and "a share-to-conversation flag pre-ticked
 * and pre-scoped to the current conversation" [L761, frames 144, 148]. The two
 * arriving defaults come from `../config/constants.js` and are not literals here.
 *
 * **A pre-ticked share flag is a destination, never a consent.** That constant's own
 * note draws the distinction and it is worth carrying: this flag decides where a
 * snippet the person is actively creating gets posted, inside a conversation they
 * already have open. Nothing in this module is ever the evidence for a consent.
 *
 * **A snippet is also a shareable file.** `./file.ts` owns that side of it — the
 * stored object, the byte ceiling, the default filename the title stands in for —
 * and the posted result is a message carrying that file as an attachment, rendering
 * as "the title with a disclosure caret above a bordered, line-numbered,
 * syntax-highlighted block" [L762, frame 149]. None of the upload contract is
 * restated here.
 */
export const createSnippetRequestSchema = z
  .strictObject(
    {
      /**
       * The line-numbered content. Required, per the imported set — and the shape
       * says optional so that the requirement lives in the constant.
       */
      content: snippetContentSchema.optional(),
      /** The optional title, standing in for a default filename when left empty. */
      title: snippetTitleSchema.optional(),
      /** The highlighting vocabulary. Defaults to the modal's arriving value. */
      type: snippetTypeSchema,
      /** Whether long lines wrap. Arrives unticked [frame 144]. */
      wrap: z.boolean({ error: MESSAGE_REJECTION.malformedRequest }).default(false),
      /** The accompanying message written beside the snippet, where there is one. */
      note: ContentDocumentSchema.optional(),
      /**
       * Where the snippet is posted. Present when the share flag is set, absent
       * when it is cleared — so the flag and its scope are one field rather than
       * two that could disagree.
       *
       * The flag arrives set, per `SNIPPET_SHARE_TO_CONVERSATION_DEFAULT`, and the
       * scope it arrives pointing at is the conversation the composer belongs to —
       * resolved per request from the session and the route, which is why no
       * conversation identifier is or could be a compile-time value.
       */
      shareToConversationId: conversationIdSchema.optional(),
    },
    { error: MESSAGE_REJECTION.malformedRequest },
  )
  .check((context) => {
    // The derivation, and the whole reason both fields above are optional. The
    // loop reads the imported set rather than naming a field, so which field gates
    // the primary action is stated in exactly one place — `../config/constants.js`
    // — and a second required field becomes a member added there with no edit
    // here. The correspondence is compiler-enforced in both directions: a member
    // of the set that this shape does not declare fails to index `context.value`,
    // and a field this shape declares but the set does not name is simply
    // optional, which is what "not required" means.
    for (const field of SNIPPET_REQUIRED_FIELDS) {
      const value = context.value[field];
      if (value === undefined || value.length < MIN_REQUIRED_VALUE_CHARS) {
        context.issues.push({
          code: 'custom',
          input: context.value,
          path: [field],
          message: MESSAGE_REJECTION.snippetFieldRequired,
        });
      }
    }
  });

/** Create a snippet and post it into a conversation. */
export type CreateSnippetRequest = z.infer<typeof createSnippetRequestSchema>;

/** Create a snippet, as a caller writes one before defaults are applied. */
export type CreateSnippetRequestInput = z.input<typeof createSnippetRequestSchema>;

/**
 * Whether the snippet modal's share-to-conversation flag arrives set.
 *
 * Re-exported from `../config/constants.js` so that a surface reading this contract
 * finds the arriving state beside the field it governs, without a second constant
 * carrying the value. The invariant stays in the one module that owns it.
 */
export const SNIPPET_SHARE_FLAG_ARRIVES_SET = SNIPPET_SHARE_TO_CONVERSATION_DEFAULT;

/* ==========================================================================
 * The audio clip
 * ========================================================================== */

/**
 * Attach a recorded audio clip to a conversation's draft. Flow `03.6`.
 *
 * The recorder is started from the audio-clip control in the composer's action row,
 * runs as a pill over the input area carrying "a live waveform and a running elapsed
 * time", and confirming turns it into "a player card attached inside the composer's
 * input area — a filled circular play control at the left, a waveform, and a
 * duration readout at the right … from where it is sent like any other message"
 * [docs/workflows/03-messaging-and-composer.md L235, L251, L653, L764, frames 200,
 * 201]. So this operation attaches; {@link sendMessageRequestSchema} sends.
 *
 * **The elapsed time while recording and the duration once attached are different
 * things**, and only the second is a field. The first is a live readout of an
 * ongoing capture — it exists in the recorder and nowhere else — and the third
 * observable, the waveform, is derived from the audio. That is why the payload is a
 * file reference and a duration and not a third field.
 *
 * **The declared duration is not trusted.** It is bounded here to keep an absurd
 * figure out of a stored record, but the authoritative value is the one the upload
 * contract derived from the stored object; a server reconciles the two and stores
 * the derived one. See {@link MAX_ATTACHED_CLIP_DURATION_SECONDS}.
 *
 * ---------------------------------------------------------------------------
 * `S-CONSENT` GOVERNS THE CAPTURE BEHIND THIS
 * ---------------------------------------------------------------------------
 *
 * The contract is narrow and specific, and three of its requirements bear directly
 * on this operation [docs/workflows/00-product-overview.md L578]. A microphone
 * becomes active **only after the person has acted to activate it for that
 * purpose**, never as a side effect of opening a surface, and a persistent
 * indicator renders while it is live — which is what the recorder pill and its own
 * dismiss control are [L684, frame 200]. A sample taken to drive a level meter or
 * preview a device is **used transiently and discarded**, never persisted: a level
 * meter is not a recording, and nothing about one reaches this request. And a
 * capture **deliberately turned into content** acquires an explicit lifecycle — a
 * stated storage scope, encryption at rest, a retention bound, deletion when the
 * draft is discarded, notification to every participant that the record is being
 * made, and a deletion path afterwards. Confirming the recorder is that deliberate
 * act, which is why this is a distinct operation rather than a field on a send.
 *
 * **A speech-derived record is a separate store from message history** and is not
 * written into it: "conflating the two would silently give speech the message
 * history's search reach, export reach and retention" [L578]. So there is no
 * transcript field on this payload, none on {@link messageAttachmentSchema}, and
 * none on a message.
 *
 * No frame shows the clip sent, and none shows the recorder's cancel control being
 * used [L254, frames 201, 202]; the catalog records that the closing capture is
 * "consistent with either sending or discarding" and "settles which" neither way.
 * Both remain open work items under `PROJECT_RULE_R3` — recorded, and not a reason
 * to omit the attach operation that both of them follow from.
 */
export const attachAudioClipRequestSchema = z.strictObject(
  {
    /** Whose draft the clip is attached to. */
    conversationId: conversationIdSchema,
    /** The stored recording. A reference; the upload is `./file.ts`'s contract. */
    fileId: attachedFileIdSchema,
    /**
     * How long it runs, in whole seconds, as the recorder observed it.
     *
     * Caller-declared and therefore advisory: the server reconciles it against the
     * stored object and keeps the derived value.
     */
    durationSeconds: z
      .int({ error: MESSAGE_REJECTION.clipDurationInvalid })
      .min(MIN_ATTACHED_CLIP_DURATION_SECONDS, { error: MESSAGE_REJECTION.clipDurationInvalid })
      .max(MAX_ATTACHED_CLIP_DURATION_SECONDS, { error: MESSAGE_REJECTION.clipDurationInvalid }),
  },
  { error: MESSAGE_REJECTION.malformedRequest },
);

/** Attach a recorded audio clip to a conversation's draft. */
export type AttachAudioClipRequest = z.infer<typeof attachAudioClipRequestSchema>;

/* ==========================================================================
 * Reading history
 * ========================================================================== */

/**
 * Read a page of a conversation's message history.
 *
 * ---------------------------------------------------------------------------
 * KEYED ON THE CONVERSATION-AND-SEQUENCE TUPLE, AND NEVER ON A PAGE NUMBER
 * ---------------------------------------------------------------------------
 *
 * Composed over `./pagination.js` rather than restating its traversal fields, which
 * is what that module asks a route with filters of its own to do. What arrives is an
 * opaque cursor, a page size and a direction; **no page index, no row count to skip
 * and no start ordinal**, because an offset carries a row count and no context. The
 * database would have to fetch and discard everything ahead of it, and any message
 * sent between two requests shifts the window — handing the reader a message it has
 * already seen while hiding another. In a conversation being written to while it is
 * read, which is the normal case here, that is wrong output rather than slow output.
 *
 * The cursor encodes the **conversation-and-sequence** tuple, which is the same
 * tuple the composite index in `packages/db/prisma/schema.prisma` is declared on, so
 * a page is a range scan rather than a scan and a discard. That is the property the
 * million-message benchmark exists to demonstrate.
 *
 * History is read **backward** — newest first, from wherever the reader stopped —
 * and it is the one surface that says so explicitly. `./pagination.js` defaults to
 * forward because that is the direction of the key and the right reading for
 * channels, members and bookmarks; the surface with the unusual requirement declares
 * it rather than every ordinary surface correcting a default chosen for this one.
 *
 * ---------------------------------------------------------------------------
 * A WELL-FORMED CURSOR IS NOT EVIDENCE OF PERMISSION
 * ---------------------------------------------------------------------------
 *
 * Anyone can mint a well-formed cursor naming any conversation, because any short
 * string is a syntactically valid identifier. So the conversation identifier inside
 * a cursor is an untrusted echo, and `resolveKeysetPosition` in `./pagination.js`
 * refuses a cursor that decodes cleanly and names a conversation other than the one
 * the read path authorized — which is the obligation `PROJECT_RULE_R1` places on
 * every paged read, discharged in one place instead of once per route. The
 * conversation named in this request is authorized against the acting session
 * independently, and the isolation binding in `apps/api` injects the workspace
 * predicate below the query so that no page can cross a workspace.
 */
export const messageHistoryRequestSchema = pagedRequestSchema.extend({
  /** Whose history. Authorized against the acting session before any row is read. */
  conversationId: conversationIdSchema,
});

/** Read a page of a conversation's message history. */
export type MessageHistoryRequest = z.infer<typeof messageHistoryRequestSchema>;

/** A history read, as a caller writes one before defaults are applied. */
export type MessageHistoryRequestInput = z.input<typeof messageHistoryRequestSchema>;

/**
 * The page a history read returns.
 *
 * The one envelope shape every paged read in this product uses, over
 * {@link messageSchema} as its item. Three members and no fourth: the messages, the
 * cursor for the page after this one, and whether another page exists.
 *
 * **There is no total count**, and the omission is enforced by the envelope being
 * strict rather than left to discipline. Counting the messages behind a keyset read
 * means a second traversal the index cannot answer as a range scan, on every page,
 * which reintroduces the cost the traversal exists to avoid — and a count is a
 * projection in its own right under `S-AUTHZ-READ`, so it would need its own
 * authorization rather than riding inside this response.
 *
 * A message that fails reports in **its own** words, at the path the envelope gives
 * it, because a message's rejections belong to the message contract.
 */
export const messageHistoryResponseSchema = pagedEnvelopeSchema(messageSchema);

/** The page a history read returns. */
export type MessageHistoryResponse = z.infer<typeof messageHistoryResponseSchema>;

/* ==========================================================================
 * The acknowledgement — where optimistic send is reconciled
 * ========================================================================== */

/**
 * What a committed send tells the client that sent it.
 *
 * ---------------------------------------------------------------------------
 * ONE SHAPE, TWO TRANSPORTS, AND WHY THAT MATTERS
 * ---------------------------------------------------------------------------
 *
 * **This is the same shape the realtime event union carries**, and keeping it one
 * shape is a correctness requirement rather than a tidiness preference. A client
 * renders a message optimistically the moment a person sends it, and then learns the
 * authoritative facts by whichever route arrives first — the HTTP response to its own
 * request, or the socket event fanned out to every subscriber including itself. If
 * the two shapes diverged, reconciliation would succeed on one path and fail on the
 * other, and the failure would look like a duplicated or a stuck message rather than
 * like a contract mismatch. `./realtime.ts` therefore composes this schema instead of
 * declaring an acknowledgement of its own, and the event contract that governs the
 * socket side is recorded in `docs/decisions/realtime-contract.md`.
 *
 * ---------------------------------------------------------------------------
 * THE FOUR FACTS, AND WHAT THE CLIENT DOES WITH EACH
 * ---------------------------------------------------------------------------
 *
 *   - `clientMessageId` — which optimistic row this is about. The only field the
 *     client supplied, echoed back so the match is a lookup rather than a guess.
 *   - `messageId` — the authoritative identifier, which replaces the client's handle
 *     on the reconciled row. Every later operation names the message by this.
 *   - `sequence` — the authoritative position. The client folds it into its highest
 *     **contiguous** sequence, and a gap between that and this value is what
 *     triggers a replay over HTTP. See {@link messageSequenceSchema}.
 *   - `sentAt` — the server's instant, which replaces whatever the client rendered
 *     optimistically. A client's clock is not trusted anywhere in this system, so an
 *     optimistic row shows a provisional time and this is the real one.
 *
 * `conversationId` is carried alongside them because a client holds one socket for
 * every conversation it is subscribed to, and an acknowledgement has to find its way
 * back to the right list without the receiver inferring it.
 *
 * ---------------------------------------------------------------------------
 * WHY A DUPLICATE ACKNOWLEDGEMENT IS HARMLESS
 * ---------------------------------------------------------------------------
 *
 * Two sends into one conversation cannot produce a duplicate or an out-of-order
 * render, and that follows from the fields rather than from care at the call site.
 * The sequence is allocated by the server inside the insert transaction and is unique
 * on the conversation-and-sequence pair, so ordering is total and gapless whatever
 * order the acknowledgements arrive in. The client identifier is unique on the
 * conversation-and-client-identifier pair, so a retried send resolves to the *same*
 * message and its acknowledgement carries the *same* sequence — reconciling twice
 * lands on the same row rather than adding a second one. And because the bus is
 * at-most-once, a client that receives nothing at all is not stuck: the gap in its
 * contiguous sequence is observable, and it replays.
 */
export const sendAcknowledgementSchema = z.strictObject(
  {
    /** Which optimistic row this acknowledgement is about. */
    clientMessageId: clientMessageIdSchema,
    /** The authoritative identifier the row takes on. */
    messageId: messageIdSchema,
    /** Which conversation it landed in. */
    conversationId: conversationIdSchema,
    /** The authoritative position. Folded into the client's contiguous cursor. */
    sequence: messageSequenceSchema,
    /** The server's instant, replacing the client's provisional one. */
    sentAt: messageInstantSchema,
  },
  { error: MESSAGE_REJECTION.malformedProjection },
);

/** What a committed send tells the client that sent it. */
export type SendAcknowledgement = z.infer<typeof sendAcknowledgementSchema>;
