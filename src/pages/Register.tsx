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

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    parentName: '',
    avatar: AVATAR_OPTIONS[0].id,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

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

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Name is required';
    } else if (formData.parentName.trim().length < 2) {
      newErrors.parentName = 'Name must be at least 2 characters';
    } else if (formData.parentName.trim().length > 20) {
      newErrors.parentName = 'Name must not exceed 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleStep2Next = () => {
    if (validateStep2()) {
      setStep(3);
      setErrors({});
    }
  };

  const handleRegister = async () => {
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
    if (step === 1) {
      navigate('/');
    } else {
      setStep(step - 1);
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern flex flex-col p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 islamic-pattern" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <span className="text-sm font-medium text-muted-foreground">Step {step} of 3</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          {/* Step 1: Email & Password */}
          {step === 1 && (
            <Card className="shadow-strong">
              <CardHeader className="space-y-2">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription>Enter your email and create a secure password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
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
                  onClick={handleStep1Next}
                  className="w-full h-12 font-semibold bg-primary hover:bg-primary/90"
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Parent Name & Avatar */}
          {step === 2 && (
            <Card className="shadow-strong">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Set Up Your Profile</CardTitle>
                <CardDescription>Choose a name and avatar for your parent profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <p className="text-xs text-muted-foreground mt-1">2–20 characters (Arabic or English)</p>
                </div>

                <div className="space-y-3">
                  <Label>Choose Your Avatar</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {AVATAR_OPTIONS.map(avatar => (
                      <button
                        key={avatar.id}
                        onClick={() => setFormData(prev => ({ ...prev, avatar: avatar.id }))}
                        className={`p-4 rounded-xl transition-all border-2 flex flex-col items-center gap-2 ${
                          formData.avatar === avatar.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${avatar.color}`}>
                          {avatar.emoji}
                        </div>
                        <span className="text-xs font-medium text-foreground">{avatar.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 h-12 font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleStep2Next}
                    className="flex-1 h-12 font-semibold bg-primary hover:bg-primary/90"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <Card className="shadow-strong">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Review Your Details</CardTitle>
                <CardDescription>Make sure everything looks correct before registering</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="bg-accent/30 p-4 rounded-lg space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold text-foreground">{formData.email}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Parent Name</p>
                    <p className="text-sm font-semibold text-foreground">{formData.parentName}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-3">Avatar</p>
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center text-4xl bg-primary/10">
                      {AVATAR_OPTIONS.find(a => a.id === formData.avatar)?.emoji}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 h-12 font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="flex-1 h-12 font-semibold bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
