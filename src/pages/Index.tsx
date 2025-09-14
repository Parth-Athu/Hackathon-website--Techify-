import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Star, 
  Heart, 
  ShoppingBag, 
  Users, 
  Award, 
  Globe, 
  TrendingUp,
  Package,
  Palette,
  Play,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-banner.jpg';

// ✅ 6 Tribal art forms data with YouTube links and images
const tribalArtForms = [
  {
    id: 1,
    name: 'Madhubani Art',
    region: 'Bihar',
    // ========================================
    // 🎥 INSERT YOUTUBE VIDEO LINK HERE
    // ========================================
    image: '/images/madhubani.jpg', // <-- PUT YOUR MADHUBANI IMAGE HERE
    description: 'Traditional paintings with natural dyes, depicting mythology and nature',
    youtubeUrl: 'https://www.youtube.com/watch?v=YOUR_MADHUBANI_VIDEO_ID' // <-- INSERT YOUTUBE VIDEO LINK
  },
  {
    id: 2,
    name: 'Warli Art',
    region: 'Maharashtra',
    // ========================================
    // 🎥 INSERT YOUTUBE VIDEO LINK HERE
    // ========================================
    image: '/images/warli.jpg', // <-- PUT YOUR WARLI IMAGE HERE
    description: 'Tribal paintings depicting daily life, harvest, and community celebrations',
    youtubeUrl: 'https://www.youtube.com/watch?v=YOUR_WARLI_VIDEO_ID' // <-- INSERT YOUTUBE VIDEO LINK
  },
  {
    id: 3,
    name: 'Gond Art',
    region: 'Madhya Pradesh',
    // ========================================
    // 🎥 INSERT YOUTUBE VIDEO LINK HERE
    // ========================================
    image: '/images/gond.jpg', // <-- PUT YOUR GOND IMAGE HERE
    description: 'Intricate dot and line patterns depicting nature stories and tribal folklore',
    youtubeUrl: 'https://www.youtube.com/watch?v=YOUR_GOND_VIDEO_ID' // <-- INSERT YOUTUBE VIDEO LINK
  },
  {
    id: 4,
    name: 'Pithora Art',
    region: 'Gujarat',
    // ========================================
    // 🎥 INSERT YOUTUBE VIDEO LINK HERE
    // ========================================
    image: '/images/pithora.jpg', // <-- PUT YOUR PITHORA IMAGE HERE
    description: 'Colorful ceremonial wall paintings featuring horses, elephants, and blessings',
    youtubeUrl: 'https://www.youtube.com/watch?v=YOUR_PITHORA_VIDEO_ID' // <-- INSERT YOUTUBE VIDEO LINK
  },
  {
    id: 5,
    name: 'Dokra Art',
    region: 'West Bengal',
    // ========================================
    // 🎥 INSERT YOUTUBE VIDEO LINK HERE
    // ========================================
    image: '/images/dokra.jpg', // <-- PUT YOUR DOKRA IMAGE HERE
    description: 'Ancient metal casting technique creating beautiful sculptures and figurines',
    youtubeUrl: 'https://www.youtube.com/watch?v=YOUR_DOKRA_VIDEO_ID' // <-- INSERT YOUTUBE VIDEO LINK
  },
  {
    id: 6,
    name: 'Lippan Art',
    region: 'Gujarat',
    // ========================================
    // 🎥 INSERT YOUTUBE VIDEO LINK HERE
    // ========================================
    image: '/images/lippan.jpg', // <-- PUT YOUR LIPPAN IMAGE HERE
    description: 'Traditional mud work combined with mirror embellishments and geometric designs',
    youtubeUrl: 'https://www.youtube.com/watch?v=PDxrQtArXfs' // <-- ALREADY HAS YOUTUBE LINK
  }
];

// ✅ FIXED AUTO-ROTATING 6-Card Carousel Component
const TribalArtCarousel = () => {
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // ✅ FIXED AUTO-ROTATION: Properly working now
  useEffect(() => {
    if (!isAutoRotating || isHovered) return;

    const interval = setInterval(() => {
      setCurrentStartIndex(prev => {
        const newIndex = (prev + 1) % tribalArtForms.length;
        console.log('🔄 Auto-rotating to index:', newIndex); // Debug log
        return newIndex;
      });
    }, 4000); // Every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoRotating, isHovered]); // ✅ FIXED: Removed currentStartIndex from dependencies

  // ✅ YOUTUBE: Open video in new tab
  const handleLearnMore = (youtubeUrl: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrevious = () => {
    setCurrentStartIndex(prev => prev === 0 ? tribalArtForms.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentStartIndex(prev => (prev + 1) % tribalArtForms.length);
  };

  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < 4; i++) { // Show 4 cards at once
      const index = (currentStartIndex + i) % tribalArtForms.length;
      cards.push(tribalArtForms[index]);
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
            Explore Tribal Art Forms
          </h2>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            Discover the rich heritage and techniques behind each tribal art form
          </p>
        </div>

        {/* ✅ Auto-rotation status indicator (optional - can remove) */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 text-sm text-amber-600">
            <div className={`w-2 h-2 rounded-full ${isAutoRotating && !isHovered ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`}></div>
            Auto-rotating every 4 seconds {isHovered && '(paused on hover)'}
          </div>
        </div>

        {/* ✅ 6-Card Carousel with ARROWS */}
        <div 
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-16">
            {visibleCards.map((art, index) => (
              <Card 
                key={`${art.id}-${currentStartIndex}-${index}`} // ✅ FIXED: Better unique key
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-amber-200 bg-white"
              >
                <div className="relative aspect-square bg-gradient-to-br from-amber-100 to-orange-100">
                  {/* 
                    ========================================
                    🖼️ INSERT YOUR ART IMAGES HERE 
                    ========================================
                  */}
                  <img 
                    src={art.image} 
                    alt={art.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=${encodeURIComponent(art.name)}`;
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <Badge className="absolute top-4 left-4 bg-orange-600 text-white border-0 shadow-md">
                    {art.region}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-amber-900">
                    {art.name}
                  </h3>
                  <p className="text-amber-700 text-sm leading-relaxed mb-4">
                    {art.description}
                  </p>
                  
                  {/* ✅ YOUTUBE: Learn More Button */}
                  <Button 
                    onClick={(e) => handleLearnMore(art.youtubeUrl, e)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Learn More
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ✅ ARROWS: Navigation Arrows */}
          <div className="opacity-70 hover:opacity-100 md:opacity-100 transition-opacity duration-300">
            {/* Previous Arrow */}
            <button
              onClick={handlePrevious}
              className="
                absolute left-2 top-1/2 transform -translate-y-1/2
                bg-white/95 hover:bg-white text-amber-900 rounded-full p-4
                shadow-2xl hover:shadow-3xl transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-orange-500/50
                z-40 border-2 border-amber-200 hover:scale-110
              "
              aria-label="Previous art forms"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next Arrow */}
            <button
              onClick={handleNext}
              className="
                absolute right-2 top-1/2 transform -translate-y-1/2
                bg-white/95 hover:bg-white text-amber-900 rounded-full p-4
                shadow-2xl hover:shadow-3xl transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-orange-500/50
                z-40 border-2 border-amber-200 hover:scale-110
              "
              aria-label="Next art forms"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* ✅ Progress Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {tribalArtForms.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStartIndex(index)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300
                  ${index === currentStartIndex 
                    ? 'bg-orange-600 w-8' 
                    : 'bg-amber-300 hover:bg-orange-400'
                  }
                `}
                aria-label={`Go to slide starting with ${tribalArtForms[index].name}`}
              />
            ))}
          </div>

          {/* Auto-rotate toggle */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="text-amber-700 hover:text-orange-600"
            >
              {isAutoRotating ? 'Pause Auto-rotate' : 'Resume Auto-rotate'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Index() {
  const { products: allProducts, loading } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Get first 6 products for featured section
  const featuredProducts = allProducts.slice(0, 6);

  const handleAddToCart = async (productId: string, productTitle: string) => {
    setAddingToCart(productId);
    try {
      await addToCart(productId);
      toast.success(`${productTitle} added to cart! 🛒`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleWishlistToggle = async (productId: string, productTitle: string) => {
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const calculateDiscount = (originalPrice?: number, price?: number) => {
    if (!originalPrice || !price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-[#FAF2E8]">
      <Header />

      {/* ✅ Hero Section with OLD COLORS */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#FCEAD7] border-b border-amber-300">
        {/* 
          ========================================
          🖼️ INSERT HERO IMAGE HERE 
          ========================================
        */}
        <img src={heroImage} alt="Tribal Hero" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="relative z-10 text-center max-w-3xl px-6 py-16">
          <Badge className="mb-4 text-sm bg-amber-200 text-amber-800 border border-amber-300 shadow-md">
            Authentic • Direct from Artists • Cultural Heritage
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-amber-900 mb-6 leading-tight drop-shadow">
            Discover <span className="text-orange-600">Tribal Art</span>
          </h1>
          <p className="text-xl text-amber-900 mb-8 leading-relaxed font-medium drop-shadow-sm">
            Connect with tribal artists and bring home unique treasures of living heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg">
                <Palette className="h-5 w-5 mr-2" />
                Explore Artworks
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/artists">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-amber-400 text-amber-900 hover:bg-amber-100">
                Meet Artists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ AUTO-ROTATING Tribal Art Forms Carousel */}
      <TribalArtCarousel />

      {/* ✅ Featured Products Section with OLD COLORS */}
      <section className="py-16 bg-[#FAF2E8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              Featured Artworks
            </h2>
            <p className="text-xl text-amber-700">
              Discover authentic tribal art pieces created by master artisans from across India
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-amber-700">Loading beautiful artworks...</div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-amber-400" />
              <h3 className="text-xl font-semibold mb-2 text-amber-900">No featured products yet</h3>
              <p className="text-amber-700 mb-6">Check back soon for new tribal art pieces!</p>
              <Link to="/shop">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Browse All Products
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-amber-200 shadow-sm">
                    <CardContent className="p-0">
                      <Link to={`/product/${product.id}`}>
                        <div className="relative aspect-square bg-amber-50">
                          {product.featured_image ? (
                            <img 
                              src={product.featured_image} 
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <Package className="h-16 w-16 text-amber-400" />
                            </div>
                          )}
                          
                          {/* ✅ WISHLIST: Working heart button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleWishlistToggle(product.id, product.title);
                            }}
                            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors z-10"
                          >
                            <Heart 
                              className={`h-4 w-4 transition-colors ${
                                isInWishlist(product.id) 
                                  ? 'text-red-500 fill-current' 
                                  : 'text-red-500'
                              }`} 
                            />
                          </button>

                          <Badge className="absolute top-3 left-3 bg-orange-600 text-white shadow-md">
                            {product.category}
                          </Badge>

                          {product.original_price && product.original_price > product.price && (
                            <Badge className="absolute bottom-4 right-4 bg-red-500 text-white">
                              {calculateDiscount(product.original_price, product.price)}% OFF
                            </Badge>
                          )}
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-orange-600 transition-colors text-amber-900">
                            {product.title}
                          </h3>
                        </Link>

                        <p className="text-sm text-amber-700 mb-3">
                          by {product.seller.display_name} • {product.region}
                        </p>

                        <div className="flex items-center gap-1 mb-4">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-amber-900">4.8</span>
                          <span className="text-sm text-amber-600">(24)</span>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-xl font-bold text-orange-700">
                              ₹{product.price.toLocaleString()}
                            </div>
                            {product.original_price && product.original_price > product.price && (
                              <div className="text-sm text-amber-600 line-through">
                                ₹{product.original_price.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product.id, product.title);
                          }}
                          disabled={addingToCart === product.id}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {addingToCart === product.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/shop">
                  <Button className="bg-orange-700 text-white px-8 py-3 hover:bg-orange-800" size="lg">
                    View All Products
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ✅ Stats Section with OLD COLORS */}
      <section className="py-16 bg-[#F9F6F1]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">
              Our Impact
            </h2>
            <p className="text-xl text-amber-700">
              Supporting tribal artists and preserving cultural heritage through fair trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-orange-700" />
              <div className="text-3xl font-bold mb-2 text-amber-900">150+</div>
              <div className="text-amber-700">Artists Supported</div>
            </div>
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-orange-700" />
              <div className="text-3xl font-bold mb-2 text-amber-900">2000+</div>
              <div className="text-amber-700">Artworks Sold</div>
            </div>
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-orange-700" />
              <div className="text-3xl font-bold mb-2 text-amber-900">25</div>
              <div className="text-amber-700">States Covered</div>
            </div>
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-orange-700" />
              <div className="text-3xl font-bold mb-2 text-amber-900">95%</div>
              <div className="text-amber-700">Artist Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ CTA Section with OLD COLORS */}
      <section className="py-12 bg-[#FAF2E8] text-center border-t border-amber-300">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
            Ready to Share Your Art with the World?
          </h2>
          <p className="text-xl text-amber-700 mb-8 max-w-2xl mx-auto">
            Join our community of tribal artists and connect with art lovers globally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sell">
              <Button size="lg" className="bg-orange-700 hover:bg-orange-800 text-white px-8 py-4">
                Start Selling
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/artists">
              <Button variant="outline" size="lg" className="border-amber-300 text-amber-900 hover:bg-amber-100 px-8 py-4">
                Meet Artists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MobileNav />
    </div>
  );
}
