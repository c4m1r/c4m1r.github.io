import { useSyncExternalStore } from 'react';
export type CountryCode = 'RU' | 'KZ' | 'BY' | 'CN' | 'JP' | 'KR' | 'GB';

export const NATIONAL_COUNTRIES: Array<{ code: CountryCode; flag: string; names: Record<'ru' | 'en' | 'fr' | 'es' | 'zh' | 'ja' | 'ko', string> }> = [
  { code: 'RU', flag: '🇷🇺', names: { ru: 'Россия', en: 'Russia', fr: 'Russie', es: 'Rusia', zh: '俄罗斯', ja: 'ロシア', ko: '러시아' } },
  { code: 'KZ', flag: '🇰🇿', names: { ru: 'Казахстан', en: 'Kazakhstan', fr: 'Kazakhstan', es: 'Kazajistán', zh: '哈萨克斯坦', ja: 'カザフスタン', ko: '카자흐스탄' } },
  { code: 'BY', flag: '🇧🇾', names: { ru: 'Беларусь', en: 'Belarus', fr: 'Biélorussie', es: 'Bielorrusia', zh: '白俄罗斯', ja: 'ベラルーシ', ko: '벨라루스' } },
  { code: 'CN', flag: '🇨🇳', names: { ru: 'Китай', en: 'China', fr: 'Chine', es: 'China', zh: '中国', ja: '中国', ko: '중국' } },
  { code: 'JP', flag: '🇯🇵', names: { ru: 'Япония', en: 'Japan', fr: 'Japon', es: 'Japón', zh: '日本', ja: '日本', ko: '일본' } },
  { code: 'KR', flag: '🇰🇷', names: { ru: 'Южная Корея', en: 'South Korea', fr: 'Corée du Sud', es: 'Corea del Sur', zh: '韩国', ja: '韓国', ko: '대한민국' } },
  { code: 'GB', flag: '🇬🇧', names: { ru: 'Великобритания', en: 'United Kingdom', fr: 'Royaume-Uni', es: 'Reino Unido', zh: '英国', ja: 'イギリス', ko: '영국' } },
];

export interface NationalHoliday {
  id: string;
  date: Date;
  country: CountryCode;
  title: string;
  kind: 'public' | 'memorial' | 'cultural';
}

const fixed: Record<CountryCode, Array<[number, number, string, NationalHoliday['kind']]>> = {
  RU: [[1,1,'Новый год','public'],[1,7,'Рождество Христово','public'],[2,23,'День защитника Отечества','public'],[3,8,'Международный женский день','public'],[5,1,'Праздник Весны и Труда','public'],[5,9,'День Победы','public'],[6,12,'День России','public'],[6,22,'День памяти и скорби','memorial'],[11,4,'День народного единства','public'],[12,9,'День Героев Отечества','memorial']],
  KZ: [[1,1,'Новый год','public'],[1,2,'Новый год','public'],[1,7,'Православное Рождество','public'],[3,8,'Международный женский день','public'],[3,21,'Наурыз мейрамы','public'],[3,22,'Наурыз мейрамы','public'],[3,23,'Наурыз мейрамы','public'],[5,1,'Праздник единства народа Казахстана','public'],[5,7,'День защитника Отечества','public'],[5,9,'День Победы','public'],[5,31,'День памяти жертв политических репрессий и голода','memorial'],[7,6,'День столицы','public'],[10,25,'День Республики','public'],[12,16,'День Независимости','public']],
  BY: [[1,1,'Новый год','public'],[1,7,'Рождество Христово (православное)','public'],[3,8,'День женщин','public'],[5,1,'Праздник труда','public'],[5,9,'День Победы','public'],[6,22,'День всенародной памяти жертв Великой Отечественной войны','memorial'],[7,3,'День Независимости','public'],[11,7,'День Октябрьской революции','public'],[12,25,'Рождество Христово (католическое)','public']],
  CN: [[1,1,'元旦 · Новый год','public'],[5,1,'劳动节 · День труда','public'],[10,1,'国庆节 · День образования КНР','public'],[12,13,'国家公祭日 · День памяти жертв Нанкинской резни','memorial']],
  JP: [[1,1,'元日 · Новый год','public'],[2,11,'建国記念の日 · День основания государства','public'],[2,23,'天皇誕生日 · День рождения Императора','public'],[4,29,'昭和の日 · День Сёва','public'],[5,3,'憲法記念日 · День Конституции','public'],[5,4,'みどりの日 · День зелени','public'],[5,5,'こどもの日 · День детей','public'],[8,6,'広島平和記念日 · День памяти Хиросимы','memorial'],[8,9,'長崎原爆の日 · День памяти Нагасаки','memorial'],[8,11,'山の日 · День гор','public'],[8,15,'終戦の日 · День окончания войны','memorial'],[11,3,'文化の日 · День культуры','public'],[11,23,'勤労感謝の日 · День благодарности труду','public']],
  KR: [[1,1,'신정 · Новый год','public'],[3,1,'삼일절 · День движения за независимость','public'],[5,1,'노동절 · День труда','public'],[5,5,'어린이날 · День детей','public'],[6,6,'현충일 · День памяти','memorial'],[7,17,'제헌절 · День Конституции','public'],[8,15,'광복절 · День освобождения','public'],[10,3,'개천절 · День основания Кореи','public'],[10,9,'한글날 · День хангыля','public'],[12,25,'성탄절 · Рождество','public']],
  GB: [[1,1,'New Year’s Day · Новый год','public'],[11,11,'Remembrance Day · День поминовения','memorial'],[12,25,'Christmas Day · Рождество','public'],[12,26,'Boxing Day · День подарков','public']],
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

const nationalHolidayCache = new Map<number, NationalHoliday[]>();
export function getNationalHolidays(year: number): NationalHoliday[] {
  const cached = nationalHolidayCache.get(year);
  if (cached) return cached;
  const result: NationalHoliday[]=[];
  for (const country of NATIONAL_COUNTRIES) {
    if (country.code === 'GB' || (['JP','CN','KR'].includes(country.code) && (year===2026 || year===2027))) continue;
    for (const [month,day,title,kind] of fixed[country.code]) {
      result.push({ id:`holiday-${country.code}-${year}-${month}-${day}`, date:new Date(year,month-1,day), country:country.code, title, kind });
    }
  }
  const add=(country:CountryCode,date:Date,title:string,kind:NationalHoliday['kind']='public')=>result.push({id:`holiday-${country}-${dateKey(date)}-${title}`,date,country,title,kind});
  add('KZ',new Date(year,year>=2026?2:7,year>=2026?15:30),'День Конституции');
  const easter=easterSunday(year);
  // Japan: Cabinet Office annual national-holiday lists (2026/2027), including substitute/citizen holidays.
  if (year === 2026) {
    const jp: Array<[number,number,string]> = [
      [1,1,'元日 · Новый год'],[1,12,'成人の日 · День совершеннолетия'],[2,11,'建国記念の日 · День основания государства'],
      [2,23,'天皇誕生日 · День рождения Императора'],[3,20,'春分の日 · День весеннего равноденствия'],
      [4,29,'昭和の日 · День Сёва'],[5,3,'憲法記念日 · День Конституции'],[5,4,'みどりの日 · День зелени'],
      [5,5,'こどもの日 · День детей'],[5,6,'振替休日 · Перенесённый выходной'],[7,20,'海の日 · День моря'],
      [8,11,'山の日 · День гор'],[9,21,'敬老の日 · День почитания старших'],[9,22,'国民の休日 · Дополнительный государственный выходной'],
      [9,23,'秋分の日 · День осеннего равноденствия'],[10,12,'スポーツの日 · День спорта'],
      [11,3,'文化の日 · День культуры'],[11,23,'勤労感謝の日 · День благодарности труду'],
    ];
    jp.forEach(([month,day,title])=>add('JP',new Date(year,month-1,day),title));
  } else if (year === 2027) {
    const jp: Array<[number,number,string]> = [
      [1,1,'元日 · Новый год'],[1,11,'成人の日 · День совершеннолетия'],[2,11,'建国記念の日 · День основания государства'],
      [2,23,'天皇誕生日 · День рождения Императора'],[3,21,'春分の日 · День весеннего равноденствия'],
      [3,22,'振替休日 · Перенесённый выходной'],[4,29,'昭和の日 · День Сёва'],[5,3,'憲法記念日 · День Конституции'],
      [5,4,'みどりの日 · День зелени'],[5,5,'こどもの日 · День детей'],[7,19,'海の日 · День моря'],
      [8,11,'山の日 · День гор'],[9,20,'敬老の日 · День почитания старших'],[9,23,'秋分の日 · День осеннего равноденствия'],
      [10,11,'スポーツの日 · День спорта'],[11,3,'文化の日 · День культуры'],[11,23,'勤労感謝の日 · День благодарности труду'],
    ];
    jp.forEach(([month,day,title])=>add('JP',new Date(year,month-1,day),title));
  } else {
    add('JP',nthWeekday(year,1,1,2),'成人の日 · День совершеннолетия');
    add('JP',new Date(year,2,equinoxDay(year,true)),'春分の日 · День весеннего равноденствия');
    add('JP',nthWeekday(year,7,1,3),'海の日 · День моря');
    add('JP',nthWeekday(year,9,1,3),'敬老の日 · День почитания старших');
    add('JP',new Date(year,8,equinoxDay(year,false)),'秋分の日 · День осеннего равноденствия');
    add('JP',nthWeekday(year,10,1,2),'スポーツの日 · День спорта');
  }
  // Japan's memorial dates are not statutory days off, but remain visible every year.
  if(year===2026 || year===2027){
    add('JP',new Date(year,7,6),'広島平和記念日 · День памяти Хиросимы','memorial');
    add('JP',new Date(year,7,9),'長崎原爆の日 · День памяти Нагасаки','memorial');
    add('JP',new Date(year,7,15),'終戦の日 · День окончания войны','memorial');
  }
  // Annual memorial markers remain separate from labour-day status.
  add('GB',new Date(year,10,11),'Remembrance Day · День поминовения','memorial');
  if(year===2026 || year===2027) add('CN',new Date(year,11,13),'国家公祭日 · День памяти жертв Нанкинской резни','memorial');
  // China: official State Council holiday arrangements for 2026 and 2027.
  const addRange=(country:CountryCode,startMonth:number,startDay:number,endMonth:number,endDay:number,title:string,kind:NationalHoliday['kind']='public')=>{
    const cursor=new Date(year,startMonth-1,startDay); const end=new Date(year,endMonth-1,endDay);
    while(cursor<=end){add(country,new Date(cursor),title,kind);cursor.setDate(cursor.getDate()+1);}
  };
  if (year===2026) {
    addRange('CN',1,1,1,3,'元旦 · Новый год');
    addRange('CN',2,15,2,23,'春节 · Китайский Новый год');
    addRange('CN',4,4,4,6,'清明节 · Праздник Цинмин');
    addRange('CN',5,1,5,5,'劳动节 · День труда');
    addRange('CN',6,19,6,21,'端午节 · Праздник драконьих лодок');
    addRange('CN',9,25,9,27,'中秋节 · Праздник середины осени','cultural');
    addRange('CN',10,1,10,7,'国庆节 · День образования КНР');
  } else if (year===2027) {
    addRange('CN',1,1,1,3,'元旦 · Новый год');
    addRange('CN',2,5,2,13,'春节 · Китайский Новый год');
    addRange('CN',4,3,4,5,'清明节 · Праздник Цинмин');
    addRange('CN',5,1,5,5,'劳动节 · День труда');
    add('CN',new Date(year,5,9),'端午节 · Праздник драконьих лодок');
    add('CN',new Date(year,8,15),'中秋节 · Праздник середины осени','cultural');
    addRange('CN',10,1,10,7,'国庆节 · День образования КНР');
  }
  // South Korea: public holiday dates and substitute days for 2026/2027.
  if (year===2026) {
    add('KR',new Date(year,0,1),'신정 · Новый год');
    addRange('KR',2,16,2,18,'설날 · Соллаль (Лунный Новый год)');
    add('KR',new Date(year,2,1),'삼일절 · День движения за независимость');
    add('KR',new Date(year,2,2),'대체공휴일 · Перенесённый выходной');
    add('KR',new Date(year,4,1),'노동절 · День труда');
    add('KR',new Date(year,4,5),'어린이날 · День детей');
    add('KR',new Date(year,4,24),'부처님오신날 · День рождения Будды');
    add('KR',new Date(year,4,25),'대체공휴일 · Перенесённый выходной');
    add('KR',new Date(year,5,3),'지방선거일 · День местных выборов');
    add('KR',new Date(year,5,6),'현충일 · День памяти','memorial');
    add('KR',new Date(year,6,17),'제헌절 · День Конституции');
    add('KR',new Date(year,7,15),'광복절 · День освобождения');
    add('KR',new Date(year,7,17),'대체공휴일 · Перенесённый выходной');
    addRange('KR',9,24,9,26,'추석 · Чхусок');
    add('KR',new Date(year,9,3),'개천절 · День основания Кореи');
    add('KR',new Date(year,9,5),'대체공휴일 · Перенесённый выходной');
    add('KR',new Date(year,9,9),'한글날 · День хангыля');
    add('KR',new Date(year,11,25),'성탄절 · Рождество');
  } else if (year===2027) {
    add('KR',new Date(year,0,1),'신정 · Новый год');
    addRange('KR',2,6,2,8,'설날 · Соллаль (Лунный Новый год)');
    add('KR',new Date(year,1,9),'대체공휴일 · Перенесённый выходной');
    add('KR',new Date(year,2,1),'삼일절 · День движения за независимость');
    add('KR',new Date(year,4,1),'노동절 · День труда');
    add('KR',new Date(year,4,3),'대체공휴일 · Перенесённый выходной');
    add('KR',new Date(year,4,5),'어린이날 · День детей');
    add('KR',new Date(year,4,13),'부처님오신날 · День рождения Будды');
    add('KR',new Date(year,5,6),'현충일 · День памяти','memorial');
    add('KR',new Date(year,6,17),'제헌절 · День Конституции');
    add('KR',new Date(year,6,19),'대체공휴일 · Перенесённый выходной');
    add('KR',new Date(year,7,15),'광복절 · День освобождения');
    add('KR',new Date(year,7,16),'대체공휴일 · Перенесённый выходной');
    addRange('KR',9,14,9,16,'추석 · Чхусок');
    add('KR',new Date(year,9,3),'개천절 · День основания Кореи');
    add('KR',new Date(year,9,4),'대체공휴일 · Перенесённый выходной');
    add('KR',new Date(year,9,9),'한글날 · День хангыля');
    add('KR',new Date(year,9,11),'대체공휴일 · Перенесённый выходной');
    add('KR',new Date(year,11,25),'성탄절 · Рождество');
    add('KR',new Date(year,11,27),'대체공휴일 · Перенесённый выходной');
  }
  // Annual transferred days are shown as separate markers so the reason for a weekday closure is visible.
  if(year===2026){
    [['RU','2026-01-09'],['RU','2026-03-09'],['RU','2026-05-11'],['RU','2026-12-31'],
     ['KZ','2026-03-09'],['KZ','2026-03-24'],['KZ','2026-03-25'],['KZ','2026-05-11'],['KZ','2026-10-26']]
      .forEach(([country,key])=>{const [y,m,d]=key.split('-').map(Number);add(country as CountryCode,new Date(y,m-1,d),'Перенесённый выходной');});
    add('BY',new Date(year,3,21),'Радуница');
  }
  if(year===2027){
    [['RU','2027-02-22'],['RU','2027-11-05'],['RU','2027-12-31']]
      .forEach(([country,key])=>{const [y,m,d]=key.split('-').map(Number);add(country as CountryCode,new Date(y,m-1,d),'Перенесённый выходной');});
    add('BY',new Date(year,4,10),'Перенесённый выходной');
    add('BY',new Date(year,4,11),'Радуница');
  }
  // Beyond the published 2026 Kazakhstan schedule, derive statutory substitute days
  // from the labour-code rule and mark them explicitly until a year-specific schedule is published.
  if(year!==2026){
    const kzPublic=result.filter((holiday)=>holiday.country==='KZ'&&holiday.kind==='public');
    const occupied=new Set(kzPublic.map((holiday)=>dateKey(holiday.date)));
    for(const holiday of kzPublic){
      if(holiday.date.getDay()!==0 && holiday.date.getDay()!==6) continue;
      const substitute=new Date(holiday.date);
      do { substitute.setDate(substitute.getDate()+1); }
      while(substitute.getDay()===0 || substitute.getDay()===6 || occupied.has(dateKey(substitute)));
      const key=dateKey(substitute);
      if(!result.some((item)=>item.country==='KZ'&&dateKey(item.date)===key)){
        add('KZ',substitute,'Перенесённый выходной');
        occupied.add(key);
      }
    }
  }
  // For years without a published annual resolution, derive only the statutory weekend-substitute rules.
  if(year>2027){
    const transferWeekendHolidays=(country:CountryCode,skipNewYear=false,onlySunday=false)=>{
      const base=result.filter((holiday)=>holiday.country===country&&holiday.kind==='public'&&
        !(skipNewYear&&holiday.date.getMonth()===0&&holiday.date.getDate()<=8));
      const occupied=new Set(base.map((holiday)=>dateKey(holiday.date)));
      for(const holiday of base){
        if(onlySunday ? holiday.date.getDay()!==0 : holiday.date.getDay()!==0&&holiday.date.getDay()!==6) continue;
        const substitute=new Date(holiday.date);
        do { substitute.setDate(substitute.getDate()+1); }
        while(substitute.getDay()===0||substitute.getDay()===6||occupied.has(dateKey(substitute)));
        const key=dateKey(substitute);
        if(!result.some((item)=>item.country===country&&dateKey(item.date)===key)){
          add(country,substitute,'Перенесённый выходной');
          occupied.add(key);
        }
      }
    };
    transferWeekendHolidays('RU',true,false);
    transferWeekendHolidays('JP',false,true);
  }
  // UK bank holidays: England and Wales baseline (regional calendars differ).
  add('GB',new Date(year, easter.getMonth(), easter.getDate()-2),'Good Friday');
  add('GB',easter,'Easter Sunday','cultural');
  add('GB',new Date(year, easter.getMonth(), easter.getDate()+1),'Easter Monday');
  add('GB',nthWeekday(year,5,1,1),'Early May bank holiday');
  add('GB',lastWeekday(year,5,1),'Spring bank holiday');
  add('GB',lastWeekday(year,8,1),'Summer bank holiday');
  add('GB',new Date(year,0,1),'New Year’s Day');
  add('GB',new Date(year,11,25),'Christmas Day');
  add('GB',new Date(year,11,26),'Boxing Day');
  const ukOccupied=new Set([dateKey(new Date(year,11,25)),dateKey(new Date(year,11,26))]);
  const ukSubstituteDates=new Set<string>();
  for(const [month,day,title] of [[0,1,'New Year’s Day (substitute day)'],[11,25,'Christmas Day (substitute day)'],[11,26,'Boxing Day (substitute day)']] as Array<[number,number,string]>){
    const holidayDate=new Date(year,month,day);
    if(holidayDate.getDay()!==0 && holidayDate.getDay()!==6) continue;
    const substitute=new Date(holidayDate);
    do { substitute.setDate(substitute.getDate()+1); }
    while(substitute.getDay()===0 || substitute.getDay()===6 || ukOccupied.has(dateKey(substitute)) || ukSubstituteDates.has(dateKey(substitute)));
    const key=dateKey(substitute);
    ukSubstituteDates.add(key);
    add('GB',substitute,title);
  }
  result.sort((a,b)=>a.date.getTime()-b.date.getTime());
  nationalHolidayCache.set(year, result);
  return result;
}


const holidayTranslations: Record<string, Partial<Record<'ru' | 'en' | 'fr' | 'es' | 'zh' | 'ja' | 'ko', string>>> = {
  'Новый год': { en: 'New Year', fr: 'Nouvel An' },
  'Рождество Христово': { en: 'Orthodox Christmas', fr: 'Noël orthodoxe' },
  'Православное Рождество': { en: 'Orthodox Christmas', fr: 'Noël orthodoxe' },
  'День защитника Отечества': { en: 'Defender of the Fatherland Day', fr: 'Jour du défenseur de la patrie' },
  'Международный женский день': { en: 'International Women’s Day', fr: 'Journée internationale des femmes' },
  'Праздник Весны и Труда': { en: 'Spring and Labour Day', fr: 'Fête du printemps et du travail' },
  'День Победы': { en: 'Victory Day', fr: 'Jour de la Victoire' },
  'День России': { en: 'Russia Day', fr: 'Jour de la Russie' },
  'День народного единства': { en: 'Unity Day', fr: 'Jour de l’unité nationale' },
  'Наурыз мейрамы': { en: 'Nauryz', fr: 'Nauryz' },
  'Праздник единства народа Казахстана': { en: 'Unity Day of the People of Kazakhstan', fr: 'Fête de l’unité du peuple du Kazakhstan' },
  'День столицы': { en: 'Capital City Day', fr: 'Jour de la capitale' },
  'День Конституции': { en: 'Constitution Day', fr: 'Jour de la Constitution' },
  'День Республики': { en: 'Republic Day', fr: 'Jour de la République' },
  'День Независимости': { en: 'Independence Day', fr: 'Jour de l’indépendance' },
  'День женщин': { en: 'Women’s Day', fr: 'Journée des femmes' },
  'Праздник труда': { en: 'Labour Day', fr: 'Fête du travail' },
  'День Октябрьской революции': { en: 'October Revolution Day', fr: 'Jour de la révolution d’Octobre' },
  'Рождество Христово (православное)': { en: 'Orthodox Christmas', fr: 'Noël orthodoxe' },
  'Рождество Христово (католическое)': { en: 'Catholic Christmas', fr: 'Noël catholique' },
  'День основания государства': { en: 'National Foundation Day', fr: 'Jour de la fondation nationale' },
  'День рождения Императора': { en: 'Emperor’s Birthday', fr: 'Anniversaire de l’empereur' },
  'День Сёва': { en: 'Showa Day', fr: 'Jour de Shōwa' },
  'День зелени': { en: 'Greenery Day', fr: 'Jour de la verdure' },
  'День детей': { en: 'Children’s Day', fr: 'Fête des enfants' },
  'День гор': { en: 'Mountain Day', fr: 'Jour de la montagne' },
  'День культуры': { en: 'Culture Day', fr: 'Jour de la culture' },
  'День благодарности труду': { en: 'Labour Thanksgiving Day', fr: 'Jour d’action de grâce au travail' },
  'День движения за независимость': { en: 'Independence Movement Day', fr: 'Jour du mouvement d’indépendance' },
  'День памяти': { en: 'Memorial Day', fr: 'Jour du souvenir' },
  'День освобождения': { en: 'Liberation Day', fr: 'Jour de la libération' },
  'День основания Кореи': { en: 'National Foundation Day', fr: 'Jour de la fondation nationale' },
  'День хангыля': { en: 'Hangul Day', fr: 'Jour du hangeul' },
  'Рождество': { en: 'Christmas Day', fr: 'Noël' },
  'Китайский Новый год': { en: 'Lunar New Year', fr: 'Nouvel An lunaire' },
  'Праздник драконьих лодок': { en: 'Dragon Boat Festival', fr: 'Fête des bateaux-dragons' },
  'Праздник середины осени': { en: 'Mid-Autumn Festival', fr: 'Fête de la mi-automne' },
  'Соллаль (Лунный Новый год)': { en: 'Seollal (Lunar New Year)', fr: 'Seollal (Nouvel An lunaire)' },
  'Чхусок': { en: 'Chuseok', fr: 'Chuseok' },
  'День совершеннолетия': { en: 'Coming of Age Day', fr: 'Jour de la majorité' },
  'День весеннего равноденствия': { en: 'Vernal Equinox Day', fr: 'Jour de l’équinoxe de printemps' },
  'День моря': { en: 'Marine Day', fr: 'Jour de la mer' },
  'День почитания старших': { en: 'Respect for the Aged Day', fr: 'Jour du respect envers les personnes âgées' },
  'День осеннего равноденствия': { en: 'Autumnal Equinox Day', fr: 'Jour de l’équinoxe d’automne' },
  'День спорта': { en: 'Sports Day', fr: 'Jour du sport' },
  'День подарков': { en: 'Boxing Day', fr: 'Lendemain de Noël' },
  'День памяти и скорби': { en: 'Day of Remembrance and Sorrow', fr: 'Jour du souvenir et du chagrin' },
  'День Героев Отечества': { en: 'Fatherland Heroes Day', fr: 'Jour des héros de la patrie' },
  'День памяти жертв политических репрессий и голода': { en: 'Day of Remembrance for Victims of Political Repression and Famine', fr: 'Jour du souvenir des victimes de la répression politique et de la famine' },
  'День всенародной памяти жертв Великой Отечественной войны': { en: 'National Remembrance Day for Victims of the Great Patriotic War', fr: 'Jour national du souvenir des victimes de la Grande Guerre patriotique' },
  'День памяти жертв Нанкинской резни': { en: 'Nanjing Massacre Memorial Day', fr: 'Journée commémorative du massacre de Nankin' },
  'День памяти Хиросимы': { en: 'Hiroshima Peace Memorial Day', fr: 'Journée commémorative d’Hiroshima' },
  'День памяти Нагасаки': { en: 'Nagasaki Memorial Day', fr: 'Journée commémorative de Nagasaki' },
  'День окончания войны': { en: 'End of the War Memorial Day', fr: 'Jour commémoratif de la fin de la guerre' },
  'День поминовения': { en: 'Remembrance Day', fr: 'Jour du Souvenir' },
  'Перенесённый выходной': { en: 'Substitute day off', fr: 'Jour de repos de remplacement' },
  'Дополнительный государственный выходной': { en: 'Additional public holiday', fr: 'Jour férié supplémentaire' },
  'Праздник Цинмин': { en: 'Qingming Festival', fr: 'Fête de Qingming' },
  'День местных выборов': { en: 'Local Election Day', fr: 'Jour des élections locales' },
  'День рождения Будды': { en: 'Buddha’s Birthday', fr: 'Anniversaire de Bouddha' },
  'День труда': { en: 'Labour Day', fr: 'Fête du travail' },

  'Good Friday': { ru: 'Страстная пятница', fr: 'Vendredi saint' },
  'Early May bank holiday': { ru: 'Ранний майский банковский выходной', fr: 'Jour férié du début mai' },
  'New Year’s Day (substitute day)': { ru: 'Перенос выходного на Новый год', fr: 'Jour de remplacement du Nouvel An' },
  'Christmas Day (substitute day)': { ru: 'Перенос выходного на Рождество', fr: 'Jour de remplacement de Noël' },
  'Boxing Day (substitute day)': { ru: 'Перенос выходного на День подарков', fr: 'Jour de remplacement du lendemain de Noël' },
  'Easter Sunday': { ru: 'Пасхальное воскресенье', fr: 'Dimanche de Pâques' },
  'Easter Monday': { ru: 'Пасхальный понедельник', fr: 'Lundi de Pâques' },
  'Spring bank holiday': { ru: 'Весенний банковский выходной', fr: 'Jour férié de printemps' },
  'Summer bank holiday': { ru: 'Летний банковский выходной', fr: 'Jour férié d’été' },
  'New Year’s Day': { ru: 'Новый год', fr: 'Jour de l’An' },
  'Christmas Day': { ru: 'Рождество', fr: 'Jour de Noël' },
  'Boxing Day': { ru: 'День подарков', fr: 'Lendemain de Noël' },
};

const additionalHolidayTranslations: Record<string, Partial<Record<'ru' | 'en' | 'fr' | 'es' | 'zh' | 'ja' | 'ko', string>>> = {
  'Новый год': { es: 'Año Nuevo', zh: '元旦', ja: '元日', ko: '새해' },
  'Рождество Христово': { es: 'Navidad ortodoxa', zh: '东正教圣诞节', ja: '正教会のクリスマス', ko: '정교회 성탄절' },
  'Православное Рождество': { es: 'Navidad ortodoxa', zh: '东正教圣诞节', ja: '正教会のクリスマス', ko: '정교회 성탄절' },
  'День защитника Отечества': { es: 'Día del Defensor de la Patria', zh: '祖国保卫者日', ja: '祖国防衛の日', ko: '조국 수호자의 날' },
  'Международный женский день': { es: 'Día Internacional de la Mujer', zh: '国际妇女节', ja: '国際女性デー', ko: '세계 여성의 날' },
  'Праздник Весны и Труда': { es: 'Fiesta de la Primavera y del Trabajo', zh: '春季和劳动节', ja: '春と労働の祝日', ko: '봄과 노동절' },
  'День Победы': { es: 'Día de la Victoria', zh: '胜利日', ja: '戦勝記念日', ko: '전승기념일' },
  'День России': { es: 'Día de Rusia', zh: '俄罗斯日', ja: 'ロシアの日', ko: '러시아의 날' },
  'День народного единства': { es: 'Día de la Unidad Nacional', zh: '民族团结日', ja: '国民団結の日', ko: '국민 단결의 날' },
  'Наурыз мейрамы': { es: 'Fiesta de Nauryz', zh: '纳乌鲁兹节', ja: 'ナウルーズ祭', ko: '나우루즈 축제' },
  'Праздник единства народа Казахстана': { es: 'Día de la Unidad del Pueblo de Kazajistán', zh: '哈萨克斯坦人民团结日', ja: 'カザフスタン人民統一の日', ko: '카자흐스탄 국민 단결의 날' },
  'День столицы': { es: 'Día de la Capital', zh: '首都日', ja: '首都の日', ko: '수도의 날' },
  'День Конституции': { es: 'Día de la Constitución', zh: '宪法日', ja: '憲法記念日', ko: '헌법 기념일' },
  'День Республики': { es: 'Día de la República', zh: '共和国日', ja: '共和国記念日', ko: '공화국의 날' },
  'День Независимости': { es: 'Día de la Independencia', zh: '独立日', ja: '独立記念日', ko: '독립기념일' },
  'День женщин': { es: 'Día de la Mujer', zh: '妇女节', ja: '女性の日', ko: '여성의 날' },
  'Праздник труда': { es: 'Día del Trabajo', zh: '劳动节', ja: 'メーデー', ko: '노동절' },
  'День Октябрьской революции': { es: 'Día de la Revolución de Octubre', zh: '十月革命纪念日', ja: '十月革命記念日', ko: '10월 혁명 기념일' },
  'Рождество Христово (православное)': { es: 'Navidad ortodoxa', zh: '东正教圣诞节', ja: '正教会のクリスマス', ko: '정교회 성탄절' },
  'Рождество Христово (католическое)': { es: 'Navidad católica', zh: '天主教圣诞节', ja: 'カトリックのクリスマス', ko: '가톨릭 성탄절' },
  'День основания государства': { es: 'Día de la Fundación Nacional', zh: '建国纪念日', ja: '建国記念の日', ko: '건국기념일' },
  'День рождения Императора': { es: 'Cumpleaños del Emperador', zh: '天皇诞生日', ja: '天皇誕生日', ko: '천황 탄생일' },
  'День Сёва': { es: 'Día de Shōwa', zh: '昭和之日', ja: '昭和の日', ko: '쇼와의 날' },
  'День зелени': { es: 'Día de la Naturaleza', zh: '绿之日', ja: 'みどりの日', ko: '녹색의 날' },
  'День детей': { es: 'Día del Niño', zh: '儿童节', ja: 'こどもの日', ko: '어린이날' },
  'День гор': { es: 'Día de la Montaña', zh: '山之日', ja: '山の日', ko: '산의 날' },
  'День культуры': { es: 'Día de la Cultura', zh: '文化之日', ja: '文化の日', ko: '문화의 날' },
  'День благодарности труду': { es: 'Día de Acción de Gracias al Trabajo', zh: '勤劳感谢日', ja: '勤労感謝の日', ko: '근로감사의 날' },
  'День движения за независимость': { es: 'Día del Movimiento de Independencia', zh: '三一运动纪念日', ja: '三一節', ko: '삼일절' },
  'День памяти': { es: 'Día de Conmemoración', zh: '纪念日', ja: '慰霊の日', ko: '추모일' },
  'День освобождения': { es: 'Día de la Liberación', zh: '解放日', ja: '解放記念日', ko: '광복절' },
  'День основания Кореи': { es: 'Día de la Fundación de Corea', zh: '开天节', ja: '開天節', ko: '개천절' },
  'День хангыля': { es: 'Día del Hangul', zh: '韩文日', ja: 'ハングルの日', ko: '한글날' },
  'Рождество': { es: 'Navidad', zh: '圣诞节', ja: 'クリスマス', ko: '성탄절' },
  'Китайский Новый год': { es: 'Año Nuevo Lunar', zh: '春节', ja: '旧正月', ko: '설날' },
  'Праздник драконьих лодок': { es: 'Festival del Bote del Dragón', zh: '端午节', ja: '端午の節句', ko: '단오' },
  'Праздник середины осени': { es: 'Festival del Medio Otoño', zh: '中秋节', ja: '中秋節', ko: '추석' },
  'Соллаль (Лунный Новый год)': { es: 'Seollal (Año Nuevo Lunar)', zh: '春节', ja: 'ソルラル', ko: '설날' },
  'Чхусок': { es: 'Chuseok', zh: '秋夕', ja: '秋夕', ko: '추석' },
  'День совершеннолетия': { es: 'Día de la Mayoría de Edad', zh: '成人节', ja: '成人の日', ko: '성인의 날' },
  'День весеннего равноденствия': { es: 'Día del Equinoccio de Primavera', zh: '春分日', ja: '春分の日', ko: '춘분' },
  'День моря': { es: 'Día del Mar', zh: '海之日', ja: '海の日', ko: '바다의 날' },
  'День почитания старших': { es: 'Día del Respeto a los Mayores', zh: '敬老日', ja: '敬老の日', ko: '경로의 날' },
  'День осеннего равноденствия': { es: 'Día del Equinoccio de Otoño', zh: '秋分日', ja: '秋分の日', ko: '추분' },
  'День спорта': { es: 'Día del Deporte', zh: '体育日', ja: 'スポーツの日', ko: '스포츠의 날' },
  'День подарков': { es: 'Día de las Cajas', zh: '节礼日', ja: 'ボクシング・デー', ko: '박싱 데이' },
  'День памяти и скорби': { es: 'Día del Recuerdo y el Dolor', zh: '悲伤纪念日', ja: '記憶と悲しみの日', ko: '추모와 애도의 날' },
  'День Героев Отечества': { es: 'Día de los Héroes de la Patria', zh: '祖国英雄日', ja: '祖国英雄の日', ko: '조국 영웅의 날' },
  'День памяти жертв политических репрессий и голода': { es: 'Día de Recuerdo de las Víctimas de la Represión y la Hambruna', zh: '政治镇压和饥荒受害者纪念日', ja: '政治弾圧と飢饉の犠牲者追悼日', ko: '정치적 탄압과 기근 희생자 추모일' },
  'День всенародной памяти жертв Великой Отечественной войны': { es: 'Día Nacional de Recuerdo de las Víctimas de la Gran Guerra Patria', zh: '卫国战争遇难者纪念日', ja: '大祖国戦争犠牲者追悼日', ko: '대조국전쟁 희생자 추모일' },
  'День памяти жертв Нанкинской резни': { es: 'Día Conmemorativo de la Masacre de Nankín', zh: '南京大屠杀死难者国家公祭日', ja: '南京事件犠牲者追悼日', ko: '난징 대학살 추모일' },
  'День памяти Хиросимы': { es: 'Día Conmemorativo de Hiroshima', zh: '广岛和平纪念日', ja: '広島平和記念日', ko: '히로시마 평화기념일' },
  'День памяти Нагасаки': { es: 'Día Conmemorativo de Nagasaki', zh: '长崎原爆纪念日', ja: '長崎原爆の日', ko: '나가사키 원폭의 날' },
  'День окончания войны': { es: 'Día Conmemorativo del Fin de la Guerra', zh: '终战纪念日', ja: '終戦の日', ko: '종전 기념일' },
  'День поминовения': { es: 'Día del Recuerdo', zh: '阵亡将士纪念日', ja: '追悼の日', ko: '현충일' },
  'Перенесённый выходной': { es: 'Día festivo trasladado', zh: '调休假日', ja: '振替休日', ko: '대체공휴일' },
  'Дополнительный государственный выходной': { es: 'Festivo público adicional', zh: '额外公共假日', ja: '追加の祝日', ko: '추가 공휴일' },
  'Праздник Цинмин': { es: 'Festival Qingming', zh: '清明节', ja: '清明節', ko: '청명절' },
  'День местных выборов': { es: 'Día de Elecciones Locales', zh: '地方选举日', ja: '地方選挙日', ko: '지방선거일' },
  'День рождения Будды': { es: 'Cumpleaños de Buda', zh: '佛诞日', ja: '花祭り', ko: '부처님오신날' },
  'День труда': { es: 'Día del Trabajo', zh: '劳动节', ja: 'メーデー', ko: '노동절' },
  'Good Friday': { es: 'Viernes Santo', zh: '耶稣受难日', ja: '聖金曜日', ko: '성금요일' },
  'Easter Sunday': { es: 'Domingo de Pascua', zh: '复活节主日', ja: '復活祭の日曜日', ko: '부활절 일요일' },
  'Easter Monday': { es: 'Lunes de Pascua', zh: '复活节星期一', ja: 'イースターマンデー', ko: '부활절 월요일' },
  'Early May bank holiday': { es: 'Festivo bancario de principios de mayo', zh: '五月初银行假日', ja: '5月初めのバンクホリデー', ko: '5월 초 은행 공휴일' },
  'Spring bank holiday': { es: 'Festivo bancario de primavera', zh: '春季银行假日', ja: '春のバンクホリデー', ko: '봄 은행 공휴일' },
  'Summer bank holiday': { es: 'Festivo bancario de verano', zh: '夏季银行假日', ja: '夏のバンクホリデー', ko: '여름 은행 공휴일' },
  'New Year’s Day': { es: 'Año Nuevo', zh: '元旦', ja: '元日', ko: '새해 첫날' },
  'Christmas Day': { es: 'Día de Navidad', zh: '圣诞节', ja: 'クリスマス', ko: '성탄절' },
  'Boxing Day': { es: 'Día de las Cajas', zh: '节礼日', ja: 'ボクシング・デー', ko: '박싱 데이' },
  'New Year’s Day (substitute day)': { es: 'Festivo sustitutorio de Año Nuevo', zh: '元旦补休日', ja: '元日振替休日', ko: '새해 대체공휴일' },
  'Christmas Day (substitute day)': { es: 'Festivo sustitutorio de Navidad', zh: '圣诞节补休日', ja: 'クリスマス振替休日', ko: '성탄절 대체공휴일' },
  'Boxing Day (substitute day)': { es: 'Festivo sustitutorio del Día de las Cajas', zh: '节礼日补休日', ja: 'ボクシング・デー振替休日', ko: '박싱 데이 대체공휴일' },
};
for (const [title, translations] of Object.entries(additionalHolidayTranslations)) {
  holidayTranslations[title] = { ...holidayTranslations[title], ...translations };
}

export function getHolidayTitle(holiday: NationalHoliday, locale: string): string {
  const language = locale.split('-')[0].toLowerCase() as 'ru' | 'en' | 'fr' | 'es' | 'zh' | 'ja' | 'ko';
  const separator = ' · ';
  const russian = holiday.title.includes(separator) ? holiday.title.split(separator).slice(1).join(separator) : holiday.title;
  const translated = holidayTranslations[russian]?.[language] ?? holidayTranslations[russian]?.en;
  const native = holiday.title.includes(separator) ? holiday.title.split(separator)[0] : '';
  const nativeLanguage: Partial<Record<CountryCode, string>> = { CN: 'zh', JP: 'ja', KR: 'ko' };
  if (language === 'ru') return holiday.title.includes(separator) ? russian : holidayTranslations[holiday.title]?.ru ?? holiday.title;
  if (native && nativeLanguage[holiday.country] === language) return native;
  if (translated) return native ? (native === translated ? native : `${native} · ${translated}`) : translated;
  return native || holiday.title;
}

export function getHolidaysForDate(date: Date): NationalHoliday[] {
  const key=dateKey(date);
  return getNationalHolidays(date.getFullYear()).filter(item=>dateKey(item.date)===key);
}

const labourOverrides: Record<number, Partial<Record<CountryCode, { off: string[]; work: string[] }>>> = {
  2026: {
    RU: { off: ['2026-01-01','2026-01-02','2026-01-05','2026-01-06','2026-01-07','2026-01-08','2026-01-09','2026-02-23','2026-03-09','2026-05-01','2026-05-11','2026-06-12','2026-11-04','2026-12-31'], work: [] },
    KZ: { off: ['2026-01-01','2026-01-02','2026-01-07','2026-03-09','2026-03-15','2026-03-21','2026-03-22','2026-03-23','2026-03-24','2026-03-25','2026-05-01','2026-05-07','2026-05-09','2026-05-11','2026-05-27','2026-07-06','2026-10-25','2026-10-26','2026-12-16'], work: [] },
    BY: { off: ['2026-01-01','2026-01-02','2026-01-07','2026-03-08','2026-04-20','2026-04-21','2026-05-01','2026-05-09','2026-07-03','2026-11-07','2026-12-25'], work: ['2026-04-25'] },
    CN: { off: ['2026-01-01','2026-01-02','2026-01-03','2026-02-15','2026-02-16','2026-02-17','2026-02-18','2026-02-19','2026-02-20','2026-02-21','2026-02-22','2026-02-23','2026-04-04','2026-04-05','2026-04-06','2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05','2026-06-19','2026-06-20','2026-06-21','2026-09-25','2026-09-26','2026-09-27','2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07'], work: ['2026-01-04','2026-02-14','2026-02-28','2026-05-09','2026-09-20','2026-10-10'] },
    KR: { off: ['2026-01-01','2026-02-16','2026-02-17','2026-02-18','2026-03-01','2026-03-02','2026-05-01','2026-05-05','2026-05-24','2026-05-25','2026-06-03','2026-06-06','2026-07-17','2026-08-15','2026-08-17','2026-09-24','2026-09-25','2026-09-26','2026-10-03','2026-10-05','2026-10-09','2026-12-25'], work: [] },
    GB: { off: ['2026-01-01','2026-04-03','2026-04-06','2026-05-04','2026-05-25','2026-08-31','2026-12-25','2026-12-28'], work: [] },
  },
  2027: {
    RU: { off: ['2027-01-01','2027-01-02','2027-01-03','2027-01-04','2027-01-05','2027-01-06','2027-01-07','2027-01-08','2027-01-09','2027-01-10','2027-02-21','2027-02-22','2027-02-23','2027-03-06','2027-03-07','2027-03-08','2027-05-01','2027-05-02','2027-05-03','2027-05-08','2027-05-09','2027-05-10','2027-06-12','2027-06-13','2027-06-14','2027-11-04','2027-11-05','2027-11-06','2027-11-07','2027-12-31'], work: ['2027-02-20'] },
    BY: { off: ['2027-01-01','2027-01-02','2027-01-07','2027-03-08','2027-05-01','2027-05-09','2027-05-10','2027-05-11','2027-07-03','2027-11-07','2027-12-25'], work: ['2027-05-08'] },
    CN: { off: ['2027-01-01','2027-01-02','2027-01-03','2027-02-05','2027-02-06','2027-02-07','2027-02-08','2027-02-09','2027-02-10','2027-02-11','2027-02-12','2027-02-13','2027-04-03','2027-04-04','2027-04-05','2027-05-01','2027-05-02','2027-05-03','2027-05-04','2027-05-05','2027-06-09','2027-09-15','2027-10-01','2027-10-02','2027-10-03','2027-10-04','2027-10-05','2027-10-06','2027-10-07'], work: ['2027-01-31','2027-02-14','2027-05-08','2027-09-26','2027-10-09'] },
    KR: { off: ['2027-01-01','2027-02-06','2027-02-07','2027-02-08','2027-02-09','2027-03-01','2027-05-01','2027-05-03','2027-05-05','2027-05-13','2027-06-06','2027-07-17','2027-07-19','2027-08-15','2027-08-16','2027-09-14','2027-09-15','2027-09-16','2027-10-03','2027-10-04','2027-10-09','2027-10-11','2027-12-25','2027-12-27'], work: [] },
    GB: { off: ['2027-01-01','2027-03-26','2027-03-29','2027-05-03','2027-05-31','2027-08-30','2027-12-27','2027-12-28'], work: [] },
  },
};
function dateKeyLocal(date: Date) { return dateKey(date); }
function isCountryLabourDayOff(date: Date, country: CountryCode): boolean {
  const key=dateKeyLocal(date);
  const overrides=labourOverrides[date.getFullYear()]?.[country];
  if (overrides?.work.includes(key)) return false;
  if (overrides?.off.includes(key)) return true;
  if (date.getDay()===0 || date.getDay()===6) return true;
  // Statutory public holidays are non-working days even when no annual transfer schedule exists.
  if (getNationalHolidays(date.getFullYear()).some((holiday)=>holiday.country===country && holiday.kind==='public' && dateKeyLocal(holiday.date)===key)) return true;
  // Kazakhstan transfers a public holiday falling on Saturday/Sunday to the next working weekday.
  if(country==='KZ' && date.getFullYear()!==2026){
    const publicHolidayKeys=new Set(getNationalHolidays(date.getFullYear())
      .filter((holiday)=>holiday.country==='KZ'&&holiday.kind==='public')
      .map((holiday)=>dateKeyLocal(holiday.date)));
    for(const holidayKey of publicHolidayKeys){
      const [year,month,day]=holidayKey.split('-').map(Number);
      const holidayDate=new Date(year,month-1,day);
      if(holidayDate.getDay()!==0 && holidayDate.getDay()!==6) continue;
      const candidate=new Date(holidayDate);
      do {
        candidate.setDate(candidate.getDate()+1);
      } while(candidate.getDay()===0 || candidate.getDay()===6 || publicHolidayKeys.has(dateKeyLocal(candidate)));
      if(dateKeyLocal(candidate)===key) return true;
    }
  }
  return false;
}
export function getLabourDayStatus(date: Date, selected: CountryCode[]) {
  const dayOffCountries=selected.filter((country)=>isCountryLabourDayOff(date,country));
  const workingCountries=selected.filter((country)=>!dayOffCountries.includes(country));
  const key=dateKeyLocal(date);
  const makeupWorkCountries=selected.filter((country)=>labourOverrides[date.getFullYear()]?.[country]?.work.includes(key) ?? false);
  return { isDayOff: dayOffCountries.length>0, dayOffCountries, workingCountries, makeupWorkCountries };
}
export function isMakeupWorkday(date: Date, selected: CountryCode[]) {
  return getLabourDayStatus(date,selected).makeupWorkCountries.length>0;
}
export function isSelectedCountryWeekend(date: Date, selected: CountryCode[]): boolean {
  return getLabourDayStatus(date,selected).isDayOff;
}

const labourCountryListeners = new Set<() => void>();
const EMPTY_COUNTRIES: CountryCode[] = [];
let selectedLabourCountries: CountryCode[] = [];
function emitLabourCountries() { labourCountryListeners.forEach((listener) => listener()); }
export function subscribeLabourCountries(listener: () => void) {
  labourCountryListeners.add(listener);
  return () => labourCountryListeners.delete(listener);
}
export function useLabourCountries() {
  return useSyncExternalStore(subscribeLabourCountries, () => selectedLabourCountries, () => EMPTY_COUNTRIES);
}
export function setSelectedLabourCountries(countries: CountryCode[]) {
  selectedLabourCountries = countries.filter((value, index) => NATIONAL_COUNTRIES.some((country) => country.code === value) && countries.indexOf(value) === index);
  saveSelectedLabourCountries(selectedLabourCountries);
  emitLabourCountries();
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

selectedLabourCountries = loadSelectedLabourCountries();
