// Ambient types for CSS Module stylesheets.
//
// Every contract module in this package keeps its styling in a co-located `*.module.css` file
// and imports the generated class-name map from it. TypeScript cannot resolve that import on
// its own — a stylesheet is not a TypeScript module — so without this declaration the compiler
// reports `TS2307: Cannot find module './X.module.css' or its corresponding type declarations`
// and every component in the library fails to type-check.
//
// A bundler would normally supply these types. This package deliberately declares no Vite
// dependency: it ships as source through its own barrel and leaves bundling to the application
// that consumes it, so `vite/client` is out of scope here and no ambient stylesheet types
// arrive from anywhere else. This file is their only source.
//
// Nothing has to register it. The `include` in this package's `tsconfig.json` lists
// `src/**/*.d.ts` beside the `.ts` and `.tsx` globs, and that entry alone enrols this
// declaration in the type check — no `types` array entry, no triple-slash reference, no import.
//
// Extending this declaration is also the only sanctioned repair for a stylesheet type error.
// Silencing the call site is not: an inline suppression directive, a whole-file check-disable,
// or relaxing the compiler to admit plain JavaScript each conceal the error instead of typing
// the import, and each gives up the guarantee that a mistyped stylesheet path fails the build.
//
// The pattern stays narrow on purpose — `*.module.css` and nothing else. The package's four
// global stylesheets reach the application through the enumerated stylesheet entries in its
// `package.json` rather than through a TypeScript import, and icons are authored as components
// rather than imported as image assets. A wider pattern such as `*.css`, `*.svg` or `*.png`
// would type an import that should never appear, turning a real mistake into a silent success.

// What this means for component authors, verified against this repository's own compiler
// settings. The map is a string index signature, and the shared configuration enables two
// checks that together decide how it is read:
//   - `noUncheckedIndexedAccess` types every lookup as `string | undefined`, never `string`;
//     assigning one to a `string` is a `TS2322`.
//   - `noPropertyAccessFromIndexSignature` requires bracket access, so `styles['root']` is
//     correct and `styles.root` is a `TS4111`.
// Read a class as `styles['root']` and either pass it straight to `className`, which accepts
// `string | undefined`, or narrow it when composing several:
//   [styles['root'], isActive ? styles['active'] : undefined]
//     .filter((c): c is string => typeof c === 'string')
//     .join(' ')
// A non-null assertion is not the answer — it asserts a guarantee this type cannot make and
// hides the genuine error it exists to surface: a class the stylesheet does not define.

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
