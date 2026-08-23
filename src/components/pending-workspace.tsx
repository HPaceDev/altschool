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
}: {
  title: string;
  lead: string;
  screens: Screen[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-medium tracking-[0.14em] text-ink-faint uppercase">
        Область в проработке
      </p>
      <h1 className="display mt-3 text-2xl text-ink sm:text-3xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">{lead}</p>

      <h2 className="mt-10 border-b border-line pb-3 text-sm font-semibold tracking-wide text-ink-faint uppercase">
        Что здесь появится
      </h2>

      <ul className="mt-5 space-y-4">
        {screens.map((screen) => (
          <li key={screen.name} className="rounded-xl border border-line bg-surface-raised p-5">
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

      <div className="mt-8 rounded-xl border border-line bg-surface-sunken p-5">
        <p className="text-sm leading-relaxed text-ink-muted">
          Ответьте на перечисленные вопросы — и мы нарисуем эти экраны в следующей
          версии прототипа. До тех пор любой макет здесь был бы нашей догадкой,
          которую пришлось бы переделывать.
        </p>
        <Link
          href="/questions"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Открыть вопросы
        </Link>
      </div>
    </div>
  );
}
