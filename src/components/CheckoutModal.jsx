import React, { useState } from 'react';

export default function CheckoutModal({ cartTotal, onConfirm, onCancel }) {
  const [cashGiven, setCashGiven] = useState(0);
  const [customInput, setCustomInput] = useState('');

  // Generate logical quick cash buttons based on the total
  const getQuickCashOptions = (total) => {
    const options = [total]; // Always offer "Exact Change"
    
    // Add standard bills that are larger than the total
    if (total < 5) options.push(5);
    if (total < 10) options.push(10);
    if (total < 20) options.push(20);
    if (total < 50) options.push(50);
    
    // Remove duplicates and sort
    return [...new Set(options)].sort((a, b) => a - b);
  };

  const quickOptions = getQuickCashOptions(cartTotal);
  
  // Calculate change (only if they've given enough cash)
  const changeDue = cashGiven >= cartTotal ? cashGiven - cartTotal : 0;
  const isEnoughCash = cashGiven >= cartTotal;

  const handleCustomInput = (e) => {
    const value = e.target.value;
    setCustomInput(value);
    setCashGiven(parseFloat(value) || 0);
  };

  const handleQuickCash = (amount) => {
    setCashGiven(amount);
    setCustomInput(''); // Clear custom input if they use a quick button
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center flex flex-col max-h-[90vh] overflow-y-auto">
        
        <h2 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Total Due</h2>
        <div className="text-7xl font-black text-gray-900 mb-8 tracking-tighter">
          ${cartTotal.toFixed(2)}
        </div>

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Select Cash Received</h3>
        
        {/* Quick Cash Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickOptions.map(amount => (
            <button 
              key={amount}
              onClick={() => handleQuickCash(amount)}
              className={`py-5 rounded-xl font-black text-2xl transition-all border-4 ${
                cashGiven === amount 
                  ? 'bg-blue-100 border-blue-600 text-blue-700' 
                  : 'bg-gray-50 border-transparent text-gray-700 hover:bg-gray-100'
              }`}
            >
              {amount === cartTotal ? "Exact" : `$${amount.toFixed(2)}`}
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="mb-8">
          <input 
            type="number" 
            placeholder="Or enter custom amount..."
            value={customInput}
            onChange={handleCustomInput}
            className="w-full bg-gray-50 border-2 border-gray-200 p-4 rounded-xl text-center text-xl font-bold focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* The Change Calculator Display */}
        <div className={`p-8 rounded-2xl mb-8 transition-colors border-4 ${
          isEnoughCash && cashGiven > 0 ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`text-sm font-bold uppercase tracking-wider mb-2 ${
            isEnoughCash && cashGiven > 0 ? 'text-green-700' : 'text-gray-500'
          }`}>
            Change Due
          </div>
          <div className={`text-6xl font-black tracking-tighter ${
             isEnoughCash && cashGiven > 0 ? 'text-green-600' : 'text-gray-300'
          }`}>
            {cashGiven === 0 ? "$0.00" : `$${changeDue.toFixed(2)}`}
          </div>
        </div>

        {/* Final Action Buttons */}
        <div className="flex gap-4 mt-auto">
          <button 
            onClick={onCancel}
            className="w-1/3 bg-red-50 text-red-600 hover:bg-red-100 py-5 font-bold text-xl rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={!isEnoughCash} 
            className="w-2/3 bg-green-600 text-white py-5 font-black text-2xl rounded-xl disabled:opacity-50 disabled:bg-gray-400 transition-all hover:bg-green-700 active:scale-95 shadow-lg shadow-green-600/30"
          >
            Confirm Sale
          </button>
        </div>

      </div>
    </div>
  );
}