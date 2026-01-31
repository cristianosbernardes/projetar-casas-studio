import { Link } from 'react-router-dom';
import { Bed, Bath, Car, Maximize, MapPin, Heart } from 'lucide-react'; // Import Heart
import type { ProjectWithImages } from '@/types/database';
import { getOptimizedImageUrl } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Import Button
import { useFavorites } from '@/contexts/FavoritesContext';

interface ProjectCardProps {
  project: ProjectWithImages;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const coverImage = project.project_images?.find(img => img.is_cover) || project.project_images?.[0];
  const secondImage = project.project_images?.find(img => img.id !== coverImage?.id);

  // Fallback: try to extract code from title if project.code is missing
  // Looks for "Cód. 123" OR just a number at the end of the title "Title 123"
  // Does not match if it looks like square meters (e.g. 100m²)
  const titleMatch = project.title.match(/(?:Cód\.?|Ref\.?)\s*(\d+)|(?:^|\s)(\d+)$/i);
  const displayCode = project.code || titleMatch?.[1] || titleMatch?.[2];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    toggleFavorite(project.id);
  };

  const isFav = isFavorite(project.id); // Check status

  return (
    <Link to={`/projeto/${project.slug}`} className="group block h-full">
      <article className="bg-[#F3F4F6] rounded-xl shadow-md border border-gray-200 overflow-hidden transform transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/50 group-hover:-translate-y-1 h-full flex flex-col relative">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm backdrop-blur-sm"
            aria-label="Favoritar projeto"
          >
            <Heart className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {coverImage ? (
            <>
              <img
                src={getOptimizedImageUrl(coverImage.image_url, { width: 600, quality: 80 })}
                alt={project.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {secondImage && (
                <img
                  src={getOptimizedImageUrl(secondImage.image_url, { width: 600, quality: 80 })}
                  alt={`${project.title} - Vista secundária`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-3 pb-2 border-b border-gray-100 bg-gray-50/30 flex flex-col gap-3">

          {/* Header Row: Badges & Code */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {project.is_featured && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-sm px-2.5 py-0.5 text-[11px] h-6 font-semibold">Destaque</Badge>
              )}
              <Badge variant="outline" className="bg-white text-gray-800 border-gray-300 text-[11px] px-2.5 py-0.5 h-6 font-semibold">
                {project.style || 'Moderno'}
              </Badge>
            </div>
            {displayCode && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-gray-200 shadow-sm">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cód.</span>
                <span className="text-xs font-bold text-gray-900">{displayCode}</span>
              </div>
            )}
          </div>

          {/* Title - Aumentado para legibilidade */}
          <h3 className="text-lg font-extrabold text-gray-900 leading-snug tracking-tight line-clamp-2 min-h-[3rem]">
            {project.title}
          </h3>

          {/* Terrain dimensions Line - Ícone e texto maior */}
          <div className="flex items-center gap-2 text-gray-600 bg-white/50 p-1.5 rounded-md border border-gray-100/50">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">
              Terreno: <span className="text-gray-900 font-bold text-sm ml-1">{project.width_meters}m x {project.depth_meters}m</span>
            </span>
          </div>

          {/* Visual Stats Grid - Ícones e Números GRANDES - Compactado para números grandes */}
          <div className="grid grid-cols-4 gap-1.5 mt-auto">
            <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-green-300 transition-colors group/stat">
              <Bed className="h-4.5 w-4.5 text-gray-500 group-hover/stat:text-green-600 mb-0.5 transition-colors" />
              <span className="font-extrabold text-gray-900 text-sm leading-none">{project.bedrooms}</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">Quartos</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-green-300 transition-colors group/stat">
              <Bath className="h-4.5 w-4.5 text-gray-500 group-hover/stat:text-green-600 mb-0.5 transition-colors" />
              <span className="font-extrabold text-gray-900 text-sm leading-none">{project.bathrooms}</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">Banh.</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-green-300 transition-colors group/stat">
              <Car className="h-4.5 w-4.5 text-gray-500 group-hover/stat:text-green-600 mb-0.5 transition-colors" />
              <span className="font-extrabold text-gray-900 text-sm leading-none">{project.garage_spots}</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">Vagas</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-green-300 transition-colors group/stat">
              <Maximize className="h-4.5 w-4.5 text-gray-500 group-hover/stat:text-green-600 mb-0.5 transition-colors" />
              <span className="font-extrabold text-gray-900 text-sm leading-none tracking-tight">{project.built_area}m²</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide mt-0.5">Área</span>
            </div>
          </div>
        </div>

        {/* Footer Price Section - Preço com muito destaque */}
        <div className="p-3 pt-0 bg-gray-50/30">
          <div className="bg-white border border-green-200 rounded-lg p-3 flex items-center justify-between shadow-sm group-hover:border-green-400 group-hover:shadow-md transition-all">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">A partir de</span>
              <span className="text-xl font-black text-gray-900 tracking-tight">{formatPrice(project.price)}</span>
            </div>
            <div className="bg-primary text-white text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-wide flex items-center shadow-sm group-hover:shadow-md transform group-hover:-translate-y-0.5 transition-all">
              Ver Detalhes
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProjectCard;
