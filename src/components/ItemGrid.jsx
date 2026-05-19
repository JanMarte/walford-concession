import React from 'react';

// SMART FILTER: Guesses category based on name so you don't have to edit database!
const getCategory = (itemName) => {
  const name = itemName.toLowerCase();
  if (name.match(/gatorade|water|soda|coke|sprite|drink|juice|punch/)) return 'Drinks';
  if (name.match(/ring pop|candy|skittles|chocolate|cookie|sweet|m&m|snickers/)) return 'Sweets';
  return 'Snacks'; 
};

export default function ItemGrid({ inventory, onAddToCart, cart, activeFilter }) {
  
  // Sort items: Put matching items at the top
  const sortedInventory = [...inventory].sort((a, b) => {
    if (activeFilter === 'All') return 0;
    const aMatch = getCategory(a.name) === activeFilter;
    const bMatch = getCategory(b.name) === activeFilter;
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0; // Keep original order for the rest
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-24">
      {sortedInventory.map(item => {
        // Count how many of this item are currently in the cart
        const inCartCount = cart.filter(c => c.id === item.id).length;
        const isOutOfStock = item.stock <= inCartCount;
        
        // Determine if it should be highlighted based on the filter
        const isHighlighted = activeFilter !== 'All' && getCategory(item.name) === activeFilter;
        const isFaded = activeFilter !== 'All' && !isHighlighted;

        return (
          <button
            key={item.id}
            disabled={isOutOfStock}
            onClick={() => onAddToCart(item)}
            className={`
              relative p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all h-32
              ${isOutOfStock ? 'bg-gray-100 opacity-50 cursor-not-allowed border border-gray-200' : 'bg-white shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-95'}
              ${isHighlighted ? 'ring-4 ring-blue-400 bg-blue-50' : ''}
              ${isFaded ? 'opacity-40 grayscale' : ''}
            `}
          >
            <div className="font-bold text-gray-800 leading-tight">{item.name}</div>
            <div className="text-green-600 font-black mt-2">${item.price.toFixed(2)}</div>
            
            {/* Stock indicator */}
            <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
              {item.stock - inCartCount}
            </div>
            
            {/* Cart indicator badge */}
            {inCartCount > 0 && (
              <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs font-black h-6 w-6 flex items-center justify-center rounded-full border-2 border-white">
                {inCartCount}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}