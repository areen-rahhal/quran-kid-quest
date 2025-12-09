import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileProvider, useProfile } from '@/contexts/ProfileContext';
import { ReactNode } from 'react';

const TestComponent = () => {
  const { currentProfile, profiles, switchProfile, registerParent, isRegistrationComplete } = useProfile();

  const handleRegister = async () => {
    await registerParent({
      email: 'newparent@example.com',
      password: 'password123',
      parentName: 'Ahmed',
      avatar: 'avatar-new',
    });
  };

  return (
    <div>
      <div data-testid="current-profile">{currentProfile.name}</div>
      <div data-testid="profile-count">{profiles.length}</div>
      <div data-testid="registration-status">{isRegistrationComplete ? 'complete' : 'incomplete'}</div>
      <button onClick={() => switchProfile('2')} data-testid="switch-btn">
        Switch to Waleed
      </button>
      <button
        onClick={handleRegister}
        data-testid="register-btn"
      >
        Register Parent
      </button>
    </div>
  );
};

const renderWithProvider = (component: ReactNode) => {
  return render(<ProfileProvider>{component}</ProfileProvider>);
};

describe('ProfileContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('ProfileProvider', () => {
    it('should render children correctly', () => {
      renderWithProvider(<div>Test Content</div>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should initialize with default profile (Aya)', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('current-profile')).toHaveTextContent('Aya');
    });

    it('should have initial profile count of 3', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('profile-count')).toHaveTextContent('3');
    });

    it('should initialize registration as incomplete by default', () => {
      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId('registration-status')).toHaveTextContent('incomplete');
    });
  });

  describe('switchProfile', () => {
    it('should switch to different profile', async () => {
      renderWithProvider(<TestComponent />);
      
      const switchBtn = screen.getByTestId('switch-btn');
      switchBtn.click();

      await waitFor(() => {
        expect(screen.getByTestId('current-profile')).toHaveTextContent('Waleed');
      });
    });

    it('should persist switched profile to localStorage', async () => {
      renderWithProvider(<TestComponent />);
      
      screen.getByTestId('switch-btn').click();

      await waitFor(() => {
        const saved = localStorage.getItem('currentProfile');
        expect(saved).toBeTruthy();
        const parsed = JSON.parse(saved!);
        expect(parsed.id).toBe('2');
      });
    });

    it('should not switch to non-existent profile', () => {
      renderWithProvider(<TestComponent />);
      
      const TestComponent2 = () => {
        const { switchProfile, currentProfile } = useProfile();
        
        return (
          <div>
            <button onClick={() => switchProfile('non-existent')} data-testid="invalid-switch">
              Switch
            </button>
            <div data-testid="current">{currentProfile.name}</div>
          </div>
        );
      };

      render(
        <ProfileProvider>
          <TestComponent2 />
        </ProfileProvider>
      );

      const invalidBtn = screen.getByTestId('invalid-switch');
      invalidBtn.click();

      expect(screen.getByTestId('current')).toHaveTextContent('Aya');
    });
  });

  describe('registerParent', () => {
    it('should register a new parent profile', async () => {
      renderWithProvider(<TestComponent />);

      const registerBtn = screen.getByTestId('register-btn');
      registerBtn.click();

      await waitFor(() => {
        expect(screen.getByTestId('profile-count')).toHaveTextContent('4');
      });
    });

    it('should set registered parent as current profile', async () => {
      renderWithProvider(<TestComponent />);

      const registerBtn = screen.getByTestId('register-btn');
      registerBtn.click();

      await waitFor(() => {
        expect(screen.getByTestId('current-profile')).toHaveTextContent('Ahmed');
      });
    });

    it('should mark registration as complete after parent registration', async () => {
      renderWithProvider(<TestComponent />);

      const registerBtn = screen.getByTestId('register-btn');
      registerBtn.click();

      await waitFor(() => {
        expect(screen.getByTestId('registration-status')).toHaveTextContent('complete');
      });
    });

    it('should persist parent profile to localStorage', async () => {
      renderWithProvider(<TestComponent />);

      const registerBtn = screen.getByTestId('register-btn');
      registerBtn.click();

      await waitFor(() => {
        const saved = localStorage.getItem('parentProfile');
        expect(saved).toBeTruthy();
        const parsed = JSON.parse(saved!);
        expect(parsed.name).toBe('Ahmed');
        expect(parsed.email).toBe('newparent@example.com');
      });
    });
  });

  describe('localStorage integration', () => {
    it('should restore current profile from localStorage', () => {
      localStorage.setItem('currentProfile', JSON.stringify({ id: '2', name: 'Waleed' }));

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('current-profile')).toHaveTextContent('Waleed');
    });

    it('should restore registration status from localStorage', () => {
      localStorage.setItem('isRegistrationComplete', 'true');

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId('registration-status')).toHaveTextContent('complete');
    });

    it('should restore parent profile from localStorage', () => {
      const parentData = { id: 'parent-1', name: 'Parent', type: 'parent' };
      localStorage.setItem('parentProfile', JSON.stringify(parentData));

      const TestComponent3 = () => {
        const { parentProfile } = useProfile();
        return <div data-testid="parent-name">{parentProfile?.name || 'no-parent'}</div>;
      };

      render(
        <ProfileProvider>
          <TestComponent3 />
        </ProfileProvider>
      );

      expect(screen.getByTestId('parent-name')).toHaveTextContent('Parent');
    });
  });

  describe('useProfile hook', () => {
    it('should throw error when used outside ProfileProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const TestComponentOutsideProvider = () => {
        const { currentProfile } = useProfile();
        return <div>{currentProfile.name}</div>;
      };

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useProfile must be used within a ProfileProvider');

      consoleError.mockRestore();
    });
  });
});
