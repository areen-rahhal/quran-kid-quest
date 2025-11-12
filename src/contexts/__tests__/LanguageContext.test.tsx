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
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  });

  describe('LanguageProvider', () => {
    it('should render children correctly', () => {
      renderWithProvider(<div>Test Content</div>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should initialize with default language (en)', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    it('should set isEnglish to true by default', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('is-english')).toHaveTextContent('true');
      expect(screen.getByTestId('is-arabic')).toHaveTextContent('false');
    });

    it('should set HTML document lang attribute on initialization', () => {
      renderWithProvider(<TestComponent />);
      expect(document.documentElement.lang).toBe('en');
    });

    it('should set HTML document dir to ltr for English', () => {
      renderWithProvider(<TestComponent />);
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  describe('toggleLanguage', () => {
    it('should toggle from English to Arabic', async () => {
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await userEvent.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
      });
    });

    it('should toggle from Arabic back to English', async () => {
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await userEvent.click(toggleBtn);
      await userEvent.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      });
    });

    it('should update isArabic and isEnglish flags on toggle', async () => {
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await userEvent.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByTestId('is-arabic')).toHaveTextContent('true');
        expect(screen.getByTestId('is-english')).toHaveTextContent('false');
      });
    });

    it('should update HTML lang attribute on toggle to Arabic', async () => {
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await userEvent.click(toggleBtn);

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('ar');
      });
    });

    it('should set document dir to rtl when toggled to Arabic', async () => {
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await userEvent.click(toggleBtn);

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
      });
    });

    it('should set document dir back to ltr when toggled to English', async () => {
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await userEvent.click(toggleBtn);
      await userEvent.click(toggleBtn);

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
      });
    });
  });

  describe('setLanguage', () => {
    it('should set language to English', async () => {
      renderWithProvider(<TestComponent />);

      const setEnBtn = screen.getByTestId('set-en-btn');
      await userEvent.click(setEnBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      });
    });

    it('should set language to Arabic', async () => {
      renderWithProvider(<TestComponent />);

      const setArBtn = screen.getByTestId('set-ar-btn');
      await userEvent.click(setArBtn);

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
      });
    });

    it('should update document attributes when setting Arabic', async () => {
      renderWithProvider(<TestComponent />);

      const setArBtn = screen.getByTestId('set-ar-btn');
      await userEvent.click(setArBtn);

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('ar');
        expect(document.documentElement.dir).toBe('rtl');
      });
    });

    it('should update document attributes when setting English', async () => {
      renderWithProvider(<TestComponent />);

      const setArBtn = screen.getByTestId('set-ar-btn');
      await userEvent.click(setArBtn);

      const setEnBtn = screen.getByTestId('set-en-btn');
      await userEvent.click(setEnBtn);

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('en');
        expect(document.documentElement.dir).toBe('ltr');
      });
    });
  });

  describe('localStorage integration', () => {
    it('should persist language to localStorage on toggle', async () => {
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');
      await userEvent.click(toggleBtn);

      await waitFor(() => {
        const saved = localStorage.getItem('app-language');
        expect(saved).toBe('ar');
      });
    });

    it('should persist English language to localStorage', async () => {
      renderWithProvider(<TestComponent />);

      const setEnBtn = screen.getByTestId('set-en-btn');
      await userEvent.click(setEnBtn);

      await waitFor(() => {
        const saved = localStorage.getItem('app-language');
        expect(saved).toBe('en');
      });
    });

    it('should restore language from localStorage on mount', () => {
      localStorage.setItem('app-language', 'ar');

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
    });

    it('should restore isArabic flag from localStorage', () => {
      localStorage.setItem('app-language', 'ar');

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('is-arabic')).toHaveTextContent('true');
      expect(screen.getByTestId('is-english')).toHaveTextContent('false');
    });

    it('should ignore invalid localStorage values and use default', () => {
      localStorage.setItem('app-language', 'invalid');

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });

    it('should persist across multiple toggles', async () => {
      renderWithProvider(<TestComponent />);

      const toggleBtn = screen.getByTestId('toggle-btn');

      await userEvent.click(toggleBtn);
      await waitFor(() => {
        expect(localStorage.getItem('app-language')).toBe('ar');
      });

      await userEvent.click(toggleBtn);
      await waitFor(() => {
        expect(localStorage.getItem('app-language')).toBe('en');
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
