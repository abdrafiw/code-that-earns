import { Bitcoin, Code, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../../../components/ui/card';

import { Button } from '../../../components/ui/button';
import type { TBounty } from '../types';
import { formatBountyDeadline } from '../utils/bountyDeadline';

export const BountyCard = ({ bounty }: { bounty: TBounty }) => {
  return (
    <Card className="border-primary-400 border-l-4">
      <CardHeader className="flex items-start justify-between">
        <h3 className="text-heading text-xl font-semibold">{bounty.title}</h3>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            bounty.difficulty === 'beginner'
              ? 'bg-green-100 text-green-800'
              : bounty.difficulty === 'intermediate'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {bounty.difficulty}
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-body line-clamp-3">{bounty.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bitcoin className="mr-1 h-5 w-5" />
            <p className="text-primary-600 font-bold">{bounty.bountyBTC} BTC</p>
          </div>

          <div className="text-muted-foreground flex items-center text-sm">
            <Users className="mr-1 h-4 w-4" />
            <p>submissions</p>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <p className="">
            <span className="">By</span>
            <span className="text-primary-400 ml-2 font-bold">
              {bounty.company}
            </span>
          </p>
          <span className="">
            Deadline: {formatBountyDeadline(bounty.deadline)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button asChild>
          <Link to={`/submit/${bounty.id}`}>
            <Code className="mr-2 h-4 w-4" />
            <span>Submit Solution</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
