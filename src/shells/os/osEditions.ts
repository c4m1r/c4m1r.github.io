import win98Clouds from '../../content/pictures/wallpapers/windows/win98-clouds.jpg';
import win7Home from '../../content/pictures/wallpapers/windows/win7-home.jpg';
import winxpBliss from '../../content/pictures/wallpapers/windows/winxp-bliss.jpg';
import win7Ultimate from '../../themes/win7/assets/images/desktop-wallpaper.jpg';

export interface OsEdition {
  id: string;
  label: string;
  labelRu: string;
  descriptionRu: string;
  wallpaper?: string;
  backgroundColor?: string;
  buildNumber?: string;
}

export type EditionProfileId = 'win-98' | 'win2000' | 'win-xp' | 'vista' | 'win7' | 'win8' | 'win81';

export const EDITION_STORAGE_KEY = 'webos-grub-editions-v1';

export const OS_EDITIONS: Record<EditionProfileId, OsEdition[]> = {
  'win-98': [
    {
      id: 'first-edition',
      label: 'First Edition',
      labelRu: 'Windows 98 First Edition (FE)',
      descriptionRu: 'Оригинальный розничный выпуск Windows 98 (Build 1998) с интеграцией Internet Explorer 4.0, поддержкой шины USB и классическим бирюзовым рабочим столом.',
      backgroundColor: '#008080',
      buildNumber: 'Build 1998',
    },
    {
      id: 'second-edition',
      label: 'Second Edition',
      labelRu: 'Windows 98 Second Edition (SE)',
      descriptionRu: 'Культовый выпуск Windows 98 SE (Build 2222A) с обоями «Облака», общим доступом к подключению к Интернету (ICS), DirectX 6.1 и улучшенным стеком WDM.',
      wallpaper: win98Clouds,
      backgroundColor: '#008080',
      buildNumber: 'Build 2222A',
    },
  ],
  win2000: [
    {
      id: 'professional',
      label: 'Professional',
      labelRu: 'Windows 2000 Professional',
      descriptionRu: 'Настольная операционная система NT 5.0 (Build 2195) для корпоративных рабочих станций, объединившая монолитную надёжность ядра NT и Plug and Play.',
      backgroundColor: '#3a6ea5',
      buildNumber: 'Build 2195: Service Pack 4',
    },
    {
      id: 'server',
      label: 'Server',
      labelRu: 'Windows 2000 Server',
      descriptionRu: 'Многоцелевая сетевая серверная операционная система для файловых, DNS и веб-серверов с поддержкой служб Active Directory и до 4 процессоров.',
      backgroundColor: '#1c3f6e',
      buildNumber: 'Build 2195: Server',
    },
    {
      id: 'advanced-server',
      label: 'Advanced Server',
      labelRu: 'Windows 2000 Advanced Server',
      descriptionRu: 'Высокопроизводительная серверная редакция для двух узловых кластеров высокой доступности и поддержки до 8 процессоров и 8 ГБ ОЗУ.',
      backgroundColor: '#152238',
      buildNumber: 'Build 2195: Adv Server',
    },
    {
      id: 'datacenter',
      label: 'Datacenter Server',
      labelRu: 'Windows 2000 Datacenter Server',
      descriptionRu: 'Флагманская редакция для масштабируемых корпоративных дата-центров с поддержкой до 32 процессоров и 64 ГБ ОЗУ.',
      backgroundColor: '#0f172a',
      buildNumber: 'Build 2195: Datacenter',
    },
  ],
  'win-xp': [
    {
      id: 'home',
      label: 'Home Edition',
      labelRu: 'Windows XP Home Edition',
      descriptionRu: 'Домашняя редакция Windows XP с темой Luna, легендарными обоями «Безмятежность» (Bliss), быстрым переключением пользователей и мультимедийным центром.',
      wallpaper: winxpBliss,
      buildNumber: 'Build 2600.xpsp_sp3_qfe',
    },
    {
      id: 'professional',
      label: 'Professional',
      labelRu: 'Windows XP Professional',
      descriptionRu: 'Флагманская редакция для бизнеса: присоединение к доменам Windows NT/2000/2003, удалённый рабочий стол (Remote Desktop) и шифрованная файловая система EFS.',
      wallpaper: winxpBliss,
      buildNumber: 'Build 2600.xpsp_sp3_gdr',
    },
    {
      id: 'media-center',
      label: 'Media Center Edition',
      labelRu: 'Windows XP Media Center Edition 2005',
      descriptionRu: 'Мультимедийная редакция (Symphony) с темой Royale (Energy Blue) и интерфейсом управления 10-foot UI для телевизора и пульта ДУ.',
      wallpaper: winxpBliss,
      buildNumber: 'Build 2600: Symphony (MCE 2005)',
    },
    {
      id: 'x64',
      label: 'Professional x64 Edition',
      labelRu: 'Windows XP Professional x64 Edition',
      descriptionRu: '64-битная редакция на базе серверного ядра Windows Server 2003 SP1 для работы с 64-битными вычислениями и ОЗУ до 128 ГБ.',
      wallpaper: winxpBliss,
      buildNumber: 'Build 3790.srv03_sp2_rtm',
    },
  ],
  vista: [
    {
      id: 'starter',
      label: 'Starter',
      labelRu: 'Начальная',
      descriptionRu: 'Урезанная редакция Windows Vista для развивающихся рынков: без Aero, не более трёх одновременно запущенных программ и 1 ГБ памяти. Оформление Windows Vista Basic.',
      backgroundColor: '#1b6c8f',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'home-basic',
      label: 'Home Basic',
      labelRu: 'Домашняя базовая',
      descriptionRu: 'Базовая домашняя редакция без Aero Glass и Media Center. Окна рисуются в упрощённом стиле Windows Vista Basic.',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'home-premium',
      label: 'Home Premium',
      labelRu: 'Домашняя расширенная',
      descriptionRu: 'Домашняя редакция с интерфейсом Aero Glass, Windows Media Center, Windows Photo Gallery и записью DVD.',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'business',
      label: 'Business',
      labelRu: 'Business',
      descriptionRu: 'Редакция для малого бизнеса: Aero Glass, домен Active Directory, удалённый рабочий стол и теневые копии файлов.',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'enterprise',
      label: 'Enterprise',
      labelRu: 'Корпоративная',
      descriptionRu: 'Корпоративная редакция с BitLocker, многоязычным интерфейсом и подсистемой для UNIX-приложений. Продавалась только по корпоративным лицензиям.',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'ultimate',
      label: 'Ultimate',
      labelRu: 'Максимальная',
      descriptionRu: 'Максимальная редакция Windows Vista: всё из Home Premium и Enterprise плюс Ultimate Extras.',
      buildNumber: 'Build 6002: Service Pack 2',
    },
  ],
  win7: [
    {
      id: 'starter',
      label: 'Starter',
      labelRu: 'Начальная',
      descriptionRu: 'Самая урезанная редакция Windows 7: без Aero, только 32-битная версия и ограничение памяти до 2 ГБ. Встречалась главным образом на бюджетных нетбуках.',
      backgroundColor: '#1b58b8',
      buildNumber: 'Build 7601: Service Pack 1',
    },
    {
      id: 'home-basic',
      label: 'Home Basic',
      labelRu: 'Домашняя базовая',
      descriptionRu: 'Базовая домашняя редакция для отдельных рынков. Интерфейс и мультимедийные возможности ограничены по сравнению с Home Premium.',
      wallpaper: win7Home,
      buildNumber: 'Build 7601: Service Pack 1',
    },
    {
      id: 'home-premium',
      label: 'Home Premium',
      labelRu: 'Домашняя расширенная',
      descriptionRu: 'Популярная домашняя редакция с Aero Glass, расширенными мультимедийными возможностями и Windows Media Center.',
      wallpaper: win7Home,
      buildNumber: 'Build 7601: Service Pack 1',
    },
    {
      id: 'professional',
      label: 'Professional',
      labelRu: 'Профессиональная',
      descriptionRu: 'Редакция для работы: присоединение к домену, EFS и Windows XP Mode для совместимости со старыми приложениями.',
      wallpaper: win7Ultimate,
      buildNumber: 'Build 7601: Service Pack 1',
    },
    {
      id: 'enterprise',
      label: 'Enterprise',
      labelRu: 'Корпоративная',
      descriptionRu: 'Корпоративная редакция с BitLocker, AppLocker и возможностями централизованного развертывания и лицензирования.',
      wallpaper: win7Ultimate,
      buildNumber: 'Build 7601: Service Pack 1',
    },
    {
      id: 'ultimate',
      label: 'Ultimate',
      labelRu: 'Максимальная',
      descriptionRu: 'Максимальная розничная редакция, объединяющая домашние и корпоративные возможности Windows 7, включая BitLocker и языковые пакеты.',
      wallpaper: win7Ultimate,
      buildNumber: 'Build 7601: Service Pack 1',
    },
    {
      id: 'embedded-standard-2011',
      label: 'Embedded Standard 2011',
      labelRu: 'Windows Embedded Standard 2011 (Quebec)',
      descriptionRu: 'Модульная редакция на базе Windows 7 для банкоматов, медицинского оборудования, терминалов и специализированных устройств. Внутреннее имя - Quebec.',
      wallpaper: win7Ultimate,
      buildNumber: 'Build 7601: Quebec',
    },
    {
      id: 'embedded-compact-7',
      label: 'Embedded Compact 7',
      labelRu: 'Windows Embedded Compact 7 (CE7)',
      descriptionRu: 'Отдельная компактная система семейства Windows Embedded для тонких клиентов и специализированного оборудования, в том числе ARM-устройств.',
      backgroundColor: '#23527c',
      buildNumber: 'Build 7.00.2806',
    },
    {
      id: 'embedded-posready-7',
      label: 'Embedded POSReady 7',
      labelRu: 'Windows Embedded POSReady 7',
      descriptionRu: 'Специализированная редакция для POS-терминалов, касс, киосков и сервисного оборудования. Базируется на технологиях Windows 7 Professional SP1.',
      wallpaper: win7Ultimate,
      buildNumber: 'Build 7601: POSReady',
    },
  ],
  win8: [
    {
      id: 'core',
      label: 'Core',
      labelRu: 'Windows 8',
      descriptionRu: 'Базовая редакция Windows 8 для домашних компьютеров и обычных ноутбуков.',
      buildNumber: 'Build 9200',
    },
    {
      id: 'pro',
      label: 'Pro',
      labelRu: 'Windows 8 Профессиональная',
      descriptionRu: 'Расширенная редакция с BitLocker, Hyper-V, присоединением к домену и удаленным рабочим столом.',
      buildNumber: 'Build 9200',
    },
    {
      id: 'enterprise',
      label: 'Enterprise',
      labelRu: 'Windows 8 Корпоративная',
      descriptionRu: 'Корпоративная редакция с DirectAccess, BranchCache и дополнительными средствами управления.',
      buildNumber: 'Build 9200',
    },
    {
      id: 'rt',
      label: 'RT',
      labelRu: 'Windows RT',
      descriptionRu: 'Редакция для ARM-процессоров. Обычные Win32-программы на ней не устанавливались; основной канал приложений - Windows Store.',
      buildNumber: 'Build 9200 (ARM)',
    },
    {
      id: 'n',
      label: 'N',
      labelRu: 'Windows 8 N',
      descriptionRu: 'Европейская вариация без Windows Media Player и ряда мультимедийных компонентов.',
      buildNumber: 'Build 9200',
    },
    {
      id: 'pro-n',
      label: 'Pro N',
      labelRu: 'Windows 8 Pro N',
      descriptionRu: 'Профессиональная европейская вариация без Windows Media Player и связанных мультимедийных компонентов.',
      buildNumber: 'Build 9200',
    },
    {
      id: 'enterprise-n',
      label: 'Enterprise N',
      labelRu: 'Windows 8 Enterprise N',
      descriptionRu: 'Корпоративная европейская вариация без Windows Media Player и связанных мультимедийных компонентов.',
      buildNumber: 'Build 9200',
    },
    {
      id: 'single-language',
      label: 'Single Language',
      labelRu: 'Windows 8 Single Language',
      descriptionRu: 'OEM-редакция, рассчитанная на один язык интерфейса и часто предустанавливавшаяся на недорогие ноутбуки.',
      buildNumber: 'Build 9200',
    },
    {
      id: 'with-bing',
      label: 'with Bing',
      labelRu: 'Windows 8 with Bing',
      descriptionRu: 'OEM-вариация для недорогих устройств с требованиями Microsoft к поиску Bing по умолчанию.',
      buildNumber: 'Build 9200',
    },
  ],
  win81: [
    {
      id: 'core',
      label: '8.1',
      labelRu: 'Windows 8.1',
      descriptionRu: 'Базовая редакция Windows 8.1 - развитие Windows 8 с доработанным интерфейсом и возвратом кнопки Пуск.',
      buildNumber: 'Build 9600',
    },
    {
      id: 'pro',
      label: '8.1 Pro',
      labelRu: 'Windows 8.1 Профессиональная',
      descriptionRu: 'Профессиональная редакция Windows 8.1 с доменом, BitLocker, Hyper-V и удаленным рабочим столом.',
      buildNumber: 'Build 9600',
    },
    {
      id: 'enterprise',
      label: '8.1 Enterprise',
      labelRu: 'Windows 8.1 Корпоративная',
      descriptionRu: 'Корпоративная редакция Windows 8.1 с расширенными средствами управления и сетевыми функциями.',
      buildNumber: 'Build 9600',
    },
    {
      id: 'rt',
      label: 'RT 8.1',
      labelRu: 'Windows RT 8.1',
      descriptionRu: 'Обновленная ARM-редакция для устройств семейства Windows RT.',
      buildNumber: 'Build 9600 (ARM)',
    },
    {
      id: 'with-bing',
      label: '8.1 with Bing',
      labelRu: 'Windows 8.1 with Bing',
      descriptionRu: 'OEM-вариация Windows 8.1 для недорогих устройств с Bing как поиском по умолчанию.',
      buildNumber: 'Build 9600',
    },
  ],
};

export function getEditionsForProfile(profileId: string): OsEdition[] {
  return profileId in OS_EDITIONS ? OS_EDITIONS[profileId as EditionProfileId] : [];
}

export function getSelectedEditionId(profileOrThemeId: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.sessionStorage.getItem(EDITION_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return map[profileOrThemeId] ?? '';
  } catch {
    return '';
  }
}

export function setSelectedEditionId(profileOrThemeId: string, editionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.sessionStorage.getItem(EDITION_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[profileOrThemeId] = editionId;
    window.sessionStorage.setItem(EDITION_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(
      new CustomEvent('os-edition-changed', {
        detail: { profileOrThemeId, editionId },
      })
    );
  } catch {
    // Session storage may be unavailable
  }
}

export function getActiveEdition(profileOrThemeId: string): OsEdition | undefined {
  const editions = getEditionsForProfile(profileOrThemeId);
  if (!editions.length) return undefined;
  const selectedId = getSelectedEditionId(profileOrThemeId);
  return editions.find((ed) => ed.id === selectedId) ?? editions[0];
}
