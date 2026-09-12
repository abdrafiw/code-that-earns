import {
  ArrowRight,
  Bitcoin,
  Check,
  Code2,
  Github,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAppContext } from '../../../hooks/useAppContext';

const features = [
  {
    icon: Code2,
    title: 'Challenges with real scope',
    description:
      'Browse focused engineering problems with clear requirements, rewards, and deadlines.',
  },
  {
    icon: Github,
    title: 'Submit from GitHub',
    description:
      'Share your repository directly. Your code stays easy to review and simple to verify.',
  },
  {
    icon: Bitcoin,
    title: 'Earn in Bitcoin',
    description:
      'Win a challenge and receive the published BTC reward at your submitted address.',
  },
];

const steps = [
  'Choose a challenge that fits your skills',
  'Build and submit your GitHub repository',
  'Get selected and receive the challenge',
];

export const HomePage = () => {
  const { user } = useAppContext();

  if (user?.success) {
    return <Navigate to="/challenges" replace />;
  }

  return (
    <main className="landing-page min-h-[calc(100dvh-4rem)] bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200/80">
        <div
          aria-hidden="true"
          className="absolute top-16 right-[7%] size-52 rounded-full border border-indigo-200 bg-indigo-50"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 left-[38%] size-44 rounded-full bg-amber-100/70"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="text-5xl leading-[1.02] font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
              Solve real problems.
              <span className="mt-1 block text-indigo-500">
                Earn real Bitcoin.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              CTE connects skilled developers with companies that need ideas
              shipped. Pick a challenge, submit your solution, and get rewarded
              for excellent work.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/sign-up"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-md"
              >
                Start building
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Browse challenges
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                Clear requirements
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                GitHub submissions
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                BTC rewards
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -top-5 -left-5 size-20 rounded-2xl bg-indigo-500"
            />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-rose-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Open challenge
                </span>
              </div>

              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-indigo-500 uppercase">
                      Frontend · Intermediate
                    </span>
                    <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-slate-950">
                      Build an analytics dashboard for an open-source API
                    </h2>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                    <Code2 className="size-5" />
                  </span>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-500">
                  Create a responsive dashboard with authentication, charts,
                  filters, and a documented component system.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                      Reward
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Bitcoin className="size-5 text-emerald-500" />
                      0.025 BTC
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                      Deadline
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      14 days
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <div className="flex -space-x-2">
                    {['AM', 'JD', 'SK'].map((initials, index) => (
                      <span
                        key={initials}
                        className={
                          'flex size-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold ' +
                          (index === 0
                            ? 'bg-slate-900 text-white'
                            : index === 1
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-emerald-100 text-emerald-700')
                        }
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    12 developers interested
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-10">
          {[
            ['For developers', 'Turn your engineering skills into earnings'],
            ['For companies', 'Get focused solutions from capable builders'],
            ['Built for trust', 'Clear challenges and transparent outcomes'],
          ].map(([title, text]) => (
            <div key={title} className="px-5 py-7 first:pl-0 last:pr-0">
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-indigo-500">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            From challenge to payout, without the noise.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            A focused workflow keeps companies and developers aligned from the
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
                <Icon className="size-5" />
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

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-500 text-white">
              <Trophy className="size-6" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Your next win starts with one challenge.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
              Join a community where strong code gets noticed and useful work
              gets rewarded.
            </p>
            <Link
              to="/sign-up"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
            >
              Create your account <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-indigo-400" />
              <p className="font-semibold">How it works</p>
            </div>
            <ol className="mt-6 space-y-5">
              {steps.map((step, index) => (
                <li key={step} className="flex items-center gap-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-indigo-300">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-300">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-7 flex items-center gap-2 border-t border-white/10 pt-6 text-xs text-slate-400">
              <ShieldCheck className="size-4 text-emerald-400" />
              Built around clear roles and transparent submissions
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
