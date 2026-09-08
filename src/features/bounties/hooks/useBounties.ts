import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bountyService } from '../../../services/bounties/bountyService';
import type { CreateBountyPayload, TBounty } from '../types';
import { transformBounty } from '../utils/transformBounty';

async function getBounty() {
  const response = await bountyService.getAllBounties();

  if (!response.success) {
    throw new Error(response.error);
  }

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
  const response = await bountyService.createBounty(payload);

  if (!response.success) {
    throw new Error(response.error || 'Something went wrong');
  }
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
