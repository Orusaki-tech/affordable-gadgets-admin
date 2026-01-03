'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePayment } from '@/lib/hooks/usePayment';
import { formatPrice } from '@/lib/utils/format';
import Link from 'next/link';

interface PaymentPageProps {
  orderId: string;
  totalAmount: number;
  callbackUrl?: string;
}

export function PaymentPage({ orderId, totalAmount, callbackUrl }: PaymentPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  const {
    paymentStatus,
    isLoading,
    error,
    isPolling,
    initiatePayment,
    checkPaymentStatus,
  } = usePayment({
    orderId,
    onPaymentComplete: () => {
      // Redirect to success page
      const successUrl = callbackUrl || `/payment/success?order_id=${orderId}`;
      router.push(successUrl);
    },
    onPaymentFailed: (errorMsg) => {
      console.error('Payment failed:', errorMsg);
      // Show error but don't redirect automatically
    },
  });

  // Initialize payment on mount
  useEffect(() => {
    const initPayment = async () => {
      console.log('\n[PESAPAL] ========== COMPONENT: INITIALIZE PAYMENT START ==========');
      console.log('[PESAPAL] Order ID:', orderId);
      
      // Get callback URL from search params or use default
      const callback = searchParams.get('callback_url') || callbackUrl || `${window.location.origin}/payment/callback`;
      const cancellationUrl = searchParams.get('cancellation_url') || `${window.location.origin}/payment/cancelled`;

      console.log('[PESAPAL] Callback URL:', callback);
      console.log('[PESAPAL] Cancellation URL:', cancellationUrl);

      const result = await initiatePayment({
        callback_url: callback,
        cancellation_url: cancellationUrl,
      });

      console.log('[PESAPAL] Initiate payment result:', JSON.stringify(result, null, 2));

      if (result?.redirect_url) {
        console.log('[PESAPAL] Setting redirect URL:', result.redirect_url);
        setRedirectUrl(result.redirect_url);
      } else {
        console.log('[PESAPAL] No redirect URL in result');
      }
      
      console.log('[PESAPAL] ========== COMPONENT: INITIALIZE PAYMENT END ==========\n');
    };

    if (orderId && !redirectUrl && !paymentStatus) {
      console.log('[PESAPAL] Conditions met - initializing payment');
      initPayment();
    } else {
      console.log('[PESAPAL] Skipping payment initialization:', {
        hasOrderId: !!orderId,
        hasRedirectUrl: !!redirectUrl,
        hasPaymentStatus: !!paymentStatus,
      });
    }
  }, [orderId, callbackUrl, searchParams, redirectUrl, paymentStatus, initiatePayment]);

  // Auto-redirect to Pesapal when redirect URL is available
  useEffect(() => {
    if (redirectUrl && !hasRedirected) {
      setHasRedirected(true);
      // Small delay to show loading state
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    }
  }, [redirectUrl, hasRedirected]);

  // Check payment status if returning from Pesapal
  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId');
    console.log('[PESAPAL] Checking for OrderTrackingId in URL params:', orderTrackingId);
    
    if (orderTrackingId && orderId) {
      console.log('[PESAPAL] OrderTrackingId found - checking payment status');
      console.log('[PESAPAL] Order ID:', orderId);
      console.log('[PESAPAL] Order Tracking ID:', orderTrackingId);
      checkPaymentStatus();
    } else {
      console.log('[PESAPAL] No OrderTrackingId found or missing orderId - skipping status check');
    }
  }, [searchParams, orderId, checkPaymentStatus]);

  // Payment status display
  if (paymentStatus) {
    if (paymentStatus.status === 'COMPLETED') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
                Your payment has been confirmed. Your order is being processed.
              </p>
              {paymentStatus.payment_reference && (
                <p className="text-sm text-gray-500 mb-4">
                  Reference: <span className="font-mono font-semibold">{paymentStatus.payment_reference}</span>
                </p>
              )}
            </div>
            <Link
              href="/products"
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      );
    }

    if (paymentStatus.status === 'FAILED' || paymentStatus.status === 'CANCELLED') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
            <div className="mb-6">
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
              <p className="text-gray-600 mb-4">
                {paymentStatus.message || 'Your payment could not be processed. Please try again.'}
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Try Again
              </button>
              <Link
                href="/cart"
                className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // Loading/Redirecting state
  if (isLoading || redirectUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="mb-6">
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
            <h2 className="text-2xl font-bold mb-2">Redirecting to Payment</h2>
            <p className="text-gray-600 mb-4">
              {redirectUrl ? 'Please wait while we redirect you to Pesapal...' : 'Initializing payment...'}
            </p>
            <div className="text-sm text-gray-500">
              <p>Order: {orderId}</p>
              <p>Amount: {formatPrice(totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="mb-6">
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
            <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Try Again
            </button>
            <Link
              href="/cart"
              className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}








