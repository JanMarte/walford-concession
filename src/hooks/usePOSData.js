import { useState, useEffect } from 'react';

// The starter pack!
const DEFAULT_INVENTORY = [
  { id: '1', name: "Hot Dog", price: 3.00, stock: 40, barcode: "" },
  { id: '2', name: "Nachos & Cheese", price: 4.00, stock: 25, barcode: "" },
  { id: '3', name: "Gatorade (Red)", price: 2.50, stock: 24, barcode: "" },
  { id: '4', name: "Gatorade (Blue)", price: 2.50, stock: 24, barcode: "" },
  { id: '5', name: "Sunflower Seeds", price: 2.00, stock: 30, barcode: "" },
  { id: '6', name: "Ring Pop", price: 1.00, stock: 50, barcode: "" },
];

export function usePOSData() {
  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedInventory = localStorage.getItem('pos_inventory');
    const savedHistory = localStorage.getItem('pos_history');

    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      setInventory(DEFAULT_INVENTORY);
      localStorage.setItem('pos_inventory', JSON.stringify(DEFAULT_INVENTORY));
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const confirmTransaction = (cartItems, cartTotal) => {
    const updatedInventory = inventory.map(item => {
      const amountInCart = cartItems.filter(cartItem => cartItem.id === item.id).length;
      return {
        ...item,
        stock: item.stock - amountInCart
      };
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
      updatedInventory = inventory.map(item => 
        item.id === newItem.id ? newItem : item
      );
    } else {
      updatedInventory = [...inventory, newItem];
    }

    setInventory(updatedInventory);
    localStorage.setItem('pos_inventory', JSON.stringify(updatedInventory));
  };

  const updateItem = (updatedItem) => {
    const newInventory = inventory.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    setInventory(newInventory);
    localStorage.setItem('pos_inventory', JSON.stringify(newInventory));
  };

  const deleteItem = (itemId) => {
    const newInventory = inventory.filter(item => item.id !== itemId);
    setInventory(newInventory);
    localStorage.setItem('pos_inventory', JSON.stringify(newInventory));
  };

  const exportData = () => {
    const data = {
      inventory: inventory,
      history: history
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `concession-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonString) => {
    try {
      const parsedData = JSON.parse(jsonString);
      
      if (parsedData.inventory && parsedData.history) {
        setInventory(parsedData.inventory);
        setHistory(parsedData.history);
        
        localStorage.setItem('pos_inventory', JSON.stringify(parsedData.inventory));
        localStorage.setItem('pos_history', JSON.stringify(parsedData.history));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to parse backup file", error);
      return false; 
    }
  };

  return { 
    inventory, 
    history, 
    confirmTransaction, 
    saveInventoryItem, 
    updateItem, 
    deleteItem,
    exportData,
    importData
  };
}