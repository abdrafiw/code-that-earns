import { useParams } from 'react-router-dom';
import { challengeService } from '../../../services/challenges/challengeService';
import { useQuery } from '@tanstack/react-query';
import { transformChallenge } from '../../challenges/utils/transformChallenge';
import { challengeKeys } from '../../challenges/queryKeys';

const getChallengeByID = async (challengeID: string) => {
  const result = await challengeService.getChallengeByID(challengeID);
  return transformChallenge(result.challenge);
};

export const useGetChallengeByID = () => {
  const { challengeId } = useParams();

  return useQuery({
    queryKey: challengeKeys.detail(challengeId),
    queryFn: () => getChallengeByID(challengeId!),
    enabled: Boolean(challengeId),
  });
};
