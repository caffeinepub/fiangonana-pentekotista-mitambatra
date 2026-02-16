import { useState } from 'react';
import { useSection } from '../contexts/SectionContext';
import { useListFinancialReports, useCreateFinancialReport, useUpdateFinancialReport, useDeleteFinancialReport, useListMembers } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Pencil, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { FinancialReport, VowEntry, OtherIncomeEntry, ExpenseEntry } from '../backend';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import FinancialReportDetailsDialog from '../components/financial/FinancialReportDetailsDialog';

export default function FinancialReportsPage() {
  const { currentSection } = useSection();
  const { data: reports = [], isLoading } = useListFinancialReports(currentSection);
  const { data: members = [] } = useListMembers(currentSection);
  const { mutateAsync: createReport } = useCreateFinancialReport();
  const { mutateAsync: updateReport } = useUpdateFinancialReport();
  const { mutateAsync: deleteReport } = useDeleteFinancialReport();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<FinancialReport | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    offerings: '',
    sales: '',
    fundraising: '',
    vows: [] as VowEntry[],
    otherIncome: [] as OtherIncomeEntry[],
    expenses: [] as ExpenseEntry[],
  });

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);

  const sortedReports = [...reports].sort((a, b) => b.date.localeCompare(a.date));

  const calculateTotals = () => {
    const offerings = BigInt(formData.offerings || '0');
    const sales = BigInt(formData.sales || '0');
    const fundraising = BigInt(formData.fundraising || '0');
    const vowsTotal = formData.vows.reduce((sum, v) => sum + v.amount, BigInt(0));
    const otherTotal = formData.otherIncome.reduce((sum, o) => sum + o.amount, BigInt(0));
    const totalIncome = offerings + sales + fundraising + vowsTotal + otherTotal;
    
    const totalExpenses = formData.expenses.reduce((sum, e) => sum + e.amount, BigInt(0));
    
    return { totalIncome, totalExpenses };
  };

  const resetForm = () => {
    setFormData({
      date: '',
      offerings: '',
      sales: '',
      fundraising: '',
      vows: [],
      otherIncome: [],
      expenses: [],
    });
    setEditingReport(null);
  };

  const handleOpenDialog = (report?: FinancialReport) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        date: report.date,
        offerings: report.offerings.toString(),
        sales: report.sales.toString(),
        fundraising: report.fundraising.toString(),
        vows: report.vows,
        otherIncome: report.otherIncome,
        expenses: report.expenses,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleOpenDetailsDialog = (report: FinancialReport) => {
    setSelectedReport(report);
    setDetailsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentSection) return;
    if (!formData.date) {
      toast.error('Ampidiro ny daty');
      return;
    }

    // Validate expenses have descriptions
    const invalidExpenses = formData.expenses.filter(e => !e.description.trim());
    if (invalidExpenses.length > 0) {
      toast.error('Ampidiro ny antony fandaniana');
      return;
    }

    try {
      const { totalIncome, totalExpenses } = calculateTotals();
      
      // Calculate starting balance from previous report
      const previousReports = sortedReports.filter(r => 
        r.date < formData.date && 
        new Date(r.date).getFullYear() === new Date(formData.date).getFullYear()
      );
      const startingBalance = previousReports.length > 0 
        ? previousReports[0].endingBalance 
        : BigInt(0);

      const reportData: FinancialReport = {
        id: editingReport?.id || `report-${Date.now()}`,
        sectionId: currentSection,
        date: formData.date,
        offerings: BigInt(formData.offerings || '0'),
        sales: BigInt(formData.sales || '0'),
        fundraising: BigInt(formData.fundraising || '0'),
        vows: formData.vows,
        otherIncome: formData.otherIncome,
        expenses: formData.expenses,
        startingBalance,
        totalIncome,
        totalExpenses,
        endingBalance: startingBalance + totalIncome - totalExpenses,
        createdAt: editingReport?.createdAt || BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
        groupFinancialEntries: editingReport?.groupFinancialEntries || [],
      };

      if (editingReport) {
        await updateReport(reportData);
        toast.success('Voaova');
      } else {
        await createReport(reportData);
        toast.success('Voaray');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Tsy afaka');
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!currentSection) return;
    if (!confirm('Hamafa ve?')) return;

    try {
      await deleteReport({ reportId, sectionId: currentSection });
      toast.success('Voafafa');
    } catch (error) {
      toast.error('Tsy afaka namafa');
    }
  };

  const formatCurrency = (amount: bigint) => {
    return Number(amount).toLocaleString('fr-FR') + ' Ar';
  };

  const getMemberNames = (memberIds: string[]) => {
    return memberIds
      .map(id => members.find(m => m.id === id)?.fullName || 'Tsy fantatra')
      .join(', ');
  };

  // Vow management
  const [vowAmount, setVowAmount] = useState('');
  const [vowMemberIds, setVowMemberIds] = useState<string[]>([]);
  const [vowPopoverOpen, setVowPopoverOpen] = useState(false);

  const addVow = () => {
    if (!vowAmount || vowMemberIds.length === 0) {
      toast.error('Ampidiro ny vola sy ny mpikambana');
      return;
    }
    setFormData({
      ...formData,
      vows: [...formData.vows, { amount: BigInt(vowAmount), memberIds: vowMemberIds }],
    });
    setVowAmount('');
    setVowMemberIds([]);
  };

  const removeVow = (index: number) => {
    setFormData({
      ...formData,
      vows: formData.vows.filter((_, i) => i !== index),
    });
  };

  // Other income management
  const [otherIncomeAmount, setOtherIncomeAmount] = useState('');
  const [otherIncomeReason, setOtherIncomeReason] = useState('');

  const addOtherIncome = () => {
    if (!otherIncomeAmount || !otherIncomeReason.trim()) {
      toast.error('Ampidiro ny vola sy ny antony');
      return;
    }
    setFormData({
      ...formData,
      otherIncome: [...formData.otherIncome, { amount: BigInt(otherIncomeAmount), reason: otherIncomeReason }],
    });
    setOtherIncomeAmount('');
    setOtherIncomeReason('');
  };

  const removeOtherIncome = (index: number) => {
    setFormData({
      ...formData,
      otherIncome: formData.otherIncome.filter((_, i) => i !== index),
    });
  };

  // Expense management
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const addExpense = () => {
    if (!expenseAmount || !expenseDescription.trim()) {
      toast.error('Ampidiro ny vola sy ny antony');
      return;
    }
    setFormData({
      ...formData,
      expenses: [...formData.expenses, { amount: BigInt(expenseAmount), description: expenseDescription }],
    });
    setExpenseAmount('');
    setExpenseDescription('');
  };

  const removeExpense = (index: number) => {
    setFormData({
      ...formData,
      expenses: formData.expenses.filter((_, i) => i !== index),
    });
  };

  const { totalIncome, totalExpenses } = calculateTotals();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ara-bola (Rapport financier)</CardTitle>
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingReport ? 'Hanova ara-bola' : 'Hanampy ara-bola'}
                  </DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="income" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="income">Fampidirana</TabsTrigger>
                    <TabsTrigger value="expenses">Fandaniana</TabsTrigger>
                  </TabsList>
                  <TabsContent value="income" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Daty *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="offerings">Fanatitra</Label>
                        <Input
                          id="offerings"
                          type="number"
                          value={formData.offerings}
                          onChange={(e) => setFormData({ ...formData, offerings: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sales">Varotra</Label>
                        <Input
                          id="sales"
                          type="number"
                          value={formData.sales}
                          onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fundraising">Fanangonana vola</Label>
                        <Input
                          id="fundraising"
                          type="number"
                          value={formData.fundraising}
                          onChange={(e) => setFormData({ ...formData, fundraising: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Voady</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Vola"
                          value={vowAmount}
                          onChange={(e) => setVowAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Popover open={vowPopoverOpen} onOpenChange={setVowPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[200px] justify-start">
                              {vowMemberIds.length > 0 ? `${vowMemberIds.length} olona` : 'Hisafidy olona'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Hitady mpikambana..." />
                              <CommandList>
                                <CommandEmpty>Tsy misy valiny</CommandEmpty>
                                <CommandGroup>
                                  {members.map((member) => (
                                    <CommandItem
                                      key={member.id}
                                      onSelect={() => {
                                        setVowMemberIds(
                                          vowMemberIds.includes(member.id)
                                            ? vowMemberIds.filter(id => id !== member.id)
                                            : [...vowMemberIds, member.id]
                                        );
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          vowMemberIds.includes(member.id) ? 'opacity-100' : 'opacity-0'
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
                        <Button onClick={addVow}>Hanampy</Button>
                      </div>
                      {formData.vows.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {formData.vows.map((vow, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">
                                {getMemberNames(vow.memberIds)} - {formatCurrency(vow.amount)}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => removeVow(idx)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Fampidirana hafa</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Vola"
                          value={otherIncomeAmount}
                          onChange={(e) => setOtherIncomeAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Antony"
                          value={otherIncomeReason}
                          onChange={(e) => setOtherIncomeReason(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={addOtherIncome}>Hanampy</Button>
                      </div>
                      {formData.otherIncome.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {formData.otherIncome.map((income, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">
                                {income.reason} - {formatCurrency(income.amount)}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => removeOtherIncome(idx)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-semibold text-green-600">
                        <span>Total fampidirana</span>
                        <span>{formatCurrency(totalIncome)}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="expenses" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Fandaniana</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Vola"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Antony *"
                          value={expenseDescription}
                          onChange={(e) => setExpenseDescription(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={addExpense}>Hanampy</Button>
                      </div>
                      {formData.expenses.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {formData.expenses.map((expense, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">
                                {expense.description} - {formatCurrency(expense.amount)}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => removeExpense(idx)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-semibold text-red-600">
                        <span>Total fandaniana</span>
                        <span>{formatCurrency(totalExpenses)}</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Hanakatona
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingReport ? 'Hanova' : 'Hanampy'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Manampy...</div>
          ) : sortedReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Tsy misy ara-bola</div>
          ) : (
            <div className="space-y-4">
              {sortedReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {new Date(report.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </h3>
                          {report.groupFinancialEntries && report.groupFinancialEntries.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {report.groupFinancialEntries.length} vondrona
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Fampidirana</p>
                            <p className="font-medium text-green-600">{formatCurrency(report.totalIncome)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fandaniana</p>
                            <p className="font-medium text-red-600">{formatCurrency(report.totalExpenses)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Vola teo am-piandohana</p>
                            <p className="font-medium">{formatCurrency(report.startingBalance)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Vola sisa</p>
                            <p className="font-bold">{formatCurrency(report.endingBalance)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailsDialog(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(report)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FinancialReportDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        report={selectedReport}
        getMemberNames={getMemberNames}
      />
    </div>
  );
}
