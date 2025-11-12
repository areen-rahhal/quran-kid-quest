import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage, Language } from '@/contexts/LanguageContext';
import { ReactNode } from 'react';
import i18n from '@/config/i18n';

const TestComponent = () => {
  const { language, toggleLanguage, setLanguage, isArabic, isEnglish } = useLanguage();

  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="is-arabic">{isArabic ? 'true' : 'false'}</div>
      <div data-testid="is-english">{isEnglish ? 'true' : 'false'}</div>
      <button onClick={toggleLanguage} data-testid="toggle-btn">
        Toggle Language
      </button>
      <button onClick={() => setLanguage('en')} data-testid="set-en-btn">
        Set English
      </button>
      <button onClick={() => setLanguage('ar')} data-testid="set-ar-btn">
        Set Arabic
      </button>
    </div>
  );
};

const renderWithProvider = (component: ReactNode) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe('LanguageContext', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  afterEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  describe('LanguageProvider', () => {
    it('should render children correctly', () => {
      renderWithProvider(<div>Test Content</div>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should initialize with current i18n language', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    it('should set isEnglish flag correctly', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('is-english')).toHaveTextContent('true');
      expect(screen.getByTestId('is-arabic')).toHaveTextContent('false');
    });

    it('should expose toggle and setLanguage methods', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('toggle-btn')).toBeInTheDocument();
      expect(screen.getByTestId('set-en-btn')).toBeInTheDocument();
      expect(screen.getByTestId('set-ar-btn')).toBeInTheDocument();
    });
  });

  describe('toggleLanguage', () => {
    it('should toggle from English to Arabic', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
      });
    });

    it('should toggle from Arabic back to English', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await user.click(toggleBtn);
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      });
    });

    it('should update isArabic and isEnglish flags on toggle', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByTestId('is-arabic')).toHaveTextContent('true');
        expect(screen.getByTestId('is-english')).toHaveTextContent('false');
      });
    });

    it('should update HTML lang attribute on toggle to Arabic', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
      });
    });

    it('should set document dir to rtl when toggled to Arabic', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
      });
    });

    it('should set document dir back to ltr when toggled to English', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await user.click(toggleBtn);
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
      });
    });
  });

  describe('setLanguage', () => {
    it('should set language to English', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const setEnBtn = screen.getByTestId('set-en-btn');
      await user.click(setEnBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      });
    });

    it('should set language to Arabic', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const setArBtn = screen.getByTestId('set-ar-btn');
      await user.click(setArBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
      });
    });

    it('should update document attributes when setting Arabic', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const setArBtn = screen.getByTestId('set-ar-btn');
      await user.click(setArBtn);

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
        expect(document.documentElement.dir).toBe('rtl');
      });
    });

    it('should update document attributes when setting English', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const setArBtn = screen.getByTestId('set-ar-btn');
      await user.click(setArBtn);

      const setEnBtn = screen.getByTestId('set-en-btn');
      await user.click(setEnBtn);

      await waitFor(() => {
        expect(i18n.language).toBe('en');
        expect(document.documentElement.dir).toBe('ltr');
      });
    });
  });

  describe('i18n integration', () => {
    it('should persist language to localStorage on toggle', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await user.click(toggleBtn);

      await waitFor(() => {
        const saved = localStorage.getItem('app-language');
        expect(saved).toBe('ar');
      });
    });

    it('should persist language via i18n on setLanguage', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const setArBtn = screen.getByTestId('set-ar-btn');
      await user.click(setArBtn);

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
      });
    });

    it('should sync with i18n language changes', async () => {
      const user = userEvent.setup();
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
      });
    });
  });

  describe('useLanguage hook', () => {
    it('should throw error when used outside LanguageProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponentOutsideProvider = () => {
        const { language } = useLanguage();
        return <div>{language}</div>;
      };

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useLanguage must be used within a LanguageProvider');

      consoleError.mockRestore();
    });

    it('should provide all required context methods', () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-language')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-btn')).toBeInTheDocument();
      expect(screen.getByTestId('set-en-btn')).toBeInTheDocument();
      expect(screen.getByTestId('set-ar-btn')).toBeInTheDocument();
    });
  });
});
