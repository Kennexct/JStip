import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/supabase';
import { toast } from 'sonner';

export interface MasterContextType {
  loading: boolean;
  expenses: any[];
  sales: any[];
  catalogItems: any[];
  wishlistItems: any[];
  tripSettings: any;
  refreshData: () => Promise<void>;
  saveSettings: (settings: any) => Promise<void>;
  saveItem: (item: any) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  saveWishlist: (item: any) => Promise<void>;
  saveSale: (sale: any) => Promise<void>;
  saveExpense: (expense: any) => Promise<void>;
}

const MasterContext = createContext<MasterContextType | undefined>(undefined);

export function MasterProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [tripSettings, setTripSettings] = useState<any>({
    trip: { origin: 'Seoul', destination: 'Jakarta', weightLimit: 15, date: '22 May 2026' },
    currency: { code: 'SGD', symbol: 'S$', manualRate: 13500 }
  });

  const refreshData = async () => {
    try {
      const [loadedExpenses, loadedSales, loadedItems, loadedWishlist, loadedSettings] = await Promise.all([
        db.getExpenses(),
        db.getSales(),
        db.getItems(),
        db.getWishlist(),
        db.getSettings()
      ]);
      setExpenses(loadedExpenses || []);
      setSales(loadedSales || []);
      setCatalogItems(loadedItems || []);
      setWishlistItems(loadedWishlist || []);
      if (loadedSettings) {
        setTripSettings(loadedSettings);
      }
    } catch (e) {
      console.error('Failed to reload master dashboard data:', e);
      toast.error('Failed to sync live data with database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const saveSettings = async (data: any) => {
    try {
      await db.saveSettings(data);
      setTripSettings(data);
    } catch (e) {
      toast.error('Failed to save settings');
      throw e;
    }
  };

  const saveItem = async (item: any) => {
    try {
      await db.saveItem(item);
      const isEdit = catalogItems.some(i => i.id === item.id);
      if (isEdit) {
        setCatalogItems(catalogItems.map(i => i.id === item.id ? item : i));
      } else {
        setCatalogItems([item, ...catalogItems]);
      }
    } catch (e) {
      toast.error('Failed to save catalog item');
      throw e;
    }
  };

  const removeItem = async (id: string) => {
    try {
      await db.removeItem(id);
      setCatalogItems(catalogItems.filter(i => i.id !== id));
    } catch (e) {
      toast.error('Failed to delete catalog item');
      throw e;
    }
  };

  const saveWishlist = async (item: any) => {
    try {
      await db.saveWishlist(item);
      const isEdit = wishlistItems.some(w => w.id === item.id);
      if (isEdit) {
        setWishlistItems(wishlistItems.map(w => w.id === item.id ? item : w));
      } else {
        setWishlistItems([item, ...wishlistItems]);
      }
    } catch (e) {
      toast.error('Failed to save wishlist item');
      throw e;
    }
  };

  const saveSale = async (sale: any) => {
    try {
      await db.saveSale(sale);
      setSales([sale, ...sales]);
    } catch (e) {
      toast.error('Failed to log sale');
      throw e;
    }
  };

  const saveExpense = async (expense: any) => {
    try {
      await db.saveExpense(expense);
      setExpenses([expense, ...expenses]);
    } catch (e) {
      toast.error('Failed to save expense');
      throw e;
    }
  };

  return (
    <MasterContext.Provider
      value={{
        loading,
        expenses,
        sales,
        catalogItems,
        wishlistItems,
        tripSettings,
        refreshData,
        saveSettings,
        saveItem,
        removeItem,
        saveWishlist,
        saveSale,
        saveExpense
      }}
    >
      {children}
    </MasterContext.Provider>
  );
}

export function useMaster() {
  const context = useContext(MasterContext);
  if (!context) {
    throw new Error('useMaster must be used within a MasterProvider');
  }
  return context;
}
