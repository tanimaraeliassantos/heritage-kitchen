import { Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-kitchen.jpg';

interface RecipeCardProps {
  id: string;
  title: string;
  cultureOrigin?: string | null;
  imageUrl?: string | null;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
}

export function RecipeCard({
  id,
  title,
  cultureOrigin,
  imageUrl,
  prepTime,
  cookTime,
  servings,
}: RecipeCardProps) {
  const navigate = useNavigate();
  const totalTime = (prepTime || 0) + (cookTime || 0);

  return (
    <motion.button
      onClick={() => navigate(`/recipe/${id}`)}
      whileTap={{ scale: 0.97 }}
      className="group bg-card rounded-lg shadow-card overflow-hidden text-left w-full transition-shadow hover:shadow-elevated"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl || heroImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-3.5">
        <h3 className="font-heading font-semibold text-base text-foreground leading-tight line-clamp-2">
          {title}
        </h3>
        {cultureOrigin && (
          <span className="text-xs text-muted-foreground font-body mt-1.5 block">
            {cultureOrigin}
          </span>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {totalTime}m
            </span>
          )}
          {servings && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {servings}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
