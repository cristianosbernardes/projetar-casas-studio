import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bed, Bath, Car, Maximize, Home, MapPin, ChevronLeft, ChevronRight,
  Download, Share2, X
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProjectAddons from '@/components/checkout/ProjectAddons';
import { ModificationJourneyDialog } from '@/components/modals/ModificationJourneyDialog';
import { supabase, getOptimizedImageUrl } from '@/integrations/supabase/client';
import { formatCurrency } from "@/lib/utils";
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
  // 1. All Hooks Declarations at the TOP
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  // Track Views (Hook)
  useEffect(() => {
    if (slug) {
      // Fire and forget view increment
      supabase.rpc('increment_project_view', { p_slug: slug }).then(({ error }) => {
        if (error) console.error('Error tracking view:', error);
      });
    }
  }, [slug]);

  // Ensure images is always an array and sorted safely (Hook + Memo)
  const images = React.useMemo(() => {
    // Correctly handle null project inside the hook logic, not before calling it
    const imgs = project?.project_images;
    if (!imgs || !Array.isArray(imgs)) return [];

    return [...imgs].sort((a, b) => {
      const orderA = typeof a.display_order === 'number' ? a.display_order : 0;
      const orderB = typeof b.display_order === 'number' ? b.display_order : 0;
      return orderA - orderB;
    });
  }, [project?.project_images]); // Depend on the optional chain

  // 2. Helper Functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const currentImage = images[currentImageIndex];

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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

  // 3. Conditional Returns (only allowed AFTER all hooks)
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

  // Helper var for JSX
  const hasComplementaryProjects =
    (project.price_electrical && project.price_electrical > 0) ||
    (project.price_hydraulic && project.price_hydraulic > 0) ||
    (project.price_sanitary && project.price_sanitary > 0) ||
    (project.price_structural && project.price_structural > 0);

  return (
    <Layout>
      <div className="section-container pt-4 pb-8 lg:pt-6 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-primary">Início</a>
          <span>/</span>
          <a href="/projetos" className="hover:text-primary">Projetos</a>
          <span>/</span>
          <span className="text-foreground">{project.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left column - Images and Descriptions (Storytelling) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Main Image Carousel */}
            <div className="relative group">
              <div
                className="aspect-[16/9] rounded-2xl overflow-hidden bg-muted shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => setIsLightboxOpen(true)}
              >
                {currentImage ? (
                  <img
                    src={currentImage.image_url}
                    alt={`${project.title} - Imagem ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Home className="h-16 w-16" />
                  </div>
                )}

                {/* REMOVED HOVER OVERLAY AS REQUESTED */}
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm z-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-sm z-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium z-10">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-gray-900 ring-2 ring-gray-200' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}



            {/* Description Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Sobre o Projeto</h2>
              <div
                className="prose prose-green prose-lg max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: project.description || '<p>Este projeto foi desenvolvido para oferecer o máximo de conforto e funcionalidade para sua família.</p>' }}
              />
            </div>

            {/* Full Tech Specs */}
            <div className="space-y-6 pt-4 border-t border-gray-100 pb-12">
              <h2 className="text-2xl font-bold text-gray-900">Ficha Técnica Completa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Estilo</span>
                  <span className="font-bold text-gray-900">{project.style || 'Moderno'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Área Construída</span>
                  <span className="font-bold text-gray-900">{project.built_area}m²</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Terreno Mínimo</span>
                  <span className="font-bold text-gray-900">{project.width_meters}m x {project.depth_meters}m</span>
                </div>
                {project.suites > 0 && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Suítes</span>
                    <span className="font-bold text-gray-900">{project.suites}</span>
                  </div>
                )}
                {project.garage_spots > 0 && (
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <span className="text-gray-600 font-medium">Vagas de Garagem</span>
                    <span className="font-bold text-gray-900">{project.garage_spots}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Sticky Premium Buy Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-[#F3F4F6] rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">

                {/* Header (Title & Code) */}
                <div className="p-6 pb-4 border-b border-gray-100 bg-gray-50/30">
                  <div className="space-y-4">
                    {/* Badges Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {project.is_featured && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-sm px-2">Destaque</Badge>
                        )}
                        <Badge variant="outline" className="bg-white text-gray-700 border-gray-200">
                          {project.style || 'Moderno'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-sm">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cód.</span>
                        <span className="text-sm font-bold text-gray-900">{project.id?.slice(0, 4)}</span>
                      </div>
                    </div>

                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">{project.title}</h1>

                    {/* Visual Stats Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-green-200 transition-colors group">
                        <Bed className="h-4 w-4 text-gray-400 group-hover:text-green-500 mb-1 transition-colors" />
                        <span className="font-bold text-gray-900 text-sm leading-none">{project.bedrooms}</span>
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mt-1">Quartos</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-green-200 transition-colors group">
                        <Bath className="h-4 w-4 text-gray-400 group-hover:text-green-500 mb-1 transition-colors" />
                        <span className="font-bold text-gray-900 text-sm leading-none">{project.bathrooms}</span>
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mt-1">Banh.</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-green-200 transition-colors group">
                        <Maximize className="h-4 w-4 text-gray-400 group-hover:text-green-500 mb-1 transition-colors" />
                        <span className="font-bold text-gray-900 text-sm leading-none">{project.built_area}m²</span>
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mt-1">Área</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-green-200 transition-colors group">
                        <MapPin className="h-4 w-4 text-gray-400 group-hover:text-green-500 mb-1 transition-colors" />
                        <span className="font-bold text-gray-900 text-sm leading-none">{project.width_meters}x{project.depth_meters}</span>
                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mt-1">Dim.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-4 space-y-6">
                  {/* Addons & Price */}
                  {hasComplementaryProjects ? (
                    <ProjectAddons
                      project={project}
                      onCheckout={async (selected, total) => {
                        try {
                          const response = await fetch('/api/mock-checkout', {
                            method: 'POST',
                            body: JSON.stringify({ projectId: project.id, addons: selected })
                          });
                          console.log('Checkout initiated for:', project.title, selected);
                          await new Promise(r => setTimeout(r, 1500));
                          alert(`Pagamento Simulado com Sucesso!\n\nProjeto: ${project.title}\nAdicionais: ${selected.join(', ')}\nTotal: ${formatCurrency(total)}\n\n(ID da Sessão: mock_${Date.now()})`);
                        } catch (error) {
                          console.error('Checkout error:', error);
                          alert('Erro ao iniciar checkout.');
                        }
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <span className="block text-3xl font-bold text-gray-900">{formatCurrency(project.price)}</span>
                        <span className="text-xs text-muted-foreground">O melhor custo benefício</span>
                      </div>
                      <Button
                        className="w-full h-12 font-bold text-base bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                        onClick={() => handleWhatsAppWithPackages(['architectural'], project.price)}
                      >
                        Comprar Agora
                      </Button>
                    </div>
                  )}

                  {/* Secondary Actions */}
                  <div className="space-y-3 pt-2">
                    <ModificationJourneyDialog projectTitle={project.title} />
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 font-medium opacity-80">
                <span className="flex items-center gap-1">🔒 SSL Seguro</span>
                <span className="flex items-center gap-1">⚡ Entrega Digital</span>
                <span className="flex items-center gap-1">⭐ Suporte VIP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0 border-none bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 z-50 text-white/50 hover:text-white transition-colors p-2"
          >
            <X className="h-8 w-8" />
          </button>

          <div className="w-full h-full flex items-center justify-center relative">
            <img
              src={currentImage?.image_url}
              alt={project.title}
              className="max-w-full max-h-full object-contain pointer-events-none select-none"
            />

            {/* Lightbox Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProjectDetailPage;
