import { useState } from 'react';
import { useSection } from '../contexts/SectionContext';
import { useListPrograms, useCreateProgram, useUpdateProgram, useDeleteProgram, useListMembers } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Program } from '../backend';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';

export default function ProgramsPage() {
  const { currentSection } = useSection();
  const { data: programs = [], isLoading } = useListPrograms(currentSection);
  const { data: members = [] } = useListMembers(currentSection);
  const { mutateAsync: createProgram } = useCreateProgram();
  const { mutateAsync: updateProgram } = useUpdateProgram();
  const { mutateAsync: deleteProgram } = useDeleteProgram();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    devotionLeader: '',
    meetingLeader: '',
    preacher: '',
    songLeader: '',
  });

  const sortedPrograms = [...programs].sort((a, b) => b.date.localeCompare(a.date));

  const resetForm = () => {
    setFormData({
      date: '',
      devotionLeader: '',
      meetingLeader: '',
      preacher: '',
      songLeader: '',
    });
    setEditingProgram(null);
  };

  const handleOpenDialog = (program?: Program) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        date: program.date,
        devotionLeader: program.devotionLeader,
        meetingLeader: program.meetingLeader,
        preacher: program.preacher,
        songLeader: program.songLeader,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentSection) return;
    if (!formData.date) {
      toast.error('Ampidiro ny daty');
      return;
    }

    try {
      const programData: Program = {
        id: editingProgram?.id || `program-${Date.now()}`,
        sectionId: currentSection,
        ...formData,
        createdAt: editingProgram?.createdAt || BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      };

      if (editingProgram) {
        await updateProgram(programData);
        toast.success('Voaova');
      } else {
        await createProgram(programData);
        toast.success('Voaray');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Tsy afaka');
    }
  };

  const handleDelete = async (programId: string) => {
    if (!currentSection) return;
    if (!confirm('Hamafa ve?')) return;

    try {
      await deleteProgram({ programId, sectionId: currentSection });
      toast.success('Voafafa');
    } catch (error) {
      toast.error('Tsy afaka namafa');
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.fullName || memberId;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Programa (Programme)</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Hanampy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProgram ? 'Hanova programa' : 'Hanampy programa'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Daty *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="devotionLeader">Mitarika fanolorantena</Label>
                    <Input
                      id="devotionLeader"
                      value={formData.devotionLeader}
                      onChange={(e) => setFormData({ ...formData, devotionLeader: e.target.value })}
                      placeholder="Ampidiro ny anarana"
                    />
                  </div>

                  <MemberSelector
                    label="Mitarika fivoriana"
                    members={members}
                    value={formData.meetingLeader}
                    onChange={(value) => setFormData({ ...formData, meetingLeader: value })}
                  />

                  <MemberSelector
                    label="Mitory teny"
                    members={members}
                    value={formData.preacher}
                    onChange={(value) => setFormData({ ...formData, preacher: value })}
                  />

                  <MemberSelector
                    label="Mitarika Hira"
                    members={members}
                    value={formData.songLeader}
                    onChange={(value) => setFormData({ ...formData, songLeader: value })}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Hanakatona
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingProgram ? 'Hanova' : 'Hanampy'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Manampy...</div>
          ) : sortedPrograms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Tsy misy programa</div>
          ) : (
            <div className="space-y-4">
              {sortedPrograms.map((program) => (
                <Card key={program.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-lg">{program.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(program)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(program.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Mitarika fanolorantena</p>
                        <p className="font-medium">{program.devotionLeader || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mitarika fivoriana</p>
                        <p className="font-medium">{getMemberName(program.meetingLeader)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mitory teny</p>
                        <p className="font-medium">{getMemberName(program.preacher)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mitarika Hira</p>
                        <p className="font-medium">{getMemberName(program.songLeader)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MemberSelector({ label, members, value, onChange }: {
  label: string;
  members: any[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedMember = members.find(m => m.id === value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedMember ? selectedMember.fullName : 'Safidio mpikambana...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Hitady..." />
            <CommandList>
              <CommandEmpty>Tsy misy</CommandEmpty>
              <CommandGroup>
                {members.map((member) => (
                  <CommandItem
                    key={member.id}
                    onSelect={() => {
                      onChange(member.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        value === member.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    {member.fullName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
