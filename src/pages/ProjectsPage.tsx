import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X, ArrowRight, Check, BedDouble, Bath, Home, CarFront, Hash, Ruler } from 'lucide-react';
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
  // Filter states from URL
  // Filter states from URL
  const [width, setWidth] = useState(searchParams.get('width') || '');
  const [depth, setDepth] = useState(searchParams.get('depth') || '');
  const [minArea, setMinArea] = useState(searchParams.get('min_area') || '');
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [suites, setSuites] = useState(searchParams.get('suites') || '');
  const [garage, setGarage] = useState(searchParams.get('garage') || '');
  const [style, setStyle] = useState(searchParams.get('style') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (*)
        `)
        .eq('status', 'published')
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
      // Min Area filter
      if (minArea && project.built_area < parseFloat(minArea)) {
        return false;
      }
      // Price filters
      if (minPrice && project.price < parseFloat(minPrice)) return false;
      if (maxPrice && project.price > parseFloat(maxPrice)) return false;

      // Type filter (Check title/description if no specific column)
      if (type) {
        const searchType = type.toLowerCase();
        const content = (project.title + ' ' + (project.description || '')).toLowerCase();
        if (!content.includes(searchType)) return false;
      }

      // Code filter (Project ID, Code column, or Title/Slug match)
      if (code) {
        const searchCode = code.toLowerCase().trim();
        const titleMatch = project.title.toLowerCase().includes(searchCode);
        const slugMatch = project.slug.toLowerCase().includes(searchCode);
        const codeMatch = project.code?.toLowerCase().includes(searchCode);

        // Se digitou algo no código, tem que bater com alguma dessas informações
        if (!titleMatch && !slugMatch && !codeMatch && project.id !== code) {
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
  }, [projects, width, depth, minArea, code, bedrooms, bathrooms, suites, garage, style, type, minPrice, maxPrice]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (width) params.set('width', width);
    if (depth) params.set('depth', depth);
    if (minArea) params.set('min_area', minArea);
    if (code) params.set('code', code);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (suites) params.set('suites', suites);
    if (garage) params.set('garage', garage);
    if (style) params.set('style', style);
    if (type) params.set('type', type);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);

    setSearchParams(params);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setWidth('');
    setDepth('');
    setMinArea('');
    setCode('');
    setBedrooms('');
    setBathrooms('');
    setSuites('');
    setGarage('');
    setStyle('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
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
      status: 'published',
      is_best_seller: false
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
      status: 'published',
      is_best_seller: false
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
      status: 'published',
      is_best_seller: false
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
      status: 'published',
      is_best_seller: false
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
      status: 'published',
      is_best_seller: false
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
      status: 'published',
      is_best_seller: false
    },
  ];

  const displayProjects = (projects?.length ? filteredProjects : mockProjects);

  return (
    <Layout>
      {/* Search Header with Background Image */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-32 pb-20">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center scale-105 animate-slow-zoom"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-6ad4c727dd2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/60 z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 flex flex-col items-center justify-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-2xl">
              Encontre o projeto <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                perfeito para você
              </span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto font-light drop-shadow-md">
              Explore nossa coleção completa. Utilize os filtros abaixo para refinar sua busca por quartos, tamanho e estilo.
            </p>
          </motion.div>

          {/* Central Filters Card - Wide */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-5xl"
          >
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Filtrar Projetos
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-white/70 hover:text-white transition-all group"
                    >
                      {showFilters ? (
                        <>Menos filtros <Search className="h-3 w-3 rotate-180 transition-transform" /></>
                      ) : (
                        <>Mais filtros <Search className="h-3 w-3 transition-transform group-hover:translate-y-0.5" /></>
                      )}
                    </button>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-white/50 hover:text-red-400 h-auto p-0 hover:bg-transparent text-xs">
                        <X className="h-3 w-3 mr-1" /> Limpar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Row 1: Quartos, Banheiros, Suítes, Tipo, Código */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
                  <div className="space-y-1.5 group/input">
                    <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                      Quartos
                    </label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger className="h-11 bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                        <div className="flex items-center gap-2">
                          {/* Using generic icons if not imported, but assuming user prompt implied copying Hero style which uses them. I will add imports in next step if missing */}
                          <BedDouble className="h-4 w-4 text-primary opacity-90 shrink-0" />
                          <SelectValue placeholder="Qtd" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="1">1 Quarto</SelectItem>
                        <SelectItem value="2">2 Quartos</SelectItem>
                        <SelectItem value="3">3 Quartos</SelectItem>
                        <SelectItem value="4">4+ Quartos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 group/input">
                    <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                      Banheiros
                    </label>
                    <Select value={bathrooms} onValueChange={setBathrooms}>
                      <SelectTrigger className="h-11 bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                        <div className="flex items-center gap-2">
                          <Bath className="h-4 w-4 text-primary opacity-90 shrink-0" />
                          <SelectValue placeholder="Qtd" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="1">1 Banheiro</SelectItem>
                        <SelectItem value="2">2 Banheiros</SelectItem>
                        <SelectItem value="3">3+ Banheiros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 group/input">
                    <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                      Suítes
                    </label>
                    <Select value={suites} onValueChange={setSuites}>
                      <SelectTrigger className="h-11 bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary opacity-90 shrink-0" />
                          <SelectValue placeholder="Qtd" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="1">1 Suíte</SelectItem>
                        <SelectItem value="2">2 Suítes</SelectItem>
                        <SelectItem value="3">3+ Suítes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 group/input">
                    <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                      Vagas
                    </label>
                    <Select value={garage} onValueChange={setGarage}>
                      <SelectTrigger className="h-11 bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                        <div className="flex items-center gap-2">
                          <CarFront className="h-4 w-4 text-primary opacity-90 shrink-0" />
                          <SelectValue placeholder="Vagas" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="1">1 Vaga</SelectItem>
                        <SelectItem value="2">2 Vagas</SelectItem>
                        <SelectItem value="3">3+ Vagas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 group/input">
                    <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                      Código
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-90" />
                      <Input
                        type="text"
                        placeholder="Cód."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="h-11 bg-white/10 border border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:bg-white/15 focus:border-primary focus:ring-0 transition-all pl-9 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>



                {/* Collapsible Advanced Filters (Row 2: Frente, Fundo, Área, Min, Max) */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-fade-in pb-2 relative z-10">
                        {/* Style select moved here */}
                        <div className="space-y-1.5 group/input">
                          <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                            Estilo
                          </label>
                          <Select value={style} onValueChange={setStyle}>
                            <SelectTrigger className="h-11 bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-primary opacity-90 shrink-0" />
                                <SelectValue placeholder="Estilo" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                              <SelectItem value="Moderno">Moderno</SelectItem>
                              <SelectItem value="Contemporâneo">Contemporâneo</SelectItem>
                              <SelectItem value="Rústico">Rústico</SelectItem>
                              <SelectItem value="Neoclássico">Neoclássico</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5 group/input">
                          <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                            Frente (m)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-90 font-bold text-xs">📏</span>
                            <Input
                              type="number"
                              placeholder="Mín."
                              value={width}
                              onChange={(e) => setWidth(e.target.value)}
                              className="h-11 bg-white/10 border border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:bg-white/15 focus:border-primary focus:ring-0 transition-all pl-9 rounded-lg text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 group/input">
                          <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                            Fundo (m)
                          </label>
                          <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-90" />
                            <Input
                              type="number"
                              placeholder="Mín."
                              value={depth}
                              onChange={(e) => setDepth(e.target.value)}
                              className="h-11 bg-white/10 border border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:bg-white/15 focus:border-primary focus:ring-0 transition-all pl-9 rounded-lg text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 group/input">
                          <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                            Preço Mín.
                          </label>
                          <Input
                            type="number"
                            placeholder="R$ Mín"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="h-11 bg-white/10 border border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:bg-white/15 focus:border-primary focus:ring-0 transition-all px-3 rounded-lg text-sm"
                          />
                        </div>
                        <div className="space-y-1.5 group/input">
                          <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                            Preço Máx.
                          </label>
                          <Input
                            type="number"
                            placeholder="R$ Máx"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="h-11 bg-white/10 border border-white/20 text-white placeholder:text-white/50 hover:bg-white/15 focus:bg-white/15 focus:border-primary focus:ring-0 transition-all px-3 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>





                {/* Form Footer Actions */}
                <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-4">
                  <Button
                    onClick={handleApplyFilters}
                    size="lg"
                    className="w-full md:w-auto h-12 text-base font-bold bg-gradient-to-r from-blue-900 to-emerald-500 hover:from-blue-800 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] rounded-xl flex items-center justify-center px-12 border-0"
                  >
                    Buscar Projetos
                    <Search className="h-4 w-4 ml-2" />
                  </Button>
                </div>

              </div>
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
