import { chromium } from "playwright";
import { execSync } from "node:child_process";

const BASE = "http://localhost:3000";
const SHOT = "/tmp/claude-0/-home-user-altschool/1e38e5be-6451-5d49-9058-1b509237a669/scratchpad";

const psql = (q) =>
  execSync(
    `PGPASSWORD=altschool psql -h 127.0.0.1 -U altschool -d altschool -tAc ${JSON.stringify(q)}`,
    { encoding: "utf8" },
  ).trim();

// Проверки считают записи, поэтому прогон всегда начинается с чистой базы.
console.log("Пересоздаю базу перед прогоном…");
execSync("npm run db:reset", { stdio: "ignore" });

function check(name, condition, extra = "") {
  console.log(`${condition ? "OK  " : "FAIL"} ${name}${extra ? ` — ${extra}` : ""}`);
  if (!condition) process.exitCode = 1;
}

/** Вход через одноразовую ссылку: запрашиваем и сразу переходим по ней. */
async function loginAs(context, email) {
  const page = await context.newPage();
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', email);
  await page.click('button[type="submit"]');
  // Необратимые действия закрыты подтверждением; в тесте соглашаемся.
  page.on("dialog", (dialog) => dialog.accept());
  const link = page.locator("a[href*='/api/auth/verify']");
  await link.waitFor({ timeout: 15000 });
  await link.click();
  // Корень портала перенаправляет на прототип — ждём именно его.
  await page.waitForURL(`${BASE}/prototype`, { timeout: 15000 });
  return page;
}

// В этом окружении Chromium уже установлен; версия сборки не совпадает
// с той, что тянет playwright по умолчанию, поэтому указываем путь явно.
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
});

/* ---------------- Заказчик отвечает ---------------- */
const clientCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const client = await loginAs(clientCtx, "client@example.com");
check("вход заказчика", (await client.title()).includes("Портал согласования"));
await client.screenshot({ path: `${SHOT}/01-overview.png`, fullPage: true });

await client.goto(`${BASE}/questions`);
await client.screenshot({ path: `${SHOT}/02-questions.png`, fullPage: true });
check("список вопросов", (await client.locator("a[href^='/questions/Q-']").count()) === 16);

await client.goto(`${BASE}/questions/Q-005`);
await client.fill('textarea[name="body"]', "Кабинет школы в первой версии не нужен, ведём базу сами.");
await client.click('button:has-text("Ответить")');
await client.waitForSelector("text=Ответ сохранён", { timeout: 15000 });
check("ответ сохранён", psql("select count(*) from answers where version=1") === "1");

// Правка ответа обязана создать вторую версию, а не переписать первую.
await client.reload();
await client.fill('textarea[name="body"]', "Уточняю: простой кабинет всё же нужен — школа должна менять цены сама.");
await client.click('button:has-text("Сохранить новую версию")');
await client.waitForSelector("text=Сохранена версия 2", { timeout: 15000 });
await client.screenshot({ path: `${SHOT}/03-question-detail.png`, fullPage: true });

const versions = psql(
  "select string_agg(version::text, ',' order by version) from answers a join questions q on q.id=a.question_id where q.code='Q-005'",
);
check("две версии ответа", versions === "1,2", `версии: ${versions}`);
const firstBody = psql(
  "select a.body from answers a join questions q on q.id=a.question_id where q.code='Q-005' and a.version=1",
);
check("первая версия не изменилась", firstBody.startsWith("Кабинет школы в первой версии не нужен"));

await client.click('button:has-text("Утверждаю")');
await client.waitForSelector("text=Утверждение зафиксировано", { timeout: 15000 });
check("утверждение записано", psql("select count(*) from approvals") === "1");
check(
  "в утверждении сохранён текст ответа",
  psql("select statement from approvals limit 1").includes("школа должна менять цены сама"),
);

/* ---------------- Исполнитель фиксирует ---------------- */
const ownerCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const owner = await loginAs(ownerCtx, "artymt04@gmail.com");
await owner.goto(`${BASE}/questions/Q-005`);
await owner.click('button:has-text("Зафиксировать ответ")');
// После фиксации блок с кнопкой исчезает, а статус вопроса меняется на «Зафиксировано».
await owner.waitForSelector("text=Зафиксировано", { timeout: 15000 });
check("статус вопроса", psql("select status from questions where code='Q-005'") === "accepted");

// Заказчик не должен видеть действий исполнителя.
await client.reload();
check("заказчик не видит кнопок исполнителя", !(await client.locator('button:has-text("Снять вопрос")').count()));
check("исполнитель не видит кнопку утверждения", !(await owner.locator('button:has-text("Утверждаю")').count()));

/* ---------------- Остальные вкладки ---------------- */
for (const [path, name] of [
  ["/prototype", "главная агрегатора"],
  ["/prototype/catalog", "каталог"],
  ["/prototype/catalog?city=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0&maxPrice=60000", "каталог с фильтрами"],
  ["/prototype/school/pyatoe-izmerenie", "карточка школы"],
  ["/prototype/compare?schools=pyatoe-izmerenie,tochka-rosta", "сравнение"],
  ["/prototype/request?school=pyatoe-izmerenie&step=2", "заявка"],
  ["/prototype/cabinet", "мои заявки"],
]) {
  const response = await owner.goto(`${BASE}${path}`);
  check(`прототип: ${name}`, response.status() === 200, `HTTP ${response.status()}`);
}

// Фильтр обязан реально сокращать выдачу, иначе прототип вводит в заблуждение.
await owner.goto(`${BASE}/prototype/catalog`);
// Считаем карточки, а не ссылки: на одну школу их приходится несколько.
const allCards = await owner.locator("article").count();
await owner.goto(`${BASE}/prototype/catalog?maxPrice=30000`);
const cheapCards = await owner.locator("article").count();
check("фильтр по бюджету сокращает выдачу", cheapCards > 0 && cheapCards < allCards, `${cheapCards} из ${allCards}`);

await owner.goto(`${BASE}/prototype/catalog?city=%D0%9A%D0%B0%D0%B7%D0%B0%D0%BD%D1%8C&maxPrice=30000&kind=%D0%9C%D0%B5%D0%B6%D0%B4%D1%83%D0%BD%D0%B0%D1%80%D0%BE%D0%B4%D0%BD%D0%B0%D1%8F%20%D1%88%D0%BA%D0%BE%D0%BB%D0%B0`);
check(
  "пустая выдача показывает объяснение",
  await owner.getByText("Ничего не нашлось", { exact: true }).isVisible(),
);


/* ---------------- Журнал ---------------- */
const events = psql("select count(*) from audit_log");
check("журнал наполняется", Number(events) >= 8, `${events} записей`);
const approvedLogged = psql("select count(*) from audit_log where action='question.approved'");
check("утверждение попало в журнал", approvedLogged === "1");

/* ---------------- Доступ без входа ---------------- */
const anonCtx = await browser.newContext();
const anon = await anonCtx.newPage();
await anon.goto(`${BASE}/prototype`);
check("гостя перебрасывает на вход", anon.url().includes("/login"), anon.url());

/* ---------------- Повторный переход по использованной ссылке ---------------- */
const reuse = await anonCtx.newPage();
await reuse.goto(`${BASE}/login`);
await reuse.fill('input[name="email"]', "client@example.com");
await reuse.click('button[type="submit"]');
const magic = await reuse.locator("a[href*='/api/auth/verify']").getAttribute("href");
await reuse.goto(magic);
check("первый переход по ссылке пускает", !reuse.url().includes("/login"), reuse.url());

// Обязательно чистый контекст: в прежнем уже стоит cookie сессии, и страница
// входа увела бы на главную независимо от того, сработала ссылка или нет.
const freshCtx = await browser.newContext();
const second = await freshCtx.newPage();
await second.goto(magic);
check("повторный переход отклонён", second.url().includes("error=expired"), second.url());
check(
  "без действующей сессии портал закрыт",
  (await (await freshCtx.newPage()).goto(`${BASE}/questions`)).url().includes("/login"),
);

/* ---------------- Мобильная ширина ---------------- */
const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobile = await loginAs(mobileCtx, "client@example.com");
await mobile.goto(`${BASE}/prototype/catalog`);
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1,
);
check("нет горизонтальной прокрутки на телефоне", !overflow);
await mobile.screenshot({ path: `${SHOT}/06-mobile.png`, fullPage: true });

await browser.close();
console.log("\nПроверка завершена.");
