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
  const [cart, setCart] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params?.id) return
        const response = await fetch(`/api/products/${params.id}`, {cache: 'no-cache',})
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
    // Check existing quantity in cart
    const existingItem = cart.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    // Check if adding one more would exceed stock
    if (currentQuantity + 1 > product.stock) {
      alert(`Sorry, only ${product.stock} items available in stock`);
      return;
    }

    const cartItem = {
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.imageData || '',
      quantity: 1,
      maxStock: product.stock // Store max stock with item
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === cartItem.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const newCart = [...prevCart, cartItem];
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });

    alert('Added to cart!');
  };

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
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shop
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left: Image Gallery */}
            <div className="space-y-4">
              {/* Main Image - Remove SOLD OUT overlay */}
              <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                <Image
                  src={product.images[selectedImage].imageData}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Thumbnail Grid */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((image, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden
                        ${selectedImage === idx 
                          ? 'ring-2 ring-indigo-600 ring-offset-2' 
                          : 'hover:opacity-75 transition-opacity'}`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <Image
                        src={image.imageData}
                        alt={`Product ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Category */}
              <div className="text-sm">
                <span className="text-gray-500">Category: </span>
                <span className="text-indigo-600">{product.category?.name}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Price Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                  {product.oldPrice && (
                    <>
                      <p className="text-xl text-gray-500 line-through">
                        ${product.oldPrice.toFixed(2)}
                      </p>
                      <span className="bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full">
                        {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stock Status with improved visibility */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                {product.stock > 0 ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-green-700 font-medium">
                      In Stock ({product.stock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-red-700 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>

              {/* Modified Add to Cart Button */}
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-colors
                  ${product.stock > 0 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-gray-200 cursor-not-allowed text-gray-500'}`}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
              </button>

              {/* Additional Details */}
              <div className="border-t pt-6 mt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">SKU</p>
                    <p className="font-medium">{product.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-medium">{product.category?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProductPage
