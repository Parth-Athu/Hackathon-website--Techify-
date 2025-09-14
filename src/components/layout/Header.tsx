import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Settings, ShoppingBag, Heart, LogOut, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/contexts/CartContext'
import logo from '@/assets/logo.png' // update to your real path

export function Header() {
  const { user } = useAuth()
  const { totalItems } = useCart()
  const [isSeller, setIsSeller] = useState(false)
  const [checkingSellerStatus, setCheckingSellerStatus] = useState(true)

  useEffect(() => {
    if (user) {
      checkIfUserIsSeller()
    } else {
      setCheckingSellerStatus(false)
    }
  }, [user])

  const checkIfUserIsSeller = async () => {
    if (!user) return

    try {
      const { data: seller } = await supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      setIsSeller(!!seller)
    } catch (error) {
      console.log('Error checking seller status:', error)
      setIsSeller(false)
    } finally {
      setCheckingSellerStatus(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="border-b bg-gradient-to-r from-yellow-50 via-white to-amber-100 shadow-lg rounded-b-2xl">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center gap-3 group"
        >
          <img
            src={logo}
            alt="Desi Roots Logo"
            className="h-12 w-12 object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-md "
          />
          <span className="text-3xl font-extrabold text-amber-800 tracking-tight font-serif logo-title-shadow">
             देसी  <span className="text-orange-500">Roots</span>
          </span>
        </Link>

        {/* UPDATED NAVIGATION - COLLECTIONS REMOVED */}
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/" className="hover:text-orange-500 transition-colors font-medium">Home</Link>
          <Link to="/shop" className="hover:text-orange-500 transition-colors font-medium">Shop</Link>
          {/* Collections removed */}
          <Link to="/artists" className="hover:text-orange-500 transition-colors font-medium">Artists</Link>
          <Link to="/about" className="hover:text-orange-500 transition-colors font-medium">About</Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/cart" className="relative group">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-orange-100 focus:bg-orange-200 transition-colors"
            >
              <ShoppingBag className="h-6 w-6 text-amber-700 transition-transform duration-200 group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-amber-100 transition">
                  <Avatar className="h-12 w-12 ring-2 ring-orange-200">
                    <AvatarFallback className="bg-orange-400 text-white">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-semibold">{user.email}</p>
                    {checkingSellerStatus ? (
                      <p className="text-xs text-muted-foreground">Loading...</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {isSeller ? 'Seller' : 'Buyer'}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cart" className="cursor-pointer">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Cart ({totalItems})
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!checkingSellerStatus && (
                  isSeller ? (
                    <DropdownMenuItem asChild>
                      <Link to="/seller-dashboard" className="cursor-pointer">
                        <Store className="mr-2 h-4 w-4" />
                        Seller Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/sell" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Become a Seller
                      </Link>
                    </DropdownMenuItem>
                  )
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="outline" className="hover:bg-orange-100 transition font-semibold">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
