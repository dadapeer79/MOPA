
'use client';

import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';

import { getInvoices, type Invoice } from '@/ai/flows/get-invoices-flow';
import { getExpenses, type Expense } from '@/ai/flows/get-expenses-flow';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Download, IndianRupee, TrendingDown, TrendingUp, Percent, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TextToSpeech } from '@/components/text-to-speech';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DailyTransactionSummary } from '@/types/business';

type ProfileData = {
  name?: string;
  email?: string;
  storeName?: string;
};

type FilterType = 'all' | 'day' | 'month' | 'year';

// Function to organize transactions by date
const getDailyTransactionSummaries = (invoices: Invoice[], expenses: Expense[]): DailyTransactionSummary[] => {
  const dailyMap = new Map<string, DailyTransactionSummary>();

  // Process invoices
  invoices.forEach((inv) => {
    const date = new Date(inv.dueDate).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        totalIncome: 0,
        totalExpense: 0,
        incomeCount: 0,
        expenseCount: 0,
        transactions: [],
        categoryBreakdown: {},
      });
    }
    const summary = dailyMap.get(date)!;
    summary.totalIncome += inv.amount;
    summary.incomeCount += 1;
    summary.transactions.push({
      id: inv.id,
      date,
      type: 'income',
      description: `Invoice from ${inv.customerName}`,
      category: 'Sales',
      amount: inv.amount,
      source: inv.customerName,
      status: inv.status as 'completed' | 'pending' | 'failed',
    });
    summary.categoryBreakdown['Sales'] = (summary.categoryBreakdown['Sales'] || 0) + inv.amount;
  });

  // Process expenses
  expenses.forEach((exp) => {
    const date = new Date(exp.date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        totalIncome: 0,
        totalExpense: 0,
        incomeCount: 0,
        expenseCount: 0,
        transactions: [],
        categoryBreakdown: {},
      });
    }
    const summary = dailyMap.get(date)!;
    summary.totalExpense += exp.amount;
    summary.expenseCount += 1;
    summary.transactions.push({
      id: exp.id,
      date,
      type: 'expense',
      description: exp.description,
      category: exp.category,
      amount: exp.amount,
      status: 'completed',
    });
    summary.categoryBreakdown[exp.category] = (summary.categoryBreakdown[exp.category] || 0) + exp.amount;
  });

  return Array.from(dailyMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Function to filter transactions based on criteria
const filterTransactions = (
  summaries: DailyTransactionSummary[],
  filterType: FilterType,
  selectedDate: string,
  selectedMonth: string,
  selectedYear: string,
  selectedCategory: string
): DailyTransactionSummary[] => {
  return summaries.filter((summary) => {
    const [year, month, day] = summary.date.split('-');
    
    // Date filter
    if (filterType === 'day' && selectedDate && summary.date !== selectedDate) {
      return false;
    }
    if (filterType === 'month' && selectedMonth && `${year}-${month}` !== selectedMonth) {
      return false;
    }
    if (filterType === 'year' && selectedYear && year !== selectedYear) {
      return false;
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const hasCategory = summary.transactions.some(txn => txn.category === selectedCategory);
      if (!hasCategory) return false;
    }

    return true;
  }).map(summary => {
    // Filter transactions by category if needed
    if (selectedCategory && selectedCategory !== 'all') {
      return {
        ...summary,
        transactions: summary.transactions.filter(txn => txn.category === selectedCategory),
        categoryBreakdown: selectedCategory !== 'all' 
          ? { [selectedCategory]: summary.categoryBreakdown[selectedCategory] || 0 }
          : summary.categoryBreakdown
      };
    }
    return summary;
  });
};

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({});
  
  // Filter states
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invoiceData, expenseData] = await Promise.all([getInvoices(), getExpenses()]);
        setInvoices(invoiceData);
        setExpenses(expenseData);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load report data.',
        });
      } finally {
        setLoading(false);
      }
    };
    
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    fetchData();
  }, []);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);
  
  const getReportText = () => `Here's your financial report summary:
        
    Revenue Overview:
    Total Revenue is ${totalRevenue.toLocaleString('en-IN')} rupees from ${invoices.length} invoices.
    Average transaction value is ${(totalRevenue / invoices.length).toLocaleString('en-IN')} rupees.
    
    Expense Overview:
    Total Expenses are ${totalExpenses.toLocaleString('en-IN')} rupees from ${expenses.length} expenses.
    
    Tax and Profit:
    Total GST collected is ${totalTax.toLocaleString('en-IN')} rupees.
    Net Profit is ${netProfit.toLocaleString('en-IN')} rupees.
    
    Key Observations:
    ${netProfit >= 0 ? 'Your business is profitable' : 'Your business currently shows a loss'}.
    ${invoices.length > expenses.length ? 
      'You have more income transactions than expenses, which is good for cash flow.' : 
      'You might want to focus on increasing revenue streams.'}
    
    Main expense categories are: ${
      Object.entries(expenses.reduce((acc: any, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {}))
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 3)
      .map(([category, amount]: any) => 
        `${category} at ${amount.toLocaleString('en-IN')} rupees`
      )
      .join(', ')
    }.`;

  const generatePdfReport = async (isFiltered: boolean = false) => {
    try {
      toast({ description: 'Generating comprehensive PDF report...' });
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      
      const allSummaries = getDailyTransactionSummaries(invoices, expenses);
      const dailySummaries = isFiltered 
        ? filterTransactions(allSummaries, filterType, selectedDate, selectedMonth, selectedYear, selectedCategory)
        : allSummaries;

      // Calculate filtered totals
      const filteredTotalIncome = dailySummaries.reduce((sum, day) => sum + day.totalIncome, 0);
      const filteredTotalExpense = dailySummaries.reduce((sum, day) => sum + day.totalExpense, 0);
      const filteredNetProfit = filteredTotalIncome - filteredTotalExpense;

      doc.setFontSize(22);
      const reportTitle = isFiltered 
        ? `${profile.storeName || 'Your Store'} - Filtered Financial Report` 
        : `${profile.storeName || 'Your Store'} - Comprehensive Financial Report`;
      doc.text(reportTitle, 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
      
      if (isFiltered) {
        doc.text(`Filter: ${filterType.toUpperCase()} | Category: ${selectedCategory}`, 14, 35);
      }
      
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text('Executive Summary', 14, isFiltered ? 50 : 45);
      
      const formatAmount = (amount: number) => {
        return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      };

      const summaryStartY = isFiltered ? 55 : 50;

      autoTable(doc, {
          startY: summaryStartY,
          head: [['Metric', 'Amount']],
          body: isFiltered
            ? [
                ['Total Income', `Rs. ${formatAmount(filteredTotalIncome)}`],
                ['Total Expense', `Rs. ${formatAmount(filteredTotalExpense)}`],
                ['Net Profit', `Rs. ${formatAmount(filteredNetProfit)}`]
              ]
            : [
                ['Total Revenue', `Rs. ${formatAmount(totalRevenue)}`],
                ['Total Expenses', `Rs. ${formatAmount(totalExpenses)}`],
                ['Total Tax (GST)', `Rs. ${formatAmount(totalTax)}`],
                ['Net Profit', `Rs. ${formatAmount(netProfit)}`]
              ],
          theme: 'grid',
      });

      // Day by Day Transactions
      doc.addPage();
      doc.setFontSize(18);
      doc.text('Daily Transaction Summary', 14, 20);
      
      const dailyTableBody = dailySummaries.map(day => [
        day.date,
        `Rs. ${formatAmount(day.totalIncome)} (${day.incomeCount})`,
        `Rs. ${formatAmount(day.totalExpense)} (${day.expenseCount})`,
        `Rs. ${formatAmount(day.totalIncome - day.totalExpense)}`
      ]);

      autoTable(doc, {
        startY: 25,
      head: [['Date', 'Income (Count)', 'Expense (Count)', 'Net Change']],
      body: dailyTableBody,
      theme: 'grid'
    });

    // Daily Detailed Transactions
    dailySummaries.forEach((dailySummary, index) => {
      if (index > 0) {
        doc.addPage();
      } else if (index === 0) {
        doc.addPage();
      }
      
      doc.setFontSize(16);
      doc.text(`Transactions for ${dailySummary.date}`, 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Total Income: Rs. ${formatAmount(dailySummary.totalIncome)} | Total Expense: Rs. ${formatAmount(dailySummary.totalExpense)} | Net: Rs. ${formatAmount(dailySummary.totalIncome - dailySummary.totalExpense)}`, 14, 28);
      doc.setTextColor(0);

      const transactionBody = dailySummary.transactions.map(txn => [
        txn.type === 'income' ? '📥 Income' : '📤 Expense',
        txn.description,
        txn.category,
        txn.status,
        `Rs. ${formatAmount(txn.amount)}`
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Type', 'Description', 'Category', 'Status', 'Amount']],
        body: transactionBody,
        theme: 'grid'
      });

      // Category Breakdown for this day
      const categoryBreakdownBody = Object.entries(dailySummary.categoryBreakdown).map(([category, amount]: [string, any]) => [
        category,
        `Rs. ${formatAmount(amount)}`
      ]);

      doc.setFontSize(12);
      const lastY = (doc as any).lastAutoTable?.finalY || 100;
      doc.text('Category Breakdown:', 14, lastY + 10);

      autoTable(doc, {
        startY: lastY + 15,
        head: [['Category', 'Amount']],
        body: categoryBreakdownBody,
        theme: 'grid'
      });
    });

    doc.addPage();
    doc.setFontSize(18);
    doc.text('Revenue (Invoices)', 14, 20);
    autoTable(doc, {
      startY: 25,
      head: [['ID', 'Customer', 'Due Date', 'Status', 'Amount']],
      body: invoices.map(inv => [
        inv.id,
        inv.customerName,
        new Date(inv.dueDate).toLocaleDateString(),
        inv.status,
        `Rs. ${formatAmount(inv.amount)}`
      ]),
      theme: 'grid'
    });

    doc.addPage();
    doc.setFontSize(18);
    doc.text('Expenses', 14, 20);
    autoTable(doc, {
      startY: 25,
      head: [['ID', 'Description', 'Category', 'Date', 'Amount']],
      body: expenses.map(exp => [
        exp.id,
        exp.description,
        exp.category,
        new Date(exp.date).toLocaleDateString(),
        `Rs. ${formatAmount(exp.amount)}`
      ]),
      theme: 'grid'
    });
    
    doc.save(`${isFiltered ? 'Filtered_' : ''}Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ description: `${isFiltered ? 'Filtered ' : ''}Report downloaded successfully!` });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ 
        variant: 'destructive',
        title: 'Error', 
        description: 'Failed to generate PDF report. Please try again.' 
      });
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Financial Reports"
        description="A comprehensive overview of your business's financial health."
        actions={
          <div className="flex gap-2">
            <TextToSpeech
              text={getReportText()}
              language="en"
            />
            <Button onClick={() => generatePdfReport(false)} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        }
      />
      {loading ? (
        renderSkeleton()
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</div>
                    <p className="text-xs text-muted-foreground">{invoices.length} invoices</p>
                </CardContent>
            </Card>
             <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString('en-IN')}</div>
                    <p className="text-xs text-muted-foreground">{expenses.length} expenses</p>
                </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tax (GST)</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalTax.toLocaleString('en-IN')}</div>
                    <p className="text-xs text-muted-foreground">From all invoices</p>
                </CardContent>
            </Card>
             <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {netProfit < 0 && '-'}₹{Math.abs(netProfit).toLocaleString('en-IN')}
                    </div>
                    <p className="text-xs text-muted-foreground">Revenue minus Expenses</p>
                </CardContent>
            </Card>
          </div>

          {/* Filter Section */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction Filters</CardTitle>
                  <CardDescription>Filter transactions by date, period, and category</CardDescription>
                </div>
                {(filterType !== 'all' || selectedCategory !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterType('all');
                      setSelectedDate('');
                      setSelectedMonth('');
                      setSelectedYear('');
                      setSelectedCategory('all');
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* Filter Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter By</label>
                  <Select value={filterType} onValueChange={(v) => {
                    setFilterType(v as FilterType);
                    setSelectedDate('');
                    setSelectedMonth('');
                    setSelectedYear('');
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="day">Specific Day</SelectItem>
                      <SelectItem value="month">Specific Month</SelectItem>
                      <SelectItem value="year">Specific Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                {filterType === 'day' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    />
                  </div>
                )}

                {/* Month Filter */}
                {filterType === 'month' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Month</label>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    />
                  </div>
                )}

                {/* Year Filter */}
                {filterType === 'year' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            getDailyTransactionSummaries(invoices, expenses).map(d => d.date.split('-')[0])
                          )
                        ).map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.from(
                        new Set(
                          getDailyTransactionSummaries(invoices, expenses)
                            .flatMap(d => d.transactions.map(t => t.category))
                        )
                      ).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Download Filtered Report Button */}
                <div className="space-y-2 flex flex-col justify-end">
                  <Button 
                    onClick={() => generatePdfReport(true)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Filtered
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Transaction Summary - Only Shows After Filter Applied */}
          {filterType !== 'all' || selectedCategory !== 'all' ? (
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle>Daily Transaction Details</CardTitle>
                <CardDescription>Filtered transaction breakdown by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterTransactions(
                    getDailyTransactionSummaries(invoices, expenses),
                    filterType,
                    selectedDate,
                    selectedMonth,
                    selectedYear,
                    selectedCategory
                  ).length > 0 ? (
                    filterTransactions(
                      getDailyTransactionSummaries(invoices, expenses),
                      filterType,
                      selectedDate,
                      selectedMonth,
                      selectedYear,
                      selectedCategory
                    ).map((daily) => (
                    <div key={daily.date} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{new Date(daily.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</h3>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-green-600 font-semibold">
                              <ArrowUp className="h-4 w-4" />
                              ₹{daily.totalIncome.toLocaleString('en-IN')}
                            </div>
                            <p className="text-xs text-muted-foreground">{daily.incomeCount} income</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-red-600 font-semibold">
                              <ArrowDown className="h-4 w-4" />
                              ₹{daily.totalExpense.toLocaleString('en-IN')}
                            </div>
                            <p className="text-xs text-muted-foreground">{daily.expenseCount} expense</p>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${daily.totalIncome - daily.totalExpense >= 0 ? 'text-primary' : 'text-destructive'}`}>
                              ₹{(daily.totalIncome - daily.totalExpense).toLocaleString('en-IN')}
                            </div>
                            <p className="text-xs text-muted-foreground">Net</p>
                          </div>
                        </div>
                      </div>

                      {/* Transactions for this day */}
                      <div className="space-y-2 mb-3">
                        {daily.transactions.map((txn) => (
                          <div key={txn.id} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                            <div className="flex items-center gap-3 flex-1">
                              {txn.type === 'income' ? (
                                <ArrowUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-red-600" />
                              )}
                              <div>
                                <p className="font-medium">{txn.description}</p>
                                <p className="text-xs text-muted-foreground">{txn.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                              </p>
                              <Badge variant="outline" className="text-xs">{txn.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Category Breakdown */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Category Breakdown:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(daily.categoryBreakdown).map(([category, amount]) => (
                            <div key={category} className="bg-accent/20 p-2 rounded text-xs">
                              <p className="font-medium">{category}</p>
                              <p className="text-muted-foreground">₹{(amount as number).toLocaleString('en-IN')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                  ) : (
                    <div className="text-center py-8">
                      <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h3 className="font-semibold text-muted-foreground mb-1">No transactions found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your filters to view transactions.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-border/60">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="font-semibold text-lg text-muted-foreground mb-2">Apply Filters to View Transactions</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Use the transaction filters above to search by date, month, year, or category. Once you apply filters, the detailed transaction breakdown will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle>Revenue Details</CardTitle>
              <CardDescription>Breakdown of all invoices contributing to revenue.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-xs">{invoice.id}</TableCell>
                      <TableCell className="font-medium">{invoice.customerName}</TableCell>
                      <TableCell>{invoice.status}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">₹{invoice.amount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
           <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>Breakdown of all recorded expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">₹{expense.amount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
