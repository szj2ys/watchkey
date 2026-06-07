import React from 'react';
import { render } from '@testing-library/react';
import Loading from '../app/loading';

// Mock Header
jest.mock('../components/layout/Header', () => ({
  Header: () => <header data-testid="mocked-header" />
}));

describe('Home Loading State', () => {
  it('renders a loading skeleton immediately', () => {
    // Just verify the component mounts without error
    const { container } = render(<Loading />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
