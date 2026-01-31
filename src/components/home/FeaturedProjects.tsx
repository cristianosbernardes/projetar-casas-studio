import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ProjectCard from '@/components/projects/ProjectCard';
import type { ProjectWithImages } from '@/types/database';

const FeaturedProjects = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (*)
        `)
        .eq('is_featured', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as ProjectWithImages[];
    },
  });

  // Mock data for display when database is empty
  const mockProjects: ProjectWithImages[] = [
    {
      id: '1',
      title: 'Casa Térrea Moderna com 3 Quartos - Cód. 101',
      slug: 'casa-terrea-moderna-3-quartos-101',
      code: '101',
      description: 'Projeto moderno com ampla área social',
      price: 650,
      width_meters: 10,
      depth_meters: 20,
      bedrooms: 3,
      bathrooms: 2,
      suites: 1,
      garage_spots: 2,
      built_area: 120,
      style: 'Moderno',
      is_featured: true,
      created_at: new Date().toISOString(),
      deleted_at: null,
      views: 0,
      price_electrical: 180,
      price_hydraulic: 150,
      price_sanitary: 120,
      price_structural: 280,
      project_images: [],
      status: 'published',
      is_best_seller: false
    },
    {
      id: '2',
      title: 'Sobrado Contemporâneo com Varanda Gourmet - Cód. 102',
      slug: 'sobrado-contemporaneo-varanda-102',
      code: '102',
      description: 'Sobrado elegante com acabamentos premium',
      price: 890,
      width_meters: 12,
      depth_meters: 25,
      bedrooms: 4,
      bathrooms: 3,
      suites: 2,
      garage_spots: 2,
      built_area: 180,
      style: 'Contemporâneo',
      is_featured: true,
      created_at: new Date().toISOString(),
      deleted_at: null,
      views: 0,
      price_electrical: 220,
      price_hydraulic: 180,
      price_sanitary: 150,
      price_structural: 350,
      project_images: [],
      status: 'published',
      is_best_seller: false
    },
    {
      id: '3',
      title: 'Casa Compacta para Terreno Estreito - Cód. 103',
      slug: 'casa-compacta-terreno-estreito-103',
      code: '103',
      description: 'Ideal para terrenos de 5 metros de frente',
      price: 320,
      width_meters: 5,
      depth_meters: 17,
      bedrooms: 2,
      bathrooms: 1,
      suites: 1,
      garage_spots: 1,
      built_area: 68,
      style: 'Moderno',
      is_featured: true,
      created_at: new Date().toISOString(),
      deleted_at: null,
      views: 0,
      price_electrical: 100,
      price_hydraulic: 80,
      price_sanitary: 70,
      price_structural: 150,
      project_images: [],
      status: 'published',
      is_best_seller: false
    },
  ];

  const displayProjects = projects?.length ? projects : mockProjects;

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="section-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Projetos em Destaque
            </h2>
            <p className="text-muted-foreground text-lg">
              Conheça nossos projetos mais populares
            </p>
          </div>
          <Link to="/projetos">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-900 to-emerald-500 hover:from-blue-800 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 border-0 transition-all hover:scale-[1.02]"
            >
              Ver Todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-premium animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16" />
                    <div className="h-6 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-5 stagger-children">
            {displayProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
