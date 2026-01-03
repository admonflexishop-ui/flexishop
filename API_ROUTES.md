# API Routes Documentation

## Usuarios (`/api/users`)

### GET /api/users
Obtiene todos los usuarios.

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### POST /api/users
Crea un nuevo usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "name": "Nombre Usuario",
  "role": "admin" | "editor",
  "is_active": 1
}
```

### GET /api/users/[id]
Obtiene un usuario por ID.

### PUT /api/users/[id]
Actualiza un usuario.

**Body:**
```json
{
  "email": "newemail@example.com",
  "name": "Nuevo Nombre",
  "role": "admin",
  "is_active": 1
}
```

### DELETE /api/users/[id]
Elimina un usuario.

### GET /api/users/email/[email]
Obtiene un usuario por email.

---

## Sucursales (`/api/branches`)

### GET /api/branches
Obtiene todas las sucursales.

**Query params:**
- `?active=true` - Solo sucursales activas

### POST /api/branches
Crea una nueva sucursal.

**Body:**
```json
{
  "name": "Sucursal Centro",
  "address": "Calle Principal 123",
  "phone": "+52 555 123 4567",
  "whatsapp": "+52 555 123 4567",
  "is_active": 1
}
```

### GET /api/branches/[id]
Obtiene una sucursal por ID.

### PUT /api/branches/[id]
Actualiza una sucursal.

### DELETE /api/branches/[id]
Elimina una sucursal.

---

## Productos (`/api/products`)

### GET /api/products
Obtiene todos los productos.

**Query params:**
- `?active=true` - Solo productos activos

### POST /api/products
Crea un nuevo producto.

**Body:**
```json
{
  "name": "Producto Ejemplo",
  "slug": "producto-ejemplo",
  "description": "Descripción del producto",
  "sku": "SKU123",
  "price_cents": 9999,
  "compare_at_cents": 12999,
  "currency": "MXN",
  "stock": 100,
  "is_active": 1
}
```

### GET /api/products/[id]
Obtiene un producto por ID.

### PUT /api/products/[id]
Actualiza un producto.

### DELETE /api/products/[id]
Elimina un producto.

### GET /api/products/slug/[slug]
Obtiene un producto por slug.

---

## Imágenes de Productos (`/api/products/[id]/image`)

### GET /api/products/[id]/image
Obtiene la imagen de un producto (retorna PNG).

**Response:** Binary PNG data

### POST /api/products/[id]/image
Sube o actualiza la imagen de un producto.

**Body:** FormData con campo `file` (PNG, máximo 500 KB)

### DELETE /api/products/[id]/image
Elimina la imagen de un producto.

---

## Configuración (`/api/settings`)

### GET /api/settings
Obtiene la configuración de la tienda.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "store_name": "FlexiShop",
    "default_whatsapp": "+52 555 123 4567",
    "currency": "MXN",
    "accent_color": "#000000",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### PUT /api/settings
Actualiza la configuración.

**Body:**
```json
{
  "store_name": "Mi Tienda",
  "default_whatsapp": "+52 555 123 4567",
  "currency": "MXN",
  "accent_color": "#FF5733"
}
```

---

## Notas

- Todos los endpoints retornan `{ success: boolean, data?: any, error?: string }`
- Los errores de validación incluyen `details` con información de Zod
- Las fechas se manejan como strings ISO (datetime)
- Los precios están en centavos (price_cents)
- Las imágenes deben ser PNG y máximo 500 KB

