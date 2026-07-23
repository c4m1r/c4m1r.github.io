# CSS split plan

## Scope

This is an audit-only plan for reducing global CSS pressure. The pass does not rewrite the stylesheet architecture or change visuals.

## Target structure

```text
src/styles/
  site/
  markdown/
  effects/
  os/
    base/
    themes/
    apps/
```

## Proposed ownership

- `src/styles/site/`: portfolio site layout, site sections, navigation, footer, and content cards.
- `src/styles/markdown/`: markdown and reader typography shared by site and reader apps.
- `src/styles/effects/`: isolated visual effect styles such as ASCII Aurora.
- `src/styles/os/base/`: desktop runtime primitives, windows, taskbar, selection, menus.
- `src/styles/os/themes/`: XP/Win7/Ubuntu/WebOS visual theme wrappers and variables.
- `src/styles/os/apps/`: app-specific windows and controls that should not leak into the site shell.

## Scope audit findings

- `src/components/effects/AsciiAurora.css` is correctly component-scoped with `.ascii-aurora` selectors and no global `pre` rule.
- Current global stylesheet size is still high because site, markdown, OS, and app selectors are mixed across shared entries.
- OS selectors should remain guarded by wrappers such as `.os-winxp`, `.os-win7`, `.os-ubuntu`, or equivalent shell/theme roots before any large split.
- Any unscoped `button`, `input`, or `pre` rules should be reviewed before extraction because they can affect both BlogSite and OS app windows.
- Theme CSS should not own app-specific selectors long-term; app UI should move to `src/styles/os/apps/` or app-local CSS.

## Safe next steps

1. Inventory global element selectors and add shell/theme scopes before moving files.
2. Extract markdown typography into a dedicated markdown stylesheet used by ContentReader/MarkdownViewer.
3. Extract ASCII/effects styles into a single effects entrypoint if more effects are added.
4. Split OS theme variables from desktop runtime selectors only after a visual regression pass.

## Out of scope for this pass

- Rewriting `src/index.css` and theme CSS in bulk.
- Renaming theme classes.
- Changing visual density, colors, fonts, or OS layout behavior.
