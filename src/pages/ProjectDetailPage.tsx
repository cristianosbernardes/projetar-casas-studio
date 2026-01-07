import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Bed, Bath, Car, Maximize, Home, MapPin, ChevronLeft, ChevronRight,
  Download, Share2
} from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PackageSelector from '@/components/projects/PackageSelector';
import { supabase, getOptimizedImageUrl } from '@/integrations/supabase/client';
import type { ProjectWithImages, PackageType } from '@/types/database';

const packageNames: Record<PackageType, string> = {
  architectural: 'Arquitetônico',
  electrical: 'Elétrico',
  hydraulic: 'Hidráulico',
  sanitary: 'Sanitário',
  structural: 'Estrutural',
};

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (*)
        `)
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as ProjectWithImages | null;
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppWithPackages = (selected: PackageType[], total: number) => {
    const phoneNumber = '5593999999999';
    const packageList = selected.map(pkg => packageNames[pkg]).join(', ');
    const message = `Olá! Gostaria de adquirir o projeto "${project?.title}".\n\nProjetos selecionados: ${packageList}\nValor total: ${formatPrice(total)}\n\nPode me enviar mais informações?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: `Confira este projeto de casa: ${project?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="section-container py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="aspect-[16/9] bg-muted rounded-2xl" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Projeto não encontrado
          </h1>
          <p className="text-muted-foreground mb-8">
            O projeto que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => window.history.back()}>
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  const images = project.project_images?.sort((a, b) => a.display_order - b.display_order) || [];
  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Check if complementary projects are available
  const hasComplementaryProjects = 
    (project.price_electrical && project.price_electrical > 0) ||
    (project.price_hydraulic && project.price_hydraulic > 0) ||
    (project.price_sanitary && project.price_sanitary > 0) ||
    (project.price_structural && project.price_structural > 0);

  return (
    <Layout>
      <div className="section-container py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-primary">Início</a>
          <span>/</span>
          <a href="/projetos" className="hover:text-primary">Projetos</a>
          <span>/</span>
          <span className="text-foreground">{project.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column - Images and details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image Carousel */}
            <div className="relative">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
                {currentImage ? (
                  <img
                    src={getOptimizedImageUrl(currentImage.image_url, { width: 1200, quality: 85 })}
                    alt={`${project.title} - Imagem ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Home className="h-16 w-16" />
                  </div>
                )}
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getOptimizedImageUrl(image.image_url, { width: 160, quality: 70 })}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Descrição do Projeto</h2>
              <p className="text-muted-foreground leading-relaxed">
                {project.description || 
                  'Este projeto foi desenvolvido para oferecer o máximo de conforto e funcionalidade para sua família. Com ambientes bem distribuídos e acabamentos de qualidade, este é o lar ideal para você.'}
              </p>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Especificações Técnicas</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Área Construída</p>
                  <p className="text-xl font-semibold">{project.built_area}m²</p>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Terreno Mínimo</p>
                  <p className="text-xl font-semibold">{project.width_meters}m x {project.depth_meters}m</p>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Estilo</p>
                  <p className="text-xl font-semibold">{project.style || 'Moderno'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Purchase card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="card-premium p-6 space-y-6">
                {/* Title and badges */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {project.is_featured && (
                      <Badge className="bg-accent text-accent-foreground">Destaque</Badge>
                    )}
                    <Badge variant="secondary">{project.style || 'Moderno'}</Badge>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bed className="h-5 w-5" />
                    <span>{project.bedrooms} Quartos</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bath className="h-5 w-5" />
                    <span>{project.bathrooms} Banheiros</span>
                  </div>
                  {project.suites > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bed className="h-5 w-5" />
                      <span>{project.suites} Suíte{project.suites > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {project.garage_spots > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Car className="h-5 w-5" />
                      <span>{project.garage_spots} Vaga{project.garage_spots > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Maximize className="h-5 w-5" />
                    <span>{project.built_area}m²</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{project.width_meters}x{project.depth_meters}m</span>
                  </div>
                </div>

                {/* Package Selector or Simple Price */}
                {hasComplementaryProjects ? (
                  <PackageSelector
                    project={project}
                    onWhatsAppClick={handleWhatsAppWithPackages}
                  />
                ) : (
                  <>
                    {/* Price */}
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">Valor do Projeto Arquitetônico</p>
                      <p className="text-4xl font-bold text-primary">{formatPrice(project.price)}</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={() => handleWhatsAppWithPackages(['architectural'], project.price)}
                      >
                        Solicitar via WhatsApp
                      </Button>
                    </div>
                  </>
                )}

                {/* Secondary actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <Button variant="outline" size="lg">
                    <Download className="h-5 w-5 mr-2" />
                    Info PDF
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleShare}>
                    <Share2 className="h-5 w-5 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="p-4 bg-secondary rounded-xl text-center">
                <p className="text-sm text-secondary-foreground">
                  ✓ Entrega imediata após pagamento<br />
                  ✓ Suporte técnico incluso<br />
                  ✓ Pagamento seguro
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetailPage;
