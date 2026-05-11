
import type { Invoice } from '@/ai/flows/get-invoices-flow';

type ProfileData = {
    name?: string;
    email?: string;
    storeName?: string;
};

// This function generates an HTML string directly.
// It uses inline styles because Tailwind CSS classes won't be available in the PDF generation context.
export const getInvoiceHtml = (invoice: Invoice, profile: ProfileData): string => {
    const tableHeaderStyle = `background-color: #f2f2f2; padding: 8px; text-align: left; border-bottom: 2px solid #000; font-size: 13px; font-weight: bold; color: #000;`;
    const tableCellStyle = `padding: 8px; border-bottom: 1px solid #000; color: #000; font-size: 12px;`;
    const amountCellStyle = `${tableCellStyle} text-align: right; font-size: 13px; font-weight: bold; font-family: 'Courier New', monospace; color: #000;`;

    const formatAmount = (amount: number) => {
        return `Rs. ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    const itemsHtml = invoice.items.map(item => `
        <tr>
            <td style="${tableCellStyle}">${item.name}</td>
            <td style="${amountCellStyle}">${item.quantity}</td>
            <td style="${amountCellStyle}">${formatAmount(item.price)}</td>
            <td style="${amountCellStyle}">${formatAmount(item.total)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: sans-serif; font-size: 12px; padding: 15px; width: 100%;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
                <div>
                    <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #000;">${profile.storeName ?? 'Your Store'}</h1>
                    <p style="margin: 3px 0 0; color: #000; font-size: 12px;">123 Store Street, Retail City, 400001</p>
                    <p style="margin: 3px 0 0; color: #000; font-size: 12px;">${profile.email ?? 'contact@yourstore.com'}</p>
                    <p style="margin: 3px 0 0; color: #000; font-size: 12px;">GSTIN: 27ABCDE1234F1Z5</p>
                </div>
                <div style="text-align: right;">
                    <h2 style="font-size: 24px; font-weight: bold; margin: 0; color: #000;">INVOICE</h2>
                    <p style="margin: 3px 0 0; color: #000; font-size: 14px; font-weight: bold;">#${invoice.id}</p>
                </div>
            </div>

            <!-- Bill To & Dates -->
            <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-bottom: 10px;">
                <div>
                    <h3 style="margin: 0 0 3px; color: #000; font-size: 14px; font-weight: bold;">BILL TO</h3>
                    <p style="font-weight: bold; margin: 0; color: #000; font-size: 13px;">${invoice.customerName}</p>
                    <p style="margin: 3px 0 0; color: #000; font-size: 12px;">${invoice.customerAddress}</p>
                </div>
                <div style="text-align: right;">
                    <div style="margin-bottom: 5px;">
                        <strong style="color: #000; font-size: 13px;">Issue Date: </strong>
                        <span style="color: #000; font-size: 13px;">${new Date(invoice.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <strong style="color: #000; font-size: 13px;">Due Date: </strong>
                        <span style="color: #000; font-size: 13px;">${new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr>
                        <th style="${tableHeaderStyle}">Item</th>
                        <th style="${tableHeaderStyle} text-align: right;">Qty</th>
                        <th style="${tableHeaderStyle} text-align: right;">Price</th>
                        <th style="${tableHeaderStyle} text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <!-- Totals Section -->
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                <div style="width: 250px; background-color: #ffffff; padding: 10px; border: 2px solid #000;">
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="color: #000; font-size: 13px; font-weight: bold;">Subtotal:</span>
                        <span style="font-family: 'Courier New', monospace; font-size: 13px; font-weight: bold; color: #000;">${formatAmount(invoice.subtotal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                        <span style="color: #000; font-size: 13px; font-weight: bold;">GST (18%):</span>
                        <span style="font-family: 'Courier New', monospace; font-size: 13px; font-weight: bold; color: #000;">${formatAmount(invoice.tax)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #000; margin-top: 4px;">
                        <span style="color: #000; font-size: 14px; font-weight: bold;">Total:</span>
                        <span style="font-family: 'Courier New', monospace; font-size: 14px; font-weight: bold; color: #000;">${formatAmount(invoice.amount)}</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 15px; padding-top: 5px; border-top: 1px solid #000; text-align: center; color: #000;">
                <p style="font-size: 12px; margin: 0;">Thank you for your business!</p>
            </div>
        </div>
    `;
};
