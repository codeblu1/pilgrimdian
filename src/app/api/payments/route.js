import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { sendPaymentConfirmation,sendOrderConfirmation } from '../../../lib/nodemailer';

export async function POST(request) {
  try {
    const { orderId, paypalOrderId, paypalPayerId, status, amount, currency } = await request.json();

    // Validate required orderId
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const orderExists = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!orderExists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create payment record and update order status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          order: { connect: { id: orderId } },
          paypalOrderId: paypalOrderId || 'manual',
          paypalPayerId: paypalPayerId || null,
          status: status || 'FAILED',
          amount: parseFloat(amount),
          currency: currency || 'USD',
          paymentDate: new Date()
        }
      });

      if (status === 'COMPLETED') {
        // 1. Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'PAID' }
        });
        
        // 2. Get order with items to reduce stock
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            items: {
              include: {
                product: true // Include product to check stock
              }
            }
          }
        });

        // 3. Reduce stock for each item
        for (const item of order.items) {
          // Check if there's enough stock
          if (item.product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${item.product.name}`);
          }

          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }

        // 4. Send email notifications
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
        });
      }

      return payment;
    }, {
      maxWait: 20000,
      timeout: 30000
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { orderId, status } = await req.json();

    // Validate required orderId
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const orderExists = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!orderExists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Use transaction to update payment and reduce stock
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update payment status
      const payment = await tx.payment.update({
        where: { orderId },
        data: { status },
        include: {
          order: {
            include: {
              items: true
            }
          }
        }
      });

      // 2. If payment is completed/paid, update order status and reduce stock
      if (status === 'COMPLETED') {
        // Update order status to PAID
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'PAID' }
        });

        // Reduce stock for each item in the order
        for (const item of payment.order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      return payment;
    }, {
      maxWait: 50000,
      timeout: 60000
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}
