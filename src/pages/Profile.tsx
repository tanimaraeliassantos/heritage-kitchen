import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center px-6">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-heading font-bold text-foreground mb-2">Sign in</h1>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Sign in to manage your family recipes.
          </p>
          <Button onClick={() => navigate('/auth')} className="min-h-[48px] w-full max-w-[240px]">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-heading font-bold text-foreground">Profile</h1>

        <div className="mt-6 bg-card rounded-lg shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-body font-medium text-foreground text-sm">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="w-full min-h-[48px] text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
