import { NextRequest, NextResponse } from 'next/server';
import * as productService from '@/lib/db/products';
import { CreateProductSchema, UpdateProductSchema } from '@/lib/validators';

/**
 * GET /api/products - Obtiene todos los productos
 * Query params: ?active=true para solo activos
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const onlyActive = searchParams.get('active') === 'true';
    
    const products = onlyActive
      ? await productService.getActiveProducts()
      : await productService.getAllProducts();
    
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products - Crea un nuevo producto
 */
export async function POST(request: NextRequest) {
  try {
    // Validar tamaño del body
    const { validatePayloadSize } = await import('@/lib/security');
    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText, 10240)) { // 10 KB máximo
      return NextResponse.json(
        { success: false, error: 'Payload demasiado grande' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
    const validatedData = CreateProductSchema.parse(body);
    
    const product = await productService.createProduct(validatedData);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('slug ya existe')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}

