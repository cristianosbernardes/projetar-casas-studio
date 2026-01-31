import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, Download, Hammer, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
    const steps = [
        {
            icon: Search,
            title: '1. Escolha o Projeto',
            description: 'Navegue pelo nosso catálogo e utilize os filtros inteligentes para encontrar o projeto ideal para o seu terreno e suas necessidades.'
        },
        {
            icon: ShoppingCart,
            title: '2. Compra Segura',
            description: 'Adicione os projetos complementares que desejar (elétrico, hidráulico, etc.) e finalize sua compra com segurança total.'
        },
        {
            icon: Download,
            title: '3. Download Imediato',
            description: 'Assim que o pagamento for confirmado, você recebe o acesso para baixar todos os arquivos do projeto (PDF e DWG/CAD) na hora.'
        },
        {
            icon: Hammer,
            title: '4. Construa seu Sonho',
            description: 'Com o projeto em mãos, entregue para seu engenheiro ou mestre de obras e comece a construir. Estamos aqui para tirar dúvidas.'
        }
    ];

    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-gray-900 text-white py-24 text-center">
                <div className="section-container">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Como Funciona?</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Entenda o processo simples e rápido para adquirir seu projeto e começar sua obra.
                    </p>
                </div>
            </section>

            {/* Steps Timeline */}
            <section className="py-20 bg-background overflow-hidden">
                <div className="section-container">
                    <div className="relative">
                        {/* Connection Line (Desktop) */}
                        <div className="hidden lg:block absolute top-12 left-0 w-full h-1 bg-gray-100 -z-10"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {steps.map((step, index) => (
                                <div key={index} className="relative group">
                                    <div className="bg-white p-2 rounded-full w-24 h-24 flex items-center justify-center border-4 border-gray-100 mx-auto mb-6 shadow-sm group-hover:border-primary/20 group-hover:scale-110 transition-all z-10 relative">
                                        <div className="bg-primary/10 w-full h-full rounded-full flex items-center justify-center text-primary">
                                            <step.icon className="h-8 w-8" />
                                        </div>
                                    </div>

                                    <div className="text-center space-y-3 px-4">
                                        <h3 className="font-bold text-xl text-gray-900">{step.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Arrow for mobile/tablet flow */}
                                    {index < steps.length - 1 && (
                                        <div className="lg:hidden flex justify-center py-4 text-gray-300">
                                            <ArrowRight className="h-6 w-6 rotate-90 md:rotate-0" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ / Doubts */}
            <section className="py-20 bg-muted/30">
                <div className="section-container text-center space-y-8">
                    <h2 className="text-3xl font-bold text-gray-900">Ainda tem dúvidas?</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Nossa equipe de especialistas está pronta para te atender e ajudar na escolha do melhor projeto.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/contato">
                            <Button size="lg" className="px-8 bg-green-600 hover:bg-green-700">Falar no WhatsApp</Button>
                        </Link>
                        <Link to="/projetos">
                            <Button size="lg" variant="outline" className="px-8">Ver Catálogo</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default HowItWorksPage;
