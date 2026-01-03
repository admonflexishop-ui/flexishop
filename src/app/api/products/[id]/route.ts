import { NextRequest, NextResponse } from 'next/server';
import * as productService from '@/lib/db/products';
import { UpdateProductSchema } from '@/lib/validators';

/**
 * GET /api/products/[id] - Obtiene un producto por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await productService.getProductById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id] - Actualiza un producto
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = UpdateProductSchema.parse(body);
    
    const product = await productService.updateProduct(params.id, validatedData);
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('no encontrado') || error.message?.includes('no existe')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message?.includes('slug ya existe')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id] - Elimina un producto
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await productService.deleteProduct(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}

