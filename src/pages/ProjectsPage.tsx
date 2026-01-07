import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProjectCard from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { ProjectWithImages } from '@/types/database';

const ProjectsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states from URL
  const [width, setWidth] = useState(searchParams.get('width') || '');
  const [depth, setDepth] = useState(searchParams.get('depth') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [style, setStyle] = useState(searchParams.get('style') || '');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProjectWithImages[];
    },
  });

  // Filter projects based on search params
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter(project => {
      // Width filter - project fits if its width is <= terrain width
      if (width && project.width_meters > parseFloat(width)) {
        return false;
      }
      // Depth filter - project fits if its depth is <= terrain depth
      if (depth && project.depth_meters > parseFloat(depth)) {
        return false;
      }
      // Bedrooms filter
      if (bedrooms && project.bedrooms !== parseInt(bedrooms)) {
        return false;
      }
      // Style filter
      if (style && project.style !== style) {
        return false;
      }
      return true;
    });
  }, [projects, width, depth, bedrooms, style]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (width) params.set('width', width);
    if (depth) params.set('depth', depth);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (style) params.set('style', style);
    setSearchParams(params);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setWidth('');
    setDepth('');
    setBedrooms('');
    setStyle('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = width || depth || bedrooms || style;

  // Mock data for display when database is empty
  const mockProjects: ProjectWithImages[] = [
    {
      id: '1',
      title: 'Casa Térrea Moderna com 3 Quartos - Cód. 101',
      slug: 'casa-terrea-moderna-3-quartos-101',
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
      project_images: [],
    },
    {
      id: '2',
      title: 'Sobrado Contemporâneo - Cód. 102',
      slug: 'sobrado-contemporaneo-102',
      description: 'Sobrado elegante',
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
      project_images: [],
    },
    {
      id: '3',
      title: 'Casa Compacta - Cód. 103',
      slug: 'casa-compacta-103',
      description: 'Ideal para terrenos estreitos',
      price: 320,
      width_meters: 5,
      depth_meters: 17,
      bedrooms: 2,
      bathrooms: 1,
      suites: 1,
      garage_spots: 1,
      built_area: 68,
      style: 'Moderno',
      is_featured: false,
      created_at: new Date().toISOString(),
      project_images: [],
    },
    {
      id: '4',
      title: 'Casa Térrea Rústica - Cód. 104',
      slug: 'casa-terrea-rustica-104',
      description: 'Estilo rústico aconchegante',
      price: 580,
      width_meters: 8,
      depth_meters: 20,
      bedrooms: 3,
      bathrooms: 2,
      suites: 1,
      garage_spots: 1,
      built_area: 110,
      style: 'Rústico',
      is_featured: false,
      created_at: new Date().toISOString(),
      project_images: [],
    },
    {
      id: '5',
      title: 'Sobrado com Mezanino - Cód. 105',
      slug: 'sobrado-mezanino-105',
      description: 'Design moderno com mezanino',
      price: 750,
      width_meters: 10,
      depth_meters: 22,
      bedrooms: 3,
      bathrooms: 3,
      suites: 1,
      garage_spots: 2,
      built_area: 145,
      style: 'Moderno',
      is_featured: true,
      created_at: new Date().toISOString(),
      project_images: [],
    },
    {
      id: '6',
      title: 'Casa com Varanda Gourmet - Cód. 106',
      slug: 'casa-varanda-gourmet-106',
      description: 'Perfeita para receber amigos',
      price: 720,
      width_meters: 12,
      depth_meters: 20,
      bedrooms: 4,
      bathrooms: 3,
      suites: 2,
      garage_spots: 2,
      built_area: 165,
      style: 'Contemporâneo',
      is_featured: false,
      created_at: new Date().toISOString(),
      project_images: [],
    },
  ];

  const displayProjects = (projects?.length ? filteredProjects : mockProjects);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-12 lg:py-16">
        <div className="section-container">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Projetos de Casas
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Encontre o projeto ideal para o seu terreno. Use os filtros para buscar 
            por dimensões, número de quartos e estilo.
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-16 z-40 bg-background border-b border-border py-4">
        <div className="section-container">
          <div className="flex flex-wrap items-center gap-4">
            {/* Quick search */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Frente do terreno (m)"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="pl-10"
                />
              </div>
              <span className="text-muted-foreground">x</span>
              <Input
                type="number"
                placeholder="Fundo (m)"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="max-w-[140px]"
              />
            </div>

            {/* Filter button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-secondary' : ''}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>

            {/* Apply filters */}
            <Button onClick={handleApplyFilters}>
              Buscar
            </Button>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border animate-fade-in">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Quartos</label>
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer</SelectItem>
                    <SelectItem value="1">1 Quarto</SelectItem>
                    <SelectItem value="2">2 Quartos</SelectItem>
                    <SelectItem value="3">3 Quartos</SelectItem>
                    <SelectItem value="4">4+ Quartos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Estilo</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer</SelectItem>
                    <SelectItem value="Moderno">Moderno</SelectItem>
                    <SelectItem value="Contemporâneo">Contemporâneo</SelectItem>
                    <SelectItem value="Rústico">Rústico</SelectItem>
                    <SelectItem value="Clássico">Clássico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          {/* Results count */}
          <p className="text-muted-foreground mb-6">
            {displayProjects.length} projeto{displayProjects.length !== 1 ? 's' : ''} encontrado{displayProjects.length !== 1 ? 's' : ''}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-premium animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-5 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">
                Nenhum projeto encontrado com os filtros aplicados.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
              {displayProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ProjectsPage;
