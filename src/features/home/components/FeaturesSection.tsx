import { Award, Code2, Send } from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Challenges with real scope',
    description:
      'Browse focused engineering problems with clear requirements, rewards, and deadlines.',
  },
  {
    icon: Send,
    title: 'Submit your work',
    description:
      'Share a supported repository or design project link for the organization to review.',
  },
  {
    icon: Award,
    title: 'Earn recognition and rewards',
    description:
      'Win a challenge and receive recognition or an optional reward directly from the organization.',
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-indigo-500">
          Everything you need
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
          From challenge to outcome, without the noise.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          A focused workflow keeps organizations and developers aligned from the
          first line of the brief to the final submission.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)]"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-6 text-lg font-semibold text-slate-950">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
