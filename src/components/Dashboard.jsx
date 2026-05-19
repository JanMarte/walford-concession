import React, { useState, useRef } from 'react';
import { ArrowLeft, Trash2, Plus, Download, Upload, ChevronDown, ChevronUp, Archive } from 'lucide-react';

export default function Dashboard({ inventory, history, archives, updateItem, deleteItem, saveInventoryItem, exportData, importData, onBack, deleteTransaction, removeTransactionItem, archiveCurrentShift }) {
  const fileInputRef = useRef(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newCategory, setNewCategory] = useState('Snacks');

  const [openSection, setOpenSection] = useState('analytics'); // Open analytics by default now

  const totalRevenue = history.reduce((sum, txn) => sum + txn.total, 0);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newName || !newPrice || !newStock) return;
    saveInventoryItem({
      id: Date.now().toString(),
      name: newName,
      price: parseFloat(newPrice),
      stock: parseInt(newStock),
      category: newCategory,
      barcode: "" 
    }, false); 
    setNewName(''); setNewPrice(''); setNewStock(''); setNewCategory('Snacks'); setIsAdding(false); 
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

  const handleEndShift = () => {
    if (history.length === 0) {
      alert("No transactions to archive yet!");
      return;
    }
    if (window.confirm("Are you sure you want to end this shift? This will move today's sales into the archive and reset the live dashboard to $0.00. Inventory levels will NOT be changed.")) {
      archiveCurrentShift();
      alert("Shift archived successfully!");
    }
  };

  const SectionHeader = ({ id, title, badge }) => (
    <div onClick={() => setOpenSection(openSection === id ? null : id)} className="lg:hidden bg-white p-4 border-b border-gray-200 flex justify-between items-center font-bold text-gray-800 active:bg-gray-50">
      <div className="flex items-center gap-3">
        {title}
        {badge !== undefined && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{badge}</span>}
      </div>
      {openSection === id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
    </div>
  );

  const itemSales = history.reduce((acc, txn) => {
    txn.itemsSold.forEach(name => { acc[name] = (acc[name] || 0) + 1; });
    return acc;
  }, {});
  const sortedSales = Object.entries(itemSales).sort((a, b) => b[1] - a[1]);
  const maxSales = sortedSales.length > 0 ? sortedSales[0][1] : 1;

  return (
    <div className="h-[100dvh] w-full bg-gray-50 flex flex-col overflow-hidden absolute inset-0 z-40">
      
      <div className="bg-gray-900 text-white p-4 flex flex-wrap items-center justify-between shadow-md gap-3 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center justify-center h-10 w-10 sm:w-auto sm:px-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold transition-colors">
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

      <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row lg:p-6 lg:gap-6 bg-gray-100 lg:bg-transparent">
        
        {/* LEFT COLUMN: Analytics & Archives */}
        <div className="w-full lg:w-1/3 flex flex-col lg:gap-6">
          <SectionHeader id="analytics" title="Live Analytics Overview" />
          <div className={`${openSection === 'analytics' ? 'block' : 'hidden'} lg:block bg-white lg:rounded-2xl p-6 shadow-sm border-b lg:border border-gray-200`}>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Shift Revenue</h2>
              <button 
                onClick={handleEndShift}
                className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Archive size={14} /> End Shift
              </button>
            </div>
            <div className="text-5xl lg:text-6xl font-black text-green-600">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-500 font-medium mt-2">{history.length} Transactions Active</div>
            
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Item Sales</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {sortedSales.length === 0 ? <div className="text-sm text-gray-400">No items sold yet.</div> : null}
                {sortedSales.map(([name, qty]) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-24 text-xs font-bold text-gray-700 truncate">{name}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(qty / maxSales) * 100}%` }}></div>
                    </div>
                    <div className="w-8 text-right text-xs font-bold text-gray-500">{qty}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <SectionHeader id="archives" title="Past Shifts" badge={archives.length} />
          <div className={`${openSection === 'archives' ? 'block' : 'hidden'} lg:block bg-white lg:rounded-2xl shadow-sm border-b lg:border border-gray-200 p-6 overflow-y-auto lg:max-h-[300px]`}>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 hidden lg:block">Archived Data</h2>
            {archives.length === 0 ? (
              <div className="text-gray-400 text-sm text-center mt-4">No past shifts archived.</div>
            ) : (
              <div className="space-y-4">
                {[...archives].reverse().map(archive => (
                  <div key={archive.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-gray-800">{archive.date}</div>
                      <div className="font-black text-green-600">${archive.revenue.toFixed(2)}</div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">{archive.transactionCount} Transactions</div>
                    <details className="text-xs text-gray-600">
                      <summary className="font-bold cursor-pointer outline-none text-blue-600">View Items Sold</summary>
                      <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-200">
                        {Object.entries(archive.itemsSold).map(([name, qty]) => (
                          <div key={name} className="flex justify-between">
                            <span>{name}</span>
                            <span className="font-bold">{qty}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE/RIGHT COLUMNS: Logs and Inventory */}
        <div className="w-full lg:w-2/3 flex flex-col flex-1 pb-10 lg:pb-0 gap-6">
          
          {/* History Log Section */}
          <SectionHeader id="history" title="Active Transaction Log" />
          <div className={`${openSection === 'history' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-white lg:rounded-2xl shadow-sm border-b lg:border border-gray-200 overflow-hidden min-h-[250px]`}>
            <div className="hidden lg:block p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700">Active Transactions</div>
            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="text-gray-400 text-center mt-10">No sales yet for this shift.</div>
              ) : (
                [...history].reverse().map(txn => {
                  const itemCounts = txn.itemsSold.reduce((acc, name) => {
                    acc[name] = (acc[name] || 0) + 1; return acc;
                  }, {});

                  return (
                    <div key={txn.id} className="border-b border-gray-200 last:border-0 py-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between font-black text-gray-800 text-lg">
                            <span>Order #{txn.id.slice(-4)}</span>
                            <span className="text-green-600">${txn.total.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 font-bold">{txn.time}</div>
                          
                          <div className="mt-3 space-y-2">
                            {Object.entries(itemCounts).map(([name, qty]) => (
                              <div key={name} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="font-medium text-gray-700 text-sm">{qty}x {name}</span>
                                <button onClick={() => { if(window.confirm(`Refund 1 ${name} from Order #${txn.id.slice(-4)}?`)) removeTransactionItem(txn.id, name); }} className="text-orange-600 bg-orange-100 px-3 py-1 rounded-md text-xs font-bold hover:bg-orange-200 transition-colors">
                                  Refund 1
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-right">
                        <button onClick={() => { if(window.confirm(`VOID ENTIRE ORDER #${txn.id.slice(-4)}? All items will return to stock.`)) deleteTransaction(txn.id); }} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider underline">
                          Void Entire Order
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Inventory Management Section */}
          <SectionHeader id="inventory" title="Live Inventory" badge={inventory.length} />
          <div className={`${openSection === 'inventory' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-white lg:rounded-2xl shadow-sm border-b lg:border border-gray-200 overflow-hidden`}>
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="hidden lg:flex items-center gap-3">
                <span className="font-bold text-gray-700">Inventory Management</span>
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{inventory.length} Items</span>
              </div>
              <button onClick={() => setIsAdding(!isAdding)} className={`w-full sm:w-auto flex justify-center items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors ${isAdding ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-gray-800'}`}>
                {isAdding ? 'Cancel Manual Entry' : <><Plus size={16}/> Add New Item</>}
              </button>
            </div>
            
            {isAdding && (
              <form onSubmit={handleAddItem} className="bg-blue-50/50 p-4 border-b border-blue-100 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Item Name</label>
                    <input required autoFocus value={newName} onChange={e=>setNewName(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white" placeholder="e.g., Pretzel" />
                  </div>
                  <div className="w-full sm:w-40">
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Category</label>
                    <select value={newCategory} onChange={e=>setNewCategory(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white font-bold text-gray-700">
                      <option value="Snacks">Snacks</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Sweets">Sweets</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                  <div className="flex-1 sm:w-32">
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Price ($)</label>
                    <input required type="number" step="0.01" min="0" value={newPrice} onChange={e=>setNewPrice(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white" placeholder="0.00" />
                  </div>
                  <div className="flex-1 sm:w-32">
                    <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Stock Qty</label>
                    <input required type="number" min="0" value={newStock} onChange={e=>setNewStock(e.target.value)} className="w-full border-2 border-blue-200 focus:border-blue-500 outline-none p-2 rounded-lg bg-white" placeholder="0" />
                  </div>
                  <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-2 rounded-lg h-[44px] hover:bg-blue-700 transition-all shadow-sm">
                    Save Item
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 lg:bg-white">
              <table className="hidden lg:table w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase text-gray-400 border-b-2 border-gray-100">
                    <th className="pb-3 font-bold w-1/3">Item Name</th>
                    <th className="pb-3 font-bold">Category</th>
                    <th className="pb-3 font-bold">Price ($)</th>
                    <th className="pb-3 font-bold">Stock</th>
                    <th className="pb-3 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-bold text-gray-800">{item.name}</td>
                      <td className="py-4">
                        <select value={item.category || 'Snacks'} onChange={(e) => updateItem({ ...item, category: e.target.value })} className="border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 outline-none bg-white font-bold text-gray-600">
                          <option value="Snacks">Snacks</option>
                          <option value="Drinks">Drinks</option>
                          <option value="Sweets">Sweets</option>
                        </select>
                      </td>
                      <td className="py-4"><input type="number" step="0.01" value={item.price} onChange={(e) => updateItem({ ...item, price: parseFloat(e.target.value) || 0 })} className="w-20 border border-gray-300 rounded-lg p-2 text-center focus:border-blue-500 outline-none"/></td>
                      <td className="py-4"><input type="number" value={item.stock} onChange={(e) => updateItem({ ...item, stock: parseInt(e.target.value) || 0 })} className={`w-20 border rounded-lg p-2 text-center font-bold outline-none focus:border-blue-500 ${item.stock <= 0 ? 'bg-red-50 text-red-600 border-red-200' : 'border-gray-300'}`}/></td>
                      <td className="py-4 text-center"><button onClick={() => { if(window.confirm(`Delete ${item.name}?`)) deleteItem(item.id); }} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={20} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="lg:hidden flex flex-col gap-4">
                {inventory.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-bold text-gray-800 text-lg">{item.name}</div>
                      <button onClick={() => { if(window.confirm(`Delete ${item.name}?`)) deleteItem(item.id); }} className="text-red-400 p-1"><Trash2 size={20} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Category</label><select value={item.category || 'Snacks'} onChange={(e) => updateItem({ ...item, category: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2 text-sm font-bold text-gray-600 focus:border-blue-500 outline-none bg-white"><option value="Snacks">Snacks</option><option value="Drinks">Drinks</option><option value="Sweets">Sweets</option></select></div>
                      <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Price</label><input type="number" step="0.01" value={item.price} onChange={(e) => updateItem({ ...item, price: parseFloat(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg p-2 font-medium focus:border-blue-500 outline-none"/></div>
                      <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Stock</label><input type="number" value={item.stock} onChange={(e) => updateItem({ ...item, stock: parseInt(e.target.value) || 0 })} className={`w-full border rounded-lg p-2 font-bold focus:border-blue-500 outline-none ${item.stock <= 0 ? 'bg-red-50 text-red-600 border-red-200' : 'border-gray-300'}`}/></div>
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