import { NextResponse } from 'next/server'
import prisma from '../../../../lib/db'

export async function DELETE(request, {params}) {
    try {
      const {id} = await params
        const product = await prisma.product.update({
            where: {
                id: id,
            },
            data: {
                isActive: false
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error delete category:', error)
        return NextResponse.json(
            { error: 'Error delete category' },
            { status: 500 }
        )
    }
}

export async function GET(request, { params }) {
    try {
      const {id} = await params
        const product = await prisma.product.findUnique({
            where: {
                id: id,
                isActive: true
            },
            include: {
                category: true,
                images: {
                    orderBy: {
                        isMain: 'desc'
                    }
                }
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}