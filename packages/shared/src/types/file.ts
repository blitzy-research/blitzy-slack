/**
 * Derived types for the pre-signed upload contract.
 *
 * WHAT THIS MODULE IS
 *
 * Every type exported below is produced by `z.infer` over a schema that
 * `../schemas/file.js` exports, or by a derivation over such an inferred type —
 * an indexed access, a `Pick`, an `Extract`. There is no schema here, no runtime
 * value and no hand-written shape. Nothing in this file survives compilation: it
 * emits declarations and nothing else, which is why the package declares itself
 * free of side effects.
 *
 * The consequence worth stating plainly is that this module cannot drift. A
 * shape has exactly one definition — the schema — and a type inferred from that
 * definition changes when the definition changes. An `interface` restating a
 * file's shape, or an attachment's, would be a second definition of one
 * contract, and a second definition is the thing that drifts, so none appears
 * below. That discipline is the same one the single-implementation rule imposes
 * on the component contracts: one contract, one place, extended rather than
 * forked.
 *
 * THE DEFINING PROPERTY: BYTES NEVER PASS THROUGH THE API
 *
 * A transfer has two halves and the product sits at neither end of the middle.
 * The client describes what it intends to send and asks for permission; the
 * server authorizes that intent and returns a destination scoped to one object;
 * the client sends the bytes **straight to object storage**; the client then
 * tells the server the transfer finished, and the server verifies the object for
 * itself before making it visible. A file is deliberately **not proxied through
 * the API**.
 *
 * So the whole upload surface is two small metadata exchanges wrapped around a
 * transfer the product never touches, and every type below reads as metadata
 * *about* a transfer rather than as the transfer itself. There is no content
 * member, no encoded payload, no octet string, no data address and no stream in
 * this module or in the schema it derives from, and there must never be one. A
 * type that could carry file content would not be a small modelling liberty: it
 * would delete the property the whole design exists to obtain — bytes that never
 * reach the application cannot exploit its parsers, cannot be written to a log by
 * accident and cannot consume the request path's memory — and it would do so
 * silently, because such a member looks entirely ordinary beside the ones that
 * belong. If a shape being added here could hold content, that is the signal the
 * line has been crossed.
 *
 * THE THREE DECLARED VALUES ARE CLAIMS, NOT FACTS
 *
 * This is the single most important thing a consumer of these types needs to
 * know, and it is invisible from the shapes alone.
 *
 * Pre-signing moves the trust boundary. The three values a client sends at
 * initiation — the filename, the content type and the byte size — are **claims
 * made by an untrusted party about bytes the server has not seen**. They are
 * validated by the schema so that a hopeless request fails fast and cheaply, and
 * that is all a schema or a type can do for them. The stored content type is
 * re-derived server-side **from the content itself** rather than from the
 * filename or the declared media type; the declared size is enforced by the
 * policy attached to the pre-signed grant; and the filename is sanitised before
 * it is used in a header, a path or a rendered label. This is why `declared` is
 * part of each of those three member names rather than a remark in a comment,
 * and why `DeclaredContentType` and `DerivedContentType` are two names below even
 * though they resolve to the same set: one is what the caller asserted, the other
 * is what the server determined, and a signature that cannot tell them apart is a
 * signature that has lost the distinction the design depends on. Treating a
 * declared value as fact reintroduces exactly the vulnerability pre-signing
 * removes.
 *
 * NOTHING HERE CONFERS ANY AUTHORITY
 *
 * These are shapes. They are not a trust boundary, and no value acquires any
 * property by being annotated with one.
 *
 *   - **This module introduces no mutation and no projection.** It is a set of
 *     type aliases; there is no operation here to authorize and no read path here
 *     to isolate. The mutations and projections that use these shapes are
 *     authorized where they execute, in the server's own guard, and each ships
 *     its own denial coverage there. No denial test is owed by this file, and
 *     fabricating one would assert a check that does not exist at this layer.
 *   - **A caller-supplied reference confers nothing.** The completion request
 *     names the object and the purpose it belongs to, and the purpose carries the
 *     owning conversation, the message draft or the person's own record. Every
 *     one of those references arrived from the caller. None of them is evidence of
 *     permission, and no authorization decision may rest on one: the write path
 *     resolves the target the purpose names and authorizes the acting session
 *     against **that specific object**, at the point of execution, and it repeats
 *     that check at completion because a grant issued a moment ago is not a grant
 *     now. Client rendering is never evidence of permission either — a control
 *     that is hidden, disabled or absent exempts nothing.
 *   - **No shape here names a workspace or an actor**, and none may be added.
 *     The workspace comes from the acting session and is injected below the query
 *     by the data layer's tenancy extension; the uploader *is* the acting
 *     session. With no member to populate, a caller cannot even attempt to upload
 *     as somebody else or into somebody else's workspace, which is what makes the
 *     prohibition on caller-supplied identifiers structural here rather than a
 *     check somebody has to remember. No helper type carrying a workspace
 *     identifier belongs in this file.
 *   - **Validation happens elsewhere.** A value typed as anything below has
 *     satisfied the compiler, which says nothing about whether it satisfied the
 *     schema. A payload arriving over the wire is parsed by the schema on the
 *     server, independently of these types, which the server erases before it
 *     runs.
 *
 * PER-VIEWER STATE IS ABSENT BY DESIGN
 *
 * One member a reader may expect on the stored-file record is deliberately not
 * there. A shared-files listing groups its entries by recency of *viewing*, and
 * the consolidated model places that value on a relation keyed by viewer and
 * file rather than on the file. A viewed-at column on the shared record would
 * mean one person opening a file marked it opened for everyone, and would
 * additionally disclose that person's behaviour to every other member. The
 * grouping key is therefore per-viewer state owned elsewhere, it is not a member
 * of the record, and nothing below should be read as implying that it is.
 *
 * WHAT THIS MODULE ADDS, AND WHAT IT ONLY SURFACES
 *
 * The schema module next door already derives a type for most of its own
 * schemas, and those declarations are load-bearing where they are. This module
 * therefore does two different things, and the difference matters:
 *
 *   - It **surfaces** that existing vocabulary by re-export, so the complete file
 *     contract can be reached from one module. A re-export introduces **no new
 *     declaration** — it names the schema module's own type — so it cannot become
 *     a second definition. Re-declaring one of those names here would be a second
 *     definition, and the package barrel flattens every module into one namespace,
 *     so the duplicate surfaces as an ambiguity error in a file neither module
 *     owns. That failure mode is the reason the block below re-exports rather
 *     than restates.
 *   - It **adds** the derived surface the schema module leaves underived: a name
 *     for each bounded value schema, a name for each member of the purpose union,
 *     a narrowing for each discriminated union, and two derived shapes worth
 *     naming. Nothing below duplicates a name the schema module already owns.
 *
 * WHY THE MEDIA SUB-SHAPES STAY SEPARATE
 *
 * An audio clip, a video clip, a document preview, a profile photo, a snippet, a
 * custom emoji image and a plain attachment are seven shapes, not one shape with
 * every member made absent. Flattening them would erase the distinction at
 * exactly the point a consumer reads it: the media-player contract distinguishes
 * an audio clip — a circular play control, a waveform and a duration readout —
 * from a video clip, whose review form adds a scrubber and a selectable
 * thumbnail (frames 190, 197). A flattened type would make that distinction
 * unexpressible at the boundary, so the union is narrowed below rather than
 * collapsed. Note that a waveform is an affordance the player draws, not a member
 * of the contract: no schema carries one, so no type here invents one.
 *
 * A NOTE ON ABSENCE — AN EXPLICIT NULL, NOT AN OMITTED KEY
 *
 * This contract expresses absence differently from its sibling vocabularies, and
 * the difference is worth knowing before a consumer writes against it. Not one
 * schema in this module's source is optional; the members that may be absent —
 * a video clip's thumbnail, a document's page count and preview, a file's sharer
 * — are **nullable** instead. So the key is always present and carries an
 * explicit null when there is nothing to report.
 *
 * The practical consequences: a consumer must **not** omit one of those keys and
 * must not assign it undefined, because neither is a value the schema would ever
 * produce; a presence test by key answers nothing, so the null must be tested
 * for directly; and the exact-optional-property-types setting this package
 * compiles under has nothing to bite on here, since it governs optional
 * properties and there are none. Absence being a value rather than a missing key
 * is also why a value that has crossed the wire and one that has not compare
 * equal by key set, which is a property the sibling vocabularies do not have.
 *
 * HOW TO CONSUME IT
 *
 * Through the package barrel — and not by path. Inside this package the sibling
 * schema module is reached relatively, because that is how a package is built;
 * from outside, the barrel is the only entry point.
 *
 * HOW THE PROJECT RULES AND THE FRAMES ARE CITED
 *
 * The binding project rules are referred to above by description — the
 * single-implementation rule, the server-side authorization rule, the
 * corpus-handling rule, the rule that uncertainty is never permission to omit,
 * and the third-party identity rule. Their own identifiers are deliberately not
 * written anywhere in this file, because each one embeds the third-party product
 * name that the identity rule forbids from appearing in source or in comments;
 * writing them would put the build's own brand guard in the position of failing
 * on the file that cites the rule it enforces. A downstream reader should not
 * "restore" them. The authoritative wording of each rule lives in the rules
 * interface, and this file summarises rather than restates it.
 *
 * Frames are cited by NUMBER alone for the same reason: each frame filename
 * embeds the prohibited name, and renaming the corpus is forbidden, so number-only
 * citation is the only reconciliation available. No corpus path appears in this
 * file, the corpus is never modelled as an upload source, and it must not reach
 * build output, a container image or a client bundle — this module is re-exported
 * into the client bundle, so a screenshot path here would be a path into the
 * shipped product. Any example filename in a comment below is authored.
 *
 * No bound appears in this file, in a type or in a comment. Every ceiling, floor
 * and pattern is declared once in the schema module as a named constant and
 * reaches these types only through the schema that consumed it, so there is no
 * number here that can fall out of step with one. Every instant is an absolute
 * instant; the one duration this contract carries is a media clip's intrinsic
 * playback length, which is a property of the recording rather than a policy
 * window, and it is left exactly as the schema types it.
 */
import type { z } from 'zod';
import type {
  conversationAttachmentPurposeSchema,
  customEmojiImagePurposeSchema,
  declaredContentTypeSchema,
  declaredFilenameSchema,
  derivedContentTypeSchema,
  fileMediaSchema,
  messageDraftAttachmentPurposeSchema,
  objectReferenceSchema,
  presignedDestinationSchema,
  profilePhotoPurposeSchema,
  snippetPurposeSchema,
  storedFileSchema,
  uploadIdSchema,
  uploadInitiationRequestSchema,
  uploadPurposeSchema,
  uploadStateSchema,
} from '../schemas/file.js';

/* -------------------------------------------------------------------------- */
/* The contract's existing vocabulary, surfaced                               */
/* -------------------------------------------------------------------------- */

/*
 * A re-export, never a re-declaration. Each name below is the schema module's
 * own inferred type reached through this module, so the contract has one
 * definition and this file adds none. Grouped as the contract reads: the closed
 * set of rejection reasons, the accepted media types, the purpose the transfer
 * serves, the two round trips, the transfer's own lifecycle, the seven media
 * sub-shapes kept distinct, and the stored record.
 */
export type {
  // The closed set of machine-readable refusal reasons. A code, never a rendered
  // sentence: the wording a person reads is chosen by the client from the
  // authored copy module, so no user-facing prose exists in this package and no
  // refusal can leak an implementation detail.
  UploadRejectionCode,

  // The accepted content types, and the geometry a square crop is expressed
  // with.
  AllowedContentType,
  CropGeometry,

  // What the transfer is for. This union is not descriptive metadata: it names
  // the object the server authorizes against, which makes it the most
  // load-bearing shape in the contract.
  UploadPurpose,
  UploadPurposeKind,

  // The two round trips. They are two shapes and stay two shapes: initiation
  // describes an intention and receives a capability, completion reports a
  // finished transfer. Merging them would merge a request for permission with a
  // claim that permission was already exercised.
  UploadInitiationRequest,
  UploadInitiationResponse,
  UploadCompletionRequest,

  // The transfer's lifecycle, as a union and as its four members. In-progress
  // and failed are the two a surface renders most, and a failure carries the
  // refusal code and whether retrying could succeed.
  UploadStateReport,
  UploadState,
  UploadPendingState,
  UploadInProgressState,
  UploadStoredState,
  UploadFailedState,

  // The seven media sub-shapes, each named individually so none has to be
  // reached through the union, and none folded into another.
  FileMedia,
  FileMediaKind,
  AudioClip,
  VideoClip,
  DocumentPreview,
  ProfilePhoto,
  SnippetFile,
  CustomEmojiImage,
  GenericFile,

  // The stored record, the vocabulary of functional type glyphs it renders with,
  // and a readonly page of records.
  StoredFile,
  StoredFileList,
  FileTypeGlyph,
} from '../schemas/file.js';

/* -------------------------------------------------------------------------- */
/* Field primitives                                                           */
/* -------------------------------------------------------------------------- */

/*
 * One name for each value schema the module next door leaves underived. Most
 * resolve to text, and that is the point rather than a shortcoming: the schemas
 * differ in how much they accept, against which character class, after which
 * normalisation and whether the value must address an object or an address, and
 * none of that difference is expressible in the type system. A signature naming
 * one of these therefore says which value it wants, which is strictly more than
 * a bare text type says, while leaving enforcement where enforcement belongs —
 * in the schema.
 */

/**
 * A filename as the client declared it: bounded, normalised, free of control
 * characters and of bidirectional-formatting characters, and refused outright if
 * it addresses a path.
 *
 * **A claim about bytes the server has not seen.** It is also the member of this
 * contract most likely to carry personal data, because a person authored it — a
 * name, a client, a diagnosis, a figure — so it is treated as personal data in
 * full: it never reaches an application log, an error report, an analytics event,
 * an address, a cache key or a telemetry payload, and where a file must be
 * referred to outside a response it is referred to by its opaque record
 * identifier instead.
 *
 * Rejecting a bidirectional override rather than accepting it is what stops a
 * filename from reordering the text rendered around it. A value that fails the
 * declared shape is refused rather than silently shortened, so a consumer never
 * receives a name its author did not write. Encoding is applied per output
 * context at render time, never at storage time, which is what lets one stored
 * name be safe in a text node, an attribute, a header and an address alike.
 */
export type DeclaredFilename = z.infer<typeof declaredFilenameSchema>;

/**
 * The content type as the client declared it, checked against the accepted set.
 *
 * **A claim, and the one most often mistaken for a fact.** The declared type says
 * what the caller believes it is sending; it is checked here so an unacceptable
 * request fails before a capability is issued, and it is *not* what the product
 * stores. A consumer that treats this value as the file's real type has undone
 * the reason the check exists.
 */
export type DeclaredContentType = z.infer<typeof declaredContentTypeSchema>;

/**
 * The content type the server determined **from the content itself**, rather than
 * from the filename or from what the caller declared.
 *
 * This is the trustworthy one, and it is the type a stored record carries. It
 * resolves to the same accepted set as the declared type above, and naming both
 * is deliberate: the two are indistinguishable structurally and completely
 * different in standing, so a signature that takes one should not silently accept
 * the other. A stored object is served under a type the product chose, from an
 * origin that cannot script the application, with content sniffing disabled.
 */
export type DerivedContentType = z.infer<typeof derivedContentTypeSchema>;

/**
 * The identifier naming one upload across its two round trips.
 *
 * Opaque, and the one value a client legitimately sends back: it is what ties a
 * completion report to the initiation that authorized it. It identifies a record
 * and nothing else — nothing may be inferred from its contents, no caller may
 * construct one, and it confers no authority whatsoever. A decision keyed to it
 * would be a decision keyed to a value the caller chose.
 */
export type UploadId = z.infer<typeof uploadIdSchema>;

/**
 * The opaque reference naming a stored object.
 *
 * A reference, never a capability: it says where an object lives in the product's
 * own terms and carries no permission to read it. This is why no record shape in
 * the contract carries a download token — a client that wants bytes asks for a
 * fresh grant, which is precisely what makes revocation effective. It also
 * appears in the nullable slots that point at derived objects, a video clip's
 * thumbnail and a document's preview.
 */
export type ObjectReference = z.infer<typeof objectReferenceSchema>;

/**
 * The pre-signed destination a client sends bytes to.
 *
 * **A capability, and the only genuinely sensitive value in this contract.** It is
 * scoped to one object and one operation, it expires at an instant resolved when
 * it was issued and enforced server-side, it is revocable, it is stripped from
 * every log, and it appears on the initiation response and nowhere else — that
 * being the one moment it is legitimately in flight. It is an address as well, so
 * it is parsed canonically and restricted to the accepted scheme allowlist, with
 * schemes that execute or read local state refused at input rather than merely
 * avoided at render.
 *
 * Issuing one without an authorization check hands that capability to whoever
 * asked. Nothing about this type performs that check; the server does, against
 * the acting session and the specific target the purpose names.
 */
export type PresignedDestination = z.infer<typeof presignedDestinationSchema>;

/* -------------------------------------------------------------------------- */
/* The five purposes, each named                                              */
/* -------------------------------------------------------------------------- */

/*
 * The purpose union's members are underived next door, so each is named here.
 * They are five separate shapes because they name five separate targets, and the
 * target is the thing the server authorizes against — so a signature that accepts
 * "a purpose" where it means one of them accepts four it never intended to
 * handle. None is folded into another and none is reduced to a shared shape with
 * absent members; a purpose carrying a conversation and a purpose carrying a crop
 * have nothing structural in common beyond their discriminant.
 */

/**
 * An attachment destined for a conversation that already exists.
 *
 * The conversation reference is caller-supplied and confers nothing: the server
 * resolves that conversation and authorizes the acting session against it, at
 * initiation and again at completion.
 */
export type ConversationAttachmentPurpose = z.infer<typeof conversationAttachmentPurposeSchema>;

/**
 * An attachment destined for a message still being composed.
 *
 * Distinct from a conversation attachment because the target is distinct — a
 * draft, not a posted conversation — and because the object's lifecycle follows
 * the draft: discarding the draft deletes what was staged for it. Merging the two
 * would leave an abandoned draft's uploads owned by nothing.
 */
export type MessageDraftAttachmentPurpose = z.infer<typeof messageDraftAttachmentPurposeSchema>;

/**
 * A person's own profile photo, together with the square crop chosen for it.
 *
 * It names no subject. The subject is the acting session, because an
 * authorization decision may not rest on a value a caller chose, so there is no
 * identifier of the person being edited in the shape at all. The crop travels
 * with the purpose rather than being applied by the client, so the product
 * re-encodes from the original to a known-good encoder output with embedded
 * metadata discarded.
 */
export type ProfilePhotoPurpose = z.infer<typeof profilePhotoPurposeSchema>;

/**
 * An image being added to the workspace's custom emoji collection.
 *
 * The only purpose that names no target reference, because the target is the
 * workspace itself — which arrives from the acting session and never from the
 * payload. It is separate from a profile photo despite both being images, since
 * the object it belongs to and the capability required to add one are both
 * different.
 */
export type CustomEmojiImagePurpose = z.infer<typeof customEmojiImagePurposeSchema>;

/**
 * A snippet shared into a conversation as a file in its own right.
 *
 * It names a conversation, as a conversation attachment does, and it stays a
 * separate purpose because a snippet is authored in the product rather than
 * transferred into it, and it renders as a file with its own presentation
 * members. Sharing the discriminant's neighbour is not grounds for sharing its
 * identity.
 */
export type SnippetPurpose = z.infer<typeof snippetPurposeSchema>;

/* -------------------------------------------------------------------------- */
/* Narrowing one member out of a union                                        */
/* -------------------------------------------------------------------------- */

/*
 * A renderer, a switch and a lookup table all do the same thing: branch on a
 * discriminant and then work with the one member that carries it. Each generic
 * below names that member by extracting it from its own union, which keeps a
 * per-member signature from having to import every member and keeps the
 * extraction honest — passing a discriminant the union does not contain resolves
 * to nothing assignable, so the mistake surfaces where it is written rather than
 * where the value is used.
 *
 * Each constraint is read off its own union by indexed access rather than from a
 * list beside it, so the members and the discriminants cannot disagree. Each
 * accepts a union of discriminants as readily as a single one, resolving to the
 * union of the members that match — which is how the media that carry a timeline
 * are named without a further alias for them.
 */

/**
 * The purpose, or purposes, carrying a given discriminant.
 *
 * Narrowed from the union rather than restating any member, so a purpose gains a
 * member exactly when its schema does. A route that handles one target takes the
 * narrowing rather than the union and then cannot be handed another target's
 * payload.
 */
export type UploadPurposeOfKind<TKind extends z.infer<typeof uploadPurposeSchema>['kind']> = Extract<
  z.infer<typeof uploadPurposeSchema>,
  { kind: TKind }
>;

/**
 * The transfer state, or states, carrying a given discriminant.
 *
 * A progress indicator takes the in-progress narrowing and thereby reads the
 * transferred proportion without testing for it; a failure presentation takes the
 * failed narrowing and reads the refusal code and the retryable flag the same
 * way. Neither can be handed a state that lacks what it renders.
 */
export type UploadStateReportOf<TState extends z.infer<typeof uploadStateSchema>['state']> = Extract<
  z.infer<typeof uploadStateSchema>,
  { state: TState }
>;

/**
 * The media sub-shape, or sub-shapes, carrying a given discriminant.
 *
 * This is the narrowing that keeps the seven sub-shapes usable while keeping them
 * separate. A player that draws a scrubber and offers a selectable thumbnail asks
 * for the video clip; one that draws a waveform and a duration readout asks for
 * the audio clip (frames 190, 197); and a surface that handles both timed media
 * at once asks for both discriminants and receives exactly those two members —
 * which is why no additional alias for "media with a duration" exists below.
 */
export type FileMediaOfKind<TKind extends z.infer<typeof fileMediaSchema>['media']> = Extract<
  z.infer<typeof fileMediaSchema>,
  { media: TKind }
>;

/* -------------------------------------------------------------------------- */
/* Two derived shapes worth naming                                            */
/* -------------------------------------------------------------------------- */

/**
 * The three values a client declares at initiation, without the purpose they
 * accompany: the filename, the content type and the byte size.
 *
 * Named because the set is meaningful on its own and is passed around as one.
 * **All three are untrusted claims about bytes the server has not seen**, they are
 * the only members of the contract with that standing, and grouping them under
 * one name is what lets a signature say it is handling declarations rather than
 * facts. A helper that validates a chosen attachment before a request is made
 * takes this; the server takes it and re-derives every part of it.
 *
 * Derived from the initiation request by selection, so it cannot fall out of step
 * with the request it came from — and it deliberately excludes the purpose, since
 * the purpose is authorized rather than re-derived. An authored example of the
 * kind of value it holds: a filename of `quarterly-plan.pdf`, a declared document
 * type, and a declared size the schema bounds. Nothing here carries content: a
 * declaration describes a transfer and never performs one.
 */
export type UploadDeclaration = Pick<
  z.infer<typeof uploadInitiationRequestSchema>,
  'declaredFilename' | 'declaredContentType' | 'declaredByteSize'
>;

/**
 * The person a stored file is attributed to, exactly as the record projects them.
 *
 * Derived from the record by indexed access rather than composed again from the
 * person vocabulary: the composition is the schema's, and repeating it here would
 * be a second definition of one contract — and would additionally invite the
 * wrong person shape, since a file listing needs a compact projection and not a
 * profile carrying an address.
 *
 * **Nullable, and the null is meaningful rather than incidental.** A file may be
 * attributed to nobody the reader is entitled to see: field-level authorization
 * applies to the sharer, so a person is projected against the reader's capability
 * for that specific record and never merely because the surface around it
 * rendered. A consumer therefore tests for the absent case directly and must not
 * omit the key or assign it undefined — see the note on absence above — and must
 * not read a null as "no such person".
 */
export type StoredFileSharer = z.infer<typeof storedFileSchema>['sharer'];
