import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext' // Add this import
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Share2, 
  MapPin,
  Palette,
  Ruler,
  Package
} from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string
  price: number
  original_price?: number
  category: string
  subcategory?: string
  region: string
  art_form?: string
  materials?: string[]
  dimensions?: string
  weight?: string
  colors?: string[]
  tags?: string[]
  images?: string[]
  featured_image?: string
  seller: {
    display_name: string
    region: string
  }
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist() // Add this line
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:sellers(display_name, region)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
      } else {
        setProduct(data)
        setSelectedImage(data.featured_image || data.images?.[0] || '')
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product?.id) {
      toast.error('Product not found');
      return;
    }

    setAddingToCart(true);
    try {
      // Add multiple items if quantity > 1
      for (let i = 0; i < quantity; i++) {
        await addToCart(product.id);
      }
      
      toast.success(`${quantity} x ${product.title} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!product?.id) return;
    
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading product...</div>
        </div>
        <MobileNav />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Product not found</div>
        </div>
        <MobileNav />
      </div>
    )
  }

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <span>/</span>
            <Link to={`/shop?category=${product.category}`} className="hover:text-primary">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <Package className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      selectedImage === image ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">4.8 (24 reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Wishlist Button - UPDATED */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleWishlistToggle}
                  >
                    <Heart 
                      className={`h-4 w-4 transition-colors ${
                        isInWishlist(product.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
                {product.original_price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{product.original_price.toLocaleString()}
                    </span>
                    <Badge variant="destructive">{discount}% OFF</Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
            </div>

            {/* Artist Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-1">Artist</h3>
              <p className="text-sm">{product.seller.display_name}</p>
              <p className="text-xs text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {product.seller.region}
              </p>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              <h3 className="font-semibold">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span> {product.category}
                </div>
                {product.art_form && (
                  <div>
                    <span className="font-medium">Art Form:</span> {product.art_form}
                  </div>
                )}
                <div>
                  <span className="font-medium">Region:</span> {product.region}
                </div>
                {product.dimensions && (
                  <div className="flex items-center">
                    <Ruler className="h-3 w-3 mr-1" />
                    <span className="font-medium">Size:</span> {product.dimensions}
                  </div>
                )}
              </div>

              {product.materials && product.materials.length > 0 && (
                <div>
                  <span className="font-medium">Materials:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.materials.map((material, index) => (
                      <Badge key={index} variant="outline">{material}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div>
                  <span className="font-medium flex items-center">
                    <Palette className="h-3 w-3 mr-1" />
                    Colors:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.colors.map((color, index) => (
                      <Badge key={index} variant="outline">{color}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-gray-100"
                    disabled={addingToCart}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-x">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100"
                    disabled={addingToCart}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  className="flex-1" 
                  size="lg" 
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button variant="outline" size="lg">
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        <Separator className="my-8" />
        <div className="max-w-4xl">
          <h2 className="text-xl font-bold mb-4">About this item</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
