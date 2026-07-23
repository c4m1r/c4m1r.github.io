export function stripMarkdown(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[[^\]]+]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_`~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function markdownToHtml(md: string): string {
  const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Сначала обрабатываем fenced code blocks (```), чтобы защитить их от дальнейшей обработки
  const codeBlockPlaceholders: string[] = [];
  const withCodeBlocks = md.replace(/```([a-z]*)\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const safe = escapeHtml(code.trim());
    const placeholder = `__CODE_BLOCK_${codeBlockPlaceholders.length}__`;
    const languageClass = lang ? ` language-${lang}` : '';
    codeBlockPlaceholders.push(
      `<pre class="bg-muted rounded-xl p-4 overflow-auto text-sm my-4"><code class="${languageClass}">${safe}</code></pre>`
    );
    return placeholder;
  });

  // Обрабатываем строки
  const lines = withCodeBlocks
    .split('\n')
    .map((line) => {
      // Проверяем заголовки (от большего к меньшему количеству #)
      // Все заголовки с 5+ # обрабатываем как h5
      if (/^#{6,}\s+/.test(line)) {
        return `<h5 class="text-base font-semibold mb-2 mt-4">${line.replace(/^#{6,}\s+/, '').trim()}</h5>`;
      }
      if (/^#{5}\s+/.test(line)) {
        return `<h5 class="text-base font-semibold mb-2 mt-4">${line.replace(/^#{5}\s+/, '').trim()}</h5>`;
      }
      if (/^#{4}\s+/.test(line)) {
        return `<h4 class="text-lg font-semibold mb-2 mt-5">${line.replace(/^#{4}\s+/, '').trim()}</h4>`;
      }
      if (/^#{3}\s+/.test(line)) {
        return `<h3 class="text-xl font-semibold mb-3 mt-6">${line.replace(/^#{3}\s+/, '').trim()}</h3>`;
      }
      if (/^#{2}\s+/.test(line)) {
        return `<h2 class="text-2xl font-bold mb-4 mt-8">${line.replace(/^#{2}\s+/, '').trim()}</h2>`;
      }
      if (/^#\s+/.test(line)) {
        return `<h1 class="text-3xl font-bold mb-4 mt-10">${line.replace(/^#\s+/, '').trim()}</h1>`;
      }
      
      // Списки
      if (/^\s*[-*+]\s+/.test(line)) {
        return `<li class="mb-2">${line.replace(/^\s*[-*+]\s+/, '').trim()}</li>`;
      }
      
      // Пустые строки
      if (line.trim() === '') {
        return '<br/>';
      }
      
      // Placeholders для code blocks
      if (line.includes('__CODE_BLOCK_')) {
        return line;
      }
      
      return `<p class="mb-4 leading-relaxed">${line}</p>`;
    })
    .join('\n');

  // Обрабатываем inline элементы
  let processed = lines
    // Bold **text** или __text__
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>')
    // Italic *text* или _text_ (но не внутри слов)
    .replace(/\*([^*\n]+)\*/g, '<em class="italic">$1</em>')
    .replace(/\b_([^_\n]+)_\b/g, '<em class="italic">$1</em>')
    // Inline code `code`
    .replace(/`([^`\n]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">$1</code>')
    // Images and lightweight video previews
    .replace(/!\[([^\]]*)]\(([^)]+)\)/g, (_match, alt, url) => {
      if (/\.(webm|mp4)(?:[?#].*)?$/i.test(url)) {
        return `<video aria-label="${alt}" src="${url}" class="my-4 rounded-xl max-w-full" autoplay loop muted playsinline></video>`;
      }
      return `<img alt="${alt}" src="${url}" class="my-4 rounded-xl max-w-full" loading="lazy" />`;
    })
    // Links - обрабатываем внутренние и внешние по-разному
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, text, url) => {
      // Внешние ссылки
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        return `<a class="text-primary hover:underline" href="${url}" target="_blank" rel="noreferrer">${text}</a>`;
      }
      // Внутренние ссылки - добавляем data-атрибут для обработки кликов
      return `<a class="text-primary hover:underline cursor-pointer" data-wiki-link="${url}">${text}</a>`;
    });

  // Группируем списки
  processed = processed.replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="list-disc list-inside mb-4 ml-4">$1</ul>');
  
  // Восстанавливаем code blocks
  codeBlockPlaceholders.forEach((block, index) => {
    processed = processed.replace(`__CODE_BLOCK_${index}__`, block);
  });

  return processed;
}
