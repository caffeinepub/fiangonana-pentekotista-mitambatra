import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/generated/app-logo.dim_512x512.png" 
              alt="Logo" 
              className="h-20 w-20 object-contain"
            />
          </div>
          <CardTitle className="text-2xl">FIANGONANA PENTEKOTISTA MITAMBATRA</CardTitle>
          <CardDescription>
            Midira amin'ny alalan'ny Internet Identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={login} 
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? 'Miditra...' : 'Hiditra'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
