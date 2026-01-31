import { useFavorites } from '@/contexts/FavoritesContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProjectWithImages } from '@/types/database';
import ProjectCard from '@/components/projects/ProjectCard';
import Layout from '@/components/layout/Layout';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
    const { favorites } = useFavorites();

    const { data: projects, isLoading } = useQuery({
        queryKey: ['favorites', favorites],
        queryFn: async () => {
            if (favorites.length === 0) return [];

            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          project_images (*)
        `)
                .in('id', favorites)
                .eq('status', 'published');

            if (error) throw error;
            return data as ProjectWithImages[];
        },
        enabled: favorites.length > 0,
    });

    return (
        <Layout>
            <div className="bg-muted/30 min-h-screen py-12 lg:py-16">
                <div className="section-container">
                    <div className="flex flex-col gap-6 mb-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
                                <p className="text-muted-foreground mt-1">
                                    Gerencie sua lista de projetos selecionados
                                </p>
                            </div>
                        </div>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                            <div className="p-6 bg-red-50 rounded-full mb-6">
                                <Heart className="h-12 w-12 text-red-200" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Sua lista está vazia</h3>
                            <p className="text-muted-foreground text-center max-w-sm mb-8">
                                Você ainda não favoritou nenhum projeto. Explore nosso catálogo e clique no coração ❤️ para salvar os que mais gostar.
                            </p>
                            <Link to="/projetos">
                                <Button size="lg" className="gap-2">
                                    Ver Projetos
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    ) : isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="card-premium animate-pulse h-[400px]" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 stagger-children">
                            {projects?.map((project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default FavoritesPage;
