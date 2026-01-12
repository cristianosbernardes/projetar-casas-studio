import {
    LayoutDashboard,
    FolderKanban,
    PlusCircle,
    Trash2,
    LogOut,
    Users,
    Users2,
    Database,
    Globe,
    Settings
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUserRole } from '@/hooks/useUserRole';

interface AdminSidebarProps {
    currentView: 'overview' | 'properties' | 'leads' | 'create' | 'trash' | 'users' | 'sql' | 'settings';
    onViewChange: (view: 'overview' | 'properties' | 'leads' | 'create' | 'trash' | 'users' | 'sql' | 'settings') => void;
    onLogout: () => void;
}

export function AdminSidebar({ currentView, onViewChange, onLogout }: AdminSidebarProps) {
    const { canManageTeam, isEmployee, isMaster } = useUserRole();

    return (
        <div className="h-screen w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <LayoutDashboard className="h-6 w-6" />
                    <span>Admin Panel</span>
                </div>
                {!isEmployee && (
                    <p className="text-xs text-muted-foreground mt-1">Gerenciamento Completo</p>
                )}
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-base font-normal text-blue-600 hover:text-blue-700 hover:bg-blue-50 mb-4 border border-blue-100"
                    onClick={() => window.open('/', '_blank')}
                >
                    <Globe className="h-5 w-5" />
                    Ir para o Site
                </Button>

                <Button
                    variant={currentView === 'overview' ? "secondary" : "ghost"}
                    className={cn(
                        "w-full justify-start gap-3 text-base font-normal",
                        currentView === 'overview' && "font-medium"
                    )}
                    onClick={() => onViewChange('overview')}
                >
                    <LayoutDashboard className="h-5 w-5" />
                    Visão Geral
                </Button>

                <Button
                    variant={currentView === 'properties' ? "secondary" : "ghost"}
                    className={cn(
                        "w-full justify-start gap-3 text-base font-normal",
                        currentView === 'properties' && "font-medium"
                    )}
                    onClick={() => onViewChange('properties')}
                >
                    <FolderKanban className="h-5 w-5" />
                    Meus Projetos
                </Button>

                <Button
                    variant={currentView === 'leads' ? "secondary" : "ghost"}
                    className={cn(
                        "w-full justify-start gap-3 text-base font-normal",
                        currentView === 'leads' && "font-medium"
                    )}
                    onClick={() => onViewChange('leads')}
                >
                    <Users className="h-5 w-5" />
                    CRM de Vendas
                </Button>

                <Button
                    variant={currentView === 'create' ? "secondary" : "ghost"}
                    className={cn(
                        "w-full justify-start gap-3 text-base font-normal",
                        currentView === 'create' && "font-medium"
                    )}
                    onClick={() => onViewChange('create')}
                >
                    <PlusCircle className="h-5 w-5" />
                    Novo Projeto
                </Button>

                <Button
                    variant={currentView === 'trash' ? "secondary" : "ghost"}
                    className={cn(
                        "w-full justify-start gap-3 text-base font-normal",
                        currentView === 'trash' && "font-medium"
                    )}
                    onClick={() => onViewChange('trash')}
                >
                    <Trash2 className="h-5 w-5" />
                    Lixeira
                </Button>

                {canManageTeam && (
                    <Button
                        variant={currentView === 'users' ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start gap-3 text-base font-normal",
                            currentView === 'users' && "font-medium"
                        )}
                        onClick={() => onViewChange('users')}
                    >
                        <Users className="h-5 w-5" />
                        Equipe
                    </Button>
                )}

                {(isMaster || canManageTeam) && (
                    <Button
                        variant={currentView === 'settings' ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start gap-3 text-base font-normal",
                            currentView === 'settings' && "font-medium"
                        )}
                        onClick={() => onViewChange('settings')}
                    >
                        <Settings className="h-5 w-5" />
                        Configurações
                    </Button>
                )}

                {isMaster && (
                    <Button
                        variant={currentView === 'sql' ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start gap-3 text-base font-normal text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50",
                            currentView === 'sql' && "font-medium bg-indigo-50 text-indigo-700"
                        )}
                        onClick={() => onViewChange('sql')}
                    >
                        <Database className="h-5 w-5" />
                        Banco SQL
                    </Button>
                )}
            </div>

            <div className="p-4 border-t border-border">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                    onClick={onLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Sair do Sistema
                </Button>
            </div>
        </div>
    );
}
