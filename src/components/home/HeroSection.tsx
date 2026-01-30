import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, BedDouble, Bath, Ruler, Home } from 'lucide-react';
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
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (suites) params.set('suites', suites);
    if (type) params.set('type', type);
    navigate(`/projetos?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Parallax-like effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src={displayImage}
          alt="Banner Principal"
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 section-container py-20 flex flex-col justify-center h-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* Left Text Block */}
          <div className="space-y-8 animate-fade-up max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-sm font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Projetos Exclusivos & Prontos para Construir
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-lg">
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

            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-xl font-light">
              Explore nossa coleção curada de projetos arquitetônicos de alto padrão. Detalhamento completo, aprovação garantida e design atemporal.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/projetos')}
                className="h-14 px-8 text-base font-semibold bg-white text-black hover:bg-white/90 transition-all hover:scale-105 rounded-full"
              >
                Ver Todos os Projetos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Filters Card */}
          <div className="w-full animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <form
              onSubmit={handleSearch}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500"
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative mb-8">
                <h3 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
                  Encontre seu projeto
                </h3>
                <div className="w-12 h-1 bg-primary rounded-full mb-3"></div>
                <p className="text-white/60 text-sm font-light">
                  Selecione as características ideais.
                </p>
              </div>

              <div className="space-y-6">

                {/* Row 1: Quartos & Banheiros */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-white/60 tracking-wider pl-1">
                      Quartos
                    </label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger className="h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-xl px-4 focus:ring-1 focus:ring-primary/50 focus:border-primary/50">
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-4 w-4 text-primary opacity-80" />
                          <SelectValue placeholder="Qualquer" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900/95 border-white/10 backdrop-blur-xl text-white">
                        <SelectItem value="2">2 Quartos</SelectItem>
                        <SelectItem value="3">3 Quartos</SelectItem>
                        <SelectItem value="4">4+ Quartos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-white/60 tracking-wider pl-1">
                      Banheiros
                    </label>
                    <Select value={bathrooms} onValueChange={setBathrooms}>
                      <SelectTrigger className="h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-xl px-4 focus:ring-1 focus:ring-primary/50 focus:border-primary/50">
                        <div className="flex items-center gap-2">
                          <Bath className="h-4 w-4 text-primary opacity-80" />
                          <SelectValue placeholder="Qualquer" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900/95 border-white/10 backdrop-blur-xl text-white">
                        <SelectItem value="1">1 Banheiro</SelectItem>
                        <SelectItem value="2">2 Banheiros</SelectItem>
                        <SelectItem value="3">3+ Banheiros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Suítes & Tipo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-white/60 tracking-wider pl-1">
                      Suítes
                    </label>
                    <Select value={suites} onValueChange={setSuites}>
                      <SelectTrigger className="h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-xl px-4 focus:ring-1 focus:ring-primary/50 focus:border-primary/50">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary opacity-80" />
                          <SelectValue placeholder="Qualquer" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900/95 border-white/10 backdrop-blur-xl text-white">
                        <SelectItem value="1">1 Suíte</SelectItem>
                        <SelectItem value="2">2 Suítes</SelectItem>
                        <SelectItem value="3">3+ Suítes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-white/60 tracking-wider pl-1">
                      Tipo
                    </label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="h-12 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-xl px-4 focus:ring-1 focus:ring-primary/50 focus:border-primary/50">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-primary opacity-80" />
                          <SelectValue placeholder="Qualquer" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900/95 border-white/10 backdrop-blur-xl text-white">
                        <SelectItem value="térrea">Térrea</SelectItem>
                        <SelectItem value="sobrado">Sobrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 3: Área */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-white/60 tracking-wider pl-1">
                    Área Construída (Mínima)
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-80" />
                    <Input
                      type="number"
                      placeholder="Ex: 150 m²"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="h-12 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-primary/50 focus:ring-0 transition-all pl-10 rounded-xl text-base"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 mt-2 text-lg font-bold bg-gradient-to-r from-primary to-emerald-600 hover:to-emerald-500 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] rounded-xl flex items-center justify-between px-8 group/btn"
                >
                  <span>Buscar Projetos</span>
                  <div className="bg-white/20 p-2 rounded-full group-hover/btn:translate-x-1 transition-transform">
                    <Search className="h-4 w-4" />
                  </div>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
