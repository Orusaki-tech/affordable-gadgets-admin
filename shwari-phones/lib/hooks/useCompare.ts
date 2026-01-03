/**
 * Compare Products Hook
 * Manages product comparison state with localStorage sync
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'compareProducts';
const MAX_COMPARE_ITEMS = 4;

export function useCompare() {
  const [compareList, setCompareList] = useState<number[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as number[];
          if (Array.isArray(parsed)) {
            setCompareList(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading compare list from localStorage:', error);
      }
    }
  }, []);

  // Sync to localStorage whenever compareList changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
      } catch (error) {
        console.error('Error saving compare list to localStorage:', error);
      }
    }
  }, [compareList]);

  const addProduct = useCallback((productId: number): boolean => {
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      return false; // Indicates failure due to max items
    }
    if (!compareList.includes(productId)) {
      setCompareList((prev) => [...prev, productId]);
      return true;
    }
    return true; // Already in list, but that's fine
  }, [compareList]);

  const removeProduct = useCallback((productId: number) => {
    setCompareList((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback((productId: number): boolean => {
    return compareList.includes(productId);
  }, [compareList]);

  const canAddMore = compareList.length < MAX_COMPARE_ITEMS;

  return {
    compareList,
    addProduct,
    removeProduct,
    clearCompare,
    isInCompare,
    canAddMore,
    count: compareList.length,
    maxItems: MAX_COMPARE_ITEMS,
  };
}











