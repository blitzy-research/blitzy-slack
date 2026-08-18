/**
 * The prop contract for every glyph in this package's icon set.
 *
 * This module is the icon set's single vocabulary. The shared `Icon` wrapper and
 * every glyph module beside it take their prop types from here, so a glyph
 * cannot acquire a bespoke prop set and a consuming component cannot re-declare
 * an icon prop type of its own. One contract, declared once, imported
 * everywhere it is needed.
 *
 * It holds types only — no runtime value, no constant, no default export — so
 * the compiled output is empty, importing it costs nothing at run time, and it
 * can never introduce a side effect.
 *
 * Glyph geometry in this folder is authored originally and drawn on one shared
 * coordinate grid; nothing here is traced, extracted or reconstructed from
 * reference imagery. Colour is not part of this contract at all: a glyph paints
 * itself from `currentColor` and therefore inherits the text colour of whatever
 * region it is placed in, which is why no colour value appears in this folder.
 */

import type { ReactElement, ReactNode } from 'react';

/**
 * The size vocabulary a glyph may be rendered at.
 *
 * Each member names an `--icon-size-*` custom property owned by
 * `packages/ui/src/styles/tokens.ts`: `xs` resolves `--icon-size-xs`, `sm`
 * resolves `--icon-size-sm`, `md` resolves `--icon-size-md` and `lg` resolves
 * `--icon-size-lg`. `Icon.module.css` is the only place a member is turned into
 * a rendered box.
 *
 * That indirection is the point. This file declares the *names*; the token
 * module owns the *values*, and those values are derived by measurement of the
 * icon bounding box rather than chosen here. The vocabulary is therefore usable
 * before a single value has been measured, and a measurement run changes what a
 * glyph looks like without changing one line of this contract.
 *
 * This union and that token set must stay in step. If the token module publishes
 * a different suffix set, this union changes to match it — never the reverse —
 * because the tokens are the contract.
 *
 * No length appears anywhere in this file — no pixel value, no rem value, no
 * numeric size of any kind. A glyph is sized by passing a member of this union;
 * a length written at a call site, or in a consumer's stylesheet, is a defect
 * rather than an alternative.
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * The public prop contract every glyph in this package accepts.
 *
 * Three optional members, and deliberately nothing else. The surface is narrow
 * on purpose: every component in this library that renders a glyph renders it
 * the same way, so there is exactly one thing to learn, one thing to test and
 * one thing to change. A wide surface is how thirty-eight component modules
 * each end up inventing a different way to draw the same shape.
 *
 * Consequently this interface does not extend `SVGProps<SVGSVGElement>`, and
 * carries no `style`, `onClick`, `title`, `role`, `aria-*` or `data-*` member.
 * A glyph is a shape, not a control: where something must be clickable or
 * focusable, the enclosing component supplies the interactive element and the
 * glyph goes inside it, which is also where an accessible name and a keyboard
 * affordance belong.
 *
 * It carries nothing that could be mistaken for an authorization outcome
 * either — no `disabled`, `permitted` or `gated` member. Whether an action is
 * allowed is decided on the server against the acting session and the specific
 * target object; what a glyph looks like is never evidence of that decision, so
 * this contract offers a consumer nothing to confuse with one.
 *
 * If a consumer genuinely needs another prop, this interface is extended here,
 * once, and the wrapper's tests are updated with it. Working around the gap at
 * the call site — a cast, a spread onto the returned element, a second props
 * type declared locally — reintroduces exactly the drift the narrow surface
 * exists to prevent.
 */
export interface IconProps {
  /**
   * The rendered size of the glyph, named as a token rather than a length.
   *
   * `Icon` applies `'md'` when this is omitted, so a caller states a size only
   * where it differs from the ordinary one.
   */
  size?: IconSize;

  /**
   * The glyph's accessible name.
   *
   * Omit it for a **decorative** glyph — one whose meaning is already carried by
   * adjacent text, such as the icon beside a visible label. The wrapper then
   * hides the glyph from assistive technology entirely, so a screen reader does
   * not announce a second time what the label beside it has already said.
   *
   * Supply it for a **meaningful** glyph — one that is the sole carrier of its
   * meaning, such as an icon-only control or a status indicator. The wrapper
   * then exposes the glyph with an image role and this string as its name.
   *
   * The value is always supplied by the consuming component from the authored
   * accessibility copy in `@relay/shared`. No copy is authored in this folder,
   * and a string literal passed here at a call site is a defect for the same
   * reason: user-facing wording has one home, and a translation or a wording
   * correction has to be able to reach every occurrence of it.
   */
  label?: string;

  /**
   * An additional class name, from the consuming component's own CSS Module.
   *
   * This exists so a consumer can give a glyph positioning within its own
   * layout, or a colour context — a rule setting `color`, which the glyph then
   * inherits through `currentColor`.
   *
   * It is not a sizing escape hatch. A class that sets a width or a height in
   * absolute units defeats the token scale and puts a second, invisible source
   * of truth beside it; sizing goes through `size`, which resolves the token.
   */
  className?: string;
}

/**
 * A glyph itself, as a value rather than as a name.
 *
 * This is what lets a component hold glyphs in a data structure instead of
 * importing each one and branching on which to render. `Rail` keeps a
 * `Record<Destination, IconComponent>` mapping each destination to its glyph,
 * `TopBar` keeps the same kind of map for its history and help controls, and
 * `FormattingToolbar` and `ComposerActionRow` each keep an ordered list of
 * controls in which the glyph is one field of the entry.
 *
 * Those last two are separate contracts with different control sets and
 * different groupings — nine controls in five groups against seven in three —
 * and this type is part of what keeps them separable: each owns its own ordered
 * list, so neither can be rendered from the other's.
 *
 * Because every glyph module conforms to it, a component that holds an
 * `IconComponent` never needs to know which glyph it has.
 */
export type IconComponent = (props: IconProps) => ReactElement;

/**
 * The wrapper's own props: the public contract plus the two things only the
 * wrapper is given.
 *
 * `GlyphProps` is consumed by `Icon.tsx` and by nothing else. It is not part of
 * this design system's public vocabulary — a consuming component never
 * constructs one, and never needs to — even though the package barrel
 * re-exports the type so that the glyph modules in this folder, which do
 * construct one, can be typed without reaching past a package entry point.
 */
export interface GlyphProps extends IconProps {
  /**
   * A stable, function-derived identifier for the glyph being drawn.
   *
   * The wrapper renders it as a `data-icon` attribute, which gives the component
   * tests under `packages/ui/src/components` a way to assert *which* glyph
   * rendered rather than merely that some shape did — the difference between a
   * test that catches a wrong glyph and one that does not.
   *
   * Names describe function, never any product's asset name.
   */
  name: string;

  /**
   * The glyph geometry, drawn on the shared `0 0 24 24` grid.
   *
   * Every glyph in this folder is authored on that one grid, in unitless user
   * units rather than in any absolute length, which is what allows a single
   * wrapper to scale all of them from one token and what keeps their optical
   * weights consistent with each other. The wrapper supplies the enclosing
   * element and its view box; a glyph contributes only the shapes.
   */
  children: ReactNode;
}
