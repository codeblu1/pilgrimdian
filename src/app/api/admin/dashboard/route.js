import { NextResponse } from 'next/server';
import prisma from '../../../../lib/db';

export async function GET() {
  try {
    const [totalOrders, totalRevenue, lowStock, unpaidOrders] = await Promise.all([
      // Get total orders
      prisma.order.count(),
      
      // Get total revenue from paid orders
      prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { totalPrice: true }
      }),
      
      // Get products with low stock (less than 10)
      prisma.product.findMany({
        where: { stock: { lt: 10 } },
        select: {
          id: true,
          name: true,
          stock: true
        }
      }),
      
      // Get count of unpaid orders
      prisma.order.count({
        where: { status: 'PENDING' }
      })
    ]);

    return NextResponse.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      lowStock,
      unpaidOrders
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
