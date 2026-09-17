import type { ReactNode } from 'react';
import { ArrowLeft, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthContentPanelProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
};

export function AuthContentPanel({
  eyebrow,
  title,
  description,
  children,
  wide = false,
}: AuthContentPanelProps) {
  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
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
              <p className="text-sm font-semibold text-indigo-500">{eyebrow}</p>
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
    </section>
  );
}
