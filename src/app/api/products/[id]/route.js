import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function DELETE(request, {params}) {
    try {
      const {id} = await params
        const product = await prisma.product.update({
            where: {
                id: id,
            },
            data: {
                isActive: false
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error delete category:', error)
        return NextResponse.json(
            { error: 'Error delete category' },
            { status: 500 }
        )
    }
}

export async function GET(request, { params }) {
    try {
      const {id} = await params
        const product = await prisma.product.findUnique({
            where: {
                id: id,
                isActive: true
            },
            include: {
                category: true,
                images: {
                    orderBy: {
                        isMain: 'desc'
                    }
                }
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();

    // Use transaction to handle both product update and images
    const product = await prisma.$transaction(async (tx) => {
      // Update product details
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          oldPrice: data.oldPrice ? parseFloat(data.oldPrice) : null,
          stock: parseInt(data.stock),
          categoryId: data.categoryId,
        },
      });

      // Handle images if new ones are provided
      if (data.images && data.images.length > 0) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { productId: id }
        });

        // Create new images
        await tx.productImage.createMany({
          data: data.images.map((base64Data, index) => ({
            productId: id,
            imageData: `data:image/jpeg;base64,${base64Data}`,
            isMain: index === 0
          }))
        });
      }

      // Return updated product with images
      return tx.product.findUnique({
        where: { id },
        include: {
          images: true,
          category: true
        }
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}