import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

// All Indian States and Union Territories - Alphabetically sorted A-Z
const indianStates = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
]

export function BecomeSellerForm({ onSuccess }: { onSuccess?: () => void }) {
  const [displayName, setDisplayName] = useState('')
  const [region, setRegion] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in first",
        variant: "destructive"
      })
      return
    }

    if (!region) {
      toast({
        title: "Region required",
        description: "Please select your state/region",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Check if user is already a seller
      const { data: existingSeller, error: checkError } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing seller:', checkError)
      }

      if (existingSeller) {
        toast({
          title: "Already a seller",
          description: "You're already registered as a seller!",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Create seller record
      const sellerData = {
        user_id: user.id,
        display_name: displayName,
        bio,
        region,
        onboarding_status: 'approved'
      }

      const { error } = await supabase
        .from('sellers')
        .insert(sellerData)

      if (error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          toast({
            title: "Already a seller",
            description: "You're already registered as a seller!",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Welcome to our community! 🎨",
          description: "Your seller profile has been created successfully.",
        })
        
        // Reset form
        setDisplayName('')
        setRegion('')
        setBio('')
        
        onSuccess?.()
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg border shadow-sm max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Start Your Artist Journey</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <Label htmlFor="displayName">Artist Display Name *</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="How should we display your name?"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        {/* Region Dropdown - Alphabetically sorted */}
        <div>
          <Label htmlFor="region">State/Region *</Label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Select your state or region" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {indianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio">Bio (Optional)</Label>
          <textarea
            id="bio"
            placeholder="Tell us about your art, heritage, and what inspires you..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 border rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-gray-500 mt-1">
            Share your story, artistic background, and what makes your art special
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full" 
          size="lg"
        >
          {loading ? 'Creating Your Profile...' : 'Become a Seller'}
        </Button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        By joining, you agree to our terms and conditions for sellers
      </p>
    </div>
  )
}
