/**
 * Hover intent — decides *whether* a hover-revealed surface is showing.
 *
 * WHAT THIS HOOK IS FOR
 *
 * Two contracts in the shared library reveal something only while a pointer is
 * resting on the element that owns it, and both need the same decision made in
 * the same way:
 *
 *   - The hover action bar, specified in `docs/workflows/00-product-overview.md`
 *     at L325 as "a bar that appears at the hovered row's top-right while the
 *     pointer is on that row, and is absent from every other row".
 *   - The label bubble that names a control, specified in
 *     `docs/workflows/21-states.md` at L119 as appearing "immediately above the
 *     control naming what it does".
 *
 * This hook owns the *when*. Placement is owned elsewhere: the anchored
 * positioning hook decides *where* a floating surface sits, and each contract
 * module decides what its own form looks like.
 *
 * WHY THE ANCHOR AND THE SURFACE ARE ONE HOVER REGION
 *
 * The load-bearing fact is geometric. The hover action bar has two forms, and
 * L325 is explicit that "the control set and the placement are therefore per
 * form, not universal". In the message-row form the bar is "pinned to the
 * hovered row's top-right corner and overlapping the row's upper edge"
 * (frame 250). Overlapping the edge means the bar's box is partly *outside* the
 * row's box, so a pointer travelling from the row onto the bar leaves the row
 * before it arrives at the bar. An implementation that withdraws the surface the
 * moment the anchor is left would make the bar vanish exactly as the user
 * reaches for it, which is the same as not shipping it.
 *
 * The remedy is to treat the anchor and the surface as a single logical hover
 * region: two independently reported sources, one union, and a short withdrawal
 * window that bridges the gap between them. That is what the exit delay below
 * is for, and it is the reason it must not be zero.
 *
 * WHAT THIS HOOK DELIBERATELY DOES NOT DO
 *
 *   - It encodes NEITHER form's placement. The overlapping message-row form and
 *     the feed-entry form — which "replaces the entry's own relative-time slot
 *     in place rather than overlapping the row's edge" (frames 386, 395), the
 *     displaced timestamp returning on withdrawal (frame 388) — stay distinct in
 *     the contract module that renders them. There is no branch here that could
 *     collapse one into the other.
 *   - It renders no markup, imports no stylesheet, reads no design token and
 *     touches no layering. Its whole output is a boolean and four handlers.
 *   - It takes no part in deciding *what* the revealed surface contains. Which
 *     actions a viewer may take is settled on the server against the acting
 *     session and the specific target object; the permitted set reaches the
 *     component as data. Revealing a surface is not a permission decision, and
 *     nothing about a role, a session or a workspace passes through here.
 *
 * WHY EVERY TIMING VALUE HERE IS AUTHORED
 *
 * `docs/workflows/21-states.md` L477 records, as a partial-capture limitation,
 * that "no frame shows a hover treatment for the majority of the catalog's
 * components", that hover is claimed only for a message row, an activity entry,
 * a comparison-table row and one composer control, and that "a static capture
 * can only evidence hover where the pointer happened to rest". A still frame
 * cannot evidence a *duration* at all — not the delay before a surface appears,
 * not the grace period before it withdraws. Every number in this file is
 * therefore a deliberate authored choice rather than a reading, and the reasoning
 * for each is recorded against that marker in `docs/decisions/gap-register.md`:
 * the enter delay, the exit delay as an overlap bridge, treating the anchor and
 * the surface as one region, immediate activation on keyboard focus, and
 * suppression for touch pointers.
 *
 * Because the values derive from no frame, they are not workspace configuration
 * and have no place in the shared environment module. Each is a named module
 * constant with a documented default and a per-call override, which is the
 * correct extension point for a behaviour that varies by surface rather than by
 * deployment.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as React from 'react';

/**
 * How long a pointer must rest on the region before the surface appears.
 *
 * The delay exists so that a pointer sweeping down a list does not light up
 * every row it crosses on the way past. L325 records that the bar is "present on
 * exactly one row per capture, and that row is rendered with a tinted hover
 * highlight while the rows around it stay on the default surface" (frame 250) —
 * a trail of half-revealed bars behind a moving pointer is the failure this
 * guards against.
 *
 * Chosen at the short end of the useful range. Long enough that a deliberate
 * rest is distinguishable from a transit, short enough that a user who meant to
 * hover does not perceive a wait.
 */
const HOVER_INTENT_ENTER_DELAY_MS = 120;

/**
 * How long the surface stays after the region reports that it has been left.
 *
 * This is a bridge, not a linger. Its single job is to span the instant between
 * leaving one part of the region and arriving at another — the pointer crossing
 * from a row onto the bar overlapping that row's upper edge (frame 250), or
 * keyboard focus moving from the row into a control inside the bar. Both
 * transitions report a departure before they report an arrival, and without a
 * window in between the surface would be withdrawn in the gap.
 *
 * It is deliberately SHORTER than the enter delay, and that ordering is the
 * whole reason for the specific values. When a pointer moves from one row to the
 * next, the row being left withdraws at 80 ms while the row being entered
 * appears at 120 ms, so the two are never revealed at the same moment. A longer
 * window would let two adjacent rows look hovered at once, contradicting
 * "present on exactly one row per capture" directly.
 */
const HOVER_INTENT_EXIT_DELAY_MS = 80;

/**
 * The handler bag to spread onto one element of the hover region.
 *
 * Every key is always present, so the bag can be spread unconditionally and a
 * consumer never has to reason about a partially wired target.
 *
 * Bubbling `over`/`out` are exposed rather than `enter`/`leave` for two
 * concrete reasons. They bubble, so a pointer moving between children *inside* a
 * target is observable and can be recognised as internal traversal and ignored
 * — the non-bubbling pair reports nothing at all in that case, and a target that
 * contains any markup would otherwise churn. And they are the events a component
 * test can dispatch directly on the node, because React synthesises the
 * `enter`/`leave` pair from root-level `over`/`out` listeners: a
 * `pointerenter` dispatched straight at an element would never reach an
 * `onPointerEnter` handler, while `pointerOver` reliably reaches this one.
 */
export type HoverIntentTargetProps = {
  readonly onPointerOver: (event: React.PointerEvent<HTMLElement>) => void;
  readonly onPointerOut: (event: React.PointerEvent<HTMLElement>) => void;
  readonly onFocus: (event: React.FocusEvent<HTMLElement>) => void;
  readonly onBlur: (event: React.FocusEvent<HTMLElement>) => void;
};

/**
 * Per-call overrides. Every entry is optional and falls back to the documented
 * module default.
 */
export type UseHoverIntentOptions = {
  /**
   * Milliseconds a pointer must rest on the region before the surface appears.
   * Defaults to the module's enter delay. A surface that must appear instantly
   * may pass `0`, which is also how a test asserts without fake timers.
   */
  readonly enterDelayMs?: number;

  /**
   * Milliseconds the surface stays after the region reports it has been left.
   * Defaults to the module's exit delay. Keep it below the enter delay so that
   * two neighbouring regions can never be revealed at the same moment.
   */
  readonly exitDelayMs?: number;

  /**
   * Renders the hook inert: no handler acts, no window is scheduled, any
   * pending window is cancelled, and `isActive` is always `false`.
   *
   * This is what makes an illustrative rendering possible. L325 records the bar
   * "rendered inertly inside a settings live-preview card, where it illustrates
   * a configuration rather than responding to a pointer" (frames 554, 625). Such
   * a card shows the bar because it was told to, not because a pointer is
   * anywhere near it, so the intent machinery must be switchable off rather than
   * merely ignored.
   */
  readonly disabled?: boolean;

  /**
   * Called once on each actual transition of `isActive`, and never on a render
   * that did not change it. Not called on mount.
   */
  readonly onActiveChange?: (active: boolean) => void;
};

/** What the hook hands back to the contract module that consumes it. */
export type UseHoverIntentResult = {
  /** Whether the hover-revealed surface should be showing right now. */
  readonly isActive: boolean;

  /** Spread onto the element the surface belongs to — the row, or the control. */
  readonly anchorProps: HoverIntentTargetProps;

  /**
   * Spread onto the revealed surface itself. Required, not optional: in the
   * overlapping form the surface sits outside the anchor's box, so without these
   * handlers the pointer's arrival on the surface is invisible to the hook and
   * the surface withdraws from under the pointer.
   */
  readonly surfaceProps: HoverIntentTargetProps;

  /**
   * Withdraw immediately and reset the region to its resting state, cancelling
   * any pending window.
   *
   * For the consumer that has to force the surface away regardless of where the
   * pointer is — most commonly because a menu has just been opened from one of
   * the surface's own controls, and leaving the surface underneath it visible
   * would be wrong. Stable across renders, so it is safe in a dependency array.
   *
   * The region is left as if the pointer had never arrived, so the surface
   * returns on the next crossing of a target boundary rather than on the next
   * movement within one.
   */
  readonly cancel: () => void;
};

/**
 * The region's live state, held in a ref rather than in React state.
 *
 * None of it is rendered. Only the committed `active` flag is, and that is the
 * one thing this record does not hold. Keeping the sources out of React state
 * matters because this hook is attached to every row of a conversation: a
 * pointer crossing a child boundary must not be able to cause a render, and with
 * this record it cannot.
 *
 * `intent` is the value most recently acted upon — the direction the region is
 * already heading, whether it has arrived or is still inside a window. Comparing
 * against it is what stops a pending window from being restarted by a change that
 * does not alter the outcome.
 */
interface HoverRegionState {
  /** The anchor has been entered and not yet left. */
  anchorHovered: boolean;
  /** The revealed surface has been entered and not yet left. */
  surfaceHovered: boolean;
  /** Focus is somewhere inside the anchor or inside the surface. */
  focusWithin: boolean;
  /** The engagement the region is already heading towards, or resting at. */
  intent: boolean;
  /** A scheduled reveal, or `null` when none is pending. */
  enterHandle: ReturnType<typeof setTimeout> | null;
  /** A scheduled withdrawal, or `null` when none is pending. */
  exitHandle: ReturnType<typeof setTimeout> | null;
}

/** A region at rest: nothing entered, nothing focused, nothing scheduled. */
function createHoverRegionState(): HoverRegionState {
  return {
    anchorHovered: false,
    surfaceHovered: false,
    focusWithin: false,
    intent: false,
    enterHandle: null,
    exitHandle: null,
  };
}

/**
 * Cancel both windows and forget their handles.
 *
 * Always both. A reveal and a withdrawal are contradictory outcomes, so whenever
 * the region's engagement changes, neither of the previously scheduled outcomes
 * is still wanted. Clearing one and leaving the other is how a surface ends up
 * withdrawing a moment after it was asked to appear.
 */
function clearPendingWindows(state: HoverRegionState): void {
  if (state.enterHandle !== null) {
    clearTimeout(state.enterHandle);
    state.enterHandle = null;
  }
  if (state.exitHandle !== null) {
    clearTimeout(state.exitHandle);
    state.exitHandle = null;
  }
}

/** Cancel everything pending and return the region to its resting state. */
function resetHoverRegionState(state: HoverRegionState): void {
  clearPendingWindows(state);
  state.anchorHovered = false;
  state.surfaceHovered = false;
  state.focusWithin = false;
  state.intent = false;
}

/** Whether any source currently reports the region as engaged. */
function isEngaged(state: HoverRegionState): boolean {
  return state.anchorHovered || state.surfaceHovered || state.focusWithin;
}

/**
 * Narrow an event's related target to a DOM node, or to `null`.
 *
 * `relatedTarget` is an `EventTarget` and may be absent — the pointer came from
 * outside the document, or the previously focused element has gone away — and an
 * `EventTarget` is not necessarily a node. Both facts are narrowed here so that
 * no caller has to assert its way past the type system.
 *
 * The `typeof` guard keeps the module importable where there is no DOM at all,
 * which is what lets a contract module that uses this hook be rendered by a
 * server-side or non-browser test runner without throwing on import.
 */
function resolveNode(candidate: EventTarget | null): Node | null {
  if (typeof Node === 'undefined') return null;
  return candidate instanceof Node ? candidate : null;
}

/**
 * Whether an event describes movement that never left the target it is bound to.
 *
 * Bubbling `over`/`out` and `focusin`/`focusout` all fire for descendants, so a
 * pointer crossing from a row's avatar to that row's body, or focus moving
 * between two controls inside the bar, arrives here as a departure followed by an
 * arrival. Both are internal traversal and neither changes whether the region is
 * engaged, so recognising and ignoring them is what keeps a target containing
 * markup from churning.
 */
function staysWithinTarget(currentTarget: Node, related: EventTarget | null): boolean {
  const node = resolveNode(related);
  return node !== null && currentTarget.contains(node);
}

/**
 * Hover intent for a surface revealed by resting on the element that owns it.
 *
 * Wire `anchorProps` to the element the surface belongs to and `surfaceProps` to
 * the surface, then render the surface while `isActive` is true. The two targets
 * behave as a single hover region even when their boxes do not touch.
 *
 * Keyboard parity is part of the contract, not a nicety. Focus arriving anywhere
 * inside either target reveals the surface immediately, with no delay, and the
 * surface will not withdraw while focus remains inside it however the pointer
 * moves. A surface reachable only by pointer is a set of actions a keyboard user
 * cannot get to at all.
 */
export function useHoverIntent(options?: UseHoverIntentOptions): UseHoverIntentResult {
  // Defaulting reads, never an assigned `undefined`: the options type is exact,
  // so an explicitly-undefined property is not the same as an absent one.
  const enterDelayMs = options?.enterDelayMs ?? HOVER_INTENT_ENTER_DELAY_MS;
  const exitDelayMs = options?.exitDelayMs ?? HOVER_INTENT_EXIT_DELAY_MS;
  const disabled = options?.disabled ?? false;
  const onActiveChange = options?.onActiveChange;

  const [active, setActive] = useState(false);

  // Adjusting state during render, guarded by the previous value — the pattern
  // React documents for resetting state when a prop changes, and the only one
  // available: calling a setter from an effect is a cascading render and is
  // rejected outright by the hook-correctness rules this package is linted with.
  //
  // It runs on BOTH directions of the transition on purpose. Going inert must
  // withdraw whatever was showing; coming back must not restore it, because
  // while inert the region heard neither the pointer's departure nor its
  // arrival and therefore knows nothing true about where it is.
  const [inertAsRendered, setInertAsRendered] = useState(disabled);
  if (inertAsRendered !== disabled) {
    setInertAsRendered(disabled);
    setActive(false);
  }

  // Constructed eagerly rather than lazily, and deliberately so. The usual
  // lazy-initialisation idiom fills the ref on first use, which means reading
  // `.current` during render — forbidden here, because a value read during render
  // is a value React cannot know changed. The cost of the alternative is one
  // small object allocated and dropped per render; the benefit is a ref that is
  // never null, so no call site below needs a null check.
  const regionRef = useRef<HoverRegionState>(createHoverRegionState());

  // A pending window must outlive neither the component nor the configuration it
  // was scheduled under. Keyed on `disabled` so that going inert cancels the
  // scheduled outcome and clears the sources, and returning from inert starts
  // from rest; the same cleanup is what runs on unmount, so no handle survives
  // the component that created it.
  useEffect(() => {
    const state = regionRef.current;
    return () => {
      resetHoverRegionState(state);
    };
  }, [disabled]);

  /**
   * Bring the region to its engaged state at once, with no reveal delay.
   *
   * The keyboard path. Any pending window is dropped first, because a scheduled
   * withdrawal from focus leaving one target must not fire after focus has
   * arrived in the other — that hand-off is the second thing the exit window
   * bridges.
   */
  const engageImmediately = useCallback((state: HoverRegionState) => {
    clearPendingWindows(state);
    state.intent = true;
    setActive(true);
  }, []);

  /**
   * Re-read every source and, if the engagement has changed, schedule the
   * matching outcome behind its delay.
   *
   * The early return is doing real work. When the engagement is unchanged, a
   * pending window is already heading to the right place and restarting it would
   * reset a clock the user has already been waiting on; and when nothing is
   * pending, the region is already where it should be. It is also what makes the
   * overlap survivable: a pointer leaving the anchor with the surface already
   * entered leaves the union true, so nothing is scheduled and nothing withdraws.
   */
  const reconcileWithDelay = useCallback(
    (state: HoverRegionState) => {
      const engaged = isEngaged(state);
      if (engaged === state.intent) return;

      clearPendingWindows(state);
      state.intent = engaged;

      if (engaged) {
        state.enterHandle = setTimeout(() => {
          regionRef.current.enterHandle = null;
          setActive(true);
        }, enterDelayMs);
        return;
      }

      state.exitHandle = setTimeout(() => {
        regionRef.current.exitHandle = null;
        setActive(false);
      }, exitDelayMs);
    },
    [enterDelayMs, exitDelayMs],
  );

  const handleAnchorPointerOver = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      // Hover has no meaning for a touch pointer: the contact both arrives and
      // departs at the same place, and there is no resting state in between, so
      // a surface revealed this way has nothing to withdraw it. A surface that
      // never appears is a smaller failure than one stuck open over the content
      // a finger is trying to reach.
      if (event.pointerType === 'touch') return;
      if (staysWithinTarget(event.currentTarget, event.relatedTarget)) return;

      const state = regionRef.current;
      state.anchorHovered = true;
      reconcileWithDelay(state);
    },
    [disabled, reconcileWithDelay],
  );

  const handleAnchorPointerOut = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      // No pointer-type guard on the withdrawal path, deliberately. Suppression
      // belongs to revealing only; anything that can clear a stuck surface is
      // always allowed to run.
      if (staysWithinTarget(event.currentTarget, event.relatedTarget)) return;

      const state = regionRef.current;
      state.anchorHovered = false;
      reconcileWithDelay(state);
    },
    [disabled, reconcileWithDelay],
  );

  const handleSurfacePointerOver = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      if (event.pointerType === 'touch') return;
      if (staysWithinTarget(event.currentTarget, event.relatedTarget)) return;

      const state = regionRef.current;
      state.surfaceHovered = true;
      // This is the arrival the anchor's departure scheduled a withdrawal for.
      // Reconciling here finds the union true again and cancels that withdrawal,
      // which is how the surface survives being reached across the edge it
      // overlaps (frame 250).
      reconcileWithDelay(state);
    },
    [disabled, reconcileWithDelay],
  );

  const handleSurfacePointerOut = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (disabled) return;
      if (staysWithinTarget(event.currentTarget, event.relatedTarget)) return;

      const state = regionRef.current;
      state.surfaceHovered = false;
      reconcileWithDelay(state);
    },
    [disabled, reconcileWithDelay],
  );

  // Shared by both targets: focus is a single point in the document, so one flag
  // describes it whether the anchor or the surface reports it, and whether the
  // two are siblings or nested.
  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (disabled) return;
      if (staysWithinTarget(event.currentTarget, event.relatedTarget)) return;

      const state = regionRef.current;
      state.focusWithin = true;
      engageImmediately(state);
    },
    [disabled, engageImmediately],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (disabled) return;
      if (staysWithinTarget(event.currentTarget, event.relatedTarget)) return;

      const state = regionRef.current;
      state.focusWithin = false;
      // Through the ordinary window rather than immediately, so that focus
      // crossing from the anchor into the surface — which reports the departure
      // before the arrival, exactly as the pointer does — does not flicker.
      reconcileWithDelay(state);
    },
    [disabled, reconcileWithDelay],
  );

  const cancel = useCallback(() => {
    resetHoverRegionState(regionRef.current);
    setActive(false);
  }, []);

  const anchorProps = useMemo<HoverIntentTargetProps>(
    () => ({
      onPointerOver: handleAnchorPointerOver,
      onPointerOut: handleAnchorPointerOut,
      onFocus: handleFocus,
      onBlur: handleBlur,
    }),
    [handleAnchorPointerOver, handleAnchorPointerOut, handleFocus, handleBlur],
  );

  const surfaceProps = useMemo<HoverIntentTargetProps>(
    () => ({
      onPointerOver: handleSurfacePointerOver,
      onPointerOut: handleSurfacePointerOut,
      onFocus: handleFocus,
      onBlur: handleBlur,
    }),
    [handleSurfacePointerOver, handleSurfacePointerOut, handleFocus, handleBlur],
  );

  // Derived rather than merely reset, so that "inert implies never revealed"
  // holds in the very render the option changes and does not depend on a state
  // update having landed first.
  const isActive = disabled ? false : active;

  // Reported on the transition alone, and never on mount. `isActive` is the
  // published value rather than the raw state, so a consumer counting
  // transitions sees exactly what it rendered. The comparison also absorbs a
  // caller that passes a fresh closure on every render: the effect re-runs,
  // finds nothing changed, and reports nothing.
  const lastReportedRef = useRef(false);

  useEffect(() => {
    if (lastReportedRef.current === isActive) return;
    lastReportedRef.current = isActive;
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  return useMemo(
    () => ({ isActive, anchorProps, surfaceProps, cancel }),
    [isActive, anchorProps, surfaceProps, cancel],
  );
}
