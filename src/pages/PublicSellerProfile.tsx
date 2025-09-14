import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package,
  Eye,
  Heart,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SellerProfile {
  id: string
  display_name: string
  bio?: string
  region: string
  avatar_url?: string
  created_at: string
}

interface Product {
  id: string
  title: string
  price: number
  original_price?: number
  featured_image?: string
  status: string
  created_at: string
  category: string
}

export default function PublicSellerProfile() {
  const { sellerId } = useParams<{ sellerId: string }>()
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sellerId) {
      fetchSellerProfile()
      fetchProducts()
    }
  }, [sellerId])

  const fetchSellerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId)
        .single()

      if (error) {
        console.error('Error fetching seller profile:', error)
      } else {
        setSeller(data)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
      } else {
        setProducts(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading artist profile...</div>
        </div>
        <MobileNav />
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Artist not found</div>
        </div>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex justify-center md:justify-start">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
              {seller.avatar_url ? (
                <img 
                  src={seller.avatar_url} 
                  alt={seller.display_name} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                seller.display_name?.charAt(0)?.toUpperCase() || 'A'
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-2xl font-semibold">{seller.display_name}</h1>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Contact Artist
              </Button>
            </div>

            <div className="flex justify-center md:justify-start gap-8 mb-4">
              <div className="text-center">
                <div className="font-bold text-lg">{products.length}</div>
                <div className="text-sm text-muted-foreground">artworks</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{products.length * 15}</div>
                <div className="text-sm text-muted-foreground">views</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{products.length * 8}</div>
                <div className="text-sm text-muted-foreground">likes</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-semibold">{seller.display_name}</div>
              {seller.bio && (
                <p className="text-sm leading-relaxed">{seller.bio}</p>
              )}
              <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {seller.region}
              </div>
              <div className="flex items-center justify-center md:justify-start text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {new Date(seller.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Artworks ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No artworks available</h3>
            <p className="text-muted-foreground">
              This artist hasn't listed any artworks yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-4">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <div className="group relative aspect-square">
                  <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                    {product.featured_image ? (
                      <img 
                        src={product.featured_image} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex items-center space-x-4 text-white text-sm">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          8
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          24
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="hidden md:block mt-2">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-sm text-muted-foreground">₹{product.price.toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  )
}
