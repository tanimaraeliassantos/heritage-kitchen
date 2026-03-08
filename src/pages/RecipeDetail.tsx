import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UnitToggle } from '@/components/UnitToggle';
import { MediaUploader } from '@/components/MediaUploader';
import { convertUnit, type UnitSystem, parseIngredientAmount } from '@/utils/unitConverter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-kitchen.jpg';

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    const [recipeRes, mediaRes] = await Promise.all([
      supabase.from('recipes').select('*').eq('id', id).single(),
      supabase.from('recipe_media').select('*').eq('recipe_id', id).order('created_at', { ascending: false }),
    ]);
    setRecipe(recipeRes.data);
    setMedia(mediaRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this recipe permanently?')) return;
    const { error } = await supabase.from('recipes').delete().eq('id', id!);
    if (error) {
      toast.error('Failed to delete.');
    } else {
      toast.success('Recipe deleted.');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground font-body">Recipe not found.</p>
      </div>
    );
  }

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);

  const renderIngredient = (ing: any, i: number) => {
    if (typeof ing === 'string') {
      const parsed = parseIngredientAmount(ing);
      if (parsed.amount && parsed.unit) {
        const converted = convertUnit(parsed.amount, parsed.unit, unitSystem);
        return (
          <li key={i} className="text-sm font-body text-foreground py-1.5 border-b border-border last:border-0">
            <span className="font-medium">{converted.value} {converted.unit}</span> {parsed.ingredient}
          </li>
        );
      }
      return (
        <li key={i} className="text-sm font-body text-foreground py-1.5 border-b border-border last:border-0">
          {ing}
        </li>
      );
    }
    // Object format: { name, amount, unit }
    if (ing.amount && ing.unit) {
      const converted = convertUnit(parseFloat(ing.amount), ing.unit, unitSystem);
      return (
        <li key={i} className="text-sm font-body text-foreground py-1.5 border-b border-border last:border-0">
          <span className="font-medium">{converted.value} {converted.unit}</span> {ing.name}
        </li>
      );
    }
    return (
      <li key={i} className="text-sm font-body text-foreground py-1.5 border-b border-border last:border-0">
        {ing.amount} {ing.unit} {ing.name}
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Hero */}
      <div className="relative h-[35vh] overflow-hidden">
        <img
          src={recipe.image_url || heroImage}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="px-4 max-w-lg mx-auto -mt-8 relative z-10">
        <h1 className="text-2xl font-heading font-bold text-foreground">{recipe.title}</h1>
        {recipe.culture_origin && (
          <p className="text-sm text-muted-foreground font-body mt-1">{recipe.culture_origin}</p>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-body">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {totalTime} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {recipe.servings} servings
            </span>
          )}
        </div>

        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {recipe.tags.map((tag: string) => (
              <span key={tag} className="text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-body">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Ingredients */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-heading font-bold text-foreground">Ingredients</h2>
            <UnitToggle value={unitSystem} onChange={setUnitSystem} />
          </div>
          <div className="bg-card rounded-lg shadow-card p-4">
            <ul>
              {(recipe.ingredients as any[]).map((ing, i) => renderIngredient(ing, i))}
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8">
          <h2 className="text-lg font-heading font-bold text-foreground mb-3">Instructions</h2>
          <div className="space-y-4">
            {(recipe.instructions as string[]).map((step, i) => (
              <div key={i} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-body font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm font-body text-foreground leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Time Capsule - Memories */}
        <div className="mt-10">
          <h2 className="text-lg font-heading font-bold text-foreground mb-1">Memories</h2>
          <p className="text-xs text-muted-foreground font-body mb-4">
            Attach photos, videos, or voice notes to preserve the story behind this recipe.
          </p>

          {user && <MediaUploader recipeId={recipe.id} onUpload={fetchData} />}

          {media.length > 0 && (
            <div className="mt-4 space-y-3">
              {media.map((m) => (
                <div key={m.id} className="bg-card rounded-lg shadow-card overflow-hidden">
                  {m.media_type === 'photo' && (
                    <img src={m.file_url} alt={m.caption || 'Memory'} className="w-full aspect-video object-cover" loading="lazy" />
                  )}
                  {m.media_type === 'video' && (
                    <video src={m.file_url} controls className="w-full aspect-video" />
                  )}
                  {m.media_type === 'audio' && (
                    <div className="p-4">
                      <audio src={m.file_url} controls className="w-full" />
                    </div>
                  )}
                  {m.caption && (
                    <p className="px-3 py-2 text-xs text-muted-foreground font-body">{m.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <Button
          variant="ghost"
          onClick={handleDelete}
          className="w-full mt-10 text-destructive min-h-[48px]"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Recipe
        </Button>
      </div>
    </div>
  );
};

export default RecipeDetail;
