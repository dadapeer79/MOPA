'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useSWR from 'swr';
import { isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, ShoppingBag, Landmark, RefreshCw, PlusCircle, ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react";

// Components
import { NavIcon3D } from '@/components/ui/nav-icon-3d';
import { AnimatedCard } from '@/components/ui/animated-card';
import { AnimatedChart } from '@/components/ui/animated-chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatedTransactionsTable } from "@/components/ui/animated-transactions-table";
import { GeometricBackground } from "@/components/3d/geometric-background";
import { FloatingDataViz } from "@/components/3d/data-visualization";
import { FloatingNumber } from "@/components/3d/floating-number";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { SalesChart } from '@/components/sales-chart';

// UI Components
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Services and Utilities
import { getRecentTransactions } from '@/ai/flows/get-recent-transactions-flow';
import { getExpenses } from '@/ai/flows/get-expenses-flow';
import { getInvoices } from '@/ai/flows/get-invoices-flow';
import { getSalesData } from '@/ai/flows/get-sales-data-flow';
import { createExpense } from '@/ai/flows/create-expense-flow';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import './styles.css';

// Types
import type { RecentTransaction } from '@/ai/flows/get-recent-transactions-flow';
import type { Expense } from '@/ai/flows/get-expenses-flow';
import type { Invoice } from '@/ai/flows/get-invoices-flow';
import type { SalesData } from '@/ai/flows/get-sales-data-flow';

type Kpi = {
  title: string;
  value: string;
  icon: React.ElementType;
};

type ManualTransaction = {
  id: string;
  description: string;
  amount: number;
  type: 'revenue' | 'expense';
  timestamp: string;
}

const manualTransactionSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  type: z.enum(['revenue', 'expense'], { required_error: 'You must select a transaction type.' }),
});

type ManualTransactionFormValues = z.infer<typeof manualTransactionSchema>;

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [manualTransactions, setManualTransactions] = useState<ManualTransaction[]>([]);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState<'today' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('today');
  const [kpis, setKpis] = useState<Kpi[]>([
    { title: "Today's Revenue", value: "₹0.00", icon: IndianRupee },
    { title: "Today's Expenses", value: "₹0.00", icon: IndianRupee },
    { title: "New Invoices", value: "0", icon: ShoppingBag },
    { title: "Cash Balance", value: "₹0.00", icon: Landmark },
  ]);

  const { data: fetchedTransactions, isLoading: transactionsLoading, mutate: mutateTransactions } = 
    useSWR('getRecentTransactions', getRecentTransactions, { revalidateOnFocus: false });
  const { data: expensesData, isLoading: expensesLoading, mutate: mutateExpenses } = 
    useSWR<Expense[]>('getExpenses', getExpenses, { revalidateOnFocus: false });
  const { data: invoicesData, isLoading: invoicesLoading, mutate: mutateInvoices } = 
    useSWR<Invoice[]>('getInvoices', getInvoices, { revalidateOnFocus: false });
  const { data: salesChartData, isLoading: chartLoading, mutate: mutateChart } = useSWR(
    ['getSalesData', chartTimeRange], 
    () => getSalesData(chartTimeRange),
    { revalidateOnFocus: false }
  );

  const form = useForm<ManualTransactionFormValues>({
    resolver: zodResolver(manualTransactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
    },
  });

  useEffect(() => {
    if (fetchedTransactions) {
      setTransactions(fetchedTransactions);
    }
  }, [fetchedTransactions]);

  useEffect(() => {
    const todaysAutoRevenue = (transactions || [])
      .filter(tx => isToday(new Date(tx.timestamp)))
      .reduce((acc, tx) => acc + tx.amount, 0);

    const todaysManualRevenue = manualTransactions
      .filter(tx => tx.type === 'revenue' && isToday(new Date(tx.timestamp)))
      .reduce((acc, tx) => acc + tx.amount, 0);
    
    const totalTodaysRevenue = todaysAutoRevenue + todaysManualRevenue;

    const todaysAutoExpenses = (expensesData || [])
      .filter(e => isToday(new Date(e.date)))
      .reduce((sum, exp) => sum + exp.amount, 0);
      
    const todaysManualExpenses = manualTransactions
      .filter(tx => tx.type === 'expense' && isToday(new Date(tx.timestamp)))
      .reduce((acc, tx) => acc + tx.amount, 0);

    const totalTodaysExpenses = todaysAutoExpenses + todaysManualExpenses;
    const unpaidInvoices = (invoicesData || []).filter(inv => inv.status.toLowerCase() === 'unpaid').length;
    const cashBalance = totalTodaysRevenue - totalTodaysExpenses;
    
    setKpis([
      { title: "Today's Revenue", value: `₹${totalTodaysRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: IndianRupee },
      { title: "Today's Expenses", value: `₹${totalTodaysExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: IndianRupee },
      { title: "New Invoices", value: `${unpaidInvoices}`, icon: ShoppingBag },
      { title: "Cash Balance", value: `₹${cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Landmark },
    ]);
  }, [transactions, expensesData, invoicesData, manualTransactions]);

  const handleRefresh = async () => {
    mutateTransactions();
    mutateExpenses();
    mutateInvoices();
    mutateChart();
  };

  const handleManualEntry = async (data: ManualTransactionFormValues) => {
    const newManualTransaction: ManualTransaction = {
      id: `manual-${Date.now()}-${Math.random()}`,
      description: data.description,
      amount: data.amount,
      type: data.type,
      timestamp: new Date().toISOString(),
    };
    
    setManualTransactions(prev => [newManualTransaction, ...prev]);

    if (newManualTransaction.type === 'expense') {
      await createExpense({
        description: data.description, 
        amount: data.amount, 
        category: 'other'
      });
      mutateExpenses();
    }

    toast({
      title: 'Transaction Added',
      description: `Successfully added ${data.type} of ₹${data.amount}.`,
    });
    form.reset();
    setIsManualEntryOpen(false);
  };

  const handleDeleteManualTransaction = (transactionId: string) => {
    const transactionToDelete = manualTransactions.find(tx => tx.id === transactionId);
    if (!transactionToDelete) return;

    setManualTransactions(current => current.filter(tx => tx.id !== transactionId));
    
    toast({
      title: "Transaction Deleted",
      description: `Manually added ${transactionToDelete.type} has been removed.`,
    });
  };

  const onTimeRangeChange = (value: string) => {
    setChartTimeRange(value as 'today' | 'daily' | 'weekly' | 'monthly' | 'yearly');
  };

  const displayedTransactions = [...transactions, ...manualTransactions
    .filter(mt => mt.type === 'revenue')
    .map(mt => ({
      id: mt.id,
      amount: mt.amount,
      sender: mt.description,
      timestamp: mt.timestamp
    }))]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  const pageLoading = transactionsLoading || expensesLoading || invoicesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-950">
      <GeometricBackground />
      <div className="relative z-10 px-4 py-8 space-y-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <PageHeader
            title="Welcome, Retailer!"
            description="Here's a summary of your business activities for today."
            actions={
              <div className="flex gap-2">
                <Button onClick={handleRefresh} disabled={pageLoading} className="glassmorphic hover:bg-white/10">
                  <RefreshCw className={`mr-2 h-4 w-4 ${pageLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            }
          />

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            {kpis.map((kpi, index) => (
              <AnimatedCard
                key={index}
                title={kpi.title}
                icon={<kpi.icon className="h-4 w-4" />}
                delay={index * 0.1}
                className="glow-card transform-gpu hover:shadow-xl transition-shadow"
              >
                <AnimatePresence mode="wait">
                  {pageLoading && manualTransactions.length === 0 ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Skeleton className="h-8 w-3/4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="value"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-2xl font-bold neon-text"
                    >
                      {kpi.value}
                    </motion.div>
                  )}
                </AnimatePresence>
              </AnimatedCard>
            ))}
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2 glow-card">
              <CardHeader>
                <CardTitle className="neon-text">Sales Overview</CardTitle>
                <CardDescription className="text-blue-200">
                  A visual summary of your sales performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2 relative min-h-[400px]">
                <FloatingDataViz data={salesChartData?.map(d => d.value) || []} />
                <div className="absolute inset-0 z-10">
                  <SalesChart 
                    chartData={salesChartData || []} 
                    onTimeRangeChange={onTimeRangeChange} 
                    loading={chartLoading}
                    initialTimeRange={chartTimeRange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="neon-text">Recent Sales</CardTitle>
                <CardDescription className="text-blue-200">
                  Your 5 most recent automated and manual sales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pageLoading && displayedTransactions.length === 0 ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-3 w-[80px]" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-[50px]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <AnimatedTransactionsTable 
                    transactions={displayedTransactions}
                    loading={pageLoading && displayedTransactions.length === 0}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="glow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="neon-text">Manual Transactions</CardTitle>
                <CardDescription className="text-blue-200">
                  Manually recorded revenue and expenses.
                </CardDescription>
              </div>
              <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="glassmorphic hover:bg-white/10">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Manual Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="glow-card">
                  <DialogHeader>
                    <DialogTitle className="neon-text">Add a Manual Transaction</DialogTitle>
                    <DialogDescription className="text-blue-200">
                      Record a cash transaction for revenue or an expense.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleManualEntry)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Description</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Cash sale, Office supplies" {...field} className="glassmorphic" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Amount (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0.00" {...field} className="glassmorphic" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-blue-100">Transaction Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="revenue" />
                                  </FormControl>
                                  <FormLabel className="font-normal text-blue-100">Revenue</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="expense" />
                                  </FormControl>
                                  <FormLabel className="font-normal text-blue-100">Expense</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={() => setIsManualEntryOpen(false)}
                          className="glassmorphic hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="glassmorphic hover:bg-white/20">
                          Add Transaction
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {manualTransactions.length === 0 ? (
                <p className="text-sm text-blue-200 text-center py-8">
                  No manual transactions recorded yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-blue-100">Type</TableHead>
                      <TableHead className="text-blue-100">Description</TableHead>
                      <TableHead className="text-blue-100">Date &amp; Time</TableHead>
                      <TableHead className="text-blue-100 text-right">Amount</TableHead>
                      <TableHead><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manualTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-white/5">
                        <TableCell>
                          {tx.type === 'revenue' ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-blue-100">
                          {tx.description}
                        </TableCell>
                        <TableCell className="text-blue-200 text-xs">
                          {new Date(tx.timestamp).toLocaleString('en-IN', { 
                            dateStyle: 'short', 
                            timeStyle: 'short' 
                          })}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-semibold",
                          tx.type === 'revenue' ? 'text-green-400' : 'text-red-400'
                        )}>
                          {tx.type === 'revenue' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glow-card">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="neon-text">
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-blue-200">
                                  This action cannot be undone. This will permanently delete the transaction
                                  for &quot;{tx.description}&quot;.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="glassmorphic hover:bg-white/10">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteManualTransaction(tx.id)}
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}