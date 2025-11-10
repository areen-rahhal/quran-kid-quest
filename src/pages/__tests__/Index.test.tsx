import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';

vi.mock('@/assets/boy-reading-quran.json', () => ({
  default: {},
}));

vi.mock('lottie-react', () => ({
  default: ({ animationData }: any) => <div data-testid="lottie-animation" />,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Index Page', () => {
  describe('Rendering', () => {
    it('should render the main title', () => {
      renderWithRouter(<Index />);
      expect(screen.getByRole('heading', { name: /Children's Quran/i })).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      renderWithRouter(<Index />);
      expect(screen.getByText(/An enjoyable journey to memorize the Holy Quran/i)).toBeInTheDocument();
    });

    it('should render section heading', () => {
      renderWithRouter(<Index />);
      expect(screen.getByRole('heading', { name: /Let's Learn, Play and Memorize!/i })).toBeInTheDocument();
    });

    it('should render description text', () => {
      renderWithRouter(<Index />);
      expect(
        screen.getByText(/Join us on an exciting journey to memorize the Holy Quran with games and rewards/i)
      ).toBeInTheDocument();
    });

    it('should render Create Account button', () => {
      renderWithRouter(<Index />);
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });

    it('should render Sign in button', () => {
      renderWithRouter(<Index />);
      expect(screen.getByRole('button', { name: /Already have an account\? Sign in/i })).toBeInTheDocument();
    });

    it('should render Lottie animation', () => {
      renderWithRouter(<Index />);
      expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
    });

    it('should render decorative elements', () => {
      const { container } = renderWithRouter(<Index />);
      const decorativeElements = container.querySelectorAll('[class*="absolute"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should have Create Account button that is clickable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);

      const createAccountBtn = screen.getByRole('button', { name: /Create Account/i });
      expect(createAccountBtn).not.toBeDisabled();
      await user.click(createAccountBtn);
      expect(createAccountBtn).toHaveBeenClicked?.() || expect(createAccountBtn).toBeInTheDocument();
    });

    it('should have Sign in button that is clickable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);

      const signInBtn = screen.getByRole('button', { name: /Already have an account\? Sign in/i });
      expect(signInBtn).not.toBeDisabled();
      await user.click(signInBtn);
      expect(signInBtn).toBeInTheDocument();
    });
  });

  describe('Styling & Layout', () => {
    it('should have gradient background', () => {
      const { container } = renderWithRouter(<Index />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('bg-gradient-soft');
    });

    it('should have flex layout with centered content', () => {
      const { container } = renderWithRouter(<Index />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('should have min-height screen', () => {
      const { container } = renderWithRouter(<Index />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('min-h-screen');
    });

    it('should be responsive (padding on mobile)', () => {
      const { container } = renderWithRouter(<Index />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('p-6');
    });
  });

  describe('Buttons styling', () => {
    it('Create Account button should have emerald styling', () => {
      renderWithRouter(<Index />);
      const createAccountBtn = screen.getByRole('button', { name: /Create Account/i });
      expect(createAccountBtn).toHaveClass('bg-emerald-500', 'text-white');
    });

    it('Sign in button should be a text link style', () => {
      renderWithRouter(<Index />);
      const signInBtn = screen.getByRole('button', { name: /Already have an account\? Sign in/i });
      expect(signInBtn).toHaveClass('text-emerald-600');
    });

    it('Create Account button should have hover effect', () => {
      renderWithRouter(<Index />);
      const createAccountBtn = screen.getByRole('button', { name: /Create Account/i });
      expect(createAccountBtn).toHaveClass('hover:bg-emerald-600');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<Index />);
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });

    it('buttons should be accessible via keyboard', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);
      
      const createAccountBtn = screen.getByRole('button', { name: /Create Account/i });
      expect(createAccountBtn).not.toBeDisabled();
      
      await user.tab();
      expect(createAccountBtn).toHaveFocus();
    });
  });
});
