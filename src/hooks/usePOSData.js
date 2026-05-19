import { useState, useEffect } from 'react';

const DEFAULT_INVENTORY = [
  { id: '1', name: "Hot Dog", price: 3.00, stock: 40, barcode: "", category: "Snacks" },
  { id: '2', name: "Nachos & Cheese", price: 4.00, stock: 25, barcode: "", category: "Snacks" },
  { id: '3', name: "Gatorade (Red)", price: 2.50, stock: 24, barcode: "", category: "Drinks" },
  { id: '4', name: "Gatorade (Blue)", price: 2.50, stock: 24, barcode: "", category: "Drinks" },
  { id: '5', name: "Sunflower Seeds", price: 2.00, stock: 30, barcode: "", category: "Snacks" },
  { id: '6', name: "Ring Pop", price: 1.00, stock: 50, barcode: "", category: "Sweets" },
];

// Helper to auto-migrate old items that didn't have a category saved
const guessCategory = (itemName) => {
  const name = itemName.toLowerCase();
  if (name.match(/gatorade|water|soda|coke|sprite|drink|juice|punch/)) return 'Drinks';
  if (name.match(/ring pop|candy|skittles|chocolate|cookie|sweet|m&m|snickers/)) return 'Sweets';
  return 'Snacks'; 
};

export function usePOSData() {
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedInventory = localStorage.getItem('pos_inventory');
    const savedHistory = localStorage.getItem('pos_history');

    if (savedInventory) {
      // Auto-migrate old data to have the new category field
      const parsed = JSON.parse(savedInventory);
      const migrated = parsed.map(item => ({
        ...item,
        category: item.category || guessCategory(item.name)
      }));
      setInventory(migrated);
      localStorage.setItem('pos_inventory', JSON.stringify(migrated)); // Save migration
    } else {
      setInventory(DEFAULT_INVENTORY);
      localStorage.setItem('pos_inventory', JSON.stringify(DEFAULT_INVENTORY));
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const deleteTransaction = (transactionId) => {
    const txnToDelete = history.find(t => t.id === transactionId);
    if (!txnToDelete) return;

    const itemsToRestock = txnToDelete.itemsSold.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1; return acc;
    }, {});

    const updatedInventory = inventory.map(item => {
      if (itemsToRestock[item.name]) {
        return { ...item, stock: item.stock + itemsToRestock[item.name] };
      }
      return item;
    });

    const updatedHistory = history.filter(t => t.id !== transactionId);

    setInventory(updatedInventory);
    setHistory(updatedHistory);
    localStorage.setItem('pos_inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('pos_history', JSON.stringify(updatedHistory));
  };

  // NEW: Remove a single item from a transaction
  const removeTransactionItem = (transactionId, itemNameToRemove) => {
    const txnIndex = history.findIndex(t => t.id === transactionId);
    if (txnIndex === -1) return;

    const txn = { ...history[txnIndex] };
    const itemIndex = txn.itemsSold.indexOf(itemNameToRemove);
    if (itemIndex === -1) return;

    // Find the current price to deduct
    const currentItem = inventory.find(i => i.name === itemNameToRemove);
    const priceToDeduct = currentItem ? currentItem.price : 0;

    // Remove 1 instance of the item and deduct total
    txn.itemsSold.splice(itemIndex, 1);
    txn.total = Math.max(0, txn.total - priceToDeduct);

    let updatedHistory;
    if (txn.itemsSold.length === 0) {
      updatedHistory = history.filter(t => t.id !== transactionId); // Delete if empty
    } else {
      updatedHistory = [...history];
      updatedHistory[txnIndex] = txn;
    }

    // Restock the item
    const updatedInventory = inventory.map(item => {
      if (item.name === itemNameToRemove) {
        return { ...item, stock: item.stock + 1 };
      }
      return item;
    });

    setInventory(updatedInventory);
    setHistory(updatedHistory);
    localStorage.setItem('pos_inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('pos_history', JSON.stringify(updatedHistory));
  };

  const confirmTransaction = (cartItems, cartTotal) => {
    const updatedInventory = inventory.map(item => {
      const amountInCart = cartItems.filter(cartItem => cartItem.id === item.id).length;
      return { ...item, stock: item.stock - amountInCart };
    });

    const newTransaction = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      total: cartTotal,
      itemsSold: cartItems.map(item => item.name)
    };
    
    const updatedHistory = [...history, newTransaction];

    setInventory(updatedInventory);
    setHistory(updatedHistory);
    localStorage.setItem('pos_inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('pos_history', JSON.stringify(updatedHistory));
  };

  const saveInventoryItem = (newItem, isRestock) => {
    let updatedInventory;
    if (isRestock) {
      updatedInventory = inventory.map(item => item.id === newItem.id ? newItem : item);
    } else {
      updatedInventory = [...inventory, newItem];
    }
    setInventory(updatedInventory);
    localStorage.setItem('pos_inventory', JSON.stringify(updatedInventory));
  };

  const updateItem = (updatedItem) => {
    const newInventory = inventory.map(item => item.id === updatedItem.id ? updatedItem : item);
    setInventory(newInventory);
    localStorage.setItem('pos_inventory', JSON.stringify(newInventory));
  };

  const deleteItem = (itemId) => {
    const newInventory = inventory.filter(item => item.id !== itemId);
    setInventory(newInventory);
    localStorage.setItem('pos_inventory', JSON.stringify(newInventory));
  };

  const exportData = () => { /* ... existing export ... */ };
  const importData = (jsonString) => { /* ... existing import ... */ };

  return { 
    inventory, history, confirmTransaction, saveInventoryItem, updateItem, 
    deleteItem, exportData, importData, deleteTransaction, removeTransactionItem
  };
}