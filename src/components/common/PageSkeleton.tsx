import type { ReactNode } from 'react';
import { Skeleton } from '../ui/skeleton';

export type PageSkeletonVariant =
  | 'company-challenges'
  | 'dev-challenges'
  | 'company-submissions'
  | 'submissions'
  | 'solution'
  | 'login'
  | 'signup'
  | 'home';
const rows = [0, 1, 2];

function Heading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-9 w-64 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
}

function Filters() {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <Skeleton className="h-10 min-w-40 flex-1" />
      <Skeleton className="h-10 w-44" />
      <Skeleton className="h-10 w-44" />
    </div>
  );
}

function Metrics() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {rows.map((i) => (
        <div
          key={i}
          className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"
        >
          <Skeleton className="h-5 w-36 max-w-full" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-3 w-32 max-w-full" />
        </div>
      ))}
    </div>
  );
}

function Table({ columns }: { columns: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <div className="min-w-180" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className={
                'grid gap-5 border-b border-gray-100 px-5 ' +
                (row === 0 ? 'bg-gray-50 py-4' : 'py-6')
              }
              style={{ gridTemplateColumns: `2fr repeat(${columns - 1}, 1fr)` }}
            >
              {Array.from({ length: columns }, (_, col) => (
                <div key={col} className="space-y-2">
                  <Skeleton className={row === 0 ? 'h-3 w-20' : 'h-4 w-full'} />
                  {row > 0 && col === 0 && <Skeleton className="h-3 w-2/3" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Fields({ count }: { count: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function LoadingRegion({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">Loading page content…</span>
      <div aria-hidden="true" className="w-full">
        {children}
      </div>
    </div>
  );
}

export function PageSkeleton({ variant }: { variant: PageSkeletonVariant }) {
  if (variant === 'login' || variant === 'signup')
    return (
      <LoadingRegion className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden min-h-screen bg-slate-950 px-14 py-12 lg:flex lg:flex-col lg:justify-between">
          <Skeleton className="h-10 w-52 bg-slate-700" />
          <div className="space-y-5">
            <Skeleton className="h-4 w-36 bg-slate-700" />
            <Skeleton className="h-12 w-full bg-slate-700" />
            <Skeleton className="h-12 w-4/5 bg-slate-700" />
            <Skeleton className="h-20 w-full bg-slate-800" />
          </div>
          <Skeleton className="h-5 w-72 bg-slate-800" />
        </div>
        <div className="flex min-h-screen items-center justify-center px-5 py-12">
          <div className="w-full max-w-md">
            <Skeleton className="mb-8 h-5 w-28" />
            <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8">
              <Heading />
              <Fields count={variant === 'signup' ? 5 : 2} />
            </div>
          </div>
        </div>
      </LoadingRegion>
    );

  if (variant === 'company-submissions' || variant === 'submissions')
    return (
      <LoadingRegion className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Skeleton className="mb-4 h-8 w-64" />
        {rows.map((i) => (
          <div
            key={i}
            className="mb-4 space-y-4 rounded-lg border border-gray-200 bg-white p-6"
          >
            <div className="flex justify-between gap-6">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-1/3" />
            {variant === 'company-submissions' && (
              <Skeleton className="h-5 w-1/2" />
            )}
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-2/3" />
            {variant === 'company-submissions' && (
              <div className="border-t pt-4">
                <Skeleton className="h-4 w-full" />
              </div>
            )}
          </div>
        ))}
      </LoadingRegion>
    );

  if (variant === 'solution')
    return (
      <LoadingRegion className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Skeleton className="h-8 w-40" />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="space-y-5 border-b border-gray-100 p-6 sm:p-8">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-4/5" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-8 p-6 sm:p-8">
              <div className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
          <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Fields count={2} />
          </div>
        </div>
      </LoadingRegion>
    );

  if (variant === 'home')
    return (
      <LoadingRegion className="px-4 py-10 text-center lg:py-20">
        <div className="mx-auto max-w-3xl space-y-8">
          <Skeleton className="mx-auto size-16" />
          <Skeleton className="mx-auto h-14 w-full" />
          <Skeleton className="mx-auto h-16 w-5/6" />
          <div className="flex justify-center gap-6">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-48" />
          </div>
          <div className="grid gap-8 pt-16 md:grid-cols-3">
            {rows.map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="mx-auto size-12" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </LoadingRegion>
    );

  if (variant === 'dev-challenges')
    return (
      <LoadingRegion className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="space-y-2 border-b border-gray-200 pb-8">
          <Skeleton className="h-9 w-80 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <Skeleton className="h-4 w-28" />
          </div>
          <Filters />

          <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="space-y-3 p-5 pb-0">
                  <div className="flex justify-between gap-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-2/3" />
                </div>
                <div className="space-y-3 p-5 pt-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                  <div className="flex justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2.5">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                  <Skeleton className="h-3 w-36" />
                </div>
                <div className="border-t border-gray-100 p-4">
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </LoadingRegion>
    );

  return (
    <LoadingRegion className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-wrap justify-between gap-4 border-b border-gray-200 pb-8">
        <Heading />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-6 py-8">
        <Metrics />
        <Skeleton className="h-7 w-40" />
        <Filters />
        <Table columns={5} />
      </div>
    </LoadingRegion>
  );
}

export function getPageSkeletonVariant(pathname: string): PageSkeletonVariant {
  const path = pathname.replace(/\/$/, '');
  if (path.startsWith('/challenges/') || path.startsWith('/submit/'))
    return 'solution';
  if (path === '/login') return 'login';
  if (path === '/sign-up') return 'signup';
  const pages: Record<string, PageSkeletonVariant> = {
    '/challenges': 'dev-challenges',
    '/company-challenges': 'company-challenges',
    '/dev-challenges': 'dev-challenges',
    '/company-submissions': 'company-submissions',
    '/submissions': 'submissions',
  };
  return pages[path] || 'home';
}

export function AppSkeleton({ pathname }: { pathname: string }) {
  const variant = getPageSkeletonVariant(pathname);
  if (variant === 'login' || variant === 'signup')
    return <PageSkeleton variant={variant} />;
  return (
    <div className="dashboard-shell min-h-screen bg-gray-50">
      <div
        aria-hidden="true"
        className="flex h-16 items-center justify-between border-b bg-white px-6"
      >
        <Skeleton className="h-9 w-48" />
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside
          aria-hidden="true"
          className="hidden w-60 shrink-0 border-r bg-white p-5 lg:flex lg:flex-col"
        >
          <div className="space-y-3">
            {rows.map((i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
          <Skeleton className="mt-auto size-9" />
        </aside>
        <div className="dashboard-content min-w-0 flex-1">
          <PageSkeleton variant={variant} />
        </div>
      </div>
    </div>
  );
}
