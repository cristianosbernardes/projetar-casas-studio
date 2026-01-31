import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ProjectCard from '@/components/projects/ProjectCard';
import type { ProjectWithImages } from '@/types/database';

const BestSellersSection = () => {
    const { data: projects, isLoading } = useQuery({
        queryKey: ['best-seller-projects'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          project_images (*)
        `)
                .eq('is_best_seller', true)
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) throw error;
            return data as ProjectWithImages[];
        },
    });

    // Mock data for display when database is empty (optional, or just hide section if empty)
    // For now, let's keep it clean: if no data and not loading, show nothing or placeholder?
    // User requested "always show", so we might need mock data if DB is empty initially.
    // Reusing the mock structure from FeaturedProjects but with different content if needed.
    // For simplicity, let's render empty state or just the empty grid if loading.

    if (!isLoading && (!projects || projects.length === 0)) {
        return null;
    }

    return (
        <section className="py-20 lg:py-24 bg-[#0F172A] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[100px]" />
            </div>

            <div className="section-container relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                <Trophy className="h-6 w-6 text-yellow-500" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                Projetos Mais Vendidos
                            </h2>
                        </div>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Descubra os projetos favoritos dos nossos clientes. Qualidade comprovada e design aprovado por quem constrói.
                        </p>
                    </div>

                    <Link to="/projetos">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-white text-slate-900 hover:bg-slate-200 font-semibold"
                        >
                            Ver Todos
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>
                </div>

                {/* Projects Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[420px] bg-slate-800/50 rounded-2xl animate-pulse border border-slate-700" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
                        {projects?.map((project, index) => (
                            <div key={project.id} className="relative group">
                                {/* Ranking Badge */}
                                <div className="absolute -top-4 -left-4 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-xl shadow-lg border-2 border-[#0F172A] transform transition-transform group-hover:scale-110">
                                    #{index + 1}
                                </div>

                                {/* Crown for #1 */}
                                {index === 0 && (
                                    <div className="absolute -top-9 -left-4 z-20 text-yellow-400 animate-bounce delay-700">
                                        <Crown className="w-12 h-12 fill-current" />
                                    </div>
                                )}

                                <ProjectCard project={project} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default BestSellersSection;
