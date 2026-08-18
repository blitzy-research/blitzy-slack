/**
 * Anchored positioning for every floating surface in the component library.
 *
 * WHY THIS IS ONE HOOK AND NOT SEVEN
 *
 * The catalog defines several floating surfaces and is emphatic that what they
 * anchor to is the thing that tells them apart, not how they are built. The
 * dropdown menu is "anchored to the control that opened it"; the context menu is
 * "anchored to that object's own row or header rather than to a persistent
 * control"; the typeahead panel is "anchored to the caret rather than to a
 * control ... which is precisely what distinguishes it from both menu
 * components". The catalog says so directly when it rules out the obvious wrong
 * discriminator: a nested submenu is not what separates the two menus, because
 * the account-menu variant of the dropdown carries one (frame 504) — "the two
 * are told apart by what they anchor to".
 *
 * That sentence is the whole design of this file. The anchor is a parameter, and
 * it is a discriminated union with one member per anchoring contract, so the
 * three stay visibly distinct at every call site. Nothing here branches on which
 * component is calling: a caller supplies an anchor, a side, an alignment and a
 * mode, and gets geometry back. There is deliberately no component name, no
 * variant name and no caller identity anywhere in this module.
 *
 * The surfaces served, and the contract clause each one needs:
 *   - the dropdown menu, anchored to its opening control, which must be able to
 *     open upward when there is no room below it (frame 504)
 *   - its sideways submenu, whose anchor is the parent row (frames 514, 517)
 *   - the context menu, anchored to an object's own row or header in its
 *     overflow form and to a pointer coordinate in its right-click form
 *     (frames 113, 114, 118, 124, 567)
 *   - the typeahead panel, anchored to the caret — which is neither an element
 *     nor a point but a client rect read off a selection range
 *     (frames 169, 172, 203, 204, 343, 551)
 *   - the coach mark, "a floating card whose caret points at the control it
 *     describes", in the variant anchored to a rail control with a leftward
 *     caret (frame 27)
 *   - the details pane, in both its docked form and its centred modal form
 *     (frames 90, 338, 450, 705)
 *   - the date-picker popover, which "opens over the form from the field it
 *     belongs to" (frames 53, 54, 528)
 *   - the emoji picker, "a floating panel opened from the control that will
 *     receive the choice" (frames 35, 211, 215)
 *   - the hover label bubble, which "appears immediately above the control
 *     naming what it does" (frame 198)
 *
 * WHAT THIS HOOK REPORTS RATHER THAN DECIDES
 *
 * Two contracts record clipping as an expected state, not as a fault: the
 * details pane has its "body clipped by the viewport foot when the content is
 * taller than the pane", and the emoji picker has "a category grid clipped by
 * the panel's own height". A hook that capped a height, injected a scrollbar or
 * quietly shrank a surface would take that decision away from the contract that
 * owns it. So this hook measures the room available in the resolved direction
 * and returns it, and each surface decides for itself whether to scroll, clip or
 * do nothing.
 *
 * The same restraint applies to visibility. `isPositioned` is false until the
 * first measurement lands, and the owner uses it to keep the surface hidden for
 * that one frame through its own stylesheet. This module emits no opacity, no
 * visibility and no transition, because those are styling and styling belongs to
 * the contract module.
 *
 * WHERE THE EVIDENCE RUNS OUT — a recorded choice, not an omission
 *
 * Anchoring itself is evidenced, and so is a cross-axis flip: the account menu
 * opens upward from the rail's foot (frame 504) because there is no room below
 * it. What is evidenced nowhere is the algorithm, the gap between an anchor and
 * its surface, and the inset kept from the container edge. No frame states any
 * of the three, and no marker covers them, so the smallest coherent behaviour
 * consistent with the adjacent evidenced behaviour is implemented and the
 * reasoning is recorded here:
 *
 *   1. Ordering: flip on the cross axis, then shift on the main axis, then
 *      re-point the caret. Considered and rejected: shifting first, which lets a
 *      surface slide along an edge it should have flipped away from; iterating
 *      the two to convergence, which is unbounded work and makes a component
 *      test non-deterministic. Chosen because one flip plus one clamp is the
 *      least machinery that produces the evidenced upward-opening menu, and
 *      because it always terminates.
 *   2. The flip is attempted once and is accepted only if the opposite side
 *      actually fits. Considered and rejected: flipping unconditionally, which
 *      trades one overflow for another and can oscillate between renders.
 *      Chosen so that a surface too large for either side stays on the side its
 *      caller asked for and is reported as short of room — which is exactly the
 *      clipped state both contracts above already document.
 *   3. The anchor-to-surface gap defaults to a small fixed inset rather than
 *      zero, because the contract says a menu opens "adjacent to" its control
 *      rather than over it, and rather than something larger, because nothing
 *      evidences a wide separation.
 *   4. The container inset defaults to the same value, for the same reason and
 *      so that a surface never sits flush against an edge it was pushed toward.
 *
 * These two defaults are compile-time geometry, not configuration derived from
 * a frame reading, so neither belongs in the shared environment module: there is
 * no timer, expiry, window, threshold or limit here for an operator to tune.
 * They are named constants so that no bare number is written at a point of use,
 * and both are overridable per call through options.
 *
 * WHAT THIS HOOK DOES NOT OWN
 *
 * No markup, no portal, no stylesheet, no token read — geometric design values
 * are measured by the frame-measurement tool and land in the token module, and a
 * caller passes a resolved pixel size in rather than this module reaching for
 * one. No focus management, which belongs to the focus-trap hook. No open or
 * closed state, which belongs to the component. No dismissal handling.
 *
 * And nothing about permission. Geometry carries no authorization meaning: this
 * module accepts, returns and branches on no role, capability, session or
 * identifier of any kind, and it never suppresses or relocates a surface on a
 * permission basis. A role-gated presentation arrives already decided by the
 * server and is rendered as whatever the component chose; positioning it is all
 * that happens here.
 *
 * Frames are cited by number throughout, never by file name or path.
 */
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import type { CSSProperties, RefCallback } from 'react';

/**
 * Separation between an anchor and the surface placed against it, in pixels.
 *
 * The dropdown menu contract says a menu opens "adjacent to" the control that
 * opened it, which rules out zero — a surface flush against its control reads as
 * part of it. Nothing evidences how wide the separation is, so this is the
 * smallest inset that still reads as a separate surface. Overridable per call
 * through `offsetPx`.
 */
const ANCHOR_SURFACE_GAP_PX = 8;

/**
 * Inset kept between the surface and the container's own edges, in pixels.
 *
 * Applies to the flip test and to the main-axis clamp, so a surface pushed
 * toward an edge stops short of it instead of sitting flush against it. Chosen
 * to match the anchor gap so that one visual rhythm governs both separations.
 * Overridable per call through `viewportPaddingPx`.
 */
const CONTAINER_EDGE_PADDING_PX = 8;

/**
 * Side a surface takes when its caller names none.
 *
 * Below the anchor: the dominant evidenced arrangement, and the one the dropdown
 * menu, the date-picker popover and the emoji picker all take when there is room
 * for it.
 */
const DEFAULT_SIDE: AnchoredSide = 'bottom';

/**
 * Alignment a surface takes when its caller names none.
 *
 * Leading edges together, which is how a menu lines up with the control that
 * opened it.
 */
const DEFAULT_ALIGN: AnchoredAlign = 'start';

/**
 * What a surface is positioned against.
 *
 * Three members, one per anchoring contract, and they stay three on purpose. A
 * client rect is mathematically sufficient for all of them — a point is a rect
 * of no size, an element has a rect — but collapsing them into one input would
 * erase the distinction the catalog draws between the three contracts and leave
 * every call site restating in a comment what the type should have said. Keeping
 * them separate is what stops the contracts being merged.
 */
export type AnchoredTarget =
  /**
   * An element: the dropdown menu's opening control, the submenu's parent row,
   * the context menu's overflow control, the popover's field, the picker's
   * control, the coach mark's rail control, the hover bubble's control. `null`
   * is accepted so a caller may render before its anchor mounts; the surface
   * simply stays unpositioned until it does.
   */
  | { readonly kind: 'element'; readonly element: HTMLElement | null }
  /**
   * A viewport coordinate: the context menu's right-click form, where the
   * anchor is where the pointer was rather than anything on the page.
   */
  | { readonly kind: 'point'; readonly x: number; readonly y: number }
  /**
   * A client rect: the typeahead panel's caret, read off a selection range, and
   * any other surface anchored to a selection rather than to a node.
   */
  | { readonly kind: 'rect'; readonly rect: DOMRectReadOnly };

/**
 * Which side of the anchor the surface is placed on.
 *
 * Held separately from alignment rather than fused into one `'bottom-start'`
 * token, because flipping changes the side and leaves the alignment alone. Two
 * independent fields keep that asymmetry readable; one fused string would hide
 * it behind parsing.
 */
export type AnchoredSide = 'top' | 'bottom' | 'left' | 'right';

/** How the surface lines up with the anchor along the side it was placed on. */
export type AnchoredAlign = 'start' | 'center' | 'end';

/**
 * How the surface relates to its container.
 *
 * `anchored` places it against the anchor. `docked` is the details pane's docked
 * form, which "takes roughly the right three-tenths of the viewport width from
 * the content region". `centred` is the same contract's modal form, "centred and
 * dims its backdrop" — the dimming being the component's, not this module's.
 */
export type AnchoredMode = 'anchored' | 'docked' | 'centred';

/**
 * Where the caret sits, in pixels from the surface's own top-left corner.
 *
 * The coach mark is "a floating card whose caret points at the control it
 * describes", so the offset is recomputed after the surface has been clamped and
 * keeps pointing at the anchor's centre wherever the surface ended up
 * (frame 27).
 */
export type AnchoredArrowOffset = { readonly left: number; readonly top: number };

/**
 * Room between the anchor and the container edge in the resolved direction.
 *
 * Reported, never enforced. The surfaces that can outgrow their room already
 * document being clipped as an expected state, so each decides what to do with
 * this rather than having a decision imposed here.
 */
export type AnchoredAvailableSpace = { readonly width: number; readonly height: number };

/**
 * Everything a caller may say about where a surface goes.
 *
 * Every optional member is written `?: T | undefined` rather than plain `?: T`.
 * The workspace compiles with `exactOptionalPropertyTypes`, under which a plain
 * optional member rejects an explicitly passed `undefined` — and a consumer
 * component almost always forwards its own optional prop straight through
 * (`side={props.side}`). Without the explicit `undefined` every one of those
 * call sites would need a workaround, and a hook awkward enough to work around
 * is a hook somebody re-implements locally. Admitting `undefined` here is what
 * keeps this the only positioning implementation in the repository.
 */
export type UseAnchoredPositionOptions = {
  /** What the surface is positioned against. The only required member. */
  readonly anchor: AnchoredTarget;
  /**
   * Whether to position at all. Defaults to `true`. While `false` — the closed
   * state — nothing is measured, no listener is registered and `isPositioned`
   * stays `false`.
   */
  readonly enabled?: boolean | undefined;
  /** Defaults to `'anchored'`. */
  readonly mode?: AnchoredMode | undefined;
  /** Preferred side. Defaults to `'bottom'`. A flip may resolve it elsewhere. */
  readonly side?: AnchoredSide | undefined;
  /** Alignment along the chosen side. Defaults to `'start'`. Never flipped. */
  readonly align?: AnchoredAlign | undefined;
  /** Anchor-to-surface separation. Defaults to the module's gap constant. */
  readonly offsetPx?: number | undefined;
  /** Inset kept from the container's edges. Defaults to the module's padding constant. */
  readonly viewportPaddingPx?: number | undefined;
  /**
   * The box the surface is kept inside. Defaults to the viewport when absent or
   * `null`.
   *
   * This exists because a docked pane "takes roughly the right three-tenths of
   * the width from the content region, leaving rail and sidebar untouched"
   * (frames 338, 705) — so the box that governs it is the content region, not
   * the raw viewport. It doubles as the seam a component test positions
   * against: supplying a known rect is how a test fixes the viewport without
   * having to stub `window`.
   */
  readonly container?: DOMRectReadOnly | null | undefined;
  /**
   * Cross-axis size of a docked surface, in pixels, already resolved by the
   * caller.
   *
   * The three-tenths fraction is never computed here. A geometric design value
   * belongs to the token module, this module may not read tokens, and a hook
   * that invented its own width would be a second source for a value the design
   * system already owns. When absent the surface fills its container, which is a
   * geometric identity rather than a design choice.
   */
  readonly dockedSizePx?: number | undefined;
  /** Whether a cross-axis flip may be attempted. Defaults to `true`. */
  readonly flip?: boolean | undefined;
  /** Whether a main-axis clamp is applied. Defaults to `true`. */
  readonly shift?: boolean | undefined;
};

/**
 * Geometry for one floating surface.
 *
 * `side`, `align`, `arrow` and `available` are returned rather than kept in a
 * closure so that a component test can assert on the flip, the alignment, the
 * caret and the reported room directly, without reaching into styles.
 */
export type UseAnchoredPositionResult = {
  /** Attach to the surface element. Stable across renders. */
  readonly surfaceRef: RefCallback<HTMLElement>;
  /**
   * Computed geometry only: a fixed positioning strategy, the resolved
   * coordinates, and a size in the one mode that determines one. It carries no
   * colour, radius, shadow, spacing, font — and no layer. Layering is a token
   * applied by the surface's own stylesheet, because a layer number written here
   * would be a design value escaping the token module.
   */
  readonly surfaceStyle: CSSProperties;
  /** The side actually used, which differs from the requested side after a flip. */
  readonly side: AnchoredSide;
  /** The alignment actually used. Alignment is never flipped. */
  readonly align: AnchoredAlign;
  /**
   * Caret offset from the surface's top-left, or `null` when a caret cannot
   * point anywhere meaningful: in a docked or centred surface, which has no
   * anchor to point at, and where clamping has carried the surface far enough
   * that the anchor's centre falls outside its span.
   */
  readonly arrow: AnchoredArrowOffset | null;
  /** Room in the resolved direction. Zero until the first measurement lands. */
  readonly available: AnchoredAvailableSpace;
  /** `false` until the first measurement completes, and while disabled. */
  readonly isPositioned: boolean;
  /**
   * Recompute now. For a surface whose content changed size in a way no
   * observer caught — a menu swapping its rows, a panel filtering its list.
   * Stable across renders.
   */
  readonly update: () => void;
};

/**
 * One rect shape for everything downstream of anchor normalisation.
 *
 * A plain object rather than a `DOMRect`: constructing one would mean reaching
 * for a constructor that the workspace's browser-global list deliberately does
 * not carry, and a plain readonly shape is both cheaper and impossible to mutate
 * by accident. Trailing edges are derived where needed rather than stored, so
 * there is no way for `left` and `right` to disagree.
 */
interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** A measured extent, with no position. What the surface contributes to placement. */
interface Size {
  readonly width: number;
  readonly height: number;
}

/**
 * The resolved result, held flat and primitive.
 *
 * Flat because it is compared field by field on every measurement to decide
 * whether anything actually moved. A nested object would compare by identity and
 * report movement on every pass, and a measurement that always reports movement
 * is a render loop.
 *
 * `width` and `height` are `null` together or set together — only the docked mode
 * determines a size — which is what lets the style builder treat them as one
 * decision.
 */
interface Placement {
  readonly left: number;
  readonly top: number;
  readonly width: number | null;
  readonly height: number | null;
  readonly side: AnchoredSide;
  readonly align: AnchoredAlign;
  readonly arrowLeft: number | null;
  readonly arrowTop: number | null;
  readonly availableWidth: number;
  readonly availableHeight: number;
}

/** Everything the placement functions need, already resolved and sanitised. */
interface PlacementInput {
  readonly anchor: Rect;
  readonly container: Rect;
  readonly surface: Size;
  readonly mode: AnchoredMode;
  readonly side: AnchoredSide;
  readonly align: AnchoredAlign;
  readonly gapPx: number;
  readonly paddingPx: number;
  readonly dockedSizePx: number;
  readonly flip: boolean;
  readonly shift: boolean;
}

/**
 * Replace a non-finite measurement with a usable one.
 *
 * Every number entering the pipeline goes through this. A detached element, a
 * caller's arithmetic on an absent value, or a headless environment that has not
 * laid anything out can all yield `NaN` or an infinity, and one of those
 * reaching a coordinate turns into a surface positioned nowhere. Sanitising at
 * the boundary is what lets everything downstream do plain arithmetic and stay
 * finite by construction.
 */
function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Clamp an extent to zero. A negative width is not a measurement. */
function nonNegative(value: number): number {
  return value > 0 ? value : 0;
}

/**
 * Hold a value inside a range, tolerating an inverted one.
 *
 * The inverted case is the one that matters, and it is not an edge case: `hi`
 * comes out below `lo` whenever the surface is larger than the room its
 * container has for it, which is precisely the outgrown state the details pane
 * and the emoji picker both document. Pinning to `lo` keeps the surface's
 * leading edge visible and lets it overflow the trailing edge, so what gets
 * clipped is the far end rather than the beginning — and the caller learns how
 * short it was from the reported available space.
 */
function clamp(value: number, lo: number, hi: number): number {
  if (hi < lo) return lo;
  if (value < lo) return lo;
  if (value > hi) return hi;
  return value;
}

/**
 * Start coordinate that centres an inner extent within an outer one.
 *
 * The halving is arithmetic rather than a design value, and it divides by a
 * literal, never by a measured dimension — so there is no dimension here that
 * could be zero.
 */
function centredStart(outerStart: number, outerExtent: number, innerExtent: number): number {
  return outerStart + (outerExtent - innerExtent) / 2;
}

/**
 * Reduce any anchor to the one rect shape the rest of the module works on.
 *
 * This is the single place the three anchoring contracts converge, and the only
 * place that knows they were ever different. Below it there is one shape and one
 * set of formulae, which is how the three contracts share an implementation
 * without being merged: the distinction lives in the type, and the arithmetic
 * never has to care.
 *
 * The switch is exhaustive and closes on a `never`. A fourth anchor kind added
 * to the union without a case here stops compiling rather than silently falling
 * through to a default that guesses.
 */
function resolveAnchorRect(anchor: AnchoredTarget): Rect {
  switch (anchor.kind) {
    case 'element': {
      // Absent until it mounts. Reported as a degenerate rect; the caller's
      // surface stays unpositioned because nothing sensible can be measured yet.
      if (!anchor.element) return { left: 0, top: 0, width: 0, height: 0 };
      const box = anchor.element.getBoundingClientRect();
      return {
        left: finiteOr(box.left, 0),
        top: finiteOr(box.top, 0),
        width: nonNegative(finiteOr(box.width, 0)),
        height: nonNegative(finiteOr(box.height, 0)),
      };
    }
    case 'point':
      // A pointer coordinate is a rect of no size. Sides and alignments then
      // resolve against it with no special case anywhere downstream.
      return { left: finiteOr(anchor.x, 0), top: finiteOr(anchor.y, 0), width: 0, height: 0 };
    case 'rect':
      // A caret rect off a selection range, copied field by field so that a live
      // rect the caller keeps mutating cannot change a placement after the fact.
      return {
        left: finiteOr(anchor.rect.left, 0),
        top: finiteOr(anchor.rect.top, 0),
        width: nonNegative(finiteOr(anchor.rect.width, 0)),
        height: nonNegative(finiteOr(anchor.rect.height, 0)),
      };
    default: {
      const unreachable: never = anchor;
      throw new Error(`useAnchoredPosition: unsupported anchor kind ${String(unreachable)}`);
    }
  }
}

/**
 * The box the surface is kept inside: the supplied rect, or the viewport.
 *
 * A supplied rect is the content region for a docked pane, and the fixed
 * viewport a component test wants to assert against. The viewport fallback is
 * read from the window rather than the document element so that it matches the
 * coordinate space `getBoundingClientRect` reports in, which is what makes a
 * fixed positioning strategy correct without any scroll arithmetic.
 */
function resolveContainerRect(container: DOMRectReadOnly | null): Rect {
  if (container) {
    return {
      left: finiteOr(container.left, 0),
      top: finiteOr(container.top, 0),
      width: nonNegative(finiteOr(container.width, 0)),
      height: nonNegative(finiteOr(container.height, 0)),
    };
  }
  return {
    left: 0,
    top: 0,
    width: nonNegative(finiteOr(window.innerWidth, 0)),
    height: nonNegative(finiteOr(window.innerHeight, 0)),
  };
}

/**
 * Whether a side runs along the vertical axis.
 *
 * The vocabulary the rest of the module uses: the *cross* axis is the one the
 * side moves along and the one a flip reverses; the *main* axis is the
 * perpendicular one, the one alignment distributes along and a clamp slides
 * along. For `top` and `bottom` the cross axis is vertical; for `left` and
 * `right` it is horizontal.
 */
function isVerticalSide(side: AnchoredSide): boolean {
  switch (side) {
    case 'top':
    case 'bottom':
      return true;
    case 'left':
    case 'right':
      return false;
    default: {
      const unreachable: never = side;
      throw new Error(`useAnchoredPosition: unsupported side ${String(unreachable)}`);
    }
  }
}

/** The side a flip would move to. */
function oppositeSide(side: AnchoredSide): AnchoredSide {
  switch (side) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default: {
      const unreachable: never = side;
      throw new Error(`useAnchoredPosition: unsupported side ${String(unreachable)}`);
    }
  }
}

/**
 * Cross-axis start coordinate for a side: where the surface begins along the
 * axis the side moves it on, separated from the anchor by the gap.
 *
 * The two leading sides subtract the surface's own extent because a surface
 * placed above or before its anchor grows away from it, so its start is its far
 * edge. The two trailing sides begin at the anchor's far edge and grow onward.
 */
function crossAxisStart(side: AnchoredSide, anchor: Rect, surface: Size, gapPx: number): number {
  switch (side) {
    case 'top':
      return anchor.top - gapPx - surface.height;
    case 'bottom':
      return anchor.top + anchor.height + gapPx;
    case 'left':
      return anchor.left - gapPx - surface.width;
    case 'right':
      return anchor.left + anchor.width + gapPx;
    default: {
      const unreachable: never = side;
      throw new Error(`useAnchoredPosition: unsupported side ${String(unreachable)}`);
    }
  }
}

/**
 * Main-axis start coordinate for an alignment.
 *
 * Which physical axis this is depends on the side, which is exactly why side and
 * alignment are separate fields: the same three alignments read against the
 * anchor's width below it and against the anchor's height beside it, and a flip
 * changes the side without disturbing any of that.
 */
function mainAxisStart(
  align: AnchoredAlign,
  side: AnchoredSide,
  anchor: Rect,
  surface: Size,
): number {
  const vertical = isVerticalSide(side);
  const anchorStart = vertical ? anchor.left : anchor.top;
  const anchorExtent = vertical ? anchor.width : anchor.height;
  const surfaceExtent = vertical ? surface.width : surface.height;
  switch (align) {
    case 'start':
      return anchorStart;
    case 'center':
      return centredStart(anchorStart, anchorExtent, surfaceExtent);
    case 'end':
      return anchorStart + anchorExtent - surfaceExtent;
    default: {
      const unreachable: never = align;
      throw new Error(`useAnchoredPosition: unsupported alignment ${String(unreachable)}`);
    }
  }
}

/**
 * Whether a placement leaves the container on the cross axis.
 *
 * The one test a flip is decided by, applied to the requested side and then to
 * the opposite one. It measures against the container inset by the padding, so a
 * surface that would sit flush against an edge counts as overflowing and gets
 * the chance to flip before it is clamped.
 */
function overflowsCrossAxis(
  side: AnchoredSide,
  start: number,
  surface: Size,
  container: Rect,
  paddingPx: number,
): boolean {
  const vertical = isVerticalSide(side);
  const extent = vertical ? surface.height : surface.width;
  const containerStart = vertical ? container.top : container.left;
  const containerExtent = vertical ? container.height : container.width;
  const lo = containerStart + paddingPx;
  const hi = containerStart + containerExtent - paddingPx;
  return start < lo || start + extent > hi;
}

/**
 * Caret offset from the already-positioned surface's top-left corner.
 *
 * Computed from the final coordinates, after any flip and any clamp, which is
 * the whole point: the coach mark's caret "points at the control it describes",
 * so a card that had to slide along an edge must still aim at the anchor it
 * belongs to rather than at wherever its own centre ended up (frame 27).
 *
 * The caret sits on whichever of the surface's edges faces the anchor, and moves
 * along that edge to line up with the anchor's centre. A surface placed to the
 * anchor's right therefore carries a caret on its left edge — the leftward caret
 * the rail-anchored variant is observed with.
 *
 * `null` when the anchor's centre has fallen outside the surface's span. A caret
 * pinned to the corner of a surface it no longer overlaps points at nothing, and
 * saying so lets the component drop the caret instead of drawing a misleading
 * one.
 */
function arrowOffset(side: AnchoredSide, anchor: Rect, surface: Rect): AnchoredArrowOffset | null {
  const anchorCentreX = anchor.left + anchor.width / 2;
  const anchorCentreY = anchor.top + anchor.height / 2;
  switch (side) {
    case 'top': {
      const left = anchorCentreX - surface.left;
      if (left < 0 || left > surface.width) return null;
      return { left, top: surface.height };
    }
    case 'bottom': {
      const left = anchorCentreX - surface.left;
      if (left < 0 || left > surface.width) return null;
      return { left, top: 0 };
    }
    case 'left': {
      const top = anchorCentreY - surface.top;
      if (top < 0 || top > surface.height) return null;
      return { left: surface.width, top };
    }
    case 'right': {
      const top = anchorCentreY - surface.top;
      if (top < 0 || top > surface.height) return null;
      return { left: 0, top };
    }
    default: {
      const unreachable: never = side;
      throw new Error(`useAnchoredPosition: unsupported side ${String(unreachable)}`);
    }
  }
}

/**
 * Room between the anchor and the container edge in the resolved direction.
 *
 * Deliberately independent of the surface's own size: this answers "how much is
 * there", not "how much was used", so a surface can consult it to decide whether
 * to scroll its body without the answer already reflecting the size it is trying
 * to choose. On the cross axis it is the distance from the far side of the gap to
 * the padded container edge; on the main axis it is the padded container extent,
 * since alignment can place the surface anywhere along it.
 */
function anchoredAvailableSpace(
  side: AnchoredSide,
  anchor: Rect,
  container: Rect,
  gapPx: number,
  paddingPx: number,
): AnchoredAvailableSpace {
  const paddedWidth = nonNegative(container.width - paddingPx * 2);
  const paddedHeight = nonNegative(container.height - paddingPx * 2);
  switch (side) {
    case 'top':
      return {
        width: paddedWidth,
        height: nonNegative(anchor.top - gapPx - (container.top + paddingPx)),
      };
    case 'bottom':
      return {
        width: paddedWidth,
        height: nonNegative(
          container.top + container.height - paddingPx - (anchor.top + anchor.height + gapPx),
        ),
      };
    case 'left':
      return {
        width: nonNegative(anchor.left - gapPx - (container.left + paddingPx)),
        height: paddedHeight,
      };
    case 'right':
      return {
        width: nonNegative(
          container.left + container.width - paddingPx - (anchor.left + anchor.width + gapPx),
        ),
        height: paddedHeight,
      };
    default: {
      const unreachable: never = side;
      throw new Error(`useAnchoredPosition: unsupported side ${String(unreachable)}`);
    }
  }
}

/**
 * Place a surface against its anchor: flip, then shift, then re-point the caret.
 *
 * The order is the recorded choice at the head of this file. Flipping is the
 * cross-axis remedy and clamping is the main-axis one, so the two never contend
 * for the same coordinate and the pass terminates after one of each.
 *
 * The flip is attempted once and taken only if the opposite side genuinely fits.
 * That single condition is what rules out oscillation — a surface too tall for
 * the space above and below stays where its caller asked for it, overflows, and
 * is reported as short of room, which is the clipped state its contract already
 * expects rather than a fault to be worked around here.
 */
function anchoredPlacement(input: PlacementInput): Placement {
  const { anchor, container, surface, gapPx, paddingPx } = input;

  let side = input.side;
  let crossStart = crossAxisStart(side, anchor, surface, gapPx);

  if (input.flip && overflowsCrossAxis(side, crossStart, surface, container, paddingPx)) {
    const candidateSide = oppositeSide(side);
    const candidateStart = crossAxisStart(candidateSide, anchor, surface, gapPx);
    if (!overflowsCrossAxis(candidateSide, candidateStart, surface, container, paddingPx)) {
      side = candidateSide;
      crossStart = candidateStart;
    }
  }

  const vertical = isVerticalSide(side);
  let mainStart = mainAxisStart(input.align, side, anchor, surface);

  if (input.shift) {
    const mainExtent = vertical ? surface.width : surface.height;
    const containerStart = vertical ? container.left : container.top;
    const containerExtent = vertical ? container.width : container.height;
    mainStart = clamp(
      mainStart,
      containerStart + paddingPx,
      containerStart + containerExtent - paddingPx - mainExtent,
    );
  }

  const left = vertical ? mainStart : crossStart;
  const top = vertical ? crossStart : mainStart;
  const arrow = arrowOffset(side, anchor, {
    left,
    top,
    width: surface.width,
    height: surface.height,
  });
  const available = anchoredAvailableSpace(side, anchor, container, gapPx, paddingPx);

  return {
    left,
    top,
    width: null,
    height: null,
    side,
    align: input.align,
    arrowLeft: arrow?.left ?? null,
    arrowTop: arrow?.top ?? null,
    availableWidth: available.width,
    availableHeight: available.height,
  };
}

/**
 * Dock a surface flush to the container's trailing edge at full container height.
 *
 * The details pane's docked form "takes roughly the right three-tenths of the
 * width from the content region, leaving rail and sidebar untouched" — so the
 * container is the content region, and the pane occupies its whole height.
 * Flush means no padding is applied: a docked region shares its container's edge
 * rather than floating inside it.
 *
 * The size arrives already resolved. Nothing here computes the fraction, because
 * a geometric design value belongs to the token module and this hook may not read
 * it. With no size supplied the pane fills its container, which is an identity
 * rather than an invented value.
 *
 * No side is meaningful and no caret can point anywhere, so the requested side
 * and alignment are passed through untouched and the caret is `null`.
 */
function dockedPlacement(input: PlacementInput): Placement {
  const { container } = input;
  const width = clamp(input.dockedSizePx, 0, container.width);
  return {
    left: container.left + container.width - width,
    top: container.top,
    width,
    height: container.height,
    side: input.side,
    align: input.align,
    arrowLeft: null,
    arrowTop: null,
    availableWidth: width,
    availableHeight: container.height,
  };
}

/**
 * Centre a surface within its container.
 *
 * The details pane's modal form is "centred and dims its backdrop"; the dimming
 * belongs to the component, and only the centring is geometry.
 *
 * No size is emitted, and that is deliberate rather than an omission. The only
 * size available here is the one just measured off the surface, so writing it
 * back into the surface's own style would have the size observer watching this
 * module's own output — the iteration-to-convergence that must not happen, and a
 * height cap on a surface whose contract says it may be clipped instead. Docked
 * mode can emit a size safely because that size comes from the caller and the
 * container, never from a measurement.
 *
 * Centring is clamped so that a surface larger than its container still starts
 * inside it and overflows the trailing edge rather than the leading one.
 */
function centredPlacement(input: PlacementInput): Placement {
  const { container, surface, paddingPx } = input;
  const left = clamp(
    centredStart(container.left, container.width, surface.width),
    container.left + paddingPx,
    container.left + container.width - paddingPx - surface.width,
  );
  const top = clamp(
    centredStart(container.top, container.height, surface.height),
    container.top + paddingPx,
    container.top + container.height - paddingPx - surface.height,
  );
  return {
    left,
    top,
    width: null,
    height: null,
    side: input.side,
    align: input.align,
    arrowLeft: null,
    arrowTop: null,
    availableWidth: nonNegative(container.width - paddingPx * 2),
    availableHeight: nonNegative(container.height - paddingPx * 2),
  };
}

/** Dispatch to the placement the mode calls for. Exhaustive over every mode. */
function computePlacement(input: PlacementInput): Placement {
  switch (input.mode) {
    case 'anchored':
      return anchoredPlacement(input);
    case 'docked':
      return dockedPlacement(input);
    case 'centred':
      return centredPlacement(input);
    default: {
      const unreachable: never = input.mode;
      throw new Error(`useAnchoredPosition: unsupported mode ${String(unreachable)}`);
    }
  }
}

/**
 * A placement together with the surface it was measured from.
 *
 * Pairing the two is what makes a stale placement impossible to observe. The
 * alternative — clearing the placement whenever the surface closes — means
 * writing state from inside an effect for no reason other than housekeeping,
 * which cascades a render and is precisely the pattern an effect should not
 * contain. Storing the node instead lets the closed and remounted cases be
 * recognised by comparison during render, where they cost nothing: a placement
 * measured from a surface that is no longer the current one simply does not
 * apply, so there is nothing to clean up and no window in which the old
 * coordinates could be used.
 */
interface PositionedState {
  readonly node: HTMLElement;
  readonly placement: Placement;
}

/**
 * Whether a freshly computed placement matches the one already in state.
 *
 * This is what makes the measurement pass safe to run as often as it likes. A
 * caller that builds its anchor object inline rebuilds it on every render, and a
 * size observer fires once the moment it starts observing; both re-run the
 * measurement, and neither should cause a state change unless something actually
 * moved. Comparing the fields and keeping the previous object on a match is what
 * turns those repeats into no-ops instead of a render loop.
 */
function samePlacement(previous: Placement, next: Placement): boolean {
  return (
    previous.left === next.left &&
    previous.top === next.top &&
    previous.width === next.width &&
    previous.height === next.height &&
    previous.side === next.side &&
    previous.align === next.align &&
    previous.arrowLeft === next.arrowLeft &&
    previous.arrowTop === next.arrowTop &&
    previous.availableWidth === next.availableWidth &&
    previous.availableHeight === next.availableHeight
  );
}

/**
 * Position one floating surface against one anchor.
 *
 * Attach `surfaceRef` to the surface element and spread `surfaceStyle` onto it.
 * Read `side` to know which way it actually opened, `arrow` to place a caret,
 * `available` to decide whether to scroll a body, and `isPositioned` to keep the
 * surface hidden — through the surface's own stylesheet — for the single frame
 * before the first measurement lands.
 *
 * Measurement happens in a layout effect, so the surface is placed before the
 * browser paints and never visibly jumps. Nothing is measured during render.
 */
export function useAnchoredPosition(
  options: UseAnchoredPositionOptions,
): UseAnchoredPositionResult {
  // Every option resolved through a defaulting read against a named constant, so
  // that no bare number and no bare enumerated value is written at a point of use
  // further down.
  const anchor = options.anchor;
  const enabled = options.enabled ?? true;
  const mode = options.mode ?? 'anchored';
  const requestedSide = options.side ?? DEFAULT_SIDE;
  const requestedAlign = options.align ?? DEFAULT_ALIGN;
  const gapPx = options.offsetPx ?? ANCHOR_SURFACE_GAP_PX;
  const paddingPx = options.viewportPaddingPx ?? CONTAINER_EDGE_PADDING_PX;
  const containerRect = options.container ?? null;
  const dockedSizePx = options.dockedSizePx ?? null;
  const flip = options.flip ?? true;
  const shift = options.shift ?? true;

  // The surface node is held in state rather than in a ref so that the effects
  // below can depend on it and re-run when it mounts or unmounts. A ref would be
  // invisible to a dependency array, and reading one during render is exactly
  // what the hook rules forbid. The cost is that the first committed frame has no
  // coordinates yet, which is the frame `isPositioned` exists to cover.
  const [surfaceNode, setSurfaceNode] = useState<HTMLElement | null>(null);
  const [revision, setRevision] = useState(0);
  const [positioned, setPositioned] = useState<PositionedState | null>(null);

  // The placement in force, derived rather than stored.
  //
  // A stored placement only applies while the surface it was measured from is
  // still the current one and positioning is still switched on. Deriving that
  // here — a comparison over two pieces of state, no measurement and no ref —
  // means the closed state and a remount both read as unpositioned immediately,
  // with no effect having to write state to make it so.
  const placement =
    enabled && positioned !== null && positioned.node === surfaceNode ? positioned.placement : null;

  const surfaceRef = useCallback<RefCallback<HTMLElement>>((node) => {
    setSurfaceNode(node);
  }, []);

  const update = useCallback((): void => {
    setRevision((current) => current + 1);
  }, []);

  // Reposition triggers.
  //
  // Kept in their own effect, separate from measurement, so that listeners are
  // registered once per surface rather than re-registered whenever an option
  // changes. Each trigger simply bumps the revision, which is what the
  // measurement effect below watches.
  //
  // There is deliberately no animation-frame loop. Polling would burn frames for
  // a surface that is not moving and would make a component test depend on how
  // many frames elapsed, which is not something a test can assert on reliably.
  useLayoutEffect(() => {
    if (!enabled || !surfaceNode) return undefined;

    const onReposition = (): void => {
      update();
    };

    window.addEventListener('resize', onReposition);
    // Capturing, because the scroll that moves an anchor is usually an ancestor's
    // rather than the window's, and a scroll event on an element does not bubble.
    // Passive, because this listener only reads geometry and never cancels the
    // scroll it is observing.
    window.addEventListener('scroll', onReposition, { capture: true, passive: true });

    // Feature-detected rather than assumed: the size observer is absent from some
    // test environments, and a surface that cannot observe its own resizing is
    // still perfectly positionable — it just relies on `update` instead. Skipping
    // it is a graceful degradation, not a special case for any one environment.
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onReposition);
    observer?.observe(surfaceNode);

    return () => {
      window.removeEventListener('resize', onReposition);
      // The capture flag is part of a listener's identity, so removal has to
      // repeat it or the listener stays attached.
      window.removeEventListener('scroll', onReposition, { capture: true });
      observer?.disconnect();
    };
  }, [enabled, surfaceNode, update]);

  // Measurement and placement.
  //
  // Runs in a layout effect so the write lands before paint. It re-runs whenever
  // any input changes, including on every render for a caller that rebuilds its
  // anchor object inline — which is safe because the state update below keeps the
  // previous object when nothing moved, so a repeat pass ends without a render.
  useLayoutEffect(() => {
    // The closed state, and the frame before the surface mounts. Nothing is
    // measured and no listener has been registered. Nothing needs clearing
    // either: a placement left over from a previous open no longer names the
    // current surface, so the derivation above has already stopped applying it.
    if (!enabled || !surfaceNode) return;

    const surfaceBox = surfaceNode.getBoundingClientRect();
    const container = resolveContainerRect(containerRect);
    const surface: Size = {
      width: nonNegative(finiteOr(surfaceBox.width, 0)),
      height: nonNegative(finiteOr(surfaceBox.height, 0)),
    };

    const next = computePlacement({
      anchor: resolveAnchorRect(anchor),
      container,
      surface,
      mode,
      side: requestedSide,
      align: requestedAlign,
      gapPx: nonNegative(finiteOr(gapPx, ANCHOR_SURFACE_GAP_PX)),
      paddingPx: nonNegative(finiteOr(paddingPx, CONTAINER_EDGE_PADDING_PX)),
      // Absent means "fill the container", which is why the fallback is the
      // container's own extent rather than any chosen width.
      dockedSizePx:
        dockedSizePx === null
          ? container.width
          : nonNegative(finiteOr(dockedSizePx, container.width)),
      flip,
      shift,
    });

    // Keeping the previous object when nothing moved is what stops a repeated
    // pass from becoming a repeated render.
    //
    // `react-hooks/set-state-in-effect` is suppressed here, on this statement
    // alone, and the reasoning is recorded rather than assumed. The rule guards
    // against three things: state derived from data already available during
    // render, an effect standing in for an event handler, and an external system
    // synchronised by hand. This statement is none of them. Placing a surface
    // requires the surface's own measured size, and that size does not exist
    // until the surface is in the document — so the value written here cannot be
    // derived during render, which is the one escape the rule actually offers.
    //
    // The alternatives the rule does accept were each rejected on a stated
    // ground rather than on preference:
    //   · Measuring during render, or reading the node's ref during render, is
    //     forbidden outright by the purity rules and would tear under
    //     concurrent rendering.
    //   · Deferring to a timer or an animation frame passes the rule but moves
    //     the write after paint, which is precisely the visible jump from an
    //     unplaced position that a layout effect exists to prevent. It would
    //     also make every consumer's component test depend on elapsed frames.
    //   · A subscription callback — the resize listener and the size observer
    //     above — passes the rule and is already used for every *subsequent*
    //     measurement. It cannot produce the first one: "the surface just
    //     mounted" is not an event any external system emits.
    // A second pass is therefore inherent to two-pass layout, not incidental to
    // how this hook is written.
    //
    // The cascade the rule warns about is bounded to exactly one extra pass: the
    // updater returns the previous object unchanged once the geometry stops
    // moving, so measuring again cannot schedule another render. That is what
    // makes this finite rather than a convergence loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- two-pass DOM measurement; bounded to one extra pass and self-terminating, see above
    setPositioned((previous) =>
      previous !== null && previous.node === surfaceNode && samePlacement(previous.placement, next)
        ? previous
        : { node: surfaceNode, placement: next },
    );
  }, [
    anchor,
    containerRect,
    dockedSizePx,
    enabled,
    flip,
    gapPx,
    mode,
    paddingPx,
    requestedAlign,
    requestedSide,
    revision,
    shift,
    surfaceNode,
  ]);

  // Computed geometry only. A fixed strategy on its own until the first
  // measurement lands, then coordinates, and a size only in the mode that
  // determines one. No layer, no colour, no radius, no shadow, no spacing, no
  // font: those are tokens applied by the surface's own stylesheet.
  const surfaceStyle = useMemo<CSSProperties>(() => {
    if (!placement) return { position: 'fixed' };
    if (placement.width === null || placement.height === null) {
      return { position: 'fixed', left: placement.left, top: placement.top };
    }
    return {
      position: 'fixed',
      left: placement.left,
      top: placement.top,
      width: placement.width,
      height: placement.height,
    };
  }, [placement]);

  const arrow = useMemo<AnchoredArrowOffset | null>(() => {
    if (!placement || placement.arrowLeft === null || placement.arrowTop === null) return null;
    return { left: placement.arrowLeft, top: placement.arrowTop };
  }, [placement]);

  // Zero before the first measurement. A caller reads this only once
  // `isPositioned` is true, and reporting zero rather than a guess keeps it from
  // acting on a number that was never measured.
  const available = useMemo<AnchoredAvailableSpace>(
    () => ({
      width: placement?.availableWidth ?? 0,
      height: placement?.availableHeight ?? 0,
    }),
    [placement],
  );

  return {
    surfaceRef,
    surfaceStyle,
    // Before the first measurement no flip has been evaluated, so the requested
    // values are the honest answer.
    side: placement?.side ?? requestedSide,
    align: placement?.align ?? requestedAlign,
    arrow,
    available,
    isPositioned: enabled && placement !== null,
    update,
  };
}
