import React, { useState, useRef } from 'react';
import { ArrowLeft, Trash2, Plus, Download, Upload, ChevronDown, ChevronUp } from 'lucide-react'; // <-- Added Chevrons

export default function Dashboard({ inventory, history, updateItem, deleteItem, saveInventoryItem, exportData, importData, onBack }) {
  const fileInputRef = useRef(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  // NEW: State for mobile accordions (Inventory open by default)
  const [openSection, setOpenSection] = useState('inventory'); // 'analytics', 'history', or 'inventory'

  const totalRevenue = history.reduce((sum, txn) => sum + txn.total, 0);

  const formatItemsSold = (itemsArray) => {
    const counts = itemsArray.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, qty]) => `${qty}x ${name}`).join(', ');
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) return;
    saveInventoryItem({
      id: Date.now().toString(),
      name: newName,
      price: parseFloat(newPrice),
      stock: parseInt(newStock),
      barcode: "" 
    }, false); 
    setNewName(''); setNewPrice(''); setNewStock(''); setIsAdding(false); 
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importData(event.target.result);
      if (success) alert("Backup restored successfully!");
      else alert("Error: Invalid backup file.");
      e.target.value = null; 
    };
    reader.readAsText(file);
  };

  // Helper component for mobile accordion headers
  const SectionHeader = ({ id, title, badge }) => (
    <div 
      onClick={() => setOpenSection(openSection === id ? null : id)}
      className="lg:hidden bg-white p-4 border-b border-gray-200 flex justify-between items-center font-bold text-gray-800 active:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        {title}
        {badge && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{badge}</span>}
      </div>
      {openSection === id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
    </div>
  );

  return (
    // FIX 2: h-[100dvh] for mobile dashboard
    <div className="h-[100dvh] w-full bg-gray-50 flex flex-col overflow-hidden absolute inset-0 z-40">
      
      {/* Top Navigation Bar */}
      <div className="bg-gray-900 text-white p-4 flex flex-wrap items-center justify-between shadow-md gap-3 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline sm:ml-2">Register</span>
          </button>
          <h1 className="text-lg sm:text-xl font-black tracking-widest uppercase text-gray-300 truncate">Dashboard</h1>
        </div>

        <div className="flex gap-2">
          <button onClick={exportData} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 sm:px-4 py-2 rounded-lg font-bold transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-3 sm:px-4 py-2 rounded-lg font-bold transition-colors">
            <Upload size={18} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {/* Main Content Area - Scrollable on mobile, split on desktop */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row lg:p-6 lg:gap-6 bg-gray-100 lg:bg-transparent">
        
        {/* LEFT/TOP COLUMN: Analytics & History */}
        <div className="w-full lg:w-1/3 flex flex-col lg:gap-6">
          
          <SectionHeader id="analytics" title="Analytics Overview" />
          <div className={`${openSection === 'analytics' ? 'block' : 'hidden'} lg:block bg-white lg:rounded-2xl p-6 shadow-sm border-b lg:border border-gray-200`}>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Revenue</h2>
            <div className="text-5xl lg:text-6xl font-black text-green-600">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-500 font-medium mt-2">{history.length} Transactions Today</div>
          </div>

          <SectionHeader id="history" title="Transaction Log" />
          <div className={`${openSection === 'history' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-white lg:rounded-2xl shadow-sm border-b lg:border border-gray-200 overflow-hidden min-h-[300px]`}>
            <div className="hidden lg:block p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">Recent Transactions</div>
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
                    <div className="text-sm text-gray-500 mt-1">{formatItemsSold(txn.itemsSold)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT/BOTTOM COLUMN: Inventory Management */}
        <div className="w-full lg:w-2/3 flex flex-col flex-1 pb-10 lg:pb-0">
          
          <SectionHeader id="inventory" title="Live Inventory" badge={inventory.length} />
          
          <div className={`${openSection === 'inventory' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-white lg:rounded-2xl shadow-sm border-b lg:border border-gray-200 overflow-hidden`}>
            
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="hidden lg:flex items-center gap-3">
                <span className="font-bold text-gray-700">Inventory Management</span>
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{inventory.length} Items</span>
              </div>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`w-full sm:w-auto flex justify-center items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${isAdding ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-gray-800'}`}
              >
                {isAdding ? 'Cancel Manual Entry' : <><Plus size={16}/> Add New Item</>}
              </button>
            </div>
            
            {isAdding && (
              <form onSubmit={handleAddItem} className="bg-blue-50/50 p-4 border-b border-blue-100 flex flex-col sm:flex-row gap-4 sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Item Name</label>
                  <input required autoFocus value={newName} onChange={e=>setNewName(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white" placeholder="e.g., Pretzel" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 sm:w-32">
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Price ($)</label>
                    <input required type="number" step="0.01" min="0" value={newPrice} onChange={e=>setNewPrice(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white" placeholder="0.00" />
                  </div>
                  <div className="flex-1 sm:w-32">
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Stock Qty</label>
                    <input required type="number" min="0" value={newStock} onChange={e=>setNewStock(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white" placeholder="0" />
                  </div>
                </div>
                <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-6 py-2 rounded-lg h-[44px] hover:bg-blue-700 transition-all shadow-sm">
                  Save
                </button>
              </form>
            )}

            {/* Mobile Card View / Desktop Table View */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 lg:bg-white">
              
              {/* DESKTOP TABLE (Hidden on mobile) */}
              <table className="hidden lg:table w-full text-left border-collapse">
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
                        <input type="number" step="0.01" value={item.price} onChange={(e) => updateItem({ ...item, price: parseFloat(e.target.value) || 0 })} className="w-24 border border-gray-300 rounded-lg p-2 text-center focus:border-blue-500 outline-none"/>
                      </td>
                      <td className="py-4">
                        <input type="number" value={item.stock} onChange={(e) => updateItem({ ...item, stock: parseInt(e.target.value) || 0 })} className={`w-24 border rounded-lg p-2 text-center font-bold outline-none focus:border-blue-500 ${item.stock <= 0 ? 'bg-red-50 text-red-600 border-red-200' : 'border-gray-300'}`}/>
                      </td>
                      <td className="py-4 text-center">
                        <button onClick={() => { if(window.confirm(`Delete ${item.name}?`)) deleteItem(item.id); }} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* MOBILE CARDS (Hidden on desktop) */}
              <div className="lg:hidden flex flex-col gap-4">
                {inventory.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-bold text-gray-800 text-lg">{item.name}</div>
                      <button onClick={() => { if(window.confirm(`Delete ${item.name}?`)) deleteItem(item.id); }} className="text-red-400 p-1">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Price</label>
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">$</span>
                          <input type="number" step="0.01" value={item.price} onChange={(e) => updateItem({ ...item, price: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg p-2 font-medium focus:border-blue-500 outline-none"/>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Stock</label>
                        <input type="number" value={item.stock} onChange={(e) => updateItem({ ...item, stock: parseInt(e.target.value) || 0 })} className={`w-full border rounded-lg p-2 font-bold focus:border-blue-500 outline-none ${item.stock <= 0 ? 'bg-red-50 text-red-600 border-red-200' : 'border-gray-300'}`}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}