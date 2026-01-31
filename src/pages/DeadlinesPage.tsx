import Layout from '@/components/layout/Layout';
import { Clock, Download, FileCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DeadlinesPage = () => {
    return (
        <Layout>
            <div className="section-container py-12 lg:py-24">
                <div className="max-w-4xl mx-auto space-y-12">

                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary mb-4">
                            <Clock className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Prazos e Entregas</h1>
                        <p className="text-lg text-muted-foreground">
                            Transparência total sobre quando você receberá seus projetos.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {/* Instant Delivery */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-green-100 flex flex-col md:flex-row gap-6 items-start">
                            <div className="p-4 bg-green-50 rounded-xl shrink-0">
                                <Download className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-900">Projetos Prontos (Catálogo)</h2>
                                <p className="text-muted-foreground">
                                    Para todos os projetos disponíveis em nosso site (Arquitetônico, Elétrico, Hidráulico, etc).
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="font-bold text-green-600 text-lg">Entrega Imediata</span>
                                    <span className="text-sm text-gray-500">(Após confirmação do pagamento)</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    • PIX/Cartão: Liberação automática em minutos.<br />
                                    • Boleto: Liberação em 1 a 2 dias úteis (compensação bancária).
                                </p>
                            </div>
                        </div>

                        {/* Custom Modifications */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-blue-100 flex flex-col md:flex-row gap-6 items-start">
                            <div className="p-4 bg-blue-50 rounded-xl shrink-0">
                                <FileCheck className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-900">Pequenas Modificações</h2>
                                <p className="text-muted-foreground">
                                    Alterações simples solicitadas em projetos existentes (ex: espelhar planta, mudar layout interno).
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="font-bold text-blue-600 text-lg">3 a 5 dias úteis</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    O prazo conta a partir da reunião de briefing ou aprovação do orçamento da modificação.
                                </p>
                            </div>
                        </div>

                        {/* Custom Projects */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-purple-100 flex flex-col md:flex-row gap-6 items-start">
                            <div className="p-4 bg-purple-50 rounded-xl shrink-0">
                                <Truck className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-900">Projetos Personalizados</h2>
                                <p className="text-muted-foreground">
                                    Criação do zero, exclusiva para o seu terreno e necessidades.
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="font-bold text-purple-600 text-lg">15 a 30 dias úteis</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Depende da complexidade e da área construída. O cronograma detalhado é enviado na proposta comercial.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-8">
                        <p className="text-muted-foreground mb-4">Ainda tem dúvidas sobre sua entrega?</p>
                        <Link to="/contato">
                            <Button variant="outline">Falar com Suporte</Button>
                        </Link>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default DeadlinesPage;
