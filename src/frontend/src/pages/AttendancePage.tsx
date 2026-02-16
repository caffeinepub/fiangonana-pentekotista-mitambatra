import { useState } from 'react';
import { useSection } from '../contexts/SectionContext';
import { useListAttendanceRecords, useCreateAttendanceRecord, useUpdateAttendanceRecord, useDeleteAttendanceRecord, useListMembers } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AttendanceRecord, MemberAttendance } from '../backend';
import { Checkbox } from '@/components/ui/checkbox';
import { detectConsecutiveAbsences } from '../utils/attendanceConsecutiveAbsence';

export default function AttendancePage() {
  const { currentSection } = useSection();
  const { data: records = [], isLoading } = useListAttendanceRecords(currentSection);
  const { data: members = [] } = useListMembers(currentSection);
  const { mutateAsync: createRecord } = useCreateAttendanceRecord();
  const { mutateAsync: updateRecord } = useUpdateAttendanceRecord();
  const { mutateAsync: deleteRecord } = useDeleteAttendanceRecord();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [date, setDate] = useState('');
  const [attendance, setAttendance] = useState<MemberAttendance[]>([]);

  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));

  const resetForm = () => {
    setDate('');
    setAttendance([]);
    setEditingRecord(null);
  };

  const handleOpenDialog = (record?: AttendanceRecord) => {
    if (record) {
      setEditingRecord(record);
      setDate(record.date);
      setAttendance(record.records);
    } else {
      resetForm();
      setAttendance(members.map(m => ({
        memberId: m.id,
        status: 'Present',
        absenceReason: undefined,
      })));
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentSection) return;
    if (!date) {
      toast.error('Ampidiro ny daty');
      return;
    }

    try {
      const totalPresent = attendance.filter(a => a.status === 'Present').length;
      const totalAbsent = attendance.filter(a => a.status === 'Absent').length;

      const recordData: AttendanceRecord = {
        id: editingRecord?.id || `attendance-${Date.now()}`,
        sectionId: currentSection,
        date,
        records: attendance,
        totalPresent: BigInt(totalPresent),
        totalAbsent: BigInt(totalAbsent),
        createdAt: editingRecord?.createdAt || BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      };

      if (editingRecord) {
        await updateRecord(recordData);
        toast.success('Voaova');
      } else {
        await createRecord(recordData);
        toast.success('Voaray');
      }

      // Check for consecutive absences after save
      // Merge the just-saved record into the records list for evaluation
      const updatedRecords = editingRecord
        ? records.map(r => r.id === recordData.id ? recordData : r)
        : [...records, recordData];

      const membersWithConsecutiveAbsences = detectConsecutiveAbsences(updatedRecords, members);

      // Show notification for each member with 3 consecutive absences
      if (membersWithConsecutiveAbsences.length > 0) {
        membersWithConsecutiveAbsences.forEach(member => {
          toast.warning(
            `Deraina Jesosy, mila mamangy an'i ${member.fullName} ianareo Komity. Mifalia ao amin'ny Tompo.`,
            {
              duration: 8000,
            }
          );
        });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Tsy afaka');
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!currentSection) return;
    if (!confirm('Hamafa ve?')) return;

    try {
      await deleteRecord({ recordId, sectionId: currentSection });
      toast.success('Voafafa');
    } catch (error) {
      toast.error('Tsy afaka namafa');
    }
  };

  const toggleAttendance = (memberId: string) => {
    setAttendance(prev => prev.map(a => 
      a.memberId === memberId 
        ? { ...a, status: a.status === 'Present' ? 'Absent' : 'Present', absenceReason: a.status === 'Present' ? '' : undefined }
        : a
    ));
  };

  const updateAbsenceReason = (memberId: string, reason: string) => {
    setAttendance(prev => prev.map(a => 
      a.memberId === memberId ? { ...a, absenceReason: reason } : a
    ));
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.fullName || memberId;
  };

  // Calculate yearly stats
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const yearlyStats = calculateYearlyStats(records, members, selectedYear);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fahatongavana (Présences)</CardTitle>
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
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord ? 'Hanova fahatongavana' : 'Hanampy fahatongavana'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Daty *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Mpikambana</Label>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Anarana</TableHead>
                            <TableHead className="text-center">Tonga</TableHead>
                            <TableHead>Antony (raha tsy tonga)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendance.map((att) => (
                            <TableRow key={att.memberId}>
                              <TableCell className="font-medium">
                                {getMemberName(att.memberId)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={att.status === 'Present'}
                                  onCheckedChange={() => toggleAttendance(att.memberId)}
                                />
                              </TableCell>
                              <TableCell>
                                {att.status === 'Absent' && (
                                  <Input
                                    placeholder="Antony..."
                                    value={att.absenceReason || ''}
                                    onChange={(e) => updateAbsenceReason(att.memberId, e.target.value)}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-accent/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Tonga</p>
                      <p className="text-2xl font-bold text-green-600">
                        {attendance.filter(a => a.status === 'Present').length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tsy tonga</p>
                      <p className="text-2xl font-bold text-red-600">
                        {attendance.filter(a => a.status === 'Absent').length}
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Hanakatona
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingRecord ? 'Hanova' : 'Hanampy'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Manampy...</div>
          ) : sortedRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Tsy misy fahatongavana</div>
          ) : (
            <div className="space-y-4">
              {sortedRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-lg">{record.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(record)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tonga</p>
                        <p className="text-2xl font-bold text-green-600">{Number(record.totalPresent)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tsy tonga</p>
                        <p className="text-2xl font-bold text-red-600">{Number(record.totalAbsent)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Yearly Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Statistika (Top 5 présents)</CardTitle>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-32"
            />
          </div>
        </CardHeader>
        <CardContent>
          {yearlyStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Tsy misy statistika</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Laharana</TableHead>
                  <TableHead>Anarana</TableHead>
                  <TableHead className="text-right">Tonga</TableHead>
                  <TableHead className="text-right">Tsy tonga</TableHead>
                  <TableHead className="text-right">Tahan'ny fahatongavana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyStats.slice(0, 5).map((stat, index) => (
                  <TableRow key={stat.memberId}>
                    <TableCell className="font-bold">{index + 1}</TableCell>
                    <TableCell className="font-medium">{stat.memberName}</TableCell>
                    <TableCell className="text-right text-green-600">{stat.present}</TableCell>
                    <TableCell className="text-right text-red-600">{stat.absent}</TableCell>
                    <TableCell className="text-right font-semibold">{stat.rate.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function calculateYearlyStats(records: AttendanceRecord[], members: any[], year: number) {
  const yearRecords = records.filter(r => new Date(r.date).getFullYear() === year);
  
  const stats = members.map(member => {
    let present = 0;
    let absent = 0;

    yearRecords.forEach(record => {
      const memberRecord = record.records.find(r => r.memberId === member.id);
      if (memberRecord) {
        if (memberRecord.status === 'Present') present++;
        else absent++;
      }
    });

    const total = present + absent;
    const rate = total > 0 ? (present / total) * 100 : 0;

    return {
      memberId: member.id,
      memberName: member.fullName,
      present,
      absent,
      rate,
    };
  });

  return stats.filter(s => s.present + s.absent > 0).sort((a, b) => b.rate - a.rate);
}
