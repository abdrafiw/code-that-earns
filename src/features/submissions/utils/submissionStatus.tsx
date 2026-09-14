import { CheckCircle, Clock, XCircle } from 'lucide-react';

export const getSubmissionStatusIcon = (status: string) => {
  switch (status) {
    case 'winner':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'submitted':
    case 'under_review':
    default:
      return <Clock className="h-5 w-5 text-yellow-500" />;
  }
};

export const getSubmissionStatusColor = (status: string) => {
  switch (status) {
    case 'winner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'submitted':
    case 'under_review':
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};
