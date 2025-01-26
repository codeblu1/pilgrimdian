'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    lowStock: [],
    unpaidOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Orders</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold">{isLoading ? '...' : stats.totalOrders}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Revenue</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold">
              ${isLoading ? '...' : stats.totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Low Stock Items</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold text-yellow-600">
              {isLoading ? '...' : stats.lowStock.length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Unpaid Orders</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold text-red-600">
              {isLoading ? '...' : stats.unpaidOrders}
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/products" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <p className="text-gray-600">Manage your products inventory</p>
        </Link>

        <Link href="/admin/categories"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <p className="text-gray-600">Manage product categories</p>
        </Link>

        <Link href="/admin/orders"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p className="text-gray-600">View and manage orders</p>
        </Link>
      </div>
    </div>
  )
}
