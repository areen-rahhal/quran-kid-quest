import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern flex flex-col p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 islamic-pattern" />

      <div className="flex items-center mb-8 relative z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          <Card className="shadow-strong">
            <CardHeader className="space-y-2">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>Enter your information to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="parentName">Your Name</Label>
                <Input
                  id="parentName"
                  name="parentName"
                  type="text"
                  placeholder="e.g., Fatima"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  className={errors.parentName ? 'border-destructive' : ''}
                />
                {errors.parentName && <p className="text-sm text-destructive">{errors.parentName}</p>}
                <p className="text-xs text-muted-foreground">2–20 characters (Arabic or English)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full h-12 font-semibold bg-primary hover:bg-primary/90"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
