import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Trash2, Pencil, X, Save, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UnitToggle } from '@/components/UnitToggle';
import { MediaUploader } from '@/components/MediaUploader';
import { convertUnit, type UnitSystem, parseIngredientAmount } from '@/utils/unitConverter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PageTransition } from '@/components/PageTransition';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-kitchen.jpg';

interface EditableRecipe {
  title: string;
  culture_origin: string;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  tags: string[];
  ingredients: any[];
  instructions: string[];
}

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<EditableRecipe | null>(null);

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

  const startEditing = () => {
    if (!recipe) return;
    setEditData({
      title: recipe.title || '',
      culture_origin: recipe.culture_origin || '',
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      tags: recipe.tags || [],
      ingredients: (recipe.ingredients as any[]).map((ing: any) =>
        typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`.trim()
      ),
      instructions: [...(recipe.instructions as string[])],
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditData(null);
  };

  const handleSave = async () => {
    if (!editData || !id) return;
    setSaving(true);
    const { error } = await supabase.from('recipes').update({
      title: editData.title,
      culture_origin: editData.culture_origin || null,
      prep_time_minutes: editData.prep_time_minutes,
      cook_time_minutes: editData.cook_time_minutes,
      servings: editData.servings,
      tags: editData.tags,
      ingredients: editData.ingredients as any,
      instructions: editData.instructions,
    }).eq('id', id);
    setSaving(false);
    if (error) {
      toast.error('Failed to save changes.');
    } else {
      toast.success('Recipe updated!');
      setEditing(false);
      setEditData(null);
      fetchData();
    }
  };

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

  const updateIngredient = (index: number, value: string) => {
    if (!editData) return;
    const updated = [...editData.ingredients];
    updated[index] = value;
    setEditData({ ...editData, ingredients: updated });
  };

  const addIngredient = () => {
    if (!editData) return;
    setEditData({ ...editData, ingredients: [...editData.ingredients, ''] });
  };

  const removeIngredient = (index: number) => {
    if (!editData) return;
    setEditData({ ...editData, ingredients: editData.ingredients.filter((_, i) => i !== index) });
  };

  const updateInstruction = (index: number, value: string) => {
    if (!editData) return;
    const updated = [...editData.instructions];
    updated[index] = value;
    setEditData({ ...editData, instructions: updated });
  };

  const addInstruction = () => {
    if (!editData) return;
    setEditData({ ...editData, instructions: [...editData.instructions, ''] });
  };

  const removeInstruction = (index: number) => {
    if (!editData) return;
    setEditData({ ...editData, instructions: editData.instructions.filter((_, i) => i !== index) });
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
        <p className="text-muted-foreground font-body text-base">Recipe not found.</p>
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
          <li key={i} className="text-base font-body text-foreground py-2 border-b border-border last:border-0">
            <span className="font-medium">{converted.value} {converted.unit}</span> {parsed.ingredient}
          </li>
        );
      }
      return (
        <li key={i} className="text-base font-body text-foreground py-2 border-b border-border last:border-0">
          {ing}
        </li>
      );
    }
    if (ing.amount && ing.unit) {
      const converted = convertUnit(parseFloat(ing.amount), ing.unit, unitSystem);
      return (
        <li key={i} className="text-base font-body text-foreground py-2 border-b border-border last:border-0">
          <span className="font-medium">{converted.value} {converted.unit}</span> {ing.name}
        </li>
      );
    }
    return (
      <li key={i} className="text-base font-body text-foreground py-2 border-b border-border last:border-0">
        {ing.amount} {ing.unit} {ing.name}
      </li>
    );
  };

  const isOwner = user && recipe.user_id === user.id;

  return (
    <PageTransition className="min-h-screen bg-background pb-8">
      {/* Hero */}
      <div className="relative h-[35vh] overflow-hidden">
        <img
          src={recipe.image_url || heroImage}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-12 h-12 min-w-[48px] min-h-[48px] bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
        {isOwner && !editing && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={startEditing}
            className="absolute top-4 right-4 w-12 h-12 min-w-[48px] min-h-[48px] bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card"
            aria-label="Edit recipe"
          >
            <Pencil className="w-4 h-4 text-foreground" />
          </motion.button>
        )}
      </div>

      <div className="px-4 max-w-lg mx-auto -mt-8 relative z-10">
        {/* Edit mode toolbar */}
        {editing && editData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mb-4"
          >
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="outline" onClick={cancelEditing} disabled={saving}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </motion.div>
        )}

        {/* Title */}
        {editing && editData ? (
          <Input
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="text-2xl font-heading font-bold rounded-pill h-12 px-5"
            placeholder="Recipe title"
          />
        ) : (
          <h1 className="text-2xl font-heading font-bold text-foreground">{recipe.title}</h1>
        )}

        {/* Culture Origin */}
        {editing && editData ? (
          <Input
            value={editData.culture_origin}
            onChange={(e) => setEditData({ ...editData, culture_origin: e.target.value })}
            className="mt-2 text-base font-body rounded-pill h-12 px-5"
            placeholder="Culture / Origin"
          />
        ) : (
          recipe.culture_origin && (
            <p className="text-base text-muted-foreground font-body mt-1">{recipe.culture_origin}</p>
          )
        )}

        {/* Meta */}
        {editing && editData ? (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div>
              <label className="text-xs text-muted-foreground font-body">Prep (min)</label>
              <Input
                type="number"
                value={editData.prep_time_minutes ?? ''}
                onChange={(e) => setEditData({ ...editData, prep_time_minutes: e.target.value ? parseInt(e.target.value) : null })}
                className="rounded-pill h-12 px-4"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body">Cook (min)</label>
              <Input
                type="number"
                value={editData.cook_time_minutes ?? ''}
                onChange={(e) => setEditData({ ...editData, cook_time_minutes: e.target.value ? parseInt(e.target.value) : null })}
                className="rounded-pill h-12 px-4"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-body">Servings</label>
              <Input
                type="number"
                value={editData.servings ?? ''}
                onChange={(e) => setEditData({ ...editData, servings: e.target.value ? parseInt(e.target.value) : null })}
                className="rounded-pill h-12 px-4"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground font-body">
            {totalTime > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {totalTime} min
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {recipe.servings} servings
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {editing && editData ? (
          <div className="mt-3">
            <label className="text-xs text-muted-foreground font-body">Tags (comma-separated)</label>
            <Input
              value={editData.tags.join(', ')}
              onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              placeholder="e.g. Mexican, Holiday, Vegan"
              className="rounded-pill h-12 px-5"
            />
          </div>
        ) : (
          recipe.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {recipe.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-primary/15 text-primary px-3 py-1.5 rounded-pill font-body font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )
        )}

        {/* Ingredients */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-heading font-bold text-foreground">Ingredients</h2>
            {!editing && <UnitToggle value={unitSystem} onChange={setUnitSystem} />}
          </div>
          <div className="bg-card rounded-lg shadow-card p-4">
            {editing && editData ? (
              <div className="space-y-2">
                {editData.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`.trim()}
                      onChange={(e) => updateIngredient(i, e.target.value)}
                      className="flex-1 text-base font-body rounded-pill h-12 px-5"
                      placeholder="e.g. 200g flour"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeIngredient(i)}
                      className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 shrink-0"
                      aria-label="Remove ingredient"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addIngredient} className="w-full mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Add Ingredient
                </Button>
              </div>
            ) : (
              <ul>
                {(recipe.ingredients as any[]).map((ing, i) => renderIngredient(ing, i))}
              </ul>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8">
          <h2 className="text-lg font-heading font-bold text-foreground mb-3">Instructions</h2>
          {editing && editData ? (
            <div className="space-y-3">
              {editData.instructions.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-body font-semibold flex items-center justify-center shrink-0 mt-1">
                    {i + 1}
                  </div>
                  <Textarea
                    value={step}
                    onChange={(e) => updateInstruction(i, e.target.value)}
                    className="flex-1 text-base font-body min-h-[60px] rounded-md"
                    placeholder="Describe this step…"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeInstruction(i)}
                    className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 shrink-0 mt-1"
                    aria-label="Remove step"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addInstruction} className="w-full">
                <Plus className="w-4 h-4 mr-1" /> Add Step
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {(recipe.instructions as string[]).map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-body font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-base font-body text-foreground leading-relaxed">{step}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Memories */}
        <div className="mt-10">
          <h2 className="text-lg font-heading font-bold text-foreground mb-1">Memories</h2>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Attach photos, videos, or voice notes to preserve the story behind this recipe.
          </p>

          {user && <MediaUploader recipeId={recipe.id} onUpload={fetchData} />}

          {media.length > 0 && (
            <div className="mt-4 space-y-3">
              {media.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-lg shadow-card overflow-hidden"
                >
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
                    <p className="px-3 py-2 text-sm text-muted-foreground font-body">{m.caption}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        {isOwner && !editing && (
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="w-full mt-10 text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Recipe
          </Button>
        )}
      </div>
    </PageTransition>
  );
};

export default RecipeDetail;
