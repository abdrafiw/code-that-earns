import { describe, expect, it } from '@jest/globals';

import { isValidSubmissionUrl } from './submissionUrl';

describe('isValidSubmissionUrl', () => {
  it.each([
    'https://www.figma.com/design/abc/Product-Design?node-id=1-2',
    'https://figma.com/file/abc/Product-Design',
    'https://figma.com/proto/abc/Product-Prototype',
    'https://figma.com/board/abc/Product-Board',
    'https://figma.com/community/file/123456/Product-Design',
    'https://www.behance.net/gallery/123456789/Product-Design',
    'https://dribbble.com/shots/12345678-Product-Design',
  ])('accepts a supported design project URL: %s', (url) => {
    expect(isValidSubmissionUrl(url, 'UI/UX Design')).toBe(true);
  });

  it.each([
    'http://figma.com/design/abc/Product-Design',
    'https://figma.com/',
    'https://www.behance.net/designer-profile',
    'https://dribbble.com/designer-profile',
    'https://example.com/design',
    'https://github.com/example/project',
  ])('rejects a non-project design URL: %s', (url) => {
    expect(isValidSubmissionUrl(url, 'UI/UX Design')).toBe(false);
  });

  it('keeps GitHub repository validation for other categories', () => {
    expect(
      isValidSubmissionUrl('https://github.com/example/project', 'Coding'),
    ).toBe(true);
    expect(
      isValidSubmissionUrl('https://figma.com/design/abc/Product', 'Coding'),
    ).toBe(false);
  });
});
