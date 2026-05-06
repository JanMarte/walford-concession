import React, { useState } from 'react';
import { Camera, LayoutDashboard } from 'lucide-react';
import { usePOSData } from './hooks/usePOSData';
import ItemGrid from './components/ItemGrid';
import CheckoutModal from './components/CheckoutModal';
import ScannerModal from './components/ScannerModal';
import Dashboard from './components/Dashboard';

function App() {
  const { inventory, history, confirmTransaction, saveInventoryItem, updateItem, deleteItem } = usePOSData();
  
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const [currentView, setCurrentView] = useState('pos');

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const addToCart = (item) => {
    const amountInCart = cart.filter(cartItem => cartItem.id === item.id).length;
    if (amountInCart >= item.stock) return; 
    setCart([...cart, item]);
  };

  // NEW: Remove a single instance of an item from the cart
  const removeFromCart = (itemId) => {
    // Find the index of the FIRST item that matches this ID
    const indexToRemove = cart.findIndex(item => item.id === itemId);
    
    if (indexToRemove !== -1) {
      // Create a copy of the cart, remove just that one item, and update state
      const newCart = [...cart];
      newCart.splice(indexToRemove, 1);
      setCart(newCart);
    }
  };

  // NEW: Group the flat cart array into stacked items for the UI
  // This turns [HotDog, HotDog, Chips] into [{item: HotDog, qty: 2}, {item: Chips, qty: 1}]
  const groupedCart = cart.reduce((acc, item) => {
    const existingItem = acc.find(i => i.item.id === item.id);
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      acc.push({ item, qty: 1 });
    }
    return acc;
  }, []);

  if (currentView === 'dashboard') {
    return (
      <Dashboard 
        inventory={inventory} 
        history={history} 
        updateItem={updateItem} 
        deleteItem={deleteItem}
        saveInventoryItem={saveInventoryItem}
        onBack={() => setCurrentView('pos')} 
      />
    );
  }

  return (
    // UPDATED: flex-col for mobile, lg:flex-row for big screens
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      
      {/* LEFT COLUMN: The Item Grid */}
      {/* UPDATED: w-full and flex-1 for mobile, lg:w-[70%] for big screens */}
      <div className="w-full lg:w-[70%] flex-1 p-4 lg:p-6 border-b-2 lg:border-b-0 lg:border-r border-gray-300 overflow-y-auto relative">
        
        {/* UPDATED: Flex-wrap and gap adjustments for mobile headers */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-gray-800">Concession Stand</h1>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-blue-100 text-blue-700 px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg font-bold hover:bg-blue-200 active:scale-95 transition-all"
            >
              <LayoutDashboard size={20} />
              <span className="text-sm sm:text-base">Dashboard</span>
            </button>
            <button 
              onClick={() => setShowScanner(true)}
              className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-gray-900 text-white px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg font-bold hover:bg-gray-800 active:scale-95 transition-all"
            >
              <Camera size={20} />
              <span className="text-sm sm:text-base">Scan</span>
            </button>
          </div>
        </div>
        
        <ItemGrid inventory={inventory} onAddToCart={addToCart} cart={cart} />
      </div>

      {/* RIGHT COLUMN: The Current Order */}
      {/* UPDATED: Fixed height of 45vh on mobile so it acts like a bottom sheet, full height on big screens */}
      <div className="w-full lg:w-[30%] h-[45vh] lg:h-full bg-white p-4 lg:p-6 flex flex-col shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] lg:shadow-xl z-10">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex-grow-0">Current Order</h2>
        
        <div className="flex-grow bg-gray-50 rounded-lg border border-gray-200 mb-4 p-3 lg:p-4 overflow-y-auto">
          {groupedCart.length === 0 ? (
            <div className="text-center text-gray-400 mt-4 lg:mt-10 text-sm">Cart is empty</div>
          ) : (
            groupedCart.map(({ item, qty }) => (
              <div key={item.id} className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-200 last:border-0">
                
                <div>
                  <div className="font-bold text-gray-800 text-base lg:text-lg leading-none">{item.name}</div>
                  {qty > 1 && (
                    <div className="text-xs lg:text-sm text-gray-500 font-medium mt-1">
                      {qty} x ${item.price.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 lg:gap-4">
                  <span className="font-black text-gray-700 text-base lg:text-lg">
                    ${(item.price * qty).toFixed(2)}
                  </span>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 h-8 w-8 lg:h-10 lg:w-10 rounded-lg font-black text-lg lg:text-xl flex items-center justify-center transition-colors shadow-sm"
                  >
                    −
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        <div className="flex-grow-0 pt-2 lg:pt-4 border-t border-gray-200">
          <div className="flex justify-between items-end mb-3 lg:mb-4">
            <span className="text-lg lg:text-xl font-bold text-gray-500 uppercase tracking-wider">Total</span>
            <span className="text-3xl lg:text-4xl font-black text-green-600 leading-none">${cartTotal.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)} 
            className="w-full bg-blue-600 text-white py-4 lg:py-5 rounded-xl font-black text-xl lg:text-2xl tracking-wide hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
          >
            Pay Now
          </button>
        </div>
      </div>

      {/* THE MODAL OVERLAYS */}
      {showCheckout && (
        <CheckoutModal 
          cartTotal={cartTotal} 
          onCancel={() => setShowCheckout(false)}
          onConfirm={() => {
            confirmTransaction(cart, cartTotal);
            setCart([]);
            setShowCheckout(false);
          }}
        />
      )}

      {showScanner && (
        <ScannerModal 
          inventory={inventory}
          onClose={() => setShowScanner(false)}
          onSaveItem={(newItem, isRestock) => {
            saveInventoryItem(newItem, isRestock);
            setShowScanner(false);
          }}
        />
      )}
    </div>
  );
}

export default App;