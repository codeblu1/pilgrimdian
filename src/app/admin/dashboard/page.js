'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
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
        const response = await fetch('/api/admin/dashboard', {cache: 'no-cache',});
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

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Orders Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Orders</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold">{stats.totalOrders}</div>
            <Link href="/admin/orders" className="ml-2 text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Low Stock Items</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold text-yellow-600">
              {stats.lowStock.length}
            </div>
            <Link href="/admin/products" className="ml-2 text-sm text-blue-600 hover:text-blue-800">
              View items
            </Link>
          </div>
        </div>

        {/* Unpaid Orders Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Unpaid Orders</div>
          <div className="mt-2 flex items-baseline">
            <div className="text-3xl font-semibold text-red-600">
              {stats.unpaidOrders}
            </div>
            <Link href="/admin/orders?status=unpaid" className="ml-2 text-sm text-blue-600 hover:text-blue-800">
              View orders
            </Link>
          </div>
        </div>
      </div>

      {/* Low Stock Items List */}
      {stats.lowStock.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Low Stock Alert</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.lowStock.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      Current stock: {item.stock} units
                    </div>
                  </div>
                  <Link
                    href={`/admin/products/${item.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Update stock
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
