import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET() {
  try {
    const cost = await prisma.shippingCost.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json({ fixedCost: cost?.cost || 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipping cost' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { fixedCost } = await request.json();
    const cost = await prisma.shippingCost.create({
      data: {
        cost: fixedCost
      }
    });
    
    return NextResponse.json(cost);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save shipping cost' }, { status: 500 });
  }
}
