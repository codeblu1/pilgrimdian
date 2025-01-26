import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    // Get total count
    const total = await prisma.order.count({
      where: {
        NOT: {
          status: "PENDING"
        }
      },
    })

    // Get paginated orders
    const orders = await prisma.order.findMany({
      where: {
        NOT: {
          status: "PENDING"
        }
      },
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
    const body = await request.json()
    const { customerName, customerEmail, customerPhone, address, totalPrice, items } = body

    // Verify all products exist with clean IDs
    const productIds = items.map(item => item.productId);
    console.log('Checking products with IDs:', productIds);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { 
          error: 'One or more products not found',
          missingProducts: missingIds
        },
        { status: 400 }
      );
    }

    // Create order with size and color from cart items
    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        address,
        totalPrice: parseFloat(totalPrice),
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            size: item.size,
            color: item.color,
            product: {
              connect: {
                id: item.productId
              }
            }
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}
