import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as authApi from '@/api/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Call the forgot-password API
      const response = await authApi.forgotPassword(email);
      console.log('[Forgot Password Response]', response);
      
      // Get the reset token from the response
      const resetToken = response.token || '';
      
      if (!resetToken) {
        setError('No reset token received. Please try again.');
        setLoading(false);
        return;
      }
      
      setSubmitted(true);
      
      // Redirect to reset password page after a delay
      // Pass email and token from the API response
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { 
            email,
            token: resetToken
          } 
        });
      }, 2000);
    } catch (err: unknown) {
      console.error('[Forgot Password Error]', err);
      
      // Extract error message from axios error response
      let errorMsg = 'Failed to send reset email. Please try again.';
      
      if (err instanceof Error) {
        if ('response' in err) {
          const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
          errorMsg = axiosErr.response?.data?.message || axiosErr.response?.data?.error || err.message;
        } else {
          errorMsg = err.message;
        }
      }
      
      setError(errorMsg);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Elearning Platform</span>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">Forgot password?</h2>
                <p className="text-muted-foreground">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm animate-fade-in">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Reset Link
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Check your email</h3>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full"
              >
                Send again
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
