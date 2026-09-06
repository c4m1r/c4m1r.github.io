export type Clock = {
  id: string;
  city: string;
  timeZone: string;
  hour: number;
  day: number;
  tyt: string;
  hourDifference: string;
  time: string;
};

const seed = {
  London: {
    timeZone: "Europe/London",
  },
  Berlin: {
    timeZone: "Europe/Berlin",
  },
  Beijing: {
    timeZone: "Asia/Shanghai",
  },
  Tokyo: {
    timeZone: "Asia/Tokyo",
  },
  Sydney: {
    timeZone: "Australia/Sydney",
  },
  NewYork: {
    timeZone: "America/New_York",
  },
  Seattle: {
    timeZone: "America/Los_Angeles",
  },
};

export const clocks = createClocks(seed);

export function createClocks(clocks: Record<string, { timeZone: string }>) {
  return Object.fromEntries(
    Object.entries(clocks).map(([, clock]) => {
      return [clock.timeZone, createClock(clock.timeZone)];
    })
  );
}

function createClock(timeZone: string): Clock {
  const now = new Date();
  const city = timeZone?.split("/")[1]?.replace(/_/g, " ");
  const hour = parseInt(
    new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      timeZone,
    }).format(now)
  );
  const day = parseInt(
    new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      timeZone,
    }).format(now)
  );
  const tyt = getTodayYesterdayTomorrow(day);
  const hourDifference = getHourDifference(timeZone);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
    timeZone,
  }).format(now);
  return {
    id: timeZone,
    timeZone,
    city,
    hour,
    day,
    tyt,
    hourDifference,
    time,
  };
}

function getTodayYesterdayTomorrow(localeDay: number) {
  const currentDay = new Date().getDate();
  return localeDay === currentDay
    ? "Today"
    : localeDay < currentDay
    ? "Yesterday"
    : "Tomorrow";
}

function getHourDifference(timeZone: string) {
  const now = new Date();
  return `${
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(now)
      .filter((e) => e.type === "timeZoneName")[0]
      .value.match(/([\+|\-]\d+)/)?.[1]
  }HRS`;
}

export const timeZones = [
  "Africa/Casablanca",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Africa/Luanda",
  "Africa/Nairobi",
  "Africa/Nouakchott",
  "Africa/Ouagadougou",
  "Africa/Sao_Tome",
  "Africa/Tunis",
  "America/Adak",
  "America/Anchorage",
  "America/Argentina/Buenos_Aires",
  "America/Asuncion",
  "America/Bahia",
  "America/Bogota",
  "America/Boise",
  "America/Chihuahua",
  "America/Chicago",
  "America/Costa_Rica",
  "America/Denver",
  "America/Detroit",
  "America/El_Salvador",
  "America/Guatemala",
  "America/Guayaquil",
  "America/Halifax",
  "America/Hermosillo",
  "America/Indiana/Indianapolis",
  "America/Indiana/Knox",
  "America/Indiana/Marengo",
  "America/Indiana/Petersburg",
  "America/Indiana/Tell_City",
  "America/Indiana/Vevay",
  "America/Los_Angeles",
  "America/Louisville",
  "America/Matamoros",
  "America/Merida",
  "America/Mexico_City",
  "America/Montevideo",
  "America/Nassau",
  "America/New_York",
  "America/Noronha",
  "America/Phoenix",
  "America/Puerto_Rico",
  "America/Rio_Branco",
  "America/Santiago",
  "America/Asuncion",
  "America/Edmonton",
  "America/Inuvik",
  "America/Iqaluit",
  "Asia/Calcutta",
  "Asia/Kolkata",
  "Asia/Kathmandu",
  "Asia/Kolkata",
  "Asia/Kuala_Lumpur",
  "Asia/Kuwait",
  "Asia/Macau",
  "Asia/Makassar",
  "Asia/Male",
  "Asia/Mumbai",
  "Asia/Novosibirsk",
  "Asia/Philippines",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Taipei",
  "Asia/Tokyo",
  "Asia/Ulaanbaatar",
  "Asia/Urumqi",
  "Asia/Vladivostok",
  "Europe/Athens",
  "Europe/Belgrade",
  "Europe/Berlin",
  "Europe/Bratislava",
  "Europe/Brussels",
  "Europe/Budapest",
  "Europe/Copenhagen",
  "Europe/Dublin",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Luxembourg",
  "Europe/Madrid",
  "Europe/Malta",
  "Europe/Moscow",
  "Europe/Paris",
  "Europe/Prague",
  "Europe/Rome",
  "Europe/Sofia",
  "Europe/Stockholm",
  "Europe/Tallinn",
  "Europe/Tirana",
  "Europe/Uzhgorod",
  "Europe/Vienna",
  "Europe/Vilnius",
  "Europe/Warsaw",
  "Europe/Zagreb",
  "Europe/Zurich",
  "Australia/ACT",
  "Australia/Darwin",
  "Australia/Hobart",
  "Australia/LHI",
  "Australia/Lindeman",
  "Australia/Melbourne",
  "Australia/Perth",
  "Australia/Sydney",
  "Australia/Queensland",
  "Australia/West",
  "Pacific/Auckland",
  "Pacific/Chatham",
  "Pacific/Easter",
  "Pacific/Fakaofo",
  "Pacific/Fiji",
  "Pacific/Kiritimati",
  "Pacific/Kosrae",
  "Pacific/Kwajalein",
  "Pacific/Majuro",
  "Pacific/Marquesas",
  "Pacific/Midway",
  "Pacific/Nauru",
  "Pacific/Niue",
  "Pacific/Pago_Pago",
  "Pacific/Palau",
  "Pacific/Pape",
];
