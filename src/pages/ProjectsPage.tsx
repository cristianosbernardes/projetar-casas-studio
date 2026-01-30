import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [suites, setSuites] = useState(searchParams.get('suites') || '');
  const [garage, setGarage] = useState(searchParams.get('garage') || '');
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
      // Code filter (Project ID or Title/Slug match)
      if (code) {
        const searchCode = code.toLowerCase();
        const titleMatch = project.title.toLowerCase().includes(searchCode);
        const slugMatch = project.slug.toLowerCase().includes(searchCode);
        // Check if ID matches or if it's contained in the title part like "Cód. 101"
        if (!titleMatch && !slugMatch && project.id !== code) {
          return false;
        }
      }
      // Bedrooms filter (exact match)
      if (bedrooms && project.bedrooms !== parseInt(bedrooms)) {
        return false;
      }
      // Bathrooms filter (minimum match)
      if (bathrooms && project.bathrooms < parseInt(bathrooms)) {
        return false;
      }
      // Suites filter (minimum match)
      if (suites && project.suites < parseInt(suites)) {
        return false;
      }
      // Garage filter (minimum match)
      if (garage && project.garage_spots < parseInt(garage)) {
        return false;
      }
      // Style filter
      if (style && project.style !== style) {
        return false;
      }
      return true;
    });
  }, [projects, width, depth, code, bedrooms, bathrooms, suites, garage, style]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (width) params.set('width', width);
    if (depth) params.set('depth', depth);
    if (code) params.set('code', code);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (suites) params.set('suites', suites);
    if (garage) params.set('garage', garage);
    if (style) params.set('style', style);
    setSearchParams(params);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setWidth('');
    setDepth('');
    setCode('');
    setBedrooms('');
    setBathrooms('');
    setSuites('');
    setGarage('');
    setStyle('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = width || depth || code || bedrooms || bathrooms || suites || garage || style;

  // Mock data for display when displayProjects is empty
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
    },
    {
      id: '2',
      title: 'Sobrado Contemporâneo - Cód. 102',
      slug: 'sobrado-contemporaneo-102',
      code: '102',
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
      deleted_at: null,
      views: 0,
      price_electrical: 220,
      price_hydraulic: 180,
      price_sanitary: 150,
      price_structural: 350,
      project_images: [],
    },
    {
      id: '3',
      title: 'Casa Compacta - Cód. 103',
      slug: 'casa-compacta-103',
      code: '103',
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
      deleted_at: null,
      views: 0,
      price_electrical: 100,
      price_hydraulic: 80,
      price_sanitary: 70,
      price_structural: 150,
      project_images: [],
    },
    {
      id: '4',
      title: 'Casa Térrea Rústica - Cód. 104',
      slug: 'casa-terrea-rustica-104',
      code: '104',
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
      deleted_at: null,
      views: 0,
      price_electrical: 160,
      price_hydraulic: 130,
      price_sanitary: 100,
      price_structural: 240,
      project_images: [],
    },
    {
      id: '5',
      title: 'Sobrado com Mezanino - Cód. 105',
      slug: 'sobrado-mezanino-105',
      code: '105',
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
      deleted_at: null,
      views: 0,
      price_electrical: 200,
      price_hydraulic: 160,
      price_sanitary: 130,
      price_structural: 300,
      project_images: [],
    },
    {
      id: '6',
      title: 'Casa com Varanda Gourmet - Cód. 106',
      slug: 'casa-varanda-gourmet-106',
      code: '106',
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
      deleted_at: null,
      views: 0,
      price_electrical: 190,
      price_hydraulic: 155,
      price_sanitary: 125,
      price_structural: 290,
      project_images: [],
    },
  ];

  const displayProjects = (projects?.length ? filteredProjects : mockProjects);

  return (
    <Layout>
      {/* Search Header with Background Image */}
      <section className="relative h-[480px] w-full bg-slate-900 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-60 mix-blend-overlay transition-opacity duration-700"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-6ad4c727dd2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
              Sua casa dos sonhos começa aqui
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto font-medium drop-shadow-md">
              Mais de {projects?.length || '50'} projetos exclusivos prontos para construir.
            </p>
          </motion.div>

          {/* Glassmorphism Filters Box - Centered and Overlapping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-6xl mx-auto mt-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-4 items-center">

                {/* Main Priorities: Bedrooms & Bathrooms */}
                <div className="flex flex-1 gap-2 w-full lg:w-auto min-w-[300px]">
                  <div className="flex-1 space-y-1">
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger className="h-12 bg-background/60 border-white/10 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground"><Check className="h-4 w-4" /></span>
                          <SelectValue placeholder="Quartos" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Quartos</SelectItem>
                        <SelectItem value="3">3 Quartos</SelectItem>
                        <SelectItem value="4">4+ Quartos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Select value={bathrooms} onValueChange={setBathrooms}>
                      <SelectTrigger className="h-12 bg-background/60 border-white/10 backdrop-blur-sm text-foreground hover:bg-background/80 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground"><Check className="h-4 w-4" /></span>
                          <SelectValue placeholder="Banheiros" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Banheiro</SelectItem>
                        <SelectItem value="2">2 Banheiros</SelectItem>
                        <SelectItem value="3">3+ Banheiros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="hidden lg:block w-[1px] h-10 bg-white/10 mx-2"></div>

                {/* Secondary Search: Terrain Dimensions */}
                <div className="flex items-center gap-2 w-full lg:w-auto flex-1">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="number"
                      placeholder="Frente (m)"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="pl-9 h-12 bg-background/40 border-white/10 hover:bg-background/60 focus:bg-background/80 transition-all placeholder:text-muted-foreground/70"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      placeholder="Fundo (m)"
                      value={depth}
                      onChange={(e) => setDepth(e.target.value)}
                      className="h-12 bg-background/40 border-white/10 hover:bg-background/60 focus:bg-background/80 transition-all placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0">
                  <Button
                    variant="secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex-1 lg:flex-none gap-2 bg-background/80 hover:bg-background text-foreground border-white/10 h-12 px-6 ${showFilters ? 'ring-2 ring-primary' : ''}`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Mais</span>
                  </Button>

                  <Button onClick={handleApplyFilters} className="flex-[2] lg:flex-none h-12 px-8 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Buscar
                  </Button>

                  {hasActiveFilters && (
                    <Button variant="ghost" size="icon" onClick={handleClearFilters} className="h-12 w-12 text-white hover:text-white hover:bg-white/10">
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Expandable Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                      <Select value={suites} onValueChange={setSuites}>
                        <SelectTrigger className="bg-background/60 border-transparent h-10">
                          <SelectValue placeholder="Suítes" />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="">Qualquer</SelectItem><SelectItem value="1">1</SelectItem><SelectItem value="2">2+</SelectItem></SelectContent>
                      </Select>
                      <Select value={garage} onValueChange={setGarage}>
                        <SelectTrigger className="bg-background/60 border-transparent h-10">
                          <SelectValue placeholder="Vagas" />
                        </SelectTrigger>
                        <SelectContent><SelectItem value="">Qualquer</SelectItem><SelectItem value="1">1</SelectItem><SelectItem value="2">2+</SelectItem></SelectContent>
                      </Select>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger className="bg-background/60 border-transparent h-10">
                          <SelectValue placeholder="Estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Qualquer</SelectItem>
                          <SelectItem value="Moderno">Moderno</SelectItem>
                          <SelectItem value="Contemporâneo">Contemporâneo</SelectItem>
                          <SelectItem value="Rústico">Rústico</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Código (Ex: 101)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="h-10 bg-background/60 border-transparent"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 bg-background">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Projetos em Destaque
            </h2>
            <span className="text-muted-foreground text-sm bg-secondary px-3 py-1 rounded-full">
              {displayProjects.length} resultado{displayProjects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border/50 h-[400px] animate-pulse">
                  <div className="h-2/3 bg-muted" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/20 rounded-3xl border border-dashed border-border min-h-[400px]">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                Não encontramos projetos com as características selecionadas. Tente ajustar os filtros ou limpar a busca.
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Custom Project */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden mt-auto">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="section-container relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Não encontrou o que procurava?</h2>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto mb-10">
            Nossa equipe de arquitetos pode desenvolver um projeto exclusivo e 100% personalizado para o seu terreno e suas necessidades.
          </p>
          <Link to="/projeto-personalizado">
            <Button size="lg" variant="secondary" className="font-semibold text-primary hover:scale-105 transition-transform shadow-xl">
              Solicitar Projeto Personalizado
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default ProjectsPage;
