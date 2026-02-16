import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import LoginPage from './pages/LoginPage';
import SectionSelectPage from './pages/SectionSelectPage';
import MembersPage from './pages/MembersPage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import ProgramsPage from './pages/ProgramsPage';
import GroupsPage from './pages/GroupsPage';
import AttendancePage from './pages/AttendancePage';
import AppLayout from './components/layout/AppLayout';
import { SectionProvider } from './contexts/SectionContext';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (isInitializing || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  const showProfileSetup = isFetched && profile === null;
  if (showProfileSetup) {
    return <SectionSelectPage isInitialSetup />;
  }

  return <>{children}</>;
}

function SectionGate({ children }: { children: React.ReactNode }) {
  const { data: profile } = useGetCallerUserProfile();

  if (!profile?.section) {
    return <SectionSelectPage isInitialSetup={false} />;
  }

  return <>{children}</>;
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthGate>
      <SectionProvider>
        <SectionGate>
          <AppLayout>
            <Outlet />
          </AppLayout>
        </SectionGate>
      </SectionProvider>
    </AuthGate>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MembersPage,
});

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/members',
  component: MembersPage,
});

const financialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/financial',
  component: FinancialReportsPage,
});

const programsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/programs',
  component: ProgramsPage,
});

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups',
  component: GroupsPage,
});

const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/attendance',
  component: AttendancePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  membersRoute,
  financialRoute,
  programsRoute,
  groupsRoute,
  attendanceRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
