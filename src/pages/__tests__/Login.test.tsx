import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Login from '@/pages/Login';

// Mock pages for navigation testing
const MockGoalsPage = () => <div data-testid="goals-page">Goals Page</div>;
const MockOnboardingPage = () => <div data-testid="onboarding-page">Onboarding Page</div>;

// For navigation tests, use MemoryRouter which properly isolates between tests
const renderWithMemoryRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/goals" element={<MockGoalsPage />} />
          <Route path="/onboarding" element={<MockOnboardingPage />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
    { withRouter: false }
  );
};

// For simple rendering tests without navigation expectations
const renderWithRouter = () => {
  return render(
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/goals" element={<MockGoalsPage />} />
      <Route path="/onboarding" element={<MockOnboardingPage />} />
    </Routes>
  );
};

describe('Login Page', () => {
  describe('Rendering', () => {
    it('should render the welcome heading', async () => {
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      });
    });

    it('should render the subtitle', async () => {
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByText(/Continue your Quran journey/i)).toBeInTheDocument();
      });
    });

    it('should render email input field', async () => {
      renderWithRouter();
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/Email/i);
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('type', 'email');
      });
    });

    it('should render password input field', async () => {
      renderWithRouter();
      await waitFor(() => {
        const passwordInput = screen.getByPlaceholderText(/Password/i);
        expect(passwordInput).toBeInTheDocument();
        expect(passwordInput).toHaveAttribute('type', 'password');
      });
    });

    it('should render Sign In button', async () => {
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
      });
    });

    it('should render test account quick login options', async () => {
      renderWithRouter();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Aya \(Parent\)/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Use Ahmad \(New User\)/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Use Admin Account/i })).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('should update email input when user types', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
        expect(emailInput).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input when user types', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
        expect(passwordInput).toBeInTheDocument();
      });

      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });
  });

  describe('Test Account: Aya (Parent)', () => {
    it('should pre-fill Aya email when clicking Use Aya button', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Aya \(Parent\)/i })).toBeInTheDocument();
      });

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      await user.click(ayaButton);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      expect(emailInput.value).toBe('Aya@testmail.com');
    });

    it('should pre-fill Aya password when clicking Use Aya button', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Aya \(Parent\)/i })).toBeInTheDocument();
      });

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      await user.click(ayaButton);

      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
      expect(passwordInput.value).toBe('123456');
    });

    it('should have correct Aya credentials (email: Aya@testmail.com, password: 123456)', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Aya \(Parent\)/i })).toBeInTheDocument();
      });

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      await user.click(ayaButton);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;

      expect(emailInput.value).toBe('Aya@testmail.com');
      expect(passwordInput.value).toBe('123456');
    });
  });

  describe('Test Account: Ahmad (New User)', () => {
    it('should pre-fill Ahmad email when clicking Use Ahmad button', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Ahmad \(New User\)/i })).toBeInTheDocument();
      });

      const ahmadButton = screen.getByRole('button', { name: /Use Ahmad \(New User\)/i });
      await user.click(ahmadButton);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      expect(emailInput.value).toBe('Ahmad@testmail.com');
    });

    it('should pre-fill Ahmad password when clicking Use Ahmad button', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Ahmad \(New User\)/i })).toBeInTheDocument();
      });

      const ahmadButton = screen.getByRole('button', { name: /Use Ahmad \(New User\)/i });
      await user.click(ahmadButton);

      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
      expect(passwordInput.value).toBe('TestPass');
    });

    it('should have correct Ahmad credentials (email: Ahmad@testmail.com, password: TestPass)', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Ahmad \(New User\)/i })).toBeInTheDocument();
      });

      const ahmadButton = screen.getByRole('button', { name: /Use Ahmad \(New User\)/i });
      await user.click(ahmadButton);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;

      expect(emailInput.value).toBe('Ahmad@testmail.com');
      expect(passwordInput.value).toBe('TestPass');
    });
  });

  describe('Test Account: Admin', () => {
    it('should pre-fill admin email when clicking Use Admin Account button', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Admin Account/i })).toBeInTheDocument();
      });

      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      await user.click(adminButton);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      expect(emailInput.value).toBe('Myadmin@google.com');
    });

    it('should pre-fill admin password when clicking Use Admin Account button', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Admin Account/i })).toBeInTheDocument();
      });

      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      await user.click(adminButton);

      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
      expect(passwordInput.value).toBe('123');
    });

    it('should have correct admin credentials (email: Myadmin@google.com, password: 123)', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Admin Account/i })).toBeInTheDocument();
      });

      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      await user.click(adminButton);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;

      expect(emailInput.value).toBe('Myadmin@google.com');
      expect(passwordInput.value).toBe('123');
    });
  });

  describe('Test Account Switching', () => {
    it('should allow switching between test accounts', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Aya \(Parent\)/i })).toBeInTheDocument();
      });

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      const ahmadButton = screen.getByRole('button', { name: /Use Ahmad \(New User\)/i });
      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;

      // Click Aya
      await user.click(ayaButton);
      expect(emailInput.value).toBe('Aya@testmail.com');

      // Switch to Ahmad
      await user.click(ahmadButton);
      expect(emailInput.value).toBe('Ahmad@testmail.com');

      // Switch to Admin
      await user.click(adminButton);
      expect(emailInput.value).toBe('Myadmin@google.com');

      // Switch back to Aya
      await user.click(ayaButton);
      expect(emailInput.value).toBe('Aya@testmail.com');
    });
  });

  describe('Form Submission & Navigation', () => {
    it('should navigate to /goals when Aya logs in', async () => {
      const user = userEvent.setup();
      renderWithMemoryRouter();

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      await user.click(ayaButton);

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('goals-page')).toBeInTheDocument();
      });
    });

    it('should navigate to /onboarding when Ahmad logs in', async () => {
      const user = userEvent.setup();
      renderWithMemoryRouter();

      const ahmadButton = screen.getByRole('button', { name: /Use Ahmad \(New User\)/i });
      await user.click(ahmadButton);

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('onboarding-page')).toBeInTheDocument();
      });
    });

    it('should navigate to /onboarding when admin logs in', async () => {
      const user = userEvent.setup();
      renderWithMemoryRouter();

      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      await user.click(adminButton);

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('onboarding-page')).toBeInTheDocument();
      });
    });

    it('should navigate to /goals when Aya email is entered and form is submitted', async () => {
      const user = userEvent.setup();
      renderWithMemoryRouter();

      const emailInput = screen.getByPlaceholderText(/Email/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      await user.type(emailInput, 'Aya@testmail.com');
      await user.type(passwordInput, '123456');

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('goals-page')).toBeInTheDocument();
      });
    });

    it('should navigate to /onboarding when Ahmad email is entered and form is submitted', async () => {
      const user = userEvent.setup();
      renderWithMemoryRouter();

      const emailInput = screen.getByPlaceholderText(/Email/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      await user.type(emailInput, 'Ahmad@testmail.com');
      await user.type(passwordInput, 'TestPass');

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('onboarding-page')).toBeInTheDocument();
      });
    });

    it('should navigate to /onboarding for other email addresses', async () => {
      const user = userEvent.setup();
      renderWithMemoryRouter();

      const emailInput = screen.getByPlaceholderText(/Email/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('onboarding-page')).toBeInTheDocument();
      });
    });

    it('should be case-insensitive for Aya email comparison', async () => {
      const user = userEvent.setup();
      renderWithMemoryRouter();

      const emailInput = screen.getByPlaceholderText(/Email/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      await user.type(emailInput, 'aya@testmail.com');
      await user.type(passwordInput, 'password');

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('goals-page')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      renderWithRouter();
      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should have accessible input fields with proper types', async () => {
      renderWithRouter();

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/Email/i);
        const passwordInput = screen.getByPlaceholderText(/Password/i);

        expect(emailInput).toHaveAttribute('type', 'email');
        expect(passwordInput).toHaveAttribute('type', 'password');
      });
    });

    it('buttons should not be disabled', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Use Aya \(Parent\)/i })).toBeInTheDocument();
      });

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      const ahmadButton = screen.getByRole('button', { name: /Use Ahmad \(New User\)/i });
      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      const signInButton = screen.getByRole('button', { name: /Sign In/i });

      expect(ayaButton).not.toBeDisabled();
      expect(ahmadButton).not.toBeDisabled();
      expect(adminButton).not.toBeDisabled();
      expect(signInButton).not.toBeDisabled();
    });
  });

  describe('Visual & Layout', () => {
    it('should have gradient background', async () => {
      const { container } = renderWithRouter();
      await waitFor(() => {
        const mainDiv = container.querySelector('[class*="bg-gradient-primary"]');
        expect(mainDiv).toHaveClass('bg-gradient-primary');
      });
    });

    it('should have min-height screen', async () => {
      const { container } = renderWithRouter();
      await waitFor(() => {
        const mainDiv = container.querySelector('[class*="min-h-screen"]');
        expect(mainDiv).toHaveClass('min-h-screen');
      });
    });

    it('should have islamic pattern background decoration', async () => {
      const { container } = renderWithRouter();
      await waitFor(() => {
        const pattern = container.querySelector('.islamic-pattern');
        expect(pattern).toBeInTheDocument();
      });
    });

    it('should display BookOpen icon in header', async () => {
      const { container } = renderWithRouter();
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });
  });
});
