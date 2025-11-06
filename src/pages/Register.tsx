import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/contexts/ProfileContext';
import { AVATAR_OPTIONS } from '@/utils/avatars';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const navigate = useNavigate();
  const { registerParent } = useProfile();
  const { toast } = useToast();

  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    parentName: '',
    avatar: AVATAR_OPTIONS[0].id, // Default avatar, will be set in onboarding
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Name is required';
    } else if (formData.parentName.trim().length < 2) {
      newErrors.parentName = 'Name must be at least 2 characters';
    } else if (formData.parentName.trim().length > 20) {
      newErrors.parentName = 'Name must not exceed 20 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 800));

      registerParent({
        email: formData.email,
        password: formData.password,
        parentName: formData.parentName,
        avatar: formData.avatar,
      });

      toast({
        title: 'Registration successful!',
        description: 'Proceeding to email verification...',
      });

      // Navigate to email verification
      navigate('/verify-email');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Islamic Pattern Background */}
      <div className="islamic-pattern absolute inset-0 opacity-20"></div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-strong">
            <BookOpen className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            Create Account
          </h1>
          <p className="text-primary-foreground/90 text-base">
            Enter your information to get started
          </p>
        </div>

        {/* Form */}
        <form className="space-y-3">
          <div className="space-y-3">
            <Input
              id="parentName"
              name="parentName"
              type="text"
              placeholder="Your Name"
              value={formData.parentName}
              onChange={handleInputChange}
              className="h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-medium placeholder:text-muted-foreground"
            />
            {errors.parentName && <p className="text-sm text-destructive px-1">{errors.parentName}</p>}

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-medium placeholder:text-muted-foreground"
            />
            {errors.email && <p className="text-sm text-destructive px-1">{errors.email}</p>}

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-medium placeholder:text-muted-foreground"
            />
            {errors.password && <p className="text-sm text-destructive px-1">{errors.password}</p>}

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="h-14 text-base bg-white/95 backdrop-blur-sm border-0 shadow-medium placeholder:text-muted-foreground"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive px-1">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full h-14 text-base font-semibold bg-white text-primary hover:bg-white/90 shadow-strong mt-6"
            size="lg"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </div>

      {/* Back Button */}
      <div className="relative z-10 text-center mt-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-primary-foreground/90 underline underline-offset-2 hover:text-primary-foreground transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Register;
