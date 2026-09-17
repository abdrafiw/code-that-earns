import type { ReactNode } from 'react';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AuthContentPanel } from './AuthContentPanel';

type AuthPageLayoutProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
};

export function AuthPageLayout({
  eyebrow,
  title,
  description,
  children,
  wide = false,
}: AuthPageLayoutProps) {
  return (
    <div className="auth-page min-h-screen bg-slate-50 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <AuthBrandPanel />
      <AuthContentPanel
        eyebrow={eyebrow}
        title={title}
        description={description}
        wide={wide}
      >
        {children}
      </AuthContentPanel>
    </div>
  );
}
