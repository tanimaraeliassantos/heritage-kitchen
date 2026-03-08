import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RecipeCard } from '@/components/RecipeCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-kitchen.jpg';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchRecipes = async () => {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      setRecipes(data || []);
      setLoading(false);
    };
    fetchRecipes();
  }, [user]);

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.culture_origin || '').toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-[50vh] overflow-hidden">
          <img src={heroImage} alt="Heritage Kitchen" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 px-6">
            <h1 className="text-4xl font-heading font-bold text-foreground leading-tight">
              Heritage<br />Kitchen
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-2 max-w-[280px]">
              Preserve your family's recipes. Pass down the flavors that matter.
            </p>
          </div>
        </div>
        <div className="px-6 py-8 max-w-lg mx-auto space-y-4">
          <a
            href="/auth"
            className="block w-full bg-primary text-primary-foreground text-center py-4 rounded-lg font-body font-medium text-sm min-h-[48px] leading-[48px] shadow-card"
          >
            Get Started
          </a>
          <p className="text-center text-xs text-muted-foreground font-body">
            Your recipes stay private and secure.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-heading font-bold text-foreground">My Recipes</h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="pl-10 rounded-lg"
          />
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow-card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🍳</p>
            <p className="text-sm text-muted-foreground font-body">
              {search ? 'No recipes found.' : 'No recipes yet. Tap + to add your first!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                cultureOrigin={recipe.culture_origin}
                imageUrl={recipe.image_url}
                prepTime={recipe.prep_time_minutes}
                cookTime={recipe.cook_time_minutes}
                servings={recipe.servings}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
