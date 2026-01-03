/**
 * Cart Context and Hook
 */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { cartApi, Cart, CartItem, CheckoutData, CheckoutResponse } from '@/lib/api/cart';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (inventoryUnitId: number, quantity?: number, promotionId?: number, unitPrice?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateCart: () => Promise<void>;
  checkout: (checkoutData: CheckoutData) => Promise<CheckoutResponse>;
  clearCart: () => void;
  itemCount: number;
  totalValue: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get or create cart on mount
  useEffect(() => {
    const initCart = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        const sessionKey = typeof window !== 'undefined' ? localStorage.getItem('session_key') || undefined : undefined;
        
        // Store session key if not exists
        if (typeof window !== 'undefined' && !localStorage.getItem('session_key')) {
          localStorage.setItem('session_key', `session_${Date.now()}`);
        }
        
        console.log('Initializing cart with session key:', sessionKey);
        const newCart = await cartApi.getOrCreateCart(sessionKey);
        setCart(newCart);
        console.log('Cart initialized successfully:', newCart.id);
      } catch (err: any) {
        const errorData = err?.response?.data || {};
        const errorMessage = errorData.error || errorData.detail || err?.message || 'Unknown error';
        const brandCode = errorData.brand_code || 'Unknown';
        
        console.error('Cart initialization error:', {
          message: errorMessage,
          brand_code: brandCode,
          response: errorData,
          status: err?.response?.status,
          url: err?.config?.url,
          fullError: err,
        });
        
        // Handle connection errors
        if (err?.code === 'ECONNREFUSED' || err?.message?.includes('Network Error')) {
          setError('Cannot connect to backend server. Please ensure the Django backend is running.');
          return; // Don't try to create cart if backend is down
        }
        
        // Don't set error for 400/404 - cart might not exist yet, which is fine
        // Cart will be created when first item is added
        if (err?.response?.status === 400 || err?.response?.status === 404) {
          if (errorMessage.includes('Brand') || errorMessage.includes('brand')) {
            console.error(`Brand configuration error: Brand code "${brandCode}" is not configured or inactive.`);
            console.error('To fix this, run: python manage.py create_default_brand');
            setError(`Brand not configured: ${brandCode}. Run 'python manage.py create_default_brand' to create it.`);
          } else {
            console.warn('Cart not available yet, will be created on first add:', errorMessage);
            setCart(null);
          }
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initCart();
  }, []);

  const updateCart = useCallback(async () => {
    if (!cart) return;
    try {
      const updatedCart = await cartApi.getCart(cart.id);
      // If cart has no items, clear it
      if (!updatedCart.items || updatedCart.items.length === 0) {
        console.log('Cart is empty, clearing from state');
        setCart(null);
        return;
      }
      setCart(updatedCart);
    } catch (err: any) {
      // If cart is not found (404), it has been deleted (e.g., after payment confirmation)
      // Clear the cart from state so the UI reflects that it's been cleared
      if (err?.response?.status === 404) {
        console.log('Cart not found (deleted) - clearing from state');
        setCart(null);
        return;
      }
      setError(err.message || 'Failed to update cart');
    }
  }, [cart]);

  const addToCart = useCallback(async (
    inventoryUnitId: number, 
    quantity: number = 1,
    promotionId?: number,
    unitPrice?: number
  ) => {
    try {
      let currentCart = cart;
      
      // Create cart if it doesn't exist
      if (!currentCart) {
        console.log('Cart not found, creating new cart...');
        const sessionKey = typeof window !== 'undefined' ? localStorage.getItem('session_key') || undefined : undefined;
        try {
          currentCart = await cartApi.getOrCreateCart(sessionKey);
          setCart(currentCart);
          console.log('Cart created successfully:', currentCart.id);
        } catch (cartErr: any) {
          console.error('Failed to create cart:', {
            message: cartErr?.message,
            response: cartErr?.response?.data,
            status: cartErr?.response?.status,
          });
          throw new Error(cartErr?.response?.data?.error || cartErr?.message || 'Failed to create cart');
        }
      }
      
      // Add item to cart with promotion info
      console.log('Adding item to cart:', { 
        cartId: currentCart.id, 
        inventoryUnitId, 
        quantity,
        promotionId,
        unitPrice
      });
      await cartApi.addItem(
        currentCart.id, 
        inventoryUnitId, 
        quantity,
        promotionId,
        unitPrice
      );
      await updateCart();
      console.log('Item added successfully');
    } catch (err: any) {
      console.error('Add to cart error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        url: err?.config?.url,
      });
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to add item to cart';
      setError(errorMessage);
      throw err;
    }
  }, [cart, updateCart]);

  const removeFromCart = useCallback(async (itemId: number) => {
    if (!cart) {
      console.error('Cannot remove item: No cart available');
      return;
    }
    try {
      console.log(`Removing item ${itemId} from cart ${cart.id}`);
      await cartApi.removeItem(cart.id, itemId);
      console.log('Item removed successfully, updating cart...');
      await updateCart();
      console.log('Cart updated successfully');
    } catch (err: any) {
      console.error('Error removing item from cart:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to remove item from cart';
      setError(errorMessage);
      throw err; // Re-throw so UI can handle it
    }
  }, [cart, updateCart]);

  const checkout = useCallback(async (checkoutData: CheckoutData): Promise<CheckoutResponse> => {
    if (!cart) throw new Error('No cart available');
    try {
      const response = await cartApi.checkout(cart.id, checkoutData);
      // Don't clear cart - keep it for reference until lead is converted to order
      // The cart is now linked to the lead via cart.lead
      // Just refresh the cart to show it's submitted
      await updateCart();
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to checkout');
      throw err;
    }
  }, [cart, updateCart]);

  const clearCart = useCallback(() => {
    setCart(null);
  }, []);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalValue = cart?.total_value || 0;

  const value: CartContextType = {
    cart,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateCart,
    checkout,
    clearCart,
    itemCount,
    totalValue,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

