import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, Home, LogIn, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLeadsList } from '@/components/admin/AdminLeadsList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Project, ProjectInsert } from '@/types/database';

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // View State
  const [currentView, setCurrentView] = useState<'properties' | 'leads' | 'create'>('properties');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Form/Edit State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectInsert>>({
    title: '',
    slug: '',
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
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
    enabled: isAuthenticated,
  });

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);

    if (error) {
      toast({ title: 'Erro ao fazer login', description: error.message, variant: 'destructive' });
    } else {
      setIsAuthenticated(true);
      toast({ title: 'Login realizado!', description: 'Bem-vindo ao painel administrativo.' });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    toast({ title: 'Logout realizado' });
  };

  // Projects Mutation
  const projectMutation = useMutation({
    mutationFn: async (data: ProjectInsert) => {
      if (editingProject) {
        // @ts-ignore
        const { error } = await supabase.from('projects').update(data).eq('id', editingProject.id);
        if (error) throw error;
      } else {
        // @ts-ignore
        const { error } = await supabase.from('projects').insert([data]);
        if (error) throw error;
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

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast({ title: 'Projeto excluído!', description: 'O projeto foi removido com sucesso.' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '', slug: '', description: '', price: 0, width_meters: 0, depth_meters: 0,
      bedrooms: 0, bathrooms: 0, suites: 0, garage_spots: 0, built_area: 0,
      style: 'Moderno', is_featured: false, price_electrical: 0, price_hydraulic: 0,
      price_sanitary: 0, price_structural: 0,
    });
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setCurrentView('create'); // Reuse create view for editing
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
        currentView={currentView} // Reuse create view effectively for editing state too if handled
        onViewChange={(view) => {
          if (view === 'create') resetForm();
          setCurrentView(view);
        }}
        onLogout={handleLogout}
      />

      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">

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
                <CardHeader>
                  <CardTitle>Projetos Cadastrados ({projects?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4 py-8 text-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      Carregando projetos...
                    </div>
                  ) : projects?.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum projeto cadastrado ainda.</p>
                      <Button variant="link" onClick={() => setCurrentView('create')}>Cadastrar o primeiro</Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {projects?.map((project) => (
                        <div key={project.id} className="flex items-center justify-between py-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{project.title}</h3>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span>R$ {project.price.toLocaleString('pt-BR')}</span>
                              <span>•</span>
                              <span>{project.built_area}m²</span>
                              <span>•</span>
                              <span>{project.bedrooms} Quartos</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {project.is_featured && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">Destaque</span>}
                            <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* LEADS VIEW */}
          {currentView === 'leads' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Mensagens</h1>
                <p className="text-muted-foreground">Solicitações de orçamento e contato</p>
              </div>
              <AdminLeadsList />
            </div>
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
                      <Textarea
                        rows={4}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div className="flex items-center gap-3 border p-4 rounded-lg bg-accent/5">
                        <Switch
                          checked={formData.is_featured}
                          onCheckedChange={(c) => setFormData({ ...formData, is_featured: c })}
                        />
                        <Label>Destacar este imóvel na Home</Label>
                      </div>
                      <div className="border p-4 rounded-lg bg-accent/5">
                        <Label>Estilo Arquitetônico</Label>
                        <Input
                          className="mt-2 bg-background"
                          value={formData.style || ''}
                          onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                          placeholder="Ex: Moderno, Neoclássico"
                        />
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
                        Gerencie as imagens do projeto. No momento, utilize o bucket 'project-images' no Supabase.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for future image upload/management UI */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/5 transition-colors cursor-pointer">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-lg mb-1">Upload de Imagens</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Arraste e solte imagens aqui ou clique para selecionar.
                        (Funcionalidade visual placeholder para futura integração com Storage)
                      </p>
                    </div>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
