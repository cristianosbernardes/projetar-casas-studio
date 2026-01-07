import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import heroImage from '@/assets/hero-house.jpg';

const HeroSection = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (width) params.set('width', width);
    if (depth) params.set('depth', depth);
    navigate(`/projetos?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Casa moderna"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-container py-20">
        <div className="max-w-2xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground backdrop-blur-sm border border-primary/30">
            <span className="text-sm font-medium">✨ Mais de 100 projetos disponíveis</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
            Construa o Lar dos Seus{' '}
            <span className="text-primary">Sonhos</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
            Plantas de casas prontas, projetadas por arquitetos experientes. 
            Encontre o projeto ideal para o seu terreno e comece a construir hoje.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="search-box max-w-xl">
            <p className="text-sm font-medium text-foreground mb-4">
              Busque por dimensões do terreno
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="width" className="text-xs text-muted-foreground mb-1 block">
                  Frente (metros)
                </label>
                <Input
                  id="width"
                  type="number"
                  placeholder="Ex: 10"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="h-12"
                  min="1"
                  step="0.5"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="depth" className="text-xs text-muted-foreground mb-1 block">
                  Fundo (metros)
                </label>
                <Input
                  id="depth"
                  type="number"
                  placeholder="Ex: 20"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="h-12"
                  min="1"
                  step="0.5"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" size="lg" className="h-12 px-6">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/projetos')}
              className="bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
            >
              Ver Todos os Projetos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
