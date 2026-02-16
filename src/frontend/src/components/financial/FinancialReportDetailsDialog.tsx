import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { FinancialReport } from '../../backend';
import { TransactionType } from '../../backend';

interface FinancialReportDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: FinancialReport | null;
  getMemberNames: (memberIds: string[]) => string;
}

export default function FinancialReportDetailsDialog({
  open,
  onOpenChange,
  report,
  getMemberNames,
}: FinancialReportDetailsDialogProps) {
  if (!report) return null;

  const formatCurrency = (amount: bigint) => {
    return Number(amount).toLocaleString('fr-FR') + ' Ar';
  };

  // Group linked entries by type
  const linkedDeposits = report.groupFinancialEntries?.filter(
    entry => entry.transactionType === TransactionType.deposit && entry.amount > BigInt(0)
  ) || [];
  
  const linkedExpenses = report.groupFinancialEntries?.filter(
    entry => entry.transactionType === TransactionType.expense && entry.amount > BigInt(0)
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Ara-bola - {new Date(report.date).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Fampidirana</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fanatitra</span>
                    <span className="font-medium">{formatCurrency(report.offerings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Varotra</span>
                    <span className="font-medium">{formatCurrency(report.sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fanangonana vola</span>
                    <span className="font-medium">{formatCurrency(report.fundraising)}</span>
                  </div>
                </div>
              </div>

              {report.vows.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Voady</h3>
                    <div className="space-y-2 text-sm">
                      {report.vows.map((vow, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {getMemberNames(vow.memberIds)}
                          </span>
                          <span className="font-medium">{formatCurrency(vow.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {report.otherIncome.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Fampidirana hafa</h3>
                    <div className="space-y-2 text-sm">
                      {report.otherIncome.map((income, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">{income.reason}</span>
                          <span className="font-medium">{formatCurrency(income.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {linkedDeposits.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Fampidirana avy amin'ny vondrona</h3>
                    <div className="space-y-2 text-sm">
                      {linkedDeposits.map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {entry.originatingGroupName}
                            </Badge>
                          </div>
                          <span className="font-medium text-green-600">{formatCurrency(entry.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />
              <div className="flex justify-between font-semibold text-green-600">
                <span>Total fampidirana</span>
                <span>{formatCurrency(report.totalIncome)}</span>
              </div>
            </CardContent>
          </Card>

          {(report.expenses.length > 0 || linkedExpenses.length > 0) && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                {report.expenses.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Fandaniana</h3>
                    <div className="space-y-3">
                      {report.expenses.map((expense, idx) => (
                        <div key={idx} className="border-l-2 border-muted pl-3 py-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{expense.description}</p>
                            </div>
                            <span className="font-medium text-red-600 ml-4">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {linkedExpenses.length > 0 && (
                  <>
                    {report.expenses.length > 0 && <Separator />}
                    <div>
                      <h3 className="font-semibold mb-3">Fandaniana avy amin'ny vondrona</h3>
                      <div className="space-y-3">
                        {linkedExpenses.map((entry, idx) => (
                          <div key={idx} className="border-l-2 border-muted pl-3 py-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Badge variant="outline" className="text-xs">
                                  {entry.originatingGroupName}
                                </Badge>
                              </div>
                              <span className="font-medium text-red-600 ml-4">
                                {formatCurrency(entry.amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                <div className="flex justify-between font-semibold text-red-600">
                  <span>Total fandaniana</span>
                  <span>{formatCurrency(report.totalExpenses)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vola teo am-piandohana</span>
                  <span className="font-medium">{formatCurrency(report.startingBalance)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>+ Fampidirana</span>
                  <span className="font-medium">{formatCurrency(report.totalIncome)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- Fandaniana</span>
                  <span className="font-medium">{formatCurrency(report.totalExpenses)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Vola sisa</span>
                  <span>{formatCurrency(report.endingBalance)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
