import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { bountyService } from '../services/bounties/bountyService';
import type { CompanyBountyFilters } from '../services/bounties/bountyService';

export interface Bounty {
  id: string;
  title: string;
  description: string;
  bountyBTC: number;
  category: string;
  difficulty: string;
  company: string;
  deadline: string;
}

const getCompanyBounties = async (
  uid: string | undefined,
  user: { success: boolean } | null,
  filters: CompanyBountyFilters,
): Promise<Bounty[]> => {
  if (!user?.success) throw new Error('User not authenticated');

  const response = await bountyService.getBountiesByCompanyID(
    uid as string,
    filters,
  );

  if (response.success && response.bounties) {
    return response.bounties.map((bounty: any) => ({
      id: bounty.id,
      title: bounty.title,
      description: bounty.description || '',
      bountyBTC: bounty.bountyBTC || 0.001,
      category: bounty.category || '',
      difficulty: bounty.difficulty || '',
      company: bounty.companyName || '',
      deadline: bounty.deadline || '',
    }));
  }

  throw new Error(response.error || 'Failed to load bounties');
};

export function useGetCompanyBounties(
  uid: string | undefined,
  user: { success: boolean } | null,
  filters: CompanyBountyFilters,
) {
  return useQuery<Bounty[], Error>({
    queryKey: ['companyBounties', uid, filters],
    queryFn: () => getCompanyBounties(uid, user, filters),
    enabled: !!uid && !!user,
    placeholderData: keepPreviousData,
  });
}
