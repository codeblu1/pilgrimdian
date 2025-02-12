
import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.category.count();

    // Get paginated categories with product count
    const categories = await prisma.category.findMany({
      skip,
      take: limit,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to include product count
    const transformedCategories = categories.map(cat => ({
      ...cat,
      productsCount: cat._count.products
    }));

    // When no page parameter, return all categories (for select dropdowns)
    if (!searchParams.has('page')) {
      const allCategories = await prisma.category.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      return NextResponse.json(allCategories);
    }

    return NextResponse.json({
      categories: transformedCategories,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ 
      categories: [], 
      total: 0,
      page: 1,
      totalPages: 0
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const category = await prisma.category.create({
      data: {
        name: data.name,
      }
    });
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Error creating category' },
      { status: 500 }
    );
  }
}
