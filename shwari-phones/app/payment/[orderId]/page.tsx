'use client';

import { PaymentPage } from '@/components/PaymentPage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { use } from 'react';

interface PaymentPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function PaymentRoute({ params, searchParams }: PaymentPageProps) {
  const { orderId } = use(params);
  const searchParamsResolved = use(searchParams);
  
  // Get total amount from search params or fetch from order
  const totalAmount = searchParamsResolved.total_amount 
    ? parseFloat(searchParamsResolved.total_amount as string) 
    : 0;
  
  const callbackUrl = searchParamsResolved.callback_url as string | undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PaymentPage 
          orderId={orderId} 
          totalAmount={totalAmount}
          callbackUrl={callbackUrl}
        />
      </main>
      <Footer />
    </div>
  );
}








