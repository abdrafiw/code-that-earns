import { ArrowRight, ShieldCheck, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  'Choose a challenge that fits your skills',
  'Build and submit your project',
  'See the results and receive the published outcome',
];

export function HowItWorksSection() {
  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
        <div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <Trophy aria-hidden="true" className="size-6" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Your next win starts with one challenge.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            Join a community where strong code gets noticed and useful work gets
            rewarded.
          </p>
          <Link
            to="/sign-up"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
          >
            Create your account
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
          <div className="flex items-center gap-3">
            <Users aria-hidden="true" className="size-5 text-indigo-400" />
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
            <ShieldCheck
              aria-hidden="true"
              className="size-4 text-emerald-400"
            />
            <p>Built around clear roles and transparent submissions</p>
          </div>
        </div>
      </div>
    </section>
  );
}
