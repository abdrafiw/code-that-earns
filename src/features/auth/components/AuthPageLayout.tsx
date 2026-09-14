import type { ReactNode } from 'react';
import { ArrowLeft, Award, Check, Code2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthPageLayoutProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
};

const benefits = [
  'Clear coding challenges',
  'GitHub-based submissions',
  'Transparent challenge outcomes',
];

export function AuthPageLayout({
  eyebrow,
  title,
  description,
  children,
  wide = false,
}: AuthPageLayoutProps) {
  return (
    <section className="auth-page min-h-screen bg-slate-50 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-14 lg:py-12">
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
            <span>CTE</span>
            <span className="ml-2 font-normal text-slate-400">
              Code That Earns
            </span>
          </p>
        </Link>

        <div className="relative max-w-lg space-y-6 lg:my-auto">
          <p className="text-sm font-semibold text-indigo-400">
            Build. Submit. Earn.
          </p>

          <h2 className="text-4xl leading-tight font-semibold tracking-[-0.04em] sm:text-5xl">
            Great code should open real opportunities.
          </h2>

          <p className="max-w-md text-base leading-7 text-slate-300">
            Join companies and developers working together through focused
            challenges and transparent rewards.
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

        <div className="relative hidden items-center gap-4 border-t border-white/10 text-xs text-slate-400 lg:flex">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck
              aria-hidden="true"
              className="size-4 text-emerald-400"
            />
            Secure Firebase authentication
          </span>
          <span className="inline-flex items-center gap-2">
            <Award aria-hidden="true" className="size-4 text-emerald-400" />
            Recognition and rewards
          </span>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div className={`w-full space-y-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
          <nav className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to home
            </Link>

            <Link
              to="/"
              aria-label="CTE home"
              className="inline-flex items-center gap-2 font-semibold text-slate-950 lg:hidden"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
                <Code2 aria-hidden="true" className="size-4" />
              </span>
              CTE
            </Link>
          </nav>

          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-8 sm:shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            <header className="space-y-2">
              {eyebrow && (
                <p className="text-sm font-semibold text-indigo-500">
                  {eyebrow}
                </p>
              )}

              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                {title}
              </h1>

              <p className="text-sm leading-5 text-slate-500 sm:leading-6">
                {description}
              </p>
            </header>

            <>{children}</>
          </div>

          <p className="hidden text-center text-xs leading-5 text-slate-400 sm:block">
            By continuing, you agree to use CTE responsibly and submit work you
            are authorized to share.
          </p>
        </div>
      </div>
    </section>
  );
}
