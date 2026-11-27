import type { Language } from './translations';

/**
 * UI strings of the Windows 8 Start screen (the tile dashboard that replaces the Start menu).
 * Every key has all nine interface languages; the lookup falls back to English.
 */
const WIN8_STRINGS = {
  start: {
    en: 'Start', ru: 'Пуск', fr: 'Démarrer', es: 'Inicio', zh: '开始',
    ja: 'スタート', ko: '시작', be: 'Пуск', kk: 'Бастау',
  },
  search: {
    en: 'Search', ru: 'Поиск', fr: 'Rechercher', es: 'Buscar', zh: '搜索',
    ja: '検索', ko: '검색', be: 'Пошук', kk: 'Іздеу',
  },
  allApps: {
    en: 'All apps', ru: 'Все приложения', fr: 'Toutes les applications', es: 'Todas las aplicaciones', zh: '所有应用',
    ja: 'すべてのアプリ', ko: '모든 앱', be: 'Усе праграмы', kk: 'Барлық қолданбалар',
  },
  back: {
    en: 'Back', ru: 'Назад', fr: 'Retour', es: 'Volver', zh: '返回',
    ja: '戻る', ko: '뒤로', be: 'Назад', kk: 'Артқа',
  },
  shutDown: {
    en: 'Shut down', ru: 'Завершение работы', fr: 'Arrêter', es: 'Apagar', zh: '关机',
    ja: 'シャットダウン', ko: '시스템 종료', be: 'Завяршэнне працы', kk: 'Жұмысты аяқтау',
  },
  logOff: {
    en: 'Log off', ru: 'Выйти из системы', fr: 'Se déconnecter', es: 'Cerrar sesión', zh: '注销',
    ja: 'サインアウト', ko: '로그오프', be: 'Выйсці з сістэмы', kk: 'Жүйеден шығу',
  },
  noResults: {
    en: 'Nothing matches your search', ru: 'Ничего не найдено', fr: 'Aucun résultat', es: 'No hay resultados', zh: '没有匹配项',
    ja: '一致する項目はありません', ko: '일치하는 항목이 없습니다', be: 'Нічога не знойдзена', kk: 'Ешнәрсе табылмады',
  },
  controlPanel: {
    en: 'Control Panel', ru: 'Панель управления', fr: 'Panneau de configuration', es: 'Panel de control', zh: '控制面板',
    ja: 'コントロール パネル', ko: '제어판', be: 'Панэль кіравання', kk: 'Басқару тақтасы',
  },
  taskManager: {
    en: 'Task Manager', ru: 'Диспетчер задач', fr: 'Gestionnaire des tâches', es: 'Administrador de tareas', zh: '任务管理器',
    ja: 'タスク マネージャー', ko: '작업 관리자', be: 'Дыспетчар задач', kk: 'Тапсырмалар менеджері',
  },
  run: {
    en: 'Run', ru: 'Выполнить', fr: 'Exécuter', es: 'Ejecutar', zh: '运行',
    ja: '実行', ko: '실행', be: 'Выканаць', kk: 'Орындау',
  },
  desktop: {
    en: 'Desktop', ru: 'Рабочий стол', fr: 'Bureau', es: 'Escritorio', zh: '桌面',
    ja: 'デスクトップ', ko: '데스크톱', be: 'Працоўны стол', kk: 'Жұмыс үстелі',
  },
} as const;

export type Win8StringKey = keyof typeof WIN8_STRINGS;

export function win8Text(language: Language | string, key: Win8StringKey): string {
  const entry: Record<string, string> = WIN8_STRINGS[key];
  const code = language.split('-')[0];
  return entry[code] ?? entry.en;
}
