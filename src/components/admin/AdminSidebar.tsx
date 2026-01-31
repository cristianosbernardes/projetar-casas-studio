import {
    LayoutDashboard,
    FolderKanban,
    PlusCircle,
    Trash2,
    LogOut,
    Users,
    Database,
    Globe,
    Settings,
    ShieldAlert,
    DollarSign
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUserRole } from '@/hooks/useUserRole';
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
    currentView: 'overview' | 'properties' | 'leads' | 'modifications' | 'create' | 'trash' | 'users' | 'sql' | 'settings' | 'logs' | 'cms' | 'financial';
    onViewChange: (view: 'overview' | 'properties' | 'leads' | 'modifications' | 'create' | 'trash' | 'users' | 'sql' | 'settings' | 'logs' | 'cms' | 'financial') => void;
    onLogout: () => void;
}

export function AdminSidebar({ currentView, onViewChange, onLogout }: AdminSidebarProps) {
    const { canManageTeam, isEmployee, isMaster } = useUserRole();

    const NavButton = ({
        view,
        icon: Icon,
        label,
        className
    }: {
        view: AdminSidebarProps['currentView'],
        icon: any,
        label: string,
        className?: string
    }) => (
        <Button
            variant="ghost"
            className={cn(
                "w-full justify-start gap-3 h-10 px-4 text-sm font-medium transition-all duration-200",
                "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                currentView === view && "bg-sidebar-primary text-sidebar-primary-foreground shadow-md hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
                className
            )}
            onClick={() => onViewChange(view)}
        >
            <Icon className={cn("h-4 w-4", currentView === view ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />
            {label}
        </Button>
    );

    return (
        <div className="h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50 transition-colors duration-300">
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sidebar-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                        <LayoutDashboard className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-sidebar-foreground tracking-tight">Admin Panel</span>
                </div>
                {!isEmployee && (
                    <p className="text-xs text-sidebar-foreground/50 ml-10">Gerenciamento Completo</p>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">

                {/* External Link */}
                <Button
                    className="w-full justify-start gap-3 mb-6 bg-gradient-to-r from-blue-900 to-emerald-500 hover:from-blue-800 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 border-0 transition-all hover:scale-[1.02]"
                    onClick={() => window.open('/', '_blank')}
                >
                    <Globe className="h-4 w-4" />
                    Ir para o Site
                </Button>

                <div className="px-2 mb-2">
                    <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Principal</p>
                </div>

                <NavButton view="overview" icon={LayoutDashboard} label="Visão Geral" />
                <NavButton view="create" icon={PlusCircle} label="Novo Projeto" />
                <NavButton view="properties" icon={FolderKanban} label="Meus Projetos" />

                <div className="my-4 px-2">
                    <Separator className="bg-sidebar-border/50" />
                </div>

                <div className="px-2 mb-2">
                    <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Gestão</p>
                </div>

                <NavButton view="modifications" icon={Settings} label="Projetos Personaliz." className="[&>svg]:rotate-90" />
                <NavButton view="leads" icon={Users} label="CRM de Vendas" />
                <NavButton view="financial" icon={DollarSign} label="Financeiro" />
                <NavButton view="cms" icon={Globe} label="Conteúdo Site" />

                <div className="my-4 px-2">
                    <Separator className="bg-sidebar-border/50" />
                </div>

                <div className="px-2 mb-2">
                    <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Sistema</p>
                </div>

                {canManageTeam && <NavButton view="users" icon={Users} label="Equipe" />}
                {(isMaster || canManageTeam) && <NavButton view="logs" icon={ShieldAlert} label="Auditoria" />}
                {(isMaster || canManageTeam) && <NavButton view="settings" icon={Settings} label="Configurações" />}
                {isMaster && <NavButton view="sql" icon={Database} label="Banco SQL" />}
                <NavButton view="trash" icon={Trash2} label="Lixeira" className="text-red-400 hover:text-red-300 hover:bg-red-950/30" />

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                    onClick={onLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sair do Sistema
                </Button>
            </div>
        </div>
    );
}
