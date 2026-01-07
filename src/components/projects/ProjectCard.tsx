import { Link } from 'react-router-dom';
import { Bed, Bath, Car, Maximize } from 'lucide-react';
import type { ProjectWithImages } from '@/types/database';
import { getOptimizedImageUrl } from '@/integrations/supabase/client';

interface ProjectCardProps {
  project: ProjectWithImages;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const coverImage = project.project_images?.find(img => img.is_cover) || project.project_images?.[0];
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/projeto/${project.slug}`} className="group block">
      <article className="card-premium">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
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
          
          {/* Featured badge */}
          {project.is_featured && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
              Destaque
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 right-3 px-4 py-2 bg-background/95 backdrop-blur-sm rounded-lg">
            <span className="price-tag">{formatPrice(project.price)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>

          {/* Terrain info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Maximize className="h-4 w-4" />
            <span>Terreno: {project.width_meters}m x {project.depth_meters}m</span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="stat-badge">
              <Bed className="h-4 w-4" />
              <span>{project.bedrooms} Quartos</span>
            </div>
            {project.suites > 0 && (
              <div className="stat-badge">
                <span>{project.suites} Suíte{project.suites > 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="stat-badge">
              <Bath className="h-4 w-4" />
              <span>{project.bathrooms}</span>
            </div>
            {project.garage_spots > 0 && (
              <div className="stat-badge">
                <Car className="h-4 w-4" />
                <span>{project.garage_spots}</span>
              </div>
            )}
          </div>

          {/* Built area */}
          <p className="text-sm text-muted-foreground">
            Área construída: <span className="font-medium text-foreground">{project.built_area}m²</span>
          </p>
        </div>
      </article>
    </Link>
  );
};

export default ProjectCard;
