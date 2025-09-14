import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  category: string;
  region: string;
  featured_image?: string;
  seller: {
    id: string;
    display_name: string;
  };
}

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: Product;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist items
  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist') // FIXED: Changed from 'wishlists' to 'wishlist'
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          product:products (
            id,
            title,
            price,
            original_price,
            category,
            region,
            featured_image,
            seller:sellers (
              id,
              display_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist:', error);
      } else {
        setWishlistItems(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlist') // FIXED: Changed from 'wishlists' to 'wishlist'
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('Item already in wishlist');
        } else {
          throw error;
        }
      } else {
        toast.success('Added to wishlist! 💖');
        fetchWishlist(); // Refresh wishlist
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist') // FIXED: Changed from 'wishlists' to 'wishlist'
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        throw error;
      }

      toast.success('Removed from wishlist');
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
