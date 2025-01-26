import { NextResponse } from 'next/server'
import prisma from '../../../lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    // Check if we need pagination
    if (searchParams.has('page')) {
      const page = parseInt(searchParams.get('page')) || 1
      const limit = parseInt(searchParams.get('limit')) || 10
      const skip = (page - 1) * limit

      // Get total count
      const total = await prisma.category.count()

      // Get paginated categories
      const categories = await prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      })

      return NextResponse.json({
        categories,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    } else {
      // If no pagination requested, return all categories
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      })
      return NextResponse.json(categories)
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error fetching categories' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const category = await prisma.category.create({
      data: {
        name: data.name,
      }
    })
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Error creating category' },
      { status: 500 }
    )
  }
}
