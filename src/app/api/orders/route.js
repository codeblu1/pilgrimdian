import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    // Get total count
    const total = await prisma.order.count()

    // Get paginated orders
    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        payment: true
      }
    })

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Validate all products exist first
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      }
    });

    // Check if all products were found
    const foundProductIds = products.map(p => p.id);
    const missingProducts = productIds.filter(id => !foundProductIds.includes(id));

    if (missingProducts.length > 0) {
      return NextResponse.json({
        error: 'One or more products not found',
        missingProducts
      }, { status: 400 });
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          address: data.address,
          totalPrice: data.totalPrice,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          items: true
        }
      });

      return newOrder;
    }, {
      maxWait: 50000,
      timeout: 60000
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
