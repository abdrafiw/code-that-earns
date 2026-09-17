import { Award, Check, Code2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  'Clear coding and design challenges',
  'Project-link submissions',
  'Transparent challenge outcomes',
];

export function AuthBrandPanel() {
  return (
    <section className="relative hidden overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-14 lg:py-12">
      <div
        aria-hidden="true"
        className="absolute -right-16 -bottom-20 size-64 rounded-full border-38 border-indigo-500/10"
      />

      <Link
        to="/"
        className="relative inline-flex items-center gap-3 text-base font-semibold"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500">
          <Code2 aria-hidden="true" className="size-5" />
        </span>

        <p className="">
          <span className="">CTE</span>
          <span className="ml-2 font-normal text-slate-400">
            Code That Earns
          </span>
        </p>
      </Link>

      <div className="relative max-w-lg space-y-6 lg:my-auto">
        <h2 className="text-4xl leading-tight font-semibold tracking-[-0.04em] sm:text-5xl">
          Great work should open real opportunities.
        </h2>

        <p className="max-w-md text-base leading-7 text-slate-300">
          Join developers, designers, and organizations working together through
          focused challenges and transparent rewards.
        </p>

        <ul className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3 lg:grid-cols-1">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                <Check aria-hidden="true" className="size-3.5" />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative hidden flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-6 text-xs text-slate-400 lg:flex">
        <p className="flex items-center gap-2">
          <Users aria-hidden="true" className="size-4 text-emerald-400" />
          <span>Built for developers, designers, and organizations</span>
        </p>

        <p className="flex items-center gap-2">
          <Award aria-hidden="true" className="size-4 text-emerald-400" />
          <span>Recognition and rewards</span>
        </p>
      </div>
    </section>
  );
}
