import Layout from '@/components/layout/Layout';
import { Printer, FileInput, Map, CheckCircle2 } from 'lucide-react';

const PrintingGuidePage = () => {
    return (
        <Layout>
            <div className="section-container py-12 lg:py-24">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary mb-4">
                            <Printer className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Guia de Impressão (Plotagem)</h1>
                        <p className="text-lg text-muted-foreground">
                            Entenda como imprimir seu projeto da maneira correta para levar à obra ou aprovar na prefeitura.
                        </p>
                    </div>

                    {/* What is plotting? */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Map className="h-6 w-6 text-primary" />
                            O que é Plotagem?
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Plotagem é a impressão de desenhos técnicos em grandes formatos (folhas A1, A0, etc.).
                            Diferente de impressoras comuns (A4), as plotters mantêm a escala correta do projeto,
                            garantindo que 1cm no papel corresponda exatamente à medida real planejada (ex: 1:50 ou 1:100).
                        </p>
                    </section>

                    {/* How to print */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Passo a Passo</h2>

                            <div className="flex gap-4 items-start">
                                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                                <div>
                                    <h3 className="font-semibold text-lg">Baixe os Arquivos</h3>
                                    <p className="text-muted-foreground text-sm">Após a compra, faça o download do arquivo PDF (pronto para imprimir) e DWG (editável).</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                                <div>
                                    <h3 className="font-semibold text-lg">Leve à Copiadora</h3>
                                    <p className="text-muted-foreground text-sm">Procure uma gráfica especializada em "Plotagem de Engenharia/Arquitetura". Papelarias comuns não fazem esse serviço.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                                <div>
                                    <h3 className="font-semibold text-lg">Solicite a Escala</h3>
                                    <p className="text-muted-foreground text-sm">Peça para imprimir o PDF "em tamanho real" ou "escala 100%". Nossos arquivos já vêm configurados nas pranchas corretas (A1 ou A0).</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-6 rounded-2xl">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <FileInput className="h-5 w-5" />
                                Formatos Disponíveis
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span><strong>PDF Plotado:</strong> Pronto para impressão. Já vem com margens, selo e escala.</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span><strong>DWG (AutoCAD):</strong> Arquivo aberto. Seu engenheiro pode editar se necessário.</span>
                                </li>
                            </ul>
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                <strong>Dica:</strong> Sempre imprima pelo menos 2 cópias (uma para deixar na obra e outra limpa para guardar ou levar à prefeitura).
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default PrintingGuidePage;
