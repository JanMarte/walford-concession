import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CheckoutModal({ cartTotal, onCancel, onConfirm }) {
  const [amountGiven, setAmountGiven] = useState('');

  // DYNAMIC MATH: Calculate the logical next bills based on the total
  const exact = cartTotal;
  const nextDollar = Math.ceil(cartTotal);
  const nextFive = Math.ceil(cartTotal / 5) * 5 || 5;
  const nextTen = Math.ceil(cartTotal / 10) * 10 || 10;
  const nextTwenty = Math.ceil(cartTotal / 20) * 20 || 20;

  // Remove duplicates (e.g. if total is $5, nextFive and exact are the same)
  const quickAmounts = [...new Set([exact, nextDollar, nextFive, nextTen, nextTwenty])]
    .filter(amt => amt >= cartTotal)
    .sort((a, b) => a - b);

  const changeDue = amountGiven ? (parseFloat(amountGiven) - cartTotal) : 0;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-black tracking-widest uppercase">Checkout</h2>
          <button onClick={onCancel} className="bg-gray-800 p-2 rounded-lg active:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-1">Total Due</div>
            <div className="text-6xl font-black text-green-600">${cartTotal.toFixed(2)}</div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-bold text-gray-500 uppercase">Quick Cash Given</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map(amt => (
                <button 
                  key={amt}
                  onClick={() => setAmountGiven(amt.toString())}
                  className="flex-1 bg-blue-100 text-blue-700 font-black text-xl py-3 rounded-xl active:bg-blue-200 border-2 border-blue-200 transition-colors"
                >
                  ${amt.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-bold text-gray-500 uppercase">Custom Amount</label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">$</span>
              <input 
                type="number" 
                value={amountGiven}
                onChange={(e) => setAmountGiven(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-4 pl-10 pr-4 text-2xl font-black outline-none focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {amountGiven !== '' && parseFloat(amountGiven) >= cartTotal && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center mb-4">
              <div className="text-green-800 font-bold uppercase text-sm mb-1">Change to return</div>
              <div className="text-4xl font-black text-green-600">${changeDue.toFixed(2)}</div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={onConfirm}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-2xl tracking-wide active:scale-95 transition-transform"
          >
            CONFIRM SALE
          </button>
        </div>
      </div>
    </div>
  );
}