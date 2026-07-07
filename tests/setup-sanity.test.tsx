import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function Sample() {
  return <p>ok</p>;
}

describe('test environment', () => {
  it('renders with jsdom and testing-library', () => {
    render(<Sample />);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});
