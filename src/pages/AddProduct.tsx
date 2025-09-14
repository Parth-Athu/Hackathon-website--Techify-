import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Upload, 
  X, 
  Camera, 
  Package, 
  Tag, 
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

// Create Textarea component inline
const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

// Predefined options - tags will be auto-generated from these selections
const artTypes = [
  'Portrait',
  'Painting', 
  'Sculpture',
  'Decor',
  'Pottery',
  'Textile'
]

const artForms = [
    'Madhubani',
  'Warli',
  'Gond',
  'Dhokra',
  'Lippn',
  'Terracotta art',
  'Baster art',
  'Bhil / Pithora',
  'Bamboo craft',
]

// Indian States for region selection
const indianStates = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

interface ImagePreview {
  file: File
  preview: string
}

export default function AddProduct() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [category, setCategory] = useState('')
  const [artForm, setArtForm] = useState('')
  const [region, setRegion] = useState('')
  const [dimensions, setDimensions] = useState('')
  const [materials, setMaterials] = useState('')
  const [colors, setColors] = useState('')
  
  // Image handling
  const [images, setImages] = useState<ImagePreview[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const [loading, setLoading] = useState(false)

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + images.length > 3) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 3 images per product",
        variant: "destructive"
      })
      return
    }

    const newImages: ImagePreview[] = []
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive"
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive"
        })
        return
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file)
      })
    })

    setImages(prev => [...prev, ...newImages])
  }

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

const uploadImages = async (): Promise<string[]> => {
  if (images.length === 0) return []

  setUploadingImages(true)
  const uploadedUrls: string[] = []

  try {
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const fileExt = image.file.name.split('.').pop()
      
      // Make filename more unique
      const uniqueId = Math.random().toString(36).substring(2, 15)
      const timestamp = Date.now()
      const fileName = `${user?.id}-${timestamp}-${uniqueId}-${i}.${fileExt}`
      const filePath = fileName 

      console.log(`Uploading ${i + 1}:`, fileName)

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, image.file)

      if (uploadError) {
        console.error(`❌ Upload ${i + 1} failed:`, uploadError.message)
        // Continue with next image instead of stopping
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrl)
      console.log(`✅ Upload ${i + 1} success`)
    }
  } catch (error) {
    console.error('Upload error:', error)
  } finally {
    setUploadingImages(false)
  }

  console.log('Final uploaded URLs:', uploadedUrls)
  return uploadedUrls
}


  // Calculate service fee
  const calculateServiceFee = (priceValue: string) => {
    const numPrice = parseFloat(priceValue)
    if (isNaN(numPrice)) return 0
    return Math.round(numPrice * 0.05)
  }

  // Auto-generate tags from selections
  const generateTags = (): string[] => {
    const tags: string[] = []
    
    if (category) tags.push(category.toLowerCase())
    if (artForm) tags.push(artForm.toLowerCase())
    if (region) tags.push(region.toLowerCase())
    
    // Add some common tags based on category
    if (category === 'Painting') tags.push('handmade', 'art', 'canvas')
    if (category === 'Sculpture') tags.push('3d', 'carved', 'artistic')
    if (category === 'Pottery') tags.push('ceramic', 'clay', 'traditional')
    if (category === 'Textile') tags.push('fabric', 'woven', 'handloom')
    if (category === 'Decor') tags.push('home', 'decoration', 'interior')
    if (category === 'Portrait') tags.push('face', 'figure', 'realistic')
    
    // Add art form specific tags
    if (artForm === 'Madhubani') tags.push('bihar', 'folk', 'mithila')
    if (artForm === 'Warli') tags.push('maharashtra', 'tribal', 'geometric')
    if (artForm === 'Gond') tags.push('madhya pradesh', 'dots', 'patterns')
    if (artForm === 'Pattachitra') tags.push('odisha', 'scroll', 'mythological')
    if (artForm === 'Tanjore') tags.push('tamil nadu', 'gold', 'religious')
    if (artForm === 'Kalamkari') tags.push('andhra pradesh', 'pen work', 'natural dyes')
    
    return [...new Set(tags)] // Remove duplicates
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add products",
        variant: "destructive"
      })
      return
    }

    // Validation
    if (!title || !description || !price || !category || !region) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Get seller ID
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!seller) {
        toast({
          title: "Seller profile not found",
          description: "Please create a seller profile first",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Upload images
      toast({
        title: "Uploading images...",
        description: "Please wait while we upload your images"
      })

      const imageUrls = await uploadImages()

      if (imageUrls.length === 0) {
        toast({
          title: "Image upload failed",
          description: "Failed to upload images. Please check your internet connection and try again.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Generate tags automatically from selections
      const autoTags = generateTags()

      // Prepare materials and colors arrays
      const materialsArray = materials ? materials.split(',').map(m => m.trim()).filter(Boolean) : []
      const colorsArray = colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : []

      // Create product
      const productData = {
        seller_id: seller.id,
        title,
        description,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        category,
        art_form: artForm || null,
        region,
        dimensions: dimensions || null,
        materials: materialsArray,
        colors: colorsArray,
        tags: autoTags,
        images: imageUrls,
        featured_image: imageUrls[0],
        status: 'active'
      }

      const { error } = await supabase
        .from('products')
        .insert(productData)

      if (error) {
        console.error('Error creating product:', error)
        toast({
          title: "Error creating product",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Product created! 🎉",
          description: "Your artwork has been listed successfully"
        })
        navigate('/seller-dashboard')
      }
    } catch (err: any) {
      console.error('Error:', err)
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Get auto-generated tags preview
  const previewTags = generateTags()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Artwork</h1>
          <p className="text-muted-foreground">
            Share your beautiful art with the world
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Product Images (Required)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={images.length >= 3}
                  />
                  <label
                    htmlFor="images"
                    className={`cursor-pointer ${images.length >= 3 ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-medium mb-2">
                      {images.length >= 3 ? 'Maximum 3 images reached' : 'Click to upload images'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Maximum 3 images, up to 5MB each
                    </div>
                  </label>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2" variant="secondary">
                            Featured
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Beautiful Madhubani Painting"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your artwork, its story, materials used, dimensions, etc..."
                  className="h-32"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include size, materials, inspiration, and any special details
                </p>
              </div>

              {/* Category and Art Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {artTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="artForm">Art Form</Label>
                  <Select value={artForm} onValueChange={setArtForm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select art form" />
                    </SelectTrigger>
                    <SelectContent>
                      {artForms.map(form => (
                        <SelectItem key={form} value={form}>{form}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Region */}
              <div>
                <Label htmlFor="region">Region/State *</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {indianStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g., 12x16 inches"
                  />
                </div>

                <div>
                  <Label htmlFor="materials">Materials</Label>
                  <Input
                    id="materials"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="e.g., Canvas, Acrylic, Gold leaf"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>
              </div>

              <div>
                <Label htmlFor="colors">Colors</Label>
                <Input
                  id="colors"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder="e.g., Red, Gold, Blue, Green"
                />
                <p className="text-xs text-muted-foreground">Separate with commas</p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="2000"
                  />
                  <p className="text-xs text-muted-foreground">For showing discounts</p>
                </div>
              </div>

              {price && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">Pricing Breakdown</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Product Price:</span>
                      <span>₹{parseInt(price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Service Fee (5%):</span>
                      <span>-₹{calculateServiceFee(price).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>You'll receive:</span>
                      <span>₹{(parseInt(price) - calculateServiceFee(price)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auto-Generated Tags Preview */}
          {previewTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Auto-Generated Tags (Help buyers find your art)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    These tags will be automatically added based on your selections above:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {previewTags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tags help buyers find your artwork using filters in the shop
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/seller-dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex-1"
            >
              {loading ? 'Creating Product...' : uploadingImages ? 'Uploading Images...' : 'List Product'}
            </Button>
          </div>
        </form>
      </div>

      <MobileNav />
    </div>
  )
}
