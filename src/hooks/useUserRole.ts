import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/database';

export const useUserRole = () => {
    const { data: role, isLoading } = useQuery({
        queryKey: ['user-role'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching role:', error);
                return 'employee' as AppRole; // Fallback seguro
            }

            return data?.role as AppRole;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    const isMaster = role === 'master';
    const isPartner = role === 'partner';
    const isEmployee = role === 'employee';

    const canManageUsers = isMaster; // Só master gerencia users completamente (promove/exclui)
    const canDeleteProjects = isMaster; // Só master exclui projetos permanentemente? (User disse: sócios não podem excluir master, mas sócios tem nível para olhar tudo. Vou assumir q sócios podem deletar projetos por enquanto, mas vou criar a prop específica se precisar)
    // Regra do user: "Os meus sócios terão nível para olhar tudo, mas não poderá me excluir" -> Implica que eles tem admin full exceto excluir Master.

    // Vamos definir permissões mais granulares:
    const permissions = {
        canViewAll: true, // Todos no admin podem ver? Employee vê "sistema básico".
        canEditProjects: isMaster || isPartner,
        canDeleteProjects: isMaster || isPartner,
        canManageTeam: isMaster, // Apenas master promove/exclui pessoas
        isMaster,
        isPartner,
        isEmployee,
        role
    };

    return { role, isLoading, ...permissions };
};
