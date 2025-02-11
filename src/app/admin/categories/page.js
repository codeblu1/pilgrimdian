'use client'
import { useState, useEffect } from 'react'

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editName, setEditName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchCategories()
  }, [currentPage, itemsPerPage])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?page=${currentPage}&limit=${itemsPerPage}`, {
        cache: "no-cache"
      })
      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
        setTotalPages(Math.ceil(data.total / itemsPerPage))
      } else {
        // Handle case where data is direct array (for dropdowns)
        setCategories(Array.isArray(data) ? data : [])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      alert('Failed to fetch categories')
      setCategories([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/categories', {
        cache: 'no-cache',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })
      if (res.ok) {
        fetchCategories()
        setNewCategory('')
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setEditName(category.name)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editName.trim()) {
      alert('Category name cannot be empty')
      return
    }
    
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      })
      
      if (!res.ok) {
        throw new Error('Failed to update category')
      }
      
      await fetchCategories()
      setEditingCategory(null)
      setEditName('')
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Failed to update category')
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditName('')
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE', cache: 'no-cache', })
      // Refresh the list after deletion
      const response = await fetch(`/api/categories?page=${currentPage}&limit=${itemsPerPage}`, {cache: 'no-cache'})
      const data = await response.json()
      setCategories(data.categories)
      setTotalPages(Math.ceil(data.total / itemsPerPage))
      alert('Category deleted successfully')
    } catch (error) {
      alert('Failed to delete category')
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

  if (!categories) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>
      <div className="p-6">
        {/* Add Category Form */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Category Name"
              className="flex-1 border rounded p-2"
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add Category
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Products</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {category.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      {editingCategory?.id === category.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border rounded px-2 py-1 text-sm w-full"
                          autoFocus
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {category.productsCount || 0} products
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {editingCategory?.id === category.id ? (
                          <>
                            <button 
                              onClick={handleUpdate}
                              className="px-3 py-1 text-sm bg-green-100 text-green-600 rounded hover:bg-green-200"
                            >
                              Save
                            </button>
                            <button 
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEdit(category)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(category.id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No categories found. Add your first category above.
            </div>
          )}
        </div>

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
    </>
  );
}
