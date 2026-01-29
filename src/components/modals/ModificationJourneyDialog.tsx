import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Mountain,
    ArrowUpRight,
    ArrowDownRight,
    AlignLeft,
    Ruler,
    Settings2,
    Sparkles,
    Phone,
    Store,
    Instagram,
    Search,
    Youtube
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { COUNTRIES, formatPhoneNumber, type Country } from "@/lib/countries";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}



interface ModificationJourneyDialogProps {
    projectTitle: string;
    projectId?: string;
    projectCode?: string;
}

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
    name: string;
    email: string;
    whatsapp: string;
    country: string;
    countryDdi: string;
    topography: "flat" | "uphill" | "downhill";
    position: "mid-block" | "corner";
    width: string;
    depth: string;
    description: string;
    phase: "idea" | "planning" | "ready";
    timeline: "30-days" | "3-months" | "undefined";
    wantBBQ: boolean;
    wantCall: boolean;
    callTime?: string;
    source: string;
}

const INITIAL_DATA: FormData = {
    name: "",
    email: "",
    whatsapp: "",
    country: "BR",
    countryDdi: "+55",
    topography: "flat",
    position: "mid-block",
    width: "",
    depth: "",
    description: "",
    phase: "idea",
    timeline: "undefined",
    wantBBQ: true,
    wantCall: false,
    source: "",
};

export function ModificationJourneyDialog({
    projectTitle,
    projectId,
    projectCode,
}: ModificationJourneyDialogProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Detectar país automaticamente baseado no idioma do navegador
    useEffect(() => {
        if (isOpen && formData.country === 'BR') { // Só detecta se ainda estiver no padrão Brasil
            const detectCountry = () => {
                // Pega o idioma do navegador (ex: 'pt-BR', 'en-US', 'es-ES')
                const browserLang = navigator.language || navigator.languages?.[0] || 'pt-BR';

                // Mapeamento de idiomas para códigos de país
                const langToCountry: { [key: string]: string } = {
                    'pt-BR': 'BR',
                    'pt-PT': 'PT',
                    'pt-AO': 'AO',
                    'pt-MZ': 'MZ',
                    'en-US': 'US',
                    'en-GB': 'GB',
                    'en-CA': 'CA',
                    'en-AU': 'AU',
                    'es-ES': 'ES',
                    'es-AR': 'AR',
                    'es-MX': 'MX',
                    'fr-FR': 'FR',
                    'fr-CA': 'CA',
                    'de-DE': 'DE',
                    'it-IT': 'IT',
                    'ja-JP': 'JP',
                    'zh-CN': 'CN',
                    'ko-KR': 'KR',
                };

                // Tenta match exato primeiro
                let countryCode = langToCountry[browserLang];

                // Se não encontrar, tenta só o prefixo do idioma
                if (!countryCode) {
                    const langPrefix = browserLang.split('-')[0];
                    const prefixMap: { [key: string]: string } = {
                        'pt': 'PT',
                        'en': 'US',
                        'es': 'ES',
                        'fr': 'FR',
                        'de': 'DE',
                        'it': 'IT',
                        'ja': 'JP',
                        'zh': 'CN',
                        'ko': 'KR',
                    };
                    countryCode = prefixMap[langPrefix];
                }

                // Se encontrou um país válido, atualiza
                if (countryCode) {
                    const country = COUNTRIES.find(c => c.code === countryCode);
                    if (country) {
                        setFormData(prev => ({
                            ...prev,
                            country: country.code,
                            countryDdi: country.ddi
                        }));
                    }
                }
            };

            detectCountry();
        }
    }, [isOpen]);

    // Initial Data with BBQ defaulted to false
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFormData({ ...INITIAL_DATA, wantBBQ: false });
        }
    }, [isOpen]);

    const updateField = (field: keyof FormData, value: any) => {
        if (field === 'whatsapp') {
            const numbers = value.replace(/\D/g, '');
            setFormData((prev) => ({ ...prev, [field]: numbers }));
        }
        // Force numbers only for dimensions
        else if (field === 'width' || field === 'depth' || field === 'backWidth') {
            const numbers = value.replace(/[^0-9.]/g, '');
            setFormData((prev) => ({ ...prev, [field]: numbers }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    const nextStep = () => {
        if (step < 5) setStep((s) => (s + 1) as Step);
    };

    const prevStep = () => {
        if (step > 1) setStep((s) => (s - 1) as Step);
    };

    const validateStep = (currentStep: Step): boolean => {
        switch (currentStep) {
            case 1:
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return !!formData.name && emailRegex.test(formData.email) && formData.whatsapp.length >= 10;
            case 2:
                // Require Frente, Fundo, Comprimento
                // @ts-ignore - backWidth dynamic
                return !!formData.width && !!formData.depth && !!formData.backWidth;
            case 3:
                // Min 10 chars
                return !!formData.description && formData.description.length >= 10;
            case 5:
                return !!formData.source;
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('modification_requests')
                .insert({
                    project_id: projectId,
                    project_code: projectCode,
                    project_title: projectTitle,
                    name: formData.name,
                    email: formData.email,
                    whatsapp: formData.whatsapp,
                    country: formData.country,
                    country_ddi: formData.countryDdi,
                    whatsapp_full: `${formData.countryDdi}${formData.whatsapp.replace(/\D/g, '')}`,
                    topography: formData.topography,
                    width: `Frente: ${formData.width}m / Fundo: ${formData.backWidth}m`,
                    depth: formData.depth,
                    description: formData.description,
                    phase: formData.phase,
                    timeline: formData.timeline,
                    want_bbq: formData.wantBBQ,
                    want_call: formData.wantCall,
                    call_time: formData.callTime,
                    source: formData.source,
                    status: 'new'
                });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            toast({
                title: "Solicitação Recebida!",
                description: "Seu pedido foi registrado com sucesso.",
                duration: 5000,
            });

            setIsSubmitting(false);
            setIsOpen(false);
            setFormData(INITIAL_DATA);
        } catch (error: any) {
            console.error('Error submitting request:', error);
            toast({
                title: "Erro no envio",
                description: error?.message || "Tente novamente ou chame no WhatsApp.",
                variant: "destructive",
                duration: 7000,
            });
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        const fadeIn = "animate-in fade-in duration-500 delay-100 fill-mode-forwards";

        switch (step) {
            case 1:
                const selectedCountry = COUNTRIES.find(c => c.code === formData.country) || COUNTRIES[0];

                return (
                    <div className={cn("space-y-4 pt-2", fadeIn)}>
                        <div className="text-center space-y-0.5">
                            <h3 className="text-xl font-bold text-gray-900">Vamos começar</h3>
                            <p className="text-xs text-gray-500">Para personalizar, precisamos te conhecer.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Nome Completo</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="Seu nome"
                                    className="h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 bg-gray-50/50"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Contato / WhatsApp</Label>
                                    <div className="flex gap-2">
                                        {/* Country Selector as Prefix */}
                                        <Select
                                            value={formData.country}
                                            onValueChange={(val) => {
                                                const country = COUNTRIES.find(c => c.code === val);
                                                if (country) {
                                                    updateField("country", country.code);
                                                    updateField("countryDdi", country.ddi);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-[90px] h-10 border-gray-200 bg-gray-50 text-xs">
                                                <SelectValue>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-base">{selectedCountry.flag}</span>
                                                        <span className="text-xs font-medium">{selectedCountry.ddi}</span>
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COUNTRIES.map((country) => (
                                                    <SelectItem key={country.code} value={country.code}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base">{country.flag}</span>
                                                            <span className="text-sm">{country.name}</span>
                                                            <span className="text-gray-400 text-xs ml-auto">({country.ddi})</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={formData.whatsapp}
                                            onChange={(e) => {
                                                const formatted = formatPhoneNumber(e.target.value, formData.country);
                                                updateField("whatsapp", formatted);
                                            }}
                                            placeholder={selectedCountry.placeholder}
                                            inputMode="numeric"
                                            className="flex-1 h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 bg-gray-50/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">E-mail</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        placeholder="seu@email.com"
                                        className={cn(
                                            "h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-green-500/20 bg-gray-50/50",
                                            formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && "border-red-300 focus:border-red-500 focus:ring-red-200"
                                        )}
                                    />
                                    {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                                        <p className="text-[10px] text-red-500 mt-0.5">Digite um e-mail válido</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className={cn("space-y-6 pt-4", fadeIn)}>
                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">O Terreno</h3>
                            <p className="text-sm text-gray-500">Detalhes do seu lote.</p>
                        </div>

                        {/* Topography */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: "flat", label: "Plano", icon: AlignLeft, rotate: 90 },
                                { id: "uphill", label: "Aclive", icon: ArrowUpRight, rotate: 0 },
                                { id: "downhill", label: "Declive", icon: ArrowDownRight, rotate: 0 },
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => updateField("topography", item.id)}
                                    className={cn(
                                        "cursor-pointer rounded-xl border-2 p-4 text-center transition-all duration-200 hover:scale-[1.02] flex flex-col items-center justify-center gap-2 h-28",
                                        formData.topography === item.id
                                            ? "border-green-500 bg-green-50 shadow-sm"
                                            : "border-gray-100 hover:border-green-500/30 bg-white"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-10 w-10",
                                            item.rotate === 90 && "rotate-90",
                                            formData.topography === item.id ? "text-green-600" : "text-gray-400"
                                        )}
                                    />
                                    <span className={cn("text-sm font-medium", formData.topography === item.id ? "text-green-800" : "text-gray-600")}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Dimensions - 3 Fields */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="relative group col-span-1">
                                <Label className="absolute -top-2 left-3 bg-white px-1 text-xs text-green-700 font-medium z-10 w-max">Frente (m)</Label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.width}
                                    onChange={(e) => updateField("width", e.target.value)}
                                    className="h-12 pt-2 border-gray-200 focus:border-green-500 bg-gray-50/30"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="relative group col-span-1">
                                <Label className="absolute -top-2 left-3 bg-white px-1 text-xs text-green-700 font-medium z-10 w-max">Fundo (m)</Label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    // @ts-ignore
                                    value={formData.backWidth || ''}
                                    onChange={(e) => updateField("backWidth" as any, e.target.value)}
                                    className="h-12 pt-2 border-gray-200 focus:border-green-500 bg-gray-50/30"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="relative group col-span-1">
                                <Label className="absolute -top-2 left-3 bg-white px-1 text-xs text-green-700 font-medium z-10 w-max">Comp. (m)</Label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.depth}
                                    onChange={(e) => updateField("depth", e.target.value)}
                                    className="h-12 pt-2 border-gray-200 focus:border-green-500 bg-gray-50/30"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className={cn("space-y-6 pt-4", fadeIn)}>
                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">Sua Visão</h3>
                            <p className="text-sm text-gray-500">Diga em poucas palavras o que deseja alterar.</p>
                        </div>

                        <div className="relative">
                            <Textarea
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Gostaria de mudar a fachada e aumentar a sala..."
                                className="min-h-[200px] resize-none p-4 text-base bg-gray-50 border-gray-200 focus:bg-white focus:border-green-500 transition-colors"
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {formData.description.length < 10 && (
                                    <span>Mínimo 10 caracteres</span>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                // Generate time slots from 9:00 to 17:00
                const timeSlots = [];
                for (let i = 9; i <= 17; i++) {
                    timeSlots.push(`${i}:00`);
                }

                return (
                    <div className={cn("space-y-6 pt-4", fadeIn)}>
                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">Bônus</h3>
                            <p className="text-sm text-gray-500">Benefícios especiais.</p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl bg-orange-50 border border-orange-100 p-6 shadow-sm">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Mountain className="h-32 w-32 -rotate-12 transform text-orange-900" />
                            </div>

                            <div className="relative z-10 flex items-start gap-4">
                                <div className="rounded-full bg-white p-3 shadow-sm text-orange-500">
                                    <Store className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-bold text-orange-900">Projeto de Churrasqueira</h4>
                                    <p className="text-sm text-orange-800/80 mt-1 mb-4">Cortesia inclusa?</p>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => updateField("wantBBQ", true)}
                                            className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border", formData.wantBBQ ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-orange-800 border-orange-200 hover:bg-orange-100")}
                                        >
                                            Sim
                                        </button>
                                        <button
                                            onClick={() => updateField("wantBBQ", false)}
                                            className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors border", !formData.wantBBQ ? "bg-stone-500 text-white border-stone-500 shadow-sm" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100")}
                                        >
                                            Não
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4 shadow-sm">
                            <Label className="block text-sm font-semibold text-gray-700 mb-2">
                                Como prefere que entremos em contato?
                            </Label>

                            <RadioGroup
                                value={formData.wantCall ? "call" : "digital"}
                                onValueChange={(val) => updateField("wantCall", val === "call")}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className={cn(
                                    "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-all",
                                    !formData.wantCall ? "border-green-500 bg-green-50/50" : "border-gray-200 hover:bg-gray-50"
                                )}>
                                    <RadioGroupItem value="digital" id="digital" className="text-green-600" />
                                    <Label htmlFor="digital" className="cursor-pointer text-sm font-medium text-gray-700">WhatsApp / E-mail</Label>
                                </div>
                                <div className={cn(
                                    "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-all",
                                    formData.wantCall ? "border-green-500 bg-green-50/50" : "border-gray-200 hover:bg-gray-50"
                                )}>
                                    <RadioGroupItem value="call" id="call" className="text-green-600" />
                                    <Label htmlFor="call" className="cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Phone className="h-3 w-3" /> Ligação
                                    </Label>
                                </div>
                            </RadioGroup>

                            {formData.wantCall && (
                                <div className={cn("pt-2 animate-in slide-in-from-top-2", fadeIn)}>
                                    <Label className="text-xs text-gray-500 mb-1.5 block">Melhor horário para ligarmos:</Label>
                                    <Select
                                        value={formData.callTime}
                                        onValueChange={(val) => updateField("callTime", val)}
                                    >
                                        <SelectTrigger className="w-full bg-white border-gray-200 hover:border-green-400 transition-colors">
                                            <SelectValue placeholder="Selecione um horário" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1 text-right">Horário comercial (Brasília)</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className={cn("py-4 text-center space-y-4", fadeIn)}>
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm animate-pulse">
                            <ArrowRight className="h-8 w-8 text-blue-700" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900">Quase lá!</h3>
                            <p className="text-gray-500 text-xs max-w-sm mx-auto">
                                Para finalizar, nos diga onde nos conheceu e clique em <strong>Enviar Solicitação</strong> abaixo.
                            </p>
                        </div>

                        <div className="pt-3 max-w-sm mx-auto w-full text-left">
                            <Label className="text-[10px] text-gray-500 mb-2 block text-center uppercase tracking-wider font-semibold">Onde nos conheceu?</Label>

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        id: "instagram",
                                        label: "Instagram",
                                        icon: Instagram,
                                        activeClass: "border-[#E1306C] bg-[#E1306C]/5 text-[#E1306C]",
                                        inactiveClass: "text-[#E1306C]/70 hover:bg-[#E1306C]/5",
                                        iconClass: "text-[#E1306C]"
                                    },
                                    {
                                        id: "google",
                                        label: "Google",
                                        icon: Search,
                                        activeClass: "border-[#4285F4] bg-[#4285F4]/5 text-[#4285F4]",
                                        inactiveClass: "text-[#4285F4]/70 hover:bg-[#4285F4]/5",
                                        iconClass: "text-[#4285F4]"
                                    },
                                    {
                                        id: "youtube",
                                        label: "Youtube",
                                        icon: Youtube,
                                        activeClass: "border-[#FF0000] bg-[#FF0000]/5 text-[#FF0000]",
                                        inactiveClass: "text-[#FF0000]/70 hover:bg-[#FF0000]/5",
                                        iconClass: "text-[#FF0000]"
                                    },
                                ].map((channel) => (
                                    <div
                                        key={channel.id}
                                        onClick={() => updateField("source", channel.id)}
                                        className={cn(
                                            "cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-all transition-transform duration-200 hover:scale-105 shadow-sm",
                                            formData.source === channel.id ? channel.activeClass : `border-gray-100 bg-white ${channel.inactiveClass}`
                                        )}
                                    >
                                        <channel.icon className={cn("h-4 w-4", channel.iconClass)} />
                                        <span className="text-[10px] font-bold">{channel.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <DialogTrigger asChild>
                    <Button
                        size="lg"
                        className="w-full text-base font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.01]"
                    >
                        <Settings2 className="mr-2 h-4 w-4" />
                        SOLICITAR MODIFICAÇÃO
                    </Button>
                </DialogTrigger>
            </DialogTrigger>

            {/* Removed metallic borders (border-white/20, etc) and glassmorphism. Using cleaner modern white card. */}
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl gap-0 flex flex-col">
                <DialogHeader className="px-5 py-4 bg-gray-50 border-b border-gray-100 shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle className="text-base font-bold text-gray-800">
                            Personalizar Projeto
                        </DialogTitle>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                            Passo {step}/5
                        </span>
                    </div>

                    {/* Project Info Badge */}
                    <div className="flex items-center gap-2 mt-2 p-2.5 bg-white rounded-lg border border-gray-200">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5">Projeto</p>
                            <p className="text-xs font-bold text-gray-900 truncate">{projectTitle}</p>
                        </div>
                        {projectCode && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 border border-gray-200 shrink-0">
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Cód.</span>
                                <span className="text-xs font-bold text-gray-900">{projectCode}</span>
                            </div>
                        )}
                    </div>

                    <Progress value={(step / 5) * 100} className="h-1 bg-gray-200 mt-2.5" />
                </DialogHeader>

                <div className="px-5 py-4 bg-white flex flex-col overflow-y-auto flex-1">
                    {renderStep()}
                </div>

                <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                    {step > 1 ? (
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={isSubmitting}
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 5 ? (
                        <Button
                            onClick={nextStep}
                            disabled={!validateStep(step)}
                            className="bg-gray-900 text-white hover:bg-black rounded-lg px-8 shadow-md transition-all hover:translate-x-1"
                        >
                            Continuar <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.source}
                            className="bg-green-600 text-white hover:bg-green-700 hover:shadow-lg rounded-lg px-8 w-full sm:w-auto transition-all hover:scale-105"
                        >
                            {isSubmitting ? <span className="animate-pulse">Enviando...</span> : "Enviar Solicitação"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
