import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Home, LogIn, Image as ImageIcon, Loader2, Save, ExternalLink, RefreshCcw, XCircle, Eye, EyeOff, Search, Copy, FileText, Check, Filter } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminImageGallery } from '@/components/admin/AdminImageGallery';
import { AdminLeadsList } from '@/components/admin/AdminLeadsList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { AdminSqlEditor } from '@/components/admin/AdminSqlEditor';
import { AdminUsersList } from '@/components/admin/AdminUsersList';
import { useUserRole } from '@/hooks/useUserRole';
import type { Project, ProjectInsert, ProjectWithImages } from '@/types/database';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminCRM } from '@/components/admin/AdminCRM';
import { AdminModificationsList } from '@/components/admin/AdminModificationsList';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminAuditLogs } from '@/components/admin/AdminAuditLogs';
import { AdminCMS } from '@/components/admin/AdminCMS';
import { AdminFinancial } from '@/components/admin/AdminFinancial';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { useAuditLog } from '@/hooks/useAuditLog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StyleManagerDialog } from '@/components/admin/StyleManagerDialog';

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // View State
  const [currentView, setCurrentView] = useState<'overview' | 'properties' | 'leads' | 'modifications' | 'create' | 'trash' | 'users' | 'sql' | 'settings' | 'logs' | 'cms' | 'financial'>('overview');
  const { role, canDeleteProjects, canManageTeam, isEmployee, isMaster } = useUserRole();
  const { logAction } = useAuditLog();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Form/Edit State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ file: File, preview: string }[]>([]);
  const [draftId, setDraftId] = useState<string>(crypto.randomUUID()); // ID for new projects to ensure folder consistency
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });

  const [formData, setFormData] = useState<Partial<ProjectInsert>>({
    title: '',
    slug: '',
    code: '',
    description: '',
    price: 0,
    width_meters: 0,
    depth_meters: 0,
    bedrooms: 0,
    bathrooms: 0,
    suites: 0,
    garage_spots: 0,
    built_area: 0,
    style: 'Moderno',
    is_featured: false,
    price_electrical: 0,
    price_hydraulic: 0,
    price_sanitary: 0,
    price_structural: 0,
    is_best_seller: false,
    status: 'published', // Default to published
  });

  // Check auth status on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAuthenticated(true);
    });
  }, []);

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_images(image_url, is_cover)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProjectWithImages[];
    },
    enabled: isAuthenticated && currentView !== 'trash',
  });

  // Fetch trash projects
  const { data: trashProjects, isLoading: isTrashLoading } = useQuery({
    queryKey: ['admin-projects-trash'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null) // Trash has deleted_at NOT null
        .not('deleted_at', 'is', null) // Double check syntax for "is not null"
        .order('deleted_at', { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
    enabled: isAuthenticated && currentView === 'trash',
  });

  // Fetch styles
  const { data: styles, refetch: refetchStyles } = useQuery({
    queryKey: ['project-styles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_styles')
        .select('*')
        .order('name');

      // Silent error if table doesn't exist yet
      if (error) return [];
      return data as { id: string; name: string }[];
    },
    enabled: isAuthenticated,
  });

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({ title: 'Erro ao fazer login', description: error.message, variant: 'destructive' });
      } else {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['user-role'] }),
          queryClient.invalidateQueries({ queryKey: ['admin-projects'] })
        ]);
        setIsAuthenticated(true);
        logAction({ action: 'LOGIN', entity: 'AUTH', details: { email: email } });
        toast({ title: 'Login realizado!', description: 'Bem-vindo ao painel administrativo.' });
      }
    } catch (err: any) {
      toast({ title: 'Erro inesperado', description: err.message, variant: 'destructive' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    toast({ title: 'Logout realizado' });
  };

  // HANDLERS FOR NEW PROJECT FILES
  const handleFilesSelected = (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveLocalFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const resetForm = () => {
    setFormData({
      title: '', slug: '', description: '', price: 0, width_meters: 0, depth_meters: 0,
      bedrooms: 0, bathrooms: 0, suites: 0, garage_spots: 0, built_area: 0,
      style: 'Moderno', is_featured: false, price_electrical: 0, price_hydraulic: 0,
      price_sanitary: 0, price_structural: 0, is_best_seller: false,
      code: '', status: 'published',
    });
    setEditingProject(null);
    setSelectedFiles([]);
    setDraftId(crypto.randomUUID()); // Reset draft ID for new project
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setCurrentView('create');
  };

  // Projects Mutation
  const projectMutation = useMutation({
    mutationFn: async (data: ProjectInsert & { project_images?: any }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { project_images, ...projectData } = data;
      let projectId = editingProject?.id;

      if (editingProject) {
        // UPDATE PROJECT
        // @ts-ignore
        const { error } = await supabase.from('projects').update(projectData).eq('id', editingProject.id);
        if (error) throw error;

        logAction({
          action: 'UPDATE',
          entity: 'PROJECTS',
          entityId: editingProject.id,
          details: { title: projectData.title, changes: projectData }
        });
      } else {
        // CREATE PROJECT
        // Use the draftId so we can ensure folder consistency with any RichText uploads that happened before save
        projectId = draftId;
        const insertData = { ...projectData, id: projectId };

        // @ts-ignore
        const { data: newProject, error } = await supabase.from('projects')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;

        logAction({
          action: 'CREATE',
          entity: 'PROJECTS',
          details: { title: projectData.title, slug: projectData.slug }
        });
      }

      // HANDLE INITIAL IMAGE UPLOAD (Only if new project and has files)
      if (!editingProject && selectedFiles.length > 0 && projectId) {
        // Import dynamically
        const { convertToWebP } = await import('@/lib/image-optimizer');

        // Upload sequentially with index tracking for display_order
        for (let i = 0; i < selectedFiles.length; i++) {
          const { file } = selectedFiles[i];

          try {
            // 1. Convert
            const webpFile = await convertToWebP(file, 0.8);
            const fileExt = 'webp';
            const fileName = `${projectId}/${crypto.randomUUID()}.${fileExt}`;

            // 2. Upload
            const { error: uploadError } = await supabase.storage
              .from('project-images')
              .upload(fileName, webpFile, { contentType: 'image/webp' });

            if (uploadError) throw uploadError;

            // 3. Get URL
            const { data: { publicUrl } } = supabase.storage
              .from('project-images')
              .getPublicUrl(fileName);

            // 4. Insert DB
            await supabase.from('project_images').insert({
              project_id: projectId,
              image_url: publicUrl,
              display_order: i + 1,
              is_cover: i === 0 // First is cover
            });

          } catch (err) {
            console.error("Error uploading initial image:", err);
            toast({ title: "Erro no upload", description: `Falha ao enviar imagem ${i + 1}. Tente novamente editando o projeto.`, variant: "destructive" });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      setCurrentView('properties');
      resetForm();
      toast({
        title: editingProject ? 'Projeto atualizado!' : 'Projeto criado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      toast({ title: 'Erro ao salvar projeto', description: error.message, variant: 'destructive' });
    },
  });

  // Soft Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('projects')
        // @ts-ignore
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', id) as any);
      if (error) throw error;

      logAction({ action: 'DELETE', entity: 'PROJECTS', entityId: id, details: { type: 'soft_delete' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects-trash'] });
      toast({ title: 'Projeto movido para a lixeira', description: 'Você pode restaurá-lo na seção Lixeira.' });
    },
  });

  // Restore Mutation
  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('projects')
        // @ts-ignore
        .update({ deleted_at: null } as any)
        .eq('id', id) as any);
      if (error) throw error;

      logAction({ action: 'UPDATE', entity: 'PROJECTS', entityId: id, details: { type: 'restore' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects-trash'] });
      toast({ title: 'Projeto restaurado!', description: 'O projeto voltou para a lista principal.' });
    },
  });

  // Permanent Delete Mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;

      logAction({ action: 'DELETE', entity: 'PROJECTS', entityId: id, details: { type: 'permanent_delete' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects-trash'] });
      toast({ title: 'Projeto excluído permanentemente', description: 'Esta ação não pode ser desfeita.' });
    },
  });

  // Empty Trash
  const emptyTrashMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .not('deleted_at', 'is', null);
      if (error) throw error;

      logAction({ action: 'DELETE', entity: 'PROJECTS', details: { type: 'empty_trash' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects-trash'] });
      toast({ title: 'Lixeira esvaziada', description: 'Todos os itens foram removidos permanentemente.' });
    },
  });

  const handleDuplicateProject = async (project: ProjectWithImages) => {
    try {
      // 1. Prepare new project data
      const newSlug = `${project.slug}-copy-${Date.now()}`;
      const newTitle = `${project.title} (Cópia)`;

      // Exclude properties that should not be duplicated or are auto-generated
      const { id, created_at, deleted_at, project_images, ...projectData } = project;

      const newProjectData = {
        ...projectData,
        title: newTitle,
        slug: newSlug,
        code: null, // Set to null to avoid unique constraint error and force user to set a new unique code
        is_featured: false,
        is_best_seller: false,
        status: 'draft', // Set as draft initially
        views: 0
      };

      // 2. Insert new project
      const { data: insertedProject, error: insertError } = await supabase
        .from('projects')
        .insert(newProjectData)
        .select()
        .single();

      if (insertError) throw insertError;
      if (!insertedProject) throw new Error('Falha ao inserir projeto duplicado.');

      // 3. Duplicate images
      if (project.project_images && project.project_images.length > 0) {
        const newImages = project.project_images.map(img => ({
          project_id: insertedProject.id,
          image_url: img.image_url,
          display_order: img.display_order,
          is_cover: img.is_cover
        }));

        const { error: imagesError } = await supabase
          .from('project_images')
          .insert(newImages); // @ts-ignore - TS might complain about array insert but it works

        if (imagesError) console.error('Error duplicating images:', imagesError);
      }

      toast({
        title: "Sucesso!",
        description: "Projeto duplicado como Rascunho.",
      });

      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    } catch (error: any) {
      console.error('Error duplicating project:', error);
      toast({
        variant: "destructive",
        title: "Erro ao duplicar",
        description: error.message || "Ocorreu um erro desconhecido ao duplicar.",
      });
    }
  };

  // Code Logic
  const checkCodeDuplication = (code: string) => {
    if (!code || !projects) return;
    const isDuplicate = projects.some(p => p.code === code && p.id !== editingProject?.id);
    if (isDuplicate) {
      toast({
        title: "Código duplicado detectado",
        description: `O código ${code} já está em uso por outro projeto.`,
        variant: "destructive"
      });
    }
  };

  const lastCode = projects?.find(p => p.code)?.code;

  const filteredProjects = projects?.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = (
      project.title.toLowerCase().includes(searchLower) ||
      (project.code && project.code.toLowerCase().includes(searchLower))
    );
    const matchStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sortedProjects = [...(filteredProjects || [])].sort((a, b) => {
    const { key, direction } = sortConfig;
    let comparison = 0;

    switch (key) {
      case 'price':
      case 'bedrooms':
      case 'bathrooms':
      case 'suites':
      case 'built_area': // Adding built_area as it's useful too
        // @ts-ignore - dynamic access to numbered properties
        comparison = (a[key] || 0) - (b[key] || 0);
        break;
      case 'code':
        // Extract numbers from "COD. 123" string
        const codeA = parseInt(a.code?.replace(/\D/g, '') || '0');
        const codeB = parseInt(b.code?.replace(/\D/g, '') || '0');
        comparison = codeA - codeB;
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      default:
        // @ts-ignore
        comparison = String(a[key] || '').localeCompare(String(b[key] || ''));
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Cannot publish without a code
    if (formData.status === 'published' && !formData.code) {
      toast({
        title: "Erro de Validação",
        description: "É obrigatório informar o Código do Projeto para publicar.",
        variant: "destructive"
      });
      return;
    }

    const slug = formData.slug || formData.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    projectMutation.mutate({ ...formData, slug } as ProjectInsert);
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      setFormData({ ...formData, slug });
    }
  };

  // Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
              <Home className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Admin - Projetar Casas</CardTitle>
            <CardDescription>Faça login para acessar o painel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              <Button type="submit" className="w-full" disabled={loginLoading}>
                <LogIn className="h-4 w-4 mr-2" />
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'create') resetForm();
          setCurrentView(view);
        }}
        onLogout={handleLogout}
      />

      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header Area */}
          <div className="flex justify-end items-center mb-[-2rem]">
            <AdminNotifications />
          </div>

          {/* OVERVIEW VIEW */}
          {currentView === 'overview' && (
            <AdminOverview />
          )}

          {/* LEADS/CRM VIEW */}
          {currentView === 'leads' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Mensagens</h1>
                <p className="text-muted-foreground">Solicitações de orçamento e contato</p>
              </div>
              <AdminCRM />
            </div>
          )}

          {/* MODIFICATIONS VIEW */}
          {currentView === 'modifications' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Solicitações de Modificação</h1>
                <p className="text-muted-foreground">Pedidos de personalização de projetos</p>
              </div>
              <AdminModificationsList />
            </div>
          )}

          {/* PROPERTIES LIST VIEW */}
          {currentView === 'properties' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Meus Projetos</h1>
                  <p className="text-muted-foreground">Gerencie seu portfólio de projetos</p>
                </div>
                <Button onClick={() => { resetForm(); setCurrentView('create'); }}>
                  <Home className="mr-2 h-4 w-4" />
                  Novo Projeto
                </Button>
              </div>

              <Card>
                <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-4">
                  <CardTitle>Projetos Cadastrados ({sortedProjects?.length || 0})</CardTitle>
                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {/* Status Filter */}
                    <div className="w-full md:w-40">
                      <Select
                        value={statusFilter}
                        onValueChange={(value: 'all' | 'published' | 'draft') => setStatusFilter(value)}
                      >
                        <SelectTrigger>
                          <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Filtrar por Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="published">Publicados</SelectItem>
                          <SelectItem value="draft">Rascunhos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Select */}
                    <div className="w-full md:w-48">
                      <Select
                        value={`${sortConfig.key}-${sortConfig.direction}`}
                        onValueChange={(value) => {
                          const [key, direction] = value.split('-');
                          // @ts-ignore
                          setSortConfig({ key, direction });
                        }}
                      >
                        <SelectTrigger>
                          {/* Add ArrowUpDown icon to import if needed, assuming generic SelectValue handles display */}
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created_at-desc">Mais Recentes</SelectItem>
                          <SelectItem value="created_at-asc">Mais Antigos</SelectItem>
                          <SelectItem value="price-asc">Preço (Menor {'>'} Maior)</SelectItem>
                          <SelectItem value="price-desc">Preço (Maior {'>'} Menor)</SelectItem>
                          <SelectItem value="code-asc">Código (Crescente)</SelectItem>
                          <SelectItem value="code-desc">Código (Decrescente)</SelectItem>
                          <SelectItem value="bedrooms-desc">Mais Quartos</SelectItem>
                          <SelectItem value="bedrooms-asc">Menos Quartos</SelectItem>
                          <SelectItem value="suites-desc">Mais Suítes</SelectItem>
                          <SelectItem value="bathrooms-desc">Mais Banheiros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full md:w-72">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por nome ou código..."
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4 py-8 text-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      Carregando projetos...
                    </div>
                  ) : filteredProjects?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {searchTerm ? (
                        <>
                          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum projeto encontrado para "{searchTerm}"</p>
                          <Button variant="link" onClick={() => setSearchTerm('')}>Limpar busca</Button>
                        </>
                      ) : (
                        <>
                          <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum projeto cadastrado ainda.</p>
                          <Button variant="link" onClick={() => setCurrentView('create')}>Cadastrar o primeiro</Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {sortedProjects?.map((project) => {
                        const coverImage = project.project_images?.find(img => img.is_cover)?.image_url || project.project_images?.[0]?.image_url;

                        return (
                          <div key={project.id} className="flex items-center gap-4 py-4">
                            {/* Project Thumbnail */}
                            <div className="h-16 w-24 bg-muted rounded-md overflow-hidden flex-shrink-0 border">
                              {coverImage ? (
                                <img src={coverImage} alt={project.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                                  <ImageIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-lg truncate">{project.title}</h3>
                                {project.code && (
                                  <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded font-mono">
                                    {project.code}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-4 text-xs md:text-sm text-muted-foreground mt-1 items-center">
                                <span className="font-medium text-foreground">R$ {project.price.toLocaleString('pt-BR')}</span>
                                <span className="hidden md:inline">•</span>
                                <span>{project.built_area}m²</span>
                                <span className="hidden md:inline">•</span>
                                <span>{project.bedrooms} Quartos</span>
                                {project.views !== null && (
                                  <>
                                    <span className="hidden md:inline">•</span>
                                    <span className="flex items-center gap-1 text-muted-foreground/80" title="Visualizações">
                                      <Eye className="h-3 w-3" />
                                      {project.views}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {project.is_best_seller && (
                                <span className="text-[10px] md:text-xs px-2 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-medium whitespace-nowrap">
                                  Mais Vendido
                                </span>
                              )}
                              {project.is_featured && (
                                <span className="text-[10px] md:text-xs px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-full font-medium whitespace-nowrap">
                                  Destaque
                                </span>
                              )}
                              {project.status === 'published' && (
                                <span className="text-[10px] md:text-xs px-2 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full font-medium whitespace-nowrap flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  Publicado
                                </span>
                              )}
                              {project.status === 'draft' && (
                                <span className="text-[10px] md:text-xs px-2 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full font-medium whitespace-nowrap flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  Rascunho
                                </span>
                              )}

                              <Button variant="outline" size="sm" onClick={() => handleDuplicateProject(project)} title="Duplicar">
                                <Copy className="h-4 w-4" />
                              </Button>

                              <Button variant="outline" size="sm" onClick={() => window.open(`/projeto/${project.slug}`, '_blank')} title="Ver no site">
                                <ExternalLink className="h-4 w-4" />
                              </Button>

                              <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              {canDeleteProjects && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="w-10 px-0"
                                  onClick={() => {
                                    if (confirm('Tem certeza que deseja excluir?')) deleteMutation.mutate(project.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* TRASH VIEW */}
          {currentView === 'trash' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-destructive">Lixeira</h1>
                  <p className="text-muted-foreground">Gerencie projetos excluídos</p>
                </div>
                {trashProjects && trashProjects.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja esvaziar a lixeira? Todos os projetos serão excluídos permanentemente.')) {
                        emptyTrashMutation.mutate();
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Esvaziar Lixeira
                  </Button>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Itens na Lixeira ({trashProjects?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {isTrashLoading ? (
                    <div className="space-y-4 py-8 text-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      Carregando lixeira...
                    </div>
                  ) : trashProjects?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>A lixeira está vazia.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {trashProjects?.map((project) => (
                        <div key={project.id} className="flex items-center justify-between py-4 opacity-75 hover:opacity-100 transition-opacity">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{project.title}</h3>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span>Excluído em: {new Date(project.deleted_at!).toLocaleDateString()}</span>
                              {project.code && <span>• Código: {project.code}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => restoreMutation.mutate(project.id)}
                              className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                            >
                              <RefreshCcw className="h-4 w-4 mr-2" />
                              Restaurar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-10 px-0"
                              title="Excluir Permanentemente"
                              onClick={() => {
                                if (confirm('ATENÇÃO: Esta ação não pode ser desfeita. Deseja excluir permanentemente?')) {
                                  permanentDeleteMutation.mutate(project.id);
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* USERS VIEW */}
          {currentView === 'users' && canManageTeam && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Gestão de Equipe</h1>
                <p className="text-muted-foreground">Gerencie o acesso de sócios e funcionários</p>
              </div>
              <AdminUsersList />
            </div>
          )}

          {/* SQL VIEW */}
          {currentView === 'sql' && isMaster && (
            <AdminSqlEditor />
          )}

          {/* SETTINGS VIEW */}
          {currentView === 'settings' && (
            <AdminSettings />
          )}

          {/* LOGS VIEW */}
          {currentView === 'logs' && (isMaster || canManageTeam) && (
            <AdminAuditLogs />
          )}

          {/* CMS VIEW */}
          {currentView === 'cms' && (
            <AdminCMS />
          )}

          {/* FINANCIAL VIEW */}
          {currentView === 'financial' && (
            <AdminFinancial />
          )}

          {/* CREATE / EDIT VIEW */}
          {currentView === 'create' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{editingProject ? 'Editar Projeto' : 'Cadastrar Novo Projeto'}</h1>
                  <p className="text-muted-foreground">Preencha os dados completos do projeto</p>
                </div>
                <Button variant="outline" onClick={() => setCurrentView('properties')}>
                  Cancelar e Voltar
                </Button>
                {editingProject && (
                  <Button variant="ghost" className="ml-2" onClick={() => window.open(`/projeto/${editingProject.slug}`, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver no Site
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Título do Projeto *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          onBlur={generateSlug}
                          placeholder="Ex: Casa Térrea Moderna"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Código do Projeto *</Label>
                        <div className="flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <span className="pl-3 pr-1 text-muted-foreground font-medium select-none">COD.</span>
                          <Input
                            className="border-0 focus-visible:ring-0 pl-1"
                            value={formData.code ? formData.code.replace('COD. ', '') : ''}
                            onChange={(e) => {
                              const numbers = e.target.value.replace(/\D/g, '');
                              const newCode = numbers ? `COD. ${numbers}` : '';
                              setFormData({ ...formData, code: newCode });
                            }}
                            onBlur={(e) => {
                              const numbers = e.target.value.replace(/\D/g, '');
                              const fullCode = numbers ? `COD. ${numbers}` : '';
                              checkCodeDuplication(fullCode);
                            }}
                            placeholder="001"
                            required
                          />
                        </div>
                        {lastCode && (
                          <p className="text-xs text-muted-foreground">
                            Último utilizado: <span className="font-mono font-medium">{lastCode}</span>
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Slug (URL Amigável)</Label>
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="casa-terrea-moderna"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição Completa</Label>
                      <RichTextEditor
                        value={formData.description || ''}
                        onChange={(value) => setFormData({ ...formData, description: value })}
                        placeholder="Descreva o projeto detalhadamente. Use o ícone de imagem para adicionar fotos ao corpo do texto."
                        projectId={editingProject?.id || draftId}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 border p-4 rounded-lg bg-accent/5">
                          <Switch
                            checked={formData.is_featured}
                            onCheckedChange={(c) => setFormData({ ...formData, is_featured: c })}
                          />
                          <Label>Destacar este imóvel na Home</Label>
                        </div>

                        <div className="flex items-center gap-3 border p-4 rounded-lg bg-emerald-500/5 border-emerald-500/20">
                          <Switch
                            checked={formData.is_best_seller}
                            onCheckedChange={(c) => setFormData({ ...formData, is_best_seller: c })}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <div>
                            <Label className="block">Marcar como "Mais Vendido"</Label>
                            <span className="text-xs text-muted-foreground">Aparecerá na seção de destaques de vendas</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 border p-4 rounded-lg bg-slate-100 border-slate-200">
                          <Switch
                            checked={formData.status === 'published'}
                            onCheckedChange={(c) => setFormData({ ...formData, status: c ? 'published' : 'draft' })}
                            className="data-[state=checked]:bg-blue-600"
                          />
                          <div>
                            <Label className="block">Status: {formData.status === 'published' ? 'Publicado' : 'Rascunho'}</Label>
                            <span className="text-xs text-muted-foreground">
                              {formData.status === 'published'
                                ? 'Visível para todos os visitantes do site'
                                : 'Oculto do site, visível apenas no Admin'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="border p-4 rounded-lg bg-accent/5">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Estilo Arquitetônico</Label>
                          <StyleManagerDialog onStylesChange={refetchStyles} />
                        </div>
                        <Select
                          value={formData.style || ''}
                          onValueChange={(value) => setFormData({ ...formData, style: value })}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecione o estilo" />
                          </SelectTrigger>
                          <SelectContent>
                            {styles?.map((s) => (
                              <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dimensions & Characteristics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dimensões e Características</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label>Preço do Projeto (R$) *</Label>
                      <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Área Construída (m²) *</Label>
                      <Input type="number" value={formData.built_area} onChange={e => setFormData({ ...formData, built_area: Number(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Frente Terreno (m)</Label>
                      <Input type="number" step="0.1" value={formData.width_meters} onChange={e => setFormData({ ...formData, width_meters: Number(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Fundo Terreno (m)</Label>
                      <Input type="number" step="0.1" value={formData.depth_meters} onChange={e => setFormData({ ...formData, depth_meters: Number(e.target.value) })} required />
                    </div>

                    {/* Rooms */}
                    <div className="space-y-2">
                      <Label>Quartos</Label>
                      <Input type="number" value={formData.bedrooms} onChange={e => setFormData({ ...formData, bedrooms: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Suítes</Label>
                      <Input type="number" value={formData.suites} onChange={e => setFormData({ ...formData, suites: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Banheiros</Label>
                      <Input type="number" value={formData.bathrooms} onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Vagas Garagem</Label>
                      <Input type="number" value={formData.garage_spots} onChange={e => setFormData({ ...formData, garage_spots: Number(e.target.value) })} />
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Projects Prices */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preços dos Projetos Complementares</CardTitle>
                    <CardDescription>Defina os valores individuais. Mantenha 0 para não oferecer.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label>⚡ Elétrico (R$)</Label>
                      <Input type="number" value={formData.price_electrical} onChange={e => setFormData({ ...formData, price_electrical: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>💧 Hidráulico (R$)</Label>
                      <Input type="number" value={formData.price_hydraulic} onChange={e => setFormData({ ...formData, price_hydraulic: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>🚿 Sanitário (R$)</Label>
                      <Input type="number" value={formData.price_sanitary} onChange={e => setFormData({ ...formData, price_sanitary: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>🏗️ Estrutural (R$)</Label>
                      <Input type="number" value={formData.price_structural} onChange={e => setFormData({ ...formData, price_structural: Number(e.target.value) })} />
                    </div>
                  </CardContent>
                </Card>

                {/* Images Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Galeria de Imagens
                      </CardTitle>
                      <CardDescription>
                        Gerencie as imagens do projeto.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingProject?.id ? (
                      <AdminImageGallery projectId={editingProject.id} />
                    ) : (
                      <div className="bg-muted/5 rounded-xl">
                        <AdminImageGallery
                          onFilesSelected={handleFilesSelected}
                          localFiles={selectedFiles}
                          onRemoveLocalFile={handleRemoveLocalFile}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" size="lg" onClick={() => setCurrentView('properties')}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="lg" className="min-w-[150px]" disabled={projectMutation.isPending}>
                    {projectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Projeto
                  </Button>
                </div>

              </form>
            </div>
          )}

        </div>
      </main >
    </div >
  );
};
