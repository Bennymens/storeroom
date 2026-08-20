import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_STOREROOMS,
  INITIAL_CATEGORIES,
  INITIAL_ITEMS,
  INITIAL_REQUISITIONS,
  INITIAL_MOVEMENTS
} from '../data/initialData';

const InventoryContext = createContext();

const STORAGE_KEYS = {
  ITEMS: 'storehub_items_v4',
  CATEGORIES: 'storehub_categories_v4',
  REQUISITIONS: 'storehub_requisitions_v4',
  MOVEMENTS: 'storehub_movements_v4',
  CART: 'storehub_req_cart_v4',
  STOREROOM: 'storehub_active_storeroom_v4'
};

export const InventoryProvider = ({ children }) => {
  // 1. Items
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load items from storage:', e);
    }
    return INITIAL_ITEMS;
  });

  // 2. Categories
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
    return INITIAL_CATEGORIES;
  });

  // 3. Requisitions
  const [requisitions, setRequisitions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUISITIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter(r => r.id !== 'REQ-2026-001' && r.id !== 'REQ-2026-002');
      }
    } catch (e) {
      console.error('Failed to load requisitions:', e);
    }
    return INITIAL_REQUISITIONS;
  });

  // 4. Stock Movements & Audit Logs
  const [movements, setMovements] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load movements:', e);
    }
    return INITIAL_MOVEMENTS;
  });

  // 5. Requisition Cart Drawer State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
    return [];
  });

  // 6. Active Filtered Storeroom
  const [activeStoreroomId, setActiveStoreroomId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.STOREROOM) || 'all';
    } catch (e) {
      return 'all';
    }
  });

  // 7. Global Toast Notification System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUISITIONS, JSON.stringify(requisitions));
    } catch (e) {
      console.error(e);
    }
  }, [requisitions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.error(e);
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STOREROOM, activeStoreroomId);
    } catch (e) {
      console.error(e);
    }
  }, [activeStoreroomId]);

  // Helper to compute item stock status
  const calculateStatus = (qty, threshold) => {
    if (qty <= 0) return 'Out of Stock';
    if (qty <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  // --- ACTIONS ---

  // 1. Stock Adjustment (+/- delta)
  const adjustStock = (itemId, delta, reason = 'Quick Adjustment', staffName = 'Current User') => {
    let updatedItem = null;
    let oldQty = 0;
    let newQty = 0;

    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          oldQty = Number(item.quantity) || 0;
          newQty = Math.max(0, oldQty + Number(delta));
          const updated = {
            ...item,
            quantity: newQty,
            status: calculateStatus(newQty, item.minThreshold || 5),
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          updatedItem = updated;
          return updated;
        }
        return item;
      });
    });

    if (updatedItem) {
      const isIncrease = delta > 0;
      const movementType = isIncrease ? 'STOCK_IN' : 'STOCK_OUT';

      const newMovement = {
        id: `MOV-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        itemId: updatedItem.id,
        itemName: updatedItem.name,
        storeroomId: updatedItem.storeroomId,
        type: movementType,
        quantityChange: delta,
        previousQuantity: oldQty,
        newQuantity: newQty,
        reason: reason || (isIncrease ? 'Stock replenishment' : 'Stock dispatch'),
        performedBy: staffName || 'Admin'
      };

      setMovements(prev => [newMovement, ...prev]);

      addToast(
        `${delta > 0 ? '+' : ''}${delta} ${updatedItem.unit || 'units'} applied to "${updatedItem.name}" (Now: ${newQty})`,
        delta > 0 ? 'success' : 'info'
      );
    }
  };

  // 2. Set Exact Stock
  const setExactStock = (itemId, exactQty, reason = 'Audit Correction', staffName = 'Current User') => {
    let target = items.find(i => i.id === itemId);
    if (!target) return;

    const oldQty = Number(target.quantity) || 0;
    const cleanQty = Math.max(0, Number(exactQty));
    const delta = cleanQty - oldQty;

    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: cleanQty,
            status: calculateStatus(cleanQty, item.minThreshold || 5),
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      })
    );

    const newMovement = {
      id: `MOV-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      itemId: target.id,
      itemName: target.name,
      storeroomId: target.storeroomId,
      type: 'ADJUSTMENT',
      quantityChange: delta,
      previousQuantity: oldQty,
      newQuantity: cleanQty,
      reason: reason || 'Inventory Audit Correction',
      performedBy: staffName
    };

    setMovements(prev => [newMovement, ...prev]);
    addToast(`Updated stock count for "${target.name}" to ${cleanQty}`, 'success');
  };

  // 3. Add Item
  const addItem = (itemData) => {
    const storeroomCode = itemData.storeroomId || 'aud';
    const newId = `${storeroomCode}-${Date.now().toString().slice(-5)}`;
    const qty = Number(itemData.quantity) || 0;
    const minThreshold = Number(itemData.minThreshold) || 5;

    const newItem = {
      id: newId,
      name: itemData.name.trim(),
      category: itemData.category || 'General',
      storeroomId: itemData.storeroomId || 'aud',
      packageDetail: itemData.packageDetail || '',
      quantity: qty,
      unit: itemData.unit || 'pieces',
      minThreshold: minThreshold,
      locationRack: itemData.locationRack || 'General Shelf',
      status: calculateStatus(qty, minThreshold),
      isFeatured: !!itemData.isFeatured,
      costPerUnit: Number(itemData.costPerUnit) || 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: itemData.notes || ''
    };

    // Auto-add new category if unique
    if (newItem.category && !categories.includes(newItem.category)) {
      setCategories(prev => [...prev, newItem.category].sort());
    }

    setItems(prev => [newItem, ...prev]);

    // Record creation movement
    const newMovement = {
      id: `MOV-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      itemId: newItem.id,
      itemName: newItem.name,
      storeroomId: newItem.storeroomId,
      type: 'ITEM_CREATED',
      quantityChange: qty,
      previousQuantity: 0,
      newQuantity: qty,
      reason: 'New inventory item registered',
      performedBy: itemData.createdByName || 'System Administrator'
    };

    setMovements(prev => [newMovement, ...prev]);
    addToast(`"${newItem.name}" added to inventory successfully!`, 'success');
    return newItem;
  };

  // 4. Update Item
  const updateItem = (itemId, updatedFields) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const qty = updatedFields.quantity !== undefined ? Number(updatedFields.quantity) : item.quantity;
          const minThreshold = updatedFields.minThreshold !== undefined ? Number(updatedFields.minThreshold) : item.minThreshold;
          
          return {
            ...item,
            ...updatedFields,
            quantity: qty,
            minThreshold: minThreshold,
            status: calculateStatus(qty, minThreshold),
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      })
    );

    if (updatedFields.category && !categories.includes(updatedFields.category)) {
      setCategories(prev => [...prev, updatedFields.category].sort());
    }

    addToast('Item details saved successfully', 'success');
  };

  // 5. Delete Item
  const deleteItem = (itemId) => {
    const target = items.find(i => i.id === itemId);
    if (!target) return;

    setItems(prev => prev.filter(i => i.id !== itemId));
    setCart(prev => prev.filter(c => c.id !== itemId));

    const newMovement = {
      id: `MOV-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      itemId: target.id,
      itemName: target.name,
      storeroomId: target.storeroomId,
      type: 'ITEM_DELETED',
      quantityChange: -target.quantity,
      previousQuantity: target.quantity,
      newQuantity: 0,
      reason: 'Item deleted from inventory catalog',
      performedBy: 'System Administrator'
    };

    setMovements(prev => [newMovement, ...prev]);
    addToast(`Item "${target.name}" removed from inventory`, 'info');
  };

  // 6. Cart Management for Requisitions
  const addToCart = (item, requestedQty = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        const newQty = existing.requestedQty + requestedQty;
        return prev.map(c => c.id === item.id ? { ...c, requestedQty: Math.min(newQty, item.quantity) } : c);
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        storeroomId: item.storeroomId,
        unit: item.unit || 'units',
        maxStock: item.quantity,
        requestedQty: Math.min(requestedQty, Math.max(1, item.quantity)),
        category: item.category,
        locationRack: item.locationRack
      }];
    });

    addToast(`Added "${item.name}" to Requisition Request`, 'success', 2000);
  };

  const updateCartQty = (itemId, qty) => {
    setCart(prev =>
      prev.map(c => {
        if (c.id === itemId) {
          const validQty = Math.max(1, Math.min(Number(qty) || 1, c.maxStock || 9999));
          return { ...c, requestedQty: validQty };
        }
        return c;
      })
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(c => c.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // 7. Submit Requisition
  const createRequisition = (formData) => {
    if (!cart || cart.length === 0) {
      addToast('Cannot submit empty requisition. Please add items.', 'error');
      return null;
    }

    const reqNumber = `REQ-2026-${(requisitions.length + 1).toString().padStart(3, '0')}`;
    const newReq = {
      id: reqNumber,
      requestorName: formData.requestorName.trim(),
      department: formData.department,
      phone: formData.phone || '',
      purpose: formData.purpose || '',
      dateNeeded: formData.dateNeeded || new Date().toISOString().split('T')[0],
      priority: formData.priority || 'Medium',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      approvedBy: null,
      notes: formData.notes || '',
      items: cart.map(c => ({
        itemId: c.id,
        itemName: c.name,
        storeroomId: c.storeroomId,
        quantityRequested: c.requestedQty,
        quantityApproved: c.requestedQty,
        unit: c.unit
      }))
    };

    setRequisitions(prev => [newReq, ...prev]);
    clearCart();
    addToast(`Requisition #${newReq.id} submitted successfully!`, 'success');
    return newReq;
  };

  // 8. Update Requisition Status
  const updateRequisitionStatus = (reqId, status, approverName = 'Store Manager', rejectionReason = '') => {
    setRequisitions(prev =>
      prev.map(req => {
        if (req.id === reqId) {
          return {
            ...req,
            status,
            approvedBy: status === 'Approved' || status === 'Fulfilled' ? (approverName || req.approvedBy || 'Store Lead') : req.approvedBy,
            rejectionReason: status === 'Rejected' ? rejectionReason : req.rejectionReason,
            updatedAt: new Date().toISOString()
          };
        }
        return req;
      })
    );

    addToast(`Requisition #${reqId} marked as ${status}`, 'info');
  };

  // 9. Fulfill / Issue Requisition (Deducts stock automatically & creates audit trails)
  const fulfillRequisition = (reqId, fulfillerName = 'Storeroom Custodian') => {
    const targetReq = requisitions.find(r => r.id === reqId);
    if (!targetReq) return;

    if (targetReq.status === 'Fulfilled') {
      addToast('Requisition is already fulfilled.', 'info');
      return;
    }

    // Process stock deductions
    const newMovementsToAdd = [];

    setItems(prevItems => {
      return prevItems.map(item => {
        const reqItem = targetReq.items.find(ri => ri.itemId === item.id);
        if (reqItem) {
          const issueQty = Number(reqItem.quantityApproved || reqItem.quantityRequested);
          const oldQty = Number(item.quantity);
          const newQty = Math.max(0, oldQty - issueQty);

          newMovementsToAdd.push({
            id: `MOV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random()*100)}`,
            timestamp: new Date().toISOString(),
            itemId: item.id,
            itemName: item.name,
            storeroomId: item.storeroomId,
            type: 'REQUISITION_ISSUE',
            quantityChange: -issueQty,
            previousQuantity: oldQty,
            newQuantity: newQty,
            reason: `Issued for Requisition ${targetReq.id} (${targetReq.department} - ${targetReq.requestorName})`,
            performedBy: fulfillerName
          });

          return {
            ...item,
            quantity: newQty,
            status: calculateStatus(newQty, item.minThreshold || 5),
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      });
    });

    if (newMovementsToAdd.length > 0) {
      setMovements(prev => [...newMovementsToAdd, ...prev]);
    }

    // Update Requisition Status to Fulfilled
    setRequisitions(prev =>
      prev.map(r => r.id === reqId ? {
        ...r,
        status: 'Fulfilled',
        fulfilledAt: new Date().toISOString(),
        fulfilledBy: fulfillerName
      } : r)
    );

    addToast(`Requisition #${reqId} fulfilled! Inventory stock updated.`, 'success');
  };

  // 10. Data Backup & Reset
  const resetToDefaultData = () => {
    setItems(INITIAL_ITEMS);
    setCategories(INITIAL_CATEGORIES);
    setRequisitions(INITIAL_REQUISITIONS);
    setMovements(INITIAL_MOVEMENTS);
    setCart([]);
    setActiveStoreroomId('all');

    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.REQUISITIONS);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.STOREROOM);

    addToast('Reset to original 2026 storeroom dataset!', 'info');
  };

  const importBackupData = (jsonObj) => {
    try {
      if (jsonObj.items && Array.isArray(jsonObj.items)) setItems(jsonObj.items);
      if (jsonObj.categories && Array.isArray(jsonObj.categories)) setCategories(jsonObj.categories);
      if (jsonObj.requisitions && Array.isArray(jsonObj.requisitions)) setRequisitions(jsonObj.requisitions);
      if (jsonObj.movements && Array.isArray(jsonObj.movements)) setMovements(jsonObj.movements);
      addToast('Backup imported successfully!', 'success');
      return true;
    } catch (e) {
      addToast('Failed to parse backup JSON', 'error');
      return false;
    }
  };

  const deleteRequisition = (reqId) => {
    setRequisitions(prev => prev.filter(r => r.id !== reqId));
    addToast(`Requisition #${reqId} removed`, 'info');
  };

  const clearAllRequisitions = () => {
    setRequisitions([]);
    localStorage.removeItem(STORAGE_KEYS.REQUISITIONS);
    addToast('All requisitions cleared.', 'info');
  };

  return (
    <InventoryContext.Provider
      value={{
        // State
        storerooms: INITIAL_STOREROOMS,
        activeStoreroomId,
        setActiveStoreroomId,
        items,
        categories,
        requisitions,
        movements,
        cart,
        toasts,

        // Actions
        adjustStock,
        setExactStock,
        addItem,
        updateItem,
        deleteItem,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        createRequisition,
        updateRequisitionStatus,
        fulfillRequisition,
        deleteRequisition,
        clearAllRequisitions,
        resetToDefaultData,
        importBackupData,
        addToast,
        removeToast
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
