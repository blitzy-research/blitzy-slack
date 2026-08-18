/**
 * Auto-discovery shim. The fast test projects are declared in exactly one
 * place: `vitest.workspace.ts`, next to this file.
 *
 * WHY THIS FILE STILL EXISTS
 * --------------------------
 * The pinned runner (4.1.10) searches for `vite.config.*` and `vitest.config.*`
 * and nothing else -- the standalone `*.workspace.*` manifest it once
 * discovered by name was removed from the runner. The project list is
 * nevertheless mandated to live at `vitest.workspace.ts`, and that file is
 * loaded explicitly by the workspace `test` script:
 *
 *     vitest run --config vitest.workspace.ts
 *
 * This shim exists so that the two routes cannot disagree. Anyone who runs the
 * runner without that flag -- a bare `vitest`, an editor integration, or a
 * `--project <name>` filter from inside a package -- lands here and gets the
 * same project list, because this file re-exports it rather than restating it.
 *
 * WHY IT IS A RE-EXPORT AND NOT A SECOND PROJECT LIST
 * --------------------------------------------------
 * It previously carried its own copy of the project list. Two lists in one
 * repository is a drift the moment one is edited and the other is not: the same
 * command reports different results depending on which file the runner happened
 * to load, and a project can be dropped from one list without a single check
 * turning red. Delegating means there is one definition, one set of project
 * names, and one set of include and exclude globs, whichever route is taken.
 *
 * There is deliberately nothing else here. Anything added to this file would be
 * a second source of truth again -- put it in `vitest.workspace.ts`, which is
 * where the project list, the coverage configuration and the reporters live.
 */
export { default } from './vitest.workspace';
