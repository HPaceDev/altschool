import { chromium } from "playwright";
import { execSync } from "node:child_process";

const BASE = "http://localhost:3000";
const SHOT = process.env.SHOT_DIR ?? "/tmp/portal-shots";

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

/** Входа в систему нет: открываем рабочую область роли по ссылке. */
async function enterAs(context, roleId, expectedPath) {
  const page = await context.newPage();
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(`${BASE}/enter/${roleId}`);
  await page.waitForURL(`${BASE}${expectedPath}`, { timeout: 15000 });
  return page;
}

// В этом окружении Chromium уже установлен; версия сборки не совпадает
// с той, что тянет playwright по умолчанию, поэтому указываем путь явно.
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
});

/* ---------------- Стартовый экран ---------------- */
const guestCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const guest = await guestCtx.newPage();
await guest.goto(BASE);
check("стартовый экран открывается без пароля", (await guest.title()).includes("Выбор роли"));
check("на экране пять ролей", (await guest.locator("a[href^='/enter/']").count()) === 5);
check("нет формы входа", (await guest.locator('input[type="password"], input[name="email"]').count()) === 0);
await guest.screenshot({ path: `${SHOT}/01-roles.png`, fullPage: true });

// Без выбранной роли рабочая область недоступна.
await guest.goto(`${BASE}/questions`);
check("без роли уводит на выбор роли", guest.url() === `${BASE}/`, guest.url());

/* ---------------- Родитель смотрит агрегатор ---------------- */
const parentCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const parent = await enterAs(parentCtx, "parent", "/prototype");
check("роль родителя открывает агрегатор", parent.url() === `${BASE}/prototype`);
await parent.screenshot({ path: `${SHOT}/02-home.png`, fullPage: true });

// Меню скрыто и открывается по кнопке.
const drawer = parent.locator("#workspace-drawer");
check("меню скрыто по умолчанию", (await drawer.getAttribute("aria-hidden")) === "true");
await parent.click('button:has-text("Меню")');
await parent.waitForTimeout(300);
check("меню открывается", (await drawer.getAttribute("aria-hidden")) === "false");
await parent.screenshot({ path: `${SHOT}/03-drawer.png` });
await parent.keyboard.press("Escape");
await parent.waitForTimeout(300);
check("меню закрывается по Escape", (await drawer.getAttribute("aria-hidden")) === "true");

for (const [path, name] of [
  ["/prototype/catalog", "каталог"],
  ["/prototype/school/pyatoe-izmerenie", "карточка школы"],
  ["/prototype/compare?schools=pyatoe-izmerenie,tochka-rosta", "сравнение"],
  ["/prototype/request?school=pyatoe-izmerenie&step=2", "заявка"],
  ["/prototype/cabinet", "мои заявки"],
  ["/school", "кабинет школы"],
  ["/admin", "администратор"],
]) {
  const response = await parent.goto(`${BASE}${path}`);
  check(`экран: ${name}`, response.status() === 200, `HTTP ${response.status()}`);
}

// Фильтр обязан реально сокращать выдачу, иначе прототип вводит в заблуждение.
await parent.goto(`${BASE}/prototype/catalog`);
const allCards = await parent.locator("article").count();
await parent.goto(`${BASE}/prototype/catalog?maxPrice=30000`);
const cheapCards = await parent.locator("article").count();
check("фильтр по бюджету сокращает выдачу", cheapCards > 0 && cheapCards < allCards, `${cheapCards} из ${allCards}`);
await parent.screenshot({ path: `${SHOT}/04-catalog.png`, fullPage: true });

await parent.goto(
  `${BASE}/prototype/catalog?city=%D0%9A%D0%B0%D0%B7%D0%B0%D0%BD%D1%8C&maxPrice=30000&kind=%D0%9C%D0%B5%D0%B6%D0%B4%D1%83%D0%BD%D0%B0%D1%80%D0%BE%D0%B4%D0%BD%D0%B0%D1%8F%20%D1%88%D0%BA%D0%BE%D0%BB%D0%B0`,
);
check("пустая выдача объясняет, что делать", await parent.getByText("Ничего не нашлось", { exact: true }).isVisible());

// Родителю нечего делать в вопросах проекта.
await parent.goto(`${BASE}/questions/Q-005`);
check("родитель не может отвечать", (await parent.locator('button:has-text("Ответить")').count()) === 0);

/* ---------------- Заказчик отвечает ---------------- */
const clientCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const client = await enterAs(clientCtx, "client", "/questions");
check("роль заказчика открывает вопросы", client.url() === `${BASE}/questions`);
check("список вопросов", (await client.locator("a[href^='/questions/Q-']").count()) === 27);
await client.screenshot({ path: `${SHOT}/05-questions.png`, fullPage: true });

await client.goto(`${BASE}/questions/Q-005`);
await client.fill('textarea[name="body"]', "Кабинет школы в первой версии не нужен, ведём базу сами.");
await client.fill('input[name="authorName"]', "Ирина Соколова");
await client.click('button:has-text("Ответить")');
await client.waitForSelector("text=Ответ сохранён", { timeout: 15000 });
check("ответ сохранён", psql("select count(*) from answers") === "1");
check("имя автора записано", psql("select author_name from answers limit 1") === "Ирина Соколова");
check("роль автора записана", psql("select author_role from answers limit 1") === "client");

// Правка ответа обязана создать вторую версию, а не переписать первую.
await client.reload();
await client.fill('textarea[name="body"]', "Уточняю: простой кабинет всё же нужен — школа должна менять цены сама.");
await client.click('button:has-text("Сохранить новую версию")');
await client.waitForSelector("text=Сохранена версия 2", { timeout: 15000 });

const versions = psql(
  "select string_agg(version::text, ',' order by version) from answers a join questions q on q.id=a.question_id where q.code='Q-005'",
);
check("две версии ответа", versions === "1,2", `версии: ${versions}`);
const firstBody = psql(
  "select a.body from answers a join questions q on q.id=a.question_id where q.code='Q-005' and a.version=1",
);
check("первая версия не изменилась", firstBody.startsWith("Кабинет школы в первой версии не нужен"));
await client.screenshot({ path: `${SHOT}/06-question.png`, fullPage: true });

await client.click('button:has-text("Утверждаю")');
await client.waitForSelector("text=Утверждение зафиксировано", { timeout: 15000 });
check("утверждение записано", psql("select count(*) from approvals") === "1");
check(
  "в утверждении сохранён текст ответа",
  psql("select statement from approvals limit 1").includes("школа должна менять цены сама"),
);

/* ---------------- Команда проекта фиксирует ---------------- */
const teamCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const team = await enterAs(teamCtx, "team", "/questions");
await team.goto(`${BASE}/questions/Q-005`);
await team.click('button:has-text("Зафиксировать ответ")');
// После фиксации блок с кнопкой исчезает, а статус вопроса меняется.
await team.waitForSelector("text=Зафиксировано", { timeout: 15000 });
check("статус вопроса", psql("select status from questions where code='Q-005'") === "accepted");

check("заказчик не видит действий команды", (await client.locator('button:has-text("Снять вопрос")').count()) === 0);
check("команда не видит кнопку утверждения", (await team.locator('button:has-text("Утверждаю")').count()) === 0);
await team.goto(`${BASE}/questions`);
check("команда может заводить вопросы", (await team.locator("a[href='/questions/new']").count()) > 0);

/* ---------------- Журнал ---------------- */
check("журнал наполняется", Number(psql("select count(*) from audit_log")) >= 6);
check("утверждение попало в журнал", psql("select count(*) from audit_log where action='question.approved'") === "1");
check(
  "неизменяемость истории работает",
  (() => {
    try {
      psql("update audit_log set summary='подделка'");
      return false;
    } catch {
      return true;
    }
  })(),
);

/* ---------------- Телефон ---------------- */
const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobile = await enterAs(mobileCtx, "parent", "/prototype");
await mobile.goto(`${BASE}/prototype/catalog`);
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1,
);
check("нет горизонтальной прокрутки на телефоне", !overflow);
await mobile.screenshot({ path: `${SHOT}/07-mobile.png`, fullPage: true });

await browser.close();
console.log("\nПроверка завершена.");
