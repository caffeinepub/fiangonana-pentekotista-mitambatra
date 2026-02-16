import { useInternetIdentity } from './useInternetIdentity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

const ACTOR_QUERY_KEY = 'safeActor';

export function useSafeActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [attemptCounter, setAttemptCounter] = useState(0);
  const [initError, setInitError] = useState<Error | null>(null);

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString(), attemptCounter],
    queryFn: async () => {
      try {
        setInitError(null);
        const isAuthenticated = !!identity;

        if (!isAuthenticated) {
          // Return anonymous actor if not authenticated
          return await createActorWithConfig();
        }

        const actorOptions = {
          agentOptions: {
            identity,
          },
        };

        const actor = await createActorWithConfig(actorOptions);

        // Only initialize access control if admin token is present and non-empty
        const adminToken = getSecretParameter('caffeineAdminToken') || '';
        if (adminToken.trim()) {
          try {
            await actor._initializeAccessControlWithSecret(adminToken);
          } catch (error) {
            // Log but don't fail if access control init fails
            console.warn('Access control initialization failed:', error);
          }
        }

        return actor;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setInitError(err);
        throw err;
      }
    },
    staleTime: Infinity,
    enabled: true,
    retry: false,
  });

  const reinitialize = useCallback(() => {
    setAttemptCounter((prev) => prev + 1);
    setInitError(null);
  }, []);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isError: actorQuery.isError || !!initError,
    error: initError || actorQuery.error,
    reinitialize,
  };
}
