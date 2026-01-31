import { useState, useEffect } from 'react';
import { Search, Home, ArrowUp, SlidersHorizontal, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const StickySearchHeader = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // State for Quick Filters
    const [bedrooms, setBedrooms] = useState('');
    const [type, setType] = useState('');
    const [width, setWidth] = useState('');
    const [depth, setDepth] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [garage, setGarage] = useState('');

    // State for Advanced Filters (Dialog)
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [suites, setSuites] = useState('');
    const [style, setStyle] = useState('');
    const [minArea, setMinArea] = useState('');
    const [code, setCode] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Show only if not at the very top
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // Sync state with URL params when component mounts or URL changes (optional, but good for consistency)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('bedrooms')) setBedrooms(params.get('bedrooms') || '');
        if (params.get('type')) setType(params.get('type') || '');
        if (params.get('width')) setWidth(params.get('width') || '');
        if (params.get('depth')) setDepth(params.get('depth') || '');
        if (params.get('bathrooms')) setBathrooms(params.get('bathrooms') || '');
        if (params.get('garage')) setGarage(params.get('garage') || '');
        if (params.get('suites')) setSuites(params.get('suites') || '');
        if (params.get('style')) setStyle(params.get('style') || '');
        if (params.get('min_area')) setMinArea(params.get('min_area') || '');
        if (params.get('code')) setCode(params.get('code') || '');
        if (params.get('min_price')) setMinPrice(params.get('min_price') || '');
        if (params.get('max_price')) setMaxPrice(params.get('max_price') || '');
    }, [location.search, isVisible]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (bedrooms) params.set('bedrooms', bedrooms);
        if (type) params.set('type', type);
        if (width) params.set('width', width);
        if (depth) params.set('depth', depth);
        if (bathrooms) params.set('bathrooms', bathrooms);
        if (garage) params.set('garage', garage);

        // Advanced Params
        if (suites) params.set('suites', suites);
        if (style) params.set('style', style);
        if (minArea) params.set('min_area', minArea);
        if (code) params.set('code', code);
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);

        navigate(`/projetos?${params.toString()}`);
        setIsAdvancedOpen(false);
    };

    const clearFilters = () => {
        setBedrooms('');
        setType('');
        setWidth('');
        setDepth('');
        setBathrooms('');
        setGarage('');
        setSuites('');
        setStyle('');
        setMinArea('');
        setCode('');
        setMinPrice('');
        setMaxPrice('');
    };

    const activeAdvancedCount = [suites, style, minArea, code, minPrice, maxPrice].filter(Boolean).length;

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md shadow-md border-b border-border transition-all duration-300 animate-in slide-in-from-top">
            <div className="container mx-auto px-4 py-2">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3">

                    {/* Logo/Home */}
                    <div className="hidden xl:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                            <Home className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-lg text-gray-800">Projetar</span>
                    </div>

                    {/* Main Filter Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full lg:w-auto flex-1 max-w-5xl">

                        {/* Quick Filters Group */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide mask-image-linear-to-r">
                            <Select value={bedrooms} onValueChange={setBedrooms}>
                                <SelectTrigger className="h-9 w-[110px] bg-white border-gray-200 text-gray-700 focus:outline-none focus:border-primary transition-all data-[state=open]:border-primary data-[state=open]:text-primary focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Quartos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Quarto</SelectItem>
                                    <SelectItem value="2">2 Quartos</SelectItem>
                                    <SelectItem value="3">3 Quartos</SelectItem>
                                    <SelectItem value="4">4+ Quartos</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={bathrooms} onValueChange={setBathrooms}>
                                <SelectTrigger className="h-9 w-[110px] bg-white border-gray-200 text-gray-700 focus:outline-none focus:border-primary transition-all data-[state=open]:border-primary data-[state=open]:text-primary focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Banh." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Banh.</SelectItem>
                                    <SelectItem value="2">2 Banh.</SelectItem>
                                    <SelectItem value="3">3+ Banh.</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={garage} onValueChange={setGarage}>
                                <SelectTrigger className="h-9 w-[110px] bg-white border-gray-200 text-gray-700 focus:outline-none focus:border-primary transition-all data-[state=open]:border-primary data-[state=open]:text-primary focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Vagas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Vaga</SelectItem>
                                    <SelectItem value="2">2 Vagas</SelectItem>
                                    <SelectItem value="3">3+ Vagas</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

                            {/* Dimensions */}
                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 h-9">
                                <span className="text-xs text-muted-foreground font-medium">Lote:</span>
                                <input
                                    type="number"
                                    placeholder="Frente"
                                    className="w-12 bg-transparent text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
                                    value={width}
                                    onChange={(e) => setWidth(e.target.value)}
                                />
                                <span className="text-muted-foreground text-xs">x</span>
                                <input
                                    type="number"
                                    placeholder="Fundo"
                                    className="w-12 bg-transparent text-sm focus:outline-none text-gray-700 placeholder:text-gray-400"
                                    value={depth}
                                    onChange={(e) => setDepth(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Actions Group */}
                        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                            {/* Advanced Filters Dialog */}
                            <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 gap-2 relative bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all shadow-sm">
                                        <SlidersHorizontal className="h-4 w-4" />
                                        <span className="hidden sm:inline">Mais Filtros</span>
                                        {activeAdvancedCount > 0 && (
                                            <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-[10px] absolute -top-2 -right-2 animate-in zoom-in text-white border-2 border-white">
                                                {activeAdvancedCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-xl">
                                            <Filter className="h-5 w-5 text-primary" />
                                            Filtros Avançados
                                        </DialogTitle>
                                    </DialogHeader>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Estilo Arquitetônico</label>
                                            <Select value={style} onValueChange={setStyle}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Qualquer estilo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Moderno">Moderno</SelectItem>
                                                    <SelectItem value="Contemporâneo">Contemporâneo</SelectItem>
                                                    <SelectItem value="Rústico">Rústico</SelectItem>
                                                    <SelectItem value="Neoclássico">Neoclássico</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Suítes</label>
                                            <Select value={suites} onValueChange={setSuites}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Qualquer quantidade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1+ Suíte</SelectItem>
                                                    <SelectItem value="2">2+ Suítes</SelectItem>
                                                    <SelectItem value="3">3+ Suítes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Tipo de Construção</label>
                                            <Select value={type} onValueChange={setType}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Qualquer tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Térrea">Casa Térrea</SelectItem>
                                                    <SelectItem value="Sobrado">Sobrado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Área Construída Mínima (m²)</label>
                                            <Input
                                                type="number"
                                                placeholder="Ex: 100"
                                                value={minArea}
                                                onChange={(e) => setMinArea(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Código do Projeto</label>
                                            <Input
                                                placeholder="Ex: 102"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Faixa de Preço</label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Mín"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                />
                                                <span className="text-muted-foreground">-</span>
                                                <Input
                                                    type="number"
                                                    placeholder="Máx"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="flex-row justify-between sm:justify-between items-center bg-gray-50 -mx-6 -mb-6 p-6 border-t border-gray-100">
                                        <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-red-500">
                                            Limpar Filtros
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => setIsAdvancedOpen(false)}>Cancelar</Button>
                                            <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 min-w-[120px]">
                                                Aplicar Filtros
                                            </Button>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button onClick={handleSearch} className="h-9 px-4 gap-2 bg-gradient-to-r from-blue-900 to-emerald-500 hover:from-blue-800 hover:to-emerald-400 text-white shadow-md shadow-emerald-500/20 border-0 rounded-md">
                                <Search className="h-4 w-4" />
                                <span className="font-semibold">Buscar</span>
                            </Button>
                        </div>
                    </div>

                    {/* Top Button */}
                    <div className="hidden 2xl:block">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-gray-50 hover:bg-gray-100 border border-gray-200"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <ArrowUp className="h-5 w-5 text-gray-500" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StickySearchHeader;
