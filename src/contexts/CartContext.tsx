import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: {
    id: string
    title: string
    price: number
    featured_image?: string
    seller: {
      display_name: string
    }
  }
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  totalItems: number
  totalPrice: number
  addToCart: (productId: string) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  const fetchCart = async () => {
    if (!user) {
      setItems([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id,
            title,
            price,
            featured_image,
            seller:sellers (
              display_name
            )
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching cart:', error)
      } else {
        setItems(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string) => {
    console.log('🛒 Adding to cart:', productId)
    console.log('👤 User:', user?.id)

    if (!user) {
      alert('Please sign in to add items to cart')
      return
    }

    try {
      // Check if item already exists
      const existingItem = items.find(item => item.product_id === productId)

      if (existingItem) {
        console.log('📦 Item exists, updating quantity')
        await updateQuantity(productId, existingItem.quantity + 1)
      } else {
        console.log('🆕 New item, inserting')
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1
          })

        if (error) {
          console.error('❌ Insert error:', error)
          alert(`Error adding to cart: ${error.message}`)
        } else {
          console.log('✅ Successfully added to cart')
          alert('Added to cart!')
          fetchCart()
        }
      }
    } catch (err) {
      console.error('💥 Catch error:', err)
      alert('Something went wrong')
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (!error) {
        fetchCart()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return

    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (!error) {
        fetchCart()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      if (!error) {
        setItems([])
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [user])

  return (
    <CartContext.Provider value={{
      items,
      loading,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
