import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { BecomeSellerForm } from './BecomeSellerForm'
import { useNavigate } from 'react-router-dom'

export default function Sell() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    setTimeout(() => {
      navigate('/artists')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Join Our Marketplace and Share Your Art with the World
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with art lovers globally and preserve your cultural heritage while earning from your craft
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">💰</div>
              <h3 className="font-semibold mb-2">Fair Compensation</h3>
              <p className="text-sm text-muted-foreground">Earn directly from your art with transparent pricing</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">🌍</div>
              <h3 className="font-semibold mb-2">Global Reach</h3>
              <p className="text-sm text-muted-foreground">Connect with art collectors worldwide</p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">🎨</div>
              <h3 className="font-semibold mb-2">Cultural Heritage</h3>
              <p className="text-sm text-muted-foreground">Help preserve tribal art for future generations</p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <BecomeSellerForm onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
