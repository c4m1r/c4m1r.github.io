/**
 * Universal Notepad surface.
 * Windows XP gets a dedicated classic presentation while the editing and
 * markdown-preview behavior remains shared across themes.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../contexts/useApp';

interface NotepadProps {
  initialContent?: string;
  onClose?: () => void;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 mt-6 text-blue-800">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 mt-5 text-blue-700">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2 mt-4 text-blue-600">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/^[-*] (.+)$/gm, '<li class="ml-6 mb-1">• $1</li>')
    .replace(/\n\n/g, '</p><p class="mb-3 leading-relaxed">')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p class="mb-3 leading-relaxed">')
    .replace(/$/, '</p>');
}

export function Notepad({ initialContent = '', onClose }: NotepadProps) {
  const { theme, language } = useApp();
  const [content, setContent] = useState(initialContent);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isXpFamily = theme !== 'win-98';
  const isWindowsXp = theme === 'win-xp';
  const isRu = language === 'ru';

  const labels = {
    file: isRu ? 'Файл' : 'File',
    edit: isRu ? 'Правка' : 'Edit',
    format: isRu ? 'Формат' : 'Format',
    view: isRu ? 'Вид' : 'View',
    help: isRu ? 'Справка' : 'Help',
    new: isRu ? 'Создать' : 'New',
    open: isRu ? 'Открыть...' : 'Open...',
    save: isRu ? 'Сохранить' : 'Save',
    pageSetup: isRu ? 'Параметры страницы...' : 'Page Setup...',
    print: isRu ? 'Печать...' : 'Print...',
    exit: isRu ? 'Выход' : 'Exit',
    undo: isRu ? 'Отменить' : 'Undo',
    cut: isRu ? 'Вырезать' : 'Cut',
    copy: isRu ? 'Копировать' : 'Copy',
    paste: isRu ? 'Вставить' : 'Paste',
    del: isRu ? 'Удалить' : 'Delete',
    find: isRu ? 'Найти...' : 'Find...',
    replace: isRu ? 'Заменить...' : 'Replace...',
    goTo: isRu ? 'Перейти...' : 'Go To...',
    selectAll: isRu ? 'Выделить все' : 'Select All',
    timeDate: isRu ? 'Время и дата' : 'Time/Date',
  };

  const isMarkdown = useMemo(() => {
    return content.startsWith('#') || /\*\*|\*|^\d+\.|^- /.test(content);
  }, [content]);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleNew = () => {
    if (content && !confirm(isRu ? 'Сохранить изменения?' : 'Do you want to save changes?')) {
      return;
    }
    setContent('');
    setShowFileMenu(false);
  };

  const handleSelectAll = () => {
    textareaRef.current?.select();
    setShowEditMenu(false);
  };

  const handleCopy = () => {
    if (isMarkdown) {
      navigator.clipboard.writeText(content);
    } else if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      navigator.clipboard.writeText(content.substring(start, end));
    }
    setShowEditMenu(false);
  };

  const handleCut = () => {
    if (isMarkdown || !textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    navigator.clipboard.writeText(content.substring(start, end));
    setContent(content.substring(0, start) + content.substring(end));
    setShowEditMenu(false);
  };

  const handlePaste = async () => {
    if (isMarkdown) return;
    try {
      const text = await navigator.clipboard.readText();
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        setContent(content.substring(0, start) + text + content.substring(end));
      }
    } catch (err) {
      console.error('Failed to paste:', err);
    }
    setShowEditMenu(false);
  };

  const menuBarClass = isWindowsXp
    ? 'flex items-center h-[21px] px-[2px] border-b border-[#aca899] bg-[#ece9d8] relative font-tahoma text-[11px] text-black select-none'
    : `flex items-center h-[24px] px-1 border-b relative ${
        isXpFamily ? 'bg-[#ece9d8] border-[#aca899]' : 'bg-[#c0c0c0] border-gray-400'
      }`;

  const topMenuButtonClass = (open = false) =>
    isWindowsXp
      ? `h-[20px] px-[6px] py-0 text-[11px] leading-[19px] border-0 rounded-none ${
          open ? 'bg-[#316ac5] text-white' : 'bg-transparent text-black hover:bg-[#316ac5] hover:text-white'
        }`
      : `px-2 py-[2px] text-xs leading-snug ${
          open ? (isXpFamily ? 'bg-[#316ac5] text-white' : 'bg-[#000080] text-white') : ''
        } ${isXpFamily ? 'hover:bg-[#316ac5] hover:text-white' : 'hover:bg-[#000080] hover:text-white'}`;

  const popupClass = isWindowsXp
    ? 'absolute top-full left-0 bg-[#f5f4ea] border border-[#aca899] z-50 min-w-[205px] py-[2px] shadow-[2px_2px_2px_rgba(0,0,0,0.35)] font-tahoma text-[11px] text-black'
    : 'absolute top-full left-0 mt-0.5 bg-[#f0f0f0] border border-[#8c96a6] shadow-lg z-50 min-w-[180px]';

  const popupItemClass = (disabled = false) =>
    isWindowsXp
      ? `w-full h-[20px] flex items-center justify-between text-left pl-[22px] pr-[18px] py-0 text-[11px] rounded-none ${
          disabled
            ? 'text-[#808080] cursor-default bg-transparent'
            : 'text-black hover:bg-[#316ac5] hover:text-white'
        }`
      : `w-full text-left px-4 py-1 text-xs ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#316ac5] hover:text-white'
        }`;

  const separatorClass = isWindowsXp
    ? 'h-px bg-[#aca899] border-b border-white my-[3px] mx-[2px]'
    : 'h-px bg-[#8c96a6] my-1';

  return (
    <div className={`notepad-app flex flex-col h-full bg-white ${isWindowsXp ? 'notepad-app--xp font-tahoma' : ''}`}>
      <div className={menuBarClass}>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowFileMenu(!showFileMenu);
              setShowEditMenu(false);
            }}
            className={topMenuButtonClass(showFileMenu)}
          >
            {labels.file}
          </button>
          {showFileMenu && (
            <div className={popupClass}>
              <button onClick={handleNew} className={popupItemClass(isMarkdown)} disabled={isMarkdown}>
                <span>{labels.new}</span><span className="ml-5">Ctrl+N</span>
              </button>
              <button className={popupItemClass(true)} disabled>
                <span>{labels.open}</span><span className="ml-5">Ctrl+O</span>
              </button>
              <button className={popupItemClass(true)} disabled>
                <span>{labels.save}</span><span className="ml-5">Ctrl+S</span>
              </button>
              {isWindowsXp && (
                <>
                  <div className={separatorClass} />
                  <button className={popupItemClass(true)} disabled>{labels.pageSetup}</button>
                  <button className={popupItemClass(true)} disabled>
                    <span>{labels.print}</span><span className="ml-5">Ctrl+P</span>
                  </button>
                </>
              )}
              <div className={separatorClass} />
              <button onClick={onClose} className={popupItemClass(false)}>
                {labels.exit}
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEditMenu(!showEditMenu);
              setShowFileMenu(false);
            }}
            className={topMenuButtonClass(showEditMenu)}
          >
            {labels.edit}
          </button>
          {showEditMenu && (
            <div className={popupClass}>
              {isWindowsXp && (
                <>
                  <button className={popupItemClass(true)} disabled>
                    <span>{labels.undo}</span><span className="ml-5">Ctrl+Z</span>
                  </button>
                  <div className={separatorClass} />
                </>
              )}
              <button onClick={handleCut} className={popupItemClass(isMarkdown)} disabled={isMarkdown}>
                <span>{labels.cut}</span><span className="ml-5">Ctrl+X</span>
              </button>
              <button onClick={handleCopy} className={popupItemClass(false)}>
                <span>{labels.copy}</span><span className="ml-5">Ctrl+C</span>
              </button>
              <button onClick={handlePaste} className={popupItemClass(isMarkdown)} disabled={isMarkdown}>
                <span>{labels.paste}</span><span className="ml-5">Ctrl+V</span>
              </button>
              {isWindowsXp && (
                <>
                  <button className={popupItemClass(true)} disabled>
                    <span>{labels.del}</span><span className="ml-5">Del</span>
                  </button>
                  <div className={separatorClass} />
                  <button className={popupItemClass(true)} disabled>
                    <span>{labels.find}</span><span className="ml-5">Ctrl+F</span>
                  </button>
                  <button className={popupItemClass(true)} disabled>
                    <span>{labels.replace}</span><span className="ml-5">Ctrl+H</span>
                  </button>
                  <button className={popupItemClass(true)} disabled>
                    <span>{labels.goTo}</span><span className="ml-5">Ctrl+G</span>
                  </button>
                </>
              )}
              <div className={separatorClass} />
              <button onClick={handleSelectAll} className={popupItemClass(false)}>
                <span>{labels.selectAll}</span><span className="ml-5">Ctrl+A</span>
              </button>
              {isWindowsXp && (
                <button className={popupItemClass(true)} disabled>
                  <span>{labels.timeDate}</span><span className="ml-5">F5</span>
                </button>
              )}
            </div>
          )}
        </div>

        {[labels.format, labels.view, labels.help].map((item) => (
          <button
            type="button"
            key={item}
            className={isWindowsXp ? topMenuButtonClass(false) : 'px-2 py-[2px] text-xs opacity-50 cursor-not-allowed leading-snug'}
            title={isWindowsXp ? (isRu ? 'Пока недоступно' : 'Not implemented yet') : undefined}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        className="flex-1 relative bg-white"
        onClick={() => {
          setShowFileMenu(false);
          setShowEditMenu(false);
        }}
      >
        {isMarkdown ? (
          <div
            className={`absolute inset-0 overflow-auto bg-white ${isWindowsXp ? 'p-[4px] text-[13px]' : 'p-4 text-sm'}`}
            style={{
              fontFamily: isXpFamily ? '"Lucida Console", monospace' : '"Courier New", monospace',
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            className={`absolute inset-0 w-full h-full resize-none outline-none bg-white text-black ${
              isWindowsXp ? 'p-[2px] text-[13px] leading-[16px]' : 'p-1 font-mono text-sm'
            }`}
            style={{
              border: 'none',
              whiteSpace: 'pre',
              overflow: 'auto',
              fontFamily: isXpFamily ? '"Lucida Console", monospace' : '"Courier New", monospace',
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
