import { FileCheck2, SquareKanban } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../../hooks/useAppContext';

interface NavigationLinksProps {
  mobile?: boolean;
  collapsed?: boolean;
  onLinkClick?: () => void;
}

export const NavigationLinks = ({
  mobile = false,
  collapsed = false,
  onLinkClick = () => {},
}: NavigationLinksProps) => {
  const { user } = useAppContext();
  const location = useLocation();

  const userRole = user?.success ? user.user.role : null;
  const pathname = location.pathname;
  const isChallenges = pathname.startsWith('/challenges');
  const isSubmissions = pathname === '/submissions';
  const isCompanySubmissions = pathname === '/company-submissions';

  const linkClass = (active: boolean) =>
    `flex w-full items-center gap-3.5 text-[15px] transition-colors ${
      mobile
        ? `min-h-12 rounded-xl px-4 py-3 ${
            active
              ? 'bg-indigo-50 font-semibold text-indigo-700 ring-1 ring-indigo-100 ring-inset'
              : 'font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-950'
          }`
        : `rounded-lg py-2.5 ${collapsed ? 'justify-center px-2' : 'px-3'} ${
            active
              ? 'bg-indigo-500 font-semibold text-white'
              : 'font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-950'
          }`
    }`;

  return (
    <ul className={`flex flex-col ${mobile ? 'gap-2' : 'gap-1'}`}>
      <li>
        <Link
          to="/challenges"
          onClick={onLinkClick}
          aria-current={isChallenges ? 'page' : undefined}
          className={linkClass(isChallenges)}
          title={collapsed ? 'Challenges' : undefined}
        >
          <SquareKanban className="size-5 shrink-0" strokeWidth={1.8} />
          {!collapsed && <span>Challenges</span>}
        </Link>
      </li>

      <li>
        <Link
          to={
            userRole === 'DEVELOPER' ? '/submissions' : '/company-submissions'
          }
          onClick={onLinkClick}
          aria-current={
            isSubmissions || isCompanySubmissions ? 'page' : undefined
          }
          className={linkClass(isSubmissions || isCompanySubmissions)}
          title={collapsed ? 'Submissions' : undefined}
        >
          <FileCheck2 className="size-5 shrink-0" strokeWidth={1.8} />
          {!collapsed && <span>Submissions</span>}
        </Link>
      </li>
    </ul>
  );
};
