'use client';

import { useEffect, useState } from 'react';
import { MoreHorizontal, PlusCircle, Trash2, View } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { isTomorrow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getInvoices, type Invoice } from '@/ai/flows/get-invoices-flow';
import { deleteInvoice } from '@/ai/flows/delete-invoice-flow';
import { updateInvoiceStatus } from '@/ai/flows/update-invoice-status-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { getInvoiceHtml } from '@/components/invoice-pdf';
import { CreateInvoiceForm } from './create-invoice-form';

type InvoiceStatus = 'all' | 'unpaid' | 'paid' | 'overdue';
const invoiceStatuses: Omit<InvoiceStatus, 'all'>[] = ['paid', 'unpaid', 'overdue'];

type ProfileData = {
  name?: string;
  email?: string;
  storeName?: string;
};

async function generateInvoicePdf(invoice: Invoice, profile: ProfileData) {
  const invoiceHtml = getInvoiceHtml(invoice, profile);

  const doc = new jsPDF({
    format: 'a4',
    unit: 'px',
  });

  doc.html(invoiceHtml, {
    margin: [10, 10, 10, 10],
    autoPaging: 'text',
    width: 445,
    windowWidth: 445,
    callback: function (doc) {
      doc.save(`Invoice-${invoice.id}.pdf`);
    }
  });
}


export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InvoiceStatus>('all');
  const [profile, setProfile] = useState<ProfileData>({});
  const [isCreateInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [isViewInvoiceOpen, setViewInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const invoiceData = await getInvoices();
        setInvoices(invoiceData);
        
        // Check for invoices due tomorrow and notify
        const tomorrowInvoices = invoiceData.filter(inv => isTomorrow(new Date(inv.dueDate)));
        if (tomorrowInvoices.length > 0) {
          toast({
            title: "Upcoming Due Dates",
            description: `You have ${tomorrowInvoices.length} invoice(s) due tomorrow.`,
          });
        }
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleNewInvoice = (newInvoice: Invoice) => {
    setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
  };
  
  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewInvoiceOpen(true);
  };

  const handleDownload = async (invoice: Invoice) => {
    toast({
      description: 'Generating PDF...',
    });
    
    try {
      await generateInvoicePdf(invoice, profile);
       toast({
        description: 'PDF downloaded successfully!',
      });
    } catch (error) {
       console.error('PDF generation failed:', error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate PDF. Please try again.',
      });
    }
  };
  
  const handleDelete = async (invoiceId: string) => {
    const { id, dismiss } = toast({
      description: 'Deleting invoice...',
    });

    try {
      const result = await deleteInvoice(invoiceId);
      if (result.success) {
        setInvoices(prevInvoices => prevInvoices.filter(inv => inv.id !== invoiceId));
        dismiss();
        toast({
          description: 'Invoice deleted successfully!',
        });
      } else {
         dismiss();
         toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Could not delete invoice.',
        });
      }
    } catch (error) {
      console.error('Deletion failed:', error);
      dismiss();
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete invoice. Please try again.',
      });
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    const { dismiss } = toast({
      description: 'Updating status...',
    });

    try {
      const result = await updateInvoiceStatus({ invoiceId, newStatus });
      if (result.success) {
        setInvoices(prevInvoices => 
          prevInvoices.map(inv => 
            inv.id === invoiceId ? { ...inv, status: newStatus } : inv
          )
        );
         if(selectedInvoice?.id === invoiceId) {
            setSelectedInvoice(prev => prev ? { ...prev, status: newStatus } : null);
        }
        dismiss();
        toast({
          description: 'Status updated successfully!',
        });
      } else {
        dismiss();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Could not update status.',
        });
      }
    } catch (error) {
      console.error('Status update failed:', error);
      dismiss();
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while updating the status.',
      });
    }
  };


  const filteredInvoices = invoices.filter((invoice) => {
    if (activeTab === 'all') return true;
    return invoice.status.toLowerCase() === activeTab;
  });

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'unpaid':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center p-2">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Invoices"
          description="Create and manage your customer invoices."
          actions={
            <Dialog open={isCreateInvoiceOpen} onOpenChange={setCreateInvoiceOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to create a new invoice for your customer.
                  </DialogDescription>
                </DialogHeader>
                <CreateInvoiceForm onSuccess={handleNewInvoice} setOpen={setCreateInvoiceOpen} />
              </DialogContent>
            </Dialog>
          }
        />
        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>
              A list of all invoices issued to your customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as InvoiceStatus)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab}>
                {loading ? (
                  renderSkeleton()
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.customerName}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{invoice.amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onSelect={() => handleViewDetails(invoice)}>
                                    <View className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                                    Download PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/40">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the invoice
                                      for {invoice.customerName} and remove the data from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(invoice.id)} className="bg-destructive hover:bg-destructive/90">
                                      Yes, delete invoice
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isViewInvoiceOpen} onOpenChange={setViewInvoiceOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>Invoice #{selectedInvoice.id}</DialogTitle>
                <DialogDescription>
                  Details for invoice issued to {selectedInvoice.customerName}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Billed To</p>
                        <p className="font-semibold">{selectedInvoice.customerName}</p>
                        <p className="text-sm text-muted-foreground">{selectedInvoice.customerAddress}</p>
                    </div>
                     <div className="text-right space-y-2">
                        <Badge variant={getStatusVariant(selectedInvoice.status)} className="text-sm">{selectedInvoice.status}</Badge>
                         <Select 
                          value={selectedInvoice.status.toLowerCase()} 
                          onValueChange={(newStatus) => handleStatusChange(selectedInvoice.id, newStatus.charAt(0).toUpperCase() + newStatus.slice(1))}
                        >
                          <SelectTrigger className="w-[120px] ml-auto">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            {invoiceStatuses.map(status => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                        <p>{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                        <p>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                     <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold">₹{selectedInvoice.amount.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div>
                  <h3 className="text-md font-semibold mb-2">Items</h3>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-center">Qty</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {selectedInvoice.items.map((item, index) => (
                              <TableRow key={index}>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell className="text-center">{item.quantity}</TableCell>
                                  <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                                  <TableCell className="text-right">₹{item.total.toFixed(2)}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-4">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax (18%)</span>
                            <span>₹{selectedInvoice.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total</span>
                            <span>₹{selectedInvoice.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
