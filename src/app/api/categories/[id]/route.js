import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function DELETE(request, {params}) {
    try {
        const {id} = await params
        const category = await prisma.category.delete({
            where: {
            id: id,
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


  export async function PUT(request, {params}) {
    try {
        const {id} = await params
        const data = await request.json()

        const category = await prisma.category.update({
            where: {
                id: id
            },
            data: {
                name: data.name
            }
        }).catch(() => {
            throw new Error("Failed to update category.")
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