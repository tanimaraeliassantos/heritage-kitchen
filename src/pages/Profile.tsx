import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <PageTransition className="min-h-screen bg-background flex flex-col justify-end pb-12 px-6">
        <div className="text-center max-w-sm mx-auto">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-heading font-bold text-foreground mb-2">Sign in</h1>
          <p className="text-base text-muted-foreground font-body mb-6">
            Sign in to manage your family recipes.
          </p>
          <Button onClick={() => navigate('/auth')} className="w-full max-w-[280px]" size="lg">
            Sign In
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-background pb-28">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-heading font-bold text-foreground">Profile</h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 bg-card rounded-lg shadow-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-body font-medium text-foreground text-base">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sign out at bottom for thumb access */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="w-full text-destructive"
            size="lg"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
