import {
  ArrowLeftRight,
  BriefcaseBusiness,
  ClipboardCheck,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../../hooks/useAppContext';

interface NavigationLinksProps {
  mobile?: boolean;
  onLinkClick?: () => void;
}

export const NavigationLinks = ({
  mobile = false,
  onLinkClick = () => {},
}: NavigationLinksProps) => {
  const { user } = useAppContext();
  const location = useLocation();

  const userRole = user?.success ? user.user.role : null;
  const isCompany = userRole === 'COMPANY';

  const pathname = location.pathname;
  const isCompanyBounties = pathname === '/company-bounties';
  const isDevBounties = pathname === '/dev-bounties';
  const isSubmissions = pathname === '/submissions';
  const isCompanySubmissions = pathname === '/company-submissions';
  const isTransactions = pathname === '/transactions';

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
      mobile ? 'w-full px-3 py-3' : 'px-3 py-2'
    } ${
      active
        ? 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200/60 shadow-sm'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
    }`;

  return (
    <ul className={`flex ${mobile ? 'flex-col gap-1' : 'items-center gap-2'}`}>
      {isCompany ? (
        <li>
          <Link
            to="/company-bounties"
            onClick={onLinkClick}
            aria-current={isCompanyBounties ? 'page' : undefined}
            className={linkClass(isCompanyBounties)}
          >
            <BriefcaseBusiness className="size-4" />
            Bounties
          </Link>
        </li>
      ) : (
        <li>
          <Link
            to="/dev-bounties"
            onClick={onLinkClick}
            aria-current={isDevBounties ? 'page' : undefined}
            className={linkClass(isDevBounties)}
          >
            <BriefcaseBusiness className="size-4" />
            Bounties
          </Link>
        </li>
      )}

      <li>
        <Link
          to={userRole == 'DEVELOPER' ? '/submissions' : '/company-submissions'}
          onClick={onLinkClick}
          aria-current={
            isSubmissions || isCompanySubmissions ? 'page' : undefined
          }
          className={linkClass(isSubmissions || isCompanySubmissions)}
        >
          <ClipboardCheck className="size-4" />
          Submissions
        </Link>
      </li>

      <li>
        <Link
          to="/transactions"
          onClick={onLinkClick}
          aria-current={isTransactions ? 'page' : undefined}
          className={linkClass(isTransactions)}
        >
          <ArrowLeftRight className="size-4" />
          Transactions
        </Link>
      </li>
    </ul>
  );
};
