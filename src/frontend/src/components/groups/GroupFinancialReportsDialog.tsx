import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useListGroupFinancialReports, useCreateGroupFinancialReport, useUpdateGroupFinancialReport, useDeleteGroupFinancialReport } from '../../hooks/useQueries';
import type { GroupFinancialReport } from '../../backend';

interface GroupFinancialReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
  sectionId: string;
}

export default function GroupFinancialReportsDialog({
  open,
  onOpenChange,
  groupId,
  groupName,
  sectionId,
}: GroupFinancialReportsDialogProps) {
  const { data: reports = [], isLoading } = useListGroupFinancialReports(groupId);
  const { mutateAsync: createReport } = useCreateGroupFinancialReport();
  const { mutateAsync: updateReport } = useUpdateGroupFinancialReport();
  const { mutateAsync: deleteReport } = useDeleteGroupFinancialReport();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<GroupFinancialReport | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    deposit: '',
    expense: '',
  });

  const sortedReports = [...reports].sort((a, b) => b.date.localeCompare(a.date));

  const resetForm = () => {
    setFormData({
      date: '',
      deposit: '',
      expense: '',
    });
    setEditingReport(null);
  };

  const handleOpenEditDialog = (report?: GroupFinancialReport) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        date: report.date,
        deposit: report.deposit.toString(),
        expense: report.expense.toString(),
      });
    } else {
      resetForm();
    }
    setEditDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.date) {
      toast.error('Ampidiro ny daty');
      return;
    }

    try {
      const reportData: GroupFinancialReport = {
        id: editingReport?.id || `group-report-${Date.now()}`,
        groupId,
        sectionId,
        date: formData.date,
        deposit: BigInt(formData.deposit || '0'),
        expense: BigInt(formData.expense || '0'),
        createdAt: editingReport?.createdAt || BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
      };

      if (editingReport) {
        await updateReport(reportData);
        toast.success('Voaova');
      } else {
        await createReport(reportData);
        toast.success('Voaray');
      }

      setEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Tsy afaka');
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Hamafa ve?')) return;

    try {
      await deleteReport({ reportId, groupId, sectionId });
      toast.success('Voafafa');
    } catch (error) {
      toast.error('Tsy afaka namafa');
    }
  };

  const formatCurrency = (amount: bigint) => {
    return Number(amount).toLocaleString('fr-FR') + ' Ar';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ara-bola - {groupName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => handleOpenEditDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Hanampy
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Manampy...</div>
            ) : sortedReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Tsy misy ara-bola</div>
            ) : (
              <div className="space-y-3">
                {sortedReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {new Date(report.date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Fampidirana</p>
                              <p className="font-medium text-green-600">{formatCurrency(report.deposit)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Fandaniana</p>
                              <p className="font-medium text-red-600">{formatCurrency(report.expense)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(report)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(report.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReport ? 'Hanova ara-bola' : 'Hanampy ara-bola'}
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
              <Label htmlFor="deposit">Fampidirana (Ar)</Label>
              <Input
                id="deposit"
                type="number"
                min="0"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense">Fandaniana (Ar)</Label>
              <Input
                id="expense"
                type="number"
                min="0"
                value={formData.expense}
                onChange={(e) => setFormData({ ...formData, expense: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hanakatona
            </Button>
            <Button onClick={handleSubmit}>
              {editingReport ? 'Hanova' : 'Hanampy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
