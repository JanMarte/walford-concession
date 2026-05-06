import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerModal({ onClose, onSaveItem, inventory }) {
  const [scannedCode, setScannedCode] = useState(null);
  const [existingItem, setExistingItem] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  // Initialize the camera when the component mounts
  useEffect(() => {
    // If we already scanned something, don't run the camera
    if (scannedCode) return; 

    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      (decodedText) => {
        // Success! Stop the camera and save the code
        scanner.clear();
        setScannedCode(decodedText);
        
        // Check if we already have this barcode in our inventory
        const found = inventory.find(item => item.barcode === decodedText);
        if (found) {
          setExistingItem(found);
          setName(found.name);
          setPrice(found.price.toString());
        }
      },
      (errorMessage) => {
        // Ignore constant scanning errors (it errors every frame it doesn't see a barcode)
      }
    );

    // Cleanup function when modal closes
    return () => {
      scanner.clear().catch(e => console.error("Scanner failed to clear", e));
    };
  }, [scannedCode, inventory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (existingItem) {
      // It's a restock! Add new stock to existing stock
      onSaveItem({ 
        ...existingItem, 
        stock: existingItem.stock + parseInt(stock) 
      }, true);
    } else {
      // It's a brand new item!
      onSaveItem({
        id: Date.now().toString(),
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        barcode: scannedCode
      }, false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        
        {!scannedCode ? (
          // STAGE 1: THE CAMERA VIEW
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Scan Inventory Barcode</h2>
            <div id="reader" className="w-full overflow-hidden rounded-lg mb-4"></div>
            <button onClick={onClose} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold">Cancel</button>
          </div>
        ) : (
          // STAGE 2: THE FORM VIEW
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="text-center mb-2">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                Barcode Found
              </span>
              <div className="text-gray-400 font-mono text-sm mt-2">{scannedCode}</div>
            </div>

            {existingItem && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm text-center font-medium">
                Item recognized! Just enter the amount you are adding to stock.
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
              <input 
                required 
                disabled={!!existingItem} // Disable if we already know what it is
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-gray-200 p-3 rounded-xl disabled:bg-gray-100" 
                placeholder="e.g., Skittles (King Size)"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                <input 
                  required 
                  disabled={!!existingItem}
                  type="number" 
                  step="0.01" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl disabled:bg-gray-100" 
                  placeholder="2.50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-1">Quantity Adding</label>
                <input 
                  required 
                  type="number" 
                  value={stock} 
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl" 
                  placeholder="e.g., 24"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold">
                Save Inventory
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}