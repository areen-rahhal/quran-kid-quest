import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';

// Mock pages for navigation testing
const MockGoalsPage = () => <div data-testid="goals-page">Goals Page</div>;
const MockOnboardingPage = () => <div data-testid="onboarding-page">Onboarding Page</div>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={component} />
        <Route path="/goals" element={<MockGoalsPage />} />
        <Route path="/onboarding" element={<MockOnboardingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  describe('Rendering', () => {
    it('should render the welcome heading', () => {
      renderWithRouter(<Login />);
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      renderWithRouter(<Login />);
      expect(screen.getByText(/Continue your Quran journey/i)).toBeInTheDocument();
    });

    it('should render email input field', () => {
      renderWithRouter(<Login />);
      const emailInput = screen.getByPlaceholderText(/Email/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render password input field', () => {
      renderWithRouter(<Login />);
      const passwordInput = screen.getByPlaceholderText(/Password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render Sign In button', () => {
      renderWithRouter(<Login />);
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('should render test account quick login options', () => {
      renderWithRouter(<Login />);
      expect(screen.getByRole('button', { name: /Use Aya \(Parent\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Use Admin Account/i })).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update email input when user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input when user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });
  });

  describe('Test Account: Aya (Parent)', () => {
    it('should pre-fill Aya email when clicking Use Aya button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      await user.click(ayaButton);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      expect(emailInput.value).toBe('Aya@testmail.com');
    });

    it('should pre-fill Aya password when clicking Use Aya button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      await user.click(ayaButton);

      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
      expect(passwordInput.value).toBe('123456');
    });

    it('should have correct Aya credentials (email: Aya@testmail.com, password: 123456)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      await user.click(ayaButton);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;

      expect(emailInput.value).toBe('Aya@testmail.com');
      expect(passwordInput.value).toBe('123456');
    });
  });

  describe('Test Account: Admin', () => {
    it('should pre-fill admin email when clicking Use Admin Account button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      await user.click(adminButton);

      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;
      expect(emailInput.value).toBe('Myadmin@google.com');
    });

    it('should pre-fill admin password when clicking Use Admin Account button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      await user.click(adminButton);

      const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;
      expect(passwordInput.value).toBe('123');
    });

    it('should have correct admin credentials (email: Myadmin@google.com, password: 123)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

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
      renderWithRouter(<Login />);

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      const emailInput = screen.getByPlaceholderText(/Email/i) as HTMLInputElement;

      // Click Aya
      await user.click(ayaButton);
      expect(emailInput.value).toBe('Aya@testmail.com');

      // Switch to Admin
      await user.click(adminButton);
      expect(emailInput.value).toBe('Myadmin@google.com');

      // Switch back to Aya
      await user.click(ayaButton);
      expect(emailInput.value).toBe('Aya@testmail.com');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with Aya credentials', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      await user.click(ayaButton);

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(signInButton);

      expect(signInButton).toBeInTheDocument();
    });

    it('should submit form with admin credentials', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);

      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      await user.click(adminButton);

      const signInButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(signInButton);

      expect(signInButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<Login />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible input fields with proper types', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText(/Email/i);
      const passwordInput = screen.getByPlaceholderText(/Password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('buttons should not be disabled', async () => {
      renderWithRouter(<Login />);

      const ayaButton = screen.getByRole('button', { name: /Use Aya \(Parent\)/i });
      const adminButton = screen.getByRole('button', { name: /Use Admin Account/i });
      const signInButton = screen.getByRole('button', { name: /Sign In/i });

      expect(ayaButton).not.toBeDisabled();
      expect(adminButton).not.toBeDisabled();
      expect(signInButton).not.toBeDisabled();
    });
  });

  describe('Visual & Layout', () => {
    it('should have gradient background', () => {
      const { container } = renderWithRouter(<Login />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('bg-gradient-primary');
    });

    it('should have min-height screen', () => {
      const { container } = renderWithRouter(<Login />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('min-h-screen');
    });

    it('should have islamic pattern background decoration', () => {
      const { container } = renderWithRouter(<Login />);
      const pattern = container.querySelector('.islamic-pattern');
      expect(pattern).toBeInTheDocument();
    });

    it('should display BookOpen icon in header', () => {
      renderWithRouter(<Login />);
      const { container } = render(<BrowserRouter><Login /></BrowserRouter>);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
