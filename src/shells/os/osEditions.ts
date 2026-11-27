import win98Clouds from '../../content/pictures/wallpapers/windows/win98-clouds.jpg';
import win7Home from '../../content/pictures/wallpapers/windows/win7-home.jpg';
import winxpBliss from '../../content/pictures/wallpapers/windows/winxp-bliss.jpg';
import win7Ultimate from '../../themes/win7/assets/images/desktop-wallpaper.jpg';
import type { Language } from '../../i18n/translations';
import { getActiveBootProfileId } from '../../themes/bootProfile';

export interface OsEditionTranslation {
  label: string;
  description: string;
}

export interface OsEdition {
  id: string;
  label: string;
  labelRu: string;
  descriptionRu: string;
  /** Full nine-language names and descriptions, where a skin has them. Other languages fall back as described in editionLabel. */
  translations?: Partial<Record<Language, OsEditionTranslation>>;
  wallpaper?: string;
  backgroundColor?: string;
  buildNumber?: string;
}

export type EditionProfileId = 'win-98' | 'win2000' | 'win-xp' | 'vista' | 'win7' | 'win8' | 'ubuntu';

export const EDITION_STORAGE_KEY = 'webos-grub-editions-v1';

// Windows Vista editions in all nine interface languages (en, ru, fr, es, zh, ja, ko, be, kk).
const VISTA_EDITION_TRANSLATIONS: Record<string, Partial<Record<Language, OsEditionTranslation>>> = {
  starter: {
    en: { label: 'Starter', description: 'A stripped-down Windows Vista edition for developing markets: no Aero, at most three programs at once and 1 GB of memory. Uses the Windows Vista Basic look.' },
    ru: { label: 'Начальная', description: 'Урезанная редакция Windows Vista для развивающихся рынков: без Aero, не более трёх одновременно запущенных программ и 1 ГБ памяти. Оформление Windows Vista Basic.' },
    fr: { label: 'Starter', description: 'Édition allégée de Windows Vista pour les marchés émergents : sans Aero, trois programmes au maximum et 1 Go de mémoire. Utilise l’apparence Windows Vista Basic.' },
    es: { label: 'Starter', description: 'Edición reducida de Windows Vista para mercados emergentes: sin Aero, como máximo tres programas a la vez y 1 GB de memoria. Usa el aspecto de Windows Vista Basic.' },
    zh: { label: '入门版', description: '面向新兴市场的精简版 Windows Vista：无 Aero，最多同时运行三个程序，内存 1 GB。使用 Windows Vista Basic 外观。' },
    ja: { label: 'スターター', description: '新興市場向けに機能を絞った Windows Vista。Aero なし、同時に起動できるプログラムは 3 つまで、メモリは 1 GB。Windows Vista Basic の外観で動作します。' },
    ko: { label: '스타터', description: '신흥 시장용으로 기능을 줄인 Windows Vista 에디션입니다. Aero 없음, 동시 실행 프로그램 최대 3개, 메모리 1GB. Windows Vista Basic 모양을 사용합니다.' },
    be: { label: 'Пачатковая', description: 'Скарочаная рэдакцыя Windows Vista для краін, што развіваюцца: без Aero, не больш за тры адначасова запушчаныя праграмы і 1 ГБ памяці. Афармленне Windows Vista Basic.' },
    kk: { label: 'Бастапқы', description: 'Дамушы нарықтарға арналған қысқартылған Windows Vista редакциясы: Aero жоқ, бір уақытта үштен көп бағдарлама жоқ және 1 ГБ жад. Windows Vista Basic безендіруі.' },
  },
  'home-basic': {
    en: { label: 'Home Basic', description: 'A basic home edition without Aero Glass and Media Center. Windows are drawn in the simplified Windows Vista Basic style.' },
    ru: { label: 'Домашняя базовая', description: 'Базовая домашняя редакция без Aero Glass и Media Center. Окна рисуются в упрощённом стиле Windows Vista Basic.' },
    fr: { label: 'Familiale de base', description: 'Édition familiale de base sans Aero Glass ni Media Center. Les fenêtres sont dessinées dans le style simplifié Windows Vista Basic.' },
    es: { label: 'Home Basic', description: 'Edición básica para el hogar sin Aero Glass ni Media Center. Las ventanas se dibujan con el estilo simplificado de Windows Vista Basic.' },
    zh: { label: '家庭基础版', description: '不含 Aero Glass 和媒体中心的基础家庭版。窗口以简化的 Windows Vista Basic 样式绘制。' },
    ja: { label: 'ホーム ベーシック', description: 'Aero Glass と Media Center を含まない基本の家庭向けエディションです。ウィンドウは簡略化された Windows Vista Basic のスタイルで描画されます。' },
    ko: { label: '홈 베이직', description: 'Aero Glass와 Media Center가 없는 기본 가정용 에디션입니다. 창은 단순화된 Windows Vista Basic 스타일로 그려집니다.' },
    be: { label: 'Хатняя базавая', description: 'Базавая хатняя рэдакцыя без Aero Glass і Media Center. Вокны малююцца ў спрошчаным стылі Windows Vista Basic.' },
    kk: { label: 'Үйлік базалық', description: 'Aero Glass және Media Center жоқ базалық үйлік редакция. Терезелер жеңілдетілген Windows Vista Basic стилінде салынады.' },
  },
  'home-premium': {
    en: { label: 'Home Premium', description: 'A home edition with the Aero Glass interface, Windows Media Center, Windows Photo Gallery and DVD burning.' },
    ru: { label: 'Домашняя расширенная', description: 'Домашняя редакция с интерфейсом Aero Glass, Windows Media Center, Windows Photo Gallery и записью DVD.' },
    fr: { label: 'Familiale Premium', description: 'Édition familiale avec l’interface Aero Glass, Windows Media Center, Windows Photo Gallery et la gravure de DVD.' },
    es: { label: 'Home Premium', description: 'Edición para el hogar con la interfaz Aero Glass, Windows Media Center, Windows Photo Gallery y grabación de DVD.' },
    zh: { label: '家庭高级版', description: '家庭版，包含 Aero Glass 界面、Windows 媒体中心、Windows 照片库和 DVD 刻录。' },
    ja: { label: 'ホーム プレミアム', description: 'Aero Glass インターフェイス、Windows Media Center、Windows フォトギャラリー、DVD 書き込みを備えた家庭向けエディションです。' },
    ko: { label: '홈 프리미엄', description: 'Aero Glass 인터페이스, Windows Media Center, Windows 사진 갤러리, DVD 굽기를 갖춘 가정용 에디션입니다.' },
    be: { label: 'Хатняя пашыраная', description: 'Хатняя рэдакцыя з інтэрфейсам Aero Glass, Windows Media Center, Windows Photo Gallery і запісам DVD.' },
    kk: { label: 'Үйлік премиум', description: 'Aero Glass интерфейсі, Windows Media Center, Windows Photo Gallery және DVD жазу бар үйлік редакция.' },
  },
  business: {
    en: { label: 'Business', description: 'A small-business edition: Aero Glass, Active Directory domain join, Remote Desktop and shadow copies of files.' },
    ru: { label: 'Business', description: 'Редакция для малого бизнеса: Aero Glass, домен Active Directory, удалённый рабочий стол и теневые копии файлов.' },
    fr: { label: 'Professionnel', description: 'Édition pour les petites entreprises : Aero Glass, jonction au domaine Active Directory, Bureau à distance et copies fantômes des fichiers.' },
    es: { label: 'Business', description: 'Edición para pequeñas empresas: Aero Glass, unión a dominios de Active Directory, Escritorio remoto y copias de seguridad de archivos.' },
    zh: { label: '商业版', description: '小企业版：Aero Glass、加入 Active Directory 域、远程桌面和文件卷影副本。' },
    ja: { label: 'Business', description: '小規模ビジネス向けエディション。Aero Glass、Active Directory ドメイン参加、リモート デスクトップ、ファイルのシャドウ コピーを備えます。' },
    ko: { label: '비즈니스', description: '소규모 기업용 에디션입니다. Aero Glass, Active Directory 도메인 가입, 원격 데스크톱, 파일 섀도 복사본을 제공합니다.' },
    be: { label: 'Business', description: 'Рэдакцыя для малога бізнесу: Aero Glass, домен Active Directory, аддалены працоўны стол і ценявыя копіі файлаў.' },
    kk: { label: 'Business', description: 'Шағын бизнеске арналған редакция: Aero Glass, Active Directory домені, қашықтан жұмыс үстелі және файлдардың көлеңке көшірмелері.' },
  },
  enterprise: {
    en: { label: 'Enterprise', description: 'An enterprise edition with BitLocker, a multilingual interface and a UNIX application subsystem. Sold only under enterprise licences.' },
    ru: { label: 'Корпоративная', description: 'Корпоративная редакция с BitLocker, многоязычным интерфейсом и подсистемой для UNIX-приложений. Продавалась только по корпоративным лицензиям.' },
    fr: { label: 'Entreprise', description: 'Édition entreprise avec BitLocker, interface multilingue et sous-système pour applications UNIX. Vendue uniquement sous licence entreprise.' },
    es: { label: 'Enterprise', description: 'Edición empresarial con BitLocker, interfaz multilingüe y subsistema para aplicaciones UNIX. Se vendía solo con licencias empresariales.' },
    zh: { label: '企业版', description: '企业版，包含 BitLocker、多语言界面和 UNIX 应用子系统。仅通过企业许可证销售。' },
    ja: { label: 'Enterprise', description: 'BitLocker、多言語インターフェイス、UNIX アプリケーション サブシステムを備えた企業向けエディションです。企業向けライセンスでのみ販売されました。' },
    ko: { label: '엔터프라이즈', description: 'BitLocker, 다국어 인터페이스, UNIX 응용 프로그램 하위 시스템을 갖춘 기업용 에디션입니다. 기업용 라이선스로만 판매되었습니다.' },
    be: { label: 'Карпаратыўная', description: 'Карпаратыўная рэдакцыя з BitLocker, шматмоўным інтэрфейсам і падсістэмай для UNIX-праграм. Продаж толькі па карпаратыўных ліцэнзіях.' },
    kk: { label: 'Корпоративтік', description: 'BitLocker, көптілді интерфейс және UNIX қолданбаларына арналған ішкі жүйесі бар корпоративтік редакция. Тек корпоративтік лицензиямен сатылды.' },
  },
  ultimate: {
    en: { label: 'Ultimate', description: 'The top Windows Vista edition: everything in Home Premium and Enterprise plus the Ultimate Extras.' },
    ru: { label: 'Максимальная', description: 'Максимальная редакция Windows Vista: всё из Home Premium и Enterprise плюс Ultimate Extras.' },
    fr: { label: 'Intégrale', description: 'Édition la plus complète de Windows Vista : tout ce qui est dans Familiale Premium et Entreprise, plus les Ultimate Extras.' },
    es: { label: 'Ultimate', description: 'La edición más completa de Windows Vista: todo lo de Home Premium y Enterprise, más los Ultimate Extras.' },
    zh: { label: '旗舰版', description: 'Windows Vista 的最高版本：包含家庭高级版和企业版的全部功能，另加 Ultimate Extras。' },
    ja: { label: 'Ultimate', description: 'Windows Vista の最上位エディション。Home Premium と Enterprise のすべての機能に加えて Ultimate Extras を備えます。' },
    ko: { label: '얼티밋', description: 'Windows Vista의 최상위 에디션입니다. 홈 프리미엄과 엔터프라이즈의 모든 기능에 Ultimate Extras가 추가됩니다.' },
    be: { label: 'Максімальная', description: 'Максімальная рэдакцыя Windows Vista: усё з Home Premium і Enterprise плюс Ultimate Extras.' },
    kk: { label: 'Ультимейт', description: 'Windows Vista-ның ең толық редакциясы: Home Premium және Enterprise-дің барлық мүмкіндіктері және Ultimate Extras.' },
  },
};

// Ubuntu desktop editions in all nine interface languages (en, ru, fr, es, zh, ja, ko, be, kk).
const UBUNTU_EDITION_TRANSLATIONS: Record<string, Partial<Record<Language, OsEditionTranslation>>> = {
  gnome: {
    en: { label: 'GNOME', description: 'The default Ubuntu desktop on the GNOME shell: the top bar, the dock and the Yaru look.' },
    ru: { label: 'GNOME', description: 'Стандартный рабочий стол Ubuntu на оболочке GNOME: верхняя панель, док и оформление Yaru.' },
    fr: { label: 'GNOME', description: 'Bureau Ubuntu par défaut, basé sur l’interface GNOME : barre supérieure, dock et apparence Yaru.' },
    es: { label: 'GNOME', description: 'Escritorio predeterminado de Ubuntu sobre la interfaz GNOME: barra superior, dock y aspecto Yaru.' },
    zh: { label: 'GNOME', description: '基于 GNOME 桌面环境的默认 Ubuntu 桌面：顶部栏、程序坞和 Yaru 外观。' },
    ja: { label: 'GNOME', description: 'GNOME シェルを使う標準の Ubuntu デスクトップです。上部バー、ドック、Yaru の外観を備えます。' },
    ko: { label: 'GNOME', description: 'GNOME 셸을 사용하는 기본 Ubuntu 데스크톱입니다. 상단 막대, 독, Yaru 모양을 갖추고 있습니다.' },
    be: { label: 'GNOME', description: 'Стандартны рабочы стол Ubuntu на абалонцы GNOME: верхняя панэль, док і афармленне Yaru.' },
    kk: { label: 'GNOME', description: 'GNOME қабығындағы әдепкі Ubuntu жұмыс үстелі: жоғарғы жолақ, док және Yaru безендіруі.' },
  },
  xfce: {
    en: { label: 'Xfce', description: 'Ubuntu with the Xfce desktop environment. The cursors use the Xfce set; the panel and window frames still show the shared Ubuntu look.' },
    ru: { label: 'Xfce', description: 'Ubuntu с рабочим столом Xfce. Курсоры взяты из набора Xfce; панель и рамки окон пока в общем оформлении Ubuntu.' },
    fr: { label: 'Xfce', description: 'Ubuntu avec l’environnement de bureau Xfce. Les curseurs viennent du jeu Xfce ; le panneau et les cadres de fenêtres gardent l’apparence Ubuntu commune.' },
    es: { label: 'Xfce', description: 'Ubuntu con el entorno de escritorio Xfce. Los cursores usan el conjunto de Xfce; el panel y los marcos de ventana mantienen el aspecto común de Ubuntu.' },
    zh: { label: 'Xfce', description: '使用 Xfce 桌面环境的 Ubuntu。光标使用 Xfce 光标集；面板和窗口边框仍为 Ubuntu 通用外观。' },
    ja: { label: 'Xfce', description: 'Xfce デスクトップ環境を使う Ubuntu です。カーソルは Xfce のセットを使い、パネルとウィンドウ枠は共通の Ubuntu の外観のままです。' },
    ko: { label: 'Xfce', description: 'Xfce 데스크톱 환경을 사용하는 Ubuntu입니다. 커서는 Xfce 세트를 사용하며, 패널과 창 테두리는 공통 Ubuntu 모양을 유지합니다.' },
    be: { label: 'Xfce', description: 'Ubuntu з асяроддзем працоўнага стала Xfce. Курсоры — з набору Xfce; панэль і рамкі вокнаў пакуль у агульным афармленні Ubuntu.' },
    kk: { label: 'Xfce', description: 'Xfce жұмыс үстелі ортасы бар Ubuntu. Курсорлар Xfce жинағынан алынған; панель мен терезе жиектері әлі ортақ Ubuntu безендіруінде.' },
  },
};

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
      translations: VISTA_EDITION_TRANSLATIONS['starter'],
      labelRu: 'Начальная',
      descriptionRu: 'Урезанная редакция Windows Vista для развивающихся рынков: без Aero, не более трёх одновременно запущенных программ и 1 ГБ памяти. Оформление Windows Vista Basic.',
      backgroundColor: '#1b6c8f',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'home-basic',
      label: 'Home Basic',
      translations: VISTA_EDITION_TRANSLATIONS['home-basic'],
      labelRu: 'Домашняя базовая',
      descriptionRu: 'Базовая домашняя редакция без Aero Glass и Media Center. Окна рисуются в упрощённом стиле Windows Vista Basic.',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'home-premium',
      label: 'Home Premium',
      translations: VISTA_EDITION_TRANSLATIONS['home-premium'],
      labelRu: 'Домашняя расширенная',
      descriptionRu: 'Домашняя редакция с интерфейсом Aero Glass, Windows Media Center, Windows Photo Gallery и записью DVD.',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'business',
      label: 'Business',
      translations: VISTA_EDITION_TRANSLATIONS['business'],
      labelRu: 'Business',
      descriptionRu: 'Редакция для малого бизнеса: Aero Glass, домен Active Directory, удалённый рабочий стол и теневые копии файлов.',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'enterprise',
      label: 'Enterprise',
      translations: VISTA_EDITION_TRANSLATIONS['enterprise'],
      labelRu: 'Корпоративная',
      descriptionRu: 'Корпоративная редакция с BitLocker, многоязычным интерфейсом и подсистемой для UNIX-приложений. Продавалась только по корпоративным лицензиям.',
      buildNumber: 'Build 6002: Service Pack 2',
    },
    {
      id: 'ultimate',
      label: 'Ultimate',
      translations: VISTA_EDITION_TRANSLATIONS['ultimate'],
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
    {
      id: 'v81-core',
      label: '8.1',
      labelRu: 'Windows 8.1',
      descriptionRu: 'Базовая редакция Windows 8.1 - развитие Windows 8 с доработанным интерфейсом и возвратом кнопки Пуск.',
      buildNumber: 'Build 9600',
    },
    {
      id: 'v81-pro',
      label: '8.1 Pro',
      labelRu: 'Windows 8.1 Профессиональная',
      descriptionRu: 'Профессиональная редакция Windows 8.1 с доменом, BitLocker, Hyper-V и удаленным рабочим столом.',
      buildNumber: 'Build 9600',
    },
    {
      id: 'v81-enterprise',
      label: '8.1 Enterprise',
      labelRu: 'Windows 8.1 Корпоративная',
      descriptionRu: 'Корпоративная редакция Windows 8.1 с расширенными средствами управления и сетевыми функциями.',
      buildNumber: 'Build 9600',
    },
    {
      id: 'v81-rt',
      label: 'RT 8.1',
      labelRu: 'Windows RT 8.1',
      descriptionRu: 'Обновленная ARM-редакция для устройств семейства Windows RT.',
      buildNumber: 'Build 9600 (ARM)',
    },
    {
      id: 'v81-with-bing',
      label: '8.1 with Bing',
      labelRu: 'Windows 8.1 with Bing',
      descriptionRu: 'OEM-вариация Windows 8.1 для недорогих устройств с Bing как поиском по умолчанию.',
      buildNumber: 'Build 9600',
    },
  ],
  ubuntu: [
    {
      id: 'gnome',
      label: 'GNOME',
      translations: UBUNTU_EDITION_TRANSLATIONS['gnome'],
      labelRu: 'GNOME',
      descriptionRu: 'Стандартный рабочий стол Ubuntu на оболочке GNOME: верхняя панель, док и оформление Yaru.',
    },
    {
      id: 'xfce',
      label: 'Xfce',
      translations: UBUNTU_EDITION_TRANSLATIONS['xfce'],
      labelRu: 'Xfce',
      descriptionRu: 'Ubuntu с рабочим столом Xfce. Курсоры взяты из набора Xfce; панель и рамки окон пока в общем оформлении Ubuntu.',
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
  // Windows Server 2003 runs on the Windows XP theme but has no XP editions: it must not inherit Home's wallpaper or label.
  if (profileOrThemeId === 'win-xp' && getActiveBootProfileId() === 'server2003') return undefined;
  const editions = getEditionsForProfile(profileOrThemeId);
  if (!editions.length) return undefined;
  const selectedId = getSelectedEditionId(profileOrThemeId);
  return editions.find((ed) => ed.id === selectedId) ?? editions[0];
}

/**
 * Edition name in the given interface language. Russian falls back to labelRu, other languages to the English label.
 */
export function editionLabel(edition: OsEdition, language: Language | string): string {
  return edition.translations?.[language as Language]?.label ?? (language === 'ru' ? edition.labelRu : edition.label);
}

/**
 * Edition description in the given interface language. Editions without a translation keep the Russian text they always had.
 */
export function editionDescription(edition: OsEdition, language: Language | string): string {
  return edition.translations?.[language as Language]?.description ?? edition.descriptionRu;
}
