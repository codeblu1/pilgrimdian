'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [cart, setCart] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params?.id) return
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) throw new Error('Product not found')
        const data = await response.json()
        setProduct(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching product:', error)
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params?.id])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) { // Remove length check to handle empty cart
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart])

  const addToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select both size and color')
      return
    }

    // Fix the cart item structure
    const cartItem = {
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.imageData || '', // Safely access first image
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === cartItem.id)
      if (existingItem) {
        const updatedCart = prevCart.map(item =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        localStorage.setItem('cart', JSON.stringify(updatedCart))
        return updatedCart
      }
      const newCart = [...prevCart, cartItem]
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    })

    alert('Added to cart!')
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    )
  }

  // Error state
  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Product not found</p>
        <button 
          onClick={() => router.push('/')}
          className="mt-4 text-indigo-600 hover:text-indigo-800"
        >
          Return to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a 
          href='/'
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </a>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full">
              <Image
                src={product.images[selectedImage].imageData}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square cursor-pointer ${
                      selectedImage === idx ? 'ring-2 ring-indigo-600' : ''
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <Image
                      src={image.imageData}
                      alt={`Product ${idx + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-4 text-xl text-gray-900">${product.price}</p>
            <div className="mt-4 space-y-6">
              <p className="text-gray-600">{product.description}</p>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 border rounded-md text-sm
                        ${selectedSize === size 
                          ? 'bg-indigo-600 text-white' 
                          : 'hover:bg-gray-50'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">Select Color</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border
                        ${selectedColor === color 
                          ? 'ring-2 ring-indigo-600 ring-offset-2' 
                          : ''}`}
                      style={{
                        backgroundColor: color.toLowerCase(),
                        border: color.toLowerCase() === 'white' 
                          ? '1px solid #e5e7eb' 
                          : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Add Action Buttons */}
              <div className="space-y-4 pt-4">
                <button
                  onClick={addToCart}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage;
