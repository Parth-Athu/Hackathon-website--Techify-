import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Filter, 
  Grid, 
  List, 
  Star, 
  Heart, 
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Package
} from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext'; // Add this import
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  category: string;
  region: string;
  art_form?: string;
  tags?: string[];
  featured_image?: string;
  images?: string[];
  seller: {
    id: string;
    display_name: string;
    region: string;
  };
}

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

export default function Shop() {
  const { products: allProducts, loading } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(); // Add this line
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const { toast } = useToast();

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedArtStyles, setSelectedArtStyles] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  // Dynamic filter options from products
  const [categories, setCategories] = useState<string[]>([]);
  const [artStyles, setArtStyles] = useState<string[]>([]);

  // Predefined tribal art styles
  const knownTribalArtStyles = [
    'Gond Art',
    'Warli Art', 
    'Madhubani Art',
    'Pithora Art',
    'Dokra Art',
    'Toda Embroidery',
    'Bhil Art',
    'Santhal Art',
    'Saura Art',
    'Kurumba Art'
  ];

  // FIXED: Price ranges with proper typing
  const priceRanges: PriceRange[] = [
    { label: 'Under ₹5,000', min: 0, max: 4999 },
    { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
    { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
    { label: 'Above ₹20,000', min: 20001, max: Number.MAX_SAFE_INTEGER },
  ];

  // Update filter options when products change
  useEffect(() => {
    if (allProducts.length > 0) {
      // Get unique categories
      const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
      
      // Get art styles from multiple sources
      const artStylesFromProducts = new Set<string>();
      
      allProducts.forEach(product => {
        // Check art_form field
        if (product.art_form) {
          artStylesFromProducts.add(product.art_form);
        }
        
        // Check title for known tribal art styles
        knownTribalArtStyles.forEach(style => {
          if (product.title.toLowerCase().includes(style.toLowerCase().replace(' art', '')) ||
              product.title.toLowerCase().includes(style.toLowerCase())) {
            artStylesFromProducts.add(style);
          }
        });
        
        // Check tags if they exist
        if (product.tags) {
          product.tags.forEach(tag => {
            knownTribalArtStyles.forEach(style => {
              if (tag.toLowerCase().includes(style.toLowerCase().replace(' art', '')) ||
                  tag.toLowerCase().includes(style.toLowerCase())) {
                artStylesFromProducts.add(style);
              }
            });
          });
        }
      });
      
      setCategories(uniqueCategories);
      setArtStyles(Array.from(artStylesFromProducts).sort());
    }
  }, [allProducts]);

  // Apply filters and sorting when products or filters change
  useEffect(() => {
    let filtered = [...allProducts];

    console.log('🔍 Starting filter with:', {
      totalProducts: allProducts.length,
      selectedCategories,
      selectedArtStyles,
      selectedPriceRanges
    });

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('🔍 After search filter:', filtered.length);
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
      console.log('📂 After category filter:', filtered.length);
    }

    // Apply art style filter
    if (selectedArtStyles.length > 0) {
      filtered = filtered.filter(product => {
        return selectedArtStyles.some(selectedStyle => {
          // Check art_form field
          if (product.art_form && product.art_form.toLowerCase().includes(selectedStyle.toLowerCase().replace(' art', ''))) {
            return true;
          }
          
          // Check title
          if (product.title.toLowerCase().includes(selectedStyle.toLowerCase().replace(' art', '')) ||
              product.title.toLowerCase().includes(selectedStyle.toLowerCase())) {
            return true;
          }
          
          // Check tags
          if (product.tags) {
            return product.tags.some(tag => 
              tag.toLowerCase().includes(selectedStyle.toLowerCase().replace(' art', '')) ||
              tag.toLowerCase().includes(selectedStyle.toLowerCase())
            );
          }
          
          return false;
        });
      });
      console.log('🎨 After art style filter:', filtered.length);
    }

    // FIXED: Apply price range filter with better logic
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(product => {
        const productPrice = Number(product.price);
        
        // Check if product price falls within any of the selected ranges
        return selectedPriceRanges.some(rangeLabel => {
          const range = priceRanges.find(r => r.label === rangeLabel);
          if (!range) return false;
          
          const withinRange = productPrice >= range.min && productPrice <= range.max;
          
          console.log(`💰 Checking ${product.title} (₹${productPrice}) against ${rangeLabel} (${range.min}-${range.max}): ${withinRange}`);
          
          return withinRange;
        });
      });
      console.log('💰 After price filter:', filtered.length);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'newest':
      default:
        // Keep original order from context (newest first)
        break;
    }

    console.log('✅ Final filtered products:', filtered.length);
    setFilteredProducts(filtered);
  }, [allProducts, searchQuery, selectedCategories, selectedArtStyles, selectedPriceRanges, sortBy]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleArtStyleChange = (artStyle: string, checked: boolean) => {
    console.log('🎨 Art style filter changed:', artStyle, checked);
    if (checked) {
      setSelectedArtStyles([...selectedArtStyles, artStyle]);
    } else {
      setSelectedArtStyles(selectedArtStyles.filter(s => s !== artStyle));
    }
  };

  // FIXED: Price range handler with debugging
  const handlePriceRangeChange = (rangeLabel: string, checked: boolean) => {
    console.log('💰 Price range filter changed:', rangeLabel, checked);
    
    if (checked) {
      setSelectedPriceRanges([...selectedPriceRanges, rangeLabel]);
    } else {
      setSelectedPriceRanges(selectedPriceRanges.filter(r => r !== rangeLabel));
    }
  };

  const clearAllFilters = () => {
    console.log('🧹 Clearing all filters');
    setSelectedCategories([]);
    setSelectedArtStyles([]);
    setSelectedPriceRanges([]);
    setSearchQuery('');
  };

  const handleAddToCart = async (productId: string, productTitle: string) => {
    try {
      await addToCart(productId);
      toast({
        title: "Added to Cart! 🛒",
        description: `${productTitle} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId: string, productTitle: string) => {
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateDiscount = (originalPrice?: number, price?: number) => {
    if (!originalPrice || !price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shop Tribal Art</h1>
          <p className="text-muted-foreground">
            Discover authentic tribal artworks from across India
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Filters</h3>

                {/* Art Form Filter */}
                {categories.length > 0 && (
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">Art Form</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox 
                            id={category} 
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                          />
                          <Label
                            htmlFor={category}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Art Style Filter - IMPROVED */}
                {artStyles.length > 0 && (
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">
                      Art Style 
                      {selectedArtStyles.length > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({selectedArtStyles.length} selected)
                        </span>
                      )}
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {artStyles.map((artStyle) => (
                        <div key={artStyle} className="flex items-center space-x-2">
                          <Checkbox 
                            id={artStyle} 
                            checked={selectedArtStyles.includes(artStyle)}
                            onCheckedChange={(checked) => handleArtStyleChange(artStyle, checked as boolean)}
                          />
                          <Label
                            htmlFor={artStyle}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {artStyle}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* FIXED: Price Range Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">
                    Price Range
                    {selectedPriceRanges.length > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({selectedPriceRanges.length} selected)
                      </span>
                    )}
                  </Label>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <div key={range.label} className="flex items-center space-x-2">
                        <Checkbox 
                          id={range.label} 
                          checked={selectedPriceRanges.includes(range.label)}
                          onCheckedChange={(checked) => handlePriceRangeChange(range.label, checked as boolean)}
                        />
                        <Label
                          htmlFor={range.label}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Debug info - you can remove this later */}
                  {selectedPriceRanges.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      Active: {selectedPriceRanges.join(', ')}
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `Showing ${filteredProducts.length} artworks`}
                  {/* Debug info */}
                  {selectedPriceRanges.length > 0 && (
                    <span className="text-blue-600 ml-2">
                      (Price filtered)
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg">Loading artworks...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group overflow-hidden hover:shadow-medium transition-all duration-300">
                    <Link to={`/product/${product.id}`}>
                      <div className="relative">
                        <div className="aspect-square bg-gradient-warm relative overflow-hidden">
                          {product.featured_image || (product.images && product.images[0]) ? (
                            <img 
                              src={product.featured_image || product.images![0]} 
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-primary opacity-20" />
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                <Package className="h-16 w-16 text-gray-400" />
                              </div>
                            </>
                          )}
                          
                          {/* Wishlist Button - UPDATED */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleWishlistToggle(product.id, product.title);
                            }}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
                          >
                            <Heart 
                              className={`h-4 w-4 transition-colors ${
                                isInWishlist(product.id) 
                                  ? 'text-red-500 fill-current' 
                                  : 'text-gray-600'
                              }`} 
                            />
                          </button>
                          
                          <div className="absolute bottom-4 left-4 z-10">
                            <Badge variant="secondary">{product.category}</Badge>
                          </div>
                          {product.original_price && (
                            <div className="absolute top-4 left-4 z-10">
                              <Badge variant="destructive">
                                {calculateDiscount(product.original_price, product.price)}% OFF
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                    
                    <CardContent className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {product.seller.display_name} • {product.region}
                      </p>
                      
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-sm text-muted-foreground">(24)</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                          {product.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product.id, product.title);
                          }}
                        >
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {product.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More */}
            {!loading && filteredProducts.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Artworks
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
