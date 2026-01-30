import { supabase } from "@/integrations/supabase/client";

export type LogAction = 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'view';
export type LogEntity = 'LEADS' | 'PROJECTS' | 'SETTINGS' | 'AUTH' | 'USERS' | 'FINANCE' | 'CMS';

interface LogParams {
    action: LogAction;
    entity: LogEntity;
    entityId?: string;
    details?: Record<string, any>;
}

export const useAuditLog = () => {
    const logAction = async ({ action, entity, entityId, details }: LogParams) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Mesmo se não tiver user (ex: login falho), poderíamos querer logar, mas por enquanto vamos focar em ações de usuários logados
            if (!user) return;

            // @ts-ignore
            const { error } = await supabase.from('system_logs').insert({
                user_id: user.id,
                action_type: action,
                entity,
                entity_id: entityId,
                details
            });

            if (error) {
                console.error('Failed to log action:', error);
            }
        } catch (err) {
            console.error('Audit log error:', err);
        }
    };

    return { logAction };
};
