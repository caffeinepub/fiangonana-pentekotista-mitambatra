import { useGetLastSyncTime } from '../hooks/useQueries';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

export default function SyncStatus() {
  const { data: lastSyncTime } = useGetLastSyncTime();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = isFetching > 0 || isMutating > 0;

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
      {lastSyncTime && lastSyncTime > BigInt(0) && (
        <span className="hidden sm:inline">
          {formatTime(lastSyncTime)}
        </span>
      )}
    </div>
  );
}
