'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import Image from 'next/image'

export default function ThankYouPage() {
  const router = useRouter()

  // Add confetti effect on mount
  useEffect(() => {
    const confetti = () => {
      const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
      for (let i = 0; i < 100; i++) {
        createConfetti(colors[Math.floor(Math.random() * colors.length)]);
      }
    };

    const createConfetti = (color) => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = color;
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
      confetti.style.opacity = Math.random();
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    };

    confetti();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="Store Logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </div>

      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-lg text-center relative overflow-hidden">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-10 h-10 text-green-500" 
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

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. We'll send you a confirmation email shortly.
        </p>

        {/* Order Status Steps */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 w-1/3 h-1 bg-green-500 -translate-y-1/2"></div>
          {['Order Placed', 'Processing', 'Shipping Soon'].map((step, index) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                index === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <span className="mt-2 text-xs text-gray-600">{step}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Continue Shopping
          </button>
        </div>
      </div>

      {/* Add confetti animation styles */}
      <style jsx global>{`
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          animation: fall linear forwards;
        }
        
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
