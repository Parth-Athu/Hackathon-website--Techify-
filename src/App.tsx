import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { WishlistProvider } from "@/contexts/WishlistContext"; // Add this import
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ProductDetail from '@/pages/ProductDetail'
import SellerDashboard from '@/pages/SellerDashboard'
import AddProduct from '@/pages/AddProduct'
import PublicSellerProfile from '@/pages/PublicSellerProfile'

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Shop from "./pages/Shop";
import Collections from "./pages/Collections";
import Artists from "./pages/Artists";
import About from "./pages/About";
import Sell from "./pages/Sell";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist"; // Add this import
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <WishlistProvider> {/* Add WishlistProvider here */}
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/collections/:slug" element={<Collections />} />
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/sell" element={<Sell />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/artist/:sellerId" element={<PublicSellerProfile />} />
                  
                  {/* Add Wishlist Route */}
                  <Route 
                    path="/wishlist" 
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/seller/add-product" 
                    element={
                      <ProtectedRoute>
                        <AddProduct />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller-dashboard/add-product" 
                    element={
                      <ProtectedRoute>
                        <AddProduct />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller-dashboard" 
                    element={
                      <ProtectedRoute>
                        <SellerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider> {/* Close WishlistProvider here */}
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
