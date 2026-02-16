import { useState } from 'react';
import { useSection } from '../contexts/SectionContext';
import { useListGroups, useCreateGroup, useUpdateGroup, useDeleteGroup, useListMembers } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import type { Group } from '../backend';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GroupFinancialReportsDialog from '../components/groups/GroupFinancialReportsDialog';

export default function GroupsPage() {
  const { currentSection } = useSection();
  const { data: groups = [], isLoading } = useListGroups(currentSection);
  const { data: members = [] } = useListMembers(currentSection);
  const { mutateAsync: createGroup } = useCreateGroup();
  const { mutateAsync: updateGroup } = useUpdateGroup();
  const { mutateAsync: deleteGroup } = useDeleteGroup();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    presidentId: '',
    secretaryId: '',
    treasurerId: '',
    memberIds: [] as string[],
  });

  const [financialDialogOpen, setFinancialDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      presidentId: '',
      secretaryId: '',
      treasurerId: '',
      memberIds: [],
    });
    setEditingGroup(null);
  };

  const handleOpenDialog = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        presidentId: group.presidentId,
        secretaryId: group.secretaryId,
        treasurerId: group.treasurerId,
        memberIds: group.memberIds,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleOpenFinancialDialog = (group: Group) => {
    setSelectedGroup(group);
    setFinancialDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentSection) return;
    if (!formData.name.trim()) {
      toast.error('Ampidiro ny anarana');
      return;
    }

    try {
      const groupData: Group = {
        id: editingGroup?.id || `group-${Date.now()}`,
        sectionId: currentSection,
        ...formData,
        createdAt: editingGroup?.createdAt || BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      };

      if (editingGroup) {
        await updateGroup(groupData);
        toast.success('Voaova');
      } else {
        await createGroup(groupData);
        toast.success('Voaray');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Tsy afaka');
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!currentSection) return;
    if (!confirm('Hamafa ve?')) return;

    try {
      await deleteGroup({ groupId, sectionId: currentSection });
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
            <CardTitle>Groupe</CardTitle>
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingGroup ? 'Hanova groupe' : 'Hanampy groupe'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Anarana *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <MemberSelector
                    label="Filoha"
                    members={members}
                    value={formData.presidentId}
                    onChange={(value) => setFormData({ ...formData, presidentId: value })}
                  />

                  <MemberSelector
                    label="Mpitan-tsoratra"
                    members={members}
                    value={formData.secretaryId}
                    onChange={(value) => setFormData({ ...formData, secretaryId: value })}
                  />

                  <MemberSelector
                    label="Mpitahiry vola"
                    members={members}
                    value={formData.treasurerId}
                    onChange={(value) => setFormData({ ...formData, treasurerId: value })}
                  />

                  <MultiMemberSelector
                    label="Mpikambana"
                    members={members}
                    selectedIds={formData.memberIds}
                    onChange={(ids) => setFormData({ ...formData, memberIds: ids })}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Hanakatona
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingGroup ? 'Hanova' : 'Hanampy'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Manampy...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Tsy misy groupe</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenFinancialDialog(group)}
                          title="Ara-bola"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(group)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(group.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Filoha</p>
                        <p className="font-medium">{getMemberName(group.presidentId)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mpitan-tsoratra</p>
                        <p className="font-medium">{getMemberName(group.secretaryId)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mpitahiry vola</p>
                        <p className="font-medium">{getMemberName(group.treasurerId)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Mpikambana ({group.memberIds.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {group.memberIds.slice(0, 3).map(id => (
                            <Badge key={id} variant="secondary" className="text-xs">
                              {getMemberName(id)}
                            </Badge>
                          ))}
                          {group.memberIds.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{group.memberIds.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGroup && currentSection && (
        <GroupFinancialReportsDialog
          open={financialDialogOpen}
          onOpenChange={setFinancialDialogOpen}
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          sectionId={currentSection}
        />
      )}
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
            {selectedMember ? selectedMember.fullName : 'Safidio...'}
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

function MultiMemberSelector({ label, members, selectedIds, onChange }: {
  label: string;
  members: any[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggleMember = (memberId: string) => {
    if (selectedIds.includes(memberId)) {
      onChange(selectedIds.filter(id => id !== memberId));
    } else {
      onChange([...selectedIds, memberId]);
    }
  };

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
            {selectedIds.length > 0 ? `${selectedIds.length} safidy` : 'Safidio...'}
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
                    onSelect={() => toggleMember(member.id)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedIds.includes(member.id) ? 'opacity-100' : 'opacity-0'
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
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedIds.map(id => {
            const member = members.find(m => m.id === id);
            return member ? (
              <Badge key={id} variant="secondary" className="text-xs">
                {member.fullName}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
