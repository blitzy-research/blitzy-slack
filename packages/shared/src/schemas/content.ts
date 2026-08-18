/**
 * The allowlisted structured-content vocabulary.
 *
 * WHAT THIS MODULE IS
 *
 * A message body, and any other field one principal authors and another reads,
 * is stored as a **structured document over an allowlisted node and mark
 * vocabulary — never as markup to be re-parsed**, and any node type outside the
 * allowlist is dropped rather than passed through
 * [docs/workflows/00-product-overview.md L526]. This module is that allowlist,
 * and it is the only place the vocabulary is written down.
 *
 * It is deliberately **independent of the editor**. The rich-text editor in the
 * component library is configured *against* this union; it is not the source of
 * it, and nothing here imports it. That independence is the point rather than a
 * side effect: app-supplied and forwarded content "carries the identical
 * contract and is not trusted for having arrived from inside the product"
 * [docs/workflows/03-messaging-and-composer.md L716], so the server must be able
 * to validate a document that never passed through the editor at all.
 *
 * WHICH CONTRACTS IT DISCHARGES
 *
 *   - `S-CONTENT`, the stored-content input and output contract
 *     [docs/workflows/00-product-overview.md L486, obligations L524-L532], on
 *     its **input** side only: a length bound per field, Unicode
 *     normalisation, rejection of control characters and of bidirectional
 *     formatting characters, and rejection — never silent truncation — of a
 *     value that fails its declared shape.
 *   - `S-LINK`, outbound navigation and URL safety
 *     [docs/workflows/00-product-overview.md L487, obligations L536-L538], on
 *     the hyperlink destination: canonical parse before storage, and a
 *     two-scheme allowlist enforced **at input** rather than avoided at render.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 *   - **No output encoding.** Encoding is per destination context — text,
 *     attribute, URL or style — and is applied "at render time rather than at
 *     storage time, so that one stored value is safe in every context it
 *     appears in" [docs/workflows/00-product-overview.md L526]. Escaping a
 *     value here would corrupt every other sink. The sinks are owned by
 *     `apps/api/src/content/render.ts`, and match highlighting — a distinct
 *     sink, because both of its sides are untrusted — by
 *     `apps/api/src/content/highlight.ts`.
 *   - **No authorization.** A mention chip names a target so it can be
 *     rendered and so the right person can be notified. It grants nothing:
 *     mention targets and any link resolving to product content are
 *     re-authorized server-side against the acting session, per `S-AUTHZ-READ`.
 *     No field in this module carries a workspace identifier or an actor
 *     identifier, because a document is authored content and who authored it
 *     comes from the session at the point of use, never from the payload.
 *   - **No presentation.** Toolbars, controls, variants and states belong to
 *     the `C-*` component contracts in the component library. What lives here
 *     is the *output* of the formatting toolbar — the mark and node vocabulary
 *     — and nothing about the toolbar itself. The composer action row's
 *     concerns (attachment, audio clip, emoji entry, mention entry, schedule,
 *     snippet) are not content nodes and belong to the message and file
 *     schemas.
 *
 * WHY EVERY NUMBER HERE IS A NAMED CONSTANT
 *
 * The catalog specifies behaviour, structure, variants and states, and states
 * no numeric bounds at all. Every bound below is therefore **authored**, not
 * observed, and is declared exactly once and consumed by reference so that
 * changing it changes enforced behaviour in one place. Each is registered as an
 * authored choice in `docs/decisions/gap-register.md`, which records the
 * options considered and the reasoning; this module references that record and
 * does not restate it.
 *
 * WHY EVERY REJECTION IS A CODE RATHER THAN A SENTENCE
 *
 * The corpus is a single authenticated session in one workspace, so it "cannot
 * show what was rejected, what was escaped or how a value was stored. Every
 * rule here is therefore obligation"
 * [docs/workflows/00-product-overview.md L532]. Nothing in this module may
 * invent the wording of a rejection: every message passed to the validator is a
 * stable machine-readable code, and the client maps a code onto one of the six
 * documented validation presentations through its own authored copy.
 */
import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/* Rejection codes                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Every rejection this module can produce, as a stable machine-readable code.
 *
 * These are identifiers, not prose. A consumer maps a code to the wording and
 * to the presentation it wants; no wording is decided here. Codes are additive
 * — removing or renaming one is a breaking change for every surface that maps
 * it — which is why they are enumerated rather than composed at the point of
 * use.
 */
export const CONTENT_REJECTION_CODES = [
  /** A node's `type` is not in the allowlist, so the node cannot be validated. */
  'content_node_not_allowed',
  /** A property that is not part of a node's declared shape was supplied. */
  'content_unknown_property',
  /** A value that must be a string was not one. */
  'content_text_invalid',
  /** A children collection was not a list. */
  'content_children_invalid',
  /** One text run exceeded its character bound. */
  'content_text_too_long',
  /** A node carried more children than one node may hold. */
  'content_too_many_children',
  /** A control character, which no stored value may carry. */
  'content_control_character',
  /** A bidirectional formatting character, which can reorder the text around it. */
  'content_bidi_override',
  /** A value that the shape requires to be present was empty. */
  'content_value_required',
  /** A mark is not in the allowlist. */
  'content_mark_not_allowed',
  /** The same mark was applied to one run more than once. */
  'content_mark_duplicated',
  /** An emoji name exceeded its bound. */
  'content_emoji_name_too_long',
  /** An emoji name is not a well-formed token. */
  'content_emoji_name_invalid',
  /** A skin-tone selector is not one of the defined tones. */
  'content_skin_tone_invalid',
  /** A mention target is not a well-formed opaque identifier. */
  'content_mention_target_invalid',
  /** An audience target is not one of the defined audiences. */
  'content_audience_target_invalid',
  /** A code-block language hint exceeded its bound. */
  'content_language_hint_too_long',
  /** A code-block language hint is not a well-formed token. */
  'content_language_hint_invalid',
  /** A hyperlink label exceeded its bound. */
  'content_link_label_too_long',
  /** A hyperlink destination exceeded its bound. */
  'content_link_too_long',
  /** A hyperlink destination could not be parsed as an absolute address. */
  'content_link_unparseable',
  /** A hyperlink destination used a scheme outside the two-member allowlist. */
  'content_link_scheme_rejected',
  /** The document's total stored character payload exceeded its bound. */
  'content_document_too_large',
  /** The document held more nodes than one document may hold. */
  'content_document_too_many_nodes',
  /** The document nested deeper than the depth bound. */
  'content_depth_exceeded',
  /** A search term exceeded the bound applied before matching. */
  'content_search_term_too_long',
] as const;

/** A rejection this module can produce. */
export type ContentRejectionCode = (typeof CONTENT_REJECTION_CODES)[number];

/* -------------------------------------------------------------------------- */
/* Authored bounds                                                            */
/* -------------------------------------------------------------------------- */

/*
 * A bound REJECTS. It never truncates.
 *
 * This is the single easiest rule in this module to breach by accident, because
 * clamping a value to its bound looks like helpfulness. It is not: `S-CONTENT`
 * requires "rejection of a value that fails its declared shape rather than
 * silent truncation" [docs/workflows/00-product-overview.md L526], and a value
 * quietly shortened on the way in is a value the author never wrote and cannot
 * see was changed. Nothing below is a clamp, and no transform in this module
 * shortens anything.
 *
 * Each bound is applied twice against the same constant — once to the value as
 * supplied and once to its normalised form — because Unicode normalisation can
 * change a string's length in either direction. The first application also
 * keeps an unbounded input from being normalised before it is refused.
 */

/**
 * The shortest a value may be where the shape requires one to be present.
 *
 * Named rather than written inline because it appears on several fields, and
 * because it says something: these are the values whose absence makes the node
 * meaningless — an emoji with no name, a mention with no target, a hyperlink
 * with no destination. Everything else may legitimately be empty. A channel
 * description "permits an empty value, keeping its save action enabled when the
 * textarea is cleared" [docs/workflows/02-channels.md L1008], which is the one
 * place the corpus shows a field accepting emptiness, so an empty text run and
 * an empty document are both accepted here.
 */
export const MIN_REQUIRED_VALUE_CHARS = 1;

/**
 * The most characters one text run may carry.
 *
 * A floor rather than a free choice: a body carrying four thousand characters
 * is required to be accepted, so this bound cannot sit below it. Marks split a
 * paragraph into runs, so a body at the limit reaches it as one run only when
 * it carries no formatting at all.
 */
export const MAX_TEXT_RUN_CHARS = 4000;

/**
 * The most stored characters one whole document may carry, across every node.
 *
 * Bounding runs alone would leave a document inflatable by many small nodes, so
 * the aggregate is bounded too. Ten times the single-run bound leaves room for
 * a long, heavily formatted body while keeping a stored document to a size a
 * read path can serialise without thought.
 */
export const MAX_DOCUMENT_CHARS = 40000;

/**
 * The most nodes one document may hold, counted over the whole tree.
 *
 * The companion to the character bound: a document of empty nodes carries no
 * characters at all and still costs to parse, walk and render.
 */
export const MAX_DOCUMENT_NODES = 2000;

/**
 * The deepest one document may nest.
 *
 * Depth is a node's distance from the root: an outermost block is depth one and
 * the inline content it holds is depth two, so ten levels leave room for eight
 * levels of nested structure. Nesting arises from a quote inside a quote and
 * from a list inside a list entry; eight levels is past any structure a person
 * composes and well short of anything that threatens a recursive walk.
 *
 * This is the *semantic* bound. The structural guard against a deliberately
 * deep payload exhausting the parser's own recursion is the transport body-size
 * limit, which belongs to the API and is applied before a document reaches this
 * schema at all. The sanitising helper below needs no such help: it tests depth
 * before it recurses, so its recursion is capped by this constant by
 * construction.
 */
export const MAX_DOCUMENT_DEPTH = 10;

/**
 * The most children one node may hold.
 *
 * A per-field bound, which `S-CONTENT` requires of every field rather than of
 * the document alone: without it a single paragraph could hold the document's
 * entire node budget and every aggregate check would fire too late to say
 * anything useful about where the problem is.
 */
export const MAX_NODE_CHILDREN = 500;

/**
 * The most characters a hyperlink's display text may carry.
 *
 * The label is prose a person chose, not an address, so it is bounded well
 * below the destination. A label is typically a phrase lifted from the
 * surrounding sentence [docs/workflows/03-messaging-and-composer.md L776].
 */
export const MAX_LINK_LABEL_CHARS = 500;

/**
 * The most characters a hyperlink destination may carry, before and after
 * canonicalisation.
 *
 * The conventional practical ceiling for an address that has to survive being
 * copied, stored and followed. Canonicalisation can lengthen an address — a
 * space becomes three characters, a bare host gains a path separator — so the
 * bound is applied to the canonical form as well as to the input.
 */
export const MAX_LINK_DESTINATION_CHARS = 2048;

/**
 * The most characters an emoji name may carry.
 *
 * The name is "also the token typed to use it" [frame 216, frame 217], so it is
 * short by construction: a token nobody can type is a token nobody uses.
 */
export const MAX_EMOJI_NAME_CHARS = 64;

/**
 * The most characters a code-block language hint may carry.
 *
 * A hint is an opaque short token, never anything that could be interpreted, so
 * it is bounded far below any other free-text field here.
 */
export const MAX_CODE_LANGUAGE_HINT_CHARS = 32;

/**
 * The most characters a mention target identifier may carry.
 *
 * Wide enough for every identifier shape a store might issue, narrow enough
 * that an identifier field cannot be used to smuggle a payload. The *format* is
 * deliberately not pinned here — identifier generation is the database
 * package's contract, and binding to one shape would make this module wrong the
 * first time that changes.
 */
export const MAX_MENTION_TARGET_CHARS = 64;

/**
 * The most characters a search term may carry, applied **before** matching.
 *
 * Exported for the match-highlighting sink, which this module deliberately does
 * not implement. `S-CONTENT` gives highlighting a rule of its own because both
 * of its sides are untrusted — the term is typed by the viewer and the
 * surrounding text was authored by someone else — and requires that both are
 * "encoded before any highlight markup is inserted, never after"; that matching
 * is "literal rather than pattern-based, so that a term cannot be interpreted
 * as an expression and cannot be made to backtrack catastrophically"; and that
 * "the term is length-bounded before matching"
 * [docs/workflows/00-product-overview.md L528]. That last requirement is what
 * this constant is: the bound is applied first, so a term is refused before any
 * work is done with it. The same rule governs keyword lists compared against
 * message content. `apps/api/src/content/highlight.ts` implements the sink
 * against this bound.
 */
export const MAX_SEARCH_TERM_CHARS = 200;

/**
 * The lowest and highest skin-tone selector.
 *
 * A tone is stored as an ordinal rather than as a rendered glyph, so a document
 * carries a choice rather than a presentation. Five tones are what the Unicode
 * standard defines as modifiers; a node with no selector at all renders in the
 * unmodified default.
 */
export const MIN_EMOJI_SKIN_TONE = 1;
export const MAX_EMOJI_SKIN_TONE = 5;

/* -------------------------------------------------------------------------- */
/* Unicode hygiene                                                            */
/* -------------------------------------------------------------------------- */

/*
 * `S-CONTENT` requires "Unicode normalisation" and "rejection or neutralisation
 * of control characters and of bidirectional-override characters, which is what
 * stops a filename or display name from reordering the text around it"
 * [docs/workflows/00-product-overview.md L526]. All three are implemented here,
 * once, and applied to every free-text value in this module.
 *
 * Detection is a code-unit scan rather than a pattern. Three reasons, and the
 * last is the one that matters: a scan cannot be made to backtrack, which is
 * the discipline `S-CONTENT` imposes on matching elsewhere and there is no
 * reason to hold this weaker; a scan says exactly which code points are refused
 * where a pattern hides them behind escapes; and every code point in question
 * lies in the basic plane, so a code-unit scan is exact and a surrogate pair
 * can never be mistaken for one.
 */

/** The canonical composed form every stored text value is normalised to. */
const UNICODE_NORMALISATION_FORM = 'NFC';

/** Highest code unit in the first control range, which begins at zero. */
const C0_CONTROL_LAST = 0x1f;

/** Lowest code unit in the delete-and-second-control range. */
const C1_CONTROL_FIRST = 0x7f;

/** Highest code unit in the delete-and-second-control range. */
const C1_CONTROL_LAST = 0x9f;

/** Horizontal tab: indentation, and therefore content inside a code block. */
const HORIZONTAL_TAB = 0x09;

/** Line feed: the one line terminator a code block may carry. */
const LINE_FEED = 0x0a;

/*
 * The bidirectional formatting characters that are refused are the embeddings,
 * the overrides and the isolates: the characters that reorder the text around
 * them, which is precisely the behaviour `S-CONTENT` names.
 *
 * Two exclusions are deliberate, and both would be defects if they went the
 * other way. The directional *marks* are not refused: they annotate the
 * resolved direction of neutral characters and cannot reorder a surrounding
 * run, so refusing them would break legitimate mixed-direction text while
 * closing no attack. Nor is any right-to-left *script* character refused —
 * those are ordinary letters, and a body carrying right-to-left text is
 * required to be accepted. Joiners are likewise untouched, because a legitimate
 * emoji sequence is built from them.
 */

/** Lowest code unit of the embedding-and-override block. */
const BIDI_FORMATTING_FIRST = 0x202a;

/** Highest code unit of the embedding-and-override block. */
const BIDI_FORMATTING_LAST = 0x202e;

/** Lowest code unit of the isolate block. */
const BIDI_ISOLATE_FIRST = 0x2066;

/** Highest code unit of the isolate block. */
const BIDI_ISOLATE_LAST = 0x2069;

/** Normalises a value to the single canonical composed form stored everywhere. */
const toCanonicalUnicodeForm = (value: string): string =>
  value.normalize(UNICODE_NORMALISATION_FORM);

/**
 * Reports whether a value carries a control character.
 *
 * `allowLineBreaks` is what keeps this one implementation rather than two. A
 * code block is "a container for text, never for execution"
 * [docs/workflows/03-messaging-and-composer.md L716] and the corpus shows a
 * whole-body code block [frame 236], so its text legitimately carries line
 * feeds and tabs where a text run never does — a structured document expresses
 * a line break as another block, not as a character. The carriage return stays
 * refused in both cases, so a stored value cannot differ only by its line
 * endings.
 */
const containsControlCharacter = (value: string, allowLineBreaks: boolean): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (allowLineBreaks && (codeUnit === HORIZONTAL_TAB || codeUnit === LINE_FEED)) {
      continue;
    }
    if (codeUnit <= C0_CONTROL_LAST) {
      return true;
    }
    if (codeUnit >= C1_CONTROL_FIRST && codeUnit <= C1_CONTROL_LAST) {
      return true;
    }
  }
  return false;
};

/** Reports whether a value carries a bidirectional embedding, override or isolate. */
const containsBidirectionalFormatting = (value: string): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= BIDI_FORMATTING_FIRST && codeUnit <= BIDI_FORMATTING_LAST) {
      return true;
    }
    if (codeUnit >= BIDI_ISOLATE_FIRST && codeUnit <= BIDI_ISOLATE_LAST) {
      return true;
    }
  }
  return false;
};

/** How one free-text value in this module is bounded and cleaned. */
interface TextValueOptions {
  /** The bound, rejected on breach and never used to truncate. */
  readonly maximumCharacters: number;
  /** The code reported when the bound is breached. */
  readonly tooLongCode: ContentRejectionCode;
  /** Whether a line feed and a tab are content here, as they are in a code block. */
  readonly allowLineBreaks: boolean;
}

/**
 * The one free-text pipeline every authored string in this module passes
 * through: bound the input, normalise it, bound the normalised form, then
 * refuse control characters and bidirectional formatting.
 *
 * Order is deliberate. Bounding first means an oversized input is refused
 * before it is normalised. Normalising next means every later check, and
 * everything stored, sees one canonical form. Bounding again means
 * normalisation cannot carry a value past its limit. Refusing the two character
 * classes last means they are judged on the exact string that would be stored.
 */
const contentTextValue = (options: TextValueOptions): z.ZodType<string, string> =>
  z
    .string({ error: 'content_text_invalid' satisfies ContentRejectionCode })
    .max(options.maximumCharacters, { message: options.tooLongCode })
    .transform(toCanonicalUnicodeForm)
    .refine((value) => value.length <= options.maximumCharacters, {
      message: options.tooLongCode,
    })
    .refine((value) => !containsControlCharacter(value, options.allowLineBreaks), {
      message: 'content_control_character' satisfies ContentRejectionCode,
    })
    .refine((value) => !containsBidirectionalFormatting(value), {
      message: 'content_bidi_override' satisfies ContentRejectionCode,
    });

/* -------------------------------------------------------------------------- */
/* The mark vocabulary                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Every inline mark a text run may carry.
 *
 * This is the output of the formatting toolbar, and the two move together: the
 * toolbar carries nine controls in five groups — bold, italic and strikethrough;
 * link; ordered and bulleted list; blockquote; inline code and code block
 * [docs/workflows/03-messaging-and-composer.md L523, frame 202] — and every one
 * of them has to resolve to something in this module or it is a control that
 * produces content the validator refuses. Four of the nine are marks and appear
 * here; the link is an inline node and the four block controls are block nodes,
 * all below.
 *
 * The observed set is "bold, italic, combined bold-italic, strikethrough,
 * inline code" [docs/workflows/03-messaging-and-composer.md L546, frame 232,
 * frame 235, frame 249], and the area's own acceptance criterion states that
 * "bold, italic, strikethrough and inline code apply to the selection"
 * [docs/workflows/03-messaging-and-composer.md L751].
 *
 * **Combined bold-italic is not a fifth mark.** It is two marks on one run,
 * which is why marks are a collection rather than a single value. A consumer
 * that mints a combined identifier has invented a mark the vocabulary does not
 * have and produced content nothing else can read.
 *
 * The entity summary of a message body names three of the four
 * [docs/workflows/03-messaging-and-composer.md L651,
 * docs/workflows/README.md L328] while the observed-inventory table, the
 * area's content obligation [L716] and its acceptance criterion [L751] all name
 * four. The four-mark reading is implemented, because a toolbar control whose
 * output the validator refuses is a defect either way; the divergence between
 * the two catalog statements belongs in `docs/decisions/catalog-defects.md`.
 */
export const CONTENT_MARKS = ['bold', 'italic', 'strikethrough', 'inline_code'] as const;

/** An inline mark. */
export const ContentMarkSchema = z.enum(CONTENT_MARKS, {
  error: 'content_mark_not_allowed' satisfies ContentRejectionCode,
});

/** An inline mark. */
export type ContentMark = z.infer<typeof ContentMarkSchema>;

/**
 * The most marks one run may carry, which is every mark there is.
 *
 * Derived rather than chosen: with duplicates refused, a run cannot carry more
 * marks than the vocabulary defines, so this bound cannot drift out of step
 * with the vocabulary and there is no number to keep in sync.
 */
export const MAX_MARKS_PER_TEXT_RUN = CONTENT_MARKS.length;

/**
 * The marks on one run: each in the allowlist, none repeated.
 *
 * Refusing a repeat is a canonical-form rule rather than a nicety. Two runs
 * differing only in how often they name the same mark render identically, so
 * permitting the difference would let one appearance have two storage forms —
 * and would let a bounded field carry an unbounded amount of nothing.
 */
export const ContentMarkListSchema = z
  .array(ContentMarkSchema, {
    error: 'content_children_invalid' satisfies ContentRejectionCode,
  })
  .max(MAX_MARKS_PER_TEXT_RUN, {
    message: 'content_mark_duplicated' satisfies ContentRejectionCode,
  })
  .refine((marks) => new Set(marks).size === marks.length, {
    message: 'content_mark_duplicated' satisfies ContentRejectionCode,
  });

/* -------------------------------------------------------------------------- */
/* The node-type vocabulary                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The discriminator every node carries, and the document root's own value.
 *
 * The root is a node type of its own and is deliberately absent from every node
 * union below, so a document cannot be nested inside itself.
 */
export const CONTENT_DOCUMENT_TYPE = 'doc';

/**
 * Every inline node type, in the order the catalog evidences them.
 *
 * A text run [frame 202]; an emoji [frame 202]; a channel-mention chip and a
 * person-mention chip, "each visually distinct from surrounding text and each
 * hoverable" [docs/workflows/03-messaging-and-composer.md L548, frame 176,
 * frame 175]; an audience mention; and a hyperlink [frame 249].
 *
 * The audience mention is the one entry the summary tables do not name, and it
 * is here because the catalog says what it is: the person typeahead lists "two
 * special mentions each with a one-line description of who is notified"
 * [docs/workflows/03-messaging-and-composer.md L189, L586, frame 172], and
 * those two are "audience tokens rather than users"
 * [docs/workflows/03-messaging-and-composer.md L662]. They cannot be person
 * mentions, because there is no person to reference, and they cannot be left
 * out, because the typeahead inserts them into a body. A separate node is the
 * smallest shape that keeps the person mention honest about referencing a
 * person.
 */
export const CONTENT_INLINE_NODE_TYPES = [
  'text',
  'emoji',
  'channel_mention',
  'person_mention',
  'audience_mention',
  'link',
] as const;

/**
 * Every block node type: the types valid at the document root and inside a
 * quote.
 *
 * A paragraph, plus the four block structures the catalog evidences — bulleted
 * list [frame 141], ordered list [frame 120], blockquote [frame 233] and code
 * block [frame 236] [docs/workflows/03-messaging-and-composer.md L547].
 *
 * The paragraph is authored, and it is unavoidable rather than optional: a
 * quote and a list both hold text, and text cannot sit in a block without one.
 * A structured document also has no other way to express the multi-line body
 * the area owns — a line break is another block, never a character inside a run.
 *
 * A list item is deliberately **not** here. It is a structural node that is
 * only ever a list's child, and admitting it would make a bare list item valid
 * at the document root.
 */
export const CONTENT_BLOCK_NODE_TYPES = [
  'paragraph',
  'bulleted_list',
  'ordered_list',
  'blockquote',
  'code_block',
] as const;

/** The structural node that carries one entry of a list. */
export const CONTENT_LIST_ITEM_NODE_TYPE = 'list_item';

/** Every node type in the vocabulary: inline, block, and the list item. */
export const CONTENT_NODE_TYPES = [
  ...CONTENT_INLINE_NODE_TYPES,
  ...CONTENT_BLOCK_NODE_TYPES,
  CONTENT_LIST_ITEM_NODE_TYPE,
] as const;

/** Every node type in the vocabulary. */
export type ContentNodeType = (typeof CONTENT_NODE_TYPES)[number];

/**
 * The audiences an audience mention may name.
 *
 * The catalog evidences exactly two [frame 172] and describes each only by what
 * it does — carry "a one-line description of who is notified"
 * [docs/workflows/03-messaging-and-composer.md L189]. It never prints their
 * tokens, and the labels legible in a frame are another company's product copy,
 * so both identifiers here are authored: everyone in the conversation, and
 * everyone in the conversation who is currently present. Presence is a
 * first-class concept in its own right — rendered "as a filled dot or a hollow
 * ring" [docs/workflows/03-messaging-and-composer.md L654, frame 172] — which
 * is what makes the second audience the smallest completion consistent with
 * behaviour the corpus does evidence rather than an invention.
 *
 * An audience names a set to notify. It confers no access: who is actually in
 * that set, and which of them may read the containing conversation, is resolved
 * and authorized server-side per `S-AUTHZ-READ`, where "a notification is a
 * projection that leaves the product"
 * [docs/workflows/00-product-overview.md L512].
 */
export const CONTENT_AUDIENCE_TARGETS = ['conversation', 'present'] as const;

/** The audience an audience mention names. */
export const ContentAudienceTargetSchema = z.enum(CONTENT_AUDIENCE_TARGETS, {
  error: 'content_audience_target_invalid' satisfies ContentRejectionCode,
});

/** The audience an audience mention names. */
export type ContentAudienceTarget = z.infer<typeof ContentAudienceTargetSchema>;

/* -------------------------------------------------------------------------- */
/* Reusable value schemas                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Bounded, normalised, control-free and bidirectional-formatting-free text for
 * one run.
 *
 * Empty is accepted. The one field the corpus shows accepting an empty value is
 * a rich-text field [docs/workflows/00-product-overview.md L532,
 * docs/workflows/02-channels.md L1008], and an empty run is how a blank line
 * exists in a structured document. Whether an empty *body* may be submitted is
 * a rule about the operation, not about the vocabulary, and belongs to the
 * schema for that operation.
 */
export const ContentTextRunSchema = contentTextValue({
  maximumCharacters: MAX_TEXT_RUN_CHARS,
  tooLongCode: 'content_text_too_long',
  allowLineBreaks: false,
});

/**
 * The text inside a code block: the same pipeline, with line feeds and tabs
 * treated as the content they are.
 *
 * One factory, two configurations — not two implementations. A code block "is a
 * container for text, never for execution"
 * [docs/workflows/03-messaging-and-composer.md L716] and the corpus shows a
 * whole-body code block [frame 236], so its content is multi-line by nature
 * while a text run's never is.
 */
export const ContentCodeTextSchema = contentTextValue({
  maximumCharacters: MAX_TEXT_RUN_CHARS,
  tooLongCode: 'content_text_too_long',
  allowLineBreaks: true,
});

/**
 * A hyperlink's display text.
 *
 * Exported on its own because it is reused: a channel bookmark is the same
 * shape — "the name and the address are independent untrusted values, so the
 * chip's label is encoded per `S-CONTENT` and may not misrepresent where it
 * goes" [docs/workflows/02-channels.md L950] — and a second declaration of it
 * elsewhere would be a second implementation of one contract.
 *
 * The label is untrusted on its own terms and is **never** checked against the
 * destination. The two are separately editable after insertion
 * [docs/workflows/03-messaging-and-composer.md L651, frame 239, frame 241], so
 * a rule forcing one to agree with the other would contradict the observed
 * behaviour. What answers the misrepresentation risk is presentation, not
 * validation: the destination is rendered alongside the label
 * [docs/workflows/03-messaging-and-composer.md L381, frame 241], the label is
 * encoded per `S-CONTENT` at render time, and the destination is re-authorized
 * on resolution per `S-AUTHZ-READ`.
 */
export const ContentLinkLabelSchema = contentTextValue({
  maximumCharacters: MAX_LINK_LABEL_CHARS,
  tooLongCode: 'content_link_label_too_long',
  allowLineBreaks: false,
});

/*
 * Patterns below use a single quantifier over a character class and never a
 * nested repetition, so no input can make one backtrack. `S-CONTENT` demands
 * that discipline of match highlighting [docs/workflows/00-product-overview.md
 * L528]; there is no reason for an allowlist that guards storage to hold itself
 * to a weaker standard than one that guards a rendering.
 */

/** A shortcode token: lower case, starting alphanumeric, no interior control. */
const EMOJI_NAME_PATTERN = /^[a-z0-9][a-z0-9_+-]*$/;

/** A language hint token: lower case, starting alphanumeric. */
const CODE_LANGUAGE_HINT_PATTERN = /^[a-z0-9][a-z0-9+.-]*$/;

/** An opaque identifier, deliberately admitting every common identifier shape. */
const OPAQUE_IDENTIFIER_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * An emoji's name, which is also the token typed to use it.
 *
 * The catalog defines a custom emoji as an uploaded image "plus a name that is
 * also the token typed to use it" [docs/workflows/03-messaging-and-composer.md
 * L652, frame 216, frame 217], with "name uniqueness enforced across the
 * workspace" [frame 217]. Uniqueness is the reason the form is canonical here:
 * a uniqueness rule over values that have several spellings does not hold, so a
 * name is lower case or it is refused rather than quietly folded.
 *
 * A node stores the name and nothing else — never a rendered glyph and never
 * image data. Whether a name resolves to a standard emoji or to one of the
 * workspace's own is settled at render time against that workspace's set, which
 * is a projection under `S-AUTHZ-READ`. There is deliberately no flag saying
 * which: an author asserting it would be asserting something the server has to
 * establish for itself.
 */
export const ContentEmojiNameSchema = contentTextValue({
  maximumCharacters: MAX_EMOJI_NAME_CHARS,
  tooLongCode: 'content_emoji_name_too_long',
  allowLineBreaks: false,
})
  .refine((value) => value.length >= MIN_REQUIRED_VALUE_CHARS, {
    message: 'content_value_required' satisfies ContentRejectionCode,
  })
  .refine((value) => EMOJI_NAME_PATTERN.test(value), {
    message: 'content_emoji_name_invalid' satisfies ContentRejectionCode,
  });

/**
 * A code block's optional language hint.
 *
 * An opaque short token and nothing more. It selects a highlighting vocabulary
 * at render time; it is never a path, never a command and never anything a
 * renderer could be induced to interpret, which is what the bound and the
 * pattern together guarantee.
 */
export const ContentCodeLanguageHintSchema = contentTextValue({
  maximumCharacters: MAX_CODE_LANGUAGE_HINT_CHARS,
  tooLongCode: 'content_language_hint_too_long',
  allowLineBreaks: false,
})
  .refine((value) => value.length >= MIN_REQUIRED_VALUE_CHARS, {
    message: 'content_value_required' satisfies ContentRejectionCode,
  })
  .refine((value) => CODE_LANGUAGE_HINT_PATTERN.test(value), {
    message: 'content_language_hint_invalid' satisfies ContentRejectionCode,
  });

/**
 * The identifier a mention chip names its target by.
 *
 * Opaque by design. The pattern admits every identifier shape a store is likely
 * to issue and refuses everything that could be interpreted, and it deliberately
 * does not pin one format: identifier generation is the database package's
 * contract, and binding this module to a particular shape would make it wrong
 * the first time that contract changes.
 *
 * **A target is a reference for rendering and for notification. It is not a
 * capability.** The presence of a mention in a body says nothing about whether
 * the mentioned channel exists, whether the reader may see it, or whether the
 * mentioned person may read the conversation it appears in. Every one of those
 * is decided server-side against the acting session at the point the chip is
 * rendered or the notification is routed, per `S-AUTHZ-READ`, under which "a
 * link is a projection at resolution time" and "a notification is a projection
 * that leaves the product" [docs/workflows/00-product-overview.md L512]. This
 * module holds no workspace identifier and no actor identifier for the same
 * reason: an authorization decision may never rest on a value the caller
 * supplied.
 */
export const ContentMentionTargetSchema = contentTextValue({
  maximumCharacters: MAX_MENTION_TARGET_CHARS,
  tooLongCode: 'content_mention_target_invalid',
  allowLineBreaks: false,
})
  .refine((value) => value.length >= MIN_REQUIRED_VALUE_CHARS, {
    message: 'content_value_required' satisfies ContentRejectionCode,
  })
  .refine((value) => OPAQUE_IDENTIFIER_PATTERN.test(value), {
    message: 'content_mention_target_invalid' satisfies ContentRejectionCode,
  });

/**
 * A search term, bounded before it is matched against anything.
 *
 * This module does not implement highlighting; it publishes the bound that the
 * sink is required to apply first, so that the requirement lives with the type
 * rather than in the memory of whoever writes the sink. The rest of the rule —
 * encode both sides before inserting any highlight markup, match literally
 * rather than by pattern — is stated on `MAX_SEARCH_TERM_CHARS` above and
 * implemented in `apps/api/src/content/highlight.ts`.
 */
export const ContentSearchTermSchema = contentTextValue({
  maximumCharacters: MAX_SEARCH_TERM_CHARS,
  tooLongCode: 'content_search_term_too_long',
  allowLineBreaks: false,
});

/* -------------------------------------------------------------------------- */
/* The hyperlink destination — `S-LINK`                                       */
/* -------------------------------------------------------------------------- */

/**
 * The only two schemes a stored address may use.
 *
 * `S-LINK` allows exactly these, and requires that "schemes that execute or read
 * local state — including script, data, file and any application-registered
 * scheme — are rejected at input, not merely avoided at render"
 * [docs/workflows/00-product-overview.md L536]. Rejecting at input is the part
 * that matters: an address only avoided at render is still in the store,
 * waiting for the next surface that renders it a little differently.
 *
 * Values carry the parser's trailing colon so that a protocol comparison is a
 * comparison against this list and never a substring test.
 */
export const ALLOWED_LINK_PROTOCOLS = ['http:', 'https:'] as const;

/**
 * A hyperlink destination: parsed canonically, restricted to two schemes, and
 * stored in the form the parse produced.
 *
 * **The parse is the scheme gate, and a pattern could not be.** A hand-written
 * expression looking for a forbidden scheme is defeated by writing that scheme
 * with a tab or a newline inside it, or with leading spaces — the address parser
 * discards all three and resolves the value to the same forbidden scheme, which
 * the allowlist below then refuses. That is why `S-LINK` requires a canonical
 * parse rather than a check, and why this schema performs one.
 *
 * **The character guard runs before the parse, not after.** The parser
 * percent-encodes a bidirectional override that appears in a path, so a value
 * checked only afterwards would come back looking clean and be stored with the
 * override intact inside an escape. Running the shared text guard on the value
 * as supplied refuses it while it is still legible.
 *
 * Canonicalising on the way in means one address has one stored form, so two
 * spellings cannot diverge. The parse already lower-cases the host, drops a
 * default port, resolves dot segments and punycodes an international host.
 * Anything beyond that — policy about credentials in an address, tracking
 * parameters, equivalence between hosts — is the API's, in
 * `apps/api/src/links/canonicalize.ts`; this module's job is the parse, the
 * scheme allowlist and the bound.
 *
 * Two obligations travel with every value this schema produces, and they bind
 * the consumer rather than the type. A link that leaves the product is followed
 * "without conveying the opener reference or the referring address", so a
 * destination page can neither manipulate the tab that opened it nor learn the
 * address it came from; and one that resolves to product content is
 * re-authorized on resolution per `S-AUTHZ-READ`
 * [docs/workflows/00-product-overview.md L536]. The external-link glyph is a
 * rendering and not a boundary: its presence says the product marked an entry
 * as leaving, and "the glyph's absence evidences nothing at all"
 * [docs/workflows/00-product-overview.md L538], so no consumer may decide from
 * a glyph whether an address is inside or outside the product.
 *
 * A destination is required. The link dialog renders its save action active
 * with the field still empty [frame 238] — "a rendering, recorded as such, and
 * not evidence that any destination is acceptable"
 * [docs/workflows/03-messaging-and-composer.md L718].
 */
export const ContentLinkDestinationSchema = contentTextValue({
  maximumCharacters: MAX_LINK_DESTINATION_CHARS,
  tooLongCode: 'content_link_too_long',
  allowLineBreaks: false,
})
  .refine((value) => value.length >= MIN_REQUIRED_VALUE_CHARS, {
    message: 'content_value_required' satisfies ContentRejectionCode,
  })
  .transform((value, context) => {
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      context.issues.push({
        code: 'custom',
        input: value,
        message: 'content_link_unparseable' satisfies ContentRejectionCode,
      });
      return z.NEVER;
    }

    const isAllowedProtocol = ALLOWED_LINK_PROTOCOLS.some(
      (protocol) => protocol === parsed.protocol,
    );
    if (!isAllowedProtocol) {
      context.issues.push({
        code: 'custom',
        input: value,
        message: 'content_link_scheme_rejected' satisfies ContentRejectionCode,
      });
      return z.NEVER;
    }

    // Canonicalisation can lengthen an address, so the bound is re-applied to
    // the form that will actually be stored rather than only to the input.
    if (parsed.href.length > MAX_LINK_DESTINATION_CHARS) {
      context.issues.push({
        code: 'custom',
        input: value,
        message: 'content_link_too_long' satisfies ContentRejectionCode,
      });
      return z.NEVER;
    }

    return parsed.href;
  });

/* -------------------------------------------------------------------------- */
/* Node construction helpers                                                  */
/* -------------------------------------------------------------------------- */

/**
 * How every node object reports a shape failure.
 *
 * A property the shape does not declare is refused rather than carried, so an
 * extra field cannot ride along inside an otherwise valid node and reach a
 * renderer, a store or a later version of this schema that happens to give it a
 * meaning. Anything else that is not a node at all reports as an unknown node
 * type, which is what it is.
 */
const nodeObjectError: z.core.$ZodErrorMap = (issue) =>
  issue.code === 'unrecognized_keys'
    ? ('content_unknown_property' satisfies ContentRejectionCode)
    : ('content_node_not_allowed' satisfies ContentRejectionCode);

/** Shared object parameters, so the rule above is stated once. */
const NODE_OBJECT_PARAMS = { error: nodeObjectError };

/** Shared parameters for a node's `type` discriminator. */
const NODE_TYPE_PARAMS = {
  error: 'content_node_not_allowed' satisfies ContentRejectionCode,
};

/**
 * A node's children: a list, bounded per node.
 *
 * The per-node bound is what `S-CONTENT`'s "length bound per field" means for a
 * collection. It sits alongside the document-wide node bound rather than
 * duplicating it: without it one node could hold the document's entire budget,
 * and the aggregate check would fire far from the node that caused it.
 */
const nodeChildren = <TElement extends z.ZodType>(element: TElement) =>
  z
    .array(element, { error: 'content_children_invalid' satisfies ContentRejectionCode })
    .max(MAX_NODE_CHILDREN, {
      message: 'content_too_many_children' satisfies ContentRejectionCode,
    });

/* -------------------------------------------------------------------------- */
/* Inline nodes                                                               */
/* -------------------------------------------------------------------------- */

/**
 * A run of text, carrying the marks that apply to the whole run.
 *
 * Marks are a property of the run rather than a wrapper around it, which is what
 * makes combined formatting expressible without a combined identifier: a
 * bold-italic phrase [frame 232] is one run carrying two marks.
 */
export const ContentTextNodeSchema = z.strictObject(
  {
    type: z.literal('text', NODE_TYPE_PARAMS),
    text: ContentTextRunSchema,
    marks: ContentMarkListSchema.optional(),
  },
  NODE_OBJECT_PARAMS,
);

/** A run of text. */
export type ContentTextNode = z.infer<typeof ContentTextNodeSchema>;

/**
 * An emoji, stored as the token that names it and the tone it was written with
 * [frame 202, frame 214].
 *
 * No glyph and no image data: a name plus an optional tone is a choice, and a
 * glyph would be a rendering. The viewer's *default* tone is a per-viewer
 * preference under `S-PERUSER` and lives on that viewer's own preferences
 * record; what a node stores is the tone this occurrence was written with, which
 * is shared content like the rest of the body.
 */
export const ContentEmojiNodeSchema = z.strictObject(
  {
    type: z.literal('emoji', NODE_TYPE_PARAMS),
    name: ContentEmojiNameSchema,
    skinTone: z
      .number({ error: 'content_skin_tone_invalid' satisfies ContentRejectionCode })
      .int({ error: 'content_skin_tone_invalid' satisfies ContentRejectionCode })
      .min(MIN_EMOJI_SKIN_TONE, {
        message: 'content_skin_tone_invalid' satisfies ContentRejectionCode,
      })
      .max(MAX_EMOJI_SKIN_TONE, {
        message: 'content_skin_tone_invalid' satisfies ContentRejectionCode,
      })
      .optional(),
  },
  NODE_OBJECT_PARAMS,
);

/** An emoji. */
export type ContentEmojiNode = z.infer<typeof ContentEmojiNodeSchema>;

/**
 * A channel-mention chip [frame 176].
 *
 * The chip names a channel so it can be rendered and resolved. It grants the
 * reader nothing: whether that channel exists, and whether this reader may see
 * that it exists, is decided server-side per `S-AUTHZ-READ` every time the chip
 * is rendered — a private channel stays absent from a projection however it is
 * reached, and a chip is a projection.
 */
export const ContentChannelMentionNodeSchema = z.strictObject(
  {
    type: z.literal('channel_mention', NODE_TYPE_PARAMS),
    target: ContentMentionTargetSchema,
  },
  NODE_OBJECT_PARAMS,
);

/** A channel-mention chip. */
export type ContentChannelMentionNode = z.infer<typeof ContentChannelMentionNodeSchema>;

/**
 * A person-mention chip [frame 176].
 *
 * The chip names a person so it can be rendered and so the notification can be
 * routed. Being named confers nothing in either direction: it does not give the
 * mentioned person access to the conversation, and it does not entitle the
 * reader to learn who that person is. Both are decided server-side per
 * `S-AUTHZ-READ`, under which a notification is a projection that leaves the
 * product and carries only what the recipient may read.
 */
export const ContentPersonMentionNodeSchema = z.strictObject(
  {
    type: z.literal('person_mention', NODE_TYPE_PARAMS),
    target: ContentMentionTargetSchema,
  },
  NODE_OBJECT_PARAMS,
);

/** A person-mention chip. */
export type ContentPersonMentionNode = z.infer<typeof ContentPersonMentionNodeSchema>;

/**
 * An audience-mention chip: a mention that names a set of people rather than one
 * person [frame 172].
 *
 * Kept apart from the person mention because the catalog is explicit that these
 * are "audience tokens rather than users"
 * [docs/workflows/03-messaging-and-composer.md L662]. Folding them into the
 * person mention would mean storing an identifier for somebody who does not
 * exist, and leaving them out would mean the typeahead can offer something the
 * body cannot hold.
 *
 * The audience is a routing instruction, never an authorization: which accounts
 * are in it, and which of those may read the conversation, is resolved
 * server-side per `S-AUTHZ-READ`.
 */
export const ContentAudienceMentionNodeSchema = z.strictObject(
  {
    type: z.literal('audience_mention', NODE_TYPE_PARAMS),
    target: ContentAudienceTargetSchema,
  },
  NODE_OBJECT_PARAMS,
);

/** An audience-mention chip. */
export type ContentAudienceMentionNode = z.infer<typeof ContentAudienceMentionNodeSchema>;

/**
 * A hyperlink, held as "a separate display text and destination pair, both
 * editable and removable after insertion"
 * [docs/workflows/03-messaging-and-composer.md L651, frame 176, frame 239,
 * frame 241].
 *
 * The pair is the whole point of the shape. Two independent untrusted values,
 * neither validating the other and neither derivable from the other: a label is
 * not inferred from a destination, and a destination is not checked against a
 * label. `S-LINK` requires exactly that independence
 * [docs/workflows/00-product-overview.md L536], and the observed behaviour
 * requires it too — the dialog pre-fills the label from the selection and then
 * lets both be edited [docs/workflows/03-messaging-and-composer.md L776], so a
 * schema insisting they agree would refuse the product's own flow.
 */
export const ContentLinkNodeSchema = z.strictObject(
  {
    type: z.literal('link', NODE_TYPE_PARAMS),
    label: ContentLinkLabelSchema,
    destination: ContentLinkDestinationSchema,
  },
  NODE_OBJECT_PARAMS,
);

/** A hyperlink. */
export type ContentLinkNode = z.infer<typeof ContentLinkNodeSchema>;

/**
 * Every node that may appear inline, discriminated on `type`.
 *
 * A discriminated union rather than a plain one, so a node that names an unknown
 * type is refused precisely at that node instead of producing an alternatives
 * report against every member, and so the server can switch over the set
 * exhaustively — which is what makes adding a member a compile error at every
 * point that handles them rather than a silent gap.
 */
export const ContentInlineNodeSchema = z.discriminatedUnion(
  'type',
  [
    ContentTextNodeSchema,
    ContentEmojiNodeSchema,
    ContentChannelMentionNodeSchema,
    ContentPersonMentionNodeSchema,
    ContentAudienceMentionNodeSchema,
    ContentLinkNodeSchema,
  ],
  { error: 'content_node_not_allowed' satisfies ContentRejectionCode },
);

/** Every node that may appear inline. */
export type ContentInlineNode = z.infer<typeof ContentInlineNodeSchema>;

/* -------------------------------------------------------------------------- */
/* Block nodes                                                                */
/* -------------------------------------------------------------------------- */

/*
 * The block structures nest, so their types are written out by hand below and
 * the schemas reach one another through a deferred reference annotated with the
 * type it will resolve to. Inference cannot close a cycle on its own, and a
 * schema that reads as recursive while inferring an unconstrained type is worse
 * than one that does not compile: it validates nothing and says nothing.
 *
 * Two structures nest, and both nest because the corpus shows the structure
 * rather than because generality is nice to have: a list item holds a list
 * [frame 141, frame 120], and a quote holds blocks [frame 233]. `MAX_DOCUMENT_DEPTH`
 * is what makes the recursion bounded, and it is the reason a depth bound is a
 * real rule here rather than a formality.
 */

/** A paragraph: the block that carries inline content. */
export interface ContentParagraphNode {
  readonly type: 'paragraph';
  readonly children: ContentInlineNode[];
}

/** One entry of a list, holding inline content and any list nested under it. */
export interface ContentListItemNode {
  readonly type: 'list_item';
  readonly children: ContentListItemChild[];
}

/** What one list entry may hold: inline content, or a list nested inside it. */
export type ContentListItemChild =
  ContentInlineNode | ContentBulletedListNode | ContentOrderedListNode;

/** A bulleted list [frame 141]. */
export interface ContentBulletedListNode {
  readonly type: 'bulleted_list';
  readonly children: ContentListItemNode[];
}

/** An ordered list [frame 120]. */
export interface ContentOrderedListNode {
  readonly type: 'ordered_list';
  readonly children: ContentListItemNode[];
}

/** A blockquote [frame 233]. */
export interface ContentBlockquoteNode {
  readonly type: 'blockquote';
  readonly children: ContentBlockNode[];
}

/** A code block [frame 236]. */
export interface ContentCodeBlockNode {
  readonly type: 'code_block';
  readonly text: string;
  readonly language?: string | undefined;
}

/** Every node valid at the document root and inside a quote. */
export type ContentBlockNode =
  | ContentParagraphNode
  | ContentBulletedListNode
  | ContentOrderedListNode
  | ContentBlockquoteNode
  | ContentCodeBlockNode;

/**
 * A paragraph.
 *
 * Authored rather than observed, and unavoidable: a quote and a list both hold
 * text, and a structured document has nowhere to put text except inside a
 * block. It is also how a multi-line body exists at all — a line break in this
 * vocabulary is the next paragraph, never a character inside a run, which is
 * what keeps a body free of the control characters `S-CONTENT` refuses.
 */
export const ContentParagraphNodeSchema = z.strictObject(
  {
    type: z.literal('paragraph', NODE_TYPE_PARAMS),
    children: nodeChildren(ContentInlineNodeSchema),
  },
  NODE_OBJECT_PARAMS,
);

/**
 * One entry of a list.
 *
 * Authored for the same reason as the paragraph: a list is evidenced
 * [frame 141, frame 120] and a list cannot hold text without an entry to hold
 * it. An entry may also hold a list, which is the nesting a bulleted or ordered
 * list needs and the reason the depth bound exists.
 */
export const ContentListItemNodeSchema = z.strictObject(
  {
    type: z.literal(CONTENT_LIST_ITEM_NODE_TYPE, NODE_TYPE_PARAMS),
    children: nodeChildren(
      z.lazy((): z.ZodType<ContentListItemChild> => ContentListItemChildSchema),
    ),
  },
  NODE_OBJECT_PARAMS,
);

/**
 * A bulleted list [frame 141].
 *
 * Kept separate from the ordered list rather than expressed as one list node
 * with a style property. Two reasons, and the second is the load-bearing one:
 * the catalog reports them as two distinct block structures and as two distinct
 * toolbar controls [docs/workflows/03-messaging-and-composer.md L523, L547], and
 * a discriminated union over `type` is what lets a consumer narrow to exactly
 * one of them without reading a second field.
 */
export const ContentBulletedListNodeSchema = z.strictObject(
  {
    type: z.literal('bulleted_list', NODE_TYPE_PARAMS),
    children: nodeChildren(ContentListItemNodeSchema),
  },
  NODE_OBJECT_PARAMS,
);

/**
 * An ordered list [frame 120].
 *
 * It carries no start number and its entries carry no completion state. Neither
 * appears anywhere in the corpus, and where the corpus is silent the smallest
 * coherent shape is the one to build; adding either would be inventing a
 * feature and then having to render it. The absence is recorded here so it reads
 * as a decision rather than an omission.
 */
export const ContentOrderedListNodeSchema = z.strictObject(
  {
    type: z.literal('ordered_list', NODE_TYPE_PARAMS),
    children: nodeChildren(ContentListItemNodeSchema),
  },
  NODE_OBJECT_PARAMS,
);

/** What one list entry may hold, discriminated on `type`. */
export const ContentListItemChildSchema = z.discriminatedUnion(
  'type',
  [ContentInlineNodeSchema, ContentBulletedListNodeSchema, ContentOrderedListNodeSchema],
  { error: 'content_node_not_allowed' satisfies ContentRejectionCode },
);

/**
 * A blockquote [frame 233].
 *
 * Its children are the block vocabulary, so a quote may hold a paragraph, a
 * list, a code block or another quote. Narrowing that set would mean inventing a
 * restriction the catalog does not state, and quoting a quote is the case that
 * makes any narrower rule wrong immediately. The depth bound is what keeps the
 * generality safe.
 */
export const ContentBlockquoteNodeSchema = z.strictObject(
  {
    type: z.literal('blockquote', NODE_TYPE_PARAMS),
    children: nodeChildren(z.lazy((): z.ZodType<ContentBlockNode> => ContentBlockNodeSchema)),
  },
  NODE_OBJECT_PARAMS,
);

/**
 * A code block [frame 236].
 *
 * It holds text directly rather than inline children, because it "is a container
 * for text, never for execution"
 * [docs/workflows/03-messaging-and-composer.md L716]. That shape does the work
 * a comment otherwise would: a mark cannot be applied inside a code block
 * because there is no run to apply it to, which is correct — inline code is the
 * mark for a literal inside a sentence, and a code block is the block for a
 * literal that is the whole content.
 *
 * The language hint is optional and opaque. It chooses a highlighting vocabulary
 * at render time and is bounded and pattern-restricted so it can never be
 * anything a renderer might interpret.
 */
export const ContentCodeBlockNodeSchema = z.strictObject(
  {
    type: z.literal('code_block', NODE_TYPE_PARAMS),
    text: ContentCodeTextSchema,
    language: ContentCodeLanguageHintSchema.optional(),
  },
  NODE_OBJECT_PARAMS,
);

/** Every node valid at the document root and inside a quote, discriminated on `type`. */
export const ContentBlockNodeSchema = z.discriminatedUnion(
  'type',
  [
    ContentParagraphNodeSchema,
    ContentBulletedListNodeSchema,
    ContentOrderedListNodeSchema,
    ContentBlockquoteNodeSchema,
    ContentCodeBlockNodeSchema,
  ],
  { error: 'content_node_not_allowed' satisfies ContentRejectionCode },
);

/**
 * Every node in the vocabulary, discriminated on `type`.
 *
 * Derived from the three unions above rather than restating their members, so
 * the vocabulary has one definition and a node added to it cannot be added to
 * some unions and forgotten in this one.
 *
 * The document root is deliberately absent: it is not a node, and admitting it
 * here would make a document valid as its own child.
 */
export const ContentNodeSchema = z.discriminatedUnion(
  'type',
  [ContentInlineNodeSchema, ContentBlockNodeSchema, ContentListItemNodeSchema],
  { error: 'content_node_not_allowed' satisfies ContentRejectionCode },
);

/** Every node in the vocabulary. */
export type ContentNode = z.infer<typeof ContentNodeSchema>;

/* -------------------------------------------------------------------------- */
/* Walking the tree                                                           */
/* -------------------------------------------------------------------------- */

/*
 * Two total functions over the node union, each with an exhaustive switch, and
 * both used by the strict path and the lenient one. Exhaustive is the operative
 * word: adding a node type to the vocabulary without saying what it contributes
 * and what it contains is a compile error rather than a bound that quietly stops
 * counting part of the document.
 */

/**
 * The characters a node contributes on its own account, excluding its children.
 *
 * "Stored characters" rather than rendered ones. A mention chip renders as a
 * name resolved at render time and stores only its target, so its target is what
 * it costs; a link stores both halves of its pair, so it costs both.
 */
const ownCharacterCount = (node: ContentNode): number => {
  switch (node.type) {
    case 'text':
      return node.text.length;
    case 'emoji':
      return node.name.length;
    case 'channel_mention':
    case 'person_mention':
    case 'audience_mention':
      return node.target.length;
    case 'link':
      return node.label.length + node.destination.length;
    case 'code_block':
      return node.text.length + (node.language?.length ?? 0);
    case 'paragraph':
    case 'bulleted_list':
    case 'ordered_list':
    case 'list_item':
    case 'blockquote':
      return 0;
  }
};

/** The nodes a node contains, empty for a node that holds no others. */
const childNodesOf = (node: ContentNode): readonly ContentNode[] => {
  switch (node.type) {
    case 'text':
    case 'emoji':
    case 'channel_mention':
    case 'person_mention':
    case 'audience_mention':
    case 'link':
    case 'code_block':
      return [];
    case 'paragraph':
    case 'bulleted_list':
    case 'ordered_list':
    case 'list_item':
    case 'blockquote':
      return node.children;
  }
};

/**
 * The depth an outermost block sits at, which fixes what `MAX_DOCUMENT_DEPTH`
 * counts.
 *
 * Named because it is the origin of the depth scale rather than an increment,
 * and because both the measuring walk and the sanitising walk have to start from
 * the same place or the two paths would disagree about what a depth bound means.
 */
const ROOT_BLOCK_DEPTH = 1;

/** What one walk of a document establishes about its size. */
interface ContentMeasurement {
  nodeCount: number;
  characterCount: number;
  depth: number;
}

/** Accumulates node count, stored characters and greatest depth in one pass. */
const measureNodes = (
  nodes: readonly ContentNode[],
  depth: number,
  measurement: ContentMeasurement,
): void => {
  for (const node of nodes) {
    measurement.nodeCount += 1;
    measurement.characterCount += ownCharacterCount(node);
    if (depth > measurement.depth) {
      measurement.depth = depth;
    }
    const children = childNodesOf(node);
    if (children.length > 0) {
      measureNodes(children, depth + 1, measurement);
    }
  }
};

/* -------------------------------------------------------------------------- */
/* The document root                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A structured document: an ordered list of block nodes, and the shape every
 * rich field in this product stores.
 *
 * **This is what a body is. A body is never a markup string.** `S-CONTENT`
 * requires rich text to be "stored as a structured document of an allowlisted
 * node and mark vocabulary, never as markup to be re-parsed"
 * [docs/workflows/00-product-overview.md L526], and the reason is that the same
 * body is re-rendered in a thread pane, an activity entry, a search result, a
 * saved-for-later list and a forwarded copy
 * [docs/workflows/03-messaging-and-composer.md L716]. A markup string is safe
 * only in the one context it was escaped for; a structured document is safe in
 * all of them because each sink encodes it for itself.
 *
 * An empty document is valid. A rich field "permits an empty value, keeping its
 * save action enabled when the textarea is cleared"
 * [docs/workflows/02-channels.md L1008]. Whether a *particular operation* may
 * submit an empty body is that operation's rule, not the vocabulary's.
 *
 * Three bounds apply to the whole document rather than to any one field, because
 * no per-field bound can see them: the total stored characters, the total number
 * of nodes, and the greatest depth. They are measured in one walk after every
 * node has validated, so a document that fails one of them fails as a document
 * and says which bound it breached.
 *
 * This schema **rejects**. Use it wherever a mutation is validated, which is
 * every path where a principal submits content — including content that arrived
 * from inside the product, since app-supplied and forwarded bodies "carry the
 * identical contract and are not trusted for having arrived from inside the
 * product" [docs/workflows/03-messaging-and-composer.md L716]. Where a document
 * is being read back or migrated and refusing the whole value would be worse
 * than losing part of it, use `sanitizeContentDocument` below instead.
 */
export const ContentDocumentSchema = z
  .strictObject(
    {
      type: z.literal(CONTENT_DOCUMENT_TYPE, NODE_TYPE_PARAMS),
      children: nodeChildren(ContentBlockNodeSchema),
    },
    NODE_OBJECT_PARAMS,
  )
  .check((context) => {
    const measurement: ContentMeasurement = { nodeCount: 0, characterCount: 0, depth: 0 };
    measureNodes(context.value.children, ROOT_BLOCK_DEPTH, measurement);

    if (measurement.nodeCount > MAX_DOCUMENT_NODES) {
      context.issues.push({
        code: 'custom',
        input: context.value,
        path: ['children'],
        message: 'content_document_too_many_nodes' satisfies ContentRejectionCode,
      });
    }

    if (measurement.characterCount > MAX_DOCUMENT_CHARS) {
      context.issues.push({
        code: 'custom',
        input: context.value,
        path: ['children'],
        message: 'content_document_too_large' satisfies ContentRejectionCode,
      });
    }

    if (measurement.depth > MAX_DOCUMENT_DEPTH) {
      context.issues.push({
        code: 'custom',
        input: context.value,
        path: ['children'],
        message: 'content_depth_exceeded' satisfies ContentRejectionCode,
      });
    }
  });

/** A structured document. */
export type ContentDocument = z.infer<typeof ContentDocumentSchema>;

/* -------------------------------------------------------------------------- */
/* The sanitising path                                                        */
/* -------------------------------------------------------------------------- */

/*
 * `S-CONTENT` requires that "any node type outside the allowlist is dropped
 * rather than passed through" [docs/workflows/00-product-overview.md L526].
 * Dropping and rejecting are different obligations and a module offering only
 * one of them leaves a caller unable to satisfy the other, which is why both
 * exist here:
 *
 *   - `ContentDocumentSchema` REJECTS. It is what a mutation is validated
 *     against, because a body a principal is submitting right now can be
 *     refused with a reason while they are still looking at it.
 *   - `sanitizeContentDocument` DROPS. It is for a read or a migration, where
 *     the document is already stored, nobody is present to correct it, and
 *     refusing the whole value would lose content that is perfectly good.
 *
 * The rule the sanitiser follows is one sentence: project every node onto the
 * properties its shape declares, sanitise its children first, validate what
 * remains, and drop the node if it still does not validate. Sanitising children
 * before validating the parent is the part that matters — otherwise one
 * unrecognised descendant would take a whole valid quote or list with it.
 *
 * It repairs nothing. A value that is too long is not shortened and a name that
 * is malformed is not rewritten; the node carrying it is dropped. Repair would
 * mean inventing content on an author's behalf, which is exactly what
 * `S-CONTENT`'s refusal to truncate rules out.
 */

/** Narrows an unknown value to an object whose properties are unknown. */
const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * The properties each node type declares.
 *
 * Checked against the node vocabulary, so a node type added without an entry
 * here fails to compile rather than being silently stripped to nothing by the
 * sanitiser.
 */
const NODE_PROPERTY_ALLOWLIST = {
  text: ['type', 'text', 'marks'],
  emoji: ['type', 'name', 'skinTone'],
  channel_mention: ['type', 'target'],
  person_mention: ['type', 'target'],
  audience_mention: ['type', 'target'],
  link: ['type', 'label', 'destination'],
  paragraph: ['type', 'children'],
  bulleted_list: ['type', 'children'],
  ordered_list: ['type', 'children'],
  blockquote: ['type', 'children'],
  list_item: ['type', 'children'],
  code_block: ['type', 'text', 'language'],
} as const satisfies Record<ContentNodeType, readonly string[]>;

/**
 * The node types each node type may contain, empty where it contains none.
 *
 * Derived from the vocabulary rather than restated, and total over it for the
 * same reason as the table above. It is what lets the sanitiser drop a child
 * that is valid in itself but misplaced — a paragraph directly inside a list,
 * say — instead of failing the parent that holds it.
 */
const NODE_CHILD_TYPES = {
  text: [],
  emoji: [],
  channel_mention: [],
  person_mention: [],
  audience_mention: [],
  link: [],
  code_block: [],
  paragraph: CONTENT_INLINE_NODE_TYPES,
  bulleted_list: [CONTENT_LIST_ITEM_NODE_TYPE],
  ordered_list: [CONTENT_LIST_ITEM_NODE_TYPE],
  blockquote: CONTENT_BLOCK_NODE_TYPES,
  list_item: [...CONTENT_INLINE_NODE_TYPES, 'bulleted_list', 'ordered_list'],
} as const satisfies Record<ContentNodeType, readonly ContentNodeType[]>;

/** What the sanitiser has left to spend, and what it has had to discard. */
interface SanitizationBudget {
  remainingNodes: number;
  remainingCharacters: number;
  droppedNodeCount: number;
  truncated: boolean;
}

/** What `sanitizeContentDocument` reports back. */
export interface ContentSanitizationResult {
  /**
   * The sanitised document.
   *
   * Guaranteed to satisfy `ContentDocumentSchema`: it is the output of a parse
   * against that schema, not a value assembled and hoped over.
   */
  readonly document: ContentDocument;
  /**
   * How many nodes were discarded.
   *
   * A count and never the discarded values. What was dropped is attacker-
   * controlled, so reporting it would hand an untrusted string to whatever reads
   * this — a log, a metric label, an error report — which is the leak path
   * `S-CONTENT` closes on every other value in this module.
   */
  readonly droppedNodeCount: number;
  /** Whether a document-wide budget ran out, so content was discarded to fit. */
  readonly truncated: boolean;
}

/** Reads a candidate's declared node type, or nothing if it names none. */
const readNodeType = (candidate: unknown): ContentNodeType | undefined => {
  if (!isRecord(candidate)) {
    return undefined;
  }
  const declared = candidate['type'];
  if (typeof declared !== 'string') {
    return undefined;
  }
  return CONTENT_NODE_TYPES.find((nodeType) => nodeType === declared);
};

/** Copies across only the properties a shape declares, omitting absent ones. */
const pickProperties = (
  source: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): Record<string, unknown> => {
  const picked: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in source) {
      picked[key] = source[key];
    }
  }
  return picked;
};

/**
 * Sanitises one node, or reports that it could not be kept.
 *
 * Depth is tested before anything recurses, which is what makes this function
 * safe against a deliberately deep payload: its own recursion cannot go past
 * `MAX_DOCUMENT_DEPTH` levels however deep the input claims to be.
 */
const sanitizeNode = (
  candidate: unknown,
  depth: number,
  budget: SanitizationBudget,
): ContentNode | undefined => {
  if (depth > MAX_DOCUMENT_DEPTH) {
    budget.droppedNodeCount += 1;
    budget.truncated = true;
    return undefined;
  }

  const nodeType = readNodeType(candidate);
  if (nodeType === undefined || !isRecord(candidate)) {
    budget.droppedNodeCount += 1;
    return undefined;
  }

  const projected = pickProperties(candidate, NODE_PROPERTY_ALLOWLIST[nodeType]);

  const allowedChildTypes: readonly ContentNodeType[] = NODE_CHILD_TYPES[nodeType];
  if (allowedChildTypes.length > 0) {
    projected['children'] = sanitizeChildren(
      projected['children'],
      allowedChildTypes,
      depth + 1,
      budget,
    );
  }

  const parsed = ContentNodeSchema.safeParse(projected);
  if (!parsed.success) {
    budget.droppedNodeCount += 1;
    return undefined;
  }

  if (budget.remainingNodes <= 0) {
    budget.droppedNodeCount += 1;
    budget.truncated = true;
    return undefined;
  }

  const characters = ownCharacterCount(parsed.data);
  if (characters > budget.remainingCharacters) {
    budget.droppedNodeCount += 1;
    budget.truncated = true;
    return undefined;
  }

  budget.remainingNodes -= 1;
  budget.remainingCharacters -= characters;
  return parsed.data;
};

/**
 * Sanitises a children collection, keeping only nodes of the types the parent
 * admits and only as many as one node may hold.
 *
 * A value that is not a list yields no children rather than failing the parent,
 * which is the same drop-what-cannot-be-read rule applied one level up.
 */
const sanitizeChildren = (
  candidate: unknown,
  allowedChildTypes: readonly ContentNodeType[],
  depth: number,
  budget: SanitizationBudget,
): ContentNode[] => {
  if (!Array.isArray(candidate)) {
    return [];
  }

  const kept: ContentNode[] = [];
  for (const child of candidate) {
    if (kept.length >= MAX_NODE_CHILDREN) {
      budget.droppedNodeCount += 1;
      budget.truncated = true;
      continue;
    }
    const sanitized = sanitizeNode(child, depth, budget);
    if (sanitized === undefined) {
      continue;
    }
    if (!allowedChildTypes.some((allowed) => allowed === sanitized.type)) {
      budget.droppedNodeCount += 1;
      continue;
    }
    kept.push(sanitized);
  }
  return kept;
};

/**
 * Sanitises an arbitrary value into a document, dropping every node that is not
 * in the allowlist instead of refusing the whole value.
 *
 * This is the lenient half of `S-CONTENT`'s node rule, and its post-condition is
 * unconditional: whatever is passed in — a valid document, a document from an
 * older vocabulary, a fragment, a string, nothing at all — the document that
 * comes back satisfies `ContentDocumentSchema`. That holds because the returned
 * value is the *output* of a parse against that schema, with an empty document
 * as the fallback if the assembled value somehow fails; a failure there would be
 * a defect in this module, and dropping everything is the only safe way to
 * report one.
 *
 * It is not the mutation path. A principal submitting content is told what was
 * wrong with it, which means `ContentDocumentSchema` and a rejection.
 */
export const sanitizeContentDocument = (value: unknown): ContentSanitizationResult => {
  const budget: SanitizationBudget = {
    remainingNodes: MAX_DOCUMENT_NODES,
    remainingCharacters: MAX_DOCUMENT_CHARS,
    droppedNodeCount: 0,
    truncated: false,
  };

  const children = isRecord(value)
    ? sanitizeChildren(value['children'], CONTENT_BLOCK_NODE_TYPES, ROOT_BLOCK_DEPTH, budget)
    : [];

  const parsed = ContentDocumentSchema.safeParse({
    type: CONTENT_DOCUMENT_TYPE,
    children,
  });

  if (!parsed.success) {
    return {
      document: { type: CONTENT_DOCUMENT_TYPE, children: [] },
      droppedNodeCount: budget.droppedNodeCount + children.length,
      truncated: true,
    };
  }

  return {
    document: parsed.data,
    droppedNodeCount: budget.droppedNodeCount,
    truncated: budget.truncated,
  };
};
