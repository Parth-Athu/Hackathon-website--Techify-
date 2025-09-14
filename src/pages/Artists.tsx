import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  User, 
  Package
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Artist {
  id: string
  display_name: string
  bio?: string
  region: string
  avatar_url?: string
  created_at: string
}

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    try {
      let query = supabase
        .from('sellers')  // Changed from 'artists' to 'sellers'
        .select('*')
        .order('created_at', { ascending: false })

      if (searchQuery.trim()) {
        query = query.ilike('display_name', `%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching artists:', error)
      } else {
        setArtists(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meet Our Artists</h1>
          <p className="text-muted-foreground">
            Discover talented tribal artists from across India
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Artists Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading artists...</div>
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No artists found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artists.map((artist) => (
              <Card key={artist.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    {artist.avatar_url ? (
                      <img 
                        src={artist.avatar_url} 
                        alt={artist.display_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white bg-gradient-to-br from-blue-400 to-purple-500">
                        {artist.display_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 text-lg">{artist.display_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {artist.region}
                  </p>
                  
                  {artist.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {artist.bio}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground mb-3">
                    Member since {new Date(artist.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>

                  {/* THIS IS THE IMPORTANT PART - The "View Profile" button */}
                  <Link to={`/artist/${artist.id}`}>
                    <Button className="w-full" variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  )
}
