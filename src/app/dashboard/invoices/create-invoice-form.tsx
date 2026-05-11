'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { createInvoice } from '@/ai/flows/create-invoice-flow';
import { toast } from '@/hooks/use-toast';
import type { Invoice } from '@/ai/flows/get-invoices-flow';

const invoiceItemSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  price: z.coerce.number().min(0, 'Price cannot be negative.'),
});

const formSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required.'),
  customerAddress: z.string().min(5, 'Customer address is required.'),
  issueDate: z.date({ required_error: 'Issue date is required.' }),
  dueDate: z.date({ required_error: 'Due date is required.' }),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required.'),
});

type FormValues = z.infer<typeof formSchema>;

type CreateInvoiceFormProps = {
  onSuccess: (newInvoice: Invoice) => void;
  setOpen: (open: boolean) => void;
};

export function CreateInvoiceForm({ onSuccess, setOpen }: CreateInvoiceFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerAddress: '',
      issueDate: new Date(),
      items: [{ name: '', quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchItems = form.watch('items');

  const calculateTotals = () => {
    const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  useEffect(() => {
    // This is to re-render and show updated totals when items change.
  }, [watchItems]);

  async function onSubmit(values: FormValues) {
    const itemsWithTotals = values.items.map(item => ({
        ...item,
        total: item.quantity * item.price,
    }));

    try {
        const newInvoice = await createInvoice({
            ...values,
            issueDate: values.issueDate.toISOString(),
            dueDate: values.dueDate?.toISOString() ?? new Date().toISOString(),
            items: itemsWithTotals,
        });

      toast({
        title: 'Invoice Created',
        description: `Invoice ${newInvoice.id} has been successfully created.`,
      });
      onSuccess(newInvoice);
      setOpen(false);
      form.reset();

    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not create invoice. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Priya Sharma" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="customerAddress"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Customer Address</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., 45, Royal Gardens, Delhi" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Issue Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <div className="space-y-4">
            <FormLabel>Invoice Items</FormLabel>
            {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-end">
                <FormField
                    control={form.control}
                    name={`items.${index}.name`}
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                        <FormControl>
                            <Input placeholder="Item name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                        <FormItem className="w-24">
                         <FormControl>
                            <Input type="number" placeholder="Qty" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`items.${index}.price`}
                    render={({ field }) => (
                        <FormItem className="w-32">
                         <FormControl>
                            <Input type="number" step="0.01" placeholder="Price" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', quantity: 1, price: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
            </Button>
        </div>

        <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span>Tax (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
            </div>
             <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
            </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Invoice'}
        </Button>
      </form>
    </Form>
  );
}
