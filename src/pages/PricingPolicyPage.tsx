import Layout from '@/components/layout/Layout';
import { DollarSign, ShieldCheck, HelpCircle } from 'lucide-react';

const PricingPolicyPage = () => {
    return (
        <Layout>
            <div className="section-container py-12 lg:py-24">
                <div className="max-w-4xl mx-auto space-y-12">

                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary mb-4">
                            <DollarSign className="h-8 w-8" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">Política de Preços</h1>
                        <p className="text-lg text-muted-foreground">
                            Entenda como cobramos e por que nossos projetos têm o melhor custo-benefício.
                        </p>
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p>
                            A Projetar Casas tem como missão democratizar a arquitetura. Graças à nossa tecnologia de repetibilidade, conseguimos oferecer projetos de alto padrão por uma fração do preço de um escritório tradicional.
                        </p>
                        <h3>O que está incluso no preço?</h3>
                        <p>
                            O valor exibido no site refere-se ao <strong>Projeto Arquitetônico Completo</strong>. Isso inclui:
                        </p>
                        <ul>
                            <li>Planta Baixa Executiva (com medidas);</li>
                            <li>Fachada 3D e Cortes;</li>
                            <li>Planta de Cobertura;</li>
                            <li>Quadro de Esquadrias;</li>
                            <li>Arquivos em PDF e DWG.</li>
                        </ul>
                        <p>
                            Projetos complementares (Elétrico, Hidráulico, Estrutural) são vendidos separadamente como "Adicionais" no checkout, permitindo que você compre apenas o que precisa.
                        </p>

                        <h3>Formas de Pagamento</h3>
                        <p>Aceitamos as principais formas de pagamento do mercado:</p>
                        <ul>
                            <li><strong>PIX:</strong> Aprovação instantânea (melhor opção para urgência).</li>
                            <li><strong>Cartão de Crédito:</strong> Parcelamento em até 12x.</li>
                            <li><strong>Boleto Bancário:</strong> Vencimento em 3 dias úteis.</li>
                        </ul>

                        <div className="not-prose bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 mt-8">
                            <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-blue-900 text-lg mb-1">Garantia Legal</h4>
                                <p className="text-blue-800 text-sm">
                                    Todos os projetos são desenvolvidos por profissionais habilitados. Caso encontre qualquer erro técnico incoerente que impeça a construção, oferecemos suporte gratuito para correção ou reembolso integral.
                                </p>
                            </div>
                        </div>

                        <h3>Reembolsos e Cancelamentos</h3>
                        <p>
                            Como se trata de um <strong>produto digital com download imediato</strong>, o Código de Defesa do Consumidor trata de forma específica.
                            Caso o arquivo não tenha sido baixado, é possível solicitar o cancelamento em até 7 dias.
                            Após o download (consumo do produto), o reembolso só é aplicável em casos de defeito técnico comprovado.
                        </p>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default PricingPolicyPage;
