import React from 'react';
import ItemButton from './ItemButton';

export default function ItemGrid({ inventory, onAddToCart, cart }) {
  // Helper to check how many of a specific item are already in the cart
  const getAmountInCart = (itemId) => {
    return cart.filter(cartItem => cartItem.id === itemId).length;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-20">
      {inventory.map((item) => (
        <ItemButton 
          key={item.id} 
          item={item} 
          onClick={onAddToCart}
          amountInCart={getAmountInCart(item.id)}
        />
      ))}
    </div>
  );
}