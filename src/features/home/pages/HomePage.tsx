import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../../hooks/useAppContext';
import { AudienceSection } from '../components/AudienceSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { HeroSection } from '../components/HeroSection';
import { HowItWorksSection } from '../components/HowItWorksSection';

export const HomePage = () => {
  const { user } = useAppContext();

  if (user?.success) return <Navigate to="/challenges" replace />;

  return (
    <main className="landing-page min-h-[calc(100dvh-4rem)] bg-slate-50 text-slate-950">
      <HeroSection />
      <AudienceSection />
      <FeaturesSection />
      <HowItWorksSection />
    </main>
  );
};
