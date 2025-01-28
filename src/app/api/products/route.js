import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit
    const categoryId = searchParams.get('categoryId')

    // Build filter conditions
    const where = {
      isActive: true,
      ...(categoryId ? { categoryId } : {})
    }

    // Get total count with filter
    const total = await prisma.product.count({ where })

    // Get paginated products with filter
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
        images: {
          orderBy: { isMain: 'desc' } // Main images first
        }
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
    
    // Create product with transaction to handle multiple images
    const product = await prisma.$transaction(async (tx) => {
      // Create the product first
      const newProduct = await tx.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          oldPrice: data.oldPrice ? parseFloat(data.oldPrice) : null, // Add this line
          stock: parseInt(data.stock),
          categoryId: data.categoryId,
          isActive: true, // Add this line
        },
      })

      // Create image records if images exist
      if (data.images && data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((base64Data, index) => ({
            productId: newProduct.id,
            imageData: `data:image/jpeg;base64,${base64Data}`,
            isMain: index === 0 // First image is main
          }))
        })
      }

      // Return product with images
      return tx.product.findUnique({
        where: { id: newProduct.id },
        include: { 
          images: true,
          category: true
        }
      })
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

export async function PUT(req) {
  try {
    const body = await req.json();
    const product = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        oldPrice: body.oldPrice ? parseFloat(body.oldPrice) : null, // Add this line
        stock: parseInt(body.stock),
        categoryId: body.categoryId,
        // ...existing image handling...
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
