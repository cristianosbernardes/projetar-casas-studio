import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import { Toaster } from '@/components/ui/sonner';
import { ExitIntentPopup } from '@/components/marketing/ExitIntentPopup';

import StickySearchHeader from './StickySearchHeader';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <StickySearchHeader />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster />
      <ExitIntentPopup />
    </div>
  );
};

export default Layout;

