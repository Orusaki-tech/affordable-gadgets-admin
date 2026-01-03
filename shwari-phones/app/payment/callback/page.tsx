'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { paymentApi } from '@/lib/api/payment';
import Link from 'next/link';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState<string>('Processing payment...');
  const orderTrackingId = searchParams.get('OrderTrackingId');
  const orderMerchantReference = searchParams.get('OrderMerchantReference');

  useEffect(() => {
    console.log('\n[PESAPAL] ========== CALLBACK PAGE: PROCESSING CALLBACK ==========');
    console.log('[PESAPAL] Order Tracking ID:', orderTrackingId);
    console.log('[PESAPAL] Order Merchant Reference:', orderMerchantReference);
    console.log('[PESAPAL] All URL Params:', Object.fromEntries(searchParams.entries()));
    
    // Extract order ID from merchant reference or URL
    // The merchant reference should contain the order ID
    const orderId = orderMerchantReference || searchParams.get('order_id');
    
    console.log('[PESAPAL] Extracted Order ID:', orderId);
    
    if (!orderId) {
      console.log('[PESAPAL] ERROR: Order ID not found in callback');
      setStatus('failed');
      setMessage('Order ID not found in callback');
      return;
    }

    // Check payment status
    const checkStatus = async () => {
      try {
        console.log('[PESAPAL] Checking payment status for order:', orderId);
        const paymentStatus = await paymentApi.getPaymentStatus(orderId);
        console.log('[PESAPAL] Payment Status:', JSON.stringify(paymentStatus, null, 2));
        
        if (paymentStatus.status === 'COMPLETED') {
          console.log('[PESAPAL] Payment is COMPLETED - showing success');
          setStatus('success');
          setMessage('Payment completed successfully!');
          
          // Redirect to success page after 2 seconds
          console.log('[PESAPAL] Will redirect to success page in 2 seconds...');
          setTimeout(() => {
            console.log('[PESAPAL] Redirecting to success page...');
            router.push(`/payment/success?order_id=${orderId}`);
          }, 2000);
        } else if (paymentStatus.status === 'FAILED' || paymentStatus.status === 'CANCELLED') {
          console.log('[PESAPAL] Payment is', paymentStatus.status, '- showing failure');
          setStatus('failed');
          setMessage(paymentStatus.message || 'Payment failed');
        } else {
          // Still processing
          console.log('[PESAPAL] Payment status:', paymentStatus.status, '- will poll again in 3 seconds');
          setMessage('Payment is being processed...');
          // Poll again after 3 seconds
          setTimeout(checkStatus, 3000);
        }
      } catch (error: any) {
        console.log('[PESAPAL] ========== CALLBACK PAGE: ERROR CHECKING STATUS ==========');
        console.log('[PESAPAL] Error checking payment status:', error);
        console.log('[PESAPAL] ===========================================================\n');
        setStatus('failed');
        setMessage('Unable to verify payment status. Please check your order status.');
      }
    };

    checkStatus();
  }, [searchParams, orderMerchantReference, router, orderTrackingId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
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
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting...</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="space-y-2">
                <Link
                  href="/cart"
                  className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Back to Cart
                </Link>
                <Link
                  href="/products"
                  className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}








