import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '@/components/kit/Logo';

describe('Logo', () => {
  it('renders the brand mark as an svg', () => {
    const { container } = render(<Logo />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
