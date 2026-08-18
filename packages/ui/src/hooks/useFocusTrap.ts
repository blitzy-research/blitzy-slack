/**
 * Focus containment, restoration and traversal for every overlay surface in the
 * component library.
 *
 * HOW THE PROJECT RULES ARE CITED BELOW, AND WHY NOT BY THEIR OWN IDENTIFIERS
 *
 * Each of the five project rules carries an identifier that embeds a third-party
 * product name. The rule on third-party identity — requirement R4 — forbids that
 * name from appearing in source or in a comment, with no exception for the place
 * it happens to be embedded, and the brand guard in `tools/check-brand` fails the
 * pipeline on any occurrence outside the five read-only input paths, of which
 * this file is not one. Writing an identifier here to prove compliance with a
 * rule would therefore breach that same rule. The workspace lint configuration
 * reaches the identical conclusion for itself and says so in its own header.
 *
 * So each rule is cited by its requirement label and its subject — R1
 * authorization is server-side only, R2 corpus and specification handling, R3
 * uncertainty is not permission to omit, R4 third-party identity exclusion, R5
 * shared components are implemented once. Those labels are what the plan's own
 * cross-reference table maps the rule identifiers onto, and they are stable: the
 * ordinal position of a rule in the rules document is *not*, which is why no
 * citation below uses one.
 *
 * WHY THIS FILE IS THE ONLY ONE OF ITS KIND
 *
 * The rule on shared components (R5) requires a shared behaviour to be
 * implemented exactly once and requires consumers to import it rather than
 * re-declare it, extending it where a variant is missing instead of forking it.
 * Five
 * contracts need focus containment — the modal shell, the confirmation dialog,
 * the details pane in its centred-modal form, the emoji picker and the
 * date-picker popover — and every one of them consumes this hook. A
 * keydown-and-focus loop written inside any of those directories would be the
 * same defect as forking a component, one level down. So this hook is
 * deliberately complete: nesting, restoration, initial focus, `Tab` cycling in
 * both directions, escaped-focus recovery, the `Escape` signal and clean
 * deactivation are all here, and no consumer is left with a reason to reinvent
 * any part of it.
 *
 * THE OWNER'S CONTRACT — three parts, and the first two fail silently
 *
 *   1. Attach `containerRef` to the overlay's own root element. The hook has no
 *      other way to learn what it is containing, and a trap whose container
 *      never arrives is inert rather than loud.
 *   2. If the container itself may take focus as the last-resort fallback — and
 *      it does whenever the overlay renders with no tabbable descendant — give
 *      it `tabIndex={-1}`. Without that attribute the platform refuses the focus
 *      call and the fallback silently does nothing. That attribute is accepted by
 *      the accessibility lint rules at this value; a zero there is not, and would
 *      also put the container into the tab sequence, which is not wanted.
 *   3. Destructure the result. Write `const { containerRef } = useFocusTrap(…)`
 *      and pass that binding, rather than keeping the whole object and writing
 *      `ref={trap.containerRef}`. This one fails loudly rather than silently, and
 *      the reason is worth stating because the error text points somewhere else:
 *      the hook-correctness rules read a `Ref`-suffixed property being placed in
 *      a `ref` position as a ref being read during render — the mistake that
 *      `ref.current` in a render body would be — and report "cannot access refs
 *      during render" on a line that is doing nothing of the kind. Destructuring
 *      states the same thing in a form the rule reads correctly. Renaming while
 *      destructuring is fine, which is what a component holding two traps wants:
 *      `const { containerRef: dialogRef } = useFocusTrap(…)`.
 *
 * Everything else is optional. `initialFocusRef` names the element that should
 * receive focus on open, `returnFocusTo` overrides where focus goes on close,
 * `restoreFocus` switches restoration off, and `onEscape` receives the Escape
 * signal.
 *
 * WHAT THIS HOOK DOES NOT OWN
 *
 * It renders nothing. There is no markup, no portal, no renderer import, no
 * stylesheet, no design token, no backdrop, no dimming and no layering here —
 * the layering scale belongs to the token module — and no positioning, which
 * belongs to the anchored-position hook. It carries no user-facing string of any
 * kind either, because it has no surface to put one on.
 *
 * It also never touches anything outside its container. It sets no `aria-hidden`
 * and no `inert` attribute on a sibling or an ancestor, adds no class to the
 * document body, and writes no style anywhere. Two concrete reasons: the client
 * mounts its live regions outside overlays, so hiding the surrounding document
 * from assistive technology would silence every toast announcement; and a scroll
 * lock is a layout concern that would need a style value this hook may not own.
 * A surface that needs a scroll lock does it in its own component.
 *
 * It never suppresses the focus treatment either. The focused field renders a
 * ring *outside* its own border together with a strengthened border and a caret
 * (frames 490, 491, 63, 43), so nothing here clears an outline, clips a
 * focusable, or moves focus past the element a user is expecting to reach. One
 * nearby treatment is deliberately not focus and must not be read as it: a date
 * grid marks the current day with an unfilled ring while earlier days render at
 * reduced contrast (frame 53), which the state matrix records as its own state.
 * The date-picker popover uses this hook for containment; its ringed cell is not
 * its focused cell.
 *
 * WHAT THE SPECIFICATION EVIDENCES, AND WHAT IT LEAVES TO THE BUILD
 *
 * Nesting is a requirement rather than an edge case. `C-MODAL-SHELL` lists
 * "backdrop dimmed twice over when a dialog is stacked on the modal" and
 * "stacked beneath a dialog opened from within it" among its states, the shell
 * geometry says the same from the shell's side, and `C-CONFIRM-DIALOG` carries
 * "stacked over a modal that is already open" as a variant of its own — all on
 * the evidence of frame 105. Two traps can therefore be alive at once, and they
 * must unwind in order.
 *
 * Restoration is the one traversal behaviour the corpus actually evidences: a
 * control that has been used keeps its ring after the surface it opened has
 * closed, while every neighbouring control in the same bar renders without one,
 * so focus survives the dismissal of what the control opened (frame 288).
 * Returning focus to the invoking element is therefore specified, not invented.
 *
 * Everything else is explicitly a build decision. `docs/workflows/21-states.md`
 * L463 records that the focus treatment itself is observed while the traversal
 * that produces it is not — no capture shows two successive focus positions, a
 * skip link, or focus containment inside an open modal — and states outright
 * that tab order, focus containment and focus restoration on dismissal are
 * build decisions rather than transcriptions, with the single restoration case
 * above as the stated exception. The rule on absent evidence (R3) makes that
 * marker an open work item and never permission to omit, so each decision below is
 * implemented rather than deferred, and each is recorded with the options that
 * were considered. The register entry belongs in
 * `docs/decisions/gap-register.md`, which another agent owns; the reasoning is
 * repeated here because this is where a later reader will look for it.
 *
 *   Nesting model. Options: one trap at a time, releasing and re-acquiring the
 *   outer one; a single global handler consulting a registry; a
 *   last-in-first-out stack of records in which only the topmost is live.
 *   Chosen: the stack. Releasing the outer trap would lose its return target,
 *   which is the one thing frame 288 says must survive, and a single global
 *   handler would still have to be told which container is current. A trap that
 *   is not on top stays mounted and inert, so Escape closes the dialog and
 *   leaves the modal beneath it open.
 *
 *   Return target. Options: one shared target for the whole stack; the target
 *   the outermost trap captured; a target captured per trap at its own
 *   activation. Chosen: per trap. Unwinding a stacked dialog then returns focus
 *   *into* the modal beneath it rather than all the way out of both, which is
 *   the only reading of frames 105 and 288 that holds for both surfaces at once.
 *
 *   Initial focus. Options: always the container; always the first tabbable; a
 *   caller-named element with fallbacks. Chosen: the caller's `initialFocusRef`
 *   when it is inside the container and the platform accepts the focus call,
 *   then the first tabbable, then the container itself. A caller naming an
 *   element outside the container is refused rather than honoured, because the
 *   recovery below would immediately pull focus back and the two mechanisms
 *   would fight each other.
 *
 *   Escape. Options: the hook deactivates itself; the hook hides the surface;
 *   the hook reports and the owner decides. Chosen: report only. The
 *   confirmation dialog closes on Escape — frame 105 shows dismissal available
 *   through the title row's dismiss control as well as through cancel — while a
 *   surface holding unsaved work may legitimately refuse, and only the owner
 *   knows which of the two it is.
 *
 *   Escaped focus. Options: trust the key handler alone; poll the active
 *   element; listen for focus arriving anywhere in the document. Chosen: listen.
 *   A key handler cannot see programmatic focus or a return from browser chrome,
 *   and polling would burn a timer on something that is already an event.
 *
 *   Tab order. Options: reproduce the platform's ordering including positive
 *   `tabindex` values; use document order. Chosen: document order, which *is*
 *   the platform's ordering whenever every tabbable carries the default or zero
 *   — and no contract in this library assigns a positive `tabindex`.
 *
 * NOTHING HERE IS AN AUTHORIZATION DECISION
 *
 * The rule on authorization (R1) requires every authorization decision to be
 * taken on the server, at the point of execution, against the acting session and the
 * specific target object, and states that a hidden, disabled or absent control
 * exempts nothing. This hook therefore contains whatever focusables the owner
 * rendered and nothing more: it accepts no role, permission, capability,
 * session, workspace identifier or actor identifier, returns none, and branches
 * on none. Skipping a disabled element below is a traversal decision with no
 * security meaning whatsoever — the server checks regardless of what the client
 * rendered or omitted.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefCallback, RefObject } from 'react';

/**
 * Every element that can hold the caret or take a key press, as one selector so
 * that discovery is a single pass over the container.
 *
 * `[contenteditable]` is here because a modal can hold a rich-text sub-composer,
 * which is an editable region rather than a form control; the negation keeps out
 * an explicitly non-editable one, which is a way of switching editing off rather
 * than a way of being tabbable. `[tabindex]` admits anything the owner made
 * tabbable deliberately, including a container it wants reachable, and the
 * negative values it also matches are removed during filtering.
 */
const TABBABLE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'audio[controls]',
  'video[controls]',
  '[tabindex]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

/**
 * Attributes that take an element — or everything inside it — out of the
 * traversal. Tested with `closest` so that one call covers the element itself
 * and every ancestor: a control inside a disabled fieldset is as unreachable as
 * a disabled control, and a subtree hidden from assistive technology should not
 * be reachable by keyboard either.
 */
const UNTRAVERSABLE_SELECTOR = '[hidden],[inert],[aria-hidden="true"],[disabled]';

/**
 * An input of this type has no rendered representation at all, so it is excluded
 * by what it is rather than by how it looks — which matters, because the filter
 * below deliberately never asks how anything looks.
 */
const HIDDEN_INPUT_SELECTOR = 'input[type="hidden"]';

/**
 * Key names exactly as `KeyboardEvent.key` reports them.
 *
 * Named rather than written at the point of use, because the rule on absent
 * evidence (R3) prohibits a literal standing in for a value that belongs to a
 * definition. Key bindings are the one thing the rule on third-party identity
 * (R4) expressly permits to be transcribed — a binding is function rather than
 * identity — while the labels, headings and copy that would surround one are not,
 * which is why this file names the keys and authors no text about them.
 */
const KEY_TAB = 'Tab';
const KEY_ESCAPE = 'Escape';

/**
 * What the caller asks for.
 *
 * `active` is the only required member: an overlay knows whether it is open, and
 * everything else has a defensible default.
 *
 *   - `initialFocusRef` names the element to focus on activation. Ignored when it
 *     is empty, outside the container, or refused by the platform.
 *   - `returnFocusTo` overrides where focus goes on deactivation. Left unset,
 *     the trap captures whatever held focus at the moment it activated.
 *   - `restoreFocus` defaults to `true`. Set it to `false` for a surface that
 *     deliberately leaves focus where the interaction ended.
 *   - `onEscape` receives the Escape signal. The trap takes no action of its own
 *     on Escape, so an overlay that omits this handler simply does not close on
 *     the key.
 */
export type UseFocusTrapOptions = {
  readonly active: boolean;
  readonly initialFocusRef?: RefObject<HTMLElement | null>;
  readonly returnFocusTo?: HTMLElement | null;
  readonly restoreFocus?: boolean;
  readonly onEscape?: () => void;
};

/**
 * What the caller gets.
 *
 *   - `containerRef` goes on the overlay's root element. It is stable for the
 *     lifetime of the component, so attaching it causes no repeated work.
 *   - `isActive` reports whether the trap is engaged, which is not the same as
 *     what was asked for: a trap whose container has not attached yet is not
 *     containing anything.
 *   - `focusFirst` moves focus to the first tabbable on demand, for an owner
 *     whose content has just changed — a menu that has finished loading its
 *     rows, or a wizard step that has replaced its body.
 */
export type UseFocusTrapResult = {
  readonly containerRef: RefCallback<HTMLElement>;
  readonly isActive: boolean;
  readonly focusFirst: () => void;
};

/**
 * One engaged trap, as the stack holds it.
 *
 * Every member is captured at activation and never revised, which is what makes
 * unwinding predictable: the target focus returns to was decided when the
 * surface opened, not when it closed.
 */
interface ActiveTrap {
  readonly container: HTMLElement;
  readonly returnTarget: HTMLElement | null;
  readonly restoreFocus: boolean;
}

/**
 * The engaged traps, outermost first.
 *
 * Module-scoped because nesting is a relationship *between* trap instances and
 * no single instance can see it. This is an empty array at module scope — a data
 * structure rather than any access to a document — so importing this module
 * still touches nothing and remains free of side effects.
 */
const activeTraps: ActiveTrap[] = [];

/**
 * Only the topmost trap acts. Every handler is gated on this, which is what lets
 * a confirmation dialog opened from inside a modal take the keyboard while the
 * modal beneath it stays mounted and inert (frame 105).
 */
function isTopmostTrap(trap: ActiveTrap): boolean {
  return activeTraps.at(-1) === trap;
}

/**
 * Remove one trap by identity.
 *
 * Deliberately not a pop. A trap is normally released from the top, but an owner
 * can unmount an outer surface while an inner one is still mounted, and popping
 * blindly would then discard the wrong record and leave the inner trap believing
 * it is not topmost — which breaks containment for the rest of the session. Doing
 * nothing when the record is absent keeps the unmount path safe to run twice.
 */
function releaseTrap(trap: ActiveTrap): void {
  const index = activeTraps.lastIndexOf(trap);
  if (index !== -1) {
    activeTraps.splice(index, 1);
  }
}

/**
 * Whether one candidate element takes part in the traversal.
 *
 * THE ONE FILTER THIS FUNCTION MUST NOT APPLY — do not "fix" this later.
 *
 * Every exclusion below is made on an attribute or on the element's own
 * semantics. None of them asks how the element looks, and that is a requirement
 * rather than an oversight: there is no computed-style check here, no
 * `offsetParent` check and no `getClientRects` check, because the component tests
 * run in a DOM implementation with no layout engine. There, every element
 * reports a zero-size box and no offset parent, so a visibility filter would
 * find the tabbable set empty in *every* component test and the trap would
 * silently do nothing while appearing to be wired up correctly. The attribute
 * checks below express the same intent — hidden, inert and
 * assistive-technology-hidden subtrees are out, and so is a disabled control —
 * without depending on layout that the test environment cannot produce.
 */
function isTabbable(element: HTMLElement): boolean {
  if (element.closest(UNTRAVERSABLE_SELECTOR) !== null) {
    return false;
  }
  if (element.matches(HIDDEN_INPUT_SELECTOR)) {
    return false;
  }

  // A negative `tabindex` makes an element focusable but not tabbable, so it is
  // reachable by a click or by a deliberate focus call and never by the key. A
  // value that is not an integer at all is ignored rather than treated as
  // negative, which is how the platform treats an invalid one: the element falls
  // back to whatever its own element type makes it.
  const declaredTabIndex = element.getAttribute('tabindex');
  if (declaredTabIndex !== null) {
    const parsed = Number.parseInt(declaredTabIndex, 10);
    if (!Number.isNaN(parsed) && parsed < 0) {
      return false;
    }
  }

  return true;
}

/**
 * The container's tabbables, in document order.
 *
 * Called at the moment it is needed and never cached. The set legitimately
 * changes while a trap is open: a menu row can carry a text input that accepts
 * typing without closing the menu (frame 504), a modal can hold a rich-text
 * sub-composer, and a wizard step replaces its body wholesale. A list captured at
 * activation would be wrong by the second interaction.
 */
function collectTabbables(container: HTMLElement): HTMLElement[] {
  const tabbables: HTMLElement[] = [];
  for (const candidate of container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)) {
    if (isTabbable(candidate)) {
      tabbables.push(candidate);
    }
  }
  return tabbables;
}

/**
 * Move focus to the first tabbable, falling back to the container itself.
 *
 * The fallback is why the owner's contract asks for `tabIndex={-1}` on the
 * container: an overlay can legitimately render with nothing tabbable in it — a
 * recorder modal reduced to its title-row controls, a body that has not loaded —
 * and focus has to land somewhere inside the surface for containment to mean
 * anything.
 */
function focusFirstTabbableIn(container: HTMLElement): void {
  const first = collectTabbables(container)[0];
  if (first !== undefined) {
    first.focus();
    return;
  }
  container.focus();
}

/**
 * Move focus in on activation, in the order the decision record sets out.
 *
 * The requested element is attempted rather than vetted. Asking the platform to
 * focus it and then checking whether it took is strictly better than
 * re-implementing the platform's own focusability rules here, because those rules
 * take in the element type, the disabled state, the tabindex and whether the
 * element is rendered at all — and getting any one of them wrong would fail
 * silently. Containment is checked first, though: a target outside the container
 * is refused, because the recovery listener would pull focus straight back out of
 * it and the two mechanisms would fight.
 */
function focusInitialElement(container: HTMLElement, requested: HTMLElement | null): void {
  if (requested !== null && container.contains(requested)) {
    requested.focus();
    if (document.activeElement === requested) {
      return;
    }
  }
  focusFirstTabbableIn(container);
}

/**
 * Decide, at activation, where focus will return to on deactivation.
 *
 * An explicit target wins. Otherwise the element that held focus when the surface
 * opened is captured, which is the control that opened it — the behaviour frame
 * 288 evidences. `null` from the caller is treated as "not supplied" rather than
 * as "nowhere", because suppressing restoration altogether is what `restoreFocus`
 * is for and a single meaning per option is worth more than a second way to say
 * the same thing.
 */
function resolveReturnTarget(requested: HTMLElement | null | undefined): HTMLElement | null {
  const explicit = requested ?? null;
  if (explicit !== null) {
    return explicit;
  }
  const focused = document.activeElement;
  return focused instanceof HTMLElement ? focused : null;
}

/**
 * Return focus on deactivation.
 *
 * The connection check is what makes a stacked unwind safe: by the time a surface
 * closes, the control that opened it may itself have been removed — a row deleted
 * by the very action the dialog confirmed — and focusing a detached element would
 * be a no-op in some engines and a thrown call in others. Skipping it leaves focus
 * where it is, which the next interaction or the enclosing trap's own recovery
 * then resolves.
 */
function restoreFocusFor(trap: ActiveTrap): void {
  if (!trap.restoreFocus) {
    return;
  }
  const target = trap.returnTarget;
  if (target === null || !target.isConnected) {
    return;
  }
  target.focus();
}

/**
 * Contain focus inside one overlay for as long as the owner says it is open.
 *
 * @param options - see {@link UseFocusTrapOptions}. Only `active` is required.
 * @returns the ref to attach, whether the trap is engaged, and a way to move
 *          focus to the first tabbable on demand. See {@link UseFocusTrapResult}.
 *
 * @example
 * ```tsx
 * const { containerRef, focusFirst } = useFocusTrap({ active: open, onEscape: close });
 * return open ? <div ref={containerRef} tabIndex={-1}>{children}</div> : null;
 * ```
 */
export function useFocusTrap(options: UseFocusTrapOptions): UseFocusTrapResult {
  const { active } = options;

  // The container arrives through a ref callback and is held in state rather than
  // in a ref deliberately. Activation has to happen when *either* `active` turns
  // on or the element attaches, in whichever order those two occur, and only a
  // state value can be an effect dependency. Held in a ref, activation would fall
  // to whichever happened last and the other order would silently do nothing.
  const [container, setContainer] = useState<HTMLElement | null>(null);

  // The options this hook was last rendered with.
  //
  // The activation effect reads them through this ref instead of closing over
  // them, so that a re-rendered inline callback or a flipped flag cannot tear the
  // trap down and build it again — a rebuild would re-capture the return target
  // and move focus a second time, which the user would see. The effect's
  // dependencies are therefore exactly the two things that should re-engage it.
  const latestOptionsRef = useRef<UseFocusTrapOptions>(options);
  useEffect(() => {
    latestOptionsRef.current = options;
  }, [options]);

  const containerRef = useCallback<RefCallback<HTMLElement>>((element) => {
    setContainer(element);
  }, []);

  // Not gated on `active`: an owner calling this has asked for it explicitly, and
  // the guards that matter are the ones below — a document to work in, and a
  // container to look inside.
  const focusFirst = useCallback((): void => {
    if (typeof document === 'undefined' || container === null) {
      return;
    }
    focusFirstTabbableIn(container);
  }, [container]);

  useEffect(() => {
    // The document guard keeps importing the package barrel safe in a test
    // project with no DOM, where this effect would not run anyway but the cost of
    // saying so is one comparison.
    if (!active || container === null || typeof document === 'undefined') {
      return;
    }

    const latest = latestOptionsRef.current;
    const trap: ActiveTrap = {
      container,
      returnTarget: resolveReturnTarget(latest.returnFocusTo),
      restoreFocus: latest.restoreFocus ?? true,
    };
    activeTraps.push(trap);

    // Raised while focus is being pulled back, so that the `focus()` call the
    // recovery makes cannot re-enter the handler that made it. Focus events are
    // dispatched synchronously, so a flag in this closure is sufficient and a
    // timer would only add latency to a case that is already resolved.
    let recovering = false;

    const handleKeyDown = (event: KeyboardEvent): void => {
      // A trap below the top of the stack stays mounted and inert. And a key
      // something else has already acted on has been spoken for: a typeahead that
      // takes `Tab` to accept its highlighted suggestion is doing its own job,
      // and overriding it here would break the contract that owns it.
      if (!isTopmostTrap(trap) || event.defaultPrevented) {
        return;
      }

      // A modifier changes what the key means, and those combinations belong to
      // the platform. Shift is excluded from this test on purpose: Shift+Tab is
      // one of the two bindings this hook owns.
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key === KEY_ESCAPE) {
        // A signal, never an action. Nothing is unmounted, hidden or deactivated
        // here, and the event is left as it is so that the owner — which is the
        // only party that knows whether the surface may close — decides. Because
        // only the topmost trap reaches this line, Escape closes a stacked dialog
        // and leaves the modal beneath it open (frame 105).
        latestOptionsRef.current.onEscape?.();
        return;
      }

      if (event.key !== KEY_TAB) {
        return;
      }

      const tabbables = collectTabbables(trap.container);
      const first = tabbables[0];
      const last = tabbables.at(-1);
      // Undefined on both counts means the container holds nothing tabbable. The
      // key is then left entirely alone, and the recovery listener below is what
      // brings focus back when the platform moves it out of the surface.
      if (first === undefined || last === undefined) {
        return;
      }

      // `preventDefault` is called in exactly two situations and in no other, so
      // that ordinary traversal between the elements inside the overlay stays
      // native — including whatever ordering the platform applies that this hook
      // never has to know about.
      const focused = document.activeElement;
      if (event.shiftKey) {
        if (focused === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (focused === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent): void => {
      if (!isTopmostTrap(trap) || recovering) {
        return;
      }
      const arrived = event.target;
      if (arrived instanceof Node && trap.container.contains(arrived)) {
        return;
      }
      recovering = true;
      try {
        focusFirstTabbableIn(trap.container);
      } finally {
        recovering = false;
      }
    };

    // Bound to the document rather than to the container, because focus that has
    // already escaped is precisely the case worth catching and a listener on the
    // container would never see it. `focusin` bubbles, which is why it is the
    // event used here and `focus` is not.
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    // Last, so that the trap is fully armed before anything moves. The focus this
    // sets lands inside the container, so the recovery listener sees it and
    // returns immediately.
    focusInitialElement(container, latest.initialFocusRef?.current ?? null);

    return () => {
      // Unconditional, and in this order.
      //
      // The listeners go first so that nothing this cleanup does can be observed
      // by the trap that is being dismantled. The record is released before focus
      // is restored, so that by the time focus moves, the enclosing trap is
      // already topmost — which is what lets a stacked dialog hand focus back to
      // the control inside the modal beneath it without the modal's own recovery
      // treating that as an escape.
      //
      // Nothing here is conditional on `active`, so an unmount while the trap is
      // still open releases it just the same. A leaked record would convince every
      // later trap that it is not topmost and would break containment for the rest
      // of the session.
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      releaseTrap(trap);
      restoreFocusFor(trap);
    };
  }, [active, container]);

  return {
    containerRef,
    // Derived rather than held in state. The trap engages exactly when the owner
    // asks for it and the element it is containing exists, and both of those are
    // already known during render — so a second state value would buy nothing but
    // an extra render. In an environment with no document the ref callback never
    // runs, the container stays empty, and this reports `false` on its own.
    isActive: active && container !== null,
    focusFirst,
  };
}
