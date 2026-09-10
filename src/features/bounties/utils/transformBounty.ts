import type { TBounty } from '../types';
import type { BountyDocument } from '../../../services/firestore-structure';

type BountySource = Partial<BountyDocument> & { id: string | number };

export const transformBounty = (doc: BountySource): TBounty => {
  return {
    id: doc.id,
    title: doc.title || '',
    description: doc.description || '',
    bountyBTC: doc.bountyBTC || 0,
    category: doc.category || '',
    difficulty: doc.difficulty || '',
    company: doc.companyName || '',
    companyUid: doc.companyUid,
    submissions: doc.submissions || 0,
    deadline: doc.deadline || '',
    status: doc.status || 'open',
  };
};
