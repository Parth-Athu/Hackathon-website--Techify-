import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  category: string;
  region: string;
  featured_image?: string;
  description?: string;
  tags?: string;
  status: string;
  seller: {
    id: string;
    display_name: string;
  };
}

interface ProductContextType {
  products: Product[];
  refreshProducts: () => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          original_price,
          category,
          region,
          featured_image,
          description,
          tags,
          status,
          seller:sellers (
            id,
            display_name
          )
        `)
        .eq('status', 'active') // Only fetch active products
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    await fetchProducts();
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === productId ? { ...product, ...updates } : product
    ));
  };

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  useEffect(() => {
    fetchProducts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'DELETE') {
            removeProduct(payload.old.id);
          } else if (payload.eventType === 'UPDATE') {
            // Refresh to get updated data with seller info
            refreshProducts();
          } else if (payload.eventType === 'INSERT') {
            // Refresh to get new product with seller info
            refreshProducts();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ProductContext.Provider value={{
      products,
      refreshProducts,
      updateProduct,
      removeProduct,
      loading
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
