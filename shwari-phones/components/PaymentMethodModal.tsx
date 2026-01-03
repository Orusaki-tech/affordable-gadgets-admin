'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils/format';

interface PaymentMethodModalProps {
  onClose: () => void;
  onProceed: (paymentMethod: string, mobileNumber?: string) => void;
  totalAmount: number;
  merchantName?: string;
  isLoading?: boolean;
}

type PaymentMethod = 'mpesa' | 'airtel' | 'card' | 'pesapal';

export function PaymentMethodModal({
  onClose,
  onProceed,
  totalAmount,
  merchantName = 'AFFORDABLE GADGETS',
  isLoading = false,
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mpesa');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+254');

  const handleProceed = () => {
    if (selectedMethod === 'mpesa' || selectedMethod === 'airtel') {
      if (!mobileNumber || mobileNumber.length < 9) {
        alert('Please enter a valid mobile number');
        return;
      }
      // Format phone number with country code
      const fullPhoneNumber = `${countryCode}${mobileNumber.replace(/^0+/, '')}`;
      onProceed(selectedMethod, fullPhoneNumber);
    } else {
      onProceed(selectedMethod);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 9 digits (Kenyan phone numbers)
    return digits.slice(0, 9);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Please select your preferred payment option
        </h2>

        {/* Payment Options */}
        <div className="space-y-3 mb-6">
          {/* M-PESA Option */}
          <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'mpesa' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="mpesa"
              checked={selectedMethod === 'mpesa'}
              onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
              className="mr-4 w-5 h-5 text-green-600"
            />
            <div className="flex items-center flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4 shadow-sm">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="font-semibold text-lg text-gray-800">M-PESA</span>
            </div>
          </label>

          {/* Airtel Money Option */}
          <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'airtel' 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="airtel"
              checked={selectedMethod === 'airtel'}
              onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
              className="mr-4 w-5 h-5 text-red-600"
            />
            <div className="flex items-center flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-4 shadow-sm">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="font-semibold text-lg text-gray-800">Airtel Money</span>
            </div>
          </label>

          {/* Card Payments Option */}
          <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'card' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={selectedMethod === 'card'}
              onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
              className="mr-4 w-5 h-5 text-blue-600"
            />
            <div className="flex items-center flex-1">
              <div className="flex items-center gap-2 mr-4">
                <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center shadow-sm">
                  <span className="text-white text-[10px] font-bold">VISA</span>
                </div>
                <div className="w-10 h-7 bg-red-500 rounded flex items-center justify-center shadow-sm">
                  <span className="text-white text-[10px] font-bold">MC</span>
                </div>
                <div className="w-10 h-7 bg-blue-800 rounded flex items-center justify-center shadow-sm">
                  <span className="text-white text-[10px] font-bold">AE</span>
                </div>
              </div>
              <span className="font-semibold text-lg text-gray-800">Card Payments</span>
            </div>
          </label>

          {/* Pesapal Gateway Option */}
          <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedMethod === 'pesapal' 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="pesapal"
              checked={selectedMethod === 'pesapal'}
              onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
              className="mr-4 w-5 h-5 text-orange-600"
            />
            <div className="flex items-center flex-1">
              <div className="flex items-center gap-2 mr-4">
                <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center shadow-sm">
                  <span className="text-white text-[10px] font-bold">VISA</span>
                </div>
                <div className="w-10 h-7 bg-orange-500 rounded flex items-center justify-center shadow-sm">
                  <span className="text-white text-[9px] font-bold px-1">e-wallet</span>
                </div>
              </div>
              <span className="font-semibold text-lg text-gray-800">Pesapal Gateway</span>
            </div>
          </label>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200">
          <p className="text-center font-semibold text-lg text-gray-800">
            Pay <span className="font-bold text-gray-900">"{merchantName}"</span> {formatPrice(totalAmount)}
          </p>
        </div>

        {/* MPESA Instructions */}
        {(selectedMethod === 'mpesa' || selectedMethod === 'airtel') && (
          <div className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-base text-gray-800 mb-3">
              {selectedMethod === 'mpesa' ? 'M-PESA Payment Instructions:' : 'Airtel Money Payment Instructions:'}
            </h3>
            <ol className="list-decimal list-inside space-y-2.5 text-sm text-gray-700 leading-relaxed">
              <li>
                Provide your {selectedMethod === 'mpesa' ? 'MPESA' : 'Airtel Money'} [KE] mobile number below
              </li>
              <li>
                Click Proceed and a prompt will appear on your phone requesting you to confirm transaction by providing your{' '}
                {selectedMethod === 'mpesa' ? 'MPESA' : 'Airtel Money'} PIN
              </li>
              <li>
                Once completed, you will receive the confirmation SMS for this transaction
              </li>
            </ol>

            {/* Mobile Number Input */}
            <div className="mt-5">
              <label className="flex items-center text-sm font-medium mb-2.5 text-gray-700">
                <svg
                  className="w-5 h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Provide your {selectedMethod === 'mpesa' ? 'Mpesa' : 'Airtel Money'} [KE] Mobile number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2.5 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 text-sm font-medium"
                >
                  <option value="+254">+254</option>
                  <option value="+255">+255</option>
                  <option value="+256">+256</option>
                  <option value="+250">+250</option>
                </select>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(formatPhoneNumber(e.target.value))}
                  placeholder="727504393"
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  maxLength={9}
                />
              </div>
            </div>
          </div>
        )}

        {/* Card/Pesapal Instructions */}
        {(selectedMethod === 'card' || selectedMethod === 'pesapal') && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              You will be redirected to a secure payment page to complete your transaction using your preferred card.
            </p>
          </div>
        )}

        {/* Regulatory Information */}
        <p className="text-xs text-gray-500 text-center mb-6">
          Pesapal is Regulated by the Central Bank of Kenya
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-gray-700"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            disabled={isLoading || (selectedMethod !== 'card' && selectedMethod !== 'pesapal' && !mobileNumber)}
            className="flex-1 px-4 py-3 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B3410] font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? 'Processing...' : 'Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}




