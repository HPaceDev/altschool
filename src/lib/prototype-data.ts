/**
 * Демонстрационные данные прототипа.
 *
 * Все школы вымышлены: названия, цены, отзывы и рейтинги придуманы, чтобы
 * прототип выглядел живым. Настоящие школы сюда попадут только после того,
 * как будет решено, откуда берётся база (вопрос Q-011).
 */

export type SchoolFormat = "offline" | "online" | "family";

export type School = {
  slug: string;
  name: string;
  kind: string;
  format: SchoolFormat;
  city: string;
  district: string;
  metro?: string;
  ageFrom: number;
  ageTo: number;
  pricePerMonth: number;
  admissionFee?: number;
  rating: number;
  reviewsCount: number;
  languages: string[];
  features: string[];
  hasLicence: boolean;
  hasKindergarten: boolean;
  admissionOpen: boolean;
  seatsLeft?: number;
  short: string;
  about: string;
  strengths: string[];
  schedule: string;
  classSize: number;
  /** Цвета фоновой заглушки вместо фотографии: снимков школ у нас пока нет. */
  palette: [string, string];
};

export const CITIES = ["Москва", "Санкт-Петербург", "Казань", "Онлайн"] as const;

export const KINDS = [
  "Частная школа",
  "Семейная школа",
  "Международная школа",
  "Монтессори",
  "Вальдорфская",
  "Онлайн-школа",
] as const;

export const FORMAT_LABEL: Record<SchoolFormat, string> = {
  offline: "Очно",
  online: "Онлайн",
  family: "Семейное обучение",
};

export const SCHOOLS: School[] = [
  {
    slug: "pyatoe-izmerenie",
    name: "Пятое измерение",
    kind: "Частная школа",
    format: "offline",
    city: "Москва",
    district: "Хамовники",
    metro: "Фрунзенская",
    ageFrom: 6,
    ageTo: 18,
    pricePerMonth: 95000,
    admissionFee: 150000,
    rating: 4.8,
    reviewsCount: 64,
    languages: ["Английский", "Испанский"],
    features: ["Своя территория", "Бассейн", "Продлёнка до 19:00", "Питание включено"],
    hasLicence: true,
    hasKindergarten: true,
    admissionOpen: true,
    seatsLeft: 4,
    short: "Полный день, углублённый английский, своя территория в центре",
    about:
      "Школа полного дня с собственным зданием и парком. Классы до 16 человек, два педагога в начальной школе. Углублённый английский с первого класса, со средней школы добавляется второй язык на выбор.",
    strengths: ["Классы до 16 человек", "Два педагога в началке", "Подготовка к IB"],
    schedule: "Пн–Пт, 8:30–18:00",
    classSize: 16,
    palette: ["#3b5bdb", "#748ffc"],
  },
  {
    slug: "novyy-put",
    name: "Новый путь",
    kind: "Семейная школа",
    format: "family",
    city: "Москва",
    district: "Строгино",
    metro: "Строгино",
    ageFrom: 7,
    ageTo: 15,
    pricePerMonth: 42000,
    rating: 4.6,
    reviewsCount: 38,
    languages: ["Английский"],
    features: ["Малые группы", "Гибкое расписание", "Аттестация через партнёрскую школу"],
    hasLicence: false,
    hasKindergarten: false,
    admissionOpen: true,
    seatsLeft: 9,
    short: "Семейное обучение в малых группах, аттестация через партнёрскую школу",
    about:
      "Формат семейного обучения: дети занимаются в группах по 8–10 человек, аттестация проходит дистанционно через партнёрскую школу с лицензией. Много проектной работы, свободное посещение по средам.",
    strengths: ["Группы по 8–10 человек", "Проектное обучение", "Свободная среда"],
    schedule: "Пн–Пт, 9:00–15:00",
    classSize: 9,
    palette: ["#2b8a3e", "#69db7c"],
  },
  {
    slug: "greenwood",
    name: "Гринвуд",
    kind: "Международная школа",
    format: "offline",
    city: "Москва",
    district: "Одинцово",
    ageFrom: 3,
    ageTo: 18,
    pricePerMonth: 180000,
    admissionFee: 300000,
    rating: 4.9,
    reviewsCount: 112,
    languages: ["Английский", "Французский", "Китайский"],
    features: ["Кампус", "Пансион", "IB Diploma", "Трансфер"],
    hasLicence: true,
    hasKindergarten: true,
    admissionOpen: true,
    seatsLeft: 2,
    short: "Международная программа IB, кампус за городом, возможен пансион",
    about:
      "Кампус на 6 гектарах в Подмосковье. Обучение по программе IB на английском языке, русская программа параллельно. Есть пансион с проживанием пять дней в неделю и трансфер из Москвы.",
    strengths: ["Диплом IB", "Пансион", "Преподаватели — носители языка"],
    schedule: "Пн–Пт, 8:00–18:00, пансион",
    classSize: 14,
    palette: ["#0b7285", "#3bc9db"],
  },
  {
    slug: "tochka-rosta",
    name: "Точка роста",
    kind: "Частная школа",
    format: "offline",
    city: "Санкт-Петербург",
    district: "Петроградский",
    metro: "Чкаловская",
    ageFrom: 6,
    ageTo: 17,
    pricePerMonth: 68000,
    admissionFee: 60000,
    rating: 4.5,
    reviewsCount: 47,
    languages: ["Английский", "Немецкий"],
    features: ["Продлёнка", "Питание включено", "Психолог", "Кружки"],
    hasLicence: true,
    hasKindergarten: false,
    admissionOpen: true,
    seatsLeft: 7,
    short: "Небольшая школа в центре, сильная началка, много кружков",
    about:
      "Камерная школа на 180 учеников в историческом здании. Сильная начальная школа, отдельная программа адаптации первоклассников. Во второй половине дня — кружки, включённые в стоимость.",
    strengths: ["180 учеников на всю школу", "Кружки в стоимости", "Штатный психолог"],
    schedule: "Пн–Пт, 9:00–17:00",
    classSize: 18,
    palette: ["#862e9c", "#b197fc"],
  },
  {
    slug: "lesnaya-shkola",
    name: "Лесная школа",
    kind: "Вальдорфская",
    format: "offline",
    city: "Москва",
    district: "Троицк",
    ageFrom: 6,
    ageTo: 16,
    pricePerMonth: 38000,
    rating: 4.4,
    reviewsCount: 29,
    languages: ["Английский", "Немецкий"],
    features: ["Свой участок", "Ремёсла", "Без оценок до 6 класса", "Эвритмия"],
    hasLicence: false,
    hasKindergarten: true,
    admissionOpen: true,
    seatsLeft: 11,
    short: "Вальдорфская педагогика, много ручного труда и времени на улице",
    about:
      "Вальдорфская школа в зелёной зоне. Обучение эпохами, безоценочная система до шестого класса, ежедневные занятия ремёслами. Родители активно участвуют в жизни школы.",
    strengths: ["Обучение эпохами", "Ремёсла каждый день", "Сильное сообщество родителей"],
    schedule: "Пн–Пт, 9:00–16:00",
    classSize: 20,
    palette: ["#e8590c", "#ffa94d"],
  },
  {
    slug: "vektor-online",
    name: "Онлайн-лицей Вектор",
    kind: "Онлайн-школа",
    format: "online",
    city: "Онлайн",
    district: "Вся Россия",
    ageFrom: 10,
    ageTo: 18,
    pricePerMonth: 12000,
    rating: 4.3,
    reviewsCount: 203,
    languages: ["Английский"],
    features: ["Аттестат гособразца", "Запись уроков", "Подготовка к ЕГЭ", "Тьютор"],
    hasLicence: true,
    hasKindergarten: false,
    admissionOpen: true,
    short: "Полностью онлайн, аттестат государственного образца, упор на ЕГЭ",
    about:
      "Онлайн-школа с лицензией и аккредитацией: аттестат государственного образца. Уроки в прямом эфире с записью, персональный тьютор, отдельные интенсивы по подготовке к ОГЭ и ЕГЭ.",
    strengths: ["Аттестат гособразца", "Записи всех уроков", "Персональный тьютор"],
    schedule: "Пн–Пт, 10:00–15:00 по Москве",
    classSize: 25,
    palette: ["#1971c2", "#4dabf7"],
  },
  {
    slug: "montessori-dom",
    name: "Монтессори-дом",
    kind: "Монтессори",
    format: "offline",
    city: "Санкт-Петербург",
    district: "Василеостровский",
    metro: "Василеостровская",
    ageFrom: 3,
    ageTo: 12,
    pricePerMonth: 55000,
    rating: 4.7,
    reviewsCount: 51,
    languages: ["Английский"],
    features: ["Разновозрастные группы", "Монтессори-среда", "Сад и школа вместе"],
    hasLicence: true,
    hasKindergarten: true,
    admissionOpen: false,
    short: "Сад и начальная школа по методу Монтессори, разновозрастные группы",
    about:
      "Детский сад и начальная школа в одном пространстве. Разновозрастные группы, подготовленная среда, педагоги с международными дипломами AMI. Плавный переход из сада в школу без смены места.",
    strengths: ["Педагоги с дипломами AMI", "Плавный переход сад → школа", "Разновозрастные группы"],
    schedule: "Пн–Пт, 8:30–17:30",
    classSize: 15,
    palette: ["#c2255c", "#faa2c1"],
  },
  {
    slug: "akademiya-polet",
    name: "Академия Полёт",
    kind: "Частная школа",
    format: "offline",
    city: "Москва",
    district: "Раменки",
    metro: "Мичуринский проспект",
    ageFrom: 10,
    ageTo: 18,
    pricePerMonth: 78000,
    admissionFee: 90000,
    rating: 4.6,
    reviewsCount: 73,
    languages: ["Английский"],
    features: ["Профильная математика", "Олимпиадная подготовка", "Лаборатории"],
    hasLicence: true,
    hasKindergarten: false,
    admissionOpen: true,
    seatsLeft: 5,
    short: "Физмат-направление, олимпиадная подготовка со средней школы",
    about:
      "Школа с математическим и естественнонаучным уклоном с пятого класса. Преподаватели из профильных вузов, собственные лаборатории, регулярное участие в олимпиадах.",
    strengths: ["Преподаватели из вузов", "Свои лаборатории", "Олимпиадные сборы"],
    schedule: "Пн–Сб, 9:00–17:00",
    classSize: 20,
    palette: ["#5f3dc4", "#9775fa"],
  },
  {
    slug: "apelsin",
    name: "Семейный класс Апельсин",
    kind: "Семейная школа",
    format: "family",
    city: "Казань",
    district: "Вахитовский",
    ageFrom: 7,
    ageTo: 11,
    pricePerMonth: 25000,
    rating: 4.5,
    reviewsCount: 18,
    languages: ["Английский", "Татарский"],
    features: ["Малые группы", "Двуязычная среда", "Гибкая оплата"],
    hasLicence: false,
    hasKindergarten: false,
    admissionOpen: true,
    seatsLeft: 6,
    short: "Семейный класс начальной школы, русский и татарский в среде",
    about:
      "Семейный класс на 12 детей в центре Казани. Двуязычная среда, много выездных занятий по городу. Аттестация — через прикреплённую школу.",
    strengths: ["Класс на 12 детей", "Двуязычная среда", "Выездные занятия"],
    schedule: "Пн–Пт, 9:00–14:00",
    classSize: 12,
    palette: ["#e67700", "#ffd43b"],
  },
  {
    slug: "bilingva",
    name: "Билингва",
    kind: "Международная школа",
    format: "offline",
    city: "Москва",
    district: "Куркино",
    ageFrom: 5,
    ageTo: 16,
    pricePerMonth: 120000,
    admissionFee: 180000,
    rating: 4.7,
    reviewsCount: 89,
    languages: ["Английский", "Китайский"],
    features: ["Половина предметов на английском", "Носители языка", "Своя территория"],
    hasLicence: true,
    hasKindergarten: true,
    admissionOpen: true,
    seatsLeft: 3,
    short: "Билингвальная программа: половина предметов на английском",
    about:
      "Билингвальная школа: часть предметов ведётся на английском носителями языка, часть — по российской программе. С седьмого класса добавляется китайский.",
    strengths: ["Носители языка", "Российский аттестат", "Китайский с 7 класса"],
    schedule: "Пн–Пт, 8:30–18:00",
    classSize: 18,
    palette: ["#0c8599", "#66d9e8"],
  },
];

/* ------------------------------------------------------------------ *
 * Отзывы
 * ------------------------------------------------------------------ */

export type Review = {
  schoolSlug: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  text: string;
};

/** Отзывы демонстрационные: как они появятся на самом деле — вопрос Q-008. */
export const REVIEWS: Review[] = [
  {
    schoolSlug: "pyatoe-izmerenie",
    author: "Мария К.",
    role: "мама второклассника",
    rating: 5,
    date: "апрель",
    text: "Перешли из государственной школы, ребёнок наконец перестал бояться ошибаться. Два педагога в классе — это правда работает.",
  },
  {
    schoolSlug: "pyatoe-izmerenie",
    author: "Дмитрий А.",
    role: "папа пятиклассницы",
    rating: 4,
    date: "март",
    text: "Всё хорошо, но дорога в час пик — отдельное испытание. Трансфера нет, возим сами.",
  },
  {
    schoolSlug: "novyy-put",
    author: "Ольга В.",
    role: "мама третьеклассника",
    rating: 5,
    date: "май",
    text: "Формат семейного класса подошёл идеально: сын много болел, здесь спокойно относятся к пропускам.",
  },
  {
    schoolSlug: "vektor-online",
    author: "Анна С.",
    role: "мама девятиклассника",
    rating: 4,
    date: "февраль",
    text: "Записи уроков спасают: занимаемся в своём ритме. Минус — с мотивацией без тьютора было бы тяжело.",
  },
  {
    schoolSlug: "greenwood",
    author: "Ирина П.",
    role: "мама семиклассницы",
    rating: 5,
    date: "апрель",
    text: "Кампус впечатляет, дочь ездит с удовольствием. Цена соответствует уровню, но считать пришлось долго.",
  },
];

/* ------------------------------------------------------------------ *
 * Выборки
 * ------------------------------------------------------------------ */

export function findSchool(slug: string): School | undefined {
  return SCHOOLS.find((s) => s.slug === slug);
}

export function reviewsFor(slug: string): Review[] {
  return REVIEWS.filter((r) => r.schoolSlug === slug);
}

export type Filters = {
  city?: string;
  kind?: string;
  format?: SchoolFormat;
  age?: number;
  maxPrice?: number;
  query?: string;
  sort?: "rating" | "price-asc" | "price-desc";
};

export function filterSchools(filters: Filters): School[] {
  const result = SCHOOLS.filter((school) => {
    if (filters.city && school.city !== filters.city) return false;
    if (filters.kind && school.kind !== filters.kind) return false;
    if (filters.format && school.format !== filters.format) return false;
    if (filters.age && (school.ageFrom > filters.age || school.ageTo < filters.age)) return false;
    if (filters.maxPrice && school.pricePerMonth > filters.maxPrice) return false;

    if (filters.query) {
      const needle = filters.query.trim().toLowerCase();
      const haystack = [school.name, school.kind, school.district, school.city, school.short]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });

  switch (filters.sort) {
    case "price-asc":
      return result.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
    case "price-desc":
      return result.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
    default:
      return result.sort((a, b) => b.rating - a.rating);
  }
}

export function similarTo(school: School, limit = 3): School[] {
  return SCHOOLS.filter((s) => s.slug !== school.slug)
    .map((s) => {
      let score = 0;
      if (s.city === school.city) score += 3;
      if (s.kind === school.kind) score += 3;
      if (s.format === school.format) score += 2;
      if (Math.abs(s.pricePerMonth - school.pricePerMonth) < 30000) score += 2;
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

export function formatPrice(value: number): string {
  return priceFormat.format(value);
}

export function ageRange(school: School): string {
  return `${school.ageFrom}–${school.ageTo} лет`;
}
