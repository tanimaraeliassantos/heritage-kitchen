import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Plus, X, Link, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription';
import { scrapeRecipeFromUrl } from '@/utils/recipeScraper';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const STEPS = ['Details', 'Ingredients', 'Instructions', 'Review'];
const LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'zh-CN', label: '中文' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'ar-SA', label: 'العربية' },
];

export function RecipeForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');

  const [title, setTitle] = useState('');
  const [cultureOrigin, setCultureOrigin] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [ingredients, setIngredients] = useState<Array<{ name: string; amount: string; unit: string }>>([
    { name: '', amount: '', unit: '' },
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);

  const { isListening, startListening, stopListening, isSupported } = useVoiceTranscription({
    lang: voiceLang,
    continuous: true,
    onResult: (text) => {
      setInstructions((prev) => {
        const last = prev.length - 1;
        const updated = [...prev];
        updated[last] = (updated[last] + ' ' + text).trim();
        return updated;
      });
    },
    onError: (err) => toast.error(err),
  });

  const handleImport = async () => {
    if (!importUrl) return;
    setImporting(true);
    try {
      const data = await scrapeRecipeFromUrl(importUrl);
      setTitle(data.title);
      setIngredients(
        data.ingredients.map((i) => ({ name: i, amount: '', unit: '' }))
      );
      setInstructions(data.instructions);
      setShowImport(false);
      toast.success('Recipe imported!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to import recipe');
    } finally {
      setImporting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save recipes.');
      return;
    }
    if (!title.trim()) {
      toast.error('Please add a title.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('recipes').insert({
        user_id: user.id,
        title: title.trim(),
        culture_origin: cultureOrigin.trim() || null,
        ingredients: ingredients.filter((i) => i.name.trim()),
        instructions: instructions.filter((i) => i.trim()),
        tags: tags.length ? tags : null,
        prep_time_minutes: prepTime ? parseInt(prepTime) : null,
        cook_time_minutes: cookTime ? parseInt(cookTime) : null,
        servings: servings ? parseInt(servings) : null,
      });

      if (error) throw error;
      toast.success('Recipe saved!');
      navigate('/');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save recipe.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-lg font-heading font-bold text-foreground">New Recipe</h1>
          <button
            onClick={() => setShowImport(!showImport)}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center text-primary"
            aria-label="Import from URL"
          >
            <Link className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Import Section */}
        {showImport && (
          <div className="bg-card rounded-lg p-4 shadow-card mb-4 animate-fade-in">
            <Label className="text-sm font-body font-medium text-foreground">Import from URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                className="flex-1 rounded-sm"
              />
              <Button onClick={handleImport} disabled={importing} size="sm">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
              </Button>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
              <span className="text-[10px] text-muted-foreground font-body mt-1 block text-center">
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Step 0: Details */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label className="font-body text-sm">Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Grandma's Sunday Roast" className="mt-1 rounded-sm" />
            </div>
            <div>
              <Label className="font-body text-sm">Culture / Origin</Label>
              <Input value={cultureOrigin} onChange={(e) => setCultureOrigin(e.target.value)} placeholder="Italian, Mexican, etc." className="mt-1 rounded-sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="font-body text-sm">Prep (min)</Label>
                <Input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="mt-1 rounded-sm" />
              </div>
              <div>
                <Label className="font-body text-sm">Cook (min)</Label>
                <Input type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="mt-1 rounded-sm" />
              </div>
              <div>
                <Label className="font-body text-sm">Servings</Label>
                <Input type="number" value={servings} onChange={(e) => setServings(e.target.value)} className="mt-1 rounded-sm" />
              </div>
            </div>
            <div>
              <Label className="font-body text-sm">Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Holiday, Vegan, etc."
                  className="flex-1 rounded-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-body"
                    >
                      {tag}
                      <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Ingredients */}
        {step === 1 && (
          <div className="space-y-3 animate-fade-in">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    value={ing.amount}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[i].amount = e.target.value;
                      setIngredients(updated);
                    }}
                    placeholder="Amount"
                    className="rounded-sm"
                  />
                  <Input
                    value={ing.unit}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[i].unit = e.target.value;
                      setIngredients(updated);
                    }}
                    placeholder="Unit"
                    className="rounded-sm"
                  />
                  <Input
                    value={ing.name}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[i].name = e.target.value;
                      setIngredients(updated);
                    }}
                    placeholder="Ingredient"
                    className="rounded-sm"
                  />
                </div>
                <button
                  onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                  className="min-w-[48px] min-h-[48px] flex items-center justify-center text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIngredients([...ingredients, { name: '', amount: '', unit: '' }])}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Ingredient
            </Button>
          </div>
        )}

        {/* Step 2: Instructions */}
        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            {/* Voice language selector */}
            <div className="flex items-center gap-2">
              <Label className="font-body text-sm shrink-0">Voice lang:</Label>
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                className="text-sm border border-input bg-background rounded-sm px-2 py-1 font-body"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              {isSupported && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full ml-auto transition-colors ${
                    isListening ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
                  }`}
                  aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
            </div>
            {isListening && (
              <p className="text-xs text-primary font-body animate-pulse">🎙 Listening... speak your instructions</p>
            )}

            {instructions.map((inst, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-xs text-muted-foreground font-heading font-bold mt-3 min-w-[20px]">
                  {i + 1}.
                </span>
                <Textarea
                  value={inst}
                  onChange={(e) => {
                    const updated = [...instructions];
                    updated[i] = e.target.value;
                    setInstructions(updated);
                  }}
                  placeholder="Describe this step..."
                  className="flex-1 min-h-[60px] rounded-sm"
                  rows={2}
                />
                <button
                  onClick={() => setInstructions(instructions.filter((_, j) => j !== i))}
                  className="min-w-[48px] min-h-[48px] flex items-center justify-center text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInstructions([...instructions, ''])}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Step
            </Button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-lg p-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-foreground">{title || 'Untitled'}</h2>
              {cultureOrigin && <p className="text-sm text-muted-foreground font-body mt-1">{cultureOrigin}</p>}
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground font-body">
                {prepTime && <span>Prep: {prepTime}m</span>}
                {cookTime && <span>Cook: {cookTime}m</span>}
                {servings && <span>Serves: {servings}</span>}
              </div>
            </div>

            <div className="bg-card rounded-lg p-4 shadow-card">
              <h3 className="font-heading font-semibold text-foreground mb-2">Ingredients</h3>
              <ul className="space-y-1">
                {ingredients.filter((i) => i.name).map((ing, i) => (
                  <li key={i} className="text-sm font-body text-foreground">
                    {ing.amount} {ing.unit} {ing.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-lg p-4 shadow-card">
              <h3 className="font-heading font-semibold text-foreground mb-2">Instructions</h3>
              <ol className="space-y-2">
                {instructions.filter((i) => i).map((inst, i) => (
                  <li key={i} className="text-sm font-body text-foreground">
                    <span className="font-semibold text-primary mr-1">{i + 1}.</span> {inst}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 min-h-[48px]">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1 min-h-[48px]">
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving} className="flex-1 min-h-[48px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Save Recipe
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
