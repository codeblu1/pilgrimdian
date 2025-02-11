'use client'
import { useState, useEffect } from 'react'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [itemsPerPage] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL') // Add this state

  useEffect(() => {
    fetchOrders()
  }, [currentPage]) // Add currentPage as dependency

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?page=${currentPage}&limit=${itemsPerPage}`, {cache: 'no-cache',})
      const data = await response.json()
      setOrders(data.orders || [])
      setTotalPages(Math.ceil(data.total / itemsPerPage))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const renderPaginationButtons = () => {
    if (!totalPages || totalPages <= 0) return null;
    
    const buttons = [];
    const maxButtons = Math.min(totalPages, 5); // Show max 5 buttons
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded ${
            currentPage === i 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        cache: 'no-cache',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        alert('Order status updated successfully')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      SHIPPED: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const handlePrintInvoice = (order) => {
    setSelectedOrder(order)
    setShowInvoice(true)
  }

  const printInvoice = () => {
    const printContent = document.getElementById('invoice-content')
    const originalContents = document.body.innerHTML

    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContents
    setShowInvoice(false)
  }

  // Add filter function
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'PAID') return order.status === 'PAID'
    if (activeTab === 'UNPAID') return order.status === 'PENDING'
    return true // Show all for 'ALL' tab
  })

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

      {/* Add Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-4">
          {['ALL', 'PAID', 'UNPAID'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 text-sm font-medium -mb-px
                ${activeTab === tab 
                  ? 'border-b-2 border-indigo-500 text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab} ({orders.filter(order => {
                if (tab === 'PAID') return order.status === 'PAID'
                if (tab === 'UNPAID') return order.status === 'PENDING'
                return true
              }).length})
            </button>
          ))}
        </nav>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                  <div className="text-sm text-gray-500">{order.customerEmail}</div>
                  {order.customerPhone && (
                    <div className="text-sm text-gray-500">{order.customerPhone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${order.totalPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handlePrintInvoice(order)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Print Invoice
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    {order.status === 'PAID' && (
                      <select
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        defaultValue={order.status}
                      >
                        <option value="PAID">PAID</option>
                        <option value="SHIPPED">SHIPPED</option>
                      </select>
                    )}
                    {order.status === 'SHIPPED' && (
                      <select
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        defaultValue={order.status}
                      >
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    )}
                    {/* Remove delete button */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add empty state */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No {activeTab.toLowerCase()} orders found
            </p>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-3xl relative">
            <div id="invoice-content" className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold">DELIVERY NOTE</h2>
                  <p className="text-gray-600">Order #{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Order Date:</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-gray-700 uppercase mb-2">From:</h3>
                  <div className="text-gray-600">
                    <p className="font-semibold">PILGRIMDIAN</p>
                    <p>Jalan jati hegar blok d2</p>
                    <p>Bandung, Jawa Barat</p>
                    <p>Indonesia</p>
                    <p>Phone: +62 82216117759</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-700 uppercase mb-2">Ship To:</h3>
                  <div className="text-gray-600">
                    <p className="font-semibold">{selectedOrder.customerName}</p>
                    <p className="whitespace-pre-line">{selectedOrder.address}</p>
                    <p>Phone: {selectedOrder.customerPhone}</p>
                    <p>Email: {selectedOrder.customerEmail}</p>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Order Status:</span>
                  <span className={`px-4 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left font-semibold">Product Name</th>
                      <th className="py-3 px-4 text-center font-semibold">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{item.product.name}</span>
                          </div>
                        </td>
                      <td className="py-4 px-4 text-center">
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 mt-6">
              <div className="text-sm text-gray-500">
                <p className="font-semibold mb-2">Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This is a delivery note, not a tax invoice</li>
                  <li>Please check the items upon receipt</li>
                  <li>Keep this document for future reference</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setShowInvoice(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Close
            </button>
            <button
              onClick={printInvoice}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Pagination */}
    <div className="mt-4">
      {totalPages > 0 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          {renderPaginationButtons()}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  </div>
)
}
