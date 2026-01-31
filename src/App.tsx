import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Lazy loading das páginas para melhorar performance inicial
import { FavoritesProvider } from "./contexts/FavoritesContext";

const Index = lazy(() => import("./pages/Index"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const CustomProjectPage = lazy(() => import("./pages/CustomProjectPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage")); // New
const AboutPage = lazy(() => import("./pages/AboutPage")); // New
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage")); // New
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
    </div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FavoritesProvider>
          <Toaster />
          <Sonner />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projetos" element={<ProjectsPage />} />
              <Route path="/favoritos" element={<FavoritesPage />} />
              <Route path="/contato" element={<ContactPage />} />
              <Route path="/sobre" element={<AboutPage />} />
              <Route path="/como-funciona" element={<HowItWorksPage />} />
              <Route path="/projeto/:slug" element={<ProjectDetailPage />} />
              <Route path="/projeto-personalizado" element={<CustomProjectPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/auth" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </FavoritesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
