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
    PenTool, MessageCircle, Lightbulb, Map as MapIcon, Star,
    Mountain, ArrowUpRight, ArrowDownRight, AlignLeft, Minus, Phone,
    Check, Home, Video, Calendar, User, FileText, Info, Upload, File, Plus
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { COUNTRIES } from "@/lib/countries";

const CustomProjectPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        width: '',
        backWidth: '',
        depth: '',
        description: '',
        topography: 'flat', // flat, uphill, downhill
        want_bbq: false,
        want_call: false,
        call_time: '',
        country: 'BR',
        country_ddi: '+55',
        attachment_url: null as string | null
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
            const { error } = await supabase.from('leads').insert({
                name: formData.name,
                email: formData.email,
                phone: `${formData.country_ddi}${formData.whatsapp.replace(/\D/g, '')}`,
                width: `Frente: ${formData.width}m / Fundo: ${formData.backWidth || '?'}m`,
                depth: formData.depth,
                message: formData.description,
                topography: formData.topography,
                want_bbq: formData.want_bbq,
                want_call: formData.want_call,
                call_time: formData.call_time,
                source: 'custom_project_page',
                country: formData.country,
                country_ddi: formData.country_ddi,
                attachment_url: formData.attachment_url,
                status: 'new'
            } as any);

            if (error) throw error;

            toast({
                title: "Solicitação Recebida!",
                description: "Vamos analisar seu terreno e entrar em contato.",
                duration: 5000,
                className: "bg-emerald-600 text-white border-emerald-700",
            });

            // WhatsApp redirection removed as per user request
            // const phoneNumber = '5593999999999';
            // const message = `Olá! Preenchi o formulário de Projeto Personalizado.\n\n*Cliente:* ${formData.name}\n*Topografia:* ${formData.topography}`;
            // window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');

            setFormData({
                name: '',
                email: '',
                whatsapp: '',
                width: '',
                backWidth: '',
                depth: '',
                description: '',
                topography: 'flat',
                want_bbq: false,
                want_call: false,
                call_time: '',
                country: 'BR',
                country_ddi: '+55',
                attachment_url: null
            });

        } catch (error: any) {
            console.error('Error submitting form:', error);
            toast({
                title: "Erro ao enviar",
                description: error.message || "Tente novamente ou chame no WhatsApp.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

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
                            <MapIcon className="w-6 h-6 text-emerald-600" />
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

                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'flat', label: 'Plano', icon: AlignLeft, rotate: 90 },
                                                { id: 'uphill', label: 'Aclive (Sobe)', icon: ArrowUpRight, rotate: 0 },
                                                { id: 'downhill', label: 'Declive (Desce)', icon: ArrowDownRight, rotate: 0 },
                                            ].map((option) => (
                                                <div
                                                    key={option.id}
                                                    onClick={() => handleSelectChange('topography', option.id)}
                                                    className={cn(
                                                        "cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-200 hover:scale-[1.02] flex flex-col items-center justify-center gap-2 h-28",
                                                        formData.topography === option.id
                                                            ? "border-green-500 bg-green-50 shadow-sm"
                                                            : "border-gray-100 hover:border-green-500/30 bg-white"
                                                    )}
                                                >
                                                    <option.icon
                                                        className={cn(
                                                            "h-10 w-10",
                                                            option.rotate === 90 && "rotate-90",
                                                            formData.topography === option.id ? "text-green-600" : "text-gray-400"
                                                        )}
                                                    />
                                                    <span className={cn("text-xs uppercase font-bold", formData.topography === option.id ? "text-green-800" : "text-neutral-500")}>
                                                        {option.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 pt-2">
                                            <div className="relative group col-span-1">
                                                <Label className="absolute -top-2 left-3 bg-white px-1 text-xs text-neutral-400 font-bold z-10 w-max uppercase">Frente (m)</Label>
                                                <Input
                                                    name="width"
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="h-12 pt-2 border-gray-200 focus:border-green-500 bg-gray-50/30"
                                                    value={formData.width}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="relative group col-span-1">
                                                <Label className="absolute -top-2 left-3 bg-white px-1 text-xs text-neutral-400 font-bold z-10 w-max uppercase">Fundo (m)</Label>
                                                <Input
                                                    name="backWidth"
                                                    // @ts-ignore
                                                    value={formData.backWidth || ''}
                                                    onChange={handleChange}
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="h-12 pt-2 border-gray-200 focus:border-green-500 bg-gray-50/30"
                                                />
                                            </div>
                                            <div className="relative group col-span-1">
                                                <Label className="absolute -top-2 left-3 bg-white px-1 text-xs text-neutral-400 font-bold z-10 w-max uppercase">Comp. (m)</Label>
                                                <Input
                                                    name="depth"
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="h-12 pt-2 border-gray-200 focus:border-green-500 bg-gray-50/30"
                                                    value={formData.depth}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Desejos Especiais</Label>

                                        <div className="flex flex-col gap-4">
                                            <div
                                                onClick={() => handleCheckboxChange('want_bbq', !formData.want_bbq)}
                                                className={cn(
                                                    "cursor-pointer rounded-xl border p-4 flex items-center gap-3 transition-all duration-200 hover:bg-gray-50",
                                                    formData.want_bbq ? "border-green-500 bg-green-50/50" : "border-gray-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                                                    formData.want_bbq ? "bg-green-500 border-green-500" : "border-gray-300 bg-white"
                                                )}>
                                                    {formData.want_bbq && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                                <span className="font-medium text-sm text-gray-700">Área Gourmet / Churrasqueira</span>
                                            </div>

                                            {/* File Upload Section */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Anexar Arquivo (PDF ou Imagem)</Label>
                                                <div className="flex items-center gap-3">
                                                    <Input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        className="hidden"
                                                        id="file-upload"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            try {
                                                                setUploadingFile(true);
                                                                const fileExt = file.name.split('.').pop();
                                                                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                                                                const filePath = `${fileName}`;
                                                                const bucketName = 'Projetos personalizados';

                                                                const { error: uploadError } = await supabase.storage
                                                                    .from(bucketName)
                                                                    .upload(filePath, file);

                                                                if (uploadError) {
                                                                    throw uploadError;
                                                                }

                                                                const { data: { publicUrl } } = supabase.storage
                                                                    .from(bucketName)
                                                                    .getPublicUrl(filePath);

                                                                setFormData(prev => ({ ...prev, attachment_url: publicUrl }));
                                                                toast({ title: "Arquivo anexado com sucesso!" });
                                                            } catch (error) {
                                                                console.error('Error uploading file:', error);
                                                                toast({
                                                                    title: "Erro ao anexar arquivo",
                                                                    description: "Tente novamente ou envie pelo WhatsApp.",
                                                                    variant: "destructive"
                                                                });
                                                            } finally {
                                                                setUploadingFile(false);
                                                            }
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor="file-upload"
                                                        className={cn(
                                                            "flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 w-full transition-colors h-12",
                                                            formData.attachment_url ? "bg-green-50 border-green-200 text-green-700" : "text-gray-500"
                                                        )}
                                                    >
                                                        {uploadingFile ? (
                                                            <span className="animate-pulse">Enviando...</span>
                                                        ) : formData.attachment_url ? (
                                                            <>
                                                                <Check className="h-4 w-4" />
                                                                Arquivo Anexado
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="h-4 w-4" />
                                                                Clique para selecionar
                                                            </>
                                                        )}
                                                    </Label>
                                                    {formData.attachment_url && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => setFormData(prev => ({ ...prev, attachment_url: null }))}
                                                        >
                                                            <div className="rotate-45"><Plus className="h-5 w-5" /></div>
                                                        </Button>
                                                    )}
                                                </div>
                                                {formData.attachment_url && (
                                                    <a href={formData.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 pl-1">
                                                        <File className="h-3 w-3" /> Ver arquivo anexado
                                                    </a>
                                                )}
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

                                            <div className="relative group">
                                                <Input
                                                    name="email"
                                                    required
                                                    type="email"
                                                    placeholder="E-mail principal"
                                                    className={cn(
                                                        "bg-neutral-50",
                                                        formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""
                                                    )}
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                                {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                                                    <p className="text-[10px] text-red-500 absolute -bottom-4 left-0">Digite um e-mail válido</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Localização</Label>
                                            <div className="flex gap-2 relative">
                                                <div className="w-[140px]">
                                                    <Select
                                                        value={formData.country}
                                                        onValueChange={(value) => {
                                                            const country = COUNTRIES.find(c => c.code === value);
                                                            if (country) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    country: value,
                                                                    country_ddi: country.ddi
                                                                }));
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="bg-neutral-50 h-10">
                                                            <SelectValue placeholder="País" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-[200px]">
                                                            {COUNTRIES.map((country) => (
                                                                <SelectItem key={country.code} value={country.code}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-lg">{country.flag}</span>
                                                                        <span className="truncate max-w-[80px]">{country.name}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex-1 relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm z-10 flex items-center gap-1 bg-neutral-50 pr-1 border-r border-neutral-200 h-6">
                                                        <span className="text-lg">{COUNTRIES.find(c => c.code === formData.country)?.flag}</span>
                                                        <span>{formData.country_ddi}</span>
                                                    </div>
                                                    <Input
                                                        name="whatsapp"
                                                        required
                                                        placeholder="WhatsApp (apenas números)"
                                                        className={cn(
                                                            "bg-neutral-50 pl-[4.5rem]",
                                                            formData.whatsapp && formData.whatsapp.length < 9 ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""
                                                        )}
                                                        value={formData.whatsapp}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                                            setFormData(prev => ({ ...prev, whatsapp: value }));
                                                        }}
                                                    />
                                                    {formData.whatsapp && formData.whatsapp.length < 9 && (
                                                        <p className="text-[10px] text-red-500 absolute -bottom-4 left-0">Digite um número válido</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

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
                                        disabled={loading || !formData.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || formData.whatsapp.length < 9}
                                        className={cn(
                                            "w-full h-12 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                                            (loading || !formData.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || formData.whatsapp.length < 9) && "opacity-50 cursor-not-allowed hover:transform-none"
                                        )}
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
