import { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RecipeCard } from '@/components/RecipeCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

const CULTURE_OPTIONS = ['Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'French', 'American', 'Thai', 'Greek', 'Ethiopian'];
const TAG_OPTIONS = ['Holiday', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Quick', 'Dessert', 'Comfort Food', 'Healthy'];

const SearchPage = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCultures, setSelectedCultures] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      setRecipes(data || []);
    };
    fetch();
  }, [user]);

  const filtered = recipes.filter((r) => {
    const matchesQuery =
      !query ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      (r.culture_origin || '').toLowerCase().includes(query.toLowerCase()) ||
      JSON.stringify(r.ingredients).toLowerCase().includes(query.toLowerCase());

    const matchesCulture =
      selectedCultures.length === 0 ||
      selectedCultures.some((c) => (r.culture_origin || '').toLowerCase() === c.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((t) => (r.tags || []).map((tag: string) => tag.toLowerCase()).includes(t.toLowerCase()));

    return matchesQuery && matchesCulture && matchesTags;
  });

  const toggleFilter = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const activeFilters = selectedCultures.length + selectedTags.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-heading font-bold text-foreground">Search</h1>
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, culture, ingredient..."
              className="pl-10 rounded-lg"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="min-w-[48px] min-h-[48px] relative">
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilters > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-body">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-auto">
              <SheetHeader>
                <SheetTitle className="font-heading">Filters</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div>
                  <h3 className="text-sm font-body font-semibold text-foreground mb-2">Culture</h3>
                  <div className="flex flex-wrap gap-2">
                    {CULTURE_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleFilter(c, selectedCultures, setSelectedCultures)}
                        className={`px-3 py-1.5 rounded-full text-xs font-body min-h-[36px] transition-colors ${
                          selectedCultures.includes(c)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-body font-semibold text-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleFilter(t, selectedTags, setSelectedTags)}
                        className={`px-3 py-1.5 rounded-full text-xs font-body min-h-[36px] transition-colors ${
                          selectedTags.includes(t)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilters > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCultures([]);
                      setSelectedTags([]);
                    }}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-1" /> Clear Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground font-body py-16">
            Sign in to search your recipes.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground font-body py-16">
            No recipes match your search.
          </p>
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

export default SearchPage;
