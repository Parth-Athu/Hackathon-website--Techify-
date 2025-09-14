import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('reset') === 'true') setIsResetMode(true);
  }, [searchParams]);

  useEffect(() => {
    if (user && !loading) navigate('/');
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isResetMode) {
        const { error } = await resetPassword(email);
        if (error) setError(error);
        else setIsResetMode(false);
      } else if (isSignUp) {
        const { error } = await signUp(email, password, { full_name: fullName });
        if (error) setError(error);
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) setError(error);
      else {
        setError('');
        alert('Password reset instructions sent to your email!');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex justify-center items-center p-5"
      style={{
        background: `linear-gradient(rgba(95, 89, 86, 0.8), rgba(202, 189, 189, 0.8)), 
                      url('/images/login-background.jpg') no-repeat center center fixed`,
        backgroundSize: 'cover'
      }}
    >
      {/* Main Container */}
      <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden backdrop-blur-sm">
        {/* Logo & Title Section */}
        <div className="text-center px-5 py-6 bg-gradient-to-br from-[#fbeed7] to-[#dbd4c4]">
          <div className="inline-flex items-center justify-center w-[70px] h-[70px] bg-white rounded-full shadow-lg mb-4">
            <img src="/images/logo.png" alt="Tree Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-[36px] font-serif font-extrabold text-[#582b0a] mb-1 flex items-center justify-center gap-1">
            <span className="font-serif">देसी</span>
            <span className="font-serif text-orange-600">Roots</span>
          </h1>
          <p className="text-[16px] text-[#4b1717] opacity-90 font-medium">
            {isResetMode 
              ? 'Enter your email to reset password'
              : isSignUp 
                ? 'Create your account to continue' 
                : 'Sign in to your account to continue'
            }
          </p>
        </div>

        {/* Form Container */}
        <div className="p-[30px_25px]">
          <form onSubmit={handleSubmit}>
            {/* Full Name Field (only for sign up) */}
            {isSignUp && !isResetMode && (
              <div className="mb-[22px]">
                <Label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-[#3f0101] mb-2"
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-[15px] border-2 border-[#e6eeff] rounded-[10px] text-base bg-[#f8fbff] focus:border-[#a1c4fd] focus:ring-2 focus:ring-[#a1c4fd]/30 transition-all duration-300"
                  required={isSignUp}
                  disabled={isLoading}
                />
              </div>
            )}
            {/* Email Field */}
            <div className="mb-[22px]">
              <Label
                htmlFor="email"
                className="block text-sm font-semibold text-[#3f0101] mb-2"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-[15px] border-2 border-[#e6eeff] rounded-[10px] text-base bg-[#f8fbff] focus:border-[#a1c4fd] focus:ring-2 focus:ring-[#a1c4fd]/30 transition-all duration-300"
                required
                disabled={isLoading}
              />
            </div>
            {/* Password Field */}
            {!isResetMode && (
              <div className="mb-[22px]">
                <Label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#3f0101] mb-2"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-[15px] pr-12 border-2 border-[#e6eeff] rounded-[10px] text-base bg-[#f8fbff] focus:border-[#a1c4fd] focus:ring-2 focus:ring-[#a1c4fd]/30 transition-all duration-300"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[15px] top-1/2 transform -translate-y-1/2 text-[#a3b2cc] hover:text-[#617ba7] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
            {/* Error Message */}
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-[10px] p-3">
                {error}
              </div>
            )}
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full p-[15px] bg-gradient-to-r from-[#551111c2] to-[#af464fd5] text-white border-0 rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(71,172,71,0.4)] active:transform active:translate-y-0 mt-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Please wait...
                </>
              ) : isResetMode ? (
                'Send Reset Email'
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign in'
              )}
            </Button>
            {/* Links */}
            <div className="mt-[22px] text-center">
              {!isResetMode && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                      setEmail('');
                      setPassword('');
                      setFullName('');
                    }}
                    className="text-[#a54e4e94] font-semibold text-sm inline-block my-1.5 transition-colors hover:text-[#9e2222bb] hover:underline bg-transparent border-0 cursor-pointer"
                    disabled={isLoading}
                  >
                    {isSignUp
                      ? "Already have an account? Sign In"
                      : "Don't have an account? Create Account"
                    }
                  </button>
                  <br />
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[#a54e4e94] font-semibold text-sm inline-block my-1.5 transition-colors hover:text-[#9e2222bb] hover:underline bg-transparent border-0 cursor-pointer"
                      disabled={isLoading}
                    >
                      Forgot your password?
                    </button>
                  )}
                </>
              )}
              {isResetMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setError('');
                  }}
                  className="text-[#a54e4e94] font-semibold text-sm inline-block my-1.5 transition-colors hover:text-[#9e2222bb] hover:underline bg-transparent border-0 cursor-pointer"
                  disabled={isLoading}
                >
                  Back to Sign In
                </button>
              )}
            </div>
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#e6eeff] to-transparent my-7" />
            {/* Terms */}
            <div className="text-center text-xs text-[#a3b2cc] mt-[22px] leading-6">
              By continuing you agree to our{' '}
              <Link to="/terms" className="text-[#7a8fb1] hover:text-[#617ba7] hover:underline transition-colors">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-[#7a8fb1] hover:text-[#617ba7] hover:underline transition-colors">
                Privacy Policy
              </Link>
              .
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
