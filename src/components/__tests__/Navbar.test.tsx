/**
 * Example Component Test
 * 
 * This demonstrates testing a React component with Testing Library.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from '../Navbar';

describe('Navbar Component', () => {
  const mockUser = {
    email: 'test@example.com',
  };

  beforeEach(() => {
    // Clear any previous renders
  });

  it('should render the navbar', () => {
    render(<Navbar user={mockUser} />);
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toBeInTheDocument();
  });

  it('should contain app branding', () => {
    render(<Navbar user={mockUser} />);
    
    const branding = screen.getByText(/10xCards/i);
    expect(branding).toBeInTheDocument();
  });

  it('should display user email', () => {
    render(<Navbar user={mockUser} />);
    
    const email = screen.getByText(mockUser.email);
    expect(email).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    render(<Navbar user={mockUser} />);
    
    const generateLink = screen.getByText(/Generate/i);
    const flashcardsLink = screen.getByText(/My Flashcards/i);
    
    expect(generateLink).toBeInTheDocument();
    expect(flashcardsLink).toBeInTheDocument();
  });

  it('should have a logout button', () => {
    render(<Navbar user={mockUser} />);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });
});

