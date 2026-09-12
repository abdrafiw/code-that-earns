import { FileCheck2, ReceiptText, SquareKanban } from 'lucide-react';
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
  const pathname = location.pathname;
  const isChallenges = pathname.startsWith('/challenges');
  const isSubmissions = pathname === '/submissions';
  const isCompanySubmissions = pathname === '/company-submissions';
  const isTransactions = pathname === '/transactions';

  const linkClass = (active: boolean) =>
    `flex w-full items-center gap-3.5 text-[15px] transition-colors ${
      mobile
        ? `min-h-12 rounded-xl px-4 py-3 ${
            active
              ? 'bg-indigo-50 font-semibold text-indigo-700 ring-1 ring-indigo-100 ring-inset'
              : 'font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-950'
          }`
        : `rounded-lg px-3 py-2.5 ${
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
        >
          <SquareKanban className="size-5" strokeWidth={1.8} />
          Challenges
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
        >
          <FileCheck2 className="size-5" strokeWidth={1.8} />
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
          <ReceiptText className="size-5" strokeWidth={1.8} />
          Transactions
        </Link>
      </li>
    </ul>
  );
};
