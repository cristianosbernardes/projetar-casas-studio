
import { useState, useEffect } from 'react';
import { Search, Home, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const StickySearchHeader = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // State for filters
    const [bedrooms, setBedrooms] = useState('');
    const [type, setType] = useState(''); // 'terrea' or 'sobrado'
    const [width, setWidth] = useState('');
    const [depth, setDepth] = useState('');

    // Show only if not at the very top (similar logic to competitor)
    useEffect(() => {
        const toggleVisibility = () => {
            // Show after scrolling past hero (approx 500px)
            if (window.scrollY > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (bedrooms) params.append('quartos', bedrooms);
        if (type) params.append('pavimentos', type);
        if (width) params.append('frente', width);
        if (depth) params.append('fundo', depth);

        navigate(`/projetos?${params.toString()}`);
    };

    // Close/Reset if needed or just handle visibility
    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md shadow-md border-b border-border transition-all duration-300 animate-in slide-in-from-top">
            <div className="section-container py-3">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                    {/* Logo compact */}
                    <div className="hidden lg:flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                            <Home className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-lg hidden xl:inline">Projetar Casas</span>
                    </div>

                    {/* Search Fields */}
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full lg:w-auto">

                        {/* Quartos */}
                        <select
                            className="h-10 px-3 py-1 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={bedrooms}
                            onChange={(e) => setBedrooms(e.target.value)}
                        >
                            <option value="">Quartos</option>
                            <option value="1">1 Quarto</option>
                            <option value="2">2 Quartos</option>
                            <option value="3">3 Quartos</option>
                            <option value="4">4+ Quartos</option>
                        </select>

                        {/* Tipo */}
                        <select
                            className="h-10 px-3 py-1 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="">Tipo</option>
                            <option value="Térrea">Casa Térrea</option>
                            <option value="Sobrado">Sobrado</option>
                        </select>

                        {/* Terreno Label (Hidden on small screens) */}
                        <span className="text-sm text-muted-foreground hidden md:inline ml-2">Terreno:</span>

                        {/* Frente */}
                        <input
                            type="number"
                            placeholder="Frente (m)"
                            className="h-10 w-24 px-3 py-1 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                        />

                        <span className="text-muted-foreground hidden md:inline">x</span>

                        {/* Fundo */}
                        <input
                            type="number"
                            placeholder="Fundo (m)"
                            className="h-10 w-24 px-3 py-1 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={depth}
                            onChange={(e) => setDepth(e.target.value)}
                        />

                        <Button onClick={handleSearch} className="gap-2 ml-2 bg-gradient-to-r from-blue-900 to-emerald-500 hover:from-blue-800 hover:to-emerald-400 text-white shadow-md shadow-emerald-500/20 border-0">
                            <Search className="h-4 w-4" />
                            <span className="hidden sm:inline">Buscar</span>
                        </Button>
                    </div>

                    {/* Top Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:flex"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StickySearchHeader;
