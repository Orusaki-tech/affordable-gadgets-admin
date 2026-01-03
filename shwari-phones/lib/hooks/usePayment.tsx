/**
 * React hook for payment operations
 */
import { useState, useEffect, useCallback } from 'react';
import { paymentApi, InitiatePaymentRequest, PaymentStatusResponse } from '@/lib/api/payment';

interface UsePaymentOptions {
  orderId: string | null;
  onPaymentComplete?: () => void;
  onPaymentFailed?: (error: string) => void;
  pollInterval?: number; // milliseconds
  maxPollAttempts?: number;
}

export function usePayment({
  orderId,
  onPaymentComplete,
  onPaymentFailed,
  pollInterval = 3000, // 3 seconds
  maxPollAttempts = 100, // 5 minutes total
}: UsePaymentOptions) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);

  /**
   * Initiate payment
   */
  const initiatePayment = useCallback(async (data: InitiatePaymentRequest) => {
    if (!orderId) {
      setError('Order ID is required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentApi.initiatePayment(orderId, data);
      
      if (response.success && response.redirect_url) {
        // Start polling for payment status
        setIsPolling(true);
        setPollAttempts(0);
        return response;
      } else {
        setError(response.error || 'Failed to initiate payment');
        onPaymentFailed?.(response.error || 'Failed to initiate payment');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to initiate payment';
      setError(errorMessage);
      onPaymentFailed?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [orderId, onPaymentFailed]);

  /**
   * Check payment status
   */
  const checkPaymentStatus = useCallback(async () => {
    console.log('\n[PESAPAL] ========== HOOK: CHECK PAYMENT STATUS START ==========');
    console.log('[PESAPAL] Order ID:', orderId);
    
    if (!orderId) {
      console.log('[PESAPAL] ERROR: Order ID is required');
      return;
    }

    try {
      console.log('[PESAPAL] Calling paymentApi.getPaymentStatus...');
      const status = await paymentApi.getPaymentStatus(orderId);
      console.log('[PESAPAL] Payment Status received:', JSON.stringify(status, null, 2));
      setPaymentStatus(status);

      // Check if payment is complete
      if (status.status === 'COMPLETED') {
        console.log('[PESAPAL] Payment is COMPLETED - stopping polling');
        setIsPolling(false);
        onPaymentComplete?.();
        console.log('[PESAPAL] ========== HOOK: CHECK PAYMENT STATUS - COMPLETED ==========\n');
        return true;
      }

      // Check if payment failed
      if (status.status === 'FAILED' || status.status === 'CANCELLED' || status.status === 'EXPIRED') {
        console.log('[PESAPAL] Payment is', status.status, '- stopping polling');
        setIsPolling(false);
        onPaymentFailed?.(status.message || 'Payment failed');
        console.log('[PESAPAL] ========== HOOK: CHECK PAYMENT STATUS - FAILED ==========\n');
        return false;
      }

      console.log('[PESAPAL] Payment status:', status.status, '- continuing to poll');
      console.log('[PESAPAL] ========== HOOK: CHECK PAYMENT STATUS - PENDING ==========\n');
      return false;
    } catch (err: any) {
      console.log('[PESAPAL] ========== HOOK: CHECK PAYMENT STATUS EXCEPTION ==========');
      console.log('[PESAPAL] Error checking payment status:', err);
      console.log('[PESAPAL] ===========================================================\n');
      return false;
    }
  }, [orderId, onPaymentComplete, onPaymentFailed]);

  /**
   * Poll payment status
   */
  useEffect(() => {
    if (!isPolling || !orderId) {
      if (!isPolling) {
        console.log('[PESAPAL] Polling is disabled - not starting poll interval');
      }
      if (!orderId) {
        console.log('[PESAPAL] Order ID is missing - not starting poll interval');
      }
      return;
    }

    console.log('\n[PESAPAL] ========== HOOK: STARTING PAYMENT STATUS POLLING ==========');
    console.log('[PESAPAL] Poll Interval:', pollInterval, 'ms');
    console.log('[PESAPAL] Max Poll Attempts:', maxPollAttempts);
    console.log('[PESAPAL] ============================================================\n');

    const interval = setInterval(async () => {
      setPollAttempts(prev => {
        const newAttempts = prev + 1;
        console.log(`[PESAPAL] Poll attempt ${newAttempts}/${maxPollAttempts}`);
        
        if (newAttempts >= maxPollAttempts) {
          console.log('[PESAPAL] Max poll attempts reached - stopping polling');
          setIsPolling(false);
          onPaymentFailed?.('Payment status check timeout');
          return newAttempts;
        }

        checkPaymentStatus();
        return newAttempts;
      });
    }, pollInterval);

    // Initial check
    console.log('[PESAPAL] Performing initial payment status check...');
    checkPaymentStatus();

    return () => {
      console.log('[PESAPAL] Cleaning up poll interval');
      clearInterval(interval);
    };
  }, [isPolling, orderId, pollInterval, maxPollAttempts, checkPaymentStatus, onPaymentFailed]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    setPollAttempts(0);
  }, []);

  return {
    paymentStatus,
    isLoading,
    error,
    isPolling,
    pollAttempts,
    initiatePayment,
    checkPaymentStatus,
    stopPolling,
  };
}








