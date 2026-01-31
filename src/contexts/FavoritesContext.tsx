import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface FavoritesContextType {
    favorites: string[];
    addFavorite: (projectId: string) => void;
    removeFavorite: (projectId: string) => void;
    isFavorite: (projectId: string) => boolean;
    toggleFavorite: (projectId: string) => void;
    count: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<string[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedFavorites = localStorage.getItem('project_favorites');
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.error('Failed to parse favorites', e);
            }
        }
    }, []);

    // Save to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem('project_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = (projectId: string) => {
        if (!favorites.includes(projectId)) {
            setFavorites(prev => [...prev, projectId]);
            toast.success('Projeto adicionado aos favoritos');
        }
    };

    const removeFavorite = (projectId: string) => {
        setFavorites(prev => prev.filter(id => id !== projectId));
        toast.info('Projeto removido dos favoritos');
    };

    const isFavorite = (projectId: string) => {
        return favorites.includes(projectId);
    };

    const toggleFavorite = (projectId: string) => {
        if (isFavorite(projectId)) {
            removeFavorite(projectId);
        } else {
            addFavorite(projectId);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite, count: favorites.length }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
