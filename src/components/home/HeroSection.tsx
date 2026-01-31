import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, BedDouble, Bath, Ruler, Home, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import heroImage from '@/assets/hero-house.jpg';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { getOptimizedImageUrl } from '@/integrations/supabase/client';

const HeroSection = () => {
  const navigate = useNavigate();
  const [minArea, setMinArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [suites, setSuites] = useState('');
  const [type, setType] = useState('');
  const [code, setCode] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch Banners
  const { data: banners } = useQuery({
    queryKey: ['home-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_banners')
        .select('*')
        .eq('active', true)
        .order('display_order');
      if (error) {
        console.error('Error fetching banners:', error);
        return null;
      }
      return data;
    },
    staleTime: 1000 * 60 * 5 // 5 min
  });

  const activeBanner = (banners as any[])?.[0];
  const displayImage = activeBanner?.image_url
    ? getOptimizedImageUrl(activeBanner.image_url, { width: 1920, quality: 80 })
    : heroImage;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (minArea) params.set('min_area', minArea);
    if (width) params.set('width', width);
    if (depth) params.set('depth', depth);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (suites) params.set('suites', suites);
    if (type) params.set('type', type);
    if (code) params.set('code', code);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    navigate(`/projetos?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-20">
      {/* Background Image with Parallax-like effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img
          src={displayImage}
          alt="Banner Principal"
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 flex flex-col items-center justify-center h-full space-y-12">

        {/* Central Text Block */}
        <div className="space-y-6 animate-fade-up text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-sm font-medium tracking-wide mx-auto">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Projetos Exclusivos & Prontos para Construir
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-2xl">
            {activeBanner ? (
              <>
                {activeBanner.title} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                  {activeBanner.subtitle}
                </span>
              </>
            ) : (
              <>
                O projeto da sua <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                  vida começa aqui
                </span>
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto font-light drop-shadow-md">
            Explore nossa coleção curada de projetos arquitetônicos de alto padrão. Detalhamento completo, aprovação garantida e design atemporal.
          </p>
        </div>

        {/* Central Filters Card - Wide */}
        <div className="w-full max-w-5xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <form
            onSubmit={handleSearch}
            className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500"
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Encontre seu projeto ideal
                </h3>
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
                    Tipo
                  </label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-11 bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-all rounded-lg px-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-primary opacity-90 shrink-0" />
                        <SelectValue placeholder="Tipo" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="térrea">Térrea</SelectItem>
                      <SelectItem value="sobrado">Sobrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 col-span-2 lg:col-span-1 group/input">
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
              {isExpanded && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-fade-in pt-3 relative z-10">
                  <div className="space-y-1.5 group/input">
                    <label className="text-xs font-semibold text-white/80 pl-1 group-focus-within/input:text-primary transition-colors">
                      Frente (m)
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-90" />
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
                      Área (m²)
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-90" />
                      <Input
                        type="number"
                        placeholder="Mín."
                        value={minArea}
                        onChange={(e) => setMinArea(e.target.value)}
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
              )}

              {/* Toggle Button Centered below filters */}
              <div className="flex justify-center -my-2 relative z-20">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-medium text-white/50 hover:text-white transition-all group backdrop-blur-md"
                >
                  {isExpanded ? (
                    <>Menos filtros <Search className="h-3 w-3 rotate-180 transition-transform" /></>
                  ) : (
                    <>Mais filtros <Search className="h-3 w-3 transition-transform group-hover:translate-y-0.5" /></>
                  )}
                </button>
              </div>

              {/* Form Footer Actions */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  onClick={() => navigate('/projetos')}
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium w-full md:w-auto"
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  Ver todos os projetos
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto h-12 text-base font-bold bg-gradient-to-r from-blue-900 to-emerald-500 hover:from-blue-800 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] rounded-xl flex items-center justify-center px-8 border-0"
                >
                  Buscar Projetos
                  <Search className="h-4 w-4 ml-2" />
                </Button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
