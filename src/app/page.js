'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';  // Change this line

export default function Home() {
  // Move router initialization to the top
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Add a safety check before mapping
  if (!Array.isArray(categories)) {
    return null; // or some loading state
  }

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = selectedCategory ? 
          `/api/products?categoryId=${selectedCategory}` : 
          '/api/products';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products || []); // Extract products array from response
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setProducts([]); // Set empty array on error
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Add safety check
  if (!Array.isArray(products)) {
    return <div>Loading...</div>;
  }

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Cart functions
  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const handleColorSelect = (productId, color) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: color
    }));
  };

  const addToCart = (product) => {
    const selectedSize = selectedSizes[product.id];
    const selectedColor = selectedColors[product.id];

    if (!selectedSize || !selectedColor) {
      alert('Please select both size and color');
      return;
    }
    
    const cartItem = {
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image, // Changed from product.images[0] to product.image
      size: selectedSize,
      color: selectedColor,
      quantity: 1
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
      return [...prevCart, cartItem];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo and mobile menu */}
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-xl text-gray-800">Fashion Store</h1>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-md mx-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Right: Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}  // Change this to open cart instead of direct checkout
              className="relative p-2 rounded-lg hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu - stays below the main nav */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
            <div className="py-2">
              <h3 className="font-semibold text-sm text-gray-600 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-full text-sm
                      ${selectedCategory === category.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-800'}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 mb-4 border-b pb-4">
                    <div className="relative w-20 h-20">
                      {item.image && (  // Add condition to check if image exists
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">Size: {item.size}, Color: {item.color}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 border rounded"
                        >-</button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 border rounded"
                        >+</button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-red-500"
                        >Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-auto">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <div className="hidden md:block md:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`cursor-pointer hover:text-indigo-600 px-2 py-1 rounded
                      ${category.id === selectedCategory ? 'bg-indigo-50 text-indigo-600' : ''}`}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Product Grid */}
          <div className="md:w-3/4 w-full">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative aspect-[3/4] w-full">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        // Fallback image or placeholder
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-lg">{product.name}</h3>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">${product.price}</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                        {product.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => handleSizeSelect(product.id, size)}
                            className={`px-1.5 py-0.5 sm:px-2 sm:py-1 border rounded-md text-xs sm:text-sm
                              ${selectedSizes[product.id] === size ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1 sm:gap-2 mb-2 sm:mb-3">
                        {product.colors.map(color => (
                          <div
                            key={color}
                            onClick={() => handleColorSelect(product.id, color)}
                            className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border cursor-pointer
                              ${selectedColors[product.id] === color ? 'ring-2 ring-indigo-600 ring-offset-2' : ''}`}
                            style={{
                              backgroundColor: color.toLowerCase(),
                              border: color.toLowerCase() === 'white' ? '1px solid #e5e7eb' : 'none'
                            }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-1 sm:mt-2 w-full bg-indigo-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 text-sm sm:text-base"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
