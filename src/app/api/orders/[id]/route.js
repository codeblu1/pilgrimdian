import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { status } = await request.json();

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating order' },
      { status: 500 }
    );
  }
}

// Add GET handler if needed
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        payment: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Error fetching order' },
      { status: 500 }
    );
  }
}
