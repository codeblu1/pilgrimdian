import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function DELETE(request, {params}) {
    try {
        const {id} = await params
        const category = await prisma.product.update({
            where: {
            id: id,
            },
            data: {
                isActive: false
            }
        })

      return NextResponse.json(category)
    } catch (error) {
      console.error('Error delete category:', error)
      return NextResponse.json(
        { error: 'Error delete category' },
        { status: 500 }
      )
    }
  }