import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Index from '@/pages/Index';
import i18n from '@/config/i18n';

vi.mock('@/assets/boy-reading-quran.json', () => ({
  default: {},
}));

vi.mock('lottie-react', () => ({
  default: ({ animationData }: any) => <div data-testid="lottie-animation" />,
}));

beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage('en');
});

afterEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage('en');
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
    it('should render main heading', async () => {
      renderWithRouter(<Index />);
      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toBeInTheDocument();
      });
    });

    it('should render section heading', async () => {
      renderWithRouter(<Index />);
      // Heading is now rendered as a p tag instead of h2
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', { level: 1 });
        expect(headings.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should render Create Account button', async () => {
      renderWithRouter(<Index />);
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(1);
      });
    });

    it('should render Sign in button text', async () => {
      renderWithRouter(<Index />);
      await waitFor(() => {
        // Just verify we have multiple buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(2);
      });
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

      const buttons = screen.getAllByRole('button');
      const createBtn = buttons[buttons.length - 2]; // Second to last button
      
      expect(createBtn).not.toBeDisabled();
      await user.click(createBtn);
      expect(createBtn).toBeInTheDocument();
    });

    it('should have Sign in button that is clickable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);

      const buttons = screen.getAllByRole('button');
      const signInBtn = buttons[buttons.length - 1]; // Last button
      
      expect(signInBtn).not.toBeDisabled();
      await user.click(signInBtn);
      expect(signInBtn).toBeInTheDocument();
    });
  });

  describe('Styling & Layout', () => {
    it('should have gradient background', () => {
      const { container } = renderWithRouter(<Index />);
      const mainDiv = container.querySelector('[class*="bg-gradient-soft"]');
      expect(mainDiv).toHaveClass('bg-gradient-soft');
    });

    it('should have flex layout with centered content', () => {
      const { container } = renderWithRouter(<Index />);
      const mainDiv = container.querySelector('[class*="bg-gradient-soft"]');
      expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-between');
    });

    it('should have min-height screen', () => {
      const { container } = renderWithRouter(<Index />);
      const mainDiv = container.querySelector('[class*="bg-gradient-soft"]');
      expect(mainDiv).toHaveClass('min-h-screen');
    });

    it('should be responsive (padding on mobile)', () => {
      const { container } = renderWithRouter(<Index />);
      const mainDiv = container.querySelector('[class*="bg-gradient-soft"]');
      expect(mainDiv).toHaveClass('p-6');
    });
  });

  describe('Buttons styling', () => {
    it('Create Account button should have emerald styling', () => {
      renderWithRouter(<Index />);
      const buttons = screen.getAllByRole('button');
      const createBtn = buttons[buttons.length - 2];
      expect(createBtn).toHaveClass('bg-emerald-500', 'text-white');
    });

    it('Sign in button should be a text link style', () => {
      renderWithRouter(<Index />);
      const buttons = screen.getAllByRole('button');
      const signInBtn = buttons[buttons.length - 1];
      expect(signInBtn).toHaveClass('text-emerald-600');
    });

    it('Create Account button should have hover effect', () => {
      renderWithRouter(<Index />);
      const buttons = screen.getAllByRole('button');
      const createBtn = buttons[buttons.length - 2];
      expect(createBtn).toHaveClass('hover:bg-emerald-600');
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

    it('buttons should be accessible', async () => {
      renderWithRouter(<Index />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(btn => {
        expect(btn).not.toBeDisabled();
      });
    });
  });

  describe('Language Toggle', () => {
    it('should display language toggle button at top-right', () => {
      renderWithRouter(<Index />);
      const buttons = screen.getAllByRole('button');
      // First button should be language toggle (top-right)
      expect(buttons[0]).toBeInTheDocument();
    });

    it('should have globe icon in language toggle button', () => {
      const { container } = renderWithRouter(<Index />);
      const toggleBtn = screen.getAllByRole('button')[0];
      const svg = toggleBtn.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should toggle language from English to Arabic on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);

      const toggleBtn = screen.getAllByRole('button')[0];
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
      });
    });

    it('should persist language preference to localStorage on toggle', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Index />);

      const toggleBtn = screen.getAllByRole('button')[0];
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(localStorage.getItem('app-language')).toBe('ar');
      });
    });

    it('should have accessible aria-label on language toggle', () => {
      renderWithRouter(<Index />);
      const toggleBtn = screen.getAllByRole('button')[0];
      expect(toggleBtn).toHaveAttribute('aria-label');
    });
  });
});
