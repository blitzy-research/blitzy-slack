/**
 * The channel contract: `E-CHANNEL`, its per-member relation, and every channel
 * operation.
 *
 * ===========================================================================
 * WHAT THIS MODULE DECIDES, AND WHY IT DECIDES IT HERE
 * ===========================================================================
 *
 * One decision dominates this file: **which of the values the channel surface
 * renders belong to the channel, and which belong to the pair of a channel and
 * a member.** `docs/workflows/02-channels.md` L807 marks six of its own field
 * rows as per-viewer state and states the reason the marking was necessary — a
 * single captured session "cannot tell where they are stored", because a value
 * that differs per member and a value shared by the channel render identically
 * to the one viewer who was captured.
 *
 * `docs/workflows/README.md` L357 calls that placement "the single most
 * consequential correction" in the consolidated model and gives the reason it is
 * a security rule rather than a modelling preference. Stored on the shared
 * record, one person muting a channel mutes it for everyone and one person
 * starring it moves it in everyone's sidebar; and every such flag additionally
 * discloses that person's behaviour to every other member of the channel
 * (`02-channels.md` L809). `S-PERUSER` (`docs/workflows/00-product-overview.md`
 * L490) supplies the test, and it is the whole rule: IF TWO PEOPLE OPENED THIS
 * AT THE SAME MOMENT, COULD THEY LEGITIMATELY SEE DIFFERENT VALUES? If yes, the
 * value belongs on the relation.
 *
 * So `channelSchema` below carries shared fields ONLY, and
 * `channelMembershipSchema` carries the six marked rows, keyed by the pair. The
 * relation is `README.md` L363's conversation-membership row, and `./user.ts`
 * L959 names this module as its home. Getting this wrong is not a modelling
 * nicety, which is why the two schemas are separated by construction rather than
 * by convention.
 *
 * ONE ROW LOOKS LIKE A PREFERENCE AND IS NOT. The auto-add-on-join flag stays a
 * field of the channel. Its own legend names it as administered rather than
 * personal, so `02-channels.md` L811 excludes it from that set explicitly. See
 * the field's note below, which is placed there because moving it onto the
 * relation is the natural mistake.
 *
 * A NOTE ON THE RELATION COUNT, RECORDED RATHER THAN RESOLVED. The relation
 * table at `README.md` L363-L372 contains TEN rows while the requirement ledger
 * states ELEVEN. Both readings stand and neither is asserted over the other
 * here. The discrepancy is recorded in `docs/decisions/catalog-defects.md` and
 * `docs/decisions/data-model.md`; per `PROJECT_RULE_R2` a defect in the
 * read-only catalogue is recorded rather than corrected in place, so neither
 * those records nor the catalogue is edited to make the two agree. What is not
 * in doubt is the rule itself, and `README.md` L374 settles precedence where the
 * entity table and the relation table appear to disagree about a per-viewer
 * fact: the relation table governs.
 *
 * ===========================================================================
 * NOTHING HERE IS AN AUTHORIZATION INPUT
 * ===========================================================================
 *
 * Per `PROJECT_RULE_R1` and `S-AUTHZ-OP` (`00-product-overview.md` L483),
 * client rendering is never evidence of permission: every operation below is
 * authorized server-side at the point of execution, against the acting session
 * and the specific target channel, and a control the client rendered enabled
 * exempts nothing. `02-channels.md` L1039 carries that as a criterion over this
 * exact operation set, and L952 notes that the corpus renders every one of these
 * controls enabled with no permission notice attached.
 *
 * TWO CONSEQUENCES ARE VISIBLE IN THE SHAPES THEMSELVES, and both are enforcement
 * rather than economy.
 *
 *   - NO REQUEST DECLARES A WORKSPACE. A workspace identifier appears on no
 *     schema in this module. The workspace is derived server-side from the
 *     session, and the isolation predicate is injected below every caller by the
 *     client extension at `packages/db/src/tenancy.ts` — so a handler cannot
 *     read from the wire what the wire does not carry.
 *   - NO REQUEST DECLARES THE ACTING PRINCIPAL. A mutation that changes the
 *     acting viewer's own membership names the channel and nothing else; a
 *     mutation that changes ANOTHER person's membership names that person as its
 *     target. The two shapes are kept visibly distinct below for that reason:
 *     a target is an operand, and an actor would be a claim.
 *
 * Every object is strict, which is the mechanism behind both paragraphs rather
 * than a matter of taste. A stripping object would silently discard an
 * unrecognised field, and a caller whose input is silently discarded concludes
 * that it worked; a strict one rejects the request, so neither a workspace nor an
 * actor nor a numbered page position can enter this contract by being tolerated
 * at the edge.
 *
 * PROJECTIONS ARE READ PATHS AND ARE AUTHORIZED INDEPENDENTLY, per `S-AUTHZ-READ`
 * (`00-product-overview.md` L484) and `02-channels.md` L954. The browse filter
 * and the compact summary defined here are each a projection, as is a member
 * count, a facepile, a member list, an autocomplete row and a mention chip
 * resolved from a channel. `02-channels.md` L954 names where an unscoped
 * implementation leaks: the browser's channel-type filter includes a private
 * option, so a private channel a viewer may not read must be absent from the
 * browser, from every count, from every facet and from every search result.
 * Accordingly **no schema here offers a field by which a caller could widen its
 * own scope** — there is no include-private, no all-workspaces and no
 * act-as-another-person. Enforcement lives in
 * `apps/api/src/authz/projection-guard.ts` and is tested in
 * `apps/api/test/integration/projections/**`.
 *
 * ===========================================================================
 * WHAT THIS MODULE DELIBERATELY DOES NOT DECLARE
 * ===========================================================================
 *
 * VALUES IT DOES NOT RESTATE. The channel-name ceiling, floor and character rule,
 * the visibility pair and its pre-selected default are imported from
 * `../config/constants.ts` and never written out here. They are invariants rather
 * than configurable defaults, which is why they live in that module and not in
 * `../config/env.ts`, and `constants.ts` L223 names this module as the consumer
 * that must derive its visibility enumeration from the tuple rather than repeat
 * its members. Per `PROJECT_RULE_R3` a literal at a point of use is a defect
 * whether the literal is large or small.
 *
 * TEXT VOCABULARY IT DOES NOT REDECLARE. Rich text is `./content.ts`'s document,
 * a hyperlink destination is that module's `S-LINK` destination, and a hyperlink
 * label is that module's label — which its own note names the channel bookmark as
 * the reuse case for. A person is `./user.ts`'s summary projection. Traversal is
 * `./pagination.ts`'s keyset request, extended rather than restated as that
 * module's L397 prescribes. Each of those is one contract with one
 * implementation, per `PROJECT_RULE_R5`.
 *
 * COPY. No string a person reads appears in this module. Dialog wording, helper
 * sentences, notice text and empty-state prose are authored microcopy and live in
 * `packages/shared/src/copy/en.ts`, which this module does not import. Every code
 * below is a machine-readable token, never a sentence, and no product copy
 * legible in a frame is transcribed anywhere in this file per
 * `PROJECT_RULE_R4`. Frames are cited by NUMBER alone, never by filename,
 * for the reason `PROJECT_RULE_R4` gives.
 *
 * ---------------------------------------------------------------------------
 * HOW THE PROJECT RULES ARE CITED BELOW, AND WHY NOT BY THEIR OWN IDENTIFIERS
 * ---------------------------------------------------------------------------
 *
 * Five binding project rules govern this work. They are cited by requirement label:
 *
 *   `PROJECT_RULE_R1` — authorization is server-side only
 *   `PROJECT_RULE_R2` — corpus and specification handling
 *   `PROJECT_RULE_R3` — uncertainty is never permission to omit
 *   `PROJECT_RULE_R4` — third-party identity exclusion
 *   `PROJECT_RULE_R5` — a shared contract is implemented exactly once
 *
 * Their own identifiers are deliberately NOT written anywhere in this file, because
 * every one of them embeds the third-party product name that R4 forbids from
 * appearing in source or in comments — so writing them would put the build's own
 * brand guard in the position of failing on the file that cites the rule it
 * enforces. This is the convention every module in this package already follows, and
 * a downstream reader should not "restore" them. Two warnings for whoever maps them
 * back: the identifiers are PERMUTED relative to the order the rules are delivered
 * in, so the label is the thing to trust and an ordinal is not; and the labels are a
 * citation shorthand rather than a paraphrase — the authoritative wording lives in
 * the rules interface.
 *
 * @packageDocumentation
 */

import { z } from 'zod';

import {
  CHANNEL_NAME_MAX_LENGTH,
  CHANNEL_NAME_MIN_LENGTH,
  CHANNEL_NAME_PATTERN,
  CHANNEL_VISIBILITIES,
  DEFAULT_CHANNEL_VISIBILITY,
  type ChannelVisibility,
} from '../config/constants.js';
import {
  ContentChannelMentionNodeSchema,
  ContentDocumentSchema,
  ContentLinkDestinationSchema,
  ContentLinkLabelSchema,
  ContentSearchTermSchema,
  ContentTextNodeSchema,
  ContentTextRunSchema,
  MIN_REQUIRED_VALUE_CHARS,
} from './content.js';
import { pagedRequestSchema } from './pagination.js';
import { personIdSchema, personSummarySchema } from './user.js';

/* ===========================================================================
 * Rejection codes
 *
 * One closed vocabulary for everything this module can refuse, so a surface
 * branches on a token rather than parsing a sentence. A code names WHAT was
 * refused and never why a principal was refused: an authorization decision is
 * reported by the guard that made it, not by a schema.
 *
 * Codes produced by the modules this one composes — the content vocabulary's
 * document, label and destination rejections in particular — arrive under their
 * own names and are not mirrored here. Mirroring them would give one refusal two
 * spellings, and the second spelling is the one that drifts.
 * =========================================================================== */

/** Every rejection this module can produce. */
export const CHANNEL_REJECTION_CODES = [
  /** A channel identifier was absent, over-long or not an opaque token. */
  'CHANNEL_ID_MALFORMED',
  /** A bookmark identifier was absent, over-long or not an opaque token. */
  'CHANNEL_BOOKMARK_ID_MALFORMED',
  /** A bookmark-folder identifier was absent, over-long or not an opaque token. */
  'CHANNEL_BOOKMARK_FOLDER_ID_MALFORMED',
  /** A sidebar-section identifier was absent, over-long or not an opaque token. */
  'CHANNEL_SIDEBAR_SECTION_ID_MALFORMED',
  /** A channel-event identifier was absent, over-long or not an opaque token. */
  'CHANNEL_EVENT_ID_MALFORMED',
  /** A name was empty, and a name is required. */
  'CHANNEL_NAME_REQUIRED',
  /** A name exceeded the imported ceiling. Rejected, never truncated. */
  'CHANNEL_NAME_TOO_LONG',
  /** A name carried a character the imported rule does not admit. */
  'CHANNEL_NAME_ILLEGAL_CHARACTER',
  /** A visibility outside the imported pair. */
  'CHANNEL_VISIBILITY_INVALID',
  /** A topic exceeded its bound. Rejected, never truncated. */
  'CHANNEL_TOPIC_TOO_LONG',
  /** A purpose carried more inline nodes than one purpose line may hold. */
  'CHANNEL_PURPOSE_TOO_LONG',
  /** A purpose carried a node outside the two the purpose line admits. */
  'CHANNEL_PURPOSE_NODE_NOT_ALLOWED',
  /** A bookmark-folder name was empty, and a folder name is required. */
  'CHANNEL_BOOKMARK_FOLDER_NAME_REQUIRED',
  /** A bookmark-folder name exceeded its bound. Rejected, never truncated. */
  'CHANNEL_BOOKMARK_FOLDER_NAME_TOO_LONG',
  /** A bookmark glyph was not a functional icon identifier. */
  'CHANNEL_BOOKMARK_GLYPH_INVALID',
  /** More bookmarks than one channel may hold. */
  'CHANNEL_BOOKMARKS_TOO_MANY',
  /** More bookmark folders than one channel may hold. */
  'CHANNEL_BOOKMARK_FOLDERS_TOO_MANY',
  /** A notification scope outside the three the setting offers. */
  'CHANNEL_NOTIFICATION_SCOPE_INVALID',
  /** A per-device override named a device class the setting does not cover. */
  'CHANNEL_DEVICE_CLASS_INVALID',
  /** A sidebar placement outside the three groups a row may sit in. */
  'CHANNEL_SIDEBAR_PLACEMENT_INVALID',
  /** A channel type outside the four the browser filters on. */
  'CHANNEL_TYPE_INVALID',
  /** A conversation type outside the two variants of one conversation. */
  'CONVERSATION_TYPE_INVALID',
  /** A browse scope outside the three the scope filter offers. */
  'CHANNEL_BROWSE_SCOPE_INVALID',
  /** A browse sort outside the six the sort control offers. */
  'CHANNEL_BROWSE_SORT_INVALID',
  /** An event kind outside the six the event history renders. */
  'CHANNEL_EVENT_KIND_INVALID',
  /** A member selection was empty, or larger than one request may carry. */
  'CHANNEL_MEMBER_SELECTION_INVALID',
  /** A member count was negative, and a count cannot be. */
  'CHANNEL_MEMBER_COUNT_INVALID',
  /** A facepile carried more entries than the bounded preview may hold. */
  'CHANNEL_FACEPILE_TOO_LARGE',
  /** An add-members branch named neither the whole workspace nor a person set. */
  'CHANNEL_ADD_MEMBERS_MODE_INVALID',
  /** A destructive deletion arrived without its required acknowledgement. */
  'CHANNEL_DELETE_ACKNOWLEDGEMENT_REQUIRED',
  /** A partial update named no field to change, so it would change nothing. */
  'CHANNEL_UPDATE_EMPTY',
  /** A lifecycle state outside the three a channel can be in. */
  'CHANNEL_LIFECYCLE_INVALID',
  /** A value that must be an absolute instant was a date, a duration or neither. */
  'CHANNEL_INSTANT_INVALID',
  /** The request was not an object, or carried a field the shape does not declare. */
  'CHANNEL_REQUEST_MALFORMED',
] as const;

/** A rejection this module can produce. */
export const channelRejectionCodeSchema = z.enum(CHANNEL_REJECTION_CODES, {
  error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode,
});

/** A rejection this module can produce. */
export type ChannelRejectionCode = (typeof CHANNEL_REJECTION_CODES)[number];

/* ===========================================================================
 * Named bounds
 *
 * `S-CONTENT` (`00-product-overview.md` L486) requires every free-text value to
 * carry a named bound that is REJECTED on breach rather than used to truncate,
 * and `PROJECT_RULE_R3` forbids a literal at a point of use. So every bound
 * this module applies is named here and consumed by reference below.
 *
 * The channel name's own bounds are NOT among them. They are imported invariants,
 * and restating one under a local name would be the same defect as writing the
 * number — a second definition that drifts the first time the first one changes.
 *
 * WHERE A BOUND IS AUTHORED RATHER THAN OBSERVED, it is marked as such. The
 * corpus renders a topic row, a purpose line and a bookmark bar; it renders no
 * character counter on any of them and no limit anywhere except on the channel
 * name. Per `PROJECT_RULE_R3` an absent value is never permission to leave a
 * field unbounded — an unbounded stored value is a denial-of-service surface and
 * an unbounded list is a projection that grows without limit — so each bound
 * below is the smallest coherent choice consistent with what the surface renders,
 * and each is registered with its reasoning in `docs/decisions/gap-register.md`.
 * =========================================================================== */

/**
 * The greatest length of an opaque identifier this module accepts.
 *
 * `02-channels.md` L788 evidences the channel's own identifier as "an opaque
 * token rendered on the details modal's footer line beside a copy control,
 * present on the archived variant too" (frames 81, 136). Opaque is the whole of
 * it: the token identifies and discloses nothing, a caller may return one but may
 * never construct one, and nothing in the product parses its contents.
 *
 * One bound for every identifier kind here rather than one per kind, because they
 * are all the same thing — a server-minted opaque token — and a kind whose bound
 * genuinely differed would get its own constant instead of widening this one.
 * Matched to the person identifier's bound in `./user.ts` so that one store can
 * mint every reference in this product under one rule.
 */
export const CHANNEL_OPAQUE_ID_MAX_LENGTH = 64;

/**
 * The greatest length of a channel topic.
 *
 * AUTHORED, NOT OBSERVED. `02-channels.md` L783 records the topic as "an optional
 * single value whose empty state renders as a placeholder-styled prompt, with its
 * own inline Edit control" (frames 81, 104), and L108 records that no frame shows
 * the topic editor or a populated topic at all — the journey is a partial capture.
 * So the corpus states that a topic exists and states nothing about its length.
 *
 * The choice is a single rendered line's worth of text: the value renders on one
 * row of a modal beside an Edit control, so a bound that permits a paragraph
 * would permit a value the surface cannot render. Larger than a channel name
 * because a topic is prose rather than an identifier, and far smaller than a
 * description because a description is the multi-line field and this one is not.
 */
export const CHANNEL_TOPIC_MAX_LENGTH = 250;

/**
 * The most inline nodes one purpose line may carry.
 *
 * AUTHORED, NOT OBSERVED, and bounded in nodes rather than in characters because
 * the purpose is not plain text: `02-channels.md` L800 records it as "a short line
 * rendered on a browser row beside the member count, able to contain a
 * channel-mention chip" (frames 125, 133), and frame 133 renders that chip on an
 * archived row. A value that mixes text runs with chips is a sequence of inline
 * nodes, and its own character payload is already bounded by the text run's
 * imported bound in `./content.ts`.
 *
 * The choice is what a single browser row can render: a short line alternating
 * text and chips reaches this ceiling long after it has stopped fitting, so the
 * bound refuses abuse without constraining use.
 */
export const CHANNEL_PURPOSE_MAX_INLINE_NODES = 40;

/**
 * The greatest length of a bookmark-folder name.
 *
 * AUTHORED, NOT OBSERVED. `02-channels.md` L794 records a folder as a named
 * container "rendered as a chip with a caret whose menu lists the contained
 * entries or an empty state" (frames 263, 265, 266), and no frame carries a
 * counter or a stated limit. The value renders inside a chip on one bar, so the
 * bound is a chip's worth of label rather than a line's.
 *
 * Deliberately NOT the hyperlink label's bound, even though a bookmark's own name
 * uses that contract. A folder is not a link and has no destination for a label to
 * misrepresent, so borrowing the label's bound would assert a relationship between
 * the two that does not exist.
 */
export const CHANNEL_BOOKMARK_FOLDER_NAME_MAX_LENGTH = 120;

/**
 * The greatest length of a bookmark's functional glyph identifier.
 *
 * The glyph is chosen from "a leading glyph-picker control with a caret"
 * (`02-channels.md` L482, frame 259). What this field holds is the NAME OF A
 * FUNCTION — the identifier a first-party icon registry resolves to artwork — and
 * never artwork, never a mark and never a reference to either. Per
 * `PROJECT_RULE_R4` no third-party icon artwork is traced, extracted or
 * reconstructed anywhere in this product, and a field that carried an image would
 * be the first step towards one that did.
 */
export const CHANNEL_BOOKMARK_GLYPH_MAX_LENGTH = 64;

/**
 * The most bookmarks one channel may hold.
 *
 * AUTHORED, NOT OBSERVED. The bar renders "a chip with a link glyph and the
 * bookmark's name, followed by a compact add control" (`02-channels.md` L484,
 * frame 261) and no capture shows more than a few. A stored list has to be
 * bounded whatever the corpus shows, because this list is returned by a read path
 * on every conversation open.
 */
export const CHANNEL_BOOKMARKS_MAX = 100;

/**
 * The most bookmark folders one channel may hold.
 *
 * AUTHORED, NOT OBSERVED, for the reason above. Fewer than the bookmark ceiling
 * because a folder is a container for bookmarks: a channel with more folders than
 * bookmarks has organised nothing.
 */
export const CHANNEL_BOOKMARK_FOLDERS_MAX = 25;

/**
 * The most people one add-members request may name.
 *
 * AUTHORED, NOT OBSERVED. `02-channels.md` L988 evidences recipients rendering "as
 * removable chips inside the field" (frames 64, 75) and states no ceiling, and the
 * modal's other branch adds the whole workspace as a single unit — which is
 * precisely why this bound does not have to be large. A caller wanting everyone
 * asks for everyone by name of the branch rather than by enumerating a workspace,
 * so this ceiling bounds a hand-assembled selection and nothing else.
 */
export const CHANNEL_ADD_MEMBERS_MAX = 200;

/**
 * The most entries a facepile projection may carry.
 *
 * AUTHORED, NOT OBSERVED, and load-bearing rather than decorative. The header
 * renders "a facepile plus a numeric count" (`02-channels.md` L786, frames 82,
 * 106, 120), and the specification names a five-hundred-member facepile as an
 * explicit edge case. `./user.ts` notes that its summary shape is six short
 * scalars precisely so that many of them may be returned at once — but a channel
 * read that shipped the whole roster would still be shipping the roster.
 *
 * So the count is authoritative and the facepile is a BOUNDED PREVIEW of it. A
 * surface renders as many faces as it has room for and then renders the count; the
 * full roster is the members tab's own paged projection, authorized on its own
 * terms. This is what keeps a five-hundred-member channel from making every
 * channel read a five-hundred-record read.
 */
export const CHANNEL_FACEPILE_MAX = 24;

/* ===========================================================================
 * Shared value pipelines
 *
 * The three helpers below are private on purpose. Each composes a contract
 * declared elsewhere; none is a new contract, and exporting one would invite a
 * consumer to build a fourth text rule out of it.
 * =========================================================================== */

/**
 * An absolute instant.
 *
 * `z.iso.datetime()` admits a UTC-designated ISO 8601 instant and nothing else, so
 * a number of days, a remaining duration and a bare calendar date cannot parse at
 * all. That is `PROJECT_RULE_R3`'s requirement made unbypassable rather than
 * merely documented: a record stores the instant an event happened, so a
 * configured duration can change later without invalidating anything already
 * stored, and any elapsed-time phrasing a surface renders is derived from the
 * stored instant at render time.
 *
 * Private, and matching the convention its siblings use rather than exporting a
 * second name for it — the package barrel flattens these modules into one
 * namespace, and one concept arriving under two exported names is how a consumer
 * comes to believe there are two concepts.
 */
const absoluteInstant = z.iso.datetime({
  error: 'CHANNEL_INSTANT_INVALID' satisfies ChannelRejectionCode,
});

/**
 * The characters an opaque identifier may be composed of.
 *
 * The unreserved set, so a token needs no escaping in any position the product
 * puts one. Anchored, so a test answers a question about a whole value rather than
 * about a fragment of one; and carrying no `g` flag, so a shared instance cannot
 * give different answers to the same question depending on what was asked before
 * it.
 */
const OPAQUE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * An opaque, server-minted identifier.
 *
 * Bounded and shaped, because a value that is never parsed still has to be
 * refused when it is obviously not one of ours: an over-long or oddly-shaped token
 * is a probe, and refusing it at the edge costs a comparison. The shape admits the
 * unreserved token characters and nothing else, so an identifier is safe to place
 * in a path segment, a query value, a header and a cache key without escaping —
 * which is the property that makes it usable as a reference everywhere.
 *
 * The refusal code is the caller's, so each identifier kind reports its own name
 * rather than a shared one a surface would have to disambiguate.
 */
const opaqueIdentifier = (malformedCode: ChannelRejectionCode) =>
  z
    .string({ error: malformedCode })
    .min(MIN_REQUIRED_VALUE_CHARS, { error: malformedCode })
    .max(CHANNEL_OPAQUE_ID_MAX_LENGTH, { error: malformedCode })
    .regex(OPAQUE_IDENTIFIER_PATTERN, { error: malformedCode });

/**
 * A bounded single-line free-text value, on the shared content pipeline.
 *
 * This composes `ContentTextRunSchema` rather than re-implementing what it does,
 * which is the point of the function. That schema is the one free-text pipeline in
 * this product: it bounds the input, normalises it to the single canonical Unicode
 * form everything is stored in, re-bounds the normalised form so normalisation
 * cannot carry a value past its limit, then refuses control characters and the
 * bidirectional embeddings, overrides and isolates that reorder the text around
 * them. Re-declaring any of that here would be a second implementation of one
 * `S-CONTENT` contract, and the second implementation is the one that is wrong
 * after the first one is corrected.
 *
 * What this adds is the field's OWN named bound, applied to the canonical form
 * that would actually be stored, and reported under this module's own code so a
 * surface can say which field was refused. `.pipe` is what makes the order right:
 * the shared pipeline runs to completion first, and the narrower bound then judges
 * its output. Rejection, never truncation — a silently shortened value is a value
 * the person did not write.
 */
const boundedSingleLineText = (
  maximumCharacters: number,
  tooLongCode: ChannelRejectionCode,
): z.ZodType<string, string> =>
  ContentTextRunSchema.pipe(
    z.string({ error: tooLongCode }).max(maximumCharacters, { error: tooLongCode }),
  );

/* ===========================================================================
 * Closed vocabularies
 *
 * Each is a readonly tuple and a schema derived from it, never two hand-written
 * lists. The tuple is iterable, so a surface renders the option set by mapping
 * over it and cannot drift from it; the schema is built from the same tuple, so a
 * member added in one place cannot be missing from the other.
 * =========================================================================== */

/**
 * A channel's visibility.
 *
 * DERIVED FROM THE IMPORTED TUPLE AND NOT RESTATED. `../config/constants.ts` L223
 * names this module as the consumer that must build its enumeration from
 * `CHANNEL_VISIBILITIES`, and gives the failure that writing the two members out
 * again would produce: it is the quiet kind, where a third visibility added to the
 * constant is accepted by that module and refused by a schema holding its own
 * opinion. The tuple's ORDER is significant — it is the order the radio pair
 * renders, public above private (`02-channels.md` L190, frame 71).
 *
 * `02-channels.md` L785 records the pair as "chosen at creation … and convertible
 * in BOTH DIRECTIONS afterwards" (frames 60, 61, 107, 108), and L1011 carries the
 * reversibility as a criterion: converting "inverts the row's own label so the
 * conversion is reversible". That is why there is no one-way conversion operation
 * anywhere below — the operation sets a visibility, and both members are
 * reachable.
 */
export const channelVisibilitySchema = z.enum(CHANNEL_VISIBILITIES, {
  error: 'CHANNEL_VISIBILITY_INVALID' satisfies ChannelRejectionCode,
});

/**
 * The scopes a member's per-channel notification preference may take.
 *
 * `02-channels.md` L789 records "one of all messages, mentions or off, plus a
 * SEPARATE mute flag" (frames 89, 90, 96), and L1004 carries the menu as a
 * criterion: three described entries "plus a SEPARATED mute entry with its own
 * explanation". Three members and a boolean, therefore — never four members. The
 * mute is a distinct field on the relation below, because the two are
 * independent: a channel muted at the mentions scope has a scope to return to
 * when the mute is lifted, which a fused four-member enumeration would have
 * discarded.
 *
 * NAMED FOR THE CHANNEL IT SCOPES, and deliberately not merged with the
 * workspace-wide account setting that `./preference.ts` owns even though the two
 * offer the same three options. `02-channels.md` L809 gives the catalogue's own
 * reading: the modal's notification scope "links out to the WORKSPACE-WIDE
 * SETTINGS FOR THIS ACCOUNT rather than to a channel-level default" (frame 92), so
 * one is the account's default and the other is this channel's override of it.
 * Two settings, one option set — and per `PROJECT_RULE_R5` two similar
 * contracts are not one contract.
 */
export const CHANNEL_NOTIFICATION_SCOPES = ['all-messages', 'mentions', 'off'] as const;

/** A member's per-channel notification scope. See the tuple above. */
export const channelNotificationScopeSchema = z.enum(CHANNEL_NOTIFICATION_SCOPES, {
  error: 'CHANNEL_NOTIFICATION_SCOPE_INVALID' satisfies ChannelRejectionCode,
});

/** A member's per-channel notification scope. */
export type ChannelNotificationScope = z.infer<typeof channelNotificationScopeSchema>;

/**
 * The device classes a member may override their notification scope for.
 *
 * One member, and the count is the observation rather than a placeholder.
 * `02-channels.md` L790 records "an optional nested scope applied to MOBILE
 * DEVICES ONLY, disclosed by its own checkbox" (frames 93, 94), and L1005 carries
 * the same shape as a criterion. A second class is not inferred from the first:
 * the checkbox names one audience, so the contract names one audience.
 *
 * Modelled as a discriminated field rather than as a bare second scope, so the
 * override states what it overrides. A class added later is a member added to this
 * tuple, which is a change a reviewer can see.
 */
export const CHANNEL_NOTIFICATION_DEVICE_CLASSES = ['mobile'] as const;

/** A device class a per-device notification override may name. */
export const channelNotificationDeviceClassSchema = z.enum(CHANNEL_NOTIFICATION_DEVICE_CLASSES, {
  error: 'CHANNEL_DEVICE_CLASS_INVALID' satisfies ChannelRejectionCode,
});

/** A device class a per-device notification override may name. */
export type ChannelNotificationDeviceClass = z.infer<typeof channelNotificationDeviceClassSchema>;

/**
 * The four types the channel browser filters on.
 *
 * `02-channels.md` L802 records them as "public, private, archived or external,
 * offered as the browser's channel-type options each with its own glyph" (frame
 * 128), and L417 enumerates the menu: five rows, of which the first is the
 * unfiltered default and carries no glyph while these four each carry one.
 *
 * DERIVED, NEVER STORED, and the distinction matters enough to state twice. This
 * is a FACET rather than a field: public and private are the channel's visibility,
 * archived is its lifecycle state, and external is a fact about who participates
 * in it — a channel admitting people from another organisation, which
 * `22-external-collaboration.md` owns. A build that stored this alongside
 * visibility and lifecycle would hold the same fact in three places and would
 * eventually disagree with itself. It is composed at read time, which is also
 * where the viewer's authorization is applied: `02-channels.md` L954 names this
 * filter's private option as "exactly where an unscoped implementation leaks".
 */
export const CHANNEL_TYPES = ['public', 'private', 'archived', 'external'] as const;

/** One of the four types the browser filters on. See the tuple above. */
export const channelTypeSchema = z.enum(CHANNEL_TYPES, {
  error: 'CHANNEL_TYPE_INVALID' satisfies ChannelRejectionCode,
});

/** One of the four types the browser filters on. */
export type ChannelType = z.infer<typeof channelTypeSchema>;

/**
 * How a visibility maps onto the type facet the browser filters on.
 *
 * Exhaustive over the imported visibility union by construction, so a third
 * visibility added to `../config/constants.ts` becomes a COMPILE ERROR here rather
 * than a silently unmapped facet. That is the whole reason this exists as a keyed
 * record instead of as two comparisons at the point of use.
 *
 * It maps visibility alone. The archived facet comes from the lifecycle state and
 * the external facet from participation, so neither is derivable from this and
 * neither is faked here.
 */
export const CHANNEL_TYPE_BY_VISIBILITY: Readonly<Record<ChannelVisibility, ChannelType>> =
  Object.freeze({
    public: 'public',
    private: 'private',
  });

/**
 * The two variants of one conversation.
 *
 * `README.md` L327 records this as the one field area 05 contributes to
 * `E-CHANNEL`, and states the finding precisely: a direct message "is not a
 * channel by any observable of its own — no hash-prefixed name, no member count,
 * no topic or description and no details pane appears in any frame of that area —
 * while it does carry the same bookmark row, header shape, message list and
 * composer, so the two are VARIANTS OF ONE CONVERSATION rather than unrelated
 * surfaces" (frames 110, 552). `02-channels.md` L466 corroborates it from the
 * other direction: the bookmark flow is captured on a direct message whose own
 * menu row calls that conversation a channel.
 *
 * The discriminator exists here so that `./message.ts`, `./pagination.ts` and
 * `./realtime.ts` can speak of a conversation rather than only of a channel, and
 * so that the sequence a message is ordered by is per conversation rather than per
 * channel. THE DIRECT-MESSAGE SURFACE ITSELF IS OUT OF SCOPE — it is deferred to
 * `05-direct-messages.md` — so what is modelled here is the discriminator and
 * nothing else. No field, request or projection below invents a shape for that
 * surface.
 */
export const CONVERSATION_TYPES = ['channel', 'direct-message'] as const;

/** Which variant of one conversation a record is. See the tuple above. */
export const conversationTypeSchema = z.enum(CONVERSATION_TYPES, {
  error: 'CONVERSATION_TYPE_INVALID' satisfies ChannelRejectionCode,
});

/** Which variant of one conversation a record is. */
export type ConversationType = z.infer<typeof conversationTypeSchema>;

/**
 * The kinds of event a channel's history records.
 *
 * SIX, AND THE COUNT IS WHAT THE CATALOGUE ENUMERATES TWICE. `02-channels.md` L805
 * lists the history as "joins, renames quoting both names, description changes
 * quoting the new text, additions of a member by another member, archiving and
 * unarchiving" (frames 79, 100, 134, 138), and L1016 repeats exactly that set as a
 * criterion.
 *
 * ABSENCE IS RECORDED AS ABSENCE, per the catalogue's own discipline. A member
 * REMOVAL renders no event row in any capture — L1010 records only that the counts
 * decrement — and no capture renders an event row for a topic change, a purpose
 * change, a visibility conversion or a bookmark. Those operations all exist below,
 * because an unevidenced result is never a reason to omit a mechanism; what is not
 * claimed is that they append a row to this history, because nothing shows that
 * they do. A kind added later is a member added to this tuple with the evidence
 * that forced it.
 */
export const CHANNEL_EVENT_KINDS = [
  /** A person joined the channel themselves (frame 79). */
  'member-joined',
  /** A person was added by another member, whom the row names (frames 100, 120). */
  'member-added',
  /** The channel was renamed. The row quotes BOTH names (frame 100). */
  'renamed',
  /** The description changed. The row quotes the NEW text (frame 100). */
  'description-changed',
  /** The channel was archived (frame 134). */
  'archived',
  /** The channel was unarchived (frame 138). */
  'unarchived',
] as const;

/** One kind of channel event. See the tuple above. */
export const channelEventKindSchema = z.enum(CHANNEL_EVENT_KINDS, {
  error: 'CHANNEL_EVENT_KIND_INVALID' satisfies ChannelRejectionCode,
});

/** One kind of channel event. */
export type ChannelEventKind = z.infer<typeof channelEventKindSchema>;

/**
 * The three scopes the browser's scope chip offers.
 *
 * `02-channels.md` L415 enumerates the menu — all channels, checked and
 * highlighted, then my channels, then other channels (frame 126) — and L1020
 * carries the same three as a criterion.
 *
 * A SCOPE NARROWS AND NEVER WIDENS. Each of these three is a subset of what the
 * viewer is already authorized to read, computed server-side; none of them is a
 * request to be shown more. There is deliberately no option here meaning every
 * workspace, and none meaning include what I may not read — per
 * `PROJECT_RULE_R1` a caller-supplied value decides no authorization
 * question, so the widening option is not offered rather than being offered and
 * refused.
 */
export const CHANNEL_BROWSE_SCOPES = ['all', 'mine', 'others'] as const;

/** Which subset of the viewer's authorized set to list. See the tuple above. */
export const channelBrowseScopeSchema = z.enum(CHANNEL_BROWSE_SCOPES, {
  error: 'CHANNEL_BROWSE_SCOPE_INVALID' satisfies ChannelRejectionCode,
});

/** Which subset of the viewer's authorized set to list. */
export type ChannelBrowseScope = z.infer<typeof channelBrowseScopeSchema>;

/** The scope the browser arrives on, checked in its own menu (frame 126). */
export const DEFAULT_CHANNEL_BROWSE_SCOPE = 'all' satisfies ChannelBrowseScope;

/**
 * The six orders the browser's sort control offers.
 *
 * `02-channels.md` L419 enumerates the menu — alphabetically ascending, checked
 * and highlighted, then alphabetically descending, newest channel, oldest channel,
 * most members and fewest members (frame 130) — and L1020 carries the same six as
 * a criterion.
 *
 * A SORT REORDERS AND NEVER FILTERS, which the surface itself distinguishes: L424
 * records that a filter chip whose value is not its default renders filled and
 * emphasised while the sort control restates its value without filling, "the
 * distinction is that a filter removes rows while a sort only reorders them, so
 * only the filter needs to advertise that the list is incomplete". So no member
 * here can change WHICH rows a viewer sees, only their order — which is what makes
 * it safe for a caller to choose one.
 *
 * The two member-count orders sort by a PROJECTION, and the projection is
 * authorized on its own terms: an ordering computed over counts a viewer may not
 * read would disclose those counts by position. That is enforced by the read path
 * per `S-AUTHZ-READ`, not by this vocabulary.
 */
export const CHANNEL_BROWSE_SORTS = [
  'name-ascending',
  'name-descending',
  'newest',
  'oldest',
  'most-members',
  'fewest-members',
] as const;

/** Which order to list in. See the tuple above. */
export const channelBrowseSortSchema = z.enum(CHANNEL_BROWSE_SORTS, {
  error: 'CHANNEL_BROWSE_SORT_INVALID' satisfies ChannelRejectionCode,
});

/** Which order to list in. */
export type ChannelBrowseSort = z.infer<typeof channelBrowseSortSchema>;

/** The order the browser arrives on, checked in its own menu (frame 130). */
export const DEFAULT_CHANNEL_BROWSE_SORT = 'name-ascending' satisfies ChannelBrowseSort;

/**
 * The unfiltered value of the browser's channel-type chip.
 *
 * Its own member rather than an absent field, because the menu renders it as a
 * checked row: `02-channels.md` L417 records five options of which the first is
 * the default "and only the default option carries no glyph" (frame 128). A
 * surface that mapped an absent field onto that row would have to invent it; a
 * surface mapping over the tuple below renders it.
 */
export const CHANNEL_TYPE_FILTER_ANY = 'any' as const;

/** The five rows the channel-type chip renders: the unfiltered default, then the four types. */
export const CHANNEL_TYPE_FILTERS = [CHANNEL_TYPE_FILTER_ANY, ...CHANNEL_TYPES] as const;

/** Which channel types to list. See the tuple above. */
export const channelTypeFilterSchema = z.enum(CHANNEL_TYPE_FILTERS, {
  error: 'CHANNEL_TYPE_INVALID' satisfies ChannelRejectionCode,
});

/** Which channel types to list. */
export type ChannelTypeFilter = z.infer<typeof channelTypeFilterSchema>;

/** The type filter the browser arrives on, checked in its own menu (frame 128). */
export const DEFAULT_CHANNEL_TYPE_FILTER = CHANNEL_TYPE_FILTER_ANY satisfies ChannelTypeFilter;

/**
 * The three groups a conversation row may sit in, in one member's sidebar.
 *
 * `02-channels.md` L804 records sidebar placement as "membership of a sidebar
 * group — channels, starred, or a user-created section — rendered as grouping and
 * nesting" (frames 86, 120), and it is one of the six rows marked per-viewer.
 *
 * THE SECTION CASE CARRIES A REFERENCE AND COINS NO ENTITY. A user-created section
 * is the viewer's own arrangement of their own sidebar, so it belongs to the
 * viewer's preference record, which `14-preferences-settings.md` owns and
 * `./preference.ts` implements. `README.md` L313 fixes the entity set at twenty and
 * the set is closed, so no twenty-first identifier is coined for a section here:
 * this field holds the identifier of one and defines none.
 */
export const CHANNEL_SIDEBAR_GROUPS = ['channels', 'starred', 'section'] as const;

/** Which sidebar group a row sits in, for one member. See the tuple above. */
export const channelSidebarGroupSchema = z.enum(CHANNEL_SIDEBAR_GROUPS, {
  error: 'CHANNEL_SIDEBAR_PLACEMENT_INVALID' satisfies ChannelRejectionCode,
});

/** Which sidebar group a row sits in, for one member. */
export type ChannelSidebarGroup = z.infer<typeof channelSidebarGroupSchema>;

/**
 * Where one member's sidebar puts this conversation's row.
 *
 * A discriminated union rather than a group plus a nullable identifier, so the
 * identifier is present exactly in the case that has one. The two-field form
 * admits a section placement naming no section and a channels placement naming
 * one, and both are states a renderer would then have to decide what to do about.
 *
 * The starred case is the placement the star relocates a row into (`02-channels.md`
 * L792, frames 86, 87). It is a placement rather than a second copy of the starred
 * flag on the relation below: the flag is the member's choice and this is where the
 * row consequently renders.
 */
export const channelSidebarPlacementSchema = z.discriminatedUnion(
  'group',
  [
    z.strictObject(
      { group: z.literal('channels') },
      { error: 'CHANNEL_SIDEBAR_PLACEMENT_INVALID' satisfies ChannelRejectionCode },
    ),
    z.strictObject(
      { group: z.literal('starred') },
      { error: 'CHANNEL_SIDEBAR_PLACEMENT_INVALID' satisfies ChannelRejectionCode },
    ),
    z.strictObject(
      {
        group: z.literal('section'),
        /** The viewer's own section, held as a reference. See the tuple's note. */
        sectionId: opaqueIdentifier('CHANNEL_SIDEBAR_SECTION_ID_MALFORMED'),
      },
      { error: 'CHANNEL_SIDEBAR_PLACEMENT_INVALID' satisfies ChannelRejectionCode },
    ),
  ],
  { error: 'CHANNEL_SIDEBAR_PLACEMENT_INVALID' satisfies ChannelRejectionCode },
);

/** Where one member's sidebar puts this conversation's row. */
export type ChannelSidebarPlacement = z.infer<typeof channelSidebarPlacementSchema>;

/** The group a row sits in until its member moves it (frame 120). */
export const DEFAULT_CHANNEL_SIDEBAR_GROUP = 'channels' satisfies ChannelSidebarGroup;

/**
 * The three states a channel's lifecycle can be in.
 *
 * `02-channels.md` L798 records the archived state and L799 the deleted state,
 * calling the second "a TERMINAL lifecycle state, distinguished from archiving in
 * the dialog's own copy and gated behind an acknowledgement checkbox" (frames 111,
 * 112).
 */
export const CHANNEL_LIFECYCLE_STATES = ['active', 'archived', 'deleted'] as const;

/** Which lifecycle state a channel is in. See the tuple above. */
export const channelLifecycleStateSchema = z.enum(CHANNEL_LIFECYCLE_STATES, {
  error: 'CHANNEL_LIFECYCLE_INVALID' satisfies ChannelRejectionCode,
});

/** Which lifecycle state a channel is in. */
export type ChannelLifecycleState = z.infer<typeof channelLifecycleStateSchema>;

/* ===========================================================================
 * Identifiers
 *
 * Four kinds, one shape, four refusal codes. Each is an opaque server-minted
 * reference; none is guessable, constructible or parseable by a caller.
 * =========================================================================== */

/** A channel, held as the opaque token its details surface renders (frames 81, 136). */
export const channelIdSchema = opaqueIdentifier('CHANNEL_ID_MALFORMED');

/** A bookmark on a conversation (frames 259, 261). */
export const channelBookmarkIdSchema = opaqueIdentifier('CHANNEL_BOOKMARK_ID_MALFORMED');

/** A bookmark folder on a conversation (frames 263, 265, 266). */
export const channelBookmarkFolderIdSchema = opaqueIdentifier(
  'CHANNEL_BOOKMARK_FOLDER_ID_MALFORMED',
);

/** One entry in a channel's event history (frames 79, 100, 134, 138). */
export const channelEventIdSchema = opaqueIdentifier('CHANNEL_EVENT_ID_MALFORMED');

/* ===========================================================================
 * Field values
 * =========================================================================== */

/**
 * A channel's name.
 *
 * BUILT ENTIRELY FROM IMPORTED INVARIANTS. `02-channels.md` L782 states the rule
 * the surface states: lower case, without spaces or periods, and no longer than
 * the imported ceiling — stated as helper copy and enforced by a live
 * remaining-character counter (frames 97, 69). Not one part of that rule is
 * written out here. The floor, the ceiling and the character class are
 * `CHANNEL_NAME_MIN_LENGTH`, `CHANNEL_NAME_MAX_LENGTH` and
 * `CHANNEL_NAME_PATTERN`, imported and consumed by reference, because per
 * `PROJECT_RULE_R3` a literal at a point of use is a defect and because a
 * second copy of a rule is the copy that is wrong after the first one changes.
 *
 * THE THREE CHECKS REPORT SEPARATELY, ON PURPOSE, and the imported constants are
 * built for exactly that: the pattern deliberately carries no length bound so that
 * a name which is too long and a name which contains an illegal character are two
 * distinct findings a surface can render against two distinct fields
 * (`../config/constants.ts`, the pattern's own note). Collapsing them into one
 * refusal would tell someone who typed a long valid name that they had typed an
 * illegal character.
 *
 * THE COUNTER IS NOT MODELLED, and its absence is deliberate rather than an
 * omission. A remaining-character counter is a rendering derived from the ceiling
 * by the surface that draws it — it counts DOWN, reading the ceiling against an
 * empty field — so it is not a stored value, not a request field and not a second
 * place the ceiling is written. `../config/constants.ts` states the direction and
 * deliberately gives the counter no constant of its own; this module holds to that.
 *
 * The value passes the shared content pipeline first, so a name is stored in the
 * one canonical Unicode form everything else is stored in and cannot smuggle a
 * control character or a bidirectional override past a character class that would
 * otherwise have admitted its neighbours.
 */
export const channelNameSchema = ContentTextRunSchema.pipe(
  z
    .string({ error: 'CHANNEL_NAME_REQUIRED' satisfies ChannelRejectionCode })
    .min(CHANNEL_NAME_MIN_LENGTH, {
      error: 'CHANNEL_NAME_REQUIRED' satisfies ChannelRejectionCode,
    })
    .max(CHANNEL_NAME_MAX_LENGTH, {
      error: 'CHANNEL_NAME_TOO_LONG' satisfies ChannelRejectionCode,
    })
    .regex(CHANNEL_NAME_PATTERN, {
      error: 'CHANNEL_NAME_ILLEGAL_CHARACTER' satisfies ChannelRejectionCode,
    }),
);

/**
 * A channel's topic.
 *
 * SINGLE-LINE TEXT, NOT RICH, and the distinction is the observation.
 * `02-channels.md` L783 records "an optional SINGLE VALUE whose empty state renders
 * as a placeholder-styled prompt, with its own inline Edit control" (frames 81,
 * 104), while L784 records the description as a multi-line rich value in the same
 * table. Two rows, two shapes; modelling the topic as rich text would give this
 * product two rich fields where the catalogue evidences one.
 *
 * L996 carries the empty rendering as a criterion — the topic "renders as a
 * placeholder-styled prompt while empty rather than as a blank row" — which is a
 * statement about the surface and not about storage: what is stored is an absent
 * value, and the prompt is what the surface draws in its place.
 *
 * `02-channels.md` L108 records the topic journey as a PARTIAL CAPTURE: no frame
 * shows the editor or a populated value. Per `PROJECT_RULE_R3` that is not
 * permission to omit the mechanism, so the field and its operation both exist and
 * the bound above is authored with its reasoning recorded.
 */
export const channelTopicSchema = boundedSingleLineText(
  CHANNEL_TOPIC_MAX_LENGTH,
  'CHANNEL_TOPIC_TOO_LONG',
);

/**
 * A channel's purpose.
 *
 * A CONSTRAINED INLINE SEQUENCE, NOT PLAIN TEXT, because the evidence rules plain
 * text out. `02-channels.md` L800 records the purpose as "a short line rendered on
 * a browser row beside the member count, ABLE TO CONTAIN A CHANNEL-MENTION CHIP"
 * (frames 125, 133), and L422 records that chip still rendering on the archived
 * row. A value that carries a chip is not a string.
 *
 * TYPED AGAINST THE ONE CONTENT VOCABULARY, per `PROJECT_RULE_R5`. The two
 * members below are `./content.ts`'s own text node and channel-mention node — not
 * local shapes resembling them — so a purpose is validated, normalised, encoded
 * and rendered by exactly the machinery that validates, normalises, encodes and
 * renders a message body. Declaring a third rich shape here would be a second
 * implementation of that contract.
 *
 * CONSTRAINED RATHER THAN THE FULL DOCUMENT, because the evidence constrains it: a
 * purpose is one line on one row. The full document admits paragraphs, lists,
 * blockquotes and code blocks, none of which a single browser row can render, so
 * the purpose admits the two inline node kinds it is observed to carry and refuses
 * the rest. That is narrower than the document and built from the same parts —
 * which is the distinction between constraining a vocabulary and forking it.
 */
export const channelPurposeNodeSchema = z.discriminatedUnion(
  'type',
  [ContentTextNodeSchema, ContentChannelMentionNodeSchema],
  { error: 'CHANNEL_PURPOSE_NODE_NOT_ALLOWED' satisfies ChannelRejectionCode },
);

/** One node of a purpose line. See `channelPurposeSchema`. */
export type ChannelPurposeNode = z.infer<typeof channelPurposeNodeSchema>;

/** A channel's purpose, as the ordered inline sequence a browser row renders. */
export const channelPurposeSchema = z
  .array(channelPurposeNodeSchema, {
    error: 'CHANNEL_PURPOSE_NODE_NOT_ALLOWED' satisfies ChannelRejectionCode,
  })
  .max(CHANNEL_PURPOSE_MAX_INLINE_NODES, {
    error: 'CHANNEL_PURPOSE_TOO_LONG' satisfies ChannelRejectionCode,
  })
  .readonly();

/** A channel's purpose. */
export type ChannelPurpose = z.infer<typeof channelPurposeSchema>;

/**
 * A bookmark's functional glyph identifier.
 *
 * The picker's OPTION SET IS NOT OBSERVABLE — `02-channels.md` L482 shows "a
 * leading glyph-picker control with a caret" and no capture opens it — so this is a
 * bounded identifier rather than a closed enumeration. Writing an enumeration would
 * mean inventing the members and then presenting the invention as observed, which
 * is the opposite of what the corpus supports; the resolvable set belongs to the
 * first-party icon registry in `packages/ui/src/icons`, which owns which functions
 * have artwork. The judgement is registered in `docs/decisions/gap-register.md`.
 *
 * WHAT IS ENFORCED IS THAT IT NAMES A FUNCTION. The shape admits a lower-case
 * hyphen-separated token and nothing else, so the field cannot hold a path, a
 * data-encoded image, an address or a mark. Per `PROJECT_RULE_R4` third-party
 * icon artwork is never traced, extracted or reconstructed, and a field that
 * accepted an arbitrary string is a field through which artwork arrives.
 */
export const CHANNEL_BOOKMARK_GLYPH_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** A bookmark's functional glyph identifier. See the pattern's note. */
export const channelBookmarkGlyphSchema = z
  .string({ error: 'CHANNEL_BOOKMARK_GLYPH_INVALID' satisfies ChannelRejectionCode })
  .max(CHANNEL_BOOKMARK_GLYPH_MAX_LENGTH, {
    error: 'CHANNEL_BOOKMARK_GLYPH_INVALID' satisfies ChannelRejectionCode,
  })
  .regex(CHANNEL_BOOKMARK_GLYPH_PATTERN, {
    error: 'CHANNEL_BOOKMARK_GLYPH_INVALID' satisfies ChannelRejectionCode,
  });

/** A bookmark folder's name. */
export const channelBookmarkFolderNameSchema = boundedSingleLineText(
  CHANNEL_BOOKMARK_FOLDER_NAME_MAX_LENGTH,
  'CHANNEL_BOOKMARK_FOLDER_NAME_TOO_LONG',
).pipe(
  z.string().min(MIN_REQUIRED_VALUE_CHARS, {
    error: 'CHANNEL_BOOKMARK_FOLDER_NAME_REQUIRED' satisfies ChannelRejectionCode,
  }),
);

/** A count of members, as a projection renders it. Zero is a legitimate value (frame 133). */
export const channelMemberCountSchema = z
  .int({ error: 'CHANNEL_MEMBER_COUNT_INVALID' satisfies ChannelRejectionCode })
  .min(0, { error: 'CHANNEL_MEMBER_COUNT_INVALID' satisfies ChannelRejectionCode });

/* ===========================================================================
 * Bookmarks and bookmark folders
 *
 * FIELDS OF THE CHANNEL, NOT ENTITIES OF THEIR OWN. `02-channels.md` L864 settles
 * the placement and gives the reason: the corpus shows them "only as chips
 * belonging to a conversation, with no identity, no permissions and no surface of
 * their own", so promoting them to an entity "would add structure the evidence does
 * not carry". `README.md` L313 fixes the entity set at twenty and the set is
 * closed, so neither is coined here as a twenty-first identifier.
 * =========================================================================== */

/**
 * One bookmark on a conversation.
 *
 * THE ADDRESS IS `S-LINK`'S DESTINATION, REUSED AND NOT REDECLARED. `02-channels.md`
 * L1042 states the contract as a criterion — a bookmark address is "canonically
 * parsed, restricted to an `http` or `https` allowlist with executing and
 * local-state schemes REJECTED AT INPUT, its name encoded independently of its
 * destination, and followed without conveying the opener reference or the referring
 * address" — and L950 carries the same as a build obligation. Every part of that
 * which is a validation rule is `./content.ts`'s destination schema, which parses
 * canonically, admits exactly the two schemes and re-applies its bound to the
 * canonical form. Declaring a second address rule here would be a second
 * implementation of one contract, and the two would disagree about a scheme
 * eventually. The parts that are not validation rules — the absent opener reference
 * and the absent referrer — belong to the renderer that follows the address, and
 * are named here so a reader of this shape knows they are somebody's obligation.
 *
 * THE NAME IS `S-LINK`'S LABEL, FOR THE SAME REASON AND ON THAT MODULE'S OWN
 * INSTRUCTION: its note states that it is exported separately because "a channel
 * bookmark is the same shape" and that "a second declaration of it elsewhere would
 * be a second implementation of one contract". The label is untrusted on its own
 * terms and is NEVER checked against the destination — the two are independent
 * values, and a rule forcing one to agree with the other would contradict the
 * observed behaviour. What answers the misrepresentation risk is presentation.
 *
 * THE NAME IS OPTIONAL, AND THAT IS OBSERVED. `02-channels.md` L482 records that
 * entering an address reveals the Name field AND the footer together, with the add
 * action "already rendered as a filled primary" before a name has been typed (frame
 * 259); L483 shows the name being typed afterwards with no change in the action.
 * So a bookmark can be created without one, and `null` is the legitimate absence a
 * surface renders the address in place of. The address, by contrast, is required:
 * the whole footer is withheld until it is present (frame 258).
 */
export const channelBookmarkSchema = z.strictObject(
  {
    /** The bookmark itself, as an opaque reference. */
    id: channelBookmarkIdSchema,

    /** Where it goes. Canonically parsed and scheme-restricted; see the note above. */
    destination: ContentLinkDestinationSchema,

    /** What the chip reads, or `null` where none was given. See the note above. */
    name: ContentLinkLabelSchema.nullable(),

    /**
     * The chosen leading glyph, or `null` for the default the surface draws.
     *
     * A FUNCTION, NEVER ARTWORK. See `channelBookmarkGlyphSchema`.
     */
    glyph: channelBookmarkGlyphSchema.nullable(),

    /**
     * The folder this bookmark sits in, or `null` while it sits on the bar itself.
     *
     * Held on the bookmark rather than as a list on the folder, so a bookmark is in
     * at most one folder by construction — the bar renders a chip either directly or
     * inside one folder's menu (frames 261, 266) and never in two.
     *
     * `02-channels.md` L493 records three things about this flow that "do not line
     * up" and are not reconciled there, one of which is whether the bookmark listed
     * inside a folder is the one created before it. Per `PROJECT_RULE_R2` the
     * contradiction is referenced rather than corrected: it is recorded in
     * `docs/decisions/catalog-defects.md`, and this shape supports both readings
     * because both create-into-a-folder and move-into-a-folder are operations below.
     */
    folderId: channelBookmarkFolderIdSchema.nullable(),

    /** When it was added. An absolute instant; see `absoluteInstant`. */
    createdAt: absoluteInstant,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** One bookmark on a conversation. */
export type ChannelBookmark = z.infer<typeof channelBookmarkSchema>;

/**
 * One bookmark folder on a conversation.
 *
 * A named container and nothing more. `02-channels.md` L794 records it "rendered as
 * a chip with a caret whose menu lists the contained entries OR AN EMPTY STATE"
 * (frames 263, 265, 266) — so a folder holding nothing is a legitimate state rather
 * than an error, which is why nothing here requires it to be non-empty.
 *
 * THE NAME IS REQUIRED, AND THE FRAME THAT SUGGESTS OTHERWISE IS A RENDERING.
 * `02-channels.md` L485 records the create action rendered "as a filled primary EVEN
 * WHILE THE FIELD IS EMPTY" (frame 262), and L491 draws the inference carefully:
 * the folder name "is not [required], or is defaulted — no frame shows the result of
 * creating a folder with an empty name". So the result is unobserved, and the enabled
 * action is a rendering rather than a validation. `./content.ts` reaches the same
 * conclusion about the same pattern on the link dialog, recording an active save
 * action against an empty field as "a rendering, recorded as such, and not evidence
 * that any destination is acceptable".
 *
 * The choice is therefore the smallest coherent behaviour consistent with adjacent
 * evidenced behaviour, as `PROJECT_RULE_R3` directs: a folder is identified to
 * a person by its name and by nothing else, its chip renders that name, and the
 * channel name beside it is required for the same reason — so a name is required
 * here too. Registered in `docs/decisions/gap-register.md` with the alternative
 * considered.
 */
export const channelBookmarkFolderSchema = z.strictObject(
  {
    /** The folder itself, as an opaque reference. */
    id: channelBookmarkFolderIdSchema,

    /** What the chip reads. Required; see the note above. */
    name: channelBookmarkFolderNameSchema,

    /** When it was created. An absolute instant; see `absoluteInstant`. */
    createdAt: absoluteInstant,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** One bookmark folder on a conversation. */
export type ChannelBookmarkFolder = z.infer<typeof channelBookmarkFolderSchema>;

/* ===========================================================================
 * Lifecycle
 * =========================================================================== */

/**
 * A channel's lifecycle, as a state carrying the instant that state began.
 *
 * A DISCRIMINATED UNION RATHER THAN A FLAG PLUS TWO NULLABLE DATES, so the instant
 * is present exactly in the state that has one. The flat form admits an archived
 * channel with no archive instant and an active channel with one, and both are
 * states a renderer, an audit trail and a restore path would each have to decide
 * what to do about. Here they are unrepresentable.
 *
 * INSTANTS, NEVER DURATIONS, per `PROJECT_RULE_R3`. A record stores when the
 * state began; any elapsed-time phrasing a surface renders is derived from that at
 * render time, so a configured default may change later without invalidating a
 * record already stored.
 *
 * ARCHIVING IS REVERSIBLE AND IS A RENDERING CHANGE, NOT AN AUTHORIZATION CHANGE.
 * `02-channels.md` L1014 is emphatic and its wording is load-bearing for the client:
 * "archiving withdraws no read authorization: the channel's applicable viewer
 * authorization is preserved in the archived state per `S-AUTHZ-READ`, and a
 * private channel that is archived STAYS PRIVATE". What changes is the rendering —
 * no member count and no huddle control in the header, no bookmark row, no Members
 * tab, no leave action, and THE COMPOSER **REPLACED** BY A STATUS BAR WITH A
 * CLOSE-CHANNEL ACTION (frames 134, 136, 137). Replaced, not disabled: a build that
 * renders a disabled composer has implemented a different read-only presentation
 * from the one the corpus shows. L1015 records the reverse in one movement —
 * unarchiving "restores the composer, the bookmark row, the member count, the huddle
 * control and the hash glyph, and appends an unarchive entry to the channel's event
 * history" (frame 138) — which is why `archiveChannel` and `unarchiveChannel` are
 * two operations below and why `unarchived` is one of the six event kinds.
 *
 * DELETION IS TERMINAL. `02-channels.md` L799 states it (frames 111, 112) and L367
 * records that no frame shows the state after deletion is confirmed, so what a read
 * path does with a deleted record is that path's decision under `S-AUTHZ-READ` and
 * is not claimed here. The state is representable because an event history has to
 * outlive the channel it describes: L862 requires an event record to stay "intact
 * and still attributable" after the account that caused it is removed, and the same
 * reasoning applies to the channel the events belong to.
 */
export const channelLifecycleSchema = z.discriminatedUnion(
  'state',
  [
    z.strictObject(
      { state: z.literal('active') },
      { error: 'CHANNEL_LIFECYCLE_INVALID' satisfies ChannelRejectionCode },
    ),
    z.strictObject(
      {
        state: z.literal('archived'),
        /** When archiving took effect. Reversible; see the note above. */
        archivedAt: absoluteInstant,
      },
      { error: 'CHANNEL_LIFECYCLE_INVALID' satisfies ChannelRejectionCode },
    ),
    z.strictObject(
      {
        state: z.literal('deleted'),
        /** When deletion took effect. Terminal; see the note above. */
        deletedAt: absoluteInstant,
      },
      { error: 'CHANNEL_LIFECYCLE_INVALID' satisfies ChannelRejectionCode },
    ),
  ],
  { error: 'CHANNEL_LIFECYCLE_INVALID' satisfies ChannelRejectionCode },
);

/** A channel's lifecycle, as a state carrying the instant that state began. */
export type ChannelLifecycle = z.infer<typeof channelLifecycleSchema>;

/* ===========================================================================
 * `E-CHANNEL` — the shared record
 *
 * EVERY FIELD HERE HAS ONE VALUE FOR EVERY MEMBER. That is the entry condition,
 * and it is `S-PERUSER`'s question asked of each field in turn: if two members
 * opened this channel at the same moment, could they legitimately see different
 * values? For each field below the answer is no. For the six on
 * `channelMembershipSchema` the answer is yes, which is why they are there and not
 * here.
 * =========================================================================== */

/**
 * A channel, as every member of it sees it.
 *
 * `02-channels.md` L777-L805 is the field table this shape implements, and every
 * field cites the frame NUMBER that evidences it. `README.md` L313 lists
 * `E-CHANNEL` among the twenty entities the catalogue works from; the set is closed,
 * so nothing below introduces a twenty-first identifier and the two structures that
 * might have become one — the bookmark and the bookmark folder — are fields here on
 * the catalogue's own instruction at L864.
 *
 * IT CARRIES NO WORKSPACE. The channel belongs to one, and the reference is not a
 * field of this shape because it would be a field a caller could send. Scope is
 * derived from the session and injected below every query by
 * `packages/db/src/tenancy.ts`, per `PROJECT_RULE_R1`.
 *
 * THREE THINGS THE SURFACE RENDERS ARE NOT FIELDS OF THIS SHAPE, and each is
 * deliberate rather than an omission:
 *
 *   - THE MEMBER ROSTER. See `facepile` and `memberCount` below.
 *   - THE SHARED-FILES CARD. `02-channels.md` L797 records it (frames 81, 96, 136)
 *     and L818 assigns the fields to `E-FILE`, whose full model belongs to
 *     `16-files-media.md` — a deferred area. The card is a PROJECTION over files
 *     scoped to this channel, authorized on its own terms per `S-AUTHZ-READ` and
 *     named among the projections at L954, so it is neither a field here nor a shape
 *     invented here.
 *   - INTEGRATIONS. `02-channels.md` L796 records apps installable into the channel
 *     plus two plan-gated capabilities (frame 83). `README.md` assigns the
 *     workspace's per-app state to `E-APP`'s **installation** field group and the
 *     tier resolution to `E-WORKSPACE`'s **commercial position** group — so neither
 *     is a channel field. Both areas are deferred, so no shape for either is
 *     invented here.
 *
 * THE EXTERNAL-INVITATION AFFORDANCE IS LIKEWISE NOT MODELLED HERE. The private
 * creation path exposes it (frames 63-68), and flow 02.2's own closing note states
 * that "the organization itself, the channel-scoped external invitation and its
 * permission level are modelled by `22-external-collaboration.md`; this document
 * records only what the channel surfaces show". L824 places the per-channel
 * permission level on `E-EXTERNAL-ORG` rather than on the channel, and L823 places
 * the invitation on `E-INVITATION`. Both are deferred and both are owned elsewhere,
 * so this module cross-references them and declares neither: a shape declared here
 * would be a second implementation of a contract another module owns.
 */
export const channelSchema = z.strictObject(
  {
    /**
     * The channel itself, as the opaque token its details surface renders beside a
     * copy control — present on the archived variant too (frames 81, 136).
     */
    id: channelIdSchema,

    /**
     * Which variant of one conversation this is (frames 110, 552).
     *
     * See `CONVERSATION_TYPES`. The discriminator lets the message, pagination and
     * realtime contracts speak of a conversation; the direct-message surface itself
     * is deferred and is not modelled here.
     */
    conversationType: conversationTypeSchema,

    /**
     * The name, rendered behind a hash glyph or a lock glyph in the sidebar row,
     * the conversation header, the details title, the About tab's name card and the
     * browser row (frames 60, 81, 108, 125).
     *
     * Which glyph is a rendering of `visibility` and not a second field: L990 and
     * L1011 both derive it from the visibility, and L1011 requires a conversion to
     * apply the matching glyph "everywhere the name is rendered".
     */
    name: channelNameSchema,

    /** Public or private, convertible in both directions (frames 60, 61, 107, 108). */
    visibility: channelVisibilitySchema,

    /**
     * The topic, or `null` while none is set — the absence the surface renders a
     * placeholder-styled prompt in place of (frames 81, 104).
     */
    topic: channelTopicSchema.nullable(),

    /**
     * The description: multi-line rich text that may carry channel-mention chips,
     * editable and clearable (frames 99, 102, 103, 104).
     *
     * `ContentDocumentSchema` and not a local rich shape, per
     * `PROJECT_RULE_R5`: one content vocabulary, validated and rendered by one
     * implementation. `null` is the cleared value — L1008 records that the dialog
     * "permits an empty value, keeping its save action enabled when the textarea is
     * cleared", and `setChannelDescriptionRequestSchema` below is where clearing is
     * kept distinguishable from leaving unchanged.
     *
     * A RENAME DOES NOT REWRITE IT. L1007 carries that as a criterion: a rename
     * updates the name everywhere it is rendered and "does NOT rewrite the
     * description or any message text that contains the former name" (frames 99,
     * 100). That is why `renameChannelRequestSchema` carries a name and nothing
     * else, and why the description has an operation of its own.
     */
    description: ContentDocumentSchema.nullable(),

    /**
     * The purpose: a short inline line a browser row renders beside the member
     * count, able to carry a channel-mention chip (frames 125, 133). `null` where
     * none is set.
     */
    purpose: channelPurposeSchema.nullable(),

    /**
     * Who created it — one read-only row naming a person and a date, with no Edit
     * control (frames 81, 76).
     *
     * `./user.ts`'s summary projection, reused rather than restated. Note what that
     * makes this field: a PROJECTION embedded in a projection, authorized on its own
     * terms per `S-AUTHZ-READ`. It deliberately carries no email address, for the
     * reason that module gives.
     */
    createdBy: personSummarySchema,

    /** When it was created (frames 81, 76). An absolute instant. */
    createdAt: absoluteInstant,

    /**
     * How many members it has (frames 82, 106, 120).
     *
     * THE COUNT IS AUTHORITATIVE AND THE ROSTER IS NOT HERE. L786 records the roster
     * "surfaced as a facepile plus a numeric count in the conversation header, as a
     * count in the Members tab label, and as one removable row per member", and L1010
     * requires all three renderings to move together after a removal.
     *
     * A COUNT IS A PROJECTION AND IS AUTHORIZED INDEPENDENTLY, per `S-AUTHZ-READ` and
     * L1040: the member counts are "computed over the viewer's authorized set and
     * recomputed on every render". It is not a denormalised column a mutation
     * increments; it is composed at read time, which is the only way losing access
     * can remove it on the next render.
     *
     * Zero is legitimate: the archived browser row reads zero (frame 133).
     */
    memberCount: channelMemberCountSchema,

    /**
     * The bounded preview of members the header's facepile renders (frames 82, 106,
     * 120).
     *
     * A PREVIEW, NOT THE ROSTER. See `CHANNEL_FACEPILE_MAX` for why: a
     * five-hundred-member channel is an explicit edge case, and a channel read that
     * returned five hundred people would make every channel open a bulk read of
     * personal data. The full roster is the Members tab's own paged projection —
     * `browseChannelMembersRequestSchema` below — with its own authorization and its
     * own search field (L997).
     *
     * A MEMBER ROW'S SELF-MARKER AND ITS REMOVABILITY ARE NOT STORED ANYWHERE.
     * L817 evidences "a self-marker badge beside a name" and "per-channel
     * removability, absent on one's own row", and L924 records that the signed-in
     * person's own row carries a self-marker and no remove control in every capture
     * (frames 82, 106, 120). Both are DERIVED AT RENDER TIME: the marker is this
     * entry's identifier compared with the acting session's own, and removability is
     * that comparison plus the decision the server makes when the removal is
     * attempted. Storing either would be storing a per-viewer fact on a shared
     * object — and a hidden control is not an authorization, which is why the
     * removal is authorized server-side regardless of what any row rendered.
     */
    facepile: z
      .array(personSummarySchema)
      .max(CHANNEL_FACEPILE_MAX, {
        error: 'CHANNEL_FACEPILE_TOO_LARGE' satisfies ChannelRejectionCode,
      })
      .readonly(),

    /** The bookmarks on this conversation's bar (frames 259, 261). */
    bookmarks: z
      .array(channelBookmarkSchema)
      .max(CHANNEL_BOOKMARKS_MAX, {
        error: 'CHANNEL_BOOKMARKS_TOO_MANY' satisfies ChannelRejectionCode,
      })
      .readonly(),

    /** The bookmark folders on this conversation's bar (frames 263, 265, 266). */
    bookmarkFolders: z
      .array(channelBookmarkFolderSchema)
      .max(CHANNEL_BOOKMARK_FOLDERS_MAX, {
        error: 'CHANNEL_BOOKMARK_FOLDERS_TOO_MANY' satisfies ChannelRejectionCode,
      })
      .readonly(),

    /** Active, archived or deleted, with the instant that state began. */
    lifecycle: channelLifecycleSchema,

    /**
     * Whether members may start and join huddles here (frame 84).
     *
     * MODELLED MINIMALLY AND DELIBERATELY. `02-channels.md` L795 records "a
     * per-channel setting with its own card", and L999 confirms the Settings tab
     * renders that card — so the capability is a channel field and this is the field.
     * The huddle SURFACE is `06-huddles.md`'s and is deferred, so nothing about a
     * session, a participant, a device or a diagnostic appears here: per
     * `PROJECT_RULE_R3` an unbuilt surface is no reason to omit an evidenced
     * per-channel setting, and per the same discipline it is no licence to invent the
     * surface's shape either.
     */
    huddlesEnabled: z.boolean(),

    /**
     * Whether anyone who joins the workspace is added to this channel (frames 72, 73).
     *
     * ===================================================================
     * THIS FIELD STAYS ON THE CHANNEL. IT IS NOT ONE OF THE SIX.
     * ===================================================================
     *
     * It resembles a preference closely enough that moving it onto
     * `channelMembershipSchema` is the natural mistake, and it would be wrong.
     * `02-channels.md` L811 excludes it explicitly: "the auto-add-on-join flag is NOT
     * in that set: its own legend states it is ADMINISTERED RATHER THAN PERSONAL, so
     * it stays a property of the channel and is authorized per `S-AUTHZ-OP`" (frame
     * 72). L986 describes that legend — the toggle renders "inside a bordered group
     * annotated as visible only to administrators" — and L1043 repeats the exclusion
     * as a criterion.
     *
     * Apply `S-PERUSER`'s test and it answers the same way: two members opening this
     * channel at the same moment could not legitimately see different values, because
     * the flag describes what the workspace does to new joiners rather than what this
     * viewer prefers. One value, one channel.
     *
     * AUTHORIZED, NOT HIDDEN. The legend names an audience, and L952 is explicit that
     * "that pattern is a DECLARATION at the point of use rather than an enforcement".
     * `21-states.md` owns the rendering — role gating hides nothing and disables
     * nothing — and the server decides who may change it, per `S-AUTHZ-OP`.
     *
     * ITS DEFAULT IS AN INFERENCE, RECORDED AS ONE. L202 infers "the auto-add
     * toggle's default is ON for the add-all branch and OFF for the add-specific
     * branch, because that is the only difference in the toggle between two otherwise
     * identical captures taken one radio change apart". That is a default the
     * add-members surface arrives on, not a rule about a stored value, so no default
     * is applied to this field: a channel's stored flag is whatever it was last set
     * to. Registered in `docs/decisions/gap-register.md`.
     */
    autoAddOnJoin: z.boolean(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** A channel, as every member of it sees it. */
export type Channel = z.infer<typeof channelSchema>;

/* ===========================================================================
 * The channel-membership relation — the point of this module
 *
 * `02-channels.md` L807 states it as a finding and L809 as a build obligation:
 * "SIX OF THE ROWS ABOVE ARE PER-VIEWER STATE AND DO NOT BELONG ON `E-CHANNEL`",
 * and each of the six "lives on a CHANNEL-MEMBERSHIP RECORD KEYED BY THE PAIR OF
 * CHANNEL AND MEMBER, never on the channel, per `S-PERUSER`". L1043 carries the same
 * as a criterion. `README.md` L363 is the relation itself — conversation membership,
 * keyed by conversation and member — and `./user.ts` L959 names this module as its
 * home.
 *
 * WHY IT IS A SECURITY RULE AND NOT A MODELLING PREFERENCE, in the catalogue's own
 * terms (L809): stored on the channel, "one person muting a channel mutes it for
 * everyone, and one person starring it moves it in everyone's sidebar. It also means
 * one member's notification choice and sidebar arrangement become readable by every
 * other member of the channel, which is a disclosure of that person's behaviour."
 *
 * WHY THE CORPUS COULD NOT HAVE SETTLED IT. L807 gives the reason the rows had to be
 * marked at all: this corpus is a SINGLE AUTHENTICATED SESSION IN ONE WORKSPACE, so
 * a value stored per member and a value shared by the channel render identically to
 * the one viewer captured. No frame can distinguish them, which is why the placement
 * is decided here — in the contract — rather than left to a later reader.
 *
 * SIX ROWS, SEVEN FIELDS. The first row is two fields: L789 records "one of all
 * messages, mentions or off, PLUS A SEPARATE MUTE FLAG", so the scope and the mute
 * are modelled as a three-member vocabulary and a boolean rather than as one
 * four-member vocabulary. The rest map one to one.
 *
 * WHAT THIS RECORD WILL LATER CARRY, NAMED SO THAT NOBODY ADDS A SECOND RELATION.
 * `README.md` L363 places three further per-member facts on this same relation — the
 * unread flag, its message count, and the has-draft flag — and names
 * `12-activity-notifications.md` as their canonical owner. That area is deferred, so
 * they are not claimed here: per the catalogue's discipline absence is recorded as
 * absence rather than filled in. They are named in this note for the reason
 * `./user.ts` names the credential artefacts in its own: so that a build reading this
 * shape cannot mistake their absence for an oversight, and — more importantly — so
 * that the agent who implements them EXTENDS THIS RECORD rather than inventing a
 * second per-viewer relation over the same pair.
 * =========================================================================== */

/**
 * A member's per-device notification override.
 *
 * `02-channels.md` L790 records "an optional nested scope applied to mobile devices
 * only, DISCLOSED BY ITS OWN CHECKBOX" (frames 93, 94), and L1005 records the same
 * in the modal: "a mobile-override checkbox that DISCLOSES A NESTED SCOPE GROUP".
 *
 * The checkbox is not modelled, because it is not a value. It is the disclosure
 * control for this object, so its state is exactly whether this object is present:
 * `null` is unchecked and an override is checked. Modelling a boolean beside a
 * nullable scope would let a record be checked with no scope and unchecked with one,
 * and a renderer would then need a rule for both.
 */
export const channelPerDeviceNotificationOverrideSchema = z.strictObject(
  {
    /** Which devices the override applies to. One member; see the tuple's note. */
    deviceClass: channelNotificationDeviceClassSchema,

    /** The scope those devices use instead of the channel scope. */
    scope: channelNotificationScopeSchema,
  },
  { error: 'CHANNEL_DEVICE_CLASS_INVALID' satisfies ChannelRejectionCode },
);

/** A member's per-device notification override. */
export type ChannelPerDeviceNotificationOverride = z.infer<
  typeof channelPerDeviceNotificationOverrideSchema
>;

/**
 * One member's own state for one channel, keyed by the pair.
 *
 * THE KEY IS AN OPERAND, NOT A CLAIM, and the distinction is worth stating because
 * it looks like a contradiction of `PROJECT_RULE_R1`. This is a STORED RECORD,
 * and a record keyed by a pair has to name both halves of the pair — the row is
 * meaningless otherwise. What that rule forbids is a REQUEST that names its own
 * actor: no mutation below asks who is acting, and the requests that write these
 * seven fields name the channel alone, because the acting viewer comes from the
 * session and from nowhere a caller can reach. See the note above the
 * membership-scoped operations for the shape-level consequence.
 */
export const channelMembershipSchema = z.strictObject(
  {
    /** Which channel this row is about. Half of the key. */
    channelId: channelIdSchema,

    /**
     * Whose row this is. The other half of the key.
     *
     * A reference to a person, never a copy of one: `S-PII` requires a person be
     * named by their opaque identifier wherever a person must be referenced, and a
     * relation row is exactly such a place.
     */
    memberId: personIdSchema,

    /**
     * ROW 1a — this member's notification scope for this channel (frames 89, 90, 96).
     *
     * Per-member: two members of one channel legitimately hold different values,
     * which L1029 states outright — the notification preference and the starred flag
     * "are per channel AND per member, not global and not properties of the channel".
     * The catalogue's supporting reading is that the modal's scope links out to the
     * workspace-wide settings for the account rather than to a channel-level default
     * (L809, frame 92): this value is that account default's override for this
     * channel.
     */
    notificationScope: channelNotificationScopeSchema,

    /**
     * ROW 1b — whether this member has muted this channel (frames 90, 96).
     *
     * A SEPARATE FIELD FROM THE SCOPE, per L789 and L1004, and separate for a reason
     * that survives the modelling: a muted channel keeps the scope it will return to
     * when the mute is lifted. Fusing the two into a four-member vocabulary would
     * discard that. L1003 records the rendering consequence — muting appends a
     * crossed-bell glyph to the channel name in both the details title and the
     * conversation header (frame 96) — which is per viewer, exactly like the flag.
     */
    muted: z.boolean(),

    /**
     * ROW 2 — this member's per-device override, or `null` where they set none
     * (frames 93, 94).
     */
    perDeviceNotificationOverride: channelPerDeviceNotificationOverrideSchema.nullable(),

    /**
     * ROW 3 — whether this member is notified of thread replies in this channel
     * (frame 92).
     *
     * A per-channel checkbox covering all thread replies in the channel (L791). The
     * THREAD itself, and the per-participant follow state and unread reply count that
     * go with it, are `04-threads.md`'s and sit on that area's own viewer-and-thread
     * relation (`README.md` L365) — a deferred area. This one flag is a channel-scoped
     * notification setting rather than a thread-scoped one, so it belongs here and
     * nothing about a thread is invented here.
     */
    threadReplyNotifications: z.boolean(),

    /**
     * ROW 4 — whether this member has starred this channel (frames 86, 87).
     *
     * Setting it "fills and tints the control and relocates the channel into a
     * starred sidebar group" (L792), and L1001 adds that it raises a transient
     * confirmation naming the destination with an undo link. Both are renderings of
     * this one per-member flag.
     */
    starred: z.boolean(),

    /**
     * ROW 5 — whether this member has joined this channel (frames 125, 133).
     *
     * THE CLEAREST CASE OF THE SIX, in the catalogue's own words: a browser row
     * "renders a check glyph and a joined label for the viewer, and THE SAME ROW
     * CANNOT BE SIMULTANEOUSLY JOINED AND NOT JOINED FOR TWO DIFFERENT PEOPLE"
     * (L809, frames 127, 129).
     *
     * L108 records joining as a PARTIAL CAPTURE — no frame shows a not-yet-joined row
     * being activated or a join confirmation — which per `PROJECT_RULE_R3` is no
     * reason to omit the mechanism: `joinChannelRequestSchema` and
     * `leaveChannelRequestSchema` are both below.
     */
    joined: z.boolean(),

    /**
     * ROW 6 — where this member's own sidebar puts this channel's row (frames 86,
     * 120).
     *
     * See `channelSidebarPlacementSchema`. Per-member because a sidebar is per
     * member: L1027 evidences multi-select with a move-to action over conversation
     * rows, which is one person rearranging their own sidebar and nobody else's.
     */
    sidebarPlacement: channelSidebarPlacementSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** One member's own state for one channel, keyed by the pair. */
export type ChannelMembership = z.infer<typeof channelMembershipSchema>;

/* ===========================================================================
 * The compact projection
 * =========================================================================== */

/**
 * The compact channel shape a list renders from.
 *
 * ONE SHAPE FOR THREE RENDERINGS: a sidebar row, a browser row and a resolved
 * channel-mention chip. L1019 describes the browser row it has to satisfy — "the
 * channel name above one metadata line of an optional joined marker with a check
 * glyph in the accent colour, a member count and the channel's purpose" (frame 125)
 * — and L1022 the archived variant of it: an archive-box glyph, a muted name with an
 * archived suffix, a zero member count and no joined marker (frame 133).
 *
 * SMALL ON PURPOSE, because it is returned by the row. It carries no description, no
 * bookmark, no facepile and no creator: a list of channels that carried each
 * channel's roster would be a bulk disclosure dressed as a list.
 *
 * A PROJECTION, AUTHORIZED INDEPENDENTLY ON EVERY READ PATH THAT PRODUCES IT, per
 * `S-AUTHZ-READ` and L1040 — "recomputed on every render, so a private channel never
 * appears in a browser, a count, a facet or a search result for a viewer who may not
 * read it". A resolved mention chip is the same projection reached by a different
 * route, and `./content.ts`'s channel-mention node says so of itself: whether a
 * reader may see that a channel exists "is decided server-side per `S-AUTHZ-READ`
 * every time the chip is rendered — a private channel stays absent from a projection
 * however it is reached, and a chip is a projection". Producing this shape means the
 * viewer was entitled to it; the shape itself grants nothing and decides nothing.
 */
export const channelSummarySchema = z.strictObject(
  {
    /** The channel, as an opaque reference. */
    id: channelIdSchema,

    /** Which variant of one conversation this row is (frames 110, 552). */
    conversationType: conversationTypeSchema,

    /** The name the row renders (frames 125, 133). */
    name: channelNameSchema,

    /** Public or private — the glyph the row renders is derived from this (frame 128). */
    visibility: channelVisibilitySchema,

    /**
     * The type facet this row falls under (frame 128).
     *
     * DERIVED AT READ TIME AND NOT STORED. See `CHANNEL_TYPES`: public and private
     * come from the visibility, archived from the lifecycle, and external from
     * participation — a fact `22-external-collaboration.md` owns. It is present on
     * this projection because the server is the only party that can compose it, and
     * absent from `channelSchema` because a derived value stored beside its own
     * inputs is a third copy of them waiting to disagree.
     */
    channelType: channelTypeSchema,

    /**
     * Which lifecycle state the row renders (frames 125, 133).
     *
     * The state alone rather than the instant-carrying union: a row renders an
     * archive-box glyph and an archived suffix, and never a date.
     */
    lifecycleState: channelLifecycleStateSchema,

    /** How many members, as an independently authorized count. Zero on an archived row. */
    memberCount: channelMemberCountSchema,

    /** The purpose the metadata line renders, or `null` where none is set. */
    purpose: channelPurposeSchema.nullable(),

    /**
     * Whether THE ACTING VIEWER has joined — the browser row's joined marker (frames
     * 125, 133).
     *
     * NAMED FOR THE VIEWER BECAUSE THAT IS WHAT IT IS, and the name is deliberate.
     * The value is not read from the channel — no such field exists on
     * `channelSchema`, and L1043 forbids one. It is composed at read time from the
     * ACTING SESSION'S OWN `channelMembershipSchema` row, which is what a projection
     * is: a per-viewer answer assembled per viewer. Calling it `joined` here would
     * invite exactly the confusion the six-row marking exists to prevent, since the
     * same row "cannot be simultaneously joined and not joined for two different
     * people" (L809).
     *
     * It is the only per-viewer value on this shape. A sidebar row needs the star and
     * the placement to group itself; it reads those from the viewer's own membership
     * rows rather than from here, so that this projection stays small and stays one
     * thing.
     */
    joinedByViewer: z.boolean(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** The compact channel shape a list renders from. */
export type ChannelSummary = z.infer<typeof channelSummarySchema>;

/* ===========================================================================
 * The event history
 *
 * `02-channels.md` L805 records it as a field of `E-CHANNEL`: "an ordered log of
 * channel events RENDERED AS system message rows" (frames 79, 100, 134, 138). The
 * distinction in that sentence is the whole design. L860 states it plainly — "a
 * system message is an immutable event record, NOT A MESSAGE THE ACTING PERSON
 * AUTHORED … Naming that person is ATTRIBUTION, and it is not the same as
 * authorship" — and L862 makes it a build obligation with two consequences:
 *
 *   - A system event MUST NOT be editable or deletable through the message-editing
 *     path, "or the audit trail becomes user-mutable".
 *   - Provenance must survive the actor: the record "stays intact and still
 *     attributable when the account that caused it is deactivated or removed, which
 *     a FOREIGN-KEY REFERENCE gives and an embedded author name does not".
 *
 * So the event is modelled here, where `E-CHANNEL` owns it, and it holds the actor
 * as a REFERENCE rather than as a person summary. The message ROW that renders it is
 * `./message.ts`'s system-message kind — cross-referenced, never duplicated, per
 * `PROJECT_RULE_R5`. Nothing about a message body, an author line, an emoji response or
 * an edit marker appears below.
 * =========================================================================== */

/** What every channel event carries, whatever kind it is. */
const channelEventBaseShape = {
  /** The event itself, as an opaque reference. */
  id: channelEventIdSchema,

  /** Which channel's history it belongs to. */
  channelId: channelIdSchema,

  /**
   * Who caused it, held as a reference and never as an embedded name.
   *
   * ATTRIBUTION, NOT AUTHORSHIP — see the section note. The reference is what keeps
   * the record attributable after the account is deactivated or removed (L862).
   */
  actorId: personIdSchema,

  /** When it happened. An absolute instant, never an elapsed duration. */
  occurredAt: absoluteInstant,
} as const;

/**
 * One entry in a channel's event history.
 *
 * A discriminated union because the kinds carry different values, and two of them
 * carry values a row quotes verbatim. Six kinds, exactly as `CHANNEL_EVENT_KINDS`
 * enumerates them; a kind's own values are only those the corpus shows its row
 * rendering.
 */
export const channelEventSchema = z.discriminatedUnion(
  'kind',
  [
    /** A person joined by themselves. The actor and the member are the same person (frame 79). */
    z.strictObject(
      {
        kind: z.literal('member-joined'),
        ...channelEventBaseShape,
      },
      { error: 'CHANNEL_EVENT_KIND_INVALID' satisfies ChannelRejectionCode },
    ),

    /**
     * A person was added by another member, "naming who added whom" (L1016, frames
     * 100, 120). The actor added; `memberId` is who was added.
     */
    z.strictObject(
      {
        kind: z.literal('member-added'),
        ...channelEventBaseShape,
        /** Who was added, held as a reference. */
        memberId: personIdSchema,
      },
      { error: 'CHANNEL_EVENT_KIND_INVALID' satisfies ChannelRejectionCode },
    ),

    /**
     * The channel was renamed. The row QUOTES BOTH NAMES (L805, L1016, frame 100), so
     * both are stored: a row rendered from the current name alone could not quote the
     * former one, and L1007 requires a rename to leave every other stored text
     * untouched.
     *
     * L1030 adds a rendering rule that constrains this pair: the prior name is
     * "echoed VERBATIM WITHOUT NORMALISATION". Both values here are the names as they
     * were stored — already canonical, since that is the only form a name is ever
     * stored in — so echoing the stored value IS echoing it verbatim, and no surface
     * re-cases or re-normalises either at render time.
     */
    z.strictObject(
      {
        kind: z.literal('renamed'),
        ...channelEventBaseShape,
        /** The name before the rename, echoed verbatim by the row. */
        previousName: channelNameSchema,
        /** The name after the rename. */
        currentName: channelNameSchema,
      },
      { error: 'CHANNEL_EVENT_KIND_INVALID' satisfies ChannelRejectionCode },
    ),

    /**
     * The description changed. The row QUOTES THE NEW TEXT (L805, L1016, frame 100),
     * so the new value is stored on the event — `null` where the change was a
     * clearing, which the description permits (L1008).
     */
    z.strictObject(
      {
        kind: z.literal('description-changed'),
        ...channelEventBaseShape,
        /** The description as it now reads, quoted by the row. `null` where cleared. */
        description: ContentDocumentSchema.nullable(),
      },
      { error: 'CHANNEL_EVENT_KIND_INVALID' satisfies ChannelRejectionCode },
    ),

    /** The channel was archived (frame 134). */
    z.strictObject(
      {
        kind: z.literal('archived'),
        ...channelEventBaseShape,
      },
      { error: 'CHANNEL_EVENT_KIND_INVALID' satisfies ChannelRejectionCode },
    ),

    /** The channel was unarchived, which L1015 requires to append this entry (frame 138). */
    z.strictObject(
      {
        kind: z.literal('unarchived'),
        ...channelEventBaseShape,
      },
      { error: 'CHANNEL_EVENT_KIND_INVALID' satisfies ChannelRejectionCode },
    ),
  ],
  { error: 'CHANNEL_EVENT_KIND_INVALID' satisfies ChannelRejectionCode },
);

/** One entry in a channel's event history. */
export type ChannelEvent = z.infer<typeof channelEventSchema>;

/* ===========================================================================
 * OPERATIONS
 *
 * One strict object per operation, each citing the flow and the frame NUMBERS that
 * evidence it. Three properties hold of every one of them, and each is enforced by
 * the shapes rather than asserted about them:
 *
 *   1. NO WORKSPACE. Scope comes from the session; see the module note.
 *   2. NO ACTING PRINCIPAL. A request names its TARGET and never its actor.
 *   3. STRICT. An unrecognised field is refused rather than dropped, so neither of
 *      the above can enter by being tolerated at the edge.
 *
 * `02-channels.md` L1039 covers this whole set with one criterion: every channel
 * operation is "authorized server-side at the point of execution against the acting
 * principal's capability for that channel per `S-AUTHZ-OP`, and a request is refused
 * EVEN WHEN THE CLIENT RENDERED THE CONTROL ENABLED, which every capture in this
 * area does". Nothing below is an authorization input, and no absent, hidden or
 * disabled control anywhere in this product exempts any of them from that check.
 *
 * EVERY OPERATION IS SHIPPED, INCLUDING THE ONES WHOSE RESULT THE CORPUS NEVER
 * SHOWS. L108 records joining, leaving and setting a topic as partial captures; L342
 * records that no frame shows the state after archiving is confirmed; L367 the same
 * for deletion. Per `PROJECT_RULE_R3` an unobserved outcome is never permission
 * to omit a mechanism, so each of those operations is here, and the refusal
 * renderings the corpus cannot show are `S-GAP` items drawn from the state matrix in
 * `21-states.md` (L956).
 * =========================================================================== */

/**
 * Create a channel — flow 02.2 / 02.3, frames 58-62.
 *
 * THE TWO-STEP WIZARD, AND ONLY THE TWO STEPS. L981 describes the shape: a two-step
 * wizard with a step-of-total label, a back action on step 2 and a terminal create
 * action. Step 1 takes the name (frames 58, 59) and step 2 the visibility (frames
 * 60, 61) — so those are the two fields, and nothing else is submitted with them.
 *
 * VISIBILITY DEFAULTS AND THE NAME DOES NOT. L984 carries it as a criterion: step 2
 * "arrives with public pre-selected", and L164 draws the matching inference from the
 * control states — "the channel name is required and the visibility choice is not,
 * because the forward action is muted while the field is empty and filled once a
 * name is present, whereas step 2 arrives with a visibility already selected and no
 * muted state at any point". The default is `DEFAULT_CHANNEL_VISIBILITY`, imported
 * rather than written, and it is an INVARIANT rather than a configurable default:
 * `../config/constants.ts` gives the reason — an environment that flipped it would
 * silently change which conversations are discoverable by default in that
 * deployment.
 *
 * THE ADD-PEOPLE STEP IS NOT PART OF THIS REQUEST. L985 records that creating a
 * channel "opens it immediately and presents an add-people step whose terminal action
 * CAN BE SKIPPED, leaving a usable one-member channel", and L166 infers it is a
 * distinct step rather than part of the wizard "because the channel is already
 * created and open behind it and the wizard's step label is gone". So membership
 * arrives through `addChannelMembersRequestSchema` below, and a channel created and
 * never added to is a complete outcome rather than a half-finished one.
 *
 * THE PRIVATE PATH'S EXTERNAL-INVITE AFFORDANCE IS NOT MODELLED HERE. Steps 6-11 of
 * flow 02.2 escalate into an organisation-classification dialog, a channel-permissions
 * choice, a confirmation carrying an optional note and a success dialog (frames
 * 63-68). That flow's own closing note assigns all three concepts — the organisation,
 * the channel-scoped external invitation and its permission level — to
 * `22-external-collaboration.md`, and L824 places the per-channel permission level on
 * `E-EXTERNAL-ORG` rather than on the channel. Both areas are deferred and both
 * concepts are owned elsewhere, so this module cross-references them and declares
 * neither: declaring either here would be a second implementation of another
 * module's contract, and inventing a shape for a deferred surface besides.
 */
export const createChannelRequestSchema = z.strictObject(
  {
    /** The name, under the imported rule. See `channelNameSchema`. */
    name: channelNameSchema,

    /** Public or private, arriving on the imported pre-selected default. */
    visibility: channelVisibilitySchema.default(DEFAULT_CHANNEL_VISIBILITY),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Create a channel. */
export type CreateChannelRequest = z.infer<typeof createChannelRequestSchema>;

/** Create a channel, as a caller writes one before the visibility default is applied. */
export type CreateChannelRequestInput = z.input<typeof createChannelRequestSchema>;

/**
 * Rename a channel — flow 02.6, frames 97-100.
 *
 * A NAME AND NOTHING ELSE, AND THE OMISSION IS THE CONTRACT. L1007 carries it as a
 * criterion: a rename updates the name everywhere it is rendered — sidebar row,
 * conversation header, modal title, channel-name row — "and DOES NOT rewrite the
 * description or any message text that contains the former name" (frames 99, 100).
 * L784 states the same from the field's side. A request that could carry a
 * description would be a request that could rewrite one, so this one cannot: the
 * description has an operation of its own, and the two are separate requests because
 * they are separate acts.
 *
 * The dialog "opens pre-filled with the current name and a disabled save action, and
 * enables it only once the value changes" (L1006, frames 97, 98). That is a
 * rendering. Whether the submitted name differs from the stored one is not a
 * validation rule here — a rename to the same name is a no-op the server resolves,
 * not a malformed request — and the disabled action is not an authorization.
 */
export const renameChannelRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,

    /** The new name, under the imported rule. */
    name: channelNameSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Rename a channel. */
export type RenameChannelRequest = z.infer<typeof renameChannelRequestSchema>;

/**
 * Set or clear a channel's topic — flow 02.6, frames 81, 104.
 *
 * `null` CLEARS AND AN ABSENT FIELD IS REFUSED. See
 * `setChannelDescriptionRequestSchema` for the reasoning, which is identical and is
 * written out once there.
 *
 * L108 records this journey as a partial capture — the row renders an empty
 * placeholder with an inline Edit control, but no frame shows the editor or a
 * populated value. The operation exists regardless, per `PROJECT_RULE_R3`.
 */
export const setChannelTopicRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,

    /** The new topic, or `null` to clear it. Absent is refused, not treated as clear. */
    topic: channelTopicSchema.nullable(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Set or clear a channel's topic. */
export type SetChannelTopicRequest = z.infer<typeof setChannelTopicRequestSchema>;

/**
 * Set or clear a channel's description — flow 02.6, frames 102, 103.
 *
 * CLEARING IS AN ACT, AND THIS SHAPE MAKES IT A DISTINGUISHABLE ONE. L1008 carries
 * the requirement: the dialog "accepts rich text containing channel mentions and
 * PERMITS AN EMPTY VALUE, keeping its save action enabled when the textarea is
 * cleared". So a person can deliberately remove a description, and the contract has
 * to be able to tell that apart from a request that says nothing about the
 * description at all.
 *
 * The field is therefore NULLABLE AND REQUIRED, which resolves both cases with one
 * shape and no ambiguity:
 *
 *   - a document        → set the description to it
 *   - `null`            → CLEAR it, deliberately
 *   - the field absent  → REFUSED, because the request did not say
 *
 * The third line is what the strict object buys. A stripping object would let a
 * caller who meant to clear and mis-spelled the field believe they had cleared it,
 * and a schema that treated absence as clearing would delete a description on any
 * request that forgot to mention one. Neither failure is recoverable from the wire,
 * so neither is representable.
 *
 * `ContentDocumentSchema` and not a local rich shape, per `PROJECT_RULE_R5`.
 * That schema REJECTS rather than sanitising, which is what a mutation needs: it is
 * the path by which a principal submits content, and content arriving from inside
 * the product carries the identical contract.
 */
export const setChannelDescriptionRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,

    /** The new description, or `null` to clear it. Absent is refused; see above. */
    description: ContentDocumentSchema.nullable(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Set or clear a channel's description. */
export type SetChannelDescriptionRequest = z.infer<typeof setChannelDescriptionRequestSchema>;

/**
 * Set or clear a channel's purpose — frames 125, 133.
 *
 * `null` clears; an absent field is refused. See `setChannelDescriptionRequestSchema`.
 *
 * NO FRAME SHOWS THE PURPOSE BEING EDITED. The value is observed only where a browser
 * row renders it (L800), so this operation is the mechanism behind an observed field
 * rather than a captured journey — which per `PROJECT_RULE_R3` is a reason to
 * ship it, not a reason to leave the field unwritable. Registered in
 * `docs/decisions/gap-register.md`.
 */
export const setChannelPurposeRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,

    /** The new purpose, or `null` to clear it. Absent is refused. */
    purpose: channelPurposeSchema.nullable(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Set or clear a channel's purpose. */
export type SetChannelPurposeRequest = z.infer<typeof setChannelPurposeRequestSchema>;

/**
 * Set a channel's visibility — flow 02.8, frames 107, 108.
 *
 * SETS A VISIBILITY; IT DOES NOT CONVERT ONE WAY. L785 records the pair as
 * "convertible in BOTH DIRECTIONS afterwards" and L1011 carries the reversibility as
 * a criterion — the conversion "INVERTS THE ROW'S OWN LABEL so the conversion is
 * reversible". A one-way make-private operation would contradict both, and would
 * have to be joined by a second operation to undo it; one operation over the
 * imported pair reaches every state.
 *
 * The confirmation the surface raises before this — "a confirmation listing both
 * stated consequences" (L1011) — is a rendering and carries no field here. It is a
 * second signal of intent, never the authorization: who may convert a channel is
 * decided server-side per `S-AUTHZ-OP`.
 */
export const setChannelVisibilityRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,

    /** The visibility to set. Both members of the imported pair are reachable. */
    visibility: channelVisibilitySchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Set a channel's visibility. */
export type SetChannelVisibilityRequest = z.infer<typeof setChannelVisibilityRequestSchema>;

/**
 * Set a channel's auto-add-on-join flag — frames 72, 73.
 *
 * ITS OWN OPERATION, BECAUSE L952 NAMES IT AS ONE. That build obligation enumerates
 * the operations authorized server-side against the acting principal and includes
 * "changing the auto-add flag" among them, so the mechanism is required rather than
 * optional.
 *
 * SEPARATE FROM ADD-MEMBERS, THOUGH ONE MODAL RENDERS BOTH. L986 records the toggle
 * rendering inside the add-people modal, "inside a bordered group annotated as
 * visible only to administrators" (frame 72). That is a rendering of two settings on
 * one surface, and the catalogue is consistent that a rendering is not a placement.
 * Keeping the operations separate keeps one server-side policy decision per act:
 * adding people and changing what the workspace does to future joiners are different
 * acts with different audiences, and a compound payload would let one authorization
 * check answer for both.
 *
 * ADMINISTERED, NOT PERSONAL — see `channelSchema.autoAddOnJoin`, which is where the
 * field lives and why it is not on the membership relation.
 */
export const setChannelAutoAddOnJoinRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,

    /** Whether joining the workspace adds a person to this channel. */
    autoAddOnJoin: z.boolean(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Set a channel's auto-add-on-join flag. */
export type SetChannelAutoAddOnJoinRequest = z.infer<typeof setChannelAutoAddOnJoinRequestSchema>;

/**
 * Archive a channel — flow 02.8, frames 109, 134.
 *
 * A CHANNEL AND NOTHING ELSE. The confirmation "listing all three stated consequences
 * plus the closing note about search and reversibility" (L1012, frame 109) is a
 * rendering; unlike the deletion dialog it gates nothing, so no acknowledgement is
 * carried here. L342 records that no frame shows the state immediately after
 * archiving is confirmed — the archived channel flow 02.12 reads is a separate
 * capture session — so the outcome is a partial capture and the operation ships
 * regardless.
 *
 * WHAT ARCHIVING DOES NOT DO is as much a part of this contract as what it does.
 * L444 is a build obligation: archiving "changes what may be WRITTEN to a channel and
 * changes nothing about who may READ it, per `S-AUTHZ-READ`. A private channel that
 * is archived stays private, and the read-only bar is not a signal that authorization
 * has changed." See `channelLifecycleSchema` for the rendering consequences, and note
 * in particular that the composer is REPLACED rather than disabled.
 */
export const archiveChannelRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Archive a channel. */
export type ArchiveChannelRequest = z.infer<typeof archiveChannelRequestSchema>;

/**
 * Unarchive a channel — flow 02.12, frame 138.
 *
 * The reverse of archiving, and reversal is ONE MOVEMENT. L1015 carries it as a
 * criterion: unarchiving "restores the composer, the bookmark row, the member count,
 * the huddle control and the hash glyph, and appends an unarchive entry to the
 * channel's event history". Every removed affordance returns together — there is no
 * partially-unarchived state — and the event entry is the `unarchived` kind above.
 * It is offered from the Settings tab, which on an archived channel holds exactly
 * unarchive and delete (L1014, frame 137).
 */
export const unarchiveChannelRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Unarchive a channel. */
export type UnarchiveChannelRequest = z.infer<typeof unarchiveChannelRequestSchema>;

/**
 * Delete a channel — flow 02.9, frames 111, 112.
 *
 * THE ACKNOWLEDGEMENT IS IN THE CONTRACT, NOT ONLY IN THE DIALOG. L1013 carries the
 * gate as a criterion: deleting "requires a confirmation that states irreversibility
 * in bold, offers archiving as an inline alternative, and KEEPS ITS DESTRUCTIVE
 * ACTION DISABLED UNTIL AN ACKNOWLEDGEMENT CHECKBOX IS TICKED", and L799 records the
 * same from the field's side. A gate that lives only in the dialog is a gate any
 * caller bypasses by not opening the dialog, so it is expressed here as a required
 * literal: `false` is refused and an absent field is refused, and the only accepted
 * value is the one that could not have been sent by accident.
 *
 * IT IS A SECOND SIGNAL OF INTENT AND NOT AN AUTHORIZATION. L952 is explicit —
 * "the ticked checkbox is a second signal of intent, NEVER the authorization" — so
 * whether this principal may delete this channel is decided server-side per
 * `S-AUTHZ-OP`, exactly as it would be if no acknowledgement existed.
 *
 * TERMINAL, AND DISTINCT FROM ARCHIVING. L799 records deletion as "a terminal
 * lifecycle state, DISTINGUISHED FROM ARCHIVING in the dialog's own copy". L367
 * records that no frame shows the state after deletion is confirmed, so what replaces
 * the channel in the content region is unobserved and is not claimed here.
 */
export const deleteChannelRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,

    /**
     * The acknowledgement, which must be present and must be `true`.
     *
     * A literal rather than a boolean, so the only value that parses is the one a
     * person had to act to produce. See the note above.
     */
    acknowledged: z.literal(true, {
      error: 'CHANNEL_DELETE_ACKNOWLEDGEMENT_REQUIRED' satisfies ChannelRejectionCode,
    }),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Delete a channel. */
export type DeleteChannelRequest = z.infer<typeof deleteChannelRequestSchema>;

/* ===========================================================================
 * Membership operations, in two visibly distinct shapes
 *
 * THE DISTINCTION IS THE POINT OF THIS SECTION, and it is the shape-level form of
 * `PROJECT_RULE_R1`'s prohibition on resting a decision on a caller-supplied
 * actor.
 *
 *   - A request that changes ANOTHER PERSON'S membership NAMES THAT PERSON. They are
 *     the operand — the thing being added or removed — so naming them is what the
 *     request is for. `addChannelMembersRequestSchema` and
 *     `removeChannelMemberRequestSchema` are these.
 *
 *   - A request that changes THE ACTING VIEWER'S OWN membership NAMES THE CHANNEL AND
 *     NOTHING ELSE. Not one of them carries a person, because the person is the
 *     session: a field for it would be a field a caller could fill with somebody
 *     else's identifier, and a server that read it would be resting a decision on a
 *     caller-supplied actor. Every join, leave, notification, mute, override,
 *     thread-reply, star and placement request below is one of these.
 *
 * Both shapes are authorized identically: server-side, at the point of execution,
 * against the acting session and the specific target object. The difference is that
 * the first kind has two things to check and the second has one.
 * =========================================================================== */

/**
 * Add people to a channel — flow 02.3, frames 72-75.
 *
 * TWO BRANCHES, AS A DISCRIMINATED UNION. L986 records the pair: the modal "offers
 * add-all-workspace-members and add-specific-people as a radio pair" (frame 72), and
 * L820 records what the first branch means for the model — the modal "offers THE
 * ENTIRE WORKSPACE MEMBERSHIP AS A SINGLE SELECTABLE UNIT rather than requiring
 * individual selection, alongside the per-person alternative".
 *
 * A UNION RATHER THAN AN OPTIONAL LIST, because the two branches are different
 * requests. An optional list would make "add everyone" and "add nobody" the same
 * payload — an empty list — which is precisely the request that must not silently
 * mean everyone. Here the whole-workspace branch carries no list at all and cannot be
 * confused with an empty one, and the per-person branch requires at least one person,
 * so a request that names nobody is refused instead of being interpreted.
 *
 * THE WHOLE-WORKSPACE BRANCH IS A REQUEST, NOT A CAPABILITY. It names an intent — add
 * the current workspace membership — and the server resolves that intent against its
 * own view of the workspace and the acting principal's capability. It does not carry
 * a roster, so it cannot assert who is in the workspace; and it names no workspace,
 * so it cannot assert which one.
 *
 * THE WORKSPACE RESTRICTION IS SERVER-SIDE AND IS NOT A FIELD. L986 records that the
 * modal "states in a tinted notice that only people already in the workspace may be
 * added", and L819 assigns that restriction to `E-WORKSPACE`. It is an authorization
 * rule the server enforces against each target, per `S-AUTHZ-OP` — not a claim a
 * caller makes and not a flag a caller sets. The notice's wording is authored
 * microcopy and lives in the copy module, not here.
 *
 * THE TERMINAL ACTION'S LABEL IS DERIVED FROM FORM STATE (L987, frames 72-75) — a
 * completion action for add-all, a skip action for add-specific while empty, disabled
 * while a query is uncommitted, an add action once a chip exists. All four are
 * renderings of a client-side form; none is a value, and none of them is an
 * authorization.
 *
 * ADDING AN ADDRESS THAT MATCHES NOBODY IS A DIFFERENT JOURNEY ENTIRELY. L989 records
 * it escalating into the organisation-classification sequence (frames 65-68), which
 * `22-external-collaboration.md` owns and which produces an invitation rather than a
 * membership. So this request admits person references only: an email address here
 * would be this module inventing a deferred area's contract.
 */
export const addChannelMembersRequestSchema = z.discriminatedUnion(
  'mode',
  [
    z.strictObject(
      {
        mode: z.literal('all-workspace-members'),

        /** Which channel. */
        channelId: channelIdSchema,
      },
      { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
    ),
    z.strictObject(
      {
        mode: z.literal('specific-people'),

        /** Which channel. */
        channelId: channelIdSchema,

        /**
         * Whom to add, as references. At least one, and no more than the bound.
         *
         * TARGETS, NOT AN ACTOR. Every identifier here is somebody being added; the
         * person doing the adding is the session. Each target is authorized on its
         * own terms, so a request naming several people is not one decision.
         */
        memberIds: z
          .array(personIdSchema, {
            error: 'CHANNEL_MEMBER_SELECTION_INVALID' satisfies ChannelRejectionCode,
          })
          .min(1, { error: 'CHANNEL_MEMBER_SELECTION_INVALID' satisfies ChannelRejectionCode })
          .max(CHANNEL_ADD_MEMBERS_MAX, {
            error: 'CHANNEL_MEMBER_SELECTION_INVALID' satisfies ChannelRejectionCode,
          })
          .readonly(),
      },
      { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
    ),
  ],
  { error: 'CHANNEL_ADD_MEMBERS_MODE_INVALID' satisfies ChannelRejectionCode },
);

/** Add people to a channel. */
export type AddChannelMembersRequest = z.infer<typeof addChannelMembersRequestSchema>;

/**
 * Remove a person from a channel — flow 02.7, frames 105, 106.
 *
 * NAMES ITS TARGET, WHICH IS WHAT MAKES IT THE OTHER SHAPE. One person per request:
 * L1009 records a confirmation "whose title names both the member and the channel"
 * (frame 105), which is one member, and each removal is one authorization decision
 * about one target.
 *
 * ONE'S OWN ROW IS NOT REMOVABLE HERE, AND THAT IS NOT ENFORCED BY THIS SHAPE. L997
 * records a remove control on every row "EXCEPT the signed-in user's own", and L924
 * that the own row carries no remove control in every capture (frames 82, 106, 120).
 * That is a rendering derived at render time, and `channelSchema.facepile` explains
 * why nothing stores it. The server still checks: an absent control exempts nothing,
 * so a request naming the acting principal is refused by the policy rather than by
 * the parser. Leaving a channel voluntarily is `leaveChannelRequestSchema`, which is a
 * different act with a different authorization.
 *
 * The confirmation, its explanatory body and its destructive action (L1009) are
 * renderings. After the removal "the Members tab's count, the tab label and the
 * header's member count all decrement together, and the removed person's
 * direct-message conversation is unaffected" (L1010, frame 106) — the counts move
 * because each is a projection recomputed on the next render, not because anything
 * here decrements a stored counter.
 */
export const removeChannelMemberRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,

    /** Whom to remove, as a reference. The TARGET; see the section note. */
    memberId: personIdSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Remove a person from a channel. */
export type RemoveChannelMemberRequest = z.infer<typeof removeChannelMemberRequestSchema>;

/**
 * Join a channel — frames 125, 129.
 *
 * NAMES THE CHANNEL ALONE. The joiner is the session, per the section note.
 *
 * L108 records this as a partial capture: the browser's rows carry a joined marker
 * and open a channel, "but no frame shows a not-yet-joined row being activated or a
 * join confirmation". Per `PROJECT_RULE_R3` that is an open work item rather
 * than permission to omit the mechanism — the joined marker on the membership relation
 * is meaningless without an operation that sets it, and a browser that lists channels
 * a viewer has not joined is meaningless without one too. Whether a confirmation is
 * raised is a rendering decision recorded in `docs/decisions/gap-register.md`.
 */
export const joinChannelRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Join a channel. */
export type JoinChannelRequest = z.infer<typeof joinChannelRequestSchema>;

/**
 * Leave a channel — frame 81.
 *
 * NAMES THE CHANNEL ALONE. The leaver is the session — which is also what distinguishes
 * this from `removeChannelMemberRequestSchema`, whose target is somebody else and whose
 * authorization is a different question.
 *
 * L108 records this as a partial capture: "the destructive leave action is present on
 * the About tab but no frame shows it activated, so whether it raises a confirmation
 * is not observable". The operation ships; the confirmation is a rendering decision
 * recorded in `docs/decisions/gap-register.md`. L1014 notes that the leave row is one
 * of the affordances the archived state removes.
 */
export const leaveChannelRequestSchema = z.strictObject(
  {
    /** Which channel. */
    channelId: channelIdSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Leave a channel. */
export type LeaveChannelRequest = z.infer<typeof leaveChannelRequestSchema>;

/**
 * Set the acting viewer's notification scope for a channel — flow 02.5, frames 89-92.
 *
 * NO MEMBER IDENTIFIER, AND ITS ABSENCE IS THE WHOLE POINT. This writes one field of
 * one row of the membership relation — the row keyed by this channel and THE ACTING
 * SESSION. A member identifier here would let a caller set somebody else's
 * notification preference, which is both an unauthorized write and a disclosure that
 * the setting exists; and a server that trusted the field would be resting the
 * decision on a caller-supplied actor. So the field does not exist, and the same is
 * true of every request in this group.
 *
 * L260 records that "the four dropdown choices and the modal's radio group are one
 * setting rendered twice", so both surfaces write this one field. The scope and the
 * mute are two fields and therefore two operations; see
 * `setChannelMuteRequestSchema`.
 */
export const setChannelNotificationScopeRequestSchema = z.strictObject(
  {
    /** Which channel. The viewer comes from the session; see above. */
    channelId: channelIdSchema,

    /** The scope to set. One of three; the mute is separate. */
    notificationScope: channelNotificationScopeSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Set the acting viewer's notification scope for a channel. */
export type SetChannelNotificationScopeRequest = z.infer<
  typeof setChannelNotificationScopeRequestSchema
>;

/**
 * Mute or unmute a channel for the acting viewer — flow 02.5, frames 90, 96.
 *
 * NO MEMBER IDENTIFIER; see `setChannelNotificationScopeRequestSchema`.
 *
 * ITS OWN OPERATION BECAUSE IT IS ITS OWN FIELD. L1004 records the menu carrying the
 * three scopes "plus a SEPARATED mute entry with its own explanation", and L1005 the
 * modal carrying "a mute checkbox with its explanation" beside the scope group. Muting
 * therefore does not discard the scope: unmuting returns the channel to whatever scope
 * it held, which a fused four-member setting could not have remembered.
 */
export const setChannelMuteRequestSchema = z.strictObject(
  {
    /** Which channel. The viewer comes from the session. */
    channelId: channelIdSchema,

    /** Whether this viewer has muted this channel. */
    muted: z.boolean(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Mute or unmute a channel for the acting viewer. */
export type SetChannelMuteRequest = z.infer<typeof setChannelMuteRequestSchema>;

/**
 * Set or clear the acting viewer's per-device notification override — frames 93, 94.
 *
 * NO MEMBER IDENTIFIER; see `setChannelNotificationScopeRequestSchema`.
 *
 * `null` clears the override, which is the unchecked state of the disclosing checkbox;
 * an absent field is refused rather than read as clearing, for the reason
 * `setChannelDescriptionRequestSchema` sets out.
 */
export const setChannelPerDeviceNotificationOverrideRequestSchema = z.strictObject(
  {
    /** Which channel. The viewer comes from the session. */
    channelId: channelIdSchema,

    /** The override to apply, or `null` to remove it. Absent is refused. */
    perDeviceNotificationOverride: channelPerDeviceNotificationOverrideSchema.nullable(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Set or clear the acting viewer's per-device notification override. */
export type SetChannelPerDeviceNotificationOverrideRequest = z.infer<
  typeof setChannelPerDeviceNotificationOverrideRequestSchema
>;

/**
 * Set the acting viewer's thread-reply notification flag for a channel — frame 92.
 *
 * NO MEMBER IDENTIFIER; see `setChannelNotificationScopeRequestSchema`. Channel-scoped
 * rather than thread-scoped: L791 records "a per-channel checkbox covering ALL thread
 * replies in the channel". Per-thread follow state belongs to a deferred area's own
 * relation and is not touched here.
 */
export const setChannelThreadReplyNotificationsRequestSchema = z.strictObject(
  {
    /** Which channel. The viewer comes from the session. */
    channelId: channelIdSchema,

    /** Whether this viewer is notified of thread replies in this channel. */
    threadReplyNotifications: z.boolean(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Set the acting viewer's thread-reply notification flag for a channel. */
export type SetChannelThreadReplyNotificationsRequest = z.infer<
  typeof setChannelThreadReplyNotificationsRequestSchema
>;

/**
 * Star or unstar a channel for the acting viewer — flow 02.4, frames 86, 87.
 *
 * NO MEMBER IDENTIFIER; see `setChannelNotificationScopeRequestSchema`. L1029 states
 * the placement outright: the starred flag is "per channel AND per member, not global
 * and not [a property] of the channel", so this writes one row and moves one sidebar.
 *
 * Starring "relocates the channel into a starred sidebar group" (L792). That relocation
 * is the consequence a read composes from this flag plus the viewer's placement; the
 * placement has its own operation below for the case where a member moves a row
 * deliberately.
 */
export const setChannelStarRequestSchema = z.strictObject(
  {
    /** Which channel. The viewer comes from the session. */
    channelId: channelIdSchema,

    /** Whether this viewer has starred this channel. */
    starred: z.boolean(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Star or unstar a channel for the acting viewer. */
export type SetChannelStarRequest = z.infer<typeof setChannelStarRequestSchema>;

/**
 * Move a channel's row within the acting viewer's own sidebar — frames 86, 120.
 *
 * NO MEMBER IDENTIFIER; see `setChannelNotificationScopeRequestSchema`. A sidebar
 * belongs to one person, and this moves that person's row and nobody else's — which
 * L1027's multi-select with its move-to action is the surface for.
 */
export const setChannelSidebarPlacementRequestSchema = z.strictObject(
  {
    /** Which channel. The viewer comes from the session. */
    channelId: channelIdSchema,

    /** Where to put its row. See `channelSidebarPlacementSchema`. */
    sidebarPlacement: channelSidebarPlacementSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Move a channel's row within the acting viewer's own sidebar. */
export type SetChannelSidebarPlacementRequest = z.infer<
  typeof setChannelSidebarPlacementRequestSchema
>;

/* ===========================================================================
 * Bookmark operations — flow 02.13, frames 257-266
 *
 * SHARED, NOT PER-VIEWER. Apply `S-PERUSER`'s test: two members opening the same
 * conversation could not legitimately see different bookmark bars, because the bar
 * is the channel's and L948's obligation describes it as the team's shared shortcut
 * set. So these operations write the channel, are authorized per `S-AUTHZ-OP` — L952
 * lists bookmarking among the operations it covers — and none of them touches the
 * membership relation.
 *
 * THE ADDRESS IS UNTRUSTED INPUT ON EVERY ONE OF THEM. `./content.ts`'s destination
 * schema is what enforces `S-LINK`: canonical parse, the two-scheme allowlist,
 * executing and local-state schemes REJECTED AT INPUT rather than avoided at render.
 * No second address rule is declared here, per `PROJECT_RULE_R5`.
 * =========================================================================== */

/**
 * Add a bookmark to a conversation — frames 258-261.
 *
 * THE ADDRESS IS REQUIRED AND THE NAME IS NOT, which is what the dialog's progressive
 * disclosure shows: it opens with a Link field and "NO FOOTER ACTIONS WHATEVER" (L481,
 * frame 258), and entering an address reveals both the Name field and the footer with
 * its add action already primary (L482, frame 259). So the address gates the operation
 * and the name does not.
 *
 * A FOLDER MAY BE NAMED AT CREATION. L493 records that whether a bookmark "moves into
 * a folder, is created inside it, or the captures come from divergent sessions is NOT
 * DETERMINABLE FROM THE PIXELS", and per `PROJECT_RULE_R2` that contradiction is
 * referenced rather than resolved — it is recorded in
 * `docs/decisions/catalog-defects.md`. This contract therefore supports both readings
 * without asserting either: a folder may be named here, and
 * `moveChannelBookmarkToFolderRequestSchema` moves an existing one.
 */
export const createChannelBookmarkRequestSchema = z.strictObject(
  {
    /** Which conversation's bar. */
    channelId: channelIdSchema,

    /** Where it goes. Required; canonically parsed and scheme-restricted. */
    destination: ContentLinkDestinationSchema,

    /** What the chip reads. Optional — see the note above. */
    name: ContentLinkLabelSchema.optional(),

    /** The leading glyph, as a functional identifier. Optional. */
    glyph: channelBookmarkGlyphSchema.optional(),

    /** The folder to create it in. Optional; absent leaves it on the bar. */
    folderId: channelBookmarkFolderIdSchema.optional(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Add a bookmark to a conversation. */
export type CreateChannelBookmarkRequest = z.infer<typeof createChannelBookmarkRequestSchema>;

/**
 * Change a bookmark — frames 259, 261.
 *
 * A PARTIAL UPDATE, AND THE THREE-WAY DISTINCTION IS DELIBERATE on the two fields
 * that can legitimately be empty:
 *
 *   - the field absent            → leave it as it is
 *   - the field present as `null` → clear it
 *   - the field present with a value → set it
 *
 * The destination has no `null` case, because a bookmark without an address is not a
 * bookmark — the dialog withholds its whole footer until one is present (frame 258).
 *
 * A REQUEST THAT NAMES NO CHANGE IS REFUSED rather than treated as a no-op. A caller
 * who mis-spells the one field they meant to change would otherwise get a success
 * back for having changed nothing, which is the failure mode the strict object exists
 * to prevent — and the same reasoning applies to a request that spells everything
 * correctly and says nothing.
 */
export const updateChannelBookmarkRequestSchema = z
  .strictObject(
    {
      /** Which conversation's bar. */
      channelId: channelIdSchema,

      /** Which bookmark. */
      bookmarkId: channelBookmarkIdSchema,

      /** A new address. Absent leaves it unchanged; it has no cleared form. */
      destination: ContentLinkDestinationSchema.optional(),

      /** A new name, or `null` to clear it. Absent leaves it unchanged. */
      name: ContentLinkLabelSchema.nullable().optional(),

      /** A new glyph, or `null` to clear it. Absent leaves it unchanged. */
      glyph: channelBookmarkGlyphSchema.nullable().optional(),
    },
    { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
  )
  .refine(
    (request) =>
      request.destination !== undefined ||
      request.name !== undefined ||
      request.glyph !== undefined,
    { error: 'CHANNEL_UPDATE_EMPTY' satisfies ChannelRejectionCode },
  );

/** Change a bookmark. */
export type UpdateChannelBookmarkRequest = z.infer<typeof updateChannelBookmarkRequestSchema>;

/** Remove a bookmark from a conversation — frame 261. */
export const deleteChannelBookmarkRequestSchema = z.strictObject(
  {
    /** Which conversation's bar. */
    channelId: channelIdSchema,

    /** Which bookmark. */
    bookmarkId: channelBookmarkIdSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Remove a bookmark from a conversation. */
export type DeleteChannelBookmarkRequest = z.infer<typeof deleteChannelBookmarkRequestSchema>;

/**
 * Move a bookmark into a folder, or out onto the bar — frames 264, 266.
 *
 * `null` MOVES IT OUT, a folder identifier moves it in, and an absent field is refused
 * because a move that names no destination is not a move. A bookmark is in at most one
 * folder, which `channelBookmarkSchema.folderId` holds by construction.
 *
 * Its own operation rather than a field of the update above, because it is a different
 * act: the update changes what a bookmark IS and this changes where it SITS. L493's
 * unresolved question about how a bookmark comes to be inside a folder is referenced
 * there and is supported both ways.
 */
export const moveChannelBookmarkToFolderRequestSchema = z.strictObject(
  {
    /** Which conversation's bar. */
    channelId: channelIdSchema,

    /** Which bookmark. */
    bookmarkId: channelBookmarkIdSchema,

    /** The folder to move it into, or `null` to move it onto the bar. Absent is refused. */
    folderId: channelBookmarkFolderIdSchema.nullable(),
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Move a bookmark into a folder, or out onto the bar. */
export type MoveChannelBookmarkToFolderRequest = z.infer<
  typeof moveChannelBookmarkToFolderRequestSchema
>;

/**
 * Create a bookmark folder — frames 262, 263.
 *
 * THE NAME IS REQUIRED, and the frame that suggests otherwise is a rendering — see
 * `channelBookmarkFolderSchema`, where the reasoning and its gap-register entry are
 * recorded.
 */
export const createChannelBookmarkFolderRequestSchema = z.strictObject(
  {
    /** Which conversation's bar. */
    channelId: channelIdSchema,

    /** What the chip will read. */
    name: channelBookmarkFolderNameSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Create a bookmark folder. */
export type CreateChannelBookmarkFolderRequest = z.infer<
  typeof createChannelBookmarkFolderRequestSchema
>;

/**
 * Rename a bookmark folder — frames 264, 265, 266.
 *
 * NO FRAME SHOWS A FOLDER BEING RENAMED. The mechanism ships regardless, per
 * `PROJECT_RULE_R3`: a named container whose name cannot be corrected is a
 * container that has to be deleted and rebuilt to fix a typo, which is not the
 * smallest coherent behaviour beside an evidenced channel rename.
 *
 * L493 records that the folder chip's label "renders with different capitalisation at
 * [frame 266] than at [frame 264] and [frame 265]". That inconsistency is referenced
 * rather than reconciled, per `PROJECT_RULE_R2`; it is recorded in
 * `docs/decisions/catalog-defects.md`, and nothing here normalises a folder's case to
 * make the captures agree.
 */
export const renameChannelBookmarkFolderRequestSchema = z.strictObject(
  {
    /** Which conversation's bar. */
    channelId: channelIdSchema,

    /** Which folder. */
    folderId: channelBookmarkFolderIdSchema,

    /** What the chip will read. */
    name: channelBookmarkFolderNameSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Rename a bookmark folder. */
export type RenameChannelBookmarkFolderRequest = z.infer<
  typeof renameChannelBookmarkFolderRequestSchema
>;

/**
 * Delete a bookmark folder — frames 264, 265.
 *
 * NO FRAME SHOWS A FOLDER BEING DELETED, and in particular none shows what becomes of
 * the bookmarks inside one. The mechanism ships, per `PROJECT_RULE_R3`, and the
 * question the corpus leaves open is answered where it belongs: a bookmark's folder
 * reference is nullable, so a bookmark can outlive its folder by returning to the bar,
 * which is the smallest coherent behaviour and does not destroy a value the person did
 * not ask to destroy. Registered in `docs/decisions/gap-register.md`.
 *
 * NO ACKNOWLEDGEMENT FIELD. Unlike channel deletion, no capture gates this behind one,
 * and a gate is not invented where none is evidenced — the acknowledgement on
 * `deleteChannelRequestSchema` is there because L1013 requires it.
 */
export const deleteChannelBookmarkFolderRequestSchema = z.strictObject(
  {
    /** Which conversation's bar. */
    channelId: channelIdSchema,

    /** Which folder. */
    folderId: channelBookmarkFolderIdSchema,
  },
  { error: 'CHANNEL_REQUEST_MALFORMED' satisfies ChannelRejectionCode },
);

/** Delete a bookmark folder. */
export type DeleteChannelBookmarkFolderRequest = z.infer<
  typeof deleteChannelBookmarkFolderRequestSchema
>;

/* ===========================================================================
 * READ PATHS
 *
 * Both are projections and both are authorized independently, per `S-AUTHZ-READ` and
 * L1040. Neither offers a field by which a caller could widen its own scope.
 * =========================================================================== */

/**
 * Browse channels — flow 02.11, frames 124-133.
 *
 * EXTENDS THE KEYSET REQUEST RATHER THAN RESTATING IT, on `./pagination.ts`'s own
 * instruction: "A route with filters of its own EXTENDS this schema rather than
 * restating it … so a channel browse can add its own scope and sort filters without
 * acquiring a second opinion about page size." So the cursor, the page size and the
 * direction arrive with their bounds and their defaults already decided, and the four
 * fields below are all this route adds.
 *
 * THERE IS NO NUMBERED POSITION IN THIS CONTRACT, and extending a strict object is
 * what keeps it out: an offset or a page number is refused rather than dropped, so it
 * cannot enter by being tolerated at the edge. That matters here more than on most
 * routes, because a browser is the classic place a numbered pager appears — and a
 * numbered position over a list that other people are adding to returns duplicates
 * and skips rows.
 *
 * IT IS A PROJECTION, AND THE PRIVATE OPTION IS WHERE AN UNSCOPED IMPLEMENTATION
 * LEAKS. L1040 requires the browser, its member counts and its purposes to be
 * "computed over the VIEWER'S AUTHORIZED SET per `S-AUTHZ-READ` and RECOMPUTED ON
 * EVERY RENDER, so a private channel never appears in a browser, a count, a facet or a
 * search result for a viewer who may not read it", and L954 names this filter's
 * private option as exactly that leak. Selecting `private` here therefore asks for the
 * private channels the viewer may ALREADY read — never for private channels as such.
 * Nothing in this shape can say otherwise: there is no include-private, no
 * all-workspaces and no act-as-another-person, because per `PROJECT_RULE_R1` a
 * caller-supplied value decides no authorization question and the widening option is
 * therefore not offered rather than offered and refused.
 *
 * THE ORGANIZATIONS CHIP IS NOT MODELLED. L428 records it as a partial capture: the
 * chip "is present in every browser capture but is NEVER OPENED, so its option set is
 * not observable", and external organisations belong to `22-external-collaboration.md`
 * — a deferred area. Authoring an option set would be presenting an invention as an
 * observation, so the filter is recorded in `docs/decisions/gap-register.md` and left
 * undeclared. Every filter this request does carry is one whose options the corpus
 * enumerates.
 */
export const browseChannelsRequestSchema = pagedRequestSchema.extend({
  /** Which subset of the viewer's authorized set to list. Narrows only; see above. */
  scope: channelBrowseScopeSchema.default(DEFAULT_CHANNEL_BROWSE_SCOPE),

  /** Which channel types to list, or the unfiltered default. */
  type: channelTypeFilterSchema.default(DEFAULT_CHANNEL_TYPE_FILTER),

  /** Which order to list in. Reorders only, never filters. */
  sort: channelBrowseSortSchema.default(DEFAULT_CHANNEL_BROWSE_SORT),

  /**
   * The browser's scoped search field (L1018, frame 125).
   *
   * `./content.ts`'s search term, reused rather than redeclared: it applies the
   * shared content pipeline and the bound that module applies before matching, so a
   * term cannot carry a control character or a bidirectional override into a query.
   * Absent means unfiltered, which is one representation rather than two.
   */
  searchTerm: ContentSearchTermSchema.optional(),
});

/** Browse channels, as a read path receives it with defaults applied. */
export type BrowseChannelsRequest = z.infer<typeof browseChannelsRequestSchema>;

/** Browse channels, as a caller writes one — every field optional, so the first page is `{}`. */
export type BrowseChannelsRequestInput = z.input<typeof browseChannelsRequestSchema>;

/**
 * List a channel's members — frames 82, 106, 120.
 *
 * ITS OWN READ PATH, WITH ITS OWN AUTHORIZATION. L954 names the Members tab among the
 * projections that must each be computed over the viewer's authorized set, and L1040
 * repeats it: being entitled to read a channel entails nothing about being entitled to
 * read its roster, so this is a separate request rather than a field of a channel read.
 *
 * PAGED, WHICH IS WHY `channelSchema` CARRIES A BOUNDED FACEPILE RATHER THAN A ROSTER.
 * A five-hundred-member channel is an explicit edge case, and the tab that renders one
 * has "a member search field" of its own (L997, frame 82) — both of which are answered
 * by traversing this path rather than by enlarging a channel read.
 *
 * Each entry is `./user.ts`'s summary projection, which deliberately carries no email
 * address: a member list is precisely the bulk read that would turn one into a
 * disclosure.
 */
export const browseChannelMembersRequestSchema = pagedRequestSchema.extend({
  /** Whose roster. */
  channelId: channelIdSchema,

  /** The tab's member search field (L997). Absent means unfiltered. */
  searchTerm: ContentSearchTermSchema.optional(),
});

/** List a channel's members, as a read path receives it with defaults applied. */
export type BrowseChannelMembersRequest = z.infer<typeof browseChannelMembersRequestSchema>;

/** List a channel's members, as a caller writes one. */
export type BrowseChannelMembersRequestInput = z.input<typeof browseChannelMembersRequestSchema>;
