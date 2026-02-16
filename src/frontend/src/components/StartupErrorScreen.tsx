import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface StartupErrorScreenProps {
  onRetry: () => void;
  errorMessage?: string;
  isRetrying?: boolean;
}

export default function StartupErrorScreen({ onRetry, errorMessage, isRetrying = false }: StartupErrorScreenProps) {
  return (
    <div className="flex h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We encountered an error while starting the app. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {errorMessage && (
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1">Error details:</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground">
            If the problem persists, please check your internet connection or try again later.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onRetry} disabled={isRetrying} className="w-full sm:w-auto">
            {isRetrying ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Retrying...
              </>
            ) : (
              'Retry'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
