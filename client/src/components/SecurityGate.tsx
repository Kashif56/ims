import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SECURITY_CODE = '@A1traders786';
const SESSION_KEY = 'security_verified';

interface SecurityGateProps {
  children: React.ReactNode;
}

export function SecurityGate({ children }: SecurityGateProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already verified in this session
    const verified = sessionStorage.getItem(SESSION_KEY);
    if (verified === 'true') {
      setIsVerified(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === SECURITY_CODE) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsVerified(true);
      toast({
        title: 'Access Granted',
        description: 'Security code verified successfully.',
      });
    } else {
      toast({
        title: 'Access Denied',
        description: 'Invalid security code. Please try again.',
        variant: 'destructive',
      });
      setCode('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse">
          <Shield className="w-16 h-16 text-blue-600" />
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Security Verification</CardTitle>
            <CardDescription className="text-base">
              Please enter the security code to access the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter security code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-lg tracking-wider"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Shield className="w-4 h-4 mr-2" />
                Verify Access
              </Button>
            </form>
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 text-center">
                <strong>Security Notice:</strong> This code is required for every new session to prevent unauthorized access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
