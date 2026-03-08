import { useState, useRef } from 'react';
import { Camera, Video, Mic, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MediaUploaderProps {
  recipeId: string;
  onUpload: () => void;
}

export function MediaUploader({ recipeId, onUpload }: MediaUploaderProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<'photo' | 'video' | 'audio'>('photo');

  const acceptMap = {
    photo: 'image/*',
    video: 'video/*',
    audio: 'audio/*',
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${recipeId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('recipe-media')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('recipe-media')
        .getPublicUrl(path);

      const { error: dbError } = await supabase.from('recipe_media').insert({
        recipe_id: recipeId,
        user_id: user.id,
        file_url: urlData.publicUrl,
        media_type: selectedType,
        caption: caption.trim() || null,
      });

      if (dbError) throw dbError;

      toast.success('Memory added!');
      setCaption('');
      onUpload();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {([
          { type: 'photo' as const, icon: Camera, label: 'Photo' },
          { type: 'video' as const, icon: Video, label: 'Video' },
          { type: 'audio' as const, icon: Mic, label: 'Audio' },
        ]).map(({ type, icon: Icon, label }) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type)}
            className="flex-1 min-h-[48px]"
          >
            <Icon className="w-4 h-4 mr-1" />
            {label}
          </Button>
        ))}
      </div>
      <Input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Add a caption..."
        className="rounded-sm"
      />
      <input
        ref={fileRef}
        type="file"
        accept={acceptMap[selectedType]}
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        variant="outline"
        className="w-full min-h-[48px]"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
        {uploading ? 'Uploading...' : `Upload ${selectedType}`}
      </Button>
    </div>
  );
}
