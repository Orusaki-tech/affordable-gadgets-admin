'use client';

import { useCart } from '@/lib/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CheckoutModal } from './CheckoutModal';

export function CartPage() {
  const { cart, isLoading, removeFromCart, totalValue, itemCount, updateCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  // Periodically check if cart still exists (in case it was cleared after payment)
  useEffect(() => {
    if (!cart || !cart.is_submitted) return;

    // Check every 5 seconds if cart is submitted (waiting for payment confirmation)
    const interval = setInterval(() => {
      updateCart();
    }, 5000);

    return () => clearInterval(interval);
  }, [cart, updateCart]);

  if (isLoading) {
    return <div className="text-center py-12">Loading cart...</div>;
  }

  if (!cart || (cart.items?.length ?? 0) === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Add some products to get started!</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {(cart.items ?? [])
            .filter((item) => item.inventory_unit)
            .map((item) => {
            const inventoryUnit = item.inventory_unit!;
            const unitPrice = Number(item.unit_price ?? inventoryUnit.selling_price ?? 0);
            const originalPrice = Number(inventoryUnit.selling_price ?? 0);
            const quantity = Number(item.quantity ?? 0);
            const hasPromotion = item.unit_price != null && unitPrice < originalPrice;
            
            return (
              <div
                key={item.id}
                className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border-2 border-gray-100"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{inventoryUnit.product_name}</h3>
                  <p className="text-gray-600 text-sm">
                    {inventoryUnit.condition}
                    {inventoryUnit.grade && ` • Grade ${inventoryUnit.grade}`}
                    {inventoryUnit.storage_gb && ` • ${inventoryUnit.storage_gb}GB`}
                    {inventoryUnit.ram_gb && ` • ${inventoryUnit.ram_gb}GB RAM`}
                    {inventoryUnit.color_name && ` • ${inventoryUnit.color_name}`}
                  </p>
                  {hasPromotion ? (
                    <div className="mt-2">
                      <p className="text-lg font-semibold text-red-600">
                        {formatPrice(unitPrice)} × {quantity}
                      </p>
                      <p className="text-sm text-gray-400 line-through">
                        {formatPrice(originalPrice)} × {quantity}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-semibold mt-2">
                      {formatPrice(unitPrice)} × {quantity}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end justify-between">
                  {hasPromotion ? (
                    <div className="text-right">
                      <p className="text-xl font-bold text-red-600">
                        {formatPrice(unitPrice * quantity)}
                      </p>
                      <p className="text-sm text-gray-400 line-through">
                        {formatPrice(originalPrice * quantity)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xl font-bold">
                      {formatPrice(unitPrice * quantity)}
                    </p>
                  )}
                  <button
                    onClick={async () => {
                      if (typeof item.id !== 'number') {
                        return;
                      }
                      try {
                        await removeFromCart(item.id);
                      } catch (err) {
                        console.error('Failed to remove item:', err);
                        // Error is already handled in removeFromCart
                      }
                    }}
                    className="text-red-600 hover:text-red-700 text-sm hover:underline mt-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Items ({itemCount})</span>
                <span>{formatPrice(totalValue)}</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatPrice(totalValue)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              disabled={cart.is_submitted}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                cart.is_submitted
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {cart.is_submitted ? 'Already Submitted' : 'Checkout'}
            </button>
            <Link
              href="/products"
              className="block text-center mt-4 text-blue-600 hover:text-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          totalValue={totalValue}
        />
      )}
    </div>
  );
}

