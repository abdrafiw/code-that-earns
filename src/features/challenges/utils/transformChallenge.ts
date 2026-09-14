import type { TChallenge } from '../types';
import type { ChallengeDocument } from '../../../services/firestore-structure';

type ChallengeSource = Partial<ChallengeDocument> & { id: string | number };

export const transformChallenge = (doc: ChallengeSource): TChallenge => {
  return {
    id: doc.id,
    title: doc.title || '',
    description: doc.description || '',
    outcome: doc.outcome || { type: 'recognition', recognitionLabel: 'Winner' },
    winnerCount: doc.winnerCount || 1,
    eligibility: doc.eligibility || 'Open to eligible developers.',
    category: doc.category || '',
    difficulty: doc.difficulty || '',
    company: doc.companyName || '',
    companyUid: doc.companyUid,
    submissions: doc.submissions || 0,
    deadline: doc.deadline || '',
    status: doc.status || 'open',
  };
};
