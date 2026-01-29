import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Loader2, ArrowRight, CheckCircle2, Ruler,
    PenTool, MessageCircle, Lightbulb, Map, Star,
    Mountain, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils'; // Ensure utils are imported for cn if needed, or implement generic

const CustomProjectPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        width: '',
        depth: '',
        description: '',
        topography: 'flat', // flat, uphill, downhill
        phase: 'idea', // idea, planning, building
        timeline: '',
        want_bbq: false,
        want_call: false,
        call_time: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('modification_requests').insert({
                name: formData.name,
                email: formData.email,
                whatsapp: formData.whatsapp,
                width: formData.width,
                depth: formData.depth,
                description: formData.description,
                topography: formData.topography,
                phase: formData.phase,
                timeline: formData.timeline,
                want_bbq: formData.want_bbq,
                want_call: formData.want_call,
                call_time: formData.call_time,
                project_title: 'Projeto Personalizado',
                source: 'custom_project_page',
                status: 'new'
            } as any);

            if (error) throw error;

            toast({
                title: "Solicitação Recebida!",
                description: "Vamos analisar seu terreno e entrar em contato.",
                duration: 5000,
            });

            const phoneNumber = '5593999999999';
            const message = `Olá! Preenchi o formulário de Projeto Personalizado.\n\n*Cliente:* ${formData.name}\n*Fase:* ${formData.phase}\n*Topografia:* ${formData.topography}`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');

            setFormData({
                name: '',
                email: '',
                whatsapp: '',
                width: '',
                depth: '',
                description: '',
                topography: 'flat',
                phase: 'idea',
                timeline: '',
                want_bbq: false,
                want_call: false,
                call_time: ''
            });

        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                title: "Erro ao enviar",
                description: "Tente novamente ou chame no WhatsApp.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const topographyOptions = [
        { id: 'flat', label: 'Plano', icon: Minus },
        { id: 'uphill', label: 'Aclive (Sobe)', icon: ArrowUpRight },
        { id: 'downhill', label: 'Declive (Desce)', icon: ArrowDownRight },
    ];

    const phaseOptions = [
        { id: 'idea', label: 'Apenas uma ideia' },
        { id: 'planning', label: 'Planejamento' },
        { id: 'building', label: 'Pronto p/ Construir' },
    ];

    return (
        <Layout>
            {/* Hero Section */}
            <div className="relative bg-neutral-900 text-white pt-12 pb-24 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                </div>

                <div className="section-container relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm font-medium animate-fade-in-up">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>Exclusividade e Alta Performance</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-4xl mx-auto text-white">
                        Sua Casa, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Sua Assinatura.</span>
                    </h1>

                    <p className="text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                        Transformamos terrenos brutos em obras de arte habitáveis.
                        Projetos personalizados que unem estética, funcionalidade e o seu estilo de vida.
                    </p>
                </div>
            </div>

            {/* Informative Cards Section */}
            <div className="section-container -mt-12 relative z-20 pb-16">
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-6 space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                                <Map className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">1. Análise do Terreno</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                Estudamos a topografia, insolação e ventilação do seu lote para garantir eficiência energética.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-6 space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                                <Lightbulb className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">2. Briefing Criativo</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                Entendemos sua rotina e desejos. Piscina integrada? Escritório? Tudo desenhado para você.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-md border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-6 space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                                <PenTool className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">3. Projeto Executivo</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                Entregamos plantas técnicas completas prontas para aprovação e construção segura.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-neutral-50 pb-24">
                <div className="section-container px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
                        <div className="grid md:grid-cols-5 h-full">

                            {/* Left Side (Decorative) */}
                            <div className="hidden md:block md:col-span-2 bg-neutral-900 relative p-8 text-white flex-col justify-between">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
                                </div>

                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">Vamos conversar?</h3>
                                        <p className="text-neutral-400 text-sm">Preencha o formulário e receba um orçamento preliminar de acordo com suas necessidades.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                                            <span className="text-sm">Atendimento via WhatsApp</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                                            <span className="text-sm">Arquitetos Especialistas</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                                            <span className="text-sm">Suporte Pós-Entrega</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/10">
                                        <p className="text-xs text-neutral-500">
                                            "A arquitetura começa quando você coloca dois tijolos juntos com cuidado." <br />
                                            <span className="italic mt-1 block">- Ludwig Mies van der Rohe</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side (Form) */}
                            <div className="md:col-span-3 p-6 md:p-10">
                                <form onSubmit={handleSubmit} className="space-y-8">

                                    {/* Dimensions & Topography */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">O Terreno</Label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Input
                                                    name="width"
                                                    type="number"
                                                    placeholder="Largura (m)"
                                                    className="pl-8"
                                                    value={formData.width}
                                                    onChange={handleChange}
                                                />
                                                <Ruler className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    name="depth"
                                                    type="number"
                                                    placeholder="Fundo (m)"
                                                    className="pl-8"
                                                    value={formData.depth}
                                                    onChange={handleChange}
                                                />
                                                <Ruler className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {topographyOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    onClick={() => handleSelectChange('topography', option.id)}
                                                    className={`cursor-pointer border rounded-lg p-2 text-center transition-all hover:bg-neutral-50 ${formData.topography === option.id ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-neutral-200'}`}
                                                >
                                                    <option.icon className={`w-5 h-5 mx-auto mb-1 ${formData.topography === option.id ? 'text-emerald-600' : 'text-neutral-400'}`} />
                                                    <span className={`text-[10px] uppercase font-bold ${formData.topography === option.id ? 'text-emerald-700' : 'text-neutral-500'}`}>{option.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Phase & Timeline */}
                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Momento da Obra</Label>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <Select onValueChange={(val) => handleSelectChange('phase', val)} value={formData.phase}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Fase atual" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {phaseOptions.map(opt => (
                                                        <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                name="timeline"
                                                placeholder="Previsão de Início (ex: 2024)"
                                                value={formData.timeline}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Extras */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Desejos Especiais</Label>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-neutral-50 cursor-pointer w-full sm:w-auto" onClick={() => handleCheckboxChange('want_bbq', !formData.want_bbq)}>
                                                <Checkbox
                                                    id="want_bbq"
                                                    checked={formData.want_bbq}
                                                    onCheckedChange={(checked) => handleCheckboxChange('want_bbq', checked as boolean)}
                                                />
                                                <label
                                                    htmlFor="want_bbq"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    Área Gourmet / Churrasqueira
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Detalhes do Sonho</Label>
                                        <Textarea
                                            name="description"
                                            required
                                            placeholder="Descreva quartos, estilo da fachada, e o que mais não pode faltar..."
                                            className="min-h-[80px] resize-none text-sm"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Contact Section - More Compact */}
                                    <div className="space-y-4 pt-4 border-t border-neutral-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                name="name"
                                                required
                                                placeholder="Nome Completo"
                                                className="bg-neutral-50"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                            <Input
                                                name="whatsapp"
                                                required
                                                placeholder="WhatsApp (com DDD)"
                                                className="bg-neutral-50"
                                                value={formData.whatsapp}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <Input
                                            name="email"
                                            required
                                            type="email"
                                            placeholder="E-mail principal"
                                            className="bg-neutral-50"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />

                                        <div className="flex items-center space-x-2 mt-2">
                                            <Checkbox
                                                id="want_call"
                                                checked={formData.want_call}
                                                onCheckedChange={(checked) => handleCheckboxChange('want_call', checked as boolean)}
                                            />
                                            <label htmlFor="want_call" className="text-sm text-neutral-500 cursor-pointer select-none">
                                                Prefiro receber uma ligação telefônica
                                            </label>
                                        </div>

                                        {formData.want_call && (
                                            <Input
                                                name="call_time"
                                                placeholder="Melhor horário para ligarmos"
                                                className="bg-neutral-50 animate-fade-in"
                                                value={formData.call_time}
                                                onChange={handleChange}
                                            />
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Solicitar Análise de Projeto
                                                <ArrowRight className="ml-2 w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CustomProjectPage;
