import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ChevronDown, ChevronUp, Car, BedDouble, Bath, Ruler, Hash, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import heroImage from '@/assets/hero-house.jpg';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { getOptimizedImageUrl } from '@/integrations/supabase/client';

const HeroSection = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  const [code, setCode] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [suites, setSuites] = useState('');
  const [garage, setGarage] = useState('');

  const [isAdvanced, setIsAdvanced] = useState(false);

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

  const activeBanner = (banners as any[])?.[0]; // Taking the first one for now, or rotate logic later
  const displayImage = activeBanner?.image_url
    ? getOptimizedImageUrl(activeBanner.image_url, { width: 1920, quality: 80 })
    : heroImage;
  const displayTitle = activeBanner?.title || "O projeto da sua";
  const displaySubtitle = activeBanner?.subtitle || "vida começa aqui";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (width) params.set('width', width);
    if (depth) params.set('depth', depth);
    if (code) params.set('code', code);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);
    if (suites) params.set('suites', suites);
    if (garage) params.set('garage', garage);
    navigate(`/projetos?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Parallax-like effect */}
      <div className="absolute inset-0 z-0">
        {/* Dark overlay for text contrast - constant dark regardless of theme */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src={displayImage}
          alt={displayTitle}
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        {/* Gradient to smooth the transition, ensuring text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 section-container py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-up">
            {/* Badge */}
            <Badge variant="secondary" className="px-4 py-2 text-sm backdrop-blur-md bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all font-medium tracking-wide">
              ✨ Mais de 100 projetos exclusivos
            </Badge>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight drop-shadow-md">
              {activeBanner ? (
                <>
                  {activeBanner.title} <br />
                  <span className="text-primary">{activeBanner.subtitle}</span>
                </>
              ) : (
                <>
                  O projeto da sua <br />
                  <span className="text-primary">
                    vida começa aqui
                  </span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-xl font-medium drop-shadow-sm">
              Plantas prontas de alto padrão, detalhadas e aprovadas por arquitetos renomados.
              Encontre a combinação perfeita para o seu terreno.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/projetos')}
                className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                Ver Projetos
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Premium Search Card */}
          <div className="w-full max-w-lg mx-auto lg:ml-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <form
              onSubmit={handleSearch}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

              <div className="relative mb-6">
                <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Encontre seu projeto
                </h3>
                <p className="text-white/60 text-sm">
                  Preencha as características do terreno ou da casa
                </p>
              </div>

              <div className="space-y-4">
                {/* Dimensions Group */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/80 uppercase tracking-wider flex items-center gap-2">
                    <Ruler className="h-3 w-3" />
                    Dimensões do Terreno
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative group/input">
                      <Input
                        id="width"
                        type="number"
                        placeholder="Frente (m)"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:bg-black/40 focus:border-primary/50 transition-all pl-4"
                        min="1"
                        step="0.5"
                      />
                    </div>
                    <div className="relative group/input">
                      <Input
                        id="depth"
                        type="number"
                        placeholder="Fundo (m)"
                        value={depth}
                        onChange={(e) => setDepth(e.target.value)}
                        className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:bg-black/40 focus:border-primary/50 transition-all pl-4"
                        min="1"
                        step="0.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Toggle Advanced */}
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdvanced(!isAdvanced)}
                    className="w-full justify-between h-12 border-white/10 bg-black/20 text-white hover:bg-black/30 hover:text-white hover:border-primary/50 transition-all group/toggle"
                  >
                    <span className="text-sm font-medium flex items-center gap-2">
                      Mais filtros (Quartos, Cód, etc.)
                    </span>
                    {isAdvanced ? (
                      <ChevronUp className="h-4 w-4 text-primary transition-transform group-hover/toggle:-translate-y-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-primary transition-transform group-hover/toggle:translate-y-1" />
                    )}
                  </Button>
                </div>

                {/* Advanced Fields with Animation */}
                <div className={`grid grid-cols-2 gap-3 overflow-hidden transition-all duration-300 ease-in-out ${isAdvanced ? 'max-h-[300px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>

                  {/* Code */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      <Hash className="h-4 w-4" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Cód."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="h-10 bg-black/20 border-white/10 text-white placeholder:text-white/40 pl-9 focus:bg-black/40 focus:border-primary/50"
                    />
                  </div>

                  {/* Bedrooms */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      <BedDouble className="h-4 w-4" />
                    </div>
                    <Input
                      type="number"
                      placeholder="Quartos"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="h-10 bg-black/20 border-white/10 text-white placeholder:text-white/40 pl-9 focus:bg-black/40 focus:border-primary/50"
                      min="1"
                    />
                  </div>

                  {/* Bathrooms */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      <Bath className="h-4 w-4" />
                    </div>
                    <Input
                      type="number"
                      placeholder="Banheiros"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="h-10 bg-black/20 border-white/10 text-white placeholder:text-white/40 pl-9 focus:bg-black/40 focus:border-primary/50"
                      min="1"
                    />
                  </div>

                  {/* Suites */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      <Hotel className="h-4 w-4" />
                    </div>
                    <Input
                      type="number"
                      placeholder="Suítes"
                      value={suites}
                      onChange={(e) => setSuites(e.target.value)}
                      className="h-10 bg-black/20 border-white/10 text-white placeholder:text-white/40 pl-9 focus:bg-black/40 focus:border-primary/50"
                      min="0"
                    />
                  </div>

                  {/* Garage - New Field */}
                  <div className="relative col-span-2">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      <Car className="h-4 w-4" />
                    </div>
                    <Input
                      type="number"
                      placeholder="Vagas de Garagem"
                      value={garage}
                      onChange={(e) => setGarage(e.target.value)}
                      className="h-10 bg-black/20 border-white/10 text-white placeholder:text-white/40 pl-9 focus:bg-black/40 focus:border-primary/50"
                      min="0"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-white text-primary hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                >
                  Buscar Agora
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
