import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SiteHeader } from '@/components/kit/SiteHeader';

let pathnameValue = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameValue,
}));

describe('SiteHeader', () => {
  it('renders nothing on the landing page', () => {
    pathnameValue = '/';
    const { container } = render(<SiteHeader />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['/analyze'],
    ['/report/demo-1'],
    ['/report/demo-1/premium'],
    ['/reserve'],
    ['/admin'],
  ])('shows a brand link back to home on %s', (path) => {
    pathnameValue = path;
    render(<SiteHeader />);
    expect(screen.getByText('홈쇼퍼').closest('a')).toHaveAttribute('href', '/');
  });

  it('renders nothing on a route outside the allowlist', () => {
    pathnameValue = '/some-future-page';
    const { container } = render(<SiteHeader />);
    expect(container).toBeEmptyDOMElement();
  });
});
