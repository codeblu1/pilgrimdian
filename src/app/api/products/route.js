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
    const formData = await request.formData()
    const images = formData.getAll('images')
    
    const uploadedImages = []
    
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public/uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err
      }
    }
    
    // Handle image uploads
    for (const image of images) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create unique filename
      const filename = `${Date.now()}-${image.name}`
      const path = join(uploadDir, filename)
      
      await writeFile(path, buffer)
      uploadedImages.push(`/uploads/${filename}`)
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        categoryId: formData.get('categoryId'),
        images: uploadedImages,
        sizes: JSON.parse(formData.get('sizes')),
        colors: JSON.parse(formData.get('colors')),
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
