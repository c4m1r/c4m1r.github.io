import { type ThemeId } from '../../contexts/appContextTypes';
import { type Language } from '../../i18n/translations';
import { getOsDeviceSupportRules, getOsVersionRules } from '../../shells/os/osSkins';

export interface SettingItem {
  id: string;
  label: Partial<Record<Language, string>>;
  valueDescription?: Partial<Record<Language, string>>;
  actionId?: string;
  frozen?: boolean;
  note?: Partial<Record<Language, string>>;
}

export interface SettingSection {
  id: string;
  title: Partial<Record<Language, string>>;
  items: SettingItem[];
}

export function getSystemSettingsSections(themeId: ThemeId): SettingSection[] {
  const versionRules = getOsVersionRules(themeId);
  const deviceRules = getOsDeviceSupportRules(themeId);

  // Common active system sections
  const systemSection: SettingSection = {
    id: 'system-about',
    title: { en: 'System & About', ru: 'Система и о программе' },
    items: [
      {
        id: 'os-version',
        label: { en: 'OS Version', ru: 'Версия ОС' },
        valueDescription: {
          en: versionRules?.displayName ?? themeId,
          ru: versionRules?.displayName ?? themeId,
        },
      },
      ...(deviceRules?.representativeDevice
        ? [
            {
              id: 'device-cycle',
              label: { en: 'iPad Support Cycle', ru: 'Цикл поддержки iPad' },
              valueDescription: {
                en: deviceRules.representativeDevice,
                ru: deviceRules.representativeDevice,
              },
            },
          ]
        : []),
    ],
  };

  const languageSection: SettingSection = {
    id: 'language',
    title: { en: 'Language & Region', ru: 'Язык и регион' },
    items: [
      {
        id: 'lang-toggle',
        label: { en: 'Interface Language', ru: 'Язык интерфейса' },
        actionId: 'language.toggle',
      },
    ],
  };

  const effectsSection: SettingSection = {
    id: 'effects',
    title: { en: 'Visual Effects', ru: 'Визуальные эффекты' },
    items: [
      {
        id: 'fireworks-trigger',
        label: { en: 'Fireworks Effect', ru: 'Визуальный салют' },
        actionId: 'effects.fireworks',
      },
      {
        id: 'fireworks-toggle',
        label: { en: 'Toggle Fireworks', ru: 'Включить/выключить салют' },
        actionId: 'effects.toggleFireworks',
      },
    ],
  };

  const bootSection: SettingSection = {
    id: 'boot',
    title: { en: 'Boot & Session', ru: 'Загрузка и сессия' },
    items: [
      {
        id: 'remember-os',
        label: { en: 'Remember Last OS', ru: 'Запоминать последнюю ОС' },
        frozen: true,
        valueDescription: { en: 'Disabled (GRUB always starts first)', ru: 'Отключено (GRUB всегда первый)' },
        note: {
          en: 'GRUB bootloader is required as default entry screen for pseudo-OS selection.',
          ru: 'Загрузчик GRUB всегда остается стартовым экраном выбор псевдо-ОС.',
        },
      },
    ],
  };

  const resetSection: SettingSection = {
    id: 'reset',
    title: { en: 'Reset & Recovery', ru: 'Сброс и восстановление' },
    items: [
      {
        id: 'reset-settings',
        label: { en: 'Reset System Settings', ru: 'Сбросить настройки системы' },
        actionId: 'settings.reset',
      },
    ],
  };

  // OS-specific frozen placeholder sections
  const frozenOsItemsMap: Record<string, SettingItem[]> = {
    'win-xp': [
      { id: 'xp-net', label: { en: 'Network Connections', ru: 'Сетевые подключения' }, frozen: true },
      { id: 'xp-disp', label: { en: 'Display Settings', ru: 'Параметры экрана' }, frozen: true },
      { id: 'xp-sound', label: { en: 'Sounds and Audio Devices', ru: 'Звуки и аудиоустройства' }, frozen: true },
    ],
    'win-98': [
      { id: 'w98-hardware', label: { en: 'Add New Hardware', ru: 'Установка оборудования' }, frozen: true },
      { id: 'w98-pass', label: { en: 'Passwords', ru: 'Пароли' }, frozen: true },
    ],
    win7: [
      { id: 'w7-aero', label: { en: 'Aero Glass Personalization', ru: 'Персонализация Aero' }, frozen: true },
      { id: 'w7-security', label: { en: 'Action Center & Security', ru: 'Центр поддержки и безопасность' }, frozen: true },
    ],
    ubuntu: [
      { id: 'ub-gnome', label: { en: 'Appearance & Dock Settings', ru: 'Внешний вид и Dock' }, frozen: true },
      { id: 'ub-privacy', label: { en: 'Privacy & Security', ru: 'Конфиденциальность' }, frozen: true },
    ],
    'ios-26': [
      { id: 'ios-wifi', label: { en: 'Wi-Fi & Cellular', ru: 'Wi-Fi и сотовая связь' }, frozen: true },
      { id: 'ios-bt', label: { en: 'Bluetooth & AirDrop', ru: 'Bluetooth и AirDrop' }, frozen: true },
      { id: 'ios-acc', label: { en: 'Accessibility & Touch', ru: 'Универсальный доступ' }, frozen: true },
    ],
    'ios-16': [
      { id: 'ios-wifi', label: { en: 'Wi-Fi', ru: 'Wi-Fi' }, frozen: true },
      { id: 'ios-bt', label: { en: 'Bluetooth', ru: 'Bluetooth' }, frozen: true },
    ],
    'ios-9': [
      { id: 'ios-wifi', label: { en: 'Wi-Fi', ru: 'Wi-Fi' }, frozen: true },
      { id: 'ios-gps', label: { en: 'GPS Location Services', ru: 'Службы геолокации GPS' }, frozen: true },
    ],
    'ios-5': [
      { id: 'ios-wifi', label: { en: 'Wi-Fi', ru: 'Wi-Fi' }, frozen: true },
      { id: 'ios-icloud', label: { en: 'iCloud Sync (iOS 5)', ru: 'Синхронизация iCloud (iOS 5)' }, frozen: true },
    ],
  };

  const frozenItems = frozenOsItemsMap[themeId] ?? [];
  const frozenSection: SettingSection | null =
    frozenItems.length > 0
      ? {
          id: 'os-placeholders',
          title: { en: 'OS Native Placeholders', ru: 'Параметры ориг. ОС (Макет)' },
          items: frozenItems,
        }
      : null;

  return [
    systemSection,
    languageSection,
    effectsSection,
    bootSection,
    ...(frozenSection ? [frozenSection] : []),
    resetSection,
  ];
}
