import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const MOCK_OTP = '111111';
const RESEND_COOLDOWN = 60;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { parentProfile } = useProfile();
  const { toast } = useToast();

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!parentProfile) {
      navigate('/register');
    }
  }, [parentProfile, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError('');
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (otp === MOCK_OTP) {
        setIsVerified(true);
        toast({
          title: 'Email verified!',
          description: 'Redirecting to your dashboard...',
        });

        // Redirect after showing success message
        setTimeout(() => {
          navigate('/onboarding');
        }, 1500);
      } else {
        setError('Invalid code. Please try again. (Hint: 111111)');
        setOtp('');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    toast({
      title: 'Code sent',
      description: 'A new verification code has been sent to your email.',
    });
    setResendCooldown(RESEND_COOLDOWN);
  };

  const handleBack = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern flex flex-col p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 islamic-pattern" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <button
          onClick={handleBack}
          disabled={isVerified}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <span className="text-sm font-medium text-muted-foreground">Email Verification</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md">
          {!isVerified ? (
            <Card className="shadow-strong">
              <CardHeader className="space-y-4">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-2">
                  <BookOpen className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                  <CardDescription>
                    We sent a verification code to {parentProfile?.email}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Enter verification code</label>
                  <div className="flex justify-center py-4">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={handleOtpChange}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map(index => (
                          <InputOTPSlot key={index} index={index} className="h-12 w-12 text-lg" />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleVerify}
                    disabled={isLoading || otp.length < 6}
                    className="w-full h-12 font-semibold bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Didn't receive a code? </span>
                    <button
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || isLoading}
                      className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                    </button>
                  </div>
                </div>

                <div className="bg-accent/30 border border-accent/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground text-center">
                    <strong>Demo hint:</strong> Use code <code className="bg-white px-2 py-1 rounded font-mono">111111</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-strong">
              <CardContent className="pt-10 pb-10 flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
                  <p className="text-muted-foreground">Redirecting to your dashboard...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
