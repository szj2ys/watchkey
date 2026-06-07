import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

const BadComponent = () => (
  <main>
    <img src="test.jpg" /> {/* Missing alt */}
    <button className="text-gray-500 bg-black">Click me</button> {/* Poor contrast */}
  </main>
);

describe('Accessibility Testing Infrastructure', () => {
  it('should catch accessibility violations', async () => {
    const { container } = render(<BadComponent />);
    const results = await axe(container);
    // Instead of using toHaveNoViolations which would fail the test,
    // we assert that violations were found to prove the tool works correctly
    expect(results.violations.length).toBeGreaterThan(0);
  });
});
