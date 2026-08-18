/**
 * The file contract — pre-signed upload initiation and completion.
 *
 * A transfer has two halves and the product sits at neither end of the middle.
 * The client asks for permission and describes what it intends to send; the
 * server authorizes that intent and hands back a destination scoped to one
 * object; the client sends the bytes **straight to object storage**; the client
 * then tells the server the transfer finished, and the server verifies the
 * object for itself before making it visible.
 *
 * ---------------------------------------------------------------------------
 * THE DEFINING PROPERTY: BYTES NEVER PASS THROUGH THE API
 * ---------------------------------------------------------------------------
 *
 * There is no `content` field, no encoded payload, no octet string, no data URL
 * and no stream anywhere in this module, and there must never be one. The
 * excluded-tooling list is explicit that a file is **not proxied through the
 * API** — uploads are pre-signed — and `docs/decisions/security-contracts.md`
 * records the consequence under `S-UPLOAD`: file bytes never transit the API at
 * all. That is worth more than it first appears. A byte stream that never
 * reaches the application cannot exploit the application's parsers, cannot be
 * written to a log by accident, and cannot consume the request path's memory.
 *
 * A field here that could carry file content would therefore not be a small
 * modelling liberty. It would delete the property the whole design exists to
 * obtain, and it would do so silently, because such a field looks entirely
 * ordinary beside the ones that belong.
 *
 * ---------------------------------------------------------------------------
 * PRE-SIGNING MOVES THE TRUST BOUNDARY, SO EVERY DECLARATION IS A CLAIM
 * ---------------------------------------------------------------------------
 *
 * The API's job is to authorize and then to *not* be in the data path. Two
 * things follow, and both are easy to get wrong from a reading of the types
 * alone.
 *
 * First, the three values a client sends at initiation — the filename, the
 * content type and the byte size — are **claims made by an untrusted party
 * about bytes the server has not seen**. They are validated here so a hopeless
 * request fails fast and cheaply, and that is *all* this module can do for them.
 * `S-UPLOAD` [docs/workflows/00-product-overview.md L518] requires type
 * determination "from content rather than from the filename or the declared
 * media type", so the declared type is re-derived server-side from the stored
 * bytes; the declared size is enforced by the pre-signed policy the storage
 * component attaches to the grant; and the filename is sanitised before it is
 * used in a header, a path or a rendered label. A downstream author who treats
 * the declared content type as fact reintroduces exactly the vulnerability the
 * pre-signed design removes — which is why the word `declared` is part of every
 * one of those three field names rather than a remark in a comment.
 *
 * Second, a pre-signed destination is a **capability**. Issuing one without an
 * authorization check hands that capability to whoever asked, so the purpose
 * union below is not descriptive metadata: it is the thing the server authorizes
 * against, and it is the most load-bearing shape in this file.
 *
 * ---------------------------------------------------------------------------
 * AUTHORIZATION, AND WHY NO REQUEST HERE NAMES A WORKSPACE OR AN ACTOR
 * ---------------------------------------------------------------------------
 *
 * Per `PROJECT_RULE_R1`, client rendering is never evidence of permission, and
 * no authorization decision may rest on a caller-supplied workspace or actor
 * identifier. Both requirements are met **structurally** here rather than by a
 * check somebody has to remember: not one request shape in this module has a
 * field for a workspace, an uploader, a sharer or any other principal. The
 * workspace comes from the acting session and is injected below the query by
 * `packages/db/src/tenancy.ts`; the uploader *is* the acting session. With no
 * field to populate, a caller cannot even attempt to upload as somebody else or
 * into somebody else's workspace, so there is nothing for the server's check to
 * contradict.
 *
 * The order of operations at initiation is fixed by the same rule, and it is the
 * one thing a route author must not reorder:
 *
 *   1. resolve the acting session, and with it the workspace;
 *   2. resolve the target the purpose names — the conversation, the draft, the
 *      person's own record, the workspace's emoji collection;
 *   3. authorize the session against **that specific target** per `S-AUTHZ-OP`
 *      [docs/workflows/00-product-overview.md L502], at the point of execution;
 *   4. only then issue a destination.
 *
 * Completion repeats step 3, because a grant issued a moment ago is not a grant
 * now: authorization for the target may have been revoked in between, and
 * `S-AUTHZ-READ` [L512] states the general form of this — a projection re-checks
 * on every render so that revocation propagates.
 *
 * **A file listing and a shared-files card are projections.**
 * [docs/workflows/02-channels.md L954] is explicit that the shared-files card
 * "lists files ... each is a projection and each is computed over the viewer's
 * authorized set", and `S-AUTHZ-READ` requires the authorization predicate to
 * travel with the query, so unauthorized rows are never fetched, never
 * serialised and never sent. Filtering a returned page is not authorization. A
 * count over these records is itself a projection and is computed over the
 * authorized set only.
 *
 * ---------------------------------------------------------------------------
 * CONTRACTS RECORDED AS CONSUMER OBLIGATIONS
 * ---------------------------------------------------------------------------
 *
 * A route author or a client author reading this module is the person who needs
 * these, so they are stated here rather than left to be discovered. How each is
 * discharged, and where, is recorded in `docs/decisions/security-contracts.md`.
 *
 * **`S-UPLOAD`** — untrusted upload and document rendering
 * [docs/workflows/00-product-overview.md L485, L518]. The declared type is not
 * the actual type, so the server determines the type **from the content**; an
 * allowlist of accepted types governs, with active-content formats rejected
 * rather than sanitised in place; a hard byte bound applies, and a **separate**
 * hard bound on decoded dimensions and decompressed size, so that a small file
 * which expands enormously is refused rather than processed; the content is
 * scanned before it is stored, previewed or served; images are re-encoded to a
 * known-good encoder output with embedded metadata discarded; and a stored
 * object is served under **a content type the product chose**, from an origin
 * that cannot script the application, with content sniffing disabled. Every
 * refusal reason gets an explicit rejection state. This is the catalog's single
 * upload contract and all four upload paths reference it rather than restating
 * it [L520].
 *
 * **`S-CONTENT`** — stored-content input and output contract [L486, L526]. It
 * governs the filename directly, and it names this exact case: rejection or
 * neutralisation of control characters and of bidirectional-override characters
 * "is what stops a filename or display name from reordering the text around it".
 * A value that fails its declared shape is **rejected rather than silently
 * truncated**. Encoding is applied per output context at render time, never at
 * storage time, so one stored name is safe in a text node, an attribute, a
 * header and an address alike.
 *
 * **`S-CONSENT`** — device capture and the records a capture produces [L492,
 * L576]. It reaches this module through the audio clip and the video clip. A
 * sample taken to preview a device or to drive a level meter is **used
 * transiently and discarded** — never persisted, never uploaded, and never
 * modelled here, which is why no preview or level-meter shape exists below. A
 * capture deliberately turned into content acquires an explicit lifecycle: a
 * stated storage scope, encryption at rest, a retention bound, deletion when the
 * draft or record is discarded, notification to every participant that the
 * record is being made, and a deletion path afterwards. And decisively for the
 * shapes here: **a speech-derived record is a separate store from the
 * conversation's message history**, because conflating the two would silently
 * give speech the message history's search reach, export reach and retention. No
 * transcript, caption or speech-derived field therefore belongs on a file or on
 * a message, and none is present.
 *
 * **`S-LINK`** — outbound navigation and address safety [L487, L536]. Any
 * address this module carries is governed by it: an address is parsed
 * canonically before it is stored, rendered or followed, and only the two-member
 * scheme allowlist is accepted, with schemes that execute or read local state
 * rejected **at input** rather than merely avoided at render.
 *
 * A pre-signed destination is an address, and a download or access link is an
 * `S-SECRET` **class-B capability** [L546]: high-entropy, split into a
 * non-secret lookup selector and a secret part of which only a keyed verifier is
 * stored, scoped to exactly one capability and one object, carrying an expiry
 * **resolved at issuance and enforced server-side**, revocable individually and
 * in bulk, stripped from every log, and **never rendered in full**. Two
 * consequences bind the shapes below. A destination appears on the *initiation
 * response* and nowhere else, because that is the one moment it is legitimately
 * in flight. And **no record shape carries a download token** — a stored file
 * holds an opaque object reference, and a client that wants bytes asks for a
 * fresh grant, which is what makes revocation effective.
 *
 * **`S-PII`** — personal and private contact data [L489, L558]. A filename is
 * authored by a person and routinely carries personal data: a name, a client, a
 * medical term, a salary. Redaction therefore applies to it in full — a filename
 * never reaches an application log, an error report, an analytics event, a URL,
 * a cache key or a telemetry payload, and where a file must be referenced
 * outside a response it is referenced by its **opaque record identifier**
 * instead. Field-level authorization applies to the sharer reference for the
 * same reason: a person is projected against the reader's capability for that
 * specific record, never merely because the surface around it rendered.
 *
 * **`S-PERUSER`** — per-viewer state versus shared state [L490, L562]. One
 * field that a reader will expect to find here is deliberately absent. The
 * shared-files card groups its entries by recency of *viewing*
 * [docs/workflows/README.md L331], and the consolidated model places that value
 * on a relation: "Viewer–file state | viewer + file | viewed-at timestamp, which
 * drives the viewed-today and viewed-yesterday grouping"
 * [docs/workflows/README.md L361-L371]. A viewed-at column on the shared record
 * would mean one person opening a file marked it opened for everyone, and would
 * additionally disclose that person's behaviour to every other member. The
 * grouping key is therefore per-viewer state owned by the files-and-media area,
 * and it is not a field of the record below.
 *
 * ---------------------------------------------------------------------------
 * MODULE CONSTRAINTS
 * ---------------------------------------------------------------------------
 *
 * - Pure `zod`. No `.openapi()` call and no `extendZodWithOpenApi` here; those
 *   belong to `../openapi/registry.ts`, because the package barrel re-exports
 *   this module into the browser bundle and the specification generator has no
 *   business there.
 * - No framework import of any kind. No server framework and no multipart
 *   plugin type — a shape typed against a multipart plugin would be a shape that
 *   expects bytes. No storage-provider client either: the pre-signed grant is
 *   *issued* by `apps/api/src/storage/presign.ts` and this module only describes
 *   the result. No editor library, no database client, no view library.
 * - No import of `../copy/en.ts`. Every rejection this module can produce is a
 *   machine-readable code; the sentence a person reads is chosen by the client
 *   from the authored copy module, so no user-facing prose exists in the
 *   contract package and no rejection can leak an implementation detail.
 * - Side-effect free. Constants, schemas and pure predicates only.
 * - Every bound is declared once, as a named exported constant, and consumed by
 *   reference. No bound is inlined at a point of use.
 * - Every point in time is an absolute instant. No duration is stored anywhere,
 *   and no lifetime is restated: the pre-signed grant's lifetime belongs to
 *   configuration and is read by `apps/api/src/storage/presign.ts`, which is why
 *   the response below carries the instant the grant expires rather than how
 *   long it lasts.
 *
 * ---------------------------------------------------------------------------
 * HOW THE PROJECT RULES ARE CITED BELOW, AND WHY NOT BY THEIR OWN IDENTIFIERS
 * ---------------------------------------------------------------------------
 *
 * Five binding project rules govern this work. They are cited here by their
 * requirement labels:
 *
 *   `PROJECT_RULE_R1` — authorization is server-side only
 *   `PROJECT_RULE_R2` — corpus and specification handling
 *   `PROJECT_RULE_R3` — uncertainty is never permission to omit
 *   `PROJECT_RULE_R4` — third-party identity exclusion
 *   `PROJECT_RULE_R5` — a shared contract is implemented exactly once
 *
 * The rules' own identifiers are deliberately NOT written anywhere in this file,
 * because every one of them embeds the third-party product name that R4 forbids
 * from appearing in source or in comments. Writing them would put the build's
 * own brand guard in the position of failing on the file that cites the rule it
 * enforces. A downstream reader should not "restore" them. The identifiers are
 * also PERMUTED relative to the R labels, so the label above is the thing to
 * trust and an ordinal is not; and the labels are a citation shorthand rather
 * than a paraphrase — the authoritative wording of each rule lives in the rules
 * interface, and this file summarises rather than restates it.
 *
 * Frames are cited by NUMBER alone for the same reason. Each of the 1,022 frame
 * filenames embeds the prohibited name, and renaming the corpus is forbidden by
 * `PROJECT_RULE_R2`, so runtime resolution plus number-only citation is the only
 * reconciliation available. No corpus path appears in this file, and the corpus
 * is never modelled as an upload source: it must not reach build output, a
 * container image or a client bundle, and this module is re-exported into the
 * client bundle.
 */

import { z } from 'zod';

import { personSummarySchema } from './user.js';

/* ===========================================================================
 * Rejection codes
 *
 * Every rejection this module can produce is a code, never a sentence. The codes
 * are attached to the validators below as their issue messages, which is what
 * keeps this union load-bearing instead of decorative: a client receives the
 * code and chooses the wording itself from the authored copy module.
 *
 * `S-UPLOAD` requires "an explicit rejection state shown to the uploader for
 * every refusal reason" [docs/workflows/00-product-overview.md L518]. A single
 * generic code could not satisfy that, because the uploader could not tell a
 * file that is too large from one whose type is refused — one is fixed by
 * choosing a smaller file and the other never is. The set is therefore
 * enumerated by refusal reason rather than by field.
 *
 * The corpus shows no rejection at all: it "shows uploads succeeding and their
 * results rendering; no capture shows a file being rejected, a scan running, a
 * size limit being hit or a preview failing" [L522]. Under `PROJECT_RULE_R3`
 * that absence is an open work item and never permission to omit, so the codes
 * exist and the enforcement is required whether or not a capture existed. The
 * rejection *rendering* is a gap decision registered in
 * `docs/decisions/gap-register.md`, which this module references and does not
 * edit.
 * =========================================================================== */

/**
 * The closed set of rejection codes the file schemas emit.
 *
 * Declared as a readonly tuple so the union is derived from it rather than
 * restated, and so a consumer can enumerate the set — an exhaustive mapping to
 * authored copy is what stops a code reaching a person as a raw token.
 */
export const UPLOAD_REJECTION_CODES = [
  /** The declared byte size exceeds the ceiling for the declared purpose. */
  'upload_size_exceeded',
  /** The declared byte size is absent, not a whole number, or not positive. */
  'upload_size_invalid',
  /** The declared content type is outside the allowlist for this purpose. */
  'upload_type_not_allowed',
  /** The declared content type is not a well-formed media type. */
  'upload_type_malformed',
  /** The filename is absent, empty after normalisation, or over its bound. */
  'upload_filename_invalid',
  /** The filename carries a control character, which no stored value may hold. */
  'upload_filename_control_character',
  /** The filename carries a bidirectional formatting character. */
  'upload_filename_bidi_override',
  /** The filename carries a path separator or a parent-directory sequence. */
  'upload_filename_path_traversal',
  /** The upload identifier is not a well-formed opaque identifier. */
  'upload_not_found',
  /** Completion arrived for an upload whose object is not fully stored. */
  'upload_incomplete',
  /** The stored-object reference is not a well-formed opaque reference. */
  'upload_object_reference_invalid',
  /** The pre-signed destination is not an absolute address on an allowed scheme. */
  'upload_destination_invalid',
  /** The purpose is absent, or names a kind outside the union. */
  'upload_purpose_invalid',
  /** The crop geometry is absent, not square, or outside its pixel bounds. */
  'upload_crop_invalid',
  /** A pixel dimension is absent, not a whole number, or over its bound. */
  'upload_dimensions_invalid',
  /** A media duration is absent, negative, or over its bound. */
  'upload_duration_invalid',
  /** A value that must be an absolute instant was not one. */
  'upload_instant_invalid',
  /** The functional type glyph is outside the enumerated set. */
  'upload_type_glyph_invalid',
  /** The transfer state is outside the enumerated set. */
  'upload_state_invalid',
  /** The uploader's file name is legitimate but the object was refused on scan. */
  'upload_content_rejected',
  /** The transfer did not complete: it was abandoned, cancelled or timed out. */
  'upload_transfer_failed',
  /** The pre-signed grant had expired by the time the transfer was attempted. */
  'upload_grant_expired',
] as const;

/** Schema for a single rejection code, for use where a code crosses a boundary. */
export const uploadRejectionCodeSchema = z.enum(UPLOAD_REJECTION_CODES, {
  error: 'upload_state_invalid',
});

/** A machine-readable reason a file shape or a transfer was rejected. */
export type UploadRejectionCode = (typeof UPLOAD_REJECTION_CODES)[number];

/* ===========================================================================
 * Bounds
 *
 * `PROJECT_RULE_R3` requires that a bound be defined once as a named constant
 * and consumed everywhere by reference, and that substituting a literal at a
 * point of use is prohibited. Every bound in this module is therefore here, and
 * every validator below refers to one of these names.
 *
 * These are compile-time **invariants** rather than environment-overridable
 * defaults, and the distinction is deliberate. `S-UPLOAD` requires "a hard byte
 * size bound" [docs/workflows/00-product-overview.md L518] — a ceiling an
 * operator could raise from the environment is not hard, and raising it would
 * widen the attack surface of a parser the product does not control. The
 * environment template accordingly carries object-storage connection values and
 * no upload ceiling: what is configurable about a transfer is *where* it goes,
 * never *how much* may go.
 *
 * The pre-signed grant's LIFETIME is the one value that genuinely is
 * configurable, and it is deliberately absent from this list. It belongs to
 * configuration and is read by `apps/api/src/storage/presign.ts`; restating a
 * number of seconds here would create a second source of truth for it, and the
 * response below carries the resulting absolute instant instead.
 * =========================================================================== */

/**
 * Maximum length of a declared filename, in characters of the normalised value.
 *
 * The bound is applied to the value that would be stored, after normalisation,
 * and a breach is a **rejection** rather than a truncation — `S-CONTENT`
 * requires "rejection of a value that fails its declared shape rather than
 * silent truncation" [docs/workflows/00-product-overview.md L526], and silent
 * truncation is worse here than elsewhere: cutting a name short can change which
 * extension it appears to end in.
 *
 * 255 is the boring, well-supported choice — it is the per-component name limit
 * of every filesystem the product might ever write a copy onto, so a name that
 * passes here cannot fail later for length alone.
 */
export const FILENAME_MAX_LENGTH = 255;

/**
 * Maximum length of an opaque reference to a stored object.
 *
 * This bound is load-bearing rather than cosmetic. Together with the character
 * class the validator enforces, it makes it structurally impossible for image
 * bytes or an encoded payload to be carried in place of a reference: a data URL
 * needs a colon and a comma, the character class admits neither, and no
 * meaningful payload fits in the length.
 */
export const OBJECT_REFERENCE_MAX_LENGTH = 512;

/**
 * Maximum length of the opaque identifier naming one upload.
 *
 * The identifier is opaque by contract. Nothing may be inferred from its
 * contents, no caller may construct one, and it is the only value from an
 * initiation response that a client sends back at completion.
 */
export const UPLOAD_ID_MAX_LENGTH = 64;

/**
 * Maximum length of a declared media type.
 *
 * Generous beyond the longest registered type the allowlist admits, and far too
 * short to carry a payload in a parameter.
 */
export const CONTENT_TYPE_MAX_LENGTH = 128;

/**
 * Maximum length of a pre-signed destination address.
 *
 * A pre-signed address is long by nature: it carries a scoped credential, a
 * signature and an expiry as query parameters. 2048 is the conventional ceiling
 * for an address that has to survive every intermediary, and it bounds the value
 * without truncating a legitimate grant.
 */
export const PRESIGNED_DESTINATION_MAX_LENGTH = 2048;

/**
 * Smallest declared byte size that can describe a real transfer.
 *
 * A zero-byte upload is refused rather than accepted and quietly discarded: it
 * would consume a grant, an identifier and a completion round trip to produce
 * nothing, and a client that computed a size of zero has a defect worth
 * reporting rather than absorbing.
 */
export const MIN_DECLARED_BYTES = 1;

/*
 * ---------------------------------------------------------------------------
 * THE BYTE CEILINGS COME IN TWO LAYERS, AND THE LAYERS ARE ENFORCED AT
 * DIFFERENT MOMENTS ON DIFFERENT EVIDENCE
 * ---------------------------------------------------------------------------
 *
 * The distinction falls straight out of this module's thesis, so it is worth
 * naming rather than leaving a reader to reconstruct.
 *
 * At INITIATION the product does not know what the file is. It has a declared
 * type, which is a claim. What it does know is what the upload is FOR, because
 * the purpose is the thing it just authorized. So the layer that binds at
 * initiation is keyed by PURPOSE — `PURPOSE_BYTE_CEILINGS`, below the purpose
 * union.
 *
 * At COMPLETION the product has the bytes and has derived the media kind from
 * them. So a second, narrower layer becomes available, keyed by MEDIA KIND —
 * `MEDIA_BYTE_CEILINGS`, below the media union. This is the layer that stops a
 * two-hundred-megabyte "audio clip": the attachment purpose had to admit it
 * because a video clip travels the same path, and only the derived kind can tell
 * the two apart.
 *
 * Both layers bind, and the narrower of the two wins. The ceilings below are the
 * inputs to those two maps, ordered so that each is defined before whatever
 * derives from it.
 */

/**
 * The byte ceiling for a recorded audio clip.
 *
 * Sized for a clip a person records in the composer rather than for an archive
 * of audio, which is what the observed recorder produces
 * [docs/workflows/03-messaging-and-composer.md L653, frames 200, 201]. It binds
 * at completion, once the content is known to be audio.
 */
export const MAX_AUDIO_CLIP_BYTES = 32 * 1024 * 1024;

/**
 * The byte ceiling for a recorded video clip.
 *
 * The widest single object the product will store, because video is the largest
 * thing the composer's own controls can produce
 * [docs/workflows/03-messaging-and-composer.md L527]. It is expressed as a
 * product of named powers rather than as an opaque digit run so that a reviewer
 * can read the magnitude off the expression.
 */
export const MAX_VIDEO_CLIP_BYTES = 200 * 1024 * 1024;

/**
 * The byte ceiling for a conversation or draft attachment.
 *
 * DERIVED, not chosen independently, and the derivation is the point. The
 * attachment path is the route a video clip travels, so its ceiling must
 * accommodate the largest thing that path can carry or a legitimate clip would be
 * refused at the door. Writing the same magnitude twice under two names would be
 * exactly the second source of truth `PROJECT_RULE_R3` prohibits, and the two
 * would drift the first time one was revised.
 *
 * This being the widest *purpose* ceiling is what makes the narrower media layer
 * necessary rather than decorative: at initiation a text attachment and a video
 * attachment are indistinguishable, so both get this ceiling, and only the derived
 * kind narrows it afterwards.
 */
export const MAX_ATTACHMENT_BYTES = MAX_VIDEO_CLIP_BYTES;

/**
 * The byte ceiling for an image uploaded as a person's profile photo.
 *
 * Smaller than an attachment on purpose. The stored result is a square crop
 * rendered at avatar size [docs/workflows/01-onboarding-and-auth.md L778, frames
 * 11, 21, 22], so a source large enough to be cropped well is still small, and
 * `S-UPLOAD`'s separate decompressed-size bound is easiest to honour on a class
 * of input that is bounded tightly at the front door.
 */
export const MAX_PROFILE_PHOTO_BYTES = 8 * 1024 * 1024;

/**
 * The byte ceiling for a custom-emoji image.
 *
 * The tightest ceiling here, because the rendered result is a glyph a few pixels
 * across and the upload step's own surface carries size guidance
 * [docs/workflows/03-messaging-and-composer.md L340]. No number is transcribed
 * from that surface: the guidance is evidence that a bound exists, and the value
 * is chosen.
 */
export const MAX_CUSTOM_EMOJI_BYTES = 512 * 1024;

/**
 * The byte ceiling for a snippet stored as a shareable file.
 *
 * A snippet is line-numbered text [docs/workflows/03-messaging-and-composer.md
 * L653, frame 148], so this ceiling is small by nature. It bounds the *stored
 * object*; the snippet's own authoring rules — content required, title optional
 * — belong to `./message.ts` and are imported there from the shared constants
 * module rather than restated in either place.
 */
export const MAX_SNIPPET_BYTES = 1024 * 1024;

/**
 * The byte ceiling for a document, as narrowed at completion.
 *
 * A document is not a clip, so it does not need the video ceiling the attachment
 * purpose had to grant it. This is the value the media layer applies once the
 * content is known to be a document rather than media.
 */
export const MAX_DOCUMENT_BYTES = 64 * 1024 * 1024;

/**
 * Maximum edge of a decoded image, in pixels.
 *
 * `S-UPLOAD` requires "a separate hard bound on decoded dimensions and
 * decompressed size, so that a small file which expands enormously is refused
 * rather than processed" [docs/workflows/00-product-overview.md L518]. That is a
 * genuinely separate requirement from the byte bound, and conflating the two is
 * the mistake it exists to prevent: a compressed image of a few kilobytes can
 * decode to gigabytes, so passing the byte ceiling says nothing at all about
 * whether decoding is safe.
 *
 * The authoritative check runs server-side on the decoded object. This constant
 * bounds the dimensions a client *declares* for a crop so a hopeless request
 * fails before a grant is issued.
 */
export const MAX_IMAGE_EDGE_PIXELS = 8192;

/**
 * Smallest edge of a square crop, in pixels.
 *
 * Below this the stored result cannot render as an avatar without visible
 * degradation, and a crop that small is more likely to be a client defect than
 * an intention.
 */
export const MIN_CROP_EDGE_PIXELS = 32;

/**
 * Maximum duration of a recorded clip, in whole seconds.
 *
 * The corpus never shows the recorder reaching a limit, so `PROJECT_RULE_R3`
 * governs: the mechanism ships with a chosen conventional default rather than
 * being omitted for want of an observed value. The reasoning belongs with the
 * other chosen defaults in `docs/decisions/observed-values.md`.
 *
 * Like every other bound in this section this is a **ceiling on a stored object**
 * rather than a product setting, which is why it is a compile-time invariant. A
 * shorter recording length offered as a preference would be configuration layered
 * *beneath* this value, and would narrow it rather than raise it — a stored clip
 * longer than the contract admits is a clip no consumer is bound to be able to
 * play.
 */
export const MAX_MEDIA_DURATION_SECONDS = 3600;

/**
 * The widest byte ceiling any purpose permits.
 *
 * Derived from the ceilings above rather than restated, so it can never fall out
 * of step with them. It is the structural ceiling a size field carries on its own,
 * before the purpose is consulted; the per-purpose ceiling is then applied as a
 * cross-field check and the media ceiling at completion, and the narrowest of the
 * three is what a caller actually experiences.
 *
 * Every value it maximises over is a *purpose* ceiling, because a purpose ceiling
 * is what a request is judged against. The media ceilings are all narrower than
 * the purpose ceiling of the path they travel — that is what makes them a
 * narrowing — so including them would change nothing except to invite the reading
 * that a media kind could exceed its own path.
 */
export const MAX_DECLARED_BYTES = Math.max(
  MAX_ATTACHMENT_BYTES,
  MAX_PROFILE_PHOTO_BYTES,
  MAX_CUSTOM_EMOJI_BYTES,
  MAX_SNIPPET_BYTES,
);

/* ===========================================================================
 * The filename is a hostile value
 *
 * `S-CONTENT` names this exact case rather than a general one: rejection or
 * neutralisation of control characters and of bidirectional-override characters
 * "is what stops a filename or display name from reordering the text around it"
 * [docs/workflows/00-product-overview.md L526]. The attack is worth stating
 * plainly, because a reader who has not seen it tends to treat this section as
 * defensive boilerplate. A bidirectional override placed inside a name makes the
 * characters after it render in the opposite order, so a name whose stored bytes
 * end in an executable extension can be made to *display* as though it ends in a
 * harmless one. The person clicking sees one thing and opens another, and no
 * amount of care at the point of rendering helps, because the reordering is
 * performed faithfully by the text engine.
 *
 * A filename reaches four sinks and each would be exploited differently: a
 * content-disposition header, a storage path, a rendered label and a download
 * address. Rather than trust four separate encoders to be right, the value is
 * refused at the front door. Encoding still happens per sink at render time, as
 * `S-CONTENT` requires; this is the input half of the same contract.
 *
 * Detection is a code-unit scan rather than a pattern, for the same three
 * reasons the content module gives: a scan cannot be made to backtrack, it says
 * exactly which code points are refused instead of hiding them behind escapes,
 * and every code point in question lies in the basic plane, so a code-unit scan
 * is exact and a surrogate pair can never be mistaken for one.
 *
 * The same discipline exists in `./content.ts` for a message body. It is
 * implemented again here rather than imported because the two are different
 * contracts over different vocabularies — a body legitimately carries line feeds
 * and tabs inside a code block, a filename never does, and a body has no concept
 * of a path separator at all. `PROJECT_RULE_R5` governs a component contract
 * being implemented once, which this respects: there is exactly one filename
 * validator in the product and it is here.
 * =========================================================================== */

/** The canonical composed form every stored text value is normalised to. */
const UNICODE_NORMALISATION_FORM = 'NFC';

/** Highest code unit in the first control range, which begins at zero. */
const C0_CONTROL_LAST = 0x1f;

/** Lowest code unit in the delete-and-second-control range. */
const C1_CONTROL_FIRST = 0x7f;

/** Highest code unit in the delete-and-second-control range. */
const C1_CONTROL_LAST = 0x9f;

/*
 * The bidirectional characters that are refused are the embeddings, the
 * overrides and the isolates: the characters that reorder the text around them,
 * which is precisely the behaviour `S-CONTENT` names.
 *
 * Two exclusions are deliberate and both would be defects if they went the other
 * way. The directional *marks* are not refused: they annotate the resolved
 * direction of neutral characters and cannot reorder a surrounding run, so
 * refusing them would break a legitimate mixed-direction name while closing no
 * attack. Nor is any right-to-left *script* character refused — those are
 * ordinary letters, and a person whose language is written right to left must be
 * able to name a file in it.
 */

/** Lowest code unit of the embedding-and-override block. */
const BIDI_FORMATTING_FIRST = 0x202a;

/** Highest code unit of the embedding-and-override block. */
const BIDI_FORMATTING_LAST = 0x202e;

/** Lowest code unit of the isolate block. */
const BIDI_ISOLATE_FIRST = 0x2066;

/** Highest code unit of the isolate block. */
const BIDI_ISOLATE_LAST = 0x2069;

/**
 * The separators that would make a filename address a directory.
 *
 * Both forms are refused regardless of the platform the server runs on. A name
 * carrying the other platform's separator is still a name that was built to
 * traverse somewhere, and a validator that admits it because "this host does not
 * treat it as a separator" is a validator that stops working the moment an object
 * is copied onto a host that does.
 */
const PATH_SEPARATORS = ['/', '\\'] as const;

/** The sequence that climbs to a parent directory. */
const PARENT_DIRECTORY_SEQUENCE = '..';

/**
 * The two names that address a directory rather than a file within one.
 *
 * A single dot is the current directory and a double dot its parent. Neither is
 * a filename, and both are caught here in addition to the traversal check so
 * that a bare `..` is refused as a *name* rather than only as a substring.
 */
const RESERVED_DIRECTORY_NAMES = ['.', PARENT_DIRECTORY_SEQUENCE] as const;

/** The character class an opaque stored-object reference is confined to. */
const OBJECT_REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/_.-]*$/;

/** The character class an opaque upload identifier is confined to. */
const UPLOAD_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * A well-formed media type: a registered top-level type and a subtype.
 *
 * Deliberately narrow. Parameters are refused rather than parsed, because a
 * parameter on a *declared* type is a value the server will not consult — the
 * type is re-derived from the content per `S-UPLOAD` — and admitting one would
 * only give a caller somewhere to put a payload.
 */
const MEDIA_TYPE_PATTERN = /^[a-z]+\/[a-z0-9][a-z0-9.+-]*$/;

/** The two schemes `S-LINK` admits, and the only ones a destination may use. */
const ALLOWED_DESTINATION_SCHEMES = ['http:', 'https:'] as const;

/** Normalises a value to the single canonical composed form stored everywhere. */
const toCanonicalUnicodeForm = (value: string): string =>
  value.normalize(UNICODE_NORMALISATION_FORM);

/** Reports whether a value carries a control character. */
const containsControlCharacter = (value: string): boolean => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
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

/**
 * Reports whether a filename tries to address something other than itself.
 *
 * Three refusals, and the third is the one a hand-rolled check usually misses. A
 * separator in either form means the value names a path. A parent-directory
 * sequence anywhere in the value means it was built to climb, and it is refused
 * as a substring rather than only as a prefix, because a climb in the middle of a
 * value works exactly as well as one at its start. And the value itself may not
 * *be* a directory name.
 */
const addressesAPath = (value: string): boolean => {
  if (PATH_SEPARATORS.some((separator) => value.includes(separator))) {
    return true;
  }
  if (value.includes(PARENT_DIRECTORY_SEQUENCE)) {
    return true;
  }
  return RESERVED_DIRECTORY_NAMES.some((reserved) => value === reserved);
};

/** Reports whether a value is an opaque reference to a stored object. */
const isObjectReference = (value: string): boolean =>
  OBJECT_REFERENCE_PATTERN.test(value) && !value.includes(PARENT_DIRECTORY_SEQUENCE);

/**
 * Reports whether a value is an absolute address on an admitted scheme.
 *
 * Parsing is the check, per `S-LINK`'s requirement that an address be "parsed
 * canonically before it is stored, rendered or followed"
 * [docs/workflows/00-product-overview.md L536]. A relative value cannot be
 * parsed absolutely and is refused by construction; a scheme that executes or
 * reads local state is refused explicitly, at input, rather than avoided at
 * render.
 */
const isAllowedAbsoluteAddress = (value: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return ALLOWED_DESTINATION_SCHEMES.some((scheme) => scheme === parsed.protocol);
};

/* ===========================================================================
 * Primitive values
 * =========================================================================== */

/**
 * A declared filename, normalised and refused rather than repaired.
 *
 * Order is deliberate and each step depends on the one before. Bound the input
 * first, so an oversized value is refused before anything is computed over it.
 * Trim next, so surrounding whitespace cannot stand in for a name. Normalise, so
 * every later check and everything stored sees one canonical form. Bound again,
 * because normalisation can lengthen a value and must not be able to carry one
 * past its limit. Require a remaining character, so a name of only whitespace is
 * refused rather than stored as empty. Then refuse the two character classes and
 * the path forms, judged on the exact string that would be stored.
 *
 * What this is NOT is a sanitiser. Nothing is stripped, replaced or shortened:
 * `S-CONTENT` requires rejection rather than silent truncation, and a sanitiser
 * would hand the caller a name it did not choose while telling it the upload
 * succeeded.
 */
export const declaredFilenameSchema = z
  .string({ error: 'upload_filename_invalid' satisfies UploadRejectionCode })
  .max(FILENAME_MAX_LENGTH, {
    error: 'upload_filename_invalid' satisfies UploadRejectionCode,
  })
  .trim()
  .transform(toCanonicalUnicodeForm)
  .refine((value) => value.length >= MIN_DECLARED_BYTES, {
    error: 'upload_filename_invalid' satisfies UploadRejectionCode,
  })
  .refine((value) => value.length <= FILENAME_MAX_LENGTH, {
    error: 'upload_filename_invalid' satisfies UploadRejectionCode,
  })
  .refine((value) => !containsControlCharacter(value), {
    error: 'upload_filename_control_character' satisfies UploadRejectionCode,
  })
  .refine((value) => !containsBidirectionalFormatting(value), {
    error: 'upload_filename_bidi_override' satisfies UploadRejectionCode,
  })
  .refine((value) => !addressesAPath(value), {
    error: 'upload_filename_path_traversal' satisfies UploadRejectionCode,
  });

/**
 * The opaque identifier naming one upload.
 *
 * Issued by the server at initiation and sent back by the client at completion.
 * It is the only value from an initiation response a client may return, and a
 * malformed one is reported as not found rather than as malformed: whether an
 * identifier is well formed and whether it exists are not a caller's business to
 * distinguish, and reporting the difference would let a caller probe the space.
 */
export const uploadIdSchema = z
  .string({ error: 'upload_not_found' satisfies UploadRejectionCode })
  .min(MIN_DECLARED_BYTES, { error: 'upload_not_found' satisfies UploadRejectionCode })
  .max(UPLOAD_ID_MAX_LENGTH, { error: 'upload_not_found' satisfies UploadRejectionCode })
  .regex(UPLOAD_ID_PATTERN, { error: 'upload_not_found' satisfies UploadRejectionCode });

/**
 * An opaque reference to a stored object.
 *
 * This is what a record carries in place of bytes and in place of an address. It
 * is not a URL and it is not redeemable: resolving it to something a client can
 * fetch is a separate, authorized act that mints a fresh short-lived grant,
 * which is what makes revocation effective per `S-AUTHZ-READ`'s rule that a link
 * is a projection at resolution time [docs/workflows/00-product-overview.md
 * L512].
 *
 * A data URL and a raw byte string are both structurally impossible here rather
 * than merely discouraged: the character class admits no colon, semicolon or
 * comma, and the length bound admits no payload.
 */
export const objectReferenceSchema = z
  .string({ error: 'upload_object_reference_invalid' satisfies UploadRejectionCode })
  .max(OBJECT_REFERENCE_MAX_LENGTH, {
    error: 'upload_object_reference_invalid' satisfies UploadRejectionCode,
  })
  .refine(isObjectReference, {
    error: 'upload_object_reference_invalid' satisfies UploadRejectionCode,
  });

/**
 * A pre-signed destination the client transfers bytes to.
 *
 * This value appears in exactly one place — the initiation response — and that
 * is a constraint rather than an accident of modelling. It is an `S-SECRET`
 * class-B capability [docs/workflows/00-product-overview.md L546]: scoped to one
 * capability and one object, carrying an expiry resolved at issuance and enforced
 * server-side, revocable, stripped from every log, and **never rendered in
 * full**. A client uses it and discards it; no record below holds one, and no
 * surface displays one.
 */
export const presignedDestinationSchema = z
  .string({ error: 'upload_destination_invalid' satisfies UploadRejectionCode })
  .max(PRESIGNED_DESTINATION_MAX_LENGTH, {
    error: 'upload_destination_invalid' satisfies UploadRejectionCode,
  })
  .refine(isAllowedAbsoluteAddress, {
    error: 'upload_destination_invalid' satisfies UploadRejectionCode,
  });

/**
 * An absolute instant in coordinated universal time.
 *
 * A local time without an offset and a value carrying a numeric offset are both
 * rejected: the first is ambiguous and the second invites a caller to assert its
 * own clock's relationship to the truth. `PROJECT_RULE_R3` requires an absolute
 * timestamp rather than a duration, and this makes the requirement unbypassable
 * — a number of seconds, a remaining duration or a bare calendar date cannot
 * parse at all.
 *
 * DELIBERATELY NOT EXPORTED, and the reason is a real constraint rather than a
 * stylistic preference. `./preference.ts` already exports a schema and a type
 * under exactly these two names, and the package barrel re-exports every schema
 * module through it. Two modules exporting one name makes the star re-export
 * ambiguous — the compiler reports it and the name is dropped from the package
 * surface — so a second public `absoluteInstantSchema` would break the barrel for
 * every consumer, not merely duplicate a definition.
 *
 * The validator itself is nonetheless declared here rather than imported, because
 * each schema module carries its own rejection-code vocabulary and a shared
 * validator would have to emit another module's codes. That is the same trade the
 * sibling modules make: the *discipline* is shared and stated once in the header,
 * the *validator* is local, and only one module owns the public name.
 */
const absoluteInstantSchema = z.iso.datetime({
  offset: false,
  error: 'upload_instant_invalid' satisfies UploadRejectionCode,
});

/* ===========================================================================
 * The allowed-type policy
 *
 * `S-UPLOAD` requires "an allowlist of accepted types, with active-content
 * formats — including vector images carrying script, and documents carrying
 * embedded macros or external references — rejected rather than sanitised in
 * place" [docs/workflows/00-product-overview.md L518]. The policy lives here, in
 * one place, as data, and the schema is derived from it rather than restating it,
 * so the policy and the validator cannot disagree and the rejection code is
 * uniform whichever family refused the type.
 *
 * ---------------------------------------------------------------------------
 * WHAT THE CHECK HERE IS, AND WHAT IT IS NOT
 * ---------------------------------------------------------------------------
 *
 * The client-declared type is checked against this policy for a **fast
 * rejection**: a request naming a type the product will never accept is refused
 * before a grant is issued, which saves an identifier, a round trip and a stored
 * object nobody wanted.
 *
 * The **authoritative** check is a different check, at a different time, on
 * different evidence. It happens server-side after the bytes are in storage, and
 * it determines the type from the content rather than from the filename or the
 * declared type. The two are not redundant and neither substitutes for the other:
 * passing the check here means only that the caller *claimed* an acceptable type.
 * A caller that lies passes this and fails that.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS ABSENT BY CONTRACT
 * ---------------------------------------------------------------------------
 *
 * The scriptable vector image format is deliberately not in the image list. It is
 * the canonical instance of the active-content class the contract names, and the
 * contract's instruction is to reject rather than sanitise, so its absence is the
 * implementation of that instruction rather than an oversight to be corrected by
 * a later reader who finds an image missing from the list.
 *
 * Every entry is a vendor-neutral registered media type. Formats whose registered
 * identifier embeds a company or product name are excluded for a second,
 * independent reason: `PROJECT_RULE_R4` forbids a third-party product name in
 * source, and a media-type constant is source.
 *
 * The document family is admitted even though a document can carry active
 * content, because a document preview card is an evidenced rendering
 * [docs/workflows/README.md L331, frame 208]. The active content inside such a
 * file is refused by the server-side scan that `S-UPLOAD` requires before the
 * object is stored, previewed or served — not by this list, which cannot see
 * inside anything.
 * =========================================================================== */

/**
 * Raster image types accepted for a photo, an emoji image or an image attachment.
 *
 * Raster only, and every one of them re-encoded server-side to a known-good
 * encoder output with embedded metadata — including any location and device
 * fields — discarded, per `S-UPLOAD`.
 */
export const ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
] as const;

/**
 * Audio types accepted for a recorded clip or an audio attachment.
 *
 * The first entry is what a browser recorder produces by default, which is why
 * the composer's own recorder [docs/workflows/03-messaging-and-composer.md L653,
 * frames 200, 201] can work without a client-side transcode.
 */
export const ALLOWED_AUDIO_CONTENT_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
] as const;

/** Video types accepted for a recorded clip or a video attachment. */
export const ALLOWED_VIDEO_CONTENT_TYPES = ['video/mp4', 'video/webm'] as const;

/**
 * Document and text types accepted for an attachment or a snippet.
 *
 * Plain text is first because it is what a snippet stores
 * [docs/workflows/03-messaging-and-composer.md L653, frame 148].
 */
export const ALLOWED_DOCUMENT_CONTENT_TYPES = [
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
  'application/pdf',
  'application/zip',
] as const;

/**
 * Every content type the product accepts, across every purpose.
 *
 * Composed from the four families rather than listed again, so a type added to a
 * family is admitted here automatically and a type removed from one cannot
 * survive here. This is the structural allowlist; a purpose narrows it further
 * through the policy map below, and the narrower of the two is what binds.
 */
export const ALLOWED_CONTENT_TYPES = [
  ...ALLOWED_IMAGE_CONTENT_TYPES,
  ...ALLOWED_AUDIO_CONTENT_TYPES,
  ...ALLOWED_VIDEO_CONTENT_TYPES,
  ...ALLOWED_DOCUMENT_CONTENT_TYPES,
] as const;

/** A content type the product accepts for at least one purpose. */
export type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

/**
 * A declared content type.
 *
 * Two checks, and the order matters for the message the caller receives. The
 * shape check comes first, so a value that is not a media type at all is reported
 * as malformed rather than as refused — a caller sending a filename here has a
 * different defect from one sending a real type the product declines. The
 * allowlist check comes second and is derived from the constant above.
 *
 * The bound is applied before either, so a long value is refused without being
 * matched against a pattern.
 */
export const declaredContentTypeSchema = z
  .string({ error: 'upload_type_malformed' satisfies UploadRejectionCode })
  .max(CONTENT_TYPE_MAX_LENGTH, {
    error: 'upload_type_malformed' satisfies UploadRejectionCode,
  })
  .regex(MEDIA_TYPE_PATTERN, {
    error: 'upload_type_malformed' satisfies UploadRejectionCode,
  })
  .refine(
    (value): value is AllowedContentType =>
      ALLOWED_CONTENT_TYPES.some((allowed) => allowed === value),
    { error: 'upload_type_not_allowed' satisfies UploadRejectionCode },
  );

/**
 * The content type a stored object is served under.
 *
 * Distinct from the declared type by contract, not by convention. `S-UPLOAD`
 * requires a stored object to be served under a type **the product chose**,
 * derived from the content, so this field is server-assigned and is deliberately
 * absent from every request shape in this module. A caller that could set it
 * could make the product serve arbitrary bytes as an executable type, which is
 * the sniffing attack the contract closes.
 */
export const derivedContentTypeSchema = z.enum(ALLOWED_CONTENT_TYPES, {
  error: 'upload_type_not_allowed' satisfies UploadRejectionCode,
});

/* ===========================================================================
 * The upload purpose — the shape the server authorizes against
 *
 * This is the most load-bearing shape in the file, and the reason is worth
 * stating once rather than leaving to be inferred. A pre-signed destination is a
 * capability: whoever holds it can put bytes into the product's storage. Issuing
 * one is therefore an operation, and per `S-AUTHZ-OP` an operation is authorized
 * "server-side, at the point of execution, against the acting principal's current
 * capability for the specific object" [docs/workflows/00-product-overview.md
 * L502]. A destination issued without that check is a capability handed to an
 * unauthorized caller, and no amount of checking afterwards recovers it, because
 * the bytes are already in the bucket.
 *
 * "The specific object" is what a purpose names. That is why this is a
 * discriminated union rather than a string tag with an optional identifier beside
 * it: each branch carries exactly the reference its own authorization needs, and
 * a branch cannot be constructed without it. The five checks are genuinely
 * different, and a single generic check would be the weakest of them:
 *
 *   - a conversation attachment — may the session post into THAT conversation;
 *   - a message-draft attachment — is THAT draft the session's own;
 *   - a profile photo — no target reference at all, because the target is the
 *     session's own record and a reference would be a way to name somebody
 *     else's;
 *   - a custom-emoji image — may the session make a workspace-wide change, which
 *     the observed surface's own copy states is what this is
 *     [docs/workflows/03-messaging-and-composer.md L720];
 *   - a snippet — may the session post into the conversation it will be shared
 *     to, the share flag arriving pre-ticked and pre-scoped to the conversation
 *     the composer belongs to [docs/workflows/03-messaging-and-composer.md L150,
 *     frame 144].
 *
 * WHAT NO BRANCH CARRIES. No branch names a workspace and no branch names an
 * actor. Per `PROJECT_RULE_R1` neither may inform an authorization decision, and
 * the absence of the field is the enforcement. The conversation and draft
 * references are targets rather than principals: naming one asks a question, and
 * the server answers it against the session.
 * =========================================================================== */

/**
 * The purposes an upload may serve.
 *
 * A readonly tuple so the discriminator values are derived from one list and a
 * consumer can enumerate the set exhaustively — which is what lets a route table
 * or a policy map be checked for completeness rather than hoped complete.
 */
export const UPLOAD_PURPOSE_KINDS = [
  'conversation_attachment',
  'message_draft_attachment',
  'profile_photo',
  'custom_emoji_image',
  'snippet',
] as const;

/** Which of the five things an upload is for. */
export type UploadPurposeKind = (typeof UPLOAD_PURPOSE_KINDS)[number];

/**
 * An opaque reference to a target an upload attaches to.
 *
 * Shaped like the upload identifier and bounded the same way, because both are
 * opaque record identifiers and `S-PII` requires that where a record must be
 * referenced it is referenced by exactly such an identifier rather than by a
 * personal value [docs/workflows/00-product-overview.md L558]. Nothing may be
 * inferred from its contents, and a caller naming a target it may not reach gets
 * a server-side denial rather than a hint.
 */
const targetReferenceSchema = z
  .string({ error: 'upload_purpose_invalid' satisfies UploadRejectionCode })
  .min(MIN_DECLARED_BYTES, { error: 'upload_purpose_invalid' satisfies UploadRejectionCode })
  .max(UPLOAD_ID_MAX_LENGTH, { error: 'upload_purpose_invalid' satisfies UploadRejectionCode })
  .regex(UPLOAD_ID_PATTERN, { error: 'upload_purpose_invalid' satisfies UploadRejectionCode });

/**
 * The square crop a client applied to a profile photo.
 *
 * The photo is "explicitly optional, stored from a square crop and rendered as
 * the message-row avatar" [docs/workflows/01-onboarding-and-auth.md L778, frames
 * 11, 21, 22], and the crop stage overlays a square frame with four corner
 * handles over a letterboxed source, previewing the result as the avatar tile it
 * will become (frame 21). The catalog records the crop as square and fixed-ratio
 * as an inference from those captures rather than as an observed interaction, and
 * that reading is implemented here: one edge length, not two, so a non-square
 * crop cannot be expressed at all.
 *
 * `./user.ts` names this module as the authority for the rule, because the crop
 * is a property of what was uploaded rather than of the person: that module holds
 * only the resulting reference.
 *
 * THE SERVER DOES NOT TRUST THIS. It is the geometry the client *applied*, and it
 * arrives with the same standing as the declared filename and the declared type
 * — a claim about bytes the server has not seen. The server re-derives the crop
 * against the decoded source and re-encodes the result to a known-good encoder
 * output with embedded metadata discarded, per `S-UPLOAD`. Two failure modes make
 * that necessary rather than fastidious: an offset plus an edge that reach past
 * the decoded bounds, and a source whose real dimensions differ from whatever the
 * client measured. Both are resolved by re-deriving, and neither is detectable
 * here, because the bytes are not here.
 */
export const cropGeometrySchema = z.strictObject({
  /**
   * Distance from the source's left edge to the crop's left edge, in pixels.
   *
   * Zero is legitimate and common — a crop flush to the edge of a landscape
   * source — so the floor is zero rather than the minimum edge length.
   */
  offsetX: z
    .number({ error: 'upload_crop_invalid' satisfies UploadRejectionCode })
    .int({ error: 'upload_crop_invalid' satisfies UploadRejectionCode })
    .min(0, { error: 'upload_crop_invalid' satisfies UploadRejectionCode })
    .max(MAX_IMAGE_EDGE_PIXELS, { error: 'upload_crop_invalid' satisfies UploadRejectionCode }),

  /** Distance from the source's top edge to the crop's top edge, in pixels. */
  offsetY: z
    .number({ error: 'upload_crop_invalid' satisfies UploadRejectionCode })
    .int({ error: 'upload_crop_invalid' satisfies UploadRejectionCode })
    .min(0, { error: 'upload_crop_invalid' satisfies UploadRejectionCode })
    .max(MAX_IMAGE_EDGE_PIXELS, { error: 'upload_crop_invalid' satisfies UploadRejectionCode }),

  /**
   * The length of the crop's edge, in pixels.
   *
   * ONE edge, because the crop is square. A width and a height would make a
   * non-square crop representable, and a representable state that the contract
   * forbids is a state some consumer will eventually produce.
   */
  edge: z
    .number({ error: 'upload_crop_invalid' satisfies UploadRejectionCode })
    .int({ error: 'upload_crop_invalid' satisfies UploadRejectionCode })
    .min(MIN_CROP_EDGE_PIXELS, { error: 'upload_crop_invalid' satisfies UploadRejectionCode })
    .max(MAX_IMAGE_EDGE_PIXELS, { error: 'upload_crop_invalid' satisfies UploadRejectionCode }),
});

/** The square crop a client applied to a profile photo, as claimed by the client. */
export type CropGeometry = z.infer<typeof cropGeometrySchema>;

/**
 * An attachment on a message being posted to a conversation.
 *
 * Authorized against the conversation: may this session post there, now. A
 * membership is not the whole answer — [docs/workflows/02-channels.md L954] is
 * explicit that "membership does not decide readability on its own" — and a
 * conversation archived a moment ago is a case the integration suite covers
 * precisely because the grant and the post are two separate moments.
 */
export const conversationAttachmentPurposeSchema = z.strictObject({
  /** The discriminator. */
  kind: z.literal('conversation_attachment'),
  /** The conversation the attachment will be posted into. */
  conversation: targetReferenceSchema,
});

/**
 * An attachment staged in a composer draft that has not been sent.
 *
 * This is the pending attachment tile the composer renders
 * [docs/workflows/README.md L331, frame 165]. It is a distinct purpose from a
 * conversation attachment rather than the same one earlier, because the
 * authorization question is different: a draft belongs to exactly one person, so
 * the check is ownership of the draft rather than the right to post. A draft is
 * per-viewer state, which is why the conversation is not named here — resolving
 * the draft resolves its conversation server-side, and naming both would let the
 * two disagree.
 */
export const messageDraftAttachmentPurposeSchema = z.strictObject({
  /** The discriminator. */
  kind: z.literal('message_draft_attachment'),
  /** The draft the attachment is staged on. */
  draft: targetReferenceSchema,
});

/**
 * An image becoming the acting person's own profile photo.
 *
 * NO TARGET REFERENCE, and that absence is the security property. The target is
 * the session's own record, so there is nothing to name; a field for a person
 * here would be a field a caller could point at somebody else, and the server's
 * check would then exist to refuse something the shape should never have been
 * able to express. Per `PROJECT_RULE_R1` an actor is never caller-supplied, and
 * this branch is that requirement in its strongest available form.
 */
export const profilePhotoPurposeSchema = z.strictObject({
  /** The discriminator. */
  kind: z.literal('profile_photo'),
  /** The square crop the client applied. Re-derived server-side; see the schema. */
  crop: cropGeometrySchema,
});

/**
 * An image becoming a custom emoji available to the whole workspace.
 *
 * Authorized as a workspace-wide mutation rather than as a personal one. The
 * observed dialog states in its own copy that the emoji will be available to
 * everyone in the workspace [docs/workflows/03-messaging-and-composer.md L340,
 * L720], so the capability required is a workspace capability and the audit
 * record is a workspace-scoped one.
 *
 * The emoji's NAME is not here. It is a content value with its own uniqueness
 * rule — the observed surface refuses a name already taken (frame 217) — and it
 * belongs with the content vocabulary in `./content.ts`, which already bounds an
 * emoji name and validates its token shape. Carrying it here as well would give
 * one value two definitions.
 */
export const customEmojiImagePurposeSchema = z.strictObject({
  /** The discriminator. */
  kind: z.literal('custom_emoji_image'),
});

/**
 * A snippet stored as a shareable file.
 *
 * Authorized against the conversation the snippet will be shared to. The share
 * flag "arrives pre-ticked and pre-scoped to the conversation the composer
 * belongs to, so the flow needs no separate destination choice"
 * [docs/workflows/03-messaging-and-composer.md L150, frame 144] — a pre-ticked
 * control is a rendering and never an authorization, so the conversation is
 * carried explicitly and checked like any other target.
 *
 * The snippet's own authoring payload is NOT here: the optional title with its
 * default-filename placeholder, the type chosen from a list whose default is
 * auto-detect, the line-numbered content, the wrap flag and the accompanying
 * message [docs/workflows/03-messaging-and-composer.md L653, frames 144, 146,
 * 148] all belong to `./message.ts`, together with the rule that content is
 * required while the title is optional (frames 144, 145, 148). That rule is
 * imported there from the shared constants module and is restated in neither
 * place. This branch describes only the stored object the snippet becomes.
 */
export const snippetPurposeSchema = z.strictObject({
  /** The discriminator. */
  kind: z.literal('snippet'),
  /** The conversation the snippet will be shared to. */
  conversation: targetReferenceSchema,
});

/**
 * What an upload is for, and therefore what the server authorizes against.
 *
 * Discriminated on `kind` so a consumer narrows by a single check and the
 * compiler can prove a handler covers every purpose. A policy map keyed by this
 * discriminator — as the two below are — turns a forgotten purpose into a type
 * error rather than into a silently unbounded upload.
 */
export const uploadPurposeSchema = z.discriminatedUnion(
  'kind',
  [
    conversationAttachmentPurposeSchema,
    messageDraftAttachmentPurposeSchema,
    profilePhotoPurposeSchema,
    customEmojiImagePurposeSchema,
    snippetPurposeSchema,
  ],
  { error: 'upload_purpose_invalid' satisfies UploadRejectionCode },
);

/** What an upload is for. The server authorizes the session against this. */
export type UploadPurpose = z.infer<typeof uploadPurposeSchema>;

/**
 * The byte ceiling each purpose permits.
 *
 * Keyed by the discriminator and typed as a total record, so adding a purpose
 * without giving it a ceiling fails to compile. That is the whole point of the
 * shape: an unbounded upload is not a thing this module should be able to
 * describe, and a partial map would let one exist by omission.
 *
 * A draft attachment and a conversation attachment share the attachment ceiling
 * deliberately — they are the same file at two moments of its life, and a draft
 * that could hold a file too large to post would fail at the worst possible time,
 * after the transfer.
 */
export const PURPOSE_BYTE_CEILINGS: Readonly<Record<UploadPurposeKind, number>> = {
  conversation_attachment: MAX_ATTACHMENT_BYTES,
  message_draft_attachment: MAX_ATTACHMENT_BYTES,
  profile_photo: MAX_PROFILE_PHOTO_BYTES,
  custom_emoji_image: MAX_CUSTOM_EMOJI_BYTES,
  snippet: MAX_SNIPPET_BYTES,
};

/**
 * The content types each purpose permits.
 *
 * Narrower than the structural allowlist wherever the purpose is narrower, and
 * the narrower of the two is what binds. A profile photo and a custom emoji are
 * images and nothing else — accepting a document as an avatar would be a defect
 * that the general allowlist alone would not catch. A snippet is text and
 * nothing else, because it is stored as line-numbered text.
 *
 * The two attachment purposes admit every family, because the composer's own
 * controls produce audio and video clips [docs/workflows/03-messaging-and-composer.md
 * L527] and its attachment path produces documents and images.
 */
export const PURPOSE_CONTENT_TYPE_POLICY: Readonly<
  Record<UploadPurposeKind, readonly AllowedContentType[]>
> = {
  conversation_attachment: ALLOWED_CONTENT_TYPES,
  message_draft_attachment: ALLOWED_CONTENT_TYPES,
  profile_photo: ALLOWED_IMAGE_CONTENT_TYPES,
  custom_emoji_image: ALLOWED_IMAGE_CONTENT_TYPES,
  snippet: ALLOWED_DOCUMENT_CONTENT_TYPES,
};

/* ===========================================================================
 * Half one — initiation
 * =========================================================================== */

/**
 * Ask for permission to upload, and describe what is intended.
 *
 * ---------------------------------------------------------------------------
 * ALL THREE DECLARATIONS ARE UNTRUSTED CLIENT CLAIMS
 * ---------------------------------------------------------------------------
 *
 * The filename, the content type and the byte size are asserted by an untrusted
 * party about bytes the server has not seen and, at this moment, cannot see. They
 * are named `declared*` so that a call site cannot read one as a fact by
 * accident. Validating them here buys a fast, cheap rejection and nothing more.
 *
 * The server's obligations, none of which this schema can discharge:
 *
 *   - THE SIZE is enforced by the **pre-signed policy** attached to the grant, so
 *     that a client which declares one size and sends another is refused by
 *     storage itself rather than trusted and then measured. A declared size is a
 *     routing hint; the policy is the enforcement.
 *   - THE CONTENT TYPE is **re-derived from the stored bytes** after the transfer,
 *     per `S-UPLOAD`'s requirement of "type determination from content rather than
 *     from the filename or the declared media type"
 *     [docs/workflows/00-product-overview.md L518]. The declared value is never
 *     what the object is served under; see `derivedContentTypeSchema`.
 *   - THE FILENAME is **sanitised before it is used** in a content-disposition
 *     header, a storage path or a rendered label, and it is encoded per output
 *     context at render time per `S-CONTENT`. It has already been *rejected* here
 *     if it carried a control character, a bidirectional override or a path form
 *     — see `declaredFilenameSchema`, which rejects rather than repairs.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS NOT HERE
 * ---------------------------------------------------------------------------
 *
 * No workspace identifier and no uploader identifier: both come from the acting
 * session per `PROJECT_RULE_R1`, and the absent field is the enforcement.
 *
 * No bytes, in any encoding. Not a payload, not an encoded string, not a stream,
 * not a data URL. A file is not proxied through the API.
 *
 * No grant lifetime and no expiry request. A caller does not get to ask how long
 * its capability lasts; the lifetime is configuration, read by
 * `apps/api/src/storage/presign.ts`.
 *
 * ---------------------------------------------------------------------------
 * THE TWO CROSS-FIELD CHECKS
 * ---------------------------------------------------------------------------
 *
 * Both exist because a bound that depends on the purpose cannot live on a field.
 * They are applied after the field checks, so a malformed value is reported as
 * malformed rather than as out of policy.
 */
export const uploadInitiationRequestSchema = z
  .strictObject({
    /**
     * The name the client says the file has.
     *
     * Rejected outright if it carries a control character, a bidirectional
     * formatting character, a path separator or a parent-directory sequence.
     * Never truncated to fit.
     */
    declaredFilename: declaredFilenameSchema,

    /**
     * The media type the client says the file is.
     *
     * Checked against the allowlist here for a fast rejection; re-derived from
     * the content server-side, which is the check that counts.
     */
    declaredContentType: declaredContentTypeSchema,

    /**
     * The size in bytes the client says the file is.
     *
     * A whole, positive number bounded by the widest ceiling any purpose permits.
     * The purpose's own ceiling is applied below, and the pre-signed policy
     * enforces the real limit on the real bytes.
     */
    declaredByteSize: z
      .number({ error: 'upload_size_invalid' satisfies UploadRejectionCode })
      .int({ error: 'upload_size_invalid' satisfies UploadRejectionCode })
      .min(MIN_DECLARED_BYTES, { error: 'upload_size_invalid' satisfies UploadRejectionCode })
      .max(MAX_DECLARED_BYTES, { error: 'upload_size_exceeded' satisfies UploadRejectionCode }),

    /**
     * What the upload is for, and therefore what the server authorizes against.
     *
     * The server resolves the target this names, authorizes the acting session
     * against **that specific object**, and only then issues a destination.
     */
    purpose: uploadPurposeSchema,
  })
  .refine((request) => request.declaredByteSize <= PURPOSE_BYTE_CEILINGS[request.purpose.kind], {
    error: 'upload_size_exceeded' satisfies UploadRejectionCode,
  })
  .refine(
    (request) =>
      PURPOSE_CONTENT_TYPE_POLICY[request.purpose.kind].some(
        (allowed) => allowed === request.declaredContentType,
      ),
    { error: 'upload_type_not_allowed' satisfies UploadRejectionCode },
  );

/** A request for permission to upload one file, with the intent it serves. */
export type UploadInitiationRequest = z.infer<typeof uploadInitiationRequestSchema>;

/**
 * The grant: where to send the bytes, what the object will be called, and when
 * the permission stops working.
 *
 * Returned only after the server has authorized the acting session against the
 * specific target the purpose named. Reaching this shape is therefore evidence
 * that a check passed — which is exactly why the check must not be skipped, and
 * why a route that returns this shape without one is the single most serious
 * defect available in this area.
 */
export const uploadInitiationResponseSchema = z.strictObject({
  /**
   * The opaque identifier for this upload.
   *
   * The only value from this response a client sends back, and the value that
   * binds the completion request to the grant.
   */
  uploadId: uploadIdSchema,

  /**
   * The pre-signed destination the client transfers bytes to.
   *
   * A class-B capability: used and discarded, never stored by the client, never
   * rendered in full, and present in no other shape in this module.
   */
  destination: presignedDestinationSchema,

  /**
   * The opaque reference the stored object will have.
   *
   * Returned so a client can correlate its optimistic rendering with the record
   * it will receive. It is not an address and it is not fetchable: resolving it
   * is a separate authorized act.
   */
  objectReference: objectReferenceSchema,

  /**
   * The absolute instant the pre-signed grant stops working.
   *
   * AN INSTANT, NEVER A DURATION. `PROJECT_RULE_R3` requires the record to carry
   * an absolute timestamp so a configured default can change without invalidating
   * anything already issued, and `S-SECRET` class B requires an expiry "resolved
   * at issuance and enforced server-side"
   * [docs/workflows/00-product-overview.md L546] — resolved at issuance is
   * precisely what an absolute instant expresses and a duration does not.
   *
   * The lifetime that produced it is deliberately not restated anywhere in this
   * module: it is configuration, read by `apps/api/src/storage/presign.ts`, and a
   * second copy of it here would be a second thing to change.
   *
   * A client renders remaining time by subtracting the current instant from this
   * one. It must not treat the value as authoritative for anything but its own
   * display: the expiry is enforced by storage and re-checked by the server, and a
   * client whose clock is wrong is a client whose retry is refused rather than a
   * client that gets extra time.
   */
  grantExpiresAt: absoluteInstantSchema,
});

/** Where to send the bytes, and until when. */
export type UploadInitiationResponse = z.infer<typeof uploadInitiationResponseSchema>;

/* ===========================================================================
 * Half two — completion
 * =========================================================================== */

/**
 * Tell the server the transfer finished.
 *
 * ---------------------------------------------------------------------------
 * THIS IS A CLAIM TOO, AND COMPLETION IS WHERE THE SERVER STOPS TAKING CLAIMS
 * ---------------------------------------------------------------------------
 *
 * A client saying "it is uploaded" is not evidence that anything was uploaded.
 * Completion is the moment the server finally has bytes it can examine, and per
 * `S-UPLOAD` it examines them rather than accepting the description it was given
 * at initiation. In order:
 *
 *   1. resolve the upload from its identifier, and **re-authorize** the acting
 *      session against the target the purpose names — a grant issued a moment ago
 *      is not a grant now, and authorization may have been revoked in between;
 *   2. verify the object **exists** in storage and is fully written, reporting
 *      `upload_incomplete` if it is not;
 *   3. **re-derive the content type from the content**, and refuse the object if
 *      what it actually is falls outside the policy for its purpose — this is
 *      where a caller that lied at initiation is caught;
 *   4. check the **actual** byte size against the purpose's ceiling, and check
 *      decoded dimensions and decompressed size against their separate bounds, so
 *      that a small file which expands enormously is refused rather than processed;
 *   5. **scan** the content before the object is stored durably, previewed or
 *      served;
 *   6. **re-encode** an image to a known-good encoder output, discarding embedded
 *      metadata including any location and device fields, and re-derive the crop
 *      rather than trusting the geometry the client applied;
 *   7. only then make the object **visible** — which is to say, only then does a
 *      record exist for a projection to return.
 *
 * Any refusal produces a rejection code from this module's set, because
 * `S-UPLOAD` requires "an explicit rejection state shown to the uploader for
 * every refusal reason".
 *
 * ---------------------------------------------------------------------------
 * WHY THE PURPOSE IS SENT AGAIN
 * ---------------------------------------------------------------------------
 *
 * It is not a convenience. The server holds the purpose it authorized at
 * initiation, and the value here is **compared against it** rather than trusted
 * in its place: a completion whose purpose differs from the grant's is refused.
 * That closes the substitution this design would otherwise permit — obtaining a
 * grant for a draft one owns and then completing it as a profile photo, or as an
 * emoji image visible to the whole workspace. Carrying the purpose makes the
 * mismatch detectable at the boundary instead of leaving the two halves of one
 * transfer describing different things.
 */
export const uploadCompletionRequestSchema = z.strictObject({
  /**
   * The identifier the initiation response returned.
   *
   * Resolves the grant, the authorized purpose and the expected object. An
   * unknown, malformed or already-completed identifier is `upload_not_found`.
   */
  uploadId: uploadIdSchema,

  /**
   * The purpose this upload was granted for.
   *
   * Compared against the stored grant, never substituted for it, and re-authorized
   * against the target it names.
   */
  purpose: uploadPurposeSchema,
});

/** A claim that a transfer finished, to be verified rather than believed. */
export type UploadCompletionRequest = z.infer<typeof uploadCompletionRequestSchema>;

/* ===========================================================================
 * Transfer state, including the two states the corpus never shows
 *
 * The corpus evidences two of the four states below. It shows the attachment tile
 * pending in the composer [docs/workflows/README.md L331, frame 165] and the
 * upload in progress "rendered as a bordered placeholder block occupying the
 * finished block's footprint" (frame 321), and it shows finished results
 * everywhere. It shows no failure at all: "no capture shows a file being
 * rejected, a scan running, a size limit being hit or a preview failing"
 * [docs/workflows/00-product-overview.md L522].
 *
 * Under `PROJECT_RULE_R3` that absence is an open work item and never permission
 * to omit, so the failure state ships. It is one of the nine unevidenced state
 * families registered in `docs/decisions/gap-register.md`, which this module
 * references and does not edit; `S-UPLOAD` independently requires "an explicit
 * rejection state shown to the uploader for every refusal reason", so the
 * enforcement was required whether or not a capture existed.
 *
 * ---------------------------------------------------------------------------
 * THE IN-PROGRESS STATE IS ONE SPECIFIC LOADING SHAPE, NOT LOADING IN GENERAL
 * ---------------------------------------------------------------------------
 *
 * The state matrix holds four loading shapes distinct — an in-place control, a
 * per-row status, a **block placeholder** and a region skeleton — and they are
 * not interchangeable. What the corpus shows for an upload is the block
 * placeholder: a bordered block occupying the footprint the finished block will
 * occupy (frame 321), which is what keeps the surrounding layout from moving when
 * the transfer completes. A consumer that renders a spinner in place of it has
 * substituted an in-place control for a block placeholder and produced a visible
 * reflow. `docs/decisions/state-matrix.md` owns that vocabulary; this module
 * references it and does not edit it.
 *
 * The two composer states are distinct for the same reason. `pending` is the
 * attachment tile staged in the composer before a transfer begins (frame 165);
 * `in_progress` is the block placeholder during the transfer (frame 321). One is
 * a staged item and the other is a running operation.
 * =========================================================================== */

/**
 * The states one transfer passes through.
 *
 * A readonly tuple so the set is enumerable and the union below is derived from
 * it rather than restated.
 */
export const UPLOAD_STATES = ['pending', 'in_progress', 'stored', 'failed'] as const;

/** Which state a transfer is in. */
export type UploadState = (typeof UPLOAD_STATES)[number];

/**
 * Percentage complete, as a whole number between nought and one hundred.
 *
 * A percentage rather than a byte count on purpose: a byte count would invite a
 * consumer to compare it against the declared size, and the declared size is a
 * claim. The bounds are the mathematical bounds of a percentage, so they are
 * literals rather than named constants — a percentage that ran past one hundred
 * would not be a policy breach but an arithmetic error, and naming these would
 * imply they were configurable.
 */
const transferredPercentSchema = z
  .number({ error: 'upload_size_invalid' satisfies UploadRejectionCode })
  .int({ error: 'upload_size_invalid' satisfies UploadRejectionCode })
  .min(0, { error: 'upload_size_invalid' satisfies UploadRejectionCode })
  .max(100, { error: 'upload_size_invalid' satisfies UploadRejectionCode });

/**
 * Staged in the composer, not yet transferring.
 *
 * The attachment tile pending in the composer [docs/workflows/README.md L331,
 * frame 165]. Nothing has been sent, so there is no progress to report and no
 * instant to record beyond the moment it was staged.
 */
export const uploadPendingStateSchema = z.strictObject({
  /** The discriminator. */
  state: z.literal('pending'),
  /** When the client staged the item. */
  stagedAt: absoluteInstantSchema,
});

/**
 * Transferring, rendered as a block placeholder.
 *
 * The bordered placeholder block occupying the finished block's footprint
 * [docs/workflows/README.md L331, frame 321].
 */
export const uploadInProgressStateSchema = z.strictObject({
  /** The discriminator. */
  state: z.literal('in_progress'),
  /** When the transfer began. */
  startedAt: absoluteInstantSchema,
  /** How far along it is, as a whole percentage. */
  transferredPercent: transferredPercentSchema,
});

/**
 * Stored, verified and visible.
 *
 * Reaching this state means every server-side obligation at completion was
 * discharged: the object exists, its type was re-derived from its content, its
 * actual size and decoded bounds were checked, it was scanned, and an image was
 * re-encoded. A record in any other state is not a file the product will serve.
 */
export const uploadStoredStateSchema = z.strictObject({
  /** The discriminator. */
  state: z.literal('stored'),
  /** When the server completed verification and made the object visible. */
  storedAt: absoluteInstantSchema,
});

/**
 * Refused or abandoned, with the reason.
 *
 * Authored under the gap contract because the corpus shows no failure. The reason
 * is a code from this module's set and never a sentence: a client maps the code to
 * authored copy, which is what lets one failure state express every refusal
 * reason `S-UPLOAD` demands be distinguishable.
 *
 * NO FILENAME AND NO ADDRESS ON THIS SHAPE. A failure is the shape most likely to
 * be logged, attached to an error report or sent to an analytics endpoint, and
 * `S-PII` forbids a personal value — which a filename routinely is — from
 * reaching any of those. The upload identifier is the opaque reference that
 * carries the correlation instead, which is exactly the substitution `S-PII`
 * prescribes.
 */
export const uploadFailedStateSchema = z.strictObject({
  /** The discriminator. */
  state: z.literal('failed'),
  /** When the transfer was refused or abandoned. */
  failedAt: absoluteInstantSchema,
  /** Which refusal reason applied. A code, never a rendered sentence. */
  reason: uploadRejectionCodeSchema,
  /**
   * Whether trying again could plausibly succeed.
   *
   * The distinction is the difference between an affordance and a dead control.
   * An expired grant or a failed transfer is worth retrying with a fresh grant; a
   * refused type or a breached ceiling never is, and offering a retry there
   * invites a person to repeat an action that cannot work. The only retry
   * affordance the corpus evidences anywhere is a try-again sentence inside a
   * failure pill, so this flag is what tells a consumer whether to render one.
   */
  retryable: z.boolean({ error: 'upload_state_invalid' satisfies UploadRejectionCode }),
});

/**
 * Where one transfer has got to.
 *
 * Discriminated on `state`, so a consumer narrows with a single check and the
 * compiler can prove a renderer covers all four — which is what stops the failure
 * state from being the one nobody drew.
 */
export const uploadStateSchema = z.discriminatedUnion(
  'state',
  [
    uploadPendingStateSchema,
    uploadInProgressStateSchema,
    uploadStoredStateSchema,
    uploadFailedStateSchema,
  ],
  { error: 'upload_state_invalid' satisfies UploadRejectionCode },
);

/** Where one transfer has got to, in one of exactly four states. */
export type UploadStateReport = z.infer<typeof uploadStateSchema>;

/** Staged in the composer, not yet transferring. */
export type UploadPendingState = z.infer<typeof uploadPendingStateSchema>;

/** Transferring, rendered as a block placeholder. */
export type UploadInProgressState = z.infer<typeof uploadInProgressStateSchema>;

/** Stored, verified and visible. */
export type UploadStoredState = z.infer<typeof uploadStoredStateSchema>;

/** Refused or abandoned, with the reason. */
export type UploadFailedState = z.infer<typeof uploadFailedStateSchema>;

/* ===========================================================================
 * The media sub-shapes
 *
 * Defined once here for every consumer, per `PROJECT_RULE_R5`. The media-player
 * contract in `packages/ui` renders them, and it is the only thing that renders
 * them: neither the client nor a feature declares a clip shape of its own, and a
 * second declaration would be a defect even if it happened to match.
 *
 * ---------------------------------------------------------------------------
 * WHAT A MEDIA SHAPE MAY CARRY: REFERENCES AND SCALARS, NEVER MEDIA
 * ---------------------------------------------------------------------------
 *
 * Every field below is an opaque reference to a stored object, a number, or an
 * enumerated value. Nothing carries media, and two absences are deliberate enough
 * to name:
 *
 * NO WAVEFORM SAMPLES. The corpus renders a waveform on the recorder pill and on
 * the attached player card [docs/workflows/03-messaging-and-composer.md L653,
 * frames 200, 201], and a build could be tempted to store the bars. A waveform is
 * a **rendering derived from the audio**, not a property of it: storing an array
 * of amplitudes would put a lossy copy of the content in the record, where it
 * would be projected by every read path that returns the file, would need its own
 * retention and deletion path under `S-RETENTION`, and would go stale against the
 * object it describes. The renderer derives it from the audio it is already
 * fetching.
 *
 * NO TRANSCRIPT, CAPTION OR SPEECH-DERIVED TEXT. `S-CONSENT` is explicit that "a
 * speech-derived record is a separate store from the conversation's message
 * history" [docs/workflows/00-product-overview.md L576], because conflating the
 * two would silently give speech the message history's search reach, export reach
 * and retention. A transcript field on a file would do precisely that, one step
 * removed. There is no such field here and none belongs on a message either.
 *
 * ---------------------------------------------------------------------------
 * THE CAPTURE LIFECYCLE THE CLIP SHAPES INHERIT
 * ---------------------------------------------------------------------------
 *
 * A clip is a device capture turned into content, so `S-CONSENT` [L576] attaches
 * a lifecycle to it that no other file in the product carries: a stated storage
 * scope, encryption at rest, a retention bound, **deletion when the draft or
 * record is discarded**, notification to every participant that the record is
 * being made, and a deletion path afterwards. The deletion clause is the one that
 * reaches this module's callers directly — the corpus shows the composer empty
 * after a clip was attached and does not settle whether it was sent or discarded
 * [docs/workflows/03-messaging-and-composer.md L254, frames 201, 202] — so a
 * discarded draft must delete its clip rather than leave an orphaned object in
 * storage.
 *
 * A sample taken to preview a device or drive a level meter is a different thing
 * entirely: it is "used transiently and discarded", never persisted and never
 * uploaded. It has no shape here because it has no record anywhere.
 * =========================================================================== */

/**
 * A duration in whole seconds.
 *
 * THE UNIT IS SECONDS, and it is stated here rather than encoded in the field
 * name because every consumer of a duration in this module reads this one
 * definition. A consumer that assumed milliseconds would render a clip as a
 * thousand times its length, which is the kind of defect a comment prevents more
 * reliably than a convention does.
 *
 * This is a **fixed** duration, of a finished recording. The running elapsed time
 * a recorder renders while capturing [docs/workflows/03-messaging-and-composer.md
 * L653, frame 200] is not this value and is not stored at all: it is live client
 * state that exists only while the recorder is open, and it becomes this value
 * once the recording is confirmed (frame 201).
 *
 * The floor is nought rather than one because whole seconds are the unit: a clip
 * shorter than a second is a real thing a person can record, and it floors to
 * nought when stored. Refusing it would refuse a legitimate recording on an
 * artefact of the unit, and the transfer is already bounded by a byte floor that a
 * genuinely empty capture cannot pass.
 */
const durationSecondsSchema = z
  .number({ error: 'upload_duration_invalid' satisfies UploadRejectionCode })
  .int({ error: 'upload_duration_invalid' satisfies UploadRejectionCode })
  .min(0, { error: 'upload_duration_invalid' satisfies UploadRejectionCode })
  .max(MAX_MEDIA_DURATION_SECONDS, {
    error: 'upload_duration_invalid' satisfies UploadRejectionCode,
  });

/** A pixel dimension of a decoded image or video frame. */
const pixelDimensionSchema = z
  .number({ error: 'upload_dimensions_invalid' satisfies UploadRejectionCode })
  .int({ error: 'upload_dimensions_invalid' satisfies UploadRejectionCode })
  .min(MIN_DECLARED_BYTES, { error: 'upload_dimensions_invalid' satisfies UploadRejectionCode })
  .max(MAX_IMAGE_EDGE_PIXELS, { error: 'upload_dimensions_invalid' satisfies UploadRejectionCode });

/**
 * An attached audio clip.
 *
 * The player card the composer renders once a recording is confirmed: "a filled
 * circular play control at the left, a waveform, and a duration readout at the
 * right" [docs/workflows/03-messaging-and-composer.md L653, frames 200, 201]. All
 * three are renderings; the only thing that needs storing is how long it is,
 * because the play control is a control and the waveform is derived.
 */
export const audioClipSchema = z.strictObject({
  /** The discriminator. */
  media: z.literal('audio_clip'),
  /** How long the clip is. Seconds; see `durationSecondsSchema`. */
  durationSeconds: durationSecondsSchema,
});

/** An attached audio clip: a duration and nothing else. */
export type AudioClip = z.infer<typeof audioClipSchema>;

/**
 * An attached video clip.
 *
 * "Video clip with a playback scrubber, elapsed and total time, a selectable
 * thumbnail and a download action" [docs/workflows/README.md L331, frame 190].
 * Three of those four are renderings or controls and need no field: the scrubber
 * is a control, the elapsed time is live playback position, and the download
 * action resolves a fresh grant rather than reading a stored address. What remains
 * is the total time and the thumbnail.
 */
export const videoClipSchema = z.strictObject({
  /** The discriminator. */
  media: z.literal('video_clip'),

  /** Total playing time. Seconds; see `durationSecondsSchema`. */
  durationSeconds: durationSecondsSchema,

  /**
   * The chosen thumbnail, as a reference to another stored object.
   *
   * The thumbnail is **selectable** (frame 190), so it is a choice a person made
   * rather than a frame the product picked — which means it has to be recorded
   * somewhere, and it is recorded as a reference to a stored object exactly like
   * the clip itself. It is a separate object rather than an offset into the video
   * because `S-UPLOAD` requires rendering and thumbnailing to happen "in an
   * isolated, resource-bounded, network-denied context": the isolated component
   * produces an object, and this is the reference to it.
   *
   * Null where no thumbnail exists yet, which is the state between the clip being
   * stored and the isolated component finishing. Absence is a legitimate value, so
   * the consumer renders a placeholder rather than treating it as an error.
   */
  thumbnail: objectReferenceSchema.nullable(),

  /** Decoded width of the video, in pixels. */
  width: pixelDimensionSchema,

  /** Decoded height of the video, in pixels. */
  height: pixelDimensionSchema,
});

/** An attached video clip: a duration, a thumbnail reference and its bounds. */
export type VideoClip = z.infer<typeof videoClipSchema>;

/**
 * A document rendered as a preview card inside a message.
 *
 * "Document preview card on a message" [docs/workflows/README.md L331, frame 208].
 * The page count is what a preview card needs beyond the name and the glyph the
 * record already carries; the preview image is a separate stored object produced
 * by the isolated renderer, for the same reason a video thumbnail is.
 *
 * The preview *pipeline* is deferred with the files-and-media area — the shape is
 * here because a Phase-1 message can carry a document, and a record shape that
 * could not describe one would have to be widened later by every consumer at
 * once.
 */
export const documentPreviewSchema = z.strictObject({
  /** The discriminator. */
  media: z.literal('document'),

  /**
   * How many pages the document has, or null where it has not been examined.
   *
   * Determined server-side from the content, like every other derived fact about
   * an uploaded object, and null until the isolated renderer has run. A page count
   * is not bounded by a named constant because it is a measured property of the
   * object rather than a policy: what bounds the object is the byte ceiling and
   * the decompressed-size bound `S-UPLOAD` requires.
   */
  pageCount: z
    .number({ error: 'upload_dimensions_invalid' satisfies UploadRejectionCode })
    .int({ error: 'upload_dimensions_invalid' satisfies UploadRejectionCode })
    .min(MIN_DECLARED_BYTES, { error: 'upload_dimensions_invalid' satisfies UploadRejectionCode })
    .nullable(),

  /** The first-page preview, as a reference to another stored object. Null until rendered. */
  preview: objectReferenceSchema.nullable(),
});

/** A document with a preview card on a message. */
export type DocumentPreview = z.infer<typeof documentPreviewSchema>;

/**
 * A stored profile photo.
 *
 * The photo is "explicitly optional, stored from a square crop and rendered as
 * the message-row avatar" [docs/workflows/01-onboarding-and-auth.md L778, frames
 * 11, 21, 22]. What is stored is the **result** of the crop, so the geometry is
 * gone by this point and one edge length describes the object completely.
 *
 * The edge here is the server's own measurement of the re-encoded object, not the
 * `edge` the client sent in its crop geometry. The server re-derives and
 * re-encodes rather than trusting the client's crop, so the two can legitimately
 * differ — a client crop that reached past the decoded bounds is clamped, and a
 * source smaller than the requested crop yields a smaller square.
 */
export const profilePhotoSchema = z.strictObject({
  /** The discriminator. */
  media: z.literal('profile_photo'),
  /** The edge of the stored square, in pixels, as measured server-side. */
  edge: pixelDimensionSchema,
});

/** A stored profile photo: one square, one edge. */
export type ProfilePhoto = z.infer<typeof profilePhotoSchema>;

/**
 * A snippet stored as a shareable file.
 *
 * "Snippet as a shareable file carrying an optional title with a default
 * filename, a type chosen from a list whose default is auto-detect, line-numbered
 * content, a wrap flag, an optional accompanying message and a
 * share-to-conversation flag scoped to a channel"
 * [docs/workflows/03-messaging-and-composer.md L653, frames 144, 146, 148].
 *
 * ONLY THE PRESENTATION FLAGS ARE HERE. The title, the content, the accompanying
 * message and the share flag are the snippet's **creation payload**, owned by
 * `./message.ts` along with the rule that content is the modal's only required
 * field while the title is optional (frames 144, 145, 148) — a rule imported
 * there from the shared constants module and restated in neither place. Modelling
 * any of them here as well would give one value two definitions and let the two
 * drift.
 *
 * What remains are two facts about the stored object: how to present its text, and
 * whether the type was chosen or detected.
 */
export const snippetFileSchema = z.strictObject({
  /** The discriminator. */
  media: z.literal('snippet'),

  /**
   * Whether long lines wrap when the content is rendered.
   *
   * The observed control arrives unticked (frame 144), so `false` is the default a
   * creation path supplies. It is a presentation property of the stored object
   * rather than of the message that shares it, which is why it lives here.
   */
  wrap: z.boolean({ error: 'upload_state_invalid' satisfies UploadRejectionCode }),

  /**
   * Whether the syntax type was detected rather than chosen.
   *
   * The observed type select defaults to auto-detect and carries a leading check
   * mark on that entry (frames 144, 146), and a person may choose a specific type
   * instead (frame 147). The distinction is worth keeping: a detected type may be
   * re-detected later as detection improves, and a chosen one must not be
   * overwritten.
   *
   * The type *identifier* itself is not modelled as an enumeration here. The
   * observed list is "a long list of language options" (frame 146) and the corpus
   * captures only its head, so enumerating it from the capture would invent a
   * closed set from a partial view. It travels with the snippet's creation payload
   * in `./message.ts`, where the language-hint vocabulary already lives.
   */
  typeAutoDetected: z.boolean({ error: 'upload_state_invalid' satisfies UploadRejectionCode }),
});

/** A snippet stored as a shareable file: its two presentation facts. */
export type SnippetFile = z.infer<typeof snippetFileSchema>;

/**
 * A custom-emoji image, as a stored object.
 *
 * The upload half of the workspace-wide emoji mutation
 * [docs/workflows/03-messaging-and-composer.md L340, L720]. The emoji's name is
 * not here: it is a content value with its own token shape and its own uniqueness
 * rule, and it belongs to the content vocabulary in `./content.ts`. This shape
 * describes the image alone.
 */
export const customEmojiImageSchema = z.strictObject({
  /** The discriminator. */
  media: z.literal('custom_emoji_image'),
  /** Decoded width of the stored image, in pixels. */
  width: pixelDimensionSchema,
  /** Decoded height of the stored image, in pixels. */
  height: pixelDimensionSchema,
});

/** A custom-emoji image, as a stored object. */
export type CustomEmojiImage = z.infer<typeof customEmojiImageSchema>;

/**
 * A plain stored object with no media-specific presentation of its own.
 *
 * The general case: an attachment that is neither a clip, nor a document with a
 * preview, nor a snippet, nor an image with a role. It carries no extra field,
 * because everything a consumer needs to render it — the functional glyph, the
 * name, the sharer, the shared instant, the size and the derived type — is on the
 * record itself.
 *
 * It exists as an explicit branch rather than by making the media field optional.
 * An optional field is a field a mistake can leave unset, and a discriminated
 * union with a named default branch forces a producer to say which kind of thing
 * it has.
 */
export const genericFileSchema = z.strictObject({
  /** The discriminator. */
  media: z.literal('generic'),
});

/** A stored object with no media-specific presentation. */
export type GenericFile = z.infer<typeof genericFileSchema>;

/**
 * What kind of thing a stored object is, and what its renderer needs.
 *
 * Discriminated on `media`, so the media-player contract narrows with one check
 * and the compiler proves it handles every kind. Adding a kind is therefore a
 * compile error in every renderer rather than a silently unrendered file.
 */
export const fileMediaSchema = z.discriminatedUnion(
  'media',
  [
    audioClipSchema,
    videoClipSchema,
    documentPreviewSchema,
    profilePhotoSchema,
    snippetFileSchema,
    customEmojiImageSchema,
    genericFileSchema,
  ],
  { error: 'upload_state_invalid' satisfies UploadRejectionCode },
);

/** What kind of thing a stored object is. */
export type FileMedia = z.infer<typeof fileMediaSchema>;

/** The discriminator value of one media kind. */
export type FileMediaKind = FileMedia['media'];

/**
 * The byte ceiling each media kind permits, applied at completion.
 *
 * THE SECOND OF THE TWO LAYERS described in the bounds section. The purpose layer
 * binds at initiation, on a declared type that is only a claim; this layer binds
 * at completion, on the media kind the server **derived from the content**. Both
 * bind and the narrower wins.
 *
 * It exists because the two layers can only be as precise as their evidence. At
 * initiation a plain-text attachment and a video attachment are the same request
 * with a different string in it, so both have to be granted the attachment
 * ceiling — which must accommodate a video clip. Without this layer that would be
 * the end of it, and a caller could store two hundred megabytes of audio by
 * declaring it as an attachment, which is true. Once the bytes exist the product
 * knows better, and this is where it acts on knowing.
 *
 * Keyed by the media discriminator and typed as a total record, so adding a media
 * kind without giving it a ceiling fails to compile rather than inheriting the
 * widest one by omission.
 *
 * The generic kind carries the attachment ceiling deliberately: it is the kind for
 * an object with no media-specific presentation, so there is nothing narrower to
 * infer, and its path's own ceiling is the honest answer.
 */
export const MEDIA_BYTE_CEILINGS: Readonly<Record<FileMediaKind, number>> = {
  audio_clip: MAX_AUDIO_CLIP_BYTES,
  video_clip: MAX_VIDEO_CLIP_BYTES,
  document: MAX_DOCUMENT_BYTES,
  profile_photo: MAX_PROFILE_PHOTO_BYTES,
  snippet: MAX_SNIPPET_BYTES,
  custom_emoji_image: MAX_CUSTOM_EMOJI_BYTES,
  generic: MAX_ATTACHMENT_BYTES,
};

/**
 * The content types each media kind may be served under, applied at completion.
 *
 * The companion to `MEDIA_BYTE_CEILINGS` and the same second layer. Once the
 * server has derived the type from the content it also knows which media kind the
 * object is, and the two must agree: an object presented as an audio clip and
 * served under a video type is a record that describes itself wrongly, and the
 * renderer that trusts one of the two fields will pick the wrong one.
 *
 * The generic kind admits every allowed type, because that is what makes it
 * generic — it is the kind for an object with no media-specific presentation, not
 * a kind with a narrower vocabulary of its own.
 */
export const MEDIA_CONTENT_TYPE_POLICY: Readonly<
  Record<FileMediaKind, readonly AllowedContentType[]>
> = {
  audio_clip: ALLOWED_AUDIO_CONTENT_TYPES,
  video_clip: ALLOWED_VIDEO_CONTENT_TYPES,
  document: ALLOWED_DOCUMENT_CONTENT_TYPES,
  profile_photo: ALLOWED_IMAGE_CONTENT_TYPES,
  snippet: ALLOWED_DOCUMENT_CONTENT_TYPES,
  custom_emoji_image: ALLOWED_IMAGE_CONTENT_TYPES,
  generic: ALLOWED_CONTENT_TYPES,
};

/* ===========================================================================
 * The stored-file record
 * =========================================================================== */

/**
 * The functional type glyphs a file entry renders.
 *
 * The catalog names the value "type icon" [docs/workflows/README.md L331, frame
 * 488] and "a type glyph" [docs/workflows/02-channels.md L797, frames 81, 96,
 * 136]. What is stored is a **functional icon identifier** and never artwork:
 * `PROJECT_RULE_R4` forbids tracing, extracting or reconstructing third-party
 * icon artwork, and the identifiers below name what a thing *is* — the glyph
 * itself is original or open-licensed artwork living in `packages/ui/src/icons/`,
 * selected by this identifier.
 *
 * Naming by function is also the catalog's own discipline: "Iconography is named
 * by function throughout" [docs/workflows/03-messaging-and-composer.md L506]. So
 * the set describes categories of content rather than file formats, which is what
 * a glyph actually distinguishes — a person scanning a list is looking for a
 * document or a picture, not for a particular container format.
 *
 * The template badge the corpus renders "where applicable"
 * [docs/workflows/README.md L331, frame 488] is deliberately not folded in as a
 * glyph value. A badge is an additional marking on an entry that already has a
 * glyph, so making it an eighth glyph would make the two mutually exclusive and
 * lose whichever one lost. It belongs to the deferred files-and-media area that
 * owns the full model.
 */
export const FILE_TYPE_GLYPHS = [
  'document',
  'spreadsheet',
  'image',
  'audio',
  'video',
  'archive',
  'code',
  'generic',
] as const;

/** Which functional glyph a file entry renders. Never artwork; an identifier. */
export type FileTypeGlyph = (typeof FILE_TYPE_GLYPHS)[number];

/** Schema for a functional type glyph. */
export const fileTypeGlyphSchema = z.enum(FILE_TYPE_GLYPHS, {
  error: 'upload_type_glyph_invalid' satisfies UploadRejectionCode,
});

/**
 * A stored file, as every surface that names one renders it.
 *
 * ONE DEFINITION, MANY CONSUMERS. The shared-files card on a conversation, the
 * document preview card inside a message, the attachment tile in the composer and
 * the media player all render this same shape, and per `PROJECT_RULE_R5` it is
 * declared here exactly once so that neither `packages/ui` nor `apps/web` declares
 * a file shape of its own.
 *
 * The field set is what the catalog evidences those surfaces rendering:
 *   - [docs/workflows/README.md L331] — "type icon, name, sharer and shared date,
 *     grouped by viewed-today and viewed-yesterday" (frame 488); the document
 *     preview card (208); the pending attachment tile (165); the video clip (190);
 *     the audio clip (200); the shared-files card on the owning conversation (90);
 *     the upload-in-progress placeholder block (321).
 *   - [docs/workflows/02-channels.md L797] — "each with a type glyph, a name, an
 *     optional sharer and a date rendered relatively while recent and absolutely
 *     once older" (frames 81, 96, 136).
 *   - [docs/workflows/02-channels.md L818] — the same four values, "grouped by
 *     relative recency; full model in" the deferred files-and-media area.
 *
 * ---------------------------------------------------------------------------
 * THIS IS A PROJECTION, AND A PROJECTION IS A READ PATH
 * ---------------------------------------------------------------------------
 *
 * [docs/workflows/02-channels.md L954] states it directly: "membership does not
 * decide readability on its own, and every projection of a channel re-checks it …
 * the shared-files card lists files (frames 81, 96) … each is a projection and
 * each is computed over the viewer's authorized set". Per `PROJECT_RULE_R1` and
 * `S-AUTHZ-READ` [docs/workflows/00-product-overview.md L510], the authorization
 * predicate travels with the query, so unauthorized rows are never fetched, never
 * serialised and never sent; narrowing a returned page is not authorization; a
 * read path that cannot resolve the viewer's authorization returns nothing; and a
 * **count** of these records is itself a projection, computed over the authorized
 * set only. A file listing, a shared-files card, a per-type tab count, an
 * autocomplete suggestion and a notification mentioning a file are five distinct
 * read paths and each carries its own check.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS RECORD DELIBERATELY OMITS, AND WHY
 * ---------------------------------------------------------------------------
 *
 * NO BYTES, in any encoding, and no address of any kind. The object is reached
 * through `objectReference`, which is opaque and not fetchable; a client that
 * wants bytes asks for a fresh grant. A download link is an `S-SECRET` class-B
 * capability that must be revocable and "never rendered in full"
 * [docs/workflows/00-product-overview.md L546], and a durable address on a record
 * would be neither — it would survive revocation and it would be projected to
 * every reader of every listing.
 *
 * NO VIEWED-AT INSTANT. The grouping the shared-files card renders is driven by
 * per-viewer state: "Viewer–file state | viewer + file | viewed-at timestamp,
 * which drives the viewed-today and viewed-yesterday grouping"
 * [docs/workflows/README.md L361-L371]. Per `S-PERUSER` a value that could
 * legitimately differ between two viewers of the same object at the same moment
 * lives on a relation keyed by the pair. On the shared record it would mean one
 * person opening a file marked it opened for everyone, and it would disclose that
 * person's behaviour to every other member.
 *
 * NO RENDERED DATE STRING. [docs/workflows/02-channels.md L942] settles this from
 * the captures themselves: "Relative dates on the shared-files card are computed,
 * not stored strings. The same entry reads shared-today in one capture and
 * shared-yesterday in a later one, and absolute dates appear once the entry is
 * older" (frames 81, 96, 136). Storing the rendered form would make the record
 * wrong with the passage of time and would bake a locale into it.
 */
export const storedFileSchema = z
  .strictObject({
    /**
     * The opaque record identifier.
     *
     * The value `S-PII` requires be used wherever a record must be referenced
     * outside a response, in place of a personal value such as the filename
     * [docs/workflows/00-product-overview.md L558].
     */
    id: uploadIdSchema,

    /**
     * The reference to the stored object.
     *
     * Not an address and not redeemable. Resolving it to bytes is a separate
     * authorized act that mints a short-lived grant, which is what makes revocation
     * effective per `S-AUTHZ-READ`'s rule that a link is a projection at resolution
     * time [docs/workflows/00-product-overview.md L512].
     */
    objectReference: objectReferenceSchema,

    /**
     * The functional glyph the entry renders
     * [docs/workflows/02-channels.md L797, frames 81, 96, 136].
     *
     * Server-assigned from the **derived** type, never from the declared one and
     * never from the filename's extension — otherwise a caller could choose which
     * glyph a person sees and make an executable look like a document.
     */
    glyph: fileTypeGlyphSchema,

    /**
     * The name the entry renders.
     *
     * The declared filename after it passed `declaredFilenameSchema`, so it is free
     * of control characters, bidirectional formatting and path forms. It is still
     * **encoded per output context at render time** per `S-CONTENT`, because input
     * validation and output encoding are two halves of one contract and neither
     * substitutes for the other.
     *
     * It is personal data under `S-PII`: a name routinely identifies a person, a
     * client or a condition. It never reaches a log, an error report, an analytics
     * event, a cache key or an address in the clear.
     */
    name: declaredFilenameSchema,

    /**
     * Who shared it, or null where the surface renders no sharer.
     *
     * NULLABLE ON THE EVIDENCE, not defensively: the shared-files entry carries "an
     * **optional** sharer" [docs/workflows/02-channels.md L797, frames 81, 96, 136],
     * and the corpus shows an entry for the conversation itself alongside entries
     * shared by a named person (frame 96). A required field here would force a
     * consumer to invent a sharer for an entry that has none.
     *
     * The shape is the person summary from `./user.ts`, reused rather than restated
     * per `PROJECT_RULE_R5` — the same shape a message author line, a member row and
     * a facepile render, declared once. It deliberately carries no email address,
     * which matters here because one listing can carry a page of these.
     *
     * It is projected under `S-PII` field-level authorization: the person is read
     * against the reader's capability for that specific record, never merely because
     * the listing around it rendered.
     */
    sharer: personSummarySchema.nullable(),

    /**
     * When it was shared.
     *
     * AN ABSOLUTE INSTANT, and only the instant. The rendering rule — relatively
     * while recent, absolutely once older [docs/workflows/02-channels.md L797] — is
     * a UI concern computed at render time from this value and the current instant;
     * see the note above on why the rendered form is not stored.
     */
    sharedAt: absoluteInstantSchema,

    /**
     * The actual size of the stored object in bytes, as measured server-side.
     *
     * Distinct from the client's `declaredByteSize` by contract. This is what the
     * object *is*, measured after the transfer; that was what a caller *claimed*
     * before it. Bounded by the widest ceiling any purpose permits, because the
     * per-purpose ceiling was enforced at completion against this measurement.
     */
    byteSize: z
      .number({ error: 'upload_size_invalid' satisfies UploadRejectionCode })
      .int({ error: 'upload_size_invalid' satisfies UploadRejectionCode })
      .min(MIN_DECLARED_BYTES, { error: 'upload_size_invalid' satisfies UploadRejectionCode })
      .max(MAX_DECLARED_BYTES, { error: 'upload_size_exceeded' satisfies UploadRejectionCode }),

    /**
     * The content type the product chose, derived from the content.
     *
     * Never the type the uploader declared. `S-UPLOAD` requires a stored object to
     * be served under a type the product determined from the bytes, with content
     * sniffing disabled and a download disposition for non-previewable types
     * [docs/workflows/00-product-overview.md L518].
     */
    contentType: derivedContentTypeSchema,

    /**
     * Where the transfer has got to.
     *
     * Present on the record so one shape describes a file through its whole life:
     * the pending tile (frame 165), the in-progress placeholder block (frame 321),
     * the finished entry, and the failure the corpus never shows. A consumer
     * narrowing on this union cannot render a half-transferred object as a finished
     * one, which is the defect a nullable "ready" flag would permit.
     */
    transfer: uploadStateSchema,

    /**
     * What kind of thing it is, and what its renderer needs.
     *
     * The media-player contract in `packages/ui` narrows on this discriminator.
     */
    media: fileMediaSchema,
  })
  .refine((file) => file.byteSize <= MEDIA_BYTE_CEILINGS[file.media.media], {
    error: 'upload_size_exceeded' satisfies UploadRejectionCode,
  })
  .refine((file) => MEDIA_CONTENT_TYPE_POLICY[file.media.media].includes(file.contentType), {
    error: 'upload_type_not_allowed' satisfies UploadRejectionCode,
  });

/**
 * A stored file, as every surface that names one renders it.
 *
 * The two cross-field checks on the schema are what make the completion-time layer
 * part of the contract rather than a convention a service could forget. A record
 * asserting a two-hundred-megabyte audio clip, or a document served under a video
 * type, is not representable — so a projection cannot return one and a test cannot
 * accidentally construct one as a fixture.
 */
export type StoredFile = z.infer<typeof storedFileSchema>;

/**
 * A page of stored files, as a listing projection returns them.
 *
 * Read back as readonly so a consumer cannot mutate a returned collection in
 * place and believe it has stored something.
 *
 * PAGINATION IS NOT DECLARED HERE. A cursor envelope is owned by
 * `./pagination.ts`, which holds the keyset request and response shapes for the
 * whole product; a listing route composes that envelope around this collection.
 * Declaring a second envelope here would give one contract two definitions, and
 * an offset or a page index must never cross the API boundary in either.
 *
 * The collection is unbounded in the schema on purpose. What bounds a response is
 * the page size the pagination contract sets, and restating a ceiling here would
 * be a second limit that could disagree with it.
 */
export const storedFileListSchema = z.array(storedFileSchema).readonly();

/** A page of stored files from a listing projection. */
export type StoredFileList = z.infer<typeof storedFileListSchema>;
