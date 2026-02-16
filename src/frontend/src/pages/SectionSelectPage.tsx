import { useState } from 'react';
import { SECTIONS } from '../contexts/SectionContext';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SectionSelectPage({ isInitialSetup }: { isInitialSetup: boolean }) {
  const { data: profile } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [name, setName] = useState(profile?.name || '');

  const handleSubmit = async () => {
    if (isInitialSetup && !name.trim()) {
      toast.error('Ampidiro ny anarana');
      return;
    }
    if (!selectedSection) {
      toast.error('Safidio ny sampana');
      return;
    }

    try {
      await saveProfile({
        name: name.trim() || profile?.name || 'User',
        section: selectedSection,
        committeeRole: profile?.committeeRole,
      });
      toast.success('Voaray!');
    } catch (error) {
      toast.error('Tsy afaka');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/generated/app-logo.dim_512x512.png" 
              alt="Logo" 
              className="h-16 w-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl">
            {isInitialSetup ? 'Tongasoa!' : 'Hisafidy Sampana'}
          </CardTitle>
          <CardDescription>
            {isInitialSetup ? 'Ampidiro ny anarana sy safidio ny sampana' : 'Safidio ny sampana hiasana'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInitialSetup && (
            <div className="space-y-2">
              <Label htmlFor="name">Anarana</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ampidiro ny anarana"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Sampana</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedSection === section.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-semibold">{section.label}</p>
                  <p className="text-sm text-muted-foreground">{section.labelFr}</p>
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isPending || !selectedSection}
            className="w-full"
            size="lg"
          >
            {isPending ? 'Andraso...' : 'Tohizana'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
