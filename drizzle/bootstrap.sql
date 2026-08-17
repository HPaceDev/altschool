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

INSERT INTO public.audit_log VALUES ('ea7052b3-5fad-4c39-b12a-bc56982b2ad1', '2026-08-17 21:59:49.558495+00', '2242821e-3908-46e8-bfb3-e25e669b4664', 'artymt04@gmail.com', 'Менеджер проекта', 'project.seeded', 'project', NULL, NULL, 'Портал создан, заведён первый круг вопросов (14 шт.)', NULL, NULL, NULL);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: decisions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: glossary; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.glossary VALUES ('605d780a-a8e5-4c16-a6c3-5be810f5cfd6', 'Блокер', 'Вопрос, без ответа на который работа по соответствующему участку останавливается. Мы не можем «пока сделать как-нибудь, потом поправим» — переделка обойдётся дороже, чем ожидание ответа.', 'критичный вопрос', 'Исполнитель', '2026-08-17 21:59:49.554324+00');
INSERT INTO public.glossary VALUES ('720fe07c-546c-4f08-ad3a-0781af42db95', 'Допущение по умолчанию', 'Заранее описанный вариант, который вступает в силу, если ответа на вопрос не поступило в указанный срок. Нужен, чтобы проект не останавливался из-за молчания. Изменить решение после этого момента можно, но это отдельная задача с отдельной оценкой.', 'вариант по умолчанию', 'Исполнитель', '2026-08-17 21:59:49.554324+00');
INSERT INTO public.glossary VALUES ('77dd4493-708f-4966-8dba-6d95f092045e', 'Скоуп', 'Границы работ этапа: что мы делаем и что сознательно не делаем. Список «не делаем» так же обязателен, как список «делаем» — именно он снимает разночтения на приёмке.', 'объём работ, границы этапа', 'Исполнитель', '2026-08-17 21:59:49.554324+00');
INSERT INTO public.glossary VALUES ('6f6254a6-1da8-45e5-bbb2-5ba4e50f3dfa', 'MVP', 'Первая работающая версия системы: минимальный набор функций, при котором ей уже можно пользоваться по-настоящему и получать пользу. Не черновик и не демо — рабочая система с узким набором возможностей.', 'первая версия, минимальный продукт', 'Исполнитель', '2026-08-17 21:59:49.554324+00');
INSERT INTO public.glossary VALUES ('b3b1e9a9-5f61-479d-9610-51a1a2b219fd', 'Критерий приёмки', 'Проверяемое условие, по которому мы вместе определяем, что требование выполнено. Формулируется так, чтобы проверка давала однозначный ответ «да» или «нет», без места для трактовок.', 'условие приёмки', 'Исполнитель', '2026-08-17 21:59:49.554324+00');
INSERT INTO public.glossary VALUES ('945b4871-a08b-40f6-be8e-8c3121beb6d3', 'Прототип', 'Кликабельная модель будущей системы без реальной логики и базы данных. Нужен, чтобы увидеть и обсудить интерфейс до разработки, когда правки стоят минуты, а не дни.', 'макет, кликабельный макет', 'Исполнитель', '2026-08-17 21:59:49.554324+00');


--
-- Data for Name: magic_links; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: prototype_versions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.questions VALUES ('ea441b9f-331d-4bb1-b178-0bfc6924e7da', 'Q-001', 'Кто со стороны заказчика принимает окончательные решения?', 'Нужно одно имя (можно двух человек: по продукту и по бюджету). Это не формальность: когда решение принимают все сразу, требования начинают противоречить друг другу, и переделка неизбежна.

Укажите, пожалуйста: имя, роль, рабочую почту. Мы заведём доступ в портал — отвечать и утверждать сможет именно этот человек.', 'Процесс', 'blocker', 'open', NULL, 'Считаем принимающим решения того, кто первым получил доступ в портал. Все его ответы и утверждения обязательны для обеих сторон.', '2026-08-20 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('96aed8e8-3019-4482-8519-96bc89b779c2', 'Q-002', 'Какую задачу бизнеса решает система и как поймём, что получилось?', 'Опишите своими словами: что происходит сейчас, почему это плохо, и что должно измениться после запуска.

Отдельно назовите одну измеримую метрику успеха — например «время обработки заявки с 2 дней до 2 часов» или «60% клиентов оформляют заказ без звонка менеджеру». Без неё мы не сможем расставлять приоритеты, когда придётся выбирать между функциями.', 'Продукт', 'blocker', 'open', NULL, 'Приоритезируем функции по нашему пониманию отрасли. Риск: важное для вас может уехать во вторую очередь.', '2026-08-22 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('8672c43f-d4fb-433b-a8e7-4447dc7f1a19', 'Q-003', 'Кто будет пользоваться системой и какие есть роли?', 'Перечислите типы пользователей и что каждый делает. Например: клиент оформляет заявку; менеджер её обрабатывает; руководитель смотрит отчёты; администратор заводит сотрудников.

Важно: есть ли роли, которые НЕ должны видеть данные друг друга? Разграничение прав, придуманное после разработки, всегда обходится дороже.', 'Продукт', 'blocker', 'open', NULL, 'Проектируем две роли: обычный пользователь и администратор. Добавление третьей роли позже — отдельная оценка.', '2026-08-22 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('463436a0-345c-4a35-9dad-f32b40f10600', 'Q-004', 'Что обязательно должно быть в первой версии, а что подождёт?', 'Назовите 3–5 вещей, без которых запускаться бессмысленно. И отдельно то, что хотелось бы, но можно во второй версии.

Это самый полезный ответ во всём списке: он напрямую определяет срок и бюджет. Список «не входит в первую версию» мы зафиксируем во вкладке «Скоуп», и на приёмке к нему уже не будет вопросов.', 'Скоуп', 'blocker', 'open', NULL, 'В первую версию берём только базовый сценарий: вход, основное действие пользователя, просмотр результата и минимальная админка.', '2026-08-22 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('249fcc4f-5009-47c6-9d87-42f33ed2023d', 'Q-005', 'Есть ли жёсткий срок запуска и с чем он связан?', 'Дата под выставку, сезон, окончание договора с текущим подрядчиком — всё это меняет план работ. Если срок жёсткий, мы режем скоуп заранее, а не в последнюю неделю.

Если жёсткой даты нет, так и напишите — это тоже ответ.', 'Процесс', 'blocker', 'open', NULL, 'Считаем, что жёсткой даты нет, и планируем от объёма работ.', '2026-08-20 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('64015ba5-bb56-4c83-881c-c73a5116d4c7', 'Q-006', 'На чём люди будут работать: компьютер, телефон или и то и другое?', 'Где система будет использоваться в реальности? Менеджер за десктопом и курьер с телефоном в руках — это два очень разных интерфейса.

Нужно ли отдельное мобильное приложение, или достаточно сайта, который удобно открывается с телефона? Приложение примерно удваивает объём работ.', 'Платформа', 'blocker', 'open', NULL, 'Делаем один адаптивный веб-интерфейс: удобно на десктопе, работоспособно на телефоне. Нативных приложений не делаем.', '2026-08-24 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('a1895597-3ddd-4923-b64d-a45437f5b581', 'Q-007', 'С какими существующими системами нужно связаться?', '1С, CRM, склад, телефония, платёжный провайдер, сайт — всё, откуда система должна брать данные или куда отдавать.

По каждой системе важно знать: есть ли у неё готовый API и кто с вашей стороны отвечает за доступ. Интеграции — самый частый источник срыва сроков, потому что зависят не от нас.', 'Интеграции', 'important', 'open', NULL, 'Интеграций в первой версии нет, данные вводятся вручную. Каждая интеграция добавляется отдельной задачей с отдельной оценкой.', '2026-08-27 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('ae9bf9a3-2192-4de5-a8ab-59a791fdb788', 'Q-008', 'Как пользователи будут входить в систему?', 'Варианты: почта и пароль, вход по СМС, вход через Госуслуги или соцсети, единый вход через вашу корпоративную учётную запись.

Если сотрудники уже входят куда-то по корпоративной учётке, обычно правильнее подключиться к ней, а не заводить ещё один пароль.', 'Доступ', 'important', 'open', NULL, 'Вход по почте и паролю с восстановлением через почту. Внешние провайдеры входа не подключаем.', '2026-08-27 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('ef919bd5-7d01-4eb5-966c-34713cf3c479', 'Q-009', 'Будут ли в системе персональные данные и деньги?', 'Персональные данные (ФИО, телефон, адрес, документы) накладывают требования 152-ФЗ: согласия, хранение на территории РФ, политика конфиденциальности. Приём платежей требует договора с банком или платёжным сервисом.

Оба пункта влияют на архитектуру и на выбор хостинга, поэтому решать их нужно до разработки, а не после.', 'Юридическое', 'important', 'open', NULL, 'Персональные данные обрабатываются, хостинг размещаем в РФ, платежи в первой версии не принимаем.', '2026-08-27 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('ab1495b0-edcc-409b-a066-67afc20bbd76', 'Q-010', 'Какие уведомления и куда должны приходить?', 'Почта, СМС, Telegram, push, уведомления внутри системы. По каждому: кому, при каком событии и насколько срочно.

СМС стоят денег за каждое сообщение — если объём большой, это заметная статья расходов, и лучше узнать о ней сейчас.', 'Продукт', 'important', 'open', NULL, 'Уведомления только по почте и внутри системы, по ключевым событиям основного сценария.', '2026-08-29 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('e633868f-da7e-45c3-9506-64ec6d0fc82d', 'Q-011', 'Есть ли фирменный стиль, которого нужно придерживаться?', 'Логотип, цвета, шрифты, брендбук, примеры существующих материалов. Если есть сайт, который вам нравится по стилю, — пришлите ссылку.

Если фирменного стиля нет, мы предложим свой вариант оформления, но тогда стоит заложить один круг правок на согласование внешнего вида.', 'Дизайн', 'important', 'open', NULL, 'Используем нейтральное деловое оформление на нашей дизайн-системе. Приведение к фирменному стилю позже — отдельная работа.', '2026-08-29 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('2421f363-e81b-4ed6-8840-a6f23059b0a3', 'Q-012', 'Сколько людей будет работать в системе одновременно?', 'Примерный порядок: десятки, сотни или тысячи. Ожидаются ли пиковые нагрузки — например, все подают заявки в последний день месяца?

От этого зависит выбор инфраструктуры. Ошибиться в большую сторону дорого, в меньшую — больно.', 'Техническое', 'later', 'open', NULL, 'Проектируем под сотни активных пользователей и десятки одновременных сессий, с возможностью масштабирования.', '2026-08-31 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('58d77788-baa4-40db-ad8e-36ecdc4fc618', 'Q-013', 'Нужны ли другие языки, кроме русского?', 'Многоязычность заметно дешевле заложить сразу, чем добавить потом: она затрагивает вёрстку, тексты, форматы дат и чисел.

Даже если второй язык нужен «когда-нибудь», скажите об этом сейчас — мы подготовим основу без заметного удорожания.', 'Продукт', 'later', 'open', NULL, 'Интерфейс только на русском, без подготовки к переводу.', '2026-08-31 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');
INSERT INTO public.questions VALUES ('b3bbb0bb-815e-4d4c-a34a-9fb5160731a9', 'Q-014', 'Кто будет поддерживать систему после запуска?', 'Ваши разработчики, мы по договору поддержки или пока никто? Ответ влияет на то, как мы пишем документацию и настраиваем инфраструктуру.

Если систему подхватывает ваша команда, мы заранее закладываем время на передачу и подробное описание архитектуры.', 'Процесс', 'later', 'open', NULL, 'Готовим документацию на передачу внешней команде и настраиваем инфраструктуру так, чтобы она не требовала нашего участия.', '2026-09-06 21:59:49.546+00', '2242821e-3908-46e8-bfb3-e25e669b4664', '2026-08-17 21:59:49.550106+00', '2026-08-17 21:59:49.550106+00');


--
-- Data for Name: requirements; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: risks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.risks VALUES ('aaa9f162-3df3-48d8-b1d5-6a049c08a982', 'R-001', 'Решения принимает не один человек', 'Когда требования согласуют несколько людей с разными взглядами, ответы начинают противоречить друг другу. Разработка идёт по одному варианту, а на приёмке приходит человек с другим представлением.', 'high', 'high', 'Зафиксировать одного ответственного за решения (вопрос Q-001). Все ответы даются через портал под его именем; устные договорённости в работу не берутся, пока не внесены сюда.', 'Заказчик', 'open', '2026-08-17 21:59:49.556412+00');
INSERT INTO public.risks VALUES ('03859f0f-f83f-47f5-b6b1-0e57650b9c78', 'R-002', 'Скоуп расширяется по ходу разработки', 'Классический сценарий: в процессе появляется «ну это же очевидно должно быть». Каждая такая мелочь по отдельности выглядит недорого, но вместе они срывают срок.', 'high', 'medium', 'Вкладка «Скоуп» с явным списком того, что не входит в этап. Новые пожелания не отклоняются, а попадают в следующий этап с отдельной оценкой срока и стоимости.', 'Обе стороны', 'open', '2026-08-17 21:59:49.556412+00');
INSERT INTO public.risks VALUES ('756b0c6d-f692-4e04-9663-abe820c6b062', 'R-003', 'Ответы на вопросы приходят с задержкой', 'Проект простаивает, пока ждёт ответа. Через месяц простоя возникает разговор «почему так долго», хотя работа стояла не по нашей вине.', 'medium', 'high', 'У каждого вопроса есть срок и допущение по умолчанию. Молчание не останавливает проект: по истечении срока работа идёт по описанному варианту, а факт фиксируется в журнале.', 'Исполнитель', 'mitigated', '2026-08-17 21:59:49.556412+00');
INSERT INTO public.risks VALUES ('d4927e66-1a24-4769-ae49-10e1d0acdf93', 'R-004', 'Интеграции зависят от третьих сторон', 'Доступы к 1С, CRM или платёжному сервису выдаёт не заказчик и не мы, а сторонний подрядчик или служба безопасности. Ожидание доступа может занять недели.', 'medium', 'high', 'Выяснить список интеграций и ответственных заранее (вопрос Q-007). Разработку вести на заглушках, чтобы отсутствие доступа не блокировало остальную работу.', 'Обе стороны', 'open', '2026-08-17 21:59:49.556412+00');
INSERT INTO public.risks VALUES ('5d877f70-f521-42f8-9919-a0750e1595d5', 'R-005', 'Прототип принимают за готовую систему', 'Кликабельный прототип выглядит настолько живым, что возникает ощущение «всё почти готово, осталось подключить базу». На деле после прототипа сделана примерно десятая часть работы.', 'medium', 'medium', 'Проговаривать на каждом показе, что прототип — это модель интерфейса без логики, расчётов, прав доступа и хранения данных. Оценка разработки даётся отдельно и после согласования прототипа.', 'Исполнитель', 'mitigated', '2026-08-17 21:59:49.556412+00');


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

INSERT INTO public.users VALUES ('2242821e-3908-46e8-bfb3-e25e669b4664', 'artymt04@gmail.com', 'Менеджер проекта', NULL, 'owner', NULL, '2026-08-17 21:59:49.5446+00');
INSERT INTO public.users VALUES ('190835a0-5304-4f7e-9291-899f02a7b8ff', 'client@example.com', 'Представитель заказчика', NULL, 'client', NULL, '2026-08-17 21:59:49.5446+00');


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
