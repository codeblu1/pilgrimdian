import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { sendPaymentConfirmation, sendOrderConfirmation } from '../../../lib/nodemailer';

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
        
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: {
              select: {
                product: true,
                size: true,
                quantity: true,
                price: true,
                color: true,
                id: true
              }
            }
          }
        });

        await sendPaymentConfirmation({
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          totalPrice: payment.amount,
          paypalOrderId: payment.paypalOrderId
        });

        
        await sendOrderConfirmation({
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          totalPrice: order.totalPrice,
          items: order.items
        })
      }


      return payment;
    }, {
      timeout: 20000,
      maxWait: 10000
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
