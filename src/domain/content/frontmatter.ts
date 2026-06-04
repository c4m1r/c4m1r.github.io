/**
 * Извлекает контент для конкретного языка из языковых блоков
 */
export function parseLanguageBlocks(content: string, language: string): string {
  // Паттерн для поиска языкового блока: <!-- lang:CODE -->content<!-- /lang:CODE -->
  const langPattern = new RegExp(
    `<!--\\s*lang:${language}\\s*-->([\\s\\S]*?)<!--\\s*/lang:${language}\\s*-->`,
    'i'
  );
  const match = content.match(langPattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Fallback на английский, если запрошенный язык не найден
  if (language !== 'en') {
    const enPattern = /<!--\s*lang:en\s*-->([\s\S]*?)<!--\s*\/lang:en\s*-->/i;
    const enMatch = content.match(enPattern);
    if (enMatch && enMatch[1]) {
      return enMatch[1].trim();
    }
  }
  
  // Если языковых блоков нет, возвращаем весь контент
  return content;
}

/**
 * Парсит frontmatter из markdown и извлекает контент для языка
 */
export function parseFrontmatter(content: string, language?: string): { metadata: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    const body = language ? parseLanguageBlocks(content, language) : content;
    return { metadata: {}, body };
  }
  
  const [, frontmatter, rawBody] = match;
  const metadata: Record<string, any> = {};
  
  // Улучшенный парсинг YAML frontmatter
  const lines = frontmatter.split('\n');
  let currentKey: string | null = null;
  let currentArray: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Если строка начинается с дефиса, это элемент массива
    if (trimmedLine.startsWith('- ')) {
      if (currentKey) {
        const value = trimmedLine.substring(2).trim();
        currentArray.push(value);
      }
      continue;
    }
    
    // Если есть накопленный массив, сохраняем его
    if (currentKey && currentArray.length > 0) {
      metadata[currentKey] = currentArray;
      currentArray = [];
      currentKey = null;
    }
    
    // Обрабатываем обычную пару ключ-значение
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value: any = line.slice(colonIndex + 1).trim();
    
    // Если значение пустое, это может быть начало массива
    if (!value) {
      currentKey = key;
      continue;
    }
    
    // Парсим inline массивы [value1, value2]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
      metadata[key] = value;
      continue;
    }
    
    // Удаляем кавычки
    if (typeof value === 'string' && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1);
    }
    
    metadata[key] = value;
  }
  
  // Сохраняем последний массив, если есть
  if (currentKey && currentArray.length > 0) {
    metadata[currentKey] = currentArray;
  }
  
  // Обрабатываем переводы заголовков (title_en, title_ru и т.д.)
  if (language && metadata[`title_${language}`]) {
    metadata.title = metadata[`title_${language}`];
  } else if (language && language !== 'en' && metadata.title_en) {
    // Fallback на английский заголовок
    metadata.title = metadata.title_en;
  }
  
  // Извлекаем контент для конкретного языка, если указан
  const body = language ? parseLanguageBlocks(rawBody, language) : rawBody;
  
  return { metadata, body };
}
