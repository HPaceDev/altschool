import Link from "next/link";

type Screen = {
  name: string;
  text: string;
  /** Код вопроса, от ответа на который зависит этот экран. */
  question: string;
};

/**
 * Область, которую рано рисовать.
 *
 * Показывать пустую страницу «в разработке» бессмысленно. Вместо этого
 * перечисляем будущие экраны и прямо называем вопрос, который каждый из них
 * блокирует: так заказчик видит цену собственного молчания.
 */
export function PendingWorkspace({
  title,
  lead,
  screens,
  done,
}: {
  title: string;
  lead: string;
  screens: Screen[];
  /** Экраны этой области, которые уже нарисованы. */
  done?: { name: string; href: string }[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="kicker">Область в проработке</p>
      <h1 className="display mt-3 text-3xl text-ink sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">{lead}</p>

      {done?.length ? (
        <section className="mt-8">
          <h2 className="border-b border-line pb-3 text-sm font-semibold tracking-wide text-ink-faint uppercase">
            Уже готово
          </h2>
          <ul className="mt-4 space-y-2">
            {done.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-accent-line bg-accent-soft px-5 py-3.5 transition-colors hover:border-accent"
                >
                  <span className="text-sm font-medium text-done">{item.name}</span>
                  <span aria-hidden className="text-done">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <h2 className="mt-10 border-b border-line pb-3 text-sm font-semibold tracking-wide text-ink-faint uppercase">
        Что здесь появится
      </h2>

      <ul className="mt-5 space-y-4">
        {screens.map((screen) => (
          <li key={screen.name} className="rounded-2xl border border-line bg-surface-raised p-6">
            <h3 className="display text-base text-ink">{screen.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{screen.text}</p>
            <Link
              href={`/questions/${screen.question}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text underline underline-offset-2"
            >
              Зависит от вопроса {screen.question}
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-line bg-surface-sunken p-6">
        <p className="text-sm leading-relaxed text-ink-muted">
          Ответьте на перечисленные вопросы — и мы нарисуем эти экраны в следующей
          версии прототипа. До тех пор любой макет здесь был бы нашей догадкой,
          которую пришлось бы переделывать.
        </p>
        <Link
          href="/questions"
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Открыть вопросы
        </Link>
      </div>
    </div>
  );
}
