import Layout from '@/components/layout/Layout';
import { CheckCircle2, Trophy, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    const stats = [
        { label: 'Projetos Vendidos', value: '+5.000', icon: Trophy },
        { label: 'Clientes Satisfeitos', value: '100%', icon: Users },
        { label: 'Anos de Experiência', value: '12+', icon: Building2 },
    ];

    const benefits = [
        {
            title: 'Projetos Completos',
            description: 'Receba todos os detalhamentos necessários para a construção da sua casa, desde a arquitetura até a estrutura.'
        },
        {
            title: 'Economia na Obra',
            description: 'Um projeto bem planejado evita desperdícios de materiais e retrabalhos, gerando economia real na construção.'
        },
        {
            title: 'Profissionais Qualificados',
            description: 'Equipe formada por arquitetos e engenheiros experientes e registrados nos conselhos de classe (CAU/CREA).'
        },
        {
            title: 'Suporte Técnico',
            description: 'Tire suas dúvidas diretamente com nossa equipe técnica durante a execução da sua obra.'
        }
    ];

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-primary py-24 text-primary-foreground overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="section-container relative z-10 text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Construindo Sonhos</h1>
                    <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto font-light">
                        Somos especialistas em transformar ideias em lares. Projetos de alta qualidade, acessíveis e prontos para construir.
                    </p>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white -mt-16 relative z-20">
                <div className="section-container">
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <div className="grid md:grid-cols-3 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="flex flex-col items-center text-center space-y-2 p-4">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary mb-2">
                                        <stat.icon className="h-8 w-8" />
                                    </div>
                                    <span className="text-4xl font-bold text-gray-900">{stat.value}</span>
                                    <span className="text-muted-foreground font-medium">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-background">
                <div className="section-container">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Quem Somos</h2>
                            <div className="space-y-4 text-muted-foreground leading-relaxed">
                                <p>
                                    A <strong>Projetar Casas</strong> nasceu com a missão de democratizar o acesso à arquitetura de qualidade no Brasil. Acreditamos que todos merecem morar em uma casa bem planejada, segura e funcional.
                                </p>
                                <p>
                                    Combinamos a expertise técnica de engenheiros e arquitetos renomados com a tecnologia digital para oferecer projetos completos por uma fração do custo de um escritório tradicional.
                                </p>
                                <p>
                                    Não vendemos apenas desenhos; vendemos a segurança de construir certo, a economia de materiais e a realização do sonho da casa própria.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Link to="/projetos">
                                    <Button size="lg" className="px-8">Conheça Nossos Projetos</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Escritório de Arquitetura"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs hidden md:block">
                                <p className="font-serif italic text-gray-600">
                                    "A arquitetura é o jogo sábio, correto e magnífico dos volumes dispostos sob a luz."
                                </p>
                                <p className="text-right text-sm font-bold mt-2 text-primary">— Le Corbusier</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-muted/30">
                <div className="section-container">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher a Projetar Casas?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Nossos diferenciais garantem que você tenha a melhor experiência antes, durante e depois da obra.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-primary mb-6">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default AboutPage;
