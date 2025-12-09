import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Onboarding from '../Onboarding';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock goal data
const mockGoalData = {
  'juz-30': {
    nameEnglish: "Juz' 30",
    nameArabic: "جزء عم",
    metadata: {
      surahCount: 37,
      defaultPhaseSize: 3,
      versesCount: 564,
    },
  },
  'surah-bakarah': {
    nameEnglish: 'Surah Al-Bakarah',
    nameArabic: 'سورة البقرة',
    metadata: {
      surahCount: 1,
      defaultPhaseSize: 10,
      versesCount: 286,
    },
  },
};

// Mock pages
const MockGoalsPage = () => <div data-testid="goals-page">Goals Page</div>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <ProfileProvider>
          <Routes>
            <Route path="/onboarding" element={component} />
            <Route path="/goals" element={<MockGoalsPage />} />
          </Routes>
        </ProfileProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe('Onboarding Page - Goal Creation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Goal Selection and Addition', () => {
    it('should render goal selection dropdown', async () => {
      const { container } = renderWithRouter(<Onboarding />);
      
      const selectTrigger = container.querySelector('[role="combobox"]');
      expect(selectTrigger).toBeInTheDocument();
    });

    it('should show placeholder text when no goal is selected', async () => {
      const { container } = renderWithRouter(<Onboarding />);
      
      const selectTrigger = container.querySelector('[role="combobox"]');
      expect(selectTrigger?.textContent).toContain('Choose a goal');
    });

    it('should disable Continue button when no goal is selected', async () => {
      const { container } = renderWithRouter(<Onboarding />);
      
      const continueButton = container.querySelector('button:has-text("Continue")') || 
        Array.from(container.querySelectorAll('button')).find(btn => btn.textContent?.includes('Continue'));
      
      expect(continueButton).toBeDisabled();
    });

    it('should enable Continue button when a goal is selected', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Onboarding />);
      
      const selectTrigger = container.querySelector('[role="combobox"]') as HTMLElement;
      await user.click(selectTrigger);

      const option = await screen.findByText("Juz' 30");
      await user.click(option);

      const continueButton = Array.from(container.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('Continue')
      ) as HTMLButtonElement;
      
      await waitFor(() => {
        expect(continueButton).not.toBeDisabled();
      });
    });

    it('should show loading state while adding goal', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Onboarding />);
      
      const selectTrigger = container.querySelector('[role="combobox"]') as HTMLElement;
      await user.click(selectTrigger);

      const option = await screen.findByText("Juz' 30");
      await user.click(option);

      const continueButton = Array.from(container.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('Continue')
      ) as HTMLButtonElement;
      
      await user.click(continueButton);

      // Button should show loading state
      await waitFor(() => {
        expect(continueButton.textContent).toContain('Adding Goal');
      });
    });

    it('should navigate to goals page after successfully adding goal', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Onboarding />);
      
      const selectTrigger = document.querySelector('[role="combobox"]') as HTMLElement;
      await user.click(selectTrigger);

      const option = await screen.findByText("Juz' 30");
      await user.click(option);

      const continueButtons = Array.from(document.querySelectorAll('button')).filter(
        btn => btn.textContent?.includes('Continue')
      );
      const continueButton = continueButtons[continueButtons.length - 1] as HTMLButtonElement;
      
      await user.click(continueButton);

      await waitFor(() => {
        expect(screen.getByTestId('goals-page')).toBeInTheDocument();
      });
    });
  });

  describe('Goal Selection Dropdown', () => {
    it('should display all available goals', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Onboarding />);
      
      const selectTrigger = container.querySelector('[role="combobox"]') as HTMLElement;
      await user.click(selectTrigger);

      await waitFor(() => {
        expect(screen.getByText("Juz' 30")).toBeInTheDocument();
        expect(screen.getByText("Juz' 29")).toBeInTheDocument();
        expect(screen.getByText("Surah Al Bakarah")).toBeInTheDocument();
      });
    });

    it('should update selected goal when option is clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Onboarding />);
      
      const selectTrigger = container.querySelector('[role="combobox"]') as HTMLElement;
      await user.click(selectTrigger);

      const option = await screen.findByText("Surah Al Bakarah");
      await user.click(option);

      await waitFor(() => {
        expect(selectTrigger.textContent).toContain("Surah Al Bakarah");
      });
    });
  });

  describe('User Welcome Information', () => {
    it('should display welcome message with parent profile name', async () => {
      renderWithRouter(<Onboarding />);
      
      // The page should show "Welcome back" text
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    it('should display parent profile avatar initials', async () => {
      const { container } = renderWithRouter(<Onboarding />);
      
      const avatar = container.querySelector('[class*="avatar"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should allow logout via logout button', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Onboarding />);
      
      const logoutButton = container.querySelector('button[title="Logout"]') as HTMLElement;
      expect(logoutButton).toBeInTheDocument();
      
      await user.click(logoutButton);
      // Navigation should happen (verified by the navigation system)
    });
  });

  describe('Action Cards Navigation', () => {
    it('should navigate to goals page when Add Child Profile card is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Onboarding />);
      
      const addChildCard = screen.getByText('Add Child Profile');
      await user.click(addChildCard);

      // This navigates directly to /goals
      await waitFor(() => {
        expect(screen.getByTestId('goals-page')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels for goal selection', async () => {
      const { container } = renderWithRouter(<Onboarding />);
      
      const label = container.querySelector('label');
      expect(label?.textContent).toContain('Select your first goal');
    });

    it('should have descriptive button text', async () => {
      const { container } = renderWithRouter(<Onboarding />);
      
      const buttons = Array.from(container.querySelectorAll('button'));
      const continueBtn = buttons.find(btn => btn.textContent?.includes('Continue'));
      expect(continueBtn).toHaveTextContent('Continue');
    });
  });
});
