import { Link, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useSection } from '../../contexts/SectionContext';
import { Users, DollarSign, Calendar, UsersRound, ClipboardCheck, BookOpen, LogOut, Menu } from 'lucide-react';
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
    { path: '/books', label: 'Chinese Reader', icon: BookOpen },
  ];

  const isActive = (path: string) => {
    if (path === '/books') {
      return routerState.location.pathname.startsWith('/books');
    }
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with pattern background */}
      <header 
        className="border-b bg-card relative overflow-hidden flex-shrink-0"
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
                className="h-12 w-12 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-words">
                  Vondrona.mn
                </h1>
                {currentSection && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {getSectionLabel(currentSection)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <SyncStatus />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="flex flex-col gap-2 mt-8">
                    <NavLinks />
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <CommitteeHeader />
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="border-b bg-card hidden lg:block flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-2">
            <NavLinks />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-4 text-center text-sm text-muted-foreground flex-shrink-0">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} • Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'unknown-app'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
