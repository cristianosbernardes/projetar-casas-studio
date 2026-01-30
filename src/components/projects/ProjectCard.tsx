import { Link } from 'react-router-dom';
import { Bed, Bath, Car, Maximize, MapPin, ArrowRight } from 'lucide-react';
import type { ProjectWithImages } from '@/types/database';
import { getOptimizedImageUrl } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: ProjectWithImages;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const coverImage = project.project_images?.find(img => img.is_cover) || project.project_images?.[0];

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

  return (
    <Link to={`/projeto/${project.slug}`} className="group block h-full">
      <article className="bg-[#F3F4F6] rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-300 group-hover:shadow-2xl group-hover:border-primary/50 group-hover:-translate-y-1 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          {coverImage ? (
            <img
              src={getOptimizedImageUrl(coverImage.image_url, { width: 600, quality: 80 })}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Content Body matches Price Card Layout */}
        <div className="flex-1 p-6 pb-4 border-b border-gray-100 bg-gray-50/30 flex flex-col gap-4">

          {/* Header Row: Badges & Code */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {project.is_featured && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-sm px-2 text-[10px]">Destaque</Badge>
              )}
              <Badge variant="outline" className="bg-white text-gray-700 border-gray-200 text-[10px]">
                {project.style || 'Moderno'}
              </Badge>
            </div>
            {displayCode && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Cód.</span>
                <span className="text-xs font-bold text-gray-900">{displayCode}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-extrabold text-gray-900 leading-tight tracking-tight line-clamp-2">
            {project.title}
          </h3>

          {/* Terrain dimensions Line */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              Terreno mín: <span className="text-gray-900 font-bold">{project.width_meters}m x {project.depth_meters}m</span>
            </span>
          </div>

          {/* Visual Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mt-auto">
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-green-200 transition-colors group/stat">
              <Bed className="h-3.5 w-3.5 text-gray-400 group-hover/stat:text-green-500 mb-0.5 transition-colors" />
              <span className="font-bold text-gray-900 text-xs leading-none">{project.bedrooms}</span>
              <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Quartos</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-green-200 transition-colors group/stat">
              <Bath className="h-3.5 w-3.5 text-gray-400 group-hover/stat:text-green-500 mb-0.5 transition-colors" />
              <span className="font-bold text-gray-900 text-xs leading-none">{project.bathrooms}</span>
              <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Banh.</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-green-200 transition-colors group/stat">
              <Car className="h-3.5 w-3.5 text-gray-400 group-hover/stat:text-green-500 mb-0.5 transition-colors" />
              <span className="font-bold text-gray-900 text-xs leading-none">{project.garage_spots}</span>
              <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Vagas</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-green-200 transition-colors group/stat">
              <Maximize className="h-3.5 w-3.5 text-gray-400 group-hover/stat:text-green-500 mb-0.5 transition-colors" />
              <span className="font-bold text-gray-900 text-xs leading-none">{project.built_area}m²</span>
              <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Área</span>
            </div>
          </div>
        </div>

        {/* Footer Price Section */}
        <div className="p-3 pt-0 bg-gray-50/30">
          <div className="bg-white border border-green-100 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">A partir de</span>
              <span className="text-lg font-extrabold text-gray-900">{formatPrice(project.price)}</span>
            </div>
            <div className="text-primary transform transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ProjectCard;
