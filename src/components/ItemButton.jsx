import React from 'react';

export default function ItemButton({ item, onClick, amountInCart }) {
  // Calculate remaining stock in real-time based on what is in the cart
  const stockRemaining = item.stock - amountInCart;
  const isOutOfStock = stockRemaining <= 0;

  return (
    <button
      onClick={() => onClick(item)}
      disabled={isOutOfStock}
      className={`relative p-4 rounded-xl shadow-sm border-2 text-left flex flex-col h-32 transition-all active:scale-95 ${
        isOutOfStock 
          ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
          : 'bg-white border-blue-50 hover:border-blue-300 cursor-pointer shadow-md'
      }`}
    >
      <div className={`font-bold text-lg leading-tight ${isOutOfStock ? 'text-gray-500' : 'text-gray-800'}`}>
        {item.name}
      </div>
      
      <div className="flex justify-between items-end mt-auto">
        <span className={`text-xl font-black ${isOutOfStock ? 'text-gray-400' : 'text-blue-600'}`}>
          ${item.price.toFixed(2)}
        </span>
        <span className={`text-sm font-bold px-2 py-1 rounded-md ${
          isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
        }`}>
          {isOutOfStock ? 'OUT' : `${stockRemaining} left`}
        </span>
      </div>
    </button>
  );
}