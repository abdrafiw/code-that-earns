import { render, screen } from '@testing-library/react';
import { Timestamp } from 'firebase/firestore';
import { DeveloperSubmissionCard } from '../components/DeveloperSubmissionCard';
import type { SubmissionRecord } from '../types';

const submission: SubmissionRecord = {
  id: 'submission-1',
  schemaVersion: 2,
  challengeId: 'challenge-1',
  companyUid: 'company-1',
  challengeTitle: 'Build an accessible dashboard',
  challengeDescription: 'Build and document the dashboard.',
  challengeOutcome: { type: 'recognition', recognitionLabel: 'Winner' },
  githubUrl: 'https://github.com/developer/project',
  liveDemoUrl: 'https://demo.example.com',
  notes: 'Includes keyboard navigation.',
  publicWinnerConsent: false,
  developerUid: 'developer-1',
  developerName: 'Developer',
  developerEmail: 'developer@example.com',
  status: 'under_review',
  createdAt: Timestamp.fromDate(new Date('2030-01-01T00:00:00Z')),
};

it('shows the submitted links, notes, challenge, and current status', () => {
  render(<DeveloperSubmissionCard submission={submission} />);

  expect(
    screen.getByRole('heading', { name: submission.challengeTitle! }),
  ).toBeInTheDocument();
  expect(screen.getByText('under review')).toBeInTheDocument();
  expect(screen.getByText(submission.notes!)).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /developer\/project/i }),
  ).toHaveAttribute('href', submission.githubUrl);
  expect(
    screen.getByRole('link', { name: /demo\.example\.com/i }),
  ).toHaveAttribute('href', submission.liveDemoUrl);
});
