import type { BountyDeadline } from './utils/bountyDeadline';
import type { BountyDocument } from '../../services/firestore-structure';

export type TBounty = Omit<
  Partial<BountyDocument>,
  'deadline' | 'companyName'
> & {
  id: string | number;
  title: string;
  description: string;
  category: string;
  company?: string;
  difficulty: string;
  bountyBTC: number;
  deadline: BountyDeadline;
};

export type CreateBountyPayload = {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  bountyBTC: number;
  deadline: Date;
};
