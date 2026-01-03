'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { brandConfig } from '@/lib/config/brand';
import { orderApi } from '@/lib/api/order';
import { paymentApi } from '@/lib/api/payment';
import { PaymentMethodModal } from './PaymentMethodModal';

interface CheckoutModalProps {
  onClose: () => void;
  totalValue: number;
}

export function CheckoutModal({ onClose, totalValue }: CheckoutModalProps) {
  const { checkout, cart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [leadReference, setLeadReference] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'quote' | 'pay_now'>('pay_now'); // Default to pay now
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Check if cart is already submitted
  const isCartSubmitted = cart?.is_submitted || false;

  // Auto-fill form when phone number is entered
  useEffect(() => {
    const recognizeCustomer = async () => {
      if (formData.customer_phone && formData.customer_phone.length >= 10) {
        setIsRecognizing(true);
        try {
          const response = await apiClient.get('/cart/recognize/', {
            params: { phone: formData.customer_phone },
          });
          if (response.data.is_returning_customer && response.data.customer) {
            const customer = response.data.customer;
            setFormData((prev) => ({
              ...prev,
              customer_name: customer.name || prev.customer_name,
              customer_email: customer.email || prev.customer_email,
              delivery_address: customer.delivery_address || prev.delivery_address,
            }));
          }
        } catch (err) {
          // Silently fail - customer might be new
        } finally {
          setIsRecognizing(false);
        }
      }
    };

    const timeoutId = setTimeout(recognizeCustomer, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.customer_phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if cart is already submitted
    if (isCartSubmitted) {
      setError('This cart has already been submitted. Please start a new order.');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);

    try {
      if (paymentMode === 'pay_now') {
        try {
          // Create order and initiate payment
          if (!cart || !cart.items || cart.items.length === 0) {
            setError('Cart is empty');
            setIsSubmitting(false);
            return;
          }

          // Prepare order items from cart
          // Note: inventory_unit_id is write_only in the API, so we need to use inventory_unit.id
          const orderItems = cart.items.map(item => {
            const unitId = item.inventory_unit?.id || item.inventory_unit_id;
            if (!unitId) {
              throw new Error(`Missing inventory_unit_id for cart item ${item.id}`);
            }
            return {
              inventory_unit_id: unitId,
              quantity: item.quantity,
            };
          });

          // Create order
          const order = await orderApi.createOrder({
            order_items: orderItems,
            customer_name: formData.customer_name,
            customer_phone: formData.customer_phone,
            customer_email: formData.customer_email || undefined,
            delivery_address: formData.delivery_address || undefined,
            order_source: 'ONLINE', // Explicitly set for online orders
          });

          console.log('Order created:', order);

          // Store order ID and show payment method modal
          setCreatedOrderId(order.order_id);
          setIsSubmitting(false);
          // Close checkout modal and show payment method modal
          setShowPaymentMethodModal(true);
        } catch (orderError: any) {
          // Handle order creation errors
          console.error('Order creation error:', orderError);
          let errorMessage = 'Failed to create order. ';
          
          if (orderError?.message?.includes('Authentication') || orderError?.message?.includes('logged in')) {
            errorMessage += 'Please log in to complete payment, or use "Request Quote" to proceed without login.';
          } else {
            errorMessage += orderError?.message || 'Please try again or use "Request Quote" instead.';
          }
          
          setError(errorMessage);
          setIsSubmitting(false);
        }
      } else {
        // Create lead (original flow)
        console.log('Submitting checkout with data:', {
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || undefined,
          delivery_address: formData.delivery_address || undefined,
        });

        const response = await checkout({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || undefined,
          delivery_address: formData.delivery_address || undefined,
        });

        console.log('Checkout response:', response);

        // Show success message instead of redirecting
        // Ensure we have lead_reference from response
        if (response && response.lead_reference) {
          setLeadReference(response.lead_reference);
          setIsSuccess(true);
          setIsSubmitting(false);
        } else {
          // If no lead_reference, still show success but log warning
          console.warn('Checkout successful but no lead_reference in response:', response);
          setLeadReference(response?.lead?.lead_reference || null);
          setIsSuccess(true);
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      console.error('Error response:', err?.response?.data);
      
      // Extract detailed error message from response
      let errorMessage = 'Failed to checkout. Please try again.';
      
      if (err?.response?.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          // Validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const fieldName = field.replace(/_/g, ' ');
              return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
            });
          errorMessage = errorMessages.join('\n');
        } else if (errorData.error) {
          // Handle "Cart already submitted" error gracefully
          if (errorData.error === 'Cart already submitted' || errorData.error?.includes('already submitted')) {
            errorMessage = 'This cart has already been submitted. Your order is being processed.';
            // Show success state instead of error for already-submitted carts
            setIsSuccess(true);
            setIsSubmitting(false);
            return;
          }
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Handle payment method selection and proceed
  const handlePaymentProceed = async (paymentMethod: string, mobileNumber?: string) => {
    if (!createdOrderId) {
      setError('Order ID not found. Please try again.');
      return;
    }

    setIsProcessingPayment(true);
    setShowPaymentMethodModal(false);

    try {
      // Initiate payment
      const callbackUrl = `${window.location.origin}/payment/callback`;
      const cancellationUrl = `${window.location.origin}/payment/cancelled`;

      console.log('\n[PESAPAL] ========== CHECKOUT: INITIATE PAYMENT START ==========');
      console.log('[PESAPAL] Order ID:', createdOrderId);
      console.log('[PESAPAL] Payment Method:', paymentMethod);
      console.log('[PESAPAL] Mobile Number:', mobileNumber);
      console.log('[PESAPAL] Callback URL:', callbackUrl);
      console.log('[PESAPAL] Cancellation URL:', cancellationUrl);
      console.log('[PESAPAL] Customer Data:', {
        email: formData.customer_email,
        phone: mobileNumber || formData.customer_phone,
        name: formData.customer_name,
      });

      const paymentResult = await paymentApi.initiatePayment(createdOrderId, {
        callback_url: callbackUrl,
        cancellation_url: cancellationUrl,
        customer: {
          email: formData.customer_email,
          phone_number: mobileNumber || formData.customer_phone,
          first_name: formData.customer_name.split(' ')[0] || formData.customer_name,
          last_name: formData.customer_name.split(' ').slice(1).join(' ') || '',
        },
      });

      console.log('[PESAPAL] Payment initiation result:', JSON.stringify(paymentResult, null, 2));

      if (paymentResult.success && paymentResult.redirect_url) {
        console.log('[PESAPAL] Payment initiated successfully - redirecting to payment page');
        console.log('[PESAPAL] Redirect URL:', paymentResult.redirect_url);
        // Redirect to Pesapal payment page
        window.location.href = paymentResult.redirect_url;
        console.log('[PESAPAL] ========== CHECKOUT: INITIATE PAYMENT SUCCESS ==========\n');
      } else {
        // Order created but payment failed - show helpful message
        const errorMsg = paymentResult.error || 'Unknown error';
        console.log('[PESAPAL] ========== CHECKOUT: INITIATE PAYMENT FAILED ==========');
        console.log('[PESAPAL] Error:', errorMsg);
        console.log('[PESAPAL] =======================================================\n');
        setError(
          `Order created successfully (Order ID: ${createdOrderId}), but payment initiation failed. ` +
          `Error: ${errorMsg}. ` +
          `Please contact support or try again later.`
        );
        setIsProcessingPayment(false);
      }
    } catch (paymentError: any) {
      // Order created but payment failed - show helpful message
      const paymentErrorMessage = paymentError?.message || paymentError?.data?.error || 'Unknown error';
      console.log('[PESAPAL] ========== CHECKOUT: INITIATE PAYMENT EXCEPTION ==========');
      console.log('[PESAPAL] Exception:', paymentErrorMessage);
      console.log('[PESAPAL] Full Error:', paymentError);
      console.log('[PESAPAL] =========================================================\n');
      setError(
        `Order created successfully (Order ID: ${createdOrderId}), but payment initiation failed. ` +
        `Error: ${paymentErrorMessage}. ` +
        `Please contact support or try again later. You can also try to pay later using order ID: ${createdOrderId}`
      );
      setIsProcessingPayment(false);
    }
  };

  // Success view
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 text-center max-h-[90vh] overflow-y-auto">
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
            <h2 className="text-2xl font-bold mb-2 text-green-600">Thank You!</h2>
            <p className="text-lg text-gray-700 mb-2">
              {paymentMode === 'pay_now' 
                ? 'Your order has been created successfully.'
                : 'Your inquiry has been submitted successfully.'}
            </p>
            {paymentMode === 'quote' && (
              <p className="text-gray-600 mb-4">
                A salesperson will contact you shortly.
              </p>
            )}
            {leadReference && (
              <p className="text-sm text-gray-500 mb-4">
                Reference: <span className="font-mono font-semibold">{leadReference}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => {
              onClose();
              router.push('/products');
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Don't show checkout form if payment modal is showing
  if (showPaymentMethodModal) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50"></div>
        <PaymentMethodModal
          onClose={() => {
            setShowPaymentMethodModal(false);
            onClose();
          }}
          onProceed={handlePaymentProceed}
          totalAmount={totalValue}
          merchantName="AFFORDABLE GADGETS"
          isLoading={isProcessingPayment}
        />
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Checkout</h2>
        
        {/* Payment Mode Selection */}
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="pay_now"
                checked={paymentMode === 'pay_now'}
                onChange={(e) => setPaymentMode(e.target.value as 'pay_now' | 'quote')}
                className="mr-2"
              />
              <span className="font-semibold">Pay Now</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="quote"
                checked={paymentMode === 'quote'}
                onChange={(e) => setPaymentMode(e.target.value as 'pay_now' | 'quote')}
                className="mr-2"
              />
              <span className="font-semibold">Request Quote</span>
            </label>
          </div>
          <p className="text-sm text-gray-600">
            {paymentMode === 'pay_now' 
              ? 'Complete your payment securely with Pesapal (M-Pesa, Cards, etc.)'
              : 'A salesperson will contact you shortly with a quote'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone <span className="text-red-500">*</span>
              {isRecognizing && (
                <span className="ml-2 text-sm text-blue-600">Checking...</span>
              )}
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email (Optional)
            </label>
            <input
              id="email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Delivery Address (Optional)
            </label>
            <textarea
              id="address"
              value={formData.delivery_address}
              onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Total</span>
              <span>{formatPrice(totalValue)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting || isCartSubmitted}
            >
              {isSubmitting 
                ? (paymentMode === 'pay_now' ? 'Creating Order...' : 'Processing...')
                : isCartSubmitted 
                  ? 'Already Submitted' 
                  : paymentMode === 'pay_now'
                    ? 'Pay Now'
                    : 'Request Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


