import { useCallback } from 'react';
import { useSafeActor } from './useSafeActor';
import { useQueryClient } from '@tanstack/react-query';

export function useStartupRetry() {
  const { reinitialize } = useSafeActor();
  const queryClient = useQueryClient();

  const retry = useCallback(async () => {
    // First, reinitialize the actor
    reinitialize();

    // Wait a bit for the actor to initialize
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Then invalidate and refetch the user profile
    await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    await queryClient.refetchQueries({ queryKey: ['currentUserProfile'] });
  }, [reinitialize, queryClient]);

  return { retry };
}
