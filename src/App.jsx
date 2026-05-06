import React, { useState } from 'react';
import { Camera, LayoutDashboard, ShoppingCart, X } from 'lucide-react'; // <-- Added ShoppingCart and X
import { usePOSData } from './hooks/usePOSData';
import ItemGrid from './components/ItemGrid';
import CheckoutModal from './components/CheckoutModal';
import ScannerModal from './components/ScannerModal';
import Dashboard from './components/Dashboard';

function App() {
  const { inventory, history, confirmTransaction, saveInventoryItem, updateItem, deleteItem, exportData, importData } = usePOSData();
  
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [currentView, setCurrentView] = useState('pos');
  
  // NEW: State to control the mobile slide-up cart
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false); 

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const addToCart = (item) => {
    const amountInCart = cart.filter(cartItem => cartItem.id === item.id).length;
    if (amountInCart >= item.stock) return; 
    setCart([...cart, item]);
  };

  const removeFromCart = (itemId) => {
    const indexToRemove = cart.findIndex(item => item.id === itemId);
    if (indexToRemove !== -1) {
      const newCart = [...cart];
      newCart.splice(indexToRemove, 1);
      setCart(newCart);
    }
  };

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
        exportData={exportData} 
        importData={importData} 
        onBack={() => setCurrentView('pos')} 
      />
    );
  }

  return (
    // FIX 1: h-[100dvh] fixes the mobile browser scrolling issue
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-gray-100 overflow-hidden relative">
      
      {/* LEFT COLUMN: The Item Grid */}
      <div className="w-full lg:w-[70%] flex-1 p-4 lg:p-6 lg:border-r border-gray-300 overflow-y-auto pb-24 lg:pb-6">
        
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

      {/* NEW: THE FLOATING MOBILE CART BUTTON */}
      <button 
        onClick={() => setIsMobileCartOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-30 hover:bg-blue-700 active:scale-95 transition-all border-4 border-white"
      >
        <ShoppingCart size={28} />
        {/* The Red Notification Badge */}
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black h-7 w-7 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {cart.length}
          </span>
        )}
      </button>

      {/* MOBILE CART OVERLAY (Darkens background when cart is open on phone) */}
      {isMobileCartOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileCartOpen(false)}
        />
      )}

      {/* RIGHT COLUMN: The Current Order (Bottom Sheet on Mobile, Standard column on Desktop) */}
      <div className={`
        fixed inset-x-0 bottom-0 z-50 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out flex flex-col rounded-t-3xl lg:rounded-none lg:static lg:w-[30%] lg:h-full lg:shadow-xl lg:translate-y-0
        ${isMobileCartOpen ? 'translate-y-0 h-[85dvh]' : 'translate-y-full'}
      `}>
        
        {/* Cart Header */}
        <div className="flex justify-between items-center p-4 lg:p-6 border-b border-gray-100 lg:border-none">
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
          <button 
            onClick={() => setIsMobileCartOpen(false)}
            className="lg:hidden bg-gray-100 p-2 rounded-full text-gray-600 active:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Cart Items Area */}
        <div className="flex-grow bg-gray-50/50 lg:bg-gray-50 lg:rounded-lg border-y lg:border border-gray-200 lg:mb-4 px-4 py-2 lg:mx-6 overflow-y-auto">
          {groupedCart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 text-sm">Cart is empty</div>
          ) : (
            groupedCart.map(({ item, qty }) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
                <div>
                  <div className="font-bold text-gray-800 text-lg leading-none">{item.name}</div>
                  {qty > 1 && (
                    <div className="text-sm text-gray-500 font-medium mt-1">
                      {qty} x ${item.price.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-gray-700 text-lg">
                    ${(item.price * qty).toFixed(2)}
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 h-10 w-10 rounded-lg font-black text-xl flex items-center justify-center transition-colors shadow-sm"
                  >
                    −
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Button Area */}
        <div className="flex-grow-0 p-4 lg:p-6 lg:pt-4 lg:border-t border-gray-200 bg-white">
          <div className="flex justify-between items-end mb-3">
            <span className="text-lg font-bold text-gray-500 uppercase tracking-wider">Total</span>
            <span className="text-4xl font-black text-green-600 leading-none">${cartTotal.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => {
              setIsMobileCartOpen(false); // Close mobile cart when opening checkout
              setShowCheckout(true);
            }} 
            className="w-full bg-blue-600 text-white py-5 rounded-xl font-black text-2xl tracking-wide hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
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