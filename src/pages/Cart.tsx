import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight,
  Heart,
  ArrowLeft,
  CreditCard,
  Truck
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext' // Add this import
import { useAuth } from '@/hooks/useAuth'

export default function Cart() {
  const { 
    items, 
    loading, 
    totalItems, 
    totalPrice, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart()
  
  const { user } = useAuth()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist() // Add this line
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set())
  const [promoCode, setPromoCode] = useState('')

  // Handle quantity changes with loading state
  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    setProcessingItems(prev => new Set(prev).add(productId))
    try {
      if (newQuantity <= 0) {
        await removeFromCart(productId)
      } else {
        await updateQuantity(productId, newQuantity)
      }
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setProcessingItems(prev => new Set(prev).add(productId))
    try {
      await removeFromCart(productId)
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  // Calculate additional costs
  const shippingCost = totalPrice > 50000 ? 0 : 500 // Free shipping above ₹50,000
  const taxRate = 0.18 // 18% GST
  const taxAmount = Math.round(totalPrice * taxRate)
  const finalTotal = totalPrice + shippingCost + taxAmount

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-2">Sign in to view your cart</h2>
            <p className="text-muted-foreground mb-6">
              Create an account or sign in to save your items and checkout
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg">
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" size="lg">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-900 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading your cart...</div>
          </div>
        </div>
        <MobileNav />
      </div>
    )
  }

  // Show empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Discover beautiful tribal art and add items to your cart
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/shop">
                <Button size="lg">
                  Start Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/artists">
                <Button variant="outline" size="lg">
                  Meet Artists
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <MobileNav />
      </div>
    )
  }

  // Main cart view
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back to shop */}
        <div className="mb-6">
          <Link to="/shop">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear cart option */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden border border-gray-200">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-6">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        {item.product.featured_image ? (
                          <img 
                            src={item.product.featured_image} 
                            alt={item.product.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <span className="text-2xl">🎨</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-semibold text-lg line-clamp-2 hover:text-blue-600 transition-colors mb-1">
                          {item.product.title}
                        </h3>
                      </Link>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        by {item.product.seller.display_name}
                      </p>

                      <div className="text-sm text-gray-500 mb-3">
                        {item.product.region} • {item.product.category}
                      </div>
                      
                      {/* Mobile quantity and remove */}
                      <div className="flex items-center justify-between sm:hidden">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            disabled={processingItems.has(item.product_id) || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 py-1 min-w-[2rem] text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            disabled={processingItems.has(item.product_id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            ₹{item.product.price.toLocaleString()} each
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop quantity and price controls */}
                    <div className="hidden sm:flex flex-col items-end gap-4">
                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.product_id)}
                        disabled={processingItems.has(item.product_id)}
                        className="text-gray-400 hover:text-red-500 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{item.product.price.toLocaleString()} each
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          disabled={processingItems.has(item.product_id) || item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="px-3 py-1 min-w-[2rem] text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          disabled={processingItems.has(item.product_id)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Wishlist button - UPDATED */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleWishlistToggle(item.product.id)}
                        className="text-gray-600"
                      >
                        <Heart 
                          className={`h-4 w-4 mr-1 transition-colors ${
                            isInWishlist(item.product.id) 
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-600'
                          }`} 
                        />
                        {isInWishlist(item.product.id) ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary - 1/3 width */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Promo Code</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button variant="outline">Apply</Button>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                      {shippingCost === 0 ? 'Free' : `₹${shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                  </div>
                  
                  {shippingCost === 0 && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      You saved ₹500 on shipping!
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full mt-6" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    🎨 <strong>Supporting Artists:</strong> Your purchase directly supports talented tribal artists across India.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security badges */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <div className="text-sm text-gray-600">Secure Checkout</div>
                  <div className="flex justify-center gap-4 text-xs text-gray-500">
                    <span>🔒 SSL Encrypted</span>
                    <span>💳 Payment Protected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
