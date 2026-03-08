import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { motion } from 'framer-motion';

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) throw error;

      if (isSignUp) {
        toast.success('Check your email to confirm your account!');
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-background flex flex-col">
      <div className="px-4 py-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="min-w-[48px] min-h-[48px] flex items-center justify-center text-foreground rounded-pill"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Form pushed toward bottom for thumb reach */}
      <div className="flex-1 flex flex-col justify-end px-6 pb-12">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-base text-muted-foreground font-body mb-8">
            {isSignUp
              ? 'Start preserving your family recipes.'
              : 'Sign in to your recipe vault.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="font-body text-sm">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1.5 rounded-pill h-12 px-5"
              />
            </div>
            <div>
              <Label className="font-body text-sm">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1.5 rounded-pill h-12 px-5"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-body mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold underline-offset-2 hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
