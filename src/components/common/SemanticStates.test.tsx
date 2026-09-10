import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from '@jest/globals';
import type { ReactNode } from 'react';

import { PageEmptyState } from './PageEmptyState';
import { SubmitSolutionNotFoundState } from '../../features/submissions/components/SubmitSolutionNotFoundState';

const renderInRouter = (component: ReactNode) =>
  render(<MemoryRouter>{component}</MemoryRouter>);

describe('semantic page states', () => {
  it('provides navigation when a bounty cannot be found', () => {
    renderInRouter(<SubmitSolutionNotFoundState />);

    expect(
      screen.getByRole('heading', { name: /bounty not found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /browse bounties/i }),
    ).toHaveAttribute('href', '/dev-bounties');
  });

  it('associates generic empty-state headings with actionable regions', () => {
    renderInRouter(
      <PageEmptyState
        title="No submissions found"
        description="Nothing has been submitted yet."
        actionHref="/dev-bounties"
        actionLabel="Browse bounties"
      />,
    );

    expect(
      screen.getByRole('region', { name: /no submissions found/i }),
    ).toBeInTheDocument();
  });
});
