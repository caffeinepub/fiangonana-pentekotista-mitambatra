import { useState } from 'react';
import { useSection } from '../contexts/SectionContext';
import { useListMembers, useCreateMember, useUpdateMember, useDeleteMember } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Pencil, Trash2, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { Member } from '../backend';
import { formatAge } from '../utils/memberAge';

export default function MembersPage() {
  const { currentSection } = useSection();
  const { data: members = [], isLoading } = useListMembers(currentSection);
  const { mutateAsync: createMember } = useCreateMember();
  const { mutateAsync: updateMember } = useUpdateMember();
  const { mutateAsync: deleteMember } = useDeleteMember();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    sex: 'Lahy',
    dateOfBirth: '',
    father: '',
    mother: '',
    profession: '',
  });

  const filteredMembers = members.filter(m => 
    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  const resetForm = () => {
    setFormData({
      fullName: '',
      address: '',
      phone: '',
      sex: 'Lahy',
      dateOfBirth: '',
      father: '',
      mother: '',
      profession: '',
    });
    setEditingMember(null);
  };

  const handleOpenDialog = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        fullName: member.fullName,
        address: member.address,
        phone: member.phone,
        sex: member.sex,
        dateOfBirth: member.dateOfBirth,
        father: member.father,
        mother: member.mother,
        profession: member.profession,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentSection) return;
    if (!formData.fullName.trim()) {
      toast.error('Ampidiro ny anarana');
      return;
    }

    try {
      const memberData: Member = {
        id: editingMember?.id || `member-${Date.now()}`,
        sectionId: currentSection,
        ...formData,
        createdAt: editingMember?.createdAt || BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      };

      if (editingMember) {
        await updateMember(memberData);
        toast.success('Voaova ny mpikambana');
      } else {
        await createMember(memberData);
        toast.success('Voaray ny mpikambana');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Tsy afaka');
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!currentSection) return;
    if (!confirm('Hamafa ve?')) return;

    try {
      await deleteMember({ memberId, sectionId: currentSection });
      toast.success('Voafafa');
    } catch (error) {
      toast.error('Tsy afaka namafa');
    }
  };

  const normalizePhone = (phone: string) => {
    return phone.trim().replace(/\s+/g, '');
  };

  const hasPhone = (phone: string) => {
    return phone && normalizePhone(phone).length > 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lisitra (Liste des membres)</CardTitle>
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
                    {editingMember ? 'Hanova mpikambana' : 'Hanampy mpikambana'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Anarana sy Fanampiny *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefaonina</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adiresy</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex">Lahy/Vavy</Label>
                    <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
                      <SelectTrigger id="sex">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lahy">Lahy</SelectItem>
                        <SelectItem value="Vavy">Vavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Tsingerintaona nahaterahana</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                    {formData.dateOfBirth && (
                      <p className="text-sm text-muted-foreground">
                        Taona: {formatAge(formData.dateOfBirth)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="father">Ray</Label>
                    <Input
                      id="father"
                      value={formData.father}
                      onChange={(e) => setFormData({ ...formData, father: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother">Reny</Label>
                    <Input
                      id="mother"
                      value={formData.mother}
                      onChange={(e) => setFormData({ ...formData, mother: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="profession">Asa atao</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Hanakatona
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingMember ? 'Hanova' : 'Hanampy'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hitady anarana na telefaonina..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Manampy...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Tsy misy valiny' : 'Tsy misy mpikambana'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anarana</TableHead>
                    <TableHead>Taona</TableHead>
                    <TableHead>Telefaonina</TableHead>
                    <TableHead>Lahy/Vavy</TableHead>
                    <TableHead>Adiresy</TableHead>
                    <TableHead className="text-right">Asa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.fullName}</TableCell>
                      <TableCell>{formatAge(member.dateOfBirth)}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.sex}</TableCell>
                      <TableCell className="max-w-xs truncate">{member.address}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {hasPhone(member.phone) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                title="Appeler"
                              >
                                <a href={`tel:${normalizePhone(member.phone)}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                title="Message"
                              >
                                <a href={`sms:${normalizePhone(member.phone)}`}>
                                  <MessageSquare className="h-4 w-4" />
                                </a>
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(member)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
