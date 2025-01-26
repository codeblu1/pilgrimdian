'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ThankYouPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-8 h-8 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-6">Your order has been successfully placed</p>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="block w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
