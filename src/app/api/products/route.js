import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import prisma from '../../../lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit
    const categoryId = searchParams.get('categoryId')

    // Build filter conditions
    const where = categoryId ? { categoryId } : {}

    // Get total count with filter
    const total = await prisma.product.count({ where })

    // Get paginated products with filter
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({
      products: [],
      total: 0,
      page: 1,
      totalPages: 0
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Handle single image
    const image = data.image ? 
      `data:image/jpeg;base64,${data.image}` : 
      null;

    // Create product in database
    const product = await prisma.product.create({
      data: {
        ...data,
        image, // Single image field
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}
