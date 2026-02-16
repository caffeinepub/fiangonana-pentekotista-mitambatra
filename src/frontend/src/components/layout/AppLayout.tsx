import { Link, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useSection } from '../../contexts/SectionContext';
import { Users, DollarSign, Calendar, UsersRound, ClipboardCheck, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import CommitteeHeader from '../CommitteeHeader';
import SyncStatus from '../SyncStatus';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { currentSection, getSectionLabel } = useSection();
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navItems = [
    { path: '/members', label: 'Lisitra', icon: Users },
    { path: '/financial', label: 'Ara-bola', icon: DollarSign },
    { path: '/programs', label: 'Programa', icon: Calendar },
    { path: '/groups', label: 'Groupe', icon: UsersRound },
    { path: '/attendance', label: 'Fahatongavana', icon: ClipboardCheck },
  ];

  const isActive = (path: string) => {
    return routerState.location.pathname === path || (path === '/members' && routerState.location.pathname === '/');
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isActive(item.path)
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header with pattern background */}
      <header 
        className="border-b bg-card relative overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/generated/header-pattern.dim_1600x400.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 to-background/80" />
        
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <img 
                src="/assets/generated/app-logo.dim_512x512.png" 
                alt="Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  FIANGONANA PENTEKOTISTA MITAMBATRA
                </h1>
                {currentSection && (
                  <p className="text-sm text-muted-foreground">
                    {getSectionLabel(currentSection)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <SyncStatus />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Hivoaka</span>
              </Button>
            </div>
          </div>

          {currentSection && <CommitteeHeader />}
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-2 py-2">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden py-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="h-5 w-5 mr-2" />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-2 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} · Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
