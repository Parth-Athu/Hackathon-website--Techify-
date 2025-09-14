import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (productId: string, productTitle: string) => {
    try {
      await addToCart(productId);
      toast.success(`${productTitle} added to cart! 🛒`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading your wishlist...</div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length > 0 
              ? `${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'} in your wishlist` 
              : 'Your wishlist is empty'
            }
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Discover beautiful tribal art and save your favorites</p>
            <Link to="/shop">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <Package className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <Link to={`/product/${item.product.id}`}>
                    <div className="relative aspect-square bg-gray-100">
                      {item.product.featured_image ? (
                        <img
                          src={item.product.featured_image}
                          alt={item.product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <Package className="h-16 w-16 text-amber-400" />
                        </div>
                      )}

                      {/* Remove from wishlist button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromWishlist(item.product_id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>

                      {/* Category badge */}
                      <Badge className="absolute bottom-3 left-3 bg-orange-600 text-white">
                        {item.product.category}
                      </Badge>

                      {/* Discount badge */}
                      {item.product.original_price && item.product.original_price > item.product.price && (
                        <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                          {Math.round(((item.product.original_price - item.product.price) / item.product.original_price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2 hover:text-orange-600 transition-colors">
                        {item.product.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-600 mb-3">
                      by {item.product.seller.display_name} • {item.product.region}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xl font-bold text-gray-900">
                          ₹{item.product.price.toLocaleString()}
                        </div>
                        {item.product.original_price && item.product.original_price > item.product.price && (
                          <div className="text-sm text-gray-500 line-through">
                            ₹{item.product.original_price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(item.product.id, item.product.title)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => removeFromWishlist(item.product_id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
