export type CountryCode = 'RU' | 'KZ' | 'BY' | 'CN' | 'JP' | 'KR' | 'GB';

export const NATIONAL_COUNTRIES: Array<{ code: CountryCode; flag: string; names: Record<'ru' | 'en' | 'fr', string> }> = [
  { code: 'RU', flag: '🇷🇺', names: { ru: 'Россия', en: 'Russia', fr: 'Russie' } },
  { code: 'KZ', flag: '🇰🇿', names: { ru: 'Казахстан', en: 'Kazakhstan', fr: 'Kazakhstan' } },
  { code: 'BY', flag: '🇧🇾', names: { ru: 'Беларусь', en: 'Belarus', fr: 'Biélorussie' } },
  { code: 'CN', flag: '🇨🇳', names: { ru: 'Китай', en: 'China', fr: 'Chine' } },
  { code: 'JP', flag: '🇯🇵', names: { ru: 'Япония', en: 'Japan', fr: 'Japon' } },
  { code: 'KR', flag: '🇰🇷', names: { ru: 'Корея', en: 'Korea', fr: 'Corée' } },
  { code: 'GB', flag: '🇬🇧', names: { ru: 'Великобритания', en: 'United Kingdom', fr: 'Royaume-Uni' } },
];

export interface NationalHoliday {
  id: string;
  date: Date;
  country: CountryCode;
  title: string;
  kind: 'public' | 'memorial' | 'cultural';
}

const fixed: Record<CountryCode, Array<[number, number, string, NationalHoliday['kind']]>> = {
  RU: [[1,1,'Новый год','public'],[1,7,'Рождество Христово','public'],[2,23,'День защитника Отечества','public'],[3,8,'Международный женский день','public'],[5,1,'Праздник Весны и Труда','public'],[5,9,'День Победы','public'],[6,12,'День России','public'],[11,4,'День народного единства','public']],
  KZ: [[1,1,'Новый год','public'],[1,2,'Новый год','public'],[1,7,'Православное Рождество','public'],[3,8,'Международный женский день','public'],[3,21,'Наурыз мейрамы','public'],[3,22,'Наурыз мейрамы','public'],[3,23,'Наурыз мейрамы','public'],[5,1,'Праздник единства народа Казахстана','public'],[5,7,'День защитника Отечества','public'],[5,9,'День Победы','public'],[7,6,'День столицы','public'],[8,30,'День Конституции','public'],[10,25,'День Республики','public'],[12,16,'День Независимости','public']],
  BY: [[1,1,'Новый год','public'],[1,7,'Рождество Христово (православное)','public'],[3,8,'День женщин','public'],[5,1,'Праздник труда','public'],[5,9,'День Победы','public'],[7,3,'День Независимости','public'],[11,7,'День Октябрьской революции','public'],[12,25,'Рождество Христово (католическое)','public']],
  CN: [[1,1,'元旦 · Новый год','public'],[5,1,'劳动节 · День труда','public'],[10,1,'国庆节 · День образования КНР','public']],
  JP: [[1,1,'元日 · Новый год','public'],[2,11,'建国記念の日 · День основания государства','public'],[2,23,'天皇誕生日 · День рождения Императора','public'],[4,29,'昭和の日 · День Сёва','public'],[5,3,'憲法記念日 · День Конституции','public'],[5,4,'みどりの日 · День зелени','public'],[5,5,'こどもの日 · День детей','public'],[8,11,'山の日 · День гор','public'],[11,3,'文化の日 · День культуры','public'],[11,23,'勤労感謝の日 · День благодарности труду','public']],
  KR: [[1,1,'신정 · Новый год','public'],[3,1,'삼일절 · День движения за независимость','public'],[5,5,'어린이날 · День детей','public'],[6,6,'현충일 · День памяти','memorial'],[8,15,'광복절 · День освобождения','public'],[10,3,'개천절 · День основания Кореи','public'],[10,9,'한글날 · День хангыля','public'],[12,25,'성탄절 · Рождество','public']],
  GB: [[1,1,'New Year’s Day · Новый год','public'],[12,25,'Christmas Day · Рождество','public'],[12,26,'Boxing Day · День подарков','public']],
};

function easterSunday(year: number): Date {
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;
  return new Date(year,month-1,day);
}
function nthWeekday(year:number, month:number, weekday:number, nth:number) {
  const first=new Date(year,month-1,1); return new Date(year,month-1,1+((weekday-first.getDay()+7)%7)+(nth-1)*7);
}
function lastWeekday(year:number, month:number, weekday:number) {
  const last=new Date(year,month,0); return new Date(year,month-1,last.getDate()-((last.getDay()-weekday+7)%7));
}
function equinoxDay(year:number, spring:boolean) {
  return Math.floor(spring ? 20.8431+0.242194*(year-1980)-Math.floor((year-1980)/4) : 23.2488+0.242194*(year-1980)-Math.floor((year-1980)/4));
}
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }

export function getNationalHolidays(year: number): NationalHoliday[] {
  const result: NationalHoliday[]=[];
  for (const country of NATIONAL_COUNTRIES) {
    for (const [month,day,title,kind] of fixed[country.code]) {
      result.push({ id:`holiday-${country.code}-${year}-${month}-${day}`, date:new Date(year,month-1,day), country:country.code, title, kind });
    }
  }
  const add=(country:CountryCode,date:Date,title:string,kind:NationalHoliday['kind']='public')=>result.push({id:`holiday-${country}-${dateKey(date)}-${title}`,date,country,title,kind});
  const easter=easterSunday(year);
  add('GB',new Date(year,easter.getMonth(),easter.getDate()-2),'Good Friday');
  add('GB',easter,'Easter Sunday','cultural');
  add('GB',new Date(year,easter.getMonth(),easter.getDate()+1),'Easter Monday');
  add('GB',lastWeekday(year,5,1),'Spring bank holiday');
  add('GB',lastWeekday(year,8,1),'Summer bank holiday');
  add('JP',nthWeekday(year,1,1,2),'成人の日 · День совершеннолетия');
  add('JP',new Date(year,2,equinoxDay(year,true)),'春分の日 · День весеннего равноденствия');
  add('JP',nthWeekday(year,7,1,3),'海の日 · День моря');
  add('JP',nthWeekday(year,9,1,3),'敬老の日 · День почитания старших');
  add('JP',new Date(year,8,equinoxDay(year,false)),'秋分の日 · День осеннего равноденствия');
  add('JP',nthWeekday(year,10,1,2),'スポーツの日 · День спорта');
  // Lunar-calendar holidays are intentionally labelled as indicative until official annual dates are loaded.
  if (year===2026) {
    add('CN',new Date(2026,1,17),'春节 · Китайский Новый год');
    add('CN',new Date(2026,5,19),'端午节 · Праздник драконьих лодок');
    add('CN',new Date(2026,8,25),'中秋节 · Праздник середины осени','cultural');
    add('KR',new Date(2026,1,17),'설날 · Соллаль (Лунный Новый год)');
    add('KR',new Date(2026,8,25),'추석 · Чхусок');
  }
  if (year===2027) {
    add('CN',new Date(2027,1,6),'春节 · Китайский Новый год');
    add('CN',new Date(2027,5,9),'端午节 · Праздник драконьих лодок');
    add('CN',new Date(2027,8,15),'中秋节 · Праздник середины осени','cultural');
    add('KR',new Date(2027,1,6),'설날 · Соллаль (Лунный Новый год)');
    add('KR',new Date(2027,8,15),'추석 · Чхусок');
  }
  return result.sort((a,b)=>a.date.getTime()-b.date.getTime());
}

export function getHolidaysForDate(date: Date): NationalHoliday[] {
  const key=dateKey(date);
  return getNationalHolidays(date.getFullYear()).filter(item=>dateKey(item.date)===key);
}

export function isSelectedCountryWeekend(date: Date, selected: CountryCode[]): boolean {
  if (!selected.length) return false;
  // Saturday/Sunday is the standard weekly rest pattern; country-specific official transfer days
  // require the published annual labour calendar and are not inferred here.
  return date.getDay()===0 || date.getDay()===6;
}

export function loadSelectedLabourCountries(): CountryCode[] {
  if (typeof window==='undefined') return [];
  try {
    const parsed=JSON.parse(window.localStorage.getItem('calendar-labour-countries-v1')||'[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is CountryCode => NATIONAL_COUNTRIES.some(country=>country.code===value)) : [];
  } catch { return []; }
}
export function saveSelectedLabourCountries(countries: CountryCode[]) {
  if (typeof window!=='undefined') {
    try { window.localStorage.setItem('calendar-labour-countries-v1',JSON.stringify(countries)); } catch { /* Session-only fallback. */ }
  }
}
