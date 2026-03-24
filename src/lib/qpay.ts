const QPAY_ENV = process.env.QPAY_ENV || 'sandbox';
const BASE_URL = QPAY_ENV === 'production' 
  ? 'https://merchant.qpay.mn/v2' 
  : 'https://consumer.qpay.mn/v2'; // or correct sandbox URL depending on QPay documentation (e.g., test.qpay.mn)

import { QPayToken } from '@/models/QPayToken';

/**
 * Get QPay Authentication Token
 */
export async function getQPayToken(): Promise<string> {
    // Check if token is cached in the DB and not expired
    const doc = await QPayToken.findOne();
    if (doc && doc.expiresAt && Date.now() < doc.expiresAt) {
        return doc.token;
    }

    const username = process.env.QPAY_USERNAME;
    const password = process.env.QPAY_PASSWORD;

    if (!username || !password) {
        throw new Error('QPAY_USERNAME and QPAY_PASSWORD are required');
    }

    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await fetch(`${BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
            client_id: username, 
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get QPay token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Save token and expiry (refreshing 60 seconds before it officially expires for safety)
    const token = data.access_token;
    const expiresAt = Date.now() + (data.expires_in - 60) * 1000;

    // Upsert into our single DB document
    await QPayToken.findOneAndUpdate(
        {}, 
        { token, expiresAt }, 
        { upsert: true, new: true }
    );

    return token as string;
}

interface InvoiceResponse {
    invoice_id: string;
    qr_text: string;
    qr_image: string;
    urls: {
        name: string;
        description: string;
        logo: string;
        link: string;
    }[];
}

/**
 * Create a new QPay Invoice
 */
export async function createQPayInvoice(
    invoiceNo: string,
    amount: number,
    description: string
): Promise<InvoiceResponse> {
    const token = await getQPayToken();
    const invoiceCode = process.env.QPAY_INVOICE_CODE;

    if (!invoiceCode) {
        throw new Error('QPAY_INVOICE_CODE is required');
    }

    const payload = {
        invoice_code: invoiceCode,
        sender_invoice_no: invoiceNo,
        invoice_receiver_code: process.env.QPAY_RECEIVER_CODE || 'terminal',
        invoice_description: description,
        amount: String(amount),
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/webhook`,
    };

    const response = await fetch(`${BASE_URL}/invoice`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create QPay invoice: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Check Payment Status (Optional, for extra security or manual verification)
 */
export async function checkQPayPayment(paymentId: string) {
    const token = await getQPayToken();
    // Use actual path depending on QPay Check API
    const response = await fetch(`${BASE_URL}/payment/check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
           object_type: 'INVOICE',
           object_id: paymentId,
           offset: {
              page_number: 1,
              page_limit: 100
           }
        }),
    });

    if (!response.ok) return null;
    return response.json();
}
