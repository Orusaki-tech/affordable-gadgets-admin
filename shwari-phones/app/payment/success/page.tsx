'use client';

import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { brandConfig } from '@/lib/config/brand';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const paymentReference = searchParams.get('payment_reference');

  const downloadReceipt = () => {
    if (!orderId) return;
    
    // Get API base URL from brand config
    const apiBaseUrl = brandConfig.apiBaseUrl || 'http://localhost:8000';
    const receiptUrl = `${apiBaseUrl}/api/inventory/orders/${orderId}/receipt/?format=pdf`;
    
    // Open in new tab to download
    window.open(receiptUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment has been confirmed. Your order is being processed and you will receive a confirmation shortly.
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-2">
                Order ID: <span className="font-mono font-semibold">{orderId}</span>
              </p>
            )}
            {paymentReference && (
              <p className="text-sm text-gray-500 mb-4">
                Payment Reference: <span className="font-mono font-semibold">{paymentReference}</span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            {orderId && (
              <button
                onClick={downloadReceipt}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Receipt
              </button>
            )}
            <Link
              href="/products"
              className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Continue Shopping
            </Link>
            {orderId && (
              <Link
                href={`/orders/${orderId}`}
                className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
              >
                View Order
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}








