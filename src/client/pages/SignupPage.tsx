import React, { useCallback, useState } from 'react';
import { signupWithPassword } from 'modelence/client';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { Link } from 'react-router-dom';
import Page from '@/client/components/Page';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
  return (
    <Page seo={{ title: 'Sign up', noindex: true }}>
      <div className="auth-space flex items-center justify-center min-h-full">
        <div className="auth-space-content w-full">
          <SignupForm />
        </div>
      </div>
    </Page>
  );
}

function SignupForm() {
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [generatedCredentials, setGeneratedCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const generateAccount = () => {
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
    const generatedPassword = `${crypto.randomUUID().replace(/-/g, '').slice(0, 14)}!A9`;
    setEmail(`player-${token}@fifa-il.local`);
    setPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    setDisplayName(`Player${token.slice(0, 5)}`);
    setGeneratedCredentials(true);
  };

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formEmail = String(formData.get('email'));
    const formDisplayName = String(formData.get('displayName')).trim();
    const formPassword = String(formData.get('password'));
    const formConfirmPassword = String(formData.get('confirmPassword'));

    if (formPassword !== formConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!/^[\p{L}\p{N}_.-]{2,24}$/u.test(formDisplayName)) {
      toast.error('שם המשתמש צריך להכיל 2 עד 24 תווים: אותיות, מספרים, נקודה, מקף או קו תחתון');
      return;
    }

    try {
      await signupWithPassword({ email: formEmail, password: formPassword });
      localStorage.setItem('fifa-il.pending-display-name', formDisplayName);
      setIsSignupSuccess(true);
    } catch (error) {
      toast.error((error as Error).message || 'לא ניתן ליצור את המשתמש');
    }
  }, []);

  if (isSignupSuccess) {
    return (
      <Card className="auth-card w-full max-w-sm mx-auto bg-white text-gray-900">
        <CardHeader className="text-center"><CardTitle className="text-xl">Account created</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-gray-600">Your account has been created successfully.</p>
          <Link to="/login" className="w-full"><Button className="w-full">Sign in</Button></Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="auth-card w-full max-w-sm mx-auto bg-white text-gray-900">
      <CardHeader className="text-center"><CardTitle className="text-xl">Create an account</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
          <p className="mb-2 text-sm font-medium text-blue-900">לא רוצה לבחור פרטים לבד?</p>
          <button type="button" onClick={generateAccount} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">קבל משתמש אוטומטי</button>
          {generatedCredentials && <p className="mt-3 text-xs leading-5 text-blue-900">הפרטים נוצרו אוטומטית. שמור אותם במקום בטוח, כי לא ניתן לשחזר אותם לאחר היציאה מהעמוד.</p>}
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div><Label htmlFor="display-name" className="block mb-2">Username</Label><Input type="text" name="displayName" id="display-name" value={displayName} onChange={event => setDisplayName(event.target.value)} minLength={2} maxLength={24} pattern="[A-Za-z0-9_.-א-ת]{2,24}" required /></div>
          <div><Label htmlFor="email" className="block mb-2">Email</Label><Input type="email" name="email" id="email" value={email} onChange={event => setEmail(event.target.value)} required /></div>
          <div>
            <Label htmlFor="password" className="block mb-2">Password</Label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} name="password" id="password" value={password} onChange={event => setPassword(event.target.value)} className="pr-11" required />
              <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirm-password" className="block mb-2">Confirm password</Label>
            <div className="relative">
              <Input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" id="confirm-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="pr-11" required />
              <button type="button" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex items-start"><input id="consent-terms" type="checkbox" name="consent-terms" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300" required /><div className="ml-3 text-sm"><Label htmlFor="consent-terms" className="text-gray-600">I accept the <a className="font-medium text-blue-600 hover:underline" href="/terms" target="_blank">Terms and Conditions</a></Label></div></div>
          <Button className="w-full" type="submit">Create account</Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center"><p className="text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="text-gray-900 underline hover:no-underline font-medium">Sign in here</Link></p></CardFooter>
    </Card>
  );
}
