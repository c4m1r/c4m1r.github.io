/**
 * Universal desktop context menu.
 * Presentation is handled by the active OS-specific CSS layer.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../../contexts/useApp';
import type { Language } from '../../../i18n/translations';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export interface ContextMenuItem {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  separator?: boolean;
  icon?: string;
  submenu?: ContextMenuItem[];
}

type ContextMenuDictionary = Record<string, string>;

const CONTEXT_MENU_LABELS: Record<Language, ContextMenuDictionary> = {
  en: {},
  ru: {
    Open: 'Открыть',
    Cut: 'Вырезать',
    Copy: 'Копировать',
    'Create Shortcut': 'Создать ярлык',
    Delete: 'Удалить',
    Rename: 'Переименовать',
    Properties: 'Свойства',
    'Open With': 'Открыть с помощью',
    'Send To': 'Отправить',
    'Arrange Icons By': 'Упорядочить значки',
    Name: 'Имя',
    Size: 'Размер',
    Type: 'Тип',
    Modified: 'Изменен',
    'Auto Arrange': 'Автоматически',
    'Align to Grid': 'Выровнять по сетке',
    Refresh: 'Обновить',
    Paste: 'Вставить',
    'Paste Shortcut': 'Вставить ярлык',
    New: 'Создать',
    Folder: 'Папку',
    Shortcut: 'Ярлык',
    'Text Document': 'Текстовый документ',
    Toolbars: 'Панели',
    'Cascade Windows': 'Окна каскадом',
    'Tile Windows Horizontally': 'Окна сверху вниз',
    'Tile Windows Vertically': 'Окна слева направо',
    'Show the Desktop': 'Показать рабочий стол',
    'Task Manager': 'Диспетчер задач',
  },
  fr: {
    Open: 'Ouvrir',
    Cut: 'Couper',
    Copy: 'Copier',
    'Create Shortcut': 'Créer un raccourci',
    Delete: 'Supprimer',
    Rename: 'Renommer',
    Properties: 'Propriétés',
    'Open With': 'Ouvrir avec',
    'Send To': 'Envoyer vers',
    'Arrange Icons By': 'Réorganiser les icônes par',
    Name: 'Nom',
    Size: 'Taille',
    Type: 'Type',
    Modified: 'Modifié',
    'Auto Arrange': 'Réorganisation automatique',
    'Align to Grid': 'Aligner sur la grille',
    Refresh: 'Actualiser',
    Paste: 'Coller',
    'Paste Shortcut': 'Coller le raccourci',
    New: 'Nouveau',
    Folder: 'Dossier',
    Shortcut: 'Raccourci',
    'Text Document': 'Document texte',
    Toolbars: "Barres d'outils",
    'Cascade Windows': 'Fenêtres en cascade',
    'Tile Windows Horizontally': 'Afficher les fenêtres empilées',
    'Tile Windows Vertically': 'Afficher les fenêtres côte à côte',
    'Show the Desktop': 'Afficher le Bureau',
    'Task Manager': 'Gestionnaire des tâches',
  },
  es: {
    Open: 'Abrir',
    Cut: 'Cortar',
    Copy: 'Copiar',
    'Create Shortcut': 'Crear acceso directo',
    Delete: 'Eliminar',
    Rename: 'Cambiar nombre',
    Properties: 'Propiedades',
    'Open With': 'Abrir con',
    'Send To': 'Enviar a',
    'Arrange Icons By': 'Ordenar iconos por',
    Name: 'Nombre',
    Size: 'Tamaño',
    Type: 'Tipo',
    Modified: 'Modificado',
    'Auto Arrange': 'Organización automática',
    'Align to Grid': 'Alinear a la cuadrícula',
    Refresh: 'Actualizar',
    Paste: 'Pegar',
    'Paste Shortcut': 'Pegar acceso directo',
    New: 'Nuevo',
    Folder: 'Carpeta',
    Shortcut: 'Acceso directo',
    'Text Document': 'Documento de texto',
    Toolbars: 'Barras de herramientas',
    'Cascade Windows': 'Ventanas en cascada',
    'Tile Windows Horizontally': 'Mostrar ventanas apiladas',
    'Tile Windows Vertically': 'Mostrar ventanas en paralelo',
    'Show the Desktop': 'Mostrar el escritorio',
    'Task Manager': 'Administrador de tareas',
  },
  zh: {
    Open: '打开',
    Cut: '剪切',
    Copy: '复制',
    'Create Shortcut': '创建快捷方式',
    Delete: '删除',
    Rename: '重命名',
    Properties: '属性',
    'Open With': '打开方式',
    'Send To': '发送到',
    'Arrange Icons By': '排列图标',
    Name: '名称',
    Size: '大小',
    Type: '类型',
    Modified: '修改时间',
    'Auto Arrange': '自动排列',
    'Align to Grid': '与网格对齐',
    Refresh: '刷新',
    Paste: '粘贴',
    'Paste Shortcut': '粘贴快捷方式',
    New: '新建',
    Folder: '文件夹',
    Shortcut: '快捷方式',
    'Text Document': '文本文档',
    Toolbars: '工具栏',
    'Cascade Windows': '层叠窗口',
    'Tile Windows Horizontally': '堆叠显示窗口',
    'Tile Windows Vertically': '并排显示窗口',
    'Show the Desktop': '显示桌面',
    'Task Manager': '任务管理器',
  },
  ja: {
    Open: '開く',
    Cut: '切り取り',
    Copy: 'コピー',
    'Create Shortcut': 'ショートカットの作成',
    Delete: '削除',
    Rename: '名前の変更',
    Properties: 'プロパティ',
    'Open With': 'プログラムから開く',
    'Send To': '送る',
    'Arrange Icons By': 'アイコンの整列',
    Name: '名前',
    Size: 'サイズ',
    Type: '種類',
    Modified: '更新日時',
    'Auto Arrange': 'アイコンの自動整列',
    'Align to Grid': '等間隔に整列',
    Refresh: '最新の情報に更新',
    Paste: '貼り付け',
    'Paste Shortcut': 'ショートカットの貼り付け',
    New: '新規作成',
    Folder: 'フォルダー',
    Shortcut: 'ショートカット',
    'Text Document': 'テキスト ドキュメント',
    Toolbars: 'ツール バー',
    'Cascade Windows': '重ねて表示',
    'Tile Windows Horizontally': '上下に並べて表示',
    'Tile Windows Vertically': '左右に並べて表示',
    'Show the Desktop': 'デスクトップの表示',
    'Task Manager': 'タスク マネージャー',
  },
  ko: {
    Open: '열기',
    Cut: '잘라내기',
    Copy: '복사',
    'Create Shortcut': '바로 가기 만들기',
    Delete: '삭제',
    Rename: '이름 바꾸기',
    Properties: '속성',
    'Open With': '연결 프로그램',
    'Send To': '보내기',
    'Arrange Icons By': '아이콘 정렬 순서',
    Name: '이름',
    Size: '크기',
    Type: '종류',
    Modified: '수정한 날짜',
    'Auto Arrange': '자동 정렬',
    'Align to Grid': '격자에 맞춤',
    Refresh: '새로 고침',
    Paste: '붙여넣기',
    'Paste Shortcut': '바로 가기 붙여넣기',
    New: '새로 만들기',
    Folder: '폴더',
    Shortcut: '바로 가기',
    'Text Document': '텍스트 문서',
    Toolbars: '도구 모음',
    'Cascade Windows': '계단식 창 배열',
    'Tile Windows Horizontally': '창 가로 정렬',
    'Tile Windows Vertically': '창 세로 정렬',
    'Show the Desktop': '바탕 화면 표시',
    'Task Manager': '작업 관리자',
  },
};

function localizeLabel(label: string | undefined, language: Language) {
  if (!label) return label;
  return CONTEXT_MENU_LABELS[language][label] ?? label;
}

function ContextMenuLevel({
  items,
  onClose,
  isSubmenu = false,
}: {
  items: ContextMenuItem[];
  onClose: () => void;
  isSubmenu?: boolean;
}) {
  const { language } = useApp();
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);

  const localizedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      label: localizeLabel(item.label, language),
    }));
  }, [items, language]);

  return (
    <div className={`desktop-context-menu ${isSubmenu ? 'desktop-context-menu--submenu' : ''}`} role="menu">
      {localizedItems.map((item, index) => {
        if (item.separator) {
          return <div key={`separator-${index}`} className="desktop-context-menu__separator" role="separator" />;
        }

        const hasSubmenu = Boolean(item.submenu?.length);
        return (
          <div
            key={`${item.label ?? 'item'}-${index}`}
            className="desktop-context-menu__item-wrap"
            onMouseEnter={() => setOpenSubmenuIndex(hasSubmenu ? index : null)}
          >
            <button
              type="button"
              role="menuitem"
              className="desktop-context-menu__item"
              disabled={item.disabled}
              aria-haspopup={hasSubmenu ? 'menu' : undefined}
              aria-expanded={hasSubmenu ? openSubmenuIndex === index : undefined}
              onClick={() => {
                if (item.disabled || hasSubmenu) return;
                item.onClick?.();
                onClose();
              }}
            >
              <span className="desktop-context-menu__icon-slot">
                {item.icon ? <img src={item.icon} alt="" /> : null}
              </span>
              <span className="desktop-context-menu__label">{item.label}</span>
              <span className="desktop-context-menu__arrow" aria-hidden="true">
                {hasSubmenu ? '▶' : ''}
              </span>
            </button>

            {hasSubmenu && openSubmenuIndex === index && (
              <ContextMenuLevel items={item.submenu!} onClose={onClose} isSubmenu />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[10000] desktop-context-menu-anchor"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <ContextMenuLevel items={items} onClose={onClose} />
    </div>
  );
}
