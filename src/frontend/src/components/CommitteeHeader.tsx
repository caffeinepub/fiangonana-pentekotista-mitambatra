import { useSection } from '../contexts/SectionContext';
import { useGetSectionCommittee, useUpdateSectionCommittee, useListMembers } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

type RoleType = 'president' | 'treasurer' | 'secretary';

export default function CommitteeHeader() {
  const { currentSection } = useSection();
  const { data: committee } = useGetSectionCommittee(currentSection);
  const { data: members = [] } = useListMembers(currentSection);
  const { mutateAsync: updateCommittee } = useUpdateSectionCommittee();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  const roles = [
    { key: 'president' as const, label: 'Filoha', field: 'presidentId' as const },
    { key: 'treasurer' as const, label: 'Mpitahiry vola', field: 'treasurerId' as const },
    { key: 'secretary' as const, label: 'Mpitan-tsoratra', field: 'secretaryId' as const },
  ];

  const getMemberName = (memberId: string | undefined) => {
    if (!memberId) return 'Tsy voatendry';
    const member = members.find(m => m.id === memberId);
    return member?.fullName || 'Tsy hita';
  };

  const handleSelectMember = async (memberId: string) => {
    if (!currentSection || !selectedRole) return;

    const roleField = roles.find(r => r.key === selectedRole)?.field;
    if (!roleField) return;

    try {
      await updateCommittee({
        sectionId: currentSection,
        presidentId: committee?.presidentId,
        treasurerId: committee?.treasurerId,
        secretaryId: committee?.secretaryId,
        [roleField]: memberId,
        updatedAt: BigInt(Date.now()),
      });
      toast.success('Voaova ny mpitarika');
      setDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      toast.error('Tsy afaka nanova');
    }
  };

  return (
    <div className="bg-accent/30 rounded-lg p-4 backdrop-blur-sm">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Komity</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roles.map((role) => {
          const memberId = committee?.[role.field];
          return (
            <div key={role.key} className="flex items-center justify-between bg-background/50 rounded-md p-3">
              <div>
                <p className="text-xs text-muted-foreground">{role.label}</p>
                <p className="font-medium text-sm">{getMemberName(memberId)}</p>
              </div>
              <Dialog open={dialogOpen && selectedRole === role.key} onOpenChange={(open) => {
                setDialogOpen(open);
                if (open) setSelectedRole(role.key);
                else setSelectedRole(null);
              }}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Hanova
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hisafidy {role.label}</DialogTitle>
                  </DialogHeader>
                  <Command>
                    <CommandInput placeholder="Hitady mpikambana..." />
                    <CommandList>
                      <CommandEmpty>Tsy misy mpikambana</CommandEmpty>
                      <CommandGroup>
                        {members.map((member) => (
                          <CommandItem
                            key={member.id}
                            onSelect={() => handleSelectMember(member.id)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                memberId === member.id ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            {member.fullName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DialogContent>
              </Dialog>
            </div>
          );
        })}
      </div>
    </div>
  );
}
