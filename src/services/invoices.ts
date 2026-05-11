/**
 * @fileOverview A mock service for simulating invoice data.
 */
import { subDays, addDays } from 'date-fns';

const mockCustomers = [
  { name: 'Amit Patel', address: '123, Sunrise Apartments, Mumbai, 400001' },
  { name: 'Priya Sharma', address: '45, Royal Gardens, Delhi, 110001' },
  { name: 'Rohan Verma', address: '78, Lakeview Heights, Bangalore, 560001' },
  { name: 'Sunita Rao', address: '90, Ocean Drive, Chennai, 600028' },
  { name: 'Vikram Singh', address: '101, Hilltop Road, Pune, 411007' },
];

const mockProducts = [
    { name: 'Amul Gold Milk 1L', price: 68.00 },
    { name: 'Parle-G Biscuits 70g', price: 10.00 },
    { name: 'Tata Salt 1kg', price: 28.00 },
    { name: 'Fortune Sunlite Oil 1L', price: 145.00 },
    { name: 'Aashirvaad Atta 5kg', price: 250.00 },
    { name: 'Maggi 2-Minute Noodles', price: 14.00 },
    { name: 'Colgate MaxFresh Toothpaste', price: 99.00 },
    { name: 'Surf Excel Easy Wash 1kg', price: 199.00 },
];

const statuses = ['Paid', 'Unpaid', 'Overdue'];

/**
 * Generates a random integer between min and max (inclusive).
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateInvoice = (i: number, statusOverride?: string, data?: any) => {
    const customer = data?.customerName ? { name: data.customerName, address: data.customerAddress } : mockCustomers[getRandomInt(0, mockCustomers.length - 1)];
    const status = statusOverride ?? statuses[getRandomInt(0, statuses.length - 1)];
    const issueDate = data?.issueDate ? new Date(data.issueDate) : new Date();
    
    let dueDate;
    if(data?.dueDate) {
        dueDate = new Date(data.dueDate);
    } else if(status === 'Paid') {
        dueDate = subDays(issueDate, getRandomInt(5, 15));
    } else if (status === 'Overdue') {
        dueDate = subDays(new Date(), getRandomInt(1, 30));
    } else {
        dueDate = addDays(new Date(), getRandomInt(1, 30));
    }

    const items = data?.items ?? Array.from({ length: getRandomInt(1, 4) }, () => {
        const product = mockProducts[getRandomInt(0, mockProducts.length - 1)];
        const quantity = getRandomInt(1, 5);
        return {
            name: product.name,
            quantity,
            price: product.price,
            total: parseFloat((quantity * product.price).toFixed(2)),
        };
    });

    const subtotal = items.reduce((acc: number, item: { total: number; }) => acc + item.total, 0);
    const tax = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + tax;

    return {
      id: `INV-${1001 + i}`,
      customerName: customer.name,
      customerAddress: customer.address,
      amount: parseFloat(totalAmount.toFixed(2)),
      status,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
    };
}


let mockInvoices = Array.from({ length: 20 }, (_, i) => generateInvoice(i, undefined, { issueDate: subDays(new Date(), getRandomInt(1, 60)) }));

/**
 * Generates a list of mock invoices.
 * @returns A promise that resolves to an array of mock invoice objects.
 */
export async function getMockInvoices() {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  // Add new invoices on each call to simulate dynamic data
  const newInvoices = Array.from({ length: getRandomInt(1,2) }, (_, i) => generateInvoice(mockInvoices.length + i, 'Unpaid'));
  mockInvoices = [...newInvoices, ...mockInvoices];
  return mockInvoices;
}


/**
 * Adds a new mock invoice to the list.
 * @returns A promise that resolves to the newly created invoice.
 */
export async function addMockInvoice(invoiceData: any) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newInvoice = generateInvoice(mockInvoices.length, 'Unpaid', invoiceData);
  mockInvoices = [newInvoice, ...mockInvoices];
  return newInvoice;
}


/**
 * Deletes a mock invoice from the list.
 * @returns A promise that resolves to a success status.
 */
export async function deleteMockInvoice(invoiceId: string) {
  await new Promise(resolve => setTimeout(resolve, 500));
  const initialLength = mockInvoices.length;
  mockInvoices = mockInvoices.filter(invoice => invoice.id !== invoiceId);
  
  if (mockInvoices.length < initialLength) {
    return { success: true, message: 'Invoice deleted.' };
  } else {
    return { success: false, message: 'Invoice not found.' };
  }
}

/**
 * Updates the status of a mock invoice.
 * @returns A promise that resolves to a success status.
 */
export async function updateMockInvoiceStatus(invoiceId: string, newStatus: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const invoiceIndex = mockInvoices.findIndex(invoice => invoice.id === invoiceId);

    if(invoiceIndex > -1) {
        mockInvoices[invoiceIndex].status = newStatus;
        return { success: true, message: 'Invoice status updated.' };
    } else {
        return { success: false, message: 'Invoice not found.' };
    }
}
