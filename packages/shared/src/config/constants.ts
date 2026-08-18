/**
 * Compile-time invariants — values that are deliberately NOT overridable by the
 * environment.
 *
 * This module and its sibling `./env.ts` split the configuration surface in two,
 * and the split is the whole point. A value that a deployment may legitimately
 * tune — an expiry, a window, a quota — belongs in `./env.ts`, where it is
 * schema-validated and documented in the environment template. A value that is a
 * RULE rather than a setting belongs here, where no environment variable can
 * weaken it. `PROJECT_RULE_R3` forbids inlining either kind at a point of use, so
 * every consumer imports from one of these two modules and no validator carries a
 * literal of its own.
 *
 * Nothing in this module reads the environment, and nothing in it has a default in
 * the `./env.ts` sense: an invariant has a value, not a default.
 *
 * ---------------------------------------------------------------------------
 * SCOPE OF THIS FILE AS IT STANDS
 * ---------------------------------------------------------------------------
 *
 * The invariants below are the channel-name rule. Further invariants belong in
 * this module by design — among them the default channel visibility, the
 * snippet's required-field set, the password-hashing parameters and the realtime
 * replay-window bound — and are added here beside these rather than anywhere
 * else. This file is the single home for all of them; it is not a partial
 * substitute for one.
 *
 * ---------------------------------------------------------------------------
 * HOW THE PROJECT RULES ARE CITED, AND WHY NOT BY THEIR OWN IDENTIFIERS
 * ---------------------------------------------------------------------------
 *
 * Five binding project rules govern this work, cited here by requirement label:
 * `PROJECT_RULE_R1` (authorization is server-side only), `PROJECT_RULE_R2`
 * (corpus and specification handling), `PROJECT_RULE_R3` (uncertainty is never
 * permission to omit), `PROJECT_RULE_R4` (third-party identity exclusion) and
 * `PROJECT_RULE_R5` (a shared contract is implemented exactly once). Their own
 * identifiers are deliberately not written anywhere in this repository's source,
 * because each embeds the third-party product name that R4 forbids in source and
 * in comments. The labels are permuted relative to those identifiers, so the label
 * is the thing to trust; the authoritative wording lives in the rules interface.
 */

/**
 * The greatest number of characters a channel name may carry.
 *
 * `docs/workflows/02-channels.md` states the rule as helper copy on both dialogs
 * that edit a name — "lower case, without spaces or periods, and no longer than
 * eighty characters" — and corroborates it with a live remaining-character counter
 * that reads exactly eighty against an empty field (frames 97, 69).
 * `docs/workflows/README.md` carries the same observation on the channel entity,
 * "the counter observed at 80 characters on creation" (frame 69).
 *
 * This is an INVARIANT rather than a configurable default, and the distinction is
 * deliberate. The counter is not a setting a deployment may raise: the rule is
 * stated to the person composing the name, the counter is derived from it, and a
 * name already stored under it would be re-validated against any change. It
 * therefore lives in this module and never in `./env.ts`.
 *
 * Every consumer imports this constant. Nothing restates the number — not the
 * channel schema, not the setup wizard's derived-name rule, not a form validator
 * in the client.
 */
export const CHANNEL_NAME_MAX_LENGTH = 80;

/**
 * The characters a channel name may be composed of.
 *
 * Authored from the rule the catalogue states in prose — lower case, no spaces, no
 * periods — plus the one positive piece of evidence the corpus supplies about what
 * a name may contain: the setup wizard derives a workspace's first channel from a
 * free-text answer by lower-casing and HYPHENATING it
 * (`docs/workflows/01-onboarding-and-auth.md`, frame 16), so the hyphen is
 * evidenced as a permitted character rather than assumed.
 *
 * What the class admits, and why each part is here:
 *   - `\p{Ll}` lower-case letters, which is the rule's own requirement expressed
 *     positively. Stating it this way is what makes an upper-case letter
 *     unrepresentable rather than merely discouraged.
 *   - `\p{Lo}` letters without case distinction, so that a script which has no
 *     upper case — and therefore cannot violate a lower-case rule — is not
 *     excluded by a rule aimed at a different problem. Omitting this would make
 *     the product unusable for a large part of the world for no stated reason.
 *   - `\p{Mn}` and `\p{Mc}` combining marks, without which a correctly composed
 *     name in several scripts would be rejected for containing its own vowels.
 *   - `\p{Nd}` decimal digits.
 *   - the hyphen and the underscore, the two separators a handle conventionally
 *     carries. The hyphen is evidenced; the underscore is the smallest coherent
 *     addition consistent with it, and is admitted so that a separator a person
 *     types instead of a hyphen does not fail for a reason nothing explains.
 *
 * What it refuses follows from what it admits: the space, the period, every
 * upper-case letter, and every punctuation, symbol, control and bidirectional
 * formatting character. The space and the period are refused by construction
 * rather than by a separate check, which is why there is no second rule to keep in
 * step with this one.
 *
 * TWO PROPERTIES OF THIS VALUE ARE LOAD-BEARING FOR ITS CONSUMERS.
 *
 * It is ANCHORED, so `test` answers a question about a whole value and not about
 * whether a value contains an acceptable fragment. And the `+` quantifier rejects
 * the empty string, which is why a consumer needs no separate minimum-length
 * check.
 *
 * It carries NO `g` FLAG, deliberately. A global regular expression keeps a
 * mutable `lastIndex` between calls, so a shared one would give different answers
 * to the same question depending on what was asked before it. Every consumer here
 * calls `test` repeatedly against a shared instance, including character by
 * character, so statelessness is a correctness requirement rather than a style
 * preference. The class also admits single characters, which is what allows a
 * consumer deriving a name to ask this pattern whether a character is permitted
 * instead of re-authoring the class.
 */
export const CHANNEL_NAME_PATTERN = /^[\p{Ll}\p{Lo}\p{Mn}\p{Mc}\p{Nd}_-]+$/u;
