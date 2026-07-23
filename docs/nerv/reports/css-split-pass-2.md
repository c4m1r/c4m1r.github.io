# CSS split pass 2

## Moved to markdown
- Created `src/styles/markdown/markdown.css` and `src/styles/markdown/index.css`.
- Moved the top-level `.prose`, `.markdown-body`, `.prose-content`, markdown `pre/code/img/table`, and rendered markdown heading/list/blockquote/table/image typography selectors out of `src/index.css`.
- Kept markdown selectors scoped to `.prose` and `.markdown-body` only.

## Moved to site
- Created `src/styles/site/site.css` and `src/styles/site/index.css`.
- Moved the scoped visual-polish Hero selectors (`.site-hero`, `.site-hero-title`, `.site-hero-subtitle`), Hero focus-visible styling, theme-scoped Hero overlays, footer gradient glow selectors, and `pcbSignalWave` keyframes/reduced-motion guard out of `src/index.css`.

## Left in index.css
- Global Tailwind directives, design tokens, theme variables, base `html/body`, global `code` font, shared glass/neumorphic/plastic/metal utilities, weather utilities, and broad theme utility overrides remain in `src/index.css`.
- Global `html/body` overflow guard and `.glass/.neu` focus-visible safeguards remain in `src/index.css` because they are not markdown-only or strictly site-only.
- OS CSS was not touched in this pass by design.

## Cascade order
- `src/index.css` imports `styles/markdown/index.css` and `styles/site/index.css` before the Tailwind layer directives, then `src/main.tsx` imports `themes/index.css` after `index.css`.
- This keeps all custom CSS in the same Tailwind processing context, preserves base/theme token ordering, and keeps existing theme/OS stylesheet aggregation last.

## Risks
- Visual smoke is recommended for article/wiki markdown, ContentReader/MarkdownViewer typography, Hero theme overlays, footer gradient glow, and mobile overflow.
- No visual redesign, media optimization, OS CSS split, titlebar/window CSS rewrite, or app-specific CSS move was performed.
