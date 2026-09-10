import React, { useCallback, useState } from 'react';
import { getConfig, loginWithPassword } from 'modelence/client';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { Link } from 'react-router-dom';
import Page from '@/client/components/Page';

export default function LoginPage() {
  return (
    <Page seo={{ title: 'Sign in', noindex: true }}>
      <div className="auth-space flex items-center justify-center min-h-full">
        <div className="auth-space-content w-full">
          <LoginForm />
        </div>
      </div>
    </Page>
  );
}

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const isSandboxEnv = getConfig('_system.env.type') === 'sandbox';
  const defaultDemoEmail = isSandboxEnv ? getConfig('example.modelenceDemoUsername') as string | undefined : undefined;
  const defaultDemoPassword = isSandboxEnv ? getConfig('example.modelenceDemoPassword') as string | undefined : undefined;

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    await loginWithPassword({ email, password });
  }, []);

  return (
    <Card className="auth-card w-full max-w-sm mx-auto bg-white">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          Sign in to your account
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="block mb-2">
              Email
            </Label>
            <Input 
              type="email" 
              name="email" 
              id="email"
              defaultValue={defaultDemoEmail}
              required
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password">
                Password
              </Label>
              {/* <Link
                to="reset-password"
                className="text-sm text-gray-600"
              >
                Forgot your password?
              </Link> */}
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                defaultValue={defaultDemoPassword}
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            className="w-full"
            type="submit"
          >
            Login
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-gray-900 underline hover:no-underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
