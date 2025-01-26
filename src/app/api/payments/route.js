import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function POST(request) {
  try {
    const {
      orderId,
      paypalOrderId,
      paypalPayerId,
      status,
      amount,
      currency
    } = await request.json();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    if (!amount || isNaN(amount)) {
      throw new Error('Valid amount is required');
    }

    // Create payment record and update order status in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const payment = await prisma.payment.create({
        data: {
          order: {
            connect: { id: orderId }
          },
          paypalOrderId: paypalOrderId || 'manual',
          paypalPayerId: paypalPayerId || null,
          status: status || 'FAILED',
          amount: parseFloat(amount),
          currency: currency || 'USD',
          paymentDate: new Date()
        }
      });

      if (status === 'COMPLETED') {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' }
        });
      }

      return payment;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating payment record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    );
  }
}
