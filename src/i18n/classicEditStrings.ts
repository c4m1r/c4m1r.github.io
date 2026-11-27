import type { Language } from './translations';

/**
 * Explorer command labels shared by several skins: the Windows 95 edit row, the Windows 7 / Vista Organize
 * menu (Cut ... Close), the Vista taskbar preview close button. Every key has all nine interface languages;
 * the lookup falls back to English.
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
  organize: {
    en: 'Organize', ru: 'Упорядочить', fr: 'Organiser', es: 'Organizar', zh: '组织',
    ja: '整理', ko: '구성', be: 'Упарадкаваць', kk: 'Ұйымдастыру',
  },
  redo: {
    en: 'Redo', ru: 'Повторить', fr: 'Rétablir', es: 'Rehacer', zh: '重做',
    ja: 'やり直し', ko: '다시 실행', be: 'Паўтарыць', kk: 'Қайталау',
  },
  selectAll: {
    en: 'Select all', ru: 'Выделить все', fr: 'Tout sélectionner', es: 'Seleccionar todo', zh: '全选',
    ja: 'すべて選択', ko: '모두 선택', be: 'Выбраць усё', kk: 'Барлығын таңдау',
  },
  rename: {
    en: 'Rename', ru: 'Переименовать', fr: 'Renommer', es: 'Cambiar nombre', zh: '重命名',
    ja: '名前の変更', ko: '이름 바꾸기', be: 'Перайменаваць', kk: 'Атын өзгерту',
  },
  layout: {
    en: 'Layout', ru: 'Макет', fr: 'Disposition', es: 'Diseño', zh: '布局',
    ja: 'レイアウト', ko: '레이아웃', be: 'Макет', kk: 'Макет',
  },
  folderOptions: {
    en: 'Folder and search options', ru: 'Параметры папок и поиска', fr: 'Options des dossiers et de la recherche', es: 'Opciones de carpeta y de búsqueda', zh: '文件夹和搜索选项',
    ja: 'フォルダーと検索のオプション', ko: '폴더 및 검색 옵션', be: 'Параметры папак і пошуку', kk: 'Қалта және іздеу опциялары',
  },
  close: {
    en: 'Close', ru: 'Закрыть', fr: 'Fermer', es: 'Cerrar', zh: '关闭',
    ja: '閉じる', ko: '닫기', be: 'Зачыніць', kk: 'Жабу',
  },
} as const;

export type ClassicEditKey = keyof typeof CLASSIC_EDIT_STRINGS;

export function classicEditText(language: Language | string, key: ClassicEditKey): string {
  const entry = CLASSIC_EDIT_STRINGS[key];
  return (entry as Record<string, string>)[language] ?? entry.en;
}
