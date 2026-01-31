import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const ContactPage = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send an email
        window.open(`https://wa.me/5593999999999?text=Olá, vim pelo formulário de contato do site.`);
    };

    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-muted/30 py-16 lg:py-24">
                <div className="section-container text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Fale Conosco</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Estamos aqui para ajudar você a realizar o sonho da casa própria.
                        Entre em contato para tirar dúvidas, solicitar orçamentos ou parcerias.
                    </p>
                </div>
            </section>

            <div className="section-container py-16 -mt-10 relative z-10">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Telefone / WhatsApp</h3>
                                <p className="text-sm text-gray-500 mb-2">Seg a Sex, 8h às 18h</p>
                                <a href="tel:+5593999999999" className="text-primary font-semibold hover:underline">
                                    (93) 99999-9999
                                </a>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">E-mail</h3>
                                <p className="text-sm text-gray-500 mb-2">Para orçamentos e dúvidas</p>
                                <a href="mailto:contato@projetarcasas.com.br" className="text-primary font-semibold hover:underline block break-all">
                                    contato@projetarcasas.com.br
                                </a>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Escritório</h3>
                                <p className="text-sm text-gray-500">
                                    Santarém, PA<br />
                                    Brasil
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-full">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <MessageSquare className="h-6 w-6 text-primary" />
                                Envie uma mensagem
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                                        <Input placeholder="Seu nome" required className="bg-gray-50 border-gray-200 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                                        <Input placeholder="(00) 00000-0000" required className="bg-gray-50 border-gray-200 h-12" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">E-mail</label>
                                    <Input type="email" placeholder="seu@email.com" required className="bg-gray-50 border-gray-200 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Assunto</label>
                                    <Input placeholder="Sobre o que você quer falar?" required className="bg-gray-50 border-gray-200 h-12" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Mensagem</label>
                                    <Textarea
                                        placeholder="Escreva sua mensagem aqui..."
                                        className="bg-gray-50 border-gray-200 min-h-[150px] resize-none"
                                        required
                                    />
                                </div>

                                <Button type="submit" size="lg" className="w-full md:w-auto px-8 h-12 text-base">
                                    Enviar Mensagem
                                    <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ContactPage;
