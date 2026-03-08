
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  culture_origin TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  instructions TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recipes" ON public.recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create recipe_media table
CREATE TABLE public.recipe_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'audio')),
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view media for their recipes" ON public.recipe_media FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload media" ON public.recipe_media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their media" ON public.recipe_media FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for recipe media
INSERT INTO storage.buckets (id, name, public) VALUES ('recipe-media', 'recipe-media', true);

CREATE POLICY "Anyone can view recipe media" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-media');
CREATE POLICY "Users can upload recipe media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their recipe media" ON storage.objects FOR UPDATE USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their recipe media" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_culture ON public.recipes(culture_origin);
CREATE INDEX idx_recipes_tags ON public.recipes USING GIN(tags);
CREATE INDEX idx_recipe_media_recipe_id ON public.recipe_media(recipe_id);
