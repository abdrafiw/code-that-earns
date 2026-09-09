import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bountyService } from '../../../services/bounties/bountyService';
import type { CreateBountyPayload, TBounty } from '../types';
import { transformBounty } from '../utils/transformBounty';

async function getBounty() {
  const response = await bountyService.getAllBounties();
  const bounties = response.bounties as TBounty[];

  return bounties?.map(transformBounty);
}

export function useGetBounty() {
  return useQuery({
    queryKey: ['bounties'],
    queryFn: getBounty,
  });
}

async function createBounty(payload: CreateBountyPayload) {
  return bountyService.createBounty(payload);
}

export function useCreateBounty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBounty,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bounties'] });
    },
  });
}
