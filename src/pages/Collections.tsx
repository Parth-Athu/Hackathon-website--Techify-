import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Collections() {
  const { slug } = useParams();

  const collections = [
    {
      name: 'Gond Art',
      slug: 'gond',
      region: 'Madhya Pradesh',
      description: 'Intricate patterns inspired by nature and folklore, characterized by dot and line work creating mesmerizing visual narratives.',
      longDescription: 'Gond art is a form of folk and tribal art practiced by one of the largest tribal communities of India. This art form is deeply rooted in the Gond tradition of creating art on walls and floors of their homes.',
      artworkCount: 45,
      featured: true,
    },
    {
      name: 'Warli Art',
      slug: 'warli',
      region: 'Maharashtra',
      description: 'Tribal paintings depicting daily life and rituals using simple geometric shapes in white pigment on mud walls.',
      longDescription: 'Warli painting is a tribal art form from Maharashtra, characterized by simple pictorial language using basic geometric shapes like circles, triangles, and lines.',
      artworkCount: 38,
    },
    {
      name: 'Bhil/Pithora',
      slug: 'bhil-pithora',
      region: 'Gujarat & Rajasthan',
      description: 'Colorful ceremonial wall paintings created during festivals and special occasions.',
      longDescription: 'Pithora paintings are ritual paintings done by Bhil and Rathwa tribes on the walls of their houses for ceremonial purposes.',
      artworkCount: 29,
    },
    {
      name: 'Madhubani',
      slug: 'madhubani',
      region: 'Bihar',
      description: 'Traditional paintings with natural dyes featuring intricate patterns and mythological themes.',
      longDescription: 'Madhubani painting is an ancient art form from Bihar, characterized by complex geometrical patterns and vibrant colors.',
      artworkCount: 52,
    },
    {
      name: 'Saura Art',
      slug: 'saura',
      region: 'Odisha',
      description: 'Sacred art forms celebrating tribal culture with iconic human figures and nature motifs.',
      longDescription: 'Saura paintings are tribal mural art forms from Odisha, known for their iconic stick-like human figures and spiritual themes.',
      artworkCount: 31,
    },
    {
      name: 'Pattachitra',
      slug: 'pattachitra',
      region: 'Odisha & West Bengal',
      description: 'Classical scroll paintings with mythological themes done on cloth or dried palm leaves.',
      longDescription: 'Pattachitra is a traditional painting style from Odisha and West Bengal, known for its intricate details and mythological narratives.',
      artworkCount: 42,
    },
  ];

  // If slug is provided, show individual collection page
  if (slug) {
    const collection = collections.find(c => c.slug === slug);
    
    if (!collection) {
      return <div>Collection not found</div>;
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Collection Header */}
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">
              {collection.region}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{collection.name}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              {collection.longDescription}
            </p>
            <div className="flex justify-center gap-8 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">{collection.artworkCount}</span> Artworks
              </div>
              <div>
                <span className="font-medium text-foreground">15+</span> Artists
              </div>
              <div>
                <span className="font-medium text-foreground">Authentic</span> Pieces
              </div>
            </div>
          </div>

          {/* Featured Artwork Hero */}
          <div className="mb-12">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-square bg-gradient-warm relative">
                  <div className="absolute inset-0 bg-gradient-primary opacity-20" />
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary">Featured Artwork</Badge>
                  </div>
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-4">
                    Sacred {collection.name.replace(' Art', '')} Masterpiece
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    This exceptional piece showcases the traditional techniques and cultural significance 
                    of {collection.name.toLowerCase()}, crafted by master artist Ramesh Kumar.
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Artist</span>
                      <span className="font-medium">Ramesh Kumar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Dimensions</span>
                      <span className="font-medium">30" x 24"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="text-xl font-bold">₹25,999</span>
                    </div>
                  </div>
                  <Link to={`/product/featured-${collection.slug}`} className="mt-6">
                    <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
                      View Artwork Details
                    </button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Collection Grid */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Browse All {collection.name}</h2>
            <p className="text-muted-foreground">
              Discover more authentic pieces from this traditional art form
            </p>
          </div>

          {/* This would be replaced with actual artwork grid */}
          <div className="text-center py-12 text-muted-foreground">
            <p>Artwork grid would be displayed here</p>
            <Link to="/shop" className="text-primary hover:underline">
              Browse all artworks →
            </Link>
          </div>
        </div>

        <MobileNav />
      </div>
    );
  }

  // Show collections index page
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Art Collections</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the rich diversity of Indian tribal art forms, each with its unique story and cultural heritage
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Card key={collection.slug} className="group hover:shadow-cultural transition-all duration-300">
              <div className="aspect-[4/3] bg-gradient-warm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-primary opacity-20" />
                {collection.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="destructive">Featured</Badge>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary">{collection.region}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <ArrowRight className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {collection.name}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {collection.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {collection.artworkCount} artworks
                  </span>
                  <Link 
                    to={`/collections/${collection.slug}`}
                    className="text-primary font-medium hover:underline"
                  >
                    Explore Collection →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cultural Info Section */}
        <div className="mt-16 py-12 px-8 bg-muted/30 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Cultural Heritage & Authenticity</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Each artwork in our collections represents generations of cultural tradition. 
              We work directly with tribal artists to ensure authenticity and fair compensation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold mb-2">Direct Trade</h3>
              <p className="text-sm text-muted-foreground">
                We work directly with artists, ensuring they receive fair compensation for their cultural heritage.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Authentic Techniques</h3>
              <p className="text-sm text-muted-foreground">
                All artworks are created using traditional materials and time-honored techniques.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cultural Stories</h3>
              <p className="text-sm text-muted-foreground">
                Each piece comes with detailed information about its cultural significance and meaning.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}