'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalButtons } from "@paypal/react-paypal-js";
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null); // Add order state
  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternativePhone: '',
    address: '',
    city: '',
    province: '',
    country: '',
    postalCode: '',
    notes: ''
  });
  const [shippingCost, setShippingCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    const fetchShippingCost = async () => {
      try {
        const response = await fetch('/api/shipping');
        if (!response.ok) throw new Error('Failed to fetch shipping');
        const data = await response.json();
        setShippingCost(data.fixedCost);
      } catch (error) {
        console.error('Error fetching shipping cost:', error);
      }
    };

    fetchShippingCost();
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = cartTotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the order to your backend
    console.log('Order details:', { shippingData, cart });
    alert('Order placed successfully!');
    localStorage.removeItem('cart');
    router.push('/');
  };

  const createOrder = async (data, actions) => {
    try {
      if (!shippingData.fullName || !shippingData.email || !cart.length) {
        alert('Please fill in all required fields');
        return null;
      }

      // Extract base product ID (remove size and color suffix)
      const cartItemsWithCleanIds = cart.map(item => {
        const [baseId] = item.id.split('-'); // Split ID at first hyphen
        return {
          productId: baseId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color
        };
      });

      // Create order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: shippingData.fullName,
          customerEmail: shippingData.email,
          customerPhone: shippingData.phone,
          address: `${shippingData.address}, ${shippingData.city}, ${shippingData.province}, ${shippingData.country}, ${shippingData.postalCode}`,
          totalPrice: total,
          items: cartItemsWithCleanIds
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await response.json();
      console.log('Order created:', orderData);

      if (!orderData.id) {
        throw new Error('Invalid order response');
      }

      setOrder(orderData);

      // Create PayPal order
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total.toFixed(2)
          }
        }]
      });
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
      return null;
    }
  };

  const onApprove = async (data, actions) => {
    try {
      if (!order?.id) {
        throw new Error('No order reference found');
      }

      const details = await actions.order.capture();
      console.log('Payment captured:', details);

      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          paypalOrderId: data.orderID,
          paypalPayerId: details.payer.payer_id,
          status: 'COMPLETED',
          amount: parseFloat(details.purchase_units[0].amount.value),
          currency: 'USD'
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to process payment');
      }

      localStorage.removeItem('cart');
      router.push('/thank-you');
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Payment failed. Please try again.');
    }
  };

  const onError = async (err) => {
    // Record error in payment
    if (order) {
      await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          status: 'FAILED',
          amount: order.totalPrice,
          currency: 'USD'
        })
      })
    }

    console.error('PayPal error:', err)
    alert('There was an error processing your payment. Please try again.')
  }

  const renderPaymentButton = () => (
    <div className="space-y-4">
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        style={{ layout: "vertical" }}
      />
      <p className="text-sm text-gray-500 text-center">
        Secure payment processed by PayPal
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-800">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Shipping Form */}
          <div className="lg:w-2/3">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">Checkout Information</h2>
                <p className="text-sm text-gray-500 mt-1">Please fill in all required fields (*)</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name*
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={shippingData.fullName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={shippingData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={shippingData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alternative Phone
                      </label>
                      <input
                        type="tel"
                        name="alternativePhone"
                        value={shippingData.alternativePhone}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address*
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={shippingData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      placeholder="123 Main St, Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country*
                      </label>
                      <select
                        name="country"
                        required
                        value={shippingData.country}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      >
                        <option value="">Select a country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        {/* Add more countries as needed */}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Province/State*
                      </label>
                      <input
                        type="text"
                        name="province"
                        required
                        value={shippingData.province}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City*
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={shippingData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code*
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={shippingData.postalCode}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      rows="3"
                      value={shippingData.notes}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      placeholder="Special delivery instructions, landmarks, etc."
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
                <p className="text-sm text-gray-500 mt-1">Review your order</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500">Size: {item.size}, Color: {item.color}</p>
                        <p className="text-sm text-gray-900 mt-1">
                          ${item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right text-gray-900 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium mb-6">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  {renderPaymentButton()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
