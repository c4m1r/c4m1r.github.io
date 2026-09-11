export interface OsEdition {
  id: string;
  label: string;
  labelRu: string;
  descriptionRu: string;
}

export type EditionProfileId = 'win7' | 'win8' | 'win81';

export const OS_EDITIONS: Record<EditionProfileId, OsEdition[]> = {
  win7: [
    {
      id: 'starter',
      label: 'Starter',
      labelRu: 'Начальная',
      descriptionRu: 'Самая урезанная редакция Windows 7: без Aero, только 32-битная версия и ограничение памяти до 2 ГБ. Встречалась главным образом на бюджетных нетбуках.',
    },
    {
      id: 'home-basic',
      label: 'Home Basic',
      labelRu: 'Домашняя базовая',
      descriptionRu: 'Базовая домашняя редакция для отдельных рынков. Интерфейс и мультимедийные возможности ограничены по сравнению с Home Premium.',
    },
    {
      id: 'home-premium',
      label: 'Home Premium',
      labelRu: 'Домашняя расширенная',
      descriptionRu: 'Популярная домашняя редакция с Aero Glass, расширенными мультимедийными возможностями и Windows Media Center.',
    },
    {
      id: 'professional',
      label: 'Professional',
      labelRu: 'Профессиональная',
      descriptionRu: 'Редакция для работы: присоединение к домену, EFS и Windows XP Mode для совместимости со старыми приложениями.',
    },
    {
      id: 'enterprise',
      label: 'Enterprise',
      labelRu: 'Корпоративная',
      descriptionRu: 'Корпоративная редакция с BitLocker, AppLocker и возможностями централизованного развертывания и лицензирования.',
    },
    {
      id: 'ultimate',
      label: 'Ultimate',
      labelRu: 'Максимальная',
      descriptionRu: 'Максимальная розничная редакция, объединяющая домашние и корпоративные возможности Windows 7, включая BitLocker и языковые пакеты.',
    },
    {
      id: 'embedded-standard-2011',
      label: 'Embedded Standard 2011',
      labelRu: 'Windows Embedded Standard 2011 (Quebec)',
      descriptionRu: 'Модульная редакция на базе Windows 7 для банкоматов, медицинского оборудования, терминалов и специализированных устройств. Внутреннее имя - Quebec.',
    },
    {
      id: 'embedded-compact-7',
      label: 'Embedded Compact 7',
      labelRu: 'Windows Embedded Compact 7 (CE7)',
      descriptionRu: 'Отдельная компактная система семейства Windows Embedded для тонких клиентов и специализированного оборудования, в том числе ARM-устройств.',
    },
    {
      id: 'embedded-posready-7',
      label: 'Embedded POSReady 7',
      labelRu: 'Windows Embedded POSReady 7',
      descriptionRu: 'Специализированная редакция для POS-терминалов, касс, киосков и сервисного оборудования. Базируется на технологиях Windows 7 Professional SP1.',
    },
  ],
  win8: [
    {
      id: 'core',
      label: 'Core',
      labelRu: 'Windows 8',
      descriptionRu: 'Базовая редакция Windows 8 для домашних компьютеров и обычных ноутбуков.',
    },
    {
      id: 'pro',
      label: 'Pro',
      labelRu: 'Windows 8 Профессиональная',
      descriptionRu: 'Расширенная редакция с BitLocker, Hyper-V, присоединением к домену и удаленным рабочим столом.',
    },
    {
      id: 'enterprise',
      label: 'Enterprise',
      labelRu: 'Windows 8 Корпоративная',
      descriptionRu: 'Корпоративная редакция с DirectAccess, BranchCache и дополнительными средствами управления.',
    },
    {
      id: 'rt',
      label: 'RT',
      labelRu: 'Windows RT',
      descriptionRu: 'Редакция для ARM-процессоров. Обычные Win32-программы на ней не устанавливались; основной канал приложений - Windows Store.',
    },
    {
      id: 'n',
      label: 'N',
      labelRu: 'Windows 8 N',
      descriptionRu: 'Европейская вариация без Windows Media Player и ряда мультимедийных компонентов.',
    },
    {
      id: 'pro-n',
      label: 'Pro N',
      labelRu: 'Windows 8 Pro N',
      descriptionRu: 'Профессиональная европейская вариация без Windows Media Player и связанных мультимедийных компонентов.',
    },
    {
      id: 'enterprise-n',
      label: 'Enterprise N',
      labelRu: 'Windows 8 Enterprise N',
      descriptionRu: 'Корпоративная европейская вариация без Windows Media Player и связанных мультимедийных компонентов.',
    },
    {
      id: 'single-language',
      label: 'Single Language',
      labelRu: 'Windows 8 Single Language',
      descriptionRu: 'OEM-редакция, рассчитанная на один язык интерфейса и часто предустанавливавшаяся на недорогие ноутбуки.',
    },
    {
      id: 'with-bing',
      label: 'with Bing',
      labelRu: 'Windows 8 with Bing',
      descriptionRu: 'OEM-вариация для недорогих устройств с требованиями Microsoft к поиску Bing по умолчанию.',
    },
  ],
  win81: [
    {
      id: 'core',
      label: '8.1',
      labelRu: 'Windows 8.1',
      descriptionRu: 'Базовая редакция Windows 8.1 - развитие Windows 8 с доработанным интерфейсом и возвратом кнопки Пуск.',
    },
    {
      id: 'pro',
      label: '8.1 Pro',
      labelRu: 'Windows 8.1 Профессиональная',
      descriptionRu: 'Профессиональная редакция Windows 8.1 с доменом, BitLocker, Hyper-V и удаленным рабочим столом.',
    },
    {
      id: 'enterprise',
      label: '8.1 Enterprise',
      labelRu: 'Windows 8.1 Корпоративная',
      descriptionRu: 'Корпоративная редакция Windows 8.1 с расширенными средствами управления и сетевыми функциями.',
    },
    {
      id: 'rt',
      label: 'RT 8.1',
      labelRu: 'Windows RT 8.1',
      descriptionRu: 'Обновленная ARM-редакция для устройств семейства Windows RT.',
    },
    {
      id: 'with-bing',
      label: '8.1 with Bing',
      labelRu: 'Windows 8.1 with Bing',
      descriptionRu: 'OEM-вариация Windows 8.1 для недорогих устройств с Bing как поиском по умолчанию.',
    },
  ],
};

export function getEditionsForProfile(profileId: string): OsEdition[] {
  return profileId in OS_EDITIONS ? OS_EDITIONS[profileId as EditionProfileId] : [];
}
