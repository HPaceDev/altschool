/**
 * Демонстрационные данные «Карты школ РО».
 *
 * Все школы вымышлены: названия, цены и даты придуманы. Но структура данных
 * настоящая — она повторяет то, ради чего затевается проект: у каждого факта
 * есть источник и дата проверки, а вместо прочерка честно пишется
 * «нет данных».
 */

/* ------------------------------------------------------------------ *
 * Проверяемость — главное отличие от обычного справочника
 * ------------------------------------------------------------------ */

/**
 * verified — редакция проверила поле и указала источник
 * claimed  — школа заявила сама, проверка ещё не проводилась
 * stale    — прошло больше 90 дней, данные требуют обновления
 * missing  — данных нет; показываем это словами, а не прочерком
 */
export type FactStatus = "verified" | "claimed" | "stale" | "missing";

export const FACT_STATUS_LABEL: Record<FactStatus, string> = {
  verified: "Проверено редакцией",
  claimed: "Заявлено школой",
  stale: "Требует обновления",
  missing: "Нет данных",
};

export const FACT_STATUS_SHORT: Record<FactStatus, string> = {
  verified: "проверено",
  claimed: "заявлено",
  stale: "устарело",
  missing: "нет данных",
};

/** Значение вместе с тем, откуда оно взято и когда проверялось. */
export type Fact = {
  value: string;
  status: FactStatus;
  source?: string;
  checkedOn?: string;
};

export const NO_DATA: Fact = { value: "Нет данных", status: "missing" };

/* ------------------------------------------------------------------ *
 * Школа
 * ------------------------------------------------------------------ */

export type SchoolFormat = "private" | "family" | "center" | "state";

export const FORMAT_LABEL: Record<SchoolFormat, string> = {
  private: "Частная школа",
  family: "Семейные классы",
  center: "Центр развития",
  state: "Государственная",
};

/**
 * Насколько глубоко методика внедрена. Это и есть «уровни» из разговора:
 * тег «РО» ставят себе все, а подтверждённая глубина — то, что отличает
 * настоящую практику от строчки на сайте.
 */
export type RoDepth = "full" | "primary" | "partial" | "declared" | "none";

export const RO_DEPTH_LABEL: Record<RoDepth, string> = {
  full: "Вся школа",
  primary: "Начальная школа полностью",
  partial: "Отдельные классы",
  declared: "Заявлено, не подтверждено",
  none: "Не работает по РО",
};

export const RO_DEPTH_HINT: Record<RoDepth, string> = {
  full: "Развивающее обучение на всех ступенях, подтверждено учебным планом",
  primary: "Развивающее обучение в 1–4 классах, дальше обычная программа",
  partial: "Отдельные классы или предметы, остальное по стандартной программе",
  declared: "Школа заявила о работе по РО, редакция ещё не проверяла",
  none: "Школа не заявляет работу по развивающему обучению",
};

export type Tone = "sage" | "clay" | "slate" | "sand" | "moss";

/**
 * Тона заглушек намеренно вымыты: карточек в каталоге много, и яркие плашки
 * превратили бы список в мозаику, где невозможно читать.
 */
export const TONE_COLOR: Record<Tone, string> = {
  sage: "#6f8b7c",
  clay: "#a1866f",
  slate: "#78838f",
  sand: "#a2946d",
  moss: "#77855f",
};

export type School = {
  slug: string;
  name: string;
  format: SchoolFormat;
  city: string;
  region: string;
  district?: string;
  grades: string;
  ageFrom: number;
  ageTo: number;

  /** Общий статус карточки — по самому слабому из ключевых полей. */
  status: FactStatus;
  checkedOn: string;
  roDepth: RoDepth;

  /** Цена в месяц; ноль означает бесплатно, null — данных нет. */
  pricePerMonth: number | null;

  /** Точка франшизной сети заказчика или независимая школа. */
  inNetwork: boolean;

  short: string;
  about: string;

  /** Как именно реализовано развивающее обучение. */
  practice: string[];
  practiceSource: Fact;

  admission: Fact;
  licence: Fact;
  accreditation: Fact;
  curriculum: Fact;
  classSize: Fact;
  teachers: Fact;

  /** Шаги поступления, как их описывает школа. */
  admissionSteps: { title: string; text: string }[];

  tone: Tone;
};

export const REGIONS = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирская область",
  "Свердловская область",
  "Красноярский край",
  "Краснодарский край",
  "Республика Татарстан",
] as const;

export const SCHOOLS: School[] = [
  {
    slug: "atlas",
    name: "Школа «Атлас»",
    format: "private",
    city: "Москва",
    region: "Москва",
    district: "Хамовники",
    grades: "1–9 классы",
    ageFrom: 7,
    ageTo: 16,
    status: "verified",
    checkedOn: "10 июля 2026",
    roDepth: "primary",
    pricePerMonth: 52000,
    inNetwork: true,
    short: "Полный день, исследовательские мастерские, тьюторское сопровождение",
    about:
      "Небольшая школа полного дня. Учебная задача и групповая дискуссия вместо объяснения у доски, во второй половине дня — исследовательские мастерские. С пятого класса добавляется тьютор, который ведёт образовательный маршрут ребёнка.",
    practice: [
      "Развивающее обучение в 1–4 классах",
      "Групповая дискуссия и учебная задача как основа урока",
      "Подготовка педагогов по методике подтверждена документально",
    ],
    practiceSource: {
      value: "Учебный план школы, подтверждение директора, открытые материалы",
      status: "verified",
      source: "Учебный план 2026/27",
      checkedOn: "10 июля 2026",
    },
    admission: { value: "Есть места в 1 и 3 классе", status: "verified", checkedOn: "10 июля 2026" },
    licence: {
      value: "Лицензия на общее образование",
      status: "verified",
      source: "Реестр Рособрнадзора",
      checkedOn: "10 июля 2026",
    },
    accreditation: { value: "Заявлена, документ не получен", status: "claimed" },
    curriculum: {
      value: "Учебный план с элементами РО",
      status: "verified",
      source: "Документ предоставлен школой",
      checkedOn: "10 июля 2026",
    },
    classSize: { value: "до 16 человек", status: "verified", checkedOn: "10 июля 2026" },
    teachers: { value: "14 педагогов, 9 с подготовкой по РО", status: "verified", checkedOn: "10 июля 2026" },
    admissionSteps: [
      { title: "Экскурсия", text: "Знакомство с пространством и подходом школы." },
      { title: "Встреча с семьёй", text: "Обсуждение ожиданий и образовательного маршрута." },
      { title: "Пробный день", text: "Ребёнок проживает обычный школьный день." },
    ],
    tone: "sage",
  },
  {
    slug: "dialog",
    name: "Школа «Диалог»",
    format: "family",
    city: "Санкт-Петербург",
    region: "Санкт-Петербург",
    district: "Петроградский",
    grades: "1–6 классы",
    ageFrom: 7,
    ageTo: 13,
    status: "claimed",
    checkedOn: "не проверялась",
    roDepth: "declared",
    pricePerMonth: 34000,
    inNetwork: false,
    short: "Семейные классы, аттестация через партнёрскую школу",
    about:
      "Семейные классы по 10–12 человек. Аттестация проходит дистанционно через партнёрскую школу с лицензией. Много проектной работы и выездных занятий по городу.",
    practice: [
      "Школа заявляет работу по развивающему обучению",
      "Подтверждающих документов пока не предоставлено",
    ],
    practiceSource: {
      value: "Со слов школы при саморегистрации",
      status: "claimed",
    },
    admission: { value: "Набор открыт", status: "claimed" },
    licence: { value: "Лицензии нет, обучение в форме семейного образования", status: "claimed" },
    accreditation: NO_DATA,
    curriculum: NO_DATA,
    classSize: { value: "10–12 человек", status: "claimed" },
    teachers: NO_DATA,
    admissionSteps: [
      { title: "Знакомство", text: "Встреча с родителями и рассказ о формате." },
      { title: "Пробная неделя", text: "Ребёнок ходит в класс неделю без оплаты." },
    ],
    tone: "clay",
  },
  {
    slug: "vektor-razvitiya",
    name: "Центр «Вектор развития»",
    format: "center",
    city: "Красноярск",
    region: "Красноярский край",
    grades: "1–4 классы",
    ageFrom: 7,
    ageTo: 11,
    status: "verified",
    checkedOn: "2 июля 2026",
    roDepth: "full",
    pricePerMonth: 29000,
    inNetwork: true,
    short: "Начальная школа целиком по системе Эльконина — Давыдова",
    about:
      "Центр работает только с начальной школой и целиком по системе Эльконина — Давыдова. Педагоги проходят ежегодную методическую аттестацию, занятия открыты для посещения родителями.",
    practice: [
      "Система Эльконина — Давыдова на всех предметах 1–4 классов",
      "Ежегодная методическая аттестация педагогов",
      "Открытые уроки для родителей раз в четверть",
    ],
    practiceSource: {
      value: "Учебный план, сертификаты педагогов, протокол методического совета",
      status: "verified",
      source: "Документы предоставлены центром",
      checkedOn: "2 июля 2026",
    },
    admission: { value: "Лист ожидания на 2027 год", status: "verified", checkedOn: "2 июля 2026" },
    licence: {
      value: "Лицензия на дополнительное образование",
      status: "verified",
      source: "Реестр Рособрнадзора",
      checkedOn: "2 июля 2026",
    },
    accreditation: { value: "Не требуется для этого формата", status: "verified", checkedOn: "2 июля 2026" },
    curriculum: {
      value: "Полный учебный план по системе Эльконина — Давыдова",
      status: "verified",
      source: "Документ предоставлен центром",
      checkedOn: "2 июля 2026",
    },
    classSize: { value: "до 14 человек", status: "verified", checkedOn: "2 июля 2026" },
    teachers: { value: "8 педагогов, все с подготовкой по РО", status: "verified", checkedOn: "2 июля 2026" },
    admissionSteps: [
      { title: "Заявка", text: "Анкета о ребёнке и ожиданиях семьи." },
      { title: "Встреча", text: "Разговор с методистом центра." },
      { title: "Адаптационная неделя", text: "Ребёнок пробует формат занятий." },
    ],
    tone: "moss",
  },
  {
    slug: "tochka-rosta",
    name: "Школа «Точка роста»",
    format: "private",
    city: "Новосибирск",
    region: "Новосибирская область",
    grades: "1–11 классы",
    ageFrom: 7,
    ageTo: 18,
    status: "stale",
    checkedOn: "14 февраля 2026",
    roDepth: "partial",
    pricePerMonth: 41000,
    inNetwork: false,
    short: "Развивающее обучение в начальных классах, дальше обычная программа",
    about:
      "Школа полного цикла на 240 учеников. Развивающее обучение применяется в начальных классах, средняя и старшая школа работают по стандартной программе с углублённой математикой.",
    practice: [
      "Развивающее обучение в 1–2 классах",
      "С 3 класса переход на стандартную программу",
    ],
    practiceSource: {
      value: "Данные подтверждались в феврале, с тех пор не обновлялись",
      status: "stale",
      source: "Учебный план 2025/26",
      checkedOn: "14 февраля 2026",
    },
    admission: { value: "Данные устарели, уточняйте у школы", status: "stale", checkedOn: "14 февраля 2026" },
    licence: {
      value: "Лицензия и аккредитация",
      status: "stale",
      source: "Реестр Рособрнадзора",
      checkedOn: "14 февраля 2026",
    },
    accreditation: { value: "Есть", status: "stale", checkedOn: "14 февраля 2026" },
    curriculum: { value: "План 2025/26, новый не предоставлен", status: "stale", checkedOn: "14 февраля 2026" },
    classSize: { value: "до 20 человек", status: "stale", checkedOn: "14 февраля 2026" },
    teachers: NO_DATA,
    admissionSteps: [
      { title: "День открытых дверей", text: "Проводится ежемесячно." },
      { title: "Собеседование", text: "С ребёнком и родителями." },
    ],
    tone: "sand",
  },
  {
    slug: "smysl",
    name: "Школа «Смысл»",
    format: "family",
    city: "Екатеринбург",
    region: "Свердловская область",
    grades: "1–7 классы",
    ageFrom: 7,
    ageTo: 14,
    status: "claimed",
    checkedOn: "не проверялась",
    roDepth: "declared",
    pricePerMonth: 27000,
    inNetwork: false,
    short: "Семейные классы с упором на обсуждение и совместные проекты",
    about:
      "Семейное обучение в формате небольших разновозрастных групп. Основа дня — общий круг, учебная задача и проектная работа. Аттестация через прикреплённую школу.",
    practice: ["Школа заявляет элементы развивающего обучения"],
    practiceSource: { value: "Со слов школы при саморегистрации", status: "claimed" },
    admission: { value: "Есть места в 1 и 2 классе", status: "claimed" },
    licence: { value: "Лицензии нет, семейная форма обучения", status: "claimed" },
    accreditation: NO_DATA,
    curriculum: NO_DATA,
    classSize: { value: "до 12 человек", status: "claimed" },
    teachers: NO_DATA,
    admissionSteps: [
      { title: "Встреча", text: "Знакомство с командой и пространством." },
      { title: "Пробные дни", text: "Три дня в группе вместе с ребёнком." },
    ],
    tone: "slate",
  },
  {
    slug: "issledovanie",
    name: "Лаборатория «Исследование»",
    format: "center",
    city: "Армавир",
    region: "Краснодарский край",
    grades: "1–4 классы",
    ageFrom: 7,
    ageTo: 11,
    status: "verified",
    checkedOn: "28 июня 2026",
    roDepth: "primary",
    pricePerMonth: 0,
    inNetwork: false,
    short: "Бесплатные группы при педагогическом колледже",
    about:
      "Экспериментальная площадка при педагогическом колледже. Занятия бесплатные, набор ограничен: группы служат базой практики для студентов методического отделения.",
    practice: [
      "Развивающее обучение в 1–4 классах",
      "Площадка методического отделения колледжа",
      "Занятия ведут преподаватели колледжа со студентами",
    ],
    practiceSource: {
      value: "Договор с колледжем и программа экспериментальной площадки",
      status: "verified",
      source: "Документы предоставлены колледжем",
      checkedOn: "28 июня 2026",
    },
    admission: { value: "Набор закрыт до августа", status: "verified", checkedOn: "28 июня 2026" },
    licence: {
      value: "Работает под лицензией колледжа",
      status: "verified",
      source: "Реестр Рособрнадзора",
      checkedOn: "28 июня 2026",
    },
    accreditation: { value: "Не требуется для этого формата", status: "verified", checkedOn: "28 июня 2026" },
    curriculum: {
      value: "Программа экспериментальной площадки",
      status: "verified",
      checkedOn: "28 июня 2026",
    },
    classSize: { value: "до 15 человек", status: "verified", checkedOn: "28 июня 2026" },
    teachers: { value: "6 преподавателей колледжа", status: "verified", checkedOn: "28 июня 2026" },
    admissionSteps: [
      { title: "Заявка", text: "Через сайт колледжа в июне." },
      { title: "Жеребьёвка", text: "Мест меньше, чем желающих." },
    ],
    tone: "sage",
  },
  {
    slug: "krug",
    name: "Школа «Круг»",
    format: "private",
    city: "Казань",
    region: "Республика Татарстан",
    district: "Вахитовский",
    grades: "1–9 классы",
    ageFrom: 7,
    ageTo: 16,
    status: "verified",
    checkedOn: "5 июля 2026",
    roDepth: "full",
    pricePerMonth: 46000,
    inNetwork: true,
    short: "Развивающее обучение на всех ступенях, двуязычная среда",
    about:
      "Школа сети, работающая по развивающему обучению с первого по девятый класс. Часть предметов ведётся на татарском языке. Педагоги проходят обучение в методическом центре сети.",
    practice: [
      "Развивающее обучение на всех ступенях",
      "Двуязычная среда: русский и татарский",
      "Ежегодное обучение педагогов в методическом центре сети",
    ],
    practiceSource: {
      value: "Учебный план, сертификаты педагогов, аудит методического центра",
      status: "verified",
      source: "Аудит сети от 05.07.2026",
      checkedOn: "5 июля 2026",
    },
    admission: { value: "Есть места в 1, 2 и 5 классах", status: "verified", checkedOn: "5 июля 2026" },
    licence: {
      value: "Лицензия на общее образование",
      status: "verified",
      source: "Реестр Рособрнадзора",
      checkedOn: "5 июля 2026",
    },
    accreditation: {
      value: "Государственная аккредитация",
      status: "verified",
      source: "Реестр Рособрнадзора",
      checkedOn: "5 июля 2026",
    },
    curriculum: {
      value: "Учебный план по системе Эльконина — Давыдова",
      status: "verified",
      checkedOn: "5 июля 2026",
    },
    classSize: { value: "до 18 человек", status: "verified", checkedOn: "5 июля 2026" },
    teachers: { value: "22 педагога, 18 с подготовкой по РО", status: "verified", checkedOn: "5 июля 2026" },
    admissionSteps: [
      { title: "Экскурсия", text: "Каждую субботу по записи." },
      { title: "Встреча с методистом", text: "Разговор об ожиданиях семьи." },
      { title: "Пробная неделя", text: "Ребёнок ходит в класс пять дней." },
    ],
    tone: "moss",
  },
  {
    slug: "gnezdo",
    name: "Семейный класс «Гнездо»",
    format: "family",
    city: "Москва",
    region: "Москва",
    district: "Строгино",
    grades: "1–4 классы",
    ageFrom: 7,
    ageTo: 11,
    status: "stale",
    checkedOn: "3 марта 2026",
    roDepth: "partial",
    pricePerMonth: 31000,
    inNetwork: false,
    short: "Небольшой семейный класс, свободное посещение по средам",
    about:
      "Семейный класс на 9 детей в жилом районе. Гибкое расписание, свободное посещение по средам, аттестация через партнёрскую школу.",
    practice: ["Элементы развивающего обучения на математике и русском языке"],
    practiceSource: {
      value: "Данные подтверждались в марте, требуют обновления",
      status: "stale",
      checkedOn: "3 марта 2026",
    },
    admission: { value: "Данные устарели", status: "stale", checkedOn: "3 марта 2026" },
    licence: { value: "Лицензии нет, семейная форма обучения", status: "stale", checkedOn: "3 марта 2026" },
    accreditation: NO_DATA,
    curriculum: NO_DATA,
    classSize: { value: "9 человек", status: "stale", checkedOn: "3 марта 2026" },
    teachers: NO_DATA,
    admissionSteps: [{ title: "Знакомство", text: "Встреча с педагогом и родителями класса." }],
    tone: "clay",
  },
];

/* ------------------------------------------------------------------ *
 * Выборки
 * ------------------------------------------------------------------ */

export function findSchool(slug: string): School | undefined {
  return SCHOOLS.find((s) => s.slug === slug);
}

export type Filters = {
  region?: string;
  format?: SchoolFormat;
  status?: FactStatus;
  roDepth?: RoDepth;
  maxPrice?: number;
  query?: string;
  sort?: "checked" | "price-asc" | "ro";
};

const DEPTH_ORDER: Record<RoDepth, number> = {
  full: 0,
  primary: 1,
  partial: 2,
  declared: 3,
  none: 4,
};

export function filterSchools(filters: Filters): School[] {
  const result = SCHOOLS.filter((school) => {
    if (filters.region && school.region !== filters.region) return false;
    if (filters.format && school.format !== filters.format) return false;
    if (filters.status && school.status !== filters.status) return false;
    if (filters.roDepth && school.roDepth !== filters.roDepth) return false;
    if (
      filters.maxPrice &&
      (school.pricePerMonth === null || school.pricePerMonth > filters.maxPrice)
    ) {
      return false;
    }

    if (filters.query) {
      const needle = filters.query.trim().toLowerCase();
      const haystack = [school.name, school.city, school.region, school.short, school.district]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });

  switch (filters.sort) {
    case "price-asc":
      return result.sort(
        (a, b) => (a.pricePerMonth ?? Infinity) - (b.pricePerMonth ?? Infinity),
      );
    case "ro":
      return result.sort((a, b) => DEPTH_ORDER[a.roDepth] - DEPTH_ORDER[b.roDepth]);
    default:
      // По умолчанию сверху проверенные: ради этого каталог и делается.
      return result.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  }
}

const STATUS_ORDER: Record<FactStatus, number> = {
  verified: 0,
  claimed: 1,
  stale: 2,
  missing: 3,
};

/** Сколько школ в каждом регионе — для карты покрытия. */
export function coverage(): { region: string; total: number; verified: number }[] {
  return REGIONS.map((region) => {
    const inRegion = SCHOOLS.filter((s) => s.region === region);
    return {
      region,
      total: inRegion.length,
      verified: inRegion.filter((s) => s.status === "verified").length,
    };
  }).sort((a, b) => b.total - a.total || a.region.localeCompare(b.region, "ru"));
}

export function similarTo(school: School, limit = 3): School[] {
  return SCHOOLS.filter((s) => s.slug !== school.slug)
    .map((s) => {
      let score = 0;
      if (s.region === school.region) score += 3;
      if (s.format === school.format) score += 2;
      if (s.roDepth === school.roDepth) score += 2;
      if (s.status === "verified") score += 1;
      return { school: s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.school);
}

const priceFormat = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number | null): string {
  if (value === null) return "Нет данных";
  if (value === 0) return "Бесплатно";
  return priceFormat.format(value);
}

/* ------------------------------------------------------------------ *
 * Франшизы — публичная часть закрытого контура
 * ------------------------------------------------------------------ */

export type Franchise = {
  slug: string;
  name: string;
  format: string;
  investmentFrom: number;
  lumpSum: number;
  royalty: string;
  paybackMonths: string;
  pointsOpen: number;
  freeTerritories: number;
  support: string[];
  tone: Tone;
};

export const FRANCHISES: Franchise[] = [
  {
    slug: "shkola-ro",
    name: "Школа развивающего обучения",
    format: "Полный цикл 1–9 классов",
    investmentFrom: 3200000,
    lumpSum: 500000,
    royalty: "5% с выручки",
    paybackMonths: "18–24 месяца",
    pointsOpen: 7,
    freeTerritories: 12,
    support: ["Методика и учебные планы", "Обучение педагогов", "Запуск набора", "Сопровождение УК"],
    tone: "sage",
  },
  {
    slug: "nachalnaya-shkola",
    name: "Начальная школа",
    format: "1–4 классы, помещение от 200 м²",
    investmentFrom: 1600000,
    lumpSum: 300000,
    royalty: "4% с выручки",
    paybackMonths: "14–18 месяцев",
    pointsOpen: 11,
    freeTerritories: 23,
    support: ["Методика", "Обучение педагогов", "Маркетинг запуска"],
    tone: "moss",
  },
  {
    slug: "semeynyy-klass",
    name: "Семейный класс",
    format: "Малый формат, до 15 детей",
    investmentFrom: 450000,
    lumpSum: 150000,
    royalty: "фиксированно 15 000 ₽ в месяц",
    paybackMonths: "8–12 месяцев",
    pointsOpen: 19,
    freeTerritories: 40,
    support: ["Методика", "Помощь с аттестационной площадкой", "Чат сообщества"],
    tone: "clay",
  },
];

export function findFranchise(slug: string): Franchise | undefined {
  return FRANCHISES.find((f) => f.slug === slug);
}
