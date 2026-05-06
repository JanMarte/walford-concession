import React, { useState } from 'react';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';

export default function Dashboard({ inventory, history, updateItem, deleteItem, saveInventoryItem, onBack }) {
  // Local state for the "Add Item" form
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  // Calculate total money made today
  const totalRevenue = history.reduce((sum, txn) => sum + txn.total, 0);

  // HELPER: Groups ["Hot Dog", "Hot Dog", "Chips"] into "2x Hot Dog, 1x Chips"
  const formatItemsSold = (itemsArray) => {
    const counts = itemsArray.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts)
      .map(([name, qty]) => `${qty}x ${name}`)
      .join(', ');
  };

  // HELPER: Handles saving the manual form
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) return;

    saveInventoryItem({
      id: Date.now().toString(),
      name: newName,
      price: parseFloat(newPrice),
      stock: parseInt(newStock),
      barcode: "" // Blank because it was added manually without a scanner
    }, false); // false means it's a brand new item, not a restock

    // Reset the form
    setNewName('');
    setNewPrice('');
    setNewStock('');
    setIsAdding(false); // Close the form
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden absolute inset-0 z-40">
      
      {/* Top Navigation Bar */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Register
          </button>
          <h1 className="text-xl font-black tracking-widest uppercase text-gray-300">Back Office Dashboard</h1>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        
        {/* LEFT: Analytics & History */}
        <div className="w-1/3 flex flex-col gap-6">
          
          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Revenue</h2>
            <div className="text-6xl font-black text-green-600">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-500 font-medium mt-2">{history.length} Transactions Today</div>
          </div>

          {/* Transaction Log */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">Recent Transactions</div>
            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="text-gray-400 text-center mt-10">No sales yet.</div>
              ) : (
                [...history].reverse().map(txn => (
                  <div key={txn.id} className="border-b border-gray-100 last:border-0 py-3">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>Order #{txn.id.slice(-4)}</span>
                      <span className="text-green-600">${txn.total.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{txn.time}</div>
                    {/* UPDATED: Now uses our stacking helper! */}
                    <div className="text-sm text-gray-500 mt-1">
                      {formatItemsSold(txn.itemsSold)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Inventory Management */}
        <div className="w-2/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          
          {/* Header area with Add Button */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="font-bold text-gray-700">Live Inventory Management</span>
            <div className="flex gap-3">
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold flex items-center">
                {inventory.length} Items
              </span>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold text-white transition-colors ${isAdding ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-gray-800'}`}
              >
                {isAdding ? 'Cancel' : <><Plus size={16}/> Add Manual</>}
              </button>
            </div>
          </div>
          
          {/* THE NEW MANUAL ADD FORM */}
          {isAdding && (
            <form onSubmit={handleAddItem} className="bg-blue-50/50 p-4 border-b border-blue-100 flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Item Name</label>
                <input required autoFocus value={newName} onChange={e=>setNewName(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white" placeholder="e.g., Pretzel" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Price ($)</label>
                <input required type="number" step="0.01" min="0" value={newPrice} onChange={e=>setNewPrice(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white" placeholder="0.00" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Stock Qty</label>
                <input required type="number" min="0" value={newStock} onChange={e=>setNewStock(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white" placeholder="0" />
              </div>
              <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg h-[44px] hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
                Save
              </button>
            </form>
          )}

          {/* The Inventory Table */}
          <div className="flex-1 overflow-y-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b-2 border-gray-100">
                  <th className="pb-3 font-bold">Item Name</th>
                  <th className="pb-3 font-bold">Price ($)</th>
                  <th className="pb-3 font-bold">Current Stock</th>
                  <th className="pb-3 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-bold text-gray-800">{item.name}</td>
                    
                    <td className="py-4">
                      <input 
                        type="number" 
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem({ ...item, price: parseFloat(e.target.value) || 0 })}
                        className="w-24 border border-gray-300 rounded-lg p-2 text-center focus:border-blue-500 outline-none"
                      />
                    </td>
                    
                    <td className="py-4">
                      <input 
                        type="number" 
                        value={item.stock}
                        onChange={(e) => updateItem({ ...item, stock: parseInt(e.target.value) || 0 })}
                        className={`w-24 border rounded-lg p-2 text-center font-bold outline-none focus:border-blue-500 ${item.stock <= 0 ? 'bg-red-50 text-red-600 border-red-200' : 'border-gray-300'}`}
                      />
                    </td>
                    
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => {
                          if(window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                            deleteItem(item.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}