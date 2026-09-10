import type { Language } from '../../i18n/translations';

export type EditionFamilyId = 'win7' | 'win8' | 'win81';

export interface OsEdition {
  id: string;
  label: Partial<Record<Language, string>> & Pick<Record<Language, string>, 'en' | 'ru'>;
  description: Partial<Record<Language, string>> & Pick<Record<Language, string>, 'en' | 'ru'>;
}

const edition = (
  id: string,
  en: string,
  ru: string,
  descriptionRu: string,
  descriptionEn: string,
): OsEdition => ({
  id,
  label: { en, ru },
  description: { en: descriptionEn, ru: descriptionRu },
});

export const OS_EDITIONS: Record<EditionFamilyId, OsEdition[]> = {
  win7: [
    edition('starter', 'Starter', 'Начальная', 'Сильно урезанная редакция для недорогих ПК и нетбуков: без Aero, только 32-битная система и ограничение памяти до 2 ГБ.', 'A heavily reduced edition for inexpensive PCs and netbooks: no Aero, 32-bit only, and a 2 GB memory limit.'),
    edition('home-basic', 'Home Basic', 'Домашняя базовая', 'Базовая домашняя редакция для развивающихся рынков с упрощенным интерфейсом и сокращенным набором мультимедиа.', 'A basic home edition for emerging markets with a simpler interface and a reduced multimedia feature set.'),
    edition('home-premium', 'Home Premium', 'Домашняя расширенная', 'Классическая домашняя Windows 7 с Aero Glass, расширенным мультимедиа и Windows Media Center.', 'The classic home Windows 7 edition with Aero Glass, expanded multimedia features, and Windows Media Center.'),
    edition('professional', 'Professional', 'Профессиональная', 'Редакция для работы: присоединение к домену, EFS, Remote Desktop host и Windows XP Mode.', 'A business-oriented edition with domain join, EFS, Remote Desktop host, and Windows XP Mode.'),
    edition('enterprise', 'Enterprise', 'Корпоративная', 'Корпоративная редакция с BitLocker, AppLocker, DirectAccess и возможностями централизованного развертывания.', 'The volume-license enterprise edition with BitLocker, AppLocker, DirectAccess, and centralized deployment features.'),
    edition('ultimate', 'Ultimate', 'Максимальная', 'Максимальная розничная редакция Windows 7, объединяющая домашние и корпоративные возможности, включая BitLocker и языковые пакеты.', 'The top retail Windows 7 edition combining home and enterprise features, including BitLocker and language packs.'),
    edition('embedded-standard-2011', 'Embedded Standard 2011', 'Embedded Standard 2011', 'Windows Embedded Standard 2011, внутреннее имя Quebec: компонентная Windows 7 для банкоматов, терминалов, медицинского и специализированного оборудования.', 'Windows Embedded Standard 2011, internally codenamed Quebec: a componentized Windows 7 for ATMs, terminals, medical, and embedded devices.'),
    edition('embedded-compact-7', 'Embedded Compact 7 (CE7)', 'Embedded Compact 7 (CE7)', 'Отдельная компактная Windows Embedded CE-линия для слабого и специализированного оборудования, тонких клиентов и терминалов.', 'A separate compact Windows Embedded CE line for constrained devices, thin clients, and specialized terminals.'),
    edition('embedded-posready-7', 'Embedded POSReady 7', 'Embedded POSReady 7', 'Специализированная система для POS-терминалов, касс, киосков и ритейла на базе технологий Windows 7 Professional SP1.', 'A specialized Windows 7-era system for POS terminals, kiosks, cash registers, and retail/service devices.'),
  ],
  win8: [
    edition('core', 'Windows 8 (Core)', 'Windows 8 (Core)', 'Базовая потребительская редакция Windows 8, заменившая несколько домашних выпусков Windows 7.', 'The base consumer Windows 8 edition that replaced several Windows 7 home tiers.'),
    edition('pro', 'Windows 8 Pro', 'Windows 8 Профессиональная', 'Продвинутая редакция с BitLocker, Hyper-V, присоединением к домену и возможностями удаленного рабочего стола.', 'The advanced edition with BitLocker, Hyper-V, domain join, and Remote Desktop features.'),
    edition('enterprise', 'Windows 8 Enterprise', 'Windows 8 Корпоративная', 'Корпоративная редакция с DirectAccess, BranchCache и дополнительными средствами управления.', 'The enterprise edition with DirectAccess, BranchCache, and additional management features.'),
    edition('rt', 'Windows RT', 'Windows RT', 'ARM-редакция для планшетов, не запускавшая обычные x86/x64 настольные программы.', 'The ARM tablet edition that could not run ordinary x86/x64 desktop applications.'),
    edition('n', 'Windows 8 N', 'Windows 8 N', 'Европейская базовая редакция без Windows Media Player и связанных мультимедийных компонентов.', 'The European base edition without Windows Media Player and related media components.'),
    edition('pro-n', 'Windows 8 Pro N', 'Windows 8 Pro N', 'Профессиональная европейская редакция без Windows Media Player.', 'The European Professional edition without Windows Media Player.'),
    edition('enterprise-n', 'Windows 8 Enterprise N', 'Windows 8 Enterprise N', 'Корпоративная европейская редакция без Windows Media Player.', 'The European Enterprise edition without Windows Media Player.'),
    edition('single-language', 'Windows 8 Single Language', 'Windows 8 Single Language', 'OEM-редакция для одного языка интерфейса, часто устанавливавшаяся на недорогие ноутбуки.', 'An OEM edition locked to one display language, commonly shipped on inexpensive laptops.'),
    edition('with-bing', 'Windows 8 with Bing', 'Windows 8 с Bing', 'OEM-вариант Windows 8, где производитель получал льготную лицензию при сохранении Bing поиском по умолчанию.', 'An OEM variant offered under favorable licensing terms when Bing remained the default search provider.'),
  ],
  win81: [
    edition('core', 'Windows 8.1', 'Windows 8.1', 'Базовая Windows 8.1: крупное обновление Windows 8 с исправлениями интерфейса и возвращением кнопки Пуск.', 'The base Windows 8.1 edition, a major Windows 8 update with interface corrections and the return of the Start button.'),
    edition('pro', 'Windows 8.1 Pro', 'Windows 8.1 Профессиональная', 'Профессиональная Windows 8.1 с BitLocker, Hyper-V, доменом и дополнительными сетевыми возможностями.', 'The Professional Windows 8.1 edition with BitLocker, Hyper-V, domain join, and advanced networking.'),
    edition('enterprise', 'Windows 8.1 Enterprise', 'Windows 8.1 Корпоративная', 'Корпоративная Windows 8.1 с расширенными средствами развертывания и сетевого доступа.', 'The Enterprise Windows 8.1 edition with expanded deployment, management, and network access features.'),
    edition('rt', 'Windows RT 8.1', 'Windows RT 8.1', 'Обновленная ARM-редакция для устройств Windows RT.', 'The updated ARM edition for Windows RT devices.'),
    edition('with-bing', 'Windows 8.1 with Bing', 'Windows 8.1 с Bing', 'OEM-вариант Windows 8.1 с условиями лицензирования вокруг Bing как поиска по умолчанию.', 'An OEM Windows 8.1 variant with licensing terms centered on Bing as the default search provider.'),
  ],
};

const STORAGE_PREFIX = 'webos.edition.';
const DEFAULT_EDITION: Partial<Record<EditionFamilyId, string>> = {
  win7: 'ultimate',
  win8: 'core',
  win81: 'core',
};

export function getEditionFamily(profileId: string): EditionFamilyId | null {
  if (profileId === 'win7') return 'win7';
  if (profileId === 'win8') return 'win8';
  if (profileId === 'win81') return 'win81';
  return null;
}

export function getSelectedEdition(family: EditionFamilyId): OsEdition {
  const editions = OS_EDITIONS[family];
  const fallbackId = DEFAULT_EDITION[family] ?? editions[0].id;
  let selectedId = fallbackId;
  try {
    selectedId = window.localStorage.getItem(`${STORAGE_PREFIX}${family}`) ?? fallbackId;
  } catch {
    // Storage may be unavailable in privacy/sandbox modes. Use deterministic defaults.
  }
  return editions.find((item) => item.id === selectedId) ?? editions[0];
}

export function setSelectedEdition(family: EditionFamilyId, editionId: string) {
  if (!OS_EDITIONS[family].some((item) => item.id === editionId)) return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${family}`, editionId);
  } catch {
    // The selection still applies to the current GRUB render even if persistence is blocked.
  }
}

export function editionLabel(item: OsEdition, language: Language): string {
  return item.label[language] ?? item.label.en;
}
