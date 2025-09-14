import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditProductModal } from '@/components/seller/EditProductModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Eye,
  DollarSign,
  Package,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/contexts/ProductContext'; // Add this import
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  region: string;
  featured_image?: string;
  tags?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalViews: number;
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const { refreshProducts } = useProducts(); // Add this line
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalRevenue: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Fetch seller products
  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchStats();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      // First get seller info
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!seller) {
        console.error('Seller not found');
        return;
      }

      // Then fetch products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!seller) return;

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', seller.id);

      if (products) {
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.status === 'active').length;
        const totalRevenue = products.reduce((sum, p) => sum + (p.price || 0), 0);

        setStats({
          totalProducts,
          activeProducts,
          totalRevenue,
          totalViews: totalProducts * 12 // Mock data
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    console.log('🗑️ Starting delete for product:', productId);
    setDeletingProductId(productId);
    
    try {
      // First check if product exists
      const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      console.log('📝 Product before delete:', existingProduct);
      console.log('🔍 Fetch error:', fetchError);

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to find product: ${fetchError.message}`);
      }

      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Attempt deletion with select to see what gets deleted
      const { data: deleteResult, error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .select(); // This will return the deleted rows

      console.log('🗑️ Delete result:', deleteResult);
      console.log('❌ Delete error:', deleteError);

      if (deleteError) {
        throw new Error(`Database delete failed: ${deleteError.message}`);
      }

      // Check if anything was actually deleted
      if (!deleteResult || deleteResult.length === 0) {
        throw new Error('No rows were deleted - this might be a permissions issue');
      }

      console.log('✅ Successfully deleted:', deleteResult.length, 'rows');

      // Update local state only AFTER successful deletion
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      // Refresh global context to update all pages
      console.log('🔄 Refreshing global products...');
      await refreshProducts();
      
      toast.success('Product deleted successfully!');
      fetchStats(); // Refresh stats
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      toast.error(`Failed to delete product: ${error.message || 'Unknown error'}`);
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
    
    // Refresh global context to update all pages
    console.log('🔄 Refreshing global products after update...');
    await refreshProducts();
    
    fetchStats(); // Refresh stats
    setEditingProduct(null);
    toast.success('Product updated successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'sold':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading your dashboard...</div>
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
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your artwork listings</p>
          </div>
          <div className="flex gap-3">
            {/* Debug refresh button */}
            <Button 
              variant="outline" 
              onClick={refreshProducts}
              className="text-sm"
            >
              🔄 Refresh All Pages
            </Button>
            <Link to="/seller-dashboard/add-product">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first artwork</p>
                <Link to="/seller-dashboard/add-product">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="relative aspect-square bg-gray-100">
                      {product.featured_image ? (
                        <img
                          src={product.featured_image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-16 w-16" />
                        </div>
                      )}
                      
                      {/* Actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/product/${product.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deletingProductId === product.id}
                                >
                                  {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Status badge */}
                      <Badge className={`absolute top-2 left-2 ${getStatusColor(product.status)}`}>
                        {product.status}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">
                            ₹{product.price.toLocaleString()}
                          </div>
                          {product.original_price && product.original_price > product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              ₹{product.original_price.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.category}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateProduct}
        />
      )}

      <MobileNav />
    </div>
  );
}
