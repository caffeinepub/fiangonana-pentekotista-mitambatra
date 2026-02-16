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
import StartupErrorScreen from './components/StartupErrorScreen';
import { useSafeActor } from './hooks/useSafeActor';
import { useStartupRetry } from './hooks/useStartupRetry';
import { getUserSafeErrorSummary, logStartupError } from './utils/startupDiagnostics';
import { useState, useEffect } from 'react';

function AuthenticatedGate({ children }: { children: React.ReactNode }) {
  const { actor, isFetching: actorFetching, isError: actorError, error: actorInitError } = useSafeActor();
  const { data: profile, isLoading: profileLoading, isFetched, error: profileError } = useGetCallerUserProfile();
  const { retry } = useStartupRetry();
  const [isRetrying, setIsRetrying] = useState(false);

  // Determine if there's a startup failure
  const actorFailed = actorError && !actorFetching;
  const profileFailed = profileError && isFetched;
  const hasStartupError = actorFailed || profileFailed;

  // Log errors to console when they occur
  useEffect(() => {
    if (actorInitError) {
      logStartupError('Actor Initialization', actorInitError);
    }
  }, [actorInitError]);

  useEffect(() => {
    if (profileError) {
      logStartupError('Profile Query', profileError);
    }
  }, [profileError]);

  // Show error screen if startup failed
  if (hasStartupError) {
    const error = actorInitError || profileError;
    const errorMessage = error ? getUserSafeErrorSummary(error) : undefined;

    return (
      <StartupErrorScreen
        errorMessage={errorMessage}
        isRetrying={isRetrying}
        onRetry={async () => {
          setIsRetrying(true);
          try {
            await retry();
          } finally {
            // Keep retrying state for a bit to prevent double-clicks
            setTimeout(() => setIsRetrying(false), 1000);
          }
        }}
      />
    );
  }

  // Show loading while actor or profile is initializing
  if (actorFetching || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile setup if user has no profile yet
  const showProfileSetup = isFetched && profile === null;
  if (showProfileSetup) {
    return <SectionSelectPage isInitialSetup />;
  }

  return <>{children}</>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  // Show loading only while checking for stored identity
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login page immediately
  if (!identity) {
    return <LoginPage />;
  }

  // User is authenticated, proceed to authenticated gate
  return <AuthenticatedGate>{children}</AuthenticatedGate>;
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
