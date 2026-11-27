import type { Language } from './translations';

/**
 * Edit-row labels of the Windows 95 Explorer toolbar (Cut, Copy, Paste, Undo, Delete, Properties).
 * Every key has all nine interface languages; the lookup falls back to English.
 */
const CLASSIC_EDIT_STRINGS = {
  cut: {
    en: 'Cut', ru: 'Вырезать', fr: 'Couper', es: 'Cortar', zh: '剪切',
    ja: '切り取り', ko: '잘라내기', be: 'Выразаць', kk: 'Кесу',
  },
  copy: {
    en: 'Copy', ru: 'Копировать', fr: 'Copier', es: 'Copiar', zh: '复制',
    ja: 'コピー', ko: '복사', be: 'Капіяваць', kk: 'Көшіру',
  },
  paste: {
    en: 'Paste', ru: 'Вставить', fr: 'Coller', es: 'Pegar', zh: '粘贴',
    ja: '貼り付け', ko: '붙여넣기', be: 'Уставіць', kk: 'Қою',
  },
  undo: {
    en: 'Undo', ru: 'Отменить', fr: 'Annuler', es: 'Deshacer', zh: '撤销',
    ja: '元に戻す', ko: '실행 취소', be: 'Адмяніць', kk: 'Болдырмау',
  },
  delete: {
    en: 'Delete', ru: 'Удалить', fr: 'Supprimer', es: 'Eliminar', zh: '删除',
    ja: '削除', ko: '삭제', be: 'Выдаліць', kk: 'Жою',
  },
  properties: {
    en: 'Properties', ru: 'Свойства', fr: 'Propriétés', es: 'Propiedades', zh: '属性',
    ja: 'プロパティ', ko: '속성', be: 'Уласцівасці', kk: 'Қасиеттері',
  },
} as const;

export type ClassicEditKey = keyof typeof CLASSIC_EDIT_STRINGS;

export function classicEditText(language: Language | string, key: ClassicEditKey): string {
  const entry = CLASSIC_EDIT_STRINGS[key];
  return (entry as Record<string, string>)[language] ?? entry.en;
}
