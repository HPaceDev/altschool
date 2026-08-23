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
-- Name: role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.role AS ENUM (
    'parent',
    'school',
    'moderator',
    'client',
    'team'
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
    author_role public.role NOT NULL,
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
    actor_role public.role NOT NULL,
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
    actor_role text,
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
    author_role public.role NOT NULL,
    author_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
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
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

INSERT INTO drizzle.__drizzle_migrations VALUES (1, '454301045ef79223dd5a4b38596c292c60aa851685c89b7716fe31d5a7bf0ed8', 1787521585949);
INSERT INTO drizzle.__drizzle_migrations VALUES (2, '9fdf08c5df703a6e8c3f402208b58ebe7f4a8f048b06105c2ad7718114f6bfff', 1787521598420);
INSERT INTO drizzle.__drizzle_migrations VALUES (3, '1477f16637cfc380e3acfe82c3e1c026b6427b5ca8c8e735279b142a23a2ed81', 1787521599244);


--
-- Data for Name: answers; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: approvals; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.audit_log VALUES ('f9159720-95c9-42be-842d-bf89ec4e9dd7', '2026-08-23 22:56:14.248942+00', 'team', 'Команда проекта', 'project.seeded', 'project', NULL, NULL, 'Заведено вопросов: 27 (Q-001, Q-002, Q-003, Q-004, Q-005, Q-006, Q-007, Q-008, Q-009, Q-010, Q-011, Q-012, Q-013, Q-014, Q-015, Q-016, Q-017, Q-018, Q-019, Q-020, Q-021, Q-022, Q-023, Q-024, Q-025, Q-026, Q-027)', NULL, NULL, NULL);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.questions VALUES ('7ae7e823-face-41e0-aa97-173dc3dea8fe', 'Q-001', 'Кто платит за сервис: школы или родители?', 'От этого зависит вообще всё остальное, поэтому вопрос первый.

Варианты, которые встречаются у похожих сервисов:

1. Школы платят за размещение — фиксированная сумма в месяц за профиль в каталоге.
2. Школы платят за заявку — деньги только за реальный контакт родителя.
3. Школы платят за зачисленного ребёнка — процент от первого платежа.
4. Родители платят за подбор — консультация специалиста.
5. Реклама и продвижение в выдаче.

Можно сочетать, но одна модель должна быть основной. Если платят за заявку, нужен учёт заявок и споры о том, чья это заявка. Если за размещение — нужен кабинет школы и биллинг. Это разный объём работы.', 'Бизнес-модель', 'blocker', 'open', NULL, 'Считаем основной моделью оплату школами за размещение. Учёт заявок и биллинг в первую версию не входят.', '2026-08-27 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('fb312d46-d3ff-4e33-9c20-1bee843d288b', 'Q-002', 'Откуда возьмётся база школ и кто её ведёт?', 'Сейчас в прототипе десять вымышленных школ. В жизни их нужно откуда-то взять и постоянно обновлять — цены и наличие мест меняются каждый год.

Варианты:

1. Мы собираем сами: менеджер обзванивает школы и заполняет карточки.
2. Школы регистрируются и заполняют профиль сами.
3. Забираем данные с сайтов школ автоматически.
4. Покупаем готовую базу.

От ответа зависит, нужен ли кабинет школы и модерация — а это заметная часть работы. Скажите заодно, сколько школ вы рассчитываете видеть на старте.

На звонке 23 августа прозвучало, что планируется парсинг сайтов и соцсетей, поиск школ с помощью ИИ и обзвон роботом. Подтвердите, что это основной путь наполнения. Правовую сторону парсинга и обзвона разбираем отдельно — вопросы Q-020 и Q-021.', 'Наполнение', 'blocker', 'open', 'Каталог', 'Первую сотню школ заполняем вручную через админку. Кабинет школы и саморегистрация — следующий этап.', '2026-08-27 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('11eadfc5-3d89-4989-8f80-38eae2756561', 'Q-003', 'Что происходит после того, как родитель оставил заявку?', 'В прототипе заявка просто «отправлена». В жизни у неё должен быть адресат.

Ответьте, пожалуйста, по пунктам:

1. Заявка уходит прямо в школу или сначала к вашему менеджеру?
2. Если в школу — куда именно: на почту, в кабинет, в CRM?
3. Видит ли родитель статус заявки, или дальше общение идёт по телефону?
4. Что если школа не отвечает три дня — вы вмешиваетесь?

Это определяет, нужен ли раздел «Мои заявки» и кабинет школы вообще.', 'Заявки', 'blocker', 'open', 'Заявка, Мои заявки', 'Заявка уходит на почту школы и вашему менеджеру. Родитель видит статусы в разделе «Мои заявки», статусы проставляет менеджер вручную.', '2026-08-28 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('e52ac557-365a-4184-82b7-100f51eca750', 'Q-004', 'Какие школы и какие города берём на старте?', 'В прототипе Москва, Петербург, Казань и онлайн-школы. Уточните охват:

1. Только частные и семейные школы, или государственные тоже?
2. Только школы, или сады и кружки тоже?
3. Какие города в первой версии?
4. Онлайн-школы включаем? У них нет привязки к городу, и это меняет логику фильтров.

Чем уже охват на старте, тем быстрее запуск и тем реалистичнее наполнить каталог.

На звонке прозвучало: школы развивающего обучения по всей России. Это заметно шире того, что мы заложили в прототип. Подтвердите охват и скажите, с каких городов начинаем — каталог по всей стране нельзя наполнить сразу.', 'Скоуп', 'blocker', 'open', 'Каталог', 'Берём частные, семейные и онлайн-школы в Москве и Петербурге. Сады, кружки и государственные школы — вне первой версии.', '2026-08-28 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('97e51c38-8889-4206-b21c-5a024d4e941f', 'Q-005', 'Нужен ли школе свой кабинет?', 'Кабинет школы — это отдельный большой кусок работы: вход, редактирование профиля, загрузка фотографий, просмотр заявок, модерация изменений с вашей стороны.

Если школы платят за размещение, кабинет почти неизбежен. Если базу ведёте вы сами, в первой версии можно обойтись админкой для ваших менеджеров.

Скажите прямо: в первой версии школа что-то делает сама или всё через вас?

На звонке кабинет школы упоминался как часть «обучающей платформы» — с лидами, аналитикой, модерацией, контентом и событиями. Похоже, ответ «кабинет нужен», но объём пока неясен: см. Q-018.', 'Скоуп', 'blocker', 'open', NULL, 'В первой версии кабинета школы нет. Всё ведут ваши менеджеры через админку, школа присылает изменения письмом.', '2026-08-29 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('4d676b7b-751f-462f-814d-57482909d099', 'Q-006', 'По каким параметрам родители должны искать школу?', 'В прототипе фильтры: город, тип школы, формат, возраст ребёнка и бюджет. Это наша догадка.

Посмотрите каталог и скажите: чего не хватает и что лишнее? Кандидаты, которые мы не добавили: район или метро, расстояние от дома, наличие лицензии, продлёнка, питание, языки, подготовка к ЕГЭ, инклюзия, наличие сада, пансион, трансфер.

Важно понимать не только «что бывает», а что реально влияет на выбор. Каждый лишний фильтр усложняет и наполнение базы: кто-то должен заполнить это поле у каждой школы.', 'Поиск', 'important', 'open', 'Каталог', 'Оставляем текущий набор фильтров: город, тип, формат, возраст, бюджет. Остальное показываем в карточке, но не фильтруем.', '2026-08-31 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('f7374428-2806-4b73-adc3-59ff3030a256', 'Q-007', 'Откуда берутся рейтинг и отзывы?', 'В прототипе у школ стоят оценки и отзывы — они вымышлены. В жизни это самое чувствительное место агрегатора.

1. Отзывы пишут родители у нас на сайте или мы собираем их из других источников?
2. Кто модерирует и по каким правилам?
3. Может ли школа отвечать на отзыв?
4. Как быть с отрицательными отзывами — школа платит за размещение и будет требовать их убрать. Что мы отвечаем?
5. Рейтинг — среднее по отзывам или ваша собственная оценка?

Пятый пункт особенно важен: собственная оценка означает ответственность за неё.', 'Отзывы', 'important', 'open', 'Карточка школы', 'Отзывы оставляют родители на сайте, публикация после ручной модерации. Рейтинг — среднее по отзывам. Школа может ответить на отзыв, удалять отзывы нельзя.', '2026-08-31 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('bbf52f29-fc56-4bad-b70d-4255e8b1793d', 'Q-008', 'Нужна ли родителю регистрация?', 'Сейчас в прототипе заявку можно оставить, просто заполнив форму, а раздел «Мои заявки» существует сам по себе.

Чтобы родитель видел статусы своих заявок, его нужно как-то узнавать. Варианты: регистрация до заявки, вход по коду из СМС после заявки, или вообще без личного кабинета — только письмо на почту.

Регистрация до заявки заметно снижает число заявок. Вход по СМС требует оплаты сообщений. Отсутствие кабинета делает часть прототипа ненужной.', 'Доступ', 'important', 'open', 'Заявка, Мои заявки', 'Заявку оставляют без регистрации. После отправки родитель получает ссылку на почту, по ней и попадает в «Мои заявки». Пароля нет.', '2026-08-31 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('9da7899d-61ea-4993-85d4-c0a7e5a44ce1', 'Q-009', 'Что должно быть в карточке школы обязательно?', 'Откройте карточку любой школы в прототипе. Сейчас там: фотографии, описание, сильные стороны, условия, отзывы и похожие школы.

Чего не хватает для решения? Обычно спрашивают про: расписание дня, состав педагогов, результаты ЕГЭ и олимпиад, меню питания, адрес на карте, виртуальный тур, документы и лицензии, правила поступления и вступительные испытания.

Отдельно: показываем ли мы цены открыто? Многие школы не хотят публиковать стоимость. Если цену скрывать, ломается фильтр по бюджету — а это один из главных.', 'Контент', 'important', 'open', 'Карточка школы', 'Оставляем текущий состав карточки, цены показываем открыто. Карта, виртуальные туры и состав педагогов — следующий этап.', '2026-08-31 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('de74c70d-2c5d-4314-9936-bf389a19cbe0', 'Q-010', 'Кто и как приводит родителей на сайт?', 'Агрегатор живёт за счёт трафика, и это влияет на разработку сильнее, чем кажется.

Если основной канал — поиск, нужны страницы под запросы вроде «частные школы в Хамовниках» и «семейные школы Москвы», а это отдельная работа: структура адресов, тексты, разметка для поисковиков. Если основной канал — реклама и соцсети, важнее скорость посадочных страниц и формы.

Скажите, на что рассчитываете, и есть ли у вас специалист по продвижению.', 'Продвижение', 'important', 'open', 'Каталог', 'Рассчитываем на поисковый трафик: делаем страницы категорий по городу и типу школы с текстами и разметкой для поисковиков.', '2026-09-02 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('94450ea4-c067-438c-b2b9-392e9a98c308', 'Q-011', 'Нужно ли сравнение школ?', 'В прототипе есть сравнение до трёх школ таблицей. Это заметный кусок работы, и им пользуется меньшинство.

Посмотрите на экран сравнения и скажите: оставляем, упрощаем или убираем из первой версии? Если оставляем — какие параметры в таблице важны, а какие только мешают?', 'Скоуп', 'later', 'open', 'Сравнение', 'Сравнение оставляем в текущем виде: три школы, таблица параметров с подсветкой различий.', '2026-09-04 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('436433dc-3520-4226-a45e-4280ed7e666c', 'Q-012', 'Нужен ли подбор с участием человека?', 'Многие родители не хотят разбираться сами и готовы, чтобы им подобрали два-три варианта.

Если такая услуга нужна, на сайте появляется отдельный сценарий: анкета подробнее обычной, обработка вашим специалистом, подборка в ответ. Это может быть и платной услугой для родителей — то есть второй источник дохода.

Входит ли это в первую версию?', 'Скоуп', 'later', 'open', 'Главная', 'В первой версии подбора с участием человека нет: родитель ищет сам, форма заявки одна.', '2026-09-04 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('9f447be4-967a-476e-b144-730b6a390f1e', 'Q-013', 'Проходят ли через сервис деньги за обучение?', 'Если родитель платит школе через нас, добавляются: договор с платёжным провайдером, чеки по 54-ФЗ, возвраты, разбирательства по спорным платежам и ответственность за чужие деньги. Это кратно больше работы, чем просто заявка.

Если деньги идут мимо нас, всё это отпадает.', 'Оплаты', 'important', 'open', NULL, 'Деньги за обучение через сервис не проходят. Родитель платит школе напрямую.', '2026-09-02 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('7f03dcd6-e4e7-4a5d-ab16-fe68512fec1f', 'Q-014', 'Как выглядит сайт и есть ли фирменный стиль?', 'Прототип нарисован в нейтральном деловом оформлении: это черновик, а не предложение по дизайну.

Пришлите логотип, цвета и шрифты, если они есть. Если нет — пришлите две-три ссылки на сайты, которые вам нравятся, и скажите, чем именно.

Заодно: как называется сервис? В прототипе стоит «АльтШкола» — это заглушка.', 'Дизайн', 'important', 'open', 'Главная', 'Название и стиль остаются рабочими заглушками. Оформление приводим к фирменному стилю отдельным этапом после запуска.', '2026-09-02 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('737e4d09-593f-414a-861b-6182415c35e7', 'Q-015', 'Нужно ли мобильное приложение?', 'Сайт будет удобно открываться с телефона в любом случае — это часть работы.

Отдельное приложение для магазинов приложений примерно удваивает объём: вторая сборка, публикация, обновления, отдельные проверки. Для сервиса, которым пользуются раз в несколько лет при выборе школы, приложение обычно не нужно.

Подтвердите, что приложения в первой версии не будет.', 'Платформа', 'later', 'open', NULL, 'Мобильного приложения нет. Делаем адаптивный сайт, удобный на телефоне.', '2026-09-06 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('67f7f6dc-2222-4bbe-8044-11b3fdd91056', 'Q-016', 'Что считаем успехом через полгода после запуска?', 'Одна измеримая цифра. Например: «сто заявок в месяц», «пятьдесят платящих школ», «двадцать тысяч посетителей из поиска».

Это нужно не для отчётности, а чтобы правильно выбирать между функциями. Когда придётся решать, что делать раньше — кабинет школы или страницы под поиск, — ответ будет зависеть именно от этой цифры.', 'Продукт', 'important', 'open', NULL, 'Считаем главной метрикой число отправленных заявок и приоритезируем то, что увеличивает их количество.', '2026-08-31 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('5c9bb633-d082-4096-a1f4-35f2a3c7bd2e', 'Q-017', 'Три раздела платформы: что делаем первым и что входит в первый запуск?', 'На звонке прозвучало, что платформа состоит из трёх частей: агрегатор школ, обучающая платформа с кабинетом школы и франчайзинговый раздел с личными кабинетами франшиз.

Это не один проект, а три продукта, каждый размером с то, что мы обсуждали изначально. Делать их одновременно — значит не запустить ничего.

Ответьте, пожалуйста:

1. Какой раздел запускаем первым и почему именно он?
2. Что из остальных двух должно быть в первом запуске хотя бы частично?
3. Что можно честно отложить на второй этап?

Ориентир: агрегатор без школ бесполезен, а школы приходят либо из франшизы, либо из парсинга. Поэтому очерёдность здесь не вопрос вкуса.', 'Скоуп', 'blocker', 'open', NULL, 'Первым делаем агрегатор школ. Кабинет школы и франчайзинговый раздел описываем, но не разрабатываем до его запуска.', '2026-08-27 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('8c618b4d-cc42-40da-a2f0-f0322853563c', 'Q-018', 'Что такое «обучающая платформа»?', 'В конспекте звонка обучающая платформа описана как кабинет школы: лиды, аналитика, редакционная модерация, контент и события школы.

По названию это похоже на систему обучения для детей или педагогов, а по содержанию — на рабочий кабинет школы. Это два совершенно разных продукта.

Уточните: там учатся люди или там работает администрация школы? Если и то и другое — что из этого нужно в первую очередь?', 'Скоуп', 'blocker', 'open', NULL, 'Считаем «обучающую платформу» рабочим кабинетом школы: лиды, аналитика, контент и события. Обучения детей и педагогов в системе нет.', '2026-08-27 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('61be727f-c7b4-46e4-b242-2c4876896999', 'Q-019', 'Кто принимает окончательные решения по продукту?', 'В обсуждении участвуют Altschool Education и команда Андрея Тищенко, и по одному вопросу их позиции уже разошлись: размещать ли на сайте чужие франшизы.

Нам нужен один человек, чьё слово считается окончательным, и его рабочая почта. Это не формальность: когда решения принимают двое, требования начинают противоречить друг другу, и переделка неизбежна.

Если решения принимаются коллегиально — назовите, кто выносит вердикт при расхождении.', 'Процесс', 'blocker', 'open', NULL, 'Считаем принимающим решения того, кто отвечает в этом портале от роли «Заказчик». Его ответы обязательны для обеих сторон.', '2026-08-26 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('e42dc216-907a-48e1-a672-3819f1601094', 'Q-020', 'Парсинг школ: чьи это данные и на каком основании мы их публикуем?', 'Планируется собирать данные о школах с их сайтов и из соцсетей. Технически это несложно, но у парсинга есть правовая сторона, и разбираться с ней нужно до, а не после.

1. Описания и фотографии школ защищены авторским правом. Публикуем их дословно или пересказываем своими словами?
2. Контакты сотрудников — это персональные данные. Публикуем имена и телефоны конкретных людей или только общие контакты школы?
3. Что делаем, если школа потребует убрать свою карточку? Нужен ли механизм «скрыть по требованию»?
4. Кто отвечает за достоверность: если мы опубликуем неверную цену, претензия придёт к нам.

Ответ определяет, нужен ли раздел жалоб и модерации ещё до запуска.', 'Юридическое', 'blocker', 'open', 'Каталог', 'Публикуем только общедоступные контакты школы и собственные краткие описания, без копирования чужих текстов и фотографий. По первому требованию школы карточка скрывается.', '2026-08-29 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('054a7386-4abd-4487-91f8-38df251e4fd4', 'Q-021', 'Обзвон роботом и SMS-приглашения: на каком основании?', 'Обсуждался робот, который сам обзванивает школы голосом, и рассылка приветственных сообщений и SMS.

Оба сценария регулируются законом о рекламе и законом о персональных данных: массовая рассылка без согласия получателя — это штраф, а не риск репутации.

1. Кому звоним и пишем: на общие номера школ или конкретным людям?
2. Откуда берём согласие на такие сообщения?
3. Кто выступает оператором персональных данных — Altschool Education или мы?
4. Обзвон роботом: он представляется как робот? По закону это существенно.

Пока нет ответа, разработку этой части не начинаем — риск слишком велик.', 'Юридическое', 'blocker', 'open', NULL, 'Робот-обзвон и SMS-рассылка в первую версию не входят. Приглашения школам отправляются вручную вашими менеджерами.', '2026-08-29 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('06c7c13f-cdef-4bbb-a8c3-d9bfa050b61c', 'Q-022', 'Что синхронизируем с Альфа-ЦРМ и что за сервис для звонков?', 'Прозвучало, что доступ к Альфа-ЦРМ будет только у Altschool Education, а франшизы интегрируются с ней для статистики.

Чтобы это спроектировать, нужны детали:

1. Что передаём в CRM: заявки, лиды, статусы, оплаты?
2. В какую сторону идут данные — только мы в CRM, или CRM тоже отдаёт нам?
3. У каждой франшизы свой аккаунт в CRM или один общий?
4. Кто даёт нам доступ к API и когда?

Отдельно: в конспекте звонка есть фраза «интеграция с Альфа-ЦРМ и Японией для отслеживания звонков». «Япония» — почти наверняка ошибка расшифровки. Подскажите, какой сервис коллтрекинга имелся в виду: угадывать мы не будем.', 'Интеграции', 'blocker', 'open', NULL, 'В первую версию интеграции с CRM нет: заявки приходят на почту и в админку. Коллтрекинг не подключаем.', '2026-08-31 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('31ffa0b1-9810-4fbc-9eb0-6e551ec0cbb9', 'Q-023', 'Франчайзинговый раздел: что именно в нём делаем?', 'Описание из звонка: большой продающий лендинг со списком всех франшиз Альтскула, информация о том, кто и где открылся, экономические расчёты для предпринимателей и личный кабинет у каждой франшизы.

Это три разные по объёму вещи. Лендинг со списком — неделя работы. Калькулятор окупаемости с реальными цифрами — отдельная задача, где сложность не в коде, а в модели расчёта. Личные кабинеты франшиз со статистикой из CRM — самая большая часть.

Что из этого нужно в первую очередь и есть ли у вас готовая модель расчёта окупаемости?', 'Скоуп', 'important', 'open', NULL, 'Делаем лендинг со списком франшиз и картой открытых школ. Калькулятор и личные кабинеты франшиз — следующий этап.', '2026-09-02 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('80004edd-3a0d-4039-86f8-7d3ff5ea872b', 'Q-024', 'Что такое «уровни» и «история квалификации» школы?', 'В описании агрегатора упомянуты уровни школ и история квалификации. Мы не поняли, что за этим стоит, а догадываться здесь опасно: если это система сертификации внутри сообщества, она затрагивает и карточку школы, и фильтры, и права на изменение данных.

1. Кто присваивает уровень и по каким критериям?
2. Виден ли уровень родителям или это внутренняя история?
3. Может ли уровень понижаться и что тогда происходит с карточкой?

Если можно, пришлите текущее описание уровней — даже черновое.', 'Продукт', 'important', 'open', 'Карточка школы', 'Уровни и квалификацию в первую версию не включаем: все школы в каталоге равны.', '2026-09-02 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('0117685b-2222-41c5-852b-ce98f7a554fb', 'Q-025', 'Нужна ли карта школ и что на ней видно?', 'Карта была названа среди частей агрегатора, в нашем прототипе её нет.

Карта полезна, когда школ в городе много и важна дорога от дома. Для тридцати школ по всей России она украшение, ради которого придётся подключать платный картографический сервис и заполнять координаты у каждой школы.

Нужна ли карта в первой версии, или достаточно указания района и метро? Если нужна — это карта по всей стране или в пределах города?', 'Поиск', 'important', 'open', 'Каталог', 'Карты в первой версии нет. В карточке указываем город, район и ближайшее метро.', '2026-09-04 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('14f2eca7-1173-4a3b-a3ec-f5a06e66f791', 'Q-026', 'Размещаем ли на сайте чужие школы и чужие франшизы?', 'На звонке позиции разошлись: Altschool не хочет заниматься продвижением чужих франшиз, поскольку это отдельный бизнес, а Андрей Тищенко предложил размещать информацию о франшизах партнёров.

Это фундаментальный вопрос, а не деталь оформления. От него зависит, что вообще за продукт:

1. Только школы Altschool — это витрина собственной сети.
2. Все школы развивающего обучения — это агрегатор, и тогда нужны правила: кого пускаем, кто платит, как показываем своих на фоне чужих.

Во втором случае неизбежно возникает вопрос честности выдачи: если свои школы стоят выше просто потому, что свои, родители это заметят.

Нужен один ответ от лица заказчика.', 'Скоуп', 'blocker', 'open', 'Каталог', 'Каталог открыт для всех школ развивающего обучения. Школы Altschool помечаются как проверенные, но не поднимаются в выдаче искусственно.', '2026-08-28 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');
INSERT INTO public.questions VALUES ('e1612ebe-3d31-465c-87f5-d6510aa45d9a', 'Q-027', 'Конференция на Алтае 4 октября — это срок для чего-то?', 'Из конспекта: Altschool пригласила команду на конференцию в Менторском доме на Алтае 4 октября, там планируется обсуждение интеграции с CRM.

Это единственная названная дата. Уточните, значит ли она что-то для нас:

1. Нужно ли что-то показать к этому дню — прототип, демонстрацию, работающую часть?
2. Если да, то кому и в каком виде?
3. Или это просто встреча, к которой ничего готовить не нужно?

Если дата является рубежом, планировать работу нужно от неё, а не от объёма.', 'Процесс', 'important', 'open', NULL, 'Считаем 4 октября обычной встречей без обязательств показать готовый продукт. Планируем работу от объёма.', '2026-08-27 22:56:14.238+00', '2026-08-23 22:56:14.244507+00', '2026-08-23 22:56:14.244507+00');


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
-- Name: questions_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_priority_idx ON public.questions USING btree (priority);


--
-- Name: questions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX questions_status_idx ON public.questions USING btree (status);


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
-- Name: answers answers_question_id_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_question_id_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE RESTRICT;


--
-- Name: comments comments_question_id_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_question_id_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--



-- Восстанавливаем search_path: pg_dump обнуляет его в начале файла.
SELECT pg_catalog.set_config('search_path', 'public', false);
