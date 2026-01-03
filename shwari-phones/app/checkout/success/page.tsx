'use client';

import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-2">
              Your inquiry has been submitted successfully.
            </p>
            {reference && (
              <p className="text-lg font-semibold text-gray-800">
                Reference: {reference}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700">
              A salesperson will contact you shortly to assist with your inquiry. You can track your
              inquiry using the reference number above.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/products"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
            {reference && (
              <Link
                href={`/leads/${reference}`}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Track Inquiry
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}







