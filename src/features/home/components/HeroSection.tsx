import { ArrowRight, Award, Check, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const trustSignals = [
  'Clear requirements',
  'Project-link submissions',
  'Clear outcomes',
];

const interestedDevelopers = ['AM', 'JD', 'SK'];

export function HeroSection() {
  return (
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
              Earn real recognition.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            CTE connects skilled developers with organizations that need ideas
            shipped. Pick a challenge, submit your solution, and get rewarded
            for excellent work.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/sign-up"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-md"
            >
              Start building
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Browse challenges
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500">
            {trustSignals.map((signal) => (
              <span key={signal} className="inline-flex items-center gap-2">
                <Check aria-hidden="true" className="size-4 text-emerald-600" />
                {signal}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
          <div
            aria-hidden="true"
            className="absolute -top-5 -left-5 size-20 rounded-2xl bg-indigo-500"
          />
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div aria-hidden="true" className="flex items-center gap-2">
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
                <div className="">
                  <span className="text-xs font-semibold tracking-wider text-indigo-500 uppercase">
                    Frontend · Intermediate
                  </span>
                  <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-slate-950">
                    Build an analytics dashboard for an open-source API
                  </h2>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                  <Code2 aria-hidden="true" className="size-5" />
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
                    <Award
                      aria-hidden="true"
                      className="size-5 text-emerald-500"
                    />
                    $250.00
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
                <div className="flex -space-x-2" aria-hidden="true">
                  {interestedDevelopers.map((initials, index) => (
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
  );
}
