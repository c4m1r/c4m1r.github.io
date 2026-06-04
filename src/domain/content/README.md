# Domain Content Layer

Папка `src/domain/content/` предназначена для базовых типов и утилит работы с контентом:
- `types.ts` — общие типы контента (`ContentKind`, `BaseContentItem` и т.д.).
- `frontmatter.ts` — чистые функции для парсинга YAML frontmatter.
- `markdown.ts` — чистые хелперы для рендеринга и обработки markdown.
- `contentGraph.ts` — граф связей между материалами.
- `contentRegistry.ts` — реестр загруженных материалов.
