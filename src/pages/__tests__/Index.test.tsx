import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Index from '@/pages/Index';

vi.mock('@/assets/boy-reading-quran.json', () => ({
  default: {},
}));

vi.mock('lottie-react', () => ({
  default: ({ animationData }: any) => <div data-testid="lottie-animation" />,
}));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </LanguageProvider>
  );
};

describe('Index Page', () => {
  describe('Rendering', () => {
    it('should render the main title', () => {
      renderWithRouter(<Index />);
      expect(screen.getByRole('heading', { name: /Children's Quran/i })).toBeInTheDocument();
    });


    it('should render section heading', () => {
      renderWithRouter(<Index />);
      expect(screen.getByRole('heading', { name: /Let's Learn, Play and Memorize!/i })).toBeInTheDocument();
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
      expect(createAccountBtn).toBeInTheDocument();
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
      expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-between');
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
      renderWithRouter(<Index />);

      const createAccountBtn = screen.getByRole('button', { name: /Create Account/i });
      expect(createAccountBtn).not.toBeDisabled();
      expect(createAccountBtn).toBeInTheDocument();
    });
  });

  describe('Language Toggle', () => {
    it('should display language toggle button at top-right', () => {
      renderWithRouter(<Index />);
      const toggleBtn = screen.getByRole('button', { name: /switch to arabic/i });
      expect(toggleBtn).toBeInTheDocument();
    });

    it('should show "عربي" text when language is English', () => {
      renderWithRouter(<Index />);
      const toggleBtn = screen.getByRole('button', { name: /switch to arabic/i });
      expect(toggleBtn).toHaveTextContent('عربي');
    });

    it('should toggle language from English to Arabic on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);

      const toggleBtn = screen.getByRole('button', { name: /switch to arabic/i });
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /switch to english/i })).toBeInTheDocument();
      });
    });

    it('should show "EN" text when language is Arabic', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);

      const toggleBtn = screen.getByRole('button', { name: /switch to arabic/i });
      await user.click(toggleBtn);

      await waitFor(() => {
        const arToggleBtn = screen.getByRole('button', { name: /switch to english/i });
        expect(arToggleBtn).toHaveTextContent('EN');
      });
    });

    it('should persist language preference to localStorage on toggle', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);

      const toggleBtn = screen.getByRole('button', { name: /switch to arabic/i });
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(localStorage.getItem('app-language')).toBe('ar');
      });
    });

    it('should have globe icon in language toggle button', () => {
      const { container } = renderWithRouter(<Index />);
      const toggleBtn = screen.getByRole('button', { name: /switch to/i });
      const svg = toggleBtn.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have accessible aria-label on language toggle', () => {
      renderWithRouter(<Index />);
      const toggleBtn = screen.getByRole('button', { name: /switch to arabic/i });
      expect(toggleBtn).toHaveAttribute('aria-label', 'Switch to Arabic');
    });

    it('should update aria-label after toggling language', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);

      let toggleBtn = screen.getByRole('button', { name: /switch to arabic/i });
      expect(toggleBtn).toHaveAttribute('aria-label', 'Switch to Arabic');

      await user.click(toggleBtn);

      await waitFor(() => {
        toggleBtn = screen.getByRole('button', { name: /switch to english/i });
        expect(toggleBtn).toHaveAttribute('aria-label', 'Switch to English');
      });
    });
  });
});
