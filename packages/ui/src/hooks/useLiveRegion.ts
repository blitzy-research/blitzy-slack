/**
 * The workspace's single live-region announcement mechanism.
 *
 * WHY THIS EXISTS
 *
 * The catalog specifies no accessibility behaviour anywhere, so the mechanism
 * itself is authored rather than transcribed. What the catalog does supply is
 * the reason it is indispensable, and it supplies it twice.
 *
 * The transient-outcome report — the rounded pill that says an action completed
 * or failed — carries no control at all in its failure form: no undo, no
 * dismissal affordance, no button of any kind (frame 199). It also disappears on
 * its own: the pill is present in one capture and absent from the captures on
 * either side of it, with nothing on it that could have dismissed it (frames
 * 198, 199, 200). The cross-cutting state document tabulates four variants of
 * the same report and records the same finding independently (frames 219, 441,
 * 1014).
 *
 * A visual element that cannot be dismissed and clears itself is, for a reader
 * who never sees it, an outcome that never happened. Nothing about it is
 * reachable: there is no control to land on, so it is not in the tab order, and
 * by the time a reader might navigate to where it was, it is gone. A live region
 * is therefore not an enhancement layered over the pill — it is the only channel
 * through which a non-visual reader learns the result of the action they just
 * took. That is why this hook is a peer of the pill rather than an option on it.
 *
 * THE MARKER THIS DISCHARGES
 *
 * The cross-cutting state document carries a Partial-capture marker at line 479
 * of `docs/workflows/21-states.md`: no frame shows a transient report being
 * dismissed by the user, and none of the four observed variants carries a
 * dismissal affordance. A marker is an open work item, never permission to skip,
 * so the mechanism below is a deliberate implemented choice. Three judgements
 * were taken in making it and each belongs in `docs/decisions/gap-register.md`
 * with its options and rationale — fixed-per-instance politeness, the
 * clear-then-set reset, and auto-clearing. Each is also annotated at the point
 * it is implemented, so the code and the record cannot drift apart silently.
 *
 * A recorded inconsistency, preserved rather than reconciled: the variant table
 * at lines 306-313 of that document marks three of its four rows as carrying no
 * control at all, while the sentence at line 315 puts that number at two. Either
 * reading supports the same conclusion here — a self-clearing report with no
 * control exists and must be announced — so the contradiction is noted and left
 * standing rather than resolved in passing. Its home is
 * `docs/decisions/catalog-defects.md`.
 *
 * WHAT THIS HOOK IS NOT FOR
 *
 * Line 317 of the same document records a durable alternative that must not be
 * confused with the transient pill: a full-width flat bar docked at the very
 * foot of the content region, carrying a sentence and an undo link (frame 359).
 * That bar is ordinary content. It persists, it holds a real control, and a
 * reader can navigate to it and act on it like anything else on the page.
 * Announcing it would be redundant at best and, because a live region strips the
 * announcement of its control, actively misleading. Durable content is not this
 * hook's business.
 *
 * THE MOUNTING CONTRACT
 *
 * This is the part that fails silently when it is got wrong, so it is stated
 * plainly. The owner must render its region element unconditionally and
 * persistently — mounted on first paint, still mounted while the message is the
 * empty string, and never wrapped in a condition on the message being non-empty.
 * A region that is inserted into the document at the same moment as its text is
 * frequently not announced at all, because assistive technology registers a live
 * region when it appears and then watches it for changes; an element that
 * arrives already populated presents no change to observe. The correct shape is
 * therefore an always-present element whose text content changes: one element,
 * rendered on every pass, with `regionProps` spread onto it, `message` as its
 * only child, and the owner's own visually-hidden class applied — never wrapped
 * in a test for `message` being non-empty, and never mounted at the moment there
 * is something to say.
 *
 * Two further consequences of that contract are worth naming. The element must
 * stay in the accessibility tree, so it is hidden with a clip-and-offset class
 * and never with `display: none`, `visibility: hidden` or `hidden`. And the
 * hiding is the owner's job in its own CSS Module for a structural reason rather
 * than a stylistic one: this file may not import a stylesheet and may not read a
 * design token, so it cannot supply a style and does not try to.
 *
 * WHAT THIS HOOK DELIBERATELY DOES NOT DO
 *
 * It renders nothing. It creates, appends and mutates no DOM node, uses no
 * portal, imports no renderer, and returns props for its owner to spread. That
 * is the structural convention of this folder: a hook returns props; the owner
 * renders.
 *
 * It also carries no copy. Every announced string arrives from the caller, and
 * authored microcopy lives centrally in the shared copy module — so there is no
 * default message here, no placeholder and no example sentence. And it composes
 * nothing about authority: it accepts no role, permission, session, workspace or
 * actor identifier, performs no I/O, and so cannot consult or infer a permission
 * even in principle. A role-gated presentation reaches a component as a prop,
 * already decided on the server; this hook only ever repeats text it was given.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * How insistently a region interrupts what a reader is already being told.
 *
 * `polite` waits for a pause and is correct for every outcome report: the pill
 * this hook exists to voice is, by the catalog's own account, something a reader
 * may safely learn a moment late. `assertive` interrupts immediately and is
 * reserved for the cases where a moment late is too late.
 */
export type LiveRegionPoliteness = 'polite' | 'assertive';

/**
 * Per-instance configuration. Every field is optional and every default is a
 * named constant in this module.
 */
export type UseLiveRegionOptions = {
  /**
   * Fixed for the lifetime of the instance. See the note on the hook itself for
   * why this is not a per-call argument.
   */
  readonly politeness?: LiveRegionPoliteness;
  /**
   * Milliseconds between emptying the region and writing the new text. The gap
   * is what makes an identical consecutive message announce a second time.
   *
   * Zero is a legitimate value and still yields two separate renders — see the
   * note on the hook. A negative value, or a value that is not a number, is
   * clamped to zero by the platform's own timer and is left to behave that way
   * rather than being normalised here, so that an unintended value stays visible
   * as the zero-delay behaviour it is instead of being silently corrected.
   */
  readonly resetDelayMs?: number;
  /**
   * Milliseconds the text stays in the region before it is emptied again, or
   * `null` to leave it in place indefinitely.
   *
   * `null` disables auto-clearing outright and is the right choice for a test
   * asserting on the announced text, and for an owner that unmounts its region
   * as part of the same interaction. A value so small that the text is emptied
   * before assistive technology reads it is a caller's decision and is not
   * second-guessed; the module default is generous for that reason.
   */
  readonly clearAfterMs?: number | null;
};

/**
 * The attribute bag the owner spreads onto its region element.
 *
 * Every key is present unconditionally. That is partly a compiler requirement —
 * `exactOptionalPropertyTypes` is on, so an optional key here would let a caller
 * pass an explicit `undefined` and quietly ship a region with no live semantics
 * — and partly the point of returning a bag at all: the owner spreads it and is
 * done, with nothing left to remember.
 *
 * `aria-relevant` is deliberately absent. Its default value differs between
 * assistive technologies, the additions-and-text default that most of them apply
 * is already what is wanted, and `aria-atomic` covers the case this hook cares
 * about by forcing the region to be read whole. Setting it would add a value to
 * reason about without changing any behaviour. Its absence is a decision, not an
 * oversight.
 */
export type LiveRegionProps = {
  /**
   * Derived from `politeness`, never configured separately: `status` for polite,
   * `alert` for assertive. Both roles carry an implicit live semantic of their
   * own, so a mismatch between the role and the explicit `aria-live` value is
   * exactly the kind of contradiction that makes a region behave differently in
   * each screen reader. Deriving it makes the mismatch unrepresentable.
   */
  role: 'status' | 'alert';
  'aria-live': LiveRegionPoliteness;
  /**
   * Always `true`: an outcome report is one sentence and is meaningless in
   * fragments, so the region is read whole rather than as a diff against what it
   * held before.
   */
  'aria-atomic': true;
};

/** What the hook hands back. */
export type UseLiveRegionResult = {
  /**
   * The text to render inside the region element. The empty string is a normal,
   * expected value — it is what the region holds before the first announcement
   * and after an auto-clear — and it must still be rendered inside a mounted
   * element rather than used as a reason to unmount one.
   */
  readonly message: string;
  /** Announce `message`, superseding anything already in flight. */
  readonly announce: (message: string) => void;
  /** Empty the region now and abandon anything in flight. */
  readonly clear: () => void;
  /** Spread onto the region element. Stable for as long as politeness is. */
  readonly regionProps: LiveRegionProps;
};

/**
 * The gap between emptying the region and writing the new text.
 *
 * Sixteen milliseconds is one frame at sixty hertz — long enough to be two
 * separate mutations of the node rather than one, short enough that no reader
 * perceives a delay between acting and being told.
 *
 * The value is derived from no frame, and could not be: a still capture cannot
 * evidence timing. So it is a chosen default rather than an observed one, which
 * is precisely why it is not an environment-overridable setting — there is no
 * observed value for an operator to be reconciling against. The per-instance
 * option above is the extension point, and it is also what makes the hook
 * assertable: a test sets it to zero and drives the timer itself.
 */
const DEFAULT_RESET_DELAY_MS = 16;

/**
 * How long the text stays in the region before it is emptied.
 *
 * Five seconds is comfortably longer than any assistive technology needs to pick
 * up the change and read it, and short enough that the sentence is gone well
 * before the next one arrives. Emptying afterwards matters because a region is
 * read on mutation: a sentence left sitting there is a sentence liable to be
 * re-read the next time the region changes, and a stale outcome reported as a
 * fresh one is worse than no report.
 *
 * Derived from no frame, for the same reason as the reset delay above.
 */
const DEFAULT_CLEAR_AFTER_MS = 5_000;

/** The region's resting content. Named so that "empty" is never a bare literal. */
const EMPTY_MESSAGE = '';

/** Polite unless a caller says otherwise; see `LiveRegionPoliteness`. */
const DEFAULT_POLITENESS: LiveRegionPoliteness = 'polite';

/**
 * The role each politeness implies.
 *
 * A total mapping over the union rather than a conditional, so adding a third
 * politeness would fail to compile here instead of silently falling through to
 * one of the two existing roles. Indexing it with the union key is safe under
 * `noUncheckedIndexedAccess`: that flag widens index signatures, and these are
 * declared properties.
 */
const ROLE_FOR_POLITENESS: { readonly [P in LiveRegionPoliteness]: LiveRegionProps['role'] } = {
  polite: 'status',
  assertive: 'alert',
};

/**
 * What `window.setTimeout` hands back, taken from the signature actually being
 * called.
 *
 * `ReturnType<typeof setTimeout>` is the more familiar spelling and it does not
 * work here. This package compiles with the DOM library and the Node type
 * definitions both in scope, so `window` is typed `Window & typeof globalThis`
 * and `window.setTimeout` carries two signatures: the DOM one returning a
 * numeric handle and the Node one returning a timer object. Overload resolution
 * takes the first match, so the call yields a number, while `ReturnType` infers
 * from the last, so the alias would name the timer object — and the assignment
 * fails to compile. Naming the interface's own member resolves the two to the
 * same thing. Writing `number` instead would compile and would be worse: it
 * hardcodes one runtime's answer to a question the type system can answer
 * itself.
 */
type TimerHandle = ReturnType<Window['setTimeout']>;

/**
 * The handles for the two timers an announcement can have outstanding.
 *
 * Held together in one mutable record behind a single ref so that cancelling is
 * one operation that cannot half-succeed: a cleanup which cleared the reset but
 * not the auto-clear would leave a `setState` scheduled past unmount, which is
 * both a leak and — because the timer outlives the test that created it — a
 * test-order hazard.
 */
interface PendingTimers {
  reset: TimerHandle | null;
  autoClear: TimerHandle | null;
}

/**
 * Announce text to assistive technology through a live region the caller renders.
 *
 * The owner renders one element, spreads `regionProps` onto it, and renders
 * `message` as its text content. Read the mounting contract in this file's
 * header before wiring it up; it is short, and getting it wrong produces a
 * region that never announces anything while looking entirely correct.
 *
 * POLITENESS IS FIXED FOR THE LIFETIME OF THE INSTANCE
 *
 * There is no per-call politeness argument, and `aria-live` is never rewritten
 * on a node that is already mounted. Changing the politeness of a live node
 * mid-flight is unreliable across assistive technologies — some latch the value
 * when the region is registered and never re-read it, so the change is silently
 * ignored, and the announcement that follows arrives on the wrong channel or not
 * at all. A surface that needs both channels mounts two instances and routes to
 * the one it wants, which is exactly how the client's own live-region component
 * and its announce helper compose this hook. Recorded in
 * `docs/decisions/gap-register.md`.
 *
 * REPEATED IDENTICAL ANNOUNCEMENTS
 *
 * Writing the text a node already holds is not a mutation, so it produces no
 * announcement — which is how the same outcome reported twice in a row is heard
 * only once. Every announcement therefore empties the region first and writes the
 * text after a short delay, so the second report is as audible as the first.
 *
 * The delay is a real timer even when it is zero, and that is deliberate.
 * Emptying and rewriting in the same tick would be batched into a single render,
 * the node's text would go straight from the old sentence to the new one, and an
 * identical repeat would produce no text change at all — the exact failure the
 * reset exists to prevent. A zero delay still yields two renders in two ticks;
 * it only removes the wait, which is what makes the hook testable without
 * waiting on a clock.
 *
 * @param options - Per-instance overrides. Omit for a polite region with the
 * module's default timings.
 * @returns The text to render, the two commands, and the props to spread.
 */
export function useLiveRegion(options?: UseLiveRegionOptions): UseLiveRegionResult {
  const politeness: LiveRegionPoliteness = options?.politeness ?? DEFAULT_POLITENESS;
  const resetDelayMs: number = options?.resetDelayMs ?? DEFAULT_RESET_DELAY_MS;

  // Resolved with an explicit test for absence rather than with `??`, because
  // `null` is a meaningful value here — it disables auto-clearing — and `??`
  // would treat it as absence and substitute the default, turning "leave the
  // message in place" into "clear it after five seconds".
  const clearAfterOption = options?.clearAfterMs;
  const clearAfterMs: number | null =
    clearAfterOption === undefined ? DEFAULT_CLEAR_AFTER_MS : clearAfterOption;

  const [message, setMessage] = useState<string>(EMPTY_MESSAGE);

  // Timer handles live in a ref because they are neither rendered nor derived
  // from anything rendered, and because replacing one must not schedule a
  // render. The ref is read and written only inside the callbacks and the effect
  // below, never during render: a ref touched in the render path is impure, and
  // the hook lint rules reject it.
  const pending = useRef<PendingTimers>({ reset: null, autoClear: null });

  /**
   * Abandon both timers. Idempotent, and safe to call when nothing is pending.
   *
   * Handles are nulled as they are cleared so that a second call is a no-op
   * rather than a second `clearTimeout` on a spent handle.
   */
  const cancelPending = useCallback((): void => {
    const timers = pending.current;
    if (timers.reset !== null) {
      window.clearTimeout(timers.reset);
      timers.reset = null;
    }
    if (timers.autoClear !== null) {
      window.clearTimeout(timers.autoClear);
      timers.autoClear = null;
    }
  }, []);

  /**
   * Empty the region immediately and abandon anything in flight.
   *
   * Immediate rather than delayed: this is the caller saying the outcome is no
   * longer worth reporting — the surface it belonged to has closed, or the
   * action has been superseded — and a report that arrives after that is a
   * report about nothing.
   */
  const clear = useCallback((): void => {
    cancelPending();
    setMessage(EMPTY_MESSAGE);
  }, [cancelPending]);

  /**
   * Announce `next`, superseding any announcement already in flight.
   *
   * The sequence is: abandon both pending timers, empty the region, write the
   * text one reset delay later, and — unless auto-clearing is disabled — empty
   * it again after the auto-clear delay. Superseding cancels first, so a rapid
   * second call cannot leave the first call's timers to fire behind it and
   * overwrite the newer message with the older one.
   *
   * Announcing the empty string is permitted and is not special-cased: the
   * sequence runs and leaves the region empty, which announces nothing, because
   * a region with no text has nothing to read. Callers with nothing to say
   * should say nothing; callers wanting the region emptied now should use
   * `clear`.
   */
  const announce = useCallback(
    (next: string): void => {
      cancelPending();
      setMessage(EMPTY_MESSAGE);

      pending.current.reset = window.setTimeout(() => {
        pending.current.reset = null;
        setMessage(next);

        if (clearAfterMs !== null) {
          pending.current.autoClear = window.setTimeout(() => {
            pending.current.autoClear = null;
            setMessage(EMPTY_MESSAGE);
          }, clearAfterMs);
        }
      }, resetDelayMs);
    },
    [cancelPending, clearAfterMs, resetDelayMs],
  );

  // Unmount cleanup. `cancelPending` is stable, so this effect is set up once
  // and its cleanup runs on unmount only. Both timers are abandoned there, which
  // is what stops a scheduled `setMessage` from firing into a component that no
  // longer exists.
  useEffect(() => {
    return () => {
      cancelPending();
    };
  }, [cancelPending]);

  const regionProps = useMemo<LiveRegionProps>(
    () => ({
      role: ROLE_FOR_POLITENESS[politeness],
      'aria-live': politeness,
      'aria-atomic': true,
    }),
    [politeness],
  );

  return { message, announce, clear, regionProps };
}
