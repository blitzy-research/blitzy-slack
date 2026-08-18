/**
 * The prop contract for `C-COACH-MARK`, the anchored first-run coach mark.
 *
 * WHAT THIS CONTRACT COVERS
 *
 * One row of the read-only component inventory defines it
 * (`00-product-overview.md` L336): a floating card that "teaches one control at
 * a time during first run", "whose caret points at the control it describes,
 * with that control spotlit above a dimmed backdrop". Its single observed
 * variant is a card carrying an illustration header with a dismiss control, a
 * heading, body copy, a primary advance action, and a step counter reading N of
 * M at the footer's right. The cross-cutting state matrix restates that anatomy
 * independently under "First-run coaching" (`21-states.md` L153) and the two
 * readings agree, so there was nothing to reconcile between them.
 *
 * WHY THE SURFACE IS THIS WIDE, AND NOT WIDER
 *
 * Each contract in this library is implemented exactly once, so this one type
 * has to admit every arrangement the catalog evidences — otherwise a surface
 * that needs an unadmitted arrangement builds its own tip bubble, which is the
 * outcome the single-implementation project rule exists to prevent. Four
 * readings between them set the width:
 *
 *   - The tour's first captured step carries a *secondary* action beside the
 *     primary and describes no dismiss control at all
 *     (`01-onboarding-and-auth.md` L204). So the secondary action is optional
 *     and the dismiss control is per step rather than always drawn.
 *   - A later captured step puts a grid of colour swatches, one of them
 *     selected, beneath its copy (L205). So the body is a slot for arbitrary
 *     content and can never be a string.
 *   - The final captured step's header carries the dismiss control at its
 *     top-right, its caret points left at a spotlit rail control, and its
 *     primary action reads a finishing word rather than an advancing one
 *     (L206). That last difference is carried entirely by the label the caller
 *     supplies and by the step's position in the ordered list — never by a
 *     union of literal words, which would put authored wording in this file.
 *   - The same contract is anchored elsewhere with a *downward* caret beneath a
 *     message (`03-messaging-and-composer.md` L97) and against a composer that
 *     is *outlined* rather than cut out of a dimmed backdrop
 *     (`02-channels.md` L655). So neither the leftward caret nor the cut-out
 *     treatment may be privileged: placement and spotlight are both per step.
 *
 * Wider than that it must not go. The permission-request band and the
 * promotional banner appear in the very same capture as the first coach mark
 * (L204), and they are separate contracts with their own modules — the banner
 * being `C-BANNER` (`00-product-overview.md` L335). No member here describes a
 * banner slot or a permission band, because two contracts that merely co-occur
 * are still two contracts.
 *
 * WHY THE TOUR IS AN ORDERED LIST OF ANY LENGTH
 *
 * The corpus does not contain the second of the tour's four marks: the counters
 * jump from the first to the third with no intervening capture, "so the tour has
 * a step whose content is unknown; it is not invented here"
 * (`01-onboarding-and-auth.md` L211). Uncertainty about one step's content is
 * not licence to omit the mechanism, so `steps` is an ordered list of authored
 * steps of arbitrary length and the counter's total is simply how many there
 * are. Nothing in this file assumes a particular number of steps, and no numeric
 * literal appears in it at all — not a step count, not a duration, not a delay.
 *
 * A DEFECT IN THE SPECIFICATION, RECORDED RATHER THAN RESOLVED AWAY
 *
 * `01-onboarding-and-auth.md` L190 summarises the tour as having two of its four
 * marks captured. Its own step table contradicts that: three cards are described
 * — at L204, L205 and L206 — whose counters read the first, third and fourth of
 * four, and L211 names only the second as missing. The specific per-frame
 * readings govern over the summary sentence, and the contradiction is noted here
 * rather than smoothed over, per the specification-handling project rule. It
 * changes nothing in this contract: an arbitrary-length ordered list is correct
 * under either reading, which is precisely the point of typing the mechanism
 * instead of the observed step count. It is recorded here in full so it can be
 * lifted into `docs/decisions/catalog-defects.md` alongside the other recorded
 * contradictions by the agent that owns that record.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT OWN
 *
 *   - **Appearance.** No colour, radius, shadow, spacing, elevation or layer
 *     value, and no style-object member through which a caller could smuggle
 *     one. Dimming, the spotlight ring, the caret and the card's own surface all
 *     resolve to tokens in `CoachMark.module.css`. The positioning hook this
 *     module borrows its placement vocabulary from is equally strict: it returns
 *     geometry and nothing else.
 *   - **Copy.** Every string a user can read is authored elsewhere and arrives
 *     as data. Action labels are typed as `string`, the counter is typed as a
 *     *function* so that no concatenated literal can pass through in its place,
 *     and this file carries no default text of any kind. Wording has one home,
 *     so a correction or a translation can reach every occurrence of it.
 *   - **Persistence.** Dismissal is reported outward and nothing more; see
 *     `CoachMarkProps.onDismiss`.
 *   - **Focus trapping.** A focus-trap hook exists in this package and this
 *     contract deliberately does not use it: the card spotlights a control the
 *     user must still be able to reach, so trapping focus inside the card would
 *     defeat the thing it is teaching. That is why there is no initial-focus or
 *     trap-shaped member here, and why `returnFocusTo` stands on its own.
 *   - **Authorization.** A coach mark teaches; it never authorizes. There is no
 *     workspace identifier, actor identifier, role, capability, entitlement or
 *     "may-I" member here, and none may be added: what a client renders is never
 *     evidence of permission, which is decided on the server against the acting
 *     session and the specific target object. Nor may anything here be
 *     repurposed to explain that something is unavailable — the state matrix
 *     keeps permission-denied, role-gated, upgrade-gated and disabled as four
 *     distinct renderings and "a build that merges them cannot reproduce what the
 *     frames show" (`21-states.md` L111), and role gating in particular has its
 *     own evidenced presentation that hides nothing and disables nothing (L137).
 *
 * It holds types only — no runtime value, no constant, no default export — so
 * the compiled output is empty, importing it costs nothing at run time, and it
 * can never introduce a side effect.
 *
 * Every claim above cites the document and line it was read from. Frames are
 * cited by number alone, never by file name or path.
 */

import type { ReactNode, RefObject } from 'react';

import type {
  AnchoredAlign,
  AnchoredSide,
  AnchoredTarget,
} from '../../hooks/useAnchoredPosition.js';

/**
 * How the control a step describes is lifted out of its surroundings.
 *
 * Two treatments are evidenced and they are genuinely different compositions
 * rather than two intensities of one, so a step names which it uses instead of
 * the component guessing from the anchor.
 *
 * Source: `00-product-overview.md` L336 and `02-channels.md` L655.
 */
export type CoachMarkSpotlight =
  /**
   * The anchor is held at full contrast while the rest of the shell is dimmed
   * behind the card — the reading of the tour's final step, whose caret points
   * at a rail control "which is spotlit while the rest of the shell stays
   * dimmed" (`01-onboarding-and-auth.md` L206; frame 27).
   */
  | 'cutout'
  /**
   * The anchor is ringed in the interactive brand treatment with nothing cut out
   * of a backdrop: the coach mark attached to the composer leaves the composer
   * "outlined in the primary brand color, spotlighting it"
   * (`02-channels.md` L655). Which brand value that resolves to is a token
   * question and is settled in the stylesheet, never here.
   */
  | 'outline';

/**
 * Why the coaching stopped being shown.
 *
 * Each member names the *cause*, so the handler can tell a deliberate
 * abandonment from a completed tour without inspecting the interface that
 * produced it. Naming causes rather than affordances also keeps any third
 * party's vocabulary for those affordances out of this contract.
 *
 * The set is closed at three because three routes out are evidenced or required:
 * the header's dismiss control (`01-onboarding-and-auth.md` L206), the defer
 * action offered beside the primary on the first step (L204, L901), and the
 * keyboard — which is not a frame reading but a requirement, since every
 * overlay in this library must be dismissible without a pointer. It matters most
 * on a step that draws no dismiss control at all, where it is the only route
 * out other than finishing the tour.
 */
export type CoachMarkDismissReason =
  /** The dismiss control in the step's own illustration header was activated. */
  | 'dismiss-control'
  /** The keyboard dismissed the coaching while the card held focus. */
  | 'escape-key'
  /** The step's secondary action was taken, deferring the rest of the tour. */
  | 'skip-action';

/**
 * One activatable action in a step's footer.
 *
 * Both the primary advance action and the optional defer action beside it take
 * this shape (`00-product-overview.md` L336; `01-onboarding-and-auth.md` L204).
 *
 * The label is supplied by the caller from the authored copy in `@relay/shared`.
 * It is typed as an opaque `string` on purpose: this contract has no opinion on
 * what an advance action or a finishing action is called, and it holds no
 * default text, so no wording legible in any frame can reach the product through
 * this file. A literal written at a call site is a defect for the same reason —
 * user-facing wording has one home.
 */
export interface CoachMarkAction {
  /** The action's visible text, and its accessible name. */
  label: string;
  /**
   * Invoked when the action is activated, by pointer or by keyboard.
   *
   * Advancing is the caller's business: this contract is controlled, so the
   * handler for a primary action moves `activeStepId` on, and the handler on the
   * last step ends the tour. Named for what happens rather than for which
   * control happened, so one shape serves both footer positions.
   */
  onActivate: () => void;
}

/**
 * One step of a coached tour: what it teaches, what it points at, and how it
 * advances.
 *
 * Every optional member is written `?: T | undefined` rather than plain `?: T`.
 * The workspace compiles with `exactOptionalPropertyTypes`, under which a plain
 * optional member rejects an explicitly passed `undefined` — and a caller
 * assembling steps from data almost always has an optional value to forward
 * straight through. Admitting `undefined` here is what keeps assembling a step
 * from ordinary data unremarkable, and a contract that is unremarkable to use is
 * one nobody re-implements locally.
 *
 * Source: `00-product-overview.md` L336, with the per-step differences from
 * `01-onboarding-and-auth.md` L204, L205 and L206.
 */
export interface CoachMarkStep {
  /**
   * Stable identity for this step.
   *
   * Used to key the step in the ordered list and to select it through
   * `CoachMarkProps.activeStepId`. It is never rendered, so it carries no
   * wording and needs no translation.
   */
  id: string;

  /**
   * The card's heading, and the source of the accessible name announced for the
   * card as a region — so what assistive technology reports is the same thing a
   * sighted reader sees, rather than a second string that can drift from it.
   */
  heading: string;

  /**
   * The card's body.
   *
   * Arbitrary content, not a string: one captured step puts "a grid of twelve
   * colour swatches" with one of them selected beneath its copy
   * (`01-onboarding-and-auth.md` L205), so a step's body can be an interactive
   * composition rather than a sentence. A step whose body really is one sentence
   * simply passes that sentence.
   */
  body: ReactNode;

  /**
   * Artwork for the illustration header above the heading.
   *
   * Omit it for a step that has none. Every glyph and illustration in this
   * library is authored originally, so nothing traced, extracted or
   * reconstructed from reference imagery may be passed here.
   */
  illustration?: ReactNode | undefined;

  /**
   * Whether this step's illustration header draws a dismiss control at its
   * top-right.
   *
   * Per step, because the corpus differs by step: the final captured step's
   * header "now carries a dismiss control at its top-right"
   * (`01-onboarding-and-auth.md` L206), while the first captured step describes
   * none (L204) and offers a defer action in its footer instead.
   *
   * RECORDED CHOICE — the component treats an omitted value as *off*. The
   * contract row states the control as part of the variant's anatomy
   * (`00-product-overview.md` L336) while the flow shows it arriving only later
   * in the tour; the per-step readings are the more specific evidence, and off
   * is the smaller coherent default consistent with them. The alternative
   * considered was defaulting on, so that the anatomy row read literally on
   * every step; it was rejected because it would draw a control on the one step
   * the flow explicitly describes without one. Nothing is lost by defaulting
   * off: the coaching stays dismissible by keyboard on every step, and by the
   * defer action wherever one is supplied. Recorded here in full — marker,
   * options, choice, rationale — so it can be lifted into
   * `docs/decisions/gap-register.md` under the L204-versus-L336 marker
   * reference by the agent that owns that record.
   */
  showDismissControl?: boolean | undefined;

  /**
   * The step's advance action, at the footer's right beside the counter.
   *
   * Required, because every evidenced step has one
   * (`00-product-overview.md` L336). On the final step its label is a finishing
   * word rather than an advancing one (`01-onboarding-and-auth.md` L206, L901) —
   * which is the whole of how that state is expressed here. The distinction
   * lives in the label the caller passes and in the step's position in
   * `CoachMarkProps.steps`; it is deliberately not a union of literal words,
   * because those words are authored copy and this file holds none.
   */
  primaryAction: CoachMarkAction;

  /**
   * An optional action beside the primary one that leaves the tour.
   *
   * Evidenced on the tour's first step, whose footer carries a secondary action
   * beside the primary one and the counter (`01-onboarding-and-auth.md` L204),
   * and required of the first step by the acceptance criterion, which has the
   * tour "offer a skip action on its first step" (L901). Activating it reports a
   * dismissal with the skip-action cause.
   *
   * Its wording, like every other label here, is authored and arrives from the
   * caller; the wording the frame happens to show is not reproduced.
   */
  secondaryAction?: CoachMarkAction | undefined;

  /**
   * The control this step describes: what the caret points at and what the
   * spotlight lifts out.
   *
   * Expressed in the positioning hook's own vocabulary so that this contract and
   * every other floating surface in the library describe an anchor exactly one
   * way. An element covers the evidenced cases — a rail control
   * (`01-onboarding-and-auth.md` L206), a composer (`02-channels.md` L655), a
   * control beneath a message (`03-messaging-and-composer.md` L97) — and the
   * point and rect members are there because the vocabulary is shared, not
   * because this contract needs its own.
   */
  anchor: AnchoredTarget;

  /**
   * Which side of the anchor the card *prefers* to sit on.
   *
   * A preference, not an instruction: the hook flips to the opposite side when
   * the preferred one has no room, and re-points the caret to match. Omit it and
   * the hook applies its own default. No default is written here, and least of
   * all a leftward one — the leftward caret is one evidenced case
   * (`01-onboarding-and-auth.md` L206) and a downward caret is another
   * (`03-messaging-and-composer.md` L97), so privileging either in this contract
   * would misreport the evidence.
   */
  side?: AnchoredSide | undefined;

  /**
   * How the card lines up with the anchor along the side it was placed on.
   *
   * A preference in the same sense as `side`, and left to the hook's default
   * when omitted. Alignment survives a flip, which is why the two are separate
   * members rather than one fused token.
   */
  align?: AnchoredAlign | undefined;

  /**
   * Which spotlight treatment lifts this step's anchor out of its surroundings.
   *
   * Per step, because the two evidenced treatments belong to different surfaces
   * rather than to different moments of one tour. Omitted, the component applies
   * the treatment the first-run tour uses.
   */
  spotlight?: CoachMarkSpotlight | undefined;
}

/**
 * The coach mark's own props: a whole tour, which step of it is showing, and how
 * to report that it stopped.
 *
 * Controlled by design. This component holds no step index of its own, so the
 * tour's position lives with whatever also knows whether the tour has ever run —
 * and a tour can therefore be resumed, replayed or driven by a route without
 * this component learning anything about persistence.
 *
 * ORDERING INVARIANT, stated here rather than encoded in the type system.
 * `steps` is ordered: the counter's current position is the active step's index
 * within it, and "the final step" means the last member. `activeStepId` must be
 * the `id` of one of those members. That relationship is deliberately not
 * enforced with generics or template-literal types: doing so would make every
 * call site that assembles steps from data pay in inference for an invariant it
 * already satisfies, and would make this contract hard enough to read that
 * somebody writes their own. The component handles an id that matches no step by
 * rendering nothing at all, which is the safe outcome — no card, no dimming, and
 * a shell that stays fully usable.
 *
 * Every optional member is written `?: T | undefined`, for the reason given on
 * `CoachMarkStep`.
 */
export interface CoachMarkProps {
  /**
   * The whole tour, in order.
   *
   * Any length. The counter's total is how many steps there are, so a tour of a
   * different length needs no change here — which is what lets the mechanism
   * ship complete even though one step of the evidenced tour was never captured
   * (`01-onboarding-and-auth.md` L211).
   *
   * Read-only because this component never reorders, appends to or mutates the
   * tour it was given.
   */
  steps: readonly CoachMarkStep[];

  /**
   * The `id` of the step currently showing.
   *
   * See the ordering invariant above: an id matching no step renders nothing.
   */
  activeStepId: string;

  /**
   * Whether the coaching is showing at all.
   *
   * Separate from `activeStepId` so that closing the coaching does not destroy
   * the caller's knowledge of where in the tour it had reached. The component
   * shows the coaching when this is omitted; the default lives there, not here,
   * so there is one place it can be read.
   */
  open?: boolean | undefined;

  /**
   * Overrides how the step counter is worded.
   *
   * The counter reads "N of M at the footer's right"
   * (`00-product-overview.md` L336), and the component words it from the
   * step-of-total template in the authored copy in `@relay/shared`. This member
   * exists for a host that needs different wording for the same two numbers.
   *
   * It is a function, not a string, and that is the point: a template taking the
   * current position and the total cannot be satisfied by a concatenated literal
   * or by a pre-rendered phrase, so neither a caller nor a consumer can slip
   * wording past the one place wording is authored. It receives the position and
   * the total; it returns the sentence.
   */
  formatStepCounter?: ((current: number, total: number) => string) | undefined;

  /**
   * Overrides the accessible name of the illustration header's dismiss control.
   *
   * The control carries a glyph rather than text, so its name is the only thing
   * assistive technology has to announce it by. The component takes the default
   * from the authored accessibility copy in `@relay/shared`; this member is for a
   * host that needs a more specific one.
   */
  dismissLabel?: string | undefined;

  /**
   * Reports that the coaching stopped, and why.
   *
   * This is the **only** outward signal about persistence, and this component
   * persists nothing itself. Whether a viewer has dismissed first-run coaching
   * is per-viewer state, so it is recorded on the viewer's own preferences record
   * on the server — never on the object dismissed, and never in client storage.
   * The handler is what turns a dismissal into that write; the card only says
   * that it happened.
   *
   * The cause is passed through so a deliberate abandonment can be recorded
   * differently from a completed tour. Reaching the end of the tour is not a
   * dismissal and is reported through the last step's own primary action.
   */
  onDismiss: (reason: CoachMarkDismissReason) => void;

  /**
   * Where keyboard focus returns when the coaching closes.
   *
   * Needed only where the anchor is a point or a rect, because there is no
   * element to return focus to in those cases. Where the anchor is an element,
   * focus returns to it and this may be omitted. Losing focus to the top of the
   * document on close is exactly the kind of dead end a keyboard user cannot
   * recover from, which is why this exists at all.
   *
   * Written to admit a null current value so that an ordinary React ref
   * initialised to null can be forwarded without a cast.
   */
  returnFocusTo?: RefObject<HTMLElement | null> | undefined;

  /**
   * An additional class name for the card, from the host's own CSS Module.
   *
   * The single composition hook this contract offers, for giving the card
   * placement within a host's layout. There is deliberately no style-object
   * member: an inline style is how a colour, a radius or a spacing value gets
   * written at a call site instead of resolving to a token, and the token module
   * is the one place such a value may be written down.
   */
  className?: string | undefined;
}
