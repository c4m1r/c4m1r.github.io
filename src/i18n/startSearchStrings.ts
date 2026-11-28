import type { Language } from './translations';

/**
 * Strings of the Start menu search results. Every key has all nine interface languages;
 * the lookup falls back to English.
 */
const START_SEARCH_STRINGS = {
  programs: {
    en: 'Programs', ru: 'Программы', fr: 'Programmes', es: 'Programas', zh: '程序',
    ja: 'プログラム', ko: '프로그램', be: 'Праграмы', kk: 'Бағдарламалар',
  },
  files: {
    en: 'Files', ru: 'Файлы', fr: 'Fichiers', es: 'Archivos', zh: '文件',
    ja: 'ファイル', ko: '파일', be: 'Файлы', kk: 'Файлдар',
  },
  findPlaceholder: {
    en: 'Search files and folders', ru: 'Найти файлы и папки', fr: 'Rechercher des fichiers et dossiers', es: 'Buscar archivos y carpetas', zh: '搜索文件和文件夹',
    ja: 'ファイルとフォルダーを検索', ko: '파일 및 폴더 검색', be: 'Пошук файлаў і папак', kk: 'Файлдар мен қалталарды іздеу',
  },
  noResults: {
    en: 'No results', ru: 'Ничего не найдено', fr: 'Aucun résultat', es: 'Sin resultados', zh: '没有结果',
    ja: '結果がありません', ko: '결과 없음', be: 'Нічога не знойдзена', kk: 'Нәтиже табылмады',
  },
} as const;

export type StartSearchStringKey = keyof typeof START_SEARCH_STRINGS;

export function startSearchText(language: Language | string, key: StartSearchStringKey): string {
  const entry: Record<string, string> = START_SEARCH_STRINGS[key];
  const code = language.split('-')[0];
  return entry[code] ?? entry.en;
}
