import { Building2, Code } from 'lucide-react';
import { useAppContext } from '../../../hooks/useAppContext';

export const RoleIndicator = () => {
  const { user } = useAppContext();

  if (!user?.success) return null;

  const userRole = user.user.role;
  const isCompany = userRole === 'COMPANY';
  const isDeveloper = userRole === 'DEVELOPER';

  if (!isCompany && !isDeveloper) return null;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset ${
        isCompany
          ? 'bg-violet-50 text-violet-700 ring-violet-200'
          : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      }`}
    >
      {isCompany ? (
        <Building2 className="size-3.5" aria-hidden="true" />
      ) : (
        <Code className="size-3.5" aria-hidden="true" />
      )}
      <span>{isCompany ? 'Company' : 'Developer'}</span>
    </div>
  );
};
