import { Home, MessageSquare, Plus, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
    currentView: 'properties' | 'leads' | 'create';
    onViewChange: (view: 'properties' | 'leads' | 'create') => void;
    onLogout: () => void;
}

export function AdminSidebar({ currentView, onViewChange, onLogout }: AdminSidebarProps) {
    const menuItems = [
        {
            id: 'properties',
            label: 'Meus Projetos',
            icon: Home,
            view: 'properties' as const
        },
        {
            id: 'leads',
            label: 'Mensagens',
            icon: MessageSquare,
            view: 'leads' as const
        },
        {
            id: 'create',
            label: 'Novo Projeto',
            icon: Plus,
            view: 'create' as const
        }
    ];

    return (
        <div className="h-screen w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 z-50">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <LayoutDashboard className="h-6 w-6" />
                    <span>Admin Panel</span>
                </div>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Button
                        key={item.id}
                        variant={currentView === item.view ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start gap-3 text-base font-normal",
                            currentView === item.view && "font-medium"
                        )}
                        onClick={() => onViewChange(item.view)}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Button>
                ))}
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
