/**
 * Reduced-motion preference detection, implemented once for the whole component
 * library.
 *
 * WHY THIS FILE IS AUTHORED RATHER THAN TRANSCRIBED
 *
 * The read-only workflow catalog specifies no motion behaviour at all. That is a
 * measured statement rather than an impression: across the master index, the
 * product-overview document and the four Phase-1 area documents, the strings
 * `prefers-reduced-motion`, `reduced motion`, `live region` and `role=` occur
 * zero times, and no motion-preference vocabulary of any kind appears anywhere
 * in the twenty-five catalog documents. The one occurrence of "animated" in the
 * component inventory names an animated-image tab in the emoji picker — a
 * content type, not a transition — and every occurrence of "transition" refers
 * to a move between two surfaces or two states, never to CSS motion.
 *
 * The reason is structural, and the catalog says so itself: its section on the
 * states the corpus does not show opens by noting that each listed state is one
 * "a build will plausibly need and the corpus does not evidence", and that none
 * is described because "describing one would be invention". A static capture
 * cannot evidence timing, a transition, or a user preference. Motion is not even
 * among the nine gaps that section enumerates, which places this behaviour on
 * the "corpus silent and no marker exists" branch of the project rule governing
 * uncertainty: uncertainty is never permission to omit, so the mechanism ships,
 * and the choice is deliberate and recorded rather than improvised.
 *
 * THE CHOICE THAT WAS MADE
 *
 * The smallest coherent behaviour consistent with adjacent evidenced behaviour
 * is to report the preference faithfully wherever the platform can answer, and
 * to treat motion as permitted wherever it cannot. Defaulting the other way
 * would suppress animation for every visitor whose browser predates the media
 * feature, and would silently disable motion throughout the component test
 * suite — turning an unreadable preference into a product decision nobody made.
 * `REDUCED_MOTION_FALLBACK` therefore resolves to permitting motion, and the
 * record that settles it is `docs/decisions/gap-register.md`.
 *
 * Callers that need the opposite bias pass their own `fallback` instead of
 * reimplementing the detection. That option exists precisely so that no
 * consumer ever has a reason to write its own `matchMedia` call: this module is
 * the single implementation of motion-preference detection in the repository,
 * and a local equivalent inside a contract directory is the same defect as
 * forking a shared component.
 *
 * WHAT THIS HOOK DELIBERATELY DOES NOT DO
 *
 *   - It does not decide anything. It reports a preference; whether a given
 *     transition is skipped, shortened or kept belongs to the component that
 *     owns the transition. Nothing here debounces, throttles or animates.
 *   - It carries no authorization meaning. No role, permission, capability,
 *     session, workspace or actor identifier is accepted, returned or branched
 *     on, and there is deliberately no capability-shaped hook in this package.
 *     A rendering preference is not evidence of permission, and permission is
 *     decided on the server against the acting session and the target object.
 *   - It touches the DOM only inside a function body. The package manifest
 *     declares `sideEffects: ["**\/*.css"]`, so every module here must be safe
 *     to import and safe to drop. A `matchMedia` call at module scope would
 *     break both, and would throw on import wherever there is no document.
 */
import { useCallback, useSyncExternalStore } from 'react';

/**
 * The media query this module reports on.
 *
 * Exported so that a consumer, a test double or a future tool can reference the
 * query rather than restate it. A configuration value written twice has two
 * sources of truth, so the string appears here and at no point of use.
 */
export const REDUCED_MOTION_QUERY: string = '(prefers-reduced-motion: reduce)';

/**
 * What the hook reports when the preference cannot be read at all — because
 * there is no window, because the platform has no `matchMedia`, or because the
 * media query list it returns cannot answer.
 *
 * `false` means "motion is permitted". See the reasoning in this file's header
 * and the recorded decision in `docs/decisions/gap-register.md`. Annotated as
 * `boolean` rather than left to infer the literal type `false`, so that a
 * consumer comparing against it keeps compiling if the chosen default ever
 * changes.
 */
export const REDUCED_MOTION_FALLBACK: boolean = false;

/**
 * Options for {@link useReducedMotion}.
 *
 * The workspace compiles with `exactOptionalPropertyTypes`, so `fallback` is
 * either present with a boolean or absent entirely — omit the property rather
 * than passing an explicit `undefined`.
 */
export type UseReducedMotionOptions = {
  /**
   * What to report when the preference cannot be read.
   *
   * Defaults to {@link REDUCED_MOTION_FALLBACK}. A surface whose animation is
   * substantial enough that erring the other way is kinder can pass `true`
   * here; that is the supported way to vary the behaviour, and it is why this
   * is an option rather than a hardcoded assumption.
   */
  readonly fallback?: boolean;
};

/** The listener shape this module subscribes with. The event argument is unused. */
type MediaQueryChangeListener = (event: MediaQueryListEvent) => void;

/**
 * The part of a media query list this module actually uses, with every member
 * optional.
 *
 * Three things make this local interface worth its lines rather than using the
 * platform's `MediaQueryList` directly.
 *
 *   1. It is honest about the runtime. The DOM type declares `matches` and both
 *      listener pairs as always present, which is false in the environments this
 *      hook has to survive — a test double supplying only what it needs, or an
 *      older browser carrying only the pre-2019 pair. Typing them as optional
 *      makes every guard below genuinely necessary, which matters because the
 *      lint configuration treats a provably redundant condition as an error.
 *   2. It keeps the deprecated pair at arm's length. `addListener` and
 *      `removeListener` are marked deprecated in the platform types and are
 *      declared there returning `any`; describing them locally keeps both the
 *      deprecation and the `any` out of this module.
 *   3. It is the whole mocking surface. A consumer's test can satisfy this with
 *      an object literal.
 */
interface MediaQueryListLike {
  readonly matches?: boolean;
  addEventListener?(type: 'change', listener: MediaQueryChangeListener): void;
  removeEventListener?(type: 'change', listener: MediaQueryChangeListener): void;
  addListener?(listener: MediaQueryChangeListener): void;
  removeListener?(listener: MediaQueryChangeListener): void;
}

/**
 * The cleanup returned when nothing was subscribed to.
 *
 * A module-level declaration rather than an inline arrow, so that every
 * unsubscribed path returns the same function and none of them returns
 * `undefined` — a caller must always receive something safe to call.
 */
function noop(): void {
  // Intentionally empty: no listener was attached, so none needs removing.
}

/** The shape of `window.matchMedia`, narrowed to what this module needs back. */
type MatchMediaFactory = (query: string) => MediaQueryListLike;

/**
 * The one part of the global object this module reads.
 *
 * Declared here rather than reached through the platform's own `Window` type,
 * and declared as an optional function-valued *property* rather than as a
 * method. Both choices are deliberate and both are about being honest.
 *
 * Optional, because `matchMedia` is genuinely absent in some hosts — the
 * component test runner's DOM implementation among them — while the platform
 * types insist it is always there. A property rather than a method, because this
 * module needs to hold the reference in order to compare it, and holding a
 * *method* off an object is the shape of the unbound-receiver mistake: it says
 * "I may call this later without its object", which is exactly what must not
 * happen here. A function-valued property says what is true instead — the
 * reference is compared, never invoked on its own, and the call below goes
 * through this same object, which *is* `window`, so the receiver the platform
 * requires is preserved.
 */
interface MatchMediaHost {
  matchMedia?: MatchMediaFactory;
}

/**
 * The memoised list, and the `matchMedia` function it was produced by.
 *
 * Both start empty and are only ever assigned inside {@link resolveMediaQueryList},
 * so the module body itself touches no DOM and stays safe to import and to drop.
 *
 * WHY THE FACTORY IS PART OF THE KEY. One list must be shared between the
 * subscription and the read, because a listener attached to one list says
 * nothing about a different list's `matches`. Caching alone would achieve that
 * and then introduce a worse problem: a cached list outlives the `matchMedia`
 * double a component test installs and then removes, so one test's environment
 * leaks into the next and a stub is answered from a list the stub never made.
 * Keying on the function's identity closes that: replacing or removing
 * `window.matchMedia` changes what is found here, the memo is rebuilt or
 * dropped, and the cache can never be older than the platform it came from.
 */
let memoisedFactory: MatchMediaFactory | null = null;
let memoisedList: MediaQueryListLike | null = null;

/** Drop the memo, so the next resolution starts from whatever is there then. */
function forgetMemoisedList(): void {
  memoisedFactory = null;
  memoisedList = null;
}

/**
 * Resolve the media query list, or `null` where the preference is unreadable.
 *
 * This is the only function in the module that touches the DOM, and the order of
 * its two guards is load-bearing: reading `window.matchMedia` before confirming
 * `window` exists would throw in a server render instead of degrading.
 *
 * One list is returned for as long as the platform's `matchMedia` stays the same
 * function, which is what lets {@link subscribe} listen to the very object
 * {@link readReducedMotionPreference} reads. Resolving fresh each time would
 * instead subscribe to one list and read another, and the two only agree because
 * a real browser keeps them in step — a test double holding a list and flipping
 * `matches` on it would report the stale value, which is the single most common
 * way this hook gets exercised from a component test.
 */
function resolveMediaQueryList(): MediaQueryListLike | null {
  // No document: a server render, or any non-DOM runtime.
  if (typeof window === 'undefined') {
    forgetMemoisedList();
    return null;
  }

  const host: MatchMediaHost = window;

  // No media-query support. This is the guard that keeps the whole component
  // test suite green: the runner's DOM implementation does not provide
  // `matchMedia`, so without it every mounted consumer would throw on mount.
  if (typeof host.matchMedia !== 'function') {
    forgetMemoisedList();
    return null;
  }

  if (memoisedFactory === host.matchMedia && memoisedList !== null) {
    return memoisedList;
  }

  memoisedFactory = host.matchMedia;
  memoisedList = host.matchMedia(REDUCED_MOTION_QUERY);

  return memoisedList;
}

/**
 * Read the current preference, falling back where it cannot be answered.
 *
 * `matches` is treated as possibly absent for the same reason the listener pairs
 * are: a partial test double should degrade to the fallback rather than surface
 * `undefined` through a signature that promises a boolean.
 */
function readReducedMotionPreference(fallback: boolean): boolean {
  const list = resolveMediaQueryList();

  if (list === null) {
    return fallback;
  }

  return list.matches ?? fallback;
}

/**
 * Subscribe to preference changes and return a cleanup that removes exactly the
 * listener it added.
 *
 * Declared at module level, as a function declaration, because
 * `useSyncExternalStore` tears down and re-establishes its subscription whenever
 * this argument changes identity. A constant identity means one subscription per
 * mounted consumer for the lifetime of that consumer.
 *
 * Both the resolved list and the listener are captured in the closure the
 * cleanup returns, so unsubscription always targets the same object the
 * subscription touched even if the platform's `matchMedia` is replaced in
 * between. No listener can be orphaned by an unmount.
 */
function subscribe(onStoreChange: () => void): () => void {
  const list = resolveMediaQueryList();

  if (list === null) {
    return noop;
  }

  // A dedicated wrapper rather than passing `onStoreChange` straight through:
  // it keeps React's callback from receiving a DOM event it has no contract
  // for, and it makes the removal target unambiguous at both call sites.
  const listener: MediaQueryChangeListener = () => {
    onStoreChange();
  };

  // The standard event-target pair, preferred wherever it exists.
  if (typeof list.addEventListener === 'function') {
    list.addEventListener('change', listener);

    return () => {
      if (typeof list.removeEventListener === 'function') {
        list.removeEventListener('change', listener);
      }
    };
  }

  // The pre-2019 pair, for a platform or a double that offers only this one.
  if (typeof list.addListener === 'function') {
    list.addListener(listener);

    return () => {
      if (typeof list.removeListener === 'function') {
        list.removeListener(listener);
      }
    };
  }

  // A list that can be read but not watched: report the current value and
  // subscribe to nothing rather than failing.
  return noop;
}

/**
 * Report whether the viewer has asked for reduced motion.
 *
 * Returns `true` when the platform reports a reduced-motion preference, `false`
 * when it reports none, and the resolved fallback when it cannot report at all.
 * The value updates when the preference changes, without a remount.
 *
 * Built on `useSyncExternalStore` deliberately. It is the stable React 18 API
 * for subscribing to an external, mutable browser source: it is tearing-safe,
 * it has a defined server-render path, and it keeps the mutable read out of the
 * render body, which a hand-rolled state-and-effect pair does not.
 *
 * @param options - Optional {@link UseReducedMotionOptions}. Omit to accept
 *   {@link REDUCED_MOTION_FALLBACK}.
 * @returns `true` if motion should be reduced, otherwise `false`.
 *
 * @example
 * ```tsx
 * const reduceMotion = useReducedMotion();
 * <div className={reduceMotion ? styles.static : styles.animated} />;
 * ```
 *
 * @example
 * ```tsx
 * // A surface whose animation is substantial enough to skip when unsure.
 * const reduceMotion = useReducedMotion({ fallback: true });
 * ```
 */
export function useReducedMotion(options?: UseReducedMotionOptions): boolean {
  const fallback = options?.fallback ?? REDUCED_MOTION_FALLBACK;

  // Both getters are keyed on the resolved fallback rather than on the options
  // object, so an inline object literal at the call site does not churn them.
  const getSnapshot = useCallback((): boolean => readReducedMotionPreference(fallback), [fallback]);

  // On the server there is no preference to read, so the fallback *is* the
  // snapshot. Supplied explicitly so a server render resolves instead of
  // throwing, and so it agrees with the client's first read in that same case.
  const getServerSnapshot = useCallback((): boolean => fallback, [fallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
