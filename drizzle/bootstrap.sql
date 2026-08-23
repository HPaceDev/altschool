-- Полная инициализация базы портала согласования: одним файлом.
--
-- Куда вставлять: Supabase -> SQL Editor -> New query -> вставить всё
-- содержимое -> Run. Терминал и Node.js для этого не нужны.
--
-- Файл создаёт таблицы, триггеры неизменяемости истории, отметки о
-- применённых миграциях и стартовое наполнение: 14 вопросов первого круга,
-- словарь процесса и типовые риски.
--
-- После загрузки замените адрес тестового заказчика на реальный:
--   update users set email = 'ivanov@company.ru', name = 'Иван Иванов'
--   where email = 'client@example.com';
--
-- Файл сгенерирован из выверенной локальной базы; вручную его не правьте —
-- пересоздайте: npm run db:reset && ./scripts/make-bootstrap.sh

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS drizzle;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: decision_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.decision_status AS ENUM (
    'proposed',
    'approved',
    'superseded'
);


--
-- Name: inclusion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.inclusion AS ENUM (
    'in',
    'out'
);


--
-- Name: level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.level AS ENUM (
    'low',
    'medium',
    'high'
);


--
-- Name: moscow; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.moscow AS ENUM (
    'must',
    'should',
    'could',
    'wont'
);


--
-- Name: priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.priority AS ENUM (
    'blocker',
    'important',
    'later'
);


--
-- Name: question_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_status AS ENUM (
    'open',
    'answered',
    'accepted',
    'assumption_applied',
    'withdrawn'
);


--
-- Name: requirement_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.requirement_status AS ENUM (
    'draft',
    'review',
    'approved',
    'implemented'
);


--
-- Name: risk_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.risk_status AS ENUM (
    'open',
    'mitigated',
    'accepted',
    'closed'
);


--
-- Name: role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role AS ENUM (
    'owner',
    'client',
    'viewer'
);


--
-- Name: portal_block_mutation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.portal_block_mutation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION
    'Таблица "%" ведётся только на добавление: операция % запрещена. Внесите новую запись вместо изменения существующей.',
    TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$;


--
-- Name: portal_block_truncate(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.portal_block_truncate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION
    'Таблица "%" хранит историю проекта: очистка запрещена.', TG_TABLE_NAME
    USING ERRCODE = 'restrict_violation';
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    version integer NOT NULL,
    body text NOT NULL,
    author_id uuid,
    author_email text NOT NULL,
    author_name text NOT NULL,
    ip text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    entity_code text NOT NULL,
    statement text NOT NULL,
    actor_id uuid,
    actor_email text NOT NULL,
    actor_name text NOT NULL,
    ip text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    actor_id uuid,
    actor_email text,
    actor_name text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    entity_code text,
    summary text NOT NULL,
    payload jsonb,
    ip text,
    user_agent text
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    body text NOT NULL,
    author_id uuid,
    author_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: decisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    context text NOT NULL,
    decision text NOT NULL,
    consequences text,
    status public.decision_status DEFAULT 'proposed'::public.decision_status NOT NULL,
    supersedes_id uuid,
    source_question_code text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: glossary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.glossary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    term text NOT NULL,
    definition text NOT NULL,
    synonyms text,
    updated_by text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: magic_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.magic_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: prototype_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prototype_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    version text NOT NULL,
    notes text,
    url text,
    is_current boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    area text DEFAULT 'Общее'::text NOT NULL,
    priority public.priority DEFAULT 'important'::public.priority NOT NULL,
    status public.question_status DEFAULT 'open'::public.question_status NOT NULL,
    screen_ref text,
    default_assumption text,
    answer_due_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.requirements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    story text NOT NULL,
    acceptance text,
    area text DEFAULT 'Общее'::text NOT NULL,
    moscow public.moscow DEFAULT 'must'::public.moscow NOT NULL,
    status public.requirement_status DEFAULT 'draft'::public.requirement_status NOT NULL,
    screen_ref text,
    source_question_codes text[],
    source_decision_codes text[],
    estimate_points integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: risks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.risks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    likelihood public.level DEFAULT 'medium'::public.level NOT NULL,
    impact public.level DEFAULT 'medium'::public.level NOT NULL,
    mitigation text,
    owner text,
    status public.risk_status DEFAULT 'open'::public.risk_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: scope_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scope_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text,
    inclusion public.inclusion DEFAULT 'in'::public.inclusion NOT NULL,
    moscow public.moscow DEFAULT 'must'::public.moscow NOT NULL,
    phase text DEFAULT 'MVP'::text NOT NULL,
    estimate_days integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: screens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.screens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text,
    route text,
    role text,
    states text[],
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    user_agent text,
    ip text,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    org text,
    role public.role DEFAULT 'viewer'::public.role NOT NULL,
    disabled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

INSERT INTO drizzle.__drizzle_migrations VALUES (1, '595ed932a6858c5b3c513a173d4a015708a271f694063558d6b1ed6c31ed62da', 1787001325270);
INSERT INTO drizzle.__drizzle_migrations VALUES (2, '9fdf08c5df703a6e8c3f402208b58ebe7f4a8f048b06105c2ad7718114f6bfff', 1787001341258);
INSERT INTO drizzle.__drizzle_migrations VALUES (3, '1477f16637cfc380e3acfe82c3e1c026b6427b5ca8c8e735279b142a23a2ed81', 1787001964735);


--
-- Data for Name: answers; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: approvals; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.audit_log VALUES ('545acb81-0bce-4e7b-b452-45b1457dc1c5', '2026-08-23 21:31:51.668488+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', 'artymt04@gmail.com', 'Менеджер проекта', 'project.seeded', 'project', NULL, NULL, 'Портал создан, заведён первый круг вопросов (16 шт.)', NULL, NULL, NULL);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: decisions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: glossary; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: magic_links; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: prototype_versions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.questions VALUES ('9e4a867d-add9-4731-bd23-7db1eea64109', 'Q-001', 'Кто платит за сервис: школы или родители?', 'От этого зависит вообще всё остальное, поэтому вопрос первый.

Варианты, которые встречаются у похожих сервисов:

1. Школы платят за размещение — фиксированная сумма в месяц за профиль в каталоге.
2. Школы платят за заявку — деньги только за реальный контакт родителя.
3. Школы платят за зачисленного ребёнка — процент от первого платежа.
4. Родители платят за подбор — консультация специалиста.
5. Реклама и продвижение в выдаче.

Можно сочетать, но одна модель должна быть основной. Если платят за заявку, нужен учёт заявок и споры о том, чья это заявка. Если за размещение — нужен кабинет школы и биллинг. Это разный объём работы.', 'Бизнес-модель', 'blocker', 'open', NULL, 'Считаем основной моделью оплату школами за размещение. Учёт заявок и биллинг в первую версию не входят.', '2026-08-27 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('d1c4b829-4a64-4d13-84de-90f03df049ff', 'Q-002', 'Откуда возьмётся база школ и кто её ведёт?', 'Сейчас в прототипе десять вымышленных школ. В жизни их нужно откуда-то взять и постоянно обновлять — цены и наличие мест меняются каждый год.

Варианты:

1. Мы собираем сами: менеджер обзванивает школы и заполняет карточки.
2. Школы регистрируются и заполняют профиль сами.
3. Забираем данные с сайтов школ автоматически.
4. Покупаем готовую базу.

От ответа зависит, нужен ли кабинет школы и модерация — а это заметная часть работы. Скажите заодно, сколько школ вы рассчитываете видеть на старте.', 'Наполнение', 'blocker', 'open', 'Каталог', 'Первую сотню школ заполняем вручную через админку. Кабинет школы и саморегистрация — следующий этап.', '2026-08-27 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('94c5fba0-ca62-45f8-851b-51d355ba6586', 'Q-003', 'Что происходит после того, как родитель оставил заявку?', 'В прототипе заявка просто «отправлена». В жизни у неё должен быть адресат.

Ответьте, пожалуйста, по пунктам:

1. Заявка уходит прямо в школу или сначала к вашему менеджеру?
2. Если в школу — куда именно: на почту, в кабинет, в CRM?
3. Видит ли родитель статус заявки, или дальше общение идёт по телефону?
4. Что если школа не отвечает три дня — вы вмешиваетесь?

Это определяет, нужен ли раздел «Мои заявки» и кабинет школы вообще.', 'Заявки', 'blocker', 'open', 'Заявка, Мои заявки', 'Заявка уходит на почту школы и вашему менеджеру. Родитель видит статусы в разделе «Мои заявки», статусы проставляет менеджер вручную.', '2026-08-28 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('771ae7f7-1ddd-4356-84d1-502a06605d86', 'Q-004', 'Какие школы и какие города берём на старте?', 'В прототипе Москва, Петербург, Казань и онлайн-школы. Уточните охват:

1. Только частные и семейные школы, или государственные тоже?
2. Только школы, или сады и кружки тоже?
3. Какие города в первой версии?
4. Онлайн-школы включаем? У них нет привязки к городу, и это меняет логику фильтров.

Чем уже охват на старте, тем быстрее запуск и тем реалистичнее наполнить каталог.', 'Скоуп', 'blocker', 'open', 'Каталог', 'Берём частные, семейные и онлайн-школы в Москве и Петербурге. Сады, кружки и государственные школы — вне первой версии.', '2026-08-28 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('92ab0399-b95e-421c-9abb-87396d73a625', 'Q-005', 'Нужен ли школе свой кабинет?', 'Кабинет школы — это отдельный большой кусок работы: вход, редактирование профиля, загрузка фотографий, просмотр заявок, модерация изменений с вашей стороны.

Если школы платят за размещение, кабинет почти неизбежен. Если базу ведёте вы сами, в первой версии можно обойтись админкой для ваших менеджеров.

Скажите прямо: в первой версии школа что-то делает сама или всё через вас?', 'Скоуп', 'blocker', 'open', NULL, 'В первой версии кабинета школы нет. Всё ведут ваши менеджеры через админку, школа присылает изменения письмом.', '2026-08-29 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('35a133b0-85ae-4251-9032-6210b2b5c9f6', 'Q-006', 'По каким параметрам родители должны искать школу?', 'В прототипе фильтры: город, тип школы, формат, возраст ребёнка и бюджет. Это наша догадка.

Посмотрите каталог и скажите: чего не хватает и что лишнее? Кандидаты, которые мы не добавили: район или метро, расстояние от дома, наличие лицензии, продлёнка, питание, языки, подготовка к ЕГЭ, инклюзия, наличие сада, пансион, трансфер.

Важно понимать не только «что бывает», а что реально влияет на выбор. Каждый лишний фильтр усложняет и наполнение базы: кто-то должен заполнить это поле у каждой школы.', 'Поиск', 'important', 'open', 'Каталог', 'Оставляем текущий набор фильтров: город, тип, формат, возраст, бюджет. Остальное показываем в карточке, но не фильтруем.', '2026-08-31 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('873b7f34-58f6-4647-bee6-b9a746daa902', 'Q-007', 'Откуда берутся рейтинг и отзывы?', 'В прототипе у школ стоят оценки и отзывы — они вымышлены. В жизни это самое чувствительное место агрегатора.

1. Отзывы пишут родители у нас на сайте или мы собираем их из других источников?
2. Кто модерирует и по каким правилам?
3. Может ли школа отвечать на отзыв?
4. Как быть с отрицательными отзывами — школа платит за размещение и будет требовать их убрать. Что мы отвечаем?
5. Рейтинг — среднее по отзывам или ваша собственная оценка?

Пятый пункт особенно важен: собственная оценка означает ответственность за неё.', 'Отзывы', 'important', 'open', 'Карточка школы', 'Отзывы оставляют родители на сайте, публикация после ручной модерации. Рейтинг — среднее по отзывам. Школа может ответить на отзыв, удалять отзывы нельзя.', '2026-08-31 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('e71dac8d-a098-4559-8df8-4d4ea2095eb8', 'Q-008', 'Нужна ли родителю регистрация?', 'Сейчас в прототипе заявку можно оставить, просто заполнив форму, а раздел «Мои заявки» существует сам по себе.

Чтобы родитель видел статусы своих заявок, его нужно как-то узнавать. Варианты: регистрация до заявки, вход по коду из СМС после заявки, или вообще без личного кабинета — только письмо на почту.

Регистрация до заявки заметно снижает число заявок. Вход по СМС требует оплаты сообщений. Отсутствие кабинета делает часть прототипа ненужной.', 'Доступ', 'important', 'open', 'Заявка, Мои заявки', 'Заявку оставляют без регистрации. После отправки родитель получает ссылку на почту, по ней и попадает в «Мои заявки». Пароля нет.', '2026-08-31 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('9846b490-8e20-4322-8cdc-7964eef8764e', 'Q-009', 'Что должно быть в карточке школы обязательно?', 'Откройте карточку любой школы в прототипе. Сейчас там: фотографии, описание, сильные стороны, условия, отзывы и похожие школы.

Чего не хватает для решения? Обычно спрашивают про: расписание дня, состав педагогов, результаты ЕГЭ и олимпиад, меню питания, адрес на карте, виртуальный тур, документы и лицензии, правила поступления и вступительные испытания.

Отдельно: показываем ли мы цены открыто? Многие школы не хотят публиковать стоимость. Если цену скрывать, ломается фильтр по бюджету — а это один из главных.', 'Контент', 'important', 'open', 'Карточка школы', 'Оставляем текущий состав карточки, цены показываем открыто. Карта, виртуальные туры и состав педагогов — следующий этап.', '2026-08-31 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('0f9cb6f2-3fb2-460f-8880-8ecbcf7bd842', 'Q-010', 'Кто и как приводит родителей на сайт?', 'Агрегатор живёт за счёт трафика, и это влияет на разработку сильнее, чем кажется.

Если основной канал — поиск, нужны страницы под запросы вроде «частные школы в Хамовниках» и «семейные школы Москвы», а это отдельная работа: структура адресов, тексты, разметка для поисковиков. Если основной канал — реклама и соцсети, важнее скорость посадочных страниц и формы.

Скажите, на что рассчитываете, и есть ли у вас специалист по продвижению.', 'Продвижение', 'important', 'open', 'Каталог', 'Рассчитываем на поисковый трафик: делаем страницы категорий по городу и типу школы с текстами и разметкой для поисковиков.', '2026-09-02 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('64ba7bdb-c80e-4d3a-be4c-cc24bbc64350', 'Q-011', 'Нужно ли сравнение школ?', 'В прототипе есть сравнение до трёх школ таблицей. Это заметный кусок работы, и им пользуется меньшинство.

Посмотрите на экран сравнения и скажите: оставляем, упрощаем или убираем из первой версии? Если оставляем — какие параметры в таблице важны, а какие только мешают?', 'Скоуп', 'later', 'open', 'Сравнение', 'Сравнение оставляем в текущем виде: три школы, таблица параметров с подсветкой различий.', '2026-09-04 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('83c1cc1d-1160-4814-a784-d88f65156082', 'Q-012', 'Нужен ли подбор с участием человека?', 'Многие родители не хотят разбираться сами и готовы, чтобы им подобрали два-три варианта.

Если такая услуга нужна, на сайте появляется отдельный сценарий: анкета подробнее обычной, обработка вашим специалистом, подборка в ответ. Это может быть и платной услугой для родителей — то есть второй источник дохода.

Входит ли это в первую версию?', 'Скоуп', 'later', 'open', 'Главная', 'В первой версии подбора с участием человека нет: родитель ищет сам, форма заявки одна.', '2026-09-04 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('93c550f4-5105-46de-9835-b144277b00b1', 'Q-013', 'Проходят ли через сервис деньги за обучение?', 'Если родитель платит школе через нас, добавляются: договор с платёжным провайдером, чеки по 54-ФЗ, возвраты, разбирательства по спорным платежам и ответственность за чужие деньги. Это кратно больше работы, чем просто заявка.

Если деньги идут мимо нас, всё это отпадает.', 'Оплаты', 'important', 'open', NULL, 'Деньги за обучение через сервис не проходят. Родитель платит школе напрямую.', '2026-09-02 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('0d494d26-35a8-415e-9519-f2de2284f76d', 'Q-014', 'Как выглядит сайт и есть ли фирменный стиль?', 'Прототип нарисован в нейтральном деловом оформлении: это черновик, а не предложение по дизайну.

Пришлите логотип, цвета и шрифты, если они есть. Если нет — пришлите две-три ссылки на сайты, которые вам нравятся, и скажите, чем именно.

Заодно: как называется сервис? В прототипе стоит «АльтШкола» — это заглушка.', 'Дизайн', 'important', 'open', 'Главная', 'Название и стиль остаются рабочими заглушками. Оформление приводим к фирменному стилю отдельным этапом после запуска.', '2026-09-02 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('5532cbc9-3790-4d71-8b91-6e551e4522ff', 'Q-015', 'Нужно ли мобильное приложение?', 'Сайт будет удобно открываться с телефона в любом случае — это часть работы.

Отдельное приложение для магазинов приложений примерно удваивает объём: вторая сборка, публикация, обновления, отдельные проверки. Для сервиса, которым пользуются раз в несколько лет при выборе школы, приложение обычно не нужно.

Подтвердите, что приложения в первой версии не будет.', 'Платформа', 'later', 'open', NULL, 'Мобильного приложения нет. Делаем адаптивный сайт, удобный на телефоне.', '2026-09-06 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');
INSERT INTO public.questions VALUES ('44ce8ade-a325-4a00-b158-2fd8822e21b5', 'Q-016', 'Что считаем успехом через полгода после запуска?', 'Одна измеримая цифра. Например: «сто заявок в месяц», «пятьдесят платящих школ», «двадцать тысяч посетителей из поиска».

Это нужно не для отчётности, а чтобы правильно выбирать между функциями. Когда придётся решать, что делать раньше — кабинет школы или страницы под поиск, — ответ будет зависеть именно от этой цифры.', 'Продукт', 'important', 'open', NULL, 'Считаем главной метрикой число отправленных заявок и приоритезируем то, что увеличивает их количество.', '2026-08-31 21:31:51.662+00', '45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', '2026-08-23 21:31:51.665033+00', '2026-08-23 21:31:51.665033+00');


--
-- Data for Name: requirements; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: risks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: scope_items; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: screens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('45b834ae-14b5-4cd9-b5a3-8d2c0686beb1', 'artymt04@gmail.com', 'Менеджер проекта', NULL, 'owner', NULL, '2026-08-23 21:31:51.660126+00');
INSERT INTO public.users VALUES ('23ae1e6d-e3c5-4eba-8a3f-9577cc5749d6', 'client@example.com', 'Представитель заказчика', NULL, 'client', NULL, '2026-08-23 21:31:51.660126+00');


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 3, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);


--
-- Name: approvals approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: decisions decisions_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_code_unique UNIQUE (code);


--
-- Name: decisions decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_pkey PRIMARY KEY (id);


--
-- Name: glossary glossary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.glossary
    ADD CONSTRAINT glossary_pkey PRIMARY KEY (id);


--
-- Name: glossary glossary_term_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.glossary
    ADD CONSTRAINT glossary_term_unique UNIQUE (term);


--
-- Name: magic_links magic_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.magic_links
    ADD CONSTRAINT magic_links_pkey PRIMARY KEY (id);


--
-- Name: prototype_versions prototype_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prototype_versions
    ADD CONSTRAINT prototype_versions_pkey PRIMARY KEY (id);


--
-- Name: prototype_versions prototype_versions_version_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prototype_versions
    ADD CONSTRAINT prototype_versions_version_unique UNIQUE (version);


--
-- Name: questions questions_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_code_unique UNIQUE (code);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: requirements requirements_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_code_unique UNIQUE (code);


--
-- Name: requirements requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_pkey PRIMARY KEY (id);


--
-- Name: risks risks_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_code_unique UNIQUE (code);


--
-- Name: risks risks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_pkey PRIMARY KEY (id);


--
-- Name: scope_items scope_items_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scope_items
    ADD CONSTRAINT scope_items_code_unique UNIQUE (code);


--
-- Name: scope_items scope_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scope_items
    ADD CONSTRAINT scope_items_pkey PRIMARY KEY (id);


--
-- Name: screens screens_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_code_unique UNIQUE (code);


--
-- Name: screens screens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.screens
    ADD CONSTRAINT screens_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: answers_question_version_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX answers_question_version_idx ON public.answers USING btree (question_id, version);


--
-- Name: approvals_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approvals_entity_idx ON public.approvals USING btree (entity_type, entity_id);


--
-- Name: audit_log_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_log_at_idx ON public.audit_log USING btree (at);


--
-- Name: audit_log_entity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_log_entity_idx ON public.audit_log USING btree (entity_type, entity_id);


--
-- Name: comments_question_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX comments_question_idx ON public.comments USING btree (question_id);


--
-- Name: magic_links_token_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX magic_links_token_hash_idx ON public.magic_links USING btree (token_hash);


--
-- Name: questions_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_priority_idx ON public.questions USING btree (priority);


--
-- Name: questions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_status_idx ON public.questions USING btree (status);


--
-- Name: sessions_token_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sessions_token_hash_idx ON public.sessions USING btree (token_hash);


--
-- Name: answers answers_are_append_only; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER answers_are_append_only BEFORE DELETE OR UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION public.portal_block_mutation();


--
-- Name: answers answers_no_truncate; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER answers_no_truncate BEFORE TRUNCATE ON public.answers FOR EACH STATEMENT EXECUTE FUNCTION public.portal_block_truncate();


--
-- Name: approvals approvals_are_append_only; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER approvals_are_append_only BEFORE DELETE OR UPDATE ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.portal_block_mutation();


--
-- Name: approvals approvals_no_truncate; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER approvals_no_truncate BEFORE TRUNCATE ON public.approvals FOR EACH STATEMENT EXECUTE FUNCTION public.portal_block_truncate();


--
-- Name: audit_log audit_log_is_append_only; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_log_is_append_only BEFORE DELETE OR UPDATE ON public.audit_log FOR EACH ROW EXECUTE FUNCTION public.portal_block_mutation();


--
-- Name: audit_log audit_log_no_truncate; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER audit_log_no_truncate BEFORE TRUNCATE ON public.audit_log FOR EACH STATEMENT EXECUTE FUNCTION public.portal_block_truncate();


--
-- Name: comments comments_are_append_only; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comments_are_append_only BEFORE DELETE OR UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.portal_block_mutation();


--
-- Name: comments comments_no_truncate; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comments_no_truncate BEFORE TRUNCATE ON public.comments FOR EACH STATEMENT EXECUTE FUNCTION public.portal_block_truncate();


--
-- Name: answers answers_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: answers answers_question_id_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_question_id_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE RESTRICT;


--
-- Name: approvals approvals_actor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_actor_id_users_id_fk FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: comments comments_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: comments comments_question_id_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_question_id_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE RESTRICT;


--
-- Name: decisions decisions_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisions
    ADD CONSTRAINT decisions_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: questions questions_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sessions sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



-- Восстанавливаем search_path: pg_dump обнуляет его в начале файла.
SELECT pg_catalog.set_config('search_path', 'public', false);
