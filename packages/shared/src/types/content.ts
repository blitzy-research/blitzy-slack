/**
 * Derived types for the allowlisted structured-content vocabulary.
 *
 * WHAT THIS MODULE IS
 *
 * Every type exported below is produced by `z.infer` over a schema that
 * `../schemas/content.js` exports, or by a derivation over such an inferred
 * type — an indexed access, a `Pick`, an `Extract`. There is no schema here, no
 * runtime value and no hand-written shape. Nothing in this file survives
 * compilation: it emits declarations and nothing else, which is why the package
 * declares itself free of side effects and why the coverage configuration
 * excludes this directory from measurement rather than reporting it at zero.
 *
 * The consequence worth stating plainly is that this module cannot drift. A
 * shape has exactly one definition — the schema — and a type inferred from that
 * definition changes when the definition changes. An `interface` restating a
 * schema's shape would be a second definition of one contract, and a second
 * definition is the thing that drifts, so none appears below. That discipline is
 * the same one the single-implementation rule imposes on the component
 * contracts: one contract, one place, extended rather than forked.
 *
 * WHERE EACH VOCABULARY'S CANONICAL TYPE LIVES
 *
 * The schema module already exports a derived type for most of its schemas, and
 * it must: the block vocabulary is mutually recursive — a quote holds blocks, a
 * list entry holds lists — and a recursive schema needs a declared type to
 * annotate its own deferred references before inference can close the loop.
 * Those declarations are load-bearing where they are and cannot be moved here.
 *
 * So this module does not restate them, and above all does not re-export them
 * under the same names: the package barrel flattens every module into one
 * namespace, and one name arriving from two modules is a compile error in a file
 * neither module owns. What lives next door, and is imported from there:
 *
 *   - the document root, the block-node union, the inline-node union and each
 *     named node member — paragraph, list, list entry, quote, code block, text
 *     run, emoji, channel mention, person mention, audience mention, hyperlink;
 *   - the node-type vocabulary covering all three families at once;
 *   - the mark union and the audience-target union;
 *   - the rejection-code union, and the sanitising path's result.
 *
 * What lives here is the remainder — the derived surface the schema module
 * leaves underived. Three kinds, and no fourth:
 *
 *   - a name for each bounded value schema, so a signature can say which
 *     bounded value it takes rather than saying only that it takes text;
 *   - the discriminant of each node union, extracted from the union itself, so a
 *     switch or a lookup table can be keyed by node type per family;
 *   - a narrowing for each node union, so one member can be named without
 *     importing every member.
 *
 * WHY THE FAMILIES STAY SEPARATE
 *
 * Inline nodes, block nodes and a list entry's children are three vocabularies,
 * not one. The schema keeps them apart deliberately — a list entry is only ever
 * a list's child, and admitting it at the document root would make a stray list
 * entry a valid document — and merging them here would erase that distinction at
 * exactly the point a consumer reads it. There is therefore no combined "node"
 * alias below, and marks are never folded into the node vocabulary: a mark
 * decorates a run, it is not a node, and one alias covering both would let a
 * caller pass either where only one is valid.
 *
 * WHAT THESE TYPES ARE NOT
 *
 * They are shapes. They are not a trust boundary, and no value acquires any
 * property by being annotated with one.
 *
 *   - **Validation happens elsewhere.** A value typed as anything below has
 *     satisfied the compiler, which says nothing about whether it satisfied the
 *     schema. Content arriving over the wire is parsed by the schema on the
 *     server, in `apps/api/src/content/validate.ts`, and a hyperlink
 *     destination is canonicalised and scheme-checked in
 *     `apps/api/src/links/canonicalize.ts` and
 *     `apps/api/src/links/allowlist.ts`. Content that arrived from inside the
 *     product carries the identical contract and is not trusted for having
 *     arrived from there [docs/workflows/03-messaging-and-composer.md L716], so
 *     the server re-validates this vocabulary independently of the editor that
 *     produced it — and independently of these types, which the server erases
 *     before it runs.
 *   - **No encoding happens here, or anywhere near here.** Output encoding is
 *     per destination context and is applied at render time, so that one stored
 *     value is safe in every context it appears in
 *     [docs/workflows/00-product-overview.md L526]. A type cannot encode, and a
 *     value shortened or escaped to fit a type would be a value its author never
 *     wrote.
 *   - **No authorization happens here.** A mention names a target so it can be
 *     rendered and so the right person can be notified; it grants nothing. Who
 *     may read the conversation a document sits in is decided server-side
 *     against the acting session, never from the payload, and nothing below
 *     carries a workspace identifier or an actor identifier that a decision
 *     could be keyed to.
 *
 * A NOTE ON OPTIONAL MEMBERS — OMIT THE PROPERTY, DO NOT ASSIGN IT
 *
 * A schema's optional field infers as an optional property whose value type
 * *includes* the absent case. That detail is worth knowing precisely, because it
 * is the opposite of what the exact-optional-property-types setting is usually
 * relied on for: the setting refuses the absent case only where the value type
 * excludes it, and here it does not, so **the compiler accepts both omitting the
 * property and assigning it the absent case**. Nothing in this module can stop
 * the second one, so it is documented instead.
 *
 * Omit it. The two forms are not interchangeable, and the difference is
 * observable rather than stylistic:
 *
 *   - The schema's own output for an absent optional **omits the key**. A value
 *     with the key present and holding nothing is a value the schema would never
 *     have produced, so it is not the shape a reader downstream is entitled to
 *     assume it received.
 *   - A presence test by key therefore disagrees with the two forms: it reports
 *     the property as present for an assigned absent case, and absent for an
 *     omitted one, while both carry the same nothing.
 *   - Serialising drops the assigned key. A value that has crossed the wire and
 *     one that has not are then unequal by key set, which is the kind of
 *     difference that survives every test written against the value's contents.
 *
 * This is the single most common way one of these types is misused. It is called
 * out again on each type below that sits in an optional slot.
 *
 * HOW TO CONSUME IT
 *
 * Through the package barrel — `@relay/shared` — and not by path. Inside this
 * package the sibling schema module is reached relatively, because that is how a
 * package is built; from outside, the barrel is the only entry point.
 */
import type { z } from 'zod';
import type {
  ContentBlockNodeSchema,
  ContentCodeLanguageHintSchema,
  ContentCodeTextSchema,
  ContentDocumentSchema,
  ContentEmojiNameSchema,
  ContentInlineNodeSchema,
  ContentLinkDestinationSchema,
  ContentLinkLabelSchema,
  ContentLinkNodeSchema,
  ContentListItemChildSchema,
  ContentMarkListSchema,
  ContentMentionTargetSchema,
  ContentSearchTermSchema,
  ContentTextRunSchema,
} from '../schemas/content.js';

/* -------------------------------------------------------------------------- */
/* Bounded values                                                             */
/* -------------------------------------------------------------------------- */

/*
 * Each type in this section resolves to text, and that is the point rather than
 * a shortcoming. The schemas differ in what they accept — how much, in which
 * form, against which pattern, and whether a break is content or a control
 * character — and none of that difference is expressible in the type system. A
 * signature naming one of them therefore says which bounded value it wants,
 * which is strictly more than a bare text type says, while leaving enforcement
 * where enforcement belongs: in the schema.
 *
 * No bound appears here, in a type or in a comment. Every bound is declared once
 * in the schema module and reaches these types only through the schema that
 * consumed it, so there is no number in this file to fall out of step with one.
 */

/**
 * The text of one run: bounded, normalised, and free of control and
 * bidirectional-formatting characters, with a line break treated as a control
 * character rather than as content.
 *
 * Empty is a legitimate value. A break between two runs is another node, never a
 * character inside one, so an empty run is how a blank line exists in a
 * structured document. Whether an empty *body* may be submitted is a rule about
 * an operation rather than about the vocabulary, and is not decided here.
 */
export type ContentTextRun = z.infer<typeof ContentTextRunSchema>;

/**
 * The text inside a code block: the same pipeline as a run, with a line feed and
 * a tab treated as the content they are.
 *
 * A code block is a container for text and never for execution, so nothing about
 * this type invites a consumer to evaluate it — and nothing about it exempts the
 * value from being encoded for whichever sink renders it.
 */
export type ContentCodeText = z.infer<typeof ContentCodeTextSchema>;

/**
 * A hyperlink's display text.
 *
 * Untrusted on its own terms, and deliberately **never** checked against the
 * destination it accompanies. The two halves are separately editable after
 * insertion, so a rule forcing one to agree with the other would contradict the
 * behaviour the product actually has. What answers the misrepresentation risk is
 * presentation — the destination is rendered alongside the label — together with
 * the encoding every sink applies. Neither is a property of this type.
 */
export type ContentLinkLabel = z.infer<typeof ContentLinkLabelSchema>;

/**
 * A hyperlink's destination.
 *
 * The schema parses it canonically before storage and admits only the two
 * schemes on the allowlist, refusing at input rather than avoiding at render.
 * A value typed as this has passed the compiler and says nothing about having
 * passed that schema: an address that reaches the server is canonicalised and
 * scheme-checked there before it is stored, rendered or followed.
 */
export type ContentLinkDestination = z.infer<typeof ContentLinkDestinationSchema>;

/**
 * The name identifying an emoji.
 *
 * A required value: an emoji with no name has nothing to render. The schema also
 * constrains its form, which no type can express, so a consumer that composes
 * one rather than echoing one back must let the schema decide whether it is
 * well formed.
 */
export type ContentEmojiName = z.infer<typeof ContentEmojiNameSchema>;

/**
 * A code block's language hint.
 *
 * A hint, not an instruction: it selects how a block is presented and never
 * what is done with its contents.
 *
 * It sits in an optional slot, so a block with no hint **omits** the property.
 * The compiler would also accept the property carrying the absent case, and the
 * schema would not produce that; see the note on optional members above.
 */
export type ContentCodeLanguageHint = z.infer<typeof ContentCodeLanguageHintSchema>;

/**
 * The opaque identifier a channel mention or a person mention names.
 *
 * Opaque is the operative word. It is an identifier to resolve, and resolving it
 * is a projection that is authorized server-side against the acting session; the
 * identifier's presence in a document establishes nothing about who may see what
 * it points at. An audience mention carries an audience token instead, which is
 * a closed set and has its own type in the schema module.
 */
export type ContentMentionTarget = z.infer<typeof ContentMentionTargetSchema>;

/**
 * A term bounded before it is matched against stored content.
 *
 * It lives in this vocabulary because match highlighting is a distinct sink with
 * two untrusted sides: the term is typed by the viewer and the surrounding text
 * was authored by somebody else. Both are encoded before any highlight is
 * inserted, and matching is literal rather than pattern-based so that a term
 * cannot be interpreted as an expression. Bounding the term is what keeps the
 * matching side of that from being handed unbounded work.
 */
export type ContentSearchTerm = z.infer<typeof ContentSearchTermSchema>;

/**
 * The marks carried by one run: each drawn from the allowlist, none repeated.
 *
 * Refusing a repeat is a canonical-form rule rather than a nicety — two runs
 * differing only in how often they name the same mark render identically — and
 * it is enforced by the schema, not by this type. A list is ordered and this
 * type says nothing about the order mattering; it does not.
 *
 * Marks sit in an optional slot on a run, so an unformatted run **omits** the
 * property — not the absent case, and not an empty list either. All three would
 * satisfy the compiler and only the omission is what the schema produces; see
 * the note on optional members above.
 */
export type ContentMarkList = z.infer<typeof ContentMarkListSchema>;

/* -------------------------------------------------------------------------- */
/* Union discriminants, one per family                                        */
/* -------------------------------------------------------------------------- */

/*
 * Each discriminant below is read off its own union with an indexed access, so
 * it is derived from the union rather than listed beside it. Listing the members
 * again — even correctly — would be a second enumeration of one vocabulary, and
 * the second one is the one that is wrong after the first one changes.
 *
 * There are three of them because there are three vocabularies, and the schema
 * module exports a fourth type covering all three families at once. That
 * combined type is the right one for a walk that visits every node whatever it
 * is; the three below are the right ones wherever position matters — what may
 * sit inside a paragraph, what may sit at the document root, what may sit inside
 * a list entry. Keeping them apart is what makes a lookup table keyed by one of
 * them exhaustive over the family it actually serves.
 */

/**
 * The document root's own discriminant.
 *
 * A single value, and its own family of one. The root is deliberately absent
 * from every node union, so a document cannot be nested inside itself; that
 * exclusion is why this is derived from the document schema rather than found
 * among the node types.
 */
export type ContentDocumentType = z.infer<typeof ContentDocumentSchema>['type'];

/** The discriminant of an inline node — what may sit inside a paragraph. */
export type ContentInlineNodeType = z.infer<typeof ContentInlineNodeSchema>['type'];

/**
 * The discriminant of a block node — what may sit at the document root, and
 * inside a quote.
 *
 * A list entry is not among them. It is a structural node that is only ever a
 * list's child, and admitting it here would make a stray list entry valid at the
 * root.
 */
export type ContentBlockNodeType = z.infer<typeof ContentBlockNodeSchema>['type'];

/**
 * The discriminant of a list entry's children — inline content, or a nested
 * list.
 *
 * Overlapping the two unions above without being either: a list entry holds
 * inline content and it holds the nesting that makes a list a tree, and it holds
 * neither a paragraph nor a quote. It is derived from its own schema for exactly
 * that reason, since neither of the other two discriminants describes it.
 */
export type ContentListItemChildType = z.infer<typeof ContentListItemChildSchema>['type'];

/* -------------------------------------------------------------------------- */
/* Narrowing one member out of a family                                       */
/* -------------------------------------------------------------------------- */

/*
 * A renderer, a walk and a transform all do the same thing: branch on a node's
 * discriminant and then work with that one member. Each generic below names that
 * one member by extracting it from the union, which keeps a per-member signature
 * from having to import every member — and, more usefully, keeps the extraction
 * honest. Passing a discriminant the family does not contain resolves to nothing
 * assignable, so the mistake surfaces where it is written rather than where the
 * value is used.
 *
 * Each is a type-level construct and each accepts a union of discriminants as
 * readily as a single one, resolving to the union of the members that match.
 */

/**
 * The inline node, or nodes, carrying a given discriminant.
 *
 * Narrowed from the union rather than restating any member, so a member gains a
 * field exactly when its schema does.
 */
export type ContentInlineNodeOfType<TType extends ContentInlineNodeType> = Extract<
  z.infer<typeof ContentInlineNodeSchema>,
  { type: TType }
>;

/** The block node, or nodes, carrying a given discriminant. */
export type ContentBlockNodeOfType<TType extends ContentBlockNodeType> = Extract<
  z.infer<typeof ContentBlockNodeSchema>,
  { type: TType }
>;

/** The list-entry child, or children, carrying a given discriminant. */
export type ContentListItemChildOfType<TType extends ContentListItemChildType> = Extract<
  z.infer<typeof ContentListItemChildSchema>,
  { type: TType }
>;

/* -------------------------------------------------------------------------- */
/* Two derived shapes worth naming                                            */
/* -------------------------------------------------------------------------- */

/**
 * A hyperlink's two halves without its node wrapper: the display text and the
 * destination.
 *
 * Named because the pair is reused. A bookmark on a conversation is the same
 * shape as a hyperlink inside a body, and a second declaration of it elsewhere
 * would be a second definition of one contract — so it is derived from the link
 * node here instead, and a surface that stores or edits a pair without wrapping
 * it in a node has a name for what it is holding.
 *
 * **The two halves are independent untrusted values.** Neither is evidence about
 * the other, and this type asserts nothing about either: the label may say
 * anything and the destination may be any text at all until the schema has
 * parsed it. A caller must treat both as arriving from outside — the destination
 * canonicalised and restricted to the two allowed schemes at input, the label
 * encoded for whichever sink renders it — and must not infer from the pairing
 * that the label describes where the link goes. That is the whole reason the
 * product renders the destination beside the label rather than trusting the
 * label to report it.
 */
export type ContentLinkPair = Pick<z.infer<typeof ContentLinkNodeSchema>, 'label' | 'destination'>;

/**
 * The block sequence a document holds at its root.
 *
 * Derived from the document rather than assembled from the block union, so it
 * inherits the root's own rule about what may sit directly inside it. A consumer
 * that renders a body, measures one, or maps over one takes this rather than
 * reaching through the document type at each call site.
 */
export type ContentDocumentChildren = z.infer<typeof ContentDocumentSchema>['children'];
