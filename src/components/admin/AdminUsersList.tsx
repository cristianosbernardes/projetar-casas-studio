import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Shield, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import type { Profile, AppRole } from '@/types/database';

// Constants for temp client (to avoid logging out admin)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qzadvicbpbhirthkadfy.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YWR2aWNicGJoaXJ0aGthZGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODgwNzAsImV4cCI6MjA4MzM2NDA3MH0.K_wi9TSD_GTe1uQ5-UR0N8hsPFv2nwrg8pnDTEGv5mU';

export const AdminUsersList = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { isMaster, isLoading: isRoleLoading } = useUserRole();
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // State for new user creation
    const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Fetch users
    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Profile[];
        },
    });

    // Update Role Mutation
    const updateRoleMutation = useMutation({
        mutationFn: async (payload: { id: string; newRole: AppRole }) => {
            const { error } = await supabase
                .from('profiles')
                .update({ role: payload.newRole })
                .eq('id', payload.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: "Permissão atualizada com sucesso!" });
        },
        onError: (error) => {
            toast({
                title: "Erro ao atualizar permissão",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    // Delete User Mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast({ title: "Usuário removido" });
        },
        onError: (error) => {
            toast({
                title: "Erro ao remover usuário",
                description: "Se for o Master, não pode ser removido.",
                variant: "destructive"
            });
        },
    });

    // Handle Create User (Internal)
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // Create a temporary client that DOES NOT persist session
            const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            });

            const { error } = await tempClient.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.fullName,
                    },
                },
            });

            if (error) throw error;

            toast({
                title: "Usuário cadastrado!",
                description: "O novo membro já deve aparecer na lista.",
            });

            setIsInviteOpen(false);
            setNewUser({ email: '', password: '', fullName: '' });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });

        } catch (error: any) {
            toast({
                title: "Erro ao criar usuário",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading || isRoleLoading) return <div className="p-8 text-center text-muted-foreground">Carregando usuários...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex-1 mr-4">
                    <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Controle de Acesso da Equipe
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                        Como Master, você pode promover funcionários a Sócios ou rebaixá-los.
                    </p>
                </div>

                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Novo Membro
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cadastrar Novo Membro</DialogTitle>
                            <DialogDescription>
                                Preencha os dados abaixo para criar uma conta para seu colaborador.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input
                                    value={newUser.fullName}
                                    onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                                    placeholder="João da Silva"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>E-mail</Label>
                                <Input
                                    type="email"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="joao@exemplo.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Senha</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder="******"
                                        required
                                        minLength={6}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                                <p>
                                    <strong>Nota:</strong> O usuário entrará como <strong>Funcionário</strong>.
                                    Você poderá promovê-lo logo após o cadastro.
                                </p>
                            </div>

                            <Button type="submit" className="w-full" disabled={isCreating}>
                                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                Cadastrar Usuário
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Nível de Acesso</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-4 w-4 opacity-50" />
                                        </div>
                                        {user.full_name || 'Sem nome'}
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {isMaster && user.role !== 'master' ? (
                                        <Select
                                            value={user.role}
                                            onValueChange={(val) => updateRoleMutation.mutate({ id: user.id, newRole: val as AppRole })}
                                        >
                                            <SelectTrigger className="w-[140px] h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="master" disabled>Master (Dono)</SelectItem>
                                                <SelectItem value="partner">Sócio</SelectItem>
                                                <SelectItem value="employee">Funcionário</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge variant={user.role === 'master' ? 'default' : user.role === 'partner' ? 'secondary' : 'outline'}>
                                            {user.role === 'master' ? 'Master' : user.role === 'partner' ? 'Sócio' : 'Funcionário'}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {isMaster && user.role !== 'master' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                if (confirm(`Tem certeza que deseja remover ${user.email}? Ele perderá o acesso.`)) {
                                                    deleteUserMutation.mutate(user.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
