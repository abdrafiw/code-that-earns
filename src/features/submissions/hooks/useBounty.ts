import { useParams } from 'react-router-dom';
import { bountyService } from '../../../services/bounties/bountyService';
import { useQuery } from '@tanstack/react-query';
import { transformBounty } from '../../bounties/utils/transformBounty';
import { bountyKeys } from '../../bounties/queryKeys';

const getBountyByID = async (bountyID: string) => {
  const result = await bountyService.getBountyByID(bountyID);
  return transformBounty(result.bounty);
};

export const useGetBountyByID = () => {
  const { bountyId } = useParams();

  return useQuery({
    queryKey: bountyKeys.detail(bountyId),
    queryFn: () => getBountyByID(bountyId!),
    enabled: Boolean(bountyId),
  });
};
